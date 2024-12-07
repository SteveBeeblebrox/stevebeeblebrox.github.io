/**
 * AES-GCM Encryption
 * (c) 2017 Chris Veness - MIT Licence
 * Adapted for TypeScript and buffers
 * https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
 */
namespace AESGCMEncryption {
    export async function encrypt(plaintext: string, password: string): Promise<string> {
        const sha256 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const algorithm = {name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12))};
        const key = await crypto.subtle.importKey('raw', sha256, algorithm, false, ['encrypt']);
        const ctBuffer = await crypto.subtle.encrypt(algorithm, key, new TextEncoder().encode(plaintext));
        const ctBase64 = btoa(Array.from(new Uint8Array(ctBuffer)).map(byte => String.fromCharCode(byte)).join(''));
        const ivHex = Array.from(algorithm.iv).map(b => b.toString(16).padStart(2,'0')).join('');
        return ivHex + ctBase64;
    }

    export async function decrypt(ciphertext: string, password: string): Promise<string> {
        const sha256 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const algorithm = {name: 'AES-GCM', iv: new Uint8Array(ciphertext.slice(0,24).match(/.{2}/g)!.map(byte => parseInt(byte, 16)))};
        const key = await crypto.subtle.importKey('raw', sha256, algorithm, false, ['decrypt']);
        const ctStr = atob(ciphertext.slice(24));
        const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g)!.map(ch => ch.charCodeAt(0)));
        return new TextDecoder().decode(await crypto.subtle.decrypt(algorithm, key, ctUint8));
    }

    function concatBuffers(left: ArrayBuffer, right: ArrayBuffer): ArrayBuffer {
        const x = new Uint8Array(left.byteLength + right.byteLength);
        x.set(new Uint8Array(left),0);
        x.set(new Uint8Array(right),left.byteLength);
        return x;
    }

    export async function encryptBuffer(plaintext: ArrayBuffer, password: string): Promise<ArrayBuffer> {
        const sha256 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const algorithm = {name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12))};
        const key = await crypto.subtle.importKey('raw', sha256, algorithm, false, ['encrypt']);
        return concatBuffers(algorithm.iv, await crypto.subtle.encrypt(algorithm, key, plaintext));
    }

    export async function decryptBuffer(ciphertext: ArrayBuffer, password: string): Promise<ArrayBuffer> {
        const sha256 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const algorithm = {name: 'AES-GCM', iv: new Uint8Array(ciphertext.slice(0,12))};
        const key = await crypto.subtle.importKey('raw', sha256, algorithm, false, ['decrypt']);
        return await crypto.subtle.decrypt(algorithm, key, ciphertext.slice(12));
    }
}