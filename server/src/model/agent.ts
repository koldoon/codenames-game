import { Side } from './agent_side';

export interface Agent {
    readonly index: number;
    readonly name: string;
    side: Side;
    uncovered: boolean;
}
