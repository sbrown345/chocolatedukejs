'use strict';

var conVersion = 13;
var grpVersion = 0;

var gc, neartaghitdist, lockclock, max_player_health, max_armour_amount, max_ammo_amount = new Int32Array(MAX_WEAPONS);

// int32_t temp_data[MAXSPRITES][6];
//struct weaponhit hittype[MAXSPRITES];
var spriteq = new Int16Array(1024), spriteqloc, spriteqamount = 64;

var ps = structArray(Player, MAXPLAYERS);
//var ps = new Array(MAXPLAYERS);
//for (var i = 0; i < ps.length; i++) {
//    ps[i] = new Player();
//}

var ud = {
    ridecule: new Array(10),
    savegame: new Array(10),
    pwlockout: new Array(128),
    rtsname: new Array(10),
    mapCRC: new Uint32Array(MAXPLAYERS),
    conCRC: new Uint32Array(MAXPLAYERS),
    conSize: new Uint32Array(MAXPLAYERS),
};

var fta_quotes = new Array(NUMOFFIRSTTIMEACTIVE);

var tempbuf = new Uint8Array(2048);
var packbuf = new Uint8Array(576);

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

//Game recording variables

var playerreadyflag = new Uint8Array(MAXPLAYERS), ready2send;
var playerquitflag = new Uint8Array(MAXPLAYERS);
var vel, svel, angvel, horiz, ototalclock, respawnactortime = 768, respawnitemtime = 768, groupfile;

var script = new Int32Array(MAXSCRIPTSIZE), scriptIdx = 0, scriptPtr, insptr, labelcode = new Int32Array(MAXSECTORS * (40 / 4) /*Sector is 40 bytes, this is int32 array*/), labelcnt = 0;
var actorscrptr = new Array(MAXTILES), parsing_actor = new Array(4);
var labels = new Array(50000 /*todo, not sure of limit...*/), textptr, textptrIdx = 0, error, warning;
var killit_flag;
var music_pointer;
var actortype = new Uint8Array(MAXTILES);

//uint8_t  display_mirror,typebuflen;
//char typebuf[41];

var music_fn = [new Array(11), new Array(11), new Array(11), new Array(11)];
//uint8_t music_select;
var env_music_fn = new Array(4);
//uint8_t  rtsplaying;


//short weaponsandammosprites[15] = {
//    RPGSPRITE,
//    CHAINGUNSPRITE,
//    DEVISTATORAMMO,
//    RPGAMMO,
//    RPGAMMO,
//    JETPACK,
//    SHIELD,
//    FIRSTAID,
//    STEROIDS,
//    RPGAMMO,
//    RPGAMMO,
//    RPGSPRITE,
//    RPGAMMO,
//    FREEZESPRITE,
//    FREEZEAMMO
//    };

var impact_damage;

////GLOBAL.C - replace the end "my's" with this
//int32_t myx, omyx, myxvel, myy, omyy, myyvel, myz, omyz, myzvel;
//short myhoriz, omyhoriz, myhorizoff, omyhorizoff;
//short myang, omyang, mycursectnum, myjumpingcounter,frags[MAXPLAYERS][MAXPLAYERS];

//uint8_t  myjumpingtoggle, myonground, myhardlanding, myreturntocenter;
//int8_t multiwho, multipos, multiwhat, multiflag;

//int32_t fakemovefifoplc,movefifoplc;
//int32_t myxbak[MOVEFIFOSIZ], myybak[MOVEFIFOSIZ], myzbak[MOVEFIFOSIZ];
var myhorizbak = new Int32Array(MOVEFIFOSIZ), dukefriction = 0xcc00, show_shareware;

//short myangbak[MOVEFIFOSIZ];
//char  myname[2048] = "XDUKE";
var camerashitable, freezerhurtowner = 0, lasermode;
//// CTW - MODIFICATION
//// uint8_t  networkmode = 255, movesperpacket = 1,gamequit = 0,playonten = 0,everyothertime;
//uint8_t  networkmode = 255, movesperpacket = 1,gamequit = 0,everyothertime;
//// CTW END - MODIFICATION
var numfreezebounces = 3, rpgblastradius, pipebombblastradius, tripbombblastradius, shrinkerblastradius, morterblastradius, bouncemineblastradius, seenineblastradius;
//STATUSBARTYPE sbar;

//int32_t myminlag[MAXPLAYERS], mymaxlag, otherminlag, bufferjitter = 1;
//short numclouds,clouds[128],cloudx[128],cloudy[128];
//int32_t cloudtotalclock = 0,totalmemory = 0;
//int32_t numinterpolations = 0, startofdynamicinterpolations = 0;
//int32_t oldipos[MAXINTERPOLATIONS];
//int32_t bakipos[MAXINTERPOLATIONS];
//int32_t *curipos[MAXINTERPOLATIONS];