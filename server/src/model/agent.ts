import { Side } from '../model/agent_side';

export interface Agent {
    readonly index: number;
    readonly name: string;
    side: Side;
    uncovered: boolean;
}
