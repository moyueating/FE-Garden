### 前端配置工程师
  都说前端是配置工程师，写个项目各种配置，现在主流的也就是webpack的配置，gulp、grunt这类都已经退居1.5线了。那下面我们就讲讲webpack配置，但我今天就以create-react-app中的那些配置都是干嘛用的。我们不要求对webpack的所有插件都知道，但是应该要知道webpack可以用来干什么，等有需求的时候知道从哪里入手。

### webpack.config.dev.js

  #### [autoprefixer](https://github.com/postcss/autoprefixer)
  是个前端都能懂，就是css自动加前缀，配合postcss使用，如果想更加详细的postcss配置，请移步[移动端适配](https://github.com/moyueating/blogBackup/blob/master/css/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E9%80%82%E9%85%8D.md)。

  #### [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
  这个插件就是为你生成一个已经自动注入打包后的js的html文件

  #### [case-sensitive-paths-webpack-plugin](https://github.com/Urthen/case-sensitive-paths-webpack-plugin)
  这个插件就是防止不同的系统下对于大小写的问题导致路径出错

  #### [InterpolateHtmlPlugin](https://github.com/zanettin/react-dev-utils)
  这个插件是配合html-webpack-plugin一起使用的,允许你在index.html中使用变量
  ```
    // 我们在create-react-app生成的项目中public下的index.html可以看到下面的代码
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
  ```
  这里的PUBLIC_URL就是一个变量，当webpack打包的时候将你设置的值替换它。

  #### [WatchMissingNodeModulesPlugin](https://github.com/zanettin/react-dev-utils)
  这个也是方便开发的插件，当你在一个项目里引用了没有安装的node_modules,webpack会报错module not found，然后你安装完成后，需要自己手动重新启动服务。WatchMissingNodeModulesPlugin这个插件就是帮你省去这步骤，你安装玩缺失的module，webpack会自动重启。

  #### [eslintFormatter](https://github.com/zanettin/react-dev-utils)
  emmmm....eslint

  #### [ModuleScopePlugin](https://github.com/zanettin/react-dev-utils)
  这个插件是防止你在当前项目中引入非本项目的资源（即src和node_modules文件夹之外的），因为只有src文件夹下的代码才会被babel转译。

  #### [webpack.NamedModulesPlugin](https://webpack.docschina.org/plugins/named-modules-plugin/#src/components/Sidebar/Sidebar.jsx)
  这个插件的作用是在热加载时直接返回更新文件名，而不是文件的id，方便开发人员定位。[具体](https://www.jianshu.com/p/8499842defbe)

  #### [webpack.DefinePlugin](https://webpack.docschina.org/plugins/define-plugin/#src/components/Sidebar/Sidebar.jsx)
  DefinePlugin 允许创建一个在编译时可以配置的全局常量。这可能会对开发模式和发布模式的构建允许不同的行为非常有用。比如我们区分测试环境和正式环境的域名
  ```
    new webpack.DefinePlugin({
      PRODUCTION: process.env.NODE_ENV === "production",
      DEVELOPMENT: process.env.NODE_ENV === "development"
    })
  ```
  然后在js代码中，如果代码中使用了eslint，还需要在package.json中将这个变量声明一下
  ```
    "eslintConfig": {
      "extends": "react-app",  // 继承已启用的规则配置
      "globals": {
        "PRODUCTION": false  // false不允许PRODUCTION变量重写，只读属性
        "DEVELOPMENT": true  // true允许DEVELOPMENT变量重写
      }
    }
  ```
  ```
    if(PRODUCTION){
      domain = www.production.com
    }else{
      domain = www.development.com
    }
  ```

  #### [webpack.HotModuleReplacementPlugin](https://webpack.docschina.org/plugins/hot-module-replacement-plugin/#src/components/Sidebar/Sidebar.jsx)
  模块热替换插件，cereate-react-app中只有css变换才有热替换，js变更会刷新页面。

  #### [IgnorePlugin](https://webpack.docschina.org/plugins/ignore-plugin/#src/components/Sidebar/Sidebar.jsx)
  webpack打包时忽略打包的资源。

### webpack.config.prod.js

  #### [extract-text-webpack-plugin](https://webpack.docschina.org/plugins/extract-text-webpack-plugin/#src/components/Sidebar/Sidebar.jsx)
  将CSS从JS bundle中拆分出来，减小JS的文件大小，加载速度更快。

  #### [webpack-manifest-plugin](https://webpack.docschina.org/guides/output-management/#manifest)
  这个就是在build打包的过程中生成一个JSON文件，用来展示编译之前得文件和编译以后的文件的映射关系。

  #### [sw-precache-webpack-plugin](https://github.com/goldhand/sw-precache-webpack-plugin)
  SWPrecacheWebpackPlugin是一个webpack插件，用于使用service worker来缓存外部项目依赖项。 
  [初步了解 Service Worker](https://www.jianshu.com/p/0e2dee4c77bc)
  [深入了解 Service Worker](https://zhuanlan.zhihu.com/p/27264234)
