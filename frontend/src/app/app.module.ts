import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { CardComponent } from './components/card/card.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { BoardComponent } from './components/board/board.component';
import { JoinComponent } from './components/join/join.component';

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
        AppRouting
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
