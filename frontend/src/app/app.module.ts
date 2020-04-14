import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { AppRoutingNavigation } from './app.routing.navigation';
import { AgentComponent } from './components/agent/agent.component';
import { BoardComponent } from './components/board/board.component';
import { ErrorComponent } from './components/error/error.component';
import { JoinComponent } from './components/join/join.component';
import { StartComponent } from './components/start/start.component';
import { ConfirmComponent } from './components/confirm/confirm.component';

@NgModule({
    declarations: [
        AppComponent,
        StartComponent,
        BoardComponent,
        JoinComponent,
        AgentComponent,
        ErrorComponent,
        ErrorComponent,
        ConfirmComponent
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
        MatDialogModule
    ],
    providers: [AppRoutingNavigation],
    bootstrap: [AppComponent]
})
export class AppModule {}
