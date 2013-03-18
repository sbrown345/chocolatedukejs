'use strict';

var nHostForceDisableAutoaim = 0;

// Game play speed
var g_iTickRate = 120;
var g_iTicksPerFrame = 26;
var TICRATE = g_iTickRate;
var TICSPERFRAME = (TICRATE / g_iTicksPerFrame);

var CommandSoundToggleOff = 0;
var CommandMusicToggleOff = 0;

var confilename = "GAME.CON";
var boardfilename = null;

function compilecons() {
    var userconfilename = confilename;

    //labelcode = sector; // todo ??????????  these arrays are reused????? read comment in loadboard

    // todo: missing some things here...

    loadefs(userconfilename, false);
}

function Startup() {
    Console.init();

    KB.startup();

    Config.getSetupFilename();
    Config.readSetup();

    compilecons();

    if (CommandSoundToggleOff) {
        SoundToggle = 0;
    }
    if (CommandMusicToggleOff) {
        MusicToggle = 0;
    }

    Control.startup();

    initEngine();

    initTimer(g_iTickRate);

    console.log("Loading art header.");

    loadPics("tiles000.art", null);

    Config.readSaveNames();

    tiles[MIRROR].dim.width = tiles[MIRROR].dim.height = 0;

    for (var i = 0; i < MAXPLAYERS; i++) {
        playerreadyflag[i] = 0;
    }

    Network.initMultiPlayers(0, 0, 0);
    
    if (numplayers > 1) {
        console.log("Multiplayer initialized.");
    }

    ps[myconnectindex].palette = palette[0];
    setupGameButtons();
    
    if (networkmode === 255) {
        networkmode = 1;
    }
    
    //console.log("Checking sound inits.");
    //todo: SoundStartup(); 
    //console.log("Checking music inits.");
    //todo: MusicStartup();

    // AutoAim
    if (nHostForceDisableAutoaim)
        ud.auto_aim = 0;

    console.log("loadTmb()");
    loadTmb();
}

//7655
function loadTmb() {
    var tmb = new Uint8Array(8000);

    var file = kopen4load("d3dtimbr.tmb", false);

    if(file == -1) 
        return;

    var l = kfilelength(file);

    kread(file, tmb, l);

    Music.RegisterTimbreBank(tmb);

    kclose(file);
}

//7803
function getNames() {
    
}

// 7977
function findGRPToUse() {
    return "DUKE3D.GRP";
}

// 8082
function load_duke3d_groupfile() {
    var groupfilefullpath = findGRPToUse();

    return (initgroupfile(groupfilefullpath) != -1);
}

/// 8100
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

    //todo check memory (maybe use console.memory?)
    
    // todo: register shutdown function - needed???

    Startup();
    
    //if (g_bStun) {
    //    waitforeverybody(); //todo
    //}
    
    if (numplayers > 1) {
        throw new Error("todo");
    } else if (boardfilename) {
        ud.m_level_number = 7;
        ud.m_volume_number = 0;
        ud.warp_on = 1;
    }

    getNames();

    throw new Error("todo");
}

//10434
function setupGameButtons() {
    console.log("todo setupGameButtons");
}