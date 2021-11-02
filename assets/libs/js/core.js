//await new Promise(resolve => document.body.appendChild(Object.assign(document.createElement('script'),{src:'https://stevebeeblebrox.github.io/assets/libs/js/core.js?include',onload(){resolve()}})))
(function() {
    const options = Object.fromEntries(new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries())

    if('include' in options) include = function(src) {
        return new Promise(resolve => document.head.appendChild(Object.assign(document.createElement('script'), {src, onload() {resolve()}})));
    }
    
    if('throws' in options) throws = function(e) {
        throw e;
    }
    
    if('R' in options) R = function(template, ...substitutions) {
        return new RegExp(...(String.raw(template, ...substitutions).match(/^\/(.*)\/(.*)$/) ?? ['','','']).slice(1,3));
    }

    if('JSION' in options) {
        "use strict";
        (function (JSION) {
            const SINGLE_QUOTE_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])+(?<!\\)(?:\\{2})*"|'([\S\s]*?(?<!\\)(?:\\\\)*)'/g, COMMENT_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])+(?<!\\)(?:\\{2})*"|(\([\S\s]*?(?<!\\)(?:\\\\)*\))/g, KEY_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])+(?<!\\)(?:\\{2})*"|([a-zA-Z_$][0-9a-zA-Z_$]*)(?=\s*?:)/g, TRAILING_COMMA_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])+(?<!\\)(?:\\{2})*"|(,)(?=\s*?[}\]])/g, NUMBER_SEPERATOR = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])+(?<!\\)(?:\\{2})*"|(?<=\d)(_)(?=\d)/g;
            function parse(text, reviver) {
                return JSON.parse(text.replace(SINGLE_QUOTE_PATTERN, function (substring, ...args) {
                    if (!args[0])
                        return substring;
                    return `"${args[0].replace(/"/g, '\\"').replace(/\\'/g, "'")}"`;
                }).replace(COMMENT_PATTERN, function (substring, ...args) {
                    if (!args[0])
                        return substring;
                    return '';
                }).replace(KEY_PATTERN, function (substring, ...args) {
                    if (!args[0])
                        return substring;
                    return `"${args[0]}"`;
                }).replace(TRAILING_COMMA_PATTERN, function (substring, ...args) {
                    if (!args[0])
                        return substring;
                    return '';
                }).replace(NUMBER_SEPERATOR, function (substring, ...args) {
                    if (!args[0])
                        return substring;
                    return '';
                }), reviver);
            }
            JSION.parse = parse;
            JSION.stringify = JSON.stringify;
        })(globalThis.JSION || (globalThis.JSION = {}));
    }

    function ElementArrayProxy(elements) {
        return new Proxy(elements, {
            set: function(target, property, value) {
                return target.forEach(o => o[property] = value), false;
            },
            get: function(target, property, reciever) {
                if(typeof property === 'symbol') return [...elements][property];
                if(property === '$toArray') return function() {return [...elements]}
                else if(property.startsWith('$') && property !== '$')
                if(typeof [...elements][property.substr(1)] === 'function') return function() {return [...elements][property.substr(1)](...arguments)}
                else return [...elements][property.substring(1)]
        
                return [...elements].some(o => typeof o[property] === 'function') ? function() {return [...elements].map(o => typeof o[property] === 'function' ? o[property](...arguments) : o[property])} : new ElementArrayProxy([...elements].map(o => o[property]));
            }
        });
    }

    if('ElementArrayProxy' in options) globalThis.ElementArrayProxy = ElementArrayProxy
    
    function ChildNodeArrayProxy(element) {
        const getChildren = target => [...target.childNodes].filter(n => !(n instanceof Text) || n.wholeText.trim() !== '' || n.parentElement instanceof HTMLPreElement || n.parentElement.closest('pre'));
        const setChildren = (target, children) => target.replaceChildren(...children);
        const mutators = ['push','pop','shift','unshift','splice','reverse','sort'];
        return new Proxy(element, {
            get(target, property) {
                if(mutators.includes(property))
                    return function() {
                        const array = getChildren(target);
                        try {
                            return array[property](...arguments);
                        } finally {
                            setChildren(target, array);
                        }
                }
                else if(property in Array.prototype || !isNaN(property))
                    return [...target.childNodes][property];
                else return target[property];
            },
            set(target, property, value) {
                if(Number(property) > -1) {
                    const array = getChildren(target);
                    try {
                        return array[property] = value;
                    } finally {
                        setChildren(target, array);
                    }
                }
                else return target[property] = value;
            }
        })
    }

    if('ChildNodeArrayProxy' in options) globalThis.ChildNodeArrayProxy = ChildNodeArrayProxy

    function interpolate(strings, values) {
        let result = strings[0]
        for(let i = 0; i < values.length; i++) {
            result += values[i]
            result += strings[i+1]
        }
        return result;
    }

    if('interpolate' in options) globalThis.interpolate = interpolate

    if('DOMLib' in options || 'DomLib' in options || '$' in options) {
        $ = function(selector, startNode = document) {
            if(Array.isArray(selector)) {
                selector = interpolate(selector, [...arguments].slice(1))
                startNode = document
            }
            return $it = startNode.querySelector(selector);
        }
        
        ShadowRoot.prototype.$self = SVGElement.prototype.$self = HTMLElement.prototype.$self = function(selector) {
            if(Array.isArray(selector)) {
                selector = interpolate(selector, [...arguments].slice(1))
            }
            return $(selector, this);
        }
    }
    
    if('DOMLib' in options || 'DomLib' in options || '$$' in options) {
        $$ = function(selector, startNode = document) {
            if(Array.isArray(selector)) {
                selector = interpolate(selector, [...arguments].slice(1))
                startNode = document
            }
            return $$it = new ElementArrayProxy(startNode.querySelectorAll(selector));
        }
        
        ShadowRoot.prototype.$$self = SVGElement.prototype.$$self = HTMLElement.prototype.$$self = function(selector) {
            if(Array.isArray(selector)) {
               selector = interpolate(selector, [...arguments].slice(1))
            }
            return $$(selector, this);
        }
    }

    if('DOMLib' in options || 'DomLib' in options || '$' in options || '$$' in options) {
        for(const type of [ShadowRoot, SVGElement, HTMLElement]) {
            Object.defineProperty(type.prototype, '$children', {
                get() {
                    return new ChildNodeArrayProxy(this);
                },
                set(value) {
                    return this.replaceChildren(...value);
                }
            })
        }
    }

    function HtmlNode(type, data = {}) {
        const element = document.createElement(type)
        
        if(typeof data === 'string')
            element.textContent = data
        else {
            for(const key in data)
                if(key in element) 
                    element[key] = data[key]
                else 
                    element.setAttribute(key, data[key])
                
            if('children' in data && Array.isArray(data.children))
                for(const child of data.children)
                element.appendChild(child)
        
            if('style' in data && typeof(data.style) === 'object')
                for(const property in data.style)
                    element.style[property] = data.style[property]
        }
        return element
    }

    function TextNode(content) {
        return document.createTextNode(content)  
    }

    if('DOMLib' in options || 'DomLib' in options || 'HTMLNode' in options || 'HtmlNode' in options) {
        globalThis.HTMLNode = globalThis.HtmlNode = HtmlNode
        globalThis.TextNode = TextNode
    }

    function SvgNode(type, data = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', type)
    
        if(type === 'svg') element.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    
        for(const key in data)
            if((key === 'children' && Array.isArray(data[key])) || (key === 'style' && typeof(data[key]) === 'object'))
                continue
            else if(key in element && typeof data[key] === 'function')
                element[key] = data[key]
            else 
                element.setAttribute(key, data[key])
        
        if('children' in data && Array.isArray(data.children))
            for(const child of data.children)
                element.appendChild(child)
    
        if('style' in data && typeof(data.style) === 'object')
           for(const property in data.style)
                element.style[property] = data.style[property]
    
        return element
    }

    if('DOMLib' in options || 'DomLib' in options || 'SVGNode' in options || 'SVGNode' in options) {
        globalThis.SVGNode = globalThis.SvgNode = SvgNode
    }

    if('rasterizeSVG' in options) globalThis.rasterizeSVG = function(svg, callback) {
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        const img = HtmlNode('img', {
            style: {
                opacity: 0
            },
            onload: function () {
                const canvas = HtmlNode('canvas', {
                    width: img.clientWidth,
                    height: img.clientHeight
                })
                const canvasCtx = canvas.getContext('2d')
                canvasCtx.drawImage(img, 0, 0)
                const data = canvas.toDataURL('image/png')
                callback(data)
                document.body.removeChild(img)
                URL.revokeObjectURL(url)
            }
        })
        document.body.appendChild(img)
        img.src = url
    }
})();
