import { Application, NextFunction, Request, Response } from 'express';
import * as httpErrors from 'http-errors';
import { bindClass } from '../../core/bind_class';
import { NO_LOG_ERROR } from '../../core/no_log_error';

/**
 * This controller must be inited after all "api" controllers.
 * It terminates (sends "404 Not Found") for all requests, going to "/api/*"
 */
export class NotFoundController {
    constructor(private app: Application) {
        bindClass(this);
    }

    init() {
        this.app.use('/api*', this.notFound);
        this.app.use('/*\.php*', this.notFound);
    }

    notFound(req: Request, res: Response, next: NextFunction) {
        next(new httpErrors.NotFound(NO_LOG_ERROR));
    }
}
