/*
 * MIT License
 * 
 * Copyright (c) 2022 S. Beeblebrox
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
namespace ArrayMap {
    export type SomeArray<V> = V[] & {0:V}
}
class ArrayMap<K,V> implements Map<ArrayMap.SomeArray<K>,V | ArrayMap<K,V>> {
    constructor(private readonly map: Map<K,V | ArrayMap<K,V>> = new Map()){}
    // impl Map
    /**
     * Remove all children and values from this map
     */
    clear(): void {
        return this.map.clear();
    }
    /**
     * Remove the value or map at `keys`
     * 
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes
     */
    delete(keys: ArrayMap.SomeArray<K>, force = true): boolean {
        return this.apply(keys,(key,map)=>map.delete(key), force ? 'transparent' : 'fail');
    }
    forEach(callbackfn: (value: ArrayMap<K,V>|V,key: ArrayMap.SomeArray<K>,map: Map<ArrayMap.SomeArray<K>,ArrayMap<K,V>|V>) => void,thisArg?: any): void {
        this.map.forEach((value, key) => callbackfn.call(thisArg, value, [key], this), thisArg);
    }
    /**
     * Retrieve the value at `keys`
     * 
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes and returns undefined
     */
    get(keys: ArrayMap.SomeArray<K>, force = true): ArrayMap<K,V>|V|undefined {
        return this.apply(keys,(key,map)=>map.get(key), force ? 'transparent' : 'fail');
    }
    /**
     * Does this map (ignoring children) have some value at `keys`
     * 
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes and returns false
     */
    has(keys: ArrayMap.SomeArray<K>, force = true): boolean {
        return this.apply(keys,(key,map)=>map.has(key), force ? 'transparent' : 'fail');
    }
    /**
     * Sets the value at `keys` to `value`
     * 
     * @param `keys` The array to lookup
     * @parm `value` THe new value
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes
     */
    set(keys: ArrayMap.SomeArray<K>,value: ArrayMap<K,V>|V, force = true): this {
        this.apply(keys, (key, map)=>map.set(key,value), force ? 'overwrite' : 'fail');
        return this;
    }
    /**
     * Recursively creates maps matching to `keys`
     * 
     * @param `keys` The array to lookup
     * @param `force` If false, an error is thrown when unable to lookup `keys`; otherwise, it silently completes
     */
    init(keys: ArrayMap.SomeArray<K>, force = true): this {
        this.apply(keys, (key, map)=>map.set(key, new ArrayMap()), force ? 'overwrite' : 'fail');
        return this;
    }
    get size(): number {
        return this.map.size;
    }
    entries(): IterableIterator<[ArrayMap.SomeArray<K>,ArrayMap<K,V>|V]> {
        return (function*(thiz) {
            for(const [k,v] of thiz.map.entries())
                yield [[k] as ArrayMap.SomeArray<K>, v];
        })(this)
    }
    keys(): IterableIterator<ArrayMap.SomeArray<K>> {
        return (function*(thiz) {
            for(const k of thiz.map.keys())
                yield [k] as ArrayMap.SomeArray<K>;
        })(this)
    }
    values(): IterableIterator<ArrayMap<K,V>|V> {
        return this.map.values()
    }
    [Symbol.iterator](): IterableIterator<[ArrayMap.SomeArray<K>,ArrayMap<K,V>|V]> {
        return this.entries();
    }
    [Symbol.toStringTag]: string = 'ArrayMap';
    // impl Map
    private static copy<T>(array: T[]): T[] {
        return [...array];
    }
    
    private resolve(keys: ArrayMap.SomeArray<K>, mode: 'overwrite' | 'transparent' | 'fail' = 'fail'): [K, ArrayMap<K,V>] {
        keys=ArrayMap.copy(keys) as ArrayMap.SomeArray<K>;
        return [keys.pop()!, keys.reduce(function(map, key, index) {
            let value = map.get([key]);
            if(!(value instanceof ArrayMap) || value === undefined) {
                if(mode === 'overwrite' || (mode === 'transparent' && value === undefined))
                    map.set([key], value = new ArrayMap<K,V>())
                else if(mode === 'transparent') // fake it
                    value = new ArrayMap();
                else throw new Error(`Unable to resolve key, expected map but found "${value}"`);
            }
            return value;
        }, this as ArrayMap<K,V>)];
    }

    private apply<R>(keys: ArrayMap.SomeArray<K>, callback: (key:K,map:Map<K,ArrayMap<K,V> | V>)=>R, mode: 'overwrite' | 'transparent' | 'fail' = 'fail') {
        if(keys.length === 1) {
            return callback(keys[0],this.map as Map<K,V>)
        }
        else {
            const [key, map] = this.resolve(keys, mode);
            return callback([key] as unknown as K, map as unknown as Map<K,V>);
        }
    }
}