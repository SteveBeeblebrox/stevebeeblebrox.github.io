function ElementArrayProxy(elements) {
	return new Proxy(elements, {
		set: function(target, property, value) {
			return target.forEach(o => o[property] = value), false;
		},
		get: function(target, property, reciever) {
			if(typeof property === 'symbol') return [...elements][property];
			if(property === '$toArray') return function() {return [...elements]}
			else if(property.startsWith('$') && property !== '$')
				if(typeof [...elements][property.substr(1)] === 'function') return function() {return [...elements][property.substr(1)](...arguments)}
				else return [...elements][property.substring(1)]

			return [...elements].some(o => typeof o[property] === 'function') ? function() {return [...elements].map(o => typeof o[property] === 'function' ? o[property](...arguments) : o[property])} : new ElementArrayProxy([...elements].map(o => o[property]));
		}
	});
}

function interpolate(strings, values) {
	let result = strings[0]
	for(let i = 0; i < values.length; i++) {
		result += values[i]
		result += strings[i+1]
	}
	return result;
}

$ = function(selector, startNode = document) {
	if(selector instanceof Array) {
		selector = interpolate(selector, [...arguments].slice(1))
		startNode = document
	}
	return $it = startNode.querySelector(selector);
}

_$ = $;

SVGElement.prototype.$ = HTMLElement.prototype.$ = function(selector) {
	if(selector instanceof Array) {
		selector = interpolate(selector, [...arguments].slice(1))
	}
	return $(selector, this);
}

$$ = function(selector, startNode = document) {
	if(selector instanceof Array) {
		selector = interpolate(selector, [...arguments].slice(1))
		startNode = document
	}
   
	return $$it = new ElementArrayProxy(startNode.querySelectorAll(selector));
}

_$$ = $$;

SVGElement.prototype.$$ = HTMLElement.prototype.$$ = function(selector) {
	if(selector instanceof Array) {
		selector = interpolate(selector, [...arguments].slice(1))
	}
	return $$(selector, this);
}

function HtmlNode(type, data = {}) {
	const element = document.createElement(type)
	for(const key in data)
		element[key] = data[key]

	if('children' in data && data.children instanceof Array)
		for(const child of data.children)
			element.appendChild(child)

	if('style' in data && typeof(data.style) === 'object')
		for(const property in data.style)
			element.style[property] = data.style[property]
   
	return element
}

function SvgNode(type, data = {}) {
	const element = document.createElementNS('http://www.w3.org/2000/svg', type)
	for(const key in data)
		element.setAttribute(key, data[key])

	if('children' in data && data.children instanceof Array)
		for(const child of data.children)
			element.appendChild(child)

	if('style' in data && typeof(data.style) === 'object')
		for(const property in data.style)
			element.style[property] = data.style[property]
   
	return element
}