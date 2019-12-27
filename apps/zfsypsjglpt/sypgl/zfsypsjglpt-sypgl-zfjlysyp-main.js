import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
let language_txt = require('../../../vendor/language').language;
import {
    versionSelection,
} from '/services/configService';
import moment from 'moment';
import * as menuServer from '/services/menuService';
var storage = require('/services/storageService.js').ret;
import Sbzygl from '/apps/common/common-sbzygl';
let sbzygl = null;

export const name = "zfsypsjglpt-sypgl-zfjlysyp-main";
require("./zfsypsjglpt-sypgl-zfjlysyp-main.less");
let {
    prefixLevel,
    dep_switch,
    separator
} = require('/services/configService');
let zfyps_vm,
    tableObject_zfypsjj_main = {},
    search_condition = {},
    local_storage = {
        "timeStamp": "",
        "ajax_data": {},
        "list_total": "",
        "current_len": "",
        "list_totalPages": "",
        "range_flag": ""
    };
avalon.component(name, {
    template: __inline("./zfsypsjglpt-sypgl-zfjlysyp-main.html"),
    defaults: {
        key_dep_switch: dep_switch,
        cancelText: "取消",
        modify_toggle: true,
        zfyps_dialog_show: false,
        zfsypsjglpt:language_txt.zfsypsjglpt.sypgl,
        // search_key: "",
        // search_key_title: "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询",
        included_status: false, //true 包含子部门；false 不包含子部门
        included_dep_img: "/static/image/xtpzgl-yhgl/selectNo.png?__sprite",
        table_status: "图表模式",
        table_status_flag: true, //true 对应列表模式，按钮显示图表模式；false 对应图表模式，按钮显示列表模式
        search_policeId_title: "支持姓名、警号查询",
        police_check: "",
        operation_type: "", //1 删除记录；2 批量删除纪录；3 单选删除时该记录为关联；4 多选时所有数据均为关联

        list_loading: false,
        zfyps_table_data: [],
        list_click(e) {
            $(".popover").hide();
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-tableStatus', zfyps_vm.table_status_flag);
            storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-detail', e);
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-detail");
        },
        delete_click(e) {
            // if (!e.file_status) {
            //     return;
            // }
            this.record_item = new Object(e);

            zfyps_vm.zfyps_dialog_width = 300;
            zfyps_vm.zfyps_dialog_height = 178;
            zfypsjj_common_dialog.txt_rows = false;

            if (e.is_rel) {
                zfyps_vm.operation_type = 3;
                zfypsjj_common_dialog.title = "提示";
                zfypsjj_common_dialog.dialog_txt = "关联数据需解除关联后才可删除！";
                zfyps_vm.cancelText = "关闭";

                zfyps_vm.zfyps_dialog_show = true;

                if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                    $(".zfyps_dialog_common").addClass("dialog_close");
            } else {
                zfyps_vm.operation_type = 1;
                zfypsjj_common_dialog.title = "确定删除";
                zfypsjj_common_dialog.dialog_txt = "是否确定删除选中的1条数据?";
                zfyps_vm.cancelText = "取消";

                zfyps_vm.zfyps_dialog_show = true;
            }
            return false;
        },

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
        delete_all_if: false,
        media_info: {},

        web_width: "",
        web_height: "",
        key_format: "none",
        name_format: "none",
        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true
        // search_condition: {},
        zfyps_close_key: false,
        zfyps_close_policeId: false,
        zfyps_dialog_width: 300,
        zfyps_dialog_height: 178,
        delete_post_data: [],
        tree_flag: false, //true 为1页(统计页面)跳到2页(查询详情列表页面)的初始化为true，其他为false

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
            tableObject_zfypsjj_main.page(page, this.table_pagination.pageSize);
            this.list_loading = true;
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);
            tableObject_zfypsjj_main.loading(true);
            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                this.someone_ajax();
            else
                this.get_table_list();
        },

        optjj_main: avalon.define({
            $id: "optjj_main",
            authority: { // 按钮权限标识
                "CHECK": false, //音视频库_执法仪拍摄_查看
                "DELETE": false, //音视频库_执法仪拍摄_删除
                "SEARCH": false, //音视频库_执法仪拍摄_查询
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        zfysyp_main_tree: avalon.define({
            $id: "zfysyp_main_tree",
            yspk_data: [],
            // yspk_value: [],
            tree_key: "",
            tree_title: "",
            // yspk_expandedKeys: [],
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
        version: versionSelection,
        onInit(e) {
            set_size();
            zfyps_vm = e.vmodel;

            sbzygl = new Sbzygl(this);
            this.findUserNameDebounce = sbzygl.debounce((key) => {
                zfyps_vm.findPageByUserNameOrUserCodeOrAbbr(key);
            }, 300);

            tableObject_zfypsjj_main = $.tableIndex({ //初始化表格jq插件
                id: 'zfypsjj_table',
                tableBody: tableBody_zfyps
            });

            // orgKey = "";
            // orgPath = "";
            filejj_logo_vm.curFile = "";
            zfypsjj_man_type.curType = "";
            mediajj_type_vm.curMedia = "";
            zfyps_vm.zfysyp_main_tree.curTree = "";
            mediajj_type_vm.jj_media_type = ["-1"];
            zfypsjj_man_type.police_type = ["LEVAM_JYLB_ALL"];
            filejj_logo_vm.file_type = ["0"];

            this.tree_flag = false;

            // this.list_loading = true;
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);
            tableObject_zfypsjj_main.loading(true);

            this.delete_all_if = false;
            this.table_status_flag = true;

            zfysypjj_time_range.time_select == "1";
            zfysypjj_time_range.time_range_label = ["1"];
            zfysypjj_time_range.select_time = false;
            zfysypjj_time_range.range_flag = 0;
            zfysypjj_time_range.time_range = ["0"];

            this.modify_toggle = true;

            zfyps_timely_import.timelyImportType = ["0"];
            zfyps_timely_import.importSelect = "0";

            let init_data = storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-main");
            let item_record = storage.getItem("zfsypsjglpt-yspk-zfypsjj-record");

            neet_init = true; //true为缓存超时，相当于重新刷新；false为从Local Storage拿数据填充，表格数据重新请求。

            // set_size();
            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) { //someone
                this.curPage = 1;
                this.table_pagination.current = 1;
                tableObject_zfypsjj_main.page(1, this.table_pagination.pageSize);
                // this.list_loading = true;
                this.zfyps_table_data = [];
                tableObject_zfypsjj_main.tableDataFnc([]);
                tableObject_zfypsjj_main.loading(true);

                if (item_record.policeType == "LEVAM_JYLB_ALL" || item_record.policeType == "LEVAM_JYLB_JY" || item_record.policeType == "LEVAM_JYLB_FJ")
                    zfypsjj_man_type.police_type = new Array(item_record.policeType);
                else
                    zfypsjj_man_type.police_type = ["LEVAM_JYLB_ALL"];

                this.police_check = item_record.userCode || "";

                if (item_record.includeChild) {
                    this.included_status = true;
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                } else {
                    this.included_status = false;
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                }

                zfysypjj_time_range.range_flag = item_record.time_range;
                zfysypjj_time_range.time_range = new Array(item_record.time_range.toString());
                this.tree_flag = true;
                zfyps_vm.zfysyp_main_tree.tree_code = item_record.orgPath;
                zfyps_vm.zfysyp_main_tree.tree_key = item_record.orgId;
                zfyps_vm.zfysyp_main_tree.tree_title = item_record.orgName;

                if (zfysypjj_time_range.range_flag == 2) {
                    zfypsjj_startTime_vm.zfypsjj_startTime = item_record.startTime;
                    zfypsjj_endTime_vm.zfysypjj_endTime = item_record.endTime;
                    zfysypjj_time_range.select_time = true;
                }
                neet_init = false;

                if (storage.getItem('zfsypsjglpt-yspk-zfypsjj-returnFlag')) {
                    this.table_status_flag = storage.getItem('zfsypsjglpt-yspk-zfypsjj-tableStatus');
                    if (this.table_status_flag) {
                        this.table_status = "图表模式";
                    } else
                        this.table_status = "列表模式";
                }

                this.someone_ajax();
            } else if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-returnFlag")) {
                storage.setItem("zfsypsjglpt-yspk-zfypsjj-returnFlag", false);
                if ((getTimestamp() - init_data.timeStamp) > 1800 || !init_data) { //1800 = 30 * 60              
                    neet_init = true;
                    // this.search_list();
                } else {
                    neet_init = false;
                    zfyps_vm.zfysyp_main_tree.tree_key = init_data.tree_key;
                    zfyps_vm.zfysyp_main_tree.tree_title = init_data.tree_title;
                    zfyps_vm.zfysyp_main_tree.curTree = init_data.ajax_data.orgPath;
                    // orgPath = init_data.ajax_data.orgPath;

                    zfysypjj_time_range.range_flag = init_data.range_flag;
                    zfysypjj_time_range.time_range = new Array(init_data.range_flag.toString());
                    if (zfysypjj_time_range.range_flag == 2) {
                        zfypsjj_startTime_vm.zfypsjj_startTime = init_data.ajax_data.startTime;
                        zfypsjj_endTime_vm.zfysypjj_endTime = init_data.ajax_data.endTime;
                        zfysypjj_time_range.select_time = true;
                    }
                    zfypsjj_man_type.police_type = new Array(init_data.ajax_data.policeType);
                    filejj_logo_vm.file_type = new Array(init_data.ajax_data.keyMark);
                    mediajj_type_vm.jj_media_type = new Array(init_data.ajax_data.type);

                    if (init_data.ajax_data.includeChild) {
                        this.included_status = true;
                        this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                    } else {
                        this.included_status = false;
                        this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";
                    }

                    if (init_data.ajax_data.timeType == "1") {
                        zfysypjj_time_range.time_select = "1";
                        zfysypjj_time_range.time_range_label = ["1"];
                    } else {
                        zfysypjj_time_range.time_select = "2";
                        zfysypjj_time_range.time_range_label = ["2"];
                    }

                    if (versionSelection == "Qianxinan") {
                        zfyps_timely_import.timelyImportType = [init_data.ajax_data.in24file];
                        zfyps_timely_import.importSelect = init_data.ajax_data.in24file;
                    }

                    // this.page_type = init_data.page_type;
                    this.curPage = init_data.ajax_data.page + 1;
                    this.table_pagination.current = init_data.ajax_data.page + 1;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.current_len = init_data.current_len;
                    this.table_pagination.totalPages = init_data.list_totalPages;

                    search_condition = {
                        "includeChild": init_data.ajax_data.includeChild,
                        "page": init_data.ajax_data.page,
                        "pageSize": init_data.ajax_data.pageSize,
                        "orgPath": init_data.ajax_data.orgPath,
                        "policeType": init_data.ajax_data.policeType,
                        "type": init_data.ajax_data.type,
                        "keyMark": init_data.ajax_data.keyMark,
                        "timeType": init_data.ajax_data.timeType,
                        "startTime": getTimeByDateStr(init_data.ajax_data.startTime),
                        "endTime": getTimeByDateStr(init_data.ajax_data.endTime)
                    };

                    if (init_data.ajax_data.jymc) {
                        this.police_check = init_data.ajax_data.jymc;
                        search_condition.jymc = init_data.ajax_data.jymc;
                    }
                    // tableObject_zfypsjj_main.tableDataFnc(this.zfyps_table_data);
                    // tableObject_zfypsjj_main.loading(false);
                    // _popover();

                    this.table_status_flag = storage.getItem('zfsypsjglpt-yspk-zfypsjj-tableStatus');
                    if (this.table_status_flag) {
                        this.table_status = "图表模式";
                    } else
                        this.table_status = "列表模式";

                    this.get_table_list();
                }
            } else if (storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-main-homePage")) { //从首页-及时导入率饼图跳进当前页面
                this.included_status = true; //从首页进来时，设置搜索条件为包含子部门
                let item = storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-main-homePage");
                if (item.typeSelect == "0") { //类型选择，0--24小时内导入（个）; 1--24小时后导入（个）
                    zfyps_timely_import.timelyImportType = ["1"];
                    zfyps_timely_import.importSelect = "1";
                } else {
                    zfyps_timely_import.timelyImportType = ["2"];
                    zfyps_timely_import.importSelect = "2";
                }

                mediajj_type_vm.curMedia = "0";
                mediajj_type_vm.jj_media_type = ["0"];

                if (item.timeSelect == "2") {
                    zfysypjj_time_range.range_flag = 1;
                } else if (item.timeSelect == "3") {
                    zfysypjj_time_range.range_flag = 2;
                    zfypsjj_startTime_vm.zfypsjj_startTime = moment().years() + "-01-01";
                    zfypsjj_endTime_vm.zfysypjj_endTime = moment().format('YYYY-MM-DD');
                    zfysypjj_time_range.select_time = true;
                } else {
                    zfysypjj_time_range.range_flag = 0;
                }
                zfysypjj_time_range.time_range = new Array(zfysypjj_time_range.range_flag.toString());
            } else if (storage.getItem("todos")) { //从首页-待办事项跳进当前页面
                let item = storage.getItem("todos");
                filejj_logo_vm.curFile = "5";
                filejj_logo_vm.file_type = ["5"];
                this.included_status = true;
                this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";

                if (item.text == "本月") {
                    zfysypjj_time_range.range_flag = 1;
                } else if (item.text == "本年") {
                    zfysypjj_time_range.range_flag = 2;
                    zfypsjj_startTime_vm.zfypsjj_startTime = moment(item.postObj.beginTime).format('YYYY-MM-DD');
                    zfypsjj_endTime_vm.zfysypjj_endTime = moment(item.postObj.endTime).format('YYYY-MM-DD');
                    zfysypjj_time_range.select_time = true;
                } else {
                    zfysypjj_time_range.range_flag = 0;
                }
                zfysypjj_time_range.time_range = new Array(zfysypjj_time_range.range_flag.toString());
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
                zfyps_vm.zfysyp_main_tree.yspk_data = deptemp;
                // zfyps_vm.zfysyp_main_tree.yspk_value = new Array(deptemp[0].key);
                // zfyps_vm.zfysyp_main_tree.yspk_expandedKeys = new Array(deptemp[0].key);
                if (neet_init) {
                    zfyps_vm.zfysyp_main_tree.tree_code = deptemp[0].path;
                    zfyps_vm.zfysyp_main_tree.tree_key = deptemp[0].key;
                    zfyps_vm.zfysyp_main_tree.tree_title = deptemp[0].title;
                    if (!storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) {
                        this.search_list();
                    }
                } else {
                    if (!this.tree_flag) {
                        zfyps_vm.zfysyp_main_tree.tree_code = init_data.ajax_data.orgPath;
                        zfyps_vm.zfysyp_main_tree.tree_key = init_data.tree_key;
                        zfyps_vm.zfysyp_main_tree.tree_title = init_data.tree_title;
                    }
                }

                if (this.tree_flag) {
                    zfyps_vm.zfysyp_main_tree.tree_code = item_record.orgPath;
                    zfyps_vm.zfysyp_main_tree.tree_key = item_record.orgId;
                    zfyps_vm.zfysyp_main_tree.tree_title = item_record.orgName;
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
                    $(".zfyps_main_tabCont").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_CHECK_JJ":
                            _this.optjj_main.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DELETE_JJ":
                            _this.optjj_main.authority.DELETE = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_SEARCH_JJ":
                            _this.optjj_main.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DOWNLOAD_JJ":
                            _this.optjj_main.authority.DOWNLOAD = true;
                            break;
                    }
                });

                if (false == _this.optjj_main.authority.CHECK && false == _this.optjj_main.authority.DELETE && false == _this.optjj_main.authority.DOWNLOAD)
                    _this.optjj_main.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == _this.optjj_main.authority.SEARCH)
                    $(".zfyps_main_tabCont").css("top", "34px");

                // _this.delete_all_if = true;
            });
        },
        onReady() {
            let _this = this;
            this.delete_all_if = true;

            set_size();
            // if (storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-main") && neet_init == false) {
            //     if (storage.getItem("zfsypsjglpt-yspk-zfypsFlag") == "true") {
            //         _this.get_table_list();
            //         storage.setItem('zfsypsjglpt-yspk-zfypsFlag', "false");
            //     } else {
            //         tableObject_zfypsjj_main.tableDataFnc(this.zfyps_table_data);
            //         tableObject_zfypsjj_main.loading(false);
            //         _popover();
            //     }
            // }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_zfypsjj_main.setForm();
                if (_this.zfyps_close_policeId)
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 34);
                else
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);

                if (_this.zfyps_close_key)
                    $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 34);
                else
                    $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            });

            $(window).unload(function () {
                storage.removeItem('zfsypsjglpt-sypgl-zfjlysyp-main-homePage');
                storage.removeItem('todos');
            });
        },
        onDispose() {
            storage.removeItem('zfsypsjglpt-sypgl-zfjlysyp-main-homePage');
            storage.removeItem('todos');

            window.clearTimeout(search_timer);
            click_search = true;
            this.list_loading = false;
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.destroy();

            // tableObject_zfypsjj_main.tableDataFnc([]);
        },
        someone_ajax() {
            let _this = this;
            let item_record = storage.getItem("zfsypsjglpt-yspk-zfypsjj-record");

            let ajax_data = {
                "includeChild": item_record.includeChild,
                "page": (_this.curPage - 1),
                "pageSize": 20,
                "orgPath": item_record.orgPath,
                "policeType": item_record.policeType ? item_record.policeType : "LEVAM_JYLB_ALL", //人员类别空的时候传不限
                // "timeType": zfysypjj_time_range.time_select,
                "startTime": getTimeByDateStr(item_record.startTime),
                "endTime": getTimeByDateStr(item_record.endTime, true),
                "userName": item_record.userName
            };

            if (item_record.policeType == "LEVAM_JYLB_JY")
                ajax_data.userCode = item_record.userCode;
            else
                ajax_data.idCard = item_record.userCode;

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else {
                search_condition = ajax_data;
                if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-returnFlag")) {
                    let mainPage = storage.getItem("zfsypsjglpt-yspk-zfypsjj-mainPage");
                    this.curPage = mainPage;
                    this.table_pagination.current = mainPage;
                    tableObject_zfypsjj_main.page(mainPage, this.table_pagination.pageSize);
                    ajax_data.page = mainPage - 1;
                }
            }

            this.list_loading = true;

            ajax({
                // url: '/api/table_list',
                url: '/gmvcs/audio/basefile/search/someone',
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
                this.selected_arr = [];

                if (result.data.currentElements.length == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_zfypsjj_main.page(0, this.table_pagination.pageSize);
                    this.list_loading = false;
                    this.zfyps_table_data = [];
                    tableObject_zfypsjj_main.tableDataFnc([]);
                    tableObject_zfypsjj_main.loading(false);
                    this.table_pagination.total = 0;
                    return;
                }

                let ajaxObj = {ajax_data, url: '/gmvcs/audio/basefile/countSomeOne'}
                dealWithResult(result.data, ajaxObj);

                storage.setItem("zfsypsjglpt-yspk-zfypsjj-mainPage", this.curPage);
            });
        },
        select_table(record, selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        selectAll_table(selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        delete_all() {
            let _this = this;
            if (!this.selected_arr.length) {
                return;
            }
            _this.delete_post_data = [];
            let i = 0;
            avalon.each(this.selected_arr, function (index, item) {
                if (!item.is_rel)
                    _this.delete_post_data[i++] = item.rid;
            });

            zfypsjj_common_dialog.title = "确定删除";
            this.operation_type = 2;
            zfypsjj_common_dialog.txt_rows = false;

            if (_this.delete_post_data.length == "0") {
                this.operation_type = 4;
                zfypsjj_common_dialog.title = "提示";
                zfypsjj_common_dialog.dialog_txt = "选中的" + _this.selected_arr.length + "条关联数据需解除关联后才可删除！";
                _this.zfyps_dialog_width = 400;
                _this.zfyps_dialog_height = 178;

                this.cancelText = "关闭";
                this.zfyps_dialog_show = true;
                if (!$(".zfyps_dialog_common").hasClass("dialog_big_close"))
                    $(".zfyps_dialog_common").addClass("dialog_big_close");
            } else if (_this.delete_post_data.length == _this.selected_arr.length) {
                zfypsjj_common_dialog.title = "确定删除";
                zfypsjj_common_dialog.dialog_txt = "是否确定删除选中的" + _this.selected_arr.length + "条数据?";
                _this.zfyps_dialog_width = 300;
                _this.zfyps_dialog_height = 178;

                this.cancelText = "取消";
                this.zfyps_dialog_show = true;

            } else {
                let rel_len = _this.selected_arr.length - _this.delete_post_data.length;
                zfypsjj_common_dialog.txt_rows = true;
                zfypsjj_common_dialog.title = "确定删除";
                zfypsjj_common_dialog.dialog_txt = "选中的数据中，有" + rel_len + "条数据已关联，需解除关联才可删除；没有关联的" + _this.delete_post_data.length + "条数据将会被删除。是否继续您的操作？";
                _this.zfyps_dialog_width = 521;
                _this.zfyps_dialog_height = 220;

                this.cancelText = "取消";
                this.zfyps_dialog_show = true;
                if (!$(".zfyps_dialog_common").hasClass("dialog_biger_footer"))
                    $(".zfyps_dialog_common").addClass("dialog_biger_footer");
            }
        },
        get_table_list() {
            let police_check_exp = new RegExp("^[a-zA-Z0-9\u4E00-\u9FA5-_]*$"); //正则判断名称
            if (!police_check_exp.test(this.police_check)) {
                zfyps_vm.zfyps_table_data = [];
                zfyps_vm.list_loading = false;
                tableObject_zfypsjj_main.tableDataFnc([]);
                tableObject_zfypsjj_main.loading(false);

                notification.warn({
                    message: "姓名、警号应为中文，数字，字母，-，_构成，请重新输入！",
                    title: '通知'
                });
                return;
            }

            // if (this.police_check.length > 20) {
            //     zfyps_vm.zfyps_table_data = [];
            //     zfyps_vm.list_loading = false;
            //     tableObject_zfypsjj_main.tableDataFnc([]);
            //     tableObject_zfypsjj_main.loading(false);

            //     notification.warn({
            //         message: "姓名、警号输入不能超过20个字符，请重新输入！",
            //         title: '通知'
            //     });
            //     return;
            // }

            let start_time, end_time;
            if (zfysypjj_time_range.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (zfysypjj_time_range.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (zfysypjj_time_range.range_flag == "2") {
                start_time = zfypsjj_startTime_vm.zfypsjj_startTime;
                end_time = zfypsjj_endTime_vm.zfysypjj_endTime;
            }

            let ajax_data = {
                "includeChild": this.included_status,
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": zfyps_vm.zfysyp_main_tree.curTree || zfyps_vm.zfysyp_main_tree.tree_code,
                "policeType": zfypsjj_man_type.curType || zfypsjj_man_type.police_type[0],
                "type": mediajj_type_vm.curMedia || mediajj_type_vm.jj_media_type[0],
                "keyMark": filejj_logo_vm.curFile || filejj_logo_vm.file_type[0],
                "timeType": zfysypjj_time_range.time_select,
                "startTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (this.police_check)
                ajax_data.jymc = this.police_check;

            if (versionSelection == "Qianxinan") {
                ajax_data.in24file = zfyps_timely_import.importSelect;
            }

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else
                search_condition = ajax_data;

            ajax({
                // url: '/api/table_list',
                url: '/gmvcs/audio/basefile/search',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });

                    zfyps_vm.zfyps_table_data = [];
                    zfyps_vm.list_loading = false;
                    tableObject_zfypsjj_main.tableDataFnc([]);
                    tableObject_zfypsjj_main.loading(false);
                    return;
                }
                this.selected_arr = [];
                let temp_data = {
                    "includeChild": ajax_data.includeChild,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "policeType": ajax_data.policeType,
                    "type": ajax_data.type,
                    "keyMark": ajax_data.keyMark,
                    "timeType": ajax_data.timeType,
                    "startTime": start_time,
                    "endTime": end_time
                };

                if (!this.police_check)
                    temp_data.jymc = "";
                else
                    temp_data.jymc = ajax_data.jymc;

                if (versionSelection == "Qianxinan") {
                    temp_data.in24file = ajax_data.in24file;
                }

                if (result.data.currentElements.length == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_zfypsjj_main.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    this.list_loading = false;
                    tableObject_zfypsjj_main.tableDataFnc([]);
                    tableObject_zfypsjj_main.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.tree_key = zfyps_vm.zfysyp_main_tree.tree_key;
                    local_storage.tree_title = zfyps_vm.zfysyp_main_tree.tree_title;
                    local_storage.range_flag = zfysypjj_time_range.range_flag;
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-main', local_storage);
                    return;
                }

                let ajaxObj = {ajax_data, url: '/gmvcs/audio/basefile/count'}
                dealWithResult(result.data, ajaxObj);

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.tree_key = zfyps_vm.zfysyp_main_tree.tree_key;
                local_storage.tree_title = zfyps_vm.zfysyp_main_tree.tree_title;
                local_storage.range_flag = zfysypjj_time_range.range_flag;
                // local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-main', local_storage);
            });
        },
        clickBranchBack(e) {
            this.included_status = e;
        },
        tableStatusBtn() {
            this.table_status_flag = !this.table_status_flag;
            _popover();

            storage.removeItem("zfypsjj-main-tableDrag-style");
            $('.zfsypsjglpt_sypgl_zfysypjj_table li div').attr("style", "");

            if (this.table_status_flag) {
                this.table_status = "图表模式";
                tableObject_zfypsjj_main.tableDataFnc(this.zfyps_table_data);

                $(".file_abnormal_li").parent().css({
                    "background-color": "transparent"
                });

                $(".expireFile").css({
                    "background-color": "#dfdfdf"
                });
                $(".expireFile").siblings().css({
                    "background-color": "#dfdfdf"
                });

            } else {
                this.table_status = "列表模式";

                $(".file_abnormal_li").parent().css({
                    "background-color": "#E6E6E6"
                });

                $(".expireFile").css({
                    "background-color": "transparent"
                });
                $(".expireFile").siblings().css({
                    "background-color": "transparent"
                });
            }
        },
        returnBtn() {
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);

            storage.setItem("zfsypsjglpt-yspk-zfypsjj-returnFlag", false);
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp");
        },
        searchBtn() {
            if (this.key_format == "inline-block" || this.name_format == "inline-block")
                return;
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-actions', false);
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
            if (zfysypjj_time_range.range_flag == 2) {
                if (zfypsjj_startTime_vm.start_null == "inline-block" || zfypsjj_endTime_vm.end_null == "inline-block") {
                    return;
                }
                if (getTimeByDateStr(zfypsjj_startTime_vm.zfypsjj_startTime) > getTimeByDateStr(zfypsjj_endTime_vm.zfysypjj_endTime)) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = getTimeByDateStr(zfypsjj_endTime_vm.zfysypjj_endTime) - getTimeByDateStr(zfypsjj_startTime_vm.zfypsjj_startTime);
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
            tableObject_zfypsjj_main.page(1, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            this.list_loading = true;
            tableObject_zfypsjj_main.tableDataFnc([]);
            tableObject_zfypsjj_main.loading(true);
            this.police_check = $.trim(this.police_check);
            this.get_table_list();
        },
        dialogCancel() {
            this.zfyps_dialog_show = false;
        },
        dialogOk() {
            if (this.operation_type == 1) {
                ajax({
                    url: '/gmvcs/audio/basefile/delete/' + this.record_item.rid,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '删除文件成功！',
                            title: '通知'
                        });
                        if (this.curPage == 1) {
                            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                            {
                                this.someone_ajax();
                            } else {
                                this.search_list();
                            }
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && "1" == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                            tableObject_zfypsjj_main.page(this.curPage, this.table_pagination.pageSize);
                        }
                        this.table_pagination.current = this.curPage;
                        this.zfyps_table_data = [];
                        this.list_loading = true;
                        tableObject_zfypsjj_main.tableDataFnc([]);
                        tableObject_zfypsjj_main.loading(true);
                        if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                        {
                            this.someone_ajax();
                        } else {
                            this.get_table_list();
                        }
                    }
                });
            } else if (this.operation_type == 2) {
                let _this = this;

                ajax({
                    url: '/gmvcs/audio/basefile/batch/delete',
                    method: 'post',
                    data: _this.delete_post_data
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '批量删除文件成功！',
                            title: '通知'
                        });
                        if (this.curPage == 1) {
                            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                            {
                                this.someone_ajax();
                            } else {
                                this.search_list();
                            }
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && this.delete_post_data.length == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                            tableObject_zfypsjj_main.page(this.curPage, this.table_pagination.pageSize);
                        }
                        this.table_pagination.current = this.curPage;
                        this.zfyps_table_data = [];
                        this.list_loading = true;
                        tableObject_zfypsjj_main.tableDataFnc([]);
                        tableObject_zfypsjj_main.loading(true);
                        if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                        {
                            this.someone_ajax();
                        } else {
                            this.get_table_list();
                        }
                    }
                });
            }


            this.zfyps_dialog_show = false;
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
        key_enter(e) {
            if (e.keyCode == "13")
                this.searchBtn();
            else {
                let txt = e.target.value;
                let key_exp = new RegExp("^[a-zA-Z0-9\u4E00-\u9FA5-]*$"); //正则判断名称
                if (!key_exp.test(txt)) {
                    this.key_format = "inline-block";
                } else
                    this.key_format = "none";
            }
        },
        name_enter(e) {
            if (e.keyCode == "13")
                this.searchBtn();
            else {
                let txt = e.target.value;
                let name_exp = new RegExp("^[a-zA-Z0-9\u4E00-\u9FA5]*$"); //正则判断名称
                if (!name_exp.test(txt)) {
                    this.name_format = "inline-block";
                } else
                    this.name_format = "none";
            }
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
                    // case 'key':
                    //     _this.search_key = "";
                    //     _this.search_key_title = "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询";
                    //     return false;
                    //     break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = true;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 34);
                    _this.findPageByUserNameOrUserCodeOrAbbr(_this.police_check);
                    break;
                case 'key':
                    _this.zfyps_close_key = true;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .key_name").width($(".zfyps_input_panel").innerWidth() - 34);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = false;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 24);
                    setTimeout(() => {
                        _this.nameList = [];
                    }, 200)
                    break;
                case 'key':
                    _this.zfyps_close_key = false;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .key_name").width($(".zfyps_input_panel").innerWidth() - 24);
                    break;
            }
        }
    }
});

//查询定时器
let search_timer;
let click_search = true;

let zfypsjj_table = avalon.define({
    $id: "zfsypsjglpt_sypgl_zfysypjj_table",
    loading: false,
    actions(type, text, record, index) {
        zfyps_vm.record_item = record;
        if (type == "check_click") {
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-tableStatus', zfyps_vm.table_status_flag);
            storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-detail', record);
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-detail");
        } else if (type == "download_click") {
            if (!record.file_status) {
                return;
            }
            ajax({
                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + record.rid,
                // url: '/api/findVideoPlayByRid',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '无法获取下载地址，请稍后再试！',
                        title: '通知'
                    });
                    return;
                }

                let download_url = result.data[0].storageFileURL || result.data[0].wsFileURL || result.data[0].storageTransFileURL || result.data[0].wsTransFileURL;

                if (download_url == "") {
                    notification.error({
                        message: '无法获取下载地址，请稍后再试！',
                        title: '通知'
                    });
                    return;
                }
                window.open(download_url);
            });

        } else if (type == "del_click") {
            if (!record.file_status) {
                return;
            }
            zfyps_vm.zfyps_dialog_width = 300;
            zfyps_vm.zfyps_dialog_height = 178;
            zfypsjj_common_dialog.txt_rows = false;

            if (record.is_rel) {
                zfyps_vm.operation_type = 3;
                zfypsjj_common_dialog.title = "提示";
                zfypsjj_common_dialog.dialog_txt = "关联数据需解除关联后才可删除！";
                zfyps_vm.cancelText = "关闭";

                zfyps_vm.zfyps_dialog_show = true;

                if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                    $(".zfyps_dialog_common").addClass("dialog_close");
            } else {
                zfyps_vm.operation_type = 1;
                zfypsjj_common_dialog.title = "确定删除";
                zfypsjj_common_dialog.dialog_txt = "是否确定删除选中的1条数据?";
                zfyps_vm.cancelText = "取消";

                zfyps_vm.zfyps_dialog_show = true;
            }
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

let zfypsjj_man_type = avalon.define({
    $id: 'zfypsjj_man_type',
    curType: "",
    time_type_options: [{
        value: "LEVAM_JYLB_ALL",
        label: "不限"
    }, {
        value: "LEVAM_JYLB_JY",
        label: "警员"
    }, {
        value: "LEVAM_JYLB_FJ",
        label: "辅警"
    }],
    police_type: ["LEVAM_JYLB_ALL"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

let zfyps_timely_import = avalon.define({
    $id: 'zfyps_timely_import',
    importSelect: "0",
    timeTypeOptions: [{
        value: "0",
        label: "不限"
    }, {
        value: "1",
        label: "24小时内导入"
    }, {
        value: "2",
        label: "24小时后导入"
    }],
    timelyImportType: ["0"],
    onChangeT(e) {
        let _this = this;
        _this.importSelect = e.target.value;
    }
});

/* 主页面时间控制  start */
let zfysypjj_time_range = avalon.define({
    $id: 'zfysypjj_time_range',
    select_time: false,
    time_range_arr: [{
            value: "1",
            label: "拍摄时间"
        },
        {
            value: "2",
            label: "导入时间"
        }
    ],
    time_range_options: [{
        value: "0",
        label: "本周"
    }, {
        value: "1",
        label: "本月"
    }, {
        value: "2",
        label: "自定义时间"
    }],
    time_range_label: ["1"],
    time_range: ["0"],
    time_select: "1",
    range_flag: 0,
    onChangeL(e) {
        let _this = this;
        _this.time_select = e.target.value;
    },
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            zfypsjj_endTime_vm.end_null = "none";
            zfypsjj_endTime_vm.zfysypjj_endTime = moment().format('YYYY-MM-DD');
            zfypsjj_startTime_vm.start_null = "none";
            zfypsjj_startTime_vm.zfypsjj_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let zfypsjj_startTime_vm = avalon.define({
    $id: "zfypsjj_startTime",
    start_null: "none",
    zfypsjj_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfypsjj_startTime = e.target.value;
        if (_this.zfypsjj_startTime == "") {
            _this.start_null = "inline-block";
            $(".zfyps_start_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.start_null = "none";
            $(".zfyps_start_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});

let zfypsjj_endTime_vm = avalon.define({
    $id: "zfysypjj_endTime",
    end_null: "none",
    zfysypjj_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfysypjj_endTime = e.target.value;
        if (_this.zfysypjj_endTime == "") {
            _this.end_null = "inline-block";
            $(".zfyps_end_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.end_null = "none";
            $(".zfyps_end_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});
/* 主页面时间控制  end */

let mediajj_type_vm = avalon.define({
    $id: 'jj_media_type',
    curMedia: "",
    media_options: [{
        value: "-1",
        label: "不限"
    }, {
        value: "0",
        label: "视频"
    }, {
        value: "1",
        label: "音频"
    }, {
        value: "2",
        label: "图片"
    }, {
        value: "4",
        label: "其他"
    }],
    jj_media_type: ["-1"],
    onChangeM(e) {
        let _this = this;
        _this.curMedia = e.target.value;
    }
});

let filejj_logo_vm = avalon.define({
    $id: 'filejj_logo',
    curFile: "",
    file_options: [{
        value: "0",
        label: "不限"
    }, {
        value: "1",
        label: "普通文件"
    }, {
        value: "2",
        label: "业务关联"
    }, {
        value: "3",
        label: "标注文件"
    }, {
        value: "4",
        label: "执法仪标记"
    }],
    file_type: ["0"],
    onChangeF(e) {
        let _this = this;
        _this.curFile = e.target.value;
    }
});

filejj_logo_vm.$watch('onReady', () => {
    versionSelection == "Qianxinan" && filejj_logo_vm.file_options.push({
        value: "5",
        label: "未标注文件"
    });
});

let zfypsjj_common_dialog = avalon.define({
    $id: "zfypsjj_common_dialog",
    title: "",
    dialog_txt: "",
    txt_rows: true //true 两行 false 一行
});

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        // $(".zfsypsjglpt_yspk_zfyps_main").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        // $(".zfsypsjglpt_yspk_zfyps_main").height(740);
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

/*================== 弹出tooltips start =============================*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function () {
            let html = "";
            if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0) {
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
            }
            else if ($(this)[0].outerHTML.indexOf("data-title-img-five") > 0) {
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-five") + 21, $(this)[0].outerHTML.indexOf("data-title-img-five") + 26);
            }
            else if ($($(this)[0]).attr('pop')) {
                html = $($(this)[0]).attr('pop');
            }
            else {
                html = $(this)[0].innerText;
            }
            return '<div class="title-content">' + html + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        if(dep_switch && $($(this)[0]).attr('dep') && $($(this)[0]).attr('fir')=='true') {
            var dep_orgCode = $($(this)[0]).attr('pop');
            ajax({
                url: `/gmvcs/uap/org/getFullName?orgCode=${dep_orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                method: 'get'
            }).then(resg => {
                // console.log('resg.data',resg.data)
                $($(this)[0]).attr('pop', resg.data);
                $($(this)[0]).attr('fir', 'false');
                clearTimeout(timer);
                timer = setTimeout(function () {
                    $('div').siblings(".popover").popoverX("hide");
                    $(_this).popoverX("show");
        
                    $(".popover").on("mouseleave", function () {
                        $(_this).popoverX('hide');
                    });
                }, 500);
            });
        } else {
            clearTimeout(timer);
            timer = setTimeout(function () {
                $('div').siblings(".popover").popoverX("hide");
                $(_this).popoverX("show");
    
                $(".popover").on("mouseleave", function () {
                    $(_this).popoverX('hide');
                });
            }, 500);
        }
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
    });
}
/*================== 弹出tooltips end =============================*/

// let tableObject_zfypsjj_main = $.tableIndex({ //初始化表格jq插件
//     id: 'zfypsjj_table',
//     controller: 'zfypsjj_table',
//     tableObj: zfypsjj_table,
//     currentPage: 1,
//     prePageSize: 20,
//     key: "rid"
// });
let tableBody_zfyps = avalon.define({ //表格定义组件
    $id: 'zfypsjj_table',
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
    dragStorageName: 'zfypsjj-main-tableDrag-style',

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
        zfypsjj_table.handleSelectAll(e.target.checked, this.selection.$model);
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
        zfypsjj_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfypsjj_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});

function dealWithResult(result, ajaxObj) {
    let ret_data = [],
        rid_arr = [];
    let temp = (zfyps_vm.curPage - 1) * zfyps_vm.table_pagination.pageSize + 1;
    avalon.each(result.currentElements, function (index, item) {
        ret_data[index] = {};
        ret_data[index].index = temp + index; //行序号
        ret_data[index].orgName = item.orgName; //所属部门
        ret_data[index].orgCode = item.orgCode; //所属部门
        ret_data[index].space = ""; //空title需要
        ret_data[index].policeType = item.policeType; //人员类别code
        ret_data[index].policeTypeName = item.policeTypeName || "-"; //人员类别name
        ret_data[index].importTime = formatDate(item.importTime); //导入时间
        ret_data[index].startTime = formatDate(item.startTime); //拍摄时间
        ret_data[index].duration = formatSeconds(item.duration); //拍摄时长
        ret_data[index].name_id = item.userName + "(" + item.userCode + ")"; //警员（警号）
        ret_data[index].rid = item.rid; //文件唯一标识
        ret_data[index].fileName = item.fileName || "-";
        ret_data[index].size = (item.size / (1024 * 1024)).toFixed(2) + "M";

        ret_data[index].beginTime = item.startTime;
        ret_data[index].endTime = item.endTime;
        ret_data[index].deviceId = item.deviceId;
        ret_data[index].fileType = item.type;

        // rid_arr.push(item.rid);
        rid_arr[index] = item.rid; //媒体状态

        ret_data[index].search_status = false; //查询状态
        ret_data[index].file_status = true; //媒体状态 true 正常 false 异常
        ret_data[index].file_status_txt = "正常"; //媒体状态

        ret_data[index].list_close = "/static/image/zfsypsjglpt/delete_icon.png";

        ret_data[index].file_flag = "";
        ret_data[index].common_file = false;
        ret_data[index].is_rel = false; //关联
        ret_data[index].is_tag = false; //标注
        ret_data[index].is_imp = false; //重要
        ret_data[index].isPicture = false; //是否是图片

        if (item.match)
            ret_data[index].match_txt = "已关联";
        else
            ret_data[index].match_txt = "未关联";

        ret_data[index].screenshot_small = item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/image_abnormal_small.png";
        ret_data[index].screenshot_big = item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/image_abnormal_big.png";
        if (item.type == "0") {
            ret_data[index].type = "视频";
            ret_data[index].file_flag = "0";
            // ret_data[index].screenshot_small = item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/video_abnormal_small.png";
            // ret_data[index].screenshot_big = item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/video_abnormal_big.png";
            // 视频小于3S显示超短媒体缩略图
            ret_data[index].screenshot_small = (item.duration <= 3) ? "/static/image/zfsypsjglpt/video_short_small.png" : (item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/video_abnormal_small.png");
            ret_data[index].screenshot_big = (item.duration <= 3) ? "/static/image/zfsypsjglpt/video_short_big.png" : (item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/video_abnormal_big.png");
        } else if (item.type == "1") {
            ret_data[index].type = "音频";
            ret_data[index].file_flag = "1";
            ret_data[index].screenshot_small = "/static/image/zfsypsjglpt/audio_normal_small.png";
            ret_data[index].screenshot_big = "/static/image/zfsypsjglpt/audio_normal_big.png";
        } else if (item.type == "2") {
            ret_data[index].type = "图片";
            ret_data[index].file_flag = "2";
            ret_data[index].isPicture = true; //是否是图片
        } else if (item.type == "3") {
            ret_data[index].type = "文本";
        } else
            ret_data[index].type = "其他";

        if (!item.match && !item.label && !item.keyFile) {
            ret_data[index].common_file = true;
            ret_data[index].common_file_img = "/static/image/zfsypsjglpt/ywgl.png";
        }
        if (item.match) {
            ret_data[index].rel_img = "/static/image/zfsypsjglpt/ywgl.png";
            ret_data[index].rel_title = "业务关联";
            ret_data[index].is_rel = true;
        }
        if (item.label) {
            ret_data[index].tag_img = "/static/image/zfsypsjglpt/bzwj.png";
            ret_data[index].tag_title = "标注信息";
            ret_data[index].is_tag = true;
        }
        if (item.keyFile) {
            ret_data[index].imp_img = "/static/image/zfsypsjglpt/zfybj.png";
            ret_data[index].imp_title = "执法仪标记";
            ret_data[index].is_imp = true;
        }

        if (item.saveTime == -2) {
            ret_data[index].screenshot = "/static/image/zfsypsjglpt/expireFile.png";
            ret_data[index].isExpire = true;
        }
    });

    zfyps_vm.zfyps_table_data = ret_data;
    zfyps_vm.list_loading = false;
    tableObject_zfypsjj_main.tableDataFnc(ret_data);
    tableObject_zfypsjj_main.loading(false);

    ajax({
        url: '/gmvcs/uom/file/fileInfo/fileAccessible',
        // url: '/api/fileAccessible',
        method: 'post',
        data: rid_arr
    }).then(ret => {
        if (ret.code != 0) {
            notification.error({
                message: ret.msg,
                title: '通知'
            });
            getPagination(ajax_data);
        }
        let ret_arr = ret.data;
        for (let i = 0; i < ret_arr.length; i++) {
            ret_data[i].search_status = true;

            if (ret_arr[i].canPlay) {
                ret_data[i].file_status = true;
                ret_data[i].file_status_txt = "正常";
            } else {
                if (ret_data[i].type == "视频") {
                    ret_data[i].screenshot_small = "/static/image/zfsypsjglpt/video_abnormal_small.png";
                    ret_data[i].screenshot_big = "/static/image/zfsypsjglpt/video_abnormal_big.png";
                } else if (ret_data[i].type == "音频") {
                    ret_data[i].screenshot_small = "/static/image/zfsypsjglpt/audio_abnormal_small.png";
                    ret_data[i].screenshot_big = "/static/image/zfsypsjglpt/audio_abnormal_big.png";
                } else if (ret_data[i].type == "图片") {
                    ret_data[i].screenshot_small = "/static/image/zfsypsjglpt/image_abnormal_small.png";
                    ret_data[i].screenshot_big = "/static/image/zfsypsjglpt/image_abnormal_big.png";
                }

                ret_data[i].file_status = false;
                ret_data[i].file_status_txt = "异常";
            }
        }

        zfyps_vm.zfyps_table_data = ret_data;
        zfyps_vm.list_loading = false;
        tableObject_zfypsjj_main.tableDataFnc(ret_data);
    });
    getPagination(ajaxObj);

    $(".expireFile").css({
        "background-color": "#dfdfdf"
    });
    $(".expireFile").siblings().css({
        "background-color": "#dfdfdf"
    });

    $(".file_abnormal_li").parent().css({
        "background-color": "transparent"
    });

    if (!zfyps_vm.table_status_flag) {
        $(".file_abnormal_li").parent().css({
            "background-color": "#E6E6E6"
        });

        $(".expireFile").css({
            "background-color": "transparent"
        });
        $(".expireFile").siblings().css({
            "background-color": "transparent"
        });
    }

    // if (result.overLimit) {
    //     zfyps_vm.page_type = true;

    //     zfyps_vm.table_pagination.total = result.limit * zfyps_vm.table_pagination.pageSize; //总条数
    //     zfyps_vm.table_pagination.totalPages = result.limit; //总页数
    // } else {
    //     zfyps_vm.page_type = false;

    //     zfyps_vm.table_pagination.total = result.totalElements; //总条数
    //     zfyps_vm.table_pagination.totalPages = result.totalPages; //总页数
    // }
    zfyps_vm.table_pagination.current_len = result.currentElements.length;

    _popover();
}

// 分页器信息获取
function getPagination(data) {
    ajax({
        url: data.url,
        method: 'post',
        data: data.ajax_data
    }).then(ret => {
        if (ret.code != 0) {
            notification.error({
                message: ret.msg,
                title: '通知'
            });
            return;
        }

        zfyps_vm.table_pagination.total = ret.data.totalElements; //总条数
        zfyps_vm.table_pagination.totalPages = ret.data.totalPages; //总页数
    });
}