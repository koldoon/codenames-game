import * as express from 'express';
import * as express_ws from 'express-ws';
import { initModules } from '../core/init_modules';
import { FrontendController } from './frontend_controller';
import { GamesController } from './games_controller';
import { GamesGateway } from './games_gateway';
import { GamesService } from './games_service';
import * as helmet from 'helmet';

export class Application {
    constructor(private port: number) {
        this.bootstrap()
            .then(() => {
                console.warn('Application started');
                console.warn(`Listening on port: ${port}`);
            });
    }

    // Application Context

    app = express();
    ws = express_ws(this.app);

    gamesService = new GamesService();
    gamesGateway = new GamesGateway(this.ws.app, this.gamesService);
    gamesController = new GamesController(this.app, this.gamesService);
    frontendController = new FrontendController(this.app);

    async bootstrap() {
        await initModules(
            this.gamesService,
            this.gamesController,
            this.gamesGateway,
            this.frontendController
        );

        await this.app
            .use(helmet())
            .listen(this.port, '0.0.0.0');
    }
}
