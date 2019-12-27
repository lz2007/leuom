import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
export const name = "tyyhrzpt-xtpzgl-cjgzzrz";
require("./tyyhrzpt-xtpzgl-cjgzzrz.less");
import '/apps/common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';

let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    dep_switch,
    includedStatus,
    isTableSearch
} = require('/services/configService');

let cjgzzrz_vm;
avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-cjgzzrz.html"),
    defaults: {
        key_dep_switch: dep_switch,
        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },
        included_dep_img: "",       
        police_id: "",
        police_id_title: getLan().rlbkInputTips,
        police_id_close: false,
        operatorName: "",
        police_name_title: getLan().rlbkInputTips,
        police_name_close: false,

        change_page: false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0
        },
        page_type: false, //false 显示总条数; true 显示大于多少条
        handlePageChange(currentPage) {
            this.change_page = true;
            this.table_pagination.current = currentPage;
            // this.loading = true;
            this.getTableList();
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },

        search_data: {},
        table_list: [],
        loading: false,
        checksDocData: {},

        cjgzzrz_dialog_show: false,
        dialogCancel() {
            this.cjgzzrz_dialog_show = false;
        },
        dialogOk() {
            this.cjgzzrz_dialog_show = false;
        },

        tree_init: false,
        // type_init: false,
        cjgzzrz_language: getLan(),
        extra_class: languageSelect == "en" ? true : false,
        onInit(e) {
            cjgzzrz_vm = e.vmodel;

            this.tree_init = false;
            // this.type_init = false;
            let storage_item = storage.getItem('tyyhrzpt-xtpzgl-cjgzzrz');

            this.$watch("included_status", (v) => {
                if (v)
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                else
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";

            });

            if (isTableSearch) {
                this.$watch("tree_init", (v) => {
                    if (v && cjgzzrz_vm.tree_init) {
                        if (storage_item)
                        cjgzzrz_vm.getTableList();
                        else
                        cjgzzrz_vm.searchBtn();
                    }
                });
                // this.$fire('tree_init', this.tree_init);
            }

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
                cjgzzrz_vm.cjgzzrz_tree_vm.tree_data = deptemp;

                if (storage_item) {
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_orgCode = storage_item.ajax_data.orgCode;
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_key = storage_item.tree_key;
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_code = deptemp[0].path;
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_key = deptemp[0].key;
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_orgCode = deptemp[0].orgCode;
                    cjgzzrz_vm.cjgzzrz_tree_vm.tree_title = deptemp[0].title;
                }

                cjgzzrz_vm.tree_init = true;
            });


            if (storage_item) {
                cjgzzrz_startTime_vm.cjgzzrz_startTime = storage_item.ajax_data.beginTime;
                cjgzzrz_endTime_vm.cjgzzrz_endTime = storage_item.ajax_data.endTime;
                cjgzzrz_time_range.select_time = true;

                this.included_status = storage_item.ajax_data.subOrg;
                man_category_vm.ajax_category = storage_item.ajax_data.operatorType;
                man_category_vm.category_val = new Array(storage_item.ajax_data.operatorType);
                this.police_id = storage_item.ajax_data.key || "";
                this.police_id_title = this.police_id || cjgzzrz_vm.cjgzzrz_language.rlbkInputTips;
                this.operatorName = storage_item.ajax_data.operatorObj || "";//操作内容
                this.police_name_title = this.operatorName || cjgzzrz_vm.cjgzzrz_language.rlbkInputTips;

                // this.table_pagination.total = storage_item.total;
                // this.loading = true;
                this.change_page = true;
                this.search_data = storage_item.ajax_data;
                this.search_data.beginTime = getTimeByDateStr(storage_item.ajax_data.beginTime);
                this.search_data.endTime = getTimeByDateStr(storage_item.ajax_data.endTime);

                this.table_pagination.current = storage_item.ajax_data.page + 1;

                // this.getTableList();
            } else {                
                this.included_status = includedStatus;
                man_category_vm.ajax_category = "01";
                man_category_vm.category_val = ["01"];
                this.police_id = "";
                this.change_page = false;
                this.search_data = {};
            }
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_CZRZ_CJGZZRZ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZNSB_RLSB_CK":
                            _this.opt_cjgzzrz.authority.CHECK = true;
                            break;
                        case "CAS_FUNC_CZRZ_CJGZZRZ_SEARCH":
                            _this.opt_cjgzzrz.authority.SEARCH = true;
                            break;
                    }
                });
                // 防止查询无权限时页面留白
                // if (false == _this.opt_cjgzzrz.authority.SEARCH)
                //     $(".znsb_cjgzzrz .cjgzzrz-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
            });
        },

        opt_cjgzzrz: avalon.define({
            $id: "opt_cjgzzrz",
            authority: { // 按钮权限标识
                "CHECK": false, 
                "SEARCH": false
            }
        }),

        cjgzzrz_tree_vm: avalon.define({
            $id: "cjgzzrz_tree",
            tree_data: [],
            tree_key: "",
            tree_title: "",
            tree_code: "",
            tree_orgCode:"",
            curTree: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.curTree = e.node.path;
                this.tree_orgCode = e.node.orgCode;
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

        searchBtn() {
            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数
            this.getTableList();
        },
        getTableList() {
            this.loading = true;
            let start_time, end_time;
            if (cjgzzrz_time_range.range_flag == "2") {
                start_time = cjgzzrz_startTime_vm.cjgzzrz_startTime;
                end_time = cjgzzrz_endTime_vm.cjgzzrz_endTime;
            }
            let ajax_data = {
                "subOrg": this.included_status,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": cjgzzrz_vm.cjgzzrz_tree_vm.curTree || cjgzzrz_vm.cjgzzrz_tree_vm.tree_code,
                "orgCode": cjgzzrz_vm.cjgzzrz_tree_vm.tree_orgCode,
                // "orgId": cjgzzrz_vm.cjgzzrz_tree_vm.tree_key,
                "operatorType": man_category_vm.ajax_category,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (cjgzzrz_vm.police_id) {
                ajax_data.key = $.trim(cjgzzrz_vm.police_id);
            }
            if (cjgzzrz_vm.operatorName) {
                ajax_data.operatorObj = $.trim(cjgzzrz_vm.operatorName);
            }

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;
         
            ajax({
                // url: '/api/recognition',
                url: '/gmvcs/uap/log/inter/wslist',
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
                    "subOrg": ajax_data.subOrg,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "operatorType": ajax_data.operatorType,
                    "key": ajax_data.key,
                    "operatorObj": ajax_data.operatorObj,//操作内容
                    "orgCode": ajax_data.orgCode,
                    "beginTime": start_time,
                    "endTime": end_time
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;

                    let storage_item = {
                        "ajax_data": temp_data,
                        "total": 0,
                        "tree_key": cjgzzrz_vm.cjgzzrz_tree_vm.tree_key,
                        "tree_title": cjgzzrz_vm.cjgzzrz_tree_vm.tree_title
                    };

                    storage.setItem('tyyhrzpt-xtpzgl-cjgzzrz', storage_item, 0.5);
                    return;
                }

                if (!this.change_page)
                    this.table_pagination.current = 1;

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].deviceName = (item.deviceName || "-") + "(" + (item.deviceId || "-") + ")"; //姓名（警号）
                    ret_data[index].name_id = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].time = moment(item.createTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
                });

                if (result.data.overLimit) {
                    this.page_type = true;
                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                } else {
                    this.page_type = false;
                    this.table_pagination.total = result.data.totalElements; //总条数
                }

                this.table_list = ret_data;
                this.loading = false;

                let storage_item = {
                    "ajax_data": temp_data,
                    "total": this.table_pagination.total,
                    "tree_key": cjgzzrz_vm.cjgzzrz_tree_vm.tree_key,
                    "tree_title": cjgzzrz_vm.cjgzzrz_tree_vm.tree_title
                };
                storage.setItem('tyyhrzpt-xtpzgl-cjgzzrz', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    if (e.target.value != "") {
                        this.police_id_title = e.target.value;
                    } else
                        this.police_id_title = cjgzzrz_vm.cjgzzrz_language.rlbkInputTips;
                    break;
                case 'operatorName':
                    if (e.target.value != "") {
                        this.police_name_title = e.target.value;
                    } else
                        this.police_name_title = cjgzzrz_vm.cjgzzrz_language.rlbkInputTips;
                    break;
            }
            if (e.keyCode == "13")
                this.searchBtn();
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id = "";
                    _this.police_id_title = cjgzzrz_vm.cjgzzrz_language.rlbkInputTips;
                    return false;
                    break;
                case 'operatorName':
                    _this.operatorName = "";
                    _this.police_name_title = cjgzzrz_vm.cjgzzrz_language.rlbkInputTips;
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".znsb_cjgzzrz .dataFormBox .police_id").width($(".cjgzzrz_input_panel").innerWidth() - 33);
                    break;
                case 'operatorName':
                    _this.police_name_close = true;
                    $(".znsb_cjgzzrz .dataFormBox .operatorName").width($(".cjgzzrz_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".znsb_cjgzzrz .dataFormBox .police_id").width($(".cjgzzrz_input_panel").innerWidth() - 23);
                    break;
                case 'operatorName':
                    _this.police_name_close = false;
                    $(".znsb_cjgzzrz .dataFormBox .operatorName").width($(".cjgzzrz_input_panel").innerWidth() - 23);
                    break;
            }
        }
    }
});

let cjgzzrz_time_range = avalon.define({
    $id: 'cjgzzrz_time_range',
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
    time_range: ["2"],
    range_flag: 2,
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            cjgzzrz_endTime_vm.end_null = "none";
            cjgzzrz_endTime_vm.cjgzzrz_endTime = moment().format('YYYY-MM-DD');
            cjgzzrz_startTime_vm.start_null = "none";
            cjgzzrz_startTime_vm.cjgzzrz_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let cjgzzrz_startTime_vm = avalon.define({
    $id: "cjgzzrz_startTime",
    cjgzzrz_endTime: moment().format('YYYY-MM-DD'),
    cjgzzrz_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        this.cjgzzrz_startTime = e.target.value;
    }
});

let cjgzzrz_endTime_vm = avalon.define({
    $id: "cjgzzrz_endTime",
    cjgzzrz_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.cjgzzrz_endTime = e.target.value;
    }
});

// 01-数据导入，02-数据导出，03-数据删除，04-数据查看，05-关机，06-重启，07-安全配置，08-设备接入、09-设备拔出、10-查看日志、11-用户登录 99-其他
let man_category_vm = avalon.define({
    $id: 'cjgzzrz_man_category',
    ajax_category: "01",
    category_options: [{
        value: "01",
        label: "数据导入"
    }, {
        value: "02",
        label: "数据导出"
    }, {
        value: "03",
        label: "数据删除"
    }, {
        value: "04",
        label: "数据查看"
    }, {
        value: "05",
        label: "关机"
    }, {
        value: "06",
        label: "重启"
    }, {
        value: "07",
        label: "安全配置"
    }, {
        value: "08",
        label: "设备接入"
    }, {
        value: "09",
        label: "设备拔出"
    }, {
        value: "10",
        label: "查看日志"
    }, {
        value: "11",
        label: "用户登录"
    }, {
        value: "99",
        label: "其他"
    }],
    category_val: ["01"],
    onChangeT(e) {
        let _this = this;
        _this.ajax_category = e.target.value;
    }
});


// ------------function---------------

function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}

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

    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();
}