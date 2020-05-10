import { ClipboardModule } from '@angular/cdk/clipboard';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { AppRoutingNavigation } from './app.routing.navigation';
import { AgentCardComponent } from './components/agent-card/agent-card.component';
import { PageBoardComponent } from './components/page-board/page-board.component';
import { NewGameConfirmPopupComponent } from './components/new-game-confirm-popup/new-game-confirm-popup.component';
import { PageErrorComponent } from './components/page-error/page-error.component';
import { GameFlowPanelComponent } from './components/game-flow-panel/game-flow-panel.component';
import { PageJoinComponent } from './components/page-join/page-join.component';
import { PageStartComponent } from './components/page-start/page-start.component';
import { LogItemComponent } from './components/log-item/log-item.component';
import { PageNewGameComponent } from './components/page-new-game/page-new-game.component';
import { PageRulesComponent } from './components/page-rules/page-rules.component';
import { DictionariesResolve } from './services/dictionaries.resolve';
import { DictionariesService } from './services/dictionaries.service';
import { GameService } from './services/game.service';
import { HttpLoadingStatusInterceptor } from './services/http-loading-status.interceptor';
import { HttpLoadingStatusService } from './services/http-loading-status.service';
import { SpymasterHintInput } from './components/spymaster-form-field/spymaster-hint-input.component';

@NgModule({
    declarations: [
        AppComponent,
        PageStartComponent,
        PageBoardComponent,
        PageJoinComponent,
        AgentCardComponent,
        PageErrorComponent,
        NewGameConfirmPopupComponent,
        GameFlowPanelComponent,
        LogItemComponent,
        PageNewGameComponent,
        PageRulesComponent,
        SpymasterHintInput,
        SpymasterHintInput
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRouting,
        BrowserAnimationsModule,
        ClipboardModule,
        MatButtonModule,
        MatDividerModule,
        MatSnackBarModule,
        MatGridListModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatCardModule,
        MatProgressBarModule,
        MatRippleModule,
        MatIconModule,
        MatBadgeModule,
        MatChipsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, multi: true, useClass: HttpLoadingStatusInterceptor },
        DictionariesResolve,
        DictionariesService,
        GameService,
        HttpLoadingStatusService,
        AppRoutingNavigation
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
