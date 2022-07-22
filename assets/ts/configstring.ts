/*
 * Format:
 * 
 *      name=value;name2=value2;name3=value3...
 *
 * Whitespace around keys and values is ignored and they both get %, =,and ; encoded.
 * To include a literal ; or =, encode them.
 * Most values are strings, however the following values are coerced into other types:
 * 
 *      value         |  type
 *      -----------------------
 *      true          | boolean
 *      false         | boolean
 *      null          | null
 *      <empty>       | null
 *      number string | number
 * 
 * If a string starts and ends with "" then the quotes are removed.
 * This can be used to force a value to a string or include whitespace.
 */
 namespace ConfigString {
    const SPECIAL_CHARS = '%=;'.split('').map(c=>[c,encodeURIComponent(c)]); // Encode % first, decode last
    function minimalEncode(text: string) {
        for(const [char, encoding] of SPECIAL_CHARS)
            text = text.replaceAll(char,encoding);
        return text;
    }
    function minimalDecode(text: string) {
        for(const [char, encoding] of SPECIAL_CHARS.reverse())
            text = text.replaceAll(encoding,char);
        return text;
    }
    export function parse(text: string) {
        function transform(value: string): any {
            const l = value.toLowerCase();
            return l === 'false' ? false 
            : l === 'true' ? true
            : l === 'null' ? null
            : value === '' ? null
            : value.match(/^\d+(?:\.\d+)?$/) ? +value
            : value.replace(/^"([\s\S]*)"$/, '$1');
        }
        return Object.fromEntries(
            text.split(';').filter(o=>o.trim()).map(function(entry) { 
                const [key, value] = entry.split('=');
                return [minimalDecode(key.trim()), transform(minimalDecode(value.trim()))];
            })
        );
    }

    export function stringify(value: object) {
        function transform(value: any) {
            return value === false ? 'false'
            :value === true ? 'true'
            : value === null ? 'null'
            : typeof value === 'number' ? value.toString()
            : value.replace(/^(?:true|false|null|"[\s\S]*"|\d+(?:\.\d+)?||(?:(?: [\s\S]*?)|(?:[\s\S]*? )))$/, '"$&"')
        }
        return Object.entries(value).map(([key,value])=>`${minimalEncode(key)}=${minimalEncode(transform(value))}`).join(';')
    }
}