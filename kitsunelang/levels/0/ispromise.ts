///#pragma once
declare interface PromiseConstructor {
    isPromise(arg: any): arg is Promise<any>;
}

Promise.isPromise??=function isPromise(arg: any): arg is Promise<any> {
    return !!arg && (arg as any)[Symbol.toStringTag] === 'Promise';
}