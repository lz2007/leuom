require('./allmap.less');
import Allmap from '/apps/allmap/allmap-map';
import { allMapConfig } from '/services/configService.js';
import { notification } from "ane";
const storage = require('../../services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;
let { mode, center, level, basemap, maxZoom, minZoom, coord: {from, to}, accessToken, solution, version } = allMapConfig;

let map = null;
let allmap_vm = avalon.define({
    $id: 'allmap',
    mode
});

allmap_vm.$watch('onReady', () => {
    map = new Allmap({
        el: 'allmap',
        mode: mode,
        center: center,
        level: level,
        basemap: basemap,
        // 地图最大缩放等级
        maxZoom: maxZoom,
        // 地图最小缩放等级
        minZoom: minZoom,
        from: from,
        to: to,
        accessToken: accessToken,
        // 底图样式 id
        solution: solution,
        // 版本号
        version: version,
    });
    avalon.log(mode + '地图初始化完成');
    // 添加地图控件
    map.addControl();

    window.loadMapCompelete = true;

    // //轨迹起点symbol
    window.startSymbol = window.esriMap.createPicSymbol(33, 48, "../../static/image/sszhxt/begin.png");
    //轨迹终点symbol
    window.endSymbol = window.esriMap.createPicSymbol(33, 48, "../../static/image/sszhxt/end.png");
    //位置symbol
    window.locationSymbol = window.esriMap.createPicSymbol(40, 60, "../../static/image/sszhxt/locate_md.png");

    // 通过 configService.js 的 defalutCity 来进行定位
    let mapCity = storage.getItem('currentDefaultCity');
    if (mapCity && mapCity.getCityComplete) {
        map.centerAndZoom([mapCity.lon, mapCity.lat], level);
    } else {
        // 防止获取城市请求还没结束就加载了地图
        let time = 0;
        let seconds = 60; // 60s请求无返回后自动清除定时器
        let timer = setInterval(() => {
            if (mapCity && mapCity.getCityComplete) {
                clearInterval(timer);
                map.centerAndZoom([mapCity.lon, mapCity.lat], level);
            }
            time++;
            if (time > (seconds * 5)) {
                clearInterval(timer);
            }
        }, 200);
    }
});

var markerArr = new Array; //标签数组
var infoWindowShowing = {}; //保存信息窗口打开信息
var recordOrlockDevice = {}; //保存正在录像或锁定的设备,gbcode.record = true|false,gbcode.lock=true|false

window.lineSymbol = {
    strokeColor: '#FF0000',
    strokeOpacity: 1,
    strokeWidth: 2
};
window.playVideo = function (gbcode, username, usercode, signal, name, mytype, myData) {
    var data = JSON.parse(myData);
    if (mytype == 0) {
        data.channelSet = '';
    }
    parent.avalon.vmodels['mapinfowindow'].playVideo(gbcode, username, usercode, signal, name, mytype, data.children);
}
window.startTalk = function (gbcode, username, usercode, signal, symbol, mytype) {
    if (symbol != 'false') {
        var person = username + '(' + usercode + ')';
        parent.avalon.vmodels['deviceInfoPop'].call(gbcode, person, signal);
        return;
    }
    parent.avalon.vmodels['mapinfowindow'].startTalk(gbcode, username, usercode, signal, mytype);
}
window.photograph = function (gbcode) {
    parent.avalon.vmodels['mapinfowindow'].photograph(gbcode);
}
window.lock = function (gbcode) {
    var judge = judgeLock(gbcode);
    parent.avalon.vmodels['mapinfowindow'].lock(gbcode, !judge);
}
window.record = function (gbcode) {
    var judegRecord = judgeRecord(gbcode);
    parent.avalon.vmodels['mapinfowindow'].record(gbcode, !judegRecord);
}
//改变span样式
window.changeSpanCss = function (symbol) {
    if (symbol) {
        $('#onspan').css({
            color: '#999999',
            background: '#cccccc'
        });
        $('#offspan').css({
            color: '#FFFFFF',
            background: '#30ff00'
        });
    } else {
        $('#offspan').css({
            color: '#999999',
            background: '#cccccc'
        });
        $('#onspan').css({
            color: '#FFFFFF',
            background: '#30ff00'
        });
    }

}
//增加锁定背景
window.addOrRemoveMask = function (symbol, tipword, end) {
    if (symbol) {
        var content = '<div id="lockMask" style="width: 100%;height: 100%;position: absolute;top: 0px;background: black;z-index: 9999;opacity: 0.4;filter:alpha(opacity=50);text-align: center">';
        content += '<div style="position: relative;top: 46%;color: #ffffff;font-size: 25px;">';
        if (end) content += '<span style="background: url(/static/image/tyywglpt/loading.gif) center center no-repeat;display: inline-block;width: 45px;height: 20px;"></span>';
        content += '<span>' + tipword + '</span></div></div>';
        $('.esriPopupWrapper').append(content);
    } else {
        $('#lockMask').remove();
    }

}
//disable button
window.disableOrActiveButton = function (symbol) {
    if (symbol) {
        $("#videobutton").attr({
            disabled: 'disabled'
        });
        $("#photobutton").attr({
            disabled: 'disabled'
        });
        $("#onspan").attr({
            disabled: 'disabled'
        });
        $("#offspan").attr({
            disabled: 'disabled'
        });
        let text = getLan().remoteUnlock;
        $("#lockbutton").text(text);
    } else {
        $("#videobutton").removeAttr('disabled');
        $("#photobutton").removeAttr('disabled');
        $("#onspan").removeAttr('disabled');
        $("#offspan").removeAttr('disabled');
        let text = getLan().remoteLock;
        $("#lockbutton").text(text);

    }
}
//记录录像或锁定的设备
window.settleData = function (gbcode, symbolrecord, symbollock) {
    if (!recordOrlockDevice[gbcode]) {
        recordOrlockDevice[gbcode] = {};
    }
    recordOrlockDevice[gbcode].record = symbolrecord;
    recordOrlockDevice[gbcode].lock = symbollock;
}
//判断设备是否是lock
window.judgeLock = function (gbcode) {
    if (recordOrlockDevice[gbcode] && recordOrlockDevice[gbcode].lock) {
        return true;
    }
    return false;
}
//判断是否在录像
window.judgeRecord = function (gbcode) {
    if (recordOrlockDevice[gbcode] && recordOrlockDevice[gbcode].record) {
        return true;
    }
    return false;
}
window.closeEvn = function () {
    var key;
    for (key in infoWindowShowing) {
        infoWindowShowing[key] = 0;
    }
}
window.esriMap = {
    clearMapData: function () {
        markerArr = [];
        infoWindowShowing = {};
        recordOrlockDevice = {};
    },
    // 清除覆盖物及相关数据
    remove_overlay: function () {
        this.clearDrawLayer();
        this.clearMapData();
    },
    // 清除覆盖物
    clearDrawLayer: function () {
        map && map.removeOverlays();
    },
    getRecordData() {
        return recordOrlockDevice;
    },
    setMapCenter: function (lon, lat, level) {
        map && map.centerAndZoom([lon, lat], level);
    },
    setCenterAt: function (lon, lat) {
        map && map.setCenter([lon, lat]);
    },
    setViewport: function (points) {
        map && map.setViewport(points);
    },
    createCircle: function (point, distance) {
        return map.Circle(point, distance);
    },
    /**
     * 新建地图更新点
     *
     * @param {*} data 设备数据
     * @param {*} center 是否设置为中心点
     * @param {*} isUpdating 数据来源于更新
     */
    createMarker: function (data, center, isUpdating) { //增加标记物
        // if (!data.userName) {
        //     data.userName = '-';
        // }
        // if (!data.userCode) {
        //     data.userCode = '-';
        // }
        if (!data.battery) {
            data.battery = 0;
        }
        if (!data.capacityTotal) {
            data.capacityTotal = 0;
        }
        if (!data.capacityUsed) {
            data.capacityUsed = 0;
        }
        if (!data.speed) {
            data.speed = 0;
        }
        if (!data.signal) {
            data.signal = 0;
        }
        if (!data.deviceName) {
            data.deviceName = '-';
        }
        if (data.videoStatus == 0) {
            data.videoStatus = false;
        } else {
            data.videoStatus = true;
        }
        if (data.locked != undefined && data.locked == 0) {
            data.locked = false;
        } else if (data.locked != undefined && data.locked != 0) {
            data.locked = true;
        }
        //本域执法仪才有锁定等这些功能
        if (data.mytype == 0 && !data.source) {
            settleData(data.gbcode, data.videoStatus, data.locked);
        } else {
            data.source = data.platformGbcode;
        }

        let iconUrl = "";
        let icon_h = 60;
        let icon_w = 40;
        if (data.isRealTimeView) {
            data.deviceType = 'DSJ';
        }
        if (data.mytype == 2) { //
            data.deviceType = 2;
        } else if (data.mytype == 1) {
            data.deviceType = 3;
        } else if (data.mytype == 3) {
            data.deviceType = 4;
        } else {
            data.deviceType = 'DSJ';
        }
        switch (data.deviceType) {
            case 'DSJ':
                iconUrl = "../../static/image/theme/sszhxt/mapIcon/dev-locate.png";
                icon_h = icon_h;
                icon_w = icon_w;
                break;
            case 2:
                iconUrl = "../../static/image/theme/sszhxt/mapIcon/car-locate.png";
                break;
            case 3:
                iconUrl = "../../static/image/theme/sszhxt/mapIcon/fastDomeCameras-locate.png";
                break;
            case 4:
                iconUrl = "../../static/image/theme/sszhxt/mapIcon/drone-locate.png";
                break;

            default:
                iconUrl = "../../static/image/theme/sszhxt/mapIcon/dev-locate.png";
        }
        let circle;
        let radius = parent.avalon.vmodels['sszh-bkfw-vm'].radius; // 布控范围半径
        if (data.sosSource == "FACE_MONITORING" || data.showType && data.showType == "FACE_MONITORING") {
            iconUrl = "../../static/image/sszhxt-sszh/face_monitor.png";
            icon_h = icon_h;
            icon_w = icon_w;
        } else if (data.sosSource == "CAR_MONITORING" || data.showType && data.showType == "CAR_MONITORING") {
            iconUrl = "../../static/image/sszhxt-sszh/car_monitor.png";
            icon_h = icon_h;
            icon_w = icon_w;
        }
        if (data.executeControlClick) { // 点击布控按钮后画圆
            esriMap.createCircle([data.longitude, data.latitude], radius);
            circle.userCode = data.userCode;
            circle.name = data.userName || '-';
            circle.gbcode = data.gbcode || '-';
            markerArr.push(circle);
        }
        let curPoint = [data.longitude, data.latitude];
        let content = "";
        content += '<h4 class="popup-title">设备信息</h4><div class="infowindowcontainer" style="font-size: 16px;color:#fff;word-break: break-all;">';

        //本域执法仪才有
        if (data.mytype == 0 && !data.source) {
            if (data.userName || data.userCode) {
                content += '<p>' + getLan().mapDialogRowPolice + ':<span style="margin-left:18px;"> ' + data.userName + '(' + data.userCode + ')</span></p>';
            } else {
                content += '<p>' + getLan().mapDialogRowDeviceName + ': <span style="margin-left:18px;">' + data.deviceName + '</span></p>';
            }
            content += '<p class="deviceID">' + getLan().mapDialogRowGbcode + ': <span style="margin-left:18px;">' + data.gbcode + '</span></p>';
        } else {
            if (data.mytype == 0) {
                data.type = '执法仪记录仪';
                data.name = data.deviceName;
            }
            content += '<p>' + getLan().mapDialogRowDeviceName + '：<span style="margin-left:18px;">' + data.deviceName + '</span></p>';
            content += '<p>' + getLan().mapDialogRowDeviceType + '：<span style="margin-left:18px;">' + data.typeName + '</span></p>';
            content += '<p>' + getLan().mapDialogRowDeviceModel + '：<span style="margin-left:18px;">' + data.model + '</span></p>';
        }

        //区分级联和设备接入,并且这个设备必须是执法仪才有这些东西
        var lowBatteryTips = '<span style="margin-left: 50px;color: #d72222;">电量不足</span>';
        if (data.battery > 10) lowBatteryTips = '';
        if (!data.source && data.mytype == 0) {
            var width = data.battery / 100 * 38 + 'px';
            if (!width) width = '0px';
            content += '<p style="position: relative;">' + getLan().mapDialogRowBattery + ': <span style="display:inline-block;width: 42px;height: 20px;background:url(/static/image/theme/sszhxt/mapIcon/battery.png) no-repeat scroll;vertical-align: middle;margin-left: 18px;position: relative;"></span>';
            if (Number(data.battery) <= 25) {
                content += '<span style="width:' + width + ';height: 18px;background: #d72222;position:  relative;left: -41px;vertical-align:top;top:3px;border-radius: 4px;display: inline-block;"></span>';
            } else if (Number(data.battery) <= 45) {
                content += '<span style="width:' + width + ';height: 18px;background: orange;position:  relative;left: -41px;vertical-align:top;top:3px;border-radius: 4px;display: inline-block;"></span>';
            } else {
                content += '<span style="width:' + width + ';height: 18px;background: #30ff00;position:  relative;left: -41px;vertical-align:top;top:3px;border-radius: 4px;display: inline-block;"></span>';
            }
            content += '<span style="position:  absolute;left: 146px;top:1px;z-index: 1;">' + data.battery + '%</span>' + lowBatteryTips + '</p>';
            content += '<p>剩余容量：<span style="margin-left:18px;">' + data.remainingCapacity + 'GB</span></p>';
            // var zrl = data.capacityTotal;
            // var sum = zrl - data.capacityUsed; //剩余容量
            // var syrl = sum > 0 ? sum : 0;
            // var spanwidth;
            // if (zrl) {
            //     spanwidth = data.capacityUsed / zrl * 310;
            // } else {
            //     spanwidth = 0;
            // }
            // var spanTwowidth;
            // spanTwowidth = spanwidth ? spanTwowidth = spanwidth / 4 + 80 + 'px' : spanTwowidth = '80px';
            // spanwidth ? spanwidth = spanwidth + 'px' : spanwidth = '0px';
            // content += '<p style="white-space: nowrap;margin: 0;">' + getLan().mapDialogRowStorage + ': <span style="display: inline-block;width: 310px;height: 20px;background: #203b6d;font-size: 12px;margin-left: 18px;">';
            // content += '<span style="display:inline-block;height: 20px;vertical-align:top;background:#a7ddff;width:' + spanwidth + '"></span>';
            // content += '<span style="color:#ffffff;position: absolute;left: ' + spanTwowidth + ';vertical-align: top;"></span></span>';
            // content += '<p style="display: inline-block; margin-left: 94px;">总容量：' + zrl + 'GB</p><p style="display: inline-block;margin-left: 20px;">剩余容量：' + syrl + 'GB</p></p>';
            //content += '<p>速度: ' + data.speed + 'm/s</p>';
            // let signalword = '';
            // if (data.signal < 15) {
            //     signalword = '差';
            // } else if (data.signal > 50) {
            //     signalword = '优';
            // } else {
            //     signalword = '良';
            // }
            // content += '<p>信号强度: ' + signalword + '</p>';
            var spancontent = '';
            if (recordOrlockDevice[data.gbcode] && !recordOrlockDevice[data.gbcode].record || data.vedioStatus) {
                if (data.locked) {
                    spancontent = '<button id="onspan" disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">ON</button><button disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #30ff00;color: #ffffff;padding: 0px 5px;border-radius: 0;">OFF</button>';
                } else {
                    spancontent = '<button id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">ON</button><button class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #30ff00;color: #ffffff;padding: 0px 5px;border-radius: 0;">OFF</button>';
                }
            } else {
                if (data.locked) {
                    spancontent = '<button id="onspan" disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #30ff00;color: #ffffff;padding: 0px 5px;border-radius: 0;">ON</button><button disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">OFF</button>';

                } else {
                    spancontent = '<button id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #30ff00;color: #ffffff;padding: 0px 5px;border-radius: 0;">ON</button><button class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">OFF</button>';
                }
            }

            if (data.isAllowRecord) {
                content += '<p>' + getLan().mapDialogRowRecord + ':<span style="margin-left:18px;">  ' + spancontent + '</span></p>';
            }
            // content += '<p>版本号: ' + data.detail.dsj.version+'</p>';
        }
        var count = 0;
        content += '<div style="margin-top: 20px;margin-bottom: 5px;display: flex;flex-direction: row;flex-wrap: wrap;justify-content: space-between;">';
        var myData = JSON.stringify(data).replace(/"/g, '&quot;');
        var buttonCss = "margin-bottom: 10px;background: #ffffff;border-radius: 0;border-color: #fff;width: 120px;height: 40px;color: #1055b3;font-size: 16px;";
        if (!data.isRealTimeView && data.isAllowVideo) {
            count++;
            if (data.locked) {
                content +=
                    '<button disabled="disabled" id="videobutton" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '"' +
                    ' onclick="playVideo(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal +
                    '\',\'' + '' + '\',\'' + data.mytype + '\',\'' + myData + '\',);">' + getLan().mapVedioBtn + '</button>';
            } else {
                //执法仪
                if (data.mytype == 0) {
                    content +=
                        '<button id="videobutton" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="playVideo(\'' +
                        data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal +
                        '\',\'' + '' + '\',\'' + data.mytype + '\',\'' + myData + '\');">' + getLan().mapVedioBtn + '</button>';
                } else {
                    //多通道
                    content +=
                        '<button id="videobutton" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="playVideo(\'' +
                        data.gbcode + '\',\'' + data.userName + '\',\'' + '' + '\',\'' + data.signal +
                        '\',\'' + (data.name || data.deviceName) + '\', \'' + data.mytype + '\',\'' + myData + '\');">' + getLan().mapVedioBtn + '</button>';
                }
            }
        }


        // if (!data.source && data.mytype == 0) {
        if (!data.source) {
            //告警详情那里也有语音呼叫,现在没了
            if (!data.isRealTimeView) {
                data.isRealTimeView = false;
            }
            if (data.isAllowSpeak) {
                count++;
                if (data.locked) {
                    content += '<button disabled="disabled" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="startTalk(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\',\'' + data.mytype + '\');">' + getLan().mapVoiceBtn + '</button>';
                } else {
                    content += '<button class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="startTalk(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\',\'' + data.mytype + '\');">' + getLan().mapVoiceBtn + '</button>';
                }
            }
            if (data.isAllowPhotograph) {
                count++;
                if (data.locked) {
                    content += '<button disabled="disabled" id="photobutton" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="photograph(\'' + data.gbcode + '\');">' + getLan().Photograph + '</button>';
                } else {
                    content += '<button id="photobutton" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="photograph(\'' + data.gbcode + '\');">' + getLan().Photograph + '</button>';
                }
            }
            if (data.isAllowLock) {
                var word = '';
                if (data.locked) {
                    word = getLan().remoteUnlock;
                } else {
                    word = getLan().remoteLock;
                }
                count++;
                content += '<button id="lockbutton" class="btn btn-primary  btn-sm" style=" ' + buttonCss + '" onclick="lock(\'' + data.gbcode + '\');">' + word + '</button>';
            }
        }
        content += '</div>';
        //        content += '<div>';
        //        content += '<button class="btn btn-success btn-sm" style="margin-right: 5px;" onclick="starttalk(\''+data.deviceId+'\');">' + getI18NStr('msg.startTalk') + '</button>';
        //         content += '<button class="btn btn-primary  btn-sm" style="margin-right: 5px;" onclick="@startRecord(\''+data.gbcode+'\');">' + '录制视频' + '</button>';
        //         content += '<button class="btn btn-primary  btn-sm" onclick="@sentmessage(\''+data.gbcode+'\');">' + '消息下发' + '</button>';
        //        content += '</div>';
        content += '</div>';
        let titleLayer;
        // if (data.userName) {
            let string = '';
            if (data.userCode) {
                 string = data.userName + '(' + data.userCode + ')';
            }else{
                 string = data.deviceName;
            }
            titleLayer = window.esriMap.addText(string, {
                center: curPoint
            });
            // titleLayer.gbcode = data.gbcode;
        // }

        let pictureSymbol = window.esriMap.createPicSymbol(icon_w, icon_h, iconUrl); //图片
        
        let popup = map.InfoWindow(content, {
            close: window.closeEvn,
            title: '',
            // width 百度地图起作用
            width: 440
        });
        popup.gbcode = data.gbcode;
        let marker = map.CreateMarker({
            picture: pictureSymbol, 
            text: titleLayer, 
            popup, 
            point: curPoint
        });

        marker.id = data.userCode;
        marker.name = data.userName;
        marker.gbcode = data.gbcode;
        markerArr.push(marker);

        center && map.centerAndZoom(curPoint, 13, true);
        if (data.sosSource == "FACE_MONITORING") {
            parent.avalon.vmodels['sszhrlbk'].show(data);
        } else if (data.sosSource == "CAR_MONITORING") {
            parent.avalon.vmodels['sszh-cpbk'].show(data);
        } else {
            // TOTO 注释的两行还没处理
            // $(".infowindowcontainer").remove();
            // $(".contentPane").append(content);

            // sos告警时弹窗背景色设为 红色
            // if(data.sosSource == 'DEVICE_SOS') {
            //     $('#allmap .esriPopup .titlePane, #allmap .esriPopup .contentPane,#allmap .esriPopup .pointer,#allmap .esriPopup .outerPointer').css({
            //         'background-color': '#de494f'
            //     });
            // } else {
            //     $('#allmap .esriPopup .titlePane, #allmap .esriPopup .contentPane,#allmap .esriPopup .pointer,#allmap .esriPopup .outerPointer').css({
            //         'background-color': '#0A1238'
            //     });
            // }
        }

        if (isUpdating && infoWindowShowing[data.gbcode] == 1) {
            map.OpenInfoWindow(popup, {
                center: curPoint,
                content: content
            });
        }
    },
    /**
     * 根据 gbcode 删除标记物
     *
     * @param {string} gbcode
     */
    removerMarker: function (gbcode, isCancel) {
        map.removerMarkerByKey('gbcode', gbcode);
    },
    //测距
    measureLength: function () {
        map.MeasureLength();
    },
    /**
     * 添加线
     * @param {Object} points   坐标数组
     * @param {symbol} lineSymbol    线样式
     */
    addPolyline: function (points, lineSymbol, opts) {
        return map.Polyline(points, avalon.shadowCopy(lineSymbol, opts));
    },
    /**
     *  添加文本 
     *
     * @param {string} title 文字信息
     * @param {object} opts 选项配置，可以配置样式和offset
     * @returns symbol: Marker
     */
    addText: function (title, opts) {
        return map && map.CreateTextSymbol(title, opts);
    },
    /**
     * 显示文字和图标 车牌、人脸布控和人证核验用到
     *
     * @param {number} lon 经度
     * @param {number} lat 纬度
     * @param {number/string} number 显示的文字
     * @param {*} attributs null
     * @param {*} infotemplete null
     * @returns {object} { pic: locationSymbol, num: textGraphic }
     *  pic 和 num 是在车牌、人脸布控和人证核验用到
     * 
     */
    addTextPicMarker: function (lon, lat, number, attributs, infotemplete) {
        let point = [lon, lat];
        let textGraphic = window.esriMap.addText(String(number), {
            center: point,
            offset: [0, - 84 + 10],
            // 设置 zIndex = 101 是因为 maplite 地图的图片覆盖物的 zIndex 默认为 100 
            zIndex: 101
        });
        let pictureSymbol = window.esriMap.createPicSymbol(58, 84, '../../static/image/zfsypsjglpt/zn_local_number.png');
        let marker = map.CreateMarker({
            picture: pictureSymbol, 
            text: textGraphic, 
            popup: infotemplete, 
            point: point
        });
        return {
            pic: marker,
            num: null
        }
    },
    /**
     * 添加带有弹窗的标记物
     * @param {number} x   经度
     * @param {number} y    纬度
     * @param {symbol} pictureSymbol    图片symbol
     * @param {Object} attributs
     * @param {InfoTemplate} infotemplete
     * @param {pointItem} pointItem     gps点信息，录像回放有这个参数
     */
    addPictureMarker: function (x, y, pictureSymbol, attributs, infotemplete, pointItem) {
        let textGraphic;
        let point = [x, y];
        if (pointItem) {
            let diviceInfo = (pointItem.nameAndCode == '-(-)' ? '' : pointItem.nameAndCode) || pointItem.deviceId || '-';
            let deviceTime = DrawPath.formatDate(pointItem['time'] || pointItem['createTime']);
            textGraphic = this.addText(diviceInfo + '\n' + deviceTime, {
                center: point
            });
        }
        let marker = map.CreateMarker({
            picture: pictureSymbol, 
            text: textGraphic, 
            popup: infotemplete, 
            point: point
        });
        return marker;
    },
    /**
     * 删除 Marker
     *
     * @param {Marker} pictureGraphic
     */
    removePictureMarker: function (pictureGraphic) {
        map && map.removeOverlay(pictureGraphic);
    },
    /**
     * 生成图片symbol
     * @param {number} width   宽度
     * @param {number} height   高度
     * @param {string} url    图片url
     */
    createPicSymbol: function (width, height, url) {
        return map && map.CreatePicSymbol({
            width,
            height,
            url
        });
    },
    /*
     * 告警管理详细那里取消调度，清除除了sos设备外的其他标注
     * */
    clearDiaodu: function (gbcode) { ///删除标记物
        let markerTmp;
        for (let i = 0; i < markerArr.length; i++) {
            markerTmp = markerArr[i];
            if (markerTmp.gbcode != gbcode) //不删掉告警警员
            {
                map.removeOverlay(markerTmp);
                markerArr.splice(i--, 1);
            }
        }
    },
    removeTrackLayer() { //清除掉轨迹查询和告警管理已处理那边的轨迹影响
        this.clearDrawLayer();
    }
};

//提示框提示
window.showMessage = function showMessage(type, content) {
    notification[type]({
        title: vm.extra_class ? "notification" : "通知",
        message: content
    });
};

/*
 *  lala函数作用就是每次new一下，将放回值赋值drawpath.TrackGraphicLayer和当前new的这个对象的TrackGraphicLayer
 *  即this.TrackGraphicLayer,通过对比this.TrackGraphicLayer === drawpath.TrackGraphicLayer,成立就画轨迹，
 *  不成立说明某人点了轨迹列表中的另一个item
 * */
function lala() {
    return {
        'a': 1
    };
}

window.DrawPath = function (json, mapObj, vm, getTrackTotalAjax, getPageDeviceTrackAjax, getDeviceTrackByDuration, player) {
    this.json = json;
    this.totalPage = 0;
    this.maxPage = 0;
    this.curGpsPage = 0;
    this.gpsPageSize = 200;
    this.beginPoint = {};
    this.isGettingTrack = true;
    this.curTrackId = [];
    this.TrackGraphicLayer = null;
    //this.beginPoint = {};
    this.timer = null;
    this.timers = []; //用来存储画线定时器句柄
    this.polyineCount = 0;
    this.polyLineEndCount = 0;
    this.arrPoints = []; //用于存储蓝色标记数组
    this.leftPonts = []; //去除已经显示过的剩下没显示的蓝色数组
    this.markerCount = 0; //蓝色标记数组下标
    this.markerGraphics = []; //上一个蓝色标记数组(包括设备和时间信息)
    this.markerId = "";
    this.markerLayer = null;
    this.map = map;
    this.vm = vm;
    this.player = player;
    this.picSymbol = null;
    this.getTrackTotalAjax = getTrackTotalAjax;
    this.getPageDeviceTrackAjax = getPageDeviceTrackAjax;
    this.getDeviceTrackByDuration = getDeviceTrackByDuration;
    this.init();

};
DrawPath.prototype = {
    constructor: DrawPath,
    init: function () {
        DrawPath.TrackGraphicLayer = this.TrackGraphicLayer = new lala();
    },
    draw: function () {
        this.getTrackTotal();
    },
    drawPathByDuration: function () {
        this.getPathByDuration();
    },
    getTrackTotal: function () {
        this.getTrackTotalAjax(this.json).then((ret) => {
            this.total = ret.data.gpsSize;
            this.maxPage = Math.ceil(this.total / this.gpsPageSize);
            //   this.mapObj.polyLineEndCount = this.maxPage-1;
            if (this.total == 0) {
                showMessage('warn', getLan().mapNoTrackMsg);
                return false;
            }

            this.getGpsPageTrack(this.json, 0, this.gpsPageSize);

        });
    },
    getGpsPageTrack: function (json, page, pageSize) {
        if (this.curGpsPage >= this.maxPage) {
            //   vm.btnDisabled = false;
            return false;
        } else if (!this.isGettingTrack) {
            return false;
        }
        this.getPageDeviceTrackAjax(json, page, pageSize).then((ret) => {
            let data = ret.data.currentElements;
            if (this.curGpsPage == 0) {
                this.beginPoint = ret.data.currentElements[0];
                let cvtPonit = [this.beginPoint.longitude, this.beginPoint.latitude];
                this.map.centerAndZoom(cvtPonit, 15, true);
            }
            this.polyLine(data, this.maxPage - 1);
            this.arrPoints = this.arrPoints.concat(data);
            ++this.curGpsPage;
            this.getGpsPageTrack(json, this.curGpsPage, this.gpsPageSize);

        });
    },
    getPathByDuration: function () {
        this.vm.noTrack = false;
        this.getDeviceTrackByDuration(this.json).then((ret) => {
            if (ret.code == 0) {
                if ($.isEmptyObject(ret.data)) {
                    this.vm.noTrack = true;
                    return false;
                }
                let points = ret.data[this.json['deviceIds'][0]];
                this.beginPoint = points[0];
                this.arrPoints = this.leftPonts = points;
                // let cvtPonit = new ConvertPoint([this.beginPoint.longitude, this.beginPoint.latitude ]);
                this.map.centerAndZoom([this.beginPoint.longitude, this.beginPoint.latitude], 15, true);
                this.polyLine(points, 0);
            } else {
                showMessage('error', ret.msg);
            }


        });
    },
    polyLine: function (curArr, curPage) {
        let inPaths = [];
        for (var i in curArr) {
            inPaths.push([parseFloat(curArr[i]['longitude']), parseFloat(curArr[i]['latitude'])]);
        }

        if (DrawPath.TrackGraphicLayer == this.TrackGraphicLayer) { //为了防止请求时上一次的轨迹没清完
            let line = window.esriMap.addPolyline(inPaths, window.lineSymbol);
            DrawPath.curTrackId = this.curTrackId.push(line.id);
        }
        if (this.polyineCount == 0) {
            let beginPoint = curArr[0];
            let cvtPonit = [beginPoint['longitude'], beginPoint['latitude']];
            let beginMarkerGraphic = this.addLocateMarker(cvtPonit[0], cvtPonit[1], window.startSymbol, null);
            // let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
            this.vm.btnDisabled = true;
        }
        if (this.polyineCount == curPage) {
            let endPoint = curArr[curArr.length - 1];
            let cvtPonit = [endPoint['longitude'], endPoint['latitude']];
            let endMarkerGraphic = this.addLocateMarker(cvtPonit[0], cvtPonit[1], window.endSymbol, null);
            // let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);
            this.vm.btnDisabled = false; //轨迹画完播放按钮才能呈现激活状态
        }
        // this.map.addOverlay(DrawPath.TrackGraphicLayer);
        ++this.polyineCount;
    },

    addLocateMarker: function (x, y, pictureSymbol, infotemplete) {
        let popup;
        infotemplete && (popup = map.InfoWindow(infotemplete, {
            close: function() {},
            title: ''
        }));
        let marker = map.CreateMarker({
            picture: pictureSymbol,
            popup,
            point: [x, y]
        });
        return marker;
    },
    createMarker: function (url, oPoint) {
        var iconUrl = url ? url : "../../static/image/sszhxt/locate.png";
        this.picSymbol = window.createPicSymbol(40, 60, iconUrl);
        let marker = this.addLocateMarker(oPoint.longitude, oPoint.latitude, this.picSymbol);
        return marker;
    },
    addMarker: function (timeInterval, step) {
        let that = this;
        this.timer = setInterval(() => {
            for (var i = 0; i < that.markerGraphics.length; i++) {
                map.removeOverlay(that.markerGraphics[i]); //清除上一次的蓝色标记
                that.markerGraphics.splice(i, 1);
                i--;
            }
            if (this.markerCount == (this.arrPoints.length)) {
                this.markerCount = 0;
                clearInterval(this.timer);
                this.vm.showPlayBtn = true;
                return false;
            }
            let curPoint = this.arrPoints[this.markerCount];
            let clickItem = storage.getItem('cjxFixBugDeveviceName');
            clickItem.time = curPoint.time;
            this.markerLayer = window.esriMap.addPictureMarker(curPoint.longitude, curPoint.latitude,
                window.esriMap.createPicSymbol(40, 60, '../../static/image/sszhxt/locate.png'), null, null, clickItem);
            this.markerGraphics.push(this.markerLayer);
            step = step || 1;
            this.markerCount = this.markerCount + step;
            window.esriMap.setCenterAt(curPoint.longitude, curPoint.latitude);
        }, timeInterval);
    },
    addMarkerByDuration2: function (timeStamp) {
        let that = this;
        for (var i = 0; i < this.leftPonts.length; i++) {
            if (timeStamp >= this.leftPonts[i]['time']) {
                for (var i = 0; i < that.markerGraphics.length; i++) {
                    map.removeOverlay(that.markerGraphics[i]); //清除上一次的蓝色标记
                    that.markerGraphics.splice(i, 1);
                    i--;
                }
                this.markerCount = i;
                let curPoint = this.leftPonts[this.markerCount];
                let diviceInfo = (curPoint['deviceName'] || '') + '(' + (curPoint['deviceId'] || '-') + ')';
                let deviceTiime = curPoint['time'];
                let item = {
                    nameAndCode: diviceInfo,
                    time: deviceTiime
                };
                this.markerLayer = window.esriMap.addPictureMarker(curPoint.longitude, curPoint.latitude,
                    window.esriMap.createPicSymbol(32, 48, "../../static/image/sszhxt/locate.png"), null, null, item);
                this.markerGraphics.push(this.markerLayer);
                this.leftPonts = this.leftPonts.splice(i + 1);
                break;
            }
        }
    },
    removeLayer: function (layerId) {
        esriMap.clearDrawLayer();
    },
    clearGraphicsByLayer: function (markerId) {
        esriMap.clearDrawLayer();
    },
    resetLayerPos: function (centePpoint, zoom) {
        this.map.centerAndZoom([centePpoint.longitude, centePpoint.latitude], zoom);
    },
    addLine: function (arr, time, curPage) {
        let length = arr.length,
            count = 0,
            addLineTimer = null;
        let _this = this;
        addLineTimer = setInterval(() => {
            if (count == length - 1) {
                clearInterval(addLineTimer);
                return false;
            }

            let point1 = arr[count];
            let point2 = arr[++count];
            let arrTwoPoint = [point1, point2];
            _this.polyLine(arrTwoPoint, curPage);
        }, time);
        gjcxMap.timers.push(addLineTimer);
    },
    clearTimer: function () {
        if (this.timer)
            clearInterval(this.timer);
        for (var i in this['timers']) {
            clearInterval(this['timers'][i]);
            this['timers'][i] = null;
        }
        this.timer = null;
        this['timers'] = [];
    }
};

DrawPath.formatDate = function (now) {
    if (!now)
        return '-';
    let date = new Date(now);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var dat = date.getDate();
    var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
    return year + '-' + month + '-' + dat + "  " + hour + ":" + mm + ":" + seconds;
};

function getLan() {
    return language_txt.sszhxt.map;
}

avalon.scan(document.body);
