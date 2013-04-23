'use strict';

var flatColor = false;

var transluc = new Uint8Array(65536);

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
    //printf("hlineasm4\n");
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
            if (flatColor) destArray[destOffset] = 200;
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

    //printf("rhlineasm4\n");
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
        if (flatColor) destArray[rmach6b + numPixels] = 100;
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

    //printf("prevlineasm1\n");
    if (i3 == 0) {
        if (!RENDER_DRAW_TOP_AND_BOTTOM_COLUMN)
            return 0;

        i1 += i4;
        i4 = (i4) >>> mach3_al;
        i4 = (i4 & 0xffffff00) | source[i4 + sourceOffset];

        if (pixelsAllowed-- > 0) {
            dest.array[destOffset] = palette.getByte(i4);
            if(flatColor) dest.array[destOffset] = 100;
        }


        return i1;
    } else {
        return vlineasm1(i1, palette, i3, i4, source, sourceOffset, destOffset, dest.array);
    }
}

//250
//FCS: This is used to draw wall border vertical lines
function vlineasm1(vince, palookupoffse, numPixels, vplce, texture, textureOffset, destOffset, dest) {
    console.assert(arguments.length == 8);

    //printf("vlineasm1\n");
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

        if (pixelsAllowed-- > 0) {
            dest[destOffset] = palookupoffse.getByte(temp);
            if (flatColor ) dest[destOffset] = 23;
            //printf("px:%i\n", dest[destOffset]);
        }
        vplce += vince;
        destOffset += bytesperline;
        numPixels--;
    }

    return vplce;
}

//279     (todo: more of the func should be setup like this one?)
function tvlineasm1(i1,  texture,  numPixels,  i4, source, dest)
{
    //printf("tvlineasm1\n");
    var shiftValue = (globalshiftval & 0x1f);
    var temp;
    var colorIndex;
    var framePlaceArray = frameplace.array;
    numPixels++;
    while (numPixels)
    {
        temp = i4;
        temp >>>= shiftValue;
        temp = source[temp];

        //255 is the index for transparent color index. Skip drawing this pixel. 
        if (temp != 255)
        {
            colorIndex = texture[temp];
            colorIndex |= ((framePlaceArray[dest]) << 8);
            
            if (transrev) 
                colorIndex = ((colorIndex>>8)|(colorIndex<<8));

            if (pixelsAllowed-- > 0) {
                framePlaceArray[dest] = transluc[colorIndex];
                if (flatColor) framePlaceArray[dest] = 160;
            }
        }
        
        i4 += i1;
        
        //We are drawing a column ?!
        dest += bytesperline;
        numPixels--;
    }
    return i4;
} /* tvlineasm1 */

var  tran2shr;
var tran2pal_ebx;
var tran2pal_ecx;
function setuptvlineasm2(i1, i2, i3) {
	tran2shr = (i1&0x1f) >>> 0;
    tran2pal_ebx = i2;
    tran2pal_ecx = i3;
} /* */

function tvlineasm2(i1, i2, i3, i4, texture, i5, i6 /*dest frameoffset*/) {
    printf("tvlineasm2 todo\n");
    // todo!!!!!!!
	//var ebp = i1;
    //var tran2inca = i2;
    //var tran2incb = asm1;
    //var tran2bufa = i3;
    //var tran2bufb = i4;
    //var tran2edi = asm2;
    //var tran2edi1 = asm2 + 1;
    //debugger 
    //i6 -= asm2; i6 >>>= 0;

    ////do {
		
    //    i1 = i5 >>> tran2shr;
    //    i2 = ebp >>> tran2shr;
    //    i5 += tran2inca; i5 >>>= 0;
    //    ebp += tran2incb; ebp >>>= 0;
    ////    i3 = ((uint8_t  *)tran2bufa)[i1];
    ////    i4 = ((uint8_t  *)tran2bufb)[i2];
    ////    if (i3 == 255) { // skipdraw1
    ////        if (i4 != 255) { // skipdraw3
    ////            var val;
    ////            val = ((uint8_t  *)tran2pal_ecx)[i4];
    ////            val |= (((uint8_t  *)i6)[tran2edi1]<<8);

    ////            if (transrev) 
    ////                val = ((val>>8)|(val<<8));

    ////            if (pixelsAllowed-- > 0)
    ////                ((uint8_t  *)i6)[tran2edi1] = transluc[val];
    ////        }
    ////    } else if (i4 == 255) { // skipdraw2
    ////        var val;
    ////        val = ((uint8_t  *)tran2pal_ebx)[i3];
    ////        val |= (((uint8_t  *)i6)[tran2edi]<<8);

    ////        if (transrev) 
    ////            val = ((val>>8)|(val<<8));

    ////        if (pixelsAllowed-- > 0)
    ////            ((uint8_t  *)i6)[tran2edi] = transluc[val];
    ////    } else {
    ////        var l = ((uint8_t  *)i6)[tran2edi]<<8;
    ////        var r = ((uint8_t  *)i6)[tran2edi1]<<8;
    ////        l |= ((uint8_t  *)tran2pal_ebx)[i3];
    ////        r |= ((uint8_t  *)tran2pal_ecx)[i4];
    ////        if (transrev) {
    ////            l = ((l>>8)|(l<<8));
    ////            r = ((r>>8)|(r<<8));
    ////        }
    ////        if (pixelsAllowed-- > 0)
    ////        {
    ////            ((uint8_t  *)i6)[tran2edi] = transluc[l];
    ////            ((uint8_t  *)i6)[tran2edi1] =transluc[r];
    ////            pixelsAllowed--;
    ////        }
    ////    }
    ////    i6 += bytesperline;
    ////} while (i6 > i6 - bytesperline);
    ////asm1 = i5;
    ////asm2 = ebp;
} 


//386
var machmv;
function mvlineasm1(vince, palookupoffse, i3, vplce, texture, texturePosition, destPosition, dest) {
    console.assert(arguments.length == 8);
    console.assert(dest instanceof PointerHelper);
    var temp;
    //printf("mvlineasm1\n");
    var textureArray = texture.array;
    var destArray = dest.array;

    for (; i3 >= 0; i3--) {
        temp = vplce >>> machmv;
        temp = textureArray[texturePosition + temp];
        
        if (temp != 255) {
            if (pixelsAllowed-- > 0) {
                destArray[destPosition + dest.position] = palookupoffse.getByte(temp);
                if (flatColor) destArray[destPosition + dest.position] = 180;
            }
        }

        vplce += vince;
        vplce = vplce | 0;
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
    //printf("vlineasm4\n");
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
    //for (var numBytesOnScreen = ScreenWidth * ScreenHeight; dest <= numBytesOnScreen; dest += bytesperline) {
    for (; i < ((dest>>>0) - bytesperline) < (dest>>>0);dest += bytesperline ) {
        for (i = 0; i < 4; i++) {
            temp = (((vplce[i] >>> 0) >> mach3_al) & 0xff) >>> 0;
            temp = bufplcArray[bufplce[i] + temp]; // get texture
            frameBufferArray[dest + index + i] = palookupoffse[i].getByte(temp); // add texture to framebuffer
            if (flatColor) frameBufferArray[dest + index + i] = 25;
            //printf("px:%i\n", frameBufferArray[dest + index + i]);
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

    //printf("vlineasm4   \n");
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
            if (flatColor) destArray[dest.position + index + i] = 250;
            //printf("px:%i\n", destArray[dest.position + index + i]);
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

function mvlineasm4(column, bufplcArray, framebufferOffset, frameBuffer) {
    if (arguments.length != 4) {
        throw new Error("todo: mvlineasm4 should have 4 arguments");
    }

    //printf("mvlineasm4\n");
    var i;
    var temp;
    var index = (framebufferOffset + ylookup[column]);
    var dest = -ylookup[column];
    var frameBufferArray = frameBuffer.array;
    do {
        //for (; (((dest >>> 0) - bytesperline)>>>0) < (dest>>>0); dest += bytesperline) {
        for (i = 0; i < 4; i++) {
            temp = ((vplce[i] >>> 0) >>> machmv) >>> 0;
            temp = bufplcArray[bufplce[i] + temp]; // get texture
            if (temp !== 255) {
                if (pixelsAllowed-- > 0) {
                    frameBufferArray[dest + index + i] = palookupoffse[i].getByte(temp);
                    if (flatColor) frameBufferArray[dest + index + i] = 190;
                }
            }
            vplce[i] += vince[i];
        }
            dest += bytesperline;
        } while ((((dest >>> 0) - bytesperline)>>>0) < (dest>>>0));
    //}
}

/*
 FCS: Draw a sprite vertical line of pixels.
 */
//665
function DrawSpriteVerticalLine(i2,  numPixels,  i4,  textureOffset, texture, dest) {
    //printf("DrawSpriteVerticalLine\n");
    // todo
    var colorIndex;
    texture = texture.array;

    //todo: for loop
    while (numPixels) {
        numPixels--;

        if (numPixels != 0) {

            i4 += tsmach_ecx;

            if (i4 < (i4 - tsmach_ecx))
                adder = tsmach_eax3;

            colorIndex = texture[textureOffset];

            i2 = (i2 + tsmach_eax1) | 0;
            if ((i2 >>> 0) < (i2 - tsmach_eax1) >>> 0)
                textureOffset++;

            textureOffset += adder;

            //255 is the index of the transparent color: Do not draw it.
            if (colorIndex != 255) {
                var val;
                val = tspal.array[colorIndex];
                val |= dest.getByte() << 8;

                if (transrev)
                    val = ((val >> 8) | (val << 8));

                colorIndex = transluc[val];

                if (pixelsAllowed-- > 0) {
                    //printf("dsv:%i\n", colorIndex);
                    dest.setByte(colorIndex);
                    if (flatColor) dest.setByte(66);
                }
            }

            //Move down one pixel on the framebuffer
            dest.position += bytesperline;
        }
    }

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
//var slopemach_ecx_32;
var slopemach_edx;
var slopemach_ah1;
var slopemach_ah2;
var asm2_f = new Float32Array(1);
function bitwisef2i() {
    var uintArray = new Uint32Array(1);
    var floatArray = new Float32Array(uintArray.buffer);
    
    this.__defineGetter__("i", function () {
        return uintArray[0];
    });

    this.__defineSetter__("i", function (val) {
        uintArray[0] = val;
    });
    
    this.__defineGetter__("f", function () {
        return floatArray[0];
    });

    this.__defineSetter__("f", function (val) {
        floatArray[0] = val;
    });
}

function setupslopevlin(i1, i2, i3) {
    var c = new bitwisef2i();
    slopemach_ebx = i2;
    slopemach_ecx = i3;
    slopemach_edx = (1 << (i1 & 0x1f)) - 1;
    slopemach_edx <<= ((i1 & 0x1f00) >> 8);
    slopemach_ah1 = 32 - ((i1 & 0x1f00) >> 8);
    slopemach_ah2 = (slopemach_ah1 - (i1 & 0x1f)) & 0x1f;
    c.f = asm2_f[0] = /*(float)*/asm1;
    asm2 = c.i;
}

//870
function low32(a) { return (a & 0xffffffff); }

//FCS: Render RENDER_SLOPPED_CEILING_AND_FLOOR
//var slopevlinCount = 0;
function slopevlin(i1, i2, i3, i4, i5, i6) {
    //printf("slopevlin\n");
    var doCount = 0;
    var whileCount = 0;
    var c = new bitwisef2i();
    var ecx,eax,ebx,edx,esi,edi;
    //#pragma This is so bad to cast asm3 to int then float :( !!!
    var a = asm3 + asm2_f[0]; // look @ krecipasm for float stuff
    i1 -= slopemach_ecx;
    esi = i5 + low32(globalx3 * (i2<<3));
    edi = i6 + low32(globaly3 * (i2<<3));
    ebx = i4;

    if (!RENDER_SLOPPED_CEILING_AND_FLOOR)
        return;

    //printf("slopevlinCount: %i\n", slopevlinCount);
    do {
        // -------------
        // All this is calculating a fixed point approx. of 1/a
        c.f = a;
        fpuasm = eax = c.i;
        edx = ((eax|0) < 0) ? 0xffffffff : 0;
        eax = (eax << 1)>>>0;
        ecx = (eax>>>24);	//  exponent
        eax = ((eax&0xffe000)>>>11);
        ecx = ((ecx&0xffffff00)|((ecx-2)&0xff));
        eax = recipTable[(eax/4)|0];
        eax >>>= (ecx&0x1f);
        eax ^= edx;
        eax >>>= 0;
        // -------------
        edx = i2;
        i2 = eax;
        eax -= edx;
        ecx = low32(globalx3 * eax);
        eax = low32(globaly3 * eax);
        a += asm2_f[0];

        asm4 = ebx;
        ecx = ((ecx&0xffffff00)|(ebx&0xff));
        if (ebx >= 8) ecx = ((ecx&0xffffff00)|8);

        ebx = esi;
        edx = edi;
        //printf("doCount: %i b4 while edx: %u, ebx: %u, ecx: %u\n", doCount, edx, ebx, ecx);
        while ((ecx & 0xff))
        {
            ebx >>>= slopemach_ah2;
            esi += ecx;
            edx >>>= slopemach_ah1;
            ebx &= slopemach_edx;
            edi += eax;
            i1 += slopemach_ecx;
            edx = ((edx & 0xffffff00) | slopemach_ebx[ebx + edx]); 
            //printf("0doCount: %i, whileCount: %i, edx %u\n", doCount, whileCount, edx);
            ebx = i3.getInt32(); 
            //printf("i3.position: %i, ebx: %u\n", i3.position, ebx);
            i3.position-=4;
            //printf("1doCount: %i, whileCount: %i, eax %u\n", doCount, whileCount, eax);
            eax = ((eax & 0xffffff00) | palookup[globalpal][edx + ebx]);
            //printf("2doCount: %i, whileCount: %i, eax %u\n", doCount, whileCount, eax);
            ebx = esi;

            if (pixelsAllowed-- > 0) {
                frameplace.array[i1] = (eax & 0xff); // *((uint8_t  *)i1) = (eax&0xff);
                if (flatColor) frameplace.array[i1] = 44;
                //console.log("doCount: %i, whileCount: %i, eax&0xff: %i\n", doCount, whileCount, eax & 0xff);
                wrote++;
            }
            edx = edi;
            ecx = ((ecx & 0xffffff00) | ((ecx - 1) & 0xff));
            whileCount++;
        }
        ebx = asm4;
        ebx -= 8;	// BITSOFPRECISIONPOW


        doCount++;
    } while (ebx > 0);


    //if (wrote > 2000 && !flushed) {
    //    console.log2flush();
    //    flushed = true;
    //}
    //slopevlinCount++;
}

var flushed = false;
var wrote = 0;
