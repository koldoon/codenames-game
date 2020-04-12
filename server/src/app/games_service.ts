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
    readonly agentUncovered$ = new Subject<{ game: Game, agent: Agent }>();
    readonly gamesChain$ = new Subject<{ prevGameId: string, nextGameId: string }>();

    private readonly dictionary: DictionaryModel = new GagaDictionary();
    private games = new Map<GameId, GameModel>();

    async init() {
        console.debug('Using games dictionary: ' + this.dictionary.constructor.name);
        const hour1 = 1000 * 60 * 60;
        this.beginOldGamesRemovingCycle(hour1);
    }

    async createNewGame(prevGameId?: string) {
        // look if new game was already created by somebody
        if (prevGameId) {
            const prevGame = this.games.get(prevGameId);

            if (prevGame && prevGame.nextGameId) {
                let newGame: GameModel | undefined = prevGame;

                while (newGame && newGame.nextGameId) {
                    newGame = this.games.get(newGame.nextGameId);
                }

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
                prevGame.nextGameId = newGame.id;
                this.gamesChain$.next({ prevGameId: prevGame.id, nextGameId: newGame.id });
            }
        }

        return newGame.id;
    }

    async getGameStatus(gameId: GameId, playerType: PlayerType) {
        let game = this.games.get(gameId);
        while (game && game.nextGameId)
            game = this.games.get(game.nextGameId);

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
        return <Game> { ...game, board };
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

        const oldGames: GameId[] = [];
        for (const g of this.games) {
            const [gameId, game] = g;
            if (now - game.lastModified.getTime() > intervalMs)
                oldGames.push(gameId);
        }

        for (const gameId of oldGames) {
            this.games.delete(gameId);
        }

        console.log(`Old games cleaned: ${oldGames.length}`);
        this.beginOldGamesRemovingCycle(intervalMs);
    }
}
