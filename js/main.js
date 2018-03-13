
import {drawBackground} from './world'
import {bothRules, rules, position} from './score'
import {quickSort, bubbleSort, merge} from './arithmetic'
import {canvas, ctx, canWidth, canHeight, pading, gridWidth, gridNum, manual} from './game.conf'


let gameFlag = 1;


window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();

class Pieces{
    constructor (row, col){
        this.alive = false;
        this.drawing = false;
        this.color = '';
        this.light = [];
        this.team = 0;
        this.score = {
            'white': 0,
            'black': 0,
            'total': 0,
        };
        this.analyze = [false, false, false, false];
        this.row = row;
        this.col = col;
        this.x = gridWidth*(.5 + col);
        this.y = gridWidth*(.5 + row);
        this.history = null;
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

    appear (){
        if(this.alive) return false;
        if(gameFlag++%2){
            this.color = 'black';
            this.light = ['#beb6b4', '#000000']
        }else{
            this.color = 'white';
            this.light = ['#ffffff', '#d5d5d5']
        }
        this.alive = true;
        return true;
    }

    save(){
        this.history = {
            'alive': this.alive,
            'drawing': this.drawing,
            'color': this.color,
            'score': {
                'white': this.score.white,
                'black': this.score.black,
                'total': this.score.total
            }
        };
    }

    restore(){
        Object.assign(this, this.history);
    }
}

let team = [];
class Game  {
    constructor() {
        this.restart();
        this.control();
        this.gameLoop();
    }
    restart(){
        gameFlag = 1;
        //初始化数据
        this.checker = [];
        this.maxPoint = {};
        this.winner = null;
        this.board = 10;
        this.deep = 4;
        this.color = {
            player: 'black',
            ai: 'white'
        };
        this.step = [];
        this.alpha = 0.5;
        this.gameType = 1;
        this.state = {
            start: false,
            pause: false,
            end: false,
        };
        this.testOver = false;
        this.testResult = null;
        this.typeCount = {
            'black': {},
            'white': {}
        };
        this.debug = {
            bestMove: {
                row: 7,
                col: 7
            },
            bestScore: 0,
            count: 0
        };
        this.thinking = false;
        //绘制游戏背景
        drawBackground();
        //初始化所有棋子
        for(let i = 0; i < gridNum; i++){
            this.checker[i] = [];
            for(let j = 0; j < gridNum; j++){
                this.checker[i][j] = new Pieces(i, j);
                this.analyze(i,j);
            }
        }
    }
    control(){
        document.getElementsByClassName('double')[0].onclick = () => {
            this.restart();
            this.gameType = 0;
        };
        document.getElementsByClassName('black')[0].onclick = () => {
            this.restart();
            this.gameType = 1;
            this.color.player = 'black';
            this.color.ai = 'white';
        };
        document.getElementsByClassName('white')[0].onclick = () => {
            this.restart();
            this.gameType = 1;
            this.color.player = 'white';
            this.color.ai = 'black';
            this.playChess(7, 7);
        };
        document.getElementsByClassName('back')[0].onclick = () => {
            if(this.thinking) return false;
            this.back();
            if(this.gameType) this.back();
        };
        //点击下棋
        canvas.addEventListener('mousedown', (e) => {
            //AI运算中，禁止落子
            if(this.thinking) return;
            let row = ~~((e.offsetY - pading)/gridWidth),
                col = ~~((e.offsetX - pading)/gridWidth);
            if(14 < row || row < 0 || 14 < col || col < 0) return;
            if(e.button === 2){
                this.analyze(row, col, true);
            }else{
                //点击位置着棋
                this.playChess(row, col, true);
            }
        });
    }
    playChess(row, col, ai){
        let pieces = this.checker[row][col];

        //如果当前棋子已经落下或者游戏已经结束，返回
        if(pieces.alive || this.state.end) return false;

        //棋子落下
        pieces.appear();

        //记录步骤
        this.step.push(pieces);

        //判断游戏是否结束
        this.isWin(row, col);

        //更新当前棋子落下后当前位置和周围位置的分数
        this.updateScore(row, col);

        //如果是人机，AI思考后着棋
        if(this.gameType === 1 && ai && !this.state.end){
            this.thinking = true;
            setTimeout(() => {
                this.ai()
            }, 20);
        }
    }
    back(){
        let lastStep = this.step[this.step.length - 1];
        if(lastStep){
            this.checker[lastStep.row][lastStep.col] = new Pieces(lastStep.row, lastStep.col);
            this.updateScore(lastStep.row, lastStep.col);
            this.step.pop();
            gameFlag--;
        }
    }
    isWin(x, y){
        let chess = this.checker[x][y];
        let color = chess.color;

        if(chess.score[color] >= rules[0].score){
            this.state.end = true;
            this.winner = color === 'black' ? '黑棋' : '白棋';
        }
    };
    isTestOver(x, y){
        let chess = this.checker[x][y],
            color = chess.color;
        if(chess.score[color] >= rules[0].score){
            this.testOver = true;
            this.testResult = {
                color,
                position: x + '' + y
            };
        }
    }
    draw(){
        ctx.save();
        ctx.translate(pading, pading);
        //绘制棋子
        this.step.map((v) => v.draw());
        //绘制最后一个着棋点
        let lastStep = this.step[this.step.length - 1];
        if(lastStep){
            ctx.save();
            ctx.fillStyle = "red";
            ctx.fillRect(lastStep.x - 1, lastStep.y - 5, 2, 10);
            ctx.fillRect(lastStep.x - 5, lastStep.y - 1, 10, 2);
            ctx.restore();
        }
        ctx.restore();
        ctx.save();
        //绘制debug
        ctx.fillStyle = 'rgba(0,0,0,.8)';
        ctx.fillRect(canWidth - 130, 0, 130, 130);
        let left = canWidth - 130 + 8;
        ctx.font = "14px Arial";
        ctx.fillStyle = '#dddddd';
        ctx.fillText(`搜索深度: ${this.deep}`, left, 20);
        ctx.fillText(`搜索广度: ${this.board}`, left, 40);
        ctx.fillText(`搜索个数: ${this.debug.count}`, left, 60);
        ctx.fillText(`最佳分数: ${this.debug.bestScore}`, left, 80);
        ctx.fillText(`最佳着法: ${manual[this.debug.bestMove.col] + this.debug.bestMove.row}`, left, 100);
        ctx.fillText(`游戏监听: ${Math.random().toFixed(5)}`, left, 120);
        //游戏结束绘制GameOver
        if(this.state.end) {
            this.alpha += 0.005;
            if(this.alpha > 1) this.alpha = 1;
            ctx.font = "34px Arial";
            ctx.fillStyle = `rgba(255,0,0,${this.alpha})`;
            ctx.fillText(`${this.winner}胜!`, canvas.width*0.5 - 100, canvas.height*0.5);
        }
        //绘制ai思考中
        if(this.thinking) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "#ff0000";
            ctx.fillText("AI思考中...", canvas.width*0.5 - 100, canvas.height*0.5);
        }
        ctx.restore();
    }
    analyze(row, col, seacher){
        let checker = this.checker;
        if(!checker[row] || !checker[row][col]) return false;
        checker[row][col].team = 0;
        if(checker[row][col].alive) {
            checker[row][col].score.total = -10000;
            checker[row][col].score.white = -5000;
            checker[row][col].score.black = -5000;
            return false;
        }

        let score = checker[row][col].score,
            both = {'white': [], 'black': []},
            nearPoint = [[], [], [], []];
        Object.assign(score, {'white': 0, 'black': 0, 'total': 0});
        //查找当前棋子四个方向上长度为4的所有棋子
        for(let j = 0; j < 9; j++){
            //  -- 方向
            nearPoint[0].push(checker[row][col - 4 + j]);
            //   | 方向
            nearPoint[1].push(checker[row - 4 + j] ? checker[row - 4 + j][col] : null);
            //   / 方向
            nearPoint[2].push(checker[row + 4 - j] ? checker[row + 4 - j][col - 4 + j] : null);
            //   \ 方向
            nearPoint[3].push(checker[row - 4 + j] ? checker[row - 4 + j][col - 4 + j] : null);
        }
        if(seacher) console.log('%c' + row + '-' + col, "color:green");
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
                for(let index = 0; index < rules.length; index++){
                    let _value = rules[index].test;
                    for(let i = 0; i < _value.length; i++){
                        let value = _value[i];
                        if(test.indexOf(value) > -1){
                            score += rules[index].score;
                            team = rules[index].team;
                            checker[row][col].team = team === 4 ? 4 : 0;
                            break;
                        }
                    }
                    if(score !== 0) break;
                }
            }
            if(seacher) console.log(de[num] + " 方向" + "--" + test + '--score--' + score);
            return {score, team};
        };
        let complate = (color) => {
            if(seacher) console.log("%c-------" + color + "------","color:red");
            for(let i = 0; i < 4; i++){
                let result = onceTest(color, nearPoint[i], i);
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
            score[color] += position[row][col];
            score[color] += Math.random();
            if(seacher) console.log("位置得分--" + position[row][col]);
            if(seacher) console.log("最后得分--" + score[color]);
        };
        complate('white');
        complate('black');
        score.total = score.white + score.black;
    }
    typeAnalyze(row, col){
        let checker = this.checker;
        if(!checker[row] || !checker[row][col] || !checker[row][col].alive) return false;
        let chess = checker[row][col],
            nearPoint = [[], [], [], []];
        //查找当前棋子四个方向上长度为4的所有棋子
        for(let j = 0; j < 9; j++){
            //  -- 方向
            nearPoint[0].push(checker[row][col - 4 + j]);
            //   | 方向
            nearPoint[1].push(checker[row - 4 + j] ? checker[row - 4 + j][col] : null);
            //   / 方向
            nearPoint[2].push(checker[row + 4 - j] ? checker[row + 4 - j][col - 4 + j] : null);
            //   \ 方向
            nearPoint[3].push(checker[row - 4 + j] ? checker[row - 4 + j][col - 4 + j] : null);
        }
        let onceTest = (arr, num) => {
            let color = arr[4].color, test = [], leftDead = -1, rightDead = 9, success = false;
            arr.map((value, index) => {
                if(value && !value.alive){
                    test[index] = 0;
                }else if(value && value.alive && value.color === color && !value.analyze[num]){
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
                for(let index = 0; index < rules.length; index++){
                    let _value = rules[index].test;
                    for(let i = 0; i < _value.length; i++){
                        let value = _value[i], sIndex = test.indexOf(value);
                        if(sIndex > -1){
                            success = true;
                            let count = this.typeCount[color], team = rules[index].team;
                            count[team] = count[team] ? ++count[team] : 1;
                            for(let j = 0; j < 5; j++){
                                if(arr[sIndex + j] && arr[sIndex + j].color === color) arr[sIndex + j].analyze[num] = true;
                            }
                            break;
                        }
                    }
                    if(success) break;
                }
            }
        };
        for(let i = 0; i < 4; i++){
            if(!chess.analyze[i]){
                onceTest(nearPoint[i], i);
                chess.analyze[i] = true;
            }
        }
    }
    updateScore(row, col){
        //落下一子会影响周围距离为4的所有落子点的分数，所以更新当前落子点周围的落子点分数
        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 9; j++){
                this.analyze(row - 4 + i, col - 4 + j);
            }
        }
    }
    getBestChess(){
        //将二维数组中的棋子写入一维数组
        let poicesArr = [].concat.apply([], this.checker),
            //根据总分排序，然后选取排名靠前的落子点（长度为设置的board值）
            greatChecker = bubbleSort(poicesArr, 'total').slice(poicesArr.length - this.board);
        //将可以形成冲4的落子点加入最优数组
        poicesArr.forEach((v) => v.team === 4 && greatChecker.unshift(v));
        //去重后返回
        return [...new Set(greatChecker)];
    }
    evaluate(){
        //将二维数组中的棋子写入一维数组
        let arr = [].concat.apply([], this.checker);
        //对落子点落白子和落黑子的分数分别进行排序,然后选分别取分数最大的点
        this.maxPoint = {
            'white':   bubbleSort(arr, 'white')[arr.length - 1],
            'black':   bubbleSort(arr, 'black')[arr.length - 1]
        };
        //清空上次分析结果
        this.typeCount = {'black': {}, 'white': {}};
        //将所有棋子设为未分析
        arr.forEach(value => value.analyze = [false, false, false, false]);
        //分析每个棋子
        arr.forEach(value => this.typeAnalyze(value.row, value.col));
        //console.log(gameFlag%2 ? 'black' : 'white');
        this.debug.count++;
        let typeCount = this.typeCount,
            WValue = 0,
            BValue = 0;

        //两个冲四等于一个活四
        if(typeCount['white']['4'] > 1) typeCount['white']['5'] = typeCount['white']['5'] ? ++typeCount['white']['5'] : 0;
        if(typeCount['black']['4'] > 1) typeCount['black']['5'] = typeCount['black']['5'] ? ++typeCount['black']['5'] : 0;

        if(gameFlag%2){//该黑棋下
            if(this.testOver){
                return this.testResult.color === 'black' ? 10000 : -10000;
            }
            //活四,黑胜返回极值
            if(typeCount['black']['6']) return 9990;

            //冲四,黑胜返回极值
            if(typeCount['black']['5']) return 9980;

            //活四,白胜返回极值
            if(typeCount['white']['6']) return -9970;

            //冲四并活三,白胜返回极值
            if(typeCount['white']['5'] && typeCount['white']['4']) return -9960;

            //黑活三,白无四。黑胜返回极值
            if(typeCount['black']['4'] && !typeCount['white']['5']) return 9950;

            //白的活三多于一个,而黑无四和三,白胜返回极值
            if(typeCount['white']['4'] > 1 && !typeCount['black']['6'] && !typeCount['black']['5'] && !typeCount['black']['4']) return -9940;

            if(typeCount['black']['4'] > 1){
                //黑的活三多于一个,黑棋价值加2000
                BValue += 2000;
            }else if(typeCount['black']['4']){
                //否则黑棋价值加200
                BValue += 200;
            }

            if(typeCount['white']['4'] > 1){
                //白的活三多于一个,白棋价值加 500
                WValue += 500;
            }else if(typeCount['white']['4']){
                //否则白棋价值加100
                WValue += 100;
            }

        }else{
            if(this.testOver){
                return this.testResult.color === 'black' ? -10000 : 10000;
            }
            //活四,白胜返回极值
            if(typeCount['white']['6']) return 9990;

            //冲四,白胜返回极值
            if(typeCount['white']['5']) return 9980;

            //白无冲四活四,而黑有活四,黑胜返回极值
            if(typeCount['black']['6']) return -9970;

            //黑有冲四和活三,黑胜返回极值
            if(typeCount['black']['5'] && typeCount['black']['4']) return -9960;

            //白有活三而黑没有四,白胜返回极值
            if(typeCount['white']['4'] && !typeCount['black']['5']) return 9950;

            //黑的活三多于一个,而白无四和三,黑胜返回极值
            if(typeCount['black']['4'] > 1 && !typeCount['white']['6'] && !typeCount['white']['5'] && !typeCount['white']['4']) return -9940;

            if(typeCount['white']['4'] > 1){
                //白活三多于一个,白棋价值加2000
                BValue += 2000;
            }else if(typeCount['white']['4']){
                //否则白棋价值加200
                BValue += 200;
            }

            if(typeCount['black']['4'] > 1){
                //黑的活三多于一个,黑棋价值加500
                WValue += 500;
            }else if(typeCount['black']['4']){
                //否则黑棋价值加100
                WValue += 100;
            }
        }
        //每个眠三加10
        if(typeCount['white']['3']) WValue += typeCount['white']['3']*10;

        //每个眠三加10
        if(typeCount['black']['3']) BValue += typeCount['black']['3']*10;

        //每个活二加4
        if(typeCount['white']['2']) WValue += typeCount['white']['2']*10;

        //每个活二加4
        if(typeCount['black']['2']) BValue += typeCount['black']['2']*10;

        //每个眠二加1
        if(typeCount['white']['1']) WValue += typeCount['white']['1'];

        //每个眠二加1
        if(typeCount['black']['1']) BValue += typeCount['black']['1'];

        //位置得分
        arr.forEach((v) => {
            if(v.alive){
                let positionScore = position[v.row][v.col];
                BValue += positionScore;
                WValue += positionScore;
            }
        });

        //随机分，不然AI一直走相同的棋法
        BValue += parseFloat(Math.random().toFixed(2));

        return gameFlag%2 ? BValue - WValue : WValue - BValue;
    }
    ai(){
        this.debug.count = 1;
        this.step.length >= 10 && (this.board = 15);
        let score = this.evaluate(),
            checker = this.checker,
            result = null;
        if(score >= 9980){
            result = this.maxPoint[this.color.ai];
        }else if(score <= -9980){
            result = this.maxPoint[this.color.player];
        }else{
            //alpha-beta剪枝算法，得到最优解
            let greatChecker = this.getBestChess();
            let AlphaBeta = (depth, alpha, beta) => {
                if (depth === 0) {
                    return  this.evaluate();
                }
                let currentGreatCheck = this.getBestChess(),
                    i = currentGreatCheck.length;
                while (i--) {
                    let great = currentGreatCheck[i];
                    checker[great.row][great.col].appear();
                    if(!this.testOver) this.isTestOver(great.row, great.col);
                    //console.log('%c' + '第' + (2 - depth) + '步' + great.row + '--' +  great.col, "color:" + (depth == 2 ? 'red': 'green'));
                    this.updateScore(great.row, great.col);

                    let val = -AlphaBeta(depth - 1, -beta, -alpha);

                    checker[great.row][great.col] = new Pieces(great.row, great.col);
                    if(this.testOver && this.testResult.position === (great.row + '' + great.col)) this.testOver = false;
                    gameFlag--;
                    this.updateScore(great.row, great.col);

                    if (val >= beta) {
                        if(depth === this.deep) result = great;
                        return beta;
                    }
                    if (val > alpha) {
                        if(depth === this.deep) result = great;
                        alpha = val;
                    }
                }
                return alpha;
            };
            result = result || greatChecker[greatChecker.length - 1];
            this.debug.bestScore = AlphaBeta(this.deep, -100000, 100000);
        }
        this.debug.bestMove = result;
        this.thinking = false;
        this.playChess(result.row, result.col);
    }
    gameLoop(){
        let gameLoop = () => {
            requestAnimFrame(gameLoop);
            if(this.state.pause) return false;
            ctx.clearRect(0, 0, canWidth, canHeight);
            this.draw();
        };
        gameLoop();
    }
}
window.game = new Game;
