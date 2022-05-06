type VirtualEnv = {
    OLDPWD: string;
    PWD: string;
    HOME: string
}
type VFSEntryType = 'file' | 'directory' | 'undefined'
class VFS {
    public readonly SEPERATOR = '/'
    constructor(private fs: ArrayMap<string, VirtualFile>, private env: VirtualEnv){}

    private static escapeRegex(text: string) {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    private splitfp(path: Path): string[] {
        if(Array.isArray(path))
            return path;
        else
            return path.split(new RegExp(String.raw`(?<!^)${VFS.escapeRegex(this.SEPERATOR)}|(?<=^${VFS.escapeRegex(this.SEPERATOR)})`, 'g'));
    }

    touch(path: Path) {
        const absolute = this.resolveAs(path,'touch',['file','undefined']);
        const file = (this.fs.get(absolute) ?? {dateCreated: new Date()}) as VirtualFile;
        file.dateModified = new Date();
        this.fs.set(absolute, file);
    }

    rm(path: Path) {
        this.fs.delete(this.resolveAs(path,'remove',['file']));
    }

    mkdir(path: Path, recursive = false) {
        if(!recursive)
            this.fs.init(this.resolveAs(path, 'make directory', ['undefined']));
        else this.resolve(path).forEach((_,i,a)=> {
            const resolved = this.resolveAs(a.slice(0,i+1), 'make direcotry', ["directory","undefined"]);
            if(this.typeOfResolved(resolved) === "undefined")
                this.fs.init(resolved)
            else // already exists, walk it
                void 0;
        })
    }

    rmdir(path: Path) {
        this.fs.delete(this.resolveAs(path,'remove directory',['directory']));
    }

    cd(path: Path) {
        [this.env.OLDPWD, this.env.PWD] = [this.env.PWD, this.toAbsolutePath(this.resolveAs(path, 'navigate to directory', ['directory']))]
    }

    resolveAs(path: Path, action: string, accept: VFSEntryType[]): SomeArray<string> {
        const resolved = this.resolve(path), it = this.typeOfResolved(resolved);
        if(!accept.some(o=>o===it))
            throw new Error(`Could not ${action ?? 'access'} "${resolved}", it is ${it!=='undefined'?'a ':''}${it}`)
        return resolved;
    }

    dir(path: Path) {
        return this.fs.get(this.resolveAs(path, 'get direcotry', ['directory']));
    }

    mv(from: Path, to: Path) {
        let [resolvedFrom,resolvedTo] = [this.resolveAs(from, 'move from', ['directory', 'file']), this.resolveAs(to, 'move to', ['undefined'])]
    
        this.fs.set(resolvedTo, this.fs.get(resolvedFrom)!);
        this.fs.delete(resolvedFrom);
    }

    cp(from: Path, to: Path) {
        let [resolvedFrom,resolvedTo] = [this.resolveAs(from, 'copy from', ['directory', 'file']), this.resolveAs(to, 'copy to', ['undefined'])]
    
        this.fs.set(resolvedTo, this.fs.get(resolvedFrom)!);
    }

    pwd() {
        return this.env.PWD;
    }

    fwrite(path: Path, contents: JSONValue) {
        const file = (this.fs.get(this.resolveAs(path, 'write to file', ['file'])) as VirtualFile);
        file.contents = contents;
        file.dateModified = new Date();
    }

    fget(path: Path): JSONValue {
        return (this.fs.get(this.resolveAs(path, 'write to file', ['file'])) as VirtualFile).contents;
    }

    typeOf(path: Path): VFSEntryType {
        return this.typeOfResolved(this.resolve(path));
    }

    typeOfResolved(path: SomeArray<string>): VFSEntryType {
        try {
            const o = this.fs.get(path, false);
            return o === undefined ? 'undefined' : o instanceof ArrayMap ? 'directory' : 'file';
        } catch(ignoredResolveError) {
            throw new Error(`Could not find directory "${'TODO: Show where error occurred'}"`)
        }
    }

    resolve(path: Path): SomeArray<string> {
        const array = this.toAbsolutePath(path).replace(new RegExp(String.raw`^${VFS.escapeRegex(this.SEPERATOR)}`), '').split(this.SEPERATOR);
        if(!array.length) throw new Error(`Computed path for "${path}" cannot be resolved.`)
        else return array as SomeArray<string>;
    }

    toAbsolutePath(path: Path) {
        let pwdparts = this.splitfp(this.env.PWD);
        this.splitfp(path).forEach((part, index) => {
            switch(part) {
                case this.SEPERATOR: pwdparts = [this.SEPERATOR]; break;
                case '..': pwdparts.splice(index - 1, 1); break;
                case '.': break;
                default: 
                    if(index === 0 && part === '~')
                        pwdparts = this.splitfp(this.env.HOME);
                    else
                        pwdparts.push(part);
                    break;
            }
        })
        return pwdparts.join(this.SEPERATOR).replace(new RegExp(`^${VFS.escapeRegex(this.SEPERATOR)}(?=${VFS.escapeRegex(this.SEPERATOR)})`),'')
    }
    serialize() {
        return JSON.stringify({
            fs: JSON.stringify(this.fs, function replacer(key, value) {
                if(value instanceof ArrayMap) {
                    return Object.fromEntries([...value.entries()].map(([k,v])=>[k,v instanceof ArrayMap ? v : JSON.stringify(v)]));
                } else {
                    return value;
                }
            }),
            env: JSON.stringify(this.env)
        });
    }
    static deserialize(text: string): VFS {
        const {data, env} = JSON.parse(text);
        return new VFS(JSON.parse(data, function reviver(key, value) {
            if(typeof value === 'object' && value !== null) {
                return new ArrayMap(new Map(Object.entries(value)));
            }
            return JSON.parse(value);
        }), JSON.parse(env));
    }
}

type VirtualFile = {
    readonly dateCreated: Date,
    dateModified: Date
    flags: number,
    contents: JSONValue
}
type JSONValue = {[key: string]: JSONValue} | boolean | null | string | number;
type Path = string | string[]


//bugs can't resolve path "/", .. and . don't work trailing slashes in paths break