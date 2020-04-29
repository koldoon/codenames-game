import * as compression from 'compression';
import * as express from 'express';
import * as express_ws from 'express-ws';
import * as helmet from 'helmet';
import { initModules } from '../core/init_modules';
import { Logecom } from '../core/logecom/logecom';
import { expressLoggerMiddleware } from '../core/logecom/translators/http_formatter';
import { ErrorsController } from './errors_controller';
import { FrontendController } from './frontend_controller';
import { GamesController } from './games_controller';
import { GamesGateway } from './games_gateway';
import { GamesService } from './games_service';

export class Application {
    private logger = Logecom.createLogger(Application.name);

    constructor(private port: number | string) {
        this.bootstrap().then(() => {
            this.logger.info('Application started' + (process.env.NODE_ENV === 'production' ? ' in PRODUCTION mode' : ''));
            this.logger.info(`Listening on port: ${port}`);
        });
    }

    private async bootstrap() {
        // Build application context respecting dependencies
        const app = express();
        const ws = express_ws(app);

        const gamesService = new GamesService();
        const gamesGateway = new GamesGateway(ws.app, gamesService);
        const gamesController = new GamesController(app, gamesService);
        const frontendController = new FrontendController(app);
        const errorsController = new ErrorsController(app);

        // Init services and middleware
        app
            .use(helmet())
            .use(compression())
            .use(expressLoggerMiddleware());

        await initModules(
            gamesService,
            gamesController,
            gamesGateway,
            frontendController,
            errorsController
        );

        await app.listen(Number(this.port), '0.0.0.0');
    }
}
