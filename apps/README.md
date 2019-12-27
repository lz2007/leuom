## 公用表格组件 /common/common-ms-table/common-ms-table.js

@Author: mikey.liangzhu
@Date: 2018-09-20 10:40:49
@Last Modified by: mikey.liangzhu
@Last Modified time: 2019-08-06 09:56:36

组件名：ms-comtable

使用参数：
@param data array 表格数据 默认[]
@param actions object 表格操作回调 默认空函数
@param onChange object 表格单选多选回调 默认空函数
@param panelCss object 表格样式 默认{}
@param current number 表格数据 作用于表格序号 默认 0
@param pageSize number 表格数据 作用于表格序号 默认 20
@param loading boolean 表格数据 loading 显示 默认 false

组件名：ms-comtable-header

使用参数：
@param isHide boolean 是否显示列 默认 true
@param popover string 表格是否启用 popover 功能 默认 true
@param title string 表格表头内容
@param colwidth string 表格宽度 咱只支持 百分比
@param handle object 表格操作回调 默认空函数
@param dataIndex string data 数据里的对象的 key
@param type string {type:selection} 表格显示多选 || {type:index} 表格序号 ms-comtable 传入 current && pageSize 可自动排序序号

使用实例：

html

```html
<ms-comtable
  :widget="{current:@pagination.current,pageSize:@pagination.pageSize,loading:@loading,data:@list,actions:@actions,onChange:selectChange,panelCss:{marginTop: 42,height: 700}}"
>
  <ms-comtable-header
    :widget="{dataIndex:'id',type:'selection',colwidth:'5%'}"
  ></ms-comtable-header>
  <ms-comtable-header
    :widget="{title:'序号',type:'index',colwidth:'5%',popover:true}"
  ></ms-comtable-header>
  <ms-comtable-header :widget="{title:'操作',colwidth:'10%'}">
    <button
      type="button"
      class="btn btn-danger btn-xs"
      :click="handle('delete')"
    >
      修改
    </button>
    <button
      type="button"
      class="btn btn-danger btn-xs"
      :click="handle('delete')"
    >
      删除
    </button>
  </ms-comtable-header>
  <ms-comtable-header
    :widget="{title:'姓名',dataIndex:'address',colwidth:'10%',popover:true}"
  ></ms-comtable-header>
  <ms-comtable-header
    :widget="{title:'性别',dataIndex:'province',colwidth:'10%',isHide:false,popover:true}"
  ></ms-comtable-header>
  <ms-comtable-header :widget="{title:'人员类型',colwidth:'10%',popover:true}">
    <span :skip>{{record.name}}</span>
  </ms-comtable-header>
</ms-comtable>
```

js

```javascript
import '/common/common-ms-table/common-ms-table';

loading: false,
// 表格
list: avalon.range(20).map(n => ({
    id: n,
    name: '老狼' + n,
    address: '深山',
    province: '老林',
    checked: false
})),
// 表格-操作回调
actions(type, text, record, index) {
    if (type == 'delete') {
        this.list.removeAll(el => el.id == record.id);
        message.success({
            content: '删除成功'
        });
    }
},
// 表格-选择回调
selectChange(type, data) {
    console.log(type)
    console.log(data)
    console.log(this.list)
},
// 分页
pagination: {
    total: 100,
    pageSize: 20,
    current: 1
}

```


## 公用弹窗组件 /common/common-ms-modal.js

@Author: mikey.liangzhu
@Date: 2018-09-20 10:40:49
@Last Modified by: mikey.liangzhu
@Last Modified time: 2019-08-06 09:56:36

组件名：common-ms-modal

使用参数：
@param modalSelector string 弹窗id 默认 any
@param title string 弹窗标题 默认 '提示'
@param cancelText string 自定义取消按钮文字 默认 null
@param okText string 自定义确认按钮文字 默认 null
@param onCancel object 点击取消的回调 默认 function
@param onOk object 点击取消的回调 默认 function
@param show boolean 是否显示弹窗 默认 false
@param withIframe boolean 是否加入 iframe 以防止 OCX 遮挡 默认 false
@param modalWidth number string 自定义弹窗宽度 默认 auto
@param modalHeight number string 自定义弹窗 body 高度 默认 auto
@param ifcancelBtn boolean 是否显示取消按钮 默认 false
@param ifokBtn boolean 是否显示确定按钮 默认 false
@param drag boolean 是否可以拖动弹窗 默认 true
@param btnalign boolean 弹窗底部按钮位置 默认 right [left, center,right]

<solt></solt> 插槽 弹窗 body 内容

使用实例：

```html
<xmp
  :widget="{is:'common-ms-modal',modalSelector:'.sjbgl-del-body',drag:true,modalWidth:300,show:@showmodal,onOk:@okClickfn,onCancel:@cancelClickFn}">
    <div class="sjbgl-del-body">
        是否删除?
    </div>
</xmp>
```

```javascript
import '/common/common-ms-modal';

defaults:{
    showmodal:false,
    okClickfn(){
    },
    cancelClickFn(){
    }
}

```

注意:

有插槽的组件使用时要用<xmp is="组件名" />，不能使用<ms-组件名 />来使用组件，不然在 ie8 出问题
xmp 不能嵌套

