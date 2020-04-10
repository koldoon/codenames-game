import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
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
import { BoardComponent } from './components/board/board.component';
import { JoinComponent } from './components/join/join.component';
import { StartComponent } from './components/start/start.component';
import { AgentComponent } from './components/agent/agent.component';

@NgModule({
    declarations: [
        AppComponent,
        StartComponent,
        BoardComponent,
        JoinComponent,
        AgentComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRouting,
        BrowserAnimationsModule,
        MatButtonModule,
        MatDividerModule,
        MatSnackBarModule,
        MatGridListModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatCardModule,
        MatProgressBarModule,
        MatRippleModule,
        MatIconModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
