### react自适应高度的textarea

```
class Text extends React.Component{

  resize = () => {
    if (this.textRef) {
      // 这里主要是为了防止文字减少的情况高度不下降
      this.textRef.style.height = "auto"
      
      this.textRef.style.height = this.textRef.scrollHeight + "px"
    }
  }

  textChange = e => {
    const value = e.target.value
    this.resize()
    this.setState({
      textValue: value
    })
  }

  render() {
    return (
      <div>
        <textarea
          rows="1"
          placeholder="placeholder"
          maxLength="50"
          ref={ref => (this.textRef = ref)}
          value={this.state.textValue}
          onChange={e => this.textChange(e)}
        />
      </div>
    )
  }
}
```

#### 链接
[百度UED](http://eux.baidu.com/blog/fe/%E9%AB%98%E5%BA%A6%E8%87%AA%E9%80%82%E5%BA%94%E7%9A%84%20Textarea)