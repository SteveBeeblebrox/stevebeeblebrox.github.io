namespace KitsuneLang {
    export namespace Internals {}
    // @ts-expect-error
    export const LEVEL: number = KITSUNE_LANG_LEVEL;
    ///#warning no version set
    export const VERSION = null;
}


/// #if KITSUNE_LANG_LEVEL >= 0
/// #include "levels/level0/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 1
/// #include "levels/level1/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 2
/// #include "levels/level2/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 3
/// #include "levels/level3/index.ts"
/// #endif

/// #if KITSUNE_LANG_LEVEL >= 4
/// #include "levels/level4/index.ts"
/// #endif