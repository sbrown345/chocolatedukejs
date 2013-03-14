'use strict';

var MAXGROUPFILES = 4;

var gameDir = "";

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
var grpStream;

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

    ////archive.crc32 = crc32(ds.mapUint8Array(ds.byteLength)); // slow!
    archive.crc32 = tempConstants.GRP_CRC;

    groupefil_crc32[grpSet.num] = archive.crc32;

    console.log(archive);

    grpSet.num++;

    grpStream = ds;

    return grpSet - 1;
}

var fileType = { SYSTEM_FILE: 0, GRP_FILE: 1 };

function OpenFile() {
    this.type = 0;
    this.fd = 0; //Either the fileDescriptor or the fileIndex in a GRP depending on the type.
    this.cursor = 0; //lseek cursor
    this.grpID = 0; //GRP id
    this.used = 0; //Marker 1=used
}

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
            //console.log(i, archive.gfilelist[i].trim().length, archive.gfilelist[i].toLowerCase().trim() == filename.toLowerCase().trim(), filename.toLowerCase(), archive.gfilelist[i].toLowerCase())
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

function kread(handle, leng) {
    var openFile = openFiles[handle];
    
    if (!openFile.used) {
        throw new Error("Invalid handle. Unrecoverable error.");
    }

    var archive = grpSet.archives[openFile.grpID];
    
    //Adjust leng so we cannot read more than filesystem-cursor location.
    //leng = Math.min(leng, archive.filesizes[openFile.fd]);
    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
    var buffer = grpStream.readUint8Array(leng);

    return buffer;
}

//function kreadText(handle, leng) {
//    var openFile = openFiles[handle];
    
//    if (!openFile.used) {
//        throw new Error("Invalid handle. Unrecoverable error.");
//    }

//    var archive = grpSet.archives[openFile.grpID];
    
//    //Adjust leng so we cannot read more than filesystem-cursor location.
//    //leng = Math.min(leng, archive.filesizes[openFile.fd]);
//    grpStream.seek(archive.fileOffsets[openFile.fd] + openFile.cursor);
//    var str = grpStream.readString(leng);

//    return str;
//}

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

function kclose(handle) {
    var openFile = openFiles[handle];

    if (!openFile.used) {
        throw new Error("Invalide handle. Unrecoverable error.");
    }

    openFiles[handle] = new OpenFile();
}

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