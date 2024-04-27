// var acorn = require("acorn")
// var escodegen = require("escodegen")

// let ast = acorn.parse("(1*__op__(ops.f)*1)", {ecmaVersion: 2020});

console.clear()

const ast = JSON.parse(`{"type":"Program","start":0,"end":19,"body":[{"type":"ExpressionStatement","start":0,"end":19,"expression":{"type":"BinaryExpression","start":1,"end":18,"left":{"type":"BinaryExpression","start":1,"end":16,"left":{"type":"Literal","start":1,"end":2,"value":1,"raw":"1"},"operator":"*","right":{"type":"CallExpression","start":3,"end":16,"callee":{"type":"Identifier","start":3,"end":9,"name":"__op__"},"arguments":[{"type":"MemberExpression","start":10,"end":15,"object":{"type":"Identifier","start":10,"end":13,"name":"ops"},"property":{"type":"Identifier","start":14,"end":15,"name":"f"},"computed":false,"optional":false}],"optional":false}},"operator":"*","right":{"type":"Literal","start":17,"end":18,"value":1,"raw":"1"}}}],"sourceType":"script"}`)

type Replacer = (node: JSONObject)=>void;
type JSONValue = number | string | boolean | null | JSONValue[] | JSONObject
type JSONObject = {[key: string]: JSONValue};
;(function visitAll(ast: JSONObject, callback: (node: JSONObject, replaceWith: Replacer)=>boolean|void) {
    const visited = new Set();
    (function visit(node: JSONObject, replaceWith: Replacer) {
        if(visited.has(node)) {
            return;
        }
        
        visited.add(node);

        callback(node,replaceWith); // todo t/f to keep going

        for(const [key,value] of Object.entries(node ?? {})) {
            if(isNode(value)) {
                visit(value,other => void(node[key] = other))
            } else if(Array.isArray(value) && isNode(value[0])) {
                for(let i = 0; i < value.length; i++) {
                    visit(value[i] as JSONObject, other => void(value[i] = other));
                }
            }
        }
    })(ast, other => void(ast=other));
})(ast, function(node: JSONObject, replaceWith) {
    try {
        const {
            type: t1,
            left: {
                type: t2,
                left: lhs,
                right: {
                    type: t3,
                    callee: {
                        type: t4,
                        name
                    },
                    arguments: [
                        expr
                    ]
                }
            },
            right: rhs
        } = node as any;

        if(t1 === 'BinaryExpression' && t2 === 'BinaryExpression' && t3 === 'CallExpression' && t4 === 'Identifier' && name === '__op__') {
            replaceWith({
                type: 'CallExpression',
                start: NaN,
                end: NaN,
                callee: expr,
                arguments: [
                    lhs,
                    rhs
                ]
            });
        }
    } catch {}
});

function isNode(value: unknown): value is JSONObject {
    return value !== null && typeof value === 'object' && 'type' in value;
}

// console.log(escodegen.generate(ast))
console.log(JSON.stringify(ast))