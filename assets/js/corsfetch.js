(function(proxy) {
    globalThis.corsFetch = function corsFetch(resource, options) {
        if(options?.method === 'POST')
            return fetch(resource, Object.assign(options??{},{mode:'no-cors'}));
        else
            return fetch(resource instanceof Request ? new Request(proxy+resource.url,resource) : proxy+resource, options);
    }
})('https://sianabeeblebrox-cors-fetch.glitch.me/');