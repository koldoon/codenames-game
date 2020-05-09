import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, delay, distinct, retryWhen, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { GameStatus } from '../../../../server/src/api/game_status';
import { CommitCodeRequest } from '../../../../server/src/api/http/commit_code_request';
import { GameStatusResponse } from '../../../../server/src/api/http/game_status_response';
import { NewGameResponse } from '../../../../server/src/api/http/new_game_response';
import { UncoverAgentResponse } from '../../../../server/src/api/http/uncover_agent_response';
import { PlayerType } from '../../../../server/src/api/player_type';
import { JoinGameMessage, Message, MessageKind } from '../../../../server/src/api/ws/game_messages';
import { Side } from '../../../../server/src/model/agent_side';
import { GameEventKind } from '../../../../server/src/model/game_log_item';
import { AppRoutingNavigation } from '../app.routing.navigation';
import { cleanHttpParams } from '../utils/clean-http-params';
import { getWebSocketUrl } from '../utils/get-web-socket-url';

@Injectable()
export class GameService {
    constructor(
        private navigation: AppRoutingNavigation,
        private snackBar: MatSnackBar,
        private httpClient: HttpClient) {

        this.connected$
            .pipe(tap(() => this.isConnected = true))
            .subscribe(value => {
                this.getGameStatus();
                this.joinGameStream();
            });

        this.disconnected$
            .pipe(
                tap(() => this.isConnected = false),
                debounceTime(2000),
                distinct(value => this.isConnected))
            .subscribe(value => {
                if (!this.isConnected)
                    this.snackBar.open('Плохое соединение!', 'Твою ж мать!', { duration: 5000 })
            });

        this.gameStream$
            .pipe(retryWhen(errors => errors.pipe(delay(2000))))
            .subscribe(value => {
                this.onGameStreamMessage(value);
            });
    }

    gameId: string;
    game = new BehaviorSubject<GameStatus | undefined>(undefined);
    playerType: PlayerType;
    playersCount = new BehaviorSubject(0);

    private isConnected = false;
    private connected$ = new Subject<Event>();
    private disconnected$ = new Subject<Event>();
    private gameStream$ = webSocket<Message>({
        url: getWebSocketUrl('/api/stream'),
        openObserver: this.connected$,
        closeObserver: this.disconnected$
    });

    /**
     * Create new game and get its ID.
     */
    createNewGame(dictionaryIndex: number) {
        return this.httpClient
            .get<NewGameResponse>('/api/games/create', {
                params: cleanHttpParams({
                    from: this.gameId,
                    dict: dictionaryIndex.toString()
                })
            });
    }

    joinGame(gameId: string, playerType: PlayerType) {
        this.gameId = gameId;
        this.playerType = playerType;

        this.getGameStatus();
        this.joinGameStream();
    }

    sendHint(hint: string) {
        if (!this.gameId)
            return;

        this.httpClient
            .post(`/api/games/${this.gameId}/commit-code`, <CommitCodeRequest> {
                message: hint
            })
            .subscribe();
    }

    uncoverAgent(index: number) {
        const game = this.game.value;

        if (!game || game.board[index].side !== Side.UNKNOWN)
            return;

        this.httpClient
            .get<UncoverAgentResponse>(`/api/games/${this.gameId}/agents/${index}/uncover`)
            .subscribe(
                value => {
                    game.board[index] = { ...value.agent, uncovered: false };
                    this.game.next(game);
                },
                error => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.status === 400) {
                            this.snackBar.open('Не время раскрывать, ждем шифровку из Центра!', 'Так и быть', { duration: 5000 })
                        }
                        else {
                            this.snackBar.open('Ошибка: Что-то пошло не так', 'Тваю ж мать!')
                        }
                    }

                    return error;
                }
            );
    }

    private joinGameStream() {
        if (!this.gameId)
            return;

        this.gameStream$.next(<JoinGameMessage> {
            kind: MessageKind.JoinGame,
            gameId: this.gameId
        });
    }

    private onGameStreamMessage(msg: Message) {
        if (msg.kind === MessageKind.GameEvent) {
            const game = this.game.value;
            const event = msg.event;
            game.log.push(event);
            game.move = msg.move;

            if (event.kind === GameEventKind.AgentUncovered) {
                game.board[event.index] = {
                    ...game.board[event.index],
                    side: event.side,
                    uncovered: this.playerType === PlayerType.Spymaster
                };
            }
            else if (event.kind === GameEventKind.SpymasterHint) {
                // nothing
            }
            else if (event.kind === GameEventKind.GameFinished) {
                game.isFinished = true;
                this.onGameFinished();
            }

            game.blueLeft = msg.blueLeft;
            game.redLeft = msg.redLeft;

            this.game.next({ ...game });
        }
        else if (msg.kind === MessageKind.PlayerJoined || msg.kind === MessageKind.PlayerLeft) {
            this.playersCount.next(msg.playersCount);
        }
        else if (msg.kind === MessageKind.JoinGame) {
            this.navigation.toJoinGame(msg.gameId);
        }
    }

    private getGameStatus() {
        if (!this.gameId)
            return;

        this.httpClient
            .get<GameStatusResponse>(`/api/games/${this.gameId}/status?player=${this.playerType}`)
            .subscribe(
                value => {
                    this.game.next(value.game);
                    if (value.game.id !== this.gameId) // in case of games chain may differ
                        this.joinGame(value.game.id, this.playerType);

                    if (value.game.isFinished)
                        this.onGameFinished();
                },
                error => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.status === 404) {
                            this.navigation.toError(404);
                        }
                        else {
                            this.snackBar.open('Ошибка: Что-то пошло не так', 'Тваю ж мать!');
                        }
                    }
                }
            );
    }


    private onGameFinished() {
        this.snackBar.open('Игра завершена. Нажмите \'Новая игра\' чтобы продолжить в той же компании!', 'Супер!');
    }
}


