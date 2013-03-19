'use strict';

var MAXSECTORS = 1024;
var MAXWALLS = 8192;
var MAXSPRITES = 4096;
var MAXTILES = 9216;

var MAXSTATUS = 1024;
var MAXPLAYERS = 16;
var MAXXDIM = 1600;
var MAXYDIM = 1200;
var MAXPALOOKUPS = 256;
var MAXPSKYTILES = 256;
var MAXSPRITESONSCREEN = 1024;

var sector = structArray(Sector, MAXSECTORS);

function Sector() {
    this.wallptr = 0;
    this.wallnum = 0;
    this.ceilingz = 0;
    this.floorz = 0;
    this.ceilingstat = 0;
    this.floorstat = 0;
    this.ceilingpicnum = 0;
    this.ceilingheinum = 0;
    this.ceilingshade = 0;
    this.ceilingpal = 0;
    this.ceilingxpanning = 0;
    this.ceilingypanning = 0;
    this.floorpicnum = 0;
    this.floorheinum = 0;
    this.floorshade = 0;
    this.floorpal = 0;
    this.floorxpanning = 0;
    this.floorypanning = 0;
    this.visibility = 0;
    this.filler = 0;
    this.lotag = 0;
    this.hitag = 0;
    this.extra = 0;
}

//EXTERN uint16_t mapCRC;

//EXTERN int32_t spritesortcnt;
//EXTERN spritetype tsprite[MAXSPRITESONSCREEN];

var vidoption = 0;
var xdim, ydim, numpages = 0;

//// Fast way to retrive the start of a column in the framebuffer, given a screenspace X coordinate.
var ylookup = new Int32Array(MAXYDIM + 1);

var yxaspect, viewingrange;

var validmodecnt;
//EXTERN short validmode[256];
//EXTERN int32_t validmodexdim[256], validmodeydim[256];

var numsectors, numwalls;
var totalclock;
var numframes, randomseed;

var sinTable = new Int16Array(2048);
var palette = new Uint8Array(2048);
var numpalookups;


//EXTERN uint8_t  palette[768];
//EXTERN short numpalookups;
var palookup = new Uint8Array(MAXPALOOKUPS);
var parallaxtype, showinvisibility;
var parallaxyoffs, parallaxyscale;
var visibility, parallaxvisibility; pskyoff

var windowx1, windowy1, windowx2, windowy2;
var startumost = new Int16Array(MAXXDIM), startdmost = new Int16Array(MAXXDIM);

var pskyoff = new Int16Array(MAXPSKYTILES), pskybits;

/*
 * These variables are for auto-mapping with the draw2dscreen function.
 * When you load a new board, these bits are all set to 0 - since
 * you haven't mapped out anything yet.  Note that these arrays are
 * bit-mapped.
 * If you want draw2dscreen() to show sprite #54 then you say:
 *    spritenum = 54;
 *    show2dsprite[spritenum>>3] |= (1<<(spritenum&7));
 * And if you want draw2dscreen() to not show sprite #54 then you say:
 *    spritenum = 54;
 *    show2dsprite[spritenum>>3] &= ~(1<<(spritenum&7));
 * Automapping defaults to 0 (do nothing).  If you set automapping to 1,
 *    then in 3D mode, the walls and sprites that you see will show up the
 *    next time you flip to 2D mode.
 */
var show2dsector = new Uint8Array((MAXSECTORS + 7) >> 3);
var show2dwallnew = new Uint8Array((MAXWALLS + 7) >> 3);
var show2dspritenew = new Uint8Array((MAXSPRITES + 7) >> 3);
var automapping = 0;
