/**
 * Simple conventional test for primitive value
 * Return true for null, undefined, NaN, Number, String, Boolean
 */
export function isPrimitive(value: any) {
    return value !== Object(value);
}
