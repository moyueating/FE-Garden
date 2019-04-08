### position定位
定位问题老生常谈，position的定位有4种，static（没有定位），relative（相对于自身的定位），absolute（相对于第一个非static定位的父级元素），fixed（相对于页面固定定位）。
今天主要讲一下absolute定位的问题
```html
// html
<body>
    <div class="blue">
        <div class="green">
            <div class="red">

            </div>
        </div>
    </div>
</body>
```
```css
// css
.blue{
    background: lightblue;
    width: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
.green{
    background: green;
    width: 80%;
    height: 300px;
}
   .red{
    background: red;
    width: 60%;
    position: absolute;
    height: 200px;
  }
```
最终的展示效果
![color.png](http://upload-images.jianshu.io/upload_images/2593925-35ad41b2232bcb42.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 新增属性sticky
粘性定位可以被认为是相对定位和固定定位的混合。元素在跨越特定阈值前为相对定位，之后为固定定位。

```css
div{
    position: sticky;
    top: 0;
}
```
在viewport视口滚动到top距离为0的情况下，该div会变成绝对定位的效果，在不考虑浏览器兼容的情况下上述的样式可以很简单的实现滚动tab吸顶的效果。


### 结论
以前我认为一个absolute定位的元素（红色DIV），只有位置属性（如top，left这类）才会相对那个第一个非static定位的元素（蓝色DIV），其实我们会发现红色DIV的所有属性都是相对于蓝色DIV的，而不是相对于绿色DIV。
