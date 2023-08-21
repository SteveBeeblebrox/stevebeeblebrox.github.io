console.warn('This type system is a WIP!');

// TODO complex types like nullable<t>, array<t>, map<k,v>, set<t>, typed objects, typed functions?
// maybe cast(a, T) should be the same as T(a) and not have T(a) => Parent(T)(a)?
// TODO finish casting, catch instanceof?
namespace TypeUtil {
    let typeIndex = -1;
    namespace Symbols {
        export const
            isValueOfType = Symbol('isValueOfType'),
            getDefaultValue = Symbol('getDefaultValue'),
            isUnionType = Symbol('isUnionType'),
            castValue = Symbol('castValue')
        ;
    }

    namespace TypeImpls {
        export const
            any = createMagicType<any,any,undefined>('any', ()=>void(0), ()=>true, arg=>arg),
            any_type = TypeImpls.any,

            string = createType(String, ()=>''),
            string_type = TypeImpls.string,

            number = createType(Number, ()=>0),
            number_type = TypeImpls.number,

            boolean = createType(Boolean, ()=>false),
            boolean_type = TypeImpls.boolean,

            function_type = createType(Function, ()=>function() {} as Function),

            // @ts-expect-error
            bigint = createType<[global.string | global.number | global.bigint | global.boolean], bigint, BigIntConstructor>(BigInt, ()=>0n),
            bigint_type = TypeImpls.bigint,

            symbol = createType(Symbol, ()=>Symbol()),
            symbol_type = TypeImpls.symbol,

            object = createType(Object, ()=>{}, {is: (value: unknown) => typeof value === 'object' && value !== null && !Array.isArray(value) && (!(Symbol.toStringTag in value) || value[Symbol.toStringTag] !== 'Promise')}),
            object_type = TypeImpls.object,
            
            array = createType(Array, ()=>[] as any[], {name: 'array', is: (value: unknown)=>Array.isArray(value)}),
            array_type = TypeImpls.array,

            undefined = createUniqueType(void(0)),
            undefined_type = TypeImpls.undefined,

            null_type = createUniqueType(null),

            // @ts-expect-error
            promise = createType<[global.any], Promise, PromiseConstructor>(Promise, ()=>Promise.resolve(), {name: 'promise', is: (value: unknown) => typeof value === 'object' && value !== null && (Symbol.toStringTag in value && value[Symbol.toStringTag] === 'Promise'), construct: arg => Promise.resolve(arg)}),
            promise_type = TypeImpls.promise
        ;

        export const union = (function() {
            function decompose(mask: number): Type[] {
                let index = -1, types: Type[] = [];
                while(mask>0) {
                    ++index;
                    if(mask&0b1) {
                        types.push(Reflect.get(TypeImpls, 2**index))
                    }
                    mask>>=1
                }
                return types;
            }

            function union(mask: number): ResolvedUnionType;
            function union(...types: Type[]): ResolvedUnionType;
            function union(): ResolvedUnionType {
                const types: Type[] = typeof arguments[0] === 'number' && arguments.length === 1 ? decompose(arguments[0]) : [...arguments].flatMap(type =>  type[Symbols.isUnionType] ? type.unionBaseTypes : [type]);
                const name = types.map(type => type.name).join(' | '); 
                const value = {
                    name,
                    unionBaseTypes: types,
                    [Symbols.isUnionType]: true,
                    [Symbols.isValueOfType]: (value: unknown) => types.some(type => type[Symbols.isValueOfType](value)),
                    [Symbols.getDefaultValue]: types[0][Symbols.getDefaultValue]
                }
                // @ts-expect-error
                value.toString = value[Symbol.toStringTag] = value.valueOf = () => name;

                // @ts-expect-error
                value[Symbol.toPrimitive] = (hint) => hint === 'number' ? 0 : value.toString();
                return Object.freeze(value) as unknown as ResolvedUnionType;
            }

            return union;
        })();
        export const union_type = TypeImpls.union;
    }

    type ReservedTypeNames = 'function' | 'null'
    Reflect.set(TypeImpls, 'null', TypeImpls.null_type);
    Reflect.set(TypeImpls, 'function', TypeImpls.function_type);
    type Types = typeof TypeImpls & {
        [k in ReservedTypeNames]: typeof TypeImpls[`${k}_type`]
    }

    export const Types = TypeImpls as unknown as Types;

    type TypeImpl<T> = {
        name: string,
        [Symbols.isValueOfType](value: unknown): value is T
        [Symbols.getDefaultValue](): T,
        [Symbol.toPrimitive]: (hint: string)=>string|number,
        toString: ()=>string,
        valueOf: ()=>string
        [Symbol.toStringTag]: string
    }
    type Type = TypeImpl<unknown>;
    type ResolvedUnionType = Type & {unionBaseTypes: Type[], [Symbols.isUnionType]: true};
    type UnionType = number | ResolvedUnionType;
    type ValueTypeImpl<T> = TypeImpl<T> & {[Symbols.castValue](value: unknown): T};
    type StringTypeName = Exclude<keyof Types, `${string}_type`>;
    type NonValueStringTypeName = 'union';
    type ValueStringTypeName = Exclude<StringTypeName, NonValueStringTypeName>;

    function createType<Args extends [], ReturnType, ParentType extends (...args: Args)=>ReturnType>(base: ParentType, getDefaultValue: ()=>ReturnType, {name = base.name.toLowerCase(), is = (value: unknown) => typeof value === name, construct = (...args: Args) => base(...args) } = {}): Readonly<ParentType & TypeImpl<ReturnType>> {
        const value = {[name](...args: Args) { return construct(...args); }}[name];
        const props = Object.getOwnPropertyDescriptors(base);
        delete props.name;
        Object.defineProperties(value, props);
        // @ts-expect-error
        value.toString = value[Symbol.toStringTag] = value.valueOf = () => name;
        
        // @ts-expect-error
        value[Symbols.isValueOfType] = is;
        
        // @ts-expect-error
        value[Symbols.getDefaultValue] = getDefaultValue;

        const index = 2**++typeIndex;

        // @ts-expect-error
        value[Symbol.toPrimitive] = (hint) => hint === 'number' ? index : value.toString();

        Reflect.set(TypeImpls, index, value);

        return Object.freeze(value) as unknown as ParentType & TypeImpl<ReturnType>;
    }

    function createUniqueType<T>(uniqueValue: T): Readonly<ValueTypeImpl<T>> {
        const name = `${uniqueValue}`, value = {[name]() { return uniqueValue; }}[name];
        // @ts-expect-error
        value.toString = value[Symbol.toStringTag] = value.valueOf = () => name;

        // @ts-expect-error
        value[Symbols.isValueOfType] = (value: unknown) => value === uniqueValue;
        
        // @ts-expect-error
        value[Symbols.getDefaultValue] = () => uniqueValue;
        
        const index = 2**++typeIndex;

        // @ts-expect-error
        value[Symbol.toPrimitive] = (hint) => hint === 'number' ? index : value.toString();

        // @ts-expect-error
        value[Symbols.castValue] = () => uniqueValue;

        Reflect.set(TypeImpls, index, value);
        
        return Object.freeze(value) as unknown as ValueTypeImpl<T>;
    }

    function createMagicType<Args extends [], ReturnType, DefaultType>(name: string, getDefaultValue: ()=>DefaultType, is: (value: unknown)=>boolean, construct: (...args: Args)=>ReturnType): Readonly<ValueTypeImpl<ReturnType>> {
        const value = {[name](...args: Args) { return construct(...args); }}[name];
        // @ts-expect-error
        value.toString = value[Symbol.toStringTag] = value.valueOf = () => name;

        // @ts-expect-error
        value[Symbols.isValueOfType] = is;
        
        // @ts-expect-error
        value[Symbols.getDefaultValue] = getDefaultValue;
        
        const index = 2**++typeIndex;

        // @ts-expect-error
        value[Symbol.toPrimitive] = (hint) => hint === 'number' ? index : value.toString();

        // @ts-expect-error
        value[Symbols.castValue] = construct;

        Reflect.set(TypeImpls, index, value);
        
        return Object.freeze(value) as unknown as ValueTypeImpl<ReturnType>;
    }

    export function is<T>(value: unknown, type: Type | StringTypeName | UnionType): value is T {
        return getImpl(resolveUnionType(type))[Symbols.isValueOfType](value);
    }
    
    export function cast<T>(value: unknown, type: ValueTypeImpl<T> | ValueStringTypeName): T {
        const typeImpl = getImpl(type) as ValueTypeImpl<T>;
        if(typeImpl[Symbols.isValueOfType](value)) {
            return value as T;
        } else {
            return typeImpl[Symbols.castValue](value);
        }
    }

    export function getDefault<T>(type: ValueTypeImpl<T> | ValueStringTypeName): T {
        return (getImpl(type) as ValueTypeImpl<T>)[Symbols.getDefaultValue]();
    }

    export const ValueTypes: {[key in ValueStringTypeName]: Types[key]} = Object.fromEntries(Object.entries(TypeImpls).flatMap(function([key, value]) {
        return /(?:^(?:\d+|union)$|_type$)/.test(key) ? [] : [[key, value as Type]];
    })) as {[key in ValueStringTypeName]: Types[key]};

    export function typeOf(value: unknown): Type {
        return Object.values(ValueTypes).find((type: Type) => type !== TypeImpls.any && type[Symbols.isValueOfType](value)) ?? TypeImpls.any;
    }

    export const unbox = (function() {
        function unbox(value: String): string;
        function unbox(value: Number): number;
        function unbox(value: Boolean): boolean;
        function unbox<T>(value: T): T;
        function unbox(value: any): any {
            if(value instanceof String) {
                return value.toString();
            } else if(value instanceof Number) {
                return value.valueOf();
            } else if(value instanceof Boolean) {
                return value.valueOf();
            } else {
                return value;
            }
        }
        return unbox;
    })();

    export const box = (function() {
        function box(value: string): String;
        function box(value: number): Number;
        function box(value: boolean): Boolean;
        function box<T>(value: T): T;
        function box(value: any): any {
            switch(typeOf(value)) {
                case TypeImpls.string_type:
                    return new String(value);
                case TypeImpls.number_type:
                    return new Number(value);
                case TypeImpls.boolean_type:
                    return new Boolean(value);
                default:
                    return value;
            }
        }
        return box;
    })();
    
    export class TypeError extends globalThis.TypeError {
        constructor(expected: UnionType | StringTypeName | Type, actual: StringTypeName | Type, key?: string | null, message: string = `Expected ${resolveUnionType(expected)}${key ? ` for ${key}` : ''} but got ${actual}`) {
            super(message)
        }
    }

    export function expect(values: object, type: Type | StringTypeName | UnionType, message?: string) {
        Object.entries(values).forEach(function([key, value]) {
            if(!is(value, type))
                throw new TypeError(type, typeOf(value), key, message);
        });
    }
    export function expectNot(values: object, type: Type | StringTypeName | UnionType, message?: string) {
        Object.entries(values).forEach(function([key, value]) {
            if(is(value, type))
                throw new TypeError(type, typeOf(value), key, message);
        });
    }

    function resolveUnionType(type: Type | StringTypeName | UnionType): Type | StringTypeName | ResolvedUnionType {
        if(typeof type === 'number') {
            return TypeImpls.union(type);
        } else {
            return type;
        }
    }

    function getImpl(type: Type | StringTypeName): Type {
        return typeof type === 'string' ? Reflect.get(TypeImpls, type) : type;
    }


}

console.clear()

const {is,typeOf,cast,box,unbox,Types: {number,boolean,null_type,array,bigint,promise,any}} = TypeUtil;


console.log(TypeUtil.cast(2,null_type))

console.log(TypeUtil.is(false, boolean | number), promise(1), cast(1, any), null_type(1))