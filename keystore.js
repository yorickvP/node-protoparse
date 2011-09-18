function KeyStore(prototype) {
    return Object.create(prototype || KeyStore.prototype) }
Object.defineProperties(KeyStore.prototype,
  { _get: { value: function(x) {
        var terms = x.split('.')
        if (terms.length == 1) return this[terms[0]]
        return terms.slice(0, -1).reduce(function(prev, cur) {
            if (!(cur in prev)) prev[cur] = KeyStore(Object.getPrototypeOf(this))
            return prev[cur] }, this)[terms[terms.length - 1]]} }
  , _set: { value: function(x, y) {
        var terms = x.split('.')
        if (terms.length == 1) return this[terms[0]] = y
        return terms.slice(0, -1).reduce(function(prev, cur) {
            if (!(cur in prev)) prev[cur] = KeyStore(Object.getPrototypeOf(this))
            return prev[cur] }, this)[terms[terms.length - 1]] = y }}})
if (module && module.exports) {
    module.exports = KeyStore }

