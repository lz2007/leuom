/**
 * 上传按钮组件
 * @prop  {Object}      business         一个对象，内含元素type和code。type :0 警情 1案件 2简易程序 3强制措施 4非现场 5事故处理; code 警情编号或者案件编号
 * @prop  {Boolean}     dialog_show      上传文件弹窗显示隐藏控制变量
 * @event {Function}    cancelFunction   关闭上传文件弹窗的回调
 * @event {Function}    move_return      弹窗移动函数，用于调整弹窗下iframe大小位置，使弹窗不会被ocx遮挡
 * @example
 * ```
 * <ms-uploadBtn :widget="{business:@businessInfo, dialog_show:@uploadDialogShow, cancelFunction:@cancelFunction, move_return:@uploadMove}"></ms-uploadBtn>
 * ```
 */
import {
    notification
} from "ane";
import moment from 'moment';
import ajax from '../../services/ajaxService';
require('/apps/common/common-uploadBtn.less');
require('/vendor/jquery/jquery.lineProgressbar.js');
let storage = require('../../services/storageService.js').ret;

let upload_vm, globalOcxPlayer;
avalon.component('ms-uploadBtn', {
    template: __inline('./common-uploadBtn.html'),
    defaults: {
        is_IE: isIE_fuc(),
        dialog_show: avalon.noop,
        radio_dialog_show: false,
        cancelFunction: avalon.noop,
        move_return: avalon.noop,
        business: avalon.noop, //type :0 警情 1案件; code 警情编号或者案件编号
        uploadState: false,
        ajaxInfo: [],
        businessTypeName: "接处警",
        businessType: "01",
        tempFileType: "",
        getFileName: avalon.noop,

        dialogCancel() {
            for (let i = 1; i <= upload_vm.upload_dialog_vm.list.length; i++) {
                ftpUploadFileStop(i);
            }
            this.cancelFunction();
        },
        dialogOk() {},
        upload_dialog_vm: avalon.define({
            $id: 'upload_dialog',
            title: "上传文件",
            list: [],
            uploadFileNameArr: [],
            uploadClick(fileType) {
                if (upload_vm.business.type == 1) {
                    upload_vm.businessTypeName = "询问";
                    upload_vm.businessType = "02";
                    upload_vm.tempFileType = fileType;
                    upload_vm.radio_dialog_show = true;
                    $("#iframe_others").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_others").css({
                            "opacity": 1
                        });
                        $("#iframe_others").show();
                    }, 600);
                } else {
                    upload_vm.upload_dialog_vm.uploadFuc(fileType);
                    upload_vm.businessTypeName = "接处警";
                    upload_vm.businessType = "01";
                }
            },
            uploadFuc(fileType) {
                let data = {};
                data.action = 'SelectFileDlg';
                data['arguments'] = {};
                data['arguments']['folder'] = "";
                let ret = globalOcxPlayer.GS_ExtFunc(JSON.stringify(data));
                let ret_json = eval('(' + ret + ')');

                if (ret_json.code == 0) {
                    let uploadFilePath = ret_json.filePath; //ocx选择文件同步回调得到本地文件路径
                    let fileName = uploadFilePath.slice(uploadFilePath.lastIndexOf("\\") + 1, uploadFilePath.length); //文件名
                    let temp = fileName.slice(0, fileName.lastIndexOf(".")); //去除后缀的文件名
                    let suffix = fileName.slice(fileName.lastIndexOf("."), fileName.length); //后缀
                    let uploadFileName;

                    if (upload_vm.business.type == 1) {
                        uploadFileName = temp + "_" + upload_vm.businessTypeName + "_" + moment().format("YYYYMMDD") + "_" + moment().format("x") + suffix; //自定义上传文件成功后的文件名
                    } else {
                        uploadFileName = temp + "_" + moment().format("YYYYMMDD") + "_" + moment().format("x") + suffix; //自定义上传文件成功后的文件名
                    }

                    ajax({
                        url: "/gmvcs/uom/storage/workstation/storage/get",
                        method: 'get',
                        data: {}
                    }).then(result => {
                        if (result.code != 0) {
                            notification.error({
                                message: result.msg,
                                title: '通知'
                            });
                            return;
                        }

                        let proTemp = {
                            index: upload_vm.upload_dialog_vm.list.length + 1,
                            uploadFilePath,
                            fileName,
                            pro: "0",
                            ocxPath: result.data.ftpInfo + "/" + uploadFileName,
                            completed: false,
                        }
                        upload_vm.upload_dialog_vm.list.push(proTemp);
                        setProgressbar(upload_vm.upload_dialog_vm.list.length, 0);

                        let obj = {
                            fileName: uploadFileName, //文件名称
                            createTime: moment(ret_json.fileCreateTime).format("x"), //文件创建时间
                            size: parseInt(ret_json.fileSize, 16), //文件大小
                            type: fileType, //文件类型，0视频 1音频 2图片 3其他
                            orgCode: storage.getItem("orgCode"),
                            orgName: storage.getItem("orgName"),
                            userCode: storage.getItem("userCode"),
                            userName: storage.getItem("userName"),
                            businessType: upload_vm.business.type,
                            relevanceCode: upload_vm.business.code,
                            storagePath: result.data.storagePath,
                            storageId: result.data.storageId
                        }

                        if (upload_vm.business.type == 1) {
                            obj.clfl = upload_vm.businessType;
                        }

                        if (!upload_vm.uploadState) {
                            upload_vm.uploadState = true;
                            ftpUploadFile(upload_vm.upload_dialog_vm.list.length, uploadFilePath, proTemp.ocxPath);
                        }

                        upload_vm.ajaxInfo.push(obj);

                        this.uploadFileNameArr.push(uploadFileName);
                        // console.log(this.uploadFileNameArr);
                    });
                }
            }
        }),

        radioCancel() {
            upload_vm.radio_dialog_show = false;
            $("#iframe_others").hide();
        },
        radioOk() {
            upload_vm.radio_dialog_show = false;
            $("#iframe_others").hide();
            upload_vm.upload_dialog_vm.uploadFuc(upload_vm.tempFileType);
        },
        selectReturn: function (a, b) {
            $("#iframe_others").css({
                width: '450px',
                height: '220px',
                left: a,
                top: b
            });
        },

        dialog_radio_vm: avalon.define({
            $id: 'dialog_radio',
            title: "选择案件类型",
            checked: "1",
            radio_options: [{
                label: '询问',
                value: '1',
            }, {
                label: '讯问',
                value: '2',
            }, {
                label: '现场勘察',
                value: '3',
            }, {
                label: '送押',
                value: '4',
            }, {
                label: '辨认',
                value: '5',
            }, {
                label: '搜查',
                value: '6',
            }, {
                label: '其他',
                value: '7',
            }],
            radioChange(e) {
                switch (e.target.value) {
                    case "0":
                        upload_vm.businessTypeName = "接处警";
                        upload_vm.businessType = "01";
                        break;
                    case "1":
                        upload_vm.businessTypeName = "询问";
                        upload_vm.businessType = "02";
                        break;
                    case "2":
                        upload_vm.businessTypeName = "讯问";
                        upload_vm.businessType = "03";
                        break;
                    case "3":
                        upload_vm.businessTypeName = "现场勘察";
                        upload_vm.businessType = "04";
                        break;
                    case "4":
                        upload_vm.businessTypeName = "送押";
                        upload_vm.businessType = "05";
                        break;
                    case "5":
                        upload_vm.businessTypeName = "辨认";
                        upload_vm.businessType = "06";
                        break;
                    case "6":
                        upload_vm.businessTypeName = "搜查";
                        upload_vm.businessType = "07";
                        break;
                    case "7":
                        upload_vm.businessTypeName = "其他";
                        upload_vm.businessType = "08";
                        break;
                }
            }
        }),
        onInit: function (event) {
            upload_vm = event.vmodel;
            upload_vm.upload_dialog_vm.list = [];
            upload_vm.upload_dialog_vm.uploadFileNameArr = [];
            upload_vm.ajaxInfo = [];
        },
        initTimer: null,
        initCallbackTimer: null,
        onReady: function (event) {
            if (this.is_IE)
                globalOcxPlayer = document.getElementById('ocxIE');
            else
                globalOcxPlayer = document.getElementById('ocxFirefox');

            initOcx();

            this.$watch("dialog_show", (v) => {
                if (!v) {
                    this.uploadState = false;
                    this.getFileName(this.upload_dialog_vm.uploadFileNameArr);
                }
                upload_vm.upload_dialog_vm.list = [];
                upload_vm.ajaxInfo = [];
                upload_vm.upload_dialog_vm.uploadFileNameArr = [];
            });
            this.$fire('dialog_show', this.dialog_show);
        },
        onDispose: function (event) {
            clearTimeout(this.initTimer);
            clearTimeout(this.initCallbackTimer);
        }
    }
});

function setProgressbar(id, pro, fillBackgroundColor) { //设置进度条函数
    $('#progressbar' + id).LineProgressbar({
        percentage: pro, //进度条进度百分比，用数字即可
        fillBackgroundColor: fillBackgroundColor ? fillBackgroundColor : '#ffb400', //进度条颜色
        height: '30px', //进度条高度
        radius: '30px', //进度条圆角
        duration: 0, //进度条加载时间
    });
}

function isIE_fuc() { //判断当前是IE还是Firefox
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function initOcx() { //初始化ocx
    globalOcxPlayer.style.display = "block";

    let data = {};
    data.action = 'InitDeviceSdk'; //初始化
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    clearTimeout(upload_vm.initTimer);
    clearTimeout(upload_vm.initCallbackTimer);
    upload_vm.initCallbackTimer = setTimeout(() => {
        globalOcxPlayer.RegJsFunctionCallback(_onOcxEventProxy); //注册回调
    }, 100);

    upload_vm.initTimer = setTimeout(() => {
        data = {};
        data.action = 'InitPara'; //设置视图标识，作为每个视图回调事件的标识
        data['arguments'] = {};
        data['arguments']['ocxID'] = "ReplayView"; //用户自定义
        globalOcxPlayer.GS_RealTimeFunc(JSON.stringify(data));
    
        data = {};
        data.action = 'InitReplayWnd'; //创建录像视图
        data['arguments'] = {};
        data['arguments']['nDefaultSplit'] = 1;
        data['arguments']['nMaxSplit'] = 2;
        globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    
        data = {};
        data.action = 'SetReplayWindowStyle'; //隐藏录像播放控制条
        data['arguments'] = {};
        data['arguments']['nIndex'] = 1;
        globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    
        data = {};
        data.action = 'EnableToolBar'; //隐藏进度条
        data['arguments'] = {};
        data['arguments']['enable'] = 1;
        globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    }, 100);

    // data = {};
    // data.action = 'InitPara'; //设置视图标识，作为每个视图回调事件的标识
    // data['arguments'] = {};
    // data['arguments']['ocxID'] = "ReplayView"; //用户自定义
    // globalOcxPlayer.GS_RealTimeFunc(JSON.stringify(data));

    // data = {};
    // data.action = 'InitReplayWnd'; //创建录像视图
    // data['arguments'] = {};
    // data['arguments']['nDefaultSplit'] = 1;
    // data['arguments']['nMaxSplit'] = 2;
    // globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    // data = {};
    // data.action = 'SetReplayWindowStyle'; //隐藏录像播放控制条
    // data['arguments'] = {};
    // data['arguments']['nIndex'] = 1;
    // globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    // data = {};
    // data.action = 'EnableToolBar'; //隐藏进度条
    // data['arguments'] = {};
    // data['arguments']['enable'] = 1;
    // globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}

function ftpUploadFileStop(id) { //ocx停止上传函数
    let data = {};
    data.action = 'FtpUploadFileStop';
    data['arguments'] = {};
    data['arguments']['nFileIndex'] = id;
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}

function ftpUploadFile(id, localPath, serverPath) { //ocx上传文件函数
    let data = {};
    data.action = 'FtpUploadFile';
    data['arguments'] = {};
    data['arguments']['nFileIndex'] = id; //文件上传id，为了拿来对应停止和拿进度
    data['arguments']['strFilePath'] = localPath; //本地文件路径
    // data['arguments']['strRemotePath'] = "ftp://gosuncn:300098@10.10.9.169:5021/disk0/" + id; //上传到服务器的地址
    data['arguments']['strRemotePath'] = serverPath; //上传到服务器的地址

    let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    let ret_json = eval('(' + ret + ')');
    if (ret_json.code != 0) {
        notification.error({
            message: "上传文件失败，请稍后再试",
            title: '温馨提示'
        });
    }
}

function _onOcxEventProxy(data) { //ocx异步回调入口函数
    let ret = eval('(' + data + ')');
    if (ret.action == 'FtpUploadFile') {
        if (ret.code == -1) {
            notification.error({
                message: "网络连接中断",
                title: '温馨提示'
            });
            return;
        }

        upload_vm.upload_dialog_vm.list[ret.data.nFileIndex - 1].pro = ret.data.nProcess;

        if (ret.data.nProcess == 100) { //进度为100，下一个开始上传
            setProgressbar(ret.data.nFileIndex, ret.data.nProcess, "#0FB516");
            //保存上传文件信息
            let ajaxData = upload_vm.ajaxInfo[ret.data.nFileIndex - 1].$model;
            ajax({
                url: "/gmvcs/uom/storage/workstation/storage/saveFile",
                method: 'post',
                data: ajaxData
            }).then(result => {
                // console.log("保存上传成功信息到平台");
            });

            upload_vm.upload_dialog_vm.list[ret.data.nFileIndex - 1].completed = true;

            let count = 0;
            for (let i = 0; i < upload_vm.upload_dialog_vm.list.length; i++) {
                if (!upload_vm.upload_dialog_vm.list[i].completed) {
                    ftpUploadFile(upload_vm.upload_dialog_vm.list[i].index, upload_vm.upload_dialog_vm.list[i].uploadFilePath, upload_vm.upload_dialog_vm.list[i].ocxPath);
                    break;
                } else {
                    count++;
                }
            }

            if (count == upload_vm.upload_dialog_vm.list.length) {
                upload_vm.uploadState = false;
                notification.success({
                    message: "文件已全部上传成功！",
                    title: '温馨提示'
                });
            }
        } else {
            setProgressbar(ret.data.nFileIndex, ret.data.nProcess);
        }
    }
}