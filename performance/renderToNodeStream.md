# renderToNodeStream的实践

ReactDomServer.renderToNodeStream将react组件输出成HTML字符串的可读流，相比ReactDomServer.renderToString可以加快页面加载速度，减少页面的TTFB。

```js
// server.js
const Koa = require('koa');
const Router = require('koa-router');
const ReactDOMServer = require('react-dom/server').default;

const app = new Koa();
const router = new Router();

router.get('/', ctx => {
    ctx.respond = false; // 为了绕过 Koa 的内置 response 处理，具体逻辑可以看koa源码lib/application.js中的respond函数
    ctx.status = 200;
    ctx.res.write('<!DOCTYPE html>');
    const htmlStream = ReactDOMServer.renderToNodeStream(
        <MyAppComponent />
    );
    htmlStream.pipe(
        ctx.res,
        { end: false }
    );
    htmlStream.on('end', () => {
        ctx.res.end();
    });
});

app
  .use(router.routes())
  .use(router.allowedMethods());
```

上面的正常场景下确实没有什么问题，但是少了一个容错机制。假设一下这种场景，接口返回的某个数据出了问题，我们组件内部没有做好相关的兼容，这时候ReactDOMServer.renderToNodeStream中会报错，但是我们在响应的一开始就设置了status `ctx.status = 200`，这样就导致了客户端已经拿到了这个200的响应，然后长时间挂起等待这个响应的结束，但是服务其实已经报错了，这个输出流就一直没法结束，用户面对的就只有白屏。新增错误监听。

```js
router.get('/', ctx => {
    ctx.respond = false;
    const htmlStream = ReactDOMServer.renderToNodeStream(
        <MyAppComponent />
    );
    let isAddDoc = true;
    htmlStream.on('data', () => {
        if(isAddDoc){
            ctx.status = 200;
            ctx.res.write('<!DOCTYPE html>'); // 少了这个不同浏览器会按照自己标准模式处理html文档，可能会影响某些样式
        }
        ctx.res.write(chunk);
        isAddDoc = false;
    })
    htmlStream.on('error', err => {
        console.log(err.stack)
        ctx.status = 404;
        ctx.res.end();
    });
    htmlStream.on('end', () => {
        ctx.res.end();
    });
});
```
