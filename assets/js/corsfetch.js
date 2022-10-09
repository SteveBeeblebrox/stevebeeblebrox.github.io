(function(proxy) {
    const _fetch = globalThis.fetch;
    globalThis.fetch = function fetch(resource, options) {
        const isRequest = resource instanceof Request, href = isRequest ? resource.url : resource;
        if(
            (!options?.method || options?.method === 'GET')
            && options?.mode !== 'no-cors'
            && Object.assign(document.createElement('a'),{href}).origin !== window.location.origin
        ) {
            if(isRequest)
                resource = new Request(`${proxy}/${href}`, resource);
            else
                resource = `${proxy}/${href}`;
        }

        return _fetch(resource, options);
    }
})('https://sianabeeblebrox-cors-fetch.glitch.me');