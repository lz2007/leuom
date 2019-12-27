/*
 * @Author: 陈锦兴
 * @Date: 2019-08-07 17:26:39
 * @LastEditTime: 2019-09-09 10:30:31
 * @Description: 
 */

import {
    notification
} from 'ane';
import ajax from '/services/ajaxService';
import * as menuServer from '/services/menuService';
let language_txt = require('../../../vendor/language').language;
import {
    Gm
} from '/apps/common/common-tools.js';
let {
    pzzzStatus,
    versionSelection,
    isBZ
} = require('/services/configService')
let storage = require('/services/storageService.js').ret;
require('/apps/common/common-uploadBtn');
require('./zfsypsjglpt-zfda-ajgl-detail_gongan.less');
export const name = 'zfsypsjglpt-zfda-ajgl-detail_gongan';
import Sbzygl from '/apps/common/common-sbzygl'; 
function GMTools() { };
GMTools.prototype = Object.create(new Gm().tool);
let Gm_tool = new GMTools();
let delete_ocx = require('/apps/common/common').delete_ocx; //---引入声明
let moment = require('moment');
let ajgl_ck_Man = null;
let ajglMan = null;
let gobackAddress = "";
let sbzygl = null;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-ajgl-detail_gongan.html'),
    defaults: {
        isBZ:isBZ,
        pzzzStatus: pzzzStatus,
        zfda:language_txt.zfsypsjglpt.zfda,
        authority: { // 按钮权限标识
            "CHECK_TJGL": false, //音视频库_执法档案_案件关联_添加关联
            "CHECK_SCGL": false, //音视频库_执法档案_案件关联_删除关联
            "CHECK_DOWNLOAD": false //音视频库_执法档案_案件关联_下载
        },
        $computed: {
            isNingxia() {
                return versionSelection === 'Ningxia';
            }
        },
        ajgl_back(e) {
            Object.keys(this.cjxxInfo.infomation).forEach((val, key) => {
                this.cjxxInfo.infomation[val] = '-';
            });
            if (this.ocxPlayer) {
                delete_ocx();
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
            }
            // avalon.history.setHash('/zfsypsjglpt-zfda-ajgl_gongan');
        },

        //所有类型媒体的集合
        glmt_type: ['jq_checked_data', 'cj_checked_data'],
        glmt_name: ['jq', 'cj'],

        //媒体标志 -- 目前在哪一类媒体上
        glmt_mark: 'cj',

        //关联媒体 -- 接警
        // jq_clickClass: 'glmt_jj', //按钮样式
        jq_data: [], //展示的关联媒体
        jq_checked_data: [], //该媒体选中的文件
        glmt_jq_show: false, //媒体切换
        glmt_jq(e) { //点击警情  
            Tools.clickGlmt('jq');
        },

        // 接处警 class
        jq_clickClass: 'glmt_jj',
        // 接处警 显示隐藏
        glmt_cj_show: true,
        // 轨迹定位 class
        cj_clickClass: 'glmt_cj',
        // 轨迹定位 显示隐藏
        glmt_map_Show: true,
        mapStyle: {
            top: 183,
            height: 400
        },
        //  轨迹定位传入数据
        mapAjaxData: {
            "deviceId": "", // 设备id
            "fileRid": "", // 文件Rid
            "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
            "beginTime": "", // 开始时间
            "endTime": "" // 结束时间
        },

        src: '',
        video_url: '',
        audio_url: '',
        ocxPlayer: false,
        loading: false,
        imgff: false,
        media_type: false,
        web_width: '',
        web_height: '',
        web_left: '',
        web_top: '',
        play_status: false,
        dialog_status: true,
        playingFile: '',

        nodata: false,

        //查看 -- 基本信息
        jbxx_clickClass: 'jbxx-btn',
        jbxx_show: true,
        jbxx(e) {
            this.jbxx_clickClass = 'jbxx-btn';
            this.cjxx_clickClass = 'cjxx-btn';
            this.jbxx_show = true;
            this.cjxx_show = false;
            Tools.reduceWordForJbxx();
        },
        jbxxInfo: avalon.define({
            $id: 'ajgl_jbxx_info',
            infomation: {} //基本信息的数据
        }),

        
        cjxxInfo: avalon.define({
            $id: 'ajgl_cjxx_info',
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            } //处警信息的数据
        }),


        //点击详细内容
        show_info: false,
        cancelInfo() {
            this.show_info = false;
            $('#gm_webplayer').css('z-index', 9999);
            $("#iframe_zfsyps").hide();
            $('.popover').hide();
        },
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: '980px', //---- 这个是弹窗的宽度
                height: '400px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        show_allInfo() {
            $('#gm_webplayer').css('z-index', 0);
            this.show_info = true;
            Tools.addShowInfo('showInfo');
            $("#iframe_zfsyps").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_zfsyps").css({
                    "opacity": 1
                });
                $("#iframe_zfsyps").show();
            }, 600);
            Tools.reduceWordForAllInfo();
        },

        // businessInfo: {
        //     type: 1,
        //     code: "AJ317107070700911399ff9e548615b4"
        // },
        businessInfo: {},
        uploadDialogShow: false,
        uploadClick() {
            this.uploadDialogShow = true;
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
        cancelFunction() {
            $("#iframe_zfsyps").hide();
            this.uploadDialogShow = false;

            Tools.searchCaseInfo(); //初始化基本信息和处警信息
        },
        uploadMove(a, b) {
            $("#iframe_zfsyps").css({
                width: '600px', //---- 这个是弹窗的宽度
                height: '400px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },

        download(e) {

            if (this.cj_checked_data.length > 0) {

                if (this.cj_checked_data.length > 1) {
                    Tools.sayWarn('单次下载只能选取一个媒体文件');
                } else {
                    let _this = this;
                    let checkIfOutDate = new Promise((resolve, reject) => {
                        ajax({
                            url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + _this.cj_checked_data[0].rid,
                            method: 'get',
                            data: null,
                            cache: false
                        }).then(ret => {

                            if (ret.code == 0) {

                                if (ret.data.saveTime == -2) {
                                    reject(new Error('过期文件不提供下载!'));
                                } else {
                                    resolve();
                                }
                            } else {
                                reject(new Error('获取文件下载路径失败!'));
                            }
                        });
                    });
                    checkIfOutDate.then(val => {
                        let download = new Promise((resolve, reject) => {
                            ajax({
                                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + _this.cj_checked_data[0].rid,
                                method: 'get',
                                data: null,
                                cache: false
                            }).then(ret => {

                                if (ret.code == 0) {
                                    resolve(ret);
                                } else {
                                    reject(new Error('获取文件下载路径失败!'));
                                }
                            });
                        });
                        download.then(ret => {

                            if (_this.cj_checked_data[0].type == '图片') {
                                Tools.downloadImg(ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL);
                            } else {

                                //除了图片可以判断存在与否，其他类媒体暂时没做预处理
                                if (ret.data[0].storageFileURL || ret.data[0].wsFileURL) {
                                    window.open(ret.data[0].storageFileURL || ret.data[0].wsFileURL);
                                } else {
                                    Tools.sayError('获取文件下载路径失败!');
                                }
                            }
                        }).catch(error => {
                            Tools.sayError(error.message);
                        });
                    }).catch(error => {
                        Tools.sayError(error.message);
                    });
                }
            } else {
                Tools.sayWarn('并未选择关联媒体文件');
            }
        },
        //判断该页面是六模块中哪个
        caseWebType: function () {
            let webType = sessionStorage.getItem("webType");
            let id = sessionStorage.getItem("ajgl_bh");
            //初始化图片地址
            zfdaDetail.show_img = false;
            zfdaDetail.play_url = "";
            //初始化存储天数和标注
            zfdaDetail.saveTime = "0天";
            zfdaDetail.biaozhuShow = false;
            switch (webType) {
                case 'ajgl':
                    this.ajShow = true;
                    zfdaDetail.rightInfo = [];
                    zfdaDetail.rightInfoTitle = '案件信息';
                    zfdaDetail.rightInfo.push({ title: "案件编号:  ", data: "-" });
                    zfdaDetail.rightInfo.push({ title: "受理单位:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "案件类别:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "办案人员:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "案件名称:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "报警内容:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "涉案人员:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "案发时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "案发事件:  ", data: "" });
                    Tools.searchCaseByAjbh(id);
                    //设置上传文件的业务关联类型
                    uploadWindow.businessInfo = {
                        type: 1,
                        code: sessionStorage.getItem("ajgl_bh")
                    }
                    break;
                case 'jqgl':
                    zfdaDetail.rightInfo = [];
                    zfdaDetail.rightInfoTitle = '警情信息';
                    zfdaDetail.rightInfo.push({ title: "警情编号:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "处警单位:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "处警人:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "处警时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "到达现场时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "报警来源:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "警情类别:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "报警内容:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "报警人:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "报警电话:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "报警时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "事发时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "事发地点:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "民警意见:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "关联案件:  ", data: "" });
                    Tools.searchMediaByJqbh(id);
                    //设置上传文件的业务关联类型
                    uploadWindow.businessInfo = {
                        type: 0,
                        code: sessionStorage.getItem("ajgl_bh")
                    }
                    break;
                case 'qzcs':
                    zfdaDetail.rightInfo = [];
                    zfdaDetail.rightInfoTitle = '强制措施信息';
                    zfdaDetail.rightInfo.push({ title: "执勤部门:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "执勤民警:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "凭证编号:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法地点:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "当事人:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "驾驶证号:  ", data: "-" });
                    zfdaDetail.rightInfo.push({ title: "车牌号码:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "号牌种类:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法行为:  ", data: "" });
                    Tools.searchQzcsByWfbh(id);
                    //设置上传文件的业务关联类型
                    uploadWindow.businessInfo = {
                        type: 3,
                        code: sessionStorage.getItem("ajgl_bh")
                    }
                    break;
                case 'jycx':
                    zfdaDetail.rightInfo = [];
                    zfdaDetail.rightInfoTitle = '简易程序信息';
                    zfdaDetail.rightInfo.push({ title: "执勤部门:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "执勤民警:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "决定书编号:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法地点:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "当事人:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "驾驶证号:  ", data: "-" });
                    zfdaDetail.rightInfo.push({ title: "车牌号码:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "号牌种类:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法行为:  ", data: "" });
                    Tools.searchJycxByWfbh(id);
                    //设置上传文件的业务关联类型
                    uploadWindow.businessInfo = {
                        type: 2,
                        code: sessionStorage.getItem("ajgl_bh")
                    }
                    break;
                case 'fxccf':
                    zfdaDetail.rightInfo = [];
                    zfdaDetail.rightInfoTitle = '非现场处罚信息';
                    zfdaDetail.rightInfo.push({ title: "执勤部门:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "执勤民警:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "车牌号码:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法编号:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "决定书编号:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法地点:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "违法行为:  ", data: "" });
                    Tools.searchFxccfByWfbh(id);
                    //设置上传文件的业务关联类型
                    uploadWindow.businessInfo = {
                        type: 4,
                        code: sessionStorage.getItem("ajgl_bh")
                    }
                    break;
                case 'sgcl':
                    zfdaDetail.rightInfo = [];
                    zfdaDetail.rightInfoTitle = '事故处理信息';
                    zfdaDetail.rightInfo.push({ title: "执勤部门:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "处理民警:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "事故发生时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "处理时间:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "事故地点:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "事故编号:  ", data: "" });
                    zfdaDetail.rightInfo.push({ title: "备注:  ", data: "" });
                    Tools.searchSgclByWfbh(id);
                    //设置上传文件的业务关联类型
                    uploadWindow.businessInfo = {
                        type: 5,
                        code: sessionStorage.getItem("ajgl_bh")
                    }
                    break;
                default:
                    break;

            }


        },
        //刷新离开
        back_confirm: false,
        move_return2(a, b) {
            $("#iframe_zfsyps").css({
                width: '299px', //---- 这个是弹窗的宽度
                height: '180px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        goback() {
            this.back_confirm = false;
            $("#iframe_zfsyps").hide();
            avalon.history.setHash('/' + window.gobackAddress);
        },
        handleCancel_confirm() {
            this.back_confirm = false;
            this.dialog_status = true;
            $("#iframe_zfsyps").hide();
        },
        fileName: "",

        //执法档案详情页新增权限控制
        zfda_opt: avalon.define({
            $id: "zfda_opt",
            authority: { // 按钮权限标识
                "DOWNLOAD": false, //执法档案详情页_下载
                "UPLOAD": false, //执法档案详情页_上传
                "TJGL": false, //执法档案详情页_添加关联
                "SCGL": false, //执法档案详情页_删除关联
                "TJJKSP": false, //案件管理，执法档案详情页_添加监控视频
            }
        }),

        onInit(event) {
            zfdaDetail.ajInfoArr = [];
            zfdaDetail.relateInfo = [];
            zfdaDetail.showNumber = 0;
            // zfdaDetail.nextStopClass = false;
            //设置弹窗高度
            $(".modal-body").css({
                "height": "100%"
            });
            $(".common-layout").addClass('common-layout-size-set-zfda');
            let deptemp = [];

            ajax({
                // url: '/api/dep_tree',
                // url: '/gmvcs/uap/org/all',
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                // url: '/gmvcs/uap/org/find/root',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取部门树失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                getDepTree(result.data, deptemp);
                relateWindow.yspk_data = deptemp;
                addJKSP_vm.tree_baq.rdata = deptemp;
                // addJKSP_vm.tree_baq.sjdw = 'GMO0000000020190626142948ff8ffffff';
                // addJKSP_vm.tree_baq.selectedTitle = '';
                // relateWindow.yspk_value = new Array(deptemp[0].key);
                // relateWindow.yspk_expandedKeys = new Array(deptemp[0].key);
            });
            ajgl_ck_Man = this;
            ajglMan = this;

            //权限控制
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                let type = sessionStorage.getItem("webType");
                switch (type) {
                    case "jqgl":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_JQGL_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JQGL_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JQGL_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JQGL_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                            }
                        });
                        break;
                    case "ajgl":
                    case "ajgl_xctj":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_AJGL_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_AJGL_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_AJGL_TJJKSP":
                                    _this.zfda_opt.authority.TJJKSP = true;
                                    break;                                    
                            }
                        });
                        break;
                    case "jycx":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_JTWF_JYCX_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_JYCX_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_JYCX_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_JYCX_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                            }
                        });
                        break;
                    case "fxccf":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_JTWF_FXCCL_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_FXCCL_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_FXCCL_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_FXCCL_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                            }
                        });
                        break;
                    case "qzcs":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_JTWF_QZCS_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_QZCS_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_QZCS_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_JTWF_QZCS_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                            }
                        });
                        break;
                    case "sgcl":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_SGCL_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_SGCL_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_SGCL_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_SGCL_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                            }
                        });
                        break;
                    case "xcky":
                        avalon.each(func_list, function (k, v) {
                            switch (v) {
                                case "AUDIO_FUNCTION_ZFDA_XCKY_DOWNLOAD":
                                    _this.zfda_opt.authority.DOWNLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_XCKY_UPLOAD":
                                    _this.zfda_opt.authority.UPLOAD = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_XCKY_CHECK_TJGL":
                                    _this.zfda_opt.authority.TJGL = true;
                                    break;
                                case "AUDIO_FUNCTION_ZFDA_XCKY_CHECK_SCGL":
                                    _this.zfda_opt.authority.SCGL = true;
                                    break;
                            }
                        });
                        break;
                }

            });

            ajglMan.$watch('cj_checked_data', (v) => {

                if (v.length > 1) {
                    $('.download').prop('disabled', true).css('background', '#d4d7d9');
                } else {
                    $('.download').prop('disabled', false).css('background', '#0078d7');
                }
            });
            ajglMan.$watch('jbxxInfo.infomation', (v) => {

                if (v.sldwmc.length >= 30) {
                    $('.jbxx-inline span:nth-child(2)[class!="innerSpan"]').css({
                        width: '29%',
                        'min-width': '350px'
                    });
                }
            });
            Tools.searchCaseInfo(); //初始化基本信息和处警信息        
            Tools.checker.setChecker(); //初始化勾选的控制器

            ajglMan.jbxx();

            ajgl_ck_Man.loading = true;
            ajgl_ck_Man.loading = false;
            ajgl_ck_Man.ocxPlayer = true;
            $("#ocxPlayer").css("visibility", "hidden");

            //播放器设置
            this.video_url = "";
            this.play_status = false;
            this.web_width = $("#ocxPlayer").width();
            this.web_height = $("#ocxPlayer").height();
            this.web_left = $("#ocxPlayer").offset().left + 1;
            this.web_top = $("#ocxPlayer").offset().top + 1;

            this.resizeTimer = null;
            setTimeout(function () {
                $("#ocxPlayer").css("visibility", "visible");

                $(window).resize(function () {
                    clearTimeout(ajglMan.resizeTimer);
                    $("#ocxPlayer").css("visibility", "hidden");
                    ajglMan.resizeTimer = setTimeout(function () {
                        ajglMan.web_width = $(".player").width();
                        $('#gm_webplayer').css('width', $(".player").width());
                        ajglMan.web_height = $("#ocxPlayer").height();
                        $("#ocxPlayer").css("visibility", "visible");
                    }, 100);
                });

                ajglMan.$watch('ocxPlayer', (v) => {

                    if (v) {
                        return;
                    } else {
                        ajglMan.play_status = false;
                    }
                });
            }, 1000);
            // 添加关联、删除关联、下载按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_AJGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_TJGL":
                            ajgl_ck_Man.authority.CHECK_TJGL = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_SCGL":
                            ajgl_ck_Man.authority.CHECK_SCGL = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_AJGL_DOWNLOAD":
                            ajgl_ck_Man.authority.CHECK_DOWNLOAD = true;
                            break;
                    }
                });
            });

            //初始化办案区
            // if (baqSaryselect_vm.selectInvolvedPersonCode == "99") {
            //     addJKSP_vm.getCaseareaAll(storage.getItem('userCode'));
            // } else {
            //     addJKSP_vm.getCaseareaAll(baqSaryselect_vm.selectInvolvedPersonCode);
            // }
            // addJKSP_vm.getInvolvedCasePerson(sessionStorage.getItem("ajgl_bh"));
        },

        ajShow: false,
        selectTab: 0,
        selectClick(e) {
            this.selectTab = e;

            zfdaDetail.ajShowInfo = [];
            zfdaDetail.relateInfo = [];
            if (e == 0) {
                zfdaDetail.ajShowInfo = zfdaDetail.ajInfoArr;
                zfdaDetail.relateInfo = zfdaDetail.ajInfoArr[0].mediaInfo;
            } else if (e == 1) {
                zfdaDetail.ajShowInfo = zfdaDetail.jcjInfoArr.sort(sortByIndex('index'));
                if (zfdaDetail.ajShowInfo.length > 0) {
                    $(".aj_info .infoPanel ul").hide();
                    $(".aj_info .infoPanel:eq(0) ul").show();
                    zfdaDetail.relateInfo = zfdaDetail.ajShowInfo[0].mediaInfo || [];
                }
                _popover();//设置信息提示框title
            
            } else if (e == 2) {
                this.dataSelectTab = 3;
                zfdaDetail.relateInfo = arrFilter(zfdaDetail.ajInfoArr[0].mediaInfo, "0" + this.dataSelectTab);
                if (isBZ) {
                    baqSaryselect_vm.getInvolvedCasePerson(sessionStorage.getItem("ajgl_bh"));//初始化涉案人员
                    baqAJTab_vm.getBAQMonitorInfo("99");//初始化 监控信息面板
                    let baqMediaArr = zfdaDetail.ajInfoArr[0].mediaInfo || [];
                    if (baqMediaArr.length > 0) {
                        let temArr = [];
                        avalon.each(baqMediaArr, function (key, value) {
                            if (value.fileSourceType == '01') {
                                temArr.push(value);
                            }
                        });
                        zfdaDetail.relateInfo = temArr;
                    }
                    //初始化 添加监控信息弹窗内容
                    addJKSP_vm.getCaseareaAll(storage.getItem('userCode'));
                    addJKSP_vm.getInvolvedCasePerson(sessionStorage.getItem("ajgl_bh"));
                }
            }
            this.initRelate();
        },
        dataSelectTab: 3,
        dataSelectClick(e) {
            this.dataSelectTab = e;
            zfdaDetail.relateInfo = arrFilter(zfdaDetail.ajInfoArr[0].mediaInfo, "0" + e);
            this.initRelate();
        },
        initRelate() {
            $(".detailClass .result_list").css({
                left: 0
            });
            $(".glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
            zfdaDetail.prevStopClass = true;
            if (zfdaDetail.relateInfo.length == 0) { 
                zfdaDetail.nextStopClass = true;
            }
            setTimeout(() => {
                windowResize();
            }, 100);
        },
        
        onReady() {
            let _this = this;
            sbzygl = new Sbzygl(this);
            _this.ajShow = false;
            $(window).on('resize', windowResize);
            let url = window.location.href;
            if (url.indexOf("?jqbh") > 0) {
                let jqbh = url.slice(url.indexOf("?jqbh") + 6, url.length + 1);
                window.sessionStorage.setItem('ajgl_bh', jqbh);
                window.sessionStorage.setItem('webType', 'jqgl');
            } else if (url.indexOf("?ajbh") > 0) {
                let ajbh = url.slice(url.indexOf("?ajbh") + 6, url.length + 1);
                window.sessionStorage.setItem('ajgl_bh', ajbh);
                window.sessionStorage.setItem('webType', 'ajgl');
            }
            
            //设置当前页面返回地址
            window.gobackAddress = getGobackAddress();

            if (!sessionStorage.getItem("ajgl_bh")) {
                this.ajgl_back();
            }

            _this.caseWebType();
            zfdaDetail.prevStopClass = true; //初始化翻页禁止向前翻页
            zfdaDetail.nextStopClass = true; //初始化翻页禁止向后翻页
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

            //         if (_this.back_confirm) {
            //             return;
            //         }
            //         ajglMan.back_confirm = true;
            //         ajglMan.dialog_status = false;
            //         Tools.addConfirmClass('tjglConfirm');
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
            // window.onbeforeunload = function (e) {
            //     var e = window.event || e;
            //     e.returnValue = ("确定离开当前页面吗？");
            // }
            // window.onunload = function (e) {
            //     var e = window.event || e;
            //     avalon.history.setHash("/" + window.gobackAddress);

            // }

            $(window).bind('beforeunload', function (event) { //ie
                // $(window).unbind('beforeunload'); //在不需要时解除绑定   
                // if (global.location.hash.indexOf(window.gobackAddress) > -1)
                avalon.history.setHash("/" + window.gobackAddress);
            });

            $(window).unload(function () { //firefox
                // $(window).unbind('beforeunload'); //在不需要时解除绑定 
                // if (global.location.hash.indexOf(window.gobackAddress) > -1)
                avalon.history.setHash("/" + window.gobackAddress);
            });
        },
        onDispose() {
            $(document).unbind("keydown");
            $('detailClass').remove();

            if (this.ocxPlayer) {
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
                delete_ocx();
            }
            $(window).off('resize', windowResize);   

            $(".modal-body").css({
                "height": "auto"
            });
            $(".common-layout").removeClass('common-layout-size-set-zfda');

            clearInterval(uploadWindow.timer);
            zfdaDetail.mapAjaxData = {};
            sessionStorage.removeItem("webType");
            sessionStorage.removeItem("ajgl_bh");
            sessionStorage.removeItem("isYWGJ");
        }
    }
});

let zfdaDetail = avalon.define({
    $id: 'zfdaDetail',
    ajInfoArr: [],
    jcjInfoArr: [],
    ajShowInfo: [],

    returnBtn() {
        clearInterval(uploadWindow.timer);
        let isYWGJ = sessionStorage.getItem("isYWGJ");
        if(isYWGJ){//判断是否为业务告警页面跳转，是则返回回业务告警。
            sessionStorage.removeItem("webType");
            sessionStorage.removeItem("ajgl_bh");
            sessionStorage.removeItem("isYWGJ");
            avalon.history.setHash('/zfsypsjglpt-ywgj');
        }else{
            avalon.history.setHash("/" + window.gobackAddress);
        }
    },
    infoClick(e) {
        $(".aj_info .infoPanel ul").hide();
        $(".aj_info .infoPanel:eq(" + e.index + ") ul").show();
        zfdaDetail.relateInfo = e.mediaInfo || [];
    },
    rightInfo: [],
    rightInfoTitle: '',
    relateInfo: [],
    biaozhuShow: false,
    saveTime: "0天",
    tipDownFilePath: "",
    mapAjaxData: "",
    labelTypeName: "",
    childLabelTypeName:"",
    labelRemark: "",
    labelPersonnel: "",
    labelTime: "",
    cjxxInfo: "",
    show_img: false,
    play_url: "",
    showNumber: 0,
    nextStopClass: false,
    prevStopClass: false,
    //关联列表翻页函数
    prevClick() {
        if (this.prevStopClass)
            return;

        let left = $(".glmt_content .result_list").position().left + (this.showNumber * 376);
        $(".glmt_content .result_list").css({
            left: left
        });
        this.nextStopClass = false;
        if (left == 0) {
            this.prevStopClass = true;
        } else {
            this.prevStopClass = true;
            setTimeout(() => {
                zfdaDetail.prevStopClass = false;
            }, 550);
        }
        
    },
    nextClick() {
        if (this.nextStopClass)
            return;
        
        let left = $(".glmt_content .result_list").position().left - (this.showNumber * 376);
        $(".glmt_content .result_list").css({
            left: left
        });
        this.prevStopClass = false;
        if ($(".glmt_content .result_list").width() - Math.abs(left) <= $(".glmt_content .result_list_panel").width()) {
            this.nextStopClass = true;
        } else {
            this.nextStopClass = true;
            setTimeout(() => {
                zfdaDetail.nextStopClass = false;
            }, 550);
        }
    },
    //点击上传弹窗
    openUploadWindow: function () {
        if (ajgl_ck_Man.nodata) {
            Tools.sayWarn('暂时没找到该' + zfdaDetail.rightInfoTitle + '数据，请稍后尝试！');
            return;
        }
        uploadWindow.show = true;
        ajglMan.dialog_status = false;
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
    //点击关联媒体弹窗
    openRelateWindow: function () {
        if (ajgl_ck_Man.nodata) {
            Tools.sayWarn('暂时没找到该' + zfdaDetail.rightInfoTitle + '数据，请稍后尝试！');
            return;
        }
        relateWindow.show = true;
        ajglMan.dialog_status = false;
        relateinner.currentElements = [];
        relateinner.rids = [];
        relateinner.tempUserCode = "";
        relateinner.tempWfStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD'); 
        relateinner.tempWfEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
        relateinner.userCode = "";
        relateinner.wfStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
        relateinner.wfEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
        relateinner.timeMode = [1];
        relateinner.current = 1;
        relateinner.pageSize = 10;
        relateinner.total = 30;
        relateinner.page_type = false; //fasle 显示总条数; true 显示大于多少条
        relateinner.curPage = 1;
        relateinner.table_pagination = {
            current: 1,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        $("#iframe_zfsyps").css({
            "opacity": 0
        });
        setTimeout(function () {
            $("#iframe_zfsyps").css({
                "opacity": 1
            });
            $("#iframe_zfsyps").show();
        }, 600);
        //打开关联弹窗默认查询
        relateinner.searchBtn();

    },
    //点击取消关联确认弹窗
    openRelateCancelWindow(data) {
        relateCancelWindow.data = data;
        relateCancelWindow.show = true;
        ajglMan.dialog_status = false;
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
    flagShow: false,
    biaozhuClick: function () {
        this.flagShow = !this.flagShow;
        ajglMan.dialog_status = !ajglMan.dialog_status;

        if (this.flagShow) {
            $(".biaozhuDetail").slideDown();
            setTimeout(function () {
                $("#iframe_zfsyps").css({
                    "opacity": 1,
                    "left": ($('.biaozhuDetail').position().left + 210) + "px",
                    "top": ($('.biaozhuDetail').position().top + 795) + "px",
                    "width": "250px",
                    "height": "178px",
                });
                $("#iframe_zfsyps").show();
            }, 200);
            $("#iframe_zfsyps").show();
        }
        else {
            $("#iframe_zfsyps").hide();
            $(".biaozhuDetail").slideUp();
        }

    },

    relateClick: function (data) { //关联媒体列表点事件
        ajglMan.fileName = data.fileName;
        //设置为关联媒体列表激活状态
        $(".result_list li").removeClass('result_list_active');
        $(".result_list li").eq(data.index).addClass('result_list_active');
        $(".result_list li").eq(data.index).css({
            opacity: 0.8
        });
        //隐藏标注信息框
        this.flagShow = false;
        $("#iframe_zfsyps").hide();
        $(".biaozhuDetail").slideUp();
        //更新媒体信息
        ajax({
            url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + data.rid,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                if (ret.data.saveTime >= 0) {
                    this.saveTime = ret.data.saveTime + "天";
                }
                else if (ret.data.saveTime == -1) {
                    this.saveTime = "永久保存";
                }
                else if (ret.data.saveTime == -2) {
                    this.saveTime = "已过期";
                }
                ret.data.importTime = formatDate(ret.data.importTime);
                // ret.data.startTime = formatDate(ret.data.startTime);
                ret.data.keyFile = ret.data.match == true ? '已关联' : '未关联';

                // 画轨迹所需参数
                this.mapAjaxData = {
                    "deviceId": ret.data.deviceId,
                    "fileRid": ret.data.rid,
                    "fileType": ret.data.type,
                    "beginTime": ret.data.startTime,
                    "endTime": ret.data.endTime
                };

                if (ret.data.saveTime == -1) {
                    ret.data.saveTime = '永久存储';
                } else if (ret.data.saveTime == -2) {
                    ret.data.saveTime = '已过期';
                } else {
                    ret.data.saveTime = ret.data.saveTime + '天';
                }

                if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                    ret.data.path = "采集工作站、存储服务器";
                } else {

                    if (ret.data.saveSiteWs) {
                        ret.data.path = "采集工作站";
                    } else if (ret.data.saveSiteSt) {
                        ret.data.path = "存储服务器";
                    }
                }

                if (ret.data.saveTime == '已过期') {
                    ret.data.path = "-";
                    // ajgl_ck_Man.imgff = false;
                    // ajgl_ck_Man.ocxPlayer = false;
                    // $('.finishDelete').css('display', 'none');
                    // $('.outDateMedia').css('display', 'block');
                    Tools.sayWarn('该文件已过期');
                } else {
                    if (ret.data.outPlayer) {
                        window.open(ret.data.outPlayerurl, "_blank");
                        return;
                    }
                    switch (data.type) {
                        case 0:
                            filePlayer.play("视频", data.rid, '');
                            break;
                        case 1:
                            filePlayer.play("音频", data.rid, '');
                            break;
                        case 2:
                            filePlayer.play("图片", data.rid, '');
                            break;
                        default:
                            filePlayer.play("其他", data.rid, '');
                            break;
                    }
                }
                // this.cjxxInfo.infomation = ret.data;
                Tools.reduceWordForCjxx();
            } else {
                Tools.sayError('获取详细媒体信息失败');
            }
            this.biaozhuShow = ret.data.label;

        });
        this.getDownFileInfo(data.rid);
        //获取标注信息
        this.getBiaozhuInfo(data.rid);
    },
    getBiaozhuInfo(rid) { //获取标注信息
        ajax({
            url: '/gmvcs/audio/basefile/label/info?rid=' + rid,
            method: 'get',
            data: {}
        }).then(ret => {
            if (ret.code == 0) {
                if (ret.data == null) {
                    this.labelTypeName = "-";
                    this.labelRemark = "-";
                }
                else {
                    this.childLabelTypeName = ret.data.childLabelTypeName?ret.data.childLabelTypeName:"-";
                    this.labelTypeName = ret.data.labelTypeName;
                    this.labelRemark = ret.data.labelRemark;
                    var labelPersonnel = ret.data.labeledByUserName +'('+ ret.data.labeledByUserCode+')';
                    this.labelPersonnel = labelPersonnel || "-";
                    this.labelTime = ret.data.labelTime ? moment(ret.data.labelTime).format("YYYY-MM-DD HH:mm:ss") : "-";
                }
            }
            else {
                Tools.sayWarn(ret.msg);
            }
        })
    },
    getDownFileInfo(rid) {
        ajax({
            url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + rid,
            method: 'get',
            data: {}
        }).then(ret => {
            this.tipDownFilePath = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
        })
    },
    tipDownFile() {
        if (ajgl_ck_Man.nodata) {
            return;
        }
        if (!this.tipDownFilePath) {
            Tools.sayWarn("请先点击需要下载的文件!")
        }
        else {
            window.location.href = this.tipDownFilePath;
        }
    },
    relateCancelClick(data) {  //取消关联
        let webType = sessionStorage.getItem("webType");
        let id = sessionStorage.getItem("ajgl_bh");
        switch (webType) {
            case 'jycx':
                this.relateCancelByJycx(id, data.rid, "VIOLATION");
                break;
            case 'fxccf':
                this.relateCancelByFxccf(id, data.rid, "SURVEIL");
                break;
            case 'qzcs':
                this.relateCancelByQzcs(id, data.rid, "FORCE");
                break;
            case 'sgcl':
                this.relateCancelBySgcl(id, data.rid, "ACCIDENT");
                break;
            case 'ajgl':
                this.relateCancelByAjgl(id, data.rid);
                break;
            default:
                this.relateCancelByJqgl(id, data.rid);
                break;
        }
    },
    relateCancelByJycx(bh, rid, trafficLEType) {
        let rids = [];
        rids[0] = rid;
        ajax({
            url: '/gmvcs/audio/violation/delete/relevance',
            method: 'post',
            data: {
                "bh": bh,
                "rids": rids,
                "trafficLEType": trafficLEType
            }
        }).then(ret => {
            if (ret.code == 0) {
                Tools.saySuccess(ret.msg);
                Tools.searchJycxByWfbh(bh);
                relateCancelWindow.editCancel();
            }
            else {
                Tools.sayWarn(ret.msg);
            }

        })
    },
    relateCancelByFxccf(bh, rid, trafficLEType) {
        let rids = [];
        rids[0] = rid;
        ajax({
            url: '/gmvcs/audio/surveil/delete/relevance',
            method: 'post',
            data: {
                "bh": bh,
                "rids": rids,
                "trafficLEType": trafficLEType
            }
        }).then(ret => {
            if (ret.code == 0) {
                Tools.saySuccess(ret.msg);
                Tools.searchFxccfByWfbh(bh);
                relateCancelWindow.editCancel();
            }
            else {
                Tools.sayWarn(ret.msg);
            }

        })
    },
    relateCancelByQzcs(bh, rid, trafficLEType) {
        let rids = [];
        rids[0] = rid;
        ajax({
            url: '/gmvcs/audio/force/delete/relevance',
            method: 'post',
            data: {
                "bh": bh,
                "rids": rids,
                "trafficLEType": trafficLEType
            }
        }).then(ret => {
            if (ret.code == 0) {
                Tools.saySuccess(ret.msg);
                Tools.searchQzcsByWfbh(bh);
                relateCancelWindow.editCancel();
            }
            else {
                Tools.sayWarn(ret.msg);
            }

        })
    },
    relateCancelBySgcl(bh, rid, trafficLEType) {
        let rids = [];
        rids[0] = rid;
        ajax({
            url: '/gmvcs/audio/accident/delete/relevance',
            method: 'post',
            data: {
                "bh": bh,
                "rids": rids,
                "trafficLEType": trafficLEType
            }
        }).then(ret => {
            if (ret.code == 0) {
                Tools.saySuccess(ret.msg);
                Tools.searchSgclByWfbh(bh);
                relateCancelWindow.editCancel();
            }
            else {
                Tools.sayWarn(ret.msg);
            }

        })
    },
    relateCancelByAjgl(bh, rid) {
        let arr = [];
        let obj = {
            "rid": rid,
            "gllx": 2
        }
        arr.push(obj);
        ajax({
            url: '/gmvcs/audio/case/deleteRelevance',
            method: 'post',
            data: {
                "bh": bh,
                "rids": arr,
                "lx": 1
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchCaseByAjbh(bh);
                relateCancelWindow.editCancel();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    relateCancelByJqgl(bh, rid) {
        let arr = [];
        let obj = {
            "rid": rid,
            "gllx": 2
        }
        arr.push(obj);
        ajax({
            url: '/gmvcs/audio/case/deleteRelevance',
            method: 'post',
            data: {
                "bh": bh,
                "rids": arr,
                "lx": 2
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchMediaByJqbh(bh);
                relateCancelWindow.editCancel();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    }
});
//上传弹窗
let uploadWindow = avalon.define({
    $id: 'uploadWindow',
    show: false,
    businessInfo: {},
    timer: null,
    editCancel: function () {
        //刷新底下的关联媒体
        let webType = sessionStorage.getItem("webType");
        let id = sessionStorage.getItem("ajgl_bh");
        this.show = false;
        ajglMan.dialog_status = true;
        $("#iframe_zfsyps").hide();
        // console.log(this.fileNameList);
        clearInterval(this.timer);
        this.timer = setInterval(function () {
            switch (webType) {
                case 'jycx':
                    ajax({
                        url: '/gmvcs/audio/violation/findFileNames/' + id,
                        method: 'get',
                        data: '',
                        cache: false
                    }).then(ret => {
                        if (ret.code == 0) {
                            uploadWindow.contrastFunction(ret.data.fileNames || [], webType, id);
                        }
                    });
                    break;
                case 'fxccf':
                    ajax({
                        url: '/gmvcs/audio/surveil/findFileNames/' + id,
                        method: 'get',
                        data: '',
                        cache: false
                    }).then(ret => {
                        if (ret.code == 0) {
                            uploadWindow.contrastFunction(ret.data.fileNames || [], webType, id);
                        }
                    });
                    break;
                case 'qzcs':
                    ajax({
                        url: '/gmvcs/audio/force/findFileNames/' + id,
                        method: 'get',
                        data: '',
                        cache: false
                    }).then(ret => {
                        if (ret.code == 0) {
                            uploadWindow.contrastFunction(ret.data.fileNames || [], webType, id);
                        }
                    });
                    break;
                case 'sgcl':
                    ajax({
                        url: '/gmvcs/audio/accident/findFileNames/' + id,
                        method: 'get',
                        data: '',
                        cache: false
                    }).then(ret => {
                        if (ret.code == 0) {
                            uploadWindow.contrastFunction(ret.data.fileNames || [], webType, id);
                        }
                    });
                    break;
                case 'ajgl':
                    ajax({
                        url: '/gmvcs/audio/case/searchCaseFileById/' + id,
                        method: 'post',
                        data: '',
                        cache: false
                    }).then(ret => {
                        if (ret.code == 0) {
                            uploadWindow.contrastFunction(ret.data.fileNames || [], webType, id);
                        }
                    });
                    break;
                case 'jqgl':    
                    ajax({
                        url: '/gmvcs/audio/policeSituation/searchPsFileById/' + id,
                        method: 'post',
                        data: '',
                        cache: false
                    }).then(ret => {
                        if (ret.code == 0) {
                            uploadWindow.contrastFunction(ret.data.fileNames || [], webType, id);
                        }
                    });
                    break;
            }
        }, 1500);
    },
    contrastFunction: function (fileNames, webType, id) { //判断刚才保存的上传文件名列表是否在返回的列表里
        let j = 0;
        for (let i = 0; i < this.fileNameList.length; i++){
            if (fileNames.indexOf(this.fileNameList[i]) > -1) {
                j++;
            }
        }
        // console.log(j);
        if (j == this.fileNameList.length) {
            clearInterval(this.timer);
            this.fileNameList = [];
            this.refreshList(webType, id);
        }
    },
    refreshList: function(webType, id){ 
        // setTimeout(function () {
            // let timer = null,
            //     i = 0;
            // clearInterval(timer);
            // timer = setInterval(function () {
            //     if (i > 1) { 
            //         i = 0; 
            //         clearInterval(timer);
            //         return;
            //     }
            //     i++;
        switch (webType) {
            case 'jycx':
                Tools.searchJycxByWfbh(id);
                break;
            case 'fxccf':
                Tools.searchFxccfByWfbh(id);
                break;
            case 'qzcs':
                Tools.searchQzcsByWfbh(id);
                break;
            case 'sgcl':
                Tools.searchSgclByWfbh(id);
                break;
            case 'ajgl':
                ajgl_ck_Man.selectTab = 0;
                Tools.searchCaseByAjbh(id);
                break;
            case 'jqgl':    
            default:
                Tools.searchMediaByJqbh(id);
                break;
        }
            // }, 2000);
    },
    move_upload: function (a, b) {
        $("#iframe_zfsyps").css({
            width: '600px',
            height: '400px',
            left: a,
            top: b
        });
    },
    fileNameList: [],
    getFileName(e){ //ms-upload回调，拿到上传的文件名列表
        this.fileNameList = e;
    },

})
let uploadinner = avalon.define({
    $id: 'upload-inner',
    title: '上传媒体'
})
//关联弹窗
let relateWindow = avalon.define({
    $id: 'relateWindow',
    show: false,
    editCancel: function () {
        this.show = false;
        ajglMan.dialog_status = true;
        $("#iframe_zfsyps").hide();
    },
    yspk_data: [],
    // yspk_value: [],
    tree_key: "",
    tree_title: "",
    // yspk_expandedKeys: [],
    tree_code: "",
    curTree: "",
    searchID: "dd",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.path;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: '通知'
                });
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

    },
    move_relate: function (a, b) {
        $("#iframe_zfsyps").css({
            width: '930px',
            height: '612px',
            left: a,
            top: b
        });
    }
})
let relateinner = avalon.define({
    $id: 'relate-inner',
    title: '关联媒体',
    userCode: '',
    tempUserCode: '',//缓存查询条件
    tempWfStartTime: '',
    tempWfEndTime: '',
    timeMode: [1],
    wfStartTime: moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
    wfEndTime: moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD'),
    isDuration: false,
    imageUrl: '/static/image/zfsypsjglpt/videoWindow.png',
    currentElements: [],
    current: 1,
    pageSize: 10,
    total: 30,
    rids: [],
    loading: false,
    page_type: false, //fasle 显示总条数; true 显示大于多少条
    curPage: 1,
    startTimeChange(e) {
        let _this = this;
        _this.wfStartTime = e.target.value;
    },
    endTimeChange(e) {
        let _this = this;
        _this.wfEndTime = e.target.value;
    },
    table_pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        current_len: 0,
        totalPages: 0
    },
    enter_click(e) {  //限制特殊字符输入
        $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
        this.$searchForm.record[e.target.name] = $(e.target).val();
        this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

        if (e.keyCode == "13") {
            table.fetch(true);
        }
    },
    getCurrent(current) {
        this.table_pagination.current = current;
        this.curPage = current;
        // console.log("当前页码:" + this.table_pagination.current);
    },
    getPageSize(pageSize) {
        this.table_pagination.pageSize = pageSize;
        // console.log("当前页面大小:" + this.table_pagination.pageSize);
    },
    handlePageChange(page) {
        // this.change_page = true;
        this.curPage = page;
        this.table_pagination.current = page;
        // zfysyp_detail_table_in_obj.page(page, this.table_pagination.pageSize);
        this.currentElements = [];
        // zfysyp_detail_table_in_obj.tableDataFnc([]);
        this.loading = true;
        this.getRelevance();
    },
    time_Change(e) {
        this.timeMode[0] = e.target ? e.target.value : e
        switch (this.timeMode[0]) {
            case 2:
                this.wfStartTime = moment().startOf('month').format('YYYY-MM-DD')
                this.wfEndTime = moment().endOf('month').format('YYYY-MM-DD')
                this.isDuration = false
                break
            case 3:
                this.wfStartTime = moment().subtract(3, 'months').format('YYYY-MM-DD')
                this.wfEndTime = moment().format('YYYY-MM-DD')
                this.isDuration = true
                break
            default:
                //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                this.wfStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD')
                this.wfEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD')
                this.isDuration = false
        }
    },
    enterKeyBoard(e) {
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        // console.log(code);
        if (code == 13) {
            //回车执行查询
            this.searchBtn();
        }
    },
    input_focus(e) {
        avalon(e.target.nextSibling).css('display', 'inline-block')
    },
    input_blur(e) {
        avalon(e.target.nextSibling).css('display', 'none')
    },
    mousedownRelate(e) {
        this.userCode = '';
        return false;
    },
    searchBtn() { 
        this.curPage = 1;
        this.table_pagination.current = 1;
        this.tempUserCode = this.userCode;
        this.tempWfStartTime = this.wfStartTime;
        this.tempWfEndTime = this.wfEndTime;
        this.getRelevance();
    },
    getRelevance() {
        this.loading = true;
        let webType = sessionStorage.getItem("webType");
        let gllxType = 1;

        switch (webType) {
            case 'jycx':
                gllxType = 1;
                break;
            case 'fxccf':
                gllxType = 2;
                break;
            case 'qzcs':
                gllxType = 3;
                break;
            case 'sgcl':
                gllxType = 4;
                break;
            default:
                gllxType = 5;
                break;

        }

        ajax({
            url: '/gmvcs/audio/basefile/findRelevance',
            method: 'post',
            data: {
                "page": this.table_pagination.current-1,
                "pageSize": this.table_pagination.pageSize,
                "user": this.tempUserCode,
                "endTime": moment(this.tempWfEndTime + ' 23:59:59').format("x"),
                "startTime": moment(this.tempWfStartTime + ' 00:00:00').format("x"),
                "bh": sessionStorage.getItem("ajgl_bh"),
                "gllx": gllxType
            }
        }).then(result => {
            this.currentElements = [];
            this.loading = false;
            this.currentElements = result.data.currentElements;
            if (result.code != 0) {
                Tools.sayWarn(result.msg);
                return;
            }
            if (result.code==0) {
                //处理拍摄时间和 ICON类型
                for (let key in this.currentElements) {

                    this.currentElements[key].startTime = formatDate(this.currentElements[key].startTime);

                }

                if (result.data.overLimit) {
                    this.page_type = true;
                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                    this.table_pagination.totalPages = result.data.limit; //总页数
                } else {
                    this.page_type = false;
                    this.table_pagination.total = result.data.totalElements; //总条数
                    this.table_pagination.totalPages = result.data.totalPages; //总页数
                }
                this.table_pagination.current_len = result.data.currentElements.length;
            }
        })
    },
    cancelRelevance() {
        relateWindow.show = false;
        $("#iframe_zfsyps").hide();
    },
    addRelevanceByJycx(id) {
        ajax({
            url: '/gmvcs/audio/violation/add/relevance',
            method: 'post',
            data: {
                "bh": sessionStorage.getItem("ajgl_bh"),
                "rids": this.rids,
                "trafficLEType": "VIOLATION"
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchJycxByWfbh(id);
                this.cancelRelevance();

            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    addRelevanceByFxccf(id) {
        ajax({
            url: '/gmvcs/audio/surveil/add/relevance',
            method: 'post',
            data: {
                "bh": sessionStorage.getItem("ajgl_bh"),
                "rids": this.rids,
                "trafficLEType": "SURVEIL"
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchFxccfByWfbh(id);
                this.cancelRelevance();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    addRelevanceByQzcs(id) {
        ajax({
            url: '/gmvcs/audio/force/add/relevance',
            method: 'post',
            data: {
                "bh": sessionStorage.getItem("ajgl_bh"),
                "rids": this.rids,
                "trafficLEType": "FORCE"
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchQzcsByWfbh(id);
                this.cancelRelevance();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    addRelevanceBySgcl(id) {
        ajax({
            url: '/gmvcs/audio/accident/add/relevance',
            method: 'post',
            data: {
                "bh": sessionStorage.getItem("ajgl_bh"),
                "rids": this.rids,
                "trafficLEType": "ACCIDENT"
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchSgclByWfbh(id);
                this.cancelRelevance();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    addRelevanceByAjgl(id) {
        let arr = [];
        avalon.each(this.rids, function (index, item) {
            let obj = {
                "rid": item,
                "gllx": 2
            }
            arr.push(obj);
        });
        ajax({
            url: '/gmvcs/audio/case/addRelevance',
            method: 'post',
            data: {
                "bh": sessionStorage.getItem("ajgl_bh"),
                "rids": arr,
                "lx": 1
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchCaseByAjbh(id);
                this.cancelRelevance();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    addRelevanceByJqgl(id) {
        let arr = [];
        avalon.each(this.rids, function (index, item) {
            let obj = {
                "rid": item,
                "gllx": 2
            }
            arr.push(obj);
        });
        ajax({
            url: '/gmvcs/audio/case/addRelevance',
            method: 'post',
            data: {
                "bh": sessionStorage.getItem("ajgl_bh"),
                "rids": arr,
                "lx": 2
            }
        }).then(result => {
            if (result.code == 0) {
                Tools.saySuccess(result.msg);
                Tools.searchMediaByJqbh(id);
                this.cancelRelevance();
            }
            else {
                Tools.sayError(result.msg);
            }
        })
    },
    addRelevance() {
        let webType = sessionStorage.getItem("webType");
        let id = sessionStorage.getItem("ajgl_bh");
        if (this.rids.length == 0) {
            Tools.sayWarn("请勾选需要添加关联的文件！");
            return;
        }
        switch (webType) {
            case 'jycx':
                this.addRelevanceByJycx(id);
                break;
            case 'fxccf':
                this.addRelevanceByFxccf(id);
                break;
            case 'qzcs':
                this.addRelevanceByQzcs(id);
                break;
            case 'sgcl':
                this.addRelevanceBySgcl(id);
                break;
            case 'ajgl':
                this.addRelevanceByAjgl(id);
                break;
            default:
                this.addRelevanceByJqgl(id);
                break;

        }
        //确定添加关联后,返回第一页
        let left = 0;  
        $(".glmt_content .result_list").css({
            left: left
        });
        zfdaDetail.prevStopClass = true;
    }
})
//取消关联确认弹窗
let relateCancelWindow = avalon.define({
    $id: 'relateCancelWindow',
    show: false,
    title: "提示",
    data: "",
    editCancel: function () {
        this.show = false;
        ajglMan.dialog_status = true;
        $("#iframe_zfsyps").hide();
        $(".glmt_content .result_list").css({
            left: 0
        });
        windowResize();
    },
    editOk: function (data) {
        delete_ocx(); //确定删除关联后，停止OCX的播放
             
        zfdaDetail.relateCancelClick(this.data);
        //确定删除关联后,返回第一页
        let left = 0;  
        $(".glmt_content .result_list").css({
            left: left
        });
        zfdaDetail.prevStopClass = true;
    },
    move_relateCancel: function (a, b) {

        $("#iframe_zfsyps").css({
            width: '300px',
            height: '178px',
            left: a,
            top: b
        });
    }
})
let relateCancelWindowInner = avalon.define({
    $id: 'relateCancel-inner',
    show: false,
    title: "提示",
    editCancel: function () {
        this.show = false;
        $("#iframe_zfsyps").hide();
    }
})


// //标注弹窗
// let biaozhuDetail = avalon.define({
//     $id: 'biaozhuDetail',
//     show: false
// })
/**********通用函数工具类**********/
let Tools = {
    downloadImg(pathImg) {
        let imgLoad = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = function () {
                resolve(pathImg);
            };
            image.onerror = function () {
                reject(new Error('该图片文件不存在'));
            };
            image.src = pathImg;
        });
        imgLoad.then(pathImg => {
            window.open(pathImg);
        }).catch(error => {
            Tools.sayWarn(error.message);
        });
    },
    formatDuring: function (mss) {//毫秒秒转时分秒格式
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (mss % (1000 * 60)) / 1000;
        hours = hours < 10 ? ('0' + hours) : hours;
        minutes = minutes < 10 ? ('0' + minutes) : minutes;
        seconds = seconds < 10 && seconds >= 0 ? ('0' + seconds) : seconds;
        return hours + " : " + minutes + " : " + seconds;
    },
    sayError: function (word) {
        notification.error({
            message: word,
            title: '温馨提示'
        });
    },
    sayWarn: function (word) {
        notification.warn({
            message: word,
            title: '温馨提示'
        });
    },
    saySuccess: function (word) {
        notification.success({
            message: word,
            title: '温馨提示'
        });
    },
    checkPlayerWeb() {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return true;
        } else {
            return false;
        }
    },
    checkPlayerExist() {
        let _this = this;
        if (this.checkPlayerWeb()) {
            try {
                ie_obj = new ActiveXObject("zapwebplayer.ZapWebPlayer.1");
            } catch (e) {
                this.sayWarn('请先安装播放器，并允许浏览器加载');
            }
        } else {
            //暂无检测手段
        }
    },
    checkIE: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
            return true;
        } else {
            return false;
        };
    },
    checkIE11: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "WOW64") {
            return true;
        } else {
            return false;
        };
    },
    
    searchMediaByJqbh: function (id) {
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + id,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {
            ajgl_ck_Man.nodata = false;
            if (ret.code == 0) {
                if (!ret.data) {
                    ajgl_ck_Man.nodata = true;
                    return;
                }
                // 给警情信息框赋值
                zfdaDetail.rightInfo[0].data = ret.data.jqbh;
                zfdaDetail.rightInfo[1].data = ret.data.cjdwmc;
                zfdaDetail.rightInfo[2].data = ret.data.cjrxm;
                zfdaDetail.rightInfo[3].data = ret.data.cjsj[0] ? moment(ret.data.cjsj[0]).format("YYYY-MM-DD HH:mm:ss") : '-';
                zfdaDetail.rightInfo[4].data = ret.data.ddxcsj[0] ? moment(ret.data.ddxcsj[0]).format("YYYY-MM-DD HH:mm:ss") :'-';
                zfdaDetail.rightInfo[5].data = ret.data.jlly;
                zfdaDetail.rightInfo[6].data = ret.data.jqlbmc;
                zfdaDetail.rightInfo[7].data = ret.data.bjnr;
                zfdaDetail.rightInfo[8].data = ret.data.bjrxm;
                zfdaDetail.rightInfo[9].data = ret.data.bjrdh;
                zfdaDetail.rightInfo[10].data = ret.data.bjsj ? moment(ret.data.bjsj).format("YYYY-MM-DD HH:mm:ss") : '-';
                zfdaDetail.rightInfo[11].data = ret.data.sfsj ? moment(ret.data.sfsj).format("YYYY-MM-DD HH:mm:ss") : '-';
                zfdaDetail.rightInfo[12].data = ret.data.sfdd;
                zfdaDetail.rightInfo[13].data = ret.data.mjyj;
                zfdaDetail.rightInfo[14].data = ret.data.relation ? "是" : "否";
                zfdaDetail.relateInfo = [];
                let relateInfoArr = [];
                if (ret.data.preBaseFiles && ret.data.handelerBaseFiles) {
                    relateInfoArr = ret.data.preBaseFiles.concat(ret.data.handelerBaseFiles);
                } else if (ret.data.preBaseFiles && !ret.data.handelerBaseFiles) {
                    relateInfoArr = ret.data.preBaseFiles;
                } else if (!ret.data.preBaseFiles && ret.data.handelerBaseFiles) {
                    relateInfoArr = ret.data.handelerBaseFiles;
                }
                for (let key in relateInfoArr) {
                    relateInfoArr[key].index = key;
                    relateInfoArr[key].numberTxt = parseInt(key) + 1 + "、";
                    relateInfoArr[key].startTime = formatDate(relateInfoArr[key].startTime);
                    relateInfoArr[key].duration = this.formatDuring(relateInfoArr[key].duration * 1000);
                }
                zfdaDetail.relateInfo = relateInfoArr;

                $(" .glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
                windowResize();
                _popover(); //设置信息提示框title
            }
        })
    },
    searchCaseByAjbh: function (id) {
        ajax({
            url: '/gmvcs/audio/case/searchById/' + id,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {
            ajgl_ck_Man.nodata = false;
            if (ret.code == 0) {
                if (!ret.data) {
                    ajgl_ck_Man.nodata = true;
                    return;
                }
                //给案情信息框赋值
                zfdaDetail.rightInfo[0].data = ret.data.ajbh;
                zfdaDetail.rightInfo[1].data = ret.data.sldwmc;
                zfdaDetail.rightInfo[2].data = ret.data.ajlbmc;
                zfdaDetail.rightInfo[3].data = ret.data.zbmjxm + "(" + ret.data.zbr + ")";
                zfdaDetail.rightInfo[4].data = ret.data.ajmc;
                zfdaDetail.rightInfo[5].data = ret.data.jyaq;
                if (ret.data && ret.data.involvedPeoples && ret.data.involvedPeoples.length > 0) {
                    let str = "";
                    avalon.each(ret.data.involvedPeoples, (i, el) => {
                        str += el.rymc;
                        if (i != ret.data.involvedPeoples.length - 1) {
                            str += "，";
                        }
                    });
                    zfdaDetail.rightInfo[6].data = str;
                } else {
                    zfdaDetail.rightInfo[6].data = "-";
                }
                zfdaDetail.rightInfo[7].data = ret.data.afsj ? moment(ret.data.afsj).format("YYYY-MM-DD HH:mm:ss") : "-";
                let arr = ret.data.caseBaseFiles || [];
                for (let key in arr) {
                    arr[key].index = key;
                    arr[key].numberTxt = parseInt(key) + 1 + "、";
                    arr[key].startTime = formatDate(arr[key].startTime);
                    arr[key].duration = this.formatDuring(arr[key].duration * 1000);
                }
                zfdaDetail.relateInfo = arr;

                zfdaDetail.ajInfoArr[0] = {
                    index: 0,
                    title: "案件信息",
                    content: zfdaDetail.rightInfo,
                    mediaInfo: zfdaDetail.relateInfo
                };
                zfdaDetail.ajShowInfo = zfdaDetail.ajInfoArr;

                $(".glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
                windowResize();

                let jqbhArr = ret.data.policeSituation || [];
                zfdaDetail.jcjInfoArr = [];
                for (let i = 0; i < jqbhArr.length; i++) {
                    ajax({
                        url: '/gmvcs/audio/policeSituation/searchById/' + jqbhArr[i],
                        method: 'post',
                        data: '',
                        cache: false
                    }).then(result => {
                        let arr = [{ title: "警情编号:  ", data: result.data.jqbh },
                        { title: "事发地点:  ", data: result.data.sfdd },
                        { title: "报警人:  ", data: result.data.bjrxm },
                        { title: "报警电话:  ", data: result.data.bjrdh },
                        { title: "报警内容:  ", data: result.data.bjnr },
                        { title: "报警时间:  ", data: result.data.bjsj ? moment(result.data.bjsj).format("YYYY-MM-DD HH:mm:ss") : "-"},
                        { title: "到达现场时间:  ", data: result.data.ddxcsj[0] ? moment(result.data.ddxcsj[0]).format("YYYY-MM-DD HH:mm:ss") : "-"},
                        { title: "处警人:  ", data: result.data.cjrxm },
                        { title: "民警意见:  ", data: result.data.mjyj },
                        { title: "处警单位:  ", data: result.data.cjdwmc },
                        { title: "事发时间:  ", data: result.data.sfsj ? moment(result.data.sfsj).format("YYYY-MM-DD HH:mm:ss") : "-"},
                        { title: "处警时间:  ", data: result.data.cjsj[0] ? moment(result.data.cjsj[0]).format("YYYY-MM-DD HH:mm:ss") : "-"},
                        { title: "报警来源:  ", data: result.data.jlly },
                        { title: "警情类别:  ", data: result.data.jqlbmc },
                        { title: "关联案件:  ", data: result.data.relationCase ? "是" : "否" }];
                        let tepArrayList = [];
                        if (result.data.preBaseFiles && result.data.handelerBaseFiles) {
                            tepArrayList = result.data.preBaseFiles.concat(result.data.handelerBaseFiles);
                        } else if (result.data.preBaseFiles && !result.data.handelerBaseFiles) {
                            tepArrayList = result.data.preBaseFiles;
                        } else if (!result.data.preBaseFiles && result.data.handelerBaseFiles) {
                            tepArrayList = result.data.handelerBaseFiles;
                        }
                        for (let key in tepArrayList) {
                            tepArrayList[key].index = key;
                            tepArrayList[key].numberTxt = parseInt(key) + 1 + "、";
                            tepArrayList[key].startTime = formatDate(tepArrayList[key].startTime);
                            tepArrayList[key].duration = this.formatDuring(tepArrayList[key].duration * 1000);
                        }
                        let obj = {
                            index: i,
                            title: result.data.jqmc,
                            content: arr,
                            mediaInfo: tepArrayList
                        }

                        zfdaDetail.jcjInfoArr.push(obj);
                    });
        
                }
                _popover(); //设置信息提示框title
            }
        })
    },
    searchJycxByWfbh: function (id) {
        ajax({
            url: '/gmvcs/audio/violation/find/' + id,
            method: 'get',
            data: '',
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                //给简易程序信息框赋值
                zfdaDetail.rightInfo[0].data = ret.data.orgName;
                zfdaDetail.rightInfo[1].data = ret.data.userName + "(" + ret.data.userCode + ")";
                zfdaDetail.rightInfo[2].data = ret.data.jdsbh;
                zfdaDetail.rightInfo[3].data = ret.data.wfsj ? moment(ret.data.wfsj).format("YYYY-MM-DD HH:mm:ss") : "-";
                zfdaDetail.rightInfo[4].data = ret.data.wfdz;
                zfdaDetail.rightInfo[5].data = ret.data.dsr;
                zfdaDetail.rightInfo[6].data = ret.data.jszh;
                zfdaDetail.rightInfo[7].data = ret.data.hphm;
                zfdaDetail.rightInfo[8].data = ret.data.hpzlmc;
                zfdaDetail.rightInfo[9].data = ret.data.wfxwmc;
                // zfdaDetail.relateInfo = [];
                let arr = ret.data.files || [];
                for (let key in arr) {
                    arr[key].index = key;
                    arr[key].numberTxt = parseInt(key) + 1 + "、";
                    arr[key].startTime = formatDate(arr[key].startTime);
                    arr[key].duration = this.formatDuring(arr[key].duration * 1000);
                }
                zfdaDetail.relateInfo = arr;
                $(" .glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
                windowResize();
                _popover(); //设置信息提示框title
            }
        })
    },
    searchFxccfByWfbh: function (id) {
        ajax({
            url: '/gmvcs/audio/surveil/find/' + id,
            method: 'get',
            data: '',
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                //给非现场执法信息框赋值
                zfdaDetail.rightInfo[0].data = ret.data.orgName;
                zfdaDetail.rightInfo[1].data = ret.data.userName + "(" + ret.data.userCode + ")";
                zfdaDetail.rightInfo[2].data = ret.data.hphm;
                zfdaDetail.rightInfo[3].data = ret.data.wfsj ? moment(ret.data.wfsj).format("YYYY-MM-DD HH:mm:ss") : "-";
                zfdaDetail.rightInfo[4].data = ret.data.wfbh;
                zfdaDetail.rightInfo[5].data = ret.data.jdsbh;
                zfdaDetail.rightInfo[6].data = ret.data.wfdz;
                zfdaDetail.rightInfo[7].data = ret.data.wfxwmc;
                // zfdaDetail.relateInfo = [];
                let arr = ret.data.files || [];
                for (let key in arr) {
                    arr[key].index = key;
                    arr[key].numberTxt = parseInt(key) + 1 + "、";
                    arr[key].startTime = formatDate(arr[key].startTime);
                    arr[key].duration = this.formatDuring(arr[key].duration * 1000);
                }
                zfdaDetail.relateInfo = arr;
                $(" .glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
                windowResize();
                _popover(); //设置信息提示框title
            }
        })
    },
    searchQzcsByWfbh: function (id) {
        ajax({
            url: '/gmvcs/audio/force/find/' + id,
            method: 'get',
            data: '',
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                //给强制措施信息框赋值
                zfdaDetail.rightInfo[0].data = ret.data.orgName;
                zfdaDetail.rightInfo[1].data = ret.data.userName + "(" + ret.data.userCode + ")";
                zfdaDetail.rightInfo[2].data = ret.data.pzbh;
                zfdaDetail.rightInfo[3].data = ret.data.wfsj ? moment(ret.data.wfsj).format("YYYY-MM-DD HH:mm:ss") : "-";
                zfdaDetail.rightInfo[4].data = ret.data.wfdz;
                zfdaDetail.rightInfo[5].data = ret.data.dsr;
                zfdaDetail.rightInfo[6].data = ret.data.jszh;
                zfdaDetail.rightInfo[7].data = ret.data.hphm;
                zfdaDetail.rightInfo[8].data = ret.data.hpzlmc;
                zfdaDetail.rightInfo[9].data = ret.data.wfxwmc;
                // zfdaDetail.relateInfo = [];
                let arr = ret.data.files || [];
                for (let key in arr) {
                    arr[key].index = key;
                    arr[key].numberTxt = parseInt(key) + 1 + "、";
                    arr[key].startTime = formatDate(arr[key].startTime);
                    arr[key].duration = this.formatDuring(arr[key].duration * 1000);
                }
                zfdaDetail.relateInfo = arr;
                $(" .glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
                windowResize();
                _popover(); //设置信息提示框title
            }
        })
    },
    searchSgclByWfbh: function (id) {
        ajax({
            url: '/gmvcs/audio/accident/find/' + id,
            method: 'get',
            data: '',
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                //给事故处理信息框赋值
                zfdaDetail.rightInfo[0].data = ret.data.orgName;
                zfdaDetail.rightInfo[1].data = ret.data.userName + "(" + ret.data.userCode + ")";
                zfdaDetail.rightInfo[2].data = ret.data.sgfssj ? moment(ret.data.sgfssj).format("YYYY-MM-DD HH:mm:ss") : "-";
                zfdaDetail.rightInfo[3].data = ret.data.clsj ? moment(ret.data.clsj).format("YYYY-MM-DD HH:mm:ss") : "-";
                zfdaDetail.rightInfo[4].data = ret.data.sgdd;
                zfdaDetail.rightInfo[5].data = ret.data.sgbh;
                // zfdaDetail.relateInfo = [];
                let arr = ret.data.files || [];
                for (let key in arr) {
                    arr[key].index = key;
                    arr[key].numberTxt = parseInt(key) + 1 + "、";
                    arr[key].startTime = formatDate(arr[key].startTime);
                    arr[key].duration = this.formatDuring(arr[key].duration * 1000);
                }
                zfdaDetail.relateInfo = arr;
                $(" .glmt_content .result_list").width(zfdaDetail.relateInfo.length * 376);
                windowResize();
                _popover(); //设置信息提示框title
            }
        })
    },
    clearPlayer: function (type) {
        var playing = type == '_dia' ? tjgl_form : ajgl_ck_Man;

        if (type == '') {
            $('.finishDelete').css('display', 'none');
        }
        playing['ocxPlayer' + type] = false;
        playing.video_url = '';
        // playing['ocxPlayer' + type] = false;
        playing.imgff = false;
        $('.outDateMedia' + type).css('display', 'none');
    },
    reduceWordForToggle: function () {
        $('.mtsecondpart .jj-inline-div .inlineSpan span:nth-child(2)').each(function () {

            if ($(this).text().length > 13) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.mtsecondpart .jj-inline-div .inlineSpan').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    reduceWordForAllInfo: function () {
        $('.allinfo-dialog span').each(function () {

            if ($(this).text().length > 15) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.allinfo-dialog').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text().split('：')[1] + '</div>';
            },
            animation: false
        });

    },
    reduceWordForGljq: function () {

        $('.gljq_inline .commonSpan div').each(function () {
            if ($(this).text().length > 15) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.gljq_inline').find($("[data-toggle='popover']")).each(function () {

            $(this).popover({

                container: 'body',
                placement: 'top',
                html: 'true',
                content: function () {
                    return '<div class="title-content">' + $(this).text() + '</div>';
                },
                animation: false
            });
        });

    },
    reduceWordForHead: function () {

        if ($('.ajgl-ck-head span').text().length > 15) {
            $('.ajgl-ck-head span').attr('title', $('.ajgl-ck-head span').text());
        }
    },
    setPopover: function (ele) {
        ele.on("mouseenter", function () {
            var _this = this;
            clearTimeout(_this.timer);
            _this.timer = setTimeout(function () {
                $('div').siblings(".popover").popover("hide");
                $(_this).popover("show");
            }, 500);
            // _this.timer2 = setTimeout(function(){
            //     $( _this).popover('hide');
            // },5000);
            $(this).siblings(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            clearTimeout(_this.timer);
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 100);
        }).on('shown.bs.popover', function () {
            $('.title-content').css('max-height', '80px');
            $('.popover').mouseleave(function () {
                $('.popover').hide();
            });
        });
    },
    reduceWordForCjxx: function () {
        $('.cjxx .innerSpan').each(function () {

            if ($(this).text().length > 15) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.cjxx').find($("[data-toggle='popover']")).popover({
            trigger: 'manual',
            container: 'body',
            placement: 'bottom',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });

    },
    reduceWordForJbxx: function () {
        $('.jbxx .innerSpan').each(function () {

            if ($(this).text().length > 14) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.jbxx').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'bottom',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });

    },
    getFirstDayOfWeek: function (date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    addShowInfo: function (type) {
        var className = type + 'Class';
        $('.modal-content').addClass(className);
        $('.modal-content').addClass('draggable');

        if (!$('.modal-dialog').hasClass('ajgl-showinfo')) {
            $('.modal-dialog').addClass('ajgl-showinfo');
        } else {
            return;
        }
    },
    searchCaseInfo: function () {
        ajgl_ck_Man.glmt_type.forEach(function (val, key) {
            ajgl_ck_Man[val] = [];
        });
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_data'] = [];
        });
        
    },
    addConfirmClass: function (type) {
        var className = type + 'Class';
        $('.modal-content').addClass(className);
        $('.modal-content').addClass('draggable');

        $('.upload_dialog .modal-content').removeClass(className);
        $('.upload_dialog .modal-content').removeClass('draggable');

        if (!$('.modal-dialog').hasClass('tjgl-modalDialog-cf')) {
            $('.modal-dialog').addClass('tjgl-modalDialog-cf');
            $('.upload_dialog .modal-dialog').removeClass('tjgl-modalDialog-cf');
        } else {
            return;
        }
    },
    clickGlmt: function (type) {
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_clickClass'] = 'glmt_cj';
            ajgl_ck_Man['glmt_' + val + '_show'] = false;
        });
        ajgl_ck_Man[type + '_clickClass'] = 'glmt_jj';
        ajgl_ck_Man['glmt_' + type + '_show'] = true;
        ajgl_ck_Man.glmt_mark = type;
        Tools.checker.setChecker();
        Tools.configGlmtNumber();
        Tools.configAllChecked();
    },
    clearGlmtCheckedFile: function () {
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_checked_data'] = [];
        });
    },
    clickDataGlType: function (type, table_type) {
        tjgl_form.glsj_type.forEach(function (val, key) {
            tjgl_form['gl_' + val + '_data_class'] = 'gl_sxt_data';
            tjgl_form[val + '_show'] = false;
        });
        tjgl_form['gl_' + type + '_data_class'] = 'gl_zfy_data';
        tjgl_form[type + '_show'] = true;
        tjgl_form.glsj_mark = type;
        tjgl_form.glsj_table_mark = table_type;
    },
    configGlmtNumber: function () {
        var type = ajgl_ck_Man.glmt_mark;
        ajgl_ck_Man.glmt_total = ajgl_ck_Man[type + '_data'].length;
        ajgl_ck_Man.glmt_selected = ajgl_ck_Man[type + '_checked_data'].length;
        ajgl_ck_Man.glmt_selected_total = ajgl_ck_Man.jq_checked_data.length + ajgl_ck_Man.cj_checked_data.length;
    },
    configAllChecked: function () {
        var type = ajgl_ck_Man.glmt_mark;
        var data = ajgl_ck_Man[type + '_data'];

        if (data.length == 0) {
            ajgl_ck_Man.allchecked = false;
            return;
        }
        ajgl_ck_Man.allchecked = data.every(function (el) {
            return el.checked;
        });
    },
    checker: (function () {
        var States = {
            'checkJQ': function (rid) {
                Tools.pushDataWithChecked('jq', rid);
            },
            'checkCJ': function (rid) {
                Tools.pushDataWithChecked('cj', rid);
            },
            'discheckJQ': function (rid) {
                Tools.spliceDataWithChecked('jq', rid);
            },
            'discheckCJ': function (rid) {
                Tools.spliceDataWithChecked('cj', rid);
            },
            'allcheck': function (checked) {
                var type = ajgl_ck_Man.glmt_mark;
                ajgl_ck_Man[type + '_data'].forEach(function (el) {
                    el.checked = checked;
                });
                ajgl_ck_Man[type + '_checked_data'] = checked ? ajgl_ck_Man[type + '_data'].concat() : [];
                Tools.configGlmtNumber();
            }
        };
        return {
            checkedWork: null,
            disCheckedWork: null,
            allChecked: null,
            setChecker: function () {
                this.checkedWork = States['check' + ajgl_ck_Man.glmt_mark.toUpperCase()];
                this.disCheckedWork = States['discheck' + ajgl_ck_Man.glmt_mark.toUpperCase()];
                this.allChecked = States['allcheck'];
            }
        };
    })(),
    pushDataWithChecked: function (type, rid) {

        var data = ajgl_ck_Man[type + '_data'],
            aim = null,
            data_selected = ajgl_ck_Man[type + '_checked_data'],
            exist = false;

        data_selected.forEach(function (val, index) {

            if (val.rid == rid) {
                exist = true;
                return;
            }
        });
        if (exist) {
            return;
        }
        for (var i = 0, len = data.length; i < len; i++) {

            if (data[i].rid == rid) {
                data[i].checked = true;
                aim = data[i];
                break;
            }
        };
        ajgl_ck_Man.allchecked = ajgl_ck_Man[type + '_data'].every(function (el) {
            return el.checked;
        });
        ajgl_ck_Man[type + '_checked_data'].push(aim);
        this.configGlmtNumber();
    },
    spliceDataWithChecked: function (type, rid) {

        //取消勾选
        ajgl_ck_Man.allchecked = false;

        var i = 0,
            len = ajgl_ck_Man[type + '_checked_data'].length;

        for (; i < len; i++) {

            if (ajgl_ck_Man[type + '_checked_data'][i].rid == rid) {
                ajgl_ck_Man[type + '_checked_data'][i].checked = false;
                ajgl_ck_Man[type + '_checked_data'].splice(i, 1);
                break;
            }
        };
        this.configGlmtNumber();
    },
    init: function () {

    }
};
avalon.filters.formatDate = function (str) {

    if (str == '' || str == null) {
        return '-';
    } else {
        return formatDate(str);
    }
};
avalon.filters.checkNull = function (str) {

    if (str === '' || str === null || (Array.isArray(str) && str.length === 0)) {
        return '-';
    } else {
        return str;
    }
};
let tjgl_confirm = avalon.define({
    $id: 'back-confirm',
    title: '提示'
});
//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}
let filePlayer = (function () {
    var States = {
        'picture': function (ret, dia) {
            if (ret.code == 0) {
                // delete_ocx();
                // dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');
                // var _self = this.playing;
                // _self['ocxPlayer' + dia] = false;
                // $('.player' + dia + '.ane-loading-mask').text('图片加载中...');
                // this.playing.loading = true;
                // if (dia == '_dia') {
                //     $('.ane-loading-mask').css('height', '484px');
                // }
                // _self.imgff = false;
                // if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL)) {
                //     Tools.sayError('请求图片数据失败');
                //     return;
                // }
                // setTimeout(() => {
                //     this.playing.src = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
                //     _self.imgff = true;
                //     $('.outDateMedia' + dia).css('display', 'none');
                //     _self.loading = false;
                // }, 10)
                // this.playing.loading = false;
                // this.playing.imgff = true;
                // dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;
                // _this.web_left = $(".media_img").offset().left;
                // _this.web_top = $(".media_img").offset().top;
                zfdaDetail.show_img = false;
                zfdaDetail.play_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
                zfdaDetail.show_img = true;
            } else {
                Tools.sayError('请求图片数据失败');
                return;
            }
        },
        'video': function (ret, dia) {
            this.playing.loading = false;
            zfdaDetail.show_img = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');
            if (ret.code == 0) {
                delete_ocx();
                this.playing.imgff = false;
                $('.outDateMedia' + dia).css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;
                this.playing.media_type = false;
                this.playing.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Tools.sayError('视频地址无效，无法播放');
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = false;
                    return;
                }

                setTimeout(() => {
                    this.playing.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300)
            } else {
                this.playing['ocxPlayer' + dia] = true;
                this.playing.play_status = false;
                Tools.sayError('请求视频数据失败');
            }
        },
        'audio': function (ret, dia) {
            this.playing.loading = false;
            zfdaDetail.show_img = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                delete_ocx();
                this.playing.imgff = false;
                $('.outDateMedia' + dia).css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;
                this.playing.media_type = true;
                this.playing.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Tools.sayError('语音地址无效，无法播放');
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = false;
                    return;
                }

                setTimeout(() => {
                    this.playing.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300)
            } else {
                this.playing['ocxPlayer' + dia] = true;
                this.playing.play_status = false;
                Tools.sayError('请求音频数据失败');
            }
            return;
        },
        playing: null
    };
    return {
        play: function (type, rid, dia) {

            if (type == '图片') {
                type = 'picture';
            } else if (type == '视频') {
                type = 'video';
            } else if (type == '音频') {
                type = 'audio';
            } else if (type == '文本') {
                type = 'word';

                if (dia == '_dia') {
                    Tools.saySuccess('文本文件类型添加关联后需下载查看');
                } else {
                    Tools.saySuccess('文本文件类型需下载查看');
                }
                return;
            } else {
                type = 'other';

                if (dia == '_dia') {
                    Tools.saySuccess('其它文件类型添加关联后需下载查看');
                } else {
                    Tools.saySuccess('其他文件类型需下载查看');
                }
                return;
            };
            States.playing = dia == '_dia' ? tjgl_form : ajgl_ck_Man;

            ajax({
                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + rid,
                // url: '/api/findVideoPlayByRid',
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {
                States[type](ret, dia);
            });
        }
    };
})();
//获取部门树
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

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}

//获取当前页面返回地址
function getGobackAddress() {
    let address = "";
    let webType = sessionStorage.getItem("webType");
    switch (webType) {
        case 'ajgl':
            address = 'zfsypsjglpt-zfda-ajgl_gongan';
            break;
        case 'jycx':
            address = 'zfsypsjglpt-zfda-jycx_jiaojing';
            break;
        case 'fxccf':
            address = 'zfsypsjglpt-zfda-fxccf_jiaojing';
            break;
        case 'qzcs':
            address = 'zfsypsjglpt-zfda-qzcs_jiaojing';
            break;
        case 'sgcl':
            address = 'zfsypsjglpt-zfda-sgcl_jiaojing';
            break;
        default:
            address = 'zfsypsjglpt-zfda-jqgl_gongan';
            break;
    }
    return address;

}

/*================== 弹出tooltips end =============================*/
function windowResize() {
    setTimeout(() => {
        if (zfdaDetail.relateInfo.length >= 0) {
            if (($(".glmt_content .result_list_panel").width() >= zfdaDetail.relateInfo.length * 376) || ($(".glmt_content .result_list_panel").width() >= ($(".glmt_content .result_list_panel .result_list").width() - Math.abs($(".glmt_content .result_list_panel .result_list").position().left)))) {
                zfdaDetail.nextStopClass = true;
            } else {
                zfdaDetail.nextStopClass = false;
            }
        }
    }, 500);
    
    zfdaDetail.showNumber = Math.floor($(".glmt_content .result_list_panel").width() / 376);
    
    if (uploadWindow.show) {
        setTimeout(() => {
            $("#iframe_zfsyps").css({
                width: 600,
                height: 400
            });
        }, 0);
    }

    if (relateCancelWindow.show) {
        setTimeout(() => {
            $("#iframe_zfsyps").css({
                width: 300,
                height: 178
            });
        }, 0);
    }

    if (relateWindow.show) {
        setTimeout(() => {
            $("#iframe_zfsyps").css({
                width: 930,
                height: 612
            });
        }, 0);
    }
}

/**
 *  排序
 *
 * @param {*} prop 根据prop属性进行排序
 * @returns
 */
function sortByIndex(prop) {
    return function (a, b) {
        var v1 = a[prop];
        var v2 = b[prop];
        if (!isNaN(Number(v1)) && !isNaN(Number(v2))) {
            v1 = Number(v1);
            v2 = Number(v2);
        }
        if (v1 < v2) {
            return -1;
        } else if (v1 > v2) {
            return 1;
        } else {
            return 0;
        }
    };
}

function arrFilter(arr, e) { 
    let temp = arr.filter(function(item){
        return (item.clfl == e);
    });
    return temp;
}

/*================== 弹出tooltips start =============================*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function () {
            let html = "";
            if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
            else if ($(this)[0].outerHTML.indexOf("data-title-img-five") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-five") + 21, $(this)[0].outerHTML.indexOf("data-title-img-five") + 26);
            else
                html = $(this)[0].innerText;
            return '<div class="title-content kphcjj-pop" style="max-width:250px">' + html + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popoverX('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
    });
}
/*================== 弹出tooltips end =============================*/

/*================== 3.6.8 办案区 ==========================================================================================*/
let baqAJTab_vm = avalon.define({
    $id: 'baqAJTab',
    isSary: false,
    handleAddBtn: function () {
        if (!baqAJTab_vm.isSary) {
            return; 
        }
        
        addJKSP_vm.show = true;
        $("body").css("overflow", "hidden");
        addJKSP_vm.topform_start_time = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        addJKSP_vm.topform_end_time = moment().format('YYYY-MM-DD HH:mm:ss');
        addJKSP_vm.inputJson={
            "ajbh": "",
            "baqId": "",
            "channelId": "",
            "deviceId": "",
            "endTime": "",
            "involvedPeopleCode": "",
            "mark": "",
            "startTime": "",
            "userCode": "",
            "userName": ""
        }
    },
    
    baqShowInfo:[],
    getBAQMonitorInfo(involvedPeopleCode) {
        let params = {
            "ajbh": sessionStorage.getItem("ajgl_bh"),
            // "ajbh": "Y5323263100002017080222",
            "involvedPeopleCode": involvedPeopleCode              
        }
        ajax({
            url: '/gmvcs/baq/case/queryBAQMonitorInfo',
            method: 'post',
            data: params
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取监控视频信息失败，请稍后再试');
                return;
            }
            if (result.data.length > 0) {
                let ret_data = [];
                avalon.each(result.data, function (index, item) {
                    let ret_obj = item;
                    ret_obj.fileNum = (item.fileNum=='-1'?'-':item.fileNum);
                    ret_obj.startTime = moment(item.startTime).format("YYYY-MM-DD HH:mm:ss") || "-";
                    ret_obj.endTime = moment(item.endTime).format("YYYY-MM-DD HH:mm:ss") || "-";                    
                    switch (item.status) {
                        case '00':
                            ret_obj.status = "未开始";
                            break;
                        case '01':
                            ret_obj.status = "下载中";  
                            break;
                        case '02':
                            ret_obj.status = "下载失败";  
                            break;
                        case '10':
                            ret_obj.status = "任务完成";  
                            break;
                        case '99':
                            ret_obj.status = "不限";   
                            break;
                        default:
                            ret_obj.status = "其它";       
                    }
                    ret_data.push(ret_obj);
                });
                baqAJTab_vm.baqShowInfo = [];
                baqAJTab_vm.baqShowInfo = ret_data;
                if (baqAJTab_vm.baqShowInfo.length > 0) {
                    $(".aj_info .infoPanel ul").hide();
                    _popover(); //设置信息提示框title
                }
            } else {
                baqAJTab_vm.baqShowInfo = [];
            }
            
        });
    },
    infoClick(e) {
        // $(".aj_info .infoPanel ul").hide();
        let target = "#baqAJTab ." + e.taskID + " ul";
        $(target).slideToggle();
        //筛选办案区的文件，展示在案件管理的详细页面的轮播功能
        let baqMediaArr = zfdaDetail.ajInfoArr[0].mediaInfo || [];
        if (baqMediaArr.length > 0) {
            let temArr = [];
            avalon.each(baqMediaArr, function (key, value) {
                if (value.taskId == e.taskID) {
                    temArr.push(value);
                }
            });
            zfdaDetail.relateInfo = temArr;
        }
    },
});
//涉案人员
let baqSaryselect_vm = avalon.define({
    $id: 'baqSaryselect_vm',
    category_options: [],
    selectInvolvedPersonCode:"",
    onChangeT(e) {
        let _this = this;
        _this.selectInvolvedPersonCode = e.target.value;
        baqAJTab_vm.getBAQMonitorInfo(e.target.value);
    },
    getInvolvedCasePerson(ajbh) {
        ajax({
            url: '/gmvcs/baq/case/getInvolvedCasePerson?ajbh=' + ajbh,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取涉案人员失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [{
                    "label": "全部",
                    "value":"99"
                }];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.involvedPersonCode;
                        ret_obj.label = item.involvedPersonName;

                        ret_data.push(ret_obj);
                    });
                    baqSaryselect_vm.category_options = ret_data;
                    baqAJTab_vm.isSary = true;
                } else {
                    baqAJTab_vm.isSary = false;
                }
             }
        });
    }
});
//添加监控视频
let addJKSP_vm = avalon.define({
    $id: 'addJKSP_vm',
    show: false,
    ifokBtn:{},
    title: "添加监控视频",
    topform_start_time: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
    topform_end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
    endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    //设备名称
    curSB:"",
    sb_options: [],
    //摄像头
    curSXT:"",
    sxt_options: [],
    //所属办案区
    curBAZX:"",
    BAZX_options: [],
    //涉案人员
    curSARY:"",
    category_options: [],
    //民警姓名
    curpolice:"",
    police_options: [],
    //摄像头在线状态
    channelStatus:false,
    inputJson: {
        "ajbh": "",
        "baqId": "",
        "channelId": "",
        "deviceId": "",
        "endTime": "",
        "involvedPeopleCode": "",
        "mark": "",
        "startTime": "",
        "userCode": "",
        "userName": ""
    },
    tree_baq: avalon.define({
        $id: 'tree_baq',
        rdata: [],
        checkedKeys: [],
        expandedKeys: [],
        checkType: '',
        id: '',
        selectedTitle: '',
        sjdw: "",
        curTree: "",
        getSelected(key, title, e) {
            addJKSP_vm.curBAZX = key;

            if (e.isBAQ) {
                this.id = key;
                addJKSP_vm.tree_baq.selectedTitle = title;
            } else {
                this.id = "";
                this.selectedTitle = "";
            }
        },
        select_change(e, selectedKeys) {
            if (selectedKeys == "") { return;}
            ajax({
                url: '/gmvcs/baq/case/getBaqDevicesInfo?baqID='+selectedKeys,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    showTips('error', '获取设备失败，请稍后再试');
                    return;
                }
                if (result.code == 0) {
                    let ret_data = [];
                    if (result.data != null && result.data.length != 0) {
                        avalon.each(result.data, function (index, item) {
                            let ret_obj = {};
                            ret_obj.value = item.deviceID;
                            ret_obj.label = item.deviceName;
    
                            ret_data.push(ret_obj);
                        });
                    }
                    addJKSP_vm.sxt_options = [];
                    addJKSP_vm.sb_options = [];
                    addJKSP_vm.sb_options = ret_data;
                    // addJKSP_vm.sxt_options = ret_data.;
                }
            });
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            let deptemp_child = [];
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (result.code == 0) {
                    getDepTree(result.data, deptemp_child);
                    treeObj.addNodes(treeNode, deptemp_child);

                    getOrgBaqInfo(treeNode.orgCode).then((result) => {
                        if (result.data) {
                            if (result.data.length == 0) { return;}
                            let treeData = [];
                            result.data.forEach(item => {
                                let treeNode = {};
                                treeNode.key = item.baqId;
                                treeNode.name = item.baqName ;
                                treeNode.title = item.baqName;
                                // treeNode.checkType = item.checkType;
                                // treeNode.orgCode = item.orgCode;
                                // treeNode.orgId = item.orgId;
                                // treeNode.orgPath = item.orgPath;
                                // treeNode.path = "/44010401/44030000/";
                                treeNode.icon = "/static/image/sszhxt/Droneonline.png";
                                treeNode.isBAQ = true;
                                treeData.push(treeNode);
                            });
                            treeObj.addNodes(treeNode, -1, treeData);
                        }
                    });
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
            });

        }
    }),
    handleCancel(e) {
        this.show = false;
        $("body").css("overflow", "auto");//修复滚动条弹出bug
    },
    handleOKStatus() {
        let _this = this;
        getChannelStatus(_this.curSB, _this.curSXT).then(result => {
            if (result.code != 0) {
                showTips('error', result.msg);
                return;
            }
            _this.channelStatus = true;
            _this.handleOk();
        });
    },
    
    handleOk() {
        let userNameTmp = "";
        if (addJKSP_vm.police_options.length > 0) {
            avalon.each(addJKSP_vm.police_options, function (k, v) {
                if (v.value ==addJKSP_vm.inputJson.userCode) {
                    userNameTmp = v.label;
                }
            });
        }

        if (Number(getTimeByDateStr(this.topform_start_time)) >  Number(getTimeByDateStr(this.topform_end_time))) {
            Tools.sayWarn('开始时间不能超过结束时间');
            return;
        }

        if ( Number(getTimeByDateStr(this.topform_end_time)) - Number(getTimeByDateStr(this.topform_start_time)) > 1 * 86400000) {
            Tools.sayWarn('下载时间间隔不能超过24小时，请重新设置！');
            return;
        }
        //判断设备通道是否在线
        if (!this.channelStatus) {
            Tools.sayWarn('设备摄像头不在线，请重新选择！');
            return;
        }
        let params = {
            "ajbh": sessionStorage.getItem("ajgl_bh"),
            // "ajbh": "Y5323263100002017080222",
            "baqId": this.curBAZX,
            "channelId": this.curSXT,
            "deviceId": this.curSB,
            "endTime": Number(getTimeByDateStr(this.topform_end_time)),
            "involvedPeopleCode": this.curSARY,
            "mark": this.inputJson.mark,
            "startTime": Number(getTimeByDateStr(this.topform_start_time)),
            "userCode": this.inputJson.userCode,
            "userName": userNameTmp
        }
        if (params.userCode=='') {
            showTips('warn', "请正确填写输入框！");
            return;
        }
        if (params.channelId=='') {
            showTips('warn', "暂无摄像头，无法添加下载视频任务！");
            return;
        }
        if (params.deviceId=='') {
            showTips('warn', "暂无设备，无法添加下载视频任务！");
            return;
        }
        ajax({
            url: '/gmvcs/baq/case/getBaqStorageInfo?baqID='+this.curBAZX,
            method: 'get',
            data: {}
        }).then(ret => {
            if (ret.code == 0) {
                ajax({
                    url: '/gmvcs/baq/case/addBAQMonitorInfo',
                    method: 'post',
                    data: params
                }).then(ret => {
                    if (ret.code != 0) {
                        showTips('error', ret.msg);
                        return;
                    }
                    if (ret.code == 0) {
                        showTips('success', "成功添加下载视频任务！");
                        addJKSP_vm.show = false;
                        $("body").css("overflow", "auto");
                        baqAJTab_vm.getBAQMonitorInfo("99");//初始化监控信息   
                    }
                });
            } else {
                showTips('warn', ret.msg);
            }
            
         });     
    },  
    
    startTimeHandleChange(e) {
        this.topform_start_time = e.target.value;        
    },
    endTimeHandleChange(e) {
        this.topform_end_time = e.target.value;        
    },
    onChangePolice(e) {
        let _this = this;
        _this.curpolice = e.target.value;
        addJKSP_vm.inputJson.userCode = e.target.value;
        // addJKSP_vm.inputJson.userName = addJKSP_vm.police_options[e.target.value].userName;
    },  
    onChangeT(e) {
        let _this = this;
        _this.curSARY = e.target.value;
    },  
    onChangeSB(e) {
        let _this = this;
        _this.curSB = e.target.value;
        if (e.target.value == "") { return;}
        ajax({
            url: '/gmvcs/baq/case/getDeviceChannelsInfo?deviceID='+e.target.value,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取摄像头失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.channelID;
                        ret_obj.label = item.channelName;

                        ret_data.push(ret_obj);
                    });
                }
                addJKSP_vm.sxt_options = [];
                addJKSP_vm.sxt_options = ret_data;
                if (ret_data.length > 0) { 
                    getChannelStatus(_this.curSB, ret_data[0].value).then(result => {
                        if (result.code != 0) {
                            showTips('error', result.msg);
                            // com-modal-btn-ok
                            addJKSP_vm.ifokBtn = {
                                "background":"#b2b2b2"
                            };
                            return;
                        }
                        addJKSP_vm.ifokBtn = {};
                        _this.channelStatus = true;
                    });
                }                
            }
        });
    },    
    onChangeSXT(e) {        
        let _this = this;
        _this.curSXT = e.target.value;
        if (e.denyValidate) { return;}
        getChannelStatus(_this.curSB, _this.curSXT).then(result => {
            if (result.code != 0) {
                showTips('error', result.msg);
                // com-modal-btn-ok
                addJKSP_vm.ifokBtn = {
                    "background":"#b2b2b2"
                };
                return;
            }
            addJKSP_vm.ifokBtn = {};
            _this.channelStatus = true;
        });
    },    
    onChangeBAZX(e) { 
        let _this = this;
        _this.curBAZX = e.target.value;
        if (e.target.value == "") { return;}
        ajax({
            url: '/gmvcs/baq/case/getBaqDevicesInfo?baqID='+e.target.value,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取设备失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.deviceID;
                        ret_obj.label = item.deviceName;

                        ret_data.push(ret_obj);
                    });
                }
                addJKSP_vm.sxt_options = [];
                addJKSP_vm.sb_options = [];
                addJKSP_vm.sb_options = ret_data;
                // addJKSP_vm.sxt_options = ret_data.;
            }
        });
    },
    getCaseareaAll(userCode) {
        ajax({
            url: '/gmvcs/baq/case/getUserBaqInfo?userCode='+userCode,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取办案中心失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.baqID;
                        ret_obj.label = item.baqName;

                        ret_data.push(ret_obj);
                    });
                }else{
                    addJKSP_vm.sb_options = [];
                    addJKSP_vm.sxt_options = [];
                }
                addJKSP_vm.BAZX_options = [];
                addJKSP_vm.BAZX_options = ret_data;
            } else {
                
            }
        });
    },
    getPoliceName() {
        let params = {
            "key": this.inputJson.userCode,
            "page": "0",
            "pageSize": "1"
        }
        ajax({
            url: '/gmvcs/uap/user/findByTerminalUserNameOrUserCode',
            method: 'post',
            data: params
        }).then(ret => {
            if (ret.code != 0) {
                showTips('error', ret.msg);
                return;
            }
            if (ret.code == 0) {
                let ret_data = [];
                if (ret.data != null && ret.data.length != 0) {
                    avalon.each(ret.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.userCode;
                        ret_obj.label = item.userName;

                        ret_data.push(ret_obj);
                    });
                }
                addJKSP_vm.police_options = [];
                addJKSP_vm.police_options = ret_data;
                // if (ret.data.length != 0) {
                //     addJKSP_vm.police_options=
                //     addJKSP_vm.inputJson.userName = ret.data[0].userName;
                // } else {
                //     addJKSP_vm.inputJson.userName = "";
                // }
                
            }
        });
    },
    getInvolvedCasePerson(ajbh) {
        ajax({
            url: '/gmvcs/baq/case/getInvolvedCasePerson?ajbh=' + ajbh,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                showTips('error', '获取涉案人员失败，请稍后再试');
                return;
            }
            if (result.code == 0) {
                let ret_data = [];
                if (result.data != null && result.data.length != 0) {
                    avalon.each(result.data, function (index, item) {
                        let ret_obj = {};
                        ret_obj.value = item.involvedPersonCode;
                        ret_obj.label = item.involvedPersonName;

                        ret_data.push(ret_obj);
                    });
                    addJKSP_vm.category_options = [];
                    addJKSP_vm.category_options = ret_data;
                } 
             }
        });
    },
    handleFocus(name, event) {
        // sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        // sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        // sbzygl.handleClear(event, name, this);
    }
});
function showTips(type, content, layout, duration, title) {
    notification[type]({
        title: title || "通知",
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}
function getTimeByDateStr(stringTime) {
    var s = stringTime.split(" ");
    var s1 = s[0].split("-");
    var s2 = s[1].split(":");
    if (s2.length == 2) {
        s2.push("00");
    }

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}
/**
 * @description: 相隔时间戳转对应时分秒
 * @param {String} startTime 
 * @param {String} endTime 
 * @return: 
 */
function getHoursMinSec(startTime, endTime) {
    let timeDiff = endTime - startTime;
    let hour = Math.floor(timeDiff / (3600*1000));
    timeDiff = timeDiff % (3600*1000);
    let minute = Math.floor(timeDiff/(60*1000));
    timeDiff = timeDiff % (60*1000);
    let second =  Math.floor(timeDiff / 1000);
    return hour + '时' + minute + '分' + second + '秒';
}
function getOrgBaqInfo(orgCode) {
    return ajax({
        // url: '/api/ccfwgl-chart',
        url: '/gmvcs/baq/case/getOrgBaqInfo?orgCode=' + orgCode,
        method: 'get',
        cache: false,
        data: null
    });
}

function getChannelStatus(deviceId, channelId) {
    return ajax({
        url: '/gmvcs/baq/case/getChannelStatus?deviceId=' + deviceId + '&channelId=' + channelId,
        method: 'get',
        data: {}
    });
}