import { Application, NextFunction, Request, Response, Router } from 'express';
import { GameStatusResponse } from '../api/game_status_response';
import { NewGameResponse } from '../api/new_game_response';
import { UncoverAgentResponse } from '../api/uncover_agent_response';
import { bindClass } from '../core/bind_class';
import { OnApplicationInit } from '../core/on_application_init';
import { GamesService } from './games_service';

export class GamesController implements OnApplicationInit {
    private router = Router();

    constructor(private app: Application, private gamesService: GamesService) {
        bindClass(this);
    }

    init() {
        this.router
            .get('/create', this.createGame)
            .get('/:gameId/status', this.getGameStatus)
            .get('/:gameId/agents/:agentId/uncover', this.uncoverAgent);

        this.app.use('/api/games', this.router);
    }

    createGame(req: Request, res: Response, next: NextFunction) {
        this.gamesService.createNewGame()
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
}
