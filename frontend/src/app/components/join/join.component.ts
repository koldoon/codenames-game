import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardType } from '../../types/board_type';
import { copyToClipboard } from '../../utils/copy_to_clipboard';

@Component({
    selector: 'app-join',
    templateUrl: './join.component.html',
    styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute) { }

    error = '';
    gameId = '';
    joinLink = '';
    joinLinkCopied = false;

    ngOnInit(): void {
        this.joinLink = window.location.href;
        this.activatedRoute.paramMap.subscribe(value => {
            this.gameId = value.get('gameId');
        });
    }

    onCopyLinkClick(event: MouseEvent) {
        event.preventDefault();
        copyToClipboard(this.joinLink);
        this.joinLinkCopied = true;
    }

    async onJoinAsCaptainClick() {
        await this.router.navigate(['codenames', 'game', this.gameId, 'board', BoardType.CAPTAINS]);
    }

    async onJoinAsTeammateClick() {
        await this.router.navigate(['codenames', 'game', this.gameId, 'board', BoardType.TEAMS]);
    }

    async onBackClick() {
        await this.router.navigate(['codenames', 'lobby']);
    }
}
