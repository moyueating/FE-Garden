虽然第三方的库已经有很多的，但是还是记录一下，以备在一些特殊情况下使用，记录。

```
// radio.css
.radio-box {
    display: inline-block;
}
.radio-box input[type=radio] {
    display: block;
    position: relative;
    -webkit-appearance: none;
    height: 32px;
    width: 32px;
    background-color: #fff;
    border: 1px solid rgba(25, 31, 37, 0.12);
    border-radius: 50%;
    outline: none;
    flex: none;
}
.radio-box label {
    display: flex;
    align-items: center;
    font-size: 28px;
    color: #191F25;
    line-height: 38px;
    height: 38px;
}
.radio-box label span {
    display: inline-block;
    line-height: 1;
}
.radio-box label span:nth-child(2) {
    margin-left: 16px;
}
.radio-box input:checked {
    background: #15BC83;
    border: 1px solid #15BC83;
}
.radio-box input.large {
    height: 42px;
    width: 42px;
}
.radio-box input:checked:after {
    position: absolute;
    content: "";
    width: 8px;
    height: 16px;
    top: 0;
    right: -2px;
    bottom: 6px;
    left: 0;
    margin: auto;
    border: 1px solid #fff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
}
```
```
// radio.html
<div className="radio-box">
    <label>
    <span><input type="radio"/></span>
    </label>
</div>
```

```
// checkBox.css
.check-box {
    display: inline-block;
}
.check-box input[type=checkbox] {
    position: relative;
    -webkit-appearance: none;
    height: 28px;
    width: 28px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid rgba(25, 31, 37, 0.12);
    outline: none;
}
.check-box label {
    margin-left: 16px;
    vertical-align: text-bottom;
    font-size: 28px;
    color: #191F25;
    line-height: 38px;
}
.check-box input:checked {
    background: #15BC83;
    border: 1px solid #15BC83;
}
.check-box input:checked:after {
    position: absolute;
    content: "";
    width: 8px;
    height: 16px;
    top: 0;
    left: 8px;
    border: 1px solid #fff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
}
```
```
// checkbox.html
<div class="check-box">
    <input type="checkbox" />
</div>
```