/**
 * 作者: dailc
 * 创建时间: 2017-03-28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 数据处理的通用方法封装
 */
(function(exports, CommonTools) {
    /**
     * 通用接口处理
     * 通过插拔式增加各种接口的支持
     */
    (function() {
        // 处理数据的函数池
        exports.dataProcessFn = [];

        /**
         * @description 统一处理返回数据,返回数据必须符合标准才行,否则会返回错误提示
         * @param {JSON} response 接口返回的数据
         * @param {Object} options 配置信息，包括
         * dataPath 手动指定处理数据的路径，遇到一些其它数据格式可以手动指定
         * 可以传入数组，传入数组代表回一次找path，直到找到为止或者一直到最后都没找到
         * isDebug 是否是调试模式，调试模式会返回一个debugInfo节点包含着原数据
         * 其它:无法处理的数据,会返回对应错误信息
         * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等
         */
        exports.dataProcess = function(response, options) {
            options = options || {};
            if (typeof options.dataPath === 'string') {
                options.dataPath = [options.dataPath];
            }

            // 永远不要试图修改arguments，请单独备份，否则在严格模式和非严格模式下容易出现错误
            var args = [].slice.call(arguments);
            var result = {
                // code默认为0代表失败，1为成功
                code: 0,
                // 描述默认为空
                message: '',
                // 数据默认为空
                data: null,
                // v7接口中的status字段，放在第一层方便判断
                status: 0,
                // 一些数据详情,可以协助调试用
                debugInfo: {
                    type: '未知数据格式'
                }
            };
            // 默认为详情
            var isDebug = options.isDebug || false,
                paths = options.dataPath,
                processFns = exports.dataProcessFn,
                len = processFns.length,
                num = paths.length,
                isFound = false;

            if (!response) {
                result.message = '接口返回数据为空!';
                return result;
            }
            // 添加一个result，将返回接口给子函数
            args.push(result);
            for (var k = 0; !isFound && k < num; k++) {
                // 每次动态修改path参数
                args[1] = paths[k];

                for (var i = 0; !isFound && i < len; i++) {
                    var fn = processFns[i];
                    var returnValue = fn.apply(this, args);

                    if (returnValue != null) {
                        // 找到了或者到了最后一个就退出
                        if (returnValue.code == 1 || k == num - 1) {
                            isFound = true;
                            result = returnValue;
                            break;
                        }
                    }
                }
            }

            if (!isFound) {
                // 没有找到数据需要使用默认
                // 如果没有数据处理函数或数据格式不符合任何一个函数的要求
                result.message = '没有数据处理函数或者接口数据返回格式不符合要求!';
                // 装载数据可以调试
                result.debugInfo.data = response;
            }

            // 非null代表已经找到格式了，这个是通过约定越好的
            if (!isDebug) {
                result.debugInfo = undefined;
            }
            return result;
        };
    })();
    (function() {

        /**
         * @description 通过指定路径，来获取对应的数据
         * 如果不符合数据要求的，请返回null，这样就会进入下一个函数处理了
         * @param {JSON} response 接口返回的数据
         * @param {String} path 一个自定义路径，以点分割，用来找数据
         * @param {JSON} returnValue 返回数据
         * 1:返回列表
         * 其它:返回详情
         * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等
         * */
        function handleDataByPathV6(response, path, returnValue) {
            if (!(path && response && response.ReturnInfo && response.BusinessInfo)) {
                return null;
            }
            var debugInfo = {
                type: 'v6数据格式:' + path
            };
            var returnInfo = response.ReturnInfo,
                businessInfo = response.BusinessInfo,
                userArea = response.UserArea;

            if (returnInfo.Code == '1') {
                if (businessInfo.Code == '1') {
                    var data = CommonTools.getNameSpaceObj(response, path);

                    if (data) {
                        returnValue.code = 1;
                        returnValue.data = data;
                    } else {
                        returnValue.code = 0;
                        returnValue.message = returnValue.message || '指定路径下没有找到数据';
                        returnValue.data = null;
                        // 3代表业务数据错误
                        debugInfo.errorType = '3';
                    }
                } else {
                    // 2代表业务错误
                    debugInfo.errorType = '2';
                    returnValue.code = 0;
                    returnValue.message = businessInfo.Description || '接口请求错误,后台业务逻辑处理出错!';
                }
            } else {
                // v6中的程序错误
                // 1代表程序错误
                debugInfo.errorType = '1';
                returnValue.code = 0;
                returnValue.message = returnInfo.Description || '接口请求错误,后台程序处理出错!';
            }

            returnValue.debugInfo = debugInfo;
            return returnValue;
        }

        exports.dataProcessFn.push(handleDataByPathV6);
    })();
    (function() {

        /**
         * @description 通过指定路径，来获取对应的数据
         * 如果不符合数据要求的，请返回null，这样就会进入下一个函数处理了
         * @param {JSON} response 接口返回的数据
         * @param {String} path 一个自定义路径，以点分割，用来找数据
         * @param {JSON} returnValue 返回数据
         * 1:返回列表
         * 其它:返回详情
         * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等
         * */
        function handleDataByPathV7(response, path, returnValue) {
            if (!(path && response && response.status && response.custom)) {
                return null;
            }
            var debugInfo = {
                type: 'v7数据格式:' + path
            };
            var status = response.status;

            // 对应状态码
            returnValue.status = status.code || 0;
            returnValue.message = status.text;

            if (status.code == '200') {
                var data = CommonTools.getNameSpaceObj(response, path);

                if (data) {
                    returnValue.code = 1;
                    returnValue.data = data;
                } else {
                    returnValue.code = 0;
                    returnValue.message = returnValue.message || '指定路径下没有找到数据';
                    returnValue.data = null;
                    // 3代表业务数据错误
                    debugInfo.errorType = '3';
                }
            } else {
                // 请求失败的情况暂时使用接口返回的默认提示
                returnValue.code = 0;
                // 2代表status错误，message默认就已经在节点中
                debugInfo.errorType = '2';
                returnValue.message = returnValue.message || 'status状态错误';
            }

            returnValue.debugInfo = debugInfo;
            return returnValue;
        }

        exports.dataProcessFn.push(handleDataByPathV7);
    })();

    CommonTools.namespace('dataProcess', exports.dataProcess);
})({}, PullToRefreshTools);