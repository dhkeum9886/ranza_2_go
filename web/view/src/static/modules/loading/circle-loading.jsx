import $ from 'jquery-patch'
import './circle-loading.scss'

export default class CircleLoading {
  constructor(option = {}) {
    this.options = Object.assign({
      opacity: 0.01,
      seconds: 10,
      mask: '#000',
      zIndex: 1000,
    }, option)

    this.options.seconds = this.options.seconds * 1000
    if (this.options.opacity < 0.01) {
      this.options.opacity = 0.01
    }
    if (!this.$loading) {
      this.$loading = $(CircleLoading.___content___()).appendTo(document.body)
    }
    this.$loading.find('mask').css({
      backgroundColor: this.options.mask,
      opacity: this.options.opacity,
    })
    this.$loading.css({
      zIndex: this.options.zIndex,
    })
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
      if (this.$loading) {
        this.$loading.remove()
      }
      this.$loading = null
    } catch (ex) {
    }
  }

  static show(option) {
    let loading = new CircleLoading(option)
    loading.start()
    return loading
  }

  static ___content___() {
    const content = `<div class='panel-loading-wrapper'>
    <mask></mask>
    <div class='panel-loading'></div>
</div>`
    return content
  }
}
