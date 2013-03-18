'use strict';

var transluc = new Uint8Array(65536 / 4);

var bytesperline = 0;
function setBytesPerLine(_bytesPerLine) {
    bytesperline = _bytesPerLine;
}