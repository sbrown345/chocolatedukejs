'use strict';

// Game play speed
var g_iTickRate = 120;
var g_iTicksPerFrame = 26;

var confilename = "GAME.CON";

function compilecons() {
    var userconfilename = confilename;
    
    // todo: missing some things here...

    loadefs(userconfilename, false);
}

function Startup() {
    Console.init();

    KB.startup();

    Config.getSetupFilename();
    Config.readSetup();

    compilecons();
}

function findGRPToUse() {
    return "DUKE3D.GRP";
}

function main(argc, argv) {
    console.log("*** Chocolate DukeNukem3D JavaScript v" + CHOCOLATE_DUKE_REV_X + "." + CHOCOLATE_DUKE_REV_DOT_Y + " ***");

    ud.multimode = 1;  // xduke: must be done before checkcommandline or that will prevent Fakeplayer and AI

    if (!load_duke3d_groupfile()) {
        throw new Error("Could not initialize any original BASE duke3d*.grp file\n" +
            "Even if you are playing a custom GRP you still need\n" +
            "an original base GRP file as Shareware/Full 1.3D GRP or\n" +
            "the v1.5 ATOMIC GRP file. Such a file seems to be missing\n" +
            "or is corrupted");
    }

    // Detecting grp version
    // We keep the old GRP scheme detection for 19.6 compliance. Will be obsolete.
    // todo: get grpVersion
    grpVersion = tempConstants.GRP_VERSION;

    // todo: print some info about GRP

    // todo: checkcommandline

    _platform_init(argc, argv, "Duke Nukem 3D", "Duke3D");
}

function load_duke3d_groupfile() {
    var groupfilefullpath = findGRPToUse();

    return (initgroupfile(groupfilefullpath) != -1);
}
