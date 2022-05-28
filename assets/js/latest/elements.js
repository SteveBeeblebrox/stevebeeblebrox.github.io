var Elements;
(function (Elements) {
    function Shadow(_, ...children) {
        const element = JSX.createElement('span');
        element.attachShadow({ mode: 'open' });
        element.shadowRoot.replaceChildren(...children);
        return element;
    }
    Elements.Shadow = Shadow;
})(Elements || (Elements = {}));
