namespace DomLib {
    // internal type NodeLike
    type NodeLike = Node & {querySelector(selector: string): Node, querySelectorAll(selector: string): NodeList};

    // internal type XPathQueryValue
    type XPathQueryValue = null | number | string | boolean | Node |ArrayProxy<Node>;


    // internal const options
    const options: {[option: string]: string | boolean} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries()].map(([key,value]: [string, string]) => [key, value === 'false' ? false : value])) : {debug: true});

    // internal function interpolate
    function interpolate(strings: TemplateStringsArray, ...values: any[]): string {
        return values.reduce((acc,cur,i)=>acc+cur+strings[i+1], strings[0]);
    }

    // export const VERSION
    export const VERSION: Readonly<{major: number, minor: number, patch: number, metadata?: string, prerelease?: string, toString(): string}> = Object.freeze({
        toString() {return `${VERSION.major}.${VERSION.minor}.${VERSION.patch}${VERSION.prerelease !== undefined ? `-${VERSION.prerelease}` : ''}${VERSION.metadata !== undefined ? `+${VERSION.metadata}` : ''}`},
        major: 2, minor: 0, patch: 0
    });

    // internal let _lastQueryValue
    let _lastQueryValue: Node | undefined | null = undefined;

    // export const $it
    export const $it: Node | undefined | null = undefined;
    {
        Object.defineProperty(DomLib, '$it', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryValue}})
    }

    // internal let _lastQueryAllValue
    let _lastQueryAllValue: ArrayProxy<Node> | undefined = undefined;

    // export const $$it
    export const $$it: ArrayProxy<Node> | undefined = undefined;
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

    // export const $
    export const $ = (function() {
        function $(selector: string, target?: NodeLike): Node | null;
        function $(strings: TemplateStringsArray, ...values: any[]): Node | null;
        function $(selector: string | TemplateStringsArray, target: NodeLike = document): Node | null {
            if(isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1));
                target = document;
            }
            return _lastQueryValue = target.querySelector(selector);
        }
        return $;
    })();

    // internal function isTemplateStringsArray
    function isTemplateStringsArray(arg: string | TemplateStringsArray): arg is TemplateStringsArray {
        return Array.isArray(arg);
    }

    //define $self on ShadowRoot, Element, Document, DocumentFragment
    for(const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$self', {
            enumerable: true, configurable: !!options.debug,
            value: function(selector: string | TemplateStringsArray) {
                if(isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return $(selector, this)
            }
        });

    // export const $$
    export const $$ = (function() {
        function $$(selector: string, target?: NodeLike): ArrayProxy<Node>;
        function $$(strings: TemplateStringsArray, ...values: any[]): ArrayProxy<Node>;
        function $$(selector: string | TemplateStringsArray, target: NodeLike = document): ArrayProxy<Node> {
            if(isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1));
                target = document;
            }
            return _lastQueryAllValue = ArrayProxy(...target.querySelectorAll(selector));
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
                return $$(selector, this)
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
                        return ArrayProxy(...nodes);
                    }
                    case 6:
                    case 7: {
                        return ArrayProxy(...Array.apply(null, {length:result.snapshotLength} as unknown[]).map((_:unknown, i: number) => result.snapshotItem(i)!));
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

    // internal type ArrayProxy
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
    export function ArrayProxy<T extends object>(...items: T[]): ArrayProxy<T> {
        return new Proxy(items, {
            set(target: T[], property: string | symbol, value: unknown) {
                if(typeof property === 'symbol')
                    return Reflect.set(target, property, value);
                else if(property.startsWith('$'))
                    return Reflect.set(target, property.substring(1), value);
                else
                    return target.every(item => Reflect.set(item, property, value));
            },
            get(target: T[], property: string | symbol, reciever: any): ArrayProxy<T> | {():T[]} | boolean | any {
                if(typeof property === 'symbol')
                    return Reflect.get([...target], property);
                else if(property === '$toArray')
                    return function $toArray() {return [...target]};
                else if(property === '$any')
                    return target.length > 0;
                else if(property.startsWith('$')) {
                    const value = Reflect.get([...target], property.substring(1));
                    if(typeof value === 'function')
                        return function() {
                            const result = value.bind([...target])(...arguments);
                            return Array.isArray(result) ? ArrayProxy(...result) : result;
                        }
                    else
                        return Array.isArray(value) ? ArrayProxy(...value) : value;
                }
                else if(target.some(item => typeof Reflect.get(item, property) === 'function'))
                    return function() {
                        return ArrayProxy(...target.map(function(item: T) {
                            const value = Reflect.get(item, property);
                            return typeof value === 'function' ? value.bind(item)(...arguments) : value;
                        }))
                    }    
                else return ArrayProxy(...target.map(item => Reflect.get(item, property)));
                
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

    //TODO export const HTMLNode
    export const HTMLNode = function HTMLNode(type: string, properties: {[key: string]: any} | Map<string, any>, ...children: Node[]): HTMLElement {throw 'NYI'}
    
    // export alias HtmlNode for HTMLNode
    export const HtmlNode = HTMLNode;

    //TODO export const SVGNode
    export const SVGNode = function SVGNode(type: string, properties: {[key: string]: any} | Map<string, any>, ...children: Node[]): SVGElement {throw 'NYI'}
    
    // export alias SvgNode for SVGNode
    export const SvgNode = SVGNode;

    //TODO export const SVGNode
    export const MATHMLNode = function MATHMLNode(type: string, properties: {[key: string]: any} | Map<string, any>, ...children: Node[]): MathMLElement {throw 'NYI'}
    
    // export alias MathMlNode for MATHMLNode
    export const MathMlNode = MATHMLNode;


    // export const TextNode
    export const TextNode = function TextNode(content: string): Text {
        return document.createTextNode(content);
    }

    // export const CommentNode
    export const CommentNode = function CommentNode(content: string): Comment {
        return document.createComment(content);
    }

    // export const $host
    // define $host on ShadowRoot, Element, Document, DocumentFragment
    export const $host: HTMLElement | null | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$host', {get() {return document.currentScript?.parentElement}});
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$host', {enumerable:true,configurable:!!options.debug,get(){return this}}));
    }

    
    // export const $last
    export const $last: HTMLElement | undefined = undefined;
    {
        let _lastAddedElement: HTMLElement | undefined = undefined;
        const observer = new MutationObserver(mutations => mutations.forEach(mutation => {const node = [...mutation.addedNodes].pop(); if(node instanceof HTMLElement && !(node instanceof HTMLScriptElement)) _lastAddedElement = node}));
        observer.observe(document.documentElement, {childList: true, subtree: true});
        window.addEventListener('load', () => {observer.disconnect(); _lastAddedElement = undefined});
        Object.defineProperty(DomLib, '$last', {enumerable:true,configurable:!!options.debug,get(){return _lastAddedElement}});
    }

    // Binding Control
    /*if(document.currentScript) {
        if('bind' in options) {
            options.bind ||= 'globalThis';
            Reflect.set(globalThis, options.bind.toString(), Reflect.get(globalThis, options.bind.toString()) ?? {})
            for(const key of Object.keys(DomLib))
                Object.defineProperty(Reflect.get(globalThis, options.bind.toString()), key, {get(){return Reflect.get(DomLib, key)}});
        }
    }*/
}
