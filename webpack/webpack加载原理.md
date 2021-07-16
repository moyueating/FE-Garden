### webpack加载原理

## 加载同步资源
```js
(function(modules){
    // 缓存加载过的模块资源
    var installedModules = {};

    // webpack实现的加载资源方法
    function __webpack_require__(moduleId) {
        // 缓存命中
        if(installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        // 创建并缓存
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        // 执行模块函数
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        // 标记模块已经被加载
        module.l = true;
        return module.exports;
 	}

    // 加载入口文件并返回该模块
	return __webpack_require__("./index.js");

}({
    './index.js': function(module, __webpack_exports__, __webpack_require__){eval('your js code')}
})
```


## 加载异步资源

```js
// 入口文件
(function(modules) { // webpackBootstrap
 	// install a JSONP callback for chunk loading
 	function webpackJsonpCallback(data) {
 		var chunkIds = data[0];
 		var moreModules = data[1];

 		// add "moreModules" to the modules object,
 		// then flag all "chunkIds" as loaded and fire callback
 		var moduleId, chunkId, i = 0, resolves = [];
 		for(;i < chunkIds.length; i++) {
 			chunkId = chunkIds[i];
 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
 				resolves.push(installedChunks[chunkId][0]);
 			}
 			installedChunks[chunkId] = 0;
 		}
 		for(moduleId in moreModules) {
 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
 				modules[moduleId] = moreModules[moduleId];
 			}
 		}
 		if(parentJsonpFunction) parentJsonpFunction(data);

 		while(resolves.length) {
 			resolves.shift()();
 		}

 	};


 	// The module cache
 	var installedModules = {};

 	// object to store loaded and loading chunks
 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
 	// Promise = chunk loading, 0 = chunk loaded
 	var installedChunks = {
 		"main": 0
 	};

 	// script path function
 	function jsonpScriptSrc(chunkId) {
 		return __webpack_require__.p + "" + chunkId + ".async.js"
 	}

 	// The require function
 	function __webpack_require__(moduleId) {
 		// Check if module is in cache
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		// Create a new module (and put it into the cache)
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};
 		// Execute the module function
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		// Flag the module as loaded
 		module.l = true;

 		// Return the exports of the module
 		return module.exports;
 	}

 	// This file contains only the entry chunk.
 	// The chunk loading function for additional chunks
 	__webpack_require__.e = function requireEnsure(chunkId) {
 		var promises = [];
 		// JSONP chunk loading for javascript
 		var installedChunkData = installedChunks[chunkId];
 		if(installedChunkData !== 0) { // 0 means "already installed".
 			// a Promise means "currently loading".
 			if(installedChunkData) {
 				promises.push(installedChunkData[2]);
 			} else {
 				// setup Promise in chunk cache
 				var promise = new Promise(function(resolve, reject) {
 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
 				});
 				promises.push(installedChunkData[2] = promise);

 				// start chunk loading
 				var script = document.createElement('script');
 				var onScriptComplete;

 				script.charset = 'utf-8';
 				script.timeout = 120;
 				if (__webpack_require__.nc) {
 					script.setAttribute("nonce", __webpack_require__.nc);
 				}
 				script.src = jsonpScriptSrc(chunkId);

 				// create error before stack unwound to get useful stacktrace later
 				var error = new Error();
 				onScriptComplete = function (event) {
 					// avoid mem leaks in IE.
 					script.onerror = script.onload = null;
 					clearTimeout(timeout);
 					var chunk = installedChunks[chunkId];
 					if(chunk !== 0) {
 						if(chunk) {
 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
 							var realSrc = event && event.target && event.target.src;
 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
 							error.name = 'ChunkLoadError';
 							error.type = errorType;
 							error.request = realSrc;
 							chunk[1](error);
 						}
 						installedChunks[chunkId] = undefined;
 					}
 				};
 				var timeout = setTimeout(function(){
 					onScriptComplete({ type: 'timeout', target: script });
 				}, 120000);
 				script.onerror = script.onload = onScriptComplete;
 				document.head.appendChild(script);
 			}
 		}
 		return Promise.all(promises);
 	};

 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
 	jsonpArray.push = webpackJsonpCallback;
 	jsonpArray = jsonpArray.slice();
    // 这一步，其实要知道他的场景，才知道他的意义，如果光看代码，觉得这个数组刚声明，遍历有什么用；
    // 其实这里是在依赖的chunk 先加载完的情况，但拦截代理当时还没生效；所以手动遍历一次，让已加载的模块再走一次代理操作；
 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
 	var parentJsonpFunction = oldJsonpFunction;

 	return __webpack_require__(__webpack_require__.s = "./index.js");
 })({
 "./index.js": (function(module, exports, __webpack_require__) {eval("function test() {\n  __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./async.js */ \"./async.js\")).then(function (res) {\n    return console.log(res.a());\n  });\n}\n\ntest();\n\n//# sourceURL=webpack:///./index.js?");})
});
```

```js
// async.js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{
 "./a.js":(function(module, __webpack_exports__, __webpack_require__) {"use strict";eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return a; });\nvar a = function a() {\n  return 'aaaa';\n};\n\n//# sourceURL=webpack:///./a.js?");
})}]);
```

关键点是__webpack_require__.e方法用于动态加载对应的异步资源，同时返回对应的installedChunks中保存该chunk的promise。由于async.js本身是方法执行，js被append到页面后就执行 ```window["webpackJsonp"].push``` 方法，这里就指向了```webpackJsonpCallback```这个方法。最关键的逻辑就是最后的resolves.shift()()将之前chunk中保存的promise正常resolve触发加载async.js的逻辑。


### 优化
本身webpack加载异步资源是靠场景触发，假设一个点击事件中我们需要加载一个异步的chunk但是该chunk体积较大，会导致用户在交互场景中出现等待的过程，如果时间过程甚至会让用户以为是bug。这种场景下我们可以拦截对应的push方法获取异步资源并在合适的时机提前加载。**拦截的关键点就是需要利用require.ensure或者import加载一个异步的文件甚至可以是空文件来触发一次window.webpackJsonp.push获取到所有的异步资源**



```js
const chunkdirs = [];
const push =  window["webpackJsonp"].push;
// data = [[chunkid], {'./path.js': function(){}}]
// 这里是为了获取所有异步的资源
window.webpackJsonp.push = (data) => {
    push(data);
    chunkdirs.push(data[1])
}

const requireChunk = () => {
    for(let i = 0; i< chunkdirs.length; i++){
        const cur = chunkdirs[i]
        for(let path of cur){
            if(cur.hasOwnProperty(path)){
                __webpack_require__(path)
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', requireChunk)

```