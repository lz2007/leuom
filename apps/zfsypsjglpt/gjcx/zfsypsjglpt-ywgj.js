import {
    createForm,
    notification
} from "ane";
import ajax from '/services/ajaxService';
import moment from 'moment';
import './zfsypsjglpt-ywgj.less';
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

export const name = 'zfsypsjglpt-ywgj';
let vm = null;
let sbzygl = new Sbzygl();
const listHeaderName = name + '-list-header';
let {
    mainIndex,
} = require('/services/configService');

/* name 组件 */
avalon.component(name, {
    template: __inline('./zfsypsjglpt-ywgj.html'),
    defaults: {
        key_dep_switch: dep_switch,
        $form: createForm(),
        loading: false,
        orgData: [],
        included_status: includedStatus, //true 包含子部门；false 不包含子部门
        current: 1,
        list: [],
        total: 0,
        storageJson: {},
        beginTime: '',
        iszfda:true,
        overLimit:false,
        endTime: '',
        titleTimer: null,
        isChangeTable: false,
        authority: { // 按钮权限标识
            "SEARCH": false, //查询
        },
        sszhxt_language: language_txt.sszhxt.sszhxt_gjgl,
        extra_class: languageSelect == "en" ? true : false,
        json: {
            beginTime: "",
            endTime: "",
            orgPath: "",
            orgId: '',
            page: 0,
            pageSize: 20
        },
        ywgj_tree: avalon.define({
            $id: "ywgj_tree",
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
                vm.ywgj_tree.yspk_data = deptemp;
                vm.ywgj_tree.orgPath = deptemp[0].path;
                vm.ywgj_tree.orgId = deptemp[0].key;
                vm.ywgj_tree.selectedTitle = deptemp[0].title;                

                ajax({
                    url: '/gmvcs/audio/basefile/getZFType',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0 || $.isEmptyObject(result.data.zftype)) {
                        notification.error({
                            message: '获取执法类型失败，请稍后再试',
                            title: '通知'
                        });
                        return;
                    }

                    let temp = [];
                    for (let key in result.data.zftype) {
                        // 3.6.8 合并云南需求 新增警情关联和案件管理的添加关联查询
                        // if(versionSelection !== 'Yunnan' && (key == "AUDIO_MENU_ZFDA_JQGL" || key == "AUDIO_MENU_ZFDA_AJGL")) {
                        //     continue;
                        // }
                        if (key == "AUDIO_MENU_ZFDA_JTWF_FXCCL" && mainIndex == "main_sdjj") { //屏蔽案件和警情的执法类型   2018.9.7加上屏蔽非现场处罚
                            // return;
                        } else if (key == "AUDIO_MENU_ZFDA_JQGL") {
                            let obj = {};
                            obj.value = key;
                            obj.label = result.data.zftype[key];
                            temp.unshift(obj);
                        } else {
                            let obj = {};
                            obj.value = key;
                            obj.label = result.data.zftype[key];
                            temp.push(obj);
                        }
    
                    }
                    temp.unshift({
                        label: "不限",
                        value: ""
                    });
                    ywgj_type_vm.zf_type_options = temp;
                    ywgj_type_vm.curType = temp[0].value;
                    ywgj_type_vm.bizType = new Array(temp[0].value);

                    if (!init_data) {
                        isTableSearch && this.search();
                    } else {
                        if (init_data.includeChild) {
                            vm.included_status = true;
                        } else {
                            vm.included_status = false;
                        }
                        vm.ywgj_tree.orgId = init_data.orgId;
                        vm.ywgj_tree.orgPath = init_data.orgPath;
                        vm.ywgj_tree.selectedTitle = init_data.selectedTitle;
                        ywgj_type_vm.curType = init_data.bizType;
                        ywgj_type_vm.bizType = new Array(init_data.bizType);
                    }
                });
            });
        },
        onReady(){
            let _this = this;
            $('body').css('minWidth','1712px');
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_GJGL_GJCX_YWGJ/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_GJGL_GJCX_YWGJ_SEARCH":
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
            if (event.keyCode == 13) {
                this.querySearch();
            }
        },
        querySearch() {
            vm.current = 1;
            this.search();
        },
        //点击业务编号跳转到该业务详情页进行查看并关联媒体文件
        gToDetail(record){
            $("[data-toggle='popover']").popoverX("hide");
            let alterType;
            switch (record.bizType) {
                case "警情管理":
                    alterType = 'jqgl';
                    break;
                case "案件管理":
                    alterType = 'ajgl';
                    break;
                case "事故处理":
                    alterType = 'sgcl';
                    break;
                case "非现场处罚":
                    alterType = 'fxccl';
                    break;
                case "强制措施":
                    alterType = 'qzcs';
                    break;
                case "简易程序":
                    alterType = 'jycx';
                    break;
            }
            window.sessionStorage.setItem('ajgl_bh',record.bizId);
            window.sessionStorage.setItem('webType',alterType);
            window.sessionStorage.setItem('isYWGJ','true');
            switch (record.bizType) {
                case "警情管理":
                    avalon.history.setHash('/zfsypsjglpt-zfda-jqgl_gongan');
                    break;
                case "案件管理":
                    avalon.history.setHash('/zfsypsjglpt-zfda-ajgl_gongan');
                    break;
                case "事故处理":
                    avalon.history.setHash('/zfsypsjglpt-zfda-sgcl_jiaojing');
                    break;
                case "非现场处罚":
                    avalon.history.setHash('/zfsypsjglpt-zfda-fxccf_jiaojing');
                    break;
                case "强制措施":
                    avalon.history.setHash('/zfsypsjglpt-zfda-qzcs_jiaojing');
                    break;
                case "简易程序":
                    avalon.history.setHash('/zfsypsjglpt-zfda-jycx_jiaojing');
                    break;
            }            
        },
        handleInputFocus(ev) {
            $(ev.target).siblings('.close-clear').show();
        },
        handleInputBlur(ev) {
            $(ev.target).siblings('.close-clear').hide();
        },
        handleEnter(e) {
            if (e.keyCode == 13) {
                this.search();
            }
        },
        search() {
            var page = vm.current == 0 ? 0 : vm.current - 1;
            let json = JSON.parse(JSON.stringify(vm.$model.json));
            json.beginTime = json.beginTime ? (moment(json.beginTime).format('X') * 1000) : null;
            json.endTime = json.endTime ? (moment(json.endTime).format('X') * 1000) : null;
            json.orgId = vm.ywgj_tree.orgId;
            json.orgPath = vm.ywgj_tree.orgPath;
            json.includeChild = vm.included_status;
            json.bizType = ywgj_type_vm.curType;

            json.page = vm.current - 1;

            if(!json.beginTime){
                showMessage('warn', vm.extra_class ? "Begin time cannot be empty, please choose again!" : '开始时间不能为空，请重新设置！');
                return false;
            }else if(!json.endTime){
                showMessage('warn', vm.extra_class ? "End t;ime cannot be empty, please choose again!" : '结束时间不能为空，请重新设置！');
                return false;
            }else if (json.beginTime > json.endTime) {
                showMessage('warn', vm.extra_class ? "Begin time later than the end time, please choose again!" : '开始时间不能大于结束时间，请重新设置!');
                return false;
            }else if(json.endTime - json.beginTime > 365 * 86400000){
                showMessage('warn', vm.extra_class ? "The time interval shall not exceed one year, please choose again!" : '时间间隔不能超过一年，请重新设置！');
                return false;
            }

            this.loading = true;
            getTableData(json).then(ret => {
                // 单独请求总数量
                ajax({
                    url: '/gmvcs/operation/alert/biz/match/count',
                    method: 'post',
                    data: json,
                    cache: false
                }).then(num_ret => {
                    if (num_ret.code === 0) {
                        vm.current = page + 1;
                        if(num_ret.data.totalPages >= ret.data.limit){
                            vm.total = ret.data.limit * 20;
                            vm.overLimit = true;
                            vm.iszfda = false;
                        }else{
                            vm.overLimit = false;
                            vm.total = num_ret.data.totalElements;
                        }
                        // let pageMess = {
                        //     overLimit:vm.overLimit,
                        //     iszfda:vm.iszfda
                        // };
                        // storage.setItem('zfsypsjglpt-ywgl-page', JSON.stringify(pageMess), 0.5);                            
                    }else {
                        notification.error({
                            message: num_ret.msg,
                            title: '通知'
                        });
                    }
                });
                this.loading = false;
                json.selectedTitle = vm.ywgj_tree.selectedTitle;
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
                    value.time = moment(value.time).format('YYYY-MM-DD HH:mm:ss');
                    switch (value.bizType) {
                        case "AUDIO_MENU_ZFDA_JQGL":
                            value.bizType = '警情管理';
                            break;
                        case "AUDIO_MENU_ZFDA_AJGL":
                            value.bizType = '案件管理';
                            break;
                        case "AUDIO_MENU_ZFDA_SGCL":
                            value.bizType = '事故处理';
                            break;
                        case "AUDIO_MENU_ZFDA_JTWF_FXCCL":
                            value.bizType = '非现场处罚';
                            break;
                        case "AUDIO_MENU_ZFDA_JTWF_QZCS":
                            value.bizType = '强制措施';
                            break;
                        case "AUDIO_MENU_ZFDA_JTWF_JYCX":
                            value.bizType = '简易程序';
                            break;
                    }
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
        url:'/gmvcs/operation/alert/biz/match/list',
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

let ywgj_type_vm = avalon.define({
    $id: 'ywgj_type',
    curType: "",
    zf_type_options: [],
    bizType: [],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});