/**
 * 使用videojs的播放器插件
 * @prop {String}    src             播放地址
 * @prop {boolean}   play_status     gxxocx true 播放  false 停止播放
 * @prop {boolean}   dialog_status   gxxocx进度条 true 显示  false 隐藏
 * @example
 * ```
 * demo
 * <div :if="@init">
 * <ms-player :widget="{src: @play_url, special_id:'zfyps', media_type:@media_type, player_width:@web_width, player_height:@web_height, player_left:@web_left, player_top:@web_top, play_status:@play_status, dialog_status:@dialog_status}"></ms-player> 
 * </div>
 * 
 * 
 * 需要注意的是：
 * 1. ms-player外壳init为true时，播放器会初始化。
 * 2. 需要播放时，请置play_status为true
 * 3. 切换播放时(点击其他数据，切换播放时)，请先置play_status为false，设置url，再置play_status为true
 * 4. ms-player在ondispose时会暂停播放当前的视频，切记在页面上如果看不到ms-player这个组件的时候，请将外壳自定义的init置为false，不然无法执行暂停操作。
 * 5. 通过dialog_status控制进度条的显示(true)和隐藏(false)，对于弹窗时适用。
 * 
 * 可参考 zfsypsjglpt-yspk-zfyps-detail 模块
 * 
 * @author lichunsheng
 * 创建时间：2018-4-25 16:01:01
 * ```
 */
import {
    notification
} from "ane";
import {
    gxxOcxVersion,
    screenShotOutPut
} from '/services/configService';
require("/apps/common/common-player-npGxx.css");
import {
    apiUrl
} from '../../services/configService';
var storage = require('../../services/storageService.js').ret;

var vm, globalOcxPlayer, is_stop = false,
    firstImageFrame = false,
    cur_voice = 50,
    viewID = "",
    initTimer = null;
avalon.component("ms-player", {
    template: __inline("./common-player-npGxx.html"),
    defaults: {
        src: avalon.noop, //媒体播放路径
        fileName: avalon.noop,
        player_width: avalon.noop,
        player_height: avalon.noop,
        play_status: avalon.noop,
        is_play: avalon.noop,
        dialog_status: avalon.noop,
        is_IE: isIE_fuc(),
        v_blue_line_width: 0,
        v_circle_span_left: 0,
        nVolume: 0,
        ajbh: avalon.noop,
        player_dialog_show: false,
        cancelText: "关闭",
        dialog_width: "440",
        dialog_height: "235",

        onInit: function (event) {
            cur_voice = 50;
            viewID = "";
            firstImageFrame = false;
            is_stop = false;
            new scale('v_circle_span', 'v_white_line');
            $('#btn_play').show();
            $('#btn_pause').hide();
            vm = event.vmodel;
            let _this = this;

            if (vm.is_IE)
                globalOcxPlayer = document.getElementById('gxxPlayOcx');
            else
                globalOcxPlayer = document.getElementById('npGSVideoPlugin');

            if (this.is_IE) {
                try {
                    var ocx = document.getElementById('gxxPlayOcx');
                    if (ocx.object == null) {
                        document.getElementById("gxx_ocx").innerHTML = "<a class='update_web' href='/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe'>点击下载安装媒体播放器</a>";
                        notification.error({
                            message: "请下载安装媒体播放器，安装后重启浏览器，并允许浏览器进行加载！",
                            title: '通知'
                        });
                    }
                } catch (e) {
                    document.getElementById("gxx_ocx").innerHTML = "<a class='update_web' href='/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe'>点击下载安装媒体播放器</a>";
                    notification.error({
                        message: "请下载安装媒体播放器，安装后重启浏览器，并允许浏览器进行加载！",
                        title: '通知'
                    });
                }
            } else {
                if (globalOcxPlayer.GS_ReplayFunc == undefined) {
                    document.getElementById("gxx_ocx").innerHTML = "<a class='update_web' href='/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe'>点击下载安装媒体播放器</a>";
                    notification.error({
                        message: "请下载安装媒体播放器，安装后重启浏览器，并允许浏览器进行加载！",
                        title: '通知'
                    });
                }
            }

            InitPlay();

            this.$watch("play_status", (v) => {
                if (v) {
                    push_url(vm.src);
                } else {
                    controlRec(9, 0, 0, 1);
                }
            });
            // this.$fire('play_status', this.play_status);

            this.$watch("is_play", (v) => { //控制播放器 播放 true; 暂停 false
                if (firstImageFrame && vm.play_status) {
                    if (v) {
                        controlRec(0, 0, 0, 1);
                    } else {
                        controlRec(1, 0, 0, 1);
                    }
                }
            });

            this.$watch("dialog_status", (v) => { //进度条 --- 0 隐藏；1显示
                if (v) {
                    progressFuc(1);
                } else {
                    progressFuc(0);
                }
            });
            this.$fire('dialog_status', this.dialog_status);
        },
        onReady: function (event) {
            $("#ocx_playControll").on("click", "img", playControll);

            $(window).bind('beforeunload', function (event) {
                $(window).unbind('beforeunload'); //在不需要时解除绑定   
                delete_ocx();
            });

            $(window).on('resize', windowResize);
            $(window).on('scroll', windowScroll);
        },
        onDispose: function (event) {
            clearTimeout(timer);
            clearTimeout(initTimer);
            $(window).off('resize', windowResize);
            $(window).off('scroll', windowScroll);

            // controlRec(9, 0, 0, 1);
            let userAgent = navigator.userAgent;
            if (!(userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1))
                delete_ocx();
        },
        voice() {
            var _this = this;
            var data = {};
            data.action = 'OCXGetVolume';
            data['arguments'] = {};

            var ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            var ret_json = eval("(" + ret + ")");
            _this.nVolume = ret_json.nVolume;

            data = {};
            data.action = 'OCXSetVolume';
            data['arguments'] = {};
            data['arguments']['nVolume'] = 0;
            globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

            _this.v_blue_line_width = $(".v_blue_line").width();
            _this.v_circle_span_left = document.getElementById("v_circle_span").style.left;
            $(".v_blue_line").width(0);
            document.getElementById("v_circle_span").style.left = "-6px";
            $(".gxx_player_controll .volume_control .voice").hide();
            $(".gxx_player_controll .volume_control .mute").show();
        },
        mute() {
            if (cur_voice == 0)
                return;
            var _this = this;
            var data = {};
            data.action = 'OCXSetVolume';
            data['arguments'] = {};
            data['arguments']['nVolume'] = parseInt(_this.nVolume);
            globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

            $(".v_blue_line").width(_this.v_blue_line_width);
            document.getElementById("v_circle_span").style.left = _this.v_circle_span_left;
            $(".gxx_player_controll .volume_control .mute").hide();
            $(".gxx_player_controll .volume_control .voice").show();
        },
        full_screen() {
            var data = {};
            data.action = 'ChangeReplayDispSplit';
            data['arguments'] = {};
            data['arguments']['nDispSplit'] = 0;
            data['arguments']['nRow'] = 1;
            data['arguments']['nColumn'] = 1;

            globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
        },
        move_return(a, b) {
            let _this = this;
            if ($("#iframe_gxx").length && $("#iframe_gxx").length > 0) {
                $("#iframe_gxx").css({
                    width: _this.dialog_width + "px",
                    height: _this.dialog_height + "px",
                    left: a,
                    top: b
                });
            }
            if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                $("#iframe_jdzxpt").css({
                    width: _this.dialog_width + "px",
                    height: _this.dialog_height + "px",
                    left: a,
                    top: b
                });
            }
        },
        dialogOk() {
            this.player_dialog_show = false;
            $("#iframe_gxx").hide();
            $("#iframe_jdzxpt").hide();
            if (player_dialog_vm.showTip) {
                storage.setItem("npGxx-tips", true);
                let downURL = "http://" + window.location.host + "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe"; //远程服务器使用
                window.location.href = downURL;
            }
        },
        dialogCancel() {
            this.player_dialog_show = false;
            $("#iframe_gxx").hide();
            $("#iframe_jdzxpt").hide();
            if (player_dialog_vm.showTip) {
                storage.setItem("npGxx-tips", true);
                vm.$fire('play_status', vm.play_status);
                vm.$fire('is_play', vm.is_play);
            }
        }
    }
});

let player_dialog_vm = avalon.define({
    $id: "player_dialog",
    title: "",
    close_txt: "",
    showTip: false
});

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

//播放器速率显示
let player_controll_vm = avalon.define({
    $id: "gxx_player_controll",
    cur_speed: 1
});
/*================== 媒体播放器 start =============================*/

//注册回调函数
function _onOcxEventProxy(data) {
    var ret = eval('(' + data + ')');
    // console.log(ret);
    if (ret.ocxID == viewID && ret.action == 'FirstImageFrame') {
        firstImageFrame = true;
    }

    if (ret.ocxID == viewID && ret.action == 'SelRecordDisp') {
        is_stop = true;
        $('#btn_play').show();
        $('#btn_pause').hide();
    }

    if (ret.ocxID == viewID && ret.action == 'CapturePicture') {
        notification.success({
            message: '视频截图已成功保存。位置如下：' + ret.data.picPath,
            title: '提示'
        });
        if (vm.ajbh) {
            let obj = {};
            setTimeout(function () {
                let data = {};
                data.action = 'HttpUploadFile';
                data['arguments'] = {};
                data['arguments']['strUrl'] = "http://" + window.location.host + apiUrl + "/gmvcs/pzzz/file/upload?type=1&ajbh=" + vm.ajbh;
                data['arguments']['strFileName'] = ret.data.picPath;
                data['arguments']['extParam'] = obj;
                globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            }, 2000);
        }
    }
}

//初始化播放器函数
function InitPlay() {
    // if (vm.is_IE)
    //     globalOcxPlayer = document.getElementById('gxxPlayOcx');
    // else
    //     globalOcxPlayer = document.getElementById('npGSVideoPlugin');

    if (globalOcxPlayer == null) {
        // notification.warn({
        //     message: '请安装媒体播放器',
        //     title: '提示'
        // });
        return;
    }
    globalOcxPlayer.style.display = "block";
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify({
        'action': 'InitDeviceSdk'
    }));

    let data = {};
    data.action = 'GetVersion';
    let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    let version = eval('(' + ret + ')').data.version;

    let version_status = true,
        is_alert = storage.getItem("npGxx-tips");
    if (!is_alert && compare_version(version)) {
        //弹窗提示升级播放器版本
        version_status = false;
        player_dialog_vm.close_txt = "您的高新兴视频播放器插件版本为" + version + "，最新版为" + gxxOcxVersion + "。部分功能可能将无法使用，请下载最新版本！";
        player_dialog_vm.showTip = true;
        player_dialog_vm.title = "下载提醒";
        vm.cancelText = "否";
        vm.dialog_width = "440";
        vm.dialog_height = "225";

        vm.player_dialog_show = true;

        if (!$(".player_dialog_class").hasClass("dialog_big")) {
            setTimeout(function () {
                $(".player_dialog_class").addClass("dialog_big");
            }, 500);
        }

        if ($("#iframe_gxx").length && $("#iframe_gxx").length > 0) {
            $("#iframe_gxx").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_gxx").css({
                    "opacity": 1
                });
                $("#iframe_gxx").show();
            }, 1000);
        }
        if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
            $("#iframe_jdzxpt").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_jdzxpt").css({
                    "opacity": 1
                });
                $("#iframe_jdzxpt").show();
            }, 1000);
        }
    }
    setTimeout(function () {
        globalOcxPlayer.RegJsFunctionCallback(_onOcxEventProxy);
    }, 1000);
    initTimer = setTimeout(function () {
        CreateRePlay();
        if (version_status) {
            vm.$fire('play_status', vm.play_status);
            vm.$fire('is_play', vm.is_play);
        }
    }, 2000);
}

//创建录像视图
function CreateRePlay() {
    if (globalOcxPlayer == null) {
        // notification.warn({
        //     message: '请安装媒体播放器',
        //     title: '提示'
        // });
        return;
    }

    var data = {};

    data = {};
    data.action = 'InitPara'; //设置视图标识，作为每个视图回调事件的标识
    data['arguments'] = {};
    viewID = "view_" + Math.round(new Date().getTime()).toString();
    data['arguments']['ocxID'] = viewID; //自定义ocxID，区分播放器的回调
    globalOcxPlayer.GS_RealTimeFunc(JSON.stringify(data));

    data = {};
    data.action = 'InitReplayWnd'; //创建录像视图
    data['arguments'] = {};
    data['arguments']['nDefaultSplit'] = 1;
    data['arguments']['nMaxSplit'] = 16;
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    data = {};
    data.action = 'SetReplayWindowStyle'; //播放器进度条 ---- 1 隐藏；0 显示
    data['arguments'] = {};
    data['arguments']['nIndex'] = 1;
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    data = {};
    data.action = 'OCXSetVolume'; //设置默认声音，为50
    data['arguments'] = {};
    data['arguments']['nVolume'] = 50;
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}

//释放控件
function delete_ocx() {
    if (globalOcxPlayer == null) {
        return;
    }

    if (!!window.ActiveXObject || "ActiveXObject" in window) {

    } else {
        if (globalOcxPlayer && !globalOcxPlayer.GS_ReplayFunc)
            return;
    }

    var data = {};
    data.action = 'Delete';
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    data = {};
    data.action = 'LogOut';
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}

//传地址进播放器
function push_url(url) {
    $('#btn_pause').show();
    $('#btn_play').hide();

    var data = {};
    data.action = 'Replay_Local_Ex'; //  播放本地录像----所以免登陆
    data['arguments'] = {};
    data['arguments']['szFileName'] = encodeURI(url);
    data['arguments']['nIndex'] = -1; //填写-1默认选择空闲窗口
    let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    let ret_json = eval("(" + ret + ")");

    if (ret_json.code == 10022) {
        player_dialog_vm.close_txt = "文件所在存储设备离线！";
        player_dialog_vm.showTip = false;
        player_dialog_vm.title = "提示";
        vm.cancelText = "关闭";
        vm.dialog_width = "440";
        vm.dialog_height = "235";

        vm.player_dialog_show = true;

        if (!$(".player_dialog_class").hasClass("dialog_small"))
            $(".player_dialog_class").addClass("dialog_small");

        if ($("#iframe_gxx").length && $("#iframe_gxx").length > 0) {
            $("#iframe_gxx").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_gxx").css({
                    "opacity": 1
                });
                $("#iframe_gxx").show();
            }, 1000);
        }
        if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
            $("#iframe_jdzxpt").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_jdzxpt").css({
                    "opacity": 1
                });
                $("#iframe_jdzxpt").show();
            }, 1000);
        }
    }
}

//播放器控制
function playControll(event) {
    switch (event.target.parentElement.parentElement.id) {
        case 'btn_play':
            {
                if (is_stop) {
                    is_stop = false;
                    push_url(vm.src);
                    return;
                }
                if (vm.src) {
                    controlRec(0, 0, 0, 1);
                    $('#btn_pause').show();
                    $('#btn_play').hide();
                }
                break;
            }
        case 'btn_pause':
            {
                controlRec(1, 0, 0, 1);
                $('#btn_play').show();
                $('#btn_pause').hide();
                break;
            }
        case 'btn_stop':
            {
                controlRec(9, 0, 0, 1);
                break;
            }
        case 'btn_forward': //快放
            {
                controlRec(2, 0, 0, 1);
                break;
            }
        case 'btn_backward': //慢放
            {
                controlRec(3, 0, 0, 1);
                break;
            }
        case 'btn_forframe': //单帧进
            {
                $('#btn_play').show();
                $('#btn_pause').hide();
                controlRec(4, 0, 0, 1);
                break;
            }
        case 'btn_backframe': //单帧退
            {
                // $('#btn_play').show();
                // $('#btn_pause').hide();
                controlRec(10, 0, 0, 1);
                break;
            }
        case 'btn_screenshot': //截图
            {
                let data = {};
                data.action = 'SetConfigParam';
                data['arguments'] = {};
                data['arguments']['captureSavePath'] = screenShotOutPut;
                globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

                data = {};
                data.action = 'CapturePicture';
                data['arguments'] = {};
                data['arguments']['szPicPath'] = "";
                data['arguments']['nIndex'] = 1;

                globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
                break;
            }
    }
}

//视频控制函数
function controlRec(type, lParam, wParam, index) {
    if (globalOcxPlayer == null) {
        // notification.warn({
        //     message: "请安装媒体播放器！",
        //     title: '提示'
        // });
        return;
    }

    var data = {};
    data.action = 'ReplayCtrl';
    data['arguments'] = {};
    data['arguments']['nCtrlType'] = type;
    data['arguments']['lParam'] = lParam;
    data['arguments']['wParam'] = wParam;
    data['arguments']['nIndex'] = index;

    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}

//控制进度条是否显示
function progressFuc(val) {
    if (globalOcxPlayer == null) {
        // notification.warn({
        //     message: "请安装媒体播放器！",
        //     title: '提示'
        // });
        return;
    }

    var data = {};
    data.action = 'EnableToolBar';
    data['arguments'] = {};
    data['arguments']['enable'] = val;

    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}
/*================== 媒体播放器 end =============================*/

/*================== 声音控制 start =============================*/
var scale = function (btn, bar) {
    this.btn = document.getElementById(btn);
    this.bar = document.getElementById(bar);
    this.step = $("#" + bar).next()[0];
    this.init();
};
scale.prototype = {
    init: function () {
        var f = this,
            g = document,
            b = window,
            m = Math,
            current_num, total_num, sum_width;
        f.btn.onmousedown = function (e) {
            e.preventDefault();
            var x = (e || b.event).clientX;
            var l = this.offsetLeft;
            var max = f.bar.offsetWidth - this.offsetWidth + 6;
            total_num = max;
            sum_width = max + 6;
            g.onmousemove = function (e) {
                var thisX = (e || b.event).clientX;
                var to = m.min(max, m.max(-6, l + (thisX - x)));
                f.btn.style.left = to + 'px';
                f.ondrag(m.round(m.max(0, to / max) * 100), to);
                current_num = to;
                b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();

                cur_voice = ((sum_width - (total_num - current_num)) / sum_width) * 100;
                if (cur_voice == "0") {
                    $(".gxx_player_controll .volume_control .voice").hide();
                    $(".gxx_player_controll .volume_control .mute").show();
                } else {
                    $(".gxx_player_controll .volume_control .mute").hide();
                    $(".gxx_player_controll .volume_control .voice").show();
                }

                //控制声音
                var data = {};
                data.action = 'OCXSetVolume';
                data['arguments'] = {};
                data['arguments']['nVolume'] = Math.round(cur_voice);
                globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            };
            // g.onmouseup = new Function('this.onmousemove=null');
            g.onmouseup = function (e) {
                g.onmousemove = null;
            };
        };
    },
    ondrag: function (pos, x) {
        this.step.style.width = Math.max(0, x) + 'px';
    }
};
/*================== 声音控制 end =============================*/

//浏览器滚动条滚动时绑定的函数
let timer;

function windowScroll() {
    progressFuc(0);
    clearTimeout(timer);
    timer = setTimeout(function () {
        progressFuc(1);
    }, 500);
}

//对比版本函数
function compare_version(curVersion) {
    //return true 代表版本过低
    let num1 = [],
        num2 = [];
    num1 = gxxOcxVersion.split('.'); //config.js 里注明的ocx版本
    num2 = curVersion.split('.'); //当前安装版本
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

//窗口大小变化时的处理函数
function windowResize() {
    if (vm.player_dialog_show && $("#iframe_gxx").is(":visible")) {
        setTimeout(() => {
            $("#iframe_gxx").css({
                width: vm.dialog_width,
                height: vm.dialog_height
            });
        }, 0);
    }
}