/**
 * 自行实现同步define, require模块管理
 */
(function (global) {
  'use strict';
  
  /**
   * 持久化模块
   */
  var modules = {};

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
          o[key] = extend({}, o[key], _o[key]);
        } else {
          o[key] = _o[key];
        }
      }
    }
    return o;
  }

  // 检查模块name
  function checkModuleName(name) {
    switch (name) {
      case undefined:
      case null:
      case '':
      default: switch(typeof name) {
        case 'number': throw Error('[define] checkModuleName() 定义模块失败, "' + name + '" 格式不合法');
      }
    }
  }

  function installed (o) {
    if (isFunction(o) && !o._installed) {
      Object.defineProperty(o, '_installed', {
        value: true,
        enumerable: false,
        writable: false
      });
    }
    return o;
  }

  function install (module) {
    var result = module;
    if (isFunction(module) && module['_installed'] !== true) {
      result = module();
      // 如果模块返回的是一个函数, 声明该函数已被定义
      if (isFunction(result)) {
        installed(result);
      }
    }
    return result;
  }
  function getModule(modules, name) {

    // 优先考虑直接定义的模块
    if (!isUndefined(modules[name])) {
      modules[name] = install(modules[name]);
      return modules[name];
    }

    // 如果不包含. 则不属于点标识符
    if (!~name.indexOf('.')) {
      return;
    }
    // 去除首尾多余的. 
    name = name.replace(/^\.|\.$/, '');
    var names = name.split('.');
    var key = names[0];
    if (modules[key]) {
      modules[key] = install(modules[key]);
    }
    var i = 1;
    var tmp = modules[key];
    for (var i = 1, len = names.length; i < len; i++) {
      key = names[i];
      if (!tmp[key]) {
        break;
      }
      tmp = tmp[key];
    }
    return i === len ? tmp : undefined;
  }

  function define(name) {

    checkModuleName(name);

    // 如果已存在定义的模块， 不可重复定义
    if (typeof modules[name] !== 'undefined') {
      throw Error('[define] 模块 name' + name + '已存在， 不可重复定义');
    }

    var args = Array.prototype.slice.call(arguments, 1);

    // 获取最尾部的参数
    var fn = args.splice(args.length - 1, 1)[0];

    // 获取依赖模块数组
    var dependModules = [];
    if (args[0]) {
      dependModules = isArray(args[0]) ? args[0] : [args[0]];
    }
    if (isFunction(fn)) {
      modules[name] = function () {
        var depends = dependModules.map(function (moduleName) {
          return require(moduleName);
        });
        return fn.apply(undefined, depends);
      };
    } else {
      // 非函数直接赋值
      modules[name] = fn;
    }
  };

  function require(name) {
    checkModuleName(name);
    var args = isArray(name) ? name : [name];
    var fn = Array.prototype.slice.call(arguments, -1)[0];
    args = args.map(function (n) {
      return getModule(modules, n);
    });
    if (isFunction(fn)) {
      fn.apply(undefined, args);
    }
    return !isArray(name) ? args[0] : args;
  }

  modules['require'] = installed(require);
  modules['define'] = installed(define);

  global._define = define;
  global._require = require;
  global._modules = modules;
})(window);
