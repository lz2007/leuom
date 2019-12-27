/*
 * @Author: Linzhanhong
 * @Date: 2019-08-15 14:32:05
 * @LastEditors: Linzhanhong
 * @LastEditTime: 2019-08-20 11:34:31
 * @Description: 引入地图的 API 文件、样式文件等
 */

import { Gm } from '/apps/common/common-tools';
function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let {loadCss, loadJs} = new Tools();

import mapDep from './allmap-dep';

let dep = {};
$.extend(true, dep, mapDep);
window.BMap_loadScriptTime = (new Date).getTime();

loadCss({
    url: dep.css
});

loadJs(
    dep.js, 
    false, 
    function() {
        require(['/pages/allmap/allmap.js']);
    }
);
