import Databus from '../databus'
import Chessboard from './chessboard'

let databus = new Databus();
let chessboard = new Chessboard();
let instance;

export default class Ai {
    constructor() {
        if ( instance )
            return instance;

        instance = this;
    }

    playChessTest(chessman){
        chessman.appear();
        if(!databus.testOver) databus.isTestOver(chessman);
        chessman.saveScore();
        chessman.updateNearbyChessmanScore();
    }

    backout(chessman){
        chessman.reset();
        chessman.restoreScore();
        if(databus.testOver && databus.testResult === chessman) databus.testOver = false;
        databus.gameFlag--;
        //chessman.updateNearbyChessmanScore();
    }

    getBestStep(){
        databus.debug.count = 1;
        databus.step.length >= 10 && (databus.board = 15);
        let score = chessboard.evaluate(),
            result = null;

        if(score >= 9980){
            result = databus.maxPoint[databus.color.ai];
        }else if(score <= -9980){
            result = databus.maxPoint[databus.color.player];
        }else{
            //alpha-beta剪枝算法，得到最优解
            let greatChecker = chessboard.getHighTotalScoreChessmanList();
            console.time('AI运算时间');
            let AlphaBeta = (depth, alpha, beta) => {
                if (depth === 0) {
                    return  chessboard.evaluate();
                }
                let currentGreatCheck = chessboard.getHighTotalScoreChessmanList(),
                    i = currentGreatCheck.length;
                while (i--) {
                    let chessman = currentGreatCheck[i];
                    // console.log('%c' + '第' + (4 - depth) + '步' + chessman.row + '--' +  chessman.col, "color:" + (depth === 2 ? 'red': 'green'));

                    this.playChessTest(chessman);

                    let val = -AlphaBeta(depth - 1, -beta, -alpha);

                    this.backout(chessman);

                    if (val >= beta) {
                        if(depth === databus.deep) result = chessman;
                        return beta;
                    }
                    if (val > alpha) {
                        if(depth === databus.deep) result = chessman;
                        alpha = val;
                    }
                }
                return alpha;
            };
            result = result || greatChecker[greatChecker.length - 1];
            databus.debug.bestScore = AlphaBeta(databus.deep, -100000, 100000);
            console.timeEnd('AI运算时间');
        }
        databus.debug.bestMove = result;
        databus.thinking = false;
        return result;
    }

}