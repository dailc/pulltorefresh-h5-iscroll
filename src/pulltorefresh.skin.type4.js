/**
 * 作者: dailc
 * 创建时间: 2017/03/28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 皮肤类只会实现UI相关的hook函数
 * 皮肤 type3 ，
 * 饼状图，刷新圈，椭圆形变，√状态，×状态等，纯css3实现
 * 依赖 pulltorefresh.skin.css
 */
(function(exports, CommonTools) {

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
	var PullToRefresh = CommonTools.core.extend({

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
				this.bottomPocket && this.bottomPocket.classList.add(CLASS_HIDDEN);
			}
			if(!enablePullDown) {
				this.topPocket && this.topPocket.classList.add(CLASS_HIDDEN);
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
				//变化 topcaption 

				var diff = deltaY - thresholdHeight - 10;
				if(diff > 39) {
					diff = 39;
				} else if(diff < 0) {
					diff = 0;
				}
				this.topcaption.style.webkitTransform = 'translate(' + 0 + ',' + (diff) * 1.6 + 'px)';
				this.topcaption.style.transform = 'translate(' + 0 + ',' + (diff) * 1.6 + 'px)';
			} else if(deltaY < thresholdHeight) {
				this.topcaption.style.opacity = deltaY / thresholdHeight;
				//同时改变container
				this.piecontainer.style.transform = 'translate(' + 0 + ',' + deltaY * 0.3 + 'px)';
				this.piecontainer.style.webkitTransform = 'translate(' + 0 + ',' + deltaY * 0.3 + 'px)';
				this._setCaption(true, this.options.down.contentdown);
			}
			this.pieAnimationUtilObj.setPercent(deltaY, 75, 10);

		},
		/**
		 * @description 下拉刷新的成功动画，每次确保触发一次
		 */
		_pulldownLoaingAnimationHook: function() {
			var self = this;
			this.pieAnimationUtilObj.refresh(function() {
				//重置caption
				self.topcaption.style.opacity = 1;
				self.topcaption.style.transform = 'translate(' + 0 + ',' + 0 + 'px)';
				self.topcaption.style.webkitTransform = 'translate(' + 0 + ',' + 0 + 'px)';
				self.topcaption.style.transitionDuration = '300ms';
				self.topcaption.style.webkitTransitionDuration = '300ms';
				self.topcaption.style.transitionTimingFunction = 'ease-in';
				self.topcaption.style.webkitTransitionTimingFunction = 'ease-in';
			});
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
				isSuccess ? this.pieAnimationUtilObj.success() : this.pieAnimationUtilObj.error();
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
			var self = this;
			this.pieAnimationUtilObj.end(function() {
				self.topcaption.style.opacity = 0;
				self.topcaption.style.webkitTransitionDuration = '0ms';
				self.topcaption.style.transitionDuration = '0ms';
			});
			this._setCaption(true, this.options.down.contentdown, true);
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
		 * @description 创建下拉提示
		 */
		_createTopPocket: function() {
			var self = this;
			var pocket = document.createElement('div');
			pocket.style.visibility = 'hidden';
			pocket.className = 'pull-top-pocket';
			pocket.innerHTML = '<div class="pull-loading-icon"><div class="pie-anim-container"><div class="pie"><div class="anim-pie"></div><div class="left-pie"></div></div><div class="fresh-progress"><div class="progress-arrow"></div></div><div class="success-tips"><div class="arrow-left"></div><div class="arrow-right"></div></div><div class="error-tips"><span class="txt left">×</span><span class="txt right">×</span><div class="moon"></div></div></div></div><div class="pull-caption">' + this.options.down.contentdown + '</div>';
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
			this.wrapper.classList.add('pulltorefresh-type4');
			var options = this.options;
			if(options.down && options.down.hasOwnProperty('callback')) {
				if(!this.topPocket) {
					this.topPocket = this._createTopPocket();

					this.wrapper.insertBefore(this.topPocket, this.wrapper.firstChild);
				}
				this.piecontainer = this.element.querySelector('.pie-anim-container');
				this.topcaption = this.element.querySelector('.pull-caption');
				console.log(this.element.id + ',' + this.piecontainer + ',' + this.topcaption);
				//初始化
				self.pieAnimationUtilObj = self.pieAnimationUtil();
				self.pieAnimationUtilObj.init({
					elem: this.piecontainer
				});

			}
			if(options.up && options.up.hasOwnProperty('callback')) {
				if(!this.bottomPocket) {
					this.bottomPocket = this._createBottomPocket();
					this.scrollWrap.appendChild(this.bottomPocket);
				}
			}
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
		//canvas 绘制相关
		pieAnimationUtil: function() {
			var _elementStyle = document.createElement('div').style;
			/**
			 * @description 进行浏览器兼容的，补全浏览器兼容前缀
			 * @param {HTMLElement} dom
			 * @param {String} style 对应的属性
			 * @param {String|Number} value 对应的值
			 * @param {Boolean} isAppend 是否是额外增加
			 */
			function _prefixStyle(dom, style, value, isAppend) {
				if(!dom) {
					return;
				}
				var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
					transform,
					i = 0,
					l = vendors.length;

				for(; i < l; i++) {
					transform = vendors[i] + 'ransform';
					if(transform in _elementStyle) {
						var styleStr = vendors[i].substr(0, vendors[i].length - 1) + style.charAt(0).toUpperCase() + style.substr(1);
						if(isAppend) {
							dom.style[styleStr] += value;
						} else {
							dom.style[styleStr] = value;
						}

					};
				}

			}

			var animPie, pie, leftPie, refreshPregress, successTips, errorTips, oldWith, oldHeight, oldPercent, bgColor, showColor;

			// 0 - 100
			var setPercent = function(deltaY, thresholdHeight, thresholdScaleHeight) {
				thresholdScaleHeight = thresholdScaleHeight || 0;
				//先设置饼状图
				var percent = (deltaY / thresholdHeight) * 100;
				//不允许重复设置,只有状态更改时才重置
				if(percent >= 50 && oldPercent < 50) {
					//大于一半后，右侧的颜色需要变动
					pie.style.backgroundColor = showColor;
					animPie.style.zIndex = 10;
				} else if(percent < 50 && (oldPercent >= 50 || !oldPercent)) {
					pie.style.backgroundColor = bgColor;
					animPie.style.zIndex = -1;
				}
				if(percent >= 100 && oldPercent < 100) {
					leftPie.style.background = showColor;
				} else if(percent < 100 && (oldPercent >= 100 || !oldPercent)) {
					leftPie.style.background = bgColor;
				}
				var deg = (percent / 100) * 360;

				if(!oldPercent) {
					//如果是第一次设置
					_prefixStyle(animPie, 'animation', 'none');
					_prefixStyle(animPie, 'transitionDuration', '0ms');
					_prefixStyle(pie, 'animation', 'none');
					_prefixStyle(pie, 'transitionDuration', '0ms');
					_prefixStyle(pie, 'borderRadius', '50%');
				}
				//需要持续计算的动画
				_prefixStyle(animPie, 'transform', 'rotate(' + (deg > 360 ? 360 : deg) + 'deg)');

				//需要持续计算的动画
				if(deltaY <= thresholdHeight) {
					//重置缩放状态

					refreshPregress.style.opacity = 0;
					//饼状图的缩放-这时候还没有触发下拉刷新
					_prefixStyle(pie, 'transform', 'scale(' + percent / 100 + ',' + percent / 100 + ')');
					_prefixStyle(pie, 'transformOriginY', '50%');
				} else {
					//如果可以下拉刷新了，这时候刷新progress要显示
					_prefixStyle(refreshPregress, 'transform', 'rotateZ(' + deg + 'deg)');
					//防止快速拉动
					refreshPregress.style.opacity = (deltaY - thresholdHeight) / 10;
					if(deltaY <= thresholdHeight + thresholdScaleHeight) {
						//这时候还不需要形变，只需要刷新条显示

					} else {
						//需要形变了，改变pie
						var diff = deltaY - thresholdHeight - thresholdScaleHeight;
						var percentX = (oldWith - 0.1 * diff) / oldWith;
						var percentY = (oldHeight + 1.6 * diff) / oldHeight;
						if(percentY > 2.5) {
							percentY = 2.5;
						}
						if(percentX < 0.9) {
							percentX = 0.9;
						}
						_prefixStyle(refreshPregress, 'transform', ' scale(' + (1 - diff * 0.002) + ',' + (1 - diff * 0.002) + ')', true);
						_prefixStyle(pie, 'borderBottomLeftRadius', (50 + 0.1 * diff) + '%');
						_prefixStyle(pie, 'borderBottomRightRadius', (50 + 0.1 * diff) + '%');
						_prefixStyle(pie, 'transform', 'scale(' + percentX + ',' + percentY + ')');

						//已经可以下拉刷新了
						_prefixStyle(pie, 'transformOriginY', '0%');
					}

				}

				oldPercent = percent;
			};

			function refresh(hook) {
				//重置饼图 得重置一些animation
				_prefixStyle(animPie, 'animation', 'none');
				animPie.style.zIndex = 10;
				_prefixStyle(pie, 'animation', 'none');
				pie.style.backgroundColor = showColor;

				_prefixStyle(pie, 'borderBottomLeftRadius', '50%');
				_prefixStyle(pie, 'borderBottomRightRadius', '50%');
				_prefixStyle(pie, 'transform', 'scale(' + 1 + ',' + 1 + ')');
				_prefixStyle(pie, 'transformOriginY', '50%');
				_prefixStyle(pie, 'transitionDuration', '300ms');
				_prefixStyle(pie, 'transitionTimingFunction', 'ease-in');

				//重置progressbar
				refreshPregress.style.opacity = 1;
				_prefixStyle(refreshPregress, 'transform', 'scale(' + 1 + ',' + 1 + ')');
				_prefixStyle(refreshPregress, 'transitionDuration', '300ms');
				_prefixStyle(refreshPregress, 'transitionTimingFunction', 'ease-in');
				//一段时间后加上loading动画
				_prefixStyle(refreshPregress, 'animation', 'progressrotate 700ms ease-in-out  400ms infinite');

				//
				successTips.style.opacity = 0;
				_prefixStyle(successTips, 'transitionDuration', '0ms');

				errorTips.style.opacity = 0;
				_prefixStyle(errorTips, 'transitionDuration', '0ms');

				//重置状态
				oldPercent = null;

				hook && hook();
			}

			//成功函数-重置状态
			function success(hook) {
				refreshPregress.style.opacity = 0;
				successTips.style.opacity = 1;
				_prefixStyle(successTips, 'transitionDuration', '400ms');
				_prefixStyle(successTips, 'transitionTimingFunction', 'ease-in');

				//重置状态
				oldPercent = null;
			}

			function error() {
				refreshPregress.style.opacity = 0;
				errorTips.style.opacity = 1;
				_prefixStyle(errorTips, 'transitionTimingFunction', 'ease-in');
				_prefixStyle(errorTips, 'transitionDuration', '400ms');

				//重置状态
				oldPercent = null;
			}

			function end(hook) {
				//重置刷新条与进度条
				refreshPregress.style.opacity = 0;
				_prefixStyle(refreshPregress, 'transitionDuration', '0ms');
				_prefixStyle(refreshPregress, 'animation', 'none');

				successTips.style.opacity = 0;
				_prefixStyle(successTips, 'transitionDuration', '0ms');

				errorTips.style.opacity = 0;
				_prefixStyle(errorTips, 'transitionDuration', '0ms');

				//饼状图的缩放-这时候还没有触发下拉刷新
				_prefixStyle(pie, 'transform', 'scale(' + 0 + ',' + 0 + ')');
				_prefixStyle(pie, 'transformOriginY', '50%');
				_prefixStyle(pie, 'transitionDuration', '300ms');

				//下面是饼状图的 进度旋转
				leftPie.style.background = bgColor;
				//延迟的时间超过一般
				_prefixStyle(pie, 'animation', 'piebackground 0ms ease-out 150ms');
				_prefixStyle(pie, 'animationFillMode', 'forwards');

				//饼状图回复原状,动画里既有index也有rotate
				//设置为动画结束后状态
				_prefixStyle(animPie, 'animation', 'pieanimaindex 300ms ease-out');
				_prefixStyle(animPie, 'animationFillMode', 'forwards');

				//重置状态
				oldPercent = null;
				hook && hook();

			}

			//初始化一些参数
			function init(options) {
				options = options || {};
				bgColor = options.bgColor || 'currentColor';
				showColor = options.showColor || '#d00324';

				var elem = options.elem;
				if(!elem) {
					throw new Error('错误，必须有一个elem对象');
				}
				if(typeof elem === 'string') {
					elem = document.querySelector(elem);
				}
				animPie = elem.querySelector('.anim-pie'),
					pie = elem.querySelector('.pie'),
					leftPie = elem.querySelector('.left-pie'),
					refreshPregress = elem.querySelector('.fresh-progress'),
					successTips = elem.querySelector('.success-tips'),
					errorTips = elem.querySelector('.error-tips');
				oldWith = pie.offsetWidth,
					oldHeight = pie.offsetHeight;
				setTimeout(function() {
					//重新获取
					oldWith = pie.offsetWidth;
					oldHeight = pie.offsetHeight;
				}, 0)
				//初始化饼状图
				_prefixStyle(pie, 'transform', 'scale(' + 0 + ',' + 0 + ')');

			}

			return {
				init: init,
				setPercent: setPercent,
				refresh: refresh,
				success: success,
				error: error,
				end: end
			};
		}

	});

	/**
	 * @description 初始化下拉刷新组件
	 * @param {Object} element
	 * @param {JSON} options 传入的参数
	 * @return 返回的是一个下拉刷新对象
	 */
	exports.initPullToRefresh = function(element, options) {
		if(typeof element !== 'string' && !(element instanceof HTMLElement)) {
			// 如果第一个不是options
			options = element;
			element = options['element'];
		}

		// 合并默认参数,这个得用的默认参数
		options = CommonTools.extend(true, {}, defaultSettingOptions, options);
		
		return new PullToRefresh(element, options);
	};
	exports.init = exports.initPullToRefresh;

	
    CommonTools.namespace('skin.type4', exports);

})({}, PullToRefreshTools);