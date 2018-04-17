本来说好写完组件通信后就会写vuex相关的东西，现在快过去两个多月了，主要是由于自己工作的原因，后面会保证更新速度的。不废话了，直接正题。
## 介绍（官方套路）
### 什么是[vuex](https://vuex.vuejs.org/zh-cn/intro.html)
Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式**（至于什么是状态管理模式我就不科普了）。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。Vuex 也集成到 Vue 的官方调试工具 [devtools extension](https://github.com/vuejs/vue-devtools)，提供了诸如零配置的 time-travel 调试、状态快照导入导出等高级调试功能。
### 为什么需要vuex
上篇文章说过了，当一个应用比较简单的时候，组件之间的通信以及交互都不会很多，上篇中介绍的通信方法足够应付大多数的场景。但是当应用足够复杂，**多个组件共享一个状态**的时候，前面的方法会十分繁琐混乱并且不易管理。所以我们就需要将组件共享的状态抽取成一个类似全局变量的东西，任何组件都可以get以及set这个状态，这样就可以实现状态的高效管理。另外，通过定义和隔离状态管理中的各种概念并强制遵守一定的规则，我们的代码将会变得更结构化且易维护。
## 核心概念

### [store](https://vuex.vuejs.org/zh-cn/getting-started.html)
每一个 Vuex 应用的核心就是 store（仓库）。“store”基本上就是一个容器，它包含着你的应用中大部分的状态 (state)。Vuex 和单纯的全局对象有以下两点不同：
- Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
- 你不能直接改变 store 中的状态。改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

如何将store注入我们的应用(下面的所有代码我将以购物车为例)
先将项目结构放出来

![structure.png](http://upload-images.jianshu.io/upload_images/2593925-2c5f9bcf2c92135c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
// 创建一个简单的store
const store = new Vuex.Store({
  state: {
    totalPrice: 0
  },
  mutations: {
    add (state) {
      state.totalPrice++;
    }
  }
})
```
你可以通过**store.state**获取状态值，你也可以通过**store.commit('add')**来改变状态。
```
store.commit('add');
console.log(store.state.totalPrice);  // 1
```
这里**不通过直接修改store.state的值，而是通过提交mutation去变更**，主要是为了使得整个数据的变更可以追踪。举个例子：门禁卡，每次进出我们刷一下卡系统显示的是你的名字，知道你来了。刷卡的过程就是你提交的mutation，声明一声：你大爷来了，然后系统（仓库状态）记录一下状态。后面查询出入记录的时候就有迹可循。

### [state](https://vuex.vuejs.org/zh-cn/state.html)
state是单一状态树，用一个对象包含所有应用层级的状态，具有唯一性。（这种话太官方，就是一个对象，名字叫state。）
state的读写就是store中的代码。由于 Vuex 的状态存储是响应式的，所以我们在组件中通过**计算属性**去返回某个状态：
```
// 购物车 shop.vue
<template>
      <h3>购物车总价：{{ totalPrice }}</h3>
</template>
<script>
export default {
    name: 'shop',
    data: {
    },
    computed: {
        totalPrice (){
            return this.$store.state.totalPrice;
        }
    },
}
</script>
```
 或者采用**辅助函数mapstate**,这里先用，后面我会讲一下原理。
```
// 购物车 shop.vue
<template>
      <h3>购物车总价：{{ totalPrice }}</h3>
</template>
<script>
import { mapState } from 'vuex'
export default {
    name: 'shop',
    data: {
    },
    computed: {
       ...mapState([
            'totalPrice'
        ]),
    },
}
</script>
```

我们之所以可以这么使用，是因为Vuex 通过 store 选项，提供了一种机制将状态从根组件“注入”到每一个子组件中（需调用 Vue.use(Vuex)）：
```
// index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        totalPrice: 0
    },
})
```

### [Getter](https://vuex.vuejs.org/zh-cn/getters.html)
简单点介绍getter就是vuex中的计算属性。
下面对比一下 **computed VS  getters**
```
//  shop.vue 
computed: {
   totalPrice() {
       return this.$store.state.totalPrice;
   },
   shopCartList() {
       return this.$store.state.shopCartList;
   }
},

```
```
// getters.js
export default {
    expensive(state) {
        return state.shopCartList.filter(shop => {
            return shop.price > 2000
        })
    },
    moreExpensive(state,getters) {
        return getters.expensive.filter(shop => {
            return shop.price > 4000
        })
    }
}
```
通过上面我们可以看出 计算属性computed返回给当前的组件或者他的子组件使用的，但是getters将store的state中的值重新计算后供整个应用使用，但是原理是类似的。同时从代码可以看出**getter可以接受其他getter**当做第二个参数使用，就像在贵的上面筛选出更贵的。
至于怎么使用getter就比较简单了，将getters添加到参数对象中就可以了
```
// index.js
export default new Vuex.Store({
    state: {
        totalPrice: 0,
        shopCartList: []
    },
    mutations,
    getters
})
```
调用getters,两种方法
```
// shop.vue 普通方式
computed: {
   expensive() {
      return this.$store.getters.expensive;
   },
   moreExpensive() {
      return this.$store.getters.moreExpensive;
   }
},
```
```
// shop.vue 辅助函数方式
import { mapGetters } from 'vuex'
computed: {
   ...mapGetters([
       'expensive',
       'moreExpensive'
   ])
},
```

### [Mutation](https://vuex.vuejs.org/zh-cn/mutations.html)

#### 概念
mutation就是事件类型与事件回调，本身这个应该在前面讲比较合适，因为这是更改状态的第一步，但是官方按照这个顺序，我们就还是按原样。
每一个mutation都会有一个事件的type和callback，当我们store.commit('plus')一个事件后，vuex会根据它的type(plus)，然后调用相应的callback执行增加的操作，然后去变更仓库中的状态。

#### 载荷
同时你可以向store.commit增加额外的参数，这会被当做mutation的载荷playload。

#### 使用常量替代 Mutation 事件类型
这块其实很简单，就是将额外编写一个专门存放type的文件引入mutation，将常量作为各个mutation的事件类型

#### Mutation 必须是同步函数
这个是mutation中最重要的一点，如果你在mutation中有异步的回调，那么追踪记录就不可能了，这样就破坏了vuex的初衷。

具体代码
```
// mutations.js
import * as types from './mutation-types'
import Vue from 'vue'

export default {
    [types.ADD_TO_SHOPCART](state,payload){
        let allPro = [];        
        state.shopCartList.forEach( (pro) => {
            allPro.push(pro.name);
        })
        if(!payload.num && payload.num != 0){
            Vue.set(payload,'num',1);
        }
        if(!payload.totalPrice){
            Vue.set(payload,'totalPrice',payload.price);
        }

        if(allPro.indexOf(payload.name) < 0){
            state.shopCartList.push(payload);
        }else{
            state.shopCartList.forEach( (pro) => {
                if(pro.name == payload.name){
                    pro.num ++ ;
                    pro.totalPrice = pro.num * pro.price;
                }
            })
        }
        state.totalPrice = state.shopCartList.reduce((sum,value) => {
            return sum + value.totalPrice;        
        },0)
    },
    [types.MINUS_TO_SHOPCART](state,payload){
        let popIndex;
        state.shopCartList.forEach( (pro,index) => {
            if(pro.name == payload.name){
                if(pro.num > 1){
                    pro.num -- ;
                    pro.totalPrice = pro.num * pro.price;
                }else{
                    popIndex = index;                    
                }
            }
        })
        popIndex == 0  && state.shopCartList.splice(popIndex,1);
    }
}
```
```
// mutation-types.js
export const ADD_TO_SHOPCART = 'ADD_TO_SHOPCART'
export const MINUS_TO_SHOPCART = 'MINUS_TO_SHOPCART'
```

### [Action](https://vuex.vuejs.org/zh-cn/actions.html)
#### 概念
action就是异步提交mutation。Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象,但是这个context对象不是store本身，因为后面介绍到的Module会存在局部context和根context两种。
```
action: {
  increment (context) {
    context.commit('increment')
  }
}
```
有个图很好的说明了action的具体实现，这里dispatch出action后，再在回调里面去commit mutation，这样即便是回调依然可以追踪到相关的状态变更记录。
![action.png](http://upload-images.jianshu.io/upload_images/2593925-8eaba0551a2b155e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 分发action
Action 通过 store.dispatch 方法触发，支持载荷方式和对象方式进行分发，这里我自己的项目里面没有用到action，但是我们可以假设一个场景，就是你添加商品的时候需要请求接口判断库存（不过一般都不会这么去设计）：
```
actions: {
  check({commit}，product){
    getAjax(url).then(res => {
       if(库存足够){
         commit( types.ADD_TO_SHOPCART,product )
       }else{
          ....
       }
    })
  }
}
```
action也是支持嵌套的,是因为store.dispatch 可以处理被触发的 action 的处理函数返回的 Promise，并且 store.dispatch 仍旧返回 Promise。
```
actions: {
  actionA ({ commit }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('someMutation')
        resolve()
      }, 1000)
    })
  }
}
```
你可以这么使用
```
store.dispatch('actionA').then(() => {
  // ...
})
```
在另外的action中
```
actions: {
  // ...
  actionB ({ dispatch, commit }) {
    return dispatch('actionA').then(() => {
      commit('someOtherMutation')
    })
  }
}
```
### [Module](https://vuex.vuejs.org/zh-cn/modules.html)

#### 概念
module这块其实不太想讲的，因为官方的文档写的相当清楚。这里就稍微搬弄一波。仓库虽然可以存放很多东西，但是东西太多了之后也还是会凌乱，所以我们需要分区，module就是将store分成单独的模块，每个module享有自己独有的state，mutation，action，getter甚至是嵌套的子模块。
我的代码中没有使用module，这里依然使用官方的例子解释，使用代码很简单，看一下就好了：
```
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```
#### 模块的局部状态
因为每个module都有自己的局部状态，那么必然就会区分局部状态和根状态，**主要注意的也就是这点局部状态和根状态，mutation，action，getter，通过不同的参数位将局部和根状态传入**这里就没有代码了，看官方的文档还是非常清楚的。
#### 命名空间
这个就是让模块有更高封装度的的一个属性 namespaced: true。
这样这个模块的里面的mutation，action这类都会有相应的路径。就像下面的代码，如果我们去掉namespaced:true，那么account模块中的getters，actions，mutations里面的方法都是全局可以访问的。但是加了namespaced:true，就需要加上对应的模块路径访问。
```
const store = new Vuex.Store({
  modules: {
    account: {
      namespaced: true,

      // 模块内容（module assets）
      state: { ... }, // 模块内的状态已经是嵌套的了，使用 `namespaced` 属性不会对其产生影响
      getters: {
        isAdmin () { ... } // -> getters['account/isAdmin']
      },
      actions: {
        login () { ... } // -> dispatch('account/login')
      },
      mutations: {
        login () { ... } // -> commit('account/login')
      },

      // 嵌套模块
      modules: {
        // 继承父模块的命名空间
        myPage: {
          state: { ... },
          getters: {
            profile () { ... } // -> getters['account/profile']
          }
        },

        // 进一步嵌套命名空间
        posts: {
          namespaced: true,

          state: { ... },
          getters: {
            popular () { ... } // -> getters['account/posts/popular']
          }
        }
      }
    }
  }
})
```
module里面其他的就不讲了。最后讲下上文提到的辅助函数，这里以mapstate为例。
### 辅助函数mapstate

下面的是mapstate的源码：
```
var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});
```
这里我先将这个方法简化一下
```
var mapState = normalizeNamespace(fn);
```
我们先看上面的代码mapstate首先调用的是normalizeNamespace这个函数,我们再看normalizeNamespace这个方法里面的逻辑：
这个函数接受一个方法作为参数，返回一个函数，这个函数也就mapstate。mapsate接收两个参数namespace和map，这里的namespace就是上面module当中介绍到的命名空间里面的namespace。当namespace不传的时候就将第一个参数（映射的对象）赋给map，或者传入namespace就对其进行类型判断以及格式校验后，返回传入的fn的调用。
```
function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}
```
然后我们具体看传入的fn这个函数具体干了什么，首先定义一个空res对象，然后调用normalizeMap（这个函数的解析在下面）这个方法将states转化为每项都是{ key: key, val: key }格式的对象数组，然后foreach遍历。
遍历里面将上面的对象数组的key,val重新整理进入res中。mappedState具体里面的逻辑如下：
默认进来state和getters是全局仓库里面的，然后再去判断是否有namespace这个，如果有将对应的那个module中的state和getters覆盖掉全局的那个，最后判断val如果是函数，就直接调用这个函数，并且将前面定义好的state以及getters当做参数传入，如果不是函数则直接取值。
res[key].vuex = true;这行就是提供给插件使用的。
```
// mapstate中传入的fn
function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState'，namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
}
```
normalizeMap这个方法判断了map书否是数组，如果是就将map中每一项转化为**{ key: key, val: key }**的对象，否则传入的 map 就是一个对象（因为mapstate传入的参数不是数组就是对象），那就调用Object.keys获取map的所有key值，然后key数组再次遍历转化为{ key: key, val: map[key] }这个对象，最后将这个对象数组作为normalizeMap的返回值。
```
// normalizeMap
function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}
```
差不多就是这些啦，其他的辅助函数也都是类似的，有兴趣的可以去官网看看源码。**有错希望大家及时指出**，我只是代码的搬运工，哈哈...

相关文档：
[vuex](https://vuex.vuejs.org/zh-cn/) : https://vuex.vuejs.org/zh-cn/
[vuex gitHub](https://github.com/vuejs/vuex/blob/dev/dist/vuex.common.js) : https://github.com/vuejs/vuex/blob/dev/dist/vuex.common.js