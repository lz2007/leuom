/**
 * 上传按钮组件
 * @prop  {Object}      lineObject        line对象，内含元素如下：
 * @prop  {Boolean}     lineChangeData    监听option值改变
 * @example
 * ```
 * <ms-line :widget="{lineObject:@onlineRateLine, lineChangeData:@lineChangeData}"></ms-line>
 * 
 * lineObject = {
 *     lineTitle: "存储增长曲线（30天）",
 *     xAxisObject: {
 *         name: "天数",
 *         data: ['1', '5', '10', '15', '20', '25', '30']
 *     },
 *     areaStyle: {
 *         lineColor: '#ff8470',
 *         areaColor: '#ffd36b',
 *         opacity: 0.8
 *     },
 *     seriesData: [],  --- 增长曲线的点
 * }
 * ```
 */

require('/apps/common/common-line.less');
let echarts = require("echarts/dist/echarts.min");

avalon.component('ms-line', {
    template: __inline('./common-line.html'),
    defaults: {
        lineFlag: avalon.noop,
        lineObject: avalon.noop,
        lineChangeData: avalon.noop,
        option: {
            tooltip: {
                formatter: tooltipFormat
            },
            xAxis: {
                name: '',
                nameLocation: 'end',
                nameTextStyle: {
                    color: '#33414f',
                },
                type: 'category',
                data: [],
                axisLine: {
                    lineStyle: {
                        color: '#a7ddff', //y轴的颜色
                    },
                },
                axisTick: { //坐标轴刻度线
                    show: false
                },
                axisLabel: { //坐标轴刻度标签
                    show: true,
                    color: '#33414f',
                    fontSize: 13
                },
            },
            yAxis: {
                minInterval: 1,
                name: '百分率（%）',
                nameLocation: 'end',
                nameTextStyle: {
                    color: '#33414f',
                },
                type: 'value',
                // data: ['0%', '20%', '40%', '60%', '80%', '100%'],
                axisLine: {
                    lineStyle: {
                        color: '#a7ddff', //y轴的颜色
                    },
                },
                axisTick: { //分割线
                    show: false
                },
                axisLabel: { //坐标轴刻度标签
                    show: true,
                    color: '#33414f',
                    fontSize: 13,
                    formatter: function (value, index) {
                        if (value >= 1000000 && value < 100000000) {
                            value = value / 10000 + "万";
                        } else if (value >= 100000000 && value < 1000000000000) {
                            value = value / 100000000 + "亿";
                        } else if (value >= 1000000000000) {
                            value = value / 1000000000000 + "万亿";
                        }
                        return value;
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: ['#a7ddff']
                    }
                }
            },
            series: [{
                name: '存储增长曲线',
                data: [0, 0, 0, 0, 0, 0, 0],
                type: 'line',
                symbol: 'circle', //折线点设置为实心点
                symbolSize: 6, //折线点的大小
                areaStyle: { //折线下方填充
                    normal: {
                        color: '#ffd36b',
                        opacity: 0.8
                    }
                },
                stack: '总量',
                itemStyle: {
                    normal: {
                        color: '#ff8470',
                        lineStyle: {
                            color: '#ff8470'
                        }
                    }
                }
            }]
        },

        onInit: function (event) {},
        onReady: function (e) {
            let echart = echarts.init(e.target.children[1]);
            this.option.xAxis.name = this.lineObject.xAxisObject.name;
            this.option.xAxis.data = this.lineObject.xAxisObject.data;
            this.option.series[0].areaStyle.normal.color = this.lineObject.areaStyle.areaColor;
            this.option.series[0].areaStyle.normal.opacity = this.lineObject.areaStyle.opacity;
            this.option.series[0].itemStyle.normal.color = this.lineObject.areaStyle.lineColor;
            this.option.series[0].itemStyle.normal.lineStyle.color = this.lineObject.areaStyle.lineColor;
            if (this.lineObject.textColor) {
                this.option.xAxis.nameTextStyle = this.lineObject.textColor;
                this.option.xAxis.axisLabel.color = this.lineObject.textColor;
                this.option.xAxis.axisLine.lineStyle.color = this.lineObject.textColor;
                this.option.yAxis.nameTextStyle = this.lineObject.textColor;
                this.option.yAxis.axisLabel.color = this.lineObject.textColor;
                this.option.yAxis.axisLine.lineStyle.color = this.lineObject.textColor;
            }
            this.lineObject.seriesName && (this.option.series[0].name = this.lineObject.seriesName);
            (this.lineObject.yAxisObject && this.lineObject.yAxisObject.name) && (this.option.yAxis.name = this.lineObject.yAxisObject.name);
            this.lineObject.formatterFunction && (this.option.tooltip.formatter = this.lineObject.formatterFunction);

            echart.setOption(this.option);

            this.$watch("lineChangeData", (v) => {
                this.option.xAxis.name = this.lineObject.xAxisObject.name;
                this.option.xAxis.data = this.lineObject.xAxisObject.data;
                if ($.isEmptyObject(this.lineObject.seriesData)) {
                    this.option.series[0].data = [0, 0, 0, 0, 0, 0, 0];
                    echart.setOption(this.option);
                    return;
                }
                if (this.lineObject.totalData) {
                    this.option.yAxis.max = 5;
                    for (let i = 0; i < this.lineObject.totalData.data.length; i++){
                        if (this.lineObject.totalData.data[i].total > 5) {
                            this.option.yAxis.max = null;
                            break;
                        }
                    }
                    this.option.series[0].data = this.lineObject.seriesData;
                    this.option.series[1] = {
                        name: this.lineObject.totalData.name,
                        data: this.lineObject.totalData.data,
                        type: 'line',
                        symbol: 'circle', //折线点设置为实心点
                        symbolSize: 6, //折线点的大小
                        areaStyle: { //折线下方填充
                            normal: {
                                color: this.lineObject.totalData.color,
                                opacity: 0.8
                            }
                        },
                        stack: '总量',
                        itemStyle: {
                            normal: {
                                color: this.lineObject.areaStyle.lineColor,
                                lineStyle: {
                                    color: this.lineObject.areaStyle.lineColor
                                }
                            }
                        }
                    };
                    echart.setOption(this.option);
                    return;
                }
                if (Math.max.apply(null, this.lineObject.seriesData) < 5) {
                    this.option.yAxis.max = 5;
                } else {
                    this.option.yAxis.max = null;
                }
                // let temp = [];
                // for (let key in this.lineObject.seriesData) {
                //     if (key != "0") {
                //         let j = (this.lineObject.seriesData[key] / this.lineObject.seriesData[0] * 100).toFixed(2);
                //         temp.push(j);
                //     }
                // }
                this.option.series[0].data = this.lineObject.seriesData;
                echart.setOption(this.option);
            });
            // this.$fire('lineChangeData', this.lineChangeData);

            $(window).resize(() => {
                echart.resize();
            });

            this.$watch('lineFlag', (v) => {
                echart.resize();
            });
        },
        onDispose: function () {}
    }
});

function tooltipFormat(el) {
    return ("存储使用率：" + el.data + "%");
}