import {
    createForm,
    notification
} from "ane";
import ajax from '/services/ajaxService';
import moment from 'moment';
import './zfsypsjglpt-yhgj.less';
require('/apps/common/common-tyywglpt.css');
import Sbzygl from '/apps/common/common-sbzygl';
import * as menuServer from '/services/menuService';
import {
    languageSelect,
    isTableSearch,
    includedStatus
} from '/services/configService';
let {
    dep_switch,
} = require('/services/configService');
let language_txt = require('/vendor/language').language;
const storage = require('/services/storageService.js').ret;

export const name = 'zfsypsjglpt-yhgj';
let vm = null;
let sbzygl = new Sbzygl();
const listHeaderName = name + '-list-header';

/* name 组件 */
avalon.component(name, {
    template: __inline('./zfsypsjglpt-yhgj.html'),
    defaults: {
        key_dep_switch: dep_switch,
        $form: createForm(),
        loading: false,
        orgData: [],
        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        current: 1,
        list: [],
        total: 0,
        iszfda:true,
        overLimit:false,
        storageJson: {},
        beginTime: '',
        endTime: '',
        titleTimer: null,
        isChangeTable: false,
        sszhxt_language: language_txt.sszhxt.sszhxt_gjgl,
        extra_class: languageSelect == "en" ? true : false,
        json: {
            beginTime: "",
            endTime: "",
            userCode: '',
            orgPath: "",
            orgId: '',
            page: 0,
            pageSize: 20
        },
        authority: { // 按钮权限标识
            "SEARCH": false, //查询
        },
        yhgj_tree: avalon.define({
            $id: "yhgj_tree",
            yspk_data: [],
            orgId: "",
            selectedTitle: "",
            orgPath: "",
            curTree: "",
            getSelected(key, title, e) {
                this.orgId = key;
                this.orgPath = e.path;
                this.selectedTitle = title;
            },
            select_change(e, selectedKeys) {
                // this.curTree = e.node.path;
                this.orgPath = e.node.path;
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

        // 初始化
        onInit(event) {
            // 部门组织树
            vm = event.vmodel;
            let init_data = storage.getItem(name);
            // let init_data_page = storage.getItem('zfsypsjglpt-yhgj-page');
            this.findUserNameDebounce = sbzygl.debounce((key) => {
                this.findPageByUserNameOrUserCodeOrAbbr(key);
            }, 300);
            if ($.trim(init_data) != "") {
                vm.beginTime = init_data.beginTime ? moment(Number(init_data.beginTime)).format("YYYY-MM-DD HH:mm:ss") : '';
                vm.endTime = init_data.endTime ? moment(Number(init_data.endTime)).format("YYYY-MM-DD HH:mm:ss") : '';
                init_data.beginTime = init_data.beginTime ? moment(Number(init_data.beginTime)).format("YYYY-MM-DD HH:mm:ss") : null;
                init_data.endTime = init_data.endTime ? moment(Number(init_data.endTime)).format("YYYY-MM-DD HH:mm:ss") : null;
                this.json = init_data;
                vm.current = ++init_data.page;
                if (init_data.includeChild) {
                    vm.included_status = true;
                } else {
                    vm.included_status = false;
                }
                // vm.iszfda = init_data_page.iszfda;
                // vm.overLimit = init_data_page.overLimit;
                // this.search();
            } else {
                vm.json.beginTime = vm.beginTime = moment(new Date().getTime() - 24 * 60 * 60 * 1000).format("YYYY-MM-DD HH:mm:ss");
                vm.json.endTime = vm.endTime = moment().format("YYYY-MM-DD HH:mm:ss");
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
                vm.yhgj_tree.yspk_data = deptemp;
                vm.yhgj_tree.orgPath = deptemp[0].path;
                vm.yhgj_tree.orgId = deptemp[0].key;
                vm.yhgj_tree.selectedTitle = deptemp[0].title;

                if (!init_data) {
                    isTableSearch && this.search();
                } else {
                    if (init_data.includeChild) {
                        vm.included_status = true;
                    } else {
                        vm.included_status = false;
                    }
                    vm.yhgj_tree.orgId = init_data.orgId;
                    vm.yhgj_tree.orgPath = init_data.orgPath;
                    vm.yhgj_tree.selectedTitle = init_data.selectedTitle;
                }
            });
        },
        onReady(){
            let _this = this;
            $('body').css('minWidth','1712px');
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_GJGL_GJCX_YHGJ_/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_GJGL_GJCX_YHGJ_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
            });
        },
        onDispose() {
            clearInterval(this.titleTimer);
        },
        handleTreeChange(e, selectedKeys) {
            this.json.orgPath = e.node.path;
            this.orgId = e.node.orgId;
            this.json.orgId = e.node.orgId;
        },
        clickBranchBack(e) {
            this.included_status = e;
        },
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.search();
        },
        $searchForm: createForm(),
        handleUsercodeChange(ev) {
            vm.json.userCode = ev.target.value;
        },
        handleBeginTimeChange(ev) {
            if (ev.target.value == "") {
                vm.json.beginTime = null;
            } else {
                vm.json.beginTime = ev.target.value;
            }
        },
        handleEndTimeChange(ev) {
            if (ev.target.value == "") {
                vm.json.endTime = null;
            } else {
                vm.json.endTime = ev.target.value;
            }
        },
        getCurrent(current) {
            this.current = current;
        },
        handleQuickSearch(event) {
            this.findUserNameDebounce(event.target.value);
            if (event.keyCode == 13) {
                this.querySearch();
            }
        },
        querySearch() {
            vm.current = 1;
            this.search();
        },
        handleInputFocus(ev) {
            $(ev.target).attr('autocomplete','off');//取消默认提示框
            $(ev.target).siblings('.close-clear').show();
            this.findPageByUserNameOrUserCodeOrAbbr(this.json.userCode);
        },
        handleInputBlur(ev) {
            let _this = this;
            $(ev.target).siblings('.close-clear').hide();
            setTimeout(() => {
                _this.nameList = [];
            }, 200)
        },
        handleCloseClear(ev) {
            this.nameList = [];
            this.json.userCode = "";
            $(ev.target).siblings('input').focus();
            return false;
        },
        handleEnter(e) {
            if (e.keyCode == 13) {
                this.search();
            }
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
            this.json.userCode = item.userCode;
        },
        search() {
            var page = vm.current == 0 ? 0 : vm.current - 1;
            let json = JSON.parse(JSON.stringify(vm.$model.json));
            json.beginTime = json.beginTime ? (moment(json.beginTime).format('X') * 1000) : null;
            json.endTime = json.endTime ? (moment(json.endTime).format('X') * 1000) : null;
            json.orgId = vm.yhgj_tree.orgId;
            json.orgPath = vm.yhgj_tree.orgPath;
            json.includeChild  = vm.included_status;

            json.page = vm.current - 1;
            if(!json.beginTime){
                showMessage('warn', vm.extra_class ? "Begin time cannot be empty, please choose again!" : '开始时间不能为空，请重新设置！');
                return false;
            }else if(!json.endTime){
                showMessage('warn', vm.extra_class ? "End time cannot be empty, please choose again!" : '结束时间不能为空，请重新设置！');
                return false;
            }else if (json.beginTime > json.endTime) {
                showMessage('warn', vm.extra_class ? "Begin time later than the end time, please choose again!" : '开始时间不能大于结束时间，请重新设置!');
                return false;
            }else if(json.endTime - json.beginTime > 365 * 86400000){
                showMessage('warn', vm.extra_class ? "The time interval shall not exceed one year, please choose again!" : '时间间隔不能超过一年，请重新设置！');
                return false;
            }else if (/[~#^$@%&!?,;.。+“‘·*]/gi.test(json.userCode)) {
                showMessage('warn', vm.extra_class ? "Police officers can not contain special characters." : '警员警号不能含有特殊字符!');
                return false;
            }

            // json1.selectedTitle = vm.yhgj_tree.selectedTitle;
            // storage.setItem(name, json1, 0.5);
            this.loading = true;
            getTableData(json).then(ret => {
                // 单独请求总数量
                ajax({
                    url: '/gmvcs/operation/alert/user/duration/count',
                    method: 'post',
                    data: json,
                    cache: false
                }).then(num_ret => {
                    if (num_ret.code === 0) {
                        vm.current = page + 1;
                        if(num_ret.data.totalPages >= ret.data.limit){
                            vm.overLimit = true;
                            vm.total = ret.data.limit * 20;
                            vm.iszfda = false;
                        }else{
                            vm.overLimit = false;
                            vm.total = num_ret.data.totalElements;
                        }
                        // let pageMess = {
                        //     overLimit:vm.overLimit,
                        //     iszfda:vm.iszfda
                        // };
                        // storage.setItem('zfsypsjglpt-yhgl-page', JSON.stringify(pageMess), 0.5);                            
                    }else {
                        notification.error({
                            message: num_ret.msg,
                            title: '通知'
                        });
                    }
                });
                this.loading = false;
                json.selectedTitle = vm.yhgj_tree.selectedTitle;
                storage.setItem(name, json, 0.5);
                if (ret.code != 0) {
                    showMessage('error', ret.msg);
                    sbzygl.initDragList(listHeaderName);
                    this.list = [];
                    sbzygl.initDragList(listHeaderName);
                    return false;
                }
                let data = ret.data.currentElements;
                avalon.each(data, function (index, value) {
                    value.time = moment(value.time).format('YYYY-MM-DD HH:mm:ss')
                })
                if (data.length === 0) {
                    vm.total = 0;
                    this.list = [];
                    sbzygl.initDragList(listHeaderName);
                    return false;
                }
                this.list = [];
                this.list = data;
                vm.total = ret['data']['totalElements'];
                sbzygl.initDragList(listHeaderName);

                $("[data-toggle='popover']").popoverX({
                    trigger: 'manual',
                    container: 'body',
                    placement: 'auto top',
                    //delay:{ show: 5000},
                    html: 'true',
                    content: function () {
                        return '<div class="title-content">' + $(this).attr('data-origin-title') + '</div>';
                    },
                    animation: false
                }).off("mouseenter").on("mouseenter", (event) => {
                    let target = event.target;
                    if ($(target).text() === '-') {
                        return;
                    }
                    vm.titleTimer = setTimeout(() => {
                        $("[data-toggle='popover']").popoverX("hide");
                        $(target).popoverX("show");
                        $(".popover").off("mouseleave").on("mouseleave", (event) => {
                            $(target).popoverX('hide');
                        });
                    }, 500);
                }).off("mouseleave").on("mouseleave", (event) => {
                    let target = event.target;
                    clearTimeout(vm.titleTimer);
                    setTimeout(() => {
                        if (!$(".popover:hover").length) {
                            $(target).popoverX("hide");
                        }
                    }, 100);
                });
            }, () => {
                this.loading = false;
            });
        }
    }
});

//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: vm.extra_class ? "notification" : "通知",
        message: content
    });
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

//去除数据前后空格
function trimData(json) {
    for (let i in json) {
        json[i] = $.trim(json[i]);
    };
    return json;
}

/* 获取列表记录 */
function getTableData(json) {
    return ajax({
        // url: '/gmvcs/instruct/sos/list',
        url: '/gmvcs/operation/alert/user/duration/list',
        method: 'post',
        data: json
    });
}

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null || str === undefined) ? "-" : str;
};

avalon.filters.formatDate2 = formatDate;
avalon.filters.formatTitleDate2 = function (obj) {
    return {
        'data-origin-title': moment(obj['data-origin-title']).format("YYYY-MM-DD HH:mm:ss"),
        'data-toggle': 'popover'
    };
};

//时间戳转日期
function formatDate(now) {
    if (!now)
        return '-';
    let date = new Date(now);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var dat = date.getDate();
    var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
    return year + '-' + month + '-' + dat + "  " + hour + ":" + mm + ":" + seconds;
};