/*
 * @Author: Linzhanhong
 * @Date: 2019-08-15 16:11:24
 * @LastEditors: Linzhanhong
 * @LastEditTime: 2019-08-29 18:45:59
 * @Description: File Description
 */

 // 坐标系转换工具
import gcoord from 'gcoord';
import Type, {BAIDU, MAPLITE, MINEMAP, PGIS, OL} from './allmap-type';
import Api from './allmap-api';

/**
 * 地图基础类
 *
 * @class Base
 */
class Base {
    /**
     * Creates an instance of Base.
     * @param {Object} options
     * @memberof Base
     */
    constructor(options) {
        // 地图配置项
        this.options = options;
        // 地图 target
        this.$el = (options && options.el) || null;
        // 当前坐标系
        this.from = options.from || 'WGS84';
        // 目标坐标系
        this.to = options.to || 'GCJ02';
        // 地图中心点转换
        this.options.center = this.convert(this.options.center);
        // 地图对象
        this.map = null;
        // 地图类型
        // mapType == BMap/MapLite/minemap/EzMap/ol
        this.mapType = '';
        // 当前地图元素
        this.$element = document.getElementById(this.$el);
        
        let that = this;
        if(!options.mode) throw Error('mode为必填！');
        let mode = options.mode.trim().split('-');
        Object.keys(Type).forEach(function(value) {
            if(mode[0] === value) {
                // 将 Symbol的key赋值给mapType, 如 mapType = 'BMap'
                that.mapType = Type[value];
                // 若是 openlayers-baidu 则 that.$type = baidu
                that.$type = mode[1] ? mode[1] : that.mapType;
                that.options.$type = mode[1] ? mode[1] : that.mapType;
            }
        });

        // API 转换注入
        // $Api 统一 API 接口 
        this.$Api = new Api()[this.mapType]();
    }
    /**
     * 获取地图实例对象
     *
     * @returns map
     * @memberof Base
     */
    getMap() {
        return this.map;
    }

    /**
     * 坐标转换
     * @param {Object|String|Array} geojson => GeoJSON对象，或GeoJSON字符串，或经纬度数组
     * @param {String} from => 当前坐标系
     * @param {String} to => 目标坐标系
     * @returns {Object|String|Array} geojson
     */
    convert(geojson) {
        // 经纬度数组值有可能不是 Number 类型，需转化
        if('[object Array]' == Object.prototype.toString.call(geojson)) {
            geojson = geojson.map((value) => {
                return Number(value);
            });
        }
        return gcoord.transform(geojson, gcoord[this.from], gcoord[this.to]);
    }

}

export default Base;
