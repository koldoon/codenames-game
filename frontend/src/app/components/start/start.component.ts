import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
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
        private snackBar: MatSnackBar,
        private cd: ChangeDetectorRef) { }

    inProgress = false;
    error = '';

    async onCreateGameClick() {
        this.inProgress = true;
        this.cd.markForCheck();

        this.httpClient
            .get<NewGameResponse>(`/api/games/create`)
            .pipe(
                finalize(() => {
                    this.inProgress = false;
                    this.cd.markForCheck();
                })
            )
            .subscribe(
                value => this.navigation.toJoinGame(value.gameId),
                error => this.snackBar.open('Что-то с соединением пошло не так...', 'Тваю ж мать!', { duration: 5000 })
            );
    }
}
