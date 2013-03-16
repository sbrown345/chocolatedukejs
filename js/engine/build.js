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