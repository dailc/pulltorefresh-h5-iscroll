/**
 * @description  基于IScroll实现的下拉刷新
 * @author dailc
 * @version 4.0
 * @time 2017-03-25
 * 皮肤类只会实现UI相关的hook函数
 * 默认皮肤，皮肤 type1  为了简化代码已经后续方便就没有再复用default了
 * 依赖mui的css
 */
(function(exports) {
     var CommonTools = require('CommonTools_Core');
	var PullToRefreshBase = require('PullToRefresh_Core');
	
	//默认的全局参数-主要用来配置下拉刷新提示的一些css class
	//var NAMESPACE = 'rayapp-';
	var NAMESPACE = 'mui-';
	var CLASS_PULL_TOP_POCKET = NAMESPACE + 'pull-top-pocket';
	var CLASS_PULL_BOTTOM_POCKET = NAMESPACE + 'pull-bottom-pocket';
	var CLASS_PULL = NAMESPACE + 'pull';
	var CLASS_PULL_LOADING = NAMESPACE + 'pull-loading';
	var CLASS_PULL_CAPTION = NAMESPACE + 'pull-caption';
	var CLASS_PULL_CAPTION_DOWN = NAMESPACE + 'pull-caption-down';
	var CLASS_PULL_CAPTION_REFRESH = NAMESPACE + 'pull-caption-refresh';
	var CLASS_PULL_CAPTION_NOMORE = NAMESPACE + 'pull-caption-nomore';

	var CLASS_ICON = NAMESPACE + 'icon';
	var CLASS_SPINNER = NAMESPACE + 'spinner';
	var CLASS_ICON_PULLDOWN = NAMESPACE + 'icon-pulldown';
	var CLASS_ICON_SUCCESS = NAMESPACE + 'icon-checkmarkempty';
	var CLASS_ICON_ERROR = NAMESPACE + 'icon-info';

	var CLASS_BLOCK = NAMESPACE + 'block';
	var CLASS_HIDDEN = NAMESPACE + 'hidden';
	var CLASS_VISIBILITY = NAMESPACE + 'visibility';

	var CLASS_LOADING_UP = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
	var CLASS_LOADING_DOWN = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
	var CLASS_LOADING = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_SPINNER;
	
	var CLASS_LOADING_SUCCESS = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_SUCCESS;
	var CLASS_LOADING_ERROR = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_ERROR;
	var pocketHtml = ['<div class="' + CLASS_PULL + '">', '<div class="{icon}"></div>', '<div class="' + CLASS_PULL_CAPTION + '">{contentrefresh}</div>', '</div>'].join('');
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
			isSuccessTips:false,
			callback: CommonTools.noop
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
		_initPullToRefreshTipsHook: function(enablePullDown,enablePullUp) {
			this._initPocket();
			if(!enablePullUp) {
				this.bottomPocket&&this.bottomPocket.classList.add(CLASS_HIDDEN);
			}
			if(!enablePullDown) {
				this.topPocket&&this.topPocket.classList.add(CLASS_HIDDEN);
			}
		},
		/**
		 * @description 初始化下拉刷新
		 */
		_initPulldownRefreshState: function() {
			this.pullPocket = this.topPocket;
			this.pullPocket.classList.add(CLASS_BLOCK);
			this.pullPocket.classList.add(CLASS_VISIBILITY);
			this.pullCaption = this.topCaption;
			this.pullLoading = this.topLoading;
			
			
		},
		/**
		 * @description 初始化上拉加载
		 */
		_initPullupRefreshState: function() {
			this.pullPocket = this.bottomPocket;
			this.pullPocket.classList.add(CLASS_BLOCK);
			this.pullPocket.classList.add(CLASS_VISIBILITY);
			this.pullCaption = this.bottomCaption;
			this.pullLoading = this.bottomLoading;
		},
		/**
		 * @description 下拉过程中的钩子函数
		 * @param {Number} deltaY
		 * @param {Number} thresholdHeight 对应的高度阈值
		 */ 
		_pullingHook: function(deltaY,thresholdHeight) {
			//高度阈值
			if(deltaY >= thresholdHeight) {
				this._setCaption(true,this.options.down.contentover);
			} else if(deltaY < thresholdHeight) {
				this._setCaption(true,this.options.down.contentdown);
			}
		},
		/**
		 * @description 下拉刷新的成功动画，每次确保触发一次
		 */
		_pulldownLoaingAnimationHook: function() {
			this._setCaption(true,this.options.down.contentrefresh);
		},
		/**
		 * @description 下拉刷新的成功动画-动画完毕后可能的成功提示，每次确保触发一次
		 * 比如在成功里面提示加载了多少条数据，如果不需要可以传null，会直接走到end事件里
		 * @param {Function} done 这个可以提前结束动画-如果不想要的话
		 * @param {Boolean} isSuccess 是否请求成功
		 */
		_pulldownLoaingAnimationSuccessHook: function(done,isSuccess) {
			if(this.options.down.isSuccessTips) {
				this._setCaption(true,isSuccess?this.options.down.contentrefreshsuccess:this.options.down.contentrefresherror);
			} else {
				//否则直接没有成功提示
				done();
			}
			
		},
		/**
		 * @description 下拉刷新的动画完成后的回调，可以用来重置状态
		 */
		_pulldownLoaingAnimationEndHook: function() {
			this._setCaption(true,this.options.down.contentdown, true);
			this.topPocket.classList.remove(CLASS_VISIBILITY);
		},
		/**
		 * @description 上拉加载的成功动画，每次确保触发一次
		 */
		_pullupLoaingAnimationHook: function(isFinished) {
			this._setCaption(false,this.options.up.contentrefresh);
		},
		/**
		 * @description 上拉加载的成功动画-动画完毕后可能的成功提示，每次确保触发一次
		 */
		_pullupLoaingAnimationSuccessHook: function(isFinished) {
			if(isFinished) {
				this._setCaption(false,this.options.up.contentnomore);
			} else {
				this._setCaption(false,this.options.up.contentdown);
			}
			//this.bottomPocket.classList.remove(CLASS_VISIBILITY);
		},
		/**
		 * @description _disablePullUpHook
		 */
		_disablePullUpHook: function() {
			this.bottomPocket.className = 'mui-pull-bottom-pocket' + ' ' + CLASS_HIDDEN;
		},
		/**
		 * @description disablePullUpHook
		 */
		_enablePullUpHook: function() {
			this.bottomPocket.classList.remove(CLASS_HIDDEN);
			this._setCaption(false,this.options.up.contentdown);
		},
		/*一些是UI对应的实现*/
		/**
		 * @description 创建上拉提示或下拉提示
		 * @param {Object} clazz
		 * @param {Object} options
		 * @param {Object} iconClass
		 */
		_createPocket: function(clazz, options, iconClass) {
			var pocket = document.createElement('div');
			pocket.className = clazz;
			pocket.innerHTML = pocketHtml.replace('{contentrefresh}', options.contentdown).replace('{icon}', iconClass);
			return pocket;
		},
		/**
		 * @description 初始化下拉刷新和上拉加载提示
		 */
		_initPocket: function() {
			var options = this.options;
			if(options.down && options.down.hasOwnProperty('callback')) {
				this.topPocket = this.wrapper.querySelector('.' + CLASS_PULL_TOP_POCKET);
				if(!this.topPocket) {
					this.topPocket = this._createPocket(CLASS_PULL_TOP_POCKET, options.down, CLASS_LOADING_DOWN);
					//this.wrapper.insertBefore(this.topPocket, this.wrapper.firstChild);
					this.scrollWrap.insertBefore(this.topPocket, this.scrollWrap.firstChild);
				}
				this.topLoading = this.topPocket.querySelector('.' + CLASS_PULL_LOADING);
				this.topCaption = this.topPocket.querySelector('.' + CLASS_PULL_CAPTION);
				//这里为了方便，就不再单独引入样式文件了，而是直接通过style改写mui的样式
				//将absulute改写为 relative visibility改为visible;
				this.topPocket.style.position = 'relative';
				
			}
			if(options.up && options.up.hasOwnProperty('callback')) {
				this.bottomPocket = this.scrollWrap.querySelector('.' + CLASS_PULL_BOTTOM_POCKET);
				if(!this.bottomPocket) {
					this.bottomPocket = this._createPocket(CLASS_PULL_BOTTOM_POCKET, options.up, CLASS_LOADING);
					this.scrollWrap.appendChild(this.bottomPocket);
				}
				this.bottomLoading = this.bottomPocket.querySelector('.' + CLASS_PULL_LOADING);
				this.bottomCaption = this.bottomPocket.querySelector('.' + CLASS_PULL_CAPTION);
			}
			
			//需要滑动到offset位置
			//这个如果不设置，下拉的提示就会位置不正确
			//需要设一个定时，否则可能计算失误,这里在返回到offset前就先隐藏了
			var self = this;
			setTimeout(function() {
				//暂时写死一个，用offset有时会有失误
				//self.topPocket.offsetHeight||0
				self.topPocket&&self._setOffsetY(50, function() {
					self.topPocket.style.visibility = 'visible';
					self.bottomPocket&&(self.bottomPocket.style.visibility = 'visible');
				});
			}, 0);
		},
		
		/**
		 * @description 设置提示的class
		 * @param {Object} isPulldown
		 * @param {Object} caption
		 * @param {Object} title
		 */
		_setCaptionClass: function(isPulldown, caption, title) {
			if(!this.options.up) {
				return ;
			}
			if(!isPulldown) {
				
				switch(title) {
					case this.options.up.contentdown:
						caption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_DOWN;
						break;
					case this.options.up.contentrefresh:
						caption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_REFRESH
						break;
					case this.options.up.contentnomore:
						caption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_NOMORE;
						break;
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
			if(isPulldown) {
				this._initPulldownRefreshState();
			} else {
				this._initPullupRefreshState();
			}
			var options = this.options;
			var pocket = this.pullPocket;
			var caption = this.pullCaption;
			var loading = this.pullLoading;
			var isPulldown = this.pulldown;
			var self = this;
			if(pocket) {
				if(reset) {
					setTimeout(function() {
						caption.innerHTML = self.lastTitle = title;
						if(isPulldown) {
							loading.className = CLASS_LOADING_DOWN;
						} else {
							self._setCaptionClass(false, caption, title);
							loading.className = CLASS_LOADING;
						}
						loading.style.webkitAnimation = "";
						loading.style.webkitTransition = "";
						loading.style.webkitTransform = "";
					}, 100);
				} else {
					if(title !== this.lastTitle) {
						caption.innerHTML = title;
						if(isPulldown) {
							if(title === options.down.contentrefresh) {
								loading.className = CLASS_LOADING;
								loading.style.webkitAnimation = "spinner-spin 1s step-end infinite";
							} else if(title === options.down.contentover) {
								loading.className = CLASS_LOADING_UP;
								loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
								loading.style.webkitTransform = "rotate(180deg)";
							} else if(title === options.down.contentdown) {
								loading.className = CLASS_LOADING_DOWN;
								loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
								loading.style.webkitTransform = "rotate(0deg)";
							} else if(title === options.down.contentrefreshsuccess) {
								//隐藏loading先
								loading.className = CLASS_LOADING_SUCCESS;
								loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
								loading.style.webkitTransform = "scale(1.2,1.2)";
								loading.style.webkitAnimation = "none";
								//优先显示tips
								caption.innerHTML = self.successTips||title;
							} else if(title === options.down.contentrefresherror) {
								loading.className = CLASS_LOADING_ERROR;
								loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
								loading.style.webkitTransform = "scale(1.2,1.2)";
								loading.style.webkitAnimation = "none";
							}
						} else {
							if(title === options.up.contentrefresh) {
								loading.className = CLASS_LOADING + ' ' + CLASS_VISIBILITY;
							} else {
								loading.className = CLASS_LOADING + ' ' + CLASS_HIDDEN;
							}
							self._setCaptionClass(false, caption, title);
						}
						this.lastTitle = title;
					}
				}

			}
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
		return PullToRefreshBase.initPullToRefresh(PullToRefresh,element, options);
	};
	
	//兼容require
	if(typeof module != 'undefined' && module.exports) {
		module.exports = exports;
	} else if(typeof define == 'function' && (define.amd || define.cmd)) {
		define(function() { return exports; });
	} 
	//默认就暴露出来	
	window.PullToRefreshSkinType1 = exports;
	
})({});