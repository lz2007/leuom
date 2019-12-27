import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
let delete_ocx = require('/apps/common/common').delete_ocx;

import moment from 'moment';
import * as menuServer from '/services/menuService';
var storage = require('/services/storageService.js').ret;

export const name = "jdzxpt-kphc-detail";
require("./jdzxpt-kphc-detail.less");

let kphc_detail_vm;
avalon.component(name, {
    template: __inline("./jdzxpt-kphc-detail.html"),
    defaults: {
        //根据拼音字段获取6大业务不同的字段
        getTypeStr() {
            let str = "";
            switch (this.record_item.type) {
                case "jycx":
                    str = "violation";
                    break;
                case "fxccf":
                    str = "surveil";
                    break;
                case "qzcs":
                    str = "force";
                    break;
                case "sgcl":
                    str = "accident";
                    break;
                case "jqgl":
                    str = "policeSituation";
                    break;
                case "ajgl":
                    str = "case";
                    break;
            }
            return str;
        },

        //播放器相关
        playUrl: "",
        web_width: "",
        web_height: "",
        play_status: false,
        is_play: true,
        scheduleShow: true,
        show_timeout: false,
        show_GMPlayer: false,
        show_img: false,
        show_other: false,
        media_no_img: false,

        //下载地址
        downloadUrl: "",

        //弹窗
        cancelText: "取消",
        kphc_dialog_width: 440,
        kphc_dialog_height: 240,
        kphc_dialog_show: false, //提示弹窗

        //考评弹窗
        kpShow: false,
        evaluationOk() {
            if (kphc_kp_dialog.checkedArr.length == 0 && kphc_kp_dialog.kpTxt == "") {
                kphc_kp_dialog.commentFormat = "inline-block";
                return;
            }

            let str = this.getTypeStr();
            let ajaxUrl = `/gmvcs/audio/${str}/eva`;
            let evaInfo = {
                "comment": kphc_kp_dialog.kpTxt,
                "evaItems": [],
            };

            for (let i = 0; i < kphc_kp_dialog.checkBoxOptions.length; i++) {
                let obj = {
                    "code": kphc_kp_dialog.checkBoxOptions[i].value,
                    "name": kphc_kp_dialog.checkBoxOptions[i].label,
                    "check": $.inArray(kphc_kp_dialog.checkBoxOptions[i].value, kphc_kp_dialog.checkedArr) > -1 ? true : false
                };
                evaInfo.evaItems.push(obj);
            }

            let data = {
                "bh": this.record_item.id,
                "evaInfo": evaInfo,
            }

            ajax({
                url: ajaxUrl,
                method: 'post',
                data: data
            }).then(ret => {
                if (ret.code != 0) {
                    notification.error({
                        message: ret.msg,
                        title: '通知'
                    });
                    return;
                }

                this.kpShow = false;
                this.scheduleShow = true;
                $("#iframe_jdzxpt").hide();

                this.kpBtn = false;
                this.kpTab = true;
                this.hcBtn = true;
                this.hcTab = false;

                this.evaluationContent = {
                    "orgName": ret.data.evaInfo.orgName,
                    "userName": ret.data.evaInfo.userName,
                    "createTime": moment(ret.data.evaInfo.createTime).format("YYYY-MM-DD HH:mm:ss"),
                    "result": ret.data.evaInfo.passed ? "通过" : ret.data.evaInfo.result,
                    "comment": ret.data.evaInfo.comment,
                };
            });
        },
        evaluationCancel() {
            this.kpShow = false;
            this.scheduleShow = true;
            kphc_kp_dialog.kpTxt = "";
            $("#iframe_jdzxpt").hide();
        },

        //核查弹窗
        hcShow: false,
        checkOk() {
            if (kphc_hc_dialog.scoreFormat == 'inline-block') {
                return;
            }

            if (kphc_hc_dialog.hcTxt == "") {
                kphc_hc_dialog.commentFormat = 'inline-block';
                return;
            }

            let str = this.getTypeStr();
            let ajaxUrl = `/gmvcs/audio/${str}/review`;
            let reviewInfo = {
                "comment": kphc_hc_dialog.hcTxt, //意见
                "deduction": kphc_hc_dialog.score || "0", //分数
                "real": kphc_hc_dialog.radioState == "0" ? true : false, //是否属实
            };

            let data = {
                "bh": this.record_item.id,
                "reviewInfo": reviewInfo,
            }

            ajax({
                url: ajaxUrl,
                method: 'post',
                data: data
            }).then(ret => {
                if (ret.code != 0) {
                    notification.error({
                        message: ret.msg,
                        title: '通知'
                    });
                    return;
                }

                this.hcShow = false;
                this.scheduleShow = true;
                $("#iframe_jdzxpt").hide();

                this.kpBtn = false;
                this.kpTab = true;
                this.hcBtn = false;
                this.hcTab = true;

                this.checkContent = {
                    "orgName": ret.data.reviewInfo.orgName,
                    "userName": ret.data.reviewInfo.userName,
                    "createTime": moment(ret.data.reviewInfo.createTime).format("YYYY-MM-DD HH:mm:ss"),
                    "real": ret.data.reviewInfo.real ? "情况属实" : "情况不属实",
                    "comment": ret.data.reviewInfo.comment,
                    "deduction": ret.data.reviewInfo.deduction,
                };
            });
        },
        checkCancel() {
            this.hcShow = false;
            this.scheduleShow = true;
            kphc_hc_dialog.hcTxt = "";
            $("#iframe_jdzxpt").hide();
        },

        //信息切换
        selectIndex: 0,
        evaluationContent: {},
        checkContent: {},
        selectTab(e) {
            this.selectIndex = e;

            if (this.ajglShow) {
                if (this.selectIndex == "0") {
                    this.handelMediaInfo(this.caseBaseFiles);
                }

                if (this.selectIndex == "3") {
                    this.jcjInfoArr = this.jcjInfoArr.sort(sortByIndex('index'));

                    $(".kphc_info .receivePanel .infoPanel ul").css({
                        "display": "none"
                    });
                    $(".kphc_info .receivePanel .infoPanel:eq(0) ul").css({
                        "display": "block"
                    });

                    this.handelMediaInfo(this.jcjInfoArr[0].mediaInfo);
                }

                if (this.selectIndex == "4") {
                    this.dataSelectClick(3);
                }
            }

            _popover();
        },
        //办案区信息
        dataSelectTab: 3,
        dataSelectClick(e) {
            this.dataSelectTab = e;
            let arr = arrFilter(this.caseBaseFiles, "0" + e);
            this.handelMediaInfo(arr);
        },

        kpBtn: false,
        kpTab: false,
        hcBtn: false,
        hcTab: false,
        getState(evaInfo, reviewInfo) { //判断显示状态
            let evaInfoFlag = evaInfo ? true : false;
            let reviewInfoFlag = reviewInfo ? true : false;
            if (evaInfoFlag) { //有考评信息
                if (reviewInfoFlag) { //有考评-有核查信息
                    this.kpBtn = false;
                    this.kpTab = true;
                    this.hcBtn = false;
                    this.hcTab = true;

                    this.checkContent = {
                        "orgName": reviewInfo.orgName,
                        "userName": reviewInfo.userName,
                        "createTime": moment(reviewInfo.createTime).format("YYYY-MM-DD HH:mm:ss"),
                        "real": reviewInfo.real ? "情况属实" : "情况不属实",
                        "comment": reviewInfo.comment,
                        "deduction": reviewInfo.deduction,
                    };
                } else { //有考评-无核查信息
                    this.kpBtn = false;
                    this.kpTab = true;
                    this.hcBtn = true;
                    this.hcTab = false;
                }

                this.evaluationContent = {
                    "orgName": evaInfo.orgName,
                    "userName": evaInfo.userName,
                    "createTime": moment(evaInfo.createTime).format("YYYY-MM-DD HH:mm:ss"),
                    "result": evaInfo.passed ? "通过" : evaInfo.result,
                    "comment": evaInfo.comment,
                };
            } else { //无考评信息
                this.kpBtn = true;
                this.kpTab = false;
                this.hcBtn = false;
                this.hcTab = false;
            }
        },
        kpBtnClick() {
            this.kphc_dialog_width = 440;
            this.kphc_dialog_height = 450;
            kphc_kp_dialog.kpTxt = "";
            kphc_kp_dialog.checkedArr = [];
            this.kpShow = true;
            this.scheduleShow = false;

            $("#iframe_jdzxpt").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_jdzxpt").css({
                    "opacity": 1
                });
                $("#iframe_jdzxpt").show();
            }, 600);
        },
        hcBtnClick() {
            this.kphc_dialog_width = 440;
            this.kphc_dialog_height = 422;
            kphc_hc_dialog.radioState = "0";
            kphc_hc_dialog.score = "";
            kphc_hc_dialog.hcTxt = "";
            kphc_hc_dialog.scoreDisable = true;
            this.hcShow = true;
            this.scheduleShow = false;

            $("#iframe_jdzxpt").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_jdzxpt").css({
                    "opacity": 1
                });
                $("#iframe_jdzxpt").show();
            }, 600);
        },

        //地图
        mapShow: true,
        mapAjaxData: {},
        mapStyle: {
            top: 180,
            height: 300,
        },

        //关联媒体
        showNumber: 0,
        nextStopClass: true,
        prevStopClass: true,
        prevClick() {
            if (this.prevStopClass)
                return;

            let left = $(".jdzxpt_kphc_detail .glmt_content .result_list").position().left + (this.showNumber * 376);
            $(".jdzxpt_kphc_detail .glmt_content .result_list").css({
                left: left
            });
            this.nextStopClass = false;
            if (left == 0) {
                this.prevStopClass = true;
            } else {
                this.prevStopClass = true;
                setTimeout(() => {
                    kphc_detail_vm.prevStopClass = false;
                }, 550);
            }
        },
        nextClick() {
            if (this.nextStopClass)
                return;

            let left = $(".jdzxpt_kphc_detail .glmt_content .result_list").position().left - (this.showNumber * 376);
            $(".jdzxpt_kphc_detail .glmt_content .result_list").css({
                left: left
            });
            this.prevStopClass = false;
            if ($(".jdzxpt_kphc_detail .glmt_content .result_list").width() - Math.abs(left) <= $(".jdzxpt_kphc_detail .glmt_content .result_list_panel").width()) {
                this.nextStopClass = true;
            } else {
                this.nextStopClass = true;
                setTimeout(() => {
                    kphc_detail_vm.nextStopClass = false;
                }, 550);
            }
        },

        //权限相关
        kphc_opt: avalon.define({
            $id: "kphc_opt",
            authority: { // 按钮权限标识
                // "DOWNLOAD": true, //考评核查_下载
                "KP": false, // 考评核查_考评
                "HC": false, // 考评核查_核查
            }
        }),

        basicInfo: [],
        basicInfoTitle: "",
        mediaInfoList: [],
        mediaInfoItem: {
            "labelShow": false,
            "saveTime": "-",
            "labelTypeName": "-",
            "childLabelTypeName": "-",
            "labelRemark": "-",
            "labelPersonnel": "-",
            "labelTime": "-",
        },
        fileName: "",
        resultLiClick(item) {
            this.fileName = item.fileName;
            $(".glmt_panel .result_list_panel li").removeClass("result-li-active");
            $(".glmt_panel .result_list_panel li:eq(" + item.index + ")").addClass("result-li-active");
            $(".glmt_panel .result_list_panel li:eq(" + item.index + ")").css({
                opacity: 0.8
            });

            this.mapAjaxData = {
                "deviceId": item.deviceId,
                "fileRid": item.fileRid,
                "fileType": item.fileType,
                "beginTime": item.beginTime,
                "endTime": item.endTime
            };

            // if (item.rid == "GO440100005665421545314770801") {
            //     item.type = 2;
            // }

            // if (item.rid == "GO440100005665421545316408508") {
            //     item.type = 3;
            // }

            // if (item.rid == "00000000_44010401901511048857201901020918340200201901020922168945") {
            //     item.saveTime = -2;
            // }

            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + item.rid,
                method: 'get',
                data: {}
            }).then(ret => {
                if (ret.code != 0) {
                    notification.error({
                        message: '获取媒体剩余储存天数失败！',
                        title: '通知'
                    });
                }

                if (ret.data) {
                    item.saveTime = ret.data.saveTime;
                }

                this.unClick_media = false;
                if (item.saveTime == -1) {
                    this.mediaInfoItem.saveTime = "永久存储";
                } else if (item.saveTime == -2) {
                    this.mediaInfoItem.saveTime = "已过期";
                    this.unClick_media = true;
                } else {
                    this.mediaInfoItem.saveTime = item.saveTime + "天";
                }

                ajax({
                    url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + item.rid,
                    // url: '/api/findVideoPlayByRid',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: '获取媒体播放信息失败！',
                            title: '通知'
                        });
                        return;
                    }

                    this.show_timeout = false;
                    this.show_GMPlayer = false;
                    this.show_img = false;
                    this.show_other = false;
                    this.media_no_img = false;

                    this.downloadUrl = result.data[0].storageFileURL || result.data[0].wsFileURL || result.data[0].storageTransFileURL || result.data[0].wsTransFileURL;
                    if (item.saveTime == "-2") { //判断文件是否过期
                        this.show_timeout = true;
                    } else {
                        let _this = this;
                        if (item.type == "0" || item.type == "1") { //视频||音频
                            setTimeout(() => {
                                _this.show_img = false;
                                if (!_this.show_GMPlayer) {
                                    _this.show_GMPlayer = true;
                                }
                                _this.play_status = false;
                                _this.playUrl = result.data[0].storageFileURL || result.data[0].wsFileURL;
                                // _this.playUrl = "http://10.10.17.93/mp4_test2.mp4";
                                _this.play_status = true;
                            }, 1000);
                        } else if (item.type == "2") { //图片
                            this.show_GMPlayer = false;
                            this.show_img = true;
                            if (this.downloadUrl) {
                                // this.playUrl = "http://10.10.17.93/car2.jpg";
                                this.playUrl = this.downloadUrl;
                                this.media_no_img = true;
                            }
                        } else {
                            this.show_GMPlayer = false;
                            this.show_img = false;
                            this.show_other = true;
                        }
                    }
                });
            });

            ajax({
                url: '/gmvcs/audio/basefile/label/info?rid=' + item.rid,
                method: 'get',
                data: {}
            }).then(ret => {
                if (ret.code == 0) {
                    if (ret.data) {
                        this.mediaInfoItem.labelShow = true;
                        this.mediaInfoItem.labelTypeName = ret.data.labelTypeName || "-";
                        this.mediaInfoItem.childLabelTypeName = ret.data.childLabelTypeName || "-";                        
                        this.mediaInfoItem.labelRemark = ret.data.labelRemark || "-";
                        // this.mediaInfoItem.labelPersonnel = ret.data.labelPersonnel || "-";
                        var labelPersonnel = ret.data.labeledByUserName +'('+ ret.data.labeledByUserCode+')';
                        this.mediaInfoItem.labelPersonnel = labelPersonnel || "-";
                        this.mediaInfoItem.labelTime = moment(ret.data.labelTime).format("YYYY-MM-DD HH:mm:ss") || "-";
                    } else {
                        this.mediaInfoItem.labelShow = false;
                        this.mediaInfoItem.labelTypeName = "-";
                        this.mediaInfoItem.childLabelTypeName = "-";   
                        this.mediaInfoItem.labelRemark = "-";
                        this.mediaInfoItem.labelPersonnel = "-";
                        this.mediaInfoItem.labelTime = "-";
                    }
                }

                _popover();
            })
        },

        getEvaluationList(url) { //获取考评项列表，处理后放到单选框组
            ajax({
                url: url,
                method: 'get',
                data: {}
            }).then(ret => {
                if (ret.code != 0) {
                    notification.error({
                        message: ret.msg,
                        title: '通知'
                    });
                    return;
                }

                for (let i = 0; i < ret.data.length; i++) {
                    let obj = {
                        label: ret.data[i].name,
                        value: ret.data[i].code
                    };

                    kphc_kp_dialog.checkBoxOptions.push(obj);
                }
            });
        },

        ajglShow: false,
        //初始化查询基础数据
        getFileInfo(item) {
            this.ajglShow = false;
            this.kpBtn = false;
            this.kpTab = false;
            this.hcBtn = false;
            this.hcTab = false;

            switch (item.type) {
                case "jycx":
                    ajax({
                        url: '/gmvcs/audio/violation/search/' + item.id,
                        method: 'get',
                        data: {}
                    }).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            return;
                        }

                        this.getState(ret.data.evaInfo, ret.data.reviewInfo);

                        this.basicInfo = [];
                        this.basicInfoTitle = '简易程序信息';
                        this.basicInfo.push({
                            title: "执勤部门：",
                            data: ret.data.orgName
                        });
                        this.basicInfo.push({
                            title: "执勤民警：",
                            data: ret.data.userName + "(" + ret.data.userCode + ")"
                        });
                        this.basicInfo.push({
                            title: "决定书编号：",
                            data: ret.data.jdsbh
                        });
                        this.basicInfo.push({
                            title: "违法时间：",
                            data: moment(ret.data.wfsj).format("YYYY-MM-DD HH:mm:ss")
                        });
                        this.basicInfo.push({
                            title: "违法地点：",
                            data: ret.data.wfdz
                        });
                        this.basicInfo.push({
                            title: "当事人：",
                            data: ret.data.dsr
                        });
                        this.basicInfo.push({
                            title: "驾驶证号：",
                            data: ret.data.jszh
                        });
                        this.basicInfo.push({
                            title: "车牌号码：",
                            data: ret.data.hphm
                        });
                        this.basicInfo.push({
                            title: "号牌种类：",
                            data: ret.data.hpzlmc
                        });
                        this.basicInfo.push({
                            title: "违法行为：",
                            data: ret.data.wfxwmc
                        });

                        this.handelMediaInfo(ret.data.files || []);
                    });

                    this.getEvaluationList('/gmvcs/audio/eva/items/trafficViolation');
                    break;

                case "fxccf":
                    ajax({
                        url: '/gmvcs/audio/surveil/search/' + item.id,
                        method: 'get',
                        data: {}
                    }).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            return;
                        }

                        this.getState(ret.data.evaInfo, ret.data.reviewInfo);

                        this.basicInfo = [];
                        this.basicInfoTitle = '非现场处罚信息';
                        this.basicInfo.push({
                            title: "执勤部门：",
                            data: ret.data.orgName
                        });
                        this.basicInfo.push({
                            title: "执勤民警：",
                            data: ret.data.userName + "(" + ret.data.userCode + ")"
                        });
                        this.basicInfo.push({
                            title: "车牌号码：",
                            data: ret.data.hphm
                        });
                        this.basicInfo.push({
                            title: "违法时间：",
                            data: moment(ret.data.wfsj).format("YYYY-MM-DD HH:mm:ss")
                        });
                        this.basicInfo.push({
                            title: "违法编号：",
                            data: ret.data.wfbh
                        });
                        this.basicInfo.push({
                            title: "决定书编号：",
                            data: ret.data.jdsbh
                        });
                        this.basicInfo.push({
                            title: "违法地点：",
                            data: ret.data.wfdz
                        });
                        this.basicInfo.push({
                            title: "违法行为：",
                            data: ret.data.wfxwmc
                        });

                        this.handelMediaInfo(ret.data.files || []);
                    });

                    this.getEvaluationList('/gmvcs/audio/eva/items/trafficViolation');
                    break;

                case "qzcs":
                    ajax({
                        url: '/gmvcs/audio/force/search/' + item.id,
                        method: 'get',
                        data: {}
                    }).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            return;
                        }

                        this.getState(ret.data.evaInfo, ret.data.reviewInfo);

                        this.basicInfo = [];
                        this.basicInfoTitle = '强制措施信息';
                        this.basicInfo.push({
                            title: "执勤部门：",
                            data: ret.data.orgName
                        });
                        this.basicInfo.push({
                            title: "执勤民警：",
                            data: ret.data.userName + "(" + ret.data.userCode + ")"
                        });
                        this.basicInfo.push({
                            title: "凭证编号：",
                            data: ret.data.pzbh
                        });
                        this.basicInfo.push({
                            title: "违法时间：",
                            data: moment(ret.data.wfsj).format("YYYY-MM-DD HH:mm:ss")
                        });
                        this.basicInfo.push({
                            title: "违法地点：",
                            data: ret.data.wfdz
                        });
                        this.basicInfo.push({
                            title: "当事人：",
                            data: ret.data.dsr
                        });
                        this.basicInfo.push({
                            title: "驾驶证号：",
                            data: ret.data.jszh
                        });
                        this.basicInfo.push({
                            title: "车牌号码：",
                            data: ret.data.hphm
                        });
                        this.basicInfo.push({
                            title: "号牌种类：",
                            data: ret.data.hpzlmc
                        });
                        let wfxw = "";
                        for (let j = 0; j < ret.data.wfxwmc.length; j++) {
                            wfxw += ret.data.wfxwmc[j];
                            if (j < ret.data.wfxwmc.length - 1) {
                                wfxw += "；";
                            }
                        }
                        this.basicInfo.push({
                            title: "违法行为：",
                            data: wfxw
                        });

                        this.handelMediaInfo(ret.data.files || []);
                    });

                    this.getEvaluationList('/gmvcs/audio/eva/items/trafficViolation');
                    break;

                case "sgcl":
                    ajax({
                        url: '/gmvcs/audio/accident/search/' + item.id,
                        method: 'get',
                        data: {}
                    }).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            return;
                        }

                        this.getState(ret.data.evaInfo, ret.data.reviewInfo);

                        this.basicInfo = [];
                        this.basicInfoTitle = '事故处理信息';
                        this.basicInfo.push({
                            title: "执勤部门：",
                            data: ret.data.orgName
                        });
                        this.basicInfo.push({
                            title: "处理民警：",
                            data: ret.data.userName + "(" + ret.data.userCode + ")"
                        });
                        this.basicInfo.push({
                            title: "事故发生时间：",
                            data: moment(ret.data.sgfssj).format("YYYY-MM-DD HH:mm:ss")
                        });
                        this.basicInfo.push({
                            title: "处理时间：",
                            data: moment(ret.data.clsj).format("YYYY-MM-DD HH:mm:ss")
                        });
                        this.basicInfo.push({
                            title: "事故地点：",
                            data: ret.data.sgdd
                        });
                        this.basicInfo.push({
                            title: "事故编号：",
                            data: ret.data.sgbh
                        });
                        this.basicInfo.push({
                            title: "备注：",
                            data: ret.data.bz
                        });

                        this.handelMediaInfo(ret.data.files || []);
                    });

                    this.getEvaluationList('/gmvcs/audio/eva/items/accidentHandling');
                    break;

                case "jqgl":
                    ajax({
                        url: '/gmvcs/audio/policeSituation/searchById/' + item.id,
                        method: 'post',
                        data: {}
                    }).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            return;
                        }

                        this.getState(ret.data.evaInfo, ret.data.reviewInfo);

                        this.basicInfo = [];
                        this.basicInfoTitle = '警情信息';
                        this.basicInfo.push({
                            title: "警情编号：",
                            data: ret.data.jqbh
                        });
                        this.basicInfo.push({
                            title: "处警单位：",
                            data: ret.data.cjdwmc
                        });
                        this.basicInfo.push({
                            title: "处警人：",
                            data: ret.data.cjrxm.length !== 0 ? ret.data.cjrxm : '-'
                        });
                        this.basicInfo.push({
                            title: "处警时间：",
                            data: ret.data.cjsj[0] ? moment(ret.data.cjsj[0]).format("YYYY-MM-DD HH:mm:ss") : '-'
                        });
                        this.basicInfo.push({
                            title: "到达现场时间：",
                            data: ret.data.ddxcsj[0] ? moment(ret.data.ddxcsj[0]).format("YYYY-MM-DD HH:mm:ss") : '-'
                        });
                        this.basicInfo.push({
                            title: "报警来源：",
                            data: ret.data.jlly
                        });
                        this.basicInfo.push({
                            title: "警情类别：",
                            data: ret.data.jqlbmc
                        });
                        this.basicInfo.push({
                            title: "报警内容：",
                            data: ret.data.bjnr
                        });
                        this.basicInfo.push({
                            title: "报警人：",
                            data: ret.data.bjrxm
                        });
                        this.basicInfo.push({
                            title: "报警电话：",
                            data: ret.data.bjrdh
                        });
                        this.basicInfo.push({
                            title: "报警时间：",
                            data: ret.data.bjsj ? moment(ret.data.bjsj).format("YYYY-MM-DD HH:mm:ss") : '-'
                        });
                        this.basicInfo.push({
                            title: "事发时间：",
                            data: ret.data.sfsj ? moment(ret.data.sfsj).format("YYYY-MM-DD HH:mm:ss") : '-'
                        });
                        this.basicInfo.push({
                            title: "事发地点：",
                            data: ret.data.sfdd
                        });
                        this.basicInfo.push({
                            title: "民警意见：",
                            data: ret.data.mjyj.length !== 0 ? ret.data.mjyj : '-'
                        });
                        this.basicInfo.push({
                            title: "关联案件：",
                            data: ret.data.relation ? "是" : "否"
                        });

                        let tempArr = [];
                        if (ret.data.preBaseFiles && ret.data.handelerBaseFiles) {
                            tempArr = ret.data.preBaseFiles.concat(ret.data.handelerBaseFiles);
                        } else if (ret.data.preBaseFiles && !ret.data.handelerBaseFiles) {
                            tempArr = ret.data.preBaseFiles;
                        } else if (!ret.data.preBaseFiles && ret.data.handelerBaseFiles) {
                            tempArr = ret.data.handelerBaseFiles;
                        }
                        this.handelMediaInfo(tempArr);
                    });

                    this.getEvaluationList('/gmvcs/audio/eva/items/policesituation');
                    break;

                case "ajgl":
                    this.ajglShow = true;
                    ajax({
                        url: '/gmvcs/audio/case/searchById/' + item.id,
                        method: 'post',
                        data: {}
                    }).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            return;
                        }

                        this.getState(ret.data.evaInfo, ret.data.reviewInfo);

                        this.basicInfo = [];
                        this.basicInfoTitle = '案件信息';
                        this.basicInfo.push({
                            title: "案件编号：",
                            data: ret.data.ajbh
                        });
                        this.basicInfo.push({
                            title: "受理单位：",
                            data: ret.data.sldwmc
                        });
                        this.basicInfo.push({
                            title: "案件类别：",
                            data: ret.data.ajlbmc
                        });
                        this.basicInfo.push({
                            title: "办案人员：",
                            data: ret.data.zbmjxm + "(" + ret.data.zbr + ")"
                        });
                        this.basicInfo.push({
                            title: "案件名称：",
                            data: ret.data.ajmc
                        });
                        this.basicInfo.push({
                            title: "报警内容：",
                            data: ret.data.jyaq
                        });
                        this.basicInfo.push({
                            title: "涉案人员：",
                            data: ret.data.involvedPeoples
                        });
                        this.basicInfo.push({
                            title: "案发时间：",
                            data: moment(ret.data.afsj).format("YYYY-MM-DD HH:mm:ss")
                        });
                        // this.basicInfo.push({
                        //     title: "案发事件：",
                        //     data: ret.data.hpzlmc
                        // });

                        this.caseBaseFiles = ret.data.caseBaseFiles || [];
                        this.handelMediaInfo(this.caseBaseFiles);

                        //根据警情编号，查询对应关联的警情信息
                        // let jqbhArr = ["JJ612301000000116968616dd311612a", "JJ612301000000116968616dd311612a"];
                        let jqbhArr = ret.data.policeSituation;
                        this.jcjInfoArr = [];
                        for (let i = 0; i < jqbhArr.length; i++) {
                            ajax({
                                url: '/gmvcs/audio/policeSituation/searchById/' + jqbhArr[i],
                                method: 'post',
                                data: '',
                                cache: false
                            }).then(result => {
                                let arr = [{
                                        title: "警情编号：",
                                        data: result.data.jqbh
                                    },
                                    {
                                        title: "事发地点：",
                                        data: result.data.sfdd
                                    },
                                    {
                                        title: "报警人：",
                                        data: result.data.bjrxm
                                    },
                                    {
                                        title: "报警电话：",
                                        data: result.data.bjrdh
                                    },
                                    {
                                        title: "报警内容：",
                                        data: result.data.bjnr
                                    },
                                    {
                                        title: "报警时间：",
                                        data: moment(result.data.bjsj).format("YYYY-MM-DD HH:mm:ss")
                                    },
                                    {
                                        title: "到达现场时间：",
                                        data: moment(result.data.ddxcsj[0]).format("YYYY-MM-DD HH:mm:ss")
                                    },
                                    {
                                        title: "处警人：",
                                        data: result.data.cjrxm
                                    },
                                    {
                                        title: "民警意见：",
                                        data: result.data.mjyj
                                    },
                                    {
                                        title: "处警单位：",
                                        data: result.data.cjdwmc
                                    },
                                    {
                                        title: "事发时间：",
                                        data: moment(result.data.sfsj).format("YYYY-MM-DD HH:mm:ss")
                                    },
                                    {
                                        title: "处警时间：",
                                        data: moment(result.data.cjsj[0]).format("YYYY-MM-DD HH:mm:ss")
                                    },
                                    {
                                        title: "报警来源：",
                                        data: result.data.jlly
                                    },
                                    {
                                        title: "警情类别：",
                                        data: result.data.jqlbmc
                                    },
                                    {
                                        title: "关联案件：",
                                        data: result.data.relationCase ? "是" : "否"
                                    }
                                ];

                                let obj = {
                                    index: i,
                                    title: result.data.jqmc,
                                    content: arr,
                                    mediaInfo: result.data.handelerBaseFiles || []
                                }

                                this.jcjInfoArr.push(obj);
                            });
                        }
                    });

                    this.getEvaluationList('/gmvcs/audio/eva/items/casemain');
                    break;
            }

            _popover();
        },
        caseBaseFiles: [],
        jcjInfoArr: [],
        infoClick(item) {
            $(".kphc_info .receivePanel .infoPanel ul").css({
                "display": "none"
            });
            $(".kphc_info .receivePanel .infoPanel:eq(" + item.index + ") ul").css({
                "display": "block"
            });

            this.handelMediaInfo(item.mediaInfo);
        },

        handelMediaInfo(item) { //更新关联媒体列表
            this.mediaInfoList = [];

            // if (item.length == 0) {
            //     renturn;
            // }

            for (let i = 0; i < item.length; i++) {
                let obj = {
                    "index": i,
                    "rid": item[i].rid,
                    "type": item[i].type,
                    //显示
                    "fileName": item[i].fileName, //文件名
                    "showFileName": (i + 1) + "、" + item[i].fileName, //编号、文件名
                    "user": item[i].userName + "（" + item[i].userCode + "）", //用户名+id
                    "startTime": moment(item[i].startTime).format("YYYY-MM-DD HH:mm:ss"), //拍摄时间
                    "duration": formatSeconds(item[i].duration), //媒体时长
                    "saveTime": item[i].saveTime, //剩余储存天数
                    "autoState": item[i].relevanceType && item[i].relevanceType == "ZDGL" ? true : false, //是否自动关联
                    //地图参数
                    "deviceId": item[i].deviceId,
                    "fileRid": item[i].rid,
                    "fileType": item[i].type,
                    "beginTime": item[i].startTime,
                    "endTime": item[i].endTime
                }

                this.mediaInfoList.push(obj);
            }

            _popover();

            $(".jdzxpt_kphc_detail .glmt_content .result_list").css({
                "left": "0"
            });
            $(".jdzxpt_kphc_detail .glmt_content .result_list").width(this.mediaInfoList.length * 376);
            this.prevStopClass = true;
            if (this.mediaInfoList.length == 0) {
                this.nextStopClass = true;
            }
            setTimeout(() => {
                windowResize();
            }, 100);
        },

        record_item: {},
        onInit(e) {
            kphc_detail_vm = e.vmodel;
            // let obj = {
            //     type: "jycx",
            //     id: "JYCX612401000000493483dfabec760b44",
            //     path: "/jdzxpt-dxcc-aj",
            // };
            // this.record_item = obj;
            this.record_item = storage.getItem("jdzxpt-kphc-detail");
            this.getFileInfo(this.record_item);

            setTimeout(() => {
                this.mapShow = true;
            }, 0);

            let pageFlag = /dxcc/.test(this.record_item.path) ? true : false;
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.JDZX_FUNC_JDZXXT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^EVA_FUNCTION_JDKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (pageFlag) { //定向抽查
                    switch (_this.record_item.type) {
                        case "jycx":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_DXCC_JYCX_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_DXCC_JYCX_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "fxccf":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_DXCC_FXCCF_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_DXCC_FXCCF_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "qzcs":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_DXCC_QZCS_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_DXCC_QZCS_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "sgcl":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_DXCC_SGCL_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_DXCC_SGCL_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "jqgl":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_DXCC_JQKP_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_DXCC_JQKP_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "ajgl":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_DXCC_AJKP_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_DXCC_AJKP_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                    }
                } else { //随机抽查
                    switch (_this.record_item.type) {
                        case "jycx":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_SJCC_JYCX_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_SJCC_JYCX_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "fxccf":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_SJCC_FXCCF_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_SJCC_FXCCF_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "qzcs":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_SJCC_QZCS_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_SJCC_QZCS_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "sgcl":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_SJCC_SGCL_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_SJCC_SGCL_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "jqgl":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_SJCC_JQKP_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_SJCC_JQKP_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                        case "ajgl":
                            avalon.each(func_list, function (k, v) {
                                switch (v) {
                                    case "EVA_FUNCTION_JDKP_SJCC_AJKP_KP":
                                        _this.kphc_opt.authority.KP = true;
                                        break;
                                    case "EVA_FUNCTION_JDKP_SJCC_AJKP_HC":
                                        _this.kphc_opt.authority.HC = true;
                                        break;
                                }
                            });
                            break;
                    }
                }
            });
        },
        onReady() {
            let _this = this;
            $(window).on('resize', windowResize);

            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    if (ev.preventDefault) {
                        ev.preventDefault();
                    } else {
                        ev.keyCode = 0;
                        ev.returnValue = false;
                    }

                    if (_this.kphc_dialog_show || _this.kpShow || _this.hcShow)
                        return;

                    kphc_detail_tips_dialog.operation_type = "3";
                    kphc_detail_tips_dialog.txt_rows = false;
                    kphc_detail_tips_dialog.title = "提示";
                    kphc_detail_tips_dialog.dialog_txt = "是否确认离开此页面？";
                    _this.kphc_dialog_width = 440;
                    _this.kphc_dialog_height = 227;

                    _this.cancelText = "取消";
                    _this.kphc_dialog_show = true;
                    _this.scheduleShow = false;

                    $("#iframe_jdzxpt").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_jdzxpt").css({
                            "opacity": 1
                        });
                        $("#iframe_jdzxpt").show();
                    }, 600);
                }
            });
            $(window).bind('beforeunload', function (event) { //ie
                $(window).unbind('beforeunload'); //在不需要时解除绑定   
                if (global.location.hash.indexOf("jdzxpt-kphc-detail") > -1)
                    avalon.history.setHash(_this.record_item.path);
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("jdzxpt-kphc-detail") > -1)
                    avalon.history.setHash(_this.record_item.path);
            });

            $(document.body).css({
                "min-height": "950px"
            });

            _this.show_GMPlayer = true;
            _this.web_width = $(".kphc_media").width();
            _this.web_height = $(".kphc_media").height();

            setTimeout(() => { //避免加载慢的时候播放器错位
                _this.web_width = $(".kphc_media").width();
                _this.web_height = $(".kphc_media").height();
            }, 1000);
        },
        onDispose() {
            //初始化变量
            kphc_kp_dialog.checkBoxOptions = [];
            this.mediaInfoList = [];
            this.mediaInfoItem = {
                "labelShow": false,
                "saveTime": "-",
                "labelTypeName": "-",
                "childLabelTypeName": "-",
                "labelRemark": "-",
                "labelPersonnel": "-",
                "labelTime": "-",
            };
            this.showNumber = 0;
            this.nextStopClass = true;
            this.prevStopClass = true;

            this.show_timeout = false;
            this.show_GMPlayer = false;
            this.show_img = false;
            this.show_other = false;
            this.media_no_img = false;

            this.playUrl = "";
            this.downloadUrl = "";
            this.unClick_media = true;
            this.play_status = false;
            this.is_play = true;

            this.mapShow = false;

            this.record_item = {};

            this.selectIndex = 0;
            this.kpBtn = false;
            this.kpTab = false;
            this.hcBtn = false;
            this.hcTab = false;

            $(document.body).css({
                "min-height": "auto"
            });
            $(window).off('resize', windowResize);

            $(document).unbind("keydown");
            $("#gm_webplayer").hide();

            storage.removeItem("jdzxpt-kphc-detail");
        },

        returnBtn() {
            delete_ocx();
            $(document).unbind("keydown");

            this.show_timeout = false;
            this.show_GMPlayer = false;
            this.show_img = false;
            this.show_other = false;
            this.media_no_img = false;

            $("#gm_webplayer").hide();
            avalon.history.setHash(this.record_item.path);
        },
        dialogCancel() {
            this.kphc_dialog_show = false;
            this.scheduleShow = true;
            $("#iframe_jdzxpt").hide();
        },
        move_return(a, b) {
            let _this = this;
            $("#iframe_jdzxpt").css({
                width: _this.kphc_dialog_width + "px",
                height: _this.kphc_dialog_height + "px",
                left: a,
                top: b
            });
        },
        dialogOk() {
            let _this = this;
            if (kphc_detail_tips_dialog.operation_type == "3") {
                this.kphc_dialog_show = false;
                this.scheduleShow = true;
                $(document).unbind("keydown");
                storage.removeItem("jdzxpt-kphc-detail");
                setTimeout(function () {
                    avalon.history.setHash(_this.record_item.path);
                }, 300);
            }

            this.kphc_dialog_show = false;
            this.scheduleShow = true;

            $("#iframe_jdzxpt").hide();
        },

        unClick_media: true,
        download() { //下载
            if (this.unClick_media) {
                return;
            }
            if (this.downloadUrl == "") {
                notification.warn({
                    message: '无法获取下载地址，请稍后再试！',
                    title: '通知'
                });
                return;
            }
            window.open(this.downloadUrl);
        },

        mediaInfoShow: false,
        mediaInfo_click() {
            this.mediaInfoShow = !this.mediaInfoShow;

            if (this.mediaInfoShow) {
                $("#iframe_jdzxpt").css({
                    "opacity": 0
                });
                this.kphc_dialog_width = 300;
                this.kphc_dialog_height = 285;
                setTimeout(function () {
                    $("#iframe_jdzxpt").css({
                        "opacity": 1,
                        "left": ($('.bzxx').position().left + 22) + "px",
                        "top": ($('.bzxx').position().top - 95) + "px",
                        "width": "300px",
                        "height": "285px",
                    });
                    $("#iframe_jdzxpt").show();
                }, 0);
            } else {
                $("#iframe_jdzxpt").hide();
            }
        }
    }
});

let kphc_detail_tips_dialog = avalon.define({
    $id: "kphc_detail_tips_dialog",
    title: "",
    dialog_txt: "",
    txt_rows: true, //true 两行 false 一行,
    operation_type: "1" // 1 提示媒体过期；2 更改存储天数的提示；3 按下F5的提示
});

let kphc_kp_dialog = avalon.define({
    $id: "kphc_kp_dialog",
    title: "考评",
    checkedArr: [],
    checkBoxOptions: [],
    handleChange: function (e) {
        this.checkedArr = e.target.value;
        if (this.commentFormat == "inline-block") {
            this.commentFormat = "none";
        }
    },
    kpTxt: "",
    commentFormat: "none",
    commentKeyUp: function () {
        if (this.commentFormat == "inline-block") {
            this.commentFormat = "none";
        }
    },
});

let kphc_hc_dialog = avalon.define({
    $id: "kphc_hc_dialog",
    title: "核查",
    score: "",
    scoreTip: "inline-block",
    scoreFormat: "none",
    commentFormat: "none",
    scoreKeyUp: function (e) {
        let temp = e.target.value;
        let scoreExp = new RegExp("^[0-9]*$"); //正则判断数字

        if (temp != "" && (!scoreExp.test(temp) || temp > 9999 || temp == 0)) {
            this.scoreTip = 'none';
            this.scoreFormat = 'inline-block';
        } else {
            this.scoreTip = 'inline-block';
            this.scoreFormat = 'none';
        }
    },
    commentKeyUp: function () {
        if (this.commentFormat == "inline-block") {
            this.commentFormat = "none";
        }
    },
    radioState: "0",
    radioOptions: [{
            label: '情况属实',
            value: '0'
        },
        {
            label: '情况不属实',
            value: '1'
        }
    ],
    scoreDisable: true,
    handleChange: function (e) {
        this.radioState = e.target.value;
        if (this.radioState == "0") {
            this.scoreDisable = true;
        } else {
            this.scoreDisable = false;
        }
        this.score = "";
        this.scoreTip = "inline-block";
        this.scoreFormat = "none";
    },
    hcTxt: "",
});

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
            return '<div class="title-content kphcjj-pop" style="max-width:300px;">' + html + '</div>';
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
function windowResize() {
    kphc_detail_vm.web_width = $(".kphc_media").width();
    kphc_detail_vm.web_height = $(".kphc_media").height();

    if (kphc_detail_vm.mediaInfoList.length > 0) {
        if (($(".jdzxpt_kphc_detail .glmt_content .result_list_panel").width() >= kphc_detail_vm.mediaInfoList.length * 376) || ($(".jdzxpt_kphc_detail .glmt_content .result_list_panel").width() >= ($(".jdzxpt_kphc_detail .glmt_content .result_list_panel .result_list").width() - Math.abs($(".jdzxpt_kphc_detail .glmt_content .result_list_panel .result_list").position().left)))) {
            kphc_detail_vm.nextStopClass = true;
        } else {
            kphc_detail_vm.nextStopClass = false;
        }
    }

    kphc_detail_vm.showNumber = Math.floor($(".jdzxpt_kphc_detail .glmt_content .result_list_panel").width() / 376);

    if ($("#iframe_jdzxpt").is(":visible")) {
        setTimeout(() => {
            $("#iframe_jdzxpt").css({
                width: kphc_detail_vm.kphc_dialog_width,
                height: kphc_detail_vm.kphc_dialog_height
            });
        }, 0);
    }
}

//秒 转 00:00:00格式
function formatSeconds(value) {
    var second = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时
    var result = "";
    // alert(second);
    if (second >= 60) {
        minute = parseInt(second / 60);
        second = parseInt(second % 60);
        // alert(minute+"-"+second);
        if (minute >= 60) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    }
    if (hour < 10)
        hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    result = hour + ":" + minute + ":" + second;
    return result;
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

//过滤数组
function arrFilter(arr, e) {
    let temp = arr.filter(function (item) {
        return (item.clfl == e);
    });
    return temp;
}