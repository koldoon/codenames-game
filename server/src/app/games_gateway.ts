import { Application } from 'express-ws';
import * as WebSocket from 'ws';
import { AgentUncoveredMessage, GameMessage, GameMessageKind, JoinGameMessage, PlayersChangeMessage } from '../api/ws/game_message';
import { asyncDelay } from '../core/async_delay';
import { bindClass } from '../core/bind_class';
import { OnApplicationInit } from '../core/on_application_init';
import { GamesService } from './games_service';

type GameId = string;

export class GamesGateway implements OnApplicationInit {
    constructor(
        private app: Application,
        private gamesService: GamesService) {

        bindClass(this);
    }

    private gamePlayers = new Map<GameId, Set<WebSocket>>();
    private playerGame = new Map<WebSocket, GameId>();

    async init() {
        this.app.ws('/api/stream', this.onClientConnected);

        this.gamesService.agentUncovered$.subscribe(value => {
            this.sendMessageToPlayers(value.game.id, <AgentUncoveredMessage> {
                kind: GameMessageKind.AgentUncovered,
                agent: value.agent,
                redsLeft: value.game.redsLeft,
                bluesLeft: value.game.bluesLeft
            });
        });

        this.gamesService.gamesChain$.subscribe(value => {
            this.sendMessageToPlayers(value.prevGameId, <JoinGameMessage> {
                kind: GameMessageKind.JoinGame,
                gameId: value.nextGameId
            });
        });

        const sec10 = 1000 * 10;
        this.beginClientsPingPongCycle(sec10);
    }

    private sendMessageToPlayers(gameId: string, msg: GameMessage) {
        const players = this.gamePlayers.get(gameId);
        if (!players)
            return;

        for (const ws of players) {
            try {
                ws.send(JSON.stringify(msg));
            }
            catch (e) {
                console.warn(`Could not send message to client of game: ${gameId}}`);
            }
        }
    }

    private onClientConnected(ws: WebSocket) {
        ws.on('close', (code, reason) => {
            this.onClientDisconnected(ws);
        });

        ws.on('message', data => {
            const msg = <GameMessage> JSON.parse(data.toString());
            if (msg.kind == GameMessageKind.JoinGame) {
                this.onJoinGame(ws, msg.gameId);
            }
        });
    }

    private onJoinGame(ws: WebSocket, gameId: string) {
        this.removePlayerFromGame(ws);
        this.playerGame.set(ws, gameId);
        this.getGamePlayers(gameId).add(ws);

        this.sendMessageToPlayers(gameId, <PlayersChangeMessage> {
            kind: GameMessageKind.PlayerJoined,
            playersCount: this.getGamePlayers(gameId).size
        });
    }

    private onClientDisconnected(ws: WebSocket) {
        this.removePlayerFromGame(ws);
    }

    // Remove Player from currently playing Game.
    // If the Game is empty - remove it as well.
    private removePlayerFromGame(ws: WebSocket) {
        const gameId = this.playerGame.get(ws);
        if (!gameId)
            return;

        this.playerGame.delete(ws);
        const players = this.gamePlayers.get(gameId);
        if (!players)
            return;

        players.delete(ws);
        if (players.size == 0) {
            this.gamePlayers.delete(gameId);
        }
        else {
            this.sendMessageToPlayers(gameId, <PlayersChangeMessage> {
                kind: GameMessageKind.PlayerLeft,
                playersCount: this.getGamePlayers(gameId).size
            });
        }
    }

    // Conventional method.
    // Creates game players Set if not exists yet.
    private getGamePlayers(gameId: GameId) {
        if (!this.gamePlayers.get(gameId))
            this.gamePlayers.set(gameId, new Set<WebSocket>());
        return this.gamePlayers.get(gameId)!;
    }

    // Periodically send 'ping' message to web-socket clients.
    // This is 'must have' when server locates behind the proxy, like nginx.
    // Otherwise connection will be closed due to inactivity
    // (for nginx default is 30 sec).
    private async beginClientsPingPongCycle(intervalMs: number) {
        await asyncDelay(intervalMs);

        for (const player of this.playerGame) {
            const [ws] = player;
            try {
                ws.ping(1);
            }
            catch (e) {
                this.removePlayerFromGame(ws);
            }
        }

        this.beginClientsPingPongCycle(intervalMs);
    }
}
