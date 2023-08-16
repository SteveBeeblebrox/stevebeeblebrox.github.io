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
(function() {
    const options: {[option: string]: string} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries().map(([key, value]: [string, string]) => [key, value || 'true'])]) : {});
    const currentScript = document.currentScript;

    (async function() {
        const src = currentScript ? Object.assign(Object.assign(document.createElement('a'), {href: currentScript.getAttribute('src')}), {search: '', hash: ''}).href : '/assets/js/githubshortcut.min.js';
        if(!('JSX' in globalThis))
            eval(await (await (fetch(
                src.replace(/(?<=\/)githubshortcut(?=\.)/, 'jsx')
            ))).text());
        
        function toTitleCase(text: string): string {
            return text.replace(/(?<!')\b([a-z])([a-z]*)\b/gi, (match, $1, $2) => match.match(/^(?:a|and|as|an|at|but|by|if|for|in|into|that|nor|of|off|on|onto|or|so|than|that|till|to|up|with|when|yet)$/) ? match : $1.toUpperCase() + $2).replace(/^[a-z]/i, match => match.toUpperCase())
        }

        function Shadow(_, ...children: Node[]): Element {
            const element = document.createElement('span');
            element.attachShadow({mode: 'open'});
            element.shadowRoot!.replaceChildren(...children);
            return element;
        }
        
        document.body.appendChild(
            <Shadow>
                <style>{`
                    a {
                        position: fixed;
                        --margin: ${options.margin ?? '1'}rem;
                        top: var(--margin);
                        right: var(--margin);
                    }
                    .top-left, .upper-left {
                        top: var(--margin);
                        left: var(--margin);
                    }
                    .top-right, .upper-right {
                        top: var(--margin);
                        right: var(--margin);
                    }
                    .bottom-left, .lower-left {
                        bottom: var(--margin);
                        left: var(--margin);
                    }
                    .bottom-right, .lower-right {
                        bottom: var(--margin);
                        right: var(--margin);
                    }
                    img {
                        opacity: 70%;
                    }
                    img:hover {
                        opacity: 85%;
                    }
                `}</style>
                <a title={`${toTitleCase(options.title?.toString?.() ?? 'View')} on GitHub`} href={`https://github.com/${options.href ?? ''}`} class={options.position ?? ''} target="_blank" rel="noopener"><img src={src.replace(/(?<=\/)js(?=\/)/, 'images').replace(/(?<=\/)githubshortcut(?:\.min)?\.js$/, 'github/mark-32.png')} alt="GitHub Mark"/></a>
            </Shadow>
        );
    })();
})();
