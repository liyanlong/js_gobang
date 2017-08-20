# JS 单机版五子棋
> [Online Demo](https://liyanlong.github.io/js_gobang/)

## 安装运行
```bash
  git clone https://github.com/liyanlong/js_gobang.git
  npm install
  npm run start
```

## 功能介绍

1. 使用原生技术实现，兼容 Chrome 浏览器即可。 
2. 实现胜负判断，并给出赢棋提示；任意玩家赢得棋局，锁定棋盘。
3. 界面可以使用 DOM / Canvas 实现。(当前实现了Canvas版本)
4. 实现一个悔棋功能.
5. 实现一个撤销悔棋功能.

## 技术运用

1. 设计模式
  1. 订阅/发布模式
  2. 中介者模式
2. ECMAScript5 defineProperty
3. CMD模块加载
4. canvas绘制

## Features
1. 添加智能AI下棋
2. 编写测试用例
3. ESLint 检查
4. 使用ES6 + Vue.js + Webpack 编写
5. 联网对战
