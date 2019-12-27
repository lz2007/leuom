import ajax from '/services/ajaxService';
import * as menuServer from '/services/menuService';
import {
    createForm,
    notification,
} from 'ane';
import {
    apiUrl,
} from '/services/configService';
require('/apps/common/common-ajax-fileupload');
import '/vendor/jquery/jquery.ztree.all.js';
import moment from 'moment';
import Sbzygl from '/apps/common/common-sbzygl';
require('./sszhxt-znsb-bk.less');
import {
    picFuc
} from "/vendor/pic_player/picasa.js";
import '/apps/common/common-ms-table/common-ms-table';
import '/apps/common/common-progress';
let storage = require('/services/storageService.js').ret;
let sbzygl = null;

export const name = 'sszhxt-znsb-bk';

Array.prototype.in_array = function (e) {
    var r = new RegExp(',' + e + ',');
    return (r.test(',' + this.join(this.S) + ','));
};

let cpk_man = null;
avalon.component(name, {
    template: __inline('./sszhxt-znsb-bk.html'),
    defaults: {
        // 权限控制
        CAS_FUNC_TYYHRZPT: [],
        newAddCPKtypeObj: {}, //新增人员库
        tree_data: [], //人员类型库数据
        selectCPKId: '', //左侧选中的人员库ID

        // 右侧勾选的列表行ID

        checked_cpkInfo: [], //保存勾选对象
        checked_cpkInfoID: [], //保存勾选对象ID        

        search_close: false,
        isClick: true, //如果是 edit/empty/del，就不查询
        newCount: '1',
        CPK_DELETE: true,

        showIconForTree(treeId, treeNode) {
            return !treeNode.isParent;
        },
        searchFunc() {
            if(!this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_SEARCH) {
                notification.warn({
                    message: '暂无查询权限，请联系管理员！',
                    title: "温馨提示"
                });
                return;
            }
            this.change_page = false;
            this.curPage = 1;
            this.table_pagination.current = 1;
            Tools.listAllByPageCPKInfo();
        },

        input_focus(e) {
            switch (e) {
                case 'search':
                    this.search_close = true;
                    break;
                default:
            }
        },
        input_blur(e, name) {
            //修复查询输入框复制黏贴bug
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            $('#exampleInputAmount').val = $(e.target).val();
            switch (name) {
                case 'search':
                    this.search_close = false;
                    break;
                default:
            }
        },
        close_click(e) {
            switch (e) {
                case 'search':
                    $('#exampleInputAmount').val('');
                    $('#exampleInputAmount').attr("title", "");
                    $('#exampleInputAmount').focus();
                    break;
                default:
            }
        },
        // 显示树 
        show_cpk_tree(zTreeNodes) {
            let setting = {
                    view: {
                        // addHoverDom: Tools.addHoverDom,
                        // removeHoverDom: Tools.removeHoverDom,
                        selectedMulti: false,
                        showIcon: false,
                        showLine: false
                    },
                    edit: {
                        enable: false
                        // showRemoveBtn: true,
                        // showRenameBtn: true
                    },
                    data: {
                        keep: {
                            parent: true,
                            leaf: true
                        }
                    },
                    callback: {
                        onClick: this.click_tree,
                        onRename: this.edit,
                        onRemove: Tools.deleteCPK,
                    }
                },
                zTreeObj = $.fn.zTree.init($("#rykTree"), setting, zTreeNodes);
        },

        click_tree(event, treeId, treeNode) {
            if (!this.isClick) {
                return;
            }
            this.selectCPKId = treeNode.id;

            if (treeNode.id == '9999') {
                return;
            } //点击全部，不作处理
            if (this.selectCPKId === 0 || this.selectCPKId) {
                //移除置灰样式
                $('.newAdd-disabled').removeClass('selectedCPK');

                $('.BatchImport-disabled').removeClass('selectedCPK');
                $('.addFail-disabled').removeClass('selectedCPK');
                $('.carType-disabled').removeClass('selectedCPK');
                $('.carModelExl-disabled').removeClass('selectedCPK');

                $('.input-group-addon').addClass('input-group-addonOK');
            }
            this.searchFunc();
            // if (treeNode.level == 0) { return false; }
            // var zTree = $.fn.zTree.getZTreeObj("rykTree"),
            //     nodes = zTree.getSelectedNodes(),
            //     treeNode = nodes[0];
            // if (nodes.length == 0) {
            //     alert("请先选择人员类型库");
            //     return;
            // }
            // zTree.editName(treeNode);
        },

        // 新增人员库
        addCPK(e) {
            // Tools.saveCPK();
            addPersonDb.inputJson.personDbName = '';
            addPersonDb.inputJson.personDbDesc = '';
            this.dialogAddCarDb = true;
            addPersonDb.isEdit = false;
        },
        edit(treeNode) {
            this.dialogAddCarDb = true;

            addPersonDb.inputJson.personDbName = treeNode.name;
            addPersonDb.inputJson.personDbDesc = treeNode.dbDesc;
            addPersonDb.treeNode = treeNode;
            addPersonDb.isEdit = true;
        },

        // =====================================================左侧列表=================================================================       
        dialogCarDbCancel() {
            this.isClick = true;
            this.dialogAddCarDb = false;
        },
        dialogCarDbOk() {
            if (addPersonDb.isEdit) {
                addPersonDb.treeNode = addPersonDb.treeNode;
                addPersonDb.treeNode.dbName = addPersonDb.inputJson.personDbName;
                addPersonDb.treeNode.dbDesc = addPersonDb.inputJson.personDbDesc;
                Tools.editCPK(addPersonDb.treeNode);
            } else {
                Tools.saveCPK();
            }
        },
        //弹窗-新增人员库类型
        dialogAddCarDb: false,
        // 弹窗-新增
        dialogAddShow: false,
        // 图片放大弹窗
        dialogBigPicShow: false,
        // 弹窗-删除
        dialogDelShow: false,
        // 弹窗-删除人员库行信息
        dialogDelLineShow: false,
        // 弹窗-批量导入
        dialogImportShow: false,
        // 弹窗-新增失败
        dialogaddFailShow: false,
        // 弹窗-人员类型库设置
        dialogRylxkszShow: false,
        // 弹窗-人员类型库设置 删除
        dialogRylxkszDelShow: false,
        deleteType: 'deleteItem', // deleteItem 删除一项人员库  cleanItem 清空人员库下的人员信息

        change_page: false,
        search_data: {},

        loading: false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        // 表格
        list: [],
        curPage: 1,
        //翻页
        $computed: {
            pagination: function () {
                return {
                    current: this.table_pagination.current,
                    pageSize: this.table_pagination.pageSize,
                    total: this.table_pagination.total,
                    onChange: this.handlePageChange
                };
            }
        },
        getCurrent(current) {
            this.table_pagination.current = current;
            this.curPage = current;
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
        },
        handlePageChange(page) {

            this.change_page = true;
            this.curPage = page;
            this.table_pagination.current = page;
            Tools.listAllByPageCPKInfo(); //查询
        },
        // 表格-操作回调
        actions(type, text, record, index) {
            if (type == 'delete') {
                cpk_man.click_dialogDelLine(record.personId);
            } else if (type == 'modify') {
                docDialogDdd.title = '修改';
                docDialogDdd.$form.record = record;
                
                docDialogDdd.personId = record.personId;
                docDialogDdd.keyPersonTypeId = record.keyPersonTypeId;
                docDialogDdd.personName = record.personName;
                docDialogDdd.idCard = record.idCard;
                docDialogDdd.birthDate = record.birthDate || '';
                docDialogDdd.keyPersonDetail = record.keyPersonDetail || '';
                docDialogDdd.personDistrict = record.personDistrict || '';
                docDialogDdd.personAddress = record.personAddress || '';
                docDialogDdd.personRegImg = record.personRegImg || '';
                docDialogDdd.remarks = record.remarks || '';
                cpk_man.dialogAddShow = true;
            } else if ((type == 'big')) {
                picVM.picSRC = record.personRegImg;
                cpk_man.dialogBigPicShow = true;
                $("#bigPic").attr("rel", "Picasa[" + encodeURI(record.personRegImg) + "]");
                let pic_obj = new picFuc();
                pic_obj.picasa_init("bigPic");
            }
        },

        // 权限
        opt_rlbk: avalon.define({
            $id: "opt_rlbk",
            authority: { // 按钮权限标识
                "CAS_FUNC_SBK_ZDRYK_EXPORT_TEMPLATE": false, // 导出模板
                "CAS_FUNC_SBK_ZDRYK_DELETE": false, // 删除
                "CAS_FUNC_SBK_ZDRYK_EDIT": false, // 修改
                "CAS_FUNC_SBK_ZDRYK_CREATE_FAIL": false, // 新增失败
                "CAS_FUNC_SBK_ZDRYK_EXPORT": false, // 批量导出
                "CAS_FUNC_SBK_ZDRYK_IMPORT": false, // 导入
                "CAS_FUNC_SBK_ZDRYK_SEARCH": false, // 查询
                "CAS_FUNC_SBK_ZDRYK_CREATE": false, // 新增
                
                "CAS_MENU_SBK_ZDRYK_LX": false, // 重点人员库类型
                "CAS_FUNC_SBK_ZDRYK_LX_EDIT": false, // 人员类型库-编辑
                "CAS_FUNC_SBK_ZDRYK_LX_SEARCH": false, // 人员类型库-查询
                "CAS_FUNC_SBK_ZDRYK_LX_DELETE": false, // 人员类型库-删除
                "CAS_FUNC_SBK_ZDRYK_LX_CREATE": false, // 人员类型库-新增
            }
        }),

        // 表格-勾选回调(表格一)
        selectChange(type, data) {
            let objs = this.list;
            this.checked_cpkInfo = [];
            objs.forEach((val, key) => {
                if (val.checked) {
                    this.checked_cpkInfo.push(val);
                }
            });
            if (this.checked_cpkInfo.length > 0) {
                $('.BatchExport-disabled').removeClass('selectedCPK');
                $('.BatchDelete-disabled').removeClass('selectedCPK');
            } else {
                $('.BatchExport-disabled').addClass('selectedCPK');
                $('.BatchDelete-disabled').addClass('selectedCPK');
            }

            if (type == 'one') {
                if (data.checked) {
                    //有勾选则保存勾选数据

                } else {

                }
            } else if (type == 'all') {
                if (data.checked) {

                } else {
                    this.checked_cpkInfo = [];
                }
            }
        },
        handleSelect(record, selected, selectedRows) {
            this.$selectOption = selectedRows;
            // Tools.banButton();
        },
        handleSelectAll(selectedRowKeys, selectedRows) {
            // this.$selectOption = selectedRows;
            // Tools.banButton();
        },

        dialogAddOk() {
            let params = docDialogDdd.$form.record;

            if (!params.personName) { //姓名
                notification.warn({
                    message: "请填写人员姓名！",
                    title: "温馨提示"
                });
                return;
            } else {
                if(Tools.getLength(params.personName) > 20) {
                    notification.warn({
                        message: "姓名字符长度不能超过20！",
                        title: "温馨提示"
                    });
                    return;
                }
            }

            if (!params.idCard) { //身份证号码
                notification.warn({
                    message: "请填写身份证号码！",
                    title: "温馨提示"
                });
                return;
            } else {
                let reg_idCard = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
                if(!reg_idCard.test(params.idCard)){//身份证格式错误
                    notification.warn({
                        message: "身份证号码格式有误！",
                        title: "温馨提示"
                    });
                    return;
                }
            }
            // if (!params.personDistrict) { // 户籍地区划
            //     notification.warn({
            //         message: "请填写户籍地区划！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }
            // if (!params.personAddress) { // 户籍地详址
            //     notification.warn({
            //         message: "请填写户籍地详址！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }
            // if (!params.keyPersonDetail) { // 重点人员细类
            //     notification.warn({
            //         message: "请填写重点人员细类！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }
            //判断注册照片
            // if (!docDialogDdd.personRegImg) {
            //     notification.warn({
            //         message: "请选择注册图片！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }

            docDialogDdd.save(); //保存
        },

        dialogAddCel() {
            this.dialogAddShow = false;
            // 关闭新增，初始化数据
            docDialogDdd.personId = '';
            docDialogDdd.keyPersonTypeId = '';
            docDialogDdd.personName = '';
            docDialogDdd.idCard = '';
            docDialogDdd.birthDate = '';
            docDialogDdd.keyPersonDetail = '';
            docDialogDdd.personDistrict = '';
            docDialogDdd.personAddress = '';
            docDialogDdd.personRegImg = '';
            docDialogDdd.remarks = '';
        },

        //返回
        click_back() {
            // let hash = "/sszhxt-sszh";
            // avalon.router.navigate(hash, 1);
            $('.nav-sszh-rzhy').trigger('click');
            // avalon.history.setHash(hash);
        },
        //人员类型库设置
        click_typeSet() {
            if ($('.carType-disabled').hasClass('selectedCPK')) {
                return;
            }
            this.dialogRylxkszShow = true;
        },

        // 人员信息导出模板
        click_exportModel() {
            if ($('.carModelExl-disabled').hasClass('selectedCPK')) {
                return;
            }
            Tools.exportCarTemplate();
        },


        // 新增按钮
        click_newAdd() {
            // 判断是否点击人员库
            if ($('.newAdd-disabled').hasClass('selectedCPK')) {
                return;
            }
            this.dialogAddShow = true;
            docDialogDdd.title = '新增';

        },
        // 批量导入按钮
        click_dialogBatchImport() {
            if ($('.BatchImport-disabled').hasClass('selectedCPK')) {
                return;
            }
            if (cpk_man.selectCPKId !== 0 && !this.selectCPKId) {
                notification.warn({
                    message: '请选择需要导入的人员库',
                    title: '温馨提示'
                });
                return;
            }
            this.dialogImportShow = true;
            importEXL.progress = 0;
        },
        // 批量删除按钮
        click_dialogDel() {
            if ($('.BatchDelete-disabled').hasClass('selectedCPK')) {
                return;
            }
            this.dialogDelShow = true;
            // if (this.checked_cpkInfo.length == 0) {
            //     this.dialogDelShow = false;
            //     notification.warn({
            //         message: '请勾选需要删除数据',
            //         title: '温馨提示'
            //     });
            //     return;
            // } else {
            //     this.dialogDelShow = true;
            // }
        },
        
        dialogDelCancel() {
            this.dialogDelShow = false;

            addFail.isdel = false;
            addFail.isBatchDel = false;
            this.cpkIsDel = false;
        },
        // 删除按钮
        tempDeleteCarId:'',
        click_dialogDelLine(personId) {
            cpk_man.tempDeleteCarId = '',
            cpk_man.tempDeleteCarId = personId,
            this.dialogDelLineShow = true;
        },
        dialogDelLineCancel() {
            this.dialogDelLineShow = false;
        },
        dialogPicCancel() {
            this.dialogBigPicShow = false;
        },
        dialogDelrylxkszCancel() {
            this.dialogRylxkszDelShow = false;
        },
        dialogDelrylxkszOK() {
            if(cpk_man.deleteType === 'deleteItem') {
                Tools.deleteCPK(rylxksz.selectLiData.id);            
            } else {
                Tools.deleteCPKCarsInfo(rylxksz.selectLiData.id);
            }
        },
        cpkIsDel: false,
        //删除按钮-确定        
        dialogDelCel() {
            //确认删除     
            // 新增失败   删除or全部删除
            if (addFail.isdel) {
                // 批量删除的人员新增失败记录
                Tools.batchDeleteAddFailInfo();
                return;
            }
            if (addFail.isBatchDel) {
                Tools.deleteCPKFailInfo(cpk_man.selectCPKId); //全部
                return;
            }
            if (this.cpkIsDel) {
                Tools.deleteCPK(cpk_man.selectCPKId);
                return;
            }
            //人员信息确认删除
            let objs = this.list;
            let ids = [];
            objs.forEach((val, key) => {
                if (val.checked) {
                    ids.push(val.personId);
                }
            });
            // Tools.batchDeleteCPKInfo(ids);
            Tools.deleteCPKInfo(ids.join(','));


        },
        //删除按钮-确定        
        dialogDelLineCel() { 
            if (cpk_man.tempDeleteCarId) {
                Tools.deleteCPKInfo(cpk_man.tempDeleteCarId);
                cpk_man.dialogDelLineShow = false;
            }
        },

        dialogImportOk() {
            if (importEXL.importUrl == '请选择导入文件路径') {
                notification.info({
                    message: "请先选择文件，谢谢",
                    title: "温馨提示"
                });
                return;
            }
            Tools.importCars();
        },

        dialogImportCel() {
            importEXL.importUrl = '请选择导入文件路径';
            this.dialogImportShow = false;
            importEXL.progress = 0;
        },

        // 批量导出按钮
        exportExcel() {
            if ($('.BatchExport-disabled').hasClass('selectedCPK')) {
                return;
            }
            if (cpk_man.selectCPKId !== 0 && !this.selectCPKId) {
                notification.warn({
                    message: '请选择需要导出的人员库',
                    title: '温馨提示'
                });
                return;
            }
            let ids = [];
            cpk_man.list.forEach((val, key) => {
                if (val.checked) {
                    ids.push(val.personId);
                }
            });
            let idCard = $("#exampleInputAmount").val();
            window.location.href = "http://" + window.location.host + apiUrl + '/gmvcs/uap/key-person/recognition/listAllByPage/excel?keyPersonTypeDbId=' + this.selectCPKId + '&&idCard=' + idCard + '&&keyPersonIdList=' + ids; //远程服务器使用       
        },
        //新增失败
        click_newFail() {
            if ($('.addFail-disabled').hasClass('selectedCPK')) {
                return;
            }
            addFail.list = [];
            addFail.endTime = moment().format('YYYY-MM-DD 23:59:59');
            addFail.beginTime = moment().format('YYYY-MM-DD 00:00:00');
            addFail.search();
            cpk_man.dialogaddFailShow = true;

        },

        dialogaddFailtOk() {

        },

        dialogaddFailCel() {
            this.dialogaddFailShow = false;
        },

        dialogRylxkszOk() {

            let selectedIds = [];
            avalon.each(rylxksz.personlistAll, (i, el) => {
                let obj = {};
                obj.enable = el.enable;
                obj.id = el.id;
                selectedIds.push(obj);
            });

            if (!selectedIds.length) {
                notification.warn({
                    message: '人员类型库至少勾选一选',
                    title: '温馨提示'
                });
                return false;
            }
            ajax({
                url: '/gmvcs/uap/key-person/type-db/updateEnableBatch',
                method: 'post',
                data: selectedIds
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '修改成功',
                        title: '温馨提示'
                    });
                    Tools.cpk_listAll();
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            });
            this.dialogRylxkszCel();
        },

        dialogRylxkszCel() {
            this.dialogRylxkszShow = false;
            rylxksz.isEditClick = false;
        },
        onInit(event) {
            // 初始化            
            // 获取权限
            menuServer.menu.then(menu => {
                for (let item in menu.SSZH_MENU_SSZHXT_ARR) {
                    this.CAS_FUNC_TYYHRZPT.push(item);
                }
                // this.CAS_FUNC_TYYHRZPT = menu.CAS_FUNC_TYYHRZPT;
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_EXPORT_TEMPLATE = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_EXPORT_TEMPLATE');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_DELETE = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_DELETE');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_EDIT = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_EDIT');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_CREATE_FAIL = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_CREATE_FAIL');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_EXPORT = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_EXPORT');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_IMPORT = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_IMPORT');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_SEARCH = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_SEARCH');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_CREATE = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_CREATE');
                this.opt_rlbk.authority.CAS_MENU_SBK_ZDRYK_LX = this.CAS_FUNC_TYYHRZPT.in_array('CAS_MENU_SBK_ZDRYK_LX');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_EDIT = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_LX_EDIT');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_SEARCH = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_LX_SEARCH');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_DELETE = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_LX_DELETE');
                this.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_CREATE = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_ZDRYK_LX_CREATE');
            });

            cpk_man = this;
            this.$watch("progress", (v) => {
                if (v && importEXL.progress == 100) {
                    cpk_man.dialogImportShow = false;
                    notification.success({
                        message: '批量导入成功！',
                        title: "温馨提示"
                    });
                    cpk_man.searchFunc();
                }
            });
            Tools.findByDicTypeCode(); //获取人员类型信息

            // 人员类型库设置list
            this.$watch('dialogRylxkszShow', newVal => {
                if (newVal) {
                    if(!cpk_man.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_SEARCH) return;
                    ajax({
                        url: '/gmvcs/uap/key-person/type-db/listAll?isListAll=true',
                        method: 'get'
                    }).then(ret => {
                        if (ret.code == 0) {
                            rylxksz.personlistAll = ret.data;

                            // 全选是否打钩
                            let flab = true;
                            for (let i = 0; i < rylxksz.personlistAll.length; i++) {
                                if (!rylxksz.personlistAll[i].enable) {
                                    flab = false;
                                    break;
                                }
                            }
                            if (flab) {
                                rylxksz.checkedAll = true;
                            }
                        }
                    });
                }
                rylxksz.showErr = false;
            });

            this.$watch('dialogAddShow', (v) => {
                if(!v) {
                    docDialogDdd.json = '';
                    docDialogDdd.carTypeObj = [];
                    docDialogDdd.personId = '';
                    docDialogDdd.keyPersonTypeId = '';
                    docDialogDdd.personName = '';
                    docDialogDdd.idCard = '';
                    docDialogDdd.birthDate = '';
                    docDialogDdd.keyPersonDetail = '';
                    docDialogDdd.personDistrict = '';
                    docDialogDdd.personAddress = '';
                    docDialogDdd.personRegImg = '';
                    docDialogDdd.remarks = '';
                    docDialogDdd.$form.resetFields();
                }else{
                    $('.hjdz').attr('maxlength',100);
                    $('.bz').attr('maxlength',255);
                }
            });

            this.$watch('dialogAddCarDb', (v) => {
                if(!v) {
                    addPersonDb.inputJson = {
                        "personDbName": "",
                        "personDbDesc": ""
                    };
                    addPersonDb.validJson = {
                        "personDbName": true,
                        "personDbDesc": true
                    };
                    addPersonDb.showJson = {
                        "personDbName": false,
                        "personDbDesc": false
                    };
                };
            });

            sbzygl = new Sbzygl(this);
        },
        onReady() {
            // 页面准备
            $("#addCKP").bind("click", {
                isParent: true
            }, this.addCPK);
            $(window).resize(function () {
                set_size();
                // tableObject_zfypsjj.setForm();
            });
            // $(".common-layout").css({
            //     "min-height": "870px"
            // })
            let storage_item = storage.getItem('sszhxt-znsb-bk');
            if (storage_item) {
                this.selectCPKId = storage_item.carTypeDbId;
                if (this.selectCPKId === 0 || this.selectCPKId) {
                    //移除置灰样式
                    $('.newAdd-disabled').removeClass('selectedCPK');

                    $('.BatchImport-disabled').removeClass('selectedCPK');
                    $('.addFail-disabled').removeClass('selectedCPK');
                    $('.carType-disabled').removeClass('selectedCPK');
                    $('.carModelExl-disabled').removeClass('selectedCPK');

                    $('.input-group-addon').addClass('input-group-addonOK');
                }
                this.search_data = storage_item;
                this.change_page = true;
                $("#exampleInputAmount").val(storage_item.carNumber);
                this.curPage = storage_item.page + 1;
                this.table_pagination.current = storage_item.page + 1;
                // Tools.listAllByPageCPKInfo();
                Tools.cpk_listAll(storage_item.carTypeDbId); //获取人员库列表
            } else {
                Tools.cpk_listAll(); //获取人员库列表
            }
        },
        onDispose() {
            // 页面消亡
        }

    }
});

// 弹窗-新增
let docDialogDdd = avalon.define({
    $id: 'doc-dialog-addPersonInfo',
    title: '新增',
    json: '',
    carTypeObj: [],
    personId: '',
    keyPersonTypeId: '',
    personName: '',
    idCard: '',
    birthDate: '',
    keyPersonDetail: '',
    personDistrict: '',
    personAddress: '',
    personRegImg: '',
    remarks: '',
    endDate: moment().format('YYYY-MM-DD'), //禁止选择未来时间,
    handleBirthdayChange() {

    },
    handleCarTypeChnage(e) {

    },
    uploadDivClick() {
        document.getElementById('fileToUploadAdd').click();
    },
    registerPic(e) { // 注册图片change方法,有bug,只能生效一次  (已解决，在Tools.CPK_upload()中已重新绑定change事件)    
        // console.log('begin');  
        let filename = e.currentTarget.files[0].name;
        if(!/.(png|jpg|jpeg)$/i.test(filename)) {
            notification.warn({
                title: '温馨提示',
                message: '图片格式错误，支持JPG, JPEG, PNG格式'
            });
            return;
        }
        Tools.CPK_upload();
        // console.log('end');  
    },
    hjdzMaxlength(e){   
        this.personAddress=e.target.value;
    },
    bzMaxlength(e){
        this.keyPersonDetail=e.target.value;
    },
    $form: createForm({
        onFieldsChange(fields, record) {
            docDialogDdd.json = JSON.stringify(record);
        }
    }),
    save() {
        docDialogDdd.$form.validateFields().then(isAllValid => {

            let data = docDialogDdd.$form.record;
            data.personRegImg = this.personRegImg;
            data.keyPersonTypeId = cpk_man.selectCPKId;
            if (!docDialogDdd.personId) {
                Tools.saveCPKInfo(data);
            } else {
                data.personId = docDialogDdd.personId;
                Tools.editCPKInfo(data);
            }
        });
    }
});

// 弹窗-添加重点人员类型库
let addPersonDb = avalon.define({
    $id: 'doc-dialog-addPersonDb',
    title: '添加人证库',
    treeNode: {},
    isEdit: false,
    // personDbName: '',
    // personDbDesc: '',
    inputJson: {
        "personDbName": "",
        "personDbDesc": ""
    },
    validJson: {
        "personDbName": true,
        "personDbDesc": true
    },
    showJson: {
        "personDbName": false
    },
    personDbNameReg: /^[\u4e00-\u9fa5_a-zA-Z0-9-]+$/,
    infoReg: null,
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, length, event) {
        sbzygl.handleFormat(event, name, this, reg, length);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
});

// 弹窗-编辑人员类型库
let editCarDb = avalon.define({
    $id: 'doc-dialog-rylxbj',
    title: '编辑列表',
    treeNode: {},
    isEdit: false,
    personDbName: '',
    personDbDesc: ''
});

// 弹窗-删除
avalon.define({
    $id: 'doc-dialog-del-ryk',
    title: '删除确定'
});
// 弹窗-删除
avalon.define({
    $id: 'doc-dialog-del-content-ryk',
    title: '删除确定'
});
// 弹窗-删除
let deleteDialog = avalon.define({
    $id: 'doc-dialog-del-rylxksz',
    title: '删除确定',
    dialogRylxkszDelText: '你确定要删除该人员库吗？',
});
// 弹窗-图片放大
let picVM = avalon.define({
    $id: 'doc-dialog-picBig-ryk',
    picSRC: '',
    // bigPic_footerHtml: '',
    title: '注册照片',
});

// 弹窗-批量导入
let importEXL = avalon.define({
    $id: 'doc-dialog-import-ryk',
    title: '批量导入',
    importUrl: '请选择导入文件路径',
    progress: 0,
    importBtn(e) {
        this.importUrl = e.target.value;
        this.progress = 100;
        $('#importButton').css('display', 'none');
        $('#importLabel').css('display', 'none');
        $('#importIPT').css('display', 'inline-block');
    },
});

// 弹窗-新增失败
let addFail = avalon.define({
    $id: 'doc-dialog-addPersonFail',
    title: '新增失败人员信息',
    //弹窗
    isdel: false,
    isBatchDel: false,
    // 表单
    loading: false,
    checked_cpkInfo: [],
    table_pagination: {
        current: 0,
        pageSize: 20,
        total: 0,
        current_len: 0,
        totalPages: 0
    },
    // 表格
    // 分页
    list: [],
    curPage: 1,
    //翻页
    $computed: {
        pagination: function () {
            return {
                current: addFail.table_pagination.current,
                pageSize: addFail.table_pagination.pageSize,
                total: addFail.table_pagination.total,
                onChange: addFail.handlePageChange
            };
        }
    },
    getCurrent(current) {
        addFail.table_pagination.current = current;
        addFail.curPage = current;
    },
    getPageSize(pageSize) {
        addFail.table_pagination.pageSize = pageSize;
    },
    handlePageChange(page) {
        // let objs = this.list;
        // this.checked_cpkInfo = [];
        // objs.forEach((val, key) => {
        //     if (val.checked) {
        //         this.checked_cpkInfo.push(val);
        //     }
        // });
        // if (this.checked_cpkInfo.length > 0) {
        //     $('.addFailDelete-disabled').removeClass('selectedCPK');
        //     $('.addFailAllDelete-disabled').removeClass('selectedCPK');
        // } else {
        //     $('.addFailDelete-disabled').addClass('selectedCPK');
        //     $('.addFailAllDelete-disabled').addClass('selectedCPK');
        // }

        addFail.curPage = page;
        addFail.table_pagination.current = page;
        let data = {};
        data.beginTime = addFail.beginTime;
        data.endTime = addFail.endTime;
        Tools.listAllByPage(data); //查询新增失败
    },
    json: '',
    // checkedID: '',
    $form: createForm({
        onFieldsChange(fields, record) {
            addFail.json = JSON.stringify(record);
        }
    }),
    xzsb_endDate: moment().format('YYYY-MM-DD'), //禁止选择未来时间
    beginTime: moment().format('YYYY-MM-DD 00:00:00'),
    // beginTime: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    startTimeHandleChange(e) {
        this.beginTime = e.target.value;
    },
    endTimeHandleChange(e) {
        this.endTime = e.target.value;
    },
    search() {
        this.curPage = 1;
        this.table_pagination.current = 1;
        addFail.$form.validateFields().then(isAllValid => {
            if (isAllValid) {
                let data = {};
                data.beginTime = addFail.beginTime;
                data.endTime = addFail.endTime;
                if (!data.endTime || !data.beginTime) {
                    notification.warn({
                        message: '请正确选择查询的开始时间或结束时间！',
                        title: "温馨提示"
                    });
                    return;
                }
                if(moment(data.beginTime).format('X') > moment(data.endTime).format('X')) {
                    notification.warn({
                        message: '开始时间不能大于结束时间',
                        title: "温馨提示"
                    });
                    return;
                }
                Tools.listAllByPage(data);
            }
        });
    },
    // 新增失败-删除按钮
    del() {
        if ($('.addFailDelete-disabled').hasClass('selectedCPK')) {
            return;
        }
        addFail.isdel = true;
        cpk_man.dialogDelShow = true;
        // Tools.batchDeleteAddFailInfo();
    },
    // 新增失败-全部删除按钮
    delAll() {
        if ($('.addFailAllDelete-disabled').hasClass('selectedCPK')) {
            return;
        }
        addFail.isBatchDel = true;
        cpk_man.dialogDelShow = true;
        // Tools.deleteCPKFailInfo(cpk_man.selectCPKId);
    },

    // 表格-操作回调
    actions(type, text, record, index) {
        if (type == 'delete') {

        } else if (type == 'big') {
            picVM.picSRC = record.personRegImg;
            cpk_man.dialogBigPicShow = true;

        }
    },
    // 表格-勾选回调
    selectChange(type, data) {
        let objs = this.list;
        this.checked_cpkInfo = [];
        objs.forEach((val, key) => {
            if (val.checked) {
                this.checked_cpkInfo.push(val);
            }
        });
        if (this.checked_cpkInfo.length > 0) {
            $('.addFailDelete-disabled').removeClass('selectedCPK');
            // $('.addFailAllDelete-disabled').removeClass('selectedCPK');
        } else {
            $('.addFailDelete-disabled').addClass('selectedCPK');
            // $('.addFailAllDelete-disabled').addClass('selectedCPK');
        }

        if (type == 'one') {
            if (data.checked) {
                //有勾选则保存勾选数据

            } else {

            }
        } else if (type == 'all') {
            if (data.checked) {

            } else {
                this.checked_cpkInfo = [];
            }
        }
    }
});

// 弹窗-人员类型库设置
let rylxksz = avalon.define({
    $id: 'doc-dialog-rylxsz',
    title: '编辑列表',
    checkedAll: false,
    personlistAll: [],
    copyPersonlistAll: [],

    //人员库 - 编辑列表===========
    selectLi: false,
    selectLiData: {},
    isEditClick: false,
    showErr: false,
    $computed: {
        CAS_FUNC_SBK_ZDRYK_LX_EDIT() {
            return cpk_man.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_EDIT;
        },
        CAS_FUNC_SBK_ZDRYK_LX_DELETE() {
            return cpk_man.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_DELETE;
        },
        CAS_FUNC_SBK_ZDRYK_DELETE() {
            return cpk_man.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_DELETE;
        },
        CAS_FUNC_SBK_ZDRYK_LX_SEARCH() {
            return cpk_man.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_SEARCH;
        }
    },
    editLiCPK(data, index) {
        this.selectLiData = data;
        $(".doc-dialog-rylxksz li").css('background', "none");
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ")").css('background', "#CCDBF1");

        $(".doc-dialog-rylxksz li .funcDIV").css('display', "none");
        if (!this.isEditClick) {
            $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .funcDIV").css('display', "inline-block");
        }

    },
    isEdit(index) {
        this.isEditClick = true;
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") span").css('display', "none");
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .input-wrap").css('display', "inline-block");
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .funcDIV").css('display', "none");
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .tickorcancel").css('display', "inline-block");

    },
    tick(index) {
        if(this.selectLiData.dbName === '') {
            notification.warn({
                message: '人员库名称不能为空！',
                title: "温馨提示"
            });
            return;
        }
        if($(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") input").hasClass('valid-err')) return;
        Tools.editCPK(this.selectLiData).then(flag => {
            this.cancel(index, flag);
        });
    },
    cancel(index, isTick) {
        //隐藏输入框
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") span").css('display', "inline-block");
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .input-wrap").css('display', "none");
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") input").removeClass('valid-err');
        //隐藏√和X        
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .tickorcancel").css('display', "none");
        //显示编辑、清空、删除
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") .funcDIV").css('display', "inline-block");
        if(!isTick) {
            let dbName = this.copyPersonlistAll[index].dbName;
            $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") input").val(dbName);
        }
        this.showErr = $(".valid-err").length > 0;
        this.isEditClick = false;
    },
    clear(index) {
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") input").val('');
        $(".doc-dialog-rylxksz li:eq(" + (index + 1) + ") input").focus();
    },
    funcEmpty() {
        cpk_man.deleteType = 'cleanItem';
        deleteDialog.dialogRylxkszDelText = '你确定要清空该人员库信息吗？';
        cpk_man.dialogRylxkszDelShow = true;
    },
    funcDel() {
        cpk_man.deleteType = 'deleteItem';
        deleteDialog.dialogRylxkszDelText = '你确定要删除该人员库吗？';
        cpk_man.dialogRylxkszDelShow = true;
    },    
    //==========================
    checkboxStyle: {
        cursor: 'pointer',
        fontSize: '16px'
    },
    checkStyle: {
        color: '#536b82'
    },
    uncheckStyle: {
        color: '#536b82'
    },
    selectedAll() {
        this.checkedAll = !this.checkedAll;
        avalon.each(this.personlistAll, (i, el) => {
            el.enable = this.checkedAll;
        });
    },
    selectedOne(config, index) {
        this.personlistAll[index].enable = !this.personlistAll[index].enable;
        let flab = true;
        if (this.personlistAll[index].enable) {
            for (let i = 0; i < this.personlistAll.length; i++) {
                if (!this.personlistAll[i].enable) {
                    flab = false;
                    break;
                }
            }
            if (flab) {
                this.checkedAll = true;
            }
        } else {
            this.checkedAll = false;
        }
    },
    editChange(e) {
        let value = e.target.value,
            reg = addPersonDb.personDbNameReg;
        if(!reg.test(value) || Tools.getLength(value) > 20) {
            $(e.target).addClass('valid-err');
        } else {
            $(e.target).removeClass('valid-err');
        }
        this.showErr = $(".valid-err").length > 0;
    },
    handleChange(config) {
        if (config.value == 'ALL') {
            this.checkedAll = config.checked;
            avalon.each(this.personlistAll, (i, el) => {
                el.enable = config.checked;
            });
        } else {
            this.personlistAll[config.index].enable = config.checked;
            let flab = true;
            if (config.checked) {
                for (let i = 0; i < this.personlistAll.length; i++) {
                    if (!this.personlistAll[i].enable) {
                        flab = false;
                        break;
                    }
                }
                if (flab) {
                    this.checkedAll = true;
                }
            } else {
                this.checkedAll = false;
            }
        }
    },
});

avalon.component('ms-comtable-checkbox', {
    template: `<i class="fa" :css="[checkboxStyle,(config.checked?checkStyle:uncheckStyle)]" :click="@chage | stop | prevent" :class="[(config.checked?'fa-check-square checked':'fa-square-o')]">
                    <span :if="config.label" :html="config.label" :css="{marginLeft:14}"></span>
               </i>`,
    defaults: {
        onInit(e) {},
        config: {},
        checkboxStyle: {
            cursor: 'pointer',
            fontSize: '16px'
        },
        checkStyle: {
            color: '#536b82'
        },
        uncheckStyle: {
            color: '#536b82'
        },
        onChange: avalon.noop,
        chage(event) {
            if (this.config.hasOwnProperty('checked')) {
                this.config.checked = !this.config.checked;
                this.onChange(this.config);
            } else {
                avalon.error('ms-gdkl-checkbox组件 config 参数未传入checked');
            };

        }
    }
});

/**********通用函数工具********************************************************************************************************************************************************************************************************************************************************************************************************************************/
let Tools = {
    initlistAll: function (data) {
        let listAll = [{
            id: '9999',
            // pId: 0,
            name: "全部",
            open: true,
            isParent: true,
            children: []
        }];
        if (data.length > 0) {
            data.forEach(function (val, index) {
                var obj = {};
                obj.id = val.id;
                obj.name = val.dbName;
                obj.dbName = val.dbName;
                // obj.dbType = val.dbType;
                obj.dbDesc = val.dbDesc;
                obj.createTime = val.createTime;
                obj.updateTime = val.updateTime;
                obj.enable = val.enable;
                // obj.isHidden = val.deleted; //显示或隐藏
                obj.isParent = false;
                listAll[0].children.push(obj);
            });
            return listAll;
        }
    },
    //人员识别信息控制器==========================================================================================
    // GET /gmvcs/uap/key-person/recognition/deleteByTypeDbId
    // 清空人员类型库中的人员信息
    deleteCPKCarsInfo: function (keyPersonTypeDbId) {
        ajax({
            url: '/gmvcs/uap/key-person/recognition/deleteByTypeDbId?keyPersonTypeDbId=' + keyPersonTypeDbId,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                cpk_man.searchFunc();
                notification.success({
                    message: "人员库人员信息清除成功！",
                    title: "温馨提示"
                });
                cpk_man.dialogRylxkszDelShow = false;
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        });
    },
    // 批量删除注册的信息
    batchDeleteCPKInfo: function (ids) {

        ajax({
            url: '/gmvcs/uap/car/recognition/batch/delete',
            method: 'post',
            data: ids,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.checked_cpkInfo = [];
                cpk_man.dialogDelShow = false;

                Tools.listAllByPageCPKInfo();
                notification.success({
                    message: "人员信息删除成功！",
                    title: "温馨提示"
                });
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },
    // 删除重点人员注册的信息  批量删除和单个删除同用一个接口
    deleteCPKInfo: function (id) {
        let params = {
            "id": id
        };
        ajax({
            url: '/gmvcs/uap/key-person/recognition/delete?id=' + params.id,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.checked_cpkInfo = [];
                cpk_man.dialogDelShow = false;
                Tools.listAllByPageCPKInfo();
                notification.success({
                    message: "重点人员信息删除成功！",
                    title: "温馨提示"
                });
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        });
    },
    // 编辑人员信息
    editCPKInfo: function (data) {
        let params = {
            "personId": data.personId,
            "keyPersonTypeId": data.keyPersonTypeId,
            "personName": data.personName,
            "idCard": data.idCard,
            "birthDate": data.birthDate,
            "keyPersonDetail": data.keyPersonDetail,
            "personDistrict": data.personDistrict,
            "personAddress": data.personAddress,
            "personRegImg": data.personRegImg,
            "remarks": data.remarks
        };
        ajax({
            url: '/gmvcs/uap/key-person/recognition/edit',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: "编辑人员信息成功！",
                    title: "温馨提示"
                });
                cpk_man.dialogAddShow = false;
                cpk_man.searchFunc();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },
    // 人员信息模板导出
    exportCarTemplate: function () {
        window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/key-person/recognition/exportTemplate"; //远程服务器使用        
    },
    // 查询人员信息
    findCPKInfo: function () {
        let params = {
            "id": 0
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/find',
            method: 'get',
            data: params,
            cache: false
        }).then(ret => {});
    },
    // 人员注册信息导入
    importCars: function () {
        if (cpk_man.selectCPKId !== 0 && !cpk_man.selectCPKId) {
            notification.info({
                message: "请先选择人员库类型，谢谢",
                title: "温馨提示"
            });
            return;
        }
        notification.success({
            title: '温馨提示',
            message: '数据上传中，等待时间可能较长，请勿重复上传!'
        });
        let params = {
            "keyPersonTypeDbId": parseInt(cpk_man.selectCPKId)
        };
        cpk_man.dialogImportShow = false;
        $.ajaxFileUpload({
            url: "http://" + window.location.host + apiUrl + '/gmvcs/uap/key-person/recognition/importKeyPersons',
            secureuri: false,
            fileElementId: 'fileToUpload', //file标签的id  
            dataType: 'string', //返回数据的类型
            data: params,
            success: function (data, status) {
                cpk_man.searchFunc();
                let result = eval('(' + data + ')');
                if (result.code == 0) {
                    notification.success({
                        message: "人员注册信息导入成功！",
                        title: "温馨提示"
                    });
                    cpk_man.dialogImportShow = false;
                    cpk_man.searchFunc();
                    importEXL.progress = 100;
                    $('.importProgress').css('display', 'inline-block');
                    $('.import-top').css('display', 'none');
                } else {
                    notification.error({
                        message: result.msg,
                        title: "温馨提示"
                    });
                    // importEXL.progress = 100;
                    // $('.importProgress').css('display', 'inline-block');
                    // $('.import-top').css('display', 'none');
                    return;
                }
            },
            error: function (data, status, e) {
                cpk_man.searchFunc();
                notification.success({
                    message: "导入人员失败！请到新增失败查看",
                    title: "温馨提示"
                });
                return;
            }
        });
    },
    // 分页查询人员信息
    listAllByPageCPKInfo: function () {
        cpk_man.loading = true;
        let page = cpk_man.curPage;
        if (cpk_man.selectCPKId !== 0 && !cpk_man.selectCPKId) {
            cpk_man.loading = false;
            return;
        }
        let params = {
            "idCard": $("#exampleInputAmount").val(),
            "keyPersonTypeDbId": parseInt(cpk_man.selectCPKId),
            "page": cpk_man.curPage - 1,
            "pageSize": cpk_man.table_pagination.pageSize
        };
        if (cpk_man.change_page) {
            params = cpk_man.search_data;
            params.page = cpk_man.table_pagination.current - 1;
        } else
            cpk_man.search_data = params;

        ajax({
            url: '/gmvcs/uap/key-person/recognition/listAllByPage',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let temp = (cpk_man.curPage - 1) * cpk_man.table_pagination.pageSize + 1;
                avalon.each(ret.data.currentElements, (i, el) => {
                    el.checked = false;
                    el.index = temp + i; // 行序号
                });
                storage.setItem('sszhxt-znsb-bk', params);

                avalon.each(ret.data.currentElements, (key, val) => {
                    val.createTime = moment(val.createTime).format('YYYY-MM-DD HH:mm:ss');
                });
                cpk_man.list = ret.data.currentElements;
                //新数据没勾选置灰
                $('.BatchExport-disabled').addClass('selectedCPK');
                $('.BatchDelete-disabled').addClass('selectedCPK');
                cpk_man.table_pagination.total = ret.data.totalElements;
                cpk_man.table_pagination.current_len = ret.data.currentElements.length;
                cpk_man.table_pagination.totalPages = ret.data.totalPages;
                cpk_man.loading = false;
            }
        });
    },

    // 新增人员信息
    saveCPKInfo: function (data) {
        let params = {
            "keyPersonTypeId": data.keyPersonTypeId,
            "personName": data.personName,
            "idCard": data.idCard,
            "birthDate": data.birthDate,
            "keyPersonDetail": data.keyPersonDetail,
            "personDistrict": data.personDistrict,
            "personAddress": data.personAddress,
            "personRegImg": data.personRegImg,
            "remarks": data.remarks
        };
        ajax({
            url: '/gmvcs/uap/key-person/recognition/save',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: "新增人员信息成功！",
                    title: "温馨提示"
                });
                cpk_man.dialogAddShow = false;
                cpk_man.searchFunc();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },

    // 人员类型库控制器===========================================================================================
    cpk_listAll: function (val) {
        if(!cpk_man.opt_rlbk.authority.CAS_FUNC_SBK_ZDRYK_LX_SEARCH) return;
        ajax({
            url: '/gmvcs/uap/key-person/type-db/listAll?isListAll=false',
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let data = ret.data.slice();
                if (data.length > 0) {
                    // JSON.parse(JSON.stringify()) 方法用于防止 data 被改变污染了
                    cpk_man.tree_data = JSON.parse(JSON.stringify(data)); //保存人员类型库数据
                    //同时更新 人员类型库设置START
                    rylxksz.personlistAll = JSON.parse(JSON.stringify(data));
                    rylxksz.copyPersonlistAll = JSON.parse(JSON.stringify(data));

                    // 全选是否打钩
                    let flab = true;
                    for (let i = 0; i < rylxksz.personlistAll.length; i++) {
                        if (!rylxksz.personlistAll[i].enable) {
                            flab = false;
                            break;
                        }
                    }
                    if (flab) {
                        rylxksz.checkedAll = true;
                    }
                    //同时更新 人员类型库设置END

                    cpk_man.show_cpk_tree(this.initlistAll(data));

                    if (val) {
                        let cpkTree_obj = $.fn.zTree.getZTreeObj("rykTree");
                        let nodes = cpkTree_obj.getNodes();

                        for (let i = 0; i < nodes[0].children.length; i++) {
                            if (nodes[0].children[i].id == val) {
                                cpkTree_obj.selectNode(nodes[0].children[i]);
                                break;
                            }
                        }
                    }
                    Tools.listAllByPageCPKInfo();
                } else {
                    cpk_man.tree_data = []; //保存人员类型库数据
                    cpk_man.show_cpk_tree(this.initlistAll(cpk_man.tree_data));
                }
            }
        });
    },

    //添加重点人员库
    saveCPK: function () {
        let pass = true;
        let params = {
            "dbDesc": addPersonDb.inputJson.personDbDesc,
            "dbName": addPersonDb.inputJson.personDbName
        };
        avalon.each(addPersonDb.validJson, (key, value) => {
            let paramsKey = key.replace('personD', 'd');
            if (((key == 'personDbDesc' || key == 'personDbName') && !params[paramsKey]) || !value) {
                addPersonDb.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return;
        } 

        ajax({
            url: '/gmvcs/uap/key-person/type-db/save',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                cpk_man.tree_data.unshift(ret.data); //新增人员库，往人员类型库列表数组的开头添加
                cpk_man.show_cpk_tree(this.initlistAll(cpk_man.tree_data));
                cpk_man.dialogAddCarDb = false;
                Tools.cpk_listAll();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },
    //编辑人员库
    editCPK: function (treeNode) {
        return new Promise((resolve, reject) => {
            var obj = treeNode;
            let params = {
                "dbName": obj.dbName,
                "id": obj.id
            };
            ajax({
                url: '/gmvcs/uap/key-person/type-db/edit',
                method: 'post',
                data: params,
                cache: false
            }).then(ret => {
                if (ret.code == 0) {
                    rylxksz.copyPersonlistAll = JSON.parse(JSON.stringify(rylxksz.personlistAll));
                    if(!ret.data) {
                        resolve(true);
                        return true;
                    };
                    cpk_man.isClick = true;
                    var zTree = $.fn.zTree.getZTreeObj("rykTree"),
                        nodes = zTree.getNodesByParam('id', ret.data.id);
                    nodes[0].name = ret.data.dbName;
                    // nodes[0].dbType = ret.data.dbType;
                    nodes[0].dbDesc = ret.data.dbDesc;
                    nodes[0].createTime = ret.data.createTime;
                    nodes[0].updateTime = ret.data.updateTime;
                    nodes[0].enable = ret.data.enable;
                    // nodes[0].deleted = ret.data.deleted;
                    zTree.updateNode(nodes[0]);
                    cpk_man.dialogAddCarDb = false;
                    resolve(true);
                    return true;
                } else {
                    notification.error({
                        message: ret.msg,
                        title: "温馨提示"
                    });
                    resolve(false);
                    return false;
                }
            });
        });
    },
    // 删除人员库
    deleteCPK: function (id) {
        ajax({
            url: '/gmvcs/uap/key-person/type-db/delete?id=' + id,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                var zTree = $.fn.zTree.getZTreeObj("rykTree"),
                nodes = zTree.getNodesByParam('id', id);
                zTree.removeNode(nodes[0]);
                cpk_man.cpkIsDel = false;
                cpk_man.dialogDelShow = false;
                cpk_man.dialogRylxkszDelShow = false;
                Tools.cpk_listAll();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },
    // ==================================================人员识别信息添加失败记录控制器==========================================================
    //分页查询人员新增失败记录
    listAllByPage: function (data) {
        addFail.loading = true;
        if (cpk_man.selectCPKId !== 0 && !cpk_man.selectCPKId) {
            alert('人员库ID为空！');
            addFail.loading = false;
            return;
        }
        let params = {
            "beginTime": getTimeByDateStr(data.beginTime),
            "endTime": getTimeByDateStr(data.endTime),
            "keyPersonTypeDbId": parseInt(cpk_man.selectCPKId),
            "page": addFail.curPage - 1,
            "pageSize": addFail.table_pagination.pageSize
        };
        ajax({
            url: '/gmvcs/uap/key-person/recognition/fail/listAllByPage',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let temp = (addFail.curPage - 1) * addFail.table_pagination.pageSize + 1;
                avalon.each(ret.data.currentElements, (i, el) => {
                    el.checked = false;
                    el.index = temp + i;
                    el.createTime = null == el.createTime ? '-' : formatDate(el.createTime);
                });

                //新数据没勾选置灰
                $('.addFailDelete-disabled').addClass('selectedCPK');
                $('.addFailAllDelete-disabled').addClass('selectedCPK');

                addFail.list = ret.data.currentElements;
                addFail.table_pagination.total = ret.data.totalElements;
                addFail.table_pagination.current_len = ret.data.currentElements.length;
                addFail.table_pagination.totalPages = ret.data.totalPages;
                addFail.loading = false;
                if(addFail.list.length > 0) {
                    $('.addFailAllDelete-disabled').removeClass('selectedCPK');
                }
            }

        });
    },
    // 批量删除的人员新增失败记录
    batchDeleteAddFailInfo: function () {
        let objs = addFail.list;
        let ids = [];
        if (objs.length > 0) {
            objs.forEach((val, key) => {
                if (val.checked) {
                    ids.push(val.id);
                }
            });
        } else {

        }
        ajax({
            url: '/gmvcs/uap/key-person/recognition/fail/delete?ids=' + ids.join(','),
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: '删除成功！',
                    title: "温馨提示"
                });
                addFail.search();
                cpk_man.dialogDelShow = false;
                addFail.isBatchDel = false;
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },
    // 删除人员库全部新增失败记录GET
    deleteCPKFailInfo: function (id) {
        let params = {
            "id": parseInt(id) //人员库ID，可选，不传则删除所有类型库的失败记录
        };
        ajax({
            url: '/gmvcs/uap/key-person/recognition/fail/delete/all?keyPersonTypeDbId=' + params.id,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: '全部删除成功！',
                    title: "温馨提示"
                });
                addFail.search();
                cpk_man.dialogDelShow = false;
                addFail.isdel = false;
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        });
    },
    // ================================================================================================================================
    // 人员类型库图片上传
    CPK_upload: function () {
        $.ajaxFileUpload({
            url: "http://" + window.location.host + apiUrl + '/gmvcs/uap/file/upload',
            secureuri: false,
            fileElementId: 'fileToUploadAdd', //file标签的id  
            dataType: 'text/html', //返回数据的类型
            success: function (data, status) {
                let result = eval('(' + data + ')');
                if (result.code == 0) {
                    $('#showIMG').attr('src', result.data.filePath ? result.data.filePath : ''); //预览上传图片 
                    docDialogDdd.personRegImg = result.data.filePath ? result.data.filePath : '';
                    docDialogDdd.personRegImg = result.data.filePath ? result.data.filePath : '';
                    // $('#fileToUploadAdd').remove();
                    $('.registerPic-btn').css('background-color', 'grey');

                } else {
                    notification.error({
                        message: result.msg,
                        title: "温馨提示"
                    });
                    return;
                }
            },
            error: function (data, status, e) {
                notification.success({
                    message: "导入用户失败！",
                    title: "温馨提示"
                });
                return;
            }
        });
        // 再次绑定 change 事件
        $('#fileToUploadAdd').off('change').on('change', function(e) {
            // console.log('change again');
            docDialogDdd.registerPic(e);
        });
    },

    //=================字典操作控制器========================================================================================================================================
    // 使用字典类型的code查询数据字典 (301:人员类型)
    findByDicTypeCode: function (id) {
        ajax({
            url: '/gmvcs/uap//dic/findByDicTypeCode?dicTypeCode=301',
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let options = [];
                avalon.each(ret.data, function (index, el) {
                    let items = {
                        "label": el.name,
                        "value": el.code
                    };
                    options.push(items);
                });
                docDialogDdd.carTypeObj = options; //人员类型          
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        });
    },
    // 人员类型库设置
    settingCPK: function () {
        var params = {
            "list": [{
                "enable": true,
                "id": 0
            }]
        };
        ajax({
            url: '/gmvcs/uap/car/type/setting',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {});
    },
    getTimestamp: function () {
        return Math.round(new Date().getTime() / 1000);
        //getTime()返回数值的单位是毫秒
    },
    //=========================================================================树函数=========================================
    addHoverDom: function (treeId, treeNode) {
        if (treeNode.parentNode && treeNode.parentNode.id != '9999') return; //有父节点，并且不是父节点，添加DIY
        var aObj = $("#" + treeNode.tId + '_a');
        if (treeNode.id == '9999') {
            return;
        } //全部，不作处理
        if ($("#diyBtn_edit_" + treeNode.id).length > 0) return;
        if ($("#diyBtn_empty_" + treeNode.id).length > 0) return;
        if ($("#diyBtn_del_" + treeNode.id).length > 0) return;
        var editStr = "<span class='editPic' id='diyBtn_edit_" + treeNode.id + "' title='" + '编辑' + "' onfocus='this.blur();'></span>" +
            "<span class='emptyPic' id='diyBtn_empty_" + treeNode.id + "' title='" + '清空' + "' onfocus='this.blur();'></span>" +
            "<span class='delPic' id='diyBtn_del_" + treeNode.id + "' title='" + '删除' + "' onfocus='this.blur();'></span>";
        aObj.append(editStr);
        //编辑
        var btn = $("#diyBtn_edit_" + treeNode.id);
        if (btn) btn.bind("click", function () {
            cpk_man.isClick = false;
            cpk_man.edit(treeNode);
        }); //点击事件
        //清空
        var btn = $("#diyBtn_empty_" + treeNode.id);
        if (btn) btn.bind("click", function () {
            cpk_man.isClick = false;
            Tools.deleteCPKCarsInfo(treeNode.id);
        });
        //删除
        var btn = $("#diyBtn_del_" + treeNode.id);
        if (btn) btn.bind("click", function () {
            cpk_man.isClick = false;
            cpk_man.dialogDelShow = true;
            cpk_man.cpkIsDel = true;
            cpk_man.selectCPKId = treeNode.id;
            // Tools.deleteCPK(treeNode);
        });
    },
    removeHoverDom: function (treeId, treeNode) {
        if (treeNode.parentTId && treeNode.getParentNode().id != '9999') return;
        //编辑
        $("#diyBtn_edit_" + treeNode.id).unbind().remove();
        // $("#diyBtn_space_edit_" + treeNode.id).unbind().remove();
        //清空
        $("#diyBtn_empty_" + treeNode.id).unbind().remove();
        // $("#diyBtn_space_empty_" + treeNode.id).unbind().remove();
        //删除
        $("#diyBtn_del_" + treeNode.id).unbind().remove();
        // $("#diyBtn_space_del_" + treeNode.id).unbind().remove();
    },
    getLengthByCharCode: function(str) {
        var realLength = 0, len = str.length, charCode = -1;
        for ( var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128)
                realLength += 1;
            else
                realLength += 2;
        }
        return realLength;
    },
    getLength(str) {
        return str.length;
    }
};

function getTimeByDateStr(stringTime) {
    var s = stringTime.split(" ");
    var s1 = s[0].split("-");
    var s2 = s[1].split(":");
    if (s2.length == 2) {
        s2.push("00");
    }

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}

function set_size() {
    let v_height = $(window).height() - 96;
    // let v_min_height = $(window).height() - 68;
    // if (v_height > 740) {
    //     $(".sbk-content-cpk").height(v_height);
    //     // $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    // } else {
    //     $(".sbk-content-cpk").height(740);
    //     // $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
    // }
}
//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}