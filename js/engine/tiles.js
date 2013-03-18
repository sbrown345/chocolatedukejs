'use strict';

function Dimensions() {
    this.width = 0;
    this.height = 0;
}

function Tile() {
    this.dim = new Dimensions();
    this.lock = 0;
    this.animFlags = 0;
    this.data = null;
}

var artfilename = "";

var tiles = structArray(Tile, MAXTILES);