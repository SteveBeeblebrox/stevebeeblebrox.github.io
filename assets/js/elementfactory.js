var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var ElementFactory;
(function (ElementFactory) {
    function define(name, { attributes = new Map(), stylesheet, render, connect } = {}) {
        var _a;
        var _attributes, _observer, _b;
        if (stylesheet) {
            let styleElement = Object.assign(document.createElement('style'), { textContent: stylesheet });
            document.implementation.createHTMLDocument().body.appendChild(styleElement);
            const sheet = styleElement.sheet;
            for (const rule of Object.values([...sheet.cssRules])) {
                let split = rule.cssText.split('{');
                let selector = ((_a = split.shift()) !== null && _a !== void 0 ? _a : '').replace(/:scope/g, name), properties = split.join('{');
                sheet.insertRule(`${selector} {${properties}`, sheet.cssRules.length);
                sheet.deleteRule(0);
            }
            document.head.appendChild(Object.assign(document.createElement('style'), { textContent: [...sheet.cssRules].map(rule => rule.cssText).join(' ') }));
        }
        window.customElements.define(`${name}`, (_b = class extends HTMLElement {
                constructor() {
                    var _a, _b;
                    super();
                    _attributes.set(this, void 0);
                    _observer.set(this, void 0);
                    __classPrivateFieldSet(this, _attributes, new Map(attributes.entries()), "f");
                    const _render = render;
                    render = () => {
                        var _a;
                        __classPrivateFieldGet(this, _observer, "f").disconnect();
                        (_a = _render === null || _render === void 0 ? void 0 : _render.bind(this)) === null || _a === void 0 ? void 0 : _a();
                        window.requestAnimationFrame(() => __classPrivateFieldGet(this, _observer, "f").observe(this, { attributes: true, childList: true, subtree: true, characterData: true }));
                    };
                    __classPrivateFieldSet(this, _observer, new MutationObserver((_b = (_a = render === null || render === void 0 ? void 0 : render.bind) === null || _a === void 0 ? void 0 : _a.call(render, this)) !== null && _b !== void 0 ? _b : function () { }), "f");
                    for (const [key, defaultValue] of __classPrivateFieldGet(this, _attributes, "f").entries()) {
                        Object.defineProperty(this, key, {
                            get() {
                                return __classPrivateFieldGet(this, _attributes, "f").get(key);
                            },
                            set(newValue) {
                                if (!newValue && typeof defaultValue === 'boolean')
                                    this.removeAttribute(key);
                                else
                                    this.setAttribute(key, newValue);
                                if (render)
                                    window.requestAnimationFrame(render.bind(this));
                                return __classPrivateFieldGet(this, _attributes, "f").set(key, newValue).get(key);
                            }
                        });
                    }
                }
                attributeChangedCallback(name, oldValue, newValue) {
                    if (oldValue === newValue)
                        return;
                    __classPrivateFieldGet(this, _attributes, "f").set(name, typeof attributes.get(name) === 'boolean' ? !!newValue : newValue);
                }
                connectedCallback() {
                    for (const attribute of __classPrivateFieldGet(this, _attributes, "f").keys())
                        if (this.hasAttribute(attribute))
                            __classPrivateFieldGet(this, _attributes, "f").set(attribute, this.getAttribute(attribute));
                    const _render = render;
                    render = () => {
                        var _a;
                        __classPrivateFieldGet(this, _observer, "f").disconnect();
                        (_a = _render === null || _render === void 0 ? void 0 : _render.bind(this)) === null || _a === void 0 ? void 0 : _a();
                        window.requestAnimationFrame(() => __classPrivateFieldGet(this, _observer, "f").observe(this, { attributes: true, childList: true, subtree: true, characterData: true }));
                    };
                    if (render) {
                        __classPrivateFieldGet(this, _observer, "f").observe(this, { attributes: true, childList: true, subtree: true, characterData: true });
                        window.requestAnimationFrame(render.bind(this));
                    }
                    if (connect)
                        window.requestAnimationFrame(connect.bind(this));
                }
                disconnectedCallback() {
                    if (!render)
                        return;
                    __classPrivateFieldGet(this, _observer, "f").disconnect();
                }
                static get observedAttributes() { return Object.keys(attributes); }
            },
            _attributes = new WeakMap(),
            _observer = new WeakMap(),
            _b));
        return window.customElements.get(name);
    }
    ElementFactory.define = define;
})(ElementFactory || (ElementFactory = {}));
