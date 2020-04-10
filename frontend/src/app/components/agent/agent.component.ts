import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AgentSide } from '../../../../../server/src/model/agent_model';

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

    BLUE = AgentSide.BLUE;
    RED = AgentSide.RED;
    NEUTRAL = AgentSide.NEUTRAL;
    BLACK = AgentSide.BLACK;
    UNKNOWN = AgentSide.UNKNOWN;
}
