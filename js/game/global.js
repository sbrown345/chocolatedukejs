'use strict';

var grpVersion = 0;

var ps = structArray(Player, MAXPLAYERS);
//var ps = new Array(MAXPLAYERS);
//for (var i = 0; i < ps.length; i++) {
//    ps[i] = new Player();
//}

var ud = {
    ridecule: new Array(10),
    savegame: new Array(10),
    pwlockout: new Array(128),
    rtsname: new Array(10),
    mapCRC: new Uint32Array(MAXPLAYERS),
    conCRC: new Uint32Array(MAXPLAYERS),
    conSize: new Uint32Array(MAXPLAYERS),
};

var tempbuf = new Uint8Array(2048);
var packbuf = new Uint8Array(576);

var script = new Int8Array(MAXSCRIPTSIZE), scriptptr, insptr, labelcode, labelcnt;
var actorscrptr = new Int8Array(MAXTILES), parsing_actor;
var labels = new Array(50000 /*todo, not sure of limit...*/), textptr, textptrIdx = 0, error, warning;
var killit_flag;
var music_pointer;
var actortype = new Uint8Array(MAXTILES);
