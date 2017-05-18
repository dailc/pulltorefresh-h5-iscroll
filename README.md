## H5下拉刷新皮肤系列
基于`IScroll`的全套下拉刷新皮肤。各式各样的皮肤。以及下拉刷新实现基类供自定义UI实现。

### Effect(效果)

* 效果1
![](https://dailc.github.io/pullToRefresh-h5-iscroll/staticresource/img/effect1.gif)

* 效果2
![](https://dailc.github.io/pullToRefresh-h5-iscroll/staticresource/img/effect2.gif)

* 效果3
![](https://dailc.github.io/pullToRefresh-h5-iscroll/staticresource/img/effect3.gif)

* 效果4
![](https://dailc.github.io/pullToRefresh-h5-iscroll/staticresource/img/effect4.gif)

* 效果5
![](https://dailc.github.io/pullToRefresh-h5-iscroll/staticresource/img/effect5.gif)

* 效果6
![](https://dailc.github.io/pullToRefresh-h5-iscroll/staticresource/img/effect6.gif)

* 示例页面
[下拉刷新皮肤示例](https://dailc.github.io/pullToRefresh-h5-iscroll/examples/html/)

### How To Use(使用)

* Require(引入脚本)

	```
	<script type="text/javascript" src="../../../dist/Tools.PullToRefresh.IScroll.Probe.js" ></script>
	<script type="text/javascript" src="../../../dist/Tools.PullToRefresh.Skin.Default.js"></script>
	```
	可以将`Skin.Default`替换为对应的皮肤
	
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
	var pullToRefreshObj = PullToRefreshSkinDefault.initPullToRefresh({
	    //这里用默认设置
	    element: '#pullrefresh',
	    //down为null表示不要下拉刷新    
	    down: {
	        callback: pullDownRefreshCallback,
	        //是否显示成功动画
	        isSuccessTips: true,
	    },
	    //up为null为不要上拉
	    //上拉有关
	    up: {
	        //是否自动上拉加载-初始化是是否自动
	        auto: true,
	
	        callback: pullUpRefreshCallback
	    },
	    scroll: {
	        bounceTime: 500,
	        //回弹动画时间
	        //下拉刷新和上拉加载成功动画的时间
	        successAnimationTime: 500
	    },
	});
	```
	具体可以将`PullToRefreshSkinDefault`换为具体皮肤，其它更多操作参考示例

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
	* 如果使用了非mui外的皮肤，需要引入样式文件`PullToRefresh-Skin.css`
	* 另外，也支持`require`方式引入，不过webpack打包出来的dist中，就算`require`引入了，也请通过全局变量方式来使用，如`PullToRefreshSkinDefault`

* (Global Variable)相应的全局变量与JS文件

	```
	IScroll //PullToRefresh-IScroll-Probe.js
	PullToRefreshCore //PullToRefresh-Core.js
	PullToRefreshSkinDefault //PullToRefresh-Skin-Default.js
	PullToRefreshSkinType1 //PullToRefresh-Skin-Type1.js
	PullToRefreshSkinType2 //PullToRefresh-Skin-Type2.js
	PullToRefreshSkinType3 //PullToRefresh-Skin-Type3.js
	PullToRefreshSkinType4 //PullToRefresh-Skin-Type4.js
	PullToRefreshSkinMuiDefault //PullToRefresh-Skin-Mui-Default.js
	PullToRefreshSkinMuiType1 //PullToRefresh-Skin-Mui-Type1.js
	PullToRefreshSkinMuiType2 //PullToRefresh-Skin-Mui-Type2.js
	PullToRefreshSkinMuiType3 //PullToRefresh-Skin-Mui-Type3.js
	PullToRefreshSkinNative	//PullToRefresh-Skin-Native.js
	PullToRefreshTools	//PullToRefresh-Bizlogic-Impl.js
	```
	

### 关于
除了基于mui的默认皮肤外，其它皮肤都是基于`IScroll5`的，所以打包出来后文件都要大很多(不过可以脱离mui使用)。

另外需要注意的是，其中基于`mui.js`的几个皮肤，里面的`mui.js`是改造过的(因为原版的mui不支持严格模式，babel编译报错的)，实际使用中可以换为自己的mui.js

另外，后续会定期更新皮肤

### 更多说明

* [examples目录结构说明](https://github.com/dailc/pullToRefresh-h5-iscroll/tree/master/examples/html)
* [源码使用说明](https://github.com/dailc/pullToRefresh-h5-iscroll/tree/master/src/)

#### 相关博文

* [H5下拉刷新,多种皮肤，便于拓展！](http://www.jianshu.com/p/ef3183adb896)

## 更新日志

* 20170410
	* 增加cmd引入支持
	* 修复IScroll内部`maxScrollY`引起的冲突
* 20170518
	* 修复关闭上拉加载后，重复下拉刷新报错的bug

## License (MIT)