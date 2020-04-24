import { Router } from 'express';

/**
 * Inverse using router binding for Express to be able to use fluent syntax.
 * Normally you can not use fluent syntax on the returned object after ".use()",
 * because this is the same root object, but we need a nested one
 */
export function defineNestedRoutes(prefix: string, app: Router) {
    const router = Router();
    app.use(prefix, router);
    return router;
}
