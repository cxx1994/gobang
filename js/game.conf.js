
const canvas = document.getElementById("myGame");
const ctx = canvas.getContext("2d");
const canWidth = canvas.width;
const canHeight = canvas.height;
const pading = 20;
const gridWidth = 36;//棋盘格子的宽高（带一边的线宽）
const gridNum = 15;//每一行(列)的棋盘交点数
const manual = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];//棋谱生成需要
export {canvas, ctx, canWidth, canHeight, pading, gridWidth, gridNum, manual};
