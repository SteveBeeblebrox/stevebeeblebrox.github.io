(function() {
  const options = Object.fromEntries(new URLSearchParams(Object.assign(document.createElement('a'),{href:document.currentScript.getAttribute('src')}).search).entries())
  const all = 'all' in options || Object.keys(options).length === 0
  
  if('include' in options || all) include = function(src) {
    return new Promise(resolve => document.head.appendChild(Object.assign(document.createElement('script'), {src, onload: resolve})));
  }
  
  if('throws' in options || all) throws = function(e) {
    throw e;
  }
})();
