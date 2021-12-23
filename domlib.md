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
When on a script tag, this variable references the parent of the script tag. When in an event listener, this variable is the receiving element. In all other situations, it is undefined.
### `$last`
```typescript
var $last?: Element
```
This variable store a reference to the element most recently added element while loading the page. Once the page is fully loaded, this variable will be undefined.
## Other
### `$children`
### `$self`
```typescript
function $(selector: string): Element | null
```
### `$$self`
