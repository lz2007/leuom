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
![系统首页.png](https://upload-images.jianshu.io/upload_images/7084049-6878bb234cfa1c8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![系统首页2.png](https://upload-images.jianshu.io/upload_images/7084049-9a0136efdf4ac809.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![下载中心.png](https://upload-images.jianshu.io/upload_images/7084049-3f0e5d7c5c5bc74f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![修改密码.png](https://upload-images.jianshu.io/upload_images/7084049-1f8d85686c0d2276.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 指挥中心

![实时指挥.gif](https://upload-images.jianshu.io/upload_images/7084049-f5a5021f023117d2.gif?imageMogr2/auto-orient/strip)

![视频监控.gif](https://upload-images.jianshu.io/upload_images/7084049-f8c2a2badbdffec0.gif?imageMogr2/auto-orient/strip)![告警订阅 (1).png](https://upload-images.jianshu.io/upload_images/7084049-15cd35e017af2906.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![人脸布控 (1).png](https://upload-images.jianshu.io/upload_images/7084049-a2b68ff68d3313a4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![车牌布控.png](https://upload-images.jianshu.io/upload_images/7084049-35b13cd08300743e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![人脸核验 (1).png](https://upload-images.jianshu.io/upload_images/7084049-96291a7611e0eb58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 数据中心
![数据中心-视音频管理-执法仪媒体.png](https://upload-images.jianshu.io/upload_images/7084049-dfe44a3c2169d3ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数据中心-执法档案.png](https://upload-images.jianshu.io/upload_images/7084049-d0f4758d690b77ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![录像回放.png](https://upload-images.jianshu.io/upload_images/7084049-7c018bc8678030c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![轨迹查询.png](https://upload-images.jianshu.io/upload_images/7084049-14340a2c2dbf0c13.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![告警查询.png](https://upload-images.jianshu.io/upload_images/7084049-d9adc9f438460499.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![智能识别.png](https://upload-images.jianshu.io/upload_images/7084049-d476668781d2cbfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![统计分析.png](https://upload-images.jianshu.io/upload_images/7084049-49f5a4e3a4cf364b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 监督中心
![考评核查总览.png](https://upload-images.jianshu.io/upload_images/7084049-46794eecb061d7ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![随机抽查.png](https://upload-images.jianshu.io/upload_images/7084049-62a7097f6ccfddf3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![定向抽查.png](https://upload-images.jianshu.io/upload_images/7084049-bc972e630e311d0b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![考核结果-1.png](https://upload-images.jianshu.io/upload_images/7084049-51826cf3f07dc896.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![考核结果-2.png](https://upload-images.jianshu.io/upload_images/7084049-851ee9382c4f6f33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 运维中心
![运行监控-采集工作站.png](https://upload-images.jianshu.io/upload_images/7084049-3166d26024e296cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![运行监控-存储服务器.png](https://upload-images.jianshu.io/upload_images/7084049-532208686e1bc5c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![运行监控-后台服务.png](https://upload-images.jianshu.io/upload_images/7084049-a88a5ec53955ff7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![资源管理-采集工作站管理.png](https://upload-images.jianshu.io/upload_images/7084049-836bb1aa0e74c19f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![资源管理-存储服务管理.png](https://upload-images.jianshu.io/upload_images/7084049-611b8dc26c618bb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![资源管理-多路视频采集设备管理.png](https://upload-images.jianshu.io/upload_images/7084049-a207a1eebf9a4dd3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![资源管理-终端设备管理.png](https://upload-images.jianshu.io/upload_images/7084049-0799060c22cb7c8a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![资源管理-资产统计.png](https://upload-images.jianshu.io/upload_images/7084049-dcb328f7e70fd223.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![告警管理.png](https://upload-images.jianshu.io/upload_images/7084049-8a8d5eb5de04054d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![文件上传任务.png](https://upload-images.jianshu.io/upload_images/7084049-2bcaf1044e1b7f09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![自动关联服务.png](https://upload-images.jianshu.io/upload_images/7084049-ff2a8afb1dcdc6db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![升级包管理-采集工作站.png](https://upload-images.jianshu.io/upload_images/7084049-7c2bfc086f990ad6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![授权管理.png](https://upload-images.jianshu.io/upload_images/7084049-6688d65e603f1576.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 配置中心
![用户管理.png](https://upload-images.jianshu.io/upload_images/7084049-fbdb3836cb057823.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![角色管理.png](https://upload-images.jianshu.io/upload_images/7084049-3be8ad5043764f6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![黑名单-用户.png](https://upload-images.jianshu.io/upload_images/7084049-e85ceeef8610dc9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![黑名单-终端.png](https://upload-images.jianshu.io/upload_images/7084049-557f5837d016bcd2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数据字典.png](https://upload-images.jianshu.io/upload_images/7084049-fe9662a9b67e4014.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![操作日志-采集站.png](https://upload-images.jianshu.io/upload_images/7084049-c4c0b5a1615edc6f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![操作日志-后台管理系统.png](https://upload-images.jianshu.io/upload_images/7084049-6693ab8eb813808f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![操作日志-日记统计.png](https://upload-images.jianshu.io/upload_images/7084049-80c830e73297eeca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![操作日志-执法仪日志.png](https://upload-images.jianshu.io/upload_images/7084049-30a53485fc4a59a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
