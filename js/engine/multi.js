//'use strict';

var Multi = {};

Multi.unstable = {};

var MAXPLAYERS = 16;
var BAKSIZ = 16384;
var SIMULATEERRORS = 0;
var SHOWSENDPACKETS = 0;
var SHOWGETPACKETS = 0;
var PRINTERRORS = 0;

var incnt = new Array(MAXPLAYERS), outcntplc = new Array(MAXPLAYERS), outcntend = new Array(MAXPLAYERS);
var errorgotnum = new Uint8Array(MAXPLAYERS);
var errorfixnum = new Uint8Array(MAXPLAYERS);
var errorresendnum = new Uint8Array(MAXPLAYERS);

var crcTable = new Array(256);

var bakpacketptr = multiDimArray(Int16Array, MAXPLAYERS, 256), bakpacketlen = multiDimArray(Int16Array, MAXPLAYERS, 256);
var bakpacketbuf = new Uint8Array(BAKSIZ);
var bakpacketplc = 0;

var myconnectindex, numplayers;
var connecthead, connectpoint2 = new Int16Array(MAXPLAYERS);
var syncstate = 0;

Multi.unstable.initCrc = function () {
    var i, j, k, a;

    for (j = 0; j < 256; j++)      /* Calculate CRC table */ {
        k = (j << 8);
        a = 0;
        for (i = 7; i >= 0; i--) {
            if (((k ^ a) & 0x8000) > 0)
                a = ((a << 1) & 65535) ^ 0x1021;   /* 0x1021 = genpoly */
            else
                a = ((a << 1) & 65535);
            k = ((k << 1) & 65535);
        }
        crcTable[j] = (a & 65535);
    }
};

//166
Multi.unstable.initMultiPlayers = function (multiOption, comRateOption, priority) {
    var i;

    Multi.unstable.initCrc();

    for (i = 0; i < MAXPLAYERS; i++) {
        incnt[i] = 0;
        outcntplc[i] = 0;
        outcntend[i] = 0;
        incnt[i] = 0;
    }

    i = 0;
    console.log("net args todo");
    
    if ((i == 0) || (i + 1 == _argc)) {
        numplayers = 1;
        myconnectindex = 0;
        connecthead = 0;
        connectpoint2[0] = -1;
        return;
    }

    throw new Error("todo - network stuff");
};

//368
Multi.unstable.getoutputcirclesize = function (multiOption, comRateOption, priority) {
    return 0;
};

//519
Multi.unstable.flushPackets = function (multiOption, comRateOption, priority) {
    //todo
};