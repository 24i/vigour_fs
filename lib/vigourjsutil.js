

exports.isNode = (typeof window === 'undefined') ? true : false

exports.merge = function (a, b, norefs, overwrite) {
  for (var i in b) {
    var aisobj = util.isObj(a[i])
      , bisobj = util.isObj(b[i])

    if (aisobj && bisobj) {
      util.merge(a[i], b[i], norefs)
    } else if(!norefs || !bisobj){
      if( overwrite === void 0
       || !(i in a)
       || typeof overwrite === 'function' && overwrite(a[i], b[i])
        ){
        a[i] = b[i]
      }

    }else{
      a[i] = b[i] instanceof Array ? [] : {}
      util.merge(a[i], b[i], norefs, overwrite)
    }
  }
  return a
}

exports.isObj = function (obj) {
  return (obj instanceof Object
    && typeof obj !== 'function')
}
