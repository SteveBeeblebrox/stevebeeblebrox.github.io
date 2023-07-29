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
function JSX(strings: TemplateStringsArray, ...args: any[]): Node {
    const UNC = '\u{10ffff}';
    if(strings.some(str=>str.includes(UNC))) {
        throw new Error('JSX Parser Error: Invalid Unicode Noncharacter present in source');
    }

    const document = new DOMParser().parseFromString(String.raw(strings, ...args.map((o,i)=>UNC+i+UNC)).trim(), 'text/xml');
    
    let error: Element | null;
    if(error = document.querySelector('parsererror')) {
        throw new Error(`JSX Parser Error: ${error.querySelector('div')?.innerText ?? 'Unexpected error'}`);
    }

    const MATCH = /\u{10ffff}(\d+)\u{10ffff}/gu, BOUND_CHECKED = /^\u{10ffff}(\d+)\u{10ffff}$/u, SPLITTER = /(\u{10ffff}\d+\u{10ffff})/ug;

    function formatString(str: string | undefined | null = '') {
        return (str ?? '').replace(MATCH, (_,$1) => args[+$1])
    }

    function reduce(node: Node | string): Node[] {
        let t;
        if(node instanceof Element) {
            const properties = new Map<string,unknown>();
            for(const attr of node.attributes) {
                properties.set(
                    formatString(attr.name),
                    (t = attr.value.match(BOUND_CHECKED)) ?  args[+t[1]] : formatString(attr.value)
                );
            }
            return [JSX.createElement(node.tagName as keyof HTMLElementTagNameMap, properties, ...[...node.childNodes].flatMap(reduce))];
        } else if(node instanceof Text) {
            return (node.textContent??'').split(SPLITTER).flatMap(reduce);
        } else if(typeof node === 'string') {
            if(!(node?.trim())) return [];
            else if(t = node.match(BOUND_CHECKED)) return [args[+t[1]]];
            else return [new Text(node)];
        } else {
            return [];
        }
    }

    return reduce(document.documentElement)[0];
}
