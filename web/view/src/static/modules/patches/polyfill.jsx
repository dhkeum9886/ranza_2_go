(function(global) {
  let lastTime = 0
  let vendors = ['ms', 'moz', 'webkit', 'o']
  for (let x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame']
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] || global[vendors[x] + 'CancelRequestAnimationFrame']
  }

  if (!global.requestAnimationFrame)
    global.requestAnimationFrame = function(callback, element) {
      let currTime = new Date().getTime()
      let timeToCall = Math.max(0, 16 - (currTime - lastTime))
      let id = global.setTimeout(function() {
        callback(currTime + timeToCall)
      }, timeToCall)
      lastTime = currTime + timeToCall
      return id
    }

  if (!global.cancelAnimationFrame)
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id)
    }
})(typeof window !== 'undefined' ? window : this)

if (typeof HTMLElement != 'undefined' && !HTMLElement.prototype.insertAdjacentElement) {
  HTMLElement.prototype.insertAdjacentElement = function(where, parsedNode) {
    switch (where) {
      case 'beforeBegin':
        this.parentNode.insertBefore(parsedNode, this)
        break
      case 'afterBegin':
        this.insertBefore(parsedNode, this.firstChild)
        break
      case 'beforeEnd':
        this.appendChild(parsedNode)
        break
      case 'afterEnd':
        if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling)
        else this.parentNode.appendChild(parsedNode)
        break
    }
  }
}


if (typeof HTMLElement != 'undefined' && !HTMLElement.prototype.insertAdjacentHTML) {
  HTMLElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
    let r = this.ownerDocument.createRange()
    r.setStartBefore(this)
    let parsedHTML = r.createContextualFragment(htmlStr)
    this.insertAdjacentElement(where, parsedHTML)
  }
}


if (typeof HTMLElement != 'undefined' && !HTMLElement.prototype.insertAdjacentText) {
  HTMLElement.prototype.insertAdjacentText = function(where, txtStr) {
    let parsedText = document.createTextNode(txtStr)
    this.insertAdjacentElement(where, parsedText)
  }
}


if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
    }
    let aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {
    }, fBound = function() {
      return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)))
    }
    if (this.prototype) {
      fNOP.prototype = this.prototype
    }
    fBound.prototype = new fNOP()
    return fBound
  }
}

if (typeof Object.assign != 'function') {
  (function() {
    Object.assign = function(target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }

      let output = Object(target)
      for (let index = 1; index < arguments.length; index++) {
        let source = arguments[index]
        if (source !== undefined && source !== null) {
          for (let nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey]
            }
          }
        }
      }
      return output
    }
  })()
}

if (typeof Object.create != 'function') {
  Object.create = (function(undefined) {
    let Temp = function() {
    }
    return function(prototype, propertiesObject) {
      if (prototype !== Object(prototype) && prototype !== null) {
        throw TypeError('Argument must be an object, or null')
      }
      Temp.prototype = prototype || {}
      let result = new Temp()
      Temp.prototype = null
      if (propertiesObject !== undefined) {
        Object.defineProperties(result, propertiesObject)
      }
      if (prototype === null) {
        result.__proto__ = null
      }
      return result
    }
  })()
}

if (!Object.keys) {
  Object.keys = (function() {
    let hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({
        toString: null,
      }).propertyIsEnumerable('toString'), dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
      dontEnumsLength = dontEnums.length
    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object')
      }
      let result = [], prop, i
      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop)
        }
      }
      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i])
          }
        }
      }
      return result
    }
  }())
}

if (!Object.is) {
  Object.is = function(x, y) {
    if (x === y) {
      return x !== 0 || 1 / x === 1 / y
    } else {
      return x !== x && y !== y
    }
  }
}

if (!Array.clone) {
  Array.clone = function(array) {
    if (Array.isArray(array)) {
      return array.slice(0)
    } else {
      return []
    }
  }
}


if (!Array.from) {
  Array.from = (function() {
    let toStr = Object.prototype.toString
    let isCallable = function(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]'
    }
    let toInteger = function(value) {
      let number = Number(value)
      if (isNaN(number)) {
        return 0
      }
      if (number === 0 || !isFinite(number)) {
        return number
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number))
    }
    let maxSafeInteger = Math.pow(2, 53) - 1
    let toLength = function(value) {
      let len = toInteger(value)
      return Math.min(Math.max(len, 0), maxSafeInteger)
    }
    return function from(arrayLike/*, mapFn, thisArg */) {
      let C = this
      let items = Object(arrayLike)
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined')
      }
      let mapFn = arguments.length > 1 ? arguments[1] : void undefined
      let T
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function')
        }
        if (arguments.length > 2) {
          T = arguments[2]
        }
      }
      let len = toLength(items.length)
      let A = isCallable(C) ? Object(new C(len)) : new Array(len)
      let k = 0
      let kValue
      while (k < len) {
        kValue = items[k]
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k)
        } else {
          A[k] = kValue
        }
        k += 1
      }
      A.length = len
      return A
    }
  }())
}

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}

if (!Array.of) {
  Array.of = function() {
    return Array.prototype.slice.call(arguments)
  }
}

if (!Array.prototype.copyWithin) {
  Array.prototype.copyWithin = function(target, start/*, end*/) {
    if (this == null) {
      throw new TypeError('this is null or not defined')
    }
    let O = Object(this)
    let len = O.length >>> 0
    let relativeTarget = target >> 0
    let to = relativeTarget < 0 ? Math.max(len + relativeTarget, 0) : Math.min(relativeTarget, len)
    let relativeStart = start >> 0
    let from = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len)
    let end = arguments[2]
    let relativeEnd = end === undefined ? len : end >> 0
    let final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len)
    let count = Math.min(final - from, len - to)
    let direction = 1
    if (from < to && to < (from + count)) {
      direction = -1
      from += count - 1
      to += count - 1
    }
    while (count > 0) {
      if (from in O) {
        O[to] = O[from]
      } else {
        delete O[to]
      }
      from += direction
      to += direction
      count--
    }
    return O
  }
}

if (!Array.prototype.every) {
  Array.prototype.every = function(callbackfn, thisArg) {
    let T, k
    if (this == null) {
      throw new TypeError('this is null or not defined')
    }
    let O = Object(this)
    let len = O.length >>> 0
    if (typeof callbackfn !== 'function') {
      throw new TypeError()
    }
    if (arguments.length > 1) {
      T = thisArg
    }
    k = 0
    while (k < len) {
      let kValue
      if (k in O) {
        kValue = O[k]
        let testResult = callbackfn.call(T, kValue, k, O)
        if (!testResult) {
          return false
        }
      }
      k++
    }
    return true
  }
}

if (!Array.prototype.fill) {
  Array.prototype.fill = function(value) {
    if (this == null) {
      throw new TypeError('this is null or not defined')
    }
    let O = Object(this)
    let len = O.length >>> 0
    let start = arguments[1]
    let relativeStart = start >> 0
    let k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len)
    let end = arguments[2]
    let relativeEnd = end === undefined ? len : end >> 0
    let final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len)
    while (k < final) {
      O[k] = value
      k++
    }
    return O
  }
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    if (this === void 0 || this === null) {
      throw new TypeError()
    }
    let t = Object(this)
    let len = t.length >>> 0
    if (typeof fun !== 'function') {
      throw new TypeError()
    }
    let res = []
    let thisArg = arguments.length >= 2 ? arguments[1] : void 0
    for (let i = 0; i < len; i++) {
      if (i in t) {
        let val = t[i]
        if (fun.call(thisArg, val, i, t)) {
          res.push(val)
        }
      }
    }
    return res
  }
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined')
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function')
      }
      let list = Object(this)
      let length = list.length >>> 0
      let thisArg = arguments[1]
      let value

      for (let i = 0; i < length; i++) {
        value = list[i]
        if (predicate.call(thisArg, value, i, list)) {
          return value
        }
      }
      return undefined
    },
  })
}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined')
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function')
      }
      let list = Object(this)
      let length = list.length >>> 0
      let thisArg = arguments[1]
      let value

      for (let i = 0; i < length; i++) {
        value = list[i]
        if (predicate.call(thisArg, value, i, list)) {
          return i
        }
      }
      return -1
    },
    enumerable: false,
    configurable: false,
    writable: false,
  })
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    let T, k
    if (this === null) {
      throw new TypeError(' this is null or not defined')
    }
    let O = Object(this)
    let len = O.length >>> 0
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function')
    }
    if (arguments.length > 1) {
      T = thisArg
    }
    k = 0
    while (k < len) {
      let kValue
      if (k in O) {
        kValue = O[k]
        callback.call(T, kValue, k, O)
      }
      k++
    }
  }
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined')
    }
    let O = Object(this)
    let len = parseInt(O.length, 10) || 0
    if (len === 0) {
      return false
    }
    let n = parseInt(arguments[1], 10) || 0
    let k
    if (n >= 0) {
      k = n
    } else {
      k = len + n
      if (k < 0) {
        k = 0
      }
    }
    let currentElement
    while (k < len) {
      currentElement = O[k]
      if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true
      }
      k++
    }
    return false
  }
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    let k
    if (this == null) {
      throw new TypeError('"this" is null or not defined')
    }
    let o = Object(this)
    let len = o.length >>> 0
    if (len === 0) {
      return -1
    }
    let n = fromIndex | 0
    if (n >= len) {
      return -1
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)
    while (k < len) {
      if (k in o && o[k] === searchElement) {
        return k
      }
      k++
    }
    return -1
  }
}

if (!Array.prototype.keys) {
  Array.prototype.keys = function() {
    let rets = []
    this.forEach(function(element, index) {
      if (element != undefined && element != null) {
        rets.push(index)
      }
    })
    return rets
  }
}

if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
    if (this === void 0 || this === null) {
      throw new TypeError()
    }
    let n, k, t = Object(this), len = t.length >>> 0
    if (len === 0) {
      return -1
    }
    n = len - 1
    if (arguments.length > 1) {
      n = Number(arguments[1])
      if (n != n) {
        n = 0
      } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n))
      }
    }
    for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k
      }
    }
    return -1
  }
}

if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
    let T, A, k
    if (this == null) {
      throw new TypeError(' this is null or not defined')
    }
    let O = Object(this)
    let len = O.length >>> 0
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function')
    }
    if (arguments.length > 1) {
      T = thisArg
    }
    A = new Array(len)
    k = 0
    while (k < len) {
      let kValue, mappedValue
      if (k in O) {
        kValue = O[k]
        mappedValue = callback.call(T, kValue, k, O)
        A[k] = mappedValue
      }
      k++
    }
    return A
  }
}

if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback /*, initialValue*/) {
    if (this === null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined')
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function')
    }
    let t = Object(this), len = t.length >>> 0, k = 0, value
    if (arguments.length == 2) {
      value = arguments[1]
    } else {
      while (k < len && !(k in t)) {
        k++
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value')
      }
      value = t[k++]
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t)
      }
    }
    return value
  }
}

if (!Array.prototype.reduceRight) {
  Array.prototype.reduceRight = function(callback /*, initialValue*/) {
    if (null === this || 'undefined' === typeof this) {
      throw new TypeError('Array.prototype.reduce called on null or undefined')
    }
    if ('function' !== typeof callback) {
      throw new TypeError(callback + ' is not a function')
    }
    let t = Object(this), len = t.length >>> 0, k = len - 1, value
    if (arguments.length >= 2) {
      value = arguments[1]
    } else {
      while (k >= 0 && !(k in t)) {
        k--
      }
      if (k < 0) {
        throw new TypeError('Reduce of empty array with no initial value')
      }
      value = t[k--]
    }
    for (; k >= 0; k--) {
      if (k in t) {
        value = callback(value, t[k], k, t)
      }
    }
    return value
  }
}

(function() {
  let _slice = Array.prototype.slice

  try {
    _slice.call(document.documentElement)
  } catch (e) { // Fails in IE < 9
    Array.prototype.slice = function(begin, end) {
      end = (typeof end !== 'undefined') ? end : this.length
      if (Object.prototype.toString.call(this) === '[object Array]') {
        return _slice.call(this, begin, end)
      }
      let i, cloned = [], size, len = this.length
      let start = begin || 0
      start = (start >= 0) ? start : Math.max(0, len + start)
      let upTo = (typeof end == 'number') ? Math.min(end, len) : len
      if (end < 0) {
        upTo = len + end
      }
      size = upTo - start
      if (size > 0) {
        cloned = new Array(size)
        if (this.charAt) {
          for (i = 0; i < size; i++) {
            cloned[i] = this.charAt(start + i)
          }
        } else {
          for (i = 0; i < size; i++) {
            cloned[i] = this[start + i]
          }
        }
      }
      return cloned
    }
  }
}())

if (!Array.prototype.some) {
  Array.prototype.some = function(fun/*, thisArg*/) {
    if (this == null) {
      throw new TypeError('Array.prototype.some called on null or undefined')
    }
    if (typeof fun !== 'function') {
      throw new TypeError()
    }
    let t = Object(this)
    let len = t.length >>> 0
    let thisArg = arguments.length >= 2 ? arguments[1] : void 0
    for (let i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true
      }
    }
    return false
  }
}

if (!Array.prototype.flatten) {
  function _flatten(arr) {
    return arr.reduce(function(flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? _flatten(toFlatten) : toFlatten)
    }, [])
  }

  Array.prototype.flatten = function() {
    if (this == null) {
      throw new TypeError('Array.prototype.flatten called on null or undefined')
    }

    return _flatten(this)
  }
  /*Array.prototype.flatten = function () {
      if (this == null) {
          throw new TypeError('Array.prototype.flatten called on null or undefined');
      }
      let flat = [];
      for (let i = 0, l = this.length; i < l; i++){
          let type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
          if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? this.__flatten.call(this[i]) : this[i]); }
      }
      return flat;
  }*/
}

if (Uint8Array && !Uint8Array.prototype.toBase64) {
  Uint8Array.prototype.toBase64 = function() {
    let str = []
    let abLen = this.length
    let CHUNK_SIZE = 10240
    let offset, len, subab
    for (offset = 0; offset < abLen; offset += CHUNK_SIZE) {
      len = Math.min(CHUNK_SIZE, abLen - offset)
      subab = this.subarray(offset, offset + len)
      str.push(String.fromCharCode.apply(null, subab))
    }
    return btoa(str.join(''))
  }
}

if (!Number.MAX_SAFE_INTEGER) {
  Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1 // 9007199254740991
}

if (!Number.MIN_SAFE_INTEGER) {
  Number.MIN_SAFE_INTEGER = -(Math.pow(2, 53) - 1) // 9007199254740991
}

if (!Number.isFinite) {
  Number.isFinite = function(value) {
    return typeof value === 'number' && isFinite(value)
  }
}

if (!Number.isInteger) {
  Number.isInteger = function(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value
  }
}

if (!Number.isNaN) {
  Number.isNaN = function(value) {
    return typeof value === 'number' && isNaN(value)
  }
}

if (!Number.isSafeInteger) {
  Number.isSafeInteger = function(value) {
    return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER
  }
}

if (!Number.parseFloat) {
  Number.parseFloat = parseFloat
}

if (!Number.parseInt) {
  Number.parseInt = parseInt
}

if (!window.JSON) {
  window.JSON = {
    parse: function(sJSON) {
      return eval('(' + sJSON + ')')
    },
    stringify: (function() {
      let toString = Object.prototype.toString
      let isArray = Array.isArray || function(a) {
        return toString.call(a) === '[object Array]'
      }
      let escMap = {
        '"': '\\"',
        '\\': '\\\\',
        '\b': '\\b',
        '\f': '\\f',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
      }
      let escFunc = function(m) {
        return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1)
      }
      let escRE = /[\\"\u0000-\u001F\u2028\u2029]/g
      return function stringify(value) {
        if (value == null) {
          return 'null'
        } else if (typeof value === 'number') {
          return isFinite(value) ? value.toString() : 'null'
        } else if (typeof value === 'boolean') {
          return value.toString()
        } else if (typeof value === 'object') {
          if (typeof value.toJSON === 'function') {
            return stringify(value.toJSON())
          } else if (isArray(value)) {
            let res = '['
            for (let i = 0; i < value.length; i++)
              res += (i ? ', ' : '') + stringify(value[i])
            return res + ']'
          } else if (toString.call(value) === '[object Object]') {
            let tmp = []
            for (let k in value) {
              if (value.hasOwnProperty(k))
                tmp.push(stringify(k) + ': ' + stringify(value[k]))
            }
            return '{' + tmp.join(', ') + '}'
          }
        }
        return '"' + value.toString().replace(escRE, escFunc) + '"'
      }
    })(),
  }
}

if (!JSON.isEmpty) {
  JSON.isEmpty = function(obj) {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false
    }
    return JSON.stringify(obj) === JSON.stringify({})
  }
}

if (!Array.serializeJSONArrayToPost) {
  Array.serializeJSONArrayToPost = function(json = {}, trim = false) {
    for (let name in json) {
      if (Object.isArray(json[name])) {
        let temp = json[name]
        if (trim) {
          temp = temp.filter(t => (t !== undefined && !Object.isString(t)) || (t !== undefined && Object.isString(t) && t.trim() !== ''))
        }
        delete json[name]
        if (temp && temp.length > 0) {
          for (let i = 0; i < temp.length; i++) {
            json[name + '[' + i + ']'] = temp[i]
          }
        }
      }
    }
    return json
  }
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object')
    }
    let str = '' + this
    count = +count
    if (count != count) {
      count = 0
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative')
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity')
    }
    count = Math.floor(count)
    if (str.length == 0 || count == 0) {
      return ''
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size')
    }
    let rpt = ''
    for (let i = 0; i < count; i++) {
      rpt += str
    }
    return rpt
  }
}

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0 //floor if number or convert non-number to 0;
    padString = String(padString || ' ')
    if (this.length > targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }
}

if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength, padString) {
    targetLength = targetLength >> 0 //floor if number or convert non-number to 0;
    padString = String(padString || ' ')
    if (this.length > targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) //append to original to ensure we are longer than needed
      }
      return String(this) + padString.slice(0, targetLength)
    }
  }
}

if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
  }
}

if (!String.prototype.trimLeft) {
  String.prototype.trimLeft = function() {
    return this.replace(/^[\s\uFEFF\xA0]+/g, '')
  }
}

if (!String.prototype.trimRight) {
  String.prototype.trimRight = function() {
    return this.replace(/[\s\uFEFF\xA0]+$/g, '')
  }
}

if (!Array.new) {
  Array.new = function(length) {
    let array = []
    array.length = parseInt(length) || 0
    return array
  }
}

if (!Array.prototype.traverse) {
  Array.prototype.traverse = function(callback, thisArg) {
    let T, A, k
    if (this == null) {
      throw new TypeError(' this is null or not defined')
    }
    let O = Object(this)
    let len = O.length >>> 0
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function')
    }
    if (arguments.length > 1) {
      T = thisArg
    }
    A = new Array(len)
    k = 0
    while (k < len) {
      let kValue, mappedValue
      kValue = O[k]
      mappedValue = callback.call(T, kValue, k, O)
      A[k] = mappedValue
      k++
    }
    return A
  }
}

if (!Function.prototype.times) {
  Function.prototype.times = function() {
    let method = this, args = Array.from(arguments)
    let callback = null
    if (typeof args[args.length - 1] == 'function') {
      callback = args.pop()
    }
    let times = 0
    if (typeof args[args.length - 1] == 'number') {
      times = parseInt(args.pop()) || 0
    }
    let rets = new Array(times).traverse(function() {
      let ret = method.apply(method, args)
      if (callback) {
        let _ret = callback(ret)
        if (_ret) {
          ret = _ret
        }
      }
      return ret
    })
    return rets
  }
}


if (!Math.sign) {
  Math.sign = function(x) {
    // x 가 NaN 이면, 결과는 NaN 입니다.
    // x 가 -0 이면, 결과는 -0 입니다.
    // x 가 +0 이면, 결과는 +0 입니다.
    // x 가 음수이면서 -0 이 아니면, 결과는 -1 입니다.
    // x 가 양수이면서 +0 이 아니면, 결과는 +1 입니다.
    return ((x > 0) - (x < 0)) || +x
    // A more aesthetical persuado-representation is shown below
    //
    // ( (x > 0) ? 0 : 1 )  // if x is negative then negative one
    //          +           // else (because you cant be both - and +)
    // ( (x < 0) ? 0 : -1 ) // if x is positive then positive one
    //         ||           // if x is 0, -0, or NaN, or not a number,
    //         +x           // Then the result will be x, (or) if x is
    //                      // not a number, then x converts to number
  }
}

if (!Math.acosh) {
  Math.acosh = function(x) {
    return Math.log(x + Math.sqrt(x * x - 1))
  }
}

if (!Math.asinh) {
  Math.asinh = function(x) {
    if (x === -Infinity) {
      return x
    } else {
      return Math.log(x + Math.sqrt(x * x + 1))
    }
  }
}

if (!Math.cbrt) {
  Math.cbrt = (function(pow) {
    return function cbrt(x) {
      // ensure negative numbers remain negative:
      return x < 0 ? -pow(-x, 1 / 3) : pow(x, 1 / 3)
    }
  })(Math.pow) // localize Math.pow to increase efficiency
}

if (!Math.clz32) Math.clz32 = (function(log, LN2) {
  return function(x) {
    // Let n be ToUint32(x).
    // Let p be the number of leading zero bits in
    // the 32-bit binary representation of n.
    // Return p.
    let asUint = x >>> 0
    if (asUint === 0) {
      return 32
    }
    return 31 - (log(asUint) / LN2 | 0) | 0 // the "| 0" acts like math.floor
  }
})(Math.log, Math.LN2)

if (!Math.cosh) {
  Math.cosh = function(x) {
    let y = Math.exp(x)
    return (y + 1 / y) / 2
  }
}


if (!Math.expm1) {
  Math.expm1 = function(x) {
    return Math.exp(x) - 1
  }
}

if (!Math.fround) Math.fround = function(arg) {
  arg = Number(arg)
  // Return early for ±0 and NaN.
  if (!arg) return arg
  let sign = arg < 0 ? -1 : 1
  if (sign < 0) arg = -arg
  // Compute the exponent (8 bits, signed).
  let exp = Math.floor(Math.log(arg) / Math.LN2)
  let powexp = Math.pow(2, Math.max(-126, Math.min(exp, 127)))
  // Handle subnormals: leading digit is zero if exponent bits are all zero.
  let leading = exp < -127 ? 0 : 1
  // Compute 23 bits of mantissa, inverted to round toward zero.
  let mantissa = Math.round((leading - arg / powexp) * 0x800000)
  if (mantissa <= -0x800000) return sign * Infinity
  return sign * powexp * (leading - mantissa / 0x800000)
}

if (!Math.hypot) Math.hypot = function(x, y) {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=896264#c28
  let max = 0
  let s = 0
  for (let i = 0; i < arguments.length; i += 1) {
    let arg = Math.abs(Number(arguments[i]))
    if (arg > max) {
      s *= (max / arg) * (max / arg)
      max = arg
    }
    s += arg === 0 && max === 0 ? 0 : (arg / max) * (arg / max)
  }
  return max === 1 / 0 ? 1 / 0 : max * Math.sqrt(s)
}

if (!Math.imul) Math.imul = function(opA, opB) {
  opB |= 0 // ensure that opB is an integer. opA will automatically be coerced.
  // floating points give us 53 bits of precision to work with plus 1 sign bit
  // automatically handled for our convienence:
  // 1. 0x003fffff /*opA & 0x000fffff*/ * 0x7fffffff /*opB*/ = 0x1fffff7fc00001
  //    0x1fffff7fc00001 < Number.MAX_SAFE_INTEGER /*0x1fffffffffffff*/
  let result = (opA & 0x003fffff) * opB
  // 2. We can remove an integer coersion from the statement above because:
  //    0x1fffff7fc00001 + 0xffc00000 = 0x1fffffff800001
  //    0x1fffffff800001 < Number.MAX_SAFE_INTEGER /*0x1fffffffffffff*/
  if (opA & 0xffc00000 /*!== 0*/) result += (opA & 0xffc00000) * opB | 0
  return result | 0
}

if (!Math.log10) {
  Math.log10 = function(x) {
    return Math.log(x) * Math.LOG10E
  }
}

if (!Math.log1p) {
  Math.log1p = function(x) {
    return Math.log(1 + x)
  }
}

if (!Math.log2) Math.log2 = function(x) {
  return Math.log(x) * Math.LOG2E
}

if (!Math.sinh) {
  Math.sinh = function(x) {
    let y = Math.exp(x)
    return (y - 1 / y) / 2
  }
}

if (!Math.tanh) {
  Math.tanh = function(x) {
    let a = Math.exp(+x), b = Math.exp(-x)
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (a + b)
  }
}

if (!Math.trunc) {
  Math.trunc = function(v) {
    return v < 0 ? Math.ceil(v) : Math.floor(v)
  }
}

BigInt.prototype.toJSON = function() { return this.toString() }
