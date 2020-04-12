/**
 * Utility method to bind all methods to class.
 * Methods of a classes in JS are not bind to its instance by default so you can not pass them
 * somewhere without loosing the context.
 * @param {object} instance
 */
export function bindClass(instance: object) {
    const keys = Object.getOwnPropertyNames(instance.constructor.prototype);
    for (const key of keys) {
        if (key !== 'constructor' && typeof instance[key] === 'function') {
            instance[key] = instance[key].bind(instance);
        }
    }
}
