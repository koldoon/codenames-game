import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import * as path from 'path';
import { bindClass } from '../../core/bind_class';
import { OnApplicationInit } from '../../core/on_application_init';
import { appRoot } from '../../root';

/**
 * Serves static frontend.
 * This must be the last controller configured over the app instance before
 * errors handling, since it binds to any ('/*') route.
 */
export class FrontendController implements OnApplicationInit {
    constructor(
        private app: Application) {
        bindClass(this);
    }

    private readonly frontendRoot = path.join(appRoot, '../frontend');

    init() {
        this.app
            .use(express.static(this.frontendRoot))
            .use('/*', this.frontendMiddleware);
    }

    frontendMiddleware(req: Request, res: Response, next: NextFunction) {
        res.sendFile('index.html', { root: this.frontendRoot });
    }
}
