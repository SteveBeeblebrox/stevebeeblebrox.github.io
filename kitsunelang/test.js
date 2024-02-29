var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var KitsuneLang;
(function (KitsuneLang) {
    // @ts-expect-error
    KitsuneLang.LEVEL = 3;
    KitsuneLang.VERSION = null;
})(KitsuneLang || (KitsuneLang = {}));
Object.defineProperty(globalThis, '_', { get() { }, set() { } });
;
(function () {
    function isPromiseProperty(property) {
        return Object.getOwnPropertyNames(Promise.prototype).includes(property) || property === Symbol.toStringTag;
    }
    function inlineAwaiter(thePromise) {
        return new Proxy(thePromise, {
            get(target, property, receiver) {
                console.log(property);
                if (isPromiseProperty(property)) {
                    let details = '';
                    if (property === 'then') {
                        details = `, this error could be because you have a trailing '.await'`;
                    }
                    else if (property === 'await') {
                        details = `, don't double up chained awaits (e.g., '.await.await')`;
                    }
                    throw new Error(`Await chains themselves are not promises${details}`);
                }
                else {
                    return new Proxy(async function () {
                        const value = (await target), f = value[property];
                        if (typeof f === 'function') {
                            return f.bind(value)(...arguments);
                        }
                        else {
                            throw new Error(`'${String(property)}' is not a function`);
                        }
                    }, {
                        get(_, property2) {
                            if (property2 === 'then') {
                                return async function then(resolve, reject) {
                                    try {
                                        resolve((await target)[property]);
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                };
                            }
                            else if (property2 === Symbol.toStringTag) {
                                return 'Promise';
                            }
                            else if (property2 === 'await') {
                                return inlineAwaiter((async () => (await target)[property])());
                            }
                            else {
                                throw new Error(`Property '${String(property2)}' does not exist on '${String(property)}'. Do you need to add a chained await? ('${String(property)}.await.${String(property2)}')`);
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
    });
})();
Promise.isPromise ??= function isPromise(arg) {
    return !!arg && arg[Symbol.toStringTag] === 'Promise';
};
const throws = (e) => { throw e; };
const importScript = async function importScript(src) {
    const result = await fetch(src);
    if (!result.ok) {
        throw new TypeError(`Failed to fetch dynamically evaluated script: ${src}`);
    }
    return eval(await result.text());
};
var DecoratorFactory;
(function (DecoratorFactory) {
    function isDecoratorContext(arg) {
        return typeof arg === 'object' && arg !== null && ['kind', 'name'].every(key => Object.hasOwn(arg, key));
    }
    function isFactoryCall(...args) {
        return !((typeof args[0] === 'function' || typeof args[0] === 'undefined') && isDecoratorContext(args[1]));
    }
    function invokeDefault(value, context, ...args) {
        return context.kind === 'class' ? new value(...args) : value(...args);
    }
    DecoratorFactory.invokeDefault = invokeDefault;
    function decorator(f) {
        function decorate(...args) {
            if (isFactoryCall(...args)) {
                return (value, context) => value?.[KitsuneLang.Internals.Level0.addLazyDecoratorSymbol] ? void value[KitsuneLang.Internals.Level0.addLazyDecoratorSymbol](f, args) : f(value, context, ...args);
            }
            else {
                const [value, context] = args;
                return value?.[KitsuneLang.Internals.Level0.addLazyDecoratorSymbol] ? void value[KitsuneLang.Internals.Level0.addLazyDecoratorSymbol](f, []) : f(value, context, ...[]);
            }
        }
        return decorate;
    }
    DecoratorFactory.decorator = decorator;
})(DecoratorFactory || (DecoratorFactory = {}));
(function (KitsuneLang) {
    var Internals;
    (function (Internals) {
        var Level0;
        (function (Level0) {
            Level0.addLazyDecoratorSymbol = Symbol('addLazyDecorator');
        })(Level0 = Internals.Level0 || (Internals.Level0 = {}));
    })(Internals = KitsuneLang.Internals || (KitsuneLang.Internals = {}));
})(KitsuneLang || (KitsuneLang = {}));
const deprecated = DecoratorFactory.decorator((value, context, level = 'warn') => function () {
    Reflect.get(console, level).bind(console)(`Use of ${context.kind} ${context.name?.toString?.()} is deprecated!`);
    return context.kind === 'class' ? new value(...arguments) : value(...arguments);
});
const __nameof__ = (prop) => prop.match(/[^.!]+(?=!?$)/)[0];
(function (KitsuneLang) {
    var Internals;
    (function (Internals) {
        var Level1;
        (function (Level1) {
            class AssertionError extends Error {
                file;
                line;
                expr;
                constructor(data) {
                    super(AssertionError.format(data));
                    data = (typeof data === 'string' ? {} : data);
                    this.file = data?.file;
                    this.line = data?.line?.toString();
                    this.expr = data?.str;
                }
                static format(data) {
                    let message = 'Assertion Error';
                    if (data && typeof data === 'string') {
                        message += `: ${data}`;
                    }
                    else if (data) {
                        const { str, file, line, msg } = data;
                        if (str) {
                            message += ` (${str})`;
                        }
                        if (msg) {
                            message += `: ${msg}`;
                        }
                        if (file && line != undefined) {
                            message += ` at ${file}:${line}`;
                        }
                    }
                    return message;
                }
            }
            Level1.AssertionError = AssertionError;
        })(Level1 = Internals.Level1 || (Internals.Level1 = {}));
    })(Internals = KitsuneLang.Internals || (KitsuneLang.Internals = {}));
})(KitsuneLang || (KitsuneLang = {}));
const assert = (function () {
    function assert(expr, data) {
        if (!expr)
            throw new KitsuneLang.Internals.Level1.AssertionError(data);
    }
    return assert;
})();
const __partial__ = (args, i = 0) => new Proxy(Object.create(null), { has: (_, p) => typeof p === 'string' && /^_\d*$/.test(p), get: (_, p) => typeof p === 'string' ? (p === '_' ? args[i++] : args[+p.substring(1)]) : undefined });
(function (KitsuneLang) {
    var Internals;
    (function (Internals) {
        var Level3;
        (function (Level3) {
            class ConstFuncClass {
                static #decorators = [];
                static [KitsuneLang.Internals.Level0.addLazyDecoratorSymbol](...decorator) {
                    ConstFuncClass.#decorators.push(decorator);
                }
                static __decorate__(f) {
                    const initializerList = [];
                    const context = {
                        kind: 'constfn',
                        name: f.name,
                        metadata: undefined,
                        addInitializer: initializerList.push.bind(initializerList)
                    };
                    ConstFuncClass.#decorators.forEach(([decorator, args]) => f = decorator(f, context, ...args) ?? f);
                    initializerList.forEach(x => x.apply(f));
                    return f;
                }
                ;
            }
            Level3.ConstFuncClass = ConstFuncClass;
        })(Level3 = Internals.Level3 || (Internals.Level3 = {}));
    })(Internals = KitsuneLang.Internals || (KitsuneLang.Internals = {}));
})(KitsuneLang || (KitsuneLang = {}));
const x = ((() => {
    let _classDecorators = [deprecated];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = KitsuneLang.Internals.Level3.ConstFuncClass;
    var class_1 = class extends _classSuper {
        static { _classThis = this; }
        static { __setFunctionName(_classThis, ""); }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            class_1 = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return class_1 = _classThis;
})()).__decorate__(function f(a) {
    console.log(`${"a"}=${a}`);
});
console.log(KitsuneLang.LEVEL);
x(1);
