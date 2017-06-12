/**
 * 作者: dailc
 * 时间: 2017-04-05 
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
			'bizlogic': {
				defaultInitPageNum: 0,
				getUrl: 'http://115.29.151.25:8012/request.php',
				getLitemplate: '<li class="mui-table-view-cell"id="{{InfoID}}"><p class="cell-title">{{Title}}</p><p class="cell-content"><span class="cell-content-subcontent"></span><span class="cell-content-time">{{InfoDate}}</span></p></li>',
				getRequestDataCallback: function(currPage, callback) {
					var requestData = {};

					var searchValue = '';
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
					//console.log('请求数据:' + JSON.stringify(requestData));
					//console.log("搜素值:" + searchValue);

					//支持同步，也支持异步，注意，异步时不允许return 否则会请求多次

					//return requestData;
					callback && callback(requestData);
				},
				itemClickCallback: function(e) {
					console.log("点击:" + this.id);
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