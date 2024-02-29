/// #warning no header
namespace KitsuneLang {
    export namespace Internals {}
    // @ts-expect-error
    export const LEVEL: number = KITSUNE_LANG_LEVEL;
    ///#warning no version set
    export const VERSION = null;
}

/// #if KITSUNE_LANG_LEVEL >= 0
/// #include "levels/0/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 1
/// #include "levels/1/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 2
/// #include "levels/2/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 3
/// #include "levels/3/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 4
/// #include "levels/4/index.ts"
/// #endif