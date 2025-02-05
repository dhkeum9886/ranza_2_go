import $ from 'jquery-patch'
import './loading.scss'

//https://codepen.io/nikhil8krishnan/pen/dMEzGx
export default class Loading {
  #xhr = null;
  constructor(option = {}) {
    this.options = Object.assign({
      text: 'Loading...',
      opacity: 0.01,
      circle: false,
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
    if (!this.$loading) {
      if (this.options.circle !== true) {
        this.$loading = $(Loading.___content___()).appendTo(document.body)
      } else {
        this.$loading = $(Loading.___circle___()).appendTo(document.body)
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

  stop(destroyed = true) {
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
      if (this.$progress_text) {
        this.$progress_text.hide()
        this.$progress_text.html('');
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
          width: progressRate + '%',
        })
        this.$progressbar.html(progressRate + '%');

        if (showProgressText === true) {
          this.$progress_text.show()
          this.$progress_text.css({
            color: this.options.progressColor,
          })
          this.$progress_text.html(`${Loading.storage(loaded)} of ${Loading.storage(total)}`)
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
          width: progressRate.toFixed(2) + '%',
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
    let loading = new Loading(option)
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

  static ___content___() {
    const content = `<div class='ploading'>
    <mask></mask>
    <div class="cancel"><i class="fa-solid fa-power-off"></i></div>
    <div class='cube-wrapper'>
        <div class='cube-folding'>
            <span class='leaf1'></span>
            <span class='leaf2'></span>
            <span class='leaf3'></span>
            <span class='leaf4'></span>
        </div>
        <span class='loading' data-name='Loading'>Loading</span>
        <div class="progress tiny">
            <div class="bar striped-red active"></div>
        </div>
        <div class='text' data-name='progress'></div>
    </div>
</div>`
    return content
  }

  static ___circle___() {
    const content = `<div class='ploading'>
    <mask></mask>
    <div class="cancel"><i class="fa-solid fa-power-off"></i></div>
    <div class='cube-wrapper'>
        <div class='circle-loading'></div>
        <span class='loading' data-name='Loading'>Loading</span>
        <div class="progress tiny">
            <div class="bar striped-red active"></div>
        </div>
        <div class='text' data-name='progress'></div>
    </div>
</div>`
    return content
  }
}

//https://codepen.io/stix/pen/yeGKrp
