var p1 = new Promise(function(resolve, reject){
  return resolve(21)
})
var p2 = Promise.resolve(21)
p1 === p2  //false

// 如果向 Promise.resolve(..) 传递一个真正的 Promise，就只会返回同一个 promise
var p1 = Promise.resolve(42)
var p2 = Promise.resolve(p1)
p1 === p2 //true


// 利用promise.race()实现超时机制
function timeout(delay){
  return new Promise(function() {
    setTimeout(function() {
      reject('超时')
    }, delay)
  })
}

function ajax() {
  return new Promise(function(){
    resolve(data)
  })
}

Promise.race([ajax(), timeout(3000)]).then(function(){
  console.log('成功')
}, function() {
  console.log('超时')
})



Promise.none = function(prs) {
  return new Promise(function(resolve, reject) {
    var len = 0
    prs.forEach(ele => {
      Promise.resolve(ele).then(
        function(){},
        function() {
          console.log('reject')
          len +=1
          if(len === prs.length){
            reject('所有的都reject了')
          }
        }
      )
    })
  })
}

p1= Promise.reject(43)
p2= Promise.reject(42)
p3= Promise.reject(41)
prs = [p1, p2, p3]
Promise.none(prs).then(function(){

},
function(err){
  console.log(err)
})


function foo(x, y , callback) {
  ajax(`http://test.ximalaya.com?x=${x}&y=${y}`, callback)
}

foo(11, 12, function(err, text){
  if(err){
    console.log(err)
  }else{
    console.log(text)
  }
})

Promise.wrap = function(fn) {
  return function() {
    var args = [].slice.call(arguments)
    return new Promise(function(resolve, reject) {
      fn.apply(null, args.concat(function(err, text){
        if(err){
          reject(err)
        }else{
          resolve(text)
        }
      }))
    })
  }
}

var request = Promise.wrap(ajax)
request('http://test.ximalaya.com').then()


// 正常版本的readFile（多参数版本）
fs.readFile(fileName, callback);

// 将一个函数包装成thunk函数
function thunkWrap(fn) {
  return function(){
    const args = [].slice.call(arguments)
    return function(callback){
      args.push(callback)
      fn.apply(this, args)
    }
  }
}

function thunkWrap(fn) {
  return function(...args){
    return function(callback){
      fn.call(this, ...args, callback)
    }
  }
}