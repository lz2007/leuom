/*
 * @Author: linzhanhong 
 * @Date: 2018-10-11 16:49:19 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2019-03-19 16:53:04
 */

/**
 * 全局导航菜单组件
 * @prop sideMenu 二级菜单数组（侧边栏）
 * 
 * @tips 详细参考/pages/..的各系统html/js应用
 * 
 * @example
 * ``` html
 *      
 * <ms-common-layout :widget="{sideMenu: @menu}">
 *   <!-- slot -->
 *   <div id="content">
 *     <div ms-html="@currentPage"></div>
 *   </div>
 * </ms-common-layout>
 * 
 * ```
 * ```js
 * require('/apps/common/common-layout/common-layout.js'); // 引入组件
 * // 菜单数组结构demo
 * [
 *   {
 *     key: 'sbzygl', // 唯一key值
 *     title: '资源管理', // title，后台返回
 *     lic: 'UOM_MENU_SBZYGL', // lic 授权校验字段
 *     icon: 'nav-tyywglpt-zygl', // 默认icon
 *     iconActive: 'nav-tyywglpt-zygl-active', // active icon
 *     children: [{ // 子菜单，3级
 *       key: 'zctj',
 *       title: '资产统计',
 *       lic: 'AUDIO_MENU_TJFX_ZCTJ',
 *       children: [{ // 子菜单，4级
 *         key: 'zfjly',
 *         title: '执法记录仪',
 *         lic: 'AUDIO_MENU_TJFX_ZCTJ_ZFJLY',
 *         url: '/zfsypsjglpt-tjfx-zctj', // 路由地址，必要
 *     }]
 *   }
 * ]
 * 
 * ```
 */

require('./common-layout.less');
let deleteOcx = require('../common').delete_ocx;
let storage = require('/services/storageService').ret;
import {
    store
} from '/apps/common/common-layout/common-layout-store.js';
import {
    menu,
    getUserInfo
} from '/services/menuService';
import {
    titleName
} from '/services/configService';
import {
    mapCity
} from '/services/storeService';

let name = 'ms-common-layout';
let layoutVm = null,
    pathName,
    isNotMenuHash = false, // 是否是菜单上配置hash路径，false时为不是菜单上配置hash，比如详情页的hash（zfsypsjglpt-sypgl-zfjlysyp-main）
    hashComponent = [], // 当前hash的分割数组
    isWindowNav = false; // isWindowNav用来判断是通过浏览器的导航栏使hash变化的，还是通过点击侧边栏的a标签使hash变化的。true时为浏览器工具条前进后退

getUserInfo.then(info => {
    setTimeout(() => {
        if (layoutVm)
            layoutVm.userName = storage.getItem('userName');
    }, 1000);
});

avalon.component(name, {
    template: __inline('./common-layout.html'),
    soleSlot: 'container',
    defaults: {
        userName: storage.getItem('userName') || "",
        titleName: titleName,
        topMenu: [], // 一级菜单数组（顶部导航）
        sideMenu: [], // 二级菜单数组（侧边栏）
        treeLevelNavList: [], // 三级菜单数组
        selectedNavKey: '', // 一级菜单选中key
        selectedSubnavKey: '', // 二级菜单选中key
        treeLevelNavSelectedKey: '', // 三级菜单选中key
        fourLevelNavSelectedKey: '', // 四级菜单选中key
        toPrevClick: false, // 500ms内点击上一页不操作
        toNextClick: false, // 500ms内点击下一页不操作
        userDropdownShow: false, // 用户信息下拉显隐
        showSidemenu: true, // 是否显示二级菜单（侧边栏）
        haveTreeLevelNav: false, // 是否有三级菜单
        showPrev: false, // 侧边栏上一页按钮显隐
        showNext: true, // 侧边栏说下一页按钮显隐

        topMenuItemClick(item, evt, index) {
            if (item.url == "/") {
                deleteOcx();                
            }
            // 取消对 beforeunload unload 的监听（执法档案等模块的播放页面添加了这两个监听，会导致点击顶部菜单跳转不到问题）
            $(window).unbind('beforeunload');
            $(window).unbind('unload');
            window.location.href = item.url;
        },
        topMenuItemMouseOver(item, evt, index) {
            if (this.selectedNavKey != item.key) {
                evt.currentTarget.classList.add(item.iconActive);
            }
        },
        topMenuItemMouseLeave(item, evt, index) {
            if (this.selectedNavKey != item.key) {
                evt.currentTarget.classList.remove(item.iconActive);
            }
        },
        // 二级菜单点击事件
        sideMenuItemClick(item, index) {
            isNotMenuHash = false;
            if (item.url) {
                avalon.history.setHash(item.url);
                this.haveTreeLevelNav = false;
                this.treeLevelNavList = [];
            } else {
                item.children && item.children.length > 0 && this.navagativeToChildren(item.children, item.key, item.children[0]);
            }
            this.selectedSubnavKey = item.key;
            this.fourLevelNavSelectedKey = ''; // 重置fourLevelNavSelectedKey
            item.children && item.children.length > 0 &&
                item.children[0].children && item.children[0].children.length > 0 &&
                this.fourLevelNavClick(item.children[0].children[0], item.children[0]); // 当有四级菜单，默认选中四级菜单的第一项
        },
        // 三级导航选中
        navagativeToChildren(menu, parentKey, item) {
            // 此处要先判断当前hash值是否为菜单上配置的hash以便于选中当前菜单，因为在initMenuSeleted(hash)方法里的hash参数取了hashComponent的前三项组合
            // （如当'/zfsypsjglpt-sypgl-zfjlysyp-main'则hash为'/zfsypsjglpt-sypgl-zfjlysyp'）
            let selectedKey = item.key;
            if(isNotMenuHash) {
                // 警情管理和案件管理的特殊化处理（详情页公用了/zfsypsjglpt-zfda-ajgl-detail_gongan，所以根据type来进行判断选中）
                // The example of url: /zfsypsjglpt-zfda-ajgl-detail_gongan?jqbh=JJ612222222230100000045171169248c85d036 
                let url = '/' + hashComponent.join('-');
                if(url.indexOf('?') != -1 ) {
                    // 获取 '?jqbh=JJ612222222230100000045171169248c85d036' 的 jqbh 或 ajbh 
                    let type = url.split('?')[1].match(/(\S*)=/)[1];
                    if(type == 'jqbh') {
                        // 警情管理tab选中赋值，对应/zfsypsjglpt/menuConfig.js的警情管理的key
                        selectedKey = 'zfsypsjglpt-zfda-jqgl_gongan';
                    } else if(type == 'ajbh') {
                        // 案件管理tab选中赋值，对应/zfsypsjglpt/menuConfig.js的案件管理的key
                        selectedKey = 'zfsypsjglpt-zfda-ajgl_gongan';
                    }
                }
                avalon.history.setHash(url);
            } else {
                item.url && avalon.history.setHash(item.url);
            }
            this.selectedSubnavKey = parentKey;
            this.haveTreeLevelNav = true;
            this.treeLevelNavList = menu;
            this.treeLevelNavSelectedKey = selectedKey;
            // 重新扫描.treeLevelNavChildUl节点，防止四级菜单在切换时节点没有解析而出现 child.title
            // 不能通过avalon.scan(document.body)进行扫描，这样会导致地图每次都会重新加载
            let scanDom = document.getElementsByClassName('treeLevelNavChildUl')[0];
            scanDom && avalon.scan(scanDom);
        },
        sideMenuItemMouseOver(item, evt, index) {
            if (this.selectedSubnavKey != item.key) {
                evt.currentTarget.classList.add(item.iconActive);
            }
        },
        sideMenuItemMouseLeave(item, evt, index) {
            if (this.selectedSubnavKey != item.key) {
                evt.currentTarget.classList.remove(item.iconActive);
            }
        },

        /**
         *  页面刷新是循环递归函数，用于获取当前菜单选中
         *
         * @param {*} list 菜单array
         * @param {*} hash 当前浏览器hash地址
         * @param {*} parentKey 父级key值
         * @param {*} isChild 是否是子菜单
         * @param {*} listItem 当前3级菜单数据（包含key、children等），的用于4级菜单数据
         * @param {*} level 遍历菜单层级
         * @returns
         */
        setSelectedSubnavKey(list, hash, parentKey, isChild, listItem, level) {
            var level = level || 0;
            level++;
            for (let i = 0; i < list.length; i++) {
                if (list[i].url && list[i].url.replace('/', '') == hash) {
                    !isChild ? this.selectedSubnavKey = list[i].key :
                        level == 3 ? this.fourLevelNavClick(list[i], listItem) :
                        (this.treeLevelNavSelectedKey = list[i].key,
                            this.navagativeToChildren(list, parentKey, list[i]));
                    return;
                } else {
                    if (list[i].children && list[i].children.length > 0) {
                        this.setSelectedSubnavKey(list[i].children, hash, list[i].key, true, list[i], level);
                    }
                }
            }
        },
        // 三级菜单点击
        treeLevelNavClick(item, event) {
            if(event) {
                isNotMenuHash = false;
            }
            this.fourLevelNavSelectedKey = ''; // 重置fourLevelNavSelectedKey 此处有坑：绑定click事件要阻止事件捕获冒泡，:click="fourLevelNavClick(child, item, $event) | stop"
            item.url && (avalon.history.setHash(item.url), this.treeLevelNavSelectedKey = item.key);
        },
        // 四级菜单点击
        fourLevelNavClick(item, menu, event) {
            if(event) {
                isNotMenuHash = false;
            }
            item.url && (avalon.history.setHash(item.url), this.fourLevelNavSelectedKey = item.key);
            let key_0 = menu.key;
            let navList = [];
            let parentKey = '';
            if (!event) { // 不是点击菜单时才需要遍历获取，否则直接赋值
                // 每次循环拿值是因为页面刷新时数据保持完整
                avalon.each(this.sideMenu, (key, val) => {
                    if (val.children && val.children.length > 0) {
                        avalon.each(val.children, (index, value) => {
                            if (value.key == key_0) {
                                navList = val.children;
                                parentKey = val.key;
                                return; // 退出循环
                            }
                        });
                    }
                });
            } else {
                navList = this.treeLevelNavList;
                parentKey = this.selectedSubnavKey;
            }
            this.navagativeToChildren(navList.$model, parentKey, menu);
        },
        // 上一页
        toPrev(event) {
            if (this.toPrevClick) {
                return;
            } else {
                this.toPrevClick = true;
                let liHeight = $('.sider-content ul li')[0].offsetHeight;
                let offsetTop = $('.sider-content ul')[0].offsetTop;
                setTimeout(() => {
                    this.toPrevClick = false;
                }, 500);
                if (offsetTop >= 0) {
                    this.showPrev = false;
                    return;
                }
                this.showNext = true;
                $('.sider-content ul').stop().animate({
                    top: offsetTop + liHeight
                }, 500);

                // 隐藏向上翻页按钮
                setTimeout(() => {
                    if ($('.sider-content ul')[0].offsetTop >= 0) {
                        this.showPrev = false;
                    }
                }, 500);
            }
        },
        // 下一页
        toNext(event) {
            if (this.toNextClick) {
                return;
            } else {
                this.toNextClick = true;
                let domParams_1 = this.getDomParams();
                let {
                    liHeight,
                    offsetTop,
                    canScrollTop
                } = domParams_1;
                setTimeout(() => {
                    this.toNextClick = false;
                }, 500);
                if (Math.abs(offsetTop) > Math.ceil(canScrollTop / liHeight) * liHeight) {
                    this.showNext = false;
                    return;
                }
                this.showPrev = true;
                $('.sider-content ul').stop().animate({
                    top: offsetTop - liHeight
                }, 500);

                this.hideNextbtn();
            }
        },
        // 隐藏向下翻页按钮
        hideNextbtn() {
            setTimeout(() => {
                let domParams_2 = this.getDomParams();
                let {
                    liHeight,
                    offsetTop,
                    canScrollTop
                } = domParams_2;
                if (Math.abs(offsetTop) > Math.floor(canScrollTop / liHeight) * liHeight) {
                    this.showNext = false;
                }
            }, 500);
        },
        // 获取相关DOM参数
        getDomParams() {
            let liHeight = $('.sider-content ul li')[0].offsetHeight;
            let offsetTop = $('.sider-content ul')[0].offsetTop;
            let clientHeight = $('.sider-content ul')[0].clientHeight;
            let canScrollTop = clientHeight - $('.sider-content')[0].clientHeight;
            return {
                liHeight,
                offsetTop,
                clientHeight,
                canScrollTop
            };
        },
        resetPageBtnStatus() {
            if ($('.sider-content ul')[0] == undefined) {
                return;
            }
            let offsetTopPre = $('.sider-content ul')[0].offsetTop;
            let domParams_1 = this.getDomParams();
            let {
                liHeight,
                offsetTop,
                canScrollTop
            } = domParams_1;
            if (offsetTopPre >= 0) {
                this.showPrev = false;
            } else {
                this.showPrev = true;
            }
            if (Math.abs(offsetTop) >= Math.ceil(canScrollTop / liHeight) * liHeight) {
                this.showNext = false;
            } else {
                this.showNext = true;
            }
        },
        userInfoClick() {
            this.userDropdownShow = !this.userDropdownShow;
            //请求我的告警信息接口
            setTimeout(function () {//延迟处理请求数据太多
                avalon.components['ms-header-operation'].defaults.ajaxMyAlarm();
            }, 300);
        },
        editPassword() {
            avalon.components['ms-header-operation'].defaults.changePwd.show = true;
        },
        loginOut() {
            avalon.components['ms-header-operation'].defaults.logout_vm.show_logout = true;
        },
        viewMyAlarm() {
            avalon.vmodels['myAlarm'].show = true;
        },
        // 初始化选中
        initMenuSeleted(hash) {
            if(!hash) {
                isNotMenuHash = false;
            }
            hash = hash || window.location.hash && window.location.hash.replace('#!/', '');
            hash == '' && pathName != '' ? this.sideMenuItemClick(this.sideMenu[0]) : this.setSelectedSubnavKey(this.sideMenu, hash, '', false);
        },

        onInit: function (event) {
            layoutVm = event.vmodel;
            let _this = this;
            menu.then(menu => {
                // 获取授权的顶部菜单
                _this.topMenu = menu.APP_MENU;
                if(!_this.topMenu || _this.topMenu.length === 0) {
                    return;
                }

                // 校验顶部菜单是否有权限，当前路径无权限时强制跳转至第一项菜单
                let topMenuLic = _this.topMenu.every((current) => {
                    return window.location.pathname !== current.url;
                });
                if (topMenuLic) {
                    _this.topMenuItemClick(_this.topMenu[0]);
                    return;
                }

                if (_this.sideMenu.$model.length > 0) {
                    _this.showSidemenu = true;
                    $('.common-layout .layout-container').css({
                        left: 210
                    });
                    _this.hideNextbtn();
                }

                pathName = window.location.pathname.replace('/', '');
                avalon.each(_this.topMenu, (k, v) => {
                    if (v.url.replace('/', '') == pathName) {
                        _this.selectedNavKey = v.key;
                    }
                });
                let hash = window.location.hash && window.location.hash.replace('#!/', '');
                hashComponent = hash.split('-');
                let combiteHash = false;
                if (hashComponent.length > 3) {
                    let matchArr = hashComponent[hashComponent.length - 1].match(/_(\S*)/);
                    // 匹配_gongan 或者 _jiaojing，以保证菜单能正确选中
                    let type = matchArr ? `_${matchArr[1].indexOf('?') != -1 ? matchArr[1].match(/(\S*)\?/)[1] : matchArr[1]}` : '';
                    combiteHash = hashComponent.slice(0, 3).join('-') + `${type}`;
                    isNotMenuHash = true;
                }
                _this.initMenuSeleted(combiteHash);

                // 点击浏览器前进后退菜单选中
                avalon.bind(window, "hashchange", (e) => {
                    deleteOcx();
                    // 指挥中心页面的 实时指挥、人脸、车牌、人证共用了 sszhxt-sszh.js 这个模块，要排除
                    // if(e.newURL.split('#!/')[1] !== 'sszhxt-sszh') { ie11 没有e.newURL
                    if(window.location.href.split('#!/')[1] !== 'sszhxt-sszh') {
                        _this.initMenuSeleted();
                    }
                    setTimeout(() => {
                        _this.resetPageBtnStatus();
                    }, 1500);
                });

                $(window).resize(() => {
                    _this.resetPageBtnStatus();
                });
            });

            this.$watch('userDropdownShow', (v) => {
                if (v) {
                    $(".user-drop-down").slideDown();
                } else {
                    $(".user-drop-down").slideUp();
                }
            });

            // 授权页面不请求
            if(window.location.hash !== '#!/tyywglpt-sqgl-index') {
                mapCity.getCity(); // 获取当前地图的默认城市
            }

            // redux 状态管理，存储当前选中的二级菜单key值（selectedSubnavKey），用法参考 sszhxt-sszh.js
            this.$watch('selectedSubnavKey', (key) => {
                store.dispatch({
                    type: "storeSidermenu",
                    siderMenuSelectedKey: key
                });
            });
        },
        onReady: function (event) {
            if (this.sideMenu.$model.length == 0) {
                this.showSidemenu = false;
                $('.common-layout .layout-container').css({
                    left: 20
                });
            }

            this.$watch('selectedSubnavKey', (v) => {
                avalon.each(this.sideMenu, (key, val) => {
                    if (val.key == v && val.children && val.length > 0) {
                        this.haveTreeLevelNav = true;
                        this.treeLevelNavList = val.children;
                    }
                });
            });
            // 有无三级导航栏时调整 .ant-currentPage 的top
            this.$watch('haveTreeLevelNav', (v) => {
                /zfsypsjglpt/.test(global.location.href) &&
                    (v ? $(".ant-currentPage").css({
                        "top": 60
                    }) : $(".ant-currentPage").css({
                        "top": 0
                    }));
            });
            this.$fire('haveTreeLevelNav', this.haveTreeLevelNav);            
        },
        onDispose: function (event) {}
    }
});
