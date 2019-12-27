import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
let delete_ocx = require('/apps/common/common').delete_ocx;
let language_txt = require('../../../vendor/language').language;

import moment from 'moment';
import * as menuServer from '/services/menuService';
var storage = require('/services/storageService.js').ret;

export const name = "zfsypsjglpt-sypgl-zfjlysyp-detail";
require("./zfsypsjglpt-sypgl-zfjlysyp-detail.css");

let {
    mainIndex,
} = require('/services/configService');

let zfyps_detail_vm = null,
    rel_tag_num = true,
    zfysyp_detail_table_in_obj = {},
    search_condition = {};
avalon.component(name, {
    template: __inline("./zfsypsjglpt-sypgl-zfjlysyp-detail.html"),
    defaults: {
        cancelText: "取消",
        mediaBtn: true,
        zfsypsjglpt: language_txt.zfsypsjglpt.sypgl,
        modify_toggle: true,
        zfyps_dialog_show: false,
        add_rel_dialog: false,
        unClick_media: false,
        collection_site: "",
        zfyps_area: "",
        record_item: {},
        save_flag: true,
        list_index_1: true,
        list_index_2: false,
        list_index_3: false,
        rel_toggle: true, // true 显示关联信息
        tag_toggle: false, // true 显示标注信息
        no_rel_tag: false, // true 显示暂无关联信息
        list_loading: true, //查询关联信息时的loading gif
        media_info: {
            "saveTime": "-"
        },
        show_timeout: false,
        show_GMPlayer: false,
        show_img: false,
        show_other: false,
        media_no_img: false,
        play_url: "",
        media_type: false, //--fasle 视频；true 音频
        web_width: "",
        web_height: "",
        web_left: "",
        web_top: "",
        play_status: false,
        is_play: true,
        dialog_status: true,
        download_url: "",
        zfyps_close_locality: false,
        days: 0,
        block_num: 0,
        zfyps_dialog_width: 300,
        zfyps_dialog_height: 178,
        zfyps_area_disabled: true,
        collection_site_disabled: true,
        edit_save: true,
        // save_disabled: true,
        mapAjaxData: {},
        mapStyle: {
            top: 230,
            height: 300,
        },

        result_list: [],
        showNumber: 0,
        nextStopClass: false,
        prevStopClass: false,
        prevClick() {
            if (this.prevStopClass)
                return;

            let left = $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").position().left + (this.showNumber * 376);
            $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").css({
                left: left
            });
            this.nextStopClass = false;
            if (left == 0) {
                this.prevStopClass = true;
            } else {
                this.prevStopClass = true;
                setTimeout(() => {
                    zfyps_detail_vm.prevStopClass = false;
                }, 550);
            }
        },
        nextClick() {
            if (this.nextStopClass)
                return;

            let left = $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").position().left - (this.showNumber * 376);
            $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").css({
                left: left
            });
            this.prevStopClass = false;
            if ($(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").width() - Math.abs(left) <= $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list_panel").width()) {
                this.nextStopClass = true;
            } else {
                this.nextStopClass = true;
                setTimeout(() => {
                    zfyps_detail_vm.nextStopClass = false;
                }, 550);
            }
        },

        jcgl_arr: [],
        jcgl_click(e) {
            this.jcgl_arr.push(e);

            zfyps_detail_tips_dialog.operation_type = "5";
            zfyps_detail_tips_dialog.txt_rows = false;
            zfyps_detail_tips_dialog.title = "提示";
            zfyps_detail_tips_dialog.dialog_txt = "是否要解除该业务的关联？";
            this.zfyps_dialog_width = 300;
            this.zfyps_dialog_height = 178;

            this.cancelText = "取消";
            this.zfyps_dialog_show = true;
            this.dialog_status = false;

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

        opt_detail: avalon.define({
            $id: "opt_detail",
            authority: { // 按钮权限标识
                "CHECK_GG": false, //音视频库_执法仪拍摄_查看_更改
                "DOWNLOAD": false, //音视频库_执法仪拍摄_下载
                "BZXX": false, // 标注信息
                "TJGL": false, // 添加关联
                "SCGL": false, // 删除关联
                "GLXX": false // 关联信息
            }
        }),

        fileName: "",
        onInit(e) {
            zfyps_detail_vm = e.vmodel;

            tag_type_vm.curTag = "";
            tag_type_vm.tag_label = "";
            tag_type_son_vm.curTag = "";
            tag_type_son_vm.tag_label = "";

            change_time_vm.curTime = "";
            change_time_vm.time_type = ["1"];

            this.result_list = [];
            this.showNumber = 0;
            this.nextStopClass = false;
            this.prevStopClass = false;

            this.show_timeout = false;
            this.show_GMPlayer = false;
            this.show_img = false;
            this.show_other = false;
            this.media_no_img = false;

            this.mediaBtn = true;
            this.modify_toggle = true;

            this.play_url = "";
            this.play_status = false;
            this.is_play = true;

            this.list_index_1 = true;
            this.list_index_2 = false;
            this.list_index_3 = false;

            this.rel_toggle = true;
            this.tag_toggle = false;
            this.no_rel_tag = false;
            rel_tag_num = true;

            this.collection_site = "";
            this.zfyps_area = "";
            this.unClick_media = false;

            this.record_item = storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-detail");
            this.block_num = 0;

            relation_info_jj.checkedKey_arr = [];
            relation_info_jj.checked_arr = [];

            // setTimeout(() => {
            //     zfyps_detail_vm.mapAjaxData = {
            //         "deviceId": zfyps_detail_vm.record_item.deviceId,
            //         "fileRid": zfyps_detail_vm.record_item.rid,
            //         "fileType": zfyps_detail_vm.record_item.fileType,
            //         "beginTime": zfyps_detail_vm.record_item.beginTime,
            //         "endTime": zfyps_detail_vm.record_item.endTime
            //     };

            //     this.list_index_3 = true;
            // }, 0);

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_SYPGL_ZFYSYP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_CHECK_GG_JJ":
                            _this.opt_detail.authority.CHECK_GG = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_BZXX_JJ":
                            _this.opt_detail.authority.BZXX = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_GLXX_JJ":
                            _this.opt_detail.authority.GLXX = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DOWNLOAD_JJ":
                            _this.opt_detail.authority.DOWNLOAD = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_TJGL_JJ":
                            _this.opt_detail.authority.TJGL = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_SCGL_JJ":
                            _this.opt_detail.authority.SCGL = true;
                            break;
                    }
                });

                if (false == _this.opt_detail.authority.GLXX && true == _this.opt_detail.authority.BZXX) {
                    this.tag_btn();
                }
            });

            if (_this.record_item.is_tag) {
                _this.zfyps_area_disabled = true;
                _this.collection_site_disabled = true;
                _this.edit_save = true;
            } else {
                _this.zfyps_area_disabled = false;
                _this.collection_site_disabled = false;
                _this.edit_save = false;
            }

            getFileByRid(true);

            ajax({
                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + _this.record_item.rid,
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

                _this.download_url = result.data[0].storageFileURL || result.data[0].wsFileURL || result.data[0].storageTransFileURL || result.data[0].wsTransFileURL;
                if (_this.record_item.file_flag == "2") {
                    if (_this.download_url) {
                        _this.media_no_img = true;
                        _this.play_url = _this.download_url;
                    }
                } else
                    _this.play_url = result.data[0].storageFileURL || result.data[0].wsFileURL;
                // _this.play_url = "http://10.10.17.93/mp4_test2.mp4";

                if (!_this.unClick_media) {
                    if (_this.record_item.file_flag == "0" || _this.record_item.file_flag == "1") { //视频 && 音频
                        if (_this.record_item.file_flag == "0")
                            _this.media_type = false;
                        if (_this.record_item.file_flag == "1")
                            _this.media_type = true;

                        _this.show_GMPlayer = true;

                        _this.web_width = $(".web_player").width();
                        _this.web_height = $(".web_player").height();
                        _this.web_left = $(".zfyps_video").offset().left;
                        _this.web_top = $(".zfyps_video").offset().top;

                        _this.play_status = true;

                        $(window).resize(function () {
                            _this.web_width = $(".web_player").width();
                            _this.web_height = $(".web_player").height();
                        });
                    } else if (_this.record_item.file_flag == "2") { //图片
                        _this.show_img = true;
                        _this.web_left = $(".media_img").offset().left;
                        _this.web_top = $(".media_img").offset().top;
                    } else
                        _this.show_other = true;
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

                    if (_this.zfyps_dialog_show)
                        return;

                    zfyps_detail_tips_dialog.operation_type = "3";
                    zfyps_detail_tips_dialog.txt_rows = false;
                    zfyps_detail_tips_dialog.title = "提示";
                    zfyps_detail_tips_dialog.dialog_txt = "是否确认离开此页面？";
                    _this.zfyps_dialog_width = 300;
                    _this.zfyps_dialog_height = 178;

                    _this.cancelText = "取消";
                    _this.zfyps_dialog_show = true;
                    _this.dialog_status = false;

                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                }
            });
            $(window).bind('beforeunload', function (event) { //ie
                $(window).unbind('beforeunload'); //在不需要时解除绑定   
                if (global.location.hash.indexOf("zfsypsjglpt-sypgl-zfjlysyp-detail") > -1)
                    avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-main");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-sypgl-zfjlysyp-detail") > -1)
                    avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-main");
            });

            setTimeout(() => {
                _this.tag_btn();
            }, 300);

            $(document.body).css({
                "min-height": "950px"
            });

            this.$watch("edit_save", (v) => {
                if (v) {
                    $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_tag").addClass("inputState");
                } else {
                    $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_tag").removeClass("inputState");
                    setChildType(tag_type_vm.tag_type_jj[0], tag_type_vm.child_typeCode);
                }
            });
            this.$fire('edit_save', this.edit_save);
        },
        onDispose() {
            relation_info_jj.selectItem = "1";
            zfyps_detail_vm = null;
            $("#iframe_zfsyps").hide();
            $("#iframe_others").hide();

            $(document.body).css({
                "min-height": "auto"
            });
            $(window).off('resize', windowResize);

            $(document).unbind("keydown");
            $("#gm_webplayer").hide();

            storage.removeItem("zfsypsjglpt-sypgl-zfjlysyp-detail");
        },
        returnBtn() {
            delete_ocx();

            relation_info_jj.one_data = [];
            relation_info_jj.three_data = [];
            relation_info_jj.aj_data = [];
            relation_info_jj.jq_data = [];
            relation_info_jj.relation_list_sum = 0;

            $(document).unbind("keydown");
            this.show_timeout = false;
            this.show_GMPlayer = false;
            this.show_img = false;
            this.show_other = false;
            this.media_no_img = false;

            $("#gm_webplayer").hide();

            storage.setItem("zfsypsjglpt-yspk-zfypsjj-returnFlag", true);
            // storage.removeItem("zfsypsjglpt-sypgl-zfjlysyp-detail");
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-main");
        },
        dialogCancel() {
            this.jcgl_arr = [];
            this.zfyps_dialog_show = false;
            this.dialog_status = true;
            $("#iframe_zfsyps").hide();
        },
        move_return(a, b) {
            let _this = this;
            $("#iframe_zfsyps").css({
                width: _this.zfyps_dialog_width + "px",
                height: _this.zfyps_dialog_height + "px",
                left: a,
                top: b
            });
        },
        dialogOk() {
            if (zfyps_detail_tips_dialog.operation_type == "2") {
                ajax({
                    url: '/gmvcs/audio/basefile/update/exp?rid=' + this.record_item.rid + '&days=' + this.days,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '更改存储天数成功！',
                            title: '通知'
                        });
                        if (this.days == "-1") {
                            this.media_info.save_time_num = -1;
                            this.media_info.saveTime = "永久存储";
                        } else {
                            this.media_info.save_time_num = this.days;
                            this.media_info.saveTime = this.days + "天";
                        }

                        if ($("#iframe_others").is(":visible")) {
                            if (zfyps_detail_vm.mediaInfoShow) {
                                setTimeout(function () {
                                    $("#iframe_others").css({
                                        "left": ($('.mtxx').position().left + 22) + "px",
                                        "top": ($('.mtxx').position().top - 95) + "px",
                                        "width": "300px",
                                        "height": "285px",
                                    });
                                }, 0);
                                setTimeout(function () {
                                    zfyps_detail_vm.dialog_status = false;
                                }, 300);
                            }
                        }
                    }
                    this.mediaBtn = true; //显示更改按钮
                    this.modify_toggle = true;
                });

            }
            if (zfyps_detail_tips_dialog.operation_type == "3") {
                this.zfyps_dialog_show = false;
                this.dialog_status = true;
                $(document).unbind("keydown");
                setTimeout(function () {
                    // if (document.getElementById('gm_webplayer').style.display != "none") {
                    //     $("#gm_webplayer").hide();
                    // }
                    avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-main");
                }, 300);
            }
            if (zfyps_detail_tips_dialog.operation_type == "5") {
                relation_info_jj.delete_rel(this.jcgl_arr);
                this.jcgl_arr = [];
            }

            this.zfyps_dialog_show = false;
            this.dialog_status = true;

            $("#iframe_zfsyps").hide();
        },
        confirmBtn(value) {
            this.days = 0;
            let save_days = this.media_info.save_time_num;
            if (!value)
                this.days = 90;
            else {
                if (value == "1")
                    this.days = 90;
                if (value == "2")
                    this.days = 180;
                if (value == "3")
                    this.days = 365;
                if (value == "4")
                    this.days = -1;
            }

            if ((this.days != -1 && save_days > this.days) || (save_days == -1 && this.days != -1)) {
                zfyps_detail_tips_dialog.operation_type = "2";
                zfyps_detail_tips_dialog.txt_rows = true;
                zfyps_detail_tips_dialog.title = "提示";
                zfyps_detail_tips_dialog.dialog_txt = "设置存储天数小于当前存储天数，有可能导致该文件立即被删除。是否继续您的操作？";
                this.zfyps_dialog_width = 410;
                this.zfyps_dialog_height = 220;
                this.cancelText = "取消";

                this.zfyps_dialog_show = true;
                this.dialog_status = false;

                $("#iframe_zfsyps").css({
                    "opacity": 0
                });
                setTimeout(function () {
                    $("#iframe_zfsyps").css({
                        "opacity": 1
                    });
                    $("#iframe_zfsyps").show();
                }, 600);

                if (!$(".zfyps_dialog_common").hasClass("dialog_big_footer"))
                    $(".zfyps_dialog_common").addClass("dialog_big_footer");
            } else {
                ajax({
                    url: '/gmvcs/audio/basefile/update/exp?rid=' + this.record_item.rid + '&days=' + this.days,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '更改存储天数成功！',
                            title: '通知'
                        });
                        if (this.days == "-1") {
                            this.media_info.save_time_num = -1;
                            this.media_info.saveTime = "永久存储";
                        } else {
                            this.media_info.save_time_num = this.days;
                            this.media_info.saveTime = this.days + "天";
                        }

                        if ($("#iframe_others").is(":visible")) {
                            if (this.mediaInfoShow) {
                                setTimeout(function () {
                                    $("#iframe_others").css({
                                        "left": ($('.mtxx').position().left + 22) + "px",
                                        "top": ($('.mtxx').position().top - 95) + "px",
                                        "width": "300px",
                                        "height": "285px",
                                    });
                                    zfyps_detail_vm.dialog_status = false;
                                }, 0);
                            }
                        }
                    }
                    // this.mediaBtn = true; //显示更改按钮
                    // this.modify_toggle = true;
                });
            }
        },
        modifyBtn() {
            if (this.media_info.save_time_num == "-2") {
                return;
            }

            this.mediaBtn = false; //显示确定按钮
            this.modify_toggle = false;
            let save_days = this.media_info.save_time_num;
            if (save_days == -1)
                change_time_vm.time_type = ["4"];
            else {
                if (0 < save_days && 90 >= save_days)
                    change_time_vm.time_type = ["1"];
                else if (90 < save_days && 180 >= save_days)
                    change_time_vm.time_type = ["2"];
                else if (180 < save_days && 365 >= save_days)
                    change_time_vm.time_type = ["3"];
                else if (365 < save_days)
                    change_time_vm.time_type = ["4"];
            }
        },
        input_area() {
            // if (tag_type_vm.tag_type_jj[0] == "0" && this.collection_site == "" && this.zfyps_area == "")
            //     this.save_disabled = false;
            // else
            // this.save_disabled = true;
        },
        rel_btn() { //显示关联信息
            let _this = this;
            this.list_index_1 = true;
            this.list_index_2 = false;
            // this.list_index_3 = false;
            _this.rel_toggle = true;
            _this.tag_toggle = false;
            if (!rel_tag_num) {
                _this.rel_toggle = false;
                _this.no_rel_tag = true;
            }

            $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_list .relation_li_border").hide();
            $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_list .relation_li_border:eq(" + _this.block_num + ")").show();
            _popover();
        },
        tag_btn() { //显示标注信息
            let _this = this;
            if (this.media_info.save_time_num == "-2") {
                return;
            }

            this.save_flag = true;
            this.list_index_1 = false;
            this.list_index_2 = true;
            // this.list_index_3 = false;
            this.rel_toggle = false;
            this.tag_toggle = true;
            this.no_rel_tag = false;

            $(".locality_panel").width($(".dataFormBox_width").width() - 75);
            $(".locality_panel .form-control-input").width($(".locality_panel").width() - 24);
            $(".dataFormBox_tag .formInput").width($(".dataFormBox_tag").width() - 121);
            $(".zfyps_area").width($(".mark_info").width() - 114);

            $(window).resize(function () {
                $(".locality_panel").width($(".dataFormBox_width").width() - 75);

                if (_this.zfyps_close_locality)
                    $(".locality_panel .form-control-input").width($(".locality_panel").width() - 34);
                else
                    $(".locality_panel .form-control-input").width($(".locality_panel").width() - 24);

                $(".dataFormBox_tag .formInput").width($(".dataFormBox_tag").width() - 121);
                $(".zfyps_area").width($(".mark_info").width() - 114);
            });

            ajax({
                url: '/gmvcs/audio/basefile/label/types',
                method: 'get',
                // url: '/api/label_types',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                if (result.code == 0) {
                    let ret_data = [{
                        value: "0",
                        label: "无"
                    }];
                    if (result.data != null && result.data.length != 0) {
                        avalon.each(result.data, function (index, item) {
                            let ret_obj = {};
                            ret_obj.value = item.code;
                            ret_obj.label = item.name;

                            ret_data.push(ret_obj);
                        });
                    }
                    tag_type_vm.tag_options = ret_data;
                    tag_type_vm.tag_type_jj = ["0"];
                }

                ajax({
                    url: '/gmvcs/audio/basefile/label/info/?rid=' + _this.record_item.rid,
                    // url: '/api/label_info',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: '获取标注信息失败，请稍后再试！',
                            title: '通知'
                        });
                        return;
                    }
                    if (result.data != null) {
                        tag_type_vm.tag_label = result.data.labelTypeName || "";
                        tag_type_son_vm.tag_label = result.data.childLabelTypeName || "";


                        if (result.data.labelTypeId != "" && result.data.labelTypeId != null) {
                            let normal = false;
                            avalon.each(tag_type_vm.tag_options, function (index, item) {
                                if (result.data.labelTypeId == item.value) {
                                    normal = true;
                                }
                            }); //判断是否存在标注类型
                            // //标注子类
                            // avalon.each(tag_type_son_vm.tag_options, function (index, item) {
                            //     if (result.data.childLabelTypeId == item.value) {
                            //         normal = true;
                            //     }
                            // });
                            if (normal) {
                                tag_type_vm.tag_type_jj = new Array(result.data.labelTypeId.toString());
                                if (result.data.childLabelTypeName) {
                                    tag_type_vm.child_typeName = result.data.childLabelTypeName.toString();
                                    tag_type_vm.child_typeCode = result.data.childLabelTypeId.toString();
                                }
                            } else {
                                tag_type_vm.tag_type_jj = new Array(tag_type_vm.tag_options[0].value);
                                if (result.data.childLabelTypeName) {
                                    tag_type_vm.child_typeName = result.data.childLabelTypeName.toString();
                                    tag_type_vm.child_typeCode = result.data.childLabelTypeId.toString();
                                }
                            }
                        }
                        if (result.data.location != null)
                            _this.collection_site = result.data.location;
                        if (result.data.labelRemark != null)
                            _this.zfyps_area = result.data.labelRemark;
                    } else {
                        tag_type_vm.tag_label = "";
                    }

                    if (this.save_flag == true) {
                        this.save_flag = false;
                    }
                });
            });
        },
        loc_btn() {
            zfyps_detail_vm.mapAjaxData = {
                "deviceId": zfyps_detail_vm.record_item.deviceId,
                "fileRid": zfyps_detail_vm.record_item.rid,
                "fileType": zfyps_detail_vm.record_item.fileType,
                "beginTime": zfyps_detail_vm.record_item.beginTime,
                "endTime": zfyps_detail_vm.record_item.endTime
            };

            this.list_index_1 = false;
            this.list_index_2 = false;
            // this.list_index_3 = true;
            this.rel_toggle = false;
            this.tag_toggle = false;
            this.no_rel_tag = false;
        },
        edit_btn() {
            this.zfyps_area_disabled = false;
            this.collection_site_disabled = false;
            this.edit_save = false;
            // this.save_disabled = false;
        },
        save_btn() { //保存标记
            // if (this.save_disabled == false)
            //     return;

            this.collection_site = $.trim(this.collection_site);
            let labelTypeId = tag_type_vm.curTag || tag_type_vm.tag_type_jj[0];
            let childLabelTypeId = tag_type_son_vm.curTag || tag_type_son_vm.tag_type_son_jj[0];
            ajax({
                url: '/gmvcs/audio/basefile/addLabelInfo',
                // url: '/api/label_types',
                method: 'post',
                data: {
                    "rid": this.record_item.rid,
                    "labelTypeId": labelTypeId == "0" ? "" : labelTypeId,
                    "childLabelTypeId": childLabelTypeId == "0" ? "" : childLabelTypeId,
                    "location": this.collection_site,
                    "labelRemark": this.zfyps_area
                }
            }).then(result => {
                if (result.code == 0) {
                    notification.success({
                        message: '您已经成功保存标注信息！',
                        title: '通知'
                    });
                    avalon.each(tag_type_vm.tag_options, function (index, item) {
                        if (labelTypeId == item.value) {
                            tag_type_vm.tag_label = item.label;
                        }
                    });
                    avalon.each(tag_type_son_vm.tag_options, function (index, item) {
                        if (childLabelTypeId == item.value) {
                            tag_type_son_vm.tag_label = item.label;
                        }
                    });
                    if (tag_type_vm.curTag == "0") {
                        tag_type_vm.tag_label = "";
                    }
                    if (tag_type_son_vm.curTag == "0") {
                        tag_type_son_vm.tag_label = "";
                    }

                    tag_type_vm.child_typeCode = childLabelTypeId; //给标注类型赋值新的当前选中标注子类型的code
                    tag_type_vm.tag_type_jj[0] = labelTypeId; //给标注类型赋值新的当前选中标注类型的code

                    this.zfyps_area_disabled = true;
                    this.collection_site_disabled = true;
                    this.edit_save = true;
                } else {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
            });
            // }
        },
        download() { //下载
            if (this.media_info.save_time_num == "-2") {
                return;
            }
            if (this.download_url == "") {
                notification.warn({
                    message: '无法获取下载地址，请稍后再试！',
                    title: '通知'
                });
                return;
            }
            window.open(this.download_url);
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'locality':
                    _this.collection_site = "";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'locality':
                    _this.zfyps_close_locality = true;
                    $(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel .collection_site").width($(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel").width() - 34);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'locality':
                    _this.zfyps_close_locality = false;
                    $(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel .collection_site").width($(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel").width() - 24);
                    break;
            }
        },
        add_dialogOk() {
            this.add_rel_dialog = false;
        },
        add_dialogCancel() {
            this.add_rel_dialog = false;
            this.dialog_status = true;
            this.is_play = true;

            $("#iframe_zfsyps").hide();
        },
        glyw() {
            if (this.media_info.save_time_num == "-2") {
                return;
            }
            relation_info_jj.add_rel();
        },

        mediaInfoShow: false,
        mediaInfo_click() {
            this.mediaInfoShow = !this.mediaInfoShow;
            this.dialog_status = !this.mediaInfoShow;

            if (this.mediaInfoShow) {
                $("#iframe_others").css({
                    "opacity": 0
                });
                setTimeout(function () {
                    $("#iframe_others").css({
                        "opacity": 1,
                        "left": ($('.mtxx').position().left + 22) + "px",
                        "top": ($('.mtxx').position().top - 95) + "px",
                        "width": "300px",
                        "height": "285px",
                    });
                    $("#iframe_others").show();
                }, 0);
            } else {
                $("#iframe_others").hide();
            }
        },

        dayShow: false,
        radioChangeFlag: false,
        radioChange(e) {
            this.radioChangeFlag = true;
            this.dayShow = false;
            this.dialog_status = true;
            this.confirmBtn(e.target.value);
        },
        day_click() {
            if (this.media_info.save_time_num == "-2") {
                return;
            }

            if (this.radioChangeFlag) {
                this.radioChangeFlag = false;
                return;
            }

            this.dayShow = !this.dayShow;
            this.dialog_status = !this.dayShow;

            if (this.dayShow) {
                $("#iframe_zfsyps").css({
                    "opacity": 0
                });
                setTimeout(function () {
                    $("#iframe_zfsyps").css({
                        "opacity": 1,
                        "left": ($('.ccts').position().left + 255) + "px",
                        "top": ($('.ccts').position().top + 2) + "px",
                        "width": "180px",
                        "height": "188px",
                    });
                    $("#iframe_zfsyps").show();
                }, 0);
            } else {
                $("#iframe_zfsyps").hide();
            }
        }
    }
});

function getFileByRid(flag) {
    ajax({
        // url: '/api/findBaseFileByRid',
        url: '/gmvcs/audio/basefile/findBaseFileByRid?rid=' + zfyps_detail_vm.record_item.rid,
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

        let media_temp = {};
        media_temp.fileName = result.data.fileName || "暂时无法获取文件名称！"; //文件名称
        media_temp.orgName = zfyps_detail_vm.record_item.orgName || "暂无"; //执勤部门
        media_temp.jobType = result.data.jobType || "-"; //民警岗位
        media_temp.startTime = formatDate(result.data.startTime); //拍摄时间
        media_temp.importTime = formatDate(result.data.importTime); //导入时间
        media_temp.saveSite = "-"; //存储位置
        media_temp.saveTime = "0天"; //存储天数（转换后的字符串）
        media_temp.save_time_num = result.data.saveTime; //存储天数（纯天数）

        media_temp.name_id = result.data.userName + "(" + result.data.userCode + ")"; //拍摄民警
        media_temp.key_media = result.data.match ? "已关联" : "未关联"; //关联媒体

        media_temp.showTitle = media_temp.orgName + " - " + media_temp.name_id + " - " + media_temp.fileName; //执勤部门

        zfyps_detail_vm.fileName = media_temp.fileName;

        if (result.data.saveSiteWs && result.data.saveSiteSt)
            media_temp.saveSite = "采集工作站、存储服务器";
        else {
            if (result.data.saveSiteWs)
                media_temp.saveSite = "采集工作站";
            else if (result.data.saveSiteSt)
                media_temp.saveSite = "存储服务器";
        }

        if (result.data.saveTime == "-1")
            media_temp.saveTime = "永久存储";
        else if (result.data.saveTime == "-2") {
            zfyps_detail_vm.show_timeout = true;
            zfyps_detail_vm.show_GMPlayer = false;
            zfyps_detail_vm.show_img = false;
            zfyps_detail_vm.show_other = false;

            media_temp.saveTime = "已过期";
            media_temp.saveSite = "-";
            zfyps_detail_vm.unClick_media = true;

            if (flag) {
                zfyps_detail_tips_dialog.operation_type = "1";
                zfyps_detail_tips_dialog.txt_rows = false;
                zfyps_detail_tips_dialog.title = "提示";
                zfyps_detail_tips_dialog.dialog_txt = "该媒体数据已过期！";
                zfyps_detail_vm.zfyps_dialog_width = 300;
                zfyps_detail_vm.zfyps_dialog_height = 178;

                zfyps_detail_vm.cancelText = "关闭";
                zfyps_detail_vm.zfyps_dialog_show = true;
                zfyps_detail_vm.dialog_status = false;

                if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                    $(".zfyps_dialog_common").addClass("dialog_close");
            }
        } else
            media_temp.saveTime = result.data.saveTime + "天";

        zfyps_detail_vm.media_info = media_temp;

        let arr_one = [],
            arr_three = [],
            rel_tag_aj = [],
            rel_tag_jq = [],
            data_len = 0;
        let result_arr = [],
            result_len = 0;

        avalon.each(result.data.surveil, function (index, item) {
            arr_three[data_len] = {};
            arr_three[data_len].index = data_len;
            arr_three[data_len].glbt = "非现场处罚（" + item.jdsbh + "）"; //非现场处罚 标题
            arr_three[data_len].zqmj = item.userName + "(" + item.userCode + ")"; //执勤民警
            arr_three[data_len].hphm = item.hphm; //号牌号码 
            arr_three[data_len].wfdz = item.wfdz; //违法地址      
            if (item.relevanceType == "ZDGL") //关联类别
                arr_three[data_len].gllb = "自动关联";
            else
                arr_three[data_len].gllb = "手动关联";
            arr_three[data_len].wfbhzd = "决定书编号：";
            arr_three[data_len].wfbh = item.jdsbh; //决定书编号
            arr_three[data_len].hpzl = item.hpzlmc; //号牌种类
            arr_three[data_len].wfsj = formatDate(item.wfsj); //违法时间
            arr_three[data_len].wfxw = item.wfxwmc; //违法行为

            arr_three[data_len].key = item.xh; //主键
            arr_three[data_len].zftype = "AUDIO_MENU_ZFDA_JTWF_FXCCL"; //执法类型
            data_len++;

            result_arr[result_len] = {};
            result_arr[result_len].index = result_len;
            result_arr[result_len].title = (result_len + 1) + "、" + "非现场处罚（" + item.jdsbh + "）"; //非现场处罚 标题
            result_arr[result_len].orgName = item.orgName; //部门信息
            result_arr[result_len].people = item.userName + "(" + item.userCode + ")"; //执勤民警
            result_arr[result_len].happenTime = formatDate(item.wfsj); //发生时间
            result_arr[result_len].handelTime = "-"; //处理时间
            result_arr[result_len].place = item.wfdz; //事故地点
            result_arr[result_len].key = item.xh; //主键
            result_arr[result_len].zftype = "AUDIO_MENU_ZFDA_JTWF_FXCCL"; //执法类型
            if (item.relevanceType == "ZDGL") //关联类别
                result_arr[result_len].autoState = true;
            result_len++;
        });

        avalon.each(result.data.violation, function (index, item) {
            arr_three[data_len] = {};
            arr_three[data_len].index = data_len;
            arr_three[data_len].glbt = "简易程序（" + item.jdsbh + "）"; //简易程序 标题
            arr_three[data_len].zqmj = item.userName + "(" + item.userCode + ")"; //执勤民警
            arr_three[data_len].hphm = item.hphm; //号牌号码 
            arr_three[data_len].wfdz = item.wfdz; //违法地址                                    
            if (item.relevanceType == "ZDGL") //关联类别
                arr_three[data_len].gllb = "自动关联";
            else
                arr_three[data_len].gllb = "手动关联";
            arr_three[data_len].wfbhzd = "决定书编号：";
            arr_three[data_len].wfbh = item.jdsbh; //决定书编号
            arr_three[data_len].hpzl = item.hpzlmc; //号牌种类
            arr_three[data_len].wfsj = formatDate(item.wfsj); //违法时间
            arr_three[data_len].wfxw = item.wfxwmc; //违法行为

            arr_three[data_len].key = item.wfbh; //主键
            arr_three[data_len].zftype = "AUDIO_MENU_ZFDA_JTWF_JYCX"; //执法类型
            data_len++;

            result_arr[result_len] = {};
            result_arr[result_len].index = result_len;
            result_arr[result_len].title = (result_len + 1) + "、" + "简易程序（" + item.jdsbh + "）"; //简易程序 标题
            result_arr[result_len].orgName = item.orgName; //部门信息
            result_arr[result_len].people = item.userName + "(" + item.userCode + ")"; //执勤民警
            result_arr[result_len].happenTime = formatDate(item.wfsj); //发生时间
            result_arr[result_len].handelTime = "-"; //处理时间
            result_arr[result_len].place = item.wfdz; //事故地点
            result_arr[result_len].key = item.wfbh; //主键
            result_arr[result_len].zftype = "AUDIO_MENU_ZFDA_JTWF_JYCX"; //执法类型
            if (item.relevanceType == "ZDGL") //关联类别
                result_arr[result_len].autoState = true;
            result_len++;
        });

        avalon.each(result.data.force, function (index, item) {
            arr_three[data_len] = {};
            arr_three[data_len].index = data_len;
            arr_three[data_len].glbt = "强制措施（" + item.pzbh + "）"; //强制措施 标题
            arr_three[data_len].zqmj = item.userName + "(" + item.userCode + ")"; //执勤民警
            arr_three[data_len].hphm = item.hphm; //号牌号码 
            arr_three[data_len].wfdz = item.wfdz; //违法地址                                    
            if (item.relevanceType == "ZDGL") //关联类别
                arr_three[data_len].gllb = "自动关联";
            else
                arr_three[data_len].gllb = "手动关联";
            arr_three[data_len].wfbhzd = "凭证编号：";
            arr_three[data_len].wfbh = item.pzbh; //凭证编号
            arr_three[data_len].hpzl = item.hpzlmc; //号牌种类
            arr_three[data_len].wfsj = formatDate(item.wfsj); //违法时间
            arr_three[data_len].wfxw = item.wfxwmc; //违法行为

            arr_three[data_len].key = item.xh; //主键
            arr_three[data_len].zftype = "AUDIO_MENU_ZFDA_JTWF_QZCS"; //执法类型
            data_len++;

            result_arr[result_len] = {};
            result_arr[result_len].index = result_len;
            result_arr[result_len].title = (result_len + 1) + "、" + "强制措施（" + item.pzbh + "）"; //强制措施 标题
            result_arr[result_len].orgName = item.orgName; //部门信息
            result_arr[result_len].people = item.userName + "(" + item.userCode + ")"; //执勤民警
            result_arr[result_len].happenTime = formatDate(item.wfsj); //发生时间
            result_arr[result_len].handelTime = "-"; //处理时间
            result_arr[result_len].place = item.wfdz; //事故地点
            result_arr[result_len].key = item.xh; //主键
            result_arr[result_len].zftype = "AUDIO_MENU_ZFDA_JTWF_QZCS"; //执法类型
            if (item.relevanceType == "ZDGL") //关联类别
                result_arr[result_len].autoState = true;
            result_len++;
        });

        avalon.each(result.data.accident, function (index, item) {
            arr_one[index] = {};
            arr_one[index].index = data_len++;
            arr_one[index].glbt = "事故处理（" + item.sgbh + "）"; //事故处理 标题
            arr_one[index].clmj = item.userName + "(" + item.userCode + ")"; //处理民警
            arr_one[index].sgfssj = formatDate(item.sgfssj); //事故发生时间
            arr_one[index].sgdd = item.sgdd; //事故地点                                  
            arr_one[index].bz = item.bz; //备注 
            arr_one[index].zqbm = item.orgName; //执勤部门
            arr_one[index].clsj = formatDate(item.clsj); //处理时间
            arr_one[index].sgbh = item.sgbh; //事故编号
            if (item.relevanceType == "ZDGL") //关联类别
                arr_one[index].gllb = "自动关联";
            else
                arr_one[index].gllb = "手动关联";

            arr_one[index].key = item.rid; //主键
            arr_one[index].zftype = "AUDIO_MENU_ZFDA_SGCL"; //执法类型

            result_arr[result_len] = {};
            result_arr[result_len].index = result_len;
            result_arr[result_len].title = (result_len + 1) + "、" + "事故处理（" + item.sgbh + "）"; //事故处理 标题
            result_arr[result_len].orgName = item.orgName; //部门信息
            result_arr[result_len].people = item.userName + "(" + item.userCode + ")"; //执勤民警
            result_arr[result_len].happenTime = formatDate(item.sgfssj); //事故发生时间
            result_arr[result_len].handelTime = formatDate(item.clsj); //处理时间
            result_arr[result_len].place = item.sgdd; //事故地点
            result_arr[result_len].key = item.rid; //主键
            result_arr[result_len].zftype = "AUDIO_MENU_ZFDA_SGCL"; //执法类型
            if (item.relevanceType == "ZDGL") //关联类别
                result_arr[result_len].autoState = true;
            result_len++;
        });

        avalon.each(result.data.caseMains, function (index, item) {
            rel_tag_aj[index] = {};
            rel_tag_aj[index].index = data_len++;
            rel_tag_aj[index].glbt = item.ajmc || "-"; //案件名称
            rel_tag_aj[index].ajbh = item.ajbh; //案件编号
            rel_tag_aj[index].ajlb = item.ajlbmc || "-"; //案件类别
            rel_tag_aj[index].sldw = item.sldwmc || "-"; //受理单位
            rel_tag_aj[index].afsj = formatDate(item.afsj); //案发时间
            rel_tag_aj[index].name_id = item.zbmjxm + "(" + item.zbr + ")"; //警员（警号）
            rel_tag_aj[index].rymc = item.involvedPeoples ? item.involvedPeoples.rymc : "-"; //涉案人员

            if (item.relevanceType == "ZDGL") //关联类别
                rel_tag_aj[index].gllb = "自动关联";
            else
                rel_tag_aj[index].gllb = "手动关联";

            rel_tag_aj[index].key = item.ajbh; //主键
            rel_tag_aj[index].zftype = "AUDIO_MENU_ZFDA_AJGL"; //执法类型

            result_arr[result_len] = {};
            result_arr[result_len].index = result_len;
            result_arr[result_len].title = (result_len + 1) + "、" + (item.ajmc || "-"); //案件名称
            result_arr[result_len].orgName = item.orgName; //部门信息
            result_arr[result_len].people = item.zbmjxm + "(" + item.zbr + ")"; //警员（警号）
            result_arr[result_len].happenTime = formatDate(item.afsj); //事故发生时间
            result_arr[result_len].handelTime = "-"; //处理时间
            result_arr[result_len].place = "-"; //事故地点
            result_arr[result_len].key = item.ajbh; //主键
            result_arr[result_len].zftype = "AUDIO_MENU_ZFDA_AJGL"; //执法类型
            if (item.relevanceType == "ZDGL") //关联类别
                result_arr[result_len].autoState = true;
            result_len++;
        });

        avalon.each(result.data.policeSituationResponses, function (index, item) {
            rel_tag_jq[index] = {};
            rel_tag_jq[index].index = data_len++;
            rel_tag_jq[index].glbt = item.jqmc || "-"; //警情名称
            rel_tag_jq[index].aqbh = item.jqbh; //警情编号
            rel_tag_jq[index].bjrxm = item.bjrxm; //报警人姓名
            rel_tag_jq[index].aqlb = item.jqlbmc || "-"; //警情类型名称
            rel_tag_jq[index].cjdw = ""; //处警单位
            if (item.cjdwmc.length > 0) {
                for (let i = 0; i < item.cjdwmc.length; i++) {
                    if (i != 0) {
                        rel_tag_jq[index].cjdw += "，";
                    }
                    rel_tag_jq[index].cjdw += item.cjdwmc[i];
                }
            } else {
                rel_tag_jq[index].cjdw = "-";
            }
            rel_tag_jq[index].bjsj = formatDate(item.bjsj); //报警时间
            rel_tag_jq[index].bjdh = item.bjrdh; //报警人电话
            rel_tag_jq[index].sfdd = item.sfdd; //事发地点

            if (item.relevanceType == "ZDGL") //关联类别
                rel_tag_jq[index].gllb = "自动关联";
            else
                rel_tag_jq[index].gllb = "手动关联";

            rel_tag_jq[index].key = item.jqbh; //主键
            rel_tag_jq[index].zftype = "AUDIO_MENU_ZFDA_JQGL"; //执法类型

            result_arr[result_len] = {};
            result_arr[result_len].index = result_len;
            result_arr[result_len].title = (result_len + 1) + "、" + (item.jqmc || "-"); //警情名称
            // result_arr[result_len].orgName = item.orgName; //部门信息
            // result_arr[result_len].people = "-"; //警员（警号）
            result_arr[result_len].happenTime = formatDate(item.bjsj); //事故发生时间
            result_arr[result_len].handelTime = "-"; //处理时间
            result_arr[result_len].place = item.sfdd; //事故地点
            result_arr[result_len].orgName = ""; //处警单位

            if (item.cjdwmc.length > 0) {
                for (let i = 0; i < item.cjdwmc.length; i++) {
                    if (i != 0) {
                        result_arr[result_len].orgName += "，";
                    }
                    result_arr[result_len].orgName += item.cjdwmc[i];
                }
            } else {
                result_arr[result_len].orgName = "-";
            }

            if (item.cjrxm.length > 0 && item.cjr.length > 0) {
                result_arr[result_len].people = item.cjrxm[0] + "(" + item.cjr[0] + ")";
            } else {
                result_arr[result_len].people = "-";
            }

            result_arr[result_len].key = item.jqbh; //主键
            result_arr[result_len].zftype = "AUDIO_MENU_ZFDA_JQGL"; //执法类型
            if (item.relevanceType == "ZDGL") //关联类别
                result_arr[result_len].autoState = true;
            result_len++;
        });

        relation_info_jj.one_data = arr_one;
        relation_info_jj.three_data = arr_three;
        relation_info_jj.aj_data = rel_tag_aj;
        relation_info_jj.jq_data = rel_tag_jq;
        relation_info_jj.relation_list_sum = data_len;
        relation_info_jj.checkedKey_arr = [];
        relation_info_jj.checked_arr = [];

        $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").width(result_arr.length * 376);
        $(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list").css({
            "left": 0
        });

        zfyps_detail_vm.prevStopClass = true;
        zfyps_detail_vm.result_list = result_arr;
        if (zfyps_detail_vm.result_list.length == 0) {
            zfyps_detail_vm.nextStopClass = true;
        }
        setTimeout(() => {
            windowResize();
        }, 688);
        zfyps_detail_vm.list_loading = false;

        if (data_len == 0) {
            zfyps_detail_vm.no_rel_tag = true;
            zfyps_detail_vm.rel_toggle = false;
            rel_tag_num = false;
        } else {
            zfyps_detail_vm.no_rel_tag = false;
            zfyps_detail_vm.rel_toggle = true;
            rel_tag_num = true;
        }
        if (zfyps_detail_vm.tag_toggle) //防止接口请求过慢出现的bug
            zfyps_detail_vm.tag_btn();

        $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_list .relation_li_border").hide();
        $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_list .relation_li_border:eq(0)").show();
        _popover();
    });
}

//关联信息 - CheckBox
let relation_info_jj = avalon.define({
    $id: "relation_info_jj",
    aj_data: [],
    jq_data: [],
    three_data: [],
    one_data: [],
    relation_list_sum: 0,

    selectItem: '1',
    changeTag(item) {
        this.selectItem = item;

        if (item == "1") {
            zfyps_detail_vm.list_index_3 = false;
        } else if (item == "2") {
            zfyps_detail_vm.mapAjaxData = {
                "deviceId": zfyps_detail_vm.record_item.deviceId,
                "fileRid": zfyps_detail_vm.record_item.rid,
                "fileType": zfyps_detail_vm.record_item.fileType,
                "beginTime": zfyps_detail_vm.record_item.beginTime,
                "endTime": zfyps_detail_vm.record_item.endTime
            };

            zfyps_detail_vm.list_index_3 = true;
        }
    },

    checkbox_img: "/static/image/xtpzgl-yhgl/selectNo.png",
    checkbox_img_status: false,
    checkedKey_arr: [],
    checked_arr: [],
    checkbox_img_click(checked, item) {
        if (checked) {
            this.checkedKey_arr.ensure(item.key);
            this.checked_arr.ensure(item);
        } else {
            this.checkedKey_arr.remove(item.key);
            this.checked_arr.remove(item);
        }
    },
    relation_list_click(e) {
        zfyps_detail_vm.block_num = e;
        $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_list .relation_li_border").hide();
        $(".zfsypsjglpt_yspk_zfypsjj_detail .relation_list .relation_li_border:eq(" + e + ")").show();
    },
    add_rel() {
        zfyps_detail_add_dialog.police_check = "";
        zfyps_detail_add_dialog.handle_num = "";
        zfyps_detail_vm.zfyps_dialog_width = 1100;
        zfyps_detail_vm.zfyps_dialog_height = 628;

        storage.removeItem("zfysyp-detail-table-style");
        $('#zfysyp_detail_table_in .table-index-tbody li').attr("style", "");

        zfysyp_detail_table_in_obj = $.tableIndex({ //初始化表格jq插件
            id: 'zfysyp_detail_table_in',
            tableBody: zfysyp_detail_table_in_body
        });
        zfysyp_detail_table_in_obj.tableDataFnc([]);

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
            zfyps_detail_add_dialog.zfysyp_add_rel_tree.yspk_data = deptemp;
            zfyps_detail_add_dialog.zfysyp_add_rel_tree.tree_path = deptemp[0].path;
            zfyps_detail_add_dialog.zfysyp_add_rel_tree.cur_orgCode = deptemp[0].orgCode;
            zfyps_detail_add_dialog.zfysyp_add_rel_tree.tree_key = deptemp[0].key;
            zfyps_detail_add_dialog.zfysyp_add_rel_tree.tree_title = deptemp[0].title;

            ajax({
                // url: '/api/dep_tree',
                url: '/gmvcs/audio/basefile/getZFType',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0 || $.isEmptyObject(result.data.zftype)) {
                    notification.error({
                        message: '获取执法类型失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                let temp = [];
                for (let key in result.data.zftype) {
                    // 3.6.8 合并云南需求 新增警情关联和案件管理的添加关联查询
                    // if(versionSelection !== 'Yunnan' && (key == "AUDIO_MENU_ZFDA_JQGL" || key == "AUDIO_MENU_ZFDA_AJGL")) {
                    //     continue;
                    // }
                    if (key == "AUDIO_MENU_ZFDA_JTWF_FXCCL" && mainIndex == "main_sdjj") { //屏蔽案件和警情的执法类型   2018.9.7加上屏蔽非现场处罚
                        // return;
                    } else if (key == "AUDIO_MENU_ZFDA_JQGL") {
                        let obj = {};
                        obj.value = key;
                        obj.label = result.data.zftype[key];
                        temp.unshift(obj);
                    } else {
                        let obj = {};
                        obj.value = key;
                        obj.label = result.data.zftype[key];
                        temp.push(obj);
                    }

                }

                dialog_zflx_type_vm.zf_type_options = temp;
                dialog_zflx_type_vm.curType = temp[0].value;
                dialog_zflx_type_vm.zf_type = new Array(temp[0].value);
                dialog_zflx_type_vm.firstLoad = false;
                change_zflx(temp[0].value, true);
            });
        });

        if (zfyps_detail_vm.dayShow) {
            zfyps_detail_vm.dayShow = false;
            $("#iframe_zfsyps").hide();
        }

        if (zfyps_detail_vm.mediaInfoShow) {
            zfyps_detail_vm.mediaInfoShow = false;
            $("#iframe_others").hide();
        }

        zfyps_detail_vm.add_rel_dialog = true;
        zfyps_detail_vm.dialog_status = false;
        zfyps_detail_vm.is_play = false;

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
    delete_rel(jcglArr) {
        // if (relation_info_jj.checkedKey_arr.length <= 0)
        //     return;
        let post_data = {},
            temp_arr = [{
                "id": [],
                "zfType": "AUDIO_MENU_ZFDA_JTWF_FXCCL"
            }, {
                "id": [],
                "zfType": "AUDIO_MENU_ZFDA_JTWF_JYCX"
            }, {
                "id": [],
                "zfType": "AUDIO_MENU_ZFDA_JTWF_QZCS"
            }, {
                "id": [],
                "zfType": "AUDIO_MENU_ZFDA_SGCL"
            }, {
                "id": [],
                "zfType": "AUDIO_MENU_ZFDA_AJGL"
            }, {
                "id": [],
                "zfType": "AUDIO_MENU_ZFDA_JQGL"
            }];

        avalon.each(jcglArr, function (index, item) {
            switch (item.zftype) {
                case 'AUDIO_MENU_ZFDA_JTWF_FXCCL': //非现场处罚
                    temp_arr[0].id.push(item.key);
                    break;
                case 'AUDIO_MENU_ZFDA_JTWF_JYCX': //简易程序
                    temp_arr[1].id.push(item.key);
                    break;
                case 'AUDIO_MENU_ZFDA_JTWF_QZCS': //强制措施
                    temp_arr[2].id.push(item.key);
                    break;
                case 'AUDIO_MENU_ZFDA_SGCL': //事故处理
                    temp_arr[3].id.push(item.key);
                    break;
                case 'AUDIO_MENU_ZFDA_AJGL': //案件管理
                    temp_arr[4].id.push(item.key);
                    break;
                case 'AUDIO_MENU_ZFDA_JQGL': //警情管理
                    temp_arr[5].id.push(item.key);
                    break;
            }
        });

        let zfInfo = [],
            j = 0;
        for (var i = 0; i < temp_arr.length; i++) {
            if (temp_arr[i].id.length > 0) {
                zfInfo[j++] = temp_arr[i];
            }
        }
        // console.log(zfInfo);
        post_data.zfInfo = zfInfo;
        post_data.rid = zfyps_detail_vm.record_item.rid;

        ajax({
            // url: '/api/table_list_jj',
            url: "/gmvcs/audio/basefile/deleteRelevance",
            method: 'post',
            data: post_data
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    message: result.msg,
                    title: '通知'
                });
                return;
            }
            notification.success({
                message: '删除关联成功！',
                title: '通知'
            });

            zfyps_detail_vm.list_loading = true;
            relation_info_jj.relation_list_sum = 0;

            setTimeout(() => {
                getFileByRid();
            }, 1000);
        });
    }
});

let tag_type_vm = avalon.define({
    $id: 'tag_type_jj',
    curTag: "",
    tag_label: "",
    tag_options: [],
    tag_type_jj: [],
    child_typeName: '',
    child_typeCode: '',
    onChangeT(e) {
        let _this = this;
        _this.curTag = e.target.value;
        // if (zfyps_detail_vm.save_flag)
        //     zfyps_detail_vm.save_disabled = false;
        // else
        //     zfyps_detail_vm.save_disabled = true;
        ajax({
            url: '/gmvcs/uap/dic/findByParent/?code=' + e.target.value,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: '获取数据字典失败，请稍后再试',
                    title: '通知'
                });
            }
            let ret_data = [{
                value: "0",
                label: "无"
            }];
            if (result.data != null && result.data.length != 0) {
                avalon.each(result.data, function (index, item) {
                    let ret_obj = {};
                    ret_obj.value = item.code;
                    ret_obj.label = item.name;

                    ret_data.push(ret_obj);
                });
            }
            tag_type_son_vm.tag_options = ret_data;
            tag_type_son_vm.tag_type_son_jj = ['0'];
        });
    }
});
let tag_type_son_vm = avalon.define({
    $id: 'tag_type_son_jj',
    curTag: "",
    tag_label: "",
    tag_options: [],
    tag_type_son_jj: [],
    onChangeT(e) {
        let _this = this;
        _this.curTag = e.target.value;
        // if (zfyps_detail_vm.save_flag)
        //     zfyps_detail_vm.save_disabled = false;
        // else
        //     zfyps_detail_vm.save_disabled = true;
    }
});

let change_time_vm = avalon.define({
    $id: 'change_time_jj',
    curTime: "",
    time_type_options: [{
            value: "1",
            label: "3个月（90天）"
        },
        {
            value: "2",
            label: "6个月（180天）"
        }, {
            value: "3",
            label: "12个月（365天）"
        }, {
            value: "4",
            label: "永久存储"
        }
    ],
    time_type: ["1"],
    onChangeT(e) {
        let _this = this;
        _this.curTime = e.target.value;
    }
});

let zfyps_detail_tips_dialog = avalon.define({
    $id: "zfyps_detail_tips_dialog",
    title: "",
    dialog_txt: "",
    txt_rows: true, //true 两行 false 一行,
    operation_type: "1" // 1 提示媒体过期；2 更改存储天数的提示；3 按下F5的提示
});

/*================== 时间控制函数 start =============================*/
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    // var s = stringTime.split(" ");
    // var s1 = s[0].split("-");
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    // if (s2.length == 2) {
    //     s2.push("00");
    // }
    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}

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
/*================== 时间控制函数 end =============================*/

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
            return '<div class="title-content zfypsjj-pop">' + html + '</div>';
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
    if (zfyps_detail_vm.result_list.length > 0) {
        if (($(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list_panel").width() >= zfyps_detail_vm.result_list.length * 376) || ($(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list_panel").width() >= ($(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list_panel .result_list").width() - Math.abs($(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list_panel .result_list").position().left)))) {
            zfyps_detail_vm.nextStopClass = true;
        } else {
            zfyps_detail_vm.nextStopClass = false;
        }
    }

    zfyps_detail_vm.showNumber = Math.floor($(".zfsypsjglpt_yspk_zfypsjj_detail .glyw_content .result_list_panel").width() / 376);

    if ($("#iframe_zfsyps").is(":visible")) {
        if (zfyps_detail_vm.dayShow) {
            setTimeout(function () {
                $("#iframe_zfsyps").css({
                    "left": ($('.ccts').position().left + 255) + "px",
                    "top": ($('.ccts').position().top + 2) + "px",
                    "width": "180px",
                    "height": "188px",
                });
            }, 0);
        } else {
            setTimeout(() => {
                $("#iframe_zfsyps").css({
                    width: zfyps_detail_vm.zfyps_dialog_width,
                    height: zfyps_detail_vm.zfyps_dialog_height
                });
            }, 0);
        }
    }

    if ($("#iframe_others").is(":visible")) {
        if (zfyps_detail_vm.mediaInfoShow) {
            setTimeout(function () {
                $("#iframe_others").css({
                    "left": ($('.mtxx').position().left + 22) + "px",
                    "top": ($('.mtxx').position().top - 95) + "px",
                    "width": "300px",
                    "height": "285px",
                });
            }, 0);
        }
    }
}

/*================== 添加关联弹窗 start =============================*/

let zfyps_detail_add_dialog = avalon.define({
    $id: "zfyps_detail_add_dialog",
    zfsypsjglptDialog: language_txt.zfsypsjglpt.sypgl,
    title: "添加关联",
    police_check: "",
    handle_num: "",
    dialog_table_data: [],
    handle_txt: "违法编号",
    time_txt: "违法时间",
    zfyps_close_policeId: false,
    zfyps_close_handleNum: false,
    change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true
    ajax_url: "",
    selected_arr: [],
    page_type: false, //fasle 显示总条数; true 显示大于多少条

    curPage: 1,
    table_pagination: {
        current: 0,
        pageSize: 20,
        total: 0,
        current_len: 0,
        totalPages: 0
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
        this.change_page = true;
        this.curPage = page;
        this.table_pagination.current = page;
        zfysyp_detail_table_in_obj.page(page, this.table_pagination.pageSize);
        this.dialog_table_data = [];
        zfysyp_detail_table_in_obj.tableDataFnc([]);
        zfysyp_detail_table_in_obj.loading(true);
        this.get_table_list();
    },

    zfysyp_add_rel_tree: avalon.define({
        $id: "zfysyp_add_rel_tree",
        yspk_data: [],
        // yspk_value: [],
        tree_key: "",
        tree_title: "",
        // yspk_expandedKeys: [],
        tree_path: "",
        curTree: "",
        cur_orgCode: "",
        getSelected(key, title, e) {
            this.tree_key = key;
            this.tree_title = title;
        },
        select_change(e, selectedKeys) {
            this.curTree = e.node.path;
            this.cur_orgCode = e.node.orgCode;
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

        }
    }),
    close_click(e) {
        let _this = this;
        switch (e) {
            case 'policeId':
                _this.police_check = "";
                return false;
                break;
            case 'handle_num':
                _this.handle_num = "";
                return false;
                break;
        }
    },
    input_focus(e) {
        let _this = this;
        switch (e) {
            case 'policeId':
                _this.zfyps_close_policeId = true;
                $(".add_rel_dialog .dataFormBox .policeId").width(126);
                break;
            case 'handle_num':
                _this.zfyps_close_handleNum = true;
                $(".add_rel_dialog .dataFormBox .handle_num").width(126);
                break;
        }
    },
    input_blur(e) {
        let _this = this;
        switch (e) {
            case 'policeId':
                _this.zfyps_close_policeId = false;
                $(".add_rel_dialog .dataFormBox .policeId").width(136);
                break;
            case 'handle_num':
                _this.zfyps_close_handleNum = false;
                $(".add_rel_dialog .dataFormBox .handle_num").width(136);
                break;
        }
    },
    name_input_enter(e) {
        if (e.keyCode == "13")
            this.searchBtn();
    },
    searchBtn() {
        if (zfyps_detail_time_range_vm.range_flag == 2) {
            if (getTimeByDateStr(zfyps_detail_startTime_vm.zfyps_detail_startTime) > getTimeByDateStr(zfyps_detail_endTime_vm.zfyps_detail_endTime)) {
                notification.warn({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '通知'
                });
                return;
            }
            let time_interval = getTimeByDateStr(zfyps_detail_endTime_vm.zfyps_detail_endTime) - getTimeByDateStr(zfyps_detail_startTime_vm.zfyps_detail_startTime);
            if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                notification.warn({
                    message: '时间间隔不能超过一年，请重新设置！',
                    title: '通知'
                });
                return;
            }
        }

        this.change_page = false;
        this.curPage = 1;
        this.table_pagination.current = 1;
        zfysyp_detail_table_in_obj.page(1, this.table_pagination.pageSize);
        this.dialog_table_data = [];
        zfysyp_detail_table_in_obj.tableDataFnc([]);
        zfysyp_detail_table_in_obj.loading(true);
        this.police_check = $.trim(this.police_check);
        this.handle_num = $.trim(this.handle_num);
        this.get_table_list();
    },
    get_table_list() {
        let start_time, end_time;
        if (zfyps_detail_time_range_vm.range_flag == "0") {
            if (moment().format('d') == "0") {
                start_time = moment().day(-6).format('YYYY-MM-DD');
                end_time = moment().day(0).format('YYYY-MM-DD');
            } else {
                start_time = moment().day(1).format('YYYY-MM-DD');
                end_time = moment().day(7).format('YYYY-MM-DD');
            }
        }

        if (zfyps_detail_time_range_vm.range_flag == "1") {
            start_time = moment().startOf('month').format('YYYY-MM-DD');
            end_time = moment().endOf('month').format('YYYY-MM-DD');
        }

        if (zfyps_detail_time_range_vm.range_flag == "2") {
            start_time = zfyps_detail_startTime_vm.zfyps_detail_startTime;
            end_time = zfyps_detail_endTime_vm.zfyps_detail_endTime;
        }

        let ajax_data = {
            "rid": zfyps_detail_vm.record_item.rid,
            "page": this.curPage - 1,
            "pageSize": this.table_pagination.pageSize,
            "orgPath": zfyps_detail_add_dialog.zfysyp_add_rel_tree.curTree || zfyps_detail_add_dialog.zfysyp_add_rel_tree.tree_path,
            "orgCode": zfyps_detail_add_dialog.zfysyp_add_rel_tree.cur_orgCode,
            "zfType": dialog_zflx_type_vm.curType,
            "startTime": getTimeByDateStr(start_time),
            "endTime": getTimeByDateStr(end_time, true)
        };

        // console.log(ajax_data);
        if (this.police_check)
            ajax_data.xmjh = this.police_check;

        if (this.handle_num)
            ajax_data.bh = this.handle_num;

        if (this.change_page) {
            ajax_data = search_condition;
            ajax_data.page = this.curPage - 1;
        } else
            search_condition = ajax_data;

        ajax({
            // url: '/api/table_list_jj',
            url: zfyps_detail_add_dialog.ajax_url,
            method: 'post',
            data: ajax_data
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    message: result.msg,
                    title: '通知'
                });
                return;
            }
            this.selected_arr = [];

            if (!result.data.overLimit && result.data.totalElements == 0) {
                this.curPage = 0;
                this.table_pagination.current = 0;
                zfysyp_detail_table_in_obj.page(0, this.table_pagination.pageSize);
                this.dialog_table_data = [];
                zfysyp_detail_table_in_obj.tableDataFnc([]);
                zfysyp_detail_table_in_obj.loading(false);
                this.table_pagination.total = 0;

                return;
            }

            let ret_data = [];
            let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;

            switch (dialog_zflx_type_vm.curType) {
                case 'AUDIO_MENU_ZFDA_JQGL': // 警情关联
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index; //行序号
                        ret_data[index].space = ""; //空title需要
                        ret_data[index].id = item.jqbh; //关联用的id

                        ret_data[index].table_list_3_txt = item.jqbh; // 警情编号
                        ret_data[index].table_list_4_txt = item.cjdw.join('，'); // 处警单位
                        ret_data[index].table_list_5_txt = item.bjrxm; // 报警人
                        ret_data[index].table_list_6_txt = formatDate(item.bjsj); // 报警时间
                        ret_data[index].table_list_7_txt = item.bjrdh; // 报警电话
                        ret_data[index].table_list_8_txt = item.bjnr; // 报警内容
                        ret_data[index].table_list_9_txt = item.sfdd; // 事发地点
                    });
                    break;
                case 'AUDIO_MENU_ZFDA_AJGL': // 案件关联
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index; //行序号
                        ret_data[index].space = ""; //空title需要
                        ret_data[index].id = item.ajbh; //关联用的id

                        ret_data[index].table_list_3_txt = item.sldwmc; // 主办单位
                        ret_data[index].table_list_4_txt = item.zbmjxm + "(" + item.zbr + ")"; // 主办民警
                        ret_data[index].table_list_5_txt = item.ajbh; // 案件编号
                        ret_data[index].table_list_6_txt = formatDate(item.afsj); // 案发时间
                        ret_data[index].table_list_7_txt = item.ajmc; // 案件名称
                        ret_data[index].table_list_8_txt = item.jyaq; // 简要案情
                        ret_data[index].table_list_9_txt = item.ajlbmc; // 案件类别
                    });
                    break;
                case 'AUDIO_MENU_ZFDA_JTWF_FXCCL': //非现场处罚
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index; //行序号
                        ret_data[index].space = ""; //空title需要
                        ret_data[index].id = item.id; //关联用的id

                        ret_data[index].table_list_3_txt = item.userName + "(" + item.userCode + ")"; //警员（警号）
                        ret_data[index].table_list_4_txt = item.bh; //违法编号
                        ret_data[index].table_list_5_txt = formatDate(item.wfsj); //违法时间
                        ret_data[index].table_list_6_txt = item.wfdz; //违法地点
                        ret_data[index].table_list_7_txt = item.hphm; //车牌号码
                        ret_data[index].table_list_8_txt = item.hpzlmc; //号牌种类
                    });
                    break;
                case 'AUDIO_MENU_ZFDA_JTWF_JYCX': //简易程序
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index; //行序号
                        ret_data[index].space = ""; //空title需要
                        ret_data[index].id = item.id; //关联用的id

                        ret_data[index].table_list_3_txt = item.userName + "(" + item.userCode + ")"; //警员（警号）
                        ret_data[index].table_list_4_txt = item.bh; //决定书编号
                        ret_data[index].table_list_5_txt = item.dsr; //当事人
                        ret_data[index].table_list_6_txt = formatDate(item.wfsj); //违法时间
                        ret_data[index].table_list_7_txt = item.wfdz; //违法地点
                        ret_data[index].table_list_8_txt = item.jszh; //驾驶证号
                        ret_data[index].table_list_9_txt = item.hphm; //车牌号码
                    });
                    break;
                case 'AUDIO_MENU_ZFDA_JTWF_QZCS': //强制措施
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index; //行序号
                        ret_data[index].space = ""; //空title需要
                        ret_data[index].id = item.id; //关联用的id

                        ret_data[index].table_list_3_txt = item.userName + "(" + item.userCode + ")"; //警员（警号）
                        ret_data[index].table_list_4_txt = item.bh; //凭证编号
                        ret_data[index].table_list_5_txt = item.dsr; //当事人
                        ret_data[index].table_list_6_txt = formatDate(item.wfsj); //违法时间
                        ret_data[index].table_list_7_txt = item.wfdz; //违法地点
                        ret_data[index].table_list_8_txt = item.jszh; //驾驶证号
                        ret_data[index].table_list_9_txt = item.hphm; //车牌号码
                    });
                    break;
                case 'AUDIO_MENU_ZFDA_SGCL': //事故处理
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index; //行序号
                        ret_data[index].space = ""; //空title需要
                        ret_data[index].id = item.id; //关联用的id

                        ret_data[index].table_list_3_txt = item.userName + "(" + item.userCode + ")"; //警员（警号）
                        ret_data[index].table_list_4_txt = item.bh; //事故编号
                        ret_data[index].table_list_5_txt = formatDate(item.sgfssj); //事故发生时间
                        ret_data[index].table_list_6_txt = item.sgdd; //事故地点
                        ret_data[index].table_list_7_txt = formatDate(item.clsj); //事故处理时间
                    });
                    break;
            }

            this.dialog_table_data = ret_data;
            zfysyp_detail_table_in_obj.tableDataFnc(ret_data);
            zfysyp_detail_table_in_obj.loading(false);

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
        });
    },
    add_rel_btn() {
        if (this.selected_arr.length == 0)
            return;
        let post_data = {},
            post_id = [];

        avalon.each(this.selected_arr, function (index, item) {
            post_id.push(item.id);
        });
        post_data.id = post_id;
        post_data.rid = zfyps_detail_vm.record_item.rid;
        post_data.zfType = dialog_zflx_type_vm.curType;

        ajax({
            // url: '/api/table_list_jj',
            url: "/gmvcs/audio/basefile/addRelevance",
            method: 'post',
            data: post_data
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    message: result.msg,
                    title: '通知'
                });
                return;
            }
            notification.success({
                message: '添加关联成功！',
                title: '通知'
            });
        });

        zfyps_detail_vm.add_rel_dialog = false;
        zfyps_detail_vm.dialog_status = true;
        zfyps_detail_vm.is_play = true;
        $("#iframe_zfsyps").hide();

        zfyps_detail_vm.list_loading = true;
        relation_info_jj.relation_list_sum = 0;

        setTimeout(() => {
            getFileByRid();
        }, 1000);
    }
});

let zfyps_detail_time_range_vm = avalon.define({
    $id: 'zfyps_detail_time_range',
    select_time: false,
    time_range_options: [{
            value: "0",
            label: "本周"
        },
        {
            value: "1",
            label: "本月"
        },
        {
            value: "2",
            label: "自定义时间"
        }
    ],
    time_range: [],
    range_flag: 0,
    onChangeTR(e) {
        let _this = this;
        _this.time_range = new Array(e.target.value.toString());
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            zfyps_detail_endTime_vm.zfyps_detail_endTime = moment().format('YYYY-MM-DD');
            zfyps_detail_startTime_vm.zfyps_detail_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let zfyps_detail_startTime_vm = avalon.define({
    $id: "zfyps_detail_startTime",
    zfyps_detail_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfyps_detail_startTime = e.target.value;
    }
});

let zfyps_detail_endTime_vm = avalon.define({
    $id: "zfyps_detail_endTime",
    zfyps_detail_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfyps_detail_endTime = e.target.value;
    }
});

let dialog_zflx_type_vm = avalon.define({
    $id: 'dialog_zflx_type',
    curType: "",
    zf_type_options: [],
    zf_type: [],
    firstLoad: false,
    onChangeT(e) {
        let _this = this;
        let initType = _this.curType;
        _this.curType = e.target.value;

        zfyps_detail_add_dialog.police_check = "";
        zfyps_detail_add_dialog.handle_num = "";

        if (!this.firstLoad)
            change_zflx(_this.curType, initType !== '');
    }
});

dialog_zflx_type_vm.$watch('onReady', () => {
    dialog_zflx_type_vm.firstLoad = true;
});

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

let zfysyp_detail_table_vm = avalon.define({
    $id: "zfysyp_detail_table",
    loading: false,
    table_list_3: "警情编号",
    table_list_4: "处警单位",
    table_list_5: "报警人",
    table_list_6: "报警时间",
    table_list_7: "报警电话",
    table_list_8: "报警内容",
    table_list_9: "事发地点",
    table_list_3_class: "col-10",
    table_list_4_class: "col-20",
    table_list_5_class: "col-15",
    table_list_6_class: "col-25",
    table_list_7_class: "col-10",
    table_list_8_class: "col-10",
    table_list_9_class: "col-20",
    table_list_status_8: true,
    table_list_status_9: true,
    actions(type, text, record, index) {
        // zfyps_vm.record_item = record;
        if (type == "check_click") {
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-actions', true);
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-record', record);
            // storage.removeItem("zfypsjj-main-tableDrag-style");
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-main");
        }
    },
    handleSelect(record, selected, selectedRows) {
        zfyps_detail_add_dialog.selected_arr = selectedRows;
    },
    handleSelectAll(selected, selectedRows) {
        zfyps_detail_add_dialog.selected_arr = selectedRows;
    }
});

let zfysyp_detail_table_in_body = avalon.define({ //表格定义组件
    $id: 'zfysyp_detail_table_in',
    data: [],
    key: 'id',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    selection: [],
    isAllChecked: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'zfysyp-detail-table-style',
    // debouleHead: ["table-index-thead", "zfypsjj_table_parent"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
    handleCheckAll: function (e) {
        var _this = this;
        var data = _this.data;
        if (e.target.checked) {
            data.forEach(function (record) {
                _this.checked.ensure(record[_this.key]);
                _this.selection.ensure(record);
            });
        } else {
            if (data.length > 0) {
                this.checked.clear();
                this.selection.clear();
            } else {
                this.checked.removeAll(function (el) {
                    return data.map(function (record) {
                        return record[_this.key];
                    }).indexOf(el) !== -1;
                });
                this.selection.removeAll(function (el) {
                    return data.indexOf(el) !== -1;
                });
            }
        }
        // this.selectionChange(this.checked, this.selection.$model);
        zfysyp_detail_table_vm.handleSelectAll(e.target.checked, this.selection.$model);
    },
    handleCheck: function (checked, record) {
        if (checked) {
            this.checked.ensure(record[this.key]);
            this.selection.ensure(record);
        } else {
            this.checked.remove(record[this.key]);
            this.selection.remove(record);
        }
        // this.selectionChange(this.checked, this.selection.$model);
        zfysyp_detail_table_vm.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfysyp_detail_table_vm.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});

function change_zflx(val, flag) {
    storage.removeItem("zfysyp-detail-table-style");
    $('#zfysyp_detail_table_in .table-index-tbody li').attr("style", "");
    //切换执法类型时，初始化查询条件
    zfyps_detail_add_dialog.selected_arr = [];
    zfyps_detail_add_dialog.curPage = 0;
    zfyps_detail_add_dialog.table_pagination.current = 0;
    zfysyp_detail_table_in_obj.page(0, zfyps_detail_add_dialog.table_pagination.pageSize);
    zfyps_detail_add_dialog.dialog_table_data = [];
    zfysyp_detail_table_in_obj.tableDataFnc([]);
    zfyps_detail_add_dialog.table_pagination.total = 0;
    zfyps_detail_time_range_vm.select_time = false;
    zfyps_detail_time_range_vm.range_flag = 0;
    zfyps_detail_time_range_vm.time_range = ["0"];

    zfyps_detail_add_dialog.time_txt = "违法时间";
    switch (val) {
        case 'AUDIO_MENU_ZFDA_JQGL': // 警情管理
            zfyps_detail_add_dialog.ajax_url = "/gmvcs/audio/policeSituation/search/pageable";
            zfyps_detail_add_dialog.handle_txt = "警情编号";
            zfyps_detail_add_dialog.time_txt = "报警时间";

            zfysyp_detail_table_vm.table_list_status_8 = true;
            zfysyp_detail_table_vm.table_list_status_9 = true;
            zfysyp_detail_table_vm.table_list_3 = "警情编号";
            zfysyp_detail_table_vm.table_list_4 = "处警单位";
            zfysyp_detail_table_vm.table_list_5 = "报警人";
            zfysyp_detail_table_vm.table_list_6 = "报警时间";
            zfysyp_detail_table_vm.table_list_7 = "报警电话";
            zfysyp_detail_table_vm.table_list_8 = "报警内容";
            zfysyp_detail_table_vm.table_list_9 = "事发地点";
            zfysyp_detail_table_vm.table_list_3_class = "col-15";
            zfysyp_detail_table_vm.table_list_4_class = "col-10";
            zfysyp_detail_table_vm.table_list_5_class = "col-10";
            zfysyp_detail_table_vm.table_list_6_class = "col-15";
            zfysyp_detail_table_vm.table_list_7_class = "col-10";
            zfysyp_detail_table_vm.table_list_8_class = "col-15";
            zfysyp_detail_table_vm.table_list_9_class = "col-15";
            break;
        case 'AUDIO_MENU_ZFDA_AJGL': // 案件管理
            zfyps_detail_add_dialog.ajax_url = "/gmvcs/audio/case/search/pageable";
            zfyps_detail_add_dialog.handle_txt = "案件编号";
            zfyps_detail_add_dialog.time_txt = "案发时间";

            zfysyp_detail_table_vm.table_list_status_8 = true;
            zfysyp_detail_table_vm.table_list_status_9 = true;
            zfysyp_detail_table_vm.table_list_3 = "主办单位";
            zfysyp_detail_table_vm.table_list_4 = "主办民警";
            zfysyp_detail_table_vm.table_list_5 = "案件编号";
            zfysyp_detail_table_vm.table_list_6 = "案发时间";
            zfysyp_detail_table_vm.table_list_7 = "案件名称";
            zfysyp_detail_table_vm.table_list_8 = "简要案情";
            zfysyp_detail_table_vm.table_list_9 = "案件类别";
            zfysyp_detail_table_vm.table_list_3_class = "col-15";
            zfysyp_detail_table_vm.table_list_4_class = "col-10";
            zfysyp_detail_table_vm.table_list_5_class = "col-15";
            zfysyp_detail_table_vm.table_list_6_class = "col-15";
            zfysyp_detail_table_vm.table_list_7_class = "col-10";
            zfysyp_detail_table_vm.table_list_8_class = "col-15";
            zfysyp_detail_table_vm.table_list_9_class = "col-10";
            break;
        case 'AUDIO_MENU_ZFDA_JTWF_FXCCL': //非现场处罚
            zfyps_detail_add_dialog.ajax_url = "/gmvcs/audio/surveil/search/pageable";
            zfyps_detail_add_dialog.handle_txt = "违法编号";

            zfysyp_detail_table_vm.table_list_status_8 = true;
            zfysyp_detail_table_vm.table_list_status_9 = false;
            zfysyp_detail_table_vm.table_list_3 = "姓名/警号";
            zfysyp_detail_table_vm.table_list_4 = "违法编号";
            zfysyp_detail_table_vm.table_list_5 = "违法时间";
            zfysyp_detail_table_vm.table_list_6 = "违法地点";
            zfysyp_detail_table_vm.table_list_7 = "车牌号码";
            zfysyp_detail_table_vm.table_list_8 = "号牌种类";
            zfysyp_detail_table_vm.table_list_3_class = "col-15";
            zfysyp_detail_table_vm.table_list_4_class = "col-20";
            zfysyp_detail_table_vm.table_list_5_class = "col-15";
            zfysyp_detail_table_vm.table_list_6_class = "col-20";
            zfysyp_detail_table_vm.table_list_7_class = "col-10";
            zfysyp_detail_table_vm.table_list_8_class = "col-10";
            break;
        case 'AUDIO_MENU_ZFDA_JTWF_JYCX': //简易程序
            zfyps_detail_add_dialog.ajax_url = "/gmvcs/audio/violation/search/pageable";
            zfyps_detail_add_dialog.handle_txt = "决定书编号";

            zfysyp_detail_table_vm.table_list_status_8 = true;
            zfysyp_detail_table_vm.table_list_status_9 = true;
            zfysyp_detail_table_vm.table_list_3 = "姓名/警号";
            zfysyp_detail_table_vm.table_list_4 = "决定书编号";
            zfysyp_detail_table_vm.table_list_5 = "当事人";
            zfysyp_detail_table_vm.table_list_6 = "违法时间";
            zfysyp_detail_table_vm.table_list_7 = "违法地点";
            zfysyp_detail_table_vm.table_list_8 = "驾驶证号";
            zfysyp_detail_table_vm.table_list_9 = "车牌号码";
            zfysyp_detail_table_vm.table_list_3_class = "col-10";
            zfysyp_detail_table_vm.table_list_4_class = "col-15";
            zfysyp_detail_table_vm.table_list_5_class = "col-10";
            zfysyp_detail_table_vm.table_list_6_class = "col-15";
            zfysyp_detail_table_vm.table_list_7_class = "col-20";
            zfysyp_detail_table_vm.table_list_8_class = "col-10";
            zfysyp_detail_table_vm.table_list_9_class = "col-10";
            break;
        case 'AUDIO_MENU_ZFDA_JTWF_QZCS': //强制措施
            zfyps_detail_add_dialog.ajax_url = "/gmvcs/audio/force/search/pageable";
            zfyps_detail_add_dialog.handle_txt = "凭证编号";

            zfysyp_detail_table_vm.table_list_status_8 = true;
            zfysyp_detail_table_vm.table_list_status_9 = true;
            zfysyp_detail_table_vm.table_list_3 = "姓名/警号";
            zfysyp_detail_table_vm.table_list_4 = "凭证编号";
            zfysyp_detail_table_vm.table_list_5 = "当事人";
            zfysyp_detail_table_vm.table_list_6 = "违法时间";
            zfysyp_detail_table_vm.table_list_7 = "违法地点";
            zfysyp_detail_table_vm.table_list_8 = "驾驶证号";
            zfysyp_detail_table_vm.table_list_9 = "车牌号码";
            zfysyp_detail_table_vm.table_list_3_class = "col-10";
            zfysyp_detail_table_vm.table_list_4_class = "col-15";
            zfysyp_detail_table_vm.table_list_5_class = "col-10";
            zfysyp_detail_table_vm.table_list_6_class = "col-15";
            zfysyp_detail_table_vm.table_list_7_class = "col-20";
            zfysyp_detail_table_vm.table_list_8_class = "col-10";
            zfysyp_detail_table_vm.table_list_9_class = "col-10";
            break;
        case 'AUDIO_MENU_ZFDA_SGCL': //事故处理
            zfyps_detail_add_dialog.ajax_url = "/gmvcs/audio/accident/search/pageable";
            zfyps_detail_add_dialog.handle_txt = "事故编号";
            zfyps_detail_add_dialog.time_txt = "事故时间";

            zfysyp_detail_table_vm.table_list_status_8 = false;
            zfysyp_detail_table_vm.table_list_status_9 = false;
            zfysyp_detail_table_vm.table_list_3 = "姓名/警号";
            zfysyp_detail_table_vm.table_list_4 = "事故编号";
            zfysyp_detail_table_vm.table_list_5 = "事故时间";
            zfysyp_detail_table_vm.table_list_6 = "事故地点";
            zfysyp_detail_table_vm.table_list_7 = "处理时间";
            zfysyp_detail_table_vm.table_list_3_class = "col-15";
            zfysyp_detail_table_vm.table_list_4_class = "col-20";
            zfysyp_detail_table_vm.table_list_5_class = "col-15";
            zfysyp_detail_table_vm.table_list_6_class = "col-25";
            zfysyp_detail_table_vm.table_list_7_class = "col-15";
            break;
    }

    if (flag) {
        zfyps_detail_add_dialog.searchBtn();
    }
}
/*================== 添加关联弹窗 end =============================*/
function setChildType(parentCode, selfCode) {
    // console.log('setChildType',parentCode,selfCode);
    ajax({
        url: '/gmvcs/uap/dic/findByParent/?code=' + parentCode,
        method: 'get',
        data: {}
    }).then(result => {
        if (result.code != 0) {
            notification.error({
                message: '获取数据字典失败，请稍后再试',
                title: '通知'
            });
        }
        let ret_data = [{
            value: "0",
            label: "无"
        }];
        if (result.data != null && result.data.length != 0) {
            avalon.each(result.data, function (index, item) {
                let ret_obj = {};
                ret_obj.value = item.code;
                ret_obj.label = item.name;

                ret_data.push(ret_obj);
            });
        }
        tag_type_son_vm.tag_options = ret_data;
        tag_type_son_vm.tag_type_son_jj = [selfCode || "0"];
    });
}