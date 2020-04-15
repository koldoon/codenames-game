import { Agent } from '../../model/agent';
import { AgentSide } from '../../model/agent_side';

export enum GameMessageKind {
    JoinGame,
    AgentUncovered,
    PlayerJoined,
    PlayerLeft,
    Ping,
    ChatMessage
}

export type GameMessage =
    | JoinGameMessage
    | AgentUncoveredMessage
    | PlayersChangeMessage
    | PingGameMessage
    | ChatMessage;

export interface PingGameMessage {
    kind: GameMessageKind.Ping;
}

export interface ChatMessage {
    kind: GameMessageKind.ChatMessage;
    message: string;
    side: AgentSide.BLUE | AgentSide.RED;
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
    isFinished: boolean;
}
