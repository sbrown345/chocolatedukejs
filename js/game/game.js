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
var waterpal = new Uint8Array(768), slimepal = new Uint8Array(768), titlepal = new Uint8Array(768), drealms = new Uint8Array(768), endingpal = new Uint8Array(768);


//numlumps (points to nlumps in rts.js ?)


var restorepalette, screencapt, nomorelogohack = 0;
var sendmessagecommand = -1;

function getPackets() {
    //int32_t i, j, k, l;
    //short other, packbufleng;
    //input *osyn, *nsyn;

    sampleTimer();
    //if(qe == 0 && KB_KeyPressed(sc_LeftControl) && KB_KeyPressed(sc_LeftAlt) && KB_KeyPressed(sc_Delete))
    //{
    //    qe = 1;
    //    gameexit("Quick Exit.");
    //}
    
    // not a net game
    if (numplayers < 2) {
        return;
    }

    throw new Error("todo getPackets");
}

//784
function faketimerhandler() {
    var i, j, k;
    var osyn, nsyn;
    
    ////Check if we should quit the game.
    //todo if(qe == 0 && KB_KeyPressed(sc_LeftControl) && KB_KeyPressed(sc_LeftAlt) && KB_KeyPressed(sc_Delete))
    //{
    //    qe = 1;
    //    gameexit("Quick Exit.");
    //}
    
    if ((totalclock < ototalclock + TICSPERFRAME) || (ready2send === 0)) {
        return; // Returns here when playing a demo.
    }
    
    throw new Error("todo");
}

function logo() {
    var i, soundanm = 0;

    ready2send = 0;

    KB.flushKeyboardQueue();

    setView(0, 0, xdim - 1, ydim - 1);
    clearView(0);
    palto(0, 0, 0, 63);

    flushperms();
    nextpage();

    Music.stopSong();
    
    if (ud.showcinematics && numplayers < 2) {
        // This plays the explosion from the nuclear sign at the beginning.
        if (!VOLUMEONE()) {
            if (!KB.keyWaiting() && nomorelogohack == 0) {
                getPackets();

                playanm("logo.anm", 5);
                palto(0, 0, 0, 63);
                KB.flushKeyboardQueue();
            }

            clearView(0);
            nextpage();
        }
        throw new Error("todo");
    }

    throw new Error("todo");
}

//7655
function loadTmb() {
    var tmb = new Uint8Array(8000);

    var file = kopen4load("d3dtimbr.tmb", false);

    if (file == -1)
        return;

    var l = kfilelength(file);

    kread(file, tmb, l);

    Music.registerTimbreBank(tmb);

    kclose(file);
}

// 7695
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


//7803
function getNames() {
    var i, j, l;

    //// FIX_00031: Names now limited to 10 chars max that is the fragbar field limit.
    //for (l = 0; l <= 9 && myname[l]; l++) {
    // todo: add in with MP
    //    ud.user_name[myconnectindex][l] = toupper(myname[l]);
    //    buf[l + 2] = toupper(myname[l]);
    //}

    ud.rev[myconnectindex][0] = 1;
    ud.rev[myconnectindex][1] = DUKE_ID;
    ud.rev[myconnectindex][2] = CHOCOLATE_DUKE_REV_X;
    ud.rev[myconnectindex][3] = CHOCOLATE_DUKE_REV_DOT_Y;

    ud.conSize[myconnectindex] = ud.conSize[0]; // [0] still containing the original value
    ud.conCRC[myconnectindex] = ud.conCRC[0];

    if (numplayers > 1) {
        throw new Error("todo networking");
    } else if (nHostForceDisableAutoaim === 2) {
        nHostForceDisableAutoaim = 0;
        ud.auto_aim = 2;
    }
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

    if (ud.multimode > 1) {
        throw new Error("todo");
    }

    ud.last_level = -1;

    RTS.init(ud.rtsname);
    if (numlumps) {
        console.log("Using .RTS file:%s", ud.rtsname);
    }

    //todo: Control joystick, center joystick

    console.log("Loading palette/lookups.");

    if (setGameMode(ScreenMode, ScreenWidth, ScreenHeight) < 0) {
        throw new Error("todo");
    }

    console.log("genSpriteRemaps()");
    genSpriteRemaps();

    setBrightness(ud.brightness >> 2, ps[myconnectindex].palette);

    // todo:   if(KB_KeyPressed( sc_Escape ) )  
    //gameexit(" ");

    // todo: FX.StopAllSounds();
    //clearsoundlocks();

    if (ud.warp_on > 1 && ud.multimode < 2) {
        throw new Error("todo");
    }

    // MAIN_LOOP_RESTART:

    // if game is loaded without /V or /L cmd arguments.{
    if (ud.warp_on === 0) {
        if (numplayers > 1 && boardfilename[0] != 0) //check if a user map is loaded and in multiplayer.
        {
            throw new Error("todo");
        } else {
            logo(); //play logo, (game must be started via menus).
        }
    }
    else if (ud.warp_on == 1) {
        throw new Error("todo");
    } else {
        vscrn();
    }

    throw new Error("todo");
}

//10434
function setupGameButtons() {
    console.log("todo setupGameButtons");
}