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
namespace DomLib {
    // internal type NodeLike
    type NodeLike = Node & {
        querySelector(selectors: string): Element | null,
        querySelectorAll(selectors: string): NodeListOf<Element>,
        childElementCount?: number,
        closest?: (selectors: string)=>Element | null,
    };

    // internal type XPathQueryValue
    type XPathQueryValue = null | number | string | boolean | Node | ArrayProxy<Node>;

    // internal const options
    const options: {[option: string]: string | boolean} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries()].map(([key,value]: [string, string]) => [key, value === 'false' ? false : value])) : {debug: true});

    // internal function interpolate
    function interpolate(strings: TemplateStringsArray, ...values: any[]): string {
        return values.reduce((acc,cur,i)=>acc+cur+strings[i+1], strings[0]);
    }

    // export const VERSION
    export const VERSION: Readonly<{major: number, minor: number, patch: number, metadata?: string, prerelease?: string, toString(): string}> = Object.freeze({
        toString() {return `${VERSION.major}.${VERSION.minor}.${VERSION.patch}${VERSION.prerelease !== undefined ? `-${VERSION.prerelease}` : ''}${VERSION.metadata !== undefined ? `+${VERSION.metadata}` : ''}`},
        major: 2, minor: 2, patch: 2
    });

    // internal let _lastQueryValue
    let _lastQueryValue: Element | undefined | null = undefined;

    // export const $it
    export const $it: Element | undefined | null = undefined;
    {
        Object.defineProperty(DomLib, '$it', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryValue}})
    }

    // internal let _lastQueryAllValue
    let _lastQueryAllValue: ArrayProxy<Element> | undefined = undefined;
    
    // export const $$it
    export const $$it: ArrayProxy<Element> | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$$it', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryAllValue}})
    }

    // internal let _lastQueryAllValue
    let _lastQueryXValue: ArrayProxy<Node> | undefined = undefined;

    // export const $$it
    export const $xit: XPathQueryValue | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$xit', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryXValue}})
    }

    // internal function closestDeep
    function closestDeep(selector: string, target: NodeLike): Element | null {
        let root: Node;
        return target.closest?.(selector) ?? (
            (root = target.getRootNode() as ShadowRoot).host
                ? closestDeep(selector, (root as ShadowRoot).host)
                : (root as Document).defaultView?.frameElement
                    ? closestDeep(selector, (root as Document).defaultView!.frameElement!)
                    : null
        );
    }

    // export const $
    export const $ = (function() {
        function $<K extends keyof HTMLElementTagNameMap>(selector: K, target?: NodeLike): HTMLElementTagNameMap[K] | null;
        function $(selector: string, target?: NodeLike): Element | null;
        function $(strings: TemplateStringsArray, ...values: any[]): Element | null;
        function $<K extends keyof HTMLElementTagNameMap>(selector: string | K | TemplateStringsArray, target: NodeLike = document): Element | HTMLElementTagNameMap[K] | null {
            if(isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1)) as K;
                target = document;
            }
            
            let {deep,count,cssSelector}: {[key: string]: string | number} = selector.match(/^(?<deep>%)?(?:\^(?<count>\d*))? ?(?<cssSelector>[\s\S]*)$/)!.groups!
            if(count !== undefined) {
                if((count = +(count||'1')) === NaN || !(target instanceof Element)) return null;
                let element: Element | null = target;
                for(let i = 0; i < count;i++) {
                    if(!element?.parentElement) {
                        break;
                    } else if(deep) {
                        element = closestDeep(cssSelector || ':scope', element?.parentElement);
                    } else {
                        element = element?.parentElement?.closest?.(cssSelector || ':scope') ?? null;
                    }
                }
                return _lastQueryValue = element;
            } else if(deep) {
                return _lastQueryValue = querySelectorDeep(cssSelector, target);
            } else {
                return _lastQueryValue = target.querySelector(cssSelector);
            }
        }
        return $;
    })();

    // internal function isTemplateStringsArray
    function isTemplateStringsArray(arg: string | TemplateStringsArray): arg is TemplateStringsArray {
        return Array.isArray(arg);
    }

    // define $self on ShadowRoot, Element, Document, DocumentFragment
    for(const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$self', {
            enumerable: true, configurable: !!options.debug,
            value: function(selector: string | TemplateStringsArray) {
                if(isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return $(selector, this);
            }
        });

    // internal function querySelectorAllDeep
    function querySelectorAllDeep(selector: string, root: NodeLike = document): Element[] {
        const elements =  [];
        if(root.childElementCount) {
            const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            let node;
            while(node = tw.nextNode()) {
                if(node instanceof Element && node.matches(selector))
                    elements.push(node);
                if(node instanceof Element && node.shadowRoot) {
                    elements.push(...querySelectorAllDeep(selector,node.shadowRoot));
                } else if (node instanceof HTMLIFrameElement && node.contentWindow) {
                    elements.push(...querySelectorAllDeep(selector,node.contentWindow.document));
                }
            }
        } else if(root instanceof HTMLIFrameElement && root.contentWindow?.document) {
            elements.push(...querySelectorAllDeep(selector, root.contentWindow.document));
        } else if(root instanceof Element && root.shadowRoot) {
            elements.push(...querySelectorAllDeep(selector, root.shadowRoot));
        }
        return elements;
    }

    function querySelectorDeep(selector: string, root: NodeLike = document): Element | null {
        let temp;
        if(root.childElementCount) {
            const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            let node;
            while(node = tw.nextNode()) {
                if(node instanceof Element && node.matches(selector))
                    return node;
                if(node instanceof Element && node.shadowRoot) {
                    if(temp = querySelectorDeep(selector,node.shadowRoot))
                        return temp;
                } else if (node instanceof HTMLIFrameElement && node.contentWindow) {
                    if(temp = querySelectorDeep(selector,node.contentWindow.document))
                        return temp;
                }
            }
        } else if(root instanceof HTMLIFrameElement && root.contentWindow?.document) {
            if(temp = querySelectorDeep(selector, root.contentWindow.document))
                return temp;
        } else if(root instanceof Element && root.shadowRoot) {
            if(temp = querySelectorDeep(selector, root.shadowRoot))
                return temp;
        }
        return null;
    }

    // export const $$
    export const $$ = (function() {
        function $$<K extends keyof HTMLElementTagNameMap>(selector: K, target?: NodeLike): ArrayProxy<HTMLElementTagNameMap[K]>;
        function $$(selector: string, target?: NodeLike): ArrayProxy<Element>;
        function $$(strings: TemplateStringsArray, ...values: any[]): ArrayProxy<Element>;
        function $$<K extends keyof HTMLElementTagNameMap>(selector: string | K | TemplateStringsArray, target: NodeLike = document): ArrayProxy<Element> | ArrayProxy<HTMLElementTagNameMap[K]> {
            if(isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1)) as K;
                target = document;
            }

            let {deep,cssSelector}: {[key: string]: string | number} = selector.match(/^(?<deep>%)? ?(?<cssSelector>[\s\S]*)$/)!.groups!
            if(deep !== undefined) {
                return _lastQueryAllValue = ArrayProxy(querySelectorAllDeep(cssSelector, target));
            } else {
                return (_lastQueryAllValue = ArrayProxy(target.querySelectorAll(cssSelector) as NodeListOf<Element>)) as ArrayProxy<Element> | ArrayProxy<HTMLElementTagNameMap[K]>;
            }
        }
        return $$;
    })();

    // define $$self on ShadowRoot, Element, Document, DocumentFragment
    for(const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$$self', {
            enumerable: true, configurable: !!options.debug,
            value: function(selector: string | TemplateStringsArray) {
                if(isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return $$(selector, this);
            }
        });

    // export const $x
    export const $x = (function() {
        function $x(query: string, target?: Node): XPathQueryValue;
        function $x(strings: TemplateStringsArray, ...values: any[]): XPathQueryValue;
        function $x(query: string | TemplateStringsArray, target: Node = document): XPathQueryValue {
            if(isTemplateStringsArray(query)) {
                query = interpolate(query, ...[...arguments].slice(1));
                target = document;
            }
            const result = document.evaluate(query, target, null, XPathResult.ANY_TYPE, null);
            try {
                switch(result.resultType) {
                    case 1:
                        return result.numberValue;
                    case 2:
                        return result.stringValue;
                    case 3:
                        return result.booleanValue;
                    case 4:
                    case 5: {
                        let node: Node | null, nodes: Node[] = [];
                        while(node = result.iterateNext()) nodes.push(node);
                        return ArrayProxy(nodes);
                    }
                    case 6:
                    case 7: {
                        return ArrayProxy(Array.apply(null, {length:result.snapshotLength} as unknown[]).map((_:unknown, i: number) => result.snapshotItem(i)!));
                    }
                    case 8:
                    case 9:
                        return result.singleNodeValue!;
                    default:
                        return null;
                }
            } catch(error) {
                return null;
            }
        }
        return $x;
    })();

    // define $xself on ShadowRoot, Element, Document, DocumentFragment
    for(const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$xself', {
            enumerable: true, configurable: !!options.debug,
            value: function(query: string | TemplateStringsArray) {
                if(isTemplateStringsArray(query)) {
                    query = interpolate(query, ...[...arguments].slice(1));
                }
                return $x(query, this)
            }
        });

    // export type ArrayProxy
    export type ArrayProxy<T> = {
        /*get*/ [key in keyof T]: ArrayProxy<T[key]>
      ///*set*/ [key in keyof T]: T[key]
    } & {
        [key in keyof Array<T> as `\$${Extract<key, string>}`]: 
            Array<T>[key] extends (...args: any[]) => Array<infer value> ? {(...args: Parameters<Array<T>[key]>): ArrayProxy<value>} : Array<T>[key] extends Array<infer value> ? ArrayProxy<value>: Array<T>[key];
    } & {
        [key: `\$${number}`]: T
    } & {
        $toArray(): Element[], 
        $any: boolean,
    }

    // internal function ArrayProxy
    function ArrayProxy<T extends object>(items: T[] | {[Symbol.iterator](): IterableIterator<T>}): ArrayProxy<T> {
        return new Proxy([...items], {
            set(target: T[], property: string | symbol, value: unknown) {
                if(typeof property === 'symbol')
                    return Reflect.set(target, property, value);
                else if(property.startsWith('$'))
                    return Reflect.set(target, property.substring(1), value);
                else
                    return target.every(item => Reflect.set(item, property, value instanceof Box ? value.value() : value));
            },
            get(target: T[], property: string | symbol, reciever: any): ArrayProxy<T> | {():T[]} | boolean | any {
                if(typeof property === 'symbol') {
                    const array = [...target], value = Reflect.get(array, property);
                    return typeof value === 'function' ? value.bind(array) : value;
                }
                else if(property === '$toArray')
                    return function $toArray() {return [...target]};
                else if(property === '$any')
                    return target.length > 0;
                else if(property.startsWith('$')) {
                    const value = Reflect.get([...target], property.substring(1));
                    if(typeof value === 'function')
                        return function() {
                            const result = value.bind([...target])(...arguments);
                            return Array.isArray(result) ? ArrayProxy(result) : result;
                        }
                    else
                        return Array.isArray(value) ? ArrayProxy(value) : value;
                }
                else if(target.length <= 0)
                    return undefined;
                else if(target.some(item => typeof Reflect.get(item, property) === 'function'))
                    return function() {
                        return ArrayProxy(target.map((item: T) => {
                            const value = Reflect.get(item, property);
                            return typeof value === 'function' ? value.bind(item)(...[...arguments].map(argument => argument instanceof Box ? argument.value() : argument)) : value;
                        }))
                    }    
                else return ArrayProxy(target.map(item => Reflect.get(item, property)));
                
            },
            deleteProperty(target: T[], property: string | symbol) {
                if(typeof property === 'symbol')
                    return Reflect.deleteProperty(target, property);
                else if(/^\$\d+/.test(property))
                        return Reflect.deleteProperty(target, property.substring(1));
                else if(!property.startsWith('$'))
                    return target.every(item => Reflect.deleteProperty(item, property));
                else
                    return false;
            },
            has(target: T[], property: string | symbol) {
                if(typeof property === 'symbol')
                    return Reflect.has(target, property);
                else if(/^\$\d+/.test(property))
                    return Reflect.has(target, property.substring(1));
                else if(!property.startsWith('$'))
                    return target.every(item => Reflect.has(item, property));
                else
                    return false;
            }
        }) as unknown as ArrayProxy<T>;
    }

    // internal function ChildNodeArray
    function ChildNodeArray(element: Element): Node[] {
        const getChildren = (): Node[] & {[key: string]: any} => [...element.childNodes].filter(n => !(n instanceof Text) || n.wholeText.trim() !== '' || n.parentElement instanceof HTMLPreElement || n.parentElement?.closest?.('pre'));
        const mutators = ['push','pop','shift','unshift','splice','reverse','sort'];
        return new Proxy([...element.childNodes], {
            get(target: Node[] & {[key: string]: any}, property: string): unknown {
                if(mutators.includes(property)) {
                    return function() {
                        const children = getChildren();
                        try {
                            return children[property](...arguments);
                        } finally {
                            element.replaceChildren(...children)
                        }
                    }
                } else {
                    return target[property];
                }
            },
            set(target: Node[] & {[key: string]: any}, property: string, value: unknown, reciever?: any): boolean {
                if(+property > -1) {
                    if(value instanceof Node) {
                        const children = getChildren();
                        children[+property] = value;
                        element.replaceChildren(...children);
                        return true;
                    } else {
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
    for(const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$children', {
            enumerable: true, configurable: !!options.debug,
            get() {
                return ChildNodeArray(this);
            },
            set(value) {
                return this.replaceChildren(...value);
            }
        });

    // export const HTMLNode
    export const HTMLNode = function HTMLNode<K extends keyof HTMLElementTagNameMap>(type: K, data?: string | {[key: string]: any} | Map<string, any>, ...children: Node[]): HTMLElementTagNameMap[K] {
        const element = document.createElement(type);
      
        if(typeof data === 'string') {
            element.textContent = data;
        } else {
            if(!(data instanceof Map))
                data = new Map<string, any>(Object.entries(data ?? {}));

            for(const [key, value] of data.entries()) {
                if(key === 'children' && Array.isArray(value))
                    element.replaceChildren(...element.childNodes, ...value);
                else if(key === 'style' && typeof value === 'object')
                    for(const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                        Reflect.set(element.style, property, style);
                else if(key === 'classList' || key === 'classlist' && Array.isArray(value))
                    element.classList.add(...value);
                else if(key in element)
                    Reflect.set(element, key, value);
                else
                    element.setAttribute(key, value);
            }
            
            if(children.length)
                element.replaceChildren(...element.childNodes, ...children);
        }
        return element;
    }
    
    // export alias HtmlNode for HTMLNode
    export const HtmlNode = HTMLNode;

    // export const SVGNode
    export const SVGNode = function SVGNode<K extends keyof SVGElementTagNameMap>(type: K, data?: {[key: string]: any} | Map<string, any>, ...children: Node[]): SVGElementTagNameMap[K] {
        const element = document.createElementNS('http://www.w3.org/2000/svg', type);
      
        if(type === 'svg')
            element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        if(!(data instanceof Map))
            data = new Map<string, any>(Object.entries(data ?? {}));

        for(const [key, value] of data.entries()) {
            if(key === 'children' && Array.isArray(value))
                element.replaceChildren(...element.childNodes, ...value);
            else if(key === 'style' && typeof value === 'object')
                for(const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                    Reflect.set(element.style, property, style);
            else if(key === 'classList' || key === 'classlist' && Array.isArray(value))
                element.classList.add(...value);
            else if(key in element && typeof value === 'function')
                Reflect.set(element, key, value);
            else
                element.setAttribute(key, value);
        }
        
        if(children.length)
            element.replaceChildren(...element.childNodes, ...children);
            
        return element;
    }
    
    // export alias SvgNode for SVGNode
    export const SvgNode = SVGNode;

    //TODO export const SVGNode
    export const MATHMLNode = function MATHMLNode(type: string, data?: string | {[key: string]: any} | Map<string, any>, ...children: Node[]): MathMLElement {throw 'MathML node has not been implemented yet.'}
    
    // export alias MathMlNode for MATHMLNode
    export const MathMlNode = MATHMLNode;

    // export const TextNode
    export const TextNode: (new (content?: string)=>Text) & ((content?: string)=>Text) = function TextNode(content: string = ''): Text {
        return document.createTextNode(content);
    } as (new (content?: string)=>Text) & ((content?: string)=>Text)

    // export const CommentNode
    export const CommentNode: (new (content?: string)=>Comment) & ((content?: string)=>Comment) = function CommentNode(content: string = ''): Comment {
        return document.createComment(content);
    } as (new (content?: string)=>Comment) & ((content?: string)=>Comment)

    // export const $host
    // define $host on ShadowRoot, Element, Document, DocumentFragment
    export const $host: Element | null | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$host', {get() {return document.currentScript?.parentElement ?? null}});
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$host', {enumerable:true,configurable:!!options.debug,get(){return this}}));
    }

    
    // export const $last
    export const $last: Element | null | undefined = undefined;
    {
        let _lastAddedElement: Element | null | undefined = undefined;
        const observer = new MutationObserver(mutations => mutations.forEach(mutation => {const node = [...mutation.addedNodes].pop(); if(node instanceof HTMLElement && !(node instanceof HTMLScriptElement)) _lastAddedElement = node}));
        observer.observe(document.documentElement, {childList: true, subtree: true});
        window.addEventListener('load', () => {observer.disconnect(); _lastAddedElement = null});
        Object.defineProperty(DomLib, '$last', {enumerable:true,configurable:!!options.debug,get(){return _lastAddedElement}});
    }

    // export const $ctx
    // define $ctx on ShadowRoot, Element, Document, DocumentFragment
    export const $ctx: Node | null | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$ctx', {
            get() {
                return document.currentScript;
            },
            set(other: string | Node) {
                document.currentScript?.replaceWith?.(other);
            }
        });
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$ctx', {enumerable:true,configurable:!!options.debug,get(){return this},set(other:string|Node){this.replaceWith(other)}}));
    }

    // internal class Box
    class Box<T> {
        constructor(public readonly value: ()=>T) {};
        get [Symbol.toStringTag]() {
            return 'Box';
        }
    }

    // export class BoxedNode
    export class BoxedNode extends Box<Node> {
        constructor(node: Node) {super(()=>node.cloneNode(true))}
    }

    // define $on on EventTarget
    Object.defineProperty(EventTarget.prototype,'$on', {
        value(this: globalThis.EventTarget, type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined) {
            this.addEventListener(type, callback, options)
            return {detach:()=>this.removeEventListener(type, callback, options)};
        },enumerable:true,configurable:!!options.debug})

    // Binding Control
    if(document.currentScript) {
        if('bind' in options) {
            const target = Reflect.get(globalThis, (options.bind || 'globalThis').toString())
            Object.getOwnPropertyNames(DomLib).forEach(function(key: string) {
                if(key !== 'VERSION') Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(DomLib, key)!);
            });
        }
    }

    export declare interface Extensions {
        $children: Node[]
        $self: typeof DomLib.$
        $$self: typeof DomLib.$$
        $xself: typeof DomLib.$x
        readonly $host: typeof DomLib.$host
        get $ctx(): typeof DomLib.$ctx
        set $ctx(other: typeof DomLib.$ctx | string)
    }
}

declare interface ShadowRoot extends DomLib.Extensions {}
declare interface Element extends DomLib.Extensions {}
declare interface Document extends DomLib.Extensions {}
declare interface DocumentFragment extends DomLib.Extensions {}

declare interface EventTarget {
    $on(this: EventTarget, type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined): {detach:()=>void}
}