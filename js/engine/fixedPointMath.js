﻿'use strict';

function scale(input1, input2, input3) {
    return (input1 * input2 / input3) | 0;
}
// using floor so negative numbers come out the same as original
for (var input3 = 1; input3 <= 32; input3++) {
    window["mulscale" + input3] =
        new Function("input1", "input2", "return Math.floor(input1 * input2 / Math.pow(2, " + input3 + "))");
}

function mulscale(input1, input2, input3) {
    return Math.floor(input1 * input2 / Math.pow(2, input3));
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
    window["divScale" + i3] = new Function("i1", "i2", "return Math.floor(i1 * Math.pow(2, " + i3 + ") / i2);");
}

function divScale(i1, i2, i3) {
    //var i1Lo = i1;
    //var i1Hi = 0; // todo: faster using bitshift?? (google's Long class didn't work)
    // This Math.pow MUCH slower than bitshift (google - math.pow vs shift performance)
    // maybe this is faster: http://stackoverflow.com/questions/3323633/efficient-way-of-doing-64-bit-rotate-using-32-bit-values
    return Math.floor((i1 * Math.pow(2, i3)) / i2);
}

function clearbuf(buffer, start, end) {
    for (var i = start; i < end; i++) {
        buffer[i] = 0;
    }
}

function clearbufbyte(buffer, start, end) {
    for (var i = start; i < end; i++) {
        buffer[i] = 0;
    }
}

function qinterpolatedown16short(buffer, num, val, add) {
    // ...maybe the same person who provided this too?
    for (var i = 0; i < num; i++) {
        buffer[i] = (val >> 16);
        //console.log("buffer[%i] = %i", i, buffer[i]);
        val += add;
    }
}