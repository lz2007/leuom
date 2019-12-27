import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
export const name = "tyyhrzpt-xtpzgl-zfyrz";
require("./tyyhrzpt-xtpzgl-zfyrz.less");
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

let zfyrz_vm;
avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-zfyrz.html"),
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
        police_name: "",
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

        zfyrz_dialog_show: false,
        dialogCancel() {
            this.zfyrz_dialog_show = false;
        },
        dialogOk() {
            this.zfyrz_dialog_show = false;
        },

        tree_init: false,
        type_init: false,
        zfyrz_language: getLan(),
        extra_class: languageSelect == "en" ? true : false,
        onInit(e) {
            zfyrz_vm = e.vmodel;

            this.tree_init = false;
            // this.type_init = false;
            let storage_item = storage.getItem('tyyhrzpt-xtpzgl-zfyrz');

            this.$watch("included_status", (v) => {
                if (v)
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                else
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";

            });
            // this.$fire('included_status', this.included_status);//用于触发监听函数

            if (isTableSearch) {
                this.$watch("tree_init", (v) => {
                    if (v && zfyrz_vm.tree_init) {
                        if (storage_item)
                        zfyrz_vm.getTableList();
                        else
                        zfyrz_vm.searchBtn();
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
                zfyrz_vm.zfyrz_tree_vm.tree_data = deptemp;

                if (storage_item) {
                    zfyrz_vm.zfyrz_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    zfyrz_vm.zfyrz_tree_vm.tree_orgCode = storage_item.ajax_data.orgCode;
                    zfyrz_vm.zfyrz_tree_vm.tree_key = storage_item.tree_key;
                    zfyrz_vm.zfyrz_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    zfyrz_vm.zfyrz_tree_vm.tree_code = deptemp[0].path;
                    zfyrz_vm.zfyrz_tree_vm.tree_orgCode = deptemp[0].orgCode;
                    zfyrz_vm.zfyrz_tree_vm.tree_key = deptemp[0].key;
                    zfyrz_vm.zfyrz_tree_vm.tree_title = deptemp[0].title;
                }

                zfyrz_vm.tree_init = true;
            });

            if (storage_item) {
                zfyrz_startTime_vm.zfyrz_startTime = storage_item.ajax_data.beginTime;
                zfyrz_endTime_vm.zfyrz_endTime = storage_item.ajax_data.endTime;
                zfyrz_time_range.select_time = true;

                this.included_status = storage_item.ajax_data.subOrg;
                man_category_vm.ajax_category = storage_item.ajax_data.operatorType;
                man_category_vm.category_val = [storage_item.ajax_data.operatorType];
                this.police_id = storage_item.ajax_data.key || "";
             
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
                    if (/^CAS_FUNC_CZRZ_ZFYRZ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                // if (func_list.length == 0) {
                //     // 防止查询无权限时页面留白
                //     $(".znsb_zfyrz .zfyrz-table .common-list-panel").css("cssText", "position: 'absolute'; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
                //     return;
                // }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZNSB_RLSB_CK":
                            _this.opt_zfyrz.authority.CHECK = true;
                            break;
                        case "CAS_FUNC_CZRZ_ZFYRZ_SEARCH":
                            _this.opt_zfyrz.authority.SEARCH = true;
                            break;
                    }
                });
               

                // 防止查询无权限时页面留白
                // if (false == _this.opt_zfyrz.authority.SEARCH)
                //     $(".znsb_zfyrz .zfyrz-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
            });
        },

        opt_zfyrz: avalon.define({
            $id: "opt_zfyrz",
            authority: { // 按钮权限标识
                "CHECK": false, 
                "SEARCH": false
            }
        }),

        zfyrz_tree_vm: avalon.define({
            $id: "zfyrz_tree",
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

            if (zfyrz_time_range.range_flag == "2") {
                start_time = zfyrz_startTime_vm.zfyrz_startTime;
                end_time = zfyrz_endTime_vm.zfyrz_endTime;
            }

            let ajax_data = {
                "operatorType": man_category_vm.ajax_category,
                "orgPath": zfyrz_vm.zfyrz_tree_vm.curTree || zfyrz_vm.zfyrz_tree_vm.tree_code,
                "orgCode": zfyrz_vm.zfyrz_tree_vm.tree_orgCode,
                // "orgId": zfyrz_vm.zfyrz_tree_vm.tree_key,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true),
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "subOrg": this.included_status
            };
            

            if (zfyrz_vm.police_id) {
                ajax_data.key = $.trim(zfyrz_vm.police_id);
            }


            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;
            ajax({
                // url: '/api/recognition',
                url: '/gmvcs/uap/log/inter/dsjlist',
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
                    "orgCode": ajax_data.orgCode,
                    "orgPath": ajax_data.orgPath,
                    "operatorType": ajax_data.operatorType,
                    "key": ajax_data.key,
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
                        "orgCode": zfyrz_vm.zfyrz_tree_vm.tree_orgCode,
                        "tree_key": zfyrz_vm.zfyrz_tree_vm.tree_key,
                        "tree_title": zfyrz_vm.zfyrz_tree_vm.tree_title
                    };

                    storage.setItem('tyyhrzpt-xtpzgl-zfyrz', storage_item, 0.5);
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
                    ret_data[index].time = moment(item.operationTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
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
                    "orgCode": zfyrz_vm.zfyrz_tree_vm.tree_orgCode,
                    "tree_key": zfyrz_vm.zfyrz_tree_vm.tree_key,
                    "tree_title": zfyrz_vm.zfyrz_tree_vm.tree_title
                };
                storage.setItem('tyyhrzpt-xtpzgl-zfyrz', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    if (e.target.value != "") {
                        this.police_id_title = e.target.value;
                    } else
                        this.police_id_title = zfyrz_vm.zfyrz_language.rlbkInputTips;
                    break;
                case 'police_name':
                    if (e.target.value != "") {
                        this.police_name_title = e.target.value;
                    } else
                        this.police_name_title = zfyrz_vm.zfyrz_language.rlbkInputTips;
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
                    _this.police_id_title = zfyrz_vm.zfyrz_language.rlbkInputTips;
                    return false;
                    break;
                case 'police_name':
                    _this.police_name = "";
                    _this.police_name_title = zfyrz_vm.zfyrz_language.rlbkInputTips;
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".znsb_zfyrz .dataFormBox .police_id").width($(".zfyrz_input_panel").innerWidth() - 33);
                    break;
                case 'police_name':
                    _this.police_name_close = true;
                    $(".znsb_zfyrz .dataFormBox .police_name").width($(".zfyrz_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".znsb_zfyrz .dataFormBox .police_id").width($(".zfyrz_input_panel").innerWidth() - 23);
                    break;
                case 'police_name':
                    _this.police_name_close = false;
                    $(".znsb_zfyrz .dataFormBox .police_name").width($(".zfyrz_input_panel").innerWidth() - 23);
                    break;
            }
        }
    }
});

let zfyrz_time_range = avalon.define({
    $id: 'zfyrz_time_range',
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
            zfyrz_endTime_vm.end_null = "none";
            zfyrz_endTime_vm.zfyrz_endTime = moment().format('YYYY-MM-DD');
            zfyrz_startTime_vm.start_null = "none";
            zfyrz_startTime_vm.zfyrz_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let zfyrz_startTime_vm = avalon.define({
    $id: "zfyrz_startTime",
    zfyrz_endTime: moment().format('YYYY-MM-DD'),
    zfyrz_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        this.zfyrz_startTime = e.target.value;
    }
});

let zfyrz_endTime_vm = avalon.define({
    $id: "zfyrz_endTime",
    zfyrz_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfyrz_endTime = e.target.value;
    }
});
// 01-开机，02-关机，03-开始录像，04-结束录像，05-开始录音，06-结束录音，07-拍照，08-USB联机，09-USB联机断开，10-回放，99-其它
let man_category_vm = avalon.define({
    $id: 'zfyrz_man_category',
    ajax_category: "01",
    category_options: [{
        value: "01",
        label: "开机"
    }, {
        value: "02",
        label: "关机"
    }, {
        value: "03",
        label: "开始录像"
    }, {
        value: "04",
        label: "结束录像"
    }, {
        value: "05",
        label: "开始录音"
    }, {
        value: "06",
        label: "结束录音"
    }, {
        value: "07",
        label: "拍照"
    }, {
        value: "08",
        label: "USB联机"
    }, {
        value: "09",
        label: "USB联机断开"
    }, {
        value: "10",
        label: "回放"
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

let man_type_vm = avalon.define({
    $id: 'zfyrz_man_type',
    ajax_type: "",
    type_options: [],
    type_val: [""],
    onChangeT(e) {
        let _this = this;
        _this.ajax_type = e.target.value;
    }
});

let zfyrz_dialog_vm = avalon.define({
    $id: "zfyrz_dialog",
    title: getLan().imageContrast,
    resemblance: getLan().resemblance,
    sceneImgTxt: getLan().sceneImgTxt,
    recognitionImgTxt: getLan().recognitionImgTxt,
    extra_class_dialog: languageSelect == "en" ? true : false,
    scene_img: "",
    recognition_img: ""
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