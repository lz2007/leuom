/**
 * 统一运维管理平台--设备资源管理--多路视频采集设备管理
 *caojiacong
 */
import Sbzygl from '/apps/common/common-sbzygl';
import moment from 'moment';
import ajax from '/services/ajaxService';

import {
    createForm,
    notification
} from 'ane';

import * as menuServer from '/services/menuService';

import {
    apiUrl,
    versionSelection,
    isTableSearch
} from '/services/configService';

import * as deviceApi from '/apps/common/common-gb28181-tyywglpt-device-api';
import {getTypeName} from '/apps/common/common-gb28181-tyywglpt-device-type';
const plupload = require('/vendor/plupload/plupload.full.min.js');
require('/apps/common/common-search-select');
require('/apps/common/common-ms-select');
require('/apps/common/common-tyywglpt.css');
require('/apps/common/common-sbzygl.css');
require('./tyywglpt-sbzygl-dlspcjsbgl.css');
let {
    dep_switch,
} = require('/services/configService');
export const name = 'tyywglpt-sbzygl-dlspcjsbgl';

let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null,
    allotTimer = null,
    uploader = null,
    debounceFetchAllot = null;

avalon.filters.getTypeName = function (str) {
    return getTypeName(str);
}

//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-sbzygl-dlspcjsbgl.html'),
    defaults: {
        key_dep_switch: dep_switch,
        $form: createForm(),
        included_status: false,
        branchShow: versionSelection === 'Qianxinan',
        // 搜索框 search_box 方法
        // 选择是否包含子部门选择框
        clickBranchBack(e) {
            sbzygl.included_status = e;
        },
        loading: false,
        isNull: false,
        list: [],
        total: 0,
        current: 1,
        pageSize: 20,
        selectedRowsLength: 0,
        isDSJ4G: 'disabled', //是否是四g执法仪
        checkedData: [],
        isDuration: false,
        timeMode: 1,
        beginTime: moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
        endTime: moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD'),
        orgData: [],
        orgCode: '',
        orgId: '',
        orgPath: '',
        orgName: '',
        checkAll: false,
        typeOptions: [],
        typeOptionsAll: [],
        statusOptions: [],
        manufacturerOptions: [],
        modelOptions: [],
        typeOk: false,
        manufacturerOk: false,
        modelOk: false,
        isFirstFetchModel: true, //是否为第一次获取搜索栏的型号
        isManuOrTypeSelectMode: false, //是否为厂商或类型改变导致的型号获取
        dataStr: '',
        gbcode: '',
        sn: '',
        IMEI: '',
        titleTimer: '', //popover用的的定时器，代码在common-sbzygl.js
        uploadInit: false,
        needFlash: false,
        downloadTipShow: false,
        authority: {
            // 按钮权限标识
            DELETE: false, //设备资源管理_多路视频采集设备管理_删除
            MODIFY: false, //设备资源管理_多路视频采集设备管理_修改
            REGISTRY: false, //设备资源管理_多路视频采集设备管理_注册
            SEARCH: false, //设备资源管理_多路视频采集设备管理_查询
            BATCHREGISTRY: true, // 批量注册(要设为true，不然plupload插件初始化不了)
            OPT_SHOW: false //操作栏 - 显隐
        },
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);

            //去抖的查询配发对象函数
            debounceFetchAllot = sbzygl.debounce(function (dialogVm) {
                fetchAllot(dlspcjsbglRegisterVm, null, true);
            }, 1000);

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then((menu) => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_DLSPCJSBGL_/.test(el)) avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0) return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case 'UOM_FUNCTION_SBZYGL_DLSPCJSBGL_DELETE':
                            _this.authority.DELETE = true;
                            break;
                        case 'UOM_FUNCTION_SBZYGL_DLSPCJSBGL_MODIFY':
                            _this.authority.MODIFY = true;
                            break;
                        case 'UOM_FUNCTION_SBZYGL_DLSPCJSBGL_REGISTRY':
                            _this.authority.REGISTRY = true;
                            break;
                        case 'UOM_FUNCTION_SBZYGL_DLSPCJSBGL_SEARCH':
                            _this.authority.SEARCH = true;
                            break;
                        case 'UOM_FUNCTION_SBZYGL_DLSPCJSBGL_BATCHREGISTRY':
                            _this.authority.BATCHREGISTRY = true;
                            break;
                    }
                });
                //批量注册的权限判断
                if (func_list.indexOf('UOM_FUNCTION_SBZYGL_DLSPCJSBGL_BATCHREGISTRY') === -1) {
                    _this.authority.BATCHREGISTRY = false;
                }
                if (false == _this.authority.MODIFY && false == _this.authority.DELETE) _this.authority.OPT_SHOW = true;
                // sbzygl.autoSetListPanelTop();
            });
        },
        onReady() {

            this.dataStr = storage.getItem(name);
            // this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            this.dataJson = null;
            // console.log(this.dataJson);
            // let v = this.dataJson;
            // if (v) {
            //     this.beginTime = v.beginTime ? moment(v.beginTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
            //     this.endTime = v.endTime ? moment(v.endTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
            //     this.timeMode = v.timeMode;
            //     this.modelName = v.model;
            //     this.isDuration = v.timeMode === 3;
            //     this.current = v.page + 1;
            //     this.userName = v.userName || "";
            //     this.gbcode = v.gbcode || "";
            //     this.sn = v.sn || "";
            //     this.IMEI = v.imei || "";
            //     this.orgCode = v.orgCode;
            //     this.orgId = v.orgId;
            //     this.orgName = v.orgName;
            //     this.orgPath = v.orgPath;
            //     sbzygl.included_status = v.included_status || false;
            // }

            this.fetchStatusOptions();
            this.fetchManuOptions();
            this.fetchTypeOptions();

            this.fetchOrgData(() => {
                let timer = setInterval(() => {
                    //保证查询条件到位后再fetchList
                    let recordStr = JSON.stringify(this.$form.record);
                    let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
                    if (vm.typeOk && vm.manufacturerOk && vm.modelOk && length >= 7) {
                        isTableSearch && vm.fetchList();
                        dialogDirectVm.orgData = this.orgData;
                        clearInterval(timer);
                    }
                    if (vm.manufacturerOk && vm.typeOk) {
                        vm.fetchModelOptions();
                    }
                }, 100);
            });

            this.plupload();
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
        },
        getDefaultManu(manufacturerOptions, dataJson) {
            return manufacturerOptions.length > 0 ? (dataJson ? dataJson.manufacturerId : manufacturerOptions[0].value) : '';
        },
        getDefaultModel(modelOptions, isManuOrTypeSelectMode, dataJson) {
            return modelOptions.length > 0 ? (isManuOrTypeSelectMode ? modelOptions[0].value : (dataJson ? dataJson.modelId : modelOptions[0].value)) : '';
        },
        getDefaultStatus(statusOptions, dataJson) {
            return statusOptions.length > 0 ? (dataJson ? dataJson.status : statusOptions[0].value) : '';
        },
        getShowStatus(show) {
            this.downloadTipShow = show;
        },
        showDownLoadTip() {
            if (this.checkedData.length) {
                return;
            }
            sbzygl.showTips('warn', '后台暂未提供接口');
            return;
            if (this.needFlash) {
                this.downloadTipShow = true;
            }
        },
        // 批量上传
        plupload() {
            uploader = new plupload.Uploader({
                runtimes: 'html5,flash',
                browse_button: 'fileupload', //触发文件选择对话框的按钮，为那个元素id
                url: 'http://' + window.location.host + apiUrl + '/gmvcs/uom/device/dsj/register/excel', //服务器端的上传页面地址
                flash_swf_url: '/static/vendor/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                filters: {
                    max_file_size: '1m',
                    mime_types: [{
                        title: 'Xls files',
                        extensions: 'xls,xlsx'
                    }]
                },
                multi_selection: false,
                init: {
                    Init: function (up) {
                        vm.uploadInit = true;
                    },
                    FilesAdded: function (up, files) {
                        let file = files[0];
                        //清除队列
                        for (let i = 0; i < uploader.files.length - 1; i++) {
                            uploader.removeFile(uploader.files[i]);
                        }
                        up.start();
                    },
                    FileUploaded: function (up, file, response) {
                        let result = JSON.parse(response.response);
                        if (result.code == 0) {
                            sbzygl.showTips('success', '批量注册成功');
                            vm.fetchList();
                        } else {
                            sbzygl.showTips('error', result.data);
                        }
                    },
                    Error: function (up, err) {
                        let code = err.code;
                        if (code === -500) {
                            vm.needFlash = true;
                        } else if (code === -601) {
                            sbzygl.showTips('warn', '仅支持上传xls或xlsx表格文件');
                        } else if (code === -600) {
                            sbzygl.showTips('warn', '上传的文件大小不能超过1M');
                        } else {
                            sbzygl.showTips('error', '批量注册失败');
                        }
                    }
                }
            });
            // uploader.init();
        },
        //修改按钮
        handleModify(record) {
            if (record.platformGbcode) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能修改');
                return false;
            } else {
                return true;
            }
        },
        //删除按钮
        handleDelete(record) {
            if (record.platformGbcode) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能删除');
                return false
            } else {
                return true;
            }
        },
        // 设备厂商chane
        handleManuChange(e) {
            this.fetchModelOptions();
            this.queryDefaultType = '';
            this.queryDefaultType = this.typeOptions.length ? this.typeOptions[0].value : "";
            if (!this.isFirstFetchModel) {
                this.isManuOrTypeSelectMode = true;
            }
        },
        queryDefaultType: '',
        // 设备类型chane
        handleTypeChange(e) {
            this.fetchModelOptions();
            if (!this.isFirstFetchModel) {
                this.isManuOrTypeSelectMode = true;
            }
        },
        // 时间操作
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
            // sbzygl.autoSetListPanelTop();
        },
        // 注册按钮
        handleRegister() {
            if (this.selectedRowsLength !== 0) return;
            dlspcjsbglRegisterVm.type = 'add';
            dlspcjsbglRegisterVm.show = true;

            dlspcjsbglRegisterVm.orgId = this.orgId;
            dlspcjsbglRegisterVm.allotOrgId = this.orgId;
            dlspcjsbglRegisterVm.allotOrgName = this.orgName;
            dlspcjsbglRegisterVm.orgCode = this.orgCode;
            dlspcjsbglRegisterVm.orgPath = this.orgPath;
            dlspcjsbglRegisterVm.orgName = this.orgName;

            fetchAllotByOrgId(dlspcjsbglRegisterVm);
        },
        //采集站定向升级按钮
        handleUpdateDirect() {
            let record = this.$form.record;
            dialogDirectVm.orgId = this.orgId;
            dialogDirectVm.orgCode = this.orgCode;
            dialogDirectVm.orgPath = this.orgPath;
            dialogDirectVm.orgName = this.orgName;
            dialogDirectVm.defaultManufacturer = "";
            //联动搜索栏选择的厂商
            if (record.manufacturer == "null" || !record.manufacturer) {
                dialogDirectVm.defaultManufacturer = dialogDirectVm.manufacturerOptions.length > 0 ? dialogDirectVm.manufacturerOptions[0].value : "";
            } else {
                dialogDirectVm.defaultManufacturer = record.manufacturer;
            }
            dialogDirectVm.show = true;
            dialogDirectVm.fetchWsList();
        },
        //批量删除
        handleBatchDelete() {
            if (this.selectedRowsLength < 1) {
                return;
            }
            dlspcjsbglDeleteVm.selectedRowsLength = this.selectedRowsLength;
            dlspcjsbglDeleteVm.isBatch = true;
            dlspcjsbglDeleteVm.show = true;
        },
        getCurrent(current) {
            this.current = current;
            this.fetchList();
        },
        // 查询
        query() {
            if (enableQuery) {
                this.current = 1;
                this.fetchList();
                enableQuery = false;
                queryTimer = setTimeout(() => {
                    enableQuery = true;
                }, 1000);
            }
        },
        //获取设备状态列表
        fetchStatusOptions() {
            let url = '/gmvcs/uom/device/dsj/statusType';
            sbzygl.handleRemoteSelect(url, 'descript', 'id', 'status', '执法仪状态', (options, shiftOptions) => {
                this.statusOptions = options;
            });
        },
        // 根据value获取设备状态名name
        getStatusOptionsName(value) {
            let name = '';
            this.statusOptions.forEach((item) => {
                if (item.value == value) {
                    name = item.label;
                }
            });
            return name;
        },
        // 树选择回调
        getSelected(key, title) {
            this.orgId = key;
        },
        // 树回调
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code;
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
        },
        // 树展开回调
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        // 获取部门树
        fetchOrgData(callback) {
            sbzygl.fetchOrgData(this.orgData, (orgData) => {
                this.orgData = orgData;
                if (orgData.length > 0) {
                    this.orgId = orgData[0].key;
                    this.orgCode = orgData[0].code;
                    this.orgPath = orgData[0].path;
                    this.orgName = orgData[0].title;
                }
                avalon.isFunction(callback) && callback();
            });
        },
        // 获取厂商列表
        fetchManuOptions() {
            deviceApi
                .getManufacturer()
                .then((result) => {
                    if (result.code != 0) {
                        this.manufacturerOptions.clear();
                        this.manufacturerOk = true;
                        return;
                    }
                    sbzygl.handleRemoteArrayToDic(result.data, (manuHasNullOptions, manuOptions) => {
                        this.manufacturerOptions = manuHasNullOptions;
                        dialogDirectVm.manufacturerOptions = manuOptions
                        this.manufacturerOk = true;
                    });
                })
                .fail(() => {
                    this.manufacturerOk = true;
                });
        },
        // 获取设备类型列表
        fetchTypeOptions() {
            deviceApi
                .getDeviceType()
                .then((result) => {
                    if (result.code != 0) {
                        this.typeOptions.clear();
                        this.typeOk = true;
                        return;
                    }

                    this.typeOptionsAll = result.optionsTpye;
                    this.queryDefaultType = result.hasNullOptions.length ? result.hasNullOptions[0].value : "";
                    this.typeOptions = result.hasNullOptions;

                    this.typeOk = true;

                })
                .fail(() => {
                    this.typeOk = true;
                });
        },
        // 根据厂商和类型获取设备型号
        fetchModelOptions() {
            let record = this.$form.record,
                manufacturer = String(record.manufacturer),
                type = String(record.type);
            //当为不限或为空时，不需要传相关的参数
            if (manufacturer && manufacturer !== 'null') {
                manufacturer = (manufacturer);
            } else {
                manufacturer = '';
            }

            if (type && type !== 'null') {
                type = (type);
            } else {
                type = '';
            }

            deviceApi
                .getModel(manufacturer, type)
                .then((result) => {
                    if (result.code != 0) {
                        this.modelOptions.clear();
                        this.modelOk = true;
                        this.isFirstFetchModel = false;
                        return;
                    }
                    //型号
                    sbzygl.handleRemoteArrayToDic(result.data, (modelHasNullOptions, modelOptions) => {
                        this.modelOptions.clear();
                        this.modelOptions = modelHasNullOptions;
                        this.modelOk = true;
                    });
                    this.isFirstFetchModel = false;
                })
                .fail(() => {
                    this.modelOk = true;
                });
        },
        // input 清空操作-s
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
        // input 清空操作-e

        //获取执法仪信息列表
        fetchList() {
            let record = this.$form.record;

            avalon.each(record, function (key, value) {
                if (Array.isArray(value)) {
                    record[key] = value[0];
                }
            });

            let data = {
                attachChannelInfo: true,
                type: record.type == '' ? null : record.type,
                manufacturer: record.manufacturer == '' ? null : record.manufacturer,
                model: record.model == '' ? null : record.model,
                status: record.status == '' ? 0 : record.status,
                searchSubOrg: true,
                orgPath: this.orgPath || null,
                page: this.current - 1,
                pageSize: this.pageSize,
                registerTimeBegin: record.beginTime,
                registerTimeEnd: record.endTime
            };

            data.registerTimeBegin = this.isDuration ?
                data.registerTimeBegin ? moment(data.registerTimeBegin).format('X') * 1000 : null :
                this.beginTime ? moment(this.beginTime).format('X') * 1000 : null;
            data.registerTimeEnd = this.isDuration ?
                data.registerTimeEnd ?
                moment(data.registerTimeEnd).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 :
                null :
                this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null;

            if (!data.registerTimeBegin && !data.registerTimeEnd) {
                sbzygl.showTips('warning', '请选择开始时间与结束时间！');
                return;
            }
            if (!data.registerTimeBegin && data.registerTimeEnd) {
                sbzygl.showTips('warning', '请选择开始时间！');
                return;
            }
            if (data.registerTimeBegin && !data.registerTimeEnd) {
                sbzygl.showTips('warning', '请选择结束时间！');
                return;
            }
            if (data.registerTimeBegin && data.registerTimeEnd && data.registerTimeBegin >= data.registerTimeEnd) {
                sbzygl.showTips('warning', '开始时间不能大于结束时间！');
                return;
            }

            this.loading = true;
            this.checkAll = false;
            this.selectedRowsLength = 0;

            let newData = {
                deviceName: '',
                gbcode: this.gbcode,
                sn: this.sn,
                imei: this.IMEI,
                manufacturer: toEmpty(data.manufacturer),
                model: toEmpty(data.model),
                orgPath: toEmpty(data.orgPath),
                page: data.page,
                pageSize: data.pageSize,
                registerTimeBegin: data.registerTimeBegin,
                registerTimeEnd: data.registerTimeEnd,
                searchSubOrg: sbzygl.included_status == undefined ? false : sbzygl.included_status,
                status: toEmpty(data.status),
                type: toEmpty(data.type) == '' ? this.typeOptionsAll : [data.type]
            };

            newData.orgCode = this.orgCode || null;
            newData.orgId = this.orgId || null;

            let storageData = JSON.parse(JSON.stringify(newData));
            storageData.timeMode = this.timeMode;
            storageData.page = this.current - 1;
            storageData.orgName = this.orgName;
            storageData.manufacturerId = storageData.manufacturerId == null ? null : String(storageData.manufacturerId);
            storageData.type = storageData.type == null ? null : String(storageData.type);
            storageData.status = storageData.status == null ? null : String(storageData.status);
            storageData.modelId = this.$form.record.model ? String(this.$form.record.model) : null;
            storageData.included_status = sbzygl.included_status;
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);

            deviceApi.searchDevice(newData)
                .then((result) => {
                    this.loading = false;
                    if (result.code !== 0) {
                        sbzygl.showTips('error', result.msg);
                        this.list = [];
                        this.total = 0;
                        this.isNull = true;
                        return;
                    } else if (!result.data.totalElements) {
                        this.list = [];
                        this.total = 0;
                        this.isNull = true;
                        return;
                    }

                    result.data.currentElements.forEach((el) => {
                        el.checked = false;
                        el.statusName = this.getStatusOptionsName(el.status);
                        switch (el.online) {
                            case 0:
                                el.onlineName = '不在线'
                                break;
                            case 1:
                                el.onlineName = '在线'
                                break;
                            case -1:
                                el.onlineName = '未知'
                                break;
                        }
                    });

                    this.list = result.data.currentElements;
                    this.total = result.data.totalElements;
                    this.isNull = false;
                })
                .fail(() => {
                    this.loading = false;
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                });
        },

        // 表格样式
        panelCss: {
            position: 'absolute',
            top: 302,
            bottom: 52,
            left: 0,
            right: 0
        },
        // 表格-操作回调
        actions(type, text, record, index) {
            switch (type) {
                case 'modify':
                    //修改按钮
                    if (this.handleModify(record)) {
                        dlspcjsbglRegisterVm.type = 'modify';
                        dlspcjsbglRegisterVm.modifyData = record;
                        dlspcjsbglRegisterVm.show = true;
                    };

                    break;
                case 'delete':
                    //删除按钮
                    if (this.handleDelete(record)) {
                        dlspcjsbglDeleteVm.isBatch = false;
                        dlspcjsbglDeleteVm.delData = [record.gbcode];
                        dlspcjsbglDeleteVm.show = true;
                    };
                    break;
                default:
                    break;
            }
        },
        hascheckedData: [],
        // 表格-选择回调
        selectChange(type, data) {
            this.hascheckedData.clear();
            this.list.forEach((item, index) => {
                if (item.checked) {
                    if (item.platformGbcode) {
                        item.checked = false;
                        sbzygl.showTips('warn', `选中的第${index+1}条数据来自级联平台，不能删除`);
                    } else {
                        this.hascheckedData.push(item.gbcode);
                    }
                }
            });

            this.selectedRowsLength = this.hascheckedData.length;

            if (this.hascheckedData.length == 1) {
                if (data.type == 'DSJ4G') {
                    this.isDSJ4G = '';
                } else {
                    this.isDSJ4G = 'disabled';
                }
            } else {
                this.isDSJ4G = 'disabled';
            }
        }
    }
});

// 删除弹窗
let dlspcjsbglDeleteVm = avalon.define({
    $id: 'dlspcjsbgl-delete-vm',
    show: false,
    isBatch: false,
    selectedRowsLength: 0,
    delData: [],
    handleOk() {
        let data = [];
        if (this.isBatch) {
            data = vm.hascheckedData;
        } else {
            data = this.delData;
        }
        deviceApi.deleteDevice(data).then(result => {
            if (result.code == 0) {
                sbzygl.showTips('success', '删除成功');
                vm.query();
            }
        });
        this.show = false;
    },
    handleCancel() {
        this.show = false;
    }
});

// 注册弹窗 | 修改弹窗
let dlspcjsbglRegisterVm = avalon.define({
    $id: 'dlspcjsbgl-register-modify-vm',
    title: '注册设备',
    show: false,
    manuReg: /(^[a-zA-Z0-9\u4e00-\u9fa5-|-|_]{1,32}$|^\s{0}$)/,
    modelReg: /(^[a-zA-Z0-9\u4e00-\u9fa5-|-|_]{1,32}$|^\s{0}$)/,
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    capacityReg: /(^[1-9]{1}[0-9]{0,8}$|^\s{0}$)/,
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    ipReg: /(^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^\s{0}$)/,
    // 设备厂商
    type: 'add',
    modifyData: {},
    defaultManufacturer: '',
    manufacturerOptions: [],
    /**
     *联动说明：
     * 1.设备类型和设备厂商不联动。
     * 2.设备类型和设备厂商决定产品型号。
     */
    getManuOptions() {
        return deviceApi.getManufacturer().then((result) => {
            if (result.code != 0) {
                this.manufacturerOptions.clear();
                return;
            }

            if (result.data.length) {
                this.defaultManufacturer = result.data[0];
                this.inputJson.manufacturer = result.data[0];
                this.$form.record.manufacturer = result.data[0];
            }

            sbzygl.handleRemoteArrayToDic(result.data, (manuHasNullOptions, manuOptions) => {
                this.manufacturerOptions = manuOptions;
            });

            return result.data[0];
        });
    },
    handleManuChange() {
        if (this.$form.record.manufacturer) {
            this.validJson.manufacturer = true;
            this.getModel(this.$form.record.manufacturer, this.$form.record.type);
        }
    },
    getSearchSelected(label, value, owner) {
        if (value == null) return;
        if (owner === "manufacturer") {
            this.$form.record.manufacturer = value;
            this.getModel(this.$form.record.manufacturer, this.$form.record.type);
        }
    },
    handleSearchSelectFocus(event, owner) {
        if (owner === "manufacturer") {
            sbzygl.handleFocus(event, 'manufacturer', this);
        } else {
            sbzygl.handleFocus(event, 'model', this);
        }
    },
    handleSearchSelectFormat(event, owner) {
        if (owner === "manufacturer") {
            sbzygl.handleFormat(event, 'manufacturer', this, this.manuReg, 32);
        } else {
            sbzygl.handleFormat(event, 'model', this, this.modelReg, 32);
        }
    },

    getSearchLabel(label, owner) {
        //厂商或型号的输入有变化时
        if (label == null) return;
        if (owner === "manufacturer") {
            this.inputJson.manufacturer = label;
            this.$form.record.manufacturer = label;
        } else {
            this.inputJson.model = label;
            this.$form.record.model = label;
        }
    },

    // 设备类型
    defaultType: '',
    typeOptions: [],
    typeOk: false,
    getDeviceType(manufacturer = '', allType = false) {
        deviceApi.getDeviceType(manufacturer, allType)
            .then((result) => {
                if (result.code != 0) {
                    this.typeOptions.clear();
                    return;
                }

                this.defaultType = result.options[0].value;
                this.typeOptions = result.options;
                this.typeOk = true;
            })
            .fail(() => {
                this.defaultType = '';
            });
    },
    isTypeDSJ4G: false,
    handleDeviceTypeChange(e) {
        this.validJson.type = true;

        this.getModel(this.$form.record.manufacturer, this.$form.record.type);
        if (this.type == 'add') createGbcode(this.orgCode, this.$form.record.type);
        if (this.$form.record.type == 'DSJ4G') {
            this.isTypeDSJ4G = true;
        } else {
            this.isTypeDSJ4G = false;
            this.validJson.imei = true;
        };
    },

    // 设备型号
    defaultModel: '',
    modelOk: false,
    modelOptions: [],
    getModel(manufacturer, type) {
        deviceApi.getModel(manufacturer, type).then((result) => {
            this.modelOk = false;

            if (result.code != 0) {
                this.modelOptions.clear();
                return;
            }

            if (this.type == 'add') {
                let modelVal = result.data[0] ? result.data[0] : '';
                this.defaultModel = modelVal;
                this.inputJson.model = modelVal;
                this.$form.record.model = modelVal;
            }

            this.modelOk = true;
            //型号
            sbzygl.handleRemoteArrayToDic(result.data, (modelHasNullOptions, modelOptions) => {
                this.modelOptions = modelOptions;
            });
        });
    },
    handleModelChange() {},

    orgData: [],
    orgId: '',
    orgCode: '',
    orgPath: '',
    orgName: '',
    // 获取部门树
    fetchOrgData(callback) {
        sbzygl.fetchOrgData(this.orgData, (orgData) => {
            this.orgData = orgData;
            if (orgData.length > 0 && this.type == 'add') {
                this.orgId = orgData[0].key;
                this.orgCode = orgData[0].code;
                this.orgPath = orgData[0].path;
                this.orgName = orgData[0].title;
            }
            avalon.isFunction(callback) && callback();
        });
    },
    // 部门树选择回调
    getSelected(key, title) {
        this.orgId = key;
    },
    // 部门树回调
    handleTreeChange(e, selectedKeys) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;

        if (this.type == 'add') createGbcode(this.orgCode, this.$form.record.type);
    },

    // 父节点
    data: [],
    selectedParentKey: '',
    selectedParentDeviceId: '',
    selectedParentTitle: '',
    handleParentTreeChange(e) {
        this.selectedParentKey = e.node.key;
        this.selectedParentDeviceId = e.node.deviceId;
        this.selectedParentTitle = e.node.name;
    },
    extraParentExpandHandle(treeId, treeNode, selectedKey) {
        archetypeItem({
            parentId: treeNode.deviceId,
            page: 0,
            pageNum: 1000,
            isTree: true,
            treeId,
            treeNode,
            selectedKey
        });
        // sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    $form: createForm(),
    modifyId: '',
    registerTime: '',
    status: '',
    validJson: {
        gbcode: true,
        gbcodeUnique: true,
        model: true,
        type: true,
        orgRid: true,
        name: true,
        imei: true,
        sim: true,
        ip: true,
        capacity: true,
        manufacturer: true,
        allotKeyword: true,
        sn: true
    },
    inputJson: {
        name: '',
        capacity: '',
        imei: '',
        gbcode: '',
        manufacturer: '',
        model: '',
        ip: '',
        sim: '',
        usercode: '',
        userRid: '',
        username: '',
        allotKeyword: '',
        orgName: '',
        sn: ''
    },
    showJson: {
        gbcode: false,
        capacity: false,
        ip: false,
        sim: false
    },
    handleOk() {

        //------------表单验证开始----------------------------------------------------------

        let pass = true;

        if (!this.$form.record.type) {
            this.validJson.type = false;
            pass = false;
        }

        if (!this.inputJson.name) {
            this.validJson.name = false;
            pass = false;
        }

        if (this.isTypeDSJ4G) {
            if (!this.inputJson.imei) {
                this.validJson.imei = false;
                pass = false;
            }
        }

        if (!this.inputJson.name) {
            this.validJson.name = false;
            pass = false;
        }

        avalon.each(this.validJson, (key, value) => {
            if (this.validJson[key] == false) {
                pass = false;
            }
        });

        if (!pass) {
            return;
        }

        //------------表单验证结束----------------------------------------------------------

        let data = {
            capacity: this.inputJson.capacity,
            extend: '',
            gbcode: this.inputJson.gbcode,
            id: this.modifyId,
            imei: this.inputJson.imei,
            ip: this.inputJson.ip,
            isDeleted: 0,
            manufacturer: this.$form.record.manufacturer,
            model: this.$form.record.model,
            name: this.inputJson.name,
            online: 0,
            orgCode: this.orgCode,
            orgId: this.orgId,
            orgName: this.orgName,
            orgPath: this.orgPath,
            parentGbcode: this.selectedParentDeviceId,
            platformGbcode: platformGbcode,
            registerTime: this.registerTime,
            sim: this.inputJson.sim,
            status: this.status,
            type: this.$form.record.type,
            updateTime: '',
            userCode: this.inputJson.usercode,
            userId: this.inputJson.userRid,
            userName: this.inputJson.username,
            version: '',
            sn: this.inputJson.sn,
        };

        if (this.type == 'add') {
            let deviceInfoList = [data];

            deviceApi.registerDevice(deviceInfoList).then((ret) => {
                if (ret.code == 0) {
                    sbzygl.showTips('success', '注册成功');
                    this.show = false;
                    vm.query();
                    vm.fetchManuOptions();
                }
            });

        } else {
            deviceApi.modifyDevice(data).then(ret => {
                if (ret.code == 0) {
                    sbzygl.showTips('success', '修改成功');
                    this.show = false;
                    vm.query();
                }
            });
        }
    },
    handleCancel() {
        this.show = false;
    },
    handleFocus(name, event) {
        if (name == 'imei') {
            if (this.isTypeDSJ4G) {
                if (this.inputJson.imei) {
                    this.validJson.imei = true;
                }
            }
            return;
        }
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        if (name == 'imei') {
            if (this.isTypeDSJ4G) {
                if (!this.inputJson.imei) {
                    this.validJson.imei = false;
                } else {
                    this.validJson.imei = true;
                }
            } else {
                this.validJson.imei = true;
            }
            return;
        }
        sbzygl.handleFormat(event, name, this, reg);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },


    allotOrgId: "",
    allotOrgName: "",
    allotQuery: false,
    allotIsNull: true,
    isSelect: false, //判断是否手动（非通过所属部门联动）选择了配发部门

    allotQuery: false,
    defaultAllot: '',
    allotOptions: [],

    isTriggerGetSelected: false,
    allotLoading: false,
    allotPageQuery: 0,
    allotPageByOrg: 0,
    allotPageTotal: 0,
    allotPageSize: 500,
    pageTimer: '',
    currentOrgId: '', //当前选中的配发对象部门id
    lastOrgId: '',
    $skipArray: ['isTriggerGetSelected', 'allotPageQuery', 'allotPageByOrg', 'allotPageTotal', 'allotPageSize', 'pageTimer', 'currentOrgId'],

    getAllotSelected(key, title) {
        if (!vm.needFetchRegisterAllot) {
            return;
        }
    },

    handleAllotTreeChange(e) {
        this.isSelect = true;
        // this.orgId = e.node.key;
        // this.orgName = e.node.title;
        // this.orgCode = e.node.code;
        // this.orgPath = e.node.path;

        this.allotOrgId = e.node.key;
        this.allotOrgName = e.node.title;
        fetchAllotByOrgId(this);
        this.isTriggerGetSelected = true;
    },

    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },

    //切换配发方式按钮
    handleTabType(event) {
        event.target.blur();
        this.allotQuery = !this.allotQuery;
        this.inputJson.orgName = "";
        this.inputJson.usercode = "";
        this.inputJson.username = "";
        this.inputJson.userRid = "";
        this.inputJson.userOrgRid = "";
        this.allotOptions.clear();
        this.validJson.allotKeyword = true;
        this.currentOrgId = "";
        clearTimeout(allotTimer);
        clearTimeout(dlspcjsbglRegisterVm.pageTimer);
        if (!this.allotQuery) {
            fetchAllotByOrgId(dlspcjsbglRegisterVm);
        } else {
            if (this.type == 'modify') {
                this.inputJson.allotKeyword = this.modifyData.userName;
            }
            fetchAllot(dlspcjsbglRegisterVm, null, true)
        }
    },
    //配发对象关键字查询
    handleAllotQuery(event) {
        let keyCode = event.keyCode || event.which;
        if (keyCode === 13) {
            //按下enter键直接发送请求查询配发对象
            // event.target.blur();
            clearTimeout(allotTimer);
            fetchAllot(dlspcjsbglRegisterVm, null, false);
        } else {
            //使用去抖函数发送请求查询配发对象，避免频繁发送请求
            allotTimer = debounceFetchAllot(dlspcjsbglRegisterVm);
        }
    },
    findIndex: [],
    //配发对象改变时
    allotChange(label, value) {

        if (this.allotOptions.length <= 0) {
            this.inputJson.orgName = "";
            this.inputJson.usercode = "";
            this.inputJson.username = "";
            this.inputJson.userRid = "";
            this.inputJson.userOrgRid = "";
            this.allotIsNull = true;
            return;
        }
        let index = this.findIndex.indexOf(value);
        if (index >= 0 || value == "null") {
            let targetData = null;

            targetData = this.allotOptions[index + 1];

            this.inputJson.username = targetData.userName;
            this.inputJson.usercode = targetData.userCode;
            this.inputJson.userRid = targetData.userId;
            console.log(targetData);

            this.allotIsNull = Boolean(index === -1);
            if (!this.allotIsNull) {
                this.isSelect = true;
            }
            if (this.allotQuery) {
                //可查询模式下
                this.inputJson.orgName = targetData.orgName;
                this.inputJson.userOrgRid = targetData.orgId;
            }
        }

    },
    //获取配发对象下拉框的Loading状态
    getLoading(loading) {
        this.allotLoading = loading;
    },
    allotQueryBlur(event) {
        clearTimeout(allotTimer);
        $(event.target).siblings('.fa-close').hide();
    },
});

dlspcjsbglRegisterVm.$watch('show', (newVal) => {
    if (newVal) {
        dlspcjsbglRegisterVm.isTypeDSJ4G = false;

        dlspcjsbglRegisterVm.showJson = {
            gbcode: false,
            capacity: false,
            ip: false,
            sim: false
        };

        // 表单默认
        dlspcjsbglRegisterVm.validJson = {
            gbcode: true,
            gbcodeUnique: true,
            model: true,
            type: true,
            orgRid: true,
            name: true,
            imei: true,
            sim: true,
            ip: true,
            capacity: true,
            manufacturer: true,
            allotKeyword: true,
            sn: true
        };

        dlspcjsbglRegisterVm.inputJson = {
            name: '',
            capacity: '',
            imei: '',
            gbcode: '',
            manufacturer: '',
            model: '',
            ip: '',
            sim: '',
            usercode: '',
            userRid: '',
            username: '',
            allotKeyword: '',
            orgName: '',
            sn: ''
        };

        if (dlspcjsbglRegisterVm.type == 'modify') {
            dlspcjsbglRegisterVm.$fire('modify');
        } else {
            dlspcjsbglRegisterVm.$fire('add');
        }
    }
});

// 新增
dlspcjsbglRegisterVm.$watch('add', () => {
    dlspcjsbglRegisterVm.title = '注册设备';
    dlspcjsbglRegisterVm.defaultManufacturer = '';
    dlspcjsbglRegisterVm.defaultType = '';
    dlspcjsbglRegisterVm.defaultModel = '';
    dlspcjsbglRegisterVm.currentOrgId = '';
    dlspcjsbglRegisterVm.defaultAllot = "";
    dlspcjsbglRegisterVm.lastOrgId = "";
    dlspcjsbglRegisterVm.lastOrgName = "";
    dlspcjsbglRegisterVm.lastAllotKeyword = "";
    dlspcjsbglRegisterVm.lastUserId = "";
    dlspcjsbglRegisterVm.allotOrgId = "";
    dlspcjsbglRegisterVm.allotOrgName = "";
    dlspcjsbglRegisterVm.isDump = false;
    dlspcjsbglRegisterVm.isAbnormal = false;
    dlspcjsbglRegisterVm.isSelect = false;
    dlspcjsbglRegisterVm.allotUserHasDelete = false;

    // 部门树默认
    dlspcjsbglRegisterVm.fetchOrgData();

    // 父节点默认
    dlspcjsbglRegisterVm.selectedParentDeviceId = platformGbcode;
    dlspcjsbglRegisterVm.selectedParentKey = platformKey;
    dlspcjsbglRegisterVm.selectedParentTitle = platformTitle;

    // 获取厂商
    dlspcjsbglRegisterVm.getManuOptions();
    // 获取类型
    dlspcjsbglRegisterVm.getDeviceType('', true);


    // 国标编号
    if (dlspcjsbglRegisterVm.orgCode) {
        createGbcode(dlspcjsbglRegisterVm.orgCode, dlspcjsbglRegisterVm.$form.record.type);
    }
});

// 修改
dlspcjsbglRegisterVm.$watch('modify', () => {
    dlspcjsbglRegisterVm.title = '修改设备';
    dlspcjsbglRegisterVm.defaultManufacturer = '';
    dlspcjsbglRegisterVm.defaultType = '';
    dlspcjsbglRegisterVm.defaultModel = '';

    dlspcjsbglRegisterVm.allotQuery = false;
    dlspcjsbglRegisterVm.allotIsNull = true;
    clearTimeout(allotTimer);
    clearTimeout(dlspcjsbglRegisterVm.pageTimer);
    dlspcjsbglRegisterVm.currentOrgId = '';
    dlspcjsbglRegisterVm.defaultAllot = "";
    dlspcjsbglRegisterVm.lastOrgId = "";
    dlspcjsbglRegisterVm.lastOrgName = "";
    dlspcjsbglRegisterVm.lastAllotKeyword = "";
    dlspcjsbglRegisterVm.lastUserId = "";
    dlspcjsbglRegisterVm.allotOrgId = "";
    dlspcjsbglRegisterVm.allotOrgName = "";
    dlspcjsbglRegisterVm.isDump = false;
    dlspcjsbglRegisterVm.isAbnormal = false;
    dlspcjsbglRegisterVm.isSelect = false;
    dlspcjsbglRegisterVm.allotUserHasDelete = false;
    //直接设成[]，下拉框选了之后会一直保持选择的值
    dlspcjsbglRegisterVm.selectedRowsData = [''];

    dlspcjsbglRegisterVm.typeOk = false;
    dlspcjsbglRegisterVm.modelOk = false;

    // 部门树默认
    dlspcjsbglRegisterVm.fetchOrgData();
    // 获取厂商
    dlspcjsbglRegisterVm.getManuOptions();
    // 获取类型
    dlspcjsbglRegisterVm.getDeviceType('', true);

    // 设置修改值

    let record = JSON.parse(JSON.stringify(dlspcjsbglRegisterVm.modifyData));

    let setDefaultTime = setInterval(() => {
        if (dlspcjsbglRegisterVm.typeOk && dlspcjsbglRegisterVm.modelOk) {

            dlspcjsbglRegisterVm.inputJson.manufacturer = record.manufacturer;
            dlspcjsbglRegisterVm.inputJson.model = record.model;

            dlspcjsbglRegisterVm.defaultManufacturer = record.manufacturer;
            dlspcjsbglRegisterVm.defaultType = record.type;
            dlspcjsbglRegisterVm.defaultModel = record.model;

            dlspcjsbglRegisterVm.$form.record.model = record.model;

            clearInterval(setDefaultTime);
        }
    }, 20);

    dlspcjsbglRegisterVm.inputJson.name = record.name;
    dlspcjsbglRegisterVm.inputJson.capacity = record.capacity;
    dlspcjsbglRegisterVm.inputJson.imei = record.imei;
    dlspcjsbglRegisterVm.inputJson.gbcode = record.gbcode;
    dlspcjsbglRegisterVm.inputJson.ip = record.ip;
    dlspcjsbglRegisterVm.inputJson.sim = record.sim;
    dlspcjsbglRegisterVm.inputJson.sn = record.sn;

    dlspcjsbglRegisterVm.inputJson.usercode = record.userCode;
    dlspcjsbglRegisterVm.inputJson.userRid = record.userId;
    dlspcjsbglRegisterVm.inputJson.username = record.userName;

    dlspcjsbglRegisterVm.lastOrgId = record.orgId;
    dlspcjsbglRegisterVm.lastAllotKeyword = record.userName;
    dlspcjsbglRegisterVm.lastUserId = record.userId;

    dlspcjsbglRegisterVm.defaultAllot = 'null';
    dlspcjsbglRegisterVm.defaultAllot = record.userId;

    dlspcjsbglRegisterVm.orgCode = record.orgCode;
    dlspcjsbglRegisterVm.orgId = record.orgId;
    dlspcjsbglRegisterVm.orgName = record.orgName;
    dlspcjsbglRegisterVm.orgPath = record.orgPath;

    dlspcjsbglRegisterVm.selectedParentDeviceId = record.parentGbcode;
    dlspcjsbglRegisterVm.registerTime = record.registerTime;
    dlspcjsbglRegisterVm.status = record.status;

    dlspcjsbglRegisterVm.modifyId = record.id;

    if (record.userId) {
        let url = '/gmvcs/uap/user/findById/' + record.userId;
        sbzygl.ajax(url).then(result => {
            if (result.code == 0) {
                dlspcjsbglRegisterVm.allotOrgName = result.data.org.orgName;
                dlspcjsbglRegisterVm.allotOrgId = result.data.org.orgId;
                dlspcjsbglRegisterVm.lastOrgName = result.data.org.orgName;
                dlspcjsbglRegisterVm.lastOrgId = result.data.org.orgId;
            } else {
                dlspcjsbglRegisterVm.allotOrgName = record.orgName;
                dlspcjsbglRegisterVm.allotOrgId = record.orgId;
                dlspcjsbglRegisterVm.lastOrgName = record.orgName;
                dlspcjsbglRegisterVm.lastOrgId = record.orgId;
            }
            fetchAllotByOrgId(dlspcjsbglRegisterVm, dlspcjsbglRegisterVm.lastUserId);
        });
    } else {
        dlspcjsbglRegisterVm.allotOrgName = record.orgName;
        dlspcjsbglRegisterVm.allotOrgId = record.orgId;
        dlspcjsbglRegisterVm.lastOrgName = record.orgName;
        dlspcjsbglRegisterVm.lastOrgId = record.orgId;
        fetchAllotByOrgId(dlspcjsbglRegisterVm, dlspcjsbglRegisterVm.lastUserId);

    }

});

//采集站定向升级弹窗vm定义
const dialogDirectVm = avalon.define({
    $id: 'zfygl-direct-vm',
    show: false,
    $form: createForm(),
    deviceLoading: true,
    modelLoading: true,
    manufacturerOptions: [],
    defaultManufacturer: "",
    orgData: [],
    orgId: "",
    orgCode: "",
    orgPath: "",
    orgName: "",
    deviceOptions: [],
    modelOptions: [],
    isDeviceAllchecked: false,
    checkedDevice: [],
    checkedModel: [],
    allDeviceGbcode: [], //提前保存所有采集站的gbcode,这样全选的时候直接赋值即可，而不用一个一个push
    $computed: {
        okDisabled: function () {
            return !(this.checkedDevice.length && this.checkedModel.length);
        }
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
        this.isDeviceAllchecked = false;
        this.checkedDevice.clear();
        this.deviceOptions.clear();
        this.fetchWsList();
    },
    handleAllDeviceSelect(event) {
        this.checkedDevice.clear();
        if (this.isDeviceAllchecked) {
            $.each($('.device-check'), (index, el) => {
                $(el).prop('checked', true);
                let $eleLabel = $(el).siblings('.select-label').removeClass('check_unselected').addClass('check_selected');
            })
            this.checkedDevice = this.allDeviceGbcode.slice();
        } else {
            $.each($('.device-check'), (index, el) => {
                $(el).prop('checked', false);
                let $eleLabel = $(el).siblings('.select-label').removeClass('check_selected').addClass('check_unselected');
            })
        }
    },
    handleDeviceCheck(el, event) {
        let hasChecked = this.deviceOptions.filter((item) => {
            return item.checked;
        });
        this.checkedDevice = hasChecked;
        if (hasChecked.length === this.deviceOptions.length) {
            this.isDeviceAllchecked = true;
        } else {
            this.isDeviceAllchecked = false;
        }
    },
    handleManuChange(event) {
        this.checkedModel.clear();
        this.modelOptions.clear();
        this.fetchModelList(event.target.value)
    },
    handleModelCheck(event) {
        let hasChecked = this.modelOptions.filter((item) => {
            return item.checked;
        });
        this.checkedModel = hasChecked;
    },
    handleUpdate(e) {
        let data = {
            orgName: this.orgName,
            orgId: this.orgId,
            deviceIds: this.checkedDevice.$model,
            manufacturerName: this.$form.record.manufacturer,
            models: this.checkedModel.$model,
            updateWay: 2,
        }
        let url = '/gmvcs/uom/package/directionalUpdate';
        sbzygl.ajax(url, 'post', data).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('warn', result.msg);
                return;
            }
            dialogAllotTipVm.show = true;
            this.checkedDevice.clear();
            this.checkedModel.clear();
            this.isDeviceAllchecked = false;
            this.defaultManufacturer = "";
            this.deviceOptions.clear();
            this.modelOptions.clear();
            this.allDeviceGbcode.clear();
            $('.device-list,.model-list').html('');
            this.show = false;
        });

    },
    handleCancel(e) {
        this.checkedDevice.clear();
        this.checkedModel.clear();
        this.isDeviceAllchecked = false;
        this.defaultManufacturer = "";
        this.deviceOptions.clear();
        this.allDeviceGbcode.clear();
        this.modelOptions.clear();
        $('.device-list,.model-list').html('');
        this.show = false;
    },
    fetchWsList() {
        let url = '/gmvcs/uom/device/workstation/basicInfos/' + this.orgId;
        this.deviceLoading = true;
        sbzygl.ajax(url).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                this.deviceOptions.clear();
                this.allDeviceGbcode.clear();
                this.deviceLoading = false;
                return;
            } else if (!result.data || !result.data.tBasicInfos || !result.data.tBasicInfos.length) {
                this.deviceOptions.clear();
                this.allDeviceGbcode.clear();
                this.deviceLoading = false;
                return;
            }
            this.deviceOptions = result.data.tBasicInfos;
            //采集站过多时，使用avalon的ms-for非常卡 而且容易出现运行缓慢的提示
            let html = ``;
            for (let i = 0; i < this.deviceOptions.length; i++) {
                let el = this.deviceOptions[i];
                this.allDeviceGbcode[i] = el.gbcode; //ie下使用索引赋值比push操作性能好
                html += `<li>
                            <input type="checkbox" id="${'device'+i}" class="device-check" data-gbcode="${el.gbcode}">
                            <label for="${'device'+i}" class="select-label check_unselected"></label>
                            <label for="${'device'+i}" title="${el.name}">${el.name}</label>
                        </li>`;
            }
            $('.device-list').html('').append(html);
            $('.device-check').on('change', (event) => {
                let checked = event.target.checked;
                let gbcode = $(event.target).attr('data-gbcode');
                let $eleLabel = $(event.target).siblings('.select-label');
                $(event.target).blur();
                if (checked) {
                    $eleLabel.removeClass('check_unselected').addClass('check_selected');
                    this.checkedDevice.push(gbcode);
                } else {
                    $eleLabel.removeClass('check_selected').addClass('check_unselected');
                    this.checkedDevice.remove(gbcode);
                }
                if (this.checkedDevice.length === this.deviceOptions.length) {
                    this.isDeviceAllchecked = true;
                } else {
                    this.isDeviceAllchecked = false;
                }
            });
            this.deviceLoading = false;
        });
    },
    fetchModelList(dsjManufacturerId) {
        if (!dsjManufacturerId) {
            return;
        }
        this.modelLoading = true;

        deviceApi.getModel(dsjManufacturerId).then((result) => {
            if (result.code != 0) {
                this.modelOptions.clear();
                this.modelLoading = false;
                return;
            }

            //先过滤掉值为""的型号
            let validData = result.data.filter((item) => {
                return !!item;
            });

            this.modelOptions = validData;

            let html = ``;
            for (let i = 0; i < this.modelOptions.length; i++) {
                let el = this.modelOptions[i];
                html += `<li>
                            <input type="checkbox" id="${'model'+i}" class="model-check" data-value="${el}">
                            <label for="${'model'+i}" class="select-label check_unselected"></label>
                            <label for="${'model'+i}" title="${el}">${el}</label>
                        </li>`;
            }
            $('.model-list').html('').append(html);
            $('.model-check').on('change', (event) => {
                let checked = event.target.checked;
                let modelValue = $(event.target).attr('data-value');
                let $eleLabel = $(event.target).siblings('.select-label');
                $(event.target).blur();
                if (checked) {
                    $eleLabel.removeClass('check_unselected').addClass('check_selected');
                    this.checkedModel.push(modelValue);
                } else {
                    $eleLabel.removeClass('check_selected').addClass('check_unselected');
                    this.checkedModel.remove(modelValue);
                }
            })
            this.modelLoading = false;

        });

    }
});

function toEmpty(str) {
    if (!str || str == 'null') {
        return '';
    } else {
        return str;
    }
}

function createGbcode(orgCode, deviceType) {
    if (!deviceType) {
        return;
    }
    // if (orgCode.length < 8) {
    //     sbzygl.showTips('warning', '部门编号不足8位，不能自动生成国标编号');
    //     return;
    // }

    deviceApi.getGbCode(orgCode, deviceType).then((result) => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        } else if (!result.data) {
            sbzygl.showTips('error', '后台服务器生成国标编号发生错误');
            return;
        }
        dlspcjsbglRegisterVm.inputJson.gbcode = result.data;
        dlspcjsbglRegisterVm.validJson.gbcode = true;
    });
}

let platformGbcode = null;
let platformKey = null;
let platformTitle = null;
let pathIcon = '/static/image/tyywglpt/users.png';

// 获取本机平台信息

function getLocalPlatformInfo() {
    let url = '/gmvcs/uom/device/gb28181/v1/arch/getLocalPlatformInfo';
    ajax({
        url,
        method: 'get'
    }).then((result) => {
        if (result.code == 0) {
            let data = result.data;
            let keyItem = {
                key: data.path,
                deviceId: data.deviceId,
                path: data.path,
                title: data.name,
                icon: pathIcon,
                isParent: true,
                type: 'header',
                children: []
            };

            platformGbcode = result.data.deviceId;
            platformKey = result.data.path;
            platformTitle = result.data.name;
            // fetchTreeList({
            //     type: [],
            //     parentId: platformGbcode,
            //     page: 0,
            //     pageSize: 1000,
            //     isTree: true,
            //     treeItem: JSON.parse(JSON.stringify(keyItem))
            // });
        } else {
            notification.error({
                title: '温馨提示',
                message: '获取本机平台信息:' + result.msg
            });
        }
    });
}

getLocalPlatformInfo();

/**
 *
 *
 * @param {*} [type=null] BUSINESS_GROUP 业务分组 PLATFORM_DEVICE 平台 CIVIL 行政区划 VIRTUAL_ORGANIZATION 虚拟组织
 * @param {*} [localPlatform=1] localPlatform :0不限,1本域,2外域
 */
function fetchTreeList({
    type = null,
    parentId = null,
    param = {},
    page = 0,
    pageSize = 20,
    isTree = false,
    treeItem = {},
    localPlatform = 1
} = {}) {
    let url = '';
    let methods = '';
    let data = '';

    url = '/gmvcs/uom/device/gb28181/v1/arch/searchItem';
    methods = 'post';
    data = avalon.mix({}, {
            page,
            pageSize,
            parentId,
            type: type == 'BUSINESS_GROUP' ? [type, 'VIRTUAL_ORGANIZATION'] : avalon.isObject(type) ? type : [type],
            localPlatform
        },
        param
    );

    ajax({
            url,
            method: methods,
            data
        })
        .then((result) => {
            // 树
            if (isTree) {
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    return;
                }

                let data = [];
                data.push(treeItem);
                result.data.currentElements.forEach((item) => {
                    let keyItem = {
                        key: item.path,
                        deviceId: item.deviceId,
                        title: item.name,
                        icon: pathIcon,
                        isParent: true,
                        type: item.type,
                        path: item.path,
                        children: []
                    };
                    data[0].children.push(keyItem);
                });

                dlspcjsbglRegisterVm.data = data;
            }
        })
        .fail(() => {
            sbzygl.showTips('error', '请求失败');
        });
}

/**
 * 通过父设备和平台ID获取骨架项
 *
 * @param {*} [{
 *     parentId,
 *     page = 0,
 *     pageNum = vm.pagination.pageSize,
 *     isTree = false,
 *     treeId = null,
 *     treeNode = null,
 *     selectedKey = null
 * }={}]
 */
function archetypeItem({
    parentId,
    page = 0,
    pageNum = vm.pagination.pageSize,
    isTree = false,
    treeId = null,
    treeNode = null,
    selectedKey = null,
    selectedDatas = []
} = {}) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/archetypeItem?parentId=${parentId}&page=${page}&pageNum=${pageNum}&flag=false`;

    sbzygl
        .ajax(url)
        .then((result) => {
            // 树
            if (isTree) {
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    return;
                }

                let data = [];
                result.data.currentElements.forEach((item) => {
                    let keyItem = {
                        key: item.path,
                        deviceId: item.deviceId,
                        title: item.name,
                        icon: pathIcon,
                        isParent: true,
                        type: item.type,
                        checked: false,
                        children: []
                    };

                    data.push(keyItem);
                });

                selectedDatas.forEach((item) => {
                    data.forEach((val) => {
                        if (item == val.key) {
                            val.checked = true;
                        }
                    });
                });

                fetchWhenExpand(treeId, treeNode, selectedKey, data);

                return;
            }
        })
        .fail(() => {
            sbzygl.showTips('error', '请求失败');
        });
}

//逐级加载树
function fetchWhenExpand(treeId, treeNode, selectedKey, data) {
    let treeObj = $.fn.zTree.getZTreeObj(treeId);

    treeObj.addNodes(treeNode, data);
    if (selectedKey != treeNode.key) {
        let node = treeObj.getNodeByParam('key', selectedKey, treeNode);
        treeObj.selectNode(node);
    }
}

/**
 * 根据部门id查询配发对象
 * @param {vm} dialogVm 
 * @param {String} lastUserId 执法仪上一次保存的配发对象的userId值
 */
function fetchAllotByOrgId(dialogVm, lastUserId) {
    let orgId = "";
    if (lastUserId && dialogVm.lastOrgId) {
        orgId = dialogVm.lastOrgId;
    } else {
        orgId = dialogVm.allotOrgId;
    }
    dialogVm.currentOrgId = orgId; //保存本次请求的orgId
    dialogVm.allotLoading = true;
    clearTimeout(dialogVm.pageTimer);
    dialogVm.allotOptions.clear();
    dialogVm.allotPageByOrg = 0;
    let url = '/gmvcs/uap/user/find/terminal/by/org?orgId=' + orgId;
    sbzygl.ajax(url).then(result => {
        //通过判断回调函数中访问到的orgId与当前的orgId即currentOrgId是否相同来确定是否为有效请求（利用闭包，回调函数执行时访问到的orgId是发生请求那一刻的值）
        //当数据量大的时候，请求返回需要一定的时间，而这段时间内若用户选择了另一个部门，那么又会发起另一个请求
        //那么前一次的请求的回调应该被阻止执行
        if (orgId != dialogVm.currentOrgId) {
            return;
        }
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return;
        } else if (result.data.length <= 0) {
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return
        }
        let options = [];
        let hasNullOptions = [];
        let indexs = [];
        let length = result.data.length;

        let timesTotal = Math.ceil(length / dialogVm.allotPageSize);
        let times = timesTotal;
        dialogVm.allotPageTotal = timesTotal;
        dialogVm.allotOptions = [{
            "label": '未配发',
            "value": "null",
            "orgName": "",
            "orgId": "",
            "userName": "",
            "userCode": "",
            "userId": ""
        }];
        handleAllotByPage();
        //利用setTimeout，分批处理返回的数据（因为此处配发人员可能有成千上万）
        function handleAllotByPage() {
            dialogVm.pageTimer = setTimeout(handleAllotByPage, 0);
            let html = ``;
            let options = [];
            for (let i = (timesTotal - times) * dialogVm.allotPageSize; i < (timesTotal - times) * dialogVm.allotPageSize + dialogVm.allotPageSize; i++) {
                if (i >= length) {
                    break;
                }
                let el = result.data[i];
                let items = {
                    "label": el.userName + '(' + el.userCode + ')',
                    "value": el.uid,
                    "userName": el.userName,
                    "userCode": el.userCode,
                    "userId": el.uid
                };
                indexs[i] = items.value;
                options.push(items);
            }
            dialogVm.allotOptions = dialogVm.allotOptions.concat(options)

            if (times == 1) { //当times=1时，为最后一次处理
                dialogVm.findIndex = indexs;
                if (lastUserId && dialogVm.lastOrgId) { //当所选的该条数据已经配发过人员时，将defaultAllot置为空，以便默认选中已经配发过的这个人员
                    // dialogVm.defaultAllot = "";
                } else {
                    if (dialogVm.isSelect) { //当手动（非通过所属部门联动）选择了配发部门时，默认选中第一个具体的人员
                        dialogVm.defaultAllot = indexs[0];
                    } else { //通过所属部门联动了配发部门时，默认选中未配发
                        dialogVm.defaultAllot = dialogVm.allotOptions[0].value;
                    }
                }
                clearTimeout(dialogVm.pageTimer);
                dialogVm.allotPageByOrg = 1;
            } else {
                dialogVm.allotPageByOrg = times;
            }
            times--;
        }

    });
}

/**
 * 查询配发对象
 * @param {vm} dialogVm 
 * @param {String} lastUserId 执法仪上一次保存的配发对象的userId值
 * @param {Boolean} isDebounce 是否为去抖调用
 */
function fetchAllot(dialogVm, lastUserId, isDebounce) {
    if (lastUserId) {
        dialogVm.inputJson.allotKeyword = dialogVm.lastAllotKeyword;
    }
    let keyword = $.trim(dialogVm.inputJson.allotKeyword);
    let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{2,20}$/
    if (keyword == "") {
        if (!isDebounce) {
            dialogVm.validJson.allotKeyword = false;
        }
        dialogVm.allotOptions.clear();
        dialogVm.allotLoading = false;
        return;
    }
    if (!reg.test(keyword)) {
        dialogVm.validJson.allotKeyword = false;
        dialogVm.allotOptions.clear();
        dialogVm.allotLoading = false;
        return;
    }
    dialogVm.validJson.allotKeyword = true;
    dialogVm.allotLoading = true;
    clearTimeout(dialogVm.pageTimer);
    dialogVm.allotOptions.clear();
    dialogVm.allotPageQuery = 0;
    let url = '/gmvcs/uap/user/findByTerminalUserNameOrUserCode';
    let data = {
        // "orgId": orgIdWithUser,
        "key": keyword
    }
    sbzygl.ajax(url, 'post', data).then(result => {
        //通过判断回调函数中访问到的keyword与当前的keyword即allotKeyword是否相同来确定是否为有效请求（利用闭包，回调函数执行时访问到的keyword是发生请求那一刻的值）
        //当数据量大的时候，请求返回需要一定的时间，而这段时间内若用户输入了其他关键字并发起请求，那么前一次的请求的回调应该被阻止执行
        if (keyword != dialogVm.inputJson.allotKeyword) {
            return;
        }
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return;
        } else if (result.data.length === 0) {
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return;
        }
        let options = [];
        let hasNullOptions = [];
        let indexs = [];
        let length = result.data.length;

        let timesTotal = Math.ceil(length / dialogVm.allotPageSize);
        let times = timesTotal;
        dialogVm.allotPageTotal = timesTotal;
        dialogVm.allotOptions = [{
            "label": '未配发',
            "value": "null",
            "orgName": "",
            "orgId": "",
            "userName": "",
            "userCode": "",
            "userId": ""
        }];
        handleAllotByPage();

        //利用setTimeout，分批处理返回的数据（因为此处配发人员可能有成千上万）
        function handleAllotByPage() {
            dialogVm.pageTimer = setTimeout(handleAllotByPage, 0);
            let html = ``;
            let options = [];
            for (let i = (timesTotal - times) * dialogVm.allotPageSize; i < (timesTotal - times) * dialogVm.allotPageSize + dialogVm.allotPageSize; i++) {
                if (i >= length) {
                    break;
                }
                let el = result.data[i];
                let items = {
                    "label": el.userName + '(' + el.userCode + ')',
                    "value": el.userId,
                    "orgName": el.orgName,
                    "orgId": el.orgId,
                    "userName": el.userName,
                    "userCode": el.userCode,
                    "userId": el.userId
                };
                indexs.push(items.value);
                options.push(items);
            }
            dialogVm.allotOptions.pushArray(options)
            if (times == 1) { //当times=1时，为最后一次处理
                dialogVm.findIndex = indexs;
                if (lastUserId) { //当所选的该条数据已经配发过人员时，将defaultAllot置为空，以便默认选中已经配发过的这个人员
                    dialogVm.defaultAllot = "";
                } else {
                    dialogVm.defaultAllot = indexs[0];
                }
                dialogVm.allotPageQuery = 1;
                clearTimeout(dialogVm.pageTimer);
            } else {
                dialogVm.allotPageQuery = times;
            }
            times--;
        }
    });
}