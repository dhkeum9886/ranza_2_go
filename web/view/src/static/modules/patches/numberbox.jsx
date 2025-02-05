import jQuery from 'jquery'
import './numberbox.css'

class Numberbox {
  constructor(target, option = {}) {
    this.options = Object.merge({
      event: 'input change',
      onFocus: Function.empty,
      onBlur: Function.empty,
      onChange: Function.empty
    }, option)

    this.element = jQuery(target);

    this._readOption_();

    if (!this.element.is('input')) {
      throw TypeError('target is not <input>!');
    }
    if (!this.element.is('[type=number]')) {
      throw TypeError('target type is not number! please use [type=number]');
    }
    if (this.element.val().trim() == '') {
      this.element.val(this.options.defaultValue != null ? this.options.defaultValue.toFixed(this.options.precision) : '');
    }

    this.options.onChange = this.options.onChange.bind(this.element);
    this.options.onBlur = this.options.onBlur.bind(this.element);
    this.options.onFocus = this.options.onFocus.bind(this.element);
    this._focus = this._focus_.bind(this);
    this._blur = this._blur_.bind(this);
    this._change = this._change_.bind(this);

    this.oldValue = this.element.val();
    this.element.on("focus", this._focus);
    this.element.on("blur", this._blur);
    if (this.options.maxlength > 0) {
      this._maxlength = this._maxlength_.bind(this);
      this.element.on("input", this._maxlength);
    }
    this.element.on(this.options.event, this._change);
    this.form = this.element.closest('form');
  }

  _readOption_() {
    this.options.strict = this.element.attr('strict') == 'true' ? true : false;
    this.options.defaultValue = this.element.attr('default');
    this.options.precision = this.element.attr('step');
    this.options.min = this.element.attr('min');
    this.options.max = this.element.attr('max');
    this.options.maxlength = this.element.attr('maxlength');
    if (this.options.defaultValue && !this.options.defaultValue.isEmpty() && !isNaN(+(this.options.defaultValue))) {
      this.options.defaultValue = +(this.options.defaultValue);
    } else {
      this.options.defaultValue = null;
    }
    if (this.options.min && !this.options.min.isEmpty() && !isNaN(+(this.options.min))) {
      this.options.min = +(this.options.min);
    } else {
      this.options.min = Number.MIN_VALUE;
    }
    if (this.options.max && !this.options.max.isEmpty() && !isNaN(+(this.options.max))) {
      this.options.max = +(this.options.max);
    } else {
      this.options.max = Number.MAX_VALUE;
    }
    if (this.options.maxlength && !this.options.maxlength.isEmpty() && !isNaN(+(this.options.maxlength))) {
      this.options.maxlength = +(this.options.maxlength);
    } else {
      this.options.maxlength = 0;
    }
    if (this.options.precision && !this.options.precision.isEmpty() && !isNaN(+(this.options.precision)) && this.options.precision.indexOf(".") != -1) {
      let points = this.options.precision.substring(this.options.precision.indexOf(".") + 1);
      if (!points.isEmpty()) {
        this.options.precision = points.length;
      }
    } else {
      this.options.precision = 0;
    }
  }

  _focus_() {
    this._set(this.element.val(), true);
    this.options.onFocus();
  }

  _blur_() {
    this._set(this.element.val(), true);
    this.options.onBlur();
  }

  _maxlength_(event) {
    this.element.val(this.element.val().slice(0, this.options.maxlength));
  }

  _change_(event) {
    if (event.originalEvent.data == '-' || event.originalEvent.data == '+' || event.originalEvent.data == '.') {
      return;
    }
    this._set(this.element.val(), this.options.strict);
  }

  _set(val, strict = false) {
    if (!val) {
      if (this.options.defaultValue !== null) {
        val = this.options.defaultValue;
      } else {
        this.element.val('');
        this.options.onChange(this.element, this.element.val(), this.oldValue, this.form);
        this.oldValue = this.element.val();
        return;
      }
    }
    val = new Number(val);
    /*if (val && isNaN(val)) {
      if (this.options.defaultValue !== null) {
        val = this.options.defaultValue;
      }
    }*/
    if (strict) {
      if (val < this.options.min) {
        val = this.options.min;
      }
      if (val > this.options.max) {
        val = this.options.max;
      }

      this.element.val(val.toFixed(this.options.precision));
    }
    this.options.onChange(this.element, this.element.val(), this.oldValue, this.form);
    this.oldValue = this.element.val();
  }

  lock() {
    this.element.lock();
  }

  unlock() {
    this.element.unlock();
  }

  disable() {
    this.element.disable();
  }

  enable() {
    this.element.enable();
  }

  refresh() {
    this._readOption_();
  }

  set min(val) {
    val = new Number(val);
    if (!isNaN(val)) {
      this.options.min = val;
    }
  }

  set max(val) {
    val = new Number(val);
    if (!isNaN(val)) {
      this.options.max = val;
    }
  }

  set value(val) {
    this._set(val);
  }

  get value() {
    return this.element.val();
  }

  static of(target, option = {}) {
    return new Numberbox(target, option);
  }

  static init(target, option = {}) {
    if (target) {
      $(target).find('input[type=number]').toArray().forEach(el => Numberbox.of(el, option));
    } else {
      jQuery('input[type=number]').toArray().forEach(el => Numberbox.of(el, option));
    }
  }
}

export default Numberbox;
