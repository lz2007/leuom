import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
export const name = "zfsypsjglpt-znsb-rzhy";
require("./zfsypsjglpt-znsb-rzhy.less");
import '/apps/common/common-ms-table';
import '/services/filterService';
import * as menuServer from '/services/menuService';
import {
    orgIcon,
    isDevice
} from "/apps/common/common-gb28181-tyywglpt-device-type";

let language_txt = require('/vendor/language').language;
let {
    languageSelect,
    isTableSearch
} = require('/services/configService');
let {
    dep_switch,
    includedStatus
} = require('/services/configService');
let rzhy_vm;
avalon.component(name, {
    template: __inline("./zfsypsjglpt-znsb-rzhy.html"),
    defaults: {
        key_dep_switch: dep_switch,

        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },
        included_dep_img: "",
        police_id: "",
        police_id_title: getLan().rzhyInputTips,
        police_id_close: false,
        police_name: "",
        police_name_title: getLan().rzhyInputTips,
        police_name_close: false,

        personIdCard: "",
        personCertificateId_title: getLan().rzhyInputTips,
        personCertificateId_close: false,
        noOrgData: true, // 是否无部门数据

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
            this.loading = true;
            this.getTableList();
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },

        search_data: {},
        table_list: [],
        loading: false,
        checksDocData: {},

        echart_option: {
            color: ['#c2c2c2', '#be3335'].reverse(),
            series: [{
                hoverAnimation: false,
                type: 'pie',
                radius: ['80%', '100%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: false,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [{
                        value: 98
                    },
                    {
                        value: 2
                    }
                ]
            }],
            graphic: [{
                id: 'percent_txt',
                type: 'text',
                style: {
                    text: '98%',
                    x: 35,
                    y: 70,
                    fill: '#be3335',
                    font: '32px "Microsoft YaHei", sans-serif'
                }
            }]
        },

        actions(type, text, record, index) {
            if (type == "check") {
                storage.setItem('zfsypsjglpt-znsb-rzhy-recordID', record);
                $('.zfsypsjglpt-map').css({
                    'position': 'absolute',
                    'width': 'auto',
                    'left': '210px',
                    'right': '20px',
                    'height': '392px',
                    'bottom': '8px',
                    'top': '180px'
                });
                avalon.history.setHash("/zfsypsjglpt-znsb-rzhy-detail");
            }
            // if (type == "comparison") {
            //     rzhy_dialog_vm.scene_img = record.shootPersonImgFilePath;
            //     rzhy_dialog_vm.recognition_img = record.personRegImgFilePath;
            //     rzhy_dialog_vm.title = record.personName + '的' + getLan().imageContrast;
            //     this.rzhy_dialog_show = true;

            //     rzhy_vm.echart_option.series[0].data = [{
            //             value: Number(record.personSimilarity).toFixed(2)
            //         },
            //         {
            //             value: (100 - Number(record.personSimilarity)).toFixed(2)
            //         }
            //     ];
            //     rzhy_vm.echart_option.graphic[0].style.text = Number(record.personSimilarity).toFixed(2) + "%";

            //     let echart = echarts.init(document.getElementById("show_percent"));
            //     echart.setOption(rzhy_vm.echart_option);
            // }
        },

        rzhy_dialog_show: false,
        dialogCancel() {
            this.rzhy_dialog_show = false;
        },
        dialogOk() {
            this.rzhy_dialog_show = false;
        },

        tree_init: false,
        type_init: false,
        rzhy_language: getLan(),
        extra_class: languageSelect == "en" ? true : false,
        onInit(e) {
            rzhy_vm = e.vmodel;

            this.tree_init = false;
            this.type_init = false;
            let storage_item = storage.getItem('zfsypsjglpt-znsb-rzhy');

            this.$watch("included_status", (v) => {
                if (v)
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                else
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";

            });
            // this.$fire('included_status', this.included_status);//用于触发监听函数

            if (isTableSearch) {
                this.$watch("tree_init", (v) => {
                    if (v && this.type_init) {
                        if (storage_item)
                            this.getTableList();
                        else
                            this.searchBtn();
                    }
                });
                this.$fire('tree_init', this.tree_init);
    
                this.$watch("type_init", (v) => {
                    if (v && this.tree_init) {
                        if (storage_item)
                            this.getTableList();
                        else
                            this.searchBtn();
                    }
                });
                this.$fire('type_init', this.type_init);
            }

            let deptemp = [];
            ajax({
                // url: '/gmvcs/uap/org/find/fakeroot/mgr',
                url: '/gmvcs/uom/device/gb28181/v1/view/getPlatformView',
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

                if(result.data.length === 0) {
                    notification.warn({
                        message: '暂无所属部门，请于运维中心设置视图！',
                        title: '通知'
                    });
                    rzhy_vm.noOrgData = true;
                    return;
                }
                rzhy_vm.noOrgData = false;
                getDepTree(result.data, deptemp);
                rzhy_vm.rzhy_tree_vm.tree_data = deptemp;

                if (storage_item) {
                    rzhy_vm.rzhy_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    rzhy_vm.rzhy_tree_vm.tree_key = storage_item.tree_key;
                    rzhy_vm.rzhy_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    rzhy_vm.rzhy_tree_vm.tree_code = deptemp[0].path;
                    rzhy_vm.rzhy_tree_vm.tree_key = deptemp[0].key;
                    rzhy_vm.rzhy_tree_vm.tree_title = deptemp[0].title;
                }

                this.tree_init = true;
            });

            ajax({
                url: '/gmvcs/uap/person/type/listAll',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取人员类型失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                let ret_data = [{
                    value: "buxian",
                    label: getLan().all,
                }];

                for (let i = 0; i < result.data.length; i++) {
                    let obj = {
                        value: result.data[i].id,
                        label: result.data[i].name,
                    }
                    ret_data.push(obj);
                }

                man_type_vm.type_options = ret_data;
                if (storage_item) {
                    man_type_vm.type_val = new Array(storage_item.ajax_data.personType || "buxian");
                    man_type_vm.ajax_type = storage_item.ajax_data.personType || "buxian";
                } else {
                    man_type_vm.type_val = new Array(ret_data[0].value);
                    man_type_vm.ajax_type = ret_data[0].value;
                }

                this.type_init = true;
            });

            if (storage_item) {
                rzhy_time_range.range_flag = storage_item.range_flag;
                rzhy_time_range.time_range = new Array(storage_item.range_flag.toString());
                if (rzhy_time_range.range_flag == 2) {
                    rzhy_startTime_vm.rzhy_startTime = storage_item.ajax_data.beginTime;
                    rzhy_endTime_vm.rzhy_endTime = storage_item.ajax_data.endTime;
                    rzhy_time_range.select_time = true;
                }

                this.included_status = storage_item.ajax_data.includeChild;
                man_category_vm.ajax_category = storage_item.ajax_data.policeType || "buxian";
                man_category_vm.category_val = new Array(storage_item.ajax_data.policeType || "buxian");
                this.police_id = storage_item.ajax_data.jy || "";
                this.police_id_title = this.police_id || rzhy_vm.rzhy_language.rzhyInputTips;
                this.police_name = storage_item.ajax_data.personSpellAbbr || "";
                this.police_name_title = this.police_name || rzhy_vm.rzhy_language.rzhyInputTips;
                this.personIdCard = storage_item.ajax_data.personIdCard || "";
                this.personCertificateId_title = this.personIdCard || rzhy_vm.rzhy_language.rzhyInputTips;

                // this.table_pagination.total = storage_item.total;
                // this.loading = true;
                this.change_page = true;
                this.search_data = storage_item.ajax_data;
                this.search_data.beginTime = getTimeByDateStr(storage_item.ajax_data.beginTime);
                this.search_data.endTime = getTimeByDateStr(storage_item.ajax_data.endTime);

                this.table_pagination.current = storage_item.ajax_data.page + 1;

                // this.getTableList();
            } else {
                rzhy_time_range.range_flag = 0;
                rzhy_time_range.time_range = ["0"];
                this.included_status = includedStatus;
                man_category_vm.ajax_category = "buxian";
                man_category_vm.category_val = ["buxian"];
                this.police_id = "";
                this.police_name = "";
                this.personIdCard = "";
                this.change_page = false;
                this.search_data = {};
                // this.searchBtn();
            }
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZNSB_RZHY/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".znsb_rzhy .rzhy-table .common-list-panel").css("cssText", "position: 'absolute'; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZNSB_RZHY_CK":
                            _this.opt_rzhy.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_ZNSB_RZHY_CX":
                            _this.opt_rzhy.authority.SEARCH = true;
                            break;
                    }
                });
                if (false == _this.opt_rzhy.authority.CHECK)
                    _this.opt_rzhy.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                // if (false == _this.opt_rzhy.authority.SEARCH)
                //     $(".znsb_rzhy .rzhy-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
            });
            $('.common-layout').addClass('common-layout-minclass-rzhy');
        },

        onDispose() {
            $('.common-layout').removeClass('zcommon-layout-minclass-rzhy');
        },

        opt_rzhy: avalon.define({
            $id: "opt_rzhy",
            authority: { // 按钮权限标识
                "CHECK": false, //智能识别-人脸布控-查看
                "SEARCH": false, //智能识别-人脸布控-查询
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        rzhy_tree_vm: avalon.define({
            $id: "rzhy_tree",
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
                    // url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
                    url: '/gmvcs/uom/device/gb28181/v1/view/ViewItemNew?parentRid=' + treeNode.parentRid + '&superiorPlatformId=' + treeNode.superiorPlatformId,
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
            // 部门树无视图不查询
            if(this.noOrgData) {
                notification.warn({
                    title: '通知',
                    message: '暂无所属部门，请于运维中心设置视图！'
                });
                return;
            };
            this.loading = true;
            let start_time, end_time;
            if (rzhy_time_range.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (rzhy_time_range.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (rzhy_time_range.range_flag == "2") {
                start_time = rzhy_startTime_vm.rzhy_startTime;
                end_time = rzhy_endTime_vm.rzhy_endTime;
            }

            let startTime = start_time.split('-').join('');
            let endTime = end_time.split('-').join('');
            if (Number(startTime) > Number(endTime)) {
                notification.warn({
                    title: '通知',
                    message: '开始时间不能大于结束时间'
                });
                this.loading = false;
                return;
            }
            let ajax_data = {
                "includeChild": this.included_status,
                "orgPath": rzhy_vm.rzhy_tree_vm.curTree || rzhy_vm.rzhy_tree_vm.tree_code,
                // "policeType": man_category_vm.ajax_category == "buxian" ? "" : man_category_vm.ajax_category,
                // "personType": rzhy_SevenMan_category.ajax_category == "buxian" ? "" : rzhy_SevenMan_category.ajax_category,
                "itsNormal": rzhy_compareResult_select.ajax_category,
                // "compareResult": rzhy_compareResult_category.ajax_category == "buxian" ? "" : rzhy_compareResult_category.ajax_category,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (this.police_id)
                ajax_data.jy = $.trim(this.police_id);

            if (this.police_name)
                ajax_data.personName = $.trim(this.police_name);

            if (this.personIdCard)
                ajax_data.personIdCard = $.trim(this.personIdCard);

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;

            ajax({
                // url: '/api/recognition',
                // url: '/gmvcs/instruct/idcard/monitoring/search/recognition',
                url: '/gmvcs/instruct/key-person/monitoring/search/recognition',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    this.loading = false;
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                let temp_data = {
                    "includeChild": ajax_data.includeChild,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "policeType": ajax_data.policeType,
                    "personType": ajax_data.personType,
                    "beginTime": start_time,
                    "endTime": end_time,
                    "jy": ajax_data.jy || "",
                    "personIdCard": ajax_data.personIdCard || ""
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;

                    let storage_item = {
                        "ajax_data": temp_data,
                        "range_flag": rzhy_time_range.range_flag,
                        "total": 0,
                        "tree_key": rzhy_vm.rzhy_tree_vm.tree_key,
                        "tree_title": rzhy_vm.rzhy_tree_vm.tree_title
                    };

                    storage.setItem('zfsypsjglpt-znsb-rzhy', storage_item, 0.5);
                    return;
                }

                if (!this.change_page)
                    this.table_pagination.current = 1;

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    if (languageSelect == "zhcn") {
                        ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "警员" : "辅警"; //人员类别
                        ret_data[index].personIsConsistent = item.isNormal ? "正常" : "异常";
                        ret_data[index].isNormal = item.isNormal;
                    } else {
                        ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "Police" : "Auxiliary Police"; //人员类别
                        ret_data[index].sex = item.personGender == 1 ? "Male" : "Female";
                    }
                    ret_data[index].name_id = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].time = moment(item.shootTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
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
                    "range_flag": rzhy_time_range.range_flag,
                    "total": this.table_pagination.total,
                    "tree_key": rzhy_vm.rzhy_tree_vm.tree_key,
                    "tree_title": rzhy_vm.rzhy_tree_vm.tree_title
                };
                storage.setItem('zfsypsjglpt-znsb-rzhy', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    if (e.target.value != "") {
                        this.police_id_title = e.target.value;
                    } else
                        this.police_id_title = rzhy_vm.rzhy_language.rzhyInputTips;
                    break;
                case 'police_name':
                    if (e.target.value != "") {
                        this.police_name_title = e.target.value;
                    } else
                        this.police_name_title = rzhy_vm.rzhy_language.rzhyInputTips;
                    break;
                case 'personIdCard':
                    if (e.target.value != "") {
                        this.personCertificateId_title = e.target.value;
                    } else
                        this.personCertificateId_title = rzhy_vm.rzhy_language.rzhyInputTips;
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
                    _this.police_id_title = rzhy_vm.rzhy_language.rzhyInputTips;
                    return false;
                    break;
                case 'police_name':
                    _this.police_name = "";
                    _this.police_name_title = rzhy_vm.rzhy_language.rzhyInputTips;
                    return false;
                    break;
                case 'personIdCard':
                    _this.personIdCard = "";
                    _this.personCertificateId_title = rzhy_vm.rzhy_language.rzhyInputTips;
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".znsb_rzhy .dataFormBox .police_id").width($(".rzhy_input_panel").innerWidth() - 33);
                    break;
                case 'police_name':
                    _this.police_name_close = true;
                    $(".znsb_rzhy .dataFormBox .police_name").width($(".rzhy_input_panel").innerWidth() - 33);
                    break;
                case 'personIdCard':
                    _this.personCertificateId_close = true;
                    $(".znsb_rzhy .dataFormBox .personIdCard").width($(".rzhy_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".znsb_rzhy .dataFormBox .police_id").width($(".rzhy_input_panel").innerWidth() - 23);
                    break;
                case 'police_name':
                    _this.police_name_close = false;
                    $(".znsb_rzhy .dataFormBox .police_name").width($(".rzhy_input_panel").innerWidth() - 23);
                    break;
                case 'personIdCard':
                    _this.personCertificateId_close = false;
                    $(".znsb_rzhy .dataFormBox .personIdCard").width($(".rzhy_input_panel").innerWidth() - 23);
                    break;
            }
        }
    }
});

let rzhy_time_range = avalon.define({
    $id: 'rzhy_time_range',
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
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            rzhy_endTime_vm.end_null = "none";
            rzhy_endTime_vm.rzhy_endTime = moment().format('YYYY-MM-DD');
            rzhy_startTime_vm.start_null = "none";
            rzhy_startTime_vm.rzhy_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let rzhy_startTime_vm = avalon.define({
    $id: "rzhy_startTime",
    rzhy_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        this.rzhy_startTime = e.target.value;
    }
});

let rzhy_endTime_vm = avalon.define({
    $id: "rzhy_endTime",
    rzhy_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.rzhy_endTime = e.target.value;
    }
});

//人员类别
let man_category_vm = avalon.define({
    $id: 'rzhy_man_category',
    ajax_category: "buxian",
    category_options: [{
        value: "buxian",
        label: getLan().all
    }, {
        value: "LEVAM_JYLB_JY",
        label: getLan().police
    }, {
        value: "LEVAM_JYLB_FJ",
        label: getLan().auxiliaryPolice
    }],
    category_val: ["buxian"],
    onChangeT(e) {
        let _this = this;
        _this.ajax_category = e.target.value;
    }
});

//被查人七类库人员类别 0：正常；1：在逃人员；2：精神病肇事；3：控申重点人员；4：上访人员；5：涉稳人员；6：吸毒重点人员；7：刑事犯罪人员；不传或者空字符串：不限
let rzhy_SevenMan_category = avalon.define({
    $id: 'rzhy_SevenMan_category',
    ajax_category: "buxian",
    category_options: [{
        value: "buxian",
        label: "不限"
    }, {
        value: "0",
        label: "正常"
    }, {
        value: "1",
        label: "在逃人员"
    }, {
        value: "2",
        label: "精神病肇事"
    }, {
        value: "3",
        label: "控申重点人员"
    }, {
        value: "4",
        label: "上访"
    }, {
        value: "5",
        label: "涉稳人员"
    }, {
        value: "6",
        label: "吸毒重点人员"
    }, {
        value: "7",
        label: "刑事犯罪人员"
    }],
    category_val: ["buxian"],
    onChangeT(e) {
        let _this = this;
        _this.ajax_category = e.target.value;
    }
});

//人证比对结果(0：不一致；1：一致；不传或者空字符串：不限)
let rzhy_compareResult_category = avalon.define({
    $id: 'rzhy_compareResult_category',
    ajax_category: "buxian",
    category_options: [{
        value: "buxian",
        label: "不限"
    }, {
        value: "0",
        label: "不一致"
    }, {
        value: "1",
        label: "一致"
    }],
    category_val: ["buxian"],
    onChangeT(e) {
        let _this = this;
        _this.ajax_category = e.target.value;
    }
});

//人证比对结果(0：不一致；1：一致；不传或者空字符串：不限)
let rzhy_compareResult_select = avalon.define({
    $id: 'rzhy_compareResult_select',
    ajax_category: null,
    category_options: [{
        value: "buxian",
        label: "不限",
        data: null
    }, {
        value: "0",
        label: "正常",
        data: true
    }, {
        value: "1",
        label: "异常",
        data: false
    }],
    category_val: ["buxian"],
    onChangeT(e) {
        let _this = this;
        for(let i in this.category_options) {
            if(e.target.value === this.category_options[i].value) {
                _this.ajax_category = this.category_options[i].data;
            }
        }
    }
});

let man_type_vm = avalon.define({
    $id: 'rzhy_man_type',
    ajax_type: "",
    type_options: [],
    type_val: [""],
    onChangeT(e) {
        let _this = this;
        _this.ajax_type = e.target.value;
    }
});

let rzhy_dialog_vm = avalon.define({
    $id: "rzhy_dialog",
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

    for (let i = 0, len = treelet.length, item; i < len; i++) {
        item = treelet[i];
        if(isDevice(item.type, false) !== orgIcon) {
            treelet.splice(i, 1);
            i--;
            len--;
            continue;
        };
        dataTree[i] = new Object();
        dataTree[i].key = item.rid;
        dataTree[i].title = item.itemName;
        dataTree[i].parentRid = item.rid;
        dataTree[i].superiorPlatformId = item.platformId || item.superiorPlatformId;
        // dataTree[i].key = item.orgId; //---部门id
        // dataTree[i].title = item.orgName; //---部门名称

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