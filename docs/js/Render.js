(function (global, factory) {
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 require.js 文件');
  }

  global._define('Render', ['require'], factory);

})(window, function (require) {
  'use strict';

  var types = {};
  var extend = require('utils.extend');
  var events = require('utils.events');

  // 简单字符串替换
  function compile (str, data) {
    var reg = /{{([$_\w]+)}}/g;
    var result;
    var newStr = str;
    while ((result = reg.exec(str)) !== null) {
      var key = result[1]
      if (data[key]) {
        newStr = newStr.replace(result[0], data[key]);
      }
    }
    return newStr;
  }

  function disableElm (el, className) {
    if ('button' === el.nodeName.toLowerCase()) {
      el.setAttribute('disabled', true);
    }
    el.classList.add(className);
  }

  function enableElm (el, className) {
    if ('button' === el.nodeName.toLowerCase()) {
      el.removeAttribute('disabled');
    }
    el.classList.remove(className);
  }
  
  function Render (options) {
    this.$options = extend({}, Render.defaults, options);
  }
  
  Render.defaults = {
    type: 'canvas', /** type canvas, dom */
    console_template: '黑方玩家: {{black_chess_name}}<br>白方玩家: {{white_chess_name}}<br>当前执棋: {{current_chess_name}}',
    template: '<div class="jsgobang-container">\
      <div class="jsgobang-buttons">\
        <button name="withdraw">悔棋</button>&nbsp;&nbsp;<button name="cancel_withdraw">取消悔棋</button>\
      </div>\
      <div class="jsgobang-console"></div>\
    </div>',
    disabled_class: 'disabled'
  }
  
  Render.prototype.init = function (context) {
    if (this._init) {
      return;
    }

    Render.trigger(this.$options.type, 'init', context, this.$options);
    Render.trigger(this.$options.type, 'drawChessBoard', context);
    this.$container = this.initContainer(context);
    events.sub(this, 'update_container', this.updateContainer);
    events.sub(this, 'cancel_chess', function () {
      context.cancelChess();
    });
    events.sub(this, 'cancel_withdraw', function () {
      context.cancelWithdraw();
    });
    this._init = true;
  }

  Render.register = function (name, object) {
    var arr = ['drawChessBoard', 'drawChess'];
    for (var i = 0, len = arr.length; i < len; i++) {
      var fnName = arr[i];
      if (object && typeof object[fnName] === 'function') {
        continue;
      }
      throw Error('[Render] register type 失败, 对象要求存在' +  fnName, '方法声明');
    }
    types[name] = object;
  }

  Render.trigger = function (type, method) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (types[type]) {
      types[type][method].apply(types[type], args);
    }
  }

  // 初始化 container
  Render.prototype.initContainer = function (context) {
    if (context.$container && context.$container instanceof HTMLElement) {
      return context.$container;
    }
    var _self = this;
    var container = document.createElement('div');
    container.className = 'jsgongban-container';
    container.innerHTML = this.$options.template || '';

    // init button to disable
    (container.querySelectorAll('[name=withdraw],[name=cancel_withdraw]') || []).forEach(function (btn) {
      disableElm(btn, 'disabled');
    });

    // add event listener
    container.addEventListener('click', function (e) {
      var target = e.target;
      var withdrawBtn = container.querySelector('[name=withdraw]');
      var cancelWithdrawBtn = container.querySelector('[name=cancel_withdraw]');
      if (target === withdrawBtn) {
        events.pub(_self, 'cancel_chess');
      } else if (target === cancelWithdrawBtn) {
        events.pub(_self, 'cancel_withdraw');
      }
    });
    context.$el.appendChild(container);
    return container;
  }

  Render.prototype.updateConsole = function (context) {
    var consoleTemplate = this.$options.console_template;
    if(!this.$console) {
      this.$console = this.$container.querySelector('.jsgobang-console');
    }
    this.$console.innerHTML = compile(consoleTemplate, {
      black_chess_name: context.$blackPlayer.getName(),
      white_chess_name: context.$whitePlayer.getName(),
      current_chess_name: context.$currentPlayer.getName()
    });
  }

  Render.prototype.updateButton = function (context) {
    var container = this.$container;
    var withdrawBtn = container.querySelector('[name=withdraw]');
    var cancelWithdrawBtn = container.querySelector('[name=cancel_withdraw]');
    
    if (context.isGameOver()) {
      disableElm(cancelWithdrawBtn, this.$options.disabled_class);
      disableElm(withdrawBtn, this.$options.disabled_class);
      return;
    }
    if (context.$enemyPlayer.canWithdraw()) {
      enableElm(withdrawBtn, this.$options.disabled_class);
    } else {
      disableElm(withdrawBtn, this.$options.disabled_class);
    }
    // 如果当前执棋玩家已经悔棋了
    if (context.$currentPlayer.hasWithdrawed()) {
      enableElm(cancelWithdrawBtn, this.$options.disabled_class);
    } else {
      disableElm(cancelWithdrawBtn, this.$options.disabled_class);
    }
  }

  Render.prototype.updateContainer = function (context) {
    this.updateButton(context);
    this.updateConsole(context);
  }

  Render.prototype.drawChess = function (context, x, y) {
    Render.trigger(this.$options.type, 'drawChess', context, x, y);
  };
  
  Render.prototype.withdrawChess = function (context, x, y) {
    Render.trigger(this.$options.type, 'withdrawChess', context, x, y);
  }
  return Render;
})

