import {
    createForm,
    notification
} from "ane";
import * as menuServer from '/services/menuService';
import moment from 'moment';
import Sbzygl from '/apps/common/common-sbzygl';
import ajax from '/services/ajaxService';
const storage = require('/services/storageService.js').ret;
require('/apps/common/common-tyywglpt.css');
export const name = 'tyywglpt-rwgl-zfysjrw';
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null,
    queryInterval = null;
let {
    isTableSearch
} = require('/services/configService');
const listHeaderName = name + "-list-header";
avalon.component(name, {
    template: __inline('./tyywglpt-rwgl-zfysjrw.html'),
    defaults: {
        // 加载表格数据 begin
        list: [],
        current: 1,
        //每页显示页数
        pageSize: 20,
        // 数据总量
        total: 0,
        dataStr: "",
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        orgData: [],
        orgCode: "",
        orgId: "",
        orgPath: "",
        orgName: "",
        authority: { // 按钮权限标识
            "SEARCH": false //升级管理_设备升级日志_查询
        },
        getCurrent(current) {
            this.current = current;
        },
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.fetchList();
        },
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_XTRWGL_ZFYSJRW/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_XTRWGL_ZFYSJRW_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_XTRWGL_ZFYSJRW_DELETE":
                            _this.authority.DELETE = true;
                            break;
                    }
                });
                autoSetPanelTop();
            });
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.current = v.page + 1;
                }
            });
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchOrgData(() => {
                isTableSearch && this.fetchList();
                // 10s 轮训请求
                queryInterval = setInterval(() => {
                    isTableSearch && this.fetchList(true);
                }, 10000);
            });
            autoSetPanelTop();
        },
        onDispose() {
            clearTimeout(queryInterval);
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            $('div.popover').remove();
        },
        getSelected(key, title) {
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code;
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        // 查找
        json: '',
        $searchForm: createForm(),
        pattern: /^\d+-\d+-\d+( \d+:\d+:\d+)?$/,
        loading: false,
        isNull: true,
        gbcode: '',
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            if (this.authority.SEARCH && keyCode == 13) {
                this.query();
            } else if (keyCode === 32 && event.target.selectionStart === 0) {
                return false;
            }
        },
        handleFocus(event) {
            $(event.target).siblings('.fa-close').show();
        },
        handleBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.fa-close').hide();
        },
        handleClear(name, event) {
            this[name] = '';
            $(event.target).siblings('input').focus();
        },
        delete(item) {
            // 删除无权限 返回
            if(!this.authority.DELETE) return;
            dialogDeleteVm.gbcode = item.gbCode;
            dialogDeleteVm.show = true;
        },
        query() {
            if (enableQuery) {
                this.current = 1;
                this.fetchList();
                enableQuery = false;
                queryTimer = setTimeout(() => {
                    enableQuery = true;
                }, 2000);
            }
        },
        // to do
        fetchList(isInterval) {
            this.$searchForm.validateFields().then(isAllValid => {
                if (isAllValid) {
                    this.loadTableList(isInterval);
                }
            });
        },
        // to do
        fetchOrgData(callback) {
            sbzygl.fetchOrgData(this.orgData, (orgData) => {
                this.orgData = orgData;
                if (orgData.length > 0) {
                    this.orgId = this.dataJson ? this.dataJson.orgId : orgData[0].key;
                    this.orgPath = this.dataJson ? this.dataJson.orgPath : orgData[0].path;
                    this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
                }
                avalon.isFunction(callback) && callback();
            });
        },

        // 加载表格
        loadTableList: function (isInterval) {
            $('div.popover').remove();
            let data = {};
            data.orgPath = this.orgPath;
            data.page = this.current - 1;
            data.pageSize = this.pageSize;
            data.gbcode = this.gbcode;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.orgName = this.orgName;
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);
            // isInterval 静默刷新
            !isInterval && (this.loading = true);
            lxxzrwAjax.ajaxGetTableList(data).then(ret => {
                if (ret.code != 0) {
                    this.loading = false;
                    notification.warning({
                        message: ret.msg,
                        title: '通知'
                    });
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return false;
                }
                // 总数据量
                this.total = ret.data.totalElements;
                if (this.total === 0) {
                    this.loading = false;
                    this.list = [];
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return false;
                }
                avalon.each(ret.data.currentElements, (i, item) => {
                    item.insertTime = moment(item.insertTime).format('YYYY-MM-DD HH:mm:ss');
                });
                // 数据
                this.list = ret.data.currentElements;
                this.loading = false;
                this.isNull = false;
                sbzygl.initList();
                sbzygl.initDragList(listHeaderName);
            }).fail(() => {
                this.loading = false;
                this.list = [];
                this.total = 0;
                this.isNull = true;
                sbzygl.initDragList(listHeaderName);
            });
        }
    }
});

//删除弹窗vm定义
const dialogDeleteVm = avalon.define({
    $id: 'rwgl-zfysjrw-delete-vm',
    show: false,
    gbcode: '',
    // 删除弹窗确定操作
    handleOk() {
        lxxzrwAjax.deleteItem(this.gbcode).then(result => {
            if(result.code !== 0) {
                notification.warning({
                    message: ret.msg,
                    title: '通知'
                });
            }
            notification.success({
                message: '删除成功',
                title: '通知'
            });
            vm.fetchList();
            this.show = false;
        });
    },
    // 删除弹窗取消操作
    handleCancel() {
        this.show = false;
    },
});

// ajax 请求数据
const lxxzrwAjax = {
    // 获取表格数据
    ajaxGetTableList: function (data) {
        return ajax({
            url: '/gmvcs/uom/package/findAllPackageTask',
            method: 'post',
            data: data
        });
    },
    // 删除某一项数据
    deleteItem: function(gbcode) {
        return ajax({
            url: '/gmvcs/uom/package/deletePackageTask?gbcode=' + gbcode,
            method: 'get',
            data: null
        });
    }
};

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
};

function autoSetPanelTop() {
    let $searchbox = $('.tyywglpt-search-box');
    if (vm.authority.SEARCH) {
        $('.tyywglpt-list-panel').css({
            // 'top': $searchbox.offset().top + $searchbox.outerHeight() + 42
            'top': $searchbox.offset().top - 6
        });
    } else {
        $('.tyywglpt-list-panel').css({
            'top': 105
        }); //108 = 66+8+34
    }
}