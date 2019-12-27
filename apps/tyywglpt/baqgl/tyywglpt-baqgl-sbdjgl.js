/*
 * @Description: 运维中心-办案区管理-办案区管理
 * @Author: chenjinxing
 * @Date: 2019-07-09 11:46:19
 * @LastEditTime: 2019-09-05 10:58:51
 * @LastEditors: Please set LastEditors
 */

import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import '/apps/common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';
export const name = "tyywglpt-baqgl-sbdjgl";
require("./tyywglpt-baqgl-sbdjgl.less");
import Sbzygl from '/apps/common/common-sbzygl'; 
require('/apps/common/common-sbzygl.css');
let sbzygl = null;
let storage = require('/services/storageService.js').ret;
let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    includedStatus,
    isTableSearch
} = require('/services/configService');
let sbdjgl_vm;

avalon.component(name, {
    template: __inline("./tyywglpt-baqgl-sbdjgl.html"),
    defaults: {
        sbdjgl_txt: getLan(),
        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        included_dep_img: "",
        depTreeTitle: "", //部门名称
        caseAreaId:"",//办案中心ID
        generateNum: "",
        generateNum_title: getLan().supportPositiveIntegersAnd0,
        generateNum_close: false,
        // isCreated: 0, //是否已生成数据, 0: 表示还在加载， 1： 未生成 2： 已生成
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
            "SAVE": false, //查询
            "SEARCH": false, //查询
            "MODIFY": false, //查询
            "CHANNELSAVE": false, //查询
        },
        baqName:'',
        BAZX_options:[],
        onChangeBAZX(e) {
            let _this = this;
            _this.caseAreaId = e.target.value;
        },
        getCaseareaAll(userCode) {
            ajax({
                url: '/gmvcs/baq/case/getUserBaqInfo?userCode=' + userCode,
                // url: '/api/getUserBaqInfo',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    showTips('error', '获取办案中心失败，请稍后再试');
                    return;
                }
                if (result.code == 0) {
                    let ret_data = [{
                        "label": "不限",
                        "vlaue":"99"
                    }];
                    if (result.data != null && result.data.length != 0) {
                        avalon.each(result.data, function (index, item) {
                            let ret_obj = {};
                            ret_obj.value = item.baqID;
                            ret_obj.label = item.baqName;
    
                            ret_data.push(ret_obj);
                        });
                    }
                    sbdjgl_vm.BAZX_options = ret_data;
                    sbdjgl_vm.caseAreaId = ret_data[0].value||"";
                    isTableSearch && sbdjgl_vm.searchBtn();
                }
            });
        },
        // selectChange(type, data) {
        //     if (type == 'one') {
        //         if (data.checked) {
        //             sbdjgl_vm.checkedData.push(data);
        //         } else {
        //             sbdjgl_vm.checkedData.pop(data);
        //         }
        //     } else {
        //         avalon.each(data, (index, el) => {
        //             if (el.checked) {
        //                 sbdjgl_vm.checkedData.push(el);
        //             } else {
        //                 sbdjgl_vm.checkedData.pop(el);
        //             }
        //         });
        //     }
        // },
        //批量删除
        handleBatchDelete() {
            if (this.selectedRowsLength < 1) return;
            // avalon.each(this.checkedData, (index, el) => {
            //     deletModal.deleteArr.push(el.number);
            // })
            // deletModal.showDeleteModal();
        },
        // selectedRowsLength:"",
        checkedData: [],
        onInit(e) {
            sbdjgl_vm = e.vmodel;
            sbzygl = new Sbzygl(this);
            this.tree_init = false;
            sbdjglAddDialog.initTree();
            let storage_item = storage.getItem('tyywglpt-sbdjgl-sbdjgl');
            this.$watch("included_status", (v) => {
                if (v) {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                } else {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                }
            });
            this.getCaseareaAll(storage.getItem('userCode'));
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
                        case "UOM_FUNCTION_BAQGL_SBDJGL_SAVE":
                            _this.authority.SAVE = true;
                            break;
                        case "UOM_FUNCTION_BAQGL_SBDJGL_CHECK":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_BAQGL_SBDJGL_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_BAQGL_SBDJGL_CHANNEL_SAVE":
                            _this.authority.CHANNELSAVE = true;
                            sbdjglAddDialog.channelAuthority = true;
                            break;
                    }
                });
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
            // let ajax_data = {
            //     "page": 0,
            //     "pageSize": this.table_pagination.pageSize
            // };
            // if (this.change_page) {
            //     ajax_data = this.search_data;
            //     ajax_data.page = this.table_pagination.current - 1;
            // } else {
            //     this.search_data = ajax_data;
            // }
            // ajax_data.caseAreaId = this.caseAreaId;
            // ajax_data.caseAreaId = "5d3178fde4b0106ce67c5f76";


            let ajax_data = {
                "included_status": this.included_status,
                "orgCode": baqsbgl_tree.tree_code,
                "orgPath": baqsbgl_tree.curTree || baqsbgl_tree.tree_path,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
            };
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_data = ajax_data;
            }
            ajax_data.caseAreaName = sbdjgl_vm.baqName;
            this.ajaxTableData(ajax_data);
        },
        //请求接口获取表格数据
        ajaxTableData(ajax_data) {
            let params = ajax_data;
            ajax({
                url: '/gmvcs/baq/casedevice/findCaseDevice',
                method: 'post',
                data: params
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                //缓存请求的数据信息
                // let temp_data = {
                //     "includeChild": ajax_data.includeChild,
                //     "page": ajax_data.page,
                //     "pageSize": ajax_data.pageSize,
                //     "caseAreaId": ajax_data.caseAreaId
                // };
               
                if (!this.change_page) {
                    this.table_pagination.current = 1;
                }
                let oparate = sbdjgl_vm.authority.MODIFY;//修改权限设置
                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                    avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;                   
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].deviceName = item.deviceName ; //
                    ret_data[index].deviceId = item.deviceId; //
                    ret_data[index].gbcode = item.gbcode; //
                    ret_data[index].dgwGateway = item.dgwGateway; //
                    ret_data[index].deviceTypeName = item.deviceTypeName; //
                    ret_data[index].ip = item.ip; //
                    ret_data[index].port = item.port; //
                    ret_data[index].account = item.account; //
                    ret_data[index].pwd = item.pwd; //
                    ret_data[index].caseAreaId = item.caseAreaId; //
                    ret_data[index].caseAreaName = item.caseAreaName; //
                    ret_data[index].manufacturer = item.manufacturer; //
                    ret_data[index].insertTime = moment(item.insertTime).format("YYYY-MM-DD HH:mm:ss") || "-"; //
                    ret_data[index].isOnline = item.online ? '在线' : '离线'; //  
                    ret_data[index].oparate = oparate;     
                });
                // if (result.data.pageObject.overLimit) {
                //     this.page_type = true;
                //     this.table_pagination.total = result.data.pageObject.limit * this.table_pagination.pageSize; //总条数
                // } else {
                //     this.page_type = false;
                //     this.table_pagination.total = result.data.pageObject.totalElements; //总条数
                // }
                this.table_pagination.total = result.data.totalElements; //总条数
                this.table_list = ret_data;
                this.loading = false;
               
            });
        },
        name_input_enter(e) {
            
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        close_click(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum = "";
                    this.generateNum_title = sbdjgl_vm.sbdjgl_txt.supportPositiveIntegersAnd0;
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum_close = true;
                    $(".znsb_sbdjgl .dataFormBox .generateNum").width($(".sbdjgl_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum_close = false;
                    $(".znsb_sbdjgl .dataFormBox .generateNum").width($(".sbdjgl_input_panel").innerWidth() - 23);
                    break;
            }
        },
       
        handleAdd() {
            sbdjglAddDialog.title = "添加";
            sbdjglAddDialog.sureBtnTitle = "添加设备";
            sbdjglAddDialog.inputJson = {
                "deviceName": "",
                "gbcode": "",
                "dgwGateway": "",
                "deviceTypeId": "",
                "account": "",
                "pwd": "",
                "caseAreaId": "",
                "ip": "",
                "port": "",
                "manufacturer": ""
            };
            sbdjglAddDialog.validJson={
                "gbcode": true,
                "deviceName": true,
                "dgwGateway": true,
                "account": true,
                "pwd": true,
                "caseAreaId": true,
                "ip": true,
                "port": true
            },
            sbdjglAddDialog.show = true;
            this.isRecordEdit = false;
            sbdjglAddDialog.tree_baq.selectedTitle = '';
            // sbdjglAddDialog.getCaseareaAll(storage.getItem('userCode'));
            sbdjglAddDialog.getDeviceType();
            
            //清空通道信息
            sbdjglAddDialog.table_list = [];

            
        },
        isRecordEdit: false,
        editRecord:null,
        //表格操作
        actions(type, text, record, index) {
            if (type == 'delete') { 
                this.editRecord = null;
                this.editRecord = record;
                sbdjglDelete.show = true;
            } else if (type == 'modify') {
                if (!sbdjgl_vm.authority.MODIFY) {
                    return;
                }
                sbdjglAddDialog.title = "修改";
                sbdjglAddDialog.sureBtnTitle = "修改设备";
                this.isRecordEdit = true;
                sbdjglAddDialog.show = true;
                sbdjglAddDialog.validJson={
                    "gbcode": true,
                    "deviceName": true,
                    "dgwGateway": true,
                    "account": true,
                    "pwd": true,
                    "caseAreaId": true,
                    "ip": true,
                    "port": true
                },
                this.editRecord = null;
                this.editRecord = record;
                
                sbdjglAddDialog.tree_baq.selectedTitle = record.caseAreaName;
                sbdjglAddDialog.tree_baq.tree_code = record.orgCode;
                sbdjglAddDialog.deviceId = record.id;//赋值修改的设备ID,新增通道或者删除通道需要用到
                sbdjglAddDialog.goVideoDeviceId = record.goVideoDeviceId;
                // sbdjglAddDialog.getCaseareaAll(storage.getItem('userCode'));
                sbdjglAddDialog.getDeviceType();
            }
        },
        deviceDelete(ajax_data) {
            ajax({
                url: '/gmvcs/baq/casedevice/batchDelete',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                showTips('success', result.msg);
                    
                sbdjglDelete.show = false;
                sbdjgl_vm.searchBtn();
            });
        }

    }
});



//获取语言对象
function getLan() {
    return language_txt.jdzxpt.jdzxpt_dxcc_sjcc;
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
let sbdjglAddDialog = avalon.define({
    $id: 'sbdjglAddDialog',
    show: false,
    title: "添加",
    channelAuthority:false,//通道新增权限
    deviceId: "",//添加设备成功后返回
    goVideoDeviceId:"",
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    // ipReg: /(^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^\s{0}$)/,
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    capacityReg: /(^[1-9]{1}[0-9]{0,8}$|^\s{0}$)/,
    allotKeywordReg: /^[a-zA-Z0-9\u4e00-\u9fa5]{0,20}$/,
    mustAndSpecialReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, //禁止特殊字符的必填项
    specialReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/, //禁止特殊字符的非必填项
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    gbcodeReg: /^[a-zA-Z0-9]{20}$/,
    inputJson: {
        "deviceName": "",
        "gbcode": "",
        "dgwGateway": "",
        "deviceTypeId": "",
        "account": "",
        "pwd": "",
        "caseAreaId": "",
        "ip": "",
        "port": "",
        "manufacturer": ""
    },
    validJson: {
        "gbcode": true,
        "deviceName": true,
        "dgwGateway": true,
        "account": true,
        "pwd": true,
        "caseAreaId": true,
        "ip": true,
        "port": true
    },
    showJson: {
        "ip": false,
        "dgwGateway":false,
        "gbcode": false
    },
    handleCancel(e) {
        this.show = false;
        sbdjglAddDialog.isAdd = false;//不允许新增通道
        sbdjglTDAddDialog.validJson.channelNo = true;
        sbdjglAddDialog.deviceId = "";
    },
    sureBtnTitle:"添加设备",
    isAdd: false,
    handleOk() {     
        if (sbdjglAddDialog.isAdd) { return;}
        // sbdjglAddDialog.inputJson.caseAreaId = sbdjglAddDialog.caseAreaId;
        sbdjglAddDialog.inputJson.deviceTypeId = sbdjglAddDialog.deviceType;
        let ajax_data = sbdjglAddDialog.inputJson;
        //数据验证还没实现
        let params = ajax_data;

        let url = "";
        if (!sbdjgl_vm.isRecordEdit) {
            url = '/gmvcs/baq/casedevice/add';
            
        } else {
            url = '/gmvcs/baq/casedevice/modify';
            ajax_data.deviceId = sbdjgl_vm.editRecord.id;
            ajax_data.goVideoDeviceId = sbdjgl_vm.editRecord.goVideoDeviceId;
        }
        if (!sbdjglAddDialog.validJson.deviceName
            || !sbdjglAddDialog.validJson.account
            || !sbdjglAddDialog.validJson.pwd || !sbdjglAddDialog.validJson.caseAreaId
            ||!sbdjglAddDialog.validJson.ip||!sbdjglAddDialog.validJson.port) {
            return;
        }
        if (params.deviceName == "" || params.gbcode == "" || params.account == ""
            || params.deviceTypeId == "" || params.pwd == "" || params.ip == ""
            || params.port == "") {
            showTips('warn', "请正确填写输入框！");
            return;
        }
        if (params.caseAreaId == "") {
            showTips('warn', "请选择所属办案区！");
            return;
        }
        
        ajax({
            url: url,
            method: 'post',
            data: params
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                showTips('success', result.msg);
                sbdjglAddDialog.deviceId = result.data.id;
                sbdjglAddDialog.goVideoDeviceId = result.data.goVideoDeviceId;
                sbdjglAddDialog.isAdd = true;//允许新增通道
                sbdjglAddDialog.getChannel(sbdjglAddDialog.deviceId);        
                sbdjgl_vm.searchBtn();
        });
    },
   //办案区树
   tree_baq: avalon.define({
        $id: 'tree_sbdjgl',
        rdata: [],
        checkedKeys: [],
        expandedKeys: [],
        checkType: '',
        id: '',
        selectedTitle: '',
        sjdw:'',
        tree_code: "",
        curTree: "",
        getSelected(key, title, e) {
            if (e.isBAQ) {
                this.id = key;
                sbdjglAddDialog.tree_baq.selectedTitle = title;
                sbdjglAddDialog.inputJson.caseAreaId = key;
                sbdjglAddDialog.caseAreaId = key;
            } else {
                this.id = "";
                this.selectedTitle = "";
            }

            // 从后台获取国标编码，新增的时候填充到页面
            getGBCODE(e.orgCode,'0').then((result) => {
                sbdjglAddDialog.inputJson.gbcode = result.data; 
            });
        },
        select_change(e, selectedKeys) {           
            if (selectedKeys == "") { return; }            
            this.tree_code = e.node.orgCode;
            // ajax({
            //     url: '/gmvcs/baq/case/getBaqDevicesInfo?baqID='+selectedKeys,
            //     method: 'get',
            //     data: {}
            // }).then(result => {
            //     if (result.code != 0) {
            //         showTips('error', '获取设备失败，请稍后再试');
            //         return;
            //     }
            //     if (result.code == 0) {
            //         let ret_data = [];
            //         if (result.data != null && result.data.length != 0) {
            //             avalon.each(result.data, function (index, item) {
            //                 let ret_obj = {};
            //                 ret_obj.value = item.deviceID;
            //                 ret_obj.label = item.deviceName;

            //                 ret_data.push(ret_obj);
            //             });
            //         }
            //         sbdjglAddDialog.sxt_options = [];
            //         sbdjglAddDialog.sb_options = [];
            //         addJKSP_vm.sb_options = ret_data;
            //         // addJKSP_vm.sxt_options = ret_data.;
            //     }
            // });
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

                    getAreaAllocatAjax(treeNode.orgCode).then((result) => {
                        if (result.data) {
                            if (result.data.length == 0) { return;}
                            let treeData = [];
                            result.data.forEach(item => {
                                let treeNode = {};
                                treeNode.key = item.baqId;
                                treeNode.name = item.baqName;
                                treeNode.title = item.baqName;
                                // treeNode.checkType = item.checkType;
                                treeNode.orgCode = item.orgCode;
                                // treeNode.orgId = item.orgId;
                                // treeNode.orgPath = item.orgPath;
                                treeNode.path = item.orgPath;
                                treeNode.icon = "/static/image/sszhxt/Droneonline.png";
                                treeNode.isBAQ = true;
                                treeData.push(treeNode);
                            });
                            treeObj.addNodes(treeNode, -1, treeData);
                        }
                    });
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
            });

        }
   }),
    initTree() {
        let deptemp = [];
        ajax({
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
            sbdjglAddDialog.tree_baq.rdata = deptemp;
            sbdjglAddDialog.tree_baq.rdata = deptemp;
            // sbdjglAddDialog.tree_baq.sjdw = 'GMO0000000020190626142948ff8ffffff';
            // sbdjglAddDialog.tree_baq.selectedTitle = '';
            baqsbgl_tree.tree_data = deptemp;
            baqsbgl_tree.tree_code = deptemp[0].orgCode;
            baqsbgl_tree.tree_key = deptemp[0].key;
            baqsbgl_tree.tree_title = deptemp[0].title;
            baqsbgl_tree.tree_path = deptemp[0].path;
        });
   },
    //设备型号
    deviceType:"",
    sbxh_options: [],
    gbcodeIsHidden:false,
    onChangeSBXH(e) {
        let _this = this;
        _this.deviceType = e.target.value;
        if (e.target.value == '1000001') {
            sbdjglTDAddDialog.gbcodeIsHidden = true;//新增通道弹窗
            _this.gbcodeIsHidden = true;
        } else {
            sbdjglTDAddDialog.gbcodeIsHidden = false;  
            _this.gbcodeIsHidden = false;
        }
    },
    getDeviceType() {
        ajax({
            url: '/gmvcs/baq/casedevice/deviceType',
            // url: '/api/casedeviceDeviceType',
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取设备型号失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.id;
                        ret_obj.label = item.name;

                        ret_data.push(ret_obj);
                    });
                }
                sbdjglAddDialog.sbxh_options = ret_data;
                if (sbdjgl_vm.isRecordEdit) {
                    sbdjglAddDialog.deviceType = sbdjgl_vm.editRecord.deviceTypeId;
                    sbdjglAddDialog.inputJson = {
                        "deviceName": sbdjgl_vm.editRecord.deviceName,
                        "gbcode": sbdjgl_vm.editRecord.gbcode,
                        "dgwGateway": sbdjgl_vm.editRecord.dgwGateway,
                        "deviceTypeId": sbdjgl_vm.editRecord.deviceTypeId,
                        "account": sbdjgl_vm.editRecord.account,
                        "pwd": sbdjgl_vm.editRecord.pwd,
                        "caseAreaId": sbdjgl_vm.editRecord.caseAreaId,
                        "ip": sbdjgl_vm.editRecord.ip,
                        "port": sbdjgl_vm.editRecord.port,
                        "manufacturer": sbdjgl_vm.editRecord.manufacturer
                    };
                    sbdjglAddDialog.getChannel(sbdjgl_vm.editRecord.id);
                    // sbdjglAddDialog.isAdd = true;//允许新增通道
                } else {
                    sbdjglAddDialog.deviceType = ret_data[0].value;
                }
            }
        });
    },
    //所属办案区
    caseAreaId: "",
    BAZX_options:[],
    onChangeBAZX(e) { 
        let _this = this;
        _this.caseAreaId = e.target.value;
    },
    getCaseareaAll(userCode) {
        ajax({
            url: '/gmvcs/baq/case/getUserBaqInfo?userCode=' + userCode,
            // url: '/api/getUserBaqInfo',
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取办案中心失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.baqID;
                        ret_obj.label = item.baqName;

                        ret_data.push(ret_obj);
                    });
                }
                sbdjglAddDialog.BAZX_options = ret_data;

                if (sbdjgl_vm.isRecordEdit) {
                    sbdjglAddDialog.caseAreaId = sbdjgl_vm.editRecord.caseAreaId;
                } else {
                    sbdjglAddDialog.caseAreaId = ret_data[0].value;                     
                }
                
            }
        });
    },
    
    
    //通道信息表格
    table_list: [],
    loading: false,
    checkedData: [],

    
    selectChange(type, data) {
        if (type == 'one') {
            if (data.checked) {
                sbdjglAddDialog.checkedData.push(data);
            } else {
                sbdjglAddDialog.checkedData.pop(data);
            }
        } else {
            avalon.each(data, (index, el) => {
                if (el.checked) {
                    sbdjglAddDialog.checkedData.push(el);
                } else {
                    sbdjglAddDialog.checkedData.pop(el);
                }
            });
        }
    },
    actions(type, text, record, index) {
        if (type == 'delete') {
            this.list.removeAll(el => el.id == record.id);
            message.success({
                content: '删除成功'
            });
        }
    },
    //添加通道
    handleAddTDBtn() {        
        sbdjglTDAddDialog.validJson.channelNo = true;
        sbdjglTDAddDialog.show = true;
        if (sbdjglTDAddDialog.gbcodeIsHidden) {
            getGBCODE(sbdjglAddDialog.tree_baq.tree_code,'1').then((result) => {
                sbdjglTDAddDialog.inputJson = {
                    "channelNo": "",
                    "channelName": "",
                    "deviceId": "",
                    "goVideoDeviceId": "",
                    "channelGbcode": result.data,
                    "description": ""
                };
            });
        } else {
            sbdjglTDAddDialog.inputJson = {
                "channelNo": "",
                "channelName": "",
                "deviceId": "",
                "goVideoDeviceId": "",
                "description": ""
            };
        }
        
    },
    handledeleteBtnShow() {
        if (sbdjglAddDialog.checkedData.length==0) {
            return;
        }
        sbdjglTDDelete.show = true;
    },
    handledeleteBtn() { 
        if (sbdjglAddDialog.checkedData.length==0) {
            return;
        }
        let ret_data = [];
        avalon.each(sbdjglAddDialog.checkedData, function (index, item) {
            let obj = {
                "channelId":item.id,
                "goVideoChannelID":item.goVideoChannelID,
            }
            ret_data.push(obj);
        });
        let ajax_data = ret_data;
        ajax({
            url: '/gmvcs/baq/casedevice/channel/delete',
            method: 'post',
            data: ajax_data
        }).then(result => {
            if (result.code != 0) {
                showTips('warn', result.msg);
                return;
            }
            showTips('success', result.msg);
            sbdjglAddDialog.checkedData = [];
            sbdjglTDDelete.show = false;
            sbdjglAddDialog.getChannel(sbdjgl_vm.editRecord.id||sbdjgl_vm.deviceId);
        });
    },
    //获取通道
    getChannel(deviceId) {
        ajax({
            url: '/gmvcs/baq/casedevice/channel/get?deviceId='+deviceId,
            method: 'get',
            data: {}
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                let ret_data = [];
                avalon.each(result.data, function (index, item) {
                    ret_data[index] = item;
                   
                    ret_data[index].table_index = index+1; //行序号
                    ret_data[index].channelNo = item.channelNo; //
                    ret_data[index].description = item.description || "-"; //
                    ret_data[index].channelGbcode = item.channelGbcode || "-"; //
                    ret_data[index].channelName = item.channelName; //
                    ret_data[index].checked = false; //
                });
                sbdjglAddDialog.checkedData = [];//初始化
                sbdjglAddDialog.table_list = ret_data;
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
    },

});
let sbdjglTDAddDialog = avalon.define({
    $id: 'sbdjglTDAddDialog',
    show: false,
    title: "新增通道",
    mustAndSpecialReg: /^[0-9\u4e00-\u9fa5]+$/, //禁止特殊字符的必填项
    gbcodeIsHidden:false,
    inputJson: {
        "channelNo": "",
        "channelName": "",
        "deviceId": "",
        "goVideoDeviceId": "",
        "channelGbcode":"",
        "description": ""
    },
    validJson: {
        "channelNo": true,
        
    },
    showJson: {
        "channelNo": false,
    },
    handleCancel(e) {
        this.show = false;
        sbdjglTDAddDialog.validJson.channelNo = true;

    },
    //添加通道
    handleOk() {
        sbdjglTDAddDialog.inputJson.deviceId = sbdjglAddDialog.deviceId;
        sbdjglTDAddDialog.inputJson.goVideoDeviceId = sbdjglAddDialog.goVideoDeviceId;
        let ajax_data = sbdjglTDAddDialog.inputJson;
        //数据验证还没实现
        let params = ajax_data;
        if (params.channelNo == "" || params.channelName == "") {
            showTips('warn', "请正确填写输入框！");
            return;
        }
        if (!sbdjglTDAddDialog.validJson.channelNo) {//校验通道号是否通过
            return;
        }
        if (params.deviceId == "") {
            showTips('warn', "暂无可添加通道设备！");
            return;
        }
        ajax({
            url: '/gmvcs/baq/casedevice/channel/add',
            method: 'post',
            data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                showTips('success', result.msg);
                sbdjglTDAddDialog.show = false;
                sbdjglTDAddDialog.validJson.channelNo = true;
                // sbdjglAddDialog.table_list = result.data
                sbdjglAddDialog.getChannel(sbdjglAddDialog.deviceId);
        });

    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        // sbzygl.handleClear(event, name, this);
    },
});

//删除弹窗
let sbdjglDelete = avalon.define({
    $id: 'sbdjglDelete',
    show: false,
    deleteArr: [],
    showDeleteModal() {
        this.show = true;
    },
    handleCancel() {
        this.show = false;
    },
    handleOk() {
        let ajax_data = [{
            "deviceId":sbdjgl_vm.editRecord.id,
            "goVideoDeviceId":sbdjgl_vm.editRecord.goVideoDeviceId,
        }];
        // ajax_data = [sbdjgl_vm.editRecord.id];
        sbdjgl_vm.deviceDelete(ajax_data);
    }
});
//删除弹窗
let sbdjglTDDelete = avalon.define({
    $id: 'sbdjglTDDelete',
    show: false,
    deleteArr: [],
    showDeleteModal() {
        this.show = true;
    },
    handleCancel() {
        this.show = false;
    },
    handleOk() {
        sbdjglAddDialog.handledeleteBtn();
    }
});

//获取国标编码 自动生成填充
function getGBCODE(orgCode,type) {
    return ajax({
        url: '/gmvcs/baq/casedevice/gbcode?orgCode=' + orgCode + '&type=' + type,
        method: 'get',
        cache: false,
        data: null
    });
}

//获取部门树
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

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}
function getAreaAllocatAjax(orgCode) {
    return ajax({
        // url: '/api/ccfwgl-chart',
        // url: '/gmvcs/baq/casedownloadmonitor/findAreaUnallocated?orgCode=' + orgCode,
        url: '/gmvcs/baq/case/getOrgBaqInfo?orgCode=' + orgCode,
        method: 'get',
        cache: false,
        data: null
    });
}

let baqsbgl_tree = avalon.define({
    $id: "baqsbgl_tree",
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