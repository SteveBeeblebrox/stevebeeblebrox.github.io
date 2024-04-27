console.clear()
function t() {
    throw new Error();
}

const pass = Symbol('pass');

try {
    try {
        t();
    } catch(e) {
        match(e)({
            null: pass,
            SyntaxError: pass,
            TypeError:=>console.log('type/syntax error'),
            _:_=>{throw _},
            //[[1,2]]:=>'array'
        });
        
    }
} catch(e) {
    console.error(e.stack);
}

type MatchArm<ArgType,Result> = (arg: ArgType)=>Result;
type MatchBody<ArgType,Result> = {[key: string]: MatchArm<ArgType,Result> | Result | typeof pass}

/**
 * 
 * TODO, refactor to use rtti
 * 
 * Arms:
 * value => <return value>
 * <return value>
 * pass
 * 
 * Patterns:
 * true,false,null
 * string,number,bigint,boolean,symbol,undefined,object,function
 * <numeric literal>
 * <Range>
 * <Class Name>
 * _
 */
function match<T>(value: T) {
    return function<R>(pattern: MatchBody<T,R>) {
        let isFalling = false;
        let reMatches;
        for(const key of Object.keys(pattern) as (keyof typeof pattern)[]) {
            if(
                isFalling
                || key === '_'
                || key === value?.constructor.name
                || key === 'true' && value === true
                || key === 'false' && value === false
                || key === 'null' && value === null
                || +key === value
                // Todo bigint literals, move typeof to custom type
                || key === typeof value && value !== null
                || typeof key === 'string' && typeof value === 'number'
                    && (reMatches = key.match(/^\[object Range\((?<min>\d+(\.\d+)?),\s*(?<max>\d+(\.\d+)?),\s*(?<step>\d+(\.\d+)?)\)\]$/))
                    && range(+reMatches.groups!.min,+reMatches.groups!.max,+reMatches.groups!.step).includes(value)
                || typeof key === 'string' && typeof value === 'bigint'
                    && (reMatches = key.match(/^\[object Range\((?<min>\d+)n,\s*(?<max>\d+)n,\s*(?<step>\d+)n\)\]$/))
                    && range(BigInt(reMatches.groups!.min),BigInt(reMatches.groups!.max),BigInt(reMatches.groups!.step)).includes(value)
            ) {
                const arm = pattern[key];

                if(arm === pass) {
                    isFalling = true;
                    continue;
                }

                if(typeof arm === 'function') {
                    return (arm as MatchArm<T,R>)(value);
                }

                return arm;
            }
            isFalling = false;
        }
        return undefined;
    }
}

class JSONLiteral {
    constructor(private readonly value: JSONValue) {};
    // toString()
}
type JSONValue = number | boolean | string | null | JSONValue[] | {[key: string]: JSONValue};

namespace MatchUtil {

    class Range<T extends number | bigint> {
        private constructor(
            private readonly min: T,
            private readonly max: T,
            private readonly step: T
        ) {
            if(step === 0 || step as any === 0n) {
                throw new RangeError('Range step cannot be 0');
            }
        }

        *[Symbol.iterator](): IterableIterator<T> {
            let n = this.min;
            while(n < this.max) {
                //@ts-expect-error
                yield (n+=this.step)-this.step;
            }
        }

        toString() {
            return `[object Range(${this.min}${typeof this.min === 'bigint' ? 'n' : ''}, ${this.max}${typeof this.max === 'bigint' ? 'n' : ''}, ${this.step}${typeof this.step === 'bigint' ? 'n' : ''})]`
        }

        includes(t: T) {
            return t >= this.min && t < this.max;
        }

        readonly static range = (function() {
            function range(max: number): Range<number>;
            function range(max: bigint): Range<bigint>;
            function range(min: number, max: number, step?: number): Range<number>;
            function range(min: bigint, max: bigint, step?: bigint): Range<bigint>;
            function range(arg0: number | bigint, arg1?: number | bigint, arg2: number | bigint = typeof arg0 === 'bigint' ? 1n : 1): Range<number | bigint> {
                return new Range(...(arg1 === undefined ? [typeof arg0 === 'bigint' ? 0n : 0,arg0] : [arg0, arg1]) as [number|bigint,number|bigint], arg2)
            }
            return range;
        })();
    }
    export const range = Range.range;
}

const range = MatchUtil.range;

for(const x of range(10,20,2)) console.log(x)
console.log(range(0,10,1).includes(-1))
// console.log(range(1n))


console.log(match(11n)({
    [range(0n,12n)]:'yes',
    _:'no'
}))