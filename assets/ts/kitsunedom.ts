/*
 * MIT License
 * 
 * Copyright (c) 2023 S. Beeblebrox
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
(function () {
    const __attachShadow__ = Element.prototype.attachShadow, shadowRoots: ShadowRoot[] = [];
    let globalAdoptedStyleSheets: CSSStyleSheet[] = [];

    Element.prototype.attachShadow = function attachShadow(...args) {
        const rValue = __attachShadow__.bind(this)(...args);
        shadowRoots.push(this.shadowRoot!);
        this.shadowRoot!.adoptedStyleSheets = [...this.shadowRoot!.adoptedStyleSheets, ...globalAdoptedStyleSheets];
        return rValue;
    }

    Object.defineProperty(document, 'kitsuneGlobalAdoptedStyleSheets', {
        get() {
            return globalAdoptedStyleSheets;
        },
        set(value: CSSStyleSheet[]) {
            globalAdoptedStyleSheets = [...value];
            for (const d of [document, ...shadowRoots])
                d.adoptedStyleSheets = [...new Set([...d.adoptedStyleSheets, ...globalAdoptedStyleSheets])];
        }
    });
    Object.defineProperty(document, 'kitsuneShadowRoots', {
        get() {
            return shadowRoots;
        }
    });
    Object.defineProperty(document, 'kitsunedom', {
        value: true
    });
})();

declare interface Document {
    kitsuneGlobalAdoptedStyleSheets: CSSStyleSheet[];
    kitsuneShadowRoots: ShadowRoot[];
    kitsunedom: true;
}