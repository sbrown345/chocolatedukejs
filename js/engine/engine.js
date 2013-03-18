'use strict';

var sqrTable = new Uint16Array(4096), shLookup = new Uint16Array(4096 + 256);

var recipTable = new Int32Array(2048), fpuasm = 0;

var tablesLoaded = false;

function initKSqrt() {
    var i, j, k;
    j = 1;
    k = 0;
    for (i = 0; i < 4096; i++) {
        if (i >= j) {
            j <<= 2;
            k++;
        }

        sqrTable[i] = msqrtasm((i << 18) + 131072) << 1;
        shLookup[i] = (k << 1) + ((10 - k) << 8);
        if (i < 256) {
            shLookup[i + 4096] = ((k + 6) << 1) + ((10 - (k + 6)) << 8);
        }
    }
}

function loadTables() {
    var i = 0, fil;
    if (!tablesLoaded) {
        initKSqrt();

    }
}

function initEngine() {
    var i;

    loadTables();

    for (i = 0; i < 2048; i++) {
        recipTable[i] = divScale30(2048, i + 2048);
    }
    
    throw new Error("todo")
}