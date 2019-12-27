import './zfsypsjglpt-zfda-sgcl-search-jycx'
import './zfsypsjglpt-zfda-sgcl-list-jycx'
import './zfsypsjglpt-zfda-checks'
import { 
    mixins
} from './zfsypsjglpt-zfda-mix'
import {
    isTableSearch
} from '/services/configService';
require('./zfsypsjglpt-zfda-jycx_jiaojing.css');
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
        // $(".common-layout").css({
        //     "min-width": "1200px",
        //     // "min-height": "1098px"
        // });
    },
    onReadyVm(e) {
        componentsVm = e.vmodel
        this.componentsVm = e.vmodel
        this.onReady()
    }
}

export const name = "zfsypsjglpt-zfda-jycx_jiaojing"

let myMixin = new mixins('/gmvcs/audio/violation/find/pageable', '/gmvcs/audio/violation/count', 'zfsypsjglpt-zfda-jycx_jiaojing')

avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-jycx_jiaojing.html"),
    defaults: avalon.mix({}, onReadyVm, myMixin)
})