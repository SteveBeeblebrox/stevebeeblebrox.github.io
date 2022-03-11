

namespace DomLib {
    // internal type NodeLike
    type NodeLike = {querySelector(selector: string): Node}

    // internal const options
    const options: {[option: string]: string | boolean} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries()].map(([key,value]: [string, string]) => [key, value === 'false' ? false : value])) : {debug: true});

    // internal function interpolate
    function interpolate(strings: TemplateStringsArray, ...values: any[]) {
        return values.reduce((acc,cur,i)=>acc+cur+strings[i+1], strings[0]);
    }

    // export const VERSION
    export const VERSION: Readonly<{major: number, minor: number, patch: number, metadata?: string, prerelease?: string, toString(): string}> = Object.freeze({
        toString() {return `${VERSION.major}.${VERSION.minor}.${VERSION.patch}${VERSION.prerelease !== undefined ? `-${VERSION.prerelease}` : ''}${VERSION.metadata !== undefined ? `+${VERSION.metadata}` : ''}`},
        major: 2, minor: 0, patch: 0
    });

    // internal let _lastQueryValue
    let _lastQueryValue: Element | undefined | null = undefined;

    // export const $it
    export const $it = undefined;
    {
        Object.defineProperty(DomLib, '$it', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryValue}})
    }

    // internal let _lastQueryAllValue
    let _lastQueryAllValue: Element | undefined | null = undefined;

    // export const $$it
    export const $$it = undefined;
    {
        Object.defineProperty(DomLib, '$$it', {enumerable:true,configurable:!!options.debug,get(){return _lastQueryAllValue}})
    }


    // export const $
    export const $ = (function() {
        function $(selector: string, target?: NodeLike): Node;
        function $(strings: TemplateStringsArray, ...values: any[]): Node;
        function $(...args: unknown[]): Node {
            throw 'NYI'
        }
        return $;
    })();

    //TODO $self

    // export const $$
    export const $$ = (function() {
        function $$(selector: string, target?: NodeLike): Node;
        function $$(strings: TemplateStringsArray, ...values: any[]): Node;
        function $$(...args: unknown[]): Node {
            throw 'NYI'
        }
        return $$;
    })();

    //TODO $$self

    //TODO $children

    // export const HTMLNode
    export const HTMLNode = function HTMLNode() {throw 'NYI'}
    
    // export alias HtmlNode for HTMLNode
    export const HtmlNode = HTMLNode;

    // export const SVGNode
    export const SVGNode = function HTMLNode() {throw 'NYI'}
    
    // export alias SvgNode for HTMLNode
    export const SvgNode = HTMLNode;


    // export const TextNode
    export const TextNode = function TextNode(content: string): Text {
        return document.createTextNode(content);
    }

    // export const CommentNode
    export const CommentNode = function CommentNode(content: string): Comment {
        return document.createComment(content);
    }

    // export const $host
    export const $host: HTMLElement | null | undefined = undefined;
    {
        Object.defineProperty(DomLib, '$host', {get() {return document.currentScript?.parentElement}});
        [HTMLElement, SVGElement, ShadowRoot].forEach(e => Object.defineProperty(e.prototype, '$host', {enumerable:true,configurable:!!options.debug,get(){return this}}));
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