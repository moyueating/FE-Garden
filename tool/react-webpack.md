### 前端配置工程师
  都说前端是配置工程师，写个项目各种配置，现在主流的也就是webpack的配置，gulp、grunt这类都已经退居1.5线了。那下面我们就讲讲webpack配置，但我今天就以create-react-app中的那些配置都是干嘛用的。我们不要求对webpack的所有插件都知道，但是应该要知道webpack可以用来干什么，等有需求的时候知道从哪里入手。

### webpack.config.dev.js

  #### autoprefixer
    是个前端都能懂，就是css自动加前缀，配合postcss使用，如果想更加详细的postcss配置，请移步[移动端适配](https://github.com/moyueating/blogBackup/blob/master/css/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E9%80%82%E9%85%8D.md)。

  #### [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
    这个插件就是为你生成一个已经自动注入打包后的js的html文件

  #### [case-sensitive-paths-webpack-plugin](https://github.com/Urthen/case-sensitive-paths-webpack-plugin)
    这个插件就是防止不同的系统下对于大小写的问题导致路径出错

  #### [InterpolateHtmlPlugin](https://github.com/zanettin/react-dev-utils)
    这个插件是配合HtmlWebpackPlugin一起使用的,允许你在index.html中使用变量
    ```
      // 我们在create-react-app生成的项目中public下的index.html可以看到下面的代码
      <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
      <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    ```
    这里的PUBLIC_URL就是一个变量，当webpack打包的时候将你设置的值替换它。


