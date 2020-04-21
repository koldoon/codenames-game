import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { JoinComponent } from './components/join/join.component';
import { StartComponent } from './components/start/start.component';

const routes: Routes = [
    { path: '', redirectTo: 'start', pathMatch: 'full' },
    { path: 'start', component: StartComponent },
    { path: 'game/:gameId', redirectTo: 'game/:gameId/join', pathMatch: 'full' },
    { path: 'game/:gameId/join', component: JoinComponent },
    { path: 'game/:gameId/player/:playerType/board', component: BoardComponent },
    { path: 'error/:code', component: ErrorPageComponent },
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
