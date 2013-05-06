'use strict';

var conVersion = 13;
var grpVersion = 0;

// FIX_00015: Backward compliance with older demos (down to demos v27, 28, 116 and 117 only)

// For BYTEVERSION diff, 27/116 vs 28/117 see extras\duke3d.h vs source\duke3d.h
// from the official source code release. 

var BYTEVERSION_27 = 27; // 1.3 under 1.4 Plutonium. Not supported anymore
var BYTEVERSION_116 = 116; // 1.4 Plutonium. Not supported anymore

var BYTEVERSION_28 = 28; // 1.3 under 1.5 engine
var BYTEVERSION_117 = 117; // 1.5 Atomic

var BYTEVERSION_29 = 29; // 1.3 under xDuke v19.6.
var BYTEVERSION_118 = 118; // 1.5 Atomic under xDuke v19.6.

var BYTEVERSION_1_3 = 1; // for 1.3 demos (Not compatible)

var BYTEVERSION = 119; // xDuke v19.7

var global_random;
var neartagsector, neartagwall, neartagsprite;

var gc, neartaghitdist, lockclock, max_player_health, max_armour_amount, max_ammo_amount = new Int32Array(MAX_WEAPONS);

// int32_t temp_data[MAXSPRITES][6];
function weaponhit() {
    this.cgg = 0;
    this.picnum = 0; this.ang = 0; this.extra = 0; this.owner = 0; this.movflag = 0;
    this.tempang = 0; this.actorstayput = 0; this.dispicnum = 0;
    this.timetosleep = 0;
    this.floorz = 0; this.ceilingz = 0; this.lastvx = 0; this.lastvy = 0; this.bposx = 0; this.bposy = 0; this.bposz = 0;
    this.temp_data = new Int32Array(6);
}

var hittype = structArray(weaponhit, MAXSPRITES);
var spriteq = new Int16Array(1024), spriteqloc, spriteqamount = 64;


// todo: change to class?
// and/or less than 30 properties?
var ud = {
    god: 0,
    warp_on: 0,
    cashman: 0,
    eog: 0,
    showallmap: 0,
    show_help: 0,
    scrollmode: 0,
    clipping: 0,

    user_name: new Array(MAXPLAYERS),
    ridecule: new Array(10),
    savegame: new Array(10),
    pwlockout: new Array(128),
    rtsname: "",

    overhead_on: 0, last_overhead: 0,

    pause_on: 0, from_bonus: 0,
    camerasprite: 0, last_camsprite: 0,
    last_level: 0, secretlevel: 0,

    const_visibility: 0, uw_framerate: 0,
    camera_time: 0, folfvel: 0, folavel: 0, folx: 0, foly: 0, fola: 0,
    reccnt: 0,

    entered_name: 0, screen_tilting: 0, shadows: 0, fta_on: 0, executions: 0, auto_run: 0,
    coords: 0, tickrate: 0, m_coop: 0, coop: 0, screen_size: 0, extended_screen_size: 0, lockout: 0, crosshair: 0, showweapons: 0,
    mywchoice: new Int32Array(MAX_WEAPONS), wchoice: multiDimArray(Int32Array, MAXPLAYERS, MAX_WEAPONS), playerai: 0,

    respawn_monsters: 0, respawn_items: 0, respawn_inventory: 0, recstat: 0, monsters_off: 0, brightness: 0,
    m_respawn_items: 0, m_respawn_monsters: 0, m_respawn_inventory: 0, m_recstat: 0, m_monsters_off: 0, detail: 0,
    // FIX_00082: /q option taken off when playing a demo (multimode_bot)    
    m_ffire: 0, ffire: 0, m_player_skill: 0, m_level_number: 0, m_volume_number: 0, multimode: 0, multimode_bot: 0,
    player_skill: 0, level_number: 0, volume_number: 0, m_marker: 0, marker: 0, mouseflip: 0,

    showcinematics: 0, hideweapon: 0,
    auto_aim: 0, gitdat_mdk: 0, //AutoAim toggle variable.
    weaponautoswitch: 0,

    // FIX_00015: Backward compliance with older demos (down to demos v27: 0, 28: 0, 116 and 117 only)
    playing_demo_rev: 0,

    conSize: new Uint32Array(MAXPLAYERS),
    rev: multiDimArray(Uint8Array, MAXPLAYERS, 10),
    mapCRC: new Uint32Array(MAXPLAYERS),
    // exeCRC is meaningless here
    conCRC: new Uint32Array(MAXPLAYERS),
};

var animwall = structArray(AnimWall, MAXANIMWALLS);
var numanimwalls;
var animateptr = new Int32Array(MAXANIMATES), animategoal= new Int32Array(MAXANIMATES), animatevel= new Int32Array(MAXANIMATES), animatecnt;
var oanimateval = new Int32Array(MAXANIMATES);
var animatesect = new Int16Array(MAXANIMATES);
var msx = new Int32Array(2048), msy = new Int32Array(2048);
var cyclers = multiDimArray(Int16Array, MAXCYCLERS, 6), numcyclers;

var fta_quotes = new Array(NUMOFFIRSTTIMEACTIVE);

var tempbuf = new Uint8Array(2048);
var packbuf = new Uint8Array(576);

//char  buf[80];

var camsprite;
var mirrorwall = new Int16Array(64), mirrorsector = new Int16Array(64), mirrorcnt = 0;

var current_menu = 0;

var betaname = new Uint32Array(80);

var level_names = new Array(44);
var level_file_names = new Array(44);
var partime = new Int32Array(44), designertime = new Int32Array(44);
var volume_names = ["L.A. MELTDOWN", "LUNAR APOCALYPSE", "SHRAPNEL CITY", ""]; // Names are not in 1.3 con files. MUST be in code.
var skill_names = ["PIECE OF CAKE", "LET'S ROCK", "COME GET SOME", "DAMN I'M GOOD", ""];

//volatile int32_t checksume;
//int32_t soundsiz[NUM_SOUNDS];

var soundps = new Int16Array(NUM_SOUNDS), soundpe = new Int16Array(NUM_SOUNDS), soundvo = new Int16Array(NUM_SOUNDS);
var soundm = new Uint8Array(NUM_SOUNDS), soundpr = new Uint8Array(NUM_SOUNDS);
var sounds = new Array(NUM_SOUNDS);

//short title_zoom;

//fx_device device;

var Sound = structArray(SAMPLE, NUM_SOUNDS);
//SOUNDOWNER SoundOwner[NUM_SOUNDS][4];

var numplayersprites, earthquaketime;

var fricxv = 0, fricyv = 0;
var po = structArray(PlayerOrig, MAXPLAYERS);
var ps = structArray(PlayerType, MAXPLAYERS);
//struct user_defs ud;

var pus = 0, pub = 0;
var syncstat, syncval = multiDimArray(Uint8Array, MAXPLAYERS, MOVEFIFOSIZ);
var syncvalhead = new Int32Array(MAXPLAYERS), syncvaltail, syncvaltottail;

var sync /*[MAXPLAYERS]*/, loc;
var recsync = structArray(Input, RECSYNCBUFSIZ);
var avgfvel, avgsvel, avgavel, avghorz, avgbits;


var inputfifo;//[MOVEFIFOSIZ][MAXPLAYERS];
//input recsync[RECSYNCBUFSIZ];

var movefifosendplc;

//Multiplayer syncing variables
var screenpeek;
var movefifoend = new Int32Array(MAXPLAYERS);

//Game recording variables

var playerreadyflag = new Uint8Array(MAXPLAYERS), ready2send;
var playerquitflag = new Uint8Array(MAXPLAYERS);
var vel, svel, angvel, horiz, ototalclock = 0, respawnactortime = 768, respawnitemtime = 768, groupfile;

var FIX_00093_Offset = 10000;
var script = new Int32Array(MAXSCRIPTSIZE + FIX_00093_Offset), scriptIdx = 0, scriptPtr, insptr, labelcode = new Int32Array(MAXSECTORS * (40 / 4) /*Sector is 40 bytes, this is int32 array*/), labelcnt = 0;
var actorscrptr = new Int32Array(MAXTILES), parsing_actor = new Array(4);

var labels = new Array(50000 /*todo, not sure of limit...*/), textptr, textptrIdx = 0, error, warning;
var killit_flag;
var music_pointer;
var actortype = new Uint8Array(MAXTILES);

var display_mirror = 0, typebuflen = 0;
//char typebuf[41];

var music_fn = [new Array(11), new Array(11), new Array(11), new Array(11)];
var music_select;
var env_music_fn = new Array(4);
var rtsplaying = 0;


var weaponsandammosprites = [
    RPGSPRITE,
    CHAINGUNSPRITE,
    DEVISTATORAMMO,
    RPGAMMO,
    RPGAMMO,
    JETPACK,
    SHIELD,
    FIRSTAID,
    STEROIDS,
    RPGAMMO,
    RPGAMMO,
    RPGSPRITE,
    RPGAMMO,
    FREEZESPRITE,
    FREEZEAMMO
];

var impact_damage;

////GLOBAL.C - replace the end "my's" with this
var myx, omyx, myxvel, myy, omyy, myyvel, myz, omyz, myzvel;
var myhoriz, omyhoriz, myhorizoff, omyhorizoff;
var myang, omyang, mycursectnum, myjumpingcounter, frags = multiDimArray(Int16Array, MAXPLAYERS, MAXPLAYERS);

var  myjumpingtoggle, myonground, myhardlanding, myreturntocenter;
var multiwho, multipos, multiwhat, multiflag;

var fakemovefifoplc, movefifoplc;
var myxbak = new Int32Array(MOVEFIFOSIZ), myybak = new Int32Array(MOVEFIFOSIZ), myzbak = new Int32Array(MOVEFIFOSIZ);
var myhorizbak = new Int32Array(MOVEFIFOSIZ), dukefriction = 0xcc00, show_shareware;

//short myangbak[MOVEFIFOSIZ];
//char  myname[2048] = "XDUKE";
var camerashitable, freezerhurtowner = 0, lasermode;
//// CTW - MODIFICATION
//// uint8_t  networkmode = 255, movesperpacket = 1,gamequit = 0,playonten = 0,everyothertime;
var networkmode = 255, movesperpacket = 1, gamequit = 0, everyothertime;
//// CTW END - MODIFICATION
var numfreezebounces = 3, rpgblastradius, pipebombblastradius, tripbombblastradius, shrinkerblastradius, morterblastradius, bouncemineblastradius, seenineblastradius;
var sbar = new StatusBar();

var myminlag = new Int32Array(MAXPLAYERS), mymaxlag, otherminlag, bufferjitter = 1;
var numclouds, clouds = new Int16Array(128), cloudx = new Int16Array(128), cloudy = new Int16Array(128);
var cloudtotalclock = 0, totalmemory = 0;
var numinterpolations = 0, startofdynamicinterpolations = 0;
var oldipos = new Int32Array(MAXINTERPOLATIONS);
var bakipos = new Int32Array(MAXINTERPOLATIONS);
var curipos = new Int32Array(MAXINTERPOLATIONS);

function FindDistance2D(ix,  iy) {
  var   t;

  ix = Math.abs(ix);        /* absolute values */
  iy = Math.abs(iy);

    if (ix<iy)
    {
        var tmp = ix;
        ix = iy;
        iy = tmp;
    }

    t = iy + (iy>>1);

    return (ix - (ix>>5) - (ix>>7)  + (t>>2) + (t>>6));
}


function FindDistance3D(ix, iy, iz) {
   var t;

    ix= Math.abs(ix);           /* absolute values */
    iy= Math.abs(iy);
    iz= Math.abs(iz);

    if (ix<iy)
    {
        var tmp = ix;
        ix = iy;
        iy = tmp;
    }

    if (ix<iz)
    {
        var tmp = ix;
        ix = iz;
        iz = tmp;
    }

    t = iy + iz;

    return (ix - (ix>>4) + (t>>2) + (t>>3));
}