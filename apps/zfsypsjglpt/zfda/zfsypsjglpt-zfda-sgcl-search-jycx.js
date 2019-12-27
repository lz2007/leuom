/*
 * @Author: gosuncn.liangzhu 
 * @Date: 2018-05-02 09:53:19 
 * @Last Modified by: mikey.xuanyanqing
 * @Last Modified time: 2019-10-22 16:31:38
 */
import {
    createForm,
    notification
} from 'ane'
import Sbzygl from '/apps/common/common-sbzygl'
import moment from 'moment'
import {
    includedStatus,
    apiUrl
} from '/services/configService';
import './zfsypsjglpt-zfda-sgcl-search.css'
import * as menuServer from '/services/menuService';
let language_txt = require('../../../vendor/language').language;
let vm = null,
    sbzygl = null;
let search_condition = {};
avalon.component('ms-sgcl-search-jycx', {
    template: __inline('./zfsypsjglpt-zfda-sgcl-search-jycx.html'),
    defaults: {
        zfda:language_txt.zfsypsjglpt.zfda,
        authority: {
            "SEARCH": false,
            "EXPORT": false // 导出
        },
        onReady() {
            $(".jtwf-container").css({
                "width": "100%",
                "position": "static"
                // "min-height": "1098px"
            });
        },
        onInit(event) {
            if (!$.isEmptyObject(search_condition)) {
                this.isSearch = true;
            }
            vm = event.vmodel
            sbzygl = new Sbzygl(vm)
            window.sessionStorage.setItem('zfdajycxtree', '')
            this.time_Change(1)
            
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JTWF/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询等按钮都无权限时页面留白
                    $(".jtwf-container .ajgl-tabCont").css("top", "90px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JTWF_JYCX_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_JTWF_JYCX_EXPORT":
                            _this.authority.EXPORT = true;
                            break;
                    }
                });
                // 防止查询等按钮无权限时页面留白
                if (!_this.authority.SEARCH)
                    $(".jtwf-container .ajgl-tabCont").css("top", "90px");
            });
        },
        includeChild: includedStatus,
        clickincludeChild(e) {
            this.includeChild = e;
        },
        orgData: [],
        orgId: '',
        orgCode: '',
        orgPath: '',
        orgName: '',
        dataJson: {
            orgId: '',
            orgName: '',
            orgPath: ''
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
            // console.log(typeof(search_condition.wfEndTime));
            if(typeof(search_condition.wfEndTime) !== 'number') {
                //当search_condition有值时且没有再点击查询按钮时，日期格式已在上一次点击导出时转换，是正确的，不用再格式化数据！！
                avalon.each(Object.keys(search_condition), (i, el) => {
                    search_condition[el] = trim(search_condition[el])
                })

                let seachParams = {}

                seachParams = JSON.parse(JSON.stringify(search_condition))
                seachParams.wfStartTime += ' 00:00:00'
                seachParams.wfStartTime = new Date(seachParams.wfStartTime.replace(/-/g, '/')).getTime()
                seachParams.wfEndTime += ' 23:59:59'
                seachParams.wfEndTime = new Date(seachParams.wfEndTime.replace(/-/g, '/')).getTime()

                if (seachParams.wfStartTime > seachParams.wfEndTime) {
                    notification.error({
                        message: '开始时间不能大于结束时间',
                        title: '温馨提示'
                    })
                    return
                }
                
                search_condition = seachParams;
            }
            // console.log(search_condition);
            // console.log(typeof(search_condition.wfEndTime));
            let orgCode = search_condition.orgCode || "";
            let url = `//${window.location.host}${apiUrl}/gmvcs/audio/violation/export?orgCode=${orgCode}&orgPath=${search_condition.orgPath}&includeChild=${search_condition.includeChild}&wfStartTime=${search_condition.wfStartTime}&wfEndTime=${search_condition.wfEndTime}&glmt=${search_condition.glmt}&userCode=${search_condition.userCode}&dsr=${search_condition.dsr}&jszh=${search_condition.jszh}&wfdz=${search_condition.wfdz}&jdsbh=${search_condition.jdsbh}&hphm=${search_condition.hphm}`;
            window.open(url, "_blank");
        },
        //获取部门树
        fetchOrgData(callback) {
            return new Promise((resolve, reject) => {
                let zfdajycxtree = window.sessionStorage.getItem('zfdajycxtree')

                sbzygl.fetchOrgData(this.orgData, (orgData) => {
                    this.orgData = orgData
                    if (orgData.length > 0) {
                        if (zfdajycxtree) {
                            zfdajycxtree = JSON.parse(zfdajycxtree)
                            this.dataJson.orgId = zfdajycxtree.orgId
                            this.dataJson.orgName = zfdajycxtree.orgName
                            this.dataJson.orgPath = zfdajycxtree.orgPath
                        } else {
                            this.orgId = orgData[0].key
                            this.orgCode = orgData[0].code
                            this.orgPath = orgData[0].path
                            this.orgName = orgData[0].title
                        }
                    }
                    avalon.isFunction(callback) && callback()
                    resolve(true)
                })
            })
        },
        getSelected(key, title) {
            this.orgId = key;
            this.orgName = title;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code
            this.orgPath = e.node.path
            this.orgName = e.node.title
            let dataJson = {
                orgId: e.node.code,
                orgName: e.node.title,
                orgPath: e.node.path
            }
            window.sessionStorage.setItem('zfdajycxtree', JSON.stringify(dataJson))
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey)
        },
        wfStartTime: '',
        wfEndTime: '',
        isDuration: false,
        timeMode: [1],
        glmt: '99',
        time_Change(e) {
            this.timeMode[0] = e.target ? e.target.value : e
            switch (this.timeMode[0]) {
                case 2:
                    this.wfStartTime = moment().startOf('month').format('YYYY-MM-DD')
                    this.wfEndTime = moment().endOf('month').format('YYYY-MM-DD')
                    this.isDuration = false
                    break
                case 3:
                    this.wfStartTime = moment().subtract(3, 'months').format('YYYY-MM-DD')
                    this.wfEndTime = moment().format('YYYY-MM-DD')
                    this.isDuration = true
                    break
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.wfStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD')
                    this.wfEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD')
                    this.isDuration = false
            }
        },
        json: {},
        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function (fields, record) {
                if (vm) {
                    if (record.glmt && avalon.type(record.glmt) == 'array') {
                        record.glmt = record.glmt.join('')
                    }
                    vm.userCode = record.userCode ? record.userCode : ''
                    vm.dsr = record.dsr ? record.dsr : ''
                    vm.jszh = record.jszh ? record.jszh : ''
                    vm.hphm = record.hphm ? record.hphm : ''
                    vm.wfdz = record.wfdz ? record.wfdz : ''
                    vm.jdsbh = record.jdsbh ? record.jdsbh : ''
                    vm.json = record
                }
            }
        }),
        fromsearch(page) {
            if (avalon.isObject(page)) {
                page = 0
            }
            let data = {}
            data.orgPath = this.orgPath
            data.includeChild = this.includeChild
            avalon.mix(data, this.json)
            //处理特殊字符
            $.each(data, function (key, val) {
                if(key!="orgPath") {
                    //排除对部门路径的处理
                    data[key] = String(val).replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');
                }
            });
            // console.log(data);
            this.isSearch = true;
            search_condition = data;
            this.searchfn(data, 'jycx', page)
        },
        searchfn: avalon.noop,
        userCode: '',
        dsr: '',
        jszh: '',
        hphm: '',
        wfdz: '',
        jdsbh: '',
        input_focus(e) {
            avalon(e.target.nextSibling).css('display', 'inline-block')
        },
        input_blur(e) {
            avalon(e.target.nextSibling).css('display', 'none')
        },
        enter_click(e) {
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            if (e.keyCode == "13") {
                // table.fetch(true);
            }
        }
    }
})

function trim(str) {
    if (str.replace) {
        return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '')
    }
    return str
}