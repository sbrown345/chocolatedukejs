//'use strict';

var Game = {};

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
var firstdemofile;

var recfilep, totalreccnt;
//uint8_t  debug_on = 0,actor_tog = 0,memorycheckoveride=0;
//uint8_t *rtsptr;

//extern uint8_t  syncstate;
//extern int32 numlumps; (in rts.js)


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
    console.log("(9) logo");
    var i, soundanm = 0;

    ready2send = 0;

    KB.flushKeyboardQueue();

    setView(0, 0, xdim - 1, ydim - 1);
    clearView(0);
    palto(0, 0, 0, 63);

    flushperms();
    nextpage();

    Music.stopSong();

    q.setPositionAtStart()
        .addIf(function () { return ud.showcinematics && numplayers < 2; }, function () {
            console.log("(10) play logo anm");

            // This plays the explosion from the nuclear sign at the beginning.
            q.setPositionAtStart()
                .addIf(function () {
                    return !VOLUMEONE();
                }, function () {
                    // todo: it skips a frame here, how to fix this? addIfExecNow()? or rewrite into one if
                    q.setPositionAtStart()
                        .addIf(function () { return !KB.keyWaiting() && nomorelogohack == 0; },
                            function () {
                                getPackets();

                                q.setPositionAtStart()
                                    .add(function () {
                                        playanm("logo.anm", 5);
                                    }).add(function () {
                                        palto(0, 0, 0, 63);
                                        KB.flushKeyboardQueue();
                                    });
                            })
                        .endIf();
                    q.add(function () {
                        console.log("(20) REALITY IS OUR GAME Screen");
                        clearView(0);
                        nextpage();

                        //MIDI start here
                        playMusic(env_music_fn[0]);


                        // "REALITY IS OUR GAME" Screen
                        for (i = 0; i < 64; i += 7) {
                            q.add(i, function (cb, i) {
                                console.log("(22)");
                                palto(0, 0, 0, i);
                            });
                        }
                        q.add(function () {
                            console.log("(25)");
                            ps[myconnectindex].palette = drealms;
                            palto(0, 0, 0, 63);
                            rotateSprite(0, 0, 65536, 0, DREALMS, 0, 0, 2 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1); // this is possibly broken
                            nextpage();

                            q.setInsertPosition(0);
                            for (i = 63; i > 0; i -= 7) {
                                q.add(i, function (cb, i) {
                                    console.log("(30)");
                                    palto(0, 0, 0, i);
                                });
                            }
                        });

                        q.add(i, function (cb, i) {
                            totalclock = 0;

                            q.setPositionAtStart().addWhile(function () {
                                return totalclock < (120 * 7);
                            }, function () {
                                console.info("(40) empty func to simuilate waiting, totalclock: %i", totalclock);
                                getPackets();
                            });
                        });

                        //FADE OUT
                        for (i = 0; i < 64; i += 7) {
                            q.add(i, function (cb, i) {
                                console.log("(50)");
                                palto(0, 0, 0, i);
                            });
                        }

                        q.add(function () {
                            console.log("(60)");
                            clearView(0);
                            // todo: finish start animation
                        });

                    });
                })
                .addElse()
                .endIf();
        }).addElseIf(function () { return numplayers > 1; }, function () {
            console.log("(10)  numplayers > 1");
            throw new Error("todo");
        }).addElse(function () {
            console.log("(10)  else SP");
            throw new Error("todo");
        })
        .endIf()
        .add(function () {
            console.log("(70) todo"); // todo
            preMap.waitForEverybody();

            clearView(0);
            nextpage();
            ps[myconnectindex].palette = palette;
            palto(0, 0, 0, 0);
            clearView(0);
        });
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
var q = new Queue();

function main(argc, argv) {
    console.log("*** Chocolate DukeNukem3D JavaScript v" + CHOCOLATE_DUKE_REV_X + "." + CHOCOLATE_DUKE_REV_DOT_Y + " ***");

    ud.multimode = 1; // xduke: must be done before checkcommandline or that will prevent Fakeplayer and AI

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

    FX.stopAllSounds();
    clearsoundlocks();

    if (ud.warp_on > 1 && ud.multimode < 2) {
        throw new Error("todo");
    }

    // MAIN_LOOP_RESTART:

    // if game is loaded without /V or /L cmd arguments.{
    //if (ud.warp_on === 0) {
    //    if (numplayers > 1 && boardfilename[0] != 0) //check if a user map is loaded and in multiplayer.
    //    {
    //        throw new Error("todo");
    //    } else {
    //        logo(); //play logo, (game must be started via menus).
    //    }
    //}
    //else if (ud.warp_on == 1) {
    //    throw new Error("todo");
    //} else {
    //    vscrn();
    //}


    q.addIf(function () {
        return ud.warp_on == 0;
    }, function () {
        q.setPositionAtStart()
            .addIf(function () { return numplayers > 1 && boardfilename; },
                function () {
                    throw new Error("todo");
                }).addElse(function () {
                    logo();
                })
            .endIf();

    }).addElseIf(function () {
        return ud.warp_on === 1;
    }, function () {
        throw new Error("todo");
    })
        .addElse(function () {
            vscrn();
        })
        .endIf()
        .addWhile(function () {
            return ud.warp_on == 0 && isPlayingBack;
        }, function () {
            Game.playBack();
            //console.log("Demo loop");
        })
        .add(function () {
            console.log("EO demo loop");
            throw new Error("todo");
            //if (just played back)
            FX.stopAllSounds();
            clearsoundlocks();
            //nomorelogohack = 1;
            //goto MAIN_LOOP_RESTART;
        })
        .add(function () {
            ud.warp_on = 0;
            console.log("Start game loop");
            q.setPositionAtStart()
                .addWhile(function () {
                    return !(ps[myconnectindex].gm & MODE_END);
                }, function () {
                    throw new Error("todo");
                });
        })
        .flush();
    // don't put code outside async loop
}

// 0 = mine
Game.openDemoRead = function (whichDemo /* 0 = mine */) {
    var d = "demo_.dmo".split("");
    var fname;
    var ver;

    if (whichDemo === 10) {
        d[4] = 'x';
    } else {
        d[4] = whichDemo.toString();
    }

    fname = d.join("");

    ud.reccnt = 0;

    if (whichDemo === 1 && firstdemofile) {
        fname = firstdemofile;
        if ((recfilep = TCkopen4load(firstdemofile, 0)) == -1) {
            return 0;
        }
    } else {
        if ((recfilep = TCkopen4load(fname, 0)) == -1) {
            return 0;
        }
    }

    ud.reccnt = kread32(recfilep);
    ver = kreadUint8(recfilep);

    console.log("%s has version = %d", fname, ver);

    // todo: version if stuff!!

    ud.playing_demo_rev = ver;

    ud.volume_number = kreadUint8(recfilep);
    ud.level_number = kreadUint8(recfilep);
    ud.player_skill = kreadUint8(recfilep);
    ud.m_coop = kreadUint8(recfilep);
    ud.m_ffire = kreadUint8(recfilep);
    ud.multimode = kreadUint8(recfilep);
    ud.m_monsters_off = kreadUint8(recfilep);
    ud.m_respawn_monsters = kreadUint8(recfilep);
    ud.m_respawn_items = kreadUint8(recfilep);
    ud.m_respawn_inventory = kreadUint8(recfilep);
    ud.playerai = kreadUint8(recfilep);
    ud.user_name[0] = kreadText(recfilep, 32);
    // FIX_00034: Demos do not turn your run mode off anymore:
    kread32(recfilep); // dummy
    boardfilename = kreadText(recfilep, 128);
    if (!boardfilename) {
        ud.m_level_number = 7;
        ud.m_volume_number = 0;
    }

    for (var i = 0; i < ud.multimode; i++) {
        ps[i].aim_mode = kreadUint8(recfilep);
        
        // FIX_00080: Out Of Synch in demos. Tries recovering OOS in old demos v27/28/29/116/117/118. New: v30/v119.
        if (ver === BYTEVERSION) {
            throw new Error("todo");
            // todo:   //ud.wchoice[i] =kread(recfilep, ud.wchoice[i], sizeof(ud.wchoice[0]))
        }
    }

    ud.god = ud.cashman = ud.eog = ud.showallmap = 0;
    ud.clipping = ud.scrollmode = ud.overhead_on = 0;
    // FIX_00034: Demos do not turn your run mode off anymore:
    /* ud.showweapons =  */ ud.pause_on /*= ud.auto_run */ = 0; // makes no sense to reset those 2 value!

    preMap.newGame(ud.volume_number, ud.level_number, ud.player_skill);
    return 1;
};

var isPlayingBack = true; // set to false later to simulate returning 0
Game.inMenu = 0;
Game.whichDemo = 1;
Game.playBack = function () {
    q.setPositionAtStart();

    var i, j, k, l, t;
    var foundDemo;

    if (ready2send) {
        return false;
    }

    Game.inMenu = ps[myconnectindex].gm & MODE_MENU;

    pub = NUMPAGES;
    pus = NUMPAGES;

    flushperms();


    if (numplayers < 2 && ud.multimode_bot < 2) {
        foundDemo = Game.openDemoRead(Game.whichDemo);
    }


    if (foundDemo === 0) {
        throw new Error("todo");
    } else {
        ud.recstat = 2;
        Game.whichDemo++;
        if (Game.whichDemo === 10) {
            Game.whichDemo = 1;
        }
        
        preMap.enterLevel(MODE_DEMO);
    }

    throw new Error("todo");
};

//10434

function setupGameButtons() {
    console.log("todo setupGameButtons");
}