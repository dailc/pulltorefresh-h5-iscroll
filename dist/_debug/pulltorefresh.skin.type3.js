/**
 * 作者: dailc
 * 创建时间: 2017-03-28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 这个工具类都是一些最基本的工具函数
 */

(function(exports) {
    /******************通用代码**********************/
    (function() {
        /**
         * @description 产生一个 唯一uuid-guid
         * @param {Number} len
         * @param {Number} radix 基数
         * @return {String} 返回一个随机性的唯一uuid
         */
        exports.uuid = function(len, radix) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                uuid = [],
                i;
            radix = radix || chars.length;

            if(len) {
                for(i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
            } else {
                var r;

                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                for(i = 0; i < 36; i++) {
                    if(!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }
            return uuid.join('');
        };
        /**
         * 空函数
         */
        exports.noop = function() {};
        /**
         * extend(simple)
         * @param {type} target
         * @param {type} source
         * @param {type} deep
         * @returns {unresolved}
         */
        exports.extend = function() { //from jquery2
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            if(typeof target === "boolean") {
                deep = target;
                target = arguments[i] || {};
                i++;
            }
            if(typeof target !== "object" && !exports.isFunction(target)) {
                target = {};
            }
            if(i === length) {
                target = this;
                i--;
            }
            for(; i < length; i++) {
                if((options = arguments[i]) != null) {
                    for(name in options) {
                        src = target[name];
                        copy = options[name];
                        if(target === copy) {
                            continue;
                        }
                        if(deep && copy && (exports.isPlainObject(copy) || (copyIsArray = exports.isArray(copy)))) {
                            if(copyIsArray) {
                                copyIsArray = false;
                                clone = src && exports.isArray(src) ? src : [];

                            } else {
                                clone = src && exports.isPlainObject(src) ? src : {};
                            }

                            target[name] = exports.extend(deep, clone, copy);
                        } else if(copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        };
        /**
         *  isFunction
         */
        exports.isFunction = function(value) {
            return exports.type(value) === "function";
        };
        /**
         *  isPlainObject
         */
        exports.isPlainObject = function(obj) {
            return exports.isObject(obj) && !exports.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
        };
        exports.isArray = Array.isArray ||
            function(object) {
                return object instanceof Array;
            };
        /**
         *  isWindow(需考虑obj为undefined的情况)
         */
        exports.isWindow = function(obj) {
            return obj != null && obj === obj.window;
        };
        /**
         *  isObject
         */
        exports.isObject = function(obj) {
            return exports.type(obj) === "object";
        };
        exports.type = function(obj) {
            return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
        };
        /**
         * @description each遍历操作
         * @param {type} elements
         * @param {type} callback
         * @returns {global}
         */
        exports.each = function(elements, callback, hasOwnProperty) {
            if(!elements) {
                return this;
            }
            if(typeof elements.length === 'number') {
                [].every.call(elements, function(el, idx) {
                    return callback.call(el, idx, el) !== false;
                });
            } else {
                for(var key in elements) {
                    if(hasOwnProperty) {
                        if(elements.hasOwnProperty(key)) {
                            if(callback.call(elements[key], key, elements[key]) === false) return elements;
                        }
                    } else {
                        if(callback.call(elements[key], key, elements[key]) === false) return elements;
                    }
                }
            }
            return this;
        };

        var class2type = {};
        exports.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function(i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });
        (function() {
            function detect(ua) {
                this.os = {};
                this.os.name = 'browser';
                var funcs = [
                    function() { //android
                        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
                        if(android) {
                            this.os.android = true;
                            this.os.version = android[2];
                            this.os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion));
                            this.os.name += '_' + 'Android';
                            this.os.name += '_' + 'mobile';
                        }
                        return this.os.android === true;
                    },
                    function() { //ios
                        var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
                        if(iphone) { //iphone
                            this.os.ios = this.os.iphone = true;
                            this.os.version = iphone[2].replace(/_/g, '.');
                            this.os.name += '_' + 'iphone';
                            this.os.name += '_' + 'mobile';
                        } else {
                            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
                            if(ipad) { //ipad
                                this.os.ios = this.os.ipad = true;
                                this.os.version = ipad[2].replace(/_/g, '.');
                                this.os.name += '_' + 'iOS';
                                this.os.name += '_' + 'mobile';
                            }

                        }
                        return this.os.ios === true;
                    }
                ];
                [].every.call(funcs, function(func) {
                    return !func.call(exports);
                });
            }
            detect.call(exports, navigator.userAgent);
        })();
        /**
         * @description 判断os系统 ,判断是否是ejs
         * ejs.os
         * @param {type} 
         * @returns {undefined}
         */
        (function() {
            function detect(ua) {
                this.os = this.os || {};
                //比如 EpointEJS/6.1.1  也可以/(EpointEJS)\/([\d\.]+)/i
                var ejs = ua.match(/EpointEJS/i);
                if(ejs) {
                    this.os.ejs = true;
                    this.os.name += '_' + 'ejs';
                }
                //阿里的钉钉 DingTalk/3.0.0 
                var dd = ua.match(/DingTalk/i);
                if(dd) {
                    this.os.dd = true;
                    this.os.name += '_' + 'dd';
                }
            }
            detect.call(exports, navigator.userAgent);
        })();

    })();
    /**
     * @description 模拟Class的基类,以便模拟Class进行继承等
     * 仿照mui写的
     */
    (function() {
        //同时声明多个变量,用,分开要好那么一点点
        var initializing = false,
            //通过正则检查是否是函数
            fnTest = /xyz/.test(function() {
                xyz;
            }) ? /\b_super\b/ : /.*/;
        var Clazz = function() {};
        //很灵活的一种写法,直接重写Class的extend,模拟继承
        Clazz.extend = function(prop) {
            var _super = this.prototype;
            initializing = true;
            //可以这样理解:这个prototype将this中的方法和属性全部都复制了一遍
            var prototype = new this();
            initializing = false;
            for(var name in prop) {
                //这一些列操作逻辑并不简单，得清楚运算符优先级
                //逻辑与的优先级是高于三元条件运算符的,得注意下
                //只有继承的函数存在_super时才会触发(哪怕注释也一样进入)
                //所以梳理后其实一系列的操作就是判断是否父对象也有相同对象
                //如果有,则对应函数存在_super这个东西
                prototype[name] = typeof prop[name] == "function" &&
                    typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                    (function(name, fn) {
                        return function() {
                            var tmp = this._super;
                            this._super = _super[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
            }
            /**
             * @description Clss的构造,默认会执行init方法
             */
            function Clazz() {
                if(!initializing && this.init) {
                    this.init.apply(this, arguments);
                }
            }
            Clazz.prototype = prototype;
            Clazz.prototype.constructor = Clazz;
            //callee 的作用是返回当前执行函数的自身
            //这里其实就是this.extend,不过严格模式下禁止使用
            //Clazz.extend = arguments.callee;
            //替代callee 返回本身
            Clazz.extend = this.extend;
            return Clazz;
        };
        exports.Clazz = Clazz;
    })();
    
    /**
     * 方便的生成对象下的命名空间
     */
    (function() {
        var NameSpace = {
            /**
             * @description 生成全局对象
             * @param {Object} parent 全局对象
             * @param {String} namespace 对应的命名空间
             * @param {Object} obj 需要导出的模块
             */
            generateGlobalObj: function(parent, namespace, obj) {
                // 永远不要试图修改arguments，请单独备份，否则在严格模式和非严格模式下容易出现错误
                var args = [].slice.call(arguments);
                if(typeof args[0] === 'string') {
                    // 兼容在Util下使用命名空间
                    namespace = args[0];
                    parent = window.PullToRefreshTools;
                    obj = args[1];
                }
                if(!namespace) {
                    return;
                }
                var nameSpaceArray = namespace.split('.');
                var len = nameSpaceArray.length;
                var parent = NameSpace.getNameSpaceObj(parent, nameSpaceArray, len - 1);

                parent[nameSpaceArray[len - 1]] = obj;
            },
            /**
             * @description 获取这个模块下对应命名空间的对象
             * @param {Object} module
             * @param {Array} namespaceArr
             * @param {Number} len 这个命名空间的长度
             */
            getNameSpaceObj: function(module, namespaceArr, len) {
                // 找到函数的parent
                var obj = module;
                for(var i = 0; i < len; i++) {
                    var tmp = namespaceArr[i];
                    // 不存在的话要重新创建对象
                    obj[tmp] = obj[tmp] || {};
                    // parent要向下一级
                    obj = obj[tmp];
                }

                return obj;
            }
        };

        exports.namespace = NameSpace.generateGlobalObj;
    })();
    
    /**
     * 兼容require
     */
    if(typeof module != 'undefined' && module.exports) {
        module.exports = exports;
    } else if(typeof define == 'function' && (define.amd || define.cmd)) {
        define(function() {
            return exports;
        });
    }
    
    /**
     * 暴露的工具命名空间
     */
    window.PullToRefreshTools = exports;
})({});
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
    var defaultSettingOptions = {
        //下拉有关
        down: {
            //下拉要大于多少长度后再下拉刷新
            height: 75,
            callback: CommonTools.noop
        },
        //上拉有关
        up: {
            //距离底部高度(到达该高度即触发)
            offset: 100,
            //配置了这个属性，只要停下来时到达了底部也会触发刷新
            isFastLoading: false,
            callback: CommonTools.noop

        },
        //IScroll配置相关
        scroll: {
            bounceTime: 500, //回弹动画时间
            //下拉刷新和上拉加载成功动画的时间
            successAnimationTime: 500,
            //是否允许嵌套，设为true代表外层仍然有一个横向嵌套
            eventPassthrough: false
        },
        //注意,传给Mui时可以传 #id形式或者是  原生dom对象
        element: '#pullrefresh'
    };

    //创建一个Class对象
    var PullToRefresh = CommonTools.Clazz.extend({
        /**
         * @description Class构造时会自动执行对象的init函数
         * @param {HTMLElement||String} element 下拉刷新对象,对应scroll的dom结构对象
         * @param {JSON} options 传入参数
         */
        init: function(element, options) {
            if(typeof element !== 'object' || element instanceof HTMLElement) {
                //如果第一个不是options
                this.element = element;
            } else {
                options = element;
                this.element = options['element'];
            }
            //如果没有则用默认参数
            this.element = this.element || defaultSettingOptions['element'];
            if(typeof this.element === 'string') {
                this.element = document.querySelector(this.element);
            }
            //合并默认参数
            this.options = CommonTools.extend(true, {}, defaultSettingOptions, options);
            //dom对象
            this.wrapper = this.element;
            //scroll的dom-wrapper下的第一个节点
            this.scrollWrap = this.element.children[0];
            //生成一个IScroll对象 
            this.scroller = new IScroll(this.element, {
                probeType: 2,
                tap: false,
                mouseWheel: true,
                eventPassthrough: this.options.scroll.eventPassthrough
            });

            this._initParams();
            this._initPullToRefreshTipsHook && this._initPullToRefreshTipsHook(this.enablePullDown, this.enablePullUp);

            this._initEvent();

            if(options.down && options.down.auto) { 
                //如果设置了auto，则自动下拉一次
                this.pulldownLoading();
            } else if(options.up && options.up.auto) { 
                //如果设置了auto，则自动上拉一次
                this.pullupLoading();
            }
        },
        /**
         * @description 初始化参数
         */
        _initParams: function() {
            //是否支持下拉刷新-只有在顶部才代表可以允许下拉刷新
            this.enablePullDown = this.options.down ? true : false;
            this.enablePullUp = this.options.up ? true : false;
            this.finished = false;
            //实际的下拉刷新距离y轴的距离(这个一般会被下拉刷新动画页面占据)
            this.offsetY = this.offsetY || 0;
            this.topHeiht = (this.options.down && this.options.down.height) ? this.options.down.height : 0;

        },

        /**
         * @description 初始化事件
         */
        _initEvent: function() {
            //可以获取的:
            //myScroll.x/y, current position
            //myScroll.directionX/Y, last direction (-1 down/right, 0 still, 1 up/left)
            //myScroll.currentPage, current snap point info
            var self = this;
            this.scroller.on('scrollStart', function() {
                self._handleScrollStart(this);
            });
            this.scroller.on('scroll', function() {
                self._handleScroll(this);
            });
            //本来是用scrollEnd，但是发现prototype为3时性能很低，所以用了为2的状态
            //而这个状态scrollend没什么用，所以自定义了一个touchEnd事件
            this.scroller.on('touchEnd', function() {
                self._handleTouchEnd(this);
            });
            //scrollEnd的新作用就是用来修正可能的滑动
            var self = this;
            this.scroller.on('scrollEnd', function() {
                self._handleScrollEnd(this);
            });
            //监听refresh事件，进行修正
            //IScroll的this.hasVerticalScroll这个值当元素没有填充满时是会为false的
            //而下拉刷新中是肯定为true的，所以我们需要修正
            //其中maxScrollY当内容小于wrapper时是0，而这时候如果用了offsetY，我们需要重新修正
            this.scroller.on('refresh', function() {
                self.scroller.hasVerticalScroll = true;
                if(self.scroller.maxScrollY == 0) {
                    self.scroller.maxScrollY = -self.offsetY;
                }
            });
            //刷新
            this.refresh();

        },

        /**
         * @description 处理事件 scrollStart
         */
        _handleScrollStart: function(that) {
            //重置一些状态
            //是否允许下拉刷新
            this.allowPullDownLoading = false;
            //开始的Y坐标
            this.startY = that.y;
            //X
            this.startX = that.x;
            //记录lastY来判断方向
            this.lastY = that.y;
            var nowtime = (new Date()).getTime();
            //记录滑动开始的时间
            this.startTime = nowtime;

            //默认不是下拉刷新
            this.pulldown = false;

        },
        /**
         * @description 处理事件 Scroll
         */
        _handleScroll: function(that) {
            //如果是快速滑动
            if(this._isFastScroll()) {
                return;
            }

            //计算滑动偏移量
            //左右移动的距离
            var deltaX = Math.abs(that.x - this.startX);
            //上下偏移量
            var deltaY = Math.abs(that.y - this.startY);
            var originalDeltaY = that.y + this.offsetY;
            this.lastY = that.y;
            if(Math.abs(that.distX) > Math.abs(that.distY)) {
                //不满足条件时要暂时禁止滑动，因为可能外面还包裹着横向滑动条，要为他服务
                //this.scroller.disable();
                return;
            }
            //偏移量要满足条件才行
            if(!(deltaY > 5 && deltaY > deltaX) || this.loading || this.allowPullDownSuccessLoading) {

                return;
            }
            //高度阈值
            var thresholdHeight = (this.options.down && this.options.down.height) ? this.options.down.height : 0;
            //TODO: 需要处理一下，如果下拉完成了，要触发刷新动画
            //如果允许下拉刷新
            if(this.enablePullDown) {

                if(!this.pulldown && !this.loading && that.directionY == -1 && that.y + this.offsetY >= 0) {
                    //如果没有初始化下拉刷新，并且是下拉，进行初始化
                    this.pulldown = true;

                }
                if(that.y + this.offsetY >= thresholdHeight && that.directionY == -1) {
                    //-1代表方向向下，所以松开的时候是不会触发的
                    //做一些下拉刷新的操作
                    if(!this.loading) {
                        //如果没有在loading,才允许重置状态，否则可能是loading导致了高度符合条件
                        this.allowPullDownLoading = true;
                    }

                } else if(that.y + this.offsetY < thresholdHeight && that.y + this.offsetY >= 0) {
                    //注意:只有手动下拉时才会触发
                    //如果没到达到指定下拉距离的时候
                    if(that.directionY === 1) {
                        //如果用户取消上拉加载（实际操作：先拉上去然后手指不松开又拉下来）
                        this.allowPullDownLoading = false;
                    }
                }
                //对应可能需要进行pull动画
                this.pulldown && this._pullingHook && this._pullingHook(originalDeltaY, thresholdHeight);
            }

            //如果允许上拉加载
            if(this.enablePullUp && this.options.up) {
                //这里要求y的绝对值要大于   阈值和maxY
                //因为它们都为负，所以就变为小于了
                //允许上拉加载的情况 
                if((that.y - this.offsetY - this.options.up.offset) <= (this.scroller.maxScrollY - thresholdHeight) && that.directionY == 1) {

                    //方向向上，并且达到了触发位置，默认为到底部了
                    this._scrollbottom();
                }
            }

        },
        /**
         * @description 设置偏移
         * @param {Number} offsetY 顶部提示的间距(如果是absolute布局，传0)
         * 
         */
        _setOffsetY: function(offsetY, done) {
            var self = this;
            self.offsetY = offsetY || 0;
            //设置IScroll里新增的offset
            self.scroller.minScrollY = -offsetY;
            //设置了offsetY后需要移动到相应地方
            self.scroller.scrollTo(0, -self.offsetY);
            done && done();
        },
        /**
         * @description 处理事件 scrollStart
         */
        _handleTouchEnd: function(that) {
            var self = this;
            //下拉刷新动画以及触发回调
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
            //如果y可以看到下拉tips
            //只要不满足下拉刷新的，就回滚,目前回滚直接通过修改IScroll进行
            //			if(that.y > -self.offsetY && ((that.y < Math.abs(thresholdHeight - self.offsetY)))) {
            //				//普通的回滚，需要重新回滚
            //				self.scroller.scrollTo(0, -self.offsetY, self.options.scroll.bounceTime);
            //				
            //			}
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
            //如果拉动的时间小于200ms 则判断为快速刷新
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
                //状态需要重置
                self.allowPullDownLoading = false;
                //控制scroller的高度  self.options.scroll.bounceTime 
                self.loading = false;
                //
                //接下来会默认触发一个成功回调的动画
                self.allowPullDownSuccessLoading = true;
                var timer;
                //success里done 或者过一段时间都是动画可以结束的标识
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
                //由于success函数中有可能会使用animation动画，而IScroll中监听到_transitionEnd则会重置，因此需要再次主动定位
                //需要设置一个延时，因为IScroll有一个默认的回滚，这个要在它之后
                //				setTimeout(function() {
                //					self.scroller.scrollTo(0, self.options.down.height - this.offsetY, 0);
                //				}, 0);

            }
        },
        /**
         * @description 检查下拉刷新动画是否可以结束
         */
        _checkPullDownLoadingEnd: function() {
            var self = this;
            if(self.allowPullDownSuccessLoading) {
                //必须结束了success后才行
                return;
            }
            self._pulldownLoaingAnimationEndHook && self._pulldownLoaingAnimationEndHook();
            self.scroller.scrollTo(0, -self.offsetY, self.options.scroll.bounceTime);

            setTimeout(function() {
                //恢复回滚
                self.scroller.minScrollY = -self.offsetY;
                self.scroller.refresh();
            }, self.options.scroll.bounceTime);
            //结束完动画后要刷新容器

        },
        /**
         * @description 结束上拉加载更多
         * @param {Object} finished
         */
        _endPullupToRefresh: function(finished) {
            var self = this;

            if(!self.pulldown) {
                self.loading = false;
                //刷新容器
                self.scroller.refresh();
                if(finished) {
                    self.finished = true;
                }
                //执行的是成功动画，成功动画里面自然会去end正常动画
                self._pullupLoaingAnimationSuccessHook && self._pullupLoaingAnimationSuccessHook(finished);

            }
        },

        /*************************************API**************************/

        /**
         * @description 下拉刷新中,注意是通过持续的 scrollto 将这个定位到对应位置
         * @param {Object} y
         * @param {Object} time
         */
        pulldownLoading: function(y, time) {
            var self = this;
            if(!this.options.down) {
                return;
            }
            if(self.loading) {
                return;
            }

            typeof y === 'undefined' && (y = this.options.down.height - this.offsetY); //默认高度
            //需要设置一个延时，因为IScroll有一个默认的回滚，这个要在它之后
            //暂时禁止它的回滚 这里的高度要计算好
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
                    //如果已经结束,刷新
                    this.refresh(true);
                }
                x = x || 0;

                if(this.loading) {
                    return;
                }
                this.scroller.scrollTo(x, this.scroller.maxScrollY, time);
                this.pulldown = false;
                //上拉动画
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
                //如果是恢复下拉刷新状态--这个状态只有下拉刷新时才恢复
                this._endPulldownToRefresh(isSuccess);
            }
            //接下拉不管是下拉刷新,还是上拉加载,都得刷新上拉加载的状态
            if(isNoMoreData) {
                //如果没有更多数据了-注意两个变量的差异
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

    /**
     * 对外暴露的只是这个对象
     */
    exports.PullToRefresh = PullToRefresh;

    
    CommonTools.namespace('core', exports.PullToRefresh);
})({}, PullToRefreshTools);
/**
 * 作者: dailc
 * 创建时间: 2017/03/28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 皮肤类只会实现UI相关的hook函数
 * 皮肤 type3 ，
 * 下拉刷新动画用canvas动画球
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
			tips: {
				colors: ['d00324', 'e47012', '9aea1c'],
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
			this._drawCanvasTips(1, 300);
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
			}, 300);

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
		_drawCanvasTips: function(ratio, time) {
			time = time || 0;
			this.pullDownCanvas.style.opacity = ratio;
			this.pullDownCanvas.style.webkitTransform = 'rotate(' + 300 * ratio + 'deg) scale(' + ratio + ',' + ratio + ')';
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
			pocket.innerHTML = '<div class="pull-loading-icon"><div class="pull-top-canvas"><canvas id="' + CommonTools.uuid() + '" class="pull-down-loading-canvas" width="' + self.options.down.tips.size + '" height="' + self.options.down.tips.size + '"></canvas></div></div><div class="pull-caption">' + this.options.down.contentdown + '</div>';
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
				//暂时写死一个，用offset有时会有失误
				//self.topPocket.offsetHeight||0
				self.topPocket && self._setOffsetY(74, function() {
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
				!rAF && (rAF = requestAnimationFrame(spin));
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
			// 如果第一个不是options
			options = element;
			element = options['element'];
		}

		// 合并默认参数,这个得用的默认参数
		options = CommonTools.extend(true, {}, defaultSettingOptions, options);
		
		return new PullToRefresh(element, options);
	};
	exports.init = exports.initPullToRefresh;

	
    CommonTools.namespace('skin.type3', exports);

})({}, PullToRefreshTools);