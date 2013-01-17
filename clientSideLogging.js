/*
 *  Title: jQuery Client Side Logging Plugin
 *  Author: Rémy Bach
 *  Version: 1.1.2
 *  License: http://remybach.mit-license.org
 *  Url: http://github.com/remybach/jQuery.clientSideLogging
 *  Description:
 *  This plugin allows you to store front end log/info/error messages on the server (note: you will need to have something set up on your server to handle the actual logging).
 *  The idea was born after reading the following article: http://openmymind.net/2012/4/4/You-Really-Should-Log-Client-Side-Error/
 */
 
 
(function($) {

  var defaults = {
    error_url: '/log/?type=error', // The url to which errors logs are sent
    query_var: 'msg', // The variable to send the log message through as.
    client_info: { 
      location: true, // The url to the page on which the error occurred.
      screen_size: true, // The size of the user's screen (different to the window size because the window might not be maximized)
      user_agent: true, // The user agent string.
      window_size: true // The window size.
    }
  }

  // Polyfill older browsers
  if (!window.console) {
    console = {};
  }

  var JSON;
  if (!JSON) {
    JSON = {};
  }
  JSON.stringify = JSON.stringify ||
  function(obj) {
    var t = typeof(obj);
    if (t != "object" || obj === null) {
      // simple data type
      if (t == "string") obj = '"' + obj + '"';
      return String(obj);
    } else {
      // recurse array or object
      var n, v, json = [],
          arr = (obj && obj.constructor == Array);
      for (n in obj) {
        v = obj[n];
        t = typeof(v);
        if (t == "string") v = '"' + v + '"';
        else if (t == "object" && v !== null) v = JSON.stringify(v);
        json.push((arr ? "" : '"' + n + '":') + String(v));
      }
      return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
  };

  _merge = function(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }

  _buildClientInfo = function() {
    var _info = {};

    if (defaults.client_info.user_agent) {
      _info.user_agent = navigator.userAgent;
    }
    if (defaults.client_info.window_size) {
      _info.window_size = $(window).width() + ' x ' + $(window).height();
    }
    if (defaults.client_info.screen_size) {
      _info.screen_size = window.screen.availWidth + ' x ' + window.screen.availHeight;
    }
    if (defaults.client_info.location) {
      _info.location = window.location.href;
    }
    return _info;
  };

  // Send the log information to the server.
  _send = function(url, what) {
    url += url.match(/\?.+$/) ? '&' : '?';

    if (typeof what === 'object') {
      // Let's grab the additional logging info before we send this off.
      
      _merge(what, _buildClientInfo());

      _data = {};
      _data[defaults.query_var] = JSON.stringify(what);

      $.ajax({
        type: 'POST',
        url: url + 'format=json',
        data: _data
      });
    } else {
      $.post(url + 'format=text&' + defaults.query_var + '=' + what);
    }
  };

  // Log errors whenever there's a generic js error on the page.
  window.onerror = function(message, file, line) {
    _send(defaults.error_url, {
      message: message,
      file: file,
      line: line
    });
  };

})(jQuery);
