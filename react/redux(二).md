上篇文章讲了Redux的基础概念，这里就讲讲Redux的高级东西，其实就是加了一个异步。Redux不像Vuex是直接服务于Vue这个框架，所以Vuex里面封装的很好，mutation，action啥都有了（Vuex的mutation是redux的同步action，Vuex的action是redux的异步action）。但是Redux其实是一个独立的不受框架限制的库，所以设计的时候可扩展性更加高一点。所以Redux的异步action需要第三方库就是所谓的中间件来完成，所以想理解异步action，我们就先了解一下Redux中间件的原理。

### 什么是中间件
最早接触中间件这个概念是从express，然后是koa，其实中间件就是插件模式。拦截原先的代码执行过程，reudx中的中间件就是让原来action ==> reducer变成action ==> middleware ==> reducer。这也就是使同步action变异步action的最终奥义。

### 如何使用中间件
这里还是以logger为例子，由于这篇文章主要剖析Redux执行中间件的过程，如有小伙伴想知道中间件怎么写的请异步官网[如何一步步写一个redux中间件](http://www.redux.org.cn/docs/advanced/Middleware.html)，这里简单点直接一笔带过。
```
// 中间件的基本原理写法
function logger(store){
  return function(next){
    return function(action){
      console.log('preState', store.getState())
      next(action)
      console.log('nextState', store.getState())
    }
  }
}
```
```
// Redux中使用中间件
import { applyMiddleware, createStore, combineReducers } from 'redux'
let rootReducer = combineReducers({
  todoApp,
  visibility_filter
})
let initialState = {}
let store = createStore({
  rootReducer,
  initialState,
  // 这里来使用中间件，applyMiddleware是redux提供的唯一一个store增强器的api
  applyMiddleware(logger, some_other_middleware) 
})
```
### applyMiddleware
下面就是敲黑板时间，啪啪啪。先看下applyMiddleware的源码:
```
function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```
1、applyMiddleware()执行完成后返回了一个闭包函数，目的是将创建 store的步骤放在这个闭包内执行，这样 middleware 就可以共享 store 对象。我看到这里有个疑惑，不是说只有一个唯一store的么，我们上面开始初始化的时候let store = createStore()就创建了一个store了，难道自己打自己脸了？这里我们先留个疑问在这里，下面来讲。

2、map middlewares后得到新的数组chain

3、通过compose后得到改造后的dispatch方法

4、最后返回新的store

这里来解决一下上面的疑惑，我们就看一下createStore的源码，我们主要看一下下面这段代码
```
function createStore(reducer, preloadedState, enhancer) {
    ....
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }
  ...
}
```
如果我们传入enhancer这个增强器函数，整个createStore就会返回，直接进入enhancer函数的逻辑。所以在初始化得到的store并不是初始化createStore里面的返回的原始store，而是在那个闭包函数里面调用的createStore创建的store（只不过这个store里面的dispatch的方法是经过改造后的）。
下面贴一下两个createStore实际调用的参数
```
//   初始化的时候createStore有三个参数
createStore(reducer, initialState, enhancer)
```
```
//   闭包函数里面createStore实际只有两个参数，少了一个增强器函数，官方里面用...args这个方式表示了
function applyMiddleware(...middlewares) {
  return createStore => (reducer, initialState) => {
    // 注意下面这里createStore，这里得到的store就是初始化里面拿到的store，还是唯一一个
    const store = createStore(reducer, initialState)
    ....
  }
}
```
第二步里面的map方法第一次调用了中间件，所以chain数组里面的每一项应该是下面这样的
```
function(next){
    return function(action){
        next(action)
     }
}
```
第三步里面又有一个重点方法**compose**。
```
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }
  if (funcs.length === 1) {
    return funcs[0]
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
WTF，这么简单么，但是我真的看了很久，实在是愚钝....只好一步一步写下来。下面就全部以代码形式写了
```
// 我们知道经过第二步后，chain数组里面的函数形式了，那我们这里就模拟三个，相当于chain=[A, B, C]
function A(next) {
    return function dispatchA(action) {
        let result = next(action)
        return result
    }
}
function B(next) {
    return function dispatchB(action) {
        let result = next(action)
        return result
    }
}
function C(next) {
    return function dispatchC(action) {
        let result = next(action)
        return result
    }
}
// 这里我们执行chain.reduce((a, b) => (...args) => a(b(...args)))，箭头函数写的方便，读起来真的不习惯，改造一下
let result = [A,B,C].reduce(function(initial, current){
    return function(...args) {
        return initial(current(...args))
    }
})
// 清晰一点了。这里调用reduce没有初始化值，所以数组第一个当做默认值，所以最后result也就是经过compose后得到的结果是下面这样的，
result = function(...args){
    return A(B(C(...args)))
}
// 接下来继续往下
dispatch = compose(...chain)(store.dispatch) 就变成了dispatch = result(store.dispatch) = A(B(C(store.dispatch)))
// A(B(C(store.dispatch)))这个函数怎么执行，真的惨...先分析，一层一层往里去执行
// A(next) next指向函数B，那就找B，找到了执行B(next)，
// 额，next又指向函数C，继续找，找到了执行C(next)，
// 这次next指向的是store.dispatch，那就执行，返回了函数dispatchC
// 好的，终于返回值了，那么B(next)中next指向dispatchC，执行返回了dispatchB
// 继续，A(next)中的next就是指向dispatchB，执行并返回得到dispatchA
// 所以，最后newDispatch = dispatchA
// 我们真正调用dispatch(action)的时候就是调用newDispatch(action)
// 第一步
function dispatchA(action){
    let result = next(action) // next闭包指向dispatchB
    return result
}
// 第二步
function dispatchB(action){
    let result = next(action) // next闭包指向dispatchC
    return result
}
// 第三步
function dispatchC(action){
    let result = next(action)// next闭包指向原始的store.dispatch，store.dispatch 会执行 reducer 生成最新的 store 数据
    return result
}
// 第四步，执行dispatchC中next后的代码
// 第五步，执行dispatchB中next后的代码
// 第六步，执行dispatchA中next后的代码
嗯，所以整个执行 action 的过程为 A -> B -> C -> dispatch -> C -> B -> A，标准的洋葱模型。
```
好吧，大概讲完了，有错希望大家及时指出，共同学习😝

