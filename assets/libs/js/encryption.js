"use strict";
/**
 * AES-GCM Encryption
 * 
 * Copyright © 2017 Chris Veness
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
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