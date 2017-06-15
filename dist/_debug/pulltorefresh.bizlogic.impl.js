/**
 * 作者: dailc
 * 创建时间: 2017-03-28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 数据处理的通用方法封装
 */
(function(exports, CommonTools) {
    /**
     * @description 统一处理返回数据,返回数据必须符合标准才行,否则会返回错误提示
     * @param {JSON} response 接口返回的数据
     * @param {Number} type = [0|1|2]  类别,兼容字符串形式
     * 0:返回校验信息-默认是返回业务处理校验信息
     * 1:返回列表
     * 2:返回详情
     * 其它:无法处理,会返回对应错误信息
     * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等
     */
    exports.handleStandardResponse = function(response, type) {
        var returnValue = {
            // code默认为0代表失败
            code: 0,
            // 描述默认为空
            message: '',
            // 数据默认为空
            data: null,
            // 一些数据详情,可以调试用
            debugInfo: {
                type: '未知数据格式'
            }
        };
        type = type || 0;
        if(!response) {
            returnValue.message = '接口返回数据为空!';
            return returnValue;
        }
        if(response && response.ReturnInfo) {
            // V6格式数据处理
            returnValue = handleV6Data(response, type, returnValue);
        } else if(response && response.custom && response.status) {
            // v7规范
            returnValue = handleV7Data(response, type, returnValue);
        } else {
            // 数据格式不对
            returnValue.code = 0;
            returnValue.message = '接口数据返回格式不正确,不是V6也不是V7!';
            // 装载数据可以调试
            returnValue.debugInfo.data = response;
        }

        return returnValue;
    };
    /**
     * @description 处理V6返回数据
     * @param {JSON} response 接口返回的数据
     * @param {Number} type = [0|1|2]  类别,兼容字符串形式
     * @param {JSON} returnValue 返回数据
     * 0:返回校验信息-默认是返回业务处理校验信息
     * 1:返回列表
     * 2:返回详情
     * 其它:无法处理,会返回对应错误信息
     * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等

     */
    function handleV6Data(response, type, returnValue) {
        var debugInfo = {
            type: 'V6数据格式'
        };
        // 默认的
        if(response && response.ReturnInfo && response.ReturnInfo.Code == '1') {
            // 程序没有错误,判读是否业务错误
            if(response && response.BusinessInfo && response.BusinessInfo.Code == '1') {
                debugInfo.errorType = 'null';
                // 业务也没有错误,开始判断类型
                var tips = '接口请求成功,后台业务逻辑处理成功!';
                if(response && response.BusinessInfo && response.BusinessInfo.Description) {
                    // 如果存在自己的信息
                    tips = response.BusinessInfo.Description;
                }
                returnValue.message = tips;
                if(type === 0 || type === '0') {
                    returnValue.code = 1;
                    returnValue.data = response.UserArea;
                } else if(type === 1 || type === '1') {
                    // 列表
                    if(response && response.UserArea) {
                        returnValue.code = 1;
                        // 如果UserArea本身就是列表
                        if(Array.isArray(response.UserArea)) {
                            returnValue.data = response.UserArea;
                        } else if(response.UserArea.InfoList && response.UserArea.InfoList[0] && response.UserArea.InfoList[0].Info) {
                            // 如果是兼容列表
                            var outArray = [];
                            for(var i = 0, len = response.UserArea.InfoList.length; i < len; i++) {
                                outArray.push(response.UserArea.InfoList[i].Info);
                            }
                            returnValue.data = outArray;
                        } else {
                            returnValue.data = null;
                            // 否则普通列表-便利每一个节点,如果是InfoList,直接返回,否则继续找
                            for(var obj in response.UserArea) {
                                if(Array.isArray(response.UserArea[obj])) {
                                    returnValue.data = response.UserArea[obj];
                                    if(obj === 'InfoList') {
                                        // 遇到正确节点直接退出
                                        break;
                                    }
                                } else {
                                    if(obj === 'InfoList') {
                                        if(response.UserArea[obj] && response.UserArea[obj].Info) {
                                            returnValue.data = response.UserArea[obj].Info;
                                        } else {
                                            returnValue.data = response.UserArea[obj];
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        returnValue.code = 0;
                        returnValue.message = '接口返回列表数据格式不符合规范!';
                    }
                } else if(type === 2 || type === '2') {
                    // 详情
                    if(response && response.UserArea) {
                        returnValue.code = 1;
                        // 详情数据
                        var tmp = 0;
                        for(var obj in response.UserArea) {
                            tmp++;
                            returnValue.data = response.UserArea[obj];
                        }
                        if(tmp > 1) {
                            // 如果有多个数据,直接使用UserArea
                            returnValue.data = response.UserArea;
                        }
                    } else {
                        returnValue.code = 0;
                        returnValue.message = '接口返回详情数据格式不符合规范!';
                    }
                } else {
                    returnValue.code = 0;
                    returnValue.message = '处理接口数据错误,传入类别不在处理范围!';
                }

            } else {
                // 2代表业务错误
                debugInfo.errorType = '2';
                // 业务错误
                returnValue.code = 0;
                var tips = '接口请求错误,后台业务逻辑处理出错!';
                if(response && response.BusinessInfo && response.BusinessInfo.Description) {
                    // 如果存在自己的错误信息
                    tips = response.BusinessInfo.Description;
                }
                returnValue.message = tips;
            }

        } else {
            // 1代表程序错误
            debugInfo.errorType = '1';
            // 程序错误
            returnValue.code = 0;
            var tips = '接口请求错误,后台程序处理出错!';
            if(response && response.ReturnInfo && response.ReturnInfo.Description) {
                //如果存在自己的程序错误信息
                tips = response.ReturnInfo.Description;
            }
            returnValue.message = tips;
        }
        returnValue.status = returnValue.code;
        returnValue.debugInfo = debugInfo;
        return returnValue;
    }

    /**
     * @description 处理V7返回数据
     * @param {JSON} response 接口返回的数据
     * @param {Number} type = [0|1|2]  类别,兼容字符串形式
     * type  v7里不影响,所以传什么都无所谓
     * @param {JSON} returnValue 返回数据
     * 0:返回校验信息-默认是返回业务处理校验信息
     * 1:返回列表
     * 2:返回详情
     * 其它:无法处理,会返回对应错误信息
     * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等

     */
    function handleV7Data(response, type, returnValue) {
        // 存储debuginfo 以供调试
        var debugInfo = {
            type: 'V7数据格式'
        };
        // 对应状态码
        returnValue.status = 0;
        if(response && response.status) {
            returnValue.status = response.status.code;
            returnValue.message = response.status.text;
            if(response.status.code == '200') {
                // 状态为200才代表成功
                returnValue.code = 1;
                // type为1为列表数据
                if(type == 1) {
                    if(response.custom && (response.custom.list || response.custom.infoList)) {
                        returnValue.data = response.custom.list || response.custom.infoList;
                    } else {
                        returnValue.code = 0;
                        // 重新定义提示，方便锁定
                        returnValue.message = '列表接口返回数据不符合标准规范！';
                    }
                } else if(type == 2) {
                    if(response.custom) {
                        returnValue.data = response.custom;
                    } else {
                        returnValue.code = 0;
                        // 重新定义提示，方便锁定
                        returnValue.message = '详情接口返回的数据为空！';
                    }
                } else {
                    returnValue.data = response.custom;
                }
            } else {
                // 请求失败的情况暂时使用接口返回的默认提示
                returnValue.code = 0;
            }
        } else {
            returnValue.code = 0;
            returnValue.message = '接口请求错误,缺少status节点!';
        }
        returnValue.debugInfo = debugInfo;
        return returnValue;
    }
    
    CommonTools.namespace('bizlogic.handleStandardResponse', exports.handleStandardResponse);
})({}, PullToRefreshTools);
/**
 * 作者: dailc
 * 创建时间: 2017/03/28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 下拉刷新的业务的第2中实现
 * 仍然基于公司的标准接口(handdata里的v6和v7)
 */
(function(exports, CommonTools) {
    var handleStandardResponse = CommonTools.bizlogic.handleStandardResponse;
    
    // 全局下拉刷新实际对象,这个根据不同的皮肤类型自定义加载
    var PullToRefreshBase;

    // 判断是否支持tap
    var touchSupport = ('ontouchstart' in document);
    var tapEventName = touchSupport ? 'tap' : 'click';
    /**
     * 默认的设置参数
     */
    var defaultSettingOptions = {
        // 是否是debug模式,如果是的话会输出错误提示
        isDebug: false,
        setting: {
            // 下拉有关
            down: {
                height: 75,
                contentdown: '下拉可以刷新', // 可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
                contentover: '释放立即刷新', // 可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
                contentrefresh: '正在刷新', // 可选，正在刷新状态时，下拉刷新控件上显示的标题内容
                contentrefreshsuccess: '刷新成功', // 可选，刷新成功的提示
                contentrefresherror: '刷新失败', // 可选，刷新失败的提示-错误回调用到
                isSuccessTips: true,
            },
            // 上拉有关
            up: {
                // 是否自动上拉加载-初始化是是否自动
                auto: true,
                // 距离底部高度(到达该高度即触发)
                offset: 100,
                // 是否隐藏那个加载更多动画,达到默认加载效果
                show: true,
                contentdown: '上拉显示更多',
                contentrefresh: '正在加载...',
                contentnomore: '没有更多数据了',
            }
        },
        method: 'POST',
        // 默认的请求页面,根据不同项目服务器配置而不同,正常来说应该是0
        initPageIndex: 0,
        pageSize: 10,
        // 得到url 要求是一个函数(返回字符串) 或者字符串
        url: null,
        // 得到模板 要求是一个函数(返回字符串) 或者字符串
        template: null,
        // 得到请求参数 必须是一个函数,因为会根据不同的分页请求不同的数据,该函数的第一个参数是当前请求的页码
        requestData: null,
        // 改变数据的函数,代表外部如何处理服务器端返回过来的数据
        // 如果没有传入,则采用内部默认的数据处理方法
        changeData: null,
        // 列表元素点击回调，传入参数是  e,即目标对象
        itemClick: null,
        // 请求成功,并且成功处理后会调用的成功回调方法,传入参数是成功处理后的数据
        success: null,
        // 请求失败后的回调,可以自己处理逻辑,默认请求失败不做任何提示
        error: null,
        // 下拉刷新回调,这个回调主要是为了自动映射时进行数据处理
        refresh: null,
        // 是否请求完数据后就自动渲染到列表容器中,如果为false，则不会
        // 代表需要自己手动在成功回调中自定义渲染
        autoRender: true,
        // 表监听元素选择器,默认为给li标签添加标签
        itemSelector: 'li',
        // 默认的列表数据容器选择器
        listSelector: '#listdata',
        // 默认的下拉刷新容器选择器
        pullrefreshSelector: '#pullrefresh',
        // 下拉刷新后的延迟访问时间,单位为毫秒
        delayTime: 0,
        // 默认的请求超时时间
        timeOut: 6000,
        /* ajax的Accept,不同的项目中对于传入的Accept是有要求的
         * 传入参数,传null为使用默认值
         * 示例
         * {
         * script: 'text/javascript, application/javascript, application/x-javascript',
         * json: 'application/json;charset=utf-8'
         * 等等(详情看源码)
         * }
         */
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: 'application/json',
            xml: 'application/xml, text/xml',
            html: 'text/html',
            text: 'text/plain'
        },
        // 默认的contentType
        contentType: "application/x-www-form-urlencoded",
        // 自定义头部默认为空
        headers: null
    };
    /**
     * @description 将string字符串转为html对象,默认创一个div填充
     * @param {String} strHtml 目标字符串
     * @return {HTMLElement} 返回处理好后的html对象,如果字符串非法,返回null
     */
    function pareseStringToHtml(strHtml) {
        if(strHtml == null || typeof(strHtml) != "string") {
            return null;
        }
        // 创一个灵活的div
        var i, a = document.createElement("div");
        var b = document.createDocumentFragment();
        
        a.innerHTML = strHtml;
        while(i = a.firstChild) b.appendChild(i);
        return b;
    }

    function PullDownRefresh(options) {
        var self = this;
        var setting = options.setting;
        
        // 先取下拉刷新dom
        setting.element = document.querySelector(options.pullrefreshSelector);
        if(setting.down) {
            setting.down.callback = function() {
                self.pullDownCallback();
            };
        }
        if(setting.up) {
            setting.up.callback = function() {
                self.pullUpCallback();
            };
        }
        
        self.pullRefreshContainer = setting.element;
        // 数据容器
        self.respnoseEl = self.pullRefreshContainer.querySelector(options.listSelector);
        self.options = options; 
        self.setting = setting;

        // 是否不可以加载更多,如果某些的返回数据为空,代表不可以加载更多了
        self.isShouldNoMoreData = true;
        // 初始化当前页
        self.currPage = self.options.initPageIndex;
        if(self.setting.up && self.setting.up.auto) {
            // 如果初始化请求,当前页面要减1
            self.currPage --;
        }
        self.initAllEventListeners();
        self.pullToRefreshInstance = PullToRefreshBase.initPullToRefresh(options.setting);
        
    }
    /**
     * @description 下拉回调
     */
    PullDownRefresh.prototype.pullDownCallback = function() {
        var self = this;
        if(!self.loadingDown) {
            // 清空 -下拉的时候不清空,请求成功或者失败后再清空
            // 下拉标记,为了回复的时候进行辨别
            self.isPullDown = true;
            self.loadingDown = true;
            self.currPage = self.options.initPageIndex;

            // 延迟delayTime毫秒访问
            setTimeout(function() {
                self.ajaxRequest();
            }, self.options.delayTime);

            // 下拉刷新回调
            self.options.refresh && self.options.refresh(true);
        }

    };
    /**
     * @description 上拉回调
     */
    PullDownRefresh.prototype.pullUpCallback = function() {
        var self = this;
        if(!self.loadingUp) {
            self.isPullDown = false;
            self.loadingUp = true;

            self.currPage++;
            setTimeout(function() {
                self.ajaxRequest();
            }, self.options.delayTime);
        }

    };
    /**
     * @description 初始化所有事件监听
     */
    PullDownRefresh.prototype.initAllEventListeners = function() {
        var self = this;

        var refreshFunc = function(e) {
            self.refresh();
        };
        // 设置列表点击监听,只需要设置一遍,对着listid上设置久可以了
        self.setElemListeners();
    };
    /**
     * @description 设置列表点击监听
     */
    PullDownRefresh.prototype.setElemListeners = function() {
        var self = this;
        if(self.options.itemClick) {
            mui(self.options.listSelector).on(tapEventName, self.options.itemSelector, self.options.itemClick);
        }
    };
    /**
     * @description 刷新,这里默认为清空,并触发一次加载更多
     */
    PullDownRefresh.prototype.refresh = function() {
        var self = this;
        if(!self.setting.up) {
            // 如果不存在上拉加载
            self.clearResponseEl();
            self.pullDownCallback();
        } else if(!self.loadingUp) {
            // 存在上拉加载
            // 清空以前容器中的数据
            self.clearResponseEl();
            // 当前页变为初始页-1  因为会处罚上拉回调,默认将页数+1
            self.currPage = self.options.initPageIndex - 1;
            self.loadingMore();
        }

    };
    /**
     * @description 增加加载更多的翻页功能
     * @param {Function} callback 成功回调
     */
    PullDownRefresh.prototype.loadingMore = function(callback) {
        var self = this;
        // 只会用一次的，用完即可删除
        self.loadingMoreSuccess = callback;
        // 手动将状态设为可以加载更多
        if(self.pullToRefreshInstance.finished) {
            self.pullToRefreshInstance.refresh(true);
            self.isShouldNoMoreData = true;
        }
        // 触发一次加载更多
        self.pullToRefreshInstance.pullupLoading();
    };
    /**
     * @description 禁止上拉加载功能
     */
    PullDownRefresh.prototype.disablePullupToRefresh = function() {
        this.pullToRefreshInstance.disablePullupToRefresh();
    };
    /**
     * @description 开启上拉加载功能
     */
    PullDownRefresh.prototype.enablePullupToRefresh = function() {
        this.pullToRefreshInstance.enablePullupToRefresh();
    };
    /**
     * @description ajax请求数据
     */
    PullDownRefresh.prototype.ajaxRequest = function() {
        var self = this;
        if(!self.options.url) {
            // 如果url不存在
            if(self.options.isDebug) {
                console.error('error***url无效,无法访问');
            }
            // 触发错误回调
            self.errorRequest(null, null, '请求url为空!');
            return;
        }

        var next = function(requestData) {
            var url = "";
            if(typeof(self.options.url) == "function") {
                url = self.options.url();
            } else {
                url = self.options.url;
            }
            mui.ajax(url, {
                data: requestData,
                dataType: "json",
                timeout: self.options.timeOut,
                type: self.options.method,
                // 接受的头
                accepts: self.options.accepts,
                // 自定义头部
                headers: self.options.headers,
                // contentType
                contentType: self.options.contentType,
                success: function(response) {
                    self.successRequest(response);
                },
                error: function(xhr, status) {
                    self.errorRequest(xhr, status, '请求失败!');
                }
            });
        };

        if(self.options.requestData) {
            var requestData = self.options.requestData(self.currPage, function(requestData) {
                next(requestData);
            });
            if(requestData !== undefined) {
                next(requestData);
            }

        } else {
            if(self.options.isDebug) {
                console.warn('warning***请注意getData不存在,默认数据为空');
            }
            next();
        }

    };
    /**
     * @description 请求失败回调
     * @param {JSON} xhr
     * @param {Number} status
     * @param {String} msg
     */
    PullDownRefresh.prototype.errorRequest = function(xhr, status, msg) {
        var self = this;
        // 没有返回数据,代表不可以加载更多
        self.isShouldNoMoreData = false;
        self.refreshState(false);
        self.currPage--;
        self.currPage = self.currPage >= self.options.initPageIndex ? self.currPage : self.options.initPageIndex;
        self.options.error && self.options.error(xhr, status, msg);
    };
    /**
     * @description 成功回调
     * @param {JSON} response 成功返回数据
     * @param {Boolean} isInitSessionData 是否是初始时的数据
     */
    PullDownRefresh.prototype.successRequest = function(response, isInitSessionData) {
        var self = this;
        if(!response) {
            if(self.options.isDebug) {
                console.log('warning***返回的数据为空,请注意！');
            }
            self.isShouldNoMoreData = false;
            self.refreshState(false);
            return;
        }
        if(self.options.isDebug) {
            console.log('下拉刷新返回数据:' + JSON.stringify(response));
        }
        if(self.options.changeData) {
            // 如果存在转换数据的函数,用外部提供的
            response = self.options.changeData(response);
        } else {
            // 使用默认的数据转换
            response = self.defaultChangeResponseData(response);
        }

        if(self.options.autoRender) {
            // 如果自动渲染
            // 如果是下拉加载 先清空
            if(self.isPullDown) {
                self.clearResponseEl();
            }
            var dataLen = 0;
            // 必须包含Mustache
            if(window.Mustache) {
                if(response && Array.isArray(response) && response.length > 0) {
                    var outList = '';
                    for(var i = 0; i < response.length; i++) {
                        var value = response[i];
                        // 默认模版
                        var template = "";
                        if(self.options.template) {
                            if(typeof(self.options.template) === "string") {
                                // 如果模板是字符串
                                template = self.options.template;
                            } else if(typeof(self.options.template) === "function") {
                                // 如果模板是函数
                                template = self.options.template(value);
                            }
                        }
                        var output = Mustache.render(template, value);
                        outList += output;
                        dataLen++;
                    }
                    if(outList != "") {
                        self.respnoseEl.appendChild(pareseStringToHtml(outList));
                    }
                } else {
                    // 没有返回数据,代表不可以加载更多
                    self.isShouldNoMoreData = false;
                }
            } else {
                self.isShouldNoMoreData = false;
                if(self.options.isDebug == true) {
                    console.error('error***没有包含mustache.min.js,无法进行模板渲染');
                }
            }
        }
        // 成功后的回调方法
        if(self.options.success && typeof(self.options.success) === "function") {
            // 如果回调函数存在,第二个参数代表是否是下拉刷新请求的,如果是,则是代表需要重新刷新数据
            self.options.success(response, self.isPullDown || (self.currPage == self.options.initPageIndex));
        }
        if(!isInitSessionData) {
            // 如果不是session数据
            self.refreshState(true, dataLen);
        }
    };
    /**
     * @description 内置的默认数据转换函数
     * @param {JSON} response
     */
    PullDownRefresh.prototype.defaultChangeResponseData = function(response) {
        var self = this;
        // 数据都使用通用处理方法
        var result = handleStandardResponse(response, 1);
        return result.data;
    };
    /**
     * @description 重置状态
     * @param {Boolean} isSuccess 是否请求成功
     * @param {Number} dataLen 更新的数据条数
     */
    PullDownRefresh.prototype.refreshState = function(isSuccess, dataLen) {
        var self = this;
        dataLen = dataLen || 0;
        // 设置tips  这个可以用来设置  更新了多少条数据等等
        self.pullToRefreshInstance.setSuccessTips && self.pullToRefreshInstance.setSuccessTips('更新' + dataLen + '条数据');
        if(self.isPullDown) {
            // 如果是下拉刷新
            self.pullToRefreshInstance.endPullDownToRefresh(isSuccess);
            // 不管是下拉刷新还是上拉加载,都要刷新加载更多状态
            // 如果加载更多是否已经结束了
            if(self.pullToRefreshInstance.finished) {
                self.pullToRefreshInstance.refresh(true);
                // 又可以加载更多
                self.isShouldNoMoreData = true;
            }
        }
        if(!self.isShouldNoMoreData) {
            // 没有更多数据 
            self.pullToRefreshInstance.endPullUpToRefresh(true, isSuccess);
        } else {
            // 加载更多
            self.pullToRefreshInstance.endPullUpToRefresh(false, isSuccess);
        }
        self.loadingDown = false;
        self.loadingUp = false;
    };

    /**
     * @description 清空容器
     */
    PullDownRefresh.prototype.clearResponseEl = function() {
        var self = this;
        if(self.options.autoRender) {
            self.respnoseEl && (self.respnoseEl.innerHTML = '');
        }
    };
    /**
     * @description 初始化下拉刷新
     * @param {JSON} options 传入的参数
     * @param {Function} 成功生成后,回调下拉刷新对象
     * 因为皮肤是通过异步加载的,所以必须通过回调进行
     */
    exports.initPullDownRefresh = function(options, callback) {
        options = options || {};
        // 先取默认值，从html配置中获取
        var listDom = document.querySelector(options.listSelector || '#listdata');
        var template = options.template;
        var litemplateSelector = listDom.getAttribute('data-tpl') || '#item-template'; 
        
        if(typeof template === 'string' && (template.charAt(0) == '.' || template.charAt(0) == '#')) {            
            // 手动传入优先级更高
            litemplateSelector = template;
            options.template = '';
        }
        
        var litemplateDom = document.querySelector(litemplateSelector);

        if(litemplateDom) {
            options.template = options.template || litemplateDom.innerHTML.toString() || '';
        }              
        
        // 参数合并,深层次合并 
        options = CommonTools.extend(true, {}, defaultSettingOptions, options);      
        
        // 生成下拉刷新对象,有一个默认值
        PullToRefreshBase = options.targetPullToRefresh || options.skin || PullToRefreshTools.skin.defaults;
        
        
       if(!PullToRefreshBase) {
            console.error("错误:传入的下拉刷新皮肤错误,超出范围!");
            return;
        }
        
        var instance = new PullDownRefresh(options);
        callback && callback(instance);
        // 同步也返回
        return instance;
    };
    
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
    
    CommonTools.namespace('bizlogic.initPullDownRefresh', exports.initPullDownRefresh);
    CommonTools.namespace('bizlogic.init', exports.initPullDownRefresh);

})({}, PullToRefreshTools);