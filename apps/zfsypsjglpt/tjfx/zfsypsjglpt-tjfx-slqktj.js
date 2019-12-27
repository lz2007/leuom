/*
 * @Author: mikey.zhaopeng
 * @Date:   2018-07-28 15:57:29
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-02 17:11:06
 * @ modify 新需求 统计对象去掉 进来默认查询当前部门  点击部门查询下一级部门 time: Date:2018-07-28 15:57:29
 */
import {
    notification,
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import '/services/filterService';
import {
    apiUrl
} from '/services/configService';
import * as menuServer from '/services/menuService';

let {
    prefixLevel,
    dep_switch,
    separator,
    isTableSearch
} = require('/services/configService');
export const name = "zfsypsjglpt-tjfx-slqktj";
const listHeaderName = name + "-list-header";
const storage = require('/services/storageService.js').ret;

let slqktj_man = null,
    slqktj_vm;
let indexPath = null;
require("./zfsypsjglpt-tjfx-slqktj.css");
avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-slqktj.html"),
    defaults: {
        // zfsypsjglpt_language: getLan(), //英文翻译
        key_dep_switch: dep_switch,
        device_id: "",
        police_check: "",
        orgPathNameArrayShow: [],
        orgPathNameArray: [],
        orgPathName: '交警总队',
        orgPathId: '',
        orgPathCode: '',

        showBack: false,
        firstTree: {},
        crumbsArr: [],
        returnBtn() {
            zfsypsjglpt_tjfx_slqktj_table.remoteList = [];
            this.searchBtnFlag = false;
            this.crumbsArr.pop();
            yspk_tree.tree_code = this.crumbsArr[this.crumbsArr.length - 1].orgPath;
            yspk_tree.curTree = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            yspk_tree.tree_key = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            yspk_tree.tree_title = this.crumbsArr[this.crumbsArr.length - 1].orgName;
            let level = this.crumbsArr.length > 1 ? "1" : "0";
            this.ajaxList(0, 20, level);
            

        },

        actions(type, text, record, index) {
            // console.log(type);
        },
        searchBtnFlag: true,
        ajaxList(page, pageSize, level = 0, item) {
            let start_time, end_time;
            start_time = slqktj_startTime_vm.slqktj_startTime + ' 00:00:00';
            end_time = slqktj_endTime_vm.slqktj_endTime + ' 23:59:59';
            start_time = new Date(start_time.replace(/-/g, '/')).getTime()
            end_time = new Date(end_time.replace(/-/g, '/')).getTime()

            if (time_range_vm.range_flag == "0") {

                if (moment().format('d') == "0") {
                    start_time = getTimeByDateStr(moment().day(-6).format('YYYY-MM-DD'));
                    end_time = getTimestamp() * 1000;
                } else {
                    start_time = getTimeByDateStr(moment().day(1).format('YYYY-MM-DD'));
                    end_time = getTimestamp() * 1000;
                }
            }

            if (time_range_vm.range_flag == 1) {
                start_time = getTimeByDateStr(moment().startOf('month').format('YYYY-MM-DD'));
                end_time = getTimestamp() * 1000;
            }

            if (time_range_vm.range_flag == 2) {
                start_time = slqktj_startTime_vm.slqktj_startTime;
                end_time = slqktj_endTime_vm.slqktj_endTime;

                start_time = getTimeByDateStr(slqktj_startTime_vm.slqktj_startTime + "-01");
                if (slqktj_endTime_vm.slqktj_endTime == moment().format('YYYY-MM-DD'))
                    end_time = getTimestamp() * 1000; //选中的是本月
                else
                    end_time = getTimeByDateStr(moment(slqktj_endTime_vm.slqktj_endTime).format("YYYY-MM-DD"), true); //选中的非本月
            }

            if (!start_time) {
                return;
            }
            if (!end_time) {
                return;
            }

            count_type_vm.curType = level;

            let params = {
                "orgId": item ? item.orgId : yspk_tree.curTree || yspk_tree.tree_key,
                "orgPath": item ? item.orgPath : yspk_tree.tree_code,
                "orgName": item ? item.orgName : yspk_tree.tree_title,
                "bsType": count_type_vm.countLevel_type[0],
                "target": level,
                "policeType": manType.curType || manType.count_type[0],
                "startTime": start_time,
                "endTime": end_time,
                "page": page,
                "pageSize": pageSize
            };
            if (time_range_vm.range_flag == 2) {
                if (getTimeByDateStr(slqktj_startTime_vm.slqktj_startTime + "-01") > getTimeByDateStr(slqktj_endTime_vm.slqktj_endTime + "-01")) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = getTimeByDateStr(slqktj_endTime_vm.slqktj_endTime) - getTimeByDateStr(slqktj_startTime_vm.slqktj_startTime);

                if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                    notification.warn({
                        message: '时间间隔不能超过一年，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
            }


            zfsypsjglpt_tjfx_slqktj_table.current = 1;
            // zfsypsjglpt_tjfx_slqktj_table.remoteList = [];
            zfsypsjglpt_tjfx_slqktj_table.paramsData = params;
            zfsypsjglpt_tjfx_slqktj_table.fetch(params);
        },
        orgNameBtn(level = 0, item) { //部门m面包屑路径按钮
            if (item) {
                // if (item.orgName == '首页') {
                //     slqktj_man.orgPathNameArrayShow[0].orgName = slqktj_man.orgPathName;
                //     slqktj_man.orgPathNameArrayShow = slqktj_man.orgPathNameArrayShow.splice(0);
                //     $('.popover.top.in').hide();
                //     slqktj_man.ajaxList(0, 20, level, item);
                // }
                $.each(this.orgPathNameArrayShow, function (i, obj) {
                    if (obj.orgName == item.orgName) {
                        slqktj_man.orgPathNameArrayShow = slqktj_man.orgPathNameArrayShow.splice(0, i + 1);
                        storage.setItem('orgPathBlockHis', slqktj_man.orgPathNameArrayShow, 0.5);
                        $('.popover.top.in').hide();
                        slqktj_man.ajaxList(0, 20, level, item);
                    }
                });
            }

        },
        isSearch: false,
        searchBtn(level = 0, item) {
            this.isSearch = true;
            this.showBack = false;
            slqktj_vm.crumbsArr = [];
            this.searchBtnFlag = true;
            slqktj_man.orgPathNameArrayShow = [];
            storage.setItem('orgPathBlockHis', slqktj_man.orgPathNameArrayShow, 0.5);

            $('.popover.top.in').hide();
            this.ajaxList(0, 20, level, item);
            // $('.zfsypsjglpt_tjfx_slqktj .slqktj-list-panel').css({
            //     'top': '105px'
            // });
        },
        orgIndexBtn(level = 0, item) {

            slqktj_man.orgPathNameArrayShow = [];
            storage.setItem('orgPathBlockHis', slqktj_man.orgPathNameArrayShow, 0.5);

            yspk_tree.tree_code = indexPath.orgPath;
            yspk_tree.tree_key = indexPath.orgId;
            yspk_tree.tree_title = indexPath.orgName;

            $('.popover.top.in').hide();
            this.ajaxList(0, 20, level, item);

        },
        orgDeptBtn(level = 0, item) {
            // console.log(item);
            // debugger
            this.searchBtnFlag = false;
            this.showBack = true;

            zfsypsjglpt_tjfx_slqktj_table.remoteList = [];

            let obj = {
                orgPath: item.orgPath,
                orgId: item.orgId,
                orgName: item.orgName,
            }
            slqktj_vm.crumbsArr.push(obj);
            yspk_tree.tree_code = item.orgPath;
            yspk_tree.tree_key = item.orgId;
            yspk_tree.tree_title = item.orgName;
            // slqktj_vm.searchBtn();

            // if (item) {
            //     $('.zfsypsjglpt_tjfx_slqktj .slqktj-list-panel').css({
            //         'top': '150px'
            //     });
            //     let orglevel = item.orgPath.split('/');

            //     let orgPathmaxLen = slqktj_man.orgPathNameArrayShow.length - 1;
            //     if (orgPathmaxLen > 0) {
            //         let orglevelShow = slqktj_man.orgPathNameArrayShow[orgPathmaxLen].orgPath.split('/');
            //         if (orglevelShow.length == orglevel.length) { //同级部门 删除 顶部部门
            //             slqktj_man.orgPathNameArrayShow.splice(orgPathmaxLen);
            //         }
            //     }
            //     this.orgPathName = item.orgName;
            //     this.orgPathNameArrayShow.push(item);

            // }
            // storage.setItem('orgPathBlockHis', this.orgPathNameArrayShow, 0.5);
            $('.popover.top.in').hide();
            this.ajaxList(0, 20, level, item);
        },
        exportBtn() {
            if (!this.isSearch) {
                return;
            }
            slqktjExportBtn();
        },
        vm_hint: avalon.define({
            $id: 'slqktj-hint',
            show: false,
            handleCancel(e) {
                this.show = false;
            },
            handleOk() {
                this.show = false;
            }
        }),
        vm_slqktj_hint: avalon.define({
            $id: 'slqktj-hintVm',
            title: '算法说明-基本数据统计'
        }),
        hint_vm() {
            this.vm_hint.show = true;
            if (!$('.modal-dialog').hasClass('slqktj-hint')) {
                $('.modal-dialog').addClass('slqktj-hint');
            }
        },
        authority: { // 按钮权限标识
            "EXPORT": false, //音视频库_统计分析_摄录情况统计_导出
            "SEARCH": false, //音视频库_统计分析_摄录情况统计_查询
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
                getDepTree(result.data, slqktj_deptemp);
                yspk_tree.yspk_data = slqktj_deptemp;

                yspk_tree.tree_code = slqktj_deptemp[0].path;
                yspk_tree.tree_key = slqktj_deptemp[0].key;
                yspk_tree.tree_title = slqktj_deptemp[0].title;

                this.firstTree = {
                    orgPath: slqktj_deptemp[0].path,
                    orgId: slqktj_deptemp[0].orgId,
                    orgName: slqktj_deptemp[0].title,
                }

                indexPath = result.data[0];

            }).then(result => {
                isTableSearch && this.ajaxList(0, 20);
            });
        },

        onInit(event) {
            let _this = this;
            slqktj_man = this;
            slqktj_vm = event.vmodel;

            if (storage.getItem('orgPathBlockHis')) {
                slqktj_man.orgPathNameArrayShow = storage.getItem('orgPathBlockHis'); //
            }

            setListHeader(listHeaderName);

            // 导出、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_TJFX_SLQKTJ_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0) {
                    $('.slqktj-list-panel').css('top', '0px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_TJFX_SLQKTJ_EXPORT_JJ":
                            _this.authority.EXPORT = true;
                            break;
                        case "AUDIO_FUNCTION_TJFX_SLQKTJ_SEARCH_JJ":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
                if (!_this.authority.SEARCH && _this.authority.EXPORT) {
                    $('.slqktj_btnClass').css('top', '5px');
                    $('.slqktj-list-panel').css('top', '50px');
                }
                if (false == _this.authority.EXPORT && false == _this.authority.SEARCH)
                    $('.slqktj-list-panel').css('top', '0px');
            });
            if (!yspk_tree.curTree) {
                this.getDept();
            }
            findBsTypeAll();
        },
        onDispose() {
            this.isSearch = false;
            /*重新初始化时间*/
            // storage.setItem('orgPathBlockHis', JSON.stringify(), 0.5);
        },
        onReady() {
            if (this.orgPathNameArrayShow.length > 0) {
                $('.zfsypsjglpt_tjfx_slqktj .slqktj-list-panel').css({
                    'top': '150px'
                });
            }

            /*初始化时间范围*/
            if (time_range_vm.range_flag == 0) {
                time_range_vm.time_range = ["0"];
            } else if (time_range_vm.range_flag == 1) {
                time_range_vm.time_range = ["1"];
            } else {
                time_range_vm.time_range = ["2"];
            }

            if (yspk_tree.curTree) {
                yspk_tree.yspk_value = [yspk_tree.curTree];
            }

            
            if (manType.curType) {
                /*初始化人员类别*/
                manType.count_type = [manType.curType];
            }
            // if (count_type_vm.curType == '-1') {
            //     zfsypsjglpt_tjfx_slqktj_table.userCode_flag = true;
            // } else {
            //     zfsypsjglpt_tjfx_slqktj_table.userCode_flag = false;
            // }
          

            document.body.addEventListener("click", function (e) {
                zfsypsjglpt_tjfx_slqktj_table.hintJsdrl_flag = false;
                zfsypsjglpt_tjfx_slqktj_table.hintZfysyl_flag = false;
            }, false);

            let v_height = $(window).height() - 96;
            //          let v_min_height = $(window).height() - 68;
            if (v_height > 740) {
                // $(".zfsypsjglpt_tjfx_slqktj").height(v_height);
                //              $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
            } else {
                // $(".zfsypsjglpt_tjfx_slqktj").height(740);
                //              $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
            }

            /*重新调整表格宽度*/
            let s = $(".slqktj-list-content").height();
            let len = zfsypsjglpt_tjfx_slqktj_table.remoteList.length;
            if (len * 34 > s) {
                $(".slqktj-list-header").addClass('table-padding-right16');
            } else {
                $(".slqktj-list-header").removeClass('table-padding-right16');
            }
        }
    }
});

let zfsypsjglpt_tjfx_slqktj_table = avalon.define({
    $id: 'zfsypsjglpt_tjfx_slqktj_table',
    //页面表格数据渲染
    loading: false,
    isNull: true,
    hintJsdrl_flag: false,
    hintZfysyl_flag: false,
    remoteList: [],
    changeData: [], //保存需要编辑或者删除的用户
    userCode_flag: false, //警员/警号
    total: 0,
    current: 0,
    pageSize: 20,
    paramsData: {},
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    hint_jsdrl() {
        this.hintZfysyl_flag = false;
        if (this.hintJsdrl_flag == true) {
            this.hintJsdrl_flag = false;
        } else {
            this.hintJsdrl_flag = true;
        }
    },
    hint_zfysyl() {
        this.hintJsdrl_flag = false;
        if (this.hintZfysyl_flag == true) {
            this.hintZfysyl_flag = false;
        } else {
            this.hintZfysyl_flag = true;
        }
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange() {
        this.hintJsdrl_flag = false;
        this.hintZfysyl_flag = false;
        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        this.remoteList = [];
        this.fetch(params);
    },
    fetch(params) {
        this.hintJsdrl_flag = false;
        this.hintZfysyl_flag = false;
        this.loading = true;
        this.isNull = false;
        let noti = '<li :if="@loading" class="slqktjList-loading"><span>结果加载中</span></li>';
        $('.fixed-table-saika-loading').html(noti);
        let orgURL = '/gmvcs/stat/l/rs/info';
        let personURL = '/gmvcs/stat/l/rs/info/byUser';
        let ajaxURL = '';
        if (count_type_vm.curType == '-1') {
            ajaxURL = personURL;
            params.target = '-1';
            /*人员的时候增加 '警员/警号'字段*/
            zfsypsjglpt_tjfx_slqktj_table.userCode_flag = true;

        } else {
            ajaxURL = orgURL;
            /*部门的时候减去 '警员/警号'字段*/
            zfsypsjglpt_tjfx_slqktj_table.userCode_flag = false;
        }

        ajax({
            url: ajaxURL,
            method: 'post',
            data: {
                "orgId": params.orgId,
                "orgPath": params.orgPath,
                "target": params.target,
                "policeType": params.policeType,
                "beginTime": params.startTime,
                "endTime": params.endTime,
                "bsType": params.bsType,
                "page": params.page,
                "pageSize": params.pageSize
            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: '查询失败，请稍后再试',
                    title: '通知'
                });
                this.remoteList = [];
                this.loading = false;
                this.isNull = true;
                initDragList(listHeaderName);
                return;
            }

            // if (!result.data.currentElements.length && !slqktj_man.searchBtnFlag) {
            //     //恢复查询参数
            //     zfsypsjglpt_tjfx_slqktj_table.paramsData.orgId = yspk_tree.tree_key;
            //     zfsypsjglpt_tjfx_slqktj_table.paramsData.orgPath = yspk_tree.tree_code;
            //     zfsypsjglpt_tjfx_slqktj_table.paramsData.orgName = yspk_tree.tree_title;

            //     //删除最后点击部门
            //     let orgPathmaxLen = slqktj_man.orgPathNameArrayShow.length - 1;
            //     slqktj_man.orgPathNameArrayShow.splice(orgPathmaxLen);
            //     this.loading = false;
            //     this.isNull = true;

            //     return
            // }

            if (result.data.currentElements) {
                yspk_tree.curTree = params.orgId;
                yspk_tree.tree_key = params.orgId;
                yspk_tree.tree_code = params.orgPath;
                yspk_tree.tree_title = params.orgName;
                this.changeData = []; //当表格刷新当前页数据置空
                this.total = result.data.totalElements;
                let ret = [];
                avalon.each(result.data.currentElements, function (index, el) {
                    ret.push(el);
                });
                let len = ret.length; //记录当前页面的数据长度
                if (ret.length % 20 == 0) {
                    $(".slqktj-list-header").addClass('table-padding-right16');
                } else {
                    $(".slqktj-list-header").removeClass('table-padding-right16');
                }

                this.remoteList = [];

                // if (dep_switch && result.data.currentElements.length!= 0) {//黔西南 部门提示需求功能 开关
                //     let times = 0;
                //     var getFullName = new Promise(function(resolve, reject){
                //             ret.forEach(function(el,key){
                //                 ajax({
                //                     url: `/gmvcs/uap/org/getFullName?orgCode=${el.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                //                     method: 'get'
                //                 }).then(res => {
                //                     el.orgCode = res.data;
                //                     times = times + 1;
                //                 }).then(function(){
                //                     if(times >= result.data.currentElements.length-1) {
                //                         resolve('end');
                //                     }
                //                 });
                //             });
                //     });
                //     let o_this = this;
                //     getFullName.then(x => {
                //         setTimeout(function(){
                //             if (count_type_vm.curType == '-1') {
                //                 o_this.remoteList = avalon.range(len).map(n => ({
                //                     //	                    dqrs: ret[n].dqrs,
                //                     userCode: ret[n].userName + "(" + ret[n].userCode + ")",
                //                     jsdrl: ret[n].jsdrl,
                //                     orgId: ret[n].orgId,
                //                     orgCode: ret[n].orgCode,
                //                     orgPath: ret[n].orgPath,
                //                     orgName: ret[n].orgName,
                //                     over24fileNum: ret[n].over24fileNum,
                //                     //	                    zfys: ret[n].zfys,
                //                     zfysps: ret[n].zfysps,
                //                     zfyspzdx: (ret[n].zfyspzdx / (1024 * 1024 * 1024)).toFixed(2),
                //                     zfyspzsc: formatSeconds(ret[n].zfyspzsc),
                //                     zfysyl: ret[n].zfysyl,
                //                     index: 1 + 20 * (o_this.current - 1) + n
                //                 }));
                //                 initDragList(listHeaderName);
                //             } else {
                //                 o_this.remoteList = avalon.range(len).map(n => ({
                //                     dqrs: ret[n].dqrs,
                //                     //	                    userCode: ret[n].userCode,
                //                     jsdrl: ret[n].jsdrl,
                //                     orgId: ret[n].orgId,
                //                     orgCode: ret[n].orgCode,
                //                     orgPath: ret[n].orgPath,
                //                     orgName: ret[n].orgName,
                //                     over24fileNum: ret[n].over24fileNum,
                //                     zfys: ret[n].zfys,
                //                     zfysps: ret[n].zfysps,
                //                     zfyspzdx: (ret[n].zfyspzdx / (1024 * 1024 * 1024)).toFixed(2),
                //                     zfyspzsc: formatSeconds(ret[n].zfyspzsc),
                //                     zfysyl: ret[n].zfysyl,
                //                     index: 1 + 20 * (o_this.current - 1) + n
                //                 }));
            
                //                 if (slqktj_vm.searchBtnFlag) {
            
                //                     let obj = {
                //                         orgPath: o_this.remoteList[0].orgPath,
                //                         orgId: o_this.remoteList[0].orgId,
                //                         orgName: o_this.remoteList[0].orgName
                //                     }
            
                //                     slqktj_vm.crumbsArr.push(obj);
                //                 }
            
                //                 initDragList(listHeaderName);
                //             }
                //         },100);
                //     });
                // }else {
                    if (count_type_vm.curType == '-1') {
                        this.remoteList = avalon.range(len).map(n => ({
                            //	                    dqrs: ret[n].dqrs,
                            userCode: ret[n].userName + "(" + ret[n].userCode + ")",
                            jsdrl: ret[n].jsdrl,
                            orgId: ret[n].orgId,
                            orgCode: ret[n].orgCode,
                            orgPath: ret[n].orgPath,
                            orgName: ret[n].orgName,
                            over24fileNum: ret[n].over24fileNum,
                            //	                    zfys: ret[n].zfys,
                            zfysps: ret[n].zfysps,
                            zfyspzdx: (ret[n].zfyspzdx / (1024 * 1024 * 1024)).toFixed(2),
                            zfyspzsc: formatSeconds(ret[n].zfyspzsc),
                            zfysyl: ret[n].zfysyl,
                            index: 1 + 20 * (this.current - 1) + n
                        }));
                        initDragList(listHeaderName);
                    } else {
                        this.remoteList = avalon.range(len).map(n => ({
                            dqrs: ret[n].dqrs,
                            //	                    userCode: ret[n].userCode,
                            jsdrl: ret[n].jsdrl,
                            orgId: ret[n].orgId,
                            orgCode: ret[n].orgCode,
                            orgPath: ret[n].orgPath,
                            orgName: ret[n].orgName,
                            over24fileNum: ret[n].over24fileNum,
                            zfys: ret[n].zfys,
                            zfysps: ret[n].zfysps,
                            zfyspzdx: (ret[n].zfyspzdx / (1024 * 1024 * 1024)).toFixed(2),
                            zfyspzsc: formatSeconds(ret[n].zfyspzsc),
                            zfysyl: ret[n].zfysyl,
                            index: 1 + 20 * (this.current - 1) + n
                        }));
    
                        if (slqktj_vm.searchBtnFlag) {
    
                            let obj = {
                                orgPath: this.remoteList[0].orgPath,
                                orgId: this.remoteList[0].orgId,
                                orgName: this.remoteList[0].orgName
                            }
    
                            slqktj_vm.crumbsArr.push(obj);
                        }
    
                        initDragList(listHeaderName);
                    }
                // }
            }
            if (result.data.totalElements == 0) {
                this.current = 0;
                this.loading = false;
                this.isNull = true;
                initDragList(listHeaderName);
                return;
            }
            this.loading = false;
            this.isNull = false;
            
            
        }).then(result => {
            var o_this = this;
            setTimeout(function(){
                if (count_type_vm.curType == '-1') {
                    zfsypsjglpt_tjfx_slqktj_table.userCode_flag = true;
                    //      		$(".zfsps-flag").removeClass('col-10').addClass('col-8');
                    //      		$(".jsdrl-flag").removeClass('col-10').addClass('col-6');
                } else {
                    //      		$(".zfsps-flag").removeClass('col-8').addClass('col-10');
                    //      		$(".jsdrl-flag").removeClass('col-6').addClass('col-10');
                    zfsypsjglpt_tjfx_slqktj_table.userCode_flag = false;
                }
                _popover(); //激活title功能
    
                let s = $(".slqktj-list-content").height();
                let len = o_this.remoteList.length;
                if (len * 34 > s) {
                    $(".slqktj-list-header").addClass('table-padding-right16');
                } else {
                    $(".slqktj-list-header").removeClass('table-padding-right16');
                }
            }, 501);
            
        });
    },
    handleSelect(record, selected, selectedRows) {
        table.changeData = selectedRows;
    },
    handleSelectAll(selected, selectedRows) {
        for (let i = 0; i < selectedRows.length; i++) {
            table.changeData[i] = selectedRows[i];
        }
    },
});

function slqktjExportBtn() {
    let start_time, end_time;
    if (time_range_vm.range_flag == "0") {
        if (moment().format('d') == "0") {
            start_time = getTimeByDateStr(moment().day(-6).format('YYYY-MM-DD'));
            end_time = getTimestamp() * 1000;
        } else {
            start_time = getTimeByDateStr(moment().day(1).format('YYYY-MM-DD'));
            end_time = getTimestamp() * 1000;
        }
    }

    if (time_range_vm.range_flag == 1) {
        start_time = getTimeByDateStr(moment().startOf('month').format('YYYY-MM-DD'));
        end_time = getTimestamp() * 1000;
    }

    if (time_range_vm.range_flag == 2) {
        start_time = slqktj_startTime_vm.slqktj_startTime;
        end_time = slqktj_endTime_vm.slqktj_endTime;

        start_time = getTimeByDateStr(slqktj_startTime_vm.slqktj_startTime + "-01");
        if (slqktj_endTime_vm.slqktj_endTime == moment().format('YYYY-MM-DD'))
            end_time = getTimestamp() * 1000; //选中的是本月
        else
            end_time = getTimeByDateStr(moment(slqktj_endTime_vm.slqktj_endTime).format("YYYY-MM-DD"), true); //选中的非本月
    }

    if (!start_time) {
        return;
    }
    if (!end_time) {
        return;
    }

    let temp_data = {
        "orgId": yspk_tree.curTree || yspk_tree.tree_key,
        "orgPath": yspk_tree.tree_code,
        "policeType": manType.curType || manType.count_type[0],
        "startTime": start_time,
        "endTime": end_time
    };

    let targ = ''; //统计级别
    let levelURL = '';
    let data = '';
    if (count_type_vm.curType == '-1') { //人员
        targ = '-1';
        // levelURL = "/gmvcs/audio/statisticalAnalysis/video_statistics_by_person_excel?";
        levelURL = "/gmvcs/stat/l/rs/info/exportByUser?";
        data = 'orgId=' + temp_data.orgId + '&orgPath=' + temp_data.orgPath + '&policeType=' + temp_data.policeType + '&beginTime=' + temp_data.startTime + '&endTime=' + temp_data.endTime + '&bsType=' + count_type_vm.countLevel_type[0] + '&bsTypeName=' + count_type_vm.curTypeName;
    } else { //部门
        targ = count_type_vm.curType;
        // levelURL = "/gmvcs/audio/statisticalAnalysis/videoStatisticsExcel?";
        levelURL = "/gmvcs/stat/l/rs/info/exportByDept?";
        data = 'orgId=' + temp_data.orgId + '&orgPath=' + temp_data.orgPath + '&target=' + targ + '&policeType=' + temp_data.policeType + '&beginTime=' + temp_data.startTime + '&endTime=' + temp_data.endTime + '&bsType=' + count_type_vm.countLevel_type[0] + '&bsTypeName=' + count_type_vm.curTypeName;
    }

    let downURL = "http://" + window.location.host + apiUrl + levelURL + data; //远程服务器使用
    window.location.href = downURL; //远程服务器使用
}

//定义树
let yspk_tree = avalon.define({
    $id: "slqktj_tree",
    yspk_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.key;
        this.tree_code = e.node.path;
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
let manType = avalon.define({
    $id: 'count_type_person',
    curType: "0",
    count_type: ["0"],
    count_type_options: [{
        value: "0",
        label: "不限"
    }, {
        value: "LEVAM_JYLB_JY",
        label: "警员"
    }, {
        value: "LEVAM_JYLB_FJ",
        label: "辅警"
    }],
    onChangeType(e) {
        let _this = this;
        _this.curType = e.target.value;
        // if (e.target.value == '1') {
        //     _this.curType = "LEVAM_JYLB_JY";
        // } else if (e.target.value == '2') {
        //     _this.curType = "LEVAM_JYLB_FJ";
        // } else {
        //     _this.curType = "0";
        // }
    }
});

let count_type_vm = avalon.define({
    $id: 'count_type_slqktj',
    widthcontent: "100px",
    curType: "0",
    curTypeName: "",
    countLevel_type: [],
    levelFlag: true,
    level_null: '',
    countLevel_type_options: [],
    onChangeLevel(e) {
        let _this = this;
        _this.curType = e.target.value;
        _this.countLevel_type = [e.target.value];
        _this.countLevel_type_options.forEach(function (item) {
            if (item.value == e.target.value) {
                _this.curTypeName = item.label;
            }
        });
    }
});
/*生成统计对象*/
function initCountObject() {
    if (!yspk_tree.orgPath) {
        return;
    }
    let countURL = '/gmvcs/uap/org/count/level?path=' + yspk_tree.orgPath;
    ajax({
        url: countURL,
        method: 'get',
        data: {},
        cache: false
    }).then(result => {
        if (result.code != 0) {
            notification.error({
                message: '获取统计对象失败，请稍后再试',
                title: '通知'
            });
            return;
        }
        let countLevel = [];
        
        for (let a = 0; a < result.data; a++) {
            if (a == 0) {
                let levelObj = {
                    value: '0',
                    label: "当前部门"
                };
                countLevel.push(levelObj);
                continue;
            }
            let levelObj = {
                value: a,
                label: "下" + a + "级"
            };
            countLevel.push(levelObj);
        }
        //	        count_type_vm.count_type_options = [];//清空
        count_type_vm.count_type_options = countLevel;
        //      }
    });
}
//获取业务类别
function findBsTypeAll() {
    let url = '/gmvcs/uap/bstype/findBsTypeAll';
    ajax({
        url: url,
        method: 'get',
        data: {},
        cache: false
    }).then(result => {
        if (result.code != 0) {
            notification.error({
                message: '获取业务类别失败，请稍后再试',
                title: '通知'
            });
            return;
        }
        let countLevel = [ {
                value: '0',
                label: "不限"
            }
        ];
        for (let a = 0; a < result.data.length; a++) {
            let levelObj = {
                value: result.data[a].code,
                label: result.data[a].name
            };
            countLevel.push(levelObj);
        }
        if (countLevel.length > 0) {
            count_type_vm.countLevel_type_options = countLevel;
        }
        if (count_type_vm.curTypeName) {
            slqktj_vm.isSearch = true;            
            /*初始化业务类别*/
            // count_type_vm.countLevel_type = count_type_vm.countLevel_type;
        } else {
            count_type_vm.countLevel_type = ['0'];
            count_type_vm.curTypeName = '不限';
        }
     });
}

let time_range_vm = avalon.define({
    $id: 'slqktj_time_range',
    curRange: "",
    select_time: false,
    time_range_options: [{
        value: "0",
        label: "本周"
    }, {
        value: "1",
        label: "本月"
    }, {
        value: "2",
        label: "自定义时间"
    }],
    time_range: ["0"],
    range_flag: 0,
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0) {
            _this.range_flag = 0;
            if (moment().format('d') == "0") {
                slqktj_startTime_vm.slqktj_startTime = moment().day(-6).format('YYYY-MM-DD');
                slqktj_endTime_vm.slqktj_endTime = moment().format('YYYY-MM-DD');
            } else {
                slqktj_startTime_vm.slqktj_startTime = moment().day(1).format('YYYY-MM-DD');
                slqktj_endTime_vm.slqktj_endTime = moment().format('YYYY-MM-DD');
            }
        }

        if (e.target.value == 1) {
            _this.range_flag = 1;
            slqktj_startTime_vm.slqktj_startTime = moment().startOf('month').format('YYYY-MM-DD');
            slqktj_endTime_vm.slqktj_endTime = moment().format('YYYY-MM-DD');
        }

        if (e.target.value == 2) {
            _this.range_flag = 2;
            slqktj_endTime_vm.slqktj_endTime = moment().format('YYYY-MM-DD');
            slqktj_startTime_vm.slqktj_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else {
            _this.select_time = false;
        }
    }
});

/* 主页面时间控制  start */
let slqktj_startTime_vm = avalon.define({
    $id: "slqktj-startTime",
    start_null: "none",
    slqktj_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    slqktj_endDate: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.slqktj_startTime = e.target.value;
        if (_this.slqktj_startTime == "") {
            _this.start_null = "inline-block";
            $(".slqktj_start_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.start_null = "none";
            $(".slqktj_start_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});

let slqktj_endTime_vm = avalon.define({
    $id: "slqktj-endTime",
    end_null: "none",
    slqktj_endTime: moment().format('YYYY-MM-DD'),
    slqktj_endDate: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.slqktj_endTime = e.target.value;
        if (_this.slqktj_endTime == "") {
            _this.end_null = "inline-block";
            $(".slqktj_end_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.end_null = "none";
            $(".slqktj_end_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});
/* 主页面时间控制  end */
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}
//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
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

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}

/*title显示,方便复制*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popover({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        html: 'true',
        content: function () {
            // console.log($($(this)[0]).attr("data-popover"));
            // return '<div class="title-content">' + $(this)[0].innerText + '</div>';
            if($($(this)[0]).attr("data-popover")) {
                return '<div class="title-content">' + $($(this)[0]).attr("data-popover") + '</div>';
            } else {
                return '<div class="title-content">' + $(this)[0].innerText + '</div>';
            }
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;

        // console.log('ssss',this);
        if(dep_switch && $(_this).attr('dep') && $(_this).attr('fir')=='true') {
            // console.log($(_this).attr('dep'));
            var dep_orgCode = $(_this).attr('data-popover');
            ajax({
                url: `/gmvcs/uap/org/getFullName?orgCode=${dep_orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                method: 'get'
            }).then(res => {
                // console.log('getFullName');
                $(_this).attr('data-popover', res.data);
                $(_this).attr('fir', 'false');
                clearTimeout(timer);
                timer = setTimeout(function () {
                    $('div').siblings(".popover").popover("hide");
                    $(_this).popover("show");

                    $(".popover").on("mouseleave", function () {
                        $(_this).popover('hide');
                    });
                }, 500);
            })
        } else {
            clearTimeout(timer);
            timer = setTimeout(function () {
                $('div').siblings(".popover").popover("hide");
                $(_this).popover("show");
    
                $(".popover").on("mouseleave", function () {
                    $(_this).popover('hide');
                });
            }, 500);
        }
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 100);
    });
}

// ===================================表格拖动实现==========================
/** 
 * 初始化表头拖拽
 */
function initDragList(listHeaderName) {
    //判断列表是否为空
    let eleNull = $('.slqktj-list-content .list-null');
    if (eleNull.length) {
        eleNull.innerWidth($('.slqktj-list-header').get(0).scrollWidth);
    } else {
        // 初始化表体格子宽度
        $('.slqktj-list-header li').each((index, el) => {
            index = index + 1;
            $('.slqktj-list-content>li>div:nth-child(' + index + ')').innerWidth($(el).innerWidth());
        });
    }

    //表格横向滚动时保持表头与表体的对齐
    $('.slqktj-list-content').scroll(function (event) {
        $('.slqktj-list-header').css({
            'margin-left': -event.target.scrollLeft
        })
    });

    //鼠标样式判断
    $('.slqktj-list-header li').off('mousemove').on('mousemove', function (event) {
        let $target = $(event.target);
        //改鼠标样式
        if (!$target.hasClass("last-item") && event.offsetX > $target.innerWidth() - 10) {
            $target.css({
                cursor: "e-resize"
            });
        } else {
            $target.css({
                cursor: "default"
            });
        }
    });

    //拖拽
    $('.slqktj-list-header li').off('mousedown').on('mousedown', function (event) {
        let $target = $(event.target);
        let oldWidth = $target.innerWidth();
        if ($target.hasClass("last-item") || event.offsetX < oldWidth - 10) {
            event.preventDefault();
            return;
        }
        let dragTH = $target;
        //按下时鼠标距离页面的距离
        let startX = event.pageX;
        // 使用namespace，以防影响其他地方document的事件
        $(document).off('mousemove.draglist').on('mousemove.draglist', function (event) {
            let dir = event.pageX - startX;
            let newWidth = oldWidth + dir;
            if (newWidth < 80) {
                return;
            }
            dragTH.innerWidth(newWidth);
            if (eleNull.length) {
                eleNull.innerWidth($('.slqktj-list-header').get(0).scrollWidth);
            } else {
                let index = dragTH.index() + 1;
                $('.slqktj-list-content>li>div:nth-child(' + index + ')').innerWidth(newWidth);
            }
            event.preventDefault();
        });
        // 使用namespace，以防影响其他地方document的事件
        $(document).off('mouseup.draglist').on('mouseup.draglist', function (event) {
            $(document).off('mousemove.draglist').off('mouseup.draglist');
            //保留表头宽度，以便切换模块时可以使用
            let widthArr = [];
            $('.slqktj-list-header li').each((index, el) => {
                widthArr.push($(el).innerWidth());
            });
            storage.setItem(listHeaderName, JSON.stringify(widthArr), 0.5);
        });
    });
}

/** 
 * 判断是否需要恢复上次拖拽后的表头，如果要则根据保持的宽度设置列表的表头宽度
 */
function setListHeader(listHeaderName) {
    //表头宽度设置
    let widthArrStr = storage.getItem(listHeaderName);
    let widthArr = widthArrStr ? JSON.parse(widthArrStr) : [];
    if (widthArr.length) {
        $('.slqktj-list-header li').each((index, el) => {
            $(el).innerWidth(widthArr[index]);
        });
    }
}
$(window).resize(function () {
    initDragList(listHeaderName);
    setListHeader(listHeaderName);
});