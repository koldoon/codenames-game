import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameBoardResponse } from '../../../../../server/src/api/game_board_response';
import { UncoverAgentResponse } from '../../../../../server/src/api/uncover_agent_response';
import { AgentModel, AgentSide } from '../../../../../server/src/model/agent_model';
import { GameBoard } from '../../../../../server/src/model/game_board_type';
import { BoardType } from '../../types/board_type';
import { copyToClipboard } from '../../utils/copy_to_clipboard';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit, OnDestroy {
    constructor(
        private httpClient: HttpClient,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef) { }

    error = '';
    boardType: BoardType = BoardType.TEAMS;
    bluesLeft = 0;
    redsLeft = 0;
    gameId = '';
    board: GameBoard = [];
    polingTimer = 0;
    updateInProgress = false;


    ngOnInit(): void {
        for (let i = 0; i < 25; i++)
            this.board.push(new AgentModel('', AgentSide.UNKNOWN));

        this.activatedRoute.paramMap.subscribe(value => {
            this.gameId = value.get('gameId');
            this.boardType = value.get('board') as BoardType;
            this.getBoard();
            this.polingTimer = setInterval(() => this.getBoard(), 2000);
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.polingTimer);
    }

    agentId(agent: AgentModel) {
        return `${agent.name}-${agent.side}-${agent.uncovered}`;
    }

    getBoard() {
        if (this.updateInProgress)
            return;

        const url = this.boardType === BoardType.CAPTAINS
            ? `/api/games/${this.gameId}/private-board`
            : `/api/games/${this.gameId}/public-board`;

        this.updateInProgress = true;
        this.httpClient
            .get<GameBoardResponse>(url)
            .subscribe(
                value => {
                    this.board = value.board;
                    this.redsLeft = 0;
                    this.bluesLeft = 0;
                    for (const agent of this.board) {
                        if (!agent.uncovered && agent.side === AgentSide.BLUE)
                            this.bluesLeft += 1;

                        if (!agent.uncovered && agent.side === AgentSide.RED)
                            this.redsLeft += 1;
                    }
                },
                error => this.error = error,
                () => {
                    this.updateInProgress = false;
                    this.changeDetector.markForCheck();
                }
            );
    }

    uncoverAgent(index: number) {
        if (this.board[index].side !== AgentSide.UNKNOWN)
            return;

        this.httpClient
            .get<UncoverAgentResponse>(`/api/games/${this.gameId}/agents/${index}/uncover`)
            .subscribe(
                value => this.board[index] = { ...value.agent, uncovered: false },
                error => this.error = error,
                () => this.changeDetector.markForCheck()
            );
    }

    onCopyGameLinkClick(event: MouseEvent) {
        event.preventDefault();
        copyToClipboard(`${window.location.origin}/codenames/game/${this.gameId}/join`);
    }
}
