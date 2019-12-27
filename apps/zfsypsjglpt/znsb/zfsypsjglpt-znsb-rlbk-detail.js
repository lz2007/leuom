import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
import * as menuServer from '/services/menuService';
export const name = "zfsypsjglpt-znsb-rlbk-detail";
require("./zfsypsjglpt-znsb-rlbk-detail.less");
import '/apps/common/common-ms-table';
import '/services/filterService';
import '/vendor/jquery/jquery.SuperSlide.2.1.1'
require('/apps/common/common-comparisonInfo');

let language_txt = require('/vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

let rlbk_detail_vm,mapObject,recordObj,locationArr;
avalon.component(name, {
    template: __inline("./zfsypsjglpt-znsb-rlbk-detail.html"),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        rlbk_detail_txt: getLan(),
        result_txt: getLan().resemblance,

        change_page: false,
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
        
        setMap(lon, lat,number) {
            mapObject.esriMap.setMapCenter(lon, lat, 12);
            let markerPt = mapObject.esriMap.addTextPicMarker(lon, lat, number, null);
            let obj = {
                'id': number,
                'mapInfo': [markerPt.num, markerPt.pic]
            };
            locationArr.push(obj);
        },
        pollGetMapLoadStatus(lon, lat,number) {
            let _this = this;
            _this.timer = setInterval(() => {
                if (mapObject.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.setMap(lon, lat,number);
                }
            }, 200);
        },
        delLocalInfo(number) {
            let delObj = [];//包含两个对象，一个是图片，一个是数字
            let indexObj = '';
            // 遍历地图已经添加的对象
            for (let i = 0; i < locationArr.length; i++){
                if (locationArr[i].id === number) {
                    delObj = locationArr[i].mapInfo;
                    locationArr.splice(i, 1);
                    --i;
                }
            }

            //遍历删除指定的地图对象（图片和数字）
            avalon.each(delObj, function (index, el) {
                mapObject.esriMap.removePictureMarker(el);
            });
        },
        positionTips: false,//无定位信息 标识
        positionNumber:'无',
        actions(type, text, record, index) {
            if (type == "check") {
                if (mapObject.loadMapCompelete) {
                    //判断是否有定位信息
                    if (record.longitude&&record.latitude) {
                        rlbk_detail_vm.setMap(record.longitude, record.latitude, record.table_index); 
                        $('#check-'+record.table_index).css('display', 'none');
                        $('#del-'+record.table_index).css('display', 'inherit');
                    } else {
                        rlbk_detail_vm.positionTips = true;//暂无定位提示
                        rlbk_detail_vm.positionNumber = record.table_index;
                    }
                } else {
                    rlbk_detail_vm.pollGetMapLoadStatus(record.longitude, record.latitude,record.table_index);
                }
            } else if (type == "del") {
                rlbk_detail_vm.delLocalInfo(record.table_index);    
                $('#del-'+record.table_index).css('display', 'none');
                $('#check-'+record.table_index).css('display', 'inherit');
            }
        },

        recognition_info: {},//智能识别  html信息对象
        recognition_arr: [],
        scene_img: "",
        result_list: [],
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

        // 历史记录
        getTableList() {
            if (!recordObj.personCertificateId) {
                this.loading = false;
                return;
            }
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
                //5.5.1.5	查询人脸识别历史记录
                url: '/gmvcs/instruct/face/monitoring/search/recognition/log',
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
        log_Authority:false,
        onInit(e) {
            rlbk_detail_vm = e.vmodel;

            locationArr = [];//初始化
            setTimeout(() => {
                mapObject = $('#mapIframe')[0].contentWindow;
            }, 200);
            
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZNSB_RLSB/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZNSB_RLSB_LSJL":
                        rlbk_detail_vm.log_Authority = true;
                            break;                        
                    }
                });
                
            });
            $('.zfsypsjglpt-map').css({
                'position': 'absolute',
                'width': 'auto',
                'left': '210px',
                'right': '20px',
                'height': '392px',
                'bottom': '8px',
                'top': '180px'
            });
        },
        onReady() {
            $(document.body).css({
                "min-height": "681px"
            });
            if (mapObject) {
                mapObject.esriMap.clearDrawLayer();//初始化页面
            }
            $(window).on('resize', resizeFuc); 
            
                          
            recordObj = storage.getItem('zfsypsjglpt-znsb-rlbk-recordID');
            ajax({
                // url: '/api/getCarRec',
                url: `/gmvcs/instruct/face/monitoring/get/recognition?id=${recordObj.id}`,
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
                
                this.scene_img = result.data.shootPersonImgFilePath;               
                this.recognition_arr = result.data;
                this.recognition_info = this.recognition_arr;

                rlbk_detail_vm.echart_option.series[0].data = [
                    {
                        value: Number(rlbk_detail_vm.recognition_info.personSimilarity).toFixed(2)
                    },
                    {
                        value: (100 - Number(rlbk_detail_vm.recognition_info.personSimilarity)).toFixed(2)
                    }
                ];
                rlbk_detail_vm.echart_option.graphic[0].style.text = Number(rlbk_detail_vm.recognition_info.personSimilarity).toFixed(2) + "%";
                avalon.components['ms-comparisonInfo'].defaults.echartInit();

                this.change_page = false;
                this.table_pagination.current = 0;
                this.table_pagination.total = 0; //总条数
                //判断日志权限
                if (rlbk_detail_vm.log_Authority) { 
                    this.loading = true;
                    this.getTableList();
                }
            });
            //F5刷新 回到表格页面
            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    avalon.history.setHash("/zfsypsjglpt-znsb-rlbk");
                }
            });
        },

        onDispose() {
            $(document.body).css({
                "min-height": "550px"
            });
            $('.zfsypsjglpt-znsb-rlbk-map').css({
                'width': '0',
                'height': '0',
                'overflow': 'hidden'
            });
            $(window).off('resize', resizeFuc);   
            mapObject.esriMap.clearDrawLayer();//初始化页面
        },
        returnBtn() {
            $(window).off('resize', resizeFuc);
            
            $('.zfsypsjglpt-znsb-rlbk-map').css({
                'width': '0',
                'height': '0',
                'overflow': 'hidden'
            });
            avalon.history.setHash("/zfsypsjglpt-znsb-rlbk");
        }
    }
});

// ------------function---------------
function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}

function resizeFuc() {
    if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
        let img_num = Math.floor(($(".rlbk_detail_content").width() - 80) / 135);
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
        $(".comparison_result .tempWrap").width($(".rlbk_detail_content").width() - 80);
}
