var BinaryChainProvider = require('./binary.js')
  ,       ChainProvider = require('./chainprovider.js')
  ,          BufferList = require('./bufferlist.js')
  ,            KeyStore = require('./keystore.js')

function Parser(buffer, prototype, keystore_proto) {
    if (!prototype) prototype = BinaryChainProvider
    var cp = ChainProvider(prototype)
    cp._keystore = KeyStore(keystore_proto)
    cp._buffer = BufferList()
    cp.run = function() {
        var i
        while(i = this._provide(this._buffer, this._buffer.bytes))
            i.f.apply(this, i.arguments.concat([this._buffer, this._buffer.bytes]))
        return this }
    cp.tap = function(f, nonest, condition, args) {
        return prototype.tap.call(this, f, nonest, condition, [this._keystore].concat(args || [])) }
    cp.flush = function() {
        return this.tap(function(k) { for (var x in k) delete k[x] }, true)}
    cp.into = function(target, f) {
        return this.tap(function() {
            var k = this._keystore
            this._keystore = k._set(target, KeyStore(null, k))
            f.apply(this, arguments)
            this._keystore = k })}
    cp.addData = function(buffer) {
        cp._buffer.addData(buffer)
        return cp.run() }
    if (buffer) cp.addData(buffer)
    return cp }

function StreamParser(stream, data_cbname, prototype, keystore_proto) {
    var p = Parser(null, prototype, keystore_proto)
    stream.on(data_cbname || 'data', p.addData)
    return p }

if (module && module.exports) {
    module.exports = Parser
    module.exports.Stream = StreamParser
    module.exports.BufferList = BufferList }

