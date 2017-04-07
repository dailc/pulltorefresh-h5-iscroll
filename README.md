## H5下拉刷新皮肤系列
基于`IScroll`的全套下拉刷新皮肤。各式各样的皮肤。以及下拉刷新实现基类供自定义UI实现。

### 效果

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
[下拉刷新皮肤示例](https://dailc.github.io/pullToRefresh-h5-iscroll/examples/)

### 使用
有两种使用方式:

* 一种是像`examples`里面的一样，直接引入脚本，然后使用
* 另一种是通过`require`引入，`dist`中打包出来的几个脚本都支持这种引用方式。

另外需要注意的是，其中基于`mui.js`的几个皮肤，里面的`mui.js`是改造过的(因为原版的mui不支持严格模式，babel编译报错的)

### 关于
除了基于mui的默认皮肤外，其它皮肤都是基于`IScroll5`的，所以打包出来后文件都要大很多(不过可以脱离mui使用)。
另外，其实一些canvas动画或者css3动画的下拉刷新在某些手机中还挺卡的，因此比较实用的其实是基于mui那个下拉刷新自定义图片

### 更多说明

* [examples目录结构说明](https://github.com/dailc/pullToRefresh-h5-iscroll/tree/master/examples/html)
* [源码使用说明](https://github.com/dailc/pullToRefresh-h5-iscroll/tree/master/src/)
