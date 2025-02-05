import jQuery from 'jquery'

(function ($, global) {

  let _event_ = false
  if ($('head meta[name=ui_event]').length && $('head meta[name=ui_event]').attr('content') === 'true') {
    _event_ = true
  }
  let ui = ({
    change: {
      selector: 'select[ui-onchange], input[ui-onchange], textarea[ui-onchange], select[\\@change], input[\\@change], textarea[\\@change]',
      propagation: 'ui-onchange-bubble',
      propagation_alt: '@change-bubble',
      event: 'onchange',
      command: 'ui-onchange',
      command_alt: '@change',
      target: 'ui-onchange-target',
      target_alt: '@change-target',
      data_attr: 'ui-onchange-data',
      data_attr_alt: '@change-data',
      force: 'ui-onchange-force',
      force_alt: '@change-force',
      data: 'change-data',
      transient: 'ui-onchange-transient',
      transient_alt: '@change-transient',
    },
    click: {
      selector: '[ui-onclick], [\\@click]',
      propagation: 'ui-onclick-bubble',
      propagation_alt: '@click-bubble',
      event: 'onclick',
      command: 'ui-onclick',
      command_alt: '@click',
      target: 'ui-onclick-target',
      target_alt: '@click-target',
      data_attr: 'ui-onclick-data',
      data_attr_alt: '@click-data',
      data: 'click-data',
    },
    dblclick: {
      selector: '[ui-ondblclick], [\\@dblclick]',
      propagation: 'ui-ondblclick-bubble',
      propagation_alt: '@dblclick-bubble',
      event: 'ondblclick',
      command: 'ui-ondblclick',
      command_alt: '@dblclick',
      target: 'ui-ondblclick-target',
      target_alt: '@dblclick-target',
      data_attr: 'ui-ondblclick-data',
      data_attr_alt: '@dblclick-data',
      data: 'dblclick-data',
    },
    tab: {
      selector: '[ui-ontab], [\\@tab]',
      propagation: 'ui-ontab-bubble',
      propagation_alt: '@tab-bubble',
      event: 'ontab',
      command: 'ui-ontab',
      command_alt: '@tab',
      target: 'ui-ontab-target',
      target_alt: '@tab-target',
      data_attr: 'ui-ontab-data',
      data_attr_alt: '@tab-data',
      data: 'tab-data',
    },
    focus: {
      selector: '[ui-onfocus], [\\@focus]',
      propagation: 'ui-onfocus-bubble',
      propagation_alt: '@focus-bubble',
      event: 'onfocus',
      command: 'ui-onfocus',
      command_alt: '@focus',
      target: 'ui-onfocus-target',
      target_alt: '@focus-target',
      data_attr: 'ui-onfocus-data',
      data_attr_alt: '@focus-data',
      data: 'focus-data',
    },
    blur: {
      selector: '[ui-onblur], [\\@blur]',
      propagation: 'ui-onblur-bubble',
      propagation_alt: '@blur-bubble',
      event: 'onblur',
      command: 'ui-onblur',
      command_alt: '@blur',
      target: 'ui-onblur-target',
      target_alt: '@blur-target',
      data_attr: 'ui-onblur-data',
      data_attr_alt: '@blur-data',
      data: 'blur-data',
    },
  })

  global.on_change = function (event, obj, directive, event_data, transient, propagation) {
    obj = $(obj)

    if (propagation !== true) {
      event.stopPropagation()
      event.preventDefault()
    }
    if (!directive || !obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled') || obj.prop('readonly')
      || (event.type === 'input' && transient === true)) {
      return false
    }

    if (event_data) {
      try {
        event_data = JSON.parse(event_data)
      } catch (ex) {
      }
    }
    let data = [directive, obj]
    if (event_data !== undefined && event_data != null) {
      data.push(event_data)
    } else {
      data.push({})
    }

    data.push(event)

    $(document).trigger(ui.change.event, data)

    if (propagation !== true) {
      return false
    }
  }

  let changeHandler = function (event) {
    let obj = $(this)
    if (!obj.length) {
      return
    }
    let propagation = obj.attr(ui.change.propagation)
    if (propagation === undefined || propagation == null) {
      propagation = obj.attr(ui.change.propagation_alt)
    }
    if (propagation !== true && propagation !== 'true') {
      event.stopPropagation()
      event.preventDefault()
    }
    let force = obj.attr(ui.change.force)
    if (force === undefined || force == null) {
      force = obj.attr(ui.change.force_alt)
    }
    if (!(force === true || force === 'true') && (!obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled') || obj.prop('readonly'))) {
      return
    }
    let directive = obj.attr(ui.change.command)
    if (directive === undefined || directive == null) {
      directive = obj.attr(ui.change.command_alt)
    }
    if (!directive) {
      return
    }
    let eventTargetId = obj.attr(ui.change.target)
    if (eventTargetId === undefined || eventTargetId == null) {
      eventTargetId = obj.attr(ui.change.target_alt)
    }

    let transient = obj.attr(ui.change.transient)
    if (transient === undefined || transient == null) {
      transient = obj.attr(ui.change.transient_alt)
    }
    if (event.type === 'input' && transient === 'true') {
      return
    }
    let eventTargetData = obj.attr(ui.change.data_attr)
    if (eventTargetData) {
      try {
        eventTargetData = JSON.parse(eventTargetData)
      } catch (ex) {
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.attr(ui.change.data_attr_alt)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.data(ui.change.data)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    let optionData = null
    if (obj.is('select')) {
      let multiple = obj.prop('multiple')
      if (multiple) {
        optionData = []
        let options = obj.find('option:checked')
        options.each((idx, option) => {
          let data = option.attr(ui.change.data_attr)
          if (data) {
            try {
              let val = JSON.parse(data)
              optionData.push(val)
            } catch (ex) {
              optionData.push(data)
            }
          }
          if (data === undefined || data == null) {
            data = option.attr(ui.change.data_attr_alt)
            if (data) {
              try {
                let val = JSON.parse(data)
                optionData.push(val)
              } catch (ex) {
                optionData.push(data)
              }
            }
          }
          if (data === undefined || data == null) {
            data = option.data(ui.change.data)
            if (data) {
              try {
                let val = JSON.parse(data)
                optionData.push(val)
              } catch (ex) {
                optionData.push(data)
              }
            }
          }
        })
        if (optionData.length === 0) {
          optionData = null
        }
      } else {
        let option = obj.find('option:checked')
        optionData = option.attr(ui.change.data_attr)
        if (optionData) {
          try {
            optionData = JSON.parse(optionData)
          } catch (ex) {
          }
        }
        if (optionData === undefined || optionData == null) {
          optionData = option.attr(ui.change.data_attr_alt)
          if (optionData) {
            try {
              optionData = JSON.parse(optionData)
            } catch (ex) {
            }
          }
        }
        if (optionData === undefined || optionData == null) {
          optionData = option.data(ui.change.data)
          if (optionData) {
            try {
              optionData = JSON.parse(optionData)
            } catch (ex) {
            }
          }
        }
      }
    }
    let data = [directive, obj]
    if (eventTargetData !== undefined && eventTargetData != null) {
      data.push(eventTargetData)
      if (obj.is('select') && optionData !== undefined && optionData != null) {
        data.pop();
        data.push({
          data: eventTargetData,
          option: optionData
        })
      }
      data.push(event)
    } else {
      data.push({})
      if (obj.is('select') && optionData !== undefined && optionData != null) {
        data.pop();
        data.push({
          data: {},
          option: optionData
        })
      }
      data.push(event)
    }

    if (eventTargetId) {
      $(eventTargetId).trigger(ui.change.event, data)
    } else {
      $(document).trigger(ui.change.event, data)
    }
    if (propagation !== true && propagation !== 'true') {
      return false
    }
  }


  global.on_click = function (event, obj, directive, event_data, propagation) {
    obj = $(obj)

    if (propagation !== true) {
      event.stopPropagation()
      //event.stopImmediatePropagation()
      event.preventDefault()
    }
    if (!directive || !obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled') || obj.hasClass('dblclick')) {
      return false
    }

    if (event_data) {
      try {
        event_data = JSON.parse(event_data)
      } catch (ex) {
      }
    }
    let data = [directive, obj]
    if (event_data !== undefined && event_data != null) {
      data.push(event_data)
    } else {
      data.push({})
    }

    data.push(event)

    $(document).trigger(ui.click.event, data)

    if (propagation !== true) {
      return false
    }
  }

  let clickHandler = function (event) {
    let obj = $(this)
    if (!obj.length) {
      return
    }
    /*let propagation = obj.attr(ui.click.propagation)
    try {
      let val = JSON.parse(propagation)
      propagation = val
    } catch (ex) {
    }
    if (propagation == undefined || propagation == null) {
      propagation = obj.attr(ui.click.propagation_alt)
      try {
        let val = JSON.parse(propagation)
        propagation = val
      } catch (ex) {
      }
    }
    */
    let propagation = obj.attr(ui.click.propagation)
    if (propagation === undefined || propagation == null) {
      propagation = obj.attr(ui.click.propagation_alt)
    }
    if (propagation !== true && propagation !== 'true') {
      event.stopPropagation()
      //event.stopImmediatePropagation()
      event.preventDefault()
    }
    if (!obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled') || obj.hasClass('dblclick')) {
      return
    }
    if (obj.is(ui.dblclick.selector)) {
      return
    }
    let directive = obj.attr(ui.click.command)
    if (directive === undefined || directive == null) {
      directive = obj.attr(ui.click.command_alt)
    }
    if (!directive) {
      return
    }
    let eventTargetId = obj.attr(ui.click.target)
    if (eventTargetId === undefined || eventTargetId == null) {
      eventTargetId = obj.attr(ui.click.target_alt)
    }
    let eventTargetData = obj.attr(ui.click.data_attr)
    if (eventTargetData) {
      try {
        eventTargetData = JSON.parse(eventTargetData)
      } catch (ex) {
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.attr(ui.click.data_attr_alt)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.data(ui.click.data)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    let data = [directive, obj]
    if (eventTargetData !== undefined && eventTargetData != null) {
      data.push(eventTargetData)
    } else {
      data.push({})
    }

    data.push(event)

    if (eventTargetId) {
      $(eventTargetId).trigger(ui.click.event, data)
    } else {
      $(document).trigger(ui.click.event, data)
    }
    if (propagation !== true && propagation !== 'true') {
      return false
    }
  }

  global.on_dblclick = function (event, obj, directive, event_data, propagation) {
    obj = $(obj)

    if (propagation !== true) {
      event.stopPropagation()
      event.preventDefault()
    }
    if (!directive || !obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled')) {
      return false
    }

    if (event_data) {
      try {
        event_data = JSON.parse(event_data)
      } catch (ex) {
      }
    }
    let data = [directive, obj]
    if (event_data !== undefined && event_data != null) {
      data.push(event_data)
    } else {
      data.push({})
    }

    data.push(event)

    $(document).trigger(ui.dblclick.event, data)

    if (propagation !== true) {
      return false
    }
  }

  let dblClickHandler = function (event) {
    let obj = $(this)
    if (!obj.length) {
      return
    }
    /*let propagation = obj.attr(ui.dblclick.propagation)
    try {
      let val = JSON.parse(propagation)
      propagation = val
    } catch (ex) {
    }
    if (propagation == undefined || propagation == null) {
      propagation = obj.attr(ui.dblclick.propagation_alt)
      try {
        let val = JSON.parse(propagation)
        propagation = val
      } catch (ex) {
      }
    }*/
    let propagation = obj.attr(ui.dblclick.propagation)
    if (propagation === undefined || propagation == null) {
      propagation = obj.attr(ui.dblclick.propagation_alt)
    }
    if (propagation !== true && propagation !== 'true') {
      event.stopPropagation()
      event.preventDefault()
    }
    if (!obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled')) {
      return
    }
    let directive = obj.attr(ui.dblclick.command)
    if (directive === undefined || directive == null) {
      directive = obj.attr(ui.dblclick.command_alt)
    }
    if (!directive) {
      return
    }
    let eventTargetId = obj.attr(ui.dblclick.target)
    if (eventTargetId === undefined || eventTargetId == null) {
      eventTargetId = obj.attr(ui.dblclick.target_alt)
    }
    let eventTargetData = obj.attr(ui.dblclick.data_attr)
    if (eventTargetData) {
      try {
        eventTargetData = JSON.parse(eventTargetData)
      } catch (ex) {
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.attr(ui.dblclick.data_attr_alt)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.data(ui.dblclick.data)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    let data = [directive, obj]
    if (eventTargetData !== undefined && eventTargetData != null) {
      data.push(eventTargetData)
    } else {
      data.push({})
    }

    data.push(event)

    if (eventTargetId) {
      $(eventTargetId).trigger(ui.dblclick.event, data)
    } else {
      $(document).trigger(ui.dblclick.event, data)
    }
    if (propagation !== true && propagation !== 'true') {
      return false
    }
  }

  let tabHandler = function (event) {
    let obj = $(this)
    if (!obj.length) {
      return
    }
    /*let propagation = obj.attr(ui.tab.propagation)
    try {
      let val = JSON.parse(propagation)
      propagation = val
    } catch (ex) {
    }
    if (propagation == undefined || propagation == null) {
      propagation = obj.attr(ui.tab.propagation_alt)
      try {
        let val = JSON.parse(propagation)
        propagation = val
      } catch (ex) {
      }
    }*/
    let propagation = obj.attr(ui.tab.propagation)
    if (propagation === undefined || propagation == null) {
      propagation = obj.attr(ui.tab.propagation_alt)
    }
    if (propagation !== true && propagation !== 'true') {
      event.stopPropagation()
      event.preventDefault()
    }
    if (obj.hasClass('disabled') || obj.prop('disabled')) {
      return
    }
    let directive = obj.attr(ui.tab.command)
    if (directive === undefined || directive == null) {
      directive = obj.attr(ui.tab.command_alt)
    }
    if (!directive) {
      return
    }
    let eventTargetId = obj.attr(ui.tab.target)
    if (eventTargetId === undefined || eventTargetId == null) {
      eventTargetId = obj.attr(ui.tab.target_alt)
    }
    let eventTargetData = obj.attr(ui.tab.data_attr)
    if (eventTargetData) {
      try {
        eventTargetData = JSON.parse(eventTargetData)
      } catch (ex) {
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.attr(ui.tab.data_attr_alt)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.data(ui.tab.data)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    obj.getEvent = Object.methodize(event)
    //let data = [directive, obj, $(event.target.hash)];
    //if (eventTargetData != undefined && eventTargetData != null) {
    //  data.push(eventTargetData);
    //}
    let index = Math.ceil((obj.index() + 1) / 2)
    let panel = obj.closest('.fz-tabs').find('.tab-contents > .content').eq(index - 1)

    let data = [directive, obj, panel]

    if (eventTargetData !== undefined && eventTargetData != null) {
      data.push(eventTargetData)
    } else {
      data.push({})
    }

    data.push(event)

    if (eventTargetId) {
      $(eventTargetId).trigger(ui.tab.event, data)
    } else {
      $(document).trigger(ui.tab.event, data)
    }
    if (propagation !== true && propagation !== 'true') {
      return false
    }
  }

  global.on_focus = function (event, obj, directive, event_data, propagation) {
    obj = $(obj)

    if (propagation !== true) {
      event.stopPropagation()
      //event.stopImmediatePropagation()
      event.preventDefault()
    }
    if (!directive || !obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled')) {
      return false
    }

    if (event_data) {
      try {
        let val = JSON.parse(event_data)
        event_data = val
      } catch (ex) {
      }
    }
    let data = [directive, obj]
    if (event_data !== undefined && event_data != null) {
      data.push(event_data)
    } else {
      data.push({})
    }

    data.push(event)

    $(document).trigger(ui.focus.event, data)

    if (propagation !== true) {
      return false
    }
  }

  let focusHandler = function (event) {
    let obj = $(this)
    if (!obj.length) {
      return
    }
    /*let propagation = obj.attr(ui.focus.propagation)
    try {
      let val = JSON.parse(propagation)
      propagation = val
    } catch (ex) {
    }
    if (propagation == undefined || propagation == null) {
      propagation = obj.attr(ui.focus.propagation_alt)
      try {
        let val = JSON.parse(propagation)
        propagation = val
      } catch (ex) {
      }
    }*/
    let propagation = obj.attr(ui.focus.propagation)
    if (propagation === undefined || propagation == null) {
      propagation = obj.attr(ui.focus.propagation_alt)
    }
    if (propagation !== true && propagation !== 'true') {
      event.stopPropagation()
      //event.stopImmediatePropagation()
      event.preventDefault()
    }
    if (!obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled')) {
      return
    }
    let directive = obj.attr(ui.focus.command)
    if (directive === undefined || directive == null) {
      directive = obj.attr(ui.focus.command_alt)
    }
    if (!directive) {
      return
    }
    let eventTargetId = obj.attr(ui.focus.target)
    if (eventTargetId === undefined || eventTargetId == null) {
      eventTargetId = obj.attr(ui.focus.target_alt)
    }
    let eventTargetData = obj.attr(ui.focus.data_attr)
    if (eventTargetData) {
      try {
        eventTargetData = JSON.parse(eventTargetData)
      } catch (ex) {
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.attr(ui.focus.data_attr_alt)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.data(ui.focus.data)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    let data = [directive, obj]
    if (eventTargetData !== undefined && eventTargetData != null) {
      data.push(eventTargetData)
    } else {
      data.push({})
    }

    data.push(event)

    if (eventTargetId) {
      $(eventTargetId).trigger(ui.focus.event, data)
    } else {
      $(document).trigger(ui.focus.event, data)
    }
    if (propagation !== true && propagation !== 'true') {
      return false
    }
  }

  global.on_blur = function (event, obj, directive, event_data, propagation) {
    obj = $(obj)

    if (propagation !== true) {
      event.stopPropagation()
      //event.stopImmediatePropagation()
      event.preventDefault()
    }
    if (!directive || !obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled')) {
      return false
    }

    if (event_data) {
      try {
        event_data = JSON.parse(event_data)
      } catch (ex) {
      }
    }
    let data = [directive, obj]
    if (event_data !== undefined && event_data != null) {
      data.push(event_data)
    } else {
      data.push({})
    }

    data.push(event)

    $(document).trigger(ui.blur.event, data)

    if (propagation !== true) {
      return false
    }
  }

  let blurHandler = function (event) {
    let obj = $(this)
    if (!obj.length) {
      return
    }
    /*let propagation = obj.attr(ui.blur.propagation)
    try {
      let val = JSON.parse(propagation)
      propagation = val
    } catch (ex) {
    }
    if (propagation == undefined || propagation == null) {
      propagation = obj.attr(ui.blur.propagation_alt)
      try {
        let val = JSON.parse(propagation)
        propagation = val
      } catch (ex) {
      }
    }*/
    let propagation = obj.attr(ui.blur.propagation)
    if (propagation === undefined || propagation == null) {
      propagation = obj.attr(ui.blur.propagation_alt)
    }
    if (propagation !== true && propagation !== 'true') {
      event.stopPropagation()
      //event.stopImmediatePropagation()
      event.preventDefault()
    }
    if (!obj.is(':visible') || obj.hasClass('disabled') || obj.prop('disabled')) {
      return
    }
    let directive = obj.attr(ui.blur.command)
    if (directive === undefined || directive == null) {
      directive = obj.attr(ui.blur.command_alt)
    }
    if (!directive) {
      return
    }
    let eventTargetId = obj.attr(ui.blur.target)
    if (eventTargetId === undefined || eventTargetId == null) {
      eventTargetId = obj.attr(ui.blur.target_alt)
    }
    let eventTargetData = obj.attr(ui.blur.data_attr)
    if (eventTargetData) {
      try {
        eventTargetData = JSON.parse(eventTargetData)
      } catch (ex) {
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.attr(ui.blur.data_attr_alt)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    if (eventTargetData === undefined || eventTargetData == null) {
      eventTargetData = obj.data(ui.blur.data)
      if (eventTargetData) {
        try {
          eventTargetData = JSON.parse(eventTargetData)
        } catch (ex) {
        }
      }
    }
    let data = [directive, obj]
    if (eventTargetData !== undefined && eventTargetData != null) {
      data.push(eventTargetData)
    } else {
      data.push({})
    }

    data.push(event)

    if (eventTargetId) {
      $(eventTargetId).trigger(ui.blur.event, data)
    } else {
      $(document).trigger(ui.blur.event, data)
    }
    if (propagation !== true && propagation !== 'true') {
      return false
    }
  }

  $.registerUIEvent = function (target) {
    $.unregisterUIEvent(target)
    if (_event_) {
      $(target).on('input change', ui.change.selector, changeHandler)
      $(target).on('click', ui.click.selector, clickHandler)
      $(target).on('dblclick', ui.dblclick.selector, dblClickHandler)
      $(target).on('change', ui.tab.selector, tabHandler)
      $(target).on('focus', ui.focus.selector, focusHandler)
      $(target).on('blur', ui.focus.selector, blurHandler)
      //$(target).find(ui.tab.selector).filter('input[type=radio].tab-input').on('change', tabHandler)
    }
  }

  $.unregisterUIEvent = function (target) {
    if (_event_) {
      $(target).off('input change', ui.change.selector, changeHandler)
      $(target).off('click', ui.click.selector, clickHandler)
      $(target).off('dblclick', ui.dblclick.selector, dblClickHandler)
      $(target).off('change', ui.tab.selector, tabHandler)
      $(target).off('focus', ui.focus.selector, focusHandler)
      $(target).off('blur', ui.focus.selector, blurHandler)
      //$(target).find(ui.tab.selector).filter('input[type=radio].tab-input').off('change', tabHandler)
    }
  }

  let events = Array.of(ui.tab.event)

  if (_event_) {
    events = Array.of(ui.change.event, ui.click.event, ui.dblclick.event, ui.focus.event, ui.blur.event, ui.tab.event)
  }

  $.registerUIEvent.includes = function (event) {
    return events.includes(event)
  }

  let RouteEvent = Class.define({
    create: function (target, uievent, router) {
      this.router = router
      this.uievent = uievent
      this.handlers = {}
      if (!_event_) {
        return
      }
      if (!$.registerUIEvent.includes(uievent)) {
        throw new Error('unsupported event [' + uievent + ']')
      }
      $(target).on(uievent, (function (event, command, obj) {
        if (this.handlers[command]) {
          let args = Array.from(arguments).slice(2)
          let handlerArgs = Array.of(event)
          args.forEach(function (o) {
            handlerArgs.push(o)
          })
          this.handlers[command].apply(obj, handlerArgs)
          //return false;
        } else {
          console.warn('cannot find ' + event.type + ' handler on "' + target + '" command [' + command + '], registered handlers : [' + Object.keys(this.handlers) + ']')
        }
        event.stopPropagation()
        event.preventDefault()
        return false
      }).bind(this))
    },
    route: function (command, handler) {
      this.handlers[command] = handler
      return this
    },
    on: function (event) {
      return this.router.on(event)
    },
    onclick: function () {
      return this.router.onclick()
    },
    ondblclick: function () {
      return this.router.ondblclick()
    },
    onchange: function () {
      return this.router.onchange()
    },
    ontab: function () {
      return this.router.ontab()
    },
    onfocus: function () {
      return this.router.onfocus()
    },
    onblur: function () {
      return this.router.onblur()
    },
  })

  global.Router = Class.define({
    static: {
      __GLOBAL_ROUTERS_CACHE__: {},
      register: function (selector) {
        if (!global.Router.__GLOBAL_ROUTERS_CACHE__[selector]) {
          $.registerUIEvent(selector)
          return new Router(selector)
        }
      },
      unregister: function (selector) {
        if (global.Router.__GLOBAL_ROUTERS_CACHE__[selector]) {
          $.unregisterUIEvent(selector)
          delete global.Router.__GLOBAL_ROUTERS_CACHE__[selector]
        }
      },
      watch: function (target) {
        if (global.Router.__GLOBAL_ROUTERS_CACHE__[target]) return global.Router.__GLOBAL_ROUTERS_CACHE__[target]
        //return new Router(target);
        return global.Router.register(target)
      },
      onresize: function (handler) {
        if (Object.isFunction(handler)) {
          handler = handler.wrap(function () {
            this.$proceed()
            return true
          })
          $(window).on('resize', handler.debounce(50))
        }
      },
      ready: function (handler) {
        if (Object.isFunction(handler)) {
          if (document.readyState !== "loading") {
            handler.timeout(0);
          } else {
            document.addEventListener('DOMContentLoaded', handler)
          }
        }
      },
    },
    create: function (target) {
      this.events = {}
      if (global.Router.__GLOBAL_ROUTERS_CACHE__[target]) return global.Router.__GLOBAL_ROUTERS_CACHE__[target]
      this.target = target ? target : document
      global.Router.__GLOBAL_ROUTERS_CACHE__[target] = this
      return this
    },
    on: function (event) {
      if (!this.events[event]) {
        this.events[event] = new RouteEvent(this.target, event, this)
      }
      return this.events[event]
    },
    onclick: function () {
      return this.on('onclick')
    },
    ondblclick: function () {
      return this.on('ondblclick')
    },
    onchange: function () {
      return this.on('onchange')
    },
    oninput: function () {
      return this.on('oninput')
    },
    ontab: function () {
      return this.on('ontab')
    },
    onfocus: function () {
      return this.on('onfocus')
    },
    onblur: function () {
      return this.on('onblur')
    },
  })

  if (_event_) {
    global.Router.register(document)
  }
  return jQuery
})(jQuery, typeof window !== 'undefined' ? window : this)
