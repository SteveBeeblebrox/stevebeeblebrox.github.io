namespace Elements {
    export function Shadow(_, ...children: Node[]): Element {
        const element = JSX.createElement('span');
        element.attachShadow({mode: 'open'});
        element.shadowRoot!.replaceChildren(...children);
        return element;
    }

    ElementFactory.define('select-menu', {connect() {
        let select, selectMenu = this;
        this.replaceChildren(select=<select>{this.children}</select>)
        select.style.width=`${select.$self`option[hidden]`.value.length}ch`
        const textLen = Math.max(...select.$$self`option`.$toArray().map(o=>o.textContent.length))
        const keybindLen = Math.max(...select.$$self`option[data-keybind]`.$toArray().map(o=>(o.getAttribute('data-keybind')??'').length))
        
        $$it.$forEach(o=> {
            o.textContent = o.textContent.padEnd(textLen+2,'\u00a0') + (o.hasAttribute('data-keybind') ? `(${o.getAttribute('data-keybind')})` : '').padStart(keybindLen+2,'\u00a0');
        });

        select.$on('change', function() {
            const value = select.value;
            select.value = select.$self`option[hidden]`.value;
            const keybind = $`option[value=${value}]`?.getAttribute?.('data-keybind');
            const action = `${select.$self`option[hidden]`.value}.${value}`;
            const actions = eval(selectMenu.getAttribute('data-actions')) ?? new Map();
            const keybindings = eval(selectMenu.getAttribute('data-keybindings')) ?? new Map();
            if(keybind) {
                if(keybindings.has(keybind))
                    keybindings.get(keybind)();
                else
                    console.warn('Unbound Keybind', keybind, 'in menu for action', action);
            } else if(actions.has(action)) {
                actions.get(action)();
            } else {
                console.warn('Unbound Menu Action', action);
            }
        });
    }});
}