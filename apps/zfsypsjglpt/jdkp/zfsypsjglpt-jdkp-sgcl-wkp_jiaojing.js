
import {
    notification
} from 'ane';
import ajax from '/services/ajaxService';
import * as menuServer from '/services/menuService';

require('./zfsypsjglpt-jdkp-sgcl-wkp_jiaojing.css');
export const name = 'zfsypsjglpt-jdkp-sgcl-wkp_jiaojing';
let storage = require('/services/storageService.js').ret;
let policeType = storage.getItem("policeType");
let kplb_type = storage.getItem("kplb_type");
let delete_ocx = require('/apps/common/common').delete_ocx;

let ajglMan = null;
let sgclkp_ck_Man = null;
let tempUnselected = [], //全局的存储未勾选的考核标准项
    globalEvaList = {
        retData: []
    }, //全局的存储考评信息
    currentList = {
        evaStatus: false,
        reviewStatus: false
    };
let ajgl_session = (function () {
    let rid = ''; //事故处理违法数据编号-主键
    return {
        getAjbh: function () {
            rid = storage.getItem('zfsypsjglpt-jdkp-sgclkp-current-sgclkpData').rid;
            return rid;
        }
    };
})();

avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-sgcl-wkp_jiaojing.html'),
    defaults: {
        // zfsypsjglpt_language: getLan(), //英文翻译

        //ck part
        //点击返回按钮
        ajgl_back(e) {
            delete_ocx();
            $('.popover').hide();
            Tools.clearPlayer('');
            sgclkp_ck_Man.jckpStatus = false;
            sgclkp_ck_Man.fzkpStatus = false;

            $("#gm_webplayer").hide();
            if (this.ocxPlayer) {
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
            }
            //路由跳转至查询页面
            let init_data = storage.getItem("zfsypsjglpt-jdkp-sgclkp-current-sgclkpData");
            if (init_data) {
                if (init_data.sjsgclkp) {
                    avalon.history.setHash("/zfsypsjglpt-jdkp-sjsgclkp");
                } else {
                    avalon.history.setHash("/zfsypsjglpt-jdkp-sgcl_jiaojing");
                }
            } else {
                avalon.history.setHash("/zfsypsjglpt-jdkp-sgcl_jiaojing");
            }
            storage.removeItem("zfsypsjglpt-jdkp-sgclkp-current-sgclkpData");

        },

        //页面标题 -- 正在看
        checkLooking: '',
        checkorgName: '',
        //共多少条关联媒体
        glmt_total: 0,

        //所有类型媒体的集合
        glmt_type: ['jq_checked_data', 'cj_checked_data'],
        glmt_name: ['jq', 'cj'],

        //媒体标志 -- 目前在哪一类媒体上
        glmt_mark: 'cj',

        //关联媒体 -- 接警
        jq_clickClass: 'glmt_jj', //按钮样式
        jq_data: [], //展示的关联媒体
        glmt_jq_show: false, //媒体切换
        glmt_jq(e) { //点击警情  
            Tools.clickGlmt('jq');
        },

        mapAjaxData: {
            "deviceId": "", // 设备id
            "fileRid": "", // 文件Rid
            "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
            "beginTime": "", // 开始时间
            "endTime": "" // 结束时间
        },

        tabIndex: 0,
        glmt_tab_click(index) {
            this.tabIndex = index;
        },

        //关联媒体 -- 暂无
        cj_clickClass: 'glmt_cj',
        cj_data: [],
        glmt_cj_show: true,
        glmt_cj(e) {
            Tools.clickGlmt('cj');
        },
        jq_nodata: false,
        cj_nodata: false,

        //关联警情下拉及单独三个字段
        gljq_info: {
            bjsj: '',
            jqlbmc: '',
            bjnr: ''
        },
        selecting: '',
        typeOptions: [],
        viewJq(a, b, c) {
            this.selecting = a.target.value;
            Tools.searchMediaByJqbh();
        },
        //点击折叠
        toggleMt(e, z, x) {
            var arr = e.srcElement.src.split('/');
            var path = arr[arr.length - 1].split('?')[0];
            var mark = false;
            var rid = e.srcElement.attributes.name.nodeValue;
            var type = sgclkp_ck_Man.glmt_mark;
            var aim = null;
            sgclkp_ck_Man[type + '_data'].forEach(function (val, key) {

                if (val.rid == rid) {
                    aim = val;
                }
            });

            if (path == 'zk.png') {
                e.srcElement.src = '/static/image/zfda-ajgl-ck/wzk.png?__sprite';
                mark = false;
            } else {
                e.srcElement.src = '/static/image/zfda-ajgl-ck/zk.png?__sprite';
                mark = true;

                ajax({
                    url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {

                    if (ret.code == 0) {
                        aim.jobType = ret.data.jobType;
                        if (ret.data.saveTime == -1) {
                            aim.saveTime = '永久存储';
                        } else if (ret.data.saveTime == -2) {
                            aim.saveTime = '已过期';
                        } else {
                            aim.saveTime = ret.data.saveTime + '天';
                        }

                        if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                            aim.path = "采集工作站、存储服务器";
                        } else {

                            if (ret.data.saveSiteWs) {
                                aim.path = "采集工作站";
                            } else if (ret.data.saveSiteSt) {
                                aim.path = "存储服务器";
                            }

                        }

                        if (aim.saveTime == '已过期') {
                            aim.path = "-";
                        }
                    } else {
                        Tools.sayError('获取详细信息失败');
                    }
                    Tools.reduceWordForToggle();
                });

            };
            sgclkp_ck_Man[type + '_data'].forEach(function (val, key) {

                if (val.rid == rid) {
                    val.toggle = mark;
                    return;
                }
            });
        },
        src: '',
        video_url: '',
        audio_url: '',
        loading: false,
        ocxPlayer: false,
        playingFile: '',

        media_type: false,
        web_width: '',
        web_height: '',
        web_left: '',
        web_top: '',
        play_status: false,

        imgff: false,

        //点击媒体文件名
        playFile(e, key, el) {
            var rid = $(e.currentTarget).find('[path]').attr('name'); //获取元素属性上用于请求的rid                   
            var type = $(e.currentTarget).find('[path]').attr('type'); //获取媒体类型: 视频/语音/图片/其他/文字 
            var name = $(e.currentTarget).find('[path]').attr('fileName');
            var userName = $(e.currentTarget).find('[path]').attr('userName');
            var userCode = $(e.currentTarget).find('[path]').attr('userCode');

            // sgclkp_ck_Man.checkLooking = '正在查看：' + name;
            sgclkp_ck_Man.checkLooking = this.checkorgName + ' - ' + userName + '(' + userCode + ') - ' + name;

            var mark = sgclkp_ck_Man.glmt_mark;

            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            ajglMan.playingFile = rid;
            //          filePlayer.play(type, rid, '');
            this.mtxx();
            //更新媒体信息
            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {
                    // 画轨迹所需参数
                    this.mapAjaxData = {
                        "deviceId": ret.data.deviceId,
                        "fileRid": ret.data.rid,
                        "fileType": ret.data.type,
                        "beginTime": ret.data.startTime,
                        "endTime": ret.data.endTime
                    };
                    ret.data.importTime = formatDate(ret.data.importTime);
                    ret.data.startTime = formatDate(ret.data.startTime);
                    ret.data.keyFile = ret.data.keyFile == true ? '已关联' : '未关联';

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
                        // $('.palyerImg').css('display', 'none');
                        sgclkp_ck_Man.imgff = false;
                        sgclkp_ck_Man.ocxPlayer = false;
                        $('.finishDelete').css('display', 'none');
                        $('.outDateMedia').css('display', 'block');
                    } else {
                        filePlayer.play(type, rid, '');
                    }
                    this.cjxxInfo.infomation = ret.data;
                    this.cjxxInfo.infomation.keyFile = ret.data.match ? '已关联' : '未关联';
                    Tools.reduceWordForCjxx();
                } else {
                    Tools.sayError('获取详细媒体信息失败');
                }
            });

        },
        sgclkp_titleShow_kp: '考评', //考评|考评结果|核查处理|考评核查结果

        //查看 -- 基层考评
        jckp_clickClass: 'jbxx-btn',
        fzkp_clickClass: 'cjxx-btn',
        mtxx_clickClass: 'cjxx-btn',
        cjxx_show: -1,
        noneKP: true, //选中警情信息时,需要同时隐藏基层跟法制
        kpType: 'jckp',

        //查看 -- 基本信息
        jbxx_clickClass: 'cjxx-btn',
        jbxx_show: false,
        jbxx(e) {
            this.jbxx_clickClass = 'jbxx-btn';
            this.fzkp_clickClass = 'cjxx-btn';
            this.jckp_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = 'cjxx-btn';
            this.jbxx_show = true;
            this.cjxx_show = -1;
            this.noneKP = false;
            Tools.reduceWordForJbxx();
        },
        //查看媒体信息
        mtxx() {
            this.mtxx_clickClass = 'jbxx-btn';
            this.fzkp_clickClass = 'cjxx-btn';
            this.jckp_clickClass = 'cjxx-btn';
            this.jbxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.cjxx_show = 2;
            this.noneKP = false;
            Tools.reduceWordForJbxx();
        },
        jbxxInfo: avalon.define({
            $id: 'sgclkp_jycxxx_info',
            infomation: {} //基本信息的数据
        }),

        //查看 -- 处警信息
        cjxx(kpType) {
            this.jbxx_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.kpType = kpType;
            this.cjxx_show = -1;
            sgclkp_ck_Man.cjxxInfo.selectEva = [];
            tempUnselected = [];
            if (kpType == 'jckp') {
                this.jckp_clickClass = 'jbxx-btn';
                this.fzkp_clickClass = 'cjxx-btn';
            } else {
                this.jckp_clickClass = 'cjxx-btn';
                this.fzkp_clickClass = 'jbxx-btn';
            }
            //点击基层考评
            if (kpType == 'jckp') {
                if (currentList.evaStatus) {
                    getEvaInfo("BASIC");
                } else {
                    getPolicesituation();
                }
            } else {
                //点击法制考评
                // if (currentList.fzkp) {
                //     getEvaInfo("LEGAL");
                // } else {
                //     getPolicesituation();
                // }
            }

        },
        noneKP_cont: avalon.define({
            $id: 'sgclkp_noneKP_cont_jdkp',
            result: ['未正确佩戴执法仪、未摄录关键场景、未执法过程文明用语'], //考评结果
            comment: '应改正已指出错误，真正服务于民', //考评评语
            orgName: '1111', //考评部门
            userName: '阿斯蒂芬', //考评人
            userCode: '', //考评人警号
            createTime: '2018-04-05 15:14:32', //考评时间
            passed: false, //考评 是否通过true-通过，false-不通过
            noneEvaList: false
        }),
        cjxxInfo: avalon.define({
            $id: 'sgclkp_kpxx_select',
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            }, //媒体信息的数据

            selectCheck: [{
                "code": "LEVAM_SGCLKP_SFTG",
                "name": "是否通过",
                "desc": "没有描述",
                "order": 46,
                "createdTime": 1514169646000,
                "createBy": "admin",
                "check": "none"
            }], //考核选择

            selectEva: [],
            evaLists: [],
            commentValue: '',
            getCommentVal(e) {
                let _this = this;
                _this.commentValue = e.target.value;
                if (e.target.value != "") {
                    let temp = document.getElementById("commentBox");
                    temp.style.color = '#536b82';
                }
            },
            sgclkpPassed: true,
            handleChangePassed(e) {
                let _this = this;
                _this.sgclkpPassed = e.target.value == 'Y' ? true : false;
                _this.selectCheck[0].check = 'checked';
            },
            handleChange(e) {
                let _this = this;
                let tempArr = e.target.value.split('-');
                let tempArrCode = tempArr[0];
                let tempArrName = tempArr[1];
                let tempArrChecked = (tempArr[2] == "Y") ? true : false;
                if (tempArrChecked) {
                    _this.sgclkpPassed = false; //如果选择了一项考评为 是，则不通过考评；
                }
                let tempIndex = findElem(_this.selectEva, 'code', tempArrCode);
                _this.selectEva[tempIndex].check = tempArrChecked;
                let tempId = document.getElementById(tempArrCode);
                tempId.style.color = "#536b82";
                let temp = document.getElementById("commentBox");
                temp.style.color = '#536b82';
            },
            // tempSelectpj:'',//临时保存勾选项
            // handleChange(e) {
            //     let _this = this;
            //     if(e.target.value[0]){
            //         _this.tempSelectpj=e.target.value[0];
            //         let tempArr = e.target.value[0].split('-');
            //         let tempArrCode = tempArr[0];
            //         let tempArrName = tempArr[1];
            //         let tempArrChecked = (tempArr[2] == "Y") ? true : false;
            //         let tempIndex = findElem(_this.selectEva, 'code', tempArrCode);
            //         _this.selectEva[tempIndex].check = tempArrChecked;
            //         let tempId = document.getElementById(tempArrCode);
            //         tempId.style.color = "#536b82";
            //     }else{
            //             let tempArr = _this.tempSelectpj.split('-');
            //             let tempArrCode = tempArr[0];
            //             let tempArrName = tempArr[1];
            //             let tempArrChecked = false;
            //             let tempIndex = findElem(_this.selectEva, 'code', tempArrCode);
            //             _this.selectEva[tempIndex].check = false;
            //             let tempId = document.getElementById(tempArrCode);
            //             tempId.style.color = "red";                       

            //     }                
            // },
            //完成评语
            submitComment() {
                //判断考评是否完成,若已完成,则弹出确认框,否则标红未进行考评的选项
                let _this = this;
                tempUnselected = [];
                let tempSelectEva = _this.selectEva;
                if (sgclkp_ck_Man.cjxxInfo.commentValue.length > 500) {
                    notification.warn({
                        message: '评语最多输入500个字',
                        title: '温馨提示'
                    });
                    return;
                }
                if (sgclkp_ck_Man.cjxxInfo.selectEva.length == 0) {
                    notification.warn({
                        message: '考核标准项为空,不允许提交考评,请联系管理员!',
                        title: '提示'
                    });
                    return;
                }
                // if (sgclkp_ck_Man.cjxxInfo.selectCheck[0].check == 'none') {
                //     notification.warn({
                //         message: '请选择考评是否通过!',
                //         title: '温馨提示'
                //     });
                //     return;
                // }
                for (var i = 0; i < tempSelectEva.length; i++) {
                    if (tempSelectEva[i].check == true) {
                        tempUnselected.push({
                            code: tempSelectEva[i].code,
                            name: tempSelectEva[i].name
                        });
                    }
                };
                // if (sgclkp_ck_Man.cjxxInfo.commentValue != "" || (tempUnselected.length >= 1)) { //考评项或 评语二选一
                if (sgclkp_ck_Man.cjxxInfo.commentValue != "") { //评语必填
                    confirmCont.confirmShow = true;
                    confirmVm.operation_type = 1;
                    confirmVm.dialog_text = "确认评价？";
                } else {
                    unFinishBox_cont.unFinishShow = true;
                }
                $("#iframe_zfsyps").css({
                    "opacity": 0
                });
                setTimeout(function () {
                    $("#iframe_zfsyps").css({
                        "opacity": 1
                    });
                    $("#iframe_zfsyps").show();
                }, 100);
            }
        }),

        //点击详细内容
        show_info: false,
        cancelInfo() {
            this.show_info = false;

            // var childFrameObj = document.getElementById('gm_ajkp_webplayer');
            // childFrameObj.contentWindow.show_player();
            // childFrameObj = null;
            $('#gm_webplayer').css('z-index', 9999);
            $("#iframe_zfsyps").hide();

            $('.popover').hide();
        },
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: "980px", //---- 这个是弹窗的宽度
                height: "410px", //---- 这个是弹窗的高度
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

        //警员类型,结合权限控制底部按钮的显示隐藏
        jckpStatus: false,
        fzkpStatus: false,

        authority: { // 按钮权限标识
            "SEARCH": false, //监督考评-警情考评-查询按钮
            "JCKP": false, //监督考评-警情考评-查看-基层考评
            "FZKP": false, //监督考评-警情考评-查看-法制考评
            "SGCLKP_KP": false
        },

        //警员版本功能  是否考评 policeFZKP法制考评 policeJCKP基层考评
        policeFZKP: false,
        policeJCKP: false,

        onInit(event) {
            ajglMan = this;
            sgclkp_ck_Man = this;

            sgclkp_ck_Man.cjxx_show = '-2';
            //置空警情/媒体信息栏的初始值
            this.jbxxInfo.infomation = {};
            sgclkp_ck_Man.cjxxInfo.selectCheck[0].check = 'none'; //初始化通过选项
            this.cjxxInfo.infomation = {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            }; //媒体信息的数据清空
            currentList.evaStatus = (storage.getItem("zfsypsjglpt-jdkp-sgclkp-current-sgclkpData").evaStatus) ? true : false;
            currentList.reviewStatus = (storage.getItem("zfsypsjglpt-jdkp-sgclkp-current-sgclkpData").reviewStatus) ? true : false;

            //请求警情信息并进行页面填充操作
            globalEvaList = {
                retData: []
            };

            // 查看、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP_SGCLKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_SGCLKP_KP":
                            sgclkp_ck_Man.authority.SGCLKP_KP = true;
                            break;
                    }
                });

                sgclkp_ck_Man.authority.SEARCH = true;

                Tools.searchCaseInfo(); //再次，解决ie和火狐执行顺序不一致bug，初始化基本信息和处警信息  


                sgclkp_ck_Man.ocxPlayer = true;

                $("#ocxPlayer").css("visibility", "hidden");

                //播放器设置
                this.video_url = "";
                this.play_status = false;
                this.web_width = $("#ocxPlayer").width();
                this.web_height = $("#ocxPlayer").height();
                this.web_left = $("#ocxPlayer").offset().left + 1;
                this.web_top = $("#ocxPlayer").offset().top + 1;

                //设置播放器宽高并显示
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
            });
        },
        onReady() {
            Tools.searchCaseInfo(); //初始化基本信息和处警信息  
            let _this = this;

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
                    //若已有弹窗则阻止f5刷新操作
                    if (confirmCont.confirmShow || unFinishBox_cont.unFinishShow)
                        return;
                    confirmVm.operation_type = 2;
                    confirmVm.dialog_text = ' 是否确认离开此页面？';
                    confirmCont.confirmShow = true;
                    $("#gm_webplayer").hide();
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
                if (global.location.hash.indexOf("zfsypsjglpt-jdkp-sgcl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-jdkp-sgcl_jiaojing");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-jdkp-sgcl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-jdkp-sgcl_jiaojing");
            });
        },
        onDispose() {

            Tools.clearPlayer('');
            $(document).unbind("keydown");
            storage.removeItem("zfsypsjglpt-jdkp-sgclkp-current-sgclkpData");
            $("#gm_webplayer").hide();
            this.play_status = false;
            this.ocxPlayer = false;

            if (this.ocxPlayer) {
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
            }
        }
    }
});


let confirmCont = avalon.define({
    $id: 'confirmCont_ajkp',
    confirmShow: false,
    confirmCancel() {
        this.confirmShow = false;
        $("#iframe_zfsyps").hide();
    },
    move_return(a, b) {
        $("#iframe_zfsyps").css({
            width: "300px", //---- 这个是弹窗的宽度
            height: "180px", //---- 这个是弹窗的高度
            left: a,
            top: b
        });
    },
    confirmOk() {
        // $("#gm_webplayer").hide();
        if (!ajgl_session.getAjbh()) {
            return;
        }
        if (confirmVm.operation_type == 1) {
            let clickType = sgclkp_ck_Man.kpType;
            let tempType = sgclkp_ck_Man.kpType == 'jckp' ? "BASIC" : "LEGAL";
            ajax({
                url: '/gmvcs/audio/accident/eva',
                // url: '/api/jdkpJYCXKP-hqxxxx-qrpj', 
                method: 'post',
                data: {
                    // "type": tempType,
                    // "dataType": "CM",
                    "bh": ajgl_session.getAjbh(),
                    evaInfo: {
                        evaItems: sgclkp_ck_Man.cjxxInfo.selectEva,
                        comment: sgclkp_ck_Man.cjxxInfo.commentValue,
                        passed: sgclkp_ck_Man.cjxxInfo.sgclkpPassed,
                    }
                },
                cache: false
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '考评成功',
                        title: "温馨提示"
                    });
                    //考评成功之后,必须去修改currentList
                    if (clickType == 'jckp') {
                        currentList.evaStatus = true;
                    } else {
                        // currentList.fzkp = true;
                    }
                    this.confirmShow = false;
                    $("#iframe_zfsyps").hide();
                    //重新刷新页面获取已考评信息
                    getEvaInfo(tempType);
                } else {
                    this.confirmShow = false;
                    $("#iframe_zfsyps").hide();
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            });
        } else if (confirmVm.operation_type == 2) {
            $(document).unbind("keydown");
            setTimeout(function () {
                avalon.history.setHash("/zfsypsjglpt-jdkp-sgcl_jiaojing");
            }, 300);
            this.confirmShow = false;
            $("#iframe_zfsyps").hide();
        }
    }
});
let confirmVm = avalon.define({
    $id: 'confirmVm_ajkp',
    title: '提示',
    dialog_text: "",
    operation_type: 1, //1表示确认评价的提示语,2表示f5刷新的提示语
});

let unFinishBox_cont = avalon.define({
    $id: 'unFinishBox_cont_ajkp',
    unFinishShow: false,
    unFinishCancel() {
        this.unFinishShow = false;
        $("#iframe_zfsyps").hide();
        //对于未做考评项的进行文字标红操作
        markRedIcon();
    },
    move_return(a, b) {
        $("#iframe_zfsyps").css({
            width: "300px",
            height: "180px",
            left: a,
            top: b
        });
    }
});
let unFinishBox_vm = avalon.define({
    $id: 'unFinishBox_vm_ajkp',
    title: '提示',
    unFinishOK() {
        unFinishBox_cont.unFinishShow = false;
        $("#iframe_zfsyps").hide();
        markRedIcon();
    }
});
//对于未做考评项的进行文字标红操作
function markRedIcon() {
    for (var k = 0; k < tempUnselected.length; k++) {
        let tempId = document.getElementById(tempUnselected[k].code);
        tempId.style.color = "red";
    }
    let temp = document.getElementById("commentBox");
    if (sgclkp_ck_Man.cjxxInfo.commentValue == "") {
        temp.style.color = "red";
    } else {
        temp.style.color = "#536b82";
    }

}
/*按照属性值，查找对象*/
function findElem(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
        if (arrayToSearch[i][attr] == val) {
            return i;
        }
    }
    return -1;
}
let all_info = avalon.define({
    $id: 'ajgl-allinfo',
    title: '详细'
});
let info_body = avalon.define({
    $id: 'allinfo_body_ajkp',
    allInfomation: {}
});
/**********通用函数工具**********/
let Tools = {
    initOcxPlayer: function () {
        $('#btn_play').show();
        $('#btn_stop').hide();
        $('#ajgl_playControll').on('click', 'img', GlobalOcxPlayer.playControll);
        GlobalOcxPlayer.InitPlay('ajgl_gxxPlayOcx');
    },
    formatDuring: function (mss) {
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (mss % (1000 * 60)) / 1000;
        hours = hours < 10 ? ('0' + hours) : hours;
        minutes = minutes < 10 ? ('0' + minutes) : minutes;
        seconds = seconds < 10 && seconds >= 0 ? ('0' + seconds) : seconds;
        return hours + " : " + minutes + " : " + seconds;
    },
    checkSpace: function (aim) {
        var isOk = true;

        if (aim instanceof Array) {
            for (var i = 0, len = aim.length; i < len; i++) {

                if (!aim[i].toString().replace(/\s+/g, '')) {
                    isOk = false;
                    break;
                }
            };
        } else {
            isOk = !aim.replace(/\s+/g, '') ? false : true;
        };
        return isOk;
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
    searchMediaByJqbh: function () {
        // var id = ajglMan.selecting;

        // if (id == '') {
        //     ajglMan.gljq_info = {
        //         bjsj: '',
        //         jqlbmc: '',
        //         bjnr: ''
        //     };
        //     info_body.allInfomation = {
        //         jqbh: '',
        //         bjsj: '',
        //         sfdd: '',
        //         bjrxm: '',
        //         bjrdh: '',
        //         bjnr: '',
        //         ddxcsj: [],
        //         zbmjxm: [],
        //         xbmjmc: '',
        //         cjdwmc: '',
        //         sfsj: '',
        //         cjsj: [],
        //         jlly: '',
        //         jqlbmc: '',
        //         mjyj: '',
        //     };
        //     sgclkp_ck_Man.cj_data = [];
        //     sgclkp_ck_Man.jq_nodata = !Boolean(sgclkp_ck_Man.jq_data.length);
        //     sgclkp_ck_Man.cj_nodata = !Boolean(sgclkp_ck_Man.cj_data.length);
        //     this.configGlmtNumber(); //关联媒体总数和选中个数

        //     return;
        // }
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + id,
            // url: '/api/jdkpjycxkp_kpxx',
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {
                    Tools.saySuccess('该警情无相关数据');
                    ajglMan.gljq_info = {
                        bjsj: '',
                        jqlbmc: '',
                        bjnr: ''
                    };
                    info_body.allInfomation = {
                        jqbh: '',
                        bjsj: '',
                        sfdd: '',
                        bjrxm: '',
                        bjrdh: '',
                        bjnr: '',
                        ddxcsj: [],
                        zbmjxm: [],
                        xbmjmc: '',
                        cjdwmc: '',
                        sfsj: '',
                        cjsj: [],
                        jlly: '',
                        jqlbmc: '',
                        mjyj: '',
                    };
                    sgclkp_ck_Man.cj_data = [];
                    sgclkp_ck_Man.jq_nodata = !Boolean(sgclkp_ck_Man.jq_data.length);
                    sgclkp_ck_Man.cj_nodata = !Boolean(sgclkp_ck_Man.cj_data.length);
                    this.configGlmtNumber(); //关联媒体总数和选中个数

                    return;
                }

                //处理关联警情字段
                ret.data.jlly = ret.data.jlly == '01' ? '后台系统同步' : '管理系统人工录入';
                ajglMan.gljq_info = ret.data;
                let zbmjxmTemp = [];
                // for(let i=0;i<20;i++){
                for (let i = 0; i < ret.data.zbmjxm.length; i++) {
                    zbmjxmTemp.push(ret.data.zbmjxm + '(' + ret.data.zbmj + ')');
                }
                ret.data.zbmjxm = zbmjxmTemp;

                // ret.data.zbmjxm = ret.data.zbmjxm + '(' + ret.data.zbmj + ')';
                ret.data.xbmjmc = ret.data.xbmjmc + '(' + ret.data.xbmj + ')';
                info_body.allInfomation = ret.data;
                Tools.reduceWordForGljq();

                //处理通过警情ID获得的媒体文件
                ret.data.preBaseFiles = ret.data.preBaseFiles ? ret.data.preBaseFiles : [];
                ret.data.handelerBaseFiles = ret.data.handelerBaseFiles ? ret.data.handelerBaseFiles : [];
                ['preBaseFiles', 'handelerBaseFiles'].forEach(function (val, key) {
                    ret.data[val].forEach(function (val, key) {
                        val.checked = false;
                        val.importTime = formatDate(val.importTime);
                        val.startTime = formatDate(val.startTime);
                        val.duration = Tools.formatDuring(val.duration * 1000);
                        val.toggle = false;
                        val.keyFile = val.keyFile == true ? '已关联' : '未关联';
                        val.type = (function () {
                            switch (val.type) {

                                case 0:
                                    return '视频';
                                    break;
                                case 1:
                                    return '音频';
                                    break;
                                case 2:
                                    return '图片';
                                    break;
                                case 3:
                                    return '文本';
                                    break;
                                case 4:
                                    return '其他';
                                    break;
                            }
                        }());
                    });
                });

                //处理选中已经总共数量的显示
                // sgclkp_ck_Man.jq_data = ret.data.handelerBaseFiles;
                sgclkp_ck_Man.cj_data = ret.data.handelerBaseFiles;
                sgclkp_ck_Man.jq_nodata = !Boolean(sgclkp_ck_Man.jq_data.length);
                sgclkp_ck_Man.cj_nodata = !Boolean(sgclkp_ck_Man.cj_data.length);
                this.configGlmtNumber(); //关联媒体总数和选中个数

            }
        });
    },
    clearForm: function () {
        table.$selectOption = [];
        ajglMan.$searchForm.record = ajgl_initialData();
    },
    clearPlayer: function (type) {
        var playing = type == '_dia' ? tjgl_form : sgclkp_ck_Man;

        if (type == '') {
            $('.finishDelete').css('display', 'none');
        }
        playing.video_url = '';
        playing['ocxPlayer' + type] = false;

        playing.imgff = false;
        $('.outDateMedia' + type).css('display', 'none');
    },
    reduceWordForToggle: function () {
        $('.mtsecondpart .jj-inline-div .inlineSpan span:nth-child(2)').each(function () {

            if ($(this).text().length > 13) {
                // $(this).attr('title', $(this).text());
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
                $(this).attr('title', $(this).text().split('：')[1]);
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

        $('.gljq_inline span').each(function () {
            if ($(this).text().length > 15) {
                // $(this).attr('title', $(this).text().split('：')[1]);
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.gljq_inline').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text().split('：')[1] + '</div>';
            },
            animation: false
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
            $(".popover").on("mouseleave", function () {
                $('.popover').hide();
            });
        }).on('shown.bs.popover', function () {
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
            placement: 'top',
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
            placement: 'top',
            //delay:{ show: 5000},
            //viewport:{selector: 'body',padding:0},
            //title : '<div style="font-size:14px;">title</div>',  
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    // getTree: function () {
    //     ajax({
    //         url: '/gmvcs/uap/org/all',
    //         method: 'get',
    //         data: {},
    //         cache: false
    //     }).then(ret => {
    //         ajglMan.searchForm_sjdw.rdata = Tools.addIcon(ret.data);
    //         ajglMan.searchForm_sjdw.expandedKeys = [ret.data[0].orgId];
    //         var ajgl_form_data = null;

    //         if (storage && storage.getItem) {

    //             if (storage.getItem('zfsypsjglpt-jdkp-jtwfkp')) {
    //                 ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-jtwfkp'));
    //             }
    //         } else {

    //         };

    //         ajglMan.searchForm_sjdw.checkedKeys = ajgl_form_data ? ajgl_form_data.sjdw : (ret.data ? ret.data[0].orgId : '');
    //         ajglMan.searchForm_sjdw.sjdw = ajgl_form_data ? ajgl_form_data.sjdw : ret.data[0].orgId;
    //         ajglMan.$searchForm.record.sjdw = ajgl_form_data ? ajgl_form_data.sjdw : ret.data[0].orgId;
    //         table.fetch(true, true);
    //     });
    // },
    // //给tree增加图标
    // addIcon: function (arr) {

    //     // 深拷贝原始数据
    //     var dataSource = JSON.parse(JSON.stringify(arr))
    //     var res = [];

    //     // 每一层的数据都 push 进 res
    //     res.push(...dataSource);

    //     // res 动态增加长度
    //     for (var i = 0; i < res.length; i++) {
    //         var curData = res[i]
    //         curData.icon = '/static/image/zfsypsjglpt/users.png';
    //         curData.key = curData.orgId;
    //         curData.title = curData.orgName;
    //         curData.name = curData.orgName;
    //         curData.children = curData.childs;

    //         // null数据置空
    //         curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
    //         curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
    //         curData.extend = curData.extend == null ? '' : curData.extend;

    //         // 如果有 children 则 push 进 res 中待搜索
    //         if (curData.childs) {
    //             res.push(...curData.childs.map(d => {
    //                 return d;
    //             }))
    //         }
    //     }
    //     return dataSource;
    // },
    dealTableWithoutData: function (page) {
        table.$cache[page] = [];
        table.pagination.total = table.flag == 0 ? table.pagination.total : 0;
        table.remoteList = [];
        table.loading = false;
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
        // Tools.saySuccess('无案件数据');
        return;
    },
    getFirstDayOfWeek: function (date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    timeCalculator: (function () {
        var States = {
            status: 'last-week',
            'last-week': function () {
                this.status = 'last-week';
                ajglMan.dateShow = false;
                var now = new Date();
                var oneDayTime = 24 * 60 * 60 * 1000;

                //显示周一
                var MondayTime = +Tools.getFirstDayOfWeek(now);
                //显示周日
                var SundayTime = MondayTime + 6 * oneDayTime;

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);
                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                sunday.setHours(23);
                sunday.setMinutes(59);
                sunday.setSeconds(59);

                ajglMan.$searchForm.record.bjsjEnd = Number(+sunday);
                ajglMan.$searchForm.record.bjsjStart = Number(+monday);
                ajglMan.kssj_isNull = 'none';
                ajglMan.jssj_isNull = 'none';
                $('.timeCover .ane-datepicker-input').val('');
                now = null;
                oneDayTime = null;
                MondayTime = null;
                SundayTime = null;
                monday = null;
                sunday = null;
            },
            'last-month': function (jh) {
                this.status = 'last-month';
                ajglMan.dateShow = false;
                var now = new Date();
                now.setDate(1);
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);

                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var d = new Date(year, month, 0);

                var end = new Date();
                end.setDate(d.getDate());
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);

                ajglMan.$searchForm.record.bjsjEnd = Number(+end);
                ajglMan.$searchForm.record.bjsjStart = Number(+now);
                ajglMan.kssj_isNull = 'none';
                ajglMan.jssj_isNull = 'none';
                $('.timeCover .ane-datepicker-input').val('');
                now = null;
                date = null;
                year = null;
                month = null;
                d = null;
                end = null;
            },
            'last-past-of-time': function (jh) {
                this.status = 'last-past-of-time';
                ajglMan.dateShow = true;
                var now = new Date();
                now.setHours(23);
                now.setMinutes(59);
                now.setSeconds(59);
                var end = new Date();
                ajglMan.$searchForm.record.bjsjEnd = Number(+now);
                end.setMonth(now.getMonth() - 3 + '');
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                ajglMan.$searchForm.record.bjsjStart = Number(+end);
                $('.top-form').find($("[placeholder = '开始时间']")).val(formatDate(+end, true));
                $('.top-form').find($("[placeholder = '结束时间']")).val(formatDate(+now, true));
            }
        };
        return {
            calculate: function (type) {
                States[type] && States[type]();
            },
            getStatus: function () {
                return States.status;
            },
            setStatus: function (sts) {
                States.status = sts;
            }
        };
    })(),
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
        // Tools.searchMediaByJqbh();      
        ajax({
            url: '/gmvcs/audio/accident/search/' + ajgl_session.getAjbh(),
            // url: '/api/jdkpSGCLKP-hqxx',            
            method: 'get',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {

                } else {
                    ret.data.type = changeWfType(ret.data.type);
                    sgclkp_ck_Man.jbxxInfo.infomation = ret.data;
                    sgclkp_ck_Man.checkorgName = ret.data.orgName;

                    var type = sgclkp_ck_Man.glmt_mark;
                    sgclkp_ck_Man.glmt_total = sgclkp_ck_Man[type + '_data'] ? sgclkp_ck_Man[type + '_data'].length : 0;
                    //测试字段对接
                    var ret_data = ret.data;
                    ret_data.rid; //事故处理违法数据编号-主键
                    ret_data.orgCode; //执勤部门编号
                    ret_data.orgName; //执勤部门名称
                    ret_data.userCode; //执勤民警警号
                    ret_data.userName; //执勤民警名称
                    ret_data.idCard; //执勤民警身份证号
                    ret_data.sgbh; //事故编号
                    ret_data.sglx; //事故类型
                    ret_data.sgfssj; //事故发生时间
                    ret_data.clsj; //事故处理时间
                    ret_data.hphm; //号牌号码
                    ret_data.sgdd; //事故地点
                    ret_data.wfxw; //违法行为
                    ret_data.relation; //是否关联媒体
                    ret_data.evaStatus; //是否考评
                    ret_data.reviewStatus; //是否核查
                    ret_data.evaResult; //考评结果 0-不通过，1-通过，- -未考评
                    ret_data.reviewResult; //核查结果 0-不属实，1属实，- -未核查
                    ret_data.type; //交通执法类型:VIOLATION-简易程序，SURVEIL-非现场处罚，FORCE-强制措施，ACCIDENT-事故处理
                    ret_data.files; //事故处理违法数据关联到的媒体
                    sgclkp_ck_Man.cj_data = ret_data.files; //简易程序违法数据关联到的媒体
                    if (sgclkp_ck_Man.cj_data) {
                        sgclkp_ck_Man.cj_data.forEach(function (val, key) {
                            val.checked = false;
                            val.importTime = formatDate(val.importTime);
                            val.startTime = formatDate(val.startTime);
                            val.duration = Tools.formatDuring(val.duration * 1000);
                            val.toggle = false;
                            val.keyFile = val.keyFile == true ? '已关联' : '未关联';
                            val.type = (function () {
                                switch (val.type) {

                                    case 0:
                                        return '视频';
                                        break;
                                    case 1:
                                        return '音频';
                                        break;
                                    case 2:
                                        return '图片';
                                        break;
                                    case 3:
                                        return '文本';
                                        break;
                                    case 4:
                                        return '其他';
                                        break;
                                }
                            }());
                        });
                    } else {
                        sgclkp_ck_Man.cj_nodata = true;
                    }

                    ret_data.evaInfo; //事故处理违法数据考评信息
                    ret_data.reviewInfo; //事故处理违法数据考评核查信息

                    //处理案件信息
                    // sgclkp_ck_Man.checkLooking = (ret.data.wfxwmc || '-') + '(' + (ret.data.sgbh || '-') + ')';
                    ret.data.sgfssj = formatDate(ret.data.sgfssj);
                    ret.data.clsj = formatDate(ret.data.clsj);

                    Tools.reduceWordForHead();
                    Tools.reduceWordForJbxx();
                    // //关联警情下拉菜单
                    // var selectOption = [];
                    // ret.data.policeSituation = ret.data.policeSituation ? ret.data.policeSituation : [];
                    // ret.data.policeSituation.forEach(function (value, index, arr) {
                    //     selectOption.push({
                    //         label: value,
                    //         value: value
                    //     });
                    // });
                    // ajglMan.typeOptions = selectOption;
                    // ajglMan.selecting = ret.data.policeSituation[0] ? ret.data.policeSituation[0] : '';
                    // Tools.searchMediaByJqbh();
                }
            } else {

            }
        });
        // 测试数据
        sgclkp_ck_Man.authority.JCKP = true;
        sgclkp_ck_Man.authority.FZKP = true;
        kplb_type = 1;
        policeType = false;


        //kplb==2为超级管理员
        // if (kplb_type == 2) {
        //     sgclkp_ck_Man.jckp_clickClass = "jbxx-btn";
        //     sgclkp_ck_Man.mtxx_clickClass = 'cjxx-btn';
        //     sgclkp_ck_Man.jbxx_clickClass = "cjxx-btn";
        //     sgclkp_ck_Man.fzkp_clickClass = "cjxx-btn";
        //     sgclkp_ck_Man.jckpStatus = true;
        //     sgclkp_ck_Man.fzkpStatus = true;
        //     sgclkp_ck_Man.kpType = 'jckp';
        //     sgclkp_ck_Man.authority.JCKP = true;
        //     sgclkp_ck_Man.authority.FZKP = true;
        //     if (currentList.jckp) {
        //         getEvaInfo("BASIC");
        //     } else {
        //         getPolicesituation();
        //     }
        //     return;
        // }

        //初始情况放在这,统一解决选中警情信息        
        sgclkp_ck_Man.jbxx_clickClass = "cjxx-btn";

        sgclkp_ck_Man.jckp_clickClass = "jbxx-btn";
        sgclkp_ck_Man.jbxx_show = false;
        sgclkp_ck_Man.cjxx_show = -1;
        sgclkp_ck_Man.jckpStatus = true;
        sgclkp_ck_Man.fzkpStatus = false;
        sgclkp_ck_Man.kpType = 'jckp';
        if (currentList.evaStatus) {
            getEvaInfo("BASIC");
            sgclkp_ck_Man.sgclkp_titleShow_kp = '考评结果';
        } else {
            getPolicesituation();
            sgclkp_ck_Man.sgclkp_titleShow_kp = '考评';
        }

        // 无考评权限时选中第一个tab
        if (!sgclkp_ck_Man.authority.SGCLKP_KP) {
            sgclkp_ck_Man.jbxx();
        }

        // if ((sgclkp_ck_Man.authority.JCKP == true)) {
        //     sgclkp_ck_Man.fzkpStatus = false;
        //     switch (kplb_type) {
        //         case 0:
        //             if (currentList.jckp) {
        //                 getEvaInfo("BASIC");
        //             } else if (policeType == true) {
        //                 sgclkp_ck_Man.kpType = 'jckp';
        //                 getPolicesituation();

        //             } else {
        //                 return;
        //             }
        //             //控制底部法制考评是否出现
        //             if ((policeType == true) && (sgclkp_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
        //                 sgclkp_ck_Man.fzkpStatus = true;
        //             }
        //             getSelectedItem("jckp");
        //             break;
        //         case 1:
        //             if (sgclkp_ck_Man.authority.FZKP == true) {
        //                 sgclkp_ck_Man.fzkpStatus = true;
        //                 //法制类领导,基层/法制页面有配权限且基层未考评过=>选中法制考评
        //                 if (currentList.jckp == true && policeType == true) {
        //                     getEvaInfo("BASIC");
        //                     getSelectedItem("jckp");
        //                 } else {
        //                     if (currentList.fzkp) {
        //                         getEvaInfo("LEGAL");
        //                         getSelectedItem("fzkp");
        //                     } else if (policeType == true) {
        //                         getPolicesituation();
        //                         sgclkp_ck_Man.kpType = 'fzkp';
        //                         getSelectedItem("fzkp");
        //                     } else {
        //                         sgclkp_ck_Man.fzkpStatus = false;
        //                     }
        //                 }
        //             } else {
        //                 sgclkp_ck_Man.fzkpStatus = false;
        //             }
        //             break;
        //         default:
        //             //警员类别为其他时,有考评则显示
        //             if (currentList.jckp == true) {
        //                 getEvaInfo("BASIC");
        //                 getSelectedItem("jckp");
        //                 //法制考评有配置,且已考评过，则显示
        //                 if ((sgclkp_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
        //                     sgclkp_ck_Man.fzkpStatus = true;
        //                 }
        //             } else if ((sgclkp_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
        //                 sgclkp_ck_Man.fzkpStatus = true;
        //                 getEvaInfo("LEGAL");
        //                 getSelectedItem("fzkp");
        //             }
        //             break;
        //     }
        // } else if ((sgclkp_ck_Man.authority.JCKP == false) && (sgclkp_ck_Man.authority.FZKP == true)) {
        //     switch (kplb_type) {
        //         case 0:
        //             if (policeType == true && currentList.fzkp == true) {
        //                 getEvaInfo("LEGAL");
        //                 getSelectedItem("fzkp");
        //             }
        //             break;
        //         case 1:
        //             if (currentList.fzkp) {
        //                 getEvaInfo("LEGAL");
        //                 getSelectedItem("fzkp");
        //             } else if (policeType == true) {
        //                 getPolicesituation();
        //                 sgclkp_ck_Man.kpType = 'fzkp';
        //                 getSelectedItem("fzkp");
        //             }
        //             break;
        //         default:
        //             if (currentList.fzkp == true) {
        //                 sgclkp_ck_Man.fzkpStatus = true;
        //                 getEvaInfo("LEGAL");
        //                 getSelectedItem("fzkp");
        //             }
        //             break;
        //     }
        // }

    },
    clickGlmt: function (type) {
        sgclkp_ck_Man.glmt_name.forEach(function (val, key) {
            sgclkp_ck_Man[val + '_clickClass'] = 'glmt_cj';
            sgclkp_ck_Man['glmt_' + val + '_show'] = false;
        });
        sgclkp_ck_Man[type + '_clickClass'] = 'glmt_jj';
        sgclkp_ck_Man['glmt_' + type + '_show'] = true;
        sgclkp_ck_Man.glmt_mark = type;
        Tools.configGlmtNumber();
    },
    configGlmtNumber: function () {
        var type = sgclkp_ck_Man.glmt_mark;
        sgclkp_ck_Man.glmt_total = sgclkp_ck_Man[type + '_data'].length;
    },
    init: function () {

    }
};

//已考评:获取事故处理考评项列表[基层考评跟法制考评复用:传类型进去]
function getEvaInfo(type) {
    ajax({
        url: '/gmvcs/audio/accident/eva/info/' + ajgl_session.getAjbh(),
        // url: '/api/jdkpJYCXKP-hqxxxx-qrpj-hq',
        method: 'get',
        data: null,
        cache: false
    }).then(ret => {
        if (ret.code == 0) {
            let tempEvaList = [];
            sgclkp_ck_Man.noneKP_cont.alreadyEvaLists = [];
            if (!ret.data) {

            } else {
                if (ret.data.comment) {
                    sgclkp_ck_Man.noneKP_cont.comment = ret.data.comment;
                } else {
                    sgclkp_ck_Man.noneKP_cont.comment = "无";
                }

                sgclkp_ck_Man.noneKP_cont.result = (ret.data.passed ? '通过。原因：' : '不通过。原因：') + ret.data.result;
                sgclkp_ck_Man.noneKP_cont.orgName = ret.data.orgName;
                sgclkp_ck_Man.noneKP_cont.userName = ret.data.userName;
                sgclkp_ck_Man.noneKP_cont.userCode = ret.data.userCode;
                sgclkp_ck_Man.noneKP_cont.createTime = formatDate(ret.data.createTime);

                //展示已考评
                sgclkp_ck_Man.cjxx_show = 1;

            }

        } else {
            notification.error({
                message: '服务器后端错误,请联系管理员',
                title: '温馨提示'
            });
        }
    });
}

//修改底部选中信息状态[传参:需要选中的状态]
function getSelectedItem(status) {
    switch (status) {
        case "jckp":
            sgclkp_ck_Man.jckp_clickClass = "jbxx-btn";
            sgclkp_ck_Man.jbxx_clickClass = "cjxx-btn";
            sgclkp_ck_Man.jckpStatus = true;
            sgclkp_ck_Man.jbxx_show = false;
            sgclkp_ck_Man.kpType = 'jckp';
            break;
        case "fzkp":
            sgclkp_ck_Man.jbxx_clickClass = "cjxx-btn";
            sgclkp_ck_Man.fzkp_clickClass = 'jbxx-btn';
            sgclkp_ck_Man.jbxx_show = false;
            sgclkp_ck_Man.fzkpStatus = true;
            sgclkp_ck_Man.kpType = 'fzkp';
            break;
    }
}

//未考评
function getPolicesituation() {
    //获取警情考评项列表
    ajax({
        url: '/gmvcs/audio/eva/items/accidentHandling',
        // url: '/api/casemain',
        method: 'get',
        data: {},
        cache: false
    }).then(ret => {
        if (ret.code == 0) {
            if (ret.data.length != 0) {
                let selectEva = [];
                avalon.each(ret.data, function (index, val) {
                    selectEva.push({
                        name: val.name,
                        code: val.code,
                        check: false
                    });
                });
                sgclkp_ck_Man.cjxxInfo.selectEva = selectEva;
                sgclkp_ck_Man.cjxxInfo.evaLists = ret.data;

            } else {
                notification.warn({
                    message: '考核标准项为空,请联系管理员',
                    title: '温馨提示'
                });
            }
            //展示未考评
            sgclkp_ck_Man.cjxxInfo.commentValue = "";
            sgclkp_ck_Man.cjxx_show = 0;
        }
    });
}

var cookier = (function init() {
    function cookierWorker() {

        //私有方法
        function timeHandler(time) {
            var ex = time.substring(0, time.length - 1);
            var pire = time.substring(time.length - 1);

            switch (pire) {

                case 's':
                    ex *= 1000;
                    break;

                case 'm':
                    ex *= 60 * 1000;
                    break;

                case 'h':
                    ex *= 60 * 60 * 1000;
                    break;

                case 'd':
                    ex *= 24 * 60 * 60 * 1000;
            };
            var timeHanle = new Date();
            var timeSetted = ex;
            timeHanle.setTime(timeHanle.getTime() + timeSetted);
            return ";expires=" + timeHanle.toGMTString();
        };
        this.getTime = function (ex) {
            return timeHandler(ex);
        };
    };
    cookierWorker.prototype.getCookie = function (name) {
        var cookieArray = document.cookie.split(';');
        var cookieAccept = new Array();
        var cookieRegex = new RegExp(name + "=", "g");
        for (var i = 0; i < cookieArray.length; i++) {
            var c;

            if (cookieArray[i].trim) {
                c = cookieArray[i].trim();
            } else {
                c = cookieArray[i].replace(/(^\s*)|(\s*$)/g, "");
            };

            if (cookieRegex.test(c)) {
                cookieAccept.push(c);
            } else {
                continue;
            };
        };

        if (cookieAccept.length == 0) {
            return '';
        } else {
            return cookieAccept[0].spilt('=')[1];
        };
    };
    return new cookierWorker();
})();

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
//自定义事件
function EventTarget() {
    this.handlers = {};
};
EventTarget.prototype = {
    constructor: EventTarget,
    addHandler: function (type, handler) {

        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = [];
        };
        this.handlers[type].push(handler);
    },
    fire: function (event) {

        if (!event.target) {
            event.target = this;
        };

        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[event.type];
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i](event);
            };
        };
    },
    removeHandler: function (type, handler) {

        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[type];
            for (var i = 0, len = handlers.length; i < len; i++) {

                if (handlers[i] === handler) {
                    break;
                }
            };
            handlers.splice(i, 1);
        }
    }
};

//拖放
var DragDrop = function () {
    var dragdrap = new EventTarget(),
        dragging = null,
        diffX = 0,
        diffY = 0;

    function handleEvent(event) {

        event = event || window.event;
        var target = event.target || event.srcElement,
            targetParent = target.offsetParent;

        if (targetParent == null) {
            return;
        }

        switch (event.type) {
            case 'mousedown':

                if (targetParent.className && targetParent.className.indexOf('draggable') > -1) {
                    dragging = targetParent;
                    diffX = event.clientX - targetParent.offsetLeft;
                    diffY = event.clientY - targetParent.offsetTop;
                    dragdrap.fire({
                        type: 'dragstart',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    return;
                }
                break;

            case 'mousemove':

                if (dragging !== null) {
                    dragging.style.left = (event.clientX - diffX) + 'px';
                    dragging.style.top = (event.clientY - diffY) + 'px';
                    dragdrap.fire({
                        type: 'drag',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    return;
                }
                break;

            case 'mouseup':

                if (dragging !== null) {
                    dragdrap.fire({
                        type: 'dragend',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                    dragging = null;
                } else {
                    return;
                }
                break;
        };
    };
    dragdrap.enable = function () {
        $(document).mousedown(handleEvent);
        $(document).mousemove(handleEvent);
        $(document).mouseup(handleEvent);
    };
    dragdrap.disable = function () {
        $(document).unbind('mousedown');
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
    };
    return dragdrap;
}();
DragDrop.addHandler('dragstart', function (event) {

});
DragDrop.addHandler('drag', function (event) {

});
DragDrop.addHandler('dragend', function (event) {

});
DragDrop.enable();
let filePlayer = (function () {
    var States = {
        'picture': function (ret, dia) {
            if (ret.code == 0) {
                delete_ocx();
                dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');
                var _self = this.playing;
                _self['ocxPlayer' + dia] = false;
                $('.player' + dia + '.ane-loading-mask').text('图片加载中...');
                this.playing.loading = true;
                if (dia == '_dia') {
                    $('.ane-loading-mask').css('height', '484px');
                }
                _self.imgff = false;
                setTimeout(() => {
                    this.playing.src = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
                    _self.imgff = true;
                    $('.outDateMedia' + dia).css('display', 'none');
                    _self.loading = false;
                }, 10);
            } else {
                Tools.sayError('请求图片数据失败');
            }

            return;
        },
        'video': function (ret, dia) {
            delete_ocx();
            this.playing.loading = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                this.playing.imgff = false;
                $('.outDateMedia' + dia).css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;
                this.playing.media_type = false;
                this.playing.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Tools.sayError('视频地址无效，无法播放');
                    return;
                }
                setTimeout(() => {
                    this.playing.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    // this.playing.video_url = 'http://10.10.17.93/mp4_test3.mp4';
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300);

            } else {
                Tools.sayError('请求视频数据失败');
            }
        },
        'audio': function (ret, dia) {
            delete_ocx();
            this.playing.loading = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                this.playing.imgff = false;
                $('.outDateMedia' + dia).css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;

                this.playing.media_type = true;
                this.playing.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Tools.sayError('语音地址无效，无法播放');
                    return;
                }
                setTimeout(() => {
                    this.playing.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    // this.playing.video_url = 'http://10.10.17.93/audio_test3.wav';
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300);

            } else {
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
            States.playing = dia == '_dia' ? tjgl_form : sgclkp_ck_Man;
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

//时间戳转日期
function formatDate(date, day) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    if (day) {
        return year + "-" + month + "-" + date + "";
    } else {
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    }
}
avalon.filters.formatDate = function (str) {

    if (str == '' || str == null) {
        return '-';
    } else {
        return formatDate(str);
    }
};
avalon.filters.checkNull = function (str) {

    if (str === '' || str === null) {
        return '-';
    } else {
        return str;
    }
};

function changeWfType(i) {
    switch (i) {
        case 'VIOLATION':
            return '简易程序';
            break;
        case 'SURVEIL':
            return '非现场处罚';
            break;
        case 'FORCE':
            return '强制措施';
            break;
        default:
            return '事故处理';
    }
}
