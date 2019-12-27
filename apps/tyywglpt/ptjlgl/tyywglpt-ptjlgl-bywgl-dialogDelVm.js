//删除弹窗vm定义
import {
    deleteRole,
    forceDelete
} from '/apps/common/common-gb28181-tyywglpt-device-api';

import {
    refreshList
} from '/apps/common/common-gb28181-ztree-ctl';

import {
    errOK,
    ajaxInfo
} from '/apps/common/common-gb28181-tyywglpt-api';

export let dialogDelVm = avalon.define({
    $id: 'ptjlgl-bywgl-delete-vm',
    show: false,
    isDel: false,
    type: 'device',
    userCode: '',
    treeId: '',
    treeNode: '',
    deviceRids: [],
    isGroup: false,
    isSubmit: false,
    vm: '',
    handleCancel(e) {
        this.show = false;
        this.isSubmit = false;
        $.mask_close_all();
    },
    handleOk() {
        if (!this.isSubmit) {
            this.isSubmit = true;
            $.mask_element('#ptjlgl-bywgl-del-body', '数据提交中，请稍后...');
            if (this.type == 'device') {
                forceDelete(this.deviceRids).then(result => {
                    if (result.code !== errOK) {
                        ajaxInfo('error', (result.msg ? result.msg : '删除失败'));
                    } else {
                        ajaxInfo('success', '删除成功');
                    }
                    refreshList(this.treeId, this.treeNode, 'del', result, this.vm);
                }).always(() => {
                    this.handleCancel();
                });
            } else {
                deleteRole(this.vm.JurisdictionData.path, this.userCode).then(result => {
                    if (result.code == errOK) {
                        ajaxInfo('success', '删除成功');
                        this.vm.queryfindRoleByOrgPath(this.vm.JurisdictionData.path);
                    } else {
                        ajaxInfo('error', result.msg ? result.msg : '删除失败');
                    }
                }).always(() => {
                    this.handleCancel();
                });
            }
        }
    }
});