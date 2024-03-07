declare interface TreeArrayMethods<T> {
    push: Array<T>['push'];
    pop: Array<T>['pop'];

    unshift: Array<T>['unshift'];
    shift: Array<T>['shift'];

    splice: Array<T>['splice'];

    at: Array<T>['at'];

    length: Array<T>['length'];

    values: Array<T>['values'];
}

type SubTree<T, K extends Tree<T> = Tree<T>> = K & { parent: Tree<T> };
type StrayTree<T, K extends Tree<T> = Tree<T>> = K & { parent: undefined };

class Tree<T> implements TreeArrayMethods<Tree<T>> {
    private readonly children: SubTree<T, typeof this>[] = [];
    #parent: typeof this | undefined = undefined;
    constructor(
        public value: T
    ) { }

    get parent(): typeof this | undefined {
        return this.#parent;
    }

    #disown(other: undefined): undefined;
    #disown(other: typeof this): StrayTree<T, typeof this>;
    #disown(other: typeof this | undefined): StrayTree<T, typeof this> | undefined;
    #disown(other: typeof this | undefined): StrayTree<T, typeof this> | undefined {
        if (other !== undefined) {
            other.#parent = undefined;
        }
        return other as StrayTree<T, typeof this> | undefined;
    }

    #own(other: undefined): never;
    #own(other: Tree<T>): SubTree<T, typeof this>;
    #own(other: Tree<T> | undefined): SubTree<T, typeof this>;
    #own(other: Tree<T> | undefined): SubTree<T, typeof this> {
        if (other === undefined) {
            throw new Error('Cannot take ownership of undefined');
        }
        if (other === this) {
            throw new Error('Cannot take ownership of self')
        }
        if (other.parent !== undefined) {
            throw new Error('Cannot take ownership of a subtree');
        }

        let ancestor: typeof this | undefined = this;
        do {
            if (ancestor === other) {
                throw new Error('Cannot take ownership of ancestor');
            }
        } while (ancestor = ancestor.parent);

        other.#parent = this;
        return other as SubTree<T, typeof this>;
    }

    push(...items: typeof this[]): number {
        return this.children.push(...items.map(tree => this.#own(tree)));
    }
    pop(): StrayTree<T, typeof this> | undefined {
        return this.#disown(this.children.pop());
    }

    unshift(...items: typeof this[]): number {
        return this.children.unshift(...items.map(tree => this.#own(tree)));
    }
    shift(): StrayTree<T, typeof this> | undefined {
        return this.#disown(this.children.shift());
    }

    splice(start: number, deleteCount?: number | undefined): StrayTree<T, typeof this>[];
    splice(start: number, deleteCount: number, ...items: typeof this[]): StrayTree<T, typeof this>[];
    splice(start: number, deleteCount: number, ...items: typeof this[]): StrayTree<T, typeof this>[] {
        return this.children.splice(start, deleteCount, ...items.map(tree => this.#own(tree))).map(tree => this.#disown(tree));
    }

    at(index: number): SubTree<T, typeof this> | undefined {
        return this.children.at(index) as SubTree<T, typeof this> | undefined;
    }

    get length(): number {
        return this.children.length;
    }

    forEach(callbackfn: (value: SubTree<T, typeof this>, index: number, parent: typeof this) => void, thisArg?: any): void {
        if (thisArg !== undefined) {
            callbackfn = callbackfn.bind(thisArg);
        }
        return this.children.forEach((tree, index) => callbackfn(tree, index, this));
    }

    values(): IterableIterator<typeof this> {
        return this.children.values();
    }

    get [Symbol.toStringTag]() {
        return 'Tree';
    }

    get [Symbol.iterator]() {
        return this.children[Symbol.iterator];
    }
}