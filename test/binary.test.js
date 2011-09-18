var Parser = require('../');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

exports.fromBuffer = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    Parser(new Buffer([ 97, 98, 99 ]))
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, { a : 97, bc : 25187 });
            test.finish();
        })
        .run()
    ;
};

exports.dots = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    Parser(new Buffer([ 97, 98, 99, 100, 101, 102 ]))
        .word8('a')
        .word16be('b.x')
        .word16be('b.y')
        .word8('b.z')
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, {
                a : 97,
                b : {
                    x : 256 * 98 + 99,
                    y : 256 * 100 + 101,
                    z : 102
                },
            });
            test.finish();
        })
        .run()
    ;
};

exports.flush = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    Parser(new Buffer([ 97, 98, 99, 100, 101, 102 ]))
        .word8('a')
        .word16be('b')
        .word16be('c')
        .flush()
        .word8('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, { d : 102 });
            test.finish();
        })
        .run()
    ;
};

exports.immediate = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    var em = new EventEmitter;
    Parser.Stream(em, 'moo')
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, { a : 97, bc : 25187 });
            test.finish();
        })
    ;
    
    em.emit('moo', new Buffer([ 97, 98, 99 ]));
};

exports.deferred = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    var em = new EventEmitter;
    Parser.Stream(em)
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, { a : 97, bc : 25187 });
            test.finish();
        })
    ;
    
    setTimeout(function () {
        em.emit('data', new Buffer([ 97, 98, 99 ]));
    }, 10);
};

exports.split = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    var em = new EventEmitter;
    Parser.Stream(em)
        .word8('a')
        .word16be('bc')
        .word32ls('x')
        .word32bs('y')
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, { // for some reason this fails sometimes
                a : 97,              // I blame the timeouts
                bc : 25187,
                x : 621609828,
                y : 621609828,
            });
            test.finish();
        })
    ;
    
    em.emit('data', new Buffer([ 97, 98 ]));
    setTimeout(function () {
        em.emit('data', new Buffer([ 99, 100 ]));
    }, 25);
    setTimeout(function () {
        em.emit('data', new Buffer([ 3, 13, 37, 37 ]));
    }, 50);
    setTimeout(function () {
        em.emit('data', new Buffer([ 13, 3, 100 ]));
    }, 75);
};

exports.posls = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    // note: can't store 12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        30, // a == -30
        37, 9, // b == -2341
        20, 10, 12, 0, // c == -789012
        193, 203, 33, 239, 52, 1, 45, 0, // d == 12667700813876161
    ]);
    
    Parser(buf)
        .word8ls('a')
        .word16ls('b')
        .word32ls('c')
        .word64ls('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 30);
            assert.equal(vars.b, 2341);
            assert.equal(vars.c, 789012);
            assert.ok(
                Math.abs(vars.d - 12667700813876161) < 1000
            );
            test.finish();
        })
        .run()
    ;
};

exports.negls = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        226, // a == -30
        219, 246, // b == -2341
        236, 245, 243, 255, // c == -789012
        63, 52, 222, 16, 203, 254, 210, 255, // d == -12667700813876161
    ]);
    
    Parser(buf)
        .word8ls('a')
        .word16ls('b')
        .word32ls('c')
        .word64ls('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, -30);
            assert.equal(vars.b, -2341);
            assert.equal(vars.c, -789012);
            assert.ok(
                Math.abs(vars.d - -12667700813876161) < 1000
            );
            test.finish();
        })
        .run()
    ;
};

exports.posbs = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    // note: can't store 12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        30, // a == -30
        9, 37, // b == -2341
        0, 12, 10, 20, // c == -789012
        0, 45, 1, 52, 239, 33, 203, 193, // d == 12667700813876161
    ]);
    
    Parser(buf)
        .word8bs('a')
        .word16bs('b')
        .word32bs('c')
        .word64bs('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 30);
            assert.equal(vars.b, 2341);
            assert.equal(vars.c, 789012);
            assert.ok(
                Math.abs(vars.d - 12667700813876161) < 1000
            );
            test.finish();
        })
        .run()
    ;
};

exports.negbs = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        226, // a == -30
        246, 219, // b == -2341
        255, 243, 245, 236, // c == -789012
        255, 210, 254, 203, 16, 222, 52, 63, // d == -12667700813876161
    ]);
    
    Parser(buf)
        .word8bs('a')
        .word16bs('b')
        .word32bs('c')
        .word64bs('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, -30);
            assert.equal(vars.b, -2341);
            assert.equal(vars.c, -789012);
            assert.ok(
                Math.abs(vars.d - -12667700813876161) < 1500
            );
            test.finish();
        })
        .run()
    ;
};

exports.lu = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        44, // a == 44
        43, 2, // b == 555
        37, 37, 213, 164, // c == 2765432101
        193, 203, 115, 155, 20, 180, 81, 29, // d == 2112667700813876161
    ]);
    
    Parser(buf)
        .word8lu('a')
        .word16lu('b')
        .word32lu('c')
        .word64lu('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 44);
            assert.equal(vars.b, 555);
            assert.equal(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
        })
        .run()
    ;
    
    // also check aliases here:
    Parser(buf)
        .word8le('a')
        .word16le('b')
        .word32le('c')
        .word64le('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 44);
            assert.equal(vars.b, 555);
            assert.equal(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
            test.finish()
        })
        .run()
    ;
};

exports.bu = function (test) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 500);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        44, // a == 44
        2, 43, // b == 555
        164, 213, 37, 37, // c == 2765432101
        29, 81, 180, 20, 155, 115, 203, 193, // d == 2112667700813876161
    ]);
    
    Parser(buf)
        .word8bu('a')
        .word16bu('b')
        .word32bu('c')
        .word64bu('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 44);
            assert.equal(vars.b, 555);
            assert.equal(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
        })
        .run()
    ;
    
    // also check aliases here:
    Parser(buf)
        .word8be('a')
        .word16be('b')
        .word32be('c')
        .word64be('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 44);
            assert.equal(vars.b, 555);
            assert.equal(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
            test.finish();
        })
        .run()
    ;
};

exports.loop = function (test) {
    var em = new EventEmitter;
    var times = 0;
    var to = setTimeout(function () {
        assert.fail('loop never terminated');
    }, 500);
    
    Parser.Stream(em)
        .loop(function(end) {
            var a = this._queue
            this.word16lu('a')
                .word8u('b')
                .word8s('c')
                .tap(function(vars) {
                    times++
                    if (vars.c < 0) end()
                }, true)
        })
        .tap(function (vars) {
            clearTimeout(to);
            assert.deepEqual(vars, { a : 1337, b : 55, c : -5 });
            assert.equal(times, 4);
            test.finish()
        })
    ;
    
    setTimeout(function () {
        em.emit('data', new Buffer([ 2, 10, 88 ]));
    }, 25);
    setTimeout(function () {
        em.emit('data', new Buffer([ 100, 3, 6, 242, 30 ]));
    }, 50);
    setTimeout(function () {
        em.emit('data', new Buffer([ 60, 60, 199, 44 ]));
    }, 75);
    
    setTimeout(function () {
        em.emit('data', new Buffer([ 57, 5 ]));
    }, 100);
    setTimeout(function () {
        em.emit('data', new Buffer([ 55, 251 ]));
    }, 125);
};


exports.loopscan = function (test) {
    var em = new EventEmitter;
    var times = 0;
    var to = setTimeout(function () {
        assert.fail('loop never terminated');
    }, 500);

    Parser.Stream(em)
        .loop(function (end) {
            this
                .scan('filler', 'BEGINMSG')
                .buffer('cmd', 3)
                .word8('num')
                .tap(function (vars) {
                    if (vars.num != 0x02 && vars.num != 0x06) {
                        assert.equal(vars.filler.length, 0);
                    }
                    times ++;
                    if (vars.cmd.toString('ascii') == 'end') end();
                })
            ;
        })
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.cmd.toString('ascii'), 'end');
			assert.equal(vars.num, 0x08);
            assert.equal(times, 8);
            test.finish();
        })
    ;

    setTimeout(function () {
        em.emit('data', new Buffer("BEGINMSGcmd\x01" +
                                   "GARBAGEDATAXXXX" +
                                   "BEGINMSGcmd\x02" +
                                   "BEGINMSGcmd\x03", 'ascii'));
    }, 10);

    setTimeout(function () {
        em.emit('data', new Buffer("BEGINMSGcmd\x04" +
                                   "BEGINMSGcmd\x05" +
                                   "GARBAGEDATAXXXX" +
                                   "BEGINMSGcmd\x06", 'ascii'));
        em.emit('data', new Buffer("BEGINMSGcmd\x07", 'ascii'));
    }, 40);

    setTimeout(function () {
        em.emit('data', new Buffer("BEGINMSGend\x08", 'ascii'));
    }, 70);
};

exports.getBuffer = function (test) {
    var t1 = setTimeout(function () {
        assert.fail('first buffer never finished');
    }, 20);
    
    var t2 = setTimeout(function () {
        assert.fail('second buffer never finished');
    }, 20);
    
    var buf = new Buffer([ 4, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]);
    Parser(buf)
        .word8('a')
        .buffer('b', 7)
        .word16lu('c')
        .tap(function (vars) {
            clearTimeout(t1);
            assert.deepEqual(vars, {
                a : 4, 
                b : new Buffer([ 2, 3, 4, 5, 6, 7, 8 ]),
                c : 2569,
            });
        })
        .buffer('d', 'a')
        .tap(function (vars) {
            clearTimeout(t2);
            assert.deepEqual(vars.d, new Buffer([ 11, 12, 13, 14 ]));
            test.finish();
        })
        .run()
    ;
};

exports.interval = function (test) {
    var to = setTimeout(function () {
        assert.fail('loop populated by interval never finished');
    }, 5000);
    
    var em = new EventEmitter;
    var i = 0;
    var iv = setInterval(function () {
        var buf = new Buffer(1000);
        buf[0] = 0xff;
        if (++i >= 1000) {
            clearInterval(iv);
            buf[0] = 0;
        }
        em.emit('data', buf);
    }, 1);
    
    var loops = 0;
    Parser.Stream(em)
        .loop(function (end) {
            this
            .word8('x')
            .word8('y')
            .word32be('z')
            .word32le('w')
            .buffer('buf', 1000 - 10)
            .tap(function (vars) {
                loops ++;
                if (vars.x == 0) end();
            })
        })
        .tap(function () {
            clearTimeout(to);
            assert.equal(loops, 1000);
            test.finish();
        })
    ;
};

exports.skip = function (test) {
    var to = setTimeout(function () {
        assert.fail('Never finished');
    }, 1000);
    
    var em = new EventEmitter;
    var state = 0;
    
    Parser.Stream(em)
        .word16lu('a')
        .tap(function () { state = 1 })
        .skip(7)
        .tap(function () { state = 2 })
        .word8('b')
        .tap(function () { state = 3 })
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(state, 3);
            assert.deepEqual(vars, {
                a : 2569,
                b : 8,
            });
            test.finish()
        })
    ;
    
    // the original used Seq. this should work too :)
    function Step() { var i = 0, a = arguments
        return function next() { a[i++].apply(next, arguments) }() }
    
    Step(
        function() { setTimeout(this, 20); },
        function () {
            assert.deepEqual(state, 0);
            em.emit('data', new Buffer([ 9 ]));
            this();
        },
        function() { setTimeout(this, 5); },
        function () {
            assert.deepEqual(state, 0);
            em.emit('data', new Buffer([ 10, 1, 2 ]));
            this();
        },
        function() { setTimeout(this, 30); },
        function () {
            assert.deepEqual(state, 1);
            em.emit('data', new Buffer([ 3, 4, 5 ]));
            this();
        },
        function() { setTimeout(this, 15); },
        function () {
            assert.deepEqual(state, 1);
            em.emit('data', new Buffer([ 6, 7 ]));
            this();
        },
        function () {
            assert.deepEqual(state, 2);
            em.emit('data', new Buffer([ 8 ]));
        });
};

exports.scan = function (test) {
    var to = setTimeout(function () {
        assert.fail('Never finished');
    }, 1000);
    
    var em = new EventEmitter;
    Parser.Stream(em)
        .word8('a')
        .scan('l1', new Buffer('\r\n'))
        .scan('l2', '\r\n')
        .word8('z')
        .tap(function (vars) {
            clearTimeout(to);
            assert.equal(vars.a, 99);
            assert.equal(vars.l1.toString(), 'foo bar');
            assert.equal(vars.l2.toString(), 'baz');
            assert.equal(vars.z, 42);
            test.finish()
        })
    ;
    
    setTimeout(function () {
        em.emit('data', new Buffer([99,0x66,0x6f,0x6f,0x20]));
    }, 20);
    
    setTimeout(function () {
        em.emit('data', new Buffer('bar\r'));
    }, 40);
    
    setTimeout(function () {
        em.emit('data', new Buffer('\nbaz\r\n*'));
    }, 60);
};

exports.scanBuf = function (test) {
    Parser(new Buffer('\x63foo bar\r\nbaz\r\n*'))
        .word8('a')
        .scan('l1', new Buffer('\r\n'))
        .scan('l2', '\r\n')
        .word8('z')
        .tap(function(vars) {
            assert.equal(vars.a, 99);
            assert.equal(vars.z, 42);
            assert.equal(vars.l1.toString(), 'foo bar');
            assert.equal(vars.l2.toString(), 'baz');
            test.finish()
        })
        .run()
    ;
};

//exports.scanBufNull = function (test) {
//    var vars = Binary(new Buffer('\x63foo bar baz'))
//        .word8('a')
//        .scan('b', '\r\n')
//        .word8('c')
//        .vars
//    ;
//    
//    assert.deepEqual(vars.a, 99);
//    assert.deepEqual(vars.b.toString(), 'foo bar baz');
//    assert.ok(vars.c === null);
//};

//exports.notEnoughParse = function (test) {
//    var vars = Binary(new Buffer([1,2]))
//        .word8('a')
//        .word8('b')
//        .word8('c')
//        .word8('d')
//        .vars
//    ;
//    
//    assert.deepEqual(vars.a, 1);
//    assert.deepEqual(vars.b, 2);
//    assert.ok(vars.c === null);
//    assert.ok(vars.d === null);
//};

//exports.notEnoughBuf = function (test) {
//    var vars = Binary(new Buffer([1,2,3,4]))
//        .word8('a')
//        .buffer('b', 10)
//        .word8('c')
//        .vars
//    ;
//    
//    assert.deepEqual(vars.a, 1);
//    assert.deepEqual(vars.b, new Buffer([2,3,4]));
//    assert.ok(vars.c === null);
//};

exports.nested = function (test) {
    var to = setTimeout(function () {
        assert.fail('never finished');
    }, 500);
    
    var insideDone = false;
    
    var em = new EventEmitter;
    Parser.Stream(em)
        .word16be('ab')
        .tap(function () {
            this
                .word8('c')
                .word8('d')
                .tap(function () {
                    insideDone = true;
                })
            ;
        })
        .tap(function (vars) {
            assert.ok(insideDone);
            assert.deepEqual(vars.c, 'c'.charCodeAt(0));
            assert.deepEqual(vars.d, 'd'.charCodeAt(0));
            
            clearTimeout(to);
            test.finish();
        })
    ;
    
    var strs = [ 'abc', 'def', 'hi', 'jkl' ];
    var iv = setInterval(function () {
        var s = strs.shift();
        if (s) em.emit('data', new Buffer(s));
        else clearInterval(iv);
    }, 50);
};

exports.intoBuffer = function (test) {
    var to = setTimeout(function () {
        assert.fail('never finished');
    }, 500);
    
    var buf = new Buffer([ 1, 2, 3, 4, 5, 6 ])
    
    Parser(buf)
        .into('moo', function () {
            this.word8('x')
                .word8('y')
                .word8('z')
            ;
        })
        .tap(function (vars) {
            assert.deepEqual(vars, { moo : { x : 1, y : 2, z : 3 } });
        })
        .word8('w')
        .tap(function (vars) {
            assert.deepEqual(vars, {
                moo : { x : 1, y : 2, z : 3 },
                w : 4,
            });
        })
        .word8('x')
        .tap(function (vars) {
            assert.deepEqual(vars, {
                moo : { x : 1, y : 2, z : 3 },
                w : 4,
                x : 5,
            });
            test.finish();
            clearTimeout(to);
        })
        .run()
    ;
}

exports.intoStream = function (test) {
    var to = setTimeout(function () {
        assert.fail('never finished');
    }, 500);
    
    var digits = [ 1, 2, 3, 4, 5, 6 ];
    var stream = new EventEmitter;
    var iv = setInterval(function () {
        var d = digits.shift();
        if (d) stream.emit('data', new Buffer([ d ]))
        else clearInterval(iv)
    }, 20);
    
    Parser.Stream(stream)
        .into('moo', function () {
            this.word8('x')
                .word8('y')
                .word8('z')
            ;
        })
        .tap(function (vars) {
            assert.deepEqual(vars, { moo : { x : 1, y : 2, z : 3 } });
        })
        .word8('w')
        .tap(function (vars) {
            assert.deepEqual(vars, {
                moo : { x : 1, y : 2, z : 3 },
                w : 4,
            });
        })
        .word8('x')
        .tap(function (vars) {
            assert.deepEqual(vars, {
                moo : { x : 1, y : 2, z : 3 },
                w : 4,
                x : 5,
            });
            clearTimeout(to);
            test.finish();
        })
    ;
};

exports.stop = function (test) {
    var to = setTimeout(function() {
        assert.fail('never finished');
    }, 500);
    
    var buf = new Buffer([ 1, 2, 3, 4, 5, 6 ])

    Parser(buf)
        .into('moo', function () {
            this.word8('x')
                .word8('y')
                .word8('z')
            ;
        })
        .tap(function (vars) {
            assert.deepEqual(vars, { moo : { x : 1, y : 2, z : 3 } });
        })
        .word8('w')
        .tap(function (vars) {
            assert.deepEqual(vars, {
                moo : { x : 1, y : 2, z : 3 },
                w : 4,
            });
            this.stop();
            clearTimeout(to);
            test.finish();
        })
        .word8('x')
        .tap(function (vars) {
            assert.deepEqual(vars, {
                moo : { x : 1, y : 2, z : 3 },
                w : 4,
                x : 5,
            });
            assert.fail("parsing continued");
        })
        .run()
    ;
}

//exports.peek = function (test) {
//    var to = setTimeout(function () {
//        assert.fail('never finished');
//    }, 500);
//    
//    var bufs = [
//        new Buffer([ 6, 1, 6, 1, 6, 9, 0, 0, 0, 97 ]),
//        new Buffer([ 98, 99 ]),
//        new Buffer([ 100, 101, 102 ]),
//    ];
//    
//    var stream = new EventEmitter;
//    var iv = setInterval(function () {
//        var buf = bufs.shift();
//        if (buf) stream.emit('data', buf)
//        else clearInterval(iv)
//    }, 20);
//    
//    Binary.stream(stream)
//        .buffer('sixone', 5)
//        .peek(function () {
//            this.word32le('len');
//        })
//        .buffer('buf', 'len')
//        .word8('x')
//        .tap(function (vars) {
//            clearTimeout(to);
//            assert.deepEqual(vars.sixone, new Buffer([ 6, 1, 6, 1, 6 ]));
//            assert.deepEqual(vars.buf.length, vars.len);
//            assert.deepEqual(
//                [].slice.call(vars.buf),
//                [ 9, 0, 0, 0, 97, 98, 99, 100, 101 ]
//            );
//            assert.deepEqual(vars.x, 102);
//        })
//    ;
//};

