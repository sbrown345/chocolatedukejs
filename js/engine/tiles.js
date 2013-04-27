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

var numTiles;

var gotpic = new Uint8Array((MAXTILES + 7) >> 3);

function setviewtotile(tilenume, tileWidth, tileHeight) {
    var i, j;
    printf("todo setviewtotile", tilenume);
    /* DRAWROOMS TO TILE BACKUP&SET CODE */
    tiles[tilenume].dim.width = tileWidth;
    tiles[tilenume].dim.height = tileHeight;
    bakxsiz[setviewcnt] = tileWidth;
    bakysiz[setviewcnt] = tileHeight;
    bakvidoption[setviewcnt] = vidoption;
    vidoption = 2;
    bakframeplace[setviewcnt] = frameplace;
    console.warning("following line setting frameplace screws screen up after demo");
    //frameplace = new PointerHelper(tiles[tilenume].data || new Uint8Array() /*todo: check this is alright?*/);
    bakwindowx1[setviewcnt] = windowx1;
    bakwindowy1[setviewcnt] = windowy1;
    bakwindowx2[setviewcnt] = windowx2;
    bakwindowy2[setviewcnt] = windowy2;
    copybufbyte(startumost, windowx1, bakumost, windowx1, (windowx2 - windowx1 + 1) * 2);
    copybufbyte(startdmost, windowx1, bakdmost, windowx1, (windowx2 - windowx1 + 1) * 2);
    setView(0, 0, tileHeight - 1, tileWidth - 1);
    setAspect(65536, 65536);
    j = 0;
    for(i=0; i<=tileWidth; i++) {
        ylookup[i] = j;
        j += tileWidth;
    }
    setBytesPerLine(tileHeight);
    setviewcnt++;
}


//94

//1. Lock a picture in the cache system.
//2. Mark it as used in the bitvector tracker.
function setgotpic(tileNume) {
    if (tiles[tileNume].lock < 200) {
        tiles[tileNume].lock = 199;
    }
    
    gotpic[tileNume >> 3] |= pow2char[tileNume & 7];
}

// 108

function loadTile(tileNume) {
    var i, tileFileSize;

    if ((tileNume >>> 0) >= MAXTILES) {
        return;
    }

    tileFileSize = tiles[tileNume].dim.width * tiles[tileNume].dim.height;

    if (tileFileSize <= 0) {
        return;
    }

    i = tilefilenum[tileNume];

    if (i !== artfilnum) {
        if (artfil !== -1) {
            kclose(artfil);
        }

        artfilnum = i;
        artfilplc = 0;

        var artfilenameSplit = artfilename.split("");
        artfilenameSplit[7] = String.fromCharCode((i % 10) + 48);
        artfilenameSplit[6] = String.fromCharCode(((i / 10) % 10) + 48);
        artfilenameSplit[5] = String.fromCharCode(((i / 100) % 10) + 48);
        artfilename = artfilenameSplit.join("");
        artfil = TCkopen4load(artfilename, false);

        if (artfil === -1) {
            throw new Error("Error, unable to load artfile:'" + artfilename + "'");
        }

        faketimerhandler();
    }

    if (!tiles[tileNume].data) {
        // todo: check this works, this is some allocache stuff ??
        tiles[tileNume].lock = 199;
        tiles[tileNume].data = new Uint8Array(tileFileSize);
    }

    if (artfilplc != tilefileoffs[tileNume]) {
        klseek(artfil, tilefileoffs[tileNume] - artfilplc, SEEK_CUR);
        faketimerhandler();
    }

    kread(artfil, tiles[tileNume].data, tileFileSize);
    faketimerhandler();
    artfilplc = tilefileoffs[tileNume] + tileFileSize;
}

//197
function loadPics(filename, gamedir) {
    var offscount, localtilestart, localtileend, dasiz;
    var file, i, j, k;

    artfilename = filename;

    for (i = 0; i < MAXTILES; i++) {
        tiles[i].dim.width = 0;
        tiles[i].dim.height = 0;
        tiles[i].dim.animFlags = 0;
    }

    artsize = 0;

    numtilefiles = 0;

    do {
        k = numtilefiles;

        var artfilenameSplit = artfilename.split("");
        artfilenameSplit[7] = String.fromCharCode((k % 10) + 48);
        artfilenameSplit[6] = String.fromCharCode(((k / 10) % 10) + 48);
        artfilenameSplit[5] = String.fromCharCode(((k / 100) % 10) + 48);
        artfilename = artfilenameSplit.join("");

        if ((file = TCkopen4load(artfilename, false)) != -1) {
            var artversion = kread32(file);
            if (artversion != 1) {
                return -1;
            }

            numTiles = kread32(file);
            localtilestart = kread32(file);
            localtileend = kread32(file);

            for (i = localtilestart; i <= localtileend; i++)
                tiles[i].dim.width = kread16(file);

            for (i = localtilestart; i <= localtileend; i++)
                tiles[i].dim.height = kread16(file);

            for (i = localtilestart; i <= localtileend; i++)
                tiles[i].animFlags = kread32(file);

            offscount = 4 + 4 + 4 + 4 + ((localtileend - localtilestart + 1) << 3);
            for (i = localtilestart; i <= localtileend; i++) {
                tilefilenum[i] = k;
                tilefileoffs[i] = offscount;
                dasiz = tiles[i].dim.width * tiles[i].dim.height;
                offscount += dasiz;
                artsize += ((dasiz + 15) & 0xfffffff0);
            }
            kclose(file);

            numtilefiles++;
        }

    } while (k != numtilefiles);

    console.log("Art files loaded");

    clearbuf(gotpic, 0, (MAXTILES + 31) >> 5, 0); // todo: check

    cachesize = Math.max(artsize, 1048576);
    // skipped some while loop that change cachesize

    initCache(picsiz, cachesize); // todo

    for (i = 0; i < MAXTILES; i++) {
        j = 15;
        while ((j>1) && (pow2long[j] > tiles[i].dim.width)) {
            j--;
        }

        picsiz[i] = j;
        
        j = 15;
        
        while ((j > 1) && (pow2long[j] > tiles[i].dim.height)) {
            j--;
        }

        picsiz[i] += (j << 4);
    }

    artfil = -1;
    artfilnum = -1;
    artfilplc = 0;

    return 0;
}

//301
function TILE_MakeAvailable( picId){
    if (tiles[picId].data == null) {
        loadTile(picId);
    }
}


/*
 FCS:   If a texture is animated, this will return the offset to add to tilenum
 in order to retrieve the texture to display.
 */
function animateoffs(tilenum) {
    var i, k, offs;
    
    offs = 0;
    
    i = (totalclocklock>>((tiles[tilenum].animFlags>>24)&15));
    
    if ((tiles[tilenum].animFlags&63) > 0){
        switch(tiles[tilenum].animFlags&192)
        {
            case 64:
                k = (i%((tiles[tilenum].animFlags&63)<<1));
                if (k < (tiles[tilenum].animFlags&63))
                    offs = k;
                else
                    offs = (((tiles[tilenum].animFlags&63)<<1)-k);
                break;
            case 128:
                offs = (i%((tiles[tilenum].animFlags&63)+1));
                break;
            case 192:
                offs = -(i%((tiles[tilenum].animFlags&63)+1));
        }
    }
    
    return(offs);
}