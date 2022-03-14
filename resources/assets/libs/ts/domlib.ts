namespace DomLib {
    // internal type NodeLike
    type NodeLike = Node & {querySelector(selector: string): Node, querySelectorAll(selector: string): NodeList}

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
    let _lastQueryAllValue: Node[] | undefined = undefined;

    // export const $$it
    export const $$it: Node[] | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$$it', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryAllValue}})
    }

    // export const $
    export const $ = (function() {
        function $(selector: string, target?: NodeLike): Node | null;
        function $(strings: TemplateStringsArray, ...values: any[]): Node | null;
        function $(selector: string | TemplateStringsArray, target: NodeLike = document): Node | null {
            if(isTemplateStringsArray(selector)) {
                selector = interpolate(selector, [...arguments].slice(1))
                target = document
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
                    selector = interpolate(selector, [...arguments].slice(1))
                }
                return $(selector, this)
            }
        });

    // export const $$
    export const $$ = (function() {
        function $$(selector: string, target?: NodeLike): Node[];
        function $$(strings: TemplateStringsArray, ...values: any[]): Node[];
        function $$(selector: string | TemplateStringsArray, target: NodeLike = document): Node[] {
            if(isTemplateStringsArray(selector)) {
                selector = interpolate(selector, [...arguments].slice(1))
                target = document
            }
            return _lastQueryAllValue = [...target.querySelectorAll(selector)];
        }
        return $$;
    })();

    // define $$self on ShadowRoot, Element, Document, DocumentFragment
    for(const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$$self', {
            enumerable: true, configurable: !!options.debug,
            value: function(selector: string | TemplateStringsArray) {
                if(isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, [...arguments].slice(1))
                }
                return $$(selector, this)
            }
        });

    // export const $x
    export const $x = (function() {
        function $x(query: string, target?: Node): Node | null;
        function $x(strings: TemplateStringsArray, ...values: any[]): Node | null;
        function $x(query: string | TemplateStringsArray, target: Node = document): null | number | string | boolean | Node | Node[] {
            if(isTemplateStringsArray(query)) {
                query = interpolate(query, [...arguments].slice(1));
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
                        return nodes;
                    }
                    case 6:
                    case 7: {
                        return Array.apply(null, {length:result.snapshotLength} as unknown[]).map((_:unknown, i: number) => result.snapshotItem(i)!)
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
                    query = interpolate(query, [...arguments].slice(1))
                }
                return $x(query, this)
            }
        });


    // internal function ChildArrayProxy
    function ChildNodeArrayProxy(element: Element): Node[] {
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
        Object.defineProperty(type.prototype, '$xself', {
            enumerable: true, configurable: !!options.debug,
            get() {
                return ChildNodeArrayProxy(this);
            },
            set(value) {
                return this.replaceChildren(...value);
            }
        });


    //TODO ElementArrayProxy

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