/**
 * @description  基于IScroll实现的下拉刷新
 * @author dailc
 * @version 4.0
 * @time 2017-03-25
 * 皮肤类只会实现UI相关的hook函数
 * 皮肤 type3 ，
 * 下拉刷新动画用canvas动画球
 * 依赖 PullToRefresh_Skin_Css
 */
(function(exports) {
     var CommonTools = require('CommonTools_Core');
	var PullToRefreshBase = require('PullToRefresh_Core');
	/**
	 * 全局参数
	 */
	var CLASS_HIDDEN = 'hidden';

	/**
	 * 默认的设置参数
	 */
	var defaultSettingOptions = {
		//下拉有关
		down: {
			//下拉要大于多少长度后再下拉刷新
			height: 75,
			contentdown: '下拉可以刷新', //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
			contentover: '释放立即刷新', //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
			contentrefresh: '正在刷新', //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
			contentrefreshsuccess: '刷新成功', //可选，刷新成功的提示
			contentrefresherror: '刷新失败', //可选，刷新失败的提示-错误回调用到
			isSuccessTips: true,
			callback: CommonTools.noop,
			tips: {
				colors: ['d00324','e47012', '9aea1c'],
				size: 200, //width=height=size;x=y=size/2;radius=size/4
				lineWidth: 15,
				duration: 1000,
				tail_duration: 1000 * 2.5
			}
		},
		//上拉有关
		up: {
			//是否自动上拉加载-初始化是是否自动
			auto: false,
			//距离底部高度(到达该高度即触发)
			offset: 100,
			contentdown: '上拉显示更多',
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: CommonTools.noop
		},
		//IScroll配置相关
		scroll: {
			bounceTime: 500, //回弹动画时间
			//下拉刷新和上拉加载成功动画的时间
			successAnimationTime: 500
		},
		//注意,传给Mui时可以传 #id形式或者是  原生dom对象
		element: '#pullrefresh'
	};

	//创建一个Class对象
	//只需要关注默认的UI实现即可
	var PullToRefresh = PullToRefreshBase.PullToRefresh.extend({

		/*************************************
		 * 需要实现的实际效果
		 * 如果不像实现，可以设为null
		 * *************************/
		/**
		 * @description 生成下拉刷新提示，这个需要被具体实现
		 * 这个默认实现就直接在一个函数里面同时生成下拉和上拉提示了
		 */
		_initPullToRefreshTipsHook: function(enablePullDown, enablePullUp) {
			this._initPocket();
			this._checkHidden(enablePullDown, enablePullUp);
		},

		_checkHidden: function(enablePullDown, enablePullUp) {
			if(!enablePullUp) {
				this.bottomPocket&&this.bottomPocket.classList.add(CLASS_HIDDEN);
			}
			if(!enablePullDown) {
				this.topPocket&&this.topPocket.classList.add(CLASS_HIDDEN);
			}
		},

		/**
		 * @description 下拉过程中的钩子函数
		 * @param {Number} deltaY
		 * @param {Number} thresholdHeight 对应的高度阈值
		 */
		_pullingHook: function(deltaY, thresholdHeight) {
			//高度阈值
			if(deltaY >= thresholdHeight) {
				this._setCaption(true, this.options.down.contentover);
			} else if(deltaY < thresholdHeight) {
				this._setCaption(true, this.options.down.contentdown);
			}
			var ratio = Math.min(deltaY / (thresholdHeight * 3), 1);
			var ratioPI = Math.min(1, ratio * 2);
			this._drawCanvasTips(ratioPI);
			
		},
		/**
		 * @description 下拉刷新的成功动画，每次确保触发一次
		 */
		_pulldownLoaingAnimationHook: function() {
			this._drawCanvasTips(1,300);
			this.canvasUtilObj.startSpin();
			this._setCaption(true, this.options.down.contentrefresh);
		},
		/**
		 * @description 下拉刷新的成功动画-动画完毕后可能的成功提示，每次确保触发一次
		 * 比如在成功里面提示加载了多少条数据，如果不需要可以传null，会直接走到end事件里
		 * @param {Function} done 这个可以提前结束动画-如果不想要的话
		 * @param {Boolean} isSuccess 是否请求成功
		 */
		_pulldownLoaingAnimationSuccessHook: function(done, isSuccess) {
			if(this.options.down.isSuccessTips) {
				this._setCaption(true, isSuccess ? this.options.down.contentrefreshsuccess : this.options.down.contentrefresherror);
			} else {
				//否则直接没有成功提示
				done();
			}

		},
		/**
		 * @description 下拉刷新的动画完成后的回调，可以用来重置状态
		 */
		_pulldownLoaingAnimationEndHook: function() {
			this.canvasUtilObj.stopSpin();
			var self = this;
			this._setCaption(true, this.options.down.contentdown, true);
			setTimeout(function() {
				self.topPocket.style.visibility = 'hidden';
			},300);
			
		},
		
		/**
		 * @description 上拉加载的成功动画，每次确保触发一次
		 */
		_pullupLoaingAnimationHook: function(isFinished) {
			this._setCaption(false, this.options.up.contentrefresh);
		},
		/**
		 * @description 上拉加载的成功动画-动画完毕后可能的成功提示，每次确保触发一次
		 */
		_pullupLoaingAnimationSuccessHook: function(isFinished) {
			if(isFinished) {
				this._setCaption(false, this.options.up.contentnomore);
			} else {
				this._setCaption(false, this.options.up.contentdown);
			}
		},
		/**
		 * @description _disablePullUpHook
		 */
		_disablePullUpHook: function() {
			this.bottomPocket.className = 'pull-bottom-pocket' + ' ' + CLASS_HIDDEN;
		},
		/**
		 * @description disablePullUpHook
		 */
		_enablePullUpHook: function() {
			this.bottomPocket.classList.remove(CLASS_HIDDEN);
			this._setCaption(false, this.options.up.contentdown);
		},
		/*一些是UI对应的实现*/
		/**
		 * @description 初始化时绘制提示
		 * @param {Number} ratio 比例
		 * @param {Number} time 过度时间
		 */
		_drawCanvasTips: function(ratio,time) {
			time = time||0;
			this.pullDownCanvas.style.opacity = ratio;
			this.pullDownCanvas.style.webkitTransform = 'rotate(' + 300 * ratio + 'deg) scale('+ratio+','+ratio+')';
			//暂时不用过多的动画，否则会卡
			//this.pullDownCanvasContainer.style.opacity = ratio;
			//this.pullDownCanvasContainer.style.webkitTransform = 'rotate(' + 300 * ratio + 'deg) scale('+ratio+','+ratio+')';
			//this.pullDownCanvasContainer.style.webkitTransitionDuration = time+'ms';
			//this.pullDownCanvasContainer.style.webkitTransitionTimingFunction = 'ease-in';
			
			var canvas = this.pullDownCanvas;
			var ctx = this.pullDownCanvasCtx;
			var size = this.options.down.tips.size;
			ctx.lineWidth = this.options.down.tips.lineWidth;
			ctx.fillStyle = '#' + this.options.down.tips.colors[0];
			ctx.strokeStyle = '#' + this.options.down.tips.colors[0];
			ctx.stroke();
			ctx.clearRect(0, 0, size, size);
			//fixed android 4.1.x
			canvas.style.display = 'none'; // Detach from DOM
			canvas.offsetHeight; // Force the detach
			canvas.style.display = 'inherit'; // Reattach to DOM
			this.canvasUtilObj.drawArcedArrow(ctx, size / 2 + 0.5, size / 2, size / 4, 0 * Math.PI, 5 / 3 * Math.PI * ratio, false, 1, 2, 0.7853981633974483, 25, this.options.down.tips.lineWidth, this.options.down.tips.lineWidth);
		},
		/**
		 * @description 创建下拉提示
		 */
		_createTopPocket: function() {
			var self = this;
			var pocket = document.createElement('div');
			pocket.style.visibility = 'hidden';
			pocket.className = 'pull-top-pocket';
			pocket.innerHTML = '<div class="pull-loading-icon"><div class="pull-top-canvas"><canvas id="'+CommonTools.uuid()+'" class="pull-down-loading-canvas" width="' + self.options.down.tips.size + '" height="' + self.options.down.tips.size + '"></canvas></div></div><div class="pull-caption">' + this.options.down.contentdown + '</div>';
			return pocket;
		},
		/**
		 * @description 创建上拉提示
		 */
		_createBottomPocket: function() {
			var pocket = document.createElement('div');
			pocket.style.visibility = 'hidden';
			pocket.className = 'pull-bottom-pocket';
			pocket.innerHTML = '<div class="pull-block"><div class="pull-loading-icon"></div><div class="pull-caption">' + this.options.up.contentdown + '</div></div>';
			return pocket;
		},
		/**
		 * @description 初始化下拉刷新和上拉加载提示
		 */
		_initPocket: function() {
			var self = this;
			//先改变wrap的皮肤
			this.wrapper.classList.add('pulltorefresh-type3');
			var options = this.options;
			if(options.down && options.down.hasOwnProperty('callback')) {
				if(!this.topPocket) {
					this.topPocket = this._createTopPocket();

					this.scrollWrap.insertBefore(this.topPocket, this.scrollWrap.firstChild);
				}
				self.pullDownCanvasContainer = self.topPocket.querySelector('.pull-loading-icon');
				self.pullDownCanvas = self.topPocket.querySelector('.pull-down-loading-canvas');
				self.pullDownCanvasCtx = self.pullDownCanvas.getContext('2d');
				//重置颜色
				var tmp = self.options.down.tips.colors[0];
				self.options.down.tips.colors = self.options.down.tips.colors.map(function(color) {
					if(color == tmp) {
						return color;
					}
					return {
						r: parseInt(color.substring(0, 2), 16),
						g: parseInt(color.substring(2, 4), 16),
						b: parseInt(color.substring(4, 6), 16)
					};
				});
				self.canvasUtilObj = self.canvasUtils();
				self.canvasUtilObj.init(self.pullDownCanvas, self.options.down.tips);
				//初始化绘制
				self._drawCanvasTips(1);
			}
			if(options.up && options.up.hasOwnProperty('callback')) {
				if(!this.bottomPocket) {
					this.bottomPocket = this._createBottomPocket();
					this.scrollWrap.appendChild(this.bottomPocket);
				}
			}
			//需要滑动到offset位置
			//这个如果不设置，下拉的提示就会位置不正确
			//需要设一个定时，否则可能计算失误,这里在返回到offset前就先隐藏了
			var self = this;
			setTimeout(function() {
				self.topPocket && self._setOffsetY(self.topPocket.offsetHeight , function() {
					self.topPocket.style.visibility = 'hidden';
					self.bottomPocket && (self.bottomPocket.style.visibility = 'visible');
				});
			}, 0);
		},

		/**
		 * @description 设置caption
		 * @param {Object} isPulldown
		 * @param {Object} title
		 * @param {Object} reset
		 */
		_setCaption: function(isPulldown, title, reset) {
			if(this.loading) {
				return;
			}
			var pocket;
			if(isPulldown) {
				pocket = this.topPocket;

			} else {
				pocket = this.bottomPocket;
			}
			var label = pocket.querySelector('.pull-caption');
			var options = this.options;
			var self = this;
			if(pocket) {
				if(reset) {
					setTimeout(function() {
						pocket.className = 'pull-top-pocket ';
						label.innerHTML = options.down.contentdown;
						pocket.style.visibility = 'hidden';
					}, 100);
				} else {
					if(title !== this.lastTitle) {
						pocket.style.visibility = 'visible';
						label.innerHTML = title;
						if(isPulldown) {
							if(title === options.down.contentrefresh) {
								pocket.className = 'pull-top-pocket loading';

							} else if(title === options.down.contentover) {
								pocket.className = 'pull-top-pocket flip';

							} else if(title === options.down.contentdown) {
								pocket.className = 'pull-top-pocket ';
							} else if(title === options.down.contentrefreshsuccess) {
								//优先显示tips
								label.innerHTML = self.successTips || title;
								pocket.className = 'pull-top-pocket success';
							} else if(title === options.down.contentrefresherror) {
								pocket.className = 'pull-top-pocket error';
							}
						} else {

							if(title === options.up.contentrefresh) {
								pocket.classList.remove('nomore');
								pocket.classList.add('loading');
							} else {
								pocket.classList.remove('loading');

								if(title === options.up.contentnomore) {
									pocket.classList.add('nomore');
								} else {
									pocket.classList.remove('nomore');
								}

							}

						}
						this.lastTitle = title;
					}
				}

			}
		},
		//canvas 绘制相关-慎用闭包
		canvasUtils: function() {
			var canvasObj = null,
				ctx = null,
				size = 200,
				lineWidth = 15,
				tick = 0,
				startTime = 0,
				frameTime = 0,
				timeLast = 0,
				oldStep = 0,
				acc = 0,
				head = 0,
				tail = 180,
				rad = Math.PI / 180,
				duration = 1000,
				tail_duration = 1000 * 2.5,
				colors = ['35ad0e', 'd8ad44', 'd00324'],
				rAF = null;

			function easeLinear(currentIteration, startValue, changeInValue, totalIterations) {
				return changeInValue * currentIteration / totalIterations + startValue;
			}

			function easeInOutQuad(currentIteration, startValue, changeInValue, totalIterations) {
				if((currentIteration /= totalIterations / 2) < 1) {
					return changeInValue / 2 * currentIteration * currentIteration + startValue;
				}
				return -changeInValue / 2 * ((--currentIteration) * (currentIteration - 2) - 1) + startValue;
			}

			function minmax(value, v0, v1) {
				var min = Math.min(v0, v1);
				var max = Math.max(v0, v1);
				if(value < min)
					return min;
				if(value > max)
					return min;
				return value;
			}
			var drawHead = function(ctx, x0, y0, x1, y1, x2, y2, style) {
				'use strict';
				if(typeof(x0) == 'string') x0 = parseInt(x0);
				if(typeof(y0) == 'string') y0 = parseInt(y0);
				if(typeof(x1) == 'string') x1 = parseInt(x1);
				if(typeof(y1) == 'string') y1 = parseInt(y1);
				if(typeof(x2) == 'string') x2 = parseInt(x2);
				if(typeof(y2) == 'string') y2 = parseInt(y2);
				var radius = 3;
				var twoPI = 2 * Math.PI;
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.lineTo(x2, y2);
				switch(style) {
					case 0:
						var backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
						ctx.arcTo(x1, y1, x0, y0, .55 * backdist);
						ctx.fill();
						break;
					case 1:
						ctx.beginPath();
						ctx.moveTo(x0, y0);
						ctx.lineTo(x1, y1);
						ctx.lineTo(x2, y2);
						ctx.lineTo(x0, y0);
						ctx.fill();
						break;
					case 2:
						ctx.stroke();
						break;
					case 3:
						var cpx = (x0 + x1 + x2) / 3;
						var cpy = (y0 + y1 + y2) / 3;
						ctx.quadraticCurveTo(cpx, cpy, x0, y0);
						ctx.fill();
						break;
					case 4:
						var cp1x, cp1y, cp2x, cp2y, backdist;
						var shiftamt = 5;
						if(x2 == x0) {
							backdist = y2 - y0;
							cp1x = (x1 + x0) / 2;
							cp2x = (x1 + x0) / 2;
							cp1y = y1 + backdist / shiftamt;
							cp2y = y1 - backdist / shiftamt;
						} else {
							backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
							var xback = (x0 + x2) / 2;
							var yback = (y0 + y2) / 2;
							var xmid = (xback + x1) / 2;
							var ymid = (yback + y1) / 2;
							var m = (y2 - y0) / (x2 - x0);
							var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
							var dy = m * dx;
							cp1x = xmid - dx;
							cp1y = ymid - dy;
							cp2x = xmid + dx;
							cp2y = ymid + dy;
						}
						ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
						ctx.fill();
						break;
				}
				ctx.restore();
			};
			var drawArcedArrow = function(ctx, x, y, r, startangle, endangle, anticlockwise, style, which, angle, d, lineWidth, lineRatio) {
				'use strict';
				style = typeof(style) != 'undefined' ? style : 3;
				which = typeof(which) != 'undefined' ? which : 1;
				angle = typeof(angle) != 'undefined' ? angle : Math.PI / 8;
				lineWidth = lineWidth || 1;
				lineRatio = lineRatio || 10;
				d = typeof(d) != 'undefined' ? d : 10;
				ctx.save();
				ctx.lineWidth = lineWidth;
				ctx.beginPath();
				ctx.arc(x, y, r, startangle, endangle, anticlockwise);
				ctx.stroke();
				var sx, sy, lineangle, destx, desty;
				if(which & 1) {
					sx = Math.cos(startangle) * r + x;
					sy = Math.sin(startangle) * r + y;
					lineangle = Math.atan2(x - sx, sy - y);
					if(anticlockwise) {
						destx = sx + 10 * Math.cos(lineangle);
						desty = sy + 10 * Math.sin(lineangle);
					} else {
						destx = sx - 10 * Math.cos(lineangle);
						desty = sy - 10 * Math.sin(lineangle);
					}
					drawArrow(ctx, sx, sy, destx, desty, style, 2, angle, d);
				}
				if(which & 2) {
					sx = Math.cos(endangle) * r + x;
					sy = Math.sin(endangle) * r + y;
					lineangle = Math.atan2(x - sx, sy - y);
					if(anticlockwise) {
						destx = sx - 10 * Math.cos(lineangle);
						desty = sy - 10 * Math.sin(lineangle);
					} else {
						destx = sx + 10 * Math.cos(lineangle);
						desty = sy + 10 * Math.sin(lineangle);
					}
					drawArrow(ctx, sx - lineRatio * Math.sin(endangle), sy + lineRatio * Math.cos(endangle), destx - lineRatio * Math.sin(endangle), desty + lineRatio * Math.cos(endangle), style, 2, angle, d)
				}
				ctx.restore();
			}
			var drawArrow = function(ctx, x1, y1, x2, y2, style, which, angle, d) {
				'use strict';
				if(typeof(x1) == 'string') x1 = parseInt(x1);
				if(typeof(y1) == 'string') y1 = parseInt(y1);
				if(typeof(x2) == 'string') x2 = parseInt(x2);
				if(typeof(y2) == 'string') y2 = parseInt(y2);
				style = typeof(style) != 'undefined' ? style : 3;
				which = typeof(which) != 'undefined' ? which : 1;
				angle = typeof(angle) != 'undefined' ? angle : Math.PI / 8;
				d = typeof(d) != 'undefined' ? d : 10;
				var toDrawHead = typeof(style) != 'function' ? drawHead : style;
				var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
				var ratio = (dist - d / 3) / dist;
				var tox, toy, fromx, fromy;
				if(which & 1) {
					tox = Math.round(x1 + (x2 - x1) * ratio);
					toy = Math.round(y1 + (y2 - y1) * ratio);
				} else {
					tox = x2;
					toy = y2;
				}
				if(which & 2) {
					fromx = x1 + (x2 - x1) * (1 - ratio);
					fromy = y1 + (y2 - y1) * (1 - ratio);
				} else {
					fromx = x1;
					fromy = y1;
				}
				ctx.beginPath();
				ctx.moveTo(fromx, fromy);
				ctx.lineTo(tox, toy);
				ctx.stroke();
				var lineangle = Math.atan2(y2 - y1, x2 - x1);
				var h = Math.abs(d / Math.cos(angle));
				if(which & 1) {
					var angle1 = lineangle + Math.PI + angle;
					var topx = x2 + Math.cos(angle1) * h;
					var topy = y2 + Math.sin(angle1) * h;
					var angle2 = lineangle + Math.PI - angle;
					var botx = x2 + Math.cos(angle2) * h;
					var boty = y2 + Math.sin(angle2) * h;
					toDrawHead(ctx, topx, topy, x2, y2, botx, boty, style);
				}
				if(which & 2) {
					var angle1 = lineangle + angle;
					var topx = x1 + Math.cos(angle1) * h;
					var topy = y1 + Math.sin(angle1) * h;
					var angle2 = lineangle - angle;
					var botx = x1 + Math.cos(angle2) * h;
					var boty = y1 + Math.sin(angle2) * h;
					toDrawHead(ctx, topx, topy, x1, y1, botx, boty, style);
				}
			};

			var spinColors = function(currentIteration, totalIterations) {
				var step = currentIteration % totalIterations;
				if(step < oldStep)
					colors.push(colors.shift());
				var c0 = colors[1],
					c1 = colors[2],
					r = minmax(easeLinear(step, c0.r, c1.r - c0.r, totalIterations), c0.r, c1.r),
					g = minmax(easeLinear(step, c0.g, c1.g - c0.g, totalIterations), c0.g, c1.g),
					b = minmax(easeLinear(step, c0.b, c1.b - c0.b, totalIterations), c0.b, c1.b);

				oldStep = step;
				return "rgb(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) + ")";
			}

			var spin = function(t) {
				var timeCurrent = t || (new Date).getTime();
				if(!startTime) {
					startTime = timeCurrent;
				}
				tick = timeCurrent - startTime;
				acc = easeInOutQuad((tick + tail_duration / 2) % tail_duration, 0, duration, tail_duration);
				head = easeLinear((tick + acc) % duration, 0, 360, duration);
				tail = 20 + Math.abs(easeLinear((tick + tail_duration / 2) % tail_duration, -300, 600, tail_duration));

				ctx.lineWidth = lineWidth;
				ctx.lineCap = "round";

				ctx.strokeStyle = spinColors(tick, duration);
				ctx.clearRect(0, 0, size, size);
				//fixed android 4.1.x
				canvasObj.style.display = 'none'; // Detach from DOM
				canvasObj.offsetHeight; // Force the detach
				canvasObj.style.display = 'inherit'; // Reattach to DOM
				ctx.beginPath();
				ctx.arc(size / 2, size / 2, size / 4, parseInt(head - tail) % 360 * rad, parseInt(head) % 360 * rad, false);
				ctx.stroke();
				rAF = requestAnimationFrame(spin);
			};
			var startSpin = function() {
				startTime = 0;
				oldStep = 0;
				!rAF&&(rAF = requestAnimationFrame(spin));
			};
			var stopSpin = function() {
				rAF && cancelAnimationFrame(rAF);
				rAF = null;
			}
			var init = function(canvas, options) {
				canvasObj = canvas;
				ctx = canvasObj.getContext('2d');
				var options = CommonTools.extend(true, {}, options);
				colors = options.colors || colors;
				duration = options.duration;
				tail_duration = options.tail_duration;
				size = options.size;
				lineWidth = options.lineWidth;
			};
			return {
				init: init,
				drawArcedArrow: drawArcedArrow,
				startSpin: startSpin,
				stopSpin: stopSpin
			};
		},

	});

	/**
	 * @description 初始化下拉刷新组件
	 * @param {Object} element
	 * @param {JSON} options 传入的参数
	 * @return 返回的是一个下拉刷新对象
	 */
	exports.initPullToRefresh = function(element, options) {
		if(typeof element !== 'string' && !(element instanceof HTMLElement)) {
			//如果第一个不是options
			options = element;
			element = options['element'];
		}

		//合并默认参数,这个得用的默认参数
		options = CommonTools.extend(true, {}, defaultSettingOptions, options);
		return PullToRefreshBase.initPullToRefresh(PullToRefresh, element, options);
	};

	//兼容require
	if(typeof module != 'undefined' && module.exports) {
		module.exports = exports;
	} else if(typeof define == 'function' && (define.amd || define.cmd)) {
		define(function() { return exports; });
	} 
	//默认就暴露出来
	window.PullToRefreshSkinType3 = exports;
	
})({});