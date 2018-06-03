### 背景
  create-react-app创建的应用默认是SPA的架子入口只有index.html。但是有些情况下我们确实需要在同一个工程下开发多个SPA项目，一个是2C的H5项目，一个是后台的管理项目。网上多页面的配置已经很多了，这里只是想扩展记录一些方法。

### 实践
  项目的架子是下面这样的。

  ![structure](https://raw.githubusercontent.com/moyueating/blogImg/master/webpack%E5%8A%A8%E6%80%81%E5%88%9B%E5%BB%BA%E5%85%A5%E5%8F%A3/structure.png)

  按照网上大多数的配置如下。
  ```
    // 入口文件的配置
    entry: {
      anchorH5: [
        require.resolve('./polyfills'),
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.appSrc + "/views/anchorH5/index.js",
      ],
      anchorWeb: [
        require.resolve('./polyfills'),
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.appSrc + "/views/anchorWeb/index.js",
      ],
      orderManageH5: [
        require.resolve('./polyfills'),
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.appSrc + "/views/orderManageH5/index.js",
      ]
    }
  ```
  ```
    // 插件文件新增
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["anchorH5"],
      template: paths.appHtml,
      filename: 'anchorH5.html',
      favicon: paths.appPublicFavicon,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    })
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["anchorWeb"],
      template: paths.appHtml,
      filename: 'anchorWeb.html',
      favicon: paths.appPublicFavicon,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    })
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["orderManageH5"],
      template: paths.appHtml,
      filename: 'orderManageH5.html',
      favicon: paths.appPublicFavicon,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    })
  ```
  好的代码绝对不允许出现大量的重复性代码，所以我们就需要将这些提取简化成方法。
  ```
    const glob = require('gob')
    function getEntry() {
      let entry = {};
      let srcDirName = './src/views/*/index.js'; //入口文件夹路径
      glob.sync(srcDirName).forEach(function (name) {
        let n = name.slice(0, name.length - 9); //去掉/index.js
        n = n.slice(n.lastIndexOf('/')).split("/")[1]; //获取文件夹目录名
        entry[n] = [
            require.resolve('./polyfills'),
            require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appSrc + "/views/"+ n +"/index.js",
        ];
      });
      return entry;
    }
  ```
  ```
    function getPlugins() {
      let = [...otherPlugin]
      let srcDirName = './src/views/*/index.js'; 
      glob.sync(srcDirName).forEach(function (name) {
        let n = name.slice(0, name.length - 9); 
        n = n.slice(n.lastIndexOf('/')).split("/")[1];
        plugins.push(new HtmlWebpackPlugin({
            inject: true,
            chunks: [n],
            template: paths.appHtml,
            filename: n + '.html',
            favicon: paths.appPublicFavicon,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }))
      });
    }
  ```
  ```
    module.export = {
      entry: getEntry(),
      ...
      plugins: getPlugins(),
    }
  ```
  这样后面维护的人只需要按照这个规则建新的目录就好了，而不用每次都去修改webpack的配置了。
  但是这样本地启动服务的时候还有点问题，因为我们还没有修改webpackDevServer的配置。
  ```
    function getRewrites (){
      let list = []
      let srcDirName = './src/views/*/index.js'; 
      glob.sync(srcDirName).forEach(function (name) {
          var n = name.slice(0, name.length - 9);
          n = n.slice(n.lastIndexOf('/')).split("/")[1];
          list.push({
              from: eval("/^\\/" + n + "/"), to: config.output.publicPath + n +'.html'
          });
      });
      return list;
    }
  ```
  ```
    ...
    historyApiFallback: {
      disableDotRule: true,
      // 指明哪些路径映射到哪个html
      rewrites: getRewrites()
    }
    ...
  ```
  这样就OK了😝。

