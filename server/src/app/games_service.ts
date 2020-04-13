import { Subject } from 'rxjs';
import { Agent } from '../api/agent';
import { AgentSide } from '../api/agent_side';
import { Game } from '../api/game';
import { PlayerType } from '../api/player_type';
import { asyncDelay } from '../core/async_delay';
import { httpAssertFound } from '../core/http_assert_exists';
import { OnApplicationInit } from '../core/on_application_init';
import { DictionaryModel } from '../model/dictionary_model';
import { GameModel } from '../model/game_model';
import { GagaDictionary } from '../model/impl/gaga_dictionary';

export type GameId = string;

export class GamesService implements OnApplicationInit {
    readonly agentUncovered$ = new Subject<{ game: GameModel, agent: Agent }>();
    readonly gamesChain$ = new Subject<{ prevGameId: string, nextGameId: string }>();

    private readonly dictionary: DictionaryModel = new GagaDictionary();
    private games = new Map<GameId, GameModel>();

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
            firstTurn: game.firstTurn,
            isFinished: game.isFinished,
            nextGameId: game.nextGameId,
            gameInChain: game.gameInChain,
            board
        };
    }

    async uncoverAgent(gameId: string, agentIndex: number) {
        const game = this.games.get(gameId);
        httpAssertFound(game, 'Game not found');

        const agent = game.uncoverAgent(agentIndex);
        httpAssertFound(agent, 'Agent not found');

        this.agentUncovered$.next({ game, agent });
        return <Agent> agent;
    }

    private async beginOldGamesRemovingCycle(intervalMs: number) {
        await asyncDelay(intervalMs);

        const now = Date.now();
        const activeGames = new Map<GameId, GameModel>();
        const oldGames = new Map<GameId, GameModel>();

        // game is active if one of the games in chain is active
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

        console.log(`Old games to clear: ${oldGames.size}`);
        this.games = activeGames;
        this.beginOldGamesRemovingCycle(intervalMs);
    }
}
