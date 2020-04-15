import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AgentSide } from '../../../../../server/src/api/agent_side';

@Component({
    selector: 'app-agent',
    templateUrl: './agent.component.html',
    styleUrls: ['./agent.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentComponent {
    @Input() name = '';
    @Input() side = AgentSide.UNKNOWN;
    @Input() uncovered = false;
    @Input() uncoveringInProgress = false;
    @Input() fontSize = 12;

    BLUE = AgentSide.BLUE;
    RED = AgentSide.RED;
    NEUTRAL = AgentSide.NEUTRAL;
    BLACK = AgentSide.BLACK;
    UNKNOWN = AgentSide.UNKNOWN;
}
