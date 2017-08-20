(function (global, factory) {
  'use strict';
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 utils.js 文件');
  }

  global._define('utils', ['require'], factory);

})(window, function (require) {

  var _slice = Array.prototype.slice;

  function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  function isFunction(fn) {
    return Object.prototype.toString.call(fn)=== '[object Function]';
  }

  function isNull (o) {
    return o === null;
  }

  function isUndefined (o) {
    return typeof o === 'undefined';
  }

  function slice (arrayLike) {
    var args = _slice.call(arguments, 1);
    return _slice.apply(arrayLike, args);
  }

  /**
   * 对象扩展属性
   * @param {object} 对象
   */
  function extend (o /*, arguments */) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, len = args.length; i < len; i++) {
      if (isNull(args[i])) {
        continue;
      } 
      var _o = args[i];
      for (var key in _o) {
        if (!_o.hasOwnProperty(key) || isNull(_o[key])) {
          continue;
        }
        if (typeof _o[key] === 'object') {
          if (isArray(_o[key])) {
            o[key] = (o[key] || []).concat(_o[key]);
          } else {
            o[key] = extend({}, o[key], _o[key]);
          }
        } else {
          o[key] = _o[key];
        }
      }
    }
    return o;
  }

  function bind (fn, context) {
    if (!isFunction(fn)) {
      throw new Error('[utils] bind 错误, 请检查 fn 是否为函数');
    }
    var args = slice(arguments, 2);
    return function () {
      var _args = slice(arguments, 0).concat(args);
      return fn.apply(context, _args);
    }
  }

  var events = {
    sub: function (context, name, fn) {
      context._events = context._events || {};
      if (!isFunction(fn)) {
        return false;
      }
      var events = context._events;
      if (isFunction(events[name])) {
        events[name] = [events[name], fn];
      } else if (isArray(events[name])) {
        events[name].push(fn);
      } else {
        events[name] = fn;
      }
      return true;
    },
    pub: function (context, name) {
      var events = context._events || {};
      var args = slice(arguments, 2);
      if (isFunction(events[name])) {
        events[name].apply(context, args);
      } else if (isArray(events[name])) {
        for (var i = 0, len = events[name].length; i < len; i++) {
          if (isFunction(events[name][i])) {
            events[name][i].apply(context, args);
          }
        }
      }
    }
  };

  return {
    isNull: isNull,
    isUndefined: isUndefined,
    isArray: isArray,
    isFunction: isFunction,
    extend: extend,
    bind: bind,
    events: events
  };

});
