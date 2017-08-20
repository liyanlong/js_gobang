(function (global, factory) {
  'use strict';
  if (!global._define || !global._require) {
    throw Error('[Error] 加载文件之前, 请先加载 utils.js 文件');
  }

  global._require(['Render', 'require'], factory);

})(window, function (Render, require) {
 
  var bind = require('utils.bind');

  function onClick (e) {
    
    var context = this;
    var cellSize = context.$chessboard.getCellSize();
    var offset = cellSize / 2;
    var x = Math.max(e.offsetX - offset, 0);
    var y = Math.max(e.offsetY - offset, 0);
    context.chess(Math.round(x / cellSize),  Math.round(y / cellSize));
  }

  function drawChessBoardLine (ctx, x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  Render.register('canvas', {

    init: function (context, options) {
      var $el = context.$el;
      var $chessboard = context.$chessboard;
      var $canvas = document.createElement('canvas');

      // click event
      var _event = bind(onClick, context);
      /*
      * inject canvas dom,
      * inject canvas 2d context
      * set chessboard size
      * append to $el
      */
      context.$canvas = $canvas;
      context.$ctx = $canvas.getContext('2d');
      $canvas.setAttribute('width', $chessboard.getOuterWidth());
      $canvas.setAttribute('height', $chessboard.getOuterHeight());
      $canvas.addEventListener('click', _event);
      $el.appendChild($canvas);
      this._event = _event;
      this._img = new Image();

    },

    // 绘制棋盘
    drawChessBoard: function(context) {
      var $ctx = context.$ctx;
      var $chessboard = context.$chessboard;
      var row = $chessboard.getRow();
      var column = $chessboard.getColumn();
      var cellSize = $chessboard.getCellSize();
      var endPosX = $chessboard.getWidth();
      var endPosY = $chessboard.getHeight();
      var offset = cellSize / 2;

      $ctx.strokeStyle = $chessboard.getBorderColor();
      for (var i = 0; i < row; i++) {
        var posY = i * cellSize;
        drawChessBoardLine($ctx, offset + 0, offset + posY, offset + endPosX, offset + posY);
      }
      for (var j = 0; j < column; j++) {
        var posX = j * cellSize;
        drawChessBoardLine($ctx, offset + posX, offset + 0, offset + posX, offset + endPosY);
      }
    },

    // 给当前玩家绘制棋子
    drawChess: function (context, i, j) {
      var $ctx = context.$ctx;
      var $chessboard = context.$chessboard;
      var cellSize = $chessboard.getCellSize();
      var offset = cellSize / 2;
      var cricleX = i * cellSize + offset;
      var cricleY = j * cellSize + offset;
      var r = (cellSize - 2) / 2;
      this._img.src = context.$canvas.toDataURL();
      
      // 画圆边框
      $ctx.beginPath();
      $ctx.arc(cricleX, cricleY, r, 0, 2 * Math.PI);
      $ctx.closePath();

      // 填充渐变
      var gradient = $ctx.createRadialGradient(
        cricleX, 
        cricleY,
        r, 
        cricleX, 
        cricleY, 
        0
      );
      var colorStops = context.$currentPlayer.getColorStops();
      (colorStops || []).forEach(function (colorStop) {
        gradient.addColorStop(colorStop[0], colorStop[1]);
      });
      $ctx.fillStyle = gradient;
      $ctx.fill();
    },
    withdrawChess (context, i, j) {
      context.$ctx.clearRect(0, 0, context.$chessboard.getOuterWidth(), context.$chessboard.getOuterHeight());
      context.$ctx.drawImage(this._img, 0, 0);
    },
    beforeDestroy: function (context) {
      context.$canvas.removeEventListener('click', this._event);
    }
  });
});
