## 背景
　最近项目中遇到再安卓5.0以下的兼容问题，最后查了资料发现没有引入babel-polyfill的原因导致。后来就详细了解并整理了一下babel相关的知识点。

## Babel包的构成
#### 核心包
- [babel-core](https://github.com/babel/babel/blob/7.0/packages/babel-core)：是babel转译器本身，提供转译的API，例如babel.transform等，webpack的babel-loader就是调用这些API完成转译的
- [babylon](https://github.com/babel/babylon)：js的词法解析器
- [babel-traverse](https://github.com/babel/babel/blob/7.0/packages/babel-traverse)：用于对AST（抽象语法树Abstract Syntax Tree）的遍历
- [babel-generator](https://github.com/babel/babel/blob/7.0/packages/babel-generator)：根据AST生成代码

#### 其他
- [babel-cli](https://github.com/babel/babel/blob/7.0/packages/babel-cli)：用于命令行转码
- [babel-types](https://github.com/babel/babel/blob/7.0/packages/babel-types)：用于检验，构建和变更AST的节点
- [babel-helpers](https://github.com/babel/babel/blob/7.0/packages/babel-helpers)：一系列预制的babel-template函数，用于提供给一些plugins使用
- [babel-template](https://github.com/babel/babel/blob/7.0/packages/babel-template)：辅助函数，用于从字符串形式的代码来构建AST树节点
- [babel-code-frame](https://github.com/babel/babel/blob/7.0/packages/babel-code-frame)：用于生成错误信息，打印出错误点源代码帧以及指出出错位置
- [babel-register](https://github.com/babel/babel/blob/7.0/packages/babel-register)：通过绑定node.js的require来完成自动编译
- **[babel-polyfill](https://github.com/babel/babel/blob/7.0/packages/babel-polyfill)：JS标准新增的原生对象和API的shim，实现上仅仅是core-js和regenerator-runtime两个包的封装**
- **[babel-runtime](https://github.com/babel/babel/blob/7.0/packages/babel-runtime)：类似于polyfill，但是不会污染全局变量**

## babel的配置
一般常见的还是直接通过编写.babelrc,也推荐这么用，当然你也可以使用命令行的形式。

#### 配置字段（这里以vue的官方架子里面的字段为例）

![option.png](http://upload-images.jianshu.io/upload_images/2593925-8e55e0375ecea1a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

env：可以对BABEL_ENV或者NODE_ENV指定的不同的环境变量，进行不同的编译操作，优先获取BABEL_ENV环境变量，然后NODE_ENV，最后默认development
plugins：使用的插件列表
presets：使用的preset列表，常见的es20xx,stage-x,以及env等
comments：编译过程是否产生注释，默认为true

#### 配置文件的查找
babel会从当前转译的文件所在目录下查找配置文件，如果没有找到，就顺着文档目录树一层层往上查找，一直到.babelrc文件存在或者带babel字段的package.json文件存在为止。

## babel的工作原理
```
ES6代码输入 ==》 babylon进行解析 ==》 得到AST
==》 plugin用babel-traverse对AST树进行遍历转译 ==》 得到新的AST树
==》 用babel-generator通过AST树生成ES5代码
```
babel转译有一点需要注意：**babel只是转译新标准引入的语法，比如ES6的箭头函数转译成ES5的函数；而新标准引入的新的原生对象，部分原生对象新增的原型方法，新增的API等（如Proxy、Set等），这些babel是不会转译的。需要用户自行引入polyfill来解决。**

#### polyfill
polyfill其实就是对core-js和regenerator runtime进行了包装，为es2015+提供了一个环境垫片，让你可以使用新标准引入的各种新特性
#### polyfill的使用方法
```
// 首先安装包文件
npm install babel-polyfill --save-dev
// 在文件的入口处引入
import 'babel-polyfill'
// 在webpack.config.js中
module.exports = {
    entry:["babel-polyfill","./app/js"]
}
```
这里的方法会将全部的环境都导入，但是polyfill的文件比较大，即便是压缩后也可能达到80kb，在移动端我们是不希望引入这么大的辅助文件（比vue大得多），所以我们希望实现按需引入，如果我们明确知道自己需要转译哪些API，我们可以借助于[core-js](https://github.com/zloirock/core-js#basic)实现按需引入。

#### [core-js](https://github.com/zloirock/core-js#basic)的使用
1、类似于polyfill，将所有的特性添加到全局环境，默认方式
```
require('core-js') // 引用到全局中，这种方式将所有特性引入
```
2、库的形式引入，这种也是引入所有的特性，只是不会污染全局变量
```
let core = require('core-js/library')
```
3、只引入shim，只包含标准特性，其实和polyfill一样
```
require('core-js/shim')
```

#### [core-js](https://github.com/zloirock/core-js#basic)按需引入的使用方法
```
// 全局引入
require('core-js/es6/promise')
require('core-js/fn/object/assign')
```
```
// 库的形式引入
import Promise from  'core-js/es6/promise'
import assign from  'core-js/fn/object/assign'
Object.assign = assign
```

#### polyfill与runtime的区别
最主要的区别就是polyfill引入后，会将新的原生对象、API这些都直接引入到全局环境，这样就会污染全局变量，这也是polyfill的缺陷。所以就轮到babel-runtime上场了。

#### transform-runtime和babel-runtime
transform-runtime是将js中使用到新的原生对象和静态方法转译成对babel-runtime的引用，而其中babel-runtime的功能其实最终也是由core-js来实现的，其实真正的核心是上面所讲的core-js，其他的都是包装。

### 总结
babel的使用其实不难，只需要理解各个依赖关系就可以了，明白各个包以及插件分别用来干嘛就可以啦。

