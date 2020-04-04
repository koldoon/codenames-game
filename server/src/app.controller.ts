import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('api/games')
export class AppController {
    constructor(private readonly gameService: GameService) {}

    @Get('create')
    async createGame() {
        return this.gameService.createGame();
    }

    @Get(':gameId/public-board')
    async getPublicBoard(@Param('gameId') gameId: string) {
        return this.gameService.getPublicBoard(gameId);
    }

    @Get(':gameId/private-board')
    async getPrivateBoard(@Param('gameId') gameId: string) {
        return this.gameService.getPrivateBoard(gameId);
    }

    @Get(':gameId/agents/:agentId/uncover')
    async uncoverAgent(@Param('gameId') gameId: string, @Param('agentId') agentId: string) {
        return this.gameService.uncoverAgent(gameId, Number(agentId));
    }
}
