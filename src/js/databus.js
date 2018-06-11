let instance;

/**
 * 全局状态管理器
 */
export default class Databus {
    constructor() {
        if ( instance )
            return instance;

        instance = this;

        this.reset()
    }

    reset() {
        this.gameFlag = 1; // 每下一颗子，这个计数加一，用来判断下一步棋的颜色
        this.maxPoint = {};
        this.winner = null;
        this.board = 15; // AI遍历的宽度
        this.deep = 4; // AI遍历的深度
        this.color = {player: 'black', ai: 'white'}; // 棋手和AI的执棋颜色
        this.step = []; //已下棋子的数组
        this.alpha = 0.5;
        this.gameType = 1; // 游戏的类别
        this.state = {   // 游戏状态
            start: false,
            pause: false,
            end: false,
        };
        this.testOver = false; // 模拟下棋是否出现了游戏结束的局面
        this.testResult = null; // 模拟下棋的结果
        this.typeCount = { // 局面分析结果
            'black': {},
            'white': {}
        };
        this.debug = { // 调试
            bestMove: {
                row: 7,
                col: 7
            },
            bestScore: 0,
            count: 0
        };
        this.thinking = false;
    }

    /**
     * 获取当前玩家的颜色
     */
    getCurrentPlayerColor(){
        return this.gameFlag%2 ? 'black' : 'white'
    }

    /**
     * 当前玩家的颜色是否是黑色
     */
    isBlackPlayerCurrent (){
        return !!(this.gameFlag%2)
    }

    /**
     * 游戏类型是否是玩家和AI对战
     */
    isPlayingWithAi(){
        return this.gameType === 1
    }

    /**
     * 是否该AI下棋
     */
    isAiPlay(){
        return this.isPlayingWithAi() && this.getCurrentPlayerColor() === this.color.ai
    }

    /**
     * 游戏是否有一方获胜而结束
     */
    isGameOver(){
        let chessman = this.step[this.step.length - 1];
        let color = chessman.color;

        //如果这个棋子形成了五子连线
        if(chessman.isFiveChessman()){
            this.state.end = true;
            this.winner = color === 'black' ? '黑棋' : '白棋';
        }
    }

    /**
     * 模拟下棋是否出现了某一方获胜
     */
    isTestOver(chessman){
        if(chessman.isFiveChessman()){
            this.testOver = true;
            this.testResult = chessman;
        }
    }
}
