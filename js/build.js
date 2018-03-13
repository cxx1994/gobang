/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _set = __webpack_require__(1);

	var _set2 = _interopRequireDefault(_set);

	var _toConsumableArray2 = __webpack_require__(51);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _assign = __webpack_require__(57);

	var _assign2 = _interopRequireDefault(_assign);

	var _classCallCheck2 = __webpack_require__(61);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(62);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _world = __webpack_require__(65);

	var _score = __webpack_require__(67);

	var _arithmetic = __webpack_require__(68);

	var _game = __webpack_require__(66);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var gameFlag = 1;

	window.requestAnimFrame = function () {
	    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function ( /* function FrameRequestCallback */callback, /* DOMElement Element */element) {
	        return window.setTimeout(callback, 1000 / 60);
	    };
	}();

	var Pieces = function () {
	    function Pieces(row, col) {
	        (0, _classCallCheck3.default)(this, Pieces);

	        this.alive = false;
	        this.drawing = false;
	        this.color = '';
	        this.light = [];
	        this.team = 0;
	        this.score = {
	            'white': 0,
	            'black': 0,
	            'total': 0
	        };
	        this.analyze = [false, false, false, false];
	        this.row = row;
	        this.col = col;
	        this.x = _game.gridWidth * (.5 + col);
	        this.y = _game.gridWidth * (.5 + row);
	        this.history = null;
	    }

	    (0, _createClass3.default)(Pieces, [{
	        key: 'draw',
	        value: function draw() {
	            if (!this.alive) return false;
	            _game.ctx.save();
	            _game.ctx.beginPath();
	            _game.ctx.shadowBlur = 20;
	            _game.ctx.shadowColor = "rgba(0, 0, 0, .2)";
	            _game.ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
	            _game.ctx.strokeStyle = this.color;
	            _game.ctx.stroke();
	            var grd = _game.ctx.createRadialGradient(this.x - 5, this.y - 5, 2, this.x - 5, this.y - 5, 15);
	            grd.addColorStop(0, this.light[0]);
	            grd.addColorStop(1, this.light[1]);
	            _game.ctx.fillStyle = grd;
	            _game.ctx.fill();
	            _game.ctx.restore();
	        }
	    }, {
	        key: 'appear',
	        value: function appear() {
	            if (this.alive) return false;
	            if (gameFlag++ % 2) {
	                this.color = 'black';
	                this.light = ['#beb6b4', '#000000'];
	            } else {
	                this.color = 'white';
	                this.light = ['#ffffff', '#d5d5d5'];
	            }
	            this.alive = true;
	            return true;
	        }
	    }, {
	        key: 'save',
	        value: function save() {
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
	    }, {
	        key: 'restore',
	        value: function restore() {
	            (0, _assign2.default)(this, this.history);
	        }
	    }]);
	    return Pieces;
	}();

	var team = [];

	var Game = function () {
	    function Game() {
	        (0, _classCallCheck3.default)(this, Game);

	        this.restart();
	        this.control();
	        this.gameLoop();
	    }

	    (0, _createClass3.default)(Game, [{
	        key: 'restart',
	        value: function restart() {
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
	                end: false
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
	            (0, _world.drawBackground)();
	            //初始化所有棋子
	            for (var i = 0; i < _game.gridNum; i++) {
	                this.checker[i] = [];
	                for (var j = 0; j < _game.gridNum; j++) {
	                    this.checker[i][j] = new Pieces(i, j);
	                    this.analyze(i, j);
	                }
	            }
	        }
	    }, {
	        key: 'control',
	        value: function control() {
	            var _this = this;

	            document.getElementsByClassName('double')[0].onclick = function () {
	                _this.restart();
	                _this.gameType = 0;
	            };
	            document.getElementsByClassName('black')[0].onclick = function () {
	                _this.restart();
	                _this.gameType = 1;
	                _this.color.player = 'black';
	                _this.color.ai = 'white';
	            };
	            document.getElementsByClassName('white')[0].onclick = function () {
	                _this.restart();
	                _this.gameType = 1;
	                _this.color.player = 'white';
	                _this.color.ai = 'black';
	                _this.playChess(7, 7);
	            };
	            document.getElementsByClassName('back')[0].onclick = function () {
	                if (_this.thinking) return false;
	                _this.back();
	                if (_this.gameType) _this.back();
	            };
	            //点击下棋
	            _game.canvas.addEventListener('mousedown', function (e) {
	                //AI运算中，禁止落子
	                if (_this.thinking) return;
	                var row = ~~((e.offsetY - _game.pading) / _game.gridWidth),
	                    col = ~~((e.offsetX - _game.pading) / _game.gridWidth);
	                if (14 < row || row < 0 || 14 < col || col < 0) return;
	                if (e.button == 2) {
	                    _this.analyze(row, col, true);
	                } else {
	                    //点击位置着棋
	                    _this.playChess(row, col, true);
	                }
	            });
	        }
	    }, {
	        key: 'playChess',
	        value: function playChess(row, col, ai) {
	            var _this2 = this;

	            var pieces = this.checker[row][col];

	            //如果当前棋子已经落下或者游戏已经结束，返回
	            if (pieces.alive || this.state.end) return false;

	            //棋子落下
	            pieces.appear();

	            //记录步骤
	            this.step.push(pieces);

	            //判断游戏是否结束
	            this.isWin(row, col);

	            //更新当前棋子落下后当前位置和周围位置的分数
	            this.updateScore(row, col);

	            //如果是人机，AI思考后着棋
	            if (this.gameType === 1 && ai && !this.state.end) {
	                this.thinking = true;
	                setTimeout(function () {
	                    _this2.ai();
	                }, 20);
	            }
	        }
	    }, {
	        key: 'back',
	        value: function back() {
	            var lastStep = this.step[this.step.length - 1];
	            if (lastStep) {
	                this.checker[lastStep.row][lastStep.col] = new Pieces(lastStep.row, lastStep.col);
	                this.updateScore(lastStep.row, lastStep.col);
	                this.step.pop();
	                gameFlag--;
	            }
	        }
	    }, {
	        key: 'isWin',
	        value: function isWin(x, y) {
	            var chess = this.checker[x][y];
	            var color = chess.color;

	            if (chess.score[color] >= _score.rules[0].score) {
	                this.state.end = true;
	                this.winner = color == 'black' ? '黑棋' : '白棋';
	            }
	        }
	    }, {
	        key: 'isTestOver',
	        value: function isTestOver(x, y) {
	            var chess = this.checker[x][y],
	                color = chess.color;
	            if (chess.score[color] >= _score.rules[0].score) {
	                this.testOver = true;
	                this.testResult = {
	                    color: color,
	                    position: x + '' + y
	                };
	            }
	        }
	    }, {
	        key: 'draw',
	        value: function draw() {
	            _game.ctx.save();
	            _game.ctx.translate(_game.pading, _game.pading);
	            //绘制棋子
	            this.step.map(function (v) {
	                return v.draw();
	            });
	            //绘制最后一个着棋点
	            var lastStep = this.step[this.step.length - 1];
	            if (lastStep) {
	                _game.ctx.save();
	                _game.ctx.fillStyle = "red";
	                _game.ctx.fillRect(lastStep.x - 1, lastStep.y - 5, 2, 10);
	                _game.ctx.fillRect(lastStep.x - 5, lastStep.y - 1, 10, 2);
	                _game.ctx.restore();
	            }
	            _game.ctx.restore();
	            _game.ctx.save();
	            //绘制debug
	            _game.ctx.fillStyle = 'rgba(0,0,0,.8)';
	            _game.ctx.fillRect(_game.canWidth - 130, 0, 130, 130);
	            var left = _game.canWidth - 130 + 8;
	            _game.ctx.font = "14px Arial";
	            _game.ctx.fillStyle = '#dddddd';
	            _game.ctx.fillText('\u641C\u7D22\u6DF1\u5EA6: ' + this.deep, left, 20);
	            _game.ctx.fillText('\u641C\u7D22\u5E7F\u5EA6: ' + this.board, left, 40);
	            _game.ctx.fillText('\u641C\u7D22\u4E2A\u6570: ' + this.debug.count, left, 60);
	            _game.ctx.fillText('\u6700\u4F73\u5206\u6570: ' + this.debug.bestScore, left, 80);
	            _game.ctx.fillText('\u6700\u4F73\u7740\u6CD5: ' + (_game.manual[this.debug.bestMove.col] + this.debug.bestMove.row), left, 100);
	            _game.ctx.fillText('\u6E38\u620F\u76D1\u542C: ' + Math.random().toFixed(5), left, 120);
	            //游戏结束绘制GameOver
	            if (this.state.end) {
	                this.alpha += 0.005;
	                if (this.alpha > 1) this.alpha = 1;
	                _game.ctx.font = "34px Arial";
	                _game.ctx.fillStyle = 'rgba(255,0,0,' + this.alpha + ')';
	                _game.ctx.fillText(this.winner + '\u80DC!', _game.canvas.width * 0.5 - 100, _game.canvas.height * 0.5);
	            }
	            //绘制ai思考中
	            if (this.thinking) {
	                _game.ctx.font = "20px Arial";
	                _game.ctx.fillStyle = "#ff0000";
	                _game.ctx.fillText("AI思考中...", _game.canvas.width * 0.5 - 100, _game.canvas.height * 0.5);
	            }
	            _game.ctx.restore();
	        }
	    }, {
	        key: 'analyze',
	        value: function analyze(row, col, seacher) {
	            var checker = this.checker;
	            if (!checker[row] || !checker[row][col]) return false;
	            checker[row][col].team = 0;
	            if (checker[row][col].alive) {
	                checker[row][col].score.total = -10000;
	                checker[row][col].score.white = -5000;
	                checker[row][col].score.black = -5000;
	                return false;
	            }

	            var score = checker[row][col].score,
	                both = { 'white': [], 'black': [] },
	                nearPoint = [[], [], [], []];
	            (0, _assign2.default)(score, { 'white': 0, 'black': 0, 'total': 0 });
	            //查找当前棋子四个方向上长度为4的所有棋子
	            for (var j = 0; j < 9; j++) {
	                //  -- 方向
	                nearPoint[0].push(checker[row][col - 4 + j]);
	                //   | 方向
	                nearPoint[1].push(checker[row - 4 + j] ? checker[row - 4 + j][col] : null);
	                //   / 方向
	                nearPoint[2].push(checker[row + 4 - j] ? checker[row + 4 - j][col - 4 + j] : null);
	                //   \ 方向
	                nearPoint[3].push(checker[row - 4 + j] ? checker[row - 4 + j][col - 4 + j] : null);
	            }
	            if (seacher) console.log('%c' + row + '-' + col, "color:green");
	            var de = ['-', '|', '/', "\\"];
	            var onceTest = function onceTest(color, arr, num) {
	                var test = [],
	                    leftDead = -1,
	                    rightDead = 9,
	                    score = 0,
	                    team = 0;
	                arr.map(function (value, index) {
	                    if (value && !value.alive) {
	                        test[index] = 0;
	                    } else if (value && value.alive && value.color == color) {
	                        test[index] = 1;
	                    } else {
	                        test[index] = 2;
	                        if (index < 4) {
	                            leftDead = index;
	                        } else if (rightDead > index) {
	                            rightDead = index;
	                        }
	                    }
	                });
	                test[4] = 1;
	                test = test.join('');
	                if (rightDead - leftDead < 6) {
	                    //死棋，两边被堵住，永远不能形成五子
	                    score = _score.rules[_score.rules.length - 1].score;
	                } else {
	                    for (var index = 0; index < _score.rules.length; index++) {
	                        var _value = _score.rules[index].test;
	                        for (var i = 0; i < _value.length; i++) {
	                            var value = _value[i];
	                            if (test.indexOf(value) > -1) {
	                                score += _score.rules[index].score;
	                                team = _score.rules[index].team;
	                                checker[row][col].team = team == 4 ? 4 : 0;
	                                break;
	                            }
	                        }
	                        if (score != 0) break;
	                    }
	                }
	                if (seacher) console.log(de[num] + " 方向" + "--" + test + '--score--' + score);
	                return { score: score, team: team };
	            };
	            var complate = function complate(color) {
	                if (seacher) console.log("%c-------" + color + "------", "color:red");
	                for (var i = 0; i < 4; i++) {
	                    var result = onceTest(color, nearPoint[i], i);
	                    if (result.score > score[color]) score[color] = result.score;
	                    result.team && both[color].push(result.team);
	                }
	                //如果存在两个以上的棋形，则根据组合棋形加分
	                if (both[color].length > 1) {
	                    var bothTest = both[color].sort().join('');
	                    for (var _i = 0; _i < _score.bothRules.length; _i++) {
	                        if (bothTest.indexOf(_score.bothRules[_i].test) > -1) {
	                            if (seacher) console.log("组合得分" + "--" + _score.bothRules[_i].test + '--score--' + _score.bothRules[_i].score);
	                            if (_score.bothRules[_i].score > score[color]) score[color] = _score.bothRules[_i].score;
	                            break;
	                        }
	                    }
	                }
	                //加上位置分
	                score[color] += _score.position[row][col];
	                score[color] += Math.random();
	                if (seacher) console.log("位置得分--" + _score.position[row][col]);
	                if (seacher) console.log("最后得分--" + score[color]);
	            };
	            complate('white');
	            complate('black');
	            score.total = score.white + score.black;
	        }
	    }, {
	        key: 'typeAnalyze',
	        value: function typeAnalyze(row, col) {
	            var _this3 = this;

	            var checker = this.checker;
	            if (!checker[row] || !checker[row][col] || !checker[row][col].alive) return false;
	            var chess = checker[row][col],
	                nearPoint = [[], [], [], []];
	            //查找当前棋子四个方向上长度为4的所有棋子
	            for (var j = 0; j < 9; j++) {
	                //  -- 方向
	                nearPoint[0].push(checker[row][col - 4 + j]);
	                //   | 方向
	                nearPoint[1].push(checker[row - 4 + j] ? checker[row - 4 + j][col] : null);
	                //   / 方向
	                nearPoint[2].push(checker[row + 4 - j] ? checker[row + 4 - j][col - 4 + j] : null);
	                //   \ 方向
	                nearPoint[3].push(checker[row - 4 + j] ? checker[row - 4 + j][col - 4 + j] : null);
	            }
	            var onceTest = function onceTest(arr, num) {
	                var color = arr[4].color,
	                    test = [],
	                    leftDead = -1,
	                    rightDead = 9,
	                    success = false;
	                arr.map(function (value, index) {
	                    if (value && !value.alive) {
	                        test[index] = 0;
	                    } else if (value && value.alive && value.color == color && !value.analyze[num]) {
	                        test[index] = 1;
	                    } else {
	                        test[index] = 2;
	                        if (index < 4) {
	                            leftDead = index;
	                        } else if (rightDead > index) {
	                            rightDead = index;
	                        }
	                    }
	                });
	                test = test.join('');
	                if (rightDead - leftDead >= 6) {
	                    //不是死棋
	                    for (var index = 0; index < _score.rules.length; index++) {
	                        var _value = _score.rules[index].test;
	                        for (var i = 0; i < _value.length; i++) {
	                            var value = _value[i],
	                                sIndex = test.indexOf(value);
	                            if (sIndex > -1) {
	                                success = true;
	                                var count = _this3.typeCount[color],
	                                    _team = _score.rules[index].team;
	                                count[_team] = count[_team] ? ++count[_team] : 1;
	                                for (var _j = 0; _j < 5; _j++) {
	                                    if (arr[sIndex + _j] && arr[sIndex + _j].color == color) arr[sIndex + _j].analyze[num] = true;
	                                }
	                                break;
	                            }
	                        }
	                        if (success) break;
	                    }
	                }
	            };
	            for (var i = 0; i < 4; i++) {
	                if (!chess.analyze[i]) {
	                    onceTest(nearPoint[i], i);
	                    chess.analyze[i] = true;
	                }
	            }
	        }
	    }, {
	        key: 'updateScore',
	        value: function updateScore(row, col) {
	            //落下一子会影响周围距离为4的所有落子点的分数，所以更新当前落子点周围的落子点分数
	            for (var i = 0; i < 9; i++) {
	                for (var j = 0; j < 9; j++) {
	                    this.analyze(row - 4 + i, col - 4 + j);
	                }
	            }
	        }
	    }, {
	        key: 'getBestChess',
	        value: function getBestChess() {
	            //将二维数组中的棋子写入一维数组
	            var poicesArr = [].concat.apply([], this.checker),

	            //根据总分排序，然后选取排名靠前的落子点（长度为设置的board值）
	            greatChecker = (0, _arithmetic.bubbleSort)(poicesArr, 'total').slice(poicesArr.length - this.board);
	            //将可以形成冲4的落子点加入最优数组
	            poicesArr.forEach(function (v) {
	                return v.team == 4 && greatChecker.unshift(v);
	            });
	            //去重后返回
	            return [].concat((0, _toConsumableArray3.default)(new _set2.default(greatChecker)));
	        }
	    }, {
	        key: 'evaluate',
	        value: function evaluate() {
	            var _this4 = this;

	            //将二维数组中的棋子写入一维数组
	            var arr = [].concat.apply([], this.checker);
	            //对落子点落白子和落黑子的分数分别进行排序,然后选分别取分数最大的点
	            this.maxPoint = {
	                'white': (0, _arithmetic.bubbleSort)(arr, 'white')[arr.length - 1],
	                'black': (0, _arithmetic.bubbleSort)(arr, 'black')[arr.length - 1]
	            };
	            //清空上次分析结果
	            this.typeCount = { 'black': {}, 'white': {} };
	            //将所有棋子设为未分析
	            arr.forEach(function (value) {
	                return value.analyze = [false, false, false, false];
	            });
	            //分析每个棋子
	            arr.forEach(function (value) {
	                return _this4.typeAnalyze(value.row, value.col);
	            });
	            //console.log(gameFlag%2 ? 'black' : 'white');
	            this.debug.count++;
	            var typeCount = this.typeCount,
	                WValue = 0,
	                BValue = 0;

	            //两个冲四等于一个活四
	            if (typeCount['white']['4'] > 1) typeCount['white']['5'] = typeCount['white']['5'] ? ++typeCount['white']['5'] : 0;
	            if (typeCount['black']['4'] > 1) typeCount['black']['5'] = typeCount['black']['5'] ? ++typeCount['black']['5'] : 0;

	            if (gameFlag % 2) {
	                //该黑棋下
	                if (this.testOver) {
	                    return this.testResult.color == 'black' ? 10000 : -10000;
	                }
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
	                if (this.testOver) {
	                    return this.testResult.color == 'black' ? -10000 : 10000;
	                }
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
	            arr.forEach(function (v) {
	                if (v.alive) {
	                    var positionScore = _score.position[v.row][v.col];
	                    BValue += positionScore;
	                    WValue += positionScore;
	                }
	            });

	            //随机分，不然AI一直走相同的棋法
	            BValue += parseFloat(Math.random().toFixed(2));

	            return gameFlag % 2 ? BValue - WValue : WValue - BValue;
	        }
	    }, {
	        key: 'ai',
	        value: function ai() {
	            var _this5 = this;

	            this.debug.count = 1;
	            this.step.length >= 10 && (this.board = 15);
	            var score = this.evaluate(),
	                checker = this.checker,
	                result = null;
	            if (score >= 9980) {
	                result = this.maxPoint[this.color.ai];
	            } else if (score <= -9980) {
	                result = this.maxPoint[this.color.player];
	            } else {
	                //alpha-beta剪枝算法，得到最优解
	                var greatChecker = this.getBestChess();
	                var AlphaBeta = function AlphaBeta(depth, alpha, beta) {
	                    if (depth == 0) {
	                        return _this5.evaluate();
	                    }
	                    var currentGreatCheck = _this5.getBestChess(),
	                        i = currentGreatCheck.length;
	                    while (i--) {
	                        var great = currentGreatCheck[i];
	                        checker[great.row][great.col].appear();
	                        if (!_this5.testOver) _this5.isTestOver(great.row, great.col);
	                        //console.log('%c' + '第' + (2 - depth) + '步' + great.row + '--' +  great.col, "color:" + (depth == 2 ? 'red': 'green'));
	                        _this5.updateScore(great.row, great.col);

	                        var val = -AlphaBeta(depth - 1, -beta, -alpha);

	                        checker[great.row][great.col] = new Pieces(great.row, great.col);
	                        if (_this5.testOver && _this5.testResult.position == great.row + '' + great.col) _this5.testOver = false;
	                        gameFlag--;
	                        _this5.updateScore(great.row, great.col);

	                        if (val >= beta) {
	                            if (depth === _this5.deep) result = great;
	                            return beta;
	                        }
	                        if (val > alpha) {
	                            if (depth === _this5.deep) result = great;
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
	    }, {
	        key: 'gameLoop',
	        value: function gameLoop() {
	            var _this6 = this;

	            var gameLoop = function gameLoop() {
	                requestAnimFrame(gameLoop);
	                if (_this6.state.pause) return false;
	                _game.ctx.clearRect(0, 0, _game.canWidth, _game.canHeight);
	                _this6.draw();
	            };
	            gameLoop();
	        }
	    }]);
	    return Game;
	}();

	window.game = new Game();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(2), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(28);
	__webpack_require__(35);
	__webpack_require__(49);
	module.exports = __webpack_require__(12).Set;

/***/ },
/* 3 */
/***/ function(module, exports) {

	

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(5)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(8)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(6)
	  , defined   = __webpack_require__(7);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(9)
	  , $export        = __webpack_require__(10)
	  , redefine       = __webpack_require__(15)
	  , hide           = __webpack_require__(16)
	  , has            = __webpack_require__(21)
	  , Iterators      = __webpack_require__(22)
	  , $iterCreate    = __webpack_require__(23)
	  , setToStringTag = __webpack_require__(24)
	  , getProto       = __webpack_require__(17).getProto
	  , ITERATOR       = __webpack_require__(25)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , methods, key;
	  // Fix native
	  if($native){
	    var IteratorPrototype = getProto($default.call(new Base));
	    // Set @@toStringTag to native iterators
	    setToStringTag(IteratorPrototype, TAG, true);
	    // FF fix
	    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    // fix Array#{values, @@iterator}.name in V8 / FF
	    if(DEF_VALUES && $native.name !== VALUES){
	      VALUES_BUG = true;
	      $default = function values(){ return $native.call(this); };
	    }
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES  ? $default : getMethod(VALUES),
	      keys:    IS_SET      ? $default : getMethod(KEYS),
	      entries: !DEF_VALUES ? $default : getMethod('entries')
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(11)
	  , core      = __webpack_require__(12)
	  , ctx       = __webpack_require__(13)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$export.F = 1;  // forced
	$export.G = 2;  // global
	$export.S = 4;  // static
	$export.P = 8;  // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	module.exports = $export;

/***/ },
/* 11 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 12 */
/***/ function(module, exports) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(14);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(17)
	  , createDesc = __webpack_require__(18);
	module.exports = __webpack_require__(19) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(20)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(17)
	  , descriptor     = __webpack_require__(18)
	  , setToStringTag = __webpack_require__(24)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(16)(IteratorPrototype, __webpack_require__(25)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(17).setDesc
	  , has = __webpack_require__(21)
	  , TAG = __webpack_require__(25)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(26)('wks')
	  , uid    = __webpack_require__(27)
	  , Symbol = __webpack_require__(11).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(11)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(29);
	var Iterators = __webpack_require__(22);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(30)
	  , step             = __webpack_require__(31)
	  , Iterators        = __webpack_require__(22)
	  , toIObject        = __webpack_require__(32);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(8)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(33)
	  , defined = __webpack_require__(7);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(34);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(36);

	// 23.2 Set Objects
	__webpack_require__(48)('Set', function(get){
	  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function add(value){
	    return strong.def(this, value = value === 0 ? 0 : value, value);
	  }
	}, strong);

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $            = __webpack_require__(17)
	  , hide         = __webpack_require__(16)
	  , redefineAll  = __webpack_require__(37)
	  , ctx          = __webpack_require__(13)
	  , strictNew    = __webpack_require__(38)
	  , defined      = __webpack_require__(7)
	  , forOf        = __webpack_require__(39)
	  , $iterDefine  = __webpack_require__(8)
	  , step         = __webpack_require__(31)
	  , ID           = __webpack_require__(27)('id')
	  , $has         = __webpack_require__(21)
	  , isObject     = __webpack_require__(42)
	  , setSpecies   = __webpack_require__(47)
	  , DESCRIPTORS  = __webpack_require__(19)
	  , isExtensible = Object.isExtensible || isObject
	  , SIZE         = DESCRIPTORS ? '_s' : 'size'
	  , id           = 0;

	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!$has(it, ID)){
	    // can't set id to frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add id
	    if(!create)return 'E';
	    // add missing object id
	    hide(it, ID, ++id);
	  // return object id with prefix
	  } return 'O' + it[ID];
	};

	var getEntry = function(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index !== 'F')return that._i[index];
	  // frozen object case
	  for(entry = that._f; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	};

	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      strictNew(that, C, NAME);
	      that._i = $.create(null); // index
	      that._f = undefined;      // first entry
	      that._l = undefined;      // last entry
	      that[SIZE] = 0;           // size
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear(){
	        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that._f == entry)that._f = next;
	          if(that._l == entry)that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */){
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
	          , entry;
	        while(entry = entry ? entry.n : this._f){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if(DESCRIPTORS)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that._f)that._f = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index !== 'F')that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function(C, NAME, IS_MAP){
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function(iterated, kind){
	      this._t = iterated;  // target
	      this._k = kind;      // kind
	      this._l = undefined; // previous
	    }, function(){
	      var that  = this
	        , kind  = that._k
	        , entry = that._l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if(kind == 'keys'  )return step(0, entry.k);
	      if(kind == 'values')return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(15);
	module.exports = function(target, src){
	  for(var key in src)redefine(target, key, src[key]);
	  return target;
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(13)
	  , call        = __webpack_require__(40)
	  , isArrayIter = __webpack_require__(43)
	  , anObject    = __webpack_require__(41)
	  , toLength    = __webpack_require__(44)
	  , getIterFn   = __webpack_require__(45);
	module.exports = function(iterable, entries, fn, that){
	  var iterFn = getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    call(iterator, f, step.value, entries);
	  }
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(41);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(42);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(22)
	  , ITERATOR   = __webpack_require__(25)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(6)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(46)
	  , ITERATOR  = __webpack_require__(25)('iterator')
	  , Iterators = __webpack_require__(22);
	module.exports = __webpack_require__(12).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(34)
	  , TAG = __webpack_require__(25)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var core        = __webpack_require__(12)
	  , $           = __webpack_require__(17)
	  , DESCRIPTORS = __webpack_require__(19)
	  , SPECIES     = __webpack_require__(25)('species');

	module.exports = function(KEY){
	  var C = core[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(17)
	  , global         = __webpack_require__(11)
	  , $export        = __webpack_require__(10)
	  , fails          = __webpack_require__(20)
	  , hide           = __webpack_require__(16)
	  , redefineAll    = __webpack_require__(37)
	  , forOf          = __webpack_require__(39)
	  , strictNew      = __webpack_require__(38)
	  , isObject       = __webpack_require__(42)
	  , setToStringTag = __webpack_require__(24)
	  , DESCRIPTORS    = __webpack_require__(19);

	module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
	  var Base  = global[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
	    new C().entries().next();
	  }))){
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	  } else {
	    C = wrapper(function(target, iterable){
	      strictNew(target, C, NAME);
	      target._c = new Base;
	      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','),function(KEY){
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
	        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return IS_ADDER ? this : result;
	      });
	    });
	    if('size' in proto)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return this._c.size;
	      }
	    });
	  }

	  setToStringTag(C, NAME);

	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F, O);

	  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

	  return C;
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(10);

	$export($export.P, 'Set', {toJSON: __webpack_require__(50)('Set')});

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var forOf   = __webpack_require__(39)
	  , classof = __webpack_require__(46);
	module.exports = function(NAME){
	  return function toJSON(){
	    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
	    var arr = [];
	    forOf(this, false, arr.push, arr);
	    return arr;
	  };
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _from = __webpack_require__(52);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }

	    return arr2;
	  } else {
	    return (0, _from2.default)(arr);
	  }
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(53), __esModule: true };

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(54);
	module.exports = __webpack_require__(12).Array.from;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx         = __webpack_require__(13)
	  , $export     = __webpack_require__(10)
	  , toObject    = __webpack_require__(55)
	  , call        = __webpack_require__(40)
	  , isArrayIter = __webpack_require__(43)
	  , toLength    = __webpack_require__(44)
	  , getIterFn   = __webpack_require__(45);
	$export($export.S + $export.F * !__webpack_require__(56)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , $$      = arguments
	      , $$len   = $$.length
	      , mapfn   = $$len > 1 ? $$[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        result[index] = mapping ? mapfn(O[index], index) : O[index];
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(7);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(25)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(58), __esModule: true };

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(59);
	module.exports = __webpack_require__(12).Object.assign;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(10);

	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(60)});

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.1 Object.assign(target, source, ...)
	var $        = __webpack_require__(17)
	  , toObject = __webpack_require__(55)
	  , IObject  = __webpack_require__(33);

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = __webpack_require__(20)(function(){
	  var a = Object.assign
	    , A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , $$    = arguments
	    , $$len = $$.length
	    , index = 1
	    , getKeys    = $.getKeys
	    , getSymbols = $.getSymbols
	    , isEnum     = $.isEnum;
	  while($$len > index){
	    var S      = IObject($$[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  }
	  return T;
	} : Object.assign;

/***/ },
/* 61 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _defineProperty = __webpack_require__(63);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(64), __esModule: true };

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(17);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.drawBackground = undefined;

	var _game = __webpack_require__(66);

	//绘制游戏背景,并定义按钮样式

	var bgCanvas = document.createElement("canvas"),
	    ctx = bgCanvas.getContext("2d"),
	    padingLeft = _game.pading + _game.gridWidth / 2 - 0.5;

	bgCanvas.width = _game.canWidth;
	bgCanvas.height = _game.canHeight;

	_game.canvas.parentNode.insertBefore(bgCanvas, _game.canvas);

	var buttons = {
	    gameType: {
	        width: 100,
	        height: 30,
	        left: 540,
	        top: 100,
	        text: '双人游戏',
	        color: {
	            border: 'black',
	            background: 'red',
	            hover: 'blue'
	        }
	    }
	};

	function drawBackground() {
	    //绘制背景
	    ctx.save();
	    ctx.fillStyle = "#dbb89a";
	    ctx.fillRect(0, 0, _game.canWidth, _game.canHeight);
	    ctx.translate(padingLeft, padingLeft);
	    //绘制游戏格子
	    ctx.font = "14px Arial";
	    ctx.fillStyle = "#333333";
	    ctx.lineWidth = 1;
	    for (var i = 0; i < _game.gridNum; i++) {
	        var g = _game.gridWidth * i;
	        ctx.moveTo(0, g);
	        ctx.lineTo(_game.gridWidth * (_game.gridNum - 1), g);
	        ctx.stroke();
	        ctx.fillText(i, -(padingLeft + ctx.measureText(i).width) / 2, g + 5);
	        ctx.moveTo(g, 0);
	        ctx.lineTo(g, _game.gridWidth * (_game.gridNum - 1));
	        ctx.stroke();
	        ctx.fillText(_game.manual[i], g - ctx.measureText(_game.manual[i]).width / 2, -10);
	    }
	    var pointWidth = 9,
	        half = Math.floor(pointWidth / 2);
	    ctx.translate(-half - 0.5, -half - 0.5);
	    ctx.fillStyle = "#333333";
	    ctx.fillRect(_game.gridWidth * 3, _game.gridWidth * 3, pointWidth, pointWidth);
	    ctx.fillRect(_game.gridWidth * 11, _game.gridWidth * 3, pointWidth, pointWidth);
	    ctx.fillRect(_game.gridWidth * 7, _game.gridWidth * 7, pointWidth, pointWidth);
	    ctx.fillRect(_game.gridWidth * 3, _game.gridWidth * 11, pointWidth, pointWidth);
	    ctx.fillRect(_game.gridWidth * 11, _game.gridWidth * 11, pointWidth, pointWidth);
	    ctx.restore();
	    return;
	    //绘制按钮
	    var color = buttons.gameType.color;
	    ctx.fillStyle = color.background;
	    ctx.strokeStyle = color.border;
	    ctx.fillRect(buttons.gameType.left, buttons.gameType.top, buttons.gameType.width, buttons.gameType.height);
	    ctx.fillStyle = "#ffffff";
	    ctx.font = "20px Arial";
	    ctx.fillText(buttons.gameType.text, buttons.gameType.left + (buttons.gameType.width - ctx.measureText(buttons.gameType.text).width) / 2, buttons.gameType.top + 22);
	}
	exports.drawBackground = drawBackground;

/***/ },
/* 66 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var canvas = document.getElementById("myGame");
	var ctx = canvas.getContext("2d");
	var canWidth = canvas.width;
	var canHeight = canvas.height;
	var pading = 20;
	var gridWidth = 36; //棋盘格子的宽高（带一边的线宽）
	var gridNum = 15; //每一行(列)的棋盘交点数
	var manual = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']; //棋谱生成需要
	exports.canvas = canvas;
	exports.ctx = ctx;
	exports.canWidth = canWidth;
	exports.canHeight = canHeight;
	exports.pading = pading;
	exports.gridWidth = gridWidth;
	exports.gridNum = gridNum;
	exports.manual = manual;

/***/ },
/* 67 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	//判断组合棋形
	//双冲4、冲4活3 10000分 (team 5+5 || 5+4)
	//双活3         5000分 (team 4+4)
	//活3眠3、活3活2 1000分 (team 4+3 || 4+2)
	//双活2          100分 (team 2+2)
	//活2眠2          10分 (team 2+1)
	var bothRules = [{
	    test: '46',
	    score: 20000
	}, {
	    test: '55',
	    score: 11000
	}, {
	    test: '45',
	    score: 11000
	}, {
	    test: '44',
	    score: 5000
	}, {
	    test: '35',
	    score: 500
	}, {
	    test: '34',
	    score: 1000
	}, {
	    test: '22',
	    score: 100
	}, {
	    test: '12',
	    score: 10
	}];

	//判断单一棋形
	var rules = [{ //五子长联
	    test: ['11111'],
	    team: 7,
	    score: 30000
	}, { //活四
	    test: ['011110'],
	    team: 6,
	    score: 10000
	}, { //冲四
	    test: ['011112', '211110', '10111', '11101', '11011'],
	    team: 5,
	    score: 200
	}, { //活三
	    test: ['001110', '011100', '010110', '011010'],
	    team: 4,
	    score: 200
	}, { //眠三
	    test: ['001112', '211100', '010112', '211010', '011012', '210110', '10011', '11001', '10101', '2011102'],
	    team: 3,
	    score: 50
	}, { //活二
	    test: ['001100', '011000', '000110', '001010', '010100', '010010'],
	    team: 2,
	    score: 5
	}, { //眠二
	    test: ['000112', '211000', '001012', '210100', '010012', '210010', '10001', '2010102', '2011002'],
	    team: 1,
	    score: 3
	}, { //死棋
	    test: ['2xxxx2'],
	    team: 0,
	    score: -5
	}];
	//位置得分
	var position = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0], [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0], [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0], [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0], [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
	exports.bothRules = bothRules;
	exports.rules = rules;
	exports.position = position;

/***/ },
/* 68 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	//冒泡排序
	function bubbleSort(arr, prop) {
	    var l = arr.length,
	        j = void 0,
	        temp = void 0;
	    while (l > 0) {
	        for (j = 0; j < l - 1; j++) {
	            if (arr[j]['score'][prop] > arr[j + 1]['score'][prop]) {
	                temp = arr[j];
	                arr[j] = arr[j + 1];
	                arr[j + 1] = temp;
	            }
	        }
	        l--;
	    }
	    return arr;
	}
	//快速排序(是目前基于比较的内部排序中被认为是最好的方法，当待排序的关键字是随机分布时，快速排序的平均时间最短；)
	function quickSort(array, prop) {
	    //一次排序，将数组的第一个元素放置在左边元素都比其小右边元素都比其大的位置
	    function sort(prev, numsize) {
	        var nonius = prev,
	            j = numsize - 1,
	            flag = array[prev];
	        //一次排序的数组长度要大于1
	        if (numsize - prev > 1) {
	            while (nonius < j) {
	                for (; nonius < j; j--) {
	                    //在数组右边查找比当前排序元素小的值
	                    if (array[j]['score'][prop] < flag['score'][prop]) {
	                        array[nonius++] = array[j];
	                        break;
	                    }
	                }
	                for (; nonius < j; nonius++) {
	                    //在数组左边查找比当前排序元素大的值
	                    if (array[nonius]['score'][prop] > flag['score'][prop]) {
	                        array[j--] = array[nonius];
	                        break;
	                    }
	                }
	            }
	            //一次排序完成
	            array[nonius] = flag;
	            //对已经完成排序元素的左边元素和右边元素分别再进行排序
	            sort(0, nonius);
	            sort(nonius + 1, numsize);
	        }
	    }
	    sort(0, array.length);
	    return array;
	}

	//归并算法
	function merge(left, right) {
	    var result = [];
	    while (left.length > 0 && right.length > 0) {
	        if (left[0].total < right[0].total) {
	            result.push(left.shift());
	        } else {
	            result.push(right.shift());
	        }
	    }
	    return result.concat(left).concat(right);
	}

	exports.quickSort = quickSort;
	exports.bubbleSort = bubbleSort;
	exports.merge = merge;

/***/ }
/******/ ]);