### 客户端滑动卡顿
```css
div{
  -webkit-overflow-scrolling: touch;
}
```


### webpack无法编译-webkit-box-orient: vertical这个属性
```css
// 方案一, webpack跳过编译
div{
  overflow : hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  /* autoprefixer: off */
  -webkit-box-orient: vertical;
  /* autoprefixer: on */
}
// 方案二
使用内联样式
```


### 去除滚动条
```css
::-webkit-scrollbar {display:none}
```


### 移除 input type="number" 时浏览器自带的上下箭头
```css
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
}
```


### 禁用鼠标事件
```css
div.disabled{
  pointer-events: none;
}
```


### iphoneX适配
[iphoneX人机交互](https://developer.apple.com/design/human-interface-guidelines/ios/overview/iphone-x/)

[iPhone X的Web设计](https://www.w3cplus.com/mobile/designing-websites-for-iphone-x.html)


### 消除浏览器选中蓝色背景
```css
div{
  user-select: none;
}
```


### writing-mode会导致子元素无法自动撑开父元素的宽度


### 移动端安卓line-height不垂直居中的问题，会有1px的偏移
是Android在排版计算的时候参考了primyfont字体的相关属性（即HHead Ascent、HHead Descent等），而primyfont的查找是看`font-family`里哪个字体在fonts.xml里第一个匹配上，而原生Android下中文字体是没有family name的，导致匹配上的始终不是中文字体，所以解决这个问题就要在`font-family`里显式申明中文，或者通过什么方法保证所有字符都fallback到中文字体。

[资料](https://www.zhihu.com/question/39516424/answer/274374076)

```css
/* hack的方法或者使用其他flex以及其他方式规避问题 */
div{
  border: 1px solid transparent;
  box-sizing:border-box;
}
```






