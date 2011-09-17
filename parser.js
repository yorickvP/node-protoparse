var BinaryChainProvider = require('./binary.js')
  ,       ChainProvider = require('./chainprovider.js')
  ,          BufferList = require('./bufferlist.js')


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
    return cp }

function StreamParser(stream, prototype, data_cbname) {
    var p = Parser(null, prototype)
    stream.on(data_cbname || 'data', p.addData)
    return p }

if (module && module.exports) {
    module.exports = Parser
    module.exports.Stream = StreamParser
    module.exports.BufferList = BufferList }

