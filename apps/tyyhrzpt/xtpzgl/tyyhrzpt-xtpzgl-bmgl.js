import {
    notification
} from 'ane';
import ajax from '/services/ajaxService';
import * as menuServer from '/services/menuService';
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
let language_txt = require('../../../vendor/language').language;
require('./tyyhrzpt-xtpzgl-bmgl.less');
export const name = 'tyyhrzpt-xtpzgl-bmgl';
let bmglVm = null;

avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-bmgl.html'),
    defaults: {
        bmgl: language_txt.xtpzgl.bmgl,
        //查询条件 部门树
        bmgl_tree: avalon.define({
            $id: "bmgl_tree",
            bmgl_data: [],
            tree_key: "",
            tree_title: "",
            orgPath: "",
            orgCode: "",
            curTree: "",
            initCallBack(key) {
                // bmglVm.jobtypeGet(key, true);
            },
            getSelected(key, title, e) {
                this.tree_key = key;
                this.orgCode = e.orgCode;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                // bmglVm.jobtypeGet(e.node.key);
                this.orgPath = e.node.path;
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
                        bmglVm.getDepTree(result.data, deptemp_child);
                        treeObj.addNodes(treeNode, deptemp_child);
                    }
                    if (selectedKey != treeNode.key) {
                        let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                        treeObj.selectNode(node);
                    }
                });

            }
        }),

        //页码
        search_flag: false, //true 点击查询获取列表；false 翻页等非点击查询获取列表
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
            this.getTableData();
        },

        search_condition: {},
        tableLoading: false,
        tableData: [],
        checkedList: [],
        getCheckedList(list) {
            this.checkedList = list;
        },

        //查询按钮
        searchDebounce: null,
        searchBtn() {
            this.tableLoading = true;
            this.table_pagination.current = 1;
            this.search_flag = true;
            this.searchDebounce();
        },
        getTableData() {
            this.checkedList = [];
            this.tableLoading = true;
            let ajax_data = {
                "page": (this.table_pagination.current - 1),
                "pageSize": this.table_pagination.pageSize,
                "orgId": bmglVm.bmgl_tree.tree_key
            };

            if (!this.search_flag) {
                ajax_data = this.search_condition;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_condition = ajax_data;
            }

            ajax({
                url: '/gmvcs/uap/org/findChildrenByOrgId',
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
                // let temp_data = {
                //     "page": ajax_data.page,
                //     "pageSize": ajax_data.pageSize,
                //     "orgId": ajax_data.orgId
                // };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.tableData = [];
                    this.tableLoading = false;
                    this.table_pagination.total = 0;

                    // let local_storage = {};
                    // local_storage.ajax_data = temp_data;
                    // local_storage.tree_key = bmgl_vm.bmgl_tree.tree_key;
                    // local_storage.tree_title = bmgl_vm.bmgl_tree.tree_title;
                    // storage.setItem('tyyhrzpt-xtpzgl-bmgl', local_storage, 0.5);
                    return;
                }

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgId = item.orgId; //所属部门id
                    ret_data[index].path = item.path; //部门路径
                    ret_data[index].space = ""; //空title需要
                    ret_data[index].checked = false;
                    ret_data[index].orderNo = item.orderNo;

                    //显示
                    ret_data[index].orgName = item.orgName; //部门名称
                    ret_data[index].orgCode = item.orgCode; //部门编码
                    ret_data[index].switchStatus = item.switchStatus == "ON" ? "可见" : "隐藏"; //可见性
                    //业务类别
                    if (item.bsTypes && item.bsTypes.length > 0) {
                        let str = "";
                        for (let i = 0; i < item.bsTypes.length; i++) {
                            str += item.bsTypes[i].name;
                            if (i != item.bsTypes.length - 1) {
                                str += "、";
                            }
                        }
                        ret_data[index].businessType = str;
                    } else {
                        ret_data[index].businessType = "-";
                    }
                });

                this.tableData = ret_data;
                this.table_pagination.total = result.data.totalElements; //总条数
                this.tableLoading = false;

                // let local_storage = {};
                // local_storage.ajax_data = temp_data;
                // local_storage.tree_key = bmgl_vm.bmgl_tree.tree_key;
                // local_storage.tree_title = bmgl_vm.bmgl_tree.tree_title;
                // storage.setItem('tyyhrzpt-xtpzgl-bmgl', local_storage, 0.5);
            });

        },

        functionType: "",
        functionBtn(type) {
            if ((type == "edit" || type == "delete") && this.checkedList.length != 1) {
                return;
            }

            if ((type == "hide" || type == "show") && this.checkedList.length < 1) {
                return;
            }

            this.functionType = type;
            switch (type) {
                //新增子部门
                case "add":
                    this.add_edit_dialog_vm.editType = false;
                    this.add_edit_dialog_vm.orgName = "";
                    this.add_edit_dialog_vm.orgNum = "";
                    this.add_edit_dialog_vm.sort = "";
                    this.findBsTypeAll(() => {
                        this.add_edit_dialog_show = true;
                        this.add_edit_dialog_vm.title = "新增部门";
                    });
                    break;

                    //隐藏
                case "hide":
                    this.bmgl_dialog_vm.functionTxt = "隐藏";
                    this.bmgl_dialog_vm.title = "隐藏部门";
                    this.bmgl_dialog_show = true;
                    break;

                    //显示
                case "show":
                    this.bmgl_dialog_vm.functionTxt = "显示";
                    this.bmgl_dialog_vm.title = "显示部门";
                    this.bmgl_dialog_show = true;
                    break;

                    //编辑
                case "edit":
                    this.add_edit_dialog_vm.editType = true;
                    this.add_edit_dialog_vm.orgName = this.checkedList[0].orgName;
                    this.add_edit_dialog_vm.orgNum = this.checkedList[0].orgCode;
                    this.add_edit_dialog_vm.sort = this.checkedList[0].orderNo;
                    this.findBsTypeAll(() => {
                        ajax({
                            url: `/gmvcs/uap/bstype/findBsTypeByOrgId?orgId=${this.checkedList[0].orgId}`,
                            method: 'get',
                            data: {}
                        }).then(result => {
                            if (result.code != 0) {
                                notification.error({
                                    message: result.msg,
                                    title: '通知'
                                });
                                return;
                            }
                            if (result.data) {
                                let codeArr = [];
                                result.data.forEach(item => {
                                    codeArr.push(item.code);
                                });
                                this.add_edit_dialog_vm.businessTypeCheckedArr = codeArr;
                            }

                        });
                        this.add_edit_dialog_show = true;
                        this.add_edit_dialog_vm.title = "编辑部门";
                    });
                    break;

                    //删除
                case "delete":
                    this.bmgl_dialog_vm.functionTxt = "删除";
                    this.bmgl_dialog_vm.title = "删除部门";
                    this.bmgl_dialog_show = true;
                    break;
            }
        },

        bmgl_dialog_show: false,
        dialogCancel() {
            this.bmgl_dialog_show = false;
        },
        dialogOk() {
            let orgIds = [];
            this.checkedList.forEach(item => {
                orgIds.push(item.orgId);
            });
            switch (this.functionType) {
                //隐藏
                case "hide":
                    ajax({
                        url: '/gmvcs/uap/org/switch',
                        method: 'post',
                        data: {
                            orgIds: orgIds,
                            switchStatus: "OFF"
                        }
                    }).then(result => {
                        this.ajaxCallback(result);
                    });
                    break;

                    //显示
                case "show":
                    ajax({
                        url: '/gmvcs/uap/org/switch',
                        method: 'post',
                        data: {
                            orgIds: orgIds,
                            switchStatus: "ON"
                        }
                    }).then(result => {
                        this.ajaxCallback(result);
                    });
                    break;

                    //删除
                case "delete":
                    ajax({
                        url: '/gmvcs/uap/org/batch/delete',
                        method: 'post',
                        data: [this.checkedList[0].orgId]
                    }).then(result => {
                        this.ajaxCallback(result);
                    });
                    break;
            }
        },
        ajaxCallback(result) {
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: '通知'
                });
                return;
            }

            notification.success({
                message: result.msg,
                title: '通知'
            });

            if (this.functionType == "add") {
                this.searchBtn();
            } else {
                this.getTableData();
            }

            this.bmgl_dialog_show = false;
            this.add_edit_dialog_show = false;
        },

        bmgl_dialog_vm: avalon.define({
            $id: "bmgl_dialog",
            title: "删除部门",
            functionTxt: "",
        }),

        add_edit_dialog_show: false,
        addEditCancel() {
            this.add_edit_dialog_show = false;
        },
        addEditOk() {
            //部门名称不能为空
            if (!this.add_edit_dialog_vm.orgName) {
                this.add_edit_dialog_vm.orgNameFocus = true;
                this.add_edit_dialog_vm.orgNameError = true;
                return;
            }
            //建议部门编号大于8位的数字或字母组合
            if (this.add_edit_dialog_vm.orgNum.length < 8) {
                this.add_edit_dialog_vm.orgNumFocus = true;
                this.add_edit_dialog_vm.orgNumError = true;
                return;
            }
            //排序只能输入小于9999的正整数
            if (!(typeof Number(this.add_edit_dialog_vm.sort) == "number" && this.add_edit_dialog_vm.sort > 0 && this.add_edit_dialog_vm.sort <= 9999)) {
                this.add_edit_dialog_vm.sortFocus = true;
                this.add_edit_dialog_vm.sortError = true;
                return;
            }

            let bsTypes = [],
                arr = this.add_edit_dialog_vm.businessTypeArr;
            this.add_edit_dialog_vm.businessTypeCheckedArr.forEach(item => {
                for (let i = 0; i < arr.length; i++) {
                    if (item == arr[i].code) {
                        let obj = {
                            code: arr[i].code,
                            name: arr[i].name,
                        };
                        bsTypes.push(obj);
                        break;
                    }
                }
            });
            switch (this.functionType) {
                //新增
                case "add":
                    let addData = {
                        "orgName": this.add_edit_dialog_vm.orgName,
                        "orgCode": this.add_edit_dialog_vm.orgNum,
                        "orderNo": this.add_edit_dialog_vm.sort,
                        "parent": {
                            "orgCode": this.bmgl_tree.orgCode,
                            "path": this.bmgl_tree.orgPath,
                            "orgId": this.bmgl_tree.tree_key
                        },
                        "bsTypes": bsTypes
                    };
                    ajax({
                        url: '/gmvcs/uap/org/save',
                        method: 'post',
                        data: addData
                    }).then(result => {
                        this.ajaxCallback(result);
                    });
                    break;

                    //编辑
                case "edit":
                    let editData = {
                        "orgName": this.add_edit_dialog_vm.orgName,
                        "orgCode": this.add_edit_dialog_vm.orgNum,
                        "orderNo": this.add_edit_dialog_vm.sort,
                        "path": this.checkedList[0].path,
                        "orgId": this.checkedList[0].orgId,
                        "updateTime": moment().format("x"),
                        "bsTypes": bsTypes
                    }
                    ajax({
                        url: '/gmvcs/uap/org/edit',
                        method: 'post',
                        data: editData
                    }).then(result => {
                        this.ajaxCallback(result);
                    });
                    break;
            }
        },
        findBsTypeAll(thenFuc) {
            this.add_edit_dialog_vm.businessTypeArr = [];
            this.add_edit_dialog_vm.businessTypeCheckedArr = [];
            ajax({
                url: '/gmvcs/uap/bstype/findBsTypeAll',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                this.add_edit_dialog_vm.businessTypeArr = result.data;

                thenFuc();
            });
        },

        add_edit_dialog_vm: avalon.define({
            $id: "add_edit_dialog",
            title: "新增部门",
            bmgl: language_txt.xtpzgl.bmgl,
            editType: false,

            //部门名称
            orgName: "",
            orgNameError: false,
            orgNameFocus: false,
            orgNameClose: false,

            //部门编号
            orgNum: "",
            orgNumError: false,
            orgNumFocus: false,
            orgNumClose: false,

            //排序
            sort: "",
            sortError: false,
            sortFocus: false,
            sortClose: false,

            input_focus(type) {
                if (type == "orgNum" && this.editType) {
                    return;
                }
                this[`${type}Close`] = true;
                this[`${type}Focus`] = true;
                this[`${type}Error`] = false;
            },
            input_blur(type) {
                this[`${type}Focus`] = false;
                this[`${type}Close`] = false;
            },
            close_click(type) {
                this[`${type}`] = "";
                return false;
            },

            businessTypeArr: [],
            businessTypeCheckedArr: [],
            handleDeviceCheck() {

            },
        }),

        authority: { //功能权限控制
            "CREATE": false, //部门管理_新增子部门
            "EDIT": false, //部门管理_编辑部门
            "DELETE": false, //部门管理_删除
            "SEARCH": false, //部门管理_查询
            "YC": false, //部门管理_隐藏
            "XS": false, //部门管理_显示
        },

        onInit(e) {
            bmglVm = e.vmodel;

            let deptemp = [];
            ajax({
                // url: '/gmvcs/uap/org/all',
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                // url: '/gmvcs/uap/org/find/root',
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

                this.getDepTree(result.data, deptemp);
                bmglVm.bmgl_tree.bmgl_data = deptemp;
                bmglVm.bmgl_tree.orgPath = deptemp[0].path;
                bmglVm.bmgl_tree.tree_key = deptemp[0].key;
                bmglVm.bmgl_tree.tree_title = deptemp[0].title;
                bmglVm.bmgl_tree.orgCode = deptemp[0].orgCode;
            });

            menuServer.menu.then(menu => {

                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_BMYH_BMGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                let _this = this;
                if (0 == func_list.length) {
                    $('.tyyhrzpt-xtpzgl-bmgl .bmgl_table').css('top', '60px');
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_BMYH_BMGL_CREATE_BM": //部门管理_新增子部门
                            _this.authority.CREATE = true;
                            break;
                        case "CAS_FUNC_BMYH_BMGL_EDIT_BM": //部门管理_编辑部门
                            _this.authority.EDIT = true;
                            break;
                        case "CAS_FUNC_BMYH_BMGL_DELETE_BM": //部门管理_删除
                            _this.authority.DELETE = true;
                            break;
                        case "CAS_FUNC_BMYH_BMGL_SEARCH_BM": //部门管理_查询
                            _this.authority.SEARCH = true;
                            break;
                        case "CAS_FUNC_BMYH_BMGL_YC_BM": //部门管理_隐藏
                            _this.authority.YC = true;
                            break;
                        case "CAS_FUNC_BMYH_BMGL_XS_BM": //部门管理_显示
                            _this.authority.XS = true;
                            break;
                    }
                });

                // 设置绝对定位的top，防止空白
                if (false == this.authority.CREATE && false == this.authority.EDIT && false == this.authority.DELETE && false == this.authority.SEARCH && false == this.authority.YC && false == this.authority.XS) {
                    $('.tyyhrzpt-xtpzgl-bmgl .bmgl_table').css('top', '60px');
                }

                if (this.authority.SEARCH && func_list.length == 1) {
                    $('.tyyhrzpt-xtpzgl-bmgl .bmgl_table').css('top', '120px');
                }

                if (false == this.authority.SEARCH && (this.authority.EDIT || this.authority.DELETE || this.authority.CREATE || this.authority.YC || this.authority.XS)) {
                    $('.tyyhrzpt-xtpzgl-bmgl .bmgl_table').css('top', '110px');
                }
            });
        },
        onReady() {
            this.searchDebounce = this.debounce(this.getTableData, 800);
        },
        onDispose() {
            bmglVm = null;
        },

        //some function start

        //树数据转换函数
        getDepTree(treelet, dataTree) {
            if (!treelet) {
                return;
            }

            for (let i = 0, item; item = treelet[i]; i++) {
                dataTree[i] = new Object();

                dataTree[i].key = item.orgId; //---部门id
                dataTree[i].title = item.orgName; //---部门名称

                dataTree[i].orgCode = item.orgCode; //---部门code
                dataTree[i].checkType = item.checkType; //---部门code
                dataTree[i].path = item.path; //---部门路径，search的时候需要发

                dataTree[i].isParent = true;
                dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
                dataTree[i].children = new Array();

                // if (item.path == orgPath)
                //     orgKey = item.orgCode;

                this.getDepTree(item.childs, dataTree[i].children);
            }
        },

        //防抖
        debounce(fn, wait) {
            var timeout = null;
            return function () {
                if (timeout !== null) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(fn, wait);
            }
        },
    }
});