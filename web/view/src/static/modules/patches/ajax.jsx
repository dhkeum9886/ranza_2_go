import jQuery from 'jquery'

(function ($, global) {

  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if (!options.error) {
      options.error = function () {
      }
    }

    if (!options.beforeSend) {
      options.beforeSend = function () {
      }
    }

    options.beforeSend = options.beforeSend.before(function (jqXHRBeforeSend, settings) {
      let name = $('meta[name="_csrf_parameter"]').attr('content');
      let header = $('meta[name="_csrf_header"]').attr('content');
      let value = $('meta[name="' + name + '"]').attr('content');

      if (header && value) {
        jqXHRBeforeSend.setRequestHeader(header, value);
      }
    })

    options.error = options.error.before(function (jqXHRError, textStatus, errorThrown) {
      if (jqXHRError.status == 301 || jqXHRError.status == 302) { // redirect
        $.move(jqXHRError.getResponseHeader('Location'));
      } else if (jqXHRError.status == 400) {
        alert('Bad Request.');
      } else if (jqXHRError.status == 401 || jqXHR.status == 403) {
        $.move(`${ctx.path}/`);
      } else if (jqXHRError.status == 404) {
        alert('Page Not Found.');
      } else if (jqXHRError.status == 405) {
        alert('Method Not Allowed.');
      } else if (jqXHRError.status == 406) {
        alert('Not Acceptable.');
      } else if (jqXHRError.status == 500) {
        alert('Error.');
      }
    })
  })

  return jQuery;
})(jQuery, typeof window !== "undefined" ? window : this);
