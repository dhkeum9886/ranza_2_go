import jQuery from 'jquery'
import './jquery-ui';
import './widget-loader.scss'

(function ($, global) {

  $.widget('widget.loading', {
    options: {
      text: 'Loading...',
      opacity: 0.5,
      seconds: 10,
      mask: '#000',
      css: '',
      interval: 100,
      reusable: false,
      zIndex: 100,
      onShow: Function.empty,
      onHide: Function.empty
    },
    _create: function () {
      let self = this;

      self.options.seconds = self.options.seconds * 1000;
      //console.log(self.options)
      if ('cube'.equals(self.options.css)) {
        self.loading = $('<div class="mloading"><mask></mask><div class="cube-wrapper"><div class="cube-folding"><span class="leaf1"></span><span class="leaf2"></span><span class="leaf3"></span><span class="leaf4"></span></div><span class="loading-text" data-name="Loading">Loading</span></div></div>');
        self.loading_wrapper = self.loading.find('.cube-wrapper');
      } else {
        self.loading = $('<div class="mloading"><mask></mask><div class="loading-wrapper"><div class="loading black"></div><span class="loading-text">Loading</span></div></div>');
        self.loading_wrapper = self.loading.find('.loading-wrapper');
      }

      self.loading.css({
        zIndex: self.options.zIndex
      });

      self.loading_wrapper.addClass(this.options['css'])
      self.loading_mask = self.loading.find('mask');
      self.loading_mask.css({
        opacity: this.options['opacity'],
        backgroundColor: this.options['mask']
      });
      self.loading_text = self.loading.find('.loading-text');
      self.loading_text.html(this.options['text']);
      self.loading.appendTo(document.body);
    },
    start: function () {
      this.__show();
    },
    __show: function () {
      if (this.interval) {
        this.stop();
      }
      let self = this;
      let maxTimeShow = (new Date()).getTime() + self.options.seconds;
      let interval = this.options.interval;
      let draw = $.proxy(function () {
        let pos = this.element.offset();
        let size = this.element.viewSize();
        /* fix */
        size = ({
          width: this.element.offsetWidth(),
          height: this.element.offsetHeight()
        });
        if (this.element[0] === document) {
          try {
            size.width = Math.max(window.innerWidth, document.body.clientWidth);
          } catch (ex) {
            size.width = Math.max($(document).width(), $(window).width());
          }
          try {
            size.height = Math.max(window.innerHeight, document.body.clientHeight);
          } catch (ex) {
            size.height = Math.max($(document).height(), $(window).height());
          }
        }
        let zIndex = this.element.zIndex();
        let visible = this.element.is(':visible');
        if (this.element[0] === document) {
          visible = true;
        }
        if ((new Date()).getTime() >= maxTimeShow) {
          self.stop();
          return false;
        }
        if (zIndex < self.options.zIndex) {
          zIndex = self.options.zIndex;
        }

        self.loading.css({
          left: pos.left + 'px',
          top: pos.top + 'px',
          width: size.width + 'px',
          height: size.height + 'px',
          zIndex: zIndex
        });
        if (visible) {
          self.loading.css({
            visibility: 'visible'
          });
        } else {
          self.loading.css({
            visibility: 'hidden'
          });
        }
      }, this);
      this.interval = draw.interval(interval);
      this.options.onShow();
    },
    text: function (value) {
      this.options['text'] = value;
      if (this.loading_text) {
        this.loading_text.html(this.options['text']);
      }
    },
    stop: function () {
      try {
        if (this.interval) {
          this.interval.stop();
        }
        this.interval = null;
        if (this.options.reusable === true) {
          if (this.loading) {
            this.loading.css({
              visibility: 'hidden'
            });
          }
        } else {
          this.destroy();
        }
      } catch (ex) {
      } finally {
        this.options.onHide();
      }
    },
    destroy: function () {
      if (this.loading) {
        this.loading.remove();
      }
      $.Widget.prototype.destroy.call(this);
    }
  });

})(jQuery, typeof window !== "undefined" ? window : this);
