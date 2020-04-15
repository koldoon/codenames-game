import { bindClass } from '../core/bind_class';
import { Agent } from './agent';
import { AgentSide } from './agent_side';
import { Turn } from './turn';
import shuffle = require('shuffle-array');
import uuid = require('uuid');

export class Game {
    readonly boardSize = 25;
    readonly id = uuid.v4();

    board: Agent[] = [];
    gameControl = true;     // if true model will restrict uncovering not in a turn
    turn: Turn = { code: '', count: 0, isFinished: false, isInited: false, side: AgentSide.UNKNOWN };

    redsLeft = (this.boardSize - 1) / 3;
    bluesLeft = (this.boardSize - 1) / 3;
    isFinished = false;
    lastModified = new Date();

    prevGame: Game | undefined; // previous game in chain
    nextGame: Game | undefined; // next game in chain
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

        const boardConfig = Game.createRandomizedAgentsSidesList(this.boardSize);
        this.turn = { code: '', count: 0, isFinished: false, isInited: false, side: boardConfig.firstTurnSide };
        this.turn.side == AgentSide.BLUE
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
        const turnAllowed = this.gameControl && this.turn.isInited && !this.turn.isFinished;

        if (!agent || this.isFinished || !turnAllowed)
            return false;

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

            if (this.gameControl) {
                this.turn.count -= 1;

                if (agent.side != this.turn.side || this.turn.count == 0)
                    this.turn.isFinished = true;
            }

            this.lastModified = new Date();
        }

        if (!this.redsLeft || !this.bluesLeft)
            this.isFinished = true;

        return agent;
    }

    commitCode(code: string, count: number) {
        if (this.isFinished)
            return false;

        const side = this.turn.isInited
            ? this.turn.side
            : this.turn.side == AgentSide.BLUE ? AgentSide.RED : AgentSide.BLUE;

        this.turn = {
            code,
            side,
            count: count == 0 ? this.boardSize : count,
            isInited: true,
            isFinished: false
        };

        return this.turn;
    }

    private static createRandomizedAgentsSidesList(boardSize: number) {
        const sides: AgentSide[] = [
            ...Array((boardSize - 1) / 3 - 1).fill(AgentSide.NEUTRAL), AgentSide.BLACK,
            ...Array((boardSize - 1) / 3).fill(AgentSide.BLUE),
            ...Array((boardSize - 1) / 3).fill(AgentSide.RED)
        ];

        const firstTurnSide: AgentSide.RED | AgentSide.BLUE = Math.random() > 0.5 ? AgentSide.RED : AgentSide.BLUE;
        sides.push(firstTurnSide);
        shuffle(sides);
        return { sides, firstTurnSide };
    }
}
