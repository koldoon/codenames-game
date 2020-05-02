import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, interval } from 'rxjs';
import { debounce, finalize } from 'rxjs/operators';
import { DictionaryDescription } from '../../../../../server/src/api/dictionary_description';
import { DictionariesIndexResponse } from '../../../../../server/src/api/http/dictionaries_index_response';
import { NewGameResponse } from '../../../../../server/src/api/http/new_game_response';
import { AppRoutingNavigation } from '../../app.routing.navigation';

@Component({
    selector: 'app-page-dictionaries',
    templateUrl: './page-new-game.component.html',
    styleUrls: ['./page-new-game.component.scss']
})
export class PageNewGameComponent implements OnInit {
    constructor(
        private httpClient: HttpClient,
        private cd: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private navigation: AppRoutingNavigation,
        private location: Location,
        private activatedRoute: ActivatedRoute) {

        this.inProgress$ = new BehaviorSubject(false);
        this.inProgress$.pipe(debounce(() => interval(1000)));
    }

    inProgress$: BehaviorSubject<boolean>;
    dictionaries: DictionaryDescription[] = [];
    previousGameId = '';

    ngOnInit(): void {
        this.activatedRoute.queryParamMap.subscribe(value => {
            this.previousGameId = value.get('previousGameId');
        });

        this.inProgress$.next(true);
        this.httpClient
            .get<DictionariesIndexResponse>('/api/dictionaries/index')
            .pipe(finalize(() => this.inProgress$.next(false)))
            .subscribe(value => {
                this.dictionaries = value.dictionaries;
                this.cd.markForCheck();
            });
    }

    onDictionarySelect(index: number) {
        this.inProgress$.next(true);
        this.httpClient
            .get<NewGameResponse>(`/api/games/create?dict=${index}&from=${this.previousGameId}`)
            .pipe(finalize(() => this.inProgress$.next(false)))
            .subscribe(
                value => this.navigation.toJoinGame(value.gameId),
                error => this.snackBar.open('Что-то пошло не так...', 'Тваю ж мать!', { duration: 5000 })
            );
    }

    onBackClick() {
        this.location.back();
    }
}
