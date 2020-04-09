import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardVariant } from '../../types/board_variant';
import { copyToClipboard } from '../../utils/copy_to_clipboard';

@Component({
    selector: 'app-join',
    templateUrl: './join.component.html',
    styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private snackBar: MatSnackBar) { }

    gameId = '';
    joinLink = '';

    ngOnInit(): void {
        this.joinLink = window.location.href;
        this.activatedRoute.paramMap.subscribe(value => {
            this.gameId = value.get('gameId');
        });
    }

    onCopyLinkClick(event: MouseEvent) {
        event.preventDefault();
        copyToClipboard(this.joinLink);
        this.snackBar.open('Ссылка скопирована в буфер обмена.', 'Огонь!', {
            horizontalPosition: 'center',
            duration: 3000
        });
    }

    async onJoinAsCaptainClick() {
        await this.router.navigate(['game', this.gameId, 'board', BoardVariant.CAPTAINS]);
    }

    async onJoinAsTeammateClick() {
        await this.router.navigate(['game', this.gameId, 'board', BoardVariant.TEAMS]);
    }

    async onBackClick() {
        await this.router.navigate(['lobby']);
    }
}
