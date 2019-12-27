//
import {
    singleSignOn,
    pkiType,
    gt,
    apiUrl,
    copyRight,
    telephone,
    titleName,
    versionSelection
} from '../../services/configService';

require('bootstrap');
require('../../vendor/jquery/jquery.placeholder.min.js');
import ajax from '../../services/ajaxService.js';
import {
    notification
} from "ane";

var storage = require('../../services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

document.title = titleName;

var login_vm = avalon.define({
    $id: 'login_vm',
    flag_lan: languageSelect == "en" ? true : false,
    login_txt: language_txt.login,
    currentPage: '',
    user: {},
    username: '',
    password: '',
    loginInfo: {},
    authInfo: {},
    singleSignOn: singleSignOn,
    titleName: titleName,
    copyRight: copyRight,
    telephone: telephone,
    version: '',
    loading: false,

    loginStatus: true,
    login() {
        login_vm.loginStatus = false;
        if (this.username == "") {
            notification.warn({
                message: languageSelect == "en" ? "Please Input User Name" : '请输入用户名！',
                title: languageSelect == "en" ? "notification" : '温馨提示'
            });
            login_vm.loginStatus = true;
            return;
        }

        if (this.password == "") {
            notification.warn({
                message: languageSelect == "en" ? "Please Input Password" : '请输入密码！',
                title: languageSelect == "en" ? "notification" : '温馨提示'
            });
            login_vm.loginStatus = true;
            return;
        }

        ajax({
            url: '/gmvcs/uap/cas/login',
            method: 'post',
            data: {
                "account": $.trim(this.username),
                "password": $.trim(this.password)
            }
        }).then(result => {
            //1404表示未授权，1405表示授权已过期
            // storage.setItem('license', 'normal');
            if (result.code == 1404 || result.code == 1405) {
                storage.setItem('license', 'none');
                storage.setItem("licenseCode", result.code);
                global.location.href = '/tyywglpt.html#!/tyywglpt-sqgl-index';
                login_vm.loginStatus = true;
                return;
            }
            if (0 != result.code) {
                notification.warn({
                    message: result.msg,
                    title: languageSelect == "en" ? "notification" : '温馨提示'
                });
                login_vm.loginStatus = true;
                return;
            }
            this.handleLoginData(result.data);
            login_vm.loginStatus = false;
        });
    },
    // pki登录
    pki_login() {
        if (!singleSignOn) {
            return;
        }

        if (pkiType == 0) {
            let baseUrl = '/gmvcs/uap/cas/pki/login';

            if (GetQueryString('usercode')) { // 单点登录
                ajax({
                    url: baseUrl + "?userCode=" + GetQueryString('usercode') + "&gt=" + gt,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (0 == result.code) {
                        this.handleLoginData(result.data);
                    } else {
                        this.loading = false;
                    }
                });
            } else { //主线pki登录
                window.location.href = "http://" + window.location.host + apiUrl + baseUrl;
            }
        } else if (pkiType == 1) { //吉大正元pki登录
            let baseUrl = '/gmvcs/uap/cas/pki/pki-login';
            window.location.href = "//" + window.location.host + apiUrl + baseUrl;
        }

    },
    handleLoginData(data) {
        storage.clearAll(); //清除之前的所有数据
        //设置本地储存或cookie > loginInfo
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

            setTimeout(function () {
                if (languageSelect == "zhcn") {
                    global.location.href = '/';
                } else if (languageSelect == "en") {
                    global.location.href = './sszhxt.html';
                }
            }, 0);
        });

        // setTimeout(function () {
        //     if (languageSelect == "zhcn") {
        //         global.location.href = '/';
        //     } else if (languageSelect == "en") {
        //         global.location.href = './sszhxt.html';
        //     }
        // }, 0);
    },

    //登录页"修改密码"点击事件
    changePasswordClick() {
        avalon.components['ms-header-operation'].defaults.change_Pwd.showAccount = true;
        avalon.components['ms-header-operation'].defaults.changePwd.heightSelect = true;
        avalon.components['ms-header-operation'].defaults.changePwd.show = true;
    }
});

if (singleSignOn && GetQueryString('usercode')) {
    login_vm.loading = true;
}

login_vm.$watch('onReady', function () {
    // 初始化浏览器下载提示localstorage (黔西南项目点了“不再提醒”后，该电脑就不再弹出了)
    versionSelection !== 'Qianxinan' && storage.setItem('browser-tips-had-show', false);
    //兼容ie8的placeholder无效的问题
    $('input').placeholder();
    singleSignOn && GetQueryString('usercode') && login_vm.pki_login(); // 单点登录
    ajax({
        url: '/gmvcs/uap/cas/install/version',
        method: 'get',
        data: {}
    }).then(result => {
        if (0 != result.code) {
            return;
        }
        if (0 == result.code) {
            let versionTxt = language_txt.login.version;
            login_vm.version = versionTxt + result.data.installVersion;
        }
    });
});

login_vm.$watch('onDispose', () => {
    login_vm.loading = false;
});

function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return (r[2]);
    }
    return null;
}

function setLoginUserInfo(data) {
    // console.log(data);
    storage.setItem('account', data.account);
    storage.setItem('userName', data.userName);
    storage.setItem('userCode', data.userCode);
    storage.setItem('orgCode', data.orgCode);
    storage.setItem('orgId', data.orgId);
    storage.setItem('orgPath', data.orgPath);
    storage.setItem('uid', data.uid);
    storage.setItem('idCard', data.idCard);
    storage.setItem('orgName', data.orgName);
    storage.setItem('roleNames', data.roleNames);
    storage.setItem('roleIds', data.roleIds);
    storage.setItem('lastlogintime', data.lastlogintime);
    storage.setItem('lastLonginIp', data.lastLonginIp);
    storage.setItem('accountExpireNum', data.accountExpireNum);
    storage.setItem('loginFailNum', data.loginFailNum);
    storage.setItem('nowLonginIp', data.nowLonginIp);
    storage.setItem('nowlogintime', data.nowlogintime);
    storage.setItem('passwordExpireNum', data.passwordExpireNum);
    storage.setItem('policeState', false);

    //根据admin字段判断是否是超级管理员;若false->根据policeType字段判断是普通警员还是领导[true为领导,false为普通警员]
    /*
    LEVAM_JYLB_LD,           // 领导
    LEVAM_JYLB_ZONGDUI_LD,   // 总队领导
    LEVAM_JYLB_ZHIDUI_LD,   // 支队领导
    LEVAM_JYLB_DADUI_LD,    // 大队领导
    LEVAM_JYLB_ZHONGDUI_LD, // 中队领导
    
    LEVAM_JYLB_JY,           // 警员
    LEVAM_JYLB_ZSJY,        // 正式警员
    LEVAM_JYLB_FJ,          // 辅警

    LEVAM_JYLB_FZRY         //法制人员
    LEVAM_JYLB_FZLD         //法制领导

    LEVAM_JYLB_QT           // 其他
    */
    let tempPoliceType = false;
    let kplb_type; //0表示执法类,1表示法制类,2表示admin超级管理员,3表示其他
    if (data.admin) {
        tempPoliceType = true;
        kplb_type = 2;
    } else {
        let resultPolice = data.policeType;
        switch (resultPolice) {
            case "LEVAM_JYLB_LD":
            case "LEVAM_JYLB_ZONGDUI_LD":
            case "LEVAM_JYLB_ZHIDUI_LD":
            case "LEVAM_JYLB_DADUI_LD":
            case "LEVAM_JYLB_ZHONGDUI_LD":
                tempPoliceType = true;
                kplb_type = 0;
                break;
            case "LEVAM_JYLB_JY":
            case "LEVAM_JYLB_FJ":
                tempPoliceType = false;
                kplb_type = 0;
                break;
            case "LEVAM_JYLB_FZRY":
                tempPoliceType = false;
                kplb_type = 1;
                break;
            case "LEVAM_JYLB_FZLD":
                tempPoliceType = true;
                kplb_type = 1;
                break;
            case "LEVAM_JYLB_QT":
                tempPoliceType = false;
                kplb_type = 3;
                break;
            default:
                tempPoliceType = false;
                kplb_type = 3;
                break;
        }
    }

    storage.setItem("policeType", tempPoliceType);
    storage.setItem("kplb_type", kplb_type);
}

export {
    setLoginUserInfo,
}