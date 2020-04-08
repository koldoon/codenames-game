import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { JoinComponent } from './components/join/join.component';
import { LobbyComponent } from './components/lobby/lobby.component';

const routes: Routes = [
    { path: '', redirectTo: 'lobby', pathMatch: 'full' },
    { path: 'lobby', component: LobbyComponent },
    { path: 'game/:gameId', redirectTo: 'game/:gameId/join', pathMatch: 'full' },
    { path: 'game/:gameId/join', component: JoinComponent },
    { path: 'game/:gameId/board/:board', component: BoardComponent },
    { path: 'game/:gameId/board/:board', component: BoardComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { enableTracing: false })
    ],
    exports: [
        RouterModule
    ]
})
export class AppRouting {
}
