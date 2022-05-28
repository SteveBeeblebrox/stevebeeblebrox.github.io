var _a;
class ArrayMap {
    constructor(map = new Map()) {
        this.map = map;
        this[_a] = 'ArrayMap';
    }
    // impl Map
    /**
     * Remove all children and values from this map
     */
    clear() {
        return this.map.clear();
    }
    /**
     * Remove the value or map at `keys`
     *
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes
     */
    delete(keys, force = true) {
        return this.apply(keys, (key, map) => map.delete(key), force ? 'transparent' : 'fail');
    }
    forEach(callbackfn, thisArg) {
        this.map.forEach((value, key) => callbackfn.call(thisArg, value, [key], this), thisArg);
    }
    /**
     * Retrieve the value at `keys`
     *
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes and returns undefined
     */
    get(keys, force = true) {
        return this.apply(keys, (key, map) => map.get(key), force ? 'transparent' : 'fail');
    }
    /**
     * Does this map (ignoring children) have some value at `keys`
     *
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes and returns false
     */
    has(keys, force = true) {
        return this.apply(keys, (key, map) => map.has(key), force ? 'transparent' : 'fail');
    }
    /**
     * Sets the value at `keys` to `value`
     *
     * @param `keys` The array to lookup
     * @parm `value` THe new value
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes
     */
    set(keys, value, force = true) {
        this.apply(keys, (key, map) => map.set(key, value), force ? 'overwrite' : 'fail');
        return this;
    }
    /**
     * Recursively creates maps matching to `keys`
     *
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes
     */
    init(keys, force = true) {
        this.apply(keys, (key, map) => map.set(key, new ArrayMap()), force ? 'overwrite' : 'fail');
        return this;
    }
    get size() {
        return this.map.size;
    }
    entries() {
        return (function* (thiz) {
            for (const [k, v] of thiz.map.entries())
                yield [[k], v];
        })(this);
    }
    keys() {
        return (function* (thiz) {
            for (const k of thiz.map.keys())
                yield [k];
        })(this);
    }
    values() {
        return this.map.values();
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    // impl Map
    static copy(array) {
        return [...array];
    }
    resolve(keys, mode = 'fail') {
        keys = ArrayMap.copy(keys);
        return [keys.pop(), keys.reduce(function (map, key, index) {
                let value = map.get([key]);
                if (!(value instanceof ArrayMap) || value === undefined) {
                    if (mode === 'overwrite' || (mode === 'transparent' && value === undefined))
                        map.set([key], value = new ArrayMap());
                    else if (mode === 'transparent') // fake it
                        value = new ArrayMap();
                    else
                        throw new Error(`Unable to resolve key, expected map but found "${value}"`);
                }
                return value;
            }, this)];
    }
    apply(keys, callback, mode = 'fail') {
        if (keys.length === 1) {
            return callback(keys[0], this.map);
        }
        else {
            const [key, map] = this.resolve(keys, mode);
            return callback([key], map);
        }
    }
}
_a = Symbol.toStringTag;
