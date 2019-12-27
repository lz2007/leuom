// 公共引用部分，兼容IE8
import '/apps/common/common';
import '/apps/common/common-index';
import './sszhxt.css';
import 'ane';
import {
    notification
} from 'ane';
import * as menuService from '../../services/menuService';
import {
    copyRight,
    telephone,
    defalutCity
} from '/services/configService';
import '/services/filterService';
import ajax from '../../services/ajaxService';
import * as cityobj from '../../apps/common/common-sszhmap-cityaddress';
import {
    webSocketIp,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
import io from 'socket.io-client';
let {
    routerserver
} = require('/services/routerService');
require('/apps/common/common-layout/common-layout.js');
// require('../../apps/common/common-poll-sidebar');
require('../../apps/common/common-sszh-sidebar');
require('../../apps/common/common-sszh-new-sidebar/common-sszh-new-sidebar');
require("../../apps/common/common-sszh-mapcity.js");
require("../../apps/common/common-map-toolbar");

import {RenderMapPopupHtml} from '/apps/common/common-dialogs/common-dialogs-map-popup'

import { Gm } from '/apps/common/common-tools';
function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();

let storage = require('../../services/storageService').ret;

let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');
let frameWindow;
if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
    storage.clearAll();
    global.location.href = '/main-login.html';
}

var root = avalon.define({
    $id: 'sszhxt_vm',
    currentPage: '',
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: '',
    roleShow: false,
    copyRight: copyRight,
    telephone: telephone,
    locationKey: window.location.hash ? window.location.hash.slice(2) : '/sszhxt-sszh',
    menu: get_menu(),
    extra_class: languageSelect == "en" ? true : false,
    sszhxt_language: language_txt.sszhxt.main,
    menuClick(index, item) {
        if (item.url) {
            this.locationKey = item.url;
        }
    },
    toggleChildrenItem(event) {
        $(event.target).find('.ant-menu-item-children') && $(event.target).find('.ant-menu-item-children').toggle();
    },
    $cityDetailobj: {
        cityobj: cityobj
    },

    // sos告警信息菜单切换
    sosMenuType: 'service',
    sosInfoShow: false, //告警信息是否展示
    serviceFaceData: [], // 业务告警人脸布控数据
    serviceCarData: [], // 业务告警车牌布控数据
    serviceCardData: [], // 业务告警人证核验数据
    serviceSOSData: [], //业务告警SOS数据
    deviceSOSData: [], //设备告警数据
    statusSOSData: [], //状态告警数据
    sosMenuClick(val) { // sos告警信息菜单切换
        this.sosMenuType = val;
    },
    sosClick() {
        if (this.sosInfoShow) {
            this.sosInfoShow = false;
        } else {
            this.sosInfoShow = true;
        }
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); // 防止拖动时文字或图片选中
    },
    handelSOS(item) {
        // if (item.status == 1) return;
        root.sosInfoShow = false;
        item.status = 1;
        item.mytype = 0;
        item.deviceId && (item.gbcode = item.deviceId);
       
        setTimeout(() => { // 延时1S执行防止切换标签时关闭了弹窗
            avalon.vmodels['sszhxt_sszh'].handleTreeCheck('', '', item, true);
        }, 2000);

        if(item.monitorType) {
            $('.nav-sszh-' + item.monitorType).trigger('click');
        } else {
            $('.nav-sszh-sszh').trigger('click');
        }
        // if (window.location.hash.replace('#!/', '') == 'sszhxt-sszh') {
        //     avalon.vmodels['sszhxt_sszh'].handleTreeCheck('', '', item, true);
        //     return;
        // }
        // storage.setItem('sszhxt-SOS', item);
        // var baseUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
        // window.location.href = baseUrl + "/sszhxt-sszh";
    },
    // 设备告警点击事件
    handelDeviceSOS(item) {
        // 设备静止告警
        if(item.sosSource === 'DEVICE_MOTIONLESS') {
            this.handelSOS(item);
        }
    },
    clickSosTitle(e) {
        let target = e.target;
        $(target).next().toggle();
    },
    moveY: 0, // top值，移动的大小
    startY: 0, // top按下没移动时的值
    mousedownY: 0, // 鼠标按下的位置
    moveEleHeight: null, // 拖动元素高度
    bodyClientheight: null,
    alarmBarMousedown(e) {
        let _this = this;
        this.mousedownY = e.clientY;
        this.startY = this.moveY;
        this.moveEleHeight = $('#alarmSlider').height(); // 获取滑块高度
        this.bodyClientheight = $('body')[0].clientHeight; // 获取可视去高度

        $('body').on("mousemove", function (event) {
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); // 防止拖动时文字或图片选中
            _this.moveEvent(event);
        });

        $(document).on("mouseup mouseleave", function (event) {
            $('body').off("mousemove");
            event.stopPropagation();
        });
    },
    // 拖动操作
    moveEvent(e) {
        let y;
        let pageY = e.pageY;
        if(pageY - this.mousedownY >= 0) {
            y = this.startY + pageY - this.mousedownY;
            if(y >= this.bodyClientheight - this.moveEleHeight) {
                this.moveY = this.bodyClientheight - this.moveEleHeight;
                return;
            }
            this.moveY = y;
        } else {
            y = this.startY - Math.abs(pageY - this.mousedownY);
            if(y <= 0) {
                this.moveY = 0;
                return;
            }
            this.moveY = y;
        }
    },
    showMessage: showMessage,
    mapPopupWin: RenderMapPopupHtml
});

root.$watch('sosInfoShow', (newVal) => {
    setTimeout(() => {
        Gm_tool.ToggleSosBg();
    }, 200)
});

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;
    if (sysList.length == 0) {
        if (languageSelect == "en") {
            document.title = "MVMS";
            root.titleName = "MVMS";
        } else {
            document.title = "执法视音频实时应用系统";
            root.titleName = "执法视音频实时应用系统";
        }
    }
    avalon.each(sysList, (key, val) => {
        if (/^\/sszhxt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

if (root.roleNames.length == 0) {
    roleNames.push(' - ');
}
if (root.roleNames.length > 1) {
    root.roleShow = true;
}
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: languageSelect == "en" ? "notification" : "通知",
        message: content
    });
}

function get_menu() {
    let list = [{
            key: "sszhxt-sszh",
            title: "实时指挥",
            url: '/sszhxt-sszh',
            lic: 'INSTRUCT_MENU_SSZH',
            icon: 'nav-sszh-sszh',
            iconActive: 'nav-sszh-sszh-active',
            active: false
        },
        {
            key: "sszhxt-spjk",
            title: "视频监控",
            url: '/sszhxt-spjk',
            lic: 'INSTRUCT_MENU_SPJK',
            icon: 'nav-sszh-spjk',
            iconActive: 'nav-sszh-spjk-active',
            active: false
        },
        // {
        //     key: "sszhxt-spjk",
        //     title: "集群对讲",
        //     url: '/sszhxt-jqdj',
        //     lic: 'INSTRUCT_MENU_SPJK',
        //     icon: 'nav-sszh-jqdj',
        //     iconActive: 'nav-sszh-jqdj-active',
        //     active: false
        // },
        {
            key: "sszhxt-jqdj",
            title: "集群对讲",
            lic: 'INSTRUCT_MENU_JQDJ',
            url: '/sszhxt-jqdj',
            icon: 'nav-sszh-jqdj',
            iconActive: 'nav-sszh-jqdj-active',
            active: false
        },
        {
            key: "sszhxt-lxhf",
            title: "录像回放",
            url: '/sszhxt-lxhf',
            lic: 'INSTRUCT_MENU_LXHF',
            icon: 'nav-sszh-lxhf',
            iconActive: 'nav-sszh-lxhf-active',
            active: false
        },
        {
            key: "sszhxt-gjcx",
            title: "轨迹查询",
            url: '/sszhxt-gjcx',
            lic: 'INSTRUCT_MENU_GJCX',
            icon: 'nav-sszh-gjcx',
            iconActive: 'nav-sszh-gjcx-active',
            active: false
        },{
            key: 'gjcx',
            title: '告警查询',
            lic: 'INSTRUCT_MENU_GJGL_GJCX',
            url: '/sszhxt-gjgl-gjcx',
            icon: 'nav-sszh-gjcx',
            iconActive: 'nav-sszh-gjcx-active',
            active: false
        }, {
            key: 'gjdy',
            title: '告警订阅',
            lic: 'INSTRUCT_MENU_GJGL_GJDY',
            url: '/sszhxt-gjgl-gjdy',
            icon: 'nav-sszh-gjdy',
            iconActive: 'nav-sszh-gjdy-active',
            active: false
        }, {
            key: 'gjsz',
            title: '告警设置',
            lic: 'INSTRUCT_MENU_GJGL_GJSZ',
            url: '/sszhxt-gjgl-gjsz',
            icon: 'nav-sszh-gjsz',
            iconActive: 'nav-sszh-gjsz-active',
            active: false
        },{
            key: 'rlbk',
            title: '人脸布控',
            lic: 'INSTRUCT_MENU_ZNSB_RLBK',
            url: '/sszhxt-sszh',
            icon: 'nav-sszh-rlbk',
            iconActive: 'nav-sszh-rlbk-active',
            active: false
        }, {
            key: 'cpbk',
            title: '车牌布控',
            lic: 'INSTRUCT_MENU_ZNSB_CPBK',
            url: '/sszhxt-sszh',
            icon: 'nav-sszh-cpbk',
            iconActive: 'nav-sszh-cpbk-active',
            active: false
        }, {
            key: 'rzhy',
            title: '人证核验',
            lic: 'INSTRUCT_MENU_RZHY',
            url: '/sszhxt-sszh',
            icon: 'nav-sszh-rzhy',
            iconActive: 'nav-sszh-rzhy-active',
            active: false
        },
        {
            key: "sszhxt-dzwl",
            title: "电子围栏",
            lic: 'INSTRUCT_MENU_DZWL',
            url: '/sszhxt-dzwl',
            icon: 'nav-sszh-dzwl',
            iconActive: 'nav-sszh-dzwl-active',
            active: false
        },
        {
            key: "sszhxt-xxcj",
            title: "信息采集",
            lic: 'SSZH_MENU_XXCJ',
            url: '/sszhxt-xxcj',
            icon: 'nav-sszh-xxcj',
            iconActive: 'nav-sszh-xxcj-active',
            active: false
        }
    ];

    menuService.menu.then(menu => {
        let remote_list = menu.SSZH_MENU_SSZHXT; //实时指挥系统平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组
        let output_list = []; //已授权的菜单map数组

        avalon.each(remote_list, function (index, el) {
            if (/^INSTRUCT_MENU_/.test(el))
                avalon.Array.ensure(get_list, el);
        });

        avalon.each(list, function (index, el) {
            avalon.each(get_list, function (idx, ele) {
                let child_list = [];
                if (!el.hasOwnProperty("children") || 0 == el.children.length) {

                } else {
                    avalon.each(el.children, function (k, v) {
                        avalon.each(get_list, function (kk, vv) {
                            if (vv == v.lic) {
                                // avalon.Array.ensure(child_list, v);
                                if (menu.SSZH_MENU_SSZHXT_ARR[v.lic])
                                    v.title = menu.SSZH_MENU_SSZHXT_ARR[v.lic];

                                child_list.push(v);
                                return;
                            }
                        });
                        el.children = child_list;
                    });
                }

                if (ele == el.lic) {
                    if (menu.SSZH_MENU_SSZHXT_ARR[el.lic]) {
                        el.title = menu.SSZH_MENU_SSZHXT_ARR[el.lic];
                        if (languageSelect == "en") {
                            switch (el.lic) {
                                case "INSTRUCT_MENU_SSZH":
                                    el.title = "Command";
                                    break;
                                case "INSTRUCT_MENU_SPJK":
                                    el.title = "Monitor";
                                    break;
                                case "INSTRUCT_MENU_LXHF":
                                    el.title = "Playback";
                                    break;
                                case "INSTRUCT_MENU_GJCX":
                                    el.title = "Trace";
                                    break;
                                case "INSTRUCT_MENU_GJGL":
                                    el.title = "Alarm";
                                    break;
                                case "INSTRUCT_MENU_ZNSB":
                                    el.title = "Recognition";
                                    break;
                            }
                        }
                    }
                    avalon.Array.ensure(output_list, el);
                }
            });
        });
        root.menu = output_list;
    });
}
//router server
routerserver('sszhxt_vm');

avalon.bind(window, 'hashchange', (e) => {
    root.locationKey = window.location.hash ? window.location.hash.slice(2) : '/sszhxt-sszh';
});

// history
avalon.history.start({
    root: "/",
    fireAnchor: false
});

avalon.scan(document.body);

//后台获取当前用户设置的地图默认城市
ajax({
    url: '/gmvcs/uap/user/city/get',
    method: 'get',
    data: null,
    async: false
}).then(result => {
    if (result.code == 0) {
        let city;
        if (result.data != null || result.data != undefined) {
            city = result.data.city;
        } else {
            city = languageSelect == "en" ? "Guangzhou" : defalutCity;
        }
        root.$cityDetailobj.defaultcity = city;
        root.$cityDetailobj.nowClickcity = city;
        root.$cityDetailobj.lon = cityobj[city].lon;
        root.$cityDetailobj.lat = cityobj[city].lat;
        // avalon.vmodels['sszhmap'].showcityName = city;
        // avalon.vmodels['citycontroller'].nowcity = city;
        // avalon.vmodels['citycontroller'].defaultcity = city;
        // if($('#mapIframe')[0].contentWindow.esriMap){
        //     $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(root.$cityDetailobj.lon,root.$cityDetailobj.lat,13);
        // }
    }
});

avalon.ready(function () {
    root.moveY = $('body')[0].clientHeight - $('#alarmSlider').height(); // 设置sos图标初始位置
    $('#mapIframe').attr('src', '../allmap.html');
});

//系统第一次加载地图时加上蒙版
if(avalon.msie) {
    setTimeout(() => {
        laodingMapMask();
    }, 500);
} else {
    laodingMapMask();
}

// 添加地图loading蒙版
function laodingMapMask() {
    //系统第一次加载地图时加上蒙版(注意要在avalon.scan之后，否则需要定时器延时)
    setTimeout(() => {
        frameWindow = document.getElementById("mapIframe").contentWindow;
        let isIE = judgeIE();
        let txt = languageSelect == "zhcn" ? "正在加载地图，请稍后" : "Loading.Please wait..";
        if ($('.map-iframe-wrap').is(':visible') && $('.map-iframe-wrap').width() > 0) {
            // .map-iframe-wrap 這個類加了 visibility: hidden; 所以要在每次顯示地圖時要改變visibility為visible
            $('.map-iframe-wrap').css('visibility', 'visible');
            let boundingClientRect = $('.map-iframe-wrap')[0].getBoundingClientRect();
            let opts = {
                position: 'absolute',
                top: boundingClientRect.top,
                left: $('.map-iframe-wrap').offset().left,
                // left: boundingClientRect.left,
                right: boundingClientRect.right,
                height: boundingClientRect.height,
                width: boundingClientRect.width
            };
            let iframe = isIE ? '' : '<div id="back-iframe" style="display: none;position:absolute;width:100%;height:100%;top:0;left:0;"><iframe src="about:blank" marginheight="0" marginwidth="0" class="mask-square" style="opacity:1;filter:alpha(opacity=0);background: #4d4d4d;" frameborder="0"></iframe></div>';
            let $backdrop = $(iframe + '<div class="backdrop-loading"><span class="mask-square"><span class="fa fa-spinner fa-pulse"></span>' + txt + '</span></div>');
            $('body').append($backdrop);
            if($('#back-iframe')[0]) $('#back-iframe')[0].style.cssText = '';
            $('#back-iframe, .backdrop-loading').css(opts);
            $(".backdrop-loading").css({
                "z-index": "999"
            });
            $('#back-iframe').show();
        } else {
            if($('#back-iframe, .backdrop-loading').length > 0) {
                $('#back-iframe, .backdrop-loading').hide();
            }
        }
        let defineTimer = setInterval(() => {
            // frameWindow.defineTimer = setInterval(() => {
            frameWindow = document.getElementById("mapIframe").contentWindow;
            if (frameWindow.loadMapCompelete) {
                clearInterval(defineTimer);
                // clearInterval(frameWindow.defineTimer);
                $('#back-iframe,.backdrop-loading,.backdrop').remove();
            }
        }, 200);
    }, 1000);
}

function judgeIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

//=====================================sos告警===========================
let notFoundPicture = '/static/image/sszhxt-znsb/cpbk_404.png';
var error_total = 0;
const websocketIP = 'ws://' + webSocketIp;
const socket = io(websocketIP, {
    transports: ['polling']
});

// 获取告警信息的现场图片以及类型

function inserFaceRecognitionInfo(ret, type) {
    
    let temp = ret;
    avalon.vmodels['sszhrlbk'].getFaceRecognitionInfo(ret.businessId,type).then(result => {
        if(result.code == 0) {
            temp.imgSrc = result.data.shootPersonImgFilePath || notFoundPicture;
            if(type == 'rlbk') { // 人脸布控
                temp.monitorType = 'rlbk'
                temp.type = '异常'; // sos推送的都为'异常'
                root.serviceFaceData.unshift(temp);
            } else { // 人证核验
                temp.imgSrc = result.data.recogKeyPersons[0].regImgPath || notFoundPicture;
                temp.monitorType = 'rzhy'
                temp.type = '异常'; // sos推送的都为'异常'
                root.serviceCardData.unshift(temp);
            }
        }
    })
}

function inserCarRecognitionInfo(ret) { // 车牌布控
    let temp = ret;
    avalon.vmodels['sszh-cpbk'].getCarRecognitionInfo(ret.businessId).then(result => {
        if(result.code == 0) {
            temp.monitorType = 'cpbk'
            temp.imgSrc = result.data.shootCarImgFilePath || notFoundPicture;
            temp.type = '异常'; // sos推送的都为'异常'
            root.serviceCarData.unshift(temp);
        }
    })
}

socket.on('connect', (connect) => {
    //获取当前登录用户的部门path
    ajax({
        url: '/gmvcs/uap/cas/loginUser',
        method: 'get',
        data: null
    }).then(result => {
        if (result.code != 0) {
            return;
        }
        let uid = result.data.uid;
        socket.emit('uidEvent', {
            'uid': uid
        });
    });
});

socket.on('messageevent', (ret) => {
    // console.log(ret);
    ret.status = 0;
    if (ret.sosType == "DEVICE_SOS") {
        if (ret.sosSource == "DEVICE_ELECTRIC_CAPACITANCE") {
            ret.sosType = root.sszhxt_language.power;
        } else if (ret.sosSource == "DEVICE_STORAGE_CAPACITANCE") {
            ret.sosType = root.sszhxt_language.storage;
        } else if (ret.sosSource == "DEVICE_MOTIONLESS") {
            root.sosInfoShow = true;
            root.sosMenuType = 'device';
            ret.sosType = root.sszhxt_language.static;
        }

        if (root.deviceSOSData.length > 500) {
            root.deviceSOSData.clear();
        }
        root.deviceSOSData.unshift(ret);
    } else if (ret.sosType == "BUSINESS_SOS") {
        ret.gbcode = ret.deviceId;
        root.sosInfoShow = true;
        root.sosMenuType = 'service';
        if (ret.sosSource == "FACE_MONITORING") {
            ret.sosType = root.sszhxt_language.faceDetectionAlarm;
            inserFaceRecognitionInfo(ret, 'rlbk');
        } else if (ret.sosSource == "CAR_MONITORING") {
            ret.sosType = root.sszhxt_language.carDetectionAlarm;
            inserCarRecognitionInfo(ret);
        } else if (ret.sosSource == "PERSON_IDCARD_SOS") {
            ret.sosType = root.sszhxt_language.cardDetectionAlarm;
            inserFaceRecognitionInfo(ret, 'rzhy');
        } else {
            ret.sosType = root.sszhxt_language.SOSAlarm;
            root.serviceSOSData.unshift(ret);
        }
    } else {
        if (ret.sosSource == "DEVICE_ONLINE") {
            ret.sosType = root.sszhxt_language.online;
        } else {
            ret.sosType = root.sszhxt_language.offline;
        }
        if (root.statusSOSData.length > 500) {
            root.statusSOSData.clear();
        }
        root.statusSOSData.unshift(ret);
    }

    let tooltipsDom = $("[data-toggle='popover']");
    Gm_tool.showPopover(tooltipsDom);

});

socket.on('STATUS', (ret) => {
    // if(ret.closed == "true") {
    //     socket.close();
    // }
});

socket.on('error', (error) => {
    socket.close();
});
socket.on('reconnecting', (error) => {
    //console.log(error);
});
socket.on('connect_error', (error) => {
    error_total++;
    if (error_total > 9) {
        error_total = 0;
        socket.close();
        // console.log("=====重连次数超出限制，已断开socket连接=====");
    }
});

socket.on('connect_timeout', (timeout) => {
    // console.log("connect_timeout:", timeout);
});