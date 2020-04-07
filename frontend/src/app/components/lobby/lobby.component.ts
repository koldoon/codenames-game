import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NewGameResponse } from '../../../../../server/src/api/new_game_response';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {
    constructor(
        private httpClient: HttpClient,
        private router: Router) { }

    inProgress = false;
    error = '';

    async onCreateGameClick() {
        this.inProgress = true;
        this.httpClient
            .get<NewGameResponse>(`/api/games/create`)
            .subscribe(
                value => this.router.navigate(['codenames', 'game', value.gameId, 'join']),
                error => this.error = error
            );
    }
}
