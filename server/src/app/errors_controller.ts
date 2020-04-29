import { Application, NextFunction, Request, Response } from 'express';
import * as httpErrors from 'http-errors';
import { bindClass } from '../core/bind_class';
import { Logecom } from '../core/logecom/logecom';
import { OnApplicationInit } from '../core/on_application_init';
import { serializeError } from 'serialize-error';

export class ErrorsController implements OnApplicationInit {
    private readonly logger = Logecom.createLogger(this.constructor.name);

    constructor(
        private app: Application) {
        bindClass(this);
    }

    init() {
        this.app.use(this.onHttpError);
    }


    onHttpError(err: Error, req: Request, res: Response, next: NextFunction) {
        this.logger.error(err);

        if (process.env.NODE_ENV === 'production')
            delete err.stack;

        if (err instanceof httpErrors.HttpError) {
            res.status(err.statusCode).json(serializeError(err));
        }
        else {
            res.status(500).send({ message: 'Service error. See logs for details.' });
        }
    }
}
