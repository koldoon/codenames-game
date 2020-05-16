import * as express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { generate_id } from '../../generate_id';
import { Context } from './request_context_data';
import generateId = generate_id.generateId;

export module request_id_middleware {
    let requestId = 1;

    /**
     * Apply request id and uuid for request context in express pipeline.
     */
    export function expressRequestIdMiddleware(context: Context) {
        return (req: IncomingMessage, res: ServerResponse, next: express.NextFunction) => {
            const ctx = context.get(req);
            ctx.id = String(requestId++);
            // 4 chars - quite enough to distinguish some request in a
            // reasonable time window
            ctx.uid = generateId(4);
            next();
        }
    }
}
