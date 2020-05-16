import * as compression from 'compression';
import * as express from 'express';
import * as express_ws from 'express-ws';
import * as fs from 'fs';
import * as helmet from 'helmet';
import * as path from 'path';
import { config } from '../config';
import { ExpressRequestContext } from '../core/express/context/express_request_context';
import { RequestContextData } from '../core/express/context/request_context_data';
import { request_id_middleware } from '../core/express/context/request_id_middleware';
import { Logecom } from '../core/logecom/logecom';
import { expressLogMiddleware } from '../core/logecom/translators/http_formatter';
import { OnApplicationInit } from '../core/on_application_init';
import { appRoot } from '../root';
import { DictionariesController } from './controller/dictionaries_controller';
import { ErrorsController } from './controller/errors_controller';
import { FrontendController } from './controller/frontend_controller';
import { GamesController } from './controller/games_controller';
import { StatController } from './controller/stat_controller';
import { GamesGateway } from './service/games_gateway';
import { GamesService } from './service/games_service';
import expressRequestIdMiddleware = request_id_middleware.expressRequestIdMiddleware;

export class Application {
    private readonly logger = Logecom.createLogger(this.constructor.name);

    constructor(private port: number | string) {
        this.bootstrap().then(() => {
            this.logger.info('Application started' + (config.nodeEnv == 'production' ? ' in PRODUCTION mode' : ''));
            this.logger.info(`Listening on port: ${port}`);
        });
    }

    private async bootstrap() {
        this.logger.warn('Starting codenames-game server');
        this.logger.info('Git commit [' + fs.readFileSync(path.join(appRoot, 'version')).toString().trim() + ']');

        // Build application context respecting dependencies
        const app = express();
        const ws = express_ws(app);

        const context = new ExpressRequestContext<RequestContextData>();
        const gamesService = new GamesService();
        const gamesGateway = new GamesGateway(ws.app, gamesService);
        const gamesController = new GamesController(app, gamesService);
        const dictionariesController = new DictionariesController(app, gamesService);
        const statController = new StatController(app, gamesGateway, gamesService);
        const frontendController = new FrontendController(app);
        const errorsController = new ErrorsController(app);

        // Init services and middleware
        app
            .use(helmet())
            .use(compression())
            .use(context.expressMiddleware())
            .use(expressRequestIdMiddleware(context))
            .use(expressLogMiddleware(req => context.get(req).uid));

        await this.initModules(
            gamesService,
            gamesController,
            dictionariesController,
            gamesGateway,
            statController,
            frontendController,
            errorsController
        );

        await app.listen(Number(this.port), '0.0.0.0');
    }

    private async initModules(...args: OnApplicationInit[]) {
        for (const module of args) {
            this.logger.debug('Starting module:', module.constructor.name);
            await module.init();
        }
    }
}
