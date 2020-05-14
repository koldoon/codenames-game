import { isPrimitive } from './is_primitive';

export class SerializedError {
    [k: string]: any;
}

export function serializeError<T>(error: T): T | object {
    if (isPrimitive(error))
        return error;

    const properties = Object.getOwnPropertyNames(error);
    const flatError = new SerializedError();
    for (const prop of properties) {
        flatError[prop] = error[prop];
    }

    return flatError;
}
