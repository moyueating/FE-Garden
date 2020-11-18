### webpack loader
处理源码的工具函数

```js
// 啥都没干的loader
function someLoader(source){
    return source
}
```

```js
// 粗糙的sassLoader
function sassLoader(source){
    return require('node-sass').renderSync({
        data: source
    })
}
```

```js
// 粗糙的styleLoader
function styleLoader(source){
    const style = `
        var style = document.createElement('style');
        style.innerHTML = `${source}`;
        document.head.appendChild(style);
    `
    return style;
}
```

### 同步loader
```js
module.exports = function syncLoader(content){
    return someSyncOperation(content)
}
```

### 异步loader
```js
module.exports = function asyncLoader(content, map, meta){
    const callback = this.async();
    someAsyncOperation(content, function(err, result){
        if(err) return callback(err)
        callback(null, result, map, meta)
    })
}
```

### 二进制loader

```js
module.exports = function(content) {
  assert(content instanceof Buffer);
  return someSyncOperation(content);
  // return value can be a `Buffer` too
  // This is also allowed if loader is not "raw"
};
module.exports.raw = true;

```


### pitch loader
![pitch-loader](https://raw.githubusercontent.com/moyueating/FE-Garden/master/static/pitch-loader.png)


### 工具库
loader-utils和schema-utils