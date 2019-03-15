>记录RN开发中遇到的问题以及解决办法

#### 样式类
>flex布局  
和css中的flex布局有点区别，RN中的flex布局默认的主轴是垂直方向，

>borderRadius  
ios中borderRadius设置值大于等于宽高，该元素则会不显示，和css中的100%展示不一致

>includeFontPadding  
针对安卓字体与边界存在一定的边界留白，在样式中设置includeFontPadding为false
```css
.text{
  includeFontPadding: false
}
```

>安卓上阴影不支持自定义，只支持elevation这个默认的灰色阴影  
```css
  elevation: 20
```



#### 组件类
>TextInput需要点击多次才失去焦点  
一般情况下需要将TextInput放入ScrollView中，并且设置keyboardShouldPersistTaps属性为always。注意一点这里的ScrollView必须是最外层的，不然无效。

keyboardShouldPersistTaps这个属性点击scrollView后是否收起键盘，取决于本属性设置。而且是外层所有的scrollView都设置这个属性，所以在使用一些第三方库的时候如果造成scrollView的嵌套，只在自己的代码中加入这个属性是无效的，必须修改依赖的库的源码，加入keyboardShouldPersistTaps的属性。


>TextInput可以直接onPress  

- ios textInput没法输入中文  [commit](https://github.com/facebook/react-native/pull/18456/files)  

>FlatList  
1、onEndReached会在起始data为空数组的时候触发一次，需要过滤，通过数据长度判断或者onMomentumScrollBegin这个属性设置。  
2、onEndReached会重复触发，需要设置flag。  



>安卓里ScrollView嵌套冲突问题  
可以尝试使用结合使用setNativeProps和pointEvents，在父层设置point-events="box-none"，内层的元素加上onPressIn和onPressOut,In里面禁用外层的滚动，out里面恢复外层滚动  
```js
onPressIn = () => this.props.rootRef.setNativeProps({scrollEnabled: false})
onPressOut = () => this.props.rootRef.setNativeProps({scrollEnabled: true})
```

>NetInfo  
```js
// 下面的方法在ios上并不能返回正确的网络连接状态
NetInfo.isConnected.fetch().then(isConnected => {
  console.log('First, is ' + (isConnected ? 'online' : 'offline'));
});
// 改用一下方法
getConnectionInfo = () => {
  if(Platform.OS === 'ios'){
    return new Promise((resolve,reject) => {
      const connectionHandler = connectionInfo => {
        NetInfo.removEventListener('connectionChange', connectionHandler)
        resolve(connectionInfo)
      }
       NetInfo.addEventListener('connectionChange', connectionHandler)
    })
    return NetInfo.getConnectionInfo()
  }
}
```

>Modal,InteractionManager

ios中连续的两个modal无法弹出，应该是动画执行的卡顿导致，尝试将第二个用InteractionManager包装一下
```js
InteractionManager.runAfterInteractions(() => {
  // ...耗时较长的同步执行的任务...
});
```



>FlatList  

0.56.1版本中 FlatList同时设置ListHeaderComponent和onEndReached会导致onEndReached失效，官方回应需升级RN版本


#### 打包类
>xcode RN打包报React/RCTBridgeModule.h' file not found  

在xcode中设置先将React模块优先当依赖包注入，取消默认的平行打包[资料](https://blog.csdn.net/birthmarkqiqi/article/details/72819197)


#### 三方库
>[react-native-linear-gradient](https://github.com/react-native-community/react-native-linear-gradient)  

注：需要客户端注入BVLinearGradient模块


>[react-navigation](https://github.com/react-navigation/react-navigation)  

1、Android中的headerTitle默认是左对齐，由于左边有返回按钮，所以直接设置居中无效，需要在headerLeft和headerRight设置一样大小的容器来强制平衡左右占位空间.  

2、ios中侧滑的时候和原生侧滑冲突，从原生进入A，再进入B，B页面侧滑会直接退出RN回到原生页面，尝试让客户端提供控制手势的API。  

3、onNavigationStateChange监听路由变化事件


[react-native-storage](https://github.com/sunnylqm/react-native-storage/blob/master/README-CHN.md) 


>[react-native-scrollable-tab-view](https://github.com/happypancake/react-native-scrollable-tab-view) 

1、如果页面使用了scrollView设置为水平布局后，会出现scrollView嵌套滚动冲突问题



[beeshell](https://github.com/meituan/beeshell) 

[lottie-react-native](https://github.com/react-community/lottie-react-native)

[react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler)

[react-native-interactable](https://github.com/wix/react-native-interactable)

[react-native-snap-carousel](https://github.com/archriss/react-native-snap-carousel)

>[mobx](https://github.com/mobxjs/mobx)  

1、react-native中使用mobx,低版本安卓中会报错，can't find variable:Symbol，尝试将mobx降至4.x版本。


### 项目架构类
多个有业务相关的RN业务需要放入同一个项目架构中，通过配置index.js的入口来注册不同的RN模块。