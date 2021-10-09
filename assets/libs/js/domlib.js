/*
 * MIT License
 * 
 * Copyright (c) 2021 S. Beeblebrox
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function() {
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

  ShadowRoot.prototype.$ = SVGElement.prototype.$ = HTMLElement.prototype.$ = function(selector) {
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

  ShadowRoot.prototype.$$ = SVGElement.prototype.$$ = HTMLElement.prototype.$$ = function(selector) {
    if(selector instanceof Array) {
      selector = interpolate(selector, [...arguments].slice(1))
    }
    return $$(selector, this);
  }

  HtmlNode = function(type, data = {}) {
    const element = document.createElement(type)
    for(const key in data)
      if(key in element) 
        element[key] = data[key]
      else 
        element.setAttribute(key, data[key])

    if('children' in data && data.children instanceof Array)
      for(const child of data.children)
        element.appendChild(child)

    if('style' in data && typeof(data.style) === 'object')
      for(const property in data.style)
        element.style[property] = data.style[property]

    return element
  }

  SvgNode = function(type, data = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type)

    if(type === 'svg') element.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    for(const key in data)
      if((key === 'children' && data[key] instanceof Array) || (key === 'style' && typeof(data[key]) === 'object'))
          continue
      else if(key in element && typeof data[key] === 'function')
        element[key] = data[key]
      else 
        element.setAttribute(key, data[key])

    if('children' in data && data.children instanceof Array)
      for(const child of data.children)
        element.appendChild(child)

    if('style' in data && typeof(data.style) === 'object')
      for(const property in data.style)
        element.style[property] = data.style[property]

    return element
  }
  
  TextNode = function(content) {
    return document.createTextNode(content)  
  }
})();
