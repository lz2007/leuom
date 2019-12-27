import Sbzygl from '/apps/common/common-sbzygl';
import * as menuServer from '/services/menuService';
import '/apps/common/common-tyywglpt.css';
import './tyywglpt-ptjlgl-xlwgl.less'
import '/apps/common/common-ms-table/common-ms-table';
import {
    isDevice
} from "/apps/common/common-gb28181-tyywglpt-device-type";

import {
    createForm,
    message,
} from 'ane';
import jQuery from 'jquery';
global.$ = global.jQuery = jQuery;

let sbzygl = null;
let vm = null;
export let name = 'tyywglpt-ptjlgl-xlwgl';

//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-ptjlgl-xlwgl.html'),
    defaults: {
        $id: 'ptjlgl-xlwgl-vm',
        authority: {
            DELETE: false, //设备资源管理_多路视频采集设备管理_删除
            MODIFY: false, //设备资源管理_多路视频采集设备管理_修改
            SAVE: false, //设备资源管理_多路视频采集设备管理_注册
            STATUS: false //设备资源管理_多路视频采集设备管理_停用
        },
        $form: createForm(),
        name: '',
        uid: '',
        defaultType: '',
        typeOptions: [],
        defaultManu: '',
        manuOptions: [],
        protocolOptions: [],
        defaultProtocol: '',
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
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
            // console.log(record);
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
        // selectChange(type, data) {
        //     this.checkedData = [];

        //     for (let i = 0; i < this.list.length; i++) {
        //         if (this.list[i].checked) {
        //             this.checkedData.push(this.list[i]);
        //         }
        //     }

        //     let len = this.checkedData.length;
        //     if (len) {
        //         if (len == 1) {
        //             this.selectedRowsLength = 1;
        //         } else {
        //             this.selectedRowsLength = 2;
        //         }
        //     } else {
        //         this.selectedRowsLength = -1;
        //     }
        // },

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
        // 按钮权限控制
        accessControl() {
            let _this = this;

            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                console.log(menu);

                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_PTJLGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    
                    switch (v) {
                        case "UOM_FUNCTION_PTJLGL_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_SAVE":
                            _this.authority.SAVE = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_STOP":
                            _this.authority.STATUS = true;
                            break;
                    }
                });
            });
        },
        slwglTableHeight:0,
        setslwglTableHeight(){
            this.slwglTableHeight = $(window).height() - 405;
        },
        onScrollw(){
            $(window).off('resize').on('resize',()=>{
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
            // fetchDownData('LEVAM_UOM_PLATFORM_TYPE', 'typeOptions', 'defaultType', 'ready');
            fetchDownData('LEVAM_UOM_PLATFORM_TYPE_DOWN', 'typeOptions', 'defaultType', 'ready');
            fetchDownData('LEVAM_UOM_PLATFORM_MAN', 'manuOptions', 'defaultManu', 'ready');
            fetchDownData('LEVAM_UOM_PLATFORM_PROTOCOL', 'protocolOptions', 'defaultProtocol', 'ready');
            getLocalPlatformInfo();
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
            dialogAddVm.defaultCatalog = '0';
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
            let selectedData = this.checkedData;
            this.checkedData.relPlatform.description = this.checkedData.relPlatform.description.replace(/<br\/>/g, "\n");
           if (this.checkedData.localPlaform) {
            this.checkedData.localPlaform.description = this.checkedData.localPlaform.description.replace(/<br\/>/g, "\n");
           }
            // console.log(selectedData);
            if (selectedData.localPlaform) {
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
            dialogModifyVm.orgData = [];
            dialogModifyVm.status = selectedData.relPlatform.status || '1';
            dialogModifyVm.defaultCatalog = String(selectedData.relPlatform.gb28181ArchetypeType) || '0';

            if (dialogModifyVm.defaultCatalog == 0 || dialogModifyVm.defaultCatalog == '0') {
                dialogModifyVm.orgData = PlatformInfoTreeData;
                if (!PlatformInfoTreeData.length) {
                    sbzygl.showTips('info', '当账号没有业务分组的范围，不允许修改');
                    return;
                }
            } else {
                dialogModifyVm.orgData = PlatformInfoTreeData2;
                if (!PlatformInfoTreeData2.length) {
                    sbzygl.showTips('info', '当账号没有行政区划的范围，不允许修改');
                    return;
                }
            }

            if (dialogModifyVm.orgData.length) {
                dialogModifyVm.selectedKey = selectedData.relPlatform.gb28181ArchetypeRid || '';
                dialogModifyVm.selectedTitle = selectedData.relPlatform.gb28181ArchetypeName || '';
            } else {
                dialogModifyVm.selectedKey = '';
                dialogModifyVm.selectedTitle = '';
            }
            // console.log(dialogModifyVm.selectedKey);
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
        handleView() {
            if (this.selectedRowsLength !== 1) {
                return;
            }
            dialogOrderVm.show = true;
        }
    }
});

//删除弹窗vm定义
let dialogDelVm = avalon.define({
    $id: 'ptjlgl-xlwgl-delete-vm',
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
    $id: 'ptjlgl-xlwgl-Disable-vm',
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

//订阅弹窗vm定义
let dialogOrderVm = avalon.define({
    $id: 'ptjlgl-xlwgl-order-vm',
    show: false,
    title: '市执法视音频下联平台网关-订阅管理',
    deviceRids: [],
    checkedInfo: false,
    checkedGPS: false,
    checkedAll: false,
    selectedInfo() {
        this.checkedInfo = !this.checkedInfo;
    },
    selectedGPS() {
        this.checkedGPS = !this.checkedGPS
    },
    selectedAll() {
        this.checkedAll = !this.checkedAll;
        if (this.checkedAll) {
            this.checkedInfo = true;
            this.checkedGPS = true;
        } else {
            this.checkedInfo = false;
            this.checkedGPS = false;
        }
    },
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;
    }
});

//添加弹窗vm定义
let dialogAddVm = avalon.define({
    $id: 'ptjlgl-xlwgl-add-vm',
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
    defaultCatalog: '0',
    CatalogOptions: [{
            label: '业务分组',
            value: '0'
        },
        {
            label: '行政区划',
            value: '1'
        }
    ],
    onChangeCatalogOptions(e) {
        this.defaultCatalog = e.target.value;
        this.orgData = [];
        if (this.defaultCatalog == 0 || this.defaultCatalog == '0') {
            this.orgData = PlatformInfoTreeData;
        } else {
            this.orgData = PlatformInfoTreeData2;
        }

        if (this.orgData.length) {
            this.selectedKey = this.orgData[0].rid;
            this.selectedTitle = this.orgData[0].name;
        } else {
            this.selectedKey = '';
            this.selectedTitle = '';
        }
    },
    orgData: [],
    selectedKey: '',
    selectedTitle: '',
    handleTreeChange(e) {
        // console.log(e);
        this.selectedKey = e.node.rid;
        this.selectedTitle = e.node.name;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        // console.log(treeId, treeNode, selectedKey);
        // console.log(this.defaultCatalog);
        if (treeNode.children && treeNode.children.length > 0) {
            return;
        }
        let switchType = '';
        if (this.defaultCatalog == '0') {
            switchType = 'ywfz';
        } else {
            switchType = 'xzqu';
        }
        archetypeItem(treeId, treeNode, switchType, treeNode.superiorPlatformId);
    },
    status: '1',
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
    onChangeValue(target, type) {
        // console.log(target);
        // console.log(type);
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

dialogAddVm.$watch('show', (v) => {
    if (v) {
        dialogAddVm.orgData = [];
        dialogAddVm.orgData = PlatformInfoTreeData;
        if (dialogAddVm.orgData.length) {
            dialogAddVm.selectedKey = dialogAddVm.orgData[0].rid;
            dialogAddVm.selectedTitle = dialogAddVm.orgData[0].name;
        } else {
            dialogAddVm.selectedKey = '';
            dialogAddVm.selectedTitle = '';
        }
    }
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
    dialogAddVm.defaultCatalog = '0';
})

//修改弹窗vm定义
let dialogModifyVm = avalon.define({
    $id: 'ptjlgl-xlwgl-modify-vm',
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
    defaultCatalog: '0',
    CatalogOptions: [{
            label: '业务分组',
            value: '0'
        },
        {
            label: '行政区划',
            value: '1'
        }
    ],
    onChangeCatalogOptions(e) {
        this.defaultCatalog = e.target.value;
        this.orgData = [];
        if (this.defaultCatalog == 0 || this.defaultCatalog == '0') {
            this.orgData = PlatformInfoTreeData;
        } else {
            this.orgData = PlatformInfoTreeData2;
        }

        if (this.orgData.length) {
            this.selectedKey = this.orgData[0].rid;
            this.selectedTitle = this.orgData[0].name;
        } else {
            this.selectedKey = '';
            this.selectedTitle = '';
        }
    },
    orgData: [],
    selectedKey: "",
    selectedTitle: "",
    ishandleTreeChange: false,
    handleTreeChange(e) {
        // console.log(e);
        this.ishandleTreeChange = true;
        this.selectedKey = e.node.rid;
        this.selectedTitle = e.node.name;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        // console.log(treeId, treeNode, selectedKey);
        // console.log(this.defaultCatalog);
        if (treeNode.children && treeNode.children.length > 0) {
            return;
        }
        let switchType = '';
        if (this.defaultCatalog == '0') {
            switchType = 'ywfz';
        } else {
            switchType = 'xzqu';
        }
        archetypeItem(treeId, treeNode, switchType, treeNode.superiorPlatformId);
    },
    status: '1',
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
        let url = '/gmvcs/uom/platform/relation/modify';
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

    dialogModifyVm.ishandleTreeChange = false;
})

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
    let url = '/gmvcs/uap/dic/findByDicTypeCode/' + typeCode + '?page=0&pageSize=1000';
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
    let typeDesc = '';
    dialogVm.typeOptions.forEach(element => {
        if (element.value == record.type) {
            typeDesc = element.label;
        }
    });
    // console.log(record,inputJson);
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
            "type": typeof (record.type) == 'object' ? record.type.join() : record.type,
            "manufacturer": typeof (record.manufacturer) == 'object' ? record.manufacturer.join() : record.manufacturer,
            "version": inputJson.version,
            "description": inputJson.description,
            "protocol": typeof (record.protocol) == 'object' ? record.protocol.join() : record.protocol,
            "rid": "",
            "gb28181ArchetypeType": Number(record.Catalog[0]),
            "gb28181ArchetypeRid": dialogVm.selectedKey,
            "gb28181ArchetypeName": dialogVm.selectedTitle,
            // "gb28181ArchetypeRid": successMsg == '修改成功' ? (dialogVm.ishandleTreeChange ? dialogVm.selectedKey : dialogVm.selectedKeya) : dialogVm.selectedKey,
            // "gb28181ArchetypeName": successMsg == '修改成功' ? (dialogVm.ishandleTreeChange ? dialogVm.selectedTitle : dialogVm.selectedTitlea) : dialogVm.selectedTitle,
            "status": dialogVm.status
        }

    };

    if (!dialogVm.selectedKey) {
        return false;
    }

    if (dialogVm == dialogModifyVm) {
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
                // console.log(key);
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
        direction: "LEVAM_UOM_PLATFORM_TYPE_DOWN",
        page: vm.pagination.current - 1,
        pageSize: vm.pagination.pageSize
    }
    avalon.mix(data, param);
    // console.log(data);

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
let PlatformInfoTreeData = [];
let PlatformInfoTreeData2 = [];

function getLocalPlatformInfo() {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/getLocalPlatformInfo`;

    sbzygl.ajax(url).then(result => {
        if (result.code == 0) {
            let data = result.data;
            // 业务分组
            getTopArchetypeInfo(0,data.deviceId);
            // 行政区划
            getTopArchetypeInfo(1,data.deviceId);
        }
    });
}

// 获取顶级骨架
function getTopArchetypeInfo(orgType,superiorPlatformId) {
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
                    type: org.type,
                    children: [],
                    orgCode: org.orgCode,
                    orgId: org.orgId,
                    orgName: org.orgName,
                    orgPath: org.orgPath,
                    createTime: org.createTime || '-',
                    createUser: org.createUser,
                    superiorPlatformId
                }
                orgData.push(keyItem);
            });

            if (orgType == 0) {
                PlatformInfoTreeData = orgData;

            } else {
                PlatformInfoTreeData2 = orgData;
            }
            console.log(orgData);
        } else {
            sbzygl.showTips('error', result.msg);
        }
    });
}

// 当前登录用户根据父级节点获取子级信息，只获取下一级信息
function archetypeItem(treeId, treeNode, switchType, superiorPlatformId) {

    let url = `/gmvcs/uom/device/gb28181/v1/arch/getChildArchetypeInfo?id=${treeNode.rid}&superiorPlatformId=${superiorPlatformId}`;

    sbzygl.ajax(url).then(result => {

        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        }

        let data = handleToTreeData(result, treeNode, switchType);

        fetchWhenExpand(treeId, treeNode, data);
    });
}

/**
 *树节点处理
 *
 * @param {Array} responseData
 * @returns 返回标准树节点
 */
function handleToTreeData(responseData, treeNode, switchType) {
    let data = [];
    responseData.data.forEach(item => {
        let keyItem = {
            key: item.path,
            deviceId: item.deviceId,
            title: item.name,
            name: item.name,
            icon: isDevice(item.type, 1),
            rid: item.rid,
            parentRid: item.parentRid,
            parentId: item.parentId,
            isParent: true,
            type: item.type,
            path: item.path,
            checked: false,
            children: [],
            civilCode: item.civilCode,
            manufacturer: item.manufacturer,
            model: item.model,
            status: item.status,
            platformId: item.platformId,
            orgCode: item.orgCode,
            orgId: item.orgId,
            orgName: item.orgName,
            orgPath: item.orgPath,
            createTime: item.createTime,
            createUser: item.createUser,
            superiorPlatformId:treeNode.superiorPlatformId
        }

        data.push(keyItem);
    });

    if (switchType == 'ywfz') {
        data = data.filter(item => {
            return (item.type == "BUSINESS_GROUP" || item.type == "VIRTUAL_ORGANIZATION");
        });

    } else {
        data = data.filter(item => {
            return (item.type == "CIVIL");
        });
    }

    return data;
}

//逐级加载树
function fetchWhenExpand(treeId, treeNode, data, isAdd) {
    let treeObj = $.fn.zTree.getZTreeObj(treeId);
    treeObj.addNodes(treeNode, data);
    treeObj.selectNode(treeNode);
}