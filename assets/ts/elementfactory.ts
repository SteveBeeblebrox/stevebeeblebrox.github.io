namespace ElementFactory {
    export function define(name: `${string}-${string}`, {attributes=new Map(),render,connect,on}: {attributes?: Map<`data-${string}`,any>,render?:()=>void,connect?:()=>void,on?:Map<keyof HTMLElementEventMap, ((event: Event)=>void) | (()=>void)>} = {} as any) {
        window.customElements.define(`${name}`, class extends HTMLElement {
            #attributes: Map<string, any>;
            #observer: MutationObserver;
    
            constructor() {
                super();
                this.#attributes = new Map(attributes.entries());
    
                const _render = render
                render = () => {
                    this.#observer.disconnect()
                    _render?.bind(this)?.()
                    window.requestAnimationFrame(()=>this.#observer.observe(this, {attributes: true, childList: true, subtree: true, characterData: true}))
                }
    
                this.#observer = new MutationObserver(render?.bind?.(this) ?? function() {});
    
                for(const [key, defaultValue] of this.#attributes.entries()) {
                    Object.defineProperty(this, key, {
                        get() {
                            return this.#attributes.get(key)
                        },
                        set(newValue: any) {
                            if(!newValue && typeof defaultValue === 'boolean')
                                this.removeAttribute(key);
                            else
                                this.setAttribute(key, newValue);
                            
                            if(render)
                                window.requestAnimationFrame(render.bind(this));
    
                            return this.#attributes.set(key, newValue).get(key)
                        }
                    });
                }

                for(const [event, listener] of on?.entries()??[]) {
                    this.addEventListener(event,e=>listener(e));
                }
            }
    
            attributeChangedCallback(name: `data-${string}`, oldValue: any, newValue: any) {
                if(oldValue === newValue) return;
                this.#attributes.set(name, typeof attributes.get(name)  === 'boolean' ? !!newValue : newValue);
            }
    
            connectedCallback() {
                for(const attribute of this.#attributes.keys())
                    if(this.hasAttribute(attribute)) this.#attributes.set(attribute, this.getAttribute(attribute))
                
                const _render = render
                render = () => {
                    this.#observer.disconnect()
                    _render?.bind(this)?.()
                    window.requestAnimationFrame(()=>this.#observer.observe(this, {attributes: true, childList: true, subtree: true, characterData: true}))
                }
                
                if(render) {
                    this.#observer.observe(this, {attributes: true, childList: true, subtree: true, characterData: true})
                    window.requestAnimationFrame(render.bind(this));
                }
                if(connect)
                    window.requestAnimationFrame(connect.bind(this));
            }
    
            disconnectedCallback() {
                if(!render) return;
                this.#observer.disconnect()
            }
    
            static get observedAttributes() {
                return [...attributes.keys()];
            }
        });
    
        return window.customElements.get(name);
    }
}