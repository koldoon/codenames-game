import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { BoardComponent } from './components/board/board.component';
import { CardComponent } from './components/card/card.component';
import { JoinComponent } from './components/join/join.component';
import { LobbyComponent } from './components/lobby/lobby.component';

@NgModule({
    declarations: [
        AppComponent,
        LobbyComponent,
        CardComponent,
        BoardComponent,
        JoinComponent
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
        MatProgressBarModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
