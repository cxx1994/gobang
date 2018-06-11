
import './js/libs/adapter'
import { drawBackground } from './js/runtime/background'
import { canvas, ctx, canWidth, canHeight, padding, gridWidth } from './js/game.conf'

import GameInfo from './js/runtime/gameinfo'

import Chessboard from './js/base/chessboard'

import Ai from './js/base/ai'

import Databus from './js/databus'
let databus = new Databus();

class Game  {
    constructor() {
        this.restart();
        this.control();
        this.gameLoop();
    }
    restart(){
        //数据中心重置
        databus.reset();

        //初始化一个AI
        this.AI = new Ai();

        //初始化一个棋盘
        this.chessboard = new Chessboard();
        this.chessboard.init();

        //游戏中的信息
        this.gameInfo = new GameInfo();
        //给按钮绑定点击事件
        this.bindButtonClickEvent();

        //绘制游戏背景
        drawBackground();
    }

    //双人对战模式
    doublePlayer(){
        this.restart();
        databus.gameType = 0;
    }

    //AI后手执白棋
    AIWhite(){
        this.restart();
        databus.gameType = 1;
        databus.color.player = 'black';
        databus.color.ai = 'white';
    }

    //AI先手执黑棋
    AIBlack(){
        this.restart();
        databus.gameType = 1;
        databus.color.player = 'white';
        databus.color.ai = 'black';
        this.playChess(this.chessboard.getChessmanByRowAndCol(7, 7));
    }

    //给按钮注入点击事件
    bindButtonClickEvent(){
        let buttonList = this.gameInfo.button;
        buttonList.forEach(button => {
            switch (button.id) {
                case 'double':
                    button.onClick = this.doublePlayer.bind(this);
                    break;
                case 'AIWhite':
                    button.onClick = this.AIWhite.bind(this);
                    break;
                case 'AIBlack':
                    button.onClick = this.AIBlack.bind(this);
                    break;
                case 'back':
                    button.onClick = this.back.bind(this);
                    break;
            }
        });
    }

    //事件控制
    control(){
        //点击按钮
        canvas.addEventListener('mousedown', (e) => {
            let x = e.offsetX,
                y = e.offsetY;
            this.gameInfo.button.forEach( button => {
                button.click(x, y)
            })
        });
        //点击下棋
        canvas.addEventListener('mousedown', (e) => {
            //AI运算中，禁止落子
            if(databus.thinking) return;
            //获取点击的棋子
            let row = ~~((e.offsetY - padding)/gridWidth),
                col = ~~((e.offsetX - padding)/gridWidth);
            let chessman = this.chessboard.getChessmanByRowAndCol(row, col);
            if(!chessman) return;
            //右键可以查看当前棋位的分数
            if(e.button === 2){
                chessman.grade(true);
            }else{
                //点击位置着棋
                this.playChess(chessman);
            }
        });
    }

    //着棋
    playChess(chessman){
        //如果当前棋子已经落下或者游戏已经结束，返回
        if(chessman.alive || databus.state.end) return false;

        //棋子落下
        chessman.appear();

        //记录步骤
        databus.step.push(chessman);

        //判断游戏是否结束
        databus.isGameOver();

        //游戏结束，退出
        if(databus.state.end) return false;

        //更新当前棋子落下后当前位置和周围位置的分数
        chessman.updateNearbyChessmanScore();

        //如果下一个下棋的是AI，AI着棋
        if(databus.isAiPlay()){
            databus.thinking = true;
            setTimeout(() => {
                this.playChess(this.AI.getBestStep());
            }, 20);
        }
    }

    //悔棋
    back(){
        let chessman = databus.step.pop();
        if(chessman){
            chessman.reset();
            chessman.updateNearbyChessmanScore();
            databus.gameFlag--;
        }
    }

    //绘制游戏
    draw(){
        //绘制棋子
        this.gameInfo.renderChessman();

        //绘制debug
        this.gameInfo.renderDebug();

        //绘制按钮
        this.gameInfo.renderButton();

        //游戏结束绘制GameOver
        if(databus.state.end) {
            this.gameInfo.renderGameOver();
        }

        //绘制ai思考中
        if(databus.thinking) {
            this.gameInfo.renderThinking();
        }
    }

    //游戏循环
    gameLoop(){
        let gameLoop = () => {
            requestAnimFrame(gameLoop);
            if(databus.state.pause) return false;
            ctx.clearRect(0, 0, canWidth, canHeight);
            this.draw();
        };
        gameLoop();
    }
}
window.game = new Game;
