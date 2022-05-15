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
var DomLib;
(function (DomLib) {
    // internal const options
    const options = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'), { href: document.currentScript.getAttribute('src') }).search).entries()].map(([key, value]) => [key, value === 'false' ? false : value])) : { debug: true });
    // internal function interpolate
    function interpolate(strings, ...values) {
        return values.reduce((acc, cur, i) => acc + cur + strings[i + 1], strings[0]);
    }
    // export const VERSION
    DomLib.VERSION = Object.freeze({
        toString() { return `${DomLib.VERSION.major}.${DomLib.VERSION.minor}.${DomLib.VERSION.patch}${DomLib.VERSION.prerelease !== undefined ? `-${DomLib.VERSION.prerelease}` : ''}${DomLib.VERSION.metadata !== undefined ? `+${DomLib.VERSION.metadata}` : ''}`; },
        major: 2, minor: 1, patch: 0
    });
    // internal let _lastQueryValue
    let _lastQueryValue = undefined;
    // export const $it
    DomLib.$it = undefined;
    {
        Object.defineProperty(DomLib, '$it', { enumerable: true, configurable: !!options.debug, get() { return _lastQueryValue; } });
    }
    // internal let _lastQueryAllValue
    let _lastQueryAllValue = undefined;
    // export const $$it
    DomLib.$$it = undefined;
    {
        Object.defineProperty(DomLib, '$$it', { enumerable: true, configurable: !!options.debug, get() { return _lastQueryAllValue; } });
    }
    // internal let _lastQueryAllValue
    let _lastQueryXValue = undefined;
    // export const $$it
    DomLib.$xit = undefined;
    {
        Object.defineProperty(DomLib, '$xit', { enumerable: true, configurable: !!options.debug, get() { return _lastQueryXValue; } });
    }
    // export const $
    DomLib.$ = (function () {
        function $(selector, target = document) {
            var _a, _b, _c;
            if (isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1));
                target = document;
            }
            let { count, cssSelector } = selector.match(/^(?:\^(?<count>\d*))? ?(?<cssSelector>[\s\S]*)$/).groups;
            if (count !== undefined) {
                if ((count = +(count || '1')) === NaN || !(target instanceof Element))
                    return null;
                let element = target;
                for (let i = 0; i < count; i++) {
                    element = (_c = (_b = (_a = element === null || element === void 0 ? void 0 : element.parentElement) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, cssSelector || ':scope')) !== null && _c !== void 0 ? _c : null;
                }
                return _lastQueryValue = element;
            }
            else {
                return _lastQueryValue = target.querySelector(cssSelector);
            }
        }
        return $;
    })();
    // internal function isTemplateStringsArray
    function isTemplateStringsArray(arg) {
        return Array.isArray(arg);
    }
    // define $self on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$self', {
            enumerable: true, configurable: !!options.debug,
            value: function (selector) {
                if (isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return DomLib.$(selector, this);
            }
        });
    // export const $$
    DomLib.$$ = (function () {
        function $$(selector, target = document) {
            if (isTemplateStringsArray(selector)) {
                selector = interpolate(selector, ...[...arguments].slice(1));
                target = document;
            }
            return (_lastQueryAllValue = ArrayProxy(target.querySelectorAll(selector)));
        }
        return $$;
    })();
    // define $$self on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$$self', {
            enumerable: true, configurable: !!options.debug,
            value: function (selector) {
                if (isTemplateStringsArray(selector)) {
                    selector = interpolate(selector, ...[...arguments].slice(1));
                }
                return DomLib.$$(selector, this);
            }
        });
    // export const $x
    DomLib.$x = (function () {
        function $x(query, target = document) {
            if (isTemplateStringsArray(query)) {
                query = interpolate(query, ...[...arguments].slice(1));
                target = document;
            }
            const result = document.evaluate(query, target, null, XPathResult.ANY_TYPE, null);
            try {
                switch (result.resultType) {
                    case 1:
                        return result.numberValue;
                    case 2:
                        return result.stringValue;
                    case 3:
                        return result.booleanValue;
                    case 4:
                    case 5: {
                        let node, nodes = [];
                        while (node = result.iterateNext())
                            nodes.push(node);
                        return ArrayProxy(nodes);
                    }
                    case 6:
                    case 7: {
                        return ArrayProxy(Array.apply(null, { length: result.snapshotLength }).map((_, i) => result.snapshotItem(i)));
                    }
                    case 8:
                    case 9:
                        return result.singleNodeValue;
                    default:
                        return null;
                }
            }
            catch (error) {
                return null;
            }
        }
        return $x;
    })();
    // define $xself on ShadowRoot, Element, Document, DocumentFragment
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
        Object.defineProperty(type.prototype, '$xself', {
            enumerable: true, configurable: !!options.debug,
            value: function (query) {
                if (isTemplateStringsArray(query)) {
                    query = interpolate(query, ...[...arguments].slice(1));
                }
                return DomLib.$x(query, this);
            }
        });
    // internal function ArrayProxy
    function ArrayProxy(items) {
        return new Proxy([...items], {
            set(target, property, value) {
                if (typeof property === 'symbol')
                    return Reflect.set(target, property, value);
                else if (property.startsWith('$'))
                    return Reflect.set(target, property.substring(1), value);
                else
                    return target.every(item => Reflect.set(item, property, value));
            },
            get(target, property, reciever) {
                if (typeof property === 'symbol')
                    return Reflect.get([...target], property);
                else if (property === '$toArray')
                    return function $toArray() { return [...target]; };
                else if (property === '$any')
                    return target.length > 0;
                else if (property.startsWith('$')) {
                    const value = Reflect.get([...target], property.substring(1));
                    if (typeof value === 'function')
                        return function () {
                            const result = value.bind([...target])(...arguments);
                            return Array.isArray(result) ? ArrayProxy(result) : result;
                        };
                    else
                        return Array.isArray(value) ? ArrayProxy(value) : value;
                }
                else if (target.some(item => typeof Reflect.get(item, property) === 'function'))
                    return function () {
                        return ArrayProxy(target.map(function (item) {
                            const value = Reflect.get(item, property);
                            return typeof value === 'function' ? value.bind(item)(...arguments) : value;
                        }));
                    };
                else
                    return ArrayProxy(target.map(item => Reflect.get(item, property)));
            },
            deleteProperty(target, property) {
                if (typeof property === 'symbol')
                    return Reflect.deleteProperty(target, property);
                else if (/^\$\d+/.test(property))
                    return Reflect.deleteProperty(target, property.substring(1));
                else if (!property.startsWith('$'))
                    return target.every(item => Reflect.deleteProperty(item, property));
                else
                    return false;
            }
        });
    }
    // internal function ChildNodeArray
    function ChildNodeArray(element) {
        const getChildren = () => [...element.childNodes].filter(n => { var _a, _b; return !(n instanceof Text) || n.wholeText.trim() !== '' || n.parentElement instanceof HTMLPreElement || ((_b = (_a = n.parentElement) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, 'pre')); });
        const mutators = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
        return new Proxy([...element.childNodes], {
            get(target, property) {
                if (mutators.includes(property)) {
                    return function () {
                        const children = getChildren();
                        try {
                            return children[property](...arguments);
                        }
                        finally {
                            element.replaceChildren(...children);
                        }
                    };
                }
                else {
                    return target[property];
                }
            },
            set(target, property, value, reciever) {
                if (+property > -1) {
                    if (value instanceof Node) {
                        const children = getChildren();
                        children[+property] = value;
                        element.replaceChildren(...children);
                        return true;
                    }
                    else {
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
    for (const type of [ShadowRoot, Element, Document, DocumentFragment])
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
    DomLib.HTMLNode = function HTMLNode(type, data, ...children) {
        const element = document.createElement(type);
        if (typeof data === 'string') {
            element.textContent = data;
        }
        else {
            if (!(data instanceof Map))
                data = new Map(Object.entries(data !== null && data !== void 0 ? data : {}));
            for (const [key, value] of data.entries()) {
                if (key === 'children' && Array.isArray(value))
                    element.replaceChildren(...element.childNodes, ...value);
                else if (key === 'style' && typeof value === 'object')
                    for (const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                        Reflect.set(element.style, property, style);
                else if (key === 'classList' || key === 'classlist' && Array.isArray(value))
                    element.classList.add(...value);
                else if (key in element)
                    Reflect.set(element, key, value);
                else
                    element.setAttribute(key, value);
            }
            if (children.length)
                element.replaceChildren(...element.childNodes, ...children);
        }
        return element;
    };
    // export alias HtmlNode for HTMLNode
    DomLib.HtmlNode = DomLib.HTMLNode;
    // export const SVGNode
    DomLib.SVGNode = function SVGNode(type, data, ...children) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', type);
        if (type === 'svg')
            element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        if (!(data instanceof Map))
            data = new Map(Object.entries(data !== null && data !== void 0 ? data : {}));
        for (const [key, value] of data.entries()) {
            if (key === 'children' && Array.isArray(value))
                element.replaceChildren(...element.childNodes, ...value);
            else if (key === 'style' && typeof value === 'object')
                for (const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                    Reflect.set(element.style, property, style);
            else if (key === 'classList' || key === 'classlist' && Array.isArray(value))
                element.classList.add(...value);
            else if (key in element && typeof value === 'function')
                Reflect.set(element, key, value);
            else
                element.setAttribute(key, value);
        }
        if (children.length)
            element.replaceChildren(...element.childNodes, ...children);
        return element;
    };
    // export alias SvgNode for SVGNode
    DomLib.SvgNode = DomLib.SVGNode;
    //TODO export const SVGNode
    DomLib.MATHMLNode = function MATHMLNode(type, data, ...children) { throw 'MathML node has not been implemented yet.'; };
    // export alias MathMlNode for MATHMLNode
    DomLib.MathMlNode = DomLib.MATHMLNode;
    // export const TextNode
    DomLib.TextNode = function TextNode(content = '') {
        return document.createTextNode(content);
    };
    // export const CommentNode
    DomLib.CommentNode = function CommentNode(content = '') {
        return document.createComment(content);
    };
    // export const $host
    // define $host on ShadowRoot, Element, Document, DocumentFragment
    DomLib.$host = undefined;
    {
        Object.defineProperty(DomLib, '$host', { get() { var _a; return (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.parentElement; } });
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$host', { enumerable: true, configurable: !!options.debug, get() { return this; } }));
    }
    // export const $last
    DomLib.$last = undefined;
    {
        let _lastAddedElement = undefined;
        const observer = new MutationObserver(mutations => mutations.forEach(mutation => { const node = [...mutation.addedNodes].pop(); if (node instanceof HTMLElement && !(node instanceof HTMLScriptElement))
            _lastAddedElement = node; }));
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener('load', () => { observer.disconnect(); _lastAddedElement = undefined; });
        Object.defineProperty(DomLib, '$last', { enumerable: true, configurable: !!options.debug, get() { return _lastAddedElement; } });
    }
    // export const $ctx
    // define $ctx on ShadowRoot, Element, Document, DocumentFragment
    DomLib.$ctx = undefined;
    {
        Object.defineProperty(DomLib, '$ctx', {
            get() {
                return document.currentScript;
            },
            set(other) {
                var _a, _b;
                (_b = (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.replaceWith) === null || _b === void 0 ? void 0 : _b.call(_a, other);
            }
        });
        [ShadowRoot, Element, Document, DocumentFragment].forEach(e => Object.defineProperty(e.prototype, '$ctx', { enumerable: true, configurable: !!options.debug, get() { return this; }, set(other) { this.replaceWith(other); } }));
    }
    // define $on on EventTarget
    Object.defineProperty(EventTarget.prototype, '$on', {
        value(type, callback, options) {
            this.addEventListener(type, callback, options);
            return { detach: () => this.removeEventListener(type, callback, options) };
        }, enumerable: true, configurable: !!options.debug
    });
    // Binding Control
    if (document.currentScript) {
        if ('bind' in options) {
            const target = Reflect.get(globalThis, (options.bind || 'globalThis').toString());
            Object.getOwnPropertyNames(DomLib).forEach(function (key) {
                if (key !== 'VERSION')
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(DomLib, key));
            });
        }
    }
})(DomLib || (DomLib = {}));
