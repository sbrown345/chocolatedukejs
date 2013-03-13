﻿'use strict';

var MAXGROUPFILES = 4;
var groupefil_crc32 = new Int32Array(MAXGROUPFILES);

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

function initgroupfile(filename) {
    console.log("Loading " + filename + "...");

    if (grpSet.num == MAXGROUPFILES) {
        console.log("Error: Unable to open an extra GRP archive <= No more slot available.");
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
    archive.fileOffsets = new Uint8Array(archive.numFiles);
    archive.filesizes = new Uint8Array(archive.numFiles);

    // Load the full index 16 bytes per file (12bytes for name + 4 bytes for the size).
    var j = 12 + 4 + archive.numFiles * 16;
    for (var i = 0; i < archive.numFiles; i++) {
        archive.gfilelist[i] = ds.readString(12);
        var k = ds.readInt32();
        archive.filesizes[i] = k;
        archive.fileOffsets[i] = j;
        j += k;
    }
    
    // Rewind the fileDescriptor
    ds.position = 0;

    ////archive.crc32 = crc32(ds.mapUint8Array(ds.byteLength)); // slow!
    archive.crc32 = tempConstants.GRP_CRC; 

    groupefil_crc32[grpSet.num] = archive.crc32;

    console.log(archive);

    grpSet.num++;

    return grpSet - 1;
}