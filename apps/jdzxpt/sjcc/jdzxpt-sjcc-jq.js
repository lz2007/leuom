/*
 * @Description: 监督中心-随机抽查-警情
 * @Author: liujunlue
 * @Date: 2019-01-02 11:46:19
 * @LastEditTime: 2019-01-09 11:56:49
 * @LastEditors: liujunlue
 */

import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import '/apps/common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';
export const name = "jdzxpt-sjcc-jq";
import "./jdzxpt-sjcc-jq.less";

let storage = require('/services/storageService.js').ret;
let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    prefixLevel,
    dep_switch,
    separator,
    includedStatus
} = require('/services/configService');
let jq_vm;

avalon.component(name, {
    template: __inline("./jdzxpt-sjcc-jq.html"),
    defaults: {
        key_dep_switch: dep_switch,
        jq_txt: getLan(),
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
            jq_vm = e.vmodel;
            this.resetDatepicker();
            this.tree_init = false;
            let storage_item = storage.getItem('jdzxpt-sjcc-jq');
            this.$watch("included_status", (v) => {
                if (v) {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                } else {
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                }
            });
            this.$watch("tree_init", (v) => {
                if (v && jq_vm.tree_init) {
                    if (storage_item) {
                        jq_vm.getTableList();
                    } else {
                        jq_vm.searchBtn();
                    }
                }
            });
            this.ajaxDepTree(storage_item);
            // if (storage_item) {
            //     if (storage_item.range_flag) {
            //         jq_time_range.time_range[0] = storage_item.range_flag.toString();
            //     }
            //     jq_startTime_vm.jq_startTime = storage_item.ajax_data.startTime;
            //     jq_endTime_vm.jq_endTime = storage_item.ajax_data.endTime;

            //     this.included_status = storage_item.ajax_data.includeChild;
            //     this.generateNum = storage_item.ajax_data.generateNum || ""; //生成条数
            //     this.generateNum_title = this.generateNum || jq_vm.jq_txt.supportPositiveIntegersAnd0;

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
                    if (/^EVA_FUNCTION_JDKP_SJCC_JQKP/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "EVA_FUNCTION_JDKP_SJCC_JQKP_SEARCH":
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
                jq_tree_vm.tree_data = deptemp;
                if (storage_item) {
                    jq_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    jq_tree_vm.tree_key = storage_item.tree_key;
                    jq_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    jq_tree_vm.tree_code = deptemp[0].path;
                    jq_tree_vm.tree_key = deptemp[0].key;
                    jq_tree_vm.tree_title = deptemp[0].title;
                }
                jq_vm.tree_init = true;
            });
        },
        //初始化页面时判断是否可生成
        ajaxIsCreated() {
            ajax({
                url: '/gmvcs/audio/policeSituation/random/result/empty',
                method: 'get',
                data: {}
            }).then(result => {
                jq_vm.isCreated = (result.data == true ? 1 : 2);
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
            this.startTime = jq_startTime_vm.jq_startTime;
            this.endTime = jq_endTime_vm.jq_endTime;
            let ajax_data = {
                "endTime": getTimeByDateStr(this.endTime, true),
                "includeChild": this.included_status,
                "orgPath": jq_tree_vm.curTree || jq_tree_vm.tree_code,
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
            ajax_data.orgName = jq_tree_vm.tree_title; //用于后台下次返回已生成的显示部门
            ajax_data.generateNum = -1; //只有当可生成并且输入框有值的时候，才不传-1值
            if (jq_vm.isCreated == 1 && jq_vm.generateNum) { //可生成的时候且输入框有值的时候
                ajax_data.generateNum = $.trim(jq_vm.generateNum);
            }
            if (jq_vm.generateNum > 100) {
                showTips('warn', '最多生成100条');
                this.loading = false;
                return;
            }
            this.ajaxTableData(ajax_data);
        },
        //请求接口获取表格数据
        ajaxTableData(ajax_data) {
            ajax({
                url: '/gmvcs/audio/policeSituation/random/generate',
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
                        "tree_key": jq_tree_vm.tree_key,
                        "tree_title": jq_tree_vm.tree_title
                    };
                    storage.setItem('jdzxpt-sjcc-jq', storage_item, 0.5);
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
                    //         url: `/gmvcs/uap/org/getFullName?orgCode=${item.data.handlers[0].cjdw}&prefixLevel=${prefixLevel}&separator=${separator}`,
                    //         method: 'get'
                    //     }).then(result => {
                    //         ret_data[index].handlers[0].cjdw = result.data;
                    //     });
                    // }
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].bjsj = moment(item.data.bjsj).format("YYYY-MM-DD HH:mm:ss"); //报警时间
                    ret_data[index].relation = item.relation == true ? "已关联" : "未关联"; //关联媒体
                    ret_data[index].evaStatus = item.evaStatus == true ? "已考评" : "未考评"; //考评状态
                    ret_data[index].reviewStatus = item.reviewStatus == true ? "已核查" : "未核查"; //核查状态
                    //先赋值，相当于声明了该变量，防止undefined的出现
                    ret_data[index].cjdw = '';
                    ret_data[index].cjdwmc = '';
                    ret_data[index].name_id = '';
                    if (item.data.handlers) {
                        item.data.handlers.forEach((val, i, val_arr) => {
                            if (i != val_arr.length - 1) {
                                ret_data[index].cjdw += (val.cjdw + ","); //将处警单位用逗号拼接起来
                                ret_data[index].cjdwmc += (val.cjdwmc + ","); //将处警单位用逗号拼接起来
                                ret_data[index].name_id += ((val.cjrmc || "-") + "(" + (val.cjr || "-") + ")") + ","; //将姓名（警号）用逗号拼接起来
                            } else {
                                ret_data[index].cjdw += val.cjdw; //处警单位
                                ret_data[index].cjdwmc += val.cjdwmc; //处警单位
                                ret_data[index].name_id += (val.cjrmc || "-") + "(" + (val.cjr || "-") + ")"; //姓名（警号）
                            }
                        });
                    }
                    // console.log(ret_data[index].cjdw, ret_data[index].cjdwmc);
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
                //设置 头部显示的查询参数： 部门 抽查条数 时间范围
                jq_vm.depTreeTitle = result.data.criteria.orgName;
                jq_vm.generateNum = result.data.criteria.generateNum;
                jq_vm.startTime = moment(result.data.criteria.startTime).format("YYYY-MM-DD");
                jq_vm.endTime = moment(result.data.criteria.endTime).format("YYYY-MM-DD");
                //设置缓存
                let storage_item = {
                    "ajax_data": temp_data,
                    "range_flag": jq_time_range.range_flag,
                    "total": this.table_pagination.total,
                    "tree_key": jq_tree_vm.tree_key,
                    "tree_title": jq_tree_vm.tree_title
                };
                storage.setItem('jdzxpt-sjcc-jq', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'generateNum':
                    if (e.target.value != "") {
                        this.generateNum_title = e.target.value;
                    } else {
                        this.generateNum_title = jq_vm.jq_txt.supportPositiveIntegersAnd0;
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
                    this.generateNum_title = jq_vm.jq_txt.supportPositiveIntegersAnd0;
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
            jq_time_range.time_range[0] = "0";
            jq_time_range.range_flag = 0;
            jq_startTime_vm.jq_startTime = moment().isoWeekday(1).format('YYYY-MM-DD'); //本周
            jq_endTime_vm.jq_endTime = moment().format('YYYY-MM-DD');
        },
    }
});
//表格操作
let opt_look_vm = avalon.define({
    $id: "opt_look_jq",
    check_txt: getLan().check,
    authority: { // 按钮权限标识
        "SEARCH": false, //查询
    },
    onClick(record) {
        let obj = {
            type: "jqgl",
            id: record.jqbh,
            path: "/jdzxpt-sjcc-jq",
        };
        storage.setItem("jdzxpt-kphc-detail", obj);
        avalon.history.setHash("/jdzxpt-kphc-detail");
    },
})
//部门树
let jq_tree_vm = avalon.define({
    $id: "jq_tree",
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
let jq_time_range = avalon.define({
    $id: 'jq_time_range',
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
            jq_startTime_vm.jq_startTime = moment().isoWeekday(1).format('YYYY-MM-DD'); //本周
            jq_endTime_vm.jq_endTime = moment().format('YYYY-MM-DD');
        }
        if (e.target.value == 1) {
            jq_startTime_vm.jq_startTime = moment().dates(1).format('YYYY-MM-DD'); //本月
            jq_endTime_vm.jq_endTime = moment().format('YYYY-MM-DD');
        }
        if (e.target.value == 2) {
            jq_endTime_vm.end_null = "none";
            jq_endTime_vm.jq_endTime = moment().format('YYYY-MM-DD');
            jq_startTime_vm.start_null = "none";
            jq_startTime_vm.jq_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
        }
        this.range_flag = e.target.value;
        this.time_range[0] = e.target.value.toString();
    }
});
//起始时间
let jq_startTime_vm = avalon.define({
    $id: "jq_startTime",
    startTime_txt: getLan().pleaseChooseTheStartTime,
    jq_startTime: moment().isoWeekday(1).format('YYYY-MM-DD'), //本周
    handlerChange(e) {
        this.jq_startTime = e.target.value;
    },
});
//终止时间
let jq_endTime_vm = avalon.define({
    $id: "jq_endTime",
    endTime_txt: getLan().pleaseChooseTheEndTime,
    jq_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        this.jq_endTime = e.target.value;
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