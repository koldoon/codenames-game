import { Application, json, Request, Router } from 'express';
import { CommitCodeRequest } from '../../api/http/commit_code_request';
import { CommitCodeResponse } from '../../api/http/commit_code_response';
import { GameStatusResponse } from '../../api/http/game_status_response';
import { NewGameResponse } from '../../api/http/new_game_response';
import { UncoverAgentResponse } from '../../api/http/uncover_agent_response';
import { bindClass } from '../../core/bind_class';
import { asyncJson } from '../../core/express/async_json';
import { OnApplicationInit } from '../../core/on_application_init';
import { GamesService } from '../service/games_service';

/**
 * Controller ("Games" in this case) is responsible for the configuration
 * and mapping REST API input to internal application logic.
 */
export class GamesController implements OnApplicationInit {
    constructor(
        private app: Application,
        private gamesService: GamesService) {
        bindClass(this);
    }

    init() {
        this.app.use('/api/games', Router()
            .get('/create', asyncJson(this.createGame))
            .get('/:gameId/status', asyncJson(this.getGameStatus))
            .get('/:gameId/agents/:agentId/uncover', asyncJson(this.uncoverAgent))
            .post('/:gameId/commit-code', json(), asyncJson(this.commitCode))
        );
    }

    private async createGame(req: Request): Promise<NewGameResponse> {
        const { from, dict } = req.query;
        return {
            gameId: await this.gamesService.createNewGame(Number(dict) || 0, String(from))
        }
    }

    private async getGameStatus(req: Request): Promise<GameStatusResponse> {
        const { gameId } = req.params;
        const { player } = req.query;
        return {
            game: await this.gamesService.getGameStatus(gameId, Number(player))
        }
    }

    private async uncoverAgent(req: Request): Promise<UncoverAgentResponse> {
        const { gameId, agentId } = req.params;
        return {
            agent: await this.gamesService.uncoverAgent(gameId, Number(agentId))
        }
    }

    private async commitCode(req: Request): Promise<CommitCodeResponse> {
        const { gameId } = req.params;
        const { message } = req.body as CommitCodeRequest;
        return {
            move: await this.gamesService.commitCode(gameId, message)
        }
    }
}
