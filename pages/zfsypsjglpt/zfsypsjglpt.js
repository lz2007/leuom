// 公共引用部分，兼容IE8
import '/apps/common/common';
import './zfsypsjglpt.css';
import '/apps/common/common-index';
import 'ane';
import ajax from "/services/ajaxService";
import {
    applyRouteConfig
} from '/services/pagesRouterServer';
import * as menuService from '../../services/menuService';
import {
    store
} from '/apps/common/common-store.js';
import {
    copyRight,
    telephone,
    playerConfig,
    languageSelect,
    isInsertIframe,
    iframeUrl,
} from '/services/configService';

import {
    list as listMenu,
    zfdaMenu,
    jdkpMenu
} from './menuConfig';
import {
    routeConfig
} from './routeConfig';

require('/apps/common/common-gjdw-map');
require('/apps/common/common-layout/common-layout.js');

let delete_ocx = require('../../apps/common/common').delete_ocx;
let storage = require('../../services/storageService').ret;
let userName, orgName, roleNames;

menuService.getUserInfo.then(info => {
    userName = storage.getItem('userName');
    orgName = storage.getItem('orgName');
    roleNames = storage.getItem('roleNames');
    root.userName = userName;
    root.orgName = orgName;
    root.roleNames = roleNames;

    if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
        storage.clearAll();
        global.location.href = '/main-login.html';
    }
    if (roleNames.length == 0) {
        root.roleNames = [" - "];
        // roleNames.push(' - ');
    }
    if (roleNames.length > 1) {
        root.roleShow = true;
    }

    if (isInsertIframe) {
        ajax({
            url: '/gmvcs/uap/cas/get/jwt',
            method: 'post',
            data: {
                "number": storage.getItem("idCard")
            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: '通知'
                });
            }
            if (result.data && result.data.jwt) {
                let id = result.data.jwt;
                root.iframeUrl = `${iframeUrl}?idno=${id}`;
                // console.log(root.iframeUrl);
            }
        });
    }

});

var root = avalon.define({
    $id: 'zfsypsjglpt_vm',
    currentPage: '',
    copyRight: copyRight,
    telephone: telephone,
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    iframeUrl: "",
    titleName: '执法视音频数据管理系统',
    roleShow: false,
    year: (new Date()).getFullYear(),
    menu: get_menu(),
    selectedKeys: [],
    openKeys: ['yspk'],
    flag_jtwfkp: false,
    isInsertIframe: isInsertIframe,
    handleMenuClick(item, key, keyPath) {
        let userAgent = navigator.userAgent;
        if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1)
            delete_ocx();

        // avalon.router.navigate(item.url, 2);
        avalon.history.setHash(item.url);

        if (item.url == '/zfsypsjglpt-jdkp-jycx_jiaojing') {
            this.flag_jtwfkp = true;
            root.selectedKeys = new Array('zfsypsjglpt-jdkp-jycx_jiaojing');
        } else {
            this.flag_jtwfkp = false;
        }
    },
    open_arr: ['yspk'],
    handleOpenChange(open_arr) {
        this.open_arr = open_arr.splice(-1, 1);
        this.openKeys = this.open_arr;
    },
    show_player: playerConfig
});
// if (root.roleNames.length == 0) {
//     // root.roleNames = [" - "];
//     roleNames.push(' - ');
// }
// if (root.roleNames.length > 1) {
//     root.roleShow = true;
// }

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;
    avalon.each(sysList, (key, val) => {
        if (/^\/zfsypsjglpt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

let output_list = []; //已授权的菜单map数组
let authorized3LevelList = []; // 已授权的第三级菜单
function get_menu() {

    let list = listMenu;
    // 第三级菜单 执法档案
    let level3List = zfdaMenu;

    menuService.menu.then(menu => {
        let remote_list = menu.AUDIO_MENU_SYPSJGL; //音视频数据管理平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组

        // remote_list.push('AUDIO_MENU_TJFX_GLQKTJ'); //关联情况统计（公安版本）全警种测试
        avalon.each(remote_list, function (index, el) {
            if (/^AUDIO_MENU_/.test(el))
                avalon.Array.ensure(get_list, el);
        });

        let filterMenu = (list, output) => {
            avalon.each(list, function (index, el) {
                avalon.each(get_list, function (idx, ele) {
                    if (ele == el.lic) {
                        let child_list = [];
                        if (!el.hasOwnProperty("children") || 0 == el.children.length) {

                        } else {
                            avalon.each(el.children, function (k, v) {
                                avalon.each(get_list, function (kk, vv) {
                                    if (vv == v.lic) {
                                        // avalon.Array.ensure(child_list, v);
                                        if (menu.AUDIO_MENU_SYPSJGL_ARR[v.lic])
                                            v.title = menu.AUDIO_MENU_SYPSJGL_ARR[v.lic];
                                        child_list.push(v);
                                        return;
                                    }
                                });
                                el.children = child_list;
                            });
                        }

                        if (menu.AUDIO_MENU_SYPSJGL_ARR[el.lic])
                            el.title = menu.AUDIO_MENU_SYPSJGL_ARR[el.lic];
                        avalon.Array.ensure(output, el);
                        return;
                    }
                });
            });
        };

        filterMenu(list, output_list);
        filterMenu(level3List, authorized3LevelList);

        store.dispatch({
            type: "saveMenu",
            menu: authorized3LevelList
        });

        // if (!/zfsypsjglpt/.test(global.location.hash)) { //默认选择第一个模块
        //     if (output_list[0].children.length > 0) {
        //         avalon.history.setHash(output_list[0].children[0].url);
        //         let current_key = window.location.hash.split("/")[1];
        //         root.openKeys = new Array(current_key.split("-")[1]);
        //         root.open_arr = new Array(current_key.split("-")[1]);
        //         root.selectedKeys = new Array(output_list[0].children[0].key);

        //     } else {
        //         avalon.history.setHash(output_list[0].url);
        //         root.openKeys = new Array(output_list[0].key);
        //         root.open_arr = new Array(output_list[0].key);
        //         root.selectedKeys = new Array(output_list[0].key);

        //     }
        // }
        root.menu = output_list;

        get_selectedKey(true);
    });
}
//===============================================================================================================

$(document).ready(function () {
    // get_selectedKey(true);

    if (isInsertIframe) return;

    $('#mapIframe').attr('src', '../allmap.html');
});

applyRouteConfig(routeConfig, {
    name: 'zfsypsjglpt_vm'
});

avalon.history.start({
    root: "/",
    fireAnchor: false
});

if (!/#!/.test(global.location.hash)) {
    avalon.router.navigate('/', 2);
}

avalon.bind(window, "hashchange", (e) => {
    $("#iframe_zfsyps").css({
        width: "0px",
        height: "0px",
        left: "0px",
        top: "0px"
    });
    $("#iframe_others").css({
        width: "0px",
        height: "0px",
        left: "0px",
        top: "0px"
    });
    get_selectedKey(false);
    $('.map-iframe-wrap')[0].style.cssText = ''; // 初始化地图样式，防止有些模块在onDispose时重置地图style的width和height为0而其他模块的class的width/height被覆盖不生效
    laodingMapMask();
});

avalon.scan(document.body);

function get_selectedKey(val) {
    let select_key = window.location.hash.split("/")[1];
    if (!select_key)
        return;
    if (select_key.split("-").length > 3) {
        let str_index = find_str(select_key, "-", 2);
        let selectedKey_txt = select_key.slice(0, str_index);

        if (select_key.indexOf("_gongan") > -1)
            selectedKey_txt += "_gongan";
        else if (select_key.indexOf("_jiaojing") > -1)
            selectedKey_txt += "_jiaojing";

        root.selectedKeys = new Array(selectedKey_txt);
    } else
        root.selectedKeys = new Array(select_key);

    if (val) {
        root.openKeys = new Array(select_key.split("-")[1]);
        root.open_arr = new Array(select_key.split("-")[1]);
    }
}

function find_str(str, cha, num) { //找到某字符在字符串中出现第N次的位置。str 字符串，cha 某字符，num 第N次
    if (!str)
        return;
    var x = str.indexOf(cha);
    for (var i = 0; i < num; i++) {
        x = str.indexOf(cha, x + 1);
    }
    return x;
}

if (avalon.msie) {
    setTimeout(() => {
        laodingMapMask();
    }, 500);
} else {
    laodingMapMask();
}

// 添加地图loading蒙版
function laodingMapMask() {
    //系统第一次加载地图时加上蒙版(注意要在avalon.scan之后，否则需要定时器延时)
    setTimeout(() => {
        frameWindow = document.getElementById("mapIframe").contentWindow;
        let isIE = judgeIE();
        let txt = languageSelect == "zhcn" ? "正在加载地图，请稍后" : "Loading.Please wait..";
        if ($('.map-iframe-wrap').is(':visible') && $('.map-iframe-wrap').width() > 0) {
            // .map-iframe-wrap 這個類加了 visibility: hidden; 所以要在每次顯示地圖時要改變visibility為visible
            $('.map-iframe-wrap').css('visibility', 'visible');
            let boundingClientRect = $('.map-iframe-wrap')[0].getBoundingClientRect();
            let opts = {
                position: 'absolute',
                top: boundingClientRect.top,
                left: $('.map-iframe-wrap').offset().left,
                // left: boundingClientRect.left,
                right: boundingClientRect.right,
                height: boundingClientRect.height,
                width: boundingClientRect.width
            };
            let iframe = isIE ? '' : '<div id="back-iframe" style="display: none;position:absolute;width:100%;height:100%;top:0;left:0;"><iframe src="about:blank" marginheight="0" marginwidth="0" class="mask-square" style="opacity:1;filter:alpha(opacity=0);background: #4d4d4d;" frameborder="0"></iframe></div>';
            let $backdrop = $(iframe + '<div class="backdrop-loading"><span class="mask-square"><span class="fa fa-spinner fa-pulse"></span>' + txt + '</span></div>');
            $('body').append($backdrop);
            if ($('#back-iframe')[0]) $('#back-iframe')[0].style.cssText = '';
            $('#back-iframe, .backdrop-loading').css(opts);
            $(".backdrop-loading").css({
                "z-index": "999"
            });
            $('#back-iframe').show();
        } else {
            if ($('#back-iframe, .backdrop-loading').length > 0) {
                $('#back-iframe, .backdrop-loading').hide();
            }
        }
        let defineTimer = setInterval(() => {
            // frameWindow.defineTimer = setInterval(() => {
            frameWindow = document.getElementById("mapIframe").contentWindow;
            if (frameWindow.loadMapCompelete) {
                clearInterval(defineTimer);
                // clearInterval(frameWindow.defineTimer);
                $('#back-iframe,.backdrop-loading,.backdrop').remove();
            }
        }, 200);
    }, 1000);
}

function judgeIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}