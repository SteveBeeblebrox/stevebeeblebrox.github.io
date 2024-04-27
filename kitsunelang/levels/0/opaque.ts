///#pragma once
declare namespace OpaqueTypes {
    const type: unique symbol;
    export type Opaque<T,Ident> = T & {[type]:Ident};
}
type Opaque<T,Ident> = OpaqueTypes.Opaque<T,Ident>;