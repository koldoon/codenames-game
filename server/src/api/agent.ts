import { AgentSide } from './agent_side';

export interface Agent {
    readonly index: number;
    readonly name: string;
    side: AgentSide;
    uncovered: boolean;
}