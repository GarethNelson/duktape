/*
 *  Plain buffer values behave like ArrayBuffers for Ecmascript code in
 *  Duktape 2.x.
 */

/*@include util-buffer.js@*/

/*---
{
    "custom": true
}
---*/

function createPlain() {
    var pb = Duktape.Buffer(16);
    for (var i = 0; i < 16; i++) {
        pb[i] = 0x61 + i;
    }
    return pb;
}

function createArrayBuffer() {
    var ab = new ArrayBuffer(16);
    for (var i = 0; i < 16; i++) {
        ab[i] = 0x61 + i;
    }
    return ab;
}

/*===
basic test
object
object
[object ArrayBuffer]
[object ArrayBuffer]
true
true
===*/

function basicTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();

    // typeof
    print(typeof pb);  // 'buffer' in Duktape 1.x, 'object' in Duktape 2.x
    print(typeof ab);  // 'object'

    // class name in Object.prototype.toString()
    print(Object.prototype.toString.call(pb));  // '[object Buffer]' in Duktape 1.x, '[object ArrayBuffer]' in Duktape 2.x
    print(Object.prototype.toString.call(ab));  // '[object ArrayBuffer]'

    // instanceof
    print(pb instanceof ArrayBuffer);
    print(ab instanceof ArrayBuffer);
}

/*===
property test
16
16
16
16
0
0
1
1
undefined
undefined
97
97
===*/

function propertyTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();

    // ArrayBuffer virtual properties
    print(pb.length);
    print(ab.length);
    print(pb.byteLength);
    print(ab.byteLength);
    print(pb.byteOffset);
    print(ab.byteOffset);
    print(pb.BYTES_PER_ELEMENT);
    print(ab.BYTES_PER_ELEMENT);
    print(pb.buffer);  // not present
    print(ab.buffer);  // not present
    print(pb[0]);
    print(ab[0]);
}

/*===
enumeration test
for-in plain
for-in object
for-in plain
myEnumerable
for-in object
myEnumerable
Object.keys plain
Object.keys object
Object.keys plain
Object.keys object
Object.getOwnPropertyNames plain
0
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
length
byteLength
byteOffset
BYTES_PER_ELEMENT
Object.getOwnPropertyNames object
0
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
length
byteLength
byteOffset
BYTES_PER_ELEMENT
===*/

function enumerationTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();
    var k;

    // No enumerable properties by default.

    print('for-in plain');
    for (k in pb) {
        print(k);
    }
    print('for-in object');
    for (k in ab) {
        print(k);
    }

    // Add enumerable inherited property.

    ArrayBuffer.prototype.myEnumerable = 1;
    print('for-in plain');
    for (k in pb) {
        print(k);
    }
    print('for-in object');
    for (k in ab) {
        print(k);
    }
    delete ArrayBuffer.prototype.myEnumerable;

    // Object.keys() will include only own enumerable keys.

    print('Object.keys plain');
    Object.keys(pb).forEach(function (k) {
        print(k);
    });
    print('Object.keys object');
    Object.keys(ab).forEach(function (k) {
        print(k);
    });

    // Inherited properties not included.

    ArrayBuffer.prototype.myEnumerable = 1;
    print('Object.keys plain');
    Object.keys(pb).forEach(function (k) {
        print(k);
    });
    print('Object.keys object');
    Object.keys(ab).forEach(function (k) {
        print(k);
    });
    delete ArrayBuffer.prototype.myEnumerable;

    // Object.getOwnPropertyNames() will include all own properties,
    // including non-enumerable ones.

    print('Object.getOwnPropertyNames plain');
    Object.getOwnPropertyNames(pb).forEach(function (k) {
        print(k);
    });
    print('Object.getOwnPropertyNames object');
    Object.getOwnPropertyNames(ab).forEach(function (k) {
        print(k);
    });
}

/*===
read/write coercion test
-1234 46 46
-256 0 0
-255 1 1
-1.6 255 255
-1.4 255 255
-1 255 255
-0.6 0 0
-0.4 0 0
-0 0 0
0 0 0
0.4 0 0
0.6 0 0
1 1 1
1.4 1 1
1.6 1 1
255 255 255
256 0 0
1234 210 210
NaN 0 0
Infinity 0 0
-Infinity 0 0
"123" 123 123
"130" 130 130
"-123" 133 133
"-130" 126 126
===*/

function readWriteCoercionTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();

    [
      -1234, -256, -255, -1.6, -1.4, -1, -0.6, -0.4, -0,
      +0, 0.4, 0.6, 1, 1.4, 1.6, 255, 256, 1234,
      0/0, 1/0, -1/0, '123', '130', '-123', '-130'
    ].forEach(function (v) {
        pb[0] = v;
        ab[0] = v;
        print(Duktape.enc('jx', v), Duktape.enc('jx', pb[0]), Duktape.enc('jx', ab[0]));
    });
}

/*===
operator test
[object ArrayBuffer][object ArrayBuffer]
[object ArrayBuffer][object ArrayBuffer]
false
false
true
true
false
false
true
true
string "length" true true
string "byteLength" true true
string "byteOffset" true true
string "BYTES_PER_ELEMENT" true true
number -1 false false
number 0 true true
number 15 true true
number 16 false false
string "15" true true
string "16" false false
string "15.0" false false
===*/

function operatorTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();

    // '+' operator
    print(pb + pb);  // 'abcdefghijklmnopabcdefghijklmnop' in Duktape 1.x, '[object ArrayBuffer][object ArrayBuffer]' in Duktape 2.x
    print(ab + ab);  // '[object ArrayBuffer][object ArrayBuffer]'

    // equality comparison: no content comparison in Duktape 2.x when
    // comparing plain buffers using '==' (or '==='), all comparisons
    // are now reference based
    print(createPlain() == createPlain());
    print(createPlain() === createPlain());
    print(pb == pb);
    print(pb === pb);
    print(createArrayBuffer() == createArrayBuffer());
    print(createArrayBuffer() === createArrayBuffer());
    print(ab == ab);
    print(ab === ab);

    // FIXME: compare buffer to number -""-
    // FIXME: compare buffer to string -""-
    // FIXME: compare buffer to object (and vice versa)

    [ 'length', 'byteLength', 'byteOffset', 'BYTES_PER_ELEMENT', -1, 0, 15, 16, '15', '16', '15.0' ].forEach(function (v) {
        print(typeof v, Duktape.enc('jx', v), v in pb, v in ab);
    });
}

/*===
coercion test
false
true
[object ArrayBuffer]
[object ArrayBuffer]
[Overridden]
[Overridden]
TypeError: [[DefaultValue]] failed
TypeError: [[DefaultValue]] failed
TypeError: [[DefaultValue]] failed
TypeError: [[DefaultValue]] failed
NaN
NaN
123
123
===*/

function coercionTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();

    // ES5 coercions

    // ToObject() coercion returns a full ArrayBuffer object, so that
    // Object(plain) !== plain.  This matches current lightfunc behavior
    // but is not necessarily very intuitive.
    print(Object(pb) === pb);
    print(Object(ab) === ab);

    // ToString() coercion
    print(String(pb));
    print(String(ab));

    // ToString goes through ArrayBuffer.prototype
    ArrayBuffer.prototype.toString = function () { return '[Overridden]'; };
    print(String(pb));
    print(String(ab));
    delete ArrayBuffer.prototype.toString;

    // ToString() when overridden .toString() and .valueOf() also return a
    // plain buffer; causes a TypeError (matches V8 behavior for ArrayBuffer)
    ArrayBuffer.prototype.toString = function () { return createPlain(); };
    ArrayBuffer.prototype.valueOf = function () { return createPlain(); };
    try {
        print(String(pb));
    } catch (e) {
        print(e);
    }
    try {
        print(String(ab));
    } catch (e) {
        print(e);
    }
    delete ArrayBuffer.prototype.toString;
    delete ArrayBuffer.prototype.valueOf;

    // Same behavior if .toString() returns an ArrayBuffer object
    ArrayBuffer.prototype.toString = function () { return createArrayBuffer(); };
    ArrayBuffer.prototype.valueOf = function () { return createArrayBuffer(); };
    try {
        print(String(pb));
    } catch (e) {
        print(e);
    }
    try {
        print(String(ab));
    } catch (e) {
        print(e);
    }
    delete ArrayBuffer.prototype.toString;
    delete ArrayBuffer.prototype.valueOf;

    // ToNumber() coerces via ToString(); usually results in NaN but by
    // overriding .toString() one can get a number result
    print(Number(pb));
    print(Number(ab));
    try {
        ArrayBuffer.prototype.toString = function () { return '123'; };
        print(Number(pb));
        print(Number(ab));
    } catch (e) {
        print(e);
    }
    delete ArrayBuffer.prototype.toString;

}

/*===
json test
{}
{}
|6162636465666768696a6b6c6d6e6f70|
|6162636465666768696a6b6c6d6e6f70|
{"_buf":"6162636465666768696a6b6c6d6e6f70"}
{"_buf":"6162636465666768696a6b6c6d6e6f70"}
{"bufferLength":16,"plain":true,"data":"abcdefghijklmnop"}
{"bufferLength":16,"plain":false,"data":"abcdefghijklmnop"}
{bufferLength:16,plain:true,data:"abcdefghijklmnop"}
{bufferLength:16,plain:false,data:"abcdefghijklmnop"}
{"bufferLength":16,"plain":true,"data":"abcdefghijklmnop"}
{"bufferLength":16,"plain":false,"data":"abcdefghijklmnop"}
{}
{}
|6162636465666768696a6b6c6d6e6f70|
|6162636465666768696a6b6c6d6e6f70|
{"_buf":"6162636465666768696a6b6c6d6e6f70"}
{"_buf":"6162636465666768696a6b6c6d6e6f70"}
{"bufferLength":16,"plain":true,"data":"abcdefghijklmnop"}
{"bufferLength":16,"plain":false,"data":"abcdefghijklmnop"}
{bufferLength:16,plain:true,data:"abcdefghijklmnop"}
{bufferLength:16,plain:false,data:"abcdefghijklmnop"}
{"bufferLength":16,"plain":true,"data":"abcdefghijklmnop"}
{"bufferLength":16,"plain":false,"data":"abcdefghijklmnop"}
===*/

function jsonTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();
    function id(k,v) { return v; }

    function doTest(repl) {
        // JSON, JX, and JC
        print(JSON.stringify(pb, repl));
        print(JSON.stringify(ab, repl));
        print(Duktape.enc('jx', pb, repl));
        print(Duktape.enc('jx', ab, repl));
        print(Duktape.enc('jc', pb, repl));
        print(Duktape.enc('jc', ab, repl));

        // .toJSON() works; with plain buffers treated like ArrayBuffer (which
        // are objects) a .toJSON() check is also necessary, unlike for other
        // primitives types.
        ArrayBuffer.prototype.toJSON = function (k) {
            'use strict';  // must be strict to avoid object coercion for 'this'
            return {
                bufferLength: this.length,
                plain: isPlainBuffer(this),
                data: bufferToString(this)
            };
        };
        print(JSON.stringify(pb, repl));
        print(JSON.stringify(ab, repl));
        print(Duktape.enc('jx', pb, repl));
        print(Duktape.enc('jx', ab, repl));
        print(Duktape.enc('jc', pb, repl));
        print(Duktape.enc('jc', ab, repl));

        delete ArrayBuffer.prototype.toJSON;
    }

    doTest();
    doTest(id);  // force slow path
}

/*===
view test
[object Uint32Array]
4 16 0 4
[object ArrayBuffer] false
1616928864
|60606060616161616262626263636363|
[object Uint32Array]
4 16 0 4
[object ArrayBuffer] true
1616928864
|60606060616161616262626263636363|
===*/

function viewTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();
    var view;
    var i;

    for (i = 0; i < pb.length; i++) {
        pb[i] = 0x60 + (i >> 2);  // endian neutral value
    }
    for (i = 0; i < ab.length; i++) {
        ab[i] = 0x60 + (i >> 2);  // endian neutral value
    }

    // create typedarray on top of plain buffer / ArrayBuffer
    view = new Uint32Array(pb);
    print(Object.prototype.toString.call(view));
    print(view.length, view.byteLength, view.byteOffset, view.BYTES_PER_ELEMENT);
    print(view.buffer, view.buffer === pb);
    print(view[0]);
    print(Duktape.enc('jx', view));
    view = new Uint32Array(ab);
    print(Object.prototype.toString.call(view));
    print(view.length, view.byteLength, view.byteOffset, view.BYTES_PER_ELEMENT);
    print(view.buffer, view.buffer === ab);
    print(view[0]);
    print(Duktape.enc('jx', view));
}

/*===
Object and Object.prototype methods
- getPrototypeOf
[object Object] true
[object Object] true
[object Object] true
[object Object] true
- setPrototypeOf
TypeError
undefined
[object ArrayBuffer]
undefined
[object ArrayBuffer]
123
- getOwnPropertyDescriptor
0 {value:97,writable:true,enumerable:false,configurable:false}
0 {value:97,writable:true,enumerable:false,configurable:false}
1 {value:98,writable:true,enumerable:false,configurable:false}
1 {value:98,writable:true,enumerable:false,configurable:false}
2 {value:99,writable:true,enumerable:false,configurable:false}
2 {value:99,writable:true,enumerable:false,configurable:false}
3 {value:100,writable:true,enumerable:false,configurable:false}
3 {value:100,writable:true,enumerable:false,configurable:false}
4 {value:101,writable:true,enumerable:false,configurable:false}
4 {value:101,writable:true,enumerable:false,configurable:false}
5 {value:102,writable:true,enumerable:false,configurable:false}
5 {value:102,writable:true,enumerable:false,configurable:false}
6 {value:103,writable:true,enumerable:false,configurable:false}
6 {value:103,writable:true,enumerable:false,configurable:false}
7 {value:104,writable:true,enumerable:false,configurable:false}
7 {value:104,writable:true,enumerable:false,configurable:false}
8 {value:105,writable:true,enumerable:false,configurable:false}
8 {value:105,writable:true,enumerable:false,configurable:false}
9 {value:106,writable:true,enumerable:false,configurable:false}
9 {value:106,writable:true,enumerable:false,configurable:false}
10 {value:107,writable:true,enumerable:false,configurable:false}
10 {value:107,writable:true,enumerable:false,configurable:false}
11 {value:108,writable:true,enumerable:false,configurable:false}
11 {value:108,writable:true,enumerable:false,configurable:false}
12 {value:109,writable:true,enumerable:false,configurable:false}
12 {value:109,writable:true,enumerable:false,configurable:false}
13 {value:110,writable:true,enumerable:false,configurable:false}
13 {value:110,writable:true,enumerable:false,configurable:false}
14 {value:111,writable:true,enumerable:false,configurable:false}
14 {value:111,writable:true,enumerable:false,configurable:false}
15 {value:112,writable:true,enumerable:false,configurable:false}
15 {value:112,writable:true,enumerable:false,configurable:false}
16 undefined
16 undefined
length {value:16,writable:false,enumerable:false,configurable:false}
length {value:16,writable:false,enumerable:false,configurable:false}
byteLength {value:16,writable:false,enumerable:false,configurable:false}
byteLength {value:16,writable:false,enumerable:false,configurable:false}
byteOffset {value:0,writable:false,enumerable:false,configurable:false}
byteOffset {value:0,writable:false,enumerable:false,configurable:false}
BYTES_PER_ELEMENT {value:1,writable:false,enumerable:false,configurable:false}
BYTES_PER_ELEMENT {value:1,writable:false,enumerable:false,configurable:false}
noSuch undefined
noSuch undefined
- getOwnPropertyNames
0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,length,byteLength,byteOffset,BYTES_PER_ELEMENT
0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,length,byteLength,byteOffset,BYTES_PER_ELEMENT
- create
1 true 100
255
1 true 100
255
- seal
false
[object ArrayBuffer]
false
true
[object ArrayBuffer]
false
- freeze
false
TypeError
false
true
[object ArrayBuffer]
false
- preventExtensions
false
[object ArrayBuffer]
false
true
[object ArrayBuffer]
false
- isSealed
true
false
- isFrozen
false
false
- isExtensible
false
true
- keys


===*/

function objectMethodTest() {
    var pb = createPlain();
    var ab = createArrayBuffer();
    var t;

    print('- getPrototypeOf');
    print(Object.getPrototypeOf(pb), Object.getPrototypeOf(pb) === ArrayBuffer.prototype);
    print(Object.getPrototypeOf(ab), Object.getPrototypeOf(ab) === ArrayBuffer.prototype);
    print(pb.__proto__, pb.__proto__ == ArrayBuffer.prototype);
    print(ab.__proto__, ab.__proto__ == ArrayBuffer.prototype);

    // Plain buffer prototype cannot be set; if the new prototype differs
    // from the existing one a TypeError is thrown because the plain buffer
    // is considered non-extensible.
    print('- setPrototypeOf');
    try {
        print(String(Object.setPrototypeOf(pb, { foo: 123 })));
    } catch (e) {
        print(e.name);
    }
    print(pb.foo);
    try {
        print(String(Object.setPrototypeOf(pb, ArrayBuffer.prototype)));
    } catch (e) {
        print(e);
    }
    print(pb.foo);

    // ArrayBuffer prototype can be set
    try {
        print(Object.setPrototypeOf(ab, { foo: 123 }));
    } catch (e) {
        print(e);
    }
    print(ab.foo);

    pb = createPlain();  // reset values
    ab = createArrayBuffer();

    print('- getOwnPropertyDescriptor');
    [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      'length', 'byteLength', 'byteOffset', 'BYTES_PER_ELEMENT', 'noSuch' ].forEach(function (k) {
        print(k, Duktape.enc('jx', Object.getOwnPropertyDescriptor(pb, k)));
        print(k, Duktape.enc('jx', Object.getOwnPropertyDescriptor(ab, k)));
    });

    print('- getOwnPropertyNames');
    print(Object.getOwnPropertyNames(pb));
    print(Object.getOwnPropertyNames(ab));

    // Object.create takes a prototype argument; if a plain buffer is used as
    // a prototype, it gets object coerced.
    print('- create');
    t = Object.create(pb);
    print(t.BYTES_PER_ELEMENT, t instanceof ArrayBuffer, t[3]);
    pb[3] = 0xff;  // underlying buffer the same
    print(t[3]);
    t = Object.create(ab);
    print(t.BYTES_PER_ELEMENT, t instanceof ArrayBuffer, t[3]);
    ab[3] = 0xff;
    print(t[3]);

    pb = createPlain();  // reset values
    ab = createArrayBuffer();

// defineProperty
// defineProperties

    print('- seal');
    print(Object.isExtensible(pb));
    print(String(Object.seal(pb)));  // already sealed, nop
    print(Object.isExtensible(pb));
    print(Object.isExtensible(ab));
    print(String(Object.seal(ab)));
    print(Object.isExtensible(ab));

    pb = createPlain();  // reset values
    ab = createArrayBuffer();

    // Plain buffer cannot be frozen because the virtual array index properties
    // cannot be made non-writable.
    // FIXME: for actual ArrayBuffer .freeze() is now allowed even though the
    // virtual index properties are not affected.
    print('- freeze');
    print(Object.isExtensible(pb));
    try {
        print(String(Object.freeze(pb)));
    } catch (e) {
        print(e.name);
    }
    print(Object.isExtensible(pb));
    print(Object.isExtensible(ab));
    print(String(Object.seal(ab)));
    print(Object.isExtensible(ab));

    pb = createPlain();  // reset values
    ab = createArrayBuffer();

    print('- preventExtensions');
    print(Object.isExtensible(pb));
    print(String(Object.preventExtensions(pb)));
    print(Object.isExtensible(pb));
    print(Object.isExtensible(ab));
    print(String(Object.preventExtensions(ab)));
    print(Object.isExtensible(ab));

    pb = createPlain();  // reset values
    ab = createArrayBuffer();

    print('- isSealed');
    print(Object.isSealed(pb));
    print(Object.isSealed(ab));
    print('- isFrozen');
    print(Object.isFrozen(pb));
    print(Object.isFrozen(ab));
    print('- isExtensible');
    print(Object.isExtensible(pb));
    print(Object.isExtensible(ab));
    print('- keys');
    print(Object.keys(pb));
    print(Object.keys(ab));

// toString
// toLocaleString
// valueOf
// hasOwnProperty
// isPrototypeOf
// propertyIsEnumerable

}

/*===
misc test
0
0
4 abcd
4 abcd
4 abcd
4 abcd
4 [object Uint32Array]
102 1717986918
object false
119 2004318071
4 [object Uint32Array]
102 1717986918
object true
119 2004318071
16 [object DataView]
97 24930
object false
119 30562
16 [object DataView]
97 24930
object true
119 30562
===*/

function miscTest() {
    var pb;
    var ab;
    var t;
    var i;

    // ArrayBuffer constructor no longer handles a plain buffer specially
    // as in Duktape 1.x (which created a Node.js Buffer with the same
    // underlying plain buffer)  Instead, the argument is ToNumber() coerced
    // ultimately resulting in zero, and the result is a zero length ArrayBuffer.
    t = new ArrayBuffer(Duktape.Buffer(4));
    print(t.length);
    t = new ArrayBuffer(new ArrayBuffer(4));
    print(t.length);

    // Similarly, Node.js Buffer constructor no longer special cases plain
    // buffer.  Instead, a plain buffer is treated like ArrayBuffer or any
    // other object: its .length is read, and index properties are coerced
    // to form a fresh buffer with matching .length.
    pb = Duktape.Buffer(4);
    pb[0] = 0x61; pb[1] = 0x62; pb[2] = 0x63; pb[3] = 0x64;
    ab = new ArrayBuffer(4);
    ab[0] = 0x61; ab[1] = 0x62; ab[2] = 0x63; ab[3] = 0x64;
    t = new Buffer(pb);
    print(t.length, t);
    pb[0] = 0x69;  // demonstrate independent backing buffer
    print(t.length, t);
    t = new Buffer(ab);
    print(t.length, t);
    ab[0] = 0x69;
    print(t.length, t);

    // Typed array constructor coerces a plain buffer into an actual ArrayBuffer
    // and uses it for typedArray.buffer.  The underlying buffer is the same.
    // FIXME: maybe use plain array for typedArray.buffer directly?
    pb = Duktape.Buffer(16);
    for (i = 0; i < pb.length; i++) { pb[i] = 0x66; }  // endian neutral
    ab = new ArrayBuffer(16);
    for (i = 0; i < ab.length; i++) { ab[i] = 0x66; }
    t = new Uint32Array(pb);
    print(t.length, t);
    print(pb[0], t[0]);
    print(typeof t.buffer, t.buffer === pb);
    t[0] = 0x77777777;  // endian neutral; demonstrate same underlying buffer
    print(pb[0], t[0]);
    t = new Uint32Array(ab);
    print(t.length, t);
    print(ab[0], t[0]);
    print(typeof t.buffer, t.buffer === ab);
    t[0] = 0x77777777;  // endian neutral; demonstrate same underlying buffer
    print(ab[0], t[0]);

    // DataView now accepts a plain buffer like an ArrayBuffer.  Duktape 1.x
    // DataView would reject a plain buffer.
    pb = createPlain();
    ab = createArrayBuffer();
    t = new DataView(pb);
    // FIXME .length is custom
    print(t.length, t);
    print(pb[0], t.getUint16(0));
    print(typeof t.buffer, t.buffer === pb);
    pb[0] = 0x77;  // demonstrate same underlying buffer
    print(pb[0], t.getUint16(0));
    t = new DataView(ab);
    print(t.length, t);
    print(ab[0], t.getUint16(0));
    print(typeof t.buffer, t.buffer === ab);
    ab[0] = 0x77;  // demonstrate same underlying buffer
    print(ab[0], t.getUint16(0));
}

try {
    print('basic test');
    basicTest();

    print('property test');
    propertyTest();

    print('enumeration test');
    enumerationTest();

    print('read/write coercion test');
    readWriteCoercionTest();

    print('operator test');
    operatorTest();

    print('coercion test');
    coercionTest();

    print('json test');
    jsonTest();

    print('view test');
    viewTest();

    print('Object and Object.prototype methods');
    objectMethodTest();

    print('misc test');
    miscTest();

    // misc
    // FIXME: regexp exec input; buffer treated like '[object ArrayBuffer]'
} catch (e) {
    print(e.stack || e);
}

// FIXME: ToPrimitive(), ToObject() etc coercions, go through E5 spec

// FIXME: .slice()

// FIXME: buffer as property key!

// FIXME: plainBuffer.valueOf -> Object.prototype.valueOf -> returns Object(plainBuffer)

// FIXME: new ArrayBUffer(plainBuffer)

// FIXME: ArrayBuffer.slice() and other arraybuffer methods
