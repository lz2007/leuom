/* 实时指挥-告警管理*/
import {
    createForm,
    notification
} from "ane";
import ajax from '../../services/ajaxService';
import moment from 'moment';
import './sszhxt-gjgl-gjcx.css';
import Sbzygl from '../common/common-sbzygl';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
const storage = require('../../services/storageService.js').ret;

export const name = 'sszhxt-gjgl-gjcx';
let vm = null;
let sbzygl = new Sbzygl();
const listHeaderName = name + '-list-header';

/* name 组件 */
avalon.component(name, {
    template: __inline('./sszhxt-gjgl-gjcx.html'),
    defaults: {
        isDetailExist: false,
        gjglDetail: "",
        $form: createForm(),
        loading: false,
        orgData: [],
        orgId: "",
        selectedTitle: '',
        current: 1,
        list: [],
        total: 0,
        storageJson: {},
        beginTime: '',
        endTime: '',
        titleTimer: null,
        isChangeTable: false,
        sszhxt_language: language_txt.sszhxt.sszhxt_gjgl,
        extra_class: languageSelect == "en" ? true : false,
        json: {
            // beginTime: moment().subtract(1, 'month').format('YYYY-MM-DD'),
            // endTime: moment().format('YYYY-MM-DD'),
            beginTime: "",
            endTime: "",
            userCode: '',
            sosType: 'DEVICE_SOS', //默认告警类型
            DEVICE_SOSType: 'ALL', //告警源
            STATUS_SOSType: "ALL",
            BUSINESS_SOSType: 'DEVICE_SOS',
            status: 'ALL',
            sosLevel: '5', //默认告警状态
            orgPath: "",
            orgId: '',
            page: 0,
            pageSize: 20
        },
        // 初始化
        onInit(event) {
            // 部门组织树
            vm = event.vmodel;
            // this.$watch('storageJson', function (n, o) {
            //     if (n) {
            //         let json = storage.getItem(name);
            //         vm.beginTime = json.beginTime ? moment(Number(json.beginTime)).format("YYYY-MM-DD")  : moment().format("YYYY-MM-DD");
            //         vm.endTime = json.endTime ? moment(Number(json.endTime)).format("YYYY-MM-DD") : "";
            //         json.beginTime = json.beginTime ? moment(Number(json.beginTime)).format("YYYY-MM-DD")  : moment().format("YYYY-MM-DD");
            //         json.endTime = json.endTime ? moment(Number(json.endTime)).format("YYYY-MM-DD") : "";
            //         this.json = json;
            //         vm.current = ++json.page;
            //     }
            // });
            let json = storage.getItem(name);
            if ($.trim(json) != "") {
                vm.beginTime = json.beginTime ? moment(Number(json.beginTime)).format("YYYY-MM-DD HH:mm:ss") : '';
                vm.endTime = json.endTime ? moment(Number(json.endTime)).format("YYYY-MM-DD HH:mm:ss") : '';
                json.beginTime = json.beginTime ? moment(Number(json.beginTime)).format("YYYY-MM-DD HH:mm:ss") : null;
                json.endTime = json.endTime ? moment(Number(json.endTime)).format("YYYY-MM-DD HH:mm:ss") : null;
                this.json = json;
                if (this.json['selectedTitle']) {
                    delete this.json['selectedTitle'];
                }
                this.orgId = json.orgId;
                this.selectedTitle = json.selectedTitle;
                vm.current = ++json.page;
            } else {
                vm.json.beginTime = vm.beginTime = moment(new Date().getTime() - 24 * 60 * 60 * 1000).format("YYYY-MM-DD HH:mm:ss");
                vm.json.endTime = vm.endTime = moment().format("YYYY-MM-DD HH:mm:ss");
            }
            if (json.sosType == "BUSINESS_SOS") {
                vm.isChangeTable = true;
            } else {
                vm.isChangeTable = false;
            }
            this.fetchOrgData();


        },
        onDispose() {
            clearInterval(this.titleTimer);
        },
        extraExpandHandle: function (treeId, treeNode, selectedKey) {
            getOrgbyExpand(treeNode.orgId, treeNode.checkType).then((ret) => {
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (ret.code == 0) {
                    treeObj.addNodes(treeNode, changeTreeData(ret.data));
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam('key', selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
            });
        },
        fetchOrgData() {
            // ajax 请求部门列表
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    if (!vm.json.orgPath) {
                        vm.json.orgPath = ret['data'][0].path;
                    }
                    let data = changeTreeData(ret.data);
                    this.orgData = data;
                    //this.storageJson = storage.getItem(name);
                    // 表格数据
                    sbzygl.setListHeader(listHeaderName);
                    this.search();
                } else {
                    showMessage('error', vm.extra_class ? "Get your affiliate failure!" : '获取所属机构失败！');
                }
            });
        },
        getSelected(key, title, node) {
            this.json.orgPath = node.path;
            this.json.orgId = key;
            this.orgId = key;
            this.selectedTitle = title
        },
        handleTreeChange(e, selectedKeys) {
            this.json.orgPath = e.node.path;
            this.orgId = e.node.orgId;
            this.json.orgId = e.node.orgId;
        },
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.search();
        },
        $searchForm: createForm(),
        handleAlarmTypeChange(ev) {
            let json = vm.json;
            switch (ev.target.value) {
                case 'DEVICE_SOS':
                    json.sosType = 'DEVICE_SOS';
                    break;
                case 'STATUS_SOS':
                    json.sosType = 'STATUS_SOS';
                    break;
                default:
                    json.sosType = 'BUSINESS_SOS';
            }
        },
        handleSourceTypeChange(ev) {
            let json = vm.json;
            switch (ev.target.value) {
                case 'ALL':
                    json.DEVICE_SOSType = "ALL";
                    json.STATUS_SOSType = "ALL";
                    break;
                case 'DEVICE_ELECTRIC_CAPACITANCE':
                    json.DEVICE_SOSType = 'DEVICE_ELECTRIC_CAPACITANCE';
                    break;
                case 'DEVICE_STORAGE_CAPACITANCE':
                    json.DEVICE_SOSType = 'DEVICE_STORAGE_CAPACITANCE';
                    break;
                case 'DEVICE_ONLINE':
                    json.STATUS_SOSType = 'DEVICE_ONLINE';
                    break;
                case 'DEVICE_OFFLINE':
                    json.STATUS_SOSType = 'DEVICE_OFFLINE';
                    break;
                default:
                    json.BUSINESS_SOSType = 'DEVICE_SOS';
            }
        },
        handleAlarmLevelChange(ev) {
            let json = vm.json;
            switch (ev.target.value) {
                case '0':
                    json.sosLevel = '0';
                    break;
                case '1':
                    json.sosLevel = '1';
                    break;
                case '2':
                    json.sosLevel = '2';
                    break;
                case '3':
                    json.sosLevel = '3';
                    break;
                default:
                    json.sosLevel = '5';
            }
        },
        handleUsercodeChange(ev) {
            vm.json.userCode = ev.target.value;
        },
        handleStatusChange(ev) {
            vm.json.status = ev.target.value;
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
            if (event.keyCode == 13) {
                this.querySearch();
            }
        },
        querySearch() {
            vm.current = 1;
            this.search();
        },
        handleInputFocus(ev) {
            $(ev.target).siblings('.close-clear').show();
        },
        handleInputBlur(ev) {
            $(ev.target).siblings('.close-clear').hide();
        },
        handleCloseClear(ev) {
            this.json.userCode = "";
            $(ev.target).siblings('input').focus();
            return false;
        },
        handleEnter(e) {
            if (e.keyCode == 13) {
                this.search();
            }
        },
        search() {
            let json1 = {};
            let json = JSON.parse(JSON.stringify(vm.$model.json));
            json1 = JSON.parse(JSON.stringify(vm.$model.json));
            // if(json.sosLevel == '5'){
            //     json.sosLevel = null;
            // }else{
            //     json.sosLevel = Number(json.sosLevel);
            // }
            json.sosLevel = null;
            if (json.sosType == 'DEVICE_SOS') {
                //告警类型是设备告警，只穿设备告警源
                delete json['BUSINESS_SOSType'];
                delete json['STATUS_SOSType'];
                json.sosSource = json.DEVICE_SOSType;
                delete json.DEVICE_SOSType;

            } else if (json.sosType == 'STATUS_SOS') {
                delete json['BUSINESS_SOSType'];
                delete json['DEVICE_SOSType'];
                json.sosSource = json.STATUS_SOSType;
                delete json.STATUS_SOSType;
            } else if (json.sosType == 'BUSINESS_SOS') {
                delete json['STATUS_SOSType'];
                delete json['DEVICE_SOSType'];
                json.sosSource = json.BUSINESS_SOSType;
                delete json.BUSINESS_SOSType;
            }
            // let beginTime = vm.beginTime;
            // let endTime = vm.endTime;
            json.beginTime = json.beginTime ? (moment(json.beginTime).format('X') * 1000) : null;
            // json.endTime = json.endTime ? (moment(json.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000) : null;
            json.endTime = json.endTime ? (moment(json.endTime).format('X') * 1000) : null;

            json.page = vm.current - 1;
            if (json.beginTime > json.endTime) {
                showMessage('warn', vm.extra_class ? "Begin time later than the end time, please choose again!" : '开始时间不能大于结束时间!');
                return false;
            } else if (/[~#^$@%&!?,;.。+“‘·*]/gi.test(json.userCode)) {
                showMessage('warn', vm.extra_class ? "Police officers can not contain special characters." : '警员警号不能含有特殊字符!');
                return false;
            }

            json1.selectedTitle = vm.selectedTitle;
            json1.orgId = vm.orgId;
            json1.page = vm.current - 1;
            json1.beginTime = json1.beginTime ? (moment(json1.beginTime).format('X') * 1000) : null;
            json1.endTime = json1.endTime ? (moment(json1.endTime).format('X') * 1000) : null;
            storage.setItem(name, json1, 0.5);
            this.loading = true;
            getTableData(json).then(ret => {
                this.loading = false;
                if (ret.code != 0) {
                    showMessage('error', ret.msg);
                    sbzygl.initDragList(listHeaderName);
                    this.list = [];
                    sbzygl.initDragList(listHeaderName);
                    return false;
                }
                if (vm.json.sosType == "BUSINESS_SOS") {
                    vm.isChangeTable = true;
                } else {
                    vm.isChangeTable = false;
                }

                // 没有数据
                // let data = ret.data.currentElements.reverse();
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
                // setTimeout(() => {
                // if ($('.tyywglpt-list-content').get(0).offsetHeight < $('.tyywglpt-list-content').get(0).scrollHeight - 1) {
                //     $('.tyywglpt-list-header').css({ 'padding-right': '17px' });
                // } else {
                //     $('.tyywglpt-list-header').css({ 'padding-right': '0' });
                // }

                $("[data-toggle='popover']").popoverX({
                    trigger: 'manual',
                    container: 'body',
                    placement: 'auto top',
                    //delay:{ show: 5000},
                    html: 'true',
                    content: function () {
                        return '<div class="title-content">' + $(this).attr('origin-title') + '</div>';
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





                // }, 100);
            }, () => {
                this.loading = false;
            });
        },
        gjgllook($index) {
            //  avalon.router.navigate('/sszhxt-gjglcontrol', 2);
            // let _this = this;
            // require.async('/apps/sszhxt/sszhxt-gjglcontrol', function (m) {
            //     _this.gjglDetail = getDetailPages(m.name);
            //     _this.isDetailExist = true;
            // });
            let obj = {};
            let item = this.list[$index];
            // obj.isRealTimeView = item.status == 'WAITING' ? true : false;
            obj.isRealTimeView = false;
            obj.sosId = item.id;
            obj.time = moment(item.time).format('X') * 1000 || '';
            obj.longitude = item.longitude || "-";
            obj.latitude = item.latitude || "-";
            obj.sosAddress = "-";
            obj.isGjgl = true;
            item.userName = item.userName ? item.userName : '-';
            item.userCode = item.userCode ? item.userCode : '-';
            obj.sosPerson = item.userName + '(' + item.userCode + ')';
            obj.gbcode = item.deviceId;
            obj.handleStatus = item.status;
            obj.opinion = item.opinion;
            obj.orgName = item.orgName;
            obj.type = item.type;
            sessionStorage.setItem('gjgl-gjglcontrol', JSON.stringify(obj));
            let url = window.location.href;
            window.location.href = url.substring(0, url.lastIndexOf('/')) + "/sszhxt-gjglcontrol";
        }
    }
});

// function getDetailPages(component) {
//     const html = `<xmp is="${component}" :widget="{id:'${component}',expire:${Date.now()}}"></xmp>`;
//     return html;
// }

//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: vm.extra_class ? "notification" : "通知",
        message: content
    });
}
//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].children = treeData[i].childs;
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}
//去除数据前后空格
function trimData(json) {
    for (let i in json) {
        json[i] = $.trim(json[i]);
    };
    return json;
}
// 接口
/* 获取部门 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        //url: '/gmvcs/uap/org/all',
        //   url: '/api/tyywglpt-cczscfwgl',

        method: 'get',
        cache: false
    });
}
/*
 *分级获取部门
 *  */
function getOrgbyExpand(orgId, checkType) {
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + orgId + '&&checkType=' + checkType,
        method: 'get',
        cache: false
    });

}

/* 获取列表记录 */
function getTableData(json) {
    return ajax({
        url: '/gmvcs/instruct/sos/list',
        method: 'post',
        data: json
    });
}

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null || str === undefined) ? "-" : str;
};

avalon.filters.changeData = function (str, arg) {
    let sosSource = {
        DEVICE_SOS: vm.extra_class ? 'SOSAlarm' : 'SOS告警',
        DEVICE_ONLINE: vm.extra_class ? 'Online' : '设备上线',
        DEVICE_OFFLINE: vm.extra_class ? 'Offline' : '设备下线',
        DEVICE_ELECTRIC_CAPACITANCE: vm.extra_class ? 'Power' : '设备电量',
        DEVICE_STORAGE_CAPACITANCE: vm.extra_class ? 'Equipment Capacity' : '设备容量',
        ALL: vm.extra_class ? 'All' : '不限'
    };
    let status = {
        HANDLED: vm.extra_class ? 'Processed' : '已处理',
        WAITING: vm.extra_class ? 'Pending' : '待处理',
        OVERDUE: vm.extra_class ? 'Overdue unprocessed' : '逾期未处理',
        ALL: vm.extra_class ? 'All' : '不限'
    };
    let sosLevel = {
        '0': vm.extra_class ? 'Urgent' : '紧急',
        '1': vm.extra_class ? 'Important' : '重要',
        '2': vm.extra_class ? 'General' : '一般',
        '3': vm.extra_class ? 'Note' : '提示'
    };
    let strs = '';
    if (arg == "sosSource") {
        strs = typeof str == 'string' ? sosSource[str] : {
            'origin-title': sosSource[str['origin-title']],
            'data-toggle': 'popover'
        }; //处理插值表达式或者title
    } else if (arg == "status") {
        strs = typeof str == 'string' ? status[str] : {
            'origin-title': status[str['origin-title']],
            'data-toggle': 'popover'
        };
    } else if (arg == 'sosLevel') {
        strs = typeof str == "number" ? sosLevel[str] : {
            'origin-title': sosLevel[str['origin-title']],
            'data-toggle': 'popover'
        };

    }
    return strs;

};
//
function getFormJson(vm) {
    let json = {};
    // json.beginTime = vm.json.beginTime ? moment(vm.json.beginTime).format('X') : null;
    // json.endTime = vm.json.endTime ? moment(vm.json.endTime).format('X') : null;
    json.sosType = vm.json.sosType;
    json.handleStatus = vm.json.handleStatus;
    json.orgPath = vm.json.orgPath;
    json.deviceId = $.trim(vm.json.deviceId) || null;
    return json;
}
avalon.filters.formatDate2 = formatDate;
avalon.filters.formatTitleDate2 = function (obj) {
    return {
        'origin-title': moment(obj['origin-title']).format("YYYY-MM-DD HH:mm:ss"),
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