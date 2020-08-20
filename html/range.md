## Range

之前基本没有关注过这个api，实际开发中也很少用到，本篇幅为理解并使用 `Range`

### 概念

Range接口标识一个包含节点与文本节点的**一部分**的文档片段。这个一部分比较关键，之前看到这个api就认为是指定范围区域操作dom，那和我直接操作dom好像没啥区别，后来仔细看了一下Range的操作粒度更细。所以网上都说这个在处理编辑器相关的场景下使用的比较多。

### 实际使用

```html
<body>
 <div id ='1'>
  <p>setStart</p>
  <p>setEnd</p>
  <p>setStartBefore</p>
  <p>setStartAfter</p>
  <p>setEndBefore</p>
  <p>setEndAfter</p>
  <p>selectNode</p>
  <p>collapse</p>
 </div> 
 <div id='2'></div>
</body>
```
```js
  // 删除setEnd整个节点
  const range = document.createRange();
  range.setStart(document.querySelectorAll('p').item('1'), 0)
  range.setEnd(document.querySelectorAll('p').item('2'), 0)
  range.deleteContents();
  或者
  const range = document.createRange();
  const startReferenceNode = document.querySelectorAll('p').item('1')
  const endReferenceNode = document.querySelectorAll('p').item('2')
  range.setStartBefore(startReferenceNode)
  range.setEndBefore(endReferenceNode)
  range.deleteContents()
  或者
  const range = document.createRange();
  const startReferenceNode = document.querySelectorAll('p').item('0')
  const endReferenceNode = document.querySelectorAll('p').item('1')
  range.setStartAfter(startReferenceNode)
  range.setEndAfter(endReferenceNode)
  range.deleteContents()
  或者
  const range =document.createRange();
  range.selectNode(document.querySelectorAll('p').item('1'));
  range.deleteContents();
```
```js
  // 删除setEnd节点中的End文本
  const range = document.createRange();
  const target = document.querySelectorAll('p').item('1').childNodes[0]
  range.setStart(target, 3)
  range.setEnd(target, target.length)
  range.deleteContents();
```
```js
// 删除setEnd节点中的setEnd文本，但是保留p节点
  const range = document.createRange();
  range.selectNodeContents(document.querySelectorAll('p').item('1'))
  range.deleteContents()
```
```js
  // 克隆节点
  const range = document.createRange();
  range.selectNode(document.getElementById('1'))
  document.body.appendChild(range.cloneContents())
```
```js
  // 移动节点
  const range = document.createRange();
  range.selectNode(document.getElementById('1'))
  document.getElementById('2').appendChild(range.extractContents())
  或者
  const range = document.createRange();
  const newParent = document.getElementById('2');
  range.selectNode(document.getElementById('methods'));
  range.surroundContents(newParent);
```
```js
 // 插入节点
  const range = document.createRange();
  const newNode = document.createElement('p');
  newNode.innerHTML = '111111'
  range.setStart(document.getElementById('2'), 0)
  range.insertNode(newNode)
```
