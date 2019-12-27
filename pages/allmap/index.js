/*
 * @Description: 地图入口公用文件
 * @Author: Linzhanhong
 * @LastEditors: Linzhanhong
 * @Date: 2019-08-02 17:14:03
 * @LastEditTime: 2019-08-30 17:38:13
 */

import 'es5-shim';
import 'es6-promise/dist/es6-promise.auto';
import jQuery from 'jquery';
global.$ = global.jQuery = jQuery;
// 提前禁止avalon对Object.create的实现
if (!Object.create) {
    Object.create = function () {
        function F() {}

        return function (o) {
            F.prototype = o;
            return new F();
        };
    }();
}
var avalon = require('avalon2');
if (avalon.msie <= 8) {
    Object.defineProperty = function (obj, property, meta) {
        obj[property] = meta.value;
    };
}

// 地图API依赖引入
require('/apps/allmap/allmap-loadDep.js');