var FileFlags;
(function (FileFlags) {
    FileFlags[FileFlags["READ"] = 1] = "READ";
    FileFlags[FileFlags["WRITE"] = 2] = "WRITE";
    FileFlags[FileFlags["EXECUTE"] = 4] = "EXECUTE";
})(FileFlags || (FileFlags = {}));
class VFS {
    constructor(fs = new ArrayMap(), HOME = '') {
        this.fs = fs;
        this.HOME = HOME;
        this.SEPARATOR = '/';
        this.PWD = this.SEPARATOR;
        this.OLDPWD = this.SEPARATOR;
        this.HOME || (this.HOME = this.SEPARATOR);
        if (this.HOME !== this.SEPARATOR)
            this.mkdir('~', true);
    }
    static escapeRegex(text) {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    splitfp(path) {
        if (Array.isArray(path))
            return path;
        else
            return path.split(new RegExp(String.raw `(?<!^)${VFS.escapeRegex(this.SEPARATOR)}|(?<=^${VFS.escapeRegex(this.SEPARATOR)})`, 'g'));
    }
    touch(path) {
        var _a;
        const absolute = this.resolveAs(path, 'touch', ['file', 'undefined']);
        const file = ((_a = this.fs.get(absolute)) !== null && _a !== void 0 ? _a : { dateCreated: +new Date(), flags: 0b001 | 0b010, contents: null });
        file.dateModified = +new Date();
        this.fs.set(absolute, file);
    }
    rm(path) {
        this.fs.delete(this.resolveAs(path, 'remove', ['file']));
    }
    mkdir(path, recursive = false, skippable = false) {
        if (!recursive) {
            if (!skippable)
                this.fs.init(this.resolveAs(path, 'make directory', ['undefined']));
            else if (this.typeOf(path) === 'directory') // already exists
                void 0;
        }
        else
            this.resolve(path).forEach((_, i, a) => {
                const resolved = this.resolveAs(a.slice(0, i + 1), 'make directory', ['directory', 'undefined']);
                if (this.typeOfResolved(resolved) === "undefined")
                    this.fs.init(resolved);
                else // already exists, walk it
                    void 0;
            });
    }
    rmdir(path) {
        this.fs.delete(this.resolveAs(path, 'remove directory', ['directory']));
    }
    cd(path) {
        this.resolveAs(path, 'navigate to directory', ['directory'], true);
        [this.OLDPWD, this.PWD] = [this.PWD, this.toAbsolutePath(path)];
    }
    fname(path) {
        return [...this.resolve(path)].pop();
    }
    mv(from, to) {
        const resolvedFrom = this.resolveAs(from, 'move from', ['directory', 'file']);
        let resolvedTo = this.resolveAs(to, 'move to', ['directory', 'undefined'], true);
        if (this.typeOfResolved(resolvedTo) === 'directory')
            resolvedTo = (this.resolveAs([this.SEPARATOR, ...resolvedTo, this.fname(resolvedFrom)], 'move to', ['undefined', this.typeOfResolved(resolvedFrom)]));
        else if (this.isResolvedRoot(resolvedTo))
            resolvedTo = (this.resolveAs([this.SEPARATOR, this.fname(resolvedFrom)], 'move to', ['undefined', this.typeOfResolved(resolvedFrom)]));
        this.fs.set(resolvedTo, this.fs.get(resolvedFrom));
        this.fs.delete(resolvedFrom);
    }
    cp(from, to) {
        const resolvedFrom = this.resolveAs(from, 'copy from', ['directory', 'file']), resolvedTo = this.resolveAs(to, 'copy to', ['undefined', this.typeOfResolved(resolvedFrom)]);
        if (this.typeOfResolved(resolvedFrom) === 'directory')
            this.fs.set(resolvedTo, VFS.deserialize(new VFS(this.fs.get(resolvedFrom), this.SEPARATOR).serialize()).fs);
        else
            this.fs.set(resolvedTo, JSON.parse(JSON.stringify(this.fs.get(resolvedFrom))));
    }
    pwd() {
        return this.PWD;
    }
    oldpwd() {
        return this.OLDPWD;
    }
    write(path, contents) {
        const file = this.fs.get(this.resolveAs(path, 'write to file', ['file']));
        file.contents = contents;
        file.dateModified = +new Date();
    }
    cat(path) {
        return this.fs.get(this.resolveAs(path, 'read file', ['file'])).contents;
    }
    typeOf(path) {
        return this.typeOfResolved(this.resolve(path));
    }
    ls(path = this.PWD, includeHidden = false, recursive = false) {
        let k;
        let names = [...this.getOptionallyRoot(k = this.resolveAs(path, 'list', ['directory'], true)).keys()];
        if (!includeHidden)
            names = names.filter(o => !o[0].startsWith('.'));
        if (!recursive)
            return names.map((p) => this.toAbsolutePath(this.isResolvedRoot(k) ? [this.SEPARATOR, ...p] : [this.SEPARATOR, ...k, ...p]));
        else
            return names.map((p) => {
                if (this.typeOfResolved(p) === 'directory')
                    return this.ls(p, includeHidden, recursive);
                else
                    return this.toAbsolutePath(this.isResolvedRoot(k) ? [this.SEPARATOR, ...p] : [...k, ...p]);
            }).flat();
    }
    resolveAs(path, action, accept, allowRoot = false) {
        const resolved = this.resolve(path), it = this.typeOfResolved(resolved);
        if (this.isResolvedRoot(resolved) && allowRoot)
            return resolved;
        if (!accept.some(o => o === it))
            throw new Error(`Could not ${action !== null && action !== void 0 ? action : 'access'} "${resolved}", it is ${it !== 'undefined' ? 'a ' : ''}${it}`);
        return resolved;
    }
    isResolvedRoot(resolved) {
        return resolved.length === 1 && resolved[0] === '';
    }
    getOptionallyRoot(resolved) {
        if (this.isResolvedRoot(resolved))
            return this.fs;
        else
            return this.fs.get(resolved);
    }
    checkFileFlagResolved(resolved, flag) {
        if (!(this.fs.get(resolved).flags & FileFlags[flag.toUpperCase()]))
            throw new Error(`Missing permission "${flag} (${FileFlags[flag.toUpperCase()]}) for ${resolved}"`);
    }
    typeOfResolved(path) {
        try {
            const o = this.fs.get(path, false);
            return o === undefined ? 'undefined' : o instanceof ArrayMap ? 'directory' : 'file';
        }
        catch (ignoredResolveError) {
            throw new Error(`Could not find directory "${ignoredResolveError}"`);
        }
    }
    resolve(path) {
        const array = this.toAbsolutePath(path).replace(new RegExp(String.raw `^${VFS.escapeRegex(this.SEPARATOR)}|${VFS.escapeRegex(this.SEPARATOR)}$`, 'g'), '').split(this.SEPARATOR);
        if (!array.length)
            throw new Error(`Computed path for "${path}" cannot be resolved.`);
        else
            return array;
    }
    chmod(path, ...flags) {
        var _a;
        const file = this.fs.get(this.resolveAs(path, 'chmod', ['file']));
        const overrides = Object.assign(Object.create(null), { r: 'read', w: 'write', e: 'execute' });
        for (const flag of flags) {
            const b = FileFlags[((_a = overrides[flag.substring(1)]) !== null && _a !== void 0 ? _a : flag.substring(1)).toUpperCase()];
            if (flag.charAt(0) === '+')
                file.flags |= b;
            else if (flag.charAt(0) === '-')
                file.flags &= (2 ** 3 - 1) & ~b;
        }
    }
    toAbsolutePath(path) {
        let pwdparts = this.splitfp(this.PWD);
        this.splitfp(path).forEach((part, index) => {
            switch (part) {
                case this.SEPARATOR:
                    pwdparts = [this.SEPARATOR];
                    break;
                case '..':
                    pwdparts.splice(index - 1, 1);
                    break;
                case '.': break;
                default:
                    if (index === 0 && part === '~')
                        pwdparts = this.splitfp(this.HOME);
                    else
                        pwdparts.push(part);
                    break;
            }
        });
        return pwdparts.join(this.SEPARATOR).replace(new RegExp(`^${VFS.escapeRegex(this.SEPARATOR)}(?=${VFS.escapeRegex(this.SEPARATOR)})`), '');
    }
    serialize() {
        return JSON.stringify({
            fs: JSON.stringify(this.fs, function replacer(key, value) {
                if (value instanceof ArrayMap)
                    return Object.fromEntries([...value.entries()].map(([k, v]) => [k, v instanceof ArrayMap ? v : JSON.stringify(v)]));
                else
                    return value;
            }),
            home: this.HOME
        });
    }
    static deserialize(text) {
        const { fs, home } = JSON.parse(text);
        return new VFS(JSON.parse(fs, function reviver(key, value) {
            if (typeof value === 'object' && value !== null)
                return new ArrayMap(new Map(Object.entries(value)));
            else
                return JSON.parse(value);
        }), home);
    }
    static load(key) {
        const vfs = globalThis.localStorage.getItem(key) !== null ? VFS.deserialize(LZWCompression.unzip(globalThis.localStorage.getItem(key))) : new VFS();
        vfs.saveKey = key;
        return vfs;
    }
    save(key = this.saveKey) {
        if (!key)
            throw new Error('Unable to save, no key found');
        else
            globalThis.localStorage.setItem(key !== null && key !== void 0 ? key : this.saveKey, LZWCompression.zip(this.serialize()));
    }
}
