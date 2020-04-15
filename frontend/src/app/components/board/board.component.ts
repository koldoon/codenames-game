import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, finalize, retryWhen } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { GameStatus } from '../../../../../server/src/api/game_status';
import { Agent } from '../../../../../server/src/model/agent';
import { AgentSide } from '../../../../../server/src/model/agent_side';
import { GameStatusResponse } from '../../../../../server/src/api/http/game_status_response';
import { NewGameResponse } from '../../../../../server/src/api/http/new_game_response';
import { UncoverAgentResponse } from '../../../../../server/src/api/http/uncover_agent_response';
import { PlayerType } from '../../../../../server/src/api/player_type';
import { GameMessage, GameMessageKind, JoinGameMessage, PingGameMessage } from '../../../../../server/src/api/ws/game_messages';
import { AppRoutingNavigation } from '../../app.routing.navigation';
import { getWebSocketUrl } from '../../utils/get_web_socket_url';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {
    constructor(
        private httpClient: HttpClient,
        private navigation: AppRoutingNavigation,
        private activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private clipboard: Clipboard,
        private dialog: MatDialog) { }

    @ViewChild('container')
    boardView: ElementRef<HTMLDivElement>;

    cardFontSize = 12;
    playerType = PlayerType.Regular;
    gameId = '';
    game: GameStatus;
    playersCount = 0;

    loadingInProgress = false;
    uncoveringInProgress = new Set<number>();

    connected$ = new Subject<Event>();
    gameStream$ = webSocket<GameMessage>({
        url: getWebSocketUrl('/api/stream'),
        openObserver: this.connected$
    });

    ngOnInit(): void {
        let connected = false;

        this.gameStream$
            .pipe(retryWhen(errors => {
                this.updateGameStatus();
                return errors.pipe(delay(2000));
            }))
            .subscribe(msg => this.onGameStreamMessage(msg));

        this.activatedRoute.paramMap.subscribe(value => {
            this.gameId = value.get('gameId');
            this.playerType = Number(value.get('playerType'));
            this.updateGameStatus();

            if (connected) // not to send 'join' twice
                this.joinGameStream();
        });

        this.connected$.subscribe(value => {
            connected = true;
            this.joinGameStream();
        });
    }

    joinGameStream() {
        if (!this.gameId)
            return;

        this.gameStream$.next(<JoinGameMessage> {
            kind: GameMessageKind.JoinGame,
            gameId: this.gameId
        });
    }

    async onGameStreamMessage(msg: GameMessage) {
        if (msg.kind === GameMessageKind.AgentUncovered) {
            this.game.board[msg.agent.index] = {
                ...msg.agent,
                uncovered: msg.agent.uncovered && this.playerType === PlayerType.Captain
            };
            this.game.bluesLeft = msg.bluesLeft;
            this.game.redsLeft = msg.redsLeft;
            this.game.isFinished = msg.isFinished;
            this.uncoveringInProgress.delete(msg.agent.index);
        }
        else if (msg.kind === GameMessageKind.PlayerJoined || msg.kind === GameMessageKind.PlayerLeft) {
            this.playersCount = msg.playersCount;
        }
        else if (msg.kind === GameMessageKind.JoinGame) {
            await this.navigation.toJoinGame(msg.gameId);
        }
        this.cd.markForCheck();
    }

    ngOnDestroy(): void {
        this.gameStream$.unsubscribe();
    }

    agentId(index: number, agent: Agent) {
        return `${index}-${agent.name}`;
    }

    updateGameStatus() {
        if (this.loadingInProgress)
            return;

        this.loadingInProgress = true;
        this.cd.markForCheck();

        this.httpClient
            .get<GameStatusResponse>(`/api/games/${this.gameId}/status?player=${this.playerType}`)
            .pipe(finalize(() => {
                this.loadingInProgress = false;
                this.uncoveringInProgress.clear();
                this.cd.markForCheck();
            }))
            .subscribe(
                value => {
                    this.game = value.game;
                    if (this.gameId !== this.game.id) { // in case of games chain may differ
                        this.gameId = this.game.id;
                        this.gameStream$.next(<JoinGameMessage> {
                            kind: GameMessageKind.JoinGame,
                            gameId: this.gameId
                        });
                    }
                },
                error => {
                    if (error instanceof HttpErrorResponse)
                        this.navigation.toError(error.status);
                }
            );
    }

    uncoverAgent(index: number) {
        if (this.game.board[index].side !== AgentSide.UNKNOWN)
            return;

        this.uncoveringInProgress.add(index);
        this.cd.markForCheck();

        this.httpClient
            .post<UncoverAgentResponse>(`/api/games/${this.gameId}/agents/${index}/uncover`, {})
            .pipe(finalize(() => {
                this.uncoveringInProgress.delete(index);
                this.cd.markForCheck();
            }))
            .subscribe(
                value => this.game.board[index] = { ...value.agent, uncovered: false },
                error => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.status !== 400)
                            this.snackBar.open('Что-то пошло не так... :(', 'Блять!', { duration: 5000 })
                    }

                    return error;
                }
            );
    }

    async onCopyGameLinkClick() {
        await this.clipboard.copy(this.navigation.getJoinLink(this.gameId));
        this.snackBar.open('Ссылка скопирована в буфер обмена.', 'Огонь!', {
            horizontalPosition: 'center',
            duration: 3000
        });
    }

    async onCodenamesClick() {
        await this.navigation.toStart();
    }

    async onNewGameClick() {
        if (this.game.isFinished) {
            this.createNewLinkedGame();
        }
        else {
            const dialogRef = this.dialog.open(ConfirmComponent, {});
            dialogRef.afterClosed().subscribe(async value => {
                if (value === 1)
                    this.createNewLinkedGame();
            });
        }
    }

    async createNewLinkedGame() {
        await this.httpClient
            .get<NewGameResponse>(`/api/games/create?from=${this.gameId}`)
            .toPromise();
    }

    onRefreshClick() {
        this.updateGameStatus();
        this.gameStream$.next(<PingGameMessage> {
            kind: GameMessageKind.Ping
        });
    }

    ngAfterViewInit(): void {
        this.onBoardResized();
    }

    @HostListener('window:resize', ['$event'])
    onBoardResized() {
        this.cardFontSize = (this.boardView.nativeElement.offsetWidth - 16 * 2 - 8 * 4) / 5 * 0.1;
    }
}
