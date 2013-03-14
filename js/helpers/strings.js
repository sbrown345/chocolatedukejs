String.prototype.trimNullTerminatedString = function() {
    return this.slice(0, this.indexOf('\0'));
};

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
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