/*
 * @Author: linzhanhong 
 * @Date: 2018-12-27 11:00:22 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2019-01-04 09:48:45
 */

import moment from 'moment';
import { createForm, notification } from 'ane';
import * as menuServer from '/services/menuService';
import ajax from '/services/ajaxService';
const storage = require('/services/storageService.js').ret;
require('/apps/common/common-pieChart.js');
let {
    includedStatus
} = require('/services/configService');

export const name = 'jdzxpt-kphczl-ccqk';

export class KphczlModel {
    constructor(type) {
        this.type = type;
        this.enableQuery = true;
        this.queryTimer = null;
        this.$form = createForm();
        this.orgData = [];
        this.orgCode = "";
        this.orgId = ""; 
        this.orgPath = "";
        this.orgName = "";        
        this.included_status = includedStatus, //true 包含子部门；false 不包含子部门
        this.isDuration =  false;
        this.timeMode = 1;
        this.beginTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
        this.endTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
        this.dataStr = "";
        this.dataJson = {};
        this.echartData = [];
        this.loading = true;
        this.authority = {
            SEARCH: false
        }
    }

    getSelected(key, title) {
        this.orgId = key;
    }
    handleTreeChange(e, selectedKeys) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
    }
    extraExpandHandle(treeId, treeNode, selectedKey) {
        this.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    }
    clickBranchBack(e) {
        this.included_status = e;
    }
    // 时间选择器
    handleTimeChange(e) {
        this.timeMode = e.target.value;
        switch (e.target.value) {
            case 2:
                this.beginTime = moment().startOf('month').format('YYYY-MM-DD');
                this.endTime = moment().endOf('month').format('YYYY-MM-DD');
                this.isDuration = false;
                break;
            case 3:
                this.beginTime = moment().subtract(3, 'months').format('YYYY-MM-DD');
                this.endTime = moment().format('YYYY-MM-DD');
                this.isDuration = true;
                break;
            default:
                //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                this.beginTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                this.endTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                this.isDuration = false;
        }
    }

    onInit() {
        let _this = this;
        // 按钮权限控制
        menuServer.menu.then(menu => {
            let list = menu.JDZX_FUNC_JDZXXT;
            let func_list = [];
            avalon.each(list, function (index, el) {
                if (/^EVA_FUNCTION_JDKP_KPHCZL/.test(el))
                    avalon.Array.ensure(func_list, el);
            });

            let licMap = {
                'jdzxpt-kphczl-ccqk': { // 抽查情况
                    'SEARCH': 'EVA_FUNCTION_JDKP_KPHCZL_CCQK_SEARCH'
                },
                'jdzxpt-kphczl-hcqk': { // 核查情况
                    'SEARCH': 'EVA_FUNCTION_JDKP_KPHCZL_HCQK_SEARCH'
                }
            }

            avalon.each(func_list, function (k, v) {
                switch (v) {
                    case licMap[_this.type].SEARCH:
                        _this.authority.SEARCH = true;
                        break;
                }
            });
        });
        this.$watch('dataJson', (v) => {
            if (v) {
                this.beginTime = v.beginTime ? moment(v.beginTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                this.endTime = v.endTime ? moment(v.endTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                this.timeMode = v.timeMode;
                this.isDuration = v.timeMode === 3;
                this.included_status = v.includeChild;
            }
        });
        this.$watch('loading', (v) => {
            v ? $('.common-layout').removeClass('min-height-class-mix') : $('.common-layout').addClass('min-height-class-mix');
        })
    }
    onReady() {
        this.dataStr = JSON.stringify(storage.getItem(this.type));
        this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
        this.fetchOrgData(() => {
            // let timer = setInterval(() => {
            //     //保证查询条件到位后再fetchList
            //     let recordStr = JSON.stringify(this.$form.record);
            //     let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
            //     //等到this.$form.record不为{}，而有具体内容时再fetch，否则ie8下有问题
            //     if(length >= 2) {
                    this.query();
            //         clearInterval(timer);
            //     }
            // }, 100);
        });
    }
    onDispose() {
        clearTimeout(this.queryTimer);
        $('.common-layout').removeClass('min-height-class-mix');
    }

    // 查询
    query() {
        if (this.enableQuery) {
            this.fetchList();
            this.enableQuery = false;
            this.queryTimer = setTimeout(() => {
                this.enableQuery = true;
            }, 1000)
        }
    }
    // 获取数据
    fetchList() {
        let data = {
            beginTime: this.$form.record.beginTime,
            endTime: this.$form.record.endTime,
            includeChild: this.included_status,
            orgId: this.orgId || null,
            orgPath: this.orgPath || null
        };
        data.beginTime = this.isDuration ? (data.beginTime ? moment(data.beginTime).format('X') * 1000 : null) : (this.beginTime ? moment(this.beginTime).format('X') * 1000 : null);
        data.endTime = this.isDuration ? (data.endTime ? moment(data.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null) : (this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null);
        if (!data.beginTime && !data.endTime) {
            this.showTips('warning', '请选择开始时间与结束时间！');
            return;
        }
        if (!data.beginTime && data.endTime) {
            this.showTips('warning', '请选择开始时间！');
            return;
        }
        if (data.beginTime && !data.endTime) {
            this.showTips('warning', '请选择结束时间！');
            return;
        }
        if (data.beginTime && data.endTime && data.beginTime >= data.endTime) {
            this.showTips('warning', '开始时间不能大于结束时间！');
            return;
        }
        let url = this.type == 'jdzxpt-kphczl-ccqk' ? '/gmvcs/stat/l/eva/spotcheck/info' : '/gmvcs/stat/l/eva/reviewcheck/info';
        let storageData = data;
        storageData.timeMode = this.timeMode;
        storageData.orgName = this.orgName;
        this.dataStr = JSON.stringify(storageData);
        storage.setItem(this.type, storageData, 0.5);

        this.loading = true;
        
        this.Ajax(url, 'post', data).then((result) => {
            this.loading = false;
            if(result.code == 0) {
                this.echartData.clear();
                let isFirstTab = this.type == 'jdzxpt-kphczl-ccqk';
                let list = [
                    {key: 'total', val: isFirstTab ? '业务总数' : '抽查总数'},
                    {key: 'violation', val: '简易程序'},
                    {key: 'surveil', val: '非现场处罚'},
                    {key: 'force', val: '强制措施'},
                    {key: 'accident', val: '事故处理'},
                    {key: 'police', val: '警情'}, 
                    {key: 'case', val: '案件'}
                ];
                let data = result.data;
                let echartData = [];
                avalon.each(list, (index, value) => {
                    let item = {};
                    item.leftInfo = [];
                    item.data = {
                        title: value.val,
                        dataName: isFirstTab ? ['通过', '未通过', '未考评'] : ['属实', '不属实', '未核查'],
                        total: isFirstTab ? data[`${value.key}Num`] : data[`${value.key}CheckNum`],
                        pass: isFirstTab ? data[`${value.key}PassNum`] : data[`${value.key}ReviewTrueNum`],
                        unPass: isFirstTab ? data[`${value.key}UnPassNum`] : data[`${value.key}ReviewFalseNum`],
                        unCheck: isFirstTab ? data[`${value.key}UnCheckNum`] : data[`${value.key}UnReviewNum`],
                    }
                    let rate = isFirstTab ? data[`${value.key}PassRate`] : data[`${value.key}ReviewTrueRate`];
                    item.leftInfo = [
                        {title: isFirstTab ? '抽查数' : '核查数', val: isFirstTab ? data[`${value.key}CheckNum`] : data[`${value.key}ReviewNum`]},
                        {title: isFirstTab ? '通过数' : '属实数', val: isFirstTab ? data[`${value.key}PassNum`] :data[`${value.key}ReviewTrueNum`] },
                        {title: isFirstTab ? '通过率' : '属实率', val: rate == '-' ? rate : (Number(rate) * 100).toFixed(2) + '%'},
                    ];
                    echartData.push(item);
                });
                this.echartData = echartData;
            }
        });
    }

    //获取部门树
    fetchOrgData(callback) {
        this.fetchOrgDataFn(this.orgData, (orgData) => {
            this.orgData = orgData
            if (orgData.length > 0) {
                this.orgId = this.dataJson ? this.dataJson.orgId : orgData[0].key;
                this.orgCode = this.dataJson ? this.dataJson.orgCode : orgData[0].code;
                this.orgPath = this.dataJson ? this.dataJson.orgPath : orgData[0].path;
                this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
            }
            avalon.isFunction(callback) && callback();
        });
    }

    /**
     * 显示提示消息
     * @param {*} type 
     * @param {*} content 
     * @param {*} layout 
     */
    showTips(type, content, layout, duration) {
        notification[type]({
            title: "温馨提示",
            message: content,
            layout: layout || 'topRight',
            timeout: duration || 1500
        });
    }

    //获取所属部门
    fetchOrgDataFn(orgData, callback) {
        let url = '/gmvcs/uap/org/find/fakeroot/mgr';
        this.Ajax(url).then(result => {
            if (result.code !== 0) {
                this.showTips('error', '部门信息获取失败！');
                return;
            }
            orgData = this.handleRemoteTreeData(result.data);
            avalon.isFunction(callback) && callback(orgData);
        }).fail((err) => {
            this.vm.loading = false;
            this.vm.isNull = true;
        });
    }
    //逐级加载部门树
    fetchOrgWhenExpand(treeId, treeNode, selectedKey) {
        let url = '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType
        this.Ajax(url).then((result) => {
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            if (result.code == 0) {
                treeObj.addNodes(treeNode, this.handleRemoteTreeData(result.data));
            }
            if (selectedKey != treeNode.key) {
                let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                treeObj.selectNode(node);
            }
        });
    }
    /**
     * 处理远程部门树的数据
     * @param {array} remoteData  远程请求得到的数据
     */
    handleRemoteTreeData(remoteData) {
        if (!remoteData) {
            return;
        }
        let handledData = [];
        avalon.each(remoteData, (index, el) => {
            let item = {
                key: el.orgId,
                title: el.orgName,
                code: el.orgCode,
                path: el.path,
                checkType: el.checkType,
                children: el.childs,
                isParent: true,
                icon: "/static/image/tyywglpt/org.png"
            };
            handledData.push(item);
            this.handleRemoteTreeData(el.childs)
        });
        return handledData;
    }
    /**
     * 发送ajax请求，默认为get请求
     * @param {*} url 
     * @param {*} method 
     * @param {*} data 
     */
    Ajax(url, method, data) {
        return ajax({
            url: url,
            method: method || 'get',
            data: data,
            cache: false
        });
    }
}


