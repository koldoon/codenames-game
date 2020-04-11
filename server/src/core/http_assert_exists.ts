import * as createHttpError from 'http-errors';

export function httpAssertFound(value: any, message: string): asserts value {
    if (!value)
        throw createHttpError(404, message);
}
