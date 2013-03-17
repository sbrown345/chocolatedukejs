'use strict';

String.prototype.trimNullTerminatedString = function () {
    return this.slice(0, this.indexOf('\0'));
};

function str2Bytes(str) {
    var array = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        array[i] = str.charCodeAt(i);
    }
    return array;
}

function uint8ArrayToString(bytes) {
    return String.fromCharCode.apply(null, bytes);
}

// todo: performance
function stringFromArray(array) {
    var nullPos = array.length;
    var str = "";
    for (var i = 0; i < array.length; i++) {
        if (array[i] == 0) {
            nullPos = i;
            break;
        }
        str += String.fromCharCode(array[i]); // temp quick fix
    }
    return str;
}

function isalnum(c) {
    c = typeof c === "number" ? c : c.charCodeAt(0);
    return (c >= 48 && c <= 57)
        || (c >= 65 && c <= 90)
        || (c >= 97 && c <= 122);
}

function isDigit(c) {
    c = typeof c === "number" ? c : c.charCodeAt(0);
    return (c >= 48 && c <= 57);
}