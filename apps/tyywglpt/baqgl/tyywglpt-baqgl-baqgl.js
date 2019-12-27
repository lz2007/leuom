/*
 * @Description: 运维中心-办案区管理-办案区管理
 * @Author: chenjinxing
 * @Date: 2019-07-09 11:46:19
 * @LastEditTime: 2019-09-04 16:53:42
 * @LastEditors: Please set LastEditors
 */

import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import '/apps/common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';
import Sbzygl from '/apps/common/common-sbzygl'; 
export const name = "tyywglpt-baqgl-baqgl";
require("./tyywglpt-baqgl-baqgl.less");

let sbzygl = null;
let storage = require('/services/storageService.js').ret;
let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    includedStatus,
    isTableSearch
} = require('/services/configService');
let baqgl_vm;

avalon.component(name, {
    template: __inline("./tyywglpt-baqgl-baqgl.html"),
    defaults: {
        baqgl_txt: getLan(),
        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        included_dep_img: "",
        depTreeTitle: "", //部门名称
        baqName:"",       //办案区名称
        generateNum: "",
        generateNum_title: getLan().supportPositiveIntegersAnd0,
        generateNum_close: false,
        startTime: "", //开始时间
        endTime: "", //结束时间
        change_page: false,
        page_type: false, //false 显示总条数; true 显示大于多少条
        search_data: {},
        table_list: [],
        loading: false,
        tree_init: false,
        extra_class: languageSelect == "en" ? true : false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0
        },
        authority: { // 按钮权限标识
            "SEARCH": false, //查询
            "SAVE": false, //查询
            "MODIFY": false, //查询
        },
        selectChange(type, data) {
            if (type == 'one') {
                if (data.checked) {
                    baqgl_vm.checkedData.push(data);
                } else {
                    baqgl_vm.checkedData.pop(data);
                }
            } else {
                avalon.each(data, (index, el) => {
                    if (el.checked) {
                        baqgl_vm.checkedData.push(el);
                    } else {
                        baqgl_vm.checkedData.pop(el);
                    }
                });
            }
            
            console.log(this.checkedData);
        },
        //批量删除
        handleBatchDelete() {
            if (this.selectedRowsLength||this.selectedRowsLength < 1) return;
            // let deleteArr = [];
            // avalon.each(baqgl_vm.checkedData, (index, el) => {
            //     deleteArr.push(el.id);
            // });
            // baqgl_vm.batchDelete(deleteArr);
            baqlgDelete.show = true;
        },
        selectedRowsLength:"",
        checkedData: [],
        onInit(e) {
            sbzygl = new Sbzygl(this);
            baqgl_vm = e.vmodel;
            this.checkedData = [];
            this.tree_init = false;
            let storage_item = storage.getItem('tyywglpt-baqgl-baqgl');
            this.$watch("included_status", (v) => {
                if (v) {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                } else {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                }
            });
          
            this.ajaxDepTree(storage_item);
            
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_BAQGL_/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_BAQGL_BAQGL_CHECK":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_BAQGL_BAQGL_SAVE":
                            _this.authority.SAVE = true;
                            break;
                        case "UOM_FUNCTION_BAQGL_BAQGL_MODIFY":
                            _this.authority.MODIFY = true;
                            _this.editAuthority = true;
                            break;
                    }
                });
            });
        },
        //请求接口获取部门树
        ajaxDepTree(storage_item) {
            let deptemp = [];
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    showTips('error', '获取部门树失败，请稍后再试');
                    return;
                }
                getDepTree(result.data, deptemp);
                baqgl_tree_vm.tree_data = deptemp;
                if (storage_item) {
                    baqgl_tree_vm.tree_path = storage_item.ajax_data.orgPath;
                    baqgl_tree_vm.tree_key = storage_item.tree_key;
                    baqgl_tree_vm.tree_code = storage_item.tree_code;
                    baqgl_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    baqgl_tree_vm.tree_path = deptemp[0].path;
                    baqgl_tree_vm.tree_key = deptemp[0].key;
                    baqgl_tree_vm.tree_code = deptemp[0].orgCode;
                    baqgl_tree_vm.tree_title = deptemp[0].title;
                }
                baqgl_vm.tree_init = true;
                isTableSearch && baqgl_vm.searchBtn();
            });
        },
        
        //部门树下拉框是否包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },
        handlePageChange(currentPage) {
            this.change_page = true;
            this.table_pagination.current = currentPage;
            this.loading = true;
            this.getTableList();
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },
        //生成按钮
        searchBtn() {
            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数
            this.loading = true;
            this.getTableList();
        },
        //获取表格数据
        getTableList() {
            let ajax_data = {
                "includeChild": this.included_status,
                "orgCode": baqgl_tree_vm.tree_code,
                "orgPath": baqgl_tree_vm.curTree || baqgl_tree_vm.tree_path,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
            };
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_data = ajax_data;
            }
            ajax_data.name = baqgl_vm.baqName;
          
            this.ajaxTableData(ajax_data);
        },
        //请求接口获取表格数据
        ajaxTableData(ajax_data) {
            let params = ajax_data;
            // params.orgCode = ajax_data.orgCode;
            // params.orgPath = ajax_data.orgPath;
            // params.baqName = ajax_data.baqName;
            ajax({
                url: '/gmvcs/baq/casearea/findCaseArea',
                // url: '/api/findCaseArea',
                method: 'post',
                data: params
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                //缓存请求的数据信息
                let temp_data = {
                     // "includeChild": ajax_data.included_status,
                    "orgCode": ajax_data.orgCode,
                    "orgPath": ajax_data.orgPath,
                    "baqName": ajax_data.baqName,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize
                };
                // if (!result.data.pageObject.overLimit && result.data.pageObject.totalElements == 0) {
                //     this.table_pagination.current = 0;
                //     this.table_pagination.total = 0;
                //     this.table_list = [];
                //     this.loading = false;
                //     let storage_item = {
                //         "ajax_data": temp_data,
                //         "total": 0,
                //         "tree_key": baqgl_tree_vm.tree_key,
                //         "tree_title": baqgl_tree_vm.tree_title
                //     };
                //     storage.setItem('tyywglpt-baqgl-baqgl', storage_item, 0.5);
                //     return;
                // }
                if (!this.change_page) {
                    this.table_pagination.current = 1;
                }
                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                let oparate = baqgl_vm.authority.MODIFY;//修改权限设置
                //遍历返回数据
                avalon.each(result.data.currentElements, function (index, item) { 
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].name = item.name ; //
                    ret_data[index].caseAreaId = item.caseAreaId; //
                    ret_data[index].orgName = item.orgName; //
                    ret_data[index].orgCode = item.orgCode; //
                    ret_data[index].orgPath = item.orgPath; //
                    ret_data[index].chargeName = item.chargeName; //
                    ret_data[index].contactNum = item.contactNum; //
                    ret_data[index].description = item.description; //
                    ret_data[index].checked = false; //
                    ret_data[index].oparate = oparate; //
                });
                
                this.table_pagination.total = result.data.totalElements; //总条数
                this.table_list = ret_data;
                this.loading = false;
             
            });
        },
        name_input_enter(e) {
            // let val = e.target.id;
            // switch (val) {
            //     case 'generateNum':
            //         if (e.target.value != "") {
            //             this.generateNum_title = e.target.value;
            //         } else {
            //             this.generateNum_title = baqgl_vm.baqgl_txt.supportPositiveIntegersAnd0;
            //         }
            //         break;
            // }
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        close_click(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum = "";
                    this.generateNum_title = baqgl_vm.baqgl_txt.supportPositiveIntegersAnd0;
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum_close = true;
                    $(".znsb_baqgl .dataFormBox .generateNum").width($(".baqgl_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum_close = false;
                    $(".znsb_baqgl .dataFormBox .generateNum").width($(".baqgl_input_panel").innerWidth() - 23);
                    break;
            }
        },
      
        handleAdd() {
            baqglAddDialog.title = "添加";
            this.isRecordEdit = false;
            baqglAddDialog.inputJson = {
                "name": "",
                "orgCode": "",
                "orgPath": "",
                "chargeName": "",
                "contactNum": "",
                "description": ""
            };
            baqglAddDialog.validJson={
                "contactNum": true,
            },
            baqglAddDialog.show = true;
            this.ajaxAddDepTree();
        },
        ajaxAddDepTree() {
            let deptemp = [];
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    showTips('error', '获取部门树失败，请稍后再试');
                    return;
                }
                getDepTree(result.data, deptemp);
                baqgl_addTree_vm.tree_data = deptemp;   
                if (baqgl_vm.isRecordEdit) {
                    baqgl_addTree_vm.tree_code = baqgl_vm.editRecord.orgCode;
                    baqgl_addTree_vm.tree_key = baqgl_vm.editRecord.orgPath;
                    baqgl_addTree_vm.tree_title = baqgl_vm.editRecord.orgName;
                    baqglAddDialog.inputJson.name =  baqgl_vm.editRecord.name;
                    baqglAddDialog.inputJson.chargeName =  baqgl_vm.editRecord.chargeName;
                    baqglAddDialog.inputJson.contactNum =  baqgl_vm.editRecord.contactNum;
                    baqglAddDialog.inputJson.description =  baqgl_vm.editRecord.description;
                    baqglAddDialog.inputJson.orgCode =  baqgl_vm.editRecord.tree_code;
                    baqglAddDialog.inputJson.orgPath =  baqgl_vm.editRecord.orgPath;
                } else {
                    baqgl_addTree_vm.tree_code = deptemp[0].orgCode;
                    baqgl_addTree_vm.tree_key = deptemp[0].key;
                    baqgl_addTree_vm.tree_title = deptemp[0].title;
                    baqgl_addTree_vm.tree_path = deptemp[0].path;
                }
               
                baqgl_addTree_vm.tree_init = true;
                
            });
        },
        //表格操作
        isRecordEdit: false,
        editRecord:null,
        actions(type, text, record, index) {
            if (type == 'delete') { 
                this.editRecord = null;
                this.editRecord = record;
                baqlgDelete.show = true;
                // let ajax_data = record;
                // ajax_data = [record.id];
                // baqgl_vm.batchDelete(ajax_data);
            } else if (type == 'modify') {
                if (!baqgl_vm.editAuthority) {
                    return;
                }
                baqglAddDialog.title = "修改";
                this.isRecordEdit = true;
                baqglAddDialog.show = true;
                this.editRecord = null;
                this.editRecord = record;
                this.ajaxAddDepTree();
            }
        },
        editAuthority:false,
        batchDelete(ajax_data) {
            ajax({
                url: '/gmvcs/baq/casearea/batchDelete',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                showTips('success', result.msg);
                baqgl_vm.editRecord = null;//成功删除后清空旧数据,操作行
                baqgl_vm.checkedData = [];//成功删除后清空旧数据，批量删除
                baqglAddDialog.show = false;
                baqlgDelete.show = false;
                baqgl_vm.searchBtn();
            });
        }
    }
});

//部门树
let baqgl_tree_vm = avalon.define({
    $id: "baqgl_tree",
    tree_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
        this.tree_code = e.orgCode;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.path;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', result.msg);
                return;
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
})
let baqgl_addTree_vm = avalon.define({
    $id: "baqgl_addTree",
    tree_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
        this.tree_code = e.orgCode;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.path;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', result.msg);
                return;
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
});

//获取语言对象
function getLan() {
    return language_txt.jdzxpt.jdzxpt_dxcc_sjcc;
}
/**
 * @description: 获取部门树
 * @param {Array} treelet
 * @param {Array} dataTree
 * @return: 
 */
function getDepTree(treelet, dataTree) {
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
        getDepTree(item.childs, dataTree[i].children);
    }
}
/**
 * @description: 日期转时间戳
 * @param {date} stringTime
 * @param {boolean} end_flag
 * @return: Unix时间戳
 */
function getTimeByDateStr(stringTime, end_flag) {
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    if (end_flag == true) {
        s2 = ["23", "59", "59"];
    }
    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();
}
/**
 * @description: 显示提示消息
 * @param {String} type 
 * @param {String} content 
 * @param {String} layout 
 * @param {Number} duration 
 * @param {String} title 
 * @return: 
 */
function showTips(type, content, layout, duration, title) {
    notification[type]({
        title: title || "通知",
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}

//添加弹框vm
let baqglAddDialog = avalon.define({
    $id: 'baqglAddDialog',
    show: false,
    title: "添加",
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    inputJson: {
        "name": "",
        "orgCode": "",
        "orgPath": "",
        "chargeName": "",
        "contactNum": "",
        "description": ""
    },
    showJson: {
        "ip": false,
        "admin": false,
        "contactNum": false,
        "expireDays": false,
        "gbCode": false
    },
    validJson:{
        "contactNum": true,
    },
    // modityInputJson: {
    //     "name": "",
    //     "orgCode": "",
    //     "orgPath": "",
    //     "caseAreaId":"",
    //     "chargeName": "",
    //     "contactNum": "",
    //     "description": ""
    // },
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        if (this.validJson.contactNum) {
            // if (this.inputJson.contactNum == "") {
                
            // } else {
            //     return;
            // }
        } else {//校验不通过
            return;
        }
       
        let ajax_data = null;
        baqglAddDialog.inputJson.orgCode = baqgl_addTree_vm.tree_code;
        baqglAddDialog.inputJson.orgPath = baqgl_addTree_vm.curTree || baqgl_tree_vm.tree_path;
        ajax_data = baqglAddDialog.inputJson;
        ajax_data.orgName = baqgl_addTree_vm.tree_title;
        let url = "";
        if (!baqgl_vm.isRecordEdit) {
            url = '/gmvcs/baq/casearea/add';
            
        } else {
            url = '/gmvcs/baq/casearea/modify';
            ajax_data.caseAreaId = baqgl_vm.editRecord.id;
        }
        if (ajax_data.name == "") {
            showTips('warn', "请填写添加的办案区名称！");
            return;
        }
        ajax({
            url: url,
            method: 'post',
            data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                showTips('success', result.msg);
                
                baqglAddDialog.show = false;
                baqgl_vm.searchBtn();
        });
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    }
});
//删除弹窗
let baqlgDelete = avalon.define({
    $id: 'baqlgDelete',
    show: false,
    deleteArr: [],
    showDeleteModal() {
        this.show = true;
    },
    handleCancel() {
        this.show = false;
    },
    handleOk() {
        let ajax_data = null;
        if (baqgl_vm.editRecord) {//单个删除
            ajax_data = [baqgl_vm.editRecord.id];
            baqgl_vm.batchDelete(ajax_data);
        } else {//批量删除
            let deleteArr = [];
            avalon.each(baqgl_vm.checkedData, (index, el) => {
                deleteArr.push(el.id);
            });
            baqgl_vm.batchDelete(deleteArr);
        }
    }
});