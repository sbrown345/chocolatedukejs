'use strict';

var Engine = {};

var stereowidth = 23040, stereopixelwidth = 28, ostereopixelwidth = -1;
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

var ebpbak, espbak;
var slopalookup = new Int32Array(16384);

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
var bunchWallsList = new Int16Array(MAXWALLSB);

var bunchfirst = new Int16Array(MAXWALLSB), bunchlast = new Int16Array(MAXWALLSB);


var smost = new Int16Array(MAXYSAVES), smostcnt;
var smoststart = new Int16Array(MAXWALLSB);
var smostwalltype = new Uint8Array(MAXWALLSB);
var smostwall = new Int32Array(MAXWALLSB), smostwallcnt = -1;

var maskwall = new Int16Array(MAXWALLSB), maskwallcnt;
var spritesx = new Int32Array(MAXSPRITESONSCREEN);
var spritesy = new Int32Array(MAXSPRITESONSCREEN+1);
var spritesz = new Int32Array(MAXSPRITESONSCREEN);
var tspriteptr = structArray(Sprite, MAXSPRITESONSCREEN);//*tspriteptr[MAXSPRITESONSCREEN];

////FCS: (up-most pixel on column x that can still be drawn to)
var umost = new Int16Array(MAXXDIM + 1);

////FCS: (down-most pixel +1 on column x that can still be drawn to)
var dmost = new Int16Array(MAXXDIM + 1);

//int16_t bakumost[MAXXDIM+1], bakdmost[MAXXDIM+1];
var uplc = new Int16Array(MAXXDIM + 1), dplc = new Int16Array(MAXXDIM + 1);
var uwall = new Int16Array(MAXXDIM + 1), dwall = new Int16Array(MAXXDIM + 1);
var swplc = new Int32Array(MAXXDIM + 1), lplc = new Int32Array(MAXXDIM + 1);
var swall = new Int32Array(MAXXDIM + 1), lwall = new Int32Array(MAXXDIM + 4);
var xdimen = -1, xdimenrecip, halfxdimen, xdimenscale, xdimscale;
var wx1, wy1, wx2, wy2, ydimen;
var viewoffset;

var rxi = new Int32Array(8), ryi = new Int32Array(8), rzi = new Int32Array(8), rxi2 = new Int32Array(8), ryi2 = new Int32Array(8), rzi2 = new Int32Array(8);
var xsi = new Int32Array(8), ysi = new Int32Array(8);

///* used to be static. --ryan. */
var horizlookup, horizlookup2, horizycent;

var globalposx, globalposy, globalposz, globalhoriz;
var globalang, globalcursectnum;
var globalpal, cosglobalang, singlobalang;
var cosviewingrangeglobalang, sinviewingrangeglobalang;
var globalpalwritten; //ptr to palookup
var globaluclip, globaldclip, globvis = 0;
var globalvisibility, globalhisibility, globalpisibility, globalcisibility;
var globparaceilclip, globparaflorclip;

var xyaspect, viewingrangerecip;

//int32_t asm1, asm2, asm3, asm4;


var vplce = new Int32Array(4), vince = new Int32Array(4);
var bufplce = new Int32Array(4);

var palookupoffse = new Array(4);

var globalxshift, globalyshift;
var globalxpanning, globalypanning, globalshade;
var globalpicnum, globalshiftval;
var globalzd, globalyscale, globalorientation;
var globalbufplc;
var globalx1, globaly1, globalx2, globaly2, globalx3, globaly3, globalzx;
var globalx, globaly, globalz;

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
var hitscangoalx = (1<<29)-1, hitscangoaly = (1<<29)-1;

function LineType() {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
}
var clipit = structArray(LineType, MAXCLIPNUM);
var clipsectorlist = new Int16Array(MAXCLIPNUM), clipsectnum = 0;
var clipobjectval = new Int16Array(MAXCLIPNUM);

function PermFifoType() {
    this.sx = 0; this.sy = 0; this.z = 0;
    this.a = 0; this.picnum = 0;
    this.dashade = 0;
    this.dapalnum = 0; this.dastat = 0; this.pagesleft = 0;
    this.cx1 = 0; this.cy1 = 0; this.cx2 = 0; this.cy2 = 0;
}

var permfifo = structArray(PermFifoType, MAXPERMS);
var permhead = 0, permtail = 0;

//FCS: Num walls to potentially render.
var numscans;

var numbunches;

var numhits;

var editstatus = 0;
var searchit;
var searchx = -1, searchy;                     /* search input  */
var searchsector, searchwall, searchstat;     /* search output */

var numtilefiles, artfil = -1, artfilnum, artfilplc;

var inpreparemirror = 0;
var mirrorsx1, mirrorsy1, mirrorsx2, mirrorsy2;

var totalclocklock;

//278
function nsqrtasm(param) {
    //todo: compare perf and output with Math.sqrt(param) | 0;
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

    //console.log("nsqrtasm: %i", param);
    return param;
}

krecipasm.ab = new ArrayBuffer(4);
krecipasm.f = new Float32Array(krecipasm.ab);
krecipasm.i = new Int32Array(krecipasm.ab);
function krecipasm(i) { // Ken did this
    krecipasm.f[0] = i;
    i = krecipasm.i[0];
    return ((recipTable[(i >> 12) & 2047] >> (((i - 0x3f800000) >> 23) & 31)) ^ (i >> 31));
}

//329

/*
 FCS:
 Scan through sectors using portals (a portal is wall with a nextsector attribute >= 0).
 Flood is prevented if a portal does not face the POV.
 */
function scansector(sectnum) {
    var wal, walIdx, wal2;
    var spr;
    var xs, ys, x1, y1, x2, y2, xp1, yp1, xp2 = 0, yp2 = 0, tempint;
    var z, zz, startwall, endwall, numscansbefore, scanfirst, bunchfrst;
    var nextsectnum;
    ////The stack storing sectors to visit.
    var sectorsToVisit = new Int16Array(256), numSectorsToVisit;

    var skipitaddwall = function () {
        if ((wall[z].point2 < z) && (scanfirst < numscans)) {
            bunchWallsList[numscans - 1] = scanfirst;
            scanfirst = numscans;
            console.log("scanfirst: %i", scanfirst);
        }
    };

    if (sectnum < 0)
        return;

    console.log("start scansector pvWalls[3].screenSpaceCoo[1][VEC_COL]: %i", pvWalls[3].screenSpaceCoo[1][VEC_COL]); // todo dax2 is wrong in grouscan
    if (automapping)
        show2dsector[sectnum >> 3] |= pow2char[sectnum & 7];

    sectorsToVisit[0] = sectnum;
    numSectorsToVisit = 1;
    do {
        sectnum = sectorsToVisit[--numSectorsToVisit];

        //Add every script in the current sector as potentially visible.
        for (z = headspritesect[sectnum]; z >= 0; z = nextspritesect[z]) {
            spr = sprite[z];
            if ((((spr.cstat & 0x8000) == 0) || (showinvisibility)) &&
                    (spr.xrepeat > 0) && (spr.yrepeat > 0) &&
                    (spritesortcnt < MAXSPRITESONSCREEN)) {
                xs = spr.x - globalposx;
                ys = spr.y - globalposy;
                if ((spr.cstat & 48) || (xs * cosglobalang + ys * singlobalang > 0)) {
                    //copybufbyte(spr, 0, tsprite[spritesortcnt], 44);
                    for (var key in spr) {  
                        tsprite[spritesortcnt][key] = spr[key];
                    }
                    //tsprite[spritesortcnt].copyTo(spr);
                    tsprite[spritesortcnt++].owner = z;
                }
            }
        }

        //Mark the current sector bit as "visited" in the bitvector
        visitedSectors[sectnum >> 3] |= pow2char[sectnum & 7];

        bunchfrst = numbunches;
        numscansbefore = numscans;

        startwall = sector[sectnum].wallptr;
        endwall = startwall + sector[sectnum].wallnum;
        scanfirst = numscans;


        for (z = startwall, wal = wall[walIdx = z]; z < endwall; z++, wal = wall[++walIdx]) {
            nextsectnum = wal.nextsector;

            wal2 = wall[wal.point2];

            // In camera space the center is the player.
            // Tranform the 2 Wall endpoints (x,y) from worldspace to camera space.
            // After that we have two vectors starting from the camera and going to the endpoints (x1,y1) and (x2,y2).
            x1 = wal.x - globalposx;
            y1 = wal.y - globalposy;

            x2 = wal2.x - globalposx;
            y2 = wal2.y - globalposy;
            //console.log("x1: %i, y1: %i, x2: %i, y2: %i", x1, y1, x2, y2);

            // If this is a portal...
            if ((nextsectnum >= 0) && ((wal.cstat & 32) == 0))
                //If this portal has not been visited yet.
                if ((visitedSectors[nextsectnum >> 3] & pow2char[nextsectnum & 7]) == 0) {
                    //Cross product . Z component
                    tempint = x1 * y2 - x2 * y1;

                    // Using cross product, determine if the portal is facing us or not.
                    // If it is: Add it to the stack and bump the stack counter.
                    // This line is equivalent to tempint < 0x40000
                    if ((/*(uint32_t)*/tempint + 262144) < 524288) // ??? What is this test ?? How acute the angle is ?
                    {
                        //(x2-x1)*(x2-x1)+(y2-y1)*(y2-y1) is the squared length of the wall
                        // ??? What is this test ?? How acute the angle is ?
                        if (mulscale5(tempint, tempint) <= (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
                            sectorsToVisit[numSectorsToVisit++] = nextsectnum;
                    }
                }

            // Rotate the wall endpoints vectors according to the player orientation.
            // This is a regular rotation matrix using [29.3] fixed point.
            if ((z == startwall) || (wall[z - 1].point2 != z)) {
                //If this is the first endpoint of the bunch, rotate: This is a standard cos sin 2D rotation matrix projection
                xp1 = dmulscale6(y1, cosglobalang, -x1, singlobalang);
                yp1 = dmulscale6(x1, cosviewingrangeglobalang, y1, sinviewingrangeglobalang);
            }
            else {
                //If this is NOT the first endpoint, Save the coordinate for next loop.
                xp1 = xp2;
                yp1 = yp2;
            }

            // Rotate: This is a standard cos sin 2D rotation matrix projection
            xp2 = dmulscale6(y2, cosglobalang, -x2, singlobalang);
            yp2 = dmulscale6(x2, cosviewingrangeglobalang, y2, sinviewingrangeglobalang);



            // Equivalent of a near plane clipping ?
            if ((yp1 < 256) && (yp2 < 256)) { skipitaddwall(); continue; }

            /* If wall's NOT facing you */
            if (dmulscale32(xp1, yp2, -xp2, yp1) >= 0) { skipitaddwall(); continue; }

            // The wall is still not eligible for rendition: Let's do some more Frustrum culling !!
            if (xp1 >= -yp1) {

                if ((xp1 > yp1) || (yp1 == 0))
                { skipitaddwall(); continue; }

                //Project the point onto screen and see in which column it belongs.
                pvWalls[numscans].screenSpaceCoo[0][VEC_COL] = halfxdimen + scale(xp1, halfxdimen, yp1);
                if (xp1 >= 0)
                    pvWalls[numscans].screenSpaceCoo[0][VEC_COL]++;   /* Fix for SIGNED divide */

                if (pvWalls[numscans].screenSpaceCoo[0][VEC_COL] >= xdimen)
                    pvWalls[numscans].screenSpaceCoo[0][VEC_COL] = xdimen - 1;

                pvWalls[numscans].screenSpaceCoo[0][VEC_DIST] = yp1;
            }
            else {

                if (xp2 < -yp2)
                { skipitaddwall(); continue; }

                pvWalls[numscans].screenSpaceCoo[0][VEC_COL] = 0;
                tempint = yp1 - yp2 + xp1 - xp2;

                if (tempint == 0)
                { skipitaddwall(); continue; }

                pvWalls[numscans].screenSpaceCoo[0][VEC_DIST] = yp1 + scale(yp2 - yp1, xp1 + yp1, tempint);
            }

            if (pvWalls[numscans].screenSpaceCoo[0][VEC_DIST] < 256)
            { skipitaddwall(); continue; }

            if (xp2 <= yp2) {

                if ((xp2 < -yp2) || (yp2 == 0)) { skipitaddwall(); continue; }
                pvWalls[numscans].screenSpaceCoo[1][VEC_COL] = halfxdimen + scale(xp2, halfxdimen, yp2) - 1;
                if (xp2 >= 0) pvWalls[numscans].screenSpaceCoo[1][VEC_COL]++;   /* Fix for SIGNED divide */
                if (pvWalls[numscans].screenSpaceCoo[1][VEC_COL] >= xdimen) pvWalls[numscans].screenSpaceCoo[1][VEC_COL] = xdimen - 1;
                pvWalls[numscans].screenSpaceCoo[1][VEC_DIST] = yp2;
            }
            else {

                if (xp1 > yp1) { skipitaddwall(); continue; }
                pvWalls[numscans].screenSpaceCoo[1][VEC_COL] = xdimen - 1;
                tempint = xp2 - xp1 + yp1 - yp2;
                if (tempint == 0) { skipitaddwall(); continue; }
                pvWalls[numscans].screenSpaceCoo[1][VEC_DIST] = yp1 + scale(yp2 - yp1, yp1 - xp1, tempint);
            }
            if ((pvWalls[numscans].screenSpaceCoo[1][VEC_DIST] < 256) || (pvWalls[numscans].screenSpaceCoo[0][VEC_COL] > pvWalls[numscans].screenSpaceCoo[1][VEC_COL])) {
                skipitaddwall(); continue;
            }

            // Made it all the way!
            // Time to add this wall information to the stack of wall potentially visible.
            pvWalls[numscans].sectorId = sectnum;
            pvWalls[numscans].worldWallId = z;

            //Save the camera space wall endpoints coordinate (camera origin at player location + rotated according to player orientation).
            pvWalls[numscans].cameraSpaceCoo[0][VEC_X] = xp1;
            pvWalls[numscans].cameraSpaceCoo[0][VEC_Y] = yp1;
            pvWalls[numscans].cameraSpaceCoo[1][VEC_X] = xp2;
            pvWalls[numscans].cameraSpaceCoo[1][VEC_Y] = yp2;
            //console.log("xp1: %i, yp1: %i, xp2: %i, yp2: %i", xp1, yp1, xp2, yp2);

            bunchWallsList[numscans] = numscans + 1;
            numscans++;

            skipitaddwall();
        }

        //FCS: TODO rename this p2[] to bunchList[] or something like that. This name is an abomination
        //     DONE, p2 is now called "bunchWallsList".

        //Break down the list of walls for this sector into bunchs. Since a bunch is a
        // continuously visible list of wall: A sector can generate many bunches.
        for (z = numscansbefore; z < numscans; z++) {
            if ((wall[pvWalls[z].worldWallId].point2 !=
                 pvWalls[bunchWallsList[z]].worldWallId) || (pvWalls[z].screenSpaceCoo[1][VEC_COL] >= pvWalls[bunchWallsList[z]].screenSpaceCoo[0][VEC_COL])) {
                // Create an entry in the bunch list
                bunchfirst[numbunches++] = bunchWallsList[z];

                //Mark the end of the bunch wall list.
                bunchWallsList[z] = -1;
            }
        }

        //For each bunch, find the last wall and cache it in bunchlast.
        for (z = bunchfrst; z < numbunches; z++) {
            for (zz = bunchfirst[z]; bunchWallsList[zz] >= 0; zz = bunchWallsList[zz]);
            bunchlast[z] = zz;
        }

    } while (numSectorsToVisit > 0);
    // do this until the stack of sectors to visit if empty.
    
    console.log("end scansector pvWalls[3].screenSpaceCoo[1][VEC_COL]: %i", pvWalls[3].screenSpaceCoo[1][VEC_COL]); // todo dax2 is wrong in grouscan
}


/*
 FCS:
    
 Goal : ????
 param 1: Z is the wallID in the list of potentially visible walls.
 param 2: Only used to lookup the xrepeat attribute of the wall.
 
*/
function prepwall(z, wal) {
    var i, l=0, ol=0, splc, sinc, x, topinc, top, botinc, bot, walxrepeat;
    var wallCoo = pvWalls[z].cameraSpaceCoo;
    
    walxrepeat = (wal.xrepeat<<3);

    /* lwall calculation */
    i = pvWalls[z].screenSpaceCoo[0][VEC_COL]-halfxdimen;
    
    //Let's use some of the camera space wall coordinate now.
    topinc = -(wallCoo[0][VEC_Y]>>2);
    botinc = ((wallCoo[1][VEC_Y]-wallCoo[0][VEC_Y])>>8);
    
    top = mulscale5(wallCoo[0][VEC_X],xdimen)+mulscale2(topinc,i);
    bot = mulscale11(wallCoo[0][VEC_X]-wallCoo[1][VEC_X],xdimen)+mulscale2(botinc,i);

    splc = mulscale19(wallCoo[0][VEC_Y],xdimscale);
    sinc = mulscale16(wallCoo[1][VEC_Y]-wallCoo[0][VEC_Y],xdimscale);

    //X screenspce column of point Z.
    x = pvWalls[z].screenSpaceCoo[0][VEC_COL];
    
    if (bot != 0)
    {
        l = divscale12(top,bot);
        swall[x] = mulscale21(l,sinc)+splc;
        l *= walxrepeat;
        lwall[x] = (l>>18);
    }
    
    //If the wall is less than 4 column wide.
    while (x+4 <= pvWalls[z].screenSpaceCoo[1][VEC_COL])
    {
        top += topinc;
        bot += botinc;
        if (bot != 0)
        {
            ol = l;
            l = divscale12(top,bot);
            swall[x+4] = mulscale21(l,sinc)+splc;
            l *= walxrepeat;
            lwall[x+4] = (l>>18);
        }
        i = ((ol+l)>>1);
        lwall[x+2] = (i>>18);
        lwall[x+1] = ((ol+i)>>19);
        lwall[x+3] = ((l+i)>>19);
        swall[x+2] = ((swall[x]+swall[x+4])>>1);
        swall[x+1] = ((swall[x]+swall[x+2])>>1);
        swall[x+3] = ((swall[x+4]+swall[x+2])>>1);
        x += 4;
    }
    
    //If the wall is less than 2 columns wide.
    if (x+2 <= pvWalls[z].screenSpaceCoo[1][VEC_COL])
    {
        top += (topinc>>1);
        bot += (botinc>>1);
        if (bot != 0)
        {
            ol = l;
            l = divscale12(top,bot);
            swall[x+2] = mulscale21(l,sinc)+splc;
            l *= walxrepeat;
            lwall[x+2] = (l>>18);
        }
        lwall[x+1] = ((l+ol)>>19);
        swall[x+1] = ((swall[x]+swall[x+2])>>1);
        x += 2;
    }
    
    //The wall is 1 column wide.
    if (x+1 <= pvWalls[z].screenSpaceCoo[1][VEC_COL])
    {
        bot += (botinc>>2);
        if (bot != 0)
        {
            l = divscale12(top+(topinc>>2),bot);
            swall[x+1] = mulscale21(l,sinc)+splc;
            lwall[x+1] = mulscale18(l,walxrepeat);
        }
    }

    if (lwall[pvWalls[z].screenSpaceCoo[0][VEC_COL]] < 0)
        lwall[pvWalls[z].screenSpaceCoo[0][VEC_COL]] = 0;
    
    if ((lwall[pvWalls[z].screenSpaceCoo[1][VEC_COL]] >= walxrepeat) && (walxrepeat))
        lwall[pvWalls[z].screenSpaceCoo[1][VEC_COL]] = walxrepeat-1;
    
    if (wal.cstat&8)
    {
        walxrepeat--;
        for(x=pvWalls[z].screenSpaceCoo[0][VEC_COL]; x<=pvWalls[z].screenSpaceCoo[1][VEC_COL]; x++)
            lwall[x] = walxrepeat-lwall[x];
    }
}


//658


function getpalookup(davis, dashade) {
    return (Math.min(Math.max(dashade + (davis >> 8), 0), numpalookups - 1));
}

//665
function hline(xr, yp) {
    var xl, r, s;
    printf("hline\n");

    xl = lastx[yp];

    if (xl > xr)
        return;

    r = horizlookup2[yp - globalhoriz + horizycent];
    asm1 = globalx1 * r;
    asm2 = globaly2 * r;
    s = (getpalookup(mulscale16(r, globvis), globalshade) << 8);

    hlineasm4(xr - xl, s, globalx2 * r + globalypanning, globaly1 * r + globalxpanning, ylookup[yp] + xr, frameoffset);
}

//710
/* renders non-parallaxed ceilings. --ryan. */
function ceilscan ( x1,  x2,  sectnum)
{
    var i, j, ox, oy, x, y1, y2, twall, bwall;
    var sec;

    sec = sector[sectnum];
    
    if (palookup[sec.ceilingpal] != globalpalwritten)
        palookup[globalpalwritten] = palookup[sec.ceilingpal];

    
    globalzd = sec.ceilingz-globalposz;
    
    
    if (globalzd > 0)
        return;
    
    
    globalpicnum = sec.ceilingpicnum;
    
    if (/*(uint32_t)*/globalpicnum >= MAXTILES)
        globalpicnum = 0;
    
    setgotpic(globalpicnum);
    
    //Check the tile dimension are valid.
    if ((tiles[globalpicnum].dim.width <= 0) ||
        (tiles[globalpicnum].dim.height <= 0))
        return;
    
    if (tiles[globalpicnum].animFlags&192)
        globalpicnum += animateoffs(globalpicnum);

    TILE_MakeAvailable(globalpicnum);
    
    globalbufplc = tiles[globalpicnum].data;

    globalshade = sec.ceilingshade;
    globvis = globalcisibility;
    if (sec.visibility != 0)
        globvis = mulscale4(globvis, (toUint8(sec.visibility + 16)));
    
    globalorientation = sec.ceilingstat;


    if ((globalorientation&64) == 0){
        globalx1 = singlobalang;
        globalx2 = singlobalang;
        globaly1 = cosglobalang;
        globaly2 = cosglobalang;
        globalxpanning = (globalposx<<20);
        globalypanning = -(globalposy<<20);
    }
    else{
        j = sec.wallptr;
        ox = wall[wall[j].point2].x - wall[j].x;
        oy = wall[wall[j].point2].y - wall[j].y;
        i = nsqrtasm(ox*ox+oy*oy);
        
        if (i == 0)
            i = 1024;
        else
            i = (1048576/i) | 0;
        
        globalx1 = mulscale10(dmulscale10(ox,singlobalang,-oy,cosglobalang),i);
        globaly1 = mulscale10(dmulscale10(ox,cosglobalang,oy,singlobalang),i);
        globalx2 = -globalx1;
        globaly2 = -globaly1;

        ox = ((wall[j].x-globalposx)<<6);
        oy = ((wall[j].y-globalposy)<<6);
        i = dmulscale14(oy,cosglobalang,-ox,singlobalang);
        j = dmulscale14(ox,cosglobalang,oy,singlobalang);
        ox = i;
        oy = j;
        globalxpanning = globalx1*ox - globaly1*oy;
        globalypanning = globaly2*ox + globalx2*oy;
    }

    globalx2 = mulscale16(globalx2,viewingrangerecip);
    globaly1 = mulscale16(globaly1,viewingrangerecip);
    globalxshift = (8-(picsiz[globalpicnum]&15));
    globalyshift = (8-(picsiz[globalpicnum]>>4));
    if (globalorientation&8) {
        globalxshift++;
        globalyshift++;
    }

    if ((globalorientation&0x4) > 0){
        i = globalxpanning;
        globalxpanning = globalypanning;
        globalypanning = i;
        i = globalx2;
        globalx2 = -globaly1;
        globaly1 = -i;
        i = globalx1;
        globalx1 = globaly2;
        globaly2 = i;
    }
    if ((globalorientation&0x10) > 0){
        globalx1 = -globalx1;
        globaly1 = -globaly1;
        globalxpanning = -globalxpanning;
    }
    if ((globalorientation&0x20) > 0){
        globalx2 = -globalx2;
        globaly2 = -globaly2;
        globalypanning = -globalypanning;
    }
    
    globalx1 <<= globalxshift;
    globaly1 <<= globalxshift;
    globalx2 <<= globalyshift;
    globaly2 <<= globalyshift;
    globalxpanning <<= globalxshift;
    globalypanning <<= globalyshift;
    globalxpanning += ((sec.ceilingxpanning)<<24);
    globalypanning += ((sec.ceilingypanning)<<24);
    globaly1 = (-globalx1-globaly1)*halfxdimen;
    globalx2 = (globalx2-globaly2)*halfxdimen;

    sethlinesizes(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4,globalbufplc);
    
    globalx2 += globaly2*(x1-1);
    globaly1 += globalx1*(x1-1);
    globalx1 = mulscale16(globalx1,globalzd);
    globalx2 = mulscale16(globalx2,globalzd);
    globaly1 = mulscale16(globaly1,globalzd);
    globaly2 = mulscale16(globaly2,globalzd);
    globvis = klabs(mulscale10(globvis,globalzd));
    if (!(globalorientation&0x180))
    {
        y1 = umost[x1];
        y2 = y1;
        for(x=x1; x<=x2; x++)
        {
            twall = umost[x]-1;
            bwall = Math.min(uplc[x],dmost[x]);
            if (twall < bwall-1)
            {
                if (twall >= y2)
                {
                    while (y1 < y2 - 1)
                        hline(x - 1, ++y1);
                    y1 = twall;
                }
                else
                {
                    while (y1 < twall)
                        hline(x-1,++y1);
                    while (y1 > twall)
                        lastx[y1--] = x;
                }
                while (y2 > bwall)
                    hline(x-1,--y2);
                while (y2 < bwall)
                    lastx[y2++] = x;
            }
            else
            {
                while (y1 < y2-1)
                    hline(x-1,++y1);
                if (x == x2) {
                    globalx2 += globaly2;
                    globaly1 += globalx1;
                    break;
                }
                y1 = umost[x+1];
                y2 = y1;
            }
            globalx2 += globaly2;
            globaly1 += globalx1;
        }
        while (y1 < y2 - 1)
            hline(x2, ++y1);
        faketimerhandler();
        return;
    }

    switch(globalorientation&0x180)
    {
        case 128:
            msethlineshift(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4);
            break;
        case 256:
            settrans(TRANS_NORMAL);
            tsethlineshift(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4);
            break;
        case 384:
            settrans(TRANS_REVERSE);
            tsethlineshift(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4);
            break;
    }

    y1 = umost[x1];
    y2 = y1;
    for(x=x1; x<=x2; x++)
    {
        twall = umost[x]-1;
        bwall = Math.min(uplc[x],dmost[x]);
        if (twall < bwall-1)
        {
            if (twall >= y2)
            {
                while (y1 < y2-1) slowhline(x-1,++y1);
                y1 = twall;
            }
            else
            {
                while (y1 < twall) slowhline(x-1,++y1);
                while (y1 > twall) lastx[y1--] = x;
            }
            while (y2 > bwall) slowhline(x-1,--y2);
            while (y2 < bwall) lastx[y2++] = x;
        }
        else
        {
            while (y1 < y2-1) slowhline(x-1,++y1);
            if (x == x2) {
                globalx2 += globaly2;
                globaly1 += globalx1;
                break;
            }
            y1 = umost[x+1];
            y2 = y1;
        }
        globalx2 += globaly2;
        globaly1 += globalx1;
    }
    while (y1 < y2-1) slowhline(x2,++y1);
    faketimerhandler();
}

/* renders non-parallaxed floors. --ryan. */
//947
function florscan(x1, x2, sectnum) {
    var i, j, ox, oy, x, y1, y2, twall, bwall;
    var sec;

    //Retrieve the sector object
    sec = sector[sectnum];
    
    //Retrieve the floor palette.
    if (palookup[sec.floorpal] != globalpalwritten /*simon note: globalpalwritten is ptr to palookup!!!!!!, this is looking at first thing of it.. */)
        globalpalwritten = palookup[sec.floorpal];

    globalzd = globalposz-sec.floorz;
    
    //We are UNDER the floor: Do NOT render anything.
    if (globalzd > 0)
        return;
    
    //Retrive the floor texture.
    globalpicnum = sec.floorpicnum;
    if (globalpicnum >= MAXTILES)
    globalpicnum = 0;
    
    //Lock the floor texture
    setgotpic(globalpicnum);
    
    
    //This tile has unvalid dimensions ( negative)
    if ((tiles[globalpicnum].dim.width <= 0) ||
        (tiles[globalpicnum].dim.height <= 0))
        return;
    
    //If this is an animated texture: Animate it.
    if (tiles[globalpicnum].animFlags&192)
        globalpicnum += animateoffs(globalpicnum);

    //If the texture is not in RAM: Load it !!
    TILE_MakeAvailable(globalpicnum);
    
    //Check where is the texture in RAM
    globalbufplc = tiles[globalpicnum].data;

    //Retrieve the shade of the sector (illumination level).
    globalshade = sec.floorshade;
    
    globvis = globalcisibility;
    if (sec.visibility != 0)
        globvis = mulscale4(globvis,((sec.visibility+16)));
    
    
    globalorientation = sec.floorstat;


    if ((globalorientation&64) == 0)
    {
        globalx1 = singlobalang;
        globalx2 = singlobalang;
        globaly1 = cosglobalang;
        globaly2 = cosglobalang;
        globalxpanning = (globalposx<<20);
        globalypanning = -(globalposy<<20);
    }
    else
    {
        j = sec.wallptr;
        ox = wall[wall[j].point2].x - wall[j].x;
        oy = wall[wall[j].point2].y - wall[j].y;
        i = nsqrtasm(ox*ox+oy*oy);
        if (i == 0)
            i = 1024;
        else
            i = (1048576/i)|0;
        globalx1 = mulscale10(dmulscale10(ox,singlobalang,-oy,cosglobalang),i);
        globaly1 = mulscale10(dmulscale10(ox,cosglobalang,oy,singlobalang),i);
        globalx2 = -globalx1;
        globaly2 = -globaly1;

        ox = ((wall[j].x-globalposx)<<6);
        oy = ((wall[j].y-globalposy)<<6);
        i = dmulscale14(oy,cosglobalang,-ox,singlobalang);
        j = dmulscale14(ox,cosglobalang,oy,singlobalang);
        ox = i;
        oy = j;
        globalxpanning = globalx1*ox - globaly1*oy;
        globalypanning = globaly2*ox + globalx2*oy;
    }
    
    
    globalx2 = mulscale16(globalx2,viewingrangerecip);
    globaly1 = mulscale16(globaly1,viewingrangerecip);
    globalxshift = (8-(picsiz[globalpicnum]&15));
    globalyshift = (8-(picsiz[globalpicnum]>>4));
    if (globalorientation&8) {
        globalxshift++;
        globalyshift++;
    }

    if ((globalorientation&0x4) > 0)
    {
        i = globalxpanning;
        globalxpanning = globalypanning;
        globalypanning = i;
        i = globalx2;
        globalx2 = -globaly1;
        globaly1 = -i;
        i = globalx1;
        globalx1 = globaly2;
        globaly2 = i;
    }
    
    
    if ((globalorientation&0x10) > 0){
        globalx1 = -globalx1;
        globaly1 = -globaly1;
        globalxpanning = -globalxpanning;
    }
    
    if ((globalorientation&0x20) > 0){
        globalx2 = -globalx2;
        globaly2 = -globaly2;
        globalypanning = -globalypanning;
    }
    
    
    globalx1 <<= globalxshift;
    globaly1 <<= globalxshift;
    globalx2 <<= globalyshift;
    globaly2 <<= globalyshift;
    globalxpanning <<= globalxshift;
    globalypanning <<= globalyshift;
    globalxpanning += ((sec.floorxpanning)<<24);
    globalypanning += ((sec.floorypanning)<<24);
    globaly1 = (-globalx1-globaly1)*halfxdimen;
    globalx2 = (globalx2-globaly2)*halfxdimen;

    //Setup the drawing routine paramters
    sethlinesizes(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4,globalbufplc);

    globalx2 += globaly2*(x1-1);
    globaly1 += globalx1*(x1-1);
    globalx1 = mulscale16(globalx1,globalzd);
    globalx2 = mulscale16(globalx2,globalzd);
    globaly1 = mulscale16(globaly1,globalzd);
    globaly2 = mulscale16(globaly2,globalzd);
    globvis = klabs(mulscale10(globvis,globalzd));

    if (!(globalorientation&0x180))
    {
        y1 = Math.max(dplc[x1],umost[x1]);
        y2 = y1;
        for(x=x1; x<=x2; x++)
        {
            twall = Math.max(dplc[x],umost[x])-1;
            bwall = dmost[x];
            if (twall < bwall-1)
            {
                if (twall >= y2)
                {
                    while (y1 < y2-1)
                        hline(x-1,++y1);
                    y1 = twall;
                }
                else
                {
                    while (y1 < twall)
                        hline(x-1,++y1);
                    while (y1 > twall)
                        lastx[y1--] = x;
                }
                while (y2 > bwall)
                    hline(x-1,--y2);
                while (y2 < bwall)
                    lastx[y2++] = x;
            }
            else
            {
                while (y1 < y2-1) hline(x-1,++y1);
                if (x == x2) {
                    globalx2 += globaly2;
                    globaly1 += globalx1;
                    break;
                }
                y1 = Math.max(dplc[x+1],umost[x+1]);
                y2 = y1;
            }
            globalx2 += globaly2;
            globaly1 += globalx1;
        }
        while (y1 < y2-1)
            hline(x2,++y1);
        
        faketimerhandler();
        return;
    }

    switch(globalorientation&0x180)
    {
        case 128:
            msethlineshift(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4);
            break;
        case 256:
            settrans(TRANS_NORMAL);
            tsethlineshift(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4);
            break;
        case 384:
            settrans(TRANS_REVERSE);
            tsethlineshift(picsiz[globalpicnum]&15,picsiz[globalpicnum]>>4);
            break;
    }

    y1 = Math.max(dplc[x1],umost[x1]);
    y2 = y1;
    for(x=x1; x<=x2; x++)
    {
        twall = Math.max(dplc[x],umost[x])-1;
        bwall = dmost[x];
        if (twall < bwall-1)
        {
            if (twall >= y2)
            {
                while (y1 < y2-1) slowhline(x-1,++y1);
                y1 = twall;
            }
            else
            {
                while (y1 < twall)
                    slowhline(x-1,++y1);
                while (y1 > twall)
                    lastx[y1--] = x;
            }
            while (y2 > bwall)
                slowhline(x-1,--y2);
            while (y2 < bwall)
                lastx[y2++] = x;
        }
        else
        {
            while (y1 < y2-1)
                slowhline(x-1,++y1);
            if (x == x2) {
                globalx2 += globaly2;
                globaly1 += globalx1;
                break;
            }
            y1 = Math.max(dplc[x+1],umost[x+1]);
            y2 = y1;
        }
        globalx2 += globaly2;
        globaly1 += globalx1;
    }
    while (y1 < y2-1)
        slowhline(x2,++y1);
    
    faketimerhandler();
}

/*
 * renders walls and parallaxed skies/floors. Look at parascan() for the
 *  higher level of parallaxing.
 *
 *    x1 == offset of leftmost pixel of wall. 0 is left of surface.
 *    x2 == offset of rightmost pixel of wall. 0 is left of surface.
 *
 *  apparently, walls are always vertical; there are sloping functions
 *   (!!!) er...elsewhere. Only the sides need be vertical, as the top and
 *   bottom of the polygon will need to be angled as the camera perspective
 *   shifts (user spins in a circle, etc.)
 *
 *  uwal is an array of the upper most pixels, and dwal are the lower most.
 *   This must be a list, as the top and bottom of the polygon are not
 *   necessarily horizontal lines.
 *
 *   So, the screen coordinate of the top left of a wall is specified by
 *   uwal[x1], the bottom left by dwal[x1], the top right by uwal[x2], and
 *   the bottom right by dwal[x2]. Every physical point on the edge of the
 *   wall in between is specified by traversing those arrays, one pixel per
 *   element.
 *
 *  --ryan.
 */
//1227
function wallscan( x1,  x2,uwal,  dwal,swal,  lwal) {
    var i, x, xnice, ynice;
    var fpalookup;
    var y1ve = new Int32Array(4), y2ve = new Int32Array(4), u4, d4, z, tileWidth, tsizy;
    var bad;

    tileWidth = tiles[globalpicnum].dim.width;
    tsizy = tiles[globalpicnum].dim.height;
    
    setgotpic(globalpicnum);
    
    if ((tileWidth <= 0) || (tsizy <= 0))
        return;
    
    if ((uwal[x1] > ydimen) && (uwal[x2] > ydimen))
        return;
    
    if ((dwal[x1] < 0) && (dwal[x2] < 0))
        return;

    TILE_MakeAvailable(globalpicnum);

    xnice = (pow2long[picsiz[globalpicnum]&15] == tileWidth);
    if (xnice)
        tileWidth--;
    
    ynice = (pow2long[picsiz[globalpicnum]>>4] == tsizy);
    if (ynice)
        tsizy = (picsiz[globalpicnum]>>4);

    fpalookup = palookup[globalpal];

    setupvlineasm(globalshiftval);

    //Starting on the left column of the wall, check the occlusion arrays.
    x = x1;
    while ((umost[x] > dmost[x]) && (x <= x2))
        x++;

    for (; (x <= x2) && ((x/*+ frameoffset.position*/) & 3); x++) {
        printf("x without frameoffset.position: %i, x2: %i\n", x, x2);
        y1ve[0] = Math.max(uwal[x],umost[x]);
        y2ve[0] = Math.min(dwal[x],dmost[x]);
        if (y2ve[0] <= y1ve[0])
            continue;

        palookupoffse[0] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x], globvis), globalshade) << 8));

        bufplce[0] = lwal[x] + globalxpanning;
        
        if (bufplce[0] >= tileWidth)
        {
            if (!xnice)
                bufplce[0] %= tileWidth;
            else
                bufplce[0] &= tileWidth;
        }

        if (ynice == 0)
            bufplce[0] *= tsizy;
        else
            bufplce[0] <<= tsizy;

        vince[0] = swal[x]*globalyscale;
        vplce[0] = globalzd + vince[0]*(y1ve[0]-globalhoriz+1);

        vlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0] - 1, vplce[0], tiles[globalpicnum].data, bufplce[0], x + ylookup[y1ve[0]], frameoffset.array);
    }
    
    for(; x<=x2-3; x+=4)
    {
        bad = 0;
        for(z=3; z>=0; z--)
        {
            y1ve[z] = Math.max(uwal[x+z],umost[x+z]);
            y2ve[z] = Math.min(dwal[x+z],dmost[x+z])-1;

            if (y2ve[z] < y1ve[z])
            {
                bad += pow2char[z];
                continue;
            }
            //printf("y2ve[z]: %i\n", y2ve[z]);

            i = lwal[x+z] + globalxpanning;
            if (i >= tileWidth) {
                if (xnice == 0) i %= tileWidth;
                else i &= tileWidth;
            }
            if (ynice == 0)
                i *= tsizy;
            else
                i <<= tsizy;
            bufplce[z] = i;//tiles[globalpicnum].data+i;

            vince[z] = swal[x+z]*globalyscale;
            vplce[z] = globalzd + vince[z]*(y1ve[z]-globalhoriz+1);
        }

        if (bad == 15)
            continue;

        //printf("bad: %i\n", bad);
        palookupoffse[0] = new PointerHelper(fpalookup, getpalookup(mulscale16(swal[x], globvis), globalshade) << 8);
        palookupoffse[3] = new PointerHelper(fpalookup, getpalookup(mulscale16(swal[x + 3], globvis), globalshade) << 8);

        if ((palookupoffse[0].array == palookupoffse[3].array && palookupoffse[0].position == palookupoffse[3].position) && ((bad & 0x9) == 0))
        {
            palookupoffse[1] = palookupoffse[0];
            palookupoffse[2] = palookupoffse[0];
        }
        else {
            palookupoffse[1] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x + 1], globvis), globalshade) << 8));
            palookupoffse[2] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x + 2], globvis), globalshade) << 8));
        }

        u4 = Math.max(Math.max(y1ve[0],y1ve[1]),Math.max(y1ve[2],y1ve[3]));
        d4 = Math.min(Math.min(y2ve[0],y2ve[1]),Math.min(y2ve[2],y2ve[3])); 

        //printf("wallscan x: %i, d4: %i, u4: %i\n", x,d4, u4);
        if ((bad != 0) || (u4 >= d4))
        {
            if (!(bad&1))
                prevlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0], vplce[0], tiles[globalpicnum].data, bufplce[0], ylookup[y1ve[0]] + x + 0, frameoffset);
            if (!(bad&2))
                prevlineasm1(vince[1], palookupoffse[1], y2ve[1] - y1ve[1], vplce[1], tiles[globalpicnum].data, bufplce[1], ylookup[y1ve[1]] + x + 1, frameoffset);
            if (!(bad&4))
                prevlineasm1(vince[2], palookupoffse[2], y2ve[2] - y1ve[2], vplce[2], tiles[globalpicnum].data, bufplce[2], ylookup[y1ve[2]] + x + 2, frameoffset);
            if (!(bad&8))
                prevlineasm1(vince[3], palookupoffse[3], y2ve[3] - y1ve[3], vplce[3], tiles[globalpicnum].data, bufplce[3], ylookup[y1ve[3]] + x + 3, frameoffset);
            continue;
        }

        if (u4 > y1ve[0])
            vplce[0] = prevlineasm1(vince[0], palookupoffse[0], u4 - y1ve[0] - 1, vplce[0], tiles[globalpicnum].data,bufplce[0], ylookup[y1ve[0]] + x + 0, frameoffset);
        if (u4 > y1ve[1])
            vplce[1] = prevlineasm1(vince[1], palookupoffse[1], u4 - y1ve[1] - 1, vplce[1], tiles[globalpicnum].data, bufplce[1], ylookup[y1ve[1]] + x + 1, frameoffset);
        if (u4 > y1ve[2])
            vplce[2] = prevlineasm1(vince[2], palookupoffse[2], u4 - y1ve[2] - 1, vplce[2], tiles[globalpicnum].data, bufplce[2], ylookup[y1ve[2]] + x + 2, frameoffset);
        if (u4 > y1ve[3])
            vplce[3] = prevlineasm1(vince[3], palookupoffse[3], u4 - y1ve[3] - 1, vplce[3], tiles[globalpicnum].data, bufplce[3], ylookup[y1ve[3]] + x + 3, frameoffset);

        if (d4 >= u4) {
            vlineasm4_2(d4 - u4 + 1, ylookup[u4] + x /*+ frameoffset*/);
        }

        i = x + frameoffset.position + ylookup[d4 + 1];
        
        if (y2ve[0] > d4)
            prevlineasm1(vince[0], palookupoffse[0], y2ve[0] - d4 - 1, vplce[0], tiles[globalpicnum].data, bufplce[0], i + 0, frameoffset);
        if (y2ve[1] > d4)
            prevlineasm1(vince[1], palookupoffse[1], y2ve[1] - d4 - 1, vplce[1], tiles[globalpicnum].data, bufplce[1], i + 1, frameoffset);
        if (y2ve[2] > d4)
            prevlineasm1(vince[2], palookupoffse[2], y2ve[2] - d4 - 1, vplce[2], tiles[globalpicnum].data, bufplce[2], i + 2, frameoffset);
        if (y2ve[3] > d4)
            prevlineasm1(vince[3], palookupoffse[3], y2ve[3] - d4 - 1, vplce[3], tiles[globalpicnum].data, bufplce[3], i + 3, frameoffset);
    }
    for(; x<=x2; x++)
    {
        y1ve[0] = Math.max(uwal[x],umost[x]);
        y2ve[0] = Math.min(dwal[x],dmost[x]);
        if (y2ve[0] <= y1ve[0])
            continue;


        palookupoffse[0] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x], globvis), globalshade) << 8));

        bufplce[0] = lwal[x] + globalxpanning;
        if (bufplce[0] >= tileWidth) {
            if (xnice == 0)
                bufplce[0] %= tileWidth;
            else
                bufplce[0] &= tileWidth;
        }
        
        if (ynice == 0)
            bufplce[0] *= tsizy;
        else
            bufplce[0] <<= tsizy;

        vince[0] = swal[x]*globalyscale;
        vplce[0] = globalzd + vince[0]*(y1ve[0]-globalhoriz+1);

        vlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0] - 1, vplce[0], tiles[globalpicnum].data, bufplce[0], x + ylookup[y1ve[0]], frameoffset.array);
    }
    faketimerhandler();
}


/* this renders masking sprites. See wallscan(). --ryan. */
function maskwallscan(x1, x2,
                         uwal, dwal,
                         swal, lwal)
{
    var i, x, startx, xnice, ynice;
    var fpalookup;
    var y1ve = new Int32Array(4), y2ve = new Int32Array(4), u4, d4, dax, z, tileWidth, tileHeight;
    var  p;
    var  bad;
    printf("maskwallscan %i, %i\n", x1, x2);
    tileWidth = tiles[globalpicnum].dim.width;
    tileHeight = tiles[globalpicnum].dim.height;
    setgotpic(globalpicnum);
    
    if ((tileWidth <= 0) || (tileHeight <= 0))
        return;
    if ((uwal[x1] > ydimen) && (uwal[x2] > ydimen))
        return;
    if ((dwal[x1] < 0) && (dwal[x2] < 0))
        return;

    TILE_MakeAvailable(globalpicnum);

    startx = x1;
    
    xnice = (pow2long[picsiz[globalpicnum]&15] == tileWidth);
    if (xnice)
        tileWidth = (tileWidth-1);
    
    ynice = (pow2long[picsiz[globalpicnum]>>4] == tileHeight);
    if (ynice)
        tileHeight = (picsiz[globalpicnum]>>4);

    fpalookup = palookup[globalpal];

    setupmvlineasm(globalshiftval);

    x = startx;
    while ((startumost[x+windowx1] > startdmost[x+windowx1]) && (x <= x2)) x++;

    p = new PointerHelper(frameoffset.array, x);

    //printf("(x<=x2): %i\n", (x <= x2) ? 1 : 0);
    for (; (x <= x2) && (p.position &3); x++, p.position++)
    {
        //printf("mvlineasm1 x==%i && x2 == %i, *p: %u\n",x,x2, p.getByte());
        y1ve[0] = Math.max(uwal[x], startumost[x + windowx1] - windowy1);
        y2ve[0] = Math.min(dwal[x],startdmost[x+windowx1]-windowy1);
        if (y2ve[0] <= y1ve[0]) continue;

        palookupoffse[0] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x],globvis),globalshade)<<8));

        bufplce[0] = lwal[x] + globalxpanning;
        if (bufplce[0] >= tileWidth) {
            if (xnice == 0) bufplce[0] %= tileWidth;
            else bufplce[0] &= tileWidth;
        }
        if (ynice == 0)
            bufplce[0] *= tileHeight;
        else
            bufplce[0] <<= tileHeight;

        vince[0] = swal[x]*globalyscale;
        vplce[0] = globalzd + vince[0]*(y1ve[0]-globalhoriz+1);

        mvlineasm1(vince[0],palookupoffse[0],y2ve[0]-y1ve[0]-1,vplce[0],new PointerHelper(tiles[globalpicnum].data),bufplce[0],ylookup[y1ve[0]],p);
    }
    for(; x<=x2-3; x+=4,p.position+=4) {
        //printf("mvlineasm1 x==%i \n", x);
        bad = 0;
        for(z=3,dax=x+3; z>=0; z--,dax--)
        {
            y1ve[z] = Math.max(uwal[dax],startumost[dax+windowx1]-windowy1);
            y2ve[z] = Math.min(dwal[dax],startdmost[dax+windowx1]-windowy1)-1;
            if (y2ve[z] < y1ve[z]) {
                bad += pow2char[z];
                continue;
            }

            i = lwal[dax] + globalxpanning;
            if (i >= tileWidth) {
                if (xnice == 0) i %= tileWidth;
                else i &= tileWidth;
            }
            
            if (ynice == 0)
                i *= tileHeight;
            else
                i <<= tileHeight;
            
            //printf(" i == %i\n", i);
            bufplce[z] = /*tiles[globalpicnum].data +*/ i;

            vince[z] = swal[dax]*globalyscale;
            vplce[z] = globalzd + vince[z]*(y1ve[z]-globalhoriz+1);
        }
        if (bad == 15) continue;

        palookupoffse[0] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x],globvis),globalshade)<<8));
        palookupoffse[3] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x+3],globvis),globalshade)<<8));

        if ((palookupoffse[0].array == palookupoffse[3].array && palookupoffse[0].position == palookupoffse[3].position) && ((bad & 0x9) == 0))
        {
            palookupoffse[1] = palookupoffse[0];
            palookupoffse[2] = palookupoffse[0];
        }
        else
        {
            palookupoffse[1] = new PointerHelper(fpalookup,(getpalookup(mulscale16(swal[x+1],globvis),globalshade)<<8));
            palookupoffse[2] = new PointerHelper(fpalookup,(getpalookup(mulscale16(swal[x+2],globvis),globalshade)<<8));
        }

        u4 = Math.max(Math.max(y1ve[0],y1ve[1]),Math.max(y1ve[2],y1ve[3]));
        d4 = Math.min(Math.min(y2ve[0],y2ve[1]),Math.min(y2ve[2],y2ve[3]));


        //printf("bad: %i x: %i: d4: %i, u4: %i\n", bad,x,d4, u4);
        if ((bad > 0) || (u4 >= d4))
        {
            if (!(bad&1)) mvlineasm1(vince[0],palookupoffse[0],y2ve[0]-y1ve[0],vplce[0],new PointerHelper(tiles[globalpicnum].data),bufplce[0],ylookup[y1ve[0]]+0,p);
            if (!(bad&2)) mvlineasm1(vince[1],palookupoffse[1],y2ve[1]-y1ve[1],vplce[1],new PointerHelper(tiles[globalpicnum].data),bufplce[1],ylookup[y1ve[1]]+1,p);
            if (!(bad&4)) mvlineasm1(vince[2],palookupoffse[2],y2ve[2]-y1ve[2],vplce[2],new PointerHelper(tiles[globalpicnum].data),bufplce[2],ylookup[y1ve[2]]+2,p);
            if (!(bad&8)) mvlineasm1(vince[3],palookupoffse[3],y2ve[3]-y1ve[3],vplce[3],new PointerHelper(tiles[globalpicnum].data),bufplce[3],ylookup[y1ve[3]]+3,p);
            continue;
        }

        if (u4 > y1ve[0]) vplce[0] = mvlineasm1(vince[0],palookupoffse[0],u4-y1ve[0]-1,vplce[0],new PointerHelper(tiles[globalpicnum].data),bufplce[0],ylookup[y1ve[0]]+0,p);
        if (u4 > y1ve[1]) vplce[1] = mvlineasm1(vince[1],palookupoffse[1],u4-y1ve[1]-1,vplce[1],new PointerHelper(tiles[globalpicnum].data),bufplce[1],ylookup[y1ve[1]]+1,p);
        if (u4 > y1ve[2]) vplce[2] = mvlineasm1(vince[2],palookupoffse[2],u4-y1ve[2]-1,vplce[2],new PointerHelper(tiles[globalpicnum].data),bufplce[2],ylookup[y1ve[2]]+2,p);
        if (u4 > y1ve[3]) vplce[3] = mvlineasm1(vince[3],palookupoffse[3],u4-y1ve[3]-1,vplce[3],new PointerHelper(tiles[globalpicnum].data),bufplce[3],ylookup[y1ve[3]]+3,p);

        if (d4 >= u4) 
            mvlineasm4(d4 - u4 + 1, tiles[globalpicnum].data, ylookup[u4] + p.position, p);

        i = p+ylookup[d4+1];
        if (y2ve[0] > d4) mvlineasm1(vince[0],palookupoffse[0],y2ve[0]-d4-1,vplce[0],new PointerHelper(tiles[globalpicnum].data),bufplce[0],i+0,p);
        if (y2ve[1] > d4) mvlineasm1(vince[1],palookupoffse[1],y2ve[1]-d4-1,vplce[1],new PointerHelper(tiles[globalpicnum].data),bufplce[1],i+1,p);
        if (y2ve[2] > d4) mvlineasm1(vince[2],palookupoffse[2],y2ve[2]-d4-1,vplce[2],new PointerHelper(tiles[globalpicnum].data),bufplce[2],i+2,p);
        if (y2ve[3] > d4) mvlineasm1(vince[3],palookupoffse[3],y2ve[3]-d4-1,vplce[3],new PointerHelper(tiles[globalpicnum].data),bufplce[3],i+3,p);
    }
    for(; x<=x2; x++,p.position++)
    {
        y1ve[0] = Math.max(uwal[x],startumost[x+windowx1]-windowy1);
        y2ve[0] = Math.min(dwal[x],startdmost[x+windowx1]-windowy1);
        if (y2ve[0] <= y1ve[0]) continue;

        palookupoffse[0] = new PointerHelper(fpalookup, (getpalookup(mulscale16(swal[x], globvis), globalshade) << 8));

        bufplce[0] = lwal[x] + globalxpanning;
        if (bufplce[0] >= tileWidth) {
            if (xnice == 0) bufplce[0] %= tileWidth;
            else bufplce[0] &= tileWidth;
        }
        if (ynice == 0)
            bufplce[0] *= tileHeight;
        else
            bufplce[0] <<= tileHeight;

        vince[0] = swal[x]*globalyscale;
        vplce[0] = globalzd + vince[0]*(y1ve[0]-globalhoriz+1);

        mvlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0] - 1, vplce[0], new PointerHelper(tiles[globalpicnum].data),bufplce[0], p.position + ylookup[y1ve[0]], p);
    }
    faketimerhandler();
}

//1580
/* renders parallaxed skies/floors  --ryan. */
function parascan(dax1, dax2, sectnum,  dastat, bunch) {
    var sec;
    var j, k, l, m, n, x, z, wallnum, nextsectnum, globalhorizbak;
    var topptr, botptr;

    sectnum = pvWalls[bunchfirst[bunch]].sectorId;
    sec = sector[sectnum];

    printf("parascan\n");
    globalhorizbak = globalhoriz;
    if (parallaxyscale != 65536)
        globalhoriz = mulscale16(globalhoriz-(ydimen>>1),parallaxyscale) + (ydimen>>1);
    globvis = globalpisibility;
    /* globalorientation = 0L; */
    if (sec.visibility != 0) globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));

    if (dastat == 0)
    {
        globalpal = sec.ceilingpal;
        globalpicnum = sec.ceilingpicnum;
        globalshade = sec.ceilingshade;
        globalxpanning = sec.ceilingxpanning;
        globalypanning = sec.ceilingypanning;
        topptr = umost;
        botptr = uplc;
    }
    else
    {
        globalpal = sec.floorpal;
        globalpicnum = sec.floorpicnum;
        globalshade = sec.floorshade;
        globalxpanning = sec.floorxpanning;
        globalypanning = sec.floorypanning;
        topptr = dplc;
        botptr = dmost;
    }

    if (globalpicnum >= MAXTILES) globalpicnum = 0;
    
    if (tiles[globalpicnum].animFlags&192) 
        globalpicnum += animateoffs(globalpicnum);
    
    globalshiftval = (picsiz[globalpicnum]>>4);
    
    if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height)
        globalshiftval++;
    globalshiftval = 32-globalshiftval;
    globalzd = (((tiles[globalpicnum].dim.height>>1)+parallaxyoffs)<<globalshiftval)+(globalypanning<<24);
    globalyscale = (8<<(globalshiftval-19));
    /*if (globalorientation&256) globalyscale = -globalyscale, globalzd = -globalzd;*/

    k = 11 - (picsiz[globalpicnum]&15) - pskybits;
    x = -1;

    for(z=bunchfirst[bunch]; z>=0; z=bunchWallsList[z])
    {
        wallnum = pvWalls[z].worldWallId;
        nextsectnum = wall[wallnum].nextsector;

        if (dastat == 0) j = sector[nextsectnum].ceilingstat;
        else j = sector[nextsectnum].floorstat;

        if ((nextsectnum < 0) || (wall[wallnum].cstat&32) || ((j&1) == 0))
        {
            if (x == -1) x = pvWalls[z].screenSpaceCoo[0][VEC_COL];

            if (parallaxtype == 0)
            {
                n = mulscale16(xdimenrecip,viewingrange);
                for(j=pvWalls[z].screenSpaceCoo[0][VEC_COL]; j<=pvWalls[z].screenSpaceCoo[1][VEC_COL]; j++)
                    lplc[j] = (((mulscale23(j-halfxdimen,n)+globalang)&2047)>>k);
            }
            else
            {
                for(j=pvWalls[z].screenSpaceCoo[0][VEC_COL]; j<=pvWalls[z].screenSpaceCoo[1][VEC_COL]; j++)
                    lplc[j] = (((radarang2[j]+globalang)&2047)>>k);
            }
            if (parallaxtype == 2)
            {
                n = mulscale16(xdimscale,viewingrange);
                for(j=pvWalls[z].screenSpaceCoo[0][VEC_COL]; j<=pvWalls[z].screenSpaceCoo[1][VEC_COL]; j++)
                    swplc[j] = mulscale14(sintable[(radarang2[j]+512)&2047],n);
            }
            else
                clearbuf(swplc[pvWalls[z].screenSpaceCoo[0][VEC_COL]],0,pvWalls[z].screenSpaceCoo[1][VEC_COL]-pvWalls[z].screenSpaceCoo[0][VEC_COL]+1,mulscale16(xdimscale,viewingrange));
        }
        else if (x >= 0)
        {
            l = globalpicnum;
            m = (picsiz[globalpicnum]&15);
            globalpicnum = l+pskyoff[lplc[x]>>m];

            if (((lplc[x]^lplc[pvWalls[z].screenSpaceCoo[0][VEC_COL]-1])>>m) == 0)
                wallscan(x,pvWalls[z].screenSpaceCoo[0][VEC_COL]-1,topptr,botptr,swplc,lplc);
            else
            {
                j = x;
                while (x < pvWalls[z].screenSpaceCoo[0][VEC_COL])
                {
                    n = l+pskyoff[lplc[x]>>m];
                    if (n != globalpicnum)
                    {
                        wallscan(j,x-1,topptr,botptr,swplc,lplc);
                        j = x;
                        globalpicnum = n;
                    }
                    x++;
                }
                if (j < x)
                    wallscan(j,x-1,topptr,botptr,swplc,lplc);
            }

            globalpicnum = l;
            x = -1;
        }
    }

    if (x >= 0)
    {
        l = globalpicnum;
        m = (picsiz[globalpicnum]&15);
        globalpicnum = l+pskyoff[lplc[x]>>m];

        if (((lplc[x]^lplc[pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL]])>>m) == 0)
            wallscan(x,pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],topptr,botptr,swplc,lplc);
        else
        {
            j = x;
            while (x <= pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL])
            {
                n = l+pskyoff[lplc[x]>>m];
                if (n != globalpicnum)
                {
                    wallscan(j,x-1,topptr,botptr,swplc,lplc);
                    j = x;
                    globalpicnum = n;
                }
                x++;
            }
            if (j <= x)
                wallscan(j,x,topptr,botptr,swplc,lplc);
        }
        globalpicnum = l;
    }
    globalhoriz = globalhorizbak;
}

//1729
var BITSOFPRECISION = 3; /* Don't forget to change this in A.ASM also! */
function grouscan(dax1, dax2, sectnum, dastat) {
    console.log("grouscan dax1: %i, dax2: %i, sectnum: %i, dastat: %i, ", dax1, dax2, sectnum, dastat);
    var i, j, j_, l, x, y, dx, dy, wx, wy, y1, y2, daz;
    var daslope, dasqr;
    var shoffs, shinc, m1, m2, mptr1, mptr2, nptr1, nptr2;
    var wal;
    var sec;

    sec = sector[sectnum];

    if (dastat == 0)
    {
        if (globalposz <= getceilzofslope(sectnum,globalposx,globalposy))
            return;  /* Back-face culling */
        globalorientation = sec.ceilingstat;
        globalpicnum = sec.ceilingpicnum;
        globalshade = sec.ceilingshade;
        globalpal = sec.ceilingpal;
        daslope = sec.ceilingheinum;
        daz = sec.ceilingz;
    }
    else
    {
        if (globalposz >= getflorzofslope(sectnum,globalposx,globalposy))
            return;  /* Back-face culling */
        globalorientation = sec.floorstat;
        globalpicnum = sec.floorpicnum;
        globalshade = sec.floorshade;
        globalpal = sec.floorpal;
        daslope = sec.floorheinum;
        daz = sec.floorz;
    }

    if ((tiles[globalpicnum].animFlags&192) != 0)
        globalpicnum += animateoffs(globalpicnum);
    
    setgotpic(globalpicnum);
    
    if ((tiles[globalpicnum].dim.width <= 0) ||
        (tiles[globalpicnum].dim.height <= 0))
        return;
    
    TILE_MakeAvailable(globalpicnum);

    wal = wall[sec.wallptr];
    wx = wall[wal.point2].x - wal.x;
    wy = wall[wal.point2].y - wal.y;
    dasqr = krecipasm(nsqrtasm(wx*wx+wy*wy));
    i = mulscale21(daslope,dasqr);
    wx *= i;
    wy *= i;

    globalx = -mulscale19(singlobalang,xdimenrecip);
    globaly = mulscale19(cosglobalang,xdimenrecip);
    globalx1 = (globalposx<<8);
    globaly1 = -(globalposy<<8);
    i = (dax1-halfxdimen)*xdimenrecip;
    globalx2 = mulscale16(cosglobalang<<4,viewingrangerecip) - mulscale27(singlobalang,i);
    globaly2 = mulscale16(singlobalang<<4,viewingrangerecip) + mulscale27(cosglobalang,i);
    globalzd = (xdimscale<<9);
    globalzx = -dmulscale17(wx,globaly2,-wy,globalx2) + mulscale10(1-globalhoriz,globalzd);
    globalz = -dmulscale25(wx,globaly,-wy,globalx);

    if (globalorientation&64)  /* Relative alignment */
    {
        dx = mulscale14(wall[wal.point2].x-wal.x,dasqr);
        dy = mulscale14(wall[wal.point2].y-wal.y,dasqr);

        i = nsqrtasm(daslope*daslope+16777216);

        x = globalx;
        y = globaly;
        globalx = dmulscale16(x,dx,y,dy);
        globaly = mulscale12(dmulscale16(-y,dx,x,dy),i);

        x = ((wal.x-globalposx)<<8);
        y = ((wal.y-globalposy)<<8);
        globalx1 = dmulscale16(-x,dx,-y,dy);
        globaly1 = mulscale12(dmulscale16(-y,dx,x,dy),i);

        x = globalx2;
        y = globaly2;
        globalx2 = dmulscale16(x,dx,y,dy);
        globaly2 = mulscale12(dmulscale16(-y,dx,x,dy),i);
    }
    if (globalorientation&0x4)
    {
        i = globalx;
        globalx = -globaly;
        globaly = -i;
        i = globalx1;
        globalx1 = globaly1;
        globaly1 = i;
        i = globalx2;
        globalx2 = -globaly2;
        globaly2 = -i;
    }
    if (globalorientation&0x10) {
        globalx1 = -globalx1, globalx2 = -globalx2, globalx = -globalx;
    }
    if (globalorientation&0x20) {
        globaly1 = -globaly1, globaly2 = -globaly2, globaly = -globaly;
    }

    daz = dmulscale9(wx,globalposy-wal.y,-wy,globalposx-wal.x) + ((daz-globalposz)<<8);
    globalx2 = mulscale20(globalx2,daz);
    globalx = mulscale28(globalx,daz);
    globaly2 = mulscale20(globaly2,-daz);
    globaly = mulscale28(globaly,-daz);

    i = 8 - (picsiz[globalpicnum] & 15);
    j = 8-(picsiz[globalpicnum]>>4);
    if (globalorientation&8) {
        i++;
        j++;
    }
    globalx1 <<= (i+12);
    globalx2 <<= i;
    globalx <<= i;
    globaly1 <<= (j+12);
    globaly2 <<= j;
    globaly <<= j;

    if (dastat == 0)
    {
        globalx1 += ((sec.ceilingxpanning)<<24);
        globaly1 += ((sec.ceilingypanning)<<24);
    }
    else
    {
        globalx1 += ((sec.floorxpanning)<<24);
        globaly1 += ((sec.floorypanning)<<24);
    }

    asm1 = -(globalzd>>(16-BITSOFPRECISION));

    globvis = globalvisibility;
    if (sec.visibility != 0) globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));
    globvis = mulscale13(globvis,daz);
    globvis = mulscale16(globvis,xdimscale);
    j_ = palookup[globalpal];

    setupslopevlin(((picsiz[globalpicnum]&15))+(((picsiz[globalpicnum]>>4))<<8),tiles[globalpicnum].data,-ylookup[1]);

    l = (globalzd>>16);

    shinc = mulscale16(globalz,xdimenscale);
    if (shinc > 0)
        shoffs = (4<<15);
    else
        shoffs = ((16380-ydimen)<<15);	// JBF: was 2044     16380
    if (dastat == 0) y1 = umost[dax1];
    else y1 = Math.max(umost[dax1],dplc[dax1]);
    m1 = mulscale16(y1,globalzd) + (globalzx>>6);
    /* Avoid visibility overflow by crossing horizon */
    if (globalzd > 0) m1 += (globalzd>>16);
    else m1 -= (globalzd>>16);
    m2 = m1+l;
    mptr1 = new PointerHelper(slopalookup, (y1 + (shoffs >> 15))*4); //(int32_t *)&slopalookup[y1+(shoffs>>15)];
    mptr2 = new PointerHelper(slopalookup, (mptr1.position + (1 * 4)));
    
    for(x=dax1; x<=dax2; x++)
    {
        //printf("x: %i, globalx2: %i, globaly2: %i, globalzx: %i, shoffs: %i\n", x, globalx2, globaly2, globalzx, shoffs);
        if (dastat == 0) {
            y1 = umost[x];
            y2 = Math.min(dmost[x],uplc[x])-1;
        }
        else {
            y1 = Math.max(umost[x],dplc[x]);
            y2 = dmost[x]-1;
        }
        //console.log("sectnum: %i, x: %i, y1: %i, y2: %i", sectnum, x, y1, y2); //sectnum== 55 && x== 24 && y1== 0 && y2== -1     - breakpoint shows bug when compard with original
        //if (sectnum == 55 && x == 28 && y1 == 0 && y2 == 1)
        //    debugger;
        if (y1 <= y2) {
            nptr1 = new PointerHelper(slopalookup,(y1 + (shoffs >> 15))*4); //(int32_t *)&slopalookup[y1+(shoffs>>15)];
            nptr2 = new PointerHelper(slopalookup,(y2 + (shoffs >> 15))*4);//(int32_t *)&slopalookup[y2+(shoffs>>15)];
            //printf("nptr1.position: %i, mptr1.position: %i \n", nptr1.position, mptr1.position);
            //printf("nptr2.position: %i, mptr2.position: %i \n", nptr2.position, mptr2.position);
            while (nptr1.position <= mptr1.position)
            {
                //*mptr1-- = j + (getpalookup((int32_t)mulscale24(krecipasm(m1),globvis),globalshade)<<8);
                //printf("while1: mptr1.position: %i, %i\n", mptr1.position,(getpalookup(mulscale24(krecipasm(m1), globvis), globalshade) << 8));
                //todo: mptr1 and mptr2 values are wrong
                mptr1.setInt32(((getpalookup(mulscale24(krecipasm(m1), globvis), globalshade) << 8)));
                mptr1.position-=4;
                m1 -= l;
            }
            while (nptr2.position >= mptr2.position)
            {
                //*mptr2++ = j + (getpalookup((int32_t)mulscale24(krecipasm(m2),globvis),globalshade)<<8);
                //printf("while2: mptr2.position: %i, %i\n", mptr2.position,(getpalookup(mulscale24(krecipasm(m2), globvis), globalshade) << 8));
                //todo: mptr1 and mptr2 values are wrong
                mptr2.setInt32((getpalookup(mulscale24(krecipasm(m2), globvis), globalshade) << 8) );
                mptr2.position+=4; 
                m2 += l;
            }

            globalx3 = (globalx2>>10);
            globaly3 = (globaly2>>10);
            asm3 = mulscale16(y2,globalzd) + (globalzx>>6);
            slopevlin(ylookup[y2] + x, krecipasm(asm3 >> 3) >>> 0, new PointerHelper(nptr2.array, nptr2.position), y2 - y1 + 1, globalx1, globaly1);
      
            if ((x&15) == 0) faketimerhandler();
        }
        globalx2 += globalx;
        globaly2 += globaly;
        globalzx += globalz;
        shoffs += shinc;
    }
}

//1926
function owallmost(mostbuf, w, z) {
    var bad, inty, xcross, y, yinc;
    var s1, s2, s3, s4, ix1, ix2, iy1, iy2, t;

    z <<= 7;
    s1 = mulscale20(globaluclip, pvWalls[w].screenSpaceCoo[0][VEC_DIST]);
    s2 = mulscale20(globaluclip, pvWalls[w].screenSpaceCoo[1][VEC_DIST]);
    s3 = mulscale20(globaldclip, pvWalls[w].screenSpaceCoo[0][VEC_DIST]);
    s4 = mulscale20(globaldclip, pvWalls[w].screenSpaceCoo[1][VEC_DIST]);
    bad = (z < s1) + ((z < s2) << 1) + ((z > s3) << 2) + ((z > s4) << 3);

    ix1 = pvWalls[w].screenSpaceCoo[0][VEC_COL];
    iy1 = pvWalls[w].screenSpaceCoo[0][VEC_DIST];
    ix2 = pvWalls[w].screenSpaceCoo[1][VEC_COL];
    iy2 = pvWalls[w].screenSpaceCoo[1][VEC_DIST];

    if ((bad & 3) === 3) {
        clearbufbyte(mostbuf, ix1, (ix2 - ix1 + 1) * 2, 0);
        return (bad);
    }

    if ((bad & 12) === 12) {
        clearbufbyte(mostbuf, ix1, (ix2 - ix1 + 1) * 2, ydimen + (ydimen << 16));
        return (bad);
    }

    if (bad & 3) {
        t = divscale30(z - s1, s2 - s1);
        inty = pvWalls[w].screenSpaceCoo[0][VEC_DIST] + mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST] - pvWalls[w].screenSpaceCoo[0][VEC_DIST], t);
        xcross = pvWalls[w].screenSpaceCoo[0][VEC_COL] + scale(mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST], t), pvWalls[w].screenSpaceCoo[1][VEC_COL] - pvWalls[w].screenSpaceCoo[0][VEC_COL], inty);

        if ((bad & 3) === 2) {
            if (pvWalls[w].screenSpaceCoo[0][VEC_COL] <= xcross) {
                iy2 = inty;
                ix2 = xcross;
            }
            clearbufbyte(mostbuf, xcross + 1, (pvWalls[w].screenSpaceCoo[1][VEC_COL] - xcross) * 2, 0);
        }
        else {
            if (xcross <= pvWalls[w].screenSpaceCoo[1][VEC_COL]) {
                iy1 = inty;
                ix1 = xcross;
            }
            clearbufbyte(mostbuf, pvWalls[w].screenSpaceCoo[0][VEC_COL], (xcross - pvWalls[w].screenSpaceCoo[0][VEC_COL] + 1) * 2, 0);
        }
    }

    if (bad & 12) {
        t = divscale30(z - s3, s4 - s3);
        inty = pvWalls[w].screenSpaceCoo[0][VEC_DIST] + mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST] - pvWalls[w].screenSpaceCoo[0][VEC_DIST], t);
        xcross = pvWalls[w].screenSpaceCoo[0][VEC_COL] + scale(mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST], t), pvWalls[w].screenSpaceCoo[1][VEC_COL] - pvWalls[w].screenSpaceCoo[0][VEC_COL], inty);

        if ((bad & 12) == 8) {
            if (pvWalls[w].screenSpaceCoo[0][VEC_COL] <= xcross) {
                iy2 = inty;
                ix2 = xcross;
            }
            clearbufbyte(mostbuf, xcross + 1, (pvWalls[w].screenSpaceCoo[1][VEC_COL] - xcross) * 2, ydimen + (ydimen << 16));
        }
        else {
            if (xcross <= pvWalls[w].screenSpaceCoo[1][VEC_COL]) {
                iy1 = inty;
                ix1 = xcross;
            }
            clearbufbyte(mostbuf, pvWalls[w].screenSpaceCoo[0][VEC_COL], (xcross - pvWalls[w].screenSpaceCoo[0][VEC_COL] + 1) * 2, ydimen + (ydimen << 16));
        }
    }

    y = (scale(z, xdimenscale, iy1) << 4);
    yinc = (((scale(z, xdimenscale, iy2) << 4) - y) / (ix2 - ix1 + 1)) | 0;
    qinterpolatedown16short(mostbuf, ix1, ix2 - ix1 + 1, y + (globalhoriz << 16), yinc);

    if (mostbuf[ix1] < 0) mostbuf[ix1] = 0;
    if (mostbuf[ix1] > ydimen) mostbuf[ix1] = ydimen;
    if (mostbuf[ix2] < 0) mostbuf[ix2] = 0;
    if (mostbuf[ix2] > ydimen) mostbuf[ix2] = ydimen;

    return (bad);
}

//2016
function wallmost(mostbuf, w, sectnum, dastat) {
    var bad, i, j, t, y, z, inty, intz, xcross, yinc, fw;
    var x1, y1, z1, x2, y2, z2, xv, yv, dx, dy, dasqr, oz1, oz2;
    var s1, s2, s3, s4, ix1, ix2, iy1, iy2;

    if (dastat == 0) {
        z = sector[sectnum].ceilingz - globalposz;
        if ((sector[sectnum].ceilingstat & 2) == 0)
            return (owallmost(mostbuf, w, z));
    }
    else {
        z = sector[sectnum].floorz - globalposz;
        if ((sector[sectnum].floorstat & 2) == 0)
            return (owallmost(mostbuf, w, z));
    }

    i = pvWalls[w].worldWallId;
    if (i == sector[sectnum].wallptr)
        return (owallmost(mostbuf, w, z));

    x1 = wall[i].x;
    x2 = wall[wall[i].point2].x - x1;
    y1 = wall[i].y;
    y2 = wall[wall[i].point2].y - y1;

    fw = sector[sectnum].wallptr;
    i = wall[fw].point2;
    dx = wall[i].x - wall[fw].x;
    dy = wall[i].y - wall[fw].y;
    dasqr = krecipasm(nsqrtasm(dx * dx + dy * dy));

    if (pvWalls[w].screenSpaceCoo[0][VEC_COL] == 0) {
        xv = cosglobalang + sinviewingrangeglobalang;
        yv = singlobalang - cosviewingrangeglobalang;
    }
    else {
        xv = x1 - globalposx;
        yv = y1 - globalposy;
    }
    i = xv * (y1 - globalposy) - yv * (x1 - globalposx);
    j = yv * x2 - xv * y2;

    if (klabs(j) > klabs(i >> 3))
        i = divscale28(i, j);

    if (dastat == 0) {
        t = mulscale15(sector[sectnum].ceilingheinum, dasqr);
        z1 = sector[sectnum].ceilingz;
    }
    else {
        t = mulscale15(sector[sectnum].floorheinum, dasqr);
        z1 = sector[sectnum].floorz;
    }

    z1 = dmulscale24(dx * t, mulscale20(y2, i) + ((y1 - wall[fw].y) << 8), -dy * t, mulscale20(x2, i) + ((x1 - wall[fw].x) << 8)) + ((z1 - globalposz) << 7);


    if (pvWalls[w].screenSpaceCoo[1][VEC_COL] == xdimen - 1) {
        xv = cosglobalang - sinviewingrangeglobalang;
        yv = singlobalang + cosviewingrangeglobalang;
    }
    else {
        xv = (x2 + x1) - globalposx;
        yv = (y2 + y1) - globalposy;
    }

    i = xv * (y1 - globalposy) - yv * (x1 - globalposx);
    j = yv * x2 - xv * y2;

    if (klabs(j) > klabs(i >> 3))
        i = divscale28(i, j);

    if (dastat == 0) {
        t = mulscale15(sector[sectnum].ceilingheinum, dasqr);
        z2 = sector[sectnum].ceilingz;
    }
    else {
        t = mulscale15(sector[sectnum].floorheinum, dasqr);
        z2 = sector[sectnum].floorz;
    }

    z2 = dmulscale24(dx * t, mulscale20(y2, i) + ((y1 - wall[fw].y) << 8), -dy * t, mulscale20(x2, i) + ((x1 - wall[fw].x) << 8)) + ((z2 - globalposz) << 7);


    s1 = mulscale20(globaluclip, pvWalls[w].screenSpaceCoo[0][VEC_DIST]);
    s2 = mulscale20(globaluclip, pvWalls[w].screenSpaceCoo[1][VEC_DIST]);
    s3 = mulscale20(globaldclip, pvWalls[w].screenSpaceCoo[0][VEC_DIST]);
    s4 = mulscale20(globaldclip, pvWalls[w].screenSpaceCoo[1][VEC_DIST]);
    bad = (z1 < s1) + ((z2 < s2) << 1) + ((z1 > s3) << 2) + ((z2 > s4) << 3);

    ix1 = pvWalls[w].screenSpaceCoo[0][VEC_COL];
    ix2 = pvWalls[w].screenSpaceCoo[1][VEC_COL];
    iy1 = pvWalls[w].screenSpaceCoo[0][VEC_DIST];
    iy2 = pvWalls[w].screenSpaceCoo[1][VEC_DIST];
    oz1 = z1;
    oz2 = z2;

    if ((bad & 3) == 3) {
        clearbufbyte(mostbuf, ix1, (ix2 - ix1 + 1) * 2, 0);
        return (bad);
    }

    if ((bad & 12) == 12) {
        clearbufbyte(mostbuf, ix1, (ix2 - ix1 + 1) * 2, ydimen + (ydimen << 16));
        return (bad);
    }

    if (bad & 3) {
        /* inty = intz / (globaluclip>>16) */
        t = divscale30(oz1 - s1, s2 - s1 + oz1 - oz2);
        inty = pvWalls[w].screenSpaceCoo[0][VEC_DIST] + mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST] - pvWalls[w].screenSpaceCoo[0][VEC_DIST], t);
        intz = oz1 + mulscale30(oz2 - oz1, t);
        xcross = pvWalls[w].screenSpaceCoo[0][VEC_COL] + scale(mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST], t), pvWalls[w].screenSpaceCoo[1][VEC_COL] - pvWalls[w].screenSpaceCoo[0][VEC_COL], inty);

        if ((bad & 3) == 2) {
            if (pvWalls[w].screenSpaceCoo[0][VEC_COL] <= xcross) {
                z2 = intz;
                iy2 = inty;
                ix2 = xcross;
            }
            clearbufbyte(mostbuf, xcross + 1, (pvWalls[w].screenSpaceCoo[1][VEC_COL] - xcross) * 2, 0);
        }
        else {
            if (xcross <= pvWalls[w].screenSpaceCoo[1][VEC_COL]) {
                z1 = intz;
                iy1 = inty;
                ix1 = xcross;
            }
            clearbufbyte(mostbuf, pvWalls[w].screenSpaceCoo[0][VEC_COL], (xcross - pvWalls[w].screenSpaceCoo[0][VEC_COL] + 1) * 2, 0);
        }
    }

    if (bad & 12) {
        /* inty = intz / (globaldclip>>16) */
        t = divscale30(oz1 - s3, s4 - s3 + oz1 - oz2);
        inty = pvWalls[w].screenSpaceCoo[0][VEC_DIST] + mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST] - pvWalls[w].screenSpaceCoo[0][VEC_DIST], t);
        intz = oz1 + mulscale30(oz2 - oz1, t);
        xcross = pvWalls[w].screenSpaceCoo[0][VEC_COL] + scale(mulscale30(pvWalls[w].screenSpaceCoo[1][VEC_DIST], t), pvWalls[w].screenSpaceCoo[1][VEC_COL] - pvWalls[w].screenSpaceCoo[0][VEC_COL], inty);

        if ((bad & 12) == 8) {
            if (pvWalls[w].screenSpaceCoo[0][VEC_COL] <= xcross) {
                z2 = intz;
                iy2 = inty;
                ix2 = xcross;
            }
            clearbufbyte(mostbuf, xcross + 1, (pvWalls[w].screenSpaceCoo[1][VEC_COL] - xcross) * 2, ydimen + (ydimen << 16));
        }
        else {
            if (xcross <= pvWalls[w].screenSpaceCoo[1][VEC_COL]) {
                z1 = intz;
                iy1 = inty;
                ix1 = xcross;
            }
            clearbufbyte(mostbuf, pvWalls[w].screenSpaceCoo[0][VEC_COL], (xcross - pvWalls[w].screenSpaceCoo[0][VEC_COL] + 1) * 2, ydimen + (ydimen << 16));
        }
    }

    y = (scale(z1, xdimenscale, iy1) << 4);
    yinc = (((scale(z2, xdimenscale, iy2) << 4) - y) / (ix2 - ix1 + 1)) | 0;
    qinterpolatedown16short(mostbuf, ix1, ix2 - ix1 + 1, y + (globalhoriz << 16), yinc);

    if (mostbuf[ix1] < 0)
        mostbuf[ix1] = 0;
    if (mostbuf[ix1] > ydimen)
        mostbuf[ix1] = ydimen;
    if (mostbuf[ix2] < 0)
        mostbuf[ix2] = 0;
    if (mostbuf[ix2] > ydimen)
        mostbuf[ix2] = ydimen;

    return (bad);
}

//2191
var drawallsCount=0;
Engine.draWalls = function (bunch) {
    var sec, nextsec;
    var wal;
    var i, x, x1, x2, cz = new Int32Array(5), fz = new Int32Array(5);
    var z, wallnum, sectnum, nextsectnum;
    var startsmostwallcnt, startsmostcnt, gotswall;
    var andwstat1, andwstat2;
    drawallsCount++;
    printf("drawalls %i, drawallsCount: %i\n", bunch, drawallsCount);
    z = bunchfirst[bunch];
    sectnum = pvWalls[z].sectorId;
    sec = sector[sectnum];

    andwstat1 = 0xff;
    andwstat2 = 0xff;
    for (; z >= 0; z = bunchWallsList[z]) { /* uplc/dplc calculation */

        andwstat1 &= wallmost(uplc, z, sectnum, 0);
        andwstat2 &= wallmost(dplc, z, sectnum, 1);
    }
    
    /* draw ceilings */
    if ((andwstat1&3) != 3){
        if ((sec.ceilingstat&3) == 2)
            grouscan(pvWalls[bunchfirst[bunch]].screenSpaceCoo[0][VEC_COL],pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],sectnum,0);
        else if ((sec.ceilingstat&1) == 0)
            ceilscan(pvWalls[bunchfirst[bunch]].screenSpaceCoo[0][VEC_COL],pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],sectnum);
        else
            parascan(pvWalls[bunchfirst[bunch]].screenSpaceCoo[0][VEC_COL],pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],sectnum,0,bunch);
    }
    
    appendCanvasImageToPage();


    /* draw floors */
    if ((andwstat2&12) != 12){
        if ((sec.floorstat&3) == 2)
            grouscan(pvWalls[bunchfirst[bunch]].screenSpaceCoo[0][VEC_COL],pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],sectnum,1);
        else if ((sec.floorstat&1) == 0)
            florscan(pvWalls[bunchfirst[bunch]].screenSpaceCoo[0][VEC_COL],pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],sectnum);
        else
            parascan(pvWalls[bunchfirst[bunch]].screenSpaceCoo[0][VEC_COL],pvWalls[bunchlast[bunch]].screenSpaceCoo[1][VEC_COL],sectnum,1,bunch);
    }
    
    appendCanvasImageToPage();

    /* DRAW WALLS SECTION! */
    for(z=bunchfirst[bunch]; z>=0; z=bunchWallsList[z]){

        x1 = pvWalls[z].screenSpaceCoo[0][VEC_COL];
        x2 = pvWalls[z].screenSpaceCoo[1][VEC_COL];
        if (umost[x2] >= dmost[x2])
        {

            for(x=x1; x<x2; x++)
                if (umost[x] < dmost[x]) 
                    break;

            if (x >= x2)
            {
                smostwall[smostwallcnt] = z;
                smostwalltype[smostwallcnt] = 0;
                smostwallcnt++;
                continue;
            }
        }

        wallnum = pvWalls[z].worldWallId;
        wal = wall[wallnum];
        nextsectnum = wal.nextsector;
        nextsec = sector[nextsectnum];

        gotswall = 0;

        startsmostwallcnt = smostwallcnt;
        startsmostcnt = smostcnt;

        if ((searchit == 2) && (searchx >= x1) && (searchx <= x2))
        {
            if (searchy <= uplc[searchx]){ /* ceiling */
                searchsector = sectnum;
                searchwall = wallnum;
                searchstat = 1;
                searchit = 1;
            }
            else if (searchy >= dplc[searchx]){ /* floor */
                searchsector = sectnum;
                searchwall = wallnum;
                searchstat = 2;
                searchit = 1;
            }
        }

        if (nextsectnum >= 0) {
            var czRef = new Ref(cz[0]);
            var fzRef = new Ref(fz[0]);
            getzsofslope(sectnum, wal.x, wal.y, czRef, fzRef);
            cz[0] = czRef.$;
            fz[0] = fzRef.$;
            
            czRef.$ = cz[1];
            fzRef.$ = fz[1];
            getzsofslope(sectnum, wall[wal.point2].x, wall[wal.point2].y, czRef, fzRef);
            cz[1] = czRef.$;
            fz[1] = fzRef.$;

            czRef.$ = cz[2];
            fzRef.$ = fz[2];
            getzsofslope(nextsectnum, wal.x, wal.y, czRef, fzRef);
            cz[2] = czRef.$;
            fz[2] = fzRef.$;

            czRef.$ = cz[3];
            fzRef.$ = fz[3];
            getzsofslope(nextsectnum, wall[wal.point2].x, wall[wal.point2].y, czRef, fzRef);
            cz[3] = czRef.$;
            fz[3] = fzRef.$;

            czRef.$ = cz[4];
            fzRef.$ = fz[4];
            getzsofslope(nextsectnum, globalposx, globalposy, czRef, fzRef);
            cz[4] = czRef.$;
            fz[4] = fzRef.$;

            if ((wal.cstat&48) == 16)
                maskwall[maskwallcnt++] = z;

            if (((sec.ceilingstat&1) == 0) || ((nextsec.ceilingstat&1) == 0)){
                if ((cz[2] <= cz[0]) && (cz[3] <= cz[1])){
                    if (globparaceilclip)
                        for(x=x1; x<=x2; x++)
                            if (uplc[x] > umost[x])
                                if (umost[x] <= dmost[x]){
                                    umost[x] = uplc[x];
                                    if (umost[x] > dmost[x]) numhits--;
                                }
                }
                else{
                    wallmost(dwall,z,nextsectnum, 0);
                    if ((cz[2] > fz[0]) || (cz[3] > fz[1]))
                        for(i=x1; i<=x2; i++) if (dwall[i] > dplc[i]) dwall[i] = dplc[i];

                    if ((searchit == 2) && (searchx >= x1) && (searchx <= x2))
                        if (searchy <= dwall[searchx]) /* wall */{
                            searchsector = sectnum;
                            searchwall = wallnum;
                            searchstat = 0;
                            searchit = 1;
                        }

                    globalorientation = wal.cstat;
                    globalpicnum = wal.picnum;
                    if (toUint32(globalpicnum) >= MAXTILES) globalpicnum = 0;
                    globalxpanning = wal.xpanning;
                    globalypanning = wal.ypanning;
                    globalshiftval = (picsiz[globalpicnum]>>4);
                    if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height) globalshiftval++;
                    globalshiftval = 32-globalshiftval;

                    //Animated
                    if (tiles[globalpicnum].animFlags&192)
                        globalpicnum += animateoffs(globalpicnum);

                    globalshade = wal.shade;
                    globvis = globalvisibility;
                    if (sec.visibility != 0) globvis = mulscale4(globvis,toUint8(sec.visibility+16));
                    globalpal = wal.pal;
                    globalyscale = (wal.yrepeat<<(globalshiftval-19));
                    if ((globalorientation&4) == 0)
                        globalzd = (((globalposz-nextsec.ceilingz)*globalyscale)<<8);
                    else
                        globalzd = (((globalposz-sec.ceilingz)*globalyscale)<<8);
                    globalzd += (globalypanning<<24);
                    if (globalorientation & 256) {
                        globalyscale = -globalyscale;
                        globalzd = -globalzd;
                    }

                    if (gotswall == 0) {
                        gotswall = 1;
                        prepwall(z,wal);
                    }
                    wallscan(x1,x2,uplc,dwall,swall,lwall);

                    if ((cz[2] >= cz[0]) && (cz[3] >= cz[1])){
                        for(x=x1; x<=x2; x++)
                            if (dwall[x] > umost[x])
                                if (umost[x] <= dmost[x]){
                                    umost[x] = dwall[x];
                                    if (umost[x] > dmost[x]) numhits--;
                                }
                    }
                    else
                    {
                        for(x=x1; x<=x2; x++)
                            if (umost[x] <= dmost[x]){
                                i = Math.max(uplc[x],dwall[x]);
                                if (i > umost[x]){
                                    umost[x] = i;
                                    if (umost[x] > dmost[x]) numhits--;
                                }
                            }
                    }
                }
                if ((cz[2] < cz[0]) || (cz[3] < cz[1]) || (globalposz < cz[4])){
                    i = x2-x1+1;
                    if (smostcnt+i < MAXYSAVES){
                        smoststart[smostwallcnt] = smostcnt;
                        smostwall[smostwallcnt] = z;
                        smostwalltype[smostwallcnt] = 1;   /* 1 for umost */
                        smostwallcnt++;
                        copybufbyte(umost, x1, smost, smostcnt, i * 2);
                        smostcnt += i;
                    }
                }
            }
            if (((sec.floorstat&1) == 0) || ((nextsec.floorstat&1) == 0)){
                if ((fz[2] >= fz[0]) && (fz[3] >= fz[1])){
                    if (globparaflorclip)
                        for(x=x1; x<=x2; x++)
                            if (dplc[x] < dmost[x])
                                if (umost[x] <= dmost[x]){
                                    dmost[x] = dplc[x];
                                    if (umost[x] > dmost[x]) numhits--;
                                }
                }
                else{
                    wallmost(uwall,z,nextsectnum,1);
                    if ((fz[2] < cz[0]) || (fz[3] < cz[1]))
                        for(i=x1; i<=x2; i++) if (uwall[i] < uplc[i]) uwall[i] = uplc[i];

                    if ((searchit == 2) && (searchx >= x1) && (searchx <= x2))
                        if (searchy >= uwall[searchx]) /* wall */{
                            searchsector = sectnum;
                            searchwall = wallnum;
                            if ((wal.cstat&2) > 0) searchwall = wal.nextwall;
                            searchstat = 0;
                            searchit = 1;
                        }

                    if ((wal.cstat&2) > 0){
                        wallnum = wal.nextwall;
                        wal = wall[wallnum];
                        globalorientation = wal.cstat;
                        globalpicnum = wal.picnum;
                        if (globalpicnum >= MAXTILES) globalpicnum = 0;
                        globalxpanning = wal.xpanning;
                        globalypanning = wal.ypanning;

                        if (tiles[globalpicnum].animFlags&192) 
                            globalpicnum += animateoffs(globalpicnum);

                        globalshade = wal.shade;
                        globalpal = wal.pal;
                        wallnum = pvWalls[z].worldWallId;
                        wal = wall[wallnum];
                    }
                    else{
                        globalorientation = wal.cstat;
                        globalpicnum = wal.picnum;

                        if (globalpicnum >= MAXTILES) 
                            globalpicnum = 0;

                        globalxpanning = wal.xpanning;
                        globalypanning = wal.ypanning;

                        if (tiles[globalpicnum].animFlags&192) 
                            globalpicnum += animateoffs(globalpicnum);
                        globalshade = wal.shade;
                        globalpal = wal.pal;
                    }
                    globvis = globalvisibility;
                    if (sec.visibility != 0)
                        globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));
                    globalshiftval = (picsiz[globalpicnum]>>4);

                    if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height)
                        globalshiftval++;

                    globalshiftval = 32-globalshiftval;
                    globalyscale = (wal.yrepeat<<(globalshiftval-19));

                    if ((globalorientation&4) == 0)
                        globalzd = (((globalposz-nextsec.floorz)*globalyscale)<<8);
                    else
                        globalzd = (((globalposz-sec.ceilingz)*globalyscale)<<8);

                    globalzd += (globalypanning<<24);
                    if (globalorientation&256) globalyscale = -globalyscale, globalzd = -globalzd;

                    if (gotswall == 0) {
                        gotswall = 1;
                        prepwall(z,wal);
                    }
                    wallscan(x1,x2,uwall,dplc,swall,lwall);

                    if ((fz[2] <= fz[0]) && (fz[3] <= fz[1]))
                    {
                        for(x=x1; x<=x2; x++)
                            if (uwall[x] < dmost[x])
                                if (umost[x] <= dmost[x]){
                                    dmost[x] = uwall[x];
                                    if (umost[x] > dmost[x]) numhits--;
                                }
                    }
                    else
                    {
                        for(x=x1; x<=x2; x++)
                            if (umost[x] <= dmost[x]){
                                i = Math.min(dplc[x],uwall[x]);
                                if (i < dmost[x])
                                {
                                    dmost[x] = i;
                                    if (umost[x] > dmost[x]) numhits--;
                                }
                            }
                    }
                }
                if ((fz[2] > fz[0]) || (fz[3] > fz[1]) || (globalposz > fz[4])){
                    i = x2-x1+1;
                    if (smostcnt+i < MAXYSAVES){
                        smoststart[smostwallcnt] = smostcnt;
                        smostwall[smostwallcnt] = z;
                        smostwalltype[smostwallcnt] = 2;   /* 2 for dmost */
                        smostwallcnt++;
                        copybufbyte( dmost, x1, smost, smostcnt, i * 2);
                        smostcnt += i;
                    }
                }
            }
            if (numhits < 0) {
                console.log("drawals numhits < 0 return");
                return;
            }
            if ((!(wal.cstat&32)) && ((visitedSectors[nextsectnum>>3]&pow2char[nextsectnum&7]) == 0)){
                if (umost[x2] < dmost[x2])
                    scansector(nextsectnum);
                else
                {
                    for(x=x1; x<x2; x++)
                        if (umost[x] < dmost[x]){
                            scansector(nextsectnum);
                            break;
                        }

                    /*
                     * If can't see sector beyond, then cancel smost array and just
                     *  store wall!
                     */
                    if (x == x2){
                        smostwallcnt = startsmostwallcnt;
                        smostcnt = startsmostcnt;
                        smostwall[smostwallcnt] = z;
                        smostwalltype[smostwallcnt] = 0;
                        smostwallcnt++;
                    }
                }
            }
        }
        if ((nextsectnum < 0) || (wal.cstat&32))   /* White/1-way wall */
        {
            globalorientation = wal.cstat;
            if (nextsectnum < 0)
                globalpicnum = wal.picnum;
            else
                globalpicnum = wal.overpicnum;

            if (globalpicnum >= MAXTILES)
                globalpicnum = 0;

            globalxpanning = wal.xpanning;
            globalypanning = wal.ypanning;

            if (tiles[globalpicnum].animFlags&192)
                globalpicnum += animateoffs(globalpicnum);

            globalshade = wal.shade;
            globvis = globalvisibility;
            if (sec.visibility != 0)
                globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));

            globalpal = wal.pal;
            globalshiftval = (picsiz[globalpicnum]>>4);
            if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height)
                globalshiftval++;

            globalshiftval = 32-globalshiftval;
            globalyscale = (wal.yrepeat<<(globalshiftval-19));
            if (nextsectnum >= 0)
            {
                if ((globalorientation&4) == 0)
                    globalzd = globalposz-nextsec.ceilingz;
                else
                    globalzd = globalposz-sec.ceilingz;
            }
            else
            {
                if ((globalorientation&4) == 0)
                    globalzd = globalposz-sec.ceilingz;
                else
                    globalzd = globalposz-sec.floorz;
            }
            globalzd = ((globalzd*globalyscale)<<8) + (globalypanning<<24);

            if (globalorientation&256){
                globalyscale = -globalyscale;
                globalzd = -globalzd;
            }

            if (gotswall == 0) {
                gotswall = 1;
                prepwall(z,wal);
            }
            printf("2591 wallscan x1: %i, x2: %i\n", x1, x2);
            wallscan(x1, x2, uplc, dplc, swall, lwall);

            for(x=x1; x<=x2; x++)
                if (umost[x] <= dmost[x])
                {
                    umost[x] = 1;
                    dmost[x] = 0;
                    numhits--;
                }
            smostwall[smostwallcnt] = z;
            smostwalltype[smostwallcnt] = 0;
            smostwallcnt++;

            if ((searchit == 2) && (searchx >= x1) && (searchx <= x2)){
                searchit = 1;
                searchsector = sectnum;
                searchwall = wallnum;
                if (nextsectnum < 0) searchstat = 0;
                else searchstat = 4;
            }
        }
    }
    console.log("eo drawals")
    appendCanvasImageToPage();
};

//2593
function setAspect(daxrange, daaspect) {
    viewingrange = daxrange;
    viewingrangerecip = divscale32(1, daxrange);

    yxaspect = daaspect;
    xyaspect = divscale32(1, yxaspect);
    xdimenscale = scale(xdimen, yxaspect, 320);
    xdimscale = scale(320, xyaspect, xdimen);
}

//2600
Engine.doSetAspect = function (davis, dashade) {
    var i, j, k, x, xinc;

    if (xyaspect != oxyaspect) {
        oxyaspect = xyaspect;
        j = xyaspect * 320;
        horizlookup2[horizycent - 1] = divscale26(131072, j);
        for (i = ydim * 4 - 1; i >= 0; i--)
            if (i != (horizycent - 1)) {
                horizlookup[i] = divscale28(1, i - (horizycent - 1));
                horizlookup2[i] = divscale14(klabs(horizlookup[i]), j);
            }
    }


    if ((xdimen != oxdimen) || (viewingrange != oviewingrange)) {
        oxdimen = xdimen;
        oviewingrange = viewingrange;
        xinc = mulscale32(viewingrange * 320, xdimenrecip);
        x = (640 << 16) - mulscale1(xinc, xdimen);
        for (i = 0; i < xdimen; i++) {
            j = (x & 65535);
            k = (x >> 16);
            x += xinc;
            if (j != 0) j = mulscale16(radarang[k + 1] - radarang[k], j);
            radarang2[i] = /*(short)*/((radarang[k] + j) >> 6);
        }
    }
};


/*
  FCS: Geez one more horrible algorithm to decipher :| :/ :( cry smiley..... 
  Algorithm:

  1.
  Take wall 1 vector [point1,point2] and using two cross products determine if the two endpoints of wall 2 are on the same side of Wall 1 plan.
  If they are then we can determine according to globalposx and globalposy if  wall2 is before or after wall1's plan.
  
  2. Do the same thing again but this time with wall2's plan. Try to find if wall1 is in front of behind wall2's plan.

  Key concept: If a cross-product is equal to 0 this mean they are parallel.

  Return: pvWallID1 in the potentially visible wall list is in front of pvWallID2 (in the same potentially visible list)
*/
function wallfront(pvWallID1, pvWallID2) {
    var wal;
    var x11, y11, x21, y21, x12, y12, x22, y22, dx, dy, t1, t2;

    //It seems we are going to work in Worldspace coordinates.
    wal = wall[pvWalls[pvWallID1].worldWallId];
    x11 = wal.x;
    y11 = wal.y;
    wal = wall[wal.point2];
    x21 = wal.x;
    y21 = wal.y;
    wal = wall[pvWalls[pvWallID2].worldWallId];
    x12 = wal.x;
    y12 = wal.y;
    wal = wall[wal.point2];
    x22 = wal.x;
    y22 = wal.y;


    //This is part 1

    //Wall 1's vector
    dx = x21-x11;
    dy = y21-y11;

    //This is a cross-product between Wall 1 vector and the [Wall 1 Point 1. Wall 2 Point 1] vector 
    t1 = dmulscale2(x12-x11,dy,-dx,y12-y11); /* p1(l2) vs. l1 */
    //This is a cross-product between Wall 1 vector and the [Wall 1 Point 1. Wall 2 Point 2] vector 
    t2 = dmulscale2(x22-x11,dy,-dx,y22-y11); /* p2(l2) vs. l1 */

    //If the vectors a parallel, then the cross-product is zero.
    if (t1 == 0) {
        //wall2's point1 is on wall1's plan.
        t1 = t2;
        if (t1 == 0) // Those two walls are on the same plan.
        {
            //Wall 2's point 2 is on wall1's plan.
            return(-1);
        }
    }
    if (t2 == 0) 
        t2 = t1;

	
    //This XOR just determine if the cross-product have the same sign and hence if both points are on the same side of wall 1 plan.
    //Test if both points of wall2 are on the same side of wall 1 (in front or behind).
    if ((t1^t2) >= 0)
    {
        //cross-product have the same sign: Both points of wall2 are on the same side of wall1 : An answer is possible !!

        //Now is time to take into account the camera position and determine which of wall1 or wall2 is seen first.
        t2 = dmulscale2(globalposx-x11,dy,-dx,globalposy-y11); /* pos vs. l1 */

        //Test the cross product sign difference.
        //If (t2^t1) >= 0 then  both cross product had different sign so wall1 is in front of wall2
        //otherwise wall2 is in front of wall1
        return((t2^t1) >= 0);
    }


    //This is part 2
    //Do it again but this time will wall2's plan.

    //Wall 2's vector
    dx = x22-x12;
    dy = y22-y12;

    t1 = dmulscale2(x11-x12,dy,-dx,y11-y12); /* p1(l1) vs. l2 */
    t2 = dmulscale2(x21-x12,dy,-dx,y21-y12); /* p2(l1) vs. l2 */
    if (t1 == 0) {
        t1 = t2;
        if (t1 == 0) 
            return(-1);
    }
    if (t2 == 0) 
        t2 = t1;
    if ((t1^t2) >= 0)
    {
        t2 = dmulscale2(globalposx-x12,dy,-dx,globalposy-y12); /* pos vs. l2 */
        return((t2^t1) < 0);
    }

    //FCS: No wall is in front of the other's plan: This means they are crossing.
    return(-2);
}


//Return 1 if bunch firstBunchID is in from of bunch secondBunchID.
function bunchfront(firstBunchID,  secondBunchID)
{
    var x1b1, x2b1, x1b2, x2b2;
    
    x1b1 = pvWalls[bunchfirst[firstBunchID]].screenSpaceCoo[0][VEC_COL];
    x2b2 = pvWalls[bunchlast[secondBunchID]].screenSpaceCoo[1][VEC_COL]+1; 
    if (x1b1 >= x2b2)
    {
        //Bunch 1 left side is completely on the right of bunch2's right in screenspace: They do not overlap.
        return(-1);
    }

    x1b2 = pvWalls[bunchfirst[secondBunchID]].screenSpaceCoo[0][VEC_COL];
    x2b1 = pvWalls[bunchlast[firstBunchID]].screenSpaceCoo[1][VEC_COL]+1;
    if (x1b2 >= x2b1) 
    {
        //Bunch 2 left side is completely on the right of bunch 1 right side: They do not overlap.
        return(-1);
    }


    if (x1b1 >= x1b2)
    {
        //Get the last wall in the bunch2.
        var lastWallID;
        for(lastWallID=bunchfirst[secondBunchID]; 
            pvWalls[lastWallID].screenSpaceCoo[1][VEC_COL]<x1b1; 
            lastWallID=bunchWallsList[lastWallID]);

        return(wallfront(bunchfirst[firstBunchID],lastWallID));
    }
    else
    {
        //Get the last wall in the bunch.
        var lastWallID;
        for(lastWallID=bunchfirst[firstBunchID]; 
            pvWalls[lastWallID].screenSpaceCoo[1][VEC_COL]<x1b2; 
            lastWallID=bunchWallsList[lastWallID]);

        return(wallfront(lastWallID,bunchfirst[secondBunchID]));
    }
}


//2774
var pixelRenderable = 0;
//#include "keyboard.h"
//void WriteLastPaletteToFile(void);
//void WriteTranslucToFile(void);
/*  
      FCS: Draw every walls in Front to Back Order.
*/
function drawrooms(daposx, daposy, daposz, daang, dahoriz, dacursectnum) {
    var i, j, z, closest;
    //Ceiling and Floor height at the player position.
    var cz, fz;
    var shortptr1, shortptr2;

    // When visualizing the rendering process, part of the screen
    // are not updated: In order to avoid the "ghost effect", we
    // clear the framebuffer to black.
    if (CLEAR_FRAMEBUFFER) {
        clear2dscreen();
    }

    //CODE EXPLORATION
    /*
    if( KB_KeyDown[0x39]){ // 0x39 = SPACE
        //CODE EXPLORATION
        WriteLastPaletteToFile();
        WriteTranslucToFile();
    }        
    */

    pixelRenderable += 100;
    if (pixelRenderable >= MAX_PIXEL_RENDERERED)
        pixelRenderable = 0;

    pixelsAllowed = 100000000;
    globalposx = daposx;
    globalposy = daposy;
    globalposz = daposz;
    console.log("dacursectnum: %i, globalposx: %i, globalposy: %i, globalposz: %i", dacursectnum, globalposx, globalposy, globalposz);
    globalang = (daang & 2047); //FCS: Mask and keep only 11 bits of angle value.

    globalhoriz = mulscale16(dahoriz - 100, xdimenscale) + (ydimen >> 1);
    globaluclip = (0 - globalhoriz) * xdimscale;
    globaldclip = (ydimen - globalhoriz) * xdimscale;

    i = mulscale16(xdimenscale, viewingrangerecip);
    globalpisibility = mulscale16(parallaxvisibility, i);
    globalvisibility = mulscale16(visibility, i);
    globalhisibility = mulscale16(globalvisibility, xyaspect);
    globalcisibility = mulscale8(globalhisibility, 320);

    globalcursectnum = dacursectnum;
    totalclocklock = totalclock;

    cosglobalang = sintable[(globalang + 512) & 2047];
    singlobalang = sintable[globalang & 2047];
    cosviewingrangeglobalang = mulscale16(cosglobalang, viewingrange);
    sinviewingrangeglobalang = mulscale16(singlobalang, viewingrange);

    if (stereomode != 0) {
        throw "todo";
    }

    if ((xyaspect != oxyaspect) || (xdimen != oxdimen) || (viewingrange != oviewingrange)) {
        Engine.doSetAspect();
    }
    if (stereomode != 0) {
        throw "todo - need to cater for viewoffset and frameoffset";
    }

    //todo: frameoffset.position = frameplace.position + viewoffset;    //original: frameoffset = frameplace.position + viewoffset;

    //Clear the bit vector that keep track of what sector has been flooded in.
    clearbufbyte(visitedSectors, 0, ((numsectors + 7) >> 3), 0);

    //Clear the occlusion array.
    shortptr1 = windowx1;//(short *)&startumost[windowx1];
    shortptr2 = windowx1;//(short *)&startdmost[windowx1];
    i = xdimen - 1;
    do {
        umost[i] = startumost[shortptr1 + i] - windowy1;
        dmost[i] = startdmost[shortptr2 + i] - windowy1;
        i--;
    } while (i != 0);
    umost[0] = startumost[shortptr1] - windowy1;
    dmost[0] = startdmost[shortptr2] - windowy1;

    // NumHits is the number of column to draw.
    numhits = xdimen;
    // Num walls to potentially render.
    numscans = 0;

    numbunches = 0;
    maskwallcnt = 0;
    smostwallcnt = 0;
    smostcnt = 0;
    spritesortcnt = 0;

    if (globalcursectnum >= MAXSECTORS)
        globalcursectnum -= MAXSECTORS;
    else {
        // Even if the player leaves the map, the engine will keep on rendering from the last visited sector.
        // Save it.
        i = globalcursectnum;
        var globalcursectnumRef = new Ref(globalcursectnum);
        updatesector(globalposx, globalposy, globalcursectnumRef);
        globalcursectnum = globalcursectnumRef.$;
        // Seem the player has left the map since updatesector cannot locate him -> Restore to the last known sector.
        if (globalcursectnum < 0)
            globalcursectnum = i;
    }

    globparaceilclip = 1;
    globparaflorclip = 1;

    // Update the ceiling and floor Z coordinate for the player's 2D position.
    var czRef = new Ref(cz);
    var fzRef = new Ref(fz);
    getzsofslope(globalcursectnum, globalposx, globalposy, czRef, fzRef);
    cz = czRef.$;
    fz = fzRef.$;

    if (globalposz < cz) globparaceilclip = 0;
    if (globalposz > fz) globparaflorclip = 0;

    // Build the list of potentially visible wall in to "bunches".
    scansector(globalcursectnum);

    if (inpreparemirror) {
        console.log("test, is this block working?");
        inpreparemirror = 0;
        mirrorsx1 = xdimen - 1;
        mirrorsx2 = 0;
        for (i = numscans - 1; i >= 0; i--) {
            if (wall[pvWalls[i].worldWallId].nextsector < 0) continue;
            if (pvWalls[i].screenSpaceCoo[0][VEC_COL] < mirrorsx1) mirrorsx1 = pvWalls[i].screenSpaceCoo[0][VEC_COL];
            if (pvWalls[i].screenSpaceCoo[1][VEC_COL] > mirrorsx2) mirrorsx2 = pvWalls[i].screenSpaceCoo[1][VEC_COL];
        }

        if (stereomode) {
            mirrorsx1 += (stereopixelwidth << 1);
            mirrorsx2 += (stereopixelwidth << 1);
        }

        for (i = 0; i < mirrorsx1; i++)
            if (umost[i] <= dmost[i]) {
                umost[i] = 1;
                dmost[i] = 0;
                numhits--;
            }
        for (i = mirrorsx2 + 1; i < xdimen; i++)
            if (umost[i] <= dmost[i]) {
                umost[i] = 1;
                dmost[i] = 0;
                numhits--;
            }

        Engine.draWalls(0);
        numbunches--;
        bunchfirst[0] = bunchfirst[numbunches];
        bunchlast[0] = bunchlast[numbunches];

        mirrorsy1 = Math.min(umost[mirrorsx1], umost[mirrorsx2]);
        mirrorsy2 = Math.max(dmost[mirrorsx1], dmost[mirrorsx2]);
    }

    // scansector has generated the bunches, it is now time to see which ones to render.
    // numhits is the number of column of pixels to draw: (if the screen is 320x200 then numhits starts at 200).
    // Due to rounding error, not all columns may be drawn so an additional stop condition is here:
    // When every bunches have been tested for rendition.
    while ((numbunches > 0) && (numhits > 0)) {
        console.log("drawrooms numbunches: %i", numbunches)
        // tempbuf is used to mark which bunches have been elected as "closest".
        // if tempbug[x] == 1 then it should be skipped.
        clearbuf(tempbuf,0,((numbunches+3)>>2),0);

        /* Almost works, but not quite :( */
        closest = 0;
        tempbuf[closest] = 1;
        for (i = 1; i < numbunches; i++) {
            if ((j = bunchfront(i, closest)) < 0)
                continue;
            tempbuf[i] = 1;
            if (j == 0) {
                tempbuf[closest] = 1;
                closest = i;
            }
        }

        /* Double-check */
        for (i = 0; i < numbunches; i++) {
            console.log("drawrooms  Double-check i: %i, tempbuf[i]: %i", i, tempbuf[i]);
            if (tempbuf[i])
                continue;
            if ((j = bunchfront(i, closest)) < 0)
                continue;
            tempbuf[i] = 1;
            if (j == 0) {
                tempbuf[closest] = 1;
                closest = i, i = 0;
            }
        }

        //Draw every solid walls with ceiling/floor in the bunch "closest"
        Engine.draWalls(closest);

        if (automapping) {
            for (z = bunchfirst[closest]; z >= 0; z = bunchWallsList[z])
                show2dwall[pvWalls[z].worldWallId >> 3] |=
                pow2char[pvWalls[z].worldWallId & 7];
        }

        //Since we just rendered a bunch, lower the current stack element so we can treat the next item
        numbunches--;
        //...and move the bunch at the top of the stack so we won't iterate on it again...
        bunchfirst[closest] = bunchfirst[numbunches];
        bunchlast[closest] = bunchlast[numbunches];
    }
}

//3051
function spritewallfront (s, w) {
    var wal;
    var x1, y1;

    wal = wall[w];
    x1 = wal.x;
    y1 = wal.y;
    wal = wall[wal.point2];
    return (dmulscale32(wal.x-x1,s.y-y1,-(s.x-x1),wal.y-y1) >= 0);
}


function transmaskvline(x) {
    var vplc, vinc, p, i, palookupoffs, bufplc;
    var y1v, y2v;

    if ((x < 0) || (x >= xdimen)) return;

    y1v = Math.max(uwall[x],startumost[x+windowx1]-windowy1);
    y2v = Math.min(dwall[x],startdmost[x+windowx1]-windowy1);
    y2v--;
    if (y2v < y1v) return;

    palookupoffs = new PointerHelper(palookup[globalpal], (getpalookup(mulscale16(swall[x], globvis), globalshade) << 8));

    vinc = swall[x]*globalyscale;
    vplc = globalzd + vinc*(y1v-globalhoriz+1);

    i = lwall[x]+globalxpanning;
    
    if (i >= tiles[globalpicnum].dim.width)
        i %= tiles[globalpicnum].dim.width;

    bufplc = tiles[globalpicnum].data;// +i*tiles[globalpicnum].dim.height;

    p = ylookup[y1v]+x+frameoffset;

    tvlineasm1(vinc,palookupoffs,y2v-y1v,vplc,bufplc,p);

    transarea += y2v-y1v;
}

function transmaskvline2 (x)
{
    var i, y1, y2, x2;
    var y1ve = new Int16Array(2), y2ve= new Int16Array(2);

    if ((x < 0) || (x >= xdimen)) return;
    if (x == xdimen-1) {
        transmaskvline(x);
        return;
    }

    x2 = x+1;

    y1ve[0] = Math.max(uwall[x],startumost[x+windowx1]-windowy1);
    y2ve[0] = Math.min(dwall[x],startdmost[x+windowx1]-windowy1)-1;
    if (y2ve[0] < y1ve[0]) {
        transmaskvline(x2);
        return;
    }
    y1ve[1] = Math.max(uwall[x2],startumost[x2+windowx1]-windowy1);
    y2ve[1] = Math.min(dwall[x2],startdmost[x2+windowx1]-windowy1)-1;
    if (y2ve[1] < y1ve[1]) {
        transmaskvline(x);
        return;
    }

    palookupoffse[0] = new PointerHelper(palookup[globalpal], (getpalookup(mulscale16(swall[x],globvis),globalshade)<<8));
    palookupoffse[1] = new PointerHelper(palookup[globalpal], (getpalookup(mulscale16(swall[x2],globvis),globalshade)<<8));

    setuptvlineasm2(globalshiftval,palookupoffse[0],palookupoffse[1]);

    vince[0] = swall[x]*globalyscale;
    vince[1] = swall[x2]*globalyscale;
    vplce[0] = globalzd + vince[0]*(y1ve[0]-globalhoriz+1);
    vplce[1] = globalzd + vince[1]*(y1ve[1]-globalhoriz+1);
    //printf("swall[x]: %i, swall[x2]: %i, vince[0]: %i, vince[1]: %i, vplce[0]: %i, vplce[1]: %i\n", swall[x], swall[x2], vince[0], vince[1], vplce[0], vplce[1]);

    i = lwall[x] + globalxpanning;
    if (i >= tiles[globalpicnum].dim.width)
        i %= tiles[globalpicnum].dim.width;
    bufplce[0] = /*tiles[globalpicnum].data+*/i*tiles[globalpicnum].dim.height;

    i = lwall[x2] + globalxpanning;
    if (i >= tiles[globalpicnum].dim.width)
        i %= tiles[globalpicnum].dim.width;
    bufplce[1] = /*tiles[globalpicnum].data+*/i*tiles[globalpicnum].dim.height;

    
    y1 = Math.max(y1ve[0],y1ve[1]);
    y2 = Math.min(y2ve[0],y2ve[1]);

    i = x;//x+frameoffset;

    if (y1ve[0] != y1ve[1])
    {
        if (y1ve[0] < y1)
            vplce[0] = tvlineasm1(vince[0],palookupoffse[0],y1-y1ve[0]-1,vplce[0],tiles[globalpicnum].data,bufplce[0],ylookup[y1ve[0]]+i);
        else
            vplce[1] = tvlineasm1(vince[1],palookupoffse[1],y1-y1ve[1]-1,vplce[1],tiles[globalpicnum].data,bufplce[1],ylookup[y1ve[1]]+i+1);
    }

    if (y2 > y1)
    {
        asm1 = vince[1];
        asm2 = ylookup[y2]+i+1;
        tvlineasm2(vplce[1],vince[0],bufplce[0],bufplce[1],vplce[0],ylookup[y1]+i);
        transarea += ((y2-y1)<<1);
    }
    else
    {
        asm1 = vplce[0];
        asm2 = vplce[1];
    }

    if (y2ve[0] > y2ve[1])
        tvlineasm1(vince[0],palookupoffse[0],y2ve[0]-y2-1,asm1,bufplce[0],ylookup[y2+1]+i);
    else if (y2ve[0] < y2ve[1])
        tvlineasm1(vince[1],palookupoffse[1],y2ve[1]-y2-1,asm2,bufplce[1],ylookup[y2+1]+i+1);

    faketimerhandler();
}


//3191
function transmaskwallscan(x1, x2) {
    var x;

    setgotpic(globalpicnum);
    
    //Tile dimensions are invalid
    if ((tiles[globalpicnum].dim.width <= 0) ||
        (tiles[globalpicnum].dim.height <= 0))
        return;

    TILE_MakeAvailable(globalpicnum);

    x = x1;
    while ((startumost[x+windowx1] > startdmost[x+windowx1]) && (x <= x2)) x++;
    if ((x <= x2) && (x&1)) transmaskvline(x), x++;
    while (x < x2) transmaskvline2(x), x += 2;
    while (x <= x2) transmaskvline(x), x++;
    faketimerhandler();
}

//3179
Engine.loadBoard = function (filename, daposx, daposy, daposz, daang, dacursectnum) {
    var x = 0;
    var fil, i, numsprites;
    var sect;
    var s;
    var w;

    console.assert(daposx instanceof Ref, " daposx must be ref");
    console.assert(daposy instanceof Ref, " daposy must be ref");
    console.assert(daposz instanceof Ref, " daposz must be ref");
    console.assert(daang instanceof Ref, " daang must be ref");
    console.assert(dacursectnum instanceof Ref, " dacursectnum must be ref");

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


    daposx.$ = kread32(fil);
    daposy.$ = kread32(fil);
    daposz.$ = kread32(fil);
    daang.$ = kread16(fil);
    dacursectnum.$ = kread16(fil);
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
    updatesector(daposx.$, daposy.$, dacursectnum);

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

//3488
Engine.loadTables = function () {
    var i, file;
    if (!tablesLoaded) {
        Engine.initKSqrt();

        for (i = 0; i < 2048; i++) {
            recipTable[i] = divscale30(2048, i + 2048);
        }

        if ((file = TCkopen4load("tables.dat", false)) != -1) {
            for (i = 0; i < 2048; i++) {
                sintable[i] = kread16(file);
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

    clearbufbyte(colhere, 0, colhere.length, 0);
    clearbufbyte(colhead, 0, colhead.length, 0);

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

    //// todo: check these caching methods that dont' seem to get run??, what are they for?
    ////CODE EXPLORATION
    ////printf("Num palettes lookup: %d.\n",numpalookups);
    
    //if ((palookup[0] = (uint8_t  *)kkmalloc(numpalookups<<8)) == NULL)
    palookup[0] = new Uint8Array(65536);
    //allocache(&palookup[0],numpalookups<<8,&permanentlock);
    
    ////Transluctent pallete is 65KB.
    //if ((transluc = (uint8_t  *)kkmalloc(65536)) == NULL)
    //allocache(&transluc,65536,&permanentlock);

    globalpalwritten = palookup[0];// - pointer
    globalpal = 0;

    kread(file, palookup[globalpal], numpalookups << 8); // todo check all this

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
    show2dwall = new Uint8Array((MAXWALLS + 7) >> 3);
    show2dsprite = new Uint8Array((MAXSPRITES + 7) >> 3);
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

//3874
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

    printf("doRotateSprite sx == %i && sy == %i && picnum == %i\n", sx, sy, picnum);

    tileWidht = tiles[picnum].dim.width;
    tileHeight = tiles[picnum].dim.height;

    if (dastat & 16) {
        xoff = 0;
        yoff = 0;
    } else {
        xoff = (toInt8((tiles[picnum].animFlags >> 8) & 255)) + (tileWidht >> 1);
        yoff = (toInt8((tiles[picnum].animFlags >> 16) & 255)) + (tileHeight >> 1);
    }

    if (dastat & 4) {
        yoff = tileHeight - yoff;
    }

    cosang = sintable[(a + 512) & 2047];
    sinang = sintable[a & 2047];


    if ((dastat & 2) != 0)  /* Auto window size scaling */ {
        if ((dastat & 8) == 0) {
            x = xdimenscale;   /* = scale(xdimen,yxaspect,320); */
            if (stereomode) x = scale(windowx2 - windowx1 + 1, yxaspect, 320);
            //printf("(dastat & 8) == 0\n");
            //printf("cx1: %i\n", cx1);
            //printf("cx2: %i\n", cx2);
            //printf("sx: %i\n", sx);
            //printf("xdimen: %i\n", xdimen);
            sx = ((cx1 + cx2 + 2) << 15) + scale(sx - (320 << 15), xdimen, 320);
            
            sy = ((cy1 + cy2 + 2) << 15) + mulscale16(sy - (200 << 15), x);
        }
        else {
            /*
             * If not clipping to startmosts, & auto-scaling on, as a
             *  hard-coded bonus, scale to full screen instead
             */
            x = scale(xdim, yxaspect, 320);
            //printf("sx: %i\n", sx);
            //printf("xdim: %i\n", xdim);
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
    printf("sx: %i\n", sx);
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
        //console.log("x1: %i, x2: %i", x1, x2);
        dax1 = (x1 >> 16);
        if (x1 < lx)
            lx = x1;
        dax2 = (x2 >> 16);
        if (x1 > rx)
            rx = x1;
        //console.log("lx: %i, rx: %i", lx, rx);
        if (dax1 != dax2) {
            y1 = pvWalls[v].cameraSpaceCoo[0][VEC_Y];
            y2 = pvWalls[nextv].cameraSpaceCoo[0][VEC_Y];
            yinc = divscale16(y2 - y1, x2 - x1);
            if (dax2 > dax1) {
                yplc = y1 + mulscale16((dax1 << 16) + 65535 - x1, yinc);
                qinterpolatedown16short(uplc, dax1, dax2 - dax1, yplc, yinc);
            } else {
                yplc = y2 + mulscale16((dax2 << 16) + 65535 - x2, yinc);
                qinterpolatedown16short(dplc, dax2, dax1 - dax2, yplc, yinc);
            }
        }
        nextv = v;
    }

    TILE_MakeAvailable(picnum);

    setgotpic(picnum);
    bufplc = new PointerHelper(tiles[picnum].data);

    palookupoffs = new PointerHelper(palookup[dapalnum], (getpalookup(0, dashade) << 8));

    i = divscale32(1, z);
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
                    by = by | 0;
                    oy = y1;

                    bufplce[xx] = (bx >> 16) * tileHeight + bufplc.position;
                    vplce[xx] = by;
                    y1ve[xx] = y1;
                    y2ve[xx] = y2 - 1;
                    bad &= ~pow2char[xx];
                }

                p = frameplace;
                p.position = x; // could be dodgy sharing this position?

                //if (ud.playing_demo_rev == 117)
                appendCanvasImageToPage();

                u4 = Math.max(Math.max(y1ve[0], y1ve[1]), Math.max(y1ve[2], y1ve[3]));
                d4 = Math.min(Math.min(y2ve[0], y2ve[1]), Math.min(y2ve[2], y2ve[3]));

                if (dastat & 64) {
                    if ((bad != 0) || (u4 >= d4)) {
                        if (!(bad & 1))
                            prevlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0], vplce[0], tiles[globalpicnum].data, bufplce[0], ylookup[y1ve[0]] + 0 + p.position, p);
                        if (!(bad & 2))
                            prevlineasm1(vince[1], palookupoffse[1], y2ve[1] - y1ve[1], vplce[1], tiles[globalpicnum].data, bufplce[1], ylookup[y1ve[1]] + 1 + p.position, p);
                        if (!(bad & 4))
                            prevlineasm1(vince[2], palookupoffse[2], y2ve[2] - y1ve[2], vplce[2], tiles[globalpicnum].data, bufplce[2], ylookup[y1ve[2]] + 2 + p.position, p);
                        if (!(bad & 8))
                            prevlineasm1(vince[3], palookupoffse[3], y2ve[3] - y1ve[3], vplce[3], tiles[globalpicnum].data, bufplce[3], ylookup[y1ve[3]] + 3 + p.position, p);
                        continue;
                    }

                    if (u4 > y1ve[0])
                        vplce[0] = prevlineasm1(vince[0], palookupoffse[0], u4 - y1ve[0] - 1, vplce[0], tiles[globalpicnum].data, bufplce[0], ylookup[y1ve[0]] + 0 + p.position, p);
                    if (u4 > y1ve[1])
                        vplce[1] = prevlineasm1(vince[1], palookupoffse[1], u4 - y1ve[1] - 1, vplce[1], tiles[globalpicnum].data, bufplce[1], ylookup[y1ve[1]] + 1 + p.position, p);
                    if (u4 > y1ve[2])
                        vplce[2] = prevlineasm1(vince[2], palookupoffse[2], u4 - y1ve[2] - 1, vplce[2], tiles[globalpicnum].data, bufplce[2], ylookup[y1ve[2]] + 2 + p.position, p);
                    if (u4 > y1ve[3])
                        vplce[3] = prevlineasm1(vince[3], palookupoffse[3], u4 - y1ve[3] - 1, vplce[3], tiles[globalpicnum].data, bufplce[3], ylookup[y1ve[3]] + 3 + p.position, p);

                    //printf("doRotateSprite x:%i, d4: %i, u4: %i\n", x, d4, u4);
                    if (d4 >= u4) {
                        vlineasm4(d4 - u4 + 1, bufplc, ylookup[u4], p);
                    }

                    i = p.position + ylookup[d4 + 1];
                    if (y2ve[0] > d4)
                        prevlineasm1(vince[0], palookupoffse[0], y2ve[0] - d4 - 1, vplce[0], tiles[globalpicnum].data, bufplce[0], i + 0, p);
                    if (y2ve[1] > d4)
                        prevlineasm1(vince[1], palookupoffse[1], y2ve[1] - d4 - 1, vplce[1], tiles[globalpicnum].data, bufplce[1], i + 1, p);
                    if (y2ve[2] > d4)
                        prevlineasm1(vince[2], palookupoffse[2], y2ve[2] - d4 - 1, vplce[2], tiles[globalpicnum].data, bufplce[2], i + 2, p);
                    if (y2ve[3] > d4)
                        prevlineasm1(vince[3], palookupoffse[3], y2ve[3] - d4 - 1, vplce[3], tiles[globalpicnum].data, bufplce[3], i + 3, p);
                }
                else {
                    //printf("doRotateSprite bad == %i && x == %i && d4 == %i && u4 == %i\n", bad, x, d4, u4);
                    if ((bad != 0) || (u4 >= d4)) {
                        if (!(bad & 1)) mvlineasm1(vince[0], palookupoffse[0], y2ve[0] - y1ve[0], vplce[0], bufplc, bufplce[0], ylookup[y1ve[0]] + 0, p);
                        if (!(bad & 2)) mvlineasm1(vince[1], palookupoffse[1], y2ve[1] - y1ve[1], vplce[1], bufplc, bufplce[1], ylookup[y1ve[1]] + 1, p);
                        if (!(bad & 4)) mvlineasm1(vince[2], palookupoffse[2], y2ve[2] - y1ve[2], vplce[2], bufplc, bufplce[2], ylookup[y1ve[2]] + 2, p);
                        if (!(bad & 8)) mvlineasm1(vince[3], palookupoffse[3], y2ve[3] - y1ve[3], vplce[3], bufplc, bufplce[3], ylookup[y1ve[3]] + 3, p);
                        continue;
                    }

                    if (u4 > y1ve[0]) vplce[0] = mvlineasm1(vince[0], palookupoffse[0], u4 - y1ve[0] - 1, vplce[0], bufplce[0], ylookup[y1ve[0]] + 0, p);
                    if (u4 > y1ve[1]) vplce[1] = mvlineasm1(vince[1], palookupoffse[1], u4 - y1ve[1] - 1, vplce[1], bufplce[1], ylookup[y1ve[1]] + 1, p);
                    if (u4 > y1ve[2]) vplce[2] = mvlineasm1(vince[2], palookupoffse[2], u4 - y1ve[2] - 1, vplce[2], bufplce[2], ylookup[y1ve[2]] + 2, p);
                    if (u4 > y1ve[3]) vplce[3] = mvlineasm1(vince[3], palookupoffse[3], u4 - y1ve[3] - 1, vplce[3], bufplce[3], ylookup[y1ve[3]] + 3, p);

                    if (d4 >= u4) mvlineasm4(d4 - u4 + 1, bufplc.array, ylookup[u4] + p.position, p);

                    i = p.position + ylookup[d4 + 1];
                    if (y2ve[0] > d4) mvlineasm1(vince[0], palookupoffse[0], y2ve[0] - d4 - 1, vplce[0], bufplce[0], i + 0, p);
                    if (y2ve[1] > d4) mvlineasm1(vince[1], palookupoffse[1], y2ve[1] - d4 - 1, vplce[1], bufplce[1], i + 1, p);
                    if (y2ve[2] > d4) mvlineasm1(vince[2], palookupoffse[2], y2ve[2] - d4 - 1, vplce[2], bufplce[2], i + 2, p);
                    if (y2ve[3] > d4) mvlineasm1(vince[3], palookupoffse[3], y2ve[3] - d4 - 1, vplce[3], bufplce[3], i + 3, p);
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

            p = new PointerHelper(frameplace.array, ylookup[y1] + x);

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


//4468
function clipinsidebox( x,  y,  wallnum,  walldist)
{
    var wal;
    var x1, y1, x2, y2, r;

    r = (walldist<<1);
    wal = wall[wallnum];
    x1 = wal.x+walldist-x;
    y1 = wal.y+walldist-y;
    wal = wall[wal.point2];
    x2 = wal.x+walldist-x;
    y2 = wal.y+walldist-y;

    if ((x1 < 0) && (x2 < 0)) return(0);
    if ((y1 < 0) && (y2 < 0)) return(0);
    if ((x1 >= r) && (x2 >= r)) return(0);
    if ((y1 >= r) && (y2 >= r)) return(0);

    x2 -= x1;
    y2 -= y1;
    if (x2*(walldist-y1) >= y2*(walldist-x1))  /* Front */
    {
        if (x2 > 0) x2 *= (0-y1);
        else x2 *= (r-y1);
        if (y2 > 0) y2 *= (r-x1);
        else y2 *= (0-x1);
        return(x2 < y2);
    }
    if (x2 > 0) x2 *= (r-y1);
    else x2 *= (0-y1);
    if (y2 > 0) y2 *= (0-x1);
    else y2 *= (r-x1);
    return((x2 >= y2)<<1);
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
    return wallCrossed >>> 31;
}

//4688
function getangle(xvect, yvect) {
    if ((xvect | yvect) == 0)
        return (0);
    if (xvect == 0)
        return (512 + ((yvect < 0) << 10));
    if (yvect == 0)
        return (((xvect < 0) << 10));
    if (xvect == yvect)
        return (256 + ((xvect < 0) << 10));
    if (xvect == -yvect)
        return (768 + ((xvect > 0) << 10));
    if (klabs(xvect) > klabs(yvect))
        return (((radarang[640 + scale(160, yvect, xvect)] >> 6) + ((xvect < 0) << 10)) & 2047);

    return (((radarang[640 - scale(160, xvect, yvect)] >> 6) + 512 + ((yvect < 0) << 10)) & 2047);
}


//4707
function ksqrt(num) {
    return (nsqrtasm(num));
}

//4762

function drawmaskwall(damaskwallcnt) {
    var i, j, k, x, z, sectnum, z1, z2, lx, rx;
    var sec, nsec;
    var wal;

    //Retrive pvWall ID.
    z = maskwall[damaskwallcnt];
    
    //Retrive world wall ID.
    wal = wall[pvWalls[z].worldWallId];
    
    //Retrive sector ID
    sectnum = pvWalls[z].sectorId;
    
    //Retrive sector.
    sec = sector[sectnum];
    
    //Retrive next sector.
    nsec = sector[wal.nextsector];
    
    z1 = Math.max(nsec.ceilingz,sec.ceilingz);
    z2 = Math.min(nsec.floorz,sec.floorz);

    wallmost(uwall,z,sectnum,0);
    wallmost(uplc,z,wal.nextsector,0);
    for(x=pvWalls[z].screenSpaceCoo[0][VEC_COL]; x<=pvWalls[z].screenSpaceCoo[1][VEC_COL]; x++)
        if (uplc[x] > uwall[x])
            uwall[x] = uplc[x];
    
    wallmost(dwall,z,sectnum,1);
    wallmost(dplc,z,wal.nextsector,1);
    for(x=pvWalls[z].screenSpaceCoo[0][VEC_COL]; x<=pvWalls[z].screenSpaceCoo[1][VEC_COL]; x++)
        if (dplc[x] < dwall[x])
            dwall[x] = dplc[x];
    
    
    prepwall(z,wal);

    globalorientation = wal.cstat;
    globalpicnum = wal.overpicnum;
    if (globalpicnum >= MAXTILES)
    globalpicnum = 0;
    globalxpanning = wal.xpanning;
    globalypanning = wal.ypanning;
    
    if (tiles[globalpicnum].animFlags&192)
        globalpicnum += animateoffs(globalpicnum);
    
    globalshade = wal.shade;
    globvis = globalvisibility;
    if (sec.visibility != 0)
        globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));
    globalpal = wal.pal;
    globalshiftval = (picsiz[globalpicnum]>>4);
    if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height)
        globalshiftval++;
    
    globalshiftval = 32-globalshiftval;
    globalyscale = (wal.yrepeat<<(globalshiftval-19));
    if ((globalorientation&4) == 0)
        globalzd = (((globalposz-z1)*globalyscale)<<8);
    else
        globalzd = (((globalposz-z2)*globalyscale)<<8);
    globalzd += (globalypanning<<24);
    if (globalorientation&256) globalyscale = -globalyscale, globalzd = -globalzd;

    for(i=smostwallcnt-1; i>=0; i--)
    {
        j = smostwall[i];
        if ((pvWalls[j].screenSpaceCoo[0][VEC_COL] > pvWalls[z].screenSpaceCoo[1][VEC_COL]) || (pvWalls[j].screenSpaceCoo[1][VEC_COL] < pvWalls[z].screenSpaceCoo[0][VEC_COL])) continue;
        if (wallfront(j,z)) continue;

        lx = Math.max(pvWalls[j].screenSpaceCoo[0][VEC_COL],pvWalls[z].screenSpaceCoo[0][VEC_COL]);
        rx = Math.min(pvWalls[j].screenSpaceCoo[1][VEC_COL],pvWalls[z].screenSpaceCoo[1][VEC_COL]);

        switch(smostwalltype[i])
        {
            case 0:
                if (lx <= rx)
                {
                    if ((lx == pvWalls[z].screenSpaceCoo[0][VEC_COL]) && (rx == pvWalls[z].screenSpaceCoo[1][VEC_COL])) return;
                    clearbufbyte(dwall,lx,(rx-lx+1)*2,0);
                }
                break;
            case 1:
                k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                for(x=lx; x<=rx; x++)
                    if (smost[k+x] > uwall[x]) uwall[x] = smost[k+x];
                break;
            case 2:
                k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                for(x=lx; x<=rx; x++)
                    if (smost[k+x] < dwall[x]) dwall[x] = smost[k+x];
                break;
        }
    }

    /* maskwall */
    if ((searchit >= 1) && (searchx >= pvWalls[z].screenSpaceCoo[0][VEC_COL]) && (searchx <= pvWalls[z].screenSpaceCoo[1][VEC_COL]))
        if ((searchy >= uwall[searchx]) && (searchy <= dwall[searchx]))
        {
            searchsector = sectnum;
            searchwall = pvWalls[z].worldWallId;
            searchstat = 4;
            searchit = 1;
        }

    if ((globalorientation&128) == 0)
        maskwallscan(pvWalls[z].screenSpaceCoo[0][VEC_COL],pvWalls[z].screenSpaceCoo[1][VEC_COL],uwall,dwall,swall,lwall);
    else
    {
        if (globalorientation&128)
        {
            if (globalorientation&512) 
                settrans(TRANS_REVERSE);
            else 
                settrans(TRANS_NORMAL);
        }
        transmaskwallscan(pvWalls[z].screenSpaceCoo[0][VEC_COL],pvWalls[z].screenSpaceCoo[1][VEC_COL]);
    }
}


//4957
function drawsprite (snum) {
    var tspr;
    var sec;
    var startum, startdm, sectnum, xb, yp, cstat;
    var siz, xsiz, ysiz, xoff, yoff;
    var spriteDim = new Dimensions();
    var x1, y1, x2, y2, lx, rx, dalx2, darx2, i, j, k, x, linum, linuminc;
    var yinc, z, z1, z2, xp1, yp1, xp2, yp2;
    var xv, yv, top, topinc, bot, botinc, hplc, hinc;
    var cosang, sinang, dax, day, lpoint, lmax, rpoint, rmax, dax1, dax2, y;
    var npoints, npoints2, zz, t, zsgn, zzsgn;
    var tilenum, spritenum;
    var  swapped, daclip;

    tspr = tspriteptr[snum];

    printf("drawsprite: %i \n", snum);
    xb = spritesx[snum];
    yp = spritesy[snum];
    tilenum = tspr.picnum;
    spritenum = tspr.owner;
    cstat = tspr.cstat;

    if ((cstat&48) != 48)
    {
        if (tiles[tilenum].animFlags&192)
            tilenum += animateoffs(tilenum);
        
        if ((tiles[tilenum].dim.width <= 0) || (tiles[tilenum].dim.height <= 0) || (spritenum < 0))
            return;
    }
    if ((tspr.xrepeat <= 0) || (tspr.yrepeat <= 0)) return;

    sectnum = tspr.sectnum;
    sec = sector[sectnum];
    globalpal = tspr.pal;
    // FIX_00088: crash on maps using a bad palette index (like the end of roch3.map)
    if (!palookup[globalpal])
        globalpal = 0; // seem to crash when globalpal > 25
    globalshade = tspr.shade;
    if (cstat&2)
    {

        if (cstat&512) 
            settrans(TRANS_REVERSE);
        else 
            settrans(TRANS_NORMAL);
    }

    xoff = (toInt8((tiles[tilenum].animFlags>>8)&255))+(tspr.xoffset);
    yoff = (toInt8((tiles[tilenum].animFlags>>16)&255))+(tspr.yoffset);

    if ((cstat&48) == 0)
    {
        if (yp <= (4<<8))
            return;

        siz = divscale19(xdimenscale,yp);

        xv = mulscale16((tspr.xrepeat)<<16,xyaspect);

        spriteDim.width = tiles[tilenum].dim.width;
        spriteDim.height = tiles[tilenum].dim.height;
        
        xsiz = mulscale30(siz,xv * spriteDim.width);
        ysiz = mulscale14(siz,tspr.yrepeat * spriteDim.height);

        if (((tiles[tilenum].dim.width>>11) >= xsiz) || (spriteDim.height >= (ysiz>>1)))
            return;  /* Watch out for divscale overflow */

        x1 = xb-(xsiz>>1);
        if (spriteDim.width & 1)
            x1 += mulscale31(siz,xv);  /* Odd xspans */
        i = mulscale30(siz,xv*xoff);
        if ((cstat&4) == 0)
            x1 -= i;
        else
            x1 += i;

        y1 = mulscale16(tspr.z-globalposz,siz);
        y1 -= mulscale14(siz,tspr.yrepeat*yoff);
        y1 += (globalhoriz<<8)-ysiz;
        if (cstat&128)
        {
            y1 += (ysiz>>1);
            if (spriteDim.height&1) y1 += mulscale15(siz,tspr.yrepeat);  /* Odd yspans */
        }

        x2 = x1+xsiz-1;
        y2 = y1+ysiz-1;
        if ((y1|255) >= (y2|255)) return;

        lx = (x1>>8)+1;
        if (lx < 0) lx = 0;
        rx = (x2>>8);
        if (rx >= xdimen) rx = xdimen-1;
        if (lx > rx) return;

        yinc = divscale32(spriteDim.height,ysiz);

        if ((sec.ceilingstat&3) == 0)
            startum = globalhoriz+mulscale24(siz,sec.ceilingz-globalposz)-1;
        else
            startum = 0;
        
        if ((sec.floorstat&3) == 0)
            startdm = globalhoriz+mulscale24(siz,sec.floorz-globalposz)+1;
        else
            startdm = 0x7fffffff;
        
        if ((y1>>8) > startum) startum = (y1>>8);
        if ((y2>>8) < startdm) startdm = (y2>>8);

        if (startum < -32768) startum = -32768;
        if (startdm > 32767) startdm = 32767;
        if (startum >= startdm) return;

        if ((cstat&4) == 0)
        {
            linuminc = divscale24(spriteDim.width,xsiz);
            linum = mulscale8((lx<<8)-x1,linuminc);
        }
        else
        {
            linuminc = -divscale24(spriteDim.width,xsiz);
            linum = mulscale8((lx<<8)-x2,linuminc);
        }
        if ((cstat&8) > 0)
        {
            yinc = -yinc;
            i = y1;
            y1 = y2;
            y2 = i;
        }

        for(x=lx; x<=rx; x++)
        {
            uwall[x] = Math.max(startumost[x+windowx1]-windowy1,toInt16(startum));
            dwall[x] = Math.min(startdmost[x+windowx1]-windowy1,toInt16(startdm));
            //printf("first x: %i, uwall[x]: %i dwall[x]: %i\n", x, uwall[x], dwall[x]);
        }
        daclip = 0;
        for(i=smostwallcnt-1; i>=0; i--)
        {
            if (smostwalltype[i]&daclip)
                continue;
            
            j = smostwall[i];
            if ((pvWalls[j].screenSpaceCoo[0][VEC_COL] > rx) || (pvWalls[j].screenSpaceCoo[1][VEC_COL] < lx))
                continue;
            
            if ((yp <= pvWalls[j].screenSpaceCoo[0][VEC_DIST]) && (yp <= pvWalls[j].screenSpaceCoo[1][VEC_DIST]))
                continue;
            
            if (spritewallfront(tspr,pvWalls[j].worldWallId) && ((yp <= pvWalls[j].screenSpaceCoo[0][VEC_DIST]) || (yp <= pvWalls[j].screenSpaceCoo[1][VEC_DIST])))
                continue;

            dalx2 = Math.max(pvWalls[j].screenSpaceCoo[0][VEC_COL],lx);
            darx2 = Math.min(pvWalls[j].screenSpaceCoo[1][VEC_COL],rx);

            switch(smostwalltype[i])
            {
                case 0:
                    if (dalx2 <= darx2)
                    {
                        if ((dalx2 == lx) && (darx2 == rx))
                            return;
                        clearbufbyte(dwall, dalx2,(darx2-dalx2+1)*2,0);
                    }
                    break;
                case 1:
                    k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                    for(x=dalx2; x<=darx2; x++)
                        if (smost[k+x] > uwall[x]) uwall[x] = smost[k+x];
                    if ((dalx2 == lx) && (darx2 == rx)) daclip |= 1;
                    break;
                case 2:
                    k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                    for(x=dalx2; x<=darx2; x++)
                        if (smost[k+x] < dwall[x]) dwall[x] = smost[k+x];
                    if ((dalx2 == lx) && (darx2 == rx)) daclip |= 2;
                    break;
            }
        }

        if (uwall[rx] >= dwall[rx])
        {
            for (x = lx; x < rx; x++) {
                //printf("x: %i, uwall[x]: %i dwall[x]: %i\n", x,uwall[x], dwall[x]);
                if (uwall[x] < dwall[x])
                    break;
            }
            if (x == rx)
                return;
        }

        /* sprite */
        if ((searchit >= 1) && (searchx >= lx) && (searchx <= rx))
            if ((searchy >= uwall[searchx]) && (searchy < dwall[searchx]))
            {
                searchsector = sectnum;
                searchwall = spritenum;
                searchstat = 3;
                searchit = 1;
            }

        z2 = tspr.z - ((yoff * tspr.yrepeat) << 2);
        //printf("z2: %i\n", z2);
        if (cstat&128)
        {
            z2 += ((spriteDim.height*tspr.yrepeat)<<1);
            if (spriteDim.height&1) z2 += (tspr.yrepeat<<1);        /* Odd yspans */
        }
        z1 = z2 - ((spriteDim.height*tspr.yrepeat)<<2);

        globalorientation = 0;
        globalpicnum = tilenum;
        if (globalpicnum >= MAXTILES) globalpicnum = 0;
        globalxpanning = 0;
        globalypanning = 0;
        globvis = globalvisibility;
        if (sec.visibility != 0) globvis = mulscale4(globvis,toUint8(sec.visibility+16));
        globalshiftval = (picsiz[globalpicnum]>>4);
        if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height)
            globalshiftval++;
        
        globalshiftval = 32-globalshiftval;
        globalyscale = divscale(512,tspr.yrepeat,globalshiftval-19);
        globalzd = (((globalposz-z1)*globalyscale)<<8);
        if ((cstat&8) > 0)
        {
            globalyscale = -globalyscale;
            globalzd = (((globalposz-z2)*globalyscale)<<8);
        }

        //printf("rx: %i, lx: %i, linum: %i, linuminc: %i\n", rx, lx, linum, linuminc);
        qinterpolatedown16(lwall, lx, rx - lx + 1, linum, linuminc);
        clearbuf(swall, lx, rx - lx + 1, mulscale19(yp, xdimscale));

        if ((cstat&2) == 0)
            maskwallscan(lx,rx,uwall,dwall,swall,lwall);
        else
            transmaskwallscan(lx,rx);
    }
    else if ((cstat&48) == 16)
    {
        if ((cstat&4) > 0) xoff = -xoff;
        if ((cstat&8) > 0) yoff = -yoff;

        spriteDim.width = tiles[tilenum].dim.width;
        spriteDim.height = tiles[tilenum].dim.height;
        
        xv = tspr.xrepeat*sintable[(tspr.ang+2560+1536)&2047];
        yv = tspr.xrepeat*sintable[(tspr.ang+2048+1536)&2047];
        i = (spriteDim.width >>1)+xoff;
        x1 = tspr.x-globalposx-mulscale16(xv,i);
        x2 = x1+mulscale16(xv,spriteDim.width );
        y1 = tspr.y-globalposy-mulscale16(yv,i);
        y2 = y1+mulscale16(yv,spriteDim.width );

        yp1 = dmulscale6(x1,cosviewingrangeglobalang,y1,sinviewingrangeglobalang);
        yp2 = dmulscale6(x2,cosviewingrangeglobalang,y2,sinviewingrangeglobalang);
        if ((yp1 <= 0) && (yp2 <= 0)) return;
        xp1 = dmulscale6(y1,cosglobalang,-x1,singlobalang);
        xp2 = dmulscale6(y2,cosglobalang,-x2,singlobalang);

        x1 += globalposx;
        y1 += globalposy;
        x2 += globalposx;
        y2 += globalposy;

        swapped = 0;
        if (dmulscale32(xp1,yp2,-xp2,yp1) >= 0)  /* If wall's NOT facing you */
        {
            if ((cstat&64) != 0) return;
            i = xp1, xp1 = xp2, xp2 = i;
            i = yp1, yp1 = yp2, yp2 = i;
            i = x1, x1 = x2, x2 = i;
            i = y1, y1 = y2, y2 = i;
            swapped = 1;
        }

        if (xp1 >= -yp1)
        {
            if (xp1 > yp1) return;

            if (yp1 == 0) return;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL] = halfxdimen + scale(xp1,halfxdimen,yp1);
            if (xp1 >= 0) pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]++;   /* Fix for SIGNED divide */
            if (pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL] >= xdimen) pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL] = xdimen-1;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_DIST] = yp1;
        }
        else
        {
            if (xp2 < -yp2) return;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL] = 0;
            i = yp1-yp2+xp1-xp2;
            if (i == 0) return;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_DIST] = yp1 + scale(yp2-yp1,xp1+yp1,i);
        }
        if (xp2 <= yp2)
        {
            if (xp2 < -yp2) return;

            if (yp2 == 0) return;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL] = halfxdimen + scale(xp2,halfxdimen,yp2) - 1;
            if (xp2 >= 0) pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]++;   /* Fix for SIGNED divide */
            if (pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL] >= xdimen) pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL] = xdimen-1;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_DIST] = yp2;
        }
        else
        {
            if (xp1 > yp1) return;

            pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL] = xdimen-1;
            i = xp2-xp1+yp1-yp2;
            if (i == 0) return;
            pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_DIST] = yp1 + scale(yp2-yp1,yp1-xp1,i);
        }

        if ((pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_DIST] < 256) || (pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_DIST] < 256) || (pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL] > pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]))
            return;

        topinc = -mulscale10(yp1,spriteDim.width);
        top = (((mulscale10(xp1,xdimen) - mulscale9(pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]-halfxdimen,yp1))*spriteDim.width)>>3);
        botinc = ((yp2-yp1)>>8);
        bot = mulscale11(xp1-xp2,xdimen) + mulscale2(pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]-halfxdimen,botinc);

        j = pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]+3;
        z = mulscale20(top,krecipasm(bot));
        lwall[pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]] = (z>>8);
        for(x=pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]+4; x<=j; x+=4)
        {
            top += topinc;
            bot += botinc;
            zz = z;
            z = mulscale20(top,krecipasm(bot));
            lwall[x] = (z>>8);
            i = ((z+zz)>>1);
            lwall[x-2] = (i>>8);
            lwall[x-3] = ((i+zz)>>9);
            lwall[x-1] = ((i+z)>>9);
        }

        if (lwall[pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]] < 0) lwall[pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]] = 0;
        if (lwall[pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]] >= spriteDim.width) lwall[pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]] = spriteDim.width-1;

        if ((swapped^((cstat&4)>0)) > 0)
        {
            j = spriteDim.width-1;
            for(x=pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]; x<=pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]; x++)
                lwall[x] = j-lwall[x];
        }

        pvWalls[MAXWALLSB-1].cameraSpaceCoo[0][VEC_X] = xp1 ;
        pvWalls[MAXWALLSB-1].cameraSpaceCoo[0][VEC_Y] = yp1 ;
        pvWalls[MAXWALLSB-1].cameraSpaceCoo[1][VEC_X] = xp2 ;
        pvWalls[MAXWALLSB-1].cameraSpaceCoo[1][VEC_Y] = yp2 ;

        
        hplc = divscale19(xdimenscale,pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_DIST]);
        hinc = divscale19(xdimenscale,pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_DIST]);
        hinc = ((hinc-hplc)/(pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]-pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]+1))|0;

        z2 = tspr.z - ((yoff*tspr.yrepeat)<<2);
        if (cstat&128)
        {
            z2 += ((spriteDim.height*tspr.yrepeat)<<1);
            if (spriteDim.height&1) z2 += (tspr.yrepeat<<1);        /* Odd yspans */
        }
        z1 = z2 - ((spriteDim.height*tspr.yrepeat)<<2);

        globalorientation = 0;
        globalpicnum = tilenum;
        if (globalpicnum >= MAXTILES) globalpicnum = 0;
        globalxpanning = 0;
        globalypanning = 0;
        globvis = globalvisibility;
        if (sec.visibility != 0) globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));
        globalshiftval = (picsiz[globalpicnum]>>4);
        if (pow2long[globalshiftval] != tiles[globalpicnum].dim.height) globalshiftval++;
        globalshiftval = 32-globalshiftval;
        globalyscale = divscale(512,tspr.yrepeat,globalshiftval-19);
        globalzd = (((globalposz-z1)*globalyscale)<<8);
        if ((cstat&8) > 0)
        {
            globalyscale = -globalyscale;
            globalzd = (((globalposz-z2)*globalyscale)<<8);
        }

        if (((sec.ceilingstat&1) == 0) && (z1 < sec.ceilingz))
            z1 = sec.ceilingz;
        if (((sec.floorstat&1) == 0) && (z2 > sec.floorz))
            z2 = sec.floorz;

        owallmost(uwall,(MAXWALLSB-1),z1-globalposz);
        owallmost(dwall,(MAXWALLSB-1),z2-globalposz);
        for(i=pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]; i<=pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]; i++)
        {
            swall[i] = (krecipasm(hplc)<<2);
            hplc += hinc;
        }

        for(i=smostwallcnt-1; i>=0; i--)
        {
            j = smostwall[i];

            if ((pvWalls[j].screenSpaceCoo[0][VEC_COL] > pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]) || (pvWalls[j].screenSpaceCoo[1][VEC_COL] < pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL])) continue;

            dalx2 = pvWalls[j].screenSpaceCoo[0][VEC_COL];
            darx2 = pvWalls[j].screenSpaceCoo[1][VEC_COL];
            if (Math.max(pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_DIST],pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_DIST]) > Math.min(pvWalls[j].screenSpaceCoo[0][VEC_DIST],pvWalls[j].screenSpaceCoo[1][VEC_DIST]))
            {
                if (Math.min(pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_DIST],pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_DIST]) > Math.max(pvWalls[j].screenSpaceCoo[0][VEC_DIST],pvWalls[j].screenSpaceCoo[1][VEC_DIST]))
                {
                    x = 0x80000000;
                }
                else
                {
                    x = pvWalls[j].worldWallId;
                    xp1 = wall[x].x;
                    yp1 = wall[x].y;
                    x = wall[x].point2;
                    xp2 = wall[x].x;
                    yp2 = wall[x].y;

                    z1 = (xp2-xp1)*(y1-yp1) - (yp2-yp1)*(x1-xp1);
                    z2 = (xp2-xp1)*(y2-yp1) - (yp2-yp1)*(x2-xp1);
                    if ((z1^z2) >= 0)
                        x = (z1+z2);
                    else
                    {
                        z1 = (x2-x1)*(yp1-y1) - (y2-y1)*(xp1-x1);
                        z2 = (x2-x1)*(yp2-y1) - (y2-y1)*(xp2-x1);

                        if ((z1^z2) >= 0)
                            x = -(z1+z2);
                        else
                        {
                            if ((xp2-xp1)*(tspr.y-yp1) == (tspr.x-xp1)*(yp2-yp1))
                            {
                                if (wall[pvWalls[j].worldWallId].nextsector == tspr.sectnum)
                                    x = 0x80000000;
                                else
                                    x = 0x7fffffff;
                            }
                            else
                            {   /* INTERSECTION! */
                                x = (xp1-globalposx) + scale(xp2-xp1,z1,z1-z2);
                                y = (yp1-globalposy) + scale(yp2-yp1,z1,z1-z2);

                                yp1 = dmulscale14(x,cosglobalang,y,singlobalang);
                                if (yp1 > 0)
                                {
                                    xp1 = dmulscale14(y,cosglobalang,-x,singlobalang);

                                    x = halfxdimen + scale(xp1,halfxdimen,yp1);
                                    if (xp1 >= 0) x++;   /* Fix for SIGNED divide */

                                    if (z1 < 0)
                                    {
                                        if (dalx2 < x) dalx2 = x;
                                    }
                                    else
                                    {
                                        if (darx2 > x) darx2 = x;
                                    }
                                    x = 0x80000001;
                                }
                                else
                                    x = 0x7fffffff;
                            }
                        }
                    }
                }
                if (x < 0)
                {
                    if (dalx2 < pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]) dalx2 = pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL];
                    if (darx2 > pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]) darx2 = pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL];
                    switch(smostwalltype[i])
                    {
                        case 0:
                            if (dalx2 <= darx2)
                            {
                                if ((dalx2 == pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]) && (darx2 == pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL])) return;
                                clearbufbyte(dwall[dalx2],(darx2-dalx2+1)*sizeof(dwall[0]),0);
                            }
                            break;
                        case 1:
                            k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                            for(x=dalx2; x<=darx2; x++)
                                if (smost[k+x] > uwall[x]) uwall[x] = smost[k+x];
                            break;
                        case 2:
                            k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                            for(x=dalx2; x<=darx2; x++)
                                if (smost[k+x] < dwall[x]) dwall[x] = smost[k+x];
                            break;
                    }
                }
            }
        }

        /* sprite */
        if ((searchit >= 1) && (searchx >= pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL]) && (searchx <= pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]))
            if ((searchy >= uwall[searchx]) && (searchy <= dwall[searchx]))
            {
                searchsector = sectnum;
                searchwall = spritenum;
                searchstat = 3;
                searchit = 1;
            }

        if ((cstat&2) == 0)
            maskwallscan(pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL],pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL],uwall,dwall,swall,lwall);
        else
            transmaskwallscan(pvWalls[MAXWALLSB-1].screenSpaceCoo[0][VEC_COL],pvWalls[MAXWALLSB-1].screenSpaceCoo[1][VEC_COL]);
    }
    else if ((cstat&48) == 32)
    {
        if ((cstat&64) != 0)
            if ((globalposz > tspr.z) == ((cstat&8)==0))
                return;

        if ((cstat&4) > 0) xoff = -xoff;
        if ((cstat&8) > 0) yoff = -yoff;
        spriteDim.width = tiles[tilenum].dim.width;
        spriteDim.height = tiles[tilenum].dim.height;

        /* Rotate center point */
        dax = tspr.x-globalposx;
        day = tspr.y-globalposy;
        rzi[0] = dmulscale10(cosglobalang,dax,singlobalang,day);
        rxi[0] = dmulscale10(cosglobalang,day,-singlobalang,dax);

        /* Get top-left corner */
        i = ((tspr.ang+2048-globalang)&2047);
        cosang = sintable[(i+512)&2047];
        sinang = sintable[i];
        dax = ((spriteDim.width>>1)+xoff)*tspr.xrepeat;
        day = ((spriteDim.height>>1)+yoff)*tspr.yrepeat;
        rzi[0] += dmulscale12(sinang,dax,cosang,day);
        rxi[0] += dmulscale12(sinang,day,-cosang,dax);

        /* Get other 3 corners */
        dax = spriteDim.width*tspr.xrepeat;
        day = spriteDim.height*tspr.yrepeat;
        rzi[1] = rzi[0]-mulscale12(sinang,dax);
        rxi[1] = rxi[0]+mulscale12(cosang,dax);
        dax = -mulscale12(cosang,day);
        day = -mulscale12(sinang,day);
        rzi[2] = rzi[1]+dax;
        rxi[2] = rxi[1]+day;
        rzi[3] = rzi[0]+dax;
        rxi[3] = rxi[0]+day;

        /* Put all points on same z */
        ryi[0] = scale((tspr.z-globalposz),yxaspect,320<<8);
        if (ryi[0] == 0) return;
        ryi[1] = ryi[2] = ryi[3] = ryi[0];

        if ((cstat&4) == 0)
        {
            z = 0;
            z1 = 1;
            z2 = 3;
        }
        else
        {
            z = 1;
            z1 = 0;
            z2 = 2;
        }

        dax = rzi[z1]-rzi[z];
        day = rxi[z1]-rxi[z];
        bot = dmulscale8(dax,dax,day,day);
        if (((klabs(dax)>>13) >= bot) || ((klabs(day)>>13) >= bot)) return;
        globalx1 = divscale18(dax,bot);
        globalx2 = divscale18(day,bot);

        dax = rzi[z2]-rzi[z];
        day = rxi[z2]-rxi[z];
        bot = dmulscale8(dax,dax,day,day);
        if (((klabs(dax)>>13) >= bot) || ((klabs(day)>>13) >= bot)) return;
        globaly1 = divscale18(dax,bot);
        globaly2 = divscale18(day,bot);

        /* Calculate globals for hline texture mapping function */
        globalxpanning = (rxi[z]<<12);
        globalypanning = (rzi[z]<<12);
        globalzd = (ryi[z]<<12);

        rzi[0] = mulscale16(rzi[0],viewingrange);
        rzi[1] = mulscale16(rzi[1],viewingrange);
        rzi[2] = mulscale16(rzi[2],viewingrange);
        rzi[3] = mulscale16(rzi[3],viewingrange);

        if (ryi[0] < 0)   /* If ceilsprite is above you, reverse order of points */
        {
            i = rxi[1];
            rxi[1] = rxi[3];
            rxi[3] = i;
            i = rzi[1];
            rzi[1] = rzi[3];
            rzi[3] = i;
        }


        /* Clip polygon in 3-space */
        npoints = 4;

        /* Clip edge 1 */
        npoints2 = 0;
        zzsgn = rxi[0]+rzi[0];
        for(z=0; z<npoints; z++)
        {
            zz = z+1;
            if (zz == npoints) zz = 0;
            zsgn = zzsgn;
            zzsgn = rxi[zz]+rzi[zz];
            if (zsgn >= 0)
            {
                rxi2[npoints2] = rxi[z];
                ryi2[npoints2] = ryi[z];
                rzi2[npoints2] = rzi[z];
                npoints2++;
            }
            if ((zsgn^zzsgn) < 0)
            {
                t = divscale30(zsgn,zsgn-zzsgn);
                rxi2[npoints2] = rxi[z] + mulscale30(t,rxi[zz]-rxi[z]);
                ryi2[npoints2] = ryi[z] + mulscale30(t,ryi[zz]-ryi[z]);
                rzi2[npoints2] = rzi[z] + mulscale30(t,rzi[zz]-rzi[z]);
                npoints2++;
            }
        }
        if (npoints2 <= 2) return;

        /* Clip edge 2 */
        npoints = 0;
        zzsgn = rxi2[0]-rzi2[0];
        for(z=0; z<npoints2; z++)
        {
            zz = z+1;
            if (zz == npoints2) zz = 0;
            zsgn = zzsgn;
            zzsgn = rxi2[zz]-rzi2[zz];
            if (zsgn <= 0)
            {
                rxi[npoints] = rxi2[z];
                ryi[npoints] = ryi2[z];
                rzi[npoints] = rzi2[z];
                npoints++;
            }
            if ((zsgn^zzsgn) < 0)
            {
                t = divscale30(zsgn,zsgn-zzsgn);
                rxi[npoints] = rxi2[z] + mulscale30(t,rxi2[zz]-rxi2[z]);
                ryi[npoints] = ryi2[z] + mulscale30(t,ryi2[zz]-ryi2[z]);
                rzi[npoints] = rzi2[z] + mulscale30(t,rzi2[zz]-rzi2[z]);
                npoints++;
            }
        }
        if (npoints <= 2) return;

        /* Clip edge 3 */
        npoints2 = 0;
        zzsgn = ryi[0]*halfxdimen + (rzi[0]*(globalhoriz-0));
        for(z=0; z<npoints; z++)
        {
            zz = z+1;
            if (zz == npoints) zz = 0;
            zsgn = zzsgn;
            zzsgn = ryi[zz]*halfxdimen + (rzi[zz]*(globalhoriz-0));
            if (zsgn >= 0)
            {
                rxi2[npoints2] = rxi[z];
                ryi2[npoints2] = ryi[z];
                rzi2[npoints2] = rzi[z];
                npoints2++;
            }
            if ((zsgn^zzsgn) < 0)
            {
                t = divscale30(zsgn,zsgn-zzsgn);
                rxi2[npoints2] = rxi[z] + mulscale30(t,rxi[zz]-rxi[z]);
                ryi2[npoints2] = ryi[z] + mulscale30(t,ryi[zz]-ryi[z]);
                rzi2[npoints2] = rzi[z] + mulscale30(t,rzi[zz]-rzi[z]);
                npoints2++;
            }
        }
        if (npoints2 <= 2) return;

        /* Clip edge 4 */
        npoints = 0;
        zzsgn = ryi2[0]*halfxdimen + (rzi2[0]*(globalhoriz-ydimen));
        for(z=0; z<npoints2; z++)
        {
            zz = z+1;
            if (zz == npoints2) zz = 0;
            zsgn = zzsgn;
            zzsgn = ryi2[zz]*halfxdimen + (rzi2[zz]*(globalhoriz-ydimen));
            if (zsgn <= 0)
            {
                rxi[npoints] = rxi2[z];
                ryi[npoints] = ryi2[z];
                rzi[npoints] = rzi2[z];
                npoints++;
            }
            if ((zsgn^zzsgn) < 0)
            {
                t = divscale30(zsgn,zsgn-zzsgn);
                rxi[npoints] = rxi2[z] + mulscale30(t,rxi2[zz]-rxi2[z]);
                ryi[npoints] = ryi2[z] + mulscale30(t,ryi2[zz]-ryi2[z]);
                rzi[npoints] = rzi2[z] + mulscale30(t,rzi2[zz]-rzi2[z]);
                npoints++;
            }
        }
        if (npoints <= 2) return;

        /* Project onto screen */
        lpoint = -1;
        lmax = 0x7fffffff;
        rpoint = -1;
        rmax = 0x80000000;
        for(z=0; z<npoints; z++)
        {
            xsi[z] = scale(rxi[z],xdimen<<15,rzi[z]) + (xdimen<<15);
            ysi[z] = scale(ryi[z],xdimen<<15,rzi[z]) + (globalhoriz<<16);
            if (xsi[z] < 0) xsi[z] = 0;
            if (xsi[z] > (xdimen<<16)) xsi[z] = (xdimen<<16);
            if (ysi[z] < (0<<16)) ysi[z] = (0<<16);
            if (ysi[z] > (ydimen<<16)) ysi[z] = (ydimen<<16);
            if (xsi[z] < lmax) lmax = xsi[z], lpoint = z;
            if (xsi[z] > rmax) rmax = xsi[z], rpoint = z;
        }

        /* Get uwall arrays */
        for(z=lpoint; z!=rpoint; z=zz)
        {
            zz = z+1;
            if (zz == npoints) zz = 0;

            dax1 = ((xsi[z]+65535)>>16);
            dax2 = ((xsi[zz]+65535)>>16);
            if (dax2 > dax1)
            {
                yinc = divscale16(ysi[zz]-ysi[z],xsi[zz]-xsi[z]);
                y = ysi[z] + mulscale16((dax1<<16)-xsi[z],yinc);
                throw "qinterpolatedown16short((int32_t *)(&uwall[dax1]),dax2-dax1,y,yinc);"
            }
        }

        /* Get dwall arrays */
        for(; z!=lpoint; z=zz)
        {
            zz = z+1;
            if (zz == npoints) zz = 0;

            dax1 = ((xsi[zz]+65535)>>16);
            dax2 = ((xsi[z]+65535)>>16);
            if (dax2 > dax1)
            {
                yinc = divscale16(ysi[zz]-ysi[z],xsi[zz]-xsi[z]);
                y = ysi[zz] + mulscale16((dax1<<16)-xsi[zz],yinc);
                throw "qinterpolatedown16short((int32_t *)(&dwall[dax1]),dax2-dax1,y,yinc)";
            }
        }


        lx = ((lmax+65535)>>16);
        rx = ((rmax+65535)>>16);
        for(x=lx; x<=rx; x++)
        {
            uwall[x] = Math.max(uwall[x],startumost[x+windowx1]-windowy1);
            dwall[x] = Math.min(dwall[x],startdmost[x+windowx1]-windowy1);
        }

        /* Additional uwall/dwall clipping goes here */
        for(i=smostwallcnt-1; i>=0; i--)
        {
            j = smostwall[i];
            if ((pvWalls[j].screenSpaceCoo[0][VEC_COL] > rx) || (pvWalls[j].screenSpaceCoo[1][VEC_COL] < lx)) continue;
            if ((yp <= pvWalls[j].screenSpaceCoo[0][VEC_DIST]) && (yp <= pvWalls[j].screenSpaceCoo[1][VEC_DIST])) continue;

            /* if (spritewallfront(tspr,thewall[j]) == 0) */
            x = pvWalls[j].worldWallId;
            xp1 = wall[x].x;
            yp1 = wall[x].y;
            x = wall[x].point2;
            xp2 = wall[x].x;
            yp2 = wall[x].y;
            x = (xp2-xp1)*(tspr.y-yp1)-(tspr.x-xp1)*(yp2-yp1);
            if ((yp > pvWalls[j].screenSpaceCoo[0][VEC_DIST]) && (yp > pvWalls[j].screenSpaceCoo[1][VEC_DIST])) x = -1;
            if ((x >= 0) && ((x != 0) || (wall[pvWalls[j].worldWallId].nextsector != tspr.sectnum))) continue;

            dalx2 = Math.max(pvWalls[j].screenSpaceCoo[0][VEC_COL],lx);
            darx2 = Math.min(pvWalls[j].screenSpaceCoo[1][VEC_COL],rx);

            switch(smostwalltype[i])
            {
                case 0:
                    if (dalx2 <= darx2)
                    {
                        if ((dalx2 == lx) && (darx2 == rx)) return;
                        clearbufbyte(dwall[dalx2],(darx2-dalx2+1)*sizeof(dwall[0]),0);
                    }
                    break;
                case 1:
                    k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                    for(x=dalx2; x<=darx2; x++)
                        if (smost[k+x] > uwall[x]) uwall[x] = smost[k+x];
                    break;
                case 2:
                    k = smoststart[i] - pvWalls[j].screenSpaceCoo[0][VEC_COL];
                    for(x=dalx2; x<=darx2; x++)
                        if (smost[k+x] < dwall[x]) dwall[x] = smost[k+x];
                    break;
            }
        }

        /* sprite */
        if ((searchit >= 1) && (searchx >= lx) && (searchx <= rx))
            if ((searchy >= uwall[searchx]) && (searchy <= dwall[searchx]))
            {
                searchsector = sectnum;
                searchwall = spritenum;
                searchstat = 3;
                searchit = 1;
            }

        globalorientation = cstat;
        globalpicnum = tilenum;
        if (globalpicnum >= MAXTILES)
        globalpicnum = 0;

        TILE_MakeAvailable(globalpicnum);
        
        setgotpic(globalpicnum);
        globalbufplc = tiles[globalpicnum].data;

        globvis = mulscale16(globalhisibility,viewingrange);
        if (sec.visibility != 0) globvis = mulscale4(globvis,(toUint8(sec.visibility+16)));

        x = picsiz[globalpicnum];
        y = ((x>>4)&15);
        x &= 15;
        if (pow2long[x] != spriteDim.width)
        {
            x++;
            globalx1 = mulscale(globalx1,spriteDim.width,x);
            globalx2 = mulscale(globalx2,spriteDim.width,x);
        }

        dax = globalxpanning;
        day = globalypanning;
        globalxpanning = -dmulscale6(globalx1,day,globalx2,dax);
        globalypanning = -dmulscale6(globaly1,day,globaly2,dax);

        globalx2 = mulscale16(globalx2,viewingrange);
        globaly2 = mulscale16(globaly2,viewingrange);
        globalzd = mulscale16(globalzd,viewingrangerecip);

        globalx1 = (globalx1-globalx2)*halfxdimen;
        globaly1 = (globaly1-globaly2)*halfxdimen;

        if ((cstat&2) == 0)
            msethlineshift(x,y);
        else
            tsethlineshift(x,y);

        /* Draw it! */
        ceilspritescan(lx,rx-1);
    }

    if (automapping == 1) show2dsprite[spritenum>>3] |= pow2char[spritenum&7];
}

//5930
function setsprite(spritenum, newx, newy, newz) {
    var tempsectnum;

    sprite[spritenum].x = newx;
    sprite[spritenum].y = newy;
    sprite[spritenum].z = newz;

    tempsectnum = new Ref(sprite[spritenum].sectnum);
    updatesector(newx, newy, tempsectnum);
    if (tempsectnum.$ < 0)
        return (-1);
    if (tempsectnum.$ != sprite[spritenum].sectnum)
        changespritesect(spritenum, tempsectnum.$);

    return (0);
}

//5949
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

//5981
Engine.insertSprite = function (sectNum, statNum) {
    Engine.insertSpriteStat(statNum);
    return Engine.insertSpriteSect(sectNum);
};

//5988
Engine.insertSpriteSect = function (sectnum) {
    var blanktouse;

    if ((sectnum >= MAXSECTORS) || (headspritesect[MAXSECTORS] == -1)) {
        return -1; /* list full */
    }

    blanktouse = headspritesect[MAXSECTORS];
    console.log("insertspritesect blanktouse: %i, nextspritesect[blanktouse]: %i", blanktouse, nextspritesect[blanktouse]);

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

//6013
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

//6038
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
    console.log("b4 del headspritesect[MAXSECTORS]: %i, deleteme: %i", headspritesect[MAXSECTORS],deleteme)
    headspritesect[MAXSECTORS] = deleteme;
    console.log("after del headspritesect[MAXSECTORS]: %i", headspritesect[MAXSECTORS])

    sprite[deleteme].sectnum = MAXSECTORS;
    return (0);
};

//6070
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
    console.log("changespritesect newsectnum: %i", newsectnum);
    if ((newsectnum < 0) || (newsectnum > MAXSECTORS)) return (-1);
    if (sprite[spritenum].sectnum == newsectnum) return(0);
    if (sprite[spritenum].sectnum == MAXSECTORS) return(-1);
    if (Engine.deleteSpriteSect(spritenum) < 0) return (-1);
    Engine.insertSpriteSect(newsectnum);
    return(0);
}

//6106
function changespritestat(spritenum, newstatnum) {
    if ((newstatnum < 0) || (newstatnum > MAXSTATUS)) return (-1);
    if (sprite[spritenum].statnum == newstatnum) return (0);
    if (sprite[spritenum].statnum == MAXSTATUS) return (-1);
    if (Engine.deleteSpriteStat(spritenum) < 0) return (-1);
    Engine.insertSpriteStat(newstatnum);
    return (0);
}

//6184

function cansee( x1,  y1,  z1,  sect1, x2,  y2,  z2,  sect2) {
    var sec;
    var wal, walIdx, wal2;
    var i, cnt, nexts, x, y, z, cz = new Ref(), fz = new Ref(), dasectnum, dacnt, danum;
    var x21, y21, z21, x31, y31, x34, y34, bot, t;

    if ((x1 == x2) && (y1 == y2))
        return(sect1 == sect2);

    x21 = x2-x1;
    y21 = y2-y1;
    z21 = z2-z1;

    clipsectorlist[0] = sect1;
    danum = 1;
    for(dacnt=0; dacnt<danum; dacnt++)
    {
        dasectnum = clipsectorlist[dacnt];
        sec = sector[dasectnum];
        for (cnt = sec.wallnum, wal = wall[walIdx = sec.wallptr]; cnt > 0; cnt--, wal = wall[++walIdx])
        {
            wal2 = wall[wal.point2];
            x31 = wal.x-x1;
            x34 = wal.x-wal2.x;
            y31 = wal.y-y1;
            y34 = wal.y-wal2.y;

            bot = y21*x34-x21*y34;
            if (bot <= 0)
                continue;
            
            t = y21*x31-x21*y31;
            if (t >= bot)
                continue;
            t = y31*x34-x31*y34;
            if (t >= bot)
                continue;

            nexts = wal.nextsector;
            if ((nexts < 0) || (wal.cstat&32)) return(0);

            t = divscale24(t,bot);
            x = x1 + mulscale24(x21,t);
            y = y1 + mulscale24(y21,t);
            z = z1 + mulscale24(z21,t);

            getzsofslope(dasectnum,x,y,cz,fz);
            if ((z <= cz.$) || (z >= fz.$))
                return(0);
            getzsofslope(nexts,x,y,cz,fz);
            if ((z <= cz.$) || (z >= fz.$))
                return(0);

            for(i=danum-1; i>=0; i--)
                if (clipsectorlist[i] == nexts)
                    break;
            if (i < 0)
                clipsectorlist[danum++] = nexts;
        }
    }
    for(i=danum-1; i>=0;i--)
        if (clipsectorlist[i] == sect2)
            return(1);
    return(0);
}


//6291
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
    t = divscale16(topt, bot);
    intx.$ = x1 + mulscale16(vx, t);
    inty.$ = y1 + mulscale16(vy, t);
    intz.$ = z1 + mulscale16(vz, t);
    return (1);
}

//6327

function hitscan( xs,  ys,  zs,  sectnum,
             vx,  vy,  vz,
            hitsect, hitwall, hitsprite,
            hitx, hity, hitz,   cliptype)
{
    console.assert(hitsect instanceof Ref)
    console.assert(hitwall instanceof Ref)
    console.assert(hitsprite instanceof Ref)
    console.assert(hitx instanceof Ref)
    console.assert(hity instanceof Ref)
    console.assert(hitz instanceof Ref)

    var sec;
    var wal, walIdx = 0, wal2;
    var spr;
    var z, zz, x1, y1=0, z1=0, x2, y2, x3, y3, x4, y4, intx = new Ref(), inty = new Ref(), intz = new Ref();
    var topt, topu, bot, dist, offx, offy, cstat;
    var i, j, k, l, tilenum, xoff, yoff, dax, day, daz= new Ref(), daz2 = new Ref();
    var ang, cosang, sinang, xspan, yspan, xrepeat, yrepeat;
    var  dawalclipmask, dasprclipmask;
    var tempshortcnt, tempshortnum, dasector, startwall, endwall;
    var nextsector;
    var  clipyou;

    hitsect.$ = -1;
    hitwall.$ = -1;
    hitsprite.$ = -1;
    if (sectnum < 0) return(-1);

    hitx.$ = hitscangoalx;
    hity.$ = hitscangoaly;

    dawalclipmask = (cliptype&65535);
    dasprclipmask = (cliptype>>16);

    clipsectorlist[0] = sectnum;
    tempshortcnt = 0;
    tempshortnum = 1;
    do
    {
        //printf("tempshortcnt: %i,tempshortnum: %i\n", tempshortcnt, tempshortnum);
        dasector = clipsectorlist[tempshortcnt];
        sec = sector[dasector];

        x1 = 0x7fffffff;
        if (sec.ceilingstat&2)
        {
            wal = wall[sec.wallptr];
            wal2 = wall[wal.point2];
            dax = wal2.x-wal.x;
            day = wal2.y-wal.y;
            i = nsqrtasm(dax*dax+day*day);
            if (i == 0) continue;
            i = divscale15(sec.ceilingheinum,i);
            dax *= i;
            day *= i;

            j = (vz<<8)-dmulscale15(dax,vy,-day,vx);
            if (j != 0)
            {
                i = ((sec.ceilingz-zs)<<8)+dmulscale15(dax,ys-wal.y,-day,xs-wal.x);
                if (((i^j) >= 0) && ((klabs(i)>>1) < klabs(j)))
                {
                    i = divscale30(i,j);
                    x1 = xs + mulscale30(vx,i);
                    y1 = ys + mulscale30(vy,i);
                    z1 = zs + mulscale30(vz,i);
                }
            }
        }
        else if ((vz < 0) && (zs >= sec.ceilingz))
        {
            z1 = sec.ceilingz;
            i = z1-zs;
            if ((klabs(i)>>1) < -vz)
            {
                i = divscale30(i,vz);
                x1 = xs + mulscale30(vx,i);
                y1 = ys + mulscale30(vy,i);
            }
        }
        if ((x1 != 0x7fffffff) && (klabs(x1-xs)+klabs(y1-ys) < klabs((hitx.$)-xs)+klabs((hity.$)-ys)))
            if (inside(x1,y1,dasector) != 0)
            {
                hitsect.$ = dasector;
                hitwall.$ = -1;
                hitsprite.$ = -1;
                hitx.$ = x1;
                hity.$ = y1;
                hitz.$ = z1;
            }

        x1 = 0x7fffffff;
        if (sec.floorstat&2)
        {
            wal = wall[sec.wallptr];
            wal2 = wall[wal.point2];
            dax = wal2.x-wal.x;
            day = wal2.y-wal.y;
            i = nsqrtasm(dax*dax+day*day);
            if (i == 0) continue;
            i = divscale15(sec.floorheinum,i);
            dax *= i;
            day *= i;

            j = (vz<<8)-dmulscale15(dax,vy,-day,vx);
            if (j != 0)
            {
                i = ((sec.floorz-zs)<<8)+dmulscale15(dax,ys-wal.y,-day,xs-wal.x);
                if (((i^j) >= 0) && ((klabs(i)>>1) < klabs(j)))
                {
                    i = divscale30(i,j);
                    x1 = xs + mulscale30(vx,i);
                    y1 = ys + mulscale30(vy,i);
                    z1 = zs + mulscale30(vz,i);
                }
            }
        }
        else if ((vz > 0) && (zs <= sec.floorz))
        {
            z1 = sec.floorz;
            i = z1-zs;
            if ((klabs(i)>>1) < vz)
            {
                i = divscale30(i,vz);
                x1 = xs + mulscale30(vx,i);
                y1 = ys + mulscale30(vy,i);
            }
        }
        if ((x1 != 0x7fffffff) && (klabs(x1-xs)+klabs(y1-ys) < klabs((hitx.$)-xs)+klabs((hity.$)-ys)))
            if (inside(x1,y1,dasector) != 0)
            {
                hitsect.$ = dasector;
                hitwall.$ = -1;
                hitsprite.$ = -1;
                hitx.$ = x1;
                hity.$ = y1;
                hitz.$ = z1;
            }

        startwall = sec.wallptr;
        endwall = startwall + sec.wallnum;
        for (z = startwall, wal = wall[walIdx=startwall], walIdx; z < endwall; z++, wal = wall[++walIdx])
        {
            wal2 = wall[wal.point2];
            x1 = wal.x;
            y1 = wal.y;
            x2 = wal2.x;
            y2 = wal2.y;

            if ((x1-xs)*(y2-ys) < (x2-xs)*(y1-ys)) continue;
            //printf("test23 %i < %i \n", (x1 - xs) * (y2 - ys), (x2 - xs) * (y1 - ys));
            //printf("z==%i && x1==%i && y1==%i && x2==%i && y2==%i\n", z, x1, y1, x2, y2);
            if (rintersect(xs, ys, zs, vx, vy, vz, x1, y1, x2, y2, intx, inty, intz) == 0) continue;
            printf("passed rintersect\n");
            if (klabs(intx.$-xs)+klabs(inty.$-ys) >= klabs((hitx.$)-xs)+klabs((hity.$)-ys)) continue;

            nextsector = wal.nextsector;
            if ((nextsector < 0) || (wal.cstat&dawalclipmask))
            {
                hitsect.$ = dasector;
                hitwall.$ = z;
                hitsprite.$ = -1;
                hitx.$ = intx.$;
                hity.$ = inty.$;
                hitz.$ = intz.$;
                continue;
            }
            getzsofslope(nextsector,intx.$,inty.$,daz,daz2);
            if ((intz.$ <= daz.$) || (intz.$ >= daz2.$))
            {
                hitsect.$ = dasector;
                hitwall.$ = z;
                hitsprite.$ = -1;
                hitx.$ = intx.$;
                hity.$ = inty.$;
                hitz.$ = intz.$;
                continue;
            }

            for(zz=tempshortnum-1; zz>=0; zz--)
                if (clipsectorlist[zz] == nextsector)
                    break;
            if (zz < 0) clipsectorlist[tempshortnum++] = nextsector;
        }

        for(z=headspritesect[dasector]; z>=0; z=nextspritesect[z]) {
            spr = sprite[z];
            cstat = spr.cstat;
            //printf("z: %i, cstat & 48: %i\n", z, cstat & 48);
            if ((cstat & dasprclipmask) == 0) continue;

            x1 = spr.x;
            y1 = spr.y;
            z1 = spr.z;
            switch (cstat & 48)
            {
                case 0:
                    topt = vx*(x1-xs) + vy*(y1-ys);
                    if (topt <= 0) continue;
                    bot = vx*vx + vy*vy;
                    if (bot == 0) continue;

                    intz.$ = zs+scale(vz,topt,bot);

                    i = (tiles[spr.picnum].dim.height*spr.yrepeat<<2);
                    
                    if (cstat&128) 
                        z1 += (i>>1);
                    
                    if (tiles[spr.picnum].animFlags&0x00ff0000) 
                        z1 -= ((toInt8((tiles[spr.picnum].animFlags>>16)&255))*spr.yrepeat<<2);
                    
                    if ((intz.$ > z1) || (intz.$ < z1-i)) continue;
                    topu = vx*(y1-ys) - vy*(x1-xs);

                    offx = scale(vx,topu,bot);
                    offy = scale(vy,topu,bot);
                    dist = offx*offx + offy*offy;
                    i = tiles[spr.picnum].dim.width*spr.xrepeat;
                    i *= i;
                    if (dist > (i>>7)) continue;
                    intx.$ = xs + scale(vx,topt,bot);
                    inty.$ = ys + scale(vy,topt,bot);

                    if (klabs(intx.$-xs)+klabs(inty.$-ys) > klabs((hitx.$)-xs)+klabs((hity.$)-ys)) continue;

                    hitsect.$ = dasector;
                    hitwall.$ = -1;
                    hitsprite.$ = z;
                    hitx.$ = intx.$;
                    hity.$ = inty.$;
                    hitz.$ = intz.$;
                    break;
                case 16:
                    /*
                     * These lines get the 2 points of the rotated sprite
                     * Given: (x1, y1) starts out as the center point
                     */
                    tilenum = spr.picnum;
                    xoff = (toInt8((tiles[tilenum].animFlags>>8)&255))+(spr.xoffset);
                    if ((cstat&4) > 0) xoff = -xoff;
                    k = spr.ang;
                    l = spr.xrepeat;
                    dax = sintable[k&2047]*l;
                    day = sintable[(k+1536)&2047]*l;
                    l = tiles[tilenum].dim.width;
                    k = (l>>1)+xoff;
                    x1 -= mulscale16(dax,k);
                    x2 = x1+mulscale16(dax,l);
                    y1 -= mulscale16(day,k);
                    y2 = y1+mulscale16(day,l);

                    if ((cstat&64) != 0)   /* back side of 1-way sprite */
                        if ((x1-xs)*(y2-ys) < (x2-xs)*(y1-ys)) continue;

                    if (rintersect(xs,ys,zs,vx,vy,vz,x1,y1,x2,y2,intx,inty,intz) == 0) continue;

                    if (klabs(intx.$-xs)+klabs(inty.$-ys) > klabs((hitx.$)-xs)+klabs((hity.$)-ys)) continue;

                    k = ((tiles[spr.picnum].dim.height*spr.yrepeat)<<2);
                    if (cstat&128)
                        daz.$ = spr.z+(k>>1);
                    else
                        daz.$ = spr.z;
                    
                    if (tiles[spr.picnum].animFlags&0x00ff0000)
                        daz.$ -= ((toInt8((tiles[spr.picnum].animFlags>>16)&255))*spr.yrepeat<<2);
                    
                    if ((intz.$ < daz.$) && (intz.$ > daz.$-k))
                    {
                        hitsect.$ = dasector;
                        hitwall.$ = -1;
                        hitsprite.$ = z;
                        hitx.$ = intx.$;
                        hity.$ = inty.$;
                        hitz.$ = intz.$;
                    }
                    break;
                case 32:
                    if (vz == 0) continue;
                    intz.$ = z1;
                    if (((intz.$-zs)^vz) < 0) continue;
                    if ((cstat&64) != 0)
                        if ((zs > intz.$) == ((cstat&8)==0)) continue;

                    intx.$ = xs+scale(intz.$-zs,vx,vz);
                    inty.$ = ys+scale(intz.$-zs,vy,vz);

                    if (klabs(intx.$-xs)+klabs(inty.$-ys) > klabs((hitx.$)-xs)+klabs((hity.$)-ys)) continue;

                    tilenum = spr.picnum;
                    xoff = (toInt8((tiles[tilenum].animFlags>>8)&255))+(spr.xoffset);
                    yoff = (toInt8((tiles[tilenum].animFlags>>16)&255))+(spr.yoffset);
                    if ((cstat&4) > 0) xoff = -xoff;
                    if ((cstat&8) > 0) yoff = -yoff;

                    ang = spr.ang;
                    cosang = sintable[(ang+512)&2047];
                    sinang = sintable[ang];
                    xspan = tiles[tilenum].dim.width;
                    xrepeat = spr.xrepeat;
                    yspan = tiles[tilenum].dim.height;
                    yrepeat = spr.yrepeat;

                    dax = ((xspan>>1)+xoff)*xrepeat;
                    day = ((yspan>>1)+yoff)*yrepeat;
                    x1 += dmulscale16(sinang,dax,cosang,day)-intx.$;
                    y1 += dmulscale16(sinang,day,-cosang,dax)-inty.$;
                    l = xspan*xrepeat;
                    x2 = x1 - mulscale16(sinang,l);
                    y2 = y1 + mulscale16(cosang,l);
                    l = yspan*yrepeat;
                    k = -mulscale16(cosang,l);
                    x3 = x2+k;
                    x4 = x1+k;
                    k = -mulscale16(sinang,l);
                    y3 = y2+k;
                    y4 = y1+k;

                    clipyou = 0;
                    if ((y1^y2) < 0)
                    {
                        if ((x1^x2) < 0) clipyou ^= (x1*y2<x2*y1)^(y1<y2);
                        else if (x1 >= 0) clipyou ^= 1;
                    }
                    if ((y2^y3) < 0)
                    {
                        if ((x2^x3) < 0) clipyou ^= (x2*y3<x3*y2)^(y2<y3);
                        else if (x2 >= 0) clipyou ^= 1;
                    }
                    if ((y3^y4) < 0)
                    {
                        if ((x3^x4) < 0) clipyou ^= (x3*y4<x4*y3)^(y3<y4);
                        else if (x3 >= 0) clipyou ^= 1;
                    }
                    if ((y4^y1) < 0)
                    {
                        if ((x4^x1) < 0) clipyou ^= (x4*y1<x1*y4)^(y4<y1);
                        else if (x4 >= 0) clipyou ^= 1;
                    }

                    if (clipyou != 0)
                    {
                        hitsect.$ = dasector;
                        hitwall.$ = -1;
                        hitsprite.$ = z;
                        hitx.$ = intx.$;
                        hity.$ = inty.$;
                        hitz.$ = intz.$;
                    }
                    break;
            }
        }
        tempshortcnt++;
    } while (tempshortcnt < tempshortnum);
    return(0);
}


function dragpoint(pointhighlight, dax, day)
{
    var cnt, tempshort;

    wall[pointhighlight].x = dax;
    wall[pointhighlight].y = day;

    cnt = MAXWALLS;
    tempshort = pointhighlight;    /* search points CCW */
    do
    {
        if (wall[tempshort].nextwall >= 0)
        {
            tempshort = wall[wall[tempshort].nextwall].point2;
            wall[tempshort].x = dax;
            wall[tempshort].y = day;
        }
        else
        {
            tempshort = pointhighlight;    /* search points CW if not searched all the way around */
            do
            {
                if (wall[lastwall(tempshort)].nextwall >= 0)
                {
                    tempshort = wall[lastwall(tempshort)].nextwall;
                    wall[tempshort].x = dax;
                    wall[tempshort].y = day;
                }
                else
                {
                    break;
                }
                cnt--;
            }
            while ((tempshort != pointhighlight) && (cnt > 0));
            break;
        }
        cnt--;
    }
    while ((tempshort != pointhighlight) && (cnt > 0));
}

//6856
function lastwall(point)
{
    var i, j, cnt;

    if ((point > 0) && (wall[point-1].point2 == point)) return(point-1);
    i = point;
    cnt = MAXWALLS;
    do
    {
        j = wall[i].point2;
        if (j == point) return(i);
        i = j;
        cnt--;
    } while (cnt > 0);
    return(point);
}

//6873
function addclipline(dax1, day1, dax2, day2, daoval) {
    clipit[clipnum].x1 = dax1;
    clipit[clipnum].y1 = day1;
    clipit[clipnum].x2 = dax2;
    clipit[clipnum].y2 = day2;
    clipobjectval[clipnum] = daoval;
    clipnum++;
}

//6880
Engine.keepaway = function (x, y, w) {
    console.assert(x instanceof Ref);
    console.assert(y instanceof Ref);
    
    var dx, dy, ox, oy, x1, y1;
    var first;

    x1 = clipit[w].x1;
    dx = clipit[w].x2 - x1;
    y1 = clipit[w].y1;
    dy = clipit[w].y2 - y1;
    ox = ksgn(-dy);
    oy = ksgn(dx);
    first = (klabs(dx) <= klabs(dy));
    console.assert(first >= 0 && first <= 255, "first is uint8");
    while (1) {
        if (dx * (y.$ - y1) > (x.$ - x1) * dy) return;
        if (first == 0) x.$ += ox;
        else y.$ += oy;
        first ^= 1;
        console.assert(first >= 0 && first <= 255, "first is uint8");
    }
};

//6904
Engine.raytrace = function (x3, y3, x4, y4) {
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
    var wal, walIdx, wal2;
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
    console.log("sectnum: %i, goaly: %i, yvect: %i", sectnum.$, goaly, yvect);

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
        for (j = startwall, wal = wall[walIdx = startwall]; j < endwall; j++, wal = wall[++walIdx]) {
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
        }

        for (j = headspritesect[dasect]; j >= 0; j = nextspritesect[j]) {
            spr = sprite[j];
            cstat = spr.cstat;
            if ((cstat & dasprclipmask) == 0) continue;
            x1 = spr.x;
            y1 = spr.y;
            switch (cstat & 48) {
                case 0:
                    if ((x1 >= xmin) && (x1 <= xmax) && (y1 >= ymin) && (y1 <= ymax)) {
                        k = ((tiles[spr.picnum].dim.height * spr.yrepeat) << 2);
                        if (cstat & 128) daz = spr.z + (k >> 1);
                        else daz = spr.z;

                        if (tiles[spr.picnum].animFlags & 0x00ff0000)
                            daz -= ((/*(int8_t )*/((tiles[spr.picnum].animFlags >> 16) & 255)) * spr.yrepeat << 2);

                        if (((z.$) < daz + ceildist) && ((z.$) > daz - k - flordist)) {
                            bsz = (spr.clipdist << 2) + walldist;
                            if (gx < 0) bsz = -bsz;
                            addclipline(x1 - bsz, y1 - bsz, x1 - bsz, y1 + bsz, j + 49152);
                            bsz = (spr.clipdist << 2) + walldist;
                            if (gy < 0) bsz = -bsz;
                            addclipline(x1 + bsz, y1 - bsz, x1 - bsz, y1 - bsz, j + 49152);
                        }
                    }
                    break;
                case 16:
                    k = ((tiles[spr.picnum].dim.height * spr.yrepeat) << 2);

                    if (cstat & 128)
                        daz = spr.z + (k >> 1);
                    else
                        daz = spr.z;

                    if (tiles[spr.picnum].animFlags & 0x00ff0000)
                        daz -= ((/*(int8_t  )*/((tiles[spr.picnum].animFlags >> 16) & 255)) * spr.yrepeat << 2);
                    daz2 = daz - k;
                    daz += ceildist;
                    daz2 -= flordist;
                    if (((z.$) < daz) && ((z.$) > daz2)) {
                        /*
                            * These lines get the 2 points of the rotated sprite
                            * Given: (x1, y1) starts out as the center point
                            */
                        tilenum = spr.picnum;
                        xoff =/* (int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags >> 8) & 255)) + (spr.xoffset);
                        if ((cstat & 4) > 0) xoff = -xoff;
                        k = spr.ang;
                        l = spr.xrepeat;
                        dax = sintable[k & 2047] * l;
                        day = sintable[(k + 1536) & 2047] * l;
                        l = tiles[tilenum].dim.width;
                        k = (l >> 1) + xoff;
                        x1 -= mulscale16(dax, k);
                        x2 = x1 + mulscale16(dax, l);
                        y1 -= mulscale16(day, k);
                        y2 = y1 + mulscale16(day, l);
                        if (clipinsideboxline(cx, cy, x1, y1, x2, y2, rad) != 0) {
                            dax = mulscale14(sintable[(spr.ang + 256 + 512) & 2047], walldist);
                            day = mulscale14(sintable[(spr.ang + 256) & 2047], walldist);

                            if ((x1 - (x.$)) * (y2 - (y.$)) >= (x2 - (x.$)) * (y1 - (y.$)))   /* Front */ {
                                addclipline(x1 + dax, y1 + day, x2 + day, y2 - dax, j + 49152);
                            }
                            else {
                                if ((cstat & 64) != 0) continue;
                                addclipline(x2 - dax, y2 - day, x1 - day, y1 + dax, j + 49152);
                            }

                            /* Side blocker */
                            if ((x2 - x1) * ((x.$) - x1) + (y2 - y1) * ((y.$) - y1) < 0) {
                                addclipline(x1 - day, y1 + dax, x1 + dax, y1 + day, j + 49152);
                            }
                            else if ((x1 - x2) * ((x.$) - x2) + (y1 - y2) * ((y.$) - y2) < 0) {
                                addclipline(x2 + day, y2 - dax, x2 - dax, y2 - day, j + 49152);
                            }
                        }
                    }
                    break;
                case 32:
                    daz = spr.z + ceildist;
                    daz2 = spr.z - flordist;
                    if (((z.$) < daz) && ((z.$) > daz2)) {
                        if ((cstat & 64) != 0)
                            if (((z.$) > spr.z) == ((cstat & 8) == 0)) continue;

                        tilenum = spr.picnum;
                        xoff =/*(int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags >> 8) & 255)) + (/*(int32_t)*/spr.xoffset);
                        yoff =/*(int32_t)*/(/*(int8_t  )*/((tiles[tilenum].animFlags >> 16) & 255)) + (/*(int32_t)*/spr.yoffset);
                        if ((cstat & 4) > 0) xoff = -xoff;
                        if ((cstat & 8) > 0) yoff = -yoff;

                        k = spr.ang;
                        cosang = sintable[(k + 512) & 2047];
                        sinang = sintable[k];
                        xspan = tiles[tilenum].dim.width;
                        xrepeat = spr.xrepeat;
                        yspan = tiles[tilenum].dim.height;
                        yrepeat = spr.yrepeat;

                        dax = ((xspan >> 1) + xoff) * xrepeat;
                        day = ((yspan >> 1) + yoff) * yrepeat;
                        rxi[0] = x1 + dmulscale16(sinang, dax, cosang, day);
                        ryi[0] = y1 + dmulscale16(sinang, day, -cosang, dax);
                        l = xspan * xrepeat;
                        rxi[1] = rxi[0] - mulscale16(sinang, l);
                        ryi[1] = ryi[0] + mulscale16(cosang, l);
                        l = yspan * yrepeat;
                        k = -mulscale16(cosang, l);
                        rxi[2] = rxi[1] + k;
                        rxi[3] = rxi[0] + k;
                        k = -mulscale16(sinang, l);
                        ryi[2] = ryi[1] + k;
                        ryi[3] = ryi[0] + k;

                        dax = mulscale14(sintable[(spr.ang - 256 + 512) & 2047], walldist);
                        day = mulscale14(sintable[(spr.ang - 256) & 2047], walldist);

                        if ((rxi[0] - (x.$)) * (ryi[1] - (y.$)) < (rxi[1] - (x.$)) * (ryi[0] - (y.$))) {
                            if (clipinsideboxline(cx, cy, rxi[1], ryi[1], rxi[0], ryi[0], rad) != 0)
                                addclipline(rxi[1] - day, ryi[1] + dax, rxi[0] + dax, ryi[0] + day, j + 49152);
                        }
                        else if ((rxi[2] - (x.$)) * (ryi[3] - (y.$)) < (rxi[3] - (x.$)) * (ryi[2] - (y.$))) {
                            if (clipinsideboxline(cx, cy, rxi[3], ryi[3], rxi[2], ryi[2], rad) != 0)
                                addclipline(rxi[3] + day, ryi[3] - dax, rxi[2] - dax, ryi[2] - day, j + 49152);
                        }

                        if ((rxi[1] - (x.$)) * (ryi[2] - (y.$)) < (rxi[2] - (x.$)) * (ryi[1] - (y.$))) {
                            if (clipinsideboxline(cx, cy, rxi[2], ryi[2], rxi[1], ryi[1], rad) != 0)
                                addclipline(rxi[2] - dax, ryi[2] - day, rxi[1] - day, ryi[1] + dax, j + 49152);
                        }
                        else if ((rxi[3] - (x.$)) * (ryi[0] - (y.$)) < (rxi[0] - (x.$)) * (ryi[3] - (y.$))) {
                            if (clipinsideboxline(cx, cy, rxi[0], ryi[0], rxi[3], ryi[3], rad) != 0)
                                addclipline(rxi[0] + dax, ryi[0] + day, rxi[3] + day, ryi[3] - dax, j + 49152);
                        }
                    }
                    break;
            }
        }
    } while (clipsectcnt < clipsectnum);

    hitwall = 0;
    cnt = clipmoveboxtracenum;
    do {
        intx = goalx;
        inty = goaly;

        var intxRef = new Ref(intx);
        var intyRef = new Ref(inty);
        hitwall = Engine.raytrace(x.$, y.$, intxRef, intyRef);
        intx = intxRef.$;
        inty = intyRef.$;
        if ((hitwall) >= 0) {
            lx = clipit[hitwall].x2 - clipit[hitwall].x1;
            ly = clipit[hitwall].y2 - clipit[hitwall].y1;
            templong2 = lx * lx + ly * ly;
            if (templong2 > 0) {
                templong1 = (goalx - intx) * lx + (goaly - inty) * ly;

                if ((klabs(templong1) >> 11) < templong2)
                    i = divscale20(templong1, templong2);
                else
                    i = 0;
                goalx = mulscale20(lx, i) + intx;
                goaly = mulscale20(ly, i) + inty;
            }

            templong1 = dmulscale6(lx, oxvect, ly, oyvect);
            for (i = cnt + 1; i <= clipmoveboxtracenum; i++) {
                j = hitwalls[i];
                templong2 = dmulscale6(clipit[j].x2 - clipit[j].x1, oxvect, clipit[j].y2 - clipit[j].y1, oyvect);
                if ((templong1 ^ templong2) < 0) {
                    updatesector(x.$, y.$, sectnum);
                    return (retval);
                }
            }

            var goalxRef = new Ref(goalx);
            var goalyRef = new Ref(goaly);
            Engine.keepaway(goalxRef, goalyRef, hitwall);
            goalx = goalxRef.$;
            goaly = goalyRef.$;

            xvect = ((goalx - intx) << 14);
            yvect = ((goaly - inty) << 14);

            if (cnt == clipmoveboxtracenum) retval = clipobjectval[hitwall];
            hitwalls[cnt] = hitwall;
        }
        cnt--;

        x.$ = intx;
        y.$ = inty;
    } while (((xvect | yvect) != 0) && (hitwall >= 0) && (cnt > 0));

    for (j = 0; j < clipsectnum; j++)
        if (inside(x.$, y.$, clipsectorlist[j]) == 1) {
            sectnum.$ = clipsectorlist[j];
            return (retval);
        }
    debugger;
    sectnum.$ = -1;
    templong1 = 0x7fffffff;
    for (j = numsectors - 1; j >= 0; j--)
        if (inside(x.$, y.$, j) == 1) {
            if (sector[j].ceilingstat & 2)
                templong2 = (getceilzofslope(j, x.$, y.$) - (z.$));
            else
                templong2 = (sector[j].ceilingz - (z.$));

            if (templong2 > 0) {
                if (templong2 < templong1) {
                    sectnum.$ = j;
                    templong1 = templong2;
                }
            }
            else {
                if (sector[j].floorstat & 2)
                    templong2 = ((z.$) - getflorzofslope(j, x.$, y.$));
                else
                    templong2 = ((z.$) - sector[j].floorz);

                if (templong2 <= 0) {
                    sectnum.$ = j;
                    return (retval);
                }
                if (templong2 < templong1) {
                    sectnum.$ = j;
                    templong1 = templong2;
                }
            }
        }

    return retval;
}

//7330
function pushmove( x,  y,  z,  sectnum, walldist,  ceildist,  flordist, cliptype)
{
    console.assert(x instanceof Ref, "x must be Ref");
    console.assert(y instanceof Ref, "y must be Ref");
    console.assert(z instanceof Ref, "z must be Ref");
    console.assert(sectnum instanceof Ref, "sectnum must be Ref");
    var sec, sec2;
    var wal, walIdx;
    var i, j, k, t, dx, dy, dax, day, daz, daz2, bad, dir;
    var dasprclipmask, dawalclipmask;
    var startwall, endwall, clipsectcnt;
    var  bad2;

    if ((sectnum.$) < 0) return(-1);

    dawalclipmask = (cliptype&65535);
    dasprclipmask = (cliptype>>16);

    k = 32;
    dir = 1;
    do
    {
        bad = 0;

        clipsectorlist[0] = sectnum.$;
        clipsectcnt = 0;
        clipsectnum = 1;
        do
        {
            sec = sector[clipsectorlist[clipsectcnt]];
            if (dir > 0)
                startwall = sec.wallptr, endwall = startwall + sec.wallnum;
            else
                endwall = sec.wallptr, startwall = endwall + sec.wallnum;

            for (i = startwall, wal = wall[walIdx = startwall]; i != endwall; i += dir, walIdx += dir, wal = wall[walIdx]) {
                console.log("pushmove: i: %i, picnum: %i, nextsector: %i", i, wal.picnum, wal.nextsector);
                if (clipinsidebox(x.$, y.$, i, walldist - 4) == 1) {
                    j = 0;
                    if (wal.nextsector < 0) j = 1;
                    if (wal.cstat & dawalclipmask) j = 1;
                    if (j == 0) {
                        sec2 = sector[wal.nextsector];


                        /* Find closest point on wall (dax, day) to (x.$, y.$) */
                        dax = wall[wal.point2].x - wal.x;
                        day = wall[wal.point2].y - wal.y;
                        daz = dax * ((x.$) - wal.x) + day * ((y.$) - wal.y);
                        if (daz <= 0)
                            t = 0;
                        else {
                            daz2 = dax * dax + day * day;
                            if (daz >= daz2) t = (1 << 30);
                            else t = divscale30(daz, daz2);
                        }
                        dax = wal.x + mulscale30(dax, t);
                        day = wal.y + mulscale30(day, t);


                        daz = getflorzofslope(clipsectorlist[clipsectcnt], dax, day);
                        daz2 = getflorzofslope(wal.nextsector, dax, day);
                        if ((daz2 < daz - (1 << 8)) && ((sec2.floorstat & 1) == 0))
                            if (z.$ >= daz2 - (flordist - 1)) j = 1;

                        daz = getceilzofslope(clipsectorlist[clipsectcnt], dax, day);
                        daz2 = getceilzofslope(wal.nextsector, dax, day);
                        if ((daz2 > daz + (1 << 8)) && ((sec2.ceilingstat & 1) == 0))
                            if (z.$ <= daz2 + (ceildist - 1)) j = 1;
                    }
                    if (j != 0) {
                        j = getangle(wall[wal.point2].x - wal.x, wall[wal.point2].y - wal.y);
                        dx = (sintable[(j + 1024) & 2047] >> 11);
                        dy = (sintable[(j + 512) & 2047] >> 11);
                        bad2 = 16;
                        do {
                            x.$ = (x.$) + dx;
                            y.$ = (y.$) + dy;
                            bad2--;
                            if (bad2 == 0) break;
                        } while (clipinsidebox(x.$, y.$, i, walldist - 4) != 0);
                        bad = -1;
                        k--;
                        if (k <= 0) return (bad);
                        updatesector(x.$, y.$, sectnum);
                    } else {
                        for (j = clipsectnum - 1; j >= 0; j--)
                            if (wal.nextsector == clipsectorlist[j]) break;
                        if (j < 0) clipsectorlist[clipsectnum++] = wal.nextsector;
                    }
                }
            }

            clipsectcnt++;
        } while (clipsectcnt < clipsectnum);
        dir = -dir;
    } while (bad != 0);

    return(bad);
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
    console.assert(lastKnownSector instanceof Ref, "lastKnownSector must be Ref");
    var wal;
    var i, j;

    //First check the last sector where (old_x,old_y) was before being updated to (x,y)
    if (inside(x, y, lastKnownSector.$) == 1) {
        //We found it and (x,y) is still in the same sector: nothing to update !
        return;
    }
    // Seems (x,y) moved into an other sector....hopefully one connected via a portal. Let's flood in each portal.
    if ((lastKnownSector.$ >= 0) && (lastKnownSector.$ < numsectors)) {
        wal = wall[sector[lastKnownSector.$].wallptr];
        j = sector[lastKnownSector.$].wallnum;
        do {
            i = wal.nextsector;
            if (i >= 0)
                if (inside(x, y, i) == 1) {
                    lastKnownSector.$ = i;
                    return;
                }
            wal++;
            j--;
        } while (j != 0);
    }

    //Damn that is a BIG move, still cannot find which sector (x,y) belongs to. Let's search via linear search.
    for (i = numsectors - 1; i >= 0; i--) {
        if (inside(x, y, i) == 1) {
            lastKnownSector.$ = i;
            return;
        }
    }
    // (x,y) is contained in NO sector. (x,y) is likely out of the map.
    lastKnownSector.$ = -1;
}

//7492
function rotatepoint(xpivot,  ypivot,  x,  y,  daang,  x2,  y2)
{
    console.assert(x2 instanceof Ref, "x2 must be ref");
    console.assert(y2 instanceof Ref, "y2 must be ref");
    var dacos, dasin;

    dacos = sintable[(daang+2560)&2047];
    dasin = sintable[(daang+2048)&2047];
    x -= xpivot;
    y -= ypivot;
    x2.$ = dmulscale14(x,dacos,-y,dasin) + xpivot;
    y2.$ = dmulscale14(y,dacos,x,dasin) + ypivot;
}



//7795
function krand() {
    randomseed = (mul32(randomseed, 27584621) + 1) | 0;
    console.log("result: %i", randomseed >>> 16);
    return randomseed >>> 16;
}


//7810
function getzrange(x, y, z, sectnum, ceilz, ceilhit, florz, florhit, walldist, cliptype) {
    console.assert(ceilz instanceof Ref, "ceilz must be ref");
    console.assert(ceilhit instanceof Ref, "ceilhit must be ref");
    console.assert(florz instanceof Ref, "florz must be ref");
    console.assert(florhit instanceof Ref, "florhit must be ref");

    var sec;
    var wal, walIdx, wal2;
    var spr;
    var clipsectcnt, startwall, endwall, tilenum, xoff, yoff, dax, day;
    var xmin, ymin, xmax, ymax, i, j, k, l, daz, daz2, dx, dy;
    var x1, y1, x2, y2, x3, y3, x4, y4, ang, cosang, sinang;
    var xspan, yspan, xrepeat, yrepeat, dasprclipmask, dawalclipmask;
    var cstat;
    var clipyou = 0;

    if (sectnum < 0) {
        ceilz.$ = 0x80000000;
        ceilhit.$ = -1;
        florz.$ = 0x7fffffff;
        florhit.$ = -1;
        return;
    }

    /* Extra walldist for sprites on sector lines */
    i = walldist + MAXCLIPDIST + 1;
    xmin = x - i;
    ymin = y - i;
    xmax = x + i;
    ymax = y + i;

    getzsofslope(sectnum, x, y, ceilz, florz);
    ceilhit.$ = sectnum + 16384;
    florhit.$ = sectnum + 16384;

    dawalclipmask = (cliptype & 65535);
    dasprclipmask = (cliptype >> 16);

    clipsectorlist[0] = sectnum;
    clipsectcnt = 0;
    clipsectnum = 1;

    do  /* Collect sectors inside your square first */ {
        sec = sector[clipsectorlist[clipsectcnt]];
        startwall = sec.wallptr;
        endwall = startwall + sec.wallnum;
        for (j = startwall, wal = wall[walIdx = startwall]; j < endwall; j++, wal = wall[++walIdx]) {
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
                var dazRef = new Ref(daz);
                var daz2Ref = new Ref(daz2);
                getzsofslope(k, x, y, dazRef, daz2Ref);
                daz = dazRef.$;
                daz2 = daz2Ref.$;
                
                if (daz > ceilz.$) {
                    ceilz.$ = daz;
                    ceilhit.$ = k+16384;
                }
                if (daz2 < florz.$) {
                   florz.$ = daz2;
                   florhit.$ = k+16384;
                }
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
                            if (tiles[spr.picnum].animFlags & 0x00ff0000) daz -=
                                ((toInt8((tiles[spr.picnum].animFlags >> 16) & 255)) * spr.yrepeat << 2);
                            daz2 = daz - (k << 1);
                            clipyou = 1;
                        }
                        break;
                    case 16:
                        tilenum = spr.picnum;
                        xoff = (((tiles[tilenum].animFlags >> 8) & 255)) + (spr.xoffset);
                        if ((cstat & 4) > 0) xoff = -xoff;
                        k = spr.ang;
                        l = spr.xrepeat;
                        dax = sintable[k & 2047] * l;
                        day = sintable[(k + 1536) & 2047] * l;
                        l = tiles[tilenum].dim.width;
                        k = (l >> 1) + xoff;
                        x1 -= mulscale16(dax, k);
                        x2 = x1 + mulscale16(dax, l);
                        y1 -= mulscale16(day, k);
                        y2 = y1 + mulscale16(day, l);
                        if (clipinsideboxline(x, y, x1, y1, x2, y2, walldist + 1) != 0) {
                            daz = spr.z;
                            k = ((tiles[spr.picnum].dim.height * spr.yrepeat) << 1);
                            if (cstat & 128)
                                daz += k;

                            if (tiles[spr.picnum].animFlags & 0x00ff0000)
                                daz -= ((toInt8((tiles[spr.picnum].animFlags >> 16) & 255)) * spr.yrepeat << 2);

                            daz2 = daz - (k << 1);
                            clipyou = 1;
                        }
                        break;
                    case 32:
                        throw new Error("todo");
                        //daz = spr.z;
                        //daz2 = daz;

                        //if ((cstat&64) != 0)
                        //    if ((z > daz) == ((cstat&8)==0)) continue;

                        //tilenum = spr.picnum;
                        //xoff =/* (int32_t)*/(int8_t /*use toInt8*/ )((tiles[tilenum].animFlags>>8)&255))+((int32_t)spr.xoffset);
                        //yoff =/* (int32_t)*/((int8_t /*use toInt8*/ )((tiles[tilenum].animFlags>>16)&255))+((int32_t)spr.yoffset);
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
                    if ((z > daz) && (daz > ceilz.$)) {
                        ceilz.$ = daz;
                        ceilhit.$ = j + 49152;
                    }
                    if ((z < daz2) && (daz2 < florz.$)) {
                        florz.$ = daz2;
                        florhit.$ = j + 49152;
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
    xdimenrecip = divscale32(1, xdimen);
    ydimen = (y2 - y1) + 1;

    setAspect(65536, divscale16(ydim * 320, xdim * 200));

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

//8034
function flushperms() {
    permhead = permtail = 0;
}

// Render a sprite on screen. This is used by the Engine but also the Game module
// when drawing the HUD or the Weapon held by the player !!!
function rotateSprite(sx, sy, z, a, picnum, dashade, dapalnum, dastat, cx1, cy1, cx2, cy2) {
    var i;
    var per, per2;

    dashade = toInt8(dashade);
    dastat = toUint8(dastat);

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
        appendCanvasImageToPage(new Error().stack)
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

    if (numpages >= 2) {
        debugger;
        per = permfifo[permhead];
        per.sx = sx;
        per.sy = sy;
        per.z = z;
        per.a = a;
        per.picnum = picnum;
        per.dashade = dashade;
        per.dapalnum = dapalnum;
        per.dastat = dastat;
        per.pagesleft = numpages + ((beforedrawrooms & 1) << 7);
        per.cx1 = cx1;
        per.cy1 = cy1;
        per.cx2 = cx2;
        per.cy2 = cy2;

        /* Would be better to optimize out true bounding boxes */
        if (dastat & 64)  /* If non-masking write, checking for overlapping cases */ {
            for (i = permtail; i != permhead; i = ((i + 1) & (MAXPERMS - 1))) {
                per2 = permfifo[i];
                if ((per2.pagesleft & 127) == 0) continue;
                if (per2.sx != per.sx) continue;
                if (per2.sy != per.sy) continue;
                if (per2.z != per.z) continue;
                if (per2.a != per.a) continue;
                if (tiles[per2.picnum].dim.width > tiles[per.picnum].dim.width)
                    continue;

                if (tiles[per2.picnum].dim.height > tiles[per.picnum].dim.height)
                    continue;
                if (per2.cx1 < per.cx1) continue;
                if (per2.cy1 < per.cy1) continue;
                if (per2.cx2 > per.cx2) continue;
                if (per2.cy2 > per.cy2) continue;
                per2.pagesleft = 0;
            }
            if ((per.z == 65536) && (per.a == 0))
                for (i = permtail; i != permhead; i = ((i + 1) & (MAXPERMS - 1))) {
                    per2 = permfifo[i];
                    if ((per2.pagesleft & 127) == 0) continue;
                    if (per2.z != 65536) continue;
                    if (per2.a != 0) continue;
                    if (per2.cx1 < per.cx1) continue;
                    if (per2.cy1 < per.cy1) continue;
                    if (per2.cx2 > per.cx2) continue;
                    if (per2.cy2 > per.cy2) continue;
                    if ((per2.sx >> 16) < (per.sx >> 16)) continue;
                    if ((per2.sy >> 16) < (per.sy >> 16)) continue;
                    if ((per2.sx >> 16) + tiles[per2.picnum].dim.width > (per.sx >> 16) + tiles[per.picnum].dim.width)
                        continue;
                    if ((per2.sy >> 16) + tiles[per2.picnum].dim.height > (per.sy >> 16) + tiles[per.picnum].dim.height)
                        continue;
                    per2.pagesleft = 0;
                }
        }

        permhead = ((permhead + 1) & (MAXPERMS - 1));
    }
}

//8193
function makepalookup(palnum, remapbuf, r, g, b, dastat) {
    var i, j, palscale;
    var ptr, ptr2;

    if (!paletteloaded) {
        return;
    }

    if (palookup[palnum] == null) {
        console.log("palookup[palnum] "); // todo
        palookup[palnum] = new Uint8Array(numpalookups << 8);
        //todo: cache stuff??????
    } 

    if (dastat === 0) {
        return;
    }

    if ((r | g | b | 63) !== 63) {
        return;
    }
    
    if ((r|g|b) == 0)
    {
        for(i=0; i<256; i++) {
            ptr = new PointerHelper(palookup[0], remapbuf[i]);
            ptr2 = new PointerHelper(palookup[palnum], i);
            for(j=0; j<numpalookups; j++) {
                ptr2.setByte(ptr.getByte());
                ptr.position += 256;
                ptr2.position += 256;
            }
        }
    }
    else {
        throw new Error("makepalookup todo!!!!!!"); // todo
        //ptr2 = new PointerHelper(palookup[palnum]);
        //for(i=0; i<numpalookups; i++)
        //{
        //    palscale = divscale16(i,numpalookups);
        //    for(j=0; j<256; j++)
        //    {
        //        ptr = new PointerHelper(palette[remapbuf[j]*3]) (uint8_t  *)&palette[remapbuf[j]*3]; //ptr = (uint8_t  *)&palette[remapbuf[j]*3];
        //        ptr2.setByte = getclosestcol((int32_t)ptr[0]+mulscale16(r-ptr[0],palscale),
        //                                (int32_t)ptr[1]+mulscale16(g-ptr[1],palscale),
        //                                (int32_t)ptr[2]+mulscale16(b-ptr[2],palscale));
        //        ptr2.position++;
        //    }
        //}
    }
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
function setviewback() {
    console.log("todo setviewback");
    //var i, j, k;

    //if (setviewcnt <= 0) return;
    //setviewcnt--;

    //setview(bakwindowx1[setviewcnt],bakwindowy1[setviewcnt],
    //        bakwindowx2[setviewcnt],bakwindowy2[setviewcnt]);
    //copybufbyte(&bakumost[windowx1],&startumost[windowx1],(windowx2-windowx1+1)*sizeof(startumost[0]));
    //copybufbyte(&bakdmost[windowx1],&startdmost[windowx1],(windowx2-windowx1+1)*sizeof(startdmost[0]));
    //vidoption = bakvidoption[setviewcnt];
    //frameplace = bakframeplace[setviewcnt];
    //if (setviewcnt == 0)
    //    k = bakxsiz[0];
    //else
    //    k = Math.max(bakxsiz[setviewcnt-1],bakxsiz[setviewcnt]);
    //j = 0;
    //for(i=0; i<=k; i++) ylookup[i] = j, j += bytesperline;
    //setBytesPerLine(bytesperline);
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

/*
 FCS:
 
 Output the ceiling and floor Z coordinate in the two last parameters for given:
 sectorNumber and worldspace (coordinate X,Y).
 
 If the sector is flat, this is jsut a lookup. But if either the floor/ceiling have
 a slope it requires more calculation
 
 */
function getzsofslope(sectnum, dax, day, ceilz, florz) {
    console.assert(ceilz instanceof Ref, "ceilz must be ref");
    console.assert(florz instanceof Ref, "florz must be ref");

    var dx, dy, i, j;
    var wal, wal2;
    var sec;

    sec = sector[sectnum];
    ceilz.$ = sec.ceilingz;
    florz.$ = sec.floorz;

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
            ceilz.$ = (ceilz.$) + scale(sec.ceilingheinum, j, i);
        if (sec.floorstat & 2)
            florz.$ = (florz.$) + scale(sec.floorheinum, j, i);
    }
}