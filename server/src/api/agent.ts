import { AgentSide } from './agent_side';

export interface Agent {
    index: number;
    name: string;
    side: AgentSide;
    uncovered: boolean;
}
