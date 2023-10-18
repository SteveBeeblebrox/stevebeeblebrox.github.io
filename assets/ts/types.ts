console.warn('This type system is a WIP!');

// TODO complex types like nullable<t>, array<t>, map<k,v>, set<t>, typed objects, typed functions?
// maybe cast(a, T) should be the same as T(a) and not have T(a) => Parent(T)(a)?
// TODO finish casting, catch instanceof?
// move default to valuetypeimpl
namespace TypeChecking {
    let typeIndex = -1;
    namespace IU /*InternalUtility*/ {
        export namespace Symbols {
            export const
                isValueOfType = Symbol('isValueOfType'),
                getDefaultValue = Symbol('getDefaultValue'),
                isUnionType = Symbol('isUnionType'),
                castValue = Symbol('castValue')
            ;
        }

        export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

        // Creation //
        export function registerTypeIndex<T>(value: Writeable<TypeImplementation<T>>) {
            const index = 2**++typeIndex;
            value[Symbol.toPrimitive] = (hint) => hint === 'number' ? index : value.toString();
            Reflect.set(Implementations, index, value);
        }
        export function registerTypeName<T>(value: Writeable<TypeImplementation<T>>,name: string) {
            value.toString = value.valueOf = () => name;
            value[Symbol.toStringTag] = name;
        }

        // Resolving //
        export function resolveUnionType(type: Type | StringTypeName | UnionType): Type | StringTypeName | ResolvedUnionType {
            if(typeof type === 'number') {
                return Implementations.union(type);
            } else {
                return type;
            }
        }

        export function getImplementation(type: Type | StringTypeName): Type {
            return typeof type === 'string' ? Reflect.get(Implementations, type) : type;
        }
    }

    namespace Implementations {
        export const
            any = createMagicType<any,any,undefined>('any', ()=>void(0), ()=>true, arg=>arg),
            any_type = Implementations.any,

            string = createType(String, ()=>''),
            string_type = Implementations.string,

            number = createType(Number, ()=>0),
            number_type = Implementations.number,

            boolean = createType(Boolean, ()=>false),
            boolean_type = Implementations.boolean,

            function_type = createType(Function, ()=>function() {} as Function),
            _function = Reflect.set(Implementations, 'function', Implementations.function_type),

            // @ts-expect-error
            bigint = createType<[global.string | global.number | global.bigint | global.boolean], bigint, BigIntConstructor>(BigInt, ()=>0n),
            bigint_type = Implementations.bigint,

            symbol = createType(Symbol, ()=>Symbol()),
            symbol_type = Implementations.symbol,

            object = createType(Object, ()=>{}, {is: (value: unknown) => typeof value === 'object' && value !== null && !Array.isArray(value) && (!(Symbol.toStringTag in value) || value[Symbol.toStringTag] !== 'Promise')}),
            object_type = Implementations.object,
            
            array = createType(Array, ()=>[] as any[], {name: 'array', is: (value: unknown)=>Array.isArray(value)}),
            array_type = Implementations.array,

            undefined = createSingletonType(void(0)),
            undefined_type = Implementations.undefined,

            null_type = createSingletonType(null),
            _null = Reflect.set(Implementations, 'null', Implementations.null_type),


            // @ts-expect-error
            promise = createType<[global.any], Promise, PromiseConstructor>(Promise, ()=>Promise.resolve(), {name: 'promise', is: (value: unknown) => typeof value === 'object' && value !== null && (Symbol.toStringTag in value && value[Symbol.toStringTag] === 'Promise'), construct: arg => Promise.resolve(arg)}),
            promise_type = Implementations.promise
        ;

        export const union = (function() {
            function decompose(mask: number): Type[] {
                let index = -1, types: Type[] = [];
                while(mask>0) {
                    ++index;
                    if(mask&0b1) {
                        types.push(Reflect.get(Implementations, 2**index))
                    }
                    mask>>=1
                }
                return types;
            }

            function union(mask: number): ResolvedUnionType;
            function union(...types: Type[]): ResolvedUnionType;
            function union(): ResolvedUnionType {
                const types: Type[] = typeof arguments[0] === 'number' && arguments.length === 1 ? decompose(arguments[0]) : [...arguments].flatMap(type =>  type[IU.Symbols.isUnionType] ? type.unionBaseTypes : [type]);
                const name = types.map(type => type.name).join(' | '); 
                const value = {
                    name,
                    unionBaseTypes: types,
                    [IU.Symbols.isUnionType]: true,
                    [IU.Symbols.isValueOfType]: (value: unknown) => types.some(type => type[IU.Symbols.isValueOfType](value)),
                    [IU.Symbols.getDefaultValue]: types[0][IU.Symbols.getDefaultValue]
                }
                // @ts-expect-error
                value.toString = value[Symbol.toStringTag] = value.valueOf = () => name;

                // @ts-expect-error
                value[Symbol.toPrimitive] = (hint) => hint === 'number' ? types.reduce((a,c)=>a|c,0) : value.toString();

                // @ts-expect-error
                value[IU.Symbols.castValue] = () => function() {throw new Error('Cannot cast to union type.')};

                return Object.freeze(value) as unknown as ResolvedUnionType;
            }

            return union;
        })();
        export const union_type = Implementations.union;
    }

    // These names can't be directly assigned but have string accessors
    type ReservedTypeNames = 'function' | 'null'
    
    type CoreTypes = Omit<typeof Implementations & {
        [k in ReservedTypeNames]: typeof Implementations[`${k}_type`]
    }, `_${string}`>

    export const Types = Implementations as unknown as CoreTypes;

    type TypeImplementation<T> = Readonly<{
        name: string,
        [IU.Symbols.isValueOfType](value: unknown): value is T
        [IU.Symbols.getDefaultValue](): T,
        [Symbol.toPrimitive]: (hint: string)=>string|number,
        toString: ()=>string,
        valueOf: ()=>string
        [Symbol.toStringTag]: string
    }>
    type Type = TypeImplementation<unknown>;
    type ResolvedUnionType = Type & {unionBaseTypes: Type[], [IU.Symbols.isUnionType]: true};
    type UnionType = number | ResolvedUnionType;
    type ValueTypeImplementation<T> = TypeImplementation<T> & {[IU.Symbols.castValue](value: unknown): T};
    type StringTypeName = Exclude<keyof CoreTypes, `${string}_type`>;
    type NonValueStringTypeName = 'union';
    type ValueStringTypeName = Exclude<StringTypeName, NonValueStringTypeName>;

    function createType<Args extends [], ReturnType, ParentType extends (...args: Args)=>ReturnType>(base: ParentType, getDefaultValue: ()=>ReturnType, {name = base.name.toLowerCase(), is = (value: unknown) => typeof value === name, construct = (...args: Args) => base(...args) } = {}): Readonly<ParentType & TypeImplementation<ReturnType>> {
        const value: IU.Writeable<TypeImplementation<ReturnType>> = {[name](...args: Args) { return construct(...args); }}[name] as any;
        
        // Copy parent props
        const props = Object.getOwnPropertyDescriptors(base);
        delete props.name;
        Object.defineProperties(value, props);
        
        IU.registerTypeName(value,name);

        // @ts-expect-error
        value[IU.Symbols.isValueOfType] = is;
        
        value[IU.Symbols.getDefaultValue] = getDefaultValue;

        IU.registerTypeIndex(value);

        return Object.freeze(value) as unknown as ParentType & TypeImplementation<ReturnType>;
    }

    function createSingletonType<T>(uniqueValue: T): Readonly<ValueTypeImplementation<T>> {
        const name = `${uniqueValue}`, value: IU.Writeable<TypeImplementation<T>> = {[name]() { return uniqueValue; }}[name] as any;

        IU.registerTypeName(value,name);

        // @ts-expect-error
        value[IU.Symbols.isValueOfType] = (value: unknown) => value === uniqueValue;
        
        value[IU.Symbols.getDefaultValue] = () => uniqueValue;

        IU.registerTypeIndex(value);

        // @ts-expect-error
        value[IU.Symbols.castValue] = () => uniqueValue;
        
        return Object.freeze(value) as unknown as ValueTypeImplementation<T>;
    }

    function createMagicType<Args extends [], ReturnType, DefaultType>(name: string, getDefaultValue: ()=>DefaultType, is: (value: unknown)=>boolean, construct: (...args: Args)=>ReturnType): Readonly<ValueTypeImplementation<ReturnType>> {
        const value = {[name](...args: Args) { return construct(...args); }}[name];
        // @ts-expect-error
        value.toString = value[Symbol.toStringTag] = value.valueOf = () => name;

        // @ts-expect-error
        value[IU.Symbols.isValueOfType] = is;
        
        // @ts-expect-error
        value[IU.Symbols.getDefaultValue] = getDefaultValue;
        
        const index = 2**++typeIndex;

        // @ts-expect-error
        value[Symbol.toPrimitive] = (hint) => hint === 'number' ? index : value.toString();

        // @ts-expect-error
        value[IU.Symbols.castValue] = construct;

        Reflect.set(Implementations, index, value);
        
        return Object.freeze(value) as unknown as ValueTypeImplementation<ReturnType>;
    }

    export function is<T>(value: unknown, type: Type | StringTypeName | UnionType): value is T {
        return IU.getImplementation(IU.resolveUnionType(type))[IU.Symbols.isValueOfType](value);
    }
    
    export function cast<T>(value: unknown, type: ValueTypeImplementation<T> | ValueStringTypeName): T {
        const typeImpl = IU.getImplementation(type) as ValueTypeImplementation<T>;
        if(typeImpl[IU.Symbols.isValueOfType](value)) {
            return value as T;
        } else {
            return typeImpl[IU.Symbols.castValue](value);
        }
    }

    export function getDefaultValue<T>(type: ValueTypeImplementation<T> | ValueStringTypeName): T {
        return (IU.getImplementation(type) as ValueTypeImplementation<T>)[IU.Symbols.getDefaultValue]();
    }

    export const ValueTypes: {[key in ValueStringTypeName]: CoreTypes[key]} = Object.fromEntries(Object.entries(Implementations).flatMap(function([key, value]) {
        return /(?:^(?:\d+|union)$|_type$)/.test(key) ? [] : [[key, value as Type]];
    })) as {[key in ValueStringTypeName]: CoreTypes[key]};

    export function typeOf(value: unknown): Type {
        return Object.values(ValueTypes).find((type: Type) => type !== Implementations.any && type[IU.Symbols.isValueOfType](value)) ?? Implementations.any;
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
                case Implementations.string_type:
                    return new String(value);
                case Implementations.number_type:
                    return new Number(value);
                case Implementations.boolean_type:
                    return new Boolean(value);
                default:
                    return value;
            }
        }
        return box;
    })();
    
    export class TypeError extends globalThis.TypeError {
        constructor(expected: UnionType | StringTypeName | Type, actual: StringTypeName | Type, key?: string | null, message: string = `Expected ${IU.resolveUnionType(expected)}${key ? ` for ${key}` : ''} but got ${actual}`) {
            super(message)
        }
    }

    export function expectType(values: object, type: Type | StringTypeName | UnionType, message?: string) {
        Object.entries(values).forEach(function([key, value]) {
            if(!is(value, type))
                throw new TypeError(type, typeOf(value), key, message);
        });
    }
}
const tc = TypeChecking;
const Types = TypeChecking.Types

console.clear()

const {is,typeOf,cast,box,unbox,Types: {number,boolean,null_type,array,bigint,string,promise,any,union}} = TypeChecking;


//console.log(TypeUtil.cast(2,null_type))

//console.log(TypeUtil.is(false, boolean | number), promise(1), cast(1, any), null_type(1))
console.log(tc.is(1n,boolean | union(number | bigint)), cast(1,Types.string))
