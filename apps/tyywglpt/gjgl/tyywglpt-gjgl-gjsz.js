/*
 * @Author: chenjinxing 
 * @Date: 2019-01-08 17:56:41 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-26 19:11:58
 */

import {
    notification
} from "ane";
import ajax from "/services/ajaxService";

export const name = "tyywglpt-gjgl-gjsz";
require("./tyywglpt-gjgl-gjsz.less");
require('/apps/common/common-rate-input');
let gjgl_gjsz_vm;

avalon.component(name, {
    template: __inline("./tyywglpt-gjgl-gjsz.html"),
    defaults: {
        //新增JS
        switchSOS: false, //告警总开关 默认false
        deviceSOS: [], //保存是否勾选
        qzpz_fresh_tips_show: false,
        timer: 0,
        alertSign: false, // 是否已经有弹窗
        initUID_ws: '',
        initUID_ts: '',
        initUID_server: '',
        info_init: false, //初始化接口完成的判断标志
        tree_init_all: 0, //三棵部门树都初始化完成的判断标志
        customThreshold: { //自定义阀值
            "STORAGE_SOS": "", //存储阀值告警
            "CPU_SOS": "", //CPU阀值告警
            "MEMORY_SOS": "", //内存阀值告警
            "TS_STORAGE_SOS": "", //存储服务器存储阀值告警
            "TS_CPU_SOS": "", //存储服务器CPU阀值告警
            "TS_MEMORY_SOS": "", //存储服务器内存阀值告警
            "SERVER_CPU_SOS": "", //系统服务CPU阀值告警
            "SERVER_MEMORY_SOS": "" ,//系统服务内存阀值告警
            "MATCH_THRESHOLD":"",//执法业务信息未进行关联阀值告警--天
            "DURATION_THRESHOLD":"",//拍摄时长阀值告警--小时/每天
            "OFFLINE_SOS":"",//采集工作站告警设置--离线告警阀值告警
        },
        handleCheckboxChange(e) {
            let tar = e.target;
            // if (tar.value == "OFFLINE_SOS" || tar.value == "TS_OFFLINE_SOS" || tar.value == "SERVER_OFFLINE_SOS") {
            if (tar.value == "TS_OFFLINE_SOS" || tar.value == "SERVER_OFFLINE_SOS") {
                return;
            }
            let oInput = tar.nextSibling.nextSibling.nextSibling.children[1];
            tar.checked === false ? oInput.disabled = 'disabled' : oInput.disabled = false;
        },
        getPersonByOrgId(orgid, flag) {
            let url = '/gmvcs/uap/user/find/terminal/by/org?orgId=' + orgid;
            ajax({
                url: url,
                method: 'get'
            }).then(result => {
                if (result.data) {
                    if (result.data) {
                        let r = result.data;
                        let optJs = [];
                        for (let i = 0; i < r.length; i++) {
                            optJs[i] = new Object();
                            optJs[i].label = r[i].userName + '(' + r[i].userCode + ')';
                            optJs[i].value = r[i].uid;
                        }
                        gjszTools.person['dep_tree_person_' + flag].options = optJs;
                        if (optJs.length == 0) {
                            let obj = {
                                label: "暂无可选人员",
                                value: "",
                            }
                            optJs.push(obj);
                            gjszTools.person['dep_tree_person_' + flag].selValue = [optJs[0].value];
                            return;
                        }
                        if (gjgl_gjsz_vm['initUID_' + flag]) {
                            gjszTools.person['dep_tree_person_' + flag].selValue = [gjgl_gjsz_vm['initUID_' + flag]];
                            gjszTools.person['dep_tree_person_' + flag].curValue = gjgl_gjsz_vm['initUID_' + flag]; //用于初始化时保存使用
                        } else {
                            let obj = {
                                label: "",
                                value: "",
                            }
                            optJs.unshift(obj);
                            gjszTools.person['dep_tree_person_' + flag].selValue = [optJs[0].value];
                            return;
                        }
                    }
                }
            });
        },
        // 保存权重配置数据
        saveBtn() {
            let switchSOS = gjgl_gjsz_vm.switchSOS; //告警总开关
            let customThreshold = gjgl_gjsz_vm.customThreshold; //自定义阀值
            let cjzSOS = {//是否勾选
                "offline": false,
                "strage": false,
                "cpu": false,
                "memory": false,
                "ts_offline": false,
                "ts_strage": false,
                "ts_cpu": false,
                "ts_memory": false,
                "server_offline": false,
                "server_cpu": false,
                "server_memory": false,
                "match_threshold":false,
                "duration_threshold":false
            };
            gjgl_gjsz_vm.deviceSOS.forEach(val => {
                switch (val) {
                    //采集站
                    case 'OFFLINE_SOS': //离线告警 开关
                        cjzSOS.offline = true;
                        break;
                    case 'STORAGE_SOS': //存储阀值 开关
                        cjzSOS.strage = true;
                        break;
                    case 'CPU_SOS': //cpu阀值 开关
                        cjzSOS.cpu = true;
                        break;
                    case 'MEMORY_SOS': //内存阀值 开关
                        cjzSOS.memory = true;
                        break;
                        //存储服务器
                    case 'TS_OFFLINE_SOS': //离线告警 开关
                        cjzSOS.ts_offline = true;
                        break;
                    case 'TS_STORAGE_SOS': //存储阀值 开关
                        cjzSOS.ts_strage = true;
                        break;
                    case 'TS_CPU_SOS': //cpu阀值 开关
                        cjzSOS.ts_cpu = true;
                        break;
                    case 'TS_MEMORY_SOS': //内存阀值 开关
                        cjzSOS.ts_memory = true;
                        break;
                        //系统服务
                    case 'SERVER_OFFLINE_SOS': //服务停止 开关
                        cjzSOS.server_offline = true;
                        break;
                    case 'SERVER_CPU_SOS': //cpu阀值 开关
                        cjzSOS.server_cpu = true;
                        break;
                    case 'SERVER_MEMORY_SOS': //内存阀值 开关
                        cjzSOS.server_memory = true;
                        break;
                    case 'MATCH_THRESHOLD': //未关联天数阀值 开关
                        cjzSOS.match_threshold = true;
                        break;
                    case 'DURATION_THRESHOLD': //拍摄时长阀值 开关
                        cjzSOS.duration_threshold = true;
                        break;
                    case 'MATCH_THRESHOLD': //采集工作站告警阀值 开关
                        cjzSOS.offline = true;
                        break;
                    default:
                        break;
                }
            });
            let uid_ws = gjszTools.person.dep_tree_person_ws.curValue,
                uid_ts = gjszTools.person.dep_tree_person_ts.curValue,
                uid_server = gjszTools.person.dep_tree_person_server.curValue;

            var reg = new RegExp(/^[1-9]([0-9]{0,3})$/);
            //采集站
            if (cjzSOS.cpu) {
                if (!reg.test(customThreshold.CPU_SOS)) {
                    warnTip('请正确填写自定义CPU阀值');
                    return;
                }
            }
            if (cjzSOS.memory) {
                if (!reg.test(customThreshold.MEMORY_SOS)) {
                    warnTip('请正确填写自定义内存阀值');
                    return;
                }
            }
            if (cjzSOS.strage) {
                if (!reg.test(customThreshold.STORAGE_SOS)) {
                    warnTip('请正确填写自定义存储阀值');
                    return;
                }
            }
            //存储服务器
            if (cjzSOS.ts_cpu) {
                if (!reg.test(customThreshold.TS_CPU_SOS)) {
                    warnTip('请正确填写自定义CPU阀值');
                    return;
                }
            }
            if (cjzSOS.ts_memory) {
                if (!reg.test(customThreshold.TS_MEMORY_SOS)) {
                    warnTip('请正确填写自定义内存阀值');
                    return;
                }
            }
            if (cjzSOS.ts_strage) {
                if (!reg.test(customThreshold.TS_STORAGE_SOS)) {
                    warnTip('请正确填写自定义存储阀值');
                    return;
                }
            }
            //系统服务
            if (cjzSOS.server_cpu) {
                if (!reg.test(customThreshold.SERVER_CPU_SOS)) {
                    warnTip('请正确填写自定义CPU阀值');
                    return;
                }
            }
            if (cjzSOS.server_memory) {
                if (!reg.test(customThreshold.SERVER_MEMORY_SOS)) {
                    warnTip('请正确填写自定义内存阀值');
                    return;
                }
            }
            if (!uid_ws) {
                errorTip('采集工作站人员不能为空');
                return;
            }
            if (!uid_ts) {
                errorTip('存储服务器人员不能为空');
                return;
            }
            if (!uid_server) {
                errorTip('系统服务人员不能为空');
                return;
            }
            if (cjzSOS.duration_threshold) {
                if (!/^\d*\.{0,1}\d{0,1}$/.test(customThreshold.DURATION_THRESHOLD)) {
                    warnTip('请正确填写拍摄时长，最多一位小数值！');
                    return;
                }
            }
            if (cjzSOS.match_threshold) {
                if (!/^\d$/.test(customThreshold.MATCH_THRESHOLD)) {
                    warnTip('请正确填写未关联天数，只能整数！');
                    return;
                }
            }
            if (cjzSOS.offline) {
                if (!/^\d*\.{0,1}\d{0,1}$/.test(customThreshold.OFFLINE_SOS)) {
                    warnTip('请正确填写采集工作站离线告警阀值，最多一位小数值！');
                    return;
                }
            }
            let params = {
                // "ID": "string",
                // "id": "string",
                "serverCPU": cjzSOS.server_cpu ? customThreshold.SERVER_CPU_SOS : '-1',
                "serverMemory": cjzSOS.server_memory ? customThreshold.SERVER_MEMORY_SOS : '-1',
                "serverSosUid": uid_server,
                "serverStop": cjzSOS.server_offline ? '1' : '-1',
                "tsCPU": cjzSOS.ts_cpu ? customThreshold.TS_CPU_SOS : '-1',
                "tsMemory": cjzSOS.ts_memory ? customThreshold.TS_MEMORY_SOS : '-1',
                "tsOffline": cjzSOS.ts_offline ? '1' : '-1',
                "tsSosUid": uid_ts,
                "tsStorage": cjzSOS.ts_strage ? customThreshold.TS_STORAGE_SOS : '-1',
                "wsSosUid": uid_ws,
                "sosSwitch": switchSOS ? '1' : '-1',
                "wsOffline": cjzSOS.offline ? '1' : '-1',
                "wsOfflineDurationThreshold":cjzSOS.offline ? Number(customThreshold.OFFLINE_SOS) : '-1',
                "wsCPU": cjzSOS.cpu ? customThreshold.CPU_SOS : '-1',
                "wsMemory": cjzSOS.memory ? customThreshold.MEMORY_SOS : '-1',
                "wsStorage": cjzSOS.strage ? customThreshold.STORAGE_SOS : '-1',
                "bizMatchSwitch":cjzSOS.match_threshold ? '1' : '-1',
                "shootDurationSwitch":cjzSOS.duration_threshold ? '1' : '-1',
                "matchThreshold":cjzSOS.match_threshold ? Number(customThreshold.MATCH_THRESHOLD) : '-1',
                "durationThreshold":cjzSOS.duration_threshold ? Number(customThreshold.DURATION_THRESHOLD) : '-1'
            };
            ajax({
                url: '/gmvcs/operation/sos/setting/save',
                method: 'post',
                data: params
            }).then(result => {
                if (result.code != 0) {
                    errorTip('服务器后端错误，请联系管理员');
                    return;
                } else {
                    notification.success({
                        message: '保存成功！',
                        title: '通知'
                    });
                }
            });
        },
        //获取  采集工作站告警设置
        getConfigInfo() {
            // 初始化设置
            gjgl_gjsz_vm.deviceSOS = [];
            gjgl_gjsz_vm.customThreshold = { //自定义阀值
                    "STORAGE_SOS": "", //采集站存储阀值告警
                    "CPU_SOS": "", //采集站CPU阀值告警
                    "MEMORY_SOS": "", //采集站内存阀值告警
                    "TS_STORAGE_SOS": "", //存储服务器存储阀值告警
                    "TS_CPU_SOS": "", //存储服务器CPU阀值告警
                    "TS_MEMORY_SOS": "", //存储服务器内存阀值告警
                    "SERVER_CPU_SOS": "", //系统服务CPU阀值告警
                    "SERVER_MEMORY_SOS": "", //系统服务内存阀值告警
                    "MATCH_THRESHOLD":"",//执法业务信息未进行关联阀值告警--天
                    "DURATION_THRESHOLD":"",//拍摄时长阀值告警--小时/每天
                    "OFFLINE_SOS":"",//采集工作站告警设置--离线告警阀值告警
                },
                ajax({
                    url: '/gmvcs/operation/sos/setting/list',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        errorTip('服务器后端错误，请联系管理员');
                        return;
                    }
                    //初始化 告警设置界面参数
                    if (result.data.sosSwitch == '1') {
                        this.switchSOS = true;
                        honeySwitch.showOn("#sosSwitch"); //总开关
                        $(".switch-on .slider").html('开');
                    } else {
                        this.switchSOS = false;
                        honeySwitch.showOff("#sosSwitch");
                        $(".switch-off .slider").html('关');
                        this.addMask();
                        $(".tyywglpt-gjgl-gjsz .panel-total").addClass("panel-default-mask");
                    }
                    //未关联天数
                    if (result.data.bizMatchSwitch == '1') {
                        gjgl_gjsz_vm.deviceSOS.push('MATCH_THRESHOLD'); //离线开关
                        gjgl_gjsz_vm.customThreshold.MATCH_THRESHOLD = result.data.matchThreshold; //自定义未关联阀值数字
                    }
                    //拍摄时长
                    if (result.data.shootDurationSwitch  == '1') {
                        gjgl_gjsz_vm.deviceSOS.push('DURATION_THRESHOLD'); //离线开关
                        gjgl_gjsz_vm.customThreshold.DURATION_THRESHOLD = result.data.durationThreshold; //自定义拍摄时长阀值数字
                    }
                    //采集站
                    if (result.data.wsOffline == '1') {
                        gjgl_gjsz_vm.deviceSOS.push('OFFLINE_SOS'); //离线开关
                        gjgl_gjsz_vm.customThreshold.OFFLINE_SOS = result.data.wsOfflineDurationThreshold; //自定义采集工作站--离线告警阀值数字
                    }
                    if (result.data.wsStorage > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('STORAGE_SOS');
                        gjgl_gjsz_vm.customThreshold.STORAGE_SOS = result.data.wsStorage; //自定义存储阀值数字
                    }
                    if (result.data.wsCPU > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('CPU_SOS');
                        gjgl_gjsz_vm.customThreshold.CPU_SOS = result.data.wsCPU;
                    }
                    if (result.data.wsMemory > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('MEMORY_SOS');
                        gjgl_gjsz_vm.customThreshold.MEMORY_SOS = result.data.wsMemory;
                    }
                    //存储服务器
                    if (result.data.tsOffline == '1') {
                        gjgl_gjsz_vm.deviceSOS.push('TS_OFFLINE_SOS'); //离线开关
                    }
                    if (result.data.tsStorage > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('TS_STORAGE_SOS');
                        gjgl_gjsz_vm.customThreshold.TS_STORAGE_SOS = result.data.tsStorage; //自定义存储阀值数字
                    }
                    if (result.data.tsCPU > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('TS_CPU_SOS');
                        gjgl_gjsz_vm.customThreshold.TS_CPU_SOS = result.data.tsCPU;
                    }
                    if (result.data.tsMemory > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('TS_MEMORY_SOS');
                        gjgl_gjsz_vm.customThreshold.TS_MEMORY_SOS = result.data.tsMemory;
                    }
                    //系统服务
                    if (result.data.serverStop == '1') {
                        gjgl_gjsz_vm.deviceSOS.push('SERVER_OFFLINE_SOS'); //离线开关
                    }
                    if (result.data.serverCPU > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('SERVER_CPU_SOS');
                        gjgl_gjsz_vm.customThreshold.SERVER_CPU_SOS = result.data.serverCPU;
                    }
                    if (result.data.serverMemory > 0) {
                        gjgl_gjsz_vm.deviceSOS.push('SERVER_MEMORY_SOS');
                        gjgl_gjsz_vm.customThreshold.SERVER_MEMORY_SOS = result.data.serverMemory;
                    }
                    //UserName
                    if (result.data.wsUserName) {
                        gjszTools.person.dep_tree_person_ws.selLabel = result.data.wsUserName + '(' + result.data.wsUserCode + ')';
                    }
                    if (result.data.tsUserName) {
                        gjszTools.person.dep_tree_person_ts.selLabel = result.data.tsUserName + '(' + result.data.tsUserCode + ')';
                    }
                    if (result.data.serverUserName) {
                        gjszTools.person.dep_tree_person_server.selLabel = result.data.serverUserName + '(' + result.data.serverUserCode + ')';
                    }
                    //SosUid
                    if (result.data.wsSosUid) {
                        gjgl_gjsz_vm.initUID_ws = result.data.wsSosUid;
                    }
                    if (result.data.tsSosUid) {
                        gjgl_gjsz_vm.initUID_ts = result.data.tsSosUid;
                    }
                    if (result.data.serverSosUid) {
                        gjgl_gjsz_vm.initUID_server = result.data.serverSosUid;
                    }
                    //treeData
                    for (let i = 0; i < 3; i++) {
                        let treeVm = 'gjsz_tree_vm_' + gjszTools.flag[i];
                        gjszTools.tree[treeVm].tree_code = result.data[gjszTools.flag[i] + 'Path'] || gjszTools.tree[treeVm].tree_code;
                        gjszTools.tree[treeVm].tree_key = result.data[gjszTools.flag[i] + 'OrgId'] || gjszTools.tree[treeVm].tree_key;
                        gjszTools.tree[treeVm].tree_title = result.data[gjszTools.flag[i] + 'Title'] || gjszTools.tree[treeVm].tree_title;
                    }
                    gjgl_gjsz_vm.info_init = true;
                });
        },
        onInit(e) {
            gjgl_gjsz_vm = e.vmodel;
            window.hadSaveKhqktjConf = false; // hadSaveKhqktjConf 是否保存权重配置数据
            honeySwitch.init();
            switchEvent("#sosSwitch", function () { //告警总开关 执行方法
                gjgl_gjsz_vm.switchSOS = true; //开
                $(".tyywglpt-gjgl-gjsz .panel-total").removeClass("panel-default-mask");
            }, function () {
                gjgl_gjsz_vm.switchSOS = false; //关 
                $(".tyywglpt-gjgl-gjsz .panel-total").addClass("panel-default-mask");
            });
            this.$watch('switchSOS', (v) => {
                if (!v) {
                    this.addMask();
                }
            });
            $(window).resize(function () { //当浏览器大小变化时
                if (!gjgl_gjsz_vm.switchSOS) {
                    gjgl_gjsz_vm.addMask();
                }
            });
            // $(document).bind("keydown", function (event) {
            //     var ev = window.event || event;
            //     var code = ev.keyCode || ev.which;
            //     if (code == 116) {
            //         if (ev.preventDefault) {
            //             ev.preventDefault();
            //         } else {
            //             ev.keyCode = 0;
            //             ev.returnValue = false;
            //         }

            //         if (_this.qzpz_fresh_tips_show)
            //             return;

            //         _this.qzpz_fresh_tips_show = true;

            //         $("#iframe_zfsyps").css({
            //             "opacity": 0
            //         });
            //         setTimeout(function () {
            //             $("#iframe_zfsyps").css({
            //                 "opacity": 1
            //             });
            //             $("#iframe_zfsyps").show();
            //         }, 600);
            //     }
            // });
        },
        onReady() {
            let deptemp = [];
            this.$watch("tree_init_all", (v) => {
                if (v == 3) {
                    this.getConfigInfo();
                    for (let i = 0; i < 3; i++) {
                        let treeVm = 'gjsz_tree_vm_' + gjszTools.flag[i];
                        gjgl_gjsz_vm.getPersonByOrgId(gjszTools.tree[treeVm].tree_key, gjszTools.flag[i]); //参数是orgId
                    }
                }
            });
            this.$watch("info_init", (v) => {
                if (v && gjgl_gjsz_vm.info_init) {
                    for (let i = 0; i < 3; i++) {
                        let treeVm = 'gjsz_tree_vm_' + gjszTools.flag[i];
                        gjgl_gjsz_vm.getPersonByOrgId(gjszTools.tree[treeVm].tree_key, gjszTools.flag[i]); //参数是orgId
                    }
                }
            });
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    errorTip('');
                    return;
                }
                getDepTree(result.data, deptemp);
                for (let i = 0; i < 3; i++) {
                    let treeVm = 'gjsz_tree_vm_' + gjszTools.flag[i];
                    gjszTools.tree[treeVm].tree_data = deptemp;
                    gjszTools.tree[treeVm].tree_code = deptemp[0].path;
                    gjszTools.tree[treeVm].tree_key = deptemp[0].key;
                    gjszTools.tree[treeVm].tree_title = deptemp[0].title;
                    gjgl_gjsz_vm.tree_init_all++;
                }
            });
        },
        onDispose() {

        },
        // f5刷新页面提示弹窗
        qzpz_fresh_tips: avalon.define({
            $id: "qzpz_fresh_tips",
            title: "提示",
            dialog_txt: "是否确认离开此页面？"
        }),
        onOk() {
            this.back();
            $("#iframe_zfsyps").hide();
            this.qzpz_fresh_tips_show = false;
        },
        cancel() {
            $("#iframe_zfsyps").hide();
            this.qzpz_fresh_tips_show = false;
        },
        move_return(a, b) {
            let _this = this;
            $("#iframe_zfsyps").css({
                width: "300px",
                height: "175px",
                left: a,
                top: b
            });
        },
        regNum(flag, val) {
            var reg = new RegExp(/^[1-9]([0-9]{0,3})$/);
            if (!reg.test(val)) {
                switch (flag) {
                    //采集站
                    case "STORAGE_SOS":
                        this.customThreshold.STORAGE_SOS = val.substring(0, val.length - 1);
                        break;
                    case "CPU_SOS":
                        this.customThreshold.CPU_SOS = val.substring(0, val.length - 1);
                        break;
                    case "MEMORY_SOS":
                        this.customThreshold.MEMORY_SOS = val.substring(0, val.length - 1);
                        break;
                        //存储服务器
                    case "TS_STORAGE_SOS":
                        this.customThreshold.TS_STORAGE_SOS = val.substring(0, val.length - 1);
                        break;
                    case "TS_CPU_SOS":
                        this.customThreshold.TS_CPU_SOS = val.substring(0, val.length - 1);
                        break;
                    case "TS_MEMORY_SOS":
                        this.customThreshold.TS_MEMORY_SOS = val.substring(0, val.length - 1);
                        break;
                        //系统服务
                    case "SERVER_CPU_SOS":
                        this.customThreshold.SERVER_CPU_SOS = val.substring(0, val.length - 1);
                        break;
                    case "SERVER_MEMORY_SOS":
                        this.customThreshold.SERVER_MEMORY_SOS = val.substring(0, val.length - 1);
                        break;
                }
            }
        },
        addMask() {
            let totalHeight = $(".tyywglpt-gjgl-gjsz .panel-total").outerHeight();
            $(".gjgl-gjsz .panel .panel-body-default").css({
                "top": '65px',
                "height": totalHeight + 'px',
            });
        }
    }
});

// 获取部门树
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

// 错误提示信息
function errorTip(message, title) {
    notification.error({
        message: message,
        title: title || '通知'
    });
}

// 警告提示信息
function warnTip(message, title) {
    notification.warn({
        message: message,
        title: title || '通知'
    });
}

//告警总开关
var honeySwitch = {};
honeySwitch.themeColor = "rgb(58, 205, 137)";
honeySwitch.init = function () {
    var s = "<span class='slider'>关</span>";
    $("[class^=switch]").append(s);
    $("[class^=switch]").click(function () {
        if ($(this).hasClass("switch-disabled")) {
            return;
        }
        if ($(this).hasClass("switch-on")) {
            $(this).removeClass("switch-on").addClass("switch-off");
            $(".switch-off .slider").html('关');
            $(".switch-off").css({
                'border-color': '#dfdfdf',
                'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                'background-color': 'rgb(255, 255, 255)'
            });
        } else {
            $(this).removeClass("switch-off").addClass("switch-on");
            $(".switch-on .slider").html('开');
            if (honeySwitch.themeColor) {
                var c = honeySwitch.themeColor;
                $(this).css({
                    'border-color': c,
                    'box-shadow': c + ' 0px 0px 0px 16px inset',
                    'background-color': c
                });
            }
            if ($(this).attr('themeColor')) {
                var c2 = $(this).attr('themeColor');
                $(this).css({
                    'border-color': c2,
                    'box-shadow': c2 + ' 0px 0px 0px 16px inset',
                    'background-color': c2
                });
            }
        }
    });
    window.switchEvent = function (ele, on, off) {
        $(ele).click(function () {
            if ($(this).hasClass("switch-disabled")) {
                return;
            }
            if ($(this).hasClass('switch-on')) {
                if (typeof on == 'function') {
                    on();
                }
            } else {
                if (typeof off == 'function') {
                    off();
                }
            }
        });
    }
    if (this.themeColor) {
        var c = this.themeColor;
        $(".switch-on").css({
            'border-color': c,
            'box-shadow': c + ' 0px 0px 0px 16px inset',
            'background-color': c
        });
        $(".switch-off").css({
            'border-color': '#dfdfdf',
            'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
            'background-color': 'rgb(255, 255, 255)'
        });
    }
    if ($('[themeColor]').length > 0) {
        $('[themeColor]').each(function () {
            var c = $(this).attr('themeColor') || honeySwitch.themeColor;
            if ($(this).hasClass("switch-on")) {
                $(this).css({
                    'border-color': c,
                    'box-shadow': c + ' 0px 0px 0px 16px inset',
                    'background-color': c
                });
            } else {
                $(".switch-off").css({
                    'border-color': '#dfdfdf',
                    'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                    'background-color': 'rgb(255, 255, 255)'
                });
            }
        });
    }
};
honeySwitch.showOn = function (ele) {
    $(ele).removeClass("switch-off").addClass("switch-on");
    if (honeySwitch.themeColor) {
        var c = honeySwitch.themeColor;
        $(ele).css({
            'border-color': c,
            'box-shadow': c + ' 0px 0px 0px 16px inset',
            'background-color': c
        });
    }
    if ($(ele).attr('themeColor')) {
        var c2 = $(ele).attr('themeColor');
        $(ele).css({
            'border-color': c2,
            'box-shadow': c2 + ' 0px 0px 0px 16px inset',
            'background-color': c2
        });
    }
}
honeySwitch.showOff = function (ele) {
    $(ele).removeClass("switch-on").addClass("switch-off");
    $(".switch-off").css({
        'border-color': '#dfdfdf',
        'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
        'background-color': 'rgb(255, 255, 255)'
    });
}

let gjszTools = {
    flag: ['ws', 'ts', 'server'], //ws:采集站，ts:存储服务器，server:系统服务
    //部门树
    tree: {
        //采集工作站部门树
        gjsz_tree_vm_ws: avalon.define({
            $id: "tyywglpt_gjsz_tree_ws",
            tree_data: [],
            tree_key: "",
            tree_title: "",
            tree_code: "",
            curTree: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.curTree = e.node.path;
                gjgl_gjsz_vm.getPersonByOrgId(e.node.key, 'ws'); //参数是orgId
            },
            extraExpandHandle(treeId, treeNode, selectedKey) {
                gjszTools.findChildrenNodes(treeId, treeNode, selectedKey);
            }
        }),
        //存储服务器部门树
        gjsz_tree_vm_ts: avalon.define({
            $id: "tyywglpt_gjsz_tree_ts",
            tree_data: [],
            tree_key: "",
            tree_title: "",
            tree_code: "",
            curTree: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.curTree = e.node.path;
                gjgl_gjsz_vm.getPersonByOrgId(e.node.key, 'ts'); //参数是orgId
            },
            extraExpandHandle(treeId, treeNode, selectedKey) {
                gjszTools.findChildrenNodes(treeId, treeNode, selectedKey);
            }
        }),
        //系统服务部门树
        gjsz_tree_vm_server: avalon.define({
            $id: "tyywglpt_gjsz_tree_server",
            tree_data: [],
            tree_key: "",
            tree_title: "",
            tree_code: "",
            curTree: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.curTree = e.node.path;
                gjgl_gjsz_vm.getPersonByOrgId(e.node.key, 'server'); //参数是orgId
            },
            extraExpandHandle(treeId, treeNode, selectedKey) {
                gjszTools.findChildrenNodes(treeId, treeNode, selectedKey);
            }
        }),
    },
    //人员
    person: {
        //采集工作站部门树人员
        dep_tree_person_ws: avalon.define({
            $id: 'gjgl_gjsz_person_ws',
            selValue: [],
            options: [],
            curValue: '',
            selLabel: '',
            halderChange(event) {
                this.curValue = event.target.value; //uid
                this.selLabel = gjszTools.findSelLabel(this.curValue, this.options);
            }
        }),
        //存储服务器部门树人员
        dep_tree_person_ts: avalon.define({
            $id: 'gjgl_gjsz_person_ts',
            selValue: [],
            options: [],
            curValue: '',
            selLabel: '',
            halderChange(event) {
                this.curValue = event.target.value; //uid
                this.selLabel = gjszTools.findSelLabel(this.curValue, this.options);
            }
        }),
        //系统服务部门树人员
        dep_tree_person_server: avalon.define({
            $id: 'gjgl_gjsz_person_server',
            selValue: [],
            options: [],
            curValue: '',
            selLabel: '',
            halderChange(event) {
                this.curValue = event.target.value; //uid
                this.selLabel = gjszTools.findSelLabel(this.curValue, this.options);
            }
        }),
    },
    //公共方法
    /**
     * @description: 根据value值找到对应的label值
     * @param {string} val
     * @param {Array} options
     * @return: 选中的label值
     */
    findSelLabel(val, options) {
        let selLabel = '';
        options.filter((item) => {
            if (item.value === val) {
                selLabel = item.label;
            }
        });
        return selLabel;
    },
    /**
     * @description: 部门树根据父节点找到子节点
     * @param {string} treeId
     * @param {object} treeNode
     * @param {string} selectedKey
     * @return: 
     * 
     */
    findChildrenNodes(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                errorTip(result.msg);
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
}