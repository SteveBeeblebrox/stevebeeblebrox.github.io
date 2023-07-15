/*
 * MIT License
 * Copyright (c) 2023 Trin Wasinger
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
function JSX(strings: TemplateStringsArray, ...args: any[]): HTMLElement {
    const UNC = '\u{10ffff}';
    if(strings.some(str=>str.includes(UNC))) {
        throw new Error('JSX Parser Error: Invalid Unicode Noncharacter present in source');
    }

    const document = new DOMParser().parseFromString(String.raw(strings, ...args.map((o,i)=>UNC+i+UNC)).trim(), 'text/xml');
    
    let error: Element | null;
    if(error = document.querySelector('parsererror')) {
        throw new Error(`JSX Parser Error: ${error.querySelector('div')?.innerText ?? 'Unexpected error'}`);
    }

    const nodes = document.createTreeWalker(document,NodeFilter.SHOW_ALL);
    let node: Node | null;

    function formatString(str: string | undefined | null = '') {
        return (str ?? '').replace(/\u{10ffff}(\d+)\u{10ffff}/gu, (_,$1) => args[+$1])
    }

    while (node = nodes.nextNode()) {
        if(node instanceof Text) {
            const PATTERN = /(\u{10ffff}\d+\u{10ffff})/ug;
            node.replaceWith(...(node.textContent??'').split(PATTERN).flatMap(function(item) {
                let t;
                if(!item) return [];
                else if(t = item.match(PATTERN)) return [args[+t[0].substring(UNC.length,t[0].length-UNC.length)]];
                else return [item];
            }));
        } else if(node instanceof Element) {
            for(const attr of node.attributes) {
                attr.value = formatString(attr.value);
            }
        }
    }

    return document.documentElement;
}