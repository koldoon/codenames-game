export enum AgentSide {
    UNKNOWN,
    RED,
    BLUE,
    BLACK,
    NEUTRAL
}

export class AgentModel {
    name = '';
    side = AgentSide.UNKNOWN;
    uncovered = false;

    constructor(name: string, side: AgentSide) {
        this.name = name;
        this.side = side;
    }
}
