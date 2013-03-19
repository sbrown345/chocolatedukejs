'use strict';

var pixelsAllowed = 10000000000;

var transluc = new Uint8Array(65536 / 4);

var bytesperline = 0;
function setBytesPerLine(_bytesPerLine) {
    bytesperline = _bytesPerLine;
}

// 89
var rmach_eax;
var rmach_ebx;
var rmach_ecx;
var rmach_edx;
var rmach_esi;
function setuprhlineasm4(i1, i2, i3, i4, i5, i6) {
    rmach_eax = i1;
    rmach_ebx = i2;
    rmach_ecx = i3; // palookupoffs
    rmach_edx = i4;
    rmach_esi = i5;
}

function rhlineasm4(i1, texture /*bufplc*/, i3, i4, i5, dest /*frameplace?*/) {
    i4 = i4 >>> 0;
    i5 = i5 >>> 0;

    var ebp = dest.position - i1;
    var rmach6b = ebp - 1;
    var numPixels;

    if (i1 <= 0) return;

    numPixels = i1;
    do {
        //console.log("texture pos: %i", texture.position);
        //console.log("i1: %i, i3: %i, i4: %i, i5: %i, rmach_ebx: %i", i1, i3, i4, i5, rmach_ebx);
        //i3 = ((i3&0xffffff00)|(*texture));
        i3 = ((i3 & 0xffffff00) | texture.readUint8());
        texture.position--;

        i4 -= rmach_eax;
        i4 = i4 >>> 0;
        ebp = ((((i4 + rmach_eax) >>> 0) < i4) ? -1 : 0);
        i5 -= rmach_ebx;
        i5 = i5 >>> 0;
        
        if (((i5 + rmach_ebx) >>> 0) < i5)
            texture.position -= (rmach_ecx + 1);
        else
            texture.position -= rmach_ecx;

        ebp &= rmach_esi;
        //console.log("numPixels = %i, ebp = %i", numPixels, ebp);
        i1 = ((i1 & 0xffffff00) | dest[i3]);
        //i1 = ((i1&0xffffff00)|(((uint8_t *)i3)[rmach_edx]));

        if (pixelsAllowed-- > 0) {
            //(rmach6b)[numPixels] = (i1 & 0xff);
            dest[rmach6b + numPixels] = (i1 & 0xff); //guess..
        }

        texture.position -= ebp;
        numPixels--;
    } while (numPixels);
    
    //throw new Error("todo")
}
