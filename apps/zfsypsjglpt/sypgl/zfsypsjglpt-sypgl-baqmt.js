import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import * as menuServer from '/services/menuService';
var storage = require('/services/storageService.js').ret;
let language_txt = require('../../../vendor/language').language;

import {
    getSelectStartTimeStamp,
    getSelectEndTimeStamp
} from '/apps/common/common-datepicker';

import {
    isTableSearch
} from '/services/configService';

export const name = "zfsypsjglpt-sypgl-baqmt";
require("./zfsypsjglpt-sypgl-baqmt.less");
require('/apps/common/common-datepicker');

let baqmt_vm,
    search_condition = {},
    local_storage = {};
avalon.component(name, {
    template: __inline("./zfsypsjglpt-sypgl-baqmt.html"),
    defaults: {
        cancelText: "取消",
        zfsypsjglpt:language_txt.zfsypsjglpt.sypgl,
        zfyps_dialog_show: false,
        // search_key: "",
        // search_key_title: "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询",
        included_dep_img: "/static/image/xtpzgl-yhgl/selectNo.png?__sprite",
        table_status: "图表模式",
        table_status_flag: true, //true 对应列表模式，按钮显示图表模式；false 对应图表模式，按钮显示列表模式
        search_policeId_title: "支持姓名查询",
        police_check: "",
        operation_type: "", //1 删除记录；2 批量删除纪录；3 单选删除时该记录为关联；4 多选时所有数据均为关联

        list_loading: false,
        baqmtListData: [],
        list_click(e) {
            $(".popover").hide();
            storage.setItem('zfsypsjglpt-sypgl-baqmt-detail', e);
            avalon.history.setHash("/zfsypsjglpt-sypgl-baqmt-detail");
        },
        delete_click(e) {
            // if (!e.file_status) {
            //     return;
            // }
            this.record_item = new Object(e);

            baqmt_vm.zfyps_dialog_width = 300;
            baqmt_vm.zfyps_dialog_height = 178;
            zfypsjj_common_dialog.txt_rows = false;

            if (e.is_rel) {
                baqmt_vm.operation_type = 3;
                zfypsjj_common_dialog.title = "提示";
                zfypsjj_common_dialog.dialog_txt = "关联数据需解除关联后才可删除！";
                baqmt_vm.cancelText = "关闭";

                baqmt_vm.zfyps_dialog_show = true;

                if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                    $(".zfyps_dialog_common").addClass("dialog_close");
            } else {
                baqmt_vm.operation_type = 1;
                zfypsjj_common_dialog.title = "确定删除";
                zfypsjj_common_dialog.dialog_txt = "是否确定删除选中的1条数据?";
                baqmt_vm.cancelText = "取消";

                baqmt_vm.zfyps_dialog_show = true;
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
        media_info: {},

        web_width: "",
        web_height: "",
        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true
        // search_condition: {},
        zfyps_close_policeId: false,
        zfyps_dialog_width: 300,
        zfyps_dialog_height: 178,
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
            this.list_loading = true;
            this.baqmtListData = [];
            this.get_table_list();
        },

        opt_baqmt: avalon.define({
            $id: "opt_baqmt",
            authority: { // 按钮权限标识
                "DELETE": false, //音视频库_执法仪拍摄_删除
                "SEARCH": false, //音视频库_执法仪拍摄_查询
            }
        }),

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

        mediaSources: [],
        mediaSelect: [],
        onChangeS(e) {
            this.mediaSelect = [e.target.value.toString()];
        },

        onInit(e) {
            set_size();
            baqmt_vm = e.vmodel;

            filejj_logo_vm.file_type = ["0"];

            // this.list_loading = true;
            this.baqmtListData = [];
            this.table_status_flag = true;
            baqmt_time_range.timeTypeSelect = ["1"];

            let init_data = storage.getItem("zfsypsjglpt-sypgl-baqmt");

            neet_init = true; //true为缓存超时，相当于重新刷新；false为从Local Storage拿数据填充，表格数据重新请求。

            // set_size();
            if (storage.getItem("zfsypsjglpt-sypgl-baqmt")) {
                if ((getTimestamp() - init_data.timeStamp) > 1800) { //1800 = 30 * 60              
                    neet_init = true;
                    // this.search_list();
                } else {
                    neet_init = false;

                    this.mediaSelect = [init_data.ajax_data.baqId];

                    this.currentSelect = init_data.range_flag;
                    if (this.currentSelect == "2") {
                        this.initTime = { //--默认选择自定义时间时，可以自定义选中哪个日期。在initTime传startTime和endTime进组件，格式为时间戳
                            startTime: init_data.ajax_data.startTime,
                            endTime: init_data.ajax_data.endTime,
                        };
                    }
                    this.ajaxStartTime = init_data.ajax_data.startTime;
                    this.ajaxEndTime = init_data.ajax_data.endTime;
                    filejj_logo_vm.file_type = new Array(init_data.ajax_data.keyMark);

                    if (init_data.ajax_data.timeType == "1") {
                        baqmt_time_range.timeTypeSelect = ["1"];
                    } else {
                        baqmt_time_range.timeTypeSelect = ["2"];
                    }

                    this.page_type = init_data.page_type;
                    this.curPage = init_data.ajax_data.page + 1;
                    this.table_pagination.current = init_data.ajax_data.page + 1;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.current_len = init_data.current_len;
                    this.table_pagination.totalPages = init_data.list_totalPages;

                    search_condition = {
                        "page": init_data.ajax_data.page,
                        "pageSize": init_data.ajax_data.pageSize,
                        "baqId": init_data.ajax_data.baqId,
                        "keyMark": init_data.ajax_data.keyMark,
                        "timeType": init_data.ajax_data.timeType,
                        "startTime": init_data.ajax_data.startTime,
                        "endTime": init_data.ajax_data.endTime
                    };

                    if (init_data.ajax_data.involvedPerson) {
                        this.police_check = init_data.ajax_data.involvedPerson;
                        search_condition.involvedPerson = init_data.ajax_data.involvedPerson;
                    }

                    this.table_status_flag = storage.getItem('zfsypsjglpt-sypgl-baqmt-tableStatus');
                    if (this.table_status_flag) {
                        this.table_status = "图表模式";
                    } else {
                        this.table_status = "列表模式";
                    }

                    isTableSearch && this.get_table_list();
                }
            }

            ajax({
                // url: '/api/dep_tree',
                url: `/gmvcs/baq/case/getUserBaqInfo?userCode=${storage.getItem("userCode")}`,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取办案中心失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                let temp = [];
                avalon.each(result.data, function (index, el) {
                    temp[index] = {};
                    temp[index].value = el.baqID;
                    temp[index].label = el.baqName;
                });
                this.mediaSources = temp;

                if (neet_init) {
                    this.mediaSelect = [this.mediaSources[0].value];
                    isTableSearch && this.search_list();
                } else {}
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_SYPGL_ZFYSYP_BAQMT/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".zfsypsjglpt_sypgl_baqmt .tableType").css("top", "0px");
                    $(".zfsypsjglpt_sypgl_baqmt .zfsypsjglpt_sypgl_baqmt_list").css("top", "40px");
                    $(".zfsypsjglpt_sypgl_baqmt .zfsypsjglpt_sypgl_baqmt_chart").css("top", "40px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_BAQMT_DELETE":
                            _this.opt_baqmt.authority.DELETE = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_BAQMT_SEARCH":
                            _this.opt_baqmt.authority.SEARCH = true;
                            break;
                    }
                });

                // 防止查询无权限时页面留白
                if (false == _this.opt_baqmt.authority.SEARCH) {
                    $(".zfsypsjglpt_sypgl_baqmt .tableType").css("top", "0px");
                    $(".zfsypsjglpt_sypgl_baqmt .zfsypsjglpt_sypgl_baqmt_list").css("top", "40px");
                    $(".zfsypsjglpt_sypgl_baqmt .zfsypsjglpt_sypgl_baqmt_chart").css("top", "40px");
                }
            });
        },
        onReady() {
            let _this = this;

            set_size();

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                if (_this.zfyps_close_policeId) {
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 34);
                } else {
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                }
            });
        },
        onDispose() {
            storage.setItem('zfsypsjglpt-sypgl-baqmt-tableStatus', baqmt_vm.table_status_flag);
            window.clearTimeout(search_timer);
            click_search = true;
            this.list_loading = false;
            this.baqmtListData = [];
            baqmt_vm = null;
        },
        get_table_list() {
            let police_check_exp = new RegExp("^[a-zA-Z0-9\u4E00-\u9FA5-_]*$"); //正则判断名称
            if (!police_check_exp.test(this.police_check)) {
                baqmt_vm.baqmtListData = [];
                baqmt_vm.list_loading = false;

                notification.warn({
                    message: "涉案人员应为中文，数字，字母，-，_构成，请重新输入！",
                    title: '通知'
                });
                return;
            }

            if (this.police_check.length > 20) {
                baqmt_vm.baqmtListData = [];
                baqmt_vm.list_loading = false;

                notification.warn({
                    message: "涉案人员输入不能超过20个字符，请重新输入！",
                    title: '通知'
                });
                return;
            }
            baqmt_vm.list_loading = true;

            let ajax_data = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "baqId": this.mediaSelect[0] || "",
                "keyMark": filejj_logo_vm.file_type[0],
                "timeType": baqmt_time_range.timeTypeSelect[0],
                "startTime": this.ajaxStartTime,
                "endTime": this.ajaxEndTime
            };

            if (this.police_check)
                ajax_data.involvedPerson = this.police_check;

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else
                search_condition = ajax_data;

            ajax({
                url: '/gmvcs/baq/caseareafile/search',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });

                    baqmt_vm.baqmtListData = [];
                    baqmt_vm.list_loading = false;
                    return;
                }
                this.selected_arr = [];
                let temp_data = {
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "baqId": ajax_data.baqId,
                    "keyMark": ajax_data.keyMark,
                    "timeType": ajax_data.timeType,
                    "startTime": ajax_data.startTime,
                    "endTime": ajax_data.endTime
                };

                if (!this.police_check)
                    temp_data.involvedPerson = "";
                else
                    temp_data.involvedPerson = ajax_data.involvedPerson;

                if (!result.data || (!result.data.overLimit && result.data.totalElements == 0)) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    this.baqmtListData = [];
                    this.list_loading = false;
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.range_flag = this.currentSelect;
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    storage.setItem('zfsypsjglpt-sypgl-baqmt', local_storage);
                    return;
                }

                dealWithResult(result.data);

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.range_flag = this.currentSelect;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-sypgl-baqmt', local_storage);
            });
        },
        tableStatusBtn() {
            this.table_status_flag = !this.table_status_flag;
            _popover();

            storage.removeItem("zfypsjj-main-tableDrag-style");
            $('.zfsypsjglpt_sypgl_zfysypjj_table li div').attr("style", "");

            if (this.table_status_flag) {
                this.table_status = "图表模式";

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
            if (this.currentSelect == 2) {
                if (this.ajaxStartTime > this.ajaxEndTime) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = this.ajaxEndTime - this.ajaxStartTime;
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
            this.baqmtListData = [];
            this.list_loading = true;
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
                            this.search_list();
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && "1" == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                        }
                        this.table_pagination.current = this.curPage;
                        this.baqmtListData = [];
                        this.list_loading = true;
                        this.get_table_list();
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
                            this.search_list();
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && this.delete_post_data.length == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                        }
                        this.table_pagination.current = this.curPage;
                        this.baqmtListData = [];
                        this.list_loading = true;
                        this.get_table_list();
                    }
                });
            }


            this.zfyps_dialog_show = false;
        },
        name_input_enter(e) {
            if (e.target.value != "") {
                this.search_policeId_title = e.target.value;
            } else
                this.search_policeId_title = "支持姓名查询";

            if (e.keyCode == "13")
                this.searchBtn();
        },
        name_enter(e) {
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.police_check = "";
                    _this.search_policeId_title = "支持姓名查询";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = true;
                    $(".zfsypsjglpt_sypgl_baqmt .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 34);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = false;
                    $(".zfsypsjglpt_sypgl_baqmt .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 24);
                    break;
            }
        }
    }
});

//查询定时器
let search_timer;
let click_search = true;

let neet_init;
// orgKey = "",
// orgPath = "";

/* 主页面时间控制  start */
let baqmt_time_range = avalon.define({
    $id: 'baqmt_time_range',
    time_range_arr: [{
            value: "1",
            label: "拍摄时间"
        },
        {
            value: "2",
            label: "导入时间"
        }
    ],
    timeTypeSelect: ["1"],
    onChangeL(e) {
        this.timeTypeSelect = [e.target.value.toString()];
    }
});
/* 主页面时间控制  end */

let filejj_logo_vm = avalon.define({
    $id: 'filejj_logo',
    file_options: [{
        value: "0",
        label: "不限"
    }, {
        value: "3",
        label: "标注文件"
    }],
    file_type: ["0"],
    onChangeF(e) {
        this.file_type = [e.target.value.toString()];
    },
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
        // $(".zfsypsjglpt_sypgl_baqmt").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        // $(".zfsypsjglpt_sypgl_baqmt").height(740);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
    }
}

/*================== 时间控制函数 start =============================*/
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
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
            if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
            else if ($(this)[0].outerHTML.indexOf("data-title-img-five") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-five") + 21, $(this)[0].outerHTML.indexOf("data-title-img-five") + 26);
            else
                html = $(this)[0].innerText;
            return '<div class="title-content">' + html + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popoverX('hide');
            });
        }, 500);
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

function dealWithResult(result) {
    let ret_data = [],
        rid_arr = [];
    let temp = (baqmt_vm.curPage - 1) * baqmt_vm.table_pagination.pageSize + 1;
    avalon.each(result.currentElements, function (index, item) {
        ret_data[index] = {};
        ret_data[index].space = ""; //空title需要
        ret_data[index].index = temp + index; //行序号
        ret_data[index].baqName = item.baqName; //办案中心
        ret_data[index].involvedPerson = item.involvedPerson; //涉案人员
        ret_data[index].importTime = formatDate(item.importTime); //导入时间
        ret_data[index].captureTime = formatDate(item.captureTime); //拍摄时间
        ret_data[index].duration = formatSeconds(item.duration); //拍摄时长
        ret_data[index].rid = item.rid; //文件唯一标识
        ret_data[index].fileName = item.fileName || "-";

        rid_arr[index] = item.rid; //媒体状态

        ret_data[index].file_status = true; //媒体状态 true 正常 false 异常

        ret_data[index].list_close = "/static/image/zfsypsjglpt/delete_icon.png";

        ret_data[index].file_flag = "";
        ret_data[index].is_rel = false; //关联
        ret_data[index].is_tag = false; //标注
        ret_data[index].is_imp = false; //重要
        ret_data[index].isPicture = false; //是否是图片

        if (item.match)
            ret_data[index].match_txt = "已关联";
        else
            ret_data[index].match_txt = "未关联";

        ret_data[index].screenshot_small = "/static/image/zfsypsjglpt/loading_small.gif";
        ret_data[index].screenshot_big = "/static/image/zfsypsjglpt/loading_big.gif";
        if (item.type == "0") {
            ret_data[index].type = "视频";
            ret_data[index].file_flag = "0";

        } else if (item.type == "1") {
            ret_data[index].type = "音频";
            ret_data[index].file_flag = "1";
        } else if (item.type == "2") {
            ret_data[index].type = "图片";
            ret_data[index].file_flag = "2";
            ret_data[index].isPicture = true; //是否是图片
        } else if (item.type == "3") {
            ret_data[index].type = "文本";
        } else
            ret_data[index].type = "其他";


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

    baqmt_vm.baqmtListData = ret_data;
    baqmt_vm.list_loading = false;

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
        }
        let ret_arr = ret.data;
        for (let i = 0; i < ret_arr.length; i++) {
            if (ret_arr[i].canPlay) {
                if (ret_data[i].type == "音频") {
                    ret_data[i].screenshot_small = "/static/image/zfsypsjglpt/audio_normal_small.png";
                    ret_data[i].screenshot_big = "/static/image/zfsypsjglpt/audio_normal_big.png";
                } else {
                    ret_data[i].screenshot_small = ret_arr[i].thumbNailHttpUrl;
                    ret_data[i].screenshot_big = ret_arr[i].thumbNailHttpUrl;
                }

                ret_data[i].file_status = true;
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
            }
        }

        baqmt_vm.baqmtListData = ret_data;
        baqmt_vm.list_loading = false;
    });

    $(".expireFile").css({
        "background-color": "#dfdfdf"
    });
    $(".expireFile").siblings().css({
        "background-color": "#dfdfdf"
    });

    $(".file_abnormal_li").parent().css({
        "background-color": "transparent"
    });

    if (!baqmt_vm.table_status_flag) {
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

    if (result.overLimit) {
        baqmt_vm.page_type = true;

        baqmt_vm.table_pagination.total = result.limit * baqmt_vm.table_pagination.pageSize; //总条数
        baqmt_vm.table_pagination.totalPages = result.limit; //总页数
    } else {
        baqmt_vm.page_type = false;

        baqmt_vm.table_pagination.total = result.totalElements; //总条数
        baqmt_vm.table_pagination.totalPages = result.totalPages; //总页数
    }
    baqmt_vm.table_pagination.current_len = result.currentElements.length;

    _popover();
}