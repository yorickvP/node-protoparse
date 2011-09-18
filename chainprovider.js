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
        if (q[0].condition.apply(this, q[0].arguments.concat(Array.prototype.slice.call(arguments)))) {
            return q.shift() }}
    , tap: function(f, nonest, condition, args) { // pass nonest to true to make a lightweight tap
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
          , condition: condition, arguments: args || [] })
        if (!nonest) this._queue.push(a)
        return this }
     , loop: function(f) { // time to do evil :-)
        var isended = false
        function end() { isended = true }
        return this.tap(function loop() {
            var a = this._queue // save the queue to reuse it for the next iteration
            f.apply(this, [end].concat(Array.prototype.slice.call(arguments))) // [end] + arguments
            this.tap(function() {
                var b = this._queue // temporarily restore the queue to a
                this._queue = a
                if (!isended) loop.call(this, arguments) // I guess you could call it recursion
                this._queue = b }, true) })}}            // and maybe it is.

if (module && module.exports) {
    module.exports = ChainProvider
    module.exports.ChainProvider = ChainProvider }

