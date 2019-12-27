/*
 * @Author: xuanyanqing 
 * @Date: 2019-01-07 09:59:33 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-08-07 17:02:16
 */

import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';

let storage = require('/services/storageService.js').ret;
export const name = "jdzxpt-dxcc-fxccf";
require("./jdzxpt-dxcc-fxccf.less");
import '/apps/common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';
import { JdzxptControl } from '/apps/common/common-jdzxpt-control.js';

let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    dep_switch,
    includedStatus,
    isTableSearch
} = require('/services/configService');

let fxccf_vm,
    controlModel = null;

avalon.component(name, {
    template: __inline("./jdzxpt-dxcc-fxccf.html"),
    defaults: {
        key_dep_switch: dep_switch,
        // 总变量
        // 中英文显示文字
        fxccf_language: getLan(),
        // true为英文 false为中文
        extra_class: languageSelect == "en" ? true : false,

        // 搜索框 search_box 变量
        //true 包含子部门；false 不包含子部门
        included_status: includedStatus,
        // 是否包含子部门选择框 选中与不选中图片地址
        included_dep_img: "",
        // 姓名/警号
        police_id: "",
        police_id_title: getLan().rlbkInputTips,
        police_id_close: false,
        //违法地点
        wfdz: "", 
        wfdz_title: getLan().rlbkInputTips,
        wfdz_close: false,
        //决定书编号
        jdsbh: "", 
        jdsbh_title: getLan().rlbkInputTips,
        jdsbh_close: false,
        //车牌号码
        hphm: "", 
        hphm_title: getLan().rlbkInputTips,
        hphm_close: false,
        // 搜索信息
        search_data: {},
        // 部门树 是否初始化完毕
        tree_init: false,
        // 部门树
        fxccf_tree_vm: avalon.define({
            $id: "dxcc_fxccf_tree",
            tree_data: [],
            tree_key: "",
            tree_title: "",
            tree_code: "",
            curTree: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
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
                        errorTip(result.msg, getLan().tip);
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
        //关联媒体
        jdzxpt_dxcc_fxccf_glmt: avalon.define({
            $id: 'jdzxpt_dxcc_fxccf_glmt',
            glmt_options: [{
                value: "99",
                label: getLan().all
            }, {
                value: "1",
                label: getLan().associated
            }, {
                value: "0",
                label: getLan().unrelated
            }],
            glmt: ['99'],
            onChangeglmt(e) {
                let _this = this;
                _this.glmt[0] = e.target.value;
            }
        }),
        //考评结果
        jdzxpt_dxcc_fxccf_kpjg: avalon.define({
            $id: 'jdzxpt_dxcc_fxccf_fxccfkpQjzb_kpjg',
            evaResult_options: [{
                value: "ALL",
                label: getLan().all
            }, {
                value: "1",
                label: getLan().pass
            }, {
                value: "0",
                label: getLan().unsanction
            }, {
                value: "NONE",
                label: getLan().noAssessment
            }],
            evaResult: ['ALL'],
            onChangeevaResult(e) {
                let _this = this;
                _this.evaResult[0] = e.target.value;
            }
        }),
        //核查结果
        jdzxpt_dxcc_fxccf_hcjg: avalon.define({
            $id: 'jdzxpt_dxcc_fxccf_fxccfkpQjzb_hcjg',
            reviewResult_options: [{
                value: "ALL",
                label: getLan().all
            }, {
                value: "1",
                label: getLan().true
            }, {
                value: "0",
                label: getLan().notTrue
            }, {
                value: "NONE",
                label: getLan().noVerification
            }],
            reviewResult: ['ALL'],
            onChangereviewResult(e) {
                let _this = this;
                _this.reviewResult[0] = e.target.value;
            }
        }),
        // 查询操作
        opt_fxccf: avalon.define({
            $id: "dxcc_opt_fxccf",
            authority: { // 按钮权限标识
                "SEARCH": false, //查询
            }
        }),

        // 表格  aj_table 变量
        // 查看操作
        opt_look: avalon.define({
            $id: "dxcc_fxccf_opt_look",
            lookTxt: getLan().check,
            onClick(record) {
                let obj = {
                    type: "fxccf",
                    id: record.xh,
                    path: "/jdzxpt-dxcc-fxccf",
                };
                storage.setItem("jdzxpt-kphc-detail", obj);
                avalon.history.setHash("/jdzxpt-kphc-detail");
            },
            authority: { // 按钮权限标识
                "HC": false, //核查
                "SEARCH": false, //查询
            }
        }),
        // 表格信息
        table_list: [],
        // false为正在加载 true为加载完毕
        loading: false,

        // 分页 变量
        // 是否更新页码
        change_page: false,
        // 当前页表格相关信息
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0
        },
        //false 显示总条数; true 显示大于多少条
        page_type: false,
        
        // 总方法
        onInit(e) {
            let deptemp = [];
            fxccf_vm = e.vmodel;
            controlModel = new JdzxptControl(fxccf_vm);
            this.tree_init = false;
            let storage_item = storage.getItem('jdzxpt-dxcc-fxccf');
            this.$watch("included_status", (v) => {
                this.included_dep_img = v ? "/static/image/xtpzgl-yhgl/selectYes.png?__sprite" : "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
            });
            if (isTableSearch) {
                this.$watch("tree_init", (v) => {
                    if (v && fxccf_vm.tree_init) {
                        !$.isEmptyObject(controlModel.data) ? fxccf_vm.searchBtn() : storage_item ? fxccf_vm.getTableList() : fxccf_vm.searchBtn();
                    }
                });
            }
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    errorTip(getLan().errorTip, getLan().tip);
                    return;
                }
                getDepTree(result.data, deptemp);
                fxccf_vm.fxccf_tree_vm.tree_data = deptemp;
                if (storage_item) {
                    fxccf_vm.fxccf_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    fxccf_vm.fxccf_tree_vm.tree_key = storage_item.tree_key;
                    fxccf_vm.fxccf_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    fxccf_vm.fxccf_tree_vm.tree_code = deptemp[0].path;
                    fxccf_vm.fxccf_tree_vm.tree_key = deptemp[0].key;
                    fxccf_vm.fxccf_tree_vm.tree_title = deptemp[0].title;
                }
                fxccf_vm.tree_init = true;
            });
            if (storage_item) {
                // 保存时间选择框选中项
                if (fxccf_time_range.range_flag == 2) {  // 自定义时间
                    fxccf_time_range.select_time = true;
                    fxccf_time_range.time_range = ["2"];
                } else if (fxccf_time_range.range_flag !== 2) {  // 本周或本月
                    fxccf_time_range.select_time = false;
                    fxccf_time_range.time_range[0] = fxccf_time_range.range_flag.toString();
                }
                fxccf_startTime_vm.fxccf_startTime = moment(storage_item.ajax_data.wfsjStart).format("YYYY-MM-DD");
                fxccf_endTime_vm.fxccf_endTime = moment(storage_item.ajax_data.wfsjEnd).format("YYYY-MM-DD");
                this.included_status = storage_item.ajax_data.includeChild;
                this.police_id = storage_item.ajax_data.userCode || "";//警员
                this.police_id_title = this.police_id || fxccf_vm.fxccf_language.rlbkInputTips;
                this.wfdz = storage_item.ajax_data.wfdz || "";//违法地点
                this.wfdz_title = this.wfdz || fxccf_vm.fxccf_language.rlbkInputTips;
                this.hphm = storage_item.ajax_data.hphm || "";//车牌号码
                this.hphm_title = this.hphm || fxccf_vm.fxccf_language.rlbkInputTips;
                this.jdsbh = storage_item.ajax_data.jdsbh || "";//决定书编号
                this.jdsbh_title = this.jdsbh || fxccf_vm.fxccf_language.rlbkInputTips;
                this.search_data = storage_item.ajax_data;
                this.search_data.beginTime = getTimeByDateStr(moment(storage_item.ajax_data.wfsjStart).format("YYYY-MM-DD"));
                this.search_data.endTime = getTimeByDateStr(moment(storage_item.ajax_data.wfsjEnd).format("YYYY-MM-DD"));
                // this.loading = true;
                this.change_page = true;
                this.table_pagination.current = storage_item.ajax_data.page + 1;
            } else {
                this.included_status = includedStatus;
                this.police_id = "";
                this.wfdz = "";
                this.hphm = "";
                this.jdsbh = "";
                this.search_data = {};
                this.change_page = false;
            }
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.JDZX_FUNC_JDZXXT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^EVA_FUNCTION_JDKP_DXCC_FXCCF/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "EVA_FUNCTION_JDKP_DXCC_FXCCF_SEARCH":
                            _this.opt_fxccf.authority.SEARCH = true;
                            _this.opt_look.authority.SEARCH = true;
                            break;
                        case "EVA_FUNCTION_JDKP_DXCC_FXCCF_HC":
                            _this.opt_look.authority.HC = true;
                            break;
                    }
                });
            });
        },

        // 搜索框 search_box 方法
        // 选择是否包含子部门选择框
        clickBranchBack(e) {
            this.included_status = e;
        },
        // input框输入
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    this.police_id_title = e.target.value != "" ? e.target.value : fxccf_vm.fxccf_language.rlbkInputTips;
                    break;
                case 'wfdz':
                    this.wfdz_title = e.target.value != "" ? e.target.value : fxccf_vm.fxccf_language.rlbkInputTips;
                    break;
                case 'jdsbh':
                    this.jdsbh_title = e.target.value != "" ? e.target.value : fxccf_vm.fxccf_language.rlbkInputTips;
                    break;
                case 'hphm':
                    this.hphm_title = e.target.value != "" ? e.target.value : fxccf_vm.fxccf_language.rlbkInputTips;
                    break;
            }
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        // input框点击关闭按钮
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id = "";
                    _this.police_id_title = fxccf_vm.fxccf_language.rlbkInputTips;
                    return false;
                    break;
                case 'wfdz':
                    _this.wfdz = "";
                    _this.wfdz_title = fxccf_vm.fxccf_language.rlbkInputTips;
                    return false;
                    break;
                case 'jdsbh':
                    _this.jdsbh = "";
                    _this.jdsbh_title = fxccf_vm.fxccf_language.rlbkInputTips;
                    return false;
                    break;
                case 'hphm':
                    _this.hphm = "";
                    _this.hphm_title = fxccf_vm.fxccf_language.rlbkInputTips;
                    return false;
                    break;
            }
        },
        // input框聚焦
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .police_id").width($(".fxccf_input_panel").innerWidth() - 33);
                    break;
                case 'wfdz':
                    _this.wfdz_close = true;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .wfdz").width($(".fxccf_input_panel").innerWidth() - 33);
                    break;
                case 'jdsbh':
                    _this.jdsbh_close = true;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .jdsbh").width($(".fxccf_input_panel").innerWidth() - 33);
                    break;
                case 'hphm':
                    _this.hphm_close = true;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .hphm").width($(".fxccf_input_panel").innerWidth() - 33);
                    break;
            }
        },
        // input框失去焦点
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .police_id").width($(".fxccf_input_panel").innerWidth() - 23);
                    break;
                case 'wfdz':
                    _this.wfdz_close = false;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .wfdz").width($(".fxccf_input_panel").innerWidth() - 23);
                    break;
                case 'jdsbh':
                    _this.jdsbh_close = false;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .jdsbh").width($(".fxccf_input_panel").innerWidth() - 23);
                    break;
                case 'hphm':
                    _this.hphm_close = false;
                    $(".jdzxpt-dxcc-fxccf .dataFormBox .hphm").width($(".fxccf_input_panel").innerWidth() - 23);
                    break;
            }
        },
        // 查询
        searchBtn() {
            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数

            controlModel.pageSetInit(this.fxccf_tree_vm, {
                optionVm: fxccf_time_range,
                startTimeVm: fxccf_startTime_vm,
                endTimeVm: fxccf_endTime_vm
            });
            controlModel.releaseData();
            
            this.getTableList();
        },
        
        // 表格  aj_table 方法
        // 获取及渲染表格信息
        getTableList() {
            this.loading = true;
            let start_time, end_time;
            start_time = fxccf_startTime_vm.fxccf_startTime;
            end_time = fxccf_endTime_vm.fxccf_endTime;
            let ajax_data = {
                "includeChild": this.included_status,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": fxccf_vm.fxccf_tree_vm.curTree || fxccf_vm.fxccf_tree_vm.tree_code,
                "wfsjStart": getTimeByDateStr(start_time),
                "wfsjEnd": getTimeByDateStr(end_time, true),
                "glmt": fxccf_vm.jdzxpt_dxcc_fxccf_glmt.glmt[0], 
            };
            if (fxccf_vm.jdzxpt_dxcc_fxccf_kpjg.evaResult[0] == "NONE") { // 未考评
                ajax_data.evaStatus = "0";
            } else if (fxccf_vm.jdzxpt_dxcc_fxccf_kpjg.evaResult[0] !== "NONE") { //已考评或不限定
                ajax_data.evaResult = fxccf_vm.jdzxpt_dxcc_fxccf_kpjg.evaResult[0];
            }
            if (fxccf_vm.jdzxpt_dxcc_fxccf_hcjg.reviewResult[0] == "NONE") { // 未核查
                ajax_data.reviewStatus = "0";
            } else if (fxccf_vm.jdzxpt_dxcc_fxccf_hcjg.reviewResult[0] !== "NONE") { //已核查或不限定
                ajax_data.reviewResult = fxccf_vm.jdzxpt_dxcc_fxccf_hcjg.reviewResult[0];
            }
            ajax_data.userCode = fxccf_vm.police_id ? $.trim(fxccf_vm.police_id) : "";//警号/姓名
            ajax_data.wfdz = fxccf_vm.wfdz ? $.trim(fxccf_vm.wfdz) : "";//违法地点
            ajax_data.hphm = fxccf_vm.hphm ? $.trim(fxccf_vm.hphm) : "";//车牌号码
            ajax_data.jdsbh = fxccf_vm.jdsbh ? $.trim(fxccf_vm.jdsbh) : "";//决定书编号
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_data = ajax_data;
            }
            ajax({
                url: '/gmvcs/audio/surveil/search/eva',
                method: 'post',
                data: ajax_data
            }).then(result => {
                let _this = this;
                if (result.code != 0) {
                    this.loading = false;
                    warnTip(result.msg, getLan().tip);
                    return;
                }
                showData(ajax_data, result, _this);
            });
        },

        // 分页 方法
        // 更改页码
        handlePageChange(currentPage) {
            this.change_page = true;
            this.table_pagination.current = currentPage;
            // this.loading = true;
            this.getTableList();
        },
        // 获取当前页码
        getCurrent(current) {
            this.table_pagination.current = current;
        },
    }
});

let fxccf_time_range = avalon.define({
    $id: 'dxcc_fxccf_time_range',
    select_time: false,
    time_range_options: [{
        value: "0",
        label: getLan().week
    }, {
        value: "1",
        label: getLan().month
    }, {
        value: "2",
        label: getLan().customize
    }],
    time_range: ["0"],
    range_flag: 0,
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0){
            _this.range_flag = 0;
            _this.time_range[0] = "0";
            fxccf_endTime_vm.fxccf_endTime = moment().format('YYYY-MM-DD');
            fxccf_startTime_vm.fxccf_startTime = moment().isoWeekday(1).format('YYYY-MM-DD'); //本周
        }
        if (e.target.value == 1){
            _this.range_flag = 1;
            _this.time_range[0] = "1";
            fxccf_endTime_vm.fxccf_endTime = moment().format('YYYY-MM-DD');
            fxccf_startTime_vm.fxccf_startTime = moment().dates(1).format('YYYY-MM-DD'); //本月
        }
        if (e.target.value == 2) {
            _this.range_flag = 2;
            _this.time_range[0] = "2";
            fxccf_endTime_vm.end_null = "none";
            fxccf_endTime_vm.fxccf_endTime = moment().format('YYYY-MM-DD');
            fxccf_startTime_vm.start_null = "none";
            fxccf_startTime_vm.fxccf_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else {
            _this.select_time = false;
        }
    }
});

let fxccf_startTime_vm = avalon.define({
    $id: "dxcc_fxccf_startTime",
    fxccf_startTime:  moment().isoWeekday(1).format('YYYY-MM-DD'), //本周
    handlerChange(e) {
        this.fxccf_startTime = e.target.value;
    }
});

let fxccf_endTime_vm = avalon.define({
    $id: "dxcc_fxccf_endTime",
    fxccf_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.fxccf_endTime = e.target.value;
    }
});

// ------------function---------------

// 获取中英文显示字段
function getLan() {
    return language_txt.jdzxpt.jdzxpt_dxcc_sjcc;
}

// 获取部门树
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

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    if (end_flag == true) {
        s2 = ["23", "59", "59"];
    }
    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();
}

// 错误提示信息
function errorTip(message, title) {
    notification.error({
        message: message,
        title: title
    });
}

// 警告提示信息
function warnTip(message, title) {
    notification.warn({
        message: message,
        title: title
    });
}

// 显示表格数据
function showData(ajax_data, result, _this) {
    let ret_data = [];
    let temp_data = {
        "page": ajax_data.page,
        "pageSize": ajax_data.pageSize,
        "orgPath": ajax_data.orgPath,
        "includeChild": ajax_data.includeChild,
        "wfsjStart": ajax_data.wfsjStart,
        "wfsjEnd": ajax_data.wfsjEnd,
        "glmt": ajax_data.glmt,
        "userCode": ajax_data.userCode || "",
        "wfdz": ajax_data.wfdz || "",
        "hphm": ajax_data.hphm || "",
        "jdsbh": ajax_data.jdsbh || "",
    };
    if (ajax_data.evaResult) {
        temp_data.evaResult = ajax_data.evaResult;
    }
    if (ajax_data.reviewResult) {
        temp_data.reviewResult = ajax_data.reviewResult;
    }
    if (ajax_data.evaStatus) {
        temp_data.evaStatus = ajax_data.evaStatus;
    }
    if (ajax_data.reviewStatus) {
        temp_data.reviewStatus = ajax_data.reviewStatus;
    }
    if (!result.data.overLimit && result.data.totalElements == 0) {
        _this.table_pagination.current = 0;
        _this.table_pagination.total = 0;
        _this.table_list = [];
        _this.loading = false;
        let storage_item = {
            "ajax_data": temp_data,
            "result": result,
            "total": 0,
            "tree_key": fxccf_vm.fxccf_tree_vm.tree_key,
            "tree_title": fxccf_vm.fxccf_tree_vm.tree_title
        };
        storage.setItem('jdzxpt-dxcc-fxccf', storage_item, 0.5);
        return;
    }
    if (!_this.change_page) {
        _this.table_pagination.current = 1;
    }
    let temp = (_this.table_pagination.current - 1) * _this.table_pagination.pageSize + 1;
    if (result.data.overLimit) {
        _this.page_type = true;
        _this.table_pagination.total = result.data.limit * _this.table_pagination.pageSize; //总条数
    } else {
        _this.page_type = false;
        _this.table_pagination.total = result.data.totalElements; //总条数
    }
    let storage_item = {
        "ajax_data": temp_data,
        "result": result,
        "range_flag": fxccf_time_range.range_flag,
        "total": _this.table_pagination.total,
        "tree_key": fxccf_vm.fxccf_tree_vm.tree_key,
        "tree_title": fxccf_vm.fxccf_tree_vm.tree_title
    };
    storage.setItem('jdzxpt-dxcc-fxccf', storage_item, 0.5);
    avalon.each(result.data.currentElements, function (index, item) {
        ret_data[index] = item;
        // if (dep_switch) {
        //     ajax({
        //         url: `/gmvcs/uap/org/getFullName?orgCode=${item.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
        //         method: 'get'
        //     }).then(result => {
        //         ret_data[index].orgCode = result.data;
        //     });
        // }
        ret_data[index].table_index = temp + index; //行序号
        ret_data[index].zqbm = item.orgName || "-";//执勤部门
        ret_data[index].wfsj = moment(item.wfsj).format("YYYY-MM-DD HH:mm:ss"); //违法时间
        ret_data[index].jy = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
        ret_data[index].cphm = item.hphm || "-";//车牌号码
        ret_data[index].jdsbh = item.jdsbh || "-";//决定书编号
        ret_data[index].wfdd = item.wfdz || "-";//违法地点
        ret_data[index].glmt = item.relation ? getLan().associated : getLan().unrelated;//关联媒体
        ret_data[index].evaResult = item.evaResult == "-" ? getLan().noAssessment : item.evaResult == "0" ? getLan().unsanction : getLan().pass;//考评结果
        ret_data[index].reviewResult = item.reviewResult == "-" ? getLan().noVerification : item.reviewResult == "0" ? getLan().notTrue : getLan().true;//核查结果
    });
    _this.table_list = ret_data;
    _this.loading = false;
}