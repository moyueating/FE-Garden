
DOM转canvas，已经有很好的开源库html2canvas和dom-to-img了，但是两个库在我这里多多少少有点毛病暂时无法解决，只好自己动手丰衣足食。

这里先记录几个上述库的issue 
>[dom-to-img转化一行文字的时候，最后一个字会无故换行至新的一行，原因未知🤣](https://github.com/tsayen/dom-to-image/issues/143)  
>dom-to-img自带不支持IE和Safari的光环，和自身实现原理利用svg foreignObject 有关  
>[html2canvas对于@font-face在Chrome上无效](https://github.com/niklasvh/html2canvas/issues/364)  
>html2canvas对于英文状态下的writing-mode: vertical-lr模式下表现怪异  

下面就是我自己绘制canvas将DOM转成canvas过程中遇到的一些问题，特此记录

>颜色等style一定要在绘制之前设置，这类API都是就近设置自己后面的第一个效果，先设置后绘制，要记住。

### drawImage
```js
  // 语法一
  context.drawImage(img,x,y)
  // 语法二
  context.drawImage(img,x,y,width,height)
  // 语法三
  context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
```
>问题：将页面上的图片绘制成canvas会报Tainted canvases may not be exported
>解决办法：给那个img元素加crossOrigin="anonymous"

### measureText
>measureText()在画布输出之前，获取字体的宽度，并不能获取高度
>如果你画布的文字有字体样式，一定要在这个方法之前执行一次，不然获取到的宽度是默认字体样式宽度

### textBaseline
>textBaseline默认为alphabetic，文字在基线之上，所以你在ctx.textBaseline('你好',0,0)的时候你会发现字就露出下面一点点，将textBaseline设置为top

绘制字体的时候  http://www.cnblogs.com/zhujl/archive/2012/02/10/2345554.html
fillText就是用 fillStyle 填充整个文字，而strokeText是用 strokeStyle 对文字进行描边

### 水平文本自动换行
当时有两个构思： 
#### 1、逐一绘制 
每行固定字数，每个字之间间距一致，通过判断字数来控制累加x横向绘制，到达字数后，y累加来实现换行  

优点：  
- 逻辑简单，实现方便  

缺点：  
- 只试用于同一类文字，混合类间距不好统一  

#### 2、用类似于css换行的思想
这里[张鑫旭的文章讲的比较清楚了](https://www.zhangxinxu.com/wordpress/2018/02/canvas-text-break-line-letter-spacing-vertical/?utm_medium=hao.caibaojian.com&utm_source=hao.caibaojian.com)，但是张大神那个竖排的方法里面没有实现换行的逻辑，下面加了一些代码。
```js
// 竖排绘制
CanvasRenderingContext2D.prototype.fillTextVertical = function (text, x, y, maxHeight, lineHeight, scale = 1) {
  var context = this;
  var canvas = context.canvas;

  var arrText = text.split('');
  var arrWidth = arrText.map(function (letter) {
    return context.measureText(letter).width;
  });

  var align = context.textAlign;
  var baseline = context.textBaseline;

  if (align === 'left') {
    x = x + Math.max.apply(null, arrWidth) / 2;
  } else if (align === 'right') {
    x = x - Math.max.apply(null, arrWidth) / 2;
  }
  if (baseline === 'bottom' || baseline === 'alphabetic' || baseline === 'ideographic') {
    y = y - arrWidth[0] / 2;
  } else if (baseline === 'top' || baseline === 'hanging') {
    y = y + arrWidth[0] / 2;
  }
+  var initY = y
+  var once = true 

  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // 开始逐字绘制
  arrText.forEach(function (letter, index) {
    context.scale(scale, scale)
    // 新增换行的逻辑
+    let preHeightSum = 0
+    for (let i = 0; i <= index; i++) {
+      preHeightSum += arrWidth[i]
+      if (once && preHeightSum > maxHeight) {
+        console.log(preHeightSum, maxHeight)
+        context.wrapBreak = true
+        x = x + lineHeight
+        y = initY
+        once = false
+        context.doubleMaxHeight = preHeightSum - arrWidth[i]
+      }else{
+        context.singleMaxHeight = preHeightSum
+      }
+    }
    // 确定下一个字符的纵坐标位置
    var letterWidth = arrWidth[index];
    // 是否需要旋转判断
    var code = letter.charCodeAt(0);
    if (code <= 256) {
      context.translate(x, y);
      // 英文字符，旋转90°
      context.rotate(90 * Math.PI / 180);
      context.translate(-x, -y);
    } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
      // y修正
      y = y + arrWidth[index - 1] / 2;
    }
    context.fillText(letter, x, y);
    // 旋转坐标系还原成初始态
    context.setTransform(1, 0, 0, 1, 0, 0);
    // 确定下一个字符的纵坐标位置
    var letterWidth = arrWidth[index];
    y = y + letterWidth;
  });
  // 水平垂直对齐方式还原
  context.textAlign = align;
  context.textBaseline = baseline;
};
```


参考文章: 
[canvas文本绘制自动换行、字间距、竖排等实现](https://www.zhangxinxu.com/wordpress/2018/02/canvas-text-break-line-letter-spacing-vertical/?utm_medium=hao.caibaojian.com&utm_source=hao.caibaojian.com)


