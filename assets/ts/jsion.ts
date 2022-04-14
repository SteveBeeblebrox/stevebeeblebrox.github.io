namespace JSION {
    const
        COMMENT_PATTERN = /(?<!\\)(?:\\{2})*'(?:(?<!\\)(?:\\{2})*\\'|[^'])*(?<!\\)(?:\\{2})*'|(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(\([\S\s]*?(?<!\\)(?:\\\\)*\))/g,
        SINGLE_QUOTE_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|'([\S\s]*?(?<!\\)(?:\\\\)*)'/g,
        KEY_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|([a-zA-Z_$][0-9a-zA-Z_$]*)(?=\s*?:)/g,
        TRAILING_COMMA_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(,)(?=\s*?[}\]])/g,
        EMPTY_ARRAY_ITEM = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(?<=[\[,])(\s*?)(?=[,\]])/g,
        EMPTY_OBJECT_ITEM = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(?<=:)(\s*?)(?=[,}])/g,
        NULL_SHORTHAND_PATTERN = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(\?)/g,
        NUMBER_SEPERATOR = /(?<!\\)(?:\\{2})*"(?:(?<!\\)(?:\\{2})*\\"|[^"])*(?<!\\)(?:\\{2})*"|(?<=\d)(_)(?=\d)/g;
    export function parse(text: string, reviver?: ((this: any, key: string, value: any) => any) | undefined): any {
        return JSON.parse(text.replace(COMMENT_PATTERN, function(substring: string, ...args: any[]) {
            if(!args[0]) return substring
            return ''
        }).replace(SINGLE_QUOTE_PATTERN, function(substring: string, ...args: any[]) {
            if(args[0] === undefined) return substring
            return `"${args[0].replace(/"/g, '\\"').replace(/\\'/g, "'")}"`
        }).replace(KEY_PATTERN, function(substring: string, ...args: any[]) {
            if(!args[0]) return substring
            return `"${args[0]}"`
        }).replace(TRAILING_COMMA_PATTERN, function(substring: string, ...args: any[]) {
            if(!args[0]) return substring
            return ''
        }).replace(EMPTY_ARRAY_ITEM, function(substring: string, ...args: any[]) {
            if(args[0] === undefined) return substring
            return 'null'
        }).replace(EMPTY_OBJECT_ITEM, function(substring: string, ...args: any[]) {
            if(args[0] === undefined) return substring
            return 'null'
        }).replace(NULL_SHORTHAND_PATTERN, function(substring: string, ...args: any[]) {
            if(!args[0]) return substring
            return 'null'
        }).replace(NUMBER_SEPERATOR, function(substring: string, ...args: any[]) {
            if(!args[0]) return substring
            return ''
        }), reviver);
    }
    export let stringify = JSON.stringify;
}
