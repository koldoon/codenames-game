import { Controller, Get, Param } from '@nestjs/common';
import { GameBoardResponse } from './api/game_board_response';
import { NewGameResponse } from './api/new_game_response';
import { UncoverAgentResponse } from './api/uncover_agent_response';
import { GamesService } from './games.service';

@Controller('api/games')
export class GamesController {
    constructor(private readonly gameService: GamesService) {}

    @Get('create')
    async createGame() {
        return <NewGameResponse> {
            gameId: await this.gameService.createGame()
        };
    }

    @Get(':gameId/public-board')
    async getPublicBoard(@Param('gameId') gameId: string) {
        return <GameBoardResponse> {
            board: await this.gameService.getPublicBoard(gameId)
        };
    }

    @Get(':gameId/private-board')
    async getPrivateBoard(@Param('gameId') gameId: string) {
        return <GameBoardResponse> {
            board: await this.gameService.getPrivateBoard(gameId)
        };
    }

    @Get(':gameId/agents/:agentId/uncover')
    async uncoverAgent(@Param('gameId') gameId: string, @Param('agentId') agentId: string) {
        return <UncoverAgentResponse> {
            agent: await this.gameService.uncoverAgent(gameId, Number(agentId))
        };
    }
}
