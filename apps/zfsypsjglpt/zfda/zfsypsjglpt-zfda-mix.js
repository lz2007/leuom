// zfsypsjglpt-zfda-mix.js
import {
    notification
} from 'ane'

import ajax from '/services/ajaxService'
import {
    store
}
from './zfsypsjglpt-zfda-jtwf-store'
let storage = require('/services/storageService.js').ret;

// url = '/gmvcs/audio/violation/find/pageable'
// url = '/gmvcs/audio/surveil/find/pageable'
// url = '/gmvcs/audio/force/find/pageable'

function trim(str) {
    if (str.replace) {
        return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '')
    }
    return str
}

export const mixins = class comfig {
    // 构造
    constructor(url, urlOver, vmName) {
        this.url = url;
        this.urlOver = urlOver;
        this.vmName = vmName;
        this.componentsVm = null;
        this.isLoading = false;
        this.datas = [];
        this.total = 0;
        this.current = 1;
        this.pageSize = 20;
        this.page = false;
        this.checkVM = null;
        this.overLimit = false;
    }

    onInit() {
        // 定义一个监听的方法
        let listener = () => {
            this.page = store.getState().isCheck
        }
        // 创建一个监听
        store.subscribe(listener)

        // enter 事件
        $(window).off('keydown').on('keydown', (e) => {
            if (e.keyCode === 13 || e.code === 'Enter') {
                if (this.page) {
                    if (this.checkVM.toggleShowTJGL) {
                        this.checkVM.searchonChange()
                    }
                } else {
                    this.componentsVm.fromsearch(this.current - 1)
                }
            }
        })
        if(storage.getItem(this.vmName+"-total")) {//页面切换回来后设置原先的page组件数据
            this.total = storage.getItem(this.vmName+"-total").total;
            this.current = storage.getItem(this.vmName+"-total").current;
            this.overLimit = storage.getItem(this.vmName+"-total").overLimit;
        }

    }

    onDispose() {
        $(window).off('keydown')
    }

    search(data, type, page = 0) {
        if (this.isLoading) {
            return
        }
        this.isLoading = true

        let pageConfig = {
            page: page,
            pageSize: 20
        }

        avalon.each(Object.keys(data), (i, el) => {
            data[el] = trim(data[el])
        })

        let seachParams = {}

        seachParams = JSON.parse(JSON.stringify(data))
        seachParams.wfStartTime += ' 00:00:00'
        seachParams.wfStartTime = new Date(seachParams.wfStartTime.replace(/-/g, '/')).getTime()
        seachParams.wfEndTime += ' 23:59:59'
        seachParams.wfEndTime = new Date(seachParams.wfEndTime.replace(/-/g, '/')).getTime()

        if (seachParams.wfStartTime > seachParams.wfEndTime) {
            notification.error({
                message: '开始时间不能大于结束时间',
                title: '温馨提示'
            })
            this.isLoading = false
            return
        }

        avalon.mix(seachParams, pageConfig)
        // console.log(seachParams);

        ajax({
            url: this.url,
            method: 'post',
            data: seachParams,
            cache: false
        }).then(ret => {
            if (ret.code === 0) {
                this.current = page + 1
                if (ret.data.overLimit) {
                    this.total = 2000
                    this.overLimit = true
                } else {
                    this.total = ret.data.totalElements
                    this.overLimit = false
                }
                // console.log(ret);
                // if (dep_switch && ret.data.currentElements.length!= 0) {//黔西南 部门提示需求功能 开关
                //     let times = 0;
                //     var getFullName = new Promise(function(resolve, reject){
                //             for(let currIndex = 0; currIndex < ret.data.currentElements.length; currIndex++) {
                //                 let val = ret.data.currentElements[currIndex];
                //                 ajax({
                //                     url: `/gmvcs/uap/org/getFullName?orgCode=${val.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                //                     method: 'get'
                //                 }).then(result => {
                //                     val.orgCode = result.data;
                //                     times = times + 1;
                //                 }).then(function(){
                //                     if(times >= ret.data.currentElements.length-1) {
                //                         resolve('end');
                //                     }
                //                 });
                //             };
                //     });
                //     let _this = this;
                //     getFullName.then(x => {
                //         setTimeout(function(){
                //             _this.datas = ret.data
                //             _this.isLoading = false
                //         },100);
                //     });
                // }else {
                    this.datas = ret.data
                    this.isLoading = false

                    let r_this = this;

                    // 如总数量超过限制，则单独请求总数量
                    if(ret.data.overLimit) {
                        ajax({
                            url: r_this.urlOver,
                            method: 'post',
                            data: seachParams,
                            cache: false
                        }).then(overret => {
                            if (overret.code === 0) {
                                r_this.overLimit = false;
                                r_this.total = overret.data.totalElements;
                                storage.setItem(this.vmName+"-total", {"total":r_this.total,"current":r_this.current,"overLimit": r_this.overLimit}, 0.5);
                            }else {
                                if (!overret.msg) {
                                    overret.msg = '请求错误，未知错误'
                                }
                                notification.error({
                                    message: overret.msg,
                                    title: '通知'
                                })
                            }
                        });
                    }
                    storage.setItem(this.vmName+"-total", {"total":this.total,"current":this.current,"overLimit": this.overLimit}, 0.5);
                // }
                
                
            } else {
                if (!ret.msg) {
                    ret.msg = '请求错误，未知错误'
                }
                notification.warn({
                    message: ret.msg,
                    title: '温馨提示'
                })

                this.current = 0
                this.total = 0
                this.datas = []
                this.isLoading = false
            }
        })
    }

    getCurrent(current) {
        this.current = current
        this.chageCurrent(Number(this.current) - 1)
    }

    chageCurrent(page) {
        if (this.componentsVm) {
            setTimeout(() => {
                this.componentsVm.fromsearch(page)
            }, 50)
        }
    }

    onReadycheck(e) {
        this.checkVM = e.vmodel
    }

    isclose() {
        this.componentsVm.fromsearch(this.current - 1)
    }
}