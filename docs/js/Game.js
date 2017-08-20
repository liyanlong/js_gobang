(function (global, factory) {
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 require.js 文件');
  }

  global._define('Game', ['ChessBoard', 'ChessPlayer',  'Render', 'require'], factory);

})(window, function (ChessBoard, ChessPlayer, Render, require) {
  'use strict';

  var extend = require('utils.extend');
  var isArray = require('utils.isArray');
  var events = require('utils.events');

  function getElement (el) {
    if (typeof el === 'string') {
      el = document.querySelector(el);
    }
    if (!(el instanceof HTMLElement)) {
      throw Error('[Game] getElement()，指定的dom元素不存在');
    }
    return el;
  }

  function Game (options) {
    var currentPlayer = null;
    var options = extend({}, Game.defaults, options);
    Object.defineProperties(this, {
      $options: {
        value: options
      },
      $el: {
        value: getElement(options.el)
      },
      $chessboard: {
        value: new ChessBoard(options.chessboard)
      },
      $render: {
        value: new Render(options.render)
      },
      $currentPlayer: {
        get () {
          return currentPlayer;
        },
        set (chessPlayer) {
          if (~[this.$blackPlayer, this.$whitePlayer].indexOf(chessPlayer) && currentPlayer !== chessPlayer) {
            currentPlayer = chessPlayer;
          }
        }
      },
      $enemyPlayer: {
        get () {
          return this.$currentPlayer === this.$blackPlayer ? this.$whitePlayer : this.$blackPlayer;
        }
      },
      $blackPlayer: {
        writable: false,
        value: new ChessPlayer(ChessBoard.config.BLACK_TARGET, options.players.black)
      },
      $whitePlayer: {
        writable: false,
        value: new ChessPlayer(ChessBoard.config.WHITE_TARGET, options.players.white)
      }
    });

    // set default currentPlayer
    this.$currentPlayer = this.$blackPlayer;
    this.$chessboard.init(this);
    this.$render.init(this);
    events.sub(this, 'cancel_chess', this.cancelChess);
    events.sub(this, 'onFinished', options.onFinished);
    events.pub(this.$render, 'update_container', this);
  }


  Game.defaults = {
    chessboard: ChessBoard.defaults,
    render: Render.defaults,
    players: {
      black: ChessPlayer.black_defaults,
      white: ChessPlayer.white_defaults
    },
    onFinished: function ($currentPlayer, $enemyPlayer) {}
  };

  // 绘制点
  Game.prototype.chess = function (x, y) {
    if (this.isGameOver()) {
      return;
    }
    // 更新棋盘状态
    var isOk = this.$chessboard.updateGridMap(x, y, this.$currentPlayer.$target);

    if (isOk) {
      
      // 记录最后一次下棋位置
      this.$currentPlayer.setLastMan(x, y);
      
      // 更新棋盘赢法数组
      this.$chessboard.incWinConditions(x, y, this.$currentPlayer, this.$enemyPlayer);

      // 检测玩家是否胜利
      if (this.$currentPlayer.isWin()) {
        events.pub(this, 'onFinished', this.$currentPlayer, this.$enemyPlayer);
      } else {
        this.switchPlayer();
      }
    }
  }

  // 悔棋
  Game.prototype.cancelChess = function () {
    if (this.isGameOver()) {
      return;
    }

    // 检测上一个玩家是否可以悔棋
    if (!this.$enemyPlayer.canWithdraw()) {
      return;
    }

    // 上一个玩家
    var lastPlayer = this.$enemyPlayer;

    // 获取上一个玩家下的位置
    var man = lastPlayer.getLastMan();

    // 重置棋谱
    this.$chessboard.resetGridMap(man[0], man[1]);

    // 更新棋盘赢法数组
    this.$chessboard.decWinConditions(man[0], man[1], lastPlayer, this.$currentPlayer);

    // 悔棋完成, 交换下棋权
    this.switchPlayer();
  }

  // 撤销悔棋
  Game.prototype.cancelWithdraw = function () {
    if (this.isGameOver()) {
      return;
    }

    // 检查当前玩家是否已经悔棋
    if (!this.$currentPlayer.hasWithdrawed()) {
      return;
    }

    // 获取当前玩家上一次的下棋位置
    var man = this.$currentPlayer.getLastMan();

    // 更新棋盘
    this.$chessboard.updateGridMap(man[0], man[1], this.$currentPlayer.$target);

    // 更新棋盘赢法数组
    this.$chessboard.incWinConditions(man[0], man[1], this.$currentPlayer, this.$enemyPlayer);

    // 撤销悔棋完成，交换下棋权
    this.switchPlayer();
  }

  Game.prototype.switchPlayer = function () {
    this.$currentPlayer = this.$enemyPlayer;
    events.pub(this.$render, 'update_container', this);
  }
  
  // 检查游戏是否结束
  Game.prototype.isGameOver = function () {
    return this.$blackPlayer.isWin() || this.$whitePlayer.isWin();
  };

  // 游戏重置
  Game.prototype.reset = function () {
    
  }

  return Game;
});

