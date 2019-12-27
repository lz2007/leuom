import './shandongLine.less'
import {
    gxxOcxVersion,
    defaultBrowser
} from '/services/configService'
import { Math } from 'es6-shim';
export const name = 'ms-shandong-line'

let chromeDownloadUrl = '/static/GSBbrowser_chrome-3.3.1.7301.exe', // 谷歌浏览器下载地址
    firefoxDownloadUrl = '/static/GSBrowser_firefox-3.3.1.7301.exe', // 火狐浏览器下载地址
    defaultDownloadUrl = ''

switch (defaultBrowser) {
    case 0:
        defaultDownloadUrl = firefoxDownloadUrl;
        break;
    case 1:
        defaultDownloadUrl = chromeDownloadUrl;
        break;
}

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

avalon.component(name, {
    template: __inline("./shandongLine.html"),
    defaults: {
        version: "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe",
        defaultDownloadUrl: defaultDownloadUrl,
        lists: [
            {
                img: '/static/image/shandongLine/sypgl.png?__sprite',
                url: '/zfsypsjglpt.html',
                title: '视音频管理'
            },
            {
                img: '/static/image/shandongLine/rypz.png?__sprite',
                url: '/tyyhrzpt.html',
                title: '人员配置'
            },
            {
                img: '/static/image/shandongLine/sbyw.png?__sprite',
                url: '/tyywglpt.html#!/tyywglpt-sbzygl-zfygl',
                title: '设备运维'
            }
        ],
        is_IE: isIE_fuc(),
        actions(item) {
            var tmp = window.open(item.url, "_blank");
            tmp.moveTo(0, 0);
            tmp.resizeTo(screen.width, screen.height);
            tmp.focus();
            tmp.location = item.url;
        },
        marginLeft: -1000,
        marginTop: -1000,
        autoImg() {
            let w = avalon(document.getElementById('list-box')).width()
            let h = avalon(document.getElementById('list-box')).height()
            this.marginLeft = -Math.abs(w / 2)
            this.marginTop = -(Math.abs(h / 2) + 20)
        },
        onReady() {
            let img = $('.shandongLine .list-box .img img')[0]
            imgLoad(img, () => {
                this.autoImg()
            })

            window.onresize = () => {
                this.autoImg()
            }
        }

    }
})

function imgLoad(img, callback) {
    var timer = setInterval(function () {
        if (img.complete) {
            callback(img)
            clearInterval(timer)
        }
    }, 50)
}