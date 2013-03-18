'use strict';

// 4152
function palto(r, g, b, e) {
    var i, tempArray = new Uint8Array(768);

    for (i = 0; i < (256 * 3) ; i += 3) {
        tempArray[i  ] =ps[myconnectindex].palette[i+0]+(((r-ps[myconnectindex].palette[i+0])*(e&127))>>6);
        tempArray[i+1] =ps[myconnectindex].palette[i+1]+(((g-ps[myconnectindex].palette[i+1])*(e&127))>>6);
        tempArray[i+2] =ps[myconnectindex].palette[i+2]+(((b-ps[myconnectindex].palette[i+2])*(e&127))>>6);
    }

    setBrightness(ud.brightness >> 2, tempArray);
}

// 4602
function playanm(r, g, b, e) {
    throw new Error("playanm todo");
}