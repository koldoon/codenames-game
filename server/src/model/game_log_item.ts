import { Side } from './agent_side';
import { PlayerSide } from './player_side';

export type GameEvent = AgentUncovered | SpymasterHint | GameFinished;

export enum GameEventKind {
    AgentUncovered,
    SpymasterHint,
    GameFinished
}

export interface AgentUncovered {
    kind: GameEventKind.AgentUncovered,
    index: number;
    side: Side;
}

export interface SpymasterHint {
    kind: GameEventKind.SpymasterHint,
    side: PlayerSide;
    hint: string;
    matchCount: number;
}

export interface GameFinished {
    kind: GameEventKind.GameFinished,
    sideWinner: PlayerSide;
}
