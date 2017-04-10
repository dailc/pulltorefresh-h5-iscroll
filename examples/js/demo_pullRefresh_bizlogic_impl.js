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
		var pullToRefreshObj = PullToRefreshTools.initPullDownRefresh({
			'targetPullToRefresh': pullToRefreshBase,
			'isDebug': false,
			'bizlogic': {
				defaultInitPageNum: 0,
				ajaxSetting: {
					//请求类别,默认为POST
					requestType: 'GET',
				},
				getUrl: '../../json/testList.json',
				getLitemplate: '<li class="mui-table-view-cell"id="{{InfoID}}"><p class="cell-title">{{Title}}</p><p class="cell-content"><span class="cell-content-subcontent"></span><span class="cell-content-time">{{InfoDate}}</span></p></li>',
				getRequestDataCallback: function(currPage, callback) {
					var requestData = {};
					callback && callback(requestData);
				},
				itemClickCallback: function(e) {
					console.log("点击:" + this.id);
				},
			},
			scroll: {
				//是否嵌套，嵌套的话就不会preventDefault了
				eventPassthrough: 'horizontal'
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
	} else if(typeof define == 'function' && define.amd || define.cmd) {
		define(function() { return exports; });
	} 
	window.demoPullToRefresh = exports;
})({});