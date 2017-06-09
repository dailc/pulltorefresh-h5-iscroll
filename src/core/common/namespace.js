/**
 * 作者: dailc
 * 创建时间: 2017/05/26
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 命名空间，用来区分工具类系列的命名
 */

module.exports = {
	// 全局的命名空间，防止命名冲突 pulltorefresh
	namespace: 'PullToRefreshTools.',
	/**
	 * @description 生成全局对象
	 * @param {Object} global 全局对象
	 * @param {Object} exports 需要导出的模块
	 * @param {String} namespace 对应的命名空间
	 */
	generateGlobalObj: function(globals, exports, namespace) {
		if(!namespace) {
			return ;
		}
		var nameSpaceArray = namespace.split('.');
		var len = nameSpaceArray.length;
		var parent = this.getNameSpaceObj(globals, nameSpaceArray, len - 1);

		parent[nameSpaceArray[len - 1]] = exports;
	},
	/**
	 * @description 获取这个模块下对应命名空间的对象
	 * @param {Object} module
	 * @param {Array} namespaceArr
	 * @param {Number} len 这个命名空间的长度
	 */
	getNameSpaceObj: function(module, namespaceArr, len) {
		// 找到函数的parent
		var obj = module;
		for(var i = 0; i < len; i++) {
			var tmp = namespaceArr[i];
			// 不存在的话要重新创建对象
			obj[tmp] = obj[tmp] || {};
			// parent要向下一级
			obj = obj[tmp];
		}

		return obj;
	}
};