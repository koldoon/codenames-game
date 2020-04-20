import { PlayerSide } from './player_side';

export interface GameMove {
    /**
     * secret word committed by Captain
     */
    hint: string;

    /**
     * Number of words associated to secret code
     */
    count: number

    /**
     * Captain team side
     */
    side: PlayerSide;
    isFinished: boolean;

    /**
     * This is basically applies to the very first turn only.
     * To start the game, the first Captain must commit the code.
     */
    isInited: boolean;
}
