import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Side } from '../../../../../../server/src/model/agent_side';

@Component({
    selector: 'app-agent-card',
    templateUrl: './agent-card.component.html',
    styleUrls: ['./agent-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentCardComponent {
    @Input() name = '';
    @Input() side = Side.UNKNOWN;
    @Input() uncovered = false;
    @Input() uncoveringInProgress: number | boolean = false;
    @Input() fontSize = 0;

    BLUE = Side.BLUE;
    RED = Side.RED;
    NEUTRAL = Side.NEUTRAL;
    BLACK = Side.ASSASSIN;
    UNKNOWN = Side.UNKNOWN;
}
