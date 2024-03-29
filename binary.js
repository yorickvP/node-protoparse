/* ----------------------------------------------------------------------------
Copyright (c) YorickvP (contact me on github if you want)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * ---------------------------------------------------------------------------*/
var ChainProvider = require('./chainprovider.js')
var    BufferList = require('./bufferlist.js')

var Chain_Binary = Object.create(ChainProvider.prototype)

Chain_Binary.skip = function(no_bytes) {
    return this.tap(function(k, b) { b.getbytes(no_bytes) }, true,
                    function(k, b) { return b.bytes >= no_bytes }) }

Chain_Binary.buffer = function(target, n) {
    return this.tap(function(k, b) {
        k._set(target, b.getbuffer((typeof n == 'string') ? k._get(n) : n)) }, true,
        function(k, b) { return b.bytes >= ((typeof n == 'string') ? k._get(n) : n) }) }
        
Chain_Binary.scan = function(target, needle) {
    //var out = BufferList()
    if (typeof needle == 'string') needle = Buffer(needle)
    return this.tap(function(k, b) {
        var pos = b.indexOf(needle)
        if (pos != -1) { 
            k._set(target, b.getbuffer(pos))
            b.getbytes(needle.length) }
    }, true, function(k, b) { return b.indexOf(needle) != -1 }) }
//    return this.loop(function(end) {
//        this.tap(function(k, b) {
//        var pos = b.indexOf(needle)
//        console.log(b, pos)
//        if (pos > 0) out.addData(b.getbuffer(pos)) // todo: make it able to return a BufferList
//        if (pos >= 0) {
//            k._set(target, out.getbuffer(out.bytes))
//            end() }
//        else out.addData(b.getbuffer(b.bytes)) }, function(k, b) {return b.bytes > 0})})}

// add functions for binary parsing
// thank you https://github.com/substack/node-binary/blob/master/index.js#L308
// converting Math.pow to << fails on larger numbers. don't do it ;)
;(function() {
// convert byte strings to unsigned little endian numbers
function decodeLEu(bytes) {
    var acc = 0
    for (var i = 0; i < bytes.length; i++)
        acc += bytes[i] * Math.pow(256,i)
    return acc }

// convert byte strings to unsigned big endian numbers
function decodeBEu(bytes) {
    var acc = 0
    for (var i = 0; i < bytes.length; i++)
        acc += Math.pow(256, bytes.length - i - 1) * bytes[i]
    return acc }

// convert byte strings to signed big endian numbers
function decodeBEs(bytes) {
    var val = decodeBEu(bytes)
    if (bytes[0] & 0x80) val -= Math.pow(256, bytes.length)
    return val }

// convert byte strings to signed little endian numbers
function decodeLEs(bytes) {
    var val = decodeLEu(bytes)
    if (bytes[bytes.length - 1] & 0x80) val -= Math.pow(256, bytes.length)
    return val }

function decode(bytes, fun) {
    return function(into) {
        this.tap(function(keystore, buffer) {
            keystore._set(into, fun(buffer.getbytes(bytes))) }, true
          , function(k, b) { return b.bytes >= bytes })
        return this }}

;[1, 2, 3, 4, 5, 6, 7, 8].forEach(function(bytes) {
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

