(function() {
  const options = Object.fromEntries(new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries())
  
  if('include' in options) include = function(src) {
    return new Promise(resolve => document.head.appendChild(Object.assign(document.createElement('script'), {src, onload: resolve})));
  }
  
  if('throws' in options) throws = function(e) {
    throw e;
  }
})();
