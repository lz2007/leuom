import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
export const name = "tyyhrzpt-xtpzgl-yhlb";
require("./tyyhrzpt-xtpzgl-yhlb.less");
import * as menuServer from '/services/menuService';
let storage = require('/services/storageService.js').ret;

let yhlb_vm;
let {
    dep_switch,
    isTableSearch
} = require('/services/configService');
avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-yhlb.html"),
    defaults: {
        key_dep_switch: dep_switch,
        opt_yhlb: avalon.define({
            $id: "opt_yhlb",
            authority: { // 按钮权限标识
                "SEARCH": false, //黑名单_用户列表_查询
                "UNLOCK": false, //黑名单_用户列表_解锁
            }
        }),

        yhlb_tree: avalon.define({
            $id: "yhlb_tree",
            yhlb_data: [],
            tree_key: "",
            tree_title: "",
            tree_path: "", //传path时需要用到
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.tree_path = e.node.path;
            },
            extraExpandHandle(treeId, treeNode, selectedKey) {
                let deptemp_child = [];
                ajax({
                    url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    let treeObj = $.fn.zTree.getZTreeObj(treeId);
                    if (result.code == 0) {
                        getDepTree(result.data, deptemp_child);
                        treeObj.addNodes(treeNode, deptemp_child);
                    }
                    if (selectedKey != treeNode.key) {
                        let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                        treeObj.selectNode(node);
                    }
                });

            }
        }),

        nameId: "",
        account: "",
        nameIdX: false,
        accountX: false,
        enter_search(e) {
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'nameId':
                    _this.nameId = "";
                    return false;
                    break;
                case 'account':
                    _this.account = "";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'nameId':
                    _this.nameIdX = true;
                    $(".xtpzgl_yhlb .dataFormBox .nameId").width($(".yhlb_input_panel").innerWidth() - 32);
                    break;
                case 'account':
                    _this.accountX = true;
                    $(".xtpzgl_yhlb .dataFormBox .account").width($(".yhlb_input_panel").innerWidth() - 32);
                    break;
                case 'loginPassword':
                    yhlb_dialog_vm.loginPasswordX = true;
                    yhlb_dialog_vm.loginPasswordNull = false;
                    $(".yhlb_dialog_common .loginPassword").width($(".yhlb_input_panel").innerWidth() - 32);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'nameId':
                    _this.nameIdX = false;
                    $(".xtpzgl_yhlb .dataFormBox .nameId").width($(".yhlb_input_panel").innerWidth() - 22);
                    break;
                case 'account':
                    _this.accountX = false;
                    $(".xtpzgl_yhlb .dataFormBox .account").width($(".yhlb_input_panel").innerWidth() - 22);
                    break;
                case 'loginPassword':
                    yhlb_dialog_vm.loginPasswordX = false;
                    $(".yhlb_dialog_common .loginPassword").width($(".yhlb_input_panel").innerWidth() - 22);
                    break;
            }
        },

        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            totalPages: 0
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },
        handlePageChange(page) {
            this.table_pagination.current = page;
            this.search_flag = false;
            this.getTableList();
        },

        searchBtn() {
            this.table_pagination.current = 1;
            this.search_flag = true;
            this.getTableList();
        },

        record_item: {},
        actions(type, text, record, index) {
            if (type == "check") {
                this.record_item = record;
                this.yhlb_dialog_show = true;
            }
        },
        search_condition: {},
        search_flag: false, //true 点击查询获取列表；false 翻页等非点击查询获取列表
        tableLoading: false,
        tableData: [],

        getTableList() {
            this.account = $.trim(this.account);
            this.nameId = $.trim(this.nameId);
            this.tableLoading = true;

            let ajax_data = {
                "page": (this.table_pagination.current - 1),
                "pageSize": this.table_pagination.pageSize,
                "orgId": yhlb_vm.yhlb_tree.tree_key
            };

            if (this.account) {
                ajax_data.account = this.account;
            }

            if (this.nameId) {
                ajax_data.nameOrUserCode = this.nameId;
            }

            if (!this.search_flag) {
                ajax_data = this.search_condition;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_condition = ajax_data;
            }

            ajax({
                // url: '/api/findUserByPage',
                url: '/gmvcs/uap/blacklist/findUserByPage',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                let temp_data = {
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgId": ajax_data.orgId
                };

                temp_data.nameOrUserCode = this.nameId || "";
                temp_data.account = this.account || "";

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.tableData = [];
                    this.tableLoading = false;
                    this.table_pagination.total = 0;

                    let local_storage = {};
                    local_storage.ajax_data = temp_data;
                    local_storage.tree_key = yhlb_vm.yhlb_tree.tree_key;
                    local_storage.tree_title = yhlb_vm.yhlb_tree.tree_title;
                    storage.setItem('tyyhrzpt-xtpzgl-yhlb', local_storage, 0.5);
                    return;
                }

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgId = item.orgId; //所属部门id
                    ret_data[index].orgPath = item.orgPath; //部门路径
                    ret_data[index].space = ""; //空title需要
                    ret_data[index].uid = item.uid; //用户uid--解锁时用到

                    //显示
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].account = item.account; //账号
                    ret_data[index].nameId = item.userName + "(" + item.userCode + ")"; //警员（警号）
                    
                    ret_data[index].orgCode = item.orgCode;
                });

                this.tableData = ret_data;
                this.table_pagination.total = result.data.totalElements; //总条数
                this.tableLoading = false;

                let local_storage = {};
                local_storage.ajax_data = temp_data;
                local_storage.tree_key = yhlb_vm.yhlb_tree.tree_key;
                local_storage.tree_title = yhlb_vm.yhlb_tree.tree_title;
                storage.setItem('tyyhrzpt-xtpzgl-yhlb', local_storage, 0.5);
            });
        },

        yhlb_dialog_show: false,
        dialogCancel() {
            this.yhlb_dialog_show = false;
            yhlb_dialog_vm.loginPassword = "";
            yhlb_dialog_vm.loginPasswordNull = false;
        },
        dialogOk() {
            if (yhlb_dialog_vm.loginPassword == "") {
                yhlb_dialog_vm.loginPasswordNull = true;
                return;
            }

            let unlock_data = {
                "password": yhlb_dialog_vm.loginPassword,
                "key": this.record_item.uid,
                "type": 0
            };
            ajax({
                url: '/gmvcs/uap/blacklist/unlock',
                method: 'post',
                data: unlock_data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }

                yhlb_dialog_vm.loginPassword = "";
                notification.success({
                    message: result.msg,
                    title: '通知'
                });

                this.searchBtn();
                this.yhlb_dialog_show = false;
            });
        },

        onInit(e) {
            yhlb_vm = e.vmodel;
        },
        onReady() {
            let getTreeInfo = new Promise((rs, rj) => {
                let deptemp = [];
                ajax({
                    // url: '/api/dep_tree',
                    url: '/gmvcs/uap/org/find/fakeroot/mgr',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: '获取部门树失败，请稍后再试',
                            title: '通知'
                        });
                        return;
                    }

                    getDepTree(result.data, deptemp);
                    yhlb_vm.yhlb_tree.yhlb_data = deptemp;
                    yhlb_vm.yhlb_tree.tree_key = deptemp[0].key;
                    yhlb_vm.yhlb_tree.tree_title = deptemp[0].title;

                    rs(deptemp);
                });
            });

            let item = storage.getItem("tyyhrzpt-xtpzgl-yhlb");
            if (item) {
                this.table_pagination.current = item.ajax_data.page + 1;
                this.account = item.ajax_data.account || "";
                this.nameId = item.ajax_data.nameOrUserCode || "";

                getTreeInfo.then(x => {
                    yhlb_vm.yhlb_tree.tree_key = item.tree_key;
                    yhlb_vm.yhlb_tree.tree_title = item.tree_title;
                    this.search_flag = true;
                    isTableSearch && this.getTableList();
                });
            } else {
                getTreeInfo.then(x => {
                    isTableSearch && this.searchBtn();
                });
            }

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_HMD_YHLB/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_HMD_YHLB_SEARCH":
                            _this.opt_yhlb.authority.SEARCH = true;
                            break;
                        case "CAS_FUNC_HMD_YHLB_JS":
                            _this.opt_yhlb.authority.UNLOCK = true;
                            break;
                    }
                });
            });
        },
        onDispose() {
            this.account = "";
            this.nameId = "";
        },
    }
});

function getDepTree(treelet, dataTree) {
    if (!treelet) {
        return;
    }

    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();

        dataTree[i].key = item.orgId; //---部门id
        dataTree[i].title = item.orgName; //---部门名称

        dataTree[i].orgCode = item.orgCode; //---部门code
        dataTree[i].checkType = item.checkType; //---部门checkType
        dataTree[i].path = item.path; //---部门路径，search的时候需要发

        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}

let yhlb_dialog_vm = avalon.define({
    $id: "yhlb_dialog",
    title: "解锁",
    loginPassword: "",
    loginPasswordX: false,
    loginPasswordNull: false,
    input_focus(e) {
        yhlb_vm.input_focus(e);
    },
    input_blur(e) {
        yhlb_vm.input_blur(e);
    },
    close_click(e) {
        this.loginPassword = "";
        return false;
    },
    enter_search(e) {
        if (e.keyCode == "13") {
            yhlb_vm.dialogOk();
        }
    }
});