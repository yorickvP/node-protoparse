var StreamParser = require('../parser.js')
var assert = require('assert')

module.exports = {
    setup: function(test) {
        test.parser = StreamParser()
        test.buffer = Buffer([0x2a, 0x2b, 0x80, 0x01])
    },
    'basic word8s': function(test) {
        test.parser.word8('first')
                   .word8('second')
                   .word8('third')
                   .word8('fourth')
                   .tap(function(keystore) {
                       assert.equal(keystore.first, 42)
                       assert.equal(keystore.second, 43)
                       assert.equal(keystore.third, 128)
                       assert.equal(keystore.fourth, 1)
                       test.finish()
                   })
        test.parser.addData(test.buffer)
    },
    'nested stuff': function(test) {
        test.parser.word8('first')
                   .tap(function(keystore) {
                       this.word8('second')
                           .word8('third')
                   })
                   .word8('fourth')
                   .tap(function(keystore) {
                       assert.equal(keystore.first, 42)
                       assert.equal(keystore.second, 43)
                       assert.equal(keystore.third, 128)
                       assert.equal(keystore.fourth, 1)
                       test.finish()
                   })
        test.parser.addData(test.buffer)
    }
}

