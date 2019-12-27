import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '/services/menuService';
let language_txt = require('../../../vendor/language').language;
let {
    dep_switch,
    includedStatus,
    isTableSearch,
    apiUrl
} = require('/services/configService');
var storage = require('/services/storageService.js').ret;
import Sbzygl from '/apps/common/common-sbzygl';
let sbzygl = null;

export const name = "zfsypsjglpt-sypgl-zfjlysyp";
require("./zfsypsjglpt-sypgl-zfjlysyp.css");
let zfyps_vm,
    tableObject_zfypsjj = {},
    search_condition = {},
    local_storage = {
        "timeStamp": "",
        "ajax_data": {},
        "table_list": [],
        "list_total": "",
        "current_len": "",
        "list_totalPages": "",
        "range_flag": ""
    };
avalon.component(name, {
    template: __inline("./zfsypsjglpt-sypgl-zfjlysyp.html"),
    defaults: {
        key_dep_switch: dep_switch,
        zfsypsjglpt: language_txt.zfsypsjglpt.sypgl,
        zfyps_table_data: [],
        curPage: 1,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        record_item: {},
        selected_arr: [],
        media_info: {},

        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        included_dep_img: "/static/image/xtpzgl-yhgl/selectNo.png?__sprite",
        search_policeId_title: "支持姓名、警号查询",
        police_check: "",
        zfyps_close_policeId: false,

        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true
        // search_condition: {},
        delete_post_data: [],

        page_type: false, //fasle 显示总条数; true 显示大于多少条
        getCurrent(current) {
            this.table_pagination.current = current;
            this.curPage = current;
            // console.log("当前页码:" + this.table_pagination.current);
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
            // console.log("当前页面大小:" + this.table_pagination.pageSize);
        },
        handlePageChange(page) {
            this.change_page = true;
            this.curPage = page;
            this.table_pagination.current = page;
            tableObject_zfypsjj.page(page, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_zfypsjj.tableDataFnc([]);
            tableObject_zfypsjj.loading(true);
            this.get_table_list();
        },

        opt_jj: avalon.define({
            $id: "opt_jj",
            authority: { // 按钮权限标识
                "CHECK": false, //音视频库_执法仪拍摄_查看
                "SEARCH": false, //音视频库_执法仪拍摄_查询
                "EXPORT": false, //音视频库_执法仪拍摄_导出
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        yspkjj_tree: avalon.define({
            $id: "yspkjj_tree",
            yspk_data: [],
            // yspk_value: [],
            tree_key: "",
            tree_title: "",
            // yspk_expandedKeys: [],
            tree_code: "",
            curTree: "",
            initCallBack(key) {
                zfyps_vm.jobtypeGet(key, true);
            },
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                zfyps_vm.jobtypeGet(e.node.key);
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

        //查询条件--岗位类别
        postVal: [],
        postOptions: [],
        onChangeP(event) {
            this.postVal[0] = event.target.value;
        },
        postFlag: '',
        //岗位类别下拉框数据获取
        jobtypeGet(orgId, flag) {
            ajax({
                url: '/gmvcs/uap/bstype/jobType?orgId=' + orgId,
                method: 'get',
                data: {}
            }).then(result => {
                let ret = result.data;
                if (ret && (ret.length > 0)) {
                    let optJs = [];
                    for (let i = 0; i < ret.length; i++) {
                        optJs[i] = new Object();
                        optJs[i].label = ret[i].name;
                        optJs[i].value = ret[i].code;
                    }
                    let obj = {
                        value: "0",
                        label: "不限"
                    };
                    optJs.unshift(obj);
                    this.postOptions = optJs;
                    this.postVal = [optJs[0].value];
                    if (flag && this.postFlag) {
                        this.postVal = [this.postFlag];
                        // this.postFlag = "";
                    }
                } else {
                    this.postOptions = [{
                        "label": "暂无岗位名称",
                        "value": "0"
                    }];
                    this.postVal = ['0'];
                }
            });
        },

        onInit(e) {
            set_size();
            zfyps_vm = e.vmodel;

            sbzygl = new Sbzygl(this);
            this.findUserNameDebounce = sbzygl.debounce((key) => {
                zfyps_vm.findPageByUserNameOrUserCodeOrAbbr(key);
            }, 300);

            tableObject_zfypsjj = $.tableIndex({ //初始化表格jq插件
                id: 'zfysypjj_table',
                tableBody: tableBody_zfyps
            });

            // orgKey = "";
            // orgPath = "";
            zfyps_man_type.curType = "";
            zfyps_vm.yspkjj_tree.curTree = "";
            // yspkjj_time_vm.time_select == "0";

            this.zfyps_table_data = [];
            tableObject_zfypsjj.tableDataFnc([]);
            tableObject_zfypsjj.loading(false);

            yspkjj_time_vm.select_time = false;
            yspkjj_time_vm.range_flag = 0;
            yspkjj_time_vm.time_range = ["0"];

            let init_data = storage.getItem("zfsypsjglpt-sypgl-zfjlysyp");
            neet_init = true; //判断是否需要初始化页面；true为重新从后台拿数据初始化，false为从Local Storage拿数据填充。

            // set_size();

            if (init_data) {
                if ((getTimestamp() - init_data.timeStamp) > 1800 || !init_data) //1800 = 30 * 60
                    neet_init = true;
                else {
                    neet_init = false;

                    zfyps_vm.yspkjj_tree.tree_key = init_data.tree_key;
                    zfyps_vm.yspkjj_tree.tree_title = init_data.tree_title;
                    // orgPath = init_data.ajax_data.orgPath;

                    yspkjj_time_vm.range_flag = init_data.range_flag;
                    yspkjj_time_vm.time_range = new Array(init_data.range_flag.toString());
                    if (yspkjj_time_vm.range_flag == 2) {
                        zfypsjj_startTime_vm.zfysypjj_startTime = init_data.ajax_data.psStartTime;
                        zfypsjj_endTime_vm.zfypsjj_endTime = init_data.ajax_data.psEndTime;
                        yspkjj_time_vm.select_time = true;
                    }
                    zfyps_man_type.man_type = new Array(init_data.ajax_data.policeType);
                    this.postFlag = init_data.ajax_data.jobType;

                    if (init_data.ajax_data.includeChild) {
                        this.included_status = true;
                        this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                    } else {
                        this.included_status = false;
                        this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                    }

                    // if (init_data.ajax_data.xzsj == "0") {
                    //     yspkjj_time_vm.time_select = "0";
                    //     yspkjj_time_vm.time_range_label = ["0"];
                    // } else {
                    //     yspkjj_time_vm.time_select = "1";
                    //     yspkjj_time_vm.time_range_label = ["1"];
                    // }

                    this.page_type = init_data.page_type;
                    this.curPage = init_data.ajax_data.page + 1;
                    this.table_pagination.current = init_data.ajax_data.page + 1;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.current_len = init_data.current_len;
                    this.table_pagination.totalPages = init_data.list_totalPages;
                    this.isSearch = true;
                    search_condition = {
                        "includeChild": init_data.ajax_data.includeChild,
                        "page": init_data.ajax_data.page,
                        "pageSize": init_data.ajax_data.pageSize,
                        "orgPath": init_data.ajax_data.orgPath,
                        // "xzsj": init_data.ajax_data.xzsj,
                        "policeType": init_data.ajax_data.policeType,
                        "jobType": init_data.ajax_data.jobType,
                        "psStartTime": getTimeByDateStr(init_data.ajax_data.psStartTime),
                        "psEndTime": getTimeByDateStr(init_data.ajax_data.psEndTime, true)
                    };

                    if (init_data.ajax_data.userCode) {
                        this.police_check = init_data.ajax_data.userCode;
                        search_condition.userCode = init_data.ajax_data.userCode;
                    }

                    this.zfyps_table_data = init_data.table_list;
                    // tableObject_zfypsjj.tableDataFnc(init_data.table_list);
                }
            }

            let deptemp = [];
            ajax({
                // url: '/api/dep_tree',
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

                getDepTree(result.data, deptemp);
                zfyps_vm.yspkjj_tree.yspk_data = deptemp;
                // zfyps_vm.yspkjj_tree.yspk_value = new Array(deptemp[0].key);
                // zfyps_vm.yspkjj_tree.yspk_expandedKeys = new Array(deptemp[0].key);
                zfyps_vm.yspkjj_tree.tree_code = deptemp[0].path;
                zfyps_vm.yspkjj_tree.tree_key = deptemp[0].key;
                zfyps_vm.yspkjj_tree.tree_title = deptemp[0].title;

                if (neet_init) {
                    // zfyps_vm.yspkjj_tree.yspk_value = new Array(deptemp[0].key);
                    isTableSearch && this.search_list();
                } else {
                    zfyps_vm.yspkjj_tree.tree_code = init_data.ajax_data.orgPath;
                    zfyps_vm.yspkjj_tree.tree_key = init_data.tree_key;
                    zfyps_vm.yspkjj_tree.tree_title = init_data.tree_title;
                }
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_SYPGL_ZFYSYP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".zfypsjj_tabCont").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_CHECK_JJ":
                            _this.opt_jj.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_SEARCH_JJ":
                            _this.opt_jj.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_EXPORT_JJ":
                            _this.opt_jj.authority.EXPORT = true;
                            break;
                    }
                });

                if (false == _this.opt_jj.authority.CHECK && false == _this.opt_jj.authority.DELETE)
                    _this.opt_jj.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == _this.opt_jj.authority.SEARCH)
                    $(".zfypsjj_tabCont").css("top", "34px");

            });
        },
        onReady() {
            let _this = this;

            set_size();
            if (storage.getItem("zfsypsjglpt-sypgl-zfjlysyp") && neet_init == false) {
                if (storage.getItem("zfsypsjglpt-yspk-zfypsFlag") == "true") {
                    _this.get_table_list();
                    storage.setItem('zfsypsjglpt-yspk-zfypsFlag', "false");
                } else {
                    tableObject_zfypsjj.tableDataFnc(this.zfyps_table_data);
                    tableObject_zfypsjj.loading(false);
                }
            }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_zfypsjj.setForm();
            });
        },
        onDispose() {
            this.isSearch = false;
            window.clearTimeout(search_timer);
            // window.clearTimeout(save_timer);
            // window.clearTimeout(change_timer);
            click_search = true;
            // click_save = true;
            // click_change = true;
            this.zfyps_table_data = [];
            tableObject_zfypsjj.destroy();
            // tableObject_zfypsjj.tableDataFnc([]);
        },
        select_table(record, selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        selectAll_table(selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        get_table_list() {
            let police_check_exp = new RegExp("^[a-zA-Z0-9\u4E00-\u9FA5-_]*$"); //正则判断名称
            if (!police_check_exp.test(this.police_check)) {
                this.zfyps_table_data = [];
                tableObject_zfypsjj.tableDataFnc([]);
                tableObject_zfypsjj.loading(false);

                notification.warn({
                    message: "姓名、警号应为中文，数字，字母，-，_构成，请重新输入！",
                    title: '通知'
                });
                return;
            }

            // if (this.police_check.length > 20) {
            //     this.zfyps_table_data = [];
            //     tableObject_zfypsjj.tableDataFnc([]);
            //     tableObject_zfypsjj.loading(false);

            //     notification.warn({
            //         message: "姓名、警号输入不能超过20个字符，请重新输入！",
            //         title: '通知'
            //     });
            //     return;
            // }

            let start_time, end_time;
            if (yspkjj_time_vm.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (yspkjj_time_vm.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (yspkjj_time_vm.range_flag == "2") {
                start_time = zfypsjj_startTime_vm.zfysypjj_startTime;
                end_time = zfypsjj_endTime_vm.zfypsjj_endTime;
            }

            let ajax_data = {
                "includeChild": this.included_status,
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": zfyps_vm.yspkjj_tree.curTree || zfyps_vm.yspkjj_tree.tree_code,
                "policeType": zfyps_man_type.curType || zfyps_man_type.man_type[0],
                "jobType": this.postVal[0] === "0" ? "" : this.postVal[0],
                "psStartTime": getTimeByDateStr(start_time),
                "psEndTime": getTimeByDateStr(end_time, true)
            };

            if (this.police_check)
                ajax_data.userCode = this.police_check;

            this.isSearch = true;
            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else
                search_condition = ajax_data;

            ajax({
                // url: '/api/table_list_jj',
                url: '/gmvcs/stat/l/search/statistics/pageable',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    this.zfyps_table_data = [];
                    tableObject_zfypsjj.tableDataFnc([]);
                    tableObject_zfypsjj.loading(false);
                    return;
                }
                this.selected_arr = [];
                let temp_data = {
                    "includeChild": ajax_data.includeChild,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "policeType": ajax_data.policeType,
                    "jobType": ajax_data.jobType,
                    // "xzsj": ajax_data.xzsj,
                    "psStartTime": start_time,
                    "psEndTime": end_time
                };

                if (!this.police_check)
                    temp_data.userCode = "";
                else
                    temp_data.userCode = ajax_data.userCode;

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_zfypsjj.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    tableObject_zfypsjj.tableDataFnc([]);
                    tableObject_zfypsjj.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.tree_key = zfyps_vm.yspkjj_tree.tree_key;
                    local_storage.tree_title = zfyps_vm.yspkjj_tree.tree_title;
                    local_storage.range_flag = yspkjj_time_vm.range_flag;
                    local_storage.table_list = [];
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    storage.setItem('zfsypsjglpt-sypgl-zfjlysyp', local_storage);
                    return;
                }

                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;

                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].orgId = item.orgId; //所属部门di
                    ret_data[index].orgPath = item.orgPath; //部门路径
                    ret_data[index].space = ""; //空title需要
                    ret_data[index].policeType = item.policeType; //人员类别code
                    ret_data[index].policeTypeName = item.policeTypeName || "-"; //人员类别name
                    ret_data[index].jobTypeName = item.jobTypeName || "-"; //人员类别name
                    ret_data[index].userName = item.userName; //警员
                    ret_data[index].userCode = item.userCode; // 警号（警员） 或者 身份证号（辅警）
                    ret_data[index].name_id = item.userName + "(" + item.userCode + ")"; //警员（警号）

                    //视频
                    ret_data[index].videoCount = item.videoCount; //视频数合计
                    ret_data[index].videoMatchCount = item.videoMatchCount; //业务关联
                    ret_data[index].videoKeyCount = item.videoKeyCount; //执法仪标记
                    ret_data[index].videoNoMark = item.videoNoMark; //无标记

                    //音频
                    ret_data[index].audioOnlyCount = item.audioOnlyCount; //音频数
                    ret_data[index].audioMatchCount = item.audioMatchCount; //业务关联
                    ret_data[index].audioKeyCount = item.audioKeyCount; //执法仪标记

                    //图片
                    ret_data[index].picOnlyCount = item.picOnlyCount; //图片数
                    ret_data[index].picMatchCount = item.picMatchCount; //业务关联
                    ret_data[index].picKeyCount = item.picKeyCount; //执法仪标记

                    ret_data[index].time_range = yspkjj_time_vm.range_flag; //时间范围
                    ret_data[index].startTime = start_time; //开始时间
                    ret_data[index].endTime = end_time; //结束时间
                    ret_data[index].includeChild = ajax_data.includeChild; //是否包含子部门
                    // ret_data[index].xzsj = ajax_data.xzsj; //时间选择为拍摄时间还是导入时间
                    ret_data[index].orgCode = item.orgCode;
                });
                let _this = this;
                // if (dep_switch && result.data.currentElements.length!= 0) {//黔西南 部门提示需求功能 开关
                // let times = 0;
                // var getFullName = new Promise(function(resolve, reject){
                //     avalon.each(result.data.currentElements, function (index, val) {
                //         ajax({
                //             url: `/gmvcs/uap/org/getFullName?orgCode=${val.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                //             method: 'get'
                //         }).then(res => {
                //             ret_data[index].orgCode = res.data;
                //             times = times + 1;
                //         }).then(function(){
                //             if(times >= result.data.currentElements.length-1) {
                //                 resolve('end');
                //             }
                //         });
                //     });
                // });
                // getFullName.then(x => {
                //     setTimeout(function(){
                // _this.zfyps_table_data = ret_data;
                // tableObject_zfypsjj.tableDataFnc(ret_data);
                // tableObject_zfypsjj.loading(false);
                // if (result.data.overLimit) {
                //     _this.page_type = true;

                //     _this.table_pagination.total = result.data.limit * _this.table_pagination.pageSize; //总条数
                //     _this.table_pagination.totalPages = result.data.limit; //总页数
                // } else {
                //     _this.page_type = false;

                //     _this.table_pagination.total = result.data.totalElements; //总条数
                //     _this.table_pagination.totalPages = result.data.totalPages; //总页数
                // }
                // _this.table_pagination.current_len = result.data.currentElements.length;

                // local_storage.timeStamp = getTimestamp();
                // local_storage.ajax_data = temp_data;
                // local_storage.tree_key = zfyps_vm.yspkjj_tree.tree_key;
                // local_storage.tree_title = zfyps_vm.yspkjj_tree.tree_title;
                // local_storage.range_flag = yspkjj_time_vm.range_flag;
                // local_storage.table_list = ret_data;
                // local_storage.page_type = _this.page_type;
                // local_storage.list_total = _this.table_pagination.total;
                // local_storage.current_len = _this.table_pagination.current_len;
                // local_storage.list_totalPages = _this.table_pagination.totalPages;
                // storage.setItem('zfsypsjglpt-sypgl-zfjlysyp', local_storage);
                // },100);
                // });
                // }else {
                // console.log(ret_data);
                this.zfyps_table_data = ret_data;
                tableObject_zfypsjj.tableDataFnc(ret_data);
                tableObject_zfypsjj.loading(false);

                // this.zfyps_table_data = ret_data;
                // tableObject_zfypsjj.tableDataFnc(ret_data);
                // tableObject_zfypsjj.loading(false);

                if (result.data.overLimit) {
                    this.page_type = true;

                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                    this.table_pagination.totalPages = result.data.limit; //总页数
                } else {
                    this.page_type = false;

                    this.table_pagination.total = result.data.totalElements; //总条数
                    this.table_pagination.totalPages = result.data.totalPages; //总页数
                }
                this.table_pagination.current_len = result.data.currentElements.length;

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.tree_key = zfyps_vm.yspkjj_tree.tree_key;
                local_storage.tree_title = zfyps_vm.yspkjj_tree.tree_title;
                local_storage.range_flag = yspkjj_time_vm.range_flag;
                local_storage.table_list = ret_data;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-sypgl-zfjlysyp', local_storage);
                // }
            });
        },
        clickBranchBack(e) {
            this.included_status = e;
        },
        isSearch: false,
        //导出按钮
        exportBtn() {
            // console.log(search_condition);
            if ($.isEmptyObject(search_condition)) {
                return;
            }
            let userCode = search_condition.userCode || "";
            let url = `//${window.location.host}${apiUrl}/gmvcs/stat/l/userfile/statistics/export?orgCode=&orgPath=${search_condition.orgPath}&includeChild=${search_condition.includeChild}&policeType=${search_condition.policeType}&jobType=${search_condition.jobType}&userCode=${userCode}&beginTime=${search_condition.psStartTime}&endTime=${search_condition.psEndTime}`;
            window.open(url, "_blank");
        },

        searchBtn() {
            if (click_search == true) {
                this.change_page = false;
                this.search_list();
                click_search = false;
                search_timer = setTimeout(function () {
                    click_search = true;
                }, 2000);
            }
        },
        search_list() {
            if (yspkjj_time_vm.range_flag == 2) {
                if (zfypsjj_startTime_vm.start_null == "inline-block" || zfypsjj_endTime_vm.end_null == "inline-block") {
                    return;
                }
                if (getTimeByDateStr(zfypsjj_startTime_vm.zfysypjj_startTime) > getTimeByDateStr(zfypsjj_endTime_vm.zfypsjj_endTime)) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = getTimeByDateStr(zfypsjj_endTime_vm.zfypsjj_endTime) - getTimeByDateStr(zfypsjj_startTime_vm.zfysypjj_startTime);
                if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                    notification.warn({
                        message: '时间间隔不能超过一年，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
            }

            this.curPage = 1;
            this.table_pagination.current = 1;
            tableObject_zfypsjj.page(1, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_zfypsjj.tableDataFnc([]);
            tableObject_zfypsjj.loading(true);
            this.get_table_list();
        },
        name_input_enter(e) {
            if (e.target.value != "") {
                this.search_policeId_title = e.target.value;
                this.findUserNameDebounce(e.target.value);
            } else
                this.search_policeId_title = "支持姓名、警号查询";

            if (e.keyCode == "13")
                this.searchBtn();
        },
        nameList:  [],
        // 去抖函数
        findUserNameDebounce: avalon.noop,
        findPageByUserNameOrUserCodeOrAbbr(key) {
            if(!key) {
                this.nameList = [];
                return;
            };
            let data ={
                "key": $.trim(key),
                "page":0,
                "pageSize":20 // 默认只查前面20条数据
            }
            ajax({
                url: '/gmvcs/uap/user/findPageByUserNameOrUserCodeOrAbbr',
                method: 'post',
                data: data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                if(result.data != null) {
                    this.nameList = result.data.currentElements;
                }
            });
        },
        nameClick(item) {
            this.police_check = item.userCode;
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.police_check = "";
                    _this.search_policeId_title = "支持姓名、警号查询";
                    _this.nameList = [];
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = true;
                    $(".zfsypsjglpt_yspk_zfypsjj .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 34);
                    _this.findPageByUserNameOrUserCodeOrAbbr(_this.police_check);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = false;
                    $(".zfsypsjglpt_yspk_zfypsjj .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 24);
                    setTimeout(() => {
                        _this.nameList = [];
                    }, 200)
                    break;
            }
        }
    }
});

//查询定时器
let search_timer;
let click_search = true;
//保存标注定时器
// let save_timer;
// let click_save = true;
//更改存储时间定时器
// let change_timer;
// let click_change = true;

let zfysypjj_table = avalon.define({
    $id: "zfsypsjglpt_yspk_zfypsjj_table",
    loading: false,
    actions(type, text, record, index) {
        zfyps_vm.record_item = record;
        if (type == "check_click") {
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-actions', true);
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-record', record);
            // storage.removeItem("zfypsjj-main-tableDrag-style");
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-main");
        }
    },
    handleSelect(record, selected, selectedRows) {
        zfyps_vm.select_table(record, selected, selectedRows);
    },
    handleSelectAll(selected, selectedRows) {
        zfyps_vm.selectAll_table(selected, selectedRows);
    }
});

let neet_init;
// orgKey = "",
// orgPath = "";

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

let zfyps_man_type = avalon.define({
    $id: 'zfyps_man_type',
    curType: "",
    man_type_options: [{
            value: "LEVAM_JYLB_ALL",
            label: "不限"
        }, {
            value: "LEVAM_JYLB_JY",
            label: "警员"
        },
        {
            value: "LEVAM_JYLB_FJ",
            label: "辅警"
        }
    ],
    man_type: ["LEVAM_JYLB_ALL"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

/* 主页面时间控制  start */
let yspkjj_time_vm = avalon.define({
    $id: 'zfypsjj_time_range',
    select_time: false,
    time_range_arr: [{
            value: "0",
            label: "拍摄时间"
        },
        {
            value: "1",
            label: "导入时间"
        }
    ],
    time_range_options: [{
            value: "0",
            label: "本周"
        },
        {
            value: "1",
            label: "本月"
        },
        {
            value: "2",
            label: "自定义时间"
        }
    ],
    // time_range_label: ["0"],
    time_range: ["0"],
    // time_select: "0",
    range_flag: 0,
    // onChangeL(e) {
    //     let _this = this;
    //     _this.time_select = e.target.value;
    // },
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            zfypsjj_endTime_vm.end_null = "none";
            zfypsjj_endTime_vm.zfypsjj_endTime = moment().format('YYYY-MM-DD');
            zfypsjj_startTime_vm.start_null = "none";
            zfypsjj_startTime_vm.zfysypjj_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let zfypsjj_startTime_vm = avalon.define({
    $id: "zfysypjj_startTime",
    start_null: "none",
    zfysypjj_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfysypjj_startTime = e.target.value;
        if (_this.zfysypjj_startTime == "") {
            _this.start_null = "inline-block";
            $(".zfyps_start_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.start_null = "none";
            $(".zfyps_start_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});

let zfypsjj_endTime_vm = avalon.define({
    $id: "zfypsjj_endTime",
    end_null: "none",
    zfypsjj_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfypsjj_endTime = e.target.value;
        if (_this.zfypsjj_endTime == "") {
            _this.end_null = "inline-block";
            $(".zfyps_end_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.end_null = "none";
            $(".zfyps_end_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});
/* 主页面时间控制  end */

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        // $(".zfsypsjglpt_yspk_zfypsjj").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        // $(".zfsypsjglpt_yspk_zfypsjj").height(740);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
    }
}

/*================== 时间控制函数 start =============================*/
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    // var s = stringTime.split(" ");
    // var s1 = s[0].split("-");
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    // if (s2.length == 2) {
    //     s2.push("00");
    // }
    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
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

//秒 转 00:00:00格式
function formatSeconds(value) {
    var second = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时
    var result = "";
    // alert(second);
    if (second >= 60) {
        minute = parseInt(second / 60);
        second = parseInt(second % 60);
        // alert(minute+"-"+second);
        if (minute >= 60) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    }
    if (hour < 10)
        hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    result = hour + ":" + minute + ":" + second;
    return result;
}
/*================== 时间控制函数 end =============================*/

// let tableObject_zfypsjj = $.tableIndex({ //初始化表格jq插件
//     id: 'zfysypjj_table',
//     controller: 'zfysypjj_table',
//     tableObj: zfysypjj_table,
//     currentPage: 1,
//     prePageSize: 20,
//     key: "rid"
// });
let tableBody_zfyps = avalon.define({ //表格定义组件
    $id: 'zfysypjj_table',
    data: [],
    key: 'rid',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    selection: [],
    isAllChecked: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'zfypsjj-tableDrag-style',
    debouleHead: ["table-index-thead", "zfypsjj_table_parent"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
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
        zfysypjj_table.handleSelectAll(e.target.checked, this.selection.$model);
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
        zfysypjj_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfysypjj_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});