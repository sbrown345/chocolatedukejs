'use strict';


var RANCID_ID = 1;
var XDUKE_ID = 2;
var JONOF_ID = 3;

// JS Chocolate DukeNukem3D is a fork of xDuke v17.9

var DUKE_ID = XDUKE_ID;
var CHOCOLATE_DUKE_REV_X = 1;
var CHOCOLATE_DUKE_REV_DOT_Y = 0; // rev is: CHOCOLATE_DUKE_REV_X.CHOCOLATE_DUKE_REV_DOT_Y
var MAX_KNOWN_GRP = 4;

var UNKNOWN_GRP = 0;
var SHAREWARE_GRP13 = 1;
var REGULAR_GRP13D = 2;
var ATOMIC_GRP14_15 = 3;
var DUKEITOUTINDC_GRP = 4;

var CRC_BASE_GRP_SHAREWARE_13 = 0x983AD923;
var CRC_BASE_GRP_FULL_13 = 0xBBC9CE44;
var CRC_BASE_GRP_PLUTONIUM_14 = 0xF514A6AC;
var CRC_BASE_GRP_ATOMIC_15 = 0xFD3DCFF1;


Object.defineProperty(window, 'PLUTOPAK', { get: function () { return !VOLUMEONE && !VOLUMEALL; } });

Object.defineProperty(window, 'VOLUMEONE', { get: function () { return getGRPcrc32(0) === CRC_BASE_GRP_SHAREWARE_13; } });

// VOLUMEALL = 1.3d full
Object.defineProperty(window, 'VOLUMEALL', {
    get: function () {
     return getGRPcrc32(0) == CRC_BASE_GRP_FULL_13 || conVersion == 13 && getGRPcrc32(0) != CRC_BASE_GRP_SHAREWARE_13 && getGRPcrc32(0) != CRC_BASE_GRP_PLUTONIUM_14 && getGRPcrc32(0) != CRC_BASE_GRP_ATOMIC_15;
} });

var SCREENSHOTPATH = "screenshots";



// #define TEN
// #define BETA

var AUSTRALIA = false;

var MAXSLEEPDIST = 16384;
var SLEEPTIME = 24 * 64;

//152
var NUMPAGES = 1;

var AUTO_AIM_ANGLE = 48;
var RECSYNCBUFSIZ = 2520;   //2520 is the (LCM of 1-8)*3
var MOVEFIFOSIZ = 256;

var FOURSLEIGHT = (1 << 8);

//var TICRATE = g_iTickRate; // put in game.js instead
//var TICSPERFRAME = (TICRATE / g_iTicksPerFrame);

//195
var NUM_SOUNDS = 450;

//219
var PHEIGHT = (38 << 8);

//224
var MODE_MENU = 1;
var MODE_DEMO = 2;
var MODE_GAME = 4;
var MODE_EOL = 8;
var MODE_TYPE = 16;
var MODE_RESTART = 32;
var MODE_SENDTOWHOM = 64;
var MODE_END = 128;

var MAXANIMWALLS = 512;
var MAXINTERPOLATIONS = 2048;
var NUMOFFIRSTTIMEACTIVE = 192;

var MAXCYCLERS = 256;
var MAXSCRIPTSIZE = 20460;
var MAXANIMATES = 64;

var face_player = 1;
var geth = 2;
var getv = 4;
var random_angle = 8;
var face_player_slow = 16;
var spin = 32;
var face_player_smart = 64;
var fleeenemy =128;
var jumptoplayer = 257;
var seekplayer = 512;
var furthestdir = 1024;
var dodgebullet = 4096;

Object.defineProperty(window, 'TRAND', { get: krand });

//279
var MAX_WEAPONS = 12;

var KNEE_WEAPON = 0;
var PISTOL_WEAPON = 1;
var SHOTGUN_WEAPON = 2;
var CHAINGUN_WEAPON = 3;
var RPG_WEAPON = 4;
var HANDBOMB_WEAPON = 5;
var SHRINKER_WEAPON = 6;
var DEVISTATOR_WEAPON = 7;
var TRIPBOMB_WEAPON = 8;
var FREEZE_WEAPON = 9;
var HANDREMOTE_WEAPON = 10;
var GROW_WEAPON = 11;

function AFLAMABLE(X) { (X === BOX || X === TREE1 || X === TREE2 || X === TIRE || X === CONE); }

//317
function rnd(X) { ((TRAND >> 8) >= (255 - (X))); }

function Input() {
    //var avel = new Int8Array(1);
    //var horz = new Int8Array(1);
    //var fvel = new Int16Array(1);
    //var svel = new Int16Array(1);
    //var bits = new Uint32Array(1);

    //Object.defineProperty(this, 'avel', { get: function () { return avel[0]; }, set: function (v) { avel[0] = v; } });
    //Object.defineProperty(this, 'horz', { get: function () { return horz[0]; }, set: function (v) { horz[0] = v; } });
    //Object.defineProperty(this, 'fvel', { get: function () { return fvel[0]; }, set: function (v) { fvel[0] = v; } });
    //Object.defineProperty(this, 'svel', { get: function () { return svel[0]; }, set: function (v) { svel[0] = v; } });
    //Object.defineProperty(this, 'bits', { get: function () { return bits[0]; }, set: function (v) { bits[0] = v; } });
    this.avel = 0;
    this.horz = 0;
    this.fvel = 0;
    this.svel = 0;
    this.bits = 0;
}

Input.prototype.copyTo = function(obj) {
    obj.avel = this.avel;
    obj.horz = this.horz;
    obj.fvel = this.fvel;
    obj.svel = this.svel;
    obj.bits = this.bits;
};

///* !!! FIXME: "sync" is defined in unistd.h ... :(  --ryan. */
// todo fix: this is work around for macro: possibly confusing sync/duke_sync
Object.defineProperty(window, 'duke_sync', { get: function () { return sync; }, set: function (v) { sync = v; } });

//extern input recsync[RECSYNCBUFSIZ];

//extern int32_t movefifosendplc;

function SAMPLE() {
    this.ptr = null;
    this.lock = 0;
    this.length = 0;
    this.num = 0;
}

function AnimWall() {
    this.wallnum = 0;
    this.tag = 0;
}

//extern struct animwalltype animwall[MAXANIMWALLS]; //these are in global
//extern short numanimwalls,probey,lastprobey;
//373
var mymembuf;


//451
function PlayerType() {
    this.zoom = 0; this.exitx = 0; this.exity = 0; this.loogiex = new Int32Array(64); this.loogiey = new Int32Array(64); this.numloogs = 0; this.loogcnt = 0;
    this.posx = 0; this.posy = 0; this.posz = 0; this.horiz = 0; this.ohoriz = 0; this.ohorizoff = 0; this.invdisptime = 0;
    this.bobposx = 0; this.bobposy = 0; this.oposx = 0; this.oposy = 0; this.oposz = 0; this.pyoff = 0; this.opyoff = 0;
    this.posxv = 0; this.posyv = 0; this.poszv = 0; this.last_pissed_time = 0; this.truefz = 0; this.truecz = 0;
    this.player_par = 0; this.visibility = 0;
    this.bobcounter = 0; this.weapon_sway = 0;
    this.pals_time = 0; this.randomflamex = 0; this.crack_time = 0;

    this.aim_mode = 0;

    this.ang = 0; this.oang = 0; this.angvel = 0; this.cursectnum = 0; this.look_ang = 0; this.last_extra = 0; this.subweapon = 0;
    this.ammo_amount = new Int16Array(MAX_WEAPONS); this.wackedbyactor = 0; this.frag = 0; this.fraggedself = 0;

    this.curr_weapon = 0; this.last_weapon = 0; this.tipincs = 0; this.horizoff = 0; this.wantweaponfire = 0;
    this.holoduke_amount = 0; this.newowner = 0; this.hurt_delay = 0; this.hbomb_hold_delay = 0;
    this.jumping_counter = 0; this.airleft = 0; this.knee_incs = 0; this.access_incs = 0;
    this.fta = 0; this.ftq = 0; this.access_wallnum = 0; this.access_spritenum = 0;
    this.kickback_pic = 0; this.got_access = 0; this.weapon_ang = 0; this.firstaid_amount = 0;
    this.somethingonplayer = 0; this.on_crane = 0; this.i = 0; this.one_parallax_sectnum = 0;
    this.over_shoulder_on = 0; this.random_club_frame = 0; this.fist_incs = 0;
    this.one_eighty_count = 0; this.cheat_phase = 0;
    this.dummyplayersprite = 0; this.extra_extra8 = 0; this.quick_kick = 0;
    this.heat_amount = 0; this.actorsqu = 0; this.timebeforeexit = 0; this.customexitsound = 0;

    this.weaprecs = new Int16Array(MAX_WEAPONS); this.weapreccnt = 0;
    this.interface_toggle_flag = 0;

    this.rotscrnang = 0; this.dead_flag = 0; this.show_empty_weapon = 0;
    this.scuba_amount = 0; this.jetpack_amount = 0; this.steroids_amount = 0; this.shield_amount = 0;
    this.holoduke_on = 0; this.pycount = 0; this.weapon_pos = 0; this.frag_ps = 0;
    this.transporter_hold = 0; this.last_full_weapon = 0; this.footprintshade = 0; this.boot_amount = 0;

    this.scream_voice = 0;

    this.gm = 0; this.on_warping_sector = 0; this.footprintcount = 0;
    this.hbomb_on = 0; this.jumping_toggle = 0; this.rapid_fire_hold = 0; this.on_ground = 0;
    this.name = ""; this.inven_icon = 0; this.buttonpalette = 0;

    this.jetpack_on = 0; this.spritebridge = 0; this.lastrandomspot = 0;
    this.scuba_on = 0; this.footprintpal = 0; this.heat_on = 0;

    this.holster_weapon = 0; this.falling_counter = 0;
    this.gotweapon = new Uint8Array(MAX_WEAPONS); this.refresh_inventory = 0; this.palette = null;

    this.toggle_key_flag = 0; this.knuckle_incs = 0; //select_dir;
    this.walking_snd_toggle = 0; this.palookup = 0; this.hard_landing = 0;
    this.max_secret_rooms = 0; this.secret_rooms = 0; this./*fire_flag=0;this.*/pals = new Uint8Array(3);
    this.max_actors_killed = 0; this.actors_killed = 0; this.return_to_center = 0;

    // local but synch variables (ud is local but not synch):

    // FIX_00023: Moved Addfaz's autoaim handler to synch variables (to avoid out of synch)
    this.auto_aim = 0; //AutoAim toggle variable.

    // FIX_00012: added "weapon autoswitch" toggle allowing to turn the autoswitch off
    //            when picking up new weapons. The weapon sound on pickup will remain on=0;this. to not 
    //           affect the opponent's gameplay (so he can still hear you picking up new weapons)
    this.weaponautoswitch = 0;

    this.fakeplayer = 0;
}

//527
function PlayerOrig() {
    this.ox = 0; this.oy = 0; this.oz = 0;
    this.oa = 0; this.os = 0;
}

//653
function StatusBar() {
    this.frag = new Int16Array(MAXPLAYERS); this.got_access = 0; this.last_extra = 0; this.shield_amount = 0; this.curr_weapon = 0;
    this.ammo_amount = new Int16Array(MAXPLAYERS); this.holoduke_on = 0;
    this.gotweapon = new Uint8Array(MAX_WEAPONS); this.inven_icon = 0; this.jetpack_on = 0; this.heat_on = 0;
    this.firstaid_amount = 0; this.steroids_amount = 0; this.holoduke_amount = 0; this.jetpack_amount = 0;
    this.heat_amount = 0; this.scuba_amount = 0; this.boot_amount = 0;
    this.last_weapon = 0; this.weapon_pos = 0; this.kickback_pic = 0;
}

//extern STATUSBARTYPE sbar;
//extern short frags[MAXPLAYERS][MAXPLAYERS];
//extern int32_t cameradist, cameraclock, dukefriction,show_shareware;
//extern uint8_t  networkmode, movesperpacket;
//extern uint8_t  gamequit;

//extern uint8_t  pus,pub,camerashitable,freezerhurtowner,lasermode;
//extern uint8_t  syncstat, syncval[MAXPLAYERS][MOVEFIFOSIZ];
//extern int8_t multiwho, multipos, multiwhat, multiflag;
//extern int32_t syncvalhead[MAXPLAYERS], syncvaltail, syncvaltottail;
//extern int32_t numfreezebounces,rpgblastradius,pipebombblastradius,tripbombblastradius,shrinkerblastradius,morterblastradius,bouncemineblastradius,seenineblastradius;
//// CTW - MODIFICATION
//// extern uint8_t  stereo,eightytwofifty,playerswhenstarted,playonten,everyothertime;
//extern uint8_t  stereo,eightytwofifty,playerswhenstarted,everyothertime;
//// CTW END - MODIFICATION
//extern int32_t myminlag[MAXPLAYERS], mymaxlag, otherminlag, bufferjitter;

//extern int32_t numinterpolations, startofdynamicinterpolations;
//extern int32_t oldipos[MAXINTERPOLATIONS];
//extern int32_t bakipos[MAXINTERPOLATIONS];
//extern int32_t *curipos[MAXINTERPOLATIONS];

//extern short numclouds,clouds[128],cloudx[128],cloudy[128];
//extern int32_t cloudtotalclock,totalmemory;



//extern int32_t myaimmode, myaimstat, omyaimstat;

//extern uint8_t  nHostForceDisableAutoaim;

//#endif  // include-once header.

