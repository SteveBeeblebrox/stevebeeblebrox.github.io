(function() {
  const options = Object.fromEntries(new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries())
  
  function exportConst(name, value) {
    Object.defineProperty(globalThis, name, {
      get() {
        return value
      },
      set() {
        throw new TypeError('Assignment to constant variable.')}
    })
  }
  
  const constants = {
    throws(e) {
      throw e;
    },
    async include(src) {
      return new Promise(resolve => document.head.appendChild(Object.assign(document.createElement('script'), {src, onload: resolve})));
    }
  }
  
  for(const key in constants) if(key in options) exportConst(key, constants[key]);
})();
