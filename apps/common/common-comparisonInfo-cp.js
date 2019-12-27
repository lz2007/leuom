
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
require('/apps/common/common-comparisonInfo-cp.less');
/*

 * 智能识别 车牌图片对比
 * @recognition_info {Object}  html页面信息
   onerror="javascript:this.src='../../static/image/sszhxt-znsb/cpbk_404.png';"
*/
let comparisonInfo;
avalon.component('ms-comparisonInfo-cp', {
    template: __inline('./common-comparisonInfo-cp.html'),
    defaults: {
        //中英文翻译 zhcn or en
        extra_class: languageSelect == "en" ? true : false,
        cp_detail_txt: getLan(),
        show:true,
        clickUp() {
            this.show = true;
        },
        clickDown() {
            this.show = false;
        },
        
        recognition_info: avalon.noop,//智能识别  html信息对象
        recognition_arr: [],
        scene_img: avalon.noop,
        result_list: [],
        onInit: function (event) {            
            comparisonInfo = this;            
            
            _popover();
            
        },
        onReady: function (event) {
            
        },
        onDispose: function (event) {
            
        }
    }
});


// ------------function---------------
function getLan() {
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