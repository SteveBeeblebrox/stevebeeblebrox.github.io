/*
 * LZW Compression
 * (c) 2019 Simon Hutchison - https://creativecommons.org/licenses/by-sa/4.0/
 * Adapted for TypeScript
 * https://stackoverflow.com/a/56680172
 */
namespace LZWCompression {
    // Apply LZW-compression to a string and return base64 compressed string
    export function zip(str: string) {
        try {
            const dictionary: {[key: string]: number} = {}
            const data = (str + '').split('')
            const out = []
            let currentChar
            let phrase = data[0]
            let code = 256
            for (let i = 1; i < data.length; i++) {
                currentChar = data[i]
                if (dictionary[phrase + currentChar] != null) {
                    phrase += currentChar
                } else {
                    out.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0))
                    dictionary[phrase + currentChar] = code
                    code++
                    phrase = currentChar
                }
            }
            out.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0))
            for (var j = 0; j < out.length; j++) {
                out[j] = String.fromCharCode(out[j] as number)
            }
            return utoa(out.join(''))
        } catch (e) {
            throw 'Failed to zip string.'
        }
    }

    // Decompress an LZW-encoded base64 string
    export function unzip (base64ZippedString: string) {
        try {
            const s = atou(base64ZippedString)
            const dictionary: {[key: number]: string} = {}
            const data = (s + '').split('')
            let currentChar = data[0]
            let oldPhrase = currentChar
            const out = [currentChar]
            let code = 256
            let phrase
            for (let i = 1; i < data.length; i++) {
                let currentCode = data[i].charCodeAt(0)
                if (currentCode < 256) {
                    phrase = data[i]
                } else {
                    phrase = dictionary[currentCode] ? dictionary[currentCode] : oldPhrase + currentChar
                }
                out.push(phrase as string)
                currentChar = (phrase as string).charAt(0)
                dictionary[code] = oldPhrase + currentChar
                code++
                oldPhrase = phrase
            }
            return out.join('')
        } catch (e) {
            console.log('Failed to unzip string return empty string', e)
            return ''
        }
    }

    // ucs-2 string to base64 encoded ascii
    function utoa (str: string) {
        return btoa(unescape(encodeURIComponent(str)))
    }

    // base64 encoded ascii to ucs-2 string
    function atou (str: string) {
        return decodeURIComponent(escape(atob(str)))
    }
}