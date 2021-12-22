# DOMLib
## Globals
### `$` & `$it`
```typescript
function $(selector: string, startNode: Node = document): Element | null
```
```typescript
var $it?: Element = undefined;
```
`$` is a shortcut for `Node.prototype.querySelector`. When called, the return value is stored in `$it` for later use. `$it` will be undefined until this function is called.
### `$$` & `$$it`
### `HTMLNode` (`HtmlNode`)
### `SVGNode` (`SvgNode`)
### `TextNode`
```typescript
function TextNode(content: string): Text
```
This function is a shortcut for `Document.prototype.createTextNode`.
### `CommentNode`
```typescript
function CommentNode(content: string): Comment
```
This function is a shortcut for `Document.prototype.createComment`.
### `$host`
```typescript
var $host?: Element
```
### `$last`
```typescript
var $last?: Element
```
## Other
### `$children`
### `$self`
```typescript
function $(selector: string): Element | null
```
### `$$self`
