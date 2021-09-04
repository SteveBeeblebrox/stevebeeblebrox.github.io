/**
 * AES-GCM Encryption
 * (c) 2017 Chris Veness - MIT Licence
 * https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
 */
 namespace AESGCMEncryption {
    export async function encrypt(plaintext: string, password: string): Promise<string> {
        const passwordUtf8 = new TextEncoder().encode(password)
        const passwordHash = await crypto.subtle.digest('SHA-256', passwordUtf8)
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const algorithm = { name: 'AES-GCM', iv: iv }
        const key = await crypto.subtle.importKey('raw', passwordHash, algorithm, false, ['encrypt'])
        const ptUint8 = new TextEncoder().encode(plaintext)
        const ctBuffer = await crypto.subtle.encrypt(algorithm, key, ptUint8)
        const ctArray = Array.from(new Uint8Array(ctBuffer))
        const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('')
        const ctBase64 = btoa(ctStr)
        const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
        return ivHex + ctBase64
    }

    export async function decrypt(ciphertext: string, password: string): Promise<string> {
        const passwordUtf8 = new TextEncoder().encode(password)
        const passwordHash = await crypto.subtle.digest('SHA-256', passwordUtf8)
        const iv = ciphertext.slice(0,24).match(/.{2}/g)!.map(byte => parseInt(byte, 16))
        const algorithm = { name: 'AES-GCM', iv: new Uint8Array(iv) }
        const key = await crypto.subtle.importKey('raw', passwordHash, algorithm, false, ['decrypt'])
        const ctStr = atob(ciphertext.slice(24))
        const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g)!.map(ch => ch.charCodeAt(0)))
        const plainBuffer = await crypto.subtle.decrypt(algorithm, key, ctUint8)
        const plaintext = new TextDecoder().decode(plainBuffer)
        return plaintext
    }
}