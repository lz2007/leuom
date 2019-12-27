/**
 * 实时指挥系统--录像回放
 *caojiacong
 */
import ajax from '/services/ajaxService';
import {
    Gxxplayer
} from '/vendor/gosunocx/gosunocx';
import moment from 'moment';
import {
    createForm,
    notification
} from 'ane';
import * as menuServer from '/services/menuService';
const storage = require('/services/storageService.js').ret;
export const name = 'zfsypsjglpt-lxhf';
require('./zfsypsjglpt-lxhf.less');
import {
    ViewItem
} from "/apps/common/common-gb28181-tyywglpt-view-api";
import {
    orgIcon,
    isDevice
} from "/apps/common/common-gb28181-tyywglpt-device-type";
import {
    gxxOcxVersion,
    languageSelect,
    isTableSearch
} from '/services/configService';
let {
    dep_switch
} = require('/services/configService');
let language_txt = require('/vendor/language').language;
let vm, player, pollTimer, processTimer, ocxele;
let enableQuery = true,
    queryTimer = null;
let iframeWindow, locationMaker;
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}

//页面组件
avalon.component(name, {
    template: __inline('./zfsypsjglpt-lxhf.html'),
    defaults: {
        key_dep_switch: dep_switch,
        $form: createForm(),
        $labelForm: createForm(),
        orgData: [],
        orgId: "",
        orgPath: "",
        orgName: "",
        deviceKey: "", //设备查询关键字
        userKey: "", //警员查询关键字
        queryStartTime: moment().subtract(7, 'day').format('YYYY-MM-DD HH:mm'),
        queryEndTime: moment().format('YYYY-MM-DD HH:mm'),
        videoPreData: [], //保存上一页的录像数据
        videoHeight: 400,
        isNull: false,
        disabledEdit: true,
        disabledClass: {
            disabled: 'disabled'
        },
        tableLoading: false,
        table_pagination: {
            current: 1,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        labelNull: false,
        labelTypeOptions: [],
        tipText: '当前页面需要高新兴视频播放器插件支持',
        showtip: true,
        noTrack: true,
        labelInfo: {
            "rid": "",
            "labelType": "",
            "labelTime": "",
            "location": "",
            "description": ""
        },
        labelTypeName: '',
        activeVideo: '', //当前选中的录像数据的索引值
        activeVideoRid: '', //当前选中的录像数据的rid
        activeVideoItem: null, //当前选中的录像数据的一行
        soundLevel: 0, //实时音量值
        soundStartLevel: 0, //起始音量值             
        soundStartX: 0, //按下鼠标时的鼠标位置
        playing: false,
        isStop: false,
        videoTitleShow: false, // 是否显示 “当前正在播放视频：xxxx.avi”
        fileName: '',
        speed: 1,
        isEdit: false,
        locations: [], //轨迹数据
        locationIndex: 0, //轨迹点索引值
        dataStr: '',
        dataJson: {},
        downloadTipShow: false,
        enableFetchPath: true, //是否可以获取轨迹
        noOrgData: true, // 是否无部门数据
        validJson: {
            "labelType": true,
            "location": true,
            "labelTime": true,
            "description": true
        },
        endDate: moment().format('YYYY-MM-DD'),
        descriptionReg: /(.|\n)+/,
        isie: '',
        playTimer: null,
        sszhxt_language: language_txt.sszhxt.sszhxt_lxhf,
        extra_class_dialog: languageSelect == "en" ? true : false,
        authority: {
            SEARCH: false,
            SAVE: false
        },
        onInit(event) {
            vm = event.vmodel;
            vm.isie = isIE();
            window._onOcxEventProxy = _onOcxEventProxy;
            video.init();
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.queryStartTime = v.startTime ? moment(v.startTime * 1).format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm');
                    this.queryEndTime = v.endTime ? moment(v.endTime * 1).format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm');
                    this.table_pagination.current = v.page + 1;
                }
            });

            this.$watch('disabledEdit', (v) => {
                if (v) {
                    this.disabledClass = {
                        disabled: 'disabled'
                    };
                } else {
                    this.disabledClass = {};
                }
            });
            this.$watch('soundLevel', (v) => {
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    player.SoundCtrl(1, 1, 2);
                    player.setVolume(v + 1);
                    if(v === 0) {
                        player.SoundCtrl(1,0,2);
                    }
                }
            });
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_LXHF/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时表格顶上
                    $(".lxhf-table-wrap").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_LXHF_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_LXHF_SAVE":
                            _this.authority.SAVE = true;
                            break;
                    }
                });

                // 防止查询无权限时表格顶上
                if (!_this.authority.SEARCH) {
                    $(".lxhf-table-wrap").css("top", "34px");
                }
            });
        },
        onReady() {
            setVideoHeight(true);

            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            this.fetchMarkTypeOptions();
            this.fetchOrgData(() => {
            isTableSearch && this.fetchVideoList();
            });
            $(window).on('resize', setVideoHeight);
            popover();
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            if (iframeWindow.esriMap) {
                iframeWindow.esriMap.remove_overlay();
                iframeWindow.esriMap.removeTrackLayer();
            }
            $('.video-tool-bar .fa').addClass('disabled');
            $('.common-layout').addClass('lxhf-min-wrapper'); // 增加最小宽高度的样式
        },
        onDispose() {
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                video.uninit();
                video.closeAllVideoTape();
            }
            $('#mapIframe').css({
                width: '100%',
                height: '100%'
            });
            $('.common-layout').removeClass('lxhf-min-wrapper'); // 移除最小宽高度的样式
            window.clearInterval(pollTimer);
            window.clearInterval(processTimer);
            window.clearTimeout(queryTimer);
            window.clearInterval(this.playTimer);
            enableQuery = true;
            $(window).off('resize', setVideoHeight);
            this.enableFetchPath = false; //离开时禁止获取轨迹，否则可能会导致其他页面上的地图有该页面的轨迹
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            iframeWindow.esriMap.remove_overlay();
        },
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
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
        },
        handlePageChange(page) {
            this.table_pagination.current = page;
            this.fetchVideoList();
        },
        getShowStatus(show) {
            vm.downloadTipShow = show;
        },
        //日期选择框处理
        handleDateClick(type) {
            if ($('#ocx-iframe-' + type).length) {
                return;
            }
            setTimeout(() => {
                $('.ane-datepicker-panel-container').append('<iframe id="ocx-iframe-' + type + '" src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe>')
            }, 100);
        },
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            if (keyCode == 13) {
                this.handleQuery()
            } else if (keyCode === 32 && event.target.selectionStart === 0) {
                return false;
            }
        },
        handleQueryFocus(event) {
            $(event.target).siblings('.fa-close').show();
        },
        handleQueryBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.fa-close').hide();
        },
        handleQueryClear(name, event) {
            this[name] = '';
            $(event.target).siblings('input').val('').focus()
        },
        resetData() {
            this.disabledEdit = true;
            this.activeVideo = '';
            this.activeVideoRid = '';
            this.activeVideoItem = null;
            this.isNull = false;
            this.labelNull = false;
            this.enableFetchPath = false;
            this.videoTitleShow = false;
            this.labelInfo = {
                "rid": "",
                "labelType": "",
                "labelTime": "",
                "location": "",
                "description": ""
            };
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                video.stop();
            }
            $('.esriPopup .close').trigger('click');
            $('.video-tool-bar .fa').addClass('disabled');
        },
        handleQuery(e) {
            if (enableQuery) {
                this.videoPreData = [];
                this.table_pagination.current = 1;
                this.resetData();
                this.fetchVideoList();
                enableQuery = false;
                queryTimer = setTimeout(() => {
                    enableQuery = true;
                }, 2000);
                iframeWindow.esriMap && iframeWindow.esriMap.clearDrawLayer();
            }
        },
        getSelected(key, title) {
            this.orgId = key;
        },
        iframeVisible: false,
        treeOnToggle(visible) {
            this.iframeVisible = visible;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        // 截图
        handleCut () {
            let  succentContent = vm.extra_class_dialog ? 'Captured, save to: ': '截图成功,图片保存路径为';
            let errorContent = vm.extra_class_dialog ? 'Capture failed, error code: ': '截图失败，错误代码,';

            let obj = player.printOcxWindow();
            if (obj.code == 0) {
                notification.success({
                    title:'notification',
                    message: succentContent +' '+':D:\\CaptureFolder\\'+ obj.time + '.jpg'
                });
                return;
            }
            notification.error({
                title: 'notification',
                message: errorContent + obj.code
            });
        },
        // 全屏
        handleMaxView () {
            player.lxhf_maxView();
        },
        //单帧后退
        handleStepPre(e) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : '当前页面需要高新兴视频播放器插件支持';
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            video.stepPre();
            this.playing = false; //单帧后退或前进时，录像会自动暂停播放
            clearInterval(pollTimer);
            let timestamp = video.getPlayTimeStamp();
            //退到最后一步时，清除掉地图上的maker
            if (timestamp === 0) {
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                return;
            }
            //获取应该标识出来的坐标点
            if(vm.locations.length > 0) {
                if (timestamp <= vm.locations[0].time) {
                    vm.locationIndex = 0;
                } else {
                    for (let i = vm.locations.length - 1; i > 0; i--) {
                        if (timestamp >= vm.locations[i - 1].time && timestamp <= vm.locations[i].time) {
                            vm.locationIndex = i - 1;
                            break;
                        }
                    }
                }
                let el = vm.locations[vm.locationIndex];
                let attr = {
                    "longitude": el.longitude,
                    "latitude": el.latitude
                };
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null, null, el);
            }
        },
        //慢放
        handleSlower(e) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : '当前页面需要高新兴视频播放器插件支持';
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if (this.speed <= -16 || $(e.target).hasClass('disabled')) {
                return;
            }
            video.slower();
            video.ctrlPlaySpeed(-1);
            if (!this.playing) {
                video.pause();
            }
        },
        //暂停或播放
        handlePlay(e) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : '当前页面需要高新兴视频播放器插件支持';
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            this.playing = !this.playing;
            if (this.playing) {
                //如果录像播完了则重新开始播
                if (this.isStop) {
                    this.isStop = false;
                    this.locationIndex = 0;
                    //playByUrl里面已经包含了pollProcess()，所以此处不能再添加pollProcess(),否则processTimer无法按规定清除
                    video.playByUrl(this.activeVideoRid);
                } else {
                    video.play();
                    pollLocation(false); //轮询轨迹以同步
                    pollProcess(); //轮询录像播放进度
                }
            } else {
                video.pause();
                clearInterval(pollTimer);
                clearInterval(processTimer);
            }
        },
        //停止播放
        handleStop(e) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : '当前页面需要高新兴视频播放器插件支持';
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            video.stop();
        },
        //快进
        handleFaster(e) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : '当前页面需要高新兴视频播放器插件支持';
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if (this.speed >= 16 || $(e.target).hasClass('disabled')) {
                return;
            }
            video.faster();
            video.ctrlPlaySpeed(1);
            if (!this.playing) {
                video.pause();
            }
        },
        //单帧前进
        handleStepNext(e) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : '当前页面需要高新兴视频播放器插件支持';
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            video.stepNext();
            this.playing = false; //单帧后退或前进时，录像会自动暂停播放
            clearInterval(pollTimer);
            let timestamp = video.getPlayTimeStamp();
            //前进到最后一步时，清除掉地图上的maker
            if (timestamp === 0) {
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                return;
            }
            //获取应该标识出来的坐标点
            if(vm.locations.length > 0) {
                if (timestamp >= vm.locations[vm.locations.length - 1].time) {
                    vm.locationIndex = vm.locations.length - 1;
                } else {
                    for (let i = 0; i < vm.locations.length - 1; i++) {
                        if (timestamp >= vm.locations[i].time && timestamp <= vm.locations[i + 1].time) {
                            vm.locationIndex = i;
                            break;
                        }
                    }
                }
                let el = vm.locations[vm.locationIndex];
                let attr = {
                    "longitude": el.longitude,
                    "latitude": el.latitude
                };
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null, null, el);
            }
        },
        handleLabelTimeChange(e) {
            if (e.target.value == "") {
                this.validJson.labelTime = false;
            } else {
                this.validJson.labelTime = true;
            }
        },
        handleFocus(name, event) {
            this.validJson[name] = true;
            $(event.target).siblings('.fa-close').show();
        },
        /**
         * 表单验证，blur进行验证
         * @param {string} name 要验证的字段名
         * @param {vmodel} vm vm
         * @param {regexp} reg  正则表达式
         */
        handleFormat(name, reg, event) {
            reg = reg || /\S+/g;
            if (!reg.test($.trim(this.labelInfo[name]))) {
                this.validJson[name] = false;
            } else {
                this.validJson[name] = true;
            }
            $(event.target).siblings('.fa-close').hide();
        },
        /**
         * 表单验证，小叉清空
         * @param {string} name 要清楚的字段名
         * @param {event} event 事件对象
         * @param {vmodel} vm vm
         */
        handleClear(name, event) {
            this.labelInfo[name] = "";
            $(event.target).siblings('input,textarea').focus();
        },
        //改变标注类型回调
        handleMarkTypeChnage(event) {
            // this.labelInfo.labelType = event.target.value;
        },
        //保存标注按钮
        handleSaveMark(e) {
            let record = JSON.parse(JSON.stringify(this.$labelForm.record));
            let pass = true;
            let url = '/gmvcs/instruct/replay/add/label';
            let data = {
                rid: this.labelInfo.rid,
                labelType: record.labelType.toString(),
                labelTime: record.labelTime ? Number(moment(record.labelTime).format('x')) : "",
                location: this.labelInfo.location,
                description: this.labelInfo.description
            }
            avalon.each(this.validJson, (key, value) => {
                if (data[key] == "" || !value) {
                    this.validJson[key] = false;
                    pass = false;
                }
            });
            if (!pass) {
                return;
            }
            Ajax(url, 'post', data).then(result => {
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                }
                showTips('success', this.extra_class_dialog ? 'success' : '保存成功');
                let info = result.data.labelInfo;
                this.labelInfo = {
                    "rid": result.data.rid,
                    "labelType": info.labelType,
                    "labelTime": moment(info.labelTime).format('YYYY-MM-DD HH:mm:ss'),
                    "location": info.location,
                    "description": info.description
                };
                this.labelTypeName = "";
                for (let i = 0; i < this.labelTypeOptions.length; i++) {
                    if (this.labelTypeOptions[i].value === this.labelInfo.labelType) {
                        this.labelTypeName = this.labelTypeOptions[i].label;
                        break;
                    }
                }
                this.isEdit = false;
                this.labelNull = false;
                setTimeout(() => {
                    popover();
                }, 100);
            });
        },
        //编辑标注按钮
        handleEditMark(e) {
            avalon.each(this.validJson, (key, value) => {
                this.validJson[key] = true;
            });
            this.isEdit = true;
            // this.labelInfo.labelTime = moment(this.labelInfo.labelTime).format('YYYY-MM-DD HH:mm:ss');
        },
        actions(type, text, record, index) {
            this.resetData();
            if (type == "check") {
                this.tabPoliceVideo(record);
            }
            if (type == "cancel") {
                avalon.each(this.videoPreData, (key, val) => {
                    val.playing = false;
                });
                this.isEdit = false;
                iframeWindow.esriMap && iframeWindow.esriMap.clearDrawLayer();
                iframeWindow.esriMap && iframeWindow.esriMap.remove_overlay();
            }
        },
        //获取视频列表
        fetchVideoList() {
            // 部门树无视图不查询
            if(this.noOrgData) {
                showTips('warn', '暂无所属部门，请于运维中心设置视图！');
                return;
            };
            let url = '/gmvcs/instruct/replay/list';
            let record = this.$form.record;
            let reg = /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/;
            let tipText = '';
            let startTime = moment(record.startTime).format('x') * 1;
            let endTime = moment(record.endTime).format('x') * 1;
            if(startTime > endTime) {
                notification.warn({
                    title: '通知',
                    message: '开始时间不能大于结束时间'
                });
                return;
            }
            let data = {
                orgId: this.orgId,
                orgPath: this.orgPath,
                // day: moment(record.startTime).format('x') * 1, 
                page: this.pagination.current - 1,
                pageSize: this.pagination.pageSize,
                startTime: startTime,
                endTime: endTime,
                userCodeOrName: $.trim(this.deviceKey),
            };
            // data.key = $.trim(this.deviceKey);
            // data.type = 'DEVICE';

            tipText = vm.extra_class_dialog ? 'the special characters not supported，reenter please' : '姓名/警号不支持特殊字符';
            if (!reg.test(data.userCodeOrName)) {
                showTips('warning', tipText);
                return;
            }
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.orgName = this.orgName;
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);
            this.tableLoading = true;
            Ajax(url, 'post', data).then(result => {
                this.tableLoading = false;
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                }
                if (!result.data.totalPages || !result.data.currentElements || !result.data.currentElements.length) {
                    this.videoPreData = [];
                    this.isNull = true;
                    return;
                }
                let temp = (this.pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, (index, el) => {
                    el.index = temp + index; // 行序号
                    el.nameAndCode = (el.userName || '-') + '(' + (el.userCode || '-') + ')';
                    el.formatStartTime = moment(el.startTime).format('YYYY-MM-DD HH:mm:ss');
                    el.durationStr = el.duration ? handleDuration(parseInt(el.duration)) : null;
                    el.playing = false; // 该记录是否正在查看，默认false
                });
                // if (dep_switch && result.data.currentElements.length!= 0) {//黔西南 部门提示需求功能 开关
                //     let times = 0;
                //     var getFullName = new Promise(function(resolve, reject){
                //         avalon.each(result.data.currentElements, (index, el) => {
                //             ajax({
                //                 url: `/gmvcs/uap/org/getFullName?orgCode=${el.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                //                 method: 'get'
                //             }).then(res => {
                //                 el.orgCode = res.data;
                //                 times = times + 1;
                //             }).then(function(){
                //                 if(times >= result.data.currentElements.length-1) {
                //                     resolve('end');
                //                 }
                //             });
                //         });
                //     });
                //     let o_this = this;
                //     getFullName.then(x => {
                //         setTimeout(function(){
                //             o_this.videoPreData = result.data.currentElements;
                //             o_this.isNull = false;
                //             o_this.table_pagination.total = result.data.totalElements;
                //             o_this.table_pagination.current_len = result.data.currentElements.length;
                //             o_this.table_pagination.totalPages = result.data.totalPages;
                //         },100);
                //     });
                // }else {
                    this.videoPreData = result.data.currentElements;

                    this.isNull = false;
                    this.table_pagination.total = result.data.totalElements;
                    this.table_pagination.current_len = result.data.currentElements.length;
                    this.table_pagination.totalPages = result.data.totalPages;
                // }
            });
        },
        //获取标注类型
        fetchMarkTypeOptions() {
            let url = '/gmvcs/instruct/replay/label/types';
            Ajax(url).then(result => {
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                }
                let options = [];
                avalon.each(result.data, function (index, el) {
                    let items = {
                        "label": el.value,
                        "value": el.code
                    };
                    options.push(items);
                });
                this.labelTypeOptions = options;
                this.labelTypeName = options.length > 0 ? options[0].label : "";
            });
        },
        //获取部门信息
        fetchOrgData(callback) {
            // let url = '/gmvcs/uap/org/find/fakeroot/mgr';
            let url = '/gmvcs/uom/device/gb28181/v1/view/getPlatformView';
            Ajax(url).then(result => {
                if (result.code !== 0) {
                    showTips('error', this.extra_class_dialog ? 'The police or the department not exist' : '部门信息获取失败！');
                    return;
                }
                if(result.data.length === 0) {
                    showTips('warn', '暂无所属部门，请于运维中心设置视图！');
                    vm.noOrgData = true;
                    return;
                }
                vm.noOrgData = false;
                this.orgData = handleRemoteTreeData(result.data);
                this.orgId = this.dataJson ? (this.dataJson.orgId ? this.dataJson.orgId : this.orgData[0].key) : this.orgData[0].key;
                this.orgPath = this.dataJson ? (this.dataJson.orgPath ? this.dataJson.orgPath : this.orgData[0].path) : this.orgData[0].path;
                this.orgName = this.dataJson ? (this.dataJson.orgName ? this.dataJson.orgName : this.orgData[0].title) : this.orgData[0].title;
                avalon.isFunction(callback) && callback();
            })
        },
        //根据时间段获取轨迹
        fetchDurationPath(param, item) {
            let url = '/gmvcs/instruct/track/gps/range';
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            this.enableFetchPath = true;
            this.noTrack = false;
            Ajax(url, 'post', param).then(result => {
                if (result.code !== 0) {
                    //轨迹出错时，不影响录像播放，只是没有轨迹同步
                    if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                        this.playTimer = setInterval(() => {
                            if(this.isStop) { // 先要等到停止视频回调后才播放视频
                                clearInterval(this.playTimer);
                                video.playByUrl(this.activeVideoRid);
                            }
                        }, 50);
                    }
                    this.locations.clear();
                    showTips('error', result.msg);
                    return;
                } else if (!result.data || !result.data[param.deviceIds[0]] || !result.data[param.deviceIds[0]].length) {
                    //无gps信息时，不影响录像播放，只是没有轨迹同步
                    if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                        this.playTimer = setInterval(() => {
                            if(this.isStop) {
                                clearInterval(this.playTimer);
                                video.playByUrl(this.activeVideoRid);
                            }
                        }, 50);
                    }
                    this.locations.clear();
                    this.noTrack = true;
                    // showTips('warning', this.extra_class_dialog ? 'No GPS Information!' : '暂无gps信息');
                    return;
                }
                let data = result.data[param.deviceIds[0]];
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    this.playTimer = setInterval(() => {
                        if(this.isStop) {
                            clearInterval(this.playTimer);
                            video.playByUrl(this.activeVideoRid);
                        }
                    }, 50);
                }
                iframeWindow.esriMap.setMapCenter(data[0].longitude, data[0].latitude, 20);
                //将第一点设为起点
                if (this.enableFetchPath) {
                    let el = data[0];
                    let attr = {
                        "longitude": el.longitude,
                        "latitude": el.latitude
                    };
                    iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.startSymbol, null);
                }
                let points = [];
                for (let i = 0; i < data.length; i++) {
                    if (!this.enableFetchPath) {
                        break;
                    }
                    data[i].nameAndCode = item.nameAndCode;
                    points.push([data[i].longitude, data[i].latitude]);
                }
                this.locations = data;
                //将起点，终点连成轨迹
                this.enableFetchPath && iframeWindow.esriMap.addPolyline(points, iframeWindow.lineSymbol);
                //将最后一点设为终点
                if (this.enableFetchPath) {
                    let el = data[data.length - 1];
                    let attr = {
                        "longitude": el.longitude,
                        "latitude": el.latitude
                    };
                    iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.endSymbol, null);
                }
            })
        },
        //视频列表点击
        tabPoliceVideo(item, event) {
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            // let $target = $(event.target).hasClass('video-preview-item') ? $(event.target) : $(event.target).parents('.video-preview-item');
            // if ($target.index() === this.activeVideo) {
            //     return;
            // }
            //清除点击前相关内容
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                video.stop(); //停止播放
            }
            // this.activeVideo = $target.index();
            this.activeVideoRid = item.rid;
            this.activeVideoItem = item;
            this.disabledEdit = false;
            this.isEdit = false;
            this.enableFetchPath = false;
            clearInterval(pollTimer);
            clearInterval(processTimer);
            $('.esriPopup .close').trigger('click');
            iframeWindow.esriMap && iframeWindow.esriMap.clearDrawLayer();
            //-------------
            let deviceData = {
                "deviceIds": [item.deviceId],
                "deviceType": "DSJ",
                "day": item.startTime,
                "beginTime": item.startTime,
                "endTime": item.endTime
            }
            this.fetchDurationPath(deviceData, item);
            // 列表图标播放状态变换
            avalon.each(this.videoPreData, (key, val) => {
                if (val.index == item.index) {
                    val.playing = true;
                } else {
                    val.playing = false;
                }
            });
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                video.ctrlPlaySpeed(0);
            }
            this.fetchLabel(this.activeVideoRid);
        },
        fetchLabel(rid) {
            Ajax('/gmvcs/instruct/replay/query/label?rid=' + rid).then(result => {
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                } else if (!result.data) {
                    this.labelInfo.rid = rid;
                    this.labelInfo.labelType = this.labelTypeOptions.length > 0 ? this.labelTypeOptions[0].value : "";
                    this.labelInfo.labelTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    this.labelInfo.location = "";
                    this.labelInfo.description = "";
                    this.labelNull = true;
                    return;
                }
                this.labelInfo = result.data;
                this.labelInfo.labelTime = moment(this.labelInfo.labelTime).format('YYYY-MM-DD HH:mm:ss');
                this.labelTypeName = "";
                for (let i = 0; i < this.labelTypeOptions.length; i++) {
                    if (this.labelTypeOptions[i].value === this.labelInfo.labelType) {
                        this.labelTypeName = this.labelTypeOptions[i].label;
                        break;
                    }
                }
                popover();
                this.labelNull = false;
            });
        },
        //音量调节
        handleSoundMouseDown(event) {
            event.stopPropagation();
            let _this = this;
            this.soundStartX = event.clientX;
            this.soundStartLevel = this.soundLevel;
            $('body').on('mousemove', function (event) {
                _this.handleSoundMouseMove(event)
                event.stopPropagation();
            });
            $(document).on("mouseup mouseleave", function (event) {
                $('body').off('mousemove');
                event.stopPropagation();
            })
        },
        handleSoundMouseMove(event) {
            let disPix = event.clientX - this.soundStartX;
            let disLevel = Math.floor((disPix / 100) * 100);
            let level = this.soundStartLevel + disLevel;
            if (level > 100) {
                this.soundLevel = 100;
            } else if (level < 0) {
                this.soundLevel = 0;
            } else {
                this.soundLevel = level;
            }
            event.stopPropagation();
        },
        handleSoundClick(event) {
            let disPix = event.offsetX
            if (disPix > 100) {
                this.soundLevel = 100;
            } else if (disPix < 0) {
                this.soundLevel = 0;
            } else {
                this.soundLevel = disPix;
            }
            event.stopPropagation();
        }
    },
});

//ocx播放进度轮询
function pollProcess() {
    clearInterval(processTimer);
    processTimer = setInterval(() => {
        let process = video.getVideotapeProcess();
        //播放完成或停止时，进行相关内容的清除
        if (process.nPos === 0) {
            vm.playing = false;
            vm.isStop = true;
            video.ctrlPlaySpeed(0);
            clearInterval(pollTimer);
            clearInterval(processTimer);
            //确保播放完成时到达最后一点
            if (vm.locations.length) {
                let el = vm.locations[vm.locations.length - 1];
                let attr = {
                    "longitude": el.longitude,
                    "latitude": el.latitude
                };
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null, null, el);
            }
            iframeWindow.esriMap.removePictureMarker(locationMaker);
            vm.locationIndex = 0;
            $('.fa-step-backward,.fa-step-forward').addClass('disabled');
        }
    }, 200)
}

//轨迹同步
function pollLocation(isFirst) {
    clearInterval(pollTimer);
    let data = vm.locations;
    //轨迹第一点
    if (isFirst) {
        let el = data[vm.locationIndex];
        let attr = {
            "longitude": el.longitude,
            "latitude": el.latitude
        };
        iframeWindow.esriMap.removePictureMarker(locationMaker);
        iframeWindow.esriMap.setMapCenter(el.longitude, el.latitude, 20);
        locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null, null, el);
        vm.locationIndex++;
    }
    pollTimer = setInterval(() => {
        let timestamp = video.getPlayTimeStamp();
        if (vm.locationIndex >= data.length) {
            clearInterval(pollTimer);
            return;
        }
        for (let i = 0; i < data.length; i++) {
            if (timestamp === data[i].time) {
                vm.locationIndex = i;
                let el = data[vm.locationIndex];
                let attr = {
                    "longitude": el.longitude,
                    "latitude": el.latitude
                };
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                //  使地图在播放时可以放大和缩小，所以不重新定位，
                // iframeWindow.esriMap.setCenterAt(el.longitude, el.latitude);
                locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null, null, el);
                break;
            }
        }
    }, 200)
}

//===============================ocx部分========================================
let video = {
    init: function () {
        ocxele = document.getElementById("video-ocx");
        player = new Gxxplayer();
        if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
            $('#video-ocx').css({
                'z-index': -9999,
                'position': 'relative'
            });
            vm.tipText = vm.extra_class_dialog ? 'Current page needs GXX video play plug-ins' : "当前页面需要高新兴视频播放器插件支持";
            vm.showtip = true;
            vm.downloadTipShow = true;
            return;
        }
        // 初始化播放器
        player.init({
            'element': 'video-ocx',
            'viewType': 1,
            'proxy': _onOcxEventProxy
        }, () => {
            player.showVideoClose(0);
        });
        let version = player.getVersion();
        if (compareString(gxxOcxVersion, version)) {
            $('#video-ocx').css({
                'z-index': -9999,
                'position': 'relative'
            });
            vm.tipText = vm.extra_class_dialog ? 'Your GXX player plugin version is ' + version + ' and the latest version is ' + gxxOcxVersion + '. Please download the latest version.' : '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
            vm.downloadTipShow = true;
            vm.showtip = false;
            return;
        }
    },
    uninit: function () {
        player.uninit();
    },
    playByUrl: function (rid) {
        let url = '/gmvcs/uom/file/auto/getVODInfo?vFileIds=' + rid;
        vm.locationIndex = 0;
        Ajax(url).then(result => {
            if (result.code !== 0) {
                showTips('error', result.msg);
                return;
            }
            if (result.data.length == 0) {
                showTips('warn', this.extra_class_dialog ? 'No media player' : '无视频可播放');
                return;
            }
            let ocxInfo = result.data[0].ocxvideoInfo;
            let opt = {
                "ssIp": ocxInfo.ip,
                "ssPort": ocxInfo.port,
                "ssUsername": ocxInfo.account,
                "ssPasswd": ocxInfo.password
            }
            let code = player.loginVod(opt); //先登录流媒体
            if (code != 0) {
                vm.playing = false;
                $('.video-tool-bar .fa').addClass('disabled');
                showTips('error', this.extra_class_dialog ? 'The center video service failed to login. The error code was ' + code : '中心录像服务登录失败,出错代码为' + code);
                return;
            }
            vm.fileName = ocxInfo.playUrl.replace(/(.*\/)*([^.]+).*/ig, "$2") + '.' + ocxInfo.playUrl.replace(/.+\./, "");
            vm.videoTitleShow = true;
            // let duration = vm.activeVideoItem ? vm.activeVideoItem.duration : 0;
            // code = player.playVideotape(ocxInfo.playUrl, moment(0).format("YYYY-MM-DD HH-mm-ss"), moment(duration * 1000).format("YYYY-MM-DD HH-mm-ss"));
            code = player.playVideotape(ocxInfo.playUrl, moment(ocxInfo.startTime).format("YYYY-MM-DD HH-mm-ss"), moment(ocxInfo.endTime).format("YYYY-MM-DD HH-mm-ss"));
            if (code == -2) { //表示登录失败
                vm.playing = false;
                $('.video-tool-bar .fa').addClass('disabled');
                showTips('error', this.extra_class_dialog ? 'Login Fail!' : '登录失败');
                return;
            }
            if(vm.soundLevel > 0) {
                player.SoundCtrl(1,1,2);
            } else {
                player.SoundCtrl(1,0,2);
            }
            vm.playing = true;
            vm.isStop = false;
            $('.video-tool-bar .fa').removeClass('disabled');
            //当无轨迹信息时，只轮询ocx进度
            if (vm.locations.length === 0) {
                pollProcess();
                setSpeedBeforePlay();
            } else {
                let timer = setInterval(() => {
                    //轨迹第一点将与播放开始时间相等，或晚于播放开始时间
                    if (video.getPlayTimeStamp() >= vm.locations[0].time) {
                        pollLocation(true);
                        pollProcess();
                        clearInterval(timer);
                        //当自动播完/按了停止按钮之后，用户点了快放/慢放，此时重新播放时需要将播放速度调整为用户选择的速率
                        //一定要放在这个if里面，放在之前可能由于快放错过相等的这一时机，那这个if条件将不会被触发，也就不能进行进度轮询以及轨迹轮询
                        setSpeedBeforePlay();
                    }
                }, 100)
            }
        });
    },
    play: function () {
        player.controlVideotape(0, 0, 0, 1);
    },
    pause: function () {
        player.controlVideotape(1, 0, 0, 1);
    },
    stop: function () {
        player.controlVideotape(9, 0, 0, 1);
    },
    faster: function () {
        player.controlVideotape(2, 0, 0, 1);
    },
    slower: function () {
        player.controlVideotape(3, 0, 0, 1);
    },
    stepNext: function () {
        player.controlVideotape(4, 0, 0, 1);
    },
    stepPre: function () {
        player.controlVideotape(10, 0, 0, 1);
    },
    ctrlPlaySpeed: function (mode) {
        if (mode === 1) {
            if (vm.speed > 0) {
                vm.speed = vm.speed * 2;
            } else {
                let speed = vm.speed / 2;
                vm.speed = speed === -1 ? 1 : speed;
            }
        } else if (mode === -1) {
            if (vm.speed <= 1) {
                vm.speed = -(Math.abs(vm.speed) * 2);
            } else {
                vm.speed = vm.speed / 2;
            }
        } else {
            vm.speed = 1;
        }
    },
    closeAllVideoTape() {
        player.closeAllVideoTape();
    },
    getVideotapeProcess() {
        return player.getVideotapeProcess(1);
    },
    getPlayTimeStamp() {
        return player.getPlayTimeStamp();
    }
}

function compareString(str1, str2) {
    let num1 = [],
        num2 = [];
    num1 = str1.split('.');
    num2 = str2.split('.');
    let maxLength = num1.length > num2.length ? num1.length : num2.length;
    for (var i = 0; i < maxLength; i++) {
        if (num1[i] === undefined) {
            return false;
        }
        if (num2[i] === undefined) {
            return true;
        }
        if (Number(num1[i]) > Number(num2[i])) {
            return true;
        } else if (Number(num1[i]) < Number(num2[i])) {
            return false;
        } else if (Number(num1[i]) == Number(num2[i])) {
            continue;
        }
    }
    return false;
}

function _onOcxEventProxy(data) {
    var ret = eval('(' + data + ')'); //每次操作acx都会回调这里
    // console.log(JSON.stringify(ret))
    // console.log(player.getReplayWndInfoByIndex());
    if (ret.action == 'ReplayCtrl') { //录像控制的回调
        let mode = ret.data.nCtrlType;
        if (mode === 9) { //停止回调
            vm.isStop = true;
        } else if (mode === 7) { //进度条变化回调
            //    alert(JSON.stringify(ret))
            setTimeout(() => {
                let timestamp = video.getPlayTimeStamp();
                clearInterval(pollTimer);
                for (let i = 0; i < vm.locations.length - 1; i++) {
                    if (timestamp <= vm.locations[0].time || timestamp >= vm.locations[i].time && timestamp <= vm.locations[i + 1].time) {
                        vm.locationIndex = i;
                        pollLocation(true);
                        break;
                    }
                }
            }, 50)
        }
    }
}

/**
 * 发送ajax请求，默认为get请求
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 */
function Ajax(url, method, data) {
    return ajax({
        url: url,
        method: method || 'get',
        data: data || null,
        cache: false
    });
}

/**
 * 显示提示消息
 * @param {*} type 
 * @param {*} content 
 * @param {*} layout 
 */
function showTips(type, content, layout, duration) {
    notification[type]({
        title: vm.extra_class_dialog ? 'Kindly Reminder' : "温馨提示",
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}

function fetchOrgWhenExpand(treeId, treeNode, selectedKey) {
    // let url = '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType
    let data = {
        parentRid: treeNode.rid,
        superiorPlatformId: treeNode.platformId || treeNode.superiorPlatformId
    };
    ViewItem(data.parentRid, data.superiorPlatformId).then((result) => {
    // Ajax(url).then((result) => {
        let treeObj = $.fn.zTree.getZTreeObj(treeId);
        if (result.code == 0) {
            treeObj.addNodes(treeNode, handleRemoteTreeData(result.data));
        }
        if (selectedKey != treeNode.key) {
            let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
            treeObj.selectNode(node);
        }
    });
}

/**
 * 处理远程部门树的数据
 * @param {array} remoteData  远程请求得到的数据
 */
function handleRemoteTreeData(remoteData) {
    if (!remoteData) {
        return;
    }
    let handledData = [];
    avalon.each(remoteData, (index, el) => {
        if(isDevice(el.type, false) == orgIcon) {
            // key: el.orgId,
            // title: el.orgName,
            el.key = el.rid;
            el.title = el.itemName;
            el.code = el.orgCode;
            el.path = el.path;
            el.checkType = el.checkType;
            el.children = el.childs;
            el.isParent = true;
            el.icon = "/static/image/tyywglpt/org.png";
            handledData.push(el);
            handleRemoteTreeData(el.childs)
        };
    });
    return handledData;
}

function handleDuration(duration) {
    if (duration <= 0) {
        return "00:00:00"
    }
    let hour = Math.floor(duration / 3600);
    let minute = Math.floor(duration / 60 % 60);
    let second = Math.round(duration % 60);
    let durationStr = (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + (second < 10 ? '0' + second : second);
    return durationStr;
}

//播放前设置播放速度
function setSpeedBeforePlay() {
    if (vm.speed !== 1) {
        if (vm.speed > 0) {
            let fast = $('.fa-fast-forward').get(0);
            for (let i = 0; i < Math.log(vm.speed) / Math.log(2); i++) {
                video.faster();
            }
        } else {
            let slower = $('.fa-fast-backward').get(0);
            for (let i = 0; i < Math.log(Math.abs(vm.speed)) / Math.log(2); i++) {
                video.slower()
            }
        }
    }
}

/**
 * 设置播放器、地图大小
 *
 * @param {boolean} [isFirstLoad=false] 是否是首次加载
 */
function setVideoHeight(isFirstLoad = false) {
    // 延时函数
    let deferTimer = (delay, callback, immediately) => {
        immediately ? callback() : setTimeout(() => {
            callback();
        }, delay);
    };
    // 设置地图位置
    let setMapPosition = () => {
        let bounding = $('.right-container')[0].getBoundingClientRect();
        $('.map-iframe-wrap').css({
            top: bounding.top,
            left: bounding.left,
        });
    };
    vm.videoHeight = $('.left-container').outerHeight() - 35 - 50;
    $('#mapIframe').css({
        width: $('.lxhf-main-container .right-container').width(),
        height: $('.lxhf-main-container .right-container').outerHeight() / 2
    });
    isFirstLoad && typeof isFirstLoad != 'object' ? deferTimer(300, setMapPosition) : deferTimer(0, setMapPosition, true);
}

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function popover() {
    let titleTimer = null;
    $(".label-infos [data-toggle='popover']").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'auto right',
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
        titleTimer = setTimeout(() => {
            $('div.popover').remove();
            $(target).popoverX("show");
            $(".popover").off("mouseleave").on("mouseleave", (event) => {
                $(target).popoverX('hide');
            });
        }, 500);
    }).off("mouseleave").on("mouseleave", (event) => {
        let target = event.target;
        clearTimeout(titleTimer);
        setTimeout(() => {
            if (!$(".popover:hover").length) {
                $(target).popoverX("hide");
            }
        }, 100);
    });
}