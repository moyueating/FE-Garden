>客户端滑动卡顿

```
div{
  -webkit-overflow-scrolling: touch;
}
```

>webpack无法编译-webkit-box-orient: vertical这个属性
```
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
```
::-webkit-scrollbar {display:none}
```

>移除 input type="number" 时浏览器自带的上下箭头
```
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
}
```

>禁用鼠标事件
```
div.disabled{
  pointer-events: none;
}
```




