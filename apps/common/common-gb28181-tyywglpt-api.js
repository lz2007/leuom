import {
    notification
} from 'ane';

export const errOK = 0;
export const notificationTitle = '温馨提示';
export const message = '请求失败，未知错误!';

export function ajaxErrInfo(message = message, title = notificationTitle) {
    notification.error({
        message,
        title
    });
}

export function ajaxInfo(type = 'info', message = message, title = notificationTitle) {
    notification[type]({
        message,
        title
    });
}