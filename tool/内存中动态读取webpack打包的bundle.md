### 需求
在平时纯前端的项目中我们习惯了webpack-dev-server和hot module replacement给我带来的开发方式的方便。但是如果我们想在服务端开发的时候同样拥有这种开发体验，我们该如何？

我们先大概看下服务端渲染的简单例子:  
```js
const express = require('express')
const ReactDomServer = require('react-dom/server')
const App = require('../src/app.js')
const app = express()

app.get('*', function(req, res){
  const content = ReactDomServer.renderToString(App)
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')
  res.send(template.replace('<!--app-->', content))
})
```
在开发过程中，这个App其实是存在于内存中的，webpack-dev-server这些插件是从内存中帮我们读取并且注入到到HTML中，所以服务端渲染在开发过程中也可以直接从内存中读取，这样不用每次修改完代码前端去编译写入本地文件，再去重启服务端读取新的代码，这样虽然也能行，但毕竟费时费力。  


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
  var Module = module.constructor;
  var m = new Module();
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