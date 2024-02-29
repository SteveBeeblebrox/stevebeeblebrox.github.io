declare function partial<T>(expr: T): (...args: unknown[]) => T;
const __partial__ = (args: unknown[], i: number = 0) => new Proxy(Object.create(null), {has: (_,p) => typeof p === 'string' && /^_\d*$/.test(p), get: (_,p) => typeof p === 'string' ? (p === '_' ? args[i++] : args[+p.substring(1)]) : undefined});
///#define partial(expr) (...args: any[]) => { with(__partial__(args)) { return expr; } }
