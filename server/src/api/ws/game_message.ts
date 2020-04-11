import { Agent } from '../agent';

export enum GameMessageKind {
    JoinGame,
    AgentUncovered
}

interface AbstractGameMessage {
    kind: GameMessageKind
}

export interface JoinGameMessage extends AbstractGameMessage {
    kind: GameMessageKind.JoinGame
    gameId: string
}

export interface AgentUncoveredMessage extends AbstractGameMessage {
    kind: GameMessageKind.AgentUncovered
    agent: Agent,
    redsLeft: number,
    bluesLeft: number
}


export type GameMessage = JoinGameMessage | AgentUncoveredMessage;
