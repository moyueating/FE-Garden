
# 预加载关键性资源来提高页面加载速度

当浏览器从服务器请求得到html后，浏览器便开始解析页面内容，作为开发人员，我们明确知道页面加载所需的资源以及哪些资源是页面的关键性资源，对于这些关键性资源我们可以提前加载来加快页面的加载过程。也就是所说的 ```<link rel="preload" />```

## 用法（js脚本为例

```html
<head>
 <link rel="preload" href="main.js" as="script" />
</head>

<body>
 <script src="main.js"></script>
</body>
```

## 优势

- 提升页面关键资源的下载优先级（在已经支持预解析的浏览器中，忽略网络请求的并发数限制，提升并不明显）
- js下载和执行分离可控

## 使用注意点

- **必须使用as标识其资源类型，如果确实，chrome79会忽略该标签**
- **跨域问题，字体包必须加跨域属性，否者会出现资源重复加载的问题**
- **支持响应式预加载**

```html
  <link rel="preload" href="bg-image-narrow.png" as="image" media="(max-width: 600px)">
  <link rel="preload" href="bg-image-wide.png" as="image" media="(min-width: 601px)">
```

### 参考资源

[Web 性能优化：Preload与Prefetch的使用及在 Chrome 中的优先级](https://blog.fundebug.com/2019/04/11/understand-preload-and-prefetch/)
[通过preload进行内容预加载](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Preloading_content)
[chrome资源加载优先级](https://docs.google.com/document/d/1bCDuq9H1ih9iNjgzyAL0gpwNFiEP4TZS-YLRp_RuMlc/edit#heading=h.ua1godj1atee)
[浏览器的工作原理：新式网络浏览器幕后揭秘(介绍了预解析)](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/)
[webpack插件](https://github.com/GoogleChromeLabs/preload-webpack-plugin)