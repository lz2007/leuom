/*
 * @Description: 监督中心-随机抽查-强制措施
 * @Author: liujunlue
 * @Date: 2019-01-02 11:46:19
 * @LastEditTime: 2019-01-09 17:56:29
 * @LastEditors: liujunlue
 */

import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import '../../common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';
export const name = "jdzxpt-sjcc-qzcs";
import "./jdzxpt-sjcc-qzcs.less";

let storage = require('/services/storageService.js').ret;
let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    prefixLevel,
    dep_switch,
    separator,
    includedStatus
} = require('/services/configService');
let qzcs_vm;

avalon.component(name, {
    template: __inline("./jdzxpt-sjcc-qzcs.html"),
    defaults: {
        key_dep_switch: dep_switch,
        qzcs_txt: getLan(),
        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        included_dep_img: "",
        depTreeTitle: "", //部门名称
        generateNum: "",
        generateNum_title: getLan().supportPositiveIntegersAnd0,
        generateNum_close: false,
        isCreated: 0, //是否已生成数据, 0: 表示还在加载， 1： 未生成 2： 已生成
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
        },
        onInit(e) {
            qzcs_vm = e.vmodel;
            this.resetDatepicker();
            this.tree_init = false;
            let storage_item = storage.getItem('jdzxpt-sjcc-qzcs');
            this.$watch("included_status", (v) => {
                if (v) {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                } else {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                }
            });
            this.$watch("tree_init", (v) => {
                if (v && qzcs_vm.tree_init) {
                    if (storage_item) {
                        qzcs_vm.getTableList();
                    } else {
                        qzcs_vm.searchBtn();
                    }
                }
            });
            this.ajaxDepTree(storage_item);
            // if (storage_item) {
            //     if (storage_item.range_flag) {
            //         qzcs_time_range.time_range[0] = storage_item.range_flag.toString();
            //     }
            //     qzcs_startTime_vm.qzcs_startTime = storage_item.ajax_data.startTime;
            //     qzcs_endTime_vm.qzcs_endTime = storage_item.ajax_data.endTime;

            //     this.included_status = storage_item.ajax_data.includeChild;
            //     this.generateNum = storage_item.ajax_data.generateNum || ""; //生成条数
            //     this.generateNum_title = this.generateNum || qzcs_vm.qzcs_txt.supportPositiveIntegersAnd0;

            //     // this.table_pagination.total = storage_item.total;
            //     this.loading = true;
            //     this.change_page = true;
            //     this.search_data = storage_item.ajax_data;
            //     this.search_data.startTime = getTimeByDateStr(storage_item.ajax_data.startTime);
            //     this.search_data.endTime = getTimeByDateStr(storage_item.ajax_data.endTime);

            //     this.table_pagination.current = storage_item.ajax_data.page + 1;

            //     // this.getTableList();
            // } else {
            //     this.included_status = false;
            //     this.generateNum = "";
            //     this.change_page = false;
            //     this.search_data = {};
            // }
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.JDZX_FUNC_JDZXXT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^EVA_FUNCTION_JDKP_SJCC_QZCS/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "EVA_FUNCTION_JDKP_SJCC_QZCS_SEARCH":
                            _this.authority.SEARCH = true;
                            opt_look_vm.authority.SEARCH = true;
                            break;
                    }
                });
                this.ajaxIsCreated();
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
                qzcs_tree_vm.tree_data = deptemp;
                if (storage_item) {
                    qzcs_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    qzcs_tree_vm.tree_key = storage_item.tree_key;
                    qzcs_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    qzcs_tree_vm.tree_code = deptemp[0].path;
                    qzcs_tree_vm.tree_key = deptemp[0].key;
                    qzcs_tree_vm.tree_title = deptemp[0].title;
                }
                qzcs_vm.tree_init = true;
            });
        },
        //初始化页面 判断是否可生成
        ajaxIsCreated() {
            ajax({
                url: '/gmvcs/audio/force/random/result/empty',
                method: 'get',
                data: {}
            }).then(result => {
                qzcs_vm.isCreated = (result.data == true ? 1 : 2);
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
            this.startTime = qzcs_startTime_vm.qzcs_startTime;
            this.endTime = qzcs_endTime_vm.qzcs_endTime;
            let ajax_data = {
                "endTime": getTimeByDateStr(this.endTime, true),
                "includeChild": this.included_status,
                "orgPath": qzcs_tree_vm.curTree || qzcs_tree_vm.tree_code,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "startTime": getTimeByDateStr(this.startTime),
            };
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_data = ajax_data;
            }
            ajax_data.orgName = qzcs_tree_vm.tree_title;
            ajax_data.generateNum = -1; //只有当可生成并且输入框有值的时候，才不传-1值
            if (qzcs_vm.isCreated == 1 && qzcs_vm.generateNum) { //可生成的时候且输入框有值的时候
                ajax_data.generateNum = $.trim(qzcs_vm.generateNum);
            }
            if (qzcs_vm.generateNum > 100) {
                showTips('warn', '最多生成100条');
                this.loading = false;
                return;
            }
            this.ajaxTableData(ajax_data);
        },
        //请求接口获取表格数据
        ajaxTableData(ajax_data) {
            ajax({
                url: '/gmvcs/audio/force/random/generate',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    showTips('warn', result.msg);
                    return;
                }
                //缓存请求的数据信息
                let temp_data = {
                    "endTime": this.endTime,
                    // "generateNum": ajax_data.generateNum == -1 ? "" : ajax_data.generateNum, //生成条数,-1这个值不保存
                    "includeChild": ajax_data.includeChild,
                    "orgPath": ajax_data.orgPath,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "startTime": this.startTime
                };
                if (!result.data.pageObject.overLimit && result.data.pageObject.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;
                    let storage_item = {
                        "ajax_data": temp_data,
                        "total": 0,
                        "tree_key": qzcs_tree_vm.tree_key,
                        "tree_title": qzcs_tree_vm.tree_title
                    };
                    storage.setItem('jdzxpt-sjcc-qzcs', storage_item, 0.5);
                    return;
                }
                if (!this.change_page) {
                    this.table_pagination.current = 1;
                }
                this.isCreated = result.data.randomGenerateAble == true ? 1 : 2;
                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.pageObject.currentElements, function (index, item) {
                    ret_data[index] = item.data;
                    // if (dep_switch) {//黔西南 部门提示需求功能 开关
                    //     ajax({
                    //         url: `/gmvcs/uap/org/getFullName?orgCode=${item.data.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                    //         method: 'get'
                    //     }).then(result => {
                    //         ret_data[index].orgCode = result.data;
                    //     });
                    // }
                    ret_data[index].table_index = temp + index; //行序号

                    ret_data[index].name_id = (item.data.userName || "-") + "(" + (item.data.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].wfsj = moment(item.data.wfsj).format("YYYY-MM-DD HH:mm:ss"); //违法时间
                    ret_data[index].relation = item.relation == true ? "已关联" : "未关联"; //关联媒体
                    ret_data[index].evaStatus = item.evaStatus == true ? "已考评" : "未考评"; //考评状态
                    ret_data[index].reviewStatus = item.reviewStatus == true ? "已核查" : "未核查"; //核查状态
                });
                if (result.data.pageObject.overLimit) {
                    this.page_type = true;
                    this.table_pagination.total = result.data.pageObject.limit * this.table_pagination.pageSize; //总条数
                } else {
                    this.page_type = false;
                    this.table_pagination.total = result.data.pageObject.totalElements; //总条数
                }
                this.table_list = ret_data;
                this.loading = false;
                //设置头部显示的查询参数： 部门 抽查条数 时间范围
                qzcs_vm.depTreeTitle = result.data.criteria.orgName;
                qzcs_vm.generateNum = result.data.criteria.generateNum;
                qzcs_vm.startTime = moment(result.data.criteria.startTime).format("YYYY-MM-DD");
                qzcs_vm.endTime = moment(result.data.criteria.endTime).format("YYYY-MM-DD");
                //设置缓存
                let storage_item = {
                    "ajax_data": temp_data,
                    "range_flag": qzcs_time_range.range_flag,
                    "total": this.table_pagination.total,
                    "tree_key": qzcs_tree_vm.tree_key,
                    "tree_title": qzcs_tree_vm.tree_title
                };
                storage.setItem('jdzxpt-sjcc-qzcs', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'generateNum':
                    if (e.target.value != "") {
                        this.generateNum_title = e.target.value;
                    } else {
                        this.generateNum_title = qzcs_vm.qzcs_txt.supportPositiveIntegersAnd0;
                    }
                    break;
            }
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        close_click(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum = "";
                    this.generateNum_title = qzcs_vm.qzcs_txt.supportPositiveIntegersAnd0;
                    return false;
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum_close = true;
                    break;
            }
        },
        input_blur(e) {
            switch (e) {
                case 'generateNum':
                    this.generateNum_close = false;
                    break;
            }
        },
        //重置时间组件,默认时间是本周
        resetDatepicker() {
            qzcs_time_range.time_range[0] = "0";
            qzcs_time_range.range_flag = 0;
            qzcs_startTime_vm.qzcs_startTime = moment().isoWeekday(1).format('YYYY-MM-DD'); //本周
            qzcs_endTime_vm.qzcs_endTime = moment().format('YYYY-MM-DD');
        },
    }
});
//表格操作
let opt_look_vm = avalon.define({
    $id: "opt_look_qzcs",
    check_txt: getLan().check,
    authority: { // 按钮权限标识
        "SEARCH": false, //查询
    },
    onClick(record) {
        let obj = {
            type: "qzcs",
            id: record.xh,
            path: "/jdzxpt-sjcc-qzcs",
        };
        storage.setItem("jdzxpt-kphc-detail", obj);
        avalon.history.setHash("/jdzxpt-kphc-detail");
    },
})
let qzcs_tree_vm = avalon.define({
    $id: "qzcs_tree",
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
//时间范围
let qzcs_time_range = avalon.define({
    $id: 'qzcs_time_range',
    time_range: ["0"],
    range_flag: 0,
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
    onChangeTR(e) {
        if (e.target.value == 0) {
            qzcs_startTime_vm.qzcs_startTime = moment().isoWeekday(1).format('YYYY-MM-DD'); //本周
            qzcs_endTime_vm.qzcs_endTime = moment().format('YYYY-MM-DD');
        }
        if (e.target.value == 1) {
            qzcs_startTime_vm.qzcs_startTime = moment().dates(1).format('YYYY-MM-DD'); //本月
            qzcs_endTime_vm.qzcs_endTime = moment().format('YYYY-MM-DD');
        }
        if (e.target.value == 2) {
            qzcs_endTime_vm.end_null = "none";
            qzcs_endTime_vm.qzcs_endTime = moment().format('YYYY-MM-DD');
            qzcs_startTime_vm.start_null = "none";
            qzcs_startTime_vm.qzcs_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
        }
        this.range_flag = e.target.value;
        this.time_range[0] = e.target.value.toString();
    }
});
//起始时间
let qzcs_startTime_vm = avalon.define({
    $id: "qzcs_startTime",
    startTime_txt: getLan().pleaseChooseTheStartTime,
    qzcs_startTime: moment().isoWeekday(1).format('YYYY-MM-DD'), //本周
    handlerChange(e) {
        this.qzcs_startTime = e.target.value;
    },
});
//终止时间
let qzcs_endTime_vm = avalon.define({
    $id: "qzcs_endTime",
    endTime_txt: getLan().pleaseChooseTheEndTime,
    qzcs_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        this.qzcs_endTime = e.target.value;
    },
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