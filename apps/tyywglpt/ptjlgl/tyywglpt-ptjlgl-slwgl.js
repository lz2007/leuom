import ajax from '/services/ajaxService';
import Sbzygl from '/apps/common/common-sbzygl';
import * as menuServer from '/services/menuService';
import '/apps/common/common-ms-ztree/common-ms-ztree';
import '/apps/common/common-tyywglpt.css';
import './tyywglpt-ptjlgl-slwgl.less'
import '/apps/common/common-ms-table/common-ms-table';
import {
    isDevice,
    orgIcon
} from "/apps/common/common-gb28181-tyywglpt-device-type";

import {
    distinct
} from "/apps/common/common-sszh-new-sidebar/common-used";

import {
    createForm,
    message
} from 'ane';
import jQuery from 'jquery';
global.$ = global.jQuery = jQuery;

let sbzygl = null;
let vm = null;
export let name = 'tyywglpt-ptjlgl-slwgl';

//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-ptjlgl-slwgl.html'),
    defaults: {
        $id: 'ptjlgl0-slwgl-vm',
        authority: {
            DELETE: false, //设备资源管理_多路视频采集设备管理_删除
            MODIFY: false, //设备资源管理_多路视频采集设备管理_修改
            SAVE: false, //设备资源管理_多路视频采集设备管理_注册
            STATUS: false, //设备资源管理_多路视频采集设备管理_停用
            STGL: false //设备资源管理_多路视频采集设备管理_视图管理
        },
        $form: createForm(),
        name: '',
        uid: '',
        defaultManu: '',
        manuOptions: [],
        defaultProtocol: '',
        protocolOptions: [],
        parentId: '',
        platformId: '',
        treeParentId: '',
        defaultTreePath: '',
        defaultrid: '',
        rid: '',
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            // console.log(keyCode);
            if (keyCode == 13) {
                this.query();
            }
            // if (this.authority.SEARCH && keyCode == 13) {
            //     this.query();
            // } else if (keyCode === 32 && event.target.selectionStart === 0) {
            //     return false;
            // }
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
            $(event.target).siblings('input').focus()
        },

        // 查询
        query() {
            let record = this.$form.record;
            let param = {
                id: this.uid ? this.uid : null,
                name: this.name ? this.name : null,
                // type: record.type ? record.type : null,
                manufacturer: record.manufacturer ? record.manufacturer : null,
                protocol: record.protocol ? record.protocol : null
            }
            this.pagination.current = 1;
            fetchList(param);
        },
        loading: true,
        //本级平台信息
        // localPlat_list: [],
        // 表格
        list: [],
        // 表格-操作回调
        actions(type, text, record, index) {
            if (type == 'delete') {
                this.list.removeAll(el => el.id == record.id);
                message.success({
                    content: '删除成功'
                });
            }
        },

        selectedRowsLength: 0,
        checkedData: [],
        handelSelectItem(el, index, event) {
            this.checkedData = el;
            // console.log(el, this.checkedData);
            // console.log(this.localPlat_list);
            //本级平台测试数据
            // this.checkedData["local_name"] = this.localPlat_list.owner;
            // this.checkedData["local_ip"] = this.localPlat_list.ip;
            // this.checkedData["local_id"] = this.localPlat_list.deviceId;
            // this.checkedData["local_port"] = this.localPlat_list.port;
            // this.checkedData["local_description"] = this.localPlat_list.description;

            this.selectedRowsLength = 1;
            let currentTarget = event.currentTarget;
            for (var i = 0; i < $('.card_li .card').length; i++) {
                if ($('.card_li .card')[i] === currentTarget) {
                    continue;
                }
                $($('.card_li .card')[i]).removeClass('active');
            }
            // $(currentTarget).addClass('active');
            $(currentTarget).toggleClass("active");
            let active_num = 0;
            for (var i = 0; i < $('.card_li .card').length; i++) {
                if ($($('.card_li .card')[i]).hasClass('active')) {
                    active_num++;
                }
            }
            if (active_num == 0) {
                this.checkedData = [];
                this.selectedRowsLength = 0;
            }
        },
        deleteSelectItem(event) {
            // console.log(event);
            for (var i = 0; i < $('.card_li .card').length; i++) {
                $($('.card_li .card')[i]).removeClass('active');
            }
            this.checkedData = [];
            this.selectedRowsLength = 0;
        },
        // 表格-选择回调
        selectChange(type, data) {
            this.checkedData = [];
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].checked) {
                    this.checkedData.push(this.list[i]);
                }
            }

            let len = this.checkedData.length;
            if (len) {
                if (len == 1) {
                    this.selectedRowsLength = 1;
                } else {
                    this.selectedRowsLength = 2;
                }
            } else {
                this.selectedRowsLength = -1;
            }
        },

        // 分页
        pagination: {
            total: 0,
            pageSize: 20,
            current: 1
        },
        getCurrent(current) {
            this.pagination.current = current;
            fetchList();
        },
        slwglTableHeight: 0,
        setslwglTableHeight() {
            this.slwglTableHeight = $(window).height() - 405;
        },
        onScrollw() {
            $(window).off('resize').on('resize', () => {
                this.setslwglTableHeight();
            });
        },
        onInit() {
            this.accessControl();
        },
        onReady() {
            sbzygl = new Sbzygl(this);
            vm = this;
            this.setslwglTableHeight();
            this.onScrollw();
            fetchList();
            // fetchDownData('LEVAM_UOM_PLATFORM_TYPE', 'typeOptions', 'defaultType');
            fetchDownData('LEVAM_UOM_PLATFORM_TYPE_UP', 'typeOptions', 'defaultType');
            fetchDownData('LEVAM_UOM_PLATFORM_MAN', 'manuOptions', 'defaultManu');
            fetchDownData('LEVAM_UOM_PLATFORM_PROTOCOL', 'protocolOptions', 'defaultProtocol');
            getLocalPlatformInfo();
        },
        // 按钮权限控制
        accessControl() {
            let _this = this;

            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];

                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_PTJLGL_UP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_PTJLGL_UP_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_UP_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_UP_SAVE":
                            _this.authority.SAVE = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_UP_STOP":
                            _this.authority.STATUS = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_UP_STGL":
                            _this.authority.STGL = true;
                            break;
                    }
                });
            });
        },

        // 按钮
        // 新增
        handleAdd(event) {
            event.stopPropagation();
            if (this.selectedRowsLength > 0) {
                return;
            }
            dialogAddVm.inputJson = {
                "local_name": "",
                "local_id": "",
                "local_ip": "",
                "local_port": "",
                "local_description": "",
                "name": "",
                "id": "",
                "ip": "",
                "port": "",
                "version": "",
                "description": "",
            }
            dialogAddVm.validJson = {
                "local_name": true,
                "local_id": true,
                "local_ip": true,
                "local_port": true,
                "local_description": true,
                "name": true,
                "type": true,
                "manufacturer": true,
                "protocol": true,
                "id": true,
                "version": true,
                "description": true,
                "ip": true,
                "port": true,
            }
            dialogAddVm.showJson = {
                "local_id": false,
                "local_ip": false,
                "local_port": false,
                "id": false,
                "version": false,
                "ip": false,
                "port": false,
            }
            dialogAddVm.defaultType = dialogAddVm.typeOptions.length > 0 ? dialogAddVm.typeOptions[0].value : "";
            dialogAddVm.defaultManu = dialogAddVm.manuOptions.length > 0 ? dialogAddVm.manuOptions[0].value : "";
            dialogAddVm.defaultProtocol = dialogAddVm.protocolOptions.length > 0 ? dialogAddVm.protocolOptions[0].value : "";
            createPlatformId();
            dialogAddVm.show = true;
        },

        // 修改
        handleModify(event) {
            event.stopPropagation();
            if (this.selectedRowsLength !== 1) {
                return;
            }
            this.checkedData.relPlatform.description = this.checkedData.relPlatform.description.replace(/<br\/>/g, "\n");
            if (this.checkedData.localPlaform) {
                this.checkedData.localPlaform.description = this.checkedData.localPlaform.description.replace(/<br\/>/g, "\n");
            }
            let selectedData = this.checkedData;
            // console.log(selectedData,selectedData.localPlaform);
            if (selectedData.localPlaform) {
                // console.log('not null');
                dialogModifyVm.hasLocalData = true;
                dialogModifyVm.inputJson = {
                    "local_name": selectedData.localPlaform.name,
                    "local_id": selectedData.localPlaform.id,
                    "local_ip": selectedData.localPlaform.ip,
                    "local_port": selectedData.localPlaform.port,
                    "local_description": selectedData.localPlaform.description,
                    "name": selectedData.relPlatform.name,
                    "id": selectedData.relPlatform.id,
                    "ip": selectedData.relPlatform.ip,
                    "port": selectedData.relPlatform.port,
                    "version": selectedData.relPlatform.version,
                    "description": selectedData.relPlatform.description
                }
            } else {
                // console.log('null');
                dialogModifyVm.hasLocalData = false;
                dialogModifyVm.inputJson = {
                    "local_name": "",
                    "local_id": "",
                    "local_ip": "",
                    "local_port": "",
                    "local_description": "",
                    "name": selectedData.relPlatform.name || "",
                    "id": selectedData.relPlatform.id || "",
                    "ip": selectedData.relPlatform.ip || "",
                    "port": selectedData.relPlatform.port || "",
                    "version": selectedData.relPlatform.version || "",
                    "description": selectedData.relPlatform.description || ""
                }
            }

            dialogModifyVm.defaultType = selectedData.relPlatform.type || "";
            dialogModifyVm.defaultManu = selectedData.relPlatform.manufacturer || "";
            dialogModifyVm.defaultProtocol = selectedData.relPlatform.protocol || "";
            dialogModifyVm.unMatchJson = {
                "type": selectedData.relPlatform.type || "",
                "manu": selectedData.relPlatform.manufacturer || "",
                "protocol": selectedData.relPlatform.protocol || ""
            }
            // console.log(dialogModifyVm.inputJson);
            if (!selectedData.localPlaform) {
                createPlatformId('modify');
            }
            dialogModifyVm.show = true;
        },
        // 停用
        handleDisable(event) {
            if (this.selectedRowsLength == 0) {
                return false;
            }
            event.stopPropagation();
            DisableVm.selectedData = this.checkedData;
            DisableVm.show = true;
            // console.log(DisableVm.selectedData);
        },

        // 删除
        handleDelete() {
            if (this.selectedRowsLength < 1) {
                return;
            }
            let deviceRidArr = [];
            avalon.each(this.checkedData, (index, el) => {
                deviceRidArr.push(el.rid);
            })
            dialogDelVm.deviceRids = deviceRidArr.join(',');
            dialogDelVm.show = true;
        },
        // 批量删除
        handleBatchDelete() {
            this.handleDelete();
        },

        // 视图
        handleView(event) {
            event.stopPropagation();
            dialogViewVm.show = true;
        }
    }
});

//删除弹窗vm定义
let dialogDelVm = avalon.define({
    $id: 'ptjlgl-slwgl-delete-vm',
    show: false,
    deviceRids: [],
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let url = '/gmvcs/uom/platform/delete/' + this.deviceRids;
        sbzygl.ajax(url, 'post', null).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            let rowsLength = $('.tyywglpt-list-content>li').length;
            this.show = false;
            sbzygl.showTips('success', '删除成功');
            if ((rowsLength == vm.selectedRowsLength || rowsLength == 1) && vm.current > 1) {
                vm.current = vm.current - 1;
            }
            fetchList();
        })
    }
});

//是否停用弹窗
let DisableVm = avalon.define({
    $id: 'ptjlgl-slwgl-Disable-vm',
    show: false,
    selectedData: {},
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let status = 0;
        if (this.selectedData.relPlatform.status == 0) {
            status = 1;
        }
        changestatus(this.selectedData.relPlatform.id, status).then(result => {
            if (result.code == 0) {
                fetchList();
                if (this.selectedData.relPlatform.status == 0) {
                    sbzygl.showTips('success', '启用成功');
                    return;
                }
                sbzygl.showTips('success', '停用成功');
            } else {
                sbzygl.showTips('error', result.msg);
            }
        }).always(() => {
            this.handleCancel();
        });
    }
});

/**
 *启用停用
 *
 * @param {*} id 平台id ,
 * @param {*} status 状态:1 启动 0 停用
 */
function changestatus(id, status) {
    return sbzygl.ajax('/gmvcs/uom/platform/relation/changestatus', 'post', {
        id,
        status
    });
}

//添加弹窗vm定义
let dialogAddVm = avalon.define({
    $id: 'ptjlgl-slwgl-add-vm',
    show: false,
    $form: createForm({
        onFieldsChange(fields, record) {
            // 平台类型
            if (record.type) {
                dialogAddVm.validJson.type = true;
            } else {
                dialogAddVm.validJson.type = false;
            }

            // 平台厂商:
            if (record.manufacturer) {
                dialogAddVm.validJson.manufacturer = true;
            } else {
                dialogAddVm.validJson.manufacturer = false;
            }

            //  对接协议
            if (record.protocol) {
                dialogAddVm.validJson.protocol = true;
            } else {
                dialogAddVm.validJson.protocol = false;
            }

        }
    }),
    typeOptions: [],
    manuOptions: [],
    protocolOptions: [],
    validFail: [],
    defaultType: "",
    defaultManu: "",
    defaultProtocol: "",
    nameReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, //禁止特殊字符的必填项
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    portReg: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
    versionReg: /^[a-zA-Z0-9-\._]+$/,
    idReg: /^[a-zA-Z0-9]+$/,
    descriptionReg: /(.|\n)+/,
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "local_name": "",
        "local_id": "",
        "local_ip": "",
        "local_port": "",
        "local_description": "",
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    },
    validJson: {
        "local_name": true,
        "local_id": true,
        "local_ip": true,
        "local_port": true,
        "local_description": true,
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    },
    showJson: {
        "local_id": false,
        "local_ip": false,
        "local_port": false,
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleCancel(e) {
        this.clear = !this.clear;
        this.show = false;
    },
    handleOk() {
        // let url = '/gmvcs/uom/platform/add';
        let url = '/gmvcs/uom/platform/relation/add';
        addOrModify(url, dialogAddVm, '添加成功')
    },
});

dialogAddVm.$watch('clear', (v) => {
    dialogAddVm.inputJson = {
        "local_name": "",
        "local_id": "",
        "local_ip": "",
        "local_port": "",
        "local_description": "",
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    }
    dialogAddVm.validJson = {
        "local_name": true,
        "local_id": true,
        "local_ip": true,
        "local_port": true,
        "local_description": true,
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    }
    dialogAddVm.showJson = {
        "local_id": false,
        "local_ip": false,
        "local_port": false,
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    }
    dialogAddVm.defaultType = "";
    dialogAddVm.defaultManu = "";
    dialogAddVm.defaultProtocol = "";
})

//修改弹窗vm定义
let dialogModifyVm = avalon.define({
    $id: 'ptjlgl-slwgl-modify-vm',
    show: false,
    $form: createForm(),
    typeOptions: [],
    manuOptions: [],
    protocolOptions: [],
    validFail: [],
    defaultType: "",
    defaultManu: "",
    defaultProtocol: "",
    nameReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, //禁止特殊字符的必填项
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    portReg: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
    versionReg: /^[a-zA-Z0-9-\._]+$/,
    descriptionReg: /(.|\n)+/,
    hasLocalData: true,
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "local_name": "",
        "local_id": "",
        "local_ip": "",
        "local_port": "",
        "local_description": "",
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    },
    validJson: {
        "local_name": true,
        "local_id": true,
        "local_ip": true,
        "local_port": true,
        "local_description": true,
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    },
    showJson: {
        "local_id": false,
        "local_ip": false,
        "local_port": false,
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    },
    unMatchJson: {
        "type": "",
        "manu": "",
        "protocol": "",
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleCancel(e) {
        vm.checkedData.relPlatform.description = vm.checkedData.relPlatform.description.replace(/\n/g, "<br/>");
        if (vm.checkedData.localPlaform) {
            vm.checkedData.localPlaform.description = vm.checkedData.localPlaform.description.replace(/\n/g, "<br/>");
        }
        this.clear = !this.clear;
        this.show = false;
    },
    handleOk() {
        // let url = '/gmvcs/uom/platform/modify';
        let url = '/gmvcs/uom/platform//relation/modify';
        addOrModify(url, dialogModifyVm, '修改成功', vm.checkedData)
    },
});

dialogModifyVm.$watch('clear', (v) => {
    dialogModifyVm.inputJson = {
        "local_name": "",
        "local_id": "",
        "local_ip": "",
        "local_port": "",
        "local_description": "",
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    }
    dialogModifyVm.validJson = {
        "local_name": true,
        "local_id": true,
        "local_ip": true,
        "local_port": true,
        "local_description": true,
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    }
    dialogModifyVm.showJson = {
        "local_id": false,
        "local_ip": false,
        "local_port": false,
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    }
    dialogModifyVm.defaultType = "";
    dialogModifyVm.defaultManu = "";
    dialogModifyVm.defaultProtocol = "";
});

//视图管理弹窗vm定义
let dialogViewVm = avalon.define({
    $id: 'ptjlgl-slwgl-view-vm',
    show: false,
    handleCancel(e) {
        if (this.isAjax) {
            sbzygl.showTips('info', '数据提交中,请稍后...');
            return;
        }
        this.show = false;
        $.mask_close_all();
    },
    isAjax: false,
    handleOk() {
        if (this.isAjax) {
            sbzygl.showTips('info', '数据提交中,请稍后...');
            return;
        }
        this.isAjax = true;
        $.mask_element('#ptjlgl-slwgl-modal-view', '数据提交中,请稍后...');

        // 业务分组
        let ywfzTreeObj = $.fn.zTree.getZTreeObj('slwg-ywfz-View');
        let ywfzTreeNodes = [];

        if (ywfzTreeObj && this.viewSelected) {
            // ywfzTreeNodes = ywfzTreeObj.getChangeCheckedNodes();
            ywfzTreeNodes = ywfzTreeObj.transformToArray(ywfzTreeObj.getNodes());
        }

        // 行政区划
        let xzqhTreeObj = $.fn.zTree.getZTreeObj('slwg-xzqh-View');
        let xzqhTreeNodes = [];

        if (xzqhTreeObj && !this.viewSelected) {
            // xzqhTreeNodes = xzqhTreeObj.getChangeCheckedNodes();
            xzqhTreeNodes = xzqhTreeObj.transformToArray(xzqhTreeObj.getNodes());
        }

        let addViewPathList = [];
        let deleteViewPathList = [];
        let ExcludeViewPathList = [];

        ywfzTreeNodes.forEach(item => {
            let checkStatus = item.getCheckStatus();
            if (checkStatus.checked != item.checkedOld || checkStatus.half != item.halfCheckOld) {
                if (checkStatus.checked && !checkStatus.half) {
                    var flab = ExcludeViewPathList.some(v => {
                        return v == item.key;
                    });

                    if (!flab) {
                        addViewPathList.push(item.key);
                    }

                    // 是否部门
                    if (item.icon == orgIcon) {
                        if (item.children && item.children.length) {
                            item.children.forEach(childItem => {
                                ExcludeViewPathList.push(childItem.key);
                            });
                        }
                    }
                }

                if (!checkStatus.checked) {
                    deleteViewPathList.push(item.key);
                }
            }
        });

        xzqhTreeNodes.forEach(item => {
            let checkStatus = item.getCheckStatus();
            if (checkStatus.checked != item.checkedOld || checkStatus.half != item.halfCheckOld) {

                if (checkStatus.checked && !checkStatus.half) {
                    var flab = ExcludeViewPathList.some(v => {
                        return v == item.key;
                    });

                    if (!flab) {
                        addViewPathList.push(item.key);
                    }

                    // 是否部门
                    if (item.icon == orgIcon) {
                        if (item.children && item.children.length) {
                            item.children.forEach(childItem => {
                                ExcludeViewPathList.push(childItem.key);
                            });
                        }
                    }
                }

                if (!checkStatus.checked) {
                    deleteViewPathList.push(item.key);
                }
            }
        });

        // 去重
        addViewPathList = distinct(addViewPathList);
        deleteViewPathList = distinct(deleteViewPathList);

        let platformId = `/${vm.platformId}/`
        for (let index = 0; index < deleteViewPathList.length; index++) {
            const item = deleteViewPathList[index];
            if (item == platformId) {
                deleteViewPathList.splice(index, 1);
                break;
            }
        }

        // 释放内存
        ywfzTreeNodes = [];
        xzqhTreeNodes = [];

        if (!addViewPathList.length && !deleteViewPathList.length) {
            this.isAjax = false;
            this.handleCancel();
            sbzygl.showTips('success', '保存成功');
        } else {
            if (vm.checkedData.localPlaform) {
                let orgType = 0;
                if (this.viewSelected) {
                    orgType = 0;
                } else {
                    orgType = 1;
                }
                addViewItem(addViewPathList, deleteViewPathList, vm.checkedData.localPlaform.id, orgType);
            }
        }

        addViewPathList = [];
        deleteViewPathList = [];

    },
    data: [],
    data2: [],
    data3: [],
    setChkDisabled: false,
    setChkDisabled2: false,
    swichView: true,
    viewSelected: true,
    handleView(view) {
        // 业务分组
        let ywfzTreeObj = $.fn.zTree.getZTreeObj('slwg-ywfz-View');
        let ywfzTreeNodes = [];
        // 行政区划
        let xzqhTreeObj = $.fn.zTree.getZTreeObj('slwg-xzqh-View');
        let xzqhTreeNodes = [];
        switch (view) {
            case 'ywfz':
                if (xzqhTreeObj) {
                    xzqhTreeNodes = xzqhTreeObj.getChangeCheckedNodes();

                    if (xzqhTreeNodes.length) {
                        // 行政区划已编辑过
                        sbzygl.showTips('info', '行政区划已编辑过,暂不能选择');
                        this.setChkDisabled = true;
                        this.setChkDisabled2 = false;
                        let nodes = ywfzTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            ywfzTreeObj.setChkDisabled(nodes[i], true, true, true);
                        }
                    } else {
                        let nodes = xzqhTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            xzqhTreeObj.setChkDisabled(nodes[i], false, true, true);
                        }
                        this.setChkDisabled = false;
                        this.setChkDisabled2 = false;
                    }
                }

                this.viewSelected = true;
                break;
            case 'xzqh':
                this.viewSelected = false;
                if (ywfzTreeObj) {
                    ywfzTreeNodes = ywfzTreeObj.getChangeCheckedNodes();


                    if (ywfzTreeNodes.length) {
                        // 业务分组已编辑过
                        sbzygl.showTips('info', '业务分组已编辑过,暂不能选择');
                        this.setChkDisabled = false;
                        this.setChkDisabled2 = true;
                        let nodes = xzqhTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            xzqhTreeObj.setChkDisabled(nodes[i], true, true, true);
                        }
                    } else {
                        let nodes = ywfzTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            ywfzTreeObj.setChkDisabled(nodes[i], false, true, true);
                        }
                        this.setChkDisabled = false;
                        this.setChkDisabled2 = false;
                    }
                }

                break;
        }
    }
});

dialogViewVm.$watch('show', newShow => {
    if (newShow) {
        dialogViewVm.isAjax = false;
        dialogViewVm.swichView = true;
        dialogViewVm.viewSelected = true;
        dialogViewVm.setChkDisabled = false;
        dialogViewVm.setChkDisabled2 = false;
        if (vm.checkedData.localPlaform) {
            // 业务分组 、行政区划
            setTimeout(() => {
                $.mask_element('#ptjlgl-slwgl-modal-view', '数据处理中,请稍后...');
                $.when(getTopArchetypeInfo(0, vm.checkedData.localPlaform.id), getTopArchetypeInfo(1, vm.checkedData.localPlaform.id)).always(() => {
                    $.mask_close_all();
                }).fail(() => {
                    $.mask_close_all();
                });
            }, 150);
        }
    }
});

/**
 * 获取下拉框数据
 * @param {String} typeCode 字典类型
 * @param {String} optionsName 下拉框类型 -- typeOptions/manuOptions/protocolOptions
 * @param {String} defaultName 下拉框类型默认值类型 -- defaultType/defaultManu/defaultProtocol
 * LEVAM_UOM_PLATFORM_TYPE -- 平台类型
 * LEVAM_UOM_PLATFORM_MAN -- 平台厂商
 * LEVAM_UOM_PLATFORM_PROTOCOL -- 对接协议
 */
function fetchDownData(typeCode, optionsName, defaultName) {
    let url = '/gmvcs/uap/dic/findByDicTypeCode/' + typeCode + '?page=0&pageSize=10000';
    sbzygl.ajax(url).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            dialogAddVm[optionsName].clear();
            dialogModifyVm[optionsName].clear();
            return;
        } else if (!result.data.totalElements) {
            dialogAddVm[optionsName].clear();
            dialogModifyVm[optionsName].clear();
            return;
        }
        let options = [];
        let options_item_all = {
            "label": "不限",
            "value": ""
        }
        let search_options = [];
        search_options.push(options_item_all);
        let unDiscardedData = result.data.currentElements.filter((item) => {
            return !item.deleted;
        })
        avalon.each(unDiscardedData, (index, el) => {
            let item = {
                "label": el.name,
                // "value": optionsName == 'typeOptions' ? el.value : el.name
                "value": el.name
            };
            options.push(item);
            search_options.push(item);
        });
        vm[optionsName] = search_options;
        dialogAddVm[optionsName] = dialogModifyVm[optionsName] = options;
        dialogAddVm[defaultName] = dialogModifyVm[defaultName] = options.length ? options[0].value : "";
    });
}

//自动生成平台ID
function createPlatformId(isModify) {
    let url = '/gmvcs/uom/platform/id'
    if (isModify) {
        sbzygl.ajax(url).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg || '自动生成平台ID的过程出错');
                return;
            }
            dialogModifyVm.inputJson.local_id = result.data;
            dialogModifyVm.validJson.local_id = true;
        });
    } else {
        sbzygl.ajax(url).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg || '自动生成平台ID的过程出错');
                return;
            }
            dialogAddVm.inputJson.id = result.data;
            dialogAddVm.validJson.id = true;
        });
        sbzygl.ajax(url).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg || '自动生成平台ID的过程出错');
                return;
            }
            dialogAddVm.inputJson.local_id = result.data;
            dialogAddVm.validJson.local_id = true;
        });
    }

}

/**
 * 发送添加或修改请求
 * @param {string} url 添加或修改的请求地址
 * @param {vm} dialogVm 添加或修改弹窗的vm
 * @param {string} successMsg 请求成功后的提示消息
 */
function addOrModify(url, dialogVm, successMsg, selectedRowsData) {
    let record = JSON.parse(JSON.stringify(dialogVm.$form.record));
    let inputJson = sbzygl.trimData(dialogVm.inputJson);
    let pass = true;
    dialogVm.validFail = [];
    //这么写是为了兼容ie8
    let param = {
        "localPlatform": {
            "name": inputJson.local_name,
            "id": inputJson.local_id,
            "ip": inputJson.local_ip,
            "port": inputJson.local_port,
            "description": inputJson.local_description,
            "rid": ""
        },
        "relPlatform": {
            "id": inputJson.id,
            "ip": inputJson.ip,
            "port": inputJson.port,
            "name": inputJson.name,
            // "type": record.type,
            // "manufacturer": record.manufacturer,
            "type": typeof (record.type) == 'object' ? record.type.join() : record.type,
            "manufacturer": typeof (record.manufacturer) == 'object' ? record.manufacturer.join() : record.manufacturer,
            "version": inputJson.version,
            "description": inputJson.description,
            "protocol": record.protocol,
            "rid": ""
        }
    };
    if (dialogVm == dialogModifyVm) {
        // console.log(selectedRowsData);
        if (selectedRowsData.localPlaform) {
            param.localPlatform.rid = selectedRowsData.localPlaform.rid;
        } else {
            param.localPlatform.rid = "";
        }
        param.relPlatform.rid = selectedRowsData.relPlatform.rid;
    }
    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogVm.validJson, (key, value) => {
        // console.log(key);
        if (key == "local_name" || key == "local_ip" || key == "local_id" || key == "local_port" || key == "local_description") {
            // console.log(param["localPlatform"]);
            let key_new = key.split("_")[1];
            if (!param["localPlatform"][key_new] || !value) {
                // console.log(key_new)
                dialogVm.validFail.push(key);
                dialogVm.validJson[key] = false;
                pass = false;
            }
        } else {
            if (!param["relPlatform"][key] || !value) {
                dialogVm.validFail.push(key);
                dialogVm.validJson[key] = false;
                pass = false;
            }
        }

    });
    if (!pass) {
        let topArray = [];
        if (dialogVm == dialogAddVm) {
            for (var i = 0; i < dialogVm.validFail.length; i++) {
                topArray.push($('#ptjlgl-modal-add .' + dialogVm.validFail[i]).position().top);
            }
            var minTop = topArray[0];

            for (var j = 1; j < topArray.length; j++) {
                if (minTop > topArray[j]) {
                    minTop = topArray[j];
                }
            }
            $('#ptjlgl-modal-add').scrollTop(minTop);
        } else if (dialogVm == dialogModifyVm) {
            for (var i = 0; i < dialogVm.validFail.length; i++) {
                topArray.push($('#ptjlgl-modal-modify .' + dialogVm.validFail[i]).position().top);
            }
            var minTop = topArray[0];

            for (var j = 1; j < topArray.length; j++) {
                if (minTop > topArray[j]) {
                    minTop = topArray[j];
                }
            }
            $('#ptjlgl-modal-modify').scrollTop(minTop);
        }
        return;
    }
    param.localPlatform.port = Number(param.localPlatform.port);
    param.relPlatform.port = Number(param.relPlatform.port);
    //------------表单验证结束----------------------------------------------------------
    sbzygl.ajax(url, 'post', param).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg || result.data);
            return;
        }
        dialogVm.show = false;
        sbzygl.showTips('success', successMsg);
        dialogVm.clear = !dialogVm.clear;
        if (dialogVm == dialogAddVm) {
            vm.current = 1;
        }
        fetchList();
    })
}

//获取表格列表
function fetchList(param = {}) {
    // let url = '/gmvcs/uom/platform/list';
    let url = '/gmvcs/uom/platform/relation/list';
    let data = {
        direction: "LEVAM_UOM_PLATFORM_TYPE_UP",
        page: vm.pagination.current - 1,
        pageSize: vm.pagination.pageSize
    }
    avalon.mix(data, param);

    vm.checkAll = false;
    vm.selectedRowsLength = 0;
    vm.dataStr = JSON.stringify(data);
    vm.loading = true;
    sbzygl.ajax(url, 'post', data).then(result => {
        vm.loading = false;
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            vm.list = [];
            vm.pagination.total = 0;
            return;
        } else if (!result.data.totalElements) {
            vm.list = [];
            vm.pagination.total = 0;
            return;
        }
        avalon.each(result.data.currentElements, (index, el) => {
            el.checked = false
        });
        vm.list = [];
        vm.list = result.data.currentElements;
        avalon.each(vm.list, function (index, el) {
            if (vm.list[index].localPlaform) {
                vm.list[index].localPlaform.description = el.localPlaform.description.replace(/\n/g, "<br/>");
            }
            vm.list[index].relPlatform.description = el.relPlatform.description.replace(/\n/g, "<br/>");
        });
        vm.pagination.total = result.data.totalElements;
    }).fail(() => {
        vm.loading = false;
        vm.list = [];
        vm.pagination.total = 0;
    });
}

// 获取本机平台信息
function getLocalPlatformInfo() {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/getLocalPlatformInfo`;
    sbzygl.ajax(url).then(result => {
        if (result.code == 0) {
            // 业务分组 || 行政区划顶级骨架
            let data = result.data;
            // 父级 id
            vm.parentId = data.deviceId;
            vm.treeParentId = data.deviceId;
            vm.platformId = data.platformId;
            vm.defaultrid = data.rid;
            vm.rid = data.rid;
            vm.defaultTreePath = data.path;
        } else {
            sbzygl.showTips('error', result.msg);
        }
    });
}

// 获取顶级骨架
function getTopArchetypeInfo(orgType, superiorPlatformId) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/getTopArchetypeInfo?orgType=${orgType}&superiorPlatformId=${superiorPlatformId}`;
    sbzygl.ajax(url).then(result => {

        if (result.code == 0) {
            let data = result.data;
            let orgData = [];

            data.forEach(org => {
                let keyItem = {
                    key: org.path,
                    deviceId: org.deviceId,
                    path: org.path,
                    title: org.name,
                    name: org.name,
                    icon: isDevice(org.type, 1),
                    rid: org.rid,
                    parentRid: org.parentRid,
                    parentId: org.parentId,
                    civilCode: org.civilCode,
                    manufacturer: org.manufacturer,
                    model: org.model,
                    status: org.status,
                    platformId: org.platformId,
                    isParent: true,
                    type: 'header',
                    children: [],
                    orgCode: org.orgCode,
                    orgId: org.orgId,
                    orgName: org.orgName,
                    orgPath: org.orgPath,
                    createTime: org.createTime || '-',
                    createUser: org.createUser,
                    superiorPlatformId,
                    checked: org.check > 0 ? true : false,
                    checkedOld: org.check > 0 ? true : false,
                    halfCheck: org.check == 1 ? true : false,
                    halfCheckOld: org.check == 1 ? true : false
                }
                orgData.push(keyItem);
            });

            // 业务分组 || 行政区划顶级骨架
            if (orgType == 0) {
                dialogViewVm.data = [];
                dialogViewVm.data = orgData;
            } else {
                dialogViewVm.data2 = [];
                dialogViewVm.data2 = orgData;
            }
        } else {
            dialogViewVm.data = [];
            dialogViewVm.data2 = [];
            sbzygl.showTips('error', result.msg);
        }
    }).fail(() => {
        dialogViewVm.data = [];
        dialogViewVm.data2 = [];
    });
}

/**
 * 添加视图项和删除视图项
 *
 * @param {*} [addViewPathList=[]] 需要添加的视图节点路径列表 ,
 * @param {*} [deleteViewPathList=[]] 需要移除的视图节点路径列表 
 * @param {*} [platformId=null] 视图所属上级平台ID
 */
function addViewItem(addViewPathList = [], deleteViewPathList = [], platformId = null, orgType = 0) {
    let url = '/gmvcs/uom/device/gb28181/v1/view/addViewItemByNodes';
    ajax({
        url,
        method: 'post',
        data: {
            addViewPathList,
            deleteViewPathList,
            platformId,
            orgType
        }
    }).then(result => {
        if (result.code == 0) {
            sbzygl.showTips('success', '保存成功');
            dialogViewVm.show = false;
        } else {
            sbzygl.showTips('error', result.msg);
        }
    }).always(() => {
        $.mask_close_all();
        dialogViewVm.isAjax = false;
    }).fail(() => {
        dialogViewVm.isAjax = false;
    });
}