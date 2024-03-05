type FunctionDecoratorContext = {
    readonly kind: 'function',
    readonly name: string,
    metadata: DecoratorMetadata,
    readonly addInitializer: (initializer: (this: Function)=>void)=>void
}

namespace KITSUNE_NAMESPACE {
    type QueuedDecorator<Args extends Array<unknown>> = [decorator: (f: Function,context: FunctionDecoratorContext,...args: Args)=>Function|void, args:Args];
    export class ConstFuncClass {
        static #decorators: QueuedDecorator<unknown[]>[] = [];
        static [KitsuneLang.Internals.Level0.addLazyDecoratorSymbol](...decorator: QueuedDecorator<unknown[]>) {
            ConstFuncClass.#decorators.push(decorator);
        }
        static __decorate__(f: Function) {
            const initializerList: (()=>void)[] = [];
            const context: FunctionDecoratorContext = {
                kind: 'function',
                name: f.name,
                metadata: undefined,
                addInitializer: initializerList.push.bind(initializerList)
            }

            ConstFuncClass.#decorators.forEach(([decorator,args]) => f = decorator(f,context,...args) ?? f);
            initializerList.forEach(x=>x.apply(f));

            return f;
        };
    }
}

declare function decorated<ARGS extends unknown[]>(...args: ARGS): (...args:ARGS)=>unknown;
///#define decorated class extends KitsuneLang.Internals.Level3.ConstFuncClass{}.__decorate__