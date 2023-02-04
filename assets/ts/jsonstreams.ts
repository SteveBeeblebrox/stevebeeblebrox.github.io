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
class JSONStreamParser extends TransformStream {
    constructor({ skipErrors = false, parseJSON = JSON.parse } = {}) {
        let backlog: string = '', ready = false, enqueueBacklog = (controller: TransformStreamDefaultController) => {
            try {
                controller.enqueue(parseJSON(backlog.replace(/,\s*$/, '')));
            } catch (error) {
                if (!skipErrors)
                    controller.error(error);
            }
            backlog = '';
        };
        super({
            transform(chunk, controller) {
                if (!ready) {
                    // Skip initial whitespace or first '['
                    if (/^[\s\[]$/.test(chunk)) return;
                    ready = true;
                }

                backlog += chunk;

                // Two newlines delimit end of entry, ignore trailing comma
                if (/(?:\r?\n){2}$/.test(backlog) && backlog.trim()) {
                    enqueueBacklog(controller);
                }

                // When entry is a ']', end stream
                if (backlog.trim() === ']')
                    controller.terminate();
            },
            flush(controller) {
                // Try parsing whatever is left
                if (backlog.trim())
                    enqueueBacklog(controller);
                backlog = '';
            }
        })
    }
}

class JSONStreamStringifier extends TransformStream {
    constructor({ skipErrors = false, stringifyJSON = JSON.stringify, endl = '\n' as '\n' | '\r\n' } = {}) {
        let backlog: any = undefined, ready = false, enqueueBacklog = (controller: TransformStreamDefaultController) => {
            try {
                controller.enqueue((ready ? ',' : '') + endl.repeat(2) + stringifyJSON(backlog));
                ready = true;
            } catch (error) {
                if (!skipErrors)
                    controller.error(error);
            }
        };
        super({
            start(controller) {
                controller.enqueue('[');
            },
            transform(chunk, controller) {
                if (backlog !== undefined)
                    enqueueBacklog(controller);
                backlog = chunk;
            },
            flush(controller) {
                if (backlog !== undefined)
                    enqueueBacklog(controller);
                backlog = undefined;
                controller.enqueue(endl.repeat(2) + ']');
            }
        })
    }
}