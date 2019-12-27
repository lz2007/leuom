import {
    createForm
} from 'ane';
import {
    notification
} from 'ane';
import ajax from '/services/ajaxService';
import * as menuServer from '/services/menuService';
import 'bootstrap';
import moment from 'moment';

let storage = require('/services/storageService.js').ret;
import {
    copyRight,
    telephone
} from '/services/configService';

require('./zfsypsjglpt-jdkp-fxccf_jiaojing.css');
export const name = 'zfsypsjglpt-jdkp-fxccf_jiaojing';

let policeType = storage.getItem("policeType"); //获取版本
let local_storage = {
    "ccNumBtn": true,
    "search_num": 20,
    "pageSize_table": {},
    "table_list": [],
    "page": ""

};

let fxccfMan = null;
let fxccf_Man = null;
let fxccf_last = null;
let tempUnselected = [];
let ajgl_session = (function () {
    let userCode = '';
    return {
        getuserCode: function () {
            if (storage && storage.getItem) {
                userCode = storage.getItem('userCode_ajgl_kp');
            } else {
                userCode = cookier.getCookie('userCode_ajgl_kp');
            };
            return userCode;
        }
    };
})();
let currentList = {
    jckp: false,
    fzkp: false
};
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-fxccf_jiaojing.html'),
    defaults: {
        // zfsypsjglpt_language: getLan(), //英文翻译
        // 版权信息
        copyRight: copyRight,
        telephone: telephone,
        //领导版本or警员版本 true领导 false警员
        verson_JDKP_AJKP: policeType,
        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () {

            },
            record: ajgl_initialData()
        }),
        fxccf_search() {
            window.checkChildren = true;
            if (/[^\d]/g.test(this.search_num)) {
                this.search_num = this.search_num.replace(/[^\d]/g, '');//限制数字
            }
            table.fetch(true, false, true);
        },

        //input
        ajgl_close_userCode: false,
        ajgl_close_hphm: false,
        ajgl_close_wfdz: false,
        ajgl_close_jdsbh: false,
        ajgl_close_wfbh: false,

        //抽查按钮
        ccNumBtn: true,
        search_num: 20,
        onClickCCBtn(e) {
            if (e.target.checked) {
                this.ccNumBtn = false;
                fxccfMan.notEvaStatus = false; //考评状态
                fxccfMan.notReviewStatus = false; //核查状态
            } else {
                this.ccNumBtn = true;
                fxccfMan.notEvaStatus = true;
                fxccfMan.notReviewStatus = true;
                this.search_num = 20;
            }
        },
        close_click(e) {
            switch (e) {
                case 'userCode':
                    $('.top-form').find($("[name = 'userCode']")).val('');
                    $('.top-form').find($("[name = 'userCode']")).focus();
                    fxccfMan.$searchForm.record.userCode = '';
                    break;
                case 'hphm':
                    $('.top-form').find($("[name = 'hphm']")).val('');
                    $('.top-form').find($("[name = 'hphm']")).focus();
                    fxccfMan.$searchForm.record.hphm = '';
                    break;
                case 'wfdz':
                    $('.top-form').find($("[name = 'wfdz']")).val('');
                    $('.top-form').find($("[name = 'wfdz']")).focus();
                    fxccfMan.$searchForm.record.wfdz = '';
                    break;
                case 'jdsbh':
                    $('.top-form').find($("[name = 'jdsbh']")).val('');
                    $('.top-form').find($("[name = 'jdsbh']")).focus();
                    fxccfMan.$searchForm.record.jdsbh = '';
                    break;
                case 'wfbh':
                    $('.top-form').find($("[name = 'wfbh']")).val('');
                    $('.top-form').find($("[name = 'wfbh']")).focus();
                    fxccfMan.$searchForm.record.wfbh = '';
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'userCode':
                    this.ajgl_close_userCode = true;
                    break;
                case 'hphm':
                    this.ajgl_close_hphm = true;
                    break;
                case 'wfdz':
                    this.ajgl_close_wfdz = true;
                    break;
                case 'jdsbh':
                    this.ajgl_close_jdsbh = true;
                    break;
                case 'wfbh':
                    this.ajgl_close_wfbh = true;
                    break;
            }
        },
        input_blur(e, name) {
            //修复查询输入框复制黏贴bug
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            switch (name) {
                case 'userCode':
                    this.ajgl_close_userCode = false;
                    break;
                case 'hphm':
                    this.ajgl_close_hphm = false;
                    break;
                case 'wfdz':
                    this.ajgl_close_wfdz = false;
                    break;
                case 'jdsbh':
                    this.ajgl_close_jdsbh = false;
                    break;
                case 'wfbh':
                    this.ajgl_close_wfbh = false;
                    break;
            }
        },


        //受警单位
        searchForm_sjdw: avalon.define({
            $id: 'searchForm_sjdw_ajkp',
            rdata: [],
            sjdw: [],
            checkedKeys: [],
            expandedKeys: [],
            selectedTitle: '',
            checkType: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                fxccfMan.$searchForm.record.sjdw = treeNode.key;
                fxccfMan.$searchForm.record.checkType = treeNode.checkType;
                this.checkedKeys = treeNode.orgName;
                this.selectedTitle = treeNode.orgName;
                this.checkType = treeNode.checkType;
            }
        }),


        enter_click(e) {
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            if (e.keyCode == "13") {
                if (/[^\d]/g.test(this.search_num)) {
                    this.search_num = this.search_num.replace(/[^\d]/g, '');//限制数字
                }
                table.fetch(true);
            }
        },
        year: new Date().getFullYear(),
        //报警时间
        dateShow: false,
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        searchForm_wfsj: avalon.define({
            $id: 'fxccf_searchForm_wfsj',
            wfsj: ['last-week'],
            searchForm_wfsj_Change(e, a) {

                //以下是按照原项目计算方法 -- 时间的问题尚不够完善待修改
                Tools.timeCalculator.calculate(e.target.value);
            }
        }),
        topform_start_time: '',
        topform_end_time: '',
        endDate: moment().format('YYYY-MM-DD'),
        startTimeHandleChange(e) {

            if (e.target.value) {
                fxccfMan.kssj_isNull = 'none';
                fxccfMan.$searchForm.record.wfsjStart = Number(getTimeByDateStr(e.target.value + ' 00:00:00'));
            } else {
                fxccfMan.kssj_isNull = 'block';
                fxccfMan.$searchForm.record.wfsjStart = '';
            }
        },
        endTimeHandleChange(e) {
            if (e.target.value) {
                fxccfMan.jssj_isNull = 'none';
                fxccfMan.$searchForm.record.wfsjEnd = Number(getTimeByDateStr(e.target.value + ' 23:59:59'));
            } else {
                fxccfMan.jssj_isNull = 'block';
                fxccfMan.$searchForm.record.wfsjEnd = '';
            }
        },
        //关联媒体
        searchForm_glmt: avalon.define({
            $id: 'searchForm_fxccf_glmt',
            glmt: ['ALL'], //默认查询已关联数据
            searchForm_gllb_Change(e, a) {
                fxccfMan.$searchForm.record.glmt = e.target.value;
            }
        }),
        //考评状态
        searchForm_kpzt: avalon.define({
            $id: 'searchForm_fxccf_kpzt',
            evaStatus: ["ALL"],
            searchForm_kpzt_Change(e) {
                fxccfMan.$searchForm.record.evaStatus = e.target.value;
                if (e.target.value == 0) {
                    fxccf_Man.notEvaStatus = false;
                    fxccfMan.$searchForm.record.evaResult = "ALL"; //考评结果 改为 不限
                } else {
                    fxccf_Man.notEvaStatus = true;
                }
            }
        }),
        notEvaStatus: true, //判断为 ‘未考评’ 时候禁止选择考评结果
        //考评结果
        searchForm_kpjg: avalon.define({
            $id: 'searchForm_fxccf_kpjg',
            evaResult: ["ALL"],
            searchForm_kpjg_Change(e) {
                fxccfMan.$searchForm.record.evaResult = e.target.value;
            }
        }),
        //核查状态
        searchForm_hczt: avalon.define({
            $id: 'searchForm_fxccf_hczt',
            reviewStatus: ["ALL"],
            searchForm_hczt_Change(e) {
                fxccfMan.$searchForm.record.reviewStatus = e.target.value;
                if (e.target.value == 0) {
                    fxccf_Man.notReviewStatus = false;
                    fxccfMan.$searchForm.record.reviewResult = "ALL"; //核查结果 改为 不限
                } else {
                    fxccf_Man.notReviewStatus = true;
                }
            }
        }),
        notReviewStatus: true, //判断为 ‘未核查’ 时候禁止选择核查结果
        //核查结果
        searchForm_hcjg: avalon.define({
            $id: 'searchForm_fxccf_khjg',
            reviewResult: ["ALL"],
            searchForm_hcjg_Change(e) {
                fxccfMan.$searchForm.record.reviewResult = e.target.value;
            }
        }),

        //      ajgl_check: avalon.define({
        //          $id: "ajkp_check",
        //          authority: {  // 按钮权限标识
        //              // "CHECK_TJGL": false,  //音视频库_执法档案_案件关联_查看_添加关联
        //              // "CHECK_SCGL": false,  //音视频库_执法档案_案件关联_查看_删除关联
        //              "CHECK": true,  //音视频库_执法档案_案件关联_查看
        //              "SEARCH": true,  //音视频库_执法档案_案件关联_查询
        //              "OPT_SHOW": true  //操作栏显示方式
        //          }
        //      }),
        jqbh: '',
        userCode: '',
        hphm: '',
        jdsbh: '',
        wfdz: '',
        wfbh: '',
        toggleShow: true,
        toggleShowCk: false,

        //ck part
        //点击返回按钮
        ajgl_back(e) {
            $('.popover').hide();
            Tools.clearPlayer('');
            this.cjxxInfo.infomation = {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            };
            //解决考评未完成切换页面再进入，数据未及时更新的Bug
            fxccf_Man.cjxxInfo.evaLists = [];
            let temp = document.getElementById("commentBox");
            if (temp) {
                temp.style.color = "#536b82";
            }
            fxccf_Man.mtxx_clickClass = 'cjxx-btn';
            fxccf_Man.jckpStatus = false;
            fxccf_Man.fzkpStatus = false;
            this.toggleShow = true;
            this.toggleShowCk = false;
            table.fetch(true);
        },

        //页面标题 -- 正在看
        checkLooking: '',

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
            wfsj: '',
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
            var type = fxccf_Man.glmt_mark;
            var aim = null;
            fxccf_Man[type + '_data'].forEach(function (val, key) {

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
            fxccf_Man[type + '_data'].forEach(function (val, key) {

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

        imgff: false,

        //点击媒体文件名
        playFile(e) {
            var rid = e.currentTarget.children[0].children[1].attributes.name.nodeValue;
            var type = e.currentTarget.children[0].children[1].attributes.type.nodeValue;
            var mark = fxccf_Man.glmt_mark;

            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            fxccfMan.playingFile = rid;
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
                    ret.data.importTime = formatDate(ret.data.importTime);
                    ret.data.startTime = formatDate(ret.data.startTime);
                    ret.data.keyFile = ret.data.keyFile == true ? '是' : '否';

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
                        fxccf_Man.imgff = false;
                        fxccf_Man.ocxPlayer = false;
                        $('.finishDelete').css('display', 'none');
                        $('.outDateMedia').css('display', 'block');
                    } else {
                        filePlayer.play(type, rid, '');
                    }
                    this.cjxxInfo.infomation = ret.data;
                    Tools.reduceWordForCjxx();
                } else {
                    Tools.sayError('获取详细媒体信息失败');
                }
            });

        },

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
            $id: 'ajkp_jbxx_info',
            infomation: {} //基本信息的数据
        }),

        //查看 -- 处警信息
        cjxx(kpType) {
            this.jbxx_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.kpType = kpType;
            this.cjxx_show = -1;
            fxccf_Man.cjxxInfo.selectEva = [];
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
                if (currentList.jckp) {
                    getEvaInfo("BASIC");
                } else {
                    getPolicesituation();
                }
            } else {
                //点击法制考评
                if (currentList.fzkp) {
                    getEvaInfo("LEGAL");
                } else {
                    getPolicesituation();
                }
            }

        },
        noneKP_cont: avalon.define({
            $id: 'ajkp_noneKP_cont_jdkp',
            alreadyEvaLists: [],
            alreadyComments: '',
            noneEvaList: false
        }),
        cjxxInfo: avalon.define({
            $id: 'ajkp_cjxx_info_jdkp',
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            }, //处警信息的数据
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
            handleChange(e) {
                let _this = this;
                let tempArr = e.target.value.split('-');
                let tempArrCode = tempArr[0];
                let tempArrName = tempArr[1];
                let tempArrChecked = (tempArr[2] == "Y") ? true : false;
                let tempIndex = findElem(_this.selectEva, 'code', tempArrCode);
                _this.selectEva[tempIndex].check = tempArrChecked;
                let tempId = document.getElementById(tempArrCode);
                tempId.style.color = "#536b82";
            },
            //完成评语
            submitComment() {

                // var childFrameObj = document.getElementById('gm_ajkp_webplayer');
                // childFrameObj.contentWindow.hide_player();
                // childFrameObj = null;
                //判断考评是否完成,若已完成,则弹出确认框,否则标红未进行考评的选项
                let _this = this;
                tempUnselected = [];
                let tempSelectEva = _this.selectEva;
                if (fxccf_Man.cjxxInfo.commentValue.length > 500) {
                    notification.warn({
                        message: '评语最多输入500个字',
                        title: '温馨提示'
                    });
                    return;
                }
                if (fxccf_Man.cjxxInfo.selectEva.length == 0) {
                    notification.warn({
                        message: '考核标准项为空,不允许提交考评,请联系管理员!',
                        title: '提示'
                    });
                    return;
                }
                for (var i = 0; i < tempSelectEva.length; i++) {
                    if (tempSelectEva[i].check == "none") {
                        tempUnselected.push({
                            code: tempSelectEva[i].code,
                            name: tempSelectEva[i].name
                        });
                    }
                };
                if (tempUnselected.length == 0 && fxccf_Man.cjxxInfo.commentValue != "") {
                    confirmCont.confirmShow = true;
                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                } else {
                    unFinishBox_cont.unFinishShow = true;
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

            }
        }),

        //点击详细内容
        show_info: false,
        cancelInfo() {
            this.show_info = false;

            // var childFrameObj = document.getElementById('gm_ajkp_webplayer');
            // childFrameObj.contentWindow.show_player();
            // childFrameObj = null;
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
            // var childFrameObj = document.getElementById('gm_ajkp_webplayer');
            // childFrameObj.contentWindow.hide_player();
            // childFrameObj = null;  
            this.show_info = true;


            this.show_info = true;
            Tools.addShowInfo('showInfo');
            Tools.reduceWordForAllInfo();

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

        //警员类型,结合权限控制底部按钮的显示隐藏
        jckpStatus: false,
        fzkpStatus: false,

        authority: { // 按钮权限标识
            "SEARCH": false, //监督考评-警情考评-查询按钮
            "JCKP": false, //监督考评-警情考评-查看-基层考评
            "FZKP": false //监督考评-警情考评-查看-法制考评
        },

        //警员版本功能  是否考评 policeFZKP法制考评 policeJCKP基层考评
        policeFZKP: false,
        policeJCKP: false,

        onInit(event) {
            $('.popover').hide();
            fxccfMan = this;
            fxccf_Man = this;
            tableObjectAJKP = $.tableIndex({ //初始化表格jq插件
                id: 'fxccf_table',
                tableBody: tableBodyAJKP
            });

            Tools.clearForm(); //在模块切换时重置所有的查询表单字段
            var fxccf_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-jdkp-fxccf')) {
                    fxccf_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-fxccf'));
                }
            } else {

            };

            if (fxccf_form_data) {

                //分页
                table.pagination.current = fxccf_form_data.page;
                // this.$searchForm.record.jqbh = this.jqbh = fxccf_form_data.jqbh;
                this.$searchForm.record.userCode = this.userCode = fxccf_form_data.userCode;
                this.$searchForm.record.hphm = this.hphm = fxccf_form_data.hphm;
                this.$searchForm.record.jdsbh = this.jdsbh = fxccf_form_data.jdsbh;
                this.$searchForm.record.wfdz = this.wfdz = fxccf_form_data.wfdz;
                this.$searchForm.record.glmt = fxccf_form_data.glmt;
                this.$searchForm.record.wfbh = this.wfbh = fxccf_form_data.wfbh;

                //下拉选择框
                this.searchForm_hcjg.reviewResult = [fxccf_form_data.reviewResult];
                this.$searchForm.record.reviewResult = fxccf_form_data.reviewResult;
                this.searchForm_hczt.reviewStatus = [fxccf_form_data.reviewStatus];
                this.$searchForm.record.reviewStatus = fxccf_form_data.reviewStatus;
                this.searchForm_kpzt.evaStatus = [fxccf_form_data.evaStatus];
                this.$searchForm.record.evaStatus = fxccf_form_data.evaStatus;
                this.searchForm_kpjg.evaResult = [fxccf_form_data.evaResult];
                this.$searchForm.record.evaResult = fxccf_form_data.evaResult;

                this.searchForm_glmt.glmt = [fxccf_form_data.glmt];
                this.$searchForm.record.wfsjStart = fxccf_form_data.wfsjStart;
                this.$searchForm.record.wfsjEnd = fxccf_form_data.wfsjEnd;
                this.$searchForm.record.orgCode = fxccf_form_data.orgCode;
                Tools.timeCalculator.setStatus(fxccf_form_data.timeStatus);

                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var d = new Date(year, month, 0);

                if (fxccf_form_data.timeStatus == 'last-week') {
                    this.searchForm_wfsj.wfsj = ['last-week'];
                    fxccfMan.$searchForm.record.timeStatus = 'last-week';
                } else if (fxccf_form_data.timeStatus == 'last-month') {
                    this.searchForm_wfsj.wfsj = ['last-month'];
                    fxccfMan.$searchForm.record.timeStatus = 'last-month';
                } else {
                    this.searchForm_wfsj.wfsj = ['last-past-of-time'];
                    fxccfMan.$searchForm.record.timeStatus = 'last-past-of-time';
                    this.dateShow = true;
                    this.topform_start_time = formatDate(fxccf_form_data.wfsjStart, true);
                    this.topform_end_time = formatDate(fxccf_form_data.wfsjEnd, true);
                }

                yspk_tree.curTree = yspk_tree.tree_key = fxccf_form_data.orgPath;
                yspk_tree.tree_title = fxccf_form_data.orgName;
                yspk_tree.tree_code = fxccf_form_data.orgPath;
            }

            // 查看、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP_JTWFKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    $('.fxccf-container-kp .ajkp-tabCont').css('top', '50px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_JTWFKP_FXCCF_SEARCH":
                            fxccfMan.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == fxccfMan.authority.SEARCH)
                    $('.fxccf-container-kp .ajkp-tabCont').css('top', '50px');

            });
            local_storage = storage.getItem('zfsypsjglpt-jdkp-fxccfkp-cc');
            if (local_storage) {
                if (!local_storage.ccNumBtn) { //选中抽查
                    //恢复抽查页面
                    fxccfMan.ccNumBtn = local_storage.ccNumBtn;
                    fxccfMan.search_num = local_storage.search_num;
                    fxccfMan.notEvaStatus = false; //考评状态
                    fxccfMan.notReviewStatus = false; //核查状态

                    table.pagination.current = local_storage.page + 1; //恢复 当前页
                    tableObjectAJKP.page(local_storage.page + 1, local_storage.pageSize_table); //恢复当前分页
                    tableObjectAJKP.tableDataFnc(local_storage.table_list); //恢复当前表格
                    tableObjectAJKP.loading(false);
                    return;
                }
            }
        },
        onReady() {
            if (!local_storage) { //选中抽查，则不重新查询
                Tools.getDept();
            }
        },
        pose() {
            table.remoteList = [];

            tableObjectAJKP.destroy();
        }
    }
});

/*********查询所得的表格**********/
let table = avalon.define({
    $id: 'jdkp-fxccf-table',
    remoteList: [],
    loading: false,
    version_AJKP: true, //领导版本or警员版本
    $cache: {}, //数据缓存对象，缓存着每次请求的当页数据
    $selectOption: [], //勾选表格行保存该行的数据
    pagination: {
        pageSize: 20,
        total: 0,
        current: 0,
        overLimit: false
    },
    flag: 0,
    // page_type: false, //fasle 显示总条数; true 显示大于多少条
    getCurrent(current) {
        this.pagination.current = current;
    },
    actions(type, text, record, index) {

        if (type == 'checkLook') {

            if (record.evaStatus == '已考评') {
                window.kpcczl_fxccf = record.xh;
                avalon.history.setHash('/zfsypsjglpt-jdkp-fxccf-ykp_jiaojing');
                window.if_kpcczl_hc = false;
                return;
            }
            //存储当前点击数据的考评状态[基层/法制考评, 还有警情编号]
            let current_ajkpData = {
                "xh": record.xh,
                "wfbh": record.wfbh,
                "evaStatus": (record.evaStatus == "已考评") ? true : false, //考评
                "reviewStatus": (record.reviewStatus == "已考评") ? true : false //核查
            };
            storage.setItem("zfsypsjglpt-jdkp-fxccf-current-fxccfData", current_ajkpData);
            avalon.history.setHash('/zfsypsjglpt-jdkp-fxccf-wkp_jiaojing');
        }

    },
    handleSelect(record, selected, selectedRows) {

    },
    selectChange(selectedRowKeys, selectedRows) {
        this.$selectOption = [selectedRows]
    },
    handleSelectAll(selectedRowKeys, selectedRows) {
        console.log(selectedRowKeys);
    },
    fetch(search, initMark, del) {
        tableObjectAJKP.loading(true);
        if (!search) {
            var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1;

            if (this.$cache[page]) {

                //恢复该页状态，显示该页内容
                this.remoteList = this.$cache[page];
                tableObjectAJKP.tableDataFnc(this.remoteList);
                tableObjectAJKP.loading(false);
            } else {

                //如果缓存中不存在再请求
                this.ajax_table();
            }
        } else {
            this.pagination = {
                pageSize: 20,
                total: 0,
                current: 0,
                overLimit: false
            };
            this.$cache = [];
            //          this.loading = false;
            this.remoteList = [];
            this.flag = 1;
            this.ajax_table(initMark, del);
        }
    },
    ajax_table(initMark) {
        //  	tableObjectAJKP.loading(true);

        var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1,
            seachParams = fxccfMan.$searchForm.record;
        seachParams.timeStatus = Tools.timeCalculator.getStatus();
        seachParams.userCode = $.trim(seachParams.userCode);

        seachParams.jdsbh = $.trim(seachParams.jdsbh);
        seachParams.wfdz = $.trim(seachParams.wfdz);
        seachParams.orgPath = yspk_tree.tree_code;
        if (!seachParams.orgPath) { //切换太快时获取不到 ，不能传空
            return;
        }


        //添加默认时间为一周
        if (fxccfMan.dateShow) {

            if (seachParams.wfsjStart == '' || seachParams.wfsjEnd == '') {

                if (seachParams.wfsjStart == '') {
                    fxccfMan.kssj_isNull = 'block';
                } else {
                    fxccfMan.kssj_isNull = 'none';
                }
                if (seachParams.wfsjEnd == '') {
                    fxccfMan.jssj_isNull = 'block';
                } else {
                    fxccfMan.jssj_isNull = 'none';
                }
                //              this.loading = false;
                return;
            } else {

                if (seachParams.wfsjStart > seachParams.wfsjEnd) {
                    Tools.sayWarn('开始时间不能超过结束时间');
                    //                  this.loading = false;
                    return;
                }

                if (seachParams.wfsjEnd - seachParams.wfsjStart > 365 * 86400000) {
                    Tools.sayWarn('时间间隔不能超过一年，请重新设置！');
                    //                  this.loading = false;
                    return;
                }
            }
        } else {

            if (seachParams.wfsjStart == '' && seachParams.wfsjEnd == '') {
                var now = new Date();
                var oneDayTime = 24 * 60 * 60 * 1000;

                //显示周一
                var MondayTime = +Tools.getFirstDayOfWeek(now);
                //显示周日
                var SundayTime = MondayTime + 6 * oneDayTime;

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);

                sunday.setHours(23);
                sunday.setMinutes(59);
                sunday.setSeconds(59);
                fxccfMan.$searchForm.record.wfsjEnd = Number(+sunday);

                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                fxccfMan.$searchForm.record.wfsjStart = Number(+monday);
            }
        };
        //解决页面切换保留表格数据bug
        var fxccf_form_data = null;
        if (storage && storage.getItem) {
            if (storage.getItem('zfsypsjglpt-jdkp-fxccf')) {
                fxccf_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-fxccf'));
            }
        } else {

        };

        if (fxccf_form_data == null) {

        } else {
            fxccf_last = fxccf_form_data;

            if (initMark) {
                seachParams = fxccf_form_data;
                page = fxccf_form_data.page;
                table.pagination.current = page + 1;
            }
        };

        if (Tools.timeCalculator.getStatus() != 'last-past-of-time') {
            Tools.timeCalculator.calculate(Tools.timeCalculator.getStatus());
        }
        seachParams.page = page;
        seachParams.pageSize = this.pagination.pageSize;
        seachParams.includeChild = window.checkChildren === undefined ? true : window.checkChildren;
        // seachParams.glmt = '1';//屏蔽 关联媒体
        let ajax_data_g = {
            "page": seachParams.page,
            "pageSize": seachParams.pageSize,
            "orgPath": seachParams.orgPath,
            "wfsjStart": seachParams.wfsjStart,
            "wfsjEnd": seachParams.wfsjEnd,
            "glmt": seachParams.glmt,
            "checkNum": fxccfMan.search_num
        };

        let ajaxURL = '/gmvcs/audio/surveil/search/eva';
        if (!fxccfMan.ccNumBtn) { //如果勾选抽查 ，则调用抽查接口
            ajaxURL = '/gmvcs/audio/surveil/search/randomEva';
            seachParams = ajax_data_g;
        }
        ajax({
            url: ajaxURL,
            // url: '/api/jdkpFXCCF.json',
            method: 'post',
            data: seachParams,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (storage && storage.setItem) {
                    fxccfMan.$searchForm.record.page = page;
                    fxccfMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    fxccfMan.$searchForm.record.orgPath = yspk_tree.tree_code;
                    fxccfMan.$searchForm.record.orgName = yspk_tree.tree_title;
                    fxccfMan.$searchForm.record.orgId = yspk_tree.tree_key;
                    storage.setItem('zfsypsjglpt-jdkp-fxccf', JSON.stringify(fxccfMan.$searchForm.record), 0.5);
                } else {

                };

                if (!ret.data.currentElements) {
                    Tools.dealTableWithoutData();
                }

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    tableObjectAJKP.loading(false);
                    Tools.dealTableWithoutData();
                } else {
                    window.igdd = false;
                    ret.data.currentElements.forEach(function (val, key) {

                        if (val.relation) {
                            val.sfgl = '是';
                        } else {
                            val.sfgl = '否';
                        };
                        val.space = '';
                        //字段对接测试
                        val.xh = val.xh ? val.xh : '-';
                        val.wfbh = val.wfbh ? val.wfbh : '-';
                        val.orgCode = val.orgCode ? val.orgCode : '-';
                        val.orgName = val.orgName ? val.orgName : '-';
                        val.jtwfkpJYJH = val.userName ? val.userName + '(' + val.userCode + ')' : '-';
                        val.userCode = val.userCode ? val.userCode : '-';
                        val.userName = val.userName ? val.userName : '-';
                        val.idCard = val.idCard ? val.idCard : '-';
                        val.jdsbh = val.jdsbh ? val.jdsbh : '-';
                        val.wfsj = formatDate(val.wfsj);
                        val.hpzl = val.hpzl ? val.hpzl : '-';
                        val.hphm = val.hphm ? val.hphm : '-';
                        val.hpzlmc = val.hpzlmc ? val.hpzlmc : '-';
                        val.wfdz = val.wfdz ? val.wfdz : '-';
                        val.wfxw = val.wfxw ? val.wfxw : '-';

                        val.relation = val.relation ? '已关联' : '未关联';
                        val.evaStatus = val.evaStatus ? '已考评' : '未考评';
                        val.reviewStatus = val.reviewStatus ? '已核查' : '未核查';

                        if (val.evaResult == '0') {
                            val.evaResult = '不通过';
                        } else if (val.evaResult == '1') {
                            val.evaResult = '通过';
                        } else {
                            val.evaResult = '-';
                        }

                        if (val.reviewResult == '0') {
                            val.reviewResult = '不属实';
                        } else if (val.reviewResult == '1') {
                            val.reviewResult = '属实';
                        } else {
                            val.reviewResult = '-';
                        }

                        // val.involvedPeoples.forEach(function (val, key) {

                        //     if (key == 0) {
                        //         jdsbh += val.rymc;
                        //     } else {
                        //         jdsbh += (',' + val.rymc);
                        //     }
                        // });
                        // val.jdsbh = jdsbh;
                    });

                    if (this.flag == 1) {
                        this.pagination.current = 1;
                    }
                    this.flag = 0;
                    this.pagination.overLimit = ret.data.overLimit;
                    this.pagination.total = this.pagination.overLimit ? ret.data.limit * 20 : ret.data.totalElements;
                    // this.pagination.total = ret.data.totalElements;
                    this.pagination.current = page + 1;
                    ret.data.currentElements.forEach(function (val, key) {
                        val.index = key + (table.pagination.current - 1) * table.pagination.pageSize + 1; //手动增加表格行号
                    });
                    this.$cache[page] = this.remoteList = ret.data.currentElements;
                    let pageSize_table = table.pagination.pageSize;
                    tableObjectAJKP.page(page + 1, pageSize_table);
                    tableObjectAJKP.tableDataFnc(this.remoteList);
                    tableObjectAJKP.loading(false);
                    // 保存抽查数据
                    if (!fxccfMan.ccNumBtn) {
                        let local_storage = {};
                        local_storage.table_list = this.remoteList;
                        local_storage.page = page;
                        local_storage.pageSize_table = pageSize_table;
                        local_storage.ccNumBtn = fxccfMan.ccNumBtn;
                        local_storage.search_num = fxccfMan.search_num
                        storage.setItem('zfsypsjglpt-jdkp-fxccfkp-cc', local_storage);
                    } else {
                        storage.setItem('zfsypsjglpt-jdkp-fxccfkp-cc', '');
                    }

                }
            } else {
                Tools.sayError('请求数据失败');
                //              this.loading = false;
                tableObjectAJKP.loading(false);
            }
        });
    },
    handleTableChange(pagination) {

        if (this.pagination.hasOwnProperty('current')) {
            this.pagination.current = pagination;
            tableObjectAJKP.page(pagination, this.pagination.pageSize);
            this.fetch();
        }
        //      this.fetch();
    },
    nextPage(e, pagination) {

        if (this.current == 1) {
            $('#jqtbnextPage').attr("disabled", "disabled");
        } else {
            $('#jqtbnextPage').attr("disabled", false);
            ++this.current;
            this.fetch();
        }
    },
    lastPage(e, pagination) {

        if (this.current == this.pagination.total) {
            $('#jqtbnextPage').attr("disabled", "disabled");
        } else {
            $('#jqtbnextPage').attr("disabled", false);
            --this.current;
            this.fetch();
        }
    },
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
        var id = fxccfMan.selecting;

        if (id == '') {
            fxccfMan.gljq_info = {
                wfsj: '',
                jqlbmc: '',
                bjnr: ''
            };
            info_body.allInfomation = {
                jqbh: '',
                wfsj: '',
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
            fxccf_Man.cj_data = [];
            fxccf_Man.jq_nodata = !Boolean(fxccf_Man.jq_data.length);
            fxccf_Man.cj_nodata = !Boolean(fxccf_Man.cj_data.length);
            this.configGlmtNumber(); //关联媒体总数和选中个数

            return;
        }
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + id,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {
                    Tools.saySuccess('该警情无相关数据');
                    fxccfMan.gljq_info = {
                        wfsj: '',
                        jqlbmc: '',
                        bjnr: ''
                    };
                    info_body.allInfomation = {
                        jqbh: '',
                        wfsj: '',
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
                    fxccf_Man.cj_data = [];
                    fxccf_Man.jq_nodata = !Boolean(fxccf_Man.jq_data.length);
                    fxccf_Man.cj_nodata = !Boolean(fxccf_Man.cj_data.length);
                    this.configGlmtNumber(); //关联媒体总数和选中个数

                    return;
                }

                //处理关联警情字段
                ret.data.jlly = ret.data.jlly == '01' ? '后台系统同步' : '管理系统人工录入';
                fxccfMan.gljq_info = ret.data;
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
                        val.keyFile = val.keyFile == true ? '是' : '否';
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
                // fxccf_Man.jq_data = ret.data.handelerBaseFiles;
                fxccf_Man.cj_data = ret.data.handelerBaseFiles;
                fxccf_Man.jq_nodata = !Boolean(fxccf_Man.jq_data.length);
                fxccf_Man.cj_nodata = !Boolean(fxccf_Man.cj_data.length);
                this.configGlmtNumber(); //关联媒体总数和选中个数

            }
        });
    },
    clearForm: function () {
        table.$selectOption = [];
        fxccfMan.$searchForm.record = ajgl_initialData();
    },
    clearPlayer: function (type) {
        var playing = type == '_dia' ? tjgl_form : fxccf_Man;

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
    getDept() {
        let slqktj_deptemp = [];
        ajax({
            // url: '/api/dep_tree',
            // url: '/gmvcs/uap/org/all',
            url: '/gmvcs/uap/org/find/fakeroot/mgr',
            method: 'get',
            data: {},
            cache: false
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: '获取部门树失败，请稍后再试',
                    title: '通知'
                });
                return;
            }
            // getDepTree(result.data, slqktj_deptemp);
            // yspk_tree.yspk_data = slqktj_deptemp;
            // yspk_tree.yspk_value = new Array(slqktj_deptemp[0].key);
            // yspk_tree.yspk_expandedKeys = new Array(slqktj_deptemp[0].key);
            // yspk_tree.orgPath = slqktj_deptemp[0].path;
            // yspk_tree.orgId = slqktj_deptemp[0].key;

            getDepTree(result.data, slqktj_deptemp);
            yspk_tree.yspk_data = slqktj_deptemp;

            var fxccf_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-jdkp-fxccf')) {
                    fxccf_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-fxccf'));
                }
            } else {

            };

            yspk_tree.tree_code = fxccf_form_data ? fxccf_form_data.orgPath : slqktj_deptemp[0].path;
            yspk_tree.tree_key = fxccf_form_data ? fxccf_form_data.orgId : slqktj_deptemp[0].key;
            yspk_tree.tree_title = fxccf_form_data ? fxccf_form_data.orgName : slqktj_deptemp[0].title;

            // if (neet_init) {            
            //     this.search_list();
            // } else {
            //     yspk_tree.tree_key = init_data.tree_key;
            //     yspk_tree.tree_title = init_data.tree_title;
            // }

        }).then(result => {
            table.fetch(true, true);
        });
    },
    getTree: function () {
        ajax({
            url: '/gmvcs/uap/org/find/fakeroot/mgr',
            method: 'get',
            data: {},
            cache: false
        }).then(ret => {
            if (!(ret.code == 0)) {
                Tools.sayError('获取部门数据失败');
                return;
            }
            Tools.checkType = ret.data.checkType;
            fxccfMan.searchForm_sjdw.rdata = Tools.addIcon(ret.data);
            fxccfMan.searchForm_sjdw.expandedKeys = [ret.data[0].orgId];
            var fxccf_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-jdkp-fxccf')) {
                    fxccf_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-fxccf'));
                }
            } else {

            };

            fxccfMan.searchForm_sjdw.checkedKeys = fxccf_form_data ? fxccf_form_data.sjdw : (ret.data ? ret.data[0].orgId : '');
            fxccfMan.searchForm_sjdw.sjdw = fxccf_form_data ? fxccf_form_data.sjdw : ret.data[0].orgId;
            fxccfMan.$searchForm.record.sjdw = fxccf_form_data ? fxccf_form_data.sjdw : ret.data[0].orgId;
            fxccfMan.searchForm_sjdw.checkType = fxccf_form_data ? fxccf_form_data.checkType : ret.data[0].checkType;
            table.fetch(true, true);

            // 执行用户自定义操作          
            ajax({
                // url: '/gmvcs/uap/org/find/by/parent?pid=' + fxccfMan.searchForm_sjdw.checkedKeys,
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + fxccfMan.searchForm_sjdw.checkedKeys + '&checkType=' + fxccfMan.searchForm_sjdw.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {
                        var $tree_target = $.fn.zTree.getZTreeObj($('#tree-select-wrap .ztree').attr('id'));
                        var node = $tree_target.getNodesByParam('key', fxccfMan.searchForm_sjdw.checkedKeys, null)[0];
                        $tree_target.addNodes(node, Tools.addIcon(ret.data));
                        $tree_target = null;
                        node = null;
                    } else {
                        this.sayError('请求下级部门数据失败');
                    }
                } else {
                    this.sayError('请求下级部门数据失败');
                }
            });
        });
    },
    //给tree增加图标
    addIcon: function (arr) {

        // 深拷贝原始数据
        var dataSource = JSON.parse(JSON.stringify(arr))
        var res = [];

        // 每一层的数据都 push 进 res
        res.push(...dataSource);

        // res 动态增加长度
        for (var i = 0; i < res.length; i++) {
            var curData = res[i]
            curData.icon = '/static/image/zfsypsjglpt/users.png';
            curData.key = curData.orgId;
            curData.title = curData.orgName;
            curData.isParent = true;
            curData.name = curData.orgName;
            curData.children = curData.childs;

            // null数据置空
            curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
            curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
            curData.extend = curData.extend == null ? '' : curData.extend;

            // 如果有 children 则 push 进 res 中待搜索
            if (curData.childs) {
                res.push(...curData.childs.map(d => {
                    return d;
                }))
            }
        }
        return dataSource;
    },
    dealTableWithoutData: function (page) {
        table.$cache[page] = [];
        table.pagination.total = table.flag == 0 ? table.pagination.total : 0;
        table.remoteList = [];
        table.loading = false;
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
        // Tools.saySuccess('无案件数据');

        if (window.igdd) {
            // avalon.history.setHash('/zfsypsjglpt-jdkp-qzcs_jiaojing');
        }
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
                fxccfMan.dateShow = false;
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

                fxccfMan.$searchForm.record.wfsjEnd = Number(+sunday);
                fxccfMan.$searchForm.record.wfsjStart = Number(+monday);
                fxccfMan.kssj_isNull = 'none';
                fxccfMan.jssj_isNull = 'none';
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
                fxccfMan.dateShow = false;
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

                fxccfMan.$searchForm.record.wfsjEnd = Number(+end);
                fxccfMan.$searchForm.record.wfsjStart = Number(+now);
                fxccfMan.kssj_isNull = 'none';
                fxccfMan.jssj_isNull = 'none';
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
                fxccfMan.dateShow = true;
                var now = new Date();
                now.setHours(23);
                now.setMinutes(59);
                now.setSeconds(59);
                var end = new Date();
                fxccfMan.$searchForm.record.wfsjEnd = Number(+now);
                end.setMonth(now.getMonth() - 3 + '');
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                fxccfMan.$searchForm.record.wfsjStart = Number(+end);
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

    clickGlmt: function (type) {
        fxccf_Man.glmt_name.forEach(function (val, key) {
            fxccf_Man[val + '_clickClass'] = 'glmt_cj';
            fxccf_Man['glmt_' + val + '_show'] = false;
        });
        fxccf_Man[type + '_clickClass'] = 'glmt_jj';
        fxccf_Man['glmt_' + type + '_show'] = true;
        fxccf_Man.glmt_mark = type;
        Tools.configGlmtNumber();
    },
    configGlmtNumber: function () {
        var type = fxccf_Man.glmt_mark;
        fxccf_Man.glmt_total = fxccf_Man[type + '_data'].length;
    },
    init: function () {

    }
};

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
    cookierWorker.prototype.setCookie = function (name, value, expire) {
        var cookieAim = this.getCookie(name);

        //不存在名为name的cookie
        if (cookieAim == undefined) {
            var cookieString = '';
            cookieString += name + '=' + value;

            if (expire == undefined) {
                document.cookie = cookieString;
            } else {
                cookieString += this.getTime(expire);
                document.cookie = cookieString;
            };
        } else { //已存在名为name的cookie
            var query = confirm("已存在名为" + name + "的cookie,请问是否修改该cookie");

            if (query) {
                this.removeCookie(name);
                this.setCookie(name, value, expire);
            } else {
                return;
            }
        };
    };
    cookierWorker.prototype.modifyCookie = function (name, value, expire) {
        var cookieAim = this.getCookie(name);

        if (cookieAim == undefined) {
            this.setCookie(name, value, expire);
        } else {
            this.removeCookie(name);
            this.setCookie(name, value, expire);
        };
    };
    cookierWorker.prototype.removeCookie = function (name) {
        var cookieAim = this.getCookie(name);

        if (cookieAim == undefined) {
            return;
        } else {
            var cookieCover = cookieAim[0].split("=");
        };

        if (cookieCover[0].trim) {
            document.cookie = name + "=" + cookieCover[1].trim() + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } else {
            document.cookie = name + "=" + cookieCover[1].replace(/(^\s*)|(\s*$)/g, "") + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    };
    return new cookierWorker();
})();
/**********查询表单初始化函数(需单独提出)**********/
function ajgl_initialData() {
    return {
        wfsjEnd: '',
        wfsjStart: '',
        userCode: '',
        hphm: '',
        wfdz: '',
        wfbh: '',
        jdsbh: '',
        glmt: 'ALL',
        evaStatus: 'ALL',
        evaResult: 'ALL',
        reviewStatus: 'ALL',
        reviewResult: 'ALL'
    };
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


//判断领导版本或警员版本
function judgeLeaderOrPerson(judgeLeader) {
    table.version_AJKP = judgeLeader;
    let flag = judgeLeader;
    if (flag) {
        $('.top-form').css('height', '130px');
        $('.leaderORpolice').css('display', 'inherit');
        $('.wfsj_aj').css('margin-left', '25px');

        /*调整关闭X的位子*/
        $('.ajgl-container-kp .userCode_close_kp').css('left', '517px');
        $('.ajgl-container-kp .hphm_close_kp').css('left', '802px');
        $('.ajgl-container-kp .jqbh_close').css('left', '1087px');

        $('.ajgl-container-kp .jdsbh_close_kp').css('left', '517px');
        $('.ajgl-container-kp .jdsbh_close_kp').css('left', '-37px');
        $('#fxccf_table').css('top', '0px');
        return;
    } else {
        $('#aqglTable').css('top', '105px');
        $('.top-form').css('height', '90px');
        $('.leaderORpolice').css('display', 'none');
        $('.wfsj_aj').css('margin-left', '13px');

        /*调整关闭X的位子*/
        $('.ajgl-container-kp .userCode_close_kp').css('left', '230px');
        $('.ajgl-container-kp .hphm_close_kp').css('left', '517px');
        $('.ajgl-container-kp .jqbh_close').css('left', '802px');

        $('.ajgl-container-kp .jdsbh_close_kp').css('left', '230px');
        $('.ajgl-container-kp .jdsbh_close_kp').css('left', '-78px');
        $('#fxccf_table').css('position', 'absolute');
        $('#fxccf_table').css('top', '-40px');
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

/*表格控制器*/
let tableBodyAJKP = avalon.define({ //表格定义组件
    $id: 'fxccf_table',
    data: [],
    key: 'id',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'jtwfkp-fxccf-tableDrag-style',
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObjectAJKP = {};


//定义树
let yspk_tree = avalon.define({
    $id: "fxccf_sldw_tree",
    yspk_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
        this.tree_code = e.path;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.key;
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

