import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DictionaryDescription } from '../../../../../server/src/api/dictionary_description';
import { AppRoutingNavigation } from '../../app.routing.navigation';
import { DictionariesService } from '../../services/dictionaries.service';
import { GamesService } from '../../services/games.service';

@Component({
    selector: 'app-page-dictionaries',
    templateUrl: './page-new-game.component.html',
    styleUrls: ['./page-new-game.component.scss']
})
export class PageNewGameComponent implements OnInit {
    constructor(
        private dictionariesService: DictionariesService,
        private httpClient: HttpClient,
        private cd: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private navigation: AppRoutingNavigation,
        private location: Location,
        private gamesService: GamesService,
        private activatedRoute: ActivatedRoute) {
    }

    dictionaries: DictionaryDescription[] = [];
    previousGameId = '';

    ngOnInit(): void {
        this.activatedRoute.queryParamMap.subscribe(value => {
            this.previousGameId = value.get('previousGameId');
        });

        this.dictionaries = this.dictionariesService.dictionaries;
    }

    onDictionarySelect(index: number) {
        this.gamesService.createNewGame(index, this.previousGameId).subscribe(
            value => this.navigation.toJoinGame(value.gameId),
            error => this.snackBar.open('Что-то пошло не так...', 'Тваю ж мать!', { duration: 5000 })
        );
    }

    onBackClick() {
        this.location.back();
    }
}
