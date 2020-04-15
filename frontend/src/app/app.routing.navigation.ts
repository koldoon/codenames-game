import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerType } from '../../../server/src/api/player_type';

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

    toGameBoard(gameId: string, playerType: PlayerType) {
        return this.router.navigate(['game', gameId, 'player', playerType, 'board']);
    }

    getJoinLink(gameId: string) {
        return `${window.location.origin}/game/${gameId}/join`;
    }

    toError(code: number) {
        return this.router.navigate(['error', code]);
    }
}
