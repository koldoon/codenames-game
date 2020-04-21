import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Side } from '../../../../../server/src/model/agent_side';
import { LogItem } from '../game-flow-panel/game-flow-panel.component';

@Component({
    selector: 'app-log-item',
    templateUrl: './log-item.component.html',
    styleUrls: ['./log-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogItemComponent {
    RED = Side.RED;
    BLUE = Side.BLUE;
    ASSASSIN = Side.ASSASSIN;
    NEUTRAL = Side.NEUTRAL;

    @Input() logItem: LogItem;
    @Input() isHint = false;
}
