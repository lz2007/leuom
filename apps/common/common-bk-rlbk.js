import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
// import moment from 'moment';
// let storage = require('/services/storageService.js').ret;
let echarts = require("echarts/dist/echarts.min");
require("/apps/sszhxt/znsb/sszhxt-znsb-rlbk-detail.less");
import '../common/common-ms-table';
import '/services/filterService';
import '../../vendor/jquery/jquery.SuperSlide.2.1.1';
let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');
require('/apps/common/common-bk-rlbk.less');
/*

 * 人脸布控
 * @type {string}  组件大小............cpbk或rlbk
  
*/
// ----人脸布控---------------------------------------

let sszhrlbk_vm = avalon.component('ms-bk-rlbk', {
    template: __inline('./common-bk-rlbk.html'),
    defaults: {
        $id: 'sszhrlbk',
        rlbkExtra_class: languageSelect == "en" ? true : false,
        rlbk_txt: getLanFace(),
        echart_option: {
            color: ['#c2c2c2', '#be3335'].reverse(),
            series: [{
                hoverAnimation: false,
                type: 'pie',
                radius: ['55%', '70%'],
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
                    value: 88.88
                },
                {
                    value: 11.12
                }
                ]
            }],
            graphic: [{
                id: 'percent_txt',
                type: 'text',
                style: {
                    text: '88.88%',
                    x: 52,
                    y: 70,
                    fill: '#be3335',
                    font: '14px "Microsoft YaHei", sans-serif'
                }
            }]
        },
        recognition_info: {},
        recognition_arr: [],
        scene_img: "",
        result_list: [],
        battery: 50,
        gbcode: '',
        data: {},
        noLocaltionInfo: '',
        executeControlClick: false,

        $computed: {
            width: function () {
                return this.battery / 100 * 29;
            }
        },

        show(data) {
            this.executeControlClick = false;
            this.data = data;
            this.noLocaltionInfo = '';
            if (!data.latitude || !data.longitude) {
                this.noLocaltionInfo = '无定位信息';
            }

            this.battery = data.battery;
            this.gbcode = data.gbcode;

            $('.sszhrlbk-wrap').css({
                'z-index': 9997,
                'width': 886,
                'height': 631
            });

            this.getRecognition(data.businessId);
        },

        getRecognition: function (recordID) {
            ajax({
                // url: '/api/getRec',
                url: `/gmvcs/instruct/face/monitoring/get/recognition?id=${recordID}`,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取人脸识别结果失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                this.scene_img = result.data.shootPersonImgFilePath;

                if (result.data.recogPersons.length == 0) {
                    notification.error({
                        message: '无法获取人脸识别结果列表，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                this.recognition_arr = result.data.recogPersons;
                this.recognition_info = this.recognition_arr[0];
                // _popover();

                echart = echarts.init(document.getElementById("show_percent"));
                sszhrlbk_vm.echart_option.series[0].data = [{
                    value: Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2)
                },
                {
                    value: (100 - Number(sszhrlbk_vm.recognition_info.similarity)).toFixed(2)
                }
                ];
                sszhrlbk_vm.echart_option.graphic[0].style.text = Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2) + "%";
                echart.setOption(sszhrlbk_vm.echart_option);

                let temp = [];
                for (let i = 0; i < sszhrlbk_vm.recognition_arr.length; i++) {
                    let obj = sszhrlbk_vm.recognition_arr[i];
                    obj.index = i;
                    if (languageSelect == "en")
                        obj.similarityTxt = "resemblance:";
                    else
                        obj.similarityTxt = "相似度：";

                    temp.push(obj);
                }
                this.result_list = temp;

                $(".comparison_result .result_list li").removeClass("select_li");
                $(".comparison_result .result_list li:eq(0)").addClass("select_li");

                jQuery(".comparison_result").slide({
                    titCell: ".control_bar ul",
                    mainCell: ".result_list",
                    autoPage: true,
                    effect: "left",
                    vis: 6,
                    pnLoop: false,
                    trigger: "click"
                });

                if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
                    $(".comparison_result .result_list").css({
                        "margin-left": "35px"
                    });
                }

                // $(".comparison_result .tempWrap").width($(".rlbk_detail_content").width() - 80);
            });
        },

        result_list_click(index) {
            this.recognition_info = this.recognition_arr[index];

            sszhrlbk_vm.echart_option.series[0].data = [{
                value: Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2)
            },
            {
                value: (100 - Number(sszhrlbk_vm.recognition_info.similarity)).toFixed(2)
            }
            ];
            sszhrlbk_vm.echart_option.graphic[0].style.text = Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2) + "%";
            echart.setOption(sszhrlbk_vm.echart_option);

            $(".comparison_result .result_list li").removeClass("select_li");
            $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
        },

        sphj() {
            sszhinfowindow.playVideo(this.data.gbcode, this.data.userName, this.data.userCode, this.data.signal, this.data.deviceName, this.data.mytype, sszhdeviceInfo.gbcodeArr);
        },

        bk() {
            let radius = bkfwVm.radius; // 布控范围半径
            if (!this.data.latitude || !this.data.longitude) {
                notification.warn({
                    title: '通知',
                    message: '该设备无定位信息，不能进行布控'
                });
                return;
            }
            ajax({
                url: '/gmvcs/instruct/track/gps/around/devices?lat=' + this.data.latitude + '&lon=' + this.data.longitude + '&radius=' + radius,
                method: 'get',
                data: null
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '服务器后端错误，请联系管理员。',
                        title: '通知'
                    });
                    return;
                }
                let data = result.data;

                this.executeControlClick = true;

                for (let i in data) {
                    if (data[i] == 'DSJ' && i != this.data.gbcode) { // TODO 暂时只做执法仪
                        let obj = {};
                        obj.gbcode = i;
                        obj.mytype = 0;
                        obj.checked = null;
                        vm.handleTreeCheck('', '', obj);
                    }
                }
                let circle = $('#mapIframe')[0].contentWindow.esriMap.createCircle({
                    longitude: this.data.longitude,
                    latitude: this.data.latitude
                }, radius);
                circle.id = this.data.userCode;
                circle.name = this.data.userName;
                circle.gbcode = this.data.gbcode;
                $('#mapIframe')[0].contentWindow.circleArr.push(circle);
                this.close_click();
            });
        },

        close_click() {
            $(".sszhrlbk-wrap").css({
                "z-index": "-1"
            });
        },
        onReady: function (event) {
            $('.sszhrlbk-wrap').css({
                'z-index': 9997,
                'width': 886,
                'height': 631
            });
        }
    }
});
// function getLan() {
//     return language_txt.sszhxt.sszhxt_sszh;
// }
function getLanFace() {
    return language_txt.sszhxt.sszhxt_znsb;
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