import {
    notification,
} from "ane";
import ajax from "/services/ajaxService";
import * as menuServer from '/services/menuService';

let {
    dep_switch,
} = require('/services/configService');
export const name = "tyywglpt-sbzygl-cjgzzgl";
require("./tyywglpt-sbzygl-cjgzzgl.less");
require('/apps/common/common-org-breadcrumb');

var storage = require('/services/storageService.js').ret;

let tableObject_cjgzztj = {};
let cjgzztj_vm = null;
avalon.component(name, {
    template: __inline("./tyywglpt-sbzygl-cjgzzgl.html"),
    defaults: {
        key_dep_switch: dep_switch,
        // zfsypsjglpt_language: getLan(), //英文翻译
        // 面包屑
        firstbreadcrumbList: {},
        breadcrumbList: [],
        device_id: "",
        police_check: "",
        crumbsArr: [],
        isReturnBtn: false,
        isSearchBtn: false,

        table_pagination: {
            current: 0,
            pageSize: 17
        },
        authority: { // 按钮权限标识
            "SEARCH": false, //设备资源管理_执法仪管理_查询
        },
        getDepList() {
            let deptemp = [];
            ajax({
                // url: '/gmvcs/uap/org/all',
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {},
                cache: false
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取部门树失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                getDepTree(result.data, deptemp);
                cjgzztj_tree.yspk_data = deptemp;

                cjgzztj_tree.tree_code = deptemp[0].path;
                cjgzztj_tree.tree_key = deptemp[0].key;
                cjgzztj_tree.tree_title = deptemp[0].title;

                this.firstbreadcrumbList = {
                    orgName: '首页',
                    orgId: deptemp[0].key,
                    orgPath: deptemp[0].path
                }
            }).then(result => {
                // this.ajaxList(0, 20);
            });
        },
        actions(type, text, record, index) {
            // console.log(type);
        },
        ajaxList(page, pageSize, level = 0, item, isbreadcrumbList) {
            // count_type_vm.curType = level;
            let params = {
                "orgId": item ? item.orgId : cjgzztj_tree.curTree || cjgzztj_tree.tree_key,
                "level": count_type_vm.curType, // 统计对象 level: 1 下级部门 0当前部门
                "page": page,
                "pageSize": pageSize
            };

            if (this.isReturnBtn) {
                params.orgId = cjgzztj_tree.tree_key;
                this.isReturnBtn = false;
            }

            if(!this.isSearchBtn){//点击列表部门，即不是点击按钮查询，level: 1 下级部门
                params.level = 1;
            }

            tyywglpt_sbzygl_cjgzztj_table.current = 1;
            tyywglpt_sbzygl_cjgzztj_table.paramsData = params;
            tyywglpt_sbzygl_cjgzztj_table.list = [];
            tyywglpt_sbzygl_cjgzztj_table.fetch(params, item, isbreadcrumbList);
        },
        returnBtn() {
            this.crumbsArr.pop();
            // cjgzztj_vm.change_page = false;
            cjgzztj_tree.tree_code = this.crumbsArr[this.crumbsArr.length - 1].orgPath;
            cjgzztj_tree.orgId = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            cjgzztj_tree.tree_key = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            cjgzztj_tree.tree_title = this.crumbsArr[this.crumbsArr.length - 1].orgName;
            cjgzztj_tree.curTree = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            this.isReturnBtn = true;
            cjgzztj_vm.searchBtn(1);
        },
        searchBtn(level = 0, item, isbreadcrumbList = false) {
            $('.popover.top.in').hide();

            if (level === 0) {//查询按钮点击
                cjgzztj_vm.crumbsArr = [];
                this.breadcrumbList = [];
                cjgzztj_vm.isSearchBtn = true;
                storage.setItem('cjgzztj_vm_breadcrumbList', JSON.stringify(this.breadcrumbList));
                tyywglpt_sbzygl_cjgzztj_table.sbzygl_cjgzztj_tabCont_top = 104;
            }

            if (level === 1) {//列表部门点击
                cjgzztj_vm.isSearchBtn = false;
                tyywglpt_sbzygl_cjgzztj_table.sbzygl_cjgzztj_tabCont_top = 104;
            }

            this.ajaxList(0, 20, level, item, isbreadcrumbList);
        },
        gTo(re) {
            var record = [];            
            record.push(re);
            storage.setItem('cjgzzgl_vm_currentRecord', JSON.stringify(record));
            $('.popover.top.in').hide();
            avalon.history.setHash('/tyywglpt-sbzygl-cjgzzgl-main');
        },
        dialogCancel() {
            this.import_show = false;
        },
        dialogOk() {
            this.import_show = false;
        },
        selectfuc(event, depNode) {

        },
        handleTableChange(table_pagination) {
            if (this.table_pagination.hasOwnProperty('current')) {
                this.table_pagination.current = table_pagination.current;
            }
        },
        onReady(event) {
            /*初始化统计对象级别*/
            if (count_type_vm.curType) {
                count_type_vm.count_type = [count_type_vm.curType];
            } else {

            }

            if (cjgzztj_tree.curTree) {
                cjgzztj_tree.yspk_value = [cjgzztj_tree.curTree];
            }

            $("body").bind('click', function () {
                tyywglpt_sbzygl_cjgzztj_table.hintPbl_flag = false;
                tyywglpt_sbzygl_cjgzztj_table.hintPfl_flag = false;
            });

            let v_height = $(window).height() - 96;

            let s = $(".zcqktj-list-content").height();
            let len = tyywglpt_sbzygl_cjgzztj_table.list.length;
            if (len * 34 > s) {
                $(".zcqktj-list-header-upper").addClass('table-padding-right16');
                $(".zcqktj-list-header").addClass('table-padding-right16');
            } else {
                $(".zcqktj-list-header-upper").removeClass('table-padding-right16');
                $(".zcqktj-list-header").removeClass('table-padding-right16');
            }
        },
        onInit(event) {
            let _this = this;
            cjgzztj_vm = this;
            let breadcrumbList = storage.getItem('cjgzztj_vm_breadcrumbList')
            if (breadcrumbList) {
                this.breadcrumbList = JSON.parse(breadcrumbList)
            }

            if (this.breadcrumbList.length) {
                tyywglpt_sbzygl_cjgzztj_table.sbzygl_cjgzztj_tabCont_top = 104;
            } else {
                tyywglpt_sbzygl_cjgzztj_table.sbzygl_cjgzztj_tabCont_top = 104;
            }

            tableObject_cjgzztj = $.tableIndex({ //初始化表格jq插件
                id: 'sbzygl_cjgzztj_table',
                tableBody: tableBody_cjgzztj
            });

            // 导出、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_ZFJLYGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0) {
                    $('.zcqktj-list-panel').css('top', '34px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
                if (false == _this.authority.EXPORT && false == _this.authority.SEARCH)
                    $('.zcqktj-list-panel').css('top', '34px');
            });
            if (!cjgzztj_tree.curTree) {
                this.getDepList();
            }
        }
    }
});

// 新需求 统计对象去掉 进来默认查询当前部门  点击部门查询下一级部门
let count_type_vm = avalon.define({
    $id: 'cjgzztj_count_type_jjb',
    curType: "0",
    //  count_type_options: [],
    count_type_options: [{
        value: "0",
        label: "当前部门"
    }, {
        value: "1",
        label: "下级部门"
    }],
    count_type: ["0"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

//定义树
let cjgzztj_tree = avalon.define({
    $id: "cjgzztj_tree_jjb",
    yspk_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.key;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: '通知'
                });
            }
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            if (result.code == 0) {
                getDepTree(result.data, deptemp_child);
                treeObj.addNodes(treeNode, deptemp_child);
            }
            if (selectedKey != treeNode.key) {
                let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                treeObj.selectNode(node);
            }
        });

    }
});

function getDepTree(treelet, dataTree) {
    if (!treelet) {
        return;
    }

    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();

        dataTree[i].key = item.orgId; //---部门id
        dataTree[i].title = item.orgName; //---部门名称

        dataTree[i].orgCode = item.orgCode; //---部门code
        dataTree[i].checkType = item.checkType; //---部门code
        dataTree[i].path = item.path; //---部门路径，search的时候需要发

        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();

        getDepTree(item.childs, dataTree[i].children);
    }
}

let tyywglpt_sbzygl_cjgzztj_table = avalon.define({
    $id: 'tyywglpt_sbzygl_cjgzztj_table_jjb',
    sbzygl_cjgzztj_tabCont_top: 104,
    //页面表格数据渲染
    loading: false,
    hintPfl_flag: false,
    hintPbl_flag: false,
    list: [],
    changeData: [], //保存需要编辑或者删除的用户
    total: 0,
    isNull: false,
    current: 0,
    pageSize: 20,
    paramsData: {},
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    hint_Pfl() {
        this.hintPbl_flag = false;
        if (this.hintPfl_flag == true) {
            this.hintPfl_flag = false;
        } else {
            this.hintPfl_flag = true;
        }
    },
    actions(type, text, record, index) {

    },
    hint_Pbl() {
        this.hintPfl_flag = false;
        if (this.hintPbl_flag == true) {
            this.hintPbl_flag = false;
        } else {
            this.hintPbl_flag = true;
        }
    },
    sortup() {
        this.list.sort(function (l, p) {
            return p.orgUserTotal - l.orgUserTotal
        });
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange() {
        this.list = [];
        tableObject_cjgzztj.tableDataFnc([]);

        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        this.fetch(params);
    },
    fetch(params, item, isbreadcrumbList) {
        // this.loading = true;
        tableObject_cjgzztj.loading(true);

        ajax({
            url: '/gmvcs/uom/device/statistics/assets/statistics?level=' + params.level + "&orgId=" + params.orgId + "&vpage=" + params.page + "&vpageSize=" + params.pageSize,
            method: 'get',
            data: {

            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: "查询失败！",
                    title: "温馨提示"
                });

                this.list = [];
                tableObject_cjgzztj.tableDataFnc([]);

                // this.loading = false;
                tableObject_cjgzztj.loading(false);

                this.isNull = true;
                return;
            }

            if (!result.data.currentElements.length) {
                this.loading = false;
                return
            }
            if (cjgzztj_vm.isSearchBtn && count_type_vm.curType == "1") {
                let obj = {
                    orgPath: cjgzztj_tree.tree_code,
                    orgId: cjgzztj_tree.tree_key,
                    orgName: cjgzztj_tree.tree_title,
                    level: 0,
                };
                cjgzztj_vm.crumbsArr.push(obj);
                cjgzztj_vm.isSearchBtn = false;
            }
            if (item) {
                cjgzztj_tree.curTree = item.orgId;
                cjgzztj_tree.tree_key = item.orgId;
                cjgzztj_tree.tree_code = item.orgPath;
                cjgzztj_tree.tree_title = item.orgName;
                let list = cjgzztj_vm.breadcrumbList.$model;
                list.unshift(cjgzztj_vm.firstbreadcrumbList.$model);
                list.push({
                    orgName: item.orgName,
                    orgId: item.orgId,
                    orgPath: item.orgPath
                });
                list = unique(list);

                cjgzztj_vm.breadcrumbList = JSON.parse(JSON.stringify(list));
                storage.setItem('cjgzztj_vm_breadcrumbList', JSON.stringify(cjgzztj_vm.breadcrumbList));

                // if (count_type_vm.curType == "1") {
                    let obj = {
                        orgPath: cjgzztj_tree.tree_code,
                        orgId: cjgzztj_tree.tree_key,
                        orgName: cjgzztj_tree.tree_title,
                        level: 0,
                    };
                    if (cjgzztj_vm.crumbsArr.length > 0 && cjgzztj_vm.crumbsArr[cjgzztj_vm.crumbsArr.length - 1].orgId == obj.orgId) {

                    } else {
                        cjgzztj_vm.crumbsArr.push(obj);
                    }
                // }
            }
            if (result.data.currentElements) {
                this.changeData = []; //当表格刷新当前页数据置空
                this.total = result.data.totalElements;
                let ret = [];
                avalon.each(result.data.currentElements, function (index, el) {
                    ret.push(el);
                });
                // let ret = result.data.currentElements;
                let len = ret.length; //记录当前页面的数据长度
                this.list = [];
                tableObject_cjgzztj.tableDataFnc([]);

                if (ret.length % 20 == 0) {
                    $(".zcqktj-list-header-upper").addClass('table-padding-right16');
                    $(".zcqktj-list-header").addClass('table-padding-right16');
                } else {
                    $(".zcqktj-list-header-upper").removeClass('table-padding-right16');
                    $(".zcqktj-list-header").removeClass('table-padding-right16');
                }
                // this.loading = false;
                tableObject_cjgzztj.loading(false);
                this.isNull = false;
                this.list = avalon.range(len).map(n => ({
                    orgName: ret[n].orgName,
                    orgId: ret[n].orgId,
                    orgCode:ret[n].orgCode,
                    orgPathMain: ret[n].orgPath,//传递给跳转后的页面，保证orgPath路径的完整。
                    orgPath: (ret[n].orgPath).split("/")[(ret[n].orgPath).split("/").length - 2],
                    workstationTotal: ret[n].assetsWorkstationInfo.workstationTotal,
                    spaceTotal: ret[n].assetsWorkstationInfo.spaceTotal,
                    index: 1 + 20 * (this.current - 1) + n
                }));
                var _this = this;
                tableObject_cjgzztj.tableDataFnc(_this.list);

            }
            if (result.data.totalElements == 0) {
                this.current = 0;
                // this.loading = false;
                tableObject_cjgzztj.loading(false);

                this.isNull = true;
                return;
            }
        }).then(result => {
            _popover(); //激活title功能
            let s = $(".zcqktj-list-content").height();
            let len = this.list.length;
            if (len * 34 > s) {
                $(".zcqktj-list-header-upper").addClass('table-padding-right16');
                $(".zcqktj-list-header").addClass('table-padding-right16');
            } else {
                $(".zcqktj-list-header-upper").removeClass('table-padding-right16');
                $(".zcqktj-list-header").removeClass('table-padding-right16');
            }
        });
    },
    handleSelect(record, selected, selectedRows) {
        table.changeData = selectedRows;
    },
    handleSelectAll(selected, selectedRows) {
        for (let i = 0; i < selectedRows.length; i++) {
            table.changeData[i] = selectedRows[i];
        }
    },
});

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}

/*title显示,方便复制*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popover({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        html: 'true',
        content: function () {
            return '<div class="title-content">' + $(this)[0].innerText + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popover("hide");
            $(_this).popover("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 100);
    });
    $('.popover.top.in').hide();
}

let tableBody_cjgzztj = avalon.define({ //表格定义组件
    $id: 'sbzygl_cjgzztj_table',
    data: [],
    key: 'rid',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    selection: [],
    isAllChecked: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'zfypsjj-tableDrag-style',
    debouleHead: ["table-index-thead", "cjgzztj_table_parent"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
    handleCheckAll: function (e) {
        var _this = this;
        var data = _this.data;
        if (e.target.checked) {
            data.forEach(function (record) {
                _this.checked.ensure(record[_this.key]);
                _this.selection.ensure(record);
            });
        } else {
            if (data.length > 0) {
                this.checked.clear();
                this.selection.clear();
            } else {
                this.checked.removeAll(function (el) {
                    return data.map(function (record) {
                        return record[_this.key];
                    }).indexOf(el) !== -1;
                });
                this.selection.removeAll(function (el) {
                    return data.indexOf(el) !== -1;
                });
            }
        }
        // this.selectionChange(this.checked, this.selection.$model);
        tyywglpt_sbzygl_cjgzztj_table.handleSelectAll(e.target.checked, this.selection.$model);
    },
    handleCheck: function (checked, record) {
        if (checked) {
            this.checked.ensure(record[this.key]);
            this.selection.ensure(record);
        } else {
            this.checked.remove(record[this.key]);
            this.selection.remove(record);
        }
        // this.selectionChange(this.checked, this.selection.$model);
        tyywglpt_sbzygl_cjgzztj_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        // var text = ' ';
        tyywglpt_sbzygl_cjgzztj_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});

// 去重
function unique(arr) {
    var res = [arr[0]];
    for (var i = 0; i < arr.length; i++) {
        var repeat = false;
        for (let j = 0; j < res.length; j++) {
            if (isObjectValueEqual(arr[i], res[j])) {
                repeat = true;
                break;
            }
        }
        if (!repeat) {
            res.push(arr[i]);
        }
    }
    return res;
}

//判断两对象是否相等
function isObjectValueEqual(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}
