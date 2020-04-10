import { Agent } from './agent';
import { AgentSide } from './agent_side';

export interface Game {
    id: string;
    board: Agent[];
    firstTurn: AgentSide;
    redsLeft: number;
    bluesLeft: number;
    isFinished: boolean;
    nextGameId: string;
}
