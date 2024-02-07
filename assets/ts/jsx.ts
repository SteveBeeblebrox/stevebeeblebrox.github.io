/*
 * MIT License
 * Copyright (c) 2020-2022 Trin Wasinger
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
declare namespace JSX {
    type Element = Node;
    interface IntrinsicElements extends IntrinsicElementMap {}

    type IntrinsicElementMap = {
        [K in keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap]: Properties
    }
}

namespace JSX {
    export type Properties = {[key: string]: any}
    type ElementType = keyof HTMLElementTagNameMap|keyof SVGElementTagNameMap|'math'|((properties:Properties|null,...children:Node[])=>Node)
    abstract class StateBase<T> {
        protected readonly callbacks: ((t:T)=>void)[] = [];
        connectCallback(callback: (t:T)=>void): void {
            this.callbacks.push(callback);
            callback(this.get());
        }
        disconnectCallback(callback: (t:T)=>void): void {
            this.callbacks.splice(this.callbacks.indexOf(callback),1);
        }
        connectWeakCallback<K extends Array<object>>(weakCaptures: [...K], weakCallback: (t:T,...args: K)=>void) {
            const weakrefs = weakCaptures.map(o=>new WeakRef(o)), state = this;
            state.connectCallback(function callback(t:T) {
                const refs = weakrefs.map(o=>o.deref());
                if(refs.some(o=>o===undefined))
                    state.disconnectCallback(callback);
                else 
                    weakCallback(t, ...refs as K);
            });
        }
        update() {
            this.callbacks.forEach((f: (t:T)=>void) => {
                f(this.get());
            });
        }
        abstract get(): T;
    }
    export class State<T> extends StateBase<T> {
        constructor(private value: T) {super()}
        get(): T {
            return this.value;
        }
        set(t:T): T {
            this.value = t;
            this.update();
            return this.value;
        }
        consume(f: (...args:any[])=>T) {
            const state = this;
            return function(this: any, ...args: any[]) {
                state.set(f.bind(this)(...args));
            }
        }
        format<K>(formatter: (t:T)=>K): StateFormatter<T,K> {
            const stateFormatter = new StateFormatter(this, formatter);
            this.connectCallback(stateFormatter.update.bind(stateFormatter));
            return stateFormatter;
        }
    }
    class StateFormatter<T,K> extends StateBase<K> {
        constructor(private readonly state: State<T>, private readonly formatter: (t:T)=>K) {super()}
        set(t:T): T {
            return this.state.set(t);
        }
        get(): K {
            return this.formatter(this.state.get());
        }
        consume(f: (...args:any[])=>T) {
            return this.state.consume(f);
        }
    }
    export const createState = function createState<T>(t:T): State<T> {
        return new State<T>(t);
    }

    function isWritable(object: object, property: PropertyKey): boolean {
        const descriptor = Object.getOwnPropertyDescriptor(object,property);
        return descriptor ? descriptor.writable != false && descriptor.set != undefined : property in object;
    }

    export const createElement = (function() {
        function createElement<K extends keyof HTMLElementTagNameMap>(name: K, properties: Properties | null, ...children: Node[]): HTMLElementTagNameMap[K]
        function createElement(tag: ElementType, properties: Properties | null, ...children: (Node|HTMLCollection)[]): Node {
            if(properties instanceof Map) {
                properties = Object.fromEntries([...properties.entries()]);
            }

            if(typeof tag === 'function')
                return tag(properties, ...children.map(o=>o instanceof HTMLCollection ? [...o]:o).flat())
            
            const element = (function() {
                switch(tag) {
                    case null: return document.createDocumentFragment();
                    case 'svg': return document.createElementNS('http://www.w3.org/2000/svg', tag);
                    case 'math': return document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
                    default: 
                        if(properties?.['is']) {
                            const element = document.createElement(tag, {is: properties['is']});
                            element.setAttribute('is', properties['is']);
                            return element;
                        } else {
                            return document.createElement(tag);
                        }
                }
            })();

            if(element instanceof Element) {
                if(tag === 'svg')
                    element.setAttribute('xmlsn', 'http://www.w3.org/2000/svg');
                else if(tag === 'math')
                    element.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');

                const prototype = Object.getPrototypeOf(element);

                for(const [key, value] of Object.entries(properties ?? {})) {
                    const [name,namespace] = key.split(':').reverse();
                    if(name === 'is') continue;
                    if(name === 'style' && typeof value === 'object' && name in prototype)
                        for(const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                            Reflect.set(Reflect.get(element, name), property, style);
                    else if((name === 'classList' || name === 'classlist' && name in prototype) || name === 'class' && Array.isArray(value))
                        element.classList.add(...value);
                    else if(name in prototype && value instanceof StateBase)
                        value.connectWeakCallback([element],(t,element)=>Reflect.set(element,name,t));
                    else if(name in prototype && isWritable(prototype,name))
                        Reflect.set(element, name, value);
                    else if(value instanceof StateBase)
                        value.connectWeakCallback([element],(t,element)=>element.setAttribute(name,t));
                    else
                        element.setAttribute(name, value);
                }
            }
            
            for(let child of children.flat()) {
                if(child instanceof HTMLCollection) {
                    element.append(...child);
                    continue;
                }

                if(child instanceof StateBase) {
                    const text = document.createTextNode('')
                    child.connectWeakCallback([text],(t,text)=>text.textContent=t);
                    child = text;
                }
                element.append(child);
            }

            return element;
        }
        return createElement;
    })();
}
