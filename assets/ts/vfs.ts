/*
 * MIT License
 * 
 * Copyright (c) 2022-2023 S. Beeblebrox
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
namespace VFS {
    namespace Types {
        export type Path = string | string[];
        export type EnumKeys<E> = keyof Partial<Record<keyof E, number>>
        export type JSONValue = {[key: string]: JSONValue} | boolean | null | string | number | JSONValue[];
        export interface AbstractFile {
            getName(): string | null;
            getDateCreated(): Date;
            getDateModified(): Date;
            getDateAccessed(): Date;
            getParentDirectory(): Directory | null;
            getAttributes(): number;
            setAttributes(arg: number | ((attributes: number)=>number) | {[key in EnumKeys<typeof FileSystem.Attributes>]?: boolean}): number;
            getPermissions(): number;
            setPermissions(arg: number | ((permissions: number)=>number) | {[key in EnumKeys<typeof FileSystem.Permissions>]?: boolean}): number;
            isExecutable(): boolean;
            [Symbol.toStringTag]: string;
        }

        export interface File extends AbstractFile {
            read(): ArrayBuffer;
            read(asString: true): string;
            write(data: Uint8Array | string, startoffset?: number, trim?: boolean): void;
            getContentSize(): number;
            isExecutable(): boolean;
            locked(mode: FileSystem.LockMode.READ | FileSystem.LockMode.WRITE, func: (lockedFile: File)=>void): Promise<void>;
        }

        export interface Directory extends AbstractFile {
            get(path: string): Directory | File;
            set(path: string, file: Directory | File): Directory | File;
            has(path: string): boolean;
            delete(path: string): Directory | File;
            keys({includeHidden,includeSpecial}: {includeHidden?:boolean,includeSpecial?:boolean}): string[];
            isRoot(): boolean;
            typeof(path: string): 'File' | 'Directory' | 'undefined';
        }
    }
    namespace BitHelper {
        export function getByIndex(mask: number, index: number): boolean {
            return !!((mask>>(index-1)) % 2);
        }
        export function get(mask: number, bit: number): boolean {
            return !!(mask & bit);
        }
        export function setByIndex(mask: number, index: number, value: boolean = true): number {
            const p=1<<(index-1);
            return value?mask|p:mask&~p;
        }
        export function set(mask: number, bit: number, value: boolean = true) {
            return value?mask|bit:mask&~bit
        }
    }
    const baseGetterSymbol = Symbol('getBase');
    const now = () => new Date();
    const escapeRegex = (text: string) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const getBit = BitHelper.get;
    const setBit = BitHelper.set;

    class AssertionError extends Error {
        constructor(message?: string | undefined) {
            super(`Assertion failed` + (message ? ': ' : '') + message??'');
        }
    }

    export function assert(condition: false, message?: string): never
    export function assert(condition: boolean, message?: string): void
    export function assert(condition: boolean, message: string = '') {
        if(!condition) throw new AssertionError(message);
    }

    namespace Base {
        export abstract class AbstractFile {
            public parentDirectory: Directory | null = null;
            protected constructor(
                public name: string | null,
                public readonly dateCreated: Date,
                public dateModified: Date,
                public dateAccessed: Date,
                public permissions: number,
                public attributes: number
            ) {}

            public toObject(): Types.JSONValue {
                return {
                    type: this.constructor.name,
                    name: this.name,
                    dateCreated: +this.dateCreated,
                    dateModified: +this.dateModified,
                    dateAccessed: +this.dateAccessed,
                    permissions: this.permissions,
                    attributes: this.attributes
                }
            }
        }

        export class File extends AbstractFile {
            public lockMode: FileSystem.LockMode = FileSystem.LockMode.UNLOCKED;
            public lockObject?: object;
            public constructor(
                name: string | null,
                dateCreated: Date,
                dateModified: Date,
                dateAccessed: Date,
                private data: ArrayBuffer,
                permissions: number,
                attributes: number
            ) {super(name, dateCreated, dateModified, dateAccessed, permissions, attributes);}

            public get contentSize() {
                return this.data.byteLength
            }

            public async locked(mode: FileSystem.LockMode.READ | FileSystem.LockMode.WRITE, func: (lockedFile: File)=>void) {
                const lockObject = {};
                this.lockMode = mode;
                this.lockObject = lockObject;
                try {
                    await func(new Proxy(this, {
                        get(target, property) {
                            switch(property) {
                                case File.prototype.read.name: return function read() {
                                    return target.read(lockObject);
                                }
                                case File.prototype.write.name: return function write(data: Uint8Array, startoffset?: number, trim?: boolean) {
                                    return target.write(data, startoffset, trim, lockObject);
                                }
                                default: return Reflect.get(target, property);
                            }
                        }
                    }));
                } finally {
                    this.lockMode = FileSystem.LockMode.UNLOCKED;
                    this.lockObject = undefined;
                }
            }
            public toObject(): Types.JSONValue {
                return Object.assign(super.toObject() as object, {
                    data: new TextDecoder().decode(this.data)
                });
            }
            static fromObject(object: any) {
                assert(object.type === File.name, `Unable restore file from object that is not a file representation`);
                return new File(object.name, object.dateCreated, object.dateModified, object.dateAccessed, new TextEncoder().encode(object.data as string), object.permissions, object.attributes);
            }

            public read(lockObject?: object): ArrayBuffer {
                this.assertUnlocked(FileSystem.LockMode.READ, lockObject);
                this.dateAccessed = now();
                return structuredClone(this.data);
            }
            public write(data: Uint8Array, startoffset?: number, trim?: boolean, lockObject?: object) {
                this.assertUnlocked(FileSystem.LockMode.WRITE, lockObject);
                const size = trim ? startoffset! + data.byteLength : Math.max((startoffset??this.data.byteLength) + data.byteLength, this.data.byteLength);
                const t = new Uint8Array(size);
                t.set(new Uint8Array(this.data).slice(0,size), 0);
                t.set(new Uint8Array(data), startoffset ?? this.data.byteLength);
                this.dateModified = now();
                this.data = t.buffer;
            }
            protected assertUnlocked(mode: FileSystem.LockMode.READ | FileSystem.LockMode.WRITE, lockObject: object | undefined) {
                assert(this.lockMode < mode || this.lockObject === lockObject, `Cannot ${FileSystem.LockMode[mode].toLowerCase()} ${mode == FileSystem.LockMode.WRITE ? 'to':'from'} ${FileSystem.LockMode[this.lockMode].toLowerCase()} locked file.`)
            }
        }

        export class Directory extends AbstractFile {
            public toObject(): Types.JSONValue {
                return Object.assign(super.toObject() as object, {
                    files: this.files.map(file => file.toObject()),
                    isRoot: this.isRoot
                });
            }
            static fromObject(object: any) {
                assert(object.type === Directory.name, `Unable restore directory from object that is not a directory representation`);
                return new Directory(object.name, object.dateCreated, object.dateModified, object.dateAccessed, object.permissions, object.attributes, object.files.map((o: any)=>o.name), object.files.map((o: any)=>o.type === Directory.name ? Directory.fromObject(o) : File.fromObject(o)), object.isRoot);
            }
            public constructor(
                name: string | null,
                dateCreated: Date,
                dateModified: Date,
                dateAccessed: Date,
                permissions: number,
                attributes: number,
                private readonly names: string[],
                private readonly files: (Directory | File)[],
                public readonly isRoot: boolean = false
            ) {super(name, dateCreated,dateModified,dateAccessed,permissions,attributes)}
            public get(name: string): Directory | File {
                const file = this.files[this.getNameIndex(name)];
                return file;
            }
            public set(name: string, file: Directory | File): Directory | File {
                assert(name !== null, 'Cannot add a nameless file to a directory');
                assert(file.parentDirectory === null, 'A file cannot be in multiple directories');
                assert(!(file instanceof Directory) || !file.isRoot, 'The root directory cannot be moved');
                if(this.has(name!)) return this.get(name!);
                this.files[(this.getWritableNameIndex(name!,true)+1||this.names.push(name!))-1] = file;
                file.name = name;
                file.parentDirectory = this;
                return file;
            }
            public has(name: string): boolean {
                return this.names.includes(name);
            }
            public delete(key: string): Directory | File {
                let i;
                this.names.splice(i=this.getWritableNameIndex(key),1);
                const file = this.files.splice(i,1)[0];
                file.name=null;
                file.parentDirectory=null;
                return file;
            }
            public keys(includeHidden = false, includeSpecial = false) {
                const extra = [];
                if(includeSpecial) extra.push('.');
                if(includeSpecial && this.parentDirectory !== null) extra.push('..');

                if(includeHidden) return [...extra, ...this.names];
                else return [...extra, ...[...this.names].filter(name => !getBit(this.files[this.getNameIndex(name)].attributes, FileSystem.Attributes.HIDDEN))];
            }
            private getNameIndex(name: string, assertExists = true) {
                this.assertValidName(name);
                const i = this.names.indexOf(name);
                if(assertExists) assert(i>=0,`File '${name}' does not exist or is not readable.`);
                this.dateAccessed = now();
                return i;
            }
            private getWritableNameIndex(name: string, allowNew = false) {
                const t = this.getNameIndex(name,!allowNew);
                this.dateModified = now();
                return t;
            }
            private assertValidName(name: string) {
                assert(!['.','..'].includes(name), `Cannot name file with reserved name '${name}'`);
            }
        }
    }

    export class FileSystem {
        static new(pathSeparator: string = '/', root?: Base.Directory) {
            return new FileSystem(root ?? new Base.Directory(null,now(),now(),now(), FileSystem.Permissions.READ | FileSystem.Permissions.WRITE | FileSystem.Permissions.EXECUTE, 0, [], [], true),pathSeparator);
        }
        private constructor(private readonly root: Base.Directory, public readonly PATH_SEPARATOR: string) {}
        
        public createInterface({homeDir = '/', unrestricted = false} = {}) {
            const PATH_SEPARATOR = this.PATH_SEPARATOR;
            class AbstractFile implements Types.AbstractFile {
                protected wrap(base: Base.Directory | Base.File) {
                    return base instanceof Base.Directory ? new Directory(base) : new File(base);
                }
                constructor(protected base: Base.Directory | Base.File) {}
                get [Symbol.toStringTag](): string {return this.constructor.name}
                getName() {
                    return this.base.name;
                }
                getDateCreated() {
                    return this.base.dateCreated;
                }
                getDateModified() {
                    return this.base.dateModified;
                }
                getDateAccessed() {
                    return this.base.dateAccessed;
                }
                getParentDirectory() {
                    return this.base.parentDirectory ? new Directory(this.base.parentDirectory) : null;
                }
                getAttributes() {
                    return this.base.attributes;
                }
                setAttributes(arg: number | ((attributes: number)=>number) | {[key in Types.EnumKeys<typeof FileSystem.Attributes>]?: boolean}) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    if(typeof arg === 'object') {
                        for(const [key, value] of Object.entries(arg)) setBit(this.base.attributes, Reflect.get(FileSystem.Attributes, key), value);
                        return this.base.attributes;
                    }
                    return this.base.attributes = typeof arg === 'function' ? arg(this.base.attributes) : arg;
                }
                getPermissions() {
                    return this.base.permissions;
                }
                setPermissions(arg: number | ((permissions: number)=>number) | {[key in Types.EnumKeys<typeof FileSystem.Permissions>]?: boolean}) {
                    assert(unrestricted, 'Unrestricted access is needed to set permissions');     
                    if(typeof arg === 'object') {
                        for(const [key, value] of Object.entries(arg)) this.base.permissions = setBit(this.base.permissions, Reflect.get(FileSystem.Permissions, key), value);
                        return this.base.permissions;
                    }
                    return this.base.permissions = typeof arg === 'function' ? arg(this.base.permissions) : arg;
                }
                isExecutable() {
                    return getBit(this.base.permissions, FileSystem.Permissions.EXECUTE);
                }
                [baseGetterSymbol](symbol: typeof baseGetterSymbol): Base.Directory | Base.File {
                    assert(symbol === baseGetterSymbol);
                    return this.base;
                }
                protected assertPermission(permission: FileSystem.Permissions, file = this.base) {
                    assert(unrestricted || getBit(file.permissions, permission), `File '${file.name ?? '<unknown>'} is not ${FileSystem.Permissions[permission].toLowerCase().replace(/[aeiou]$/,'')}able.'`);            
                }
            }
            class File extends AbstractFile implements Types.File {
                static new() {
                    return new File(new Base.File(null,now(),now(),now(),new ArrayBuffer(0), FileSystem.Permissions.READ | FileSystem.Permissions.WRITE, 0));
                }

                private encoder = new TextEncoder();
                private decoder = new TextDecoder();

                constructor(protected base: Base.File) {super(base);}

                public read(): ArrayBuffer;
                public read(asString: true): string;
                public read(asString = false): ArrayBuffer | string {
                    this.assertPermission(FileSystem.Permissions.READ);
                    const value = this.base.read();
                    return asString ? this.decoder.decode(value) : value;
                }

                public write(data: Uint8Array | string, startoffset?: number, trim?: boolean) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    if(typeof data === 'string') data = this.encoder.encode(data);
                    this.base.write(data, startoffset, trim);
                }

                public getContentSize() {
                    this.assertPermission(FileSystem.Permissions.READ);
                    return this.base.contentSize;
                }

                public locked(mode: FileSystem.LockMode.READ | FileSystem.LockMode.WRITE, func: (lockedFile: File)=>void) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    return this.base.locked(mode, (lockedFile => func(new File(lockedFile))));
                }
            }
            class Directory extends AbstractFile implements Types.Directory {
                static new(base?: Base.Directory) {
                    return new Directory(base ?? new Base.Directory(null,now(),now(),now(), FileSystem.Permissions.READ | FileSystem.Permissions.WRITE | FileSystem.Permissions.EXECUTE, 0, [], []));
                }
                constructor(protected base: Base.Directory) {super(base);}
                
                private splitfp(path: Types.Path) {
                    if(typeof path === 'string') {
                        path = path.replace(new RegExp(String.raw`${escapeRegex(PATH_SEPARATOR)}$`, 'g'), '').split(new RegExp(String.raw`(?<!^)${escapeRegex(PATH_SEPARATOR)}|(?<=^${escapeRegex(PATH_SEPARATOR)})`, 'g'));
                        if(path[0] === '~') path[0] = homeDir;
                    }
                    return path;
                }
                public get(path: Types.Path): Directory | File {
                    this.assertPermission(FileSystem.Permissions.READ);
                    const [first,...rest] = this.splitfp(path);
                    const target = (()=>{switch(first) {
                        case '.':
                            return this;
                        case '..': 
                            assert(this.getParentDirectory !== null, 'Directory has no parent');
                            return this.getParentDirectory()!;
                        case PATH_SEPARATOR:
                            return root as Directory;
                        default:
                            return this.wrap(this.base.get(first));
                    }})();
                    if(rest.length) {
                        assert(target instanceof Directory, `Cannot resolve path. Expected a directory but found a file: '${target?.getName() ?? '<none>'}'`);
                        return (target as Directory).get(rest);
                    }
                    return target;
                }
                
                public set(path: Types.Path, file: Directory | File) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    const {target, last} = this.preparePath(path) as {target: Directory, last: string};
                    assert(target instanceof Directory, `Cannot set '${last}' since ${target?.getName?.() ?? '<unknown>'} is not a directory`)
                    if(target.has(last))
                        target.assertPermission(FileSystem.Permissions.WRITE, target.get(last)[baseGetterSymbol](baseGetterSymbol));
                    const newFile = target.base.set(
                        last,
                        file[baseGetterSymbol](baseGetterSymbol)
                    );
                    return this.wrap(newFile);
                }

                public has(path: Types.Path, catchErrors = true): boolean {
                    const impl = () => {
                        this.assertPermission(FileSystem.Permissions.READ);
                        const {target, last} = this.preparePath(path);
                        assert(target instanceof Directory, `Cannot check if '${last}' exists since ${target?.getName?.() ?? '<unknown>'} is not a directory`)
                        return (target as Directory).base.has(last);
                    }
                    if(catchErrors)
                        try { return impl(); } catch { return false; }
                    else return impl();
                    
                }
                public typeof(path: Types.Path, catchErrors = true): 'File' | 'Directory' | 'undefined' {
                    const impl = () => {
                        this.assertPermission(FileSystem.Permissions.READ);
                        return this.get(path).constructor.name as ('File' | 'Directory');
                    }
                    if(catchErrors)
                        try { return impl(); } catch { return 'undefined'; }
                    else return impl();
                    
                }
                public delete(path: Types.Path) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    const {target, last} = this.preparePath(path);
                    assert(target instanceof Directory, `Cannot delete '${last}' exists since ${target?.getName?.() ?? '<unknown>'} is not a directory`)
                    return this.wrap((target as Directory).base.delete(last));
                }
                public keys({includeHidden = false, includeSpecial = false} = {}) {
                    this.assertPermission(FileSystem.Permissions.READ);
                    return this.base.keys(includeHidden, includeSpecial);
                }
                public isRoot() {
                    return this.base.isRoot;
                }
                private preparePath(path: Types.Path) {
                    path = [...this.splitfp(path)];
                    const last = path.pop()!;
                    let target: File | Directory = this;
                    if(path.length) target = this.get(path);
                    return {target, path, last};
                }
            }
            const root = Directory.new(this.root) as Types.Directory;
            return {Directory, File, root};
        }

        toObject(): Types.JSONValue {
            return {
                type: FileSystem.name,
                pathSeparator: this.PATH_SEPARATOR,
                root: this.root.toObject()
            };
        }

        static fromObject(object: any) {
            assert(object.type === FileSystem.name, `Unable restore file system from object that is not a file system representation`);
            return FileSystem.new(object.pathSeparator, Base.Directory.fromObject(object.root));
        }

        static isFile(resource: VFS.FileSystem.File | VFS.FileSystem.Directory): resource is VFS.FileSystem.File {
            return typeof resource !== 'string' && Reflect.get(resource, Symbol.toStringTag) === 'File';
        }
    }

    export namespace FileSystem {
        export type File = Types.File;
        export type Directory = Types.Directory;
        export enum Permissions {
            READ = 4,
            WRITE = 2,
            EXECUTE = 1
        }
        
        export enum Attributes {
            HIDDEN = 1,
            TEMPORARY = 2 //NYI
        }

        export enum LockMode {
            UNLOCKED=0,
            WRITE = 1,
            READ = 2,
        }
    }

    export namespace Streams {
        export function FileWriteStream(file: Types.File, {mode}?: {mode?: 'number'}): WritableStream<number>;
        export function FileWriteStream(file: Types.File, {mode}: {mode: 'Uint8Array'}): WritableStream<Uint8Array>;
        export function FileWriteStream(file: Types.File, {mode = 'number'}: {mode?: 'number' | 'Uint8Array'} = {}) {
            const cqs = new CountQueuingStrategy({ highWaterMark: 1 });
            return mode === 'number' ?
                new WritableStream<number>({
                    write(chunk) {
                        file.write(new Uint8Array([chunk]));
                    }
                }, cqs)
            :
                new WritableStream<Uint8Array>({
                    write(chunk) {
                        file.write(chunk);
                    }
                }, cqs);
        }

        export function DocumentWriteStream(document: Document, {mode}?: {mode?: 'number'}): WritableStream<number>;
        export function DocumentWriteStream(document: Document, {mode}: {mode: 'Uint8Array'}): WritableStream<Uint8Array>;
        export function DocumentWriteStream(document: Document = globalThis.document, {mode = 'number'}: {mode?: 'number' | 'Uint8Array'} = {}) {
            const cqs = new CountQueuingStrategy({ highWaterMark: 1 }), decoder = new TextDecoder();
            return mode === 'number' ?
                new WritableStream<number>({
                    write(chunk) {
                        document.write(decoder.decode(new Uint8Array([chunk]), {stream: true}));
                    }
                }, cqs)
            :
                new WritableStream<Uint8Array>({
                    write(chunk) {
                        document.write(decoder.decode(chunk, {stream: true}));
                    }
                }, cqs);
        }

        export function FileReadStream(file: Types.File) {
            return iteratorToStream(new Uint8Array(file.read()).values());
        }

        function iteratorToStream<T>(iterator: Iterator<T>) {
            return new ReadableStream<T>({
                async pull(controller) {
                    const { value, done } = await iterator.next();
                    if (done) controller.close();
                    else controller.enqueue(value);
                }
            });
        }
    }

    export function download(resource: BlobPart | FileSystem.File, name?: string) {
        function isFile(resource: BlobPart | FileSystem.File): resource is FileSystem.File {
            return typeof resource !== 'string' && Reflect.get(resource, Symbol.toStringTag) === 'File';
        }
        if(isFile(resource)) {
            name ??= resource.getName() ?? undefined;
            resource = resource.read();
        }
        if(!(resource instanceof Blob)) resource = new Blob([resource]);
        const objectURL = URL.createObjectURL(resource);
        Object.assign(document.createElement('a'), {href: objectURL, download: name ?? '', onclick() {
            requestAnimationFrame(()=>URL.revokeObjectURL(objectURL));
        }}).click();
    }
}