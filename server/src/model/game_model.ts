import { AgentModel, AgentSide } from './agent_model';
import { GameBoard } from './game_board_type';
import shuffle = require('shuffle-array');

export class GameModel {
    readonly board: GameBoard;
    readonly firstTurn: AgentSide;

    constructor(names: string[]) {
        if (!names || names.length < 25)
            throw Error('We need at least 25 words for a game');

        const sides: AgentSide[] = [
            ...Array(8).fill(AgentSide.BLUE),
            ...Array(8).fill(AgentSide.RED),
            ...Array(7).fill(AgentSide.NEUTRAL),
            AgentSide.BLACK
        ];

        this.firstTurn = Math.random() > 0.5 ? AgentSide.RED : AgentSide.BLUE;
        sides.push(this.firstTurn);
        shuffle(sides);

        this.board = [];
        for (let i = 0; i < 25; i++) {
            this.board.push(new AgentModel(names.pop(), sides.pop()));
        }
    }
}
