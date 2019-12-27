import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
// import moment from 'moment';
// let storage = require('/services/storageService.js').ret;
// let echarts = require("echarts/dist/echarts.min");
require("/apps/sszhxt/znsb/sszhxt-znsb-rlbk-detail.less");
import '../common/common-ms-table';
import '/services/filterService';
import '../../vendor/jquery/jquery.SuperSlide.2.1.1';
let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');
require('/apps/common/common-comparsion-result.less');
/*

 * 图片轮转对比
 * @width {string}  组件大小............290px
  
*/
let rlbk_detail_vm, echart, rlbk_map;
avalon.component('ms-comparsion-result', {
    template: __inline('./common-comparsion-result.html'),
    defaults: {
        //中英文翻译 zhcn or en
        extra_class: languageSelect == "en" ? true : false,
        rlbk_detail_txt: getLan(),
        result_txt: getLan().resemblance,

        width: avalon.noop,
        type: avalon.noop,//车牌布控 或 人脸布控
        regMessage:avalon.noop,
        id:　'',
        title: '',

        recognition_info: {},
        recognition_arr: [],
        scene_img: "",
        result_list: [],

        setMap(lon, lat) {
            rlbk_map.esriMap.clearDrawLayer();
            rlbk_map.esriMap.setMapCenter(lon, lat, 12);
            rlbk_map.esriMap.addPictureMarker(lon, lat, rlbk_map.locationSymbol, null);
        },
        pollGetMapLoadStatus(lon, lat) {
            let _this = this;
            _this.timer = setInterval(() => {
                if (rlbk_map.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.setMap(lon, lat);
                }
            }, 200);
        },
        result_list_click(index) {
            this.recognition_info = this.recognition_arr[index];

            // rlbk_detail_vm.echart_option.series[0].data = [{
            //         value: Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2)
            //     },
            //     {
            //         value: (100 - Number(rlbk_detail_vm.recognition_info.similarity)).toFixed(2)
            //     }
            // ];
            // rlbk_detail_vm.echart_option.graphic[0].style.text = Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2) + "%";
            // echart.setOption(rlbk_detail_vm.echart_option);

            $(".comparison_result .result_list li").removeClass("select_li");
            $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
        },
        nextIndex: 0,
        clickPre:avalon.noop,
        clickNext: avalon.noop,
        //下一个
        onNext() {
            //index是页码
            let index = this.nextIndex + 1;
            if (index > rlbk_detail_vm.recognition_arr.length - 1) {//最后一个
                this.nextIndex = (index >= rlbk_detail_vm.recognition_arr.length-1 ? rlbk_detail_vm.recognition_arr.length-1 : index);
                return;
            }
            let curObj = {};//当前图片对象
            if (rlbk_detail_vm.recognition_arr) {
                index = this.nextIndex = (index >= rlbk_detail_vm.recognition_arr.length-1 ? rlbk_detail_vm.recognition_arr.length-1 : index);
                curObj = rlbk_detail_vm.recognition_arr[index];
            }
            
            $(".comparison_result .result_list li").removeClass("select_li");
            $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
            this.clickNext;
        },
        //上一个
        onPre() {
            //index是页码
            let index = this.nextIndex-1;
            if (index < 0) {//第一个
                this.nextIndex = 0;
                return;
            }
            index = (index < 0 ? 0 : index);
            
            let curObj = {};//当前图片对象
            if (rlbk_detail_vm.recognition_arr) {
                this.nextIndex=index;
                curObj = rlbk_detail_vm.recognition_arr[index];
            }
            $(".comparison_result .result_list li").removeClass("select_li");
            $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
            this.clickPre;
        },
        onInit: function (event) {
            rlbk_detail_vm = event.vmodel;
        },
        onReady: function (event) {
            let recordID = 'GMF0000000020181010150014ffdffffde';//storage.getItem('sszhxt-znsb-rlbk-recordID');

            let img_num = Math.floor(($(".rlbk_detail_content").width() - 80) / 135);
            $(window).on('resize', resizeFuc);

            setTimeout(() => {
                rlbk_map = $('#mapIframe')[0].contentWindow;
            }, 200);

            let urlStr = '';
            if (this.type=='cpbk') {
                urlStr = '/api/getRec';
            }else{
                urlStr = `/gmvcs/instruct/face/monitoring/get/recognition?id=${recordID}`;
            }
            
            ajax({
                url: urlStr,
                // url: `/gmvcs/instruct/face/monitoring/get/recognition?id=${recordID}`,
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

                setTimeout(() => {
                    if (rlbk_map.loadMapCompelete) {
                        this.setMap(result.data.longitude, result.data.latitude);
                    } else {
                        this.pollGetMapLoadStatus(result.data.longitude, result.data.latitude);
                    }
                }, 500);

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

                // echart = echarts.init(document.getElementById("show_percent"));
                // rlbk_detail_vm.echart_option.series[0].data = [{
                //         value: Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2)
                //     },
                //     {
                //         value: (100 - Number(rlbk_detail_vm.recognition_info.similarity)).toFixed(2)
                //     }
                // ];
                // rlbk_detail_vm.echart_option.graphic[0].style.text = Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2) + "%";
                // echart.setOption(rlbk_detail_vm.echart_option);

                let temp = [];
                for (let i = 0; i < rlbk_detail_vm.recognition_arr.length; i++) {
                    let obj = rlbk_detail_vm.recognition_arr[i];
                    obj.index = i;
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
                    vis: img_num,
                    pnLoop: false,
                    trigger: "click"
                });

                if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
                    $(".comparison_result .result_list").css({
                        "margin-left": "40px"
                    })
                }

                $(".comparison_result .tempWrap").width($(".common-comparsion-result").width() - 80);
            });
        },
        onDispose: function (event) {
            if (rlbk_map.loadMapCompelete) {
                rlbk_map.esriMap.clearDrawLayer();
                rlbk_map.esriMap.setMapCenter(113.26436, 23.12908, 6);
            }
        }
    }
});

function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}
function resizeFuc() {
    if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
        let img_num = Math.floor(($(".common-comparsion-result").width() - 80) / 135);
        jQuery(".comparison_result").slide({
            titCell: ".control_bar ul",
            mainCell: ".result_list",
            autoPage: true,
            effect: "left",
            vis: img_num,
            pnLoop: false,
            trigger: "click"
        });
    } else
        $(".comparison_result .tempWrap").width($(".common-comparsion-result").width() - 80);
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