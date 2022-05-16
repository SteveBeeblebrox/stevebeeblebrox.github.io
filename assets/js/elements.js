var Elements;
(function (Elements) {
    function Shadow(_, ...children) {
        const element = JSX.createElement('span');
        element.attachShadow({ mode: 'open' });
        element.shadowRoot.replaceChildren(...children);
        return element;
    }
    Elements.Shadow = Shadow;
    ElementFactory.define('select-menu', { connect() {
            let select, selectMenu = this;
            this.replaceChildren(select = JSX.createElement("select", null, this.children));
            select.style.width = `${select.$self `option[hidden]`.value.length}ch`;
            const textLen = Math.max(...select.$$self `option`.$toArray().map(o => o.textContent.length));
            const keybindLen = Math.max(...select.$$self `option[data-keybind]`.$toArray().map(o => { var _a; return ((_a = o.getAttribute('data-keybind')) !== null && _a !== void 0 ? _a : '').length; }));
            $$it.$forEach(o => {
                o.textContent = o.textContent.padEnd(textLen + 2, '\u00a0') + (o.hasAttribute('data-keybind') ? `(${o.getAttribute('data-keybind')})` : '').padStart(keybindLen + 2, '\u00a0');
            });
            select.$on('change', function () {
                var _a, _b, _c, _d;
                const value = select.value;
                select.value = select.$self `option[hidden]`.value;
                const keybind = (_b = (_a = $ `option[value=${value}]`) === null || _a === void 0 ? void 0 : _a.getAttribute) === null || _b === void 0 ? void 0 : _b.call(_a, 'data-keybind');
                const action = `${select.$self `option[hidden]`.value}.${value}`;
                const actions = (_c = eval(selectMenu.getAttribute('data-actions'))) !== null && _c !== void 0 ? _c : new Map();
                const keybindings = (_d = eval(selectMenu.getAttribute('data-keybindings'))) !== null && _d !== void 0 ? _d : new Map();
                if (keybind) {
                    if (keybindings.has(keybind))
                        keybindings.get(keybind)();
                    else
                        console.warn('Unbound Keybind', keybind, 'in menu for action', action);
                }
                else if (actions.has(action)) {
                    actions.get(action)();
                }
                else {
                    console.warn('Unbound Menu Action', action);
                }
            });
        } });
})(Elements || (Elements = {}));
