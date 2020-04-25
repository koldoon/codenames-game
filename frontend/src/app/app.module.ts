import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
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
import { BoardComponent } from './components/board/board.component';
import { NewGameConfirmPopupComponent } from './components/new-game-confirm-popup/new-game-confirm-popup.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { GameFlowPanelComponent } from './components/game-flow-panel/game-flow-panel.component';
import { JoinComponent } from './components/join/join.component';
import { StartComponent } from './components/start/start.component';
import { LogItemComponent } from './components/log-item/log-item.component';

@NgModule({
    declarations: [
        AppComponent,
        StartComponent,
        BoardComponent,
        JoinComponent,
        AgentCardComponent,
        ErrorPageComponent,
        NewGameConfirmPopupComponent,
        GameFlowPanelComponent,
        LogItemComponent
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
    providers: [AppRoutingNavigation],
    bootstrap: [AppComponent]
})
export class AppModule {}
