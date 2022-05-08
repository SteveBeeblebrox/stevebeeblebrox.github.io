enum FileFlags {
    READ = 1,
    WRITE = 2,
    EXECUTE = 4,
}

namespace VFS {
    export type VirtualDirectory = ArrayMap<string,VirtualFile>;
    export type VirtualFile = {
        readonly dateCreated: number,
        dateModified: number
        flags: number,
        contents: JSONValue,
    }
    export type JSONValue = {[key: string]: JSONValue} | boolean | null | string | number | JSONValue[];
    export type Path = string | string[]
    export type ResolvedPath = ArrayMap.SomeArray<string>
    export type EntryType = 'file' | 'directory' | 'undefined'
    export type FileFlag = Lowercase<keyof typeof FileFlags>
}

class VFS {
    private saveKey?: string;
    public readonly SEPARATOR = '/'
    private PWD: string = this.SEPARATOR;
    private OLDPWD: string = this.SEPARATOR;
    constructor(private fs: VFS.VirtualDirectory = new ArrayMap(), private readonly HOME: string = '') {
        this.HOME ||= this.SEPARATOR;
        if(this.HOME !== this.SEPARATOR) this.mkdir('~', true);
    }

    private static escapeRegex(text: string) {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    private splitfp(path: VFS.Path): string[] {
        if(Array.isArray(path))
            return path;
        else
            return path.split(new RegExp(String.raw`(?<!^)${VFS.escapeRegex(this.SEPARATOR)}|(?<=^${VFS.escapeRegex(this.SEPARATOR)})`, 'g'));
    }

    touch(path: VFS.Path) {
        const absolute = this.resolveAs(path,'touch',['file','undefined']);
        const file: VFS.VirtualFile = (this.fs.get(absolute) as VFS.VirtualFile ?? {dateCreated: +new Date(), flags: 0b001 | 0b010, contents: null} as VFS.VirtualFile);
        file.dateModified = +new Date();
        this.fs.set(absolute, file);
    }

    rm(path: VFS.Path) {
        this.fs.delete(this.resolveAs(path,'remove',['file']));
    }

    mkdir(path: VFS.Path, recursive = false, skippable = false) {
        if(!recursive) {
            if(!skippable) this.fs.init(this.resolveAs(path, 'make directory',['undefined']));
            else if(this.typeOf(path) === 'directory') // already exists
                void 0;
       } else this.resolve(path).forEach((_,i,a)=> {
            const resolved = this.resolveAs(a.slice(0,i+1), 'make directory', ['directory','undefined']);
            if(this.typeOfResolved(resolved) === "undefined")
                this.fs.init(resolved)
            else // already exists, walk it
                void 0;
        })
    }

    rmdir(path: VFS.Path) {
        this.fs.delete(this.resolveAs(path,'remove directory',['directory']));
    }

    cd(path: VFS.Path) {
        this.resolveAs(path, 'navigate to directory', ['directory'], true);
        [this.OLDPWD, this.PWD] = [this.PWD, this.toAbsolutePath(path)]
    }

    fname(path: VFS.Path) {
        return [...this.resolve(path)].pop()!
    }

    mv(from: VFS.Path, to: VFS.Path) {
        const resolvedFrom = this.resolveAs(from, 'move from', ['directory', 'file'])
        let resolvedTo = this.resolveAs(to, 'move to', ['directory','undefined'], true);

        if(this.typeOfResolved(resolvedTo) === 'directory')
            resolvedTo = (this.resolveAs([this.SEPARATOR, ...resolvedTo, this.fname(resolvedFrom)], 'move to', ['undefined',this.typeOfResolved(resolvedFrom)]));
        else if(this.isResolvedRoot(resolvedTo))
            resolvedTo = (this.resolveAs([this.SEPARATOR, this.fname(resolvedFrom)], 'move to', ['undefined',this.typeOfResolved(resolvedFrom)]));

        this.fs.set(resolvedTo, this.fs.get(resolvedFrom)!);
        this.fs.delete(resolvedFrom);
    }

    cp(from: VFS.Path, to: VFS.Path) {
        const resolvedFrom = this.resolveAs(from, 'copy from', ['directory', 'file']), resolvedTo=this.resolveAs(to, 'copy to', ['undefined',this.typeOfResolved(resolvedFrom)]);
    
        if(this.typeOfResolved(resolvedFrom) === 'directory')
            this.fs.set(resolvedTo, VFS.deserialize(new VFS(this.fs.get(resolvedFrom) as VFS.VirtualDirectory,this.SEPARATOR).serialize()).fs)
        else
            this.fs.set(resolvedTo, JSON.parse(JSON.stringify(this.fs.get(resolvedFrom)!)));
    }

    pwd() {
        return this.PWD;
    }

    oldpwd() {
        return this.OLDPWD;
    }

    write(path: VFS.Path, contents: VFS.JSONValue) {
        const file = (this.fs.get(this.resolveAs(path, 'write to file', ['file'])) as VFS.VirtualFile);
        file.contents = contents;
        file.dateModified = +new Date();
    }

    cat(path: VFS.Path): VFS.JSONValue {
        return (this.fs.get(this.resolveAs(path, 'read file', ['file'])) as VFS.VirtualFile).contents;
    }

    typeOf(path: VFS.Path): VFS.EntryType {
        return this.typeOfResolved(this.resolve(path));
    }

    ls(path: VFS.Path = this.PWD, includeHidden = false, recursive = false): string[] {
        let k: VFS.ResolvedPath;
        let names = [...(this.getOptionallyRoot(k=this.resolveAs(path, 'list', ['directory'], true)) as VFS.VirtualDirectory).keys()];
        if(!includeHidden) names = names.filter(o=>!o[0].startsWith('.'))
        if(!recursive) return names.map((p: VFS.ResolvedPath)=>this.toAbsolutePath(this.isResolvedRoot(k) ? [this.SEPARATOR,...p]:[this.SEPARATOR,...k,...p]))
        else return names.map((p: VFS.ResolvedPath) => {
            if(this.typeOfResolved(p) === 'directory') return this.ls(p, includeHidden, recursive)
            else return this.toAbsolutePath(this.isResolvedRoot(k)?[this.SEPARATOR,...p]:[...k,...p])
        }).flat();

    }

    private resolveAs(path: VFS.Path, action: string, accept: VFS.EntryType[], allowRoot = false): VFS.ResolvedPath {
        const resolved = this.resolve(path), it = this.typeOfResolved(resolved);

        if(this.isResolvedRoot(resolved) && allowRoot) return resolved;

        if(!accept.some(o=>o===it))
            throw new Error(`Could not ${action ?? 'access'} "${resolved}", it is ${it!=='undefined'?'a ':''}${it}`)
        return resolved;
    }

    private isResolvedRoot(resolved: VFS.ResolvedPath): boolean {
        return resolved.length === 1 && resolved[0] === '';
    }
    private getOptionallyRoot(resolved: VFS.ResolvedPath) {
        if(this.isResolvedRoot(resolved)) return this.fs;
        else return this.fs.get(resolved);
    }

    private checkFileFlagResolved(resolved: VFS.ResolvedPath, flag: 'read' | 'write' | 'execute') {
        if(!((this.fs.get(resolved) as VFS.VirtualFile).flags & FileFlags[flag.toUpperCase() as Uppercase<VFS.FileFlag>])) throw new Error(`Missing permission "${flag} (${FileFlags[flag.toUpperCase() as Uppercase<VFS.FileFlag>]}) for ${resolved}"`)
    }

    private typeOfResolved(path: VFS.ResolvedPath): VFS.EntryType {
        try {
            const o = this.fs.get(path, false);
            return o === undefined ? 'undefined' : o instanceof ArrayMap ? 'directory' : 'file';
        } catch(ignoredResolveError) {
            throw new Error(`Could not find directory "${ignoredResolveError}"`)
        }
    }

    private resolve(path: VFS.Path): VFS.ResolvedPath {
        const array = this.toAbsolutePath(path).replace(new RegExp(String.raw`^${VFS.escapeRegex(this.SEPARATOR)}|${VFS.escapeRegex(this.SEPARATOR)}$`,'g'), '').split(this.SEPARATOR);
        if(!array.length) throw new Error(`Computed path for "${path}" cannot be resolved.`)
        else return array as VFS.ResolvedPath;
    }

    chmod(path: VFS.Path, ...flags: `${'+'|'-'}${VFS.FileFlag|'r'|'w'|'x'}`[]) {
        const file = this.fs.get(this.resolveAs(path, 'chmod', ['file'])) as VFS.VirtualFile;
        const overrides: {[key:string]:string} = Object.assign(Object.create(null),{r:'read',w:'write',e:'execute'});
        for(const flag of flags) {
            const b = FileFlags[(overrides[flag.substring(1)] ?? flag.substring(1)).toUpperCase() as Uppercase<VFS.FileFlag>]
            if(flag.charAt(0) === '+')
                file.flags |= b;
            else if(flag.charAt(0) === '-')
                file.flags &= (2**3-1) & ~b;
        }
    }

    toAbsolutePath(path: VFS.Path) {
        let pwdparts = this.splitfp(this.PWD);
        this.splitfp(path).forEach((part, index) => {
            switch(part) {
                case this.SEPARATOR: pwdparts = [this.SEPARATOR]; break;
                case '..': pwdparts.splice(index - 1, 1); break;
                case '.': break;
                default: 
                    if(index === 0 && part === '~')
                        pwdparts = this.splitfp(this.HOME);
                    else
                        pwdparts.push(part);
                    break;
            }
        })
        return pwdparts.join(this.SEPARATOR).replace(new RegExp(`^${VFS.escapeRegex(this.SEPARATOR)}(?=${VFS.escapeRegex(this.SEPARATOR)})`),'')
    }
    serialize() {
        return JSON.stringify({
            fs: JSON.stringify(this.fs, function replacer(key, value) {
                if(value instanceof ArrayMap)
                    return Object.fromEntries([...value.entries()].map(([k,v])=>[k,v instanceof ArrayMap ? v : JSON.stringify(v)]));
                else
                    return value;
            }),
            home: this.HOME
        });
    }
    static deserialize(text: string): VFS {
        const {fs, home} = JSON.parse(text);
        return new VFS(JSON.parse(fs, function reviver(key, value) {
            if(typeof value === 'object' && value !== null)
                return new ArrayMap(new Map(Object.entries(value)));
            else
                return JSON.parse(value);
        }), home);
    }
    static load(key: string) {
        const vfs = globalThis.localStorage.getItem(key) !== null ? VFS.deserialize(LZWCompression.unzip(globalThis.localStorage.getItem(key)!)) : new VFS();
        vfs.saveKey = key;
        return vfs;
    }
    save(key: string | undefined = this.saveKey) {
        if(!key) throw new Error('Unable to save, no key found')
        else globalThis.localStorage.setItem(key ?? this.saveKey, LZWCompression.zip(this.serialize()));
    }
}