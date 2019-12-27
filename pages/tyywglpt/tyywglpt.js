// 公共引用部分，兼容IE8
import '/apps/common/common';
import './tyywglpt.css';
import '/apps/common/common-index';
import 'ane';
import * as menuService from '../../services/menuService';
import {
    copyRight,
    telephone,
    showBeiji
} from '/services/configService';
let {
    routerserver
} = require('/services/routerService');
let storage = require('../../services/storageService').ret;
require('/apps/common/common-layout/common-layout.js');
let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');

avalon.effect('collapse', {
    enter: function (el, done) {
        $(el).prev().removeClass('shrink').addClass('open');
        $(el).slideDown(200, done);
    },
    leave: function (el, done) {
        $(el).prev().removeClass('open').addClass('shrink');
        $(el).slideUp(200, done);
    }
});
//isWindowNav用来判断是通过浏览器的导航栏使hash变化的，还是通过点击侧边栏的a标签使hash变化的。
let isWindowNav = false;
var root = avalon.define({
    $id: 'tyywglpt_vm',
    currentPage: '',
    copyRight: copyRight,
    telephone: telephone,
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: '运维管理系统',
    firstRoleName: '',
    roleShow: false,
    year: (new Date()).getFullYear() + 1,
    // locationKey: window.location.hash ? window.location.hash.slice(2) : '/tyywglpt-sbzygl-zfygl',
    locationKey: window.location.hash ? window.location.hash.slice(2) : '/tyywglpt-sbzygl-zdsbgl',
    menu: get_menu(),
    selectedKeys: [],
    openKeys: [''],
    licenseStatus: true,
});

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;
    avalon.each(sysList, (key, val) => {
        if (/^\/tyywglpt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

if (roleNames) {
    root.firstRoleName = roleNames[0];
    if (root.roleNames.length == 0) {
        roleNames.push(' - ');
    }
    if (root.roleNames.length > 1) {
        root.roleShow = true;
    }
}

//router server
routerserver('tyywglpt_vm');

function get_menu() {
    let list = [{
        key: 'yxjk',
        title: '运行监控',
        lic: 'UOM_MENU_YXJK', // lic 授权校验字段
        icon: 'nav-tyywglpt-yxjk',
        iconActive: 'nav-tyywglpt-yxjk-active',
        children: [{
            key: 'cjgzz',
            title: '采集工作站',
            lic: 'UOM_MENU_YXJK_CJGZZ',
            url: '/tyywglpt-yxjk-cjgzz',
        }, {
            key: 'ccfwq',
            title: '存储服务',
            lic: 'UOM_MENU_YXJK_CCFWQ',
            url: '/tyywglpt-yxjk-ccfw',
        }, {
            key: 'xtfw',
            title: '系统服务',
            lic: 'UOM_MENU_YXJK_HTFW',
            url: '/tyywglpt-yxjk-xtfw',
        }]
    },
    {
        key: 'sbzygl',
        title: '资源管理',
        lic: 'UOM_MENU_SBZYGL', // lic 授权校验字段
        icon: 'nav-tyywglpt-zygl',
        iconActive: 'nav-tyywglpt-zygl-active',
        children: [{
            key: 'zctj',
            title: '资产统计',
            lic: 'AUDIO_MENU_TJFX_ZCTJ',
            children: [{
                key: 'zfjly',
                title: '执法记录仪',
                lic: 'AUDIO_MENU_TJFX_ZCTJ_ZFJLY',
                url: '/zfsypsjglpt-tjfx-zctj',
            }]
        }, {
            key: 'zfygl',
            title: '终端设备管理', // 原为执法仪管理
            lic: 'UOM_MENU_SBZYGL_ZFJLYGL',
            url: '/tyywglpt-sbzygl-zdsbgl',
        },
        {
            key: 'dlspcjsbgl',
            title: '多路视频采集设备管理',
            lic: 'UOM_MENU_SBZYGL_DLSPCJSBGL',
            url: '/tyywglpt-sbzygl-dlspcjsbgl',
            active: false
        },
        {
            key: 'cjgzzgl',
            title: '采集工作站管理',
            lic: 'UOM_MENU_SBZYGL_CJGZZGL',
            url: '/tyywglpt-sbzygl-cjgzzgl',
        }, {
            key: 'ccfwgl',
            title: '存储服务管理',
            lic: 'UOM_MENU_CCFWGL',
            children: [{
                key: 'cjzscfwgl',
                title: '文件上传服务',
                lic: 'UOM_MENU_CCFWGL_WJSCFW',
                url: '/tyywglpt-ccfwgl-cjzscfwgl',
            }, {
                key: 'khdscfwgl',
                title: '客户端上传服务管理',
                lic: 'UOM_MENU_KHDSCFWGL',
                url: '/tyywglpt-ccfwgl-khdscfwgl',
            }, {
                key: '4gzfylxfwgl',
                title: '执法记录仪录像服务',
                // lic: 'UOM_MENU_4GZFYLXFWGL',
                lic: 'UOM_MENU_CCFWGL_ZFYLXFW',
                url: '/tyywglpt-ccfwgl-4gzfylxfwgl',
            }, {
                key: 'baqspccgl',
                title: '办案区视频存储管理',
                lic: 'UOM_MENU_CCFWGL_BAQSPCCGL',
                url: '/tyywglpt-ccfwgl-baqspccgl',
            }]
        },
        {
            key: 'bjgl',
            title: '备机管理',
            lic: 'UOM_MENU_SBZYGL_BJGL',
            url: '/tyywglpt-sbzygl-bjgl'
        }
        ]
    },
    {
        key: 'baqgl',
        title: '办案区管理',
        lic: 'UOM_MENU_BAQGL',
        icon: 'nav-tyywglpt-baqgl',
        iconActive: 'nav-tyywglpt-baqgl-active',
        children: [
            {
                key: 'tyywglpt-baqgl-baqgl',
                title: '办案区管理',
                lic: 'UOM_MENU_BAQGL_BAQGL',
                url: '/tyywglpt-baqgl-baqgl',
            },
            {
                key: 'tyywglpt-baqgl-sbdjgl',
                title: '设备对接管理',
                lic: 'UOM_MENU_BAQGL_SBDJGL',
                url: '/tyywglpt-baqgl-sbdjgl',
            }]
        },
        {
            key: 'ptjlgl',
            title: '平台级联管理',
            lic: 'UOM_MENU_PTJLGL',
            icon: 'nav-tyywglpt-ptjlgl',
            iconActive: 'nav-tyywglpt-ptjlgl-active',
            children: [{
                    key: 'tyywglpt-ptjlgl-slwgl',
                    title: '上联管理',
                    lic: 'UOM_MENU_PTJLGL_UP',
                    url: '/tyywglpt-ptjlgl-slwgl',
                },
                {
                    key: 'tyywglpt-ptjlgl-bywgl',
                    title: '本域管理',
                    lic: 'UOM_MENU_PTJLGL_DOMAIN',
                    url: '/tyywglpt-ptjlgl-bywgl',
                },
                {
                    key: 'tyywglpt-ptjlgl-xlwgl',
                    title: '下联管理',
                    lic: 'UOM_MENU_PTJLGL_SLGL',
                    url: '/tyywglpt-ptjlgl-xlwgl',
                }
            ]
        },
        {
            key: 'rwgl',
            title: '系统任务管理',
            lic: 'UOM_MENU_XTRWGL',
            icon: 'nav-tyywglpt-xtrwgl',
            iconActive: 'nav-tyywglpt-xtrwgl-active',
            children: [{
                key: 'sjscrw',
                title: '文件上传任务',
                lic: 'UOM_MENU_XTRWGL_WJSCRW',
                url: '/tyywglpt-rwgl-sjscrw',
            }, {
                key: 'zdglfw',
                title: '自动关联服务',
                lic: 'UOM_MENU_XTRWGL_ZDGLFW',
                url: '/tyywglpt-rwgl-zdglfw',
            },  {
                key: 'zfysjrw',
                title: '执法仪升级任务',
                lic: 'UOM_MENU_XTRWGL_ZFYSJRW',
                url: '/tyywglpt-rwgl-zfysjrw',
            }, {
                key: 'lxxzrw',
                title: '录像下载任务',
                lic: 'UOM_MENU_RWGL_LXXZRW',
                url: '/tyywglpt-rwgl-lxxzrw',
            }, {
                key: 'sslxrw',
                title: '实时录像任务',
                lic: 'UOM_MENU_RWGL_SSLXRW',
                url: '/tyywglpt-rwgl-sslxrw',
            }, {
                key: 'baqspccrw',
                title: '办案区视频下载任务',
                lic: 'UOM_MENU_XTRWGL_BAQSPCCRW',
                url: '/tyywglpt-rwgl-baqspccrw',
            }]
        },
        {
            key: 'sjbgl',
            title: '升级包管理',
            lic: 'UOM_MENU_YCSJGL_SJBGL',
            icon: 'nav-tyywglpt-sjbgl',
            iconActive: 'nav-tyywglpt-sjbgl-active',
            children: [{
                    key: 'cjzsjbgl',
                    title: '采集工作站',
                    lic: 'UOM_MENU_YCSJGL_SJBGL_CJGZZ',
                    url: '/tyywglpt-sjbgl-cjzsjbgl',
                },
                {
                    key: 'sjbgl-zfjly',
                    title: '执法记录仪',
                    lic: 'UOM_MENU_YCSJGL_SJBGL_ZFJLY',
                    url: '/tyywglpt-sjbgl-zfjly',
                },
                {
                    key: 'sbsjrz',
                    title: '设备升级状态',
                    lic: 'UOM_MENU_YCSJGL_SBSJZT',
                    // lic: 'UOM_MENU_YCSJGL_SJBGL_SBSJZT',
                    url: '/tyywglpt-sjgl-sbsjrz',
                }
            ]
        },
        {
            key: 'gjgl',
            title: '告警管理',
            lic: 'UOM_MENU_GJGL',
            icon: 'nav-tyywglpt-glgl',
            iconActive: 'nav-tyywglpt-glgl-active',
            children: [{
                key: 'gjsz',
                title: '告警设置',
                lic: 'UOM_MENU_GJGL_GJSZ',
                url: '/tyywglpt-gjgl-gjsz',
            }]
        },
        {
            key: 'sqgl',
            title: '授权管理',
            lic: 'UOM_MENU_SQGL',
            url: '/tyywglpt-sqgl-index',
            icon: 'nav-tyywglpt-sqgl',
            iconActive: 'nav-tyywglpt-sqgl-active',
        }

        // --------------------3.6版本屏蔽部分页面，如需新增模块，请先查找注释的菜单-----------------------
        // {
        //     key: 'dlspcjsbgl', // 该项原隶属于资源管理，单独拿出注释
        //     title: '多路视频采集设备管理',
        //     lic: 'UOM_MENU_SBZYGL_DLSPCJSBGL',
        //     url: '/tyywglpt-sbzygl-dlspcjsbgl',
        //     active: false
        // },
        // {
        //     key: 'ccfwgl',
        //     title: '存储服务管理',
        //     icon: 'ccfwgltb',
        //     lic: 'UOM_MENU_CCFWGL',
        //     action: (lastKey === 'ccfwgl' ? 'enter' : 'leave'),
        //     children: [{
        //         key: 'cjzscfwgl',
        //         title: '文件上传服务',
        //         lic: 'UOM_MENU_CCFWGL_WJSCFW',
        //         url: '/tyywglpt-ccfwgl-cjzscfwgl',
        //         active: false
        //     }, {
        //         key: 'khdscfwgl',
        //         title: '客户端上传服务管理',
        //         lic: 'UOM_MENU_KHDSCFWGL',
        //         url: '/tyywglpt-ccfwgl-khdscfwgl',
        //         active: false
        //     }, {
        //         key: 'baqlxfwgl',
        //         title: '办案区录像服务管理',
        //         lic: 'UOM_MENU_BAQLXFWGL',
        //         url: '/tyywglpt-ccfwgl-baqlxfwgl',
        //         active: false
        //     }, {
        //         key: '4gzfylxfwgl',
        //         title: '执法记录仪录像服务',
        //         // lic: 'UOM_MENU_4GZFYLXFWGL',
        //         lic: 'UOM_MENU_CCFWGL_ZFYLXFW',
        //         url: '/tyywglpt-ccfwgl-4gzfylxfwgl',
        //         active: false
        //     }]
        // },
        // {
        //     key: 'sbxhgl',
        //     title: '设备型号管理',
        //     lic: 'UOM_MENU_SBZYGL_SBXHGL',
        //     action: (lastKey === 'sbxhgl' ? 'enter' : 'leave'),
        //     children: [{
        //         key: 'zfyxhgl',
        //         title: '执法记录仪',
        //         lic: 'UOM_MENU_SBZYGL_SBXHGL_ZFJLY',
        //         url: '/tyywglpt-sbxhgl-zfyxhgl',
        //         active: false
        //     }, {
        //         key: 'cjzxhgl',
        //         title: '采集工作站',
        //         lic: 'UOM_MENU_SBZYGL_SBXHGL_CJGZZ',
        //         url: '/tyywglpt-sbxhgl-cjzxhgl',
        //         active: false
        //     }]
        // },
        // {
        //     key: 'bacspz',
        //     title: '办案场所配置',
        //     icon: 'sbzrgltb',
        //     lic: 'UOM_MENU_SBZYGL', // lic 授权校验字段
        //     action: (lastKey === 'bacspz' ?  'enter' : 'leave'),
        //     children: [{
        //         key: 'baq',
        //         title: '办案区',
        //         lic: 'UOM_MENU_ZFYGL',
        //         url: '/tyywglpt-bacspz-baq',
        //         active: true
        //     }, {
        //         key: 'gns',
        //         title: '功能室',
        //         lic: 'UOM_MENU_CJGZZGL',
        //         url: '/tyywglpt-bacspz-gns',
        //         active: false
        //     }]
        // },
        // {
        //     key: 'sjgl',
        //     title: '远程升级管理',
        //     lic: 'UOM_MENU_YCSJGL',
        //     icon: 'sjgltb',
        //     action: ((lastKey === 'sjgl' || lastKey === 'sjbgl') ? 'enter' : 'leave'),
        //     children: [{
        //         key: 'sbsjrz',
        //         title: '设备升级状态',
        //         lic: 'UOM_MENU_YCSJGL_SBSJZT',
        //         url: '/tyywglpt-sjgl-sbsjrz',
        //         active: false
        //     }, {
        //         key: 'sjbgl',
        //         title: '升级包管理',
        //         lic: 'UOM_MENU_YCSJGL_SJBGL',
        //         action: (lastKey === 'sjbgl' ? 'enter' : 'leave'),
        //         children: [{
        //             key: 'zfysjbgl',
        //             title: '执法记录仪',
        //             lic: 'UOM_MENU_YCSJGL_SJBGL_ZFJLY',
        //             url: '/tyywglpt-sjbgl-zfysjbgl',
        //             active: false
        //         }, {
        //             key: 'cjzsjbgl',
        //             title: '采集工作站',
        //             lic: 'UOM_MENU_YCSJGL_SJBGL_CJGZZ',
        //             url: '/tyywglpt-sjbgl-cjzsjbgl',
        //             active: false
        //         }]
        //     }]
        // },
        // ---------------------------------------------------------------------
    ];
    menuService.menu.then(menu => {
        // avalon.log(JSON.stringify(menu.UOM_MENU_TYYWGLPT));
        let remote_list = menu.UOM_MENU_TYYWGLPT; //统一运维管理平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组
        let output_list = []; //已授权的菜单map数组

        avalon.each(remote_list, function (index, el) {
            if (/^UOM_MENU_/.test(el) || /^AUDIO_MENU_/.test(el))
                avalon.Array.ensure(get_list, el);
        });
        avalon.each(list, function (index, el) {
            avalon.each(get_list, function (idx, ele) {
                if (ele == el.lic) { //一级菜单lic验证
                    let child_list = [];
                    if (!el.hasOwnProperty("children") || 0 == el.children.length) {} else {
                        avalon.each(el.children, function (k, v) { //二级菜单lic验证
                            avalon.each(get_list, function (kk, vv) {
                                let child_child_list = [];
                                // 根据配置项控制备机页面是否显示
                                if(!showBeiji && v.lic === 'UOM_MENU_SBZYGL_BJGL') return;
                                if (vv == v.lic) {
                                    if (menu.UOM_MENU_TYYWGLPT_ARR[v.lic])
                                        v.title = menu.UOM_MENU_TYYWGLPT_ARR[v.lic];
                                    child_list.push(v);
                                    // avalon.Array.ensure(child_list, v);
                                    if (!v.hasOwnProperty("children") || 0 == v.children.length) {} else {
                                        avalon.each(v.children, function (i, j) { //三级菜单lic验证
                                            avalon.each(get_list, function (ii, jj) {
                                                if (jj == j.lic) {
                                                    if (menu.UOM_MENU_TYYWGLPT_ARR[j.lic])
                                                        j.title = menu.UOM_MENU_TYYWGLPT_ARR[j.lic];
                                                    child_child_list.push(j);
                                                    return;
                                                }
                                            });
                                        });
                                        child_list[child_list.length - 1].children = child_child_list;
                                    }
                                    return;
                                }
                            });
                            el.children = child_list;
                        });
                    }
                    if (menu.UOM_MENU_TYYWGLPT_ARR && menu.UOM_MENU_TYYWGLPT_ARR[el.lic])
                        el.title = menu.UOM_MENU_TYYWGLPT_ARR[el.lic];
                    avalon.Array.ensure(output_list, el);
                    return;
                }
            });
        });        
        root.menu = output_list;
    });
}

avalon.bind(window, 'hashchange', (e) => {
    isWindowNav = true;
});

//处理ie8由于flash导致页面title变化的问题
let originalTitle = document.title;
avalon.bind(document, 'propertychange', function (event) {
    if (event.propertyName === 'title' && document.title && document.title.indexOf('#') !== -1) {
        setTimeout(function () {
            document.title = originalTitle;
        }, 0);
    }
});

// setTimeout(() => {
//     $(window).resize(function () { //监测浏览器发生大小变化
//         let $header = $('.tyywglpt-list-header');
//         let $content = $('.tyywglpt-list-content');
//         if ($content.get(0).offsetHeight < $content.get(0).scrollHeight - 1) {
//             $header.css({
//                 'padding-right': '17px'
//             });
//         } else {
//             $header.css({
//                 'padding-right': '0'
//             });
//         }
//     });
// }, 1000);

// history
avalon.history.start({
    root: "/",
    fireAnchor: false
});

if ('none' == storage.getItem('license')) {
    root.licenseStatus = false;
} else {
    root.licenseStatus = true;
    if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
        if (/tyywglpt-sqgl-index/.test(global.location.hash)) {

        } else {
            storage.clearAll();
            global.location.href = '/main-login.html';
        }
    }
}
avalon.scan(document.body);