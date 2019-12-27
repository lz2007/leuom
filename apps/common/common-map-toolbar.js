/*
 * @Author: linzhanhong 
 * @Date: 2018-10-17 09:13:17 
 * @Last Modified by: chenjinxing
 * @Last Modified time: 2019-03-15 08:58:56
 */

 /**
 * 实时指挥系统----地图工具栏组件
 * @prop {Boolean} toolbarShow 是否显示工具栏
 * @prop {String} toobarClass 工具条样式
 * @example
 * ```
 * <ms-map-toolbar :widget="{toolbarShow: true, toobarClass: ''}">
 *      <div>插槽</div>
 * </ms-map-toolbar>
 *
 * ```
 */
import {languageSelect} from '/services/configService';
let language_txt = require('/vendor/language').language;
require('./common-map-toolbar.less');

let name = 'ms-map-toolbar';
let toolbarVm = null;

avalon.component(name, {
    template: __inline('./common-map-toolbar.html'),
    defaults: {
        toolbarShow: true,
        showcityName: "广州",
        toobarClass: '',
        lon: '',
        lat: '',
        sszhmap_txt: getLan(),
        extra_class: languageSelect == "en" ? true : false,

        showcitylist() {
            this.setCitylistPosition();
            $('.mapcity_popup_main').toggle(200);
        },
        citylocate(event) {
            let city = event.target.innerText;
            let lon = avalon.vmodels['sszhxt_vm'].$cityDetailobj.cityobj[city].lon;
            let lat = avalon.vmodels['sszhxt_vm'].$cityDetailobj.cityobj[city].lat;
            $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
        },
        showtool() {
            $(".mapcljl").toggle(100);
        },
        mearsurelength() {
            $('#mapIframe')[0].contentWindow.esriMap.measureLength();
        },
        showBkfw() {
            avalon.vmodels['sszh-bkfw-vm'].show = true;
        },
        // 定位城市列表显示位置
        setCitylistPosition() {
            let bounding = $('.sszhmaptool')[0].getBoundingClientRect();
            $('.mapcity_popup_main').css({
                left: bounding.left || bounding.x,
                top: (bounding.top || bounding.y) + 44
            });
        },
        setcity() {
            toolbarVm.showcityName = avalon.components['common-sszh-mapcity'].defaults.nowcity;
            this.lon = avalon.components['common-sszh-mapcity'].defaults.lon;
            this.lat = avalon.components['common-sszh-mapcity'].defaults.lat;
            //保存当前点击的城市
            avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity = toolbarVm.showcityName;
        },

        onInit: function (event) {
            toolbarVm = event.vmodel;
        },
        onReady: function (event) {
            this.setCitylistPosition();
            //用户设置的默认城市
            this.showcityName = avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity;
            this.lon = avalon.vmodels['sszhxt_vm'].$cityDetailobj.lon;
            this.lat = avalon.vmodels['sszhxt_vm'].$cityDetailobj.lat;
        },
        onDispose: function (event) {}
    },
    soleSlot: 'addTool'
});

function getLan() {
    return language_txt.sszhxt.sszhxt_sszh;
}