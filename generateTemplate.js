// avalon 组件模板
module.exports = {
    // HTML 模板
    AvalonHtmlTemplate: component => {
      return `
<template>
    <div class="${component}">
        ${component} component template!
    </div>
</template>`;
    },
    // js模板
    AvalonJsTemplate: component => {
        return `
require('./${component}.less');
        
let name = '${component}';
avalon.component(name, {
    template: __inline('./${component}.html'),
    soleSlot: 'container',
    defaults: {
        key: 'value',
        onInit: function (event) {},
        onReady: function (event) {},
        onDispose: function (event) {}
    }
});
        `;
      },
    // less模板
    AvalonLessTemplate: component => {
    return `.${component} {
        
}`;
    }
  };