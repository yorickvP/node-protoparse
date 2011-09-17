var ChainProvider = require('./chainprovider.js')

var Chain_Binary = Object.create(ChainProvider.prototype)

;(function(x) { for (var i in x) Chain_Binary[i] = x[i] })(
  { word8: function(into) {
        this.tap(function readWord8   (keystore, buffer) {
            keystore[into] = buffer.getbytes(1)
        }, function(k, b) { return b.bytes >= 1 }, true)
        return this }
  , word16le: function(into) {
        this.tap(function readWord16le(keystore, buffer) {
            var bytes = buffer.getbytes(2)
            keystore[into] = bytes[0] | (bytes[1] << 16)
        }, function(k, b) { return b.bytes >= 2 }, true)
        return this }
  , word16be: function(into) {
        this.tap(function readWord16be(keystore, buffer) {
            var bytes = buffer.getbytes(2)
            keystore[into] = bytes[1] | (bytes[0] << 16)
        }, function(k, b) { return b.bytes >= 2 }, true)
        return this }
  })

if (module && module.exports) {
    module.exports = Chain_Binary }

