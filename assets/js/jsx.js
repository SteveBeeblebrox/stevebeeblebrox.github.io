var JSX;
(function (JSX) {
    class StateBase {
        constructor() {
            this.callbacks = [];
        }
        connectCallback(callback) {
            this.callbacks.push(callback);
            callback(this.get());
        }
        disconnectCallback(callback) {
            this.callbacks.splice(this.callbacks.indexOf(callback), 1);
        }
        connectWeakCallback(weakCaptures, weakCallback) {
            const weakrefs = weakCaptures.map(o => new WeakRef(o)), state = this;
            state.connectCallback(function callback(t) {
                const refs = weakrefs.map(o => o.deref());
                if (refs.some(o => o === undefined))
                    state.disconnectCallback(callback);
                else
                    weakCallback(t, ...refs);
            });
        }
    }
    class State extends StateBase {
        constructor(value) {
            super();
            this.value = value;
        }
        get() {
            return this.value;
        }
        set(t) {
            this.value = t;
            this.callbacks.forEach((f) => {
                f(this.get());
            });
            return this.value;
        }
        consume(path, argIndex) {
            const state = this;
            return function () {
                state.set(path.split('.').reduce((acc, key) => acc[key], argIndex !== undefined ? arguments[argIndex] : this));
            };
        }
        consumeEvent(path) {
            return this.consume(path, 0);
        }
        format(formatter) {
            const stateFormatter = new StateFormatter(this, formatter);
            this.connectCallback(stateFormatter.update.bind(stateFormatter));
            return stateFormatter;
        }
    }
    JSX.State = State;
    class StateFormatter extends StateBase {
        constructor(state, formatter) {
            super();
            this.state = state;
            this.formatter = formatter;
        }
        update() {
            this.callbacks.forEach((f) => {
                f(this.get());
            });
        }
        set(t) {
            return this.state.set(t);
        }
        get() {
            return this.formatter(this.state.get());
        }
        consume(path, argIndex) {
            return this.state.consume(path, argIndex);
        }
        consumeEvent(path) {
            return this.state.consumeEvent(path);
        }
    }
    JSX.createState = function createState(t) {
        return new State(t);
    };
    JSX.createElement = (function () {
        function createElement(tag, properties, ...children) {
            if (typeof tag === 'function')
                return tag(properties, ...children.map(o => o instanceof HTMLCollection ? [...o] : o).flat());
            const element = (function () {
                switch (tag) {
                    case null: return document.createDocumentFragment();
                    case 'svg': return document.createElementNS('http://www.w3.org/2000/svg', tag);
                    case 'math': return document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
                    default: return document.createElement(tag);
                }
            })();
            if (element instanceof Element) {
                if (tag === 'svg')
                    element.setAttribute('xmlsn', 'http://www.w3.org/2000/svg');
                else if (tag === 'math')
                    element.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
                const prototype = Object.getPrototypeOf(element);
                for (const [key, value] of Object.entries(properties !== null && properties !== void 0 ? properties : {})) {
                    if (key === 'style' && typeof value === 'object' && key in prototype)
                        for (const [property, style] of (value instanceof Map ? value.entries() : Object.entries(value)))
                            Reflect.set(Reflect.get(element, key), property, style);
                    else if ((key === 'classList' || key === 'classlist' && key in prototype) || key === 'class' && Array.isArray(value))
                        element.classList.add(...value);
                    else if (key in prototype && value instanceof StateBase)
                        value.connectWeakCallback([element], (t, element) => Reflect.set(element, key, t));
                    else if (key in prototype)
                        Reflect.set(element, key, value);
                    else if (value instanceof StateBase)
                        value.connectWeakCallback([element], (t, element) => element.setAttribute(key, t));
                    else
                        element.setAttribute(key, value);
                }
            }
            for (let child of children.flat()) {
                if (child instanceof HTMLCollection) {
                    element.append(...child);
                    continue;
                }
                if (child instanceof StateBase) {
                    const text = document.createTextNode('');
                    child.connectWeakCallback([text], (t, text) => text.textContent = t);
                    child = text;
                }
                element.append(child);
            }
            return element;
        }
        return createElement;
    })();
})(JSX || (JSX = {}));
