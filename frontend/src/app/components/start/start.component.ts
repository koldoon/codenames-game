import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NewGameResponse } from '../../../../../server/src/api/http/new_game_response';
import { AppRoutingNavigation } from '../../app.routing.navigation';

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartComponent {
    constructor(
        private httpClient: HttpClient,
        private navigation: AppRoutingNavigation,
        private cd: ChangeDetectorRef) { }

    inProgress = false;
    error = '';

    async onCreateGameClick() {
        this.inProgress = true;
        this.cd.markForCheck();

        this.httpClient
            .get<NewGameResponse>(`/api/games/create`)
            .subscribe(
                value => this.navigation.toJoinGame(value.gameId),
                error => this.error = JSON.stringify(error),
                () => this.cd.markForCheck()
            );
    }
}
