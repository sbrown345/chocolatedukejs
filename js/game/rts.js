//'use strict';

function LumpInfo() {
    this.name = "";
    this.handle = 0;
    this.position = 0;
    this.size = 0;
}

var RTS = {};

var numlumps;
var lumpinfo;

var lumplockbyte = new Uint8Array(11);

RTS.init = function(filename) {
    numlumps = 0;
    lumpinfo = structArray(LumpInfo, 5);

    console.log("RTS Manager Started.");
    
    console.log("todo: check for " + filename); //todo

    if (!numlumps) {
        return;
    }

    throw new Error("todo set up caching");
};