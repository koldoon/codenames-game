import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentModel, AgentSide } from './model/agent_model';
import { GameModel } from './model/game_model';
import shuffle = require('shuffle-array');
import uuid = require('uuid');

export type GameId = string;

@Injectable()
export class GameService {
    private readonly words = 'вождь подьем полис запах строй гений лимузин паук луч полиция ночь ' +
        'механизм нож помет лист германия журавль смерть дума корабль фокус церковь ' +
        'вид греция фига москва рог волна водолаз время порода блин десна юпитер икра парк ' +
        'лазер шуба рейд жук агент колода крошка дыра лук путь антарктида гранат платье карта';

    private readonly dictionary = this.words.split(' ');
    private games = new Map<GameId, GameModel>();

    async createGame() {
        shuffle(this.dictionary);
        const game = new GameModel(this.dictionary.slice(0, 25));
        const id = uuid.v4();
        this.games.set(id, game);
        return id;
    }

    async getPublicBoard(gameId: GameId) {
        const game = this.games.get(gameId);
        if (!game)
            throw new NotFoundException('Game not found');

        return game.board.map(card => <AgentModel> {
            name: card.name,
            side: card.uncovered ? card.side : AgentSide.UNKNOWN
        });
    }

    async getPrivateBoard(gameId: GameId) {
        const game = this.games.get(gameId);
        if (!game)
            throw new NotFoundException('Game not found');
        return game;
    }

    async uncoverAgent(gameId: string, agentIndex: number) {
        const game = this.games.get(gameId);
        if (!game)
            throw new NotFoundException('Game not found');

        const agent = game.board[agentIndex];
        agent.uncovered = true;
        return agent;
    }
}
