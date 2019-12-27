require('./common-loading-mask.less');

let name = 'ms-loading-mask';
avalon.component(name, {
    template: __inline('./common-loading-mask.html'),
    defaults: {
        loading: false,
        loadingClass: '',
        loadingStyle: '',
        text: '结果加载中',
        onInit() {},
        onReady() {},
        onDispose() {}
    }
})