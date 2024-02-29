/// #define KITSUNE_LANG_LEVEL 3
/// #include "kitsunelang.ts"

const x = (
    @deprecated('warn')
    constfn f(a) {
        console.log(`${strc(a)}=${a}`)
    }
);


console.log(KitsuneLang.LEVEL)


x(1)