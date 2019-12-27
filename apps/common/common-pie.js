/**
 * 上传按钮组件
 * @prop  {Object}      pieObject        pie对象，内含元素如下：
 * @prop  {Boolean}     pieChangeData    监听option值改变
 * @example
 * ```
 * <ms-pie :widget="{pieObject:@pieObject, pieChangeData:@pieChangeData}"></ms-pie>
 * 
 * pieObject = {
 *     pieTitle: "工作站在线率",
 *     pieRate: "0.00%",
 *     topLabel: "在线总数",
 *     topTotal: 0,
 *     topColor: "#70e9ff",
 *     bottomLabel: "总数",
 *     bottomTotal: 0,
 *     bottomColor: "#111733",
 *     unit: "台",
 *     unitBackup: "人",---两组单位不同时才需要传进来
 * }
 * ```
 */

require('/apps/common/common-pie.less');
let echarts = require("echarts/dist/echarts.min");

avalon.component('ms-pie', {
    template: __inline('./common-pie.html'),
    defaults: {
        pieObject: avalon.noop,
        pieChangeData: avalon.noop,
        option: {
            color: ['#70e9ff', '#111733'],
            tooltip: {
                show: true,
                trigger: 'item',
                formatter: tooltipFormat
            },
            series: [{
                hoverAnimation: true,
                type: 'pie',
                radius: ['55%', '80%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: false,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [{
                        value: 0,
                        showTooltip: true,
                        name: "",
                        unit: "",
                    },
                    {
                        value: 0
                    }
                ]
            }],
            graphic: [{
                id: 'percent-txt',
                type: 'text',
                left: "center",
                top: "center",
                style: {
                    text: '0.00%',
                    fill: '#33414f',
                    font: '24px "Microsoft YaHei", sans-serif'
                }
            }]
        },

        onInit: function (event) {},
        onReady: function (e) {
            let echart = echarts.init(e.target.children[1]);
            this.option.color = [this.pieObject.topColor, this.pieObject.bottomColor];
            this.option.series[0].data[0].name = this.pieObject.topLabel;
            this.option.series[0].data[0].unit = this.pieObject.unit;
            this.pieObject.percentColor && (this.option.graphic[0].style.fill = this.pieObject.percentColor);
            this.pieObject.radius && (this.option.series[0].radius = this.pieObject.radius);

            echart.setOption(this.option.$model);

            this.$watch("pieChangeData", (v) => {
                if (this.pieObject.topTotal == "-") {
                    this.option.series[0].data[0].value = 0;
                    this.option.series[0].data[1].value = 0;
                    this.option.graphic[0].style.text = "-";
                    echart.setOption(this.option.$model);
                    return;
                }

                this.option.series[0].data[0].value = this.pieObject.topTotal;
                let temp = this.pieObject.bottomTotal - this.pieObject.topTotal;
                this.option.series[0].data[1].value = temp > 0 ? temp : 0;
                this.option.graphic[0].style.text = this.pieObject.pieRate;
                echart.setOption(this.option.$model);
            });
            // this.$fire('pieChangeData', this.pieChangeData);
        },
        onDispose: function () {}
    }
});

function tooltipFormat(el) {
    if (el.data.showTooltip) {
        return (el.name + "：" + el.value + el.data.unit);
    }
}

avalon.filters.numFilter = function (str) {
    if (str === '' || str === null) {
        return '0';
    } else {
        return str;
    }
};