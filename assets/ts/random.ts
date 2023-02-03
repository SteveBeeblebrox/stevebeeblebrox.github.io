/*
 * [0,1] PRNG Implementations
 *
 * Fast Implementation
 * (c) Antti Kissaniemi - https://creativecommons.org/licenses/by-sa/4.0/
 * Adapted for TypeScript
 * https://stackoverflow.com/a/19303725
 * 
 * Other Implementations
 * (c) bryc - Public Domain
 * Adapted for TypeScript
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
class Random {
    private static splitSeed(seed: bigint, segments: number = 1, bits: number = 32): number[] {
        const state: number[] = [], nbits = BigInt(bits);
        for (let i = 0; i < segments; i++) {
            state.push(Number(BigInt.asIntN(bits, seed)));
            seed >>= nbits;
        }
        return state;
    }
    private static IMPLEMENTATIONS = {
        fast(seed) {
            let [state] = Random.splitSeed(seed, 1, 53);
            return function random() {
                const x = Math.sin(state++) * 10000;
                return (x - Math.floor(x));
            }
        },
        mwc(seed) {
            let [a, b] = Random.splitSeed(seed, 2, 16);
            return function () {
                a = 36969 * (a & 65535) + (a >>> 16);
                b = 18000 * (b & 65535) + (b >>> 16);
                var result = (a << 16) + (b & 65535) >>> 0;
                return result / 4294967296;
            }
        },
        xorshift32(seed) {
            let [a] = Random.splitSeed(seed);
            return function () {
                a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
                return (a >>> 0) / 4294967296;
            }
        },
        xorshift128(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            return function () {
                var t = a ^ a << 11;
                a = b, b = c, c = d;
                d = (d ^ d >>> 19) ^ (t ^ t >>> 8);
                return (d >>> 0) / 4294967296;
            }
        },
        xorwow(seed) {
            let [a, b, c, d, e, f] = Random.splitSeed(seed, 6);
            return function () {
                var t = a ^ a >>> 2;
                a = b, b = c, c = d, d = e;
                e = (e ^ e << 4) ^ (t ^ t << 1);
                f = (f + 362437) >>> 0;
                return ((e + f) >>> 0) / 4294967296;
            }
        },
        xorshift32m(seed) {
            let [a] = Random.splitSeed(seed);
            return function () {
                a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
                return (Math.imul(a, 1597334677) >>> 0) / 4294967296;
            }
        },
        xorshift32amx(seed) {
            let [a] = Random.splitSeed(seed);
            return function () {
                var t = Math.imul(a, 1597334677);
                t = t >>> 24 | t >>> 8 & 65280 | t << 8 & 16711680 | t << 24; // reverse byte order
                a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
                return (a + t >>> 0) / 4294967296;
            }
        },
        xoroshiro64ss(seed) {
            let [a, b] = Random.splitSeed(seed, 2);
            return function () {
                var r = Math.imul(a, 0x9E3779BB); r = (r << 5 | r >>> 27) * 5;
                b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
                b = b << 13 | b >>> 19;
                return (r >>> 0) / 4294967296;
            }
        },
        xoroshiro64s(seed) {
            let [a, b] = Random.splitSeed(seed, 2);
            return function () {
                var r = Math.imul(a, 0x9E3779BB);
                b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
                b = b << 13 | b >>> 19;
                return (r >>> 0) / 4294967296;
            }
        },
        xoroshiro64p(seed) {
            let [a, b] = Random.splitSeed(seed, 2);
            return function () {
                var r = a + b;
                b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
                b = b << 13 | b >>> 19;
                return (r >>> 0) / 4294967296;
            }
        },
        xoroshiro128plus_32(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            const r = function () {
                var x = a >>> 0,
                    y = b >>> 0,
                    z = c >>> 0,
                    w = d >>> 0, t;

                t = w + y + (z !== 0 && x >= (-z >>> 0) ? 1 : 0);
                z ^= x;
                w ^= y;

                a = (y << 23 | x >>> 9) ^ z ^ (z << 14);
                b = (x << 23 | y >>> 9) ^ w ^ (w << 14 | z >>> 18);
                c = w << 4 | z >>> 28;
                d = z << 4 | w >>> 28;

                return (t >>> 0) / 4294967296;
            }
            for (var i = 0; i < 10; i++) r();
            return r;
        },
        xorshift128plus_32b(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            const r = function () {
                var x = a >>> 0,
                    y = b >>> 0,
                    z = c >>> 0,
                    w = d >>> 0, t;

                t = w + y + (x !== 0 && z >= (-x >>> 0) ? 1 : 0);
                y ^= y << 23 | x >>> 9;
                x ^= x << 23;

                a = z;
                b = w;
                c = x ^ z ^ (x >>> 18 | y << 14) ^ (z >>> 5 | w << 27);
                d = y ^ w ^ (y >>> 18) ^ (w >>> 5);

                return (t >>> 0) / 4294967296;
            }
            for (var i = 0; i < 20; i++) r();
            return r;
        },
        xoshiro128ss(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            return function () {
                var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
                c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
                d = d << 11 | d >>> 21;
                return (r >>> 0) / 4294967296;
            }
        },
        xoshiro128pp(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            return function () {
                var t = b << 9, r = a + d; r = (r << 7 | r >>> 25) + a;
                c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
                d = d << 11 | d >>> 21;
                return (r >>> 0) / 4294967296;
            }
        },
        xoshiro128p(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            return function () {
                var t = b << 9, r = a + d;
                c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
                d = d << 11 | d >>> 21;
                return (r >>> 0) / 4294967296;
            }
        },
        jsf32(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            const r = function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                var t = a - (b << 27 | b >>> 5) | 0;
                a = b ^ (c << 17 | c >>> 15);
                b = c + d | 0;
                c = d + t | 0;
                d = a + t | 0;
                return (d >>> 0) / 4294967296;
            }
            for (var i = 0; i < 20; i++) r();
            return r;
        },
        jsf32b(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            const r = function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                var t = a - (b << 23 | b >>> 9) | 0;
                a = b ^ (c << 16 | c >>> 16) | 0;
                b = c + (d << 11 | d >>> 21) | 0;
                b = c + d | 0;
                c = d + t | 0;
                d = a + t | 0;
                return (d >>> 0) / 4294967296;
            }
            for (var i = 0; i < 20; i++) r();
            return r;
        },
        gjrand32(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            const r = function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                a = a << 16 | a >>> 16;
                b = b + c | 0;
                a = a + b | 0;
                c = c ^ b;
                c = c << 11 | c >>> 21;
                b = b ^ a;
                a = a + c | 0;
                b = c << 19 | c >>> 13;
                c = c + a | 0;
                d = d + 0x96a5 | 0;
                b = b + d | 0;
                return (a >>> 0) / 4294967296;
            }
            for (var i = 0; i < 14; i++) r();
            return r;
        },
        sfc32(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            const r = function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                var t = (a + b | 0) + d | 0;
                d = d + 1 | 0;
                a = b ^ b >>> 9;
                b = c + (c << 3) | 0;
                c = c << 21 | c >>> 11;
                c = c + t | 0;
                return (t >>> 0) / 4294967296;
            }
            for (var i = 0; i < 15; i++) r();
            return r;
        },
        tychei(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            return function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                b = (b << 25 | b >>> 7) ^ c; c = c - d | 0;
                d = (d << 24 | d >>> 8) ^ a; a = a - b | 0;
                b = (b << 20 | b >>> 12) ^ c; c = c - d | 0;
                d = (d << 16 | d >>> 16) ^ a; a = a - b | 0;
                return (a >>> 0) / 4294967296;
            }
        },
        tyche(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            return function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                a = a + b | 0; d = d ^ a; d = d << 16 | d >>> 16;
                c = c + d | 0; b = b ^ c; b = b << 12 | b >>> 20;
                a = a + b | 0; d = d ^ a; d = d << 8 | d >>> 24;
                c = c + d | 0; b = b ^ c; b = b << 7 | b >>> 25;
                return (b >>> 0) / 4294967296;
            }
        },
        mulberry32(seed) {
            let [a] = Random.splitSeed(seed);
            return function () {
                a |= 0; a = a + 0x6D2B79F5 | 0;
                var t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        },
        splitmix32(seed) {
            let [a] = Random.splitSeed(seed);
            return function () {
                a |= 0; a = a + 0x9e3779b9 | 0;
                var t = a ^ a >>> 15; t = Math.imul(t, 0x85ebca6b);
                t = t ^ t >>> 13; t = Math.imul(t, 0xc2b2ae35);
                return ((t = t ^ t >>> 16) >>> 0) / 4294967296;
            }
        },
        v3b(seed) {
            let [a, b, c, d] = Random.splitSeed(seed, 4);
            var out: number, pos = 0, a0 = 0, b0 = b, c0 = c, d0 = d;
            const r = function () {
                if (pos === 0) {
                    a += d; a = a << 21 | a >>> 11;
                    b = (b << 12 | b >>> 20) + c;
                    c ^= a; d ^= b;
                    a += d; a = a << 19 | a >>> 13;
                    b = (b << 24 | b >>> 8) + c;
                    c ^= a; d ^= b;
                    a += d; a = a << 7 | a >>> 25;
                    b = (b << 12 | b >>> 20) + c;
                    c ^= a; d ^= b;
                    a += d; a = a << 27 | a >>> 5;
                    b = (b << 17 | b >>> 15) + c;
                    c ^= a; d ^= b;

                    a += a0; b += b0; c += c0; d += d0; a0++; pos = 4;
                }
                switch (--pos) {
                    case 0: out = a; break;
                    case 1: out = b; break;
                    case 2: out = c; break;
                    case 3: out = d; break;
                }
                return (out >>> 0) / 4294967296;
            }
            for (var i = 0; i < 16; i++) r();
            return r;
        }
    } satisfies { [key: string]: (seed: bigint) => () => number };
    public random: () => number;//(1-Number.MIN_VALUE) * 
    constructor({ seed = BigInt(+new Date()), type = 'xoroshiro128plus_32' }: { seed?: bigint, type?: string & keyof typeof Random.IMPLEMENTATIONS } = {}) {
        this.random = Random.IMPLEMENTATIONS[type!](seed);
    }
}