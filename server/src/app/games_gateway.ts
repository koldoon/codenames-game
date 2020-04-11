import { Application } from 'express-ws';

export class GamesGateway {
    constructor(app: Application) {
        console.debug('Dependency: ' + app.constructor.name);
    }

}
