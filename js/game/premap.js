'use strict';

function genSpriteRemaps() {
    var fp = TCkopen4load("lookup.dat", false);
    var lookpos;
    var numl;
    if (fp != -1) {
        numl = kreaduint8(fp, 1);
    } else {
        throw new Error("ERROR: File 'LOOKUP.DAT' not found.");
    }

    for (var j = 0; j < numl; j++) {
        lookpos = kreaduint8(fp);
        kread(fp, tempbuf, 256);
        makepalookup(lookpos, tempbuf, 0, 0, 0, 1);
    }

    kread(fp, waterpal, 768);
    kread(fp, slimepal, 768);
    kread(fp, titlepal, 768);
    kread(fp, drealms, 768);
    kread(fp, endingpal, 768);

    palette[765] = palette[766] = palette[767] = 0;
    slimepal[765] = slimepal[766] = slimepal[767] = 0;
    waterpal[765] = waterpal[766] = waterpal[767] = 0;

    kclose(fp);
}