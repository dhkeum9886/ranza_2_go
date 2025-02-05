import $ from 'jquery-patch'
import './loading-svg.scss'

//https://codepen.io/yoksel/pen/fjcvA
export default class SvgLoading {
  #xhr = null;
  constructor(option = {}) {
    this.options = Object.assign({
      version: 1,
      text: 'Loading...',
      opacity: 0.01,
      cancel: false,
      cancelColor: null,
      seconds: 10,
      mask: '#000',
      color: '#fff',
      progressColor: '#fff',
      zIndex: 1000,
      onCancel: Function.empty
    }, option)

    this.options.seconds = this.options.seconds * 1000
    if (this.options.opacity < 0.01) {
      this.options.opacity = 0.01
    }
    if (this.options.version < 1 || this.options.version > 5) {
      this.options.version = 1
    }

    let ie = SvgLoading.detectIE()

    if (!this.$loading) {
      if (ie || this.options.version === 5) {
        this.$loading = $(SvgLoading.___content___ie()).appendTo(document.body)
      } else {
        this.$loading = $(SvgLoading.___content___(this.options.version)).appendTo(document.body)
      }
    }
    this.$loading.find('mask').css({
      backgroundColor: this.options.mask,
      opacity: this.options.opacity,
    })
    this.$loading.css({
      zIndex: this.options.zIndex,
    })
    this.$text = this.$loading.find('span.loading')
    this.$text.html(this.options.text)
    this.$text.css({
      color: this.options.color,
    })
    this.$progress = this.$loading.find('.progress')
    this.$progressbar = this.$progress.find('.bar')
    this.$progress_text = this.$loading.find('.text')
    if (this.options.cancel === true) {
      this.$cancel = this.$loading.find('.cancel')
      if (this.options.cancelColor) {
        this.$cancel.css({
          color: this.options.cancelColor
        })
      }
      this.$cancel.show();
      this.$cancel.click(() => {
        this.options.onCancel();
      })
    }
  }

  start() {
    this.timer = (function() {
      this.stop()
    }).bind(this).timeout(this.options.seconds)
    this.$loading.css({
      visibility: 'visible',
    })
    return this
  }

  stop(destroyed = false) {
    try {
      if (this.timer) {
        this.timer.stop()
      }
      this.timer = null
      if (this.$loading) {
        this.$loading.css({
          visibility: 'hidden',
        })
      }
      if (this.$progress) {
        this.$progress.hide()
        this.$progressbar.css({
          width: null
        })
        this.$progressbar.html('');
      }
      if (destroyed) {
        this.destroy()
      }
    } catch (ex) {
    }
  }

  destroy() {
    try {
      if (this.options) {
        this.options = null
      }
      if (this.$text) {
        this.$text = null
      }
      if (this.$progress) {
        this.$progress = null
        this.$progressbar = null
      }
      if (this.$loading) {
        this.$loading.remove()
      }
      this.$loading = null
    } catch (ex) {
    }
  }

  set text(value) {
    try {
      if (this.$text && value) {
        this.$text.html(value)
      }
    } catch (ex) {
    }
  }

  progress(loaded = 0, total = 0, showProgressText = true) {
    let progressRate = parseInt((loaded / total) * 100);
    try {
      if (this.$progress && total) {
        this.$progress.show();
        this.$progressbar.css({
          width: progressRate + '%'
        })
        this.$progressbar.html(progressRate + '%');

        if (showProgressText === true) {
          this.$progress_text.show()
          this.$progress_text.css({
            color: this.options.progressColor,
          })
          this.$progress_text.html(`${SvgLoading.storage(loaded)} of ${SvgLoading.storage(total)}`)
        }
      } else {
        this.$progress.hide()
        this.$progressbar.css({
          width: null
        })
        this.$progressbar.html('');
        this.$progress_text.hide()
      }
    } catch (ex) {
    }
  }

  rate(rate = 0, showProgressText = true) {
    let progressRate = parseFloat(rate);
    try {
      if (this.$progress) {
        this.$progress.show();
        this.$progressbar.css({
          width: progressRate.toFixed(2) + '%'
        })
        this.$progressbar.html(progressRate.toFixed(2) + '%');

        if (showProgressText === true) {
          this.$progress_text.show()
          this.$progress_text.css({
            color: this.options.progressColor,
          })
          this.$progress_text.html(`${progressRate.toFixed(2)} %`)
        }
      }
    } catch (ex) {
    }
  }

  set xhr(jqXHR) {
    this.#xhr = jqXHR
  }

  abort(destroyed = true) {
    try {
      if (this.#xhr) {
        this.#xhr.abort();
      }
    } catch (ex) {
    } finally {
      this.stop(destroyed);
    }
  }

  static show(option) {
    let loading = new SvgLoading(option)
    loading.start()
    return loading
  }

  static storage(value) {
    if ((value / 1024 / 1024 / 1024 / 1024) > 1024) {
      return (value / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' PB';
    } else if ((value / 1024 / 1024 / 1024) > 1024) {
      return (value / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB';
    } else if ((value / 1024 / 1024) > 1024) {
      return (value / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    } else if ((value / 1024) > 1024) {
      return (value / 1024 / 1024).toFixed(2) + ' MB';
    } else {
      return (value / 1024).toFixed(2) + ' KB';
    }
    return value + ' B';
  }

  static ___content___(version = 1) {
    const svg = `<div class='sloading'>
<mask></mask>
<div class="cancel"><i class="fa-solid fa-power-off"></i></div>
<div class='svg-wrapper'>
<svg viewBox='0 0 120 120' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' loading>
	<symbol id='s--circle'>
		<circle r='10' cx='20' cy='20'></circle>
	</symbol>
	<g class='g-circles g-circles--v${version}'>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
		<g class='g--circle'>
			<use xlink:href='#s--circle' class='u--circle'></use>
		</g>
	</g>
</svg>
<span class='loading' data-name='Loading'>Loading</span>
<div class="progress tiny">
    <div class="bar striped-red active"></div>
</div>
<div class='text' data-name='progress'></div>
</div>
</div>`
    return svg
  }

  static ___content___ie() {
    const html = `<div class='cloading'>
  <mask></mask>
  <div class="cancel"><i class="fa-solid fa-power-off"></i></div>
  <div class='spin-wrapper'>
    <div class='spin-frame'>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
      <div class='disc'></div>
    </div>
    <span class='loading'>Loading</span>
    <div class="progress tiny">
        <div class="bar striped-red active"></div>
    </div>
    <div class='text' data-name='progress'></div>
  </div>
</div>`
    return html
  }

  static detectIE() {
    var ua = window.navigator.userAgent

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    let msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    }

    let trident = ua.indexOf('Trident/')
    if (trident > 0) {
      // IE 11 => return version number
      let rv = ua.indexOf('rv:')
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    }

    /*var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }*/

    // other browser
    return false
  }
}

//https://codepen.io/stix/pen/yeGKrp
