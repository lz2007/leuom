import ajax from './ajaxService';
import 'es6-promise/dist/es6-promise.auto';
import {
    notification
} from 'ane';
import {
    setLoginUserInfo
} from '../apps/common/common-login';
let storage = require('./storageService').ret;
const jdzx = [{
        key: 'jdzxpt-kphczl-index',
        title: '考评核查总览',
        lic: "EVA_MENU_JDKP_KPHCZL",
        icon: 'nav-jdzxpt-hczl',
        iconActive: 'nav-jdzxpt-hczl-active',
        children: [{
                key: 'jdzxpt-kphczl-ccqk',
                title: '抽查情况',
                url: '/jdzxpt-kphczl-ccqk',
                lic: "EVA_MENU_JDKP_KPHCZL_CCQK",
            },
            {
                key: 'jdzxpt-kphczl-hcqk',
                title: '核查情况',
                url: '/jdzxpt-kphczl-hcqk',
                lic: "EVA_MENU_JDKP_KPHCZL_HCQK",
            }
        ]
    },
    {
        key: 'jdzxpt-sjcc-index',
        title: '随机抽查',
        lic: "EVA_MENU_JDKP_SJCC",
        icon: 'nav-jdzxpt-sjcc',
        iconActive: 'nav-jdzxpt-sjcc-active',
        children: [{
                key: 'jdzxpt-sjcc-jycx',
                title: '简易程序',
                url: '/jdzxpt-sjcc-jycx',
                lic: "EVA_MENU_JDKP_SJCC_JYCX",
            },
            {
                key: 'jdzxpt-sjcc-fxccf',
                title: '非现场处罚',
                url: '/jdzxpt-sjcc-fxccf',
                lic: "EVA_MENU_JDKP_SJCC_FXCCF",
            },
            {
                key: 'jdzxpt-sjcc-qzcs',
                title: '强制措施',
                url: '/jdzxpt-sjcc-qzcs',
                lic: "EVA_MENU_JDKP_SJCC_QZCS",
            },
            {
                key: 'jdzxpt-sjcc-sgcl',
                title: '事故处理',
                url: '/jdzxpt-sjcc-sgcl',
                lic: "EVA_MENU_JDKP_SJCC_SGCL",
            },
            {
                key: 'jdzxpt-sjcc-jq',
                title: '警情',
                url: '/jdzxpt-sjcc-jq',
                lic: "EVA_MENU_JDKP_SJCC_JQKP",
            }, {
                key: 'jdzxpt-sjcc-aj',
                title: '案件',
                url: '/jdzxpt-sjcc-aj',
                lic: "EVA_MENU_JDKP_SJCC_AJKP",
            }
        ]
    },
    {
        key: 'tyyhrzpt-xtpzgl-hmd',
        title: '定向抽查',
        lic: "EVA_MENU_JDKP_DXCC",
        icon: 'nav-jdzxpt-dxcc',
        iconActive: 'nav-jdzxpt-dxcc-active',
        children: [{
                key: 'jdzxpt-dxcc-jycx',
                title: '简易程序',
                url: '/jdzxpt-dxcc-jycx',
                lic: "EVA_MENU_JDKP_DXCC_JYCX",
            },
            {
                key: 'jdzxpt-dxcc-fxccf',
                title: '非现场处罚',
                url: '/jdzxpt-dxcc-fxccf',
                lic: "EVA_MENU_JDKP_DXCC_FXCCF",
            },
            {
                key: 'jdzxpt-dxcc-qzcs',
                title: '强制措施',
                url: '/jdzxpt-dxcc-qzcs',
                lic: "EVA_MENU_JDKP_DXCC_QZCS",
            },
            {
                key: 'jdzxpt-dxcc-sgcl',
                title: '事故处理',
                url: '/jdzxpt-dxcc-sgcl',
                lic: "EVA_MENU_JDKP_DXCC_SGCL",
            },
            {
                key: 'jdzxpt-dxcc-jq',
                title: '警情',
                url: '/jdzxpt-dxcc-jq',
                lic: "EVA_MENU_JDKP_DXCC_JQKP",
            }, {
                key: 'jdzxpt-dxcc-aj',
                title: '案件',
                url: '/jdzxpt-dxcc-aj',
                lic: "EVA_MENU_JDKP_DXCC_AJKP",
            }
        ]
    },
    {
        key: 'jdzxpt-khjg-index',
        title: '考核结果',
        lic: "EVA_MENU_JDKP_HCJG",
        icon: 'nav-jdzxpt-khjg',
        iconActive: 'nav-jdzxpt-khjg-active',
        children: [{
            key: 'jdzxpt-khjg-khjg',
            title: '考核结果',
            url: '/jdzxpt-khjg-khjg',
            lic: "EVA_MENU_JDKP_HCJG",
        }]
    }
];
const menu = [{
        key: 'tyyhrzpt-xtpzgl-yhgl',
        title: '部门用户',
        // url: '/tyyhrzpt-xtpzgl-yhgl',
        lic: "CAS_MENU_BMYH",
        icon: 'nav-tyyhrzpt-yhgl',
        iconActive: 'nav-tyyhrzpt-yhgl-active',
        children: [{
                key: 'tyyhrzpt-xtpzgl-yhgl',
                title: '用户管理',
                url: '/tyyhrzpt-xtpzgl-yhgl',
                lic: "CAS_MENU_BMYH_YHGL",
            },
            {
                key: 'tyyhrzpt-xtpzgl-bmgl',
                title: '部门管理',
                url: '/tyyhrzpt-xtpzgl-bmgl',
                lic: "CAS_MENU_BMYH_BMGL",
            }
        ]
    },
    {
        key: 'tyyhrzpt-xtpzgl-gnqx',
        title: '角色管理',
        url: '/tyyhrzpt-xtpzgl-gnqx',
        lic: "CAS_MENU_GNQX",
        icon: 'nav-tyyhrzpt-jsgl',
        iconActive: 'nav-tyyhrzpt-jsgl-active'
    },
    {
        key: 'tyyhrzpt-xtpzgl-hmd',
        title: '黑名单',
        lic: "CAS_MENU_HMD",
        icon: 'nav-tyyhrzpt-hmd',
        iconActive: 'nav-tyyhrzpt-hmd-active',
        children: [{
                key: 'tyyhrzpt-xtpzgl-yhlb',
                title: '用户列表',
                url: '/tyyhrzpt-xtpzgl-yhlb',
                lic: "CAS_MENU_HMD_YHLB",
            },
            {
                key: 'tyyhrzpt-xtpzgl-zdlb',
                title: '终端列表',
                url: '/tyyhrzpt-xtpzgl-zdlb',
                lic: "CAS_MENU_HMD_ZDLB",
            }
        ]
    },
    {
        key: 'tyyhrzpt-xtpzgl-sjzd',
        title: '数据字典',
        url: '/tyyhrzpt-xtpzgl-sjzd',
        lic: "CAS_MENU_SJZD",
        icon: 'nav-tyyhrzpt-sjzd',
        iconActive: 'nav-tyyhrzpt-sjzd-active'
    },
    {
        key: 'tyyhrzpt-xtpzgl-czrz',
        title: '日志管理',
        lic: "CAS_MENU_CZRZ",
        icon: 'nav-tyyhrzpt-rzgl',
        iconActive: 'nav-tyyhrzpt-rzgl-active',
        children: [{
                key: 'tyyhrzpt-xtpzgl-zfyrz',
                title: '执法仪日志',
                url: '/tyyhrzpt-xtpzgl-zfyrz',
                lic: "CAS_MENU_CZRZ_ZFYRZ",
            },
            {
                key: 'tyyhrzpt-xtpzgl-cjgzzrz',
                title: '采集工作站日志',
                url: '/tyyhrzpt-xtpzgl-cjgzzrz',
                lic: "CAS_MENU_CZRZ_CJGZZRZ",
            },
            {
                key: 'tyyhrzpt-xtpzgl-htglxtrz',
                title: '后台管理系统日志',
                url: '/tyyhrzpt-xtpzgl-htglxtrz',
                lic: "CAS_MENU_CZRZ_HTGLXTRZ",
            },
            {
                key: 'tyyhrzpt-xtpzgl-rztj',
                title: '日志统计',
                url: '/tyyhrzpt-xtpzgl-rztj',
                lic: "CAS_MENU_CZRZ_RZTJ",
            }
        ]
    }
    // ----------------屏蔽展示用不到的菜单------------------------------
    // {
    //     key: 'tyyhrzpt-xtpzgl-sbk',
    //     title: '识别库',
    //     lic: "CAS_MENU_SBK",
    //     children: [{
    //         key: 'tyyhrzpt-xtpzgl-sbk-rylxk',
    //         title: '人员类型库',
    //         uri: '/tyyhrzpt-xtpzgl-sbk-rylxk',
    //         lic: "CAS_MENU_SBK_RLKSZ",
    //     },
    //         {
    //             key: 'tyyhrzpt-xtpzgl-sbk-rlk',
    //             title: '人脸库',
    //             uri: '/tyyhrzpt-xtpzgl-sbk-rlk',
    //             lic: "CAS_MENU_SBK_RLK",
    //         },
    //         {
    //             key: 'tyyhrzpt-xtpzgl-sbk-cpk',
    //             title: '车牌库',
    //             uri: '/tyyhrzpt-xtpzgl-sbk-cpk',
    //             lic: "CAS_MENU_SBK_CPK",
    //         }
    //     ]
    // }
    // {
    //     key: 'tyyhrzpt-xtpzgl-bmgl',
    //     title: '部门管理',
    //     uri: '/tyyhrzpt-xtpzgl-bmgl',
    //     lic: "CAS_MENU_BMGL",
    //     icon: 'nav-tyyhrzpt-jsgl',
    //     iconActive: 'nav-tyyhrzpt-jsgl-active'
    //     // icon: 'glyphicon orgManager-icon'
    // },
    // {
    //     key: 'tyyhrzpt-xtpzgl-xtcd',
    //     title:'系统菜单',
    //     uri: '/tyyhrzpt-xtpzgl-xtcd',
    //     // icon: 'glyphicon sysMenuManager-icon'
    // },
    // {
    //     key: 'tyyhrzpt-xtpzgl-xtgg',
    //     title:'系统公告',
    //     uri: '/tyyhrzpt-xtpzgl-xtgg',
    //     // icon: 'glyphicon sysNoticeManager-icon'
    // },
];


/*
 *二级菜单
 *parentKey：对应一级菜单的key
 *child：二级菜单数组
 */
const menubar = [{
        parentKey: 'aqsj-index',
        child: [{
                key: 'glxtrz',
                title: '管理系统日志',
                uri: '/aqsj-glxtrz'
            },
            {
                key: 'sjcjjccsbrz',
                title: '数据采集及存储设备日志',
                uri: '/aqsj-sjcjjccsbrz'
            },
            {
                key: 'zfjlyrz',
                title: '执法记录仪日志',
                uri: '/aqsj-zfjlyrz'
            }
        ]
    },
    {
        parentKey: 'ywgl-index',
        child: [{
                key: 'sjcjjccsbgl',
                title: '数据采集及存储设备管理',
                uri: '/ywgl-sjcjjccsbgl'
            },
            {
                key: 'yccfwqgl',
                title: '云存储服务器管理',
                uri: '/ywgl-yccfwqgl'
            },
            {
                key: 'yyfwqgl',
                title: '应用服务器管理',
                uri: '/ywgl-yyfwqgl'
            },
            {
                key: 'sjkfwqgl',
                title: '数据库服务器管理',
                uri: '/ywgl-sjkfwqgl'
            },
            {
                key: 'sqgl',
                title: '授权管理',
                uri: '/ywgl-sqgl'
            }
        ]
    },
    {
        parentKey: 'xtgl-index',
        child: [{
                key: 'dwgl',
                title: '单位管理',
                uri: '/xtgl-dwgl'
            },
            {
                key: 'yhgl',
                title: '用户管理',
                uri: '/xtgl-yhgl'
            },
            {
                key: 'qxsz',
                title: '权限设置',
                uri: '/xtgl-qxsz'
            }
        ]
    }
];

// 顶部导航栏
let application_menu = [{
        title: '系统首页', // 菜单名称 ====> 后台获取
        url: '/', // 路由
        icon: 'nav-xtsy', // 菜单icon
        iconActive: 'nav-xtsy-active', // icon active状态
        key: 'xtsy', // 唯一key，可用于菜单选中
        lic: "/gmvcs/index", // 授权校验字段
        index: 0 // 序号
    },
    {
        title: '指挥中心',
        url: '/sszhxt.html',
        icon: 'nav-jkzx',
        iconActive: 'nav-jkzx-active',
        key: 'jkzx',
        lic: "/gmvcs/instruct",
        index: 1
    },
    {
        title: '数据中心',
        url: '/zfsypsjglpt.html',
        icon: 'nav-sjzx',
        iconActive: 'nav-sjzx-active',
        key: 'sjzx',
        lic: "/gmvcs/audio",
        index: 2
    },
    {
        title: '监督中心',
        url: '/jdzxpt.html', // TODO ======> 暂时跳转至数据中心
        icon: 'nav-jdzx',
        iconActive: 'nav-jdzx-active',
        key: 'jdzxpt',
        lic: "/gmvcs/eva", // TODO ======> 监督中心暂时用综合展示校验字段，待后台配置监督中心后再修改！！！！
        index: 3
    },
    {
        title: '运维中心',
        url: '/tyywglpt.html',
        icon: 'nav-ywzx',
        iconActive: 'nav-ywzx-active',
        key: 'ywzx',
        lic: "/gmvcs/uom",
        index: 4
    },
    {
        title: '配置中心',
        url: '/tyyhrzpt.html',
        icon: 'nav-pzzx',
        iconActive: 'nav-pzzx-active',
        key: 'pzzx',
        lic: "/gmvcs/uap",
        index: 5
    }
];

// 实时指挥系统模拟数据
// let sszh_menu = {
//     "/gmvcs/sszhxt": [
//         "SSZH_MENU_SSZH",
//         "SSZH_MENU_SPJK",
//         "SSZH_MENU_LXHF",
//         "SSZH_MENU_GJHF",
//         "SSZH_MENU_GJGL",
//         //    "SSZH_MENU_DZWL",
//         //  "SSZH_MENU_JQDJ",
//         "SSZH_MENU_XXCJ",
//         "SSZH_FUNC_SSZH_CHECK",
//         "SSZH_FUNC_SSZH_DEL",
//         "SSZH_FUNC_GJGL_DEL",
//         "SSZH_FUNC_GJGL_ADD",
//         "SSZH_FUNC_GJGL_CHECK",
//         "SSZH_FUNC_DZWL_EDIT"
//     ]
// };

const getUserInfo = new Promise((rs, rj) => {
    let userInfo = {};
    // let url = window.location.href;
    ajax({
        url: '/gmvcs/uap/cas/loginUser',
        method: 'get',
        data: {}
    }).then(result => {
        let data = result.data;
        if (!data || result.code != 0) {
            if (/tyywglpt-sqgl-index/.test(global.location.hash) || /video-demo.html/.test(window.location.href)) {

            } else {
                if (!/main-login/.test(global.location.href)) {
                    storage.clearAll();
                    global.location.href = '/main-login.html';
                }
            }
        }
        userInfo = data;
        //设置本地储存或cookie > loginInfo
        if (!data)
            return;
        // storage.clearAll(); //清除之前的所有数据
        setLoginUserInfo(data);

        ajax({
            url: '/gmvcs/uap/org/find/fakeroot/selected?uid=' + data.uid,
            method: 'get',
            data: {}
        }).then(result => {
            let checkType = result.data[0].checkType;
            if (checkType == "UNCHECK") {
                storage.setItem('policeState', true);
            } else {
                storage.setItem('policeState', false);
            }
        });

        rs(userInfo);
    });
});
// 根据权限过滤菜单
const menuPromise = new Promise((rs, rj) => {
    // ====================================================================================
    //  ajax({
    //      url: '/api/loged',
    //      type: 'get'
    //  }).then((result) => {
    //      if(result.code === '0') {
    //          $('#loadImg').css('display', 'none');
    //          $('.login-area').removeClass('hidden').addClass('animated flipInX');
    //          travelMenu(menu, result.data.t.functions, result.data.t.allowedFunctions);
    //          avalon.mix(avalon.vmodels.root, {
    //              user: result.data.t
    //          });
    //          rs(menu.slice(0));
    //      } else {
    //          rj(result);
    //      }
    //  });
    // ===================================================================================
    // travelMenu(menu, {}, {});
    // avalon.mix(avalon.vmodels.root, {
    // 	user: {}
    // });
    // rs(menu.slice(0));

    if (!storage.getItem('license')) {
        getUserInfo.then(info => {
            let uid = storage.getItem('uid');
            ajax({
                // url: '/api/menu',
                url: '/gmvcs/uap/roles/getUserPrivilege?uid=' + uid,
                method: 'get',
                data: {}
            }).then((result) => {
                if (0 != result.code) {
                    notification.error({
                        message: '服务器后端异常，请联系管理员。',
                        title: '温馨提示'
                    });
                    // setTimeout(() => {
                    //     global.location.href = '/main-login.html';
                    // }, 2000);
                    // return;
                }

                let MENU = {}; //存储已授权菜单对象
                let APP_MENU = []; //授权平台菜单数组 -- 一级菜单
                let CAS_MENU_TYYHRZPT = []; //统一用户认证平台菜单数组     -- 二级菜单
                let CAS_FUNC_TYYHRZPT = []; //统一用户认证平台各模块按钮权限数组

                let UOM_MENU_TYYWGLPT_ARR = []; //统一运维管理平台菜单及功能数组 -- 原数据
                let UOM_MENU_TYYWGLPT = []; //统一运维管理平台菜单及功能数组
                let AUDIO_MENU_SYPSJGL_ARR = []; //视音频数据管理平台菜单及功能数组 -- 原数据
                let AUDIO_MENU_SYPSJGL = []; //视音频数据管理平台菜单及功能数组
                let SSZH_MENU_SSZHXT_ARR = []; //实时指挥系统平台菜单及功能权限数组 -- 原数据
                let SSZH_MENU_SSZHXT = []; //实时指挥系统平台菜单及功能权限数组

                let JDZX_MENU_JDZXXT = []; //监督中心 系统平台菜单数组 -- 二级菜单
                let JDZX_FUNC_JDZXXT = []; //监督中心 系统平台各模块按钮权限数组

                let menuList = [];
                let res = result.data;

                for (let i in res) {
                    let item = {};
                    item[i] = res[i];
                    menuList.push(item);
                }
                // 加入实时指挥系统模拟数据
                // menuList.push(sszh_menu);

                avalon.each(menuList, function (index, el) {
                    for (let i in el) {
                        if (el.hasOwnProperty(i)) {
                            avalon.each(application_menu, function (idx, ele) {
                                if (ele.lic == i) {
                                    switch (ele.lic) {
                                        // 统一用户认证平台
                                        case "/gmvcs/uap":
                                            getCasMenu(el[i].value, menu, CAS_MENU_TYYHRZPT, CAS_FUNC_TYYHRZPT);
                                            break;
                                            // 统一运维管理平台
                                        case "/gmvcs/uom":
                                            for (let key in el[i].value) {
                                                UOM_MENU_TYYWGLPT.push(key);
                                            }
                                            UOM_MENU_TYYWGLPT_ARR = el[i].value;
                                            // avalon.Array.merge(UOM_MENU_TYYWGLPT, el[i].value);
                                            break;
                                            // 视音频数据管理平台
                                        case "/gmvcs/audio":
                                            for (let key in el[i].value) {
                                                AUDIO_MENU_SYPSJGL.push(key);
                                            }
                                            AUDIO_MENU_SYPSJGL_ARR = el[i].value;
                                            // avalon.Array.merge(AUDIO_MENU_SYPSJGL, el[i].value);
                                            break;
                                        case "/gmvcs/instruct":
                                            for (let key in el[i].value) {
                                                SSZH_MENU_SSZHXT.push(key);
                                            }
                                            SSZH_MENU_SSZHXT_ARR = el[i].value;
                                            // el[i].value.splice(9,1);//隐藏电子围栏菜单
                                            // el[i].value.splice(19,1);//隐藏集群对讲菜单
                                            // avalon.Array.merge(SSZH_MENU_SSZHXT, el[i].value);
                                            break;
                                            //监督中心
                                        case "/gmvcs/eva":
                                            getCasMenu(el[i].value, jdzx, JDZX_MENU_JDZXXT, JDZX_FUNC_JDZXXT);
                                    }
                                    let tempItem = ele;
                                    el[i].name && (tempItem.title = el[i].name);
                                    // if ('/gmvcs/audiozhzs' == i) // TODO ======> 暂时用综合展示的检验字段，以显示“监督中心”！！后台配置后务必要修改！！！
                                    //     tempItem.title = '监督中心';
                                    APP_MENU.push(tempItem);
                                    return;
                                }
                            });
                        }
                    }
                });

                MENU.APP_MENU = APP_MENU.sort(sortByIndex('index')); //APP_MENU 已授权的平台菜单
                MENU.CAS_MENU_TYYHRZPT = CAS_MENU_TYYHRZPT; //CAS_MENU_TYYHRZPT 统一用户认证平台菜单
                // MENU.CAS_MENU_TYYHRZPT = menu; // 3.6版本模拟数据，配置权限后删除
                MENU.CAS_FUNC_TYYHRZPT = CAS_FUNC_TYYHRZPT; //CAS_FUNC_TYYHRZPT 统一用户认证平台各模块按钮权限数组

                MENU.UOM_MENU_TYYWGLPT_ARR = UOM_MENU_TYYWGLPT_ARR; //UOM_MENU_TYYWGLPT 统一运维管理平台菜单及功能权限数组 -- 原数据
                MENU.UOM_MENU_TYYWGLPT = UOM_MENU_TYYWGLPT; //UOM_MENU_TYYWGLPT 统一运维管理平台菜单及功能权限数组
                MENU.AUDIO_MENU_SYPSJGL_ARR = AUDIO_MENU_SYPSJGL_ARR; //AUDIO_MENU_SYPSJGL 视音频数据管理平台菜单及功能权限数组 -- 原数据
                MENU.AUDIO_MENU_SYPSJGL = AUDIO_MENU_SYPSJGL; //AUDIO_MENU_SYPSJGL 视音频数据管理平台菜单及功能权限数组
                MENU.SSZH_MENU_SSZHXT_ARR = SSZH_MENU_SSZHXT_ARR; //SSZH_MENU_SSZHXT 实时指挥系统平台菜单及功能权限数组 -- 原数据
                MENU.SSZH_MENU_SSZHXT = SSZH_MENU_SSZHXT; //SSZH_MENU_SSZHXT 实时指挥系统平台菜单及功能权限数组

                MENU.JDZX_MENU_JDZXXT = JDZX_MENU_JDZXXT; //JDZX_MENU_JDZXXT 监督中心系统平台菜单
                MENU.JDZX_FUNC_JDZXXT = JDZX_FUNC_JDZXXT; //JDZX_FUNC_JDZXXT 监督中心系统平台各模块按钮权限数组

                rs(MENU);
            });
        });
    } else {
        let MENU = {}; //存储已授权菜单对象 UOM_MENU_TYYWGLPT
        MENU.UOM_MENU_TYYWGLPT = ['UOM_MENU_SQGL'];
        rs(MENU);
    }
});
// 获取已授权的菜单，用于动态改变系统平台的title
const sysMenu = new Promise((rs, rj) => {
    if (storage.getItem('license') == 'none') {
        rs({});
        return;
    }
    let menu = {};
    getUserInfo.then(info => {
        let uid = storage.getItem('uid');
        ajax({
            url: '/gmvcs/uap/shortcut/getByUid?uid=' + uid,
            method: 'get',
            data: {}
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: '服务器后端异常，请联系管理员。',
                    title: '温馨提示'
                });
                return;
            }

            // let bsList = [];
            let sysList = [];
            avalon.each(result.data, function (k, v) {
                if ('APPLICATION' == v.model) {
                    // bsList.push(v);
                } else {
                    sysList.push(v);
                }
            });

            // menu.bsList = bsList; // 已授权应用菜单
            menu.sysList = sysList; // 已授权系统菜单
            rs(menu);
        });
    });
    // 获取当前登录用户的快捷菜单

});



/** remote_menu：请求获取的菜单数组， native_menu：本地创建的菜单（数组）， output_cas_menu：遍历处理后的二级菜单（数组），output_fun_menu：模块按钮的功能菜单（数组）,可不传 **/
function getCasMenu(cas_menu, native_menu, output_cas_menu, output_fun_menu) {
    let remote_menu = [];
    let list = [];
    for (let key in cas_menu) {
        remote_menu.push(key);
    }
    avalon.each(native_menu, function (k, v) {
        avalon.each(remote_menu, function (kk, vv) {
            if (v.lic == vv) {
                let child_list = [];
                if (!v.hasOwnProperty("children") || 0 == v.children.length) {

                } else {
                    avalon.each(v.children, function (i, item) {
                        avalon.each(remote_menu, function (j, el) {
                            if (el == item.lic) {
                                if (cas_menu[item.lic])
                                    item.title = cas_menu[item.lic];
                                child_list.push(item);
                                return;
                            }
                        });
                        v.children = child_list;
                    });
                }
                if (cas_menu[v.lic])
                    v.title = cas_menu[v.lic];
                avalon.Array.ensure(output_cas_menu, v);
                avalon.Array.ensure(list, vv);
                return;
            }
        });
    });
    if ("undefined" != typeof output_fun_menu) {
        avalon.each(list, function (key, val) {
            avalon.Array.remove(remote_menu, val);
        });
        avalon.Array.merge(output_fun_menu, remote_menu);
    }
}

/**
 *  排序
 *
 * @param {*} prop 根据prop属性进行排序
 * @returns
 */
function sortByIndex(prop) {
    return function (a, b) {
        var v1 = a[prop];
        var v2 = b[prop];
        if (!isNaN(Number(v1)) && !isNaN(Number(v2))) {
            v1 = Number(v1);
            v2 = Number(v2);
        }
        if (v1 < v2) {
            return -1;
        } else if (v1 > v2) {
            return 1;
        } else {
            return 0;
        }
    };
}

function travelMenu(menulet, functions, allowedFunctions) {
    if (!menulet) {
        return;
    }
    for (let i = 0, item; item = menulet[i++];) {
        let hasPermission = false;
        for (let j = 0, func; func = functions[j++];) {
            if (func.code === item.name && (allowedFunctions[func.code])) {
                item.uri = func.uri || item.uri || 'javascript:;';
                item.icon = func.icon_url || item.icon;
                item.target = item.target || '_self';
                item.children = item.children || [];
                item.opened = false;
                hasPermission = true;
                break;
            }
            if (allowedFunctions['all']) {
                hasPermission = true;
            }
        }
        item.show = hasPermission === true;

        travelMenu(item.children, functions, allowedFunctions);
    }
}

function walkMenu(menu, key, process, level = 1) {
    let finded = false;
    for (let i = 0; i < menu.length; i++) {
        const item = menu[i];
        process(item);
        if (item.key === key) {
            finded = true;
            break;
        }
        if (item.children && walkMenu(item.children, key, process, level + 1)) {
            finded = true;
            break;
        }
        process('', true);
    };
    return finded;
}

function getKeyPath(key) {
    return menuPromise.then((menu) => {
        const keyPath = [];

        walkMenu(menu.toJSON ? menu.toJSON() : menu, key, function (item, shift) {
            if (shift) {
                keyPath.shift();
            } else {
                keyPath.unshift(item);
            }
        });

        return keyPath;
    });
}
export {
    getKeyPath,
    menuPromise as menu,
    menubar,
    sysMenu,
    getUserInfo
};