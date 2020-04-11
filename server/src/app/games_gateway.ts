import { Application } from 'express-ws';
import * as WebSocket from 'ws';
import { AgentUncoveredMessage, GameMessage, GameMessageKind, JoinGameMessage } from '../api/ws/game_message';
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

    init() {
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
            })
        });
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
        console.log(`Client joined game channel: ${gameId} | games total: ${this.gamePlayers.size} | players total: ${this.playerGame.size}`);
    }

    private onClientDisconnected(ws: WebSocket) {
        this.removePlayerFromGame(ws);
        console.log(`Client left: games total: ${this.gamePlayers.size} | players total: ${this.playerGame.size}`);
    }

    // Remove Player from currently playing Game.
    // If the Game is empty - remove it as well.
    private removePlayerFromGame(ws: WebSocket) {
        const playerCurrentGameId = this.playerGame.get(ws);
        if (!playerCurrentGameId)
            return;
        this.playerGame.delete(ws);
        const players = this.gamePlayers.get(playerCurrentGameId);
        if (!players)
            return;
        players.delete(ws);
        if (players.size == 0)
            this.gamePlayers.delete(playerCurrentGameId);
    }

    // Conventional method.
    // Creates game players Set if not exists yet.
    private getGamePlayers(gameId: GameId) {
        if (!this.gamePlayers.get(gameId))
            this.gamePlayers.set(gameId, new Set<WebSocket>());
        return this.gamePlayers.get(gameId)!;
    }
}
