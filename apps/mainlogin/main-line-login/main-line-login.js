// 公共引用部分，兼容IE8
require('/apps/common/common');

// === demo核心内容 ===
require('/apps/common/common-login');

require('./main-line-login.less');

export const name = "ms-main-line-login";

avalon.component(name, {
    template: __inline('./main-line-login.html'),
    defaults: {
        onReady() {
            //设置input框自动获得焦点
            let timer = setInterval(function () {
                if($('#username').is(':focus')){
                    clearInterval(timer);
                }else{
                    $('#username').focus();
                }
            }, 200);
        }
    }
});

avalon.scan(document.body);

