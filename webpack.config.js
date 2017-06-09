// 这个webpack config仅仅是框架内部的，不适用于通用项目
const path = require('path');
const fs = require('fs');
const codeResource = require('./common.config.js').codeResource;
const webpack = require('webpack');
const config = require('./common.config.js');

//图片压缩
const ImageminPlugin = require('imagemin-webpack-plugin').default
// 样式补全
const autoprefixer = require('autoprefixer');
//框架的别名
const coresAliasConfig = require('./alias.config.js');

const extend = function(destination, source) {
	for(var property in source) {
		destination[property] = source[property];
	}
	return destination;
};
// 找需要编译的路径
let entry = {};

function walk(dir, root) {
	root = root || './';
	dir = dir || '';
	let directory = path.join(__dirname, root, dir);
	fs.readdirSync(directory)
		.forEach(function(file) {
			let fullpath = path.join(directory, file);
			let stat = fs.statSync(fullpath);
			let extname = path.extname(fullpath);
			if(stat.isDirectory() && file !== 'core' && file !== 'lib' && file !== 'img' && file !== 'css') {
				let subdir = path.join(dir, file);
				walk(subdir, root);
			} else if(stat.isFile() && (extname === '.js')) {
				let name = path.join(dir, path.basename(file, extname));
				name = name.replace(/\\/g, '/');
				entry[name] = fullpath;

			}
		});
}

walk('./', codeResource);

// 合并css与html的插件
let plugins = [];

if(config.isRelease) {
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
			except: ['exports', 'require'],
			//comments: /s/
		}),
	];
	plugins = plugins.concat(releasePlugins);
}
module.exports = {
	entry: entry, // 入口文件

	// 输出文件 build下的bundle.js
	output: {
		// 用来解决css中的路径引用问题
		publicPath: config.isRelease ? config.releasePublicPath : config.devPublicPath,
		path: path.resolve(__dirname, config.buildPath),
		// 注意要使用chunkhash
		filename: "[name].js",
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
			loader: config.isRelease ? "style-loader!css-loader?minimize!less-loader" : "style-loader!css-loader!less-loader"
		}, {
			// 包含css 包含.min.css的
			test: /\.min\.css/,
			loader: "style-loader!css-loader!less-loader"
		}, {
			test: /\.(png|jpg|gif)$/,
			//小于1k的会默认用b64实现
			loader: "url-loader?limit=1024&name=img/[name].[ext]"
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
		}),
		// 版权声明
		new webpack.BannerPlugin(config.copyRight)
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