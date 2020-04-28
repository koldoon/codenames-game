/**
 * Utility method to bind all OWN methods to class instance once and forever.
 * Methods of a classes in JS are not bind to its instance by default so you can not pass them
 * somewhere without loosing the context and must always add ".bind(this)" at the end or
 * you anonymous callback like "() => this.method()".
 *
 * @param {object} instance
 */
export function bindClass(instance: object) {
    const keys = Object.getOwnPropertyNames(instance.constructor.prototype);
    for (const key of keys) {
        if (key !== 'constructor' && typeof instance[key] === 'function')
            instance[key] = instance[key].bind(instance);
    }
}
