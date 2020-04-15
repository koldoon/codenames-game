import { Subject } from 'rxjs';
import { Agent } from '../model/agent';
import { AgentSide } from '../model/agent_side';
import { PlayerType } from '../api/player_type';
import { asyncDelay } from '../core/async_delay';
import { httpAssertFound, httpAssertGoodRequest } from '../core/http_asserts';
import { OnApplicationInit } from '../core/on_application_init';
import { Dictionary } from '../model/dictionary';
import { Game } from '../model/game';
import { GagaDictionary } from '../model/impl/gaga_dictionary';
import { Turn } from '../model/turn';

export type GameId = string;

export class GamesService implements OnApplicationInit {
    readonly agentUncovered$ = new Subject<{ game: Game, agent: Agent }>();
    readonly turned$ = new Subject<{ game: Game, turn: Turn }>();
    readonly gamesChain$ = new Subject<{ prevGameId: string, nextGameId: string }>();

    private readonly dictionary: Dictionary = new GagaDictionary();
    private games = new Map<GameId, Game>();

    async init() {
        console.debug('Using games dictionary: ' + this.dictionary.constructor.name);
        const hour1 = 1000 * 60 * 60;
        this.beginOldGamesRemovingCycle(hour1);
    }

    async createNewGame(prevGameId?: string) {
        // look if new game has been already created by somebody
        if (prevGameId) {
            const prevGame = this.games.get(prevGameId);

            if (prevGame && prevGame.nextGame) {
                let newGame: Game | undefined = prevGame;

                // find the newest game in chain
                while (newGame && newGame.nextGame)
                    newGame = newGame.nextGame;

                if (newGame && newGame.id != prevGame.id)
                    return newGame.id;
            }
        }

        const newGame = new Game();
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

        httpAssertFound(game, 'Game not found');
        let board: Agent[];
        if (playerType == PlayerType.Captain) {
            board = game.board.map(card => <Agent> {
                name: card.name,
                side: card.side,
                uncovered: card.uncovered
            });
        }
        else {
            board = game.board.map(card => <Agent> {
                name: card.name,
                side: card.uncovered ? card.side : AgentSide.UNKNOWN
            });
        }

        return <Game> {
            id: game.id,
            redsLeft: game.redsLeft,
            bluesLeft: game.bluesLeft,
            turn: game.turn,
            isFinished: game.isFinished,
            nextGameId: game.nextGameId,
            gameInChain: game.gameInChain,
            board
        };
    }

    async uncoverAgent(gameId: string, agentIndex: number) {
        const game = this.games.get(gameId);
        httpAssertFound(game, 'Game not found');
        httpAssertFound(game.board[agentIndex], 'Agent not found');

        const agent = game.uncoverAgent(agentIndex);
        httpAssertGoodRequest(agent, 'Game or turn is finished or not inited');

        this.agentUncovered$.next({ game, agent });
        return agent;
    }

    async commitCode(gameId: string, code: string, count: number) {
        const game = this.games.get(gameId);
        httpAssertFound(game, 'Game not found');

        const turn = game.commitCode(code, count);
        httpAssertGoodRequest(turn, 'Game is finished');

        this.turned$.next({ game, turn });
        return turn;
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
        const activeGames = new Map<GameId, Game>();
        const oldGames = new Map<GameId, Game>();

        for (const g of this.games) {
            const [gameId, game] = g;

            if (activeGames.has(gameId) || oldGames.has(gameId))
                continue;

            let linkedGame: Game | undefined;
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
                const unknownChain: Game[] = [game];
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

        console.log(`Old games to clear: ${oldGames.size}`);
        this.games = activeGames;
        this.beginOldGamesRemovingCycle(intervalMs);
    }
}
