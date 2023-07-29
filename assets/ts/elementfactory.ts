namespace ElementFactory {
    export function define(name: `${string}-${string}`, {parentTagName,attributes=Object.create(null),cssVars=Object.create(null),onRender,onConnect,eventListeners=Object.create(null),stylesheet,extraProperties=Object.create(null)}: {
        parentTagName?: string, // An html tag name to inherit from, if set use <parent is="name"></parent> instead of <name></name>
        attributes?: {[key: `data-${string}`]: string | boolean},
        cssVars?: {[key: string]: string | null},
        onRender?: ()=>void, // Called when element children or attribute changes
        onConnect?: ()=>void, // Called when attached to DOM
        eventListeners?:{[key in keyof HTMLElementEventMap]: ((event: Event)=>void) | (()=>void)},
        stylesheet?: string, // Style sheet for this object, if Kitsune DOM is avalible, this pierces shadows
        extraProperties?: object // Use to add extra properties, getters, setters, etc... to the element
    } = {} as any) {
        const attributeMap = new Map(Object.entries(attributes)) as Map<`data-${string}`, any>;
        const parentClass: typeof HTMLElement = parentTagName ? Object.getPrototypeOf(document.createElement(parentTagName)).constructor : HTMLElement;
        
        if(stylesheet) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(stylesheet);
            if('KitsuneDOM' in globalThis) {
                KitsuneDOM.globalAdoptedStyleSheets = [...KitsuneDOM.globalAdoptedStyleSheets, sheet]
            } else {
                document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
            }
        }

        function toCamelCase(text: string) {
            return text.replace(/^data-/,'').replace(/-./g,match=>match.substring(1).toUpperCase())
        }
        function fromCamelCase(text: string) {
            return text.replace(/[A-Z]/g,match=>'-'+match.toLowerCase())
        }
        
        window.customElements.define(`${name}`, class extends parentClass {
            #attributes: Map<string, any>;
            #observer: MutationObserver;
    
            constructor() {
                super();
                this.#attributes = new Map(attributeMap.entries());
    
                const _render = () => {
                    this.#observer.disconnect()
                    onRender?.bind(this)?.()
                    window.requestAnimationFrame(()=>this.#observer.observe(this, {attributes: true, childList: true, subtree: true, characterData: true}))
                }
    
                this.#observer = new MutationObserver(onRender ? _render : function(){});
    
                for(const [key, defaultValue] of this.#attributes.entries()) {
                    Object.defineProperty(this, toCamelCase(key), {
                        get() {
                            return this.#attributes.get(key)
                        },
                        set(newValue: any) {
                            if((newValue===null||newValue===false) && typeof defaultValue === 'boolean') {
                                this.removeAttribute(key);
                                newValue = false;
                            } else if(typeof defaultValue === 'boolean') {
                                this.setAttribute(key, '');
                                newValue = true;
                            } else {
                                this.setAttribute(key, newValue);
                            }

                            if(onRender)
                                    window.requestAnimationFrame(_render.bind(this));
                            
                            return this.#attributes.set(key, newValue).get(key);
                        }
                    });
                }

                for(const [key, defaultValue] of Object.entries(cssVars)) {
                    this.style.setProperty('--'+key, defaultValue);
                    Object.defineProperty(this, toCamelCase(key), {
                        get() {
                            if(typeof defaultValue === 'number')
                                return +this.style.getPropertyValue('--'+key);
                            else
                                return this.style.getPropertyValue('--'+key);
                        },
                        set(newValue: any) {
                            this.style.setProperty('--'+key, newValue);
                            if(typeof defaultValue === 'number')
                                return +this.style.getPropertyValue('--'+key);
                            else
                                return this.style.getPropertyValue('--'+key);
                        }
                    });
                }

                for(const [event, listener] of Object.entries(eventListeners)) {
                    this.addEventListener(event,e=>listener(e));
                }

                Object.defineProperties(this, Object.getOwnPropertyDescriptors(extraProperties));
            }
    
            attributeChangedCallback(name: `data-${string}`, oldValue: any, newValue: any) {
                if(oldValue === newValue) return;
                this.#attributes.set(fromCamelCase(name), typeof new Map(Object.entries(attributes)).get(name)  === 'boolean' ? newValue !== null : newValue);
            }
    
            connectedCallback() {
                for(const attribute of this.#attributes.keys())
                    if(this.hasAttribute(attribute)) this.#attributes.set(attribute, this.getAttribute(attribute))
                
                if(onRender) {
                    this.#observer.observe(this, {attributes: true, childList: true, subtree: true, characterData: true})
                    window.requestAnimationFrame(() => {
                        this.#observer.disconnect()
                        onRender?.bind(this)?.()
                        window.requestAnimationFrame(()=>this.#observer.observe(this, {attributes: true, childList: true, subtree: true, characterData: true}))
                    });
                }
                if(onConnect)
                    window.requestAnimationFrame(onConnect.bind(this));
            }
    
            disconnectedCallback() {
                if(!onRender) return;
                this.#observer.disconnect()
            }
    
            static get observedAttributes() {
                return [...attributeMap.keys()];
            }
        }, parentTagName ? {extends: parentTagName} : {});
    
        return window.customElements.get(name);
    }
}