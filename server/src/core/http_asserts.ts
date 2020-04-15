import * as httpErrors from 'http-errors';

export function httpAssertFound(value: any, message: string): asserts value {
    if (value !== 0 && !value)
        throw new httpErrors.NotFound(message);
}

export function httpAssertGoodRequest(value: any, message: string): asserts value {
    if (value !== 0 && !value)
        throw new httpErrors.BadRequest(message);
}
