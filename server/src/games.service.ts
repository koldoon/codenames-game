import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Agent } from './api/agent';
import { AgentSide } from './api/agent_side';
import { Game } from './api/game';
import { PlayerType } from './api/player_type';
import { DictionaryModel } from './model/dictionary_model';
import { GameModel } from './model/game_model';
import { GagaDictionary } from './model/impl/gaga_dictionary';
import { httpAssertFound } from './utils/http_assert_exists';
import shuffle = require('shuffle-array');

export type GameId = string;

@Injectable()
export class GamesService implements OnApplicationBootstrap {
    private readonly logger = new Logger(GamesService.name);
    private readonly dictionary: DictionaryModel = new GagaDictionary();
    private words: string[] = [];
    private games = new Map<GameId, GameModel>();

    async onApplicationBootstrap() {
        this.logger.debug('Using dictionary: ' + this.dictionary.constructor.name);
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
