'use strict';

//
// Sound variables
//
var FXDevice;
var MusicDevice;
var FXVolume;
var MusicVolume;
var SoundToggle;
var MusicToggle;
var VoiceToggle;
var AmbienceToggle;
var OpponentSoundToggle; // xduke to toggle opponent's sounds on/off in DM (duke 1.3d scheme)
var BlasterConfig;
var NumVoices;
var NumChannels;
var NumBits;
var MixRate;
var MidiPort;
var ReverseStereo;

var ControllerType;
var MouseAiming = 0;
var BFullScreen = 0;

//
// Screen variables
//
var ScreenMode = 2;
var ScreenWidth = 640;
var ScreenHeight = 480;

//
// Mouse variables
//
var mouseSensitivity_X;
var mouseSensitivity_Y;

var setupFilename = "";
var scriptHandle = 0;
var setupread = 0;

var Config = {};

Config.getSetupFilename = function () {
    setupFilename = "";

    // Are we trying to load a mod?
    if (getGameDir()) {
        throw new Error("mods not supported... yet");
    } else {
        setupFilename = SETUPFILENAME;
    }

    console.log("Using Setup file: '" + setupFilename + "'");
};

Config.readSetup = function () {
    console.log("Config.readSetup... todo");

    Config.setDefaults();

    scriptHandle = Script.load(setupFilename);

    //..
    if(ud.mywchoice[0] == 0 && ud.mywchoice[1] == 0)
    {
        ud.mywchoice[0] = 3;
        ud.mywchoice[1] = 4;
        ud.mywchoice[2] = 5;
        ud.mywchoice[3] = 7;
        ud.mywchoice[4] = 8;
        ud.mywchoice[5] = 6;
        ud.mywchoice[6] = 0;
        ud.mywchoice[7] = 2;
        ud.mywchoice[8] = 9;
        ud.mywchoice[9] = 1;

        //todo:
        //for(dummy=0;dummy<10;dummy++)
        //{
        //    sprintf(buf,"WeaponChoice%d",dummy);
        //    SCRIPT_GetNumber( scripthandle, "Misc", buf, &ud.mywchoice[dummy]);
        //}
    }

    //..

    // todo: Config.readSetup
};

Config.readSaveNames = function() {
    console.log("todo readSaveNames...");
};

Config.setDefaults = function () {
    console.log("Config.readSetup...");
    // sound
    SoundToggle = 1;
    MusicToggle = 1;
    VoiceToggle = 1;
    AmbienceToggle = 1;
    OpponentSoundToggle = 1;
    FXVolume = 220;
    MusicVolume = 200;
    FXDevice = null;
    MusicDevice = -1;
    ReverseStereo = 0;

    // mouse
    mouseSensitivity_X = 16;
    mouseSensitivity_Y = mouseSensitivity_X;

    // game
    ps[0].aim_mode = 0;
    ud.screen_size = 8;
    ud.extended_screen_size = 0;
    ud.screen_tilting = 1;
    ud.brightness = 16;
    ud.auto_run = 1;
    ud.showweapons = 0;
    ud.tickrate = 0;
    ud.scrollmode = 0;
    ud.shadows = 1;
    ud.detail = 1;
    ud.lockout = 0;
    ud.pwlockout[0] = "";
    ud.crosshair = 1;
    ud.m_marker = 1; // for multiplayer
    ud.m_ffire = 1;
    ud.showcinematics = 1;
    ud.weaponautoswitch = 0;
    ud.hideweapon = 0;
    ud.auto_aim = 2; // full by default
    ud.gitdat_mdk = 0;
    ud.playing_demo_rev = 0;

    // com
    ud.rtsname = "DUKE.RTS";
    ud.ridecule[0] = "An inspiration for birth control.";
    ud.ridecule[1] = "You're gonna die for that!";
    ud.ridecule[2] = "It hurts to be you.";
    ud.ridecule[3] = "Lucky Son of a Bitch.";
    ud.ridecule[4] = "Hmmm....Payback time.";
    ud.ridecule[5] = "You bottom dwelling scum sucker.";
    ud.ridecule[6] = "Damn, you're ugly.";
    ud.ridecule[7] = "Ha ha ha...Wasted!";
    ud.ridecule[8] = "You suck!";
    ud.ridecule[9] = "AARRRGHHHHH!!!";

    // Controller
    ControllerType = controltype.keyboardandmouse;
};