import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import {
    apiUrl
} from '/services/configService';
let storage = require('/services/storageService.js').ret;
export const name = "tyyhrzpt-xtpzgl-htglxtrz";
require("./tyyhrzpt-xtpzgl-htglxtrz.less");
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

let htglxtrz_vm;
avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-htglxtrz.html"),
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
        operatorName_title: getLan().rlbkInputTips,
        operatorName_close: false,

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

        isSearch: false,
        czrzExport() {
            if (!this.isSearch) {
                return;
            }
            let start_time, end_time;
            start_time = htglxtrz_startTime_vm.htglxtrz_startTime;
            end_time = htglxtrz_endTime_vm.htglxtrz_endTime;

            let ajax_data = {
                "subOrg": this.included_status,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": htglxtrz_vm.htglxtrz_tree_vm.curTree || htglxtrz_vm.htglxtrz_tree_vm.tree_code,
                "appCode": man_category_vm.ajax_category,
                // "operator": man_category_vm.ajax_category,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };
           

            if (htglxtrz_vm.police_id) {
                ajax_data.key = $.trim(htglxtrz_vm.police_id);
            }
            if (htglxtrz_vm.operatorName) {
                ajax_data.operator = $.trim(htglxtrz_vm.operatorName);//操作内容
            }
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;
            
            let data = 'subOrg=' + ajax_data.subOrg + '&page=' + ajax_data.page + '&pageSize=' + ajax_data.pageSize + '&orgPath=' + ajax_data.orgPath
                + '&key=' + (ajax_data.key ? ajax_data.key : '') 
                + '&operator=' + (ajax_data.operator?ajax_data.operator:'') 
                + '&appCode=' + ajax_data.appCode
                + '&beginTime=' + ajax_data.beginTime + '&endTime=' + ajax_data.endTime;
            window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/log/inter/export?" + data; //远程服务器使用
        },
        tree_init: false,
        app_init: false,
        htglxtrz_language: getLan(),
        extra_class: languageSelect == "en" ? true : false,
        onInit(e) {
            htglxtrz_vm = e.vmodel;

            this.tree_init = false;
            this.app_init = false;
            let storage_item = storage.getItem('tyyhrzpt-xtpzgl-htglxtrz');

            this.$watch("included_status", (v) => {
                if (v)
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                else
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";

            });
            // this.$fire('included_status', this.included_status);//用于触发监听函数

            if (isTableSearch) { 
                this.$watch("tree_init", (v) => {
                    if (v && htglxtrz_vm.tree_init) {
                        if (storage_item)
                        htglxtrz_vm.getTableList();
                        else
                        htglxtrz_vm.searchBtn();
                    }
                });
                this.$watch("app_init", (v) => {
                    if (v && htglxtrz_vm.app_init) {
                        if (storage_item)
                        htglxtrz_vm.getTableList();
                        else
                        htglxtrz_vm.searchBtn();
                    }
                });
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
                htglxtrz_vm.htglxtrz_tree_vm.tree_data = deptemp;

                if (storage_item) {
                    htglxtrz_vm.htglxtrz_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    htglxtrz_vm.htglxtrz_tree_vm.tree_key = storage_item.tree_key;
                    htglxtrz_vm.htglxtrz_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    htglxtrz_vm.htglxtrz_tree_vm.tree_code = deptemp[0].path;
                    htglxtrz_vm.htglxtrz_tree_vm.tree_key = deptemp[0].key;
                    htglxtrz_vm.htglxtrz_tree_vm.tree_title = deptemp[0].title;
                }
                
                this.allSys();
            });


            if (storage_item) {
                htglxtrz_startTime_vm.htglxtrz_startTime = storage_item.ajax_data.beginTime;
                htglxtrz_endTime_vm.htglxtrz_endTime = storage_item.ajax_data.endTime;
                htglxtrz_time_range.select_time = true;

                this.included_status = storage_item.ajax_data.subOrg;
                man_category_vm.ajax_category = storage_item.ajax_data.appCode;//应用系统
                man_category_vm.category_val = new Array(storage_item.ajax_data.appCode);
                this.police_id = storage_item.ajax_data.key || "";//警员
                this.police_id_title = this.police_id || htglxtrz_vm.htglxtrz_language.rlbkInputTips;
                this.operatorName = storage_item.ajax_data.operator || "";//操作内容
                this.operatorName_title = this.operatorName || htglxtrz_vm.htglxtrz_language.rlbkInputTips;

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
                this.police_id = "";
                this.operatorName = "";
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
                    if (/^CAS_FUNC_CZRZ_HTGLXTRZ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".znsb_htglxtrz .htglxtrz-table .common-list-panel").css("cssText", "position: 'absolute'; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_CZRZ_HTGLXTRZ_DCRZ":
                            _this.opt_htglxtrz.authority.EXPORT = true;
                            break;
                        case "CAS_FUNC_CZRZ_HTGLXTRZ_SEARCH":
                            _this.opt_htglxtrz.authority.SEARCH = true;
                            break;
                    }
                });
                

                // 防止查询无权限时页面留白
                // if (false == _this.opt_htglxtrz.authority.SEARCH)
                //     $(".znsb_htglxtrz .htglxtrz-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
            });
        },

        opt_htglxtrz: avalon.define({
            $id: "opt_htglxtrz",
            authority: { // 按钮权限标识
                "EXPORT": false, //导出
                "SEARCH": false //查询
            }
        }),
        allSys() {
            ajax({
                url: '/gmvcs/uap/app/all',
                method: 'get'
            }).then(result => {
                if (result.data) {
                    if (result.data) {
                        let r = result.data;
                        let optJs = [];
                        for (let i = 0; i < r.length; i++) {
                            optJs[i] = new Object();
                            optJs[i].label = r[i].name;
                            optJs[i].value = r[i].code;
                        }
                        if (optJs.length > 0) {
                            man_category_vm.category_options = optJs;
                            man_category_vm.ajax_category = optJs[0].value;
                            man_category_vm.category_val = [optJs[0].value];
                        }
                    }
                }
                htglxtrz_vm.tree_init = true;
                htglxtrz_vm.app_init = true;
            });
        },
        
        htglxtrz_tree_vm: avalon.define({
            $id: "htglxtrz_tree",
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
            this.isSearch = true;
            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数
            this.getTableList();
        },
        getTableList() {
            this.loading = true;
            let start_time, end_time;
            start_time = htglxtrz_startTime_vm.htglxtrz_startTime;
            end_time = htglxtrz_endTime_vm.htglxtrz_endTime;

            let ajax_data = {
                "subOrg": this.included_status,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": htglxtrz_vm.htglxtrz_tree_vm.curTree || htglxtrz_vm.htglxtrz_tree_vm.tree_code,
                "appCode": man_category_vm.ajax_category,
                // "operator": man_category_vm.ajax_category,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };
           

            if (htglxtrz_vm.police_id) {
                ajax_data.key = $.trim(htglxtrz_vm.police_id);
            }
            if (htglxtrz_vm.operatorName) {
                ajax_data.operator = $.trim(htglxtrz_vm.operatorName);//操作内容
            }
            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;
            ajax({
                // url: '/api/recognition',
                url: '/gmvcs/uap/log/inter/list',
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
                    "appCode": ajax_data.appCode,//应用系统
                    "beginTime": start_time,
                    "endTime": end_time,
                    "key": ajax_data.key || "",//警员姓名
                    "operator": ajax_data.operator || ""//操作内容
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;

                    let storage_item = {
                        "ajax_data": temp_data,
                        "total": 0,
                        "tree_key": htglxtrz_vm.htglxtrz_tree_vm.tree_key,
                        "tree_title": htglxtrz_vm.htglxtrz_tree_vm.tree_title
                    };

                    storage.setItem('tyyhrzpt-xtpzgl-htglxtrz', storage_item, 0.5);
                    return;
                }

                if (!this.change_page)
                    this.table_pagination.current = 1;

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
               
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    
                    ret_data[index].name_id = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].time = moment(item.insertTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
                    ret_data[index].orgCode = (ret_data[index].orgPath).split("/")[(ret_data[index].orgPath).split("/").length-2];
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
                    "range_flag": htglxtrz_time_range.range_flag,
                    "total": this.table_pagination.total,
                    "tree_key": htglxtrz_vm.htglxtrz_tree_vm.tree_key,
                    "tree_title": htglxtrz_vm.htglxtrz_tree_vm.tree_title
                };
                storage.setItem('tyyhrzpt-xtpzgl-htglxtrz', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    if (e.target.value != "") {
                        this.police_id_title = e.target.value;
                    } else {
                        this.police_id_title = htglxtrz_vm.htglxtrz_language.rlbkInputTips;
                    }
                    break;
                case 'operatorName':
                    if (e.target.value != "") {
                        this.operatorName_title = e.target.value;
                    } else
                        this.operatorName_title = htglxtrz_vm.htglxtrz_language.rlbkInputTips;
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
                    _this.police_id_title = htglxtrz_vm.htglxtrz_language.rlbkInputTips;
                    return false;
                    break;
                case 'operatorName':
                    _this.operatorName = "";
                    _this.operatorName_title = htglxtrz_vm.htglxtrz_language.rlbkInputTips;
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".znsb_htglxtrz .dataFormBox .police_id").width($(".htglxtrz_input_panel").innerWidth() - 33);
                    break;
                case 'operatorName':
                    _this.operatorName_close = true;
                    $(".znsb_htglxtrz .dataFormBox .operatorName").width($(".htglxtrz_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".znsb_htglxtrz .dataFormBox .police_id").width($(".htglxtrz_input_panel").innerWidth() - 23);
                    break;
                case 'operatorName':
                    _this.operatorName_close = false;
                    $(".znsb_htglxtrz .dataFormBox .operatorName").width($(".htglxtrz_input_panel").innerWidth() - 23);
                    break;
            }
        }
    }
});

let htglxtrz_time_range = avalon.define({
    $id: 'htglxtrz_time_range',
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
            htglxtrz_endTime_vm.end_null = "none";
            htglxtrz_endTime_vm.htglxtrz_endTime = moment().format('YYYY-MM-DD');
            htglxtrz_startTime_vm.start_null = "none";
            htglxtrz_startTime_vm.htglxtrz_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let htglxtrz_startTime_vm = avalon.define({
    $id: "htglxtrz_startTime",
    htglxtrz_endTime: moment().format('YYYY-MM-DD'),
    htglxtrz_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        this.htglxtrz_startTime = e.target.value;
    }
});

let htglxtrz_endTime_vm = avalon.define({
    $id: "htglxtrz_endTime",
    htglxtrz_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.htglxtrz_endTime = e.target.value;
    }
});

let man_category_vm = avalon.define({
    $id: 'htglxtrz_man_category',
    ajax_category: "",
    category_options: [],
    category_val: [""],
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