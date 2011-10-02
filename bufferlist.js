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
function BufferList() {
    var bl = []
    bl.bytes = 0
    for (var k in BufferList.prototype) bl[k] = BufferList.prototype[k]
    return bl }
    
BufferList.prototype.addData = function(buffer) {
    this.bytes += buffer.length
    this.push(buffer) }
BufferList.prototype.getbytes = function(n) {
    if (this.bytes < n) return
    this.bytes -= n
    var ret = []
    while(ret.length < n) {
        var toRead = n - ret.length
        ret = ret.concat(Array.prototype.slice.call(this[0], 0, toRead))
        if (this[0].length <= toRead) this.shift()
        else this[0] = this[0].slice(toRead) }
    return ret }
BufferList.prototype.getbuffer = function(n) {
    if (this.bytes < n) return
    this.bytes -= n
    var ret = Buffer(n)
    var cursize = 0
    while(cursize < n) {
        var toRead = n - cursize
        var actualread = Math.min(this[0].length, toRead)
        this[0].copy(ret, cursize, 0, actualread)
        cursize += actualread
        if (this[0].length == actualread) this.shift()
        else this[0] = this[0].slice(actualread) }
    return ret }

// big thanks to James Halliday aka substack
// I asked him permission in IRC. He hasn't responded yet
// https://github.com/substack/node-buffers/blob/master/index.js
BufferList.prototype.indexOf = function(needle) {
    if (typeof needle === "string") needle = new Buffer(needle)
    if (!needle.length) return 0
    if (!this.length) return -1
    var i = 0, j = 0
      , match = 0, mstart, pos = 0

    for (;;) { // for each character in virtual buffer
        while (j >= this[i].length) {
            j = 0
            i++

            // search string not found
            if (i >= this.length) return -1 }
        var chr = this[i][j]
        if (chr == needle[match]) {
            // keep track where match started
            if (match == 0) {
                mstart = 
                  { i: i
                  , j: j
                  , pos: pos }}
            match++

            // full match
            if (match == needle.length) return mstart.pos }
        else if (match != 0) {
            // a partial match ended, go back to match starting position
            // this will continue the search at the next character
            i = mstart.i
            j = mstart.j
            pos = mstart.pos
            match = 0 }
        j++
        pos++ }}

if (module && module.exports) {
    module.exports = BufferList }


