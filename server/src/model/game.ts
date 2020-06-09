import { Agent } from './agent';
import { GameEvent } from './game_log_item';
import { GameMove } from './game_move';

export interface Game {
    id: string;
    boardSize: number;
    board: Agent[];
    move: GameMove;
    events: GameEvent[];
    redLeft: number;
    blueLeft: number;
    isFinished: boolean;
}
