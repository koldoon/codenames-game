import { Agent } from '../model/agent';
import { GameEvent } from '../model/game_log_item';
import { GameMove } from '../model/game_move';

/**
 * Simplified interface of Game
 */
export interface GameStatus {
    id: string;
    board: Agent[];
    move: GameMove;
    redLeft: number;
    blueLeft: number;
    isFinished: boolean;
    log: GameEvent[];
    gameInChain: number;
}
