import ajax from '/services/ajaxService';
import Sbzygl from '/apps/common/common-sbzygl';
import {
    notification
} from 'ane';
const storage = require('/services/storageService.js').ret;
export const name = 'tyywglpt-yxjk-xtfw';
require('/apps/common/common-tyywglpt.css');
require('./tyywglpt-yxjk-xtfw.css');
require('/apps/common/common-line');

let vm = null,
    sbzygl = null;
const listHeaderName = name + "-list-header";


avalon.component(name, {
    template: __inline("./tyywglpt-yxjk-xtfw.html"),
    defaults: {
        $id: 'xtfw-vm',
        loading: true,
        isNull: false,
        list: [],
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        table_pagination: {
            current: 1,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
        },
        pageChange(page) {
            this.table_pagination.current = page;
            fetchList();
        },
        lineChangeData: false,

        //存储增长曲线echart（CPU）
        growthCurveLine: {
            lineTitle: "CPU使用率",
            xAxisObject: {
                data: ['0', '10', '20', '30', '40', '50', '60']
            },
            areaStyle: {
                lineColor: '#ff8470',
                areaColor: '#ffd36b',
                opacity: 0.8
            },
            seriesData: {},
        },
        //存储增长曲线echart（RAM）
        growthRAMLine: {
            lineTitle: "RAM占用率",
            xAxisObject: {
                data: ['0', '10', '20', '30', '40', '50', '60']
            },
            areaStyle: {
                lineColor: '#7770ff',
                areaColor: '#c470ff',
                opacity: 0.8
            },
            seriesData: {},
        },
        //更新数据
        listLoading: false,
        infoList: [],
        getInfo: function (orgCode) {
            this.growthCurveLine.seriesData = {};
            this.growthRAMLine.seriesData = {};
            this.lineChangeData = !this.lineChangeData;
            this.infoList = [];
            this.listLoading = true;

            ajax({
                url: `/gmvcs/operation/ws/monitor?orgCode=${orgCode}`,
                method: "get",
                data: {}
            }).then(result => {
                this.infoList = [];
                this.listLoading = false;
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: "通知"
                    });
                    return;
                }

                if (result.data.wsMonitors.length == 0) {
                    return;
                }

                this.growthCurveLine.seriesData = result.data.storageRate;
                this.growthRAMLine.seriesData = result.data.storageRate;
                this.lineChangeData = !this.lineChangeData;
            });
        },

        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let _this = this;
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            fetchList();
            sbzygl.autoSetListPanelTop();
        },
        onDispos() {
            clearTimeout(this.titleTimer);
            $('div.popover').remove();
        },

        handleSelectItem(item) {
            // dialogSelectVm.show = true;
            // this.getInfo("44010000");
        }
    }
})

//获取表格列表
function fetchList() {
    let url = '/gmvcs/operation/backServer/monitor';

    // 获取模拟数据
    // let url = '/../mock/tyywglpt-yxjk-xtfw.json';

    let data = {}
    vm.dataStr = JSON.stringify(data);
    storage.setItem(name, vm.dataStr, 0.5);
    vm.loading = true;
    sbzygl.ajax(url, 'get', data).then(result => {
        vm.loading = false;

        vm.list = result.data;

        vm.isNull = false;

        sbzygl.initList();
        // 初始化表头拖拽
        sbzygl.initDragList(listHeaderName);

    }).fail(() => {
        vm.loading = false;
        vm.list = [];
        vm.table_pagination.total = 0;
        vm.isNull = true;
        sbzygl.initDragList(listHeaderName);
    });
}

//添加弹窗vm定义
const dialogSelectVm = avalon.define({
    $id: 'xtfw-vm',
    show: false,
    handleCancel(e) {
        this.show = false;
    }
});