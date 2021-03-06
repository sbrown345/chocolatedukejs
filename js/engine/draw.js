﻿//'use strict';

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

var asm1;
var asm2;
var asm3;
var asm4;

var machxbits_al;
var bitsSetup;
var textureSetup;
function sethlinesizes(i1, _bits, textureAddress) {
    machxbits_al = i1 | 0;
    bitsSetup = _bits | 0;
    textureSetup = textureAddress;
}

//FCS:   Draw ceiling/floors
//Draw a line from destination in the framebuffer to framebuffer-numPixels
//var hlineasm4Count = 0;
function hlineasm4(numPixels, shade, i4, i5, destOffset, dest) {
    numPixels = numPixels | 0;
    shade = shade | 0;
    i4 = i4 >>> 0;
    i5 = i5 >>> 0;

    //if (arguments.length != 6) throw "bad args";
    //printf("hlineasm4\n");
    var shifter = ((256 - machxbits_al) & 0x1f);
    var source;

    var texture = textureSetup;
    var bits = bitsSetup;


    shade = shade & 0xffffff00;
    numPixels++;

    if (!RENDER_DRAW_CEILING_AND_FLOOR)
        return;

    var destArray = dest.array;
    // todo: for loop (faster!)
    for (; numPixels;) {

        source = i5 >>> shifter;
        source = shld(source, i4, bits) ;
        source = texture[source];

        // throw "todo: palookup is a list of pointers itself? - to a pallet or something";
        // globalpalwritten points to the first palookup pointer
        //if (pixelsAllowed-- > 0) {
            destArray[destOffset] = globalpalwritten[shade | source];
            //if (flatColor) destArray[destOffset] = 200;
            //console.log("hlineasm4Count: %i, numPixels: %i, shade: %i, i4: %i, i5: %i", hlineasm4Count, numPixels, shade, i4, i5);
            //console.log("dest: %i", destArray[destOffset]);
        //}

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
    rmach_eax = i1|0;
    rmach_ebx = i2|0;
    rmach_ecx = i3|0; // palookupoffs
    rmach_edx = i4|0;
    rmach_esi = i5|0;
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
    i1 = i1 | 0;
    i3 = i3 | 0;
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
        //if (flatColor) destArray[rmach6b + numPixels] = 100;
        //}

        texturePosition -= ebp;
    }

    texture.position = texturePosition;
}


var rmmach_eax;
var rmmach_ebx;
var rmmach_ecx;
var rmmach_edx;
var setupTileHeight;
function setuprmhlineasm4(i1, i2, i3, i4, tileHeight, i6)
{
    rmmach_eax = i1|0;
    rmmach_ebx = i2|0;
    rmmach_ecx = i3|0;
    rmmach_edx = i4|0;
    setupTileHeight = tileHeight|0;
}


//FCS: ????
function rmhlineasm4(i1, shade, colorIndex, i4, i5, dest) {
    i1 = i1 | 0;
    shade = shade | 0;
    colorIndex = colorIndex | 0;
    i4 = i4 | 0;
    i5 = i5 | 0;

    var ebp = (dest - i1) >>> 0;
    var rmach6b = (ebp - 1) >>> 0;
    var numPixels;
    
    //printf("rmhlineasm4\n");
    if (i1 <= 0)
        return;
//todo!
    //numPixels = i1;
    //do {
	//    //colorIndex = ((colorIndex&0xffffff00)|(*((uint8_t *)shade)));
	//    colorIndex = ((colorIndex&0xffffff00)|(*((uint8_t *)shade)));
	//    i4 -= rmmach_eax;
	//    ebp = (((i4+rmmach_eax) < i4) ? -1 : 0);
	//    i5 -= rmmach_ebx;
        
	//    if ((i5 + rmmach_ebx) < i5)
    //        shade -= (rmmach_ecx+1);
	//    else
    //        shade -= rmmach_ecx;
        
	//    ebp &= setupTileHeight;
        
    //    //Check if this colorIndex is the transparent color (255).
	//    if ((colorIndex&0xff) != 255) {
	//		if (pixelsAllowed-- > 0)
	//		{
	//			i1 = ((i1&0xffffff00)|(((uint8_t  *)colorIndex)[rmmach_edx]));
	//			((uint8_t  *)rmach6b)[numPixels] = (i1&0xff);
	//		}
	//    }
        
	//    shade -= ebp;
	//    numPixels--;
        
    //} while (numPixels);
} 

var bytesperline = 0;
function setBytesPerLine(_bytesPerLine) {
    //console.log("_bytesPerLine: ", _bytesPerLine);
    bytesperline = _bytesPerLine | 0;
}



// 220
var mach3_al = 0;

//FCS:  RENDER TOP AND BOTTOM COLUMN
function prevlineasm1(i1, palette, i3, i4, source, sourceOffset, destOffset, dest) {
    if (arguments.length != 8) {
        throw new Error("prevlineasm1 should have 8 arguments");
    }

    i1 = i1 | 0;
    i3 = i3 | 0;
    i4 = i4 | 0;

    //printf("prevlineasm1\n");
    if (i3 == 0) {
        if (!RENDER_DRAW_TOP_AND_BOTTOM_COLUMN)
            return 0;

        i1 += i4;
        i4 = (i4) >>> mach3_al;
        i4 = (i4 & 0xffffff00) | source[i4 + sourceOffset];

        //if (pixelsAllowed-- > 0) {
            dest.array[destOffset] = palette.getByte(i4);
            //if(flatColor) dest.array[destOffset] = 100;
        //}


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

    vince = vince | 0;
    numPixels = numPixels | 0;

    var temp;

    if (!RENDER_DRAW_WALL_BORDERS)
        return vplce;

    numPixels++;
    for (; numPixels;) {
        temp = vplce >>> mach3_al;

        temp = texture[textureOffset + temp];

        //if (pixelsAllowed-- > 0) {
            dest[destOffset] = palookupoffse.getByte(temp);
            //if (flatColor ) dest[destOffset] = 23;
            //printf("px:%i\n", dest[destOffset]);
        //}
        vplce += vince;
        destOffset += bytesperline;
        numPixels--;
    }

    return vplce;
}

//279     (todo: more of the func should be setup like this one?)
function tvlineasm1(i1,  texture,  numPixels,  i4, source, dest) {
    i1 = i1 | 0;
    i4 = i4 | 0;

    //printf("tvlineasm1\n");
    var shiftValue = (globalshiftval & 0x1f);
    var temp;
    var colorIndex;
    var framePlaceArray = frameplace.array;
    numPixels++;
    for (; numPixels;)
    {
        temp = i4 >>> 0;
        temp >>>= shiftValue;
        temp = source[temp];

        //255 is the index for transparent color index. Skip drawing this pixel. 
        if (temp != 255)
        {
            colorIndex = texture[temp];
            colorIndex |= ((framePlaceArray[dest]) << 8);
            
            if (transrev) 
                colorIndex = ((colorIndex>>8)|(colorIndex<<8));

            //if (pixelsAllowed-- > 0) {
                framePlaceArray[dest] = transluc[colorIndex];
                //if (flatColor) framePlaceArray[dest] = 160;
            //}
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

    i3 = i3 | 0;
    vplce = vplce | 0;
    
    var temp;
    printf("mvlineasm1\n");
    var textureArray = texture.array;
    var destArray = dest.array;

    for (; i3 >= 0; i3--) {
        temp = vplce >>> machmv;
        printf("temp1: %u\n", temp);
        temp = textureArray[texturePosition + temp];
        printf("temp2: %u\n", temp);

        if (temp != 255) {
            //if (pixelsAllowed-- > 0) {
                destArray[destPosition + dest.position] = palookupoffse.getByte(temp);
                //if (flatColor) destArray[destPosition + dest.position] = 180;
            //}
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
        throw new Error("vlineasm4 should have 4 arguments");
    }

    frameBuffer.position += frameBufferPosition;

    var i = 0;
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
            //if (flatColor) frameBufferArray[dest + index + i] = 25;
            //printf("px:%i\n", frameBufferArray[dest + index + i]);
            vplce[i] += vince[i];
        }
    }
}

//417
// another try for wallscan. maybe merge the two together later
// this draws a 4 pixel wide column. top to bottom.

var pa0;
var paPos0;
var pa1;
var paPos1;
var pa2;
var paPos2;
var pa3;
var paPos3;

var destPosition;
var texture;

var bufplce0;
var bufplce1;
var bufplce2;
var bufplce3;

var vplce0;
var vplce1;
var vplce2;
var vplce3;

var vince0;
var vince1;
var vince2;
var vince3;

function vlineasm4_2(columnIndex, frameBufferPosition) {
    if (!RENDER_DRAW_WALL_INSIDE)
        return;

    if (arguments.length != 2) {
        throw new Error("vlineasm4_2 should have 2 arguments");
    }

    //printf("vlineasm4   \n");
    var i = 0;
    //var temp;

    var index = frameBufferPosition + ylookup[columnIndex];
    var dest = new PointerHelper(frameplace.array, -ylookup[columnIndex]);
    var destArray = dest.array;

    pa0 = palookupoffse[0].array;
    paPos0 = palookupoffse[0].position;
    pa1 = palookupoffse[1].array;
    paPos1 = palookupoffse[1].position;
    pa2 = palookupoffse[2].array;
    paPos2 = palookupoffse[2].position;
    pa3 = palookupoffse[3].array;
    paPos3 = palookupoffse[3].position;

    destPosition = dest.position;
    texture = tiles[globalpicnum].data;

    bufplce0 = bufplce[0]; // todo: this must be overkill, check what v8 is doing
    bufplce1 = bufplce[1];
    bufplce2 = bufplce[2];
    bufplce3 = bufplce[3];

    vplce0 = vplce[0];
    vplce1 = vplce[1];
    vplce2 = vplce[2];
    vplce3 = vplce[3];

    vince0 = vince[0];
    vince1 = vince[1];
    vince2 = vince[2];
    vince3 = vince[3];

    for (; i < ((destPosition >>> 0) - bytesperline) < (destPosition >>> 0); destPosition += bytesperline) {

        //// unoptimized:
        //for (i = 0; i < 4; i++) {
        //    temp = (vplce[i]) >>> mach3_al;
        //    temp = tiles[globalpicnum].data[bufplce[i] + temp];

        //    //if (pixelsAllowed-- > 0) {
        //destArray[destPosition + index + i] = palookupoffse[i].getByte(temp);
        //    //if (flatColor) destArray[destPosition + index + i] = 250;
        //    //printf("px:%i\n", destArray[destPosition + index + i]);
        //    //}

        //    //appendCanvasImageToPage((destPosition + index + i) + "=" + palookup[palookupoffse[i]][temp]);
        //vplce[i] += vince[i];
        //}

        destArray[destPosition + index] = pa0[paPos0 + texture[bufplce0 + ((vplce0) >>> mach3_al)]];
        vplce0 += vince0;

        destArray[destPosition + index + 1] = pa1[paPos1 + texture[bufplce1 + ((vplce1) >>> mach3_al)]];
        vplce1 += vince1;

        destArray[destPosition + index + 2] = pa2[paPos2 + texture[bufplce2 + ((vplce2) >>> mach3_al)]];
        vplce2 += vince2;

        destArray[destPosition + index + 3] = pa3[paPos3 + texture[bufplce3 + ((vplce3) >>> mach3_al)]];
        vplce3 += vince3;
        i = 1; // required for for loop
    }
    
    vplce[0] = vplce0;
    vplce[1] = vplce1;
    vplce[2] = vplce2;
    vplce[3] = vplce3;
    dest.position = destPosition;
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

    column = column | 0;

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
                //if (pixelsAllowed-- > 0) {
                    frameBufferArray[dest + index + i] = palookupoffse[i].getByte(temp);
                    //if (flatColor) frameBufferArray[dest + index + i] = 190;
                //}
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
function DrawSpriteVerticalLine(i2, numPixels, i4, textureOffset, texture, dest) {
    i2 = i2 | 0;
    i4 = i4 >>> 0;

    //printf("DrawSpriteVerticalLine\n");
    // todo
    var colorIndex;
    texture = texture.array;

    //todo: for loop
    for (; numPixels;) {
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

                //if (pixelsAllowed-- > 0) {
                    //printf("dsv:%i\n", colorIndex);
                    dest.setByte(colorIndex);
                    //if (flatColor) dest.setByte(66);
                //}
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
    tsmach_eax1 = (i5 << 16) >>> 0;
    adder = ((i5 >> 16) + i2) >>> 0;
    tsmach_eax3 = (adder + i4) >>> 0;
    tsmach_ecx = i3 >>> 0;
}

/* ---------------  FLOOR/CEILING RENDERING METHOD (USED TO BE HIGHLY OPTIMIZED ASSEMBLY) ----------------------------*/
//739
function settrans(type) {
    transrev = type;
}

var textureData;
var mmach_asm3;
var mmach_asm1;
var mmach_asm2;

function mhline(texture, i2, numPixels, i4, i5, dest) {
    i2 = i2 | 0;
    i4 = i4 | 0;
    i5 = i5 | 0;
    textureData = texture;
    mmach_asm3 = asm3;
    mmach_asm1 = asm1;
    mmach_asm2 = asm2;
    printf("mmach_asm1: %u\n", mmach_asm1);
    printf("mmach_asm2: %u\n", mmach_asm2);
    mhlineskipmodify(i2,numPixels>>16,i5,dest);
}

var  mshift_al = 26;
var  mshift_bl = 6;
function mhlineskipmodify(  i2, numPixels, i5, dest)
{
    var ebx;
    var colorIndex;
    i2 = i2 >>> 0;

    printf("mhlineskipmodify i2: %u, numPixels: %i, i5: %i \n", i2, numPixels, i5);
    for (; numPixels >= 0;)
    {
	    ebx = i2 >>> mshift_al;
	    printf("ebx: %u\n", ebx);
	    ebx = shld(ebx, i5 >>> 0, mshift_bl) >>> 0;
	    printf("ebx: %u\n", ebx);
	    colorIndex = textureData[ebx];
	    printf("colorIndex: %u\n", colorIndex);

        //Skip transparent color.
		if ((colorIndex&0xff) != 0xff){
		    //if (pixelsAllowed-- > 0) {
                //todo: check
		        printf("px:%i\n", mmach_asm3.getByte(colorIndex));
		        frameplace.array[dest] = mmach_asm3.getByte(colorIndex);
		    //}
		}
	    i2 = (i2 + mmach_asm1) >>> 0;
        i5 = (i5 + mmach_asm2) | 0;
	    printf("i2: %u\n", i2);
	    printf("i5: %u\n", i5);
	    dest++;
	    numPixels--;

		
    }
}


function msethlineshift(i1, i2)
{
    i1 = 256-i1;
    mshift_al = (i1&0x1f);
    mshift_bl = (i2&0x1f);
} /* msethlineshift */

var  tmach_eax;
var  tmach_asm3;
var tmach_asm1;
var tmach_asm2;


//E4L5.map
function thline( i1,  i2,  i3,  i4,  i5,  i6)
{
    tmach_eax = i1;
    tmach_asm3 = asm3;
    tmach_asm1 = asm1;
    tmach_asm2 = asm2;
    thlineskipmodify(asm2,i2,i3,i4,i5,i6);
}

var tshift_al = 26;
var tshift_bl = 6;
function thlineskipmodify( i1, i2,  i3,  i4,  i5, i6)
{
    var ebx;
    var counter = (i3>>>16);
    printf("mhlineskipmodify\n");
    while (counter >= 0)
    {
        ebx = i2 >>> tshift_al;
        ebx = shld (ebx, i5 >>> 0, tshift_bl) >>> 0;
        i1 = tmach_eax[ebx];
        if ((i1&0xff) != 0xff)
        {
            var val = tmach_asm3[i1] >>> 0;
            val |= (frameoffset.array[i6])<<8;

            if (transrev) 
                val = ((val>>>8)|(val<<8));

            if (pixelsAllowed-- > 0)
                frameoffset.array[i6] = transluc[val];
        }

        i2 =  (i2 + tmach_asm1)>>>0;
        i5 += tmach_asm2;
        i6++;
        counter--;

		
    }
} 


function tsethlineshift(i1, i2) {
    i1 = 256-i1;
    tshift_al = (i1&0x1f);
    tshift_bl = (i2&0x1f);
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

    Object.defineProperty(this, 'i', { get: function() { return uintArray[0]; }, set: function(v) { uintArray[0] = v; } });
    Object.defineProperty(this, 'f', { get: function() { return floatArray[0]; }, set: function(v) { floatArray[0] = v; } });
}

setupslopevlin.c = new bitwisef2i();
function setupslopevlin(i1, i2, i3) {
    slopemach_ebx = i2;
    slopemach_ecx = i3;
    slopemach_edx = (1 << (i1 & 0x1f)) - 1;
    slopemach_edx <<= ((i1 & 0x1f00) >> 8);
    slopemach_ah1 = 32 - ((i1 & 0x1f00) >> 8);
    slopemach_ah2 = (slopemach_ah1 - (i1 & 0x1f)) & 0x1f;
    setupslopevlin.f = asm2_f[0] = /*(float)*/asm1;
    asm2 = setupslopevlin.i;
}

//870
function low32(a) { return (a & 0xffffffff);/*todo: does this even do anything?*/ }

//FCS: Render RENDER_SLOPPED_CEILING_AND_FLOOR
//var slopevlinCount = 0;
slopevlin.c = new bitwisef2i();
function slopevlin(i1, i2, i3, i4, i5, i6) {
    //printf("slopevlin\n");
    //var doCount = 0;
    //var whileCount = 0;
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
    var palookupGlobalpal = palookup[globalpal];
    var frameoffsetArray = frameoffset.array;
    do {
        // -------------
        // All this is calculating a fixed point approx. of 1/a
        slopevlin.c.f = a;
        fpuasm = eax = slopevlin.c.i;
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
        for (; ecx & 0xff ;)
        {
            ebx >>>= slopemach_ah2;
            esi += ecx;
            edx >>>= slopemach_ah1;
            ebx &= slopemach_edx;
            edi += eax;
            i1 += slopemach_ecx;
            edx = ((edx & 0xffffff00) | slopemach_ebx[ebx + edx]); 
            //printf("0doCount: %i, whileCount: %i, edx %u\n", doCount, whileCount, edx);
            ebx = i3.getInt32(); //todo: check tis uint32 in original, or was there a reason for this?
            //printf("i3.position: %i, ebx: %u\n", i3.position, ebx);
            i3.position-=4;
            //printf("1doCount: %i, whileCount: %i, eax %u\n", doCount, whileCount, eax);
            eax = ((eax & 0xffffff00) | palookupGlobalpal[edx + ebx]);
            //printf("2doCount: %i, whileCount: %i, eax %u\n", doCount, whileCount, eax);
            ebx = esi;

            //if (pixelsAllowed-- > 0) {
            frameoffsetArray[i1 + frameoffset.position] = (eax & 0xff); // *((uint8_t  *)i1) = (eax&0xff);
                //if (flatColor) frameplace.array[i1] = 44;
                //printf("doCount: %i, whileCount: %i, eax&0xff: %i\n", doCount, whileCount, eax & 0xff);
                //wrote++;
            //}
            edx = edi;
            ecx = ((ecx & 0xffffff00) | ((ecx - 1) & 0xff));
            //whileCount++;
        }
        ebx = asm4;
        ebx -= 8;	// BITSOFPRECISIONPOW


        //doCount++;
    } while (ebx > 0);


    //if (wrote > 2000 && !flushed) {
    //    console.log2flush();
    //    flushed = true;
    //}
    //slopevlinCount++;
}

var flushed = false;
var wrote = 0;
