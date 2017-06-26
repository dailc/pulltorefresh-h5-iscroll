/**
 * 作者: dailc
 * 时间: 2017-04-05 
 * 描述: 这里是同时生成多个下拉刷新
 */
(function(exports) {
	/**
	 * @description 初始化下拉刷新
	 */
	function initPullRefreshList(pullToRefreshBase, options) {
		options = options || {};
		isAuto = options.isAuto||false;
		var container = options.container;
		var listContainer = options.listContainer;
		// 以下几个是测试加载更多,没有更多数据功能的
		// 当前页
		var currpage = 0;
		// 每页大小
		var pageSize = 10;
		// 总共大小，这里用来判断是否可以上拉加载
		// 实际业务中，可以不基于totalcount判断的，直接根据接口返回的数据进行判断
		var totalCount = 21;
		var pullToRefreshObj = new pullToRefreshBase({
			// 这里用默认设置
			container: container,
			down: {
				callback: pullDownRefreshCallback,
				// 是否显示成功动画
				isSuccessTips: true,
			},
			// down为null表示不要下拉刷新
			// down: null,
			// 上拉有关
			up: {
				// 是否自动上拉加载-初始化是是否自动
				auto: isAuto || false,

				callback: pullUpRefreshCallback
			},
			scroll: {
				bounceTime: 500, // 回弹动画时间
				// 下拉刷新和上拉加载成功动画的时间
				successAnimationTime: 500,
				// 是否嵌套，嵌套的话就不会preventDefault了
				eventPassthrough: 'horizontal'
			},
		});

		function pullDownRefreshCallback() {
			var self = this;
			// console.log("下拉刷新");
			setTimeout(function() {
				// 下拉刷新当前页变为0
				currpage = 0;
				// 测试每次添加10条
				testAppendData(pageSize, true);
				resetState(true);
			}, 1000);
		}

		function pullUpRefreshCallback() {
			var self = this;
			// console.log("上拉加载");
			setTimeout(function() {
				//请求数据
				//当前页++
				currpage++;
				//测试每次添加10条
				testAppendData(pageSize, false);
				resetState(false);
			}, 500);

		}
		/**
		 * @description 测试添加数据
		 * 真实情况添加的数据要根据接口返回数据映射
		 * @param {Number} count 数量
		 * @param {Boolean} isPullDown 是否是下拉刷新
		 */
		function testAppendData(count, isPullDown) {
			isPullDown = isPullDown || false;
			var fragment = document.createDocumentFragment();

			var li;
			for(var i = 0; i < count; i++) {
				li = document.createElement('li');
				li.className = 'mui-table-view-cell';
				li.id = 'id_' + i;
				li.innerHTML = '测试item' + currpage + '-' + (i + 1);
				fragment.appendChild(li);
			}

			var dataContainer = document.querySelector(listContainer);
			// 添加-下拉刷新时先清除数据
			if(isPullDown) {
				dataContainer.innerHTML = '';
			}
			dataContainer.appendChild(fragment);
		}
		/**
		 * @description 重置状态
		 * @param {Boolean} isPullDown 是否是上拉加载
		 */
		function resetState(isPullDown) {
			if(isPullDown) {
				pullToRefreshObj.endPullDownToRefresh();
				if(pullToRefreshObj.finished) {
					pullToRefreshObj.refresh(true);
				}
			}
			// 判断当前页的数据是否已经大于totalCount
			var itemLength = document.querySelector(listContainer).children.length;
			if(itemLength >= totalCount) {
				pullToRefreshObj.endPullUpToRefresh(true);
			} else {
				pullToRefreshObj.endPullUpToRefresh(false);
			}
		}

		function refresh() {
			// 清空dom
			document.querySelector(listContainer).innerHTML = '';
			currpage = -1; //这个必须要变
			// 手动将状态设为可以加载更多
			if(pullToRefreshObj.finished) {
				pullToRefreshObj.refresh(true);
			}
			// 当然也可以换为其它的刷新方法
			pullToRefreshObj.pullupLoading();
		}
		return {
			refresh: refresh
		};
	}



	exports.init = function(pullToRefreshObj) {
		initPullRefreshList(pullToRefreshObj, {
			isAuto:true,
			container:'#pullrefresh1',
			listContainer:'#listdata1'
		});
		initPullRefreshList(pullToRefreshObj, {
			isAuto:false,
			container:'#pullrefresh2',
			listContainer:'#listdata2'
		});
	};
	
	window.demoPullToRefresh = exports;
})({});