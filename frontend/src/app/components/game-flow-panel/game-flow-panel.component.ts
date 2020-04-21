import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CommitCodeRequest } from '../../../../../server/src/api/http/commit_code_request';
import { PlayerType } from '../../../../../server/src/api/player_type';
import { Side } from '../../../../../server/src/model/agent_side';

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
        private httpClient: HttpClient,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef) {

        this.form = fb.group({ message: '' });
    }

    RED = Side.RED;
    BLUE = Side.BLUE;
    SPYMASTER = PlayerType.Spymaster;

    @Input() gameFlowLog$ = new BehaviorSubject<LogItem[][]>([]);
    @Input() moveSide: Side = Side.RED;
    @Input() gameId = '';
    @Input() playerType = PlayerType.Regular;

    form: FormGroup;

    logItemText(item: LogItem) {
        return item.text;
    }

    async onSendClick() {
        await this.httpClient.post(`/api/games/${this.gameId}/commit-code`, <CommitCodeRequest> {
            message: this.form.controls.message.value
        }).toPromise();

        this.form.controls.message.patchValue('');
        this.moveSide = this.moveSide === Side.RED ? Side.BLUE : Side.RED;
        this.cd.markForCheck();
    }
}
