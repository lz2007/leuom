// 公共引用部分，兼容IE8用 
require('/apps/common/common');
require('/apps/common/common-layout/common-layout.js');
let {
    applyRouteConfig
} = require('/services/pagesRouterServer');
let {
    titleName,
    mainIndex,
    languageSelect
} = require('/services/configService');
import {
    setLoginUserInfo
} from './apps/common/common-login';
let storage = require('/services/storageService.js').ret;
let ajax = require('/services/ajaxService.js');

avalon.define({
    $id: 'indexVm',
    currentPage: ''
});

ajax({
    url: '/gmvcs/uap/cas/loginUser',
    method: 'get',
    data: {}
}).then(result => {
    let data = result.data;
    if (!data || result.code != 0) {
        if (/tyywglpt-sqgl-index/.test(global.location.hash)) {

        } else {
            storage.clearAll();
            global.location.href = '/main-login.html';
        }
    }
    //设置本地储存或cookie > loginInfo
    if (!data)
        return;
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

        let policeState = storage.getItem('policeState');

        if (languageSelect == "en") {
            document.title = "MVMS";
        } else {
            document.title = titleName;
        }

        /**
         * 首页自定义版本
         * @param mainIndex  mainLine 主线版本  shandongLine 山东 版本
         * 
         */
        let routeConfig = null

        switch (mainIndex) {
            case 'main_index':
                if (policeState) {
                    routeConfig = [{
                        path: '/',
                        component(resolve) {
                            require.async('/apps/mainIndex/mainLine/mainLine', resolve);
                        }
                    }]
                } else {
                    routeConfig = [{
                        path: '/',
                        component(resolve) {
                            require.async('/apps/mainIndex/mainLineManager/mainLineManager', resolve);
                        }
                    }]
                }
                break
            case 'main_sdjj':
                routeConfig = [{
                    path: '/',
                    component(resolve) {
                        require.async('/apps/mainIndex/shandongLine/shandongLine', resolve);
                    }
                }]
                break
        }
        let isHistory = function () {
            if (avalon.msie <= 8) {
                return false
            } else {
                return true
            }
        }();

        applyRouteConfig(routeConfig, {
            name: 'indexVm'
        });

        avalon.history.start({
            fireAnchor: false,
            root: "/", //根路径
            html5: isHistory, //是否使用HTML5 history 
            hashPrefix: ""
        });

        if (!/#!/.test(global.location.hash) && !isHistory) {
            avalon.router.navigate('/', 2);
        }

        avalon.scan(document.body);
    });
});