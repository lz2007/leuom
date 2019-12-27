import 'ane';
import { notification } from 'ane';
import ajax from './ajaxService';
import { getKeyPath } from './menuService';
import * as cityobj from '/apps/common/common-sszhmap-cityaddress';
import { defalutCity } from '/services/configService';
let storage = require('/services/storageService').ret;

export const mapCity = {
    getCity: function() {
        //后台获取当前用户设置的地图默认城市
        let cityObject = {};
        cityObject.getCityComplete = false;
        storage.setItem('currentDefaultCity', cityObject); // 先预设getCityComplete属性以判断请求是否完成
        ajax({
            url: '/gmvcs/uap/user/city/get',
            method: 'get',
            data: null,
            async: false
        }).then(result => {
            if (result.code == 0) {
                let city;
                if (result.data != null || result.data != undefined) {
                    city = result.data.city;
                } else {
                    city = defalutCity;
                }
                cityObject.getCityComplete = true;
                cityObject.defaultcity = city;
                cityObject.lon = cityobj[city].lon;
                cityObject.lat = cityobj[city].lat;
                storage.setItem('currentDefaultCity', cityObject);
                return cityObject;
            }
        });
    },
    setCity: function(city) {
        let cityObject = {};
        let data = {};
        data.city = city;
        ajax({
            url: '/gmvcs/uap/user/city/save-update',
            method: 'POST',
            data: data
        }).then(result => {
            if (result.code == 0) {
                notification.success({
                    message: '默认城市设置成功',
                    title: '通知'
                });
                cityObject.defaultcity = city;
                cityObject.lon = cityobj[city].lon;
                cityObject.lat = cityobj[city].lat;
                storage.setItem('currentDefaultCity', cityObject);
                return cityObject;
            } else {
                notification.error({
                    message: '默认城市设置失败',
                    title: '通知'
                });
            }
        })
    },
    deleteCity: function() {
        let cityObject = {};
        ajax({
            url: '/gmvcs/uap/user/city/delete',
            method: 'get',
            data: null
        }).then(result => {
            if (result.code == 0) {
                cityObject.defaultcity = city;
                cityObject.lon = cityobj[city].lon;
                cityObject.lat = cityobj[city].lat;
                storage.setItem('currentDefaultCity', cityObject); //删掉默认城市，还原成配置的默认城市
                notification.success({
                    message: '默认城市删除成功',
                    title: '通知'
                });
            } else {
                notification.error({
                    message: '默认城市删除失败',
                    title: '通知'
                });
            }
        })
    }
}

export const demo = {
    key: 'region_id',
    initialData: function () {
        return {
            region_enable: 0,
            region_id: '',
            region_name: '',
            region_parent_id: '',
            region_type: '',
            suites: [{
                name: 'lzp'
            }]
        };
    },
    fetch: function (params) {
        return ajax({
            url: '/api/demo',
            type: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/api/demo/update',
            type: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/api/demo/update',
            type: 'post',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/api/demo/update',
            type: 'post',
            data: params
        });
    }
};
export const deviceManage = {
    key: 'device',
    initialData: function () {
        return {
            dep_code: "999999999999",
            police_id: "",
            device_id: "",
            token: ""
        };
    },
    initRegisterInfo: function (params) {
        return ajax({
            url: '/api/deviceRegister/users',
            type: 'get',
            data: params
        });
    },
    fetch: function (params) {
        return ajax({
            url: '/api/deviceManage',
            type: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/api/deviceManage/update',
            type: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/api/deviceManage/update',
            type: 'post',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/api/deviceManage/update',
            type: 'post',
            data: params
        });
    }
};
export  const  trackReplay = {
    key: 'trackReplay',
    getTrack: function (params) {
        return ajax({
            url: '/api/trackReplay',
            type: 'get',
            data: params
        });
    },
    getTree: function (params) {
        return ajax({
            url: '/api/trackReplay/gettree',
            type: 'get',
            data: params
        })
    }
};
export const file = {
    insert: function (params) {
        $.ajaxFileUpload({
            url: '/api/file/uploadFile',
            secureuri: false,
            fileElementId: params.fileElementId,
            dataType: 'json',
            success: params.success
        });
    }
};
export const bmgl = {
    key: 'bmgl',
    initialData: function () {
        return {
            
        };
    },
    initRegisterInfo: function (params) {
        return ajax({
            url: '/api/deviceRegister/users',
            type: 'get',
            data: params
        });
    },
    fetch: function (params) {
        return ajax({
            url: '/api/bmgl-table',
            method: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/gmvcs/uap/org/save',
            method: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/gmvcs/uap/org/edit',
            method: 'post',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/gmvcs/uap/org/delete',
            method: 'post',
            data: params
        });
    }
}
export const gnqx = {
    key: 'gnqx',

    initialData: function () {
        return {
            roleName: '',
            roleDesc: '',
            depArr: [],
        };
    },
    fetch: function (params) {
        return ajax({
            url: '/api/gnqx-table',
            method: 'get',
            data: params
        });
    },
    operateTable : function (params) {
        return ajax({
            url: '/api/gnqx-table',
            method: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/api/bmgl-update',
            method: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/api/bmgl-update',
            method: 'get',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/api/bmgl-update',
            method: 'get',
            data: params
        });
    }
}
export const github = {
    limit: 30,
    repository: function (params) {
        return ajax({
            url: "/search/repositories",
            type: 'get',
            data: params
        });
    },
    processRequest: function (params) {
        return {
            q: params.query,
            start: (params.page - 1) * this.limit,
            limit: this.limit
        };
    },
    processResponse: function (data) {
        data = data.data;
        data.rows = data.items;
        data.total = data.total_count;
        return data;
    }
};

export const menu = {
    selectedKeys$: Observable(),
    openKeys$: Observable()
};
menu.selectedKeys$.subscribe(v => {
    v[0] && getKeyPath(v[0]).then(result => {
        menu.openKeys$.onNext(result.map(item => item.key));
        breadcrumb.list$.onNext(result.reverse());
    });
});

export const breadcrumb = {
    list$: Observable()
};

function Observable() {
    return {
        onNextCbList: [],
        subscribe(onNext) {
            this.onNextCbList.push(onNext);
        },
        onNext(value) {
            this.onNextCbList.forEach(cb => {
                if (typeof cb === 'function') {
                    cb(value);
                }
            });
        }
    };
}