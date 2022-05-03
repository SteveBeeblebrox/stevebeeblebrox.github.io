type SomeArray<V> = V[] & {0:V}
class ArrayMap<K,V> implements Map<SomeArray<K>,V | ArrayMap<K,V>> {
    constructor(private readonly map: Map<K,V | ArrayMap<K,V>> = new Map()){}

    // impl Map
    clear(): void {
        return this.map.clear();
    }
    delete(keys: SomeArray<K>): boolean {
        return this.apply(keys,(key,map)=>map.delete(key));
    }
    forEach(callbackfn: (value: ArrayMap<K,V>|V,key: SomeArray<K>,map: Map<SomeArray<K>,ArrayMap<K,V>|V>) => void,thisArg?: any): void {
        throw new Error("Method forEach not implemented.")
    }
    get(keys: SomeArray<K>): ArrayMap<K,V>|V|undefined {
        return this.apply(keys,(key,map)=>map.get(key));
    }
    has(keys: SomeArray<K>): boolean {
        return this.apply(keys,(key,map)=>map.has(key));
    }
    set(keys: SomeArray<K>,value: ArrayMap<K,V>|V, init = true): this {
        this.apply(keys, (key, map)=>map.set(key,value), init);
        return this;
    }
    init(keys: SomeArray<K>): this {
        this.apply(keys, (key, map)=>map.set(key, new ArrayMap()));
        return this;
    }
    get size(): number {
        return this.map.size;
    }
    entries(): IterableIterator<[SomeArray<K>,ArrayMap<K,V>|V]> {
        return (function*(thiz) {
            for(const [k,v] of thiz.map.entries())
                yield [[k] as SomeArray<K>, v];
        })(this)
    }
    keys(): IterableIterator<SomeArray<K>> {
        return (function*(thiz) {
            for(const k of thiz.map.keys())
                yield [k] as SomeArray<K>;
        })(this)
    }
    values(): IterableIterator<ArrayMap<K,V>|V> {
        return this.map.values()
    }
    [Symbol.iterator](): IterableIterator<[SomeArray<K>,ArrayMap<K,V>|V]> {
        throw new Error('Iterator not implemented')
    }
    [Symbol.toStringTag]: string
    // impl Map
    private static copy<T>(array: T[]): T[] {
        return [...array];
    }

    private resolve(keys: SomeArray<K>, init = false): [K, ArrayMap<K,V>] {
        keys=ArrayMap.copy(keys) as SomeArray<K>;
        return [keys.pop()!, keys.reduce(function(map, key, index) {
            let value = map.get([key]);
            if(value === undefined && init)
                map.set([key], value = new ArrayMap<K,V>())
            else if(!(value instanceof ArrayMap))
                throw new Error(`Cannot resolve key ${keys.slice(0,index+1)}. "${key}" is not a map.`)
            return value;
        }, this as ArrayMap<K,V>)];
    }

    private apply<R>(keys: SomeArray<K>, callback: (key:K,map:Map<K,ArrayMap<K,V> | V>)=>R, init = false) {
        if(keys.length === 1) {
            return callback(keys[0],this.map as Map<K,V>)
        }
        else {
            const [key, map] = this.resolve(keys, init);
            return callback([key] as unknown as K, map as unknown as Map<K,V>);
        }
    }
}