import * as express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import * as uuid from 'uuid';
import { Context } from './request_context_data';

export module request_id_middleware {
    let requestId = 1;

    /**
     * Apply request id and uuid for request context in express pipeline.
     */
    export function expressRequestIdMiddleware(context: Context) {
        return (req: IncomingMessage, res: ServerResponse, next: express.NextFunction) => {
            const ctx = context.get(req);
            ctx.id = String(requestId++);
            ctx.uid = uuid.v4();
            next();
        }
    }
}
