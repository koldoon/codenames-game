import { Application, NextFunction, Request, Response } from 'express';
import * as httpErrors from 'http-errors';
import { bindClass } from '../core/bind_class';
import { OnApplicationInit } from '../core/on_application_init';

export class ErrorsController implements OnApplicationInit {
    constructor(
        private app: Application) {
        bindClass(this);
    }

    init() {
        this.app.use(this.onHttpError);
    }


    onHttpError(err: Error, req: Request, res: Response, next: NextFunction) {
        if (err instanceof httpErrors.HttpError) {
            if (process.env.NODE_ENV === 'production')
                delete err.stack;

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(err.statusCode).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));

            if (err.stack)
                console.error(err.stack);
        }
        else {
            res.status(500).send({ message: 'Unknown service error' });
        }
    }
}
