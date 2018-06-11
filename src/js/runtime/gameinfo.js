import Button from './button'

import DataBus from '../databus'
import {canvas, canWidth, ctx, manual, padding} from "../game.conf";
let databus = new DataBus();

export default class GameInfo {
    constructor() {
        this.button = [];
        this.initButton();
    }
    initButton() {
        let double = new Button({
            id: 'double',
            x: 560,
            y: 150,
            text: '双人对战'
        });
        let AIWhite = new Button({
            id: 'AIWhite',
            x: 560,
            y: 220,
            text: 'AI执白子'
        });
        let AIBlack = new Button({
            id: 'AIBlack',
            x: 560,
            y: 290,
            text: 'AI执黑子'
        });
        let back = new Button({
            id: 'back',
            x: 560,
            y: 360,
            text: '悔棋'
        });
        this.button.push(double, AIWhite, AIBlack, back)
    }

    renderButton(){
        this.button.forEach(btn => btn.draw());
    }

    //绘制棋子
    renderChessman() {
        ctx.save();
        ctx.translate(padding, padding);
        //绘制棋子
        databus.step.map(chessman => chessman.draw());
        //绘制最后一个着棋点
        let lastStep = databus.step[databus.step.length - 1];
        if(lastStep){
            ctx.save();
            ctx.fillStyle = "red";
            ctx.fillRect(lastStep.x - 1, lastStep.y - 5, 2, 10);
            ctx.fillRect(lastStep.x - 5, lastStep.y - 1, 10, 2);
            ctx.restore();
        }
        ctx.restore();
    }

    //绘制游戏结束的提示
    renderGameOver() {
        databus.alpha += 0.005;
        if(databus.alpha > 1) databus.alpha = 1;
        ctx.font = "34px Arial";
        ctx.fillStyle = `rgba(255,0,0,${databus.alpha})`;
        ctx.fillText(`${databus.winner}胜!`, canvas.width*0.5 - 100, canvas.height*0.5);
    }

    //绘制AI思考中的提示
    renderThinking() {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#ff0000";
        ctx.fillText("AI思考中...", canvas.width*0.5 - 100, canvas.height*0.5);
    }

    renderDebug() {
        ctx.fillStyle = 'rgba(0,0,0,.8)';
        ctx.fillRect(canWidth - 130, 0, 130, 130);
        let left = canWidth - 130 + 8;
        ctx.font = "14px Arial";
        ctx.fillStyle = '#dddddd';
        ctx.fillText(`搜索深度: ${databus.deep}`, left, 20);
        ctx.fillText(`搜索广度: ${databus.board}`, left, 40);
        ctx.fillText(`搜索个数: ${databus.debug.count}`, left, 60);
        ctx.fillText(`最佳分数: ${databus.debug.bestScore}`, left, 80);
        ctx.fillText(`最佳着法: ${manual[databus.debug.bestMove.col] + databus.debug.bestMove.row}`, left, 100);
        ctx.fillText(`游戏监听: ${Math.random().toFixed(5)}`, left, 120);
    }
}

