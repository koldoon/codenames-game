import { Agent } from '../model/agent';
import { Turn } from '../model/turn';

/**
 * Simplified interface of Game
 */
export interface GameStatus {
    id: string;
    board: Agent[];
    turn: Turn;
    redsLeft: number;
    bluesLeft: number;
    isFinished: boolean;

    nextGameId: string;
    gameInChain: number;
}
