'use strict';

function open(filename) {
    var xhr = new XMLHttpRequest();
    if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
    }
    xhr.open('GET', filename, false);
    xhr.send();

    if (typeof VBArray !== "undefined") { // IE 9/10
        var data = new VBArray(xhr.responseBody).toArray();
        var buf = new ArrayBuffer(data.length);
        var dest = new Uint8Array(buf);
        var i;
        for (i = 0; i < data.length; ++i) {
            dest[i] = data[i];
        }
        
        return buf;
    } else {
        var src = xhr.responseText;
        var buf = new ArrayBuffer(src.length);
        var dest = new Uint8Array(buf);
        var i;
        for (i = 0; i < src.length; ++i) {
            dest[i] = src.charCodeAt(i) & 255;
        }

        return buf;
    }
}
