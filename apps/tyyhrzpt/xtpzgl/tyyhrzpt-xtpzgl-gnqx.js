import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import * as menuServer from '/services/menuService';
export const name = 'xtpzgl-gnqx';
import './tyyhrzpt-xtpzgl-gnqx.less';
let storage = require('/services/storageService.js').ret;

let authority_tree_data = [], //全局的存储功能权限树数据
    jsgl_vm;
let jsgl_click_flag_set = {
    addRole_click: true, //新增角色标识
    editRole_click: true, //编辑角色标识
    deleteRole_click: true, //停用角色标识
    saveAuthority_click: true, //保存权限标识
};
let finalCheckedArr = []; //功能权限树
let push = false; //编辑、新增后
let del = false; //角色停用后
let authorityTree = [],
    initFlag = false, //解决页面切换回来渲染两次的Bug
    tempCheckTree = [], //保存树的展开状态
    globalSelectedItem = null; //全局的存储选中的角色列表[解决IE8]
let vm = avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-gnqx.html'),
    defaults: {
        loading: false, //树加载
        loadingRole: false,
        readOnly: true,
        allcheck: false, //全选
        org_icon: '/static/image/tyywglpt/org.png',
        menu_icon: '/static/image/xtpzgl-gnqx/menu.png',
        fuc_icon: '/static/image/xtpzgl-gnqx/function.png',
        move_index: false,
        gnqx_opt: avalon.define({
            $id: 'gnqx_opt',
            jsMenuBg: '', //菜单颜色置灰类名
            authority: { // 按钮权限标识
                "CREATE": false, //功能权限_新增角色
                "DELETE": false, //功能权限_停用角色
                "EDIT": false, //功能权限_编辑角色
                "BCQX": false, //功能权限_保存权限
                "JSGN": false, //功能权限_角色功能
                "JSYH": false //功能权限_角色用户
            }
        }),

        setTab: "1",
        setTabClick(tab) {
            this.setTab = tab;
        },

        fun_allCheck: function (param) {
            if (this.allcheck) {
                this.allcheck = false;
                finalCheckedArr = [];
                authority_tree.checkedKeys = [];
                this.saveAuthority();
            } else {
                this.allcheck = true;
                authority_tree.checkedKeys = [].concat(allFunc);
                finalCheckedArr = [].concat(allFunc);
                this.saveAuthority();
            }
        },
        clickRoleItem: function (obj, event, type) {
            if (!type) {
                $(event.target).addClass("item_select");
                $(event.target).parent("li").siblings().find("span").removeClass("item_select");
            } else {
                $(event.target).parent('div').parent('li').find('span').addClass("item_select");
                $(event.target).parent('div').parent('li').siblings().find("span").removeClass("item_select");
            }
            globalSelectedItem = {
                id: obj.item.id,
                roleName: obj.item.roleName,
                orderNo: obj.item.orderNo
            };
            let selected = false;
            avalon.each(roleItem_cont.roleItemsLists, function (index, val) {
                if (val.id === obj.item.id) {
                    if (roleItem_cont.roleItemsLists[index].check) {
                        selected = true;
                    } else {
                        roleItem_cont.roleItemsLists[index].check = true;
                    }
                } else {
                    roleItem_cont.roleItemsLists[index].check = false;
                }
            });
            if (!selected) {
                this.ajaxSelectedItemMenus(globalSelectedItem.id);
            }
        },
        ajaxRolesList(addId) { //获取左侧的角色列表
            $(".roleLists_body").find("span").removeClass("item_select");
            ajax({
                url: '/gmvcs/uap/roles/listAll/by/user',
                // url: '/gmvcs/uap/roles/all',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取角色列表失败，请联系管理员',
                        title: '温馨提示'
                    });
                    return;
                }

                let tempList = [];
                if (result.data.length == 0) {
                    notification.info({
                        message: '暂无角色列表',
                        title: '温馨提示'
                    });
                    authority_tree.checkable = true;
                    this.gnqx_opt.jsMenuBg = '';
                    authority_tree.authority_data = [];
                    avalon.each(authorityTree, function (index, val) {
                        authority_tree.authority_data.push(val);
                    });
                    tempExpandedKeys.push("all");
                    authority_tree.expandedKeys = tempExpandedKeys;
                    // 暂无角色，去除残留数据
                    roleItem_cont.roleItemsLists = [];
                    authority_tree.authority_data = [];
                    return;
                }
                avalon.each(result.data, function (index, val) {
                    if (index == 0) {
                        globalSelectedItem = {
                            roleName: val.roleName,
                            orderNo: val.orderNo,
                            id: val.id,
                            userNumber: val.userNumber
                        };
                    }
                    tempList.push({
                        roleName: val.roleName,
                        orderNo: val.orderNo,
                        id: val.id,
                        userNumber: val.userNumber,
                        edit: false,
                        delete: false,
                        check: false,
                    });
                });
                let checked_index = -1;
                if (push && !del) { //列表刷新
                    if (addId) {
                        avalon.each(tempList, function (index, val) {
                            if (val.id === addId) {
                                checked_index = index;
                                globalSelectedItem = {
                                    roleName: val.roleName,
                                    orderNo: val.orderNo,
                                    id: val.id,
                                    userNumber: val.userNumber
                                };
                            }
                        });
                    } else {
                        avalon.each(roleItem_cont.roleItemsLists, function (index, val) {
                            if (val.check) {
                                checked_index = index;
                                globalSelectedItem = {
                                    roleName: val.roleName,
                                    orderNo: val.orderNo,
                                    id: val.id,
                                    userNumber: val.userNumber
                                };
                            }
                        });
                    }
                }
                roleItem_cont.roleItemsLists = tempList;
                if (del || roleItem_cont.roleItemsLists.length > 0 && !push) { //角色列表初始化
                    del = false;
                    roleItem_cont.roleItemsLists[0].check = true;
                    $(".roleLists_body").find("span").first().addClass("item_select");
                }
                if (checked_index != -1 && push && !del) {
                    roleItem_cont.roleItemsLists[checked_index].check = true;
                    $(".move_index").find("div.operate").parent('.move_index').find('span').addClass("item_select");
                }
                // 新增角色滚动条到底部
                if (addId) {
                    if (checked_index > 0) {
                        const scroll = document.getElementById("scrollBox");
                        scroll.scrollTop = scroll.scrollHeight;
                    }
                }
                this.ajaxSelectedItemMenus(globalSelectedItem.id);
                // 监听鼠标移入事件
                let that = this;
                $("li.move_index").mouseenter(function () {
                    let _this = this;
                    avalon.each(roleItem_cont.roleItemsLists, function (index, val) {
                        if (val.roleName == _this.title && !val.check) {
                            roleItem_cont.roleItemsLists[index].edit = that.gnqx_opt.authority.EDIT && true;
                            roleItem_cont.roleItemsLists[index].delete = that.gnqx_opt.authority.DELETE && true;
                        }
                    })
                });
                // 监听鼠标移除事件
                $("li.move_index").mouseleave(function () {
                    avalon.each(roleItem_cont.roleItemsLists, function (index, val) {
                        if (val.edit && !val.check) {
                            roleItem_cont.roleItemsLists[index].edit = false;
                        }
                        if (val.delete && !val.check) {
                            roleItem_cont.roleItemsLists[index].delete = false;
                        }
                    })
                })
            });

        },
        ajaxFunction_tree: function () { //获取右侧的功能权限树
            ajax({
                url: '/gmvcs/uap/app/listAll',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code == 0) {
                    authorityTree = [];
                    avalon.each(result.data, function (index, val) {
                        let authorityTree_data = [];
                        let tree_index = -1;
                        switch (val.code) {
                            case "/gmvcs/index":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 0;
                                break;
                            case "/gmvcs/instruct":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 1;
                                break;
                            case "/gmvcs/audio":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 2;
                                break;
                            case "/gmvcs/audiozhzs":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 3;
                                break;
                            case "/gmvcs/uom":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 4;
                                break;
                            case "/gmvcs/uap":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 5;
                                break;
                            case "/gmvcs/eva":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 6;
                                break;
                            case "/gmvcs/workstation":
                                getRoleTree([val], authorityTree_data);
                                tree_index = 7;
                                break;
                            default:
                                break;
                        }
                        if (tree_index != -1) {
                            authorityTree.push({
                                treeData: authorityTree_data,
                                sid: 'treeId' + index,
                                name: val.name,
                                tree_index: tree_index
                            });
                        }
                    });
                    for (let i = 0; i < authorityTree.length - 1; i++) {
                        for (let j = 0; j < authorityTree.length - 1 - i; j++) {
                            if (authorityTree[j].tree_index > authorityTree[j + 1].tree_index) {
                                let temp = authorityTree[j];
                                authorityTree[j] = authorityTree[j + 1];
                                authorityTree[j + 1] = temp;
                            };
                        };
                    };
                    authority_tree_data = result.data; //全局存储功能权限
                } else {
                    notification.error({
                        message: result.msg,
                        title: '温馨提示'
                    });
                }
                this.ajaxRolesList();
            });
        },

        //页码
        table_pagination: {
            current: 0,
            pageSize: 1000,
            total: 0,
            totalPages: 0
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },
        handlePageChange(page) {
            this.table_pagination.current = page;
            this.getUserByRole(globalSelectedItem.id);
        },
        userRoleList:[],
        getUserByRole(roleId) {
            this.loadingRole = true;
            let ajaxData = {
                "page": (this.table_pagination.current - 1),
                "pageSize": this.table_pagination.pageSize,
                "roleId": roleId
            };
            ajax({
                url: '/gmvcs/uap/user/findByRole',
                method: 'post',
                data: ajaxData
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.userRoleList = [];
                    this.loadingRole = false;
                    this.table_pagination.total = 0;
                    return;
                }

                this.userRoleList = result.data.currentElements;
                this.table_pagination.total = result.data.totalElements; //总条数
                this.loadingRole = false;
            });
        },
        
        //获取已选中角色对应的功能权限
        ajaxSelectedItemMenus(itemId) {
            this.loading = true;
            // if(itemId == roleIdStorage[0]){//判断目前选中角色是否是当前登陆用户的角色
            //     this.readOnly = false ;
            //     authority_tree.checkable = false; //不勾选
            // } else {
            //     this.gnqx_opt.jsMenuBg = '';
            //     this.readOnly = true ;
            //     authority_tree.checkable = true;
            // }
            this.gnqx_opt.jsMenuBg = '';
            this.readOnly = true;
            authority_tree.checkable = true;
            this.table_pagination.current = 1;
            this.getUserByRole(itemId);
            ajax({
                url: '/gmvcs/uap/roles/queryById/' + itemId,
                method: 'get',
                data: {}
            }).then(result => {
                this.loading = false;
                if (result.code == 0) {
                    let checkedArr = []; //过滤后台返回的含有子节点的父节点
                    if (result.data.menus.length != 0) {
                        avalon.each(result.data.menus, function (index, val) {
                            if (tmpParent.indexOf(val.menuCode) == -1) {
                                checkedArr.push(val.menuCode);
                            }
                        });
                    }
                    if (result.data.adminLogin) {
                        jsgl_vm.authority_edit = true;
                        $("#tree_box_id").addClass("panel-default-mask");
                    } else {
                        jsgl_vm.authority_edit = false;
                        $("#tree_box_id").removeClass("panel-default-mask");
                    }
                    // if (initFlag) {
                    authority_tree.authority_data = [];
                    avalon.each(authorityTree, function (index, val) {
                        authority_tree.authority_data.push(val);
                    });
                    tempExpandedKeys.push("all");
                    authority_tree.expandedKeys = tempExpandedKeys;
                    // initFlag = false;
                    // }
                    authority_tree.checkedKeys = checkedArr;
                    finalCheckedArr = [].concat(checkedArr);
                    // 全选是否为true
                    setTimeout(function () {
                        // 刷新后滚动条初始为0
                        document.getElementById('tree_box_id').scrollTop = 0
                        let allchecked = true;
                        let all = $('span.button.chk')
                        avalon.each(all, function (index, val) {
                            if (val.className.indexOf('checkbox_true_full') == -1) {
                                allchecked = false;
                            }
                        })
                        jsgl_vm.allcheck = allchecked;
                    }, 50)
                } else {
                    notification.error({
                        message: result.msg,
                        title: '温馨提示'
                    });
                }
            });
        },
        onInit(e) {
            //不需要存储数据进localStorage中,页面默认选中第一条数据,解决角色列表有更新问题.
            jsgl_vm = e.vmodel;
            let _this = this;
            authority_tree.authority_data = [];
            initFlag = true;
            tempExpandedKeys = [];
            this.ajaxFunction_tree();
            // 新增、编辑、停用按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_GNQX/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                    if (/^CAS_MENU_GNQX/.test(el)) {
                        avalon.Array.ensure(func_list, el);
                    }
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_GNQX_EDIT":
                            _this.gnqx_opt.authority.EDIT = true;
                            break;
                        case "CAS_FUNC_GNQX_CREATE":
                            _this.gnqx_opt.authority.CREATE = true;
                            break;
                        case "CAS_FUNC_GNQX_DELETE":
                            _this.gnqx_opt.authority.DELETE = true;
                            break;
                        case "CAS_MENU_GNQX_JSGN":
                            _this.gnqx_opt.authority.JSGN = true;
                            break;
                        case "CAS_MENU_GNQX_JSYH":
                            _this.gnqx_opt.authority.JSYH = true;
                            break;
                    }
                });
                if (false == _this.gnqx_opt.authority.JSGN && true == _this.gnqx_opt.authority.JSYH) {
                    this.setTab = "2";
                }
            });

            this.$watch('authority_edit', (v) => {
                if (!v) {
                    jsgl_vm.addMask();
                }
            });
            $(window).resize(function () { //当浏览器大小变化时
                if (!jsgl_vm.authority_edit) {
                    jsgl_vm.addMask();
                }
            });
        },
        authority_edit: false,
        addMask() {
            let totalHeight = $("#tree_box_id").outerHeight();
            $(".panel-body-default").css({
                "top": '50px',
                "height": totalHeight + 'px',
            });
        },
        //刷新页面操作
        refreshEvt(addId) {
            document.getElementById("scrollBox").scrollTop = 0;
            push = true;
            this.ajaxRolesList(addId);
        },
        addRole() {
            if (jsgl_click_flag_set.addRole_click) {
                jsgl_click_flag_set.addRole_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.addRole_click = true;
                }, 2000);
            } else {
                return;
            }
            add_editVm.title = '新增角色';
            add_editVm.roleName = '';
            add_editVm.orderNo = '';
            add_editVm.name_display = 'none';
            add_editVm.orderNo_display = 'none';
            add_editVm.jsgl_close_name = false;
            add_editVm.isAdmin = true;
            add_edit_cont.add_editShow = true;
        },
        editRole(obj, event) {
            if (this.gnqx_opt.jsMenuBg) return; //置灰不可编辑
            if (jsgl_click_flag_set.editRole_click) {
                jsgl_click_flag_set.editRole_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.editRole_click = true;
                }, 2000);
            } else {
                return;
            }
            this.clickRoleItem(obj, event, true);
            add_editVm.title = '编辑角色';
            add_editVm.roleName = globalSelectedItem.roleName;
            add_editVm.orderNo = globalSelectedItem.orderNo;
            add_editVm.name_display = 'none';
            add_editVm.orderNo_display = 'none';
            add_editVm.orderNo_format = false;
            add_editVm.roleId = globalSelectedItem.id;
            add_editVm.jsgl_close_name = true;

            //判断是否为admin，admin才能调整角色排序
            if (storage.getItem('uid') == "1") {
                add_editVm.isAdmin = true;
            } else{
                add_editVm.isAdmin = false;                
            }

            add_edit_cont.add_editShow = true;
        },
        deleteRole(obj, event) {
            if (this.gnqx_opt.jsMenuBg) return; //置灰不可编辑
            this.clickRoleItem(obj, event, true);
            if (jsgl_click_flag_set.deleteRole_click) {
                jsgl_click_flag_set.deleteRole_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.deleteRole_click = true;
                }, 2000);
            } else {
                return;
            }
            deleteRoleVm.deleteId = globalSelectedItem.id;
            deleteRole_cont.deleteRoleShow = true;

        },
        saveAuthority() {
            // if(this.gnqx_opt.jsMenuBg) return;//置灰不可编辑
            // if (jsgl_click_flag_set.saveAuthority_click) {
            //     jsgl_click_flag_set.saveAuthority_click = false;
            //     setTimeout(function () {
            //         jsgl_click_flag_set.saveAuthority_click = true;
            //     }, 2000);
            // } else {
            //     return;
            // }
            //将获取到的menucode转换成后台要求的格式
            let tempCheckObj = [];
            for (let i = 0; i < finalCheckedArr.length; i++) {
                tempCheckObj.push({
                    "menuCode": finalCheckedArr[i]
                });
            }
            if (!jsgl_vm.gnqx_opt.authority.EDIT) { //根据是否拥有编辑权限决定是否提交后台请求
                return;
            }
            ajax({
                url: '/gmvcs/uap/roles/privilege/save',
                method: 'post',
                data: {
                    "menus": tempCheckObj,
                    "id": globalSelectedItem.id,
                }
            }).then(result => {
                if (result.code == 0) {
                    // saveAuthority_cont.saveAuthorityShow = true;
                } else {
                    notification.error({
                        message: result.msg,
                        title: '温馨提示'
                    });
                    return;
                }
            });
        },
        onReady() {
            jsgl_vm.addMask();
        },
        onDispose() {
            jsgl_click_flag_set = {
                addRole_click: true,
                editRole_click: true,
                deleteRole_click: true,
                saveAuthority_click: true,
            };
        }
    }
});

//角色列表->不抽取出来会导致数值已改变，但页面渲染没出来
let roleItem_cont = avalon.define({
    $id: 'roleItem_cont',
    roleItemsLists: []
});

let authority_tree = avalon.define({
    $id: 'authority_tree',
    authority_data: [],
    expandedKeys: [],
    checkable: true,
    handleBeforeExpand: function (treeId, treeNode) {
        var index = tempCheckTree.indexOf(treeNode.key);
        if (index == -1) {
            tempCheckTree.push(treeNode.key);
        }
    },
    handleBeforeCollapse: function (treeId, treeNode) {
        var index = tempCheckTree.indexOf(treeNode.key);
        tempCheckTree.splice(index, 1);
    },

    commitTree: function () {
        finalCheckedArr = []; //重置清空勾选内容
        let tempCheckedNodes = [];
        avalon.each(this.authority_data, function (index, val) {
            let data = getTreeCheckedNodes('#' + val.sid)
            tempCheckedNodes = tempCheckedNodes.concat(data)
        })
        // 添加
        let tmpLength = tempCheckedNodes.length;
        for (let i = 0; i < tmpLength; i++) {
            if (tempCheckedNodes[i].level == 0) {
                getRun(tempCheckedNodes[i].children);
            } else {
                if (tempCheckedNodes[i].pCode) {
                    let parentCode = tempCheckedNodes[i].pCode.split("+");
                    for (var m = 0; m < parentCode.length; m++) {
                        if (parentCode[m] != '') {
                            if (finalCheckedArr.indexOf(parentCode[m]) == -1) {
                                finalCheckedArr.push(parentCode[m]);
                            }
                        }
                    }
                }
                if (tempCheckedNodes[i].isParent == true) {
                    for (let k = 0; k < tempCheckedNodes[i].children.length; k++) {
                        if (finalCheckedArr.indexOf(tempCheckedNodes[i].children[k].key) == -1) {
                            finalCheckedArr.push(tempCheckedNodes[i].children[k].key);
                        }
                        getRun(tempCheckedNodes[i].children[k].children);
                    }
                }
            }
        }

        // 全选是否为true
        let allchecked = true;
        let all = $('span.button.chk')
        avalon.each(all, function (index, val) {
            if (val.className.indexOf('checkbox_true_full') == -1) {
                allchecked = false;
            }
        })
        jsgl_vm.allcheck = allchecked;
        //将获取到的menucode转换成后台要求的格式
        let tempCheckObj = [];
        for (let i = 0; i < finalCheckedArr.length; i++) {
            tempCheckObj.push({
                "menuCode": finalCheckedArr[i]
            });
        }
        if (!jsgl_vm.gnqx_opt.authority.EDIT) { //根据是否拥有编辑权限决定是否提交后台请求
            return;
        }
        ajax({
            url: '/gmvcs/uap/roles/privilege/save',
            method: 'post',
            data: {
                "menus": tempCheckObj,
                "id": globalSelectedItem.id,
            }
        }).then(result => {
            if (result.code == 0) {
                // saveAuthority_cont.saveAuthorityShow = true;
            } else {
                notification.error({
                    message: result.msg,
                    title: '温馨提示'
                });
                return;
            }
        });
    },
    checkedKeys: []
});

//循环遍历取出勾选子节点的父父节点直至最上一级
function getRun(tempArr) {
    if (tempArr.length != 0) {
        for (let t = 0; t < tempArr.length; t++) {
            if (finalCheckedArr.indexOf(tempArr[t].key) == -1) {
                finalCheckedArr.push(tempArr[t].key);
            }
            if (tempArr[t].children.length != 0) {
                getRun(tempArr[t].children);
            }
        }
    }
}

let tmpParent = []; //存储含有子节点的key
let allFunc = []; //存储所有的菜单跟功能
let tempExpandedKeys = []; //存储初始条件展开的节点
function getRoleTree(treelet, dataTree, pCode) {
    if (!treelet) {
        return;
    }
    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();
        dataTree[i].children = new Array();

        if (item.code) { //系统
            dataTree[i].key = item.code;
            dataTree[i].title = item.name;
            dataTree[i].icon = vm.defaults.org_icon;
            dataTree[i].hasChild = true;
            dataTree[i].flag = true;
            // dataTree[i].open = true;
            tmpParent.push(item.code);
            if (tempExpandedKeys.indexOf(item.code) == -1) {
                tempExpandedKeys.push(item.code);
                tempCheckTree.push(item.code);
            }
            getRoleTree(item.menus, dataTree[i].children, "");
        } else { //全选的时候，只传菜单和功能，不传系统
            allFunc.push(item.menuCode);
            dataTree[i].key = item.menuCode;
            dataTree[i].title = item.menuName;
            dataTree[i].hasChild = false;
            dataTree[i].pCode = pCode + '+' + item.menuCode;
            // dataTree[i].open = true;
            if (item.menuType == "MENU") {
                if (tempExpandedKeys.indexOf(item.menuCode) == -1) {
                    tempExpandedKeys.push(item.menuCode);
                }
                dataTree[i].icon = vm.defaults.menu_icon;
                dataTree[i].hasChild = true;
                if (item.childs.length != 0) {
                    tmpParent.push(item.menuCode);
                }
                getRoleTree(item.childs, dataTree[i].children, dataTree[i].pCode);
            } else {
                dataTree[i].icon = vm.defaults.fuc_icon;
            }
        }
    }

}

/**
 * 重新处理权限列表树的数据
 * @param {Array} treeData  传入的树数据
 * @param {Array} dataTree  存放处理后树数据
 */
function getRoleTreeDate(treeData, dataTree) {
    var i = 0,
        len = treeData.length;
    for (var i = 0; i < len; i++) {
        dataTree[i] = new Object();
        Object.keys(treeData[i]).forEach(prop => {
            dataTree[i][prop] = treeData[i][prop];
        });
        dataTree[i].checked = true;
        dataTree[i].chkDisabled = true;
        dataTree[i].children = new Array();
        getRoleTreeDate(treeData[i].children, dataTree[i].children);
    };
}

/**
 * 初始获取ms_tree中的选中数据的checkedNodes
 * @param {string} treeBoxId  传入的包裹ms-tree的标签id
 */
function getTreeCheckedNodes(treeBoxId) {
    let checkedNode = [];
    if ($(treeBoxId).find('ul')) {
        if ($(treeBoxId).find('ul')[0]) {
            let treeId = $(treeBoxId).find('ul')[0].id;
            const treeObj = $.fn.zTree.getZTreeObj(treeId);
            checkedNode = treeObj.getNodesByFilter(n => {
                const parentNode = n.getParentNode();
                const checkStatus = n.getCheckStatus();
                const parentCheckStatus = parentNode ? parentNode.getCheckStatus() : {
                    checked: false,
                    half: false
                };
                return (checkStatus.checked && !checkStatus.half) && (!parentCheckStatus.checked || parentCheckStatus.half);
            });
        }
    }
    return checkedNode;
}

//新增 and 编辑角色
let add_edit_cont = avalon.define({
    $id: 'add_edit_cont',
    add_editShow: false,
    add_editCancel: function () {
        this.add_editShow = false;
        add_editVm.roleName = '';
        add_editVm.name_display = 'none';
        add_editVm.roleNameTips = 'none';
        add_editVm.name_isNull = 'none';
    },
    add_editOk: function () {
        if (add_editVm.roleName == '') {
            add_editVm.name_isNull = 'block';
            return;
        }
        if (add_editVm.roleNameTips == 'block') {
            add_editVm.jsgl_close_name = true;
            return;
        }

        if (add_editVm.orderNo_format) {
            return;
        }

        if (add_editVm.title == '新增角色') {
            ajax({
                url: '/gmvcs/uap/roles/create',
                method: 'post',
                data: {
                    "roleName": add_editVm.roleName,
                    "orderNo": add_editVm.orderNo
                }
            }).then(result => {
                if (result.code == 0) {
                    notification.success({
                        message: '新增角色成功',
                        title: '温馨提示'
                    });
                    const roleData = result.data;
                    const {
                        id
                    } = roleData;
                    this.add_editShow = false;
                    vm.defaults.refreshEvt(id);

                } else {
                    notification.error({
                        message: result.msg,
                        title: '温馨提示'
                    });
                }
            });
        } else {
            ajax({
                url: '/gmvcs/uap/roles/edit',
                method: 'post',
                data: {
                    "roleName": add_editVm.roleName,
                    "orderNo": add_editVm.orderNo,
                    "id": add_editVm.roleId
                }
            }).then(result => {
                if (result.code == 0) {
                    notification.success({
                        message: '编辑角色成功',
                        title: '温馨提示'
                    });
                    this.add_editShow = false;
                    vm.defaults.refreshEvt();
                } else {
                    notification.error({
                        message: result.msg,
                        title: '温馨提示'
                    });
                }
            });
        }
    }
});
let add_editVm = avalon.define({
    $id: 'add_editVm',
    title: '新增角色',
    focusType: '',
    roleName: '',
    roleId: '',
    name_display: 'none',
    name_isNull: 'none',
    roleNameTips: 'none',
    jsgl_close_name: false,

    isAdmin: false,

    orderNo: "",
    orderNo_display: 'none',
    orderNo_close: false,
    orderNo_format: false,

    close_click: function (type) {
        if (type == "name") {
            this.roleName = "";
            this.jsgl_close_name = false;
            this.name_display = "block";
            this.roleNameTips = "none";
            $(".roleName_input").focus();
        } else if (type == "orderNo") {
            this.orderNo = "";
            // this.orderNo_close = false;
            this.orderNo_format = false;
            $(".orderNo_input").focus();
        }
        return false;
    },
    focusRoleName: function (type) {
        this.focusType = type;
        if (type == "name") {
            if (this.roleName.length != 0) {
                this.jsgl_close_name = true;
                $(".roleName_input").addClass("jsgl_change_padding");
            }
            this.name_isNull = 'none';
            if (this.roleNameTips == 'block') {
                $(".jsgl_add_edit_dialog  .common_input input[name='name']").addClass('has-error');
            } else {
                this.name_display = 'block';
            }
        } else if (type == "orderNo") {
            if(!this.isAdmin){
                return;
            }
            this.orderNo_display = 'block';
            this.orderNo_close = true;
        }
    },
    blurRoleName: function (type) {
        this.focusType = "";
        if (type == "name") {
            this.jsgl_close_name = false;
            this.name_display = 'none';
            if (this.roleNameTips == 'block') {
                $(".jsgl_add_edit_dialog  .common_input input[name='name']").removeClass('has-error');
            }
        } else if (type == "orderNo") {
            !this.orderNo_format && (this.orderNo_display = 'none');
            this.orderNo_close = false;
        }
    },
    roleNameEvt: function (e) {
        if (this.focusType == "name") {
            this.roleName = e.target.value;
            let name_val = e.target.value;
            var reg = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
            this.name_isNull = 'none';
            if (name_val.length == 0) {
                this.jsgl_close_name = false;
                $(".roleName_input").removeClass("jsgl_change_padding");
            } else {
                this.jsgl_close_name = true;
                $(".roleName_input").addClass("jsgl_change_padding");
            }
            if (name_val == '' || reg.test(name_val)) {
                this.name_display = 'block';
                this.roleNameTips = 'none';
                $(".jsgl_add_edit_dialog  .common_input input[name='name']").removeClass('has-error');
            } else {
                this.name_display = 'none';
                this.roleNameTips = 'block';
                $(".jsgl_add_edit_dialog  .common_input input[name='name']").addClass('has-error');
            }
        } else if (this.focusType == "orderNo") {
            if(!this.isAdmin){
                return;
            }
            if (!(typeof Number(this.orderNo) == "number" && this.orderNo > 0 && this.orderNo <= 9999)) {
                this.orderNo_format = true;
            } else {
                this.orderNo_format = false;
            }
        }
    },
});

//停用角色
let deleteRole_cont = avalon.define({
    $id: 'deleteRole_cont',
    deleteRoleShow: false,
    deleteRoleCancel: function () {
        this.deleteRoleShow = false;
    },
    deleteRoleOk: function () {
        ajax({
            url: '/gmvcs/uap/roles/delete/' + deleteRoleVm.deleteId,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code == 0) {
                notification.success({
                    message: '停用角色成功！',
                    title: '温馨提示'
                });
                this.deleteRoleShow = false;
                del = true;
                vm.defaults.refreshEvt();
            } else {
                notification.error({
                    message: result.msg,
                    title: '温馨提示'
                });
            }
        });
    }
});
let deleteRoleVm = avalon.define({
    $id: 'deleteRoleVm',
    title: '停用确认',
    deleteId: ''
});


let saveAuthority_cont = avalon.define({
    $id: 'saveAuthority_cont',
    saveAuthorityShow: false,
    saveAuthorityCancel: function () {
        this.saveAuthorityShow = false;
    }
});
let saveAuthorityVm = avalon.define({
    $id: 'saveAuthorityVm',
    title: '提示',
    saveAuthorityOk: function () {
        saveAuthority_cont.saveAuthorityShow = false;
    },
});