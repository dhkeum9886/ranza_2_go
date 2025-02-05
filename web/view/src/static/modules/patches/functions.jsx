import jQuery from 'jquery'

(function ($, global) {

  $.fn.extend({
    exists: function () {
      return $(this).length > 0;
    },
    outerHTML: function (s) {
      return (s)
        ? this.before(s).remove()
        : $('<p>').append(this.eq(0).clone()).html()
    },
    rotate: function (deg) {
      return this.each(function () {
        jQuery(this).css('transform', 'rotate(' + deg + 'deg)')
        jQuery(this).css('-ms-transform', 'rotate(' + deg + 'deg)')
        jQuery(this).css('-webkit-transform', 'rotate(' + deg + 'deg)')
        jQuery(this).css('-moz-transform', 'rotate(' + deg + 'deg)')
        jQuery(this).css('-o-transform', 'rotate(' + deg + 'deg)')
      })
    },
    /*forEach: function (callback) {
      return this.each(function (index, item) {
        callback.call(this, item, index);
      })
    },*/
    unselect: function () {
      return this.each(function () {
        this.onselectstart = function () {
          return false
        }
        this.unselectable = 'on'
        jQuery(this).attr('unselectable', 'on')
        jQuery(this).css('-o-user-select', 'none')
        jQuery(this).css('-ms-user-select', 'none')
        jQuery(this).css('-moz-user-select', 'none')
        jQuery(this).css('-khtml-user-select', 'none')
        jQuery(this).css('-webkit-user-select', 'none')
        jQuery(this).css('user-select', 'none')
      })
    },
    deselect: function () {
      return this.each(function () {
        try {
          this.selectionStart = this.selectionEnd = -1
        } catch (ex) {
        }
      })
    },
    disposeChildren: function () {
      return $(this).contents().remove()
    },
    removeChildren: function () {
      return $(this).disposeChildren()
    },
    lock: function () {
      $(this).each(function () {
        if (this.selectize) {
          this.selectize.lock()
        }
        if (this.tagName && this.tagName.toLowerCase() == 'select') {
          $(this).on('focus', $.$selectLockOnFocus)
          $(this).on('change', $.$selectLockOnChange)
          $(this).prop('readonly', true)
          $(this).attr('readonly', 'readonly')
        } else if (this.tagName && this.tagName.toLowerCase() == 'input' && this.type &&
          (this.type.toLowerCase() == 'checkbox' || this.type.toLowerCase() == 'radio')) {
          $(this).on('click', $.$inputLockOnChange)
          $(this).prop('readonly', true)
          $(this).attr('readonly', 'readonly')
        } else {
          $(this).prop('readonly', true)
          $(this).attr('readonly', 'readonly')
        }
      })
    },
    unlock: function () {
      $(this).each(function () {
        if (this.selectize) {
          this.selectize.unlock()
        }
        if (this.tagName && this.tagName.toLowerCase() == 'select') {
          $(this).off('focus', $.$selectLockOnFocus)
          $(this).off('change', $.$selectLockOnChange)
          $(this).prop('readonly', false)
          $(this).attr('readonly', null)
        } else if (this.tagName && this.tagName.toLowerCase() == 'input' && this.type &&
          (this.type.toLowerCase() == 'checkbox' || this.type.toLowerCase() == 'radio')) {
          $(this).off('click', $.$inputLockOnChange)
          $(this).prop('readonly', false)
          $(this).attr('readonly', null)
        } else {
          $(this).prop('readonly', false)
          $(this).attr('readonly', null)
        }
      })
    },
    disable: function () {
      $(this).each(function () {
        if (this.selectize) {
          this.selectize.disable()
        }
        $(this).prop('disabled', true)
        $(this).attr('disabled', 'disabled')
      })
    },
    enable: function () {
      $(this).each(function () {
        if (this.selectize) {
          this.selectize.enable()
        }
        $(this).prop('disabled', false)
        $(this).attr('disabled', null)
      })
    },
    reset: function () {
      $(this).each(function () {
        if (this.tagName && this.tagName.toLowerCase() == 'form') {
          $(this).find('select,input').each(function() {
            if (this.selectize) {
              this.selectize.clear()
            }
          })
          this.reset()
          $(this).find('input[type=file]').each((index, element) => {
            let $element = $(element)
            $element.replaceWith($element.val('').clone(true))
          })
        }
      })
    },
    hotkey: function (type, shortcut, callback, propagate, namespace) {
      let args = Array.from(arguments)
      return this.each(function () {
        global.Hotkey.bind.apply(null, [this].concat(args))
      })
    },
    unkey: function (type, shortcut, namespace) {
      let args = Array.from(arguments)
      return this.each(function () {
        global.Hotkey.unbind.apply(null, [this].concat(args))
      })
    },
    serializeJSON: function (trim) {
      let json = {}
      jQuery.map(jQuery(this).serializeArray(), function (n, i) {
        if (trim === true && (!n['value'] || n['value'].trim() === '')) {
          return
        }
        if (json[n['name']] !== undefined && json[n['name']] !== null) {
          let values = []
          values.push(json[n['name']].trim())
          values.push(trim === true ? n['value'].trim() : n['value'])
          values = values.flatten()
          json[n['name']] = values
        } else {
          json[n['name']] = trim === true ? n['value'].trim() : n['value']
        }
      })
      return json
    },
    serializePostJSON: function (trim) {
      let json = {}
      jQuery.map(jQuery(this).serializeArray(), function (n, i) {
        if (trim && (!n['value'] || n['value'].trim() === '')) {
          return
        }
        if (json[n['name']]) {
          let values = []
          values.push(json[n['name']].trim())
          values.push(trim === true ? n['value'].trim() : n['value'])
          values = values.flatten()
          json[n['name']] = values
        } else {
          json[n['name']] = trim === true ? n['value'].trim() : n['value']
        }
      })
      for (let name in json) {
        if (Object.isArray(json[name])) {
          let temp = json[name]
          delete json[name]
          if (temp && temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
              json[name + '[' + i + ']'] = temp[i]
            }
          }
        }
      }
      return json
    },
    zIndex: function (zIndex) { // this was removes in jquery ui 1.12
      if (zIndex !== undefined) {
        return this.css('zIndex', zIndex)
      }

      if (this.length) {
        let elem = $(this[0]), position, value
        while (elem.length && elem[0] !== document) {
          // Ignore z-index if position is set to a value where z-index is ignored by the browser
          // This makes behavior of this function consistent across browsers
          // WebKit always returns auto if the element is positioned
          position = elem.css('position')
          if (position === 'absolute' || position === 'relative' || position === 'fixed') {
            // IE returns 0 when zIndex is not specified
            // other browsers return a string
            // we ignore the case of nested elements with an explicit value of 0
            // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
            value = parseInt(elem.css('zIndex'), 10)
            if (!isNaN(value) && value !== 0) {
              return value
            }
          }
          elem = elem.parent()
        }
      }

      return 0
    },
    scrollHeight: function () {
      return this.getScrollHeight()
    },
    scrollWidth: function () {
      return this.getScrollWidth()
    },
    viewSize: function () {
      return {
        width: jQuery(this).width() || +(jQuery(this).attr('width')),
        height: jQuery(this).height() || +(jQuery(this).attr('height')),
      }
    },
    offsetWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = this[0]
      return parseInt(element.offsetWidth) || 0
    },
    offsetHeight: function () {
      if (!this[0]) {
        return 0
      }
      let element = this[0]
      return parseInt(element.offsetHeight) || 0
    },
    getScrollHeight: function () {
      if (!this[0]) {
        return 0
      }
      let element = this[0]
      return parseInt(element.scrollHeight) || 0
    },
    getScrollWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = this[0]
      return parseInt(element.scrollWidth) || 0
    },
    borderTopWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = $(this[0])
      return +(element.css('borderTopWidth').replace(/px$/, '').replace(/pt$/, '').replace(/em$/, '')) || 0
    },
    borderBottomWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = $(this[0])
      return +(element.css('borderBottomWidth').replace(/px$/, '').replace(/pt$/, '').replace(/em$/, '')) || 0
    },
    borderLeftWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = $(this[0])
      return +(element.css('borderLeftWidth').replace(/px$/, '').replace(/pt$/, '').replace(/em$/, '')) || 0
    },
    borderRightWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = $(this[0])
      return +(element.css('borderRightWidth').replace(/px$/, '').replace(/pt$/, '').replace(/em$/, '')) || 0
    },
    borderTickWidth: function () {
      if (!this[0]) {
        return 0
      }
      let element = $(this[0])
      return element.borderLeftWidth() + element.borderRightWidth()
    },
    borderTickHeight: function () {
      if (!this[0]) {
        return 0
      }
      let element = $(this[0])
      return element.borderTopWidth() + element.borderBottomWidth()
    },
  })

  $.exists = function(selector) {
    return ($(selector).length > 0);
  }

  $.$selectLockOnFocus = function (event) {
    this.defaultIndex = this.selectedIndex
  }

  $.$selectLockOnChange = function (event) {
    this.selectedIndex = this.defaultIndex
  }

  $.$inputLockOnChange = function (event) {
    this.checked = !this.checked
  }

  $.serializeJSONPropertyToArray = function () {
    let args = Array.from(arguments), json = args.shift()
    for (let i = 0, len = args.length; i < len; i++) {
      let name = args[i]
      if (json[name] !== undefined && !Array.isArray(json[name])) {
        let temp = []
        temp.push(json[name])
        json[name] = temp
      }
    }
    for (let i = 0, len = args.length; i < len; i++) {
      let name = args[i]
      if (json[name] === undefined) {
        json[name] = [];
      }
    }
    return json
  }

  $.overload = function () {
    let args = Array.from(arguments),
      target = args.shift()
    target = $.extend({}, target || {})
    return $.extend.apply(this, [target].concat(Array.from(args)))
  }
  $.move = function (loc, params, hash) {
    let queryString = ''
    if (params !== undefined && params !== null && Object.isObject(params)) {
      for (let name in params) {
        if (Object.isArray(params[name])) {
          let array = params[name]
          for (let i = 0, len = array.length; i < len; i++) {
            queryString += '&' + name + '=' + encodeURIComponent(array[i])
          }
        } else {
          queryString += '&' + name + '=' + encodeURIComponent(params[name])
        }
      }
      queryString = '?' + queryString.substring(1)
      if (queryString.length == 1) {
        queryString = ''
      }
    }
    if (hash !== undefined && hash !== null && Object.isString(hash)) {
      if (!''.equals(hash.trim())) {
        hash = '#' + hash
      } else {
        hash = ''
      }
    } else {
      hash = ''
    }
    if (document.location) {
      $(document.location).attr('href', loc + queryString + hash)
    } else {
      window.navigate(loc + queryString + hash)
    }
  }

  function scripts() {
    return Array.from($('script').map(function (index, element) {
      return $(element).attr('src')
    }))
  }

  function css() {
    return Array.from($('link[type="text/css"][rel="stylesheet"]').map(function (index, element) {
      return $(element).attr('href')
    }))
  }

  const parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/

  $.urlParse = function (source) {
    source = source ? source : window.location.toString()
    let base = parser.exec(source)
    if (base && base.length) {
      return {
        valid: true,
        url: source,
        sections: {
          all: base,
          schema: base[1],
          host: base[6],
          port: base[7],
          params: base[12],
          hash: base[13],
        },
      }
    } else {
      return {
        valid: false,
        url: source,
        sections: {
          all: [],
          schema: undefined,
          host: undefined,
          port: undefined,
          params: undefined,
          hash: undefined,
        },
      }
    }
  }

  const _msie = !!/msie [\w.]+/.exec(window.navigator.userAgent.toLowerCase())

  $.import = function (sources, callback) {
    let base = parser.exec(window.location.toString())
    let basePath = base[10]
    if (!callback)
      callback = Function.$empty
    if (!Object.isArray(sources)) {
      sources = Array.from(sources)
    }
    sources = sources.filter(function (src) {
      let url = parser.exec(src)
      return url && url.length && url[11]
    }).map(function (src) {
      let url = parser.exec(src)
      if (!src.startsWith('/') && !url[1]) {
        src = basePath + src
      }
      return {
        url: src,
        file: url[11],
      }
    })

    let _js = sources.filter(function (src) {
      return src && src.file.trim().toLowerCase().endsWith('.js')
    })
    if (_js.length) {
      let _included_js_ = scripts()
      _js = _js.filter(function (src) {
        return !_included_js_.includes(src.url)
      })
    }

    let _css = sources.filter(function (src) {
      return src && src.file.trim().toLowerCase().endsWith('.css')
    })
    if (_css.length) {
      let _included_css_ = css()
      _css = _css.filter(function (src) {
        return !_included_css_.includes(src.url)
      })
    }
    sources = _js.concat(_css)

    let fetchCount = sources.length
    callback = callback.wrap(function () {
      fetchCount--
      if (fetchCount == 0) {
        $proceed()
      }
    })
    if (sources.length) {
      sources.forEach(function (source) {
        if (source.file.endsWith('.js')) {
          let script = document.createElement('script')
          script.src = source.url
          script.type = 'text/javascript'
          script.charset = 'utf-8'
          if (_msie) {
            script.defer = 'defer'
          } else {
            script.async = true
          }
          if (_msie)
            script.onreadystatechange = (function (_callback) {
              if (this.readyState == 4 || this.readyState == 'complete') {
                _callback()
              }
            }).bind(script, callback);
          else script.addEventListener('load', (function (_callback) {
            _callback()
          }).bind(script, callback), false);
          (document.getElementsByTagName('head')[0]).appendChild(script)
        } else if (source.file.endsWith('.css')) {
          let _css_ = document.createElement('link')
          _css_.href = source.url
          _css_.type = 'text/css'
          _css_.rel = 'stylesheet'
          _css_.charset = 'utf-8'
          if (_msie)
            _css_.onreadystatechange = (function (_callback) {
              if (this.readyState == 4 || this.readyState == 'complete') {
                _callback()
              }
            }).bind(_css_, callback);
          else css.addEventListener('load', (function (_callback) {
            _callback()
          }).bind(_css_, callback), false);
          (document.getElementsByTagName('head')[0]).appendChild(css)
        }
      })
    } else {
      callback()
    }
  }

  return jQuery
})(jQuery, typeof window !== 'undefined' ? window : this)
