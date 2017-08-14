/**
 * 作者: dailc
 * 创建时间: 2017/08/14
 * 版本: [1.0, 2017/08/14 ]
 * 版权: dailc
 * 描述: 皮肤类只会实现UI相关的hook函数
 * 皮肤 type5
 * 仿微信小程序效果
 * 
 */
(function(CommonTools) {

    /**
     * 全局参数
     */
    var CLASS_HIDDEN = 'hidden';

    var PullToRefresh = CommonTools.core.extend({

        /**
         * @description 生成下拉刷新提示，这个需要被具体实现
         * 这个默认实现就直接在一个函数里面同时生成下拉和上拉提示了
         */
        _initPullToRefreshTipsHook: function(enablePullDown, enablePullUp) {
            this._initPocket();
            this._checkHidden(enablePullDown, enablePullUp);
        },

        _checkHidden: function(enablePullDown, enablePullUp) {
            if (!enablePullUp) {
                this.bottomPocket && this.bottomPocket.classList.add(CLASS_HIDDEN);
            }
            if (!enablePullDown) {
                this.topPocket && this.topPocket.classList.add(CLASS_HIDDEN);
            }
        },

        /**
         * @description 下拉过程中的钩子函数
         * @param {Number} deltaY
         * @param {Number} thresholdHeight 对应的高度阈值
         */
        _pullingHook: function(deltaY, thresholdHeight) {
            if ((this.options.down && this.options.down.cssAnimation)) {
                // 高度阈值，暂时不做其他事情
                if (deltaY <= thresholdHeight) {
                    this.topLoading.style.webkitTransform = 'translateY(' + (-50 + deltaY / thresholdHeight * 50) + 'px)';
                    this.topLoading.style.transform = 'translateY(' + (-50 + deltaY / thresholdHeight * 50) + 'px)';
                } else {
                    this.topLoading.style.webkitTransform = 'translateY(0)';
                    this.topLoading.style.transform = 'translateY(0)';
                }
            }
            
        },
        /**
         * @description 下拉刷新的成功动画，每次确保触发一次
         */
        _pulldownLoaingAnimationHook: function() {
            // 添加loading class
            this.topPocket.classList.add('loading');
        },
        /**
         * @description 下拉刷新的成功动画-动画完毕后可能的成功提示，每次确保触发一次
         * 比如在成功里面提示加载了多少条数据，如果不需要可以传null，会直接走到end事件里
         * @param {Function} done 这个可以提前结束动画-如果不想要的话
         * @param {Boolean} isSuccess 是否请求成功
         */
        _pulldownLoaingAnimationSuccessHook: function(done, isSuccess) {
            // 此皮肤没有成功提示
            done();
        },
        /**
         * @description 下拉刷新的动画完成后的回调，可以用来重置状态
         */
        _pulldownLoaingAnimationEndHook: function() {
            // 移除loading class
            this.topPocket.classList.remove('loading');
            if (this.options.down && this.options.down.cssAnimation) {
                this.topLoading.style.webkitTransform = 'translateY(-50px)';
                this.topLoading.style.transform = 'translateY(-50px)';
            }
            
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
            if (isFinished) {
                this._setCaption(false, this.options.up.contentnomore);
            } else {
                this._setCaption(false, this.options.up.contentdown);
            }
            // this.bottomPocket.classList.remove(CLASS_VISIBILITY);
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
        /**
         * @description 创建下拉提示
         */
        _createTopPocket: function() {
            var pocket = document.createElement('div');
            //pocket.style.visibility = 'hidden';
            pocket.className = 'pull-top-pocket';
            pocket.innerHTML = '<div class="pull-block  ball-beat"><div></div><div></div><div></div></div>';
            return pocket;
        },
        /**
         * @description 创建上拉提示
         */
        _createBottomPocket: function() {
            var pocket = document.createElement('div');
            //pocket.style.visibility = 'hidden';
            pocket.className = 'pull-bottom-pocket';
            pocket.innerHTML = '<div class="pull-block"><div class="pull-loading-icon rotate"></div><div class="pull-caption">' + this.options.up.contentdown + '</div></div>';
            return pocket;
        },
        /**
         * @description 初始化下拉刷新和上拉加载提示
         */
        _initPocket: function() {
            // 改变配置
            this.options.down.cssAnimation = true;
            // 先改变wrap的皮肤
            this.wrapper.classList.add('pulltorefresh-type5');
            var options = this.options;
            if (options.down && options.down.hasOwnProperty('callback')) {
                if (!this.topPocket) {
                    this.topPocket = this._createTopPocket();

                    // 插到wrap中
                    this.wrapper.insertBefore(this.topPocket, this.wrapper.firstChild);
                }
                
                this.topLoading = this.topPocket.querySelector('.pull-block');
                
                if (this.options.down && this.options.down.cssAnimation) {
                    // 单独渲染图层，优化动画
                    this.topPocket.style.webkitTransform = 'translateZ(0)';
                    this.topPocket.style.transform = 'translateZ(0)';
                    this.topLoading.style.webkitTransform = 'translateY(-50px)';
                    this.topLoading.style.transform = 'translateY(-50px)';
                }
                
            }
            if (options.up && options.up.hasOwnProperty('callback')) {
                if (!this.bottomPocket) {
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
            if (this.loading) {
                return;
            }
            var pocket;
            if (isPulldown) {
                // 本皮肤上拉没有文字提示
                return;

            } else {
                pocket = this.bottomPocket;
            }
            var label = pocket.querySelector('.pull-caption');
            var options = this.options;
            var self = this;
            if (pocket) {
                if (title !== this.lastTitle) {
                    label.innerHTML = title;
                    if (options.up) {
                        if (title === options.up.contentrefresh) {
                            pocket.classList.remove('nomore');
                            pocket.classList.add('loading');
                        } else {
                            pocket.classList.remove('loading');

                            if (title === options.up.contentnomore) {
                                pocket.classList.add('nomore');
                            } else {
                                pocket.classList.remove('nomore');
                            }

                        }

                    }
                    this.lastTitle = title;
                }
            }
        },

    });

    CommonTools.namespace('skin.type5', PullToRefresh);

})(PullToRefreshTools);