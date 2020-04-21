import { Subject } from 'rxjs';
import { GameStatus } from '../api/game_status';
import { PlayerType } from '../api/player_type';
import { asyncDelay } from '../core/async_delay';
import { httpAssertFound, httpAssertRange, httpAssertValue } from '../core/http_asserts';
import { OnApplicationInit } from '../core/on_application_init';
import { Agent } from '../model/agent';
import { Side } from '../model/agent_side';
import { Dictionary } from '../model/dictionary';
import { GameEvent } from '../model/game_log_item';
import { GameModel } from '../model/game_model';
import { DeNullDictionary } from '../model/impl/denull_dictionary';

export type GameId = string;
const t_1hour = 1000 * 60 * 60;

export class GamesService implements OnApplicationInit {
    readonly gameEvents$ = new Subject<{ game: GameModel, event: GameEvent }>();
    readonly gamesChain$ = new Subject<{ prevGameId: string, nextGameId: string }>();

    private readonly dictionary: Dictionary = new DeNullDictionary();
    private games = new Map<GameId, GameModel>();

    async init() {
        console.debug('Using games dictionary: ' + this.dictionary.constructor.name);
        this.beginOldGamesRemovingCycle(t_1hour);
    }

    async createNewGame(prevGameId?: string) {
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
        const randomWords = await this.dictionary.getRandomWords(newGame.boardSize);
        newGame.init(randomWords);
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

    async getGameStatus(gameId: GameId, playerType: PlayerType) {
        let game = this.games.get(gameId);
        while (game && game.nextGame)
            game = game.nextGame;

        httpAssertFound(game, 'Game not found.');
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

        return <GameStatus> {
            id: game.id,
            redLeft: game.redLeft,
            blueLeft: game.blueLeft,
            move: game.move,
            isFinished: game.isFinished,
            nextGameId: game.nextGameId,
            gameInChain: game.gameInChain,
            log: game.events,
            board
        };
    }

    async uncoverAgent(gameId: string, agentIndex: number) {
        const game = this.games.get(gameId);
        httpAssertFound(game, 'Game not found.');
        httpAssertFound(game.board[agentIndex], 'Agent not found.');

        const eventsBefore = game.events.length;
        const agent = game.uncoverAgent(agentIndex);
        httpAssertValue(agent, 'Agent is already uncovered or game or move is finished or not yet inited.');

        for (let i = eventsBefore; i < game.events.length; i++)
            this.gameEvents$.next({ game, event: game.events[i] });

        return agent;
    }

    async commitCode(gameId: string, message: string) {
        const game = this.games.get(gameId);
        //<editor-fold desc="asserts">
        httpAssertFound(game, 'Game not found.');
        //</editor-fold>

        const [hint, count_s] = message.trim().split(/[\s,;]+/);
        const count = Number(count_s);
        //<editor-fold desc="asserts">
        httpAssertValue(hint != '', 'Invalid code word.');
        httpAssertRange(count, [0, (game.boardSize - 1) / 3 + 1], 'Invalid code word match count.');
        //</editor-fold>

        const move = game.commitHint(hint, count);
        //<editor-fold desc="asserts">
        httpAssertValue(move, 'Game is finished.');
        //</editor-fold>

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
        await asyncDelay(intervalMs);

        const now = Date.now();
        const activeGames = new Map<GameId, GameModel>();
        const oldGames = new Map<GameId, GameModel>();

        for (const g of this.games) {
            const [gameId, game] = g;

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

        console.log(`Old games clearing: ${oldGames.size}`);
        this.games = activeGames;
        this.beginOldGamesRemovingCycle(intervalMs);
    }
}
