import { Application } from 'express';
import * as express from 'express';
import * as httpError from 'http-errors';
import * as path from 'path';
import { OnApplicationInit } from '../../core/on_application_init';
import { appRoot } from '../../root';

/**
 * Serves static frontend.
 * This must be the last controller configured over the app instance before
 * errors handling, since it binds to any ('/*') route.
 */
export class FrontendController implements OnApplicationInit {
    constructor(private app: Application) {}

    init() {
        this.app
            .use('/api/*', (req, res, next) => next(new httpError.NotFound()))
            .use(express.static(path.join(appRoot, '../frontend')))
            .use('/*', (req, res, next) => {
                res.sendFile('index.html', {
                    root: path.join(appRoot, '../frontend')
                });
            });
    }
}
