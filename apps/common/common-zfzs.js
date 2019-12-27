import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import {
    versionSelection
} from '/services/configService';
let echarts = require("echarts/dist/echarts.min");
require('/apps/common/common-pie');
require('/apps/common/common-line');
require('../../vendor/qianxinan_map/map.plugin.js');

export const name = "ms-zfzs";
require("/apps/common/common-zfzs.less");
let mapJson;

switch (versionSelection) {
    case "Qianxinan":
        // mapJson = require('/vendor/QianXiNan').mapJson;
        mapJson = require('/vendor/qianxinan_map/tsconfig').tsconfig;
        break;
    case "Yunnan":
        mapJson = require('/vendor/zfzs_map/YunNan').mapJson;
        break;
    case "Kunming":
        mapJson = require('/vendor/zfzs_map/KunMing').mapJson;
        break;
    case "Hainan":
        mapJson = require('/vendor/zfzs_map/HaiNan').mapJson;
        break;
    default:
        mapJson = require('/vendor/zfzs_map/FuJian').mapJson;
        break;
}

let echart;
avalon.component(name, {
    template: __inline("./common-zfzs.html"),
    defaults: {
        versionSelection: versionSelection,
        resizeFlag: avalon.noop,
        zfzsList: [{
            id: 'allocate',
            index: 0,
            object: {
                pieTitle: "执法仪配备情况",
                pieRate: "0.00%",
                topLabel: "执法仪数量",
                topTotal: 0,
                topColor: "#ffe270",
                bottomLabel: "执法人数",
                bottomTotal: 0,
                bottomColor: "#111733",
                unit: "台",
                unitBackup: "人",
                percentColor: "#ffffff",
                radius: ['63%', '80%'],
            },
            selected: false,
            status: false,
        }, {
            id: 'data',
            index: 1,
            object: {
                pieTitle: "数据采集情况",
                pieRate: "0",
                topLabel: "数据采集",
                topTotal: 0,
                topColor: "#0fb516",
                bottomLabel: "总数",
                bottomTotal: 0,
                bottomColor: "#111733",
                unit: "个",
                percentColor: "#ffffff",
                radius: ['63%', '80%'],
            },
            selected: false,
            status: false,
        }, {
            id: 'fault',
            index: 2,
            object: {
                pieTitle: "采集工作站故障情况",
                pieRate: "0.00%",
                topLabel: "故障数量",
                topTotal: 0,
                topColor: "#ff8470",
                bottomLabel: "设备数量",
                bottomTotal: 0,
                bottomColor: "#111733",
                unit: "台",
                percentColor: "#ffffff",
                radius: ['63%', '80%'],
            },
            selected: false,
            status: false,
        }, {
            id: 'irregular',
            index: 3,
            object: {
                pieTitle: "不规范执法情况",
                pieRate: "0.00%",
                topLabel: "不规范执法业务数",
                topTotal: 0,
                topColor: "#c470ff",
                bottomLabel: "执法总数",
                bottomTotal: 0,
                bottomColor: "#111733",
                unit: "个",
                percentColor: "#ffffff",
                radius: ['63%', '80%'],
            },
            selected: false,
            status: false,
        }],
        listClick(e) {
            for (let i = 0; i < this.zfzsList.length; i++) {
                this.zfzsList[i].selected = false;
                if (i == e) {
                    this.zfzsList[i].selected = true;
                }
            }
            this.changeMapData(e);
        },

        tipsFormat: "",
        //选择左侧4项，请求后台接口，获取对应的数据
        changeMapData: function (e) {
            let url = "";
            switch (e) {
                case 1: //数据采集情况
                    url = "/gmvcs/stat/hg/count/sjcjqk/hotspot";
                    this.tipsFormat = "$1<br>数据采集数：$2个";
                    this.echartOption.tooltip.formatter = function (el) {
                        return el.name + "<br/>数据采集数：" + el.value + " 个";
                    };
                    // this.areaData = [
                    //     {"code": "522301", "count": 1},
                    //     {"code": "522322", "count": 2},
                    //     {"code": "522323", "count": 3},
                    //     {"code": "522326", "count": 4},
                    //     {"code": "522325", "count": 5},
                    //     {"code": "522324", "count": 7},
                    //     {"code": "522328", "count": 60},
                    //     {"code": "522327", "count": 26},
                    //     {"code": "522398", "count": 18}
                    // ];
                    // this.maxCount = 60;
                    break;
                case 2: //采集工作站故障情况
                    url = "/gmvcs/stat/leaderhomepage/ws/realtimefaults/part";
                    this.tipsFormat = "$1<br>采集工作站故障台数：$2台";
                    this.echartOption.tooltip.formatter = function (el) {
                        return el.name + "<br/>采集工作站故障台数：" + el.value + " 台";
                    };
                    // this.areaData = [
                    //     {"code": "522301", "count": 13},
                    //     {"code": "522322", "count": 46},
                    //     {"code": "522323", "count": 89},
                    //     {"code": "522324", "count": 87},
                    //     {"code": "522325", "count": 54},
                    //     {"code": "522326", "count": 21},
                    //     {"code": "522327", "count": 147},
                    //     {"code": "522328", "count": 58},
                    //     {"code": "522398", "count": 69}
                    // ];
                    // this.maxCount = 147;
                    break;
                case 3: //不规范执法情况
                    url = "/gmvcs/stat/hg/count/bgfzf/hotspot";
                    this.tipsFormat = "$1<br>不规范执法业务数：$2个";
                    this.echartOption.tooltip.formatter = function (el) {
                        return el.name + "<br/>不规范执法业务数：" + el.value + " 个";
                    };
                    // this.areaData = [
                    //     {"code": "522301", "count": 123},
                    //     {"code": "522322", "count": 456},
                    //     {"code": "522323", "count": 789},
                    //     {"code": "522324", "count": 987},
                    //     {"code": "522325", "count": 654},
                    //     {"code": "522326", "count": 321},
                    //     {"code": "522327", "count": 147},
                    //     {"code": "522328", "count": 258},
                    //     {"code": "522398", "count": 369}
                    // ];
                    // this.maxCount = 987;
                    break;
                default: //执法仪配备情况
                    // url = "/api/sjcjqk_hotspot";
                    url = "/gmvcs/stat/leaderhomepage/dsj/bindstat/part";
                    this.tipsFormat = "$1<br>执法仪台数：$2台";
                    this.echartOption.tooltip.formatter = function (el) {
                        return el.name + "<br/>执法仪台数：" + el.value + " 台";
                    };
                    // this.areaData = [
                    //     {"code": "522398", "count": 23},
                    //     {"code": "522322", "count": 63},
                    //     {"code": "522323", "count": 28},
                    //     {"code": "522324", "count": 9},
                    //     {"code": "522325", "count": 18},
                    //     {"code": "522326", "count": 94},
                    //     {"code": "522327", "count": 78},
                    //     {"code": "522328", "count": 25},
                    //     {"code": "522301", "count": 69}
                    // ];
                    // this.maxCount = 94;
                    break;
            }
            ajax({
                url: url,
                method: 'post',
                data: this.adcodeArr
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                let temp = {},
                    maxValue = 0;

                for (let i = 0; i < result.data.data.length; i++) {
                    temp[result.data.data[i].code] = result.data.data[i].count;
                    maxValue = (maxValue > result.data.data[i].count ? maxValue : result.data.data[i].count);
                }

                for (let j = 0; j < this.echartOption.series[0].data.length; j++) {
                    this.echartOption.series[0].data[j].value = temp[this.echartOption.series[0].data[j].adcode] || 0;
                }

                this.echartOption.visualMap.max = maxValue;
                this.maxCount = maxValue;
                if (versionSelection == "Qianxinan") {
                    this.areaData = result.data.data;
                    $('#qxn-map').mapTools(this.areaData, this.maxCount, {
                        tipsFormat: this.tipsFormat
                    });
                } else {
                    echart.setOption(this.echartOption);
                }
            });
        },

        maxCount: 0,
        areaData: [],

        echartOption: {
            tooltip: {},
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
            },
            visualMap: {
                type: "piecewise",
                min: 0,
                max: 600,
                text: ['高', '低'],
                realtime: false,
                calculable: true,
                right: 20,
                bottom: 20,
                inRange: {
                    color: ['#9cd0e8', '#b6d6a7', '#eec84a', '#e9a13d', '#df522b']
                },
                textStyle: {
                    color: '#ffffff',
                },
                itemWidth: 52,
                itemHeight: 20,
                itemGap: 6,
            },
            series: [{
                name: '热点地图',
                type: 'map',
                zoom: 1.2,
                mapType: "mapType", // 自定义扩展图表类型
                itemStyle: {
                    normal: {
                        label: {
                            show: true
                        }
                    },
                    emphasis: {
                        label: {
                            show: true
                        }
                    }
                },
                data: []
            }]
        },
        lineFlag: true,
        mapArr: [],
        adcodeArr: [],
        onInit() {
            let temp = [];
            for (let i = 0; i < mapJson.features.length; i++) {
                this.adcodeArr.push(mapJson.features[i].properties.adcode);
                let obj = {
                    adcode: mapJson.features[i].properties.adcode,
                    name: mapJson.features[i].properties.name,
                    value: 0,
                }
                temp.push(obj);
            }
            this.mapArr = temp;
        },
        getTotalFunction() { //总数统计
            //执法仪配备情况
            ajax({
                // url: '/api/bindstatAll',
                url: '/gmvcs/stat/leaderhomepage/dsj/bindstat/all',
                method: 'post',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                this.zfzsList[0].object.topTotal = result.data.dsjNum;
                this.zfzsList[0].object.bottomTotal = result.data.totalNum;
                this.zfzsList[0].object.pieRate = (result.data.rate * 100).toFixed(2) + "%";
                this.zfzsList[0].status = !this.zfzsList[0].status;
            });

            //数据采集情况
            ajax({
                // url: '/api/sjcjqk',
                url: '/gmvcs/stat/hg/count/sjcjqk',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                this.zfzsList[1].object.topTotal = result.data.sjcjqk;
                this.zfzsList[1].object.bottomTotal = result.data.sjcjqk;
                this.zfzsList[1].object.pieRate = result.data.sjcjqk;
                this.zfzsList[1].status = !this.zfzsList[1].status;
            });

            //采集工作站故障情况
            ajax({
                // url: '/api/realtimefaultsAll',
                url: '/gmvcs/stat/leaderhomepage/ws/realtimefaults/all',
                method: 'post',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                this.zfzsList[2].object.topTotal = result.data.faultNum || 0;
                this.zfzsList[2].object.bottomTotal = result.data.totalNum || 0;
                this.zfzsList[2].object.pieRate = result.data.rate ? (result.data.rate * 100).toFixed(2) + "%" : "0.00%";
                this.zfzsList[2].status = !this.zfzsList[2].status;
            });

            //不规范执法情况
            ajax({
                // url: '/api/bgfzf',
                url: '/gmvcs/stat/hg/count/bgfzf',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                this.zfzsList[3].object.topTotal = result.data.bgfyws;
                this.zfzsList[3].object.bottomTotal = result.data.zfzs;
                if (result.data.zfzs == 0) {
                    this.zfzsList[3].object.pieRate = "0.00%";
                } else {
                    this.zfzsList[3].object.pieRate = (result.data.bgfyws / result.data.zfzs * 100).toFixed(2) + "%";
                }
                this.zfzsList[3].status = !this.zfzsList[3].status;
            });

            //默认选中第一个，请求地图数据
            this.zfzsList[0].selected = true;
            this.changeMapData(0);
        },
        onReady() {
            this.lineFlag = true;
            $(window).on('resize', windowResize);

            let _this = this;

            if (versionSelection == "Qianxinan") {} else {
                echart = echarts.init(document.getElementById("show-map"));
                echarts.registerMap("mapType", mapJson);
                this.echartOption.series[0].data = this.mapArr;
                echart.setOption(_this.echartOption);
                // echart.on('click', function (params) {
                //     console.log(params);
                // });
            }

            //地图左侧数据获取
            this.getTotalFunction();

            //折线图数据获取
            this.lineChangeFunction(0);

            this.$watch("resizeFlag", (v) => {
                if (versionSelection == "Qianxinan" && !v) {
                    setTimeout(() => {
                        $('#qxn-map').mapTools(this.areaData, this.maxCount);
                    }, 500);
                }

                windowResize();
                this.lineFlag = !this.lineFlag;
            });
        },
        onDispose() {
            $(window).off('resize', windowResize);
        },

        zfzsLine: [{
            object: {
                lineTitle: "数据采集情况",
                xAxisObject: {
                    name: "星期",
                    data: ['一', '二', '三', '四', '五', '六', '日']
                },
                yAxisObject: {
                    name: "个",
                },
                areaStyle: {
                    lineColor: '#ffffff',
                    areaColor: '#ffd36b',
                    opacity: 0.8
                },
                seriesData: [0, 0, 0, 0, 0, 0, 0],
                textColor: "#ffffff",
                formatterFunction: function (el) {
                    return "数据采集个数：" + el.value + " 个";
                },
            },
            status: false,
        }, {
            object: {
                lineTitle: "采集工作站故障情况",
                xAxisObject: {
                    name: "星期",
                    data: ['一', '二', '三', '四', '五', '六', '日']
                },
                yAxisObject: {
                    name: "台",
                },
                areaStyle: {
                    lineColor: '#ffffff',
                    areaColor: '#ff8470',
                    opacity: 0.8
                },
                seriesData: [0, 0, 0, 0, 0, 0, 0],
                seriesName: "故障数量",
                totalData: {
                    name: '总数',
                    color: '#151c40',
                    data: [0, 0, 0, 0, 0, 0, 0]
                },
                textColor: "#ffffff",
                formatterFunction: function (el) {
                    if (el.data.total) {
                        return el.seriesName + "：" + el.data.total + " 台";
                    } else {
                        return el.seriesName + "：" + el.value + " 台";
                    }
                },
            },
            status: false,
        }, {
            object: {
                lineTitle: "不规范执法情况",
                xAxisObject: {
                    name: "星期",
                    data: ['一', '二', '三', '四', '五', '六', '日']
                },
                yAxisObject: {
                    name: "个",
                },
                areaStyle: {
                    lineColor: '#ffffff',
                    areaColor: '#c470ff',
                    opacity: 0.8
                },
                seriesData: [0, 0, 0, 0, 0, 0, 0],
                textColor: "#ffffff",
                formatterFunction: function (el) {
                    return "不规范执法个数：" + el.value + " 个";
                },
            },
            status: false,
        }],
        selectIndex: 0,
        selectClick(e) {
            this.selectIndex = e;
            this.lineChangeFunction(e);
        },

        //折线图数据
        getGraph: function (timer, index) { //数据采集(时间，图序号)----时间：[本周：1，本月：2，本年：3]  图序号：[图1：0；图3：2]  
            // let url = `/api/sjcjqkCurveGraph?returnType=${timer}`;
            let url = (index == 0 ? `/gmvcs/stat/hg/count/sjcjqk/curveGraph` : `/gmvcs/stat/hg/count/bgfzf/curveGraph`);
            ajax({
                url: url,
                method: 'post',
                data: {
                    "returnType": timer
                }
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }

                let xTemp = [],
                    yTemp = [];
                for (let i = 0; i < result.data.data.length; i++) {
                    xTemp.push(result.data.data[i].dayStr);
                    yTemp.push(result.data.data[i].count);
                }

                this.zfzsLine[index].object.xAxisObject.name = this.getUnitFunction(timer);
                this.zfzsLine[index].object.xAxisObject.data = xTemp; //---横坐标
                this.zfzsLine[index].object.seriesData = yTemp; //---对应值

                this.zfzsLine[index].status = !this.zfzsLine[index].status;
            });
        },
        getWorkstation: function (timer) { //采集工作站故障
            ajax({
                // url: `/api/wsFaultsW?returnType=${timer}`,
                url: `/gmvcs/stat/leaderhomepage/ws/faults`,
                method: 'post',
                data: {
                    "returnType": timer
                }
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }

                let xTemp = [],
                    yTemp = [],
                    total = [];

                for (let i = 0; i < result.data.fault.length; i++) {
                    xTemp.push(result.data.fault[i].xDayName);
                    yTemp.push(result.data.fault[i].yValue);
                }

                for (let i = 0; i < result.data.total.length; i++) {
                    let obj = {
                        value: 0,
                        total: result.data.total[i].yValue
                    }
                    total.push(obj);
                }
                this.zfzsLine[1].object.totalData.data = total;

                this.zfzsLine[1].object.xAxisObject.data = xTemp; //---横坐标
                this.zfzsLine[1].object.seriesData = yTemp; //---故障数量
                this.zfzsLine[1].object.xAxisObject.name = this.getUnitFunction(timer);
                for (let i = 0; i < this.zfzsLine[1].object.totalData.data.length; i++) {
                    this.zfzsLine[1].object.totalData.data[i].value = this.zfzsLine[1].object.totalData.data[i].total - this.zfzsLine[1].object.seriesData[i];
                }
                this.zfzsLine[1].status = !this.zfzsLine[1].status;
            });
        },
        getUnitFunction: function (e) { //获取横坐标单位
            if (e == "1") {
                return "星期";
            } else if (e == "2") {
                return "日期";
            } else if (e == "3") {
                return "月份";
            }
            return "";
        },
        lineChangeFunction: function (e) {
            switch (e) {
                case 1:
                    this.getGraph(2, 0); //---数据采集情况
                    this.getGraph(2, 2); //---不规范执法情况
                    this.getWorkstation(2); //---采集工作站故障情况
                    break;
                case 2:
                    this.getGraph(3, 0); //---数据采集情况
                    this.getGraph(3, 2); //---不规范执法情况
                    this.getWorkstation(3); //---采集工作站故障情况
                    break;
                default:
                    this.getGraph(1, 0); //---数据采集情况
                    this.getGraph(1, 2); //---不规范执法情况
                    this.getWorkstation(1); //---采集工作站故障情况
                    break;
            }
        },
    }
});

function windowResize() {
    if (versionSelection == "Qianxinan") {

    } else {
        echart.resize();
    }
}