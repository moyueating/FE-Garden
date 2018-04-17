##### performanced的作用

　Web Performance 接口允许网页中的 JavaScript 代码可以通过具体的函数（由 window 对象的 performance 属性提供）测量当前网页页面或者 web应用的性能。它能提供高精度的时间戳，可以更加精准的计算脚本运行的时间。

##### 浏览器兼容性

　pc和移动端的主流浏览器都支持。

##### API

###### 1、performance.timing(页面整体的时间参数)

　performance对象的timing属性指向一个对象，它包含了各种与浏览器性能有关的时间数据，提供浏览器处理网页各个阶段的耗时。我们在chrome中输入performance.timing就可以看到下面的数据：

![控制台输出的performance.timing](http://upload-images.jianshu.io/upload_images/2593925-54d0c6f966751b0f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

　performance.timing的所有属性都是只读属性：
    
    navigationStart：是一个无符号long long 型的毫秒数，表征了从同一个浏览器上下文的上一个文档卸载(unload)结束时的UNIX时间戳。如果没有上一个文档，这个值会和PerformanceTiming.fetchStart相同。
    unloadEventStart：是一个无符号long long 型的毫秒数，表征了unload事件抛出时的UNIX时间戳。如果没有前一个网页，或者之前的网页跳转重定向不是在同一个域名内, 这个值会返回0.
    unloadEventEnd：是一个无符号long long 型的毫秒数，表征了unload事件处理完成时的UNIX时间戳。如果没有前一个网页，或者之前的网页跳转不是在同一个域名内， 这个值会返回0.
    redirectStart：是一个无符号long long 型的毫秒数，表征了第一个HTTP重定向开始时的UNIX时间戳。如果没有重定向，或者重定向中的一个不同源，这个值会返回0.
    redirectEnd：是一个无符号long long 型的毫秒数，表征了最后一个HTTP重定向完成时（也就是说是HTTP响应的最后一个bite直接被收到的时间）的UNIX时间戳。如果没有重定向，或者重定向中的一个不同源，这个值会返回0.
    fetchStart：是一个无符号long long 型的毫秒数，表征了浏览器准备好使用HTTP请求来获取(fetch)文档的UNIX时间戳。这个时间点会在检查任何应用缓存之前。
    domainLookupStart：是一个无符号long long 型的毫秒数，表征了域名查询开始的UNIX时间戳。如果使用了持续连接(persistent connection)，或者这个信息存储到了缓存或者本地资源上，这个值将和 PerformanceTiming.fetchStart一致。
    domainLookupEnd：是一个无符号long long 型的毫秒数，表征了域名查询结束的UNIX时间戳。如果使用了持续连接(persistent connection)，或者这个信息存储到了缓存或者本地资源上，这个值将和 PerformanceTiming.fetchStart一致。
    connectStart：返回HTTP请求开始向服务器发送时的Unix毫秒时间戳。如果使用持久连接（persistent connection），则返回值等同于fetchStart属性的值。
    (secureConnectionStart)：可选特性。用户代理如果没有对应的东东，就要把这个设置为undefined。如果有这个东东，并且是HTTPS协议，那么就要返回开始SSL握手的那个时间。 如果不是HTTPS， 那么就返回0
    connectEnd：返回浏览器与服务器之间的连接建立时的Unix毫秒时间戳。如果建立的是持久连接，则返回值等同于fetchStart属性的值。连接建立指的是所有握手和认证过程全部结束。
    secureConnectionStart：返回浏览器与服务器开始安全链接的握手时的Unix毫秒时间戳。如果当前网页不要求安全连接，则返回0。
    requestStart：返回浏览器向服务器发出HTTP请求时（或开始读取本地缓存时）的Unix毫秒时间戳。
    responseStart：返回浏览器从服务器收到（或从本地缓存读取）第一个字节时的Unix毫秒时间戳。
    responseEnd：返回用户代理接收到最后一个字符的Unix毫秒时间戳，和当前连接被关闭的时间中，更早的那个。同样，文档可能来自服务器、缓存、或本地资源。
    domLoading：返回当前网页DOM结构开始解析时（即Document.readyState属性变为“loading”、相应的readystatechange事件触发时）的Unix毫秒时间戳。
    domInteractive：返回当前网页DOM结构结束解析、开始加载内嵌资源时（即Document.readyState属性变为“interactive”、相应的readystatechange事件触发时）的Unix毫秒时间戳。
    domContentLoadedEventStart：返回当前网页DOMContentLoaded事件发生时（即DOM结构解析完毕、所有脚本开始运行时）的Unix毫秒时间戳。
    domContentLoadedEventEnd：返回当前网页所有需要执行的脚本执行完成时的Unix毫秒时间戳。
    domComplete：返回当前网页DOM结构生成时（即Document.readyState属性变为“complete”，以及相应的readystatechange事件发生时）的Unix毫秒时间戳。
    loadEventStart：返回当前网页load事件的回调函数开始时的Unix毫秒时间戳。如果该事件还没有发生，返回0。
    loadEventEnd：返回当前网页load事件的回调函数运行结束时的Unix毫秒时间戳。如果该事件还没有发生，返回0。
　根据上面这些属性，可以计算出网页加载各个阶段的耗时，对我们比较有用的页面性能数据大概包括如下几个：

    DNS查询耗时 ：domainLookupEnd - domainLookupStart
    TCP链接耗时 ：connectEnd - connectStart
    request请求耗时 ：responseEnd - responseStart
    解析dom树耗时 ： domComplete - domInteractive
    白屏时间 ：responseStart - navigationStart
    domready时间 ：domContentLoadedEventEnd - navigationStart
    onload时间 ：loadEventEnd - navigationStart

###### 2、performance.getEntries()
　在chrome中输入performance.getEntries()可以得到静态资源的数组列表：

![performance.getEntries()得到的资源文件加载数据列表](http://upload-images.jianshu.io/upload_images/2593925-18bd74f917656ca2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

　这个接口是获取所有资源文件的方法，该API还提供了另外两个接口：

    performance.getEntriesByName(name) 根据资源的name获取相应的数据（如上图中的name）
    performance.getEntriesByType(entryType) 根据资源的name获取相应的数据（如上图中的entryType）

###### 3、performance.navigation

　在chrome中输入performance.navigation：
![performance.navigation](http://upload-images.jianshu.io/upload_images/2593925-76182f9f4d569ddf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

　这个对象有两个属性：
　　**performance.navigation.type**（该属性返回一个整数值，表示网页的加载来源，可能有以下4种情况）：
　　0：网页通过点击链接、地址栏输入、表单提交、脚本操作等方式加载，相当于常数performance.navigation.TYPE_NAVIGATE。
　　1：网页通过“重新加载”按钮或者location.reload()方法加载，相当于常数performance.navigation.TYPE_RELOAD。
　　2：网页通过“前进”或“后退”按钮加载，相当于常数performance.navigation.TYPE_BACK_FORWARD。
　　255：任何其他来源的加载，相当于常数performance.navigation.TYPE_RESERVED。
　**performance.navigation.redirectCount**：表示网页经过重定向的次数。

###### 4、performance.memory
　![performance.memory](http://upload-images.jianshu.io/upload_images/2593925-c464859ee7e5c8bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

     memory: {
        usedJSHeapSize:  16100000, // JS 对象（包括V8引擎内部对象）占用的内存，一定小于 totalJSHeapSize，否则可能出现内存泄漏
        totalJSHeapSize: 35100000, // 可使用的内存
        jsHeapSizeLimit: 793000000 // 内存大小限制
    },
###### ５、performance.now()
　performance.now方法返回当前网页自从performance.timing.navigationStart到当前时间之间的微秒数。
###### ６、performance.mark()
　mark方法用于为相应的视点做标记。对应的方法有 performance.clearMarks()。


**相关资料**
**1  [https://developer.mozilla.org/zh-CN/docs/Web/API/Performance](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)**
**2  [http://javascript.ruanyifeng.com/bom/performance.html#toc5](http://javascript.ruanyifeng.com/bom/performance.html#toc5)**














　