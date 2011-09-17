var BinaryChainProvider = require('./binary.js')
var ChainProvider = require('./chainprovider.js')

function BufferList() {
    var bl = []
    bl.bytes = 0
    bl.addData = function(buffer) {
        bl.bytes += buffer.length
        bl.push(buffer) }
    bl.getbytes = function(n) {
        if (bl.bytes < n) return
        bl.bytes -= n
        var ret = []
        while(ret.length < n) {
            var toRead = n - ret.length
            ret = ret.concat(Array.prototype.slice.call(bl[0], 0, toRead))
            if (bl[0].length <= toRead) bl.shift()
            else bl[0] = bl[0].slice(toRead) }
        return ret }
    bl.getbuffer = function(n) {
        if (bl.bytes < n) return
        bl.bytes -= n
        var ret = Buffer(n)
        var cursize = 0
        while(cursize < n) {
            var toRead = n - cursize
            var actualread = Math.min(bl[0].length, toRead)
            bl[0].copy(ret, cursize, 0, actualread)
            cursize += actualread
            if (bl[0].length == actualread) bl.shift()
            else bl[0] = bl[0].slice(actualread) }
        return ret }
    return bl }

function Parser(buffer, prototype) {
    if (!prototype) prototype = BinaryChainProvider
    var cp = ChainProvider(prototype)
    cp._keystore = {}
    cp._buffer = BufferList()
    cp.run = function() {
        var i
        while(i = this._provide(this._keystore, this._buffer, this._buffer.bytes))
            i.f.call(this, this._keystore, this._buffer, this._buffer.bytes)
        return this }
    cp.addData = function(buffer) {
        cp._buffer.addData(buffer)
        return cp.run() }
    if (buffer) cp.addData(buffer)
    return cp
}

function StreamParser(stream, prototype, data_cbname) {
    var p = Parser(null, prototype)
    stream.on(data_cbname || 'data', p.addData)
    return p
}

if (module && module.exports) {
    module.exports = Parser
    module.exports.Stream = StreamParser
    module.exports.BufferList = BufferList }

