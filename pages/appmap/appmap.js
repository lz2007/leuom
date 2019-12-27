import avalon from 'avalon2';
import jQuery from 'jquery';
global.$ = jQuery;
let {
  allMapConfig
} = require('/services/configService');

require('/vendor/openlayers/ol.css');
require('./appmap.css');
let ol = require('/vendor/openlayers/ol.js');
import gcoord from 'gcoord'; // 坐标系转换工具

//
// 地图自定义配置
//

var map = null;
var MAPCONFIG = {
  'appmap_basemap': allMapConfig.mode, // baidu | google
  'appmap_center': allMapConfig.center, // gxx building
  'appmap_setZoom': 17,
  'appmap_minZoom': 7,
  'appmap_maxZoom': 18,
  'appmap_offlineurl': allMapConfig.basemap, // googlemaps | baidumaps
  // ************************************************************************************** //
  // 以下内容不需要更改
  // gps硬件/google地球：WGS84，google cn地图：GCJ02，baidu地图：BD09
  // ************************************************************************************** //
  'func_init': function () {
    if ('google' == this.appmap_basemap) {
      this.appmap_center = gcoord.transform(this.appmap_center, gcoord.WGS84, gcoord.GCJ02);
      this.cfg_projection = 'EPSG:4326'; // 坐标投影：EPSG:4326 / BD-MC / EPSG:3857
    }
  }
};

avalon.define({ $id: "appMap" }).$watch('onReady', function () {
  // 地图初始化 begin

  // 初始化 MAPCONFIG
  MAPCONFIG.func_init();
  // 定义一个地图调用函数 'google' == MAPCONFIG.appmap_basemap
  var BaseMapLayer = function (options) {
    var mapExtent = [76, 18, 140, 56]; // 中国的外包矩形坐标，地图视图的初始范围 [left, bottom, right, top]

    var layer = new ol.layer.Tile({
      extent: ol.proj.transformExtent(mapExtent, "EPSG:4326", "EPSG:3857"),
      source: new ol.source.XYZ({
        url: options.url,
        tilePixelRatio: 1,
        minZoom: MAPCONFIG.appmap_minZoom,
        maxZoom: MAPCONFIG.appmap_maxZoom,
      })
    });

    return layer;
  };

  // 定义视图
  var view = new ol.View({
    center: ol.proj.fromLonLat(MAPCONFIG.appmap_center),
    zoom: MAPCONFIG.appmap_setZoom,
    minZoom: MAPCONFIG.appmap_minZoom,
    maxZoom: MAPCONFIG.appmap_maxZoom
  });

  // 定义地图控件
  var control = new ol.control.defaults({
    attributionOptions: ({
      collapsible: false,
    })
  });

  // 定义地图服务URL
  var roadmapopt = {
    url: MAPCONFIG.appmap_offlineurl + '/{z}/{x}/{y}.png'
  };

  // 地形图层组
  var enBasemap = allMapConfig.basemap_extra;
  var road = new ol.layer.Group({
    layers: [
      new BaseMapLayer({ url: enBasemap + '/{z}/{x}/{y}.png', visible: false }),
      new BaseMapLayer({ ...roadmapopt, visible: true }),
    ]
  });

  // 创建地图
  map = new ol.Map({
    loadTilesWhileAnimating: true,
    view: view,
    layers: [
      road
    ],
    controls: control,
    target: this.$element
  });

  var updateGpsArr = [];//存放已添加的标注物
  avalon.define({ $id: 'gpsOverlay' }).$watch('onReady', function () {

  });

  var updatemarkerArr = [];//存放已添加的标注物
  avalon.define({ $id: 'olanchor' }).$watch('onReady', function () {

  });

  window.APPMAP = {
    // 地图中英文设置的接口
    setMapLanguageType: function (mapType) {
      if (!mapType) return '无中英文参数信息，无法设置！';

      if (mapType == 'zh') {
        let layers = road.getLayers();
        layers.array_[0].set('visible', false);
        layers.array_[1].set('visible', true);
        return '设置中文地图成功';
      } else if (mapType == 'en') {
        let layers = road.getLayers();
        layers.array_[0].set('visible', true);
        layers.array_[1].set('visible', false);
        return '设置英文地图成功';
      } else {
        return '参数信息有误，无法设置地图中英文！';
      };
    },
    // 获取设备信息
    receiverDeviceInfo: function (deviceInfoList) {
      if (updatemarkerArr) {
        for (var i = 0; i < updatemarkerArr.length; i++) {
          map.removeOverlay(updatemarkerArr[i]);
          updatemarkerArr.splice(i--, 1);
        };
        $('#olanchor').children().remove();
      };
      if (!deviceInfoList) return '参数为空，没有设备信息';

      var deviceInfoList = JSON.parse(deviceInfoList);
      for (var i = 0; i < deviceInfoList.length; i++) {
        if (!deviceInfoList[i].longitude || !deviceInfoList[i].latitude) {
          continue;
        };
        var theOlanchor = $('#olanchor');
        var newmarkerDiv = $(`<div class='markerDiv' id="olanchor${i}" style="z-index:10">
              <img src='/static/image/appmap_img/ic_device_unchecked.png' height='60' alt='添加覆盖物 ol.Overlay' class='imgOlanchor' />
              <img src='/static/image/appmap_img/bg_device_unchecked.png' alt='对应人员名字' class='nameDevice' />
              <span class='nameSpan'>${deviceInfoList[i].userName || deviceInfoList[i].deviceName || ' '}</span>
           </div>`);
        newmarkerDiv.appendTo(theOlanchor);
        var anchor = new ol.Overlay({
          id: 'olanchor' + i,
          element: newmarkerDiv[0],
        });
        var markerArr = [deviceInfoList[i].longitude, deviceInfoList[i].latitude];
        markerArr = gcoord.transform(markerArr, gcoord.WGS84, gcoord.GCJ02);
        anchor.setOffset([-25, -40]);
        anchor.setPosition(ol.proj.fromLonLat(markerArr)); // 关键的一点，需要设置附加到地图上的位置
        map.addOverlay(anchor); // 然后添加到map上
        updatemarkerArr.push(anchor);
      };

      $('.markerDiv').on('click', function () {
        //防止多次点击导致重复发送信息
        if ($(this).hasClass('markerDzIndex')) {
          return;
        };
        $('.markerDiv').removeClass('markerDzIndex');
        $(this).addClass('markerDzIndex');
        $('.imgOlanchor').attr('src', '/static/image/appmap_img/ic_device_unchecked.png');
        $('.nameDevice').attr('src', '/static/image/appmap_img/bg_device_unchecked.png');
        $('.nameSpan').removeClass('nameSpanCheck');
        $(this).children('.imgOlanchor').attr('src', '/static/image/appmap_img/ic_device_checked.png');
        $(this).children('.nameDevice').attr('src', '/static/image/appmap_img/bg_device_checked.png');
        $(this).children('.nameSpan').addClass('nameSpanCheck');

        var overlayClickId = $(this).context.id;//获取到所点击的标注物的id
        var numDeviceGpsInfo = overlayClickId.substr(overlayClickId.length - 1, 1);//获取到接收到的deviceGpsInfo的序号

        var toPos = gcoord.transform([deviceInfoList[numDeviceGpsInfo].longitude, deviceInfoList[numDeviceGpsInfo].latitude], gcoord.WGS84, gcoord.GCJ02);
        toPos = ol.proj.fromLonLat(toPos);
        view.animate({ center: toPos }, { zoom: 14 });

        let strListInfo = JSON.stringify(deviceInfoList[numDeviceGpsInfo]);
        // 发送所点击设备信息
        window.AndroidMap.androidShowDeviceInfo(strListInfo);
      });
      return '获取设备信息成功';
    },
    // 地图显示当前定位
    receiverGpsInfo: function (gpsInfo) {
      if (!updateGpsArr) {
        map.removeOverlay(updateGpsArr[0]);
        updateGpsArr.splice(0);
      };
      if (!gpsInfo) return '无参数返回，无法定位。';
      gpsInfo = JSON.parse(gpsInfo);
      if (!gpsInfo.longitude || !gpsInfo.latitude) {
        return '缺失了经度或者纬度';
      };
      let toPos = gcoord.transform([gpsInfo.longitude, gpsInfo.latitude], gcoord.WGS84, gcoord.GCJ02);
      toPos = ol.proj.fromLonLat(toPos);
      let newmarkerGps = $(`<div class='gpsOverlay' id="gpsOverlay"><img src="/static/image/appmap_img/gps_point.png" width="30"></div>`);
      var gpsOverlay = new ol.Overlay({
        id: 'gpsOverlay',
        element: newmarkerGps[0],
      });
      gpsOverlay.setOffset([-40, -40]);
      gpsOverlay.setPosition(toPos);
      map.addOverlay(gpsOverlay);
      updateGpsArr.push(gpsOverlay);
      view.animate({ center: toPos }, { zoom: 10 });
      return '定位成功！';
    },
  };
});

avalon.ready(function () {
  avalon.scan(document.body);
});