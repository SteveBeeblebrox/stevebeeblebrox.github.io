"use strict";
/**
 * LZ Compression and Decompression
 * 
 * Copyright © 2013 Pieroxy
 * WTFPL, Version 2
 * 
 * https://github.com/pieroxy/lz-string
 */
var LZCompression;
(function (LZCompression) {
    function writeBit(value, data) {
        data.value = (data.value << 1) | value;
        if (data.position === 15) {
            data.position = 0;
            data.source += String.fromCharCode(data.value);
            data.value = 0;
        }
        else {
            data.position++;
        }
    }
    function writeBits(numberOfBits, value, data) {
        if (typeof value === 'string')
            value = value.charCodeAt(0);
        for (let i = 0; i < numberOfBits; i++) {
            writeBit(value & 1, data);
            value = value >> 1;
        }
    }
    function readBit(data) {
        let result = data.value & data.position;
        data.position >>= 1;
        if (data.position === 0) {
            data.position = 32768;
            data.value = data.source.charCodeAt(data.index++);
        }
        return result > 0 ? 1 : 0;
    }
    function readBits(numberOfBits, data) {
        let result = 0;
        const maxPower = Math.pow(2, numberOfBits);
        let power = 1;
        while (power != maxPower) {
            result |= readBit(data) * power;
            power <<= 1;
        }
        return result;
    }
    function produceW(context) {
        if (context.dictionaryToCreate.hasOwnProperty(context.w)) {
            if (context.w.charCodeAt(0) < 256) {
                writeBits(context.numberOfBits, 0, context.data);
                writeBits(8, context.w, context.data);
            }
            else {
                writeBits(context.numberOfBits, 1, context.data);
                writeBits(16, context.w, context.data);
            }
            decrementEnlargeIn(context);
            delete context.dictionaryToCreate[context.w];
        }
        else {
            writeBits(context.numberOfBits, context.dictionary[context.w], context.data);
        }
        decrementEnlargeIn(context);
    }
    function decrementEnlargeIn(context) {
        context.enlargeIn--;
        if (context.enlargeIn === 0) {
            context.enlargeIn = Math.pow(2, context.numberOfBits);
            context.numberOfBits++;
        }
    }
    function compress(uncompressed) {
        const context = {
            dictionary: {},
            dictionaryToCreate: {},
            c: '',
            wc: '',
            w: '',
            enlargeIn: 2,
            dictionarySize: 3,
            numberOfBits: 2,
            result: '',
            data: { source: '', value: 0, position: 0 }
        };
        for (let i = 0; i < uncompressed.length; i += 1) {
            context.c = uncompressed.charAt(i);
            if (!context.dictionary.hasOwnProperty(context.c)) {
                context.dictionary[context.c] = context.dictionarySize++;
                context.dictionaryToCreate[context.c] = true;
            }
            context.wc = context.w + context.c;
            if (context.dictionary.hasOwnProperty(context.wc)) {
                context.w = context.wc;
            }
            else {
                produceW(context);
                context.dictionary[context.wc] = context.dictionarySize++;
                context.w = String(context.c);
            }
        }
        if (context.w !== '') {
            produceW(context);
        }
        writeBits(context.numberOfBits, 2, context.data);
        while (context.data.value > 0)
            writeBit(0, context.data);
        return context.data.source;
    }
    LZCompression.compress = compress;
    function decompress(compressed) {
        let dictionary = {}, enlargeIn = 4, dictionarySize = 4, numberOfBits = 3, errorCount = 0, data = { source: compressed, value: compressed.charCodeAt(0), position: 32768, index: 1 };
        for (let i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }
        let c = 0;
        switch (readBits(2, data)) {
            case 0:
                c = String.fromCharCode(readBits(8, data));
                break;
            case 1:
                c = String.fromCharCode(readBits(16, data));
                break;
            case 2:
                return '';
        }
        dictionary[3] = c;
        let result = c, w = c;
        while (true) {
            c = readBits(numberOfBits, data);
            switch (c) {
                case 0:
                    if (errorCount++ > 10000)
                        throw 'An error occurred decompressing the source.';
                    c = String.fromCharCode(readBits(8, data));
                    dictionary[dictionarySize++] = c;
                    c = dictionarySize - 1;
                    enlargeIn--;
                    break;
                case 1:
                    c = String.fromCharCode(readBits(16, data));
                    dictionary[dictionarySize++] = c;
                    c = dictionarySize - 1;
                    enlargeIn--;
                    break;
                case 2:
                    return result.toString();
            }
            if (enlargeIn === 0) {
                enlargeIn = Math.pow(2, numberOfBits);
                numberOfBits++;
            }
            let entry = '';
            if (dictionary[c]) {
                entry = dictionary[c].toString();
            }
            else {
                if (c === dictionarySize) {
                    entry = w + w.toString().charAt(0);
                }
                else {
                    return '';
                }
            }
            result += entry;
            dictionary[dictionarySize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn === 0) {
                enlargeIn = Math.pow(2, numberOfBits);
                numberOfBits++;
            }
        }
    }
    LZCompression.decompress = decompress;
})(LZCompression || (LZCompression = {}));
