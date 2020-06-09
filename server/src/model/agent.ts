import { Side } from './agent_side';

export interface Agent {
    i: number;
    name: string;
    side: Side;
    uncovered: boolean;
}
