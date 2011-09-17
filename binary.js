var ChainProvider = require('./chainprovider.js')

var Chain_Binary = Object.create(ChainProvider.prototype)

// add functions for binary parsing
// thank you https://github.com/substack/node-binary/blob/master/index.js#L308
;(function() {
// convert byte strings to unsigned little endian numbers
function decodeLEu(bytes) {
    var acc = 0
    for (var i = 0; i < bytes.length; i++)
        acc |= bytes[i] << (8 * i)
    return acc }

// convert byte strings to unsigned big endian numbers
function decodeBEu(bytes) {
    var acc = 0
    for (var i = 0; i < bytes.length; i++)
        acc |= bytes[i] << (8 * (bytes.length - i - 1))
    return acc }

// convert byte strings to signed big endian numbers
function decodeBEs(bytes) {
    var val = decodeBEu(bytes)
    if (bytes[0] & 0x80) val -= 1 << bytes.length
    return val }

// convert byte strings to signed little endian numbers
function decodeLEs(bytes) {
    var val = decodeLEu(bytes)
    if (bytes[bytes.length - 1] & 0x80) val -= 1 << bytes.length
    return val }

function decode(bytes, fun) {
    return function(into) {
        this.tap(function(keystore, buffer) {
            keystore[into] = fun(buffer.getbytes(bytes)) }
          , function(k, b) { return b.bytes >= bytes }, true)
        return this }}

[1, 2, 3, 4, 5, 6, 7, 8].forEach(function(bytes) {
        var bits = bytes * 8
        var s = Chain_Binary
        s['word' + bits + 'le'] =
            s['word' + bits + 'lu'] = decode(bytes, decodeLEu);
        s['word' + bits + 'ls'] = decode(bytes, decodeLEs)
        s['word' + bits + 'be'] = 
            s['word' + bits + 'bu'] = decode(bytes, decodeBEu)
        s['word' + bits + 'bs'] = decode(bytes, decodeBEs)
        s.word8 = s.word8u = s.word8be
        s.word8s = s.word8bs })
})()

if (module && module.exports) {
    module.exports = Chain_Binary }

