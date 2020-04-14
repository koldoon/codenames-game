import { Agent } from '../api/agent';
import { AgentSide } from '../api/agent_side';
import { bindClass } from '../core/bind_class';
import shuffle = require('shuffle-array');
import uuid = require('uuid');

export class GameModel {
    readonly boardSize = 25;
    readonly id = uuid.v4();

    board: Agent[] = [];
    firstTurn = AgentSide.UNKNOWN;
    redsLeft = (this.boardSize - 1) / 3;
    bluesLeft = (this.boardSize - 1) / 3;
    isFinished = false;
    lastModified = new Date();

    prevGame: GameModel | undefined; // previous game in chain
    nextGame: GameModel | undefined; // next game in chain
    gameInChain = 1;                 // counter of games in chain

    constructor() {
        bindClass(this);
    }

    get nextGameId(): string {
        return this.nextGame ? this.nextGame.id : '';
    }

    init(names: string[]) {
        if (!names || names.length < this.boardSize)
            throw Error(`We need at least ${this.boardSize} words for a game`);

        const boardConfig = GameModel.createRandomizedAgentsSidesList(this.boardSize);
        this.firstTurn = boardConfig.firstTurnSide;
        this.firstTurn == AgentSide.BLUE
            ? this.bluesLeft += 1
            : this.redsLeft += 1;

        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board.push({
                index: i,
                name: names.pop()!,
                side: boardConfig.sides.pop()!,
                uncovered: false
            });
        }
        return this;
    }

    uncoverAgent(index: number) {
        const agent = this.board[index];

        if (this.isFinished)
            return agent;

        this.lastModified = new Date();

        if (agent && !agent.uncovered) {
            agent.uncovered = true;

            if (agent.side == AgentSide.BLUE) {
                this.bluesLeft -= 1;
            }
            else if (agent.side == AgentSide.RED) {
                this.redsLeft -= 1;
            }
            else if (agent.side == AgentSide.BLACK) {
                this.isFinished = true;
            }
        }

        if (!this.redsLeft || !this.bluesLeft)
            this.isFinished = true;

        return agent;
    }

    private static createRandomizedAgentsSidesList(boardSize: number) {
        const sides: AgentSide[] = [
            ...Array((boardSize - 1) / 3 - 1).fill(AgentSide.NEUTRAL), AgentSide.BLACK,
            ...Array((boardSize - 1) / 3).fill(AgentSide.BLUE),
            ...Array((boardSize - 1) / 3).fill(AgentSide.RED)
        ];

        const firstTurnSide = Math.random() > 0.5 ? AgentSide.RED : AgentSide.BLUE;
        sides.push(firstTurnSide);
        shuffle(sides);
        return { sides, firstTurnSide };
    }
}
