搞事情，搞事情，搞事情，又换技术栈了，学过的Vue没鸡儿用了。那就介绍介绍React全家桶中蛋疼的Redux。
Redux我就不多说了，因为以前看过Vuex，以为会上手简单点，嗯....确实简单点，但是还是很难学啊。
Redux的核心概念只有三个：Action，Reducer，Store。

### Action
Action 是把数据从应用传到 store 的有效载荷。说白了就是你要告诉store要有事情发生了，顺带带点东西过去。
```
// action.js
const ADD_TODO = "ADD_TODO"
store.dispatch({
  type: ADD_TODO,
  text: 'this is my first redux app'
})
```
上面代码中的就表明action的本质是一个对象。action 内必须使用一个字符串类型的 type 字段来表示将要执行的动作。就是一定要明确知道是干嘛去的。其他的字段就是按照需要定义携带的载荷，自行定义即可。
但是官方还是建议我们不要传递过大的数据量，尽量保持action的简洁。

#### Action创建函数
就是把上面的对象通过函数返回，复用代码。
```
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}
store.dispatch(addTodo("this is my first redux app"))
```
这里基本上是Action的主要东西。是不是很简单！？但是实际使用中我们很少直接去dispatch一个Action，多数情况下你会使用 [react-redux](http://github.com/gaearon/react-redux) 提供的 `connect()` 帮助器来调用。这个这里暂时不展开，后面会说。同时这里讲的Action是同步的Action，异步的Action会在后面讲解。


### Reducer
上面说了，Action是告诉store要有事情发生了，但是还没发生，具体的事情发生过程，也就是reducer操作改变state的过程。
Reducer是一个函数，并且是一个**纯函数**，接收两个参数：旧的state和Action，返回新的state。听起来也很简单。但是写reducer的时候有几个注意点：
* 不要修改传入参数
* 不要执行有副作用的操作，如 API 请求和路由跳转
* 不要调用非纯函数，如 Date.now() 或 Math.random()
因为上面这些操作会导致一些不可控制的状态。
**纯函数就是：只要传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。**
```
// reducer.js
// 这里就还是以官方的todolist为例子，这里故意采用不简化的方式写，后面优化，一步步来
// redux 会在初始的时候调用一次 reducer （这时参数 state 为 undefined）， 可以借用这个机会返回应用初始状态数据，或者直接用es6的写法
const initialState = {
    todos: []
}
const todoApp = (state, action) => {
  if(typeof state === 'undefined'){
      state = initialState
  }
  ...
}
const todoApp = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return Object.assign({}, state, {
                todos: [
                    ...state.todos,
                    {
                        id: action.id,
                        text: action.text,
                        completed: false
                    }
                ]
            })
        default: 
            return state
    }
}
//这里完成后的reducer最终是以以下的方式存在顶层的Store中
<顶层的唯一>store = {
    ...
    todoApp: {
        todos: []
    }
    ...
}
```
但是这里只有一个Action代码已经看起来不是很顺眼了，如果Action多了看上去更加复杂，那我们就拆分一下
```
// reducer.js
import todos from 'todos.js'
const todoApp = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return Object.assign({}, state, {
                todos: todos(state.todos, action)
            })
        default: 
            return state
    }
}
```
```
// todos.js
export default (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    default:
      return state
  }
}
```
这样看来，其实程序中操作state中相同数据的reducer都可以进行合成，只管理自己对应的那份数据就好了。
那对应的reducer会变成下面这样
```
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```
简洁明了，而visibilityFilter和todos则是额外提出来的方法而已。Redux本身也提供了这样的方法**combineReducers**，下面的写法和上面的写法是完全等价的。
```
import { combineReducers } from 'redux';
const todoApp = combineReducers({
  visibilityFilter,
  todos
})
export default todoApp;
```

### Store
Store就是存放应用数据的地方，Store 有以下职责：
*   维持应用的 state；
*   提供 [`getState()`](http://www.redux.org.cn/docs/api/Store.html#getState) 方法获取 state；
*   提供 [`dispatch(action)`](http://www.redux.org.cn/docs/api/Store.html#dispatch) 方法更新 state；
*   通过 [`subscribe(listener)`](http://www.redux.org.cn/docs/api/Store.html#subscribe) 注册监听器;
*   通过 [`subscribe(listener)`](http://www.redux.org.cn/docs/api/Store.html#subscribe) 返回的函数注销监听器。
需要注意的是**一个应用有且只有一个Store**，就算需要拆分数据的逻辑时，也应该用reducer的组合，而不是创建多个Store。
```
// 就像todolist例子中使用的一样
import { combineReducers } from 'redux'
const todoApp = combineReducers({
  visibilityFilter,
  todos
})
const store = createStore(todoApp)
```
[`createStore()`](http://www.redux.org.cn/docs/api/createStore.html) 的第二个参数是可选的, 用于设置 state 初始状态。这对开发同构应用时非常有用，服务器端 redux 应用的 state 结构可以与客户端保持一致, 那么客户端可以将从网络接收到的服务端 state 直接用于本地数据初始化。
```
let store = createStore(todoApp, window.STATE_FROM_SERVER)
```
至此，redux的基础概念就完了。










