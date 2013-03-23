'use strict';

var Engine = {};

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
var mapversion = 0;
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
function PvWall() {
    this.cameraSpaceCoo = [new Int32Array(2), new Int32Array(2)]; //Camera space coordinates of the wall endpoints. Access with vector_index_e.
    this.sectorId = 0; //The index of the sector this wall belongs to in the map database.
    this.worldWallId = 0; //The index of the wall in the map database.
    this.screenSpaceCoo = [new Int32Array(2), new Int32Array(2)]; //Screen space coordinate of the wall endpoints. Access with screenSpaceCoo_index_e.
}

// Potentially Visible walls are stored in this stack.
var pvWalls = structArray(PvWall, MAXWALLSB);




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

var rxi= new Int32Array(8), ryi= new Int32Array(8), rzi= new Int32Array(8), rxi2= new Int32Array(8), ryi2= new Int32Array(8), rzi2= new Int32Array(8);
var xsi= new Int32Array(8), ysi= new Int32Array(8);

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

var clipnum, hitwalls = new Int16Array(4);
//int32_t hitscangoalx = (1<<29)-1, hitscangoaly = (1<<29)-1;

function LineType() {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
}
var clipit = structArray(LineType, MAXCLIPNUM);
var clipsectorlist = new Int16Array(MAXCLIPNUM), clipsectnum = 0;
var clipobjectval = new Int16Array(MAXCLIPNUM);

//typedef struct
//{
//    int32_t sx, sy, z;
//    short a, picnum;
//    int8_t dashade;
//    uint8_t  dapalnum, dastat, pagesleft;
//    int32_t cx1, cy1, cx2, cy2;
//} permfifotype;
//static permfifotype permfifo[MAXPERMS];
var permhead = 0, permtail = 0;

////FCS: Num walls to potentially render.
//short numscans ;

//short numbunches;

//short numhits;

var editstatus = 0;
var searchit;
var searchx = -1, searchy;                     /* search input  */
var searchsector, searchwall, searchstat;     /* search output */

var numtilefiles, artfil = -1, artfilnum, artfilplc;

//278
function nsqrtasm(param) {
    var shlookup_a = shLookup;
    var sqrtable_a = sqrTable;
    var cx;

    if (param & 0xff000000)
        cx = shlookup_a[(param >> 24) + 4096];
    else
        cx = shlookup_a[param >> 12];

    param = param >> (cx & 0xff);
    param = ((param & 0xffff0000) | sqrtable_a[param]);
    param = param >> ((cx & 0xff00) >> 8);

    console.log("nsqrtasm: %i", param);;
    return param;
}

//658
Engine.getpalookup = function (davis, dashade) {
    return Math.min(Math.max(dashade + (davis >> 8), 0), numpalookups - 1);
};

//2593
function setAspect(daxrange, daaspect) {
    viewingrange = daxrange;
    viewingrangerecip = divScale32(1, daxrange);

    yxaspect = daaspect;
    xyaspect = divScale32(1, yxaspect);
    xdimenscale = scale(xdimen, yxaspect, 320);
    xdimscale = scale(320, xyaspect, xdimen);
}

//3179
Engine.loadBoard = function (filename, daposx, daposy, daposz, daang, dacursectnum) {
    var x = 0;
    var fil, i, numsprites;
    var sect;
    var s;
    var w;

    // FIX_00058: Save/load game crash in both single and multiplayer
    // We have to reset those arrays since the same
    // arrays are used as temporary space in the
    // compilecons() function like "label = (uint8_t  *)&sprite[0];"
    // to save memory space I guess.
    // Not reseting the array will leave dumps fooling
    // the function saveplayer(), eg at if(actorscrptr[PN] == 0)
    // where PN is sprite[i].picnum was beyong actorscrptr[] size)

    if ((fil = kopen4load(filename, false)) === -1) {
        mapversion = 7;
        return -1;
    }

    mapversion = kread32(fil);
    if (mapversion !== 7) {
        return -1;
    }

    Engine.initSpriteLists();


    daposx = kread32(fil);
    daposy = kread32(fil);
    daposz = kread32(fil);
    daang = kread16(fil);
    dacursectnum = kread16(fil);
    numsectors = kread16(fil);

    for (x = 0; x < numsectors; x++) {
        sect = sector[x];
        sect.wallptr = kread16(fil);
        sect.wallnum = kread16(fil);
        sect.ceilingz = kread32(fil);
        sect.floorz = kread32(fil);
        sect.ceilingstat = kread16(fil);
        sect.floorstat = kread16(fil);
        sect.ceilingpicnum = kread16(fil);
        sect.ceilingheinum = kread16(fil);
        sect.ceilingshade = kread8(fil);
        sect.ceilingpal = kreadUint8(fil);
        sect.ceilingxpanning = kreadUint8(fil);
        sect.ceilingypanning = kreadUint8(fil);
        sect.floorpicnum = kread16(fil);
        sect.floorheinum = kread16(fil);
        sect.floorshade = kread8(fil);
        sect.floorpal = kreadUint8(fil);
        sect.floorxpanning = kreadUint8(fil);
        sect.floorypanning = kreadUint8(fil);
        sect.visibility = kreadUint8(fil);
        sect.filler = kreadUint8(fil);
        sect.lotag = kread16(fil);
        sect.hitag = kread16(fil);
        sect.extra = kread16(fil);
        //    console.log("x: %i", x);
        //    console.log("wallptr: %i", sect.wallptr);
        //    console.log("wallnum: %i", sect.wallnum);
        //    console.log("ceilingz: %i", sect.ceilingz);
        //    console.log("ceilingstat: %i", sect.ceilingstat);
        //    console.log("ceilingpicnum: %i", sect.ceilingpicnum);
        //    console.log("ceilingheinum: %i", sect.ceilingheinum);
        //    console.log("ceilingshade: %i", sect.ceilingshade);
        //    console.log("ceilingpal: %i", sect.ceilingpal);
        //    console.log("ceilingxpanning: %i", sect.ceilingxpanning);
        //    console.log("ceilingypanning: %i", sect.ceilingypanning);
        //    console.log("floorpicnum: %i", sect.floorpicnum);
        //    console.log("floorheinum: %i", sect.floorheinum);
        //    console.log("floorshade: %i", sect.floorshade);
        //    console.log("floorpal: %i", sect.floorpal);
        //    console.log("floorxpanning: %i", sect.floorxpanning);
        //    console.log("floorypanning: %i", sect.floorypanning);
        //    console.log("floorypanning: %i", sect.floorypanning);
        //    console.log("visibility: %i", sect.visibility);
        //    console.log("filler: %i", sect.filler);
        //    console.log("lotag: %i", sect.lotag);
        //    console.log("hitag: %i", sect.hitag);
        //    console.log("extra: %i", sect.extra);
    }

    numwalls = kread16(fil);
    for (x = 0 ; x < numwalls; x++) {
        w = wall[x];
        w.x = kread32(fil);
        w.y = kread32(fil);
        w.point2 = kread16(fil);
        w.nextwall = kread16(fil);
        w.nextsector = kread16(fil);
        w.cstat = kread16(fil);
        w.picnum = kread16(fil);
        w.overpicnum = kread16(fil);
        w.shade = kread8(fil);
        w.pal = kreadUint8(fil);
        w.xrepeat = kreadUint8(fil);
        w.yrepeat = kreadUint8(fil);
        w.xpanning = kreadUint8(fil);
        w.ypanning = kreadUint8(fil);
        w.lotag = kread16(fil);
        w.hitag = kread16(fil);
        w.extra = kread16(fil);
        //console.log("x: %i", x);
        //console.log("w.x: %i", w.x);
        //console.log("y: %i", w.y);
        //console.log("point2: %i", w.point2);
        //console.log("nextwall: %i", w.nextwall);
        //console.log("nextsector: %i", w.nextsector);
        //console.log("cstat: %i", w.cstat);
        //console.log("picnum: %i", w.picnum);
        //console.log("overpicnum: %i", w.overpicnum);
        //console.log("shade: %i", w.shade);
        //console.log("pal: %i", w.pal);
        //console.log("xrepeat: %i", w.xrepeat);
        //console.log("yrepeat: %i", w.yrepeat);
        //console.log("xpanning: %i", w.xpanning);
        //console.log("lotag: %i", w.lotag);
        //console.log("hitag: %i", w.hitag);
        //console.log("extra: %i", w.extra);
    }

    numsprites = kread16(fil);
    for (x = 0; x < numsprites; x++) {
        s = sprite[x];
        s.x = kread32(fil);
        s.y = kread32(fil);
        s.z = kread32(fil);
        s.cstat = kread16(fil);
        s.picnum = kread16(fil);
        s.shade = kread8(fil);
        s.pal = kreadUint8(fil);
        s.clipdist = kreadUint8(fil);
        s.filler = kreadUint8(fil);
        s.xrepeat = kreadUint8(fil);
        s.yrepeat = kreadUint8(fil);
        s.xoffset = kread8(fil);
        s.yoffset = kread8(fil);
        s.sectnum = kread16(fil);
        s.statnum = kread16(fil);
        s.ang = kread16(fil);
        s.owner = kread16(fil);
        s.xvel = kread16(fil);
        s.yvel = kread16(fil);
        s.zvel = kread16(fil);
        s.lotag = kread16(fil);
        s.hitag = kread16(fil);
        s.extra = kread16(fil);
        //console.log("x: %i", x);
        //console.log("s.x: %i", s.x);
        //console.log("y: %i", s.y);
        //console.log("z: %i", s.z);
        //console.log("cstat: %i", s.cstat);
        //console.log("picnum: %i", s.picnum);
        //console.log("shade: %i", s.shade);
        //console.log("pal: %i", s.pal);
        //console.log("clipdist: %i", s.clipdist);
        //console.log("filler: %i", s.filler);
        //console.log("filler: %i", s.filler);
        //console.log("xrepeat: %i", s.xrepeat);
        //console.log("yrepeat: %i", s.yrepeat);
        //console.log("xoffset: %i", s.xoffset);
        //console.log("yoffset: %i", s.yoffset);
        //console.log("sectnum: %i", s.sectnum);
        //console.log("statnum: %i", s.statnum);
        //console.log("ang: %i", s.ang);
        //console.log("owner: %i", s.owner);
        //console.log("xvel: %i", s.xvel);
        //console.log("yvel: %i", s.yvel);
        //console.log("lotag: %i", s.lotag);
        //console.log("hitag: %i", s.hitag);
        //console.log("extra: %i", s.extra);
    }

    for (i = 0; i < numsprites; i++) {
        Engine.insertSprite(sprite[i].sectnum, sprite[i].statnum);
    }

    /* Must be after loading sectors, etc! */
    updatesector(daposx, daposy, dacursectnum);

    kclose(fil);

    // FIX_00009: Show map CRC and GRP file version of each player in case of Out Of Synch

    // todo:
    //mapCRC = crc16(sector, numsectors * 40);
    //mapCRC += crc16(sector, numsectors * 32);
    //mapCRC += crc16(sector, numsectors * 44);

    return 0;
};

//3534
Engine.initKSqrt = function () {
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
};

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
    //console.log("numframes: %i", numframes);
}

//3488
Engine.loadTables = function () {
    var i, file;
    if (!tablesLoaded) {
        Engine.initKSqrt();

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
};

//3519
Engine.initFastColorLookup = function (rScale, gScale, bScale) {
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
};

//3558
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

    Engine.initFastColorLookup(30, 59, 11);

    paletteloaded = true;
}

function setGameMode(screenMode, screenWidth, screenHeight) {
    kensMessage = "!!!! BUILD engine&tools programmed by Ken Silverman of E.G. RI.  (c) Copyright 1995 Ken Silverman.  Summary:  BUILD = Ken. !!!!";
    Display.setGameMode(screenMode, screenWidth, screenHeight);
}

//3621
function initEngine() {
    var i;

    Engine.loadTables();

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
        xoff = ((tiles[picnum].animFlags >> 8) & 255) + (tileWidht >> 1);
        yoff = ((tiles[picnum].animFlags >> 16) & 255) + (tileHeight >> 1);
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
                //if (typeof dax1 != 0) {
                //        throw new Error("need to set start pointer for array, note: (& uplc[dax1])");
                //}
                ////qinterpolatedown16short((int32_t *)(&uplc[dax1]),dax2-dax1,yplc,yinc);
                qinterpolatedown16short(uplc, dax1, dax2 - dax1, yplc, yinc);
            } else {
                yplc = y2 + mulscale16((dax2 << 16) + 65535 - x2, yinc);
                //if (typeof dax2 != 0) {
                //    throw new Error("need to set start pointer for array, note: (& dplc[dax2])");
                //}
                ////qinterpolatedown16short((int32_t * )( & dplc[dax2]), dax1 - dax2, yplc, yinc);
                qinterpolatedown16short(dplc, dax2, dax1 - dax2, yplc, yinc);
            }
        }
        nextv = v;
    }

    TILE_MakeAvailable(picnum);

    setgotpic(picnum);
    bufplc = new PointerHelper(tiles[picnum].data);

    palookupoffs = palookup[dapalnum] + (Engine.getpalookup(0, dashade) << 8);

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

            for (x = x1; x < x2; x += 4) {
                bad = 15;
                xend = Math.min(x2 - x, 4);
                for (xx = 0; xx < xend; xx++) {
                    bx += xv2;

                    y1 = uplc[x + xx];
                    y2 = dplc[x + xx];
                    if ((dastat & 8) == 0) {
                        if (startumost[x + xx] > y1) y1 = startumost[x + xx];
                        if (startdmost[x + xx] < y2) y2 = startdmost[x + xx];
                    }
                    if (y2 <= y1) continue;

                    by += yv * (y1 - oy);
                    oy = y1;

                    bufplce[xx] = (bx >> 16) * tileHeight + bufplc.position;
                    vplce[xx] = by;
                    y1ve[xx] = y1;
                    y2ve[xx] = y2 - 1;
                    bad &= ~pow2char[xx];
                }

                p = frameplace;
                p.position = x; // could be dodgy sharing this position?

                //if (ud.playing_demo_rev == 117) {
                //    updateCanvas();
                //    var img = document.createElement("img");
                //    img.src = surface.toDataURL("image/png");
                //    document.getElementById("canvasDebug").appendChild(img);
                //}

                u4 = Math.max(Math.max(y1ve[0], y1ve[1]), Math.max(y1ve[2], y1ve[3]));
                d4 = Math.min(Math.min(y2ve[0], y2ve[1]), Math.min(y2ve[2], y2ve[3]));

                if (dastat & 64) {
                    if ((bad != 0) || (u4 >= d4)) {
                        if (!(bad & 1))
                            prevlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0], vplce[0], bufplce[0], ylookup[y1ve[0]] + p + 0);
                        if (!(bad & 2))
                            prevlineasm1(vince[1], palookupoffse[1], y2ve[1] - y1ve[1], vplce[1], bufplce[1], ylookup[y1ve[1]] + p + 1);
                        if (!(bad & 4))
                            prevlineasm1(vince[2], palookupoffse[2], y2ve[2] - y1ve[2], vplce[2], bufplce[2], ylookup[y1ve[2]] + p + 2);
                        if (!(bad & 8))
                            prevlineasm1(vince[3], palookupoffse[3], y2ve[3] - y1ve[3], vplce[3], bufplce[3], ylookup[y1ve[3]] + p + 3);
                        continue;
                    }

                    if (u4 > y1ve[0])
                        vplce[0] = prevlineasm1(vince[0], palookupoffse[0], u4 - y1ve[0] - 1, vplce[0], bufplce[0], ylookup[y1ve[0]] + p + 0);
                    if (u4 > y1ve[1])
                        vplce[1] = prevlineasm1(vince[1], palookupoffse[1], u4 - y1ve[1] - 1, vplce[1], bufplce[1], ylookup[y1ve[1]] + p + 1);
                    if (u4 > y1ve[2])
                        vplce[2] = prevlineasm1(vince[2], palookupoffse[2], u4 - y1ve[2] - 1, vplce[2], bufplce[2], ylookup[y1ve[2]] + p + 2);
                    if (u4 > y1ve[3])
                        vplce[3] = prevlineasm1(vince[3], palookupoffse[3], u4 - y1ve[3] - 1, vplce[3], bufplce[3], ylookup[y1ve[3]] + p + 3);

                    if (d4 >= u4) vlineasm4(d4 - u4 + 1, bufplc, ylookup[u4], p);

                    i = p.position + ylookup[d4 + 1];
                    if (y2ve[0] > d4)
                        prevlineasm1(vince[0], palookupoffse[0], y2ve[0] - d4 - 1, vplce[0], bufplce[0], i + 0);
                    if (y2ve[1] > d4)
                        prevlineasm1(vince[1], palookupoffse[1], y2ve[1] - d4 - 1, vplce[1], bufplce[1], i + 1);
                    if (y2ve[2] > d4)
                        prevlineasm1(vince[2], palookupoffse[2], y2ve[2] - d4 - 1, vplce[2], bufplce[2], i + 2);
                    if (y2ve[3] > d4)
                        prevlineasm1(vince[3], palookupoffse[3], y2ve[3] - d4 - 1, vplce[3], bufplce[3], i + 3);
                }
                else {
                    if ((bad != 0) || (u4 >= d4)) {
                        if (!(bad & 1)) mvlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0], vplce[0], bufplc, bufplce[0], ylookup[y1ve[0]] + 0, p);
                        if (!(bad & 2)) mvlineasm1(vince[1], palookupoffse[1], y2ve[1] - y1ve[1], vplce[1], bufplc, bufplce[1], ylookup[y1ve[1]] + 1, p);
                        if (!(bad & 4)) mvlineasm1(vince[2], palookupoffse[2], y2ve[2] - y1ve[2], vplce[2], bufplc, bufplce[2], ylookup[y1ve[2]] + 2, p);
                        if (!(bad & 8)) mvlineasm1(vince[3], palookupoffse[3], y2ve[3] - y1ve[3], vplce[3], bufplc, bufplce[3], ylookup[y1ve[3]] + 3, p);
                        continue;
                    }

                    if (u4 > y1ve[0]) vplce[0] = mvlineasm1(vince[0], palookupoffse[0], u4 - y1ve[0] - 1, vplce[0], bufplce[0], ylookup[y1ve[0]] + p + 0);
                    if (u4 > y1ve[1]) vplce[1] = mvlineasm1(vince[1], palookupoffse[1], u4 - y1ve[1] - 1, vplce[1], bufplce[1], ylookup[y1ve[1]] + p + 1);
                    if (u4 > y1ve[2]) vplce[2] = mvlineasm1(vince[2], palookupoffse[2], u4 - y1ve[2] - 1, vplce[2], bufplce[2], ylookup[y1ve[2]] + p + 2);
                    if (u4 > y1ve[3]) vplce[3] = mvlineasm1(vince[3], palookupoffse[3], u4 - y1ve[3] - 1, vplce[3], bufplce[3], ylookup[y1ve[3]] + p + 3);

                    if (d4 >= u4) mvlineasm4(d4 - u4 + 1, bufplc, ylookup[u4] + p.position, p);

                    i = p.position + ylookup[d4 + 1];
                    if (y2ve[0] > d4) mvlineasm1(vince[0], palookupoffse[0], y2ve[0] - d4 - 1, vplce[0], bufplce[0], i + 0);
                    if (y2ve[1] > d4) mvlineasm1(vince[1], palookupoffse[1], y2ve[1] - d4 - 1, vplce[1], bufplce[1], i + 1);
                    if (y2ve[2] > d4) mvlineasm1(vince[2], palookupoffse[2], y2ve[2] - d4 - 1, vplce[2], bufplce[2], i + 2);
                    if (y2ve[3] > d4) mvlineasm1(vince[3], palookupoffse[3], y2ve[3] - d4 - 1, vplce[3], bufplce[3], i + 3);
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
            if (((dastat & 8) == 0) && (startumost[x1] > y1)) y1 = startumost[x1];
            y2 = y1;
            for (x = x1; x < x2; x++) {
                ny1 = uplc[x] - 1;
                ny2 = dplc[x];
                if ((dastat & 8) == 0) {
                    if (startumost[x] - 1 > ny1) ny1 = startumost[x] - 1;
                    if (startdmost[x] < ny2) ny2 = startdmost[x];
                }

                if (ny1 < ny2 - 1) {
                    if (ny1 >= y2) {
                        while (y1 < y2 - 1) {
                            y1++;
                            if ((y1 & 31) == 0) faketimerhandler();

                            /* x,y1 */
                            bx += xv * (y1 - oy);
                            by += yv * (y1 - oy);
                            oy = y1;
                            if (dastat & 64) {
                                if (qlinemode)
                                    rhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, 0, by << 16, ylookup[y1] + x, frameplace);
                                else
                                    rhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x, frameplace);
                            } else
                                rmhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x, frameplace);
                        }
                        y1 = ny1;
                    }
                    else {
                        while (y1 < ny1) {
                            y1++;
                            if ((y1 & 31) == 0) faketimerhandler();

                            /* x,y1 */
                            bx += xv * (y1 - oy);
                            by += yv * (y1 - oy);
                            oy = y1;
                            if (dastat & 64) {
                                if (qlinemode)
                                    rhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, 0, by << 16, ylookup[y1] + x, frameplace);
                                else
                                    rhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x, frameplace);
                            } else
                                rmhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x, frameplace);
                        }
                        while (y1 > ny1) lastx[y1--] = x;
                    }
                    while (y2 > ny2) {
                        y2--;
                        if ((y2 & 31) == 0) faketimerhandler();

                        /* x,y2 */
                        bx += xv * (y2 - oy);
                        by += yv * (y2 - oy);
                        oy = y2;
                        if (dastat & 64) {
                            if (qlinemode)
                                rhlineasm4(x - lastx[y2], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, 0, by << 16, ylookup[y2] + x, frameplace);
                            else
                                rhlineasm4(x - lastx[y2], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y2] + x, frameplace);
                        } else
                            rmhlineasm4(x - lastx[y2], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y2] + x, frameplace);
                    }
                    while (y2 < ny2) lastx[y2++] = x;
                }
                else {
                    while (y1 < y2 - 1) {
                        y1++;
                        if ((y1 & 31) == 0) faketimerhandler();

                        /* x,y1 */
                        bx += xv * (y1 - oy);
                        by += yv * (y1 - oy);
                        oy = y1;
                        if (dastat & 64) {
                            if (qlinemode)
                                rhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, 0, by << 16, ylookup[y1] + x, frameplace);
                            else
                                rhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x, frameplace);
                        }
                        else
                            rmhlineasm4(x - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x, frameplace);
                    }
                    if (x == x2 - 1) {
                        bx += xv2;
                        by += yv2;
                        break;
                    }

                    y1 = uplc[x + 1];

                    if (((dastat & 8) == 0) && (startumost[x + 1] > y1))
                        y1 = startumost[x + 1];

                    y2 = y1;
                }
                bx += xv2;
                by += yv2;
            }
            while (y1 < y2 - 1) {
                y1++;
                if ((y1 & 31) == 0) faketimerhandler();

                /* x2,y1 */
                bx += xv * (y1 - oy);
                by += yv * (y1 - oy);
                oy = y1;
                if (dastat & 64) {
                    if (qlinemode) {
                        rhlineasm4(x2 - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, 0, by << 16, ylookup[y1] + x2, frameplace);
                    }
                    else
                        rhlineasm4(x2 - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x2, frameplace);
                } else
                    rmhlineasm4(x2 - lastx[y1], (bx >> 16) * tileHeight + (by >> 16), bufplc, 0, bx << 16, by << 16, ylookup[y1] + x2, frameplace);
            }
        }
    }
    else {
        if ((dastat & 1) == 0) {
            if (dastat & 64)
                setupspritevline(palookupoffs, (xv >> 16) * tileHeight, xv << 16, tileHeight, yv, 0);
            else
                msetupspritevline(palookupoffs, (xv >> 16) * tileHeight, xv << 16, tileHeight, yv, 0);
        }
        else {
            tsetupspritevline(palookupoffs, (xv >> 16) * tileHeight, xv << 16, tileHeight, yv);

            if (dastat & 32)
                settrans(TRANS_REVERSE);
            else
                settrans(TRANS_NORMAL);
        }

        for (x = x1; x < x2; x++) {
            bx += xv2;
            by += yv2;

            y1 = uplc[x];
            y2 = dplc[x];
            if ((dastat & 8) == 0) {
                if (startumost[x] > y1) y1 = startumost[x];
                if (startdmost[x] < y2) y2 = startdmost[x];
            }
            if (y2 <= y1) continue;

            switch (y1 - oy) {
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
                    bx += xv * (y1 - oy);
                    by += yv * (y1 - oy);
                    oy = y1;
                    break;
            }

            p = ylookup[y1] + x + frameplace.position;

            if ((dastat & 1) == 0) {
                if (dastat & 64)
                    spritevline(0, by << 16, y2 - y1 + 1, bx << 16, (bx >> 16) * tileHeight + (by >> 16), bufplc, p);
                else
                    mspritevline(0, by << 16, y2 - y1 + 1, bx << 16, (bx >> 16) * tileHeight + (by >> 16), bufplc, p);
            }
            else {
                DrawSpriteVerticalLine(by << 16, y2 - y1 + 1, bx << 16, (bx >> 16) * tileHeight + (by >> 16), bufplc, p);
                transarea += (y2 - y1);
            }
            faketimerhandler();
        }
    }

    if ((vidoption == 1) && (dastat & 128) && (origbuffermode == 0)) {
        buffermode = obuffermode;
    }
}

function clipinsideboxline(x, y, x1, y1, x2, y2, walldist) {
    var r = (walldist << 1);

    x1 += walldist - x;
    x2 += walldist - x;
    if ((x1 < 0) && (x2 < 0)) return (0);
    if ((x1 >= r) && (x2 >= r)) return (0);

    y1 += walldist - y;
    y2 += walldist - y;
    if ((y1 < 0) && (y2 < 0)) return (0);
    if ((y1 >= r) && (y2 >= r)) return (0);

    x2 -= x1;
    y2 -= y1;
    if (x2 * (walldist - y1) >= y2 * (walldist - x1))  /* Front */ {
        if (x2 > 0) x2 *= (0 - y1);
        else x2 *= (r - y1);
        if (y2 > 0) y2 *= (r - x1);
        else y2 *= (0 - x1);
        return (x2 < y2);
    }
    if (x2 > 0) x2 *= (r - y1);
    else x2 *= (0 - y1);
    if (y2 > 0) y2 *= (0 - x1);
    else y2 *= (r - x1);
    return ((x2 >= y2) << 1);
}

//4541
/*
 FCS: Return true if the point (x,Y) is inside the sector sectnum.
 Note that a sector is closed (but can be concave) so the answer is always 0 or 1.

 Algorithm: This is an optimized raycasting inside polygon test:
 http://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm
 The goal is to follow an ***horizontal*** ray passing by (x,y) and count how many
 wall are being crossed.
 If it is an odd number of time: (x,y) is inside the sector.
 If it is an even nymber of time:(x,y) is outside the sector.
 */

function inside(x, y, sectnum) {
    var wal;
    var i, x1, y1, x2, y2;
    var wallCrossed;

    //Quick check if the sector ID is valid.
    if ((sectnum < 0) || (sectnum >= numsectors)) {
        return -1;
    }

    wallCrossed = 0;
    var wallPos = sector[sectnum].wallptr;
    i = sector[sectnum].wallnum;
    do {
        wal = wall[wallPos];
        y1 = wal.y - y;
        y2 = wall[wal.point2].y - y;

        // Compare the sign of y1 and y2.
        // If (y1^y2) < 0 : y1 and y2 have different sign bit:  y is between wal.y and wall[wal.point2].y.
        // The goal is to not take into consideration any wall that is totally above or totally under the point [x,y].
        if ((y1 ^ y2) < 0) {
            x1 = wal.x - x;
            x2 = wall[wal.point2].x - x;

            //If (x1^x2) >= 0 x1 and x2 have identic sign bit: x is on the left or the right of both wal.x and wall[wal.point2].x.
            if ((x1 ^ x2) >= 0) {
                // If (x,y) is totally on the left or on the right, just count x1 (which indicate if we are on
                // on the left or on the right.
                wallCrossed ^= x1;
            } else {
                // This is the most complicated case: X is between x1 and x2, we need a fine grained test.
                // We need to know exactly if it is on the left or on the right in order to know if the ray
                // is crossing the wall or not,
                // The sign of the Cross-Product can answer this case :) !
                wallCrossed ^= (x1 * y2 - x2 * y1) ^ y2;
            }

            wallCrossed = wallCrossed >>> 0;
        }

        wallPos++;
        i--;

    } while (i);

    //Just return the sign. If the position vector cut the sector walls an odd number of time
    //it is inside. Otherwise (even) it is outside.
    console.log("wallCrossed >> 31 = %i", (wallCrossed >>> 31));
    return wallCrossed >>> 31;
}

//5867
Engine.initSpriteLists = function () {
    var i;

    for (i = 0; i < MAXSECTORS; i++) {
        headspritesect[i] = -1;
    }
    headspritesect[MAXSECTORS] = 0;

    for (i = 0; i < MAXSPRITES; i++) {
        prevspritesect[i] = i - 1;
        nextspritesect[i] = i + 1;
        sprite[i].sectnum = MAXSECTORS;
    }
    prevspritesect[0] = -1;
    nextspritesect[MAXSPRITES - 1] = -1;


    for (i = 0; i < MAXSTATUS; i++)    /* Init doubly-linked sprite status lists */
        headspritestat[i] = -1;
    headspritestat[MAXSTATUS] = 0;
    for (i = 0; i < MAXSPRITES; i++) {
        prevspritestat[i] = i - 1;
        nextspritestat[i] = i + 1;
        sprite[i].statnum = MAXSTATUS;
    }
    prevspritestat[0] = -1;
    nextspritestat[MAXSPRITES - 1] = -1;
};

//5899
Engine.insertSprite = function (sectNum, statNum) {
    Engine.insertSpriteStat(statNum);
    return Engine.insertSpriteSect(sectNum);
};

Engine.insertSpriteSect = function (sectnum) {
    var blanktouse;

    if ((sectnum >= MAXSECTORS) || (headspritesect[MAXSECTORS] == -1)) {
        return -1; /* list full */
    }

    blanktouse = headspritesect[MAXSECTORS];

    headspritesect[MAXSECTORS] = nextspritesect[blanktouse];
    if (headspritesect[MAXSECTORS] >= 0)
        prevspritesect[headspritesect[MAXSECTORS]] = -1;

    prevspritesect[blanktouse] = -1;
    nextspritesect[blanktouse] = headspritesect[sectnum];
    if (headspritesect[sectnum] >= 0)
        prevspritesect[headspritesect[sectnum]] = blanktouse;
    headspritesect[sectnum] = blanktouse;

    sprite[blanktouse].sectnum = sectnum;

    return (blanktouse);
};

Engine.insertSpriteStat = function (statnum) {
    var blanktouse;

    if ((statnum >= MAXSTATUS) || (headspritestat[MAXSTATUS] == -1)) {
        return -1; /* list full */
    }

    blanktouse = headspritestat[MAXSTATUS];

    headspritestat[MAXSTATUS] = nextspritestat[blanktouse];
    if (headspritestat[MAXSTATUS] >= 0)
        prevspritestat[headspritestat[MAXSTATUS]] = -1;

    prevspritestat[blanktouse] = -1;
    nextspritestat[blanktouse] = headspritestat[statnum];
    if (headspritestat[statnum] >= 0)
        prevspritestat[headspritestat[statnum]] = blanktouse;
    headspritestat[statnum] = blanktouse;

    sprite[blanktouse].statnum = statnum;

    return (blanktouse);
};

function deletesprite(spriteNum) {
    Engine.deleteSpriteStat(spriteNum);
    return Engine.deleteSpriteSect(spriteNum);
}

// 5985
Engine.deleteSpriteSect = function (deleteme) {
    if (sprite[deleteme].sectnum == MAXSECTORS)
        return (-1);

    if (headspritesect[sprite[deleteme].sectnum] == deleteme)
        headspritesect[sprite[deleteme].sectnum] = nextspritesect[deleteme];

    if (prevspritesect[deleteme] >= 0)
        nextspritesect[prevspritesect[deleteme]] = nextspritesect[deleteme];
    if (nextspritesect[deleteme] >= 0)
        prevspritesect[nextspritesect[deleteme]] = prevspritesect[deleteme];

    if (headspritesect[MAXSECTORS] >= 0)
        prevspritesect[headspritesect[MAXSECTORS]] = deleteme;
    prevspritesect[deleteme] = -1;
    nextspritesect[deleteme] = headspritesect[MAXSECTORS];
    headspritesect[MAXSECTORS] = deleteme;

    sprite[deleteme].sectnum = MAXSECTORS;
    return (0);
};
//5053
Engine.deleteSpriteStat = function (deleteme) {
    if (sprite[deleteme].statnum == MAXSTATUS)
        return (-1);

    if (headspritestat[sprite[deleteme].statnum] == deleteme)
        headspritestat[sprite[deleteme].statnum] = nextspritestat[deleteme];

    if (prevspritestat[deleteme] >= 0)
        nextspritestat[prevspritestat[deleteme]] = nextspritestat[deleteme];
    if (nextspritestat[deleteme] >= 0)
        prevspritestat[nextspritestat[deleteme]] = prevspritestat[deleteme];

    if (headspritestat[MAXSTATUS] >= 0)
        prevspritestat[headspritestat[MAXSTATUS]] = deleteme;

    prevspritestat[deleteme] = -1;
    nextspritestat[deleteme] = headspritestat[MAXSTATUS];
    headspritestat[MAXSTATUS] = deleteme;

    sprite[deleteme].statnum = MAXSTATUS;
    return (0);
};

// 6084
function changespritesect(spritenum, newsectnum) {
    throw new Error("todo"); //    if ((newsectnum < 0) || (newsectnum > MAXSECTORS)) return(-1);
    //if (sprite[spritenum].sectnum == newsectnum) return(0);
    //if (sprite[spritenum].sectnum == MAXSECTORS) return(-1);
    //if (deletespritesect(spritenum) < 0) return(-1);
    //insertspritesect(newsectnum);
    //return(0);
}


function changespritestat(spritenum, newstatnum) {
    if ((newstatnum < 0) || (newstatnum > MAXSTATUS)) return (-1);
    if (sprite[spritenum].statnum == newstatnum) return (0);
    if (sprite[spritenum].statnum == MAXSTATUS) return (-1);
    if (Engine.deleteSpriteStat(spritenum) < 0) return (-1);
    Engine.insertSpriteStat(newstatnum);
    return (0);
}

function rintersect(x1, y1, z1, vx, vy, vz, x3, y3, x4, y4,
    intx, inty, intz) {
    console.assert(intx instanceof Ref, "intx must be reffedvalue");
    console.assert(inty instanceof Ref, "inty must be reffedvalue");
    console.assert(intz instanceof Ref, "intz must be reffedvalue");

    var x34, y34, x31, y31, bot, topt, topu, t;

    x34 = x3 - x4;
    y34 = y3 - y4;
    bot = vx * y34 - vy * x34;
    if (bot >= 0) {
        if (bot == 0) return (0);
        x31 = x3 - x1;
        y31 = y3 - y1;
        topt = x31 * y34 - y31 * x34;
        if (topt < 0) return (0);
        topu = vx * y31 - vy * x31;
        if ((topu < 0) || (topu >= bot)) return (0);
    } else {
        x31 = x3 - x1;
        y31 = y3 - y1;
        topt = x31 * y34 - y31 * x34;
        if (topt > 0) return (0);
        topu = vx * y31 - vy * x31;
        if ((topu > 0) || (topu <= bot)) return (0);
    }
    t = divScale16(topt, bot);
    intx.$ = x1 + mulscale16(vx, t);
    inty.$ = y1 + mulscale16(vy, t);
    intz.$ = z1 + mulscale16(vz, t);
    return (1);
}

//6856
function addclipline(dax1, day1, dax2, day2, daoval) {
    clipit[clipnum].x1 = dax1;
    clipit[clipnum].y1 = day1;
    clipit[clipnum].x2 = dax2;
    clipit[clipnum].y2 = day2;
    clipobjectval[clipnum] = daoval;
    clipnum++;
}

//6865
Engine.keepaway = function(x, y, w) {
    var dx, dy, ox, oy, x1, y1;
    var  first;

    x1 = clipit[w].x1;
    dx = clipit[w].x2-x1;
    y1 = clipit[w].y1;
    dy = clipit[w].y2-y1;
    ox = ksgn(-dy);
    oy = ksgn(dx);
    first = (klabs(dx) <= klabs(dy));
    console.assert(first >= 0 && first <= 255, "first is uint8");
    while (1)
    {
        if (dx*(y.$-y1) > (x.$-x1)*dy) return;
        if (first == 0) x.$ += ox;
        else y.$ += oy;
        first ^= 1;
        console.assert(first >= 0 && first <= 255, "first is uint8");
    }
};

//6887
Engine.raytrace = function(x3, y3, x4, y4) {
    var x1, y1, x2, y2, bot, topu, nintx, ninty, cnt, z, hitwall;
    var x21, y21, x43, y43;

    hitwall = -1;
    for (z = clipnum - 1; z >= 0; z--) {
        x1 = clipit[z].x1;
        x2 = clipit[z].x2;
        x21 = x2 - x1;
        y1 = clipit[z].y1;
        y2 = clipit[z].y2;
        y21 = y2 - y1;

        topu = x21 * (y3 - y1) - (x3 - x1) * y21;
        if (topu <= 0) continue;
        if (x21 * (y4.$ - y1) > (x4.$ - x1) * y21) continue;
        x43 = x4.$ - x3;
        y43 = y4.$ - y3;
        if (x43 * (y1 - y3) > (x1 - x3) * y43) continue;
        if (x43 * (y2 - y3) <= (x2 - x3) * y43) continue;
        bot = x43 * y21 - x21 * y43;
        if (bot === 0) continue;

        cnt = 256;
        do {
            cnt--;
            if (cnt < 0) {
                x4.$ = x3;
                y4.$ = y3;
                return (z);
            }
            nintx = x3 + scale(x43, topu, bot);
            ninty = y3 + scale(y43, topu, bot);
            topu--;
        } while (x21 * (ninty - y1) <= (nintx - x1) * y21);

        if (klabs(x3 - nintx) + klabs(y3 - ninty) < klabs(x3 - x4.$) + klabs(y3 - y4.$)) {
            x4.$ = nintx;
            y4.$ = ninty;
            hitwall = z;
        }
    }
    return (hitwall);
};

//6936

/* !!! ugh...move this var into clipmove as a parameter, and update build2.txt! */
var clipmoveboxtracenum = 3;
// first 4 args are refs
function clipmove(x, y, z, sectnum,
               xvect, yvect, walldist, ceildist,
               flordist, cliptype) {
    var wal, wal2;
    var spr;
    var sec, sec2;
    var i, j, templong1, templong2;
    var oxvect, oyvect, goalx, goaly, intx, inty, lx, ly, retval;
    var k, l, clipsectcnt, startwall, endwall, cstat, dasect;
    var x1, y1, x2, y2, cx, cy, rad, xmin, ymin, xmax, ymax, daz, daz2;
    var bsz, dax, day, xoff, yoff, xspan, yspan, cosang, sinang, tilenum;
    var xrepeat, yrepeat, gx, gy, dx, dy, dasprclipmask, dawalclipmask;
    var hitwall, cnt, clipyou;

    console.assert(x instanceof Ref, "x must be reffedvalue");
    console.assert(y instanceof Ref, "y must be reffedvalue");
    console.assert(z instanceof Ref, "z must be reffedvalue");
    console.assert(sectnum instanceof Ref, "sectnum must be reffedvalue");

    if (((xvect | yvect) == 0) || (sectnum.$ < 0)) return (0);
    retval = 0;

    oxvect = xvect;
    oyvect = yvect;

    goalx = (x.$) + (xvect >> 14);
    goaly = (y.$) + (yvect >> 14);


    clipnum = 0;

    cx = (((x.$) + goalx) >> 1);
    cy = (((y.$) + goaly) >> 1);
    /* Extra walldist for sprites on sector lines */
    gx = goalx - (x.$);
    gy = goaly - (y.$);
    rad = nsqrtasm(gx * gx + gy * gy) + MAXCLIPDIST + walldist + 8;
    xmin = cx - rad;
    ymin = cy - rad;
    xmax = cx + rad;
    ymax = cy + rad;

    dawalclipmask = (cliptype & 65535);        /* CLIPMASK0 = 0x00010001 */
    dasprclipmask = (cliptype >> 16);          /* CLIPMASK1 = 0x01000040 */

    clipsectorlist[0] = (sectnum.$);
    clipsectcnt = 0;
    clipsectnum = 1;
    do {
        dasect = clipsectorlist[clipsectcnt++];
        sec = sector[dasect];
        startwall = sec.wallptr;
        endwall = startwall + sec.wallnum;
        for (j = startwall; j < endwall; j++) {
            wal = wall[startwall];

            wal2 = wall[wal.point2];
            if ((wal.x < xmin) && (wal2.x < xmin)) continue;
            if ((wal.x > xmax) && (wal2.x > xmax)) continue;
            if ((wal.y < ymin) && (wal2.y < ymin)) continue;
            if ((wal.y > ymax) && (wal2.y > ymax)) continue;

            x1 = wal.x;
            y1 = wal.y;
            x2 = wal2.x;
            y2 = wal2.y;

            dx = x2 - x1;
            dy = y2 - y1;
            if (dx * ((y.$) - y1) < ((x.$) - x1) * dy) continue;  /* If wall's not facing you */

            if (dx > 0) dax = dx * (ymin - y1);
            else dax = dx * (ymax - y1);
            if (dy > 0) day = dy * (xmax - x1);
            else day = dy * (xmin - x1);
            if (dax >= day) continue;

            clipyou = 0;
            if ((wal.nextsector < 0) || (wal.cstat & dawalclipmask)) clipyou = 1;
            else if (editstatus == 0) {
                var refDax = new Ref(dax);
                var refDay = new Ref(day);
                var refDaz = new Ref(daz);
                var rintersectValue = rintersect(x.$, y.$, 0, gx, gy, 0, x1, y1, x2, y2, refDax, refDay, refDaz);
                dax = refDax.$;
                day = refDay.$;
                daz = refDaz.$;
                if (rintersectValue === 0) {
                    dax = x.$;
                    day = y.$;
                }
                daz = getflorzofslope(dasect, dax, day);
                daz2 = getflorzofslope(wal.nextsector, dax, day);

                sec2 = sector[wal.nextsector];
                if (daz2 < daz - (1 << 8))
                    if ((sec2.floorstat & 1) == 0)
                        if ((z.$) >= daz2 - (flordist - 1)) clipyou = 1;
                if (clipyou == 0) {
                    daz = getceilzofslope(dasect, dax, day);
                    daz2 = getceilzofslope(wal.nextsector, dax, day);
                    if (daz2 > daz + (1 << 8))
                        if ((sec2.ceilingstat & 1) == 0)
                            if ((z.$) <= daz2 + (ceildist - 1)) clipyou = 1;
                }
            }

            if (clipyou) {
                /* Add 2 boxes at endpoints */
                bsz = walldist;
                if (gx < 0) bsz = -bsz;
                addclipline(x1 - bsz, y1 - bsz, x1 - bsz, y1 + bsz, j + 32768);
                addclipline(x2 - bsz, y2 - bsz, x2 - bsz, y2 + bsz, j + 32768);
                bsz = walldist;
                if (gy < 0) bsz = -bsz;
                addclipline(x1 + bsz, y1 - bsz, x1 - bsz, y1 - bsz, j + 32768);
                addclipline(x2 + bsz, y2 - bsz, x2 - bsz, y2 - bsz, j + 32768);

                dax = walldist;
                if (dy > 0) dax = -dax;
                day = walldist;
                if (dx < 0) day = -day;
                addclipline(x1 + dax, y1 + day, x2 + dax, y2 + day, j + 32768);
            }
            else {
                for (i = clipsectnum - 1; i >= 0; i--)
                    if (wal.nextsector == clipsectorlist[i]) break;
                if (i < 0) clipsectorlist[clipsectnum++] = wal.nextsector;
            }
            startwall++;
        }

        for(j=headspritesect[dasect]; j>=0; j=nextspritesect[j])
        {
            spr = sprite[j];
            cstat = spr.cstat;
            if ((cstat&dasprclipmask) == 0) continue;
            x1 = spr.x;
            y1 = spr.y;
            switch(cstat&48)
            {
                case 0:
                    if ((x1 >= xmin) && (x1 <= xmax) && (y1 >= ymin) && (y1 <= ymax))
                    {
                        k = ((tiles[spr.picnum].dim.height*spr.yrepeat)<<2);
                        if (cstat&128) daz = spr.z+(k>>1);
                        else daz = spr.z;

                        if (tiles[spr.picnum].animFlags&0x00ff0000) 
                            daz -= ((/*(int8_t )*/((tiles[spr.picnum].animFlags>>16)&255))*spr.yrepeat<<2);

                        if (((z.$) < daz+ceildist) && ((z.$) > daz-k-flordist)){
                            bsz = (spr.clipdist<<2)+walldist;
                            if (gx < 0) bsz = -bsz;
                            addclipline(x1-bsz,y1-bsz,x1-bsz,y1+bsz,j+49152);
                            bsz = (spr.clipdist<<2)+walldist;
                            if (gy < 0) bsz = -bsz;
                            addclipline(x1+bsz,y1-bsz,x1-bsz,y1-bsz,j+49152);
                        }
                    }
                    break;
                case 16:
                    k = ((tiles[spr.picnum].dim.height*spr.yrepeat)<<2);

                    if (cstat&128) 
                        daz = spr.z+(k>>1);
                    else 
                        daz = spr.z;

                    if (tiles[spr.picnum].animFlags&0x00ff0000) 
                        daz -= ((/*(int8_t  )*/((tiles[spr.picnum].animFlags>>16)&255))*spr.yrepeat<<2);
                    daz2 = daz-k;
                    daz += ceildist;
                    daz2 -= flordist;
                    if (((z.$) < daz) && ((z.$) > daz2))
                    {
                        /*
                            * These lines get the 2 points of the rotated sprite
                            * Given: (x1, y1) starts out as the center point
                            */
                        tilenum = spr.picnum;
                        xoff =/* (int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags>>8)&255))+(spr.xoffset);
                        if ((cstat&4) > 0) xoff = -xoff;
                        k = spr.ang;
                        l = spr.xrepeat;
                        dax = sinTable[k&2047]*l;
                        day = sinTable[(k+1536)&2047]*l;
                        l = tiles[tilenum].dim.width;
                        k = (l>>1)+xoff;
                        x1 -= mulscale16(dax,k);
                        x2 = x1+mulscale16(dax,l);
                        y1 -= mulscale16(day,k);
                        y2 = y1+mulscale16(day,l);
                        if (clipinsideboxline(cx,cy,x1,y1,x2,y2,rad) != 0)
                        {
                            dax = mulscale14(sinTable[(spr.ang+256+512)&2047],walldist);
                            day = mulscale14(sinTable[(spr.ang+256)&2047],walldist);

                            if ((x1-(x.$))*(y2-(y.$)) >= (x2-(x.$))*(y1-(y.$)))   /* Front */
                            {
                                addclipline(x1+dax,y1+day,x2+day,y2-dax,j+49152);
                            }
                            else
                            {
                                if ((cstat&64) != 0) continue;
                                addclipline(x2-dax,y2-day,x1-day,y1+dax,j+49152);
                            }

                            /* Side blocker */
                            if ((x2-x1)*((x.$)-x1) + (y2-y1)*((y.$)-y1) < 0)
                            {
                                addclipline(x1-day,y1+dax,x1+dax,y1+day,j+49152);
                            }
                            else if ((x1-x2)*((x.$)-x2) + (y1-y2)*((y.$)-y2) < 0)
                            {
                                addclipline(x2+day,y2-dax,x2-dax,y2-day,j+49152);
                            }
                        }
                    }
                    break;
                case 32:
                    daz = spr.z+ceildist;
                    daz2 = spr.z-flordist;
                    if (((z.$) < daz) && ((z.$) > daz2))
                    {
                        if ((cstat&64) != 0)
                            if (((z.$) > spr.z) == ((cstat&8)==0)) continue;

                        tilenum = spr.picnum;
                        xoff =/*(int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags >> 8) & 255)) + (/*(int32_t)*/spr.xoffset);
                        yoff =/*(int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags>>16)&255))+(/*(int32_t)*/spr.yoffset);
                        if ((cstat&4) > 0) xoff = -xoff;
                        if ((cstat&8) > 0) yoff = -yoff;

                        k = spr.ang;
                        cosang = sinTable[(k+512)&2047];
                        sinang = sinTable[k];
                        xspan = tiles[tilenum].dim.width;
                        xrepeat = spr.xrepeat;
                        yspan = tiles[tilenum].dim.height;
                        yrepeat = spr.yrepeat;

                        dax = ((xspan>>1)+xoff)*xrepeat;
                        day = ((yspan>>1)+yoff)*yrepeat;
                        rxi[0] = x1 + dmulscale16(sinang,dax,cosang,day);
                        ryi[0] = y1 + dmulscale16(sinang,day,-cosang,dax);
                        l = xspan*xrepeat;
                        rxi[1] = rxi[0] - mulscale16(sinang,l);
                        ryi[1] = ryi[0] + mulscale16(cosang,l);
                        l = yspan*yrepeat;
                        k = -mulscale16(cosang,l);
                        rxi[2] = rxi[1]+k;
                        rxi[3] = rxi[0]+k;
                        k = -mulscale16(sinang,l);
                        ryi[2] = ryi[1]+k;
                        ryi[3] = ryi[0]+k;

                        dax = mulscale14(sinTable[(spr.ang-256+512)&2047],walldist);
                        day = mulscale14(sinTable[(spr.ang-256)&2047],walldist);

                        if ((rxi[0]-(x.$))*(ryi[1]-(y.$)) < (rxi[1]-(x.$))*(ryi[0]-(y.$)))
                        {
                            if (clipinsideboxline(cx,cy,rxi[1],ryi[1],rxi[0],ryi[0],rad) != 0)
                                addclipline(rxi[1]-day,ryi[1]+dax,rxi[0]+dax,ryi[0]+day,j+49152);
                        }
                        else if ((rxi[2]-(x.$))*(ryi[3]-(y.$)) < (rxi[3]-(x.$))*(ryi[2]-(y.$)))
                        {
                            if (clipinsideboxline(cx,cy,rxi[3],ryi[3],rxi[2],ryi[2],rad) != 0)
                                addclipline(rxi[3]+day,ryi[3]-dax,rxi[2]-dax,ryi[2]-day,j+49152);
                        }

                        if ((rxi[1]-(x.$))*(ryi[2]-(y.$)) < (rxi[2]-(x.$))*(ryi[1]-(y.$)))
                        {
                            if (clipinsideboxline(cx,cy,rxi[2],ryi[2],rxi[1],ryi[1],rad) != 0)
                                addclipline(rxi[2]-dax,ryi[2]-day,rxi[1]-day,ryi[1]+dax,j+49152);
                        }
                        else if ((rxi[3]-(x.$))*(ryi[0]-(y.$)) < (rxi[0]-(x.$))*(ryi[3]-(y.$)))
                        {
                            if (clipinsideboxline(cx,cy,rxi[0],ryi[0],rxi[3],ryi[3],rad) != 0)
                                addclipline(rxi[0]+dax,ryi[0]+day,rxi[3]+day,ryi[3]-dax,j+49152);
                        }
                    }
                    break;
                }
            }
    } while (clipsectcnt < clipsectnum);

    hitwall = 0;
    cnt = clipmoveboxtracenum;
    do
    {
        intx = goalx;
        inty = goaly;

        var intxRef = new Ref(intx);
        var intyRef = new Ref(inty);
        hitwall = Engine.raytrace(x.$, y.$, intxRef, intyRef);
        intx = intxRef.$;
        inty  = intyRef.$;
        if ((hitwall) >= 0)
        {
            lx = clipit[hitwall].x2-clipit[hitwall].x1;
            ly = clipit[hitwall].y2-clipit[hitwall].y1;
            templong2 = lx*lx + ly*ly;
            if (templong2 > 0)
            {
                templong1 = (goalx-intx)*lx + (goaly-inty)*ly;

                if ((klabs(templong1)>>11) < templong2)
                    i = divscale20(templong1,templong2);
                else
                    i = 0;
                goalx = mulscale20(lx,i)+intx;
                goaly = mulscale20(ly,i)+inty;
            }

            templong1 = dmulscale6(lx,oxvect,ly,oyvect);
            for(i=cnt+1; i<=clipmoveboxtracenum; i++)
            {
                j = hitwalls[i];
                templong2 = dmulscale6(clipit[j].x2-clipit[j].x1,oxvect,clipit[j].y2-clipit[j].y1,oyvect);
                if ((templong1^templong2) < 0)
                {
                    updatesector(x.$,y.$,sectnum);
                    return(retval);
                }
            }

            var goalxRef = new Ref(goalx);
            var goalyRef = new Ref(goaly);
            Engine.keepaway(goalx, goaly, hitwall);
            goalx = goalxRef.$;
            goaly = goalyRef.$;

            xvect = ((goalx-intx)<<14);
            yvect = ((goaly-inty)<<14);

            if (cnt == clipmoveboxtracenum) retval = clipobjectval[hitwall];
            hitwalls[cnt] = hitwall;
        }
        cnt--;

        x.$ = intx;
        y.$ = inty;
    } while (((xvect|yvect) != 0) && (hitwall >= 0) && (cnt > 0));

    for(j=0; j<clipsectnum; j++)
        if (inside(x.$,y.$,clipsectorlist[j]) == 1)
        {
            sectnum.$ = clipsectorlist[j];
            return(retval);
        }
    debugger;
    sectnum.$ = -1;
    templong1 = 0x7fffffff;
    for(j=numsectors-1; j>=0; j--)
        if (inside(x.$,y.$,j) == 1)
        {
            if (sector[j].ceilingstat&2)
                templong2 = (getceilzofslope(j,x.$,y.$)-(z.$));
        else
                templong2 = (sector[j].ceilingz-(z.$));

            if (templong2 > 0)
            {
                if (templong2 < templong1)
                {
                    sectnum.$ = j;
                    templong1 = templong2;
                }
            }
            else
            {
                if (sector[j].floorstat&2)
                    templong2 = ((z.$)-getflorzofslope(j,x.$,y.$));
            else
                    templong2 = ((z.$)-sector[j].floorz);

                if (templong2 <= 0)
                {
                    sectnum.$ = j;
                    return(retval);
                }
                if (templong2 < templong1)
                {
                    sectnum.$ = j;
                    templong1 = templong2;
                }
            }
        }

    return retval;
}



//
//7344
/*
 FCS:  x and y are the new position of the entity that has just moved:
 lastKnownSector is an hint (the last known sectorID of the entity).

 Thanks to the "hint", the algorithm check:
 1. Is (x,y) inside sectors[sectnum].
 2. Flood in sectnum portal and check again if (x,y) is inside.
 3. Do a linear search on sectors[sectnum] from 0 to numSectors.

 Note: Inside uses cross_product and return as soon as the point switch
 from one side to the other.
 */
function updatesector(x, y, lastKnownSector) {
    var wal;
    var i, j;

    //First check the last sector where (old_x,old_y) was before being updated to (x,y)
    if (inside(x, y, lastKnownSector) == 1) {
        //We found it and (x,y) is still in the same sector: nothing to update !
        return;
    }

    throw new Error("todo");
}

//7795
function krand() {
    randomseed = (mul32(randomseed, 27584621) + 1) | 0;
    return randomseed >>> 16;
}

function GetZRangeRefObj(ceilz, ceilhit, florz, florhit) {
    this.ceilz = ceilz || 0;
    this.ceilhit = ceilhit || 0;
    this.floorz = florz || 0;
    this.florhit = florhit || 0;
}

//7810
function getzrange(x, y, z, sectnum, refObj, walldist, cliptype) {
    var sec;
    var wal, wal2;
    var spr;
    var clipsectcnt, startwall, endwall, tilenum, xoff, yoff, dax, day;
    var xmin, ymin, xmax, ymax, i, j, k, l, daz, daz2, dx, dy;
    var x1, y1, x2, y2, x3, y3, x4, y4, ang, cosang, sinang;
    var xspan, yspan, xrepeat, yrepeat, dasprclipmask, dawalclipmask;
    var cstat;
    var clipyou = 0;

    if (sectnum < 0) {
        refObj.ceilz = 0x80000000;
        refObj.ceilhit = -1;
        refObj.florz = 0x7fffffff;
        refObj.florhit = -1;
        return;
    }

    /* Extra walldist for sprites on sector lines */
    i = walldist + MAXCLIPDIST + 1;
    xmin = x - i;
    ymin = y - i;
    xmax = x + i;
    ymax = y + i;

    getzsofslope(sectnum, x, y, refObj);
    refObj.ceilhit = sectnum + 16384;
    refObj.florhit = sectnum + 16384;

    dawalclipmask = (cliptype & 65535);
    dasprclipmask = (cliptype >> 16);

    clipsectorlist[0] = sectnum;
    clipsectcnt = 0;
    clipsectnum = 1;

    do  /* Collect sectors inside your square first */ {
        sec = sector[clipsectorlist[clipsectcnt]];
        startwall = sec.wallptr;
        endwall = startwall + sec.wallnum;
        for (j = startwall; j < endwall; j++) {
            wal = wall[startwall];
            k = wal.nextsector;
            if (k >= 0) {
                wal2 = wall[wal.point2];
                x1 = wal.x;
                x2 = wal2.x;
                if ((x1 < xmin) && (x2 < xmin)) continue;
                if ((x1 > xmax) && (x2 > xmax)) continue;
                y1 = wal.y;
                y2 = wal2.y;
                if ((y1 < ymin) && (y2 < ymin)) continue;
                if ((y1 > ymax) && (y2 > ymax)) continue;

                dx = x2 - x1;
                dy = y2 - y1;
                if (dx * (y - y1) < (x - x1) * dy) continue; /* back */
                if (dx > 0) dax = dx * (ymin - y1);
                else dax = dx * (ymax - y1);
                if (dy > 0) day = dy * (xmax - x1);
                else day = dy * (xmin - x1);
                if (dax >= day) continue;

                if (wal.cstat & dawalclipmask) continue;
                sec = sector[k];
                if (editstatus == 0) {
                    if (((sec.ceilingstat & 1) == 0) && (z <= sec.ceilingz + (3 << 8))) continue;
                    if (((sec.floorstat & 1) == 0) && (z >= sec.floorz - (3 << 8))) continue;
                }

                for (i = clipsectnum - 1; i >= 0; i--) if (clipsectorlist[i] == k) break;
                if (i < 0) clipsectorlist[clipsectnum++] = k;

                if ((x1 < xmin + MAXCLIPDIST) && (x2 < xmin + MAXCLIPDIST)) continue;
                if ((x1 > xmax - MAXCLIPDIST) && (x2 > xmax - MAXCLIPDIST)) continue;
                if ((y1 < ymin + MAXCLIPDIST) && (y2 < ymin + MAXCLIPDIST)) continue;
                if ((y1 > ymax - MAXCLIPDIST) && (y2 > ymax - MAXCLIPDIST)) continue;
                if (dx > 0) dax += dx * MAXCLIPDIST;
                else dax -= dx * MAXCLIPDIST;
                if (dy > 0) day -= dy * MAXCLIPDIST;
                else day += dy * MAXCLIPDIST;
                if (dax >= day) continue;

                /* It actually got here, through all the continue's! */
                throw new Error("todo: !");
                //getzsofslope(k,x,y,&daz,&daz2);
                //if (daz > refObj.ceilz) {
                //    refObj.ceilz = daz;
                //    refObj.ceilhit = k+16384;
                //}
                //if (daz2 < refObj.florz) {
                //    refObj.florz = daz2;
                //   refObj.florhit = k+16384;
                //}
                startwall++;
            }
        }
        clipsectcnt++;
    } while (clipsectcnt < clipsectnum);

    for (i = 0; i < clipsectnum; i++) {
        for (j = headspritesect[clipsectorlist[i]]; j >= 0; j = nextspritesect[j]) {
            spr = sprite[j];
            cstat = spr.cstat;
            if (cstat & dasprclipmask) {
                x1 = spr.x;
                y1 = spr.y;

                clipyou = 0;
                switch (cstat & 48) {
                    case 0:
                        k = walldist + (spr.clipdist << 2) + 1;
                        if ((klabs(x1 - x) <= k) && (klabs(y1 - y) <= k)) {
                            daz = spr.z;
                            k = ((tiles[spr.picnum].dim.height * spr.yrepeat) << 1);
                            if (cstat & 128)
                                daz += k;
                            //if (tiles[spr.picnum].animFlags & 0x00ff0000) daz -=
                            //    ((int32_t)((int8_t)((tiles[spr.picnum].animFlags >> 16) & 255)) * spr.yrepeat << 2);
                            if (tiles[spr.picnum].animFlags & 0x00ff0000) daz -=
                                (/*(int32_t)*/(/*(int8_t)*/((tiles[spr.picnum].animFlags >> 16) & 255)) * spr.yrepeat << 2);
                            daz2 = daz - (k << 1);
                            clipyou = 1;
                        }
                        break;
                    case 16:
                        throw new Error("todo");
                        //tilenum = spr.picnum;
                        //xoff =/* (int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags>>8)&255))+((int32_t)spr.xoffset);
                        //if ((cstat&4) > 0) xoff = -xoff;
                        //k = spr.ang;
                        //l = spr.xrepeat;
                        //dax = sinTable[k&2047]*l;
                        //day = sinTable[(k+1536)&2047]*l;
                        //l = tiles[tilenum].dim.width;
                        //k = (l>>1)+xoff;
                        //x1 -= mulscale16(dax,k);
                        //x2 = x1+mulscale16(dax,l);
                        //y1 -= mulscale16(day,k);
                        //y2 = y1+mulscale16(day,l);
                        //if (clipinsideboxline(x,y,x1,y1,x2,y2,walldist+1) != 0)
                        //{
                        //    daz = spr.z;
                        //    k = ((tiles[spr.picnum].dim.height*spr.yrepeat)<<1);
                        //    if (cstat&128)
                        //        daz += k;

                        //    if (tiles[spr.picnum].animFlags&0x00ff0000) 
                        //        daz -= ((int32_t)(/*(int8_t  )*/((tiles[spr.picnum].animFlags>>16)&255))*spr.yrepeat<<2);

                        //    daz2 = daz-(k<<1);
                        //    clipyou = 1;
                        //}
                        break;
                    case 32:
                        throw new Error("todo");
                        //daz = spr.z;
                        //daz2 = daz;

                        //if ((cstat&64) != 0)
                        //    if ((z > daz) == ((cstat&8)==0)) continue;

                        //tilenum = spr.picnum;
                        //xoff =/* (int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags>>8)&255))+((int32_t)spr.xoffset);
                        //yoff =/* (int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags>>16)&255))+((int32_t)spr.yoffset);
                        //if ((cstat&4) > 0) xoff = -xoff;
                        //if ((cstat&8) > 0) yoff = -yoff;

                        //ang = spr.ang;
                        //cosang = sinTable[(ang+512)&2047];
                        //sinang = sinTable[ang];
                        //xspan = tiles[tilenum].dim.width;
                        //xrepeat = spr.xrepeat;
                        //yspan = tiles[tilenum].dim.height;
                        //yrepeat = spr.yrepeat;

                        //dax = ((xspan>>1)+xoff)*xrepeat;
                        //day = ((yspan>>1)+yoff)*yrepeat;
                        //x1 += dmulscale16(sinang,dax,cosang,day)-x;
                        //y1 += dmulscale16(sinang,day,-cosang,dax)-y;
                        //l = xspan*xrepeat;
                        //x2 = x1 - mulscale16(sinang,l);
                        //y2 = y1 + mulscale16(cosang,l);
                        //l = yspan*yrepeat;
                        //k = -mulscale16(cosang,l);
                        //x3 = x2+k;
                        //x4 = x1+k;
                        //k = -mulscale16(sinang,l);
                        //y3 = y2+k;
                        //y4 = y1+k;

                        //dax = mulscale14(sinTable[(spr.ang-256+512)&2047],walldist+4);
                        //day = mulscale14(sinTable[(spr.ang-256)&2047],walldist+4);
                        //x1 += dax;
                        //x2 -= day;
                        //x3 -= dax;
                        //x4 += day;
                        //y1 += day;
                        //y2 += dax;
                        //y3 -= day;
                        //y4 -= dax;

                        //if ((y1^y2) < 0)
                        //{
                        //    if ((x1^x2) < 0) clipyou ^= (x1*y2<x2*y1)^(y1<y2);
                        //    else if (x1 >= 0) clipyou ^= 1;
                        //}
                        //if ((y2^y3) < 0)
                        //{
                        //    if ((x2^x3) < 0) clipyou ^= (x2*y3<x3*y2)^(y2<y3);
                        //    else if (x2 >= 0) clipyou ^= 1;
                        //}
                        //if ((y3^y4) < 0)
                        //{
                        //    if ((x3^x4) < 0) clipyou ^= (x3*y4<x4*y3)^(y3<y4);
                        //    else if (x3 >= 0) clipyou ^= 1;
                        //}
                        //if ((y4^y1) < 0)
                        //{
                        //    if ((x4^x1) < 0) clipyou ^= (x4*y1<x1*y4)^(y4<y1);
                        //    else if (x4 >= 0) clipyou ^= 1;
                        //}
                        //break;
                }

                if (clipyou != 0) {
                    if ((z > daz) && (daz > refObj.ceilz)) {
                        refObj.ceilz = daz;
                        refObj.ceilhit = j+49152;
                    }
                    if ((z < daz2) && (daz2 < refObj.florz)) {
                        refObj.florz = daz2;
                        refObj.florhit = j+49152;
                    }
                }
            }
        }
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
/*
 FCS:
 
 Output the ceiling and floor Z coordinate in the two last parameters for given:
 sectorNumber and worldspace (coordinate X,Y).
 
 If the sector is flat, this is jsut a lookup. But if either the floor/ceiling have
 a slope it requires more calculation
 
 */

function getzsofslope(sectnum, dax, day, refObj) {
    var dx, dy, i, j;
    var wal, wal2;
    var sec;

    sec = sector[sectnum];
    refObj.ceilz = sec.ceilingz;
    refObj.florz = sec.floorz;

    //If the sector has a slopped ceiling or a slopped floor then it needs more calculation.
    if ((sec.ceilingstat | sec.floorstat) & 2) {
        wal = wall[sec.wallptr];
        wal2 = wall[wal.point2];
        dx = wal2.x - wal.x;
        dy = wal2.y - wal.y;
        i = (nsqrtasm(dx * dx + dy * dy) << 5);
        if (i == 0) return;
        j = dmulscale3(dx, day - wal.y, -dy, dax - wal.x);

        if (sec.ceilingstat & 2)
            refObj.ceilz = (refObj.ceilz) + scale(sec.ceilingheinum, j, i);
        if (sec.floorstat & 2)
            refObj.florz = (refObj.florz) + scale(sec.floorheinum, j, i);
    }
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
        //console.time("doRotateSprite")
        //console.profile("doRotateSprite")
        doRotateSprite(sx, sy, z, a, picnum, dashade, dapalnum, dastat, cx1, cy1, cx2, cy2);
        //console.profileEnd("doRotateSprite")
        //console.timeEnd("doRotateSprite")
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

    console.warn("makepalookup todo!!!!!!"); // todo
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
    surface.getContext("2d").fillStyle = colorPaletteRrb[dacol].cssColor;
    surface.getContext("2d").fillRect(0, 0, surface.width, surface.height);

    faketimerhandler();
}
//9237

function getceilzofslope(sectnum, dax, day) {
    var dx, dy, i, j;
    var wal;

    if (!(sector[sectnum].ceilingstat & 2))
        return (sector[sectnum].ceilingz);
    
    wal = wall[sector[sectnum].wallptr];
    dx = wall[wal.point2].x - wal.x;
    dy = wall[wal.point2].y - wal.y;
    i = (nsqrtasm(dx * dx + dy * dy) << 5);
    if (i === 0)
        return (sector[sectnum].ceilingz);
    j = dmulscale3(dx, day - wal.y, -dy, dax - wal.x);
    
    return (sector[sectnum].ceilingz + scale(sector[sectnum].ceilingheinum, j, i));
}

//9253
function getflorzofslope(sectnum, dax, day) {
    var dx, dy, i, j;
    var wal;

    if (!(sector[sectnum].floorstat & 2))
        return (sector[sectnum].floorz);

    wal = wall[sector[sectnum].wallptr];
    dx = wall[wal.point2].x - wal.x;
    dy = wall[wal.point2].y - wal.y;
    i = (nsqrtasm(dx * dx + dy * dy) << 5);

    if (i == 0)
        return (sector[sectnum].floorz);

    j = dmulscale3(dx, day - wal.y, -dy, dax - wal.x);

    return (sector[sectnum].floorz + scale(sector[sectnum].floorheinum, j, i));
}