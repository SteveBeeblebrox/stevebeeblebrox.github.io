ElementFactory.define('sortable-list',{
    extraProperties: {selected: null},
    onRender() {
        function isBefore(element1, element2) {
            if (element2.parentNode === element1.parentNode)
                for (let current = element1.previousSibling; current; current = current.previousSibling)
                    if (current === element2)
                        return true;
            return false;
        }
        this.querySelectorAll('li:not([draggable="true"],[data-sortable-li="false"])').forEach(li => {
            li.draggable = true;
            li.addEventListener('dragstart', event => {
                if(!(event.target instanceof HTMLLIElement))
                    return;
                    
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', event.target.textContent);
                this.selected = event.target;
            });
            li.addEventListener('dragover', event => {                    
                if(!this.selected || !(event.target instanceof HTMLLIElement))
                    return;

                event.preventDefault();

                if (isBefore(this.selected, event.target))
                    event.target.parentNode.insertBefore(this.selected, event.target);
                else
                    event.target.parentNode.insertBefore(this.selected, event.target.nextSibling);
            });
            li.addEventListener('dragend', () => this.selected = null);
            li.setAttribute('data-sortable-li','');
        });
        this.querySelectorAll('ul').forEach(ul => {
            ul.addEventListener('dragover', event => {
                if(!this.selected || !(event.target instanceof HTMLUListElement)) {
                    event.dataTransfer.effectAllowed = 'none';
                    return;
                }

                event.preventDefault();
                
                event.target.appendChild(this.selected);
            });
        });
    }
});

ElementFactory.define('shadow-root', {
    onConnect() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.replaceChildren(...this.children);
    }
});