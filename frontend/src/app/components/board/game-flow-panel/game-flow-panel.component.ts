import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GameStatus } from '../../../../../../server/src/api/game_status';
import { PlayerType } from '../../../../../../server/src/api/player_type';
import { Side } from '../../../../../../server/src/model/agent_side';
import { GameEventKind } from '../../../../../../server/src/model/game_log_item';
import { PlayerSide } from '../../../../../../server/src/model/player_side';
import { GameService } from '../../../services/game.service';

export interface LogItem {
    text: string;
    side: Side;
    count?: number;
}

@Component({
    selector: 'app-game-flow-panel',
    templateUrl: './game-flow-panel.component.html',
    styleUrls: ['./game-flow-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameFlowPanelComponent {
    constructor(
        private gameService: GameService,
        private cd: ChangeDetectorRef) {
    }

    game: GameStatus;
    log: LogItem[][] = [];
    nextHintSide: PlayerSide = Side.RED;
    messageControl = new FormControl('');

    RED = Side.RED;
    BLUE = Side.BLUE;
    SPYMASTER = PlayerType.Spymaster;

    @Input('game') set setGame(value: GameStatus) {
        this.game = value;
        this.updateGameLog();
        this.nextHintSide = this.game.move.isInited
            ? this.getOppositeSide(this.game.move.side)
            : this.game.move.side;
    }

    @Input() playerType = PlayerType.Regular;

    logItemText(item: LogItem) {
        return item.text;
    }

    async onSendClick() {
        await this.gameService.sendHint(this.messageControl.value);

        this.messageControl.patchValue('');
        this.cd.markForCheck();
    }

    getOppositeSide(side: Side) {
        return side === Side.BLUE ? Side.RED : Side.BLUE;
    }

    updateGameLog() {
        this.log = [];
        if (!this.game)
            return;

        for (const item of this.game.log) {
            if (item.kind === GameEventKind.AgentUncovered) {
                this.log[0].push({
                    text: this.game.board[item.index].name,
                    side: item.side
                });
            }
            else if (item.kind === GameEventKind.SpymasterHint) {
                this.log.unshift([{
                    text: item.hint,
                    side: item.side,
                    count: item.count
                }]);
            }
        }
    }
}
