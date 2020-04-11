import { AgentSide } from '../api/agent_side';
import { Game } from '../api/game';
import { bindClass } from '../core/bind_class';
import { AgentModel } from './agent_model';
import shuffle = require('shuffle-array');
import uuid = require('uuid');

export class GameModel implements Game {
    id = uuid.v4();
    board: AgentModel[] = [];
    firstTurn = AgentSide.UNKNOWN;
    redsLeft = 8;
    bluesLeft = 8;
    isFinished = false;
    nextGameId = '';

    constructor(private onChange?: (game: GameModel) => any) {
        bindClass(this);
    }

    init(names: string[]) {
        if (!names || names.length < 25)
            throw Error('We need at least 25 words for a game');

        const boardConfig = this.createRandomizedAgentsSidesList();
        this.firstTurn = boardConfig.firstTurnSide;
        this.firstTurn == AgentSide.BLUE
            ? this.bluesLeft += 1
            : this.redsLeft += 1;
        this.board = [];
        for (let i = 0; i < 25; i++) {
            const agent = new AgentModel(i, names.pop(), boardConfig.sides.pop(), this.onAgentChange);
            this.board.push(agent);
        }
        return this;
    }

    onAgentChange(agent: AgentModel) {
        if (agent.uncovered && agent.side == AgentSide.BLUE)
            this.bluesLeft -= 1;

        if (agent.uncovered && agent.side == AgentSide.RED)
            this.redsLeft -= 1;

        if (!this.redsLeft || !this.bluesLeft || agent.side == AgentSide.BLACK)
            this.isFinished = true;

        if (this.onChange)
            this.onChange(this);
    }

    createRandomizedAgentsSidesList() {
        const sides: AgentSide[] = [
            AgentSide.BLACK,
            ...Array(8).fill(AgentSide.BLUE),
            ...Array(8).fill(AgentSide.RED),
            ...Array(7).fill(AgentSide.NEUTRAL)
        ];

        const firstTurnSide = Math.random() > 0.5 ? AgentSide.RED : AgentSide.BLUE;
        sides.push(firstTurnSide);
        shuffle(sides);
        return { sides, firstTurnSide };
    }
}
