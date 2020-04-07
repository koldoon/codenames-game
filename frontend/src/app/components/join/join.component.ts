import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardType } from '../../types/board_type';

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
        this.copyToClipboard(this.joinLink);
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

    copyToClipboard(str: string) {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const selected = document.getSelection().rangeCount > 0
            ? document.getSelection().getRangeAt(0)
            : false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }
    }
}
