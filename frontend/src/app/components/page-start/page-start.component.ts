import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppRoutingNavigationService } from '../../app-routing-navigation.service';

@Component({
    selector: 'app-start',
    templateUrl: './page-start.component.html',
    styleUrls: ['./page-start.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageStartComponent {
    constructor(
        private navigation: AppRoutingNavigationService) { }

    onCreateGameClick() {
        this.navigation.toNewGame();
    }

    onRulesClick() {
        this.navigation.toRules();
    }
}
