var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
// === Scripting Utils === //
/*
 * MIT License
 *
 * Copyright (c) 2023 S. Beeblebrox
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
    constructor(message) {
        var _a;
        super((_a = `Assertion failed` + (message ? ': ' : '') + message) !== null && _a !== void 0 ? _a : '');
    }
}
function assert(condition, message = '') {
    if (!condition)
        throw new AssertionError(message);
}
const throws = (e) => { throw e; };
function addLoadListener(f) {
    if (document.readyState === 'complete')
        f();
    else
        window.addEventListener('load', f);
}
/*
 * MIT License
 *
 * Copyright (c) 2022 S. Beeblebrox
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
const toast = (function () {
    const div = document.createElement('div');
    if (document.readyState === 'complete')
        document.body.appendChild(div);
    else
        window.addEventListener('load', () => document.body.appendChild(div));
    const shadowRoot = div.attachShadow({ mode: 'closed' });
    shadowRoot.appendChild(Object.assign(document.createElement('style'), {
        textContent: `
            :host {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: flex;
                justify-content: center;
                font-family: Arial;
                pointer-events: none;
            }
            :host>span {
                transition: opacity 0.15s linear;
                align-self: flex-end;
                margin-bottom: 2em;
                border-radius: 3ch;
                z-index: 99999;
                color: #444;
                background-color: rgb(245 245 245 / 85%);
                box-shadow:0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
                padding: 1.5ch 2ch;
                pointer-events: none;
                user-select: none;
                opacity: 0;
            }
            :host>span>span {
                --max-lines: 4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: var(--max-lines);
                -webkit-box-orient: vertical;
                max-width: 20ch;
            }
        `
    }));
    const span = document.createElement('span');
    const textSpan = document.createElement('span');
    span.appendChild(textSpan);
    shadowRoot.appendChild(span);
    const durations = {
        'short': 1000,
        'medium': 2000,
        'long': 5000
    };
    const pendingToasts = [];
    let resetTimeout = -1;
    function toast(text, duration = 'short') {
        return new Promise(function (resolveReturn) {
            window.requestAnimationFrame(async function () {
                await Promise.all(pendingToasts);
                clearTimeout(resetTimeout);
                pendingToasts.push(new Promise(function (resolveCompleted) {
                    textSpan.textContent = text;
                    span.style.opacity = '1.0';
                    setTimeout(function () {
                        span.style.opacity = '0.0';
                        resetTimeout = setTimeout(function () {
                            textSpan.textContent = '';
                            resolveReturn();
                        }, 250);
                        pendingToasts.shift();
                        resolveCompleted();
                    }, durations[duration] + 250);
                }));
            });
        });
    }
    return toast;
})();
/*
 * Note Table
 * (c) MDN Contributors - https://creativecommons.org/licenses/by-sa/2.5/
 * Adapted for TypeScript
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64
 *
 * Timings from AudioContext example by Chirp Internet
 * https://chirpinternet.eu
 */
const chime = (function () {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const ctx = new AudioContext();
    const EFFECTIVELY_ZERO = 1 / 1000;
    const table = Array.apply(null, { length: 9 }).map(o => ({}));
    table[0]["A"] = 27.500000000000000;
    table[0]["A#"] = 29.135235094880619;
    table[0]["B"] = 30.867706328507756;
    table[1]["C"] = 32.703195662574829;
    table[1]["C#"] = 34.647828872109012;
    table[1]["D"] = 36.708095989675945;
    table[1]["D#"] = 38.890872965260113;
    table[1]["E"] = 41.203444614108741;
    table[1]["F"] = 43.653528929125485;
    table[1]["F#"] = 46.249302838954299;
    table[1]["G"] = 48.999429497718661;
    table[1]["G#"] = 51.913087197493142;
    table[1]["A"] = 55.000000000000000;
    table[1]["A#"] = 58.270470189761239;
    table[1]["B"] = 61.735412657015513;
    table[2]["C"] = 65.406391325149658;
    table[2]["C#"] = 69.295657744218024;
    table[2]["D"] = 73.416191979351890;
    table[2]["D#"] = 77.781745930520227;
    table[2]["E"] = 82.406889228217482;
    table[2]["F"] = 87.307057858250971;
    table[2]["F#"] = 92.498605677908599;
    table[2]["G"] = 97.998858995437323;
    table[2]["G#"] = 103.826174394986284;
    table[2]["A"] = 110.000000000000000;
    table[2]["A#"] = 116.540940379522479;
    table[2]["B"] = 123.470825314031027;
    table[3]["C"] = 130.812782650299317;
    table[3]["C#"] = 138.591315488436048;
    table[3]["D"] = 146.832383958703780;
    table[3]["D#"] = 155.563491861040455;
    table[3]["E"] = 164.813778456434964;
    table[3]["F"] = 174.614115716501942;
    table[3]["F#"] = 184.997211355817199;
    table[3]["G"] = 195.997717990874647;
    table[3]["G#"] = 207.652348789972569;
    table[3]["A"] = 220.000000000000000;
    table[3]["A#"] = 233.081880759044958;
    table[3]["B"] = 246.941650628062055;
    table[4]["C"] = 261.625565300598634;
    table[4]["C#"] = 277.182630976872096;
    table[4]["D"] = 293.664767917407560;
    table[4]["D#"] = 311.126983722080910;
    table[4]["E"] = 329.627556912869929;
    table[4]["F"] = 349.228231433003884;
    table[4]["F#"] = 369.994422711634398;
    table[4]["G"] = 391.995435981749294;
    table[4]["G#"] = 415.304697579945138;
    table[4]["A"] = 440.000000000000000;
    table[4]["A#"] = 466.163761518089916;
    table[4]["B"] = 493.883301256124111;
    table[5]["C"] = 523.251130601197269;
    table[5]["C#"] = 554.365261953744192;
    table[5]["D"] = 587.329535834815120;
    table[5]["D#"] = 622.253967444161821;
    table[5]["E"] = 659.255113825739859;
    table[5]["F"] = 698.456462866007768;
    table[5]["F#"] = 739.988845423268797;
    table[5]["G"] = 783.990871963498588;
    table[5]["G#"] = 830.609395159890277;
    table[5]["A"] = 880.000000000000000;
    table[5]["A#"] = 932.327523036179832;
    table[5]["B"] = 987.766602512248223;
    table[6]["C"] = 1046.502261202394538;
    table[6]["C#"] = 1108.730523907488384;
    table[6]["D"] = 1174.659071669630241;
    table[6]["D#"] = 1244.507934888323642;
    table[6]["E"] = 1318.510227651479718;
    table[6]["F"] = 1396.912925732015537;
    table[6]["F#"] = 1479.977690846537595;
    table[6]["G"] = 1567.981743926997176;
    table[6]["G#"] = 1661.218790319780554;
    table[6]["A"] = 1760.000000000000000;
    table[6]["A#"] = 1864.655046072359665;
    table[6]["B"] = 1975.533205024496447;
    table[7]["C"] = 2093.004522404789077;
    table[7]["C#"] = 2217.461047814976769;
    table[7]["D"] = 2349.318143339260482;
    table[7]["D#"] = 2489.015869776647285;
    table[7]["E"] = 2637.020455302959437;
    table[7]["F"] = 2793.825851464031075;
    table[7]["F#"] = 2959.955381693075191;
    table[7]["G"] = 3135.963487853994352;
    table[7]["G#"] = 3322.437580639561108;
    table[7]["A"] = 3520.000000000000000;
    table[7]["A#"] = 3729.310092144719331;
    table[7]["B"] = 3951.066410048992894;
    table[8]["C"] = 4186.009044809578154;
    return async function chime(notes = '440 880 1200', { fadeOutTime = 0.5, defaultNoteTime = 0.2 } = {}) {
        const parsedNotes = notes.split(/[,\s]+/g).map(function (entry) {
            var _a;
            const [note, time] = entry.split(':');
            let frequency = parseFloat(note);
            if (Number.isNaN(frequency)) {
                const [letter, octave] = note.split(/(?=\d)/);
                frequency = (_a = table[+(octave !== null && octave !== void 0 ? octave : 4)][letter.toUpperCase()]) !== null && _a !== void 0 ? _a : 0;
            }
            return [frequency, +(time !== null && time !== void 0 ? time : defaultNoteTime)];
        });
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        const oscillator = ctx.createOscillator();
        oscillator.connect(gainNode);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.frequency.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.setValueAtTime(EFFECTIVELY_ZERO, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);
        for (const [note, time] of parsedNotes) {
            oscillator.frequency.setValueAtTime(+note, ctx.currentTime);
            await sleep(Math.max(1000 * time - 10, 0));
        }
        gainNode.gain.setTargetAtTime(EFFECTIVELY_ZERO, ctx.currentTime + fadeOutTime - 0.05 - 0.04, 0.02);
        oscillator.stop(ctx.currentTime + fadeOutTime);
        await sleep(fadeOutTime * 1000);
    };
})();
/*
 * MIT License
 *
 * Copyright (c) 2023 S. Beeblebrox
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
class Keybinds {
    constructor(target = window) {
        this.target = target;
        this.levels = Array.apply(null, { length: 5 }).map(_ => new Map());
        this.keys = new Map();
        this.onKeydownEvent = (function (event) {
            var _a;
            this.keys.set(event.key.replace(/^ $/, 'Space').toLowerCase(), true);
            if (Keybinds.COMMAND_KEYS.includes(event.key.toLowerCase()))
                return;
            const length = +event.ctrlKey + +event.shiftKey + +event.altKey + +event.metaKey;
            const f = (_a = [...this.levels[length].entries()].find(function ([reqs]) {
                return (!reqs.ctrlKey || event.ctrlKey)
                    && (!reqs.shiftKey || event.shiftKey)
                    && (!reqs.altKey || event.altKey)
                    && (!reqs.metaKey || event.metaKey)
                    && reqs.char === event.key.replace(/^ $/, 'Space').toLowerCase();
            })) === null || _a === void 0 ? void 0 : _a[1];
            if (f) {
                event.preventDefault();
                f();
            }
        }).bind(this);
        this.onKeyupEvent = (function (event) {
            this.keys.set(event.key.replace(/^ $/, 'Space').toLowerCase(), false);
        }).bind(this);
        this.onBlurEvent = (function (event) {
            this.keys.clear();
        }).bind(this);
        target.addEventListener('keydown', this.onKeydownEvent);
        target.addEventListener('keyup', this.onKeyupEvent);
        target.addEventListener('blur', this.onBlurEvent);
    }
    static on(pattern, f) {
        return Keybinds.DEFAULT_INSTANCE.on(pattern, f);
    }
    on(pattern, f) {
        var _a;
        const reqs = pattern.split(/\s+[+,]?\s?/).map(o => o.toLowerCase().replaceAll(/^ctrl$/g, Keybinds.CommandKeys.Control));
        this.levels[Math.min(reqs.length - 1, 4)].set({
            ctrlKey: reqs.includes(Keybinds.CommandKeys.Control),
            shiftKey: reqs.includes(Keybinds.CommandKeys.Shift),
            altKey: reqs.includes(Keybinds.CommandKeys.Alt),
            metaKey: reqs.includes(Keybinds.CommandKeys.Meta) || reqs.includes(Keybinds.CommandKeys.Windows),
            char: (_a = reqs.find(c => !Keybinds.COMMAND_KEYS_ARRAY.includes(c))) !== null && _a !== void 0 ? _a : (() => { throw new Error(`Keybind '${pattern}' must contain a none command key`); })()
        }, f);
    }
    static isKeyDown(key) {
        return Keybinds.DEFAULT_INSTANCE.isKeyDown(key);
    }
    isKeyDown(key) {
        return !!this.keys.get(key.toLowerCase());
    }
    detach() {
        this.target.removeEventListener('keydown', this.onKeydownEvent);
        this.target.removeEventListener('keyup', this.onKeyupEvent);
        this.target.removeEventListener('blur', this.onBlurEvent);
    }
}
Keybinds.CommandKeys = (function () {
    let CommandKeys;
    (function (CommandKeys) {
        CommandKeys["Control"] = "control";
        CommandKeys["Shift"] = "shift";
        CommandKeys["Alt"] = "alt";
        CommandKeys["Meta"] = "meta";
        CommandKeys["Windows"] = "windows";
    })(CommandKeys || (CommandKeys = {}));
    return CommandKeys;
})();
Keybinds.DEFAULT_INSTANCE = new Keybinds();
Keybinds.COMMAND_KEYS_ARRAY = Object.values(Keybinds.CommandKeys).filter(x => typeof x === 'string');
Keybinds.COMMAND_KEYS = Keybinds.COMMAND_KEYS_ARRAY.filter(x => x != Keybinds.CommandKeys.Windows);
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
    static splitSeed(seed, segments = 1, bits = 32) {
        const state = [], nbits = BigInt(bits);
        for (let i = 0; i < segments; i++) {
            state.push(Number(BigInt.asIntN(bits, seed)));
            seed >>= nbits;
        }
        return state;
    }
    constructor({ seed = BigInt(+new Date()), type = 'xoroshiro128plus_32' } = {}) {
        this.random = Random.IMPLEMENTATIONS[type](seed);
    }
}
Random.IMPLEMENTATIONS = {
    fast(seed) {
        let [state] = Random.splitSeed(seed, 1, 53);
        return function random() {
            const x = Math.sin(state++) * 10000;
            return (x - Math.floor(x));
        };
    },
    mwc(seed) {
        let [a, b] = Random.splitSeed(seed, 2, 16);
        return function () {
            a = 36969 * (a & 65535) + (a >>> 16);
            b = 18000 * (b & 65535) + (b >>> 16);
            var result = (a << 16) + (b & 65535) >>> 0;
            return result / 4294967296;
        };
    },
    xorshift32(seed) {
        let [a] = Random.splitSeed(seed);
        return function () {
            a ^= a << 13;
            a ^= a >>> 17;
            a ^= a << 5;
            return (a >>> 0) / 4294967296;
        };
    },
    xorshift128(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        return function () {
            var t = a ^ a << 11;
            a = b, b = c, c = d;
            d = (d ^ d >>> 19) ^ (t ^ t >>> 8);
            return (d >>> 0) / 4294967296;
        };
    },
    xorwow(seed) {
        let [a, b, c, d, e, f] = Random.splitSeed(seed, 6);
        return function () {
            var t = a ^ a >>> 2;
            a = b, b = c, c = d, d = e;
            e = (e ^ e << 4) ^ (t ^ t << 1);
            f = (f + 362437) >>> 0;
            return ((e + f) >>> 0) / 4294967296;
        };
    },
    xorshift32m(seed) {
        let [a] = Random.splitSeed(seed);
        return function () {
            a ^= a << 13;
            a ^= a >>> 17;
            a ^= a << 5;
            return (Math.imul(a, 1597334677) >>> 0) / 4294967296;
        };
    },
    xorshift32amx(seed) {
        let [a] = Random.splitSeed(seed);
        return function () {
            var t = Math.imul(a, 1597334677);
            t = t >>> 24 | t >>> 8 & 65280 | t << 8 & 16711680 | t << 24; // reverse byte order
            a ^= a << 13;
            a ^= a >>> 17;
            a ^= a << 5;
            return (a + t >>> 0) / 4294967296;
        };
    },
    xoroshiro64ss(seed) {
        let [a, b] = Random.splitSeed(seed, 2);
        return function () {
            var r = Math.imul(a, 0x9E3779BB);
            r = (r << 5 | r >>> 27) * 5;
            b = b ^ a;
            a = b ^ (a << 26 | a >>> 6) ^ b << 9;
            b = b << 13 | b >>> 19;
            return (r >>> 0) / 4294967296;
        };
    },
    xoroshiro64s(seed) {
        let [a, b] = Random.splitSeed(seed, 2);
        return function () {
            var r = Math.imul(a, 0x9E3779BB);
            b = b ^ a;
            a = b ^ (a << 26 | a >>> 6) ^ b << 9;
            b = b << 13 | b >>> 19;
            return (r >>> 0) / 4294967296;
        };
    },
    xoroshiro64p(seed) {
        let [a, b] = Random.splitSeed(seed, 2);
        return function () {
            var r = a + b;
            b = b ^ a;
            a = b ^ (a << 26 | a >>> 6) ^ b << 9;
            b = b << 13 | b >>> 19;
            return (r >>> 0) / 4294967296;
        };
    },
    xoroshiro128plus_32(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        const r = function () {
            var x = a >>> 0, y = b >>> 0, z = c >>> 0, w = d >>> 0, t;
            t = w + y + (z !== 0 && x >= (-z >>> 0) ? 1 : 0);
            z ^= x;
            w ^= y;
            a = (y << 23 | x >>> 9) ^ z ^ (z << 14);
            b = (x << 23 | y >>> 9) ^ w ^ (w << 14 | z >>> 18);
            c = w << 4 | z >>> 28;
            d = z << 4 | w >>> 28;
            return (t >>> 0) / 4294967296;
        };
        for (var i = 0; i < 10; i++)
            r();
        return r;
    },
    xorshift128plus_32b(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        const r = function () {
            var x = a >>> 0, y = b >>> 0, z = c >>> 0, w = d >>> 0, t;
            t = w + y + (x !== 0 && z >= (-x >>> 0) ? 1 : 0);
            y ^= y << 23 | x >>> 9;
            x ^= x << 23;
            a = z;
            b = w;
            c = x ^ z ^ (x >>> 18 | y << 14) ^ (z >>> 5 | w << 27);
            d = y ^ w ^ (y >>> 18) ^ (w >>> 5);
            return (t >>> 0) / 4294967296;
        };
        for (var i = 0; i < 20; i++)
            r();
        return r;
    },
    xoshiro128ss(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        return function () {
            var t = b << 9, r = a * 5;
            r = (r << 7 | r >>> 25) * 9;
            c = c ^ a;
            d = d ^ b;
            b = b ^ c;
            a = a ^ d;
            c = c ^ t;
            d = d << 11 | d >>> 21;
            return (r >>> 0) / 4294967296;
        };
    },
    xoshiro128pp(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        return function () {
            var t = b << 9, r = a + d;
            r = (r << 7 | r >>> 25) + a;
            c = c ^ a;
            d = d ^ b;
            b = b ^ c;
            a = a ^ d;
            c = c ^ t;
            d = d << 11 | d >>> 21;
            return (r >>> 0) / 4294967296;
        };
    },
    xoshiro128p(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        return function () {
            var t = b << 9, r = a + d;
            c = c ^ a;
            d = d ^ b;
            b = b ^ c;
            a = a ^ d;
            c = c ^ t;
            d = d << 11 | d >>> 21;
            return (r >>> 0) / 4294967296;
        };
    },
    jsf32(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        const r = function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
            var t = a - (b << 27 | b >>> 5) | 0;
            a = b ^ (c << 17 | c >>> 15);
            b = c + d | 0;
            c = d + t | 0;
            d = a + t | 0;
            return (d >>> 0) / 4294967296;
        };
        for (var i = 0; i < 20; i++)
            r();
        return r;
    },
    jsf32b(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        const r = function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
            var t = a - (b << 23 | b >>> 9) | 0;
            a = b ^ (c << 16 | c >>> 16) | 0;
            b = c + (d << 11 | d >>> 21) | 0;
            b = c + d | 0;
            c = d + t | 0;
            d = a + t | 0;
            return (d >>> 0) / 4294967296;
        };
        for (var i = 0; i < 20; i++)
            r();
        return r;
    },
    gjrand32(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        const r = function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
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
        };
        for (var i = 0; i < 14; i++)
            r();
        return r;
    },
    sfc32(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        const r = function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
            var t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = c << 21 | c >>> 11;
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        };
        for (var i = 0; i < 15; i++)
            r();
        return r;
    },
    tychei(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        return function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
            b = (b << 25 | b >>> 7) ^ c;
            c = c - d | 0;
            d = (d << 24 | d >>> 8) ^ a;
            a = a - b | 0;
            b = (b << 20 | b >>> 12) ^ c;
            c = c - d | 0;
            d = (d << 16 | d >>> 16) ^ a;
            a = a - b | 0;
            return (a >>> 0) / 4294967296;
        };
    },
    tyche(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        return function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
            a = a + b | 0;
            d = d ^ a;
            d = d << 16 | d >>> 16;
            c = c + d | 0;
            b = b ^ c;
            b = b << 12 | b >>> 20;
            a = a + b | 0;
            d = d ^ a;
            d = d << 8 | d >>> 24;
            c = c + d | 0;
            b = b ^ c;
            b = b << 7 | b >>> 25;
            return (b >>> 0) / 4294967296;
        };
    },
    mulberry32(seed) {
        let [a] = Random.splitSeed(seed);
        return function () {
            a |= 0;
            a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    },
    splitmix32(seed) {
        let [a] = Random.splitSeed(seed);
        return function () {
            a |= 0;
            a = a + 0x9e3779b9 | 0;
            var t = a ^ a >>> 15;
            t = Math.imul(t, 0x85ebca6b);
            t = t ^ t >>> 13;
            t = Math.imul(t, 0xc2b2ae35);
            return ((t = t ^ t >>> 16) >>> 0) / 4294967296;
        };
    },
    v3b(seed) {
        let [a, b, c, d] = Random.splitSeed(seed, 4);
        var out, pos = 0, a0 = 0, b0 = b, c0 = c, d0 = d;
        const r = function () {
            if (pos === 0) {
                a += d;
                a = a << 21 | a >>> 11;
                b = (b << 12 | b >>> 20) + c;
                c ^= a;
                d ^= b;
                a += d;
                a = a << 19 | a >>> 13;
                b = (b << 24 | b >>> 8) + c;
                c ^= a;
                d ^= b;
                a += d;
                a = a << 7 | a >>> 25;
                b = (b << 12 | b >>> 20) + c;
                c ^= a;
                d ^= b;
                a += d;
                a = a << 27 | a >>> 5;
                b = (b << 17 | b >>> 15) + c;
                c ^= a;
                d ^= b;
                a += a0;
                b += b0;
                c += c0;
                d += d0;
                a0++;
                pos = 4;
            }
            switch (--pos) {
                case 0:
                    out = a;
                    break;
                case 1:
                    out = b;
                    break;
                case 2:
                    out = c;
                    break;
                case 3:
                    out = d;
                    break;
            }
            return (out >>> 0) / 4294967296;
        };
        for (var i = 0; i < 16; i++)
            r();
        return r;
    }
};
// === String Utils === //
/*
 * Base64 Encoding
 * (c) MDN Contributors - https://creativecommons.org/licenses/by-sa/2.5/
 * Adapted for TypeScript
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64
 */
var Base64;
(function (Base64) {
    function b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91 ?
            nChr - 65
            : nChr > 96 && nChr < 123 ?
                nChr - 71
                : nChr > 47 && nChr < 58 ?
                    nChr + 4
                    : nChr === 43 ?
                        62
                        : nChr === 47 ?
                            63
                            :
                                0;
    }
    function decodeBase64ToArray(sBase64, nBlocksSize) {
        const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, '');
        const nInLen = sB64Enc.length;
        const nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
        const taBytes = new Uint8Array(nOutLen);
        let nMod3;
        let nMod4;
        let nUint24 = 0;
        let nOutIdx = 0;
        for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                nMod3 = 0;
                while (nMod3 < 3 && nOutIdx < nOutLen) {
                    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                    nMod3++;
                    nOutIdx++;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    }
    Base64.decodeBase64ToArray = decodeBase64ToArray;
    /* Base64 string to array encoding */
    function uint6ToB64(nUint6) {
        return nUint6 < 26 ?
            nUint6 + 65
            : nUint6 < 52 ?
                nUint6 + 71
                : nUint6 < 62 ?
                    nUint6 - 4
                    : nUint6 === 62 ?
                        43
                        : nUint6 === 63 ?
                            47
                            :
                                65;
    }
    function encode(text) {
        return encodeBase64FromArray(new TextEncoder().encode(text));
    }
    Base64.encode = encode;
    function decode(text) {
        return new TextDecoder().decode(decodeBase64ToArray(text));
    }
    Base64.decode = decode;
    function encodeBase64FromArray(aBytes) {
        let nMod3 = 2;
        let sB64Enc = '';
        const nLen = aBytes.length;
        let nUint24 = 0;
        for (let nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) {
                sB64Enc += '\r\n';
            }
            nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                sB64Enc += String.fromCodePoint(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }
        return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
    }
    Base64.encodeBase64FromArray = encodeBase64FromArray;
})(Base64 || (Base64 = {}));
/*
 * LZ Compression
 * (c) 2013 Pieroxy - WTFPLv2
 * Adapted for TypeScript
 * https://pieroxy.net/blog/pages/lz-string/index.html
 */
var LZCompression;
(function (LZCompression) {
    // private property
    const f = String.fromCharCode;
    const keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
    const baseReverseDic = {};
    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (let i = 0; i < alphabet.length; i++) {
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }
    function compressToBase64(input) {
        if (input == null)
            return '';
        const res = _compress(input, 6, function (a) { return keyStrBase64.charAt(a); });
        switch (res.length % 4) { // To produce valid Base64
            default: // When could this happen ?
            case 0: return res;
            case 1: return res + '===';
            case 2: return res + '==';
            case 3: return res + '=';
        }
    }
    LZCompression.compressToBase64 = compressToBase64;
    function decompressFromBase64(input) {
        if (input == null)
            return '';
        if (input == '')
            return null;
        return _decompress(input.length, 32, function (index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
    }
    LZCompression.decompressFromBase64 = decompressFromBase64;
    function compressToUTF16(input) {
        if (input == null)
            return '';
        return _compress(input, 15, function (a) { return f(a + 32); }) + ' ';
    }
    LZCompression.compressToUTF16 = compressToUTF16;
    function decompressFromUTF16(compressed) {
        if (compressed == null)
            return '';
        if (compressed == '')
            return null;
        return _decompress(compressed.length, 16384, function (index) { return compressed.charCodeAt(index) - 32; });
    }
    LZCompression.decompressFromUTF16 = decompressFromUTF16;
    //compress into uint8array (UCS-2 big endian format)
    function compressToUint8Array(uncompressed) {
        const compressed = compress(uncompressed);
        const buf = new Uint8Array(compressed.length * 2); // 2 bytes per character
        for (let i = 0, totalLen = compressed.length; i < totalLen; i++) {
            const current_value = compressed.charCodeAt(i);
            buf[i * 2] = current_value >>> 8;
            buf[i * 2 + 1] = current_value % 256;
        }
        return buf;
    }
    LZCompression.compressToUint8Array = compressToUint8Array;
    //decompress from uint8array (UCS-2 big endian format)
    function decompressFromUint8Array(compressed) {
        if (compressed === null || compressed === undefined) {
            return decompress(compressed);
        }
        else {
            const buf = new Array(compressed.length / 2); // 2 bytes per character
            for (let i = 0, totalLen = buf.length; i < totalLen; i++) {
                buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
            }
            const result = [];
            buf.forEach(function (c) {
                result.push(f(c));
            });
            return decompress(result.join(''));
        }
    }
    LZCompression.decompressFromUint8Array = decompressFromUint8Array;
    //compress into a string that is already URI encoded
    function compressToEncodedURIComponent(input) {
        if (input == null)
            return '';
        return _compress(input, 6, function (a) { return keyStrUriSafe.charAt(a); });
    }
    LZCompression.compressToEncodedURIComponent = compressToEncodedURIComponent;
    //decompress from an output of compressToEncodedURIComponent
    function decompressFromEncodedURIComponent(input) {
        if (input == null)
            return '';
        if (input == '')
            return null;
        input = input.replace(/ /g, '+');
        return _decompress(input.length, 32, function (index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
    }
    LZCompression.decompressFromEncodedURIComponent = decompressFromEncodedURIComponent;
    function compress(uncompressed) {
        return _compress(uncompressed, 16, function (a) { return f(a); });
    }
    LZCompression.compress = compress;
    function _compress(uncompressed, bitsPerChar, getCharFromInt) {
        if (uncompressed == null)
            return '';
        let i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = '', context_wc = '', context_w = '', context_enlargeIn = 2, // Compensate for the first entry which should not count
        context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0;
        for (let ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            }
            else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                }
                else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                // Add wc to the dictionary.
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }
        // Output the code for w.
        if (context_w !== '') {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            }
            else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }
        // Mark the end of the stream
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
            }
            else {
                context_data_position++;
            }
            value = value >> 1;
        }
        // Flush the last char
        while (true) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            }
            else
                context_data_position++;
        }
        return context_data.join('');
    }
    function decompress(compressed) {
        if (compressed == null)
            return '';
        if (compressed == '')
            return null;
        return _decompress(compressed.length, 32768, function (index) { return compressed.charCodeAt(index); });
    }
    LZCompression.decompress = decompress;
    function _decompress(length, resetValue, getNextValue) {
        let dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3, entry = '', result = [], i, w, bits, resb, maxpower, power, c, data = { val: getNextValue(0), position: resetValue, index: 1 };
        for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }
        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }
        switch (next = bits) {
            case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = f(bits);
                break;
            case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = f(bits);
                break;
            case 2:
                return '';
        }
        dictionary[3] = c;
        w = c;
        result.push(c);
        while (true) {
            if (data.index > length) {
                return '';
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch (c = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = f(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = f(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 2:
                    return result.join('');
            }
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
            if (dictionary[c]) {
                entry = dictionary[c];
            }
            else {
                if (c === dictSize) {
                    entry = w + w.charAt(0);
                }
                else {
                    return null;
                }
            }
            result.push(entry);
            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
        }
    }
    LZCompression.zip = compress;
    LZCompression.unzip = decompress;
})(LZCompression || (LZCompression = {}));
/*
 * LZW Compression
 * (c) 2019 Simon Hutchison - https://creativecommons.org/licenses/by-sa/4.0/
 * Adapted for TypeScript
 * https://stackoverflow.com/a/56680172
 */
/**
 * @deprecated LZWCompression is problematic with higher Unicode characters; consider using LZCompression instead
 */
var LZWCompression;
(function (LZWCompression) {
    // Apply LZW-compression to a string and return base64 compressed string
    function compress(str) {
        try {
            const dictionary = {};
            const data = (str + '').split('');
            const out = [];
            let currentChar;
            let phrase = data[0];
            let code = 256;
            for (let i = 1; i < data.length; i++) {
                currentChar = data[i];
                if (dictionary[phrase + currentChar] != null) {
                    phrase += currentChar;
                }
                else {
                    out.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0));
                    dictionary[phrase + currentChar] = code;
                    code++;
                    phrase = currentChar;
                }
            }
            out.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0));
            for (var j = 0; j < out.length; j++) {
                out[j] = String.fromCharCode(out[j]);
            }
            return utoa(out.join(''));
        }
        catch (e) {
            throw 'Failed to zip string';
        }
    }
    LZWCompression.compress = compress;
    // Decompress an LZW-encoded base64 string
    function decompress(base64ZippedString) {
        try {
            const s = atou(base64ZippedString);
            const dictionary = {};
            const data = (s + '').split('');
            let currentChar = data[0];
            let oldPhrase = currentChar;
            const out = [currentChar];
            let code = 256;
            let phrase;
            for (let i = 1; i < data.length; i++) {
                let currentCode = data[i].charCodeAt(0);
                if (currentCode < 256) {
                    phrase = data[i];
                }
                else {
                    phrase = dictionary[currentCode] ? dictionary[currentCode] : oldPhrase + currentChar;
                }
                out.push(phrase);
                currentChar = phrase.charAt(0);
                dictionary[code] = oldPhrase + currentChar;
                code++;
                oldPhrase = phrase;
            }
            return out.join('');
        }
        catch (e) {
            throw 'Failed to unzip string';
        }
    }
    LZWCompression.decompress = decompress;
    LZWCompression.zip = compress;
    LZWCompression.unzip = decompress;
    // ucs-2 string to base64 encoded ascii
    function utoa(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    // base64 encoded ascii to ucs-2 string
    function atou(str) {
        return decodeURIComponent(escape(atob(str)));
    }
})(LZWCompression || (LZWCompression = {}));
/*
 * GZip Compression
 * (c) MDN Contributors - https://creativecommons.org/licenses/by-sa/4.0/
 * Adapted for TypeScript
 * https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
 */
var GZipCompression;
(function (GZipCompression) {
    async function decompressBlob(blob) {
        const ds = new DecompressionStream('gzip');
        const decompressedStream = blob.stream().pipeThrough(ds);
        return new Blob([await new Response(decompressedStream).blob()]);
    }
    GZipCompression.decompressBlob = decompressBlob;
    async function compressBlob(blob) {
        const cs = new CompressionStream('gzip');
        const compressedStream = blob.stream().pipeThrough(cs);
        return new Blob([await new Response(compressedStream).blob()], { type: 'application/gzip' });
    }
    GZipCompression.compressBlob = compressBlob;
    async function compress(text) {
        return Base64.encodeBase64FromArray(new Uint8Array(await (await GZipCompression.compressBlob(new Blob([text]))).arrayBuffer()));
    }
    GZipCompression.compress = compress;
    async function decompress(text) {
        return (await GZipCompression.decompressBlob(new Blob([Base64.decodeBase64ToArray(text)]))).text();
    }
    GZipCompression.decompress = decompress;
    GZipCompression.zip = compress;
    GZipCompression.unzip = decompress;
})(GZipCompression || (GZipCompression = {}));
/**
 * AES-GCM Encryption
 * (c) 2017 Chris Veness - MIT Licence
 * https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
 */
var AESGCMEncryption;
(function (AESGCMEncryption) {
    async function encrypt(plaintext, password) {
        const passwordUtf8 = new TextEncoder().encode(password);
        const passwordHash = await crypto.subtle.digest('SHA-256', passwordUtf8);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const algorithm = { name: 'AES-GCM', iv: iv };
        const key = await crypto.subtle.importKey('raw', passwordHash, algorithm, false, ['encrypt']);
        const ptUint8 = new TextEncoder().encode(plaintext);
        const ctBuffer = await crypto.subtle.encrypt(algorithm, key, ptUint8);
        const ctArray = Array.from(new Uint8Array(ctBuffer));
        const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
        const ctBase64 = btoa(ctStr);
        const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
        return ivHex + ctBase64;
    }
    AESGCMEncryption.encrypt = encrypt;
    async function decrypt(ciphertext, password) {
        const passwordUtf8 = new TextEncoder().encode(password);
        const passwordHash = await crypto.subtle.digest('SHA-256', passwordUtf8);
        const iv = ciphertext.slice(0, 24).match(/.{2}/g).map(byte => parseInt(byte, 16));
        const algorithm = { name: 'AES-GCM', iv: new Uint8Array(iv) };
        const key = await crypto.subtle.importKey('raw', passwordHash, algorithm, false, ['decrypt']);
        const ctStr = atob(ciphertext.slice(24));
        const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
        const plainBuffer = await crypto.subtle.decrypt(algorithm, key, ctUint8);
        const plaintext = new TextDecoder().decode(plainBuffer);
        return plaintext;
    }
    AESGCMEncryption.decrypt = decrypt;
})(AESGCMEncryption || (AESGCMEncryption = {}));
// === Parsers === //
/*
 * Format:
 *
 *      name=value;name2=value2;name3=value3...
 *
 * Whitespace around keys and values is ignored and they both get %, =,and ; encoded.
 * To include a literal ; or =, encode them.
 * Most values are strings, however the following values are coerced into other types:
 *
 *      value         |  type
 *      -----------------------
 *      true          | boolean
 *      false         | boolean
 *      null          | null
 *      <empty>       | null
 *      number string | number
 *
 * If a string starts and ends with "" then the quotes are removed.
 * This can be used to force a value to a string or include whitespace.
 */
var ConfigString;
(function (ConfigString) {
    const SPECIAL_CHARS = '%=;'.split('').map(c => [c, encodeURIComponent(c)]), // Encode % first, decode last
    REVERSE_SPECIAL_CHARS = [...SPECIAL_CHARS].reverse();
    ;
    function minimalEncode(text) {
        for (const [char, encoding] of SPECIAL_CHARS)
            text = text.replaceAll(char, encoding);
        return text;
    }
    function minimalDecode(text) {
        for (const [char, encoding] of REVERSE_SPECIAL_CHARS)
            text = text.replaceAll(encoding, char);
        return text;
    }
    function parse(text) {
        function transform(value) {
            const l = value.toLowerCase();
            return l === 'false' ? false
                : l === 'true' ? true
                    : l === 'null' ? null
                        : value === '' ? null
                            : value.match(/^\d+(?:\.\d+)?$/) ? +value
                                : value.replace(/^"([\s\S]*)"$/, '$1');
        }
        return Object.fromEntries(text.split(';').filter(o => o.trim()).map(function (entry) {
            const [key, value] = entry.split('=');
            return [minimalDecode(key.trim()), transform(minimalDecode(value.trim()))];
        }));
    }
    ConfigString.parse = parse;
    function stringify(value) {
        function transform(value) {
            return value === false ? 'false'
                : value === true ? 'true'
                    : value === null ? 'null'
                        : typeof value === 'number' ? value.toString()
                            : value.replace(/^(?:true|false|null|"[\s\S]*"|\d+(?:\.\d+)?||(?:(?: [\s\S]*?)|(?:[\s\S]*? )))$/, '"$&"');
        }
        return Object.entries(value).map(([key, value]) => `${minimalEncode(key)}=${minimalEncode(transform(value))}`).join(';');
    }
    ConfigString.stringify = stringify;
})(ConfigString || (ConfigString = {}));
/*
 * MIT License
 *
 * Copyright (c) 2022 S. Beeblebrox
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
var CSV;
(function (CSV) {
    function validateDelimiter(delimiter) {
        if (delimiter.length !== 1)
            throw new Error('CSV delimiter must be exactly one character (code unit) long');
    }
    function escapeDelimiterForRegExp(delimiter) {
        return delimiter.replace(/[.*+?^${}()|[\]\\\-]/g, String.raw `\$&`);
    }
    function stringify(values, replacer, { header = true, delimiter = ',' } = {}) {
        validateDelimiter(delimiter);
        const quotePattern = new RegExp(String.raw `[\n${escapeDelimiterForRegExp(delimiter)}"]`);
        function q([key, value]) {
            const s = `${replacer ? replacer(key, value) : value}`;
            return quotePattern.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
        }
        function l(values) {
            return values.map(q).join(delimiter);
        }
        return (header ? `${l(Object.keys(values[0]).map(key => [null, key]))}\n` : '') + values.map(o => l(Object.entries(o))).join('\n');
    }
    CSV.stringify = stringify;
    function parse(text, reviver, { header = true, delimiter = ',' } = {}) {
        var _a;
        validateDelimiter(delimiter);
        const escapedDelimiter = escapeDelimiterForRegExp(delimiter), pattern = new RegExp(String.raw `(${escapedDelimiter}|\r?\n|\r|^)(?:"((?:\\.|""|[^\\"])*)"|([^${escapedDelimiter}"\r\n]*))`, 'gi'), entries = [[]];
        let matches = null;
        while (matches = pattern.exec(text)) {
            if (matches[1].length && matches[1] !== delimiter)
                entries.push([]);
            entries.at(-1).push(matches[2] ?
                matches[2].replace(/[\\"](.)/g, '$1') :
                (_a = matches[3]) !== null && _a !== void 0 ? _a : '');
        }
        if (!header || !entries.length)
            return entries.map((value, i) => reviver ? reviver(i.toString(), value) : value);
        const headerEntry = entries.shift().map(key => reviver ? reviver(null, key) : key);
        return entries.map(entry => Object.fromEntries(entry.map((value, i) => [headerEntry[i], reviver ? reviver(headerEntry[i], value) : value])));
    }
    CSV.parse = parse;
    function fromCammelCase(s) {
        return s[0].toUpperCase() + s.slice(1).replace(/[A-Z]/, ' $&');
    }
    CSV.fromCammelCase = fromCammelCase;
    function toCammelCase(s) {
        return s[0].toLowerCase() + s.slice(1).replaceAll(' ', '');
    }
    CSV.toCammelCase = toCammelCase;
})(CSV || (CSV = {}));
var JSION;
(function (JSION) {
    const COMMENT_PATTERN = /(?<!\\)(?:\\{2})*'(?:(?<!\\)(?:\\{2})*\\'|[^'])*(?<!\\)(?:\\{2})*'|(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(\([\S\s]*?(?<!\\)(?:\\\\)*\))/g, SINGLE_QUOTE_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|'([\S\s]*?(?<!\\)(?:\\\\)*)'/g, KEY_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|([a-zA-Z_$][0-9a-zA-Z_$]*)(?=\s*?:)/g, TRAILING_COMMA_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(,)(?=\s*?[}\]])/g, EMPTY_ARRAY_ITEM = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(?<=[\[,])(\s*?)(?=[,\]])/g, EMPTY_OBJECT_ITEM = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(?<=:)(\s*?)(?=[,}])/g, NULL_SHORTHAND_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(\?)/g, NUMBER_SEPERATOR = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(?<=\d)(_)(?=\d)/g;
    function parse(text, reviver) {
        return JSON.parse(text.replace(COMMENT_PATTERN, function (substring, ...args) {
            if (!args[0])
                return substring;
            return '';
        }).replace(SINGLE_QUOTE_PATTERN, function (substring, ...args) {
            if (args[0] === undefined)
                return substring;
            return `"${args[0].replace(/"/g, '\\"').replace(/\\'/g, "'")}"`;
        }).replace(KEY_PATTERN, function (substring, ...args) {
            if (!args[0])
                return substring;
            return `"${args[0]}"`;
        }).replace(TRAILING_COMMA_PATTERN, function (substring, ...args) {
            if (!args[0])
                return substring;
            return '';
        }).replace(EMPTY_ARRAY_ITEM, function (substring, ...args) {
            if (args[0] === undefined)
                return substring;
            return 'null';
        }).replace(EMPTY_OBJECT_ITEM, function (substring, ...args) {
            if (args[0] === undefined)
                return substring;
            return 'null';
        }).replace(NULL_SHORTHAND_PATTERN, function (substring, ...args) {
            if (!args[0])
                return substring;
            return 'null';
        }).replace(NUMBER_SEPERATOR, function (substring, ...args) {
            if (!args[0])
                return substring;
            return '';
        }), reviver);
    }
    JSION.parse = parse;
    JSION.stringify = JSON.stringify;
})(JSION || (JSION = {}));
/*
 * MIT License
 *
 * Copyright (c) 2023 S. Beeblebrox
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
class JSONStreamParser extends TransformStream {
    constructor({ skipErrors = false, parseJSON = JSON.parse } = {}) {
        let backlog = '', ready = false, enqueueBacklog = (controller) => {
            try {
                controller.enqueue(parseJSON(backlog.replace(/,\s*$/, '')));
            }
            catch (error) {
                if (!skipErrors)
                    controller.error(error);
            }
            backlog = '';
        };
        super({
            transform(chunk, controller) {
                if (!ready) {
                    // Skip initial whitespace or first '['
                    if (/^[\s\[]$/.test(chunk))
                        return;
                    ready = true;
                }
                backlog += chunk;
                // Two newlines delimit end of entry, ignore trailing comma
                if (/(?:\r?\n){2}$/.test(backlog) && backlog.trim()) {
                    enqueueBacklog(controller);
                }
                // When entry is a ']', end stream
                if (backlog.trim() === ']')
                    controller.terminate();
            },
            flush(controller) {
                // Try parsing whatever is left
                if (backlog.trim())
                    enqueueBacklog(controller);
                backlog = '';
            }
        });
    }
}
class JSONStreamStringifier extends TransformStream {
    constructor({ skipErrors = false, stringifyJSON = JSON.stringify, endl = '\n' } = {}) {
        let backlog = undefined, ready = false, enqueueBacklog = (controller) => {
            try {
                controller.enqueue((ready ? ',' : '') + endl.repeat(2) + stringifyJSON(backlog));
                ready = true;
            }
            catch (error) {
                if (!skipErrors)
                    controller.error(error);
            }
        };
        super({
            start(controller) {
                controller.enqueue('[');
            },
            transform(chunk, controller) {
                if (backlog !== undefined)
                    enqueueBacklog(controller);
                backlog = chunk;
            },
            flush(controller) {
                if (backlog !== undefined)
                    enqueueBacklog(controller);
                backlog = undefined;
                controller.enqueue(endl.repeat(2) + ']');
            }
        });
    }
}
/*
 * MIT License
 * Copyright (c) 2020-2023 S. Beeblebrox
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
var SHML;
(function (SHML) {
    SHML.VERSION = Object.freeze({
        toString() { return `${SHML.VERSION.major}.${SHML.VERSION.minor}.${SHML.VERSION.patch}${SHML.VERSION.prerelease !== undefined ? `-${SHML.VERSION.prerelease}` : ''}${SHML.VERSION.metadata !== undefined ? `+${SHML.VERSION.metadata}` : ''}`; },
        major: 1, minor: 7, patch: 2
    });
    function cyrb64(text, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < text.length; i++) {
            ch = text.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
    }
    let UnicodeHelper;
    (function (UnicodeHelper) {
        const throws = (e) => { throw e; };
        UnicodeHelper.NONCHARACTERS = Object.freeze([...function* generate() {
                for (let plane = 0; plane < 16; plane++) {
                    yield 0xfffe + 0x10000 * plane;
                    yield 0xffff + 0x10000 * plane;
                }
                yield 0x10fffe;
                yield 0x10fffe;
                for (let codepoint = 0xfdd0; codepoint < 0xfdd0 + 32; codepoint++)
                    yield codepoint;
            }()].map(o => String.fromCodePoint(o)));
        const noncharacterIterator = (function* f() {
            for (const noncharacter of UnicodeHelper.NONCHARACTERS)
                yield noncharacter;
        })();
        function nextNoncharacter() {
            var _a;
            return (_a = noncharacterIterator.next().value) !== null && _a !== void 0 ? _a : throws('No more noncharacters');
        }
        UnicodeHelper.nextNoncharacter = nextNoncharacter;
        function isInvalid(text) {
            return new RegExp(`[${UnicodeHelper.NONCHARACTERS.join('')}]`).test(text);
        }
        UnicodeHelper.isInvalid = isInvalid;
        UnicodeHelper.INLINE_MARKER = nextNoncharacter(), UnicodeHelper.BLOCK_MARKER = nextNoncharacter(), UnicodeHelper.HEXADECIMAL_MAPPING = Object.fromEntries(Array.apply(null, { length: 16 }).map((_, i) => [i.toString(16), nextNoncharacter()]));
    })(UnicodeHelper || (UnicodeHelper = {}));
    function abstractParse(text, args, sanitizer) {
        if (UnicodeHelper.isInvalid(text))
            throw 'Invalid Unicode Noncharacters present in text';
        if (sanitizer !== 'disable sanitizer')
            text = text.replace(/[<>&"']/g, match => {
                switch (match) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '"': return '&quot;';
                    case '\'': return '&#x27;';
                    default: throw null;
                }
            });
        const hashmap = new Map();
        function parseLevel(text, args) {
            for (const [blockType, { pattern, isInline }] of args.entries())
                text = text.replace(pattern, (...strings) => {
                    const text = strings[0], lastArg = strings[strings.length - 1], groups = typeof lastArg === 'object' ? lastArg : undefined, marker = (isInline !== null && isInline !== void 0 ? isInline : true) && UnicodeHelper.INLINE_MARKER || UnicodeHelper.BLOCK_MARKER, hash = `${marker}${cyrb64(text).split('').map(o => UnicodeHelper.HEXADECIMAL_MAPPING[o]).join('')}${marker}`;
                    for (const [key, value] of Object.entries(groups !== null && groups !== void 0 ? groups : {})) {
                        if (key.toUpperCase() === key)
                            groups[key] = parseLevel(value, new Map([...args.entries()].filter(([argBlockType]) => argBlockType !== blockType)));
                    }
                    hashmap.set(hash, { blockType, text: text, groups });
                    return hash;
                });
            return text;
        }
        function decode(text, literal) {
            while (text.includes(UnicodeHelper.INLINE_MARKER) || text.includes(UnicodeHelper.BLOCK_MARKER))
                text = text.replace(/([\ufffe\uffff]).*?\1/, hash => {
                    var _a;
                    const block = hashmap.get(hash);
                    return literal ? block.text : ((_a = args.get(block.blockType).reviver) !== null && _a !== void 0 ? _a : (({ blockType, groups }) => `<${blockType}>${groups.TEXT}</${blockType}>`))(block, decode);
                });
            return text;
        }
        return decode(parseLevel(text, args));
    }
    let Configuration;
    (function (Configuration) {
        Configuration.SYMBOLS = {
            '~': { 'A': 'Ã', 'I': 'Ĩ', 'N': 'Ñ', 'O': 'Õ', 'U': 'Ũ', 'a': 'ã', 'i': 'ĩ', 'n': 'ñ', 'o': 'õ', 'u': 'ũ' },
            ':': { 'A': 'Ä', 'E': 'Ë', 'I': 'Ï', 'O': 'Ö', 'U': 'Ü', 'Y': 'Ÿ', 'a': 'ä', 'e': 'ë', 'i': 'ï', 'o': 'ö', 'u': 'ü', 'y': 'ÿ' },
            /*'*/ '&#x27;': { 'A': 'Á', 'C': 'Ć', 'E': 'É', 'I': 'Í', 'L': 'Ĺ', 'N': 'Ń', 'O': 'Ó', 'R': 'Ŕ', 'S': 'Ś', 'U': 'Ú', 'Y': 'Ý', 'Z': 'Ź', 'a': 'á', 'c': 'ć', 'e': 'é', 'g': 'ǵ', 'i': 'í', 'l': 'ĺ', 'n': 'ń', 'o': 'ó', 'r': 'ŕ', 's': 'ś', 'u': 'ú', 'y': 'ý', 'z': 'ź' },
            /*"*/ '&quot;': { 'O': 'Ő', 'U': 'Ű', 'o': 'ő', 'u': 'ű' },
            '`': { 'A': 'À', 'E': 'È', 'I': 'Ì', 'O': 'Ò', 'U': 'Ù', 'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù' },
            '^': { 'A': 'Â', 'C': 'Ĉ', 'E': 'Ê', 'G': 'Ĝ', 'H': 'Ĥ', 'I': 'Î', 'J': 'Ĵ', 'O': 'Ô', 'S': 'Ŝ', 'U': 'Û', 'W': 'Ŵ', 'Y': 'Ŷ', 'a': 'â', 'c': 'ĉ', 'e': 'ê', 'g': 'ĝ', 'h': 'ĥ', 'i': 'î', 'j': 'ĵ', 'o': 'ô', 's': 'ŝ', 'u': 'û', 'w': 'ŵ', 'x': '◯', 'y': 'ŷ' },
            'o': { 'A': 'Å', 'U': 'Ů', 'a': 'å', 'u': 'ů' },
            '/': { 'O': 'Ø', 'h': 'ℏ', 'o': 'ø' },
            ',': { 'C': 'Ç', 'G': 'Ģ', 'K': 'Ķ', 'L': 'Ļ', 'N': 'Ņ', 'R': 'Ŗ', 'S': 'Ş', 'T': 'Ţ', 'c': 'ç', 'k': 'ķ', 'l': 'ļ', 'n': 'ņ', 'r': 'ŗ', 's': 'ş', 't': 'ţ' },
            '-': { 'A': 'Ā', 'E': 'Ē', 'I': 'Ī', 'O': 'Ō', 'U': 'Ū', 'a': 'ā', 'e': 'ē', 'i': 'ī', 'o': 'ō', 'u': 'ū' },
            'u': { 'A': 'Ă', 'G': 'Ğ', 'U': 'Ŭ', 'a': 'ă', 'g': 'ğ', 'u': 'ŭ' },
            '.': { 'C': 'Ċ', 'E': 'Ė', 'G': 'Ġ', 'I': 'İ', 'Z': 'Ż', 'c': 'ċ', 'e': 'ė', 'g': 'ġ', 'o': '⊙', 's': '⋅', 't': '⃛', 'z': 'ż' },
            '?': { 'A': 'Ą', 'E': 'Ę', 'I': 'Į', 'U': 'Ų', 'a': 'ą', 'e': 'ę', 'i': 'į', 'u': 'ų' },
            'v': { 'C': 'Č', 'D': 'Ď', 'E': 'Ě', 'L': 'Ľ', 'N': 'Ň', 'R': 'Ř', 'S': 'Š', 'T': 'Ť', 'Z': 'Ž', 'c': 'č', 'd': 'ď', 'e': 'ě', 'l': 'ľ', 'n': 'ň', 'r': 'ř', 's': 'š', 't': 'ť', 'z': 'ž' },
            '_': { 'D': 'Đ', 'H': 'Ħ', 'L': 'Ł', 'T': 'Ŧ', 'd': 'đ', 'h': 'ħ', 'l': 'ł', 't': 'ŧ' }
        };
        function unicodeMarkup(customTokens = new Map()) {
            const args = new Map();
            args.set('escaped', { pattern: /\\(?<what>[^ntp])/g, reviver({ groups }) {
                    return groups.what;
                } });
            args.set('raw', { pattern: /<<\/(?<text>[\s\S]*?)\/>>/g, reviver({ groups }) {
                    return groups.text;
                } });
            args.set('code', { pattern: /(`)(?<text>.*?)\1/g, reviver({ groups }, decode) {
                    return decode(groups.text, true)
                        .replace(/[a-z]/g, char => shiftChar(char, 'a', '𝚊'))
                        .replace(/[A-Z]/g, char => shiftChar(char, 'A', '𝙰'))
                        .replace(/\d/g, char => shiftChar(char, '1', '𝟷'));
                } });
            args.set('symbol', { pattern: /\/(?<what>('|"|.).|\?|!)\//g, reviver({ groups }) {
                    var _a, _b;
                    groups.what = groups.what.replace('"', '&quot;').replace('\'', '&#x27;');
                    switch (groups.what) {
                        case '!': return '¡';
                        case '?': return '¿';
                        default: return (_b = (_a = Configuration.SYMBOLS[groups.what.substring(0, groups.what.length - 1)]) === null || _a === void 0 ? void 0 : _a[groups.what.substring(groups.what.length - 1)]) !== null && _b !== void 0 ? _b : `/${groups.what}/`;
                    }
                } });
            args.set('unicode_shortcut', { pattern: /(?<=\b)(?:TM|SS|PG|SM)(?=\b)|\([cCrR]\)|-&gt;|&lt;-/g, reviver({ text }) {
                    switch (text) {
                        case 'SS': return '§';
                        case 'PG': return '¶';
                        case 'SM': return '℠';
                        case 'TM': return '™';
                        case '(C)':
                        case '(c)': return '©';
                        case '(R)':
                        case '(r)': return '®';
                        case '->;': return '→';
                        case '<-': return '←';
                        default: return text;
                    }
                } });
            function shiftChar(char, base, to) {
                return String.fromCharCode(0xD835, char.charCodeAt(0) + (to.charCodeAt(1) - base.charCodeAt(0)));
            }
            args.set('em_strong', { pattern: /(\*\*\*)(?=[^*])(?<TEXT>.*?)\1/g, reviver({ groups }, decode) {
                    return decode(groups.TEXT)
                        .replace(/[a-z]/g, char => shiftChar(char, 'a', '𝙖'))
                        .replace(/[A-Z]/g, char => shiftChar(char, 'A', '𝘼'))
                        .replace(/\d/g, char => shiftChar(char, '1', '𝟭'));
                } });
            args.set('strong', { pattern: /(\*\*)(?=[^*])(?<TEXT>.*?)\1/g, reviver({ groups }, decode) {
                    return decode(groups.TEXT)
                        .replace(/[a-z]/g, char => shiftChar(char, 'a', '𝗮'))
                        .replace(/[A-Z]/g, char => shiftChar(char, 'A', '𝗔'))
                        .replace(/\d/g, char => shiftChar(char, '1', '𝟭'));
                } });
            args.set('em', { pattern: /(\*)(?=[^*])(?<TEXT>.*?)\1/g, reviver({ groups }, decode) {
                    return decode(groups.TEXT)
                        .replace(/[a-z]/g, char => shiftChar(char, 'a', '𝘢'))
                        .replace(/[A-Z]/g, char => shiftChar(char, 'A', '𝘈'));
                } });
            function SimpleInlineRegExp(marker) {
                return new RegExp(String.raw `(${marker.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})(?<TEXT>.*?)\1`, 'g');
            }
            args.set('u', { pattern: SimpleInlineRegExp('__'), reviver({ groups }, decode) {
                    return decode(groups.TEXT).replace(/\uD835.|[a-z0-9]/gi, char => char + String.fromCharCode(0x2060, 'a͟'.charCodeAt(1)));
                } });
            args.set('del', { pattern: SimpleInlineRegExp('~~'), reviver({ groups }, decode) {
                    return decode(groups.TEXT).replace(/\uD835.|[a-z0-9]/gi, char => char + String.fromCharCode(0x2060, 'a̶'.charCodeAt(1)));
                } });
            args.set('custom_token', { pattern: /:(?<what>[a-zA-Z0-9][a-zA-Z0-9_\-]*?):/g, isInline: true, reviver({ groups }) { var _a; return (_a = customTokens.get(groups.what)) !== null && _a !== void 0 ? _a : `:${groups.what}:`; } });
            args.set('nbsp', { pattern: /\\p/g, reviver() { return String.fromCharCode(0x00A0); } });
            args.set('emsp', { pattern: /\\t/g, reviver() { return String.fromCharCode(0x2003); } });
            args.set('linebreak', { pattern: /\\n/g, reviver() { return '\n'; } });
            return args;
        }
        Configuration.unicodeMarkup = unicodeMarkup;
        function inlineMarkup(customTokens = new Map()) {
            const args = new Map();
            args.set('escaped', { pattern: /\\(?<what>[^ntp])/g, reviver({ groups }) {
                    return groups.what;
                } });
            args.set('raw', { pattern: /&lt;&lt;\/(?<text>[\s\S]*?)\/&gt;&gt;/g, reviver({ groups }) {
                    return groups.text;
                } });
            args.set('src_comment', { pattern: /&lt;!!--(?<text>[\s\S]*?)--&gt;/g, reviver() { return ''; } });
            args.set('comment', { pattern: /&lt;!--(?<text>[\s\S]*?)--&gt;/g, isInline: true, reviver({ groups }) {
                    return `<!--${groups.text}-->`;
                } });
            args.set('code', { pattern: /(`)(?<text>.*?)\1/g, reviver({ groups }, decode) {
                    return `<code>${decode(groups.text, true)}</code>`;
                } });
            args.set('symbol', { pattern: /\/(?<what>(&#x27;|&quot;|.).|\?|!)\//g, reviver({ groups }) {
                    var _a, _b;
                    switch (groups.what) {
                        case '!': return '&iexcl;';
                        case '?': return '&iquest;';
                        default: return (_b = (_a = Configuration.SYMBOLS[groups.what.substring(0, groups.what.length - 1)]) === null || _a === void 0 ? void 0 : _a[groups.what.substring(groups.what.length - 1)]) !== null && _b !== void 0 ? _b : `/${groups.what}/`;
                    }
                } });
            args.set('unicode_shortcut', { pattern: /(?<=\b)(?:TM|SS|PG|SM)(?=\b)|\([cCrR]\)|-&gt;|&lt;-/g, reviver({ text }) {
                    switch (text) {
                        case 'SS': return '&sect;';
                        case 'PG': return '&para;';
                        case 'SM': return '&#8480;';
                        case 'TM': return '&trade;';
                        case '(C)':
                        case '(c)': return '&copy';
                        case '(R)':
                        case '(r)': return '&reg;';
                        case '-&gt;': return '&rarr;';
                        case '&lt;-': return '&larr;';
                        default: return text;
                    }
                } });
            args.set('strong', { pattern: /(\*\*)(?=[^*])(?<TEXT>.*?)\1/g });
            args.set('em', { pattern: /(\*)(?=[^*])(?<TEXT>.*?)\1/g });
            function SimpleInlineRegExp(marker) {
                return new RegExp(String.raw `(${marker.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})(?<TEXT>.*?)\1`, 'g');
            }
            args.set('u', { pattern: SimpleInlineRegExp('__') });
            args.set('del', { pattern: SimpleInlineRegExp('~~') });
            args.set('sup', { pattern: SimpleInlineRegExp('^^') });
            args.set('sub', { pattern: SimpleInlineRegExp(',,') });
            args.set('mark', { pattern: /(\|\|)(\[(?:color=)?(?<color>[^;]*?)\])?(?<TEXT>.*?)\1/g, reviver({ groups }) {
                    return `<mark${groups.color ? ` style="background-color:${groups.color}"` : ''}>${groups.TEXT}</mark>`;
                } });
            args.set('span', { pattern: /(&amp;&amp;)(\[(?:color=)?(?<color>[^;]*?)\])?(?<TEXT>.*?)\1/g, reviver({ groups }) {
                    var _a;
                    return `<span style="color:${(_a = groups.color) !== null && _a !== void 0 ? _a : 'red'}">${groups.TEXT}</span>`;
                } });
            args.set('spoiler', { pattern: /&lt;\?(?<TEXT>.*?)\?&gt;/g, reviver({ groups }) {
                    return `<span style="filter: blur(0.25em); cursor: pointer;" title="Show spoiler?" onclick="this.removeAttribute('style'); this.removeAttribute('title'); this.removeAttribute('onclick');">${groups.TEXT}</span>`;
                } });
            args.set('custom_token', { pattern: /:(?<what>[a-zA-Z0-9][a-zA-Z0-9_\-]*?):/g, isInline: true, reviver({ groups }) { var _a; return (_a = customTokens.get(groups.what)) !== null && _a !== void 0 ? _a : `:${groups.what}:`; } });
            args.set('nbsp', { pattern: /\\p/g, reviver() { return '&nbsp;'; } });
            args.set('emsp', { pattern: /\\t/g, reviver() { return '&emsp;'; } });
            args.set('linebreak', { pattern: /\\n/g, reviver() { return '<br>'; } });
            args.set('wordbreak', { pattern: /(?<=\S)-\/-(?=\S)/g, reviver() { return '<wbr>'; } });
            args.set('a', { pattern: /(?<newtab>\+)?\[(?<href>.*?)\]\((?<TEXT>.*?)\)/g, isInline: true, reviver({ blockType, text, groups }) {
                    return `<a href="${/^[^:]*?(?:(?:(?<=mailto|tel|https|http):|\/.*:).*)?$/g.test(groups.href) ? groups.href : 'about:blank#blocked'}"${groups.newtab ? ' target="_blank"' : ''}>${groups.TEXT}</a>`;
                } });
            args.set('autolink', { pattern: /(?<text>(?:(?<protocol>https?:\/\/)|(?<www>www\.))(?<link>\w[\w\-]*(?<=\w)\.\w[\w.\/?&#%=+\-]*(?<=[\w\/])))/g, reviver({ groups }) {
                    var _a, _b;
                    return `<a href="${(_a = groups.protocol) !== null && _a !== void 0 ? _a : 'https://'}${(_b = groups.www) !== null && _b !== void 0 ? _b : ''}${groups.link}">${groups.text}</a>`;
                } });
            args.set('autolink_email', { pattern: /(?<text>\w[\w.\-]*?@[\w.\-]+\.\w+)/g, reviver({ groups }) {
                    return `<a href="mailto:${groups.text}">${groups.text}</a>`;
                } });
            args.set('html', { pattern: /&lt;(?<what>\/?(?:code|em|i|strong|b|u|del|sub|sup|mark|span|wbr|br))&gt;/g, isInline: true, reviver({ blockType, text, groups }) {
                    return `<${groups.what}>`;
                } });
            return args;
        }
        Configuration.inlineMarkup = inlineMarkup;
        function blockMarkup(customTokens = new Map(), properties = new Map(), ids = new Set()) {
            const args = new Map(), inlineArgs = inlineMarkup(customTokens);
            args.set('escaped', inlineArgs.get('escaped'));
            args.set('raw', inlineArgs.get('raw'));
            args.set('src_comment', inlineArgs.get('src_comment'));
            args.set('comment', inlineArgs.get('comment'));
            args.set('code_block', { pattern: /(```+)(?<lines>#)?(?<language>c\+\+|[a-z]+)?(?<text>[\s\S]*?)\1/g, isInline: false, reviver({ groups }, decode) {
                    var _a;
                    return `<pre><code>${groups.language || groups.lines ? SHML.parseCode(decode(groups.text, true).replace(/&lt;|&gt;|&amp;|&quot;|&#x27;/g, (match) => {
                        switch (match) {
                            case '&lt;': return '<';
                            case '&gt;': return '>';
                            case '&amp;': return '&';
                            case '&quot;': return '"';
                            case '&#x27;': return '\'';
                            default: throw null;
                        }
                    }).trim(), (_a = groups.language) !== null && _a !== void 0 ? _a : 'none', groups.lines === '#') : decode(groups.text, true).trim()}</code></pre>`;
                } });
            args.set('property', { pattern: /^[\t ]*?![\t ]*?(?<key>[a-zA-Z_][a-zA-Z_0-9]*?)(?<!http|https):(?<value>.*?)$/gm, isInline: false, reviver({ groups }) {
                    properties.set(groups.key, groups.value.trim());
                    return '';
                } });
            args.set('template', { pattern: /\${(?<key>[a-zA-Z_][a-zA-Z_0-9]*?)\}/g, isInline: true, reviver({ groups }) {
                    var _a;
                    return (_a = properties.get(groups.key)) !== null && _a !== void 0 ? _a : `\${${groups.key}}`;
                } });
            args.set('image', { pattern: /!\[(?<src>\S*?)(?:[\t ]*?(?<height>auto|\d*)(?:[xX](?<width>auto|\d*))?)?\](?:\((?<alt>.*?)\))?/g, reviver({ groups }) {
                    var _a;
                    (_a = groups.width) !== null && _a !== void 0 ? _a : (groups.width = groups.height);
                    return `<img src="${groups.src}"${groups.alt ? ` alt="${groups.alt}"` : ''}${groups.height ? ` height="${groups.height}"` : ''}${groups.width ? ` width="${groups.width}"` : ''}>`;
                } });
            for (const entry of inlineArgs.entries())
                if (!args.has(entry[0]))
                    args.set(...entry);
            args.set('details', { pattern: /(?<=\n|^)[\t ]*!(?<mode>[vV]|&gt;)?!(?<summary>.*?)\[\s*(?<DETAILS>[\s\S]*?)\s*(?<!\])\](?!\])/g, isInline: false, reviver({ groups }) {
                    var _a, _b;
                    return `<details${((_b = (_a = groups.mode) === null || _a === void 0 ? void 0 : _a.toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a)) === 'v' ? ' open' : ''}><summary>${groups.summary}</summary>\n${groups.DETAILS}</details>`;
                } });
            args.set('text-align', { pattern: /(?<=\n|^)[^\S\n]*?@@\s*?(?<what>center(?:ed)?|left|right|justif(?:y|ied)(?:-all)?)\s*?(?<TEXT>[\s\S]*?)(?:$|(?:(?<=\n)[^\S\n]*?@@[\t ]*?reset)|(?=\n[^\S\n]*?@@[\t ]*?(?:center(?:ed)?|left|right|justif(?:y|ied)(?:-all)?)))/g, isInline: false, reviver({ groups }) {
                    var _a;
                    const overrides = { centered: 'center', justified: 'justify', 'justified-all': 'justify-all' };
                    return `<div style="text-align: ${(_a = overrides[groups.what]) !== null && _a !== void 0 ? _a : groups.what};">${groups.TEXT}</div>`;
                } });
            args.set('numbered_header', { pattern: /^[\t ]*?(?<count>#{1,6})(?:\[(?<id>[a-zA-Z_][a-zA-Z_0-9]*?)\])?[\t ]?(?<TEXT>[^\uffff]*?)\k<count>?(?=\n|$)/gm, isInline: false, reviver({ groups }) {
                    var _a;
                    if (groups.id)
                        ids.add(`h${groups.count.length}:${groups.id}`);
                    (_a = groups.id) !== null && _a !== void 0 ? _a : (groups.id = cyrb64(groups.TEXT));
                    return `<h${groups.count.length} id="h${groups.count.length}:${groups.id}"><a href="#h${groups.count.length}:${groups.id}" title="Link to section">${groups.TEXT}</a></h${groups.count.length}>`;
                } });
            args.set('hr', { pattern: /^[\t ]*([-=])\1{2,}[\t ]*$/gm, isInline: false, reviver() { return '<hr>'; } });
            args.set('table', { pattern: /\[\[(?:\n\s*(?:title=)?(?<title>[^,\n]*)\n)?(?<contents>[\s\S]*?)\]\]/g, isInline: false, reviver({ groups }) {
                    const rows = groups.contents.trim().split('\n').map((row, index) => `\n<tr>${row.split(',').map((column) => `<t${index && 'd' || 'h'}>${column.trim()}</t${index && 'd' || 'h'}>`).join('')}</tr>`);
                    return `<table>${groups.title ? `\n<caption>${groups.title.trim()}</caption>` : ''}\n<thead>${rows.shift()}\n<thead>\n<tbody>${rows.join('')}\n<tbody>\n</table>`;
                } });
            args.set('list', { pattern: /(?<text>(?<=\n|^)[\t ]*?(?:\+|\d+[.)])[\s\S]*?(?=\n\n|$))/g, isInline: false, reviver({ groups }) {
                    var _a;
                    const openTags = [];
                    let lastType = null, lastIndent = 0, result = '';
                    function openTag(tag) {
                        result += `<${tag}>`;
                        openTags.push(tag);
                    }
                    function closeTag() {
                        result += `</${openTags.pop()}>`;
                    }
                    for (const line of groups.text.trim().split('\n')) {
                        const groups = (_a = line.match(/(?<whitespace>\s*?)(?<what>\+|\d+[.)])(?:\s*)(?<text>.*)/)) === null || _a === void 0 ? void 0 : _a.groups;
                        if (!groups) {
                            result = result.replace(/(<\/..\>)$/, '<br>' + line.trim() + '$1');
                            continue;
                        }
                        const currentType = groups.what === '+' ? 'ul' : 'ol';
                        if (lastType == null || groups.whitespace.length > lastIndent)
                            openTag(currentType);
                        else if (groups.whitespace.length < lastIndent)
                            closeTag();
                        else if (currentType !== lastType) {
                            closeTag();
                            openTag(currentType);
                        }
                        result += `<li>${groups.text}</li>`;
                        [lastType, lastIndent] = [currentType, groups.whitespace.length];
                    }
                    while (openTags.length)
                        closeTag();
                    return result;
                } });
            args.set('blockquote', { pattern: /(?<text>(?:(?:&gt;){3}[\s\S]*?(?:-[\t ]*?(?<citation>.*?))?(?:\n|$))+)/g, isInline: false, reviver({ groups }) {
                    var _a;
                    return `<figure><blockquote>${groups.text.replace(/(?:&gt;){3}/g, '').replace(new RegExp(String.raw `-\s*?${(_a = groups.citation) === null || _a === void 0 ? void 0 : _a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\s*?$`), '')}</blockquote>${groups.citation && `<figcaption><cite>- ${groups.citation}</cite></figcaption>` || ''}</figure>`;
                } });
            args.set('block_html', { pattern: /&lt;(?<what>\/?(?:h[123456]|hr|blockquote|ul|ol|li))&gt;/g, isInline: false, reviver({ groups }) {
                    return `<${groups.what}>`;
                } });
            args.set('text', { pattern: /(?<=\n)\n?(?<TEXT>[^\uffff]+?)(?=  \s*?\n|\n\n|\uffff|$)/g, isInline: false, reviver({ blockType, text, groups }) {
                    return groups.TEXT.trim() ? `<p>${groups.TEXT.trim()}</p>\n` : '';
                } });
            return args;
        }
        Configuration.blockMarkup = blockMarkup;
        let Code;
        (function (Code) {
            Code.SUPPORTED_LANGUAGES = ['html', 'css', 'js', 'javascript', 'ts', 'typescript', 'xml', 'json', 'py', 'python', 'diff', 'c', 'c++', 'cpp', 'sh', 'shell', 'bash', 'java', 'none'];
            function wrapMultiline(open, text, close) {
                return text.split('\n').map(line => open + line + close).join('\n');
            }
            function appendTokenMatcher(name, pattern, args) {
                args.set(name, { pattern, reviver({ groups }) {
                        return wrapMultiline(`<span data-code-token="${name}">`, groups.text, `</span>`);
                    } });
            }
            function htmlHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                function desanitize(text) {
                    return text.replace(/&lt;|&gt;|&amp;|&quot;|&#x27;/g, (match) => {
                        switch (match) {
                            case '&lt;': return '<';
                            case '&gt;': return '>';
                            case '&amp;': return '&';
                            case '&quot;': return '"';
                            case '&#x27;': return '\'';
                            default: throw null;
                        }
                    });
                }
                args.set('comment', { pattern: /(?<text>(?:&lt;!--[\s\S]*?--&gt;))/g, reviver({ groups }, decode) {
                        return wrapMultiline('<span data-code-token="comment">', decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, ''), '</span>');
                    } });
                args.set('doctype', { pattern: /^(?<whitespace>\s*)(?<text>&lt;!DOCTYPE\b.*?&gt;)/i, reviver({ groups }) {
                        return `${groups.whitespace || ''}<span data-code-token="doctype">${groups.text}</span>`;
                    } });
                args.set('style', { pattern: /(?<OPENTAG>&lt;style\b.*?&gt;)(?<content>[\s\S]*?)(?<CLOSETAG>&lt;\/style&gt;)/g, reviver({ groups }, decode) {
                        return groups.OPENTAG + parseCode(desanitize(decode(groups.content)), 'css', false) + groups.CLOSETAG;
                    } });
                args.set('script', { pattern: /(?<OPENTAG>&lt;script\b.*?&gt;)(?<content>[\s\S]*?)(?<CLOSETAG>&lt;\/script&gt;)/g, reviver({ groups }, decode) {
                        return groups.OPENTAG + parseCode(desanitize(decode(groups.content)), 'javascript', false) + groups.CLOSETAG;
                    } });
                args.set('tag-open', { pattern: /(?<name>&lt;[a-z\-0-9]+)(?<DATA>[^\uffff\ufffe]*?)(?<close>\/?&gt;)/gi, reviver({ groups }) {
                        var _a;
                        return `<span data-code-token="tag">${groups.name}</span>${(_a = groups.DATA) !== null && _a !== void 0 ? _a : ''}<span data-code-token="tag">${groups.close}</span>`;
                    } });
                args.set('string', { pattern: /(?<front>=\s*?)(?<text>&#x27;&#x27;|&quot;&quot;|(?:(?<what>&quot;|&#x27;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>))/g, reviver({ groups }) {
                        return groups.front + `<span data-code-token="string">${groups.text}</span>`;
                    } });
                args.set('tag-close', { pattern: /(?<text>&lt;\/[a-z\-0-9]+\s*?&gt;)/gi, reviver({ groups }) {
                        return `<span data-code-token="tag">${groups.text}</span>`;
                    } });
                return args;
            }
            Code.htmlHighlighter = htmlHighlighter;
            const CSS_AT_RULES = ['charset', 'color-profile ', 'counter-style', 'document ', 'font-face', 'font-feature-values', 'import', 'keyframes', 'media', 'namespace', 'page', 'property ', 'supports', 'viewport', 'color-profile', 'document', 'layer', 'property', 'scroll-timeline', 'swash', 'ornaments', 'annotation', 'stylistic', 'styleset', 'character-variant'];
            function cssHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                matchToken('string', /(?<text>&#x27;&#x27;|&quot;&quot;|(?:(?<what>&quot;|&#x27;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>))/g);
                args.set('comment', { pattern: /(?<text>(?:\/\*[\s\S]*?\*\/))/g, reviver({ groups }, decode) {
                        return wrapMultiline('<span data-code-token="comment">', decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, ''), '</span>');
                    } });
                matchToken('keyword', new RegExp(String.raw `(?<text>@(?:${CSS_AT_RULES.join('|')})\b)`, 'g'));
                matchToken('selector', /(?<text>[^\s{};\uffff\ufffe][^{};\uffff\ufffe]*?[^\s{};\uffff\ufffe]?(?=\s*{))/g);
                matchToken('property', /(?<text>\b[a-z\-]+:)/g);
                matchToken('hexadecimal', /(?<text>(?<!&)#(?:(?:[0-9a-f]){8}|(?:[0-9a-f]){6}|(?:[0-9a-f]){3,4})\b)/gi);
                matchToken('number', /(?<text>\b(\d[\d_]*\.?[\d_]*((?<=[\d.])e[+\-]?\d[\d_]*)?n?(?<!_))(?:%|\b|[a-z]+))/gi);
                matchToken('function', /(?<text>\b[a-z\-]+\b(?=\())/g);
                matchToken('other', /(?<text>(?<!&)\b[a-z\-]+\b)/g);
                return args;
            }
            Code.cssHighlighter = cssHighlighter;
            const JAVASCRIPT_KEYWORDS = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'await', 'null', 'true', 'false', 'abstract', 'boolean', 'byte', 'char', 'double', 'final', 'float', 'goto', 'int', 'long', 'native', 'short', 'synchronized', 'throws', 'transient', 'volatile', 'of', 'eval'];
            function javascriptHighlighter() {
                return ecmascriptHighlighter(JAVASCRIPT_KEYWORDS);
            }
            Code.javascriptHighlighter = javascriptHighlighter;
            const TYPESCRIPT_KEYWORDS = ['enum', 'as', 'asserts', 'any', 'async', 'constructor', 'declare', 'get', 'infer', 'intrinsic', 'is', 'keyof', 'module', 'namespace', 'never', 'readonly', 'require', 'number', 'object', 'set', 'string', 'symbol', 'type', 'undefined', 'unique', 'unknown', 'from', 'global', 'bigint', 'override'];
            function typescriptHighlighter() {
                return ecmascriptHighlighter([...JAVASCRIPT_KEYWORDS, ...TYPESCRIPT_KEYWORDS]);
            }
            Code.typescriptHighlighter = typescriptHighlighter;
            function ecmascriptHighlighter(keywords) {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                args.set('multiline-string', { pattern: /(?<text>(?<what>`)(?:[^\uffff\ufffe]*?[^\\])?(?:\\\\)*\k<what>)/g, reviver: ({ groups }) => wrapMultiline('<span data-code-token="string">', groups.text, '</span>') });
                matchToken('string', /(?<text>&#x27;&#x27;|&quot;&quot;|(?:(?<what>&quot;|&#x27;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>))/g);
                args.set('comment', { pattern: /(?<text>(?:\/\/.*)|(?:\/\*[\s\S]*?\*\/))/g, reviver({ groups }, decode) {
                        return wrapMultiline('<span data-code-token="comment">', decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, ''), '</span>');
                    } });
                matchToken('number', /(?<text>\b(?:Infinity|NaN|0(?:[xX][0-9a-fA-F][0-9a-fA-F_]*|[bB][01][01_]*|[oO][0-7][0-7_]*)(?<!_)|\d[\d_]*\.?[\d_]*((?<=[\d.])[eE][+\-]?\d[\d_]*)?n?(?<!_))\b)/g);
                matchToken('keyword', new RegExp(String.raw `(?<text>\b(?:${keywords.join('|')})\b)`, 'g'));
                return args;
            }
            Code.ecmascriptHighlighter = ecmascriptHighlighter;
            function xmlHighlighter() {
                const args = new Map();
                const htmlArgs = htmlHighlighter(), inheritFromHTML = (name) => args.set(name, htmlArgs.get(name));
                inheritFromHTML('comment');
                args.set('processing-instruction', { pattern: /(?<name>&lt;\?[a-z0-9\-]+)(?<DATA>\b.*?)(?<close>\?&gt;)/gi, reviver({ groups }) {
                        return `<span data-code-token="processing-instruction">${groups.name}</span>${groups.DATA}<span data-code-token="processing-instruction">${groups.close}</span>`;
                    } });
                args.set('cdata', { pattern: /(?<open>&lt;!\[CDATA\[)(?<content>[\s\S]*?)(?<close>\]\]&gt;)/g, reviver({ groups }) {
                        return `<span data-code-token="cdata">${groups.open}</span>` + wrapMultiline('<span data-code-token="cdata-content">', groups.content, '</span>') + `<span data-code-token="cdata">${groups.close}</span>`;
                    } });
                args.set('tag-open', { pattern: /(?<name>&lt;[a-z\-0-9]+(?:\:[a-z\-0-9]+)?)(?<DATA>[^\uffff\ufffe]*?)(?<close>\/?&gt;)/gi, reviver({ groups }) {
                        var _a;
                        return `<span data-code-token="tag">${groups.name}</span>${(_a = groups.DATA) !== null && _a !== void 0 ? _a : ''}<span data-code-token="tag">${groups.close}</span>`;
                    } });
                inheritFromHTML('string');
                args.set('tag-close', { pattern: /(?<text>&lt;\/[a-z\-0-9]+(?:\:[a-z\-0-9]+)?\s*?&gt;)/gi, reviver({ groups }) {
                        return `<span data-code-token="tag">${groups.text}</span>`;
                    } });
                return args;
            }
            Code.xmlHighlighter = xmlHighlighter;
            function jsonHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                matchToken('string', /(?<text>&quot;&quot;|(?:(?<what>&quot;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>))/g);
                matchToken('number', /(?<text>-?\b\d+(\.\d+)?(e[+\-]?\d+)?\b)/gi);
                matchToken('keyword', /(?<text>\b(?:true|false|null)\b)/g);
                return args;
            }
            Code.jsonHighlighter = jsonHighlighter;
            const PYTHON_KEYWORDS = ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
            function pythonHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                args.set('multiline-string', { pattern: /(?<text>(?<what>(?<qtype>&quot;|&#x27;)\k<qtype>{2})(?:[^\uffff\ufffe]*?[^\\])?(?:\\\\)*\k<what>)/g, reviver: ({ groups }) => wrapMultiline('<span data-code-token="string">', groups.text, '</span>') });
                matchToken('string', /(?<text>&#x27;&#x27;|&quot;&quot;|(?:(?<what>&quot;|&#x27;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>))/g);
                args.set('comment', { pattern: /(?<text>(?:(?<!&)#.*))/g, reviver({ groups }, decode) {
                        return `<span data-code-token="comment">${decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, '')}</span>`;
                    } });
                matchToken('number', /(?<text>\b(?:0(?:[xX][0-9a-fA-F][0-9a-fA-F_]*|[bB][01][01_]*|[oO][0-7][0-7_]*)(?<!_)|\d[\d_]*\.?[\d_]*((?<=[\d.])[eE][+\-]?\d[\d_]*)?j?(?<!_))\b)/g);
                matchToken('value', /(?<text>\b(?:True|False|None)\b)/g);
                matchToken('keyword', new RegExp(String.raw `(?<text>\b(?:${PYTHON_KEYWORDS.join('|')})\b)`, 'g'));
                return args;
            }
            Code.pythonHighlighter = pythonHighlighter;
            function diffHighlighter() {
                const args = new Map();
                args.set('heading', { pattern: /^(?<range>@@ -\d+,\d+ \+\d+,\d+ @@)(?<heading> .*)?$/gm, reviver({ groups }) {
                        return `<span data-code-token="range">${groups.range}</span>` + (groups.heading ? `<span data-code-token="heading">${groups.heading}</span>` : '');
                    } });
                args.set('insertion', { pattern: /^(?<text>\+.*)$/gm, reviver({ groups }) {
                        return `<span data-code-token="insertion"><ins>${groups.text}</ins></span>`;
                    } });
                args.set('deletion', { pattern: /^(?<text>-.*)$/gm, reviver({ groups }) {
                        return `<span data-code-token="deletion"><del>${groups.text}</del></span>`;
                    } });
                return args;
            }
            Code.diffHighlighter = diffHighlighter;
            function javaHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                args.set('multiline-string', { pattern: /(?<text>(?<what>(?<qtype>&quot;){3})(?:[^\uffff\ufffe]*?[^\\])?(?:\\\\)*\k<what>)/g, reviver: ({ groups }) => wrapMultiline('<span data-code-token="string">', groups.text, '</span>') });
                matchToken('string', /(?<text>&#x27;&#x27;|&quot;&quot;|(?:(?<what>&quot;|&#x27;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>))/g);
                args.set('comment', { pattern: /(?<text>(?:\/\/.*)|(?:\/\*[\s\S]*?\*\/))/g, reviver({ groups }, decode) {
                        return wrapMultiline('<span data-code-token="comment">', decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, ''), '</span>');
                    } });
                const keywords = ['abstract', 'continue', 'for', 'new', 'switch', 'assert', 'default', 'goto', 'package', 'synchronized', 'boolean', 'do', 'if', 'private', 'this', 'break', 'double', 'implements', 'protected', 'throw', 'byte', 'else', 'import', 'public', 'throws', 'case', 'enum', 'instanceof', 'return', 'transient', 'catch', 'extends', 'int', 'short', 'try', 'char', 'final', 'interface', 'static', 'void', 'class', 'finally', 'long', 'strictfp', 'volatile', 'const', 'float', 'native', 'super', 'while', 'try', 'false', 'null', 'var'];
                matchToken('number', /(?<text>\b(?:0(?:x[0-9a-f][0-9a-f_]*|b[01][01_]*)(?<!_)|\d[\d_]*\.?[\d_]*((?<=[\d.])e[+\-]?\d[\d_]*)?[dfl]?(?<!_))\b)/gi);
                matchToken('keyword', new RegExp(String.raw `(?<text>\b(?:${keywords.join('|')})\b)`, 'g'));
                matchToken('annotation', /(?<text>@[a-zA-Z_$][a-zA-Z_$0-9]*)\b/g);
                return args;
            }
            Code.javaHighlighter = javaHighlighter;
            function cppHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                args.set('compiler-directive', { pattern: /(?<directive>(?<!&)#\s*?[a-z]+)(?<text>(?:\\\n|[^\n])*?(?:\n|$))/g, reviver({ groups }) {
                        return `<span data-code-token="compiler-directive">${groups.directive}<span data-code-token="compiler-directive-value">${groups.text}</span></span>`;
                    } });
                args.set('multiline-string', { pattern: /(?<text>R&quot;(?<what>[^\uffff\ufffe]{0,16}?)\([^\uffff\ufffe]*?\)\k<what>&quot;)/g, reviver: ({ groups }) => wrapMultiline('<span data-code-token="string">', groups.text, '</span>') });
                matchToken('string', /(?<text>(?:L|u8|u|U)?(?:&#x27;&#x27;|&quot;&quot;|(?:(?<what>&quot;|&#x27;)(?:.*?[^\\\n])?(?:\\\\)*\k<what>)))/g);
                args.set('comment', { pattern: /(?<text>(?:\/\/.*)|(?:\/\*[\s\S]*?\*\/))/g, reviver({ groups }, decode) {
                        return wrapMultiline('<span data-code-token="comment">', decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, ''), '</span>');
                    } });
                const keywords = ['alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit', 'atomic_noexcept', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit', 'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'synchronized', 'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq', 'final', 'override', 'transaction_safe', 'transaction_safe_dynamic', 'import', 'module', '_Pragma', 'NULL'];
                matchToken('number', /(?<text>\b(?:0(?:x[0-9a-f](?:[0-9a-f]|&#x27;)*|b[01](?:[01]|&#x27;)*)(?<!&#x27;)|\d(?:\d|&#x27;)*\.?(?:\d|&#x27;)*((?<=[\d.])e[+\-]?\d(?:\d|&#x27;)*)?[fulz]{0,3}(?<!&#x27;))\b)/gi);
                matchToken('keyword', new RegExp(String.raw `(?<text>\b(?:${keywords.join('|')})\b)`, 'g'));
                return args;
            }
            Code.cppHighlighter = cppHighlighter;
            function bashHighlighter() {
                const args = new Map(), matchToken = (name, pattern) => appendTokenMatcher(name, pattern, args);
                args.set('multiline-string', { pattern: /(?<text>&#x27;&#x27;|(?:(?<what>&#x27;)(?:[^\uffff\ufffe]*?[^\\])?(?:\\\\)*\k<what>))/g, reviver: ({ groups }) => wrapMultiline('<span data-code-token="string">', groups.text, '</span>') });
                matchToken('string', /(?<text>(?<what>&quot;))/g);
                args.set('comment', { pattern: /(?<text>(?:(?<!&)#.*))/g, reviver({ groups }, decode) {
                        return `<span data-code-token="comment">${decode(groups.text).replace(/<span data-code-token="string">|<\/span>/g, '')}</span>`;
                    } });
                const keywords = ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'select', 'while', 'until', 'do', 'done', 'in', 'function', 'time', '{', '}', '!', '[[', ']]', 'coproc'];
                matchToken('number', /(?<text>(?<!\$)\b\d+\b)/g);
                matchToken('keyword', new RegExp(String.raw `(?<text>\b(?:${keywords.map(escapeRegex).join('|')})\b)`, 'g'));
                return args;
            }
            Code.bashHighlighter = bashHighlighter;
        })(Code = Configuration.Code || (Configuration.Code = {}));
    })(Configuration || (Configuration = {}));
    function parseUnicodeMarkup(text, customTokens) {
        return abstractParse(normalize(text), Configuration.unicodeMarkup(customTokens), 'disable sanitizer');
    }
    SHML.parseUnicodeMarkup = parseUnicodeMarkup;
    function escapeRegex(text) {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    function unescapeHTMLEntities(text) {
        return text.replace(/&lt;|&gt;|&amp;|&quot;|&#x27;/g, (match) => {
            switch (match) {
                case '&lt;': return '<';
                case '&gt;': return '>';
                case '&amp;': return '&';
                case '&quot;': return '"';
                case '&#x27;': return '\'';
                default: throw null;
            }
        });
    }
    function escapeHTMLEntities(text) {
        return text.replace(/[<>&"']/g, (match) => {
            switch (match) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case '\'': return '&#x27;';
                default: throw null;
            }
        });
    }
    function parseInlineMarkup(text, customTokens) {
        return abstractParse(normalize(text), Configuration.inlineMarkup(customTokens));
    }
    SHML.parseInlineMarkup = parseInlineMarkup;
    function parseMarkup(text, customTokens, properties) {
        var _a;
        const props = new Map(((_a = properties === null || properties === void 0 ? void 0 : properties.entries()) !== null && _a !== void 0 ? _a : [])), ids = new Set();
        const result = new String(abstractParse(normalize(text), Configuration.blockMarkup(customTokens, props, ids)));
        Object.defineProperty(result, 'properties', { value: props });
        Object.defineProperty(result, 'ids', { value: ids });
        return result;
    }
    SHML.parseMarkup = parseMarkup;
    function parseCode(text, language = 'none', markLines = true, lineOffset = 1) {
        text = normalize(text);
        if (language !== 'none') {
            const args = (function () {
                switch (language) {
                    case 'html': return Configuration.Code.htmlHighlighter();
                    case 'css': return Configuration.Code.cssHighlighter();
                    case 'js':
                    case 'javascript':
                        language = 'javascript';
                        return Configuration.Code.javascriptHighlighter();
                    case 'ts':
                    case 'typescript':
                        language = 'typescript';
                        return Configuration.Code.typescriptHighlighter();
                    case 'xml': return Configuration.Code.xmlHighlighter();
                    case 'json': return Configuration.Code.jsonHighlighter();
                    case 'py':
                    case 'python':
                        language = 'python';
                        return Configuration.Code.pythonHighlighter();
                    case 'diff': return Configuration.Code.diffHighlighter();
                    case 'c':
                    case 'c++':
                    case 'cpp':
                        language = 'c++';
                        return Configuration.Code.cppHighlighter();
                    case 'sh':
                    case 'shell':
                    case 'bash':
                        language = 'bash';
                        return Configuration.Code.bashHighlighter();
                    case 'java': return Configuration.Code.javaHighlighter();
                    default: return new Map();
                }
            })();
            text = abstractParse(text, args);
        }
        if (markLines)
            text = text.split('\n').map((line, i) => `<span data-code-token="line-number">${(i + lineOffset).toString().padStart((text.split('\n').length + lineOffset).toString().length, ' ')}</span><span data-code-token="line" data-code-line="${i + lineOffset}">${line}</span>`).join('\n');
        return `<span data-code-language="${language}">${text}</span>`;
    }
    SHML.parseCode = parseCode;
    function normalize(text) {
        return text.replace(/\r(?=\n)/g, '');
    }
})(SHML || (SHML = {}));
// === DOM Utils === //
/*
 * MIT License
 *
 * Copyright (c) 2022 S. Beeblebrox
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
var DomLib;
(function (DomLib) {
    // internal const options
    const options = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'), { href: document.currentScript.getAttribute('src') }).search).entries()].map(([key, value]) => [key, value === 'false' ? false : value])) : { debug: true });
    // internal function interpolate
    function interpolate(strings, ...values) {
        return values.reduce((acc, cur, i) => acc + cur + strings[i + 1], strings[0]);
    }
    // export const VERSION
    DomLib.VERSION = Object.freeze({
        toString() { return `${DomLib.VERSION.major}.${DomLib.VERSION.minor}.${DomLib.VERSION.patch}${DomLib.VERSION.prerelease !== undefined ? `-${DomLib.VERSION.prerelease}` : ''}${DomLib.VERSION.metadata !== undefined ? `+${DomLib.VERSION.metadata}` : ''}`; },
        major: 2, minor: 2, patch: 2
    });
    // internal let _lastQueryValue
    let _lastQueryValue = undefined;
    // export const $it
    DomLib.$it = undefined;
    {
        Object.defineProperty(DomLib, '$it', { enumerable: true, configurable: !!options.debug, get() { return _lastQueryValue; } });
    }
    // internal let _lastQueryAllValue
    let _lastQueryAllValue = undefined;
    // export const $$it
    DomLib.$$it = undefined;
    {
        Object.defineProperty(DomLib, '$$it', { enumerable: true, configurable: !!options.debug, get() { return _lastQueryAllValue; } });
    }
    // internal let _lastQueryAllValue
    let _lastQueryXValue = undefined;
    // export const $$it
    DomLib.$xit = undefined;
    {
        Object.defineProperty(DomLib, '$xit', { enumerable: true, configurable: !!options.debug, get() { return _lastQueryXValue; } });
    }
    // internal function closestDeep
    function closestDeep(selector, target) {
        var _a, _b, _c;
        let root;
        return (_b = (_a = target.closest) === null || _a === void 0 ? void 0 : _a.call(target, selector)) !== null && _b !== void 0 ? _b : ((root = target.getRootNode()).host
            ? closestDeep(selector, root.host)
            : ((_c = root.defaultView) === null || _c === void 0 ? void 0 : _c.frameElement)
                ? closestDeep(selector, root.defaultView.frameElement)
                : null);
    }
    // export const $
    DomLib.$ = (function () {
        function $(selector, target = document) {
            var _a, _b, _c;
            if (isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1));
                target = document;
            }
            let { deep, count, cssSelector } = selector.match(/^(?<deep>%)?(?:\^(?<count>\d*))? ?(?<cssSelector>[\s\S]*)$/).groups;
            if (count !== undefined) {
                if ((count = +(count || '1')) === NaN || !(target instanceof Element))
                    return null;
                let element = target;
                for (let i = 0; i < count; i++) {
                    if (!(element === null || element === void 0 ? void 0 : element.parentElement)) {
                        break;
                    }
                    else if (deep) {
                        element = closestDeep(cssSelector || ':scope', element === null || element === void 0 ? void 0 : element.parentElement);
                    }
                    else {
                        element = (_c = (_b = (_a = element === null || element === void 0 ? void 0 : element.parentElement) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, cssSelector || ':scope')) !== null && _c !== void 0 ? _c : null;
                    }
                }
                return _lastQueryValue = element;
            }
            else if (deep) {
                return _lastQueryValue = querySelectorDeep(cssSelector, target);
            }
            else {
                return _lastQueryValue = target.querySelector(cssSelector);
            }
        }
        return $;
    })();
    // internal function isTemplateStringsArray
    function isTemplateStringsArray(arg) {
        return Array.isArray(arg);
    }
    // define $self on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$self', {
            enumerable: false, configurable: !!options.debug,
            value: function (selector) {
                if (isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return DomLib.$(selector, this);
            }
        });
    // internal function querySelectorAllDeep
    function querySelectorAllDeep(selector, root = document) {
        var _a;
        const elements = [];
        if (root.childElementCount) {
            const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            let node;
            while (node = tw.nextNode()) {
                if (node instanceof Element && node.matches(selector))
                    elements.push(node);
                if (node instanceof Element && node.shadowRoot) {
                    elements.push(...querySelectorAllDeep(selector, node.shadowRoot));
                }
                else if (node instanceof HTMLIFrameElement && node.contentWindow) {
                    elements.push(...querySelectorAllDeep(selector, node.contentWindow.document));
                }
            }
        }
        else if (root instanceof HTMLIFrameElement && ((_a = root.contentWindow) === null || _a === void 0 ? void 0 : _a.document)) {
            elements.push(...querySelectorAllDeep(selector, root.contentWindow.document));
        }
        else if (root instanceof Element && root.shadowRoot) {
            elements.push(...querySelectorAllDeep(selector, root.shadowRoot));
        }
        return elements;
    }
    function querySelectorDeep(selector, root = document) {
        var _a;
        let temp;
        if (root.childElementCount) {
            const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            let node;
            while (node = tw.nextNode()) {
                if (node instanceof Element && node.matches(selector))
                    return node;
                if (node instanceof Element && node.shadowRoot) {
                    if (temp = querySelectorDeep(selector, node.shadowRoot))
                        return temp;
                }
                else if (node instanceof HTMLIFrameElement && node.contentWindow) {
                    if (temp = querySelectorDeep(selector, node.contentWindow.document))
                        return temp;
                }
            }
        }
        else if (root instanceof HTMLIFrameElement && ((_a = root.contentWindow) === null || _a === void 0 ? void 0 : _a.document)) {
            if (temp = querySelectorDeep(selector, root.contentWindow.document))
                return temp;
        }
        else if (root instanceof Element && root.shadowRoot) {
            if (temp = querySelectorDeep(selector, root.shadowRoot))
                return temp;
        }
        return null;
    }
    // export const $$
    DomLib.$$ = (function () {
        function $$(selector, target = document) {
            if (isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1));
                target = document;
            }
            let { deep, cssSelector } = selector.match(/^(?<deep>%)? ?(?<cssSelector>[\s\S]*)$/).groups;
            if (deep !== undefined) {
                return _lastQueryAllValue = ArrayProxy(querySelectorAllDeep(cssSelector, target));
            }
            else {
                return (_lastQueryAllValue = ArrayProxy(target.querySelectorAll(cssSelector)));
            }
        }
        return $$;
    })();
    // define $$self on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$$self', {
            enumerable: false, configurable: !!options.debug,
            value: function (selector) {
                if (isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return DomLib.$$(selector, this);
            }
        });
    // export const $x
    DomLib.$x = (function () {
        function $x(query, target = document) {
            if (isTemplateStringsArray(query)) {
                query = interpolate(query, ...[...arguments].slice(1));
                target = document;
            }
            const result = document.evaluate(query, target, null, XPathResult.ANY_TYPE, null);
            try {
                switch (result.resultType) {
                    case 1:
                        return result.numberValue;
                    case 2:
                        return result.stringValue;
                    case 3:
                        return result.booleanValue;
                    case 4:
                    case 5: {
                        let node, nodes = [];
                        while (node = result.iterateNext())
                            nodes.push(node);
                        return ArrayProxy(nodes);
                    }
                    case 6:
                    case 7: {
                        return ArrayProxy(Array.apply(null, { length: result.snapshotLength }).map((_, i) => result.snapshotItem(i)));
                    }
                    case 8:
                    case 9:
                        return result.singleNodeValue;
                    default:
                        return null;
                }
            }
            catch (error) {
                return null;
            }
        }
        return $x;
    })();
    // define $xself on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$xself', {
            enumerable: false, configurable: !!options.debug,
            value: function (query) {
                if (isTemplateStringsArray(query)) {
                    query = interpolate(query, ...[...arguments].slice(1));
                }
                return DomLib.$x(query, this);
            }
        });
    // internal function ArrayProxy
    function ArrayProxy(items) {
        return new Proxy([...items], {
            set(target, property, value) {
                if (typeof property === 'symbol')
                    return Reflect.set(target, property, value);
                else if (property.startsWith('$'))
                    return Reflect.set(target, property.substring(1), value);
                else
                    return target.every(item => Reflect.set(item, property, value instanceof Box ? value.value() : value));
            },
            get(target, property, reciever) {
                if (typeof property === 'symbol') {
                    const array = [...target], value = Reflect.get(array, property);
                    return typeof value === 'function' ? value.bind(array) : value;
                }
                else if (property === '$toArray')
                    return function $toArray() { return [...target]; };
                else if (property === '$any')
                    return target.length > 0;
                else if (property.startsWith('$')) {
                    const value = Reflect.get([...target], property.substring(1));
                    if (typeof value === 'function')
                        return function () {
                            const result = value.bind([...target])(...arguments);
                            return Array.isArray(result) ? ArrayProxy(result) : result;
                        };
                    else
                        return Array.isArray(value) ? ArrayProxy(value) : value;
                }
                else if (target.length <= 0)
                    return undefined;
                else if (target.some(item => typeof Reflect.get(item, property) === 'function'))
                    return function () {
                        return ArrayProxy(target.map((item) => {
                            const value = Reflect.get(item, property);
                            return typeof value === 'function' ? value.bind(item)(...[...arguments].map(argument => argument instanceof Box ? argument.value() : argument)) : value;
                        }));
                    };
                else
                    return ArrayProxy(target.map(item => Reflect.get(item, property)));
            },
            deleteProperty(target, property) {
                if (typeof property === 'symbol')
                    return Reflect.deleteProperty(target, property);
                else if (/^\$\d+/.test(property))
                    return Reflect.deleteProperty(target, property.substring(1));
                else if (!property.startsWith('$'))
                    return target.every(item => Reflect.deleteProperty(item, property));
                else
                    return false;
            },
            has(target, property) {
                if (typeof property === 'symbol')
                    return Reflect.has(target, property);
                else if (/^\$\d+/.test(property))
                    return Reflect.has(target, property.substring(1));
                else if (!property.startsWith('$'))
                    return target.every(item => Reflect.has(item, property));
                else
                    return false;
            }
        });
    }
    // internal function ChildNodeArray
    function ChildNodeArray(element) {
        const getChildren = () => [...element.childNodes].filter(n => { var _a, _b; return !(n instanceof Text) || n.wholeText.trim() !== '' || n.parentElement instanceof HTMLPreElement || ((_b = (_a = n.parentElement) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, 'pre')); });
        const mutators = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
        return new Proxy([...element.childNodes], {
            get(target, property) {
                if (mutators.includes(property)) {
                    return function () {
                        const children = getChildren();
                        try {
                            return children[property](...arguments);
                        }
                        finally {
                            element.replaceChildren(...children);
                        }
                    };
                }
                else {
                    return target[property];
                }
            },
            set(target, property, value, reciever) {
                if (+property > -1) {
                    if (value instanceof Node) {
                        const children = getChildren();
                        children[+property] = value;
                        element.replaceChildren(...children);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return Reflect.set(target, property, value, reciever);
                }
            }
        });
    }
    // define $children on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$children', {
            enumerable: false, configurable: !!options.debug,
            get() {
                return ChildNodeArray(this);
            },
            set(value) {
                return this.replaceChildren(...value);
            }
        });
    // export const HTMLNode
    DomLib.HTMLNode = function HTMLNode(type, data, ...children) {
        const element = document.createElement(type);
        if (typeof data === 'string') {
            element.textContent = data;
        }
        else {
            if (!(data instanceof Map))
                data = new Map(Object.entries(data !== null && data !== void 0 ? data : {}));
            for (const [key, value] of data.entries()) {
                if (key === 'children' && Array.isArray(value))
                    element.replaceChildren(...element.childNodes, ...value);
                else if (key === 'style' && typeof value === 'object')
                    for (const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                        Reflect.set(element.style, property, style);
                else if (key === 'classList' || key === 'classlist' && Array.isArray(value))
                    element.classList.add(...value);
                else if (key in element)
                    Reflect.set(element, key, value);
                else
                    element.setAttribute(key, value);
            }
            if (children.length)
                element.replaceChildren(...element.childNodes, ...children);
        }
        return element;
    };
    // export alias HtmlNode for HTMLNode
    DomLib.HtmlNode = DomLib.HTMLNode;
    // export const SVGNode
    DomLib.SVGNode = function SVGNode(type, data, ...children) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', type);
        if (type === 'svg')
            element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        if (!(data instanceof Map))
            data = new Map(Object.entries(data !== null && data !== void 0 ? data : {}));
        for (const [key, value] of data.entries()) {
            if (key === 'children' && Array.isArray(value))
                element.replaceChildren(...element.childNodes, ...value);
            else if (key === 'style' && typeof value === 'object')
                for (const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                    Reflect.set(element.style, property, style);
            else if (key === 'classList' || key === 'classlist' && Array.isArray(value))
                element.classList.add(...value);
            else if (key in element && typeof value === 'function')
                Reflect.set(element, key, value);
            else
                element.setAttribute(key, value);
        }
        if (children.length)
            element.replaceChildren(...element.childNodes, ...children);
        return element;
    };
    // export alias SvgNode for SVGNode
    DomLib.SvgNode = DomLib.SVGNode;
    //TODO export const SVGNode
    DomLib.MATHMLNode = function MATHMLNode(type, data, ...children) { throw 'MathML node has not been implemented yet.'; };
    // export alias MathMlNode for MATHMLNode
    DomLib.MathMlNode = DomLib.MATHMLNode;
    // export const TextNode
    DomLib.TextNode = function TextNode(content = '') {
        return document.createTextNode(content);
    };
    // export const CommentNode
    DomLib.CommentNode = function CommentNode(content = '') {
        return document.createComment(content);
    };
    // export const $host
    // define $host on ShadowRoot, Element, Document, DocumentFragment
    DomLib.$host = undefined;
    {
        Object.defineProperty(DomLib, '$host', { get() { var _a, _b; return (_b = (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.parentElement) !== null && _b !== void 0 ? _b : null; } });
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$host', { enumerable: false, configurable: !!options.debug, get() { return this; } }));
    }
    // export const $last
    DomLib.$last = undefined;
    {
        let _lastAddedElement = undefined;
        const observer = new MutationObserver(mutations => mutations.forEach(mutation => { const node = [...mutation.addedNodes].pop(); if (node instanceof HTMLElement && !(node instanceof HTMLScriptElement))
            _lastAddedElement = node; }));
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener('load', () => { observer.disconnect(); _lastAddedElement = null; });
        Object.defineProperty(DomLib, '$last', { enumerable: true, configurable: !!options.debug, get() { return _lastAddedElement; } });
    }
    // export const $ctx
    // define $ctx on ShadowRoot, Element, Document, DocumentFragment
    DomLib.$ctx = undefined;
    {
        Object.defineProperty(DomLib, '$ctx', {
            get() {
                return document.currentScript;
            },
            set(other) {
                var _a, _b;
                (_b = (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.replaceWith) === null || _b === void 0 ? void 0 : _b.call(_a, other);
            }
        });
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$ctx', { enumerable: false, configurable: !!options.debug, get() { return this; }, set(other) { this.replaceWith(other); } }));
    }
    // internal class Box
    class Box {
        constructor(value) {
            this.value = value;
        }
        ;
        get [Symbol.toStringTag]() {
            return 'Box';
        }
    }
    // export class BoxedNode
    class BoxedNode extends Box {
        constructor(node) { super(() => node.cloneNode(true)); }
    }
    DomLib.BoxedNode = BoxedNode;
    // define $on on EventTarget
    Object.defineProperty(EventTarget.prototype, '$on', {
        value(type, callback, options) {
            this.addEventListener(type, callback, options);
            return { detach: () => this.removeEventListener(type, callback, options) };
        }, enumerable: false, configurable: !!options.debug
    });
    // Binding Control
    if (document.currentScript) {
        if ('bind' in options) {
            const target = Reflect.get(globalThis, (options.bind || 'globalThis').toString());
            bind(target);
        }
    }
    function bind(target) {
        Object.getOwnPropertyNames(DomLib).forEach(function (key) {
            if (key !== 'VERSION')
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(DomLib, key));
        });
    }
    DomLib.bind = bind;
})(DomLib || (DomLib = {}));
var JSX;
(function (JSX) {
    class StateBase {
        constructor() {
            this.callbacks = [];
        }
        connectCallback(callback) {
            this.callbacks.push(callback);
            callback(this.get());
        }
        disconnectCallback(callback) {
            this.callbacks.splice(this.callbacks.indexOf(callback), 1);
        }
        connectWeakCallback(weakCaptures, weakCallback) {
            const weakrefs = weakCaptures.map(o => new WeakRef(o)), state = this;
            state.connectCallback(function callback(t) {
                const refs = weakrefs.map(o => o.deref());
                if (refs.some(o => o === undefined))
                    state.disconnectCallback(callback);
                else
                    weakCallback(t, ...refs);
            });
        }
        update() {
            this.callbacks.forEach((f) => {
                f(this.get());
            });
        }
    }
    class State extends StateBase {
        constructor(value) {
            super();
            this.value = value;
        }
        get() {
            return this.value;
        }
        set(t) {
            this.value = t;
            this.update();
            return this.value;
        }
        consume(f) {
            const state = this;
            return function (...args) {
                state.set(f.bind(this)(...args));
            };
        }
        format(formatter) {
            const stateFormatter = new StateFormatter(this, formatter);
            this.connectCallback(stateFormatter.update.bind(stateFormatter));
            return stateFormatter;
        }
    }
    JSX.State = State;
    class StateFormatter extends StateBase {
        constructor(state, formatter) {
            super();
            this.state = state;
            this.formatter = formatter;
        }
        set(t) {
            return this.state.set(t);
        }
        get() {
            return this.formatter(this.state.get());
        }
        consume(f) {
            return this.state.consume(f);
        }
    }
    JSX.createState = function createState(t) {
        return new State(t);
    };
    JSX.createElement = (function () {
        function createElement(tag, properties, ...children) {
            if (typeof tag === 'function')
                return tag(properties, ...children.map(o => o instanceof HTMLCollection ? [...o] : o).flat());
            const element = (function () {
                switch (tag) {
                    case null: return document.createDocumentFragment();
                    case 'svg': return document.createElementNS('http://www.w3.org/2000/svg', tag);
                    case 'math': return document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
                    default: return document.createElement(tag);
                }
            })();
            if (element instanceof Element) {
                if (tag === 'svg')
                    element.setAttribute('xmlsn', 'http://www.w3.org/2000/svg');
                else if (tag === 'math')
                    element.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
                const prototype = Object.getPrototypeOf(element);
                for (const [key, value] of Object.entries(properties !== null && properties !== void 0 ? properties : {})) {
                    if (key === 'style' && typeof value === 'object' && key in prototype)
                        for (const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                            Reflect.set(Reflect.get(element, key), property, style);
                    else if ((key === 'classList' || key === 'classlist' && key in prototype) || key === 'class' && Array.isArray(value))
                        element.classList.add(...value);
                    else if (key in prototype && value instanceof StateBase)
                        value.connectWeakCallback([element], (t, element) => Reflect.set(element, key, t));
                    else if (key in prototype)
                        Reflect.set(element, key, value);
                    else if (value instanceof StateBase)
                        value.connectWeakCallback([element], (t, element) => element.setAttribute(key, t));
                    else
                        element.setAttribute(key, value);
                }
            }
            for (let child of children.flat()) {
                if (child instanceof HTMLCollection) {
                    element.append(...child);
                    continue;
                }
                if (child instanceof StateBase) {
                    const text = document.createTextNode('');
                    child.connectWeakCallback([text], (t, text) => text.textContent = t);
                    child = text;
                }
                element.append(child);
            }
            return element;
        }
        return createElement;
    })();
})(JSX || (JSX = {}));
/*
 * MIT License
 *
 * Copyright (c) 2023 S. Beeblebrox
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
(function () {
    const __attachShadow__ = Element.prototype.attachShadow, shadowRoots = [];
    let globalAdoptedStyleSheets = [];
    Element.prototype.attachShadow = function attachShadow(...args) {
        const rValue = __attachShadow__.bind(this)(...args);
        shadowRoots.push(this.shadowRoot);
        this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, ...globalAdoptedStyleSheets];
        return rValue;
    };
    Object.defineProperty(document, 'kitsuneGlobalAdoptedStyleSheets', {
        get() {
            return globalAdoptedStyleSheets;
        },
        set(value) {
            globalAdoptedStyleSheets = [...value];
            for (const d of [document, ...shadowRoots])
                d.adoptedStyleSheets = [...new Set([...d.adoptedStyleSheets, ...globalAdoptedStyleSheets])];
        }
    });
    Object.defineProperty(document, 'kitsuneShadowRoots', {
        get() {
            return shadowRoots;
        }
    });
    Object.defineProperty(document, 'kitsunedom', {
        value: true
    });
})();
var ElementFactory;
(function (ElementFactory) {
    function define(name, { attributes = new Map(), render, connect, on, stylesheet, properties = Object.create(null) } = {}) {
        var _attributes, _observer, _a;
        window.customElements.define(`${name}`, (_a = class extends HTMLElement {
                constructor() {
                    var _a;
                    super();
                    _attributes.set(this, void 0);
                    _observer.set(this, void 0);
                    __classPrivateFieldSet(this, _attributes, new Map(attributes.entries()), "f");
                    const _render = () => {
                        var _a;
                        __classPrivateFieldGet(this, _observer, "f").disconnect();
                        (_a = render === null || render === void 0 ? void 0 : render.bind(this)) === null || _a === void 0 ? void 0 : _a();
                        window.requestAnimationFrame(() => __classPrivateFieldGet(this, _observer, "f").observe(this, { attributes: true, childList: true, subtree: true, characterData: true }));
                    };
                    __classPrivateFieldSet(this, _observer, new MutationObserver(render ? _render : function () { }), "f");
                    for (const [key, defaultValue] of __classPrivateFieldGet(this, _attributes, "f").entries()) {
                        Object.defineProperty(this, key, {
                            get() {
                                return __classPrivateFieldGet(this, _attributes, "f").get(key);
                            },
                            set(newValue) {
                                if (!newValue && typeof defaultValue === 'boolean')
                                    this.removeAttribute(key);
                                else
                                    this.setAttribute(key, newValue);
                                if (render)
                                    window.requestAnimationFrame(_render.bind(this));
                                return __classPrivateFieldGet(this, _attributes, "f").set(key, newValue).get(key);
                            }
                        });
                    }
                    for (const [event, listener] of (_a = on === null || on === void 0 ? void 0 : on.entries()) !== null && _a !== void 0 ? _a : []) {
                        this.addEventListener(event, e => listener(e));
                    }
                    if (stylesheet) {
                        const prop = 'kitsunedom' in document ? 'kitsuneGlobalAdoptedStyleSheets' : 'adoptedStyleSheets';
                        const sheet = new CSSStyleSheet();
                        sheet.replaceSync(stylesheet);
                        document[prop] = [...document[prop], sheet];
                    }
                    Object.assign(this, properties);
                }
                attributeChangedCallback(name, oldValue, newValue) {
                    if (oldValue === newValue)
                        return;
                    __classPrivateFieldGet(this, _attributes, "f").set(name, typeof attributes.get(name) === 'boolean' ? !!newValue : newValue);
                }
                connectedCallback() {
                    for (const attribute of __classPrivateFieldGet(this, _attributes, "f").keys())
                        if (this.hasAttribute(attribute))
                            __classPrivateFieldGet(this, _attributes, "f").set(attribute, this.getAttribute(attribute));
                    if (render) {
                        __classPrivateFieldGet(this, _observer, "f").observe(this, { attributes: true, childList: true, subtree: true, characterData: true });
                        window.requestAnimationFrame(() => {
                            var _a;
                            __classPrivateFieldGet(this, _observer, "f").disconnect();
                            (_a = render === null || render === void 0 ? void 0 : render.bind(this)) === null || _a === void 0 ? void 0 : _a();
                            window.requestAnimationFrame(() => __classPrivateFieldGet(this, _observer, "f").observe(this, { attributes: true, childList: true, subtree: true, characterData: true }));
                        });
                    }
                    if (connect)
                        window.requestAnimationFrame(connect.bind(this));
                }
                disconnectedCallback() {
                    if (!render)
                        return;
                    __classPrivateFieldGet(this, _observer, "f").disconnect();
                }
                static get observedAttributes() {
                    return [...attributes.keys()];
                }
            },
            _attributes = new WeakMap(),
            _observer = new WeakMap(),
            _a));
        return window.customElements.get(name);
    }
    ElementFactory.define = define;
})(ElementFactory || (ElementFactory = {}));
var Elements;
(function (Elements) {
    function Shadow(_, ...children) {
        const element = JSX.createElement('span');
        element.attachShadow({ mode: 'open' });
        element.shadowRoot.replaceChildren(...children);
        return element;
    }
    Elements.Shadow = Shadow;
})(Elements || (Elements = {}));
/**
 * dom-to-image
 * (C) 2015 Anatolii Saienko & 2012 Paul Bakaus MIT Licence
 * Adapted for TypeScript
 * https://github.com/tsayen/dom-to-image/blob/master/LICENSE
 */
var HTMLRasterizer;
(function (HTMLRasterizer) {
    let Util;
    (function (Util) {
        Util.mimes = (function () {
            /*
             * Only WOFF and EOT mime types for fonts are 'real'
             * see http://www.iana.org/assignments/media-types/media-types.xhtml
             */
            const WOFF = 'application/font-woff';
            const JPEG = 'image/jpeg';
            return {
                'woff': WOFF,
                'woff2': WOFF,
                'ttf': 'application/font-truetype',
                'eot': 'application/vnd.ms-fontobject',
                'png': 'image/png',
                'jpg': JPEG,
                'jpeg': JPEG,
                'gif': 'image/gif',
                'tiff': 'image/tiff',
                'svg': 'image/svg+xml'
            };
        })();
        function parseExtension(url) {
            const match = /\.([^\.\/]*?)$/g.exec(url);
            if (match)
                return match[1];
            else
                return '';
        }
        Util.parseExtension = parseExtension;
        function mimeType(url) {
            const extension = parseExtension(url).toLowerCase();
            return Util.mimes[extension] || '';
        }
        Util.mimeType = mimeType;
        function isDataUrl(url) {
            return url.search(/^(data:)/) !== -1;
        }
        Util.isDataUrl = isDataUrl;
        function toBlob(canvas) {
            return new Promise(function (resolve) {
                const binaryString = window.atob(canvas.toDataURL().split(',')[1]);
                const length = binaryString.length;
                const binaryArray = new Uint8Array(length);
                for (let i = 0; i < length; i++)
                    binaryArray[i] = binaryString.charCodeAt(i);
                resolve(new Blob([binaryArray], {
                    type: 'image/png'
                }));
            });
        }
        Util.toBlob = toBlob;
        function canvasToBlob(canvas) {
            if (canvas.toBlob)
                return new Promise(function (resolve) {
                    canvas.toBlob(resolve);
                });
            return toBlob(canvas);
        }
        Util.canvasToBlob = canvasToBlob;
        function resolveUrl(url, baseUrl) {
            const doc = document.implementation.createHTMLDocument();
            const base = doc.createElement('base');
            doc.head.appendChild(base);
            const a = doc.createElement('a');
            doc.body.appendChild(a);
            base.href = baseUrl;
            a.href = url;
            return a.href;
        }
        Util.resolveUrl = resolveUrl;
        Util.uid = (function uid() {
            var index = 0;
            return function () {
                return 'u' + fourRandomChars() + index++;
                function fourRandomChars() {
                    /* see http://stackoverflow.com/a/6248722/2519373 */
                    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
                }
            };
        })();
        function makeImage(uri) {
            return new Promise(function (resolve, reject) {
                const image = new Image();
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = reject;
                image.src = uri;
            });
        }
        Util.makeImage = makeImage;
        function getAndEncode(url) {
            const TIMEOUT = 30000;
            if (HTMLRasterizer.impl.options.cacheBust) {
                // Cache bypass so we dont have CORS issues with cached images
                // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
                url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
            }
            return new Promise(function (resolve) {
                const request = new XMLHttpRequest();
                request.onreadystatechange = done;
                request.ontimeout = timeout;
                request.responseType = 'blob';
                request.timeout = TIMEOUT;
                request.open('GET', url, true);
                request.send();
                let placeholder;
                if (HTMLRasterizer.impl.options.imagePlaceholder) {
                    const split = HTMLRasterizer.impl.options.imagePlaceholder.split(/,/);
                    if (split && split[1]) {
                        placeholder = split[1];
                    }
                }
                function done() {
                    if (request.readyState !== 4)
                        return;
                    if (request.status !== 200) {
                        if (placeholder) {
                            resolve(placeholder);
                        }
                        else {
                            fail('cannot fetch resource: ' + url + ', status: ' + request.status);
                        }
                        return;
                    }
                    const encoder = new FileReader();
                    encoder.onloadend = function () {
                        const content = encoder.result.split(/,/)[1];
                        resolve(content);
                    };
                    encoder.readAsDataURL(request.response);
                }
                function timeout() {
                    if (placeholder) {
                        resolve(placeholder);
                    }
                    else {
                        fail('timeout of ' + TIMEOUT + 'ms occured while fetching resource: ' + url);
                    }
                }
                function fail(message) {
                    console.error(message);
                    resolve('');
                }
            });
        }
        Util.getAndEncode = getAndEncode;
        function dataAsUrl(content, type) {
            return 'data:' + type + ';base64,' + content;
        }
        Util.dataAsUrl = dataAsUrl;
        function escape(string) {
            return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
        }
        Util.escape = escape;
        function delay(ms) {
            return function (arg) {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(arg);
                    }, ms);
                });
            };
        }
        Util.delay = delay;
        function asArray(arrayLike) {
            const array = [];
            const length = arrayLike.length;
            for (let i = 0; i < length; i++)
                array.push(arrayLike[i]);
            return array;
        }
        Util.asArray = asArray;
        function escapeXhtml(string) {
            return string.replace(/#/g, '%23').replace(/\n/g, '%0A');
        }
        Util.escapeXhtml = escapeXhtml;
        function width(node) {
            const leftBorder = px(node, 'border-left-width');
            const rightBorder = px(node, 'border-right-width');
            return node.scrollWidth + leftBorder + rightBorder;
        }
        Util.width = width;
        function height(node) {
            const topBorder = px(node, 'border-top-width');
            const bottomBorder = px(node, 'border-bottom-width');
            return node.scrollHeight + topBorder + bottomBorder;
        }
        Util.height = height;
        function px(node, styleProperty) {
            const value = window.getComputedStyle(node).getPropertyValue(styleProperty);
            return parseFloat(value.replace('px', ''));
        }
        Util.px = px;
    })(Util || (Util = {}));
    let Inliner;
    (function (Inliner) {
        const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
        Inliner.impl = {
            readUrls: readUrls,
            inline: inline
        };
        function shouldProcess(string) {
            return string.search(URL_REGEX) !== -1;
        }
        Inliner.shouldProcess = shouldProcess;
        function readUrls(string) {
            const result = [];
            let match;
            while ((match = URL_REGEX.exec(string)) !== null) {
                result.push(match[1]);
            }
            return result.filter(function (url) {
                return !Util.isDataUrl(url);
            });
        }
        function inline(string, url, baseUrl, get) {
            return Promise.resolve(url)
                .then(function (url) {
                return baseUrl ? Util.resolveUrl(url, baseUrl) : url;
            })
                .then(get || Util.getAndEncode)
                .then(function (data) {
                return Util.dataAsUrl(data, Util.mimeType(url));
            })
                .then(function (dataUrl) {
                return string.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
            });
            function urlAsRegex(url) {
                return new RegExp('(url\\([\'"]?)(' + Util.escape(url) + ')([\'"]?\\))', 'g');
            }
        }
        function inlineAll(string, baseUrl, get) {
            if (nothingToInline())
                return Promise.resolve(string);
            return Promise.resolve(string)
                .then(readUrls)
                .then(function (urls) {
                let done = Promise.resolve(string);
                urls.forEach(function (url) {
                    done = done.then(function (string) {
                        return inline(string, url, baseUrl, get);
                    });
                });
                return done;
            });
            function nothingToInline() {
                return !shouldProcess(string);
            }
        }
        Inliner.inlineAll = inlineAll;
    })(Inliner || (Inliner = {}));
    let Images;
    (function (Images) {
        Images.impl = {
            newImage: newImage
        };
        function newImage(element) {
            return {
                inline: inline
            };
            function inline(get) {
                if (Util.isDataUrl(element.src))
                    return Promise.resolve();
                return Promise.resolve(element.src)
                    .then(get || Util.getAndEncode)
                    .then(function (data) {
                    return Util.dataAsUrl(data, Util.mimeType(element.src));
                })
                    .then(function (dataUrl) {
                    return new Promise(function (resolve, reject) {
                        element.onload = () => resolve();
                        element.onerror = reject;
                        element.src = dataUrl;
                    });
                });
            }
        }
        function inlineAll(node) {
            if (!(node instanceof Element))
                return Promise.resolve(node);
            return inlineBackground(node)
                .then(function () {
                if (node instanceof HTMLImageElement)
                    return newImage(node).inline();
                else
                    return Promise.all(Util.asArray(node.childNodes).map(function (child) {
                        return inlineAll(child);
                    }));
            });
            function inlineBackground(node) {
                const background = node.style.getPropertyValue('background');
                if (!background)
                    return Promise.resolve(node);
                return Inliner.inlineAll(background)
                    .then(function (inlined) {
                    node.style.setProperty('background', inlined, node.style.getPropertyPriority('background'));
                })
                    .then(function () {
                    return node;
                });
            }
        }
        Images.inlineAll = inlineAll;
    })(Images || (Images = {}));
    let FontFaces;
    (function (FontFaces) {
        FontFaces.impl = {
            readAll: readAll
        };
        function resolveAll() {
            return readAll(document)
                .then(function (webFonts) {
                return Promise.all(webFonts.map(function (webFont) {
                    return webFont.resolve();
                }));
            })
                .then(function (cssStrings) {
                return cssStrings.join('\n');
            });
        }
        FontFaces.resolveAll = resolveAll;
        function readAll(document) {
            return Promise.resolve(Util.asArray(document.styleSheets))
                .then(getCssRules)
                .then(selectWebFontRules)
                .then(function (rules) {
                return rules.map(newWebFont);
            });
            function selectWebFontRules(cssRules) {
                return cssRules
                    .filter(function (rule) {
                    return rule.type === CSSRule.FONT_FACE_RULE;
                })
                    .filter(function (rule) {
                    return Inliner.shouldProcess(rule.style.getPropertyValue('src'));
                });
            }
            function getCssRules(styleSheets) {
                const cssRules = [];
                styleSheets.forEach(function (sheet) {
                    try {
                        Util.asArray(sheet.cssRules || []).forEach(rule => cssRules.push(rule));
                    }
                    catch (e) {
                        console.log('Error while reading CSS rules from ' + sheet.href, '' + e);
                    }
                });
                return cssRules;
            }
            function newWebFont(webFontRule) {
                return {
                    resolve: function resolve() {
                        var _a;
                        const baseUrl = (_a = (webFontRule.parentStyleSheet || {}).href) !== null && _a !== void 0 ? _a : undefined;
                        return Inliner.inlineAll(webFontRule.cssText, baseUrl);
                    },
                    src: function () {
                        return webFontRule.style.getPropertyValue('src');
                    }
                };
            }
        }
    })(FontFaces || (FontFaces = {}));
    // Default impl options
    const defaultOptions = {
        // Default is to fail on error, no placeholder
        imagePlaceholder: undefined,
        // Default cache bust is false, it will use the cache
        cacheBust: false
    };
    HTMLRasterizer.impl = {
        fontFaces: FontFaces,
        images: Images,
        util: Util,
        inliner: Inliner,
        options: {}
    };
    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options
     * @param {Function} options.filter - Should return true if passed node should be included in the output
     *          (excluding node means excluding it's children as well). Not called on the root node.
     * @param {String} options.bgcolor - color for the background, any valid CSS color value.
     * @param {Number} options.width - width to be applied to node before rendering.
     * @param {Number} options.height - height to be applied to node before rendering.
     * @param {Object} options.style - an object whose properties to be copied to node's style before rendering.
     * @param {Number} options.quality - a Number between 0 and 1 indicating image quality (applicable to JPEG only),
                defaults to 1.0.
     * @param {String} options.imagePlaceholder - dataURL to use as a placeholder for failed images, default behaviour is to fail fast on images we can't fetch
     * @param {Boolean} options.cacheBust - set to true to cache bust by appending the time to the request url
     * @return {Promise} - A promise that is fulfilled with a SVG image data URL
     * */
    function toSvg(node, options = {}) {
        options = options || {};
        copyOptions(options);
        return Promise.resolve(node)
            .then(function (node) {
            return cloneNode(node, options.filter, true);
        })
            .then(embedFonts)
            .then(inlineImages)
            .then(applyOptions)
            .then(function (clone) {
            return makeSvgDataUri(clone, options.width || Util.width(node), options.height || Util.height(node));
        });
        function applyOptions(clone) {
            if (options.bgcolor)
                clone.style.backgroundColor = options.bgcolor;
            if (options.width)
                clone.style.width = options.width + 'px';
            if (options.height)
                clone.style.height = options.height + 'px';
            if (options.style)
                Object.keys(options.style).forEach(function (property) {
                    clone.style[property] = options.style[property];
                });
            return clone;
        }
    }
    HTMLRasterizer.toSvg = toSvg;
    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a Uint8Array containing RGBA pixel data.
     * */
    function toPixelData(node, options = {}) {
        return draw(node, options || {})
            .then(function (canvas) {
            return canvas.getContext('2d').getImageData(0, 0, Util.width(node), Util.height(node)).data;
        });
    }
    HTMLRasterizer.toPixelData = toPixelData;
    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a PNG image data URL
     * */
    function toPng(node, options = {}) {
        return draw(node, options || {})
            .then(function (canvas) {
            return canvas.toDataURL();
        });
    }
    HTMLRasterizer.toPng = toPng;
    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a JPEG image data URL
     * */
    function toJpeg(node, options = {}) {
        options = options || {};
        return draw(node, options)
            .then(function (canvas) {
            return canvas.toDataURL('image/jpeg', options.quality || 1.0);
        });
    }
    HTMLRasterizer.toJpeg = toJpeg;
    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a PNG image blob
     * */
    function toBlob(node, options = {}) {
        return draw(node, options || {})
            .then(Util.canvasToBlob);
    }
    HTMLRasterizer.toBlob = toBlob;
    function copyOptions(options) {
        // Copy options to impl options for use in impl
        if (typeof (options.imagePlaceholder) === 'undefined') {
            HTMLRasterizer.impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
        }
        else {
            HTMLRasterizer.impl.options.imagePlaceholder = options.imagePlaceholder;
        }
        if (typeof (options.cacheBust) === 'undefined') {
            HTMLRasterizer.impl.options.cacheBust = defaultOptions.cacheBust;
        }
        else {
            HTMLRasterizer.impl.options.cacheBust = options.cacheBust;
        }
    }
    function draw(domNode, options = {}) {
        return toSvg(domNode, options)
            .then(Util.makeImage)
            .then(Util.delay(100))
            .then(function (image) {
            const canvas = newCanvas(domNode);
            canvas.getContext('2d').drawImage(image, 0, 0);
            return canvas;
        });
        function newCanvas(domNode) {
            const canvas = document.createElement('canvas');
            canvas.width = options.width || Util.width(domNode);
            canvas.height = options.height || Util.height(domNode);
            if (options.bgcolor) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = options.bgcolor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            return canvas;
        }
    }
    function cloneNode(node, filter, root) {
        if (!root && filter && !filter(node))
            return Promise.resolve();
        return Promise.resolve(node)
            .then(makeNodeCopy)
            .then(function (clone) {
            return cloneChildren(node, clone, filter);
        })
            .then(function (clone) {
            return processClone(node, clone);
        });
        function makeNodeCopy(node) {
            if (node instanceof HTMLCanvasElement)
                return Util.makeImage(node.toDataURL());
            return Promise.resolve(node.cloneNode(false));
        }
        function cloneChildren(original, clone, filter) {
            const children = original.childNodes;
            if (children.length === 0)
                return Promise.resolve(clone);
            return cloneChildrenInOrder(clone, Util.asArray(children), filter)
                .then(function () {
                return clone;
            });
            function cloneChildrenInOrder(parent, children, filter) {
                let done = Promise.resolve();
                children.forEach(function (child) {
                    done = done
                        .then(function () {
                        return cloneNode(child, filter);
                    })
                        .then(function (childClone) {
                        if (childClone)
                            parent.appendChild(childClone);
                    });
                });
                return done;
            }
        }
        function processClone(original, clone) {
            if (!(clone instanceof Element))
                return clone;
            return Promise.resolve()
                .then(cloneStyle)
                .then(clonePseudoElements)
                .then(copyUserInput)
                .then(fixSvg)
                .then(function () {
                return clone;
            });
            function cloneStyle() {
                copyStyle(window.getComputedStyle(original), clone.style);
                function copyStyle(source, target) {
                    if (source.cssText)
                        target.cssText = source.cssText;
                    else
                        copyProperties(source, target);
                    function copyProperties(source, target) {
                        Util.asArray(source).forEach(function (name) {
                            target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
                        });
                    }
                }
            }
            function clonePseudoElements() {
                [':before', ':after'].forEach(function (element) {
                    clonePseudoElement(element);
                });
                function clonePseudoElement(element) {
                    const style = window.getComputedStyle(original, element);
                    const content = style.getPropertyValue('content');
                    if (content === '' || content === 'none')
                        return;
                    const className = Util.uid();
                    clone.className = clone.className + ' ' + className;
                    const styleElement = document.createElement('style');
                    styleElement.appendChild(formatPseudoElementStyle(className, element, style));
                    clone.appendChild(styleElement);
                    function formatPseudoElementStyle(className, element, style) {
                        const selector = '.' + className + ':' + element;
                        const cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
                        return document.createTextNode(selector + '{' + cssText + '}');
                        function formatCssText(style) {
                            const content = style.getPropertyValue('content');
                            return style.cssText + ' content: ' + content + ';';
                        }
                        function formatCssProperties(style) {
                            return Util.asArray(style)
                                .map(formatProperty)
                                .join('; ') + ';';
                            function formatProperty(name) {
                                return name + ': ' +
                                    style.getPropertyValue(name) +
                                    (style.getPropertyPriority(name) ? ' !important' : '');
                            }
                        }
                    }
                }
            }
            function copyUserInput() {
                if (original instanceof HTMLTextAreaElement)
                    clone.innerHTML = original.value;
                if (original instanceof HTMLInputElement)
                    clone.setAttribute("value", original.value);
            }
            function fixSvg() {
                if (!(clone instanceof SVGElement))
                    return;
                clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                if (!(clone instanceof SVGRectElement))
                    return;
                ['width', 'height'].forEach(function (attribute) {
                    const value = clone.getAttribute(attribute);
                    if (!value)
                        return;
                    clone.style.setProperty(attribute, value);
                });
            }
        }
    }
    function embedFonts(node) {
        return FontFaces.resolveAll()
            .then(function (cssText) {
            const styleNode = document.createElement('style');
            node.appendChild(styleNode);
            styleNode.appendChild(document.createTextNode(cssText));
            return node;
        });
    }
    function inlineImages(node) {
        return Images.inlineAll(node)
            .then(function () {
            return node;
        });
    }
    function makeSvgDataUri(node, width, height) {
        return Promise.resolve(node)
            .then(function (node) {
            node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
            return new XMLSerializer().serializeToString(node);
        })
            .then(Util.escapeXhtml)
            .then(function (xhtml) {
            return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + '</foreignObject>';
        })
            .then(function (foreignObject) {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                foreignObject + '</svg>';
        })
            .then(function (svg) {
            return 'data:image/svg+xml;charset=utf-8,' + svg;
        });
    }
})(HTMLRasterizer || (HTMLRasterizer = {}));
// === Not Included === //
// vfs.ts (Does NOT work minified!)
// filearchive.ts
// sandbox.ts
// githubshortcut.tsx (Include directly in script tag)
DomLib.bind(globalThis);
Object.defineProperty(globalThis, 'kitsunecore', {
    value: true
});
