/*
 * @Description: 权限管理弹窗
 * @Author: liangzhu
 * @Date: 2019-05-16 14:11:21
 * @LastEditTime: 2019-05-16 14:24:31
 * @LastEditors: Please set LastEditors
 */

import {
    getMgr,
    getFindByPage,
    submitUserArchetypeRole,
} from '/apps/common/common-gb28181-tyywglpt-device-api';

export let dialogJurisdictionVm = avalon.define({
    $id: 'ptjlgl-bywgl-Jurisdiction-vm',
    show: false,
    title: '权限管理',
    gbcodeList: '',
    orgId: '',
    orgCode: '',
    Jurisdiction: [],
    JurisdictionClick(item) {
        item.isClick = !item.isClick;
    },
    noResultData: false,
    sbzygl:'',
    vm:'',
    query() {
        this.noResultData = false;
        getFindByPage(this.gbcodeList, this.orgId, this.orgCode).then(result => {
            if (result.code == 0) {

                let data = (result.data && result.data.currentElements) ? result.data.currentElements : [];
                data.forEach(item => {
                    item.isClick = false;
                });

                this.Jurisdiction = data;

                if (!data.length) {
                    this.noResultData = true;
                    this.sbzygl.showTips('info', '无匹配数据');
                }
            } else {
                this.Jurisdiction = [];
                this.sbzygl.showTips('error', result.msg);
            }
        });
    },
    keydownQuery(e) {
        if (e.keyCode === 13 || e.code == "Enter") {
            this.query();
        }
    },
    handleCancel(e) {
        this.show = false;
        this.isSubmit = false;
        $.mask_close_all();
    },
    isSubmit: false,
    handleOk() {
        if (!this.vm.JurisdictionData.path) {
            this.sbzygl.showTips('error', '请选择左边部门树');
            return false;
        }
        let data = this.Jurisdiction.filter(item => {
            return item.isClick
        });

        if (data.length && !this.isSubmit) {
            $.mask_element('#cjzxhgl-bywgl-modal-Jurisdiction', '数据提交中,请稍后...');
            this.isSubmit = true;

            let tempData = [];
            data.forEach(item => {
                let obj = {
                    userCode: item.userCode,
                    userName: item.userName
                }
                tempData.push(obj);
            });

            submitUserArchetypeRole(this.vm.JurisdictionData.path, tempData).then(result => {
                if (result.code == 0) {
                    this.sbzygl.showTips('success', '添加成功');
                    this.vm.queryfindRoleByOrgPath(this.vm.JurisdictionData.path);
                    this.handleCancel();
                } else {
                    this.sbzygl.showTips('error', result.msg);
                }
            }).always(() => {
                this.isSubmit = false;
                $.mask_close_all();
            });
        }
    },
});

dialogJurisdictionVm.$watch('show', newVal => {
    if (newVal) {
        dialogJurisdictionVm.Jurisdiction = [];
        if (!dialogJurisdictionVm.orgId) {
            getMgr().then(result => {
                if (result.code == 0) {
                    dialogJurisdictionVm.orgId = result.data[0].orgId;
                    dialogJurisdictionVm.orgCode = result.data[0].orgCode;
                } else {
                    dialogJurisdictionVm.sbzygl.showTips('error', result.msg);
                }
            });
        }
    }
});