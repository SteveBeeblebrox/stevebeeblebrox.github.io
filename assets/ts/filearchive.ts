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
// https://en.wikipedia.org/wiki/Tar_(computing)
// https://www.gnu.org/software/tar/manual/html_node/Standard.html

class TarBuilder {
    private bytes: Uint8ClampedArray = new Uint8ClampedArray();
    private static encode = TextEncoder.prototype.encode.bind(new TextEncoder());
    private static roundUp(num: number, multiple: number) {
        if (multiple == 0)
            return num;

        const remainder = num % multiple;
        if (remainder == 0)
            return num;

        return num + multiple - remainder;
    }
    private static fixfp(path: string, srcPathSeparator: string) {
        return srcPathSeparator === '/' ? path : path.replaceAll(srcPathSeparator, '/'); // Convert arbitrary path seperators to standard '/'
    }
    constructor() {}
    public add(name: string, file: VFS.FileSystem.File | VFS.FileSystem.Directory) {
        this.bytes = new Uint8ClampedArray([
            this.bytes,
            this.createHeader(TarBuilder.fixfp(name, file.PATH_SEPERATOR), file), // Header
            this.createBody(VFS.FileSystem.isFile(file) ? new Uint8ClampedArray(file.read()) : new Uint8ClampedArray(0)) // Body
        ].flatMap(o=>[...o]));
    }
    private createBody(source: Uint8ClampedArray): Uint8ClampedArray {
        return new Uint8ClampedArray(Object.assign([...source], {length: TarBuilder.roundUp(source.length, 512)}));
    }
    private createHeader(name: string, file: VFS.FileSystem.File | VFS.FileSystem.Directory, dummyChecksum: boolean  = false): Uint8ClampedArray {
        VFS.assert(name.length <= 100, `File name '${name}' must be no more than 100 characters`)
        const {Octal, ASCIIString} = TarBuilder;
        const isFile = VFS.FileSystem.isFile(file);
        
        if(!isFile && !name.endsWith('/')) {
            name += '/';
        }
        return new Uint8ClampedArray(Object.assign([
            ASCIIString(100, name), // File name
            Octal(8,0o6000 | parseInt(file.getPermissions().toString().repeat(3),8)), // File mode
            Octal(8), // Owner's numerical ID (NS)
            Octal(8), // Groups's numerical ID (NS)
            Octal(12, isFile ? file.getContentSize() : 0), // File size in bytes
            Octal(12, Math.floor(+file.getDateModified() / 1000)), // Last modification time in numeric Unix time format
            (
                dummyChecksum
                    ? ASCIIString(8, ' '.repeat(8))
                    : [...Octal(7, this.createHeader(name, file, true).reduce((a,b)=>a+b)), ...ASCIIString(1,' ')]
            ), // Checksum for header record
            ASCIIString(1,TarBuilder.FileType.NORMAL.toString()), // Link indicator (file type)
            ASCIIString(100) // Name of linked file (NS)
        ].flatMap(o=>[...o]), {length: 512}));
    }
    toBytes(type: typeof Uint8Array): Uint8Array
    toBytes(type: typeof Uint8ClampedArray): Uint8ClampedArray
    toBytes(type: typeof Uint8Array | typeof Uint8ClampedArray = Uint8ClampedArray) {
        return new type([...this.bytes,...new Uint8ClampedArray(512*2)]);
    }
    private static Octal(size: number, value: number = 0) {
        return new Uint8ClampedArray(TarBuilder.encode(`${value.toString(8).padStart(size-1, '0').slice(0, size-1)}\0`));
    }
    private static ASCIIString(size: number, data: string = '') {
        return new Uint8ClampedArray(Object.assign([...TarBuilder.encode(data).slice(0, size)], {length: size}));
    }
}
namespace TarBuilder {
    export enum FileType {
        NORMAL = 0,
        HARD_LINK = 1,
        SYM_LINK = 2
    }
}

class TarReader {
    private static decode = TextDecoder.prototype.decode.bind(new TextDecoder());
    private readonly dataEntries = [] as any[]
    private static chunk<T>(array: T[], size: number): T[][] {
        return array.reduce((result, item, index) => { 
            const chunk = Math.floor(index/size);
            if(!result[chunk]) result[chunk] = [];
            result[chunk].push(item);
            return result;
        }, [] as T[][])
    }
    private static fixfp(path: string, destPathSeparator: string) {
        return destPathSeparator === '/' ? path : path.replaceAll('/', destPathSeparator); // Convert standard '/' to arbitrary path seperators 
    }
    constructor(data: Uint8ClampedArray) {
        const chunks = TarReader.chunk([...data], 512).map(a=>new Uint8ClampedArray(a));
        
        for(let i = 0; i < 2; i++)
            VFS.assert(!!chunks.pop()?.every?.(o=>o===0), 'Data does not end with two null blocks');

        for(let i = 0; i < chunks.length;) {
            let j = 0;
            const header = chunks[i];
            function take(n: number) {
                return header.slice(j,j+=n);
            }
            function Octal(size: number) {
                const x = parseInt(TarReader.decode(take(size-1)),8);
                take(1);
                return x;
            }
            function ASCIIString(size: number) {
                const x = take(size);
                return TarReader.decode(x.slice(0,x.indexOf(0)));
            }
            let size,t;
            i++;
            const entry = {
                header: {
                    name: ASCIIString(100), // File name
                    mode: Octal(8), // File mode (octal)
                    owner: Octal(8),// Owner's numeric user ID (octal)
                    group: Octal(8), // Group's numeric user ID (octal)
                    size: size=Octal(12), // File size in bytes (octal)
                    timestamp: new Date(Octal(12)*1000), // Last modification time in numeric Unix time format (octal)
                    checksum: (t=Octal(7), ASCIIString(1), t), // Checksum for header record
                    type: ASCIIString(1), // Link indicator (file type)
                    link: ASCIIString(100), // Name of linked file
                },
                body: new Uint8ClampedArray(chunks.slice(i,i+=Math.ceil(size/512)).flatMap(o=>[...o]).slice(0,size))
            }
            const sum = (a:number,b:number)=>a+b, checksumSize = 7;
            VFS.assert(entry.header.checksum === header.reduce(sum)-new TextEncoder().encode(`${entry.header.checksum.toString(8).padStart(checksumSize-1, '0').slice(0, checksumSize-1)}\0`).reduce(sum)+(' '.charCodeAt(0)*7), 'Header checksum does not match archived value');
            this.dataEntries.push(entry);
        }
    }
    entries() {
        return this.dataEntries;
    }
}