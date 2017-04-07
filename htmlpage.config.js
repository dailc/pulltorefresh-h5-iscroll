// 定义一些html页面以及相应的引用
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./common.config.js');
const codeResource = config.codeResource;
const path = require('path'); // 导入路径包
const fs = require('fs');

let htmlPagesConfig = config.htmlPagesConfig;

let htmlPages = [];

//找寻对应的html路径
function walk(dir, root) {
	root = root || './';
	dir = dir || '';
	let directory = path.join(__dirname, root, dir);
	fs.readdirSync(directory)
		.forEach(function(file) {
			let fullpath = path.join(directory, file);
			let stat = fs.statSync(fullpath);
			let extname = path.extname(fullpath);
			if(stat.isDirectory() ) {
				let subdir = path.join(dir, file);
				walk(subdir, root);
			} else if(stat.isFile() && (extname === '.html')) {
				let name = path.join(dir, path.basename(file, extname));
				name = name.replace(/\\/g, '/');
				if(htmlPagesConfig.exclude&&htmlPagesConfig.exclude.indexOf(name)==-1) {
					//console.log("html文件:" + name+','+name);
					htmlPages.push({
						//pages会在之后的插件自动补上
						template: name+'.html',
						//绑定对应的页面入口
						chunks:['js/'+name]
					})
				}
				
			}
		});
}
if(!htmlPagesConfig.isAutoGenerate) {
	//手动配置
	htmlPages = htmlPagesConfig.htmlPages;
} else {
	//代码自动生成
	walk('./', codeResource+'/pages');
}

function generatePlugins(htmlPages){
	if(!htmlPages) {
		return [];
	}
	let plugins = [];
	for(let i = 0, len = htmlPages.length; i < len; i++) {
		if(config.commonChunkConfig.isCommonChunk) {
			//如果抽取了chunk,添加到前面
			if(htmlPages[i].chunks) {
				htmlPages[i].chunks.unshift('js/'+config.commonChunkConfig.chunkName);
				htmlPages[i].chunks.unshift('css/'+config.commonChunkConfig.chunkName);
				htmlPages[i].chunks.unshift('js/'+config.commonChunkConfig.manifestName);
			}
			
		}
		plugins.push(new HtmlWebpackPlugin({
			favicon: path.resolve(__dirname, config.favicon||'./favicon.ico'),
			template: codeResource +'/pages/'+ htmlPages[i].template,
			filename: 'pages/'+htmlPages[i].template,
			chunks: htmlPages[i].chunks,
			//去掉压缩属性，因为html-loader中已经压缩了，重复压缩会报错
//			minify: config.isRelease?{
//				collapseWhitespace: true,
//				collapseBooleanAttributes: true,
//				removeComments: true,
//				removeEmptyAttributes: true,
//				removeScriptTypeAttributes: true,
//				removeStyleLinkTypeAttributes: true,
//				minifyJS: true,
//				minifyCSS: true
//			}:null,
			//hash: true
		}));
	}
	
	return plugins;
}

module.exports = {
	// 定义html
	plugin: generatePlugins(htmlPages)
};