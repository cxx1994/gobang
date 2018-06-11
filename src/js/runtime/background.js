
import {canvas, canWidth, canHeight, padding, gridWidth, gridNum, manual } from '../game.conf'
//绘制游戏背景,并定义按钮样式

let bgCanvas = document.createElement("canvas"),
    ctx = bgCanvas.getContext("2d"),
    paddingLeft = padding + gridWidth/2  - 0.5;

bgCanvas.width = canWidth;
bgCanvas.height = canHeight;

canvas.parentNode.insertBefore(bgCanvas, canvas);

export function drawBackground() {
    //绘制背景
    ctx.save();
    ctx.fillStyle = "#dbb89a";
    ctx.fillRect(0, 0, canWidth, canHeight);
    ctx.translate(paddingLeft, paddingLeft);
    //绘制游戏格子
    ctx.font = "14px Arial";
    ctx.fillStyle = "#333333";
    ctx.lineWidth = 1;
    for(let i = 0; i < gridNum; i++){
        let g = gridWidth*i;
        ctx.moveTo(0, g);
        ctx.lineTo(gridWidth*(gridNum - 1), g);
        ctx.stroke();
        ctx.fillText(i, -(paddingLeft + ctx.measureText(i).width)/2, g + 5);
        ctx.moveTo(g, 0);
        ctx.lineTo(g , gridWidth*(gridNum - 1));
        ctx.stroke();
        ctx.fillText(manual[i], g - ctx.measureText(manual[i]).width/2, -10);
    }
    let pointWidth = 9, half = Math.floor(pointWidth/2);
    ctx.translate(-half - 0.5, -half - 0.5);
    ctx.fillStyle = "#333333";
    ctx.fillRect(gridWidth*3, gridWidth*3, pointWidth, pointWidth);
    ctx.fillRect(gridWidth*11, gridWidth*3, pointWidth, pointWidth);
    ctx.fillRect(gridWidth*7, gridWidth*7, pointWidth, pointWidth);
    ctx.fillRect(gridWidth*3, gridWidth*11, pointWidth, pointWidth);
    ctx.fillRect(gridWidth*11, gridWidth*11, pointWidth, pointWidth);
    ctx.restore();
}