/**
 * 作者: dailc
 * 创建时间: 2017-03-28
 * 版本: [1.0, 2017/05/26 ]
 * 版权: dailc
 * 描述: 数据处理的通用方法封装
 */
(function(exports, CommonTools) {
    /**
     * @description 统一处理返回数据,返回数据必须符合标准才行,否则会返回错误提示
     * @param {JSON} response 接口返回的数据
     * @param {Number} type = [0|1|2]  类别,兼容字符串形式
     * 0:返回校验信息-默认是返回业务处理校验信息
     * 1:返回列表
     * 2:返回详情
     * 其它:无法处理,会返回对应错误信息
     * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等
     */
    exports.handleStandardResponse = function(response, type) {
        var returnValue = {
            // code默认为0代表失败
            code: 0,
            // 描述默认为空
            message: '',
            // 数据默认为空
            data: null,
            // 一些数据详情,可以调试用
            debugInfo: {
                type: '未知数据格式'
            }
        };
        type = type || 0;
        if(!response) {
            returnValue.message = '接口返回数据为空!';
            return returnValue;
        }
        if(response && response.ReturnInfo) {
            // V6格式数据处理
            returnValue = handleV6Data(response, type, returnValue);
        } else if(response && response.custom && response.status) {
            // v7规范
            returnValue = handleV7Data(response, type, returnValue);
        } else {
            // 数据格式不对
            returnValue.code = 0;
            returnValue.message = '接口数据返回格式不正确,不是V6也不是V7!';
            // 装载数据可以调试
            returnValue.debugInfo.data = response;
        }

        return returnValue;
    };
    /**
     * @description 处理V6返回数据
     * @param {JSON} response 接口返回的数据
     * @param {Number} type = [0|1|2]  类别,兼容字符串形式
     * @param {JSON} returnValue 返回数据
     * 0:返回校验信息-默认是返回业务处理校验信息
     * 1:返回列表
     * 2:返回详情
     * 其它:无法处理,会返回对应错误信息
     * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等

     */
    function handleV6Data(response, type, returnValue) {
        var debugInfo = {
            type: 'V6数据格式'
        };
        // 默认的
        if(response && response.ReturnInfo && response.ReturnInfo.Code == '1') {
            // 程序没有错误,判读是否业务错误
            if(response && response.BusinessInfo && response.BusinessInfo.Code == '1') {
                debugInfo.errorType = 'null';
                // 业务也没有错误,开始判断类型
                var tips = '接口请求成功,后台业务逻辑处理成功!';
                if(response && response.BusinessInfo && response.BusinessInfo.Description) {
                    // 如果存在自己的信息
                    tips = response.BusinessInfo.Description;
                }
                returnValue.message = tips;
                if(type === 0 || type === '0') {
                    returnValue.code = 1;
                    returnValue.data = response.UserArea;
                } else if(type === 1 || type === '1') {
                    // 列表
                    if(response && response.UserArea) {
                        returnValue.code = 1;
                        // 如果UserArea本身就是列表
                        if(Array.isArray(response.UserArea)) {
                            returnValue.data = response.UserArea;
                        } else if(response.UserArea.InfoList && response.UserArea.InfoList[0] && response.UserArea.InfoList[0].Info) {
                            // 如果是兼容列表
                            var outArray = [];
                            for(var i = 0, len = response.UserArea.InfoList.length; i < len; i++) {
                                outArray.push(response.UserArea.InfoList[i].Info);
                            }
                            returnValue.data = outArray;
                        } else {
                            returnValue.data = null;
                            // 否则普通列表-便利每一个节点,如果是InfoList,直接返回,否则继续找
                            for(var obj in response.UserArea) {
                                if(Array.isArray(response.UserArea[obj])) {
                                    returnValue.data = response.UserArea[obj];
                                    if(obj === 'InfoList') {
                                        // 遇到正确节点直接退出
                                        break;
                                    }
                                } else {
                                    if(obj === 'InfoList') {
                                        if(response.UserArea[obj] && response.UserArea[obj].Info) {
                                            returnValue.data = response.UserArea[obj].Info;
                                        } else {
                                            returnValue.data = response.UserArea[obj];
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        returnValue.code = 0;
                        returnValue.message = '接口返回列表数据格式不符合规范!';
                    }
                } else if(type === 2 || type === '2') {
                    // 详情
                    if(response && response.UserArea) {
                        returnValue.code = 1;
                        // 详情数据
                        var tmp = 0;
                        for(var obj in response.UserArea) {
                            tmp++;
                            returnValue.data = response.UserArea[obj];
                        }
                        if(tmp > 1) {
                            // 如果有多个数据,直接使用UserArea
                            returnValue.data = response.UserArea;
                        }
                    } else {
                        returnValue.code = 0;
                        returnValue.message = '接口返回详情数据格式不符合规范!';
                    }
                } else {
                    returnValue.code = 0;
                    returnValue.message = '处理接口数据错误,传入类别不在处理范围!';
                }

            } else {
                // 2代表业务错误
                debugInfo.errorType = '2';
                // 业务错误
                returnValue.code = 0;
                var tips = '接口请求错误,后台业务逻辑处理出错!';
                if(response && response.BusinessInfo && response.BusinessInfo.Description) {
                    // 如果存在自己的错误信息
                    tips = response.BusinessInfo.Description;
                }
                returnValue.message = tips;
            }

        } else {
            // 1代表程序错误
            debugInfo.errorType = '1';
            // 程序错误
            returnValue.code = 0;
            var tips = '接口请求错误,后台程序处理出错!';
            if(response && response.ReturnInfo && response.ReturnInfo.Description) {
                //如果存在自己的程序错误信息
                tips = response.ReturnInfo.Description;
            }
            returnValue.message = tips;
        }
        returnValue.status = returnValue.code;
        returnValue.debugInfo = debugInfo;
        return returnValue;
    }

    /**
     * @description 处理V7返回数据
     * @param {JSON} response 接口返回的数据
     * @param {Number} type = [0|1|2]  类别,兼容字符串形式
     * type  v7里不影响,所以传什么都无所谓
     * @param {JSON} returnValue 返回数据
     * 0:返回校验信息-默认是返回业务处理校验信息
     * 1:返回列表
     * 2:返回详情
     * 其它:无法处理,会返回对应错误信息
     * @return {JSON} 返回的数据,包括多个成功数据,错误提示等等

     */
    function handleV7Data(response, type, returnValue) {
        // 存储debuginfo 以供调试
        var debugInfo = {
            type: 'V7数据格式'
        };
        // 对应状态码
        returnValue.status = 0;
        if(response && response.status) {
            returnValue.status = response.status.code;
            returnValue.message = response.status.text;
            if(response.status.code == '200') {
                // 状态为200才代表成功
                returnValue.code = 1;
                // type为1为列表数据
                if(type == 1) {
                    if(response.custom && (response.custom.list || response.custom.infoList)) {
                        returnValue.data = response.custom.list || response.custom.infoList;
                    } else {
                        returnValue.code = 0;
                        // 重新定义提示，方便锁定
                        returnValue.message = '列表接口返回数据不符合标准规范！';
                    }
                } else if(type == 2) {
                    if(response.custom) {
                        returnValue.data = response.custom;
                    } else {
                        returnValue.code = 0;
                        // 重新定义提示，方便锁定
                        returnValue.message = '详情接口返回的数据为空！';
                    }
                } else {
                    returnValue.data = response.custom;
                }
            } else {
                // 请求失败的情况暂时使用接口返回的默认提示
                returnValue.code = 0;
            }
        } else {
            returnValue.code = 0;
            returnValue.message = '接口请求错误,缺少status节点!';
        }
        returnValue.debugInfo = debugInfo;
        return returnValue;
    }
    
    CommonTools.namespace('bizlogic.handleStandardResponse', exports.handleStandardResponse);
})({}, PullToRefreshTools);