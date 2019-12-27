import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
export const name = "tyyhrzpt-xtpzgl-sjzd";
import * as menuServer from '/services/menuService';
require("./tyyhrzpt-xtpzgl-sjzd.css");
import {
    isTableSearch
} from '/services/configService';
var storage = require('/services/storageService.js').ret;

let deptemp = [],
    neet_init,
    sjzd_vm,
    tableObject_sjzd = {},
    local_storage = {
        "timeStamp": "",
        "table_list": [],
        "curPage": "",
        "list_total": "",
        "list_totalPages": "",
        "treeData": "",
        "selectedKeys": "",
        "expandedKeys": ""
    };
avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-sjzd.html"),
    defaults: {
        selected_arr: [],
        selected_item: {},
        expandedKeys_arr: [],
        dicTypeCode: "",
        sjzd_table_data: [],
        loading: false,
        curPage: 1,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            totalPages: 0
        },
        dialog_show: false,
        ywlb_dialog_show: false,//业务类别弹窗
        dialogHeight: "",
        click_node: true,
        edit_disabled: false,

        sjzd_menu: avalon.define({
            $id: "sjzd_menu",
            sjzd_data: [],
            expandedKeys: [],
            onSelectFuc(item, e) {
                if (e.node.title == '业务类别') {
                    sjzd_table.parentShow = false;//隐藏父字段名称、父字段值
                    sjzd_table.heardShow = false;//隐藏一般表格头
                    sjzd_table.ywlbShow = true;//显示业务类别表格
                    sjzd_vm.selected_arr = [];
                    sjzd_vm.click_node = true;
                    sjzd_vm.dicTypeCode = item[0];

                    sjzd_vm.curPage = 1;
                    sjzd_vm.table_pagination.current = 1;
                    tableObject_sjzd.page(sjzd_vm.curPage, sjzd_vm.table_pagination.pageSize);
                    sjzd_vm.getDicCodeList();
                } else if (e.node.level == "1") {
                    sjzd_table.heardShow = true;//显示一般表格头
                    sjzd_table.ywlbShow = false;//隐藏业务类别表格
                    sjzd_table.parentShow = false;//隐藏父字段名称、父字段值
                    sjzd_vm.selected_arr = [];
                    sjzd_vm.click_node = true;
                    sjzd_vm.dicTypeCode = item[0];

                    sjzd_vm.curPage = 1;
                    sjzd_vm.table_pagination.current = 1;
                    tableObject_sjzd.page(sjzd_vm.curPage, sjzd_vm.table_pagination.pageSize);
                    sjzd_vm.getDicCodeList();
                } else if (e.node.level == "2") {//媒体标注类型子字典需求修改
                    sjzd_table.parentShow = true;
                    sjzd_table.heardShow = false;
                    sjzd_table.ywlbShow = false;//隐藏业务类别表格
                    sjzd_vm.selected_arr = [];
                    sjzd_vm.click_node = true;
                    sjzd_vm.dicTypeCode = item[0];

                    sjzd_vm.curPage = 1;
                    sjzd_vm.table_pagination.current = 1;
                    tableObject_sjzd.page(sjzd_vm.curPage, sjzd_vm.table_pagination.pageSize);
                    sjzd_vm.getDicCodeList();
                } else {
                    sjzd_table.heardShow = true;
                    sjzd_table.parentShow = false;
                    sjzd_table.ywlbShow = false;//隐藏业务类别表格
                    sjzd_vm.click_node = false;
                }
            }
        }),

        opt_sjzd: avalon.define({
            $id: "opt_sjzd",
            authority: { // 按钮权限标识
                "CREATE": false, //数据字典_新增
                "EDIT": false, //数据字典_编辑
            }
        }),
        updateMediaTree() {
            let tree_id = $(".ztree").attr("id");
            let treeObj = $.fn.zTree.getZTreeObj(tree_id);
            let glmtNode = treeObj.getNodeByParam("title", '媒体标注类型', null);
            let code = glmtNode.key;
            ajax({
                //不分页 查询媒体标注类型（http://192.168.55.83:6211/gmvcs/uap/dic/findByDicTypeCode?dicTypeCode=100）
                url: '/gmvcs/uap/dic/findByDicTypeCode?dicTypeCode=' + code,
                // url: '/gmvcs/uap/dic/findByDicTypeCode/' + code + '?page=' + (sjzd_vm.curPage - 1) + '&pageSize=' + sjzd_vm.table_pagination.pageSize,
                method: 'get',
                data: {}
            }).then(result => {
                treeObj.removeChildNodes(glmtNode);//清除 媒体关联 节点数据
                avalon.each(result.data, function (index, item) {
                    treeObj.addNodes(glmtNode, { isParent: false, title: item.name, key: item.code, value: item.value });
                });
                treeObj.updateNode(glmtNode);
                deptemp = treeObj.getNodes();
                sjzd_vm.sjzd_menu.sjzd_data = JSON.parse(JSON.stringify(deptemp));
                sjzd_vm.expandedKeys_arr.push(code);
                // 选中节点
                let selectedNode = treeObj.getNodeByParam("key", sjzd_vm.dicTypeCode, null);
                treeObj.selectNode(selectedNode);
                isTableSearch && sjzd_vm.getDicCodeList();
            });
        },
        onInit(e) {
            sjzd_vm = e.vmodel;

            tableObject_sjzd = $.tableIndex({ //初始化表格jq插件
                id: 'sjzd_table',
                tableBody: tableBody_zfyps
            });

            // sjzd_vm.sjzd_menu.expandedKeys = [];
            let init_data = storage.getItem("tyyhrzpt-xtpzgl-sjzd");
            neet_init = true; //判断是否需要初始化页面；true为重新从后台拿数据初始化，false为从Local Storage拿数据填充。
            if (init_data) {
                if ((getTimestamp() - init_data.timeStamp) > 1800) //1800 = 30 * 60
                    neet_init = true;
                else {
                    neet_init = false;

                    sjzd_vm.sjzd_menu.sjzd_data = init_data.treeData;
                    deptemp = init_data.treeData;
                    sjzd_vm.sjzd_menu.expandedKeys = init_data.expandedKeys;
                    sjzd_vm.expandedKeys_arr = init_data.expandedKeys;
                    this.dicTypeCode = init_data.selectedKeys;

                    this.curPage = init_data.curPage;
                    tableObject_sjzd.page(this.curPage, this.table_pagination.pageSize);
                    // this.sjzd_table_data = init_data.table_list;
                    // tableObject_sjzd.tableDataFnc(this.sjzd_table_data);
                    tableObject_sjzd.loading(true);
                    this.table_pagination.current = init_data.curPage;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.totalPages = init_data.list_totalPages;
                }
            }
            if (neet_init) {
                ajax({
                    // url: '/api/dic_tree',
                    url: '/gmvcs/uap/app/dic/tree',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: '获取字典树失败，请稍后再试',
                            title: '通知'
                        });
                        return;
                    }

                    getDicTree(result.data, deptemp);

                    sjzd_vm.sjzd_menu.sjzd_data = deptemp;
                    sjzd_vm.sjzd_menu.expandedKeys = sjzd_vm.expandedKeys_arr;
                    this.dicTypeCode = deptemp[0].children[0].key;

                    let tree_id = $(".ztree").attr("id");
                    let treeObj = $.fn.zTree.getZTreeObj(tree_id);
                    let nodes = treeObj.getNodes();
                    if (nodes.length > 0) {
                        treeObj.selectNode(nodes[0].children[0]);
                    }

                    this.curPage = 1;
                    tableObject_sjzd.page(this.curPage, this.table_pagination.pageSize);
                    this.table_pagination.current = 1;
                    // this.getDicCodeList();
                }).then(result => {
                    sjzd_vm.updateMediaTree();
                    // sjzd_vm.getDicCodeList();
                });
            } 

        },
        onReady() {
            // $(".sidebar_tree").height($(window).height() - 68);
            if (neet_init == false) {
                this.sjzd_table_data = storage.getItem("tyyhrzpt-xtpzgl-sjzd").table_list;
                tableObject_sjzd.tableDataFnc(this.sjzd_table_data);
                tableObject_sjzd.loading(false);

                let treeObj = $.fn.zTree.getZTreeObj($(".ztree").attr("id"));
                let nodes = treeObj.getNodes();
                let selectKey = storage.getItem("tyyhrzpt-xtpzgl-sjzd").selectedKeys;
                let find_flag = false;
                if (nodes.length > 0) {
                    for (let i = 0; i < nodes.length; i++) {
                        if (find_flag)
                            break;
                        for (let j = 0; j < nodes[i].children.length; j++) {
                            if (selectKey == nodes[i].children[j].key) {
                                treeObj.selectNode(nodes[i].children[j]);
                                find_flag = true;
                                break;
                            }
                        }
                    }
                }
            }

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_SJZD/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_SJZD_CREATE":
                            _this.opt_sjzd.authority.CREATE = true;
                            break;
                        case "CAS_FUNC_SJZD_EDIT":
                            _this.opt_sjzd.authority.EDIT = true;
                            break;
                    }
                });
            });
        },
        onDispose() {
            sjzd_vm.sjzd_menu.expandedKeys = [];
        },
        addBtn() {
            if (this.selected_arr.length != "0" || sjzd_vm.click_node == false) {
                return;
            }
            let tree_id = $(".ztree").attr("id");
            let treeObj = $.fn.zTree.getZTreeObj(tree_id);
            let selectedNodeObj = treeObj.getSelectedNodes();

            if (selectedNodeObj.length > 0 && selectedNodeObj[0].title == '业务类别') {
                sjzd_ywlb_dialog_in.fatherShow = false;

                sjzd_ywlb_dialog_in.title = "新增业务类别";
                sjzd_ywlb_dialog_in.add_flag = true;

                sjzd_ywlb_dialog_in.dic_code = "";
                sjzd_ywlb_dialog_in.dic_name = "";
                sjzd_ywlb_dialog_in.dic_value = "";
                sjzd_ywlb_dialog_in.dic_txt = "";
                sjzd_ywlb_dialog_in.dic_num = "";
                sjzd_ywlb_dialog_in.bzlxCheck = [];
                sjzd_ywlb_dialog_in.gwmcCheck = [];
                sjzd_ywlb_dialog_in.rylbCheck = [];
                sjzd_vm.dialogHeight = "620";
                sjzd_ywlb_dialog_in.initCheckboxData();
                sjzd_vm.ywlb_dialog_show = true;
            } else if (selectedNodeObj.length > 0 && selectedNodeObj[0].level == 2) {
                sjzd_dialog_in.fatherShow = true;//显示默认的父类型
                sjzd_dialog_in.dic_name_father = selectedNodeObj[0].title;
                sjzd_dialog_in.dic_value_father = selectedNodeObj[0].value;

                sjzd_dialog_in.title = "新增子字典";
                sjzd_dialog_in.add_flag = true;
                sjzd_dialog_in.dic_code = "";
                sjzd_dialog_in.dic_name = "";
                sjzd_dialog_in.dic_value = "";
                sjzd_dialog_in.dic_txt = "";
                sjzd_dialog_in.dic_num = "";

                sjzd_vm.dialogHeight = "466";
                this.dialog_show = true;
            } else if (selectedNodeObj.length > 0 && selectedNodeObj[0].level == 1) {
                sjzd_dialog_in.fatherShow = false;

                sjzd_dialog_in.title = "新增字典";
                sjzd_dialog_in.add_flag = true;

                sjzd_dialog_in.dic_code = "";
                sjzd_dialog_in.dic_name = "";
                sjzd_dialog_in.dic_value = "";
                sjzd_dialog_in.dic_txt = "";
                sjzd_dialog_in.dic_num = "";

                sjzd_vm.dialogHeight = "358";
                this.dialog_show = true;
            }
            // sjzd_dialog_in.title = "新增";
            // sjzd_dialog_in.add_flag = true;

            // sjzd_dialog_in.dic_code = "";
            // sjzd_dialog_in.dic_name = "";
            // sjzd_dialog_in.dic_value = "";
            // sjzd_dialog_in.dic_txt = "";
            // sjzd_dialog_in.dic_num = "";

            // sjzd_vm.dialogHeight = "361";
            // this.dialog_show = true;
        },
        editBtn(selected_item) {
            // if (this.selected_arr.length != "1" || !this.edit_disabled) {
            //     return;
            // }
            if (sjzd_table.ywlbShow) {
                sjzd_ywlb_dialog_in.title = "编辑";
                sjzd_ywlb_dialog_in.add_flag = false;

                sjzd_ywlb_dialog_in.dic_code = selected_item.code;
                sjzd_ywlb_dialog_in.dic_name = selected_item.name;
                sjzd_ywlb_dialog_in.dic_value = selected_item.value || "";
                sjzd_ywlb_dialog_in.dic_txt = selected_item.desc || "";
                if (selected_item.order == "0")
                    sjzd_ywlb_dialog_in.dic_num = "0";
                else
                    sjzd_ywlb_dialog_in.dic_num = selected_item.order || "";

                if (selected_item.deleted) {
                    status_ywlb_type_vm.status_type = ["2"];
                }
                else {
                    status_ywlb_type_vm.status_type = ["1"];
                }
                // let tree_id = $(".ztree").attr("id");
                // let treeObj = $.fn.zTree.getZTreeObj(tree_id);
                // let selectedNodeObj = treeObj.getSelectedNodes();
                sjzd_ywlb_dialog_in.fatherShow = false;
                sjzd_vm.dialogHeight = "678";
                sjzd_ywlb_dialog_in.initCheckboxData(selected_item);//编辑 时候需要传入默认数据
                sjzd_vm.ywlb_dialog_show = true;
            } else {
                sjzd_dialog_in.title = "编辑";
                sjzd_dialog_in.add_flag = false;
                let _this = this;
                ajax({
                    url: '/gmvcs/uap/dic/queryById/' + selected_item.code,
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
                    sjzd_dialog_in.dic_code = selected_item.code;
                    sjzd_dialog_in.dic_name = result.data.name;
                    sjzd_dialog_in.dic_value = result.data.value || "";
                    sjzd_dialog_in.dic_txt = result.data.desc || "";
                    if (result.data.order == "0")
                        sjzd_dialog_in.dic_num = "0";
                    else
                        sjzd_dialog_in.dic_num = result.data.order || "";

                    if (result.data.deleted) {
                        status_type_vm.status_type = ["2"];
                    }
                    else {
                        status_type_vm.status_type = ["1"];
                    }

                    let tree_id = $(".ztree").attr("id");
                    let treeObj = $.fn.zTree.getZTreeObj(tree_id);
                    let selectedNodeObj = treeObj.getSelectedNodes();

                    if (selectedNodeObj.length > 0 && selectedNodeObj[0].title == '业务类别') {//业务类别表格
                        sjzd_vm.dialogHeight = "620";
                        // sjzd_ywlb_dialog_in.fatherShow = false;
                    } else if (selectedNodeObj.length > 0 && selectedNodeObj[0].level == 2) {//子字典表格
                        sjzd_vm.dialogHeight = "466";
                        sjzd_dialog_in.dic_name_father = selectedNodeObj[0].title;
                        sjzd_dialog_in.dic_value_father = selectedNodeObj[0].value;
                        sjzd_dialog_in.fatherShow = true;//显示默认的父类型
                    } else if (selectedNodeObj.length > 0 && selectedNodeObj[0].level == 1) {//一般表格
                        sjzd_vm.dialogHeight = "415";
                        sjzd_dialog_in.fatherShow = false;//显示默认的父类型
                    }
                    _this.dialog_show = true;
                });
            }
        },
        select_table(record, selected, selectedRows) {
            this.selected_arr = selectedRows;
            this.selected_item = selectedRows[0];

            this.edit_disabled = true;

            if (selectedRows.length == 1) {
                if (selectedRows[0].systemDictionary) {
                    this.edit_disabled = false;
                    notification.warn({
                        message: '内置参数，不允许编辑',
                        title: '通知'
                    });
                }
            }
        },
        selectAll_table(selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        getCurrent(current) {
            this.table_pagination.current = current;
            this.curPage = current;
            tableObject_sjzd.page(current, this.table_pagination.pageSize);
        },
        handlePageChange(page) {
            this.curPage = page;
            tableObject_sjzd.page(page, this.table_pagination.pageSize);

            this.loading = true;
            this.getDicCodeList();
        },
        getDicCodeList() {
            var _this = this;
            _this.sjzd_table_data = [];
            tableObject_sjzd.tableDataFnc(_this.sjzd_table_data);
            tableObject_sjzd.loading(true);
            // _this.loading = true;
            //分页 查询媒体标注类型
            let url = '/gmvcs/uap/dic/findByDicTypeCode/' + _this.dicTypeCode + '?page=' + (_this.curPage - 1) + '&pageSize=' + _this.table_pagination.pageSize;
            if (sjzd_table.parentShow) {
                url = '/gmvcs/uap/dic/findByParent/' + _this.dicTypeCode + '?page=' + (_this.curPage - 1) + '&pageSize=' + _this.table_pagination.pageSize;
            } else if (sjzd_table.ywlbShow) {
                url = '/gmvcs/uap/bstype/findBsType/' + _this.dicTypeCode + '?page=' + (_this.curPage - 1) + '&pageSize=' + _this.table_pagination.pageSize;
            }
            ajax({
                // url: '/api/dic_tree',
                url: url,
                method: 'get',
                data: {}
            }).then(result => {
                // _this.loading = false;
                // 选中节点 二次选中树节点。不然在切换页面再回来后，当前树节点会选不中的。
                let tree_id = $(".ztree").attr("id");
                let treeObj = $.fn.zTree.getZTreeObj(tree_id);
                let selectedNode = treeObj.getNodeByParam("key", sjzd_vm.dicTypeCode, null);
                treeObj.selectNode(selectedNode);
                if (result.code != 0) {
                    notification.error({
                        message: '获取数据字典失败，请稍后再试',
                        title: '通知'
                    });
                    tableObject_sjzd.loading(false);
                    return;
                }
                _this.selected_arr = [];

                if (!result.data || result.data.totalElements == 0) {
                    this.curPage = 0;
                    tableObject_sjzd.page(this.curPage, this.table_pagination.pageSize);
                    this.table_pagination.current = 0;
                    this.sjzd_table_data = [];
                    tableObject_sjzd.tableDataFnc(this.sjzd_table_data);
                    tableObject_sjzd.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.table_list = [];
                    local_storage.list_total = "0";
                    local_storage.list_totalPages = "0";
                    local_storage.curPage = "0";
                    local_storage.treeData = deptemp;
                    local_storage.selectedKeys = _this.dicTypeCode;
                    local_storage.expandedKeys = sjzd_vm.expandedKeys_arr;

                    storage.setItem("tyyhrzpt-xtpzgl-sjzd", local_storage);
                    return;
                }
                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements || result.data, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].code = item.code; //唯一编号 主键
                    ret_data[index].name = item.name; //名称                    
                    ret_data[index].systemDictionary = item.systemDictionary; //是否内置字典 true是内置，false为非内置             
                    ret_data[index].value = item.value || "-"; //值
                    ret_data[index].desc = item.desc || "-"; //描述
                    ret_data[index].createdTime = formatDate(item.createdTime) || "-"; //导入时间                    
                    ret_data[index].createdBy = item.createdBy || "-"; //创建人
                    ret_data[index].deleted = item.deleted; //状态
                    ret_data[index].space = ""; //空title需要
                    if (sjzd_table.parentShow) {
                        ret_data[index].fatherName = item.parent.name || ''; //父字段名称
                        ret_data[index].fatherValue = item.parent.value || ''; //父字段值
                    }
                    if (sjzd_table.ywlbShow) {
                        let relLabelTypeStr = '';
                        let relJobTypeStr = '';
                        let relPoliceTypeStr = '';

                        let relLabelType_arr = item.relLabelType;
                        let relJobType_arr = item.relJobType;
                        let relPoliceType_arr = item.relPoliceType;

                        relLabelType_arr.forEach(function (val) {
                            
                            relLabelTypeStr += val.name?val.name+'，':'-' ;
                        });
                        relJobType_arr.forEach(function (val) {
                            relJobTypeStr += val.name?val.name+'，':'-';
                        });
                        relPoliceType_arr.forEach(function (val) {
                            relPoliceTypeStr += val.name?val.name+'，':'-';
                        });
                        ret_data[index].relLabelTypeStr = relLabelTypeStr || ''; //标注类型代码
                        ret_data[index].relJobTypeStr = relJobTypeStr || ''; //岗位名称
                        ret_data[index].relPoliceTypeStr = relPoliceTypeStr || ''; //人员类别
                        //编辑时候需要使用这些字段
                        ret_data[index].relLabelType = item.relLabelType || ''; //标注类型代码
                        ret_data[index].relJobType = item.relJobType || ''; //岗位名称
                        ret_data[index].relPoliceType = item.relPoliceType || ''; //人员类别
                    }

                    if (item.order == "0")
                        ret_data[index].order = "0";
                    else
                        ret_data[index].order = item.order || "-";

                    if (item.deleted)
                        ret_data[index].status = "废弃";
                    else
                        ret_data[index].status = "正常";
                });

                this.sjzd_table_data = ret_data;
                tableObject_sjzd.tableDataFnc(this.sjzd_table_data);
                tableObject_sjzd.loading(false);
                this.table_pagination.total = result.data.totalElements;
                this.table_pagination.totalPages = result.data.totalPages;

                local_storage.timeStamp = getTimestamp();
                local_storage.table_list = ret_data;
                local_storage.list_total = result.data.totalElements;
                local_storage.list_totalPages = result.data.totalPages;
                local_storage.curPage = _this.curPage;
                local_storage.treeData = deptemp;
                local_storage.selectedKeys = _this.dicTypeCode;
                local_storage.expandedKeys = sjzd_vm.expandedKeys_arr;

                storage.setItem("tyyhrzpt-xtpzgl-sjzd", local_storage);
            });
            // sjzd_vm.updateMediaTree();
        }
    }
});
let status_type_vm = avalon.define({
    $id: 'status_select',
    curStatus: "",
    status_options: [{
        value: "1",
        label: "正常"
    },
    {
        value: "2",
        label: "废弃"
    }
    ],
    status_type: ["1"],
    onChangeS(e) {
        let _this = this;
        _this.curStatus = e.target.value;
    }
});
let status_ywlb_type_vm = avalon.define({
    $id: 'ywlb_status_select',
    curStatus: "",
    status_options: [{
        value: "1",
        label: "正常"
    },
    {
        value: "2",
        label: "废弃"
    }
    ],
    status_type: ["1"],
    onChangeS(e) {
        let _this = this;
        _this.curStatus = e.target.value;
    }
});

let sjzd_dialog_in = avalon.define({
    $id: "sjzd_dialog_in",
    title: "",
    dic_name: "",
    dic_code: "",
    dic_value: "",
    dic_txt: "",
    dic_num: "",
    add_flag: true,
    name_display: "none",
    name_format: "none",
    name_isNull: "none",
    code_display: "none",
    code_format: "none",
    code_isNull: "none",
    num_display: "none",
    num_format: "none",
    sjzd_close_name: false,
    sjzd_close_code: false,
    sjzd_close_txt: false,
    sjzd_close_num: false,

    fatherShow: false,
    dic_name_father: '',//父字段名称
    dic_value_father: '',//父字段值

    close_click(e) {
        let _this = this;
        switch (e) {
            case 'name':
                _this.dic_name = "";
                _this.sjzd_close_name = false;
                _this.name_display = "inline-block";
                _this.name_format = "none";
                return false;
                break;
            case 'code':
                _this.dic_value = "";
                _this.sjzd_close_code = false;
                _this.code_display = "inline-block";
                _this.code_format = "none";
                return false;
                break;
            case 'txt':
                _this.dic_txt = "";
                _this.sjzd_close_txt = false;
                return false;
                break;
            case 'num':
                _this.dic_num = "";
                _this.sjzd_close_num = false;
                _this.num_display = "inline-block";
                _this.num_format = "none";
                return false;
                break;
        }
    },
    name_change(e) {
        let _this = this;
        let curName = e.target.value;
        let name_exp = new RegExp("^[a-zA-Z0-9\u4e00-\u9fa5]*$"); //正则判断名称

        if (_this.dic_name.length != 0) {
            _this.sjzd_close_name = true;
            $(".sjzd_name_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_name = false;
            $(".sjzd_name_dialog").removeClass("sjzd_change_padding");
        }

        if (!name_exp.test(curName)) {
            _this.name_display = 'none';
            _this.name_format = 'inline-block';
            $(".sjzd_right_close.input_name").addClass("sjzd_error_close");
        } else {
            _this.name_display = 'inline-block';
            _this.name_format = 'none';
            $(".sjzd_right_close.input_name").removeClass("sjzd_error_close");

        }
    },
    code_change(e) {
        let _this = this;
        let curCode = e.target.value;
        let code_exp = new RegExp("^[a-zA-Z0-9\u4e00-\u9fa5]*$"); //正则判断编号

        if (_this.dic_value.length != 0) {
            _this.sjzd_close_code = true;
            $(".sjzd_code_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_code = false;
            $(".sjzd_code_dialog").removeClass("sjzd_change_padding");
        }

        if (!code_exp.test(curCode)) {
            _this.code_display = 'none';
            _this.code_format = 'inline-block';
            $(".sjzd_right_close.input_code").addClass("sjzd_error_close");
        } else {
            _this.code_display = 'inline-block';
            _this.code_format = 'none';
            $(".sjzd_right_close.input_code").removeClass("sjzd_error_close");
        }

    },
    txt_change(e) {
        let _this = this;
        if (_this.dic_txt.length != 0) {
            _this.sjzd_close_txt = true;
            $(".sjzd_txt_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_txt = false;
            $(".sjzd_txt_dialog").removeClass("sjzd_change_padding");
        }
    },
    num_change(e) {
        let _this = this;
        let curNum = e.target.value;
        let num_exp = new RegExp("^[0-9]*$"); //正则判断序号

        if (_this.dic_num.length != 0) {
            _this.sjzd_close_num = true;
            $(".sjzd_num_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_num = false;
            $(".sjzd_num_dialog").removeClass("sjzd_change_padding");
        }

        if (!num_exp.test(curNum) || curNum > 9999) {
            _this.num_display = 'none';
            _this.num_format = 'inline-block';
            $(".sjzd_right_close.input_num").addClass("sjzd_error_close");
        } else {
            _this.num_display = 'inline-block';
            _this.num_format = 'none';
            $(".sjzd_right_close.input_num").removeClass("sjzd_error_close");
        }
    },
    input_focus(e) {
        $(".sjzd_dialog_item input").removeClass("sjzd_change_padding");
        let _this = this;
        switch (e) {
            case 'name':
                if (_this.dic_name.length != 0) {
                    _this.sjzd_close_name = true;
                    $(".sjzd_name_dialog").addClass("sjzd_change_padding");
                }
                if (_this.name_format == 'none') {
                    _this.name_display = 'inline-block';
                    _this.name_isNull = 'none';
                    $(".sjzd_right_close.input_name").removeClass("sjzd_error_close");
                } else
                    $(".sjzd_right_close.input_name").addClass("sjzd_error_close");
                break;
            case 'code':
                if (_this.dic_value.length != 0) {
                    _this.sjzd_close_code = true;
                    $(".sjzd_code_dialog").addClass("sjzd_change_padding");
                }
                if (_this.code_format == 'none') {
                    _this.code_display = 'inline-block';
                    _this.code_isNull = 'none';
                    $(".sjzd_right_close.input_code").removeClass("sjzd_error_close");
                } else
                    $(".sjzd_right_close.input_code").addClass("sjzd_error_close");
                break;
            case 'txt':
                if (_this.dic_txt.length != 0) {
                    _this.sjzd_close_txt = true;
                    $(".sjzd_txt_dialog").addClass("sjzd_change_padding");
                }
                break;
            case 'num':
                if (_this.dic_num.length != 0) {
                    _this.sjzd_close_num = true;
                    $(".sjzd_num_dialog").addClass("sjzd_change_padding");
                }
                if (_this.num_format == 'none') {
                    _this.num_display = 'inline-block';
                    $(".sjzd_right_close.input_num").removeClass("sjzd_error_close");
                } else
                    $(".sjzd_right_close.input_num").addClass("sjzd_error_close");
                break;
        }
    },
    input_blur(e) {
        $(".sjzd_dialog_item .input_panel input").removeClass("sjzd_change_padding");
        let _this = this;
        switch (e) {
            case 'name':
                _this.sjzd_close_name = false;
                _this.name_display = 'none';
                _this.name_isNull = 'none';
                break;
            case 'code':
                _this.sjzd_close_code = false;
                _this.code_display = 'none';
                _this.code_isNull = 'none';
                break;
            case 'txt':
                _this.sjzd_close_txt = false;
                break;
            case 'num':
                _this.sjzd_close_num = false;
                _this.num_display = 'none';
                break;
        }
    }
});

let sjzd_dialog_out = avalon.define({
    $id: "sjzd_dialog_out",
    dialogCancel() {
        sjzd_vm.dialog_show = false;
        status_type_vm.curStatus = "";

        sjzd_dialog_in.name_display = "none";
        sjzd_dialog_in.name_format = "none";
        sjzd_dialog_in.name_isNull = "none";
        sjzd_dialog_in.code_display = "none";
        sjzd_dialog_in.code_format = "none";
        sjzd_dialog_in.code_isNull = "none";
        sjzd_dialog_in.num_display = "none";
        sjzd_dialog_in.num_format = "none";
    },
    dialogOk() {
        if (sjzd_dialog_in.name_format == 'inline-block' || sjzd_dialog_in.code_format == 'inline-block' || sjzd_dialog_in.num_format == 'inline-block') {
            return;
        }

        if (sjzd_dialog_in.dic_name == "") {
            sjzd_dialog_in.name_isNull = 'inline-block';
            return;
        }
        

        // if (sjzd_dialog_in.dic_value == "") {
        //     sjzd_dialog_in.code_isNull = 'inline-block';
        //     return;
        // }

        if (sjzd_dialog_in.add_flag) {
            let add_data = {};
            if (sjzd_dialog_in.fatherShow) {//判断是新增 ‘字典’ 还是新增 ‘子字典’
                add_data = {
                    "value": sjzd_dialog_in.dic_value,
                    "name": sjzd_dialog_in.dic_name,
                    "parent": {
                        "code": sjzd_vm.dicTypeCode
                    }
                };
            } else {
                add_data = {
                    "value": sjzd_dialog_in.dic_value,
                    "name": sjzd_dialog_in.dic_name,
                    "dicType": {
                        "code": sjzd_vm.dicTypeCode
                    }
                };
            }

            if (sjzd_dialog_in.dic_txt)
                add_data.desc = sjzd_dialog_in.dic_txt;
            if (sjzd_dialog_in.dic_num)
                add_data.order = sjzd_dialog_in.dic_num;
            
            if (!add_data.value || add_data.value == "") {
                errorTip('字段值不能为空！');
                return;
            }
            if (!add_data.desc||add_data.desc == "") {
                errorTip('字段描述不能为空！');
                return;
            }
            if (!add_data.order||add_data.order == "") {
                errorTip('排序不能为空！');
                return;
            }

            ajax({
                url: '/gmvcs/uap/dic/create',
                method: 'post',
                data: add_data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                notification.success({
                    message: '新增字典成功！',
                    title: '通知'
                });

                sjzd_vm.dialog_show = false;
                if (sjzd_vm.curPage == "0") {
                    sjzd_vm.curPage = 1;
                    tableObject_sjzd.page(sjzd_vm.curPage, sjzd_vm.table_pagination.pageSize);
                    sjzd_vm.table_pagination.current = 1;
                }
            }).then(rs => {
                sjzd_vm.updateMediaTree();//添加成功，更新媒体标注树
                let tree_id = $(".ztree").attr("id");
                let treeObj = $.fn.zTree.getZTreeObj(tree_id);
                let glmtNode = treeObj.getNodeByParam("title", '媒体标注类型', null);
                let code = glmtNode.key;
                ajax({
                    // url: '/api/dic_tree',
                    url: '/gmvcs/uap/dic/findByDicTypeCode/' + code + '?page=' + (sjzd_vm.curPage - 1) + '&pageSize=' + sjzd_vm.table_pagination.pageSize,
                    method: 'get',
                    data: {}
                }).then(result => {
                    // treeObj.removeChildNodes(glmtNode);//清除 媒体关联 节点数据
                    // avalon.each(result.data.currentElements, function (index, item) {
                    //     treeObj.addNodes(glmtNode, { isParent: false, title: item.name, key: item.code, value: item.value});
                    // });
                    deptemp = treeObj.getNodes();
                    sjzd_vm.expandedKeys_arr.push(code);
                });
            });
        } else {
            let deleted;
            
            if (status_type_vm.curStatus == "") {
                if (status_type_vm.status_type[0] == "1")
                    deleted = false;
                else
                    deleted = true;
            } else {
                if (status_type_vm.curStatus == "1")
                    deleted = false;
                else
                    deleted = true;
            }

            let edit_data = {
                "code": sjzd_dialog_in.dic_code,
                "value": sjzd_dialog_in.dic_value,
                "name": sjzd_dialog_in.dic_name,
                "deleted": deleted,
                "dicType": {
                    "code": sjzd_vm.dicTypeCode
                }
            };
            sjzd_dialog_in.dic_txt = $.trim(sjzd_dialog_in.dic_txt);
            if (sjzd_dialog_in.dic_txt)
                edit_data.desc = sjzd_dialog_in.dic_txt;
            if (sjzd_dialog_in.dic_num)
                edit_data.order = sjzd_dialog_in.dic_num;
            
            if (!edit_data.value || edit_data.value == "") {
                errorTip('字段值不能为空！');
                return;
            }
            if (!edit_data.desc||edit_data.desc == "") {
                errorTip('字段描述不能为空！');
                return;
            }
            if (!edit_data.order||edit_data.order == "") {
                errorTip('排序不能为空！');
                return;
            }

            ajax({
                url: '/gmvcs/uap/dic/edit',
                method: 'post',
                data: edit_data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                notification.success({
                    message: '编辑字典成功！',
                    title: '通知'
                });

                sjzd_vm.dialog_show = false;
                sjzd_vm.getDicCodeList();
            }).then(rs => {
                let tree_id = $(".ztree").attr("id");
                let treeObj = $.fn.zTree.getZTreeObj(tree_id);
                let glmtNode = treeObj.getNodeByParam("title", '媒体标注类型', null);
                let code = glmtNode.key;
                ajax({
                    // url: '/api/dic_tree',
                    url: '/gmvcs/uap/dic/findByDicTypeCode/' + code + '?page=' + (sjzd_vm.curPage - 1) + '&pageSize=' + sjzd_vm.table_pagination.pageSize,
                    method: 'get',
                    data: {}
                }).then(result => {
                    // treeObj.removeChildNodes(glmtNode);//清除 媒体关联 节点数据
                    // avalon.each(result.data.currentElements, function (index, item) {
                    //     treeObj.addNodes(glmtNode, { isParent: false, title: item.name, key: item.code, value: item.value});
                    // });
                    deptemp = treeObj.getNodes();
                    sjzd_vm.expandedKeys_arr.push(code);
                    sjzd_vm.updateMediaTree();
                    // sjzd_vm.getDicCodeList();
                });
            });
        }

        status_type_vm.curStatus = "";

        sjzd_dialog_in.name_display = "none";
        sjzd_dialog_in.name_format = "none";
        sjzd_dialog_in.name_isNull = "none";
        sjzd_dialog_in.code_display = "none";
        sjzd_dialog_in.code_format = "none";
        sjzd_dialog_in.code_isNull = "none";
        sjzd_dialog_in.num_display = "none";
        sjzd_dialog_in.num_format = "none";
    }
});

// 业务类别 弹窗
let sjzd_ywlb_dialog_in = avalon.define({
    $id: "sjzd_ywlb_dialog_in",
    title: "",
    dic_name: "",
    dic_code: "",
    dic_value: "",
    dic_txt: "",
    dic_num: "",
    add_flag: true,
    name_display: "none",
    name_format: "none",
    name_isNull: "none",
    code_display: "none",
    code_format: "none",
    code_isNull: "none",
    num_display: "none",
    num_format: "none",
    sjzd_close_name: false,
    sjzd_close_code: false,
    sjzd_close_txt: false,
    sjzd_close_num: false,

    bzlx_arr: [],
    gwmc_arr: [],
    rylb_arr: [],
    bzlxCheck: [],
    gwmcCheck: [],
    rylbCheck: [],
    initCheckboxData(initData) {
        let tree_id = $(".ztree").attr("id");
        let treeObj = $.fn.zTree.getZTreeObj(tree_id);
        let glmtNode = treeObj.getNodeByParam("title", '媒体标注类型', null);
        let code = glmtNode.key;
        ajax({
            url: '/gmvcs/audio/basefile/label/all',
            method: 'get',
            // url: '/api/label_types',
            data: {}
        }).then(result => {//标注类型
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: '通知'
                });
            }
            let ret = result.data;
            if (ret && (ret.length > 0)) {
                let optJs = [];
                for (let i = 0; i < ret.length; i++) {
                    optJs[i] = new Object();
                    optJs[i].label = ret[i].name;
                    optJs[i].value = ret[i].code;
                    if (initData) {
                        if (initData.relLabelType) {
                            sjzd_ywlb_dialog_in.bzlxCheck = [];
                            initData.relLabelType.forEach(function (val) {
                                sjzd_ywlb_dialog_in.bzlxCheck.push(val.code);
                            });
                        }
                    }
                }
                sjzd_ywlb_dialog_in.bzlx_arr = [];
                sjzd_ywlb_dialog_in.bzlx_arr = optJs;
            }
        }).then(result => {
            ajax({
                url: '/gmvcs/uap/jobtype/all',
                method: 'get',
                data: {}
            }).then(result => {//岗位名称
                let ret = result.data;
                if (ret && (ret.length > 0)) {
                    let optJs = [];
                    for (let i = 0; i < ret.length; i++) {
                        optJs[i] = new Object();
                        optJs[i].label = ret[i].name;
                        optJs[i].value = ret[i].code;
                        if (initData) {
                            if (initData.relJobType) {
                                sjzd_ywlb_dialog_in.gwmcCheck = [];
                                initData.relJobType.forEach(function (val) {
                                    sjzd_ywlb_dialog_in.gwmcCheck.push(val.code);
                                });
                            }
                        }
                    }
                    sjzd_ywlb_dialog_in.gwmc_arr = [];
                    sjzd_ywlb_dialog_in.gwmc_arr = optJs;
                }
            }).then(result => {
                ajax({
                    url: '/gmvcs/uap/policetype/all',
                    method: 'get'
                }).then(result => {//人员类别
                    if (result.data && result.data.length > 0) {
                        let r = result.data;
                        let optJs = [];
                        for (let i = 0; i < r.length; i++) {
                            optJs[i] = new Object();
                            optJs[i].label = r[i].name;
                            optJs[i].value = r[i].code;
                            if (initData) {
                                if (initData.relPoliceType) {
                                    sjzd_ywlb_dialog_in.rylbCheck = [];
                                    initData.relPoliceType.forEach(function (val) {
                                        sjzd_ywlb_dialog_in.rylbCheck.push(val.code);
                                    });
                                }
                            }
                        }
                        sjzd_ywlb_dialog_in.rylb_arr = [];
                        sjzd_ywlb_dialog_in.rylb_arr = optJs;
                    }
                });
            });
        });
        sjzd_vm.ywlb_dialog_show = true;
    },
    handleDeviceCheck(e) {
        // console.log(e);
        console.log('标注类型' + sjzd_ywlb_dialog_in.bzlxCheck);
        console.log('岗位类型' + sjzd_ywlb_dialog_in.gwmcCheck);
        console.log('人员类别' + sjzd_ywlb_dialog_in.rylbCheck);
    },
    close_click(e) {
        let _this = this;
        switch (e) {
            case 'name':
                _this.dic_name = "";
                _this.sjzd_close_name = false;
                _this.name_display = "inline-block";
                _this.name_format = "none";
                return false;
                break;
            case 'code':
                _this.dic_value = "";
                _this.sjzd_close_code = false;
                _this.code_display = "inline-block";
                _this.code_format = "none";
                return false;
                break;
            case 'txt':
                _this.dic_txt = "";
                _this.sjzd_close_txt = false;
                return false;
                break;
            case 'num':
                _this.dic_num = "";
                _this.sjzd_close_num = false;
                _this.num_display = "inline-block";
                _this.num_format = "none";
                return false;
                break;
        }
    },
    name_change(e) {
        let _this = this;
        let curName = e.target.value;
        let name_exp = new RegExp("^[a-zA-Z0-9\u4e00-\u9fa5]*$"); //正则判断名称

        if (_this.dic_name.length != 0) {
            _this.sjzd_close_name = true;
            $(".sjzd_name_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_name = false;
            $(".sjzd_name_dialog").removeClass("sjzd_change_padding");
        }

        if (!name_exp.test(curName)) {
            _this.name_display = 'none';
            _this.name_format = 'inline-block';
            $(".sjzd_right_close.input_name").addClass("sjzd_error_close");
        } else {
            _this.name_display = 'inline-block';
            _this.name_format = 'none';
            $(".sjzd_right_close.input_name").removeClass("sjzd_error_close");

        }
    },
    code_change(e) {
        let _this = this;
        let curCode = e.target.value;
        let code_exp = new RegExp("^[a-zA-Z0-9\u4e00-\u9fa5]*$"); //正则判断编号

        if (_this.dic_value.length != 0) {
            _this.sjzd_close_code = true;
            $(".sjzd_code_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_code = false;
            $(".sjzd_code_dialog").removeClass("sjzd_change_padding");
        }

        if (!code_exp.test(curCode)) {
            _this.code_display = 'none';
            _this.code_format = 'inline-block';
            $(".sjzd_right_close.input_code").addClass("sjzd_error_close");
        } else {
            _this.code_display = 'inline-block';
            _this.code_format = 'none';
            $(".sjzd_right_close.input_code").removeClass("sjzd_error_close");
        }

    },
    txt_change(e) {
        let _this = this;
        if (_this.dic_txt.length != 0) {
            _this.sjzd_close_txt = true;
            $(".sjzd_txt_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_txt = false;
            $(".sjzd_txt_dialog").removeClass("sjzd_change_padding");
        }
    },
    num_change(e) {
        let _this = this;
        let curNum = e.target.value;
        let num_exp = new RegExp("^[0-9]*$"); //正则判断序号

        if (_this.dic_num.length != 0) {
            _this.sjzd_close_num = true;
            $(".sjzd_num_dialog").addClass("sjzd_change_padding");
        } else {
            _this.sjzd_close_num = false;
            $(".sjzd_num_dialog").removeClass("sjzd_change_padding");
        }

        if (!num_exp.test(curNum) || curNum > 9999) {
            _this.num_display = 'none';
            _this.num_format = 'inline-block';
            $(".sjzd_right_close.input_num").addClass("sjzd_error_close");
        } else {
            _this.num_display = 'inline-block';
            _this.num_format = 'none';
            $(".sjzd_right_close.input_num").removeClass("sjzd_error_close");
        }
    },
    input_focus(e) {
        $(".sjzd_dialog_item input").removeClass("sjzd_change_padding");
        let _this = this;
        switch (e) {
            case 'name':
                if (_this.dic_name.length != 0) {
                    _this.sjzd_close_name = true;
                    $(".sjzd_name_dialog").addClass("sjzd_change_padding");
                }
                if (_this.name_format == 'none') {
                    _this.name_display = 'inline-block';
                    _this.name_isNull = 'none';
                    $(".sjzd_right_close.input_name").removeClass("sjzd_error_close");
                } else
                    $(".sjzd_right_close.input_name").addClass("sjzd_error_close");
                break;
            case 'code':
                if (_this.dic_value.length != 0) {
                    _this.sjzd_close_code = true;
                    $(".sjzd_code_dialog").addClass("sjzd_change_padding");
                }
                if (_this.code_format == 'none') {
                    _this.code_display = 'inline-block';
                    _this.code_isNull = 'none';
                    $(".sjzd_right_close.input_code").removeClass("sjzd_error_close");
                } else
                    $(".sjzd_right_close.input_code").addClass("sjzd_error_close");
                break;
            case 'txt':
                if (_this.dic_txt.length != 0) {
                    _this.sjzd_close_txt = true;
                    $(".sjzd_txt_dialog").addClass("sjzd_change_padding");
                }
                break;
            case 'num':
                if (_this.dic_num.length != 0) {
                    _this.sjzd_close_num = true;
                    $(".sjzd_num_dialog").addClass("sjzd_change_padding");
                }
                if (_this.num_format == 'none') {
                    _this.num_display = 'inline-block';
                    $(".sjzd_right_close.input_num").removeClass("sjzd_error_close");
                } else
                    $(".sjzd_right_close.input_num").addClass("sjzd_error_close");
                break;
        }
    },
    input_blur(e) {
        $(".sjzd_dialog_item .input_panel input").removeClass("sjzd_change_padding");
        let _this = this;
        switch (e) {
            case 'name':
                _this.sjzd_close_name = false;
                _this.name_display = 'none';
                _this.name_isNull = 'none';
                break;
            case 'code':
                _this.sjzd_close_code = false;
                _this.code_display = 'none';
                _this.code_isNull = 'none';
                break;
            case 'txt':
                _this.sjzd_close_txt = false;
                break;
            case 'num':
                _this.sjzd_close_num = false;
                _this.num_display = 'none';
                break;
        }
    }
});

let sjzd_ywlb_dialog_out = avalon.define({
    $id: "sjzd_ywlb_dialog_out",
    dialogCancel() {
        sjzd_vm.ywlb_dialog_show = false;
        status_type_vm.curStatus = "";

        sjzd_ywlb_dialog_in.name_display = "none";
        sjzd_ywlb_dialog_in.name_format = "none";
        sjzd_ywlb_dialog_in.name_isNull = "none";
        sjzd_ywlb_dialog_in.code_display = "none";
        sjzd_ywlb_dialog_in.code_format = "none";
        sjzd_ywlb_dialog_in.code_isNull = "none";
        sjzd_ywlb_dialog_in.num_display = "none";
        sjzd_ywlb_dialog_in.num_format = "none";
    },
    dialogOk() {
        if (sjzd_ywlb_dialog_in.name_format == 'inline-block' || sjzd_ywlb_dialog_in.code_format == 'inline-block' || sjzd_ywlb_dialog_in.num_format == 'inline-block') {
            return;
        }

        if (sjzd_ywlb_dialog_in.dic_name == "") {
            sjzd_ywlb_dialog_in.name_isNull = 'inline-block';
            return;
        }

        if (sjzd_ywlb_dialog_in.dic_value == "") {
            notification.error({
                message: "字段值不能为空！",
                title: '通知'
            });
            return;
        }
        if (sjzd_ywlb_dialog_in.dic_txt == "") {
            notification.error({
                message: "字段描述不能为空！",
                title: '通知'
            });
            return;
        }
        if (sjzd_ywlb_dialog_in.dic_num == "") {
            notification.error({
                message: "序号不能为空！",
                title: '通知'
            });
            return;
        }



        if (sjzd_ywlb_dialog_in.add_flag) {
            let add_data = {};
            add_data = {
                "code": sjzd_vm.dicTypeCode,//字段代码 
                "name": sjzd_ywlb_dialog_in.dic_name,
                "value": sjzd_ywlb_dialog_in.dic_value,
                "status": true,//新增 状态为true
                "relLabelType": sjzd_ywlb_dialog_in.bzlxCheck,//标注类型
                "relJobType": sjzd_ywlb_dialog_in.gwmcCheck,//岗位名称
                "relPoliceType": sjzd_ywlb_dialog_in.rylbCheck,//人员类别
                "edit": false
            };

            if (sjzd_ywlb_dialog_in.dic_txt)
                add_data.desc = sjzd_ywlb_dialog_in.dic_txt;
            if (sjzd_ywlb_dialog_in.dic_num)
                add_data.order = sjzd_ywlb_dialog_in.dic_num;

            ajax({
                url: '/gmvcs/uap/bstype/addBsType',
                method: 'post',
                data: add_data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                notification.success({
                    message: '新增字典成功！',
                    title: '通知'
                });

                sjzd_vm.ywlb_dialog_show = false;
                if (sjzd_vm.curPage == "0") {
                    sjzd_vm.curPage = 1;
                    tableObject_sjzd.page(sjzd_vm.curPage, sjzd_vm.table_pagination.pageSize);
                    sjzd_vm.table_pagination.current = 1;
                }
                sjzd_vm.getDicCodeList();

            });
        } else {
            let deleted;
            if (status_ywlb_type_vm.curStatus == "") {
                if (status_ywlb_type_vm.status_type[0] == "1")
                    deleted = true;
                else
                    deleted = false;
            } else {
                if (status_ywlb_type_vm.curStatus == "1")
                    deleted = true;
                else
                    deleted = false;
            }

            let edit_data = {
                "code": sjzd_ywlb_dialog_in.dic_code,
                "value": sjzd_ywlb_dialog_in.dic_value,
                "name": sjzd_ywlb_dialog_in.dic_name,
                "status": deleted,
                "relLabelType": sjzd_ywlb_dialog_in.bzlxCheck,//标注类型
                "relJobType": sjzd_ywlb_dialog_in.gwmcCheck,//岗位名称
                "relPoliceType": sjzd_ywlb_dialog_in.rylbCheck,//人员类别
                "edit": true
            };
            sjzd_ywlb_dialog_in.dic_txt = $.trim(sjzd_ywlb_dialog_in.dic_txt);
            if (sjzd_ywlb_dialog_in.dic_txt)
                edit_data.desc = sjzd_ywlb_dialog_in.dic_txt;
            if (sjzd_ywlb_dialog_in.dic_num)
                edit_data.order = sjzd_ywlb_dialog_in.dic_num;

            ajax({
                url: '/gmvcs/uap/bstype/addBsType',
                method: 'post',
                data: edit_data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                notification.success({
                    message: '编辑字典成功！',
                    title: '通知'
                });

                sjzd_vm.ywlb_dialog_show = false;
                sjzd_vm.getDicCodeList();
            });
        }

        status_type_vm.curStatus = "";

        sjzd_ywlb_dialog_in.name_display = "none";
        sjzd_ywlb_dialog_in.name_format = "none";
        sjzd_ywlb_dialog_in.name_isNull = "none";
        sjzd_ywlb_dialog_in.code_display = "none";
        sjzd_ywlb_dialog_in.code_format = "none";
        sjzd_ywlb_dialog_in.code_isNull = "none";
        sjzd_ywlb_dialog_in.num_display = "none";
        sjzd_dialog_in.num_format = "none";
    }
});

function getDicTree(treelet, dataTree) {
    if (!treelet) {
        return;
    }

    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();
        if (item.appCode) {
            dataTree[i].key = item.appCode;
            dataTree[i].title = item.appName;
            dataTree[i].appOrder = item.appOrder;
            dataTree[i].children = new Array();
            // dataTree[i].open = 1;

            sjzd_vm.expandedKeys_arr.push(item.appCode);
        } else {
            dataTree[i].key = item.dicTypeCode;
            dataTree[i].title = item.dicTypeName;
        }

        getDicTree(item.dicTypes, dataTree[i].children);
    }
}

//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}

let sjzd_table = avalon.define({
    $id: "xtpzgl_sjzd_table",
    loading: false,
    heardShow: true,
    parentShow: false,//父字段名称、父字段值的 显示标识
    ywlbShow: false,//业务类别表格头 显示标识
    actions(type, text, record, index) {
        if (type == "check_click") {
            if (record.systemDictionary)
                return;
            sjzd_vm.editBtn(record);
        }
    },
    handleSelect(record, selected, selectedRows) {
        sjzd_vm.select_table(record, selected, selectedRows);
    },
    handleSelectAll(selected, selectedRows) {
        sjzd_vm.selectAll_table(selected, selectedRows);
    }
});

// let tableObject_sjzd = $.tableIndex({ //初始化表格jq插件
//     id: 'sjzd_table',
//     controller: 'sjzd_table',
//     tableObj: sjzd_table,
//     currentPage: 1,
//     prePageSize: 20,
//     key: "code"
// });

let tableBody_zfyps = avalon.define({ //表格定义组件
    $id: 'sjzd_table',
    data: [],
    key: 'code',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    selection: [],
    isAllChecked: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'sjzd_table-tableDrag-style',
    handleCheckAll: function (e) {
        var _this = this;
        var data = _this.data;
        if (e.target.checked) {
            data.forEach(function (record) {
                _this.checked.ensure(record[_this.key]);
                _this.selection.ensure(record);
            });
        } else {
            if (data.length > 0) {
                this.checked.clear();
                this.selection.clear();
            } else {
                this.checked.removeAll(function (el) {
                    return data.map(function (record) {
                        return record[_this.key];
                    }).indexOf(el) !== -1;
                });
                this.selection.removeAll(function (el) {
                    return data.indexOf(el) !== -1;
                });
            }
        }
        // this.selectionChange(this.checked, this.selection.$model);
        sjzd_table.handleSelectAll(e.target.checked, this.selection.$model);
    },
    handleCheck: function (checked, record) {
        if (checked) {
            this.checked.ensure(record[this.key]);
            this.selection.ensure(record);
        } else {
            this.checked.remove(record[this.key]);
            this.selection.remove(record);
        }
        // this.selectionChange(this.checked, this.selection.$model);
        sjzd_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        sjzd_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});

// 错误提示信息
function errorTip(message, title) {
    notification.error({
        message: message,
        title: title || '通知'
    });
}
