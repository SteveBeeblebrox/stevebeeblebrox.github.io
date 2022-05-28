namespace Elements {
    export function Shadow(_, ...children: Node[]): Element {
        const element = JSX.createElement('span');
        element.attachShadow({mode: 'open'});
        element.shadowRoot!.replaceChildren(...children);
        return element;
    }
}