/*
 * @Author: Linzhanhong
 * @Date: 2019-08-15 16:06:39
 * @LastEditors: Linzhanhong
 * @LastEditTime: 2019-11-08 10:55:16
 * @Description: File Description
 */

import {BAIDU, MAPLITE, MINEMAP, PGIS, OL} from './allmap-type';

/**
 * 各种地图API转换类 
 * notice: 坐标点的转换在此类不进行转换，在调用Api方法前先转换
 *         For example: WGS84 transform to GCJ02
 *
 * @class Api
 */

let map = null;

// 共有配置属性
const CONF = {
    // 填充色 可用与画圆
    fillSymbol: {
        'strokeColor': 'rgba(0, 155, 255, 1)', // #009BFF
        'fillColor': 'rgba(0, 155, 255, 0.55)', // #009BFF
        'strokeWeight': 3,
        'fillOpacity': 0.55
    },
    lineSymbol: {
        'strokeColor': 'red',
        'strokeWeight': 2,
        'strokeOpacity': 0.8,
        'strokeLineDash': 0
    },
    // 字体颜色
    fontColor: 'rgba(16, 85, 179, 1)',
    // 字体大小
    fontSize: 14
}

let noop = avalon && avalon.noop || function() {};

class Api {
    /**
     * 根据坐标数组确定地图计算出经纬度和缩放级别
     *
     * @static
     * @param {Array} points
     * @returns {Object} {lnt, lat, zoom}
     * @memberof Api
     */
    static setViewport(points) {
        let getZoom = function (maxJ, minJ, maxW, minW) {
            if (maxJ == minJ && maxW == minW) return 13;
            let diff = maxJ - minJ;
            if (diff < (maxW - minW) * 2.1) diff = (maxW - minW) * 2.1;
            diff = parseInt(10000 * diff) / 10000;

            let zoomArr = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
            let diffArr = new Array(360, 180, 90, 45, 22, 11, 5.5, 2.75, 1.37, 0.68, 0.34, 0.17, 0.08, 0.04, 0.02);

            for (let i = 0; i < diffArr.length; i++) {
                if ((diff - diffArr[i]) >= 0) {
                    return zoomArr[i] + 1;
                }
            }
            return 14;
        };
        //根据原始数据计算中心坐标和缩放级别，并为地图设置中心坐标和缩放级别。  
        let setZoom = function (points) {
            let maxLng = points[0][0];
            let minLng = points[0][0];
            let maxLat = points[0][1];
            let minLat = points[0][1];
            let res;
            for (let i = points.length - 1; i >= 0; i--) {
                res = points[i];
                if (res[0] > maxLng) maxLng = res[0];
                if (res[0] < minLng) minLng = res[0];
                if (res[1] > maxLat) maxLat = res[1];
                if (res[1] < minLat) minLat = res[1];
            };
            let cenLng = (parseFloat(maxLng) + parseFloat(minLng)) / 2;
            let cenLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
            let zoom = getZoom(maxLng, minLng, maxLat, minLat);
            return {lnt: cenLng, lat: cenLat, zoom};
        };
        return setZoom(points);
    }
    constructor() {
        
    }

    /**
     * 百度在线地图API
     * API文档：http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html
     *  
     */
    [BAIDU]() {
        let overlays = [];

        return {
            /**
             * 在指定的容器内创建地图实例
             *
             * @param {String} id
             * @param {Object} opts
             * @returns map 地图实例
             */
            Map: (id, opts) => {
                map = new BMap.Map(id, {
                    // 地图最大、最小级别.
                    minZoom: opts.minZoom,
                    maxZoom: opts.maxZoom
                });
                return map;
            },
            /**
             * 坐标点 API 变换
             *
             * @param {Array} args 坐标点
             * @returns coordinate
             */
            Point: (args) => {
                return new BMap.Point(args[0], args[1]);
            },
            /**
             * 添加地图控件，不同地图控件不一样
             *
             * @returns map
             */
            AddControl() {
                let top_left_control = new BMap.ScaleControl({
                    anchor: BMAP_ANCHOR_TOP_LEFT
                });
                let top_left_navigation = new BMap.NavigationControl();
                // 左上角，添加比例尺
                map.addControl(top_left_control);
                // 左上角，添加默认缩放平移控件
                map.addControl(top_left_navigation);
                //添加地图类型控件
                map.addControl(new BMap.MapTypeControl());
                map.enableScrollWheelZoom(true);
                return map;
            },
            /**
             * 设置中心点和级别
             *
             * @param {Array} center
             * @param {Number} level
             */
            CenterAndZoom(center, level) {
                map.centerAndZoom(this.Point(center), level);
            },
            /**
             * 生成范围圆
             *
             * @param {Array} center 中心点
             * @param {Number} radius 半径 单位：m
             * @returns {Object} overlay | circle object
             */
            Circle(center, radius) {
                let circle = new BMap.Circle(this.Point(center), radius, CONF.fillSymbol);
                map.addOverlay(circle);
                overlays.push(circle);
                return circle;
            },
            /**
             * 创建覆盖物，可包含图片，文字，信息弹窗
             *
             * @param {Object} {picture, text, popup, point}
             * @returns marker
             */
            CreateMarker({picture, text, popup, point}) {
                let center = this.Point(point);
                let marker = new BMap.Marker(center, {
                    icon: picture
                });
                text && marker.setLabel(text);
                popup && marker.addEventListener("click", function () {
                    marker.openInfoWindow(popup);
                    $('.BMap_mask').next().find(
                        'img[src="http://api0.map.bdimg.com/images/iw_close1d3.gif"]').off('click',
                        popup.close);
                    $('.BMap_mask').next().find(
                        'img[src="http://api0.map.bdimg.com/images/iw_close1d3.gif"]').on('click',
                        popup.close);
                });
                map.addOverlay(marker);
                marker.$textSymbol = text;
                overlays.push(marker);
                return marker;
            },
            /**
             * 创建图片覆盖物
             *
             * @param {Object} opts 配置参数
             * @param {Number} opts.width 图片宽度
             * @param {Number} opts.height 图片高度
             * @param {String} opts.url 静态图片路径
             * @returns
             */
            CreatePicSymbol(opts) {
                let { width, height, url } = opts;
                return new BMap.Icon(
                    url, 
                    new BMap.Size(width, height), 
                    {
                        anchor: new BMap.Size(width / 2, height)
                    }
                );
            },
            /**
             * 创建文字覆盖物
             *
             * @param {String} text 显示文字
             * @param {Object} opts 配置参数
             */
            CreateTextSymbol(text, opts) {
                let offset = opts && opts.offset || [-10, -10];
                let label = new BMap.Label(text, {
                    'offset': new BMap.Size(offset[0] + 28, offset[1] + 80)
                });
                label.setStyle({
                    color: CONF.fontColor,
                    fontSize: `${CONF.fontSize}px`,
                    border: 'none',
                    'max-width': 'none',
                    transform: 'translateX(-50%)',
                    zIndex: opts && opts.zIndex || 0
                });
                map.addOverlay(label);
                return label;
            },
            /**
             * 创建信息弹窗
             *
             * @param {String} html
             * @param {Object} opts {title, close<Function>}
             *                  title 显示的文字信息
             *                  close 信息弹窗关闭回调
             * @returns popup
             */
            InfoWindow(html, opts) {
                let popup = new BMap.InfoWindow(html, {
                    'title': opts.title,
                    width: opts && opts.width || 440
                });
                popup.close = opts.close || noop;
                return popup;
            },
            /**
             * 测距
             *
             */
            MeasureLength() {
                let myDis = new BMapLib.DistanceTool(map);
                myDis.open(); //开启鼠标测距
            },
            /**
             * 打开信息弹窗
             *
             * @param {Object|String} infoWindow
             * @param {Object} opts {center, marker}
             */
            OpenInfoWindow(infoWindow, opts) {
                return map.openInfoWindow(infoWindow, this.Point(opts.center));
            },
            /**
             * 关闭信息弹窗
             *
             */
            CloseInfoWindow() {
                map.closeInfoWindow();
            },
            /**
             * 创建轨迹
             *
             * @param {Array} points
             * @param {Object} lineSymbol
             * @returns polyline
             */
            Polyline(points, lineSymbol) {
                lineSymbol = lineSymbol || CONF.lineSymbol;
                let polyline = new BMap.Polyline(
                    points.map(value => this.Point(value)), 
                    lineSymbol
                );
                map.addOverlay(polyline);
                overlays.push(polyline);
                return polyline;
            },
            /**
             * 根据 center 设置地图中心点
             *
             * @param {Array} center [lnt, lat]
             */
            SetCenter(center) {
                if(!map) return;
                map.setCenter(this.Point(center));
            },
            /**
             * 根据坐标数组确定地图显示级别及视窗大小
             *
             * @param {Array} points [[lnt,lat], [lnt,lat]]
             */
            SetViewport(points) {
                let view = map.getViewport(
                    points.map(value => this.Point(value))
                );
                map.setViewport(view);
            },
            /**
             * 根据提供的 key,value 删除覆盖物
             *
             * @param {String} key
             * @param {any} value
             */
            RemoverMarkerByKey(key, value) {
                if(!map) return;
                let len = overlays.length;
                for(let i = len - 1; i >= 0; i--) {
                    if(overlays[i][key] && overlays[i][key] === value) {
                        map.removeOverlay(overlays[i]);
                        overlays.splice(i, 1);
                    };
                }
            },
            /**
             * 删除某一个覆盖物
             *
             * @param {Object} marker
             */
            RemoveOverlay(marker) {
                if(!map || !marker) return;
                if(marker.hasOwnProperty('$textSymbol') && marker.$textSymbol) {
                    map.removeOverlay(marker.$textSymbol);
                    avalon.Array.remove(overlays, marker.$textSymbol);
                    marker.$textSymbol = null;
                }
                map.removeOverlay(marker);
                avalon.Array.remove(overlays, marker);
            },
            /**
             * 清除覆盖物
             *
             * @returns none
             */
            RemoveOverlays() {
                if(!map) return;
                map.clearOverlays();
            }
        }
    }

    /**
     * maplite 地图API
     * API文档：http://dev.maplite.cn/api/
     * 示例文档：http://dev.maplite.cn/demo/#map/first.jsp
     * 
     */
    [MAPLITE]() {
        let overlays = [];
        const { strokeColor, strokeWeight, strokeOpacity} = CONF.lineSymbol;
        const LineSymbol = new MapLite.LineSymbol({
            color: strokeColor,
            weight: strokeWeight,
            opacity: strokeOpacity
        });
        const {  fillColor, fillOpacity } = CONF.fillSymbol;
        const FillSymbol = new MapLite.FillSymbol({
            color: strokeColor,
            fillColor,
            weight: strokeWeight,
            fillOpacity
        });

        return {
            Map: (id, opts) => {
                avalon.shadowCopy(opts, {
                    isInertiaDrag: false,
                    // 地图最大、最小级别.
                    minLevel: opts.minZoom,
                    maxLevel: maxZoom
                });
                map = new MapLite.Map(id, opts);
                return map;
            },
            Point: (args) => {
                return new MapLite.Point(args[0], args[1]);
            },
            AddControl() {
                // maplite 地图暂没有加控件
                return map;
            },
            CenterAndZoom(center, level) {
                // maplite 的 map 实例是异步的，所以要延时
                setTimeout(function() {
                    try {
                        map.zoomToLevel(level, center.join(' '));
                    } catch (error) {
                        
                    }
                }, 500);
            },
            Circle(center, radius) {
                // 半径单位：1 = 100km, 而 radius 单位是 m , 所以要 / 1000 / 100  
                let circle = new MapLite.Circle(new MapLite.Coordinate(center[0], center[1]), radius / 1000 / 100);
                let circleGraphic = map.addGraphic(circle, FillSymbol);
                overlays.push(circleGraphic);
                return circleGraphic;
            },
            CreateMarker({picture, text, popup, point}) {
                let center = this.Point(point);
                let marker = map.addGraphic(center, picture);
                if(popup) {
                    let listener = (ele, callback) => {
                        if (ele.removeEventListener) { //所有主流浏览器，除了 IE 8 及更早 IE版本
                            ele.removeEventListener('click', callback);
                        } else if (x.detachEvent) { // IE 8 及更早 IE 版本
                            x.detachEvent('onclick', callback);
                        }
                        if (ele.addEventListener) { //所有主流浏览器，除了 IE 8 及更早 IE版本
                            ele.addEventListener('click', callback);
                        } else if (x.attachEvent) { // IE 8 及更早 IE 版本
                            x.attachEvent('onclick', callback);
                        }
                    };
                    let ele = document.getElementsByClassName('info-window-close')[0];
                    if (ele) {
                        listener(ele, popup.close);
                    }
                    marker.on('click', function (e) {
                        marker.showInfoWindow(popup.html, true);
                        let ele = document.getElementsByClassName('info-window-close')[0];
                        listener(ele, popup.close);
                    });
                }
                marker.$textSymbol = text;
                overlays.push(marker);
                return marker;
            },
            CreatePicSymbol(opts) {
                let { width, height, url } = opts;
                return new MapLite.PictureSymbol({
                    src: url,
                    height: height,
                    width: width,
                    position: 0, //形状相对于坐标点的位置
                    xOffset: 0, //x偏移量
                    yOffset: -14, //y偏移量
                });
            },
            CreateTextSymbol(text, opts) {
                let symbol = new MapLite.TextSymbol({
                    fontFamily : '微软雅黑',
                    fontSize : CONF.fontSize,
                    color : CONF.fontColor,
                    // backgroundColor : 'white',
                    yOffset: (opts && opts.offset ? opts.offset[1] + 4 : 0) + 30,
                    zIndex: opts && opts.zIndex || 0
                });
                let label = map.addGraphic(this.Point(opts.center), symbol);
                label.setText(text);
                overlays.push(label);
                return label;
            },
            InfoWindow(html, opts) {
                return {html, close: opts.close || noop};
            },
            MeasureLength() {
                map.measureLength();
            },
            OpenInfoWindow(infoWindow, opts) {
                return opts.marker.showInfoWindow(infoWindow.html, true);
            },
            CloseInfoWindow(infoWindow) {
                // infoWindow = OpenInfoWindow(popup, opts);
                infoWindow.close();
            },
            Polyline(points, lineSymbol) {
                lineSymbol = LineSymbol;  
                let polyLine = new MapLite.LineString(
                    points.map((value) => {
                        return new MapLite.Coordinate(value[0], value[1])
                    })
                );
                let polyLineGraphic = map.addGraphic(polyLine, lineSymbol);
                overlays.push(polyLineGraphic);
                return polyLineGraphic;
            },
            SetCenter(center) {
                if(!map) return;
                map.moveToCenter(center.join(' '));
            },
            SetViewport(points) {
                let { lnt, lat, zoom } = Api.setViewport(points);
                this.CenterAndZoom([lnt, lat], zoom);
            },
            RemoverMarkerByKey(key, value) {
                if(!map) return;
                let len = overlays.length;
                for(let i = len - 1; i >= 0; i--) {
                    if(overlays[i][key] && overlays[i][key] === value) {
                        if(overlays[i].$textSymbol) {
                            map.removeGraphic(overlays[i].$textSymbol);
                            overlays[i].$textSymbol = null;
                        }
                        map.removeGraphic(overlays[i]);
                        overlays.splice(i, 1);
                    };
                }
                try {
                    map.hideInfoWindow();
                } catch (error) {
                    
                }
            },
            RemoveOverlay(marker) {
                if(!map || !marker) return;
                if(marker.hasOwnProperty('$textSymbol') && marker.$textSymbol) {
                    map.removeGraphic(marker.$textSymbol);
                    avalon.Array.remove(overlays, marker.$textSymbol);
                    marker.$textSymbol = null;
                }
                map.removeGraphic(marker);
                avalon.Array.remove(overlays, marker);
            },
            RemoveOverlays() {
                if(!map) return;
                try {
                    map.clear();
                    map.removeAllLayers();
                } catch(e) {

                }
            }
        }
    }

    /**
     * minemap 地图API
     * API文档：http://minedata.cn/api/dev/js/summary
     * 示例文档：http://minedata.cn/minemapapi/demo/index.html#base_map
     * 
     */
    [MINEMAP]() {
        let edit = null,
            onEditRecordCreate = null,
            // 存放 layer 的 ID，以便根据 ID 删除图层
            layers = [],
            overlays = [];

        return {
            Map: (id, opts) => {
                minemap.domainUrl = opts.basemap;
                minemap.dataDomainUrl = opts.basemap;
                minemap.spriteUrl = opts.basemap + '/minemapapi/' + opts.version + '/sprite/sprite';
                minemap.serviceUrl = opts.basemap + '/service';
                minemap.accessToken = opts.accessToken;
                minemap.solution = opts.solution;
                // 固定配置
                avalon.shadowCopy(opts, {
                    // 底图样式
                    style: opts.basemap + '/service/solu/style/id/' + opts.solution,
                    // 地图俯仰角度
                    pitch: 0,
                })
                map = new minemap.Map(avalon.shadowCopy({
                    container: id
                }, opts));
                return map;
            },
            Point: (args) => {
                return args;
            },
            AddControl() {
                map.addControl(new minemap.Navigation(), "top-left");
                map.addControl(new minemap.Scale(), "top-right");
                return map;
            },
            CenterAndZoom(center, level) {
                map.flyTo({
                    center: center,
                    zoom: level,
                    bearing: 10,
                    pitch: 0,
                    duration: 1000
                });
            },
            Circle(center, radius) {
                const {fillColor, fillOpacity, strokeColor} = CONF.fillSymbol;
                radius = Number((radius / 1000).toFixed(1));
                const options = {steps: 64, units: 'kilometers', properties: {foo: 'bar'}};
                let cirlceGeo = turf.circle(center, radius, options);
                // 生成ID
                let circleId = `polygon_${new Date().getTime()}_${Math.floor(Math.random() * 10000)}`;
                map.addSource(circleId, {
                    "type": "geojson",
                    "data": cirlceGeo
                });
                map.addLayer({
                    "id": circleId, // 图层唯一标识  map.removeLayer(circleId);
                    "type": "fill",
                    "source": circleId,
                    "layout": {},
                    "paint": {
                        "fill-color": fillColor,
                        "fill-outline-color": strokeColor,
                        "fill-opacity": fillOpacity
                    }
                });
                let circle = {
                    id: circleId
                };
                layers.push(circleId);
                return circle;
            },
            CreateMarker({picture, text, popup, point}) {
                let marker = picture;
                marker.setLngLat(point).addTo(map);
                if(text) {
                    text.setLngLat(point).addTo(map);
                    // 设置文字居中
                    let textWidth = text._element.clientWidth;
                    text.setOffset([- textWidth / 2, text._offset.y]);
                }
                if(popup) {
                    popup && marker.setPopup(popup).addTo(map);
                    $(popup._closeButton).on('click', popup.close);
                }
                marker.$textSymbol = text;
                return marker;
            },
            CreatePicSymbol(opts) {
                let { width, height, url } = opts;
                let el = document.createElement('div');
                el.id = `marker_${new Date().getTime()}_${Math.floor(Math.random() * 100)}`;
                el.style["background-image"] = `url('${url}')`;
                el.style["background-size"] = 'cover';
                el.style.width = width + 'px';
                el.style.height = height + 'px';
                el.style.cursor = "pointer";

                let marker = new minemap.Marker(el, {
                    offset: [-(width / 2), -height]
                });
                overlays.push(marker);
                return marker;
            },
            CreateTextSymbol(text, opts) {
                let id = `text_${new Date().getTime()}_${Math.floor(Math.random() * 100)}`;
                let el = document.createElement('div');
                el.id = id;
                el.style.fontSize = `${CONF.fontSize}px`;
                el.style.color = CONF.fontColor;
                el.style.textAlign = 'center';
                el.innerHTML = text;
                let offset = [0, 0];
                if(opts && opts.hasOwnProperty('offset')) {
                    offset = opts.offset;
                    delete opts.offset;
                }
                avalon.shadowCopy(el.style, opts || {});
                let symbol = new minemap.Marker(el, {
                    offset:  offset
                });
                overlays.push(symbol);
                return symbol;
            },
            InfoWindow(html, opts) {
                let popup = new minemap.Popup({offset: [0, -60]}).setHTML(html);
                popup.close = opts.close || noop;
                return popup;
            },
            MeasureLength() {
                !edit && (edit = new window.minemap.edit.init(map, {
                    boxSelect: true,
                    touchEnabled: false,
                    displayControlsDefault: false,
                    showButtons: false
                }));
                // 地图编辑时（测距）的监听函数
                !onEditRecordCreate && (onEditRecordCreate = function(e) {
                    let coordinates = e.record.features[0].geometry.coordinates;
                    let lineId = e.record.features[0].id;
                    let distance = 0;
                    // 遍历累加计算长度
                    for(let i = 0; i < coordinates.length - 1; i++) {
                        let fromPt = coordinates[i];
                        let toPt = coordinates[i + 1];
                        let from = {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Point",
                                "coordinates": fromPt
                            }
                        };
                        let to = {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Point",
                                "coordinates": toPt
                            }
                        };
                        let options = {units: 'kilometers'};
                        distance += turf.distance(from, to, options);
                    }
        
                    let lngLat = coordinates[coordinates.length - 1];
                    let text = `<h5 class="measure-length">距离为：${distance.toFixed(2)}千米</h5>`;
                    let showDistancePopup = new minemap.Popup({
                        offset: [0 , 0]
                    }).setLngLat(lngLat).setHTML(text);
        
                    // 需要定时器延迟执行
                    setTimeout(() => {
                        showDistancePopup.addTo(map);
                    }, 500);
        
                    // 删除测距线
                    showDistancePopup.on('close', (e) => {
                        edit.draw.delete(lineId);
                    });
                },
                map.on("edit.record.create", onEditRecordCreate));

                let mode = 'line';
                edit.onBtnCtrlActive(mode, {style: {'lineWidth': 3 }});
            },
            OpenInfoWindow(InfoWindow, opts) {
                return opts.marker.togglePopup();
            },
            CloseInfoWindow(infoWindow) {
                opts.marker.togglePopup();
            },
            Polyline(points, lineSymbol) {
                lineSymbol = lineSymbol || CONF.lineSymbol;
                const {
                    strokeColor,
                    strokeWidth,
                    strokeOpacity,
                    id
                } = lineSymbol;

                // 生成ID
                let polygonId = id || `polygon_${new Date().getTime()}_${Math.floor(Math.random() * 10000)}`;
                let geojson = {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': points
                        }
                    }
                };

                map.addSource(polygonId, geojson);
                map.addLayer({
                    'id': polygonId,
                    'type': 'line',
                    'source': polygonId,
                    'layout': {
                        'line-join': 'round', // 线相交处样式 'bevel' 'round' 'miter'
                        'line-cap': 'round' // 线末端样式
                    },
                    'paint': {
                        'line-color': strokeColor, // 线色
                        'line-opacity': strokeOpacity, // 线色
                        'line-width': strokeWidth // 线宽度
                    }
                });

                let polyLineGraphic = {};
                polyLineGraphic.id = polygonId;
                layers.push(polyLineGraphic);
                return polyLineGraphic;
            },
            SetCenter(center) {
                if(!map) return;
                map.setCenter(center);
            },
            SetViewport(points) {
                let { lnt, lat, zoom } = Api.setViewport(points);
                this.CenterAndZoom([lnt, lat], zoom);
            },
            RemoverMarkerByKey(key, value) {
                if(!map) return;
                let len = overlays.length;
                for(let i = len - 1; i >= 0; i--) {
                    if(overlays[i][key] && overlays[i][key] === value) {
                        if(overlays[i].$textSymbol) {
                            overlays[i].$textSymbol.remove();
                            overlays[i].$textSymbol = null;
                        }
                        overlays[i].remove();
                        overlays.splice(i, 1);
                    };
                }
                len = layers.length;
                for (let i = 0; i < layers.length; i++) {
                    if(map.getLayer(layers[i])){
                        map.removeLayer(layers[i]);
                        layers.splice(i--, 1);
                    }
                }
            },
            RemoveOverlay(marker) {
                if(!map || !marker) return;
                if(marker.hasOwnProperty('$textSymbol') && marker.$textSymbol) {
                    marker.$textSymbol.remove();
                    avalon.Array.remove(overlays, marker.$textSymbol);
                    marker.$textSymbol = null;
                }
                if(marker instanceof minemap.Marker) {
                    marker.remove();
                    avalon.Array.remove(overlays, marker);
                } else {
                    // 删除圆，轨迹
                    map.removeLayer(marker.id);
                    avalon.Array.remove(layers, marker);
                }
            },
            RemoveOverlays() {
                if(!map) return;
                // 删除所有 Marker
                map.removeMarkers();
                for (let i = 0; i < layers.length; i++) {
                    if(map.getLayer(layers[i].id)){
                        map.removeLayer(layers[i].id);
                        layers.splice(i--, 1);
                    }
                }
            }
        }
    }

    /**
     * pgis 地图API
     * 
     */
    [PGIS]() {
        let overlays = [];

        return {
            Map: (id, opts) => {
                map = new EzMap(document.getElementById(id));
                return map;
            },
            Point: (args) => {
                return new Point(args[0], args[1]);
            },
            AddControl() {
                //显示左侧级别工具条
                map.showMapControl();
                return map;
            },
            CenterAndZoom(center, level) {
                map.centerAndZoom(center, level);
            },
            Circle(center, radius) {
                const { strokeColor, strokeWidth, fillOpacity, fillColor } = CONF.fillSymbol;
                let circle = new Circle(`${center[0]},${center[1]},${radius}`, strokeColor, strokeWidth, fillOpacity, fillColor);
                map.addOverlay(circle);
                overlays.push(circle);
                return circle;
            },
            CreateMarker({picture, text, popup, point}) {
                let marker = new Marker(this.Point(point), picture, text);
                // 添加点击事件的响应, 不添加点击事件 直接使用marker.openInfoWindow 有可能报错,各地方api不一致
                marker.addListener("click", function () {
                    // 通用api
                    // marker.openInfoWindow && marker.openInfoWindow(popup.html, true);
                    // 昆明api
                    marker.openInfoWindowHtml && marker.openInfoWindowHtml(popup.html, true);
                });
                map.addOverlay(marker);
                // 昆明api 显示标题
                marker.showTitle && marker.showTitle();
                overlays.push(marker);
                return marker;
            },
            CreatePicSymbol(opts) {
                let { width, height, url } = opts;
                let symbol = new Icon();
                symbol.height = height;
                symbol.width = width;
                symbol.leftOffset = 0;
                symbol.topOffset = 0;
                symbol.image = url;
                // 昆明项目设置图片api
                symbol.options.iconUrl = url;
                return symbol;
            },
            CreateTextSymbol(text, opts) {
                // 省略了 fillColor(背景色)、isStroke(是否描边)、strokeColor(描边色)、strokeWidth、strokeStyle、lineHeight、positiong(默认left-top)
                let offset = [0, 0];
                if(opts && opts.hasOwnProperty('offset')) {
                    offset = opts.offset;
                    delete opts.offset;
                }
                let options = {
                    font: '微软雅黑', // 字体类型
                    fontSize: CONF.fontSize, // 字体大小
                    fontColor: CONF.fontColor, // 字体颜色 支持hex,rgb,rgba
                    textBaseline: 'middle',
                    textAlign: 'center', // 对齐方式
                    anchor: [0, 0], // 文本锚点
                    offset: offset, // 文本偏移量
                    bgColor: '#fff', //标题背景颜色
                    borderColor: '', //边框颜色 
                    borderSize: 0, //边框宽度 
                    bIsTransparent: '', //是否透明 
                    pos: 2 // 标题位置：0~7 ： 上，左上，左，左下，下，右下，右，右上
                    //ops： 楚雄州地图 取值范围0~7：分别代表右上、右、右下、下、左下、左、左
                    // 昆明api 标题位置（取值范围0~7：分别代表右上、右、右下、下、左下、左、左上、上8个方向）类型：Number 
                };
                const option = avalon.shadowCopy(options, opts || {});
                const { fontSize, pos, font, fontColor, bgColor, borderColor, borderSize, bIsTransparent } = option;
                return new Title(text, fontSize, pos, font, fontColor, bgColor, borderColor, borderSize, bIsTransparent);
            },
            InfoWindow(html, opts) {
                return {html, close: opts.close || noop};
            },
            MeasureLength() {
                map.changeDragMode('measureLine', function (result) {
                    window.alert(result.pretty);
                });
            },
            OpenInfoWindow(InfoWindow, opts) {
                // 通用api
                if(marker.openInfoWindow) {
                    return marker.openInfoWindow(InfoWindow.html, true);
                }
                // 昆明api
                if(marker.openInfoWindowHtml) {
                    return marker.openInfoWindowHtml(InfoWindow.html, true);
                }
            },
            CloseInfoWindow(infoWindow) {
                
            },
            Polyline(points, lineSymbol) {
                lineSymbol = lineSymbol || CONF.lineSymbol;
                const {
                    strokeColor,
                    strokeWidth,
                    strokeOpacity,
                    strokeLineDash
                } = lineSymbol;
                let polyLineGraphic = new Polyline(points.toString(), strokeColor, strokeWidth, strokeOpacity, strokeLineDash);
                map.addOverlay(polyLineGraphic);
                overlays.push(polyLineGraphic);
                return polyLineGraphic;
            },
            SetCenter(center) {
                if(!map) return;
                map.centerAtLatLng(this.Point(center));
            },
            SetViewport(points) {
                let { lnt, lat, zoom } = Api.setViewport(points);
                this.CenterAndZoom([lnt, lat], zoom);
            },
            RemoverMarkerByKey(key, value) {
                if(!map) return;
                let len = overlays.length;
                for(let i = len - 1; i >= 0; i--) {
                    if(overlays[i][key] && overlays[i][key] === value) {
                        map.removeOverlay(overlays[i]);
                        overlays.splice(i, 1);
                    };
                }
            },
            RemoveOverlay(marker) {
                if(!map || !marker) return;
                map.removeOverlay(marker);
                avalon.Array.remove(overlays, marker);
            },
            RemoveOverlays() {
                if(!map) return;
                map.clear();
            }
        }
    }

    // openlayers 离线地图
    
    /**
     * openlayers 离线地图API
     * API文档：https://anzhihun.coding.me/ol3-primer/index.html （中文）
     *          https://openlayers.org/en/latest/apidoc/ （英文）
     * 示例文档：https://openlayers.org/en/latest/examples/
     * 
     */
    [OL]() {
        // 静态API依赖
        require('/vendor/openlayers/ol.css');
        let ol = require('/vendor/openlayers/ol.js');
        let proj4 = require('proj4');

        let Circle = ol.geom.Circle;
        let Draw = ol.interaction.Draw;
        let VectorLayer = ol.layer.Vector;
        let VectorSource = ol.source.Vector;
        let CircleStyle = ol.style.Circle;
        let Fill = ol.style.Fill;
        let Stroke = ol.style.Stroke;
        let Style = ol.style.Style;
        let unByKey = ol.Observable.unByKey;
        let Overlay = ol.Overlay;
        let getArea = ol.sphere.getArea;
        let getLength = ol.sphere.getLength;
        let LineString = ol.geom.LineString;
        let Polygon = ol.geom.Polygon;
        let measure;

        // 信息弹窗
        ol.Overlay.Popup = function(opt_options) {

            let options = opt_options || {};
        
            this.panMapIfOutOfView = options.panMapIfOutOfView;
            if (this.panMapIfOutOfView === undefined) {
                this.panMapIfOutOfView = true;
            }
        
            this.ani = options.ani;
            if (this.ani === undefined) {
                this.ani = ol.View.easing;
            }
        
            this.ani_opts = options.ani_opts;
            if (this.ani_opts === undefined) {
                this.ani_opts = {'duration': 250};
            }
        
            this.container = document.createElement('div');
            this.container.className = 'ol-popup';
        
            this.closer = document.createElement('a');
            this.closer.className = 'ol-popup-closer';
            this.closer.href = '#';
            this.container.appendChild(this.closer);
        
            let that = this;
            this.close = options.close || function() {};
            this.closer.addEventListener('click', function(evt) {
                that.container.style.display = 'none';
                that.closer.blur();
                evt.preventDefault();
                that.close();
            }, false);
        
            this.content = document.createElement('div');
            this.content.className = 'ol-popup-content';
            this.container.appendChild(this.content);
        
            ol.Overlay.call(this, {
                element: this.container,
                stopEvent: true
            });
        
        };
        
        ol.inherits(ol.Overlay.Popup, ol.Overlay);
        
        /**
         * Show the popup.
         * @param {ol.Coordinate} coord Where to anchor the popup.
         * @param {String} html String of HTML to display within the popup.
         */
        ol.Overlay.Popup.prototype.show = function(coord, html) {
            this.setPosition(coord);
            this.content.innerHTML = html;
            this.container.style.display = 'block';
        
            let content = this.content;
            window.setTimeout(function(){
                content.scrollTop = 0;
            }, 100);
            
            if (this.panMapIfOutOfView) {
                this.panIntoView_(coord);
            }
            return this;
        };
        
        /**
         * @private
         */
        ol.Overlay.Popup.prototype.panIntoView_ = function(coord) {
        
            let popSize = {
                    width: this.getElement().clientWidth + 20,
                    height: this.getElement().clientHeight + 20
                },
                mapSize = this.getMap().getSize();
        
            let tailHeight = 20,
                tailOffsetLeft = 60,
                tailOffsetRight = popSize.width - tailOffsetLeft,
                popOffset = this.getOffset(),
                popPx = this.getMap().getPixelFromCoordinate(coord);
        
            let fromLeft = (popPx[0] - tailOffsetLeft),
                fromRight = mapSize[0] - (popPx[0] + tailOffsetRight);
        
            let fromTop = popPx[1] - popSize.height + popOffset[1],
                fromBottom = mapSize[1] - (popPx[1] + tailHeight) - popOffset[1];
        
            let center = this.getMap().getView().getCenter(),
                px = this.getMap().getPixelFromCoordinate(center);
        
            if (fromRight < 0) {
                px[0] -= fromRight;
            } else if (fromLeft < 0) {
                px[0] += fromLeft;
            }
            
            if (fromTop < 0) {
                //px[1] = 170 + fromTop;
                px[1] += fromTop; //original
            } else if (fromBottom < 0) {
                px[1] -= fromBottom;
            }
        
            if (this.ani && this.ani_opts) {
                this.ani_opts.source = center;
                this.getMap().beforeRender(this.ani(this.ani_opts));
            }
            this.getMap().getView().setCenter(this.getMap().getCoordinateFromPixel(px));
        
            return this.getMap().getView().getCenter();
        
        };
        
        /**
         * Hide the popup.
         */
        ol.Overlay.Popup.prototype.hide = function() {
            this.container.style.display = 'none';
            this.close();
            return this;
        };

        // let Control = ol.control;
        // let RotateNorthControl = (function (Control) {
        //     function RotateNorthControl(opt_options) {
        //       let options = opt_options || {};
    
        //       let button = document.createElement('button');
        //       button.innerHTML = 'N';
    
        //       let element = document.createElement('div');
        //       element.className = 'rotate-north ol-unselectable ol-control';
        //       element.appendChild(button);
    
        //       Control.call(this, {
        //         element: element,
        //         target: options.target
        //       });
    
        //       button.addEventListener('click', this.handleRotateNorth.bind(this), false);
        //     }
    
        //     if ( Control ) RotateNorthControl.__proto__ = Control;
        //     RotateNorthControl.prototype = Object.create( Control && Control.prototype );
        //     RotateNorthControl.prototype.constructor = RotateNorthControl;
    
        //     RotateNorthControl.prototype.handleRotateNorth = function handleRotateNorth () {
        //       this.getMap().getView().setRotation(0);
        //     };
    
        //     return RotateNorthControl;
        //   }(Control));

        let layers = [];
        let overlays = [];

        let MAPCONFIG = {};

        return {
            Map: (id, opts) => {
                opts = (id && (typeof id === 'object') && !opts )? id : opts;

                //
                // 地图自定义配置
                //
                MAPCONFIG = {
                    'type': opts.$type, // baidu | google
                    'basemap': opts.basemap, // googlemaps | baidumaps
                    'center': opts.center,
                    'level': opts.level,
                    'minZoom': opts.minZoom,
                    'maxZoom': opts.maxZoom,
                    'attributions': ' 一体化管理平台离线地图服务 / GXX Leuom Offline Map © 2019 ',
                    // ************************************************************************************** //
                    // 以下内容不需要更改
                    // gps硬件/google地球：WGS84，google cn地图：GCJ02，baidu地图：BD09
                    // ************************************************************************************** //
                    'func_init': function() {
                        if( 'google' == this.type ) {
                            this.cfg_projection = 'EPSG:4326'; // 坐标投影：EPSG:4326 / BD-MC / EPSG:3857
                            // this.cfg_resolutions = [];
                        }else if( 'baidu' == this.type ) {
                            proj4.defs('EPSG:4008','+proj=longlat +ellps=clrk66 +no_defs');
                            proj4.defs('EPSG:4326','+proj=longlat +datum=WGS84 +no_defs');
                            proj4.defs('BD-MC','+proj=merc +lon_0=0 +units=m +ellps=clrk66 +no_defs');
                            ol.proj.proj4.register(proj4);
                            this.cfg_projection = 'BD-MC';
                            this.cfg_resolutions = [262144, 131072, 65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];
                        }
                    }
                };

                MAPCONFIG.func_init();

                // 定义一个地图调用函数 'google' == MAPCONFIG.type
                let BaseMapLayer = function(options) {
                    let mapExtent = [76,18,140,56]; // 中国的外包矩形坐标，地图视图的初始范围 [left, bottom, right, top]
                    let layer = new ol.layer.Tile({
                        extent: ol.proj.transformExtent(mapExtent, "EPSG:4326", "EPSG:3857"),
                        source: 'google' == MAPCONFIG.type ? 
                        new ol.source.XYZ({
                            url: options.url,
                            tilePixelRatio: 1,
                            minZoom: MAPCONFIG.minZoom,
                            maxZoom: MAPCONFIG.maxZoom,
                            attributions: MAPCONFIG.attributions
                        }) : 
                        new ol.source.TileImage({
                            projection: MAPCONFIG.cfg_projection,
                            tileGrid: new ol.tilegrid.TileGrid({
                                origin: [0,0],
                                resolutions: MAPCONFIG.cfg_resolutions
                            }),
                            tileUrlFunction: function(tileCoord, pixelRatio, proj){
                                return MAPCONFIG.basemap + '/' + tileCoord[0] +'/' + tileCoord[1] + '/' + tileCoord[2] + '.png';
                            },
                            attributions: MAPCONFIG.attributions
                        })
                    });
                    return layer;
                };

                // 定义视图
                let view = new ol.View({
                    center: ol.proj.fromLonLat(MAPCONFIG.center),
                    zoom: MAPCONFIG.level,
                    minZoom: MAPCONFIG.minZoom,
                    maxZoom: MAPCONFIG.maxZoom
                });

                // 定义地图服务URL
                let roadmapopt = {
                    url: MAPCONFIG.basemap + '/{z}/{x}/{y}.png'
                };
                // 添加一个显示经纬度调试地图瓦片网格的图层
                // let tiledebug = new ol.layer.Tile({
                //     source: new ol.source.TileDebug({
                //     projection: 'EPSG:4326',
                //     tileGrid: new ol.source.OSM().getTileGrid()
                //     })
                // });
                /**------------ 在线谷歌地图底图 start---------------------- */
                // let googleMapLayer = new ol.layer.Tile({
                //     source: new ol.source.XYZ({
                //         url:'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
                //     })
                // });
                /**------------ 在线谷歌地图底图 end---------------------- */

                /**------------ 在线百度地图底图 start---------------------- */
                // let resolutions = [];
                // let maxZoom = MAPCONFIG.maxZoom;

                // // 计算百度使用的分辨率
                // for(let i = 0; i <= maxZoom; i++){
                //     resolutions[i] = Math.pow(2, maxZoom - i);
                // }
                // let tilegrid  = new ol.tilegrid.TileGrid({
                //     origin: [0, 0],    // 设置原点坐标
                //     resolutions: resolutions    // 设置分辨率
                // });
                // proj4.defs('EPSG:4008','+proj=longlat +ellps=clrk66 +no_defs');
                // proj4.defs('EPSG:4326','+proj=longlat +datum=WGS84 +no_defs');
                // proj4.defs('BD-MC','+proj=merc +lon_0=0 +units=m +ellps=clrk66 +no_defs');
                // ol.proj.proj4.register(proj4);

                // // 创建百度地图的数据源
                // let baiduSource = new ol.source.TileImage({
                //     projection: 'BD-MC',    
                //     tileGrid: tilegrid,
                //     tileUrlFunction: function(tileCoord, pixelRatio, proj){
                //         let z = tileCoord[0];
                //         let x = tileCoord[1];
                //         let y = tileCoord[2];

                //         // 百度瓦片服务url将负数使用M前缀来标识
                //         if(x < 0){
                //             x = 'M' + (-x);
                //         }
                //         if(y<0){
                //             y = 'M' + (-y);
                //         }

                //         http://online2.map.bdimg.com/tile/?qt=vtile&x=1542&y=320&z=13&styles=pl&scaler=1&udt=20190905
                //         return 'http://online2.map.bdimg.com/tile/?qt=vtile&x='+ x +'&y='+ y +'&z='+ z +'&styles=pl&udt=20190905&scaler=1&p=0';
                //     }
                // });

                // // 百度地图层
                // let baiduMapLayer = new ol.layer.Tile({
                //     source: baiduSource
                // });
                /**------------ 在线百度地图底图 end---------------------- */ 

                // 地形图层组，可以加入多个图层，可通过visible属性切换
                let road = new ol.layer.Group({
                    layers: [
                        new BaseMapLayer(roadmapopt),
                        // googleMapLayer
                        // baiduMapLayer
                        // tiledebug,
                    ]
                });
                map = new ol.Map({
                    loadTilesWhileAnimating: true,
                    target: document.getElementById(id),
                    layers: [
                        road
                    ],
                    view: view,
                });

                // 测距方法初始化
                function initMeasureLength() {
                    let draw;
                    var source = new VectorSource();
                    // 距离线
                    var vector = new VectorLayer({
                        source: source,
                        style: new Style({
                            fill: new Fill({
                                color: 'rgba(255, 255, 255, 0.2)'
                            }),
                            stroke: new Stroke({
                                color: '#009BFF',
                                width: 2
                            }),
                            image: new CircleStyle({
                                radius: 7,
                                fill: new Fill({
                                    color: '#009BFF'
                                })
                            })
                        })
                    });
                
                    var sketch;
                    var helpTooltipElement;
                    var helpTooltip;
                    var measureTooltipElement;
                    var measureTooltip;
                    var continuePolygonMsg = '点击继续画多边形';
                    var continueLineMsg = '点击继续画线';
                    var continueCircleMsg = '选定半径后点击确定画圆';
                
                    var pointerMoveHandler = function(evt) {
                        if (evt.dragging) {
                            return;
                        }
                        /** @type {string} */
                        var helpMsg = '点击开始画线（Esc退出）';
                
                        if (sketch) {
                            var geom = (sketch.getGeometry());
                            if (geom instanceof Polygon) {
                            helpMsg = continuePolygonMsg;
                            } else if (geom instanceof LineString) {
                            helpMsg = continueLineMsg;
                            } else if (geom instanceof Circle) {
                            helpMsg = continueCircleMsg;
                            }
                        }
                
                        helpTooltipElement.innerHTML = helpMsg;
                        helpTooltip.setPosition(evt.coordinate);
                
                        helpTooltipElement.classList.remove('hidden');
                    };
                
                    map.addLayer(vector);
                
                    map.getViewport().addEventListener('mouseout', function() {
                        helpTooltipElement && helpTooltipElement.classList.add('hidden');
                    });
                
                    var typeSelect = {
                        value: 'length'
                    };
                    // global so we can remove it later
                
                    var formatLength = function(line) {
                        var length = getLength(line);
                        var output;
                        if (length > 100) {
                            output = (Math.round(length / 1000 * 100) / 100) +
                                ' ' + 'km';
                        } else {
                            output = (Math.round(length * 100) / 100) +
                                ' ' + 'm';
                        }
                        return output;
                    };
                
                    var formatArea = function(polygon) {
                        var area = getArea(polygon);
                        var output;
                        if (area > 10000) {
                            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
                        } else {
                            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
                        }
                        return output;
                    };
                
                    var formatCircle = function(circle) {
                        var output;
                        var centerLogLat = ol.proj.transform(circle.getCenter(), 'EPSG:3857', 'EPSG:4326');
                        var radius = circle.getRadius();
                        output = '圆心：' + centerLogLat + '<br> 半径：' + radius + 'm';
                        return output;
                    };
                    const {fillColor, strokeColor} = CONF.fillSymbol;
                
                    // 测距开始
                    function addInteraction() {
                        createMeasureTooltip();
                        createHelpTooltip();
                        map.on('pointermove', pointerMoveHandler);
                        var type = (typeSelect.value == 'area' ? 'Polygon' : (typeSelect.value == 'length' ? 'LineString' : 'Circle') );
                        draw = new Draw({
                            source: source,
                            type: type,
                            style: new Style({
                                fill: new Fill({
                                    color: fillColor
                                }),
                                stroke: new Stroke({
                                    color: strokeColor,
                                    lineDash: [10, 10],
                                    width: 2
                                }),
                                image: new CircleStyle({
                                    radius: 5,
                                    stroke: new Stroke({
                                        color: strokeColor
                                    }),
                                    fill: new Fill({
                                        color: fillColor
                                    })
                                })
                            })
                        });
                        map.addInteraction(draw);
                
                        var listener;
                        draw.on('drawstart',
                            function(evt) {
                                // set sketch
                                sketch = evt.feature;
                
                                /** @type {module:ol/coordinate~Coordinate|undefined} */
                                var tooltipCoord = evt.coordinate;
                
                                listener = sketch.getGeometry().on('change', function(evt) {
                                    var geom = evt.target;
                                    var output;
                                    if (geom instanceof Polygon) {
                                        output = formatArea(geom);
                                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                                    } else if (geom instanceof LineString) {
                                        output = formatLength(geom);
                                        tooltipCoord = geom.getLastCoordinate();
                                    } else if (geom instanceof Circle) { ////
                                        output = formatCircle(geom);
                                        tooltipCoord = geom.getLastCoordinate();
                                    }
                                    measureTooltipElement.innerHTML = output;
                                    measureTooltip.setPosition(tooltipCoord);
                                });
                            }, 
                        this);
                
                        draw.on('drawend',
                            function() {
                                measureTooltipElement.className = 'tooltip tooltip-static';
                                measureTooltip.setOffset([0, -7]);
                                // unset sketch
                                sketch = null;
                                // unset tooltip so that a new one can be created
                                measureTooltipElement = null;
                                createMeasureTooltip();
                                unByKey(listener);
                            }, 
                        this);
                    }
                
                    // 清除测距覆盖物
                    function removeInteraction() {
                        vector.getSource().clear();
                        draw && map.removeInteraction(draw);
                        helpTooltip && map.removeOverlay(helpTooltip);
                        $('#allmap .ol-selectable').remove();
                    }
                
                    // 生成跟随鼠标的 tooltip 
                    function createHelpTooltip() {
                        if (helpTooltipElement) {
                            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
                        }
                        helpTooltipElement = document.createElement('div');
                        helpTooltipElement.className = 'tooltip hidden';
                        helpTooltip = new Overlay({
                            element: helpTooltipElement,
                            offset: [15, 0],
                            positioning: 'center-left'
                        });
                        map.addOverlay(helpTooltip);
                    }
                
                    // 生成测量结果 tooltip
                    function createMeasureTooltip() {
                        if (measureTooltipElement) {
                            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
                        }
                        measureTooltipElement = document.createElement('div');
                        measureTooltipElement.className = 'tooltip tooltip-measure';
                        measureTooltip = new Overlay({
                            element: measureTooltipElement,
                            offset: [0, -15],
                            positioning: 'bottom-center'
                        });
                        map.addOverlay(measureTooltip);
                    }
                
                    $(parent.document).keydown((e) => {
                        if(e.which === 27) {
                            removeInteraction();
                        }
                    });
                
                    return {
                        addInteraction,
                        removeInteraction
                    }
                }
                measure = initMeasureLength();
                return map;
            },
            Point: (args) => {
                return ol.proj.fromLonLat([args[0], args[1]]);
            },
            AddControl() {
                // 定义地图控件
                let control = [
                    // 属性版权
                    // new ol.control.Attribution({
                    //     collapsible: false,
                    //     collapsed: false
                    // }),
                    // 全屏
                    // 鼠标定位
                    // new ol.control.MousePosition({
                    //     coordinateFormat: function (coordinate) {
                    //         return ol.coordinate.format(coordinate, '经度:{x}，纬度:{y}', 12);
                    //     },
                    //     projection: 'EPSG:4326',
                    //     undefinedHTML: '&nbsp;'
                    // }),
                    // 鹰眼（缩略图）
                    // new ol.control.OverviewMap({
                    //   tipLabel: '小地图',
                    //   collapsed: false
                    // }),
                    // new ol.control.Rotate({
                    //     // autoHide: false
                    // }),
                    new ol.control.FullScreen(),
                    // 旋转
                    // 比例尺
                    new ol.control.ScaleLine(),
                    // 缩放
                    new ol.control.Zoom(),
                    // 滑动条
                    new ol.control.ZoomSlider(),
                    // new RotateNorthControl()
                    // 适配到地图初始
                    // new ol.control.ZoomToExtent({
                    // // extent:[7,7,7,17]
                    // })
                ]
                control.forEach((value) => {
                    map.addControl(value);
                })

                // 添加定位到初始位置控件
                let viewport = map.getViewport();
                $(viewport).append('<div id="ol-locate" class="ol-control"><button type="button" title="定位到初始位置"><i class="fa fa-location-arrow"></i></button></div>');
                // 监听按钮点击事件，执行相关定位操作
                document.getElementById('ol-locate').onclick = function() {
                    let center = ol.proj.fromLonLat(MAPCONFIG.center);
                    // 先后循序影响动画效果，分开对象写就按顺序分别执行，若写同一个对象则同时执行
                    map.getView().animate({
                        center: center,
                        zoom: MAPCONFIG.level
                    });
                }
                $('#allmap .ol-full-screen-false').attr('title', '全屏切换');
                return map;
            },
            CenterAndZoom(center, level) {
                map.getView().setCenter(ol.proj.fromLonLat(center));
                map.getView().setZoom(level);
            },
            Circle(center, radius) {
                const {fillColor, strokeColor} = CONF.fillSymbol;
                let sourceCircle = new VectorSource();
                let vectorCircle = new VectorLayer({
                    source: sourceCircle,
                    style: new Style({
                        fill: new Fill({ // 矢量图层填充颜色，以及透明度
                            color: fillColor
                        }),
                        stroke: new Stroke({ // 边界样式
                            color: strokeColor,
                            width: 2
                        }),
                        image: new CircleStyle({ // 图片样式
                            radius: 7,
                            fill: new Fill({
                                color: fillColor
                            })
                        })
                    })
                });
                map.addLayer(vectorCircle);
                sourceCircle.addFeature(new ol.Feature(new Circle(ol.proj.fromLonLat(center), Number(radius))));
                layers.push(vectorCircle);
                return vectorCircle;
            },
            CreateMarker({picture, text, popup, point}) {
                let sourceMarker = new VectorSource();
                let vectorMarker = new VectorLayer({
                    source: sourceMarker
                });
                let style = []
                if(picture) style.push(picture);
                if(text) style.push(text);
                let featurePoint = new ol.Feature({
                    type: 'click',
                    desc: popup, // 将 popup 存储在 desc 字段中
                    geometry: new ol.geom.Point(ol.proj.fromLonLat(point))
                });
                featurePoint.setStyle(style);
                map.addLayer(vectorMarker);
                layers.push(vectorMarker);
                sourceMarker.addFeature(featurePoint);
                if(popup) {
                    vectorMarker.popup = popup;
                    vectorMarker.singleclickListener = function(evt) {
                        let f = map.forEachFeatureAtPixel(
                            evt.pixel,
                            function(ft, layer){
                                return ft;
                            }
                        );
                        if (f && f.get('type') == 'click') {
                            let geometry = f.getGeometry();
                            let coord = geometry.getCoordinates();
                            let popup  = f.get('desc')
                            let content = popup.$content;
                            popup.show(coord, content);
                        } else {
                            popup.hide();
                        }
                    };
                    map.on('singleclick', vectorMarker.singleclickListener);
                }
                vectorMarker.$popupSymbol = popup;
                return vectorMarker;
            },
            CreatePicSymbol(opts) {
                let { width, height, url } = opts;
                let offset = [0, 0];
                if(opts) {
                    offset = opts.offset || [0, 0];
                }
                return new Style({
                    image: new ol.style.Icon(({
                        scale: 1,
                        rotateWithView: false,
                        anchor: [width / 2, height],
                        offset: offset,
                        anchorXUnits: 'pixels',
                        anchorYUnits: 'pixels',
                        opacity: 1,
                        size: [width, height],
                        src: url
                    })),
                    zIndex: 5
                });
            },
            CreateTextSymbol(text, opts) {
                return new Style({
                    text: new ol.style.Text({
                        font: `${CONF.fontSize}px Calibri,sans-serif`,
                        offsetX: (opts && opts.offset && opts.offset[0]) || 0,
                        offsetY: ((opts && opts.offset && opts.offset[1]) || 0) + 10,
                        fill: new ol.style.Fill({
                            color: CONF.fontColor
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#fff', 
                            width: 2
                        }),
                        text: text || '-'
                    }),
                    zIndex: (opts && opts.zIndex) || 0
                });
            },
            InfoWindow(html, opts) {
                let popup = new ol.Overlay.Popup({
                    close: opts.close
                });
                popup.setOffset([0, -60]);
                popup.$content = html;
                map.addOverlay(popup);
                overlays.push(popup);
                return popup;
            },
            MeasureLength() {
                measure.removeInteraction();
                measure.addInteraction();
            },
            OpenInfoWindow(InfoWindow, opts) {
                return InfoWindow.show(opts.center, opts.content);
            },
            CloseInfoWindow(infoWindow) {
                infoWindow.hide();
            },
            Polyline(points, lineSymbol) {
                let arrays = avalon.mix(true, [], points);
                const {
                    strokeColor,
                    strokeWidth
                } = lineSymbol || CONF.lineSymbol;

                // 轨迹
                let source = new VectorSource();
                let layer = new VectorLayer({
                    source: source,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 0, 0.5)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: strokeColor,
                            width: strokeWidth
                        })
                    })
                });
                let line = new ol.geom.LineString(
                    arrays.map((point) => {
                        return ol.proj.fromLonLat(point);
                    })
                );
                let feature = new ol.Feature({
                    geometry: line
                });
                source.addFeature(feature);
                map.addLayer(layer);
                layers.push(layer);
                return layer;
            },
            SetCenter(center) {
                if(!map) return;
                map.getView().setCenter(ol.proj.fromLonLat(center));
            },
            SetViewport(points) {
                let { lnt, lat, zoom } = Api.setViewport(points);
                this.CenterAndZoom([lnt, lat], zoom);
            },
            RemoverMarkerByKey(key, value) {
                if(!map) return;
                let len = layers.length;
                for(let i = len - 1; i >= 0; i--) {
                    if(layers[i][key] && layers[i][key] === value) {
                        // 移除监听singleclick事件
                        if(layers[i].hasOwnProperty('singleclickListener') && layers[i].singleclickListener) {
                            map.un('singleclick', layers[i].singleclickListener);
                        }
                        layers[i].getSource().clear();
                        layers.splice(i, 1);
                    };
                }
                len = overlays.length;
                for(let i = len - 1; i >= 0; i--) {
                    if(overlays[i][key] && overlays[i][key] === value) {
                        map.removeOverlay(overlays[i]);
                        overlays.splice(i, 1);
                    };
                }
            },
            RemoveOverlay(marker) {
                if(!map || !marker) return;
                if(marker.hasOwnProperty('$popupSymbol') && marker.$popupSymbol) {
                    map.removeOverlay(marker.$popupSymbol);
                    avalon.Array.remove(overlays, marker.$popupSymbol);
                    marker.$popupSymbol = null;
                }
                marker.getSource().clear();
                avalon.Array.remove(layers, marker);
            },
            RemoveOverlays() {
                if(!map) return;
                let ovarlays = map.getOverlays().array_;
                // 第一层 layers 是瓦片图层，故截取
                let layers = map.getLayers().array_.slice(1);
                if(ovarlays.length > 0) {
                    for (let i = 0; i < ovarlays.length; i++) {
                        map.removeOverlay(ovarlays[i]);
                    }
                }
                if(layers.length > 0) {
                    for (let i = 0; i < layers.length; i++) {
                        map.removeLayer(layers[i]);
                    }
                }
            }
        }
    } 
}

export default Api;