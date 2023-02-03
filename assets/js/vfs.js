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
var VFS;
(function (VFS) {
    let BitHelper;
    (function (BitHelper) {
        function getByIndex(mask, index) {
            return !!((mask >> (index - 1)) % 2);
        }
        BitHelper.getByIndex = getByIndex;
        function get(mask, bit) {
            return !!(mask & bit);
        }
        BitHelper.get = get;
        function setByIndex(mask, index, value = true) {
            const p = 1 << (index - 1);
            return value ? mask | p : mask & ~p;
        }
        BitHelper.setByIndex = setByIndex;
        function set(mask, bit, value = true) {
            return value ? mask | bit : mask & ~bit;
        }
        BitHelper.set = set;
    })(BitHelper || (BitHelper = {}));
    const baseGetterSymbol = Symbol('getBase');
    const now = () => new Date();
    const escapeRegex = (text) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const getBit = BitHelper.get;
    const setBit = BitHelper.set;
    class AssertionError extends Error {
        constructor(message) {
            var _a;
            super((_a = `Assertion failed` + (message ? ': ' : '') + message) !== null && _a !== void 0 ? _a : '');
        }
    }
    function assert(condition, message = '') {
        if (!condition)
            throw new AssertionError(message);
    }
    VFS.assert = assert;
    let Base;
    (function (Base) {
        class AbstractFile {
            constructor(name, dateCreated, dateModified, dateAccessed, permissions, attributes) {
                this.name = name;
                this.dateCreated = dateCreated;
                this.dateModified = dateModified;
                this.dateAccessed = dateAccessed;
                this.permissions = permissions;
                this.attributes = attributes;
                this.parentDirectory = null;
            }
            toObject() {
                return {
                    type: this.constructor.name,
                    name: this.name,
                    dateCreated: +this.dateCreated,
                    dateModified: +this.dateModified,
                    dateAccessed: +this.dateAccessed,
                    permissions: this.permissions,
                    attributes: this.attributes
                };
            }
        }
        Base.AbstractFile = AbstractFile;
        class File extends AbstractFile {
            constructor(name, dateCreated, dateModified, dateAccessed, data, permissions, attributes) {
                super(name, dateCreated, dateModified, dateAccessed, permissions, attributes);
                this.data = data;
                this.lockMode = FileSystem.LockMode.UNLOCKED;
            }
            get contentSize() {
                return this.data.byteLength;
            }
            async locked(mode, func) {
                const lockObject = {};
                this.lockMode = mode;
                this.lockObject = lockObject;
                try {
                    await func(new Proxy(this, {
                        get(target, property) {
                            switch (property) {
                                case File.prototype.read.name: return function read() {
                                    return target.read(lockObject);
                                };
                                case File.prototype.write.name: return function write(data, startoffset, trim) {
                                    return target.write(data, startoffset, trim, lockObject);
                                };
                                default: return Reflect.get(target, property);
                            }
                        }
                    }));
                }
                finally {
                    this.lockMode = FileSystem.LockMode.UNLOCKED;
                    this.lockObject = undefined;
                }
            }
            toObject() {
                return Object.assign(super.toObject(), {
                    data: new TextDecoder().decode(this.data)
                });
            }
            static fromObject(object) {
                assert(object.type === File.name, `Unable restore file from object that is not a file representation`);
                return new File(object.name, object.dateCreated, object.dateModified, object.dateAccessed, new TextEncoder().encode(object.data), object.permissions, object.attributes);
            }
            read(lockObject) {
                this.assertUnlocked(FileSystem.LockMode.READ, lockObject);
                this.dateAccessed = now();
                return structuredClone(this.data);
            }
            write(data, startoffset, trim, lockObject) {
                this.assertUnlocked(FileSystem.LockMode.WRITE, lockObject);
                const size = trim ? startoffset + data.byteLength : Math.max((startoffset !== null && startoffset !== void 0 ? startoffset : this.data.byteLength) + data.byteLength, this.data.byteLength);
                const t = new Uint8Array(size);
                t.set(new Uint8Array(this.data).slice(0, size), 0);
                t.set(new Uint8Array(data), startoffset !== null && startoffset !== void 0 ? startoffset : this.data.byteLength);
                this.dateModified = now();
                this.data = t.buffer;
            }
            assertUnlocked(mode, lockObject) {
                assert(this.lockMode < mode || this.lockObject === lockObject, `Cannot ${FileSystem.LockMode[mode].toLowerCase()} ${mode == FileSystem.LockMode.WRITE ? 'to' : 'from'} ${FileSystem.LockMode[this.lockMode].toLowerCase()} locked file.`);
            }
        }
        Base.File = File;
        class Directory extends AbstractFile {
            toObject() {
                return Object.assign(super.toObject(), {
                    files: this.files.map(file => file.toObject()),
                    isRoot: this.isRoot
                });
            }
            static fromObject(object) {
                assert(object.type === Directory.name, `Unable restore directory from object that is not a directory representation`);
                return new Directory(object.name, object.dateCreated, object.dateModified, object.dateAccessed, object.permissions, object.attributes, object.files.map((o) => o.name), object.files.map((o) => o.type === Directory.name ? Directory.fromObject(o) : File.fromObject(o)), object.isRoot);
            }
            constructor(name, dateCreated, dateModified, dateAccessed, permissions, attributes, names, files, isRoot = false) {
                super(name, dateCreated, dateModified, dateAccessed, permissions, attributes);
                this.names = names;
                this.files = files;
                this.isRoot = isRoot;
            }
            get(name) {
                const file = this.files[this.getNameIndex(name)];
                return file;
            }
            set(name, file) {
                assert(name !== null, 'Cannot add a nameless file to a directory');
                assert(file.parentDirectory === null, 'A file cannot be in multiple directories');
                assert(!(file instanceof Directory) || !file.isRoot, 'The root directory cannot be moved');
                if (this.has(name))
                    return this.get(name);
                this.files[(this.getWritableNameIndex(name, true) + 1 || this.names.push(name)) - 1] = file;
                file.name = name;
                file.parentDirectory = this;
                return file;
            }
            has(name) {
                return this.names.includes(name);
            }
            delete(key) {
                let i;
                this.names.splice(i = this.getWritableNameIndex(key), 1);
                const file = this.files.splice(i, 1)[0];
                file.name = null;
                file.parentDirectory = null;
                return file;
            }
            keys(includeHidden = false, includeSpecial = false) {
                const extra = [];
                if (includeSpecial)
                    extra.push('.');
                if (includeSpecial && this.parentDirectory !== null)
                    extra.push('..');
                if (includeHidden)
                    return [...extra, ...this.names];
                else
                    return [...extra, ...[...this.names].filter(name => !getBit(this.files[this.getNameIndex(name)].attributes, FileSystem.Attributes.HIDDEN))];
            }
            getNameIndex(name, assertExists = true) {
                this.assertValidName(name);
                const i = this.names.indexOf(name);
                if (assertExists)
                    assert(i >= 0, `File '${name}' does not exist or is not readable.`);
                this.dateAccessed = now();
                return i;
            }
            getWritableNameIndex(name, allowNew = false) {
                const t = this.getNameIndex(name, !allowNew);
                this.dateModified = now();
                return t;
            }
            assertValidName(name) {
                assert(!['.', '..'].includes(name), `Cannot name file with reserved name '${name}'`);
            }
        }
        Base.Directory = Directory;
    })(Base || (Base = {}));
    class FileSystem {
        static new(pathSeparator = '/', root) {
            return new FileSystem(root !== null && root !== void 0 ? root : new Base.Directory(null, now(), now(), now(), FileSystem.Permissions.READ | FileSystem.Permissions.WRITE | FileSystem.Permissions.EXECUTE, 0, [], [], true), pathSeparator);
        }
        constructor(root, PATH_SEPARATOR) {
            this.root = root;
            this.PATH_SEPARATOR = PATH_SEPARATOR;
        }
        createInterface({ homeDir = this.PATH_SEPARATOR, unrestricted = false } = {}) {
            const PATH_SEPARATOR = this.PATH_SEPARATOR;
            class AbstractFile {
                wrap(base) {
                    return base instanceof Base.Directory ? new Directory(base) : new File(base);
                }
                constructor(base) {
                    this.base = base;
                    this.PATH_SEPERATOR = PATH_SEPARATOR;
                }
                get [Symbol.toStringTag]() { return this.constructor.name; }
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
                setAttributes(arg) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    if (typeof arg === 'object') {
                        for (const [key, value] of Object.entries(arg))
                            setBit(this.base.attributes, Reflect.get(FileSystem.Attributes, key), value);
                        return this.base.attributes;
                    }
                    return this.base.attributes = typeof arg === 'function' ? arg(this.base.attributes) : arg;
                }
                getPermissions() {
                    return this.base.permissions;
                }
                setPermissions(arg) {
                    assert(unrestricted, 'Unrestricted access is needed to set permissions');
                    if (typeof arg === 'object') {
                        for (const [key, value] of Object.entries(arg))
                            this.base.permissions = setBit(this.base.permissions, Reflect.get(FileSystem.Permissions, key), value);
                        return this.base.permissions;
                    }
                    return this.base.permissions = typeof arg === 'function' ? arg(this.base.permissions) : arg;
                }
                isExecutable() {
                    return getBit(this.base.permissions, FileSystem.Permissions.EXECUTE);
                }
                [baseGetterSymbol](symbol) {
                    assert(symbol === baseGetterSymbol);
                    return this.base;
                }
                assertPermission(permission, file = this.base) {
                    var _a;
                    assert(unrestricted || getBit(file.permissions, permission), `File '${(_a = file.name) !== null && _a !== void 0 ? _a : '<unknown>'} is not ${FileSystem.Permissions[permission].toLowerCase().replace(/[aeiou]$/, '')}able.'`);
                }
            }
            class File extends AbstractFile {
                static new() {
                    return new File(new Base.File(null, now(), now(), now(), new ArrayBuffer(0), FileSystem.Permissions.READ | FileSystem.Permissions.WRITE, 0));
                }
                constructor(base) {
                    super(base);
                    this.base = base;
                    this.encoder = new TextEncoder();
                    this.decoder = new TextDecoder();
                }
                read(asString = false) {
                    this.assertPermission(FileSystem.Permissions.READ);
                    const value = this.base.read();
                    return asString ? this.decoder.decode(value) : value;
                }
                write(data, startoffset, trim) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    if (typeof data === 'string')
                        data = this.encoder.encode(data);
                    this.base.write(data, startoffset, trim);
                }
                getContentSize() {
                    this.assertPermission(FileSystem.Permissions.READ);
                    return this.base.contentSize;
                }
                locked(mode, func) {
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    return this.base.locked(mode, (lockedFile => func(new File(lockedFile))));
                }
            }
            class Directory extends AbstractFile {
                static new(base) {
                    return new Directory(base !== null && base !== void 0 ? base : new Base.Directory(null, now(), now(), now(), FileSystem.Permissions.READ | FileSystem.Permissions.WRITE | FileSystem.Permissions.EXECUTE, 0, [], []));
                }
                constructor(base) {
                    super(base);
                    this.base = base;
                }
                splitfp(path) {
                    if (typeof path === 'string') {
                        path = path.replace(new RegExp(String.raw `${escapeRegex(PATH_SEPARATOR)}$`, 'g'), '').split(new RegExp(String.raw `(?<!^)${escapeRegex(PATH_SEPARATOR)}|(?<=^${escapeRegex(PATH_SEPARATOR)})`, 'g'));
                        if (path[0] === '~')
                            path.splice(0, 1, ...this.splitfp(homeDir));
                    }
                    return path;
                }
                get(path) {
                    var _a;
                    this.assertPermission(FileSystem.Permissions.READ);
                    const [first, ...rest] = this.splitfp(path);
                    const target = (() => {
                        switch (first) {
                            case '.':
                                return this;
                            case '..':
                                assert(this.getParentDirectory !== null, 'Directory has no parent');
                                return this.getParentDirectory();
                            case PATH_SEPARATOR:
                                return root;
                            default:
                                return this.wrap(this.base.get(first));
                        }
                    })();
                    if (rest.length) {
                        assert(target instanceof Directory, `Cannot resolve path. Expected a directory but found a file: '${(_a = target === null || target === void 0 ? void 0 : target.getName()) !== null && _a !== void 0 ? _a : '<none>'}'`);
                        return target.get(rest);
                    }
                    return target;
                }
                set(path, file) {
                    var _a, _b;
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    const { target, last } = this.preparePath(path);
                    assert(target instanceof Directory, `Cannot set '${last}' since ${(_b = (_a = target === null || target === void 0 ? void 0 : target.getName) === null || _a === void 0 ? void 0 : _a.call(target)) !== null && _b !== void 0 ? _b : '<unknown>'} is not a directory`);
                    if (target.has(last))
                        target.assertPermission(FileSystem.Permissions.WRITE, target.get(last)[baseGetterSymbol](baseGetterSymbol));
                    const newFile = target.base.set(last, file[baseGetterSymbol](baseGetterSymbol));
                    return this.wrap(newFile);
                }
                has(path, catchErrors = true) {
                    const impl = () => {
                        var _a, _b;
                        this.assertPermission(FileSystem.Permissions.READ);
                        const { target, last } = this.preparePath(path);
                        assert(target instanceof Directory, `Cannot check if '${last}' exists since ${(_b = (_a = target === null || target === void 0 ? void 0 : target.getName) === null || _a === void 0 ? void 0 : _a.call(target)) !== null && _b !== void 0 ? _b : '<unknown>'} is not a directory`);
                        return target.base.has(last);
                    };
                    if (catchErrors)
                        try {
                            return impl();
                        }
                        catch {
                            return false;
                        }
                    else
                        return impl();
                }
                typeof(path, catchErrors = true) {
                    const impl = () => {
                        this.assertPermission(FileSystem.Permissions.READ);
                        return this.get(path).constructor.name;
                    };
                    if (catchErrors)
                        try {
                            return impl();
                        }
                        catch {
                            return 'undefined';
                        }
                    else
                        return impl();
                }
                delete(path) {
                    var _a, _b;
                    this.assertPermission(FileSystem.Permissions.WRITE);
                    const { target, last } = this.preparePath(path);
                    assert(target instanceof Directory, `Cannot delete '${last}' exists since ${(_b = (_a = target === null || target === void 0 ? void 0 : target.getName) === null || _a === void 0 ? void 0 : _a.call(target)) !== null && _b !== void 0 ? _b : '<unknown>'} is not a directory`);
                    return this.wrap(target.base.delete(last));
                }
                keys({ includeHidden = false, includeSpecial = false } = {}) {
                    this.assertPermission(FileSystem.Permissions.READ);
                    return this.base.keys(includeHidden, includeSpecial);
                }
                isRoot() {
                    return this.base.isRoot;
                }
                preparePath(path) {
                    path = [...this.splitfp(path)];
                    const last = path.pop();
                    let target = this;
                    if (path.length)
                        target = this.get(path);
                    return { target, path, last };
                }
            }
            const root = Directory.new(this.root);
            return { Directory, File, root };
        }
        toObject() {
            return {
                type: FileSystem.name,
                pathSeparator: this.PATH_SEPARATOR,
                root: this.root.toObject()
            };
        }
        static fromObject(object) {
            assert(object.type === FileSystem.name, `Unable restore file system from object that is not a file system representation`);
            return FileSystem.new(object.pathSeparator, Base.Directory.fromObject(object.root));
        }
        static isFile(resource) {
            return typeof resource !== 'string' && Reflect.get(resource, Symbol.toStringTag) === 'File';
        }
    }
    VFS.FileSystem = FileSystem;
    (function (FileSystem) {
        let Permissions;
        (function (Permissions) {
            Permissions[Permissions["READ"] = 4] = "READ";
            Permissions[Permissions["WRITE"] = 2] = "WRITE";
            Permissions[Permissions["EXECUTE"] = 1] = "EXECUTE";
        })(Permissions = FileSystem.Permissions || (FileSystem.Permissions = {}));
        let Attributes;
        (function (Attributes) {
            Attributes[Attributes["HIDDEN"] = 1] = "HIDDEN";
            Attributes[Attributes["TEMPORARY"] = 2] = "TEMPORARY"; //NYI
        })(Attributes = FileSystem.Attributes || (FileSystem.Attributes = {}));
        let LockMode;
        (function (LockMode) {
            LockMode[LockMode["UNLOCKED"] = 0] = "UNLOCKED";
            LockMode[LockMode["WRITE"] = 1] = "WRITE";
            LockMode[LockMode["READ"] = 2] = "READ";
        })(LockMode = FileSystem.LockMode || (FileSystem.LockMode = {}));
    })(FileSystem = VFS.FileSystem || (VFS.FileSystem = {}));
    let Streams;
    (function (Streams) {
        function FileWriteStream(file, { mode = 'number' } = {}) {
            const cqs = new CountQueuingStrategy({ highWaterMark: 1 });
            return mode === 'number' ?
                new WritableStream({
                    write(chunk) {
                        file.write(new Uint8Array([chunk]));
                    }
                }, cqs)
                :
                    new WritableStream({
                        write(chunk) {
                            file.write(chunk);
                        }
                    }, cqs);
        }
        Streams.FileWriteStream = FileWriteStream;
        function DocumentWriteStream(document = globalThis.document, { mode = 'number' } = {}) {
            const cqs = new CountQueuingStrategy({ highWaterMark: 1 }), decoder = new TextDecoder();
            return mode === 'number' ?
                new WritableStream({
                    write(chunk) {
                        document.write(decoder.decode(new Uint8Array([chunk]), { stream: true }));
                    }
                }, cqs)
                :
                    new WritableStream({
                        write(chunk) {
                            document.write(decoder.decode(chunk, { stream: true }));
                        }
                    }, cqs);
        }
        Streams.DocumentWriteStream = DocumentWriteStream;
        function FileReadStream(file) {
            return iteratorToStream(new Uint8Array(file.read()).values());
        }
        Streams.FileReadStream = FileReadStream;
        function iteratorToStream(iterator) {
            return new ReadableStream({
                async pull(controller) {
                    const { value, done } = await iterator.next();
                    if (done)
                        controller.close();
                    else
                        controller.enqueue(value);
                }
            });
        }
    })(Streams = VFS.Streams || (VFS.Streams = {}));
    function download(resource, name) {
        var _a;
        function isFile(resource) {
            return typeof resource !== 'string' && Reflect.get(resource, Symbol.toStringTag) === 'File';
        }
        if (isFile(resource)) {
            name !== null && name !== void 0 ? name : (name = (_a = resource.getName()) !== null && _a !== void 0 ? _a : undefined);
            resource = resource.read();
        }
        if (!(resource instanceof Blob))
            resource = new Blob([resource]);
        const objectURL = URL.createObjectURL(resource);
        Object.assign(document.createElement('a'), { href: objectURL, download: name !== null && name !== void 0 ? name : '', onclick() {
                requestAnimationFrame(() => URL.revokeObjectURL(objectURL));
            } }).click();
    }
    VFS.download = download;
})(VFS || (VFS = {}));
