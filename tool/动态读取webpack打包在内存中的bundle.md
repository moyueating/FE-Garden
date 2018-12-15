### 需求
在平时纯前端的项目中我们习惯了webpack-dev-server和hot module replacement给我带来的开发方式的方便。但是如果我们想在服务端渲染开发的时候同样拥有这种开发体验，我们该如何？

我们先大概看下服务端渲染的简单例子:  
```js
const express = require('express')
const ReactDomServer = require('react-dom/server')
const App = require('../src/app.js').default
const app = express()

app.get('*', function(req, res){
  const content = ReactDomServer.renderToString(App)
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')
  res.send(template.replace('<!--app-->', content))
})
```
这里这个App其实就是我们平时看到的ReactDom.render(<App />, document.getElementById('id'))中被渲染到页面的内容，开发环境下这里是通过webpack打包自动把js注入到页面执行后动态渲染的。所以服务端渲染在开发过程中也可以借鉴这个思路读取内存中文件编译后在直接res.send到页面，这样不用每次修改完代码前端去编译写入本地文件，再去重启服务端读取新的代码，这样虽然也行，但毕竟费时费力。  


大概的代码思路如下：  
```js
const MemoryFileSystem = require("memory-fs")
const mfs = new MemoryFileSystem()
const serverCompile = webpack(webpackServerConfig)

let serverApp

// 将webpack输出系统自定义为内存中，关键，不然webpack默认将编译好的代码写入本地磁盘
serverCompile.outputFileSystem = mfs

serverCompile.watch({}, (err, stats) => {
  if(err) throw err
  // 将平时webpack编译的输出信息转为json
  const info = stats.toJson()
  if (stats.hasErrors()) {
    info.errors.forEach(err => console.error(err))
  }
  if (stats.hasWarnings()) {
    info.warnings.forEach(err => console.error(err))
  }
  // 内存中的bundlePath
  const bundlePath = path.join(
    webpackServerConfig.output.path,
    webpackServerConfig.output.filename
  )
  const bundle = mfs.readFileSync(bundlePath, 'utf-8')
  
  serverApp = requireFromString(bundle, 'server-entry.js')
})

// 上面读取的bundle是字符串，我们需要将其转为我们平时代码中常见的模块方便输入输出，这里我们利用module的构造函数
function requireFromString(bundle, filename) {
  const Module = module.constructor;
  const m = new Module();
  m._compile(bundle, filename);
  return m.exports.default;
}

// 正常使用serverApp
app.get('*', function(req, res){
  const content = ReactDomServer.renderToString(serverApp)
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')
  res.send(template.replace('<!--app-->', content))
})

```

官方中解释webpack-dev-server的原理就是这种，毕竟内存中的读取比磁盘读取快多了😁!


==============================更新================================
上次通过在内存中获取bundle并且exports出去渲染，其实打包的时候我忽略了一个状况，这时候服务端的打包配置是下面这样的：
```js
module.exports = merge(webpackBaseConfig, {
  mode: process.env.NODE_ENV,
  target: 'node',
  entry: [path.resolve(__dirname, '../server/app.js')],
  output: {
    filename: 'server_entry.js',
    libraryTarget: 'commonjs2',
  },
  // 启用node的__dirname
  node: {
    __filename: false,
    __dirname: false
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      }
    ]
  }
})
```
这里其实有问题，服务端的打包那些依赖的包完全不需要打包进去，我们在node运行的时候可以require进来，所以打包的时候可以减小包的很大的体积，增加下面的配置：
```js
const nodeExternals = require('webpack-node-externals')
module.exports = {
  ...,
  externals: [nodeExternals()],// 将node-modules的包全部忽略
  // JS 执行入口文件
  entry: [path.resolve(__dirname, '../server/app.js')],
}
```
这时候启动服务的时候就会报错:
![errr.png](https://raw.githubusercontent.com/moyueating/blogImg/master/webpack%E5%86%85%E5%AD%98%E4%B8%AD%E8%AF%BB%E5%8F%96bundle/error.png)

后来才知道上面那种requireFromString的方法没有require的方法，而我们打包的时候由包所有的node_modules全去掉了，所以就找不到模块了。所以需要改进我们requireFromString的方法：  

```js
const vm = require('vm')
const NativeModule = require('module')

function requireFromString(bundle, filename) {
  const m = { exports: {} }
  const codeString = NativeModule.wrap(bundle)
  const script = new vm.Script(codeString, {
    filename,
    displayErrors: true
  })
  const result = script.runInThisContext()
  result.call(m.exports, m.exports, require, m) // 这里就是将result执行时需要的exports，require，module传入。
  return m
}
```
一开始不懂这个东西，后来看了一下大概的文档以及相关的源码，vm是虚拟机模块
```js
// 相关方法的源码  https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js
// 这样大概就清楚了，我们从内存中读取出字符串通过wrap包装后变成一个方法字符串
// 再通过vm.Script将字符串实例再指定的上下文中运行
// vm https://nodejs.org/dist/latest-v10.x/docs/api/vm.html#vm_new_vm_script_code_options
Module.wrap = function(script) {
  return Module.wrapper[0] + script + Module.wrapper[1];
};

Module.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];

```
