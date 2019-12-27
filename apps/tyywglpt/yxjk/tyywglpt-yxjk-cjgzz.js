import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import {
    interval
} from '/services/configService';
import {
    versionSelection
} from '/services/configService';
import {
    Gm
} from '/apps/common/common-tools';
require('/apps/common/common-orgtree-control');
require('/apps/common/common-pie');
require('/apps/common/common-line');

function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();

export const name = "tyywglpt-yxjk-cjgzz";
require("./tyywglpt-yxjk-cjgzz.less");

let cjgzzVm;
avalon.component(name, {
    template: __inline("./tyywglpt-yxjk-cjgzz.html"),
    defaults: {
        //版本控制 云南
        versionSelection: versionSelection == 'Yunnan' ? true : false,
        //部门树
        cjgzzOrgTreeVm: avalon.define({
            $id: "cjgzzOrgTree",
            cjgzzOrgData: [],
            cjgzzOrgName: "", //选择的部门名称
            cjgzzOrgId: "", //选择部门id
            cjgzzOrgCode: "", //选择部门code
            timer: null,
            getSelected(key, title, node) {
                clearInterval(this.timer);
                this.cjgzzOrgId = key;
                this.cjgzzOrgCode = node.orgCode;
                this.cjgzzOrgName = title;
                cjgzzVm.getInfo(this.cjgzzOrgCode);
                this.timer = setInterval(() => {
                    cjgzzVm.getInfo(cjgzzVm.cjgzzOrgTreeVm.cjgzzOrgCode);
                }, interval);
            }
        }),

        pieChangeData: false,
        lineChangeData: false,

        //在线率echart
        onlineRatePie: {
            pieTitle: "工作站在线率",
            pieRate: "0.00%",
            topLabel: "在线总数",
            topTotal: 0,
            topColor: "#70e9ff",
            bottomLabel: "总数",
            bottomTotal: 0,
            bottomColor: "#111733",
            unit: "台",
        },

        //使用率echart
        useRatePie: {
            pieTitle: "存储容量使用率",
            pieRate: "0.00%",
            topLabel: "剩余容量",
            topTotal: 0,
            topColor: "#70ff95",
            bottomLabel: "总容量",
            bottomTotal: 0,
            bottomColor: "#111733",
            unit: "TB",
        },

        //存储增长曲线echart
        growthCurveLine: {
            lineTitle: "存储增长曲线（30天）",
            xAxisObject: {
                name: "日期",
                data: ['1', '5', '10', '15', '20', '25', '30']
            },
            areaStyle: {
                lineColor: '#ff8470',
                areaColor: '#ffd36b',
                opacity: 0.8
            },
            seriesData: [],
        },

        //更新数据
        listLoading: false,
        infoList: [],
        WSFileCount: [],
        getInfo: function (orgCode) {
            //初始化数据
            this.onlineRatePie.topTotal = "-";
            this.onlineRatePie.bottomTotal = "-";
            this.onlineRatePie.pieRate = "-";
            this.useRatePie.topTotal = "-";
            this.useRatePie.bottomTotal = "-";
            this.useRatePie.pieRate = "-";
            this.pieChangeData = !this.pieChangeData;

            this.growthCurveLine.seriesData = [];
            this.lineChangeData = !this.lineChangeData;

            this.infoList = [];

            this.listLoading = true;
            // 云南版本  文件数量特殊需求
            if (cjgzzVm.versionSelection) {
                let p = new Promise((rs, rj) => {
                    // getWSFileCounter(orgCode);
                    rs();
                });
                p.then(() => {
                    ajax({
                        // url: `/api/getInfo?orgCode=${orgCode}`,
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

                        if (!result.data.wsMonitors || result.data.wsMonitors.length == 0) {
                            // return;
                        }

                        this.onlineRatePie.topTotal = result.data.wsOnlineNum;
                        this.onlineRatePie.bottomTotal = result.data.wsTotalNum;
                        this.onlineRatePie.pieRate = result.data.wsOnlineRate;
                        this.useRatePie.topTotal = result.data.remainCapacity;
                        this.useRatePie.bottomTotal = result.data.totalCapacity;
                        this.useRatePie.pieRate = result.data.useRate;
                        this.pieChangeData = !this.pieChangeData;

                        if ($.isEmptyObject(result.data.storageRate) || result.data.storageRate["total"] == "0") {
                            this.growthCurveLine.seriesData = [0, 0, 0, 0, 0, 0, 0];
                            let keyArr = [];
                            for (let key in result.data.storageRate) {
                                if (key != "total") {
                                    keyArr.push(key);
                                }
                            }
                            this.growthCurveLine.xAxisObject.data = keyArr;
                        } else {
                            let temp = [],
                                keyArr = [];
                            for (let key in result.data.storageRate) {
                                if (key != "total") {
                                    keyArr.push(key);
                                    let j = (result.data.storageRate[key] / result.data.storageRate["total"] * 100).toFixed(2);
                                    temp.push(j);
                                }
                            }
                            this.growthCurveLine.seriesData = temp;
                            this.growthCurveLine.xAxisObject.data = keyArr;
                        }
                        this.lineChangeData = !this.lineChangeData;

                        if (result.data.wsMonitors && result.data.wsMonitors.length > 0) {

                            for (let i = 0; i < result.data.wsMonitors.length; i++) {
                                let obj = result.data.wsMonitors[i];
                                obj.total = obj.ts + "TB";
                                obj.used = obj.us + "TB";
                                obj.SCRate = (obj.us / obj.ts * 100).toFixed(2) + "%";
                                obj.fileCounter = obj.fileNum || '0' + " 个"; //文件数量
                                // for (let f = 0; f < cjgzzVm.WSFileCount.length; f++) { 
                                //     if (cjgzzVm.WSFileCount[f].gbCode == obj.id) {
                                //         obj.fileCounter = cjgzzVm.WSFileCount[f].fileCount + "个"; //文件数量
                                //     }
                                // }
                                this.infoList.push(obj);
                            }
                        }

                        let tooltipsDom = $("[data-toggle='popover']");
                        Gm_tool.showPopover(tooltipsDom);

                    });
                });
            } else {
                ajax({
                    // url: `/api/getInfo?orgCode=${orgCode}`,
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

                    if (!result.data.wsMonitors || result.data.wsMonitors.length == 0) {
                        // return;
                    }

                    this.onlineRatePie.topTotal = result.data.wsOnlineNum;
                    this.onlineRatePie.bottomTotal = result.data.wsTotalNum;
                    this.onlineRatePie.pieRate = result.data.wsOnlineRate;
                    this.useRatePie.topTotal = result.data.remainCapacity;
                    this.useRatePie.bottomTotal = result.data.totalCapacity;
                    this.useRatePie.pieRate = result.data.useRate;
                    this.pieChangeData = !this.pieChangeData;

                    if ($.isEmptyObject(result.data.storageRate) || result.data.storageRate["total"] == "0") {
                        this.growthCurveLine.seriesData = [0, 0, 0, 0, 0, 0, 0];
                        let keyArr = [];
                        for (let key in result.data.storageRate) {
                            if (key != "total") {
                                keyArr.push(key);
                            }
                        }
                        this.growthCurveLine.xAxisObject.data = keyArr;
                    } else {
                        let temp = [],
                            keyArr = [];
                        for (let key in result.data.storageRate) {
                            if (key != "total") {
                                keyArr.push(key);
                                let j = (result.data.storageRate[key] / result.data.storageRate["total"] * 100).toFixed(2);
                                temp.push(j);
                            }
                        }
                        this.growthCurveLine.seriesData = temp;
                        this.growthCurveLine.xAxisObject.data = keyArr;
                    }
                    this.lineChangeData = !this.lineChangeData;

                    if (result.data.wsMonitors && result.data.wsMonitors.length > 0) {

                        for (let i = 0; i < result.data.wsMonitors.length; i++) {
                            let obj = result.data.wsMonitors[i];
                            obj.total = obj.ts + "TB";
                            obj.used = obj.us + "TB";
                            obj.SCRate = (obj.us / obj.ts * 100).toFixed(2) + "%";
                            this.infoList.push(obj);
                        }
                    }

                    let tooltipsDom = $("[data-toggle='popover']");
                    Gm_tool.showPopover(tooltipsDom);
                });
            }


        },

        onInit: function (e) {
            cjgzzVm = e.vmodel;
        },
        onReady: function () {
            $(document.body).css({
                "min-height": "943px",
                "min-width": "1670px"
            });

            ajax({
                url: "/gmvcs/uap/org/find/fakeroot/mgr",
                method: "get",
                data: {}
            }).then(result => {
                if (result.data && result.data.length > 0) {
                    let temp = getTreeData(result.data);
                    this.cjgzzOrgTreeVm.cjgzzOrgData = temp;
                    this.cjgzzOrgTreeVm.cjgzzOrgId = result.data[0].orgId;
                    this.cjgzzOrgTreeVm.cjgzzOrgCode = result.data[0].orgCode;
                    this.cjgzzOrgTreeVm.cjgzzOrgName = result.data[0].orgName;
                    this.getInfo(result.data[0].orgCode);//默认显示第一级部门设备
                }
            });
        },
        onDispose: function () {
            $(document.body).css({
                "min-height": "auto",
                "min-width": "auto"
            });
        }
    }
})

//================== 部门树相关函数 start ==================

function getTreeData(treeData) {
    for (let i = 0; i < treeData.length; i++) {
        treeData[i].icon = "/static/image/tyywglpt/org.png";
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        if (!treeData[i].childs) {
            treeData[i].children = new Array();
        } else {
            treeData[i].children = treeData[i].childs;
        }
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty("dutyRange")) {
            delete treeData[i]["dutyRange"];
        }
        if (treeData[i].hasOwnProperty("extend")) {
            delete treeData[i]["extend"];
        }
        if (treeData[i].hasOwnProperty("orderNo")) {
            delete treeData[i]["orderNo"];
        }
        if (!(treeData[i].childs && treeData[i].childs.length)) { } else {
            getTreeData(treeData[i].childs);
        }
    }
    return treeData;
}
//================== 部门树相关函数 end ==================
//================== 获取采集工作站文件数量 ==================
function getWSFileCounter(orgCode) {
    ajax({
        // url: "http://192.168.55.101:9040/file/ws/search?orgCode=" + orgCode,
        url: "/gmvcs/filenums/file/ws/search?orgCode=" + orgCode,
        method: "get",
        // data: data
    }).then(result => {
        cjgzzVm.WSFileCount = result.data;
    });
}