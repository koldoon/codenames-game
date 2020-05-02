import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { delay, finalize, retryWhen, takeUntil } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { GameStatus } from '../../../../../server/src/api/game_status';
import { GameStatusResponse } from '../../../../../server/src/api/http/game_status_response';
import { NewGameResponse } from '../../../../../server/src/api/http/new_game_response';
import { UncoverAgentResponse } from '../../../../../server/src/api/http/uncover_agent_response';
import { PlayerType } from '../../../../../server/src/api/player_type';
import { JoinGameMessage, Message, MessageKind, PingMessage } from '../../../../../server/src/api/ws/game_messages';
import { Agent } from '../../../../../server/src/model/agent';
import { Side } from '../../../../../server/src/model/agent_side';
import { GameEventKind } from '../../../../../server/src/model/game_log_item';
import { AppRoutingNavigation } from '../../app.routing.navigation';
import { getWebSocketUrl } from '../../utils/get_web_socket_url';
import { NewGameConfirmPopupComponent } from '../new-game-confirm-popup/new-game-confirm-popup.component';
import { LogItem } from '../game-flow-panel/game-flow-panel.component';

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

    cardFontSize = 0;
    playerType = PlayerType.Regular;
    gameId = '';
    game = <GameStatus> {
        board: Array(25).fill(<Agent> { name: '' })
    };

    playersCount = 0;
    gameFlowLog$ = new BehaviorSubject<LogItem[][]>([[]]);

    loadingInProgress = false;
    uncoveringInProgress = new Set<number>();

    destroy$ = new ReplaySubject(1);
    connected$ = new Subject<Event>();
    disconnected$ = new Subject<Event>();
    gameStream$ = webSocket<Message>({
        url: getWebSocketUrl('/api/stream'),
        openObserver: this.connected$,
        closeObserver: this.disconnected$
    });

    ngOnInit(): void {
        let connected = false;

        this.gameStream$
            .pipe(
                takeUntil(this.destroy$),
                retryWhen(errors => errors.pipe(delay(2000)))
            )
            .subscribe(msg => {
                this.onGameStreamMessage(msg)
            });

        this.activatedRoute.paramMap
            .subscribe(value => {
                this.gameId = value.get('gameId');
                this.playerType = Number(value.get('playerType'));
                this.updateGameStatus();

                if (connected) // not to send 'join' twice
                    this.joinGameStream();
            });

        this.connected$
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                connected = true;
                this.updateGameStatus();
                this.joinGameStream();
            });

        this.disconnected$
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                this.snackBar.open('Плохое соединение.', 'Твою ж мать!', { duration: 1500 })
            });
    }

    joinGameStream() {
        if (!this.gameId)
            return;

        this.gameStream$.next(<JoinGameMessage> {
            kind: MessageKind.JoinGame,
            gameId: this.gameId
        });
    }

    async onGameStreamMessage(msg: Message) {
        if (msg.kind === MessageKind.GameEvent) {
            const event = msg.event;
            const log = this.gameFlowLog$.value;

            if (event.kind === GameEventKind.AgentUncovered) {
                this.game.board[event.index] = {
                    ...this.game.board[event.index],
                    side: event.side,
                    uncovered: this.playerType === PlayerType.Spymaster
                };
                log[0].push({
                    side: event.side,
                    text: this.game.board[event.index].name
                });
                this.uncoveringInProgress.delete(event.index);
            }
            else if (event.kind === GameEventKind.SpymasterHint) {
                log.unshift([{
                    side: event.side,
                    count: event.matchCount,
                    text: event.hint
                }]);
            }
            else if (event.kind === GameEventKind.GameFinished) {
                this.game.isFinished = true;
            }

            this.gameFlowLog$.next(log);
            this.game.blueLeft = msg.blueLeft;
            this.game.redLeft = msg.redLeft;
        }
        else if (msg.kind === MessageKind.PlayerJoined || msg.kind === MessageKind.PlayerLeft) {
            this.playersCount = msg.playersCount;
        }
        else if (msg.kind === MessageKind.JoinGame) {
            await this.navigation.toJoinGame(msg.gameId);
        }
        this.cd.markForCheck();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    agentId(index: number, agent: Agent) {
        return `${index}-${agent.name}`;
    }


    getOppositeSide(side: Side) {
        return side === Side.BLUE ? Side.RED : Side.BLUE;
    }

    updateGameStatus() {
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
                    const log: LogItem[][] = [];
                    this.game.log.forEach(item => {
                        if (item.kind === GameEventKind.AgentUncovered) {
                            log[0].push({
                                text: this.game.board[item.index].name,
                                side: item.side
                            });
                        }
                        else if (item.kind === GameEventKind.SpymasterHint) {
                            log.unshift([{
                                text: item.hint,
                                side: item.side,
                                count: item.matchCount
                            }]);
                        }
                    });
                    this.gameFlowLog$.next(log);

                    if (this.gameId !== this.game.id) { // in case of games chain may differ
                        this.gameId = this.game.id;
                        this.gameStream$.next(<JoinGameMessage> {
                            kind: MessageKind.JoinGame,
                            gameId: this.gameId
                        });
                    }
                },
                error => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.status === 404) {
                            this.navigation.toError(404);
                        }
                        else {
                            this.snackBar.open('Что-то пошло не так...', 'Тваю ж мать!');
                        }
                    }
                }
            );
    }

    uncoverAgent(index: number) {
        if (this.game.board[index].side !== Side.UNKNOWN)
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
                        if (error.status === 400){
                            this.snackBar.open('Не время раскрывать!', 'Так и быть', { duration: 5000 })
                        }
                        else  {
                            this.snackBar.open('Что-то пошло не так...', 'Тваю ж мать!', { duration: 5000 })
                        }
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
            const dialogRef = this.dialog.open(NewGameConfirmPopupComponent, {});
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
        this.gameStream$.next(<PingMessage> {
            kind: MessageKind.Ping
        });
    }

    ngAfterViewInit(): void {
        this.onBoardResized();
    }

    @HostListener('window:resize')
    onBoardResized() {
        this.cardFontSize = (this.boardView.nativeElement.offsetWidth - 16 * 2 - 8 * 4) / 5 * 0.1;
        this.cd.detectChanges();
    }
}
