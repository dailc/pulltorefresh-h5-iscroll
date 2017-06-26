/**
 * pulltorefresh-h5-iscroll - 一款基于IScroll5的H5下拉刷新实现，包括多种皮肤的实现
 * @version v3.0.0
 * @author 
 */
!function(e,t){!function(){e.dataProcessFn=[],e.dataProcess=function(t,o){o=o||{},"string"==typeof o.dataPath&&(o.dataPath=[o.dataPath]);var s=[].slice.call(arguments),n={code:0,message:"",data:null,status:0,debugInfo:{type:"未知数据格式"}},a=o.isDebug||!1,i=o.dataPath,l=e.dataProcessFn,r=l.length,c=i.length,u=!1;if(!t)return n.message="接口返回数据为空!",n;s.push(n);for(var p=0;!u&&p<c;p++){s[1]=i[p];for(var g=0;!u&&g<r;g++){var f=l[g],d=f.apply(this,s);if(null!=d&&(1==d.code||p==c-1)){u=!0,n=d;break}}}return u||(n.message="没有数据处理函数或者接口数据返回格式不符合要求!",n.debugInfo.data=t),a||(n.debugInfo=void 0),n}}(),function(){function o(e,o,s){if(!(o&&e&&e.ReturnInfo&&e.BusinessInfo))return null;var n={type:"v6数据格式:"+o},a=e.ReturnInfo,i=e.BusinessInfo;e.UserArea;if("1"==a.Code)if("1"==i.Code){var l=t.getNameSpaceObj(e,o);l?(s.code=1,s.data=l):(s.code=0,s.message=s.message||"指定路径下没有找到数据",s.data=null,n.errorType="3")}else n.errorType="2",s.code=0,s.message=i.Description||"接口请求错误,后台业务逻辑处理出错!";else n.errorType="1",s.code=0,s.message=a.Description||"接口请求错误,后台程序处理出错!";return s.debugInfo=n,s}e.dataProcessFn.push(o)}(),function(){function o(e,o,s){if(!(o&&e&&e.status&&e.custom))return null;var n={type:"v7数据格式:"+o},a=e.status;if(s.status=a.code||0,s.message=a.text,"200"==a.code){var i=t.getNameSpaceObj(e,o);i?(s.code=1,s.data=i):(s.code=0,s.message=s.message||"指定路径下没有找到数据",s.data=null,n.errorType="3")}else s.code=0,n.errorType="2",s.message=s.message||"status状态错误";return s.debugInfo=n,s}e.dataProcessFn.push(o)}(),t.namespace("dataProcess",e.dataProcess)}({},PullToRefreshTools),function(e,t){function o(e){if(null==e||"string"!=typeof e)return null;var t,o=document.createElement("div"),s=document.createDocumentFragment();for(o.innerHTML=e;t=o.firstChild;)s.appendChild(t);return s}function s(e){var o=this;if(e=t.extend(!0,{},r,e),!e.skin)throw new Error("错误:传入的下拉刷新皮肤错误,超出范围!");n=e.skin,e.down&&(e.down.callback=function(){o.pullDownCallback()}),e.up&&(e.up.callback=function(){o.pullUpCallback()}),o.options=e,o.respnoseEl=document.getElementById(e.bizlogic.listdataId),o.isShouldNoMoreData=!0,o.currPage=o.options.bizlogic.defaultInitPageNum,o.options.up&&o.options.up.auto&&o.currPage--,o.initAllEventListeners(),o.pullToRefreshInstance=new n(e)}var n,a=t.dataProcess,i="ontouchstart"in document,l=i?"tap":"click",r={isDebug:!1,down:{height:75,contentdown:"下拉可以刷新",contentover:"释放立即刷新",contentrefresh:"正在刷新",contentrefreshsuccess:"刷新成功",contentrefresherror:"刷新失败",isSuccessTips:!0},up:{auto:!0,offset:100,show:!0,contentdown:"上拉显示更多",contentrefresh:"正在加载...",contentnomore:"没有更多数据了"},bizlogic:{defaultInitPageNum:0,getLitemplate:null,getUrl:null,getRequestDataCallback:null,changeResponseDataCallback:null,successRequestCallback:null,errorRequestCallback:null,refreshCallback:null,itemClickCallback:null,targetListItemClickStr:"li",listdataId:"#listdata",pullrefreshId:"#pullrefresh",delayTime:300,ajaxSetting:{requestType:"POST",requestTimeOut:15e3,accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:"application/json",xml:"application/xml, text/xml",html:"text/html",text:"text/plain"},contentType:"application/x-www-form-urlencoded",headers:null},isRendLitemplateAuto:!0}};s.prototype.pullDownCallback=function(){var e=this;e.loadingDown||(e.isPullDown=!0,e.loadingDown=!0,e.currPage=e.options.bizlogic.defaultInitPageNum,setTimeout(function(){e.ajaxRequest()},e.options.bizlogic.delayTime),e.options.bizlogic.refreshCallback&&e.options.bizlogic.refreshCallback(!0))},s.prototype.pullUpCallback=function(){var e=this;e.loadingUp||(e.isPullDown=!1,e.loadingUp=!0,e.currPage++,setTimeout(function(){e.ajaxRequest()},e.delayTime))},s.prototype.initAllEventListeners=function(){var e=this;e.setElemListeners()},s.prototype.setElemListeners=function(){var e=this;e.options.bizlogic.itemClickCallback&&mui("#"+e.options.bizlogic.listdataId).on(l,e.options.bizlogic.targetListItemClickStr,e.options.bizlogic.itemClickCallback)},s.prototype.refresh=function(){var e=this;e.options.up&&e.pullToRefreshInstance.enablePullUp?e.loadingUp||(e.clearResponseEl(),e.currPage=e.options.bizlogic.defaultInitPageNum-1,e.loadingMore()):(e.clearResponseEl(),e.pullDownCallback())},s.prototype.loadingMore=function(e){var t=this;t.loadingMoreSuccess=e,t.pullToRefreshInstance.finished&&(t.pullToRefreshInstance.refresh(!0),t.isShouldNoMoreData=!0),t.pullToRefreshInstance.pullupLoading()},s.prototype.disablePullupToRefresh=function(){this.pullToRefreshInstance.disablePullupToRefresh()},s.prototype.enablePullupToRefresh=function(){this.pullToRefreshInstance.enablePullupToRefresh()},s.prototype.ajaxRequest=function(){var e=this;if(!e.options.bizlogic.getUrl)return e.options.isDebug&&console.error("error***url无效,无法访问"),void e.errorRequest(null,null,"请求url为空!");var t=function(t){var o="";o="function"==typeof e.options.bizlogic.getUrl?e.options.bizlogic.getUrl():e.options.bizlogic.getUrl,mui.ajax(o,{data:t,dataType:"json",timeout:e.options.bizlogic.requestTimeOut,type:e.options.bizlogic.ajaxSetting.requestType,accepts:e.options.bizlogic.ajaxSetting.accepts,headers:e.options.bizlogic.ajaxSetting.headers,contentType:e.options.bizlogic.ajaxSetting.contentType,success:function(t){e.successRequest(t)},error:function(t,o){e.errorRequest(t,o,"请求失败!")}})};if(e.options.bizlogic.getRequestDataCallback){var o=e.options.bizlogic.getRequestDataCallback(e.currPage,function(e){t(e)});void 0!==o&&t(o)}else e.options.isDebug&&console.warn("warning***请注意getData不存在,默认数据为空"),t()},s.prototype.errorRequest=function(e,t,o){var s=this;s.isShouldNoMoreData=!1,s.refreshState(!1),s.currPage--,s.currPage=s.currPage>=s.defaultInitPageNum?s.currPage:s.defaultInitPageNum,s.options.bizlogic.errorRequestCallback&&s.options.bizlogic.errorRequestCallback(e,t,o)},s.prototype.successRequest=function(e,t){var s=this;if(!e)return s.options.isDebug&&console.log("warning***返回的数据为空,请注意！"),s.isShouldNoMoreData=!1,void s.refreshState(!1);if(s.options.isDebug&&console.log("下拉刷新返回数据:"+JSON.stringify(e)),e=s.options.bizlogic.changeResponseDataCallback?s.options.bizlogic.changeResponseDataCallback(e):s.defaultChangeResponseData(e),s.options.bizlogic.isRendLitemplateAuto){s.isPullDown&&s.clearResponseEl();var n=0;if(window.Mustache)if(e&&Array.isArray(e)&&e.length>0){for(var a="",i=0;i<e.length;i++){var l=e[i],r="";s.options.bizlogic.getLitemplate&&("string"==typeof s.options.bizlogic.getLitemplate?r=s.options.bizlogic.getLitemplate:"function"==typeof s.options.bizlogic.getLitemplate&&(r=s.options.bizlogic.getLitemplate(l)));var c=Mustache.render(r,l);a+=c,n++}""!=a&&s.respnoseEl.appendChild(o(a))}else s.isShouldNoMoreData=!1;else s.isShouldNoMoreData=!1,1==s.options.isDebug&&console.error("error***没有包含mustache.min.js,无法进行模板渲染")}s.options.bizlogic.successRequestCallback&&"function"==typeof s.options.bizlogic.successRequestCallback&&s.options.bizlogic.successRequestCallback(e,s.isPullDown||s.currPage==s.options.bizlogic.defaultInitPageNum),t||s.refreshState(!0,n)},s.prototype.defaultChangeResponseData=function(e){var t=a(e,{dataPath:["custom.infoList","custom.list","UserArea.InfoList"]});return t.data},s.prototype.refreshState=function(e,t){var o=this;t=t||0,o.pullToRefreshInstance.setSuccessTips&&o.pullToRefreshInstance.setSuccessTips("更新"+t+"条数据"),o.isPullDown&&(o.pullToRefreshInstance.endPullDownToRefresh(e),o.pullToRefreshInstance.finished&&(o.pullToRefreshInstance.refresh(!0),o.isShouldNoMoreData=!0)),o.isShouldNoMoreData?o.pullToRefreshInstance.endPullUpToRefresh(!1,e):o.pullToRefreshInstance.endPullUpToRefresh(!0,e),o.loadingDown=!1,o.loadingUp=!1},s.prototype.clearResponseEl=function(){var e=this;e.options.bizlogic.isRendLitemplateAuto&&e.respnoseEl&&(e.respnoseEl.innerHTML="")},s.init=function(e,t){var o=new s(e);return t&&t(o),o},t.namespace("bizlogic",s)}({},PullToRefreshTools);