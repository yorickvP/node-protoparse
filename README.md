Protoparse
==========

Protoparse (short for protocol parser because my name creativity isn't so good) allows you to unpack binary data (and normal data) from streams and buffers.

Much like [substacks node-binary](https://github.com/substack/node-binary "github repository for substacks node-binary") (it even uses some code),
but with a focus on *speed, stability and extensibility*.

Examples
========

Streams
-------

    var Parser = require('protoparse')
    var stdin = process.openStdin()
    
    Parser.Stream(stdin)
          .word32lu('x')
          .word16bs('y')
          .word16bu('z')
          .tap(function(vars) {
              console.dir(vars)
          })

Buffers
-------

    var Parser = require('protoparse')
    var buffer = Buffer([ 97, 98, 99, 100, 101, 102, 0 ])
    Parser(buffer)
        .word16ls('ab')
        .word32bu('cf')
        .word8('x')
        .tap(function(vars) {
            console.dir(vars)
        })
        .run()

Note that the buffer parser requires a run() call, because I'm too lazy to implement it properly :)

Extensibility
=============

After working with node-binary for a while, one of the things that kept bothering me was the lack of ability
to add my own methods. Needless to say, this has been one of my main goals when writing this.

    var Parser = require('protoparse')
    var BinaryChainProvider = require('protoparse/binary.js')
    
    var MyOwnProtocolChainMaker = Object.create(BinaryChainProvider)
    MyOwnProtocolChainMaker.myCustomHandshake = function() {
        return this.word16bu('packettype')
                   .tap(function(vars) {
                       if (vars.packettype == 2)
                        this.word8('strlen')
                            .buffer('name', 'strlen')
                       else this.word32bs('money')
                   }
    }
    
    Parser.Stream(stream, callbackname, MyOwnProtocolChainMaker)
          .myCustomHandshake()
          
    var p = Parser(null, MyOwnProtocolChainMaker)
    stream.on('data', p.addData)

Methods
=======

For the available methods, see binary.js. Internally used methods are also in other files.

Todo
====

Lots of things are still missing, including (in no particular order):
 *   The ability for my bufferlist to return new bufferlists (for use with scan)
 *   .into(). This would require less independence between ChainProvider and Parser, I think.
    .word8('stuff.other.stuff') is supported though.
 *   Proper support for reading from buffers (including cutoff)
 *   Stream ending. That could be important. (the ability to stop parsing).
     Can't use .end() though, node-bufferlist used to use that as a .run() method,
     so it might confuse people. Maybe .stop().
 *   More documentation and profiling.
 *   More tests
 *   Use the binary API that was added to buffers around node.js 0.5
 *   Also floats without that API.
 *   Don't slice the buffer every time bytes are needed. Rather keep an offset and work with that,
     and discard the entire thing when it's depleted.

Bugs
====

 *   .scan() is not as fast as it could/should be.
 *   .loop() is hard to do without recursing (nesting every iteration), using more memory on each iteration.
     I made an attempt at fixing that, but I'm not sure if it completely fixed it.

Notes
=====

The word64 functions will only return approximations since javascript uses ieee
floating point for all number types. Mind the loss of precision.

