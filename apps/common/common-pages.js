/**
 * 统一运维管理平台----分页组件
 * @prop {Number} total 数据总量
 *  @prop {Number} current 当前页数
 * @event {Function} onChange 当页码改变时触发，参数current
 * @example
 * ```
 * <ms-pages :widget="{total:@total,onChange:@handlePageChange，current:@currentPage}"></ms-pages>
 *
 * ```
 */
let {
    languageSelect
} = require('/services/configService');
require('/apps/common/common-pages.css');
import $ from 'jquery';
let language_txt = require('/vendor/language').language;

const pagesVm = avalon.component('ms-pages', {
    template: __inline('./common-pages.html'),
    defaults: {
        commonLan: language_txt.common,
        languageSelect_pages: languageSelect == "zhcn" ? true : false,
        iszfda: false, //判断当前页面是否为数据中心-执法档案模块的页面，是执法档案模块才有数据超量的加载动画
        current: 1,
        pageSize: 20,
        total: 0,
        pageTotal: 0,
        $computed: {
            pageTotal: function () {
                return Math.ceil(this.total / this.pageSize);
            }
        },
        homePage: function () {
            if (this.current > 1) {
                this.getCurrent(1);
                this.onChange(this.current, this.pageSize);
            }
        },
        endPage: function () {
            if (this.current < this.pageTotal) {
                this.getCurrent(this.pageTotal);
                this.onChange(this.current, this.pageSize);
            }
        },
        prevPage: function () {
            if (this.current > 1) {
                this.getCurrent(--this.current);
                this.onChange(this.current, this.pageSize);
            }
        },
        nextPage: function () {
            if (this.current < this.pageTotal) {
                this.getCurrent(++this.current);
                this.onChange(this.current, this.pageSize);
            }
        },
        onChange: avalon.noop,
        getCurrent: avalon.noop,
        overLimit: false,
        onInit: function (event) {},
        onReady: function (event) {
            // 兼容IE9浏览器加载动画
            this.$watch('overLimit', (v) => {
                setTimeout(() => {
                    // console.log($(".cmp-limit .bounce1"), $(".bounce1"));
                    // console.log(window.navigator.userAgent);
                    var theUA = window.navigator.userAgent.toLowerCase();
                    if ((theUA.match(/msie\s\d+/) && theUA.match(/msie\s\d+/)[0]) || (theUA.match(/trident\s?\d+/) && theUA.match(/trident\s?\d+/)[0])) {
                        var ieVersion = theUA.match(/msie\s\d+/)[0].match(/\d+/)[0] || theUA.match(/trident\s?\d+/)[0];
                        // console.log(ieVersion);
                        if (ieVersion < 9 || ieVersion == 9) {
                            // console.log("IE浏览器，版本为" + ieVersion);
                            // IE9及以下版本不支持CSS3动画，需用JS设置总数量和总页数加载动画
                            // console.log(this.iszfda, this.overLimit, this.iszfda && this.overLimit);
                            if(this.iszfda && this.overLimit) { //当前为执法档案模块页面且数据超量时执行
                                // console.log($(".cmp-limit .bounce1"), $(".bounce1"));
                                var bounce1Width = $(".cmp-limit .bounce1").css("width");
                                var bounceWidth = Number(bounce1Width.split("px")[0]);
                                // console.log(bounceWidth);
                                // console.log(bounce1Width);
                                bounceWidth = 1.0;
                                $($(".bounce1")[0]).css("-ms-transform", "scale(0.0)"); //IE9支持-ms-transform的2D转换，IE9以下版本不支持
                                $($(".bounce2")[0]).css("-ms-transform", "scale(0.0)");
                                $($(".bounce3")[0]).css("-ms-transform", "scale(0.0)");
                                $($(".bounce1")[1]).css("-ms-transform", "scale(0.0)");
                                $($(".bounce2")[1]).css("-ms-transform", "scale(0.0)");
                                $($(".bounce3")[1]).css("-ms-transform", "scale(0.0)");
                                // $($(".bounce1")[0]).css("width", "0px");
                                // $($(".bounce1")[0]).css("height", "0px");
                                // $($(".bounce2")[0]).css("width", "0px");
                                // $($(".bounce2")[0]).css("height", "0px");
                                // $($(".bounce3")[0]).css("width", "0px");
                                // $($(".bounce3")[0]).css("height", "0px");
                                var step1 = 0.0, //循环中scale每次加的量
                                    step2 = -0.1,
                                    step3 = -0.2,
                                    isAdd1 = true, //判断当前的step是加量还是减量
                                    isAdd2 = true,
                                    isAdd3 = true;
                                this.timerLoading = setInterval(() => {
                                    if(isAdd1) {
                                        step1 += 0.1
                                    }else {
                                        step1 -= 0.1;
                                    }
                                    if(isAdd2) {
                                        step2 += 0.1
                                    }else {
                                        step2 -= 0.1;
                                    }
                                    if(isAdd3) {
                                        step3 += 0.1
                                    }else {
                                        step3 -= 0.1;
                                    }
                                    // console.log(step1, step2, step3);
                                    // 第一个点
                                    if(step1 > bounceWidth) {
                                        isAdd1 = false;
                                        step1 -= 0.1;
                                    }
                                    if(step1 <= -0.2) {
                                        isAdd1 = true;
                                        step1 = 0.0;
                                    }
                                    if(step1 < 0.0) {
                                        $($(".bounce1")[0]).css("-ms-transform", "scale(0.0)");
                                        $($(".bounce1")[1]).css("-ms-transform", "scale(0.0)");
                                        // $($(".bounce1")[0]).css("width", "0px");
                                        // $($(".bounce1")[0]).css("height", "0px");
                                    }else {
                                        $($(".bounce1")[0]).css("-ms-transform", "scale(" + step1 + ")");
                                        $($(".bounce1")[1]).css("-ms-transform", "scale(" + step1 + ")");
                                        // $($(".bounce1")[0]).css("width", step1 + "px");
                                        // $($(".bounce1")[0]).css("height", step1 + "px");
                                    }
                                    // 第二个点
                                    if(step2 > bounceWidth) {
                                        isAdd2 = false;
                                        step2 -= 0.1;
                                    }
                                    if(step2 <= -0.2) {
                                        isAdd2 = true;
                                        step2 = 0.0;
                                    }
                                    if(step2 < 0.0) {
                                        $($(".bounce2")[0]).css("-ms-transform", "scale(0.0)");
                                        $($(".bounce2")[1]).css("-ms-transform", "scale(0.0)");
                                        // $($(".bounce2")[0]).css("width", "0px");
                                        // $($(".bounce2")[0]).css("height", "0px");
                                    }else {
                                        $($(".bounce2")[0]).css("-ms-transform", "scale(" + step2 + ")");
                                        $($(".bounce2")[1]).css("-ms-transform", "scale(" + step2 + ")");
                                        // $($(".bounce2")[0]).css("width", step2 + "px");
                                        // $($(".bounce2")[0]).css("height", step2 + "px");
                                    }
                                    // 第三个点
                                    if(step3 > bounceWidth) {
                                        isAdd3 = false;
                                        step3 -= 0.1;
                                    }
                                    if(step3 <= -0.2) {
                                        isAdd3 = true;
                                        step3 = 0.0;
                                    }
                                    if(step3 < 0.0) {
                                        $($(".bounce3")[0]).css("-ms-transform", "scale(0.0)");
                                        $($(".bounce3")[1]).css("-ms-transform", "scale(0.0)");
                                        // $($(".bounce3")[0]).css("width", "0px");
                                        // $($(".bounce3")[0]).css("height", "0px");
                                    }else {
                                        $($(".bounce3")[0]).css("-ms-transform", "scale(" + step3 + ")");
                                        $($(".bounce3")[1]).css("-ms-transform", "scale(" + step3 + ")");
                                        // $($(".bounce3")[0]).css("width", step3 + "px");
                                        // $($(".bounce3")[0]).css("height", step3 + "px");
                                    }
                                }, 100);
                            }else { //当前的数据没有超量时清除定时器
                                // console.log('cleartimeLoading');
                                if(this.timerLoading) {
                                    clearInterval(this.timerLoading);
                                }
                            }
                        }
                    }
                }, 10);
                
            });
        },
        onDispose: function (event) {}
    }
});