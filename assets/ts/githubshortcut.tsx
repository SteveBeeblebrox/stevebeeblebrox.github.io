(function() {
    const options: {[option: string]: string | boolean} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries()].map(([key,value]: [string, string]) => [key, value === 'false' ? false : value])) : {debug: true});
    const currentScript = document.currentScript;

    (async function() {
        if(!('JSX' in globalThis) && currentScript)
            eval(await (await (fetch(
                Object.assign(document.createElement('a'), {href: document.currentScript.getAttribute('src')}).pathname.replace(/(?<=.)githubshortcut/, 'jsx')
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
                <a title={`${toTitleCase(options.title?.toString?.() ?? 'View')} on GitHub`} href={`https://github.com/${options.href ?? ''}`} class={options.position ?? ''} target="_blank" rel="noopener"><img src="/assets/images/github/mark-32.png" alt="GitHub Mark"/></a>
            </Shadow>
        );
    })();
})();