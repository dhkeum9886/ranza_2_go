'use strict'
import $ from 'jquery-patch'
import screenfull from 'screenfull'

global.ctx = {}

let _path_ = ''
if ($('head meta[name=ctx]').length) {
  _path_ = $('head meta[name=ctx]').attr('content') ? $('head meta[name=ctx]').attr('content') : ''
}

try {
  Object.defineProperty(global.ctx, 'path', {
    value: _path_,
    writable: false
  })
} catch (ex) {
  global.ctx.path = _path_
}

const $sideWrapper = $('.fz-side-wrapper')

$sideWrapper.on('webkitTransitionEnd oTransitionEnd msTransitionEnd transitionend', function () {
  $(global).trigger('resize')
})

function applyFullscreenCss() {
  screenfull.isFullscreen ? $(document.body).addClass('fullscreen') : $(document.body).removeClass('fullscreen')
}

$(document).hotkey('keydown', 'F11', function () {
  toggleFullscreen()
}, false)

function toggleFullscreen() {
  screenfull.toggle(document.documentElement)
}

if (screenfull.isEnabled) {
  screenfull.on('change', () => {
    applyFullscreenCss()
  })
  screenfull.on('error', event => {
  })
}

Object.extend(Number.prototype, {
  toStorage: function () {
    if ((this / 1024 / 1024 / 1024 / 1024) > 1024) {
      return (this / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' PB'
    } else if ((this / 1024 / 1024 / 1024) > 1024) {
      return (this / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB'
    } else if ((this / 1024 / 1024) > 1024) {
      return (this / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    } else if ((this / 1024) > 1024) {
      return (this / 1024 / 1024).toFixed(2) + ' MB'
    } else {
      return (this / 1024).toFixed(2) + ' KB'
    }
  },
  toInterval: function () {
    if (this > 3600) {
      let hour = Math.floor(this / 3600)
      let minute = Math.floor((this - (hour * 3600)) / 60)
      let second = this - (hour * 3600) - (minute * 60)
      return hour + ' 시간' + (minute != 0 ? ' ' + minute + ' 분' : '') + (second != 0 ? ' ' + second + ' 초' : '')
    } else if (this > 60) {
      let minute = Math.floor(this / 60)
      let second = this - (minute * 60)
      return minute + ' 분' + (second != 0 ? ' ' + second + ' 초' : '')
    } else {
      return this + '  초'
    }
  },
  toHumanize: function () {
    if (this > 86400) {
      let day = Math.floor(this / 86400)
      let hour = Math.floor((this - (day * 86400)) / 3600)
      let minute = Math.floor((this - (day * 86400) - (hour * 3600)) / 60)
      let second = this - (day * 86400) - (hour * 3600) - (minute * 60)
      return day + 'd' + (hour != 0 ? hour + 'h' : '') + (minute != 0 ? minute + 'm' : '') + (second != 0 ? second + 's' : '')
    } else if (this > 3600) {
      let hour = Math.floor(this / 3600)
      let minute = Math.floor((this - (hour * 3600)) / 60)
      let second = this - (hour * 3600) - (minute * 60)
      return hour + 'h' + (minute != 0 ? minute + 'm' : '') + (second != 0 ? second + 's' : '')
    } else if (this > 60) {
      let minute = Math.floor(this / 60)
      let second = this - (minute * 60)
      return minute + 'm' + (second != 0 ? second + 's' : '')
    } else {
      return this + 's'
    }
  },
  toHumanizeApproximate: function () {
    if (this > 86400) {
      let day = Math.floor(this / 86400)
      let hour = Math.floor((this - (day * 86400)) / 3600)
      let minute = Math.ceil((this - (day * 86400) - (hour * 3600)) / 60)
      //let second = this - (day * 86400) - (hour * 3600) - (minute * 60)
      return day + '일' + (hour != 0 ? hour + '시간' : '') + (minute != 0 ? minute + '분' : '')
    } else if (this > 3600) {
      let hour = Math.floor(this / 3600)
      let minute = Math.ceil((this - (hour * 3600)) / 60)
      //let second = this - (hour * 3600) - (minute * 60)
      return hour + '시간' + (minute != 0 ? minute + '분' : '')
    } else if (this > 60) {
      let minute = Math.ceil(this / 60)
      //let second = this - (minute * 60)
      return minute + '분'
    } else {
      return '1분'
    }
  }
});

global.RemoveInvalid = function (target) {
  let $target = $(target || document);
  $target.find("input.invalid, textarea.invalid, select.invalid, label.invalid, .input-group.invalid, .inner-input-group.invalid").each(function (index) {
    $(this).removeClass("invalid")
  });
}

$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
  if (!options.error) {
    options.error = function () {
    }
  }

  if (!options.beforeSend) {
    options.beforeSend = function () {
    }
  }

  options.beforeSend = options.beforeSend.before(function (jqXHRBeforeSend, settings) {
    let name = $('meta[name="_csrf_parameter"]').attr('content')
    let header = $('meta[name="_csrf_header"]').attr('content')
    let value = $('meta[name="' + name + '"]').attr('content')

    if (header && value) {
      jqXHRBeforeSend.setRequestHeader(header, value);
    }
  })

  options.error = options.error.before(function (jqXHRError, textStatus, errorThrown) {
    const status = jqXHRError.status;
    if (status === 301 || status === 302) { // redirect
      $.move(jqXHRError.getResponseHeader('Location'));
    } else if (status === 400) {
      //alert('Bad Request.');
      Alert(300, 230, 'Bad Request.', jqXHRError.responseJSON.message)
    } else if (status === 401 || status === 403) {
      $.move(`${global.ctx.path}/`);
    } else if (status === 404) {
      //alert('Page Not Found.');
      Alert(300, 120, 'Page Not Found.', jqXHRError.responseJSON.message)
    } else if (status === 405) {
      //alert('Method Not Allowed.');
      Alert(300, 120, 'Method Not Allowed.', jqXHRError.responseJSON.message)
    } else if (status === 406) {
      //alert('Not Acceptable.');
      Alert(300, 120, 'Not Acceptable.', jqXHRError.responseJSON.message)
    } else if (status === 410) {
      $.move(`${global.ctx.path}/`);
    } else if (status === 500) {
      //alert('Error.');
      Alert(600, 220, 'Error.', jqXHRError.responseJSON.message)
    }
  })
})

$(document).ready(() => {
  $('.fz-side-menu .fz-side-nav .fz-side-nav-list .selected')
    .each((index, element) => {
      element.scrollIntoView(true)
    })
})

global.toggleSideMenu = function () {
  $(document.body).toggleClass("fold-side")
}

Router.watch(document)
  .onclick()
  .route('toggleSideMenu', function () {
    toggleSideMenu()
  })
  .route('screenToggle', function () {
    toggleFullscreen()
  })
