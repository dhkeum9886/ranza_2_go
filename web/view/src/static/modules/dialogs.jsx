import 'dialog/dialog'

global.Confirm = function(width = 400, height = 150, title = 'Confirm', content = '', callback = Function.empty, ok = 'OK', cancel = 'Cancel', cancelCallback = Function.empty) {
  let confirm = new PopupDialog({
    css: 'bg-white text-black',
    titleCss: 'bg-blue text-white',
    title: `<i class="fas fa-info-circle middle"></i> ${title}`,
    titleBackgroundColor: '#7472f3',
    width: width,
    height: height,
    bodyContent: `<i class="far fa-exclamation-circle fa-2x middle text-blue mr5"></i> ${content}`,
    maskColor: '#0a22ff',
    maskOpacity: 0.2,
    mask: true,
    pin: true,
    resize: true,
    vcenter: true,
    rounded: true,
    closeable: true,
    buttonClass: 'button',
    bodyTextAlign: 'center',
    hideOnClose: false,
    showEffect: 'fadein',
    hideEffect: 'fadeout',
    blurTarget: '.fz-wrapper',
    blurValue: 1,
  });
  confirm.addButton({
    text: ok,
    css: 'bg-blue text-white',
    strong: true,
    close: true,
    onClick: callback
  });
  confirm.addButton({
    text: cancel,
    css: 'bg-gray-light text-white',
    close: true,
    onClick: cancelCallback
  });

  confirm.show();
}

global.Info = function(width = 400, height = 150, title = 'Info', content = '', callback = Function.empty, ok = 'OK') {
  let alert = new PopupDialog({
    css: 'bg-white text-black',
    titleCss: 'bg-info text-white',
    title: `<i class="fa-solid fa-circle-info middle text-white"></i> ${title}`,
    width: width,
    height: height,
    bodyContent: `<i class="fa-regular fa-circle-info fa-2x middle text-info mr5"></i> ${content}`,
    maskColor: '#e0a800',
    maskOpacity: 0.2,
    mask: true,
    pin: true,
    resize: true,
    vcenter: true,
    rounded: true,
    closeable: true,
    buttonClass: 'button',
    bodyTextAlign: 'center',
    hideOnClose: false,
    showEffect: 'bump',
    hideEffect: 'fadeout',
    blurTarget: '.fz-wrapper',
    blurValue: 1,
  });
  alert.addButton({
    text: ok,
    bgColor: '#f78939',
    css: 'bg-info text-white',
    strong: true,
    close: true,
    onClick: callback
  });

  alert.show();
}

global.Alert = function(width = 400, height = 150, title = 'Alert', content = '', callback = Function.empty, ok = 'OK') {
  let alert = new PopupDialog({
    css: 'bg-white text-black',
    titleCss: 'bg-orange text-white',
    title: `<i class="fas fa-exclamation-circle middle text-white"></i> ${title}`,
    width: width,
    height: height,
    bodyContent: `<i class="far fa-info-circle fa-2x middle text-orange mr5"></i> ${content}`,
    maskColor: '#e0a800',
    maskOpacity: 0.2,
    mask: true,
    pin: true,
    resize: true,
    vcenter: true,
    rounded: true,
    closeable: true,
    buttonClass: 'button',
    bodyTextAlign: 'center',
    hideOnClose: false,
    showEffect: 'bump',
    hideEffect: 'fadeout',
    blurTarget: '.fz-wrapper',
    blurValue: 1,
  });
  alert.addButton({
    text: ok,
    bgColor: '#f78939',
    css: 'bg-orange text-white',
    strong: true,
    close: true,
    onClick: callback
  });

  alert.show();
}

global.Warning = function(width = 400, height = 150, title = 'Warning', content = '', callback = Function.empty, ok = 'OK', cancel = 'Close', cancelCallback = Function.empty) {
  let warning = new PopupDialog({
    css: 'bg-white text-black',
    titleCss: 'bg-light-orange-darker text-white',
    title: `<i class="fas fa-lightbulb-exclamation middle"></i> ${title}`,
    titleBackgroundColor: '#fd7342',
    width: width,
    height: height,
    bodyContent: `<i class="far fa-lightbulb-exclamation fa-2x middle text-light-orange-darker mr5"></i> ${content}`,
    maskColor: '#fd7342',
    maskOpacity: 0.2,
    mask: true,
    pin: true,
    resize: true,
    vcenter: true,
    rounded: true,
    closeable: true,
    buttonClass: 'button',
    bodyTextAlign: 'center',
    hideOnClose: false,
    showEffect: 'fadein',
    hideEffect: 'fadeout',
    blurTarget: '.fz-wrapper',
    blurValue: 1,
  });
  warning.addButton({
    text: ok,
    css: 'bg-light-orange-darker text-white',
    strong: true,
    close: true,
    onClick: callback
  });
  warning.addButton({
    text: cancel,
    css: 'bg-gray-light text-white',
    close: true,
    onClick: cancelCallback
  });

  warning.show();
}

global.Notice = function(width = 400, height = 150, title = 'Notice', content = '', callback = Function.empty, ok = 'Close') {
  let notice = new PopupDialog({
    css: 'bg-green text-white',
    titleCss: 'bg-green text-white',
    title: `<i class="fas fa-exclamation-circle middle text-white"></i> ${title}`,
    width: width,
    height: height,
    bodyContent: `<i class="far fa-circle-exclamation-check fa-2x middle text-white mr5"></i> ${content}`,
    maskColor: '#e0a800',
    maskOpacity: 0.2,
    mask: true,
    pin: true,
    resize: true,
    vcenter: true,
    rounded: true,
    closeable: true,
    buttonClass: 'button',
    bodyTextAlign: 'center',
    hideOnClose: false,
    showEffect: 'bump',
    hideEffect: 'fadeout',
    blurTarget: '.fz-wrapper',
    blurValue: 1,
  });
  notice.addButton({
    text: ok,
    bgColor: '#f78939',
    css: 'bg-white text-black',
    strong: true,
    close: true,
    onClick: callback
  });

  notice.show();
}

global.ContentDialog = function(width = 400, height = 150, title = 'Confirm', content = '', callback = Function.empty, ok = 'OK', cancel = 'Close') {
  let confirm = new PopupDialog({
    css: 'bg-default',
    titleCss: 'bg-blue text-white',
    title: title,
    titleBackgroundColor: '#7472f3',
    width: width,
    height: height,
    bodyContent: content,
    maskColor: '#0a22ff',
    maskOpacity: 0.2,
    mask: true,
    pin: true,
    resize: true,
    vcenter: true,
    rounded: true,
    closeable: true,
    buttonClass: 'button',
    bodyTextAlign: 'center',
    hideOnClose: false,
    showEffect: 'fadein',
    hideEffect: 'fadeout',
    blurTarget: '.fz-wrapper',
    blurValue: 1,
  });
  confirm.addButton({
    text: ok,
    css: 'bg-blue text-white',
    strong: true,
    close: true,
    onClick: callback
  });
  confirm.addButton({
    text: cancel,
    css: 'bg-gray-light text-white',
    close: true
  });

  confirm.show();
}
