###  **一、背景**
　用户点击浏览器工具栏中的后退按钮，或者移动设备上的返回键时，或者JS执行history.go(-1);时，浏览器会在当前窗口“打开”历史纪录中的前一个页面。不同的浏览器在“打开”前一个页面的表现上并不统一，这和浏览器的实现以及页面本身的设置都有关系。
　在移动端HTML5浏览器和webview中，“后退到前一个页面”意味着：前一个页面的html/js/css等静态资源的请求（甚至是ajax动态接口请求）根本不会重新发送，直接使用缓存的响应，而不管这些静态资源响应的缓存策略是否被设置了禁用状态。（这点我在自己的项目中也确实得到了验证，按回退按钮的时候抓包并没有抓到任何请求）。
　在我自己项目中因为涉及到存取cookie的原因，由于返回不刷新而导致一系列的bug，所以需要‘回退刷新’的需求。
　“回退刷新”的目标是浏览器在后退返回到前一个页面时，能从server端请求到一个全新的的页面内容（即status code 200 ok或status code 304 not modified的页面响应，而不是status 200 from cache根本不向server端请求）进行加载展示并重新执行JS代码。

###  **二、解决方案**
#### **浏览器历史纪录和HTTP 缓存**
　PC浏览器实现后退刷新的方法是给响应添加Cache-Control的header，如果server返回页面响应的headers中包含如下内容：

    Cache-Control: no-cache,no-store,must-revalidate
    Expires: Thu, 01 Jan 1970 00:00:00 GMT
    Pragma: no-cache
　浏览器在前进后退到该页面时，就会重新发送请求。
　我们自己控制的话需要在头部加相关的meta标签

    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" /> //设置页面过期时间
    <meta http-equiv="pragma" content="no-cache" /> //
　或者设置响应头

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
　相比较而言，在header中设置比设置meta标签更为靠谱一些，但是也存在两者都没效果的情况。
　这样看上去，浏览器历史纪录和HTTP缓存是有关系的。事实上不是这样的，参考
　[You Do Not Understand Browser History](http://madhatted.com/2013/6/16/you-do-not-understand-browser-history)，里面的结论是：
　The browser does not respect HTTP caching rules when you click the back button.(当你点击返回按钮的时候浏览器不会遵循http缓存机制)
　看来浏览器也是很任性的...
#### **bfcache和page cache**
　bfcache和page cache是webkit和firefox有一项优化技术。可参考：
　１、Using_Firefox_1.5_caching
　2、WebKit Page Cache I – The Basics 和 WebKit Page Cache II – The unload Event
　这里简单介绍一下：
　对于支持bfcache/page cache的浏览器，“后退”不光意味着html/js/css/接口等动静态资源不会重新请求，连JS也不会重新执行。因为前一个页面没有被unload，最后离开时的状态和数据被完整地保留在内存中，发生后退时浏览器直接把“离开时”的页面状态展示给用户。
　就好像，你在页面A，点击链接要在当前窗口打开页面B，这时浏览器在不卸载页面A的情况下去加载页面B。这时你看到的是页面B，那页面A呢？ 页面A只是被隐藏了，JS暂停执行（我们称之为pagehide）。如果用户点击“返回”，浏览器快速把页面B隐藏，并把页面A再显示出来，JS恢复执行（我们称之为页面B pagehide, 页面A pageshow）。
　pageshow事件在页面全新加载并展现时也会触发，与从bfcache/page cache中加载并展示的区分依据是pageshow event的persisted属性。如果从缓存获取那么persisted的值就为true。
　实际观察中发现，一些移动端浏览器的pageshow event的persisted属性值一直是false，尽管页面看上去确实是从bfcache/page cache中加载展示。（另外一个理论上的point，页面绑定了unload事件时，不再会进入bfcache/page cache，一些移动端浏览器上观察来看实际上也不是这样的）。
　可行的方案是：JS监听pagehide/pageshow来阻止页面进入bfcache/page cache，或者监测到页面从bfcache/page cache中加载展现时进行刷新。参考：
[Forcing mobile Safari to re-evaluate the cached page when user presses back button](http://stackoverflow.com/questions/24524248/forcing-mobile-safari-to-re-evaluate-the-cached-page-when-user-presses-back-butt/24524249#24524249)。
　示例代码：

    window.onpageshow = function(event) {
        if (event.persisted) {
            window.location.reload()
        }
    };

#### **安卓webview cache的问题**
安卓webview，包括安卓微信里面内嵌的QQ X5内核浏览器，都存在后退不会重新请求页面的问题，无论页面是否禁用缓存。上面的pageshow/pagehide方案也都失效。可行的方法，如下：
　1. 给每个需要后退刷新的页面上加一个hidden input，存储页面在服务端的生成时间，作为页面的服务端版本号。
　2. 并附加一段JS读取读取页面的版本号，同时也记录在浏览器/webview本地（cookie/localStorage/sessionStorage）进行存储，作为本地版本号。
　3. JS检查页面的服务端版本号和本地存储中的版本号，如果服务端版本号大于本地存储中版本号，说明页面是从服务端重新生成的；否则页面就是本地缓存的，即发生了后退行为。
　4. JS在监测到后退时，强制页面重新从服务端获取。
　该方案的前提是浏览器在向server请求页面时，每次都用jsp重新生成html。需要页面本身有禁用缓存的配置。
　方案的代码示例如下：

    <!-- 安卓webview 后退强制刷新解决方案 START -->
    <jsp:useBean id="now" class="java.util.Date" />
    <input type="hidden" id="SERVER_TIME" value="${now.getTime()}"/>
    <script>
    //每次webview重新打开H5首页，就把server time记录本地存储
    var SERVER_TIME = document.getElementById("SERVER_TIME");
    var REMOTE_VER = SERVER_TIME && SERVER_TIME.value;
    if(REMOTE_VER){
        var LOCAL_VER = sessionStorage && sessionStorage.PAGEVERSION;
        if(LOCAL_VER && parseInt(LOCAL_VER) >= parseInt(REMOTE_VER)){
            //说明html是从本地缓存中读取的
            location.reload(true);
        }else{
            //说明html是从server端重新生成的，更新LOCAL_VER
            sessionStorage.PAGEVERSION = REMOTE_VER;
        }
    }
    </script>
    <!-- 安卓webview 后退强制刷新解决方案 END -->

###  **三、总结**
　1. PC浏览器，设置禁用页面缓存header即可实现后退刷新
　2. 支持bfcache/page cache的移动端浏览器，JS监听pageshow/pagehide，在检测到后退时强制刷新
　3. 在前2个方案都不work的情况下，可以在HTML中写入服务端页面生成版本号，与本地存储中的版本号对比判断是否发生了后退并使用缓存中的页面