///#pragma once
const deprecated = DecoratorFactory.decorator((value, context, level:'warn'|'error'|'debug'|'log'='warn') => function(): InstanceType<DecoratorFactory.Class> | ReturnType<DecoratorFactory.Function> {
    Reflect.get(console,level).bind(console)(`Use of ${context.kind} ${context.name?.toString?.()} is deprecated!`)
    return context.kind === 'class' ? new (value as DecoratorFactory.Class)(...arguments) : (value as DecoratorFactory.Function)(...arguments)
} as any);