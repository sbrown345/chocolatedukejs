'use strict';

var transluc = new Uint8Array(65536 / 4);

var pixelsAllowed = 10000000000;

var RENDER_DRAW_WALL_BORDERS = 1;
var RENDER_DRAW_WALL_INSIDE = 1;
var RENDER_DRAW_CEILING_AND_FLOOR = 1;
var RENDER_DRAW_TOP_AND_BOTTOM_COLUMN = 1;
var RENDER_SLOPPED_CEILING_AND_FLOOR = 1;

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

function rhlineasm4(i1, texturePosition, texture, i3, i4, i5, destPosition, dest) {
    texture.position = texturePosition;
    dest.position = destPosition;
    if (arguments.length != 8) {
        throw new Error("todo: rhlineasm4 should have 8 arguments");
    }
    if (!(dest instanceof PointerHelper)) {
        throw new Error("todo: the line that passed to this method (rhlineasm4) needs fixing");
    }

    i4 = i4 >>> 0;
    i5 = i5 >>> 0;

    var ebp = dest.position - i1;
    var rmach6b = ebp - 1;
    var numPixels;

    if (i1 <= 0) return;

    numPixels = i1;
    do {
        i3 = ((i3 & 0xffffff00) | texture.getByte());

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
        i1 = (i1 & 0xffffff00) | i3 + rmach_edx; // pointer to palette e.g. testPallete[i3 + rmach_edx];

        if (pixelsAllowed-- > 0) {
            dest.array[rmach6b + numPixels] = (i1 & 0xff);
        }

        texture.position -= ebp;
        numPixels--;
    } while (numPixels);
}

// 220
var mach3_al = 0;

//410
function setupvlineasm(i1) {
    mach3_al = (i1 & 0x1f);
}

//FCS This is used to fill the inside of a wall (so it draws VERTICAL column, always).
function vlineasm4(columnIndex, bufplc, framebufferPosition, framebuffer) {
    if (!RENDER_DRAW_WALL_INSIDE)
        return;

    if (arguments.length != 4) {
        throw new Error("todo: vlineasm4 should have 4 arguments");
    }

    framebuffer.position += framebufferPosition;

    var i;
    var temp;

    var index = (framebuffer.position + ylookup[columnIndex]);
    var dest = -ylookup[columnIndex];
    do {
        for (i = 0; i < 4; i++) {
            temp = (((vplce[i] >>> 0) >> mach3_al) & 0xff) >>> 0;
            temp = bufplc.array[bufplce[i] + temp] >>> 0; // get texture

            if (pixelsAllowed-- > 0) {
                var val = palookup[palookupoffse[i] + temp];
                framebuffer.array[dest + index + i] = val; // add texture to framebuffer
            }

            vplce[i] += vince[i];
        }
        dest += bytesperline;
    } while (typeof framebuffer.array[dest] !== "undefined");
}