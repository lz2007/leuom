module.exports = {
    /**
     * ======================系统常规配置======================
     * 系统全局标题、版权、单点登录、默认浏览器下载等配置项
     */
    tenderHint: '温馨提示：建议使用IE11及以上版本、chrome（44及以下版本）、firefox',
    minimumAllocation: '最低配置：双核CPU，内存4G或以上，显卡需安装原厂驱动',
    titleName: '高新兴国迈视音频一体化管理平台',

    copyRight: 'Copyright © 2005-2018，高新兴国迈科技有限公司，版权所有',

    telephone: '技术支持：TEL 400 6578 900',

    // singleSignOn 是否开启单点登录功能  false => 关闭，只能手动输入登录， true => 开启pki证书登录
    singleSignOn: false,

    //PKI登录的类型 0=>主线；1=>吉大正元
    pkiType: 0,

    // 包含子部门 默认true
    includedStatus: true,

    // 表格是否默认查询，默认false true--查询  false--不查询
    isTableSearch: false,

    // 单点登录gt参数
    gt: '74df37c22e352ea2e2fc1a885dcd825e',

    // 高新兴国迈安全浏览器默认下载  0 => 火狐浏览器（定制版）   1 => 谷歌浏览器（定制版）  默认为0
    defaultBrowser: 0,

    accountType: "permanent|temporary", //账号类型： permanent 永久用户，temporary 临时用户

    // 平台版本
    platformVersion: 1, // 0 => 公安版    1 => 交警版

    pageSize: 10,

    /**
     * 首页自定义版本
     * @param mainIndex  main_index 主线版本  main_sdjj 山东 版本
     * 
     */

    mainIndex: 'main_index',

    /**
     * 系统首页定义是否加载执法指数统计页面(热点图) true 加载; false 不加载
     */
    indexChange: false,

    /**
     * 定义系统版本
     * @param versionSelection  mainLine 主线版本; Qianxinan 黔西南版本; Ningxia 宁夏; Yunnan 云南; Kunming 昆明; Hainan 海南
     * 主线代码提交时请务必填写默认的 mainLine 
     */
    versionSelection: 'mainLine',

    /**
     * 定义语言版本
     * @param languageSelect  zhcn 中文  en 英文
     * 
     */
    languageSelect: 'zhcn',

    /**
     * 是否打开案件管理查看视频页面-盘证制作按钮
     * @param pzzzStatus  true 打开；false 关闭
     * 
     */
    pzzzStatus: false,

    // socket服务地址（告警推送服务）
    // webSocketIp: (window.location.host == '127.0.0.1:3000' || window.location.host == '10.10.16.169:3000') ? '10.10.9.101:8201' : window.location.host,
    webSocketIp: window.location.host,

    /* 
     *  =============================各种地图汇总配置项 =============================
     * 
     *  地图配置说明
     *
     *  地图配置集中在allMapConfig里面进行相应配置
     *
     *  新增地图的配置应加入allMapConfig中，便于统一管理
     * */

    /**
     * @description defalutCity  默认城市（地级市），用于地图默认显示的地址位置
     *              注意：优先读取后台保存的默认城市，后台没保存就读取defalutCity的值
     */
    defalutCity: "广州",

    // 地图配置项
    allMapConfig: {
        // ====== 公共配置项 ==========
        // 中心点/经纬度（这里的经纬度设置已被丢弃不起作用，请用defalutCity进行配置）
        center: [113.2643446427, 23.1290765766],
        // 缩放级别（不同地图级别不一样，进行相应的配置）
        level: 13,
        // 地图最大缩放等级
        maxZoom: 18,
        // 地图最小缩放等级
        minZoom: 3,
        coord: {
            // 支持转换坐标格式：WGS84、GCJ02、BD09、WebMercator等等
            // 注意!!!!! 当 mode=openlayers-baidu 或 mode=baidu 时，应 to: 'BD09'
            // 当前坐标系
            from: 'WGS84',
            // 目标坐标系
            to: 'GCJ02'
        },
        // ============================mode、basemap 的配置说明=============================
        // ----------------------------------------------------------------------------------------------------------------------------------------
        //     地图类型          mode                    |       地图服务/瓦片地址  basemap                                                         |
        // 离线地图 --|- (百度)  openlayers-baidu        |                                                                                         |
        //           |- (谷歌)  openlayers-google       |     //192.168.56.99:8088/roadmap （对应地图的瓦片服务地址）                                |
        // 百度在线地图          baidu                   |    无，留空字符 ''                                                                       |
        // 深圳项目              maplite                |    online/baidu/map、online/google/map、online/qq/map、online/amap/map、online/tdt/map   |
        // 德宏州项目            minemap                |    //minedata.cn                                                                        |
        // 云南省厅、昆明        pgis                   |    http://10.130.37.193:9080      （ pgis地图API服务地址端口 ）                           |
        // ----------------------------------------------------------------------------------------------------------------------------------------
        // 
        mode: 'openlayers-google',
        basemap: '//192.168.56.99:8088/roadmap',
        // 瓦片/底图扩展地址（用于移动APP的中英文切换功能，可配置其他底图以切换）
        basemap_extra: '//192.168.51.46:8080/googlemapsen',
        // ===============minemap 私有配置 开始 (德宏州用的地图配置)====================
        // 注意：mode = minemap 时才可根据需要修改，反之不需要改动
        // accessToken
        accessToken: '25cc55a69ea7422182d00d6b7c0ffa93',
        // 版本号
        version: 'v2.0.0',
        // 底图样式 id
        solution: 2365,
        // =================minemap 配置 结束=========================================
    },
    //实时指挥更新树节点时间（ms）
    UpdateNodesTime: 15 * 1000,

    //实时指挥是否允许语音
    isAllowSpeak: true,

    //实时指挥是否允许视频
    isAllowVideo: true,

    //实时指挥是否允许录像
    isAllowRecord: false,

    //实时指挥是否允许拍照
    isAllowPhotograph: false,

    //实时指挥是否允许锁定
    isAllowLock: false,

    // 集群对讲
    jqdjUrl: 'https://www.hicallstalkback.xyz:8099/HGS-Application-Interface/index;jsessionid=C14D0219A1818DDFAEC28F45F9F34ABD',


    /**
     * ======================OCX播放器相关配置======================
     * 
     */

    //视音频播放器配置
    playerConfig: true, //false h5;true webplayer

    //高新兴ocx图像增强功能输出文件夹
    imageEnhanceOutPut: "C:\\Windows\\Temp\\imageEnhanceOutPut\\",

    //高新兴ocx视频播放截图输出文件夹
    screenShotOutPut: "D:\\screenShotOutPut",

    //高新兴ocx现使用的版本号
    gxxOcxVersion: "4.0.80.19960",


    /**
     * ======================ajax请求配置======================
     * 
     */

    //  请求超时时间 （默认：10分钟）
    ajaxTimeout: 10 * 60 * 1000,

    //  运行监控查询间隔时间-单位毫秒 （默认：1分钟）
    interval: 60000,


    /**
     * ======================系统固定常量配置======================
     * 开发、打包环境变量，勿修改
     */

    domain: '__DOMAIN__',

    serviceUrl: '__SERVICE_URL__',

    apiUrl: '__API_URL__',

    /**
     * =======================表格 部门提示配置 =====================
     * prefixLevel 是否拼接上级部门名称。默认值 -1 显示原名。0为全名，1表示一级部门不拼接，2表示一二级部门不拼接，依次类推
     * separator 部门名称分割符,默认为下划线。如果不配置分隔符，将此项参数删除即可，或者用中划线等
     */
    dep_switch: false,
    prefixLevel: '0',
    separator: '-',

    /**
     * ======================数据中心-执法档案-案件管理-详情页面-办案区======================
     * isBZ 是否选用滨州办案区
     */
    isBZ: false,

    /**
     * ======================天津交管局iframe地址======================
     * isInsertIframe 是否插入iframe；iframeUrl 插入的iframe地址
     */
    isInsertIframe: false,
    iframeUrl: "//192.168.53.20/gmvcs-tjjgj/Gmvcs.html",
    // 备机相关内容是否显示
    showBeiji: true
};