/*
MIT License

Copyright (c) 2021 SteveBeeblebrox

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
"use strict";
class SHMLFileInfoBase {
    constructor(flavor, version, compression = SHMLManager.NONE, encryption = SHMLManager.NONE, hashbang) {
        this.flavor = flavor;
        this.version = version;
        this.compression = compression;
        this.encryption = encryption;
        this.hashbang = hashbang;
        const word = /^[A-Z0-9-]*$/;
        if (!word.test(flavor))
            throw 'Invalid flavor.';
        if (!word.test(compression))
            throw 'Invalid compression type.';
        if (!word.test(encryption))
            throw 'Invalid encryption type.';
        if (hashbang && !/^#!.*?\n$/.test(hashbang))
            throw 'Invalid hashbang.';
    }
}
class SHMLFileInfo extends SHMLFileInfoBase {
    constructor(flavor, version, contents, compression, encryption, hashbang) {
        super(flavor, version, compression, encryption, hashbang);
        this.contents = contents;
    }
}
class ParseableSHMLFileInfo extends SHMLFileInfo {
    constructor(manager, flavor, version, contents, compression, encryption, hashbang) {
        super(flavor, version, contents, compression, encryption, hashbang);
        this.manager = manager;
    }
    toSHML() {
        const parse = this.manager.getParser(this.flavor, this.version);
        if (!parse)
            throw `Unsupported flavor ${this.flavor} ${this.version.toString()}`;
        return parse(this.contents);
    }
}
class Version {
    constructor(major, minor, patch, prerelease, buildmetadata) {
        this.prerelease = prerelease;
        this.buildmetadata = buildmetadata;
        this.major = this.asNumber(major, 'major');
        this.minor = this.asNumber(minor, 'minor');
        this.patch = this.asNumber(patch, 'patch');
        if (prerelease && !/^(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*$/.test(prerelease))
            throw 'Invalid prerelease version number.';
        if (buildmetadata && !/^[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*$/.test(buildmetadata))
            throw 'Invalid build metadata version number.';
    }
    asNumber(value, type) {
        if (typeof value === 'string')
            if (/^0|[1-9]\d*$/.test(value))
                value = parseInt(value, 10);
            else
                throw `Invalid ${type} version number.`;
        return value;
    }
    toString() {
        let result = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease)
            result += `-${this.prerelease}`;
        if (this.buildmetadata)
            result += `+${this.buildmetadata}`;
        return result;
    }
    static fromStrings(major, minor, patch, prerelease, buildmetadata) {
        let numbers = [major, minor, patch].map(str => parseInt(str, 10));
        if (numbers.some(number => isNaN(number)))
            throw 'Invalid version string.';
        return new Version(numbers[0], numbers[1], numbers[2], prerelease, buildmetadata);
    }
}
class SHMLManager {
    constructor(getParser, compression = {}, encryption = {}) {
        this.getParser = getParser;
        this.compression = compression;
        this.encryption = encryption;
        this.compression[SHMLManager.NONE] = this.encryption[SHMLManager.NONE] = {
            transform: SHMLManager.NO_TRANSFORM,
            detransform: SHMLManager.NO_TRANSFORM
        };
    }
    getInfo(source) {
        var _a, _b;
        const match = SHMLManager.PATTERN.exec(source);
        if (match === null)
            throw 'Invalid file.';
        const compressionType = (_a = match.groups.compression) !== null && _a !== void 0 ? _a : SHMLManager.NONE;
        const encryptionType = (_b = match.groups.encryption) !== null && _b !== void 0 ? _b : SHMLManager.NONE;
        const flavor = match.groups.flavor;
        const version = new Version(match.groups.major, match.groups.minor, match.groups.patch, match.groups.prerelease, match.groups.buildmetadata);
        return new SHMLFileInfoBase(flavor, version, compressionType, encryptionType, match.groups.hashbang);
    }
    async read(source, passwordSupplier) {
        var _a, _b;
        const match = SHMLManager.PATTERN.exec(source);
        if (match === null)
            throw 'Invalid file.';
        const compressionType = (_a = match.groups.compression) !== null && _a !== void 0 ? _a : SHMLManager.NONE;
        const encryptionType = (_b = match.groups.encryption) !== null && _b !== void 0 ? _b : SHMLManager.NONE;
        let password = undefined;
        if (encryptionType !== SHMLManager.NONE) {
            if (!passwordSupplier)
                throw 'A password is required to read this file and no supplier was provided.';
            if (typeof passwordSupplier === 'string')
                password = passwordSupplier;
            else
                password = await passwordSupplier();
            if (!password)
                throw 'A password is required to read this file and none was provided.';
        }
        const flavor = match.groups.flavor;
        const version = new Version(match.groups.major, match.groups.minor, match.groups.patch, match.groups.prerelease, match.groups.buildmetadata);
        const compressionManager = this.compression[compressionType];
        if (!compressionManager)
            throw `Unsupported compression type ${compressionType}.`;
        const encryptionManager = this.encryption[encryptionType];
        if (!encryptionManager)
            throw `Unsupported encryption type ${encryptionType}.`;
        const contents = await encryptionManager.detransform(await compressionManager.detransform(match.groups.contents), password);
        return new ParseableSHMLFileInfo(this, flavor, version, contents, compressionType, encryptionType, match.groups.hashbang);
    }
    async write(source, passwordSupplier) {
        var _a;
        const compressionType = source.compression;
        const encryptionType = source.encryption;
        let password = undefined;
        if (encryptionType !== SHMLManager.NONE) {
            if (!passwordSupplier)
                throw 'A password is required to read this file and no supplier was provided.';
            if (typeof passwordSupplier === 'string')
                password = passwordSupplier;
            else
                password = await passwordSupplier();
            if (!password)
                throw 'A password is required to read this file and none was provided.';
        }
        const compressionManager = this.compression[compressionType];
        if (!compressionManager)
            throw `Unsupported compression type ${compressionType}.`;
        const encryptionManager = this.encryption[encryptionType];
        if (!encryptionManager)
            throw `Unsupported encryption type ${encryptionType}.`;
        const contents = await compressionManager.transform(await encryptionManager.transform(source.contents, password));
        let header = `${(_a = source.hashbang) !== null && _a !== void 0 ? _a : ''}:${source.flavor}:${source.version.toString()}:`;
        if (encryptionType !== SHMLManager.NONE)
            header += `${compressionType}:${encryptionType}:`;
        else if (compressionType !== SHMLManager.NONE)
            header += `${compressionType}:`;
        return `${header}\n${contents}`;
    }
}
SHMLManager.PATTERN = /^(?<hashbang>#!.*?\n)?:(?<flavor>[A-Z0-9-]*?):(?:(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?):(?:(?<compression>[A-Z0-9-]*?):)?(?:(?<encryption>[A-Z0-9-]*?):)?\n(?<contents>[\s\S]*)/;
SHMLManager.NONE = 'NONE';
SHMLManager.NO_TRANSFORM = ((a) => a);
