'use strict';

function scale(input1, input2, input3) {
    return (input1 * input2 / input3) | 0;
}
// using floor so negative numbers come out the same as original
for (var input3 = 1; input3 <= 32; input3++) {
    window["mulscale" + input3] =
        //new Function("input1", "input2", "return Math.floor(input1 * input2 / Math.pow(2, " + input3 + "))");
        new Function("input1", "input2", "return mulscale(input1, input2, " + input3 + ")");
}

function mulscale(input1, input2, input3) {
    if ((input1 | 0) != input1) throw "input1 not an integer";
    if ((input2 | 0) != input2) throw "input2 not an integer";
    if ((input3 | 0) != input3) throw "input3 not an integer";

    var output = Math.floor(input1 * input2 / Math.pow(2, input3));
    //console.log("mulscale: %i, %i, %i = %i", input1, input2, input3, output);
    return output;
}

//for (var input3 = 1; input3 <= 32; input3++) {
//    window["mulscale" + input3] =
//        new Function("input1", "input2", "return (input1 * input2) >> " + input3);
//}

//function mulscale(input1, input2, input3) {
//    return (input1 * input2) >> input3;
//}


//for (var input5 = 1; input5 <= 32; input5++) {
//    window["dmulscale" + input5] =
//        new Function("input1", "input2", "input3", "input4", "return ((input1 * input2) + (input3 * input4)) >> " + input5);
//}

//function dmulscale(input1, input2, input3, input4, input5) {
//    return ((input1 * input2) + (input3 * input4)) >> input5;
//}

for (var input5 = 1; input5 <= 32; input5++) {
    window["dmulscale" + input5] =
        new Function("input1", "input2", "input3", "input4", "return Math.floor(((input1 * input2) + (input3 * input4)) / Math.pow(2, " +
            input5 + "))");
}

function dmulscale(input1, input2, input3, input4, input5) {
    return Math.floor(((input1 * input2) + (input3 * input4)) / Math.pow(2, input5));
}

for (var i3 = 1; i3 <= 32; i3++) {
    window["divscale" + i3] = new Function("i1", "i2", "return divscale(i1, i2, " + i3 + ");"); // todo: inline
}

function divscale(i1, i2, i3) {
    if ((i1 | 0) != i1) throw "i1 not an integer: " + i1;
    if ((i2 | 0) != i2) throw "i2 not an integer: " + i2;
    if ((i3 | 0) != i3) throw "i3 not an integer: " + i3;
    if (isNaN(i1) || isNaN(i2) || isNaN(i3)) throw "error NaN not allowed"; //todo: remove later

    //var i1Lo = i1;
    //var i1Hi = 0; // todo: faster using bitshift?? (google's Long class didn't work)
    // This Math.pow MUCH slower than shift (google - math.pow vs shift performance)
    // maybe this is faster: http://stackoverflow.com/questions/3323633/efficient-way-of-doing-64-bit-rotate-using-32-bit-values
    return (((i1 * Math.pow(2, i3))) / i2) | 0;
}

function mul32(n, m) {
    n = n | 0;
    m = m | 0;
    var nlo = n & 0xffff;
    var nhi = n >> 16; // Sign extending.
    var res = ((nlo * m) + (((nhi * m) & 0xffff) << 16)) | 0;
    return res;
}

//function multiply_uint32(a, b) {
//    var ah = (a >> 16) & 0xffff, al = a & 0xffff;
//    var bh = (b >> 16) & 0xffff, bl = b & 0xffff;
//    var high = ((ah * bl) + (al * bh)) & 0xffff;
//    return ((high << 16) >>> 0) + (al * bl);
//}

toInt8.helper = new Int8Array(1);
function toInt8(v) {
    toInt8.helper[0] = v;
    return toInt8.helper[0];
}

toUint8.helper = new Uint8Array(1);
function toUint8(v) {
    toUint8.helper[0] = v;
    return toUint8.helper[0];
}

toInt16.helper = new Int16Array(1);
function toInt16(v) {
    toInt16.helper[0] = v;
    return toInt16.helper[0];
}

toUint32.helper = new Uint32Array(1);
function toUint32(v) {
    toUint32.helper[0] = v;
    return toUint32.helper[0];
}

function ksgn(i1) {
    if (i1 < 0) return -1;
    else if (i1 > 0) return 1;
    else return 0;
}

function klabs(i1) {
    if (i1 < 0) {
        i1 = -i1;
    }

    return i1;
}

function clearbuf(d, c, a) {
    if (arguments.length != 3) throw "arg error";
    //// todo: check this
    //int32_t *p = (int32_t*)d;
    var p = d instanceof Int32Array ? d : new Int32Array(d.buffer), pIdx = 0;
    //while ((c--) > 0) *(p++) = a;
    while ((c--) > 0) p[pIdx++] = a; //*(p++) = a;
}

function clearbufbyte(buffer, offset, c, a) {
    if (arguments.length != 4) throw "arg error";

    var p = new Uint8Array(buffer.buffer);
    var pIdx = offset * buffer.BYTES_PER_ELEMENT;
    var m = [0xff, 0xff00, 0xff0000, 0xff000000];
    var n = [0, 8, 16, 24];
    var z = 0;
    while ((c--) > 0) {
        p[pIdx++] = ((a & m[z]) >>> n[z]);
        z = (z + 1) & 3;
    }
}

function copybufbyte(s, sPos, d, dPos, c) {
    if (arguments.length != 5) throw "arg error";
    var p = new PointerHelper(s, sPos), q = new PointerHelper(d, dPos);
    while ((c--) > 0) {
        q.setByte(p.getByte());
        q.position++;
        p.position++;
    }
}


function qinterpolatedown16(buffer, bufferOffset, num, val, add) {
    console.log("qinterpolatedown16 num: %i, val: %i, numadd: %i", num, val, add);
    if (typeof qinterpolatedown16short === "number") throw "wrong type, should be array";
    if (arguments.length !== 5) throw "bad args";

    // ...maybe the same person who provided this too?
    for (var i = 0; i < num; i++) {
        buffer[bufferOffset + i] = (val >> 16);
        console.log("buffer[%i] = %i", i, buffer[i]);
        val += add;
    }
}

function qinterpolatedown16short(buffer, bufferOffset, num, val, add) {
    if (typeof qinterpolatedown16short === "number") throw "wrong type, should be array";
    if (arguments.length !== 5) throw "bad args";

    // ...maybe the same person who provided this too?
    for (var i = 0; i < num; i++) {
        buffer[bufferOffset + i] = (val >> 16);
        //console.log("buffer[%i] = %i", i, buffer[i]);
        val += add;
    }
}