/*
 * LZ Compression
 * (c) 2013 Pieroxy - WTFPLv2
 * Adapted for TypeScript
 * https://pieroxy.net/blog/pages/lz-string/index.html
 */
namespace LZCompression {
    type MaybeString = string | undefined | null;
    // private property
    const f = String.fromCharCode;
    const keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
    const baseReverseDic: {[key: string]: {[key: string]: number}} = {};

    function getBaseValue(alphabet: string, character: string) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (let i = 0; i < alphabet.length; i++) {
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }

    export function compressToBase64(input: MaybeString) {
        if (input == null) return '';
        const res = _compress(input, 6, function (a) { return keyStrBase64.charAt(a); });
        switch (res.length % 4) { // To produce valid Base64
            default: // When could this happen ?
            case 0: return res;
            case 1: return res + '===';
            case 2: return res + '==';
            case 3: return res + '=';
        }
    }

    export function decompressFromBase64(input: MaybeString) {
        if (input == null) return '';
        if (input == '') return null;
        return _decompress(input.length, 32, function (index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
    }

    export function compressToUTF16(input: MaybeString) {
        if (input == null) return '';
        return _compress(input, 15, function (a) { return f(a + 32); }) + ' ';
    }

    export function decompressFromUTF16(compressed: MaybeString) {
        if (compressed == null) return '';
        if (compressed == '') return null;
        return _decompress(compressed.length, 16384, function (index) { return compressed.charCodeAt(index) - 32; });
    }

    //compress into uint8array (UCS-2 big endian format)
    export function compressToUint8Array(uncompressed: MaybeString) {
        const compressed = compress(uncompressed);
        const buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

        for (let i = 0, totalLen = compressed.length; i < totalLen; i++) {
            const current_value = compressed.charCodeAt(i);
            buf[i * 2] = current_value >>> 8;
            buf[i * 2 + 1] = current_value % 256;
        }
        return buf;
    }

    //decompress from uint8array (UCS-2 big endian format)
    export function decompressFromUint8Array(compressed?: Uint8Array) {
        if (compressed === null || compressed === undefined) {
            return decompress(compressed);
        } else {
            const buf = new Array(compressed.length / 2); // 2 bytes per character
            for (let i = 0, totalLen = buf.length; i < totalLen; i++) {
                buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
            }

            const result: string[] = [];
            buf.forEach(function (c) {
                result.push(f(c));
            });
            return decompress(result.join(''));

        }

    }


    //compress into a string that is already URI encoded
    export function compressToEncodedURIComponent(input: MaybeString) {
        if (input == null) return '';
        return _compress(input, 6, function (a) { return keyStrUriSafe.charAt(a); });
    }

    //decompress from an output of compressToEncodedURIComponent
    export function decompressFromEncodedURIComponent(input: MaybeString) {
        if (input == null) return '';
        if (input == '') return null;
        input = input.replace(/ /g, '+');
        return _decompress(input.length, 32, function (index) { return getBaseValue(keyStrUriSafe, input!.charAt(index)); });
    }

    export function compress(uncompressed: MaybeString) {
        return _compress(uncompressed, 16, function (a) { return f(a); });
    }
    function _compress(uncompressed: MaybeString, bitsPerChar: number, getCharFromInt: (char: number)=>string) {
        if (uncompressed == null) return '';
        let i, value,
            context_dictionary: {[key: string]: number} = {},
            context_dictionaryToCreate: {[key: string]: boolean} = {},
            context_c = '',
            context_wc = '',
            context_w = '',
            context_enlargeIn = 2, // Compensate for the first entry which should not count
            context_dictSize = 3,
            context_numBits = 2,
            context_data = [],
            context_data_val = 0,
            context_data_position = 0;

        for (let ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }

            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            } else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
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
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
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
                            } else {
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
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
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
                        } else {
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
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                } else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
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
                        } else {
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
            } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    } else {
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
            } else {
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
            else context_data_position++;
        }
        return context_data.join('');
    }

    export function decompress(compressed: MaybeString) {
        if (compressed == null) return '';
        if (compressed == '') return null;
        return _decompress(compressed.length, 32768, function (index) { return compressed.charCodeAt(index); });
    }

    function _decompress(length: number, resetValue: number, getNextValue: (index: number)=>number) {
        let dictionary = [],
            next,
            enlargeIn = 4,
            dictSize = 4,
            numBits = 3,
            entry = '',
            result = [],
            i,
            w,
            bits, resb, maxpower, power,
            c,
            data = { val: getNextValue(0), position: resetValue, index: 1 };

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
                entry = dictionary[c] as string;
            } else {
                if (c === dictSize) {
                    entry = w + w!.charAt(0);
                } else {
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
    
    export const zip = compress;
    export const unzip = decompress;
}

/*
 * LZW Compression
 * (c) 2019 Simon Hutchison - https://creativecommons.org/licenses/by-sa/4.0/
 * Adapted for TypeScript
 * https://stackoverflow.com/a/56680172
 */
/**
 * @deprecated LZWCompression is problematic with higher Unicode characters; consider using LZCompression instead
 */
namespace LZWCompression {
    // Apply LZW-compression to a string and return base64 compressed string
    export function compress(str: string) {
        try {
            const dictionary: {[key: string]: number} = {};
            const data = (str + '').split('');
            const out = [];
            let currentChar;
            let phrase = data[0];
            let code = 256;
            for (let i = 1; i < data.length; i++) {
                currentChar = data[i];
                if (dictionary[phrase + currentChar] != null) {
                    phrase += currentChar;
                } else {
                    out.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0));
                    dictionary[phrase + currentChar] = code;
                    code++;
                    phrase = currentChar;
                }
            }
            out.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0));
            for (var j = 0; j < out.length; j++) {
                out[j] = String.fromCharCode(out[j] as number);
            }
            return utoa(out.join(''));
        } catch (e) {
            throw 'Failed to zip string';
        }
    }

    // Decompress an LZW-encoded base64 string
    export function decompress(base64ZippedString: string) {
        try {
            const s = atou(base64ZippedString);
            const dictionary: {[key: number]: string} = {};
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
                } else {
                    phrase = dictionary[currentCode] ? dictionary[currentCode] : oldPhrase + currentChar;
                }
                out.push(phrase as string);
                currentChar = (phrase as string).charAt(0);
                dictionary[code] = oldPhrase + currentChar;
                code++;
                oldPhrase = phrase;
            }
            return out.join('');
        } catch (e) {
            throw 'Failed to unzip string';
        }
    }

    export const zip = compress;
    export const unzip = decompress;

    // ucs-2 string to base64 encoded ascii
    function utoa (str: string) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    // base64 encoded ascii to ucs-2 string
    function atou (str: string) {
        return decodeURIComponent(escape(atob(str)));
    }
}

/*
 * GZip Compression
 * (c) MDN Contributors - https://creativecommons.org/licenses/by-sa/4.0/
 * Adapted for TypeScript
 * https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
 */
namespace GZipCompression {
    export async function decompressBlob(blob: Blob) {
        const ds = new DecompressionStream('gzip');
        const decompressedStream = blob.stream().pipeThrough(ds);
        return new Blob([await new Response(decompressedStream).blob()]);
    }

    export async function compressBlob(blob: Blob) {
        const cs = new CompressionStream('gzip');
        const compressedStream = blob.stream().pipeThrough(cs);
        return new Blob([await new Response(compressedStream).blob()], {type: 'application/gzip'});
    }

    export async function compress(text: string) {
        return Base64.encodeBase64FromArray(new Uint8Array(await (await GZipCompression.compressBlob(new Blob([text]))).arrayBuffer()));
    }
    
    export async function decompress(text: string) {
        return (await GZipCompression.decompressBlob(new Blob([Base64.decodeBase64ToArray(text)]))).text();
    }

    export const zip = compress;
    export const unzip = decompress;
}
