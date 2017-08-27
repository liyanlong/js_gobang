(function (global, factory) {
  'use strict';
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 utils.js 文件');
  }

  global._require(['Render', 'require'], factory);

})(window, function (Render, require) {

  var extend = require('utils.extend');

  function getCssText (styles) {
    return Object.keys(styles).map(function (key) {
      return  key + ':' + styles[key] + ';';
    }).join('');
  }

  function getCompatStyle (name, value, isAfter) {
    isAfter = !!isAfter;
    return ['-webkit-', '-o-', '-moz-', ''].map(function (browserTag) {
      return (isAfter ? name : browserTag + name) + ':' + (isAfter ? browserTag + value : value) + ';';
    }).join('');
  }

  // 绘制横线
  function createRowLine (left, top, width, borderColor) {
    var styles = {
      position: 'absolute',
      width: width + 'px',
      height: '0px',
      border: '1px solid ' + borderColor,
      left: left + 'px',
      top: top + 'px',
      'z-index': -1
    };
    var row = document.createElement('div');
    row.style.cssText = getCssText(styles);
    return row;
  }

  // 绘制纵线
  function createColumnLine (left, top, height, borderColor) {
      var styles = {
      position: 'absolute',
      width: '0px',
      height: height + 'px',
      border: '1px solid ' + borderColor,
      left: left + 'px',
      top: top + 'px',
      'z-index': -1
    };
    var row = document.createElement('div');
    row.style.cssText = getCssText(styles);
    return row;
  }

  // 绘制棋子
  function createChess (left, top, cellSize, colorStops) {
    var styles = {
      'position': 'absolute',
      'left': left + 'px',
      'top': top + 'px',
      'width': cellSize + 'px',
      'height': cellSize + 'px',
      'border-radius': cellSize + 'px'
    };
    var chess = document.createElement('div');
    chess.style.cssText = getCssText(styles) + 
      getCompatStyle('background', 'radial-gradient(circle, ' + colorStops[0] + ', '  + colorStops[1] + ')', true);
    return chess;
  }

  Render.register('dom', {

    init: function (context, options) {
      var $el = context.$el;
      var $chessboard = context.$chessboard;
      var $chessboardELm = document.createElement('div');
      $chessboardELm.className = 'chessboard';

      /*
      * set chessboard size
      * append to $el
      */
      $chessboardELm.style.cssText = getCssText({
        width: $chessboard.getOuterWidth() +'px',
        height: $chessboard.getOuterHeight() +'px',
        position: 'relative'
      });
      $el.appendChild($chessboardELm);
      context.$chessboardELm = $chessboardELm;
    },

    // 绘制棋盘
    drawChessBoard: function(context) {
      var $chessboard = context.$chessboard;
      var row = $chessboard.getRow();
      var column = $chessboard.getColumn();
      var cellSize = $chessboard.getCellSize();
      var endPosX = $chessboard.getWidth();
      var endPosY = $chessboard.getHeight();
      var borderColor = $chessboard.getBorderColor();
      var offset = cellSize / 2;

      var $rows = document.createElement('div');
      var fragment = document.createDocumentFragment();
      $rows.style.position = 'relative';
      $rows.className = 'rows';
      
      for (var i = 0; i < row; i++) {
        var posY = i * cellSize; // top
        fragment.appendChild(createRowLine(offset + 0, offset + posY, endPosX,  borderColor));
      }
      $rows.appendChild(fragment);

      var $columns = document.createElement('div');
      var fragment2 = document.createDocumentFragment();
      $columns.style.position = 'relative';
      $columns.className = 'columns';

      for (var j = 0; j < column; j++) {
        var posX = j * cellSize;
        fragment2.appendChild(createColumnLine(offset + posX, offset + 0, endPosY,  borderColor));
      }
      $columns.appendChild(fragment2);
      context.$chessboardELm.appendChild($rows);
      context.$chessboardELm.appendChild($columns);
    },

    // 给当前玩家绘制棋子
    drawChess: function (context, i, j) {
      var $chessboard = context.$chessboard;
      var cellSize = $chessboard.getCellSize();
      var offset = cellSize / 2;
      var offsetX = i * cellSize;
      var offsetY = j * cellSize;
      var colorStops = context.$currentPlayer.getColorStops();
      // 生成棋子
      var chess = createChess(offsetX, offsetY, cellSize, colorStops);
      chess.classList.add('chess',  'chess_' + i + '_' + j);
      context.$chessboardELm.appendChild(chess);
    },

    // 悔棋
    withdrawChess (context, i, j) {
      var el = context.$chessboardELm.querySelector('.chess_' + i + '_' + j);
      el && context.$chessboardELm.removeChild(el);
    },
    beforeDestroy: function (context) {
    }
  });
});
