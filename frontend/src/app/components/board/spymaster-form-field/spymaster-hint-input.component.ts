import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Side } from '../../../../../../server/src/model/agent_side';
import { PlayerSide } from '../../../../../../server/src/model/player_side';

@Component({
    selector: 'app-spymaster-hint-input',
    templateUrl: './spymaster-hint-input.component.html',
    styleUrls: ['./spymaster-hint-input.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpymasterHintInput {
    RED = Side.RED;
    BLUE = Side.BLUE;

    @Input() side: PlayerSide;
    @Input() messageControl: FormControl;

    @Output() enter = new EventEmitter();
}
