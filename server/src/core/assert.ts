import { HttpError } from 'http-errors';
import * as httpErrors from 'http-errors';
import { ErrorCode } from '../api/api_error';

/**
 * List of useful method to generate and throw standard http errors if some
 * assertions are not satisfied.
 *
 * In scope of Typescript these methods also implement type guards
 * to help in statical code analysis.
 */
export namespace assert {
    interface ValueAssertFunction {
        (value: any, message: string): asserts value;
        (value: any, code: number | string, message: string): asserts value;
        (value: any, params: [ErrorCode, string]): asserts value;
    }

    export const found: ValueAssertFunction = (value: any, param: string | number | any[], message?: string): asserts value => {
        return constructValueError(httpErrors.NotFound, value, param, message);
    };


    export const value: ValueAssertFunction = function (value: any, param: string | number | any[], message?: string): asserts value {
        return constructValueError(httpErrors.BadRequest, value, param, message);
    };


    export function range(value: any, range: [number, number], message: string): asserts value is number {
        if (typeof value !== 'number' || isNaN(value) || value < range[0] || value > range[1])
            throw new httpErrors.BadRequest(message + ` Expected: [${range[0]}-${range[1]}], got ${value}`);
    }


    // Internal Impl
    // ---------------

    type Constructor<T extends {} = {}> = new (...args: any[]) => T;

    function constructValueError(
        clazz: Constructor<HttpError>,
        value: any,
        param: string | number | any[],
        message?: string): asserts value {

        if (value || value === 0)
            return;

        if (Array.isArray(param))
            [param, message] = param;

        const error = new clazz(String(message ?? param));
        if (message)
            error.code = param;

        throw error;
    }
}
