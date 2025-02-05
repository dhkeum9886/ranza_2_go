import './dialog.scss'

import jQuery from 'jquery'

(function ($, global) {

  let transition = (function () {
    let thisBody = document.body || document.documentElement,
      thisStyle = thisBody.style,
      support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined

    return support
  })()

  global.PopupDialogMgr = {}
  const _msie = !!/msie [\w.]+/.exec(window.navigator.userAgent.toLowerCase())
  Object.extend(PopupDialogMgr, {
    zIndex: -1,
    dialogBuffer: [],
    focusedDialog: null,
    maskDialog: null,
    maskInitialized: false,
    ecsInitialized: false,
    cascadeXDegree: 20,
    cascadeYDegree: 20,
    lastCascadeX: null,
    lastCascadeY: null,
    blurFilter: null,
    //maskResizeFunc : null,
    getBlurFilter: function () {
      return this.blurFilter
    },
    contains: function (dialog) {
      for (let i = 0, len = this.dialogBuffer.length; i < len; i++) {
        if (this.dialogBuffer[i] && this.dialogBuffer[i] == dialog) {
          return true
        }
      }
      return false
    },
    indexOf: function (dialog) {
      for (let i = 0, len = this.dialogBuffer.length; i < len; i++) {
        if (this.dialogBuffer[i] && this.dialogBuffer[i] == dialog) {
          return i
        }
      }
      return -1
    },
    moveFocusToPrevious: function () {
      let dialog = this.findPrevDialog()
      this.focusedDialog = dialog
      if (dialog != null) {
        if (dialog.getDialogTitle()) {
          dialog.getDialogTitle().addClass('dialog-title-focus')
        }
        try {
          dialog.getOptions().onFocus.call(dialog)
          dialog.pinDialog()
        } catch (ex) {
        }
      }
    },
    add: function (dialog) {
      if (!this.ecsInitialized) {
        this.ecsInitialized = true
        this.press = (function (event) {
          let keyCode = event.keyCode ? event.keyCode : event.which
          //if (keyCode == Event.KEY_ESC) {
          if (keyCode == 27) {
            if (this.focusedDialog != null) {
              if (this.focusedDialog.getOptions().closeable) {
                this.focusedDialog.close()
              }
            }
            event.stopPropagation()
          }
        }).bind(this)
        if (_msie) {
          $(document).on('keypress', this.press)
        } else {
          $(document).on('keydown', this.press)
        }
      }
      if (!this.contains(dialog)) {
        this.dialogBuffer.push(dialog)
        this.bringToFront(dialog)
      }
    },
    remove: function (dialog) {
      let index = this.indexOf(dialog)
      if (index != -1) {
        delete this.dialogBuffer[index]
        if (dialog == this.focusedDialog) {
          this.focusedDialog = null
        }
      }
    },
    findById: function (id) {
      if (id == undefined || id == null || typeof id != 'string' || ''.equals(id.trim())) {
        return null
      }
      for (let i = 0, len = this.dialogBuffer.length; i < len; i++) {
        if (!!!this.dialogBuffer[i] || this.dialogBuffer[i].getDialog().css('display') == 'none') {
          continue
        }
        if (id.equals(this.dialogBuffer[i].getOptions().id)) {
          return this.dialogBuffer[i]
        }
      }
      return null
    },
    findPrevDialog: function () {
      let retDialog = null
      let zIndexValue = 0
      for (let i = 0, len = this.dialogBuffer.length; i < len; i++) {
        if (!!!this.dialogBuffer[i] || this.dialogBuffer[i].getDialog().css('display') == 'none') {
          continue
        }
        let newZIndex = this.dialogBuffer[i].getOptions().zIndex
        if (zIndexValue < newZIndex) {
          retDialog = this.dialogBuffer[i]
          zIndexValue = newZIndex
        }
      }
      return retDialog
    },
    bringToFront: function (dialog) {
      if (this.focusedDialog != null) {
        try {
          this.focusedDialog.getOptions().onBlur.call(this.focusedDialog)
        } catch (ex) {
        }
      }
      if (this.zIndex == -1) {
        this.zIndex = dialog.zIndex()
      }
      if (dialog != this.focusedDialog) {
        this.zIndex = this.zIndex + 6
        dialog.zIndex(this.zIndex)
        if (this.focusedDialog != null) {
          if (this.focusedDialog.getDialogTitle()) {
            this.focusedDialog.getDialogTitle().removeClass('dialog-title-focus')
          }
        }
        if (dialog.getDialogTitle()) {
          dialog.getDialogTitle().addClass('dialog-title-focus')
        }
      }
      this.focusedDialog = dialog
      if (this.focusedDialog != null) {
        try {
          this.focusedDialog.getDialogBody().focus()
          this.focusedDialog.getOptions().onFocus.call(this.focusedDialog)
        } catch (ex) {
        }
      }
    },
    _computeWidthAndHeight: function () {
      let width = 0
      let height = 0
      try {
        width = Math.max(window.innerWidth, document.body.clientWidth)
      } catch (ex) {
        width = Math.max($(document).width(), $(window).width())
      }
      try {
        height = Math.max(window.innerHeight, document.body.clientHeight)
      } catch (ex) {
        height = Math.max($(document).height(), $(window).height())
      }
      return {
        width: width,
        height: height,
      }
    },
    showMask: function (dialog) {
      let options = dialog.getOptions()
      if (!this.maskInitialized) {
        this.maskInitialized = true
        let popupMask = $('<div/>').css({
          position: 'fixed',
          top: options.maskTop,
          left: options.maskLeft,
          width: '0px',
          height: '0px',
          opacity: 0.01,
          display: 'none',
        }).addClass('popup-dialog-mask')
        popupMask.appendTo('body')
        popupMask.on('scroll touchmove mousewheel', function (event) {
          event.preventDefault()
          event.stopPropagation()
          return false
        })
        this.getMask = function () {
          return popupMask
        }
        let maskResizeFunc = $.proxy(function () {
          let _width = 0
          let _height = 0
          if (options.maskViewport == 'document') {
            _width = $(document).width()
            _height = $(document).height()
          } else if (options.maskViewport == 'window') {
            _width = $(window).width()
            _height = $(window).height()
          } else if (options.maskViewport == 'max') {
            _width = Math.max(window.innerWidth, document.body.clientWidth, $(document).width(), $(window).width())
            _height = Math.max(window.innerHeight, document.body.clientHeight, $(document).height(), $(window).height())
          } else {
            let size = this._computeWidthAndHeight()
            _width = size.width
            _height = size.height
          }
          if (options.maskWidth) {
            _width = options.maskWidth
          }
          if (options.maskHeight) {
            _height = options.maskHeight
          }
          this.getMask().css({
            width: _width + 'px',
            height: _height + 'px',
          })
          if (this.focusedDialog != null) {
            this.focusedDialog.resize()
            this.focusedDialog.pinDialog()
          }
        }, this)
        $(window).on('resize', maskResizeFunc)
      }
      let width = 0
      let height = 0
      if (options.maskViewport == 'document') {
        width = $(document).width()
        height = $(document).height()
      } else if (options.maskViewport == 'window') {
        width = $(window).width()
        height = $(window).height()
      } else if (options.maskViewport == 'max') {
        width = Math.max(window.innerWidth, document.body.clientWidth, $(document).width(), $(window).width())
        height = Math.max(window.innerHeight, document.body.clientHeight, $(document).height(), $(window).height())
      } else {
        let size = this._computeWidthAndHeight()
        width = size.width
        height = size.height
      }
      if (options.maskWidth) {
        width = options.maskWidth
      }
      if (options.maskHeight) {
        height = options.maskHeight
      }
      if (this.maskDialog != null && this.maskDialog.getOptions().zIndex > options.zIndex) {
        return
      }
      if (options.blurValue) {
        if (!this.getBlurFilter()) {
          this.blurFilter = $('<div/>').css({
            'visibility': 'hidden',
          })
          this.blurFilter.html('<svg width="0" height="0" style="position:absolute"><filter id="__blur__"><feGaussianBlur id="__blursource__" in="SourceGraphic" stdDeviation="0" /></filter></svg>')
          this.blurFilter.appendTo('body')
        }
        document.getElementById('__blursource__').attributes['stdDeviation'].value = options.blurValue
        if (options.blurTarget) {
          $(options.blurTarget).css({
            filter: 'url(#__blur__)',
          })
        }
      }
      this.getMask().css({
        width: width + 'px',
        height: height + 'px',
        opacity: options.maskOpacity,
        backgroundColor: options.maskColor,
        zIndex: options.zIndex - 4,
      })
      this.getMask().show()
      this.maskDialog = dialog
    },
    hideMask: function (dialog) {
      if (dialog == this.maskDialog) {
        this.maskDialog = this.findPrevMaskDialog(dialog)
        if (this.maskDialog != null) {
          this.showMask(this.maskDialog)
        } else {
          if (this.getBlurFilter()) {
            document.getElementById('__blursource__').attributes['stdDeviation'].value = 0
            let options = dialog.getOptions()
            $(options.blurTarget).css({
              filter: '',
            })
          }
          this.getMask().hide()
        }
      }
    },
    findPrevMaskDialog: function (dialog) {
      let retDialog = null
      if (this.maskDialog != null) {
        let zIndexValue = 0
        let index = dialog.getOptions().zIndex - 4
        for (let i = 0, len = this.dialogBuffer.length; i < len; i++) {
          if (this.dialogBuffer[i] && this.dialogBuffer[i].getOptions().mask) {
            if (this.dialogBuffer[i].getDialog().css('display') == 'none') {
              continue
            }
            let newZIndex = this.dialogBuffer[i].getOptions().zIndex
            if (newZIndex < index && zIndexValue < newZIndex) {
              retDialog = this.dialogBuffer[i]
              zIndexValue = newZIndex
            }
          }
        }
      }
      return retDialog
    },
    cascadeDialog: function (dialog) {
      if (dialog.getOptions().openType == 'cascade') {
        let viewportWidth = $(window).width()
        let viewportHeight = $(window).height()
        let width = dialog.getDialog().width()
        let height = dialog.getDialog().height()
        let top = parseInt(dialog.getDialog().css('top'))
        let left = parseInt(dialog.getDialog().css('left'))
        if (this.lastCascadeX == null && this.lastCascadeY == null) {
          this.lastCascadeX = left
          this.lastCascadeY = top
        } else {
          let cascadeX = this.lastCascadeX + this.cascadeXDegree
          let cascadeY = this.lastCascadeY + this.cascadeYDegree
          if ((cascadeX + width) >= viewportWidth) {
            cascadeX = this.cascadeXDegree
          }
          if ((cascadeY + height) >= viewportHeight) {
            cascadeY = this.cascadeYDegree
          }
          this.lastCascadeX = cascadeX
          this.lastCascadeY = cascadeY
          dialog.moveTo(this.lastCascadeY, this.lastCascadeX)
        }
      }
    },
    resetZIndex: function () {
      this.zIndex = -1;
    }
  })

  global.PopupDialog = Class.define({
    create: function () {
      let options = Object.extend({
          id: '', // dialog div id value
          css: '', // dialog style class name
          bodyContent: null, // dialog body div inner content as html
          url: null, // imported content url
          method: 'get', // request method type
          async: false, // is asynchronously import
          contentType: null,
          stringify: false,
          unit: 'px',
          params: {}, // request paramaters
          minWidth: 20, // min width of dialog
          minHeight: 20, // min height of dialog
          maxWidth: -1, // max width of dialog
          maxHeight: -1, // max height of dialog
          width: 20, // default width
          height: 20, // default height
          title: false, // title text
          openType: 'center', // 'center', 'cascade'
          resize: true, // is resizable
          pin: false, // pin dialog to center of screen
          full: false, // show dialog as full screen
          fullMargin: 20,
          shadow: true, // show dialog shadow
          closeable: true, // dialog can be closed
          overflowX: true, // dialog body overflow
          overflowY: true, // dialog body overflow
          overflow: true, // dialog body overflow
          titleColor: null, // dialog title color value
          titleBgColor: null, // dialog title background-color value
          titleCss: null, // dialog title style class name
          bodyColor: null, // dialog body color value
          bodyTextAlign: 'left', // body content align
          bodyCss: null, // body content style class name
          backgroundColor: null, // dialog background-color value,
          buttonClass: 'button', // dialog buttons default class value
          buttonsBgColor: null, // dialog buttons background-color value
          borderColor: null, // dialog border color value
          shadowColor: null,
          dialogStyle: {}, // dialog styles
          titleStyle: {}, // dialog title styles
          bodyStyle: {}, // dialog body styles
          content: false,
          contentCss: '',
          contentStyle: {},
          buttonsCss: '',
          buttonsStyle: {}, // dialog botton pan styles
          closeColor: '#fff',
          waiting: false,
          waitingSeconds: 30,
          waitingOpacity: 0.3,
          waitingBgColor: '#000',
          waitingCss: 'cube', // white, black, red, green, blue, orange, cube
          mask: true, // is modal dialog?
          maskViewport: 'viewport', // on of viewport, document, window, max
          maskColor: '#000', // modal mask color value
          maskOpacity: 0.3, // modal mask opacity value
          maskTop: 0,
          maskLeft: 0,
          maskWidth: null,
          maskHeight: null,
          zIndex: 100, // dialog default z-index value
          onBeforeShow: Function.empty, // function that performed before dialog is shown
          onShow: Function.empty, // function that performed after dialog is shown
          onBeforeHide: Function.empty, // function that performed before dialog is disappeared
          onHide: Function.empty, // function that performed after dialog is disappeared
          onInit: Function.empty, // function that performed after dialog is first initialized
          onFirstShow: Function.empty, // function that performed after only dialog is first shown
          onResizeStart: Function.empty,
          onResize: Function.empty, // function that performed after dialog is resized
          onResizeEnd: Function.empty,
          onBlur: Function.empty, // function that performed after dialog loose focus
          onFocus: Function.empty, // function that performed after dialog gain focus
          onDestroy: Function.empty, // function that performed after dialog destroyed
          onDragSart: Function.empty,
          //onDrag: Function.empty,
          onDragEnd: Function.empty,
          buttonAlign: 'center',
          buttonOptions: {},
          localData: {},
          hideOnClose: false, // if true then dialog is only set mode display hidden, otherwise it destroyed
          rounded: false, // round layout,
          hided: true, // variable for current view state,
          showEffect: null, // effect for show
          hideEffect: null, // effect for hide
          blurTarget: null, // background blur filter effect target
          blurValue: 0, // background blur filter effect value
        },
        arguments[0] || {})
      if (Object.isNumber(options.width) && Object.isNumber(options.width)) {
        if (options.width < options.minWidth) {
          options.width = options.minWidth
        }
        if (options.height < options.minHeight) {
          options.height = options.minHeight
        }
        let viewportWidth = $(window).width()
        let viewportHeight = $(window).height()

        if (options.width > viewportWidth) {
          options.width = viewportWidth - options.fullMargin
        }
        if (options.height > viewportHeight) {
          options.height = viewportHeight - options.fullMargin
        }

        if (options.maxWidth != -1 && options.maxWidth < options.minWidth) {
          options.maxWidth = viewportWidth - options.fullMargin
        }
        if (options.maxHeight != -1 && options.maxHeight < options.minHeight) {
          options.maxHeight = viewportHeight - options.fullMargin
        }

        if (options.full) {
          options.shadow = false
          options.width = viewportWidth - options.fullMargin
          options.height = viewportHeight - options.fullMargin
          options.maxWidth = options.width
          options.maxHeight = options.height
        }
      }

      this.getOptions = function () {
        return options
      }

      this.clearOptions = function () {
        try {
          delete options.localData
          options.localData = null
        } catch (ex) {
        }
        options = null
      }

      this.tabs = []
      this.tabObjs = []

      this.initialized = false
      this.firstShow = false

      this.getDialog = function () {
        return null
      }
    },
    data: function (name, value) {
      if (value != undefined) {
        let previous_value = this.getOptions().localData[name]
        this.getOptions().localData[name] = value
        return previous_value
      } else {
        return this.getOptions().localData[name]
      }
    },
    show: function () {
      let options = this.getOptions()
      options.hided = false
      if (PopupDialogMgr.findById(options.id) != null) {
        PopupDialogMgr.findById(options.id).bringToFront()
        return
      }
      if (this.initialized == false) {
        let popupDialog = $('<div/>').addClass('popup-dialog').css({
          width: Object.isNumber(options.width) ? options.width + options.unit : options.width,
          height:Object.isNumber(options.height) ?  options.height + options.unit : options.height,
        }).addClass(options.css)
        if (options.borderColor !== '') {
          popupDialog.css({
            borderColor: options.borderColor,
          })
        }
        if (options.backgroundColor != null && !''.equals(options.backgroundColor.trim())) {
          popupDialog.css({
            backgroundColor: options.backgroundColor,
          })
        }
        if (options.rounded) {
          popupDialog.addClass('rounded')
        }
        if (options.shadow) {
          popupDialog.addClass('shadow')
          if (options.shadowColor !== '') {
            popupDialog.css({
              boxShadowColor: options.shadowColor,
            })
          }
        }
        this.getDialog = function () {
          return popupDialog
        }
        let popupClose = $('<div/>').addClass('dialog-close').unselect()
        popupClose.css({
          color: options.closeColor,
        })
        let popupTitle = null
        if (options.title !== false) {
          popupTitle = $('<div/>').addClass('dialog-title').unselect().html(options.title)
          if (options.titleColor !== '') {
            popupTitle.css({
              color: options.titleColor,
            })
          }
          if (options.titleBgColor !== '') {
            popupTitle.css({
              backgroundColor: options.titleBgColor,
            })
          }

          if (options.titleCss !== '') {
            popupTitle.addClass(options.titleCss)
          }
        }
        let popupBody = $('<div/>').addClass('dialog-body').addClass(options.bodyCss).css({
          textAlign: options.bodyTextAlign,
        })

        if (options.bodyColor !== '') {
          popupBody.css({
            color: options.bodyColor,
          })
        }

        if (options.overflowX === false) {
          popupBody.css({
            overflowX: 'hidden',
          })
        }
        if (options.overflowY === false) {
          popupBody.css({
            overflowY: 'hidden',
          })
        }
        if (options.overflow === false) {
          popupBody.css({
            overflow: 'hidden',
          })
        }
        if (options.vcenter || options.content) {
          let content = $('<div/>').addClass('dialog-content').css({
            textAlign: options.bodyTextAlign,
          }).appendTo(popupBody)
          content.addClass(options.contentCss);
          content.css(options.contentStyle);

          if (options.vcenter) {
            popupBody.css({
              overflowX: 'hidden',
              overflowY: 'hidden',
              overflow: 'hidden',
              position: 'relative',
            })
            content.css({
              position: 'absolute',
              width: '100%'
            });
          }
        }
        if (options.backgroundColor != null && !''.equals(options.backgroundColor.trim())) {
          popupBody.css({
            backgroundColor: options.backgroundColor,
          })
        }
        if (options.bodyContent != null && !''.equals(options.bodyContent.trim())) {
          if (options.vcenter || options.content) {
            popupBody.find('div.dialog-content').eq(0).html(options.bodyContent)
          } else {
            popupBody.html(options.bodyContent)
          }
        }
        this.getDialogTitle = function () {
          return popupTitle
        }
        this.getDialogBody = function () {
          return popupBody
        }
        this.getDialogContentBody = function () {
          if (options.vcenter || options.content) {
            return popupBody.find('div.dialog-content').eq(0)
          } else {
            return popupBody
          }
        }
        this.getDialogContent = function () {
          if (options.vcenter || options.content) {
            return popupBody.find('div.dialog-content').eq(0).find(':first-child').eq(0)
          } else {
            return popupBody.find(':first-child').eq(0)
          }
        }
        this.getDialogButtons = function () {
          return null
        }

        popupDialog.on('mousedown', this.bringToFront.bind(this))
        if (popupTitle) {
          popupTitle.on('mousedown', this.dragstart.bind(this))
        }
        popupClose.on('click', this.close.bind(this))
        if (popupTitle) {
          popupTitle.appendTo(popupDialog)
        }
        popupBody.appendTo(popupDialog)
        for (let buttonName in options.buttonOptions) {
          if (this.getDialogButtons() == null) {
            let popupButtons = $('<div/>').addClass('dialog-buttons').addClass(options.buttonsCss)
            popupButtons.css({
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: this.getDialog().width() - 10, //'calc(100% - 10px)'
            })
            if (options.buttonsBgColor !== '') {
              popupButtons.css({
                backgroundColor: options.buttonsBgColor,
              })
            }

            if (options.small) {
              popupButtons.addClass('small')
            }
            if (options.buttonAlign) {
              popupButtons.css('textAlign', options.buttonAlign)
            }
            if (options.buttonsCss !== '') {
              popupButtons.addClass(options.buttonsCss)
            }
            if (options.buttonsStyle !== '') {
              popupButtons.css(options.buttonsStyle)
            }
            this.getDialogButtons = function () {
              return popupButtons
            }
          }
          let popupButtons = this.getDialogButtons()

          let btnOption = options.buttonOptions[buttonName]
          let btnBtnElement = $('<button/>')
          if (options.small) {
            btnBtnElement.addClass('small')
          }
          if (btnOption.disabled) {
            btnBtnElement.disable()
          }
          if (btnOption.id != null && !''.equals(btnOption.id.trim())) {
            btnOption.getButton = Object.methodize(btnBtnElement)
          }
          try {
            btnBtnElement.type = 'button'
          } catch (ex) {
          }
          btnBtnElement.addClass(options.buttonClass)
          if (btnOption.rounded) {
            btnBtnElement.addClass('rounded')
          }
          if (btnOption.small) {
            btnBtnElement.addClass('small')
          }
          if (btnOption.strong) {
            btnBtnElement.addClass('strong')
          }
          if (btnOption.css && !''.equals(btnOption.css)) {
            btnBtnElement.addClass(btnOption.css)
          }
          if (btnOption.bgColor && !''.equals(btnOption.bgColor)) {
            btnBtnElement.css({
              backgroundColor: btnOption.bgColor,
            })
          }
          if (btnOption.disabled) {
            btnBtnElement.disable()
          }
          btnBtnElement.css(btnOption.style)
          btnBtnElement.html(btnOption.text)
          let clickFn = (function (isClosable, clickfunction) {
            if (btnBtnElement.prop('disabled') || btnBtnElement.is(':disabled')) {
              return
            }
            let retValue = clickfunction.call(this)
            if (isClosable || (retValue === true)) {
              this.close()
            }
          }).bind(this, btnOption.close, btnOption.onClick)
          btnBtnElement.on('click', clickFn)

          if (options.hide) {
            btnBtnElement.css({
              display: 'none',
            })
          }

          btnBtnElement.appendTo(popupButtons)
          popupButtons.appendTo(popupDialog)

        }
        if (options.resize) {
          let popupResize = $('<div/>').addClass('dialog-resizer').unselect()
          popupResize.on('mousedown', this.resizestart.bind(this))
          popupResize.appendTo(popupDialog)
        }

        popupClose.appendTo(popupDialog)
        if (!options.closeable) {
          popupClose.hide()
        }

        if (popupBody) {
          popupBody.css(options.bodyStyle)
        }
        if (popupTitle) {
          popupTitle.css(options.titleStyle)
        }
        if (popupDialog) {
          popupDialog.css(options.dialogStyle)
        }

        popupDialog.hide()
        popupDialog.appendTo('body')

        this.bindClosable()
        try {
          options.onInit.call(this)
        } catch (ex) {
          console.log(ex)
        }
        PopupDialogMgr.add(this)
        this.initialized = true
      }
      PopupDialogMgr.bringToFront(this)
      try {
        options.onBeforeShow.call(this)
      } catch (ex) {
      }
      let pos = this.centerPos()
      this.getDialog().css({
        top: pos.Y + options.unit,
        left: pos.X + options.unit,
      })
      this.getDialog().show()
      this.resizeBody()
      let width = this.getDialog().width()
      let height = this.getDialog().height()

      if (options.mask) {
        PopupDialogMgr.showMask(this)
      }
      if (options.bodyContent != null && !''.equals(options.bodyContent.trim())) {
        if (this.firstShow != true) {
          try {
            PopupDialogMgr.cascadeDialog(this)
            options.onFirstShow.call(this)
          } catch (ex) {
            console.log(ex)
          }
          this.firstShow = true
        }
      }
      try {
        if (transition && options.showEffect) {
          this.getDialog().addClass(options.showEffect)
          this.getDialog().one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
            this.getDialog().removeClass(options.showEffect)
          }.bind(this))
        }
      } catch (ex) {
      }

      if (this.firstShow == false && options.url != null) {
        let that = this
        if (options.waiting) {
          this.getDialog().loading({
            seconds: options.waitingSeconds,
            reusable: false,
            opacity: options.waitingOpacity,
            mask: options.waitingBgColor,
            css: options.waitingCss,
            zIndex: this.getOptions().zIndex,
          }).loading('start')
        }
        $.ajax({
          type: options.method,
          url: options.url,
          async: options.async,
          contentType: options.contentType ? options.contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
          data: !options.stringify ? options.params : JSON.stringify(options.params),
          complete: function () {
            try {
              that.getDialog().loading('stop')
            } catch (ex) {
            }
            if (that.firstShow != true) {
              try {
                that.getOptions().onFirstShow.call(this)
              } catch (ex) {
                console.log(ex)
              }
              that.firstShow = true
            }
            try {
              that.getOptions().onShow.call(this)
              that.resizeBody()
            } catch (ex) {
              console.log(ex)
            }
          },
          success: function (data, textStatus, jqXHR) {
            that.getDialogContentBody().html(data)
          },
        })
      } else if (this.firstShow == true) {
        try {
          options.onShow.call(this)
          this.resizeBody()
        } catch (ex) {
          console.log(ex)
        }
      }
      return this
    },
    hide: function () {
      let options = this.getOptions()
      if (options.hided) {
        return
      }
      try {
        options.onBeforeHide.call(this)
      } catch (ex) {
        console.log(ex)
      }

      if (this.getDialog() != null) {
        try {
          that.getDialog().loading('stop')
        } catch (ex) {
        }
        this.getDialog().hide()
      }

      if (options.mask) {
        PopupDialogMgr.hideMask(this)
      }

      try {
        options.onHide.call(this)
      } catch (ex) {
        console.log(ex)
      }
      options.hided = true
      PopupDialogMgr.moveFocusToPrevious()
      return this
    },
    close: function () {
      let options = this.getOptions()
      if (options.hideOnClose) {
        if (transition && options.hideEffect) {
          this.getDialog().addClass(options.hideEffect)
          this.getDialog().one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
            this.hide()
            this.getDialog().removeClass(options.hideEffect)
          }.bind(this))
        } else {
          this.hide()
        }
      } else {
        if (transition && options.hideEffect) {
          this.getDialog().addClass(options.hideEffect)
          this.getDialog().one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
            this.__destroy__()
          }.bind(this))
        } else {
          this.__destroy__()
        }
      }
    },
    destroy: function () {
      let options = this.getOptions()
      if (transition && options.hideEffect) {
        this.getDialog().addClass(options.hideEffect)
        this.getDialog().one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
          this.__destroy__();
        }.bind(this))
      } else {
        this.__destroy__();
      }
    },
    __destroy__: function() {
      this.hide()
      let options = this.getOptions()
      try {
        options.onDestroy.call(this)
      } catch (ex) {
      }
      this.clearOptions()
      this.clearOptions = null
      this.getOptions = null
      PopupDialogMgr.remove(this)
      if (this.getDialog() != null) {
        this.getDialog().remove()
      }

      this.getDialogTitle = null
      this.getDialogBody = null
      this.getDialogButtons = null
      this.getOptions = null
      this.getDialog = null
    },
    body: function () {
      return this.getDialogBody()
    },
    zIndex: function (zIndex) {
      if (zIndex != undefined) {
        if (this.getDialog() != null) {
          this.getDialog().css({
            zIndex: zIndex - 1,
          })
        }
        this.getOptions().zIndex = zIndex
        return this
      } else {
        return this.getOptions().zIndex
      }
    },
    getMask: function () {
      return PopupDialogMgr.getMask()
    },
    bringToFront: function () {
      PopupDialogMgr.bringToFront(this)
      return this
    },
    pinDialog: function () {
      let options = this.getOptions()
      if (options && options.pin) {
        let pos = this.centerPos()
        this.moveTo(pos.Y, pos.X)
      }
      return this
    },
    resizeBody: function () {
      let options = this.getOptions()
      if (this.getDialog() != null) {
        let width = this.getDialog().width()
        let height = this.getDialog().height()
        let titleHeight = 0
        if (this.getDialogTitle()) {
          titleHeight = this.getAbsoluteHeight(this.getDialogTitle()[0]);
        }
        let buttonsHeight = 0
        if (this.getDialogButtons() != null) {
          buttonsHeight = this.getAbsoluteHeight(this.getDialogButtons()[0]);
        }

        let bodyWidth = width - this.getMarginWidth(this.getDialogBody()[0]);
        let bodyHeight = height - titleHeight - buttonsHeight - this.getMarginHeight(this.getDialogBody()[0]);

        this.getDialogBody().css({
          width: bodyWidth + options.unit, // 10 meams body width margin sum
          height: bodyHeight + options.unit,
        })
        if (this.getDialogButtons()) {
          this.getDialogButtons().css({
            width: this.getDialog().width()// - 10, //'calc(100% - 10px)'
          })
        }
        if (this.getOptions().vcenter) {
          let contentHeight = this.getDialogContentBody().height();
          if ((bodyHeight - contentHeight) > 0) {
            this.getDialogContentBody().css({
              top: ((bodyHeight - contentHeight) / 2) + options.unit,
            })
          }
        }
        try {
          this.getOptions().onResize.call(this, bodyWidth, bodyHeight)
          if (this.getOptions().pin == true) {
            this.pinDialog()
          }
        } catch (ex) {
          console.log(ex)
        }
      }
    },
    getAbsoluteHeight: function (el) {
      el = (typeof el === 'string') ? document.querySelector(el) : el;

      let styles = window.getComputedStyle(el);
      let margin = parseFloat(styles['marginTop']) +
        parseFloat(styles['marginBottom']);

      return Math.ceil(el.offsetHeight + margin);
    },
    getAbsoluteWidth: function (el) {
      el = (typeof el === 'string') ? document.querySelector(el) : el;

      let styles = window.getComputedStyle(el);
      let margin = parseFloat(styles['marginLeft']) +
        parseFloat(styles['marginRight']);

      return Math.ceil(el.offsetWidth + margin);
    },
    getMarginHeight: function (el) {
      el = (typeof el === 'string') ? document.querySelector(el) : el;

      let styles = window.getComputedStyle(el);
      let margin = parseFloat(styles['marginTop']) +
        parseFloat(styles['marginBottom']);

      return Math.ceil(margin);
    },
    getMarginWidth: function (el) {
      el = (typeof el === 'string') ? document.querySelector(el) : el;

      let styles = window.getComputedStyle(el);
      let margin = parseFloat(styles['marginLeft']) +
        parseFloat(styles['marginRight']);

      return Math.ceil(margin);
    },
    centerPos: function () {
      let pos = {
        X: 0,
        Y: 0,
      }
      if (this.getDialog() != null) {
        let width = 0
        let height = 0
        let dialog = this.getDialog()
        let options = this.getOptions()
        let viewport = options.maskViewport === 'viewport'
        //if (viewport) {
        width = $(window).width()
        height = $(window).height()
        /*} else {
          try {
            width = window.innerWidth;
          } catch (ex) {
            width = $(document).width();
          }
          try {
            height = window.innerHeight;
          } catch (ex) {
            height = $(window).height();
          }
        }*/
        let borderWidth = dialog.borderTickWidth()
        let borderHeight = dialog.borderTickHeight()
        let size = {
          width: dialog.width() + borderWidth,
          height: dialog.height() + borderHeight,
        }
        pos.Y = Math.ceil((height - size.height) / 2)
        pos.X = Math.ceil((width - size.width) / 2)
        if (pos.X < 0) pos.X = 0
        if (pos.Y < 0) pos.Y = 0
        /*if (!viewport) {
          pos.Y = pos.Y + $(document).scrollTop();
        }*/
      }
      return pos
    },
    moveTo: function (top, left) {
      let options = this.getOptions()
      this.getDialog().css({
        top: top + options.unit,
        left: left + options.unit,
      })
      return this
    },
    dragstart: function (event) {
      event.stopPropagation()
      if (this.getDialog() != null) {
        let dialog = this.getDialog()
        let options = this.getOptions()
        let viewport = options.maskViewport === 'viewport'
        this.bringToFront()
        try {
          options.onDragSart.call(this)
        } catch (ex) {
          console.log(ex)
        }
        let offsetX = 0
        let offsetY = 0
        if (viewport) {
          let pos = {
            top: parseInt(dialog.css('top')),
            left: parseInt(dialog.css('left')),
          }
          offsetX = event.screenX - pos.left
          offsetY = event.screenY - pos.top
        } else {
          let pos = dialog.offset()
          offsetX = event.clientX - pos.left
          offsetY = event.clientY - pos.top
        }
        let drag = (function (event) {
          event.stopPropagation()
          if (viewport) {
            dialog.css({
              top: event.screenY - offsetY + options.unit,
              left: event.screenX - offsetX + options.unit,
            })
          } else {
            dialog.css({
              top: event.clientY - offsetY - window.scrollY + options.unit,
              left: event.clientX - offsetX + options.unit,
            })
          }
          /*try {
            options.onDrag.call(this);
          } catch (ex) {
            console.log(ex)
          }*/
        }).bind(this)
        let dragend = (function (event) {
          try {
            options.onDragEnd.call(this)
          } catch (ex) {
            console.log(ex)
          }
          if (options.pin == true) {
            this.pinDialog()
          }
          $(document).off('mousemove', drag)
          $(document).off('mouseup', dragend)
        }).bind(this)
        $(document).on('mousemove', drag)
        $(document).on('mouseup', dragend)
      }
    },
    resizestart: function (event) {
      event.stopPropagation()
      if (this.getDialog() != null) {
        let dialog = this.getDialog()
        let options = this.getOptions()
        this.bringToFront()
        try {
          options.onResizeStart.call(this)
        } catch (ex) {
          console.log(ex)
        }
        let pos = this.getDialog().offset()
        let top = pos.top
        let left = pos.left
        let drag = (function (event) {
          event.stopPropagation()
          let diffHeight = (event.clientY + $(document).scrollTop()) - top
          let diffWidth = (event.clientX + $(document).scrollLeft()) - left
          if (diffHeight < options.minHeight) {
            diffHeight = options.minHeight
          }
          if (diffWidth < options.minWidth) {
            diffWidth = options.minWidth
          }

          if (options.maxWidth != -1 && diffWidth > options.maxWidth) {
            diffWidth = options.maxWidth
          }

          if (options.maxHeight != -1 && diffHeight > options.maxHeight) {
            diffHeight = options.maxHeight
          }

          dialog.css({
            height: diffHeight + options.unit,
            width: diffWidth + options.unit,
          })
          this.resizeBody()
        }).bind(this)
        let dragend = (function (event) {
          try {
            options.onResizeEnd.call(this)
          } catch (ex) {
            console.log(ex)
          }
          if (options.pin == true) {
            this.pinDialog()
          }
          $(document).off('mousemove', drag)
          $(document).off('mouseup', dragend)
        }).bind(this)
        $(document).on('mousemove', drag)
        $(document).on('mouseup', dragend)
      }
    },
    resize: function () {
      let options = this.getOptions()
      if (options.full) {
        let viewportWidth = $(window).width()
        let viewportHeight = $(window).height()

        let width = viewportWidth - options.fullMargin
        let height = viewportHeight - options.fullMargin

        this.getDialog().css({
          height: height + options.unit,
          width: width + options.unit,
        })
        this.resizeBody()
      }
      return this
    },
    saveTabObjs: function () {
      for (let i = 0, len = PopupDialog.TagsObj.length; i < len; i++) {
        let tObjs = document.getElementsByTagName(PopupDialog.TagsObj[i])
        for (let j = 0, jlen = tObjs.length; j < jlen; j++) {
          let ancestors = $(tObjs[j]).parents()
          let ancestorsDispaly = true
          for (let k = 0, klen = ancestors.length; k < klen; k++) {
            if (ancestors[k].css('display') == 'none' || ancestors[k].css('visibility') == 'hidden') {
              ancestorsDispaly = false
            }
          }
          if (!ancestorsDispaly) {
            continue
          }
          if (tObjs[j].css('display') == 'none' || tObjs[j].css('visibility') == 'hidden' || tObjs[j].attr('tabIndex') == -1) {
            continue
          }
          this.tabs.push(tObjs[j].attr('tabIndex'))
          this.tabObjs.push(tObjs[j])
        }
      }
      return this
    },
    disableTabs: function () {
      this.saveTabObjs()
      for (let i = 0; i < this.tabObjs.length; i++) {
        this.tabObjs[i].attr('tabIndex', -1)
      }
      return this
    },
    enableTabs: function () {
      for (let i = 0; i < this.tabObjs.length; i++) {
        this.tabObjs[i].attr('tabIndex', this.tabs[i])
      }
      delete this.tabObjs
      delete this.tabs
      this.tabObjs = []
      this.tabs = []
      return this
    },
    addButton: function () {
      let buttonOptions = Object.extend({
        id: '',
        bgColor: '',
        text: 'button',
        strong: false,
        close: true,
        rounded: false,
        small: false,
        disabled: false,
        css: '',
        style: {},
        onClick: Function.empty,
        getButton: Function.empty,
      }, arguments[0] || {})
      if (this.getOptions().buttonOptions[buttonOptions.text] == null) {
        this.getOptions().buttonOptions[buttonOptions.text] = buttonOptions
      }
      return this
    },
    getButton: function (id) {
      try {
        let options = this.getOptions()
        if (options != null && id != null && !''.equals(id.trim())) {
          for (let buttonName in options.buttonOptions) {
            let btnOption = options.buttonOptions[buttonName]
            if (btnOption.id == id) {
              return btnOption.getButton()
            }
          }
        }
      } catch (ex) {
      }
      return null
    },
    enableButton: function (id) {
      try {
        let options = this.getOptions()
        if (options != null && id != null && !''.equals(id.trim())) {
          for (let buttonName in options.buttonOptions) {
            let btnOption = options.buttonOptions[buttonName]
            if (btnOption.id == id) {
              btnOption.getButton().enable()
            }
          }
        }
      } catch (ex) {
      }
      return this
    },
    disableButton: function (id) {
      try {
        let options = this.getOptions()
        if (options != null && id != null && !''.equals(id.trim())) {
          for (let buttonName in options.buttonOptions) {
            let btnOption = options.buttonOptions[buttonName]
            if (btnOption.id == id) {
              btnOption.getButton().disable()
            }
          }
        }
      } catch (ex) {
      }
      return this
    },
    toggleButton: function (id) {
      try {
        let options = this.getOptions()
        if (options != null && id != null && !''.equals(id.trim())) {
          for (let buttonName in options.buttonOptions) {
            let btnOption = options.buttonOptions[buttonName]
            if (btnOption.id == id) {
              if (btnOption.getButton().prop('disabled')) {
                btnOption.getButton().enable()
              } else {
                btnOption.getButton().disable()
              }
            }
          }
        }
      } catch (ex) {
      }
      return this
    },
    showButton: function (id) {
      try {
        let options = this.getOptions()
        if (options != null && id != null && !''.equals(id.trim())) {
          for (let buttonName in options.buttonOptions) {
            let btnOption = options.buttonOptions[buttonName]
            if (btnOption.id == id) {
              btnOption.getButton().css({
                display: '',
              })
            }
          }
        }
      } catch (ex) {
      }
      return this
    },
    hideButton: function (id) {
      try {
        let options = this.getOptions()
        if (options != null && id != null && !''.equals(id.trim())) {
          for (let buttonName in options.buttonOptions) {
            let btnOption = options.buttonOptions[buttonName]
            if (btnOption.id == id) {
              btnOption.getButton().css({
                display: 'none',
              })
            }
          }
        }
      } catch (ex) {
      }
      return this
    },
    title: function (title) {
      if (this.getDialogTitle() != null) {
        this.getDialogTitle().html(title)
      }
    },
    width: function (value) {
      if (value == undefined) {
        return this.getDialog().width()
      } else {
        this.getOptions().width = value
      }
    },
    height: function (value) {
      if (value == undefined) {
        return this.getDialog().height()
      } else {
        this.getOptions().height = value
      }
    },
    content: function (content) {
      if (this.getDialog() != null) {
        this.getDialogContentBody().empty()
        this.getDialogContentBody().html(content)
        this.bindClosable()
      } else {
        this.getOptions().bodyContent = content
      }
      return this
    },
    element: function (element) {
      if (this.getDialog() != null) {
        this.getDialogContentBody().empty()
        $(element).appendTo(this.getDialogContentBody())
        this.bindClosable()
      }
      return this
    },
    openURL: function (url) {
      if (this.getDialog() != null) {
        let opts = this.getOptions()
        let options = Object.extend({
          type: opts.method,
          async: opts.async,
          params: {},
          contentType: opts.contentType,
          stringify: opts.stringify,
          waiting: opts.waiting,
          waitingSeconds: opts.waitingSeconds,
          waitingOpacity: opts.waitingOpacity,
          waitingBgColor: opts.waitingBgColor,
          waitingCss: opts.waitingCss,
        }, arguments[1] || {})
        let body = this.getDialogContentBody()
        let that = this
        if (options.waiting) {
          this.getDialog().loading({
            seconds: options.waitingSeconds,
            reusable: false,
            opacity: options.waitingOpacity,
            mask: options.waitingBgColor,
            css: options.waitingCss,
            zIndex: this.getOptions().zIndex,
          }).loading('start')
        }
        $.ajax({
          type: options.method,
          url: url,
          async: options.async,
          contentType: options.contentType ? options.contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
          data: !options.stringify ? options.params : JSON.stringify(options.params),
          complete: function () {
            try {
              if (options.waiting) {
                that.getDialog().loading('stop')
              }
            } catch (ex) {
            }
            try {
              that.getOptions().onShow.call(this)
              that.resizeBody()
            } catch (ex) {
              console.log(ex)
            }
          },
          success: function (data) {
            body.empty()
            body.html(data)
            that.bindClosable()
          },
        })
      }
      return this
    },
    bindClosable: function () {
      let closables = this.getDialogBody().find('.closable')
      let closeFunc = this.close.bind(this)
      closables.each(function (idx, el) {
        $(this).css({
          cursor: 'pointer',
        }).unselect()
        $(this).on('click', closeFunc)
      })
      return this
    },
  })

  PopupDialog.TagsObj = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IFRAME', 'AREA', 'OBJECT']

  return jQuery
})(jQuery, typeof window !== 'undefined' ? window : this)
