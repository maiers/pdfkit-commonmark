/**
 * Type enforcing deep defaults
 *
 * Defaults will be recursively enforced except for
 * arrays.
 *
 * If the obj type does not match the default type,
 * this function will return the default value.
 *
 * This is a pure function, as it will not modify either
 * the obj or the defaults and always returns a copy.
 *
 * @param {any} obj
 * @param {any} defaults
 * @returns {any}
 */
export function deepDefaults(obj, defaults, context = []) {

    if (defaults === undefined || defaults === null) {
        return deepClone(obj);
    }

    if (obj === undefined || obj === null) {
        return deepClone(defaults);
    }

    if (typeof obj !== typeof defaults) {
        if (context.length > 0) {
            console.info('deepDefaults type mismatch at `%s` (actual %s !== expected %s)',
                context.join('.'), typeof obj, typeof defaults);
        } else {
            console.info('deepDefaults type mismatch (actual `%s` !== expected `%s`)',
                typeof obj, typeof defaults);
        }
        return deepClone(defaults);
    }

    if (Array.isArray(obj)) {
        if (!Array.isArray(defaults)) {
            return deepClone(defaults);
        }
        return deepClone([
            ...obj,
            ...defaults.filter(element => !obj.includes(element)),
        ]);
    }

    if (typeof obj === 'object') {
        if (Array.isArray(defaults) || typeof defaults !== 'object') {
            return deepClone(defaults);
        }
        return Object.entries(obj).reduce((copy, [ key, value ]) => {
            return Object.assign(copy, {
                [key]: deepDefaults(value, defaults[key], [ ...context, key ]),
            });
        }, deepClone(defaults));
    }

    return deepClone(obj);

}

export function deepClone(obj) {

    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepClone);
    }

    if (typeof obj === 'object') {
        return Object.entries(obj).reduce((copy, [ key, value ]) => {
            return Object.assign(copy, {
                [key]: deepClone(value),
            });
        }, {});
    }

    return obj;

}
