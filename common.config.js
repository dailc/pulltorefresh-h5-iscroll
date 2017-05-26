const path = require('path'); // 导入路径包
module.exports = {
	// 是否上线,上线才会进行一些压缩等耗时工作
	isRelease: true,
	//web-dev-server有两种类型，iframe和inline，默认是iframe
	isInlineServer: false,
	isUseSourceMap: false,
	isAssetsJson: false,
	// 发布的路径，之所以写死路径，是用来解决webpack中的css路径引入问题
	//publicPath:'http://192.168.114.35:8020/wodenanjing/dist/',//hbuild服务器，无法自动刷新
	//devPublicPath: 'http://localhost:8080/dist/', //webpack-dev-server服务器
	devPublicPath: 'http://192.168.114.35:8080/dist/', //webpack-dev-server服务器
	//如android路径 file:///android_asset/dist/
	releasePublicPath: 'https://github.com/dailc/pullToRefresh-h5-iscroll/dist/',
	// 本地的build路径
	buildPath: 'dist',
	//favicon路径
	favicon:'src/img/favicon.ico',
	// 定义通用路径
	codeResource: './src',
	copyRight: 'pulltorefresh 2.0.0 @copyright dailc https://github.com/dailc/pullToRefresh-h5-iscroll'
};