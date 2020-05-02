import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageBoardComponent } from './components/page-board/page-board.component';
import { PageErrorComponent } from './components/page-error/page-error.component';
import { PageJoinComponent } from './components/page-join/page-join.component';
import { PageNewGameComponent } from './components/page-new-game/page-new-game.component';
import { PageStartComponent } from './components/page-start/page-start.component';

const routes: Routes = [
    { path: '', redirectTo: 'start', pathMatch: 'full' },
    { path: 'start', component: PageStartComponent },
    { path: 'game/new', component: PageNewGameComponent },
    { path: 'game/:gameId', redirectTo: 'game/:gameId/join', pathMatch: 'full' },
    { path: 'game/:gameId/join', component: PageJoinComponent },
    { path: 'game/:gameId/player/:playerType/board', component: PageBoardComponent },
    { path: 'error/:code', component: PageErrorComponent },
    { path: '**', redirectTo: 'start' }
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
