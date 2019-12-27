import * as menuServer from '/services/menuService';
import {
    createForm,
    notification
} from 'ane';
import {
    isAllowSpeak,
    isAllowVideo,
    isAllowRecord,
    isAllowLock,
    isAllowPhotograph,
    gxxOcxVersion,
    languageSelect
} from '/services/configService';
let language_txt = require('/vendor/language').language;
import {
    store
} from '/apps/common/common-layout/common-layout-store.js';
import ajax from '/services/ajaxService';
import {
    Gxxplayer
} from "/vendor/gosunocx/gosunocx";
require('/apps/common/common-bk');
//import {mapInitObj} from '../common/common-mapInit';
const storage = require('/services/storageService.js').ret;
// import io from 'socket.io-client';
require("/apps/common/common-sszh-voiceTool.js");
require('/apps/common/common-switch.js');

let echarts = require("echarts/dist/echarts.min");
import '/services/filterService';
import '/vendor/jquery/jquery.SuperSlide.2.1.1';
import {
    Gm
} from '/apps/common/common-tools';

function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();

require("./sszhxt-sszh.css");
export const name = 'sszhxt-sszh';
let player, ocxele; //播放器
let updatemarkerArr = new Array; //地图更新标签数组
let DuoupdatemarkerArr = new Array; //地图多通道更新标签数组
let speakPerson = {}; //语音窗口当前对讲的人
let updatemarkerTime;
let reloginTime = 0; // 播放中断循环请求次数，2次提示
let vm = null,
    sszhHadReady = false,
    zTreeObj,
    echart,
    talkLoadingTimer = null;
// var latitude = 23.00;
// var longitude = 113.27;
var longinPersonOrgpath, longinPersonUid, faceURL; //保存当前登录用户的部门path,用于sos对比部门
var sszh = avalon.component(name, {
    template: __inline('./sszhxt-sszh.html'),
    defaults: {
        isie: '',
        recentData: [],
        downloadTipShow: false,
        downloadTipTxt: getLan(),
        tipText: getLan().needPlug,
        showtip: true,
        // showmap(e){
        //     if(e.keyCode == 13){
        //         $('.sszhxt-sszh-map').show();
        //     }
        //
        // },
        // hidemap(e){
        //     if(e.keyCode == 13){
        //         $('.sszhxt-sszh-map').hide();
        //     }
        //
        // },
        getShowStatus(show) {
            vm.downloadTipShow = show;
        },
        handleTreeCheck(event, treeId, treeNode, center) {
            if (treeNode.checked == false) {
                // 设置 true 来判断是通过取消勾选来删除的
                removerUpdatemarkerArr(treeNode.gbcode, true);
                if (sszhdeviceInfo.gbcode == treeNode.gbcode) {
                    sszhdeviceInfo.visible = false;
                }

                return;
            }
            // 选中后重置红色人脸布控和车牌布控图标为蓝色
            if (treeNode.checked) {
                sszhrlbk_vm.gbcode = '';
                cpbk.gbcode = '';
            }
            let pData, url;
            //分执法仪和多通道设备
            // if (treeNode.mytype == 0) {
            pData = {
                'devices': [treeNode.gbcode],
                'deviceType': "DSJ"
            };
            url = '/gmvcs/instruct/mapcommand/devicegps';
            // } 
            // else {
            //     pData = [treeNode.gbcode]
            //     url = '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=true';
            // }
            ajax({
                url: url,
                method: 'post',
                data: pData
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        title: getLan().notification,
                        message: getLan().deviceF
                    });
                    return;
                }
                // result.data[treeNode.gbcode].latitude = '';
                // result.data[treeNode.gbcode].longitude = '';
                result.data[treeNode.gbcode].typeName = treeNode.typeName;
                result.data[treeNode.gbcode].type = treeNode.type;

                //多通道设备处理
                if (treeNode.mytype != 0) {
                    //type只有多通道，外域执法仪和多通道设备都是显示一样的
                    sszhdeviceInfo.devName = result.data[treeNode.gbcode].name || result.data[treeNode.gbcode].deviceName;
                    sszhdeviceInfo.devmodel = result.data[treeNode.gbcode].model;
                    result.data[treeNode.gbcode].source = result.data[treeNode.gbcode].platformGbcode;
                    sszhdeviceInfo.type = treeNode.typeName;
                    sszhdeviceInfo.gbcodeArr = treeNode.children.length ? treeNode.children : [treeNode];
                    result.data[treeNode.gbcode].children = sszhdeviceInfo.gbcodeArr;
                }

                if (!result.data[treeNode.gbcode].latitude || !result.data[treeNode.gbcode].longitude) {
                    let newData = result.data;
                    avalon.each(newData, function (index, item) {
                        item.gbcode = treeNode.gbcode;
                        //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                        item.mytype = treeNode.mytype;
                        item.sosSource = treeNode.sosSource;
                        item.businessId = treeNode.businessId;
                        item.monitorType = treeNode.monitorType || ''; // monitorType = 当前打开弹窗类型 'rlbk' = 人脸布控 'rzhy' = 人证核验 'cpbk'= 车牌布控
                    });
                    if (treeNode.sosSource == "FACE_MONITORING" || treeNode.sosSource == "PERSON_IDCARD_SOS") { // 人脸布控和人证核验弹窗
                        sszhrlbk_vm.show(newData[treeNode.gbcode]);
                        return;
                    } else if (treeNode.sosSource == "CAR_MONITORING") {
                        cpbk.show(newData[treeNode.gbcode]);
                        return;
                    }

                    if (!center) {
                        notification.warn({
                            title: getLan().notification,
                            message: "部分设备无GPS"
                        });
                        return;
                    }
                    // result.data[treeNode.gbcode].latitude = latitude;
                    // result.data[treeNode.gbcode].longitude = longitude;
                    // latitude+=0.02;
                    // longitude+=0.02;
                    sszhdeviceInfo.gbcode = treeNode.gbcode;
                    sszhdeviceInfo.devName = result.data[treeNode.gbcode].deviceName;
                    if (result.data[treeNode.gbcode].userName == "") {
                        sszhdeviceInfo.username = '';
                    } else {
                        sszhdeviceInfo.username = result.data[treeNode.gbcode].userName;
                    }
                    if (result.data[treeNode.gbcode].userCode == "") {
                        sszhdeviceInfo.usercode = '-';
                    } else {
                        sszhdeviceInfo.usercode = result.data[treeNode.gbcode].userCode;
                    }
                    if (!result.data[treeNode.gbcode].capacityUsed) {
                        sszhdeviceInfo.capacityUsed = 0;
                    } else {
                        sszhdeviceInfo.capacityUsed = result.data[treeNode.gbcode].capacityUsed;
                    }
                    if (!result.data[treeNode.gbcode].capacityTotal) {
                        sszhdeviceInfo.capacityTotal = 0;
                    } else {
                        sszhdeviceInfo.capacityTotal = result.data[treeNode.gbcode].capacityTotal;
                    }
                    // 剩余容量
                    if (!result.data[treeNode.gbcode].remainingCapacity) {
                        sszhdeviceInfo.remainingCapacity = 0;
                    } else {
                        sszhdeviceInfo.remainingCapacity = result.data[treeNode.gbcode].remainingCapacity;
                    }
                    if (!result.data[treeNode.gbcode].battery) {
                        sszhdeviceInfo.battery = 0;
                    } else {
                        sszhdeviceInfo.battery = Number(result.data[treeNode.gbcode].battery);
                    }
                    if (result.data[treeNode.gbcode].source) {
                        sszhdeviceInfo.source = false;
                    } else {
                        sszhdeviceInfo.source = true;
                    }

                    //这个表示外域执法仪
                    if (treeNode.mytype == 0) {
                        sszhdeviceInfo.type = '执法仪';
                    }

                    sszhdeviceInfo.mytype = treeNode.mytype;
                    sszhdeviceInfo.signal = result.data[treeNode.gbcode].signal == undefined ? 0 : result.data[treeNode.gbcode].signal;
                    sszhdeviceInfo.lockStatus = result.data[treeNode.gbcode].locked == undefined ? 0 : result.data[treeNode.gbcode].locked;

                    sszhdeviceInfo.videoStatus = result.data[treeNode.gbcode].videoStatus;
                    if (sszhdeviceInfo.videoStatus == 1 && sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) == -1) {
                        sszhdeviceInfo.$recordArr.push(sszhdeviceInfo.gbcode);
                    }
                    sszhdeviceInfo.visible = true;
                    sszhdeviceInfo.isAllowRecord = isAllowRecord;
                    sszhdeviceInfo.isAllowPhotograph = isAllowPhotograph;
                    sszhdeviceInfo.isAllowLock = isAllowLock;
                    sszhdeviceInfo.isAllowSpeak = isAllowSpeak;
                    return;
                }

                //保存一个坐标点，用于缩小地图使用
                vm.lon = result.data[treeNode.gbcode].longitude;
                vm.lat = result.data[treeNode.gbcode].latitude;

                avalon.each(result.data, function (index, item) {
                    item.gbcode = treeNode.gbcode;
                    //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                    item.mytype = treeNode.mytype;
                    item.sosSource = treeNode.sosSource;
                    item.businessId = treeNode.businessId;
                    item.monitorType = treeNode.monitorType || ''; // monitorType = 当前打开弹窗类型 'rlbk' = 人脸布控 'rzhy' = 人证核验 'cpbk'= 车牌布控
                });
                if (treeNode.sosSource == "FACE_MONITORING" || treeNode.sosSource == "PERSON_IDCARD_SOS") { // 人脸布控和人证核验弹窗
                    sszhrlbk_vm.show(result.data[treeNode.gbcode]);
                } else if (treeNode.sosSource == "CAR_MONITORING") {
                    cpbk.show(result.data[treeNode.gbcode]);
                }
                createUpdatemarkerArr(result.data[treeNode.gbcode], center, false, event);
            });
        },
        extraProcessWhenExpand(i, value) {
            isShowMap(i, value); //是否在地图上有标记点
        },
        extraProcessWhenPersonChange(node) {
            removerUpdatemarkerArr(node.gbcode); //不在线清楚地图标注
        },
        extraHandleWhenCheckOrg() {
            if (vm.lon == '' || vm.lat == '') {
                return;
            }
            // 昆明会出现api报错
            // $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(vm.lon, vm.lat, 8);
        },
        returnTreeObj(a) {
            zTreeObj = a;
        },
        sidebarFoldChange(type) {
            if (type == 'close') {
                $('.sszhxt-sszh-map').animate({
                    left: 210
                }, 500);
                $('.sszhrightcontainer').animate({
                    left: 0
                });
            } else {
                $('.sszhxt-sszh-map').animate({
                    left: 490
                }, 500);
                $('.sszhrightcontainer').animate({
                    left: 280
                });
            }
        },
        handleDeviceClick(el, event) { //点击最近人员设备
            if (el.commandType == 'USER') {
                return;
            }
            el.checked = null;
            this.handleTreeCheck(event, '', el);
        },
        handlePersonDeviceClick(item, event) {
            let obj = {};
            obj.gbcode = item;
            obj.checked = null;
            this.handleTreeCheck(event, '', obj);
        },
        lon: '',
        lat: '',
        sszhmapobj: '',
        toolUse: true,
        setcity() {
            sszhmap.showcityName = avalon.components['common-sszh-mapcity'].defaults.nowcity;
            this.lon = avalon.components['common-sszh-mapcity'].defaults.lon;
            this.lat = avalon.components['common-sszh-mapcity'].defaults.lat;
            //保存当前点击的城市
            avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity = sszhmap.showcityName;
        },
        ocxindex: 1, //ocx窗口值
        soundLevel: 80,
        //音量调节
        handleSoundLevel(v) {
            //须先开启声音
            player.SoundCtrl(1, 1, 1);
            player.setVolume(v);
        },
        monitorType: '',
        clickChange(data) {
            // let data = {"deviceId":"44010000901511089122","datetime":"2018-10-18 16:38:34","orgId":"1","uid":"GMU0000000020181010113614ff1fffffd","sosType":"人脸布控告警","sosSource":"FACE_MONITORING","businessId":"GMF0000000020181018163834ffdfffff6","userCode":"100086","userName":"展鸿","orgCode":"44010000","orgPath":"/44010000/","sosDate":1539851914000,"status":1,"gbcode":"44010000901511089122","mytype":0};
            updatemarkerArr = [];
            data.monitorType = this.monitorType;
            if (this.monitorType == 'rlbk') {
                cpbk.closeSszhCpbf();
                sszhrlbk_vm.show(data);
            } else if (this.monitorType == 'cpbk') {
                sszhrlbk_vm.close_click();
                cpbk.show(data);
            } else {
                cpbk.closeSszhCpbf();
                sszhrlbk_vm.show(data);
            }
        },
        // 隐藏设备树
        hideDevTree() {
            $('.common-sszhnew-side-bar').css({
                display: 'none'
            });
            $('.sszhxt-sszh-map').css({
                left: 210
            });
            $('.sszhrightcontainer').css({
                left: 0
            });
        },
        // 显示设备树
        showDevTree() {
            $('.common-sszhnew-side-bar').css({
                display: 'block',
                left: 0
            });
            $('.sszhxt-sszh-map').css({
                left: 490
            });
            $('.sszhrightcontainer').css({
                left: 280
            });
        },
        toMonitorRegistry() {
            //隐藏告警列表
            avalon.vmodels['sszhxt_vm'].sosInfoShow = false;

            let hash = "";
            if (this.monitorType == 'cpbk') {
                hash = "/tyyhrzpt-xtpzgl-sbk-cpk";
            }
            if (this.monitorType == 'rzhy') {
                hash = "/sszhxt-znsb-bk";
            }
            if (this.monitorType == 'rlbk') {
                // hash = "http://10.10.18.88:8080/FaceFinder/facefinder/index.action";
                hash = faceURL;
                if (hash) {
                    window.open(hash, "_blank");
                    return;
                }
            }
            avalon.history.setHash(hash);
        },
        toMonitorRegistrySet() {
            this.dialogRylxkszShow = true;
        },
        // 人员类型库显示
        dialogRylxkszShow: false,
        // 人员类型库弹窗确定
        dialogRylxkszOk() {
            if (rylxksz.threshold < 75 || rylxksz.threshold > 100) {
                notification.error({
                    message: '识别阀值不在设置范围内',
                    title: '温馨提示'
                });
                return false;
            }
            let selectedIds = [];
            avalon.each(rylxksz.personlistAll, (i, el) => {
                if (el.enable) {
                    selectedIds.push(el.id);
                }
            });

            if (!selectedIds.length) {
                notification.error({
                    message: '人员类型库至少勾选一选',
                    title: '温馨提示'
                });
                return false;
            }
            ajax({
                url: '/gmvcs/uap/person/type/setting',
                method: 'post',
                data: {
                    "selectedIds": selectedIds.join(),
                    "threshold": rylxksz.threshold
                }
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '修改成功',
                        title: '温馨提示'
                    });
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            });
            this.dialogRylxkszCel();
        },
        // 人员类型库弹窗取消
        dialogRylxkszCel() {
            this.dialogRylxkszShow = false;
        },
        // 权限
        opt_: avalon.define({
            $id: "opt_rlbk",
            authority: { // 按钮权限标识
                "CAS_MENU_SBK_RLK": false, //人脸库
                "CAS_MENU_SBK_RLKSZ": false, //人脸库设置
                "CAS_MENU_SBK_ZDRYK": false, //重点人员库设置
                "CAS_MENU_SBK_CPK": false //车牌库
            }
        }),
        CAS_MENU: [],
        onInit(event) {
            vm = event.vmodel;
            vm.isie = isIE();
            getFaceURL(); //初始化 高新兴人脸库地址
            window._onOcxEventProxy = _onOcxEventProxy;
            $('.sszhxt-sszh-map').show();
            // 初始化            
            // 获取权限
            menuServer.menu.then(menu => {
                for (let item in menu.SSZH_MENU_SSZHXT_ARR) {
                    this.CAS_MENU.push(item);
                }

                this.opt_.authority.CAS_MENU_SBK_RLK = this.CAS_MENU.in_array('CAS_MENU_SBK_RLK');
                this.opt_.authority.CAS_MENU_SBK_ZDRYK = this.CAS_MENU.in_array('CAS_MENU_SBK_ZDRYK');
                this.opt_.authority.CAS_MENU_SBK_RLKSZ = this.CAS_MENU.in_array('CAS_MENU_SBK_RLKSZ');
                this.opt_.authority.CAS_MENU_SBK_CPK = this.CAS_MENU.in_array('CAS_MENU_SBK_CPK');
            });

            let tooltipsDom = $("[data-toggle='popover']");
            Gm_tool.showPopover(tooltipsDom);
        },
        onReady() {
            //用户设置的默认城市
            sszhmap.showcityName = avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity;
            this.lon = avalon.vmodels['sszhxt_vm'].$cityDetailobj.lon;
            this.lat = avalon.vmodels['sszhxt_vm'].$cityDetailobj.lat;
            updatemarkerTime = setInterval(function () {
                refreshTimed(); //地图点更新函数
            }, 5000);
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
                $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer();
            }
            //======================


            //=======================
            let data = storage.getItem('sszhxt-SOS');
            if (data) this.handleTreeCheck('', '', data, true);
            // setInterval(function () {
            //     let z =  Number($("#regOcxDiv1").attr('z-index')) || 0;
            //     $("#regOcxDiv1").attr('z-index',  z +100 );
            //     console.log('z-index',  z);
            // }, 100);
            initOcx();

            sszhHadReady = true;

            let tooltipsDom = $("[data-toggle='popover']");
            Gm_tool.showPopover(tooltipsDom);

            // 人员类型库设置list
            this.$watch('dialogRylxkszShow', newVal => {
                if (newVal) {
                    ajax({
                        url: '/gmvcs/uap/person/type/find/setting',
                        method: 'get'
                    }).then(ret => {
                        if (ret.code == 0) {
                            rylxksz.personlistAll = ret.data.personTypes;
                            rylxksz.threshold = ret.data.threshold;
                            // 全选是否打钩
                            let flab = true;
                            for (let i = 0; i < rylxksz.personlistAll.length; i++) {
                                if (!rylxksz.personlistAll[i].enable) {
                                    flab = false;
                                    break;
                                }
                            }
                            if (flab) {
                                rylxksz.checkedAll = true;
                            }
                        }
                    });
                }
            });

            listener();

        },
        onDispose() {
            $('.mapcity_popup_main').hide();
            updatemarkerArr = [];
            if (vm.isie && ocxele.object || !vm.isie && undefined != ocxele.GS_ReplayFunc) { //防止没有安装ocx报错
                //清除掉ocx点流的所有操作
                if (speakPerson.gbcode) {
                    sszhyyth.closesszhhyyth();
                }
                if (0 != player.getStatusByIndex(-1)) {
                    player.stopRec(1); //结束视频
                    // player.stopTalk(sszhsp.gbcode); //结束音频
                    // player.stopTSTalk(sszhsp.gbcode); //结束音频
                    // sszhsp.controlDuoTalk(sszhsp.gbcode, "CLOSE").then(result => {
                    //     // console.log(result);
                    //     // if(result.code != 0) {
                    //     //     notification.warn({
                    //     //         title: "通知",
                    //     //         message: "结束语音失败"
                    //     //     });
                    //     // }
                    // });
                }
                if (starttalkType) {
                    player.stopTSTalk(speakPerson.gbcode); //结束音频
                } else {
                    player.stopTalk(speakPerson.gbcode); //结束音频
                }
                player.uninit();
            }
            avalon.each(sszhmap.devhtmllist, function (index, item) {
                clearInterval(item.timeobj); //清除定时器
            });
            clearInterval(updatemarkerTime); //地图更新定时器
            clearInterval(talkLoadingTimer); // 清除语音通话定时器
            clearInterval(sszhyyth.countsszhythtimeObject); // 清除语计时器
            //停止所有录像
            stopRecordByarr(getRecordDevice());
            //sszhgjxxManage.gjxxlist = [];
            //退出的时候先清除地图所有标记
            $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
            storage.removeItem('sszhxt-SOS');
            sszhdeviceInfo.visible = false;
            sszhsp.server = {};
        }
    }
});

//定义一个监听的方法
let listener = () => {
    let timer = setInterval(() => {
        if (sszhHadReady) {
            clearInterval(timer);
            let iframeContent = $('#mapIframe')[0].contentWindow;
            let currentValue = store.getState();
            if (currentValue.siderMenuSelectedKey == 'rlbk') {
                vm.monitorType = currentValue.siderMenuSelectedKey;
                updatemarkerArr = [];
                iframeContent.esriMap && iframeContent.esriMap.remove_overlay();
                vm.hideDevTree();
            }
            if (currentValue.siderMenuSelectedKey == 'cpbk') {
                vm.monitorType = currentValue.siderMenuSelectedKey;
                updatemarkerArr = [];
                iframeContent.esriMap && iframeContent.esriMap.remove_overlay();
                vm.hideDevTree();
            }
            if (currentValue.siderMenuSelectedKey == 'rzhy') {
                vm.monitorType = currentValue.siderMenuSelectedKey;
                updatemarkerArr = [];
                iframeContent.esriMap && iframeContent.esriMap.remove_overlay();
                vm.hideDevTree();
            }
            if (currentValue.siderMenuSelectedKey == 'sszhxt-sszh') {
                vm.monitorType = '';
                updatemarkerArr = [];
                iframeContent.esriMap && iframeContent.esriMap.remove_overlay();
                vm.showDevTree();
            }
            cpbk.closeSszhCpbf();
            sszhrlbk_vm.close_click();
        }
    }, 200);
};
// //创建一个监听
store.subscribe(listener);

//无gps定位信息
var sszhdeviceInfo = avalon.define({
    $id: 'sszhdeviceInfo',
    extra_class: languageSelect == "en" ? true : false,
    sszhdeviceInfo_txt: getLan(),
    source: false,
    visible: false,
    username: '',
    usercode: '',
    gbcode: '',
    signal: '',
    battery: 0,
    mytype: '',
    capacityUsed: 0,
    capacityTotal: 0,
    remainingCapacity: 0,
    lockStatus: 0,
    videoStatus: 0,
    disabled: '',
    $recordArr: [],
    width: '',
    usedWidth: 0,
    spanTwowidth: 0,
    syrl: 0,
    zrl: 0,
    lockword: '',
    type: '', //设备类型名字
    devName: '', //设备名称
    devmodel: '', //外域设备显示设备型号
    gbcodeArr: '', //通道数组
    isAllowRecord: '', //允许录像
    isAllowLock: '', //允许锁定
    isAllowPhotograph: '', //允许拍照
    isAllowSpeak: '', //允许语音
    $computed: {
        width: function () {
            return this.battery / 100 * 38
        },
        usedWidth: function () {
            if (this.capacityUsed && this.capacityTotal) {
                return this.capacityUsed / this.capacityTotal * 310;
            }
            return 0;
        },
        surplusCapacity: function () {
            let sum = this.capacityTotal - this.capacityUsed;
            return sum > 0 ? sum : 0;
        },
        spanTwowidth: function () {
            if (this.usedWidth != 0) {
                return this.usedWidth / 4 + 80;
            } else {
                return 90;
            }
        },
        lockword: function () {
            if (this.lockStatus == 0) {
                return '远程锁定';
            } else {
                return '远程解锁';
            }
        },
        disabled: function () {
            if (this.lockStatus == 0) {
                return '';
            } else {
                return 'disabled';
            }
        }
    },
    hideInfo() {
        this.visible = false;
    },
    record() {
        let data = {};
        let optCmd;
        if (this.videoStatus == 0) {
            optCmd = 'Start';
        } else {
            optCmd = 'Stop';
        }

        ajax({
            url: '/gmvcs/uom/device/dsj/control/record?deviceId=' + sszhdeviceInfo.gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().operationF
                });
                return;
            }
            if (optCmd == 'Start') {
                notification.success({
                    title: getLan().notification,
                    message: getLan().startVideoS
                });
                sszhdeviceInfo.videoStatus = 1;
                if (sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) == -1) {
                    sszhdeviceInfo.$recordArr.push(sszhdeviceInfo.gbcode);
                }
            } else {
                notification.success({
                    title: getLan().notification,
                    message: getLan().stopVideoS
                });
                sszhdeviceInfo.videoStatus = 0;
                if (sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) != -1) {
                    sszhdeviceInfo.$recordArr.splice(sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode), 1);
                }
            }
        })
    },
    vedioplay() {
        sszhsp.params = {
            gbcode: this.gbcode,
            username: this.username,
            usercode: this.usercode,
            signal: this.signal,
            mytype: this.mytype
        };
        sszhinfowindow.playVideo(this.gbcode, this.username, this.usercode, this.signal, this.devName, this.mytype, this.gbcodeArr);
    },
    startTalk() {
        let username = this.username || this.devName;
        let usercode = this.usercode || this.devmodel;
        sszhinfowindow.startTalk(this.gbcode, username, usercode, this.signal, this.mytype);
    },
    photograph() {
        let data = {};
        ajax({
            url: '/gmvcs/uom/device/dsj/control/photo?deviceId=' + sszhdeviceInfo.gbcode,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: '服务器异常,拍照指令下发失败'
                });
                return;
            }
            notification.success({
                title: getLan().notification,
                message: '拍照指令下发成功'
            });
        });
    },
    lock() {
        let data = {};
        let optCmd;
        if (this.lockStatus == 0) {
            optCmd = 'Lock';
        } else {
            optCmd = 'Unlock';
        }
        ajax({
            url: '/gmvcs/uom/device/dsj/control/lock?deviceId=' + sszhdeviceInfo.gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then((ret) => {
            if (ret.code == 0) {
                if (optCmd == "Lock") {
                    notification.success({
                        title: getLan().notification,
                        message: "锁定成功"
                    });
                    sszhdeviceInfo.lockStatus = 1;
                    sszhdeviceInfo.disabled = 'disabled';
                    changeTreeImg(sszhdeviceInfo.gbcode, true);
                    return;
                } else {
                    notification.success({
                        title: getLan().notification,
                        message: "解锁成功"
                    });
                    sszhdeviceInfo.lockStatus = 0;
                    sszhdeviceInfo.disabled = '';
                    changeTreeImg(sszhdeviceInfo.gbcode, false);
                    return;
                }

            }
            notification.error({
                title: getLan().notification,
                message: "服务器后端异常,锁定失败"
            });
        })
    }
})

//判断是否有设备正在录像
function getRecordDevice() {
    var deviceobject = $('#mapIframe')[0].contentWindow.esriMap.getRecordData();
    var arr = [];
    avalon.each(deviceobject, function (key, value) {
        if (value.record == true || value.record == 'true') {
            arr.push(key);
        }
    });
    arr = arr.concat(sszhdeviceInfo.$recordArr);
    if (arr.length <= 0) return;
    return arr;
}
//循环停止录像
function stopRecordByarr(arr) {
    avalon.each(arr, function (index, val) {
        ajax({
            url: '/gmvcs/uom/device/dsj/control/record?deviceId=' + val + '&optCmd=Stop',
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                return;
            }
        });
    })
}

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function isShowMap(i, value) {
    for (var j = 0, len = updatemarkerArr.length; j < len; j++) {
        if (updatemarkerArr[j].gbcode == value.gbcode) {
            value.checked = true;
            return;
        } else {
            value.checked = false;
            return;
        }
    }

    return false;
}

//操作标记数组的函数
function controlMarkerArr(marker) {
    for (var i = 0; i < updatemarkerArr.length; i++) {
        let markerTmp = updatemarkerArr[i];
        if (markerTmp.gbcode == marker.gbcode) {
            updatemarkerArr.splice(i--, 1);
            updatemarkerArr.push(marker); //将点击后的地图标记更新点放在最后面
            break;
        }
    }
}
/**
 * 新建地图更新点
 *
 * @param {*} data 设备数据
 * @param {*} center 是否设置为中心点
 * @param {*} isUpdating 数据来源于更新
 */
function createUpdatemarkerArr(data, center, isUpdating, event) {
    removerUpdatemarkerArr(data.gbcode); //这里是为了防止它从最近人员那里点击
    //initMapObject.createMarker(data, center);
    //语音对讲是否出现
    data.isAllowSpeak = isAllowSpeak;
    data.isAllowVideo = isAllowVideo;
    data.isAllowRecord = isAllowRecord;
    data.isAllowLock = isAllowLock;
    data.isAllowPhotograph = isAllowPhotograph;
    // 布控画圆，需要设置 showType 和 executeControlClick
    if (event && event.type && /^bk-show/.test(event.type)) {
        if (event.type === 'bk-show-rlbk') {
            data.showType = 'FACE_MONITORING';
        }
        if (event.type === 'bk-show-cpbk') {
            data.showType = 'CAR_MONITORING';
        }
        data.executeControlClick = true;
    };
    $('#mapIframe')[0].contentWindow.esriMap.createMarker(data, center, isUpdating);
    let marker = {};
    // marker.dev = data.deviceId;
    marker.gbcode = data.gbcode;
    //执法仪的
    if (data.mytype == 0) {
        updatemarkerArr.push(marker); //将地图点加入更新数组
    } else {
        //多通道的
        DuoupdatemarkerArr.push(marker);
    }

}

/**
 * 删除更新标记数组的单个点
 * 设置 isCancel 来判断是通过取消勾选来删除的
 */
function removerUpdatemarkerArr(gbcode, isCancel) {
    var markerTmp;
    //执法仪的
    for (var i = 0; i < updatemarkerArr.length; i++) {
        markerTmp = updatemarkerArr[i];
        if (markerTmp.gbcode == gbcode) {
            //initMapObject.removerMarker(gbcode);
            $('#mapIframe')[0].contentWindow.esriMap.removerMarker(gbcode, isCancel);
            updatemarkerArr.splice(i--, 1);
            break;
        }
    }
    //多通到的
    for (var i = 0; i < DuoupdatemarkerArr.length; i++) {
        markerTmp = DuoupdatemarkerArr[i];
        if (markerTmp.gbcode == gbcode) {
            //initMapObject.removerMarker(gbcode);
            $('#mapIframe')[0].contentWindow.esriMap.removerMarker(gbcode, isCancel);
            DuoupdatemarkerArr.splice(i--, 1);
            break;
        }
    }
}
/*
 * 更新标记数组的点
 * */
function updateMapMarkers(data) {
    let tempPointData = []; // 需要更新的点数组
    let arr = [];
    arr = updatemarkerArr.concat([]);
    arr.concat(DuoupdatemarkerArr);
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < data.length; j++) {
            if (arr[i].gbcode != undefined && data[j].gbcode != undefined && arr[i].gbcode == data[j].gbcode && data[i].latitude && data[i].longitude) {
                removerUpdatemarkerArr(data[i].gbcode);
                // 标记更新点是否是来自告警信息
                if (data[i].gbcode == sszhrlbk_vm.gbcode) {
                    data[i].showType = "FACE_MONITORING";
                    data[i].executeControlClick = sszhrlbk_vm.executeControlClick;
                    tempPointData.unshift(data[i]);
                } else if (data[i].gbcode == cpbk.gbcode) {
                    data[i].showType = "CAR_MONITORING";
                    data[i].executeControlClick = cpbk.executeControlClick;
                    tempPointData.unshift(data[i]);
                } else {
                    tempPointData.push(data[i]);
                }

                // createUpdatemarkerArr(data[i], false);
                break;
            }
        }
    }
    // 通过unshift、push控制布控点为第一点（被先画出来），防止层级覆盖导致有些marker点被布控圈挡住而不能点击
    for (let i = 0; i < tempPointData.length; i++) {
        createUpdatemarkerArr(tempPointData[i], false, true);
    }
}
/*
 *获取更新点的数据
 * duo表示是否是更新多通道的点
 * */
function getUpdateMarkerData(devArr, duo) {
    if (devArr.length == 0) {
        return;
    }
    let pData, url;
    if (!duo) {
        pData = {
            'devices': devArr,
            'deviceType': "DSJ"
        };
        url = '/gmvcs/instruct/mapcommand/devicegps';
    } else {
        pData = devArr;
        url = '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=true';
    }

    ajax({
        url: url,
        method: 'post',
        data: pData
    }).then(result => {
        if (result.code != 0) {
            notification.warn({
                title: getLan().notification,
                message: "获取设备信息失败"
            });
            return;
        }
        let arr = [];
        if (!duo) {
            for (var i = 0; i < devArr.length; i++) { //按照我自己想要的顺序更新点，不能用avalon.each，这个不按照顺序输出的
                var key = devArr[i];
                avalon.each(updatemarkerArr, function (i, el) {
                    if (result.data[key].deviceId == el.gbcode) {
                        result.data[key].gbcode = el.gbcode;
                        //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                        result.data[key].mytype = 0;
                        arr.push(result.data[key]);
                    }
                })
            }
        } else {
            for (var i = 0; i < devArr.length; i++) { //按照我自己想要的顺序更新点，不能用avalon.each，这个不按照顺序输出的
                var key = devArr[i];
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                if (result.data[key].type == '快速布控') {
                    result.data[key].mytype = 1;
                } else if (result.data[key].type == '移动车载终端') {
                    result.data[key].mytype = 2;
                } else {
                    result.data[key].mytype = 3;
                }
                arr.push(result.data[key]);
            }
        }
        if (arr.length <= 0) return;
        // arr[0].latitude = latitude;
        // arr[0].longitude = longitude;
        // latitude+=0.02;
        // longitude+=0.02;
        updateMapMarkers(arr, true);
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            avalon.each(result.data, function (i, el) {
                if (!el.signal) el.signal = 0;
                if (speakPerson.gbcode && speakPerson.gbcode == el.gbcode) {
                    sszhyyth.signal = el.signal; //语音窗口signal
                }
                if (item.gbcode == el.gbcode) {
                    item.signal = el.signal; //更新视频窗口信号强度
                    return;
                }
            })

        });
    })
}
/*
 * 获取多通道更新点的数据
 * */
function getUpdateMarkerDataDuo(devArr) {
    if (devArr.length == 0) {
        return;
    }
    ajax({
        url: '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=false',
        method: 'post',
        data: devArr
    }).then(result => {
        if (result.code != 0) {
            notification.warn({
                title: getLan().notification,
                message: "获取多通道设备信息失败"
            });
            return;
        }


    })
}

/*
 *  定时刷新点调用函数
 * */
function refreshTimed() {
    let postdevArr = [];
    avalon.each(updatemarkerArr.slice(0, updatemarkerArr.length), function (i, v) {
        postdevArr.push(v.gbcode);
    })
    let postdevArrDuo = [];
    avalon.each(DuoupdatemarkerArr.slice(0, DuoupdatemarkerArr.length), function (i, v) {
        postdevArrDuo.push(v.gbcode);
    })
    getUpdateMarkerData(postdevArr);
    //多通道更新
    // getUpdateMarkerData(postdevArrDuo, true);

    //5秒定时刷新 布控 轮播
    let flagWin1 = $(".sszh-cpbk").css('z-index');
    let flagWin2 = $(".sszhrlbk-wrap").css('z-index');
    if (flagWin1 == '-1' && flagWin2 == '-1') { //有弹窗的时候取消定时5秒刷新列表
        avalon.components['ms-bk'].defaults.getList();
    }
}

/*
 *  改变部门树图标样式函数
 */
function changeTreeImg(gbcode, symbol) {
    var node = zTreeObj.getNodesByParam("gbcode", gbcode, null)
    if (node) {
        symbol ? node[0].icon = '/static/image/sszhxt/locked.png' : node[0].icon = '/static/image/sszhxt/device_online.png';
    }
    zTreeObj.updateNode(node[0]);
}

//========================================地图======================================
let sszhmap = avalon.define({
    $id: 'sszhmap',
    extra_class: languageSelect == "en" ? true : false,
    sszhmap_txt: getLan(),
    sszhthmintitletoggle: false,
    sszhyyhtml: [],
    devhtmllist: [],
    //sszhthmintitle : this.sszhyyhtml + this.sszhsphtml,
    expandsszhyy: function (e) {
        $(".sszhyythmincontianer").hide(100, function () {
            $("#sszhyyth").show(300);
        });
    },
    locate(item) { //点击语音地图定位
        let pData, url;
        //分执法仪和多通道设备
        // if (item.mytype == 0) {
        pData = {
            'devices': [item.gbcode],
            'deviceType': "DSJ"
        };
        url = '/gmvcs/instruct/mapcommand/devicegps';
        // } 
        ajax({
            url: url,
            method: 'post',
            data: pData
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: getLan().notification,
                    message: result.msg
                });
                return;
            }
            //多通道设备的接口放回值不一致，处理
            //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机

            if (item.mytype != 0) {
                // result.data[item.gbcode] = result.data[item.gbcode][0];
                result.data[item.gbcode].source = result.data[item.gbcode].platformGbcode;
            }
            if (!result.data[item.gbcode].latitude || !result.data[item.gbcode].longitude) {

                sszhdeviceInfo.gbcode = item.gbcode;
                sszhdeviceInfo.devName = result.data[item.gbcode].deviceName;
                if (result.data[item.gbcode].userName == "") {
                    sszhdeviceInfo.userame = '-';
                } else {
                    sszhdeviceInfo.username = result.data[item.gbcode].userName;
                }
                if (result.data[item.gbcode].userCode == "") {
                    sszhdeviceInfo.usercode = '-';
                } else {
                    sszhdeviceInfo.usercode = result.data[item.gbcode].userCode;
                }
                if (!result.data[item.gbcode].capacityUsed) {
                    sszhdeviceInfo.capacityUsed = 0;
                } else {
                    sszhdeviceInfo.capacityUsed = result.data[item.gbcode].capacityUsed;
                }
                if (!result.data[item.gbcode].capacityTotal) {
                    sszhdeviceInfo.capacityTotal = 0;
                } else {
                    sszhdeviceInfo.capacityTotal = result.data[item.gbcode].capacityTotal;
                }
                // 剩余容量
                if (!result.data[item.gbcode].remainingCapacity) {
                    sszhdeviceInfo.remainingCapacity = 0;
                } else {
                    sszhdeviceInfo.remainingCapacity = result.data[item.gbcode].remainingCapacity;
                }
                if (!result.data[item.gbcode].battery) {
                    sszhdeviceInfo.battery = 0;
                } else {
                    sszhdeviceInfo.battery = result.data[item.gbcode].battery;
                }
                if (result.data[item.gbcode].source) {
                    sszhdeviceInfo.source = false;
                } else {
                    sszhdeviceInfo.source = true;
                }

                //type只有多通道，外域执法仪和多通道设备都是显示一样的
                sszhdeviceInfo.devName = result.data[item.gbcode].name || result.data[item.gbcode].deviceName;
                sszhdeviceInfo.devmodel = result.data[item.gbcode].model;
                //这个表示外域执法仪
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                if (item.mytype == 0) {
                    sszhdeviceInfo.type = '执法仪';
                }
                if (item.mytype != 0) {
                    // sszhdeviceInfo.type = result.data[item.gbcode].type;
                    // sszhdeviceInfo.gbcodeArr = result.data[item.gbcode].channelSet;
                    sszhdeviceInfo.type = item.typeName;
                    sszhdeviceInfo.gbcodeArr = item.children.length ? item.children : [item];
                }
                sszhdeviceInfo.mytype = item.mytype;
                sszhdeviceInfo.signal = result.data[item.gbcode].signal == undefined ? 0 : result.data[item.gbcode].signal;
                sszhdeviceInfo.lockStatus = result.data[item.gbcode].locked == undefined ? 0 : result.data[item.gbcode].locked;
                sszhdeviceInfo.videoStatus = result.data[item.gbcode].videoStatus;
                if (sszhdeviceInfo.videoStatus == 1 && sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) == -1) {
                    sszhdeviceInfo.$recordArr.push(sszhdeviceInfo.gbcode);
                }
                sszhdeviceInfo.visible = true;
                sszhdeviceInfo.isAllowRecord = isAllowRecord;
                sszhdeviceInfo.isAllowPhotograph = isAllowPhotograph;
                sszhdeviceInfo.isAllowLock = isAllowLock;
                sszhdeviceInfo.isAllowSpeak = isAllowSpeak;
                return;
            }
            avalon.each(result.data, function (index, el) {
                el.gbcode = item.gbcode;
                el.mytype = item.mytype;
            })
            createUpdatemarkerArr(result.data[item.gbcode], true);
        })
    },
    expandsszhsp(item) {
        sszhsp.hidesszhspth(); //将之前的的人hide，显示在左侧栏
        sszhsp.sszhspthtime = item.time;
        // sszhsp.dev = item.dev;
        sszhsp.gbcode = item.gbcode;
        sszhsp.signal = item.signal;
        if (item.mytype != 0) {
            sszhsp.name = item.name;
            sszhsp.deviceName = item.name;
            if (item.mytype == 1) {
                sszhsp.deviceType = '快速布控设备';
            } else if (item.mytype == 2) {
                sszhsp.deviceType = "车载移动执法设备";
            } else {
                sszhsp.deviceType = "警用无人机";
            }

        } else {
            if (languageSelect == "zhcn") {
                if (!item.username) {
                    sszhsp.name = "与" + item.name + "视频通话中";
                } else {
                    sszhsp.name = "与" + item.username + '(' + item.usercode + ')' + "视频通话中";
                }
            } else {
                if (!item.username) {
                    sszhsp.name = "Talking to " + item.name;
                } else {
                    sszhsp.name = "Talking to " + item.username + '(' + item.usercode + ')';
                }
            }

        }
        // sszhsp.name = "与" + item.username + '(' + item.usercode + ')' + "视频通话中";
        sszhsp.playVideo(item.childGbcode, item.name);
        sszhsp.checkItem = item.childGbcode;
        sszhsp.showsszhspth = true;
        //不显示工具
        if (item.mytype != 0) {
            sszhsp.isShowTools = true;
            sszhsp.gbcodeArr = item.devArr;
            $(".sszhspth").css({
                'z-index': dargObject.getMaxIndex() + 1,
                'width': 1050,
                'height': 560
            });
        } else {
            sszhsp.isShowTools = false;
            $(".sszhspth").css({
                'z-index': dargObject.getMaxIndex() + 1,
                'width': 810,
                'height': 560
            });
        }
        $('#npGSVideoPlugin').css({
            'z-index': 999
        });
        //隐藏对应的左侧栏
        avalon.each(this.devhtmllist, function (index, item) {
            if (item.gbcode == sszhsp.gbcode) {
                item.show = false;
            }
        });
        Gm_tool.ToggleSosBg();
    },
    loadingtoggle: true,
    toggleshow: function () {
        $(".sszhgj").hide(100, function () {
            $(".sszhgjxx").show(500); //用avalon的animate会出现切换导航的过程中触发enter,leave动画，换为jquery。
        });

    },
    togglehide: function () {
        $(".sszhgjxx").hide(500, function () {
            $(".sszhgj").show(100);
        });
    },
    move: function (e) {
        let d = e.target.offsetParent; //父元素
        let w = d.scrollWidth; //父元素宽度
        let h = d.offsetHeight;
        dargObject.move(d, e, w, h);
    },
    showtool() {
        $(".mapcljl").toggle(100);
    },
    showcitylist() {
        $('.mapcity_popup_main').toggle(200);
    },
    mearsurelength() {
        //initMapObject.measureLength();
        $('#mapIframe')[0].contentWindow.esriMap.measureLength();
    },
    showBkfw() {
        bkfwVm.show = true;
    },
    mapsearchvalue: '请输入警员姓名/警号/设备名称', //地图搜索
    placeholderstatue: 0,
    showmapclose: false,
    $computed: {
        showmapclose: function () {
            if (this.placeholderstatue != 0) {
                return true;
            } else {
                return false;
            }
        },
        placeholderstatue: function () {
            if (this.mapsearchvalue != '' && this.mapsearchvalue != '请输入警员姓名/警号/设备名称') {
                return 1;
            } else {
                return 0;
            }
        }
    },
    emptyinput(event) {
        this.mapsearchvalue = '';
        this.placeholderstatue = 0;
        $("#mapsearch").focus();
    },
    focusinput() {
        if (this.mapsearchvalue != '' && this.placeholderstatue != 0) {
            this.placeholderstatue = 1; //表示显示x,0不显示x
        } else {
            this.emptyinput();
        }
    },
    restoretip(e) {
        e.preventDefault();
        $("#mapsearch").blur();
        if (this.mapsearchvalue == '') {
            this.mapsearchvalue = '请输入警员姓名/警号/设备名称';
            this.placeholderstatue = 0;
        }
    },
    mapsearch() {
        if ($.trim(this.mapsearchvalue) == '' || this.placeholderstatue == 0) {
            return;
        }
        let data = {};
        data = sszhmap.mapsearchvalue;
        ajax({
            url: '/gmvcs/uom/device/dsj/dsjInfo',
            method: 'post',
            data: data
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: getLan().notification,
                    message: "找不到警员和设备"
                });
                return;
            } else if (result.data.length <= 0) {
                notification.warn({
                    title: getLan().notification,
                    message: "找不到警员和设备"
                });
                return;
            } else {
                var devarr = [];
                for (var i = 0; i < result.data.length; i++) {
                    if (result.data[i].online == 0) {
                        devarr.push(result.data[i].gbcode);
                    }
                }
                if (devarr.length <= 0) {
                    notification.warn({
                        title: getLan().notification,
                        message: "无警员和设备在线"
                    });
                    return;
                }
                let pData = {
                    'devices': devarr,
                    'deviceType': "DSJ"
                };
                ajax({
                    url: '/gmvcs/instruct/mapcommand/devicegps',
                    method: 'post',
                    data: pData
                }).then(result => {
                    if (result.code != 0) {
                        notification.warn({
                            title: getLan().notification,
                            message: "获取设备信息失败"
                        });
                        return;
                    }
                    if (JSON.stringify(result.data) == '{}') {
                        notification.warn({
                            title: getLan().notification,
                            message: "搜索的设备无GPS"
                        });
                        return;
                    }
                    let point = {};
                    avalon.each(result.data, function (index, item) {
                        item.gbcode = item.deviceId;
                        createUpdatemarkerArr(item, false); //不把地图中心定位到这个人
                        point.lon = item.longitude;
                        point.lat = item.latitude;
                    })
                    //initMapObject.setMapCenter(point.lon, point.lat,8);//缩小地图层级，
                    $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(point.lon, point.lat, 8);
                });
            }
        })
    },
    handleQuickSearch(event) {
        if (event.keyCode == 13) {
            this.mapsearch();
        }
    },
    showcityName: "广州",
    citylocate(event) {
        let city = event.target.innerText;
        let lon = avalon.vmodels['sszhxt_vm'].$cityDetailobj.cityobj[city].lon;
        let lat = avalon.vmodels['sszhxt_vm'].$cityDetailobj.cityobj[city].lat;
        $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
    }
});
//语音对讲类型
let starttalkType = 0;
//视频播放
let sszhsp = avalon.define({
    $id: 'sszhdtspck',
    sszhsp_txt: getLan(),
    name: '',
    server: {},
    params: {},
    word: getLan().voice,
    ifallowtalk: isAllowSpeak,
    $computed: {
        xhword: function () {
            if (languageSelect == "zhcn") {
                if (sszhsp.signal < 15) {
                    return '差';
                } else if (sszhsp.signal > 50) {
                    return '良';
                } else {
                    return '优';
                }
            } else {
                if (sszhsp.signal < 15) {
                    return 'Bad';
                } else if (sszhsp.signal > 50) {
                    return 'Fine';
                } else {
                    return 'Great';
                }
            }
        }
    },
    signal: 0, //信号强度
    dev: '',
    gbcode: '', //表示窗口的gbcode,执法仪gbcode跟childGbcode一样，多通道时这个是父的gbcode
    childGbcode: '', //正在点流的gbcode,多通道是就是某个通道的gbcode
    deviceName: '', //设备名称
    deviceType: '', //设备类型
    gbcodeArr: [], //通道数组
    isShowTools: false, //是否显示右侧工具
    showToolBtn: false, //是否显示控制按钮
    checkItem: '', //选择的通道
    oldCheckItem: '', //之前选择的通道，用于对比现在点的通道是不是跟之前一样
    isMove: false, //鼠标是否按下
    imgClientx: 0, //鼠标按下的位置
    imgMoveX: 125, //图标移动的距离
    imgStartx: 125, //图标开始的left值
    mytype: '', //设备类型mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
    checkIndexFn(e, item) {
        //进行点流操作
        let v = e.target.value;
        if (v == this.oldCheckItem) {
            return;
        }
        this.oldCheckItem = v;
        this.playVideo(v, item.deviceName?item.deviceName:item.name);

        if (item.mytype == 0) {
            this.showToolBtn = false;
        } else {
            this.showToolBtn = true;
        }
    },
    moveImg(e) {
        let x;
        if (this.isMove) {
            if (e.clientX - this.imgClientx >= 0) {
                x = this.imgStartx + e.clientX - this.imgClientx;
                if (x >= 240) {
                    this.imgMoveX = 240;
                    return;
                }
                this.imgMoveX = x;
            } else {
                x = this.imgStartx - Math.abs(e.clientX - this.imgClientx);
                if (x <= 0) {
                    this.imgMoveX = 0;
                    return;
                }
                this.imgMoveX = x;
            }
        }
    },
    moveUpImg(e) {
        this.isMove = false;
    },
    moveDownImg(e) {
        this.isMove = true;
        this.imgClientx = e.clientX;
        this.imgStartx = this.imgMoveX;
    },
    showsszhspth: true,
    sszhyycontrol: 1,
    sszhsptalkcontrol: false, //false表示没有语音对讲，true表示有
    sszhsptalkword: '对讲',
    closesszhspth() {

        this.showsszhspth = false;
        $(".sszhspth").css({
            'z-index': 0
        });
        $('#npGSVideoPlugin').css({
            'z-index': 0
        });
        $('.sszhxt-sszh-map').show();
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1); //结束视频
        }
        this.sszhsptalkword = '对讲';
        this.sszhyycontrol == 1;
        //this.word ='开启';
        //删除对应的左侧栏
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            if (item.gbcode == sszhsp.gbcode) {
                clearInterval(item.timeobj); //清除定时器
                sszhmap.devhtmllist.removeAt(index);
                return;
            }
        });
        this.gbcode = '';
        this.sszhspthtime = "00:00:00";
    },
    hidesszhspth() {

        this.showsszhspth = false;
        $(".sszhspth").css({
            'z-index': 0
        });
        $('#npGSVideoPlugin').css({
            'z-index': 0
        });
        //$('.sszhxt-sszh-map').show();
        //因为公用ocx，最小化的时候其实是关闭流的，点开在重连
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1); //结束视频
        }

        if (speakPerson.gbcode != this.childGbcode) { //不能关闭了人家单独点开的语音
            if (starttalkType) {
                player.stopTSTalk(this.gbcode); //结束音频
            } else {
                player.stopTalk(this.gbcode); //结束音频
            }
        }

        this.sszhsptalkword = '对讲';
        this.sszhyycontrol == 1;
        //this.word ='开启';
        //显示对应的左侧栏
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            if (item.gbcode == sszhsp.gbcode) {
                item.show = true;
            }
        });

    },
    sszhspthtime: "00:00:00",
    slient() {
        if (this.sszhyycontrol === 0) {
            this.sszhyycontrol = 1;
            this.word = '开启';
        } else {
            this.sszhyycontrol = 0;
            this.word = '静音';
        }
        player.MuteTalk(0, this.sszhyycontrol === 1 ? 0 : 1); // 0-开启 1-关闭
        return this.sszhyycontrol;
    },
    controlDuoTalk(gbcode, operate) {
        let url = "/gmvcs/uom/device/dsj/control/ptt";
        let method = "post";
        let params = {
            "gbcode": gbcode,
            "operateType": operate
        };

        return ajax({
            url: url,
            method: method,
            data: params,
        });
    },
    // 多通道语音对讲
    srartTalkByDuo(gbcode, symbol, callback) {

        player.stopTSTalk(gbcode); //结束音频
        // this.controlDuoTalk(gbcode, "CLOSE").then(result => {
        //     // if(result.code != 0) {
        //     //     notification.warn({
        //     //         title: "通知",
        //     //         message: "结束语音失败"
        //     //     });
        //     // }
        // });

        this.controlDuoTalk(gbcode, "OPEN").then(result => {
            if (result.code == 1702) {
                notification.error({
                    title: getLan().notification,
                    message: '设备不在线'
                });
                return;
            } else if (result.code == 1701) {
                notification.error({
                    title: getLan().notification,
                    message: '获取流媒体信息失败'
                });
                return;
            } else if (result.code == 1900) {
                notification.warn({
                    title: '通知',
                    message: result.msg
                });
                return;
            } else if (result.code == 0) {

                var code = player.startTSTalk(result.data.streamUrl); //登录成功，进行语音呼叫
                if (code == -2) { //返回-2表示没有登录成功
                    return;
                } else if (code == -4) { //放回-4表示当前已有对讲，先关闭
                    notification.warn({
                        title: getLan().notification,
                        message: '当前已经有语音对讲，请先关闭'
                    });
                    return;
                }
                if (code != 0) {
                    notification.error({
                        title: getLan().notification,
                        message: getLan().callF
                    });
                    return;
                }
                if (!symbol) {
                    this.sszhsptalkcontrol = true;
                    this.sszhsptalkword = '结束';
                }

                callback && callback(code);
                return code;
            }
        });
    },
    talkingMap: [],
    currentTalkGbcode: '',
    // 判断当前通话的设备gbcode是否在ajax的异步回调中
    handleDelayAjax(gbcode) {
        let hasDelayCallback = false;
        avalon.each(this.talkingMap, (key, val) => {
            if (gbcode == val) {
                hasDelayCallback = true;
            }
        });
        return hasDelayCallback
    },
    starttalk(gbcode, symbol, callback) { //symbol用来判断这个语音是点击视屏的语音还是地图那边调用的语音

        var gb = gbcode;
        this.currentTalkGbcode = gb;
        if (!symbol) {
            gb = this.gbcode;
        }
        if (this.sszhsptalkcontrol) {
            var code;
            if (starttalkType) {
                code = player.stopTSTalk(speakPerson.gbcode); //结束音频
            } else {
                code = player.stopTalk(speakPerson.gbcode); //结束音频
            }
            if (code == 0) {
                this.sszhsptalkcontrol = false;
                this.sszhsptalkword = '对讲';
            }
            // else {
            //     notification.error({
            //         title: getLan().notification,
            //         message: '结束语音失败'
            //     });
            // }
        }
        this.talkingMap.push(gb);
        ajax({
            url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_speak&deviceId=' + gb,
            method: 'get',
            data: null,
        }).then(result => {
            if (result.code == 0) {
                // 如果已将语音通话中了，就不执行下面了（防止都成功异步请求。如先请求的反而异步后执行）
                if (sszhsp.sszhsptalkcontrol) return;
                result.data.gbcode = gb;
                avalon.Array.remove(this.talkingMap, gb);
                let code = null;
                if (!sszhyyth.sszhyytoggle) return; // 如果异步回调中，页面已经关闭了，就不进行点流了
                if (result.data.playURL) {
                    code = player.startTSTalk(result.data.playURL); //无需登录直接语音
                    starttalkType = 1;
                } else {
                    starttalkType = 0;
                    code = player.login(result.data); //先登录流媒体
                    if (code != 0) {
                        notification.error({
                            title: getLan().notification,
                            message: getLan().mediaLoginF + code
                        });
                        sszhyyth.sszhyytoggle = false;
                        return;
                    }
                    code = player.startTalk(result.data); //登录成功，进行语音呼叫
                }
                if (code == -2) { //返回-2表示没有登录成功
                    return;
                } else if (code == -4) { //放回-4表示当前已有对讲，先关闭
                    notification.warn({
                        title: getLan().notification,
                        message: '当前已经有语音对讲，请先关闭'
                    });
                    return;
                }
                if (code != 0) {
                    sszhyyth.sszhyytoggle = false;
                    notification.error({
                        title: getLan().notification,
                        message: getLan().callF
                    });
                    return;
                }
                this.sszhsptalkcontrol = true;
                if (!symbol) {
                    this.sszhsptalkword = '结束';
                }

                callback && callback(code);
                return code;
            } else {
                let hasDelayCallback = this.handleDelayAjax(gb);
                // 若当前异步回调的 gb 能在找到 talkingMap 中找到，才不会进去 if 里面
                if (!hasDelayCallback || (!this.sszhsptalkcontrol && (gb == this.currentTalkGbcode))) {
                    sszhyyth.sszhyytoggle = false;
                    notification.error({
                        title: getLan().notification,
                        message: result.msg
                    });
                }
            }
        });
    },
    playVideo: function (childGbcode, deviceName) { //实时点流
        //因为是公用一个ocx播放器，确定ocx一定是空闲状态
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1);
        }
        //$('.sszhxt-sszh-map').hide();
        setTimeout(() => { // 解决点流切换太快画面会重叠的情况
            ajax({
                url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_video&deviceId=' + childGbcode,
                method: 'get',
                data: null
            }).then(result => {
                if (result.code == 0) {
                    result.data.gbcode = childGbcode;
                    if (result.data.playURL) { //表示gsp方式点流
                        // result.data.url = result.data.gsp;
                        result.data.url = result.data.playURL;

                        let code = player.playRecByUrl(result.data, deviceName);
                        if (code != 0) {
                            notification.error({
                                title: getLan().notification,
                                message: '视频呼叫失败'
                            });
                            return;
                        }
                    } else {
                        let code = player.login(result.data); //先登录流媒体
                        if (code != 0) {
                            notification.error({
                                title: getLan().notification,
                                message: getLan().mediaLoginF + code
                            });
                            return;
                        }
                        reloginTime = 0;
                        sszhsp.server = result.data;
                        code = player.playRec(result.data, deviceName); //实时点流
                        if (code == -2) { //表示登录失败
                            return;
                        }
                    }

                    setTimeout(() => {
                        //须先开启声音
                        vm.handleSoundLevel(vm.soundLevel);
                    }, 500);


                    //sszhsp.dev = dev;//保存播放的当前设备
                    sszhsp.childGbcode = childGbcode;
                    //callback && callback(code);
                    //return code;
                } else {
                    notification.error({
                        title: getLan().notification,
                        message: result.msg
                    });
                }
            });
        }, 1300);

    },
    // stopvideo(){
    //     sszh.clearsszhspthtime();
    //     player.stopRec(-1);
    // },
    printscreen() {
        var obj = player.printOcxWindow(1);
        //     if (obj.code == 0) {
        //         notification.success({
        //             title: getLan().notification,
        //             message: '截图成功,图片保存路径为D:\\CaptureFolder\\' + obj.time + '.jpg'
        //         });
        //         return;
        //     }
        //     notification.error({
        //         title: getLan().notification,
        //         message: '截图失败'
        //     });
    },
    maxView() {
        player.maxView();
    },
    switchValue: false,
    switchLoading: false,
    switchStatus: false,
    onSwitch(status) {
        this.switchLoading = true;
        this.switchValue = status;
        this.switchStatus = status;
        if(status) { // ON
            speakPerson = {};
            let { gbcode, username, usercode, signal, mytype } = sszhsp.params;
            sszhinfowindow.startTalk(gbcode, username, usercode, signal, mytype);
        } else { // OFF
            sszhyyth.closesszhhyyth();
            this.switchLoading = false;
        }
    },
    // 云台控制请求
    ptzControlAjax(operContent, operateCode) {
        return ajax({
            url: '/gmvcs/uom/device/dsj/control/ptzControl',
            method: 'post',
            data: {
                "extParam": 0,
                "gbcode": this.checkItem,
                "name": "",
                "operContent": operContent,
                "ptzCtrlType": operateCode
            }
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: getLan().notification,
                    message: "云台控制操作失败！"
                });
                return;
            }
        });
    },
    //还原预置点
    ResetPreset() {
        var operContent = "1";
        var operateCode = "PTZ_GOTO_PRESET";
        this.ptzControlAjax(operContent, operateCode);
    },
    hadMouseDown: false,
    operateCode: '',
    // 云台控制 可长按操作方法
    cloudPlatformControl(e, operate) {
        // var operContent;
        this.operateCode = `PTZ_${operate}`;
        switch (e.type) {
            case 'mousedown':
                this.hadMouseDown = true;
                break;
            case 'mouseup':
                this.hadMouseDown = false;
                break;
            case 'mouseleave':
                this.hadMouseDown = false;
        }
        // this.ptzControlAjax(operContent, operateCode);
    },
    //自转
    rotation() {

    }

})
//监听图标是否移动
sszhsp.$watch('imgMoveX', (v) => {
    // console.log(v);
})
// 监听云台控制--鼠标长按、移动
sszhsp.$watch('hadMouseDown', (v) => {
    if (v) {
        sszhsp.ptzControlAjax("1", sszhsp.operateCode);
    } else {
        sszhsp.ptzControlAjax("0", sszhsp.operateCode);
    }
});


let notFoundCarPicture = '/static/image/theme/default/car-list-404-big.png?__sprite';
let notFoundFacePicture = '/static/image/theme/default/face-list-404-big.png?__sprite';

// ----人脸布控---------------------------------------
let sszhrlbk_vm = avalon.define({
    $id: 'sszhrlbk',
    rlbkExtra_class: languageSelect == "en" ? true : false,
    rlbk_txt: getLanFace(),
    echart_option: {
        color: ['#ffffff', '#d72222'].reverse(),
        series: [{
            hoverAnimation: false,
            type: 'pie',
            radius: ['55%', '70%'],
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
                    value: 88.88
                },
                {
                    value: 11.12
                }
            ]
        }],
        graphic: [{
            id: 'percent_txt',
            type: 'text',
            style: {
                text: '88.88%',
                x: 52,
                y: 70,
                fill: '#ffffff',
                font: '14px "Microsoft YaHei", sans-serif'
            }
        }]
    },
    recognition_info: {},
    recognition_arr: [],
    regImage: "",
    shootPersonImgFilePath: "",
    result_list: [],
    battery: 50,
    gbcode: '',
    data: {},
    address: '',
    keyPersonDbName: '',
    keyPersonDetail: '',
    shootTime: '',
    personIsNormal: null,
    noLocaltionInfo: '',
    executeControlClick: false,
    titleText: '',
    urlPiece: '',
    bkLoading: false,

    $computed: {
        width: function () {
            return this.battery / 100 * 38;
        }
    },

    // 打开人脸布控或者人证核验弹窗
    show(data) {
        this.bkLoading = false;
        this.executeControlClick = false;
        this.data = null;
        this.data = data;
        this.noLocaltionInfo = '';
        if (!data.latitude || !data.longitude) {
            this.noLocaltionInfo = '无定位信息';
        }


        // this.battery = data.battery;
        this.recognition_info = {};
        this.regImage = notFoundFacePicture;
        this.shootPersonImgFilePath = notFoundFacePicture;
        if (data.gbcode)
            this.gbcode = data.gbcode;

        let width = 840;
        let height = 390;
        if (this.data.monitorType == 'rzhy') {
            width = 720;
            height = 430;
        }
        $('.sszhrlbk-wrap').css({
            'z-index': 9997,
            'width': width,
            'height': height
        });

        this.titleText = this.data.monitorType == 'rlbk' ? '人脸布控' : '重点人员比对结果';
        this.urlPiece = this.data.monitorType == 'rlbk' ? 'face' : 'key-person';

        this.getRecognition(data.businessId);
    },
    getFaceRecognitionInfo(recordID, type = '') {
        if (type == '') {
            type = this.urlPiece;
        }
        if (type == 'rlbk') {
            type = 'face';
        }

        if (type == 'rzhy') {
            type = 'key-person';
        }

        return ajax({
            // url: '/api/getRec',
            url: `/gmvcs/instruct/${type}/monitoring/get/recognition?id=${recordID}`,
            method: 'get',
            data: {}
        });
    },

    // 接口数据处理及渲染
    getRecognition: function (recordID) {
        this.getFaceRecognitionInfo(recordID).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: '获取人脸识别结果失败，请稍后再试',
                    title: '通知'
                });
                return;
            }

            if (result.data.deviceId) {
                this.gbcode = result.data.deviceId;
            }
            this.shootTime = result.data.shootTime;

            // this.recognition_arr = result.data.recogPersons;
            this.recognition_info = result.data;
            if (this.data.monitorType == 'rlbk') { // 人脸布控弹窗参数
                this.regImage = result.data.personRegImgFilePath;
                this.shootPersonImgFilePath = result.data.shootPersonImgFilePath;
                this.personIsNormal = this.recognition_info.isNormal;
                echart = echarts.init(document.getElementById("show_percent"));
                sszhrlbk_vm.echart_option.series[0].data = [{
                        value: Number(sszhrlbk_vm.recognition_info.personSimilarity).toFixed(2)
                    },
                    {
                        value: (100 - Number(sszhrlbk_vm.recognition_info.personSimilarity)).toFixed(2)
                    }
                ];
                sszhrlbk_vm.echart_option.color = ['#ffffff', '#d72222'].reverse();
                let percentageText = Number(sszhrlbk_vm.recognition_info.personSimilarity).toFixed(2) + "%";
                sszhrlbk_vm.echart_option.graphic[0].style.text = percentageText;
                echart.setOption(sszhrlbk_vm.echart_option);
            } else { // 人证核验弹窗参数
                if (result.data.recogKeyPersons.length > 0) {
                    this.regImage = result.data.recogKeyPersons[0].regImgPath;
                    this.address = result.data.recogKeyPersons[0].address;
                    this.keyPersonDbName = result.data.recogKeyPersons[0].keyPersonDbName;
                    this.keyPersonDetail = result.data.recogKeyPersons[0].keyPersonDetail;
                    this.personIsNormal = this.recognition_info.personIsNormal;
                } else {
                    this.regImage = null;
                    this.address = '-';
                    this.keyPersonDbName = '-';
                    this.keyPersonDetail = '-';
                    this.personIsNormal = null;
                }
                // echart = echarts.init(document.getElementById("show_percent"));
                // sszhrlbk_vm.echart_option.series[0].data = result.data.personIsConsistent ? [{
                //     value: 90
                // }, {
                //     value: 10
                // }] : [{
                //     value: 50
                // }, {
                //     value: 50
                // }];
                // sszhrlbk_vm.echart_option.color = result.data.personIsConsistent ? ['#30ff00', '#ffffff'] : ['#d72222', '#ffffff'];
                // let percentageText = result.data.personIsConsistent ? "一致" : "不一致";
                // sszhrlbk_vm.echart_option.graphic[0].style.text = percentageText;
                // echart.setOption(sszhrlbk_vm.echart_option);
            }

            // let tooltipsDom = $("[data-toggle='popover']");
            // Gm_tool.showPopover(tooltipsDom);

            // let temp = [];
            // for (let i = 0; i < sszhrlbk_vm.recognition_arr.length; i++) {
            //     let obj = sszhrlbk_vm.recognition_arr[i];
            //     obj.index = i;
            //     if (languageSelect == "en")
            //         obj.similarityTxt = "resemblance:";
            //     else
            //         obj.similarityTxt = "相似度：";

            //     temp.push(obj);
            // }
            // this.result_list = temp;

            // $(".comparison_result .result_list li").removeClass("select_li");
            // $(".comparison_result .result_list li:eq(0)").addClass("select_li");

            // jQuery(".comparison_result").slide({
            //     titCell: ".control_bar ul",
            //     mainCell: ".result_list",
            //     autoPage: true,
            //     effect: "left",
            //     vis: 6,
            //     pnLoop: false,
            //     trigger: "click"
            // });

            // if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
            //     $(".comparison_result .result_list").css({
            //         "margin-left": "35px"
            //     });
            // }

            // $(".comparison_result .tempWrap").width($(".rlbk_detail_content").width() - 80);
        });
    },

    result_list_click(index) {
        this.recognition_info = this.recognition_arr[index];

        sszhrlbk_vm.echart_option.series[0].data = [{
                value: Number(sszhrlbk_vm.recognition_info.personSimilarity).toFixed(2)
            },
            {
                value: (100 - Number(sszhrlbk_vm.recognition_info.personSimilarity)).toFixed(2)
            }
        ];
        sszhrlbk_vm.echart_option.graphic[0].style.text = Number(sszhrlbk_vm.recognition_info.personSimilarity).toFixed(2) + "%";
        echart.setOption(sszhrlbk_vm.echart_option);

        $(".comparison_result .result_list li").removeClass("select_li");
        $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
    },

    // 视频呼叫按钮
    sphj() {

        sszhinfowindow.playVideo(this.data.gbcode || this.gbcode, this.data.userName, this.data.userCode, this.data.signal || 0, this.data.deviceName || this.data.userName + '的设备', this.data.mytype || 0, sszhdeviceInfo.gbcodeArr);
    },

    // 语音对讲
    startTalkInfaceWin() {

        sszhinfowindow.startTalk(this.data.gbcode || this.gbcode, this.data.userName, this.data.userCode, this.data.signal || 0, this.data.mytype || 0);
    },

    // 布控按钮
    bk() {
        let contentWindow = $('#mapIframe')[0].contentWindow;
        contentWindow.circleArr = []; //初始化布控
        contentWindow.esriMap && contentWindow.esriMap.remove_overlay(); //清除旧布控信息
        let radius = bkfwVm.radius; // 布控范围半径
        if (Number(radius) === 0) {
            notification.warn({
                title: '通知',
                message: '请先在“工具-布控范围”设置布控范围'
            });
            return;
        }
        if (!this.data.latitude || !this.data.longitude) {
            notification.warn({
                title: '通知',
                message: '该设备无定位信息，不能进行布控'
            });
            return;
        }
        this.bkLoading = true;
        ajax({
            url: '/gmvcs/instruct/track/gps/around/devices?lat=' + this.data.latitude + '&lon=' + this.data.longitude + '&radius=' + radius,
            method: 'get',
            data: null
        }).then(result => {
            this.bkLoading = false;
            if (result.code != 0) {
                notification.error({
                    message: '服务器后端错误，请联系管理员。',
                    title: '通知'
                });
                return;
            }
            let data = result.data;
            this.executeControlClick = true;

            notification.success({
                message: '远程布控成功！',
                title: '通知'
            });
            // handleTreeCheck里调用的方法也画圆了,防止重复
            // if (JSON.stringify(data) == '{}') {
            // let circle = contentWindow.esriMap.createCircle({
            //     longitude: this.data.longitude,
            //     latitude: this.data.latitude
            // }, radius);
            // circle.id = this.data.userCode;
            // circle.name = this.data.userName;
            // circle.gbcode = this.data.gbcode;
            // contentWindow.circleArr.push(circle);
            // }  else {
            let params = {
                gbcode: this.gbcode,
                mytype: 0,
                checked: null
            };
            vm.handleTreeCheck({
                type: 'bk-show-rlbk'
            }, '', params, true);
            for (let i in data) {
                if (data[i] == 'DSJ' && i != this.data.gbcode) { // TODO 暂时只做执法仪
                    let obj = {};
                    obj.gbcode = i;
                    obj.mytype = 0;
                    obj.checked = null;
                    vm.handleTreeCheck('', '', obj, true);
                }
            }
            // }
            this.close_click();
        });
    },

    // 关闭弹窗
    close_click() {
        $(".sszhrlbk-wrap").css({
            "z-index": "-1"
        });
        this.recognition_info = {};
        this.regImage = notFoundFacePicture;
        this.shootPersonImgFilePath = notFoundFacePicture;
        this.address = '';
        this.keyPersonDbName = '';
        this.keyPersonDetail = '';
        this.data = null;
    }
});

// -------------------------------------------


// 车牌布控窗口
let cpbk = avalon.define({
    $id: 'sszh-cpbk',
    recognitionCarInfo: {
        carNumber: "",
        carType: "",
        carOwner: "",
        carBrand: "",
        carIdCard: "",
        carOwnerAddress: "",
        carEngineNo: "",
        carUse: "",
        carDbName: "",
        carValid: ""
    },
    leftPhoto: notFoundCarPicture,
    rightPhoto: notFoundCarPicture,
    battery: 0,
    gbcode: '',
    data: {},
    shootTime: '',
    noLocaltionInfo: '',
    executeControlClick: false,
    bkLoading: false,
    $computed: {
        width: function () {
            return this.battery / 100 * 38;
        }
    },

    // 视频呼叫
    videoplay() {
        sszhinfowindow.playVideo(this.data.gbcode || this.gbcode, this.data.userName, this.data.userCode, this.data.signal || 0, this.data.deviceName || this.data.userName + '的设备', this.data.mytype || 0, sszhdeviceInfo.gbcodeArr);
    },
    // 语音对讲
    startTalkInCarWin() {
        sszhinfowindow.startTalk(this.data.gbcode || this.gbcode, this.data.userName, this.data.userCode, this.data.signal || 0, this.data.mytype || 0);
    },
    // 布控
    executeControl() {
        let contentWindow = $('#mapIframe')[0].contentWindow;
        contentWindow.circleArr = []; //初始化布控
        contentWindow.esriMap && contentWindow.esriMap.remove_overlay(); //清除旧布控信息
        let radius = bkfwVm.radius; // 布控范围半径;
        if (Number(radius) === 0) {
            notification.warn({
                title: '通知',
                message: '请先在“工具-布控范围”设置布控范围'
            });
            return;
        }
        if (!this.data.latitude || !this.data.longitude) {
            notification.warn({
                title: '通知',
                message: '该设备无定位信息，不能进行布控'
            });
            return;
        }
        this.bkLoading = true;
        ajax({
            url: '/gmvcs/instruct/track/gps/around/devices?lat=' + this.data.latitude + '&lon=' + this.data.longitude + '&radius=' + radius,
            method: 'get',
            data: null
        }).then(result => {
            this.bkLoading = false;
            if (result.code != 0) {
                notification.error({
                    message: '服务器后端错误，请联系管理员。',
                    title: '通知'
                });
                return;
            }
            let data = result.data;
            this.executeControlClick = true;

            notification.success({
                message: '远程布控成功！',
                title: '通知'
            });
            // handleTreeCheck里调用的方法也画圆了,防止重复
            // if (JSON.stringify(data) == '{}') {
            // let circle = contentWindow.esriMap.createCircle({
            //     longitude: this.data.longitude,
            //     latitude: this.data.latitude
            // }, radius);
            // circle.id = this.data.userCode;
            // circle.name = this.data.userName;
            // circle.gbcode = this.data.gbcode;
            // contentWindow.circleArr.push(circle);
            // } else {
            let params = {
                gbcode: this.gbcode,
                mytype: 0,
                checked: null
            };
            vm.handleTreeCheck({
                type: 'bk-show-cpbk'
            }, '', params, true);
            for (let i in data) {
                if (data[i] == 'DSJ' && i != this.data.gbcode) { // TODO 暂时只做执法仪
                    let obj = {};
                    obj.gbcode = i;
                    obj.mytype = 0;
                    obj.checked = null;
                    vm.handleTreeCheck('', '', obj, true);
                }
                // }
            }
            this.closeSszhCpbf();
        });
    },
    getCarRecognitionInfo(businessId) {
        return ajax({
            // url: '/api/getCarRec',
            url: '/gmvcs/instruct/car/monitoring/get/recognition?id=' + businessId,
            method: 'get',
            data: null
        });
    },
    // 打开车牌布控弹窗
    show(data) {
        this.bkLoading = false;
        this.executeControlClick = false;
        $(".sszh-cpbk").css({
            'z-index': 9997,
            'width': 850,
            'height': 480
        });

        this.data = data;

        this.noLocaltionInfo = '';
        if (!data.latitude || !data.longitude) {
            this.noLocaltionInfo = '无定位信息';
        }

        // this.battery = data.battery;
        this.recognitionCarInfo = {};
        this.leftPhoto = notFoundCarPicture;
        this.rightPhoto = notFoundCarPicture;

        if (data.gbcode)
            this.gbcode = data.gbcode;

        this.getCarRecognitionInfo(data.businessId).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: '获取车牌识别结果失败，请稍后再试',
                    title: '通知'
                });
                return;
            }
            let res = result.data,
                recognitionCarInfo = {};
            if (res.deviceId) {
                this.gbcode = res.deviceId;
            }
            this.shootTime = res.shootTime;
            if (res.recognitionCarInfo && res.recognitionCarInfo.length > 0) {
                recognitionCarInfo = res.recognitionCarInfo[0];
                recognitionCarInfo.carUse = res.recognitionCarInfo[0].carUse == "1" ? "运营" : "非运营";
                this.rightPhoto = res.recognitionCarInfo[0].carRegImgFilePath;
            }
            recognitionCarInfo.carNumber = res.carNumber;
            recognitionCarInfo.isNormal = res.isNormal;
            this.recognitionCarInfo = recognitionCarInfo;
            this.leftPhoto = res.shootCarImgFilePath;
        });
    },
    // 关闭车牌布控弹窗
    closeSszhCpbf() {
        $(".sszh-cpbk").css({
            'z-index': '-1'
        });
        this.recognitionCarInfo = {};
        this.leftPhoto = notFoundCarPicture;
        this.rightPhoto = notFoundCarPicture;
    }
});


//语音通话窗口vm
let sszhyyth = avalon.define({
    $id: 'sszhyyth',
    sszhyyth_txt: getLan(),
    sszhthjy: '',
    $computed: {
        xhword: function () {
            if (languageSelect == "zhcn") {
                if (sszhyyth.signal < 15) {
                    return '差';
                } else if (sszhyyth.signal > 50) {
                    return '良';
                } else {
                    return '优';
                }
            } else {
                if (sszhyyth.signal < 15) {
                    return 'Bad';
                } else if (sszhyyth.signal > 50) {
                    return 'Fine';
                } else {
                    return 'Great';
                }
            }
        }
    },
    mytype: 0,
    signal: 0, //信号强度
    sszhyythtime: '00:00:00',
    slienceText: '静音',
    countsszhythtime: 0, //语音计时
    sszhyycontrol: 0, //禁音控制开关
    countsszhythtimeObject: '', //语音定时器
    countTime: function () {
        let h, m, s;
        this.countsszhythtime = this.countsszhythtime + 1;
        h = parseInt(this.countsszhythtime / 3600);
        m = parseInt(this.countsszhythtime % 3600 / 60);
        s = parseInt(this.countsszhythtime % 3600 % 60);
        if (h < 10) {
            h = '0' + h;
        }
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        this.sszhyythtime = h + ':' + m + ':' + s;
        this.countsszhythtimeObject = setTimeout(sszhyyth.countTime, 1000);
    },
    sszhyytoggle: false,
    loadingFlash: '',
    sszhyythaction: 'enter',
    hidesszhyythaction: function () {
        $("#sszhyyth").hide(300, function () {
            $(".sszhyythmincontianer").show(100);
        });
    },
    closesszhhyyth: function () {
        clearTimeout(sszhyyth.countsszhythtimeObject); //清除定时器
        this.sszhyythtime = "00:00:00";
        this.countsszhythtime = 0;
        sszhyyth.talkingMap = [];
        sszhmap.sszhyyhtml = [];
        let code;
        // code = player.stopTalk(speakPerson.gbcode); //结束音频
        // code = player.stopTSTalk(speakPerson.gbcode);
        if (starttalkType) {
            code = player.stopTSTalk(speakPerson.gbcode); //结束音频
        } else {
            code = player.stopTalk(speakPerson.gbcode); //结束音频
        }
        // sszhsp.controlDuoTalk(speakPerson.gbcode, "CLOSE").then(result => {
        //     // console.log(result);
        //     // if(result.code != 0) {
        //     //     notification.warn({
        //     //         title: "通知",
        //     //         message: "结束语音失败"
        //     //     });
        //     // }
        // });
        // sszh.sszhyyhtml = '';
        // speakPerson = {}; //清空语音对话保存数据
        // return;
        if (code === 0) {
            sszh.sszhyyhtml = '';
            speakPerson = {}; //清空语音对话保存数据
            sszhsp.sszhsptalkcontrol = false;
            // 先移除 sszhyytoggle 的监听，防止触发两次 closesszhhyyth 方法
            unwatch();
            sszhyyth.sszhyytoggle = false;
            // 重新添加 sszhyytoggle 的监听
            unwatch = watchSszhyyToggle();
        } else {
            notification.error({
                title: getLan().notification,
                message: "结束语音失败"
            });
        }

    },
    slience: function () {
        let code = sszhsp.slient(speakPerson.gbcode);
        this.slienceText = code === 1 ? '静音' : '开启';
    },
});
// 监控sszhyytoggle属性，改变语音对讲z-index
function watchSszhyyToggle() {
    return sszhyyth.$watch('sszhyytoggle', function (a) {
        if (a) {
            // 若在视频通话弹窗打开语音通话，则语音通话弹窗不显示
            if(sszhsp.switchStatus && sszhsp.switchValue) return;
            $('.sszhyyth').css({
                'z-index': dargObject.getMaxIndex() + 1
            });
        } else {
            $('.sszhyyth').css({
                'z-index': -1
            });
            sszhsp.switchLoading = false;
            sszhsp.switchValue = false;
            clearInterval(talkLoadingTimer);
            sszhyyth.loadingFlash = '';
            sszhyyth.closesszhhyyth();
        }
    });
}
var unwatch = watchSszhyyToggle();

//录制视频vm
let sszhlzsp = avalon.define({
    $id: 'sszhlzsp',
    dev: '',
    gbcode: '',
    sszhlzsptoggle: false,
    checkedone: true,
    checkedtwo: false,
    checkedthere: false,
    lzsch: '',
    lzscm: '',
    lzscs: '',
    handleChange(e) {
        if (e.target.value == '1') {
            this.checkedone = true;
            this.checkedtwo = false;
            this.checkedthere = false;
        } else if (e.target.value == '2') {
            this.checkedone = false;
            this.checkedtwo = true;
            this.checkedthere = false;
        } else {
            this.checkedone = false;
            this.checkedtwo = false;
            this.checkedthere = true;
        }
    },
    sszhlzspsure() {
        let pData = {};
        if (this.checkedone) {
            pData.time = '15fenzhong';
            pData.dev = this.gbcode;
        } else if (this.checkedtwo) {
            pData.time = '30';
            pData.dev = this.gbcode;
        } else if (this.checkedthere) {
            pData.time = 3600 * this.lzsch + 60 * this.lzscm + this.lzscs;
            pData.dev = this.gbcode;
            if (pData.time === '0') {
                notification.warn({
                    title: getLan().notification,
                    message: "请设置时间"
                });
                return;
            }
        }
        ajax({

        }).then(result => {

        })
    },
    sszhlzspcancel: function () {
        this.sszhlzsptoggle = false;
    }
});
//消息下发
let sbxxxf = avalon.define({
    $id: 'sbxxxf',
    messagecontent: '',
    dev: '',
    gbcode: '',
    showsbxxxf: false,
    sentmessage() {

    },
    closesbxxxf() {
        this.showsbxxxf = false;
    }
});

avalon.filters.filterByState = function (str) {
    if (str == 1) {
        return getLan().unChecked;
    } else {
        return getLan().checked;
    }
}
//告警信息vm
let sszhgjxxManage = avalon.define({
    $id: 'sszhgjxxManage',
    gjxxlist: [],
    gotogj(item) {
        if (item.state == 0) {
            return;
        }
        let obj = {};
        item.state = 0; //变为已处理
        obj.time = item.time;
        obj.sosPerson = item.userName + '(' + item.userCode + ')';
        obj.gbcode = item.gbcode;
        obj.isRealTimeView = true;
        item.userCode ? obj.userCode = item.userCode : '-';
        item.userName ? obj.userName = item.userName : '-';
        obj.sosId = item.sosId;
        obj.isGjgl = false;
        obj.handleStatus = 'WAITING';
        var data = JSON.stringify(obj);
        sessionStorage.setItem('sszhxt-gjglcontrol', data);
        var baseUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
        window.location.href = baseUrl + "/sszhxt-gjglcontrol";
    }
});



//地图信息窗口的vm
let sszhinfowindow = avalon.define({
    $id: "mapinfowindow",
    playVideo: function (gbcode, username, usercode, signal, name, mytype, devArr) { //实时点流
        sszhsp.params = {
            gbcode,
            username,
            usercode,
            signal,
            mytype
        };
        if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
            vm.tipText = getLan().needPlug;
            vm.showtip = true;
            vm.downloadTipShow = true;
            return;
        }
        //不显示工具
        if (mytype != 0) {
            sszhsp.isShowTools = true;
            sszhsp.gbcodeArr = devArr;
            $(".sszhspth").css({
                'z-index': dargObject.getMaxIndex() + 1,
                'width': 1050,
                'height': 560
            });
        } else {
            sszhsp.isShowTools = false;
            $(".sszhspth").css({
                'z-index': dargObject.getMaxIndex() + 1,
                'width': 810,
                'height': 560
            });
        }
        $('#npGSVideoPlugin').css({
            'z-index': 999
        });
        if (sszhsp.gbcode == gbcode && 0 != player.getStatusByIndex(-1)) {
            //表示当前视频窗口是同一个设备，多通道也是一样，并且在播放了
            avalon.each(sszhmap.devhtmllist, function (index, item) {
                if (item.gbcode == sszhsp.gbcode) {
                    item.show = false;
                }
            })
            sszhsp.showsszhspth = true;
            return;
        }

        if (sszhsp.gbcode == gbcode && 0 == player.getStatusByIndex(-1)) {
            //表示当前视频窗口是同一个人，只需要重新点流就好,出现场景是从左侧栏点击定位到地图，并且窗口空闲，然后又在地图点击视频呼叫
            //执法仪
            if (mytype == 0) {
                sszhsp.playVideo(gbcode, name);
                sszhsp.showToolBtn = false;
            } else {
                //多通道的,默认点开第一个通道
                sszhsp.playVideo(sszhsp.childGbcode, name);
            }

            avalon.each(sszhmap.devhtmllist, function (index, item) {
                if (item.gbcode == sszhsp.gbcode) {
                    item.show = false;
                }
            })
            sszhsp.showsszhspth = true;
            return;
        }

        if (sszhsp.showsszhspth) {
            if (0 != player.getStatusByIndex(-1)) {
                //表示ocx已经被占用了,并且是其他人要占用视频播放窗口了，先关闭视频点流，将视频点流的人显示在左侧，在将当前设备点流，播放在ocx
                sszhsp.hidesszhspth();
            } else {
                //ocx空就删掉对应的
                for (var i = 0; i < sszhmap.devhtmllist.length; i++) {
                    let item = sszhmap.devhtmllist[i];
                    if (sszhsp.gbcode == item.gbcode) {
                        sszhmap.devhtmllist.splice(i, 1);
                        break;
                    }
                }
            }
        }
        //在左侧栏中找到了这个人，说明他在视频中，并且这个窗口播放过其他人
        let flag = false;
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            if (item.gbcode == gbcode) {
                flag = true;
                item.show = false;
                sszhsp.playVideo(item.childGbcode, name); //因为点流放回太慢，不用回调了
                sszhsp.gbcode = item.gbcode;
                sszhsp.signal = item.signal;
                sszhsp.mytype = item.mytype;
                sszhsp.showsszhspth = true;
                sszhsp.showToolBtn = item.showToolBtn;
                //多通道只显示设备名称
                if (mytype != 0) {
                    sszhsp.name = item.name;
                } else {
                    if (languageSelect == "zhcn") {
                        if (!username) {
                            sszhsp.name = "与" + name + "视频通话中";
                        } else {
                            sszhsp.name = "与" + username + '(' + usercode + ')' + "视频通话中";
                        }
                    } else {
                        if (!username) {
                            sszhsp.name = "Talking to " + name;
                        } else {
                            sszhsp.name = "Talking to " + username + '(' + usercode + ')';
                        }
                    }
                }
                sszhsp.deviceName = item.name;

                if (mytype == 1) {
                    sszhsp.deviceType = '快速布控设备';
                } else if (mytype == 2) {
                    sszhsp.deviceType = "车载移动执法设备";
                } else {
                    sszhsp.deviceType = "警用无人机";
                }
                return; //这里只会return回去这个function
            }

        })

        // let code = sszhsp.playVideo(gbcode,dev,function (code) {
        if (mytype == 0) {
            //说明这个人没有被视频，
            sszhsp.playVideo(gbcode, name); //因为点流放回太慢，不用回调了
        } else {
            sszhsp.playVideo(devArr[0].gbcode, name); //因为点流放回太慢，不用回调了
        }

        //if(code!=0)return;
        sszhsp.showsszhspth = true;
        //Firefox中ocx不能隐藏，初始设置他的宽高是1px
        // $(".sszhspth").css({
        //     'width': 700,
        //     'height': 500,
        //     'z-index': 9999
        // });
        sszhsp.gbcode = gbcode;
        sszhsp.signal = signal;
        sszhsp.mytype = mytype;
        if (mytype != 0) {
            sszhsp.isShowTools = true;
            sszhsp.gbcodeArr = devArr;
            $(".sszhspth").css({
                'z-index': dargObject.getMaxIndex() + 1,
                'width': 1050,
                'height': 560
            });
        } else {
            sszhsp.isShowTools = false;
            $(".sszhspth").css({
                'z-index': dargObject.getMaxIndex() + 1,
                'width': 810,
                'height': 560
            });
        }
        $('#npGSVideoPlugin').css({
            'z-index': 999
        });
        if (flag) {
            return;
        }
        //视频计时
        let obj = {};
        obj.gbcode = gbcode;

        if (mytype == 0) {
            obj.childGbcode = gbcode;
        } else {
            obj.childGbcode = devArr[0].gbcode;
            // if (devArr[0].PTZControllable == 1) {
            if (devArr[0].mytype != 0) {
                sszhsp.showToolBtn = true;
            } else {
                sszhsp.showToolBtn = false;
            }
            sszhsp.checkItem = devArr[0].gbcode;
        }
        obj.devArr = devArr;
        obj.username = username;
        obj.usercode = usercode;
        obj.show = false; //左侧栏的显示
        obj.oldTime = new Date(); //视频计时
        obj.time = '00:00:00';
        obj.signal = signal;
        obj.mytype = mytype;
        obj.name = name;
        //let timeobj = setInterval("countspTime('"+dev+"')", 10000);
        let timeobj = setInterval(function () {
            countspTime(sszhsp.gbcode);
        }, 1000);
        obj.timeobj = timeobj;
        if (mytype != 0) {
            sszhsp.name = name;
            sszhsp.deviceName = name;
            if (languageSelect == "zhcn")
                obj.showName = "与" + name + "视频通话中";
            else
                obj.showName = "Talking to " + name;

            if (mytype == 1) {
                sszhsp.deviceType = '快速布控设备';
            } else if (mytype == 2) {
                sszhsp.deviceType = "车载移动执法设备";
            } else {
                sszhsp.deviceType = "警用无人机";
            }

        } else {
            if (languageSelect == "zhcn") {
                if (!username) {
                    sszhsp.name = "与" + name + "视频通话中";
                    obj.showName = "与" + name + "视频通话中";
                } else {
                    sszhsp.name = "与" + username + '(' + usercode + ')' + "视频通话中";
                    obj.showName = "与" + username + '(' + usercode + ')' + "视频通话中";
                }
            } else {
                if (!username) {
                    sszhsp.name = "Talking to " + name;
                    obj.showName = "Talking to " + name;
                } else {
                    sszhsp.name = "Talking to " + username + '(' + usercode + ')';
                    obj.showName = "Talking to " + username + '(' + usercode + ')';
                }
            }

        }
        sszhmap.devhtmllist.push(obj);
        //});
        Gm_tool.ToggleSosBg();


    },
    startTalk: function (gbcode, username, usercode, signal, mytype) { //语音对讲
        if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
            vm.tipText = getLan().needPlug;
            vm.showtip = true;
            vm.downloadTipShow = true;
            sszhsp.switchLoading = false;
            sszhsp.switchValue = false;
            return;
        }
        if (sszhyyth.sszhyytoggle) {
            notification.info({
                title: getLan().notification,
                message: '语音通话中，请先挂断！'
            });
            sszhsp.switchLoading = false;
            sszhsp.switchValue = false;
            return;
        }
        if (speakPerson.gbcode && (speakPerson.gbcode === gbcode)) {
            notification.info({
                title: getLan().notification,
                message: getLan().called
            });
            sszhsp.switchLoading = false;
            sszhsp.switchValue = false;
            return;
        }
        sszhyyth.sszhyytoggle = true;
        sszhyyth.loadingFlash = '';
        sszhyyth.sszhthjy = '设备连接中';
        if (sszhyyth.countsszhythtimeObject) clearInterval(sszhyyth.countsszhythtimeObject); // 清除语计时器
        if (talkLoadingTimer) clearInterval(talkLoadingTimer);
        talkLoadingTimer = setInterval(() => {
            if (sszhyyth.loadingFlash.length > 2) {
                sszhyyth.loadingFlash = '';
            }
            sszhyyth.loadingFlash += '.';
        }, 300);
        // let mapIframe = $('#mapIframe')[0].contentWindow;
        // mapIframe.postMessage(gbcode, '*');
        sszhsp.starttalk(gbcode, true, function (code) {
            clearInterval(talkLoadingTimer);
            sszhyyth.loadingFlash = '';
            if (code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().callF
                });
                sszhyyth.sszhyytoggle = false;
                return;
            };
            let obj = {};
            if (!username) {
                username = '-';
            }
            if (!usercode) {
                usercode = '-';
            }
            sszhsp.switchLoading = false;
            obj.gbcode = gbcode;
            obj.username = username;
            obj.usercode = usercode;
            obj.signal = signal;
            obj.mytype = mytype;
            if (languageSelect == "zhcn")
                obj.showName = "与" + username + '(' + usercode + ')' + "语音通话中";
            else
                obj.showName = "Talking to " + username + '(' + usercode + ')';
            sszhyyth.sszhyytoggle = true;
            sszhyyth.countTime(); //语音计时
            speakPerson.gbcode = gbcode;
            if (languageSelect == "zhcn")
                sszhyyth.sszhthjy = username + '(' + usercode + ')';
            else
                sszhyyth.sszhthjy = username + '(' + usercode + ')';
            sszhmap.sszhyyhtml.push(obj);
            sszhyyth.mytype = mytype;
        });
        // // 多通道语音对讲
        // sszhsp.srartTalkByDuo(gbcode, true, function (code) {
        //     if (code != 0) {
        //         notification.error({
        //             title: getLan().notification,
        //             message: getLan().callF
        //         });
        //         return;
        //     };
        //     let obj = {};
        //     if (!username) {
        //         username = '-';
        //     }
        //     if (!usercode) {
        //         usercode = '-';
        //     }
        //     obj.gbcode = gbcode;
        //     obj.username = username;
        //     obj.usercode = usercode;
        //     obj.signal = signal;
        //     obj.mytype = mytype;
        //     if (languageSelect == "zhcn")
        //         obj.showName = "与" + username + '(' + usercode + ')' + "语音通话中";
        //     else
        //         obj.showName = "Talking to " + username + '(' + usercode + ')';
        //     sszhyyth.sszhyytoggle = true;
        //     sszhyyth.countTime(); //语音计时
        //     speakPerson.gbcode = gbcode;
        //     if (languageSelect == "zhcn")
        //         sszhyyth.sszhthjy = username + '(' + usercode + ')';
        //     else
        //         sszhyyth.sszhthjy = username + '(' + usercode + ')';
        //     sszhmap.sszhyyhtml.push(obj);
        //     sszhyyth.mytype = mytype;
        // });
    },
    startRecord: function (gbcode) { //视频录制
        sszhlzsp.sszhlzsptoggle = true;
        sszhlzsp.gbcode = gbcode;
    },
    sentmessage: function (gbcode) { //消息下发
        sbxxxf.showsbxxxf = true;
        sbxxxf.gbcode = gbcode;
    },
    lock: function (gbcode, lock, callback) { //远程锁定
        let data = {};
        let optCmd;
        if (lock) {
            optCmd = 'Lock';
        } else {
            optCmd = 'Unlock';
        }
        ajax({
            url: '/gmvcs/uom/device/dsj/control/lock?deviceId=' + gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().operationF
                });
                $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                return;
            }
            if (lock) {
                // if (mapType == 0) {
                //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, '正在锁定', true);
                //     setTimeout(function () {
                //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, '已锁定', false);
                //         $('#mapIframe')[0].contentWindow.disableOrActiveButton(true);
                //         $('#mapIframe')[0].contentWindow.settleData(gbcode, false, true);
                //         changeTreeImg(gbcode, true);
                //     }, 500);
                // } else {
                notification.success({
                    title: getLan().notification,
                    message: '锁定成功'
                });
                $('#mapIframe')[0].contentWindow.disableOrActiveButton(true);
                $('#mapIframe')[0].contentWindow.settleData(gbcode, false, true);
                changeTreeImg(gbcode, true);
                // }


            } else {
                // if (mapType == 0) {
                //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, '正在解锁', true);
                //     setTimeout(function () {
                //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, '已解锁', false);
                //         $('#mapIframe')[0].contentWindow.disableOrActiveButton(false);
                //         $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                //         changeTreeImg(gbcode, false);
                //     }, 500);
                // } else {
                notification.success({
                    title: getLan().notification,
                    message: '解锁成功'
                });
                $('#mapIframe')[0].contentWindow.disableOrActiveButton(false);
                $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                changeTreeImg(gbcode, false);
                // }


            }
            // if (mapType == 0) {
            //     setTimeout(function () {
            //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
            //     }, 1000);
            // }

            callback && callback();
        });

    },
    photograph: function (gbcode) { //远程拍照
        let data = {};
        ajax({
            url: '/gmvcs/uom/device/dsj/control/photo?deviceId=' + gbcode,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: '拍照指令下发失败'
                });
                return;
            }
            // if (mapType == 0) {
            //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, '拍照指令已下发', false);
            //     setTimeout(function () {
            //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
            //     }, 1000)
            // } else {
            notification.success({
                title: getLan().notification,
                message: '拍照指令已下发'
            });
            // }
        });
    },
    record: function (gbcode, record) {
        let data = {};
        let optCmd;
        if (record) {
            optCmd = 'Start';
        } else {
            optCmd = 'Stop';
        }

        ajax({
            url: '/gmvcs/uom/device/dsj/control/record?deviceId=' + gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().operationF
                });
                return;
            }
            if (record) {
                // if (mapType == 0) {
                //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                //     $('#mapIframe')[0].contentWindow.changeSpanCss(false);
                //     $('#mapIframe')[0].contentWindow.settleData(gbcode, true, false);
                //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().startVideoS, false);
                // } else {
                $('#mapIframe')[0].contentWindow.changeSpanCss(false);
                $('#mapIframe')[0].contentWindow.settleData(gbcode, true, false);
                notification.success({
                    title: getLan().notification,
                    message: getLan().startVideoS
                });
                // }

            } else {
                // if (mapType == 0) {
                //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                //     $('#mapIframe')[0].contentWindow.changeSpanCss(true);
                //     $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                //     $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().stopVideoS, false);
                // } else {
                $('#mapIframe')[0].contentWindow.changeSpanCss(true);
                $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                notification.success({
                    title: getLan().notification,
                    message: getLan().stopVideoS
                });
                // }


            }
            // if (mapType == 0) {
            //     setTimeout(function () {
            //         $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
            //     }, 1000)
            // }
        });

    },
    controlMarkerArr: controlMarkerArr
});

// 布控范围
const bkfwVm = avalon.define({
    $id: 'sszh-bkfw-vm',
    show: false,
    bkfwTitle: '布控范围',
    isMove: false,
    $form: createForm(),
    sliderWidth: 348,
    imgClientx: 0, //鼠标按下的位置
    imgMoveX: 0, //图标移动的距离
    imgStartx: 0, //图标开始的left值
    splitWidth: 69.5,
    rangeRadius: 0, // 范围
    radius: 0, // 传给后台的半径范围 单位：m
    maxRadius: 5, // 单位为 km
    maxSplit: 5,
    rangeList: [1, 2, 3, 4, 5],
    pointerMouseDown(e) { // 滑块点击
        let _this = this;
        this.imgClientx = e.clientX;
        this.imgStartx = this.imgMoveX;

        $('.slider-pointer').removeClass('animation-for-slider');
        $('body').on("mousemove", function (event) {
            _this.moveEvent(event);
        });

        $(document).on("mouseup mouseleave", function (event) {
            $('body').off("mousemove");
            event.stopPropagation();
        });
    },
    sliderClick(e) { // 滑条点击
        let bounding = $('.slider-pointer')[0].getBoundingClientRect();
        this.imgClientx = bounding.x || bounding.left;
        this.imgStartx = this.imgMoveX;
        $('.slider-pointer').addClass('animation-for-slider');
        this.moveEvent(e);
    },
    moveEvent(event) { // 滑块滑动
        let x;
        if (event.pageX - this.imgClientx >= 0) {
            x = this.imgStartx + event.pageX - this.imgClientx;
            if (x >= this.sliderWidth) {
                this.imgMoveX = this.sliderWidth;
                this.setVal();
                return;
            }
            this.imgMoveX = x;
        } else {
            x = this.imgStartx - Math.abs(event.pageX - this.imgClientx);
            if (x <= 0) {
                this.imgMoveX = 0;
                this.setVal();
                return;
            }
            this.imgMoveX = x;
        }
        this.setVal();
    },
    rangItemClick(index) { // 范围点击
        this.rangeRadius = ((index + 1) * (this.maxRadius / this.maxSplit)).toFixed(1);
        this.rangeRadiusChange();
    },
    setVal() { // 设置输入框val
        this.rangeRadius = (this.maxRadius * this.imgMoveX / this.sliderWidth).toFixed(1);
    },
    rangeRadiusChange() { // 输入框值改变事件
        $('.slider-pointer').addClass('animation-for-slider');
        this.imgMoveX = (Number(this.rangeRadius) * this.sliderWidth / this.maxRadius);
        this.imgMoveX = this.imgMoveX >= this.sliderWidth ? this.sliderWidth : this.imgMoveX;
    },
    getRadius() { // 获取布控范围
        let url = '/gmvcs/instruct/car/monitoring/get/personality/configuration';
        return ajax({
            url: url,
            method: "GET",
            data: null
        }).then((res) => {
            if (res.code == 0 && res.data) {
                this.radius = res.data.monitoringDistance;
                this.rangeRadius = (res.data.monitoringDistance / 1000).toFixed(1);
                this.rangeRadiusChange();
            }
        });
    },
    handleOk() {
        let url = '/gmvcs/instruct/car/monitoring/save/personality/configuration';
        let data = {
            "monitoringDistance": this.rangeRadius * 1000,
            "uid": storage.getItem('uid')
        };
        ajax({
            url: url,
            method: "POST",
            data: data
        }).then(res => {
            if (res.code == 0) {
                this.radius = this.rangeRadius * 1000; // 布控范围半径 单位：m
                notification.success({
                    title: getLan().notification,
                    message: '布控范围保存成功！'
                });
                this.show = false;
            } else {
                notification.error({
                    title: getLan().notification,
                    message: '布控范围保存失败！'
                });
            }
        });
    },
    handleCancel() {
        this.show = false;
    }
});

bkfwVm.getRadius(); // 页面载入时先获取布控范围

bkfwVm.$watch('show', (v) => {
    if (v) {
        bkfwVm.getRadius();
        setTimeout(() => {
            bkfwVm.sliderWidth = $('.tool-slider')[0].clientWidth;
            bkfwVm.splitWidth = bkfwVm.sliderWidth / bkfwVm.maxSplit;
        }, 200);
        $('body')[0].onselectstart = function () {
            return false;
        };
    } else {
        $('body')[0].onselectstart = function () {
            return null;
        };
    }
});

bkfwVm.$watch('radius', (v) => {
    let currentValue = store.getState();
    if (currentValue.siderMenuSelectedKey == 'rlbk' || currentValue.siderMenuSelectedKey == 'rzhy') {
        sszhrlbk_vm.bk();
    }
    if (currentValue.siderMenuSelectedKey == 'cpbk') {
        cpbk.executeControl();
    }
});

// bkfwVm.$watch('rangeRadius', (v) => {
//     bkfwVm.radius = bkfwVm.rangeRadius * 1000
// });

//视频计时函数
function countspTime(gbcode) {
    avalon.each(sszhmap.devhtmllist, function (index, item) {
        if (item.gbcode == gbcode) {
            let h, m, s;
            let nowTime = new Date();
            let timecount = (nowTime - item.oldTime) / 1000;
            h = parseInt(timecount / 3600);
            m = parseInt(timecount % 3600 / 60);
            s = parseInt(timecount % 3600 % 60);
            if (h < 10) {
                h = '0' + h;
            }
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            item.time = h + ':' + m + ':' + s;
        }
        if (item.gbcode === sszhsp.gbcode) {
            sszhsp.sszhspthtime = item.time; //将时间赋给视频窗口时间
            return;
        }
    });
}

// 弹窗-人员类型库设置
let rylxksz = avalon.define({
    $id: 'doc-dialog-rylxksz-bar',
    title: '人员类型库设置',
    checkedAll: false,
    threshold: 82,
    personlistAll: [],
    checkboxStyle: {
        cursor: 'pointer',
        fontSize: '16px'
    },
    checkStyle: {
        color: '#536b82'
    },
    uncheckStyle: {
        color: '#536b82'
    },
    selectedAll() {
        this.checkedAll = !this.checkedAll;
        avalon.each(this.personlistAll, (i, el) => {
            el.enable = this.checkedAll;
        });
    },
    selectedOne(config, index) {
        this.personlistAll[index].enable = !this.personlistAll[index].enable;
        let flab = true;
        if (this.personlistAll[index].enable) {
            for (let i = 0; i < this.personlistAll.length; i++) {
                if (!this.personlistAll[i].enable) {
                    flab = false;
                    break;
                }
            }
            if (flab) {
                this.checkedAll = true;
            }
        } else {
            this.checkedAll = false;
        }
    },
    handleChange(config) {
        if (config.value == 'ALL') {
            this.checkedAll = config.checked;
            avalon.each(this.personlistAll, (i, el) => {
                el.enable = config.checked;
            });
        } else {
            this.personlistAll[config.index].enable = config.checked;
            let flab = true;
            if (config.checked) {
                for (let i = 0; i < this.personlistAll.length; i++) {
                    if (!this.personlistAll[i].enable) {
                        flab = false;
                        break;
                    }
                }
                if (flab) {
                    this.checkedAll = true;
                }
            } else {
                this.checkedAll = false;
            }
        }
    },
});


//===============================ocx初始化部分========================================
function initOcx() {
    player = new Gxxplayer();
    ocxele = document.getElementById("npGSVideoPlugin");

    if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
        vm.tipText = getLan().needPlug;
        vm.showtip = true;
        vm.downloadTipShow = true;
        return;
    }
    // 初始化播放器
    player.init({
        'element': 'npGSVideoPlugin',
        'model': 1,
        'ocxID': `RealTimeView_${new Date().getTime()}_${Math.floor(Math.random() * 10000)}`,
        'proxy': _onOcxEventProxy
    });
    let version = player.getVersion();
    if (compareString(gxxOcxVersion, version)) {
        if (languageSelect == "zhcn")
            vm.tipText = '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
        else
            vm.tipText = 'Your GXX player plugin version is ' + version + ' and the latest version is ' + gxxOcxVersion + '. Please download the latest version.';
        vm.showtip = false;
        vm.downloadTipShow = true;
        return;
    }
    // 分屏为1列4行
    //player.splitWnd(4, 4, 1);

    // 关闭、刷新浏览器结束语音
    let stopTalkHandle = function () {
        //结束音频
        if (starttalkType) {
            player.stopTSTalk(speakPerson.gbcode);
        } else {
            player.stopTalk(speakPerson.gbcode);
        }
    }
    window.οnbefοreunlοad = function (e) {
        stopTalkHandle();
    }
    $(window).unload(function () {
        stopTalkHandle();
    });
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
    let ret = eval('(' + data + ')'); //每次操作acx都会回调这里，如点击关闭窗口回调此处，放回值如下
    //表示截图
    if (ret.action == "CapturePicture") {
        if (ret.code == 0) {
            notification.success({
                title: getLan().notification,
                message: getLan().screenshotS + ret.data.picPath
            });
        } else {
            notification.error({
                title: getLan().notification,
                message: getLan().screenshotF + ret.code
            });
        }
    } else if (ret.action == "StartLocalRecord") {
        if (ret.code == 0) {
            notification.success({
                title: getLan().notification,
                message: getLan().videoS + ret.data.szLocalRecordPath
            });
        } else {
            notification.error({
                title: getLan().notification,
                message: getLan().videoF + ret.code
            });
        }
    } else if (ret.action == "TSStopTalk") { // 10s自动结束多通道语音对讲回调
        if (ret.code == 0) {
            sszhyyth.closesszhhyyth();
        }
    } else if (ret.action == "StopTalk") { // 10s自动结束多通道语音对讲回调
        if (ret.code == 0) {
            sszhyyth.closesszhhyyth();
        }
    } else if (ret.action == "TSTalk_NetException") { // TS 断流回调
        player.stopTSTalk(speakPerson.gbcode);
    } else if (ret.action == 'SSInvalid') { // 流媒体服务网络中断超时
        let code = player.logoffBeSSInvalid(ret.data.nSSIndex);
        if (0 === code) {
            if (reloginTime > 2) {
                reloginTime = 0;
                notification.warn({
                    title: getLan().notification,
                    message: getLan().mediaTimeout + ret.code + '，请重试'
                });
            } else {
                reloginTime++;
                let cd = player.login(sszhsp.server);
                if (cd != 0) {
                    notification.error({
                        title: getLan().notification,
                        message: getLan().mediaLoginF + cd
                    });
                    return;
                }
                code = player.playRec(sszhsp.server); //实时点流
                if (code == -2) { //表示登录失败
                    notification.error({
                        title: getLan().notification,
                        message: getLan().loginF
                    });
                    return;
                }
            }
        }
    }
    // //{"action":"StopVideo","code":0,"data":{"nIndex":1,"szNodeID":"35000...1668//设备编号"},"ocxID":"realtime_player"}
    // if(ret.action == "SelDisp"){
    //     if(ret.data.szNodeID == undefined || ret.data.szNodeID == null||ret.data.szNodeID ===""){
    //         return;
    //     }
    //     searchNode(ret.data.szNodeID);//点击ocx,部门树定位警员
    // }
}
// //=====================================sos告警===========================
// var error_total = 0;
// const websocketIP = 'ws://'+ webSocketIp;
// const socket = io(websocketIP, {
//     transports: ['polling']
// });
//
// socket.on('connect', (connect) => {
//     //获取当前登录用户的部门path
//     ajax({
//         url :'/gmvcs/uap/cas/loginUser',
//         method : 'get',
//         data : null
//     }).then( result => {
//         if (result.code != 0) {
//             notification.warn({
//                 title: getLan().notification,
//                 message: "获取用户部门信息失败"
//             });
//             return;
//         }
//         longinPersonOrgpath = result.data.orgPath;
//         longinPersonUid = result.data.uid;
//         socket.emit('uidEvent', {
//             'uid': longinPersonUid
//         });
//     });
//
//    //console.log(socket);
//
// });
//
// // socket.on('CAN', (ret) => {
// //     console.log("CAN:", ret);
// //     //      setTimeout(function() {
// //     socket.emit('TOKEN', {
// //         'token': storage.getItem('token')
// //     });
// //     //      }, 500);
// //
// // });
//
// socket.on('messageevent', (ret) => {
//     if( !new RegExp(longinPersonOrgpath).test(ret.orgPath)){
//         return;//不在管辖部门，不显示
//     }
//     let pData = {
//         'devices' : [ret.deviceId],
//         'deviceType': "DSJ"
//     };
//     ajax({
//         url: '/gmvcs/instruct/mapcommand/devicegps',
//         method: 'post',
//         data: pData
//     }).then(result => {
//         let obj = {};
//         if (result.code != 0) {
//             obj.longitude = '经度:-';
//             obj.latitude = '纬度:-';
//         }
//         if(!result.data[ret.deviceId]){
//             obj.longitude = '经度:-';
//             obj.latitude = '纬度:-';
//         }else{
//             obj.longitude = '经度:'+result.data[ret.deviceId].longitude;
//             obj.latitude = '纬度:'+result.data[ret.deviceId].latitude;
//         }
//         if(ret.sosType =='SOS'){
//             obj.type ="SOS告警";
//         }
//         sszhmap.toggleshow();
//         obj.person = ret.userName + '记录仪';
//         obj.gbcode = ret.deviceId;
//         obj.userName = ret.userName;
//         obj.time = ret.sosDate;
//         obj.state = 1;
//         obj.sosId = ret.sosId;
//         // obj.longitude = ret.longitude;
//         // obj.latitude = ret.latitude;
//         obj.userCode = ret.userCode;
//         sszhgjxxManage.gjxxlist.push(obj);
//     })
//
//
// });
//
// socket.on('STATUS', (ret) => {
//     // if(ret.closed == "true") {
//     //     socket.close();
//     // }
// });
//
// socket.on('error', (error) => {
//     socket.close();
// });
// socket.on('reconnecting', (error) => {
//    //console.log(error);
// });
// socket.on('connect_error', (error) => {
//     error_total++;
//     if(error_total > 9) {
//         error_total = 0;
//         socket.close();
//        // console.log("=====重连次数超出限制，已断开socket连接=====");
//     }
// });
//
// socket.on('connect_timeout', (timeout) => {
//    // console.log("connect_timeout:", timeout);
// });
//===============================自定义拖动=============================
let dargObject = {
    a: '',
    b: '',
    c: '',
    w: '',
    h: '',
    move: function (o, e, w, h) {
        this.a = o;
        this.w = w;
        this.h = h;
        document.all ? this.a.setCapture() : window.captureEvents(Event.MOUSEMOVE);
        this.b = e.clientX - parseInt(this.a.style.left);
        this.c = e.clientY - parseInt(this.a.style.top);
        if (o.style.zIndex < this.getMaxIndex()) {
            o.style.zIndex = this.getMaxIndex() + 1;
        }
    },
    getMaxIndex: function () {
        let sszhyyth = parseInt(document.getElementById('sszhyyth').style.zIndex)
        let sszhlzsp = parseInt(document.getElementById('sszhlzsp').style.zIndex)
        let sszhspth = parseInt(document.getElementById('sszhspth').style.zIndex)
        let sszhrlbk = parseInt(document.getElementById('sszhrlbk').style.zIndex)
        let sszhcpbk = parseInt(document.getElementById('sszhcpbk').style.zIndex)
        return Math.max.apply(null, [sszhyyth, sszhlzsp, sszhspth, sszhrlbk, sszhcpbk])
        // if (sszhyyth.style.zIndex > sszhlzsp.style.zIndex) {
        //     index = sszhyyth.style.zIndex
        // } else {
        //     index = sszhlzsp.style.zIndex
        // }
        // return parseInt(index);

    },
};
let sosDom = $('.sos-info');
document.onmouseup = function () {
    if (!dargObject.a) return;
    document.all ? dargObject.a.releaseCapture() : window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    dargObject.a = "";
};
document.onmousemove = function (d) {
    if (!dargObject.a) return;
    if (!d) d = event;
    if (d.clientX - dargObject.b < 0) { //控制左边界消失
        dargObject.a.style.left = '0px';
    } else if (d.clientX - dargObject.b + dargObject.w > $('.sszh-map').width()) { //控制右边界消失
        dargObject.a.style.left = ($('.sszh-map').width() - dargObject.w) + "px";
    } else {
        dargObject.a.style.left = (d.clientX - dargObject.b) + "px";
    }
    if (d.clientY - dargObject.c < 0) { //控制上边界消失
        dargObject.a.style.top = '0px';
    } else if (d.clientY - dargObject.c + dargObject.h > $('.sszh-map').height()) {
        dargObject.a.style.top = ($('.sszh-map').height() - dargObject.h) + "px"; //控制下边界消失
    } else {
        dargObject.a.style.top = (d.clientY - dargObject.c) + "px";
    }

    Gm_tool.ToggleSosBg();
};

function getLan() {
    return language_txt.sszhxt.sszhxt_sszh;
}

function getLanFace() {
    return language_txt.sszhxt.sszhxt_znsb;
}
Array.prototype.in_array = function (e) {
    var r = new RegExp(',' + e + ',');
    return (r.test(',' + this.join(this.S) + ','));
};

function getFaceURL() {
    let url = '/gmvcs/uap/person/type/person/recognition/url';
    ajax({
        url: url,
        method: "get"
    }).then(res => {
        if (res.code == 0) {
            faceURL = res.data; //http://10.10.18.88:8080/FaceFinder/facefinder/index.action"
        } else {
            notification.error({
                title: getLan().notification,
                message: '获取人脸库地址失败'
            });
        }
    });
}