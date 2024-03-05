/// #define KITSUNE_LANG_LEVEL 3
/// #include "kitsunelang.ts"

// const x = (
//     @deprecated('warn')
//     decorated async function f(a) {
//         console.log(`${strc(a)}=${a}`)
//     }
// );


/**/
const x = 
    @deprecated('warn')
    decorated(async function f(a) {
        console.log(`${strc(a)}=${a}`)
    });
/**/

console.log(KitsuneLang.LEVEL)


console.log(x(1))