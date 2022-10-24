namespace CSV {
    function validateDelimiter(delimiter: string): void {
        if(delimiter.length !== 1) throw new Error('CSV delimiter must be exactly one character (code unit) long');
    }
    function escapeDelimiterForRegExp(delimiter: string): string {
        return delimiter.replace(/[.*+?^${}()|[\]\\\-]/g,String.raw`\$&`);
    }
    export function stringify(values: object[] | any[][], replacer?: ((this: any, key: string | null, value: any) => any) | undefined, {header = true, delimiter = ','}: {header?: boolean, delimiter?: string} = {}): string {
        validateDelimiter(delimiter);
        const quotePattern = new RegExp(String.raw`[\n${escapeDelimiterForRegExp(delimiter)}"]`);
        function q([key, value]: [string|null, any]): string {
            const s = `${replacer ? replacer(key, value) : value}`;
            return quotePattern.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
        }
        function l(values: [string|null, any][]): string {
            return values.map(q).join(delimiter);
        }
        return (header ? `${l(Object.keys(values[0]).map(key => [null, key]))}\n` : '') + values.map(o => l(Object.entries(o))).join('\n');
    }

    export function parse(text: string, reviver?: ((this: any, key: string | null, value: any) => any) | undefined, {header = true, delimiter = ','}: {header?: boolean, delimiter?: string} = {}): object[] | any[][] {
        validateDelimiter(delimiter);
        const
            escapedDelimiter = escapeDelimiterForRegExp(delimiter),
            pattern = new RegExp(String.raw`(${escapedDelimiter}|\r?\n|\r|^)(?:"((?:\\.|""|[^\\"])*)"|([^${escapedDelimiter}"\r\n]*))`,'gi'),
            entries: string[][] = [[]]
        ;
        let matches: RegExpExecArray | null = null;
        while (matches = pattern.exec(text)){
            if (matches[1].length && matches[1] !== delimiter)
                entries.push([]);
            entries.at(-1)!.push(
                matches[2] ? 
                    matches[2].replace(/[\\"](.)/g, '$1') :
                    matches[3] ?? ''
            );
        }
        if(!header || !entries.length) return entries.map((value, i) => reviver ? reviver(i.toString(), value) : value);
        const headerEntry = entries.shift()!.map(key => reviver ? reviver(null, key) : key);
        return entries.map(entry => Object.fromEntries(entry.map((value, i) => [headerEntry[i], reviver ? reviver(headerEntry[i], value) : value])));
    }

    export function fromCammelCase(s: string) {
        return s[0].toUpperCase() + s.slice(1).replace(/[A-Z]/, ' $&');
    }

    export function toCammelCase(s: string) {
        return s[0].toLowerCase() + s.slice(1).replaceAll(' ', '');
    }
}