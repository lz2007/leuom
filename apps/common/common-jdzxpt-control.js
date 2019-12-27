/*
 * @Author: linzhanhong 
 * @Date: 2019-03-19 09:17:20 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2019-03-19 12:31:36
 */

import moment from 'moment';
import { store } from '/apps/common/common-store.js';

export class JdzxptControl {
    constructor(vm) {
        this.vm = vm;
    }
    get data() {
        return this.getPassStore('kphczlData');
    }
    get type() {
        return this.data.hash;
    }
    // 获取store状态
    getPassStore(key) {
        let currentValue = store.getState();
        return currentValue[key];
    }
    // 注销数据
    releaseData() {
        store.dispatch({
            type: "jdzxpt-kphczl-data",
            data: {}
        });
    }
    // 页面加载初始化
    pageSetInit(treeVm, timeVm) {
        if($.isEmptyObject(this.data))
            return;
        this.orgTreeInit(treeVm);
        this.timeOptionInit(timeVm);
        this.kpjgOptionInit();
        this.hcjgOptionInit();
        this.glmeOptionInit();
    }
    // 部门树初始化
    orgTreeInit(vm) {
        vm.tree_code = this.data.orgPath;
        vm.tree_key = this.data.orgId;
        vm.tree_title = this.data.orgName;
        this.vm.included_status = this.data.includeChild;
    }
    // 考評結果初始化
    kpjgOptionInit() {
        Object.getOwnPropertyNames(this.vm).forEach((val, idx, array) => {
            let optionObj;
            if(/_kpjg$/g.test(val)) {
                optionObj = this.vm[val];
                if(this.type === 'jdzxpt-kphczl-ccqk') {
                    avalon.each(optionObj.evaResult_options, (key, val) => {
                        if(val.label === this.data.name) {
                            optionObj.evaResult = [val.value];
                        }
                    });
                } else {
                    optionObj.evaResult = ['ALL'];
                }
            }
        });
    }
    // 核查结果初始化
    hcjgOptionInit() {
        Object.getOwnPropertyNames(this.vm).forEach((val, idx, array) => {
            let optionObj;
            if(/_hcjg$/g.test(val)) {
                optionObj = this.vm[val];
                if(this.type !== 'jdzxpt-kphczl-ccqk') {
                    avalon.each(optionObj.reviewResult_options, (key, val) => {
                        if(val.label === this.data.name) {
                            optionObj.reviewResult = [val.value];
                        }
                    });
                } else {
                    optionObj.reviewResult = ['ALL'];
                }
            }
        });
    }
    // 时间范围初始化
    timeOptionInit({optionVm, startTimeVm, endTimeVm}) {
        optionVm.range_flag = Number(this.data.timeMode) - 1;
        // 保存时间选择框选中项
        if (optionVm.range_flag == 2) {  // 自定义时间
            optionVm.select_time = true;
            optionVm.time_range = ["2"];
        } else if (optionVm.range_flag !== 2) {  // 本周或本月
            optionVm.select_time = false;
            optionVm.time_range = [optionVm.range_flag.toString()];
        }
        let mergeVm = $.extend({}, startTimeVm, endTimeVm);
        Object.getOwnPropertyNames(mergeVm).forEach((val, idx, array) => {
            if(/startTime$/g.test(val)) {
                startTimeVm[val] = moment(this.data.beginTime).format("YYYY-MM-DD");
            }
            if(/endTime$/g.test(val)) {
                endTimeVm[val] = moment(this.data.endTime).format("YYYY-MM-DD");
            }
        });
    }
    // 关联媒体初始化
    glmeOptionInit() {
        Object.getOwnPropertyNames(this.vm).forEach((val, idx, array) => {
            let optionObj;
            if(/_glmt$/g.test(val)) {
                optionObj = this.vm[val];
                optionObj.glmt = ['99'];
            }
        });
    }
}