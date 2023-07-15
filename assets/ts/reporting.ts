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
    const options: {[option: string]: string} = Object.freeze(document.currentScript ? Object.fromEntries([...new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries()]) : {debug: 'true'});

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

    async function sendErrorReport({message, lineno, colno, filename = '<unknown>'}: {message?: string, lineno?: number | string, colno?: number | string, filename?: string} = {}) {
        const sendLog: Date[] = (localStorage.getItem(lsKey) ?? '').split(';').flatMap((t: string) => t ? [new Date(parseInt(t,36))] : []), now = Date.now();

        if(!(sendLog.filter(d => now - +d < +rate.deltaMS).length < +rate.messages))
            return;

        const browser = navigator.userAgentData?.brands.at(-1);
        const body = 
`${message}

URL: ${window.location}
Source: ${filename}${lineno !== undefined ? ` (${lineno}${colno !== undefined ? ':' + colno : ''})` : ''}
Time: ${new Date()}
Browser: ${browser ? browser.brand : '<unknown>'} ${browser ? browser.version : ''}
Platform: ${navigator.userAgentData?.platform ?? '<unknown>'}
Mobile: ${navigator.userAgentData?.mobile ?? '<unknown>'}`
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
        let {message,lineno,colno,filename} = event;
        if(event.error === undefined)
            message = '<unknown error>'
        sendErrorReport({message, lineno, colno, filename});
    });

    window.addEventListener('unhandledrejection', function(event) {
        sendErrorReport({
            message: event.reason === undefined ? '<unknown error>' : 'Uncaught ' + event.reason,
            filename: '<promise>'
        });
    });
})();