import { Application, json, NextFunction, Request, Response, Router } from 'express';
import { CommitCodeRequest } from '../api/http/commit_code_request';
import { CommitCodeResponse } from '../api/http/commit_code_response';
import { GameStatusResponse } from '../api/http/game_status_response';
import { NewGameResponse } from '../api/http/new_game_response';
import { UncoverAgentResponse } from '../api/http/uncover_agent_response';
import { bindClass } from '../core/bind_class';
import { OnApplicationInit } from '../core/on_application_init';
import { GamesService } from './games_service';

export class GamesController implements OnApplicationInit {
    constructor(
        private app: Application,
        private gamesService: GamesService) {

        bindClass(this);
    }

    init() {
        const router = Router()
            .get('/create', this.createGame)
            .get('/:gameId/status', this.getGameStatus)
            .post('/:gameId/agents/:agentId/uncover', this.uncoverAgent)
            .post('/:gameId/commit-code', json(), this.commitCode);

        this.app.use('/api/games', router);
    }

    createGame(req: Request, res: Response, next: NextFunction) {
        const { from } = req.query;
        this.gamesService.createNewGame(String(from))
            .then(gameId => res.json(<NewGameResponse> { gameId }))
            .catch(next);
    }

    getGameStatus(req: Request, res: Response, next: NextFunction) {
        const { gameId } = req.params;
        const { player } = req.query;
        this.gamesService.getGameStatus(gameId, Number(player))
            .then(game => res.json(<GameStatusResponse> { game }))
            .catch(next);
    }

    uncoverAgent(req: Request, res: Response, next: NextFunction) {
        const { gameId, agentId } = req.params;
        this.gamesService.uncoverAgent(gameId, Number(agentId))
            .then(agent => res.json(<UncoverAgentResponse> { agent }))
            .catch(next);
    }

    commitCode(req: Request, res: Response, next: NextFunction) {
        const { gameId } = req.params;
        const { message } = req.body as CommitCodeRequest;
        this.gamesService.commitCode(gameId, message)
            .then(turn => res.json(<CommitCodeResponse> { move: turn }))
            .catch(next);
    }
}
