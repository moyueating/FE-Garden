随着项目一点点的深入，对于webpack的配置也是改了又改，看了又看，这里就再记录一下webpack.optimize.CommonsChunkPlugin的用法，多用于个人记忆。希望对你有所帮助。

### 基本使用
  ```
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module => {
      // 所有 node_modules 下的文件
      return module.resource && /node_modules/.test(module.resource)
    },
  }),

  ```
我们重新看下CommonsChunkPlugin配置项
1、name和names 
  a.如果name的值不与任何已存在的chunk相同，则会从options.chunks中提取出公共代码，并形成新的chunk，并以options.name去设置该chunk的name
  b.如果name选中的是已存在的chunk，则会从options.chunks中提取出被name选中的chunk。
  c.如果name是不存在的chunk，则会根据其他配置提取出公共chunk，并将该chunk的name值设为opitons.name的值
  d.如果name是个数组，则等同于每个name轮番调用该插件。
2、filename common chunk存入本地的文件名，未设置的话就默认使用chunk的名字。
3、minChunks 此属性可以有以下的选项
  a. 设定为数字（大于等于2），指定共用模块被多少个 chunk 使用才能被合并。
  b. 也可以设为函数，接受 (module, count) 两个参数，就像基本使用的代码那样。
  c. Infinity，创建common chunk但是不合并任何公共模块，就是一个空模块。可以搭配entry的配置
  ```
  entry: {
      vendor: ["jquery", "other-lib"],
      app: "./entry"
    }
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",

      // filename: "vendor.js"
      // (Give the chunk a different name)

      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    })
  ```
4、chunks 指定源chunk，设置了webpack会只从这些chunk中合并公共模块，否则m默认所有的chunk。
5、children，async这个两个主要是用于异步加载的，如果我们不设置children和async两个选项的话，那么所有异步加载的chunk中的公共模块会被重复打包。
  ```
  // 举个例子，一个项目入口js是index.js，还有有三个页面A,B,C，对应的js分别是A.js，B.js，C.js，每个页面都引用了antd这个module，这时候我们为了优化项目首页的加载速度，我们想把三个页面的代码异步加载，所以我们如下设置
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module => {
      // 所有 node_modules 下的文件
      return module.resource && /node_modules/.test(module.resource)
    },
  }),
  // 这样设置后首页的index.js确实变小，首页加载速度变快了，但是我们发现A，B，C这个三个js里面都会有antd这个module的代码，就相当于antd这个库代码被重复加载了三次，这就很尴尬了。所以就需要children这个属性了，我们再加一个配置
  new webpack.optimize.CommonsChunkPlugin({
    children: true,
    minChunks: (module, count) => {
      // 被 3 个及以上 chunk 使用的共用模块提取出来
      return count >= 3
    }
  }),
  // 这时候打包完成后你再去看发现A，B，C这个三个js里面的antd已经没有了，但是它跑到index.js这个入口文件里面去了，这就是相当于又增加了首页的加载时间啊。这是因为当你只设置children为true时，所有异步加载的chunk的公共模块会被打包进父chunk中，这里就是入口的index.js中。那我们就改一下上面的配置：
  new webpack.optimize.CommonsChunkPlugin({
    async: 'async',
    children: true,
    minChunks: (module, count) => {
      // 被 3 个及以上 chunk 使用的共用模块提取出来
      return count >= 3
    }
  })
  // 这时候打包完成后你会发现又生成了一个async的chunk文件，里面就是antd这个库，A，B，C和index中都没有antd了。原来设置了async，所有异步加载的chunk的公共模块不会再被打包进父chunk中，而是使用新的异步加载的额外模块chunk,当异步加载的子chunk被加载时，它会被自动并行加载。
  ```

  ```
  // 最终代码
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module => {
      return module.resource && /node_modules/.test(module.resource)
    },
  }),
  new webpack.optimize.CommonsChunkPlugin({
    async: 'async-vendor',
    children: true,
    minChunks: (module, count) => {
      return count >= 3
    }
  }),   
  ```
