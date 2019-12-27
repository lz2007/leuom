## 开始


- 日常运行项目
  ``` bash
  npm run dev           //开发
  npm run build         //发布
  npm run zip 项目名     //ZIP打包
  npm run clean         //清理
  ```


## 目录结构

```
- apps            // 将页面按功能和业务切分后的模块
  + common        // 命名规范：[业务名称] / [业务名称]-[模块名称] .[html,js,css,less]
  - gf             // gf 业务下的 user 模块
    - gf-user.html      // 模块的页面结构
    - gf-user.js        // 模块的业务逻辑
    - gf-user.css       // 模块的表现样式
    - gf-group.js
    - ...
- mock                  // 模拟后端服务的数据
  - server.conf         // api数据路由（此文件不能删除或改名）
  - ......              // 自定义的json数据
+ pages                 // 除 index.html 的完整 HTML 页面，用于多页面应用
- services              // 超脱页面的业务逻辑模块
  - ajaxService.js      // 封装 ajax 方法，规范请求参数和响应数据的格式, 根据响应结果显示提示信息
  - configService.js    // 应用的配置项，可在构建时动态替换配置项
  - filterService.js    // 自定义的 Avalon2 过滤器
  - menuService.js      // 功能菜单的逻辑，权限过滤
  - routerService.js    // 路由配置
  - storeService.js     // 数据服务，包括后端数据交互和全局状态管理
- static                // 非 commonjs 模块化的资源
  - mod.js
+ vendor                // 不能通过 npm 安装的模块
- index.html            // 应用主页面
- index.css             // 应用主样式
- index.js              // 应用启动，包括 polyfill/必要的依赖/root VM/路由启动
```

## 浏览器支持
现代浏览器、IE8 及以上

## 项目截图

#### 系统首页

![系统首页.png](https://upload-images.jianshu.io/upload_images/7084049-49661e8dfb09416b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![系统首页2.png](https://upload-images.jianshu.io/upload_images/7084049-d43a569184f5bed9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![下载中心.png](https://upload-images.jianshu.io/upload_images/7084049-ea2a5ee166494f1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![修改密码.png](https://upload-images.jianshu.io/upload_images/7084049-8412d9caa50ea37f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 指挥中心

![实时指挥.gif](https://upload-images.jianshu.io/upload_images/7084049-6cbe52e15da16f2d.gif?imageMogr2/auto-orient/strip)

![视频监控.gif](https://upload-images.jianshu.io/upload_images/7084049-ca1320d8498da57f.gif?imageMogr2/auto-orient/strip)

![车牌布控.png](https://upload-images.jianshu.io/upload_images/7084049-85de8db5b3eeb9b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![告警订阅.png](https://upload-images.jianshu.io/upload_images/7084049-2c8db3dfda1b4b0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![人脸布控.png](https://upload-images.jianshu.io/upload_images/7084049-4c78d38526e4be9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![人脸核验.png](https://upload-images.jianshu.io/upload_images/7084049-d27e502628ed317c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
