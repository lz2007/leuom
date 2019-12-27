import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
import * as menuServer from '/services/menuService';
export const name = "zfsypsjglpt-znsb-rzhy-detail";
require("./zfsypsjglpt-znsb-rzhy-detail.less");
import '/apps/common/common-ms-table';
import '/services/filterService';
import '/vendor/jquery/jquery.SuperSlide.2.1.1'
require('/apps/common/common-comparisonInfo');
let language_txt = require('/vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

let rzhy_detail_vm, mapObject, recordObj, locationArr;
avalon.component(name, {
    template: __inline("./zfsypsjglpt-znsb-rzhy-detail.html"),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        rzhy_detail_txt: getLan(),
        result_txt: getLan().resemblance,

        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0
        },
        page_type: false, //false 显示总条数; true 显示大于多少条
        handlePageChange(currentPage) {
            this.change_page = true;
            this.table_pagination.current = currentPage;
            this.loading = true;
            this.getTableList();
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },

        //表格
        table_list: [],
        search_data: {},
        loading: false,
        setMap(lon, lat, number) {
            // mapObject.esriMap.clearDrawLayer();
            // mapObject.esriMap.setMapCenter(lon, lat, 12);
            // mapObject.esri;
            // mapObject.locationSymbol = mapObject.esriMap.createPicSymbol(35, 50, "/static/image/zfsypsjglpt/zn_local_number.png"); //数字是1，2是图片宽和高
            // let font2 = new mapObject.esri.symbols.Font().setSize("16px").setFamily("微软雅黑");
            // let txtNumLeft = -5 * number.toString().length; //三位数的时候是-15，两位数的时候是-10，一位数的时候是-5
            // let textSymbol2 = new mapObject.esri.symbols.TextSymbol(number).setFont(font2).setColor(new mapObject.esri.Color([16, 85, 179, 1])).setOffset(txtNumLeft, 23).setAlign(mapObject.esri.symbol.TextSymbol.ALIGN_START);
            // let pic = mapObject.esriMap.addPictureMarker(lon, lat, mapObject.locationSymbol, null);
            // let num = mapObject.esriMap.addPictureMarker(lon, lat, textSymbol2, null);
            // let obj = {
            //     'id': number,
            //     'mapInfo': [pic, num]
            // };
            // locationArr.push(obj);
            mapObject.esriMap.setMapCenter(lon, lat, 12);
            let markerPt = mapObject.esriMap.addTextPicMarker(lon, lat, number, null);
            let obj = {
                'id': number,
                'mapInfo': [markerPt.num, markerPt.pic]
            };
            locationArr.push(obj);
        },
        pollGetMapLoadStatus(lon, lat, number) {
            let _this = this;
            _this.timer = setInterval(() => {
                if (mapObject.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.setMap(lon, lat, number);
                }
            }, 200);
        },
        delLocalInfo(number) {
            let delObj = [];
            for (let i = 0; i < locationArr.length; i++){
                if (locationArr[i].id === number) {
                    delObj = locationArr[i].mapInfo;
                    locationArr.splice(i, 1);
                    --i;
                }
            }
            avalon.each(delObj, function (index, el) {
                mapObject.esriMap.removePictureMarker(el);
            });
        },
        positionTips: false, //无定位信息 标识
        positionNumber: '无',

        actions(type, text, record, index) {
            if (type == "check") {
                if (mapObject.loadMapCompelete) {
                    //判断是否有定位信息
                    if (record.longitude && record.latitude) {
                        rzhy_detail_vm.setMap(record.longitude, record.latitude, record.table_index);
                        $('#check-' + record.table_index).css('display', 'none');
                        $('#del-' + record.table_index).css('display', 'inherit');
                    } else {
                        rzhy_detail_vm.positionTips = true; //暂无定位提示
                        rzhy_detail_vm.positionNumber = record.table_index;
                    }
                } else {
                    rzhy_detail_vm.pollGetMapLoadStatus(record.longitude, record.latitude, record.table_index);
                }
            } else if (type == "del") {
                // mapObject.esriMap.clearDrawLayer();
                rzhy_detail_vm.delLocalInfo(record.table_index);
                $('#del-' + record.table_index).css('display', 'none');
                $('#check-' + record.table_index).css('display', 'inherit');
            }
        },
        recognition_info: {}, //智能识别  html信息对象
        recognition_arr: [],
        scene_img: "",
        result_list: [],
        echart_option: {
            color: ['#ffffff', '#30ff00'].reverse(),
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
                    fill: '#fff',
                    font: '18px "Microsoft YaHei", sans-serif'
                }
            }]
        },
        // 历史记录
        getTableList() {
            let ajax_data = {
                "idCard": recordObj.personCertificateId,
                "page": 0,
                "pageSize": this.table_pagination.pageSize
            };

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else {
                this.search_data = ajax_data;
            }

            ajax({
                // url: '/api/getCarLog',
                url: '/gmvcs/instruct/idcard/monitoring/search/recognition/log',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;
                    return;
                }

                if (!this.change_page) {
                    this.table_pagination.current = 1;
                }

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "警员" : "辅警"; //人员类别
                    ret_data[index].name_id = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].time = moment(item.shootTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
                });

                if (result.data.overLimit) {
                    this.page_type = true;
                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                } else {
                    this.page_type = false;
                    this.table_pagination.total = result.data.totalElements; //总条数
                }

                this.table_list = ret_data;
                this.loading = false;
            });
        },
        log_Authority: false,
        onInit(e) {
            rzhy_detail_vm = e.vmodel;
            locationArr = []; //初始化
            setTimeout(() => {
                mapObject = $('#mapIframe')[0].contentWindow;
            }, 200);

            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZNSB_RZHY/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZNSB_RZHY_LSJL":
                            rzhy_detail_vm.log_Authority = true;
                            break;
                    }
                });
            });

            recordObj = storage.getItem('zfsypsjglpt-znsb-rzhy-recordID');
            ajax({
                // url: '/api/getCarRec',
                url: `/gmvcs/instruct/idcard/monitoring/get/recognition?id=${recordObj.id}`,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取人脸识别结果详情失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }
                // personIDcardImgFilePath//身份证
                // shootPersonImgFilePath//现场
                rzhy_detail_vm.recognition_info = result.data;
                rzhy_detail_vm.scene_img = result.data.shootPersonImgFilePath;
                rzhy_detail_vm.echart_option.series[0].data = [{
                        value: Number(rzhy_detail_vm.recognition_info.personSimilarity).toFixed(2)
                    },
                    {
                        value: (100 - Number(rzhy_detail_vm.recognition_info.personSimilarity)).toFixed(2)
                    }
                ];
                rzhy_detail_vm.echart_option.graphic[0].style.text = result.data.personIsConsistent ? "一致" : "不一致";
                rzhy_detail_vm.echart_option.color = result.data.personIsConsistent ? ['#ffffff', '#30ff00'].reverse() : ['#ffffff', '#FF363A'].reverse();
                avalon.components['ms-comparisonInfo'].defaults.echartInit();

                if (rzhy_detail_vm.log_Authority) { //判断日志权限
                    this.getTableList();
                }

            });
        },
        onReady() {
            $(document.body).css({
                "min-height": "681px"
            });
            if (mapObject) {
                mapObject.esriMap.clearDrawLayer(); //初始化页面
            }
            $(window).on('resize', resizeFuc);
            $('.zfsypsjglpt-map').css({
                'position': 'absolute',
                'width': 'auto',
                'left': '210px',
                'right': '20px',
                'height': '392px',
                'bottom': '8px',
                'top': '180px'
            });
            //F5刷新 回到表格页面
            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    avalon.history.setHash("/zfsypsjglpt-znsb-rzhy");
                }
            });
        },

        onDispose() {
            $(document.body).css({
                "min-height": "550px"
            });
            $('.zfsypsjglpt-znsb-rzhy-map').css({
                'width': '0',
                'height': '0',
                'overflow': 'hidden'
            });
            $(window).off('resize', resizeFuc);
            mapObject.esriMap.clearDrawLayer(); //初始化页面
        },
        returnBtn() {
            $(window).off('resize', resizeFuc);

            $('.zfsypsjglpt-znsb-rzhy-map').css({
                'width': '0',
                'height': '0',
                'overflow': 'hidden'
            });
            avalon.history.setHash("/zfsypsjglpt-znsb-rzhy");
        }
    }
});

// ------------function---------------
function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}

function resizeFuc() {
    if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
        let img_num = Math.floor(($(".rzhy_detail_content").width() - 80) / 135);
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
        $(".comparison_result .tempWrap").width($(".rzhy_detail_content").width() - 80);
}

/*================== 弹出tooltips start =============================*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function () {
            let html = "";
            if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
            else if ($(this)[0].outerHTML.indexOf("data-title-img-five") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-five") + 21, $(this)[0].outerHTML.indexOf("data-title-img-five") + 26);
            else
                html = $(this)[0].innerText;
            return '<div class="title-content">' + html + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popoverX('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
    });
}
/*================== 弹出tooltips end =============================*/