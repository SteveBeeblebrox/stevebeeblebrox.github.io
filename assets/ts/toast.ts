const toast = (function() {
    const div = document.createElement('div');
    window.addEventListener('load', () => document.body.appendChild(div));
    
    const shadowRoot = div.attachShadow({mode: 'closed'});
    shadowRoot.appendChild(Object.assign(document.createElement('style'), {
        textContent: `
            :host {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: flex;
                justify-content: center;
                font-family: Arial;
                pointer-events: none;
            }
            :host>span {
                transition: opacity 0.15s linear;
                align-self: flex-end;
                margin-bottom: 1em;
                border-radius: 99999px;
                z-index: 99999;
                background-color: rgba(1.0, 1.0, 1.0, 0.25);
                padding: 0.5em 1em;
                pointer-events: all;
                cursor: pointer;
                opacity: 0;
            }
        `
    }));
    const span = document.createElement('span')
    shadowRoot.appendChild(span);
    
    const durations = {
        'short': 1000,
        'medium': 2000,
        'long': 5000
    }

    const pendingToasts: Promise<void>[] = [];
    
    let resetTimeout = -1;
    function toast(text: string, duration: 'short' | 'medium' | 'long' = 'short') {
        return new Promise<void>(function(resolveReturn) {
            window.requestAnimationFrame(async function() {
                await Promise.all(pendingToasts);
                clearTimeout(resetTimeout)
                pendingToasts.push(new Promise(function(resolveCompleted) {
                    span.textContent = text;
                    span.style.opacity = '1.0';
                    setTimeout(function() {
                        span.style.opacity = '0.0';
                        resetTimeout = setTimeout(function() {
                            span.textContent = '';
                            resolveReturn();
                        }, 250);
                    pendingToasts.shift();
                    resolveCompleted();
                    }, durations[duration] + 250);
                }));
            });
        });
    }

    return toast;
})();