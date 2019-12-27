/**
 * 高新兴国迈安全浏览器IE8提示下载组件
 */
require('/apps/common/common-browser-upgrade-tips.css');
let storage = require('/services/storageService.js').ret;
import { versionSelection } from '/services/configService';

export const name = 'ms-browser-upgrade-tips';

avalon.effect('slide-animate', {
    enter: function(el, done) {
        $(el).slideDown(200, done);
    },
    leave: function(el, done) {
        $(el).slideUp(200, done);
    }
});

const msBrowserUpgradeTips = avalon.component(name, {
    template: __inline('./common-browser-upgrade-tips.html'),
    defaults: {
        browserText: 'Internet Explorer 11',
        browserUrl: '/static/eie11_zh-cn_wol_win764.exe',
        is64Bit: true,
        isXPOs: false,
        isWinOs: false,
        isLogin: false, // 当前页面是否是登录页面
        action: "leave",
        upgrateShow: false,
        close: function() {
            storage.setItem('browser-tips-had-show', true);
            this.action = "leave";
        },
        onInit: function(event) {
            let _this = this;
            let userAgent = window.navigator.userAgent;
            // 系统是否为windows vista/7/8/9/10
            this.isWinOs = userAgent.indexOf("Windows NT 10.0") != -1 || // win10
                userAgent.indexOf("Windows NT 6.2") != -1 || // win8
                userAgent.indexOf("Windows NT 6.1") != -1 || // win7
                userAgent.indexOf("Windows NT 6.0") != -1; // win vista
            // 系统是否为Windows XP
            this.isXPOs = userAgent.indexOf("Windows NT 5.1") != -1;
            // 系统是否为64位
            this.is64Bit = window.navigator.platform == 'Win64';
            if (this.isXPOs) {
                this.browserText = '高新兴国迈安全浏览器';
                this.browserUrl = '/static/GSBrowser_firefox-3.3.1.7301.exe';
            } else if (!this.is64Bit && this.isWinOs) {
                this.browserUrl = '/static/eie11_zh-cn_wol_win7.exe';
            }
            // 黔西南项目IE10不提醒
            let IeVersion = versionSelection === 'Qianxinan' ? 10 : 11;
            if ((this.isXPOs && avalon.msie < IeVersion) || (this.isWinOs && avalon.msie < IeVersion)) {
                if (this.isLogin) {
                    if(!!storage.getItem("browser-tips-had-show")) {
                        this.upgrateShow = false;
                        return;
                    }
                    this.upgrateShow = true;
                    $('.browser-upgrate-tips').css("z-index", "-10");
                    // 设置1s后进行提示
                    setTimeout(function() {
                        $('.browser-upgrate-tips').css("z-index", "9999");
                        _this.action = "enter";
                    }, 1000);
                } else {
                    if (!!storage.getItem("browser-tips-had-show")) {
                        this.upgrateShow = false;
                    } else {
                        this.upgrateShow = true;
                        $('.browser-upgrate-tips').css("z-index", "-10");
                        // 设置1s后进行提示
                        setTimeout(function() {
                            $('.browser-upgrate-tips').css("z-index", "9999");
                            _this.action = "enter";
                        }, 1000);
                    }
                }
            }
        },
        onReady: function(event) {
            let _this = this;
            $("#GSBrowser").on("click", function() {
                let fileUrl = _this.browserUrl;
                // 登录页面通过window.open来下载文件，其他页面通过a标签来下载，防止在登录页点击下载时页面报错
                if (_this.isLogin) {
                    window.open(fileUrl, "_blank");
                } else {
                    let aLink = document.createElement('a');
                    aLink.id = "downloadLink";
                    aLink.href = fileUrl;
                    aLink.click();
                }
            });
        },
        onDispose: function(event) {}
    }
});