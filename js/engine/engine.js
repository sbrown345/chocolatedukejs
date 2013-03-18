'use strict';

var radarang = new Int16Array(1280), radarang2 = new Int16Array(MAXXDIM + 1);
var sqrTable = new Uint16Array(4096), shLookup = new Uint16Array(4096 + 256);
var  pow2char = [1,2,4,8,16,32,64,-128];
var pow2long  =
[
    1,2,4,8,
    16,32,64,128,
    256,512,1024,2048,
    4096,8192,16384,32768,
    65536,131072,262144,524288,
    1048576,2097152,4194304,8388608,
    16777216,33554432,67108864,134217728,
    268435456,536870912,1073741824,2147483647
];

var recipTable = new Int32Array(2048), fpuasm = 0;

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

//enum vector_index_e {VEC_X=0,VEC_Y=1};
//enum screenSpaceCoo_index_e {VEC_COL=0,VEC_DIST=1};
//typedef int32_t vector_t[2];
//typedef int32_t coo2D_t[2];
//// This is the structure emitted for each wall that is potentially visible.
//// A stack of those is populated when the sectors are scanned.
//typedef struct pvWall_s{
//    vector_t cameraSpaceCoo[2]; //Camera space coordinates of the wall endpoints. Access with vector_index_e.
//    int16_t sectorId;        //The index of the sector this wall belongs to in the map database.
//    int16_t worldWallId;     //The index of the wall in the map database.
//    coo2D_t screenSpaceCoo[2]; //Screen space coordinate of the wall endpoints. Access with screenSpaceCoo_index_e.
//} pvWall_t;

//// Potentially Visible walls are stored in this stack.
//pvWall_t pvWalls[MAXWALLSB];




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
//short uplc[MAXXDIM+1], dplc[MAXXDIM+1];
//static int16_t uwall[MAXXDIM+1], dwall[MAXXDIM+1];
//static int32_t swplc[MAXXDIM+1], lplc[MAXXDIM+1];
//static int32_t swall[MAXXDIM+1], lwall[MAXXDIM+4];
//int32_t xdimen = -1, xdimenrecip, halfxdimen, xdimenscale, xdimscale;
//int32_t wx1, wy1, wx2, wy2, ydimen;
//int32_t viewoffset;

//static int32_t rxi[8], ryi[8], rzi[8], rxi2[8], ryi2[8], rzi2[8];
//static int32_t xsi[8], ysi[8];

///* used to be static. --ryan. */
//int32_t *horizlookup=0, *horizlookup2=0, horizycent;

//int32_t globalposx, globalposy, globalposz, globalhoriz;
//int16_t globalang, globalcursectnum;
var globalpal, cosglobalang, singlobalang;
//int32_t cosviewingrangeglobalang, sinviewingrangeglobalang;
var globalpalwritten; //ptr
//int32_t globaluclip, globaldclip, globvis = 0;
//int32_t globalvisibility, globalhisibility, globalpisibility, globalcisibility;
//uint8_t  globparaceilclip, globparaflorclip;

//int32_t xyaspect, viewingrangerecip;

//int32_t asm1, asm2, asm3, asm4;


//int32_t vplce[4], vince[4];
//int32_t bufplce[4];

//uint8_t*  palookupoffse[4];

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
//int32_t pageoffset, ydim16, qsetmode = 0;
//int32_t startposx, startposy, startposz;
//int16_t startang, startsectnum;
var pointhighlight, linehighlight, highlightcnt;
//static int32_t lastx[MAXYDIM];
var paletteloaded = false;

var FASTPALGRIDSIZ = 8;
var rdist = new Int32Array(129), gdist = new Int32Array(129), bdist = new Int32Array(129);
var colhere = new Uint8Array(((FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2)) >> 3);
var colhead = new Uint8Array((FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2) * (FASTPALGRIDSIZ + 2));
var colnext = new Int32Array(256);
//static uint8_t  coldist[8] = {0,1,2,3,4,3,2,1};
var colscan = new Int32Array(27);

////FCS: Num walls to potentially render.
//short numscans ;

//short numbunches;

//short numhits;

//short editstatus = 0;
var searchit;
//int32_t searchx = -1, searchy;                     /* search input  */
var searchsector, searchwall, searchstat;     /* search output */

function initKSqrt() {
    var i, j, k;
    j = 1;
    k = 0;
    for (i = 0; i < 4096; i++) {
        if (i >= j) {
            j <<= 2;
            k++;
        }

        sqrTable[i] = msqrtasm((i << 18) + 131072) << 1;
        shLookup[i] = (k << 1) + ((10 - k) << 8);
        if (i < 256) {
            shLookup[i + 4096] = ((k + 6) << 1) + ((10 - (k + 6)) << 8);
        }
    }
}

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
        /*j = (i-64)*(i-64);*/
        rdist[i] = rdist[128 - i] = j * rScale;
        gdist[i] = gdist[128 - i] = j * gScale;
        bdist[i] = bdist[128 - i] = j * bScale;
        j += 129 - (i << 1);
    }

    clearbufbyte(colhere, 0, colhere.length);
    clearbufbyte(colhead, 0, colhead.length);

    var pal1 = 768 - 3;
    for (i = 255; i >= 0; i--, pal1 -= 3) {
        j = (palette[pal1] >> 3) * FASTPALGRIDSIZ * FASTPALGRIDSIZ + (palette[pal1 +1] >> 3) * FASTPALGRIDSIZ + (palette[pal1 +2] >> 3) + FASTPALGRIDSIZ * FASTPALGRIDSIZ + FASTPALGRIDSIZ + 1;
        //console.log("pal1: %i", pal1);
        //console.log("j: %i", j);
        //console.log("pal1[0]: %i", palette[pal1]);
        //console.log("pal1[1]: %i", palette[pal1+1]);
        //console.log("pal1[2]: %i", palette[pal1+2]);
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