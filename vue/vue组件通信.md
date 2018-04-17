##Vue组件之间的通信
个人认为Vue组件之间的通信主要归类为3种：
- 父子组件之间的通信
- 任意两个组件之间的通信
- 最终的boss，Vuex-状态管理模式

此次写一下前两种通信，后续会单独写vuex相关的内容。

##父子组件的通信
这种方式的通信是最简单，下面直接贴代码
```
// parent.vue
<template>
    <div class="parent">
        <p>父亲:给你{{ money }}元零花钱</p>
        <kid :money=" money" @repay="repay"></kid>
        <br>
        <button @click="add">那给你加100</button>
        <p v-if="back" @repay="repay">儿子：超过300我不要，还给你 {{ back }}元</p>
    </div>
</template>
<script>
export default {
    name: 'parent',
    data () {
        return {
            money: 100,
            back: 0
        }
    },
    components:{ kid },
    methods:{
        repay (back) {
            this.back = back
        },
        add(){
            this.money += 100;
        }
}
```
```
// kid.vue
<template>
    <div class="parent">
        <p v-if="pocketMoney < 300">儿子: {{ pocketMoney }}太少了，不够 </p>
        <p v-else>儿子: 谢谢老爸！</p>
        <button v-if="pocketMoney > 300" @click="repay">点击有惊喜</button>
    </div>
</template>
<script type="text/javascript">
export default {
    name: 'kid',
    props: {
        money: Number
    },
    data () {
        return {
        }
    },
    computed: {
        pocketMoney () {
            return this.money;
        }
    },
    methods: { 
        repay () {
            this.$emit('repay',this.pocketMoney-300)
        }
    }
}
</script>
```
这里讲了一个小故事，老爸给儿子零花钱，老爸通过props将钱给到儿子，儿子拿到后通过计算属性得到自己的零花钱，发现太少了，于是老爸多给了儿子，可是儿子只想要300块去steam上买个游戏，超过300块后，儿子就发送了一个自定义事件repay，将超过300块的钱还给老爸，老爸通过监听repay这个事件的回调里面拿到儿子还给他的钱。

##任意两个组件之间的通信
但是实际当项目逐渐变大，组件之间的层级变多，很多时候非父子间的组件通信也就开始多了，这时候我们就需要另外一种通信方式，官方的叫法[global bus](https://cn.vuejs.org/v2/guide/components.html#非父子组件通信)。
贴代码：
```
// one.vue
<template>
  <div>
      这是one组件
      <button @click="commit">给two组件发送信息</button>
      <p> {{ message }}</p>
  </div>
</template>
 <script type="text/javascript">
 import { bus } from './bus'
export default {
    name: 'one',
    data () {
        return {
            message: '',
        }
    },
    methods:{
        commit () {
            bus.$emit('sendMsg',{
                msg: '这条信息来自于one'
            })
        }
    },
    mounted () {
        bus.$on('backMsg', (data) => {
            this.message = data.msg;
        })
    }
}
```
```
// two.vue
<template>
    <div @click="commit">
        <p>这是two组件<button @click="commit">给one组件发送信息</button></p>
        <p>{{ message }}</p>
    </div>
</template>

<script type="text/javascript">
import { bus } from './bus'

export default {
    name: 'two',
    data () {
        return {
            message: ''
        }
    },
    methods:{
        commit () {
            bus.$emit('backMsg',{
                msg: '这条信息来自于two'
            })
        }
    },
    mounted () {
        bus.$on('sendMsg', (data) => {
            this.message = data.msg;
        })
    }
}
</script>
```
最关键的bus,却是最简单的
```
// bus.vue
<script>
import Vue from 'vue'
export default {
    bus: new Vue(),
}
</script>
```
其实这里就是额外new了一个Vue的实例对象，这个实例什么事情都不干，就收发事件，这里的bus监听了两个事件，一个sendMsg,一个backMsg，当bus监听到one发出sendMsg后，bus就把这个信息告诉two,而当bus监听到two发出backMsg后，bus就把这个信息告诉one，这就是bus干的事，因为借助于第三者的bus，所以one和two不一定是父子关系，可以是任意两个甚至多个组件之间的通信。这种通信其实也可以取代父子组件之间的通信，但是平时父子组件的通信，第一种是最方便的，也就没必要用这种方式了。

##总结
这里讲了前两种组件之间的通信方式，后面一节会着重讲最终大boss--vuex。