import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DictionaryDescription } from '../../../../../server/src/api/dictionary_description';
import { AppRoutingNavigation } from '../../app.routing.navigation';
import { DictionariesService } from '../../services/dictionaries.service';
import { GameService } from '../../services/game.service';

@Component({
    selector: 'app-page-dictionaries',
    templateUrl: './page-new-game.component.html',
    styleUrls: ['./page-new-game.component.scss']
})
export class PageNewGameComponent implements OnInit {
    constructor(
        private dictionariesService: DictionariesService,
        private snackBar: MatSnackBar,
        private navigation: AppRoutingNavigation,
        private location: Location,
        private gamesService: GameService) {
    }

    dictionaries: DictionaryDescription[] = [];

    ngOnInit(): void {
        this.dictionaries = this.dictionariesService.dictionaries;
    }

    onDictionarySelect(index: number) {
        this.gamesService.createNewGame(index).subscribe(
            value => this.navigation.toJoinGame(value.gameId),
            error => this.snackBar.open('Что-то пошло не так...', 'Тваю ж мать!', { duration: 5000 })
        );
    }

    onBackClick() {
        this.location.back();
    }
}
