import { GameEvent } from '../../model/game_log_item';

export type Message =
    | PingMessage
    | PlayersChangeMessage
    | JoinGameMessage
    | GameEventMessage;

export enum MessageKind {
    JoinGame,
    PlayerJoined,
    PlayerLeft,
    Ping,
    GameEvent
}

export interface PingMessage {
    kind: MessageKind.Ping;
}


export interface AbstractGameMessage {
    gameId: string;
}

export interface PlayersChangeMessage extends AbstractGameMessage {
    kind: MessageKind.PlayerJoined | MessageKind.PlayerLeft;
    playersCount: number;
}

/**
 * Can be send by both sides:
 *   - frontend (intend to join a game "room") and
 *   - backend (inform frontend about game change due to games chain)
 */
export interface JoinGameMessage extends AbstractGameMessage {
    kind: MessageKind.JoinGame;
}

export interface GameEventMessage extends AbstractGameMessage {
    kind: MessageKind.GameEvent;
    event: GameEvent;
    redLeft: number;
    blueLeft: number;
}
