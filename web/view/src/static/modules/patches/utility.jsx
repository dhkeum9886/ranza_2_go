import jQuery from 'jquery'

(function ($, global) {
  Object.extend = function (dest, source, copyRef) {
    if (Object.prototype.toString.call(copyRef) === '[object Object]' && typeof copyRef != "undefined" && !copyRef.nodeName) { // copy only copyRef's property
      for (let property in copyRef) {
        if (source[property] !== undefined) {
          dest[property] = source[property];
        }
      }
      return dest;
    } else {
      for (let property in source) dest[property] = source[property];
      return dest;
    }
  };

  try {
    Object.defineProperty(Function, 'empty', {
      value: function () {
      },
      writable: false
    });
  } catch (ex) {
    Function.empty = function () {
    };
  }

  global.Class = ({
    __extendMethod__: function (method, ancestor) {
      let bmethod = (function (_method) {
        return function () {
          this.$super = function () {
            return _method.apply(this, arguments);
          };
        };
      })(ancestor);
      let amethod = function () {
        delete this.$super;
      };
      let value = function () {
        bmethod.call(this);
        let retval = method.apply(this, arguments);
        amethod.call(this);
        return retval;
      };
      value.valueOf = value.valueOf.bind(method);
      value.toString = value.toString.bind(method);
      return value;
    },
    __copyMethod__: function (dest, source, ancestor) {
      let properties = Object.keys(source);
      for (let i = 0, length = properties.length; i < length; i++) {
        let property = properties[i], value = source[property];
        if ('static' !== property) {
          if ('$super' === property) throw new Error('$super is not allowed.');
          if (typeof value == "function" && ancestor[property]) {
            value = Class.__extendMethod__(source[property], ancestor[property]);
          }
          dest.prototype[property] = value;
        } else {
          let staticProperties = Object.keys(source['static']);
          let staticValues = source['static'];
          for (let staticidx = 0, staticlen = properties.length; staticidx < staticlen; staticidx++) {
            let staticProperty = staticProperties[staticidx];
            //value = staticValues[staticProperty];
            dest[staticProperty] = staticValues[staticProperty];
          }
        }
      }
      return dest;
    },
    define: function () {
      let parent = Object, args = Array.prototype.slice.call(arguments);
      if (typeof args[0] == "function") parent = args.shift();

      function klass() {
        (this.create).apply(this, arguments);
      }

      let properties = Object.keys(parent.prototype)
      for (let i = 0, length = properties.length; i < length; i++) {
        let property = properties[i], value = parent.prototype[property];
        if (Object.isArray(value) || Object.isHash(value)) {
          klass.prototype[property] = JSON.parse(JSON.stringify(value));
        } else {
          klass.prototype[property] = value;
        }
      }
      for (let i = 0; i < args.length; i++) Class.__copyMethod__(klass, args[i], parent.prototype);
      if (!klass.prototype.create) klass.prototype.create = Function.empty;
      klass.prototype.constructor = klass;
      return klass;
    }
  });

  Object.extend(Object, {
    merge: function (target, source) {
      for (let key of Object.keys(source)) {
        if (source[key] instanceof Object) Object.assign(source[key], Object.merge(target[key], source[key]))
      }
      Object.assign(target || {}, source)
      return target
    },
    isElement: function (object) {
      return object && !!object.nodeName && object.nodeType === 1;
    },
    isArray: function (object) {
      return Object.prototype.toString.call(object) === '[object Array]';
    },
    isDate: function (object, valid) {
      if (valid === true) {
        return Object.prototype.toString.call(object) === '[object Date]' && !isNaN(object.getTime());
      }
      return Object.prototype.toString.call(object) === '[object Date]';
    },
    isHash: function (object) {
      return Object.prototype.toString.call(object) === '[object Object]' && typeof object != "undefined" && !object.nodeName;
    },
    isObject: function (object) {
      return Object.isHash(object);
    },
    isFunction: function (object) {
      return typeof object == "function";
    },
    isString: function (object) {
      return typeof object == "string";
    },
    isNumber: function (object) {
      return typeof object == "number";
    },
    isBoolean: function (object) {
      return Object.prototype.toString.call(object) === '[object Boolean]'
    },
    isUndefined: function (object) {
      return typeof object == "undefined";
    },
    isNotNull: function (object) {
      return ((!Object.isString(object) && (object !== undefined && object !== null))
        || (Object.isString(object) && object !== undefined && object !== null && !''.equals(object.trim())));
    },
    isNull: function (object) {
      return ((object === undefined || object === null) ||
        (Object.isString(object) && ''.equals(object.trim())));
    },
    containsKey: function (object, key) {
      return (key in object);
    },
    clone: function (object, deep) {
      if (object === null || typeof (object) !== 'object')
        return object;

      let copy = object.constructor();

      for (let attr in object) {
        if (object.hasOwnProperty(attr)) {
          if (deep === true) {
            copy[attr] = Object.clone(object[attr], deep);
          } else {
            copy[attr] = object[attr];
          }
        }
      }

      return copy;
    },
    methodize: function (object) {
      return (function (value) {
        return function () {
          return value;
        };
      })(object);
    },
    stringify: function (obj) {
      let cache = [];
      return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'bigint') {
          value.toString()
        }
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return;
          }
          // Store value in our collection
          cache.push(value);
        }
        return value;
      }, 2);
    }
  });

  Object.extend(Array.prototype, {
    invoke: function (method) {
      let args = Array.from(arguments).slice(1);
      return this.map(function (value) {
        return value[method].apply(value, args);
      });
    },
    compact: function () {
      return this.filter(function (value) {
        return value !== undefined && value !== null;
      }).minimize();
    },
    clone: function () {
      return this.slice(0);
    },
    minimize: function () {
      let flat = [];
      for (let i = 0, l = this.length; i < l; i++) {
        if (!flat.includes(this[i])) {
          flat.push(this[i]);
        }
      }
      return flat;
    },
    isEmpty: function () {
      return !this.length;
    },
  });

  if (!Math.log10) {
    Math.log10 = function (x) {
      return Math.log(x) * Math.LOG10E;
    }
  }

  Object.extend(Number, {
    random: function (min, max) {
      return Math.random() * (max - min) + min;
    },
    randomInt: function (min, max) {
      return parseInt(Math.random() * (max - min) + min);
    },
    randomIntInclusive: function (min, max) {
      return parseInt(Math.random() * (max - min + 1) + min);
    }
  })

  Object.extend(Number.prototype, {
    int: function () {
      return parseInt(+(this)) || 0;
    },
    float: function () {
      return parseFloat(this) || 0.0;
    },
    radians: function () {
      return (this) * Math.PI / 180;
    },
    degrees: function () {
      return (this) * 180 / Math.PI;
    },
    seconds: function () {
      return (this) * 1000;
    },
    minutes: function () {
      return (this) * 1000 * 60;
    },
    hours: function () {
      return (this) * 1000 * 60 * 60;
    },
    addSeconds: function (value) {
      return this + (value * 1000);
    },
    addMinutes: function (value) {
      return this + (value * 1000 * 60);
    },
    addHours: function (value) {
      return this + (value * 1000 * 60 * 60);
    },
    add: function (value) {
      return this + (value);
    },
    sub: function (value) {
      return this - (value);
    },
    abs: function () {
      return Math.abs(this);
    },
    ceil: function () {
      return Math.ceil(this);
    },
    floor: function () {
      return Math.floor(this);
    },
    round: function () {
      return Math.round(this);
    },
    pow: function (exponent) {
      return Math.pow(this, exponent);
    },
    sqrt: function () {
      return Math.sqrt(this);
    },
    sin: function () {
      return Math.sin(this);
    },
    cos: function () {
      return Math.cos(this);
    },
    tan: function () {
      return Math.tan(this);
    },
    asin: function () {
      return Math.asin(this);
    },
    acos: function () {
      return Math.acos(this);
    },
    atan: function () {
      return Math.atan(this);
    },
    exp: function () {
      return Math.exp(this);
    },
    log: function () {
      return Math.log(this);
    },
    comma: function () {
      let value = String(this);
      let points = "";
      if (value.indexOf(".") !== -1) {
        points = value.substring(value.indexOf("."));
        value = value.substring(0, value.indexOf("."));
      }
      let re = new RegExp('(-?[0-9]+)([0-9]{3})');
      while (re.test(value)) value = value.replace(re, '$1,$2');
      return value + points;
    },
    paddingDecimal: function (cnt) {
      let value = String(this);
      let points = "";
      if (value.indexOf(".") !== -1) {
        points = value.substring(value.indexOf(".") + 1);
        value = value.substring(0, value.indexOf("."));
      }

      return value + '.' + points.paddingRight('0', cnt);
    },
    padding: function (padding, cnt) {
      if (arguments.length < 2) return this;
      padding = String(padding);
      cnt = parseInt(cnt) || 0;
      if (this.length >= cnt) return this;
      return padding.repeat(cnt - String(this).length) + String(this);
    },
    paddingRight: function (padding, cnt) {
      if (arguments.length < 2) return this;
      padding = String(padding);
      cnt = parseInt(cnt) || 0;
      if (this.length >= cnt) return this;
      return String(this) + padding.repeat(cnt - String(this).length);
    },
    toBinary: function () {
      let value = this;
      let arr = [];
      if (value < 0) {
        throw new TypeError();
      }
      if (value === 0) {
        return "0";
      }
      for (let i = 1; i <= value; i = i * 2) {
        let digit = i & value;
        if (digit) {
          arr.push("1");
        } else {
          arr.push("0");
        }
      }
      return arr.reverse().join("");
    }
  });

  Object.extend(String, {
    guid: function () {
      function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
  });

  Object.extend(String.prototype, {
    bytes: function () {
      let bytes = 0;
      for (let i = 0, len = this.length; i < len; i++) {
        this.charCodeAt(i) > 127 ? bytes = bytes + 2 : bytes++;
      }
      return bytes;
    },
    utf8len: function () {
      return encodeURIComponent(this).replace(/%../g, 'x').length;
    },
    int: function () {
      return parseInt(+(this)) || 0;
    },
    float: function () {
      return parseFloat(this) || 0.0;
    },
    toFixed: function (fractionDigit) {
      try {
        let val = Number(this);
        if (!isNaN(val)) {
          return val.toFixed(fractionDigit);
        }
      } catch (ex) {
      }
      return this;
    },
    contains: function (value) {
      return this.indexOf(value) !== -1;
    },
    upper: function () {
      return this.toUpperCase();
    },
    lower: function () {
      return this.toLowerCase();
    },
    equals: function (value, exact) {
      if (exact !== true) {
        return (this === value);
      } else {
        return (this === value);
      }
    },
    equalsIgnoreCase: function (value) {
      return value && (this.toLowerCase() === ('' + value).toLowerCase());
    },
    trimAll : function () {
    	return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    },
    removeWhiteSpace: function () {
      return this.replace(/[\s\uFEFF\xA0]/g, '');
    },
    //repeat : function(i) {
    //	return new Array(i+1).join(this);
    //},
    ltrim: function () {
      return this.replace(/^[\s\uFEFF\xA0]+/g, '');
    },
    rtrim: function () {
      return this.replace(/[\s\uFEFF\xA0]+$/g, '');
    },
    escapeHtml: function () {
      return this.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    unescapeHtml: function () {
      return this.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    },
    xmlEscapeText: function () {
      return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    innerString: function () {
      return this.replace(/\'/g, '\\\'').replace(/\"/g, '&quot;');
    },
    newlineToBr: function () {
      return this.replace(/\n/g, '<br />');
    },
    camelize: function () {
      let handler = function (all, letter) {
        return letter.toUpperCase();
      };
      return this.replace(/\-(\w)/g, handler);
    },
    dasherize: function () {
      let handler = function (all, letter) {
        return "-" + letter.toLowerCase();
      };
      return this.replace(/([A-Z])/g, handler);
    },
    isEmail: function () {
      return (/^(\S+)?@(\S+\.[a-z]+)?$/.test(this));
    },
    validEmail: function () {
      //return (!/(@.*@)|(\.\.)|(@\.)|(\.@)|(^\.)/.test(this) && /^.+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})(\]?)$/.test(this));
      return /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(this)
    },
    isPhone: function () {
      return (/^(\d\d(\d)?(\d)?)+([-])?(\d\d\d(\d)?)+([-])?(\d\d\d\d)+$/.test(this));
    },
    isURL: function () {
      return /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$/.test(this.trim());
    },
    isAlpha: function () {
      return /^[a-zA-Z]+$/.test(this);
    },
    isAlphaSpecials: function () {
      return /^[a-zA-Z~!@#$%^&*\(\)_\-=\+]+$/.test(this);
    },
    isAlphaDigit: function () {
      return /^[a-zA-Z0-9]+$/.test(this);
    },
    isAlphaDigitSpecials: function () {
      return /^[a-zA-Z0-9~!@#$%^&*\(\)_\-=\+]+$/.test(this);
    },
    isAlphaDigitSpace: function () {
      return /^[a-zA-Z0-9\s]+$/.test(this);
    },
    isAlphaDigitSpaceSpecials: function () {
      return /^[a-zA-Z0-9~!@#$%^&*\(\)_\-=\+\s]+$/.test(this);
    },
    isDigit: function () {
      return /^[0-9]+$/.test(this);
    },
    isDigitSpecials: function () {
      return /^[0-9~!@#$%^&*\(\)_\-=\+]+$/.test(this);
    },
    isLowerCase: function () {
      return /^[a-z0-9]+$/.test(this);
    },
    isLowerSpecialCase: function () {
      return /^[a-z0-9~!@#$%^&*\(\)_\-=\+]+$/.test(this);
    },
    isUpperCase: function () {
      return /^[A-Z0-9]+$/.test(this);
    },
    isUpperSpecialCase: function () {
      return /^[A-Z0-9~!@#$%^&*\(\)_\-=\+]+$/.test(this);
    },
    isNumber: function () {
      if (/^([\-\+]?[0-9]*(\.[0-9]*)?)$/.test(this)) return true;
      if (!isNaN(this)) return true;
      return false;
    },
    isEmpty: function () {
      return "".equals(this.trim());
    },
    comma: function (flag) {
      if (flag === false) {
        return this.replace(/,/g, '');
      } else {
        let value = this.replace(/,/g, '');
        let points = "";
        if (value.indexOf(".") !== -1) {
          points = value.substring(value.indexOf("."));
          value = value.substring(0, value.indexOf("."));
        }
        let re = new RegExp('(-?[0-9]+)([0-9]{3})');
        while (re.test(value)) value = value.replace(re, '$1,$2');
        return value + points;
      }
    },
    toNumber: function () {
      let value = this.trim().replace(/,/g, '');
      return +(value);
    },
    startsWith: function (prefix) {
      if (arguments.length < 1) return false;
      prefix = String(prefix);
      if (this.length < prefix.length) return false;
      return this.substring(0, prefix.length) === prefix;
    },
    endsWith: function (suffix) {
      if (arguments.length < 1) return false;
      suffix = String(suffix);
      if (this.length < suffix.length) return false;
      return this.substring(this.length - suffix.length, this.length) === suffix;
    },
    padding: function (padding, cnt) {
      if (arguments.length < 2) return this;
      padding = String(padding);
      cnt = parseInt(cnt) || 0;
      if (this.length >= cnt) return this;
      return padding.repeat(cnt - this.length) + this;
    },
    paddingRight: function (padding, cnt) {
      if (arguments.length < 2) return this;
      padding = String(padding);
      cnt = parseInt(cnt) || 0;
      if (this.length >= cnt) return this;
      return this + padding.repeat(cnt - this.length);
    },
    isValidMacId: function () {
      return (/^([a-fA-F0-9]{2}(:)){5,6}([a-fA-F0-9]{2})$/.test(this));
    },
    isValidTelNo: function () {
      return (/^(\+)?(\d)+(([\s\-])*(\d)+)+$/.test(this));
    },
    isValidLicenseCode: function () {
      return (/^[a-zA-Z]{3}$/.test(this));
    },
    isValidBinaryValue: function () {
      return (/^[01]{8}$/.test(this));
    },
    binaryToDecimal: function () {
      let value = this;
      let decimal = 1;
      let retValue = 0;
      for (let i = value.length - 1; i >= 0; i--) {
        let digit = +(value.charAt(i));
        if (digit !== 1 && digit !== 0) {
          throw new TypeError();
        }
        retValue += decimal * digit;
        decimal = decimal * 2;
      }
      return retValue;
    },
    isKoreanPostal: function () {
      return (/^(\d\d\d)?([-])?(\d\d\d)?$/.test(this));
    },
    isKoreanMobile: function () {
      return (/^(010|011|016|017|018|019)+([-])?(\d\d\d(\d)?)+([-])?(\d\d\d\d)+$/.test(this));
    },
    isKoreanLandline: function () {
      return (/^(02|031|062|053|042|051|032|052|033|055|054|061|063|064|041|043|070|080|0303)+([-])?(\d\d\d(\d)?)+([-])?(\d\d\d\d)+$/.test(this));
    },
    isKoreanPhone: function () {
      return (/^(02|031|062|053|042|051|032|052|033|055|054|061|063|064|041|043|070|080|0303|010|011|016|017|018|019)+([-])?(\d\d\d(\d)?)+([-])?(\d\d\d\d)+$/.test(this));
    },
    makeKoreanPostal: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      let re = /^(\d\d\d)?([-])?(\d\d\d)?$/;
      value = value.replace(re, function (match, p1, p2, p3, offset, str) {
        return (p1 ? p1 + '-' : '') + p3;
      });
      return value;
    },
    makeKoreanPhoneNo: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      let re = /^(02|031|062|053|042|051|032|052|033|055|054|061|063|064|041|043|070|0303|010|011|016|017|018|019)+([-])?(\d\d\d(\d)?)+([-])?(\d\d\d\d)+$/;
      value = value.replace(re, "$1-$3-$6");
      return value;
    },
    makeRegNo: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      if (value.length === 10) {
        return value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
      } else if (value.length === 13) {
        return value.substring(0, 6) + '-' + value.substring(6);
      }
      return '';
    },
    checkCorpNo: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      if (!value.isDigit() || value.bytes() !== 13) return false;
      let length = value.length;
      let sum = 0;
      let checksum = +(value.substring(12, 13));
      for (let i = 0, len = length - 1; i < len; i++) {
        let check = +(value.charAt(i));
        sum = sum + (check * (((i + 1) % 2) === 1 ? 1 : 2));
      }
      let remains = sum % 10;
      let checksum1 = 10 - remains;
      if (checksum1 === 10) {
        checksum1 = 0;
      }
      if (checksum !== checksum1) {
        return false;
      }
      return true;
    },
    checkCompRegNo: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      if (value.bytes() !== 10) return false;
      if (!value.isNumber()) return false;
      let checksum = 0;
      let checkvalue = "13713713";
      for (let i = 0; i < 8; i++) {
        checksum = checksum + (value.substring(i, i + 1).int() * checkvalue.substring(i, i + 1).int()) % 10;
      }
      let tempcheck = value.substring(8, 9).int() * 5 + "0";
      let checkValue = tempcheck.substring(0, 1).int() + tempcheck.substring(1, 2).int();
      let checkDigit = (10 - (checksum + checkValue) % 10) % 10;
      if (value.substring(9, 10) !== checkDigit) {
        return false;
      }
      return true;
    },
    checkCorporationNo: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      if (value.bytes() !== 13) return false;
      if (!value.isNumber()) return false;
      let sum = 0;
      let checksum = +(value.substring(12, 13));
      for (let i = 0, len = value.length - 1; i < len; i++) {
        let check = +(value.substring(i, i + 1));
        sum = sum + (check * (((i + 1) % 2) === 1 ? 1 : 2));
      }
      let remains = sum % 10;
      let checksum1 = 10 - remains;
      if (checksum1 === 10) {
        checksum1 = 0;
      }
      if (checksum !== checksum1) {
        return false;
      }
      return true;
    },
    checkResidentNo: function () {
      let value = this.trim();
      value = value.replace(/-/g, '');
      if (value.bytes() !== 13) return false;
      if (!value.isNumber()) return false;
      let genderCheck = value.charAt(6);
      if (!"1".equals(genderCheck) && !"2".equals(genderCheck) && !"3".equals(genderCheck) && !"4".equals(genderCheck)) return false;
      let year = value.substring(0, 2);
      let month = value.substring(2, 4);
      let day = value.substring(4, 6);
      let sex = value.substring(6, 7);
      if (sex === "1" || sex === "2") {
        year = "19" + year;
      } else if (sex === "3" || sex === "4") {
        year = "20" + year;
      }
      if (+(month) < 1 || +(month) > 12) return false;
      let end = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (((+(year) % 4) === 0 && (+(year) % 100) !== 0) || (+(year) % 400) === 0) {
        end[1] = 29;
      }
      if (+(day) < 1 || +(day) > end[+(month) - 1]) return false;
      let check = 0;
      let frontNo = value.substring(0, 6);
      let rearNo = value.substring(6, 13);
      for (let i = 0; i <= 5; i++) {
        check = check + ((i % 8 + 2) * frontNo.substring(i, i + 1).int());
      }
      for (let i = 6; i <= 11; i++) {
        check = check + ((i % 8 + 2) * rearNo.substring(i - 6, i - 5).int());
      }
      if (((11 - (check % 11)) % 10) === value.substring(12, 13).int()) {
        return true;
      }
      return false;
    }
  });

  Object.extend(Function.prototype, {
    debounce: function () { // timeout
      let timeoutID, func_obj = this, args = Array.from(arguments), timeout_value = args.shift();
      if (timeout_value < 1)
        timeout_value = 1;
      let debounceCallback = function () {
        if (timeoutID != null) {
          window.clearTimeout(timeoutID);
          timeoutID = null;
        }
        let $args = args.concat(Array.from(arguments));
        timeoutID = window.setTimeout(function () {
          func_obj.apply(func_obj, $args);
          window.clearTimeout(timeoutID);
          timeoutID = null;
        }, timeout_value);
      }
      debounceCallback.valueOf = debounceCallback.valueOf.bind(func_obj);
      debounceCallback.toString = debounceCallback.toString.bind(func_obj);
      return debounceCallback;
    },
    once: function () { // timeout
      let func_obj = this, args = Array.from(arguments), executed = false, ret;
      let onceCallback = function () {
        if (executed)
          return ret;
        let $args = args.concat(Array.from(arguments));
        executed = true;
        ret = func_obj.apply(func_obj, $args);
        func_obj = null;
        return ret;
      }
      onceCallback.valueOf = onceCallback.valueOf.bind(func_obj);
      onceCallback.toString = onceCallback.toString.bind(func_obj);
      return onceCallback;
    },
    timeout: function () { // timeout, callback
      let timeoutValue, timeoutID, callback, func_obj = this, args = Array.from(arguments), timeout_value = args.shift();
      if (timeout_value < 1) {
        //timeout_value = 1;
        return func_obj.apply(func_obj, args);
      }
      if (args.length >= 1 && typeof args[0] == "function")
        callback = args.shift();
      callback = callback || Function.empty;
      timeoutID = window.setTimeout(function () {
        let retVal = func_obj.apply(func_obj, args);
        window.clearTimeout(timeoutID);
        callback();
        timeoutID = null;
        return retVal;
      }, timeout_value);
      timeoutValue = Object.methodize(timeoutID);
      timeoutValue.stop = (function (handle) {
        try {
          window.clearTimeout(handle());
        } catch (ex) {
        }
      }).bind(func_obj, timeoutValue);
      return timeoutValue;
    },
    interval: function () { // interval, callback
      let intervalValue, intervalID, callback, func_obj = this, args = Array.from(arguments), interval_value = args.shift();
      if (args.length >= 1 && typeof args[0] == "function")
        callback = args.shift();
      callback = callback || Function.empty;
      if (interval_value < 0)
        interval_value = 0;
      if (interval_value === 0)
        return func_obj.apply(func_obj, args);
      intervalID = window.setInterval(function () {
        let retVal = func_obj.apply(func_obj, args);
        if (retVal === false) {
          window.clearInterval(intervalID);
          callback();
          intervalID = null;
        }
        return retVal;
      }, interval_value);
      intervalValue = Object.methodize(intervalID);
      intervalValue.stop = (function (handle) {
        try {
          window.clearInterval(handle());
        } catch (ex) {
        }
      }).bind(func_obj, intervalValue);
      intervalValue.exec = (function (_args) {
        try {
          this.apply(this, _args);
        } catch (ex) {
        }
      }).bind(func_obj, args);
      return intervalValue;
    },
    wrap: function (wrapper) {
      let method = this;
      let bmethod = (function (_method) {
        return function () {
          this.$$$parentMethodStore$$$ = this.$proceed;
          this.$proceed = function () {
            return _method.apply(this, arguments);
          };
        };
      })(method);
      let amethod = function () {
        this.$proceed = this.$$$parentMethodStore$$$;
        if (this.$proceed === undefined)
          delete this.$proceed;
        delete this.$$$parentMethodStore$$$;
      };
      let value = function () {
        bmethod.call(this);
        let retval = wrapper.apply(this, arguments);
        amethod.call(this);
        return retval;
      };
      value.valueOf = value.valueOf.bind(wrapper);
      value.toString = value.toString.bind(wrapper);
      return value;
    },
    before: function () { // wrapper
      let method = this, args = Array.from(arguments), wrapper = args.shift();
      let value = function () {
        wrapper.apply(this, args.concat(Array.from(arguments)));
        return method.apply(this, args.concat(Array.from(arguments)));
      };
      value.valueOf = value.valueOf.bind(method);
      value.toString = value.toString.bind(method);
      return value;
    },
    after: function () { // wrapper
      let method = this, args = Array.from(arguments), wrapper = args.shift();
      let value = function () {
        let retval = method.apply(this, args.concat(Array.from(arguments)));
        wrapper.apply(this, args.concat(Array.from(arguments)));
        return retval;
      };
      value.valueOf = value.valueOf.bind(method);
      value.toString = value.toString.bind(method);
      return value;
    },
    around: function () { // before_wrapper, after_wrapper
      let method = this, args = Array.from(arguments), before_wrapper = args.shift(), after_wrapper = args.shift();
      let value = function () {
        before_wrapper.apply(this, args.concat(Array.from(arguments)));
        let retval = method.apply(this, args.concat(Array.from(arguments)));
        after_wrapper.apply(this, args.concat(Array.from(arguments)));
        return retval;
      };
      value.valueOf = value.valueOf.bind(method);
      value.toString = value.toString.bind(method);
      return value;
    }
  });
})(jQuery, typeof window !== "undefined" ? window : this);
