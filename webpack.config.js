const path = require('path'); // 导入路径包
const fs = require('fs');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const htmlPagePluginConfig = require('./htmlpage.config.js');
const codeResource = require('./common.config.js').codeResource;
const webpack = require('webpack');
const config = require('./common.config.js');
// 赋值静态资源
const CopyWebpackPlugin = require('copy-webpack-plugin');
//用来将资源生成映射json文件的插件
const AssetsPlugin = require('assets-webpack-plugin');
//图片压缩
const ImageminPlugin = require('imagemin-webpack-plugin').default
// 样式补全
const autoprefixer = require('autoprefixer');
//框架的别名
const coresAliasConfig = require('./alias.config.js');

let htmlPagesConfig = config.htmlPagesConfig;

const extend = function(destination, source) {
	for(var property in source) {
		destination[property] = source[property];
	}
	return destination;
};
// 找需要编译的路径
let entry = {};
let bannerExcludeFiles = [];

function walk(dir, root) {
	root = root || './';
	dir = dir || '';
	let directory = path.join(__dirname, root, dir);
	fs.readdirSync(directory)
		.forEach(function(file) {
			let fullpath = path.join(directory, file);
			let stat = fs.statSync(fullpath);
			let extname = path.extname(fullpath);
			if(stat.isDirectory() && file !== 'core' && file !== 'lib' && file !== 'static' && file !== 'config') {
				let subdir = path.join(dir, file);
				walk(subdir, root);
			} else if(stat.isFile() && (extname === '.js')) {
				let name = path.join(dir, path.basename(file, extname));
				name = name.replace(/\\/g, '/');
				let nameWithOutPath = name.substr(name.indexOf('js/') + 3);
				//console.log("nameWithOutPath:"+nameWithOutPath+',js文件:' + name);
				if(htmlPagesConfig.exclude && htmlPagesConfig.exclude.indexOf(nameWithOutPath) == -1) {
					entry[name] = fullpath;
					//console.log("js文件:" + name);
				}

			}
		});
}

walk('./', codeResource);

// 合并css与html的插件
let plugins = htmlPagePluginConfig.plugin.concat([
	// 这样会定义，所有js文件中通过require引入的css都会被打包一个css
	// 默认这个css命名为对应文件
	// 由于默认路径是 css/js/***.css  所以我们需要将路径通过函数改成 css/***.css
	new ExtractTextPlugin({
		filename: function(getPath) {
			let fullName = config.isRelease ? "[name]-[contenthash].css" : "[name].css";
			fullName = 'css/' + fullName;
			return getPath(fullName).replace('css/js', 'css');
		}
	}),
	// 复制静态资源
	new CopyWebpackPlugin([{
		from: config.codeResource + '/static',
		//默认已经是 buildPath 输出目录了
		to: 'static'
	}]),
	// Make sure that the plugin is after any plugins that add images
	// 图片压缩要在CopyWebpackPlugin之后
	new ImageminPlugin({
		disable: !config.isRelease, // Disable during development
		//这里的配置得精心调试，否则可能损坏图片或者报错
	})
]);

if(config.isAssetsJson) {
	//如果使用assets插件
	plugins.push(
		new AssetsPlugin({
			filename: 'assets-map.json',
			path: path.join(__dirname, config.buildPath, 'assets'),
			// update:true代表不会覆盖，而是更新
			update: true,
			prettyPrint: true
		}));
}
//暂时改为debug也压缩了
let releasePlugins = [
	// 压缩js
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		//支持sourceMap
		sourceMap: true,
		//排除关键字，
		except: ['exports', 'require']
	}),
];
plugins = plugins.concat(releasePlugins);
// 如果有配置抽取公共文件
if(config.commonChunkConfig.isCommonChunk) {
	//默认是手动设置的值
	let minChunks = config.commonChunkConfig.minChunks;
	if(config.commonChunkConfig.isAuto) {
		//如果自动设置了，优先级更高，取页面的2/3大小
		minChunks = parseInt(htmlPagePluginConfig.plugin.length * 2 / 3);
	}
	let chunkPlugins = [
		// 抽取公用模块
		new webpack.optimize.CommonsChunkPlugin({
			//默认加上js/前缀  css的话，vendor会自动处理掉js/路径的
			name: 'js/' + config.commonChunkConfig.chunkName,
			// 至少多少次公共出现后才会抽取
			minChunks: minChunks
		}),
		new webpack.optimize.CommonsChunkPlugin({
			// https://www.zhihu.com/question/31352596/answer/127369675?from=profile_answer_card
			name: 'js/' + config.commonChunkConfig.manifestName,
			chunks: ['js/' + config.commonChunkConfig.chunkName]
		}),
	];

	plugins = plugins.concat(chunkPlugins);
}
module.exports = {
	entry: entry, // 入口文件

	// 输出文件 build下的bundle.js
	output: {
		// 用来解决css中的路径引用问题
		publicPath: config.isRelease ? config.releasePublicPath : config.devPublicPath,
		path: path.resolve(__dirname, config.buildPath),
		// 注意要使用chunkhash
		filename: config.isRelease ? "[name]-[chunkhash].js" : "[name].js",
		sourceMapFilename: 'maps/[file].map'
	},
	resolve: {
		//如果有别名配置
		alias: extend(config.aliasConfig || {}, coresAliasConfig),
	},

	// 使用loader模块
	module: {
		loaders: [{
			// 分为压缩的和非压缩的，不会重复，否则可能会报错
			// 包含css 但却不包含.min.css的
			// 正则表达式元字符需要了解
			//(?!exp)  匹配后面跟的不是exp的位置
			test: /^((?!\.min\.css).)*\.css/,
			loader: ExtractTextPlugin.extract({
				fallback: "style-loader",
				// 压缩css
				use: [config.isRelease ? "css-loader?minimize" : "css-loader", "postcss-loader"]
			})
		}, {
			// 包含css 包含.min.css的
			test: /\.min\.css/,
			loader: ExtractTextPlugin.extract({
				fallback: "style-loader",
				// 不压缩css
				use: "css-loader"
			})
		}, {
			test: /\.(png|jpg|gif)$/,
			//小于1k的会默认用b64实现
			loader: config.isRelease ? 'url-loader?limit=1024&name=img/[name][hash].[ext]' : "url-loader?limit=1024&name=img/[name].[ext]"
		}, {
			test: /\.woff/,
			loader: 'file-loader?prefix=fonts/&limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]'
		}, {
			test: /\.ttf|\.svg|\.eot/,
			loader: 'file-loader?prefix=fonts/&name=fonts/[name].[ext]'
		}, {
			test: /\.js$/,
			loader: "babel-loader",
			exclude: /node_modules/,
			//配置改到了文件.babelrc中

		}, {
			// html-loader,专门替换html里的资源-比如替换图片资源，可以和HtmlWebpackPlugin以前使用的
			test: /\.html$/,
			use: [{
				loader: 'html-loader',
				options: {
					minimize: config.isRelease ? true : false,
				}
			}],
		}],
	},
	plugins: plugins.concat([
		new webpack.LoaderOptionsPlugin({
			options: {
				postcss: function() {
					return [autoprefixer];
				},
			}
		})
	]),
	//dev版才有serve
	devServer: !config.isRelease ? {
		historyApiFallback: true,
		hot: config.isInlineServer,
		//不使用inline模式,inline模式一般用于单页面应用开发，会自动将socket注入到页面代码中
		inline: config.isInlineServer,
		//content-base就是 codeResource -需要监听源码
		contentBase: path.resolve(__dirname, config.codeResource),
		watchContentBase: true,
		//这个配置可以运行其它机器访问
		host: '0.0.0.0',
		// 默认的服务器访问路径，这里和配置中一致，需要提取成纯粹的host:ip
		public: /https?:\/\/([^\/]+?)\//.exec(config.devPublicPath)[1]
	} : {},
	//eval-source-map cheap-module-eval-source-map(支持线上环境)
	//配置sourcemap方便调试
	//开发过程中才使用
	devtool: (!config.isRelease && config.isUseSourceMap) ? 'source-map' : false,
};