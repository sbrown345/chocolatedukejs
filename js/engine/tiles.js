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

    clearbuf(gotpic, (MAXTILES + 31) >> 5, 0); // todo: check

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
        console.log("picsiz[%i] = %i", i, picsiz[i]);
    }

    artfil = -1;
    artfilnum = -1;
    artfilplc = 0;

    return 0;
}