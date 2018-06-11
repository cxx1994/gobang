import {ctx, gridWidth} from "../game.conf";
import {bothRules, position, rules} from "../libs/score";

import Databus from '../databus'
let databus = new Databus();

export default class Chessman{
    constructor (row, col){
        this.row               = row; // 所在行
        this.col               = col; // 所在列
        this.x                 = gridWidth*(.5 + col); // 棋子中心距离canvas左侧的距离
        this.y                 = gridWidth*(.5 + row); // 棋子中心距离canvas上面的距离
        this.nearbyChessmans = [[], [], [], []]; //以当前棋子为中心四个方向上的棋子数组
        this.historyScore = [];
        this.reset();
    }

    reset(){
        this.alive      = false; // 是否登场
        this.drawing    = false; // 是否进行绘制
        this.color      = ''; // 黑棋还是白棋
        this.light      = []; // 绘制的光亮颜色
        this.team       = 0; // 是否是冲4
        this.score      = {'white': 0, 'black': 0, 'total': 0,}; // 分数
        this.isAnalyze = [false, false, false, false]; // 四个方向上的分析标识
    }

    draw (){
        if(!this.alive) return false;
        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 0, 0, .2)";
        ctx.arc(this.x, this.y, 15, 0, 2*Math.PI);
        ctx.strokeStyle = this.color;
        ctx.stroke();
        let grd = ctx.createRadialGradient(this.x - 5, this.y - 5, 2, this.x - 5, this.y - 5, 15);
        grd.addColorStop(0, this.light[0]);
        grd.addColorStop(1, this.light[1]);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.restore();
    }

    /**
     * 当前棋子登场
     */
    appear (){
        if(this.alive) return false;
        if(databus.isBlackPlayerCurrent()){
            this.color = 'black';
            this.light = ['#beb6b4', '#000000']
        }else{
            this.color = 'white';
            this.light = ['#ffffff', '#d5d5d5']
        }
        databus.gameFlag++;
        return this.alive = true;
    }

    /**
     * 当前棋子登场是否形成了五子连线
     */
    isFiveChessman(){
        let color = this.color;
        return this.score[color] >= rules[0].score
    }

    /**
     * 获取当前棋子距离4范围内的棋子
     */
    initNearbyChessmanList() {
        let { row, col, nearbyChessmans, chessboard } = this;
        //查找当前棋子四个方向上长度为4的所有棋子
        for (let j = 0; j < 9; j++) {
            //  -- 方向
            nearbyChessmans[0].push(chessboard.getChessmanByRowAndCol(row, col - 4 + j));
            //   | 方向
            nearbyChessmans[1].push(chessboard.getChessmanByRowAndCol(row - 4 + j, col));
            //   / 方向
            nearbyChessmans[2].push(chessboard.getChessmanByRowAndCol(row + 4 - j, col - 4 + j));
            //   \ 方向
            nearbyChessmans[3].push(chessboard.getChessmanByRowAndCol(row - 4 + j, col - 4 + j));
        }
    }

    /**
     * 当前棋子评分
     */
    grade(seacher){
        let score = this.score;
        this.team = 0;
        if(this.alive) {
            Object.assign(score, {'white': -5000, 'black': -5000, 'total': -10000});
            return false;
        }

        let both = {'white': [], 'black': []};
        Object.assign(score, {'white': 0, 'black': 0, 'total': 0});
        if(seacher) console.log('%c' + this.row + '-' + this.col, "color:green");
        let de = ['-', '|', '/', "\\"];
        let onceTest = (color, arr, num) => {
            let test = [], leftDead = -1, rightDead = 9, score = 0, team = 0;
            arr.map((value, index) => {
                if(value && !value.alive){
                    test[index] = 0;
                }else if(value && value.alive && value.color === color){
                    test[index] = 1;
                }else{
                    test[index] = 2;
                    if(index < 4){
                        leftDead = index;
                    }else if(rightDead > index){
                        rightDead = index;
                    }
                }
            });
            test[4] = 1;
            test = test.join('');
            if(rightDead - leftDead < 6){//死棋，两边被堵住，永远不能形成五子
                score = rules[rules.length - 1].score;
            }else{
                o: for(let index = 0; index < rules.length; index++){
                    let _value = rules[index].test;
                    for(let i = 0; i < _value.length; i++){
                        let value = _value[i];
                        if(test.indexOf(value) > -1){
                            score += rules[index].score;
                            team = rules[index].team;
                            this.team = team === 4 ? 4 : 0;
                            break o;
                        }
                    }
                }
            }
            if(seacher) console.log(de[num] + " 方向" + "--" + test + '--score--' + score);
            return {score, team};
        };
        let complete = (color) => {
            if(seacher) console.log("%c-------" + color + "------","color:red");
            for(let i = 0; i < 4; i++){
                let result = onceTest(color, this.nearbyChessmans[i], i);
                if(result.score > score[color]) score[color] = result.score;
                result.team && both[color].push(result.team);
            }
            //如果存在两个以上的棋形，则根据组合棋形加分
            if(both[color].length > 1) {
                let bothTest = both[color].sort().join('');
                for(let i = 0; i < bothRules.length; i++){
                    if(bothTest.indexOf(bothRules[i].test) > -1){
                        if(seacher) console.log("组合得分" + "--" + bothRules[i].test + '--score--' + bothRules[i].score);
                        if(bothRules[i].score > score[color]) score[color] = bothRules[i].score;
                        break;
                    }
                }
            }
            //加上位置分
            score[color] += position[this.row][this.col];
            score[color] += Math.random();
            if(seacher) console.log("位置得分--" + position[this.row][this.col]);
            if(seacher) console.log("最后得分--" + score[color]);
        };
        complete('white');
        complete('black');
        score.total = score.white + score.black;
    }

    /**
     * 当前棋子所在棋型分析
     */
    analyze(){
        if(!this.alive) return false;
        let nearbyChessman = this.nearbyChessmans;
        let onceTest = (arr, num) => {
            let color = arr[4].color, test = [], leftDead = -1, rightDead = 9;
            arr.map((value, index) => {
                if(value && !value.alive){
                    test[index] = 0;
                }else if(value && value.alive && value.color === color && !value.isAnalyze[num]){
                    test[index] = 1;
                }else{
                    test[index] = 2;
                    if(index < 4){
                        leftDead = index;
                    }else if(rightDead > index){
                        rightDead = index;
                    }
                }
            });
            test = test.join('');
            if(rightDead - leftDead >= 6){//不是死棋
                o: for(let index = 0; index < rules.length; index++){
                    let _value = rules[index].test;
                    for(let i = 0; i < _value.length; i++){
                        let value = _value[i], sIndex = test.indexOf(value);
                        if(sIndex > -1){
                            let count = databus.typeCount[color], team = rules[index].team;
                            count[team] = count[team] ? ++count[team] : 1;
                            for(let j = 0; j < 5; j++){
                                if(arr[sIndex + j] && arr[sIndex + j].color === color) arr[sIndex + j].isAnalyze[num] = true;
                            }
                            break o;
                        }
                    }
                }
            }
        };
        for(let i = 0; i < 4; i++){
            if(!this.isAnalyze[i]){
                onceTest(nearbyChessman[i], i);
                this.isAnalyze[i] = true;
            }
        }
    }


    /**
     * 落下一子会影响周围距离为4的所有落子点的分数
     * 所以更新当前落子点周围的落子点分数
     */
    updateNearbyChessmanScore(){
        [].concat.apply([], this.nearbyChessmans).forEach(chessman => chessman && chessman.grade());

        // for(let i = 0; i < 9; i++){
        //     for(let j = 0; j < 9; j++){
        //         let chessman = this.chessboard.getChessmanByRowAndCol(this.row - 4 + i, this.col - 4 + j);
        //         chessman && chessman.grade();
        //     }
        // }
    }

    saveScore(){
        this.historyScore = [];
        [].concat.apply([], this.nearbyChessmans).forEach(chessman => {
            this.historyScore.push(chessman ? Object.assign({}, chessman.score) : null)
        });
    }

    restoreScore(){
        [].concat.apply([], this.nearbyChessmans).forEach((chessman, index) => {
            let historyScore = this.historyScore[index];
            if(historyScore) chessman.score = historyScore;
        });
        this.historyScore = [];
    }
}
