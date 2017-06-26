/**
 * 作者: dailc
 * 创建时间: 2017-03-28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 基于IScroll实现(hasVerticalScroll强行将这个设为true,修正不会下拉问题，同时需要设置对应的maxScrollY)
 * 注意:prototype 状态用2   这时候scroll只会在手动拉时才会触发
 * 如果为3则会自动触发，不好计算
 * 并且为3是不会使用transition动画，用到的是cpu计算，性能低
 * 注意需要处理好和横向滑动之间的关系
 * 所有下拉刷新皮肤都需要提供以下api:(所有下拉刷新都需要实现的给外部使用的api)
 * refresh	重置状态。譬如上拉加载关闭后需要手动refresh重置
 * pulldownLoading	开始触发下拉刷新动画
 * pullupLoading	开始触发上拉加载更多
 * endPullDownToRefresh	关闭下拉刷新动画
 * endPullUpToRefresh(finished) 	关闭上拉加载动画
 * 需要有以下属性:
 * finished(判断上拉加载是否显示没有更多数据)
 * 
 * 以下是UI实现类可以实现的hook函数(方便各大实现类继承,不想实现可以设为null，主要是进行一些UI实现)
 * _initPullToRefreshTipsHook 初始化生成下拉刷新与上拉加载的提示
 * _pullingHook(deltaY,thresholdHeight) 下拉过程中的钩子函数，方便实现一些渐变动画
 * _pulldownLoaingAnimationHook 下拉刷新的动画
 * _pulldownLoaingAnimationSuccessHook(done,isSuccess) 下拉刷新的成功动画-动画完毕后可能的成功提示
 * _pulldownLoaingAnimationEndHook 下拉刷新的动画完成后的回调，可以用来重置状态
 * _pullupLoaingAnimationHook(isFinished) 上拉加载的动画
 * _pullupLoaingAnimationSuccessHook(isFinished) 上拉加载的成功动画-动画完毕后可能的成功提示，或者重置状态
 * _scrollEndHook 滑动完毕后的end回调
 * _enablePullUpHook 允许pullup后的回调
 * _disablePullUpHook 禁止pullup后的回调
 */

(function(exports, CommonTools) {
    //基于IScroll 暂时单独剥离IScroll
    
    /**
     * 默认的设置参数
     */
    var defaultSetting = {
        // 下拉有关
        down: {
            // 下拉要大于多少长度后再下拉刷新
            height: 75,
            // 可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
            contentdown: '下拉可以刷新', 
            // 可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
            contentover: '释放立即刷新', 
            // 可选，正在刷新状态时，下拉刷新控件上显示的标题内容
            contentrefresh: '正在刷新', 
            // 可选，刷新成功的提示
            contentrefreshsuccess: '刷新成功', 
            // 可选，刷新失败的提示-错误回调用到
            contentrefresherror: '刷新失败', 
            isSuccessTips: true,
            callback: CommonTools.noop
        },
        // 上拉有关
        up: {
            // 是否自动上拉加载-初始化是是否自动
            auto: true,
            // 距离底部高度(到达该高度即触发)
            offset: 100,
            // 配置了这个属性，只要停下来时到达了底部也会触发刷新
            isFastLoading: false,
            contentdown: '上拉显示更多',
            contentrefresh: '正在加载...',
            contentnomore: '没有更多数据了',
            callback: CommonTools.noop

        },
        // IScroll配置相关
        scroll: {
            // 回弹动画时间
            bounceTime: 500, 
            // 下拉刷新和上拉加载成功动画的时间
            successAnimationTime: 500,
            // 是否允许嵌套，设为true代表外层仍然有一个横向嵌套
            eventPassthrough: false
        },
        // 注意,传给Mui时可以传 #id形式或者是  原生dom对象
        container: '#pullrefresh'
    };

    //创建一个Class对象
    var PullToRefresh = CommonTools.Clazz.extend({
        /**
         * @description Class构造时会自动执行对象的init函数
         * @param {JSON} options 传入参数,包括
         * container 下拉刷新对象,对应scroll的dom结构对象
         */
        init: function(options) {
            options = CommonTools.extend(true, {}, defaultSetting, options);
            
            this.container = CommonTools.selector(options.container);
            this.options = options;       
            // wrapper兼容以前的内部调用法
            this.wrapper = this.container;
            // scroll的dom-wrapper下的第一个节点
            this.scrollWrap = this.container.children[0];
            // 生成一个IScroll对象 ，默认不启用tap(会和其它tap库冲突)
            this.scroller = new IScroll(this.container, {
                probeType: 2,
                tap: false,
                mouseWheel: true,
                eventPassthrough: this.options.scroll.eventPassthrough
            });

            this._initParams();
            // 对应的hook函数
            this._initPullToRefreshTipsHook && this._initPullToRefreshTipsHook(this.enablePullDown, this.enablePullUp);
            this._initEvent();

            if(options.down && options.down.auto) { 
                // 如果设置了auto，则自动下拉一次
                this.pulldownLoading();
            } else if(options.up && options.up.auto) { 
                // 如果设置了auto，则自动上拉一次
                this.pullupLoading();
            }
        },
        /**
         * @description 初始化参数
         */
        _initParams: function() {
            // 是否支持下拉刷新-只有在顶部才代表可以允许下拉刷新
            this.enablePullDown = this.options.down ? true : false;
            this.enablePullUp = this.options.up ? true : false;
            this.finished = false;
            // 实际的下拉刷新距离y轴的距离(这个一般会被下拉刷新动画页面占据)
            this.offsetY = this.offsetY || 0;
            this.topHeiht = (this.options.down && this.options.down.height) ? this.options.down.height : 0;

        },

        /**
         * @description 初始化事件
         */
        _initEvent: function() {
            /**
             * 可以获取的:
             * myScroll.x/y, current position
             * myScroll.directionX/Y, last direction (-1 down/right, 0 still, 1 up/left)
             * myScroll.currentPage, current snap point info
             */
            var self = this;
            
            this.scroller.on('scrollStart', function() {
                self._handleScrollStart(this);
            });
            
            this.scroller.on('scroll', function() {
                self._handleScroll(this);
            });
            
            // 本来是用scrollEnd，但是发现prototype为3时性能很低，所以用了为2的状态
            // 而这个状态scrollend没什么用，所以自定义了一个touchEnd事件
            this.scroller.on('touchEnd', function() {
                self._handleTouchEnd(this);
            });
            
            // scrollEnd的新作用就是用来修正可能的滑动
            this.scroller.on('scrollEnd', function() {
                self._handleScrollEnd(this);
            });
            
            /**
             * 监听refresh事件，进行修正
             * IScroll的this.hasVerticalScroll这个值当元素没有填充满时是会为false的
             * 而下拉刷新中是肯定为true的，所以我们需要修正
             * 其中maxScrollY当内容小于wrapper时是0，而这时候如果用了offsetY，我们需要重新修正
             */
            this.scroller.on('refresh', function() {
                self.scroller.hasVerticalScroll = true;
                if(self.scroller.maxScrollY == 0) {
                    self.scroller.maxScrollY = -self.offsetY;
                }
            });
            
            // 刷新
            this.refresh();
        },

        /**
         * @description 处理事件 scrollStart
         */
        _handleScrollStart: function(that) {
            // 重置一些状态
            // 是否允许下拉刷新
            this.allowPullDownLoading = false;
            // 开始的Y坐标
            this.startY = that.y;
            // X
            this.startX = that.x;
            // 记录lastY来判断方向
            this.lastY = that.y;
            var nowtime = (new Date()).getTime();
            // 记录滑动开始的时间
            this.startTime = nowtime;

            // 默认不是下拉刷新
            this.pulldown = false;

        },
        /**
         * @description 处理事件 Scroll
         */
        _handleScroll: function(that) {
            // 如果是快速滑动
            if(this._isFastScroll()) {
                return;
            }

            // 计算滑动偏移量
            // 左右移动的距离
            var deltaX = Math.abs(that.x - this.startX);
            // 上下偏移量
            var deltaY = Math.abs(that.y - this.startY);
            var originalDeltaY = that.y + this.offsetY;
            this.lastY = that.y;
            if(Math.abs(that.distX) > Math.abs(that.distY)) {
                // 不满足条件时要暂时禁止滑动，因为可能外面还包裹着横向滑动条，要为他服务
                // this.scroller.disable();
                return;
            }
            // 偏移量要满足条件才行
            if(!(deltaY > 5 && deltaY > deltaX) || this.loading || this.allowPullDownSuccessLoading) {

                return;
            }
            // 高度阈值
            var thresholdHeight = (this.options.down && this.options.down.height) ? this.options.down.height : 0;
            // 如果允许下拉刷新
            if(this.enablePullDown) {

                if(!this.pulldown && !this.loading && that.directionY == -1 && that.y + this.offsetY >= 0) {
                    // 如果没有初始化下拉刷新，并且是下拉，进行初始化
                    this.pulldown = true;
                }
                
                if(that.y + this.offsetY >= thresholdHeight && that.directionY == -1) {
                    // -1代表方向向下，所以松开的时候是不会触发的
                    // 做一些下拉刷新的操作
                    if(!this.loading) {
                        // 如果没有在loading,才允许重置状态，否则可能是loading导致了高度符合条件
                        this.allowPullDownLoading = true;
                    }

                } else if(that.y + this.offsetY < thresholdHeight && that.y + this.offsetY >= 0) {
                    // 注意:只有手动下拉时才会触发
                    // 如果没到达到指定下拉距离的时候
                    if(that.directionY === 1) {
                        // 如果用户取消上拉加载（实际操作：先拉上去然后手指不松开又拉下来）
                        this.allowPullDownLoading = false;
                    }
                }
                
                // 对应可能需要进行pull动画
                this.pulldown && this._pullingHook && this._pullingHook(originalDeltaY, thresholdHeight);
            }

            // 如果允许上拉加载
            if(this.enablePullUp && this.options.up) {
                // 这里要求y的绝对值要大于   阈值和maxY
                // 因为它们都为负，所以就变为小于了
                // 允许上拉加载的情况 
                if((that.y - this.offsetY - this.options.up.offset) <= (this.scroller.maxScrollY - thresholdHeight) && that.directionY == 1) {

                    // 方向向上，并且达到了触发位置，默认为到底部了
                    this._scrollbottom();
                }
            }

        },
        /**
         * @description 设置偏移
         * @param {Number} offsetY 顶部提示的间距(如果是absolute布局，传0)
         */
        _setOffsetY: function(offsetY, done) {
            var self = this;
            
            self.offsetY = offsetY || 0;
            // 设置IScroll里新增的offset
            self.scroller.minScrollY = -offsetY;
            // 设置了offsetY后需要移动到相应地方
            self.scroller.scrollTo(0, -self.offsetY);
            done && done();
        },
        /**
         * @description 处理事件 scrollStart
         */
        _handleTouchEnd: function(that) {
            var self = this;
            
            // 下拉刷新动画以及触发回调
            if(self.allowPullDownLoading) {
                self.pulldownLoading(undefined, self.options.scroll.bounceTime);
            } else {
                self.enablePullDown && self._pulldownLoaingAnimationEndHook && self._pulldownLoaingAnimationEndHook();
            }
        },
        /**
         * @description 滑动结束，可以用来修正位置
         * @param {Object} that
         */
        _handleScrollEnd: function(that) {
            var self = this;
            var thresholdHeight = (self.options.down && self.options.down.height) ? self.options.down.height : 0;

            self._scrollEndHook && self._scrollEndHook();
            if(self.enablePullUp && self.options.up) {
                if(!self.loading && self.options.up.isFastLoading) {

                    if((that.y - self.offsetY - self.options.up.offset) <= (self.scroller.maxScrollY - thresholdHeight)) {
                        self._scrollbottom();
                    }
                }
            }

        },
        /**
         * @description 是否快速滑动
         */
        _isFastScroll: function() {
            var isFast = false;
            var nowtime = (new Date()).getTime();
            var dsTime = nowtime - this.startTime;
            
            // 如果拉动的时间小于200ms 则判断为快速刷新
            if(dsTime > 100) {
                isFast = false;
            } else {
                isFast = true;
            }
            return isFast;
        },

        /**
         * @description 滑动到底了
         */
        _scrollbottom: function() {
            if(!this.enablePullUp || this.finished) {
                return;
            }
            if(!this.loading) {
                this.pulldown = false;
                this.pullupLoading();
            }
        },

        /**
         * @description 结束下拉刷新
         * @param {Boolean} isSuccess 是否请求成功
         */
        _endPulldownToRefresh: function(isSuccess) {
            var self = this;
            
            if(!this.options.down) {
                return;
            }
            if(self.loading) {
                // 状态需要重置
                self.allowPullDownLoading = false;
                // 控制scroller的高度  self.options.scroll.bounceTime 
                self.loading = false;
                // 接下来会默认触发一个成功回调的动画
                self.allowPullDownSuccessLoading = true;
                
                var timer;
                
                // success里done 或者过一段时间都是动画可以结束的标识
                self._pulldownLoaingAnimationSuccessHook && self._pulldownLoaingAnimationSuccessHook(function() {
                    timer && clearTimeout(timer);
                    self.allowPullDownSuccessLoading = false;
                    self._checkPullDownLoadingEnd();
                }, isSuccess);
                
                timer = setTimeout(function() {
                    timer && clearTimeout(timer);
                    self.allowPullDownSuccessLoading = false;
                    self._checkPullDownLoadingEnd();
                }, self.options.scroll.successAnimationTime);       
            }
        },
        /**
         * @description 检查下拉刷新动画是否可以结束
         */
        _checkPullDownLoadingEnd: function() {
            var self = this;
            
            if(self.allowPullDownSuccessLoading) {
                // 必须结束了success后才行
                return;
            }
            self._pulldownLoaingAnimationEndHook && self._pulldownLoaingAnimationEndHook();
            self.scroller.scrollTo(0, -self.offsetY, self.options.scroll.bounceTime);

            setTimeout(function() {
                // 恢复回滚,结束完动画后要刷新容器
                self.scroller.minScrollY = -self.offsetY;
                self.scroller.refresh();
            }, self.options.scroll.bounceTime);

        },
        /**
         * @description 结束上拉加载更多
         * @param {Boolean} finished
         */
        _endPullupToRefresh: function(finished) {
            var self = this;

            if(!self.pulldown) {
                self.loading = false;
                // 刷新容器
                self.scroller.refresh();
                if(finished) {
                    self.finished = true;
                }
                // 执行的是成功动画，成功动画里面自然会去end正常动画
                self._pullupLoaingAnimationSuccessHook && self._pullupLoaingAnimationSuccessHook(finished);

            }
        },


        /**
         * @description 下拉刷新中,注意是通过持续的 scrollto 将这个定位到对应位置
         * @param {Number} y
         * @param {Number} time
         */
        pulldownLoading: function(y, time) {
            var self = this;
            
            if(!this.options.down) {
                return;
            }
            if(self.loading) {
                return;
            }
            
            //默认高度
            typeof y === 'undefined' && (y = this.options.down.height - this.offsetY); 
            
            // 需要设置一个延时，因为IScroll有一个默认的回滚，这个要在它之后
            // 暂时禁止它的回滚 这里的高度要计算好
            self.scroller.minScrollY = self.topHeiht - self.offsetY;
            setTimeout(function() {
                self.scroller.scrollTo(0, y, time || 0);
                self._pulldownLoaingAnimationHook && self._pulldownLoaingAnimationHook();
                self.loading = true;
                var callback = self.options.down.callback;
                callback && callback.call(self);
            }, 0);
        },

        /**
         * @description 触发上拉加载
         * @param {Object} callback
         * @param {Object} x
         * @param {Object} time
         */
        pullupLoading: function(callback, x, time) {
            if(this.enablePullUp && this.options.up) {
                if(this.finished) {
                    // 如果已经结束,刷新
                    this.refresh(true);
                }
                x = x || 0;

                if(this.loading) {
                    return;
                }
                this.scroller.scrollTo(x, this.scroller.maxScrollY, time);
                this.pulldown = false;
                // 上拉动画
                this._pullupLoaingAnimationHook && this._pullupLoaingAnimationHook(false);

                this.loading = true;
                callback = callback || this.options.up.callback;
                callback && callback.call(this);
            }

        },

        /**
         * @description 禁止上拉加载
         */
        disablePullupToRefresh: function() {
            this.enablePullUp = false;
            this._disablePullUpHook && this._disablePullUpHook();
        },
        /**
         * @description 允许上拉加载
         */
        enablePullupToRefresh: function() {
            this.enablePullUp = true;
            this._enablePullUpHook && this._enablePullUpHook();
        },
        /**
         * @description 刷新方法
         * @param {Boolean} isReset
         */
        refresh: function(isReset) {
            if(isReset && this.finished) {
                this.enablePullupToRefresh();
                this.finished = false;
            }
            this.scroller.refresh();

        },
        /**
         * @description 刷新loading状态，便于使用
         * @param {Boolean} isPullDown
         * @param {Boolean} isNoMoreData
         * @param {Boolean} isSuccess 是否请求成功
         */
        resetLoadingState: function(isPullDown, isNoMoreData, isSuccess) {
            var that = this;
            if(isPullDown) {
                // 如果是恢复下拉刷新状态--这个状态只有下拉刷新时才恢复
                this._endPulldownToRefresh(isSuccess);
            }
            // 接下拉不管是下拉刷新,还是上拉加载,都得刷新上拉加载的状态
            if(isNoMoreData) {
                // 如果没有更多数据了-注意两个变量的差异
                this._endPullupToRefresh(true);
            } else {
                this._endPullupToRefresh(false);
            }
        },
        /**
         * @description 结束下拉刷新
         * @param {Boolean} isSuccess 是否请求成功
         */
        endPullDownToRefresh: function(isSuccess) {
            if(isSuccess == null) {
                isSuccess = true;
            }
            this.resetLoadingState(true, false, isSuccess);
        },
        /**
         * @description 结束上拉加载
         * @param {Object} finished
         * @param {Boolean} isSuccess 是否请求成功
         */
        endPullUpToRefresh: function(finished, isSuccess) {
            if(isSuccess == null) {
                isSuccess = true;
            }
            this.resetLoadingState(false, finished, isSuccess);
        },
        /**
         * @description 设置成功提示
         * @param {String} tips
         */
        setSuccessTips: function(tips) {
            this.successTips = tips;
        },
    });
    
    CommonTools.namespace('core', PullToRefresh);
})({}, PullToRefreshTools);