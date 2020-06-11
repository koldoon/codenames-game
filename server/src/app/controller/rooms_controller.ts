import { Application, json, Request, Router } from 'express';
import { CommitCodeRequest } from '../../api/http/commit_code_request';
import { CommitCodeResponse } from '../../api/http/commit_code_response';
import { RoomIdResponse } from '../../api/http/room_id_response';
import { RoomResponse } from '../../api/http/room_response';
import { UncoverAgentResponse } from '../../api/http/uncover_agent_response';
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
            .get('/:roomId', asyncJson(this.getRoom))
            .get('/:roomId/new-game', asyncJson(this.createNewGame))
            .get('/:roomId/game/agents/:agentId/uncover', asyncJson(this.uncoverAgent))
            .post('/:roomId/game/commit-code', json(), asyncJson(this.commitCode))
        );
    }

    /**
     * Create new Games Room with a new Game using dictionary from query string
     * @returns {Promise<Room>}
     */
    private async createNewRoom(req: Request): Promise<RoomIdResponse> {
        const { dictId } = req.query;
        assert.value(dictId, 'Query params required: dictId');

        return {
            roomId: await this.roomsService.createNewGame(Number(dictId))
        };
    }

    private async createNewGame(req: Request): Promise<RoomIdResponse> {
        const { roomId } = req.params;
        const { gameId, dictId } = req.query;
        assert.value(dictId, 'Query params required: dictId, gameId');

        return {
            roomId: await this.roomsService.createNewGame(Number(dictId), {
                gameId: String(gameId),
                roomId
            })
        };
    }

    private async getRoom(req: Request): Promise<RoomResponse> {
        const { roomId } = req.params;
        const { player } = req.query;
        return {
            room: await this.roomsService.getRoom(roomId, Number(player))
        };
    }

    private async uncoverAgent(req: Request): Promise<UncoverAgentResponse> {
        const { roomId, agentId } = req.params;
        return {
            agent: await this.roomsService.uncoverAgent(roomId, Number(agentId))
        };
    }

    private async commitCode(req: Request): Promise<CommitCodeResponse> {
        const { roomId } = req.params;
        const { message } = req.body as CommitCodeRequest;
        return {
            move: await this.roomsService.commitCode(roomId, message)
        };
    }
}
