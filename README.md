## H5下拉刷新皮肤系列
基于`IScroll`的全套下拉刷新皮肤。各式各样的皮肤。以及下拉刷新实现基类供自定义UI实现。

### Effect(效果)

* 效果1
![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect1.gif)

* 效果2
![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect2.gif)

* 效果3
![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect3.gif)

* 效果4
![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect4.gif)

* 效果5
![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect5.gif)

* 效果6
![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect6.gif)

* 示例页面
[下拉刷新皮肤示例](https://dailc.github.io/pulltorefresh-h5-iscroll/examples/html/)

### How To Use(使用)

* Require(引入脚本)

	```
	<script type="text/javascript" src="../../../dist/pulltorefresh.skin.default.js"></script>
	```
	可以将`skin.default`替换为对应的皮肤
	
* HTML Structure(页面结构)

	```
	<div class="×××-scroll-wrapper">
	    <div class="×××-scroll">
	        ...
	    </div>
	</div>
	```
	譬如，如果基于mui的，就可以是`mui-scroller-wrapper`，其它的自己定义对应scroll样式即可

* JS Initialization(JS初始化)
	
	```
	var pullToRefreshObj = new PullToRefreshTools.skin.default({
	    // 这里用默认设置
	    container: '#pullrefresh',
	    // down为null表示不要下拉刷新    
	    down: {
	        callback: pullDownRefreshCallback,
	        // 是否显示成功动画
	        isSuccessTips: true,
	    },
	    // up为null为不要上拉
	    // 上拉有关
	    up: {
	        // 是否自动上拉加载-初始化是是否自动
	        auto: true,
	
	        callback: pullUpRefreshCallback
	    },
	    scroll: {
	        bounceTime: 500,
	        // 回弹动画时间
	        // 下拉刷新和上拉加载成功动画的时间
	        successAnimationTime: 500
	    },
	});
	```
	具体可以将`PullToRefreshTools.skin.default`换为其它皮肤，其它更多操作参考示例

* API(暴露出来的方法)

	```
	* finished //这是一个属性，用来控制当前上拉加载是否可用
	* refresh() //重置状态。譬如上拉加载关闭后需要手动refresh重置finished状态
	* pulldownLoading() //主动触发一个下拉刷新的动画(同时会触发下拉回调)
	* pullupLoading() //主动触发一个上拉加载的动画(同时会触发上拉回调)
	* endPullDownToRefresh() //关闭下拉刷新动画，重置状态
	* endPullUpToRefresh(finished) //关闭上拉加载动画，重置状态，如果finished，则不允许在上拉，除非再次refresh()
	```
	关于更多的使用说明(如自定义UI类的实现，请参考最后的更多说明)
	
* (Notice)注意
    * `default`皮肤和`type1`皮肤依赖于`mui.css`
	* 其它皮肤依赖于样式文件`pulltorefresh.skin.css`
	* 另外，也支持`require`方式引入，`require`后，请通过全局变量方式来使用，如`PullToRefresh.skin.defaults`

* (Global Variable)相应的全局变量与JS文件

	```
	IScroll // 内部的IScroll5保留的全局变量
	PullToRefreshTools.core // pulltorefresh.core.js，可以通过这个文件实现自定义皮肤
	PullToRefreshTools.skin.defaults // pulltorefresh.skin.default.js 需要和关键字区分
	PullToRefreshTools.skin.type1 // pulltorefresh.skin.type1.js
	PullToRefreshTools.skin.type2 // pulltorefresh.skin.type2.js
	PullToRefreshTools.skin.type3 // pulltorefresh.skin.type3.js
	PullToRefreshTools.skin.type4 // pulltorefresh.skin.type4.js
	PullToRefreshTools.skin.natives	// pulltorefresh.skin.native.js 需要和保留字区分
	PullToRefreshTools.bizlogic	// pulltorefresh.bizlogic.implxx.js 系列，依赖于核心下拉刷新文件(随便一个皮肤即可)
	```
	

### 关于
下拉刷新所有皮肤内部都默认引入了IScroll5 **但是进行了一些轻微改动(主要是增加了功能，用来方便下拉刷新的实现，并不影响原本使用)**
因此如果项目中其它地方有用到IScroll5，无需在引入，直接通过`IScroll`即可使用

后续会定期更新皮肤

### 更多说明

* [examples目录结构说明](https://github.com/dailc/pulltorefresh-h5-iscroll/tree/master/examples/html)
* [源码使用说明](https://github.com/dailc/pulltorefresh-h5-iscroll/tree/master/src/)

#### 相关博文

* [H5下拉刷新,多种皮肤，便于拓展！](http://www.jianshu.com/p/ef3183adb896)

## 更新日志

* 20170410
	* 版本`1.0.0`
	* 增加cmd引入支持
	* 修复IScroll内部`maxScrollY`引起的冲突
* 20170518
	* 修复关闭上拉加载后，重复下拉刷新报错的bug
* 20170526
	* 版本`2.0.0`
	* 从源码层面重新修改命名空间
	* 后续命名层面不会再有大的改动
* 20170601
	* 内部源码优化
	* 不影响以前的使用
* 20170608
	* 修改项目名称，同步修改示例资源路径
* 20170609
    * 源码目录结构微调，不影响使用
* 20170612
    * showcase将`targetPullToRefresh`简化为`skin`
* 20170615
    * 版本`3.0.0`
    * API设计简化
    * 去除不推荐使用的mui皮肤
    * IScroll打包到内部
* 20170621
    * 更新`native`皮肤引入时的bug-由于重复打包core，导致命名冲突
* 20170626
    * 下拉刷新内部优化，调用方式默认变为`new`的使用方式

## License (MIT)