import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NewGameResponse } from '../../../../../server/src/api/new_game_response';

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartComponent {
    constructor(
        private httpClient: HttpClient,
        private router: Router,
        private cd: ChangeDetectorRef) { }

    inProgress = false;
    error = '';

    async onCreateGameClick() {
        this.inProgress = true;
        this.cd.markForCheck();

        this.httpClient
            .get<NewGameResponse>(`/api/games/create`)
            .subscribe(
                value => this.router.navigate(['game', value.gameId, 'join']),
                error => this.error = JSON.stringify(error),
                () => this.cd.markForCheck()
            );
    }
}
