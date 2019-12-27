/*
 * @Author: mikey.liangzhu 
 * @Date: 2018-10-22 16:40:38 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-11-06 16:54:17
 */

// DSJ("DSJ", "执法仪"),
// DSJ_4G("DSJ4G","4G执法记录仪"),
// DSJ_2G("DSJ2G","2G执法记录仪"),
// DSJ_4G_GB("DSJ4GGB","4G执法记录仪(GB)"),
// WORKSTATION("WORKSTATION", "采集站"),
// KSBK("KSBK", "快速布控设备"),
// CZSL("CZSL", "车载摄录设备"),
// WRJ("WRJ", "无人机"),
// GLPT("GLPT", "移动视音频管理平台"),

/**
 * 28181协议统一编码规则中提及的部分
 * */
// MAIN_DEVICE("MAIN_DEVICE", "前端主设备"),
// PERIPHERAL_DEVICE("PERIPHERAL_DEVICE", "前端外围设备"),
// PLATFORM_DEVICE("PLATFORM_DEVICE", "平台设备"),
// PLATFORM_USER("PLATFORM_USER", "中心用户"),
// TERMINAL_USER("TERMINAL_USER", " 用户"),
// SIGNAL_GATEWAY("SIGNAL_GATEWAY", "平台外接服务器"),
// OTHER("OTHER", "拓展类型"),

/**
 * 28181协议其他类型
 * */

// INVALID("INVALID", "非法类型");

/**
 *获取设备类型值
 *
 * @export
 * @param {*} name 设备类型名
 * @returns type
 */
export function getTypeVal(name) {
    switch (name) {
        case '采集站':
            return 'WORKSTATION';
        case '移动视音频管理平台':
            return 'GLPT';
        case '2G执法记录仪':
            return 'DSJ2G';
        case '4G执法记录仪':
            return 'DSJ4G';
        case '4G执法记录仪(GB)':
            return 'DSJ4GGB';
        case '4G执法记录仪(V1)':
            return 'DSJV1';
        case '快速布控设备':
            return 'KSBK';
        case '车载摄录设备':
            return 'CZSL';
        case '无人机':
            return 'WRJ';
        case '无网络':
            return 'DSJNONET';
        case '前端外围设备':
            return 'PERIPHERAL_DEVICE';
        case '前端主设备':
            return 'MAIN_DEVICE';
        default:
            return ''
    }
}

/**
 *获取设备名
 *
 * @export
 * @param {*} type 设备类型
 * @returns name
 */
export function getTypeName(type) {
    switch (type) {
        case 'WORKSTATION':
            return '采集站';
        case 'GLPT':
            return '移动视音频管理平台';
        case 'DSJ2G':
            return '2G执法记录仪';
        case 'DSJ4G':
            return '4G执法记录仪';
        case 'DSJ4GGB':
            return '4G执法记录仪(GB)';
        case 'DSJV1':
            return '4G执法记录仪(V1)';
        case 'KSBK':
            return '快速布控设备';
        case 'CZSL':
            return '车载摄录设备';
        case 'WRJ':
            return '无人机';
        case 'DSJNONET':
            return '无网络';
        case 'PERIPHERAL_DEVICE':
            return '前端外围设备';
        case 'MAIN_DEVICE':
            return '前端主设备';
        default:
            return ''
    }
}

export const orgIcon = "/static/image/sszhxt/org.png"; //部门icon
export const deviceOfflineIcon = "/static/image/sszhxt/device_offline.png"; // 设备离线icon
export const deviceOnlineIcon = "/static/image/sszhxt/device_online.png"; // 设备在线icon
export const deviceOnlineGpsIcon = "/static/image/sszhxt/device_online_gps.png"; // 设备有gps在线icon
export const deviceOnlineSheluIcon = "/static/image/sszhxt/shelu.png"; // 设备摄录在线icon
export const deviceOnlineGPSSheluIcon = "/static/image/sszhxt/gps-shelu.gif"; // 设备gps摄录在线icon
export const deviceOnlineGPSChongdianIcon = "/static/image/sszhxt/gps-chongdian.gif"; // 设备gps 充电在线icon
export const deviceOnlineChongdianIcon = "/static/image/sszhxt/chongdian.png"; // 设备充电在线icon
export const deviceOnlineChongdianSheluIcon = "/static/image/sszhxt/chongdian-shelu.gif"; // 设备充电摄录在线icon
export const deviceOnlineGSPChongdianSheluIcon = "/static/image/sszhxt/gps-chongdian-shelu.gif"; // 设备gps充电摄录在线icon
export const DroneOutlineIcon = "/static/image/sszhxt/Droneoutline.png"; // 设备离线icon
export const DroneOnlineIcon = "/static/image/sszhxt/Droneonline.png"; // 设备在线icon
export const fastDevOutlineIcon = "/static/image/sszhxt/fastDevoutline.png"; // 快速布控离线线icon
export const fastDevOnlineIcon = "/static/image/sszhxt/fastDevonline.png"; // 快速布控在线线icon
export const carOutlineIcon = "/static/image/sszhxt/caroutline.png"; // 车载摄录设备在线icon
export const carOnlineIcon = "/static/image/sszhxt/caronline.png"; // 车载摄录设备在线icon

// 备机

export const beijiOutline = '/static/image/sszhxt/beiji-outline.png'; //备机离线
export const beijiOnline = '/static/image/sszhxt/beiji-online.png'; //备机在线
export const beijishelu = '/static/image/sszhxt/beiji-shelu.gif'; //备机摄录
export const beichongdian = '/static/image/sszhxt/bei-chongdian.gif'; //备机充电
export const beijigpschongdianshelu = '/static/image/sszhxt/beiji-gps-chongdian-shelu.gif'; //备机-gps-充电-摄录.gif
export const beijichongdianshelu = '/static/image/sszhxt/beiji-chongdian-shelu.gif'; //备机-充电-摄录.gif
export const beijigpschongdian = '/static/image/sszhxt/beiji-gps-chongdian.gif'; //备机-gps-充电.gif
export const beijigpsshelu = '/static/image/sszhxt/beiji-gps-shelu.gif'; //备机-gps-摄录.gif
export const beijigps = '/static/image/sszhxt/beiji-gps.gif'; //备机-gps.gif
/**
 *判断是否是设备
 *
 * @param {*} type 设备类型
 * @param {*} online 是否在线
 * @param {*} hasGps 是否有gps
 * @param {*} localRecord 是否在摄录
 * @param {*} chargeState 是否在充电
 * @param {*} isStandbyMachine 是否备机
 * @returns 返回设备对应图标路径
 */
export function isDevice(type, online, hasGps = false, localRecord = false, chargeState = false, isStandbyMachine = false) {
    let typeObj = {
        DSJNONET: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        DSJ4G: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        DSJV1: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        DSJ2G: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        DSJ4GGB: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        PERIPHERAL_DEVICE: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        MAIN_DEVICE: deviceDSJPath(type, online, hasGps, localRecord, chargeState, isStandbyMachine),
        WRJ: online ? DroneOnlineIcon : DroneOutlineIcon,
        KSBK: online ? fastDevOnlineIcon : fastDevOutlineIcon,
        CZSL: online ? carOnlineIcon : carOutlineIcon
    };

    if (type in typeObj) {
        return typeObj[type];
    } else {
        return orgIcon;
    }
}


/**
 *判断是否是设备
 *
 * @param {*} type 设备类型
 * @param {*} online 是否在线
 * @param {*} hasGps 是否有gps
 * @param {*} localRecord 是否在摄录
 * @param {*} chargeState 是否在充电
 * @param {*} isStandbyMachine 是否备机 1是备机，2是非备机。0是不限
 * @param {*} standbyMachineState 是否启用备机
 * @returns 返回设备对应图标路径
 */
function deviceDSJPath(type, online, hasGps = false, localRecord = false, chargeState = false, isStandbyMachine = false) {
    let pathUrl = '';
    // 在线

    if (online === 1) {
        // gps
        if (hasGps && !localRecord && !chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineGpsIcon;
        }

        // 摄录
        if (!hasGps && localRecord && !chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineSheluIcon;
        }

        // 充电
        if (!hasGps && !localRecord && chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineChongdianIcon;
        }

        // gps-摄录
        if (hasGps && localRecord && !chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineGPSSheluIcon;
        }

        // gps-充电
        if (hasGps && !localRecord && chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineGPSChongdianIcon;
        }

        // gps-摄录-充电
        if (hasGps && localRecord && chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineGSPChongdianSheluIcon;
        }

        // 摄录-充电
        if (!hasGps && localRecord && chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineChongdianSheluIcon;
        }

        // 执法仪
        if (!hasGps && !localRecord && !chargeState && isStandbyMachine != 1) {
            pathUrl = deviceOnlineIcon;
        }


        // 备机
        if (!hasGps && !localRecord && !chargeState && isStandbyMachine == 1) {
            pathUrl = beijiOnline;
        }
        // 备机-摄录
        if (!hasGps && localRecord && !chargeState && isStandbyMachine == 1) {
            pathUrl = beijishelu;
        }
        // 备机-充电
        if (!hasGps && !localRecord && chargeState && isStandbyMachine == 1) {
            pathUrl = beichongdian;
        }
        // 备机-gps-充电-摄录
        if (hasGps && localRecord && chargeState && isStandbyMachine == 1) {
            pathUrl = beijigpschongdianshelu;
        }

        // 备机-充电-摄录
        if (!hasGps && localRecord && chargeState && isStandbyMachine == 1) {
            pathUrl = beijichongdianshelu;
        }
        // 备机-gps-充电
        if (hasGps && !localRecord && chargeState && isStandbyMachine == 1) {
            pathUrl = beijigpschongdian;
        }
        // 备机-gps-摄录
        if (hasGps && localRecord && !chargeState && isStandbyMachine == 1) {
            pathUrl = beijigpsshelu;
        }
        // 备机-gps.gif
        if (hasGps && !localRecord && !chargeState && isStandbyMachine == 1) {
            pathUrl = beijigps;
        }

    }
    // 离线
    else {
        if (isStandbyMachine == 1) {
            // 备机离线
            pathUrl = beijiOutline;
        } else {
            pathUrl = deviceOfflineIcon;
        }
    }

    return pathUrl;
}

/**
 *判断是否是DSJ设备
 *
 * @param {*} type 设备类型
 * @returns boolean
 */
export function isDSJDevice(type) {
    switch (type) {
        case 'DSJ':
        case 'DSJ2G':
        case 'DSJ2G':
        case 'DSJ4G':
        case 'DSJV1':
        case 'DSJ4GGB':
        case 'DSJNONET':
        case 'PERIPHERAL_DEVICE':
            return true;
        default:
            return false;
    }
}

/**
 *判断是否是快速布控 无人机 车载 设备
 *
 * @param {*} type 设备类型
 * @returns boolean
 */
export function isNotDSJDevice(type) {
    switch (type) {
        case 'WRJ':
        case 'KSBK':
        case 'CZSL':
            return true;
        default:
            return false;
    }
}

/**
 *获取设备
 *
 * @returns Array
 */
export function getDeviceAll() {
    return [
        'DSJ',
        'DSJ2G',
        'DSJ2G',
        'DSJ4G',
        'DSJV1',
        'DSJ4GGB',
        'DSJNONET',
        'PERIPHERAL_DEVICE',
        'WRJ',
        'KSBK',
        'CZSL'
    ];
}