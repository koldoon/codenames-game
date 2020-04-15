import { AgentSide } from './agent_side';

export interface Turn {
    /**
     * secret word committed by Captain
     */
    code: string;

    /**
     * Number of words associated to secret code
     */
    count: number

    /**
     * Captain team side
     */
    side: AgentSide.BLUE | AgentSide.RED | AgentSide.UNKNOWN;
    isFinished: boolean;

    /**
     * This is basically applies to the very first turn only.
     * To start the game, the first Captain must commit the code.
     */
    isInited: boolean;
}
