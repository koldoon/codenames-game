import { Application, json, Request } from 'express';
import { CommitCodeRequest } from '../api/http/commit_code_request';
import { CommitCodeResponse } from '../api/http/commit_code_response';
import { GameStatusResponse } from '../api/http/game_status_response';
import { NewGameResponse } from '../api/http/new_game_response';
import { UncoverAgentResponse } from '../api/http/uncover_agent_response';
import { bindClass } from '../core/bind_class';
import { defineNestedRoutes } from '../core/define_nested_routes';
import { async } from '../core/express_async';
import { OnApplicationInit } from '../core/on_application_init';
import { GamesService } from './games_service';

export class GamesController implements OnApplicationInit {
    constructor(
        private app: Application,
        private gamesService: GamesService) {

        bindClass(this);
    }

    init() {
        defineNestedRoutes('/api/games', this.app)
            .get('/create', async(this.createGame))
            .get('/:gameId/status', async(this.getGameStatus))
            .post('/:gameId/agents/:agentId/uncover', async(this.uncoverAgent))
            .post('/:gameId/commit-code', json(), async(this.commitCode));
    }

    async createGame(req: Request): Promise<NewGameResponse> {
        const { from } = req.query;
        return {
            gameId: await this.gamesService.createNewGame(String(from))
        }
    }

    async getGameStatus(req: Request): Promise<GameStatusResponse> {
        const { gameId } = req.params;
        const { player } = req.query;
        return {
            game: await this.gamesService.getGameStatus(gameId, Number(player))
        }
    }

    async uncoverAgent(req: Request): Promise<UncoverAgentResponse> {
        const { gameId, agentId } = req.params;
        return {
            agent: await this.gamesService.uncoverAgent(gameId, Number(agentId))
        }
    }

    async commitCode(req: Request): Promise<CommitCodeResponse> {
        const { gameId } = req.params;
        const { message } = req.body as CommitCodeRequest;
        return {
            move: await this.gamesService.commitCode(gameId, message)
        }
    }
}
