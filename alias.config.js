// 框架核心的别名配置文件，请勿改动，该文件不能缺少
// 自定义别名请前往  common.config中
const path = require('path'); // 导入路径包
module.exports = {
	// 基于src根路径进行别名替换,使用项目根路径
	'Core_Common': path.join(__dirname, "./src/core/common/common.js"),
	'Core_HandleData': path.join(__dirname, "./src/core/common/handedata.js"),
	// 命名空间
	'Core_NameSpace': path.join(__dirname, "./src/core/common/namespace.js"),
	// 下拉刷新的核心文件
	'PullToRefresh_Core': path.join(__dirname, "./src/core/pulltorefresh.core.js"),
	  
	 // 下拉刷新的皮肤 mui type2,type3需要引用
    'PullToRefresh_Skin_Mui_Type2': path.join(__dirname, "./src/pulltorefresh.skin.muitype2.js")

};