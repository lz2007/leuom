import {
    createForm,
    message
} from 'ane';

import ajax from '/services/ajaxService';
import * as menuServer from '/services/menuService';
import 'bootstrap';
import {
    Gm
} from '/apps/common/common-tools.js';

import {
    copyRight,
    telephone
} from '/services/configService';

require('./zfsypsjglpt-zfda-jqgl_gongan.css');
require('./zfsypsjglpt-jdkp-kpcczl-ck-jycxkp.css');
export const name = 'zfsypsjglpt-jdkp-kpcczl-ck-jycxkp';

let jqglMan = null;
let jqgl_last = null;
//定义通用工具
function Tools() {
    this.handleTreeLeaf = function (curData) {
        curData.icon = '/static/image/zfsypsjglpt/users.png';
        curData.key = curData.orgId;
        curData.isParent = true;
        curData.name = curData.orgName;
        curData.title = curData.orgName;
        curData.children = curData.childs || [];
        curData.parent = curData.parent || '';
    };
    this.getTree = function () {
        ajax({
            url: '/gmvcs/uap/org/find/fakeroot/mgr',
            method: 'get',
            data: {},
            cache: false
        }).then(ret => {

            if (!(ret.code == 0)) {
                Gm_tool.sayError('获取部门数据失败');
                return;
            };
            jqglMan.searchForm_zqbm.rdata = Gm_tool.addIcon(ret.data, (curData) => {

                //遍历中处理节点的操作
                Gm_tool.handleTreeLeaf(curData);
            });
            jqglMan.searchForm_zqbm.expandedKeys = [ret.data[0].orgId];

            var jqgl_form_data = Gm_tool.getStorage('zfsypsjglpt-jdkp-kpcczl-ck-jycxkp');
            jqglMan.searchForm_zqbm.checkedKeys = jqgl_form_data ? jqgl_form_data.zqbm : (ret.data ? ret.data[0].orgId : '');
            jqglMan.searchForm_zqbm.zqbm = jqgl_form_data ? jqgl_form_data.zqbm : ret.data[0].orgId;
            jqglMan.searchForm_zqbm.checkType = ret.data[0].checkType;
            jqglMan.$searchForm.record.orgPath = jqgl_form_data ? jqgl_form_data.orgPath : ret.data[0].path;
            jqglMan.fetch(true, true);

            //执行用户自定义操作          
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + jqglMan.searchForm_zqbm.checkedKeys + '&checkType=' + jqglMan.searchForm_zqbm.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {
                        var $tree_target = $.fn.zTree.getZTreeObj($('#jycxkp_tree .ztree').attr('id'));
                        var node = $tree_target.getNodesByParam('key', jqglMan.searchForm_zqbm.checkedKeys, null)[0];
                        $tree_target.addNodes(node, Gm_tool.addIcon(ret.data, (curData) => {
                            Gm_tool.handleTreeLeaf(curData);
                        }));
                        $tree_target = null;
                        node = null;
                    } else {
                        this.sayError('请求下级部门数据失败');
                    }
                } else {
                    this.sayError('请求下级部门数据失败');
                }
            });
        });
    };
    this.clearForm = function () {
        jqglMan.$searchForm.record = jqgl_initialData();
    };
    this.dealTableWithoutData = function (page) {
        jqglMan.$cache[page] = [];
        jqglMan.pagination.total = jqglMan.flag == 0 ? jqglMan.pagination.total : 　0;
        jqglMan.remoteList = [];
        jqglMan.loading = false;
        tableObject.loading(false);
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
        return;
    }
};

function Format() {};

function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools();
let Gm_format = new Format();
let Gm_reg = new Reg();
Gm_reg.illegal_wfdd = /[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-kpcczl-ck-jycxkp.html'),
    defaults: {

        // 版权信息
        copyRight: copyRight,
        telephone: telephone,

        //返回
        all_back() {
            avalon.history.setHash('/zfsypsjglpt-jdkp-jycx_jiaojing');
        },

        //查询表单: 所有字段在record中
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () {

            },
            record: jqgl_initialData()
        }),

        //点击查询
        jqgl_search() {
            jqglMan.fetch(true);
        },

        //关联媒体，考评状态，考评结果，核查状态，核查结果
        jycxkp_glmt: avalon.define({
            $id: 'jycxkp_glmt',
            glmt: ['-'],
            jycxkp_glmt_Change(e, a) {
                jqglMan.$searchForm.record.glmt = this.glmt[0] = e.target.value;
            }
        }),
        jycxkp_kpzt: avalon.define({
            $id: 'jycxkp_kpzt',
            kpzt: ['-'],
            jycxkp_kpzt_Change(e, a) {
                jqglMan.$searchForm.record.evaStatus = this.kpzt[0] = e.target.value;
            }
        }),
        jycxkp_kpjg: avalon.define({
            $id: 'jycxkp_kpjg',
            kpjg: ['-'],
            jycxkp_kpjg_Change(e, a) {
                jqglMan.$searchForm.record.evaResult = this.kpjg[0] = e.target.value;
            }
        }),
        jycxkp_hczt: avalon.define({
            $id: 'jycxkp_hczt',
            hczt: ['-'],
            jycxkp_hczt_Change(e, a) {
                jqglMan.$searchForm.record.reviewStatus = this.hczt[0] = e.target.value;
            }
        }),
        jycxkp_hcjg: avalon.define({
            $id: 'jycxkp_hcjg',
            hcjg: ['-'],
            jycxkp_hcjg_Change(e, a) {
                jqglMan.$searchForm.record.reviewResult = this.hcjg[0] = e.target.value;
            }
        }),

        //执勤部门
        searchForm_zqbm: avalon.define({
            $id: 'jycxkp_zqbm',
            treeId: 'jycxkp_tree',
            rdata: [],
            checkedKeys: [],
            expandedKeys: [],
            zqbm: [''],
            checkType: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                ({
                    key: jqglMan.$searchForm.record.zqbm,
                    orgName: this.checkedKeys,
                    orgName: this.selectedTitle,
                    checkType: this.checkType
                } = treeNode);
            },
            selectedTitle: ''
        }),

        //违法时间
        dateShow: false,
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        searchForm_bjsj: avalon.define({
            $id: 'jycxkp_wfsj',
            bjsj: ['last-week'],
            callback: {

                //点击选取三种不同类型的时间的回调
                week(ret) {
                    jqglMan.dateShow = false;
                    jqglMan.kssj_isNull = 'none';
                    jqglMan.jssj_isNull = 'none';
                    $('.timeCover_jq .ane-datepicker-input').val('');
                },
                month(ret) {
                    let _this = this;
                    this.week();
                },
                others(ret) {
                    jqglMan.dateShow = true;
                    $('.jycxkp-form').find($("[placeholder = '开始时间']")).val(Gm_format.formatDate(+ret.end, true));
                    $('.jycxkp-form').find($("[placeholder = '结束时间']")).val(Gm_format.formatDate(+ret.now, true));
                }
            },
            calcutor: null, //时间计算器，含三种不同类型的时间算法
            searchForm_bjsj_Change(e, a) {
                this.calcutor.calculate(e.target.value, jqglMan.$searchForm.record, 'wfsjEnd', 'wfsjStart');
            }
        }),

        //enter快捷查询列表
        enter_click(e) {

            if (e.target.name == 'wfdz') {
                $(e.target).val($(e.target).val().replace(Gm_reg.illegal_wfdd, ''));
                this.$searchForm.record['wfdz'] = this.$searchForm.record[e.target.name].replace(Gm_reg.illegal_wfdd, '');
            } else {
                $(e.target).val($(e.target).val().replace(Gm_reg.illegal_word, ''));
                this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(Gm_reg.illegal_word, '');
            }

            if (e.keyCode == "13") {
                jqglMan.fetch(true);
            }
        },

        //开始，结束时间的控件
        topform_start_time: '',
        topform_end_time: '',
        startTimeHandleChange(e) {
            jqglMan.$searchForm.record.wfsjStart = e.target.value ? Number(Gm_format.getTimeByDateStr(e.target.value + ' 00:00:00')) : '';
            jqglMan.kssj_isNull = e.target.value ? 'none' : 'block';
        },
        endTimeHandleChange(e) {
            jqglMan.$searchForm.record.wfsjEnd = e.target.value ? Number(Gm_format.getTimeByDateStr(e.target.value + ' 23:59:59')) : '';
            jqglMan.jssj_isNull = e.target.value ? 'none' : 'block';
        },

        //input控件的叉叉按钮
        jycxkp_close_jszh: false,
        jycxkp_close_jdsbh: false,
        jycxkp_close_wfdz: false,
        jycxkp_close_userCode: false,
        jycxkp_close_dsr: false,
        close_click(e) {
            $('.top-form').find($("[name = " + e + "]")).val('');
            $('.top-form').find($("[name = " + e + "]")).focus();
            jqglMan.$searchForm.record[e] = '';
        },
        input_focus(e) {
            this['jycxkp_close_' + e] = true;
        },
        input_blur(e) {
            this['jycxkp_close_' + e] = false;
        },

        //表单字段输入框组的初始值
        userCode: '', //警员警号
        dsr: '', //当事人
        jszh: '', //驾驶证号
        jdsbh: '', //决定书编号
        wfdz: '', //违法地点

        //权限
        jycxkp_check: avalon.define({
            $id: "jycxkp_check",
            authority: { // 按钮权限标识
                "CHECK": true, //音视频库_执法档案_警情关联_查看
                "SEARCH": true, //音视频库_执法档案_警情关联_查询
                "OPT_SHOW": true //操作栏显示方式
            }
        }),

        //table
        remoteList: [],
        loading: false,
        $cache: {}, //数据缓存对象，缓存着每次请求的当页数据
        $selectOption: [], //勾选表格行保存该行的数据
        pagination: {
            pageSize: 20,
            total: 0,
            current: 0,
            overLimit: false,
        },
        flag: 0,
        getCurrent(current) {
            this.pagination.current = current;
        },
        getPageSize(pageSize) {
            this.pagination.pageSize = pageSize;
        },
        actions(type, text, record, index) {

            if (type == 'checkLook') {
                window.kpcczl_jycxkp = record.wfbh;
                avalon.history.setHash('/zfsypsjglpt-jdkp-jycx-ykp_jiaojing');
            }
        },
        fetch(search, initMark) {

            /*
                search标志为true则通过查询按钮执行分页重置查询,false为点击上下分页查询
                initMark标志为true，代表进入页面初始化查询时通过storage保存的参数来查询，false为实时表单参数
            */
            if (!search) {
                var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1;
                this.ajax_table(initMark);
            } else {
                this.pagination = {
                    pageSize: 20,
                    total: 0,
                    current: 0,
                    overLimit: false,
                };
                this.$cache = [];
                this.loading = false;
                this.remoteList = [];
                this.flag = 1;
                this.ajax_table(initMark);
            }
        },
        ajax_table(initMark) {

            //负责表单的验证，以及参数规则的审查
            tableObject.loading(true);

            var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1,
                seachParams = jqglMan.$searchForm.record;
            seachParams.page = page;
            seachParams.pageSize = this.pagination.pageSize;
            Object.keys(seachParams).forEach((prop) => {
                seachParams[prop] = seachParams[prop].toString().trim();
            });
            this.loading = true;
            seachParams.timeStatus = jqglMan.searchForm_bjsj.calcutor.getStatus();

            //添加默认时间为一周，jqglMan.dateShow -> true:选择了自定义时间
            if (jqglMan.dateShow) {

                //其中有一个时间控件为空未选择时间
                if (+seachParams.wfsjStart == '' || +seachParams.wfsjEnd == '') {
                    jqglMan.kssj_isNull = seachParams.wfsjStart == '' ? 'block' : 'none';
                    jqglMan.jssj_isNull = seachParams.wfsjEnd == '' ? 'block' : 'none';
                    this.loading = false;
                    return;
                } else {

                    //都选择好了时间但是时间规则违法
                    if (+seachParams.wfsjStart >= +seachParams.wfsjEnd) {
                        Gm_tool.sayWarn('开始时间不能超过结束时间');
                        this.loading = false;
                        return;
                    }

                    if (+seachParams.wfsjEnd - +seachParams.wfsjStart > 365 * 86400000) {
                        Gm_tool.sayWarn('时间间隔不能超过一年，请重新设置！');
                        this.loading = false;
                        return;
                    }
                }
            } else {

                //这里提供默认为一周的时间参数
                if (seachParams.wfsjStart == '' && seachParams.wfsjEnd == '') {
                    jqglMan.searchForm_bjsj.calcutor.calculate('last-week', jqglMan.$searchForm.record, 'wfsjEnd', 'wfsjStart');
                }
            };
            var jqgl_form_data = Gm_tool.getStorage('zfsypsjglpt-jdkp-kpcczl-ck-jycxkp');

            if (!(jqgl_form_data == null)) {
                jqgl_last = jqgl_form_data;

                if (initMark) {
                    seachParams = jqgl_form_data;
                    page = jqgl_form_data.page;
                    jqglMan.pagination.current = page + 1;
                }
            }
            this.getTableData(seachParams, page);
        },
        getTableData(seachParams, page) {
            ajax({
                url: '/gmvcs/audio/violation/search/eva',
                // url: '/api/faketable2.json',
                method: 'post',
                data: seachParams,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {
                    Gm_tool.setStorage('zfsypsjglpt-jdkp-kpcczl-ck-jycxkp', jqglMan.$searchForm.record, 0.5, function () {
                        jqglMan.$searchForm.record.page = page;
                        jqglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    });

                    if (!ret.data.currentElements) {
                        Gm_tool.dealTableWithoutData();
                    }

                    if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                        tableObject.loading(false);
                        Gm_tool.dealTableWithoutData();
                    } else {
                        ret.data.currentElements.forEach((i, key) => {

                            //这里处理拿到的数据
                            i.jtwfkpJYJH = i.userName + '(' + i.userCode + ')';
                            i.relation = i.relation ? '是' : '否';
                            i.evaStatus = i.evaStatus ? '已考评' : '未考评';
                            i.reviewStatus = i.reviewStatus ? '已核查' : '未核查';
                            switch (i.evaResult) {
                                case '0':
                                    i.evaResult = '不通过';
                                    break;
                                case '1':
                                    i.evaResult = '通过';
                                    break;
                                default:
                                    i.evaResult = '未考评';
                                    break;
                            };
                            switch (i.reviewResult) {
                                case '0':
                                    i.reviewResult = '不属实';
                                    break;
                                case '1':
                                    i.reviewResult = '属实';
                                    break;
                                default:
                                    i.reviewResult = '未核查';
                                    break;
                            };
                            i.wfsj = Gm_format.formatDate(i.wfsj);
                        });

                        if (this.flag == 1) {
                            this.pagination.current = 1;
                        }
                        this.flag = 0;
                        this.pagination.current = page + 1;
                        this.pagination.overLimit = ret.data.overLimit;
                        this.pagination.total = this.pagination.overLimit ? ret.data.limit * 20 : ret.data.totalElements;

                        ret.data.currentElements.forEach(function (val, key) {
                            val.index = key + (jqglMan.pagination.current - 1) * jqglMan.pagination.pageSize + 1; //手动增加表格行号
                        });
                        this.$cache[page] = this.remoteList = ret.data.currentElements;
                        let pageSize_table = jqglMan.pagination.pageSize;
                        tableObject.page(page + 1, pageSize_table);
                        tableObject.tableDataFnc(this.remoteList);
                        tableObject.loading(false);
                        this.loading = false;
                    }
                } else {
                    message.error({
                        content: '请求数据失败'
                    });
                    this.loading = false;
                }
            }, () => {
                this.loading = false;
            });
        },
        nextPage(e, pagination) {

            if (this.current == 1) {
                $('#jqtbnextPage').attr("disabled", "disabled");
            } else {
                $('#jqtbnextPage').attr("disabled", false);
                ++this.current;
                this.fetch();
            }
        },
        lastPage(e, pagination) {

            if (this.current == this.pagination.total) {
                $('#jqtbnextPage').attr("disabled", "disabled");
            } else {
                $('#jqtbnextPage').attr("disabled", false);
                --this.current;
                this.fetch();
            }
        },
        handleTableChange(pagination) {

            if (this.pagination.hasOwnProperty('current')) {
                this.pagination.current = pagination;
                tableObject.page(pagination, this.pagination.pageSize);
                this.fetch();
            }
        },

        onInit(event) {
            jqglMan = this;

            //初始化时间计算器
            this.searchForm_bjsj.calcutor = Gm_tool.timeCalculator();
            this.searchForm_bjsj.calcutor.setCallBack(this.searchForm_bjsj.callback);

            tableObject = $.tableIndex({ //初始化表格jq插件
                id: 'jycxkp_table',
                tableBody: tableBodyJycxkp
            });
            Gm_tool.clearForm(); //在模块切换时重置所有的查询表单字段

            // 查看、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JQGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $('#aqglTable').css('top', '6px');
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JQGL_CHECK":
                            jqglMan.jycxkp_check.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_JQGL_SEARCH":
                            jqglMan.jycxkp_check.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == jqglMan.jycxkp_check.authority.CHECK)
                    jqglMan.jycxkp_check.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == jqglMan.jycxkp_check.authority.SEARCH)
                    $('#aqglTable').css('top', '6px');
            });
        },
        onReady() {
            $('.popover').hide();
            Gm_tool.getTree();
            var jqgl_form_data = Gm_tool.getStorage('zfsypsjglpt-jdkp-kpcczl-ck-jycxkp');

            if (jqgl_form_data) {
                Gm_tool.assign(this.$searchForm.record, jqgl_form_data);
                ({
                    userCode: this.userCode,
                    dsr: this.dsr,
                    jszh: this.jszh,
                    jdsbh: this.jdsbh,
                    wfdz: this.wfdz,
                    glmt: this.jycxkp_glmt.glmt[0],
                    evaStatus: this.jycxkp_kpzt.kpzt[0],
                    evaResult: this.jycxkp_kpjg.kpjg[0],
                    reviewStatus: this.jycxkp_hczt.hczt[0],
                    reviewResult: this.jycxkp_hcjg.hcjg[0],
                } = jqgl_form_data);
                this.searchForm_bjsj.calcutor.setStatus(jqgl_form_data.timeStatus);
                this.searchForm_bjsj.bjsj = [jqgl_form_data.timeStatus];

                if (jqgl_form_data.timeStatus == 'last-past-of-time') {
                    this.dateShow = true;
                    this.topform_start_time = Gm_format.formatDate(+jqgl_form_data.wfsjStart, true);
                    this.topform_end_time = Gm_format.formatDate(+jqgl_form_data.wfsjEnd, true);
                }
            }
        },
        onDispose() {

        }
    }
});

/**********查询表单初始化函数(需单独提出)**********/
function jqgl_initialData() {
    return {
        userCode: '',
        dsr: '',
        glmt: '-',
        jszh: '',
        jdsbh: '',
        wfdz: '',
        wfsjEnd: '',
        wfsjStart: '',
        orgPath: '',
        evaStatus: '-',
        evaResult: '-',
        reviewStatus: '-',
        reviewResult: '-',
    };
}


let tableBodyJycxkp = avalon.define({ //表格定义组件
    $id: 'jycxkp_table',
    data: [],
    key: 'jqbh',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        jqglMan.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObject = {};