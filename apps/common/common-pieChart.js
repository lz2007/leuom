/*
 * @Author: linzhanhong 
 * @Date: 2018-12-27 15:51:38 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-08-07 15:13:41
 */

require('./common-pieChart.less');
let echarts = require("echarts/dist/echarts.min");
const storage = require('/services/storageService.js').ret;
import { store } from '/apps/common/common-store.js';
import { versionSelection } from '/services/configService';

export const name = 'ms-piechart';

avalon.component(name, {
    template: __inline('./common-pieChart.html'),
    defaults: {
        data: [],
        option: {
            echartsObj: {},
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            color: ['#15cbff', '#ffc14d', '#cccccc'],
            legend: {
                orient: 'vertical',
                x: '75%',
                y: '60%',
                data: [{
                        name: '',
                        icon: 'rect',
                        textStyle: {
                            color: '#000'
                        }
                    },
                    {
                        name: '',
                        icon: 'rect',
                        textStyle: {
                            color: '#000'
                        }
                    },
                    {
                        name: '',
                        icon: 'rect',
                        textStyle: {
                            color: '#000'
                        }
                    }
                ]
            },
            series: [{
                name: '',
                type: 'pie',
                radius: 100,
                center: ['50%', '50%'],
                label: {
                    normal: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [{
                        value: 0,
                        name: ''
                    },
                    {
                        value: 0,
                        name: ''
                    },
                    {
                        value: 0,
                        name: ''
                    }
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        },

        onInit(event) {
            let data = this.data.$model;
            
            this.option.series[0].name = data.data.title;

            avalon.each(this.option.series[0].data, (index, value) => {
                let dataNameList = data.data.dataName;
                value.name = dataNameList[index];
                this.option.legend.data[index].name = dataNameList[index];
                if (index == 0) {
                    value.value = data.data.pass;
                } else if (index == 1) {
                    value.value = data.data.unPass;
                } else if (index == 2) {
                    value.value = data.data.unCheck;
                }
            });
        },
        onReady(event) {
            let dom = event.target.children[2];
            let html = '';
            let leftInfo = this.data.leftInfo.$model;
            // 直接在HTML里面用ms-for遍历不能生成，所以用这个方法
            for(let i = 0; i < leftInfo.length; i++) {
                html += `<p><label>${leftInfo[i].title}：</label>${leftInfo[i].val}${i == 2 ? '' : '个'}</p>`
            }
            $(dom).html(html)
            this.echartsObj = echarts.init(event.target.children[1]);
            this.echartsObj.setOption(this.option);

            $(window).resize(() => {
                this.echartsObj.resize();
            });

            // 处理点击事件并且跳转到相应的页面
            this.echartsObj.on('click', function (params) {
                // 黔西南项目才跳转
                if(versionSelection !== 'Qianxinan')
                    return;
                if (params.seriesName !== '业务总数') {
                    let {name, seriesName} = params;
                    name = name === '未通过' ? '不通过' : name;
                    let hash = window.location.hash.replace('#!/', '');
                    let currentStorage = storage.getItem(hash);
                    store.dispatch({
                        type: "jdzxpt-kphczl-data",
                        data: $.extend({}, {name, seriesName, hash}, currentStorage)
                    });
                    let baseHash = '/jdzxpt-dxcc-',
                        hashMap = [
                            {key: 'jycx', val: '简易程序'},
                            {key: 'fxccf', val: '非现场处罚'},
                            {key: 'qzcs', val: '强制措施'},
                            {key: 'sgcl', val: '事故处理'},
                            {key: 'jq', val: '警情'}, 
                            {key: 'aj', val: '案件'}
                        ],
                        key = '';
                    avalon.each(hashMap, (index, value) => {
                        if(value.val === seriesName) {
                            key = value.key;
                        }
                    });
                    // 跳轉到定向抽查頁面
                    avalon.history.setHash(baseHash + key);
                }
            });
        },
        onDispose() {

        }
    }
});