import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
export const name = "tyyhrzpt-xtpzgl-zdlb";
require("./tyyhrzpt-xtpzgl-zdlb.less");
import * as menuServer from '/services/menuService';
let storage = require('/services/storageService.js').ret;

let zdlb_vm;

avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-zdlb.html"),
    defaults: {
        opt_zdlb: avalon.define({
            $id: "opt_zdlb",
            authority: { // 按钮权限标识
                "SEARCH": false, //黑名单_终端列表_查询
                "UNLOCK": false, //黑名单_终端列表_解锁
            }
        }),

        terminal: "",
        terminalX: false,
        terminalFormat: false,
        enter_search(e) {
            this.terminalFormat = false;
            if (e.keyCode == "13") {
                this.searchBtn();
            }
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'terminal':
                    _this.terminal = "";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'terminal':
                    _this.terminalX = true;
                    _this.terminalFormat = false;
                    $(".xtpzgl_zdlb .dataFormBox .terminal").width($(".zdlb_input_panel").innerWidth() - 32);
                    break;
                case 'loginPassword':
                    zdlb_dialog_vm.loginPasswordX = true;
                    zdlb_dialog_vm.loginPasswordNull = false;
                    $(".zdlb_dialog_common .loginPassword").width($(".zdlb_input_panel").innerWidth() - 32);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'terminal':
                    _this.terminalX = false;
                    $(".xtpzgl_zdlb .dataFormBox .terminal").width($(".zdlb_input_panel").innerWidth() - 22);
                    break;
                case 'loginPassword':
                    zdlb_dialog_vm.loginPasswordX = false;
                    $(".zdlb_dialog_common .loginPassword").width($(".zdlb_input_panel").innerWidth() - 22);
                    break;
            }
        },

        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            totalPages: 0
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },
        handlePageChange(page) {
            this.table_pagination.current = page;
            this.search_flag = false;
            this.getTableList();
        },

        searchBtn() {
            if ($.trim(this.terminal) != "" && !isValidIP($.trim(this.terminal))) {
                this.terminalFormat = true;
                return;
            }

            this.table_pagination.current = 1;
            this.search_flag = true;
            this.getTableList();
        },

        record_item: {},
        actions(type, text, record, index) {
            if (type == "check") {
                this.record_item = record;
                this.zdlb_dialog_show = true;
            }
        },
        search_condition: {},
        search_flag: false, //true 点击查询获取列表；false 翻页等非点击查询获取列表
        tableLoading: false,
        tableData: [],

        getTableList() {
            this.terminal = $.trim(this.terminal);
            this.tableLoading = true;
            let ajax_data = {
                "page": (this.table_pagination.current - 1),
                "pageSize": this.table_pagination.pageSize,
                "startTime": Number(moment(zdlb_startTime_vm.zdlb_startTime + ' 00:00:00').format('x')),
                "endTime": Number(moment(zdlb_endTime_vm.zdlb_endTime + ' 23:59:59').format('x')),
            };

            if (this.terminal) {
                ajax_data.ip = this.terminal;
            }

            if (!this.search_flag) {
                ajax_data = this.search_condition;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_condition = ajax_data;
            }

            ajax({
                url: '/gmvcs/uap/blacklist/findTerminalByPage',
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
                let temp_data = {
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "startTime": zdlb_startTime_vm.zdlb_startTime,
                    "endTime": zdlb_endTime_vm.zdlb_endTime
                };

                temp_data.ip = this.terminal || "";

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.tableData = [];
                    this.tableLoading = false;
                    this.table_pagination.total = 0;

                    storage.setItem('tyyhrzpt-xtpzgl-zdlb', temp_data, 0.5);
                    return;
                }

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].space = ""; //空title需要

                    //显示
                    ret_data[index].ip = item.ip; //ip
                    ret_data[index].lastLoginAccount = item.lastLoginAccount; //最后登录账号
                    ret_data[index].lastLoginTime = moment(item.lastLoginTime).format("YYYY-MM-DD HH:mm:ss"); //最后登录时间
                });

                this.tableData = ret_data;
                this.table_pagination.total = result.data.totalElements; //总条数
                this.tableLoading = false;

                storage.setItem('tyyhrzpt-xtpzgl-zdlb', temp_data, 0.5);
            });
        },

        zdlb_dialog_show: false,
        dialogCancel() {
            this.zdlb_dialog_show = false;
            zdlb_dialog_vm.loginPassword = "";
        },
        dialogOk() {
            if (zdlb_dialog_vm.loginPassword == "") {
                zdlb_dialog_vm.loginPasswordNull = true;
                return;
            }

            let unlock_data = {
                "password": zdlb_dialog_vm.loginPassword,
                "key": this.record_item.ip,
                "type": 1
            };
            ajax({
                url: '/gmvcs/uap/blacklist/unlock',
                method: 'post',
                data: unlock_data
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }

                zdlb_dialog_vm.loginPassword = "";
                notification.success({
                    message: result.msg,
                    title: '通知'
                });

                this.searchBtn();
                this.zdlb_dialog_show = false;
            });
        },

        onInit(e) {
            zdlb_vm = e.vmodel;
        },
        onReady() {
            let item = storage.getItem("tyyhrzpt-xtpzgl-zdlb");
            if (item) {
                this.table_pagination.current = item.page + 1;
                this.terminal = item.ip || "";
                zdlb_startTime_vm.zdlb_startTime = item.startTime;
                zdlb_endTime_vm.zdlb_endTime = item.endTime;

                this.search_flag = true;
                this.getTableList();
            } else {
                this.searchBtn();
            }

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_HMD_ZDLB/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_HMD_ZDLB_SEARCH":
                            _this.opt_zdlb.authority.SEARCH = true;
                            break;
                        case "CAS_FUNC_HMD_ZDLB_JS":
                            _this.opt_zdlb.authority.UNLOCK = true;
                            break;
                    }
                });
            });
        },
        onDispose() {
            this.terminal = "";
        },
    }
});

let zdlb_startTime_vm = avalon.define({
    $id: "zdlb_startTime",
    zdlb_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zdlb_startTime = e.target.value;
    }
});

let zdlb_endTime_vm = avalon.define({
    $id: "zdlb_endTime",
    zdlb_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zdlb_endTime = e.target.value;
    }
});

let zdlb_dialog_vm = avalon.define({
    $id: "zdlb_dialog",
    title: "解锁",
    loginPassword: "",
    loginPasswordX: false,
    loginPasswordNull: false,
    input_focus(e) {
        zdlb_vm.input_focus(e);
    },
    input_blur(e) {
        zdlb_vm.input_blur(e);
    },
    close_click(e) {
        this.loginPassword = "";
        return false;
    },
    enter_search(e) {
        if (e.keyCode == "13") {
            zdlb_vm.dialogOk();
        }
    }
});

function isValidIP(ip) {
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return reg.test(ip);
}