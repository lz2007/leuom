/**
 * 实时指挥系统中部分公用的侧边栏
 * @prop {String} owner 标识字符串
 * @prop {Array} recentData 最近项的数据
 * @prop {Array} foldControlShow 是否显示折叠按钮
 * @event {Function} onCheck 当勾选节点时触发
 * @event {Function} extraProcessWhenExpand  当展开节点时进行一些额外操作
 * @event {Function} extraProcessWhenPersonChange  当人员信息变化时进行一些额外操作
 * @event {Function} sidebarFoldChange  sidebar折叠操作
 * @example
 * ```
 * demo
 * <ms-poll-sidebar :widget="{owner:'videoMonitor',recentData:@recentData,fetchRecent:@fetchRecent,onCheck:@handleTreeCheck,extraProcessWhenExpand:@extraProcessWhenExpand,extraProcessWhenPersonChange:@extraProcessWhenPersonChange}">
        //下面的li为slot
        <li :for="($index, el) in @recentData" :class="[el.type === 'device' ? 'device' : 'person']">{{el.name}}&nbsp;{{el.time}}</li>
    </ms-poll-sidebar>
 * 可参见 sszhxt-spjk 模块
 * 
 * ```
 */

import {
    notification,
    createForm
} from "ane";
import ajax from '../../services/ajaxService';
require('/apps/common/common-sszh-sidebar.less');
require('/apps/common/common-loading-mask.js');
const storage = require('../../services/storageService.js').ret;
const orgModel = require("./common-sszh-treemodel.js");
let vm = null;

let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

avalon.component('ms-sszh-sidebar', {
    template: __inline('./common-sszh-sidebar.html'),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        sidebar_txt: language_txt.sszhxt.sszhxt_sszh,
        sidebarMode: 0,
        searchNodeList: [],
        keyword: '',
        placholder: languageSelect == "en" ? 'Pls input user name/ID/Dept' : '请输入警员姓名/警号/部门',
        inputStatus: 0, //0---初始化 1---未输入关键字  2---已输入关键字
        owner: 'poll-tree',
        isJustOnline: false,
        isJustParent: false, //只显示父级
        dataStr: '',
        dataJson: {},
        $saveJson: {
            "keyword": '',
            "expandNodes": []
        },
        devType: ['all'], //设备类型
        expandNodes: [], //展开的部门节点
        foldControlClass: '',
        sidebarFolding: false,
        foldControlShow: false,
        loading: false, // 结果加载中
        sidebarFoldChange: avalon.noop,
        onCheck: avalon.noop,
        extraProcessWhenExpand: avalon.noop,
        extraProcessWhenPersonChange: avalon.noop,
        extraHandleWhenCheckOrg: avalon.noop,
        returnTreeObj: avalon.noop, //放回部门树对象
        $Form: createForm(),
        onInit(event) {
            vm = event.vmodel;
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.keyword = v.keyword === "" ? this.placholder : v.keyword;
                    this.inputStatus = v.keyword === "" ? 0 : v.inputStatus;
                    this.expandNodes = v.expandNodes.length > 0 ? v.expandNodes : [];
                    this.$saveJson.expandNodes = this.expandNodes;
                    if (v.searchNodeList) {
                        this.searchNodeList = v.searchNodeList;
                    }
                } else {
                    this.keyword = this.placholder;
                }
            });
        },
        onReady: function (event) {
            let storageStr = storage.getItem(this.owner);
            this.dataJson = storageStr ? storageStr : null;
            orgTree.init(() => {
                if (this.inputStatus === 2 && this.keyword !== this.placholder) {
                    this.handleSearch();
                }
                for (let i = 0; i < this.expandNodes.length; i++) {
                    let node = orgTree.getNodeByParam("orgId", this.expandNodes[i]);
                    orgTree.expandNodes(node);
                }
            });
            setHeight();
            $(window).on('resize', setHeight);
            orgModel.orgModel.startUpdateOrgTimer();
            orgModel.orgModel.startUpdatePerTimer();
            orgModel.orgModel.setOwner(this.owner);
        },
        onDispose() {
            orgModel.orgModel.stopUpdateOrgTimer(); //清除掉部门更新定时器
            orgModel.orgModel.stopUpdatePerTimer(); //清除掉人员更新定时器
            orgModel.orgModel.clearSavedData(); //清空保存的数据
            $(window).off('resize', setHeight);
            //this.dataStr = this.$saveJson;
            var a = vm.$model.$saveJson;
            storage.setItem(this.owner, a, 0.5);
        },
        foldControl(event) {
            if(this.sidebarFolding)
            return;
            if(event.target.classList.contains('unfold-control')) {
                this.sidebarFolding = true;
                $('.common-sszh-side-bar').animate({
                    left: 0
                }, 500);
                this.sidebarFoldChange('open');
                setTimeout(() => {
                    this.foldControlClass = '';
                    this.sidebarFolding = false;
                }, 500);
            } else {
                this.sidebarFolding = true;
                this.sidebarFoldChange('close');
                $('.common-sszh-side-bar').animate({
                    left: -280
                }, 500);
                setTimeout(() => {
                    this.foldControlClass = 'unfold-control';
                    this.sidebarFolding = false;
                }, 500);
            }
        },
        handledevTypeChange(event) {
            orgTree.hideNodesByDevtype(event.target.value);
        },
        devTypeClick(val, event) { // 设备类型点击事件
            let typeLength = $(event.target).parent().children().length;
            if(this.devType.indexOf(val) >= 0) {
                avalon.Array.remove(this.devType, val);
                event.target.classList.remove('disactive');
            } else {
                avalon.Array.ensure(this.devType, val);
                event.target.classList.add('disactive');
            }
            if(this.devType.$model.length == (typeLength + 1)) {
                this.devType = ['all'];
            } else {
                avalon.Array.remove(this.devType, 'all');
            }
            if(this.devType.$model.length == 0) {
                this.devType = ['all'];
            }
            orgTree.hideNodesByDevtype(this.devType.$model);
        },
        handleSearchInputFocus(event) {
            $(event.target).siblings('.fa-close').show();
            if (this.inputStatus === 0 || this.inputStatus === 1) {
                this.inputStatus = 2;
                this.keyword = '';
            }
        },
        handleSearchInputBlur(event) {
            $(event.target).siblings('.fa-close').hide();
            if ($.trim(this.keyword) === '') {
                this.inputStatus = 0;
                this.keyword = this.placholder;
            } else {
                this.inputStatus = 2;
            }
        },
        handleKeyClear(event) {
            this.keyword = '';
            $(event.target).siblings('input').val('').focus();
        },
        handleSearch() {
            let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
            this.$saveJson.keyword = this.keyword;
            this.$saveJson.inputStatus = this.inputStatus;
            if (this.inputStatus !== 2) {
                this.inputStatus = 1;
                return false;
            }
            if (!reg.test(this.keyword)) {
                notification.warning({
                    title: languageSelect == "en" ? 'notification' : '通知',
                    message: languageSelect == "en" ? 'special characters not supported，reenter please' : '不支持搜索特殊字符，请重新输入'
                });
                $('.common-sszh-side-bar .input-group input').focus();
                this.$saveJson.keyword = "";
                this.$saveJson.inputStatus = 0;
                return false;
            }
            orgTree.searchNode();
        },
        handleQuickSearch(event) {
            if (event.keyCode == 13) {
                $('.common-sszh-side-bar .input-group input').blur();
                this.handleSearch();
            }
        },
        handleCheckJustOnline(event) {
            if (this.isJustOnline) {
                orgTree.hideOrShowOffLineNodes(true);
            } else {
                orgTree.hideOrShowOffLineNodes(false);
            }
        }
    },
});



//================================================观察者模式更新部门树================================================
/**
 * 部门树
 * 功能包括：首先加载部门，根据用户展开部门节点获取人员，自动更新统计人员在线人数，总人数，人员变更
 * 模块代码来自旧平台实时指挥模块GMOrgtree.js和treeModel.js两个文件，部分有更改
 *
 *
 */

const orgTree = (function () {
    // 部门树的配置信息
    let setting = {
        data: {
            key: {
                children: "childs",
                name: "displayName"
            }
        },
        check: {
            enable: true,
            chkboxType: {
                "Y": "p",
                "N": "p"
            }
        },
        view: {
            fontCss: getFontCss,
            //addHoverDom: addHoverDom,
            //removeHoverDom: removeHoverDom,
            nameIsHTML: true,
            dblClickExpand: false
        },
        callback: {
            beforeClick: beforeClick,
            beforeDblClick: beforeDblClick,
            beforeCheck: beforeCheck,
            //beforeExpand:beforeExpand,
            onExpand: zTreeOnExpand,
            onCollapse: zTreeOnCollapse,
            onCheck: onChecked,
            onDblClick: onDblClick
        }
    };
    // 事件类型
    let events = {
        'ORG_FIRSTLOAD': 'org_firstload',
        'ORG_CHANGE': 'org_change',
        'ORG_COUNTCHANGE': 'org_countchange',
        'PERSON_CHANGE': 'person_change',
        'ORG_UPDATED': 'org_updated',
        'PERSON_UPDATED': 'person_updated'
    };
    // 使用频率高，用于保存poll-tree对象
    let treeObj = null;
    // 需要更新的部门
    let needUpdateIds = {};
    /**
     * 返回字体样式  高光or普通
     * */
    function getFontCss(treeId, treeNode) {
        return (!!treeNode.highlight) ? {
            color: "#0078d7",
            "font-weight": "bold"
        } : {
            color: "#081225",
            "font-weight": "normal"
        };
    }

    /**
     * 展开前操作
     */
    function beforeExpand() {
        if (!treeObj) {
            return false;
        }

    }
    /**
     * 为节点添加刷新功能(悬浮显示刷新按钮)，暂不加该功能
     */
    function addHoverDom(treeId, treeNode) {
        if (!treeNode.isParent) {
            if (treeNode.online == 0) {
                return;
            }
            let sObj = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#statusBtn_" + treeNode.tId).length > 0) {
                return;
            }
            let addStr = "<span class='button add' id='statusBtn_" + treeNode.tId + "' title='" + getI18NStr('msg.state') + "' onfocus='this.blur();'><i class='fa fa-comment'></i></span>";
            sObj.after(addStr);
            let btn = $("#statusBtn_" + treeNode.tId);
            if (btn) {
                btn.bind("click", function () {
                    let pData = {
                        'deviceIds': [treeNode.deviceId],
                        'deviceType': 100
                    };

                    $.ajax({
                        url: basePath + "/map/command/devicegps.action",
                        method: "post",
                        contentType: "application/json",
                        dataType: 'json',
                        data: JSON.stringify(pData),
                        async: false,
                        cache: false,
                        error: function (evt) {
                            if (evt.status === 404 || evt.statusText === 'Not Found') {
                                alert('登陆超时, 请重新登陆');
                                window.top.document.location.reload();
                                return;
                            }
                            alert(getI18NStr('alert.getDevInfoFail'));
                            return;
                        },
                        success: function (ret) {
                            if (ret.headers.ret != 0) {
                                alert(getI18NStr('alert.getDevInfoFailOffline'));
                                return;
                            }
                            showStatusWnd(treeNode.deviceId, 100, treeNode.userName, treeNode.userCode, treeNode.accountId, ret.body[0].detail.dsjStatus.battery, ret.body[0].detail.dsj.version);
                            if (treeNode.checked == true) {
                                gisUpdateStatusWnd = treeNode.deviceId; //更新地图右上角的信息窗口
                                return;
                            }
                            gisUpdateStatusWnd = null;
                        }
                    });
                    return;
                });
            }
            return;
        }

        let sObj = $("#" + treeNode.tId + "_span");
        if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) {
            return;
        }
        let addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='" + getI18NStr('msg.update') + "' onfocus='this.blur();'><i class='fa fa-refresh'></i></span>";
        sObj.after(addStr);
        let btn = $("#addBtn_" + treeNode.tId);
        if (btn) {
            btn.bind("click", function () {
                btn.find("i").addClass("fa-spin fa-fw");
                // 清除节点下的警员, 不移除部门
                let nodes = treeObj.getNodesByParam("isParent", true, treeNode);
                let nodesp = treeObj.getNodesByParam("isParent", false, treeNode);
                if (nodesp.length != 0 || nodes.length != 0) {
                    treeObj.removeChildNodes(treeNode);
                }
                let level = treeNode.level;
                let temNodes = [];
                if (nodes.length != 0) {
                    $.each(nodes, function (n, value) {
                        if (level == value.level - 1) {
                            temNodes.push(value);
                        }
                    });

                    treeObj.addNodes(treeNode, 0, temNodes);
                }
                orgModel.orgModel.getOrgPerson(treeNode.orgId, function (data) {
                    $.each(data, function (i, value) {
                        value.isParent = false;
                        value.nocheck = false;
                        //value.checked = isShowMap(value.userCode);
                        // value.checked = isShowMap(value.deviceId);
                        if (value.online == 1) {
                            value.chkDisabled = true; //.chkDisabled
                            value.icon = basePath + "/content/common/images/dis_node_police.png";
                        }
                    }, true);
                    treeObj.addNodes(treeNode, 0, data);
                    treeNode.loaded = true;
                    btn.find("i").removeClass("fa-spin fa-fw");
                    let node = treeObj.getNodesByFilter(function (node) {
                        if (lastValue == "") {
                            node = null;
                            return node;
                        }
                        return node.deviceId == userName || node.userName == userName || node.userCode == userName;
                    }, true, treeNode);
                    if (node) {
                        if (!~nodeList.indexOf(node)) {
                            nodeList.push(node);
                        }
                        node.highlight = true;
                        treeObj.updateNode(node);
                    }
                });
                return false;
            }, function () {
                avalon.log('fail')
            });
        }
    };
    /**
     * 隐藏刷新，暂不加该功能
     */
    function removeHoverDom(treeId, treeNode) {
        if (!treeNode.isParent) {
            $("#statusBtn_" + treeNode.tId).unbind().remove();
        } else {
            $("#addBtn_" + treeNode.tId).unbind().remove();
        }
    };
    /**
     * 勾选父节点，只勾选一级
     */
    var judge = null;

    function checkNode(treeNode) {
        if (!treeNode.isParent) {
            return;
        }
        judge = true;
        //点击部门或者点击多通道设备时选择他们下面的一级子节点
        let node = !treeNode.mytype ? treeObj.getNodesByParam('orgId', treeNode.orgId) : treeObj.getNodesByParam('gbcode', treeNode.gbcode);
        let checked = !treeNode.checked;
        if (node.length <= 0 || !node[0].childs) {
            return;
        }
        for (let i = 0; i < node[0].childs.length; i++) {
            if (node[0].childs[i].isParent) {
                continue;
            }
            treeObj.checkNode(node[0].childs[i], checked, false, true);
        }
        judge = false;
    }
    /**
     * 双击时
     * @param {*} event 
     * @param {*} treeId 
     * @param {*} treeNode 
     */
    function onDblClick(event, treeId, treeNode) {
        if (vm.owner == 'mapConduct') {
            if (!treeNode.isParent) {
                treeObj.checkNode(treeNode, true, true, true);
            }
            return;
        }
        treeObj.checkNode(treeNode, '', true, true);
    }
    /**
     * checkbox onCheck事件
     * @param {Object} event
     * @param {String} treeId
     * @param {Object} treeNode
     */
    //勾选时,judege用于判断地图是否设置中心点
    function onChecked(event, treeId, treeNode) {   
        if (treeNode.isParent && !vm.isJustParent) {
            return;
        }
        vm.onCheck(event, treeId, treeNode, !judge);
    }
    /**
     * 禁用部门树节点的单击
     */
    function beforeClick(treeId, treeNode, clickFlag) {
        return false;
    }

    /**
     * 禁用部门树节点的单击
     */
    function beforeDblClick(treeId, treeNode) {
        if (!treeNode) {
            return;
        }
        if (vm.owner == 'mapConduct') {
            //实时指挥那里需要双击定位人员
            return true;
        } else {
            if (!treeNode.checked) {
                return true;
            } else {
                return false;
            }
        }

    }

    function beforeCheck(treeId, treeNode) {
        if (treeNode.isParent && !treeNode.checked) {
            //比如勾选部门树，缩放地图层级
            vm.extraHandleWhenCheckOrg();
        }
        if (treeNode.isParent && !treeNode.open) {
            treeObj.expandNode(treeNode, true, false, true, true);
            checkNode(treeNode);
        } else {
            checkNode(treeNode);
        }
    }

    // 当节点展开时
    function zTreeOnExpand(event, treeId, treeNode) {
        if (vm.isJustParent) return; // 只显示父级
        if (treeNode.type) return; //视频监控，点击多通道展开时不加东西
        if (!needUpdateIds[vm.owner]) {
            needUpdateIds[vm.owner] = [];
        }
        var pos = needUpdateIds[vm.owner].indexOf(treeNode.orgId);
        if (pos == -1) {
            needUpdateIds[vm.owner].push(treeNode.orgId);
            addHandler(events.PERSON_UPDATED, onPersonInfoChange, vm.owner, needUpdateIds[vm.owner]);
        }
        if (vm.expandNodes.indexOf(treeNode.orgId) == -1) {
            vm.expandNodes.push(treeNode.orgId);
            vm.$saveJson.expandNodes = vm.expandNodes;
        }
        if (treeNode.loaded) {
            //表示该节点的已经请求过数据加载了
            let nodeList = treeObj.getNodesByFilter(function (node) {
                if (vm.keyword == "" || vm.keyword == vm.placholder) {
                    node = null;
                    return node;
                }
                return new RegExp(vm.keyword).test(node.usercode) || new RegExp(vm.keyword).test(node.username) || new RegExp(vm.keyword).test(node.orgName) || new RegExp(vm.keyword).test(node.displayName);
            }, false, treeNode);
            if (nodeList) {
                for (var j = 0; j < nodeList.length; j++) {
                    var node = nodeList[j];
                    if (node) {
                        if (!~vm.searchNodeList.indexOf(node)) {
                            vm.searchNodeList.push(node);
                        }

                        node.highlight = true;
                        treeObj.updateNode(node);
                    }
                }
            }
            return;
        }

        //多通道设备先获取
        let symbols = false;
        orgModel.orgModel.getOrgmutilDev(treeNode.orgId, function (data) {
            treeNode.loaded = true;
            symbols = true;
            avalon.each(data, function (i, value) {
                value.isParent = false;
                // value.nocheck = value.gbcode == "";
                value.nocheck = false;
                // value.displayName = value.username + "(" + value.usercode + ')';
                if (value.name != "") {
                    value.displayName = value.name;
                } else {
                    value.displayName = value.type;
                }
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                if (value.online === 1) { //1在线0不在线
                    value.chkDisabled = false;
                    if (value.mytype == 1) {
                        value.icon = '/static/image/theme/sszhxt/deviceTree/fastDomeCameras-offline.png';
                    } else if (value.mytype == 2) {
                        value.icon = '/static/image/theme/sszhxt/deviceTree/car-online.png';
                    } else {
                        value.icon = '/static/image/theme/sszhxt/deviceTree/drone-online.png';
                    }
                    if (vm.owner != 'mapConduct') {
                        //是视频监控的，处理数据
                        value.isParent = true;
                        avalon.each(value.channelSet, function (index, item) {
                            item.icon = '/static/image/sszhxt/channel.png'; //上线图标
                            item.chkDisabled = false;
                            item.displayName = item.name;
                        })
                        value.childs = value.channelSet;
                    }
                } else {
                    value.chkDisabled = true; //.chkDisabled
                    if (value.mytype == 1) { //
                        value.icon = '/static/image/theme/sszhxt/deviceTree/fastDomeCameras-offline.png';
                    } else if (value.mytype == 2) {
                        value.icon = '/static/image/theme/sszhxt/deviceTree/car-offline.png';
                    } else {
                        value.icon = '/static/image/theme/sszhxt/deviceTree/drone-offline.png';
                    }
                    if (vm.owner != 'mapConduct') {
                        //是视频监控的，处理数据
                        value.isParent = true;
                        avalon.each(value.channelSet, function (index, item) {
                            item.icon = '/static/image/sszhxt/channeloutline.png'; //下线图标
                            item.chkDisabled = true;
                            item.displayName = item.name;
                        })
                        value.childs = value.channelSet;
                    }
                }
                //对value的一些额外的操作，比如value.checked = isShowMap(value.deviceId);
                vm.extraProcessWhenExpand(i, value);
            });
            //加多通道设备
            treeObj.addNodes(treeNode, 0, data);
            //判断是否只看在线
            if (vm.isJustOnline) {
                hideOrShowOffLineNodes(true);
            }

            //执法仪获取
            orgModel.orgModel.getOrgPerson(treeNode.orgId, function (data) {
                treeNode.loaded = true;
                avalon.each(data, function (i, value) {
                    value.isParent = false;
                    // value.nocheck = value.gbcode == "";
                    value.nocheck = false;
                    // value.displayName = value.username + "(" + value.usercode + ')';
                    if (value.username != "") {
                        value.displayName = value.username + "(" + value.usercode + ')';
                    } else {
                        value.name = value.name ? value.name : '-';
                        value.displayName = value.name;
                    }
                    if (value.online === 1) { //1在线0不在线
                        value.chkDisabled = false;
                        if (value.isLocking) { //0--未锁定，1--锁定
                            value.icon = '/static/image/sszhxt/locked.png';
                        } else if (value.source) {
                            value.icon = '/static/image/sszhxt/platform_online.png';
                        } else {
                            value.icon = '/static/image/theme/sszhxt/deviceTree/dev-online.png';
                        }
                    } else {
                        value.chkDisabled = true; //.chkDisabled
                        if (value.isLocking) { //0--未锁定，1--锁定
                            value.icon = '/static/image/sszhxt/locked.png';
                        } else if (value.source) {
                            value.icon = '/static/image/sszhxt/platform_offline.png';
                        } else {
                            value.icon = '/static/image/theme/sszhxt/deviceTree/dev-offline.png';
                        }
                    }
                    //对value的一些额外的操作，比如value.checked = isShowMap(value.deviceId);
                    vm.extraProcessWhenExpand(i, value);
                });

                //加执法仪
                treeObj.addNodes(treeNode, 0, data);


                //展开的时候检查父级是否勾选，若勾选则直接子元素均勾选
                let childNodes = treeObj.getNodesByFilter((node) => {
                    return (!node.isParent && node.online === 1)
                }, false, treeNode);
                if (treeNode.checked && childNodes) {
                    for (var i = 0; i < childNodes.length; i++) {
                        treeObj.checkNode(childNodes[i], true, false, true);
                    }
                }
                if (!childNodes || !childNodes.length) {
                    //如果直接子元素全都不在线，父级勾选框禁用
                    // treeNode.checked = false;
                    treeObj.checkNode(treeNode, false, true, false);
                    treeNode.chkDisabled = true;
                    treeObj.updateNode(treeNode);
                }
                //判断是否只看在线
                if (vm.isJustOnline) {
                    hideOrShowOffLineNodes(true);
                }
                let nodeList = treeObj.getNodesByFilter(function (node) {
                    if (vm.keyword == "" || vm.keyword == vm.placholder) {
                        node = null;
                        return node;
                    }
                    return new RegExp(vm.keyword).test(node.usercode) || new RegExp(vm.keyword).test(node.username) || new RegExp(vm.keyword).test(node.orgName) || new RegExp(vm.keyword).test(node.displayName);
                }, false, treeNode);
                if (nodeList) {
                    for (var j = 0; j < nodeList.length; j++) {
                        var node = nodeList[j];
                        if (node) {
                            if (!~vm.searchNodeList.indexOf(node)) {
                                vm.searchNodeList.push(node);
                            }

                            node.highlight = true;
                            treeObj.updateNode(node);
                        }
                    }
                }
            }, function () {
                // treeNode.checked = false;
                if (!symbols) {
                    treeObj.checkNode(treeNode, false, true, false);
                    treeNode.chkDisabled = true;
                    treeObj.updateNode(treeNode)
                }
            });
        });


    }

    // 节点折叠事件
    function zTreeOnCollapse(event, treeId, treeNode) {
        let nodePos = vm.expandNodes.indexOf(treeNode.orgId);
        if (nodePos > 0) {
            vm.expandNodes.splice(nodePos, 1);
            vm.$saveJson.expandNodes = vm.expandNodes;
        }
        // var pos = needUpdateIds.indexOf(treeNode.orgId);
        // if (pos == -1) {
        //     return;
        // }
        //
        // needUpdateIds.splice(pos, 1);
        //addHandler(events.PERSON_UPDATED, onPersonInfoChange, 'mapConduct', needUpdateIds);
    }

    function addHandler(type, handler, owner, orgIds) {
        orgModel.orgModel.addHandler(type, handler, owner, orgIds);
    }

    /**
     * 初始化树
     */
    function init(callback) {
        window.HTMLElement = window.HTMLElement || Element;
        vm.loading = true;
        orgModel.orgModel.getAllorgInfo(function (ret) {
            if (ret) {
                $.fn.zTree.init($("#poll-tree"), setting, ret);
                treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                vm.returnTreeObj(treeObj);
                vm.loading = false;
                var nodes = treeObj.getNodes();
                for (var i = 0; i < nodes.length; i++) { //设置节点展开一级
                    treeObj.expandNode(nodes[i], true, false, true, true);
                    break;
                }
                avalon.isFunction(callback) && callback();
                addHandler(events.ORG_UPDATED, onUpdateOrgDetailInfo);
                addHandler(events.ORG_FIRSTLOAD, onUpdateOrgDetailInfo);
                // var nodes = treeObj.getNodesByParam("parentId", -1, null);
                // for (var i=nodes.length-1; i>=0; i--){
                //     treeObj.expandNode(nodes[i], true, false, true, true);
                // }
            }
        });
    }

    //第一次加载部门树
    function updateFirstOrgInfo(data) {
        for (let i = 0, len = data.length; i < len; i++) {
            nodes = treeObj.getNodeByParam("orgId", data[i].orgId, null);
            //nodes.displayName = data[i].orgName + " " +  data[i].orgCount + "/" + data[i].totalCount;
            nodes.displayName = data[i].orgName; //暂无统计人数
            let parent = nodes.getParentNode();
            if (!parent || parent.open == true) {
                treeObj.updateNode(nodes);
            }
            if (data[i].children) {
                setTimeout((function (data) {
                    return function () {
                        updateFirstOrgInfo(data)
                    }
                }(data[i].childs)), 100);
            }
        }
    }

    // 部门信息变化时响应函数
    function onUpdateOrgDetailInfo(event) {
        let nodes;
        treeObj = $.fn.zTree.getZTreeObj("poll-tree");
        switch (event.type) {
            case events.ORG_FIRSTLOAD:
                updateFirstOrgInfo(event.data.data)
                break;
            case events.ORG_UPDATED:
                {
                    switch (event.data.type) {
                        case 'change':
                            setTimeout((function (data) {
                                return function () {
                                    nodes = treeObj.getNodeByParam("orgId", data.orgId, null);
                                    //nodes.displayName = data.orgName + " " +  data.orgCount + "/" + data.totalCount;
                                    nodes.displayName = data.orgName; //暂无统计部门树统计人数
                                    let parent = nodes.getParentNode();

                                    try {
                                        if (!parent) {
                                            treeObj.expandNode(nodes, true, false, true, true);
                                        }
                                    } catch (e) {

                                    }

                                    if (!parent || parent.open == true) {
                                        treeObj.updateNode(nodes);
                                    }

                                }
                            }(event.data.data)), 10);
                            break;
                        case 'delete':
                            nodes = treeObj.getNodeByParam("orgId", event.data.data.orgId, null);
                            treeObj.removeNode(nodes);
                            break;
                        case 'add':
                            nodes = null;
                            //if (event.data.data.parentId != -1) {
                            //这个地方上是有bug的，需要后台配合放回他的父部门orgid,以此查找部门树，插入节点，现在后台没时间。。。
                            //现在改成从path字段拿到父部门节点
                            let arr = event.data.data.path.split('/');
                            let orgCode = arr[arr.length - 3];
                            // nodes = treeObj.getNodeByParam("orgCode", orgCode, null);
                            nodes = treeObj.getNodesByFilter(function (node) {
                                return (node.orgCode == orgCode || node.orgId == orgCode);
                            });
                            event.data.data.isParent = true;
                            event.data.data.displayName = event.data.data.orgName;
                            event.data.data.icon = "/static/image/theme/sszhxt/deviceTree/org.png";
                            //}
                            if (nodes.length == 0) {
                                treeObj.addNodes(null, -1, event.data.data);
                            } else {
                                treeObj.addNodes(nodes[0], -1, event.data.data);
                            }
                            break;
                    }
                }
                break;
        }
    }
    // 人员信息变更时响应函数
    function onPersonInfoChange(event) {
        let nodes;
        let activeNode;
        let parentNode;
        if (!~needUpdateIds[vm.owner].indexOf(event.data.orgId)) {
            return;
        }
        switch (event.type) {
            case events.PERSON_UPDATED:
                {
                    switch (event.data.type) {
                        case 'change':
                            treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                            nodes = treeObj.getNodesByParam("gbcode", event.data.data.gbcode, null);
                            nodes[0].online = event.data.data.online;
                            parentNode = nodes[0].getParentNode();
                            // nodes[0].highlight = false;
                            if (nodes[0].online === 1) { //1--在线 0--离线
                                nodes[0].chkDisabled = false;
                                parentNode.chkDisabled = false;
                                //当父级全选当前直属子级的在线设备时，新设备上线自动勾选；
                                let childNodes = treeObj.getNodesByFilter((node) => {
                                    return (node.level === nodes[0].level && node.online === 1)
                                }, false, parentNode);
                                let childCheckedNodes = treeObj.getNodesByParam("checked", true, parentNode);
                                if (parentNode.checked && childNodes && childCheckedNodes && (childNodes.length - 1 === childCheckedNodes.length)) {
                                    treeObj.checkNode(nodes[0], true, true, true);
                                    // nodes[0].checked = true;
                                }

                                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        nodes[0].icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        nodes[0].icon = '/static/image/sszhxt/platform_online.png';
                                    } else {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/dev-online.png';
                                    }
                                } else {
                                    //多通道
                                    if (event.data.data.mytype == 1) {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/fastDomeCameras-online.png';
                                    } else if (event.data.data.mytype == 2) {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/car-online.png';
                                    } else {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/drone-online.png';
                                    }

                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            let node = treeObj.getNodeByParam("gbcode", item.gbcode, nodes[0]);
                                            node.icon = '/static/image/sszhxt/channel.png'; //下线图标
                                            node.chkDisabled = false;
                                            node.displayName = item.name;
                                            treeObj.updateNode(node);
                                            //显示在线节点，防止被隐藏的节点上线后不显示
                                            treeObj.showNode(node);
                                        })
                                    }
                                }
                                //显示在线节点，防止被隐藏的节点上线后不显示
                                treeObj.showNode(nodes[0]);
                            } else {
                                //当人员信息变化时，对变化节点进行一些额外操作，比如removerUpdatemarkerArr(nodes[0].deviceId);
                                vm.extraProcessWhenPersonChange(nodes[0]);
                                // nodes[0].checked = false;
                                treeObj.checkNode(nodes[0], false, true, false);
                                nodes[0].chkDisabled = true; //.chkDisabled
                                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        nodes[0].icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        nodes[0].icon = '/static/image/sszhxt/platform_offline.png';
                                    } else {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/dev-offline.png';
                                    }
                                } else {
                                    if (event.data.data.mytype == 1) { //
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/fastDomeCameras-offline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/car-offline.png';
                                    } else {
                                        nodes[0].icon = '/static/image/theme/sszhxt/deviceTree/drone-offline.png';
                                    }
                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            let node = treeObj.getNodeByParam("gbcode", item.gbcode, nodes[0]);
                                            node.icon = '/static/image/sszhxt/channeloutline.png'; //下线图标
                                            node.displayName = item.name;
                                            treeObj.checkNode(node, false, true, false);
                                            node.chkDisabled = true;
                                            treeObj.updateNode(node);
                                        })
                                    }
                                }

                                //判断是否只看在线
                                if (vm.isJustOnline) {
                                    hideOrShowOffLineNodes(true, nodes[0]);
                                }
                                let childNodes = treeObj.getNodesByFilter((node) => {
                                    return (!node.isParent && node.online === 1)
                                }, false, parentNode);
                                if (!childNodes || !childNodes.length) {
                                    //如果直接子元素全都不在线，父级勾选框禁用
                                    // parentNode.checked = false;
                                    treeObj.checkNode(parentNode, false, true, false);
                                    parentNode.chkDisabled = true;
                                    treeObj.updateNode(parentNode)
                                }
                            }
                            //控制是显示人名设备还是人名警号
                            //nodes[0].displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                            //执法仪
                            if (!event.data.data.mytype) {
                                if (event.data.data.username != "") {
                                    nodes[0].displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                                } else {
                                    nodes[0].name = nodes[0].name ? nodes[0].name : '-';
                                    nodes[0].displayName = nodes[0].name;
                                }
                            } else {
                                nodes[0].displayName = event.data.data.name;
                            }

                            treeObj.updateNode(nodes[0]);
                            //更改父节点的勾选状态(当子元素都没勾选的时候取消勾选)
                            while (parentNode) {
                                let childCheckedNodes = treeObj.getNodesByParam("checked", true, parentNode);
                                if (!childCheckedNodes.length) {
                                    // parentNode.checked = false;
                                    treeObj.checkNode(parentNode, false, true, false);
                                    treeObj.updateNode(parentNode);
                                }
                                parentNode = parentNode.getParentNode();
                            }
                            break;
                        case 'delete':
                            treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                            //仅在找到要删除的节点时才执行删除操作（防止出现已经删除了再来删的情况）
                            activeNode = treeObj.getNodeByParam("gbcode", event.data.data.gbcode, null);
                            if (!activeNode) {
                                return;
                            }
                            // nodes = treeObj.getNodesByParam("gbcode", event.data.data.gbcode, null);
                            parentNode = activeNode.getParentNode();
                            treeObj.removeNode(activeNode);
                            let childNodes = treeObj.getNodesByFilter((node) => {
                                return (!node.isParent && node.online === 1)
                            }, false, parentNode);
                            if (!childNodes || !childNodes.length) {
                                //如果直接子元素全都不在线，父级勾选框禁用
                                // parentNode.checked = false;
                                treeObj.checkNode(parentNode, false, true, false);
                                parentNode.chkDisabled = true;
                                treeObj.updateNode(parentNode)
                            }
                            break;
                        case 'add':
                            treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                            //找到要增加节点的父节点
                            nodes = treeObj.getNodesByParam("orgId", event.data.orgId, null);
                            //仅在找不到要增加的节点时才执行增加操作（防止出现已经增加了再来增加的情况）
                            activeNode = treeObj.getNodeByParam("gbcode", event.data.data.gbcode, nodes[0]);
                            if (activeNode) {
                                return;
                            }
                            nodes[0].chkDisabled = false;
                            nodes[0].loaded = true;
                            event.data.data.isParent = false;
                            event.data.data.nocheck = false;
                            if (event.data.data.online === 1) {
                                event.data.data.chkDisabled = false;
                                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机

                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        event.data.data.icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        event.data.data.icon = '/static/image/sszhxt/platform_online.png';
                                    } else {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/dev-online.png';
                                    }
                                } else {
                                    //多通道
                                    if (event.data.data.mytype == 1) {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/fastDomeCameras-offline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/car-online.png';
                                    } else {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/drone-online.png';
                                    }
                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        event.data.data.isParent = true;
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            item.icon = '/static/image/sszhxt/channel.png'; //上线图标
                                            item.chkDisabled = false;
                                            item.displayName = item.name;
                                        })
                                        event.data.data.childs = event.data.data.channelSet;
                                    }
                                }

                            } else {
                                event.data.data.chkDisabled = true; //.chkDisabled
                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        event.data.data.icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        event.data.data.icon = '/static/image/sszhxt/platform_offline.png';
                                    } else {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/dev-offline.png';
                                    }
                                } else {
                                    if (event.data.data.mytype == 1) { //
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/fastDomeCameras-offline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/car-offline.png';
                                    } else {
                                        event.data.data.icon = '/static/image/theme/sszhxt/deviceTree/drone-offline.png';
                                    }
                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        event.data.data.isParent = true;
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            item.icon = '/static/image/sszhxt/channeloutline.png'; //下线图标
                                            item.chkDisabled = true;
                                            item.displayName = item.name;
                                        })
                                        event.data.data.childs = event.data.data.channelSet;
                                    }
                                }
                            }
                            //控制是显示人名设备还是人名警号
                            //event.data.data.displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                            //执法仪
                            if (!event.data.data.mytype) {
                                if (event.data.data.username != "") {
                                    event.data.data.displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                                } else {
                                    event.data.data.name = event.data.data.name ? event.data.data.name : '-';
                                    event.data.data.displayName = event.data.data.name;
                                }
                            } else {
                                event.data.data.displayName = event.data.data.name;
                            }
                            treeObj.addNodes(nodes[0], 0, event.data.data);
                            //判断显示的设备类型是什么
                            hideNodesByDevtype(vm.devType);
                            activeNode = treeObj.getNodeByParam("gbcode", event.data.data.gbcode, nodes[0]);
                            if (event.data.data.online === 1) {
                                if (nodes[0].chkDisabled) {
                                    nodes[0].chkDisabled = false;
                                    treeObj.updateNode(nodes[0])
                                }
                                //当父级全选当前直属子级的在线设备时，新增加的在线设备自动勾选
                                let childNodes = treeObj.getNodesByFilter((node) => {
                                    return (node.level === activeNode.level && node.online === 1)
                                }, false, nodes[0]);
                                let childCheckedNodes = treeObj.getNodesByParam("checked", true, nodes[0]);
                                if (nodes[0].checked && childNodes && childCheckedNodes && (childNodes.length - 1 === childCheckedNodes.length)) {
                                    treeObj.checkNode(activeNode, true, true, true);
                                    // activeNode.checked = true;
                                }
                            } else {
                                //判断是否只看在线
                                if (vm.isJustOnline) {
                                    hideOrShowOffLineNodes(true, activeNode);
                                }
                            }
                            break;
                    }
                }
                break;
        }
    }
    /**
     *搜索节点，input可输入警员姓名/警号，查询对应节点
     **/
    function searchNode() {
        if (vm.searchNodeList && vm.searchNodeList.length > 0) {
            updateNodes(false); //去掉之前的高亮的节点
        }

        let obj = vm.keyword;
        ajax({
            url: '/gmvcs/uom/device/dsj/dsjInfo',
            method: 'post',
            contentType: 'String',
            data: obj
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: languageSelect == "en" ? 'notification' : '通知',
                    message: languageSelect == "en" ? 'police or the department not exist' : '找不到相关警员或部门'
                });
                return;
            } else if (result.data.length <= 0) {
                notification.warn({
                    title: languageSelect == "en" ? 'notification' : '通知',
                    message: languageSelect == "en" ? 'police or the department not exist' : '找不到相关警员或部门'
                });
                return;
            } else {
                var parentobj = [];
                var parentobjfirst = result.data.map(function (value) {
                    return value.orgId;
                });
                for (var i = 0; i < parentobjfirst.length; i++) {
                    if (parentobj.indexOf(parentobjfirst[i])) {
                        parentobj.push(parentobjfirst[i]); //去重
                    }
                }
                var parents = [];
                avalon.each(parentobj, function (index, el) {
                    var parent = treeObj.getNodesByParam('orgId', el, null)[0];
                    while (parent) {
                        parents.push(parent);
                        parent = parent.getParentNode();
                    }
                    for (var i = parents.length - 1; i >= 0; i--) {
                        if (parents[i].open) {
                            // if (i == 0) {
                            let nodeList = treeObj.getNodesByFilter(function (node) {
                                if (vm.keyword == "" || vm.keyword == "请输入关键字后再搜索") {
                                    node = null;
                                    return node;
                                }
                                return new RegExp(vm.keyword).test(node.usercode) || new RegExp(vm.keyword).test(node.username) || new RegExp(vm.keyword).test(node.name) || new RegExp(vm.keyword).test(node.orgName) || new RegExp(vm.keyword).test(node.displayName);
                            }, false, parents[i]);
                            for (var j = 0; j < nodeList.length; j++) {
                                var node = nodeList[j];
                                if (node) {
                                    if (!~vm.searchNodeList.indexOf(node)) {
                                        vm.searchNodeList.push(node);
                                    }

                                    node.highlight = true;
                                    treeObj.updateNode(node);
                                }
                            }

                            // }
                        } else {
                            treeObj.expandNode(parents[i], true, false, true, true);
                        }
                    }
                    parents = [];
                })

            }
        })
    }
    // 保存当前搜索的警员信息与节点
    //var lastValue = "", nodeList = [];
    //搜索部门树
    // function searchNode() {
    //     updateNodes(false); //去掉之前的高亮的节点
    //     vm.searchNodeList = treeObj.getNodesByParamFuzzy('displayName', vm.keyword); //保存查找到的节点集合
    //     if (vm.searchNodeList.length == 0) {
    //         notification.warn({
    //             title: languageSelect == "en" ? 'notification':'通知',
    //             message: "找不到该警员"
    //         });
    //         return;
    //     }
    //     avalon.each(vm.searchNodeList, function (index, el) {
    //         let node = el;
    //         if (!node.isParent) {
    //             let parentNode = node.getParentNode();
    //             treeObj.expandNode(parentNode, true);
    //         } else {
    //             treeObj.expandNode(node, true);
    //         }
    //     })
    //     updateNodes(true);
    // }
    /**
     * 更新所有符合搜索条件的节点字体样式
     * */
    function updateNodes(highlight) {
        for (var i = 0, l = vm.searchNodeList.length; i < l; i++) {
            vm.searchNodeList[i].highlight = highlight;
            treeObj.updateNode(vm.searchNodeList[i]);
        }
    }

    function expandNodes(treeNode) {
        treeObj.expandNode(treeNode, true, false, false, true);
    }

    function getNodeByParam(key, value) {
        return treeObj.getNodeByParam(key, value, null);
    }

    function hideOrShowOffLineNodes(isHide, treeNodes) {
        if (!treeNodes) {
            treeNodes = treeObj.getNodesByFilter((node) => {
                return ((!node.isParent && node.online === 0) || (node.mytype !== 0 && node.online === 0));
            }, false, null);

        }
        if ($.type(treeNodes) !== "array") {
            treeNodes = [treeNodes];
        }
        if (isHide) {
            treeObj.hideNodes(treeNodes);
        } else {
            treeObj.showNodes(treeNodes);
        }
    }

    function hideNodesByDevtype(devType) {
        var treeNodes = null;
        treeNodes = treeObj.getNodesByParam("isHidden", true);
        treeObj.showNodes(treeNodes);
        if (vm.isJustOnline) {
            hideOrShowOffLineNodes(true);
        }
        if(devType.length == 1 && devType[0] == 'all') {
            return;
        } else {
            treeNodes = treeObj.getNodesByFilter((node) => {
                return devType.filter(item => {
                    return (node.mytype != undefined && node.mytype == item);
                }).join('');
            }, false, null);
            treeObj.hideNodes(treeNodes);
        }
    }

    return {
        init: init,
        searchNode: searchNode,
        onChecked: onChecked,
        updateNodes: updateNodes,
        expandNodes: expandNodes,
        hideOrShowOffLineNodes: hideOrShowOffLineNodes,
        hideNodesByDevtype: hideNodesByDevtype,
        getNodeByParam: getNodeByParam
    };
}());

function setHeight() {
    let reduceHeight;
    reduceHeight = vm.isJustParent ? 110 : 160
    $('.ztree-container').height($('.side-bar-main').outerHeight() - reduceHeight);
}