/*
 * @Author: Linzhanhong
 * @Date: 2019-08-15 16:06:39
 * @LastEditors: Linzhanhong
 * @LastEditTime: 2019-08-30 17:40:11
 * @Description: File Description
 */

// import {BAIDU, MAPLITE, MINEMAP, PGIS, OL} from './allmap-type';
import Base from './allmap-base';


/**
 * 总地图类
 * 只实例当前 options.mode 类型的地图，并调用相关API
 *
 * @class Allmap
 * @extends {Base}
 */
class Allmap extends Base{
    constructor(options) {
        super(options);
        this.Init();
    }
    /**
     * 初始化地图实例
     *
     * @memberof Allmap
     */
    Init() {
        this.map = this.$Api.Map(this.$el, this.options);
        let { center, level } = this.options;
        this.centerAndZoom(center, level);
    }
    /**
     * 以指定的经度和纬度创建一个地理点坐标
     *
     * @param {Number} lnt 地理经度
     * @param {Number} lat 地理纬度
     * @memberof Allmap
     */
    Point(lnt, lat) {
        let coord = this.convert([lnt, lat]);
        return this.$Api.Point(coord);
    }
    /**
     * 画圆
     *
     * @param {Array} center 中心点
     * @param {Number} radius 半径 单位：m
     * @returns {Object} overlay | circle object
     * @memberof Allmap
     */
    Circle(center, radius) {
        center = this.convert(center);
        return this.$Api.Circle(center, radius); 
    }
    CreateMarker(opts) {
        opts.point = this.convert(opts.point);
        return this.$Api.CreateMarker(opts);
    }
    /**
     * 创建图片覆盖物
     *
     * @param {Object} opts 配置参数
     * @param {Number} opts.width 图片宽度 必需
     * @param {Number} opts.height 图片高度 必需
     * @param {String} opts.url 静态图片路径 必需
     * @memberof Allmap
     */
    CreatePicSymbol(opts) {
        return this.$Api.CreatePicSymbol(opts);
    }
    /**
     * 创建文字覆盖物
     * 注：写上opts.center，因为maplite要用到
     * 
     * @param {String} text 显示文字
     * @param {Object} opts 配置参数
     * @memberof Allmap
     */
    CreateTextSymbol(text, opts) {
        opts.center = this.convert(opts.center);
        return this.$Api.CreateTextSymbol(text, opts);
    }
    /**
     * 创建信息弹窗
     *
     * @param {String} html
     * @param {Object} opts {title, close<Function>}
     *                  title 显示的文字信息
     *                  close 信息弹窗关闭回调
     * @returns
     * @memberof Allmap
     */
    InfoWindow(html, opts) {
        return this.$Api.InfoWindow(html, opts);
    }
    /**
     * 测距
     *
     * @memberof Allmap
     */
    MeasureLength() {
        this.$Api.MeasureLength();
    }
    /**
     * 创建轨迹
     *
     * @param {Array} points
     * @param {Object} lineSymbol
     * @memberof Allmap
     */
    Polyline(points, lineSymbol) {
        return this.$Api.Polyline(
            points.map( value => this.convert(value)),
            lineSymbol
        )
    }
    /**
     * 添加地图控件
     *
     * @memberof Allmap
     */
    addControl() {
        this.$Api.AddControl();
    }
    /**
     * 设置中心点和级别
     *
     * @param {Array} center [lnt, lat]
     * @param {Number} level
     * @returns 
     * @memberof Allmap
     */
    centerAndZoom(center, level) {
        center = this.convert(center);
        return this.$Api.CenterAndZoom(center, level);
    }
    /**
     * 根据 center 设置地图中心点
     *
     * @param {Array} center [lnt, lat]
     * @memberof Allmap
     */
    setCenter(center) {
        this.$Api.SetCenter(this.convert(center));
    }
    /**
     * 根据坐标数组确定地图显示级别及视窗大小
     *
     * @param {Array} points [[lnt,lat], [lnt,lat]]
     * @memberof Allmap
     */
    setViewport(points) {
        if(points.length === 0) return;
        this.$Api.SetViewport(
            points.map( value => this.convert(value))
        );
    }
    removerMarkerByKey(key, value) {
        this.$Api.RemoverMarkerByKey(key, value);
    }
    /**
     * 删除一个覆盖物
     *
     * @param {Object} overlay
     * @memberof Allmap
     */
    removeOverlay(overlay) {
        this.$Api.RemoveOverlay(overlay);
    }
    /**
     * 清除地图覆盖物（如标注、信息弹窗、轨迹等）
     *
     * @memberof Allmap
     */
    removeOverlays() {
        this.$Api.RemoveOverlays();
    }
}

export default Allmap;