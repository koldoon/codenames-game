import * as httpErrors from 'http-errors';

export function httpAssertFound(value: any, message: string): asserts value {
    if (value !== 0 && value !== false && !value)
        throw new httpErrors.NotFound(message);
}
