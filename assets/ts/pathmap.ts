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
    set(keys: SomeArray<K>,value: ArrayMap<K,V>|V): this {
        this.apply(keys, (key, map)=>map.set(key,value));
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

    private resolve(keys: SomeArray<K>): [K, ArrayMap<K,V>] {
        keys=ArrayMap.copy(keys) as SomeArray<K>;
        return [keys.pop()!, keys.reduce(function(map, key, index) {
            let value = map.get([key]);
            if(value === undefined)
                map.set([key], value = new ArrayMap<K,V>())
            else if(!(value instanceof ArrayMap))
                throw new Error(`Cannot resolve key ${keys.slice(0,index+1)}. "${key}" is not a map.`)
            return value;
        }, this as ArrayMap<K,V>)];
    }

    private apply<R>(keys: SomeArray<K>, callback: (key:K,map:Map<K,ArrayMap<K,V> | V>)=>R) {
        if(keys.length === 1) {
            return callback(keys[0],this.map as Map<K,V>)
        }
        else {
            const [key, map] = this.resolve(keys);
            return callback([key] as unknown as K, map as unknown as Map<K,V>);
        }
    }
}

type Path = string | string[]

class PathMap<V> implements Map<Path, PathMap<V> | V> {
    constructor(private readonly map: ArrayMap<Path, PathMap<V> | V> = new ArrayMap(),private readonly SEPARATOR='/'){}

    private toParts(path: Path): SomeArray<string> {
        const parts: SomeArray<string> = (()=>{
            if(Array.isArray(path)) return path as SomeArray<string>;
            else {
                if(path.startsWith(this.SEPARATOR))
                    path = path.substring(this.SEPARATOR.length)
                return path.split(this.SEPARATOR) as SomeArray<string>;
            }
        })();
        parts.forEach((part,index,parts) => {
            switch(part) {
                case '': throw new Error(`The part of path "${path}" at "${parts[index-1] != null ? parts[index-1] + '/' : ''}<here>${parts[index+1] != null ? '/' + parts[index+1]: ''}" cannot be empty.`)
                case '..': parts.splice(index, 2);
                case '.': parts.splice(index, 1);
            }
        });
        if(parts.length <= 0) throw new Error(`The path "${path}" effectively has no parts.`)
        return parts;
    }

    private toOwn(v: V | V | PathMap<V> | ArrayMap<Path, V | PathMap<V>> | undefined): PathMap<V> | V | undefined {
        if(v instanceof ArrayMap)
            return new PathMap(v, this.SEPARATOR)
        else
           return v;
    }

    // impl Map
    clear(): void {
        this.map.clear()
    }
    delete(key: Path): boolean {
        return this.map.delete(this.toParts(key))
    }
    forEach(callbackfn: (value: PathMap<V>|V,key: Path,map: Map<Path,PathMap<V>|V>) => void,thisArg?: any): void {
        throw new Error("Method forEach not implemented.")
    }
    get(key: Path): PathMap<V>|V|undefined {
        return this.toOwn(this.map.get(this.toParts(key)));
    }
    has(key: Path): boolean {
        return this.map.has(this.toParts(key))
    }
    set(key: Path,value: PathMap<V>|V): this {
        this.map.set(this.toParts(key), value);
        return this;
    }
    get size(): number {
        return this.map.size
    }
    entries(): IterableIterator<[Path,PathMap<V>|V]> {
        return (function*(thiz) {
            for(const [k,v] of thiz.map.entries())
                yield [k.join(thiz.SEPARATOR),thiz.toOwn(v)!];
        })(this)
    }
    keys(): IterableIterator<Path> {
        return (function*(thiz) {
            for(const k of thiz.map.keys())
                yield k.join(thiz.SEPARATOR);
        })(this)
    }
    values(): IterableIterator<PathMap<V>|V> {
        return (function*(thiz) {
            for(const v of thiz.map.values())
                yield thiz.toOwn(v)!;
        })(this)
    }
    [Symbol.iterator](): IterableIterator<[Path,PathMap<V>|V]> {
        throw new Error("Iterator not implemented.")
    }
    [Symbol.toStringTag]: string
    // impl Map

    serialize() {
        return JSON.stringify(this, function replacer(key, value) {
            if(value instanceof PathMap) {
                return Object.fromEntries([...value.entries()].map(([k,v])=>[k,v instanceof PathMap ? v : JSON.stringify(v)]));
            } else {
                return value;
            }
        });
    }
    static deserialize<V>(text: string, separator = '/'): PathMap<V> {
        return new PathMap(JSON.parse(text, function reviver(key, value) {
            if(typeof value === 'object' && value !== null) {
                return new ArrayMap(new Map(Object.entries(value)));
            }
            return JSON.parse(value);
        }), separator);
    }
}