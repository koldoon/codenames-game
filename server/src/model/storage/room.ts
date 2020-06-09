import { Game } from '../game';

export interface Room {
    id: string;
    lastActivity: Date;
    gamesPlayed: number;
    game?: Game;
}
