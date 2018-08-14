>记一次webfont需求优化

```
  1、浏览器请求 HTML 文档。
  2、浏览器开始解析 HTML 响应和构建 DOM。
  3、浏览器发现 CSS、JS 以及其他资源并分派请求。
  4、浏览器在收到所有 CSS 内容后构建 CSSOM，然后将其与 DOM 树合并以构建渲染树。
  5、在渲染树指示需要哪些字体变体在网页上渲染指定文本后，将分派字体请求。
  6、浏览器执行布局并将内容绘制到屏幕上。
  7、如果字体尚不可用，浏览器可能不会渲染任何文本像素。
  8、字体可用之后，浏览器将绘制文本像素。
```

通常一个字体文件的大小都在2-3M左右，所以前端在做需求的时候，如果遇到特殊字体的需求一般会让设计师将这些字体切图，然后使用图片形式加载，但是这种情况适用于文字固定，字体少量的情况下。现在你们看一下下面的需求，这样就没法使用了。

![效果](https://raw.githubusercontent.com/moyueating/blogImg/master/webfont/webfont.gif)

这么多数量的字体包同时在一个页面上，优化就是必须的。期间试了多种方法，看了很多文档，但是基本的套路是不会改变的。

### 字体包体积
一开始也准备使用[字蛛](http://font-spider.org/)，但是字蛛是通过将你没有使用的字符删除来减少包的大小，在这个项目里面我们并不能知道用户输入的标题有哪些，也就没办法了，这个方法pass。而且相比较字蛛，个人认为[fontmin](http://ecomfe.github.io/fontmin/)更加好用。这样的情况下字体包体积方面只能进行gzip压缩了。

### 兼容性
IE的问题无法避免，不过只用兼容到IE9，目前主流的字体格式有ttf,otf,woff,woff2,eot等。  
其中.eot是IE专用字体,所以当时就想直接使用两套格式，.eot和.ttf。

```css
@font-face{
  font-family: My Font;
  src: url('./font/font.eot') format('embedded-opentype'),url('./font/font.ttf') format('truetype');
}
```
但是上面的代码却还带来了另外一种错误。代号为CSS3114，@font-face未能完成OpenType嵌入权限检查，大概就是IE对web字体的嵌入需要资格字体的权限，但是设计师网上下载的时候是看不出来的。有点类似文件只读只写的属性，[这篇文章有介绍](https://www.devexpress.com/Support/Center/Question/Details/T543636/the-css3114-font-face-failed-opentype-embedding-permission-check-permission-must-be)。那我一个前端怎么会知道这么多，后来找到一个工具可以提供权限控制并转化格式[fontConverter](https://onlinefontconverter.com/)。还有一个好多人推荐的[font squirrel](http://www.fontsquirrel.com/tools/webfont-generator)。我选择了前者，后者未试用。

如果转化字体格式出错的话，你还有可能得到CSS3111。遇到这个错误请首先检查字体包是否异常。

但是后来觉得这样加载两种格式资源就更大了，后来看了.woff和.woff2，简直好用啊，因为.woff刚好是IE9+，而且.woff自带压缩，相对的体积要比.tff格式小，。.woff2的字体压缩率比.woff更优秀，但是IE11+，所以只好放弃，使用.woff.

```css
@font-face{
  font-family: My Font;
  src: url('./font/font.woff') format('woff');
}
```

这样兼容性问题就解决了。

### 资源加载
这么多字体包，再怎么压缩也肯定很大，所以一定要考虑资源加载的问题。参阅了网上很多资料，结合自己的项目最终还是采用以下方式：

  1、首先将字体包上传至CDN服务器上。
  2、在需要字体的前一个页面利用link rel="preload"进行内容预加载。
  3、进入当前页后利用浏览器的缓存，达到快速加载渲染的效果。

```js
function preLoad(href){
  const preloadLink = document.createElement("link");
  preloadLink.href = href;
  preloadLink.rel = "preload";
  preloadLink.as = "font";
  preloadLink.type = "font/woff";
  preloadLink.crossorigin = "anonymous"
  document.head.appendChild(preloadLink);
}
```


相关资料  
[Web 性能优化（6）——WebFont 字体优化](https://blog.nfz.moe/archives/wpo-web-font-performance.html)  
[Web Font 123 - 再谈 WebFont 优化](https://blog.nfz.moe/archives/webfont-123.html)  
[字体加载策略大全](https://www.w3cplus.com/css/comprehensive-webfonts.html)  
[了解woff2字体及转换](https://www.zhangxinxu.com/wordpress/2018/07/known-woff2-mime-convert/)  
