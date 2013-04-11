'use strict';

var transluc = new Uint8Array(65536 / 4);

var transrev = 0;

var TRANS_NORMAL = 0;
var TRANS_REVERSE = 1;

// FCS: In order to see how the engine renders different part of the screen you can set the following macros
// VISUALIZE RENDERER
var MAX_PIXEL_RENDERERED = ((1600 * 1200) + 20000);
var pixelsAllowed = 10000000000;

function shld(a, b, c) { return (((b) >>> (32 - (c))) | ((a) << (c))); }

var RENDER_DRAW_WALL_BORDERS = 1;
var RENDER_DRAW_WALL_INSIDE = 1;
var RENDER_DRAW_CEILING_AND_FLOOR = 1;
var RENDER_DRAW_TOP_AND_BOTTOM_COLUMN = 1;
var RENDER_SLOPPED_CEILING_AND_FLOOR = 1;

var CLEAR_FRAMEBUFFER = !((RENDER_DRAW_WALL_BORDERS && RENDER_DRAW_WALL_INSIDE && RENDER_DRAW_CEILING_AND_FLOOR && RENDER_DRAW_TOP_AND_BOTTOM_COLUMN && RENDER_SLOPPED_CEILING_AND_FLOOR && MAX_PIXEL_RENDERERED != 0));
// END VISUALIZE RENDERER

var bytesperline = 0;
function setBytesPerLine(_bytesPerLine) {
    bytesperline = _bytesPerLine;
}

var asm1;
var asm2;
var asm3;
var asm4;

var machxbits_al;
var bitsSetup;
var textureSetup;
function sethlinesizes(i1, _bits, textureAddress) {
    machxbits_al = i1;
    bitsSetup = _bits;
    textureSetup = textureAddress;
}

//FCS:   Draw ceiling/floors
//Draw a line from destination in the framebuffer to framebuffer-numPixels
//var hlineasm4Count = 0;
function hlineasm4(numPixels, shade, i4, i5, destOffset, dest) {
    if (arguments.length != 6) throw "bad args";

    var shifter = ((256 - machxbits_al) & 0x1f);
    var source;

    var texture = textureSetup;
    var bits = bitsSetup;

    i4 = i4 >> 0; // uint32
    i5 = i5 >>> 0; // uint32

    shade = shade & 0xffffff00;
    numPixels++;

    if (!RENDER_DRAW_CEILING_AND_FLOOR)
        return;

    var destArray = dest.array;
    // todo: for loop (faster!)
    while (numPixels) {

        source = i5 >>> shifter;
        source = shld(source, i4, bits) >>> 0;
        source = texture[source];

        // throw "todo: palookup is a list of pointers itself? - to a pallet or something";
        // globalpalwritten points to the first palookup pointer
        if (pixelsAllowed-- > 0) {
            destArray[destOffset] = globalpalwritten[shade | source];
            //console.log("hlineasm4Count: %i, numPixels: %i, shade: %i, i4: %i, i5: %i", hlineasm4Count, numPixels, shade, i4, i5);
            //console.log("dest: %i", destArray[destOffset]);
        }

        destOffset--;

        i5 = (i5 - asm1) >>> 0;
        i4 = (i4 - asm2) >>> 0;

        numPixels--;
    }
    //hlineasm4Count++;
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
    var destArray = dest.array;
    var textureArray = texture.array;

    if (i1 <= 0) return;

    for (numPixels = i1; numPixels; numPixels--) {
        i3 = (/*(i3 & 0xffffff00) | todo: check actual original and reinstate? */textureArray[texturePosition]);

        i4 -= rmach_eax;
        i4 = i4 >>> 0;
        ebp = ((((i4 + rmach_eax) >>> 0) < i4) ? -1 : 0);
        i5 -= rmach_ebx;
        i5 = i5 >>> 0;

        if (((i5 + rmach_ebx) >>> 0) < i5)
            texturePosition -= (rmach_ecx + 1);
        else
            texturePosition -= rmach_ecx;

        ebp &= rmach_esi;
        i1 = /*(i1 & 0xffffff00) | not sure what this is?  */ i3 + rmach_edx; // pointer to palette e.g. testPallete[i3 + rmach_edx];

        //if (pixelsAllowed-- > 0) {
        destArray[rmach6b + numPixels] = (i1 & 0xff);
        //}

        texturePosition -= ebp;
    }

    texture.position = texturePosition;
}

// 220
var mach3_al = 0;

//FCS:  RENDER TOP AND BOTTOM COLUMN
function prevlineasm1(i1, palette, i3, i4, source, sourceOffset, destOffset, dest) {
    if (arguments.length != 8) {
        throw new Error("prevlineasm1 should have 8 arguments");
    }

    if (i3 == 0) {
        if (!RENDER_DRAW_TOP_AND_BOTTOM_COLUMN)
            return 0;

        i1 += i4;
        i4 = (i4) >>> mach3_al;
        i4 = (i4 & 0xffffff00) | source[i4 + sourceOffset];

        if (pixelsAllowed-- > 0)
            dest.array[destOffset] = palette.getByte(i4);


        return i1;
    } else {
        return vlineasm1(i1, palette, i3, i4, source, sourceOffset, destOffset, dest.array);
    }
}

//250
//FCS: This is used to draw wall border vertical lines
function vlineasm1(vince, palookupoffse, numPixels, vplce, texture, textureOffset, destOffset, dest) {
    console.assert(arguments.length == 8);

    if (!dest || dest.length === undefined) {
        console.log(new Error().stack);
        throw new Error("dest should have a length e.g. be an array");
    }

    var temp;

    if (!RENDER_DRAW_WALL_BORDERS)
        return vplce;

    numPixels++;
    while (numPixels) {
        temp = vplce >>> mach3_al;

        temp = texture[textureOffset + temp];

        if (pixelsAllowed-- > 0)
            dest[destOffset] = palookupoffse.getByte(temp);

        vplce += vince;
        destOffset += bytesperline;
        numPixels--;
    }

    return vplce;
}

//386
var machmv;
function mvlineasm1(vince, palookupoffse, i3, vplce, texture, texturePosition, destPosition, dest) {
    console.assert(arguments.length == 8);
    console.assert(dest instanceof PointerHelper);

    var temp;
    var textureArray = texture.array;
    var destArray = dest.array;

    for (; i3 >= 0; i3--) {
        temp = ((vplce >>> 0) >> machmv) >>> 0;
        temp = textureArray[texturePosition + temp];

        if (temp != 255) {
            if (pixelsAllowed-- > 0) {
                destArray[destPosition + dest.position] = palookupoffse.getByte(temp);
            }
        }

        vplce += vince;
        destPosition += bytesperline;
    }

    texture.position = texturePosition;
    return vplce;
}


//410
function setupvlineasm(i1) {
    mach3_al = (i1 & 0x1f);
}

//FCS This is used to fill the inside of a wall (so it draws VERTICAL column, always).
function vlineasm4(columnIndex, bufplc, frameBufferPosition, frameBuffer) {
    if (!RENDER_DRAW_WALL_INSIDE)
        return;

    if (arguments.length != 4) {
        throw new Error("todo: vlineasm4 should have 4 arguments");
    }

    frameBuffer.position += frameBufferPosition;

    var i;
    var temp;

    var index = (frameBuffer.position + ylookup[columnIndex]);
    var dest = -ylookup[columnIndex];
    var frameBufferArray = frameBuffer.array;
    var bufplcArray = bufplc.array;
    // dest <= numBytesOnScreen  - possibly bad if the sprite isn't for the whole screen size!!
    for (var numBytesOnScreen = ScreenWidth * ScreenHeight; dest <= numBytesOnScreen; dest += bytesperline) {
        for (i = 0; i < 4; i++) {
            temp = (((vplce[i] >>> 0) >> mach3_al) & 0xff) >>> 0;
            temp = bufplcArray[bufplce[i] + temp]; // get texture
            frameBufferArray[dest + index + i] = palookupoffse[i].getByte(temp); // add texture to framebuffer
            vplce[i] += vince[i];
        }
    }
}

//417
// another try for wallscan. maybe merge the two together later
// this draws a 4 pixel wide column. top to bottom.
function vlineasm4_2(columnIndex, frameBufferPosition) {
    if (!RENDER_DRAW_WALL_INSIDE)
        return;

    if (arguments.length != 2) {
        throw new Error("todo: vlineasm4_2 should have 2 arguments");
    }

    var i = 0;
    var temp;

    var index = frameBufferPosition + ylookup[columnIndex];
    var dest = new PointerHelper(frameplace.array, -ylookup[columnIndex]);
    var destArray = dest.array;
    for (; i < ((dest.position >>> 0) - bytesperline) < (dest.position >>> 0) ; dest.position += bytesperline) {
        for (i = 0; i < 4; i++) {
            temp = (vplce[i]) >>> mach3_al;
            temp = tiles[globalpicnum].data[bufplce[i] + temp];

            //if (pixelsAllowed-- > 0) {
            destArray[dest.position + index + i] = palookupoffse[i].getByte(temp);
            //}

            //appendCanvasImageToPage((dest.position + index + i) + "=" + palookup[palookupoffse[i]][temp]);
            vplce[i] += vince[i];
        }
    }
}

//451
function setupmvlineasm(i1) {
    //Only keep 5 first bits
    machmv = (i1 & 0x1f);
}

function mvlineasm4(column, bufplc, framebufferOffset, frameBuffer) {
    if (arguments.length != 4) {
        throw new Error("todo: mvlineasm4 should have 4 arguments");
    }

    var i;
    var temp;
    var index = (framebufferOffset + ylookup[column]);
    var dest = -ylookup[column];
    var frameBufferArray = frameBuffer.array;
    var bufplcArray = bufplc.array;
    //do {
    for (; dest !== 0; dest += bytesperline) {
        for (i = 0; i < 4; i++) {
            temp = ((vplce[i] >>> 0) >> machmv) >>> 0;
            temp = bufplcArray[bufplce[i] + temp]; // get texture
            if (temp !== 255) {
                //if (pixelsAllowed-- > 0)
                frameBufferArray[dest + index + i] = palookupoffse[i].getByte(temp);
            }
            vplce[i] += vince[i];
        }
        //    dest += bytesperline;
        //} while (dest);
    }
}

/*
 FCS: Draw a sprite vertical line of pixels.
 */
//665
function DrawSpriteVerticalLine(/*int32_t i2, int32_t numPixels, uint32_t i4, uint8_t  * texture, uint8_t  * dest*/) {
    // todo
    console.log("todo DrawSpriteVerticalLine");
    //uint8_t colorIndex;

    //while (numPixels)
    //{
    //    numPixels--;

    //    if (numPixels != 0)
    //    {

    //        i4 += tsmach_ecx;

    //        if (i4 < (i4 - tsmach_ecx)) 
    //            adder = tsmach_eax3;

    //        colorIndex = *texture;

    //        i2 += tsmach_eax1;
    //        if (i2 < (i2 - tsmach_eax1)) 
    //            texture++;

    //        texture += adder;

    //        //255 is the index of the transparent color: Do not draw it.
    //        if (colorIndex != 255)
    //        {
    //            uint16_t val;
    //            val = tspal[colorIndex];
    //            val |= (*dest)<<8;

    //            if (transrev) 
    //                val = ((val>>8)|(val<<8));

    //            colorIndex = transluc[val];

    //            if (pixelsAllowed-- > 0)
    //                *dest = colorIndex;
    //        }

    //        //Move down one pixel on the framebuffer
    //        dest += bytesperline;
    //    }

}
/* END---------------  SPRITE RENDERING METHOD (USED TO BE HIGHLY OPTIMIZED ASSEMBLY) ----------------------------*/



//646
var tspal;
var tsmach_eax1;
var adder;
var tsmach_eax3;
var tsmach_ecx;
function tsetupspritevline(palette, i2, i3, i4, i5) {
    tspal = palette;
    tsmach_eax1 = i5 << 16;
    adder = (i5 >> 16) + i2;
    tsmach_eax3 = adder + i4;
    tsmach_ecx = i3;
}

/* ---------------  FLOOR/CEILING RENDERING METHOD (USED TO BE HIGHLY OPTIMIZED ASSEMBLY) ----------------------------*/
//739
function settrans(type) {
    transrev = type;
}

//850
var slopemach_ebx;
var slopemach_ecx;
var slopemach_edx;
var slopemach_ah1;
var slopemach_ah2;
var asm2_f;
function bitwisef2i() {
    this.i = 0;
    this.f = 0.0;
}

function setupslopevlin(i1, i2, i3) {
    var c = new bitwisef2i();
    slopemach_ebx = i2;
    slopemach_ecx = i3;
    slopemach_edx = (1 << (i1 & 0x1f)) - 1;
    slopemach_edx <<= ((i1 & 0x1f00) >> 8);
    slopemach_ah1 = 32 - ((i1 & 0x1f00) >> 8);
    slopemach_ah2 = (slopemach_ah1 - (i1 & 0x1f)) & 0x1f;
    c.f = asm2_f = /*(float)*/asm1;
    asm2 = c.i;
}

//870
//extern int32_t reciptable[2048];
//extern int32_t globalx3, globaly3;
//extern int32_t fpuasm;
//#define low32(a) ((a&0xffffffff))
//#define high32(a) ((int)(((__int64)a&(__int64)0xffffffff00000000)>>32))

//FCS: Render RENDER_SLOPPED_CEILING_AND_FLOOR
function slopevlin(i1, i2, i3, i4, i5, i6) {
    throw "todo";
}