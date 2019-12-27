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
require('/apps/common/common-pie');
require('/apps/common/common-orgtree-control');
require('/apps/common/common-line');

function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();

export const name = "tyywglpt-yxjk-ccfw";
require("./tyywglpt-yxjk-ccfw.less");

let ccfwVm;
avalon.component(name, {
    template: __inline("./tyywglpt-yxjk-ccfw.html"),
    defaults: {
        //版本控制 云南
        versionSelection: versionSelection == 'Yunnan' ? true : false,
        //部门树
        ccfwOrgTreeVm: avalon.define({
            $id: "ccfwOrgTree",
            ccfwOrgData: [],
            ccfwOrgName: "", //选择的部门名称
            ccfwOrgId: "", //选择部门id
            ccfwOrgCode: "", //选择部门code
            timer: null,
            getSelected(key, title, node) {
                clearInterval(this.timer);
                this.ccfwOrgId = key;
                this.ccfwOrgCode = node.orgCode;
                this.ccfwOrgName = title;
                ccfwVm.getInfo(this.ccfwOrgCode);
                this.timer = setInterval(() => {
                    ccfwVm.getInfo(ccfwVm.ccfwOrgTreeVm.ccfwOrgCode);
                }, interval);
            }
        }),

        pieChangeData: false,
        lineChangeData: false,

        //在线率echart
        onlineRatePie: {
            pieTitle: "存储服务器在线率",
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

        TSFileCount: [],
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
            // this.infoList = [{
            //     'total': '1',
            //     'used': '1',
            //     'SCRate': '1',
            //     'fileCounter':'1',
            // }];
            // debugger
            this.listLoading = true;
            if (ccfwVm.versionSelection) {
                let p = new Promise((rs, rj) => {
                    // getTSFileCounter(orgCode);
                    rs();
                });
                p.then(() => {
                    ajax({
                        // url: `/api/getInfo?orgCode=${orgCode}`,
                        url: `/gmvcs/operation/st/monitor?orgCode=${orgCode}`,
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

                        if (!result.data.stMonitors || result.data.stMonitors.length == 0) {
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

                        if (result.data.stMonitors && result.data.stMonitors.length > 0) {
                            for (let i = 0; i < result.data.stMonitors.length; i++) {
                                let obj = result.data.stMonitors[i];
                                obj.total = obj.ts + "TB";
                                obj.used = obj.us + "TB";
                                obj.SCRate = (obj.us / obj.ts * 100).toFixed(2) + "%";
                                obj.fileCounter = obj.fileNum || '0' + "个"; //文件数量
                                // for (let f = 0; f < ccfwVm.TSFileCount.length; f++) { 
                                //     if (ccfwVm.TSFileCount[f].gbCode == obj.id) {
                                //         obj.fileCounter = ccfwVm.TSFileCount[f].fileCount + "个"; //文件数量
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
                    url: `/gmvcs/operation/st/monitor?orgCode=${orgCode}`,
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

                    if (!result.data.stMonitors || result.data.stMonitors.length == 0) {
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

                    if (result.data.stMonitors && result.data.stMonitors.length > 0) {
                        for (let i = 0; i < result.data.stMonitors.length; i++) {
                            let obj = result.data.stMonitors[i];
                            obj.total = obj.ts + "TB";
                            obj.used = obj.us + "TB";
                            obj.SCRate = (obj.us / obj.ts * 100).toFixed(2) + "%";

                            this.infoList.push(obj);
                        }
                    }

                });
            }


        },

        onInit: function (e) {
            ccfwVm = e.vmodel;
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
                    this.ccfwOrgTreeVm.ccfwOrgData = temp;
                    this.ccfwOrgTreeVm.ccfwOrgId = result.data[0].orgId;
                    this.ccfwOrgTreeVm.ccfwOrgCode = result.data[0].orgCode;
                    this.ccfwOrgTreeVm.ccfwOrgName = result.data[0].orgName;
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
//================== 获取存储服务器文件数量 ==================
function getTSFileCounter(orgCode) {
    ajax({
        // url: "http://192.168.55.101:9040/file/ws/search?orgCode=" + orgCode,
        url: "/gmvcs/filenums/file/ts/search?orgCode=" + orgCode,
        method: "get",
        // data: data
    }).then(result => {
        ccfwVm.TSFileCount = result.data;
    });
}