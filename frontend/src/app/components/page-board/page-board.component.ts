import { Clipboard } from '@angular/cdk/clipboard';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { GameStatus } from '../../../../../server/src/api/game_status';
import { PlayerType } from '../../../../../server/src/api/player_type';
import { bindClass } from '../../../../../server/src/core/bind_class';
import { Agent } from '../../../../../server/src/model/agent';
import { AppRoutingNavigationService } from '../../app-routing-navigation.service';
import { GameService } from '../../services/game.service';
import { HttpLoadingStatusService } from '../../services/http-loading-status.service';
import { NewGameConfirmPopupComponent } from '../new-game-confirm-popup/new-game-confirm-popup.component';

@Component({
    selector: 'app-page-board',
    templateUrl: './page-board.component.html',
    styleUrls: ['./page-board.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBoardComponent implements OnInit, OnDestroy, AfterViewInit {
    constructor(
        public httpLoadingStatusService: HttpLoadingStatusService,
        public gameService: GameService,
        private navigation: AppRoutingNavigationService,
        private activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private clipboard: Clipboard,
        private dialog: MatDialog) {
        bindClass(this);
    }

    @ViewChild('container')
    boardView: ElementRef<HTMLDivElement>;
    cardFontSize = 0;

    game = <GameStatus> {
        blueLeft: 0,
        redLeft: 0,
        gameInChain: 0,
        log: [],
        move: {}
    };
    playersCount = 0;
    playerType = PlayerType.Regular;
    destroy$ = new Subject();

    ngOnInit(): void {
        this.activatedRoute.paramMap
            .subscribe(value => {
                this.playerType = Number(value.get('playerType'));
                this.gameService.joinGame(value.get('gameId'), this.playerType);
                this.cd.markForCheck();
            });

        this.gameService.game
            .pipe(
                takeUntil(this.destroy$),
                filter(value => value != null))
            .subscribe(value => {
                this.game = value;
                this.cd.markForCheck();
            });

        this.gameService.playersCount
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                this.playersCount = value;
                this.cd.markForCheck();
            })
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
        this.destroy$.next();
    }

    agentId(index: number, agent: Agent) {
        return agent.name;
    }

    onCopyGameLinkClick() {
        this.clipboard.copy(this.navigation.getJoinLink(this.gameService.gameId));
        this.snackBar.open('Ссылка скопирована в буфер обмена', 'Огонь!', { duration: 2000 });
    }

    onUncoverClick(index: number) {
        this.gameService.uncoverAgent(index);
    }

    onNewGameClick() {
        if (this.gameService.game.value.isFinished) {
            this.createNewLinkedGame();
        }
        else {
            const dialogRef = this.dialog.open(NewGameConfirmPopupComponent, {});
            dialogRef.afterClosed().subscribe(value => {
                if (value === 1)
                    this.createNewLinkedGame();
            });
        }
    }

    createNewLinkedGame() {
        this.navigation.toNewGame();
    }

    ngAfterViewInit(): void {
        this.onBoardResized();
    }

    @HostListener('window:resize')
    onBoardResized() {
        if (!this.boardView || !this.boardView.nativeElement)
            return;

        this.cardFontSize = (this.boardView.nativeElement.offsetWidth - 16 * 2 - 8 * 4) / 5 * 0.1;
        this.cd.detectChanges();
    }

    onHelpClick() {
        this.navigation.toRules();
    }
}
