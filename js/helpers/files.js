'use strict';

function open(filename) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.open('GET', filename, false);
    xhr.send();
    
    var src = xhr.responseText;
    var buf = new ArrayBuffer(src.length);
    var dest = new Uint8Array(buf);
    var i;
    for (i = 0; i < src.length; ++i) {
        dest[i] = src.charCodeAt(i) & 255;
    }
    return buf;
}