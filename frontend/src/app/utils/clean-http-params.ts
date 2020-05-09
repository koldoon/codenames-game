import { HttpParams } from '@angular/common/http';

/**
 * Simple http params cleanup function to get rid of null and empty values
 */
export function cleanHttpParams<T extends HttpParams | { [param: string]: string | string[] }>(params: T) {
    if (params instanceof HttpParams) {
        const keys = params.keys();
        let result: HttpParams = params;
        for (const key of keys) {
            const value = result.get(key);
            if (value == null)
                result = result.delete(key);
        }
        return result;
    }
    else {
        const result: { [param: string]: string | string[] } = {};
        const keys = Object.keys(params);
        for (const key of keys) {
            if (params[key] != null)
                result[key] = params[key];
        }
        return result;
    }
}
