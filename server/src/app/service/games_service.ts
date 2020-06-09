import * as bytes from 'bytes';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import * as ms from 'pretty-ms';
import { Subject } from 'rxjs';
import { ErrorCode } from '../../api/api_error';
import { GameStatus } from '../../api/game_status';
import { PlayerType } from '../../api/player_type';
import { assert } from '../../core/assert';
import { asyncDelay } from '../../core/async_delay';
import { bindClass } from '../../core/bind_class';
import { createGameError } from '../../core/create_game_error';
import { Logecom } from '../../core/logecom/logecom';
import { OnApplicationInit } from '../../core/on_application_init';
import { serialization } from '../../core/serialization';
import { Agent } from '../../model/agent';
import { Side } from '../../model/agent_side';
import { GameEvent } from '../../model/game_log_item';
import { GameModel } from '../../model/game_model';
import { GameMove } from '../../model/game_move';
import { appRoot } from '../../root';
import { DictionariesService } from './dictionaries_service';
import extract = serialization.extract;

type JSONStringifyReplacer = (this: any, key: string, value: any) => any;
type Serialized<T, K extends keyof T> = {
    [prop in K]: string
}
type GameId = string;
const t_1hour = 1000 * 60 * 60;

/**
 * Manages games lifecycle
 */
export class GamesService implements OnApplicationInit {
    totalGamesPlayed = 0;

    readonly gameEvents$ = new Subject<{ game: GameModel, event: GameEvent }>();
    readonly gamesChain$ = new Subject<{ prevGameId: string, nextGameId: string }>();

    private readonly dataDir = path.join(appRoot, '../data');
    private readonly lastGamesFile = path.join(this.dataDir, 'games.json');
    private readonly logger = Logecom.createLogger(this.constructor.name);

    private games = new Map<GameId, GameModel>();

    constructor(private dictionariesService: DictionariesService) {
        bindClass(this);
    }

    async init() {
        process.on('SIGINT', this.storeGames);
        process.on('SIGTERM', this.storeGames);

        this.loadGames();
        this.beginOldGamesRemovingCycle(t_1hour);
    }

    async createNewGame(dictionaryId: number = 0, prevGameId?: string): Promise<GameId> {
        const dictionary = this.dictionariesService.dictionaries[dictionaryId];
        assert.found(dictionary, createGameError(ErrorCode.DictionaryNotFound));

        // look if new game has been already created by somebody
        if (prevGameId) {
            const prevGame = this.games.get(prevGameId);
            if (prevGame && prevGame != prevGame.getActiveGame())
                return prevGame.getActiveGame().id;
        }

        const newGame = new GameModel();
        newGame.init(dictionary.getRandomWords(newGame.boardSize));
        this.games.set(newGame.id, newGame);

        if (prevGameId) {
            const prevGame = this.games.get(prevGameId);
            if (prevGame) {
                newGame.rootGame = prevGame.getMainGame();
                newGame.rootGame.lastGame = newGame;
                newGame.gameInChain = prevGame.gameInChain + 1;
                this.gamesChain$.next({ prevGameId: prevGame.id, nextGameId: newGame.id });
            }
        }

        return newGame.id;
    }

    async getGameStatus(gameId: GameId, playerType: PlayerType): Promise<GameStatus> {
        let game = this.games.get(gameId);
        assert.found(game, createGameError(ErrorCode.GameNotFound));
        game = game.getActiveGame();

        let board: Agent[];
        if (playerType == PlayerType.Spymaster) {
            board = game.board.map(card => <Agent> {
                name: card.name,
                side: card.side,
                uncovered: card.uncovered
            });
        }
        else {
            board = game.board.map(card => <Agent> {
                name: card.name,
                side: card.uncovered ? card.side : Side.UNKNOWN
            });
        }

        return {
            id: game.id,
            redLeft: game.redLeft,
            blueLeft: game.blueLeft,
            move: game.move,
            isFinished: game.isFinished,
            gameInChain: game.gameInChain,
            log: game.events,
            board
        };
    }

    async uncoverAgent(gameId: string, agentIndex: number): Promise<Agent> {
        const game = this.games.get(gameId);
        assert.found(game, createGameError(ErrorCode.GameNotFound));
        assert.found(game.board[agentIndex], createGameError(ErrorCode.AgentNotFound));

        const eventsBefore = game.events.length;
        const agent = game.uncoverAgent(agentIndex);
        assert.value(agent, createGameError(ErrorCode.UncoverNotAllowed));

        for (let i = eventsBefore; i < game.events.length; i++)
            this.gameEvents$.next({ game, event: game.events[i] });

        if (game.isFinished)
            this.totalGamesPlayed += 1;

        return agent;
    }

    async commitCode(gameId: string, message: string): Promise<GameMove> {
        const game = this.games.get(gameId);
        assert.found(game, createGameError(ErrorCode.GameNotFound));

        const [hint, count_s] = message.trim().split(/[\s,;]+/);
        const count = Number(count_s);
        assert.value(hint != '', createGameError(ErrorCode.WrongSpymasterHint));
        assert.range(count, [0, (game.boardSize - 1) / 3 + 1], 'Invalid code word match count');

        const move = game.commitHint(hint, count);
        assert.value(move, createGameError(ErrorCode.GameIsFinished));

        this.gameEvents$.next({ game, event: game.events[game.events.length - 1] });
        return move;
    }

    /**
     * Game is treated as "old" if it hasn't been modified longer
     * than "intervalMs". If game is part of game chain, all of games
     * in chain have to be "untouched" during "intervalMs", otherwise
     * the whole chain is marked as "active" and remains in memory.
     *
     * This is done because in real any player can join the game
     * by link to any of chained games, so they must exist the whole time.
     *
     * @param {number} intervalMs
     * @returns {Promise<void>}
     */
    private async beginOldGamesRemovingCycle(intervalMs: number) {
        const perf_t = performance.now();
        const now = Date.now();
        const gamesRemoved = 0;

        for (const [gameId, game] of this.games) {
            if (now - game.getActiveGame().lastModified.getTime() > intervalMs)
                this.games.delete(gameId);
        }

        const memUsage = bytes(process.memoryUsage().heapUsed);
        this.logger.log(`Cleanup [games_removed: ${gamesRemoved}, duration: ${ms(performance.now() - perf_t)}, mem_usage: ${memUsage}]`);

        await asyncDelay(intervalMs);
        this.beginOldGamesRemovingCycle(intervalMs);
    }

    private storeGames() {
        this.logger.warn(`Storing games state: ${this.games.size} games -> ${this.lastGamesFile}`);
        try {
            const gamesList = [...this.games.values()];
            const replacer = (key: keyof GameModel, value: GameModel) =>
                key == 'lastGame' || key == 'rootGame' && value ? value.id : value;
            const jsonString = JSON.stringify(gamesList, replacer as JSONStringifyReplacer);
            fs.writeFileSync(this.lastGamesFile, jsonString);
        }
        catch (e) {
            this.logger.error('Unable to store games data', e);
        }
        process.exit();
    }

    private loadGames() {
        this.logger.warn(`Looking for games to restore in ${this.lastGamesFile}`);
        if (!fs.existsSync(this.lastGamesFile))
            return;

        try {
            const jsonString = fs.readFileSync(this.lastGamesFile).toString('utf8');
            const gamesData = <Serialized<GameModel, 'lastGame' | 'rootGame' | 'id'>[]> JSON.parse(jsonString);

            for (const gameObj of gamesData)
                this.games.set(gameObj.id, extract(new GameModel(), gameObj));

            for (const gameObj of gamesData) {
                const gameModel = this.games.get(gameObj.id);
                const rootGame = this.games.get(gameObj.rootGame);
                const lastGame = this.games.get(gameObj.lastGame);

                if (gameModel && rootGame)
                    gameModel.rootGame = rootGame;

                if (gameModel && lastGame)
                    gameModel.lastGame = lastGame;
            }

            this.logger.warn(`Restored ${this.games.size} game(s)`);
        }
        catch (e) {
            this.logger.warn('Unable to restore games data', e);
        }
    }
}
