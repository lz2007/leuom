/**
 * 实时指挥系统--视频监控
 *caojiacong
 */
import ajax from '/services/ajaxService';
import {
    Gxxplayer
} from '/vendor/gosunocx/gosunocx';
import {
    gxxOcxVersion
} from '/services/configService';
import {
    createForm,
    notification
} from 'ane';
export const name = 'sszhxt-spjk';
require('./sszhxt-spjk.css');
const storage = require('/services/storageService.js').ret;
const iframe = $('<iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1; filter:alpha(opacity=0);"></iframe>')
let vm = null;
let player, soundMaxPix, ztree, ocxele;
let iframeWindow;
let splitWinTotal = 4; // 初始化分屏数 
let reloginTime = 0; // 播放中断循环请求次数，2次提示

let language_txt = require('/vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

//页面组件
avalon.component(name, {
    template: __inline('./sszhxt-spjk.html'),
    defaults: {
        spjk_txt: getLan(),
        isie: '',
        orgData: [],
        splitWinTotal: splitWinTotal, //当前分屏数
        activeWinTotal: 0, //非空闲窗口总数
        activeWinIndex: 1, //当前获得焦点的窗口索引
        isAbleTip: true,
        soundLevel: 10, //实时音量值
        soundStartLevel: 10, //起始音量值
        soundShow: false, //是否显示音量
        soundIsDown: false, //是否在音量调节区按下鼠标
        soundStartY: 0, //按下鼠标时的鼠标位置
        videoMarginLeft: 280,
        videoWidth: 'auto',
        videoHeight: 560,
        playingDevice: [], //处于监控状态的设备列表（包含设备gbcode及播放窗口索引）
        dataStr: '',
        tipText: getLanSSZH().needPlug,
        downloadTipTxt: getLanSSZH(),
        showtip: true,
        dataJson: {},
        saveJson: {},
        downloadTipShow: false,
        sidebarFoldChange(type) {
            if (type == 'close') {
                this.videoMarginLeft = 0;
                setTimeout(() => {
                    this.videoWidth = $('.spjk-main-container').width() + 'px';
                }, 500)
            } else {
                this.videoMarginLeft = 280;
                setTimeout(() => {
                    this.videoWidth = 'auto'
                }, 500)
            }
        },
        onInit(event) {
            vm = event.vmodel;
            vm.isie = isIE();
            window._onOcxEventProxy = _onOcxEventProxy;
            this.$watch('soundLevel', (v) => {
                //要加1 soundLevel才与getVolume返回的值统一
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    player.SoundCtrl(vm.activeWinIndex, 1, 1);
                    player.setVolume(v + 1);
                }
            });
            this.$watch('splitWinTotal', (v) => {
                this.saveJson.splitWinTotal = v;
                this.dataStr = JSON.stringify(this.saveJson);
            })
            this.$watch('dataStr', (v) => {
                storage.setItem(name, v, 0.5);
            })
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.splitWinTotal = v.splitWinTotal;
                    player && player.splitWnd(this.splitWinTotal);
                }
            })
        },
        onReady(event) {
            vm.isie = isIE();
            window._onOcxEventProxy = _onOcxEventProxy;
            video.init();
            setVideoHeight();
            let storageStr = storage.getItem(name);
            this.dataJson = storageStr ? JSON.parse(storageStr) : null;
            $(window).on('resize', setVideoHeight)
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                this.soundLevel = player.getVolume();
            }
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            if (iframeWindow.esriMap) {
                iframeWindow.esriMap.remove_overlay(); //去除地图上的标记和轨迹等
            }
        },
        onDispose() {
            this.splitWinTotal = splitWinTotal;
            //关闭所有窗口
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                this.handleCloseAll();
                player.uninit();
            }
            $(window).off('resize', setVideoHeight);
            video.server = {};
        },
        getShowStatus(show) {
            vm.downloadTipShow = show;
        },
        extraHandleWhenCheckOrg(before) {
            before(this.splitWinTotal);
        },
        //左侧树勾选回调
        handleTreeCheck(event, treeId, treeNode) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            ztree = $.fn.zTree.getZTreeObj(treeId);
            if (treeNode.checked) { //勾选
                //当非空闲窗口总数等于分屏数时，进行提示；
                //isAbleTip用来限制每次勾选只提示一次，避免出现勾选部门后，部门下设备都被动被勾选，然后出现很多个提示的情况
                vm.activeWinTotal = 0;
                for (i = 1; i <= this.splitWinTotal; i++) {
                    let status = player && player.getStatusByIndex(i);
                    if (status !== 0) {
                        vm.activeWinTotal++;
                        // break;
                    }
                }
                if (this.activeWinTotal >= this.splitWinTotal) {
                    this.isAbleTip && showTips('warning', getLan().noneFree);
                    //取消勾选
                    ztree.checkNode(treeNode, false, true, true);
                    ztree.updateNode(treeNode, false);
                    this.isAbleTip = false;
                    return;
                }
                let i;
                this.isAbleTip = true;
                video.play(treeNode.gbcode, treeNode.name);

                // for (i = 1; i <= this.splitWinTotal; i++) {
                //     let status = player && player.getStatusByIndex(i);
                //     if (status === 0) {
                //         video.play(treeNode.gbcode);
                //         vm.activeWinTotal++;
                //         break;
                //     }
                // }
            } else { //取消勾选，关闭相应的窗口
                for (let i = 0; i < vm.playingDevice.length; i++) {
                    if (vm.playingDevice[i].gbcode === treeNode.gbcode) {
                        player.stopRec(vm.playingDevice[i].nIndex);
                        break;
                    }
                }
            }
        },
        //退出全屏
        exitFull(event) {
            let keyCode = event.keyCode || event.which;
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            if (keyCode === 27) {
                player.exitFull();
                event.preventDefault();
            }
        },
        //当设备信息变化时
        extraProcessWhenPersonChange(node) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                return;
            }
            //变化时检查是否在线，如果离线则将其关闭
            if (node.online === 0) {
                for (let i = 0; i < vm.playingDevice.length; i++) {
                    if (vm.playingDevice[i].gbcode === node.gbcode) {
                        player.stopRec(vm.playingDevice[i].nIndex);
                        break;
                    }
                }
            }
        },
        handleSound(event) {
            this.soundShow = !this.soundShow;
            soundMaxPix = $('.sound-level-wrap').height();
        },
        handleSoundMouseLeave(event) {
            this.soundShow = false;
        },
        handleSoundScroll(event) {
            let dis = -(event.deltaY) || event.wheelDelta;
            if (dis > 0 && this.soundLevel < 100) {
                //上滚：音量加
                this.soundLevel++;
            } else if (dis < 0 && this.soundLevel > 0) {
                //下滚：音量减
                this.soundLevel--;
            }
            event.preventDefault();
        },
        handleSoundMouseDown(event) {
            this.soundIsDown = true;
            this.soundStartY = event.clientY;
            this.soundStartLevel = this.soundLevel;
        },
        handleSoundMouseMove(event) {
            if (!this.soundIsDown) {
                return;
            }
            let disPix = this.soundStartY - event.clientY;
            let disLevel = Math.floor((disPix / soundMaxPix) * 100);
            let level = this.soundStartLevel + disLevel;
            if (level > 100) {
                this.soundLevel = 100;
            } else if (level < 0) {
                this.soundLevel = 0;
            } else {
                this.soundLevel = level;
            }
        },
        handleSoundMouseUp(event) {
            this.soundIsDown = false;
        },
        handleSplit1(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            this.splitWinTotal = 1;
            player.splitWnd(1);
            player.focus(vm.activeWinIndex);
        },
        handleSplit4(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            this.splitWinTotal = 4;
            player.splitWnd(4);
            player.focus(vm.activeWinIndex);
        },
        handleSplit6(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            this.splitWinTotal = 6;
            player.splitWnd(6);
            player.focus(vm.activeWinIndex);
        },
        handleSplit9(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            this.splitWinTotal = 9;
            player.splitWnd(9);
            player.focus(vm.activeWinIndex);
        },
        //自定义分屏
        handleSplit(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            splitVm.show = true;
        },
        //全屏
        handleFull(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            player.maxView();
        },
        //关闭所有
        handleCloseAll(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            for (let i = 1; i <= 16; i++) {
                let status = player.getStatusByIndex(i);
                if (status !== 0) {
                    player.stopRec(i);
                }
            }
        },
        //关闭当前
        handleClose(event) {
            if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
                $('#video-ocx').css({
                    'z-index': -9999,
                    'position': 'relative'
                });
                vm.tipText = getLanSSZH().needPlug;
                vm.showtip = true;
                vm.downloadTipShow = true;
                return;
            }
            let status = player.getStatusByIndex(-1);
            if (status !== 0) {
                player.stopRec(vm.activeWinIndex);
            }
        }
    },
});


//自定义分屏弹窗
const splitVm = avalon.define({
    $id: 'spjk-split-vm',
    show: false,
    rowShow: false,
    columnShow: false,
    $form: createForm(),
    row: 1,
    column: 1,
    getRowSelected(value) {
        this.row = Number(value);
    },
    getColumnSelected(value) {
        this.column = Number(value);
    },
    handleOk() {
        vm.splitWinTotal = this.row * this.column;
        player.splitWnd(1000, this.row, this.column);
        player.focus(vm.activeWinIndex);
        this.show = false;
    },
    handleCancel() {
        this.show = false;
    }
});

//弹窗内的下拉框组件(重写一个是因为ie下object会挡住下拉列表)
avalon.component('ms-modal-select', {
    template: '<div class="modal-select-dropdown"><span class="modal-selected fa fa-caret-down" :click="handleClick">{{@selected}}</span><ul class="modal-select-options" :visible="@show"><li :for="($index,el) in @options" :attr="{\'data-index\':$index}" :class="$index == @activeIndex ? \'active\' : \'\'" :click="@onChange">{{el}}</li><iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1; filter:alpha(opacity=0);"></iframe></ul></div>',
    defaults: {
        show: false,
        selected: 1,
        options: [1, 2, 3, 4],
        activeIndex: 0,
        target: "",
        getSelected: avalon.noop,
        handleClick(e) {
            this.show = !this.show;
            this.target = $(e.target).parents('.modal-select-dropdown');
        },
        onChange(e) {
            this.selected = parseInt(e.target.innerHTML);
            this.show = false;
            this.activeIndex = e.target.getAttribute('data-index');
            this.getSelected(this.selected);
        },
        onInit() {
            $(document).on('click', (e) => {
                let $target = $(this.target);
                if ($target && this.show && !$target.is(e.target) && $target.has(e.target).length === 0) {
                    this.show = false;
                }
            })
        }
    }
})

//===============================ocx部分========================================
let video = {
    server: {},
    init: function () {
        ocxele = document.getElementById("video-ocx");
        player = new Gxxplayer();
        if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
            $('#video-ocx').css({
                'z-index': -9999,
                'position': 'relative'
            });
            vm.tipText = getLanSSZH().needPlug;
            vm.showtip = true;
            vm.downloadTipShow = true;
            // showTips('warning', '请先下载ocx播放器');
            return;
        }
        // 初始化播放器
        player.init({
            'element': 'video-ocx',
            'model': 1,
            'proxy': _onOcxEventProxy
        }, () => {
            player.splitWnd(4, 2, 2);
        });
        let version = player.getVersion();
        if (compareString(gxxOcxVersion, version)) {
            $('#video-ocx').css({
                'z-index': -9999,
                'position': 'relative'
            });
            if (languageSelect == "zhcn")
                vm.tipText = '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
            else
                vm.tipText = 'Your GXX player plugin version is ' + version + ' and the latest version is ' + gxxOcxVersion + '. Please download the latest version.';
            vm.showtip = false;
            vm.downloadTipShow = true;
            return;
        }
    },
    play: function (gbcode, showTitle) {
        ztree = $.fn.zTree.getZTreeObj('sszhxt-spjk-polltree');
        let node = ztree.getNodeByParam("gbcode", gbcode, null);
        ajax({
            url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?deviceId=' + gbcode + '&requestType=play_realtime_video',
            method: 'get',
            data: null
        }).then(result => {
            if (result.code === 1702) {
                if (node && node.checked) { //去掉勾选
                    ztree.checkNode(node, false, true, true);
                    ztree.updateNode(node, false);
                    vm.activeWinTotal--;
                }
                showTips('warning', getLan().equipmentOffline);
                return;
            } else if (result.code === 1701) {
                showTips('error', getLan().mediaF);
                if (node && node.checked) { //去掉勾选
                    ztree.checkNode(node, false, true, true);
                    ztree.updateNode(node, false);
                    vm.activeWinTotal--;
                }
                return;
            } else if (result.code == 1500) {
                showTips('error', getLan().mediaF);
                return;
            } else if (result.code != 0) {
                showTips('error', getLan().gatewayF);
                if (node && node.checked) { //去掉勾选
                    ztree.checkNode(node, false, true, true);
                    ztree.updateNode(node, false);
                    vm.activeWinTotal--;
                }
                return;
            }
            result.data.gbcode = gbcode;
            if (result.data.playURL) { //表示gsp方式点流
                // result.data.url = result.data.gsp;
                result.data.url = result.data.playURL;
                let code = player.playRecByUrl(result.data, showTitle);
                if (code != 0) {
                    showTips('error', getLan().callingF);
                    if (node && node.checked) { //去掉勾选
                        ztree.checkNode(node, false, true, true);
                        ztree.updateNode(node, false);
                        vm.activeWinTotal--;
                    }
                    return;
                }
            } else {
                let code = player.login(result.data); //先登录流媒体
                if (code != 0) {
                    showTips('error', getLan().mediaLoginF + code);
                    if (node && node.checked) { //去掉勾选
                        ztree.checkNode(node, false, true, true);
                        ztree.updateNode(node, false);
                        vm.activeWinTotal--;
                    }
                    return;
                }
                reloginTime = 0;
                this.server = result.data;
                this.server.node = node;
                code = player.playRec(result.data, showTitle); //实时点流
                if (code == -2) { //表示登录失败
                    showTips('error', getLan().loginF);
                    if (node && node.checked) { //去掉勾选
                        ztree.checkNode(node, false, true, true);
                        ztree.updateNode(node, false);
                        vm.activeWinTotal--;
                    }
                    return;
                }
            }
        });
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

//ocx回调
function _onOcxEventProxy(data) {
    let ret = eval('(' + data + ')'); //每次操作acx都会回调这里，如点击关闭窗口回调此处，放回值如下
    if (ret.action == 'SelDisp') { //选择窗口的回调
        let gbcode = ret.data.szNodeID;
        let status = ret.data.dispStatus;
        vm.activeWinIndex = ret.data.nIndex;
        if (gbcode && status) {
            for (let i = 0; i < vm.playingDevice.length; i++) {
                if (vm.playingDevice[i].gbcode === gbcode) {
                    vm.playingDevice[i].nIndex = ret.data.nIndex;
                }
            }
        }
    } else if (ret.action == 'StopVideo') { //关闭监控的回调
        let gbcode = ret.data.szNodeID;
        for (let i = 0; i < vm.playingDevice.length; i++) { //删除vm.playingDevice中对应项
            if (vm.playingDevice[i].gbcode === gbcode) {
                vm.playingDevice.splice(i, 1);
                vm.activeWinTotal--;
            }
        }
        ztree = $.fn.zTree.getZTreeObj('sszhxt-spjk-polltree');
        let node = ztree.getNodeByParam("gbcode", gbcode, null);
        if (node && node.checked) { //去掉勾选
            ztree.checkNode(node, false, true, true);
            ztree.updateNode(node, false);
        }
    } else if (ret.action == 'FirstImageFrame') { //播放实时视频的回调
        let item = {
            "gbcode": ret.data.szNodeID,
            "nIndex": ret.data.nIndex
        }
        vm.playingDevice.push(item); //将新监控的设备的gbcode与播放窗口号加入vm.playingDevice中
    } else if (ret.action == 'CapturePicture') { // 截图保存路径提示
        if (ret.code == 0) {
            showTips('success', getLanSSZH().screenshotS + ret.data.picPath, '', 3000);
        } else {
            showTips('error', getLanSSZH().screenshotF + ret.code, '', 3000);
        }
    } else if (ret.action == 'StopLocalRecord') { //录像保存路径提示
        if (ret.code === 0) {
            showTips('success', getLanSSZH().videoS + ret.data.szLocalRecordPath, '', 3000);
        } else {
            showTips('error', getLanSSZH().videoF + ret.code, '', 3000);
        }
    } else if (ret.action == 'SSInvalid') { // 流媒体服务网络中断超时
        let code = player.logoffBeSSInvalid(ret.data.nSSIndex);
        if (0 === code) {
            if (reloginTime > 2) {
                reloginTime = 0;
                showTips('warn', getLanSSZH().mediaTimeout + ret.code + '，请重试', '', 3000);
            } else {
                reloginTime++;
                let cd = player.login(video.server);
                if (cd != 0) {
                    showTips('error', getLan().mediaLoginF + cd);
                    let node = video.server.node;
                    if (node && node.checked) { //去掉勾选
                        ztree.checkNode(node, false, true, true);
                        ztree.updateNode(node, false);
                        vm.activeWinTotal--;
                    }
                    return;
                }
                code = player.playRec(video.server); //实时点流
                if (code == -2) { //表示登录失败
                    showTips('error', getLan().loginF);
                    if (node && node.checked) { //去掉勾选
                        ztree.checkNode(node, false, true, true);
                        ztree.updateNode(node, false);
                        vm.activeWinTotal--;
                    }
                    return;
                }
            }
        }
    } else {
        // alert(JSON.stringify(ret))
    }
}

/**
 * 显示提示消息
 * @param {*} type 
 * @param {*} content 
 * @param {*} layout 
 */
function showTips(type, content, layout, duration) {
    notification[type]({
        title: getLanSSZH().notification,
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}

function setVideoHeight() {
    vm.videoHeight = $('.spjk-main-container').height() - 48;
}

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function getLan() {
    return language_txt.sszhxt.sszhxt_spjk;
}

function getLanSSZH() {
    return language_txt.sszhxt.sszhxt_sszh;
}