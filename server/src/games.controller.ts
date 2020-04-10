import { Controller, Get, Param, Query } from '@nestjs/common';
import { GameStatusResponse } from './api/game_status_response';
import { PlayerType } from './api/player_type';
import { NewGameResponse } from './api/new_game_response';
import { UncoverAgentResponse } from './api/uncover_agent_response';
import { GamesService } from './games.service';

@Controller('api/games')
export class GamesController {
    constructor(private readonly gameService: GamesService) {}

    @Get('create')
    async createGame() {
        return <NewGameResponse> {
            gameId: await this.gameService.createNewGame()
        };
    }

    @Get(':gameId/status')
    async getGameStatus(
        @Param() p: { gameId: string },
        @Query() q: { player: PlayerType }) {

        return <GameStatusResponse> {
            game: await this.gameService.getGameStatus(p.gameId, q.player)
        }
    }

    @Get(':gameId/agents/:agentId/uncover')
    async uncoverAgent(
        @Param() params: { gameId: string, agentId: string }) {

        return <UncoverAgentResponse> {
            agent: await this.gameService.uncoverAgent(params.gameId, Number(params.agentId))
        }
    }
}
