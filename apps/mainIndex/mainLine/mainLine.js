import './mainLine.less'
import ajax from '/services/ajaxService.js';
import {
    notification
} from "ane";
import 'ane';
import {
    titleName,
    gxxOcxVersion,
    defaultBrowser,
    versionSelection
} from '/services/configService';
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

export const name = 'ms-main-line'
let echartAll = {}; //为了处理切换模块时echart会乱，所以将所有echart放进一个对象里面，在切换模块时进行resize操作

avalon.component(name, {
    template: __inline("./mainLine.html"),
    defaults: {
        mainShow: true,
        changeBtnClick: function () {
            this.mainShow = !this.mainShow;
            if (this.mainShow) {
                for (let key in echartAll) {
                    echartAll[key].resize();
                }
            }
        },
        onReady() {
            mainIndex.onReady();
            $(".common-layout").css({
                "min-width": "1560px",
                "min-height": "1098px"
            });
            $(".ane-layout-fixed-footer").css({
                "display": 'none'
            });

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
/****
 * 3.6 版本开始
 * 
 */
//初始化配置图表信息
let businessRelX = ['简易程序', '非现场处罚', '强制措施', '事故处理', '案件', '警情'];
let itemStyle = {
    normal: {
        label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
                let arrValue = params['data'];
                let obj = relevantMap.get(arrValue[0]);
                return (obj.name + '\n\n' + obj.percent + '%');
            },
            fontSize: 16,
            fontWeight: 'bold',
            color: '#131a3f',
        },
        color: function (params) {
            let arrValue = params['data'];
            let obj = relevantMap.get(arrValue[0]);
            return obj.color;
        },
        opacity: 0.8,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(128, 128, 128, 0.7)'
    }
}
let relevantMap = new Map();

let mainIndex = avalon.define({
    $id: 'main-index',
    is_IE: isIE_fuc(),
    titleName: titleName,
    roleNames: roleNames,
    eggDownloadUrl: eggDownloadUrl, // 彩蛋下载地址
    roleShow: false,
    /* 
     * 3.6版本的首页代码
     * 从这里开始
     */
    checkNum: 0,
    checkRate: 0.00,
    passNum: 0,
    passRate: 0.00,
    sumAafter24h: 0,
    sumAvideoRate: 0,
    zr_spzsc: 0, //视频总时长 
    zr_tpzs: 0, //图片总数 
    zr_ypzsc: 0, //音频总时长
    bz_spzsc: 0,
    bz_tpzs: 0,
    bz_ypzsc: 0,
    by_spzsc: 0,
    by_tpzs: 0,
    by_ypzsc: 0,
    nowlogintime: 0,
    lastlogintime: 0,
    nowLonginIp: '',
    lastLonginIp: '',
    loginFailNum: 0,
    accountExpireNum: 0,
    passwordExpireNum: 0,
    dates: ['昨日', '本周', '本月'],
    dateClass: 'active',
    weekClass: '',
    monthClass: '',
    orderCenterClass: ['pop', 'dialog', 'hide'],
    accountDayShow: true,
    passwordDayShow: true,
    //图表配置
    optionUsage: {
        // 自定义formatter函数
        tooltip: {
            formatter: yesFormatter
        },
        xAxis: {
            name: '时',
            nameLocation: 'end',
            nameGap: 10,
            type: 'category',
            boundaryGap: true, //如果要刻度线与数据点对齐的话，那就为false，但是数据点会从0开始
            data: ['0', '4', '8', '12', '16', '20'],
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
            name: '使用时长',
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
    optionBusiness: {
        // 自定义formatter函数
        tooltip: {
            formatter: function (a) {
                return (a['seriesName'] + '</br>' + a['name'] + '：' + a['value'] + '个');
            }
        },
        xAxis: {
            type: 'category',
            data: businessRelX,
            axisLabel: { //坐标轴刻度标签
                interval: 0,    //强制文字产生间隔
                rotate: 0, //文字显示不全 处理
                show: true,
                color: '#a7ddff',
                fontSize: 12
            },
            axisLine: {
                lineStyle: {
                    color: '#fff', //x轴的颜色
                }
            },
            axisTick: { //分割线
                show: false
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            name: '个',
            nameLocation: 'end',
            nameGap: 15,
            type: 'value',
            axisLabel: { //坐标轴刻度标签
                show: true,
                color: '#fff',
                fontSize: 16
            },
            axisLine: {
                lineStyle: {
                    color: '#fff', //y轴的颜色
                },
                symbol: ['none', 'arrow'],
                symbolSize: [5, 10], //箭头的样式：宽度，高度
                symbolOffset: [0, 0], //箭头偏移的位置：起始箭头、末端箭头
            },
            axisTick: { //分割线
                show: false
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
            x: 85,
            y: 75,
            x2: 40,
            y2: 62
        },
        series: [{
            name: '关联成功的业务数',
            data: [],
            type: 'bar',
            stack: 'data',
            //设置柱子的宽度
            barWidth: 40,
            //配置样式
            itemStyle: {
                //通常情况下：
                normal: {
                    //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: function (params) {
                        var colorList = ['#70e9ff', '#c470ff', '#ff8470', '#ffe270', '#70ff95', '#35A166'];
                        return colorList[params.dataIndex];
                    }
                }
            },
        }, {
            name: '未关联业务数',
            type: 'bar',
            stack: 'data',
            data: [],
            barWidth: 40,
            label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: function (params) { //格式化柱状图显示label
                        var dataValue0 = 0;
                        var dataValue1 = 0;
                        for (var i = 0; i < businessRelX.length; i++) {
                            if (params.name == businessRelX[i]) {
                                dataValue0 = mainIndex.optionBusiness.series[0].data[i];
                                dataValue1 = mainIndex.optionBusiness.series[1].data[i];
                            }
                        }
                        return dataValue0 + dataValue1;
                    },
                    color: '#fff',
                    fontSize: 18
                }
            },
            itemStyle: {
                //通常情况下：
                normal: {
                    //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: '#1c2551',
                }
            },
        }]
    },
    optionRelevantRate: {
        xAxis: {
            show: false,
            min: 0,
            max: 494
        },
        yAxis: {
            show: false,
            min: 0,
            max: 400,
        },
        grid: { //  图表距边框的距离,可选值：'百分比'¦ {number}（单位px）
            x: 0,
            y: 0,
            x2: 0,
            y2: 0
        },
        tooltip: {
            padding: 10,
            backgroundColor: '#222',
            borderColor: '#777',
            borderWidth: 1,
            formatter: function (a) {
                let arrValue = a['data'];
                let obj = relevantMap.get(arrValue[0]);
                return ('关联率' + '</br>' + obj.name + '：' + obj.percent + '%');
            }
        },
        series: [{
            type: 'scatter',
            itemStyle: itemStyle,
            data: [],
            symbolSize: function (data) {
                return data[2];
            }
        }]
    },
    optionCheckNum: {
        color: ['#a7ddff'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}个"
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
            formatter: "{a} <br/>{b}: {c}个"
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
    onReady() {
        //用户登录信息
        let nowlogintime = storage.getItem('nowlogintime');
        this.nowlogintime = new Date(nowlogintime).Format("yyyy-MM-dd");
        let lastlogintime = storage.getItem('lastlogintime');
        if (lastlogintime == null) {
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
    currentTimeText: '昨日',
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
                let todos = {...obj, text: time === '昨日' ? '本年' : time, hash: val.hash}; // 设置昨日为本年相当于是自定义时间
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
            case '昨日':
                self.dateClass = 'active';
                break;
            case '本周':
                self.weekClass = 'active';
                break;
            case '本月':
                self.monthClass = 'active';
                break;
            default:
                break;
        }
        let object = getUpdatedPostObjAndID(time);
        updateAll(object['postObj'], object['id']);
    },
    clearLiActive() {
        this.dateClass = '';
        this.weekClass = '';
        this.monthClass = '';
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
                usageRateSeries.push(secChangeToHour(usageRate[item]));
            }
            switch (id) {
                case 0:
                    usageRateX = ['0', '4', '8', '12', '16', '20'];
                    self.optionUsage.xAxis.name = "时";
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.tooltip.formatter = yesFormatter;
                    break;
                case 1:
                    usageRateX = getUsageRateXWeek(usageRateSeries);
                    self.optionUsage.xAxis.name = "星期";
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.tooltip.formatter = weekFormatter;
                    break;
                case 2:
                    usageRateX = getUsageRateXMon(usageRateSeries);
                    self.optionUsage.xAxis.name = "号";
                    self.optionUsage.xAxis.axisLabel.show = false;
                    self.optionUsage.tooltip.formatter = monthFormatter;
                    break;
                default:
                    break;
            }
            self.drawUsageRate(usageRateX, usageRateSeries);
        });
    },
    //业务关联情况
    updateBusinessRel(checkObj) {
        const self = this;
        delete checkObj.returnType;
        let businessBottom = [],
            businessTop = [],
            percentData = [];
        ajax({
            url: '/gmvcs/stat/comprehensive/index/business/relevance',
            //url: '../../mock/index-business-relevance.json',
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
            //添加案件 和 警情
            if (data == null) {
                self.accidentRate = formatZero(); //事故
                self.forceRate = formatZero(); //强制措施
                self.surveilRate = formatZero(); //非现场
                self.violationRate = formatZero(); //简易程序
                self.cmRate = formatZero(); //案件
                self.psRate = formatZero(); //警情
                businessBottom = [];
                businessTop = [];
                // percentData = [0, 0, 0, 0];
                percentData = [0, 0, 0, 0, 0, 0];
            } else {
                percentData = [data.violationRate, data.surveilRate, data.forceRate, data.accidentRate,data.cmRate,data.psRate];
                let violationMatchCount = data.violationMatchCount,
                    surveilMatchCount = data.surveilMatchCount,
                    forceMatchCount = data.forceMatchCount,
                    accidentMatchCount = data.accidentMatchCount,
                    psMatchCount = data.psMatchCount || 0,
                    cmMatchCount = data.cmMatchCount || 0;
                let violationCOunt = data.violationCOunt,
                    surveilCount = data.surveilCount,
                    forceCount = data.forceCount,
                    accidentCount = data.accidentCount,
                    psCount = data.psCount,
                    cmCount = data.cmCount;
                if (violationMatchCount || surveilMatchCount ||
                    forceMatchCount || accidentMatchCount ||
                    violationCOunt || surveilCount ||
                    forceCount || accidentCount ||
                    psCount || psMatchCount ||
                    cmCount || cmMatchCount) {
                    businessBottom.push(violationMatchCount);
                    businessBottom.push(surveilMatchCount);
                    businessBottom.push(forceMatchCount);
                    businessBottom.push(accidentMatchCount);
                    businessBottom.push(cmMatchCount);//案件
                    businessBottom.push(psMatchCount);//警情
                    businessTop.push(violationCOunt - violationMatchCount);
                    businessTop.push(surveilCount - surveilMatchCount);
                    businessTop.push(forceCount - forceMatchCount);
                    businessTop.push(accidentCount - accidentMatchCount);
                    businessTop.push(cmCount - cmMatchCount);//案件
                    businessTop.push(psCount - psMatchCount);//警情
                } else {
                    businessBottom = [];
                    businessTop = [];
                }
            }
            self.drawBusinessRel(businessBottom, businessTop);
            self.drawRelevantRate(percentData);
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
    //及时导入率
    updateImportRate(checkObj) {
        const self = this;
        delete checkObj.returnType;
        ajax({
            url: '/gmvcs/stat/comprehensive/index/video/rate',
            //url: '../../mock/index-video-rate.json',
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
            self.sumAafter24h = data.sumAafter24h;
            self.sumAvideoRate = decChangeToPercent(data.sumAvideoRate) + '%';
        });
    },
    drawUsageRate(usageRateX, usageRateSeries) { //使用时长
        echartAll.chartUsage = echarts.init(document.getElementById('usage_rate'));
        this.optionUsage.xAxis.data = [];
        this.optionUsage.series[0].data = [];
        this.optionUsage.xAxis.data = usageRateX;
        this.optionUsage.series[0].data = usageRateSeries;
        echartAll.chartUsage.clear();
        echartAll.chartUsage.setOption(this.optionUsage, true);
        $(window).resize(() => {
            echartAll.chartUsage.resize();
        });
    },
    drawBusinessRel(seriesBottom, seriesTop) { //业务关联情况
        echartAll.chartBusiness = echarts.init(document.getElementById('business_related'));
        this.optionBusiness.series[0].data = [];
        this.optionBusiness.series[1].data = [];
        this.optionBusiness.series[0].data = seriesBottom;
        this.optionBusiness.series[1].data = seriesTop;
        echartAll.chartBusiness.clear();
        echartAll.chartBusiness.setOption(this.optionBusiness, true);
    },
    drawRelevantRate(percentData) { //业务关联时长
        echartAll.chartRelevantRate = echarts.init(document.getElementById('relevantRate'));
        let relevantData = this.calcCircle(percentData, 496, 400);
        this.optionRelevantRate.series[0].data = [];
        this.optionRelevantRate.series[0].data = relevantData;
        relevantMap = this.updateMap(percentData, relevantData);
        echartAll.chartRelevantRate.clear();
        echartAll.chartRelevantRate.setOption(this.optionRelevantRate, true);
    },
    drawCheckNum() {
        echartAll.checkNumber = echarts.init(document.getElementById('checkNumber'));
        this.optionCheckNum.series[0].data[0].value = this.checkNum;
        echartAll.checkNumber.clear();
        echartAll.checkNumber.setOption(this.optionCheckNum, true);
    },
    drawCheckRate() {
        echartAll.chartCheckRate = echarts.init(document.getElementById('checkRate'));
        this.optionCheckRate.series[0].data[0].value = this.checkRate;
        this.optionCheckRate.series[0].data[1].value = 100 - this.checkRate;
        echartAll.chartCheckRate.clear();
        echartAll.chartCheckRate.setOption(this.optionCheckRate, true);
    },
    drawPassNum() {
        echartAll.chartPassNum = echarts.init(document.getElementById('passNum'));
        this.optionPassNum.series[0].data[0].value = this.passNum;
        echartAll.chartPassNum.clear();
        echartAll.chartPassNum.setOption(this.optionPassNum, true);
    },
    drawPassRate() {
        echartAll.chartPassRate = echarts.init(document.getElementById('passRate'));
        this.optionPassRate.series[0].data[0].value = this.passRate;
        this.optionPassRate.series[0].data[1].value = 100 - this.passRate;
        echartAll.chartPassRate.clear();
        echartAll.chartPassRate.setOption(this.optionPassRate, true);
    },
    //气泡图
    calcCircle(data, width, height) {
        const self = this;
        var maxR = Math.min(width, height) * 0.45;
        while (true) {
            var circles = self.testCircles(data, maxR, width, height);
            if (circles === false)
                maxR *= 0.8;
            else
                return circles;
        }
    },
    testCircles(data, maxR, width, height) {
        var gap = 4;
        var num = data.length;
        var rs = [];
        var res = [];
        var i, j, k;
        for (i = 0; i < num; i++) {
            var r = (data[i] + 1) * 0.5 * maxR;
            rs.push(r);
        }
        for (i = 0; i < num; i++) {
            for (j = 0; j < 1000; j++) {
                var x = rs[i] + 50 + Math.random() * (width - 2 * rs[i] - 100);
                var y = rs[i] + 50 + Math.random() * (height - 2 * rs[i] - 100);
                for (k = 0; k < i; k++) {
                    var dx = x - res[k][0],
                        dy = y - res[k][1];
                    if (Math.sqrt(dx * dx + dy * dy) < rs[i] + rs[k] + gap)
                        break;
                }
                if (k == i) {
                    res[i] = [x, y, rs[i] * 2];
                    break;
                }
            }
            if (j == 1000) return false;
        }
        return res;
    },
    updateMap(percentData, relevantData) {
        let map = new Map();
        let caseTable = ['简易程序', '非现场处罚', '强制措施', '事故处理', '案件', '警情'];
        let colorList = ['#70e9ff', '#c470ff', '#ff8470', '#ffe270', '#2DB261', '#D91742'];
        for (let i = 0, len = percentData.length; i < len; i++) {
            let obj = {
                name: caseTable[i],
                percent: decChangeToPercent(percentData[i]),
                color: colorList[i]
            }
            map.set(relevantData[i][0], obj);
        }
        return map;
    },
    openOrderCenter() {
        downLoadVm.show = true;
    },
    /** end */

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
}); //avalon定义结束

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

//初始化页面
function initPage() {
    //首页情况
    let objYes = getUpdatedPostObjAndID('昨日'),
        objWeek = getUpdatedPostObjAndID('本周'),
        objMon = getUpdatedPostObjAndID('本月');

    //昨日
    getCaseData(objYes['postObj'], objYes['id']);
    //本周
    getCaseData(objWeek['postObj'], objWeek['id']);
    //本月
    getCaseData(objMon['postObj'], objMon['id']);

    //初始化图表信息为昨日的情况
    updateAll(objYes['postObj'], objYes['id']);
}
/**************************  ajax请求拿昨日、本周、本月的数据  ************************************/
function getCaseData(checkObj, id) {
    ajax({
        url: '/gmvcs/stat/comprehensive/index/part1',
        //url: '../../mock/index-part1.json',
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
        let spzsc = secChangeToHour(data.spzsc), //视频总时长
            tpzs = data.tpzs, //图片总数
            ypzsc = secChangeToHour(data.ypzsc); //音频总时长
        switch (id) {
            case 0:
                mainIndex.zr_spzsc = spzsc;
                mainIndex.zr_tpzs = tpzs;
                mainIndex.zr_ypzsc = ypzsc;
                break;
            case 1:
                mainIndex.bz_spzsc = spzsc;
                mainIndex.bz_tpzs = tpzs;
                mainIndex.bz_ypzsc = ypzsc;
                break;
            case 2:
                mainIndex.by_spzsc = spzsc;
                mainIndex.by_tpzs = tpzs;
                mainIndex.by_ypzsc = ypzsc;
                break;
            default:
                break;
        }
    });
}
//使用时长图表提示效果
//本月
function monthFormatter(a) {
    return (a['seriesName'] + '</br>' + (a['dataIndex'] + 1) + '号：' + a['value'] + '小时');
}
//本周
function weekFormatter(a) {
    let weekTable = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
    return (a['seriesName'] + '</br>' + weekTable[a['dataIndex']] + '：' + a['value'] + '小时');
}
//昨日
function yesFormatter(a) {
    return (a['seriesName'] + '</br>' + a['name'] + '时：' + a['value'] + '小时');
}
//时长秒转换成小时（保留两位小数的四舍五入法）
function secChangeToHour(seconds) {
    return (Math.round((seconds / 3600) * 100) / 100).toFixed(2);
}
//有关率的保留四位小数点之后转成百分数
function decChangeToPercent(decimal) {
    return (Math.round(decimal * 10000) / 100).toFixed(2);
}
//把0转成0.00显示
function formatZero() {
    return 0.00.toFixed(2);
}
//使用时长图表横坐标
function getUsageRateXWeek(usageRateSeries) {
    let usageRateX = [];
    let table = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
    let len = usageRateSeries.length;
    for (let i = 0; i < len; i++) {
        usageRateX.push(table[i]);
    }
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

function getUpdatedPostObjAndID(time) {
    let postObj = {
        beginTime: "2018-09-27T00:00:00.000Z",
        endTime: "2018-10-17T00:00:00.000Z",
        orgId: orgId,
        orgPath: orgPath,
        uid: uid
    }
    let yesterStart = moment().subtract(1, 'days').set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //昨日开始时间
    let yesterEnd = moment().subtract(1, 'days').set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 0
    }).valueOf(); //昨日结束时间
    let curWeek = moment().isoWeekday(1).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //本周的星期一
    let curMonth = moment().dates(1).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //本月的1号
    // let curTime = moment().set({
    //     hour: 23,
    //     minute: 59,
    //     second: 59,
    //     millisecond: 0
    // }).valueOf(); //当前时间
    let endWeek = moment().endOf('week').add(1, 'd').format('x') * 1;//本周的星期日
    let endMonth = moment().endOf('month').format('x') * 1;//月末
    let id = 0;
    switch (time) {
        case '昨日':
            id = 0;
            postObj.beginTime = yesterStart;
            postObj.endTime = yesterEnd;
            break;
        case '本周':
            id = 1;
            postObj.beginTime = curWeek;
            postObj.endTime = endWeek;
            break;
        case '本月':
            id = 2;
            postObj.beginTime = curMonth;
            postObj.endTime = endMonth;
            break;
        default:
            break;
    }
    let returnObj = {
        postObj: postObj,
        id: id
    }
    return returnObj;
}

function updateAll(postObj, id) { //更新图表
    mainIndex.updateUsageRate(postObj, id); //更新使用使用时长
    mainIndex.updateBusinessRel(postObj); //更新业务关联情况
    mainIndex.updateCheckData(postObj); //更新考核情况的文字
    mainIndex.updateImportRate(postObj); //更新导入情况
    if(mainIndex.isQianxinan) {
        mainIndex.updateBacklog(postObj); // 待办事项
    }
}
//超出字数显示省略号
avalon.filters.wordlimit = function (numStr, wordlength) {
    numStr = numStr.toString();
    if (numStr.length > wordlength) {
        numStr = numStr.substr(0, 3) + '...';
    }
    return numStr;
}
/* end */