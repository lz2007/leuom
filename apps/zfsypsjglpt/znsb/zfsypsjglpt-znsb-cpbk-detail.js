import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
import * as menuServer from '/services/menuService';
export const name = "zfsypsjglpt-znsb-cpbk-detail";
require("./zfsypsjglpt-znsb-cpbk-detail.less");
import '/apps/common/common-ms-table';
import '/services/filterService';
import '/vendor/jquery/jquery.SuperSlide.2.1.1'
require('/apps/common/common-comparisonInfo-cp');

let cpbk_detail_vm, cpbk_map,locationArr;
avalon.component(name, {
    template: __inline("./zfsypsjglpt-znsb-cpbk-detail.html"),
    defaults: {
    
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
        positionTips: false,//无定位信息 标识
        positionNumber:'无',
        actions(type, text, record, index) {
            if (type == "check") {
                if (cpbk_map.loadMapCompelete) {
                    //判断是否有定位信息
                    if (record.longitude&&record.latitude) {
                        cpbk_detail_vm.setMap(record.longitude, record.latitude, record.table_index); 
                        $('#check-'+record.table_index).css('display', 'none');
                        $('#del-'+record.table_index).css('display', 'inherit');
                    } else {
                        cpbk_detail_vm.positionTips = true;//暂无定位提示
                        cpbk_detail_vm.positionNumber = record.table_index;
                    }
                } else {
                    cpbk_detail_vm.pollGetMapLoadStatus(record.longitude, record.latitude,record.table_index);
                }
            } else if (type == "del") {
                // cpbk_map.esriMap.clearDrawLayer();
                cpbk_detail_vm.delLocalInfo(record.table_index);    
                $('#del-'+record.table_index).css('display', 'none');
                $('#check-'+record.table_index).css('display', 'inherit');
            }
        },

        timer: null,
        // setMap(lon, lat) {
        //     cpbk_map.esriMap.clearDrawLayer();
        //     cpbk_map.esriMap.setMapCenter(lon, lat, 12);
        //     cpbk_map.esriMap.addPictureMarker(lon, lat, cpbk_map.locationSymbol, null);
        // },
        // pollGetMapLoadStatus(lon, lat) {
        //     let _this = this;
        //     _this.timer = setInterval(() => {
        //         if (cpbk_map.loadMapCompelete) {
        //             clearInterval(_this.timer);
        //             _this.setMap(lon, lat);
        //         }
        //     }, 200);
        // },
        setMap(lon, lat, number) {
            // cpbk_map.esriMap.setMapCenter(lon, lat, 12);
            // cpbk_map.esri;
            // cpbk_map.locationSymbol = cpbk_map.esriMap.createPicSymbol(35, 50, "/static/image/zfsypsjglpt/zn_local_number.png");//数字是1，2是图片宽和高
            // let font2 = new cpbk_map.esri.symbols.Font().setSize("16px").setFamily("微软雅黑");
            // let textSymbol2 = new cpbk_map.esri.symbols.TextSymbol(number).setFont(font2).setColor(new cpbk_map.esri.Color([16,85,179,1])).setOffset(-5, 23).setAlign(cpbk_map.esri.symbol.TextSymbol.ALIGN_START);

            // let pic = cpbk_map.esriMap.addPictureMarker(lon, lat, cpbk_map.locationSymbol, null);
            // let num = cpbk_map.esriMap.addPictureMarker(lon, lat, textSymbol2, null);
            // let obj = {
            //     'id': number,
            //     'mapInfo': [pic,num]
            // };
            // locationArr.push(obj);
            cpbk_map.esriMap.setMapCenter(lon, lat, 12);
            let markerPt = cpbk_map.esriMap.addTextPicMarker(lon, lat, number, null);
            let obj = {
                'id': number,
                'mapInfo': [markerPt.num, markerPt.pic]
            };
            locationArr.push(obj);
        },
        pollGetMapLoadStatus(lon, lat,number) {
            let _this = this;
            _this.timer = setInterval(() => {
                if (cpbk_map.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.setMap(lon, lat,number);
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
                cpbk_map.esriMap.removePictureMarker(el);
            });
        },
        table_list: [],
        search_data: {},
        loading: false,
        carNumber: "",
        recognition_arr: [],
        scene_img: "",
        recognition_list: [],
        recognition_info: {},

        getTableList() {
            let ajax_data = {
                "carNumber": this.carNumber,
                "page": 0,
                "pageSize": this.table_pagination.pageSize
            };

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;

            ajax({
                // url: '/api/getCarLog',
                url: '/gmvcs/instruct/car/monitoring/get/recognition/log/by/car/number',
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

                if (!this.change_page)
                    this.table_pagination.current = 1;

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

        recognition_list_click(index) {
            this.recognition_info = this.recognition_list[index];
            $(".recognition_panel .recognition_ul li").removeClass("selected");
            $(".recognition_panel .recognition_ul li:eq(" + index + ")").addClass("selected");
        },
        log_Authority:false,
        onInit(e) {
            $('.zfsypsjglpt-map').css({
                'position': 'absolute',
                'width': 'auto',
                'left': '210px',
                'right': '20px',
                'height': '392px',
                'bottom': '8px',
                'top': '180px'
            });
            cpbk_detail_vm = e.vmodel;
            locationArr = [];//初始化
            
            _popover();
        },
        onReady() {
            $(document.body).css({
                "min-height": "643px"
            });
            if (cpbk_map) {
                cpbk_map.esriMap.clearDrawLayer();//初始化页面
            }
            let record_item = storage.getItem('zfsypsjglpt-znsb-cpbk-record-item');
            this.carNumber = record_item.carNumber;

            setTimeout(() => {
                cpbk_map = $('#mapIframe')[0].contentWindow;
            }, 200);
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZNSB_CPSB/.test(el))
                        avalon.Array.ensure(func_list, el);
                });


                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZNSB_CPSB_LSJL":
                        cpbk_detail_vm.log_Authority = true;
                            break;                        
                    }
                });
                if (cpbk_detail_vm.log_Authority) {
                    this.loading = true;
                    this.getTableList();
                }
            });
            ajax({
                // url: '/api/getCarRec',
                url: `/gmvcs/instruct/car/monitoring/get/recognition?id=${record_item.id}`,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取车牌识别结果失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                this.scene_img = result.data.shootCarImgFilePath;//现场拍摄的车辆图片文件路径

                let temp = [];
                if (result.data.recognitionCarInfo.length > 0) {
                    for (let i = 0; i < result.data.recognitionCarInfo.length; i++) {
                        let obj = result.data.recognitionCarInfo[i];
                        obj.carNumber = result.data.carNumber;
                        obj.isNormalStr = result.data.recognitionCarInfo.isNormal ? '正常' : '异常';
                        obj.carUse = result.data.recognitionCarInfo.carUse == "0" ? "非运营" : "运营";
                        obj.index = i;
                        obj.txt = i + 1;
                        temp.push(obj);
                    }
                    this.recognition_list = temp;
                    this.recognition_info = this.recognition_list[0];
                    $(".recognition_panel .recognition_ul li").removeClass("selected");
                    $(".recognition_panel .recognition_ul li:eq(0)").addClass("selected");
                } else {
                    this.recognition_list = [];
                    this.recognition_info = {
                        "carNumber": result.data.carNumber, 
                        "carType": "", 
                        "carTypeName": "", 
                        "carDb": "", 
                        "carDbName": "", 
                        "carOwner": "", 
                        "carOwnerAddress": "", 
                        "carUse": "", 
                        "carBrand": "", 
                        "carIdCard": "", 
                        "carEngineNo": "", 
                        "carValid": "", 
                        "carColor": "", 
                        "isNormal": result.data.isNormal, 
                        "carRegImgFilePath": ""
                    };
                }
                
            });

            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数
            
            //F5刷新 回到表格页面
            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    avalon.history.setHash("/zfsypsjglpt-znsb-cpbk");
                }
            });
        },
        onDispose() {
            storage.removeItem('sszhxt-znsb-cpbk-record-item');
            $(document.body).css({
                "min-height": "550px"
            });
            $('.zfsypsjglpt-map').css({
                'width': '0',
                'height': '0',
                'overflow': 'hidden'
            });
            cpbk_map.esriMap.clearDrawLayer();//初始化页面
        },
        returnBtn() {
            storage.removeItem('sszhxt-znsb-cpbk-record-item');
            $(document.body).css({
                "min-height": "550px"
            });
            $('.zfsypsjglpt-znsb-cpbk-map').css({
                'width': '0',
                'height': '0',
                'overflow': 'hidden'
            });
            // if (cpbk_map.loadMapCompelete) {
            //     cpbk_map.esriMap.clearDrawLayer();
            //     cpbk_map.esriMap.setMapCenter(113.26436, 23.12908, 6);
            // }

            avalon.history.setHash("/zfsypsjglpt-znsb-cpbk");
        }
    }
});

// ------------function---------------


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