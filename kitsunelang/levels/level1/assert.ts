namespace KITSUNE_NAMESPACE {
    export type AssertionData = {str?: string, file?: string, line?: number, msg?: string};
    export class AssertionError extends Error {
        readonly file?: string;
        readonly line?: string;
        readonly expr?: string;
        constructor(data?: AssertionData | string) {
            super(AssertionError.format(data));

            data = (typeof data === 'string' ? {} : data);
            this.file = data?.file;
            this.line = data?.line?.toString();
            this.expr = data?.str;
        }
        static format(data?: AssertionData | string): string {
            let message = 'Assertion Error';
            if(data && typeof data === 'string') {
                message += `: ${data}`;
            } else if(data) {
                const {str,file,line,msg} = data as AssertionData;
                if(str) {
                    message += ` (${str})`;
                }
                if(msg) {
                    message += `: ${msg}`;
                }
                if(file && line != undefined) {
                    message += ` at ${file}:${line}`;
                }
            }
            return message;
        }
    }
}

const assert = (function() {
    function assert(expr: false, data?: KITSUNE_NAMESPACE.AssertionData | string): never;
    function assert(expr: boolean, data?: KITSUNE_NAMESPACE.AssertionData | string): void;
    function assert(expr: boolean, data?: KITSUNE_NAMESPACE.AssertionData | string) {
        if(!expr) throw new KITSUNE_NAMESPACE.AssertionError(data);
    }
    return assert;
})();

///#define __assert_overload_1__(expr) assert(expr,{str:#expr,file:__FILE__,line:__LINE__}) 
///#define __assert_overload_2__(expr,message) assert(expr,{str:#expr,file:__FILE__,line:__LINE__,msg:message})
///#define __assert_overload_n__(_,expr,message,FUNC, ...)  FUNC  
///#define assert(...) __assert_overload_n__(,##__VA_ARGS__,__assert_overload_2__(__VA_ARGS__),__assert_overload_1__(__VA_ARGS__),) 
