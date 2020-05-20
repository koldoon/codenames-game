import { Application } from 'express';
import * as httpErrors from 'http-errors';

/**
 * This controller must be inited after all "api" controllers.
 * It terminates (sends "404 Not Found") for all requests, going to "/api/*"
 */
export class NotFoundController {
    constructor(
        private app: Application) {
    }

    init() {
        this.app.use('/api/*', (req, res, next) => {
            next(new httpErrors.NotFound())
        });
    }
}
