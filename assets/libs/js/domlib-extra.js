/*
 * MIT License
 * 
 * Copyright (c) 2021 S. Beeblebrox
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
(function() {
    DOMLIB_EXTRA_VERSION = '1.0.0';
    Object.defineProperty(window, '$host', {get() {return document.currentScript?.parentElement}});
    [HTMLElement, SVGElement, ShadowRoot].forEach(e => Object.defineProperty(e.prototype, '$host', {get() {return this}}));
    const observer = new MutationObserver(mutations => mutations.forEach(mutation => {const node = [...mutation.addedNodes].pop(); if(node instanceof HTMLElement && !(node instanceof HTMLScriptElement)) $last = node}));
    observer.observe(document.documentElement, {childList: true, subtree: true});
    window.addEventListener('load', () => {observer.disconnect(); $last=undefined});
})();
