# vscode中调试webpack插件

```js
// .vscode
{
    "type": "node",
    "request": "launch",
    "name": "DebugPlugin",
    "program": "${workspaceFolder}/node_modules/webpack/bin/webpack.js",
    "args": ["--config", "./webpack.config.js"],
    "env": {
        "NODE_ENV": "development"
    }
}
```
或者
```js
// package.json
 {
  ...,
  scripts: {
    "debugPlugin": "node --inspect-brk=5858 ./node_modules/.bin/webpack --config ./webpack.config.js",
  },
  ...,
 }
```
```js
// .vscode
{
  "type": "node",
  "request": "launch",
  "name": "DebugPlugin",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "debugPlugin"],
  "port": 5858
}

```

[参考](https://medium.com/@jsilvax/debugging-webpack-with-vs-code-b14694db4f8e)
