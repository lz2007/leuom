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
require('/apps/common/common-bk.less');
/*

 * 图片轮转翻页
 * @type {string}  组件大小............cpbk或rlbk
  
*/
let bk_map,bkComponent;
avalon.component('ms-bk', {
    template: __inline('./common-bk.html'),
    defaults: {
        //中英文翻译 zhcn or en
        extra_class: languageSelect == "en" ? true : false,
        language: getLan(),

        page: 0,
        pageSize: 6,
        total: 0,
        totalPage: 0,
        picContentDIV:0,

        css: avalon.noop,
        type: avalon.noop,//车牌布控 或 人脸布控
        errorIMG404() {
            if (this.type == 'cpbk') {
                return "javascript:this.src='../../static/image/theme/default/car-list-404.png?__sprite';";
            } else if(this.type == 'rlbk'){
                return "javascript:this.src='../../static/image/theme/default/face-list-404.png?__sprite';";
            } else {
                return "javascript:this.src='../../static/image/theme/default/face-list-404.png?__sprite';";
            }
            // return "javascript:this.src='../../static/image/theme/default/face-list-404.png?__sprite';";
        },
        regMessage:avalon.noop,
        id:　'',
        title: '',
        show: false,

        recognition_info: {},
        recognition_arr: [],
        scene_img: "",
        result_list: [],

        getList() {            
            let urlStr = '';
            let typeStr = '';
            if (bkComponent.type=='rlbk') {
                urlStr = '/gmvcs/instruct/face/monitoring/search/recognition/24hours';
                this.noDataTitle = '暂无人脸布控信息';
                               
                typeStr = '人脸布控';
            } else if(bkComponent.type == 'cpbk'){
                urlStr = '/gmvcs/instruct/car/monitoring/search/recognition/24hours';
                this.noDataTitle = '暂无车辆布控信息';
                                
                typeStr = '车辆布控';
            } else if (bkComponent.type == 'rzhy') {
                urlStr = '/gmvcs/instruct/key-person/monitoring/search/recognition/24hours';
                this.noDataTitle = '暂无人证核验信息';
                                
                typeStr = '人证核验';
            } else {
                return;
                urlStr = '/api/getBK';
            }
            ajax({
                // url: '/api/getBK',
                url: urlStr,
                method: 'post',
                data: {
                    'page': bkComponent.page,
                    'pageSize':bkComponent.pageSize
                }
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取'+typeStr+'信息失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }
                if (result.data.currentElements.length == bkComponent.pageSize) {
                    let temp = [];
                    for (let i = 0; i < result.data.currentElements.length; i++) {
                        let obj = result.data.currentElements[i];
                        obj.index = i;  
                        obj.userName = obj.userName ? obj.userName : '-';
                        obj.userCode = obj.userCode ? obj.userCode : '-';
                        if (typeStr == '人证核验') {
                            // obj.isNormal = obj.personIsNormal;
                            obj.shootImgFilePath = obj.recogKeyPersons.length > 0 ? obj.recogKeyPersons[0].regImgPath : null;//regImgPath
                         }
                        temp.push(obj);                        
                    }                      
                    bkComponent.result_list = temp;
                    bkComponent.totalPage = result.data.totalPages;
                     //样式居中
                    let widthUL = $(".common-bk-main").width();  
                    bkComponent.picContentDIV = $(".picContentDIV").width();
                    let l = ((widthUL - bkComponent.picContentDIV) / 2).toFixed(0);
                    $(".divCenter").css('margin-left', l-40);
                } else {
                    let temp = [];
                    for (let i = 0; i < result.data.currentElements.length; i++) {
                        let obj = result.data.currentElements[i];
                        obj.index = i;
                        obj.userName = obj.userName ? obj.userName : '-';
                        obj.userCode = obj.userCode ? obj.userCode : '-';
                        if (typeStr == '人证核验') {
                            // obj.isNormal = obj.personIsNormal;
                            obj.shootImgFilePath = obj.recogKeyPersons.length > 0 ? obj.recogKeyPersons[0].regImgPath : null;//regImgPath
                         }
                        temp.push(obj);
                    }
                    bkComponent.result_list = temp;
                    bkComponent.totalPage = result.data.totalPages;
                   
                }
               
                
            });
        },
        //下一页
        nextBtn() {
            let tempPage = bkComponent.page
            if (tempPage + 1 <= bkComponent.totalPage-1) {
                bkComponent.page = bkComponent.page + 1;
                bkComponent.getList();
            }else{
                return;
            }
        },
        //上一页
        preBtn() {
            let tempPage = bkComponent.page
            if (tempPage - 1 >= 0) {
                bkComponent.page = bkComponent.page - 1;
                bkComponent.getList();
            }else{
                return;
            }
        },
        setMap(longitude, latitude) {
            bk_map.esriMap.clearDrawLayer();
            bk_map.esriMap.setMapCenter(longitude, latitude, 12);
            bk_map.locationSymbol = bk_map.esriMap.createPicSymbol(25, 40, "/static/image/sszhxt-znsb/bk/cpbk/map/Bdsj.png");//数字是1，2是图片宽和高
            bk_map.esriMap.addPictureMarker(longitude, latitude, bk_map.locationSymbol, null);
        },
        
        noDataTitle:'',
        clickChange: avalon.noop,
        result_list_click(obj) {
            let contentWindow = $('#mapIframe')[0].contentWindow;
            contentWindow.circleArr = [];//初始化布控
            contentWindow.esriMap && contentWindow.esriMap.remove_overlay();//清除旧布控信息
            $(".result_list li").removeClass("select_li");
            $(".result_list li:eq(" + obj.index + ")").addClass("select_li");
            // let id = obj.id;
            // bkComponent.setMap(obj.longitude, obj.latitude);
            obj.businessId = obj.id;
            this.clickChange(obj);
        },
        onInit: function (event) {            
            bkComponent = this;
            
            this.$watch('type', (v) => {
                if(v == '') {
                    bkComponent.show = false;
                } else {
                    bkComponent.show = true;
                    if (bkComponent.type == 'cpbk') {
                        bkComponent.pageSize = 6;
                    } else {                        
                        bkComponent.pageSize = 9;
                    }
                    resizeFuc();
                }
            });
        },
        onReady: function (event) {
            setTimeout(() => {
                bk_map = $('#mapIframe')[0].contentWindow;
            }, 200);
            // $(window).on('resize', resizeFuc);            
            // resizeFuc();
            
            //地图加载完毕执行
            var timerPoller = null;
            timerPoller = setInterval(function () {
                if (bk_map.loadMapCompelete) {
                    clearInterval(timerPoller);
                    setTimeout(function () {
                        //地图完成执行程序块

                        //清空地图
                        bk_map.esriMap.clearDrawLayer();
                    }, 500);
                }
            }, 200);
        },
        onDispose: function (event) {
            
        }
    }
});

function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}
function resizeFuc() {
    // let widthUL = $(".result_list").width();
    // let pageSize_change = (widthUL / 260).toFixed(0) - 1;
    // bkComponent.pageSize = pageSize_change>=3?pageSize_change:3;    
    bkComponent.getList();
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
