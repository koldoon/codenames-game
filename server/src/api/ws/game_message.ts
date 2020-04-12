import { Agent } from '../agent';

export enum GameMessageKind {
    JoinGame,
    AgentUncovered,
    PlayerJoined,
    PlayerLeft,
    Ping
}

export type GameMessage =
    JoinGameMessage |
    AgentUncoveredMessage |
    PlayersChangeMessage |
    PingGameMessage;

export interface PingGameMessage {
    kind: GameMessageKind.Ping
}

export interface PlayersChangeMessage {
    kind: GameMessageKind.PlayerJoined | GameMessageKind.PlayerLeft;
    playersCount: number;
}

export interface JoinGameMessage {
    kind: GameMessageKind.JoinGame;
    gameId: string;
}

export interface AgentUncoveredMessage {
    kind: GameMessageKind.AgentUncovered;
    agent: Agent;
    redsLeft: number;
    bluesLeft: number;
}



