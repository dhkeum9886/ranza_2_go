import jQuery from 'jquery'

(function ($, global) {
  global.Hotkey = ({
    shiftNums: {
      "`": "~",
      "1": "!",
      "2": "@",
      "3": "#",
      "4": "$",
      "5": "%",
      "6": "^",
      "7": "&",
      "8": "*",
      "9": "(",
      "0": ")",
      "-": "_",
      "=": "+",
      ";": ":",
      "'": "\"",
      ",": "<",
      ".": ">",
      "/": "?",
      "\\": "|"
    },
    mouseKeys: {
      'left_button': 1,
      'leftbutton': 1,
      'middle_button': 2,
      'middlebutton': 2,
      'right_button': 3,
      'rightbutton': 3,
      'button1': 1,
      'button2': 2,
      'button3': 3,
      'button4': 4,
      'button5': 5,
      'button6': 6,
      'button7': 7,
      'button8': 8,
      'button9': 9,
      'button10': 10
    },
    specialKeys: {
      'esc': 27,
      'escape': 27,
      'tab': 9,
      'space': 32,
      'return': 13,
      'enter': 13,
      'backspace': 8,
      'scrolllock': 145,
      'scroll_lock': 145,
      'scroll': 145,
      'capslock': 20,
      'caps_lock': 20,
      'caps': 20,
      'numlock': 144,
      'num_lock': 144,
      'num': 144,
      'pause': 19,
      'break': 19,
      'insert': 45,
      'home': 36,
      'delete': 46,
      'end': 35,
      'pageup': 33,
      'page_up': 33,
      'pu': 33,
      'pagedown': 34,
      'page_down': 34,
      'pd': 34,
      'left': 37,
      'up': 38,
      'right': 39,
      'down': 40,
      'f1': 112,
      'f2': 113,
      'f3': 114,
      'f4': 115,
      'f5': 116,
      'f6': 117,
      'f7': 118,
      'f8': 119,
      'f9': 120,
      'f10': 121,
      'f11': 122,
      'f12': 123
    },
    bind: function (element, type, shortcut, callback, propagate, namespace) {
      element = jQuery(element || document);
      if (!namespace) {
        namespace = 'fn-hotkey'
      }
      if (!element.data('fn-hotkey-shortcuts-' + namespace)) {
        element.data('fn-hotkey-shortcuts-' + namespace, {});
      }
      let shortcuts = element.data('fn-hotkey-shortcuts-' + namespace);
      if (type == undefined || type == null) {
        type = "keydown";
      }
      if (shortcut == undefined || shortcut == null || typeof shortcut != "string" || "".equals(shortcut.trim())) {
        return;
      }
      if (propagate !== true && propagate !== false) {
        propagate = true;
      }
      let args = Array.from(arguments).slice(6);

      let handler = (function (event) {
        let code = event.keyCode ? event.keyCode : event.charCode;
        let character = String.fromCharCode(code).toLowerCase();

        let multikeys = shortcut.split("|");
        for (let multikeyIdx = 0; multikeyIdx < multikeys.length; multikeyIdx++) {
          let keys = multikeys[multikeyIdx].toLowerCase().split("+");
          let kp = 0;
          let k;
          for (let i = 0; i < keys.length; i++) {
            k = keys[i]
            if (k == 'ctrl' || k == 'control') {
              if (event.ctrlKey) kp++;
            } else if (k == 'shift') {
              if (event.shiftKey) kp++;
            } else if (k == 'alt') {
              if (event.altKey) kp++;
            } else if (k.length > 1) {
              if (Hotkey.specialKeys[k] && Hotkey.specialKeys[k] == code) {
                kp++;
              }
              if (Hotkey.mouseKeys[k] && Hotkey.mouseKeys[k] == event.which) {
                kp++;
              }
            } else {
              if (k == "*") {
                kp++;
              } else if (character == k) {
                kp++;
              } else {
                if (Hotkey.shiftNums[character] && event.shiftKey) {
                  character = Hotkey.shiftNums[character];
                  if (character == k) kp++;
                }
                if (Hotkey.mouseKeys[k] && Hotkey.mouseKeys[k] == event.which) {
                  kp++;
                }
              }
            }
          }

          if (kp == keys.length) {
            let ret = callback.apply(element, [event].concat(args));
            if (ret === false || propagate === false) {
              event.stopPropagation();
              event.preventDefault();
              return false;
            }
          }
        }
      }).bind(element);

      element.data('fn-hotkey-type.' + namespace, type);
      let shorttended = shortcut.replace(/(\||\+)/g, '');
      shortcuts[shorttended] = handler;
      let types = type.split("|").compact();
      for (let i = 0, len = types.length; i < len; i++) {
        element.on(types[i] + '.' + namespace, handler);
      }

      return handler;
    },
    unbind: function (element, type, shortcut, namespace) {
      element = jQuery(element || document);
      if (!namespace) {
        namespace = 'fn-hotkey'
      }
      if (!type) {
        type = element.data('fn-hotkey-type.' + namespace);
      }
      if (!type) {
        return;
      }
      if (shortcut) {
        shortcut = shortcut.replace(/(\||\+)/g, '');
      }

      if (!element.data('fn-hotkey-shortcuts-' + namespace)) {
        element.data('fn-hotkey-shortcuts-' + namespace, {});
      }
      let shortcuts = element.data('fn-hotkey-shortcuts-' + namespace);
      let types = type.split("|").compact();
      for (let i = 0, len = types.length; i < len; i++) {
        if (shortcut && shortcuts[shortcut]) {
          element.off(types[i] + '.' + namespace, shortcuts[shortcut]);
          delete shortcuts[shortcut];
        } else {
          element.off(types[i] + '.' + namespace);
        }
      }
    }
  });
  return jQuery;
})(jQuery, typeof window !== "undefined" ? window : this);
