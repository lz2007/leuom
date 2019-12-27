/*
 * @Description: 运维中心-办案区管理-办案区管理
 * @Author: chenjinxing
 * @Date: 2019-07-09 11:46:19
 * @LastEditTime: 2019-09-10 16:23:13
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
export const name = "tyywglpt-rwgl-baqspccrw";
require("./tyywglpt-rwgl-baqspccrw.less");
require('/apps/common/common-datepicker');

import {
    getSelectStartTimeStamp,
    getSelectEndTimeStamp
} from '/apps/common/common-datepicker';

let storage = require('/services/storageService.js').ret;
let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    isTableSearch
} = require('/services/configService');
let baqgl_vm;

avalon.component(name, {
    template: __inline("./tyywglpt-rwgl-baqspccrw.html"),
    defaults: {
        baqgl_txt: getLan(),
        included_status: false, //true 包含子部门；false 不包含子部门
        included_dep_img: "",
        depTreeTitle: "", //部门名称
        generateNum_title: getLan().supportPositiveIntegersAnd0,
        generateNum_close: false,
        isCreated: 0, //是否已生成数据, 0: 表示还在加载， 1： 未生成 2： 已生成
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
            "RESTART": false, //重新下载
            "CHECK": false, //查看
            "CQ": false, //重启
        },

        onChangeBAZX(e) {
            let _this = this;
            _this.caseAreaId = e.target.value;
        },

        //时间
        ajaxStartTime: getSelectStartTimeStamp("0"),
        ajaxEndTime: getSelectEndTimeStamp("0"),
        currentSelect: "0", //0--本周，1--本月，2--自定义时间
        initTime: {},
        timeCallback(currentSelect, startTime, endTime) {
            this.initTime = {};
            this.currentSelect = currentSelect;
            this.ajaxStartTime = startTime;
            this.ajaxEndTime = endTime;
        },

        onInit(e) {
            baqgl_vm = e.vmodel;
            this.tree_init = false;
            this.checkedData = [];
            let storage_item = storage.getItem('tyywglpt-rwgl-baqspccrw');
            // this.$watch("included_status", (v) => {
            //     if (v) {
            //         this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
            //     } else {
            //         this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
            //     }
            // });
            // this.$watch("tree_init", (v) => {
            //     if (v && baqgl_vm.tree_init) {
            //         if (storage_item) {
            //             baqgl_vm.getTableList();
            //         } else {
            //             baqgl_vm.searchBtn();
            //         }
            //     }
            // });
            // this.ajaxDepTree(storage_item);
            this.getCaseareaAll(storage.getItem('userCode'));
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_XTRWGL_BAQSPCCRW/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_XTRWGL_BAQSPCCRW_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_XTRWGL_BAQSPCCRW_RWCQ":
                            _this.authority.RESTART = true;
                            break;
                        case "UOM_FUNCTION_XTRWGL_BAQSPCCRW_CHECK":
                            _this.authority.CHECK = true;
                            opt_restart_baqspccrw.rwCheckStr = true;
                            break;
                        case "UOM_FUNCTION_XTRWGL_BAQSPCCRW_CQ":
                            _this.authority.CQ = true;
                            break;
                        
                    }
                });
            });
        },
        //所属办案区
        curBAZX: "",
        BAZX_options: [],
        onChangeBAZX(e) {
            let _this = this;
            _this.curBAZX = e.target.value;
        },
        getCaseareaAll(userCode) {
            ajax({
                url: '/gmvcs/baq/case/getUserBaqInfo?userCode=' + userCode,
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
                    baqgl_vm.BAZX_options = ret_data;
                    isTableSearch && baqgl_vm.searchBtn();
                }
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
                "endTime": this.ajaxEndTime,
                "baqId": baqgl_vm.curBAZX,
                "status": count_type_vm.curType,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "startTime": this.ajaxStartTime,
            };
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_data = ajax_data;
            }
            this.ajaxTableData(ajax_data);
        },
        //请求接口获取表格数据
        ajaxTableData(ajax_data) {
            ajax({
                url: '/gmvcs/baq/queryBAQDownloadTask',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                if (!result.data) {
                    this.table_pagination.total = 0; //总条数
                    this.table_list = [];
                    this.loading = false;
                    return;
                }
                //缓存请求的数据信息
                // let temp_data = {
                //     "endTime": ajax_data.endTime,
                //     "baqId": ajax_data.baqId,
                //     "status": ajax_data.status,
                //     "page": ajax_data.page,
                //     "pageSize": ajax_data.pageSize,
                //     "startTime": ajax_data.startTime
                // };
               
                if (!this.change_page) {
                    this.table_pagination.current = 1;
                }
                // this.isCreated = result.data.randomGenerateAble == true ? 1 : 2;
                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;

                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].baqName = item.baqName; //
                    ret_data[index].deviceName = item.deviceName; //
                    ret_data[index].channelName = item.channelName; //
                    ret_data[index].fileNum = (item.fileNum == '-1' ? '-' : item.fileNum); //
                    ret_data[index].startTime = moment(item.startTime).format("YYYY-MM-DD HH:mm:ss"); //
                    ret_data[index].endTime = moment(item.endTime).format("YYYY-MM-DD HH:mm:ss"); //
                    ret_data[index].checked = false; //
                    //任务状态，00未开始，01下载中，02下载失败，10任务完成，99不限
                    let obj = changeStatus(item.status);
                    ret_data[index].status = obj.status;
                    ret_data[index].oparate = obj.oparate;
                    // switch (item.status) {
                    //     case '00':
                    //         ret_data[index].status = "未开始";
                    //         ret_data[index].oparate = "-";
                    //         break;
                    //     case '01':
                    //         ret_data[index].status = "下载中";
                    //         ret_data[index].oparate = "-";
                    //         break;
                    //     case '02':
                    //         ret_data[index].status = "下载失败";
                    //         if (baqgl_vm.authority.RESTART) {
                    //             ret_data[index].oparate = "重启";
                    //         } else {
                    //             ret_data[index].oparate = "无权重启";
                    //         }
                    //         break;
                    //     case '10':
                    //         ret_data[index].status = "任务完成";
                    //         ret_data[index].oparate = "-";
                    //         break;
                    //     case '99':
                    //         ret_data[index].status = "不限";
                    //         ret_data[index].oparate = "-";
                    //         break;
                    //     default:
                    //         ret_data[index].status = "其它";
                    //         ret_data[index].oparate = "-";
                    //         break;
                    // }
                });
                // if (result.data.pageObject.overLimit) {
                //     this.page_type = true;
                //     this.table_pagination.total = result.data.totalElements; //总条数
                // } else {
                //     this.page_type = false;
                //     this.table_pagination.total = result.data.pageObject.totalElements; //总条数
                // }
                this.table_pagination.total = result.data.totalElements; //总条数                
                this.table_list = [];
                this.table_list = ret_data;
                this.loading = false;
            });
        },
        checkedData:[],
        selectChange(type, data) {
            if (type == 'one') {
                if (data.status == '下载失败') {                    
                    if (data.checked) {
                        baqgl_vm.checkedData.push(data);
                    } else {
                        avalon.each(baqgl_vm.checkedData, function (index, item) {
                            if (item.taskID == data.taskID) {
                                baqgl_vm.checkedData.splice(index, 1);
                            }
                         });
                    }
                }
            } else {
                avalon.each(data, (index, el) => {
                    if (el.status == '下载失败') { 
                        if (el.checked) {
                            baqgl_vm.checkedData.push(el);
                        } else {
                            // avalon.each(baqgl_vm.checkedData, function (index, item) {
                            //     if (item.taskID == el.taskID) {
                            //         baqgl_vm.checkedData.splice(index, 1);
                            //     }
                            // });
                            baqgl_vm.checkedData = [];
                        }
                    }
                });
            }
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
        //重启任务
        restartDownloadTasksDialog() {
            if (baqgl_vm.checkedData.length == 0) {
                return;
            }
            restartTaskById.show = true;
        },
        restartDownloadTasks() {
            if (baqgl_vm.checkedData.length == 0) {
                return;
            }
            let param = [];
            avalon.each(baqgl_vm.checkedData, (index, el) => {
                if (el.status == '下载失败') {
                    param.push(el.taskID);
                }
            });
            ajax({
                url: '/gmvcs/baq/restartDownloadTasks',
                method: 'post',
                data:{"taskIds":param}
            }).then(result => {
                if (result.code != 0) {
                    showTips('error', '重启失败，请稍后再试');
                    return;
                } else {
                    showTips('success', result.msg);
                    baqgl_vm.checkedData = [];
                    baqgl_vm.searchBtn();
                    restartTaskById.show = false;
                    
                }
             });
        },
        // getCaseareaAll() {
        //     ajax({
        //         url: '/gmvcs/baq/casearea/all',
        //         method: 'get',
        //         data: {}
        //     }).then(result => {
        //         if (result.code != 0) {
        //             showTips('error', '获取办案中心失败，请稍后再试');
        //             return;
        //         }
        //         if (result.code == 0) {
        //             let ret_data = [];
        //             if (result.data != null && result.data.length != 0) {
        //                 avalon.each(result.data, function (index, item) {
        //                     let ret_obj = {};
        //                     ret_obj.value = item.caseAreaId;
        //                     ret_obj.label = item.name;

        //                     ret_data.push(ret_obj);
        //                 });
        //             }
        //             sbdjgl_vm.count_type_options = ret_data;
        //         }
        //     });
        // },
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
let rwcqDialog = avalon.define({
    $id: 'rwcqDialog',
    show: false,
    title: "视频下载状态",
    table_list: [],
    loading: false,
    handleCancel(e) {
        this.show = false;
    },
    
});
let opt_restartrw_baqspccrw = avalon.define({
    $id: 'opt_restartrw_baqspccrw',   
    restartTaskById(record) {

        if (record.oparate != '重启') { return;}
        ajax({
            url: '/gmvcs/baq/restartFileDownloadTask?fileTaskId=' + record.fileTaskId,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '重启失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                showTips('success', '成功重启！');
                baqgl_vm.checkedData = [];
                baqgl_vm.searchBtn();
                opt_restart_baqspccrw.queryDownloadTask(opt_restart_baqspccrw.selectRecord.taskID); 
            }
        });    
    }
});
let opt_restart_baqspccrw = avalon.define({
    $id: 'opt_restart_baqspccrw',
    rwCheckStr: false,    
    selectRecord:{},
    handleLook(record) {
        opt_restart_baqspccrw.selectRecord = record;
        if (!baqgl_vm.authority.CHECK) { return;}
        rwcqDialog.show = true;
        opt_restart_baqspccrw.queryDownloadTask(record.taskID);   
    },  
    queryDownloadTask(taskId) {
        ajax({
            url: '/gmvcs/baq/queryDownloadTask?taskId=' + taskId,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '查看失败，请联系管理员');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                avalon.each(result.data, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = index+1; //行序号                    
                    ret_data[index].startTime = moment(item.startTime).format("YYYY-MM-DD HH:mm:ss"); //
                    ret_data[index].endTime = moment(item.endTime).format("YYYY-MM-DD HH:mm:ss"); //
                    //任务状态，00未开始，01下载中，02下载失败，10任务完成，99不限
                    switch (item.status) {
                        case '00':
                            ret_data[index].status = "未开始";
                            ret_data[index].oparate = "-";
                            break;
                        case '01':
                            ret_data[index].status = "下载中";
                            ret_data[index].oparate = "-";
                            break;
                        case '02':
                            ret_data[index].status = "下载失败";
                            ret_data[index].oparate = "重启";
                            if (baqgl_vm.authority.CQ) {
                                ret_data[index].oparate = "重启";
                            } else {
                                ret_data[index].oparate = "无权重启";
                            }
                            break;
                        case '10':
                            ret_data[index].status = "任务完成";
                            ret_data[index].oparate = "-";
                            break;
                    }
                });
                rwcqDialog.table_list = [];
                rwcqDialog.table_list = ret_data;                
            }
        });
    }
});
let count_type_vm = avalon.define({
    $id: 'baqspccrw_rwzt',
    curType: "99",
    //  count_type_options: [],任务状态，00未开始，01下载中，02下载失败，10任务完成，99不限
    count_type_options: [{
            value: "99",
            label: "不限"
        },
        {
            value: "00",
            label: "未开始"
        }, {
            value: "01",
            label: "下载中"
        }, {
            value: "02",
            label: "下载失败"
        }, {
            value: "10",
            label: "任务完成"
        }
    ],
    count_type: ["99"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

//重启任务
let restartTaskById = avalon.define({
    $id: 'restartTaskById',
    show: false,
    deleteArr: [],
    showDeleteModal() {
        this.show = true;
    },
    handleCancel() {
        this.show = false;
    },
    handleOk() {
        baqgl_vm.restartDownloadTasks();
    }
});

function changeStatus(status) {
    let ret_data = {};
    switch (status) {
        case '00':
            ret_data.status = "未开始";
            ret_data.oparate = "-";
            break;
        case '01':
            ret_data.status = "下载中";
            ret_data.oparate = "-";
            break;
        case '02':
            ret_data.status = "下载失败";
            ret_data.oparate = "重启";
            if (baqgl_vm.authority.CQ) {
                ret_data.oparate = "重启";
            } else {
                ret_data.oparate = "无权重启";
            }
            break;
        case '10':
            ret_data.status = "任务完成";
            ret_data.oparate = "-";
            break;
    }

    return ret_data;
}