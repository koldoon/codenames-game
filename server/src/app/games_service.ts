import * as shuffle from 'shuffle-array';
import { Agent } from '../api/agent';
import { AgentSide } from '../api/agent_side';
import { Game } from '../api/game';
import { PlayerType } from '../api/player_type';
import { httpAssertFound } from '../core/http_assert_exists';
import { OnApplicationInit } from '../core/on_application_init';
import { DictionaryModel } from '../model/dictionary_model';
import { GameModel } from '../model/game_model';
import { GagaDictionary } from '../model/impl/gaga_dictionary';
import { GamesGateway } from './games_gateway';

export type GameId = string;

export class GamesService implements OnApplicationInit {
    constructor(gateway: GamesGateway) {
        console.debug('Dependency: ' + gateway.constructor.name);
    }

    private readonly dictionary: DictionaryModel = new GagaDictionary();
    private words: string[] = [];
    private games = new Map<GameId, GameModel>();

    async init() {
        console.debug('Using dictionary: ' + this.dictionary.constructor.name);
        this.words = await this.dictionary.getWords();
    }

    async createNewGame() {
        shuffle(this.words);
        const game = new GameModel().init(this.words.slice(0, 25));
        this.games.set(game.id, game);
        return game.id;
    }

    async getGameStatus(gameId: GameId, playerType: PlayerType) {
        let game = this.games.get(gameId);
        while (game && game.nextGameId)
            game = this.games.get(game.nextGameId);

        httpAssertFound(game, 'Game not found');
        let board: Agent[];
        if (playerType == PlayerType.CAPTAIN) {
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

        const agent = game.board[agentIndex];
        httpAssertFound(agent, 'Agent not found');

        agent.uncover();
        return <Agent> agent;
    }
}
