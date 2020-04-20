import * as httpErrors from 'http-errors';

export function httpAssertFound(value: any, message: string): asserts value {
    if (!value)
        throw new httpErrors.NotFound(message);
}

export function httpAssertValue(value: any, message: string): asserts value {
    if (!value)
        throw new httpErrors.BadRequest(message);
}

export function httpAssertRange(value: any, range: [number, number], message: string): asserts value is number {
    if (typeof value !== 'number' || isNaN(value) || value < range[0] || value > range[1])
        throw new httpErrors.BadRequest(message + ` Range expected: [${range[0]}-${range[1]}].`);
}
