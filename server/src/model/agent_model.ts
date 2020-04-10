import { Agent } from '../api/agent';
import { AgentSide } from '../api/agent_side';

export class AgentModel implements Agent {
    constructor(
        public index = 0,
        public name = '',
        public side = AgentSide.UNKNOWN,
        public onChange?: (agent: AgentModel) => any) {
    }

    uncovered = false;

    uncover() {
        this.uncovered = true;
        if (this.onChange)
            this.onChange(this);
    }
}
