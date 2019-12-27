import {
    notification
} from 'ane'
import {
    store
} from './zfsypsjglpt-zfda-jtwf-store'

import ajax from '/services/ajaxService'
import './zfsypsjglpt-zfda-sgcl-search'
import './zfsypsjglpt-zfda-sgcl-list'
import './zfsypsjglpt-zfda-checks'
import './zfsypsjglpt-zfda-sgcl_jiaojing.css'
import * as menuServer from '/services/menuService';
export const name = 'zfsypsjglpt-zfda-sgcl_jiaojing'
let language_txt = require('../../../vendor/language').language;
let sgclVm = ''
import {
    isTableSearch,
    apiUrl
} from '/services/configService';
let storage = require('/services/storageService.js').ret;
let search_condition = {};
function trim(str) {
    if (str.replace) {
        return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
    }
    return str
}
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-sgcl_jiaojing.html'),
    defaults: {
        zfda:language_txt.zfsypsjglpt.zfda,
        authority: {
            "EXPORT": false // 导出
        },
        onInit() {
            let isYWGJ = sessionStorage.getItem("isYWGJ");
            if(isYWGJ){//判断是否为业务告警页面跳转，是则二次hash跳转以达到选定第二第三级菜单。
                avalon.history.setHash('/zfsypsjglpt-zfda-ajgl-detail_gongan');
            }
            if (!$.isEmptyObject(search_condition)) {
                this.isSearch = true;
            }
            // 定义一个监听的方法
            let listener = () => {
                // 监听查看页面状态
                this.pageck = store.getState().isCheck
            }

            // 创建一个监听
            store.subscribe(listener)
            // 设置默认值
            store.dispatch({
                type: "closecheck"
            })

            // enter 事件
            $(window).on('keydown', (e) => {
                if (e.keyCode === 13 || e.code === 'Enter') {
                    if (this.pageck) {
                        if (this.checkVM.toggleShowTJGL) {
                            this.checkVM.searchonChange()
                        }
                    } else {
                        sgclVm.fromsearch(this.current - 1)
                    }
                }
            })

            setTimeout(() => {
                if (sgclVm) {
                    sgclVm.fetchOrgData().then(() => {
                        isTableSearch && this.chageCurrent(0)
                    })
                }
            }, 50)
            if(storage.getItem('zfsypsjglpt-zfda-sgcl-total')) {//页面切换回来后设置原先的page组件数据
                this.total = storage.getItem('zfsypsjglpt-zfda-sgcl-total').total;
                this.current = storage.getItem('zfsypsjglpt-zfda-sgcl-total').current;
                this.overLimit = storage.getItem('zfsypsjglpt-zfda-sgcl-total').overLimit;
            }
             // 查看、查询按钮权限控制
             let _this = this;
             menuServer.menu.then(menu => {
                 let list = menu.AUDIO_MENU_SYPSJGL;
                 let func_list = [];
                 avalon.each(list, function (index, el) {
                     if (/^AUDIO_FUNCTION_ZFDA_SGCL_/.test(el))
                         avalon.Array.ensure(func_list, el);
                 });
                 avalon.each(func_list, function (k, v) {
                     switch (v) {
                         case "AUDIO_FUNCTION_ZFDA_SGCL_EXPORT":
                             _this.authority.EXPORT = true;
                             break; 
                     }
                 });
             });

        },
        onDispose() {
            $(window).off('keydown')
        },
        pageck: false,
        isLoading: false,
        datas: [],
        // 是否关闭查看页面
        isclose() {
            sgclVm.fromsearch(this.current - 1)
        },
        onReadyVm: function (ev) {
            //简易程序组件vm可以访问组件里定义过的属性 
            sgclVm = ev.vmodel
        },
        checkVM: '',
        onReadycheck(ev) {
            this.checkVM = ev.vmodel
        },
        // 切换页面
        chageCurrent(page) {
            sgclVm.fromsearch(page)
        },
        overLimit: false,
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

            let url = ''
            let seachParams = {}

            seachParams = JSON.parse(JSON.stringify(data))

            seachParams.sgStartTime += ' 00:00:00'
            seachParams.sgStartTime = new Date(seachParams.sgStartTime.replace(/-/g, '/')).getTime()

            seachParams.sgEndTime += ' 23:59:59'
            seachParams.sgEndTime = new Date(seachParams.sgEndTime.replace(/-/g, '/')).getTime()

            seachParams.clStartTime += ' 00:00:00'
            seachParams.clStartTime = new Date(seachParams.clStartTime.replace(/-/g, '/')).getTime()

            seachParams.clEndTime += ' 23:59:59'
            seachParams.clEndTime = new Date(seachParams.clEndTime.replace(/-/g, '/')).getTime()

            if (seachParams.sgStartTime > seachParams.sgEndTime || seachParams.clStartTime > seachParams.clEndTime) {
                notification.error({
                    message: '开始时间不能大于结束时间',
                    title: '温馨提示'
                })
                this.isLoading = false
                search_condition = seachParams;
                return
            }

            //测试部门 需要删除
            // seachParams.orgPath = '/0/'

            avalon.mix(seachParams, pageConfig)

            // console.log(seachParams);
            this.isSearch = true;
            search_condition = seachParams;

            url = '/gmvcs/audio/accident/find/pageable'

            ajax({
                url: url,
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
                                url: '/gmvcs/audio/accident/count',
                                method: 'post',
                                data: seachParams,
                                cache: false
                            }).then(overret => {
                                if (overret.code === 0) {
                                    r_this.overLimit = false;
                                    r_this.total = overret.data.totalElements;
                                    storage.setItem('zfsypsjglpt-zfda-sgcl-total', {"total":r_this.total,"current":r_this.current,"overLimit": r_this.overLimit}, 0.5);
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
                        storage.setItem('zfsypsjglpt-zfda-sgcl-total', {"total":this.total,"current":this.current,"overLimit": this.overLimit}, 0.5);
                    // }
                } else {
                    if (ret.msg) {
                        notification.error({
                            message: ret.msg,
                            title: '温馨提示'
                        })
                    }

                    this.current = 0
                    this.total = 0
                    this.datas = []
                    this.isLoading = false
                }
            })
        },
        total: 0,
        current: 1,
        pageSize: 20,
        getCurrent(current) {
            this.current = current
            this.chageCurrent(Number(this.current) - 1)
        },
        // 导出按钮
        isSearch: false,
        exportBtn() {
            // console.log('exportBtn');
            if (!this.isSearch) {
                return;
            }
            // if ($.isEmptyObject(search_condition)) {
            //     notification.warn({
            //         message: '请先查询数据！',
            //         title: '温馨提示'
            //     })
            //     return;
            // }
            // console.log(search_condition.sgStartTime > search_condition.sgEndTime, search_condition.clStartTime > search_condition.clEndTime);
            if (search_condition.sgStartTime > search_condition.sgEndTime || search_condition.clStartTime > search_condition.clEndTime) {
                // console.log('over limit');
                notification.error({
                    message: '开始时间不能大于结束时间',
                    title: '温馨提示'
                })
                return
            }
            // console.log(search_condition);
            let orgCode = search_condition.orgCode || "";
            let url = `//${window.location.host}${apiUrl}/gmvcs/audio/accident/export?orgCode=${orgCode}&orgPath=${search_condition.orgPath}&includeChild=${search_condition.includeChild}&glmt=${search_condition.glmt}&userCode=${search_condition.userCode}&sgdd=${search_condition.sgdd}&sgbh=${search_condition.sgbh}&hphm=${search_condition.hphm}&sgStartTime=${search_condition.sgStartTime}&sgEndTime=${search_condition.sgEndTime}&clStartTime=${search_condition.clStartTime}&clEndTime=${search_condition.clEndTime}`;
            window.open(url, "_blank");
        },
    }
})