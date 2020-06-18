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
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AgentCardComponent } from './components/board/agent-card/agent-card.component';
import { GameFlowPanelComponent } from './components/board/game-flow-panel/game-flow-panel.component';
import { LogItemComponent } from './components/board/log-item/log-item.component';
import { NewGameConfirmPopupComponent } from './components/board/new-game-confirm-popup/new-game-confirm-popup.component';
import { PageBoardComponent } from './components/page-board/page-board.component';
import { PageErrorComponent } from './components/page-error/page-error.component';
import { PageJoinComponent } from './components/page-join/page-join.component';
import { PageNewGameComponent } from './components/page-new-game/page-new-game.component';
import { PageRulesComponent } from './components/page-rules/page-rules.component';
import { PageStartComponent } from './components/page-start/page-start.component';
import { SpymasterHintInput } from './components/board/spymaster-form-field/spymaster-hint-input.component';
import { HttpLoadingStatusInterceptor } from './services/http-loading-status.interceptor';

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
        AppRoutingModule,
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
        { provide: HTTP_INTERCEPTORS, multi: true, useClass: HttpLoadingStatusInterceptor }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
