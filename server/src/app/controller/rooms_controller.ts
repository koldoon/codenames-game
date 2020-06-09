import { Application, json, Request, Router } from 'express';
import { assert } from '../../core/assert';
import { bindClass } from '../../core/bind_class';
import { asyncJson } from '../../core/express/async_json';
import { OnApplicationInit } from '../../core/on_application_init';
import { RoomsService } from '../service/rooms_service';

export class RoomsController implements OnApplicationInit {
    constructor(
        private app: Application,
        private roomsService: RoomsService) {
        bindClass(this);
    }

    init() {
        this.app.use('/api/rooms', Router()
            .get('/create', asyncJson(this.createNewRoom))
            .get('/:roomId/new-game', asyncJson(this.createNewGame))
            .get('/:roomId/games/current/status', asyncJson(this.getGameStatus))
            .get('/:roomId/games/current/agents/:agentId/uncover', asyncJson(this.uncoverAgent))
            .post('/:roomId/game/commit-code', json(), asyncJson(this.commitCode))
        );
    }

    /**
     * Create new Games Room with a new Game using dictionary from query string
     * @returns {Promise<Room>}
     */
    private createNewRoom(req: Request) {
        const { dictId } = req.query;
        assert.value(dictId, 'Query params required: dictId');
        return this.roomsService.createNewGame(Number(dictId));
    }

    private createNewGame(req: Request) {
        const { roomId } = req.params;
        const { gameId, dictId } = req.query;
        assert.value(dictId, 'Query params required: dictId, gameId');
        return this.roomsService.createNewGame(Number(dictId), { gameId: String(gameId), roomId });
    }

    private getGameStatus(req: Request) {
        const { roomId } = req.params;
        return this.roomsService.getRoom(roomId);
    }

    private uncoverAgent(req: Request) {
    }

    private commitCode(req: Request) {
    }
}
