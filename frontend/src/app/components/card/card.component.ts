import { ChangeDetectionStrategy, Component, Input, OnInit, Output } from '@angular/core';
import { AgentModel, AgentSide } from '../../../../../server/src/model/agent_model';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
    BLUE = AgentSide.BLUE;
    RED = AgentSide.RED;
    NEUTRAL = AgentSide.NEUTRAL;
    BLACK = AgentSide.BLACK;
    UNKNOWN = AgentSide.UNKNOWN;

    @Input() agent: AgentModel;
}
