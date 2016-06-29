/*
 *  Making a copy of a plain buffer with Ecmascript code (example in guide).
 */

// FIXME: check guide

/*@include util-buffer.js@*/

/*---
{
    "custom": true
}
---*/

/*===
object [object ArrayBuffer] ABCD
object [object ArrayBuffer] ABCD
false
buf: ABCD
copy: XBCD
===*/

function bufferCopyTest() {
    var buf = Duktape.dec('hex', '41424344');  // ABCD
    print(typeof buf, buf, bufferToString(buf));

    // Plain buffer mimics ArrayBuffer so use .slice() to create a copy.
    // FIXME: Object(buf) now needed for .slice() to work; also, copy is
    // a full ArrayBuffer rather than a plain buffer.  So use Duktape.Buffer()
    // to get the plain buffer.
    // XXX: to be changed with Duktape.Buffer removal.

    var copy = Duktape.Buffer(Object(buf).slice());
    print(typeof copy, copy, bufferToString(buf));
    print(copy === buf);

    // Demonstrate independence
    copy[0] = ('X').charCodeAt(0);
    print('buf:', bufferToString(buf));
    print('copy:', bufferToString(copy));
}

try {
    bufferCopyTest();
} catch (e) {
    print(e.stack || e);
}
