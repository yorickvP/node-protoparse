function ChainProvider(prototype) {
    if (!prototype) prototype = ChainProvider.prototype
    var o = Object.create(prototype)
    o._queue = []
    return o }

function K(x) { return function() { return x } }

var Ktrue = K(true)

ChainProvider.prototype =
    { _provide: function() {
        if (!this._queue.length) return
        var q = this._queue
        while(Array.isArray(q[0])) {
            if (q[0].length == 0) { // knock out that empty array and try again
                q.shift()
                return this._provide.apply(this, arguments) }
            q = q[0] }
        if (q[0].condition.apply(this, arguments)) {
            return q.shift() }}
    , tap: function(f, condition, nonest) {
        if (!condition) condition = Ktrue
        var a
        if (!nonest) a = []
        this._queue.push(
          { f: nonest ? f :
                function() {
                    var t = this._queue
                    this._queue = a
                    f.apply(this, arguments)
                    this._queue = t
                    if(a.length == 0 && t[0] == a) t.shift() } // assert(t[0] == a)?
          , condition: condition })
        if (!nonest) this._queue.push(a)
        return this }}

if (module && module.exports) {
    module.exports = ChainProvider
    module.exports.ChainProvider = ChainProvider }

