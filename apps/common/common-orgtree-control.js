/**
 * 部门树组件
 * @prop {TreeNode} tree 树数据
 * @prop {Boolean} changeTree 用于触发 树数据的改变
 * @prop {String}  selectedKey 默认选中并展开的节点的key（可不传，不传的时候默认选中根节点）
 * @prop {String} wrapId $(common-orgtree-control)这个元素的id(当页面有用到多个ms-tree-selecting为必传，因为要用用这个来进行唯一标识)
 * @event {Function} onChange 当选择树节点时触发， 参数(e,key,title)
 * @event {Function} getSelected  获取当前选中的树节点的相关数据， 参数(key,title)
 * @example
 * ```
 * demo
 * <ms-orgtree-control :widget="{tree:@orgData, selectedKey:@selectedKey, wrapId: 'common-orgtree-control-1', getSelected:@getSelected, onChange:@handleTreeChange}"></ms-orgtree-control>
 * 
 * ```
 */

import {
    createForm
} from 'ane';
import ajax from '/services/ajaxService';
import { versionSelection } from '/services/configService';
require('/apps/common/common-orgtree-control.less');
require('../common/common-tyywglpt.css');
require('/vendor/jquery/jquery.ztree.all.js');
import moment from 'moment';
import Sbzygl from '../common/common-sbzygl';
import * as menuServer from '../../services/menuService';

let zTree, orgtreeVm, Orgtree, sbzygl = null,
    showSwitchBtn = versionSelection === 'Yunnan'; // 云南版本显示部门的显示/隐藏按钮

const vm = avalon.component('ms-orgtree-control', {
    template: __inline('./common-orgtree-control.html'),
    defaults: {
        show: true, // 部门树的显示隐藏，默认显示
        showOrHideOrg: false, // 部门的隐藏和显示，默认不显示（因为某个部门会设置了隐藏或者显示，而在用户管理页面，隐藏的父级部门也是可以显示的）
        btnShow: false, // 控制部门树新增、编辑、删除按钮的显示，默认隐藏。true->显示；false->隐藏
        searchValue: '',
        selectedKey: '',
        selectedKeys: [],
        selectedTitle: '',
        tree: [],
        treeData: [],
        wrapId: "common-orgtree-control",
        expandedKeys: [],
        changeTree: false,
        isTriggerWhenChange: true, //是否在onChange时触发getSelected
        reinitTree: false, // 重新初始化树
        reinitTreeData: [], // 重新初始化树的数据
        initDefault: false, // 默认通过请求初始化树
        onChange: avalon.noop,
        getSelected: avalon.noop,
        getTopTreeData: avalon.noop,
        //changeTreeData:avalon.noop,//自己的部门树数据处理函数
        extraExpandHandle: avalon.noop, //展开树节点后的额外工作函数

        beforeExpand: function (treeId, treeNode) {
            if (treeNode.children && treeNode.children.length > 0) return; //表示节点加过数据，不重复添加
            this.extraExpandHandle(treeId, treeNode, this.selectedKey);
            // getOrgbyExpand(treeNode.orgId).then((ret)=>{
            //     if(ret.code == 0){
            //         $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, _this.changeTreeData(ret.data));
            //         return;
            //     }
            //
            // });
        },
        handleSelect: function (e, treeId, node, clickFlag) {
            this.selectedKeys = [node.key];
            this.onSelect(this.selectedKeys.toJSON(), {
                selected: clickFlag,
                selectedNodes: [{
                    key: node.key,
                    title: node.title
                }],
                node: node,
                event: e
            });
        },
        onSelect: function (selectedKeys, e) {
            this.selectedKey = e.node.key;
            this.selectedTitle = e.node.title;
            this.onChange(e, selectedKeys);
            if (this.isTriggerWhenChange) {
                this.getSelected(e.node.key, e.node.title, e.node, Orgtree.initTreeData);
            }
        },
        switchTreeStatus(treeNode) {
            let url = '/gmvcs/uap/org/switch';
            let data = {
                orgId: treeNode.key,
                switchStatus: treeNode.switchStatus === 'ON' ? 'OFF' : 'ON'
            };
            Ajax(url, 'post', data).then(result => {
                if (result.code !== 0) {
                    sbzygl.showTips('error', `${treeNode.switchStatus === 'ON' ? '隐藏' : '显示'}部门失败！`);
                    return;
                }
                let currrentNode = zTree.getNodesByParam('key', treeNode.key, null)[0];
                currrentNode.switchStatus = treeNode.switchStatus === 'ON' ? 'OFF' : 'ON';
                zTree.updateNode(currrentNode);
                if (currrentNode.switchStatus === 'ON') { // 展开节点
                    $(`#diyBtn_switch_${treeNode.tId}`).attr('title', '显示').removeClass('ztree-diy-switch-btn').addClass('ztree-diy-switch-slash-btn');
                    zTree.expandNode(currrentNode, true, false, true, true);
                } else { // 隐藏节点
                    $(`#diyBtn_switch_${treeNode.tId}`).attr('title', '隐藏').removeClass('ztree-diy-switch-slash-btn').addClass('ztree-diy-switch-btn');
                    zTree.removeChildNodes(currrentNode);
                }
                sbzygl.showTips('success', `${currrentNode.switchStatus === 'ON' ? '显示' : '隐藏'}部门成功！`);
            });
        },
        handleOrgClick(type, treeNode) {
            // 每次通过getNodesByParam来获取新节点而不是用treeNode
            let nodes = zTree.getNodesByParam('key', treeNode.key, null);
            let currrentNode = nodes.length > 0 && nodes[0] || treeNode;
            orgtreeControlDialog.type = type;
            orgtreeControlDialog.treeNode = currrentNode;
            orgtreeControlDialog.isAdd = false;
            orgtreeControlDialog.isEdit = false;
            orgtreeControlDialog.isDelete = false;
            //每次都请求 获取业务类别
            sbzygl = new Sbzygl(orgtreeControlDialog);
            let url = '/gmvcs/uap/bstype/findBsTypeAll';
            Ajax(url).then(result => {
                if (result.code !== 0) {
                    sbzygl.showTips('error', '业务类别获取失败！');
                    return;
                }
                orgtreeControlDialog.ywlb_arr = result.data;
            }).fail((err) => {
            });
            switch (type) {
                case 'switch':
                    this.switchTreeStatus(currrentNode);
                    return;
                case 'add':
                    orgtreeControlDialog.isAdd = true;
                    orgtreeControlDialog.titleName = '新增部门';
                    orgtreeControlDialog.ywlbCheck = [];
                    break;
                case 'edit':
                    orgtreeControlDialog.isEdit = true;
                    orgtreeControlDialog.titleName = '编辑部门';
                    orgtreeControlDialog.inputJson = {
                        "orgName": currrentNode.title,
                        "orgCode": currrentNode.code,
                        "orderNo": currrentNode.orderNo || 0
                    };
                    orgtreeVm.findBsTypeByOrgId(currrentNode.key);//初始化 业务类别
                    break;
                case 'delete':
                    orgtreeControlDialog.isDelete = true;
                    orgtreeControlDialog.titleName = '删除部门';
                    break;
            }
            zTree.expandNode(nodes[0], true, false, true, true); // 展开节点
            orgtreeControlDialog.dialogShow = true;
        },
        // gmvcs/uap/bstype/findBsTypeByOrgId
        findBsTypeByOrgId(orgId) {
            let url = '/gmvcs/uap/bstype/findBsTypeByOrgId?orgId=' + orgId;
            Ajax(url, 'get', {}).then(result => {
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    return;
                }
                let code_arr = [];
                if (result.data) {
                    result.data.forEach(function (item) {
                        code_arr.push(item.code);
                    });
                    orgtreeControlDialog.ywlbCheck = code_arr;
                }
            });
        },

        authority: { //功能权限控制
            "CREATE_BM": false, //新增部门
            "DELETE_BM": false, //删除部门
            "EDIT_BM": false, //编辑部门
        },

        onInit: function (event) {
            orgtreeVm = this;
            this.$watch('treeData', (v) => {
                this.selectedKey = this.selectedKey ? this.selectedKey : v[0].key;
                // this.initSelect(this.selectedKey);
            });
            // this.$watch('selectedKey', (v) => {
            //     this.initSelect(v);
            // });
            this.$watch('changeTree', (v) => {
                this.treeData = this.tree;
            });
            this.$watch('reinitTree', (v) => {
                if (v) {
                    this.initTreeByData(this.reinitTreeData);
                }
            });
            this.$watch('initDefault', v => {
                v && this.initDefaultFn();
            });

            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_YHGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_YHGL_CREATE_BM": //新增部门
                            orgtreeVm.authority.CREATE_BM = true;
                            break;

                        case "CAS_FUNC_YHGL_DELETE_BM": //删除部门
                            orgtreeVm.authority.DELETE_BM = true;
                            break;
                        case "CAS_FUNC_YHGL_EDIT_BM": //编辑部门
                            orgtreeVm.authority.EDIT_BM = true;
                            break;
                    }
                });
            });
        },
        initDefaultFn() {
            Orgtree.init(true);
        },
        initTreeByData(data) {
            Orgtree.initTreeByData(data);
        },
        initSelect(selectedKey) {
            this.resetZtree();
            if (zTree) {
                let node = zTree.getNodeByParam("key", selectedKey, null);
                if (node) {
                    zTree.selectNode(node);
                    this.selectedTitle = node.title;
                    this.getSelected(node.key, node.title, node);
                } else {
                    zTree.cancelSelectedNode();
                }
            }
        },
        resetZtree() {
            //一个页面可能有多个树选择组件，所以要进行变量的重置以指向当前的树（如果把下列三个变量换为组件的属性，ie8下搜索的时候会报错）
            // $ztree = $('#' + this.wrapId + ' .ztree');
            // treeId = $ztree.attr('id');
            // zTree = $.fn.zTree.getZTreeObj(treeId);
        },
        // 获取顶级部门数组，多个管理范围时有多个顶级部门
        getInitTreeData(data) {
            this.getTopTreeData(data);
        },
        getZTreeObj(ztreeObj) {
            zTree = ztreeObj;
        },
        onReady: function (event) {
            let timer = setInterval(() => {
                if (this.tree.length > 0) {
                    this.treeData = this.tree;
                    clearInterval(timer);
                }
            }, 100);
            Orgtree = new OrgtreeModel(this, 'common-orgtree', setting);
            Orgtree.init();
        },
        onDispose: function (event) {

        }
    }
});

// 部门弹窗
const orgtreeControlDialog = avalon.define({
    $id: 'orgtree-control-dialog',
    dialogShow: false,
    isAdd: false,
    isEdit: false,
    isDelete: false,
    titleName: '新增部门',
    $form: createForm(),
    type: '',
    treeNode: {},
    inputJson: {
        "orgName": "",
        "orgCode": "",
        "orderNo": "",
    },
    validJson: {
        "orgName": true,
        "orgCode": true,
        "orderNo": true,
    },
    showJson: {
        "orgName": false,
        "orgCode": false,
        "orderNo": false,
    },
    urlParams: {
        'add': '/gmvcs/uap/org/save',
        'edit': '/gmvcs/uap/org/edit',
        'delete': '/gmvcs/uap/org/batch/delete'
    },
    ywlb_arr: [],
    ywlbCheck: [],
    handleDeviceCheck(e) {
        
    },
    orgNameReg: /^\S+/,
    orgCodeReg: /^[a-zA-Z0-9]{8,}$/,
    orderNoReg: /0|^[1-9]\d{0,3}$/,
    clear: false,
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleCancel(e) {
        this.clear = !this.clear;
        this.dialogShow = false;
    },
    handleOk(e) {
        let url = '';
        let pass = true;
        url = this.urlParams[this.type];
        let inputJson = sbzygl.trimData(this.inputJson);
        let param = {
            "orgName": inputJson.orgName,
            "orgCode": inputJson.orgCode,
            "orderNo": Number(inputJson.orderNo)
        };
        avalon.each(this.validJson, (key, value) => {
            if (!param[key] || !value) {
                this.validJson[key] = false;
                pass = false;
            }
        });
        if (this.type !== 'delete' && !pass) {
            return;
        }
        if (this.type == 'delete') { // 删除
            param = [this.treeNode.key];
        } else if (this.type == 'add') { // 新增
            param.parent = {
                orgCode: this.treeNode.orgCode,
                path: this.treeNode.path,
                orgId: this.treeNode.key
            };
            //新增部门 添加业务类别===============数据处理开始===============
            let bsTypesSelected = [];
            let r = orgtreeControlDialog.ywlb_arr;
            let c = orgtreeControlDialog.ywlbCheck;
            for (let i = 0; i < r.length; i++) {
                c.forEach(function (record) {
                    if (r[i].code == record) {
                        let bsTypesSelectedObj = new Object();
                        bsTypesSelectedObj.code = r[i].code;
                        bsTypesSelectedObj.name = r[i].name;
                        bsTypesSelected.push(bsTypesSelectedObj);
                    }
                });
            }
            param.bsTypes = bsTypesSelected;
            //新增部门 添加业务类别===============数据处理结束===============
        } else { // 编辑
            param.path = this.treeNode.path,
                param.orgId = this.treeNode.key,
                param.updateTime = moment().format("x"); //当前编辑的时间
            //编辑部门 添加业务类别===============数据处理开始===============
            let bsTypesSelected = [];
            let r = orgtreeControlDialog.ywlb_arr;
            let c = orgtreeControlDialog.ywlbCheck;
            for (let i = 0; i < r.length; i++) {
                c.forEach(function (record) {
                    if (r[i].code == record) {
                        let bsTypesSelectedObj = new Object();
                        bsTypesSelectedObj.code = r[i].code;
                        bsTypesSelectedObj.name = r[i].name;
                        bsTypesSelected.push(bsTypesSelectedObj);
                    }
                });
            }
            param.bsTypes = bsTypesSelected;
            //编辑部门 添加业务类别===============数据处理结束===============
        }

        Ajax(url, 'post', param).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            this.clear = !this.clear;
            this.dialogShow = false;
            sbzygl.showTips('success', this.type == 'add' ? '新增部门成功' : this.type == 'edit' ? '编辑部门成功' : '删除部门成功');
            let treeNode = this.treeNode.$model;
            if (this.type == 'delete') { // 删除
                let parentNode = treeNode.getParentNode();
                zTree.removeNode(treeNode);
                parentNode.isParent = true;
                zTree.updateNode(parentNode);
                Orgtree.init();
            } else if (this.type == 'edit') { // 编辑
                let currrentNode = zTree.getNodesByParam('key', treeNode.key, null)[0];
                currrentNode.title = inputJson.orgName;
                currrentNode.name = inputJson.orgName.length > 16 ? (inputJson.orgName.substring(0, 16) + '...') : inputJson.orgName,
                    currrentNode.orderNo = Number(inputJson.orderNo);
                zTree.updateNode(currrentNode);
                Orgtree.init();
            } else { // 新增
                let formatData = handleRemoteTreeData([result.data]);
                let newNode = zTree.addNodes(treeNode, formatData);
                let parentNode = newNode[0].getParentNode();
                parentNode.children.push(newNode[0]); // 防止逐级加载部门树时重复加载新增的部门
                zTree.updateNode(newNode[0]);
                Orgtree.init();
            }

            this.treeNode = {};
        });
    }
});

orgtreeControlDialog.$watch('clear', (v) => {
    orgtreeControlDialog.inputJson = {
        "orgName": "",
        "orgCode": "",
        "orderNo": ""
    };
    orgtreeControlDialog.validJson = {
        "orgName": true,
        "orgCode": true,
        "orderNo": true
    };
    orgtreeControlDialog.showJson = {
        "orgName": false,
        "orgCode": false,
        "orderNo": false
    };
});

orgtreeControlDialog.$watch('onReady', (v) => {
    sbzygl = new Sbzygl(orgtreeControlDialog);
    let url = '/gmvcs/uap/bstype/findBsTypeAll';
    Ajax(url).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', '业务类别获取失败！');
            return;
        }
        orgtreeControlDialog.ywlb_arr = result.data;
    }).fail((err) => {
    });
});

let setting = {
    data: {
        keep: {
            parent: true
        },
        key: {
            children: "children",
            name: "name",
            title: "title"
        }
    },
    view: {
        fontCss: getFontCss,
        addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
        nameIsHTML: true,
        dblClickExpand: false,
        showLine: false
    },
    callback: {
        // beforeClick: beforeClick,
        // beforeCheck: beforeCheck,
        onClick: zTreeOnClick,
        beforeExpand: fetchOrgWhenExpand,
        // onExpand: fetchOrgWhenExpand,
        // onDblClick: onDblClick
    }
};

// 部门树加载类
class OrgtreeModel {
    constructor(vm, id, setting) {
        this.vm = vm;
        this.zTreeId = id;
        this.setting = setting;
        this.ztree = null;
        this.initTreeData = {};
    }
    init(selectedData) {
        this.fetchOrgData(this.vm.treeData, (data) => {
            $.fn.zTree.init($(`#${this.zTreeId}`), this.setting, data);
            this.ztree = this.getZTreeObj();
            let node = this.ztree.getNodeByParam('key', selectedData ? this.vm.selectedKey : data[0].key, null);
            this.ztree.selectNode(node);
            this.initTreeData = data;
            this.vm.getInitTreeData(data);
            this.expandNode(node);
        });
    }
    initTreeByData(data) {
        $.fn.zTree.init($(`#${this.zTreeId}`), this.setting, handleRemoteTreeData(data));
        this.ztree = this.getZTreeObj();
        let node = this.ztree.getNodeByParam('key', data[0].orgId, null);
        this.expandNode(node);
    }
    // 获取 zTree 对象
    getZTreeObj() {
        let ztree = $.fn.zTree.getZTreeObj(this.zTreeId);
        this.vm.getZTreeObj(ztree);
        return ztree;
    }
    // 展开节点
    expandNode(node) {
        this.ztree.expandNode(node, true, false, true, true);
    }
    //获取所属部门
    fetchOrgData(orgData, callback) {
        let url = '/gmvcs/uap/org/find/fakeroot/mgr';
        Ajax(url).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', '部门信息获取失败！');
                return;
            }
            let orgPaths = [];
            let remoteData = result.data;
            for(var i=0;i<remoteData.length;i++){
                orgPaths.push(remoteData[i].path);
            }
            if(orgtreeVm.wrapId === 'cjgzz-orgTree'){//采集工作站树
                ajax({
                    url: "/gmvcs/uom/device/workstation/online/stat",
                    method: "post",
                    data: orgPaths,
                }).then(result => {
                    for(var i=0;i<result.data.length;i++){
                        remoteData[i].orgName = remoteData[i].orgName + `(在线:${result.data[i].onlineNum}，总数:${result.data[i].all})`;
                    }
                    orgData = handleRemoteTreeData(remoteData);
                    avalon.isFunction(callback) && callback(orgData);
                });
            }else if(orgtreeVm.wrapId === 'ccfw-orgTree'){//存储服务器树
                ajax({
                    url: "/gmvcs/uom/storage/online/stat",
                    method: "post",
                    data: orgPaths,
                }).then(result => {
                    for(var i=0;i<result.data.length;i++){
                        remoteData[i].orgName = remoteData[i].orgName + `(在线:${result.data[i].onlineNum}，总数:${result.data[i].all})`;
                    }
                    orgData = handleRemoteTreeData(remoteData);
                    avalon.isFunction(callback) && callback(orgData);
                });
            }else{
                orgData = handleRemoteTreeData(remoteData);
                avalon.isFunction(callback) && callback(orgData);
            }
            // orgData = handleRemoteTreeData(result.data);
            // avalon.isFunction(callback) && callback(orgData);
        }).fail((err) => {
            // this.vm.loading = false;
            // this.vm.isNull = true;
        });
    }
}

/**
 * 发送ajax请求，默认为get请求
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 */
function Ajax(url, method, data) {
    return ajax({
        url: url,
        method: method || 'get',
        data: data,
        cache: false
    });
}

//逐级加载部门树
function fetchOrgWhenExpand(treeId, treeNode, selectedKey) {
    if ('OFF' === treeNode.switchStatus) return; // 表示节点是隐藏状态时，不展开
    if (treeNode.children && treeNode.children.length > 0) return; //表示节点加过数据，不重复添加
    // let url = '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType;
    let url = '/gmvcs/uap/org/findChildrenByOrgId';
    let data = {
        "orgId": treeNode.key,
        "page": 0,
        "pageSize": 999999
    };
    Ajax(url, 'post', data).then((result) => {
        let treeObj = $.fn.zTree.getZTreeObj(treeId);
        if (result.code == 0) {
            let orgPaths = [];
            let remoteData = result.data.currentElements;
            for(var i=0;i<remoteData.length;i++){
                orgPaths.push(remoteData[i].path);
            }
            if(orgtreeVm.wrapId === 'cjgzz-orgTree'){//采集工作站树
                ajax({
                    url: "/gmvcs/uom/device/workstation/online/stat",
                    method: "post",
                    data: orgPaths,
                }).then(result => {
                    for(var i=0;i<result.data.length;i++){
                        remoteData[i].orgName = remoteData[i].orgName + `(在线:${result.data[i].onlineNum}，总数:${result.data[i].all})`;
                    }
                    treeObj.addNodes(treeNode, handleRemoteTreeData(remoteData));
                });
            }else if(orgtreeVm.wrapId === 'ccfw-orgTree'){//存储服务器树
                ajax({
                    url: "/gmvcs/uom/storage/online/stat",
                    method: "post",
                    data: orgPaths,
                }).then(result => {
                    for(var i=0;i<result.data.length;i++){
                        remoteData[i].orgName = remoteData[i].orgName + `(在线:${result.data[i].onlineNum}，总数:${result.data[i].all})`;
                    }
                    treeObj.addNodes(treeNode, handleRemoteTreeData(remoteData));
                });
            }else{
                treeObj.addNodes(treeNode, handleRemoteTreeData(result.data.currentElements));
            }            
        }
        if (selectedKey != treeNode.key) {
            let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
            treeObj.selectNode(node);
        }
    });
}

/**
 * 处理远程部门树的数据
 * @param {array} remoteData  远程请求得到的数据
 */
function handleRemoteTreeData(remoteData) {
    if (!remoteData || !remoteData.length) {
        return;
    }
    let handledData = [];
    for(var i=0;i<remoteData.length;i++){
        if(!orgtreeVm.showOrHideOrg && remoteData[i].switchStatus == 'OFF') {

        } else {         
            let item = {
                key: remoteData[i].orgId,
                title: remoteData[i].orgName,
                name: remoteData[i].orgName.length > 16 ? (remoteData[i].orgName.substring(0, 16) + '...') : (remoteData[i].orgName),
                code: remoteData[i].orgCode,
                orgCode: remoteData[i].orgCode,
                path: remoteData[i].path,
                switchStatus: remoteData[i].switchStatus || 'ON', // 显示/隐藏
                orderNo: remoteData[i].orderNo,
                children: remoteData[i].childs || [],
                isParent: true,
                icon: "/static/image/theme/sszhxt/deviceTree/org.png"
            };
            handledData.push(item);
            handleRemoteTreeData(remoteData[i].childs);                
        }
    };   
    return handledData;
}

function zTreeOnClick(e, treeId, node, clickFlag) {
    orgtreeVm.handleSelect(e, treeId, node, clickFlag);
}

function addHoverDom(treeId, treeNode) {
    if (!orgtreeVm.btnShow) {
        return;
    }
    let aObj = $("#" + treeNode.tId + "_a");
    if ($("#diyBtn_space_" + treeNode.code).length > 0) return;
    let switchStr = (treeNode.level !== 0) ? `<span id='diyBtn_switch_${treeNode.tId}' title="${treeNode.switchStatus === 'ON' ? '隐藏' : '显示'}" class='ztree-diy-btn ${treeNode.switchStatus === 'ON' ? 'ztree-diy-switch-slash-btn' : 'ztree-diy-switch-btn'}'> </span>` : '';
    let addStr = orgtreeVm.authority.CREATE_BM ? `<span id='diyBtn_add_${treeNode.tId}' title="添加" class='ztree-diy-btn ztree-diy-add-btn'> </span>` : '';
    let editStr = orgtreeVm.authority.EDIT_BM ? `<span id='diyBtn_edit_${treeNode.tId}' title="编辑" class='ztree-diy-btn ztree-diy-edit-btn'> </span>` : '';
    let deleteStr = orgtreeVm.authority.DELETE_BM ? `<span id='diyBtn_delete_${treeNode.tId}' title="删除" class='ztree-diy-btn ztree-diy-delete-btn'> </span>` : '';
    let content = `<span id='diyBtn_space_${treeNode.code}' class="diy-btn-line">${switchStr}${addStr}${editStr}${deleteStr}</span>`;
    aObj.append(content);
    let btn = $("#diyBtn_space_" + treeNode.code);
    if (btn) {
        $(`#diyBtn_switch_${treeNode.tId}`).bind("click", function (e) {
            e.stopPropagation();
            orgtreeVm.handleOrgClick('switch', treeNode);
        });
        $(`#diyBtn_add_${treeNode.tId}`).bind("click", function (e) {
            e.stopPropagation();
            orgtreeVm.handleOrgClick('add', treeNode);
        });
        $(`#diyBtn_edit_${treeNode.tId}`).bind("click", function (e) {
            e.stopPropagation();
            orgtreeVm.handleOrgClick('edit', treeNode);
        });
        $(`#diyBtn_delete_${treeNode.tId}`).bind("click", function (e) {
            e.stopPropagation();
            orgtreeVm.handleOrgClick('delete', treeNode);
        });
    }
};

function removeHoverDom(treeId, treeNode) {
    $("#diyBtn_space_" + treeNode.code).children().unbind().remove();
    $("#diyBtn_space_" + treeNode.code).unbind().remove();
};

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