﻿//'use strict';

var MAXGROUPFILES = 4;

var gameDir = "";

var groupefil_crc32 = new Int32Array(MAXGROUPFILES);

/* Seek method constants */

var SEEK_CUR = 1;
var SEEK_END = 2;
var SEEK_SET = 0;

function grpArchive_t() {
    this.numFiles = 0; //Number of files in the archive.
    this.gfilelist = null; //Array containing the filenames.
    this.fileOffsets = 0; //Array containing the file offsets.
    this.filesizes = 0; //Array containing the file offsets.
    this.fileDescriptor = 0; //The fd used for open,read operations.
    this.crc32 = 0; //Hash to recognize GRP: Duke Shareware, Duke plutonimum etc...
}

function grpSet_t() {
    this.archives = new Array(MAXGROUPFILES);
    this.num = 0;
}

var grpSet = new grpSet_t();
var grpStream;

function initgroupfile(filename) {
    console.log("Loading " + filename + "...");

    if (grpSet.num == MAXGROUPFILES) {
        console.error("Error: Unable to open an extra GRP archive <= No more slot available.");
        return -1;
    }

    var archive = grpSet.archives[grpSet.num] = new grpArchive_t();

    var buffer = open(filename);
    var ds = new DataStream(buffer);

    //FCS   : The ".grp" file format is just a collection of a lot of files stored into 1 big one.
    //KS doc: I tried to make the format as simple as possible: The first 12 bytes contains my name,
    //"KenSilverman". The next 4 bytes is the number of files that were compacted into the
    //group file. Then for each file, there is a 16 byte structure, where the first 12
    //bytes are the filename, and the last 4 bytes are the file's size. The rest of the
    //group file is just the raw data packed one after the other in the same order as the list
    //of files. - ken

    // Check the magic number (12 bytes header).
    if (ds.readString(12) != "KenSilverman") {
        return -1;
    }

    // The next 4 bytes of the header feature the number of files in the GRP archive.
    archive.numFiles = ds.readUint32();

    archive.gfilelist = new Array(archive.numFiles);
    archive.fileOffsets = new Int32Array(archive.numFiles);
    archive.filesizes = new Int32Array(archive.numFiles);

    // Load the full index 16 bytes per file (12bytes for name + 4 bytes for the size).
    var j = 12 + 4 + archive.numFiles * 16;
    for (var i = 0; i < archive.numFiles; i++) {
        archive.gfilelist[i] = ds.readString(12).trimNullTerminatedString();
        var k = ds.readInt32();
        archive.filesizes[i] = k;
        archive.fileOffsets[i] = j;
        j += k;
    }

    // Rewind the fileDescriptor
    ds.position = 0;

    archive.crc32 = crc32Update(ds.mapUint8Array(ds.byteLength), j, archive.crc32);

    groupefil_crc32[grpSet.num] = archive.crc32;

    grpSet.num++;

    grpStream = ds;

    return grpSet - 1;
}

function crc32TableGen() {
    return [0,
        1996959894,
        3993919788,
        2567524794,
        124634137,
        1886057615,
        3915621685,
        2657392035,
        249268274,
        2044508324,
        3772115230,
        2547177864,
        162941995,
        2125561021,
        3887607047,
        2428444049,
        498536548,
        1789927666,
        4089016648,
        2227061214,
        450548861,
        1843258603,
        4107580753,
        2211677639,
        325883990,
        1684777152,
        4251122042,
        2321926636,
        335633487,
        1661365465,
        4195302755,
        2366115317,
        997073096,
        1281953886,
        3579855332,
        2724688242,
        1006888145,
        1258607687,
        3524101629,
        2768942443,
        901097722,
        1119000684,
        3686517206,
        2898065728,
        853044451,
        1172266101,
        3705015759,
        2882616665,
        651767980,
        1373503546,
        3369554304,
        3218104598,
        565507253,
        1454621731,
        3485111705,
        3099436303,
        671266974,
        1594198024,
        3322730930,
        2970347812,
        795835527,
        1483230225,
        3244367275,
        3060149565,
        1994146192,
        31158534,
        2563907772,
        4023717930,
        1907459465,
        112637215,
        2680153253,
        3904427059,
        2013776290,
        251722036,
        2517215374,
        3775830040,
        2137656763,
        141376813,
        2439277719,
        3865271297,
        1802195444,
        476864866,
        2238001368,
        4066508878,
        1812370925,
        453092731,
        2181625025,
        4111451223,
        1706088902,
        314042704,
        2344532202,
        4240017532,
        1658658271,
        366619977,
        2362670323,
        4224994405,
        1303535960,
        984961486,
        2747007092,
        3569037538,
        1256170817,
        1037604311,
        2765210733,
        3554079995,
        1131014506,
        879679996,
        2909243462,
        3663771856,
        1141124467,
        855842277,
        2852801631,
        3708648649,
        1342533948,
        654459306,
        3188396048,
        3373015174,
        1466479909,
        544179635,
        3110523913,
        3462522015,
        1591671054,
        702138776,
        2966460450,
        3352799412,
        1504918807,
        783551873,
        3082640443,
        3233442989,
        3988292384,
        2596254646,
        62317068,
        1957810842,
        3939845945,
        2647816111,
        81470997,
        1943803523,
        3814918930,
        2489596804,
        225274430,
        2053790376,
        3826175755,
        2466906013,
        167816743,
        2097651377,
        4027552580,
        2265490386,
        503444072,
        1762050814,
        4150417245,
        2154129355,
        426522225,
        1852507879,
        4275313526,
        2312317920,
        282753626,
        1742555852,
        4189708143,
        2394877945,
        397917763,
        1622183637,
        3604390888,
        2714866558,
        953729732,
        1340076626,
        3518719985,
        2797360999,
        1068828381,
        1219638859,
        3624741850,
        2936675148,
        906185462,
        1090812512,
        3747672003,
        2825379669,
        829329135,
        1181335161,
        3412177804,
        3160834842,
        628085408,
        1382605366,
        3423369109,
        3138078467,
        570562233,
        1426400815,
        3317316542,
        2998733608,
        733239954,
        1555261956,
        3268935591,
        3050360625,
        752459403,
        1541320221,
        2607071920,
        3965973030,
        1969922972,
        40735498,
        2617837225,
        3943577151,
        1913087877,
        83908371,
        2512341634,
        3803740692,
        2075208622,
        213261112,
        2463272603,
        3855990285,
        2094854071,
        198958881,
        2262029012,
        4057260610,
        1759359992,
        534414190,
        2176718541,
        4139329115,
        1873836001,
        414664567,
        2282248934,
        4279200368,
        1711684554,
        285281116,
        2405801727,
        4167216745,
        1634467795,
        376229701,
        2685067896,
        3608007406,
        1308918612,
        956543938,
        2808555105,
        3495958263,
        1231636301,
        1047427035,
        2932959818,
        3654703836,
        1088359270,
        936918000,
        2847714899,
        3736837829,
        1202900863,
        817233897,
        3183342108,
        3401237130,
        1404277552,
        615818150,
        3134207493,
        3453421203,
        1423857449,
        601450431,
        3009837614,
        3294710456,
        1567103746,
        711928724,
        3020668471,
        3272380065,
        1510334235,
        755167117];
}

function crc32Update(buf, length, crcToUpdate) {
    var crc32Table = crc32TableGen();
    crcToUpdate ^= 0xFFFFFFFF;

    var bufIdx = 0;
    while (length--) {
        crcToUpdate = (crc32Table[(crcToUpdate ^ buf[bufIdx++]) & 0xFF] ^ (crcToUpdate >>> 8)) >>> 0;
    }

    return (crcToUpdate ^ 0xFFFFFFFF) >>> 0;
}

/*
 *                                      16   12   5
 * this is the CCITT CRC 16 polynomial X  + X  + X  + 1.
 * This is 0x1021 when x is 2, but the way the algorithm works
 * we use 0x8408 (the reverse of the bit pattern).  The high
 * bit is always assumed to be set, thus we only use 16 bits to
 * represent the 17 bit value.
 */

var POLY = 0x8408;   /* 1021H bit reversed */

function crc16(array, data_p, length) {
    throw new Error("todo")

    var i;
    var data;
    var crc = 0xffff;

    if (length == 0) {
        return (~crc);
    }

    do {
        data = 0xff & array[data_p++];
        for (i = 0; i < 8; i++, data >>= 1) {
            data >>= 1;
            if ((crc & 0x0001) ^ (data & 0x0001)) {
                crc = (crc >> 1) ^ POLY;
            } else {
                crc >>= 1;
            }
        }
    } while (--length);

    crc = ~crc;
    data = crc;
    crc = (crc << 8) | (data >> 8 & 0xff);

    return crc;
}


var fileType = { SYSTEM_FILE: 0, GRP_FILE: 1 };

function OpenFile() {
    this.clear();
}

OpenFile.prototype.clear = function() {
    this.type = 0;
    this.fd = 0; //Either the fileDescriptor or the fileIndex in a GRP depending on the type.
    this.cursor = 0; //lseek cursor
    this.grpID = 0; //GRP id
    this.used = 0; //Marker 1=used
};

var MAXOPENFILES = 64;
var openFiles = structArray(OpenFile, MAXOPENFILES);

function kopen4load(filename, readfromGrp) {
    var newHandle = MAXOPENFILES - 1;
    var archive;

    while (openFiles[newHandle].used && newHandle >= 0) {
        newHandle--;
    }

    if (newHandle < 0) {
        throw new Error("Too Many files open!");
    }

    //Try to look in the filesystem first. In this case fd = filedescriptor.
    //todo: look in normal file system

    //Try to look in the GRP archives. In this case fd = index of the file in the GRP.
    for (var k = grpSet.num - 1; k >= 0; k--) {
        archive = grpSet.archives[k];

        for (var i = archive.numFiles - 1; i >= 0; i--) {
            if (archive.gfilelist[i].toLowerCase().trim() == filename.toLowerCase().trim()) {
                openFiles[newHandle].type = fileType.GRP_FILE;
                openFiles[newHandle].used = 1;
                openFiles[newHandle].cursor = 0;
                openFiles[newHandle].fd = i;
                openFiles[newHandle].grpID = k;
                return newHandle;
            }
        }
    }

    return -1;
}

//function kreadtext(handle, leng) {
//    var openFile = openFiles[handle];

//    if (!openFile.used) {
//        throw new Error("Invalid handle. Unrecoverable error.");
//    }

//    var text = readText(openFile, leng);

//    return text;
//}

//function readText(openFile, length) {
//    grpStream.position = grpSet.archives[openFile.grpID]


//    this.fileOffsets = 0; //Array containing the file offsets.
//    this.filesizes = 0;

//}

//332
function kread(handle, buffer, leng) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];

    //Adjust leng so we cannot read more than filesystem-cursor location.
    leng = Math.min(leng, archive.filesizes[openFile.fd]);
    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    for (var i = 0; i < leng; i++) {
        buffer[i] = grpStream.readUint8();
    }

    openFile.cursor += leng;
}

//368
function kread16(handle) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];

    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    openFile.cursor += 2;
    return grpStream.readInt16();
}

//376
function kread32(handle) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];

    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    openFile.cursor += 4;
    return grpStream.readInt32();
}

//384
function kread8(handle) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];

    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    openFile.cursor += 1;
    return grpStream.readInt8();
}

function kreadUint8(handle) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];

    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    openFile.cursor += 1;
    return grpStream.readUint8();
}

//new for JS
function kreadText(handle, leng) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];

    //Adjust leng so we cannot read more than filesystem-cursor location.
    leng = Math.min(leng, archive.filesizes[openFile.fd]);
    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    var array = new Array(leng);
    for (var i = 0; i < leng; i++) {
        array[i] = String.fromCharCode(grpStream.readUint8());
    }
    var text = array.join("");

    openFile.cursor += leng;
    return text;
}

//391
function klseek(handle, offset, whence) {
    if (!openFiles[handle].used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFiles[handle].grpID];
    switch (whence) {
        case 0: // SEEK_SET
            openFiles[handle].cursor = offset;
            break;
        case 2: // SEEK_END
            openFiles[handle].cursor = archive.filesizes[openFiles[handle].fd];
            break;
        case 1: // SEEK_CUR
            openFiles[handle].cursor += offset;
            break;
    }

    return openFiles[handle].cursor;
}

//428
function kfilelength(handle) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalide handle. Unrecoverable error.");
    }

    if (openFile.type = fileType.SYSTEM_FILE) {
        throw new Error("todo kfilelength SYSTEM_FILE");
    } else {
        var archive = grpSet.archives[openFile.grpID];
        return archive.filesizes[openFile.fd];
    }
}

//449
function kclose(handle) {
    //This is a typical handle for a non existing file.
    if (handle == -1)
        return;
    
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw "Invalide handle. Unrecoverable error.";
    }

    openFiles[handle].clear();
}

//474
/* Internal LZW variables */
var LZWSIZE = 16384;/* Watch out for shorts! */
var lzwbuf1, lzwbuf4, lzwbuf5;
var lzwbuflock = new Uint8Array(5);
var lzwbuf2, lzwbuf3;

if (!ArrayBuffer.prototype.slice) {
    // IE10
    ArrayBuffer.prototype.slice = function(start, end) {
        var that = new Uint8Array(this);
        if (end == undefined) end = that.length;
        var result = new ArrayBuffer(end - start);
        var resultArray = new Uint8Array(result);
        for (var i = 0; i < resultArray.length; i++)
            resultArray[i] = that[i + start];
        return result;
    };
}

//544
function uncompress(lzwinbuf, compleng, lzwoutbuf) {
    var strtot, currstr, numbits, oneupnumbits;
    var i, dat, leng, bitcnt, outbytecnt;
    var shortptr;

    shortptr = new Int16Array(lzwinbuf.buffer);
    strtot = shortptr[1];
    if (strtot == 0) {
        copybuf((lzwinbuf + 4), (lzwoutbuf), ((compleng - 4) + 3) >> 2);
        return (shortptr[0]); /* uncompleng */
    }
    for (i = 255; i >= 0; i--) { lzwbuf2[i] = i; lzwbuf3[i] = i; }
    currstr = 256; bitcnt = (4 << 3); outbytecnt = 0;
    numbits = 8; oneupnumbits = (1 << 8);

    var lngPtrHelper_int32;
    do {
        lngPtrHelper_int32 = new Int32Array(lzwinbuf.buffer.slice(bitcnt >> 3, (bitcnt >> 3) + 4));

        dat = ((lngPtrHelper_int32[0] >> (bitcnt & 7)) & (oneupnumbits - 1));
        bitcnt += numbits;
        if ((dat & ((oneupnumbits >> 1) - 1)) > ((currstr - 1) & ((oneupnumbits >> 1) - 1)))
        { dat &= ((oneupnumbits >> 1) - 1); bitcnt--; }

        lzwbuf3[currstr] = dat;

        for (leng = 0; dat >= 256; leng++) {
            lzwbuf1[leng] = lzwbuf2[dat];
            dat = lzwbuf3[dat];
        }

        lzwoutbuf[outbytecnt++] = dat;
        for (i = leng - 1; i >= 0; i--) {
            lzwoutbuf[outbytecnt++] = lzwbuf1[i];
        }

        lzwbuf2[currstr - 1] = dat; lzwbuf2[currstr] = dat;
        currstr++;
        if (currstr > oneupnumbits) { numbits++; oneupnumbits <<= 1; }
    } while (currstr < strtot);
    return (shortptr[0]); /* uncompleng */
}


//584

function kdfread(buffer, dasizeof, count, fil) {
    var i, j;
    var k, kgoal;
    var leng;
    var ptr;

    lzwbuflock[0] = lzwbuflock[1] = lzwbuflock[2] = lzwbuflock[3] = lzwbuflock[4] = 200;
    if (!lzwbuf1) lzwbuf1 = new Uint8Array(LZWSIZE + (LZWSIZE >> 4));
    if (!lzwbuf2) lzwbuf2 = new Int16Array((LZWSIZE + (LZWSIZE >> 4)));
    if (!lzwbuf3) lzwbuf3 = new Int16Array((LZWSIZE + (LZWSIZE >> 4)));
    if (!lzwbuf4) lzwbuf4 = new Uint8Array(LZWSIZE);
    if (!lzwbuf5) lzwbuf5 = new Uint8Array(LZWSIZE + (LZWSIZE >> 4));

    if (dasizeof > LZWSIZE) {
        count *= dasizeof;
        dasizeof = 1;
    }

    ptr = new PointerHelper(new Uint8Array(buffer.length * dasizeof));

    leng = kread16(fil);
    kread(fil, lzwbuf5, leng);
    k = 0;
    kgoal = uncompress(lzwbuf5, leng, lzwbuf4);

    copybufbyte(lzwbuf4, 0, ptr.array, 0, dasizeof);
    k += dasizeof;
    
    for (i = 1; i < count; i++) {
        if (k >= kgoal) {
            leng = kread16(fil);
            kread(fil, lzwbuf5, leng);
            k = 0;
            kgoal = uncompress(lzwbuf5, leng, lzwbuf4);
        }
        printf("leng: %i, kgoal: %i\n", leng, kgoal);
        for (j = 0; j < dasizeof; j++) {
            printf("i: %i, j: %i, k: %i, ptr[j]: %i, lzwbuf4[j+k]: %i all: %i\n",
                        i,     j,    k,  ptr.array[ptr.position + j], lzwbuf4[j + k], ((ptr.array[ptr.position + j] + lzwbuf4[j + k]) & 255));
            ptr.array[ptr.position + j + dasizeof] = /*(uint8_t )*/ ((ptr.array[ptr.position + j] + lzwbuf4[j + k]) & 255);
        }

        k += dasizeof;
        ptr.position += dasizeof;
    }

    var ds = new DataStream(ptr.array);
    for ( i = 0; i < count; i++) {
        //if (i == 23) debugger;
        //todo: will need different structs...when this func is used for something else
       var struct =  ds.readStruct([
            'avel', 'int8',
            'horz', 'int8',
            'fvel', 'int16',
            'svel', 'int16',
            'bits', 'uint32']);
        //console.log(struct)
        buffer[i].avel = struct.avel;
        buffer[i].horz = struct.horz;
        buffer[i].fvel = struct.fvel;
        buffer[i].svel = struct.svel;
        buffer[i].bits = struct.bits;
    }
    lzwbuflock[0] = lzwbuflock[1] = lzwbuflock[2] = lzwbuflock[3] = lzwbuflock[4] = 1;
}

//713
function TCkopen4load(filename, readfromGrp) {
    var fullFilename = "";
    var result = 0;

    if (gameDir && !readfromGrp) {
        fullFilename = gameDir + "\\" + filename;
        throw new Error("todo TCkopen4load gameDir stuff");
    } else {
        fullFilename = filename;
    }

    result = kopen4load(fullFilename, readfromGrp);

    return result;
}

function getGameDir() {
    return gameDir;
}

function getGRPcrc32(grpId) {
    return grpSet.archives[grpId].crc32 | 0;
}