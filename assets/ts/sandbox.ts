/*
 * MIT License
 * 
 * Copyright (c) 2022 Trin Wasinger
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
class Sandbox {
    private static SandboxClient = class SandboxClient {
        private parent: Window | null = null;
        private readonly actions: Map<string, (this: SandboxClient, arg: any) => unknown> = new Map(Object.entries({
            eval({text, voidResult}: {text: string, voidResult: boolean}) {
                const v = (0,eval)(text);
                return voidResult ? void v : v;
            },
            invoke({name, args}: {name: string, args: unknown[]}) {
                return Reflect.get(window, name)(...args);
            },
            get({name}: {name: string}) {
                return Reflect.get(window, name);
            },
            set({name, value}: {name: string, value: unknown}) {
                return Reflect.set(window, name, value);
            },
            setFunction(this: SandboxClient, {fname}: {fname: string}) {
                const client = this;
                return Reflect.set(globalThis, fname, function() {
                    return client.triggerAction('callFunction', {fname, args: [...arguments]});
                });
            },
            use({src}: {src: string}) {
                return new Promise<void>(function(resolve, reject) {
                    document.head.append(Object.assign(document.createElement('script'), {src, onload() {resolve()}, onerror(event: ErrorEvent) {reject(new Error(`(Internal Sandbox Error) Failed to load '${(event?.target as HTMLScriptElement)?.src}'`))}}))
                });
            }
        }));
        constructor(private readonly origin: string, private readonly uuid: string) {
            const client = this;
            window.addEventListener('message', async function(event: MessageEvent) {
                if(event.origin !== origin || event.data.uuid !== client.uuid) return;
                client.parent ??= event.source as Window;
                let value, error, ok = true;
                try {
                    if(client.actions.has(event.data.action))
                        value = client.actions.get(event.data.action)!.bind(client)(event.data.data);
                    else
                        throw new Error(`(Internal Sandbox Error) Unable to trigger unknown action "${event.data.action}"`)
                } catch(e) {
                    error = e;
                    ok = false;
                }
                try {
                    event.ports[0].postMessage({value: await client.awaitPromise(value), error, ok});
                } catch(e) {
                    value = undefined;
                    error = new Error('(Internal Sandbox Error) Unable to serialize evaluated value (The value must be supported by the structured clone algorithm)');
                    ok = false;
                    event.ports[0].postMessage({value, error, ok});
                }
            });
        }
        private async awaitPromise(value: unknown): Promise<unknown> {
            return value instanceof Promise ? this.awaitPromise(await value) : value;
        }
        private triggerAction(action: string, data?: unknown): Promise<unknown> {
            return this.postMessage({action, data, uuid: this.uuid})
        }
        private postMessage(message: any): Promise<unknown> {
            if(this.parent === null) throw new Error('(Internal Sandbox Error) No parent scope found')
            const {port1, port2} = new MessageChannel();
            const result = new Promise(function(resolve, reject){
                port1.onmessage = function(event) {
                    const {value, error, ok} = event.data;
                    if(ok) resolve(value);
                    else reject(error);
                }
                port1.onmessageerror = function(event) {
                    reject(new Error('(Internal Sandbox Error) Unable to deserialize evaluated value'));
                }
            });
            try {
                this.parent!.postMessage(message, '*', [port2]);
            } catch(e) {
                throw new Error('(Internal Sandbox Error) Unable to serialize value to transfer (The value must be supported by the structured clone algorithm)')
            }
            return result;
        }
    }
    private readonly functions: Map<string, Function> = new Map();
    private readonly listener: (this: Window, event: MessageEvent<any>) => any;
    private readonly uuid: string = window.crypto.randomUUID();
    private readonly actions: Map<string, (this: Sandbox, arg: any) => unknown> = new Map(Object.entries({
        callFunction(this: Sandbox, {fname, args}: {fname: string, args: unknown[]}) {
            return this.functions.get(fname)!(...args);
        }
    }));

    private constructor(private readonly iframe: HTMLIFrameElement) {
        iframe.srcdoc = `<!DOCTYPE html><html><head><script>new ${
            Sandbox.SandboxClient
        }("${window.location.origin}", "${this.uuid}");</script></head></html>`;

        const sandbox = this;
        
        window.addEventListener('message', this.listener = async function(event: MessageEvent) {
            if(event.source !== iframe.contentWindow || event.data.uuid !== sandbox.uuid) return;
            let value, error, ok = true;
            try {
                if(sandbox.actions.has(event.data.action))
                    value = sandbox.actions.get(event.data.action)!.bind(sandbox)(event.data.data);
                else
                    throw new Error(`(Internal Sandbox Error) Unable to trigger unknown action "${event.data.action}"`)
            } catch(e) {
                error = e;
                ok = false;
            }
            try {
                event.ports[0].postMessage({value: await sandbox.awaitPromise(value), error, ok});
            } catch(e) {
                value = undefined;
                error = new Error('(Internal Sandbox Error) Unable to serialize evaluated value (The value must be supported by the structured clone algorithm)');
                ok = false;
                event.ports[0].postMessage({value, error, ok});
            }
        });
    }
    static create(): Promise<Sandbox> {
        const iframe = Object.assign(document.createElement('iframe'), {sandbox: 'allow-scripts', style: 'display: none;'});
        document.body.append(iframe);
        const sandbox = new Sandbox(iframe);
        return new Promise(resolve => iframe.addEventListener('load', () => resolve(sandbox), {once: true}));
    }
    dispose() {
        this.iframe.remove();
        window.removeEventListener('message', this.listener)
    }
    eval(text: string, voidResult: boolean = false): Promise<unknown> {
        return this.triggerAction('eval', {text, voidResult});
    }
    private postMessage(message: any): Promise<unknown> {
        if(this.iframe.contentWindow === null) throw new Error('(Internal Sandbox Error) Sandbox has been disposed')
        const {port1, port2} = new MessageChannel();
        const result = new Promise(function(resolve, reject){
            port1.onmessage = function(event) {
                const {value, error, ok} = event.data;
                if(ok) resolve(value);
                else reject(error);
            }
            port1.onmessageerror = function(event) {
                reject(new Error('(Internal Sandbox Error) Unable to deserialize evaluated value'));
            }
        });
        try {
            this.iframe.contentWindow!.postMessage(message, '*', [port2]);
        } catch(e) {
            throw new Error('(Internal Sandbox Error) Unable to serialize value to transfer (The value must be supported by the structured clone algorithm)')
        }
        return result;
    }
    private async awaitPromise(value: unknown): Promise<unknown> {
        return value instanceof Promise ? this.awaitPromise(await value) : value;
    }
    private triggerAction(action: string, data?: unknown): Promise<unknown> {
        return this.postMessage({action, data, uuid: this.uuid})
    }
    invoke(name: string, ...args: unknown[]): Promise<unknown> {
        return this.triggerAction('invoke', {name, args});
    }
    get(name: string): Promise<unknown> {
        return this.triggerAction('get', {name});
    }
    set(name: string, value: unknown): Promise<unknown> {
        return this.triggerAction('set', {name, value});
    }
    setFunction(f: (...args: unknown[])=>unknown, name?: string) {
        const fname = name || f.name;
        if(!fname) throw new Error('(Internal Sandbox Error) Unable to create unamed function.');
        this.functions.set(fname, f);
        this.triggerAction('setFunction', {fname});
    }
    use(src: string) {
        return this.triggerAction('use', {src})
    }
}