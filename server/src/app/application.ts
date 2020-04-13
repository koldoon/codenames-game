import * as express from 'express';
import * as express_ws from 'express-ws';
import { initModules } from '../core/init_modules';
import { ErrorsController } from './errors_controller';
import { FrontendController } from './frontend_controller';
import { GamesController } from './games_controller';
import { GamesGateway } from './games_gateway';
import { GamesService } from './games_service';
import * as helmet from 'helmet';

export class Application {
    constructor(private port: number) {
        this.bootstrap().then(() => {
            console.warn('Application started');
            console.warn(`Listening on port: ${port}`);
        });
    }

    private async bootstrap() {
        const app = express();
        const ws = express_ws(app);

        const gamesService = new GamesService();
        const gamesGateway = new GamesGateway(ws.app, gamesService);
        const gamesController = new GamesController(app, gamesService);
        const frontendController = new FrontendController(app);
        const errorsController = new ErrorsController(app);

        await initModules(
            gamesService,
            gamesController,
            gamesGateway,
            frontendController,
            errorsController
        );

        await app
            .use(helmet())
            .listen(this.port, '0.0.0.0');
    }
}
