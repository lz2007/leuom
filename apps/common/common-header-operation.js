/**
 * 菜单右上角操作弹窗组件
 * 修改密码弹窗、退出登录弹窗
 */
import {
    notification
} from "ane";
import ajax from '/services/ajaxService.js';

require('/apps/common/common-header-operation.css');
let {
    mainIndex,
    languageSelect
} = require('/services/configService');
let language_txt = require('../../vendor/language').language;
let storage = require('/services/storageService.js').ret;
let op_vm;

export const name = 'ms-header-operation';
const msHeaderOperation = avalon.component(name, {
    template: __inline('./common-header-operation.html'),
    defaults: {
        initData: function () {
            return {
                account: '',
                oldPwd: '',
                newPwd: '',
                repPwd: ''
            };
        },
        // 修改密码
        change_Pwd: avalon.define({
            $id: 'change_Pwd',
            pwd_language: getLan(),
            title: getLan().changePassword,
            extra_class: languageSelect == "en" ? true : false,
            showAccount: false,
            account_tips_error: false,
            oldPwd_tips_error: false,
            newPwd_tips_error: false,
            repPwd_tips_error: false,
            account_tips_text: '',
            oldPwd_tips_text: '',
            newPwd_tips_text: '',
            repPwd_tips_text: '',
            record: {
                account: '',
                oldPwd: '',
                newPwd: '',
                repPwd: ''
            },
            // 输入框onChange事件
            iputhandle(e) {
                var objName = e.target.name;
                if (undefined == objName)
                    return;
                this.record[objName] = e.target.value;
                switch (objName) {
                    case 'account':
                        this.account_tips_error = false;
                        this.account_tips_text = '';
                        break;
                    case 'oldPwd':
                        this.oldPwd_tips_error = false;
                        this.oldPwd_tips_text = '';
                        break;
                    case 'newPwd':
                        this.newPwd_tips_error = false;
                        this.newPwd_tips_text = '';
                        break;
                    case 'repPwd':
                        this.repPwd_tips_error = false;
                        this.repPwd_tips_text = '';
                        break;
                }
            },
            // 取消
            editCancel() {
                let _this = msHeaderOperation.defaults;
                _this.changePwd.show = false;
                _this.change_Pwd.record = _this.initData();
            },
            // 确定修改
            editOk() {
                let _this = msHeaderOperation.defaults;
                let change_Pwd = _this.change_Pwd;
                var pwdText = change_Pwd.record;
                if (this.showAccount && pwdText.account == '') {
                    change_Pwd.account_tips_text = getLan().enterAccount;
                    change_Pwd.account_tips_error = true;
                    return;
                };
                if (pwdText.oldPwd == '') {
                    change_Pwd.oldPwd_tips_text = getLan().changePassword1;
                    change_Pwd.oldPwd_tips_error = true;
                    return;
                };
                if (pwdText.newPwd == '') {
                    change_Pwd.newPwd_tips_text = getLan().changePassword2;
                    change_Pwd.newPwd_tips_error = true;
                    return;
                };
                if (pwdText.newPwd.length < 8) {
                    change_Pwd.newPwd_tips_text = getLan().changePassword3;
                    change_Pwd.newPwd_tips_error = true;
                    return;
                };
                if (pwdText.repPwd == '') {
                    change_Pwd.repPwd_tips_text = getLan().changePassword4;
                    change_Pwd.repPwd_tips_error = true;
                    return;
                };
                if (pwdText.newPwd != pwdText.repPwd) {
                    change_Pwd.repPwd_tips_text = getLan().changePassword5;
                    change_Pwd.repPwd_tips_error = true;
                    return;
                };
                if (pwdText.oldPwd == pwdText.repPwd) {
                    change_Pwd.repPwd_tips_text = getLan().changePassword6;
                    change_Pwd.repPwd_tips_error = true;
                    return;
                };

                // 填写无误时初始化信息提示
                change_Pwd.account_tips_error = false;
                change_Pwd.oldPwd_tips_error = false;
                change_Pwd.newPwd_tips_error = false;
                change_Pwd.repPwd_tips_error = false;
                change_Pwd.account_tips_text = '';
                change_Pwd.oldPwd_tips_text = '';
                change_Pwd.newPwd_tips_text = '';
                change_Pwd.repPwd_tips_text = '';

                if (this.showAccount) {
                    ajax({
                        url: '/gmvcs/uap/cas/compel/changePassword',
                        method: 'post',
                        data: {
                            "account": pwdText.account,
                            "newPassword": pwdText.newPwd,
                            "oldPassword": pwdText.oldPwd
                        }
                    }).then(ret => {
                        if (0 != ret.code) {
                            notification.error({
                                message: ret.msg,
                                title: language_txt.sszhxt.main.notification
                            });
                            return;
                        }
                        _this.changePwd.show = false;
                        notification.success({
                            message: ret.msg,
                            title: language_txt.sszhxt.main.notification
                        });
                    });
                } else {
                    ajax({
                        url: '/gmvcs/uap/user/changPassword',
                        method: 'post',
                        data: {
                            "newPassword": pwdText.newPwd,
                            "oldPassword": pwdText.oldPwd
                        }
                    }).then(data => {
                        if (0 != data.code) {
                            notification.error({
                                message: data.msg,
                                title: language_txt.sszhxt.main.notification
                            });
                            return;
                        }
                        _this.changePwd.show = false;
                        notification.success({
                            message: getLan().changePassword7,
                            title: language_txt.sszhxt.main.notification
                        });
                        storage.clearAll();
                        //强制退出跳转至登录页

                        setTimeout(() => {
                            global.location.href = '/main-login.html';
                        }, 3000);
                    });
                }

                // _this.change_Pwd.record = _this.initData();
            }
        }),
        changePwd: avalon.define({
            $id: 'changePwd',
            show: false,
            heightSelect: false,
            editCancel() {
                this.show = false;
            },
            move_return_pwd(a, b) {
                let _this = this;
                if ($("#iframe_zfsyps").length && $("#iframe_zfsyps").length > 0) {
                    $("#iframe_zfsyps").css({
                        width: "440px", //---- 这个是弹窗的宽度
                        height: _this.heightSelect ? "398px" : "335px", //---- 这个是弹窗的高度
                        left: a,
                        top: b
                    });
                }
                if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                    $("#iframe_jdzxpt").css({
                        width: "440px", //---- 这个是弹窗的宽度
                        height: _this.heightSelect ? "398px" : "335px", //---- 这个是弹窗的高度
                        left: a,
                        top: b
                    });
                }
            }
        }),
        //退出登录
        logout_vm: avalon.define({
            $id: 'logout_vm',
            show_logout: false,
            cancelLogout(e) {
                this.show_logout = false;
            },
            handleLogout() {
                ajax({
                    url: '/gmvcs/uap/cas/logout',
                    method: 'get',
                    data: {}
                }).then(data => {
                    if (0 !== data.code) {
                        notification.warn({
                            message: data.msg,
                            title: '温馨提示'
                        });
                        return;
                    }

                    // notification.success({
                    //     message: '退出系统成功！',
                    //     title: '温馨提示'
                    // });
                    this.show_logout = false;
                    storage.clearAll();
                    setTimeout(() => {
                        global.location.href = '/main-login.html';
                    }, 0);
                });
            },
            move_return_logout(a, b) {
                if ($("#iframe_zfsyps").length && $("#iframe_zfsyps").length > 0) {
                    $("#iframe_zfsyps").css({
                        width: "440px", //---- 这个是弹窗的宽度
                        height: "245px", //---- 这个是弹窗的高度
                        left: a,
                        top: b
                    });
                }
                if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                    $("#iframe_jdzxpt").css({
                        width: "440px", //---- 这个是弹窗的宽度
                        height: "245px", //---- 这个是弹窗的高度
                        left: a,
                        top: b
                    });
                }
            }
        }),
        //我的告警
        myAlarm_vm: avalon.define({
            $id: 'myAlarm_vm',
            show: false,
            cancelMyAlarm(e) {
                this.show = false;
            },
            move_return_myAlarm(a, b) {
                if ($("#iframe_zfsyps").length && $("#iframe_zfsyps").length > 0) {
                    $("#iframe_zfsyps").css({
                        width: "440px", //---- 这个是弹窗的宽度
                        height: "380px", //---- 这个是弹窗的高度
                        left: a,
                        top: b
                    });
                }
                if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                    $("#iframe_jdzxpt").css({
                        width: "440px", //---- 这个是弹窗的宽度
                        height: "380px", //---- 这个是弹窗的高度
                        left: a,
                        top: b 
                    });
                }
            }
        }),
        // myAlarm: avalon.define({
        //     $id: 'myAlarm',
        //     title: '我的信息',
        //     show: false,
        //     list: [], //告警信息对象数组
        //     isDetail: 0, //0:告警信息列表 1：告警详情信息 2：数据加载中
        //     detailMsg: {},
        //     myAlarm_language: getLan(),
        //     btn: {
        //         back: getLan().back,
        //         close: getLan().close,
        //     },
        //     //实时指挥系统由于ocx会遮盖弹窗，所以重新定义了footer，以下事件用于footer的按钮
        //     cancelViewAlarm() {
        //         let _this = msHeaderOperation.defaults;
        //         let myAlarm_vm = _this.myAlarm_vm;
        //         this.show = false;
        //     },
        //     //查看点击事件
        //     iconViewClick(obj) {
        //         this.detailMsg = obj;
        //         this.ajaxReadAlarmMsg(obj.id);
        //         this.isDetail = 1;
        //     },
        //     //告警详情返回
        //     iconBackClick() {
        //         op_vm.ajaxMyAlarm();
        //     },
        //     //告警信息查看接口
        //     ajaxReadAlarmMsg(id) {
        //         ajax({
        //             url: `/gmvcs/operation/sos/setting/read?id=${id}`,
        //             // url: '/api/common-header-operation-myAlarmRead',
        //             method: 'get',
        //             data: {}
        //         }).then(result => {
        //             if (0 != result.code) {
        //                 notification.error({
        //                     message: result.msg,
        //                     title: language_txt.sszhxt.main.notification
        //                 });
        //                 return;
        //             }
        //         });
        //     },
        // }),
        //告警信息列表接口
        ajaxMyAlarm() {
            //先默认是隐藏，有数据才显示红点
            $(".common-layout .layout-header .user-info .user-drop-down ul .tip").hide();
            $(".common-layout .layout-header .user-info .user-drop-down ul .fa-spin").show();
            //清空之前的信息列表
            myAlarm.list = [];
            myAlarm.isDetail = 2; //显示我的告警信息loading效果
            ajax({
                url: `/gmvcs/operation/sos/setting/search?uid=${storage.getItem('uid')}`,
                // url: '/api/common-header-operation-myAlarm',
                method: 'get',
                data: {}
            }).then(result => {
                myAlarm.isDetail = 0; //显示我的告警信息列表
                if (0 != result.code) {
                    notification.error({
                        message: result.msg,
                        title: language_txt.sszhxt.main.notification
                    });
                    return;
                }
                if (result.data && result.data.length != 0) {
                    myAlarm.list = result.data;
                    //显示红点 和 缓冲
                    $(".common-layout .layout-header .user-info .user-drop-down ul .tip").show();
                    $(".common-layout .layout-header .user-info .user-drop-down ul .fa-spin").hide();
                } else {
                    $(".common-layout .layout-header .user-info .user-drop-down ul .fa-spin").hide();
                }
            });
        },
        logout: avalon.define({
            $id: 'logout',
            title: getLan().logoutTitle,
            logoutMsg: getLan().logoutMsg,
            btn: {
                confirm: getLan().logoutSubmit,
                cancel: getLan().cancel
            },
            //实时指挥系统由于ocx会遮盖弹窗，所以重新定义了footer，以下两个事件用于footer的按钮
            handleLogout() {
                let _this = msHeaderOperation.defaults;
                let logout_vm = _this.logout_vm;
                logout_vm.handleLogout();
            },
            cancelLogout() {
                let _this = msHeaderOperation.defaults;
                let logout_vm = _this.logout_vm;
                logout_vm.cancelLogout();
            }
        }),
        onInit: function (event) {
            op_vm = event.vmodel;
            let _this = this;
            // 检测修改密码弹窗打开和关闭
            this.changePwd.$watch('show', v => {
                let iframeObj = document.getElementsByTagName('iframe');
                if (v) {
                    if (!$('.modal-dialog').hasClass('edit-pwd')) {
                        $('.modal-dialog').addClass('edit-pwd');
                        $('.modal-content').addClass('editPwdDraggable');
                    }
                    if ($("#iframe_zfsyps").length && $("#iframe_zfsyps").length > 0) {
                        $("#iframe_zfsyps").css({
                            "opacity": 0
                        });
                        setTimeout(function () {
                            $("#iframe_zfsyps").css({
                                "opacity": 1
                            });
                            $("#iframe_zfsyps").show();
                        }, 600);
                    }
                    if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                        $("#iframe_jdzxpt").css({
                            "opacity": 0
                        });
                        setTimeout(function () {
                            $("#iframe_jdzxpt").css({
                                "opacity": 1
                            });
                            $("#iframe_jdzxpt").show();
                        }, 600);
                    }
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.hide_player();
                    //     } catch (e) {}
                    // }
                    _this.change_Pwd.record = _this.initData();
                } else {
                    $("#iframe_zfsyps").hide();
                    $("#iframe_jdzxpt").hide();
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.show_player();
                    //     } catch (e) {}
                    // }
                    this.change_Pwd.account_tips_error = false;
                    this.change_Pwd.oldPwd_tips_error = false;
                    this.change_Pwd.newPwd_tips_error = false;
                    this.change_Pwd.repPwd_tips_error = false;
                    this.change_Pwd.account_tips_text = '';
                    this.change_Pwd.oldPwd_tips_text = '';
                    this.change_Pwd.newPwd_tips_text = '';
                    this.change_Pwd.repPwd_tips_text = '';
                }
            });
            // 检测退出登录弹窗弹窗打开和关闭
            this.logout_vm.$watch('show_logout', v => {
                let iframeObj = document.getElementsByTagName('iframe');
                if (v) {
                    if (!$('.modal-dialog').hasClass('logout_vm')) {
                        $('.modal-dialog').addClass('logout_vm');
                    }
                    if ($("#iframe_zfsyps").length && $("#iframe_zfsyps").length > 0) {
                        $("#iframe_zfsyps").css({
                            "opacity": 0
                        });
                        setTimeout(function () {
                            $("#iframe_zfsyps").css({
                                "opacity": 1
                            });
                            $("#iframe_zfsyps").show();
                        }, 600);
                    }
                    if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                        $("#iframe_jdzxpt").css({
                            "opacity": 0
                        });
                        setTimeout(function () {
                            $("#iframe_jdzxpt").css({
                                "opacity": 1
                            });
                            $("#iframe_jdzxpt").show();
                        }, 600);
                    }

                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.hide_player();
                    //     } catch (e) {}
                    // }
                } else {
                    $("#iframe_zfsyps").hide();
                    $("#iframe_jdzxpt").hide();
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.show_player();
                    //     } catch (e) {}
                    // }
                }
            });
            // 检测退出登录弹窗弹窗打开和关闭
            this.myAlarm_vm.$watch('show', v => {
                let iframeObj = document.getElementsByTagName('iframe');
                if (v) {
                    if ($("#iframe_zfsyps").length && $("#iframe_zfsyps").length > 0) {
                        $("#iframe_zfsyps").css({
                            "opacity": 0
                        });
                        setTimeout(function () {
                            $("#iframe_zfsyps").css({
                                "opacity": 1
                            });
                            $("#iframe_zfsyps").show();
                        }, 600);
                    }
                    if ($("#iframe_jdzxpt").length && $("#iframe_jdzxpt").length > 0) {
                        $("#iframe_jdzxpt").css({
                            "opacity": 0
                        });
                        setTimeout(function () {
                            $("#iframe_jdzxpt").css({
                                "opacity": 1
                            });
                            $("#iframe_jdzxpt").show();
                        }, 600);
                    }
                } else {
                    $("#iframe_zfsyps").hide();
                    $("#iframe_jdzxpt").hide();
                }
            });
        },
        onReady: function (event) {},
        onDispose: function (event) {}
    }
});

const myAlarm = avalon.define({
    $id: 'myAlarm',
    title: '我的信息',
    show: false,
    list: [], //告警信息对象数组
    isDetail: 0, //0:告警信息列表 1：告警详情信息 2：数据加载中
    detailMsg: {},
    myAlarm_language: getLan(),
    btn: {
        back: getLan().back,
        close: getLan().close,
    },
    //实时指挥系统由于ocx会遮盖弹窗，所以重新定义了footer，以下事件用于footer的按钮
    cancelViewAlarm() {
        let _this = msHeaderOperation.defaults;
        this.show = false;
    },
    //查看点击事件
    iconViewClick(obj) {
        this.detailMsg = obj;
        this.ajaxReadAlarmMsg(obj.id);
        this.isDetail = 1;
    },
    //告警详情返回
    iconBackClick() {
        op_vm.ajaxMyAlarm();
    },
    //告警信息查看接口
    ajaxReadAlarmMsg(id) {
        ajax({
            url: `/gmvcs/operation/sos/setting/read?id=${id}`,
            // url: '/api/common-header-operation-myAlarmRead',
            method: 'get',
            data: {}
        }).then(result => {
            if (0 != result.code) {
                notification.error({
                    message: result.msg,
                    title: language_txt.sszhxt.main.notification
                });
                return;
            }
        });
    },
});

function getLan() {
    return language_txt.sszhxt.main;
}

