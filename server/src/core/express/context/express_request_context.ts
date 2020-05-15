import * as express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { RequestContext } from './request_context';

/**
 * RequestContext interface Express implementation
 * Provide extra data context related to particular IncomingMessage (request).
 *
 * Intention:
 * The popular way of setting extra properties directly to request object
 * is not very good, since it is hard to be controlled and typed.
 *
 * This class stores extra data connected with particular request as long
 * as request remains in memory.
 */
export class ExpressRequestContext<T extends {}> implements RequestContext<T> {
    constructor(dataType?: Constructor<T>) {
        dataType
            ? this.createContext = () => new dataType()
            : this.createContext = () => ({} as T);
    }

    expressMiddleware() {
        return (req: IncomingMessage, res: ServerResponse, next: express.NextFunction) => {
            this.data.set(req, this.createContext());
            next();
        }
    }

    get(req: IncomingMessage) {
        return this.data.get(req) as T;
    }

    private readonly createContext: () => T;
    private readonly data = new WeakMap<IncomingMessage, T>()
}

type Constructor<T extends {} = {}> = new (...args: any[]) => T;
