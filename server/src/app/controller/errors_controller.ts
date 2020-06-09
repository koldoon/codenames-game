import { Application, NextFunction, Request, Response } from 'express';
import * as httpErrors from 'http-errors';
import { config } from '../../config';
import { bindClass } from '../../core/bind_class';
import { Context } from '../../core/express/context/request_context_data';
import { Logecom } from '../../core/logecom/logecom';
import { NO_LOG_ERROR } from '../../core/no_log_error';
import { OnApplicationInit } from '../../core/on_application_init';
import { serializeError } from '../../core/serialize_error';

export class ErrorsController implements OnApplicationInit {
    private readonly logger = Logecom.createLogger(this.constructor.name);

    constructor(
        private app: Application,
        private ctx: Context) {
        bindClass(this);
    }

    init() {
        this.app.use(this.onHttpError);
    }


    onHttpError(err: Error, req: Request, res: Response, next: NextFunction) {
        if (err.message !== NO_LOG_ERROR)
            this.logger.error(err, this.ctx.get(req));

        if (config.nodeEnv == 'production')
            delete err.stack;

        if (err instanceof httpErrors.HttpError) {
            res.status(err.statusCode).json(serializeError(err));
        }
        else {
            res.status(500).send({ message: 'Unknown service error. See logs for details.' });
        }
    }
}
