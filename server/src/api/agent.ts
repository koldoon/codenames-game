import { AgentSide } from './agent_side';

export interface Agent {
    name: string;
    side: AgentSide;
    uncovered: boolean;
}
