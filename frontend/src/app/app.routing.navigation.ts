import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BoardVariant } from './types/board_variant';

/**
 * To simplify refactoring and reusing different application
 * navigation routes, all the routes formatting in one place.
 */
@Injectable()
export class AppRoutingNavigation {
    constructor(private router: Router) {}

    toStart() {
        return this.router.navigate(['start']);
    }

    toJoinGame(gameId: string) {
        return this.router.navigate(['game', gameId, 'join']);
    }

    toGameBoard(gameId: string, board: BoardVariant) {
        return this.router.navigate(['game', gameId, 'board', board]);
    }

    getJoinLink(gameId: string) {
        return `${window.location.origin}/game/${gameId}/join`;
    }
}
