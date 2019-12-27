import './zfsypsjglpt-zfda-sgcl-search-fcfxc'
import './zfsypsjglpt-zfda-sgcl-list-fcfxc'
import './zfsypsjglpt-zfda-checks'
import {
    mixins
} from './zfsypsjglpt-zfda-mix'
let myMixin = new mixins('/gmvcs/audio/surveil/find/pageable', '/gmvcs/audio/surveil/count', 'zfsypsjglpt-zfda-fxccf_jiaojing')
import {
    isTableSearch
} from '/services/configService';
require('./zfsypsjglpt-zfda-fxccf_jiaojing.css');
let componentsVm = null
let onReadyVm = {
    onReady() {
        let isYWGJ = sessionStorage.getItem("isYWGJ");
        if(isYWGJ){//判断是否为业务告警页面跳转，是则二次hash跳转以达到选定第二第三级菜单。
            avalon.history.setHash('/zfsypsjglpt-zfda-ajgl-detail_gongan');
        }
        this.componentsVm = componentsVm
        if (this.componentsVm) {
            this.componentsVm.fetchOrgData()
                .then(() => {
                    isTableSearch && this.chageCurrent(0)
                })
        }
    },
    onReadyVm(e) {
        componentsVm = e.vmodel
        this.componentsVm = e.vmodel
        this.onReady()
    }
}
export const name = "zfsypsjglpt-zfda-fxccf_jiaojing"

avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-fxccf_jiaojing.html"),
    defaults: avalon.mix({}, onReadyVm, myMixin)
})