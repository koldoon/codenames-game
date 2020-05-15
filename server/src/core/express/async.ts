import { NextFunction, Request, Response } from 'express';

/**
 * Wrapper for promise-based async request handler.
 * Ensures that any error is caught and passed to middleware stack.
 * @param {(req: e.Request) => Promise<any>} handler
 * @returns {(req: e.Request, res: e.Response, next: e.NextFunction) => void}
 */
export function async(handler: (req: Request) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req)
            .then(result => res.json(result))
            .catch(next);
    }
}
