/*
 * MIT License
 * 
 * Copyright (c) 2022 Trin Wasinger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const toast = (function() {
    const hostSpan = document.createElement('span');
    if(document.readyState === 'complete')
      document.body.appendChild(hostSpan);
    else
      window.addEventListener('load', () => document.body.appendChild(hostSpan));
    
    const shadowRoot = hostSpan.attachShadow({mode: 'closed'});
    shadowRoot.appendChild(Object.assign(document.createElement('style'), {
        textContent: `
            :host>span {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: flex !important;
                justify-content: center;
                font-family: Arial;
                pointer-events: none;
            }
            :host>span>span {
                transition: opacity 0.15s linear;
                align-self: flex-end;
                margin-bottom: 2em;
                border-radius: 3ch;
                z-index: 99999;
                color: #444;
                background-color: rgb(245 245 245 / 85%);
                box-shadow:0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
                padding: 1.5ch 2ch;
                pointer-events: none;
                user-select: none;
                opacity: 0;
            }
            :host>span>span>span {
                --max-lines: 4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: var(--max-lines);
                -webkit-box-orient: vertical;
                max-width: 20ch;
            }
        `
    }));

    const span = document.createElement('span'); // Positioning box
    const shapeSpan = document.createElement('span'); // Toast shape
    const textSpan = document.createElement('span'); // Text box

    shapeSpan.appendChild(textSpan);
    span.appendChild(shapeSpan)
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
                    textSpan.textContent = text;
                    shapeSpan.style.opacity = '1.0';
                    setTimeout(function() {
                        shapeSpan.style.opacity = '0.0';
                        resetTimeout = setTimeout(function() {
                            textSpan.textContent = '';
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