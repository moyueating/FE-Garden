### web worker

[MDN Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker)

- web worker运行的js脚本必须是当前页面域下的

- 不能读取本地文件

```
// main.js
function init(){
  // hack webworker 跨域的问题
  const codeString = await fetch('http://127.0.0.1:9999/webworker.js').then(res =>
    res.text()
  );
  const localWorkerUrl = window.URL.createObjectURL(
    new Blob([codeString], {
      type: 'application/javascript',
    })
  );
  const worker = new Worker(localWorkerUrl);
  worker.postMessage({
    hello: 'hello world',
  });
  worker.onmessage = e => {
    console.log('worker线程传来的信息：', e.data);
  };
}

// webworker.js
self.onmessage = e => {
  console.log('主线程传来的信息：', e.data);
  // do something
};

self.postMessage({
  name: 'I am worker!',
});

```
