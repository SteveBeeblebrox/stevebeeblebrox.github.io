/*
 * MIT License
 * 
 * Copyright (c) 2024 Trin Wasinger
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

namespace Colors {
    const ctx = Object.assign(document.createElement('canvas'),{height:1,width:1}).getContext('2d', {willReadFrequently: true});

    type ColorFormat = ('hex' | 'hex6' )| ('hexa' | 'hex8') | 'rgb' | 'rgba' | 'hsl' | 'hsla' | ('hsv' | 'hsb') | ('hsva' | 'hsba') | 'rgba-array' | 'hsla-array'
    export function convertTo(value: string, to: Exclude<ColorFormat,`${string}-array`>): string
    export function convertTo(value: string, to: Exclude<ColorFormat,Exclude<ColorFormat,`${string}-array`>>): [number,number,number,number]
    export function convertTo(value: string, to: ColorFormat): string | [number,number,number,number] {
        const [r,g,b,a] = toRGBAArray(value);
        switch(to) {
            case 'hex':
            case 'hex6':
                return toHexString(r,g,b);

            case 'hexa':
            case 'hex8':
                return toHexString(r,g,b,a);

            case 'rgb':
                return `rgb(${r}, ${g}, ${b})`;

            case 'rgba':
                return `rgba(${r}, ${g}, ${b} / ${a/255*100}%)`;

            case 'hsl':
                return `hsl(${rgbToHue(r,g,b)}, ${roundDecimal(rgbToSaturation(r,g,b)*100,3)}%, ${roundDecimal(rgbToLightness(r,g,b)*100,3)}%)`;

            case 'hsla':
                return `hsla(${rgbToHue(r,g,b)}, ${roundDecimal(rgbToSaturation(r,g,b)*100,3)}%, ${roundDecimal(rgbToLightness(r,g,b)*100,3)}% / ${a/255*100}%)`;
           
            case 'rgba-array':
                return [r,g,b,a];

            case 'hsla-array':
                return [rgbToHue(r,g,b), rgbToSaturation(r,g,b), rgbToLightness(r,g,b),a/255];

            case 'hsv':
            case 'hsb':
            case 'hsva':
            case 'hsba':
            default:
                throw new TypeError(`Conversion to ${to} not implemented!`);
        }
    }

    function toHexString(r: number, g: number, b: number, a: number | undefined =  undefined) {
        const args = a !== undefined ? [r,g,b,a] : [r,g,b];
        return `#${args.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
    }

    function toRGBAArray(color: any): Uint8ClampedArray {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return ctx.getImageData(0, 0, 1, 1).data;
    }

    /*
    * rgb2hue
    * (c) 2014 akinuri - https://creativecommons.org/licenses/by-sa/4.0/
    * Adapted for TypeScript
    * https://stackoverflow.com/a/39147465
    */
    function rgbToHue(r: number, g: number, b: number): number {
        let cmax,delta;
        ({r,g,b,cmax,delta} = hsDecompose(r,g,b));

        let hue, segment, shift;
        if (delta == 0) {
            hue = 0;
        } else {
            switch(cmax) {
                case r:
                    segment = (g - b) / delta;
                    shift   = 0 / 60;       // R° / (360° / hex sides)
                    if (segment < 0) {      // hue > 180, full rotation
                        shift = 360 / 60;   // R° / (360° / hex sides)
                    }
                    hue = segment + shift;
                    break;
                case g:
                    segment = (b - r) / delta;
                    shift   = 120 / 60;     // G° / (360° / hex sides)
                    hue = segment + shift;
                    break;
                case b:
                    segment = (r - g) / delta;
                    shift   = 240 / 60;     // B° / (360° / hex sides)
                    hue = segment + shift;
                break;
            }
        }
        return hue * 60; // hue is in [0,6], scale it up
    }

    function rgbToSaturation(r: number, g: number, b: number): number {
        const {delta} = hsDecompose(r,g,b);
        return delta == 0 ? 0 : delta / (1 - Math.abs(2 * rgbToLightness(r,g,b) - 1));
    }

    function rgbToLightness(r: number, g: number, b: number): number {
        const {cmin,cmax} = hsDecompose(r,g,b);
        return (cmax + cmin) / 2;
    }

    function roundDecimal(decimal: number, places: number = 3) {
        return +decimal.toFixed(places);
    }

    function hsDecompose(r: number, g: number, b: number) {
        r /= 255;
        g /= 255;
        b /= 255;

        const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;

        return {r,g,b,cmax,cmin,delta};
    }

    export function getContrastingLightDark(bgColor, lightColor, darkColor) {
        const [r,g,b] = convertTo(bgColor, 'rgba-array');
        return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ? darkColor : lightColor;
    }
}