import { gridNum } from "../game.conf";
import Chessman from './chessman'
import { quickSort } from "../libs/arithmetic";
import {bothRules, position, rules} from "../libs/score";

import Databus from '../databus'
let databus = new Databus();

let instance;

/**
 * 所有棋子管理器，棋盘分析
 */
export default class Chessboard {
    constructor() {
        if ( instance )
            return instance;

        instance = this;

        this.chessmans = [];
        this.init()
    }

    /**
     * 初始化生成所有棋子
     */
    init() {
        //生成所有棋子
        Chessman.prototype.chessboard = this;
        for (let i = 0; i < gridNum; i++) {
            this.chessmans[i] = [];
            for (let j = 0; j < gridNum; j++) {
                this.chessmans[i][j] = new Chessman(i, j);
                //this.analyze(i, j);
            }
        }
        let chessmans = this.getChessmanLinearArray();
        chessmans.forEach(chessman => {
            chessman.initNearbyChessmanList();
            chessman.grade();
        })
    }

    /**
     * 根据行、列获取指定位置的棋子
     */
    getChessmanByRowAndCol(row, col) {
        return this.chessmans[row] ? this.chessmans[row][col] : undefined
    }

    /**
     * 获取所有棋子构成的一维数组
     */
    getChessmanLinearArray() {
        return [].concat.apply([], this.chessmans)
    }

    //获取白棋最高分、黑棋最高分、总分最高分的落棋点
    getHighestScoreChessman() {
        let chessmanList = this.getChessmanLinearArray();
        let white, black, total;
        white = black = total = chessmanList[0];
        chessmanList.forEach(chessman => {
            let currentScore = chessman.score;
            if (currentScore.white > white.score.white) white = chessman;
            if (currentScore.black > black.score.black) black = chessman;
            if (currentScore.total > total.score.total) total = chessman;
        });
        return { white, black, total };
    }

    /**
     * 获取当前局势下总分排名较高的着棋位置数组
     * 长度为用户设置的board
     */
    getHighTotalScoreChessmanList() {
        //获取所有棋子构成的一维数组
        let chessmanArr = this.getChessmanLinearArray();
        let result = [];
        //将可以形成冲4的落子点加入最优数组，并从原数组中移除
        chessmanArr = chessmanArr.filter(chessman => {
            if (chessman.team === 4) {
                result.push(chessman);
                return false
            }
            return true
        });
        //根据总分排序，然后选取排名靠前的落子点（长度为设置的board值）
        let greatChecker = quickSort(chessmanArr, 'total').slice(chessmanArr.length - databus.board);
        //返回分数相对较高的落子点列表
        return result.concat(greatChecker);
    }


    /**
     * 评估当前局势，返回一个分数
     */
    evaluate() {
        //判断当前局势下，着棋方是白棋还是黑棋
        const isBlackToPlay = databus.isBlackPlayerCurrent();

        //模拟下棋是否有一方已经胜利
        if (databus.testOver) {
            let color = isBlackToPlay ? 'black' : 'white';
            return databus.testResult.color === color ? 10000 : -10000;
        }

        //获取所有棋子的一维数组
        let chessmanList = this.getChessmanLinearArray();

        //对落子点落白子和落黑子的分数分别进行排序,然后分别选取分数最大的点
        databus.maxPoint = this.getHighestScoreChessman();

        //清空上次分析结果
        databus.typeCount = {'black': {}, 'white': {}};
        //将所有棋子设为未分析
        chessmanList.forEach(chessman => chessman.isAnalyze = [false, false, false, false]);
        //分析每个棋子
        chessmanList.forEach(chessman => chessman.analyze());
        //console.log(gameFlag%2 ? 'black' : 'white');
        databus.debug.count++;
        let typeCount = databus.typeCount,
            WValue = 0,
            BValue = 0;

        //两个冲四等于一个活四
        if (typeCount['white']['4'] > 1) typeCount['white']['5'] = typeCount['white']['5'] ? ++typeCount['white']['5'] : 0;
        if (typeCount['black']['4'] > 1) typeCount['black']['5'] = typeCount['black']['5'] ? ++typeCount['black']['5'] : 0;

        if (isBlackToPlay) {//该黑棋下
            //活四,黑胜返回极值
            if (typeCount['black']['6']) return 9990;

            //冲四,黑胜返回极值
            if (typeCount['black']['5']) return 9980;

            //活四,白胜返回极值
            if (typeCount['white']['6']) return -9970;

            //冲四并活三,白胜返回极值
            if (typeCount['white']['5'] && typeCount['white']['4']) return -9960;

            //黑活三,白无四。黑胜返回极值
            if (typeCount['black']['4'] && !typeCount['white']['5']) return 9950;

            //白的活三多于一个,而黑无四和三,白胜返回极值
            if (typeCount['white']['4'] > 1 && !typeCount['black']['6'] && !typeCount['black']['5'] && !typeCount['black']['4']) return -9940;

            if (typeCount['black']['4'] > 1) {
                //黑的活三多于一个,黑棋价值加2000
                BValue += 2000;
            } else if (typeCount['black']['4']) {
                //否则黑棋价值加200
                BValue += 200;
            }

            if (typeCount['white']['4'] > 1) {
                //白的活三多于一个,白棋价值加 500
                WValue += 500;
            } else if (typeCount['white']['4']) {
                //否则白棋价值加100
                WValue += 100;
            }

        } else {
            //活四,白胜返回极值
            if (typeCount['white']['6']) return 9990;

            //冲四,白胜返回极值
            if (typeCount['white']['5']) return 9980;

            //白无冲四活四,而黑有活四,黑胜返回极值
            if (typeCount['black']['6']) return -9970;

            //黑有冲四和活三,黑胜返回极值
            if (typeCount['black']['5'] && typeCount['black']['4']) return -9960;

            //白有活三而黑没有四,白胜返回极值
            if (typeCount['white']['4'] && !typeCount['black']['5']) return 9950;

            //黑的活三多于一个,而白无四和三,黑胜返回极值
            if (typeCount['black']['4'] > 1 && !typeCount['white']['6'] && !typeCount['white']['5'] && !typeCount['white']['4']) return -9940;

            if (typeCount['white']['4'] > 1) {
                //白活三多于一个,白棋价值加2000
                BValue += 2000;
            } else if (typeCount['white']['4']) {
                //否则白棋价值加200
                BValue += 200;
            }

            if (typeCount['black']['4'] > 1) {
                //黑的活三多于一个,黑棋价值加500
                WValue += 500;
            } else if (typeCount['black']['4']) {
                //否则黑棋价值加100
                WValue += 100;
            }
        }
        //每个眠三加10
        if (typeCount['white']['3']) WValue += typeCount['white']['3'] * 10;

        //每个眠三加10
        if (typeCount['black']['3']) BValue += typeCount['black']['3'] * 10;

        //每个活二加4
        if (typeCount['white']['2']) WValue += typeCount['white']['2'] * 10;

        //每个活二加4
        if (typeCount['black']['2']) BValue += typeCount['black']['2'] * 10;

        //每个眠二加1
        if (typeCount['white']['1']) WValue += typeCount['white']['1'];

        //每个眠二加1
        if (typeCount['black']['1']) BValue += typeCount['black']['1'];

        //位置得分
        chessmanList.forEach(chessman => {
            if (chessman.alive) {
                let positionScore = position[chessman.row][chessman.col];
                BValue += positionScore;
                WValue += positionScore;
            }
        });

        //随机分，不然AI一直走相同的棋法
        BValue += parseFloat(Math.random().toFixed(2));

        return isBlackToPlay ? BValue - WValue : WValue - BValue;
    }

}
