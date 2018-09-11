>客户端滑动卡顿

```css
div{
  -webkit-overflow-scrolling: touch;
}
```

>webpack无法编译-webkit-box-orient: vertical这个属性
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

>去除滚动条
```css
::-webkit-scrollbar {display:none}
```

>移除 input type="number" 时浏览器自带的上下箭头
```css
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
}
```

>禁用鼠标事件
```css
div.disabled{
  pointer-events: none;
}
```

>iphoneX适配

[iphoneX人机交互](https://developer.apple.com/design/human-interface-guidelines/ios/overview/iphone-x/)

[iPhone X的Web设计](https://www.w3cplus.com/mobile/designing-websites-for-iphone-x.html)

>消除浏览器选中蓝色背景
```css
div{
  user-select: none;
}
```

>writing-mode会导致子元素无法自动撑开父元素的宽度






