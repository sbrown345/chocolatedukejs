'use strict';

var anim = new Animation();
var Anim_Started = false;

function LpFileheader() {
    ////this.id = 0; // 4 character ID == "LPF " */
    ////this.maxLps = 0; // max # largePages allowed. 256 FOR NOW.   */
    ////this.nLps = 0; // # largePages in this file. */
    ////this.nRecords = 0; // # records in this file.  65534 is current limit plus */
    ////// one for last-to-first delta for looping the animation */
    ////this.maxRecsPerLp = 0; // # records permitted in an lp. 256 FOR NOW.   */
    ////this.lpfTableOffset = 0; // Absolute Seek position of lpfTable.  1280 FOR NOW.
    ////// The lpf Table is an array of 256 large page structures
    ////// that is used to facilitate finding records in an anim
    ////// file without having to seek through all of the Large
    ////// Pages to find which one a specific record lives in. */
    ////this.contentType = 0; // 4 character ID == "ANIM" */
    ////this.width = 0; // Width of screen in pixels. */
    ////this.height = 0; // Height of screen in pixels. */
    ////this.variant = 0; // 0==ANIM. */
    ////this.version = 0; // 0==frame rate is multiple of 18 cycles/sec.
    ////// 1==frame rate is multiple of 70 cycles/sec.  */
    ////this.hasLastDelta = 0; // 1==Last record is a delta from last-to-first frame. */
    ////this.lastDeltaValid = 0; // 0==The last-to-first delta (if present) hasn't been
    ////// updated to match the current first&last frames,    so it
    ////// should be ignored. */
    ////this.pixelType = 0; //   /* 0==256 color. */
    ////this.CompressionType = 0; //      /* 1==(RunSkipDump) Only one used FOR NOW. */
    ////this.otherRecsPerFrm = 0; //      /* 0 FOR NOW. */
    ////this.bitmaptype = 0; //   /* 1==320x200, 256-color.  Only one implemented so far. */
    ////this.recordTypes = new Uint8Array(32); //      /* Not yet implemented. */
    ////this.nFrames = 0; //   /* In case future version adds other records at end of
    //////      file, we still know how many actual frames.
    //////    NOTE: DOES include last-to-first delta when present. */
    ////this.framesPerSecond = 0; // Number of frames to play per second. */
    ////this.pad2 = new Uint8Array(29); // 58 bytes of filler to round up to 128 bytes total. */
}

////function LpDescriptor() {
////    this.baseRecord = 0;   // Number of first record in this large page.
////    this.nRecords = 0;        // Number of records in lp.
////    // bit 15 of "nRecords" == "has continuation from previous lp".
////    // bit 14 of "nRecords" == "final record continues on next lp".
////    this.nBytes = 0;                  // Total number of bytes of contents, excluding header. 
////}

var lpDescriptor = ['baseRecord', 'uint16', // Number of first record in this large page.
    'nRecords', 'uint16', // Number of records in lp.
    // bit 15 of "nRecords" == "has continuation from previous lp".
// bit 14 of "nRecords" == "final record continues on next lp".
    'nBytes', 'uint16']; // Total number of bytes of contents, excluding header. , 256]

function Animation() {
    this.framecount = 0;          // current frame of anim
    this.lpheader = null; // file header will be loaded into this structure
    this.LpArray = new Array(256); // arrays of large page structs used to find frames
    this.curlpnum = 0;               // initialize to an invalid Large page number
    this.curlp = null;//new LpDescriptor();        // header of large page currently in memory
    this.thepage = new Uint16Array(0x8000);     // buffer where current large page is loaded
    this.imagebuffer = new Uint8Array(0x10000); // buffer where anim frame is decoded
    this.buffer = null;
    this.pal = new Uint8Array(768);
    this.currentframe = 0;
}

var Anim = {};

function checkAnimStarted(funcname) {
    if (!Anim_Started) {
        throw new Error("ANIMLIB_" + funcname + ": Anim has not been initialized");
    }
}

function findPage(frameNumber) {
    checkAnimStarted("findPage");
    for (var i = 0; i < anim.lpheader.nLps; i++) {
        if (anim.LpArray[i].baseRecord <= frameNumber &&
            anim.LpArray[i].baseRecord + anim.LpArray[i].nRecords > frameNumber) {
            return i;
        }
    }
    return i;
}

function loadPage(pageNumber) {
    var size, buffer;
    checkAnimStarted("loadPage");
    buffer = anim.buffer;
    if (anim.curlpnum != pageNumber) {
        anim.curlpnum = pageNumber;
        var ds = new DataStream(buffer.buffer);
        ds.position += 0xb00 + (pageNumber * 0x10000);
        anim.curlp = ds.readStruct(lpDescriptor);
        ds.position += 2;
        return ds.readUint16Array(anim.curlp.nBytes + (anim.curlp.nRecords * 2));
    }

    throw new Error("anim.curlpnum should not equal pageNumber");
}

function CPlayRunSkipDump(srcStream, destStream) {
    var cnt = new Int8Array(1);
    var wordCnt = new Uint16Array(1);
    var pixel;

    for (; ;) {
        // nextOp
        cnt[0] = srcStream.readInt8();
        if (cnt[0] > 0) {
            // dump
            do {
                destStream.writeUint8(srcStream.readUint8());
            } while (--cnt[0]);
        }
        else if (cnt[0] == 0) {
            //run
            wordCnt[0] = srcStream.readUint8();                /* 8-bit unsigned count */
            pixel = srcStream.readUint8();
            do {
                destStream.writeUint8(pixel);
            } while (--wordCnt[0]);
        }
        else {
            cnt[0] -= 0x80;
            if (cnt[0] == 0) {
                // longOp 
                wordCnt[0] = srcStream.readUint16();
                if ((((wordCnt[0] >> 15) * (-65536)) + wordCnt[0] /*signed*/) <= 0) {
                    // notLongSkip
                    if (wordCnt[0] == 0)
                        break;

                    wordCnt[0] -= 0x8000;              /* Remove sign bit. */
                    if (wordCnt[0] >= 0x4000) {
                        // longRun;
                        wordCnt[0] -= 0x4000;              /* Clear "longRun" bit. */
                        pixel = srcStream.readUint8();
                        do {
                            destStream.writeUint8(pixel);
                        } while (--wordCnt[0]);
                    }
                    else {
                        /* longDump. */
                        do {
                            destStream.writeUint8(srcStream.readUint8());
                        } while (--wordCnt[0]);
                    }
                }
                else {
                    /* longSkip. */
                    destStream.position += wordCnt[0];
                }
            }
            else {
                /* shortSkip */
                destStream.position += cnt[0];                  /* adding 7-bit count to 32-bit pointer */
            }
        }
    }
}

function renderFrame(frameNumber, buffer) {
    var offset = 0;
    var i;
    var destFrame;
    var ppointer;

    checkAnimStarted("renderFrame");
    destFrame = frameNumber - anim.curlp.baseRecord;

    for (i = 0; i < destFrame; i++) {
        offset += buffer[i];
    }

    var sourceStream = new DataStream(buffer);
    sourceStream.position += anim.curlp.nRecords * 2 + offset;

    var nextBytes = sourceStream.readUint8Array(2);
    sourceStream.position -= 2;
    console.log("ppointer[1] %i", nextBytes[1]);
    if (nextBytes[1]) {
        throw Error("todo");
    } else {
        sourceStream.position += 4;
    }

    var desinationStream = new DataStream(anim.imagebuffer);
    CPlayRunSkipDump(sourceStream, desinationStream);
}

function drawFrame(frameNumber) {
    checkAnimStarted("drawFrame");
    anim.thepage = loadPage(findPage(frameNumber));
    renderFrame(frameNumber, anim.thepage);
}

Anim.loadAnim = function (buffer) {
    var i;

    if (!Anim_Started) {
        Anim_Started = true;
    }

    anim.buffer = buffer;
    anim.curlpnum = 0xffff;
    anim.currentframe = -1;

    var ds = new DataStream(anim.buffer.buffer);
    anim.lpheader = ds.readStruct([
        'id', 'uint32', // 4 character ID == "LPF " */
        'maxLps', 'uint16', // max # largePages allowed. 256 FOR NOW.   */
        'nLps', 'uint16', // # largePages in this file. */
        'nRecords', 'uint32', // # records in this file.  65534 is current limit plus */
        // one for last-to-first delta for looping the animation */
        'maxRecsPerLp', 'uint16', // # records permitted in an lp. 256 FOR NOW.   */
        'lpfTableOffset', 'uint16', // Absolute Seek position of lpfTable.  1280 FOR NOW.
        // The lpf Table is an array of 256 large page structures
        // that is used to facilitate finding records in an anim
        // file without having to seek through all of the Large
        // Pages to find which one a specific record lives in. */
        'contentType', 'uint32', // 4 character ID == "ANIM" */
        'width', 'uint16', // Width of screen in pixels. */
        'height', 'uint16', // Height of screen in pixels. */
        'variant', 'uint8', // 0==ANIM. */
        'version', 'uint8', // 0==frame rate is multiple of 18 cycles/sec.
        // 1==frame rate is multiple of 70 cycles/sec.  */
        'hasLastDelta', 'uint8', // 1==Last record is a delta from last-to-first frame. */
        'lastDeltaValid', 'uint8', // 0==The last-to-first delta (if present) hasn't been
        // updated to match the current first&last frames,    so it should be ignored. */
        'pixelType', 'uint8', //   /* 0==256 color. */
        'CompressionType', 'uint8', //      /* 1==(RunSkipDump) Only one used FOR NOW. */
        'otherRecsPerFrm', 'uint8', //      /* 0 FOR NOW. */
        'bitmaptype', 'uint8', //   /* 1==320x200, 256-color.  Only one implemented so far. */
        'recordTypes', ['[]', 'uint8', 32], //      /* Not yet implemented. */
        'nFrames', 'uint32', //   /* In case future version adds other records at end of
        //      file, we still know how many actual frames.
        //    NOTE: DOES include last-to-first delta when present. */
        'framesPerSecond', 'uint16', // Number of frames to play per second. */
        'pad2', ['[]', 'uint16', 29]                  // 58 bytes of filler to round up to 128 bytes total. */
    ]);

    ds.seek(ds.position + 128);

    // load the color palette
    for (i = 0; i < 768; i += 3) {
        anim.pal[i + 2] = ds.readUint8();
        anim.pal[i + 1] = ds.readUint8();
        anim.pal[i] = ds.readUint8();
        ds.position++;
    }

    for (i = 0; i < 256; i++) {
        anim.LpArray[i] = ds.readStruct(lpDescriptor);
    }
};

Anim.numFrames = function () {
    checkAnimStarted("Anim.numFrames");
    return anim.lpheader.nRecords;
};

Anim.drawFrame = function (frameNumber) {
    var cnt;

    checkAnimStarted("Anim.drawFrame");
    if ((anim.currentframe != -1) && (anim.currentframe <= frameNumber)) {
        for (cnt = anim.currentframe; cnt < frameNumber; cnt++) {
            drawFrame(cnt);
        }
    } else {
        for (cnt = 0; cnt < frameNumber; cnt++) {
            drawFrame(cnt);
        }
    }

    anim.currentframe = frameNumber;
    return anim.imagebuffer;
};

Anim.getPalette = function () {
    checkAnimStarted("Anim.getPalette");
    return anim.pal;
};