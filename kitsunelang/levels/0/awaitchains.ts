///#pragma once
; (function() {
    function isPromiseProperty(property: PropertyKey) {
        return Object.getOwnPropertyNames(Promise.prototype).includes(property as string) || property === Symbol.toStringTag;
    }
    function inlineAwaiter<T,>(thePromise: Promise<T>): Promise<T> {
        return new Proxy(thePromise, {
            get(target, property, receiver) {
                console.log(property)
                if(isPromiseProperty(property)) {
                    let details = '';
                    if(property === 'then') {
                        details = `, this error could be because you have a trailing '.await'`
                    } else if(property === 'await') {
                        details = `, don't double up chained awaits (e.g., '.await.await')`
                    }
                    throw new Error(`Await chains themselves are not promises${details}`)
                } else {
                    return new Proxy(async function() {
                        const value = ((await target) as any), f = value[property];
                        if(typeof f === 'function') {
                            return f.bind(value)(...arguments);
                        } else {
                            throw new Error(`'${String(property)}' is not a function`);
                        }
                    }, {
                        get(_, property2) {
                            if(property2 === 'then') {
                                return async function then(resolve: (arg: any)=>any, reject: (arg: any)=>any) {
                                    try {
                                        resolve(((await target) as any)[property]);
                                    } catch(e) {
                                        reject(e);
                                    }
                                }
                            } else if(property2 === Symbol.toStringTag) {
                                return 'Promise';
                            } else if(property2 === 'await') {
                                return inlineAwaiter((async ()=>((await target) as any)[property])());
                            } else {
                                throw new Error(`Property '${String(property2)}' does not exist on '${String(property)}'. Do you need to add a chained await? ('${String(property)}.await.${String(property2)}')`)
                            }
                        }
                    });
                }
            }
        });
    }

    Object.defineProperty(Promise.prototype, 'await', {
        get() {
            return inlineAwaiter(this);
        }
    })
})();

declare interface Promise<T> {
    await: {
        [k in keyof Awaited<T>]:
            Awaited<T>[k] extends (...args: infer Args)=>infer Return
                ? (...args: Args) => Promise<Awaited<Return>>
                : Promise<Awaited<Awaited<T>[k]>>
    } & Omit<Promise<T>, 'await'>;
}