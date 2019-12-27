import './zfsypsjglpt-gjhf.less';
import ajax from '/services/ajaxService';

import {
    notification,
    createForm
} from 'ane';
import moment from 'moment';
import {
    languageSelect,
    isTableSearch
} from '/services/configService';
import * as menuServer from '/services/menuService';
import '/services/filterService';
import {
    ViewItem
} from "/apps/common/common-gb28181-tyywglpt-view-api";
import {
    orgIcon,
    isDevice
} from "/apps/common/common-gb28181-tyywglpt-device-type";
export const name = 'zfsypsjglpt-gjhf';
const storage = require('/services/storageService.js').ret;
let language_txt = require('/vendor/language').language;
let vm,
    GisObject,
    drawPathObj,
    iframeWin; //点击左边选项之后的画轨迹对象

avalon.component(name, {
    template: __inline('./zfsypsjglpt-gjhf.html'),
    defaults: {
        table_pagination: { //分页数据
            current: 1,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        actions(type, text, record, index) { //表格操作回调
            const that = this
            if (type == "check") {
                let clear = false;
                this.showNoGPS = false;
                this.msgNoGPS = '';
                let key = this.oldMatchCount
                if (this.oldMatchCount == -1) {
                    this.tableData[index].matchCount = 'run';
                    this.itemClick(index);
                    this.oldMatchCount = index;
                } else {
                    if (this.tableData[index].matchCount == '') {
                        this.tableData[key] && (this.tableData[key].matchCount = '');
                        this.tableData[index].matchCount = 'run';
                        this.itemClick(index);
                        this.oldMatchCount = index;
                    } else {
                        this.tableData[index].matchCount = '';
                        this.itemClean();
                        this.oldMatchCount = -1;
                        clear = true
                    }
                }
                setTimeout(function () {
                    if (drawPathObj.total == 0 && !clear) {
                        that.showNoGPS = true;
                        that.msgNoGPS = record.xh
                    }
                }, 50);
            }
        },
        showNoGPS: false, //有无gps数据
        msgNoGPS: '',
        oldMatchCount: -1,
        tableLoading: false, //表格loading
        tableData: [], //表格数据
        orgData: [],
        orgPath: '', // 部门选择的值
        orgId: '',
        selectedTitle: '',
        page: 0,
        pageSize: 10,
        $form: createForm(), // 查询表单
        searchData: [], // 查询到的列表数据
        key: '', //关键字
        searchdataTime: moment().format('YYYY-MM-DD'), //查询日期
        searchdataTimeStart: moment(moment().format('YYYY-MM-DD')).add(-7, 'days').format('YYYY-MM-DD'),
        searchdataTimeEnd: moment().format('YYYY-MM-DD'),
        shebei: true,
        renyuan: false,
        activeToggle: 0,
        mapHeight: 0,
        selectType: 'shebei',
        selectType2: 'shebei',
        noData: false, //显示暂无数据信息
        showPlayBtn: true,
        btnDisabled: true, //等全部gps轨迹数据回来才可点击按钮
        times: 2, //加速默认2倍
        speed: 1, //默认1X
        timeInterval: 1600, //默认间隔
        initPaths: [], //gps轨迹数组
        $$index: 0,
        gpsPage: 0,
        gpsPageSize: 200, //默认获取200个点
        noOrgData: true, // 是否无部门数据
        sszhxt_language: language_txt.sszhxt.sszhxt_gjcx, //英文翻译
        extra_class_dialog: languageSelect == "en" ? true : false,
        authority: {
            SEARCH: false
        },
        extraExpandHandle: function (treeId, treeNode, selectedKey) {
            let data = {
                parentRid: treeNode.rid,
                superiorPlatformId: treeNode.platformId || treeNode.superiorPlatformId
            };
            // getOrgbyExpand(treeNode.orgId, treeNode.checkType).then((ret) => {
            ViewItem(data.parentRid, data.superiorPlatformId).then((ret) => {
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
        onInit(event) {
            vm = event.vmodel;
            let _this = this;
            let storeJson = storage.getItem(name);
            for (var i in storeJson) {
                if (i == 'orgPath' || i == 'key' || i == 'orgId' || i == 'selectedTitle') {
                    this[i] = storeJson[i];
                } else if (i == 'start') {
                    // this['searchdataTime'] = storeJson[i] ? moment(storeJson[i]).format('YYYY-MM-DD') : '';
                    this['searchdataTimeStart'] = storeJson[i] ? moment(storeJson[i]).format('YYYY-MM-DD HH:mm') : '';
                } else if (i == 'end') {
                    this['searchdataTimeEnd'] = storeJson[i] ? moment(storeJson[i]).format('YYYY-MM-DD HH:mm') : '';
                }
            };
            // 获取部门数据
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    let data = changeTreeData(ret.data);
                    if(data.length === 0) {
                        showMessage('warn', '暂无所属部门，请于运维中心设置视图！');
                        _this.noOrgData = true;
                        return;
                    }
                    _this.noOrgData = false;
                    _this.orgData = data;
                    if (!_this.orgPath) {
                        if (data.length) {
                            _this.orgPath = data[0].path;
                            _this.orgId = data[0].key;
                        }
                    }
                    // 获取人员轨迹列表
                    isTableSearch && _this.getUserData();
                } else {
                    showMessage('error', '获取部门失败');
                }
            });
            //    mapInitObj.initCallback();

            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_GJCX/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时表格顶上
                    $(".gjhf-table-wrap").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_GJCX_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });

                // 防止查询无权限时表格顶上
                if (!_this.authority.SEARCH) {
                    $(".gjhf-table-wrap").css("top", "34px");
                }
            });
        },
        // 初始化
        onReady() {
            // this.mapHeight = (document.documentElement.clientHeight - 36 - 70) + 'px';
            this.mapHeight = '630px';
            let width = (document.documentElement.clientWidth) + 'px';
            //   mapInitObj.domReadyCallback(gjcxMap.initMap);
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
                $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer(29);
            };
            this.$watch('btnDisabled', (v) => {
                if (!v) {
                    drawPathObj.addMarker(this.timeInterval);
                }
            });
            $('.common-layout').addClass('gjhf-min-wrapper'); // 增加最小宽高度的样式
        },
        onDispose() {
            if (drawPathObj) {
                if (drawPathObj && drawPathObj.isGettingTrack) //停止递归请求数据
                    drawPathObj.isGettingTrack = false;
                drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                drawPathObj.clearTimer();
                drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                // drawPathObj.resetLayerPos({
                //     longitude: 113.2693246420,
                //     latitude: 23.1520769760
                // }, 10);
                vm.btnDisabled = true;
                vm.showPlayBtn = true;
            }
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
            }
            //  mapInitObj.disposeCallback();
            $('.common-layout').removeClass('gjhf-min-wrapper'); // 增加最小宽高度的样式

        },
        // 分页
        $computed: {
            pagination: function () {
                return {
                    current: this.table_pagination.current,
                    pageSize: this.table_pagination.pageSize,
                    total: this.table_pagination.total,
                    onChange: this.handlePageChange
                };
            }
        },
        getCurrent(current) {
            this.table_pagination.current = current;
            this.curPage = current;
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
        },
        handlePageChange(page) {
            this.curPage = page;
            this.table_pagination.current = page;
            this.search();
        },
        handleInputFocus(ev) {
            $(ev.target).siblings('.close-clear').show();
        },
        handleInputBlur(ev) {
            $(ev.target).siblings('.close-clear').hide();
        },
        handleCloseClear(ev) {
            this.key = "";
            $(ev.target).siblings('input').focus();
            return false;
        },
        getSelected(key, title, node) {
            this.orgPath = node.path;
            this.orgId = key;
            this.selectedTitle = title;
        },
        // 选择部门回调
        handleTreeChange(e, selectedKeys) {
            this.orgPath = e.node.path;
            this.orgId = e.node.orgId;
        },
        select(type) {
            this.searchData = [];
            switch (type) {
                case 'shebei':
                    this.shebei = true;
                    this.renyuan = false;
                    this.selectType = 'shebei';
                    this.activeToggle = 0;
                    break;
                case 'renyuan':
                    this.shebei = false;
                    this.renyuan = true;
                    this.selectType = 'renyuan';
                    this.activeToggle = 1;
                    break;
            };
            this.search();
        },
        startdatatimechange(e) {
            this.searchdataTimeStart = e.target.value;
        },
        enddatatimechange(e) {
            this.searchdataTimeEnd = e.target.value;
        },
        handleQuickSearch(event) {
            if (event.keyCode == 13) {
                this.search();
            }
        },
        clickSearch() {
            this.table_pagination.current = 1;
            this.search();
        },
        search() {
            // 部门树无视图不查询
            if(this.noOrgData) {
                showMessage('warn', '暂无所属部门，请于运维中心设置视图！');
                return;
            };
            this.selectType2 = this.selectType;
            let data = {},
                data1 = {};
            data.orgPath = this.orgPath;
            data1.orgPath = this.orgPath;
            data.orgId = this.orgId;
            data1.orgId = this.orgId;
            data.key = $.trim(this.key);
            data1.key = $.trim(this.key);
            data.beginTime = this.searchdataTimeStart == "" ? this.searchdataTimeStart : Date.parse(new Date(this.searchdataTimeStart.replace(/-/g, "/")));
            data.endTime = this.searchdataTimeEnd == "" ? this.searchdataTimeEnd : Date.parse(new Date((this.searchdataTimeEnd +' 23:59:59').replace(/-/g, "/")));
            data1.beginTime = this.searchdataTimeStart == "" ? this.searchdataTimeStart : Date.parse(new Date(this.searchdataTimeStart.replace(/-/g, "/")));
            data1.endTime = this.searchdataTimeEnd == "" ? this.searchdataTimeEnd : Date.parse(new Date((this.searchdataTimeEnd +' 23:59:59').replace(/-/g, "/")));
            data.page = this.pagination.current - 1;
            data.pageSize = this.pagination.pageSize;
            data1.selectedTitle = this.selectedTitle;
            if (/[~#^$@%&!?,;.。+“‘·*]/gi.test(this.key)) {
                showMessage('warn', vm.extra_class_dialog ? "Police officers can not contain special characters." : '姓名/警号不能含有特殊字符!');
                return false;
            } else if (data.beginTime > data.endTime) {
                showMessage('warn', vm.extra_class_dialog ? "Begin time later than the end time, please choose again!" : '开始时间不能大于结束时间!');
                return false;
            }
            storage.setItem(name, data1, 0.5);
            this.getUserData(data, true)
            if (drawPathObj) {
                this.itemClean()
            }
        },
        itemClick($index) {
            let item = this.tableData[$index];
            storage.setItem('cjxFixBugDeveviceName', item);
            this.$$index = $index;
            avalon.each(this.tableData, (i, el) => {
                el.active = false;
            });
            item.active = true;
            if (drawPathObj) { //已经有轨迹的情况下
                drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                drawPathObj.clearTimer();
                drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                vm.btnDisabled = true;
                vm.showPlayBtn = true;
            }
            let json = {
                deviceId: item['deviceId'],
                deviceType: "DSJ",
                day: item.createTime,
            };
            if (drawPathObj && drawPathObj.isGettingTrack) //停止递归请求数据
                drawPathObj.isGettingTrack = false;
            //   drawPathObj = new DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack);
            iframeWin = $('#mapIframe')[0].contentWindow;
            drawPathObj = new iframeWin.DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack);
            drawPathObj.draw();
        },
        itemClean() {
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                // $('#mapIframe')[0].contentWindow.esriMap.clearDrawLayer();
                $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer(29);
            }
            if (drawPathObj && drawPathObj.isGettingTrack) //停止递归请求数据
                drawPathObj.isGettingTrack = false;
            drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
            drawPathObj.clearTimer();
            drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
            vm.btnDisabled = true;
            vm.showPlayBtn = true;
        },
        //播放、暂停按钮点击
        playBtnClick() {
            if (vm.btnDisabled)
                return false;
            this.showPlayBtn = !this.showPlayBtn;
            if (!this.showPlayBtn)
                drawPathObj.addMarker(this.timeInterval); //播放
            else
                drawPathObj.clearTimer(); //暂停
        },
        //加速按钮点击
        speedUpClick() {
            if (vm.btnDisabled)
                return false;
            if (this.speed == 8)
                this.speed = 1;
            else
                this.speed = this.speed * this.times;
            this.timeInterval = (1 / this.speed) * 1600;
            if (!this.showPlayBtn) { //如果在播放中点击加速按钮
                drawPathObj.clearTimer();
                drawPathObj.timer = null;
                drawPathObj.addMarker(this.timeInterval);
            }

        },
        /* 获取人员轨迹列表 */
        getUserData(json, isSearch) {
            let ajax_data
            if (isSearch) {
                ajax_data = json
            } else {
                ajax_data = {
                    orgPath: this.orgPath,
                    orgId: this.orgId,
                    key: '',
                    beginTime: new Date(this.searchdataTimeStart.replace(/-/g, '/')).getTime(),
                    endTime: new Date(this.searchdataTimeEnd.replace(/-/g, '/')).getTime(),
                    page: this.table_pagination.current - 1,
                    pageSize: this.table_pagination.pageSize,
                }
            }
            this.tableLoading = true;
            return ajax({
                url: '/gmvcs/instruct/track/user/list',
                method: 'post',
                data: ajax_data
            }).then((ret) => {
                this.tableLoading = false;
                if (ret.code == 0) {
                    this.table_pagination.totalPages = ret.data.totalPages;
                    this.table_pagination.total = ret.data.totalElements;
                    this.table_pagination.pageSize = ret.data.perPages;
                    let tableData = ret.data.currentElements;
                    if (tableData.length == 0) {
                        this.noData = true;
                    } else {
                        this.noData = false;
                        for (let x in tableData) {
                            tableData[x].xh = (Number(this.pagination.current) - 1) * Number(ret.data.perPages) + Number(x) + 1;
                            tableData[x].matchCount = '';
                            tableData[x].nameAndCode = (tableData[x].userName || '-') + '(' + (tableData[x].userCode || '-') + ')';
                        }
                    }
                    avalon.each(tableData, (i, el) => {
                        // i == 0 ? el.active = true : el.active = false;
                        el.active = false;
                    });

                    this.tableData = tableData;
                } else {
                    showMessage('error', ret.msg)
                }
            })
        }
    }
});
//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/sszhxt/org.png';
    for (; i < len; i++) {
        if (isDevice(treeData[i].type, false) !== orgIcon) {
            treeData.splice(i, 1);
            i--;
            len--;
            continue;
        };
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].rid;
        treeData[i].title = treeData[i].itemName;
        // treeData[i].key = treeData[i].orgId;
        // treeData[i].title = treeData[i].orgName;
        treeData[i].children = treeData[i].childs || [];
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

//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: "通知",
        message: content
    });
}
// 接口
/* 获取部门 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uom/device/gb28181/v1/view/getPlatformView',
        method: 'get',
        cache: false
    });
}
// function getOrgAll() {
//     return ajax({
//         url: '/gmvcs/uap/org/find/fakeroot/mgr',
//         //url: '/gmvcs/uap/org/all',
//         //   url: '/api/tyywglpt-cczscfwgl',
//         method: 'get',
//         cache: false
//     });
// }
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
function getItemsData(url, json) {
    return ajax({
        url: url,
        method: 'post',
        data: trimData(json)
    });
}
/* 根据设备Id获取轨迹 */
function getDeviceTrack(json) {
    return ajax({
        url: '/gmvcs/instruct/track/gps',
        method: 'post',
        data: json
    });
}

/*获取设备的gps轨迹信息数据总量 */
function getTrackTotal(json) {
    return ajax({
        url: '/gmvcs/instruct/track/count/gps',
        method: 'post',
        data: json
    });
}
/* 根据设备Id获取分页轨迹 */
function getPageDeviceTrack(json, page, pageSize) {
    return ajax({
        url: '/gmvcs/instruct/track/page/gps',
        method: 'post',
        data: {
            deviceId: json.deviceId,
            deviceType: json.deviceType,
            day: json.day,
            page: page,
            pageSize: pageSize
        }
    });
}

//时间戳转日期
avalon.filters.formatDate = formatDate;
avalon.filters.formatDateObj = function (obj) {
    return {
        title: moment(obj['title']).format('YYYY-MM-DD HH:mm:ss')
    };
};


avalon.filters.formatOnlineTime = formatOnlineTime;
avalon.filters.formatOnlineTimeObj = function (obj) {
    return {
        title: formatOnlineTime(obj['title'])
    };
};
avalon.filters.fillterEmpty = fillterEmpty;
avalon.filters.fillterEmptyObj = function (obj) {
    return {
        title: fillterEmpty(obj['title'])
    };
};

function fillterEmpty(str) {
    return (str === "" || str === null || str === undefined) ? "-" : str;
}

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

function formatOnlineTime(time) {
    if (time <= 0) {
        return "00:00:00"
    }
    let hour = parseInt(time / 3600);
    let minute = parseInt((time - hour * 3600) / 60);
    let second = time % 60;
    let timeStr = (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + (second < 10 ? '0' + second : second);
    return timeStr;
}