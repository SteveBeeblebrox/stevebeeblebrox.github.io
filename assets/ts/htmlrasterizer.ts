/**
 * dom-to-image
 * (C) 2015 Anatolii Saienko & 2012 Paul Bakaus MIT Licence
 * Adapted for TypeScript
 * https://github.com/tsayen/dom-to-image/blob/master/LICENSE
 */
 namespace HTMLRasterizer {
    namespace Util {
        export const mimes: {[key: string]: string} = (function() {
            /*
             * Only WOFF and EOT mime types for fonts are 'real'
             * see http://www.iana.org/assignments/media-types/media-types.xhtml
             */
            const WOFF = 'application/font-woff';
            const JPEG = 'image/jpeg';

            return {
                'woff': WOFF,
                'woff2': WOFF,
                'ttf': 'application/font-truetype',
                'eot': 'application/vnd.ms-fontobject',
                'png': 'image/png',
                'jpg': JPEG,
                'jpeg': JPEG,
                'gif': 'image/gif',
                'tiff': 'image/tiff',
                'svg': 'image/svg+xml'
            };
        })();

        export function parseExtension(url: string) {
            const match = /\.([^\.\/]*?)$/g.exec(url);
            if (match) return match[1];
            else return '';
        }

        export function mimeType(url: string) {
            const extension = parseExtension(url).toLowerCase();
            return mimes[extension] || '';
        }

        export function isDataUrl(url: string) {
            return url.search(/^(data:)/) !== -1;
        }

        export function toBlob(canvas: HTMLCanvasElement) {
            return new Promise(function (resolve) {
                const binaryString = window.atob(canvas.toDataURL().split(',')[1]);
                const length = binaryString.length;
                const binaryArray = new Uint8Array(length);

                for (let i = 0; i < length; i++)
                    binaryArray[i] = binaryString.charCodeAt(i);

                resolve(new Blob([binaryArray], {
                    type: 'image/png'
                }));
            });
        }

        export function canvasToBlob(canvas: HTMLCanvasElement) {
            if (canvas.toBlob)
                return new Promise(function (resolve) {
                    canvas.toBlob(resolve);
                });

            return toBlob(canvas);
        }

        export function resolveUrl(url: string, baseUrl: string) {
            const doc = document.implementation.createHTMLDocument();
            const base = doc.createElement('base');
            doc.head.appendChild(base);
            const a = doc.createElement('a');
            doc.body.appendChild(a);
            base.href = baseUrl;
            a.href = url;
            return a.href;
        }

        export const uid = (function uid() {
            var index = 0;

            return function () {
                return 'u' + fourRandomChars() + index++;

                function fourRandomChars() {
                    /* see http://stackoverflow.com/a/6248722/2519373 */
                    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
                }
            };
        })();

        export function makeImage(uri: string): Promise<HTMLImageElement> {
            return new Promise(function (resolve, reject) {
                const image = new Image();
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = reject;
                image.src = uri;
            });
        }

        export function getAndEncode(url: string): Promise<string> {
            const TIMEOUT = 30000;
            if(impl.options.cacheBust) {
                // Cache bypass so we dont have CORS issues with cached images
                // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
                url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
            }

            return new Promise(function (resolve) {
                const request = new XMLHttpRequest();

                request.onreadystatechange = done;
                request.ontimeout = timeout;
                request.responseType = 'blob';
                request.timeout = TIMEOUT;
                request.open('GET', url, true);
                request.send();

                let placeholder: string | undefined;
                if(impl.options.imagePlaceholder) {
                    const split = impl.options.imagePlaceholder.split(/,/);
                    if(split && split[1]) {
                        placeholder = split[1];
                    }
                }

                function done() {
                    if (request.readyState !== 4) return;

                    if (request.status !== 200) {
                        if(placeholder) {
                            resolve(placeholder);
                        } else {
                            fail('cannot fetch resource: ' + url + ', status: ' + request.status);
                        }

                        return;
                    }

                    const encoder = new FileReader();
                    encoder.onloadend = function () {
                        const content = (encoder.result as string).split(/,/)[1];
                        resolve(content);
                    };
                    encoder.readAsDataURL(request.response);
                }

                function timeout() {
                    if(placeholder) {
                        resolve(placeholder);
                    } else {
                        fail('timeout of ' + TIMEOUT + 'ms occured while fetching resource: ' + url);
                    }
                }

                function fail(message: string) {
                    console.error(message);
                    resolve('');
                }
            });
        }

        export function dataAsUrl(content: string, type: string) {
            return 'data:' + type + ';base64,' + content;
        }

        export function escape(string: string) {
            return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
        }

        export function delay(ms: number) {
            return function<T>(arg: T): Promise<T> {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(arg);
                    }, ms);
                });
            };
        }

        export function asArray<T>(arrayLike: {length: number, [key: number]: T}): T[] {
            const array = [];
            const length = arrayLike.length;
            for (let i = 0; i < length; i++) array.push(arrayLike[i]);
            return array;
        }

        export function escapeXhtml(string: string) {
            return string.replace(/#/g, '%23').replace(/\n/g, '%0A');
        }

        export function width(node: HTMLElement) {
            const leftBorder = px(node, 'border-left-width');
            const rightBorder = px(node, 'border-right-width');
            return node.scrollWidth + leftBorder + rightBorder;
        }

        export function height(node: HTMLElement) {
            const topBorder = px(node, 'border-top-width');
            const bottomBorder = px(node, 'border-bottom-width');
            return node.scrollHeight + topBorder + bottomBorder;
        }

        export function px(node: HTMLElement, styleProperty: string) {
            const value = window.getComputedStyle(node).getPropertyValue(styleProperty);
            return parseFloat(value.replace('px', ''));
        }
    }
    namespace Inliner {
        const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

        export const impl = {
            readUrls: readUrls,
            inline: inline
        }

        export function shouldProcess(string: string) {
            return string.search(URL_REGEX) !== -1;
        }

        function readUrls(string: string) {
            const result = [];
            let match;
            while ((match = URL_REGEX.exec(string)) !== null) {
                result.push(match[1]);
            }
            return result.filter(function (url) {
                return !Util.isDataUrl(url);
            });
        }

        function inline(string: string, url: string, baseUrl?: string, get?: typeof Util.getAndEncode) {
            return Promise.resolve(url)
                .then(function (url) {
                    return baseUrl ? Util.resolveUrl(url, baseUrl) : url;
                })
                .then(get || Util.getAndEncode)
                .then(function (data) {
                    return Util.dataAsUrl(data, Util.mimeType(url));
                })
                .then(function (dataUrl) {
                    return string.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
                });

            function urlAsRegex(url: string) {
                return new RegExp('(url\\([\'"]?)(' + Util.escape(url) + ')([\'"]?\\))', 'g');
            }
        }

        export function inlineAll(string: string, baseUrl?: string, get?: typeof Util.getAndEncode) {
            if (nothingToInline()) return Promise.resolve(string);

            return Promise.resolve(string)
                .then(readUrls)
                .then(function (urls) {
                    let done = Promise.resolve(string);
                    urls.forEach(function (url) {
                        done = done.then(function (string) {
                            return inline(string, url, baseUrl, get);
                        });
                    });
                    return done;
                });

            function nothingToInline() {
                return !shouldProcess(string);
            }
        }
    }
    namespace Images {
        export const impl = {
            newImage: newImage
        }

        function newImage(element: HTMLImageElement) {
            return {
                inline: inline
            };

            function inline(get?: typeof Util.getAndEncode): Promise<void> {
                if (Util.isDataUrl(element.src)) return Promise.resolve();

                return Promise.resolve(element.src)
                    .then(get || Util.getAndEncode)
                    .then(function (data) {
                        return Util.dataAsUrl(data, Util.mimeType(element.src));
                    })
                    .then(function (dataUrl) {
                        return new Promise(function (resolve, reject) {
                            element.onload = ()=>resolve();
                            element.onerror = reject;
                            element.src = dataUrl;
                        });
                    });
            }
        }

        export function inlineAll(node: HTMLElement): Promise<void> {
            if (!(node instanceof Element)) return Promise.resolve(node);

            return inlineBackground(node)
                .then(function () {
                    if (node instanceof HTMLImageElement)
                        return newImage(node).inline();
                    else
                        return Promise.all(
                            Util.asArray(node.childNodes).map(function (child) {
                                return inlineAll(child as HTMLElement);
                            })
                        ) as unknown as Promise<void>;
                });

            function inlineBackground(node: HTMLElement) {
                const background = node.style.getPropertyValue('background');

                if (!background) return Promise.resolve(node);

                return Inliner.inlineAll(background)
                    .then(function (inlined) {
                        node.style.setProperty(
                            'background',
                            inlined,
                            node.style.getPropertyPriority('background')
                        );
                    })
                    .then(function () {
                        return node;
                    });
            }
        }
    }
    namespace FontFaces {
        export const impl = {
            readAll: readAll
        };

        export function resolveAll() {
            return readAll(document)
                .then(function (webFonts) {
                    return Promise.all(
                        webFonts.map(function (webFont) {
                            return webFont.resolve();
                        })
                    );
                })
                .then(function (cssStrings) {
                    return cssStrings.join('\n');
                });
        }

        function readAll(document: Document) {
            return Promise.resolve(Util.asArray(document.styleSheets))
                .then(getCssRules)
                .then(selectWebFontRules)
                .then(function (rules) {
                    return rules.map(newWebFont);
                });

            function selectWebFontRules(cssRules: CSSStyleRule[]) {
                return cssRules
                    .filter(function (rule) {
                        return rule.type === CSSRule.FONT_FACE_RULE;
                    })
                    .filter(function (rule) {
                        return Inliner.shouldProcess(rule.style.getPropertyValue('src'));
                    });
            }

            function getCssRules(styleSheets: CSSStyleSheet[]) {
                const cssRules: CSSStyleRule[] = [];
                styleSheets.forEach(function (sheet) {
                    try {
                        Util.asArray(sheet.cssRules || []).forEach(rule => cssRules.push(rule as CSSStyleRule));
                    } catch (e) {
                        console.log('Error while reading CSS rules from ' + sheet.href, ''+e);
                    }
                });
                return cssRules;
            }

            function newWebFont(webFontRule: CSSStyleRule) {
                return {
                    resolve: function resolve() {
                        const baseUrl = (webFontRule.parentStyleSheet || {}).href ?? undefined;
                        return Inliner.inlineAll(webFontRule.cssText, baseUrl);
                    },
                    src: function () {
                        return webFontRule.style.getPropertyValue('src');
                    }
                };
            }
        }
    }

    // Default impl options
    const defaultOptions: Options = {
        // Default is to fail on error, no placeholder
        imagePlaceholder: undefined,
        // Default cache bust is false, it will use the cache
        cacheBust: false
    };

    type Options = {imagePlaceholder?: string, cacheBust: boolean}
    type NodeFilter = (node: HTMLElement)=>boolean


    export const impl = {
        fontFaces: FontFaces,
        images: Images,
        util: Util,
        inliner: Inliner,
        options: {} as Options
    }

    type RenderOptions = {
        filter?: NodeFilter,
        bgcolor?: string,
        width?: number,
        height?: number,
        style?: {[key: string]: string}
        quality?: number
    } & Optional<Options>;

    type Optional<T> = {[key in keyof T]?: T[key]};

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options
     * @param {Function} options.filter - Should return true if passed node should be included in the output
     *          (excluding node means excluding it's children as well). Not called on the root node.
     * @param {String} options.bgcolor - color for the background, any valid CSS color value.
     * @param {Number} options.width - width to be applied to node before rendering.
     * @param {Number} options.height - height to be applied to node before rendering.
     * @param {Object} options.style - an object whose properties to be copied to node's style before rendering.
     * @param {Number} options.quality - a Number between 0 and 1 indicating image quality (applicable to JPEG only),
                defaults to 1.0.
     * @param {String} options.imagePlaceholder - dataURL to use as a placeholder for failed images, default behaviour is to fail fast on images we can't fetch
     * @param {Boolean} options.cacheBust - set to true to cache bust by appending the time to the request url
     * @return {Promise} - A promise that is fulfilled with a SVG image data URL
     * */
    export function toSvg(node: HTMLElement, options: RenderOptions = {}) {
        options = options || {};
        copyOptions(options);
        return Promise.resolve(node)
            .then(function (node) {
                return cloneNode(node, options.filter, true);
            })
            .then(embedFonts)
            .then(inlineImages)
            .then(applyOptions)
            .then(function (clone) {
                return makeSvgDataUri(clone,
                    options.width || Util.width(node),
                    options.height || Util.height(node)
                );
            });

        function applyOptions(clone: HTMLElement) {
            if (options.bgcolor) clone.style.backgroundColor = options.bgcolor;

            if (options.width) clone.style.width = options.width + 'px';
            if (options.height) clone.style.height = options.height + 'px';

            if (options.style)
                Object.keys(options.style).forEach(function (property) {
                    (clone.style as {[key: string]: any})[property] = options.style![property];
                });

            return clone;
        }
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a Uint8Array containing RGBA pixel data.
     * */
    export function toPixelData(node: HTMLElement, options: RenderOptions = {}) {
        return draw(node, options || {})
            .then(function (canvas) {
                return canvas.getContext('2d')!.getImageData(
                    0,
                    0,
                    Util.width(node),
                    Util.height(node)
                ).data;
            });
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a PNG image data URL
     * */
    export function toPng(node: HTMLElement, options: RenderOptions = {}) {
        return draw(node, options || {})
            .then(function (canvas) {
                return canvas.toDataURL();
            });
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a JPEG image data URL
     * */
    export function toJpeg(node: HTMLElement, options: RenderOptions = {}) {
        options = options || {};
        return draw(node, options)
            .then(function (canvas) {
                return canvas.toDataURL('image/jpeg', options.quality || 1.0);
            });
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a PNG image blob
     * */
    export function toBlob(node: HTMLElement, options: RenderOptions = {}) {
        return draw(node, options || {})
            .then(Util.canvasToBlob);
    }

    function copyOptions(options: Optional<Options>) {
        // Copy options to impl options for use in impl
        if(typeof(options.imagePlaceholder) === 'undefined') {
            impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
        } else {
            impl.options.imagePlaceholder = options.imagePlaceholder;
        }

        if(typeof(options.cacheBust) === 'undefined') {
            impl.options.cacheBust = defaultOptions.cacheBust;
        } else {
            impl.options.cacheBust = options.cacheBust;
        }
    }

    function draw(domNode: HTMLElement, options: RenderOptions = {}) {
        return toSvg(domNode, options)
            .then(Util.makeImage)
            .then(Util.delay(100))
            .then(function (image: CanvasImageSource) {
                const canvas = newCanvas(domNode);
                canvas.getContext('2d')!.drawImage(image, 0, 0);
                return canvas;
            });

        function newCanvas(domNode: HTMLElement) {
            const canvas = document.createElement('canvas');
            canvas.width = options.width || Util.width(domNode);
            canvas.height = options.height || Util.height(domNode);

            if (options.bgcolor) {
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = options.bgcolor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            return canvas;
        }
    }

    function cloneNode(node: HTMLElement, filter?: NodeFilter, root?:boolean): Promise<HTMLElement> {
        if (!root && filter && !filter(node)) return Promise.resolve() as unknown as Promise<HTMLElement>;

        return Promise.resolve(node)
            .then(makeNodeCopy)
            .then(function (clone) {
                return cloneChildren(node, clone, filter);
            })
            .then(function (clone) {
                return processClone(node, clone);
            });

        function makeNodeCopy(node: HTMLElement): Promise<HTMLElement> {
            if (node instanceof HTMLCanvasElement) return Util.makeImage(node.toDataURL());
            return Promise.resolve(node.cloneNode(false) as HTMLElement);
        }

        function cloneChildren(original: HTMLElement, clone: HTMLElement, filter?: NodeFilter) {
            const children = original.childNodes;
            if (children.length === 0) return Promise.resolve(clone);

            return cloneChildrenInOrder(clone, Util.asArray(children) as HTMLElement[], filter)
                .then(function () {
                    return clone;
                });

            function cloneChildrenInOrder(parent: HTMLElement, children: HTMLElement[], filter?: NodeFilter) {
                let done = Promise.resolve();
                children.forEach(function (child) {
                    done = done
                        .then(function () {
                            return cloneNode(child, filter);
                        })
                        .then(function (childClone) {
                            if (childClone) parent.appendChild(childClone);
                        });
                });
                return done;
            }
        }

        function processClone(original: HTMLElement, clone: HTMLElement) {
            if (!(clone instanceof Element)) return clone;

            return Promise.resolve()
                .then(cloneStyle)
                .then(clonePseudoElements)
                .then(copyUserInput)
                .then(fixSvg)
                .then(function () {
                    return clone;
                });

            function cloneStyle() {
                copyStyle(window.getComputedStyle(original), clone.style);

                function copyStyle(source: CSSStyleDeclaration, target: CSSStyleDeclaration) {
                    if (source.cssText) target.cssText = source.cssText;
                    else copyProperties(source, target);

                    function copyProperties(source: CSSStyleDeclaration, target: CSSStyleDeclaration) {
                        Util.asArray(source).forEach(function (name) {
                            target.setProperty(
                                name,
                                source.getPropertyValue(name),
                                source.getPropertyPriority(name)
                            );
                        });
                    }
                }
            }

            function clonePseudoElements() {
                [':before', ':after'].forEach(function (element) {
                    clonePseudoElement(element);
                });

                function clonePseudoElement(element: string) {
                    const style = window.getComputedStyle(original, element);
                    const content = style.getPropertyValue('content');

                    if (content === '' || content === 'none') return;

                    const className = Util.uid();
                    clone.className = clone.className + ' ' + className;
                    const styleElement = document.createElement('style');
                    styleElement.appendChild(formatPseudoElementStyle(className, element, style));
                    clone.appendChild(styleElement);

                    function formatPseudoElementStyle(className: string, element: string, style: CSSStyleDeclaration) {
                        const selector = '.' + className + ':' + element;
                        const cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
                        return document.createTextNode(selector + '{' + cssText + '}');

                        function formatCssText(style: CSSStyleDeclaration) {
                            const content = style.getPropertyValue('content');
                            return style.cssText + ' content: ' + content + ';';
                        }

                        function formatCssProperties(style: CSSStyleDeclaration) {

                            return Util.asArray(style)
                                .map(formatProperty)
                                .join('; ') + ';';

                            function formatProperty(name: string) {
                                return name + ': ' +
                                    style.getPropertyValue(name) +
                                    (style.getPropertyPriority(name) ? ' !important' : '');
                            }
                        }
                    }
                }
            }

            function copyUserInput() {
                if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
                if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
            }

            function fixSvg() {
                if (!(clone instanceof SVGElement)) return;
                clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

                if (!(clone instanceof SVGRectElement)) return;
                ['width', 'height'].forEach(function (attribute) {
                    const value = clone.getAttribute(attribute);
                    if (!value) return;

                    clone.style.setProperty(attribute, value);
                });
            }
        }
    }

    function embedFonts(node: HTMLElement) {
        return FontFaces.resolveAll()
            .then(function (cssText) {
                const styleNode = document.createElement('style');
                node.appendChild(styleNode);
                styleNode.appendChild(document.createTextNode(cssText));
                return node;
            });
    }

    function inlineImages(node: HTMLElement) {
        return Images.inlineAll(node)
            .then(function () {
                return node;
            });
    }

    function makeSvgDataUri(node: HTMLElement, width: number, height: number) {
        return Promise.resolve(node)
            .then(function (node) {
                node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                return new XMLSerializer().serializeToString(node);
            })
            .then(Util.escapeXhtml)
            .then(function (xhtml) {
                return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + '</foreignObject>';
            })
            .then(function (foreignObject) {
                return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                    foreignObject + '</svg>';
            })
            .then(function (svg) {
                return 'data:image/svg+xml;charset=utf-8,' + svg;
            });
    }
}