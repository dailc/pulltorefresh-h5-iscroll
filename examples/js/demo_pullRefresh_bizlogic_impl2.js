/**
 * 作者: dailc
 * 时间: 2017-04-05 
 * 描述: 这里将下拉刷新与业务实现相关代码抽取出来
 * 实现2
 */
(function(exports) {
    var pullToRefreshBiz,
        pullToRefreshBase;
    /**
     * @description 初始化下拉刷新
     */
    function initPullRefreshList(isAuto) {
        var pullToRefreshObj = PullToRefreshTools.bizlogic.initPullDownRefresh({
            'targetPullToRefresh': pullToRefreshBase,
            "method": 'GET',
            'initPageIndex': 0,
            'url': '../../json/testList.json',
            'litemplate': '<li class="mui-table-view-cell"id="{{InfoID}}"><p class="cell-title">{{Title}}</p><p class="cell-content"><span class="cell-content-subcontent"></span><span class="cell-content-time">{{InfoDate}}</span></p></li>',
            'requestData': function(currPage, callback) {
                var requestData = {};
                callback && callback(requestData);
            },
            'itemClick': function(e) {
                console.log("点击:" + this.id);
            }
            // 涉及到下拉刷新本身的配置
            'options': {
                scroll: {
                    //是否嵌套，嵌套的话就不会preventDefault了
                    eventPassthrough: 'horizontal'
                }
            }
        });
        return pullToRefreshObj;
    }
    
    // 简单调用
    function initPullRefreshList2(isAuto) {
        PullToRefreshTools.bizlogic.initPullDownRefresh({
            'targetPullToRefresh': pullToRefreshBase,
           
        });
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

        pullToRefreshBiz.disablePullupToRefresh();
        pullToRefreshBiz.enablePullupToRefresh();
    };

    window.demoPullToRefresh = exports;
})({});