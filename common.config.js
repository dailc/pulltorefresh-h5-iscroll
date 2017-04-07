const path = require('path'); // 导入路径包
module.exports = {
	// 是否上线,上线才会进行一些压缩等耗时工作
	isRelease: false,
	//web-dev-server有两种类型，iframe和inline，默认是iframe
	isInlineServer: false,
	isUseSourceMap: false,
	isAssetsJson: false,
	// 发布的路径，之所以写死路径，是用来解决webpack中的css路径引入问题
	//publicPath:'http://192.168.114.35:8020/wodenanjing/dist/',//hbuild服务器，无法自动刷新
	//devPublicPath: 'http://localhost:8080/dist/', //webpack-dev-server服务器
	devPublicPath: 'http://192.168.114.35:8080/dist/', //webpack-dev-server服务器
	//如android路径 file:///android_asset/dist/
	releasePublicPath: 'https://dailc.github.io/hybrid_ejs/ejs.webpack.showcase/dist/',
	// 本地的build路径
	buildPath: 'dist',
	//favicon路径
	favicon:'src/img/favicon.ico',
	// 是否抽取公共chunk-抽取后会有额外消耗，谨慎
	commonChunkConfig: {
		isCommonChunk: false,
		//同时引入超过几次(>=)后就会提取成公告文件
		//实际项目中时要慎重使用，比如showcase中页面超过60个，这时候，可以手动设置40左右比较合适
		//或者采取"isAuto=true"这个值，它会自动计算htmlPages的数量大小，并取2/3
		minChunks: 3,
		//是否自动计算，自动计算时，会默认取pages数的2/3作为公共资源，优先级大于手动设置
		isAuto:true,
		// 如果抽取，则抽取的公用文件为
		chunkName: 'vendor/vendor',
		manifestName: 'vendor/vendor.bundle'
	},
	// 定义通用路径
	codeResource: './src',
	// 定义html页面配置,定义每一个html应该引入的JS文件
	htmlPagesConfig: {
		//是否自动生成，自动生成时，默认配置的htmlPages会失效，改为自动读取
		//到那时得符合开发规范
		isAutoGenerate:true,
		//手动配置时的htmlPage示例，auto时不会生效
		htmlPages:[{
			//页面模板对应的路径,默认就是在pages目录下
			//auto设置时，这个不起作用
			template: 'index.html',
			//页面入口js对应的路径
			chunks: ['js/index'],
		}],
		//需要排除的页面，请输入如上述的路径数组，排除的页面不会自动生成
		//默认相应的html和js都不会在输出
		//比如这个配置会自动忽略pages/***.html以及js/***.js
		//以下这个是示例的排除页面
		exclude:['commonStyles/demo_detail','commonStyles/demo_input']
	},
	//别名配置
	//这里依赖了项目本身的别名以及框架别名
	aliasConfig: {
		//业务的别名示例，请使用绝对路径
		//页面中的通用业务处理文件
		'bizlogic_common_default': path.join(__dirname, "./src/js/common/bizlogic_common_default.js"),
		'bizlogic_common_require_list': path.join(__dirname, "./src/js/common/bizlogic_common_require_ejs.js"),
		'bizlogic_common_require_default': path.join(__dirname, "./src/js/common/bizlogic_common_require_default.js"),
		
		'bizlogic_common_ejs_default': path.join(__dirname, "./src/js/common/bizlogic_common_ejs_default.js"),
		'litemplate_pulltorefresh_biz_default': path.join(__dirname, "./src/js/common/litemplate_pulltorefresh_biz_default.js"),

		//自定义模块
		'freshmanual_customeModule': path.join(__dirname, "./src/js/common/bizlogic_freshmanual_customeModule.js"),
		'BaiDuMap_Tools': path.join(__dirname, "./src/js/common/BaiDuMapTools.js"),
	}

};