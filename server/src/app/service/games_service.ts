import * as bytes from 'bytes';
import * as path from 'path';
import { performance } from 'perf_hooks';
import * as ms from 'pretty-ms';
import { Subject } from 'rxjs';
import { DictionaryDescription } from '../../api/dictionary_description';
import { GameStatus } from '../../api/game_status';
import { PlayerType } from '../../api/player_type';
import { assert } from '../../core/assert';
import { asyncDelay } from '../../core/async_delay';
import { bindClass } from '../../core/bind_class';
import { Logecom } from '../../core/logecom/logecom';
import { OnApplicationInit } from '../../core/on_application_init';
import { serialization } from '../../core/serialization';
import { Agent } from '../../model/agent';
import { Side } from '../../model/agent_side';
import { Dictionary } from '../../model/dictionary';
import { GameEvent } from '../../model/game_log_item';
import { GameModel } from '../../model/game_model';
import { GameMove } from '../../model/game_move';
import * as fs from 'fs';
import { LocalDictionaryImpl } from '../../model/local_dictionary_impl';
import extract = serialization.extract;

export type GameId = string;
const t_1hour = 1000 * 60 * 60;

/**
 * Manages games lifecycle
 */
export class GamesService implements OnApplicationInit {
    totalGamesPlayed = 0;

    readonly gameEvents$ = new Subject<{ game: GameModel, event: GameEvent }>();
    readonly gamesChain$ = new Subject<{ prevGameId: string, nextGameId: string }>();

    private readonly logger = Logecom.createLogger(GamesService.name);
    private readonly dictionaries: Dictionary[] = [];
    private games = new Map<GameId, GameModel>();

    constructor() {
        bindClass(this);
    }

    async init() {
        process.on('SIGINT', this.storeGames);
        process.on('SIGTERM', this.storeGames);

        this.loadDictionaries();
        this.loadGames();
        this.beginOldGamesRemovingCycle(t_1hour);
    }

    getDictionaries() {
        return this.dictionaries.map(dic => <DictionaryDescription> {
            name: dic.name,
            description: dic.description,
            warning: dic.warning,
            words_example: dic.getRandomWords(5)
        });
    }

    async createNewGame(dictionaryId: number = 0, prevGameId?: string) {
        const dictionary = this.dictionaries[dictionaryId];
        assert.found(dictionary, `Dictionary "${dictionaryId}" not found`);

        // look if new game has been already created by somebody
        if (prevGameId) {
            const prevGame = this.games.get(prevGameId);

            if (prevGame && prevGame.nextGame) {
                let newGame: GameModel | undefined = prevGame;

                // find the newest game in chain
                while (newGame && newGame.nextGame)
                    newGame = newGame.nextGame;

                if (newGame && newGame.id != prevGame.id)
                    return newGame.id;
            }
        }

        const newGame = new GameModel();
        newGame.init(dictionary.getRandomWords(newGame.boardSize));
        this.games.set(newGame.id, newGame);

        if (prevGameId) {
            const prevGame = this.games.get(prevGameId);

            if (prevGame) {
                prevGame.nextGame = newGame;
                newGame.prevGame = prevGame;
                newGame.gameInChain = prevGame.gameInChain + 1;
                this.gamesChain$.next({ prevGameId: prevGame.id, nextGameId: newGame.id });
            }
        }

        return newGame.id;
    }

    async getGameStatus(gameId: GameId, playerType: PlayerType): Promise<GameStatus> {
        let game = this.games.get(gameId);
        while (game && game.nextGame)
            game = game.nextGame;

        assert.found(game, 'Game not found.');
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
            nextGameId: game.getNextGameId(),
            gameInChain: game.gameInChain,
            log: game.events,
            board
        };
    }

    async uncoverAgent(gameId: string, agentIndex: number): Promise<Agent> {
        const game = this.games.get(gameId);
        assert.found(game, 'Game not found.');
        assert.found(game.board[agentIndex], 'Agent not found.');

        const eventsBefore = game.events.length;
        const agent = game.uncoverAgent(agentIndex);
        assert.value(agent, 'Agent is already uncovered or game or move is finished or not yet inited.');

        for (let i = eventsBefore; i < game.events.length; i++)
            this.gameEvents$.next({ game, event: game.events[i] });

        if (game.isFinished)
            this.totalGamesPlayed += 1;

        return agent;
    }

    async commitCode(gameId: string, message: string): Promise<GameMove> {
        const game = this.games.get(gameId);
        assert.found(game, 'Game not found.');

        const [hint, count_s] = message.trim().split(/[\s,;]+/);
        const count = Number(count_s);
        assert.value(hint != '', 'Invalid code word.');
        assert.range(count, [0, (game.boardSize - 1) / 3 + 1], 'Invalid code word match count.');

        const move = game.commitHint(hint, count);
        assert.value(move, 'Game is finished.');

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
        const activeGames = new Map<GameId, GameModel>();
        const oldGames = new Map<GameId, GameModel>();

        for (const [gameId, game] of this.games) {
            if (activeGames.has(gameId) || oldGames.has(gameId))
                continue;

            let linkedGame: GameModel | undefined;
            if (now - game.lastModified.getTime() < intervalMs) {
                activeGames.set(game.id, game);

                linkedGame = game;
                while (linkedGame.nextGame) {
                    linkedGame = linkedGame.nextGame;
                    activeGames.set(linkedGame.id, linkedGame);
                }

                linkedGame = game;
                while (linkedGame.prevGame) {
                    linkedGame = linkedGame.prevGame;
                    activeGames.set(linkedGame.id, linkedGame);
                }
            }
            else {
                const unknownChain: GameModel[] = [game];
                let isActive = false;

                linkedGame = game;
                while (linkedGame.nextGame) {
                    linkedGame = linkedGame.nextGame;
                    unknownChain.push(linkedGame);
                    isActive = isActive || now - linkedGame.lastModified.getTime() < intervalMs;
                }

                linkedGame = game;
                while (linkedGame.prevGame) {
                    linkedGame = linkedGame.prevGame;
                    unknownChain.push(linkedGame);
                    isActive = isActive || now - linkedGame.lastModified.getTime() < intervalMs;
                }

                isActive
                    ? unknownChain.forEach(game => activeGames.set(game.id, game))
                    : unknownChain.forEach(game => oldGames.set(game.id, game));
            }
        }

        const memUsage = bytes(process.memoryUsage().heapUsed);
        this.logger.log(`Cleanup [games: ${oldGames.size}, duration: ${ms(performance.now() - perf_t)}, mem_usage: ${memUsage}]`);
        this.games = activeGames;

        await asyncDelay(intervalMs);
        this.beginOldGamesRemovingCycle(intervalMs);
    }

    private loadDictionaries() {
        const dataDir = path.join(__dirname, '../../../data');
        const files = fs.readdirSync(dataDir).sort();
        this.logger.info('Loading dictionaries from ' + dataDir);

        if (files.length == 0)
            this.logger.error('No dictionaries found in ' + dataDir);

        for (const fileName of files) {
            const dict = new LocalDictionaryImpl(path.join(dataDir, fileName));
            this.dictionaries.push(dict);
            this.logger.info(`  - ${fileName}: ${dict.name} (${dict.dictionary.length})`);
        }
    }

    private storeGames() {
        this.logger.warn('Storing games state:', this.games.size, 'games -> games.json');
        try {
            const gamesList = [...this.games.values()];
            const jsonString = JSON.stringify(gamesList, (key, value) =>
                key == 'prevGame' || key == 'nextGame' && value
                    ? (value as GameModel).id
                    : value
            );
            fs.writeFileSync('games.json', jsonString);
        }
        catch (e) {
            this.logger.error('Unable to store games data', e);
        }
        process.exit();
    }

    private loadGames() {
        this.logger.warn('Looking for games to restore');
        if (!fs.existsSync('games.json'))
            return;

        try {
            const jsonString = fs.readFileSync('games.json').toString('utf8');
            const gamesData = JSON.parse(jsonString) as { id: string, prevGame: any, nextGame: any }[];

            for (const gameObj of gamesData)
                this.games.set(gameObj.id, extract(new GameModel(), gameObj));

            for (const gameObj of gamesData) {
                if (gameObj.prevGame)
                    this.games.get(gameObj.id)!.prevGame = this.games.get(gameObj.prevGame);

                if (gameObj.nextGame)
                    this.games.get(gameObj.id)!.nextGame = this.games.get(gameObj.nextGame);
            }

            this.logger.warn('  - games.json: Restored', this.games.size, 'game(s)');
        }
        catch (e) {
            this.logger.warn('Unable to restore games data.', e);
        }
    }
}
