/*
 * MIT License
 * 
 * Copyright (c) 2023 Trin Wasinger
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
class AssertionError extends Error {
    constructor(message?: string | undefined) {
        super(`Assertion failed` + (message ? ': ' : '') + message??'');
    }
}

const assert = (function() {
    function assert(condition: false, message?: string): never
    function assert(condition: boolean, message?: string): void
    function assert(condition: boolean, message: string = '') {
        if(!condition) throw new AssertionError(message);
    }
    return assert;
})();

const throws = (e: any) => { throw e };

declare interface PromiseConstructor {
    isPromise(arg: any): arg is Promise<any>;
}

Promise.isPromise??=function isPromise(arg: any): arg is Promise<any> {
    return !!arg && (arg as any)[Symbol.toStringTag] === 'Promise';
}

function tryOr<T,R extends T | Promise<T>>(f: ()=>R, fallback: T): R {
    try {
        const value = f();
        return (Promise.isPromise(value) ? (async function() {
            try {
                return await value;
            } catch {
                return fallback
            }
        })() : value) as R;
    } catch {
        return fallback as R;
    }
}

function Mapping<T extends Record<K, V>, K extends PropertyKey, V extends PropertyKey>(values: T): T & {[P in keyof T as T[P]]: P} & Record<keyof Object, never> {
    return Object.defineProperties(Object.create(null), Object.fromEntries([...Object.entries(values), ...Object.entries(values).map(o=>o.toReversed())].map(([key, value]) => [key, {value, enumerable: true}])));
}

namespace DecoratorFactory {
    function isDecoratorContext(arg: unknown): arg is DecoratorContext {
        return typeof arg === 'object' && arg !== null && ['kind','name'].every(key=>Object.hasOwn(arg,key))
    }
    function isFactoryCall(...args: unknown[]) {
        return !((typeof args[0] === 'function' || typeof args[0] === 'undefined') && isDecoratorContext(args[1])); 
    }
    export function invokeDefault(value: Class | Function, context: DecoratorContext, ...args: unknown[]) {
        return context.kind === 'class' ? new (value as DecoratorFactory.Class)(...args) : (value as DecoratorFactory.Function)(...args)
    }
    export function decorator<Context extends DecoratorContext, Args extends Array<unknown>,Value,Return extends Function | void>(f: (value: Value, context: Context, ...args: Partial<Args>) => Return) {
        function decorate(...args: Partial<Args>): (value: Value, context: Context)=>Return;
        function decorate(value: Value, context: Context): Return;
        function decorate(...args: Partial<Args> | [Value, Context]) {
            if(isFactoryCall(...args)) {
                return (value: Value, context: Context) => f(value, context, ...args as Args);
            } else {
                const [value, context] = args as [Value, Context];
                return f(value, context, ...([] as unknown[] as Args));
            }
        }
        return decorate;
    }
    export type Class<A extends Array<unknown> = any[], R = any> = new (...args: A) => R;
    export type Function<A extends Array<unknown> = any[], R = any> = (...args: A) => R
}

const deprecated = DecoratorFactory.decorator((value, context, level:'warn'|'error'|'debug'|'log'='warn') => function(): InstanceType<DecoratorFactory.Class> | ReturnType<DecoratorFactory.Function> {
    Reflect.get(console,level).bind(console)(`Use of ${context.kind} ${context.name?.toString?.()} is deprecated!`)
    return context.kind === 'class' ? new (value as DecoratorFactory.Class)(...arguments) : (value as DecoratorFactory.Function)(...arguments)
} as any);

const importScript = async function importScript(src: string): Promise<unknown> {
    const result = await fetch(src);
    if(!result.ok) {
        throw new TypeError(`Failed to fetch dynamically evaluated script: ${src}`);
    }
    return eval(await result.text());
}