import './mainLineManager.less'
import ajax from '/services/ajaxService.js';
import {
    notification
} from "ane";
import 'ane';
import {
    titleName,
    gxxOcxVersion,
    defaultBrowser,
    versionSelection,
    indexChange
} from '/services/configService';
require('/apps/common/common-zfzs');
let storage = require('/services/storageService.js').ret;
require('/vendor/jquery/jquery.dragsort-0.5.2.min.js');
let moment = require('moment');
let echarts = require("echarts/dist/echarts.min");
let roleNames = storage.getItem('roleNames');
let uid = storage.getItem('uid');
let orgId = storage.getItem('orgId');
let orgPath = storage.getItem('orgPath');
let orgName = storage.getItem('orgName');
let globalOcxPlayer = {};
let videoCount = 0; //产生的执法仪视频总个数
let allCount = 0; //总处理数
let untopFiveDF = [];
let untopTenDF = [];

export const name = 'ms-main-line-m'
let echartAllManager = {}; //为了处理切换模块时echart会乱，所以将所有echart放进一个对象里面，在切换模块时进行resize操作

avalon.component(name, {
    template: __inline("./mainLineManager.html"),
    defaults: {
        indexChange:indexChange,
        mainShow: true,
        changeBtnClick: function () {
            this.mainShow = !this.mainShow;
            if (this.mainShow) {
                for (let key in echartAllManager) {
                    echartAllManager[key].resize();
                }
            }
        },
        onReady() {
            $(".common-layout").css({
                "min-width": "1470px",
                "min-height": "1098px"
            });
            $(".ane-layout-fixed-footer").css({
                "display": 'none'
            });
            mainIndex.onReady();
            // OCX 站点信任弹窗
            if (mainIndex.is_IE)
                globalOcxPlayer = document.getElementById('gxxPlayOcx');
            else
                globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic');
            let data = {};
            data.action = 'InitDeviceSdk'; //初始化
            try {
                globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            } catch (e) {
                return;
            }

            data = {};
            data.action = 'IsTrustSite';
            data['arguments'] = {};
            data['arguments']['strIP'] = document.domain;
            let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            let ret_json = eval("(" + ret + ")");
            if (ret_json.code == 1) {
                // confirmVm.show = true;
                confirmVm.editOk(); // IP自动加入信任站点
            }

        },
        onDispose() {
            $(".common-layout").css({
                "min-width": "auto",
                "min-height": "auto"
            });
        }

    }
})

document.title = titleName;

let chromeDownloadUrl = '/static/GSBbrowser_chrome-3.3.1.7301.exe', // 谷歌浏览器下载地址
    firefoxDownloadUrl = '/static/GSBrowser_firefox-3.3.1.7301.exe', // 火狐浏览器下载地址
    defaultDownloadUrl = '',
    eggDownloadUrl = '';

switch (defaultBrowser) {
    case 0:
        defaultDownloadUrl = firefoxDownloadUrl;
        eggDownloadUrl = chromeDownloadUrl;
        break;
    case 1:
        defaultDownloadUrl = chromeDownloadUrl;
        eggDownloadUrl = firefoxDownloadUrl;
        break;
}

// 信任站点弹窗
let confirmVm = avalon.define({
    $id: 'confirm-ctl',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
    },
    // 确定
    editOk() {

        var data = {};
        data.action = 'SetTrustSite';
        data['arguments'] = {};
        data['arguments']['strIP'] = document.domain;
        let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
        let ret_json = eval("(" + ret + ")");

        if (ret_json.code != 0) {
            this.show = true;
        }
    }
});

// 信任站点弹窗innerVM
let confirmInnerVM = avalon.define({
    $id: 'confirm-ctl-inner',
    title: '提示',
    confirmMsg: '请使用管理员身份运行浏览器',
    // 取消
    editCancel() {
        confirmVm.show = false;
    }
});

let usageRateX = ['星期一', '', '星期三', '', '星期五', '', '星期日'];

let mainIndex = avalon.define({
    $id: 'main-index',
    showSysTog: false,
    is_IE: isIE_fuc(),
    titleName: titleName,
    roleNames: roleNames,
    eggDownloadUrl: eggDownloadUrl, // 彩蛋下载地址
    roleShow: false,
    //用户登录信息
    nowlogintime: 0,
    lastlogintime: 0,
    nowLonginIp: '',
    lastLonginIp: '',
    loginFailNum: 0,
    accountExpireNum: 0,
    passwordExpireNum: 1,
    //视频时长信息
    bz_spzsc: 0,
    bz_tpzs: 0,
    bz_ypzsc: 0,
    by_spzsc: 0,
    by_tpzs: 0,
    by_ypzsc: 0,
    bn_spzsc: 0,
    bn_tpzs: 0,
    bn_ypzsc: 0,
    //收据更新
    checkNum: 0,
    checkRate: 0,
    passNum: 0,
    passRate: 0,
    importPercent: 0,
    sumAvideoRate: 0, //24小时内视频导入率
    sumAafter24h: 0, //24小时后导入的视频数
    sumAbefore24h: 0, //24小时内导入数
    allRate: 0, //总关联率
    allMatchCount: 0, //总关联数
    unCount: 0, //未关联数
    topFive: [], //前五姓名
    topFiveDF: [], //前五得分
    topTen: [], //前十姓名
    topTenDF: [], //前十得分
    dates: ['本周', '本月', '本年'],
    weekClass: 'active',
    monthClass: '',
    yearClass: '',
    orderCenterClass: ['pop', 'dialog', 'hide'],
    accountDayShow: true,
    passwordDayShow: true,
    optionUsage: {
        tooltip: {
            formatter: weekFormatter
        },
        xAxis: {
            name: '星期',
            nameLocation: 'end',
            nameGap: 10,
            type: 'category',
            boundaryGap: true,//如果要刻度线与数据点对齐的话，那就为false，但是数据点会从0开始
            data: usageRateX,
            axisLine: {
                lineStyle: {
                    color: '#fff', //x轴的颜色
                }
            },
            axisTick: { //坐标轴刻度线
                show: false
            },
            axisLabel: { //坐标轴刻度标签
                show: true,
                color: '#a7ddff',
                fontSize: 14
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            name: '小时',
            nameLocation: 'end',
            nameGap: 15,
            type: 'value',
            boundaryGap: ['0%', '0%'],
            axisLine: {
                lineStyle: {
                    color: '#fff', //y轴的颜色
                },
                symbol: ['none', 'arrow'],
                symbolSize: [50, 50], //箭头的样式：宽度，高度
                symbolOffset: [0, 10], //箭头偏移的位置：起始箭头、末端箭头
            },
            axisTick: { //分割线
                show: false
            },
            axisLabel: { //坐标轴刻度标签
                show: true,
                color: '#fff',
                fontSize: 16
            },
            splitLine: {
                show: true,
                lineStyle: {
                    // 使用深浅的间隔色
                    type: 'dashed'
                }
            }
        },
        grid: { //  图表距边框的距离,可选值：'百分比'¦ {number}（单位px）
            x: 83,
            y: 75,
            x2: 40,
            y2: 62
        },
        series: [{
            name: '平均使用时长',
            data: [],
            type: 'line',
            symbol: 'circle', //折线点设置为实心点
            symbolSize: 6, //折线点的大小
            areaStyle: {
                normal: {
                    color: '#ffd36b',
                    opacity: 0.8
                }
            }, //折线下方填充
            itemStyle: {
                normal: {
                    color: '#fff',
                    lineStyle: {
                        color: '#fff'
                    },
                    label: {
                        show: false,
                        color: '#ffd36b',
                        fontSize: 18
                    },
                }
            },
        }],
    },
    optionCheckNum: {
        color: ['#a7ddff'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}"
        },
        series: [{
            name: '考核情况',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                value: 0,
                name: '考核数'
            }]
        }]
    },
    optionCheckRate: {
        color: ['#ffb400', '#151c40'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {d}%"
        },
        series: [{
            name: '考核情况',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                value: 0.00,
                name: '考核率'
            },
            {
                value: 100 - 0.00,
                name: '未考核率'
            }
            ]
        }]
    },
    optionPassNum: {
        color: ['#a7ddff'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}"
        },
        series: [{
            name: '考核情况',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                value: 0,
                name: '通过数'
            }]
        }]
    },
    optionPassRate: {
        color: ['#0fb516', '#151c40'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {d}%"
        },
        series: [{
            name: '考核情况',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                value: 0.00,
                name: '通过率'
            },
            {
                value: 100 - 0.00,
                name: '未通过率'
            }
            ]
        }]
    },
    optionPie: {
        title: {
            show: false,
            left: 70,
            top: 17,
            text: '及时导入率',
            textStyle: {
                color: '#ffffff',
                fontSize: 14
            }
        },
        tooltip: {
            show: true,
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} "
        },
        color: ['#15CBFF', '#FFB400'],
        calculable: false,
        series: [{
            name: '及时导入率',
            type: 'pie',
            radius: [80, 110],
            center: [198, 200],
            // roseType: 'radius',
            // width: '40%', // for funnel
            // max: 40, // for funnel
            itemStyle: {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                }
            },
            data: [{
                value: 0,
                name: '24小时内导入（个）'
            },
            {
                value: 0,
                name: '24小时后导入（个）'
            }

            ]
        }]
    },
    relevancePie: {
        tooltip: {
            show: true,
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}"
        },
        color: ['#3ACD89', '#FFB400'],
        calculable: false,
        series: [{
            name: '关联率',
            type: 'pie',
            radius: [80, 110],
            center: [198, 200],
            // minAngle: 40,
            // roseType: 'radius',
            // width: '40%', // for funnel
            // max: 40, // for funnel
            itemStyle: {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                }
            },
            data: [{
                value: 0,
                name: '已关联（个）'
            },
            {
                value: 0,
                name: '未关联（个）'
            }

            ]
        }]
    },
    topFiveChartOption: {
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            show: false,
            type: 'value',
            position: 'top'//X轴位置

        },
        yAxis: {
            show: false,
            type: 'category',
            data: [],
        },
        series: [{
            name: '得分',
            type: 'bar',
            stack: '总分',
            data: [],
            barWidth: 18, // 控制柱子的宽度
            barGap: '100%',/*多个并排柱子设置柱子之间的间距*/
            barCategoryGap: '100%',/*多个并排柱子设置柱子之间的间距*/
            itemStyle: {
                normal: {
                    color: '#4470E3',
                },
            },
        },
        {
            name: '失分',
            type: 'bar',
            stack: '总分',
            data: [],
            itemStyle: {
                normal: {
                    color: '#0a1238',
                }
            },
        }
        ]
    },
    topTenChartOption: {
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            show: false,
            type: 'value',
            position: 'top'//X轴位置

        },
        yAxis: {
            show: false,
            type: 'category',
            data: []
        },
        series: [{
            name: '得分',
            type: 'bar',
            stack: '总分',
            data: [],
            barWidth: 18, // 控制柱子的宽度
            barGap: '100%',/*多个并排柱子设置柱子之间的间距*/
            barCategoryGap: '100%',/*多个并排柱子设置柱子之间的间距*/
            itemStyle: {
                normal: {
                    color: '#4470E3',
                }
            },
        },
        {
            name: '失分',
            type: 'bar',
            stack: '总分',
            data: [],
            itemStyle: {
                normal: {
                    color: '#0a1238',
                }
            },
        }
        ]
    },
    onReady() {
        //用户登录信息
        let nowlogintime = storage.getItem('nowlogintime');
        this.nowlogintime = new Date(nowlogintime).Format("yyyy-MM-dd");
        let lastlogintime = storage.getItem('lastlogintime');
        if (lastlogintime == null || lastlogintime == "") {
            this.lastlogintime = '-';
        } else {
            this.lastlogintime = new Date(lastlogintime).Format("yyyy-MM-dd");
        }
        this.nowLonginIp = storage.getItem('nowLonginIp');
        this.lastLonginIp = storage.getItem('lastLonginIp') || '-';
        this.loginFailNum = storage.getItem('loginFailNum');
        this.accountExpireNum = storage.getItem('accountExpireNum');
        this.passwordExpireNum = storage.getItem('passwordExpireNum');
        if (this.accountExpireNum < 0) {
            this.accountExpireNum = '不限';
            this.accountDayShow = false;
        }
        if (this.passwordExpireNum < 0) {
            this.passwordExpireNum = '不限';
            this.passwordDayShow = false;
        }
        initPage();
    },
    timeSelect: "1",
    currentTimeText: '本周',
    todoClick(index) {
        let url,
            baseUrl = './zfsypsjglpt.html#!';
        let map = [
            {index: 0, hash: '/zfsypsjglpt-zfda-jqgl_gongan'},  // 警情管理
            {index: 1, hash: '/zfsypsjglpt-zfda-ajgl_gongan'}, // 案件管理
            {index: 2, hash: '/zfsypsjglpt-sypgl-zfjlysyp-main'}, // 执法仪媒体
        ];
        avalon.each(map, (key, val) => {
            if(val.index === index) {
                let time = this.currentTimeText;
                let obj = getUpdatedPostObjAndID(time);
                obj.orgName = orgName;
                time == '本年' && (obj.postObj.endTime = moment().endOf("year").format('x') * 1);
                let todos = {...obj, text: time, hash: val.hash};
                storage.setItem('todos', todos, 0.5);
                url = baseUrl + val.hash;
                window.location.href = url;
            }
        });
    },
    ulClick(event) {
        const self = this;
        let target = $(event.target);
        self.clearLiActive();
        let time = target.context.innerHTML;
        this.currentTimeText = time;
        switch (time) {
            case '本周': self.weekClass = 'active'; this.timeSelect = "1"; break;
            case '本月': self.monthClass = 'active'; this.timeSelect = "2"; break;
            case '本年': self.yearClass = 'active'; this.timeSelect = "3"; break;
            default: break;
        }
        let object = getUpdatedPostObjAndID(time);
        updateAll(object['postObj'], object['id']);
    },
    clearLiActive() {
        this.weekClass = '';
        this.monthClass = '';
        this.yearClass = '';
    },
    unrelatedJQ: 0, // 未关联警情数
    unrelatedAJ: 0, // 未关联案件数
    unmarkMedia: 0, // 未标注媒体数
    $computed: {
        isQianxinan() {
            return versionSelection === 'Qianxinan';
        }
    },
    // 获取待办事项
    updateBacklog(postObj) {
        ajax({
            url: '/gmvcs/audio/index/backlog?startTime='+ postObj.beginTime + '&endTime=' + postObj.endTime,
            method: 'get',
            data: null
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: '服务器后端错误，请联系管理员。',
                    title: '温馨提示'
                });
                return;
            }
            let data = result.data;
            this.unrelatedJQ = data.psCountByNoRelevance;
            this.unrelatedAJ = data.csCountByNoRelevance;
            this.unmarkMedia = data.fCountByNoLabel;
        });
    },
    updateUsageRate(postObj, id) {
        const self = this;
        postObj.returnType = id;
        ajax({
            url: '/gmvcs/stat/comprehensive/index/usage/rate',
            //url: url,
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: '温馨提示'
                });
                return;
            }
            let data = result.data;
            if (data == null) {
                return;
            }
            let usageRate = data.usageRate,
                usageRateSeries = [],
                usageRateX = [];
            for (let item in usageRate) {
                usageRateSeries.push(keep2point(usageRate[item]));
            }
            switch (id) {
                case 1:
                    usageRateX = getUsageRateXWeek(usageRateSeries);
                    self.optionUsage.xAxis.name = '星期';
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.tooltip.formatter = weekFormatter;
                    break;
                case 2:
                    usageRateX = getUsageRateXMon(usageRateSeries);
                    self.optionUsage.xAxis.name = '日期';
                    self.optionUsage.xAxis.axisLabel.show = false;
                    self.optionUsage.tooltip.formatter = monthFormatter;
                    break;
                case 3:
                    usageRateX = getUsageRateXYear(usageRateSeries);
                    self.optionUsage.xAxis.name = '月份';
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.tooltip.formatter = yearFormatter;
                    break;
                default:
                    break;
            }
            self.drawUsageRate(usageRateX, usageRateSeries);
        });
    },
    //考核情况
    updateCheckData(checkObj) {
        const self = this;
        delete checkObj.returnType;
        ajax({
            url: '/gmvcs/stat/comprehensive/index/check',
            //url: '../../mock/index-check.json',
            method: 'post',
            data: checkObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: '温馨提示'
                });
                return;
            }
            let data = result.data;
            if (data == null) {
                self.checkNum = 0;
                self.checkRate = formatZero();
                self.passNum = 0;
                self.passRate = formatZero();
            } else {
                self.checkNum = data.checkNum;
                self.checkRate = decChangeToPercent(data.checkRate);
                self.passNum = data.passNum;
                self.passRate = decChangeToPercent(data.passRate);
            }
            self.drawCheckNum();
            self.drawCheckRate();
            self.drawPassNum();
            self.drawPassRate();
        });
    },
    updateRelevanceData(postObj) {
        const self = this;
        delete postObj.returnType;
        ajax({
            url: '/gmvcs/stat/comprehensive/index/business/relevance',
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: '温馨提示'
                });
                return;
            }
            let data = result.data;
            if (data == null) {
                self.allRate = formatZero();
                self.allMatchCount = 0;
                self.unCount = 0;
            }else{
                allCount = data.allCount;
                self.allRate = num2Percent(data.allRate);
                self.allMatchCount = data.allMatchCount;
                self.unCount = allCount - self.allMatchCount;
            }
            self.drawRelevanceChart(); //关联率画图
        });
    },
    updateImportData(postObj) {
        const self = this;
        delete postObj.returnType;
        //本周数据请求
        ajax({
            url: '/gmvcs/stat/comprehensive/index/video/rate',
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: '温馨提示'
                });
                return;
            }
            let data = result.data;
            if (data == null) {
                return;
            }
            self.sumAbefore24h = data.sumAbefore24h;
            self.sumAafter24h = data.sumAafter24h;
            videoCount = data.videoCount;
            self.sumAvideoRate = num2Percent(data.sumAvideoRate);
            self.drawImportChart();
        });
    },
    updateTopFiveData(postObj) {
        const self = this;
        delete postObj.returnType;
        //个人排名数据请求
        ajax({
            // url: '/api/add_list',
            url: '/gmvcs/stat/comprehensive/index/person/sort',
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: '温馨提示'
                });
                return;
            }
             let data = result.data;
            if (data == null) {
                return;
            }
           /* let data = [{
                "userName": "李叔同",
                "df": "99.921",
            }, {
                "userName": "何晓婷",
                "df": "95.651",
            }, {
                "userName": "陈锦东",
                "df": "93.354",
            }, {
                "userName": "黄思琴",
                "df": "93.89",
            }, {
                "userName": "伍张权",
                "df": "90",
            }, {
                "userName": "林追",
                "df": "89",
            }, {
                "userName": "陈岚",
                "df": "89",
            }, {
                "userName": "包小松",
                "df": "87",
            }, {
                "userName": "周晶晶",
                "df": "84",
            }, {
                "userName": "高海",
                "df": "81",
            }];*/

            mainIndex.topFive = [];
            mainIndex.topTen = [];
            mainIndex.topFiveDF = [];
            mainIndex.topTenDF = [];
            for (var i = 0;i < data.length; i++) {
                data[i].df = parseInt(data[i].df);
            }

            let dataLength = data.length;
            // 判断排名情况数据是否超过5个
            if (dataLength >= 5) {
                for (var i = 0; i < 5; i++) {
                    let obj = {
                        userName: data[i].userName,
                        df: data[i].df,
                        index: i + 1
                    }
                    mainIndex.topFive.push(obj);
                    mainIndex.topFiveDF[i] = data[4 - i].df;
                    untopFiveDF[i] = 100 - mainIndex.topFiveDF[i];
                }
                for (var j = 5; j < data.length; j++) {
                    let objtmp = {
                        userName: data[j].userName,
                        df: data[j].df,
                        index: j + 1
                    }
                    mainIndex.topTen.push(objtmp);
                }
                for (var i = 0; i < dataLength - 5; i++) {
                    mainIndex.topTenDF[i] = data[5 + i].df;
                    untopTenDF[i] = 100 - mainIndex.topTenDF[i];
                }
                //将后六名数据倒序
                if (dataLength < 10) {
                    for (var k = 4; k > dataLength - 6; k--) {
                        mainIndex.topTenDF[k] = 0;
                        untopTenDF[k] = 0;
                    }
                }
                let tempDF = 0;
                for (var i = 0; i < 2; i++) {
                    tempDF = mainIndex.topTenDF[i];
                    mainIndex.topTenDF[i] = mainIndex.topTenDF[4 - i];
                    mainIndex.topTenDF[4 - i] = tempDF;
                    tempDF = untopTenDF[i];
                    untopTenDF[i] = untopTenDF[4 - i];
                    untopTenDF[4 - i] = tempDF;
                }

            }
            else if (dataLength > 0 && dataLength < 5) {
                for (var k = 4; k > dataLength - 1; k--) {
                    mainIndex.topFiveDF[k] = 0;
                    untopFiveDF[k] = 0;
                }
                for (var i = 0; i < dataLength; i++) {
                    let obj = {
                        userName: data[i].userName,
                        df: data[i].df,
                        index: i + 1
                    }
                    mainIndex.topFive.push(obj);
                    mainIndex.topFiveDF[i] = data[i].df;
                    untopFiveDF[i] = 100 - mainIndex.topFiveDF[i];
                }
                let tempDF = 0;
                for (var i = 0; i < 2; i++) {
                    tempDF = mainIndex.topFiveDF[i];
                    mainIndex.topFiveDF[i] = mainIndex.topFiveDF[4 - i];
                    mainIndex.topFiveDF[4 - i] = tempDF;
                    tempDF = untopFiveDF[i];
                    untopFiveDF[i] = untopFiveDF[4 - i];
                    untopFiveDF[4 - i] = tempDF;
                }
                for (var i = 5; i < 10; i++) {
                    mainIndex.topTenDF[i] = 0;
                    untopTenDF[i] = 0;
                }
            }
            else if (dataLength == 0) {
                mainIndex.topFive = [];
                mainIndex.topTen = [];
                mainIndex.topFiveDF = [0, 0, 0, 0, 0];
                mainIndex.topTenDF = [0, 0, 0, 0, 0];
                untopTenDF = [0, 0, 0, 0, 0];
                untopFiveDF = [0, 0, 0, 0, 0];
            }
            self.drawTopFiveChart(); //个人排名画图
        });
    },
    //使用率图
    drawUsageRate(usageRateX, usageRateSeries) { //使用率
        echartAllManager.chartUsage = echarts.init(document.getElementById('usage_rate'));
        this.optionUsage.xAxis.data = [];
        this.optionUsage.series[0].data = [];
        this.optionUsage.xAxis.data = usageRateX;
        this.optionUsage.series[0].data = usageRateSeries;
        echartAllManager.chartUsage.clear();
        echartAllManager.chartUsage.setOption(this.optionUsage, true);
        $(window).resize(() => {
            echartAllManager.chartUsage.resize();
        });
    },
    drawCheckNum() {
        echartAllManager.chartCheckNumber = echarts.init(document.getElementById('checkNumber'));
        this.optionCheckNum.series[0].data[0].value = this.checkNum;
        echartAllManager.chartCheckNumber.clear();
        echartAllManager.chartCheckNumber.setOption(this.optionCheckNum, true);
    },
    drawCheckRate() {
        echartAllManager.chartCheckRate = echarts.init(document.getElementById('checkRate'));
        this.optionCheckRate.series[0].data[0].value = this.checkRate;
        this.optionCheckRate.series[0].data[1].value = 100 - this.checkRate;
        echartAllManager.chartCheckRate.clear();
        echartAllManager.chartCheckRate.setOption(this.optionCheckRate, true);
    },
    drawPassNum() {
        echartAllManager.chartPassNum = echarts.init(document.getElementById('passNum'));
        this.optionPassNum.series[0].data[0].value = this.passNum;
        echartAllManager.chartPassNum.clear();
        echartAllManager.chartPassNum.setOption(this.optionPassNum, true);
    },
    drawPassRate() {
        echartAllManager.chartPassRate = echarts.init(document.getElementById('passRate'));
        this.optionPassRate.series[0].data[0].value = this.passRate;
        this.optionPassRate.series[0].data[1].value = 100 - this.passRate;
        echartAllManager.chartPassRate.clear();
        echartAllManager.chartPassRate.setOption(this.optionPassRate, true);
    },
    //画关联圆环图
    drawRelevanceChart() {
        echartAllManager.relevanceChart = echarts.init(document.getElementById('relevance_pie'));
        this.relevancePie.series[0].data[0].value = this.allMatchCount;
        this.relevancePie.series[0].data[1].value = this.unCount;
        echartAllManager.relevanceChart.clear();
        echartAllManager.relevanceChart.setOption(this.relevancePie);
    },
    // 画及时导入圆环图函数
    drawImportChart() {
        echartAllManager.myChart = echarts.init(document.getElementById('import_pie'));
        this.optionPie.series[0].data[0].value = this.sumAbefore24h;
        this.optionPie.series[0].data[1].value = this.sumAafter24h;
        echartAllManager.myChart.clear();
        echartAllManager.myChart.setOption(this.optionPie, true);
        if (versionSelection == "Qianxinan") {
            echartAllManager.myChart.on('click', function (params) {
                let obj = {
                    timeSelect: mainIndex.timeSelect,
                    typeSelect: params.dataIndex,
                };
                storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-main-homePage', obj);
                window.location.href = "./zfsypsjglpt.html#!/zfsypsjglpt-sypgl-zfjlysyp-main";
            });
        }
    },
    //画个人排名
    drawTopFiveChart() {
        echartAllManager.topFiveChart = echarts.init(document.getElementById('topfivechart'));
        echartAllManager.topTenChart = echarts.init(document.getElementById('toptenchart'));
        this.topFiveChartOption.series[0].data = this.topFiveDF;
        this.topFiveChartOption.series[1].data = untopFiveDF;
        this.topFiveChartOption.yAxis.data = this.topFiveDF;
        echartAllManager.topFiveChart.clear();
        echartAllManager.topFiveChart.setOption(this.topFiveChartOption);
        this.topTenChartOption.series[0].data = this.topTenDF;
        this.topTenChartOption.series[1].data = untopTenDF;
        this.topTenChartOption.yAxis.data = this.topTenDF;
        echartAllManager.topTenChart.clear();
        echartAllManager.topTenChart.setOption(this.topTenChartOption);
    },
    openOrderCenter() {
        downLoadVm.show = true;
    },
    //ie下新窗口自动全屏
    handleNewWindow(url) {
        var tmp = window.open(url, "_blank");
        tmp.moveTo(0, 0);
        tmp.resizeTo(screen.width, screen.height);
        tmp.focus();
        tmp.location = url;
    },
    bindModify() {
        // edit_pwd_vm.show = true;
        avalon.components['ms-header-operation'].defaults.changePwd.show = true;
    },
    bindLogout() {
        // logoutVM.show_logout = true;
        avalon.components['ms-header-operation'].defaults.logout_vm.show_logout = true;
    },
    // "?" 点击弹出弹窗
    questionClick() {
        questionVm.show = true;
    }
});

if (mainIndex.roleNames.length == 0) {
    roleNames.push(' - ');
}
if (mainIndex.roleNames.length > 1) {
    mainIndex.roleShow = true;
}

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

// "?" 弹窗
let questionVm = avalon.define({
    $id: 'question-ctl',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
    },
    // 确定
    editOk() {
        this.show = false;
    }
});

// "?" innerVM
let questionInnerVM = avalon.define({
    $id: 'question-ctl-inner',
    title: '下载中心 - 帮助说明'
});


// 下载中心弹窗
let downLoadVm = avalon.define({
    $id: 'confirm-downLoad',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
    }
});

let downLoadInnerVm = avalon.define({
    $id: 'download-inner',
    title: '下载中心',
    version: "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe",
    defaultDownloadUrl: defaultDownloadUrl, // 默认高新兴国迈安全浏览器下载地址
    iconDownLoad(event) {
        let target = event.target;
        if (target == undefined)
            return;
        if (target.tagName.toLowerCase() == 'i') {
            window.open(target.previousSibling.href, '_self');
        }
    },
    openDownLoadHelp() {
        notification.warn({
            message: '开发中...',
            title: '温馨提示'
        });
    },
});
/* 
 * 3.6版本的首页代码
 * 从这里开始
 */

//首页情况
function initPage() {
    //本周
    let objWeek = getUpdatedPostObjAndID('本周');
    getCase(objWeek['postObj'], "bz");
    //本月
    getCase(getUpdatedPostObjAndID('本月')['postObj'], "by");
    //本年
    getCase(getUpdatedPostObjAndID('本年')['postObj'], "bn");
    //初始化图表信息为本周的情况
    updateAll(objWeek['postObj'], objWeek['id']);
}

/**************************  ajax请求拿数据  ************************************/
function getCase(checkObj, time) {
    ajax({
        url: '/gmvcs/stat/comprehensive/index/part1',
        //url: '../../mock/index-part2.json',
        method: 'post',
        data: checkObj
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: result.msg,
                title: '温馨提示'
            });
            return;
        }
        let data = result.data;
        if (data == null) {
            return;
        }
        //本周情况
        if (time == "bz") {
            mainIndex.bz_spzsc = second2Hour(data.spzsc); //视频总时长
            mainIndex.bz_tpzs = data.tpzs; //图片总数
            mainIndex.bz_ypzsc = second2Hour(data.ypzsc); //音频总时长
        }
        //本月情况
        else if (time == "by") {
            mainIndex.by_spzsc = second2Hour(data.spzsc); //视频总时长
            mainIndex.by_tpzs = data.tpzs; //图片总数
            mainIndex.by_ypzsc = second2Hour(data.ypzsc); //音频总时长
        }
        //本年情况
        else {
            mainIndex.bn_spzsc = second2Hour(data.spzsc); //视频总时长
            mainIndex.bn_tpzs = data.tpzs; //图片总数
            mainIndex.bn_ypzsc = second2Hour(data.ypzsc); //音频总时长
        }
    });
}
// 秒转小时函数
function second2Hour(data) {
    data = data / 3600;
    data = data.toFixed(2);
    return data;
}
//小数转化百分率
function num2Percent(data) {
    data = data * 100;
    data = data.toFixed(2);
    return data;

}
//保留两位小数
function keep2point(data) {
    data = data / 3600;
    data = data.toFixed(2);
    return data;
}
//使用时长图表提示效果
//本月
function monthFormatter(a) {
    return (a['seriesName'] + '</br>' + (a['dataIndex'] + 1) + '号：' + a['value']);
}
//本周
function weekFormatter(a) {
    let weekTable = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
    return (a['seriesName'] + '</br>' + weekTable[a['dataIndex']] + '：' + a['value']);
}
//本年
function yearFormatter(a) {
    let yearTable = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return (a['seriesName'] + '</br>' + yearTable[a['dataIndex']] + '：' + a['value']);
}
function getUpdatedPostObjAndID(time) {
    let postObj = {
        beginTime: "2018-09-27T00:00:00.000Z",
        endTime: "2018-10-17T00:00:00.000Z",
        orgId: orgId,
        orgPath: orgPath,
        uid: uid
    }
    let curWeek = moment().isoWeekday(1).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).valueOf();//本周的星期一
    let endWeek = moment().endOf('week').add(1, 'd').format('x') * 1;//本周的星期日
    let curMonth = moment().dates(1).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).valueOf();//本月的1号
    let endMonth = moment().endOf('month').format('x') * 1;//月末
    let curYear = moment().dayOfYear(1).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //本年的1号
    let endYear = moment().endOf('year').format('x') * 1;//年末
    // let curTime = moment().set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).valueOf();//当前时间
    let id = 1;
    switch (time) {
        case '本周': id = 1; postObj.beginTime = curWeek; postObj.endTime = endWeek; break;
        case '本月': id = 2; postObj.beginTime = curMonth; postObj.endTime = endMonth; break;
        case '本年': id = 3; postObj.beginTime = curYear; postObj.endTime = endYear; break;
        default: break;
    }
    let returnObj = {
        postObj: postObj,
        id: id
    }
    return returnObj;
}
function updateAll(postObj, id) {
    mainIndex.updateUsageRate(postObj, id); //使用率
    mainIndex.updateCheckData(postObj);//更新考核情况的文字
    mainIndex.updateRelevanceData(postObj); //关联率数据更新
    mainIndex.updateImportData(postObj); //及时导入率更新
    mainIndex.updateTopFiveData(postObj); //个人排名情况
    if(mainIndex.isQianxinan) {
        mainIndex.updateBacklog(postObj); // 待办事项
    }
}
//把0转成0.00显示
function formatZero() {
    return 0.00.toFixed(2);
}
//有关率的保留四位小数点之后转成百分数
function decChangeToPercent(decimal) {
    return (Math.round(decimal * 10000) / 100).toFixed(2);
}
function getUsageRateXWeek(usageRateSeries) {
    let usageRateX = [];
    let table = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
    let len = usageRateSeries.length;
    for (let i = 0; i < len; i++) {
        usageRateX.push(table[i]);
    }
    //arr.splice(2,0,"William");
    if (len == 5) {
        usageRateX.splice(1, 0, "");
    } else if (len == 6) {
        usageRateX.splice(1, 0, "");
        usageRateX.splice(3, 0, "");
    } else {
        usageRateX = ['星期一', '', '星期三', '', '星期五', '', '星期日'];
    }
    return usageRateX;
}
function getUsageRateXMon(usageRateSeries) {
    let usageRateX = [];
    let len = usageRateSeries.length;
    for (let i = 0; i < len; i++) {
        usageRateX.push('');
    }
    return usageRateX;
}
function getUsageRateXYear(usageRateSeries) {
    let usageRateX = [];
    // let len = usageRateSeries.length;
    // for (let i = 0; i < len; i++) {
    //     usageRateX.push('');
    // }
    usageRateX = ['1月', ' ', '3月', ' ', '5月', ' ', '7月', ' ', '9月', ' ', '11月', ' '];
    return usageRateX;
}