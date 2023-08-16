/*
 * MIT License
 * 
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
(function() {
    const options: {[option: string]: string} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries().map(([key, value]: [string, string]) => [key, value || 'true'])]) : {});

    const apiEndpoint = options.target || (()=>{throw new Error('Query parameter "target" is required for error reporting!')})();
    const lsKey = `Recent error reports to  ${options.group || apiEndpoint}`;
    const rate = options.rate?.match(/^(?<messages>\d+)\/(?<duration>\d+(?:\.\d+)?)?(?<unit>min(?:ute)?|hour|hr|d(?:ay)?)$/)?.groups ?? {messages: 3, duration: 1, unit: 'minute', deltaMS: undefined};
    rate.duration ??= 1;
    const unitText = {'min': 'minute', 'd': 'day', 'hr': 'hour'}[rate.unit] ?? rate.unit;
    const unitScaleFactor = (function({unit}) {
        let t = 1;
        switch(unit) {
            case 'd':
            case 'day':
                t*=24;
            case 'hr':
            case 'hour':
                t*=60;
            case 'min':
            case 'minute':
                t*=60;
        }
        return t;
    })(rate);
    
    rate.deltaMS = +rate.duration * unitScaleFactor * 1000;

    console.log(`Reporting errors to ${apiEndpoint} (Rate: ${rate.messages}/${rate.duration} ${unitText}${rate.duration !== 1 ? 's' : ''}${options.group ? ` Group: ${options.group}` : ''})`);

    function shiftChar(char: string, base: string, to: string): string {
        return String.fromCharCode(0xD835,char.charCodeAt(0)+(to.charCodeAt(1)-base.charCodeAt(0)))
    }

    function bold(text: string) {
        if(options.plaintext !== undefined) return text;
        return text.replace(/[a-z]/g,char=>shiftChar(char,'a','𝗮'))
            .replace(/[A-Z]/g,char=>shiftChar(char,'A','𝗔'))
            .replace(/\d/g,char=>shiftChar(char,'1','𝟭'));
    }

    async function queueErrorReport(...args: Parameters<typeof sendErrorReport>): ReturnType<typeof sendErrorReport> {
        return await navigator.locks.request(lsKey, async (lock) => {
            return await sendErrorReport(...args);
        });
    }

    async function sendErrorReport({message, lineno, colno, filename = '<unknown>', stack}: {message?: string, lineno?: number | string, colno?: number | string, filename?: string, stack?: string} = {}) {
        const sendLog: Date[] = (localStorage.getItem(lsKey) ?? '').split(';').flatMap((t: string) => t ? [new Date(parseInt(t,36))] : []), now = Date.now();

        if(!(sendLog.filter(d => now - +d < +rate.deltaMS).length < +rate.messages))
            return;

        const browser = navigator.userAgentData?.brands.at(-1);
        const body = 
`${stack ?? message}

${bold('URL')}: ${window.location}
${bold('Source')}: ${filename}${lineno !== undefined ? ` (${lineno}${colno !== undefined ? ':' + colno : ''})` : ''}
${bold('Time')}: ${new Date()}
${bold('Browser')}: ${browser ? browser.brand : '<unknown>'} ${browser ? browser.version : ''}
${bold('Platform')}: ${navigator.userAgentData?.platform ?? '<unknown>'}
${bold('Mobile')}: ${navigator.userAgentData?.mobile ?? '<unknown>'}
${bold('Group')}: ${options.group ?? '<default>'}`
            .replace(/^ +/gm, match => '\u00a0'.repeat(match.length));
        ;

        sendLog.push(new Date());
        sendLog.splice(0, Math.max(0,sendLog.length - +rate.messages));

        localStorage.setItem(lsKey, sendLog.map(d => (+d).toString(36)).join(';'));

        await fetch(apiEndpoint, {
            method: 'POST',
            body,
            headers: {
                'Tag': 'triangular_flag_on_post',
                'Title': 'Runtime Error'
            }
        });
    }
    window.addEventListener('error', async function(event) {
        let {message,lineno,colno,filename} = event, stack = undefined;
        
        if(event.error === undefined)
            message = '<unknown error>';
        else
            stack = 'Uncaught ' + event.error.stack;
        queueErrorReport({message, lineno, colno, filename, stack});
    });

    window.addEventListener('unhandledrejection', function(event) {
        queueErrorReport({
            message: event.reason === undefined ? '<unknown error>' : 'Uncaught ' + event.reason,
            filename: '<promise>',
            stack: event.reason?.stack ? 'Uncaught ' + event.reason.stack : undefined
        });
    });
})();