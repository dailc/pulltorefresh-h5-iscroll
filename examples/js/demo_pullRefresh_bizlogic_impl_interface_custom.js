/**
 * 作者: dailc
 * 时间: 2017-04-10
 * 描述: 这里将下拉刷新与业务实现相关代码抽取出来
 */
(function(exports) {
	var pullToRefreshBiz,
		pullToRefreshBase;
	/**
	 * @description 初始化下拉刷新
	 */
	function initPullRefreshList(isAuto) {
		var pullToRefreshObj = PullToRefreshTools.bizlogic.initPullDownRefresh({
			'skin': pullToRefreshBase,
			'isDebug': false,
			//下拉有关
			down: {
				height: 75,
				contentdown: '下拉可以刷新', //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
				contentover: '释放立即刷新', //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
				contentrefresh: '正在刷新', //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
			},
			//上拉有关
			//up为null代表不使用上拉加载更多
			up: {
				//是否自动上拉加载-初始化是是否自动
				//这里不用这个来控制的话可以用下面的手动刷新
				auto: true,
				//距离底部高度(到达该高度即触发)
				offset: 100,
				//是否隐藏那个加载更多动画,达到默认加载效果
				show: true,
				contentdown: '上拉显示更多',
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
			},
			'bizlogic': {
				//默认的请求页面,根据不同项目服务器配置而不同,正常来说应该是0
				defaultInitPageNum: 0,
				//得到url 要求是一个函数(返回字符串) 或者字符串
				//必须由外部传入
				getUrl: 'http://115.29.151.25:8012/request.php',
				//得到模板 要求是一个函数(返回字符串) 或者字符串
				//必须由外部传入
				getLitemplate: '<li class="mui-table-view-cell"id="{{InfoID}}"><p class="cell-title">{{Title}}</p><p class="cell-content"><span class="cell-content-subcontent"></span><span class="cell-content-time">{{InfoDate}}</span></p></li>',
				//得到请求参数 必须是一个函数,因为会根据不同的分页请求不同的数据,该函数的第一个参数是当前请求的页码
				//必须由外部传入
				getRequestDataCallback: function(currPage, callback) {
					var requestData = {};

					var searchValue = self.searchValue;
					//动态校验字段
					requestData.action = 'testPullrefreshListDemoV3';
					var data = {
						currentpageindex: currPage.toString(),
						pagesize: 10,
						tabType: 'tab1',
						//搜索值,接口里没有实现,这里可以打印代表搜索值已经获取到
						searchValue: searchValue
					};
					requestData.paras = data;
					//某一些接口是要求参数为字符串的
					//requestData = JSON.stringify(requestData);
					//console.log('url:' + url);
					console.log('请求数据:' + JSON.stringify(requestData));
					console.log("搜素值:" + searchValue);

					//支持同步，也支持异步，注意，异步时不允许return 否则会请求多次

					//return requestData;
					callback && callback(requestData);
				},

				//改变数据的函数,代表外部如何处理服务器端返回过来的数据
				//如果没有传入,则采用内部默认的数据处理方法
				changeResponseDataCallback: function(response) {
					var outData = null;
					outData = handleStandardResponse(response, 1).data;

					return outData;
				},
				//请求成功,并且成功处理后会调用的成功回调方法,传入参数是成功处理后的数据
				successRequestCallback: function(response) {
					console.log("请求成功-最终映射数据:" + JSON.stringify(response));
				},
				//请求失败后的回调,可以自己处理逻辑,默认请求失败不做任何提示
				errorRequestCallback: null,
				//是否请求完数据后就自动渲染到列表容器中,如果为false，则不会
				//代表需要自己手动在成功回调中自定义渲染
				isRendLitemplateAuto: true,
				//下拉刷新回调,这个回调主要是为了自动映射时进行数据处理
				refreshCallback: null,
				//列表点击回调，传入参数是  e,即目标对象
				itemClickCallback: function(e) {
					console.log("点击:" + this.id);
				},
				//的列表监听元素选择器,默认为给li标签添加标签
				//如果包含#,则为给对应的id监听
				//如果包含. 则为给class监听
				//否则为给标签监听
				targetListItemClickStr: 'li',
				//默认的列表数据容器id,所有的数据都会添加到这个容器中,这里只接受id
				listdataId: 'listdata',
				//默认的下拉刷新容器id,mui会对这个id进行处理,这里只接受id
				//注意,传给Mui时可以传 #id形式或者是  原生dom对象
				pullrefreshId: 'pullrefresh',
				//下拉刷新后的延迟访问时间,单位为毫秒
				delyTime: 300,
				//ajax请求有关的设置,包括accept,contentType等
				ajaxSetting: {
					//默认的请求超时时间
					requestTimeOut: 15000,
					//ajax的Accept,不同的项目中对于传入的Accept是有要求的
					//传入参数,传null为使用默认值
					/*示例
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
					//默认的contentType
					contentType: "application/x-www-form-urlencoded",
				},

			}

		}, function(pullToRefresh) {
			//console.log("生成下拉刷新成功");

		});
		return pullToRefreshObj;
	}

	/**
	 * @description 初始化
	 */
	function initSearch() {
		document.querySelector('#input-searchName').addEventListener('change', function() {
			var searchValue = document.getElementById('input-searchName').value;
			// 刷新这个业务下拉刷新
			pullToRefreshBiz.refresh();
			console.log("搜索:" + searchValue);
		});

	}

	function handleStandardResponse(response, type) {
		var returnValue = {
			//code默认为0代表失败
			code: 0,
			//描述默认为空
			description: '',
			//数据默认为空
			data: null,
			//一些数据详情,可以调试用
			debugInfo: {
				type: '未知数据格式'
			}
		};
		if(!response) {
			returnValue.description = '接口返回数据为空!';
			return returnValue;
		}
		if(response && response.ReturnInfo) {
			//V6格式数据处理
			returnValue = handleV6Data(response, type, returnValue);
		} else {
			//数据格式不对
			returnValue.code = 0;
			returnValue.description = '接口数据返回格式不正确,不是V6也不是F9!';
			//装载数据可以调试
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
		//默认的
		if(response && response.ReturnInfo && response.ReturnInfo.Code == '1') {
			//程序没有错误,判读是否业务错误
			if(response && response.BusinessInfo && response.BusinessInfo.Code == '1') {
				debugInfo.errorType = 'null';
				//业务也没有错误,开始判断类型
				var tips = '接口请求成功,后台业务逻辑处理成功!';
				if(response && response.BusinessInfo && response.BusinessInfo.Description) {
					//如果存在自己的信息
					tips = response.BusinessInfo.Description;
				}
				returnValue.description = tips;
				type = type || 0;
				if(type === 0 || type === '0') {
					returnValue.code = 1;

				} else if(type === 1 || type === '1') {
					//列表
					if(response && response.UserArea) {
						returnValue.code = 1;
						if(response.UserArea.PageInfo && response.UserArea.PageInfo.TotalNumCount) {
							var numberTotalCount = parseInt(response.UserArea.PageInfo.TotalNumCount);
							numberTotalCount = numberTotalCount || 0;
							returnValue.totalCount = numberTotalCount;
						} else {
							returnValue.totalCount = 0;
						}
						//如果是兼容列表
						if(response.UserArea.InfoList && response.UserArea.InfoList[0] && response.UserArea.InfoList[0].Info) {
							var outArray = [];
							for(var i = 0, len = response.UserArea.InfoList.length; i < len; i++) {
								outArray.push(response.UserArea.InfoList[i].Info);
							}
							returnValue.data = outArray;
						} else {
							returnValue.data = null;
							//否则普通列表-便利每一个节点,如果是InfoList,直接返回,否则继续找
							for(var obj in response.UserArea) {
								if(Array.isArray(response.UserArea[obj])) {
									returnValue.data = response.UserArea[obj];
									if(obj === 'InfoList') {
										//遇到正确节点直接退出
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
						returnValue.description = '接口返回列表数据格式不符合规范!';
					}
				} else if(type === 2 || type === '2') {
					//详情
					if(response && response.UserArea) {
						returnValue.code = 1;
						//详情数据
						var tmp = 0;
						for(var obj in response.UserArea) {
							tmp++;
							returnValue.data = response.UserArea[obj];
						}
						if(tmp > 1) {
							//如果有多个数据,直接使用UserArea
							returnValue.data = response.UserArea;
						}
					} else {
						returnValue.code = 0;
						returnValue.description = '接口返回详情数据格式不符合规范!';
					}
				} else {
					returnValue.code = 0;
					returnValue.description = '处理接口数据错误,传入类别不在处理范围!';
				}

			} else {
				//2代表业务错误
				debugInfo.errorType = '2';
				//业务错误
				returnValue.code = 0;
				var tips = '接口请求错误,后台业务逻辑处理出错!';
				if(response && response.BusinessInfo && response.BusinessInfo.Description) {
					//如果存在自己的错误信息
					tips = response.BusinessInfo.Description;
				}
				returnValue.description = tips;
			}

		} else {
			//1代表程序错误
			debugInfo.errorType = '1';
			//程序错误
			returnValue.code = 0;
			var tips = '接口请求错误,后台程序处理出错!';
			if(response && response.ReturnInfo && response.ReturnInfo.Description) {
				//如果存在自己的程序错误信息
				tips = response.ReturnInfo.Description;
			}
			returnValue.description = tips;
		}
		returnValue.debugInfo = debugInfo;
		return returnValue;
	}
	exports.init = function(pullToRefreshObj) {
		pullToRefreshBase = pullToRefreshObj;
		initSearch();
		pullToRefreshBiz = initPullRefreshList(true);
	};
	
	
	//兼容require
	if(typeof module != 'undefined' && module.exports) {
		module.exports = exports;
	} else if(typeof define == 'function' && (define.amd || define.cmd)) {
		define(function() { return exports; });
	} 
	window.demoPullToRefresh = exports;
})({});