import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppRoutingNavigation } from '../../app.routing.navigation';

@Component({
    selector: 'app-start',
    templateUrl: './page-start.component.html',
    styleUrls: ['./page-start.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageStartComponent {
    constructor(
        private navigation: AppRoutingNavigation) { }

    onCreateGameClick() {
        this.navigation.toNewGame();
    }

    onRulesClick() {
        this.navigation.toRules();
    }
}
