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

var CLIPMASK0 = (((1) << 16) + 1);
var CLIPMASK1 = (((256) << 16) + 64);

/*
 * ceilingstat/floorstat:
 *   bit 0: 1 = parallaxing, 0 = not                                 "P"
 *   bit 1: 1 = groudraw, 0 = not
 *   bit 2: 1 = swap x&y, 0 = not                                    "F"
 *   bit 3: 1 = double smooshiness                                   "E"
 *   bit 4: 1 = x-flip                                               "F"
 *   bit 5: 1 = y-flip                                               "F"
 *   bit 6: 1 = Align texture to first wall of sector                "R"
 *   bits 7-8:                                                       "T"
 *          00 = normal floors
 *          01 = masked floors
 *          10 = transluscent masked floors
 *          11 = reverse transluscent masked floors
 *   bits 9-15: reserved
 */

/* 40 bytes */
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

/*
 * cstat:
 *   bit 0: 1 = Blocking wall (use with clipmove, getzrange)         "B"
 *   bit 1: 1 = bottoms of invisible walls swapped, 0 = not          "2"
 *   bit 2: 1 = align picture on bottom (for doors), 0 = top         "O"
 *   bit 3: 1 = x-flipped, 0 = normal                                "F"
 *   bit 4: 1 = masking wall, 0 = not                                "M"
 *   bit 5: 1 = 1-way wall, 0 = not                                  "1"
 *   bit 6: 1 = Blocking wall (use with hitscan / cliptype 1)        "H"
 *   bit 7: 1 = Transluscence, 0 = not                               "T"
 *   bit 8: 1 = y-flipped, 0 = normal                                "F"
 *   bit 9: 1 = Transluscence reversing, 0 = normal                  "T"
 *   bits 10-15: reserved
 */

/* 32 bytes */
function Wall() {
    this.x = 0;
    this.y = 0;
    this.point2 = 0;
    this.nextwall = 0;
    this.nextsector = 0;
    this.cstat = 0;
    this.picnum = 0;
    this.overpicnum = 0;
    this.shade = 0;
    this.pal = 0;
    this.xrepeat = 0;
    this.yrepeat = 0;
    this.xpanning = 0;
    this.ypanning = 0;
    this.lotag = 0;
    this.hitag = 0;
    this.extra = 0;
}

/*
 * cstat:
 *   bit 0: 1 = Blocking sprite (use with clipmove, getzrange)       "B"
 *   bit 1: 1 = transluscence, 0 = normal                            "T"
 *   bit 2: 1 = x-flipped, 0 = normal                                "F"
 *   bit 3: 1 = y-flipped, 0 = normal                                "F"
 *   bits 5-4: 00 = FACE sprite (default)                            "R"
 *             01 = WALL sprite (like masked walls)
 *             10 = FLOOR sprite (parallel to ceilings&floors)
 *   bit 6: 1 = 1-sided sprite, 0 = normal                           "1"
 *   bit 7: 1 = Real centered centering, 0 = foot center             "C"
 *   bit 8: 1 = Blocking sprite (use with hitscan / cliptype 1)      "H"
 *   bit 9: 1 = Transluscence reversing, 0 = normal                  "T"
 *   bits 10-14: reserved
 *   bit 15: 1 = Invisible sprite, 0 = not invisible
 */

/* 44 bytes */
function Sprite() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    
    //this.cstat = 0; //???
    // TODO: PERF MUST BE AWFUL!!
    var _cstat = new Int16Array(1);
    this.__defineGetter__("cstat", function () {
        return _cstat[0];
    });

    this.__defineSetter__("cstat", function (val) {
        _cstat[0] = val;
    });
    
    this.picnum = 0;
    this.shade = 0;
    this.pal = 0;
    this.clipdist = 0;
    this.filler = 0;
    this.xrepeat = 0;
    this.yrepeat = 0;
    this.xoffset = 0;
    this.yoffset = 0;
    this.sectnum = 0;
    this.statnum = 0;
    this.ang = 0;
    this.owner = 0;
    this.xvel = 0;
    this.yvel = 0;
    this.zvel = 0;
    this.lotag = 0;
    this.hitag = 0;
    this.extra = 0;
}

var sector = structArray(Sector, MAXSECTORS);
var wall = structArray(Wall, MAXSPRITES);
var sprite = structArray(Sprite, MAXSPRITES);

var mapCRC;

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
var numframes = 0, randomseed;

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

var headspritesect = new Int16Array(MAXSECTORS + 1), headspritestat = new Int16Array(MAXSECTORS + 1);
var prevspritesect = new Int16Array(MAXSPRITES), prevspritestat = new Int16Array(MAXSPRITES);
var nextspritesect = new Int16Array(MAXSPRITES), nextspritestat = new Int16Array(MAXSPRITES);

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
