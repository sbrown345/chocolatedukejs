'use strict';

//int32_t stereowidth = 23040, stereopixelwidth = 28, ostereopixelwidth = -1;
var stereomode = 0, visualpage, activepage, whiteband, blackband;
//uint8_t  oa1, o3c2, ortca, ortcb, overtbits, laststereoint;

var MAXCLIPNUM = 512;
var MAXPERMS = 512;
var MAXTILEFILES = 256;
var MAXYSAVES = ((MAXXDIM * MAXSPRITES) >> 7);
var MAXNODESPERLINE = 42;   /* Warning: This depends on MAXYSAVES & MAXYDIM! */
var MAXWALLSB = 2048;
var MAXCLIPDIST = 1024;

var moustat = 0;

var transarea = 0, beforedrawrooms = 1;

var oxdimen = -1, oviewingrange = -1, oxyaspect = -1;

var curbrightness = 0;

var picsiz = new Uint8Array(MAXTILES), tilefilenum = new Uint8Array(MAXTILES);
var lastageclock = 0;
var tilefileoffs = new Int32Array(MAXTILES);

var artsize = 0, cachesize = 0;

var radarang = new Int16Array(1280), radarang2 = new Int16Array(MAXXDIM + 1);
var sqrTable = new Uint16Array(4096), shLookup = new Uint16Array(4096 + 256);
var pow2char = [1, 2, 4, 8, 16, 32, 64, -128];
var pow2long =
[
    1, 2, 4, 8,
    16, 32, 64, 128,
    256, 512, 1024, 2048,
    4096, 8192, 16384, 32768,
    65536, 131072, 262144, 524288,
    1048576, 2097152, 4194304, 8388608,
    16777216, 33554432, 67108864, 134217728,
    268435456, 536870912, 1073741824, 2147483647
];

var recipTable = new Int32Array(2048), fpuasm = 0;

var kensMessage = "";

var briTable = [
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64),
    new Uint8Array(64)];

var textFont = new Uint8Array(1024), smallTextFont = new Uint8Array(1024);

var VEC_X = 0, VEC_Y = 1;
var VEC_COL = 0, VEC_DIST = 1;
// This is the structure emitted for each wall that is potentially visible.
// A stack of those is populated when the sectors are scanned.
function Wall() {
    this.cameraSpaceCoo = [new Int32Array(2), new Int32Array(2)]; //Camera space coordinates of the wall endpoints. Access with vector_index_e.
    this.sectorId = 0; //The index of the sector this wall belongs to in the map database.
    this.worldWallId = 0; //The index of the wall in the map database.
    this.screenSpaceCoo = [new Int32Array(2), new Int32Array(2)]; //Screen space coordinate of the wall endpoints. Access with screenSpaceCoo_index_e.
}

// Potentially Visible walls are stored in this stack.
var pvWalls = structArray(Wall, MAXWALLSB);




////xb1 and xb2 seems to be storing the column of the wall endpoint
////yb1 and yb2 store the Y distance from the camera.

////static int32_t xb1[MAXWALLSB], yb1[MAXWALLSB], xb2[MAXWALLSB], yb2[MAXWALLSB];

///*
////rx1,rx2,ry1,ry2 stores the cameraspace wall endpoints coordinates.
//static int32_t rx1[MAXWALLSB], ry1[MAXWALLSB], rx2[MAXWALLSB], ry2[MAXWALLSB];
//static short thesector[MAXWALLSB], thewall[MAXWALLSB];
//*/

//// bunchWallsList contains the list of walls in a bunch.
//static short bunchWallsList[MAXWALLSB];

//static short bunchfirst[MAXWALLSB], bunchlast[MAXWALLSB];



//static short smost[MAXYSAVES], smostcnt;
//static short smoststart[MAXWALLSB];
//static uint8_t  smostwalltype[MAXWALLSB];
//static int32_t smostwall[MAXWALLSB], smostwallcnt = -1L;

//static short maskwall[MAXWALLSB], maskwallcnt;
//static int32_t spritesx[MAXSPRITESONSCREEN];
//static int32_t spritesy[MAXSPRITESONSCREEN+1];
//static int32_t spritesz[MAXSPRITESONSCREEN];
//static spritetype *tspriteptr[MAXSPRITESONSCREEN];

////FCS: (up-most pixel on column x that can still be drawn to)
//short umost[MAXXDIM+1];

////FCS: (down-most pixel +1 on column x that can still be drawn to)
//short dmost[MAXXDIM+1];

//int16_t bakumost[MAXXDIM+1], bakdmost[MAXXDIM+1];
var uplc = new Int16Array(MAXXDIM + 1), dplc = new Int16Array(MAXXDIM + 1);
//static int16_t uwall[MAXXDIM+1], dwall[MAXXDIM+1];
//static int32_t swplc[MAXXDIM+1], lplc[MAXXDIM+1];
//static int32_t swall[MAXXDIM+1], lwall[MAXXDIM+4];
var xdimen = -1, xdimenrecip, halfxdimen, xdimenscale, xdimscale;
var wx1, wy1, wx2, wy2, ydimen;
var viewoffset;

//static int32_t rxi[8], ryi[8], rzi[8], rxi2[8], ryi2[8], rzi2[8];
//static int32_t xsi[8], ysi[8];

///* used to be static. --ryan. */
var horizlookup = 0, horizlookup2 = 0, horizycent;

//int32_t globalposx, globalposy, globalposz, globalhoriz;
//int16_t globalang, globalcursectnum;
var globalpal, cosglobalang, singlobalang;
//int32_t cosviewingrangeglobalang, sinviewingrangeglobalang;
var globalpalwritten; //ptr
//int32_t globaluclip, globaldclip, globvis = 0;
//int32_t globalvisibility, globalhisibility, globalpisibility, globalcisibility;
//uint8_t  globparaceilclip, globparaflorclip;

var xyaspect, viewingrangerecip;

//int32_t asm1, asm2, asm3, asm4;


var vplce = new Int32Array(4), vince = new Int32Array(4);
var bufplce = new Int32Array(4);

var palookupoffse = new Uint8Array(4);

//uint8_t  globalxshift, globalyshift;
//int32_t globalxpanning, globalypanning, globalshade;
//int16_t globalpicnum, globalshiftval;
//int32_t globalzd, globalyscale, globalorientation;
//uint8_t* globalbufplc;
//int32_t globalx1, globaly1, globalx2, globaly2, globalx3, globaly3, globalzx;
//int32_t globalx, globaly, globalz;

////FCS:
//// Those two variables are using during portal flooding:
//// sectorBorder is the stack and sectorbordercnt is the stack counter.
//// There is no really point to have this on the heap. That would have been better on the stack.

////static short sectorborder[256], sectorbordercnt;
////FCS: Moved this on the stack

var tablesLoaded = false;
var pageoffset, ydim16, qsetmode = 0;
//int32_t startposx, startposy, startposz;
//int16_t startang, startsectnum;
var pointhighlight, linehighlight, highlightcnt;
var lastx = new Int32Array(MAXYDIM);
var paletteloaded = false;

var FASTPALGRIDSIZ = 8;
var rdist = new Int32Array(129), gdist = new Int32Array(129), bdist = new Int32Array(129);
var colhere = new Uint8Array(((FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2)) >> 3);
var colhead = new Uint8Array((FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2));
var colnext = new Int32Array(256);
//static uint8_t  coldist[8] = {0,1,2,3,4,3,2,1};
var colscan = new Int32Array(27);

var permhead = 0, permtail = 0;

////FCS: Num walls to potentially render.
//short numscans ;

//short numbunches;

//short numhits;

//short editstatus = 0;
var searchit;
var searchx = -1, searchy;                     /* search input  */
var searchsector, searchwall, searchstat;     /* search output */

var numtilefiles, artfil = -1, artfilnum, artfilplc;


function initKSqrt() {
    var i, j, k;
    j = 1;
    k = 0;
    for (i = 0; i < 4096; i++) {
        if (i >= j) {
            j <<= 2;
            k++;
        }

        sqrTable[i] = Math.sqrt((i << 18) + 131072) << 1;
        shLookup[i] = (k << 1) + ((10 - k) << 8);
        if (i < 256) {
            shLookup[i + 4096] = ((k + 6) << 1) + ((10 - (k + 6)) << 8);
        }
    }
}

//658
function getpalookup(davis, dashade) {
    return (Math.min(Math.max(dashade + (davis >> 8), 0), numpalookups - 1));
}

//3488
function loadTables() {
    var i, file;
    if (!tablesLoaded) {
        initKSqrt();

        for (i = 0; i < 2048; i++) {
            recipTable[i] = divScale30(2048, i + 2048);
        }

        if ((file = TCkopen4load("tables.dat", false)) != -1) {
            for (i = 0; i < 2048; i++) {
                sinTable[i] = kread16(file);
            }

            for (i = 0; i < 640; i++) {
                radarang[i] = kread16(file);
            }

            for (i = 0; i < 640; i++) {
                radarang[1279 - i] = -radarang[i];
            }
            kread(file, textFont, 1024);
            kread(file, smallTextFont, 1024);
            var briTableTemp = new Uint8Array(1024);
            kread(file, briTableTemp, 1024);
            for (var j = 0; j < 16; j++) {
                for (var k = 0; k < 64; k++) {
                    briTable[j][k] = briTableTemp[j * 64 + k];
                }
            }

            kclose(file);
        }

        tablesLoaded = true;
    }
}

function initFastColorLookup(rScale, gScale, bScale) {
    var i, j, x, y, z;

    j = 0;
    for (i = 64; i >= 0; i--) {
        rdist[i] = rdist[128 - i] = j * rScale;
        gdist[i] = gdist[128 - i] = j * gScale;
        bdist[i] = bdist[128 - i] = j * bScale;
        j += 129 - (i << 1);
    }

    clearbufbyte(colhere, 0, colhere.length);
    clearbufbyte(colhead, 0, colhead.length);

    var pal1 = 768 - 3;
    for (i = 255; i >= 0; i--, pal1 -= 3) {
        j = (palette[pal1] >> 3) * FASTPALGRIDSIZ * FASTPALGRIDSIZ + (palette[pal1 + 1] >> 3) * FASTPALGRIDSIZ + (palette[pal1 + 2] >> 3) + FASTPALGRIDSIZ * FASTPALGRIDSIZ + FASTPALGRIDSIZ + 1;
        if (colhere[j >> 3] & pow2char[j & 7]) {
            colnext[i] = colhead[j];
        } else {
            colnext[i] = -1;
        }
        colhead[j] = i;
        colhere[j >> 3] |= pow2char[j & 7];
    }

    i = 0;
    for (x = -FASTPALGRIDSIZ * FASTPALGRIDSIZ; x <= FASTPALGRIDSIZ * FASTPALGRIDSIZ; x += FASTPALGRIDSIZ * FASTPALGRIDSIZ)
        for (y = -FASTPALGRIDSIZ; y <= FASTPALGRIDSIZ; y += FASTPALGRIDSIZ)
            for (z = -1; z <= 1; z++)
                colscan[i++] = x + y + z;
    i = colscan[13];
    colscan[13] = colscan[26];
    colscan[26] = i;
}

function loadPalette() {
    var file;

    if (paletteloaded) {
        return;
    }

    if ((file = TCkopen4load("palette.dat", false)) == -1) {
        return;
    }

    kread(file, palette, 768);

    numpalookups = kread16(file);

    // todo: check these caching methods that dont' seem to get run??, what are they for?

    globalpalwritten = 0; //palookup[0] - pointer
    globalpal = 0;

    kread(file, palookup, numpalookups << 8); // todo check all this

    kread(file, transluc, 65536); // todo check all this

    kclose(file);

    initFastColorLookup(30, 59, 11);

    paletteloaded = true;
}

function setGameMode(screenMode, screenWidth, screenHeight) {
    kensMessage = "!!!! BUILD engine&tools programmed by Ken Silverman of E.G. RI.  (c) Copyright 1995 Ken Silverman.  Summary:  BUILD = Ken. !!!!";
    Display.setGameMode(screenMode, screenWidth, screenHeight);
}

//3621
function initEngine() {
    var i;

    loadTables();

    pskyoff[0] = 0;
    pskybits = 0;

    parallaxtype = 2;
    parallaxyoffs = 0;
    parallaxyscale = 65536;
    showinvisibility = 0;

    paletteloaded = false;

    searchit = 0;
    searchstat = -1;

    for (i = 0; i < MAXPALOOKUPS; i++) {
        palookup[i] = null;
    }

    for (i = 0; i < MAXTILES; i++) {
        tiles[i].data = null;
    }

    show2dsector = new Uint8Array((MAXSECTORS + 7) >> 3);
    show2dwallnew = new Uint8Array((MAXWALLS + 7) >> 3);
    show2dspritenew = new Uint8Array((MAXSPRITES + 7) >> 3);
    automapping = 0;

    validmodecnt = 0;

    pointhighlight = -1;
    linehighlight = -1;
    highlightcnt = 0;

    totalclock = 0;
    visibility = 512;
    parallaxvisibility = 512;

    loadPalette();
}

/* Assume npoints=4 with polygon on &rx1,&ry1 */
// FCS This is horrible to read: I hate you.
function clipPoly4(cx1, cy1, cx2, cy2) {
    var n, nn, z, zz, x, x1, x2, y, y1, y2, t;

    nn = 0;
    z = 0;
    do {
        zz = ((z + 1) & 3);


        x1 = pvWalls[z].cameraSpaceCoo[0][VEC_X];
        x2 = pvWalls[zz].cameraSpaceCoo[0][VEC_X] - x1;

        if ((cx1 <= x1) && (x1 <= cx2)) {
            pvWalls[nn].cameraSpaceCoo[1][VEC_X] = x1;
            pvWalls[nn].cameraSpaceCoo[1][VEC_Y] = pvWalls[z].cameraSpaceCoo[0][VEC_Y];
            nn++;
        }

        if (x2 <= 0)
            x = cx2;
        else
            x = cx1;

        t = x - x1;

        if (((t - x2) ^ t) < 0) {
            pvWalls[nn].cameraSpaceCoo[1][VEC_X] = x;
            pvWalls[nn].cameraSpaceCoo[1][VEC_Y] = pvWalls[z].cameraSpaceCoo[0][VEC_Y] +
                scale(t, pvWalls[zz].cameraSpaceCoo[0][VEC_Y] - pvWalls[z].cameraSpaceCoo[0][VEC_Y], x2);
            nn++;
        }

        if (x2 <= 0)
            x = cx1;
        else
            x = cx2;

        t = x - x1;

        if (((t - x2) ^ t) < 0) {
            pvWalls[nn].cameraSpaceCoo[1][VEC_X] = x;
            pvWalls[nn].cameraSpaceCoo[1][VEC_Y] = pvWalls[z].cameraSpaceCoo[0][VEC_Y] +
                scale(t, pvWalls[zz].cameraSpaceCoo[0][VEC_Y] - pvWalls[z].cameraSpaceCoo[0][VEC_Y], x2);
            nn++;
        }
        z = zz;
    } while (z != 0);
    if (nn < 3) return (0);

    n = 0;
    z = 0;
    do {
        zz = z + 1;
        if (zz == nn)
            zz = 0;

        y1 = pvWalls[z].cameraSpaceCoo[1][VEC_Y];
        y2 = pvWalls[zz].cameraSpaceCoo[1][VEC_Y] - y1;

        if ((cy1 <= y1) && (y1 <= cy2)) {
            pvWalls[n].cameraSpaceCoo[0][VEC_Y] = y1;
            pvWalls[n].cameraSpaceCoo[0][VEC_X] = pvWalls[z].cameraSpaceCoo[1][VEC_X];
            n++;
        }
        if (y2 <= 0) y = cy2;
        else y = cy1;
        t = y - y1;
        if (((t - y2) ^ t) < 0) {
            pvWalls[n].cameraSpaceCoo[0][VEC_Y] = y;
            pvWalls[n].cameraSpaceCoo[0][VEC_X] =
            pvWalls[z].cameraSpaceCoo[1][VEC_X] + scale(t,
                                                       pvWalls[zz].cameraSpaceCoo[1][VEC_X] -
                                                       pvWalls[z].cameraSpaceCoo[1][VEC_X], y2);
            n++;
        }

        if (y2 <= 0) y = cy1;
        else y = cy2;
        t = y - y1;
        if (((t - y2) ^ t) < 0) {
            pvWalls[n].cameraSpaceCoo[0][VEC_Y] = y;
            pvWalls[n].cameraSpaceCoo[0][VEC_X] =
            pvWalls[z].cameraSpaceCoo[1][VEC_X] + scale(t,
                                                       pvWalls[zz].cameraSpaceCoo[1][VEC_X] -
                                                       pvWalls[z].cameraSpaceCoo[1][VEC_X], y2);
            n++;
        }
        z = zz;
    } while (z != 0);
    return (n);
}

//3781
function doRotateSprite(sx, sy, z, a, picnum, dashade, dapalnum, dastat, cx1, cy1, cx2, cy2) {
    var cosang, sinang, v, nextv, dax1, dax2, oy, bx, by, ny1, ny2;
    var i, x, y, x1, y1, x2, y2, gx1, gy1;
    var bufplc;
    var palookupoffs;
    var p;
    var xoff, yoff, npoints, yplc, yinc, lx, rx, xx, xend;
    var xv, yv, xv2, yv2, obuffermode = 0, qlinemode = 0, y1ve = new Int32Array(4), y2ve = new Int32Array(4), u4, d4;
    var bad;

    var tileWidht, tileHeight;

    tileWidht = tiles[picnum].dim.width;
    tileHeight = tiles[picnum].dim.height;

    if (dastat & 16) {
        xoff = 0;
        yoff = 0;
    } else {
        throw new Error("todo");
    }

    if (dastat & 4) {
        yoff = tileHeight - yoff;
    }

    cosang = sinTable[(a + 512) & 2047];
    sinang = sinTable[a & 2047];


    if ((dastat & 2) != 0)  /* Auto window size scaling */ {
        if ((dastat & 8) == 0) {
            x = xdimenscale;   /* = scale(xdimen,yxaspect,320); */
            if (stereomode) x = scale(windowx2 - windowx1 + 1, yxaspect, 320);
            sx = ((cx1 + cx2 + 2) << 15) + scale(sx - (320 << 15), xdimen, 320);
            sy = ((cy1 + cy2 + 2) << 15) + mulscale16(sy - (200 << 15), x);
        }
        else {
            /*
             * If not clipping to startmosts, & auto-scaling on, as a
             *  hard-coded bonus, scale to full screen instead
             */
            x = scale(xdim, yxaspect, 320);
            sx = (xdim << 15) + 32768 + scale(sx - (320 << 15), xdim, 320);
            sy = (ydim << 15) + 32768 + mulscale16(sy - (200 << 15), x);
        }
        z = mulscale16(z, x);
    }

    xv = mulscale14(cosang, z);
    yv = mulscale14(sinang, z);
    if (((dastat & 2) != 0) || ((dastat & 8) == 0)) /* Don't aspect unscaled perms */ {
        xv2 = mulscale16(xv, xyaspect);
        yv2 = mulscale16(yv, xyaspect);
    }
    else {
        xv2 = xv;
        yv2 = yv;
    }

    //Taking care of the Y coordinates.
    pvWalls[0].cameraSpaceCoo[0][VEC_Y] = sy - (yv * xoff + xv * yoff);
    pvWalls[1].cameraSpaceCoo[0][VEC_Y] = pvWalls[0].cameraSpaceCoo[0][VEC_Y] + yv * tileWidht;
    pvWalls[3].cameraSpaceCoo[0][VEC_Y] = pvWalls[0].cameraSpaceCoo[0][VEC_Y] + xv * tileHeight;

    pvWalls[2].cameraSpaceCoo[0][VEC_Y] = pvWalls[1].cameraSpaceCoo[0][VEC_Y] +
                                          pvWalls[3].cameraSpaceCoo[0][VEC_Y] -
                                          pvWalls[0].cameraSpaceCoo[0][VEC_Y];
    i = (cy1 << 16);

    if ((pvWalls[0].cameraSpaceCoo[0][VEC_Y] < i) &&
        (pvWalls[1].cameraSpaceCoo[0][VEC_Y] < i) &&
        (pvWalls[2].cameraSpaceCoo[0][VEC_Y] < i) &&
        (pvWalls[3].cameraSpaceCoo[0][VEC_Y] < i))
        return;

    i = (cy2 << 16);

    if ((pvWalls[0].cameraSpaceCoo[0][VEC_Y] > i) &&
        (pvWalls[1].cameraSpaceCoo[0][VEC_Y] > i) &&
        (pvWalls[2].cameraSpaceCoo[0][VEC_Y] > i) &&
        (pvWalls[3].cameraSpaceCoo[0][VEC_Y] > i))
        return;



    //Taking care of the X coordinates.
    pvWalls[0].cameraSpaceCoo[0][VEC_X] = sx - (xv2 * xoff - yv2 * yoff);
    pvWalls[1].cameraSpaceCoo[0][VEC_X] = pvWalls[0].cameraSpaceCoo[0][VEC_X] + xv2 * tileWidht;
    pvWalls[3].cameraSpaceCoo[0][VEC_X] = pvWalls[0].cameraSpaceCoo[0][VEC_X] - yv2 * tileHeight;
    pvWalls[2].cameraSpaceCoo[0][VEC_X] = pvWalls[1].cameraSpaceCoo[0][VEC_X] +
                                          pvWalls[3].cameraSpaceCoo[0][VEC_X] -
                                          pvWalls[0].cameraSpaceCoo[0][VEC_X];

    i = (cx1 << 16);
    if ((pvWalls[0].cameraSpaceCoo[0][VEC_X] < i) &&
        (pvWalls[1].cameraSpaceCoo[0][VEC_X] < i) &&
        (pvWalls[2].cameraSpaceCoo[0][VEC_X] < i) &&
        (pvWalls[3].cameraSpaceCoo[0][VEC_X] < i))
        return;

    i = (cx2 << 16);
    if ((pvWalls[0].cameraSpaceCoo[0][VEC_X] > i) &&
        (pvWalls[1].cameraSpaceCoo[0][VEC_X] > i) &&
        (pvWalls[2].cameraSpaceCoo[0][VEC_X] > i) &&
        (pvWalls[3].cameraSpaceCoo[0][VEC_X] > i))
        return;




    gx1 = pvWalls[0].cameraSpaceCoo[0][VEC_X];
    gy1 = pvWalls[0].cameraSpaceCoo[0][VEC_Y];   /* back up these before clipping */

    if ((npoints = clipPoly4(cx1 << 16, cy1 << 16, (cx2 + 1) << 16, (cy2 + 1) << 16)) < 3) {
        return;
    }

    lx = pvWalls[0].cameraSpaceCoo[0][VEC_X];
    rx = pvWalls[0].cameraSpaceCoo[0][VEC_X];

    nextv = 0;
    for (v = npoints - 1; v >= 0; v--) {
        x1 = pvWalls[v].cameraSpaceCoo[0][VEC_X];
        x2 = pvWalls[nextv].cameraSpaceCoo[0][VEC_X];
        dax1 = (x1 >> 16);
        if (x1 < lx) lx = x1;
        dax2 = (x2 >> 16);
        if (x1 > rx) rx = x1;
        if (dax1 != dax2) {
            y1 = pvWalls[v].cameraSpaceCoo[0][VEC_Y];
            y2 = pvWalls[nextv].cameraSpaceCoo[0][VEC_Y];
            yinc = divScale16(y2 - y1, x2 - x1);
            if (dax2 > dax1) {
                yplc = y1 + mulscale16((dax1 << 16) + 65535 - x1, yinc);
                if (dax1 != 0) {
                    throw new Error("need to set start pointer for array, note: (& uplc[dax1])");
                }
                //qinterpolatedown16short((int32_t *)(&uplc[dax1]),dax2-dax1,yplc,yinc);
                qinterpolatedown16short(uplc, dax2 - dax1, yplc, yinc);
            } else {
                yplc = y2 + mulscale16((dax2 << 16) + 65535 - x2, yinc);
                if (dax2 != 0) {
                    throw new Error("need to set start pointer for array, note: (& dplc[dax2])");
                }
                //qinterpolatedown16short((int32_t * )( & dplc[dax2]), dax1 - dax2, yplc, yinc);
                qinterpolatedown16short(dplc, dax1 - dax2, yplc, yinc);
            }
        }
        nextv = v;
    }

    TILE_MakeAvailable(picnum);

    setgotpic(picnum);
    bufplc = new PointerHelper(tiles[picnum].data);

    palookupoffs = palookup[dapalnum] + (getpalookup(0, dashade) << 8);

    i = divScale32(1, z);
    xv = mulscale14(sinang, i);
    yv = mulscale14(cosang, i);
    if (((dastat & 2) != 0) || ((dastat & 8) == 0)) /* Don't aspect unscaled perms */ {
        yv2 = mulscale16(-xv, yxaspect);
        xv2 = mulscale16(yv, yxaspect);
    }
    else {
        yv2 = -xv;
        xv2 = yv;
    }

    x1 = (lx >> 16);
    x2 = (rx >> 16);

    oy = 0;
    x = (x1 << 16) - 1 - gx1;
    y = (oy << 16) + 65535 - gy1;
    bx = dmulscale16(x, xv2, y, xv);
    by = dmulscale16(x, yv2, y, yv);

    if (dastat & 4) {
        yv = -yv;
        yv2 = -yv2;
        by = (tileHeight << 16) - 1 - by;
    }

    // todo: check this vidoption is right
    if ((vidoption == 1) && (origbuffermode == 0)) {
        if (dastat & 128) {
            obuffermode = buffermode;
            buffermode = 0;

        }
    }
    else if (dastat & 8) {
        permanentupdate = 1;
    }

    if ((dastat & 1) == 0) {
        if (((a & 1023) == 0) && (tileHeight <= 256))  /* vlineasm4 has 256 high limit! */ {

            if (dastat & 64) {
                setupvlineasm(24);
            } else {
                setupmvlineasm(24);
            }
            
            by <<= 8;
            yv <<= 8;
            yv2 <<= 8;

            palookupoffse[0] = palookupoffse[1] = palookupoffse[2] = palookupoffse[3] = palookupoffs;
            vince[0] = vince[1] = vince[2] = vince[3] = yv;

            for(x=x1; x<x2; x+=4)
            {
                bad = 15;
                xend = Math.min(x2-x,4);
                for(xx=0; xx<xend; xx++)
                {
                    bx += xv2;

                    y1 = uplc[x+xx];
                    y2 = dplc[x+xx];
                    if ((dastat&8) == 0)
                    {
                        if (startumost[x+xx] > y1) y1 = startumost[x+xx];
                        if (startdmost[x+xx] < y2) y2 = startdmost[x+xx];
                    }
                    if (y2 <= y1) continue;

                    by += yv*(y1-oy);
                    oy = y1;

                    bufplce[xx] = (bx >> 16) * tileHeight + bufplc.position;
                    vplce[xx] = by;
                    y1ve[xx] = y1;
                    y2ve[xx] = y2-1;
                    bad &= ~pow2char[xx];
                }

                p = frameplace;
                p.position += x;

                u4 = Math.max(Math.max(y1ve[0], y1ve[1]), Math.max(y1ve[2], y1ve[3]));
                d4 = Math.min(Math.min(y2ve[0], y2ve[1]),Math.min(y2ve[2],y2ve[3]));

                if (dastat&64)
                {
                    if ((bad != 0) || (u4 >= d4))
                    {
                        if (!(bad&1)) 
                            prevlineasm1(vince[0],palookupoffse[0],y2ve[0]-y1ve[0],vplce[0],bufplce[0],ylookup[y1ve[0]]+p+0);
                        if (!(bad&2)) 
                            prevlineasm1(vince[1],palookupoffse[1],y2ve[1]-y1ve[1],vplce[1],bufplce[1],ylookup[y1ve[1]]+p+1);
                        if (!(bad&4)) 
                            prevlineasm1(vince[2],palookupoffse[2],y2ve[2]-y1ve[2],vplce[2],bufplce[2],ylookup[y1ve[2]]+p+2);
                        if (!(bad&8)) 
                            prevlineasm1(vince[3],palookupoffse[3],y2ve[3]-y1ve[3],vplce[3],bufplce[3],ylookup[y1ve[3]]+p+3);
                        continue;
                    }

                    if (u4 > y1ve[0]) 
                        vplce[0] = prevlineasm1(vince[0],palookupoffse[0],u4-y1ve[0]-1,vplce[0],bufplce[0],ylookup[y1ve[0]]+p+0);
                    if (u4 > y1ve[1]) 
                        vplce[1] = prevlineasm1(vince[1],palookupoffse[1],u4-y1ve[1]-1,vplce[1],bufplce[1],ylookup[y1ve[1]]+p+1);
                    if (u4 > y1ve[2]) 
                        vplce[2] = prevlineasm1(vince[2],palookupoffse[2],u4-y1ve[2]-1,vplce[2],bufplce[2],ylookup[y1ve[2]]+p+2);
                    if (u4 > y1ve[3]) 
                        vplce[3] = prevlineasm1(vince[3],palookupoffse[3],u4-y1ve[3]-1,vplce[3],bufplce[3],ylookup[y1ve[3]]+p+3);

                    if (d4 >= u4) {
                        vlineasm4(d4 - u4 + 1, bufplc, ylookup[u4], p);
                    }

                    i = p.position+ylookup[d4+1];
                    if (y2ve[0] > d4) 
                        prevlineasm1(vince[0],palookupoffse[0],y2ve[0]-d4-1,vplce[0],bufplce[0],i+0);
                    if (y2ve[1] > d4) 
                        prevlineasm1(vince[1],palookupoffse[1],y2ve[1]-d4-1,vplce[1],bufplce[1],i+1);
                    if (y2ve[2] > d4) 
                        prevlineasm1(vince[2],palookupoffse[2],y2ve[2]-d4-1,vplce[2],bufplce[2],i+2);
                    if (y2ve[3] > d4) 
                        prevlineasm1(vince[3],palookupoffse[3],y2ve[3]-d4-1,vplce[3],bufplce[3],i+3);
                }
                else
                {
                    if ((bad != 0) || (u4 >= d4))
                    {
                        if (!(bad&1)) mvlineasm1(vince[0],palookupoffse[0],y2ve[0]-y1ve[0],vplce[0],bufplce[0],ylookup[y1ve[0]]+p+0);
                        if (!(bad&2)) mvlineasm1(vince[1],palookupoffse[1],y2ve[1]-y1ve[1],vplce[1],bufplce[1],ylookup[y1ve[1]]+p+1);
                        if (!(bad&4)) mvlineasm1(vince[2],palookupoffse[2],y2ve[2]-y1ve[2],vplce[2],bufplce[2],ylookup[y1ve[2]]+p+2);
                        if (!(bad&8)) mvlineasm1(vince[3],palookupoffse[3],y2ve[3]-y1ve[3],vplce[3],bufplce[3],ylookup[y1ve[3]]+p+3);
                        continue;
                    }

                    if (u4 > y1ve[0]) vplce[0] = mvlineasm1(vince[0],palookupoffse[0],u4-y1ve[0]-1,vplce[0],bufplce[0],ylookup[y1ve[0]]+p+0);
                    if (u4 > y1ve[1]) vplce[1] = mvlineasm1(vince[1],palookupoffse[1],u4-y1ve[1]-1,vplce[1],bufplce[1],ylookup[y1ve[1]]+p+1);
                    if (u4 > y1ve[2]) vplce[2] = mvlineasm1(vince[2],palookupoffse[2],u4-y1ve[2]-1,vplce[2],bufplce[2],ylookup[y1ve[2]]+p+2);
                    if (u4 > y1ve[3]) vplce[3] = mvlineasm1(vince[3],palookupoffse[3],u4-y1ve[3]-1,vplce[3],bufplce[3],ylookup[y1ve[3]]+p+3);

                    if (d4 >= u4) mvlineasm4(d4-u4+1,ylookup[u4]+p);

                    i = p.position+ylookup[d4+1];
                    if (y2ve[0] > d4) mvlineasm1(vince[0],palookupoffse[0],y2ve[0]-d4-1,vplce[0],bufplce[0],i+0);
                    if (y2ve[1] > d4) mvlineasm1(vince[1],palookupoffse[1],y2ve[1]-d4-1,vplce[1],bufplce[1],i+1);
                    if (y2ve[2] > d4) mvlineasm1(vince[2],palookupoffse[2],y2ve[2]-d4-1,vplce[2],bufplce[2],i+2);
                    if (y2ve[3] > d4) mvlineasm1(vince[3],palookupoffse[3],y2ve[3]-d4-1,vplce[3],bufplce[3],i+3);
                }

                faketimerhandler();
            }
        } else {
            if (dastat & 64) {
                if ((xv2 & 0x0000ffff) == 0) {
                    qlinemode = 1;
                    setuprhlineasm4(0, yv2 << 16, (xv2 >> 16) * tileHeight + (yv2 >> 16), palookupoffs, 0, 0);
                }
                else {
                    qlinemode = 0;
                    setuprhlineasm4(xv2 << 16, yv2 << 16, (xv2 >> 16) * tileHeight + (yv2 >> 16), palookupoffs, tileHeight, 0);
                }
            }
            else {
                setuprmhlineasm4(xv2 << 16, yv2 << 16, (xv2 >> 16) * tileHeight + (yv2 >> 16), palookupoffs, tileHeight, 0);
            }
            
            y1 = uplc[x1];
            if (((dastat&8) == 0) && (startumost[x1] > y1)) y1 = startumost[x1];
            y2 = y1;
            for(x=x1; x<x2; x++)
            {
                ny1 = uplc[x]-1;
                ny2 = dplc[x];
                if ((dastat&8) == 0)
                {
                    if (startumost[x]-1 > ny1) ny1 = startumost[x]-1;
                    if (startdmost[x] < ny2) ny2 = startdmost[x];
                }

                if (ny1 < ny2-1)
                {
                    if (ny1 >= y2)
                    {
                        while (y1 < y2-1)
                        {
                            y1++;
                            if ((y1&31) == 0) faketimerhandler();

                            /* x,y1 */
                            bx += xv*(y1-oy);
                            by += yv*(y1-oy);
                            oy = y1;
                            if (dastat&64) {
                                if (qlinemode)
                                    rhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,0    ,by<<16,ylookup[y1]+x,frameplace);
                            else
                                    rhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x,frameplace);
                            } else
                                rmhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x,frameplace);
                        }
                        y1 = ny1;
                    }
                    else
                    {
                        while (y1 < ny1)
                        {
                            y1++;
                            if ((y1&31) == 0) faketimerhandler();

                            /* x,y1 */
                            bx += xv*(y1-oy);
                            by += yv*(y1-oy);
                            oy = y1;
                            if (dastat&64) {
                                if (qlinemode)
                                    rhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,0,by<<16,ylookup[y1]+x,frameplace);
                            else
                                    rhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x,frameplace);
                            } else
                                rmhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x,frameplace);
                        }
                        while (y1 > ny1) lastx[y1--] = x;
                    }
                    while (y2 > ny2)
                    {
                        y2--;
                        if ((y2&31) == 0) faketimerhandler();

                        /* x,y2 */
                        bx += xv*(y2-oy);
                        by += yv*(y2-oy);
                        oy = y2;
                        if (dastat&64) {
                            if (qlinemode)
                                rhlineasm4(x-lastx[y2],(bx>>16)*tileHeight+(by>>16),bufplc,0,0    ,by<<16,ylookup[y2]+x,frameplace);
                        else
                                rhlineasm4(x-lastx[y2],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y2]+x,frameplace);
                        } else
                            rmhlineasm4(x-lastx[y2],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y2]+x,frameplace);
                    }
                    while (y2 < ny2) lastx[y2++] = x;
                }
                else
                {
                    while (y1 < y2-1)
                    {
                        y1++;
                        if ((y1&31) == 0) faketimerhandler();

                        /* x,y1 */
                        bx += xv*(y1-oy);
                        by += yv*(y1-oy);
                        oy = y1;
                        if (dastat&64)
                        {
                            if (qlinemode)
                                rhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,0    ,by<<16,ylookup[y1]+x,frameplace);
                        else
                                rhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x,frameplace);
                        }
                        else
                            rmhlineasm4(x-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x,frameplace);
                    }
                    if (x == x2-1)
                    {
                        bx += xv2;
                        by += yv2;
                        break;
                    }

                    y1 = uplc[x+1];

                    if (((dastat&8) == 0) && (startumost[x+1] > y1))
                        y1 = startumost[x+1];

                    y2 = y1;
                }
                bx += xv2;
                by += yv2;
            }
            while (y1 < y2-1)
            {
                y1++;
                if ((y1&31) == 0) faketimerhandler();

                /* x2,y1 */
                bx += xv*(y1-oy);
                by += yv*(y1-oy);
                oy = y1;
                if (dastat&64) {
                    if (qlinemode) {
                        rhlineasm4(x2 - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, 0, by << 16, ylookup[y1] + x2,frameplace);
                    }
                    else
                        rhlineasm4(x2 - lastx[y1], (bx >> 16) * tileHeight + (by >> 16) ,bufplc, 0, bx << 16, by << 16, ylookup[y1] + x2,frameplace);
                } else
                    rmhlineasm4(x2-lastx[y1],(bx>>16)*tileHeight+(by>>16),bufplc,0,bx<<16,by<<16,ylookup[y1]+x2,frameplace);
            }
        }
    }
    else
    {
        if ((dastat&1) == 0)
        {
            if (dastat&64)
                setupspritevline(palookupoffs,(xv>>16)*tileHeight,xv<<16,tileHeight,yv,0);
            else
                msetupspritevline(palookupoffs,(xv>>16)*tileHeight,xv<<16,tileHeight,yv,0);
        }
        else
        {
            tsetupspritevline(palookupoffs,(xv>>16)*tileHeight,xv<<16,tileHeight,yv);

            if (dastat&32) 
                settrans(TRANS_REVERSE);
            else 
                settrans(TRANS_NORMAL);
        }

        for(x=x1; x<x2; x++)
        {
            bx += xv2;
            by += yv2;

            y1 = uplc[x];
            y2 = dplc[x];
            if ((dastat&8) == 0)
            {
                if (startumost[x] > y1) y1 = startumost[x];
                if (startdmost[x] < y2) y2 = startdmost[x];
            }
            if (y2 <= y1) continue;

            switch(y1-oy)
            {
                case -1:
                    bx -= xv;
                    by -= yv;
                    oy = y1;
                    break;
                case 0:
                    break;
                case 1:
                    bx += xv;
                    by += yv;
                    oy = y1;
                    break;
                default:
                    bx += xv*(y1-oy);
                    by += yv*(y1-oy);
                    oy = y1;
                    break;
            }

            p = ylookup[y1] + x + frameplace.position;

            if ((dastat&1) == 0)
            {
                if (dastat&64)
                    spritevline(0,by<<16,y2-y1+1,bx<<16,(bx>>16)*tileHeight+(by>>16),bufplc,p);
            else
                    mspritevline(0,by<<16,y2-y1+1,bx<<16,(bx>>16)*tileHeight+(by>>16),bufplc,p);
            }
            else
            {
                DrawSpriteVerticalLine(by<<16,y2-y1+1,bx<<16,(bx>>16)*tileHeight+(by>>16),bufplc,p);
                transarea += (y2-y1);
            }
            faketimerhandler();
        }
    }

    if ((vidoption == 1) && (dastat&128) && (origbuffermode == 0))
    {
        buffermode = obuffermode;
    }
}

// 7978
function setView(x1, y1, x2, y2) {
    var i;

    windowx1 = x1;
    wx1 = (x1 << 12);
    windowy1 = y1;
    wy1 = (y1 << 12);
    windowx2 = x2;
    wx2 = ((x2 + 1) << 12);
    windowy2 = y2;
    wy2 = ((y2 + 1) << 12);

    xdimen = (x2 - x1) + 1;
    halfxdimen = (xdimen >> 1);
    xdimenrecip = divScale32(1, xdimen);
    ydimen = (y2 - y1) + 1;

    setAspect(65536, divScale16(ydim * 320, xdim * 200));

    for (i = 0; i < windowx1; i++) {
        startumost[i] = 1;
        startdmost[i] = 0;
    }

    for (i = windowx1; i <= windowx2; i++) {
        startumost[i] = windowy1, startdmost[i] = windowy2 + 1;
    }

    for (i = windowx2 + 1; i < xdim; i++) {
        startumost[i] = 1, startdmost[i] = 0;
    }

    viewoffset = windowy1 * bytesperline + windowx1;

    if (stereomode) {
        throw new Error("todo"); // todo
    }
}

//2593
function setAspect(daxrange, daaspect) {
    viewingrange = daxrange;
    viewingrangerecip = divScale32(1, daxrange);

    yxaspect = daaspect;
    xyaspect = divScale32(1, yxaspect);
    xdimenscale = scale(xdimen, yxaspect, 320);
    xdimscale = scale(320, xyaspect, xdimen);
}

//4332
function nextpage() {
    var i, per;

    if (qsetmode === 200) {
        for (i = permtail; i != permhead; i = ((i + 1) & (MAXPERMS - 1))) {
            throw new Error("todo"); //per = &permfifo[i];
            //if ((per->pagesleft > 0) && (per->pagesleft <= numpages))
            //    dorotatesprite(per->sx,per->sy,per->z,per->a,per->picnum,per->dashade,per->dapalnum,per->dastat,per->cx1,per->cy1,per->cx2,per->cy2);
        }
    }

    _nextpage();

    if (qsetmode === 200) {
        for (i = permtail; i != permhead; i = ((i + 1) & (MAXPERMS - 1))) {
            throw new Error("todo");
        }
    }

    faketimerhandler();

    if ((totalclock >= lastageclock + 8) || (totalclock < lastageclock)) {
        lastageclock = totalclock;
        agecache();
    }

    beforedrawrooms = 1;
    numframes++;
    console.log("numframes: %i", numframes);
}

//8034
function flushperms() {
    permhead = permtail = 0;
}

// Render a sprite on screen. This is used by the Engine but also the Game module
// when drawing the HUD or the Weapon held by the player !!!
function rotateSprite(sx, sy, z, a, picnum, dashade, dapalnum, dastat, cx1, cy1, cx2, cy2) {
    var i;
    var per, per2;

    //If 2D target coordinate do not make sense (left > right)..
    if ((cx1 > cx2) || (cy1 > cy2))
        return;

    if (z <= 16)
        return;

    if (tiles[picnum].animFlags & 192) {
        picnum += animateoffs(picnum);
    }

    //Does the tile has negative dimensions ?
    if ((tiles[picnum].dim.width <= 0) || (tiles[picnum].dim.height <= 0)) {
        return;
    }

    if (((dastat & 128) == 0) || (numpages < 2) || (beforedrawrooms != 0)) {
        doRotateSprite(sx, sy, z, a, picnum, dashade, dapalnum, dastat, cx1, cy1, cx2, cy2);
    }

    if ((dastat & 64) && (cx1 <= 0) && (cy1 <= 0) && (cx2 >= xdim - 1) && (cy2 >= ydim - 1) &&
        (sx == (160 << 16)) && (sy == (100 << 16)) && (z == 65536) && (a == 0) && ((dastat & 1) == 0)) {
        permhead = permtail = 0;
    }

    if ((dastat & 128) == 0) {
        return;
    }

    throw new Error("TODO");
}

//8193
function makepalookup(palnum, remapbuf, r, g, b, dastat) {
    var i, j, palscale;
    var ptr, ptr2;

    if (!paletteloaded) {
        return;
    }

    //if (palookup[palnum] == null) {
    //    console.log("palookup[palnum] "); // todo
    //} else {
    //    throw new Error("palookup is a ptr etc, fix this")// todo
    //}

    if (dastat === 0) {
        return;
    }

    if ((r | g | b | 63) !== 63) {
        return;
    }

    console.log("makepalookup todo!!!!!!"); // todo
    //if ((r | g | b) === 0) {
    //    for (i = 0; i < 256; i++) {
    //        //ptr=palookup[0]   
    //    }
    //} else {
    //    // todo?   
    //}
}

//8244
function setBrightness(brightness, dapal) {
    var newPalette = new Uint8Array(256 * 4);

    curbrightness = Math.min(Math.max(brightness, 0), 15);

    var k = 0;
    for (var i = 0; i < 256; i++) {
        newPalette[k++] = briTable[curbrightness][dapal[i * 3 + 2]];
        newPalette[k++] = briTable[curbrightness][dapal[i * 3 + 1]];
        newPalette[k++] = briTable[curbrightness][dapal[i * 3 + 0]];
        newPalette[k++] = 0;
    }

    VBE_setPalette(newPalette);
}

//8991
function clearView(dacol) {
    //var p, y, dx;

    //if (qsetmode !== 200) {
    //    return;
    //}

    //dx = windowx2 - windowx1 + 1;
    //dacol += (dacol << 8);
    //dacol += (dacol << 16);

    //p = frameplace.position + ylookup[windowy1] + windowx1;
    // todo: check this is right
    surface.getContext("2d").fillStyle = colorPalette[dacol].cssColor;
    surface.getContext("2d").fillRect(0, 0, surface.width, surface.height);

    faketimerhandler();
}