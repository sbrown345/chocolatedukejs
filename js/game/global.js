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


var script = new Int8Array(MAXSCRIPTSIZE), scriptptr, insptr, labelcode, labelcnt;
var actorscrptr = new Int8Array(MAXTILES), parsing_actor;
var label, textptr, error, warning;
var killit_flag;
var music_pointer;
var actortype = new Uint8Array(MAXTILES);