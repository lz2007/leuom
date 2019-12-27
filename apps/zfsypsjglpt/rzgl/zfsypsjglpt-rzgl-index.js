import {
    notification,
} from "ane";
export const name = "zfsypsjglpt-rzgl-index";
require("./zfsypsjglpt-rzgl-index.css");

avalon.component(name, {
    template: __inline("./zfsypsjglpt-rzgl-index.html"),
    defaults: {
        onInit() {},
        onReady() {
            notification.warn({
                message: '页面施工中...',
                title: '通知',
                timeout: 3000
            });
        }
    }
});