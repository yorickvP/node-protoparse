function KeyStore(prototype, other) {
    return Object.create(prototype || (other ?
           Object.getPrototypeOf(other) : KeyStore.prototype)) }
Object.defineProperties(KeyStore.prototype,
  { _get: { value: function(x) {
        var t = x.split('.')
        return t.length == 1 ? this[x] :
           t.slice(0, -1).reduce(function(o, x) {
                return x in o ? o[x] : o[x] = KeyStore(null, this) }
        , this)[t[t.length - 1]] }}
  , _set: { value: function(x, y) {
        var t = x.split('.')
        return t.length == 1 ? this[x] = y :
           t.slice(0, -1).reduce(function(o, x) {
                return x in o ? o[x] : o[x] = KeyStore(null, this) }
            , this)[t[t.length - 1]] = y }}})
if (module && module.exports) {
    module.exports = KeyStore }

