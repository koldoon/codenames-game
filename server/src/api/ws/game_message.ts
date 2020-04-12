import { Agent } from '../agent';

export enum GameMessageKind {
    JoinGame,
    AgentUncovered,
    PlayerJoined,
    PlayerLeft
}

export type GameMessage =
    JoinGameMessage |
    AgentUncoveredMessage |
    PlayersChangeMessage;

interface AbstractGameMessage {
    kind: GameMessageKind
}

export interface PlayersChangeMessage extends AbstractGameMessage {
    kind: GameMessageKind.PlayerJoined | GameMessageKind.PlayerLeft;
    playersCount: number;
}

export interface JoinGameMessage extends AbstractGameMessage {
    kind: GameMessageKind.JoinGame;
    gameId: string;
}

export interface AgentUncoveredMessage extends AbstractGameMessage {
    kind: GameMessageKind.AgentUncovered;
    agent: Agent;
    redsLeft: number;
    bluesLeft: number;
}



