(function (global, factory) {
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 require.js 文件');
  }

  // 定义棋盘对象
  global._define('ChessBoard', ['require'], factory);

})(window, function (require) {
  'use strict';

  var extend = require('utils.extend');
  var events = require('utils.events');

  /**
   * 生成棋盘
   * @param {number} row 
   * @param {number} column 
   */
  function createGridMap (row, column) {
    if (isNaN(+row) || isNaN(+column)) {
      throw Error('[ChessBoard] createGridMap, 行列参数要求为整数');
    }
    row = Math.floor(row);
    column = Math.floor(column);

    if (row < 5 || column < 5) {
      console.warn('[ChessBoard] createGridMap, 棋盘行列大小要求至少大于5');
      row = Math.max(row, 5);
      column = Math.max(column, 5);
    }

    // 生成棋盘地图
    var map = new Array(row);
    for(var i = 0; i < row; i++) {
       map[i] = new Array(column);
       for (var j = 0; j < column; j++) {
          // 初始化棋盘
          map[i][j] = ChessBoard.config.EMPTY_TARGET;
       }
    }
    return map;
  }

  /**
   * 棋盘游戏赢得比赛的所有情况
   * @FIXED  
   */
  function createWinConditions (row, column) {
    var wins = [];
    var id = 0; // 赢法id

    // 记录棋盘 每个点的位置上能够赢的情况id
    for(var i = 0; i < row; i++) {
      wins[i] = [];
      for(var j = 0; j < column; j++){
          wins[i][j] = {};
      }
    }

    // 横线赢法
    for(var i = 0; i < row - 4 /* 横向后四列无法出现赢的情况*/; i++) {
      for(var j = 0; j < column; j++) {
        for(var k = 0; k < 5; k++){
          wins[i+k][j]['id_' + id] = true;
        }
        id++;
      }
    }

    // 竖线赢法
    for(var i = 0; i < row; i++) {
      for(var j = 0; j < column - 4 /* 竖向后四行开始无法出现赢的情况*/; j++) {
        for(var k = 0; k < 5; k++){
          wins[i][j+k]['id_' + id] = true;
        }
        id++;
      }
    }

    // 左斜线赢法
    for(var i = 0; i < row - 4; i++) {
      for(var j = 0; j < column - 4; j++) {
        for(var k = 0; k < 5; k++){
          wins[i+k][j+k]['id_' + id] = true;
        }
        id++;
      }
    }
    // 右斜线赢法
    for(var i = 0; i < row - 4; i++) {
      for(var j = column - 1; j > 3; j--) {
        for(var k = 0; k < 5; k++){
          wins[i+k][j-k]['id_' + id] = true;
        }
        id++;
      }
    }

    return {
      wins: wins,
      count: id
    };
  }


  /**
   * 棋盘构造函数
   * 棋盘的基本属性包括
   */
  function ChessBoard (options) {
    options = extend({}, ChessBoard.defaults, options);
    this.$gridMap = createGridMap(options.row, options.column);
    this.$winConditions = createWinConditions(options.row, options.column);
    this.$options = options;
  }

  ChessBoard.config = {
    EMPTY_TARGET: 0,
    BLACK_TARGET: 1,
    WHITE_TARGET: 2
  };

  ChessBoard.prototype = {
    constructor: ChessBoard,
    init: function (context) {
      var $render = context.$render;
      events.sub(this, 'draw_chess', function (x, y) {
        $render.drawChess(context, x, y);
      });
      events.sub(this, 'withdraw_chess', function (x, y) {
        $render.withdrawChess(context, x, y);
      });
    },
    getRow: function () {
      return this.$options.row;
    },
    getColumn: function () {
      return this.$options.column;
    },
    getBorderColor: function () {
      return this.$options.border_color;
    },
    getCellSize: function () {
      return this.$options.cell_size;
    },
    getGridMap: function () {
      return this.$gridMap;
    },
    updateGridMap: function (x, y, target) {
      var gridMap = this.getGridMap();
      if (gridMap[x][y] === ChessBoard.config.EMPTY_TARGET) {
        gridMap[x][y] = target;
        events.pub(this, 'draw_chess', x, y);
        return true;
      }
      return false;
    },
    resetGridMap: function (x, y) {
      var gridMap = this.getGridMap();
      if (gridMap[x][y] !== ChessBoard.config.EMPTY_TARGET) {
        gridMap[x][y] = ChessBoard.config.EMPTY_TARGET;
        events.pub(this, 'withdraw_chess', x, y);
        return true;
      }
      return false;
    },
    incWinConditions: function (x, y, player, enmeyPlayer) {
      var count = this.$winConditions.count;
      var wins = this.$winConditions.wins;
      for (var i = 0; i < count; i++) {
        var winId = 'id_' + i;
        if (wins[x] && wins[x][y] && wins[x][y][winId]) {
          player.incWinPossible(winId);
          enmeyPlayer.disableWinPossible(winId);
        }
      }
    },
    decWinConditions: function (x, y, player, enmeyPlayer) {
      var count = this.$winConditions.count;
      var wins = this.$winConditions.wins;
      for (var i = 0; i < count; i++) {
        var winId = 'id_' + i;
        if (wins[x] && wins[x][y] && wins[x][y][winId]) {
          player.decWinPossible(winId);
          enmeyPlayer.enableWinPossible(winId);
        }
      }
    },
    getWidth: function () {
      return this.$options.cell_size * (this.$options.column - 1);
    },
    getOuterWidth: function () {
      return this.$options.cell_size * this.$options.column;
    },
    getHeight: function () {
      return this.$options.cell_size * (this.$options.row - 1);
    },
    getOuterHeight: function () {
      return this.$options.cell_size * this.$options.row;
    }
  };

  ChessBoard.defaults = {
     border_color: '#bfbfbf',
     cell_size: 30, // 单元格大小, 单位px
     row: 15,
     column: 15
  };

  return ChessBoard;
})

