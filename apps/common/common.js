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
avalon.config({
    debug: __AVDEBUG__
});
// require('common-canvas');
require('ane/dist/layout');
// require('bootstrap');
require('es5-shim/es5-sham');
// require('common-paging');
require('common-pages');
require('common-tree-select');
// require('common-search-select');
// require('common-ms-select');
// require('common-orgtree-control');
// require('common-tree-ccfwglassign');
// require('common-ccfwglassign');
// require('common-table');
// require('common-table-li');
require('common-table-index.js');
require('common-ms-modal');
// require('common-zfzs');
require('common-selectoption.js');
// require('common-gm-webplayer');
// require('common-player');
require('common-player-npGxx');
require('common-pic-player');
// require('common-video');
// require('common-audio');
require('common-download-tip');
require('common-header-operation');
// 颜色选择器，暂时用不到
// require('spectrum-colorpicker');
// require('common-uploadBtn');
// require('common-pie');
// require('common-line');
require('common-browser-upgrade-tips');
// require('common-glmt');
// 盘证制作只有深圳版本有
// require('common-input');
// require('common-select');
// require('common-treeselect');
// require('common-datepick');
// require('common-datepicker');
// 盘证制作只有深圳版本有
// require('common-textarea');
// require('common-ms-month-picker');
// require('common-ms-ztree/common-ms-ztree');
require('common-mask-element/common-mask-element');
require('../../vendor/jquery/jquery.tooltip-x.js');
require('../../vendor/jquery/jquery.popover-x.js');
require('../../vendor/jquery/jquery.ztree.all.js');
require('../../vendor/jquery/jquery.ztree.exhide.min.js');
// 盘证制作只有深圳版本有
// require('../../vendor/jquery/migarate.js');
// require('../../vendor/jquery/jquery.jqprint-0.3.js');
// require('common-comparsion-result');
require('common-bk');
require('common-bk-rlbk');
// require('common-comparisonInfo');
// require('common-comparisonInfo-cp');
// require('common-searchLabel-select');
let storage = require('../../services/storageService.js').ret;
// ==============   引入配置项，用于sszhEsriMap或其他地图目录文件，相关配置可作用于地图   ===============
import {
    allMapConfig,
    languageSelect
} from '/services/configService';
let language = require('../../vendor/language').language;

// 通过window对象挂载配置，地图iframe通过parent获取window的配置
// allMapConfig 地图配置
window.allMapConfig = allMapConfig;
// mainConfig 配置文件的相关配置
window.mainConfig = {
    allMapConfig,
    languageSelect,
    language
};
window.storage = storage;
// ========================================================================================

//使用 new Date().Format("yyyy-MM-dd hh:mm:ss");
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// includes兼容
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return false;
            }
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }
            return false;
        }
    });
}

let notClearStorageKey = ['SESSION', 'account', 'jfVersion', 'msLastPath', 'orgCode', 'orgId', 'orgPath', 'orgName', 'roleNames', 'roleIds', 'uid', 'userCode', 'userName', 'license', 'licenseCode', 'lastlogintime', 'lastLonginIp', 'nowlogintime', 'nowLonginIp',
    'loginFailNum', 'policeState', 'accountExpireNum', 'passwordExpireNum', 'policeType', 'kplb_type', 'browser-tips-had-show', 'pzzz-data',
    'tjfx-khqktj-table-obj', 'zfsypsjglpt-sypgl-zfjlysyp-main-homePage', 'zfsypsjglpt-tjfx-khqktj', 'zfsypsjglpt-tjfx-khqktj-table-detail', 'tjfx-khqktj-table_01', 'tjfx-khqktj-table_02', 'tjfx-khqktj-breadcrumb-obj', 'npGxx-tips', 'sszhxt-znsb-rlbk-recordID', 'sszhxt-znsb-cpbk-record-item',
    'currentDefaultCity', 'todos'
]; // 清除localstorage白名单
// 页面刷新、页面关闭时清除查询条件等缓存
$(window).unload(function () {
    var all = storage.getAll();
    avalon.each(all, function (key, val) {
        if (-1 == $.inArray(key, notClearStorageKey)) {
            storage.removeItem(key);
        }
    });
});

// 简单函数装饰器
function funcDecorator(fn, before, after) {
    return function () {
        before.call(fn, arguments);
        let result = fn.call(this, arguments);
        after.call(fn, arguments);
        return result;
    };
}

// 是否已关闭浏览器下载提示，先保存在browserTipsHadHhow中间变量上，防止登录后清空
let browserTipsHadShow = false;
let before = function() {
    if (!!storage.getItem('browser-tips-had-show')) {
        browserTipsHadShow = storage.getItem('browser-tips-had-show');
    }
};
let after = function () {
    storage.setItem('browser-tips-had-show', browserTipsHadShow);
};
// 将 storage.clearAll 方法加上 before，after 方法装饰执行，即实现清除 storage 前后执行before，after
// 想在 storage.clearAll 执行前或者执行后进行对应的统一默认操作，可将对应逻辑写到对应的 before 或 after 方法中
storage.clearAll = funcDecorator(storage.clearAll, before, after);

exports.delete_ocx = function () {
    let globalOcxPlayer;
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        globalOcxPlayer = document.getElementById('gxxPlayOcx');
    else {
        globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic') || document.getElementById('npGSVideoPlugin');
        if (globalOcxPlayer && !globalOcxPlayer.GS_ReplayFunc)
            return;
    }

    if (!globalOcxPlayer)
        return;

    globalOcxPlayer.IMG_DestroyWnd();

    if ($("#gxx_ocx").length > 1)
        $("#gxx_ocx").hide();

    let data = {};
    if(window.location.pathname.replace('/', '') !== 'sszhxt.html') {
        data.action = 'Delete';
        globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    
        data = {};
        data.action = 'LogOut';
        globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    }
};