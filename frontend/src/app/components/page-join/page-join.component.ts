import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PlayerType } from '../../../../../server/src/api/player_type';
import { AppRoutingNavigationService } from '../../app-routing-navigation.service';

@Component({
    selector: 'app-page-join',
    templateUrl: './page-join.component.html',
    styleUrls: ['./page-join.component.scss']
})
export class PageJoinComponent implements OnInit {
    constructor(
        private navigation: AppRoutingNavigationService,
        private activatedRoute: ActivatedRoute,
        private snackBar: MatSnackBar,
        private location: Location,
        private clipboard: Clipboard) { }

    gameId = '';

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(value => {
            this.gameId = value.get('gameId');
        });
    }

    async onCopyLinkClick(event: MouseEvent) {
        event.preventDefault();
        await this.clipboard.copy(this.navigation.getJoinLink(this.gameId));
        this.snackBar.open('Ссылка скопирована в буфер обмена.', 'Огонь!', {
            horizontalPosition: 'center',
            duration: 3000
        });
    }

    onJoinAsCaptainClick() {
        this.navigation.toGameBoard(this.gameId, PlayerType.Spymaster);
    }

    onJoinAsTeammateClick() {
        this.navigation.toGameBoard(this.gameId, PlayerType.Regular);
    }

    onBackClick() {
        this.location.back();
    }
}
