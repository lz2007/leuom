/*
 * @Description: 运维中心-办案区管理-办案区管理
 * @Author: chenjinxing
 * @Date: 2019-07-09 11:46:19
 * @LastEditTime: 2019-09-11 14:16:34
 * @LastEditors: Please set LastEditors
 */
import ajax from '/services/ajaxService.js';
import {
    createForm,
    notification
} from "ane";
import Sbzygl from '/apps/common/common-sbzygl';

import FaajValidate from '/apps/common/common-form-validate';
import moment from 'moment';
import * as menuServer from '/services/menuService';
const storage = require('/services/storageService.js').ret;

require('/apps/common/common-tyywglpt.css');
require('/apps/common/common-tyywglpt-ccfwgl.css');
let ec = require('echarts/dist/echarts.min');
require("./tyywglpt-ccfwgl-baqspccgl.less");
export const name = 'tyywglpt-ccfwgl-baqspccgl';
let searchResult = []; //存储所属机构搜索结果
let vm = null;
let isExist = false;
let timeObj = {}; //用于存储分析弹框中的时间
let sbzygl = new Sbzygl();
const listHeaderName = name + '-list-header';
let {
    prefixLevel,
    dep_switch,
    separator,
    apiUrl,
    isTableSearch
} = require('/services/configService');
const ccfwgl = avalon.component(name, {
    template: __inline('./tyywglpt-ccfwgl-baqspccgl.html'),
    defaults: {
        key_dep_switch: dep_switch,
        checkAll: false,
        checkBox: [], //存储已经选中的元素
        btnDisabled: true,
        loading: false,
        online: "在线",
        offline: "离线",
        noData: true, //获取列表没有数据
        tableData: [],
        editData: {},
        currentPage: 1, //主要用于查询时传给分页组件
        page: 1,
        pageSize: 20,
        orgData: [], //所属机构数据
        orgId: '', //外围所选所属机构id
        selectedTitle: '',
        orgPath: '',
        total: 0,
        checkedIsSource: false, //是否是平台级联数据
        storageJson: {},
        showServiceNameBelowTips: false,
        showIpBelowTips: false,
        showPortBelowTips: false,
        showPasswordBelowTips: false,
        showUploadPathBelowTips: false,
        showDownloadPathBelowTips: false,
        shownNormalDayBelowTips: false,
        showSpecialDayBelowTips: false,
        titleTimer: null,
        txt_configTest: "配置测试",
        authority: { // 按钮权限标识
            "CCCL": false, //存储服务管理_执法记录仪上传服务管理_存储策略
            "CCFX": false, //存储服务管理_执法记录仪上传服务管理_存储分析
            "ZFJLYFP": false, //存储服务管理_执法记录仪上传服务管理_执法记录仪分配
            "CHECK": false, //存储服务管理_执法记录仪上传服务管理_查看
            "DELETE": false, //存储服务管理_执法记录仪上传服务管理_删除
            "MODIFY": false, //存储服务管理_执法记录仪上传服务管理_修改
            "REGISTRY": false, //存储服务管理_执法记录仪上传服务管理_注册
            "SEARCH": false, //存储服务管理_执法记录仪上传服务管理_查询
            "SAVE": false, // 添加
            "BATCHDELETE": false, // 批量删除
            "OPT_SHOW": false //操作栏-显隐
        },
        //获取所属机构
        getSelected(key, title, node) {
            this.orgId = key;
            this.orgPath = node.path;
            this.selectedTitle = title;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgId = e.node.orgId;
            this.orgPath = e.node.path;
        },
        clearEdit() {
            this.editData = {};
        },
        //获取当前页码
        getCurrent(current) {
            vm.currentPage = current;
        },
        //点击查询，获取数据
        querySearch() {
            this.ajaxTableList(this.orgId);//取消2秒限制
            // timeLimitQuery(this.ajaxTableList.bind(this), 2000, [this.orgId]);
            vm.currentPage = 1;
            storage.setItem(name, {
                orgId: this.orgId,
                page: this.currentPage,
                orgPath: this.orgPath,
                selectedTitle: this.selectedTitle
            }, 0.5);
        },
        // BAZX_options:[],
        // onChangeBAZX(e) {
        //     let _this = this;
        //     _this.caseAreaId = e.target.value;
        // },
        // getCaseareaAll(userCode) {
        //     ajax({
        //         url: '/gmvcs/baq/case/getUserBaqInfo?userCode=' + userCode,
        //         // url: '/api/getUserBaqInfo',
        //         method: 'get',
        //         data: {}
        //     }).then(result => {
        //         if (result.code != 0) {
        //             showTips('error', '获取办案中心失败，请稍后再试');
        //             return;
        //         }
        //         if (result.code == 0) {
        //             let ret_data = [];
        //             if (result.data != null && result.data.length != 0) {
        //                 avalon.each(result.data, function (index, item) {
        //                     let ret_obj = {};
        //                     ret_obj.value = item.baqID;
        //                     ret_obj.label = item.baqName;
    
        //                     ret_data.push(ret_obj);
        //                 });
        //             }
        //             sbdjgl_vm.BAZX_options = ret_data;
        //             sbdjgl_vm.caseAreaId = ret_data[0].baqID||"";
        //             sbdjgl_vm.searchBtn();
        //         }
        //     });
        // },
        // extraExpandHandle:avalon.noop,
        // 部门的分级加载
        extraExpandHandle: function (treeId, treeNode, selectedKey, temparr, searchInputValue, orgIdArr) {
            // 分级获取部门
            getOrgbyExpand(treeNode.orgId, treeNode.checkType).then((ret) => {
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (ret.code == 0) {
                    if (treeNode.checked) {
                        //父节点勾选了，子节点跟着勾选
                        treeObj.addNodes(treeNode, changeTreeData(ret.data, 'check'));
                    } else {
                        treeObj.addNodes(treeNode, changeTreeData(ret.data));
                    }

                }
                if (searchInputValue) {
                    let nodes = treeObj.getNodesByFilter(function (node) {
                        if (searchInputValue && $.trim(searchInputValue) == "") {
                            node = null;
                            return node;
                        }
                        return new RegExp(searchInputValue).test(node.orgName);
                    }, false);
                    for (var j = 0; j < nodes.length; j++) {
                        var node = nodes[j];
                        if (node) {
                            node.highlight = true;
                            treeObj.updateNode(node);
                        }
                    }
                }
                if (temparr && temparr.length > 0) {
                    let nodeList = treeObj.getNodesByFilter(function (node) {
                        return temparr.indexOf(node.orgCode) != -1 || temparr.indexOf(node.orgId) != -1;
                    }, false, treeNode);
                    avalon.each(nodeList, function (index, item) {
                        treeObj.expandNode(item, true, false, true, true);
                    })
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam('key', selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
                //执法仪部门分配，右侧分配了，左侧勾选
                if (orgIdArr && orgIdArr.length > 0) {
                    avalon.each(orgIdArr, function (i, v) {
                        let node = treeObj.getNodesByFilter(function (node) {
                            return node.orgCode === v || node.orgId === v;
                        }, false, treeNode);
                        if (node.length > 0) {
                            treeObj.checkNode(node[0], true)
                        }
                    })
                }
            });
        },
        onInit(event) {
            var _this = this;
            vm = event.vmodel;
            //所属机构下拉请求
            getOrgAll().then((ret) => {
                _this.storageJson = "";
                if (ret.code == 0) {
                    let data = changeTreeData(ret.data);
                    _this.orgData = data;
                    _this.orgId = data[0].orgId;
                    _this.orgPath = data[0].path;
                    ccfwglAddDialog.orgData = data;
                    ccfwglModifyDialog.orgData = data;
                    ccfwglAllocatinVm.orgData = data;
                    common_assign_vm.orgData = data;//办案区部门树
                    _this.storageJson = storage.getItem(name);
                    if (_this.storageJson) {
                        _this.orgId = _this.storageJson.orgId;
                        _this.orgPath = _this.storageJson.orgPath;
                        _this.currentPage = _this.storageJson.page;
                        _this.selectedTitle = _this.storageJson.selectedTitle;
                    }
                    sbzygl.setListHeader(listHeaderName);
                    isTableSearch && _this.ajaxTableList(_this.orgId);
                } else {
                    showMessage('error', '获取所属机构失败！');
                }
            });
            let $toobar = $('.tyywglpt-tool-bar');
            $('.tyywglpt-list-panel').css({
                'top': $toobar.offset().top + $toobar.outerHeight() - 78
                // 'top': 190
            });
            //折线图
            // getOrgAll().then((ret) => {
            //     ccfwglAnalysisChartVm.data = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            // });

            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_CCFWGL_BAQSPCCGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_CCCL":
                            _this.authority.CCCL = true;
                            break;
                        // case "UOM_FUNCTION_CJZSCFWGL_CCFX":
                        //     _this.authority.CCFX = true;
                        //     break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_ZFJLYFP":
                            _this.authority.ZFJLYFP = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_CHECK":
                            _this.authority.CHECK = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_REGISTRY":
                            _this.authority.REGISTRY = true;
                            break;                        
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_SAVE":
                            _this.authority.SAVE = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_BAQSPCCGL_BATCHDELETE":
                            _this.authority.BATCHDELETE = true;
                            break;
                    }
                });
                if (false == _this.authority.MODIFY && false == _this.authority.CHECK)
                    _this.authority.OPT_SHOW = true;
            });
            this.$watch('checkBox', function (n, o) {
                if (n.length == 1)
                    this.editData = n[0];
            });
        },
        onReady() {

        },
        onDispose() {
            clearInterval(this.titleTimer);
        },
        ajaxTableList(orgId, page, pageSize) {
            let _this = this;
            _this.loading = true;
            _this.storageJson = storage.getItem(name);
            if (_this.storageJson) {
                page = --_this.storageJson.page;
            }
            getTableData(orgId, page, pageSize, _this.orgPath).then((ret) => {
                if (ret.code == 0) {
                    let datas = ret['data']['storageInfos'];
                    let total = ret['data']['count'];
                    _this.total = total;
                    _this.loading = false;
                    if (datas.length == 0) {
                        _this.noData = true;
                    } else {
                        _this.noData = false;
                    }

                    avalon.each(datas, (i, el) => {
                        datas[i].active = false;
                        datas[i].checked = false;
                    });
                    _this.tableData = datas;
                    _this.clearEdit();
                    vm.checkBox = [];
                    vm.checkAll = false;
                    vm.btnDisabled = true;

                    // if ($('.tyywglpt-list-content').get(0).offsetHeight < $('.tyywglpt-list-content').get(0).scrollHeight - 1) {
                    //     $('.tyywglpt-list-header').css({
                    //         'padding-right': '17px'
                    //     });
                    // } else {
                    //     $('.tyywglpt-list-header').css({
                    //         'padding-right': 0
                    //     });
                    // }

                    $("[data-toggle='popover']").popoverX({
                        trigger: 'manual',
                        container: 'body',
                        placement: 'auto top',
                        //delay:{ show: 5000},
                        html: 'true',
                        content: function () {
                            if($(this).attr('pop')){
                                return '<div class="title-content">' + $(this).attr('pop') + '</div>';
                            } else {
                                return '<div class="title-content">' + $(this).attr('data-original-title') + '</div>';
                            }
                            // return '<div class="title-content">' + $(this).attr('data-original-title') + '</div>';
                        },
                        animation: false
                    }).off("mouseenter").on("mouseenter", (event) => {
                        let target = event.target;
                        if ($(target).text() === '-') {
                            return;
                        }
                        if(dep_switch && $(event.target).attr('dep') && $(event.target).attr('fir')=='true') {
                            // console.log($(event.target).attr('dep'));
                            var dep_orgCode = $(event.target).attr('pop');
                            // console.log(dep_orgCode);
                            if(dep_orgCode==1) {
                                // console.log('one');
                                $(event.target).attr('pop', $(event.target).attr('data-original-title'));
                                $(event.target).attr('fir', 'false');
                                clearTimeout(vm.titleTimer);
                                vm.titleTimer = setTimeout(() => {
                                    $("[data-toggle='popover']").popoverX("hide");
                                    $(target).popoverX("show");
                                    $(".popover").off("mouseleave").on("mouseleave", (event) => {
                                        $(target).popoverX('hide');
                                    });
                                }, 500);
                            }else{
                                ajax({
                                    url: `/gmvcs/uap/org/queryById/${dep_orgCode}`,
                                    method: 'get'
                                }).then(res => {
                                    ajax({
                                        url: `/gmvcs/uap/org/getFullName?orgCode=${res.data.orgCode}&prefixLevel=${prefixLevel}&separator=${separator}`,
                                        method: 'get'
                                    }).then(resg => {
                                        $(event.target).attr('pop', resg.data);
                                        $(event.target).attr('fir', 'false');
                                        clearTimeout(vm.titleTimer);
                                        vm.titleTimer = setTimeout(() => {
                                            $("[data-toggle='popover']").popoverX("hide");
                                            $(target).popoverX("show");
                                            $(".popover").off("mouseleave").on("mouseleave", (event) => {
                                                $(target).popoverX('hide');
                                            });
                                        }, 500);
                                    });
                                });
                            }
                            
                        } else {
                            clearTimeout(vm.titleTimer);
                            vm.titleTimer = setTimeout(() => {
                                $("[data-toggle='popover']").popoverX("hide");
                                $(target).popoverX("show");
                                $(".popover").off("mouseleave").on("mouseleave", (event) => {
                                    $(target).popoverX('hide');
                                });
                            }, 500);
                        }
                    }).off("mouseleave").on("mouseleave", (event) => {
                        let target = event.target;
                        clearTimeout(vm.titleTimer);
                        setTimeout(() => {
                            if (!$(".popover:hover").length) {
                                $(target).popoverX("hide");
                            }
                        }, 100);
                    });
                    sbzygl.initDragList(listHeaderName);
                } else {
                    sbzygl.initDragList(listHeaderName);
                    showMessage('error', '请求错误' + ret.code);
                }

            });
        },
        handlePageChange(curpage, pageSize) {
            storage.setItem(name, {
                orgId: this.orgId,
                page: this.currentPage,
                orgPath: this.orgPath,
                selectedTitle: this.selectedTitle
            }, 0.5);
            this.ajaxTableList(this.orgId, --curpage, pageSize);
        },
        //全选复选框
        handleCheckAll(e) {
            let list = this.tableData;
            let bol = e.target.checked;
            this.checkBox.clear();
            avalon.each(list, (key, val) => {
                val.checked = bol;
                val.active = bol;
                if (bol)
                    this.checkBox.pushArray([val]);
                else
                    this.checkBox.clear();
            });
            let symbol = judgeCheckboxData(this.checkBox);
            if (symbol) {
                this.checkedIsSource = true;
                $(".bottom-tool-bar .btn-tool").addClass('disabled');
            } else {
                if (this.checkBox.length <= 0) {
                    $(".bottom-tool-bar .btn-tool").addClass('disabled');
                } else {
                    $(".bottom-tool-bar .btn-tool").removeClass('disabled');
                }
                this.checkedIsSource = false;
            }
            if (this.checkBox.length == 1)
                this.btnDisabled = false;
            else
                this.btnDisabled = true;
        },
        //单选复选框
        handleCheck($index, item, e) {
            let _this = this;
            let list = this.tableData;
            list[$index]['checked'] = item.checked;
            let ret = list.filter((item) => {
                return item['checked'];
            });
            if (ret.length == list.length)
                this.checkAll = true;
            else
                this.checkAll = false;
            if (e.target.checked == true)
                this.checkBox.ensure(item);
            else
                this.checkBox.remove(item);

            if (_this.checkBox.length == 1)
                _this.btnDisabled = false;
            else
                _this.btnDisabled = true;
            let symbol = judgeCheckboxData(this.checkBox);
            if (symbol) {
                this.checkedIsSource = true;
                $(".bottom-tool-bar .btn-tool").addClass('disabled');
            } else {
                if (this.checkBox.length <= 0) {
                    $(".bottom-tool-bar .btn-tool").addClass('disabled');
                } else {
                    $(".bottom-tool-bar .btn-tool").removeClass('disabled');
                }
                this.checkedIsSource = false;
            }
        },
        handleInputFocus(flag, ev) {
            switch (flag) {
                case 'ip':
                    this.showIpBelowTips = true;
                    break;
                case 'port':
                    this.showPortBelowTips = true;
                case 'normalDay':
                    this.shownNormalDayBelowTips = true;
                    break;
                case 'specialDay':
                    this.showSpecialDayBelowTips = true;
                    break;
            }
            if ($('.ccfwgl-' + flag + ' .ccfwgl-error-tips').length > 0)
                $('.ccfwgl-' + flag + ' .ccfwgl-error-tips').remove();
            $(ev.target).siblings('.close-clear').show();
        },
        handleInputBlur(flag, VmTag, ev) {
            let validate = new FaajValidate();
            let Vm = getDialogVm(VmTag);
            switch (flag) {
                case 'serviceName':
                    validate.add(Vm.json.name, 'isNoEmpty', '服务名称不能为空&ccfwgl-serviceName');
                    validate.add(Vm.json.name, 'maxLength:32', '服务名称不能超过32个字符&ccfwgl-serviceName');
                    break;
                case 'ip':
                    this.showIpBelowTips = false;
                    validate.add(Vm.json.ip, 'isNoEmpty', 'IP不能为空&ccfwgl-ip');
                    validate.add(Vm.json.ip, 'testIpNotPort', 'IP格式不正确&ccfwgl-ip');
                    Vm.json.uploadUrl = 'ftp://' + Vm.json.ip;
                    Vm.json.downloadUrl = 'http://' + Vm.json.ip;
                    break;
                case 'port':
                    this.showPortBelowTips = false;
                    validate.add(Vm.json.port, 'isNoEmpty', '端口不能为空&ccfwgl-port');
                    validate.add(Vm.json.port, 'isNumber', '端口必须为数字(正整数)&ccfwgl-port');
                    validate.add(Vm.json.port, 'includeSpecialChar', '端口不能包含特殊字符&ccfwgl-port');
                    validate.add(Vm.json.port, 'testPortRange', '端口不符合0~65535范围&ccfwgl-port');
                    break;
                case 'account':
                    validate.add(Vm.json.account, 'isNoEmpty', '账号不能为空&ccfwgl-account');
                    break;
                case 'password':
                    validate.add(Vm.json.password, 'isNoEmpty', '密码不能为空&ccfwgl-password');
                    break;
                case 'uploadPath':
                    validate.add(Vm.json.uploadUrl, 'isNoEmpty', '上传路径不能为空&ccfwgl-uploadPath');
                    validate.add(Vm.json.uploadUrl, 'isVaildUrl', '路径非法&ccfwgl-uploadPath');
                    break;
                case 'downloadPath':
                    validate.add(Vm.json.downloadUrl, 'isNoEmpty', '下载路径不能为空&ccfwgl-downloadPath');
                    validate.add(Vm.json.downloadUrl, 'isVaildUrl', '路径非法&ccfwgl-downloadPath');
                    break;
                // case 'BAQ':
                //     this.shownNormalDayBelowTips = false;
                //     validate.add(ccfwglMethodDialog.json.storageTime, 'isNoEmpty', '办案区视音频存储期限不能为空&ccfwgl-normalDay');
                //     validate.add(ccfwglMethodDialog.json.storageTime, 'isNumber', '办案区视音频存储期限必须为正整数&ccfwgl-normalDay');
                //     validate.add(ccfwglMethodDialog.json.storageTime, 'isMaxNumber9', '最大可输入9位，且不能为0&ccfwgl-normalDay');
                //     break;
                case 'normalDay':
                    this.shownNormalDayBelowTips = false;
                    validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNoEmpty', '普通视音频存储期限不能为空&ccfwgl-normalDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNumber', '普通视音频存储期限必须为正整数&ccfwgl-normalDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isMaxNumber9', '最大可输入9位，且不能为0&ccfwgl-normalDay');
                    break;
            }
            let closure = avalon.noop.before(validate.start.bind(validate));
            let msg = closure();
            $(ev.target).siblings('.close-clear').hide();
            if (msg) {
                let className = msg.split('&')[1];
                if ($('.' + VmTag + ' .ccfwgl-error-tips').length > 0)
                    $('.ccfwgl-error-tips').remove();
                $('.' + VmTag + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
                return true;
            } else {
                if ($('.' + VmTag + ' .ccfwgl-error-tips').length > 0)
                    $('.ccfwgl-error-tips').remove();
            }
            return false;
        },
        handleCloseClear(e) {
            let name = $(e.target).attr('name');
            let vmName = name.split('.')[0];
            let inputName = name.split('.')[1];
            getDialogVm(vmName)['json'][inputName] = '';
            $(e.target).siblings('input').focus();
            return false;
        },
        //查看点击
        handleLookClick($index, item) {
            lookModifyCommom(ccfwglLookDialog, item);
            ccfwglLookDialog.show = true;
        },
        //添加按钮点击
        handleAddClick() {
            if (this.checkBox.length != 0)
                return false;
            //确定按钮灰色
            $(".ccfwglAddDialog_add .com-modal-btn-ok").addClass("disabled");
            ccfwglAddDialog.json.orgId = this.orgId;
            ccfwglAddDialog.json.orgPath = this.orgPath;
            ccfwglAddDialog.selectedTitle = this.selectedTitle;
            ccfwglAddDialog.show = true;
            if ($('.ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
        },
        //修改点击
        handleModifyClick($index, item) {
            if (item.source) {
                showMessage('warn', '该条数据来自级联平台,不能修改');
                return;
            }
            lookModifyCommom(ccfwglModifyDialog, item);
            ccfwglModifyDialog.orgId = item.orgRid;
            ccfwglModifyDialog.show = true;
            ccfwglModifyDialog.selectedTitle = item.orgName;
            if ($('.ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
        },
        //列表删除按钮点击
        handleSingleDeleteClick($index, item) {
            // ccfwglDeleteVm.deleteCount = 1;
            if (item.source) {
                showMessage('warn', '该条数据来自级联平台,不能删除!');
                return;
            }
            ccfwglDeleteVm.item = [this.tableData[$index]];
            ccfwglDeleteVm.toggle = true;
            ccfwglDeleteVm.show = true;
        },

        //批量删除按钮点击
        handleDeleteClick() {
            let length = this.checkBox.length;
            if (length == 0) {
                // showMessage('info', '请至少选择一项!');
                return false;
            } else {
                let tip = judgeCheckboxData(this.checkBox);
                if (tip) {
                    showMessage('warn', '含有来自级联平台的数据,不能删除!');
                    return;
                }
                ccfwglDeleteVm.deleteCount = length;
            }
            ccfwglDeleteVm.toggle = false;
            ccfwglDeleteVm.show = true;
        },
        //存储策略按钮点击
        // handleMethodClick() {
        //     if (this.btnDisabled == true)
        //         return false;
        //     ccfwglMethodDialog.show = true;
        //     ccfwglMethodDialog.json.caseAreaId = vm.editData['caseAreaId'],
        //     ccfwglMethodDialog.json.storageTime = this.editData.storageTime === undefined ? vm.tableData[0]['storageTime'] : this.editData.storageTime;
        //     ccfwglMethodDialog.json.expireDaysSpecial = this.editData.expireDaysSpecial === undefined ? vm.tableData[0]['expireDaysSpecial'] : this.editData.expireDaysSpecial;
        //     if ($('.ccfwgl-error-tips').length > 0)
        //         $('.ccfwgl-error-tips').remove();
        // },
        handleMethodClick2() {
            if (this.btnDisabled == true)
            return false;
            ccfwglMethodDialog.show = true;
            ccfwglMethodDialog.json.strategyId = vm.editData['strategyId'],
                ccfwglMethodDialog.json.expireDaysNormal = this.editData.expireDaysNormal === undefined ? vm.tableData[0]['expireDaysNormal'] : this.editData.expireDaysNormal;
            ccfwglMethodDialog.json.expireDaysSpecial = this.editData.expireDaysSpecial === undefined ? vm.tableData[0]['expireDaysSpecial'] : this.editData.expireDaysSpecial;
            if ($('.ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
            ccfwglMethodChartVm.totalCapacity = vm.editData['totalCapacity'];
            ccfwglMethodChartVm.leftCapacity = vm.editData['remainCapacity'];
            ccfwglMethodChartVm.renderChart();


            // if (this.btnDisabled == true)
            //     return false;
            // ccfwglMethodDialog.show = true;
            // ccfwglMethodDialog.json.caseAreaId = vm.editData['caseAreaId'],
            // ccfwglMethodDialog.json.serviceId = vm.editData['serviceId'],
            // ccfwglMethodDialog.json.storageTime = this.editData.storageTime === undefined ? vm.tableData[0]['storageTime'] : this.editData.storageTime;
            // if ($('.ccfwgl-error-tips').length > 0)
            //     $('.ccfwgl-error-tips').remove();
            // ccfwglMethodChartVm.totalCapacity = vm.editData['totalCapacity'];
            // ccfwglMethodChartVm.remainCapacity = vm.editData['remainCapacity'];
            // ccfwglMethodChartVm.renderChart();
        },
        //存储分析按钮点击
        handleAnalysisClick() {
            if (this.btnDisabled == true)
                return false;
            ccfwglAnalysisDialog.show = true;
            ccfwglAnalysisChartVm.renderChart();
        },
        //办案区存储分配按钮点击
        handleZfyAllocation() {
            if (this.btnDisabled == true)
                return false;
            common_assign_vm.show = true;
            zTreeInit("baqtree", handleToTreeData(common_assign_vm.orgData));
            zTreeInit("baqtreeAssign", handleToTreeData(common_assign_vm.orgData));
            common_assign_vm.allchecked = false;
            common_assign_vm.leftDisabled = true;
            common_assign_vm.rightDisabled = true;
            common_assign_vm.leftData = [];
            common_assign_vm.rightData = [];


            //打开分配弹窗时获取已分配的办案区id
            let serverId = getServerId();
            findAllArea(serverId, storage.getItem('userCode')).then(ret => {
                if (ret.code == 0) {
                    if (ret.data != null && ret.data.length > 0) {
                        common_assign_vm.alreadyAssignCaseAreaId = ret.data 
                    }
                }
            });
            
        },
        // 手动点击测试
        handleTest(vmName) {
            //如果是正在测试中则不给点击
            if ($(".test-btn").hasClass("testing")) {
                return;
            }
            //重置配置测试的按钮样式
            clearBtnConfig();
            let VM = getDialogVm(vmName);
            //点击配置测试时去掉点击前已存在的错误提示信息，避免造成用户点击配置测试时感觉还会验证其他字段（实际上是由于blur验证的，禅道bug4585）
            $('.ccfwgl-error-tips').remove();
            ccfwglConfigTest.json = {
                ip: VM['json']['ip'],
                port: VM['json']['port']
            };
            // 配置测试弹框ip,端口验证逻辑
            if (testStorageValidateForm(VM, testStorageConfirm)) {
                let msg = testStorageValidateForm(VM, testStorageConfirm);
                let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
                if ($('.' + vmName + '.ccfwgl-error-tips').length > 0)
                    $('.ccfwgl-error-tips').remove();
                $('.' + vmName + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
            }
        }
    }
});
//查看弹框vm
let ccfwglLookDialog = avalon.define({
    $id: 'ccfwgl_baqspccgl_lookDialog',
    title: "查看",
    show: false,
    modalWidth: 440,
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: "",
        worktimeBegin: "",
        worktimeEnd: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        //  pointPlayUrl: "",
        id: "",
        belong: "",
        serviceTime: ""
    },
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;

    }

});

//添加弹框vm
let ccfwglAddDialog = avalon.define({
    $id: 'ccfwgl_baqspccgl_addDialog',
    show: false,
    title: "添加",
    searchResult: "",
    orgId: "",
    orgData: [],
    selectedTitle: '',
    $skipArray: ['searchResult'],
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: 5021,
        worktimeBegin: "00:00:00",
        worktimeEnd: "23:59:59",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        orgPath: "",
        //  pointPlayUrl: "",
        type: 2
    },
    beginTime: "",
    endTime: "",
    belong: "默认值4",
    getSelected(key, title, node) {
        this.json.orgId = key;
        this.json.orgPath = node.path;
        this.selectedTitle = node.title;
    },
    handleTreeChange(e, selectedKeys) {
        this.json.orgId = e.node.orgId;
        this.json.orgPath = e.node.path;
    },
    handleTimePiker3(obj, type) {
        this.json.worktimeBegin = obj.target.value;
        if ($('.ccfwglAddDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },
    handleTimePiker4(obj, type) {
        this.json.worktimeEnd = obj.target.value;
        if ($('.ccfwglAddDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },
    handleCancel(e) {
        //如果是正在测试中则不给点击
        if ($(".test-btn").hasClass("testing")) {
            return;
        }
        this.show = false;
        clearInput(this);
        //恢复配置测试按钮
        clearBtnConfig();
    },
    handleOk() {
        //测试不成功的时候则不可点击
        if ($(".ccfwglAddDialog_add .com-modal-btn-ok").hasClass("disabled")) {
            return false;
        }
        //为了解决点击查询按钮orgId为空
        if (ccfwglAddDialog.json['orgId'] == '')
            ccfwglAddDialog.json['orgId'] = vm.orgData[0]['orgId'];
        if (validateForm(ccfwglAddDialog, addConfirm)) {
            let msg = validateForm(ccfwglAddDialog, addConfirm);
            let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
            if ($('.ccfwglAddDialog .ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
            $('.ccfwglAddDialog' + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
        }
        // this.show = false;
        // clearInput(this);
        //恢复配置测试按钮
        clearBtnConfig();
    }

});
//修改弹框vm
let ccfwglModifyDialog = avalon.define({
    $id: 'ccfwgl_baqspccgl_modifyDialog',
    title: "修改",
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: "",
        worktimeBegin: "",
        worktimeEnd: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        orgPath: "",
        //  pointPlayUrl: "",
        id: ""
    },
    orgId: "",
    selectedTitle: '',
    orgData: [],
    show: false,
    beginTime: "开始",
    endTime: "结束",
    getSelected(key, title, node) {
        this.json.orgId = key;
        this.json.orgPath = node.path;
        this.selectedTitle = node.title;
    },
    handleTreeChange(e, selectedKeys) {
        this.json.orgId = e.node.orgId;
        this.json.orgPath = e.node.path;
    },
    handleTimePiker1(obj, type) {
        this.json.worktimeBegin = obj.target.value;
        if ($('.ccfwglModifyDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },
    handleTimePiker2(obj, type) {
        this.json.worktimeEnd = obj.target.value;
        if ($('.ccfwglModifyDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },

    handleCancel(e) {
        //如果是正在测试中则不给点击
        if ($(".test-btn").hasClass("testing")) {
            return;
        }
        this.show = false;
        //恢复配置测试按钮的样式
        clearBtnConfig();
    },
    handleOk() {
        //为了解决点击查询按钮orgId为空
        if (ccfwglModifyDialog.json['orgId'] == '')
            ccfwglModifyDialog.json['orgId'] = vm.orgData[0]['orgId'];
        if (validateForm(ccfwglModifyDialog, ModifyConfirm)) {
            let msg = validateForm(ccfwglModifyDialog, ModifyConfirm);
            let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
            if ($('.ccfwglModifyDialog .ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
            $('.ccfwglModifyDialog' + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
        }
        // this.show = false;
        //恢复配置测试按钮的样式
        clearBtnConfig();
    }



});

//配置测试弹框
let ccfwglConfigTest = avalon.define({
    $id: "ccfwgl_baqspccgl_configTest",
    title: "提示",
    show: false,
    modalWidth: 273,
    okText: "确定",
    testResult: '正在测试中',
    json: {
        ip: '',
        port: 0
    },
    deviceTestClick() {
        this.show = false;
    },
    handleCancel() {
        this.show = false;
    }
});

//删除弹框
let ccfwglDeleteVm = avalon.define({
    $id: "ccfwgl_baqspccgl_deleteDialog",
    title: "确定删除",
    show: false,
    modalWidth: 440,
    okText: "确定",
    toggle: true,
    deleteCount: 1,
    item: [], //列表中的删除的对象
    handleCancel(e) {
        this.show = false;
        ccfwglDeleteVm.item = [];
    },
    handleOk() {
        let serverId = getServerId();
        deleteAjax(serverId).then((ret) => {
            if (ret.code == 0) {
                if (ret.data.notDelete.length > 0) {
                    showMessage('warn', '部分数据因已经绑定执法记录仪无法删除，请先解绑');
                    return;
                }
                showMessage('success', '删除成功');
                vm.ajaxTableList(vm.orgId);
                vm.checkAll = false;
            } else {
                showMessage('error', ret.msg);
            }

        });
        ccfwglDeleteVm.item = [];
        this.show = false;
    },


});


//存储策略弹框vm
let ccfwglMethodDialog = avalon.define({
    $id: 'ccfwgl_baqspccgl_methodDialog',
    show: false,
    title: '存储策略',
    modalWidth: 440,
    showNormalInput: false,
    showSpecialInput: false,
    json: {
        strategyId: "",
        expireDaysNormal: "",
        // expireDaysSpecial: "",
        expireDaysNormalOld: "",
        // expireDaysSpecialOld: ""
    },
    displayValue: '显示默认值',
    handleCancel(e) {
        this.show = false;
        this.showNormalInput = false;
        this.showSpecialInput = false;
    },
    handleOk() {
        let msg = "";
        let validate = new FaajValidate();
        validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNoEmpty', '普通视音频存储期限不能为空&ccfwgl-normalDay');
        validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNumber', '普通视音频存储期限必须为正整数&ccfwgl-normalDay');
        validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isMaxNumber9', '最大可输入9位，且不能为0&ccfwgl-normalDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNoEmpty', '重要视音频存储期限不能为空&ccfwgl-specialDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNumber', '重要视音频存储期限必须为正整数&ccfwgl-specialDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isMaxNumber9', '最大可输入9位，且不能为0&ccfwgl-specialDay');
        let closure = methodComfirm.before(validate.start.bind(validate));
        if (msg = closure()) { //返回错误信息msg
            let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
            if ($('.ccfwglMethodDialog .ccfwgl-error-tips').length > 0) //防止多次增加错误提示
                $('.ccfwgl-error-tips').remove();
            $('.ccfwglMethodDialog' + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
            return false;

        }
        this.show = false;
        this.showNormalInput = false;
        this.showSpecialInput = false;
    },
    handleComfirm(num, $event) {
        let wrong = vm.handleInputBlur((num == 1 ? 'specialDay' : 'normalDay'), 'ccfwglMethodDialog', $event);
        if (wrong)
            return false;
        if (num == 1) { //重要音视频存储
            this.showSpecialInput = false;
        } else {
            this.showNormalInput = false;
        }
    },
    oldjson: {},
    handleModify(num) {
        ccfwglMethodDialog.json.expireDaysNormalOld = ccfwglMethodDialog.json.expireDaysNormal;//恢复旧数据
        // ccfwglMethodDialog.json.expireDaysSpecialOld = ccfwglMethodDialog.json.expireDaysSpecial;//恢复旧数据
        if (num == 1) { //重要音视频存储
            this.showSpecialInput = true;
        } else {
            this.showNormalInput = true;

        }
    },
    handleModifyCancel(num) {
        if (num == 1) { //重要音视频存储
            this.showSpecialInput = false;
            ccfwglMethodDialog.json.expireDaysSpecial = ccfwglMethodDialog.json.expireDaysSpecialOld;//恢复旧数据
            $('.ccfwgl-error-tips').remove();
        } else {//普通
            this.showNormalInput = false;
            ccfwglMethodDialog.json.expireDaysNormal = ccfwglMethodDialog.json.expireDaysNormalOld;//恢复旧数据
            $('.ccfwgl-error-tips').remove();
        }
    }
});



//存储分析弹框vm
let ccfwglAnalysisDialog = avalon.define({
    $id: 'ccfwgl_baqspccgl_analysisDialog',
    show: false,
    modalWidth: 660,
    title: '存储分析',
    showTime: false,
    curValue: '1', //用于标识选中的radio
    startTime: moment().format('YYYY-MM-DD'),
    endtTime: moment().format('YYYY-MM-DD'),
    json: '',
    radioOptions: [{
            label: '过去7天',
            value: '1'
        },
        {
            label: '过去30天',
            value: '2'
        },
        {
            label: '一段时间',
            value: '3'
        },
    ],
    options1: {
        col: 'startTime',
        placeholder: '请选择开始时间',
        format: 'YYYY-MM-DD',
        startDate: moment().subtract(0.5, 'year').format('YYYY-MM-DD'),
        endDate: new Date().toLocaleString().split(" ")[0],
        value: moment().format('YYYY-MM-DD')
    },
    options2: {
        col: 'endTime',
        placeholder: '请选择结束时间',
        format: 'YYYY-MM-DD',
        startDate: moment().subtract(0.5, 'year').format('YYYY-MM-DD'),
        endDate: new Date().toLocaleString().split(" ")[0],
        value: moment().format('YYYY-MM-DD')
    },
    $timeForm: createForm({
        onFieldsChange(fields, record) {
            if (record.startTime && record.endTime) {
                timeObj = record;
            }


        }
    }),
    handleSearchClick() {},
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;
    },
    handleChange(e) {
        switch (e.target.value) {
            case '1':
            case '2':
                this.showTime = false;
                //  ccfwglAnalysisDialog.getAnalysisData();
                break;
            default:
                this.showTime = true;

        }
    },

    getAnalysisData() {
        getAnalysisDataAjax().then((ret) => {

        });
    }


});

//办案区分配
let ccfwglAllocatinVm = avalon.define({
    $id: 'ccfwgl_baqspccgl_allocatioDialog',
    title: "存储分配",
    modalWidth: 720,
    okText: '',
    orgData: [],
    show:false,
    listStorageId: '',//所点击存储分配的serverId
    leftData: [],
    rightData: [],
    $leftCheckArr:[],
    $rightCheckArr:[],
    rightDisabled: true,
    leftDisabled: true,
    allchecked:false,
    clickleft() { 
        if (ccfwglAllocatinVm.$leftCheckArr.length == 0) return;
        //添加到右边
        for (let i = 0; i < ccfwglAllocatinVm.$leftCheckArr.length; i++){
            for (let j = 0; j < ccfwglAllocatinVm.leftData.length; j++) {
                if ($.trim(ccfwglAllocatinVm.$leftCheckArr[i]) == $.trim(ccfwglAllocatinVm.leftData[j].caseAreaId)) {

                    ccfwglAllocatinVm.rightData.push(ccfwglAllocatinVm.leftData[j]);

                    ccfwglAllocatinVm.leftData.splice(j, 1); --j;
                    ccfwglAllocatinVm.$leftCheckArr.splice(i, 1); --i;
                }
            }
        }
        if(this.$leftCheckArr.length ==0){
            this.rightDisabled = true;
        }else{
            this.rightDisabled = false;
        }
        
        ccfwglAllocatinVm.updataBAQ();
    },
    clickright() {
        if (ccfwglAllocatinVm.$rightCheckArr.length == 0) return;
        //添加到右边
        for (let i = 0; i < ccfwglAllocatinVm.$rightCheckArr.length; i++){
            for (let j = 0; j < ccfwglAllocatinVm.rightData.length; j++){
                if ($.trim(ccfwglAllocatinVm.$rightCheckArr[i]) == $.trim(ccfwglAllocatinVm.rightData[j].caseAreaId)) {

                    ccfwglAllocatinVm.leftData.push(ccfwglAllocatinVm.rightData[j]);
                    ccfwglAllocatinVm.rightData.splice(j, 1); j--;
                    ccfwglAllocatinVm.$rightCheckArr.splice(i, 1); --i;
                }
            }            
        }
        if(this.$rightCheckArr.length ==0){
            this.leftDisabled = true;
        }else{
            this.leftDisabled = false;
        }
        
        ccfwglAllocatinVm.updataBAQ();
    },
    handleCancel(e) {
        ccfwglAllocatinVm.show = false;
    },
    handleOk() {
        let serverId = getServerId();
        let rightArr = [];
        avalon.each(ccfwglAllocatinVm.rightData, function (index, item) {
            rightArr.push(item.caseAreaId);
         });

        bmAssignAjax(serverId, rightArr).then((ret) => {
            if (ret.code == 0) {
                showMessage('success', '分配存储成功！');
                ccfwglAllocatinVm.show = false;
            } else
                showMessage('error', '分配存储失败！');
        });
        vm.show = false;
    },
    //初始化未分配和已分配的办案区
    ccfwglAllocatinVmInit() {
        //未分配的办案区
        getZfYByOrgIdAjax(storage.getItem('orgCode')).then((ret) => {
            ccfwglAllocatinVm.leftData = [];
            ccfwglAllocatinVm.leftData = ret.data;
            let string = "";
            avalon.each(ccfwglAllocatinVm.leftData, function (index, item) {
                string += '<li class="lefttreeli" data-orgcode=' + item.caseAreaId + '>' +
                    '<input type="checkbox" class="leftspan" style="margin-right: 3px;" data-orgcode=' + item.caseAreaId + '>' +
                    '<span class="leftspan spanorg">' + item.caseAreaName + '</span>' +
                    // '<span class="fa fa-close fa-lg" data-orgcode=' + item.caseAreaId + '></span>' +
                    '</li>'
            });
            $('#leftBAQ').empty();
            $('#leftBAQ').append(string);
            $('#leftBAQ li').on("click", 'input', function (e) {
                ccfwglAllocatinVm.check_oneleft(e);
            });
            ccfwglAllocatinVm.$leftCheckArr = [];
        });
        //已分配的办案区
        // getBmAjax(getServerId()).then((ret) => {
        //     ccfwglAllocatinVm.rightData = [];
        //     ccfwglAllocatinVm.rightData = ret.data;
        //     let string = "";
        //     avalon.each(ccfwglAllocatinVm.rightData, function (index, item) {
        //         string += '<li class="rightreeli" data-orgcode=' + item.caseAreaId + '>' +
        //             '<input type="checkbox" class="rightspan" style="margin-right: 3px;" data-orgcode=' + item.caseAreaId + '>' +
        //             '<span class="rightspan spanorg">' + item.caseAreaName + '</span>' +
        //             // '<span class="fa fa-close fa-lg" data-orgcode=' + item.caseAreaId + '></span>' +
        //             '</li>'
        //     });
        //     $('#rightBAQ').empty();
        //     $('#rightBAQ').append(string);
        //     $('#rightBAQ li').on("click", 'input', function (e) {
        //         ccfwglAllocatinVm.check_one(e);
        //     });
        //     $('#rightBAQ li').on("click", 'span.fa-close', function (e) {
        //         ccfwglAllocatinVm.handleSingleDeleteClick($(e.target).attr('data-orgcode'));
        //     });
        //     ccfwglAllocatinVm.$rightCheckArr = [];
        // });
    },
    updataBAQ() {
        //右边
        let rightStr = "";
        avalon.each(ccfwglAllocatinVm.rightData, function (index, item) {
            rightStr += '<li class="rightreeli" data-orgcode=' + item.caseAreaId + '>' +
                '<input type="checkbox" class="rightspan" style="margin-right: 3px;" data-orgcode=' + item.caseAreaId + '>' +
                '<span class="rightspan spanorg">' + item.caseAreaName + '</span>' +
                // '<span class="fa fa-close fa-lg" data-orgcode=' + item.caseAreaId + '></span>' +
                '</li>'
        });
        $('#rightBAQ').empty();
        $('#rightBAQ').append(rightStr);
        $('#rightBAQ li').on("click", 'input', function (e) {
            ccfwglAllocatinVm.check_one(e);
        });
        $('#rightBAQ li').on("click", 'span.fa-close', function (e) {
            ccfwglAllocatinVm.handleSingleDeleteClick($(e.target).attr('data-orgcode'));
        });
        //左边
        let leftStr = "";
        avalon.each(ccfwglAllocatinVm.leftData, function (index, item) {
            leftStr += '<li class="lefttreeli" data-orgcode=' + item.caseAreaId + '>' +
                '<input type="checkbox" class="leftspan" style="margin-right: 3px;" data-orgcode=' + item.caseAreaId + '>' +
                '<span class="leftspan spanorg">' + item.caseAreaName + '</span>' +
                '</li>'
        });
        $('#leftBAQ').empty();
        $('#leftBAQ').append(leftStr);
        $('#leftBAQ li').on("click", 'input', function (e) {
            ccfwglAllocatinVm.check_oneleft(e);
        });
        ccfwglAllocatinVm.allchecked = false;
    },
    check_oneleft(e){
        var checked = e.target.checked
        var orgcode = $(e.target).attr('data-orgcode');
        if (checked === true) {
            this.$leftCheckArr.push(orgcode);
        }else{
            this.allchecked = false;
            for(var i=0;i<this.$leftCheckArr.length;i++){
                if(this.$leftCheckArr[i] == orgcode){
                    this.$leftCheckArr.splice(i,1);
                    break;
                }
            }
        }
        if(this.$leftCheckArr.length ==0){
            this.rightDisabled = true;
        }else{
            this.rightDisabled = false;
        }
        console.log(this.$leftCheckArr);
    },
    check_one(e){
        var checked = e.target.checked
        var orgcode = $(e.target).attr('data-orgcode');
        if (checked === true) {
            this.$rightCheckArr.push(orgcode);
            //表示全选了
            if(this.$rightCheckArr.length == $('#rightBAQ li').length){
                this.allchecked = true;
            }
        }else{
            this.allchecked = false;
            for(var i=0;i<this.$rightCheckArr.length;i++){
                if(this.$rightCheckArr[i] == orgcode){
                    this.$rightCheckArr.splice(i,1);
                    break;
                }
            }
        }
        if(this.$rightCheckArr.length ==0){
            this.leftDisabled = true;
        }else{
            this.leftDisabled = false;
        }
        console.log(this.$rightCheckArr);
    },
    checkAllbaq(e){
        var checked = e.target.checked
        if(checked){
            $("#rightBAQ li :checkbox").prop("checked", true);
            let liArr = $('#rightBAQ li');
            var _this = this;
            let temparr=[];
            avalon.each(liArr, function (index, item) {
                temparr.push($(item).attr('data-orgcode'));
            })
            this.$rightCheckArr = temparr;
        }else{
            $("#rightBAQ li :checkbox").prop("checked", false)
            this.$rightCheckArr = [];
        }
        if(this.$rightCheckArr.length ==0){
            this.leftDisabled = true;
        }else{
            this.leftDisabled = false;
        }
        console.log(this.$rightCheckArr);
    },
    resultsGroup:[],
    handleSingleDeleteClick:function(caseAreaId){
        //右边点删除
        for(var i=0;i<ccfwglAllocatinVm.rightData.length;i++){
            if($.trim(ccfwglAllocatinVm.rightData[i].caseAreaId) == $.trim(caseAreaId)){
                
                $("#rightBAQ li").eq(i).remove();
                ccfwglAllocatinVm.rightData.splice(i,1);
                break;
            }
        }
        //以及选择的也要删掉数据
        for(var i=0;i<this.$rightCheckArr.length;i++){
            if(this.$rightCheckArr[i] == caseAreaId){
                this.$rightCheckArr.splice(i,1);
                break;
            }
        }
        if(this.$rightCheckArr.length ==0){
            this.leftDisabled = true;
            this.allchecked = false;
        }else{
            this.leftDisabled = false;
        }
        console.log(this.$rightCheckArr);
    },

});


//显示存储策略中的饼图
const ccfwglMethodChartVm = avalon.define({
    $id: 'ccfwgl_baqspccgl_methodChart',
    totalCapacity: 0,
    remainCapacity: 0,
    data: [],
    renderChart() {
        let _this = this;
        var options = {
            title: {
                // text: '容量统计',
                left: 'center',
                top: 20,
                textStyle: {
                    fontFamily: "Microsoft YaHei",
                    fontWeight: "bolder",
                    color: ' #536b82',
                    fontSize: '18'
                }

            },
            tooltip: {
                trigger: 'item',
                formatter: "{b}<br/>({d}%)"
            },
            grid: {
                left: 500,
                width: 145,
                height: 145,
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                width: 300,
                x: '6%',
                y: '30%',
                itemWidth: 16,
                itemHeight: 16,
                itemGap: 20, //相邻图例的间距
                data: ['预计剩余:' + _this.remainCapacity + 'GB', '预计使用:' + (_this.totalCapacity - _this.remainCapacity) + 'GB', ], //字符串''里面不能有空格
                textStyle: {
                    fontSize: 16,
                    fontFamily: "Microsoft YaHei",
                    fontWeight: "bolder",
                    color: ' #536b82'
                }
            },
            color: ['#19C2F9', '#FEB940'],
            series: [{
                type: 'pie',
                radius: '65%',
                center: ['73%', '43%'],
                selectedMode: 'single',
                data: [{
                        value: _this.totalCapacity - _this.remainCapacity,
                        name: '预计使用:' + (_this.totalCapacity - _this.remainCapacity) + 'GB'
                    },
                    {
                        value: _this.remainCapacity,
                        name: '预计剩余:' + _this.remainCapacity + 'GB'
                    },
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    normal: {
                        label: {
                            show: false //隐藏标示文字
                        },
                        labelLine: {
                            show: false //隐藏标示线
                        }
                    }
                }
            }]
        };
        var myChart = ec.init(ccfwglMethodChartVm.$element);
        myChart.setOption(options);
        //    console.log(calculateMA(10));
    }
});


//显示折线图
const ccfwglAnalysisChartVm = avalon.define({
    $id: 'ccfwgl_baqspccgl_analysisChart',
    data: [],
    renderChart() {
        var options = {
            title: {
                text: '增长',
                left: 0,
                textStyle: {
                    fontWeight: 400,
                    fontSize: 14,
                    color: '#6B7C8E'

                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['已使用容量', '总容量', 'MA5'],
                itemWidth: 12,
                itemHeight: 12,
                left: 25,
                bottom: 0,

            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: data0.categoryData,
                scale: true,
                boundaryGap: false,
                axisLine: {
                    onZero: false
                },
                splitLine: {
                    show: false
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            },
            yAxis: {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            dataZoom: [{
                    type: 'inside',
                    start: 50,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    y: '90%',
                    start: 50,
                    end: 100
                }
            ],
            series: [

                {
                    name: 'MA5',
                    type: 'line',
                    //  data: calculateMA(5),
                    data: [4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040
                    ],
                    smooth: true,
                    lineStyle: {
                        normal: {
                            opacity: 0.5
                        }
                    }
                },
                {
                    name: '已使用容量',
                    type: 'bar',
                    stack: 'de',
                    data: [2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040
                    ],
                    itemStyle: {
                        normal: {
                            color: '#00995D'
                        }
                    }
                },
                {
                    name: '总容量',
                    type: 'bar',
                    stack: 'de',
                    data: [4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040
                    ],
                    itemStyle: {
                        normal: {
                            color: '#12D134'
                        }
                    }
                }

            ]
        };
        var myChart = ec.init(ccfwglAnalysisChartVm.$element);
        myChart.setOption(options);
        //    console.log(calculateMA(10));
    }
});

//查看，修改弹框共用逻辑
function lookModifyCommom(vm, editData) {
    let data = editData;
    vm['json']['name'] = data.name; //服务名称
    vm['json']['account'] = data.account; //账号
    vm['json']['password'] = data.password; //密码
    vm['json']['downloadUrl'] = data.downloadUrl; //下载路径
    vm['json']['ip'] = data.ip; //服务类型
    vm['json']['uploadUrl'] = data.uploadUrl; //上传路径
    vm['json']['port'] = data.port; //存储服务地址
    vm['json']['id'] = data.rid; //存储服务Id
    if (vm == ccfwglModifyDialog) {
        vm['beginTime'] = data.worktimeBegin;
        vm['endTime'] = data.worktimeEnd;
        vm['json']['worktimeBegin'] = data.worktimeBegin;
        vm['json']['worktimeEnd'] = data.worktimeEnd;
    } else {
        vm['json']['serviceTime'] = data.worktimeBegin + '-' + data.worktimeEnd; //服务时段
        vm['json']['belong'] = data.orgName; //归属机构

    }
}

//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: "通知",
        message: content
    });
}
//【添加弹框】 点击确定，或取消按钮清除input框
function clearInput(Vm) {
    Vm.json = {
        name: "",
        ip: "",
        orgId: "",
        port: 21,
        worktimeBegin: "00:00:00",
        worktimeEnd: "23:59:59",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        orgPath: "",
        type: 2
        //  pointPlayUrl: "",
    };

};

function getDialogVm(name) {
    let obj = {
        'ccfwglAddDialog': ccfwglAddDialog,
        'ccfwglModifyDialog': ccfwglModifyDialog,
        'ccfwglMethodDialog': ccfwglMethodDialog
    };
    return obj[name];
}
//获取存储服务Id
function getServerId() {
    let data = ccfwglDeleteVm.item.length != 0 ? ccfwglDeleteVm.item : vm.checkBox.$model;
    let json = data.map(function (item) {
        return item['rid'];
    });
    json = json.join(',');
    return json;
}


//比较开始时段与结束时段
function checkTime(beginTime, endTime) {
    let beginTimeArr = $.trim(beginTime).split(":");
    let endTimeArr = $.trim(endTime).split(":");
    let beginSecondsTotal = beginTimeArr[0] * 3600 + beginTimeArr[1] * 60 + (beginTimeArr[2] - 0);
    let endSecondsTotal = endTimeArr[0] * 3600 + endTimeArr[1] * 60 + (endTimeArr[2] - 0);
    if (beginSecondsTotal > endSecondsTotal)
        return true;
    return false;
};
//添加弹框中确定请求
function addConfirm() {
    addAjax(ccfwglAddDialog.json).then((ret) => {
        if (ret.code == 0) {
            showMessage('success', '添加成功');
            vm.ajaxTableList(vm.orgId);
            vm.checkAll = false;
            ccfwglAddDialog.show = false;
            clearInput(ccfwglAddDialog);
        } else {
            //禁用确定按钮
            $(".ccfwglAddDialog_add .com-modal-btn-ok").addClass("disabled");
            showMessage('error', ret.msg);
        }
    });
};
//修改弹框中修改请求
function ModifyConfirm() {
    modifyAjax(ccfwglModifyDialog.json).then((ret) => {
        if (ret.code == 0) {
            showMessage('success', '修改成功');
            vm.ajaxTableList(vm.orgId);
            vm.checkAll = false;
            ccfwglModifyDialog.show = false;
        } else {
            showMessage('error', ret.msg);
        }
    });
};
//存储策略弹框中存储策略确定请求
function methodComfirm() {
    let json = {
        'strategyId': ccfwglMethodDialog.json.strategyId,
        'expireDaysNormal': ccfwglMethodDialog.json.expireDaysNormal,
        'expireDaysSpecial': ccfwglMethodDialog.json.expireDaysSpecial
    };
    methodComfirmAjax(json).then((ret) => {
        if (ret.code == 0)
            showMessage('success', '修改存储策略成功');
        else
            showMessage('warn', ret.msg);
        vm.ajaxTableList(vm.orgId);
        vm.btnDisabled = true;
        vm.checkBox = [];
    });
};
//配置测试弹框请求
function testStorageConfirm() {
    //ccfwglConfigTest.show = true;
    //ccfwglConfigTest.testResult = '正在测试中';
    //配置按钮样式变为测试中
    vm.txt_configTest = '正在测试中';
    //测试中增加禁用样式
    toggleClassConfigCancel();
    //配置测试接口
    testStorageAvailableAjax(ccfwglConfigTest.json).then((ret) => {
        //去除测试中样式
        toggleClassConfigCancel();
        if (ret.code == 0) {
            //ccfwglConfigTest.testResult = '测试正常!';
            vm.txt_configTest = '测试正常';
            //恢复添加弹窗时的确定按钮样式
            $(".ccfwglAddDialog_add .com-modal-btn-ok").removeClass("disabled");
        } else {
            //ccfwglConfigTest.testResult = 'IP或端口配置错误!';
            vm.txt_configTest = '测试异常';
        }
    });
}

//分配弹框确定或取消时初始化数据(由于不同的记录共用一颗树，只能remove掉已经添加的节点)
function initCcfwglAssignData(vm) {
    let treeObj = vm.treeObj;
    /*   2018-6-20*/
    let parentId = vm.orgData[0].orgId;
    let parentNode = treeObj && treeObj.getNodeByParam('orgId', parentId);
    treeObj && treeObj.removeChildNodes(parentNode);
    /*end*/
    parentNode = treeObj && treeObj.getNodeByParam('orgId', parentId);
    if (parentNode) {
        parentNode.isParent = true;
        treeObj.updateNode(parentNode);
    }

    // let hasAddNodes = vm.hasAddNodes;
    // let parentsNodes = vm.parentsNodes;
    // for (var i = 0, l = hasAddNodes.length; i < l; i++) {
    //     treeObj && treeObj.removeNode(hasAddNodes[i]);
    // }
    // for (var j = 0, k = parentsNodes.length; j < k; j++) { //已经打开的节点，确定和取消恢复到折叠状态
    //     let node = treeObj.getNodesByParam("key", parentsNodes[j], null);
    //     treeObj && treeObj.expandNode(node[0], false, null, null, false);
    // }
    //treeObj && treeObj.expandAll(false);
    vm.listStorageId = '';
    vm.parentsNodeOrgIds = [];
    vm.curClickSelectNodes = [];
    vm.curClickRightItems = [];
    vm.searchInputValue = '';
    vm.searchResults = [];
    vm.show = false;
}

//将数据转换为key,title,children属性
function changeTreeData(treeData, check) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        if (check) {
            treeData[i].checked = true;
        }
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].path = treeData[i].path;
        treeData[i].children = treeData[i].childs;
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}
//添加，修改弹框共用表单验证逻辑
function validateForm(Vm, ajaxMethod) {
    let validate = new FaajValidate();
    validate.add(Vm.json.name, 'isNoEmpty', '服务名称不能为空&ccfwgl-serviceName');
    validate.add(Vm.json.name, 'maxLength:32', '服务名称不能超过32个字符&ccfwgl-serviceName');
    validate.add(Vm.json.name, 'includeSpecialChar', '服务名称不能包含特殊字符&ccfwgl-serviceName');
    validate.add(Vm.json.ip, 'isNoEmpty', 'IP不能为空&ccfwgl-ip');
    validate.add(Vm.json.ip, 'testIpNotPort', 'IP格式不正确&ccfwgl-ip');
    validate.add(Vm.json.port, 'isNoEmpty', '端口不能为空&ccfwgl-port');
    validate.add(Vm.json.port, 'isNumber', '端口必须为数字(正整数)&ccfwgl-port');
    validate.add(Vm.json.port, 'testPortRange', '端口不符合0~65535范围&ccfwgl-port');
    validate.add(Vm.json.port, 'includeSpecialChar', '端口不能包含特殊字符&ccfwgl-port');
    validate.add(Vm.json.account, 'isNoEmpty', '账号不能为空&ccfwgl-account');
    validate.add(Vm.json.password, 'isNoEmpty', '密码不能为空&ccfwgl-password');
    validate.add(Vm.json.worktimeBegin, 'isNoEmpty', '开始时段不能为空&ccfwgl-beginTime');
    validate.add(Vm.json.worktimeEnd, 'isNoEmpty', '结束时段不能为空&ccfwgl-endTime');
    validate.add(checkTime(Vm.json.worktimeBegin, Vm.json.worktimeEnd), 'isCommon', '开始时段不能大于结束时段&ccfwgl-beginTime');
    validate.add(Vm.json.uploadUrl, 'isNoEmpty', '上传路径不能为空&ccfwgl-uploadPath');
    validate.add(Vm.json.uploadUrl, 'isVaildUrl', '路径非法&ccfwgl-uploadPath');
    validate.add(Vm.json.downloadUrl, 'isNoEmpty', '下载路径不能为空&ccfwgl-downloadPath');
    validate.add(Vm.json.downloadUrl, 'isVaildUrl', '路径非法&ccfwgl-downloadPath');
    //validate.add(Vm.json.pointPlayUrl,'isNoEmpty','点播路径不能为空');
    let closure = ajaxMethod.before(validate.start.bind(validate));
    return closure();
}
//配置测试弹框ip,端口验证逻辑
function testStorageValidateForm(Vm, ajaxMethod) {
    let validate = new FaajValidate();
    validate.add(Vm.json.ip, 'isNoEmpty', 'IP不能为空&ccfwgl-ip');
    validate.add(Vm.json.ip, 'testIpNotPort', 'IP格式不正确&ccfwgl-ip');
    validate.add(Vm.json.port, 'isNoEmpty', '端口不能为空&ccfwgl-port');
    validate.add(Vm.json.port, 'isNumber', '端口必须为数字(正整数)&ccfwgl-port');
    validate.add(Vm.json.port, 'testPortRange', '端口不符合0~65535范围&ccfwgl-port');
    validate.add(Vm.json.port, 'includeSpecialChar', '端口不能包含特殊字符&ccfwgl-port');
    let closure = ajaxMethod.before(validate.start.bind(validate));
    return closure();
}

//显示表单错误信息
function showFormErrorTips(errMsg) {
    return `<span class="ccfwgl-error-tips">${errMsg}</span>`;
}
// 限制两秒有效发请求一次
let timeLimitQuery = (function () {
    let timer = null;
    return function (fn, limitTime, arg) {
        let now = new Date().getTime();
        let limit = now - timer;
        if (limit > limitTime)
            fn.apply(null, arg);
        timer = now;
    };
})();

//获取对象中的values
function getValues(arr, attr) {
    let ret = [];
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] == 'object') {
            for (var key in arr[i]) {
                if (key == attr)
                    ret.push(arr[i][key]);
            }
        } else {
            ret.push(arr[i]);
        }
    }
    return ret;
}
//判断数组中是否含有某个值
function contains(arr, value) {
    let flag = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            flag = true;
        }
    }
    return flag;
}
//获取对象中符合条件的某个对象
function getMatch(arr, attr, value) {
    var match = null;
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] == 'object') {
            for (var key in arr[i]) {
                if (key == attr && arr[i][key] == value)
                    match = arr[i];
            }
        }
    }
    return match;
}
//去除数据前后空格
function trimData(json) {
    for (let i in json) {
        json[i] = $.trim(json[i]);
    };
    return json;
}


/* 接口 */
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
        //url:'/gmvcs/uap/org/find/root',
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        //url: '/gmvcs/uap/org/all',
        //   url: '/api/tyywglpt-cczscfwgl',

        method: 'get',
        cache: false
    });
}

/*
 *分级获取部门
 *  */
function getOrgbyExpand(orgId, checkType) {
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + orgId + '&&checkType=' + checkType,
        method: 'get',
        cache: false
    });

}

/* 获取列表记录 */
function getTableData(orgId, page = 0, pageSize = 20, orgPath) {
    
    return ajax({
        url: '/gmvcs/uom/storage/workstation/get',
        // url:"../../mock/ccfwgl-baqspccgl.json",
        // url:"/gmvcs/baq/casedownloadmonitor/findCaseStorage",
        method: 'post',
        data: {
            orgId: orgId || null,
            type: 2,
            page: page,
            pageSize: pageSize,
            orgPath: orgPath,
            // caseAreaId:orgId
        }
    });
}
/* 修改 */
function modifyAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/modify',
        // url:'/gmvcs/baq/casedownloadmonitor/modify',
        method: 'post',
        data: trimData(json.$model)
    });
}
/* 添加 */
function addAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/add',
        // url:'/gmvcs/baq/casedownloadmonitor/add',
        method: 'post',
        data: trimData(json.$model)
    });
}
/* 删除 */
function deleteAjax(serverIds) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/delete/' + serverIds,
        // url:'/gmvcs/baq /casedownloadmonitor/delete/' + serverIds,
        method: 'get'
    });
}
/* 存储策略确定*/
function methodComfirmAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/strategy/modify',
        // url:'/gmvcs/baq/casedownloadmonitor/storageTime',
        method: 'post',
        data: trimData(json)
    });
}
/* 获取存储分析图表数据*/
function getAnalysisDataAjax() {
    return ajax({
        url: '/api/ccfwgl-chart',
        method: 'get',
    });
}
/* 根据未分配办案区 */
function getZfYByOrgIdAjax(orgCode) {
    return ajax({
        // url: '/api/ccfwgl-chart',
        url: '/gmvcs/baq/casedownloadmonitor/findAreaUnallocated?orgCode=' + orgCode,
        method: 'get',
        cache: false,
        data: null
    });
}
/* 根据存储服务ID获取分配的执法记录仪列表 现在是改为获取右边已分配的部门*/
function getBmAjax(storageId,orgCode) {
    return ajax({
        // url: '/gmvcs/uom/storage/dsj/get?storageId=' + storageId,
        // url: '/gmvcs/baq/casedownloadmonitor/findAreaAllocat?storageId=' + storageId,
        url: '/gmvcs/baq/casedownloadmonitor/findAreaAllocat?storageId=' + storageId + '&&orgCode=' + orgCode,
        method: 'get',
        cache: false
    });
}
/*根据部门id获区所有子部门*/
function getOrgArrByOrgId(orgId) {
    return ajax({
        url: '/gmvcs/uap/org/find/mgrOrg/by/orgId?orgId=' + orgId,
        method: 'get'
    });
}
/* 办案区视频存储服务-分配部门 */
function bmAssignAjax(serviceId, caseAreaId) {
    return ajax({
        //url: '/gmvcs/uom/storage/dsj/alloc',
        // url: '/gmvcs/uom/storage/org/alloc',
        url:'/gmvcs/baq/casedownloadmonitor/areaAllocat',
        method: 'post',
        data: {
            // storageId: serverId,
            // orgCode: orgCode,
            storageId:serviceId,
            caseAreaId:caseAreaId
        }
    });
}
/* 模糊搜索执法记录仪 现改为模糊搜索部门*/
function searchBmAjax(searchInput) {
    return ajax({
        // url: '/gmvcs/uom/device/dsj/dsjInfo',
        // url: '/gmvcs/uom/device/dsj/orgInfo',
        url: '/gmvcs/uap/org/find/by/key?k=' + encodeURI(searchInput),
        method: 'get',
        cache: false,
        data: null

    });

}
/* 获取所有的执法记录仪，包含机构id */
function getAllStationsAjax() {
    return ajax({
        url: '/gmvcs/uom/device/workstation/org/all',
        method: 'get'
    });
}
/*配置测试接口 */
function testStorageAvailableAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/service/available?Ip=' + json.ip + '&Port=' + parseInt(json.port),
        method: 'get'
    });
}





var data0 = splitData([
    ['2013/1/24', 2320.26, 2320.26, 2287.3, 2362.94],
    ['2013/1/25', 2300, 2291.3, 2288.26, 2308.38],
    ['2013/1/28', 2295.35, 2346.5, 2295.35, 2346.92],
    ['2013/1/29', 2347.22, 2358.98, 2337.35, 2363.8],
    ['2013/1/30', 2360.75, 2382.48, 2347.89, 2383.76],
    ['2013/1/31', 2383.43, 2385.42, 2371.23, 2391.82],
    ['2013/2/1', 2377.41, 2419.02, 2369.57, 2421.15],
    ['2013/2/4', 2425.92, 2428.15, 2417.58, 2440.38],
    ['2013/2/5', 2411, 2433.13, 2403.3, 2437.42],
    ['2013/2/6', 2432.68, 2434.48, 2427.7, 2441.73],
    ['2013/2/7', 2430.69, 2418.53, 2394.22, 2433.89],
    ['2013/2/8', 2416.62, 2432.4, 2414.4, 2443.03],
    ['2013/2/18', 2441.91, 2421.56, 2415.43, 2444.8],
    ['2013/2/19', 2420.26, 2382.91, 2373.53, 2427.07],
    ['2013/2/20', 2383.49, 2397.18, 2370.61, 2397.94],
    ['2013/2/21', 2378.82, 2325.95, 2309.17, 2378.82],
    ['2013/2/22', 2322.94, 2314.16, 2308.76, 2330.88],
    ['2013/2/25', 2320.62, 2325.82, 2315.01, 2338.78],
    ['2013/2/26', 2313.74, 2293.34, 2289.89, 2340.71],
    ['2013/2/27', 2297.77, 2313.22, 2292.03, 2324.63],
    ['2013/2/28', 2322.32, 2365.59, 2308.92, 2366.16],
    ['2013/3/1', 2364.54, 2359.51, 2330.86, 2369.65],
    ['2013/3/4', 2332.08, 2273.4, 2259.25, 2333.54],
    ['2013/3/5', 2274.81, 2326.31, 2270.1, 2328.14],
    ['2013/3/6', 2333.61, 2347.18, 2321.6, 2351.44],
    ['2013/3/7', 2340.44, 2324.29, 2304.27, 2352.02],
    ['2013/3/8', 2326.42, 2318.61, 2314.59, 2333.67],
    ['2013/3/11', 2314.68, 2310.59, 2296.58, 2320.96],
    ['2013/3/12', 2309.16, 2286.6, 2264.83, 2333.29],
    ['2013/3/13', 2282.17, 2263.97, 2253.25, 2286.33],
    ['2013/3/14', 2255.77, 2270.28, 2253.31, 2276.22],
    ['2013/3/15', 2269.31, 2278.4, 2250, 2312.08],
    ['2013/3/18', 2267.29, 2240.02, 2239.21, 2276.05],
    ['2013/3/19', 2244.26, 2257.43, 2232.02, 2261.31],
    ['2013/3/20', 2257.74, 2317.37, 2257.42, 2317.86],
    ['2013/3/21', 2318.21, 2324.24, 2311.6, 2330.81],
    ['2013/3/22', 2321.4, 2328.28, 2314.97, 2332],
    ['2013/3/25', 2334.74, 2326.72, 2319.91, 2344.89],
    ['2013/3/26', 2318.58, 2297.67, 2281.12, 2319.99],
    ['2013/3/27', 2299.38, 2301.26, 2289, 2323.48],
    ['2013/3/28', 2273.55, 2236.3, 2232.91, 2273.55],
    ['2013/3/29', 2238.49, 2236.62, 2228.81, 2246.87],
    ['2013/4/1', 2229.46, 2234.4, 2227.31, 2243.95],
    ['2013/4/2', 2234.9, 2227.74, 2220.44, 2253.42],
    ['2013/4/3', 2232.69, 2225.29, 2217.25, 2241.34],
    ['2013/4/8', 2196.24, 2211.59, 2180.67, 2212.59],
    ['2013/4/9', 2215.47, 2225.77, 2215.47, 2234.73],
    ['2013/4/10', 2224.93, 2226.13, 2212.56, 2233.04],
    ['2013/4/11', 2236.98, 2219.55, 2217.26, 2242.48],
    ['2013/4/12', 2218.09, 2206.78, 2204.44, 2226.26],
    ['2013/4/15', 2199.91, 2181.94, 2177.39, 2204.99],
    ['2013/4/16', 2169.63, 2194.85, 2165.78, 2196.43],
    ['2013/4/17', 2195.03, 2193.8, 2178.47, 2197.51],
    ['2013/4/18', 2181.82, 2197.6, 2175.44, 2206.03],
    ['2013/4/19', 2201.12, 2244.64, 2200.58, 2250.11],
    ['2013/4/22', 2236.4, 2242.17, 2232.26, 2245.12],
    ['2013/4/23', 2242.62, 2184.54, 2182.81, 2242.62],
    ['2013/4/24', 2187.35, 2218.32, 2184.11, 2226.12],
    ['2013/4/25', 2213.19, 2199.31, 2191.85, 2224.63],
    ['2013/4/26', 2203.89, 2177.91, 2173.86, 2210.58],
    ['2013/5/2', 2170.78, 2174.12, 2161.14, 2179.65],
    ['2013/5/3', 2179.05, 2205.5, 2179.05, 2222.81],
    ['2013/5/6', 2212.5, 2231.17, 2212.5, 2236.07],
    ['2013/5/7', 2227.86, 2235.57, 2219.44, 2240.26],
    ['2013/5/8', 2242.39, 2246.3, 2235.42, 2255.21],
    ['2013/5/9', 2246.96, 2232.97, 2221.38, 2247.86],
    ['2013/5/10', 2228.82, 2246.83, 2225.81, 2247.67],
    ['2013/5/13', 2247.68, 2241.92, 2231.36, 2250.85],
    ['2013/5/14', 2238.9, 2217.01, 2205.87, 2239.93],
    ['2013/5/15', 2217.09, 2224.8, 2213.58, 2225.19],
    ['2013/5/16', 2221.34, 2251.81, 2210.77, 2252.87],
    ['2013/5/17', 2249.81, 2282.87, 2248.41, 2288.09],
    ['2013/5/20', 2286.33, 2299.99, 2281.9, 2309.39],
    ['2013/5/21', 2297.11, 2305.11, 2290.12, 2305.3],
    ['2013/5/22', 2303.75, 2302.4, 2292.43, 2314.18],
    ['2013/5/23', 2293.81, 2275.67, 2274.1, 2304.95],
    ['2013/5/24', 2281.45, 2288.53, 2270.25, 2292.59],
    ['2013/5/27', 2286.66, 2293.08, 2283.94, 2301.7],
    ['2013/5/28', 2293.4, 2321.32, 2281.47, 2322.1],
    ['2013/5/29', 2323.54, 2324.02, 2321.17, 2334.33],
    ['2013/5/30', 2316.25, 2317.75, 2310.49, 2325.72],
    ['2013/5/31', 2320.74, 2300.59, 2299.37, 2325.53],
    ['2013/6/3', 2300.21, 2299.25, 2294.11, 2313.43],
    ['2013/6/4', 2297.1, 2272.42, 2264.76, 2297.1],
    ['2013/6/5', 2270.71, 2270.93, 2260.87, 2276.86],
    ['2013/6/6', 2264.43, 2242.11, 2240.07, 2266.69],
    ['2013/6/7', 2242.26, 2210.9, 2205.07, 2250.63],
    ['2013/6/13', 2190.1, 2148.35, 2126.22, 2190.1]
]);


function splitData(rawData) {
    var categoryData = [];
    var values = []
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i])
    }
    return {
        categoryData: categoryData,
        values: values
    };
}

function calculateMA(dayCount) {
    var result = [];
    for (var i = 0, len = data0.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data0.values[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}
//用于判断选择的数据是否来自级联平台
function judgeCheckboxData(data) {
    let arr = [];
    avalon.each(data, function (index, value) {
        if (value.source) {
            arr.push(index);
        }
    });
    //let stringtip ='';
    // if(arr.length>0){
    //     avalon.each(arr, function (index,val) {
    //         stringtip = stringtip + val + ',';
    //     })
    // }
    if (arr.length > 0) return true;
    return false;
}
//用于重置配置测试按钮样式
function clearBtnConfig() {
    vm.txt_configTest = "配置测试";
}
//用于配置按钮、取消按钮、取消图标样式的切换
function toggleClassConfigCancel() {
    $('.test-btn').toggleClass("testing"); //配置测试按钮
    $(".ccfwglAddModify .com-modal-btn-cancle").toggleClass("disabled"); //取消按钮
    $(".ccfwglAddModify .com-modal-modal-close-x").toggleClass("disabled"); //取消图标
}

//分配办案区弹窗====================================================================================
let common_assign_vm = avalon.define({
    $id: 'ccfwgl_common_assign',
    title: "存储分配",
    modalWidth: 720,
    okText: '',
    show: false,
    allchecked: false,
    
    leftDisabled: true,//是否允许向左分配
    rightDisabled: true,//是否允许向右分配

    leftData: [],  //左侧未分配办案区数据 这里是点击产生的一个办案区数据
    rightData: [],//右侧已分配办案区数据  这里是点击产生的一个办案区数据

    assignCaseAreaIdArr: [],//存储部门展开后的办案区ID
    

    alreadyAssignCaseAreaId:[],//已经分配的办案区id
    /**
     * @description: 存储分配 取消
     * @param {type} 
     * @return: 
     */
    handleCancel(e) {
        common_assign_vm.show = false;
        common_assign_vm.queryParam = '';
    },
    /**
     * @description: 存储分配 确定
     * @param {type} 
     * @return: 
     */
    handleOk() {
        let serverId = getServerId();
        let rightArr = common_assign_vm.alreadyAssignCaseAreaId;//在 clickleft和clickright操作新增和删除
       
        bmAssignAjax(serverId, rightArr).then((ret) => {
            if (ret.code == 0) {
                showMessage('success', '分配存储成功！');
                common_assign_vm.show = false;
                common_assign_vm.queryParam = '';
                common_assign_vm.alreadyAssignCaseAreaId = [];
            } else {
                showMessage('error', '分配存储失败！');
            }
        });      
            
    },
    
    clickleft() { //    左侧数据向右侧分配 （未分配》已分配）
        if (common_assign_vm.rightDisabled){
            return;
        }        

        let _this = this;
        _this.leftData;
        var treeObj = $.fn.zTree.getZTreeObj("baqtree");
        var treeObjAssign = $.fn.zTree.getZTreeObj("baqtreeAssign");
        avalon.each(common_assign_vm.leftData, function (index, item) {
            let node = treeObj.getNodeByParam("key", $.trim(item.key), null);
            let nodeParentKey = node.getParentNode().key;
            //添加办案区ID
            // _this.assignCaseAreaIdArr.push(item.key);
            let tmpArr = common_assign_vm.alreadyAssignCaseAreaId;
            if (tmpArr.length > 0) {
                for (var i = 0; i < tmpArr.length; i++) {
                    if (tmpArr[i] != item.key) {
                        tmpArr.push(item.key);
                    }
                }
            } else {
                tmpArr.push(item.key);
            }
            
            common_assign_vm.alreadyAssignCaseAreaId=tmpArr;
            //删除左侧勾选数据
            treeObj && treeObj.removeNode(node);
            //添加右侧新增数据    
            treeObjAssign.addNodes(treeObjAssign.getNodeByParam("key", $.trim(nodeParentKey), null), -1, item);
         });
       
        common_assign_vm.leftData = [];
        common_assign_vm.rightDisabled = true;
        treeObj.checkAllNodes(false);
    },
    clickright() {//    右侧数据向左侧分配 （已分配》未分配）
        if (common_assign_vm.leftDisabled){
            return;
        }        
        let _this = this;
        var treeObj = $.fn.zTree.getZTreeObj("baqtree");
        var treeObjAssign = $.fn.zTree.getZTreeObj("baqtreeAssign");       

        avalon.each(common_assign_vm.rightData, function (index, item) {//处理这个点击产生的办案区，只有一个
            let node = treeObjAssign.getNodeByParam("key", $.trim(item.key), null);
            let nodeParentKey = node.getParentNode().key;

            
            //删除的办案区ID
            let tmpArr = common_assign_vm.alreadyAssignCaseAreaId;
            for (var i = 0; i < tmpArr.length; i++) {
                if (tmpArr[i] == item.key) {
                    tmpArr.splice(i,1);
                }
            }
            common_assign_vm.alreadyAssignCaseAreaId=tmpArr;
            
            //删除左侧勾选数据
            treeObjAssign && treeObjAssign.removeNode(node);
            //添加右侧新增数据    
            treeObj.addNodes(treeObj.getNodeByParam("key", $.trim(nodeParentKey), null), -1, item);
         });
       
        common_assign_vm.rightData = [];
        common_assign_vm.leftDisabled = true;
        treeObjAssign.checkAllNodes(false);
    },
    rightClose(treeId, treeNode) {
        onChecked(null,treeId, treeNode);
        this.clickright();
    },
    checkAllbaq(e) {
        var treeObj = $.fn.zTree.getZTreeObj("baqtreeAssign");
        if (e.target.checked) {
            treeObj.checkAllNodes(true);
        } else {
            treeObj.checkAllNodes(false);
        }
    },
    //以下是办案区树的全部代码
    queryParam: '',
    handlePress(event) {
        let keyCode = event.keyCode || event.which;
        if (keyCode == 13) {
            this.query();
        } else if (keyCode === 32 && event.target.selectionStart === 0) {
            return false;
        }
    },
    query() {
        zTreeInit("baqtree", handleToTreeData(common_assign_vm.orgData));
        zTreeInit("baqtreeAssign", handleToTreeData(common_assign_vm.orgData));
        // 去除高亮
        let treeObj = $.fn.zTree.getZTreeObj("baqtree");
        if (highlightNodes.length) {
            for (var i = 0; i < highlightNodes.length; i++) {
            highlightNodes[i].highlight = false;
            treeObj.updateNode(highlightNodes[i]);
            }
            highlightNodes = [];
        }
        findAreaByKey(this.queryParam).then(result => {
            if (result.code == 0) {
                if (result.data.length == 0) {
                    showMessage('success', '搜索成功，暂无搜索数据');
                    return;
                }                
                if (result.data) {
                    avalon.each(result.data, function (index, item) { 
                        findonExpandtNodes(item.orgPath,item.baqId);
                    });                    
                }
            }
        })
    },
    orgData: [],  
   
});
let treeObj = null;

function zTreeInit(treeId,zTreeNodes) {
  let setting = {
      data: {
        key: {
          title: "title",
          name: "name"
        }
      },
      view: {
        // selectedMulti: false,
        fontCss: getFontCss,
        addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
      },
      callback: {
        beforeExpand: zTreeBeforeExpand,
        onExpand: zTreeOnExpand,
        onCollapse: zTreeOnCollapse,
        beforeAsync: zTreeBeforeAsync,
        onAsyncSuccess: onAsyncSuccess,
        // onAsyncError: zTreeOnAsyncError,
        //   onCheck: onChecked,
        onClick:onChecked,
        // beforeCheck: zTreeBeforeCheck,
        onDblClick: zTreeOnDblClick
      },
      check: {
        enable: false,
        // chkStyle: "checkbox",
        // chkboxType: {
        //   Y: "ps",
        //   N: "ps"
        // }
      },
      async: {
        enable: true,
        type: "get",
        dataType: "json",
        url: apiUrl + "/gmvcs/uap/org/find/by/parent/mgr",
        autoParam: ["orgId=pid", "checkType=checkType"],
        dataFilter: ajaxDataFilter
      }
    },
    treeObj = $.fn.zTree.init($("#" + treeId), setting, zTreeNodes);
}
/**
 *设置树样式
 *
 * @param {*} treeId
 * @param {*} treeNode
 * @returns
 */
function getFontCss(treeId, treeNode) {
    return !!treeNode.highlight ? {
      color: "#A60000",
      "font-weight": "bold"
    } : {
      color: "#333",
      "font-weight": "normal"
    };
  }
  function zTreeBeforeExpand(treeId, treeNode) {
    // console.log(treeId,treeNode);
}
function zTreeOnCollapse(event, treeId, treeNode) {
    if (treeId == "baqtree") {
        var baqtreeAssign = $.fn.zTree.getZTreeObj("baqtreeAssign");
        baqtreeAssign.expandNode(baqtreeAssign.getNodeByParam("path", $.trim(treeNode.path), null), false, false, true);
    }if(treeId == "baqtreeAssign"){
        var baqtree = $.fn.zTree.getZTreeObj("baqtree");
        baqtree.expandNode(baqtree.getNodeByParam("path", $.trim(treeNode.path), null), false, false, true);
    }
 }

function zTreeOnExpand(event, treeId, treeNode) {
    if (treeId == "baqtree") {
        var baqtreeAssign = $.fn.zTree.getZTreeObj("baqtreeAssign");
        baqtreeAssign.expandNode(baqtreeAssign.getNodeByParam("path", $.trim(treeNode.path), null), true, false, true);
    }if(treeId == "baqtreeAssign"){
        var baqtree = $.fn.zTree.getZTreeObj("baqtree");
        baqtree.expandNode(baqtree.getNodeByParam("path", $.trim(treeNode.path), null), true, false, true);
    }
}
  /**
 *用于捕获异步加载之前的事件回调函数，zTree 根据返回值确定是否允许进行异步加载
 *
 * @param {*} treeId 对应 zTree 的 treeId
 * @param {*} treeNode 进行异步加载的父节点 JSON 数据对象
 */
function zTreeBeforeAsync(treeId, treeNode) {
    if (!treeNode) {
      return false;
    }
    if (!treeNode.key) {
      return false;
    }
    // if (vm.isJustParent) return; // 只显示父级
    // return !isDSJDevice(treeNode.type);
}
  /**
 *双击
 *
 * @param {*} event
 * @param {*} treeId
 * @param {*} treeNode
 */
function zTreeOnDblClick(event, treeId, treeNode) {
    // if (!treeNode || treeNode.icon == orgIcon) {
    //   return;
    // }
    // treeObj.checkNode(treeNode, true, true, true);
}
function ajaxDataFilter(treeId, parentNode, responseData) {
    if (responseData.code == 0) {
      return handleToTreeData(responseData.data, false, parentNode);
    } else {
      return [];
    }
}
  /**
 *树节点处理
 *
 * @param {Array} data
 * @param {boolean} isSearch 是否是查询
 * @param {boolean} parentNode 父节点
 * @returns 返回标准树节点
 */
function handleToTreeData(data = [], isSearch = false, parentNode) {
    if (!data.length) {
      return [];
    }
  
    let treeData = [];
    data.forEach(item => {
        let treeNode = {};
        treeNode.key = item.orgId;
        treeNode.checkType = item.checkType;
        treeNode.orgCode = item.orgCode;
        treeNode.orgId = item.orgId;
        treeNode.orgPath = item.orgPath;
        treeNode.name = item.orgName;
        treeNode.title = item.orgName;
        treeNode.path = item.path;
        treeNode.isParent = true;
        treeNode.icon = "/static/image/sszhxt/org.png";
        treeNode.isHidden = false;
        treeNode.check = false;
        treeNode.highlight = false;
        treeData.push(treeNode);
    });
  
    return treeData;
}
  /**
 *设置checkbox 禁用
 *
 * @param {*} treeNode 节点
 */
function setChkDisabled(treeNode) {
    if (treeNode.online == 0) {
      treeObj.checkNode(treeNode, false, false, true);
      treeObj.setChkDisabled(treeNode, true);
    } else {
      treeObj.setChkDisabled(treeNode, false);
    }
}
/**
 * @description: 部门树加载完成后，添加部门下的办案区
 * @param {type} 
 * @return: 
 */
function onAsyncSuccess(event, treeId, treeNode, ret) {
    if (treeId == "baqtree") {
        var baqtreeAssign = $.fn.zTree.getZTreeObj("baqtreeAssign");
        baqtreeAssign.expandNode(baqtreeAssign.getNodeByParam("path", $.trim(treeNode.path), null), true, false, true);
        getZfYByOrgIdAjax(treeNode.orgCode).then((result) => {
            if (result.data) {
                if (result.data.length == 0) { return;}
                let treeData = [];
                result.data.forEach(item => {
                    let treeNode = {};
                    treeNode.key = item.caseAreaId;
                    treeNode.name = item.caseAreaName;
                    treeNode.title = item.caseAreaName;
                    // treeNode.checkType = item.checkType;
                    // treeNode.orgCode = item.orgCode;
                    // treeNode.orgId = item.orgId;
                    // treeNode.orgPath = item.orgPath;
                    treeNode.path = item.orgPath;
                    treeNode.icon = "/static/image/tyywglpt-ccfwgl/baq.png?__sprite";
                    treeNode.isBAQ = true;
                    treeData.push(treeNode);
                });
                var treeObj = $.fn.zTree.getZTreeObj("baqtree");
                treeObj.addNodes(treeNode, -1, treeData);
            }
        });
    } else if(treeId == "baqtreeAssign"){
        var baqtree = $.fn.zTree.getZTreeObj("baqtree");
        baqtree.expandNode(baqtree.getNodeByParam("path", $.trim(treeNode.path), null), true, false, true);
        getBmAjax(getServerId(),treeNode.orgCode).then((result) => {
            if (result.data) {
                if (result.data.length == 0) { return;}
                let treeData = [];
                result.data.forEach(item => {
                    let treeNode = {};
                    treeNode.key = item.caseAreaId;
                    treeNode.name = item.caseAreaName;
                    treeNode.title = item.caseAreaName;
                    treeNode.path = item.orgPath;
                    treeNode.icon = "/static/image/tyywglpt-ccfwgl/baq.png?__sprite";
                    treeNode.isBAQ = true;
                    treeData.push(treeNode);

                    //添加办案区ID
                    common_assign_vm.assignCaseAreaIdArr.push(item.caseAreaId);//
                });
                var treeObj = $.fn.zTree.getZTreeObj("baqtreeAssign");
                treeObj.addNodes(treeNode, -1, treeData);
            }
        });
    }
}
function onChecked(event, treeId, treeNode) {
    
    // if (!event) {
    //     return false;
    // }
    if (!treeNode&&!treeNode.isBAQ) {
      return false;
    }
    
    var baqtree = $.fn.zTree.getZTreeObj("baqtree");
    var baqtreeAssign = $.fn.zTree.getZTreeObj("baqtreeAssign");
    
   
    if (treeId == "baqtree") {
        if (treeNode.isBAQ) {
            common_assign_vm.leftData = [];
            common_assign_vm.leftData.push(treeNode);
            common_assign_vm.rightDisabled = false;
            common_assign_vm.leftData = distinct(common_assign_vm.leftData);//数组去重
        }
        // var nodes = baqtree.getNodesByParam("isBAQ", true, null);//获取所有办案区
        // avalon.each(nodes, function (index, item) {
        //     let checkData = {};
        //     checkData.key = item.key;
        //     checkData.name = item.name;
        //     checkData.title = item.title;
        //     checkData.checkType = item.checkType;
        //     checkData.orgCode = item.orgCode;
        //     checkData.orgId = item.orgId;
        //     checkData.orgPath = item.orgPath;
        //     checkData.icon = "/static/image/tyywglpt-ccfwgl/baq.png?__sprite";
        //     checkData.isBAQ = item.isBAQ;
        //     checkData.path = item.path;
        //     if (item.checked) {            
        //         common_assign_vm.leftData.push(checkData);
        //         common_assign_vm.rightDisabled = false;
        //     } else {
        //         if (common_assign_vm.leftData.length > 0) {                
        //             avalon.each(common_assign_vm.leftData, function (index, data) {
        //                 if (data.key == item.key) {
        //                     common_assign_vm.leftData.splice(index, 1);
        //                     if (common_assign_vm.leftData.length == 0) {
        //                         common_assign_vm.rightDisabled = true;
        //                     }
        //                 }
        //             });
        //         }
        //     }
        //  });
    } else if (treeId == "baqtreeAssign") {
        if (treeNode.isBAQ) {
            common_assign_vm.rightData = [];
            treeNode.highlight = false;
            common_assign_vm.rightData.push(treeNode);
            common_assign_vm.leftDisabled = false;
            common_assign_vm.rightData = distinct(common_assign_vm.rightData);            
        }
        
    }
    
}
  
function findonExpandtNodes(path, baqID, checkNode = false) {
    let treeObj = $.fn.zTree.getZTreeObj("baqtree");
    // 将部门路径字符串转化为数组
    let newPath = [];
  
    path.split("/").forEach(item => {
      if (item) {
        newPath.push(item);
      }
    });
  
    let tenpPath = [];
    for (let k = 0; k < newPath.length; k++) {
      let str = "";
      for (let l = 0; l <= k; l++) {
        str = str + "/" + newPath[l];
      }
      tenpPath.push(str + "/");
    }
  
    let len = tenpPath.length;
    let IT = null;
    let i = 0;
    if (len) {
      let parentNode = null;
      IT = setInterval(() => {
        if (i > len - 1) {
          clearInterval(IT);
          if (checkNode) {
            //查找节点
            let node = treeObj.getNodeByParam("path", $.trim(path), null);
            if (node) {
              treeObj.showNode(node); //显示查到节点
              treeObj.checkNode(node, true, true, false);
            }
          } else {
            getNodesByParam(path, baqID, treeObj);
          }
          return true;
        }
  
        let nodes = treeObj.getNodesByParam("path", tenpPath[i++], parentNode);
  
        if (nodes.length > 0) {
          if (checkNode) {
            // 判断节点是否已经加载过，如果已经加载过则不需要再加载
            if (!nodes[0].zAsync) {
              treeObj.reAsyncChildNodes(nodes[0], "", true);
            }
          } else {
            treeObj.expandNode(nodes[0], true, false, true);
          }
        } else {
          i--;
        }
      }, 200);
    }
}
let highlightNodes = [];
function getNodesByParam(value, baqId, treeObj) {
    
  
    //查找节点
    var nodes = treeObj.getNodesByParam("path", $.trim(value), null);
    avalon.each(nodes, function (index, node) {
        if (node&&node.isBAQ&&node.key==baqId) {
            treeObj.showNode(node); //显示查到节点
            if (node.getParentNode()) {
                treeObj.showNode(node.getParentNode()); //显示其父节点
                treeObj.expandNode(node.getParentNode(), true, false, true); //展开所有查询到的内容
            }
            node.highlight = true;
            highlightNodes.push(node);
            treeObj.updateNode(node);
        }
    });
}
  /* 根据关键字查询为分配办案区*/
function findAreaByKey(key) {
    return ajax({
        url: '/gmvcs/baq/casedownloadmonitor/findAreaByKey?key='+key,
        method: 'get',
        data: {}
    });
}

function findAllArea(storageId,userCode) {
    return ajax({
        url: '/gmvcs/baq/casedownloadmonitor/findAllArea?storageId=' + storageId + '&&userCode=' + userCode,
        method: 'get',
        data: {}
    });
}
function distinct(arr) {
    let result = [],
     i,
     j,
     len = arr.length;
    for (i = 0; i < len; i++) {
        for (j = i + 1; j < len; j++) {
            if (arr[i].key === arr[j].key) {
                j = ++i;
            }
        }
        result.push(arr[i]);
    }
    return result;
}

function addHoverDom(treeId, treeNode) {
    if (treeId == 'baqtree') { return; }
    if (!treeNode.isBAQ) { return;}
	var aObj = $("#" + treeNode.tId + "_a");
	if ($("#diyBtn_"+treeNode.id).length>0) return;
	var editStr = "<span class='close-line'><span id='diyBtn_" +treeNode.id+ "' class='closeBtn'></span> </span>";
	aObj.append(editStr);
	var btn = $("#diyBtn_"+treeNode.id);
    if (btn) btn.bind("click", function (e) {
        common_assign_vm.rightClose(treeId, treeNode);
        e.stopPropagation();
    });
};
function removeHoverDom(treeId, treeNode) {
	$("#diyBtn_"+treeNode.id).unbind().remove();
};