import * as httpErrors from 'http-errors';

/**
 * List of useful method to generate and throw standard http errors if some
 * assertions are not satisfied.
 *
 * In scope of Typescript these methods also implement type guards
 * to help in statical code analysis.
 */
export namespace httpAssert {
    export function found(value: any, message: string): asserts value {
        if (!value)
            throw new httpErrors.NotFound(message);
    }

    export function value(value: any, message: string): asserts value {
        if (!value)
            throw new httpErrors.BadRequest(message);
    }

    export function range(value: any, range: [number, number], message: string): asserts value is number {
        if (typeof value !== 'number' || isNaN(value) || value < range[0] || value > range[1])
            throw new httpErrors.BadRequest(message + ` Range expected: [${range[0]}-${range[1]}].`);
    }
}
