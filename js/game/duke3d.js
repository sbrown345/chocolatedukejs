﻿'use strict';

var CHOCOLATE_DUKE_REV_X = 1;
var CHOCOLATE_DUKE_REV_DOT_Y = 0;

var UNKNOWN_GRP = 0;
var SHAREWARE_GRP13 = 1;
var REGULAR_GRP13D = 2;
var ATOMIC_GRP14_15 = 3;
var DUKEITOUTINDC_GRP = 4;

var mymembuf;

function Player() {
}

var NUMPAGES = 1;

var AUTO_AIM_ANGLE = 48;
var RECSYNCBUFSIZ = 2520;   //2520 is the (LCM of 1-8)*3
var MOVEFIFOSIZ = 256;

var FOURSLEIGHT = (1 << 8);

//var TICRATE = g_iTickRate; // put in game.js instead
//var TICSPERFRAME = (TICRATE / g_iTicksPerFrame);

var NUM_SOUNDS = 450;

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