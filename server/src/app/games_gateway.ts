import { Request } from 'express';
import { Application } from 'express-ws';
import * as WebSocket from 'ws';
import { GameEventMessage, JoinGameMessage, Message, MessageKind, PlayersChangeMessage } from '../api/ws/game_messages';
import { asyncDelay } from '../core/async_delay';
import { bindClass } from '../core/bind_class';
import { Logecom } from '../core/logecom/logecom';
import { OnApplicationInit } from '../core/on_application_init';
import { GamesService } from './games_service';

type GameId = string;
const t_10seconds = 1000 * 10;

/**
 * WebSocket gateway for games events
 */
export class GamesGateway implements OnApplicationInit {
    private logger = Logecom.createLogger(GamesGateway.name);

    constructor(
        private app: Application,
        private gamesService: GamesService) {

        bindClass(this);
    }

    private gamePlayers = new Map<GameId, Set<WebSocket>>();
    private playerGame = new Map<WebSocket, GameId>();

    async init() {
        this.app.ws('/api/stream', this.onClientConnected);

        this.beginClientsPingPongCycle(t_10seconds);
        this.bindToGamesEvents();
    }

    private bindToGamesEvents() {
        this.gamesService.gameEvents$.subscribe(value => {
            this.sendMessageToPlayers(value.game.id, <GameEventMessage> {
                kind: MessageKind.GameEvent,
                gameId: value.game.id,
                blueLeft: value.game.blueLeft,
                redLeft: value.game.redLeft,
                event: value.event
            });
        });

        this.gamesService.gamesChain$.subscribe(value => {
            this.sendMessageToPlayers(value.prevGameId, <JoinGameMessage> {
                kind: MessageKind.JoinGame,
                gameId: value.nextGameId
            });
        });
    }

    private sendMessageToPlayers(gameId: string, msg: Message) {
        const players = this.gamePlayers.get(gameId);
        if (!players)
            return;

        for (const ws of players) {
            try {
                ws.send(JSON.stringify(msg));
            }
            catch (e) {
            }
        }
    }

    private onClientConnected(ws: WebSocket, req: Request) {
        req.headers['x-forwarded-for'] && typeof req.headers['x-forwarded-for'] == 'string'
            ? this.logger.log('Client connected:', req.headers['x-forwarded-for'].split(/\s*,\s*/)[0])
            : this.logger.log('Client connected:', req.connection.remoteAddress);

        ws.on('close', (code, reason) => {
            this.onClientDisconnected(ws);
        });

        ws.on('message', data => {
            const msg = <Message> JSON.parse(data.toString());
            if (msg.kind == MessageKind.JoinGame)
                this.onJoinGame(ws, msg.gameId);
        });
    }

    private onJoinGame(ws: WebSocket, gameId: string) {
        this.movePlayerToGame(ws, gameId);

        this.sendMessageToPlayers(gameId, <PlayersChangeMessage> {
            kind: MessageKind.PlayerJoined,
            playersCount: this.getGamePlayers(gameId).size
        });
    }

    private onClientDisconnected(ws: WebSocket) {
        this.movePlayerToGame(ws, null);
    }

    /**
     * Remove Player from currently playing Game.
     * If the Game is empty - remove it as well.
     * @param ws Client socket
     * @param toGameId If empty - remove player from all the games
     */
    private movePlayerToGame(ws: WebSocket, toGameId: GameId | null) {
        const gameId = this.playerGame.get(ws);
        if (gameId == toGameId)
            return;

        this.playerGame.delete(ws);
        if (gameId) {
            const players = this.gamePlayers.get(gameId);

            if (players) {
                players.delete(ws);

                if (players.size == 0) {
                    this.gamePlayers.delete(gameId);
                }
                else {
                    this.sendMessageToPlayers(gameId, <PlayersChangeMessage> {
                        kind: MessageKind.PlayerLeft,
                        playersCount: this.getGamePlayers(gameId).size
                    });
                }
            }
        }

        if (toGameId) {
            this.playerGame.set(ws, toGameId);
            this.getGamePlayers(toGameId).add(ws);
        }
    }

    /**
     * Conventional method.
     * Creates game players Set if not exists yet.
     */
    private getGamePlayers(gameId: GameId) {
        if (!this.gamePlayers.get(gameId))
            this.gamePlayers.set(gameId, new Set<WebSocket>());
        return this.gamePlayers.get(gameId)!;
    }

    /**
     * Periodically send 'ping' message to web-socket clients.
     * This is 'must have' when server is located behind the proxy, like nginx.
     * Otherwise connection will be closed due to inactivity
     * (for nginx default is 30 sec).
     */
    private async beginClientsPingPongCycle(intervalMs: number) {
        await asyncDelay(intervalMs);

        for (const player of this.playerGame) {
            const [ws] = player;
            try {
                ws.ping(1);
            }
            catch (e) {
                this.movePlayerToGame(ws, null);
            }
        }

        this.beginClientsPingPongCycle(intervalMs);
    }
}
