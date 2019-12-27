// ocxplayer.html使用方法
// http://xx.xx.xx.xx:xxx/gmvcs/uap/cas/nx/login?userCode=[警员警号]&url=http://xx.xx.xx.xx:xxx/ocxplayer.html?type=2%26url=[视频播放地址，需转码后填入]

// 公共引用部分，兼容IE8
import 'es5-shim';
import 'es6-promise/dist/es6-promise.auto';
import jQuery from 'jquery';
global.$ = global.jQuery = jQuery;
// 提前禁止avalon对Object.create的实现
if (!Object.create) {
    Object.create = function () {
        function F() {}

        return function (o) {
            F.prototype = o;
            return new F();
        };
    }();
}
var avalon = require('avalon2');
if (avalon.msie < 8) {
    Object.defineProperty = function (obj, property, meta) {
        obj[property] = meta.value;
    };
}

require('ane/dist/layout');
require('bootstrap');
require('es5-shim/es5-sham');
require('/apps/common/common-player-npGxx');

import './ocxplayer.css';
import 'ane';
import {notification} from 'ane';
import ajax from '/services/ajaxService';
import { Gxxplayer } from '/vendor/gosunocx/gosunocx';
import moment from 'moment';
let language_txt = require('/vendor/language').language;
import {
    gxxOcxVersion,
    languageSelect
} from '/services/configService';
let vm, player, processTimer, ocxele;

vm = avalon.define({
    $id: 'ocxplayer_vm',
    tipText: '当前页面需要高新兴视频播放器插件支持',
    showtip: true,
    playing: false,
    isStop: false,
    speed: 1,
    isie: '',
    activeVideoRid: '', //当前选中的录像数据的rid
    downloadTipShow: false,
    sszhxt_language: language_txt.sszhxt.sszhxt_lxhf,
    extra_class_dialog: languageSelect == "en" ? true : false,
    toggleShow: false,
    play_url: "",
    media_type: false, //--fasle 视频；true 音频
    play_status: false,
    web_width: "100%",
    web_height: "100%",
    web_left: "0",
    web_top: "0",
    type: null,  // 视频播放类型 1 => 根据rid播放， 2 => 根据播放地址播放
    fid: '', // 播放文件ID
    dialogShow: false,
    dialogWidth: 350,
    dialogHeight: 200,

    deleteClick() {
        this.dialogShow = true;
        $("#iframe_zfsyps").css({
            "opacity": 0
        });
        setTimeout(function () {
            $("#iframe_zfsyps").css({
                "opacity": 1
            });
            $("#iframe_zfsyps").show();
        }, 600);
    },
    dialogCancel() {
        this.dialogShow = false;
        $("#iframe_zfsyps").hide();
    },
    dialogOk() {
        this.deleteData();
    },
    move_return(a, b) {
        let _this = this;
        $("#iframe_zfsyps").css({
            width: _this.dialogWidth + "px",
            height: _this.dialogHeight + "px",
            left: a,
            top: b + 3
        });
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
                //playByUrl里面已经包含了pollProcess()，所以此处不能再添加pollProcess(),否则processTimer无法按规定清除
                video.playByUrl(this.activeVideoRid);
            } else {
                video.play();
                pollProcess(); //轮询录像播放进度
            }
        } else {
            video.pause();
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
    },
    // 删除文件
    deleteData() {
        let url = '/gmvcs/shendun/audio/file/delete?fid='+ this.fid;
        let data ={};
        ocxplayerDialog.dialogTxt = '删除文件中，请稍后...';
        Ajax(url, 'post', data).then((result) => {
            if (result.code == 0) {
                showTips('success', '删除文件成功！');
                if(vm.type == 1) {
                    video.closeAllVideoTape();
                    vm.playing = false;
                } else {
                    vm.play_url = '';
                    vm.play_status = false;
                }
            } else {
                showTips('warn', '删除失败：' + result.msg);
            }
            setTimeout(() => {
                vm.dialogShow = false;
                ocxplayerDialog.dialogTxt = '确认删除该文件？';
            }, 2000);
        });
    },

    //视频列表点击
    tabPoliceVideo(rid) {
        //清除点击前相关内容
        if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
            video.stop(); //停止播放
        }
        this.activeVideoRid = rid;
        clearInterval(processTimer);
        //-------------
        video.playByUrl(this.activeVideoRid);
        if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
            video.ctrlPlaySpeed(0);
        }
    },
});

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
            vm.tipText = "当前页面需要高新兴视频播放器插件支持";
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
            vm.tabPoliceVideo(vm.activeVideoRid);
        });
        let version = player.getVersion();
        if (compareString(gxxOcxVersion, version)) {
            $('#video-ocx').css({
                'z-index': -9999,
                'position': 'relative'
            });
            vm.tipText = '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
            vm.downloadTipShow = true;
            vm.showtip = false;
            return;
        }
    },
    uninit: function() {
        player.uninit();
    },
    playByUrl: function (rid) {
        // let url = '/gmvcs/uom/file/auto/getVODInfo?vFileIds=' + rid; // 指挥中心的视频数据信息
        let url = '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + rid; // 视音频库里面的视频数据信息
        vm.locationIndex = 0;
        Ajax(url).then(result => {
            if (result.code !== 0) {
                showTips('error', result.msg);
                return;
            }
            if (result.data.length == 0) {
                showTips('warn', '无视频可播放');
                return;
            }
            let ocxInfo = result.data[0].ocxvideoInfo;
            let opt = {
                "ssIp": ocxInfo.ip,
                "ssPort": ocxInfo.port,
                "ssUsername": ocxInfo.account,
                "ssPasswd": ocxInfo.password
            };
            let code = player.loginVod(opt); //先登录流媒体
            if (code != 0) {
                vm.playing = false;
                $('.video-tool-bar .fa').addClass('disabled');
                showTips('error', '中心录像服务登录失败,出错代码为' + code);
                return;
            }
            code = player.playVideotape(ocxInfo.playUrl, moment(ocxInfo.startTime).format("YYYY-MM-DD HH-mm-ss"), moment(ocxInfo.endTime).format("YYYY-MM-DD HH-mm-ss"));
            if (code == -2) { //表示登录失败
                vm.playing = false;
                $('.video-tool-bar .fa').addClass('disabled');
                showTips('error', '登录失败');
                return;
            }
            vm.playing = true;
            vm.isStop = false;
            $('.video-tool-bar .fa').removeClass('disabled');
            // 轮询ocx进度
            pollProcess();
            setSpeedBeforePlay();
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
};


let ocxplayerDialog = avalon.define({
    $id: "ocxplayerDialog",
    title: "删除文件",
    dialogTxt: '确认删除该文件？'
});


vm.$watch('onReady', function(event) {
    vm.type = Number(GetQueryString('type'));
    vm.fid = GetQueryString('fid');
    if(vm.type === 1) {
        vm.toggleShow = true;
        vm.activeVideoRid = GetQueryString('rid');
        vm.isie = isIE();
        window._onOcxEventProxy = _onOcxEventProxy;
        video.init();
    } else {
        // let url = GetQueryString('url');
        let urlArr = window.location.search.split("url");
        let url = urlArr[1].substring(1, urlArr[1].length);
        
        vm.toggleShow = false;
        vm.play_url = decodeURIComponent(url);
        vm.play_status = true;
    }
});

vm.$watch('onDispose', function(event) {
    video.uninit();
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
            clearInterval(processTimer);
            $('.fa-step-backward,.fa-step-forward').addClass('disabled');
        }
    }, 200);
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
        title: "温馨提示",
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}

function fetchOrgWhenExpand(treeId, treeNode, selectedKey) {
    let url = '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType;
    Ajax(url).then((result) => {
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
        let item = {
            key: el.orgId,
            title: el.orgName,
            code: el.orgCode,
            path: el.path,
            checkType: el.checkType,
            children: el.childs,
            isParent: true,
            icon: "/static/image/tyywglpt/org.png"
        };
        handledData.push(item);
        handleRemoteTreeData(el.childs);
    });
    return handledData;
}

function handleDuration(duration) {
    if (duration <= 0) {
        return "00:00:00";
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
                video.slower();
            }
        }
    }
}

function setVideoHeight() {
    let sideHeight = $('.lxhf-side-bar').outerHeight();
    $('.graphic-container').height(sideHeight - 322);
    $('.video-preview-list').height($('.side-bar-main').outerHeight() - $('.search-box').outerHeight() - 12);
    vm.videoHeight = $('.lxhf-video').outerHeight() - 30;
    $('#mapIframe').css({
        width: $('.lxhf-video').width(),
        height: $('.lxhf-video').outerHeight()
    });
}

function GetQueryString (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
      return (r[2]);
    }
    return null;
  }
  

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}


avalon.scan(document.body);
