(function() {
  const options = Object.fromEntries(new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries())
  
  function exportConst(name, value) {
    Object.defineProperty(globalThis, name, {
      get: () => value,
      set: () => {
        throw new TypeError('Assignment to constant variable.')}
    })
  }
  
  if('throws' in options)
    exportConst('throws', e => {throw e})
})();
