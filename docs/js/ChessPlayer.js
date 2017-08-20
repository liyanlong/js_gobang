(function (global, factory) {
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 require.js 文件');
  }

  // 定义棋盘对象
  global._define('ChessPlayer', ['require'], factory);

})(window, function (require) {
  'use strict';

  var extend = require('utils.extend');
  var isArray = require('utils.isArray');

  function ChessPlayer (target, options) {

    // 玩家自身赢法统计
    Object.defineProperties(this, {
      $target: {
        writable: false,
        value: target
      },
      $options: {
        value: extend({}, ChessPlayer.defaults, options)
      },
      $wins: {
        writable: true,
        value: {}
      },
      $oldWins: {
        writable: true,
        value: {}
      },
      $lastMan: {
        writable: true,
        value: []
      },
      // 是否可以悔棋
      $canWithdraw: {
        writable: true,
        value: false
      },
      // 是否已经悔棋
      $hasWithdrawed: {
        writable: true,
        value: false
      }
    });
  }

  // 增加玩家赢的可能性
  ChessPlayer.prototype.incWinPossible = function (winId) {
    this.$wins[winId] = this.$wins[winId] || 0;
    this.$wins[winId]++;

    // 设置可以悔棋
    this.$canWithdraw = true;
    this.$hasWithdrawed = false;
  };

  ChessPlayer.prototype.decWinPossible = function (winId) {
    if (this.$wins[winId] && isFinite(this.$wins[winId])) {
      this.$wins[winId]--;
      this.$canWithdraw = false;
      // 表示已经悔棋了
      this.$hasWithdrawed = true;
    }
  }

  ChessPlayer.prototype.disableWinPossible = function (winId) {
    if (!isFinite(this.$wins[winId])) {
      return;
    }
    this.$wins[winId] = this.$wins[winId] || 0;
    this.$oldWins[winId] = this.$wins[winId];
    this.$wins[winId] = Infinity;
  };

  ChessPlayer.prototype.enableWinPossible = function (winId) {
    this.$wins[winId] = this.$oldWins[winId];
  }

  ChessPlayer.prototype.isWin = function () {
    for (var winId in this.$wins) {
      if (this.$wins[winId] === 5) {
        return true;
      }
    }
    return false;
  }
  ChessPlayer.prototype.getName = function () {
    return this.$options.name;
  }

  ChessPlayer.prototype.setLastMan = function (x, y) {
    this.$lastMan = [x, y];
  }

  ChessPlayer.prototype.getLastMan = function () {
    return this.$lastMan;
  }

  ChessPlayer.prototype.canWithdraw = function () {
    return this.$canWithdraw;
  }

  ChessPlayer.prototype.hasWithdrawed = function () {
    return this.$hasWithdrawed;
  }

  ChessPlayer.prototype.getColorStops = function () {
    return this.$options.colorStops;
  }

  ChessPlayer.defaults = {
    name: 'Unknown',
    isAI: false,
    colorStops: []
  }

  ChessPlayer.black_defaults = extend({}, ChessPlayer.defaults, {
    name: '小龙龙',
    colorStops: [[0, '#0a0a0a'], [1, '#636766']]
  });

  ChessPlayer.white_defaults = extend({}, ChessPlayer.defaults, {
    name: '小君君',
    colorStops: [[0, '#d1d1d1'], [1, '#f9f9f9']]
  });

  return ChessPlayer;
});
