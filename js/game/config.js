﻿//'use strict';

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
var BlasterConfig = {/*fx_blaster_config struct*/};
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
var scripthandle = 0;
var setupread = 0;

var Config = {};

//95
Config.getSetupFilename = function () {
    setupFilename = "";

    // Are we trying to load a mod?
    if (getGameDir()) {
        throw new Error("mods not supported... yet");
    } else {
        setupFilename = SETUPFILENAME;
    }

    printf("Using Setup file: '" + setupFilename + "'\n");
};


/*
===================
=
= CONFIG_FunctionNameToNum
=
===================
*/

function CONFIG_FunctionNameToNum(func) {
    var i;

    for (i = 0; i < NUMGAMEFUNCTIONS; i++) {
        if (func == gamefunctions[i]) {
            return i;
        }
    }
    return -1;
}

/*
===================
=
= CONFIG_FunctionNumToName
=
===================
*/

function CONFIG_FunctionNumToName(func) {
    if (-1 < func && func < NUMGAMEFUNCTIONS) {
        return gamefunctions[func];
    } else {
        return null;
    }
}

//214
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

//280

function CONFIG_ReadKeys() {
    var i;
    var numkeyentries;
    var $function;
    var keyname1 = "";
    var keyname2 = "";
    var key1, key2;

    // set default keys in case duke3d.cfg was not found

    // FIX_00011: duke3d.cfg not needed anymore to start the game. Will create a default one
    //            if not found and use default keys.

    for (i = 0; i < NUMKEYENTRIES; i++) {
        $function = CONFIG_FunctionNameToNum(keydefaults[i].entryKey);
        key1 = KB_StringToScanCode(keydefaults[i].keyname1);
        key2 = KB_StringToScanCode(keydefaults[i].keyname2);
        CONTROL_MapKey($function, key1, key2);
    }


    numkeyentries = SCRIPT_NumberEntries(scripthandle, "KeyDefinitions");

    for (i = 0; i < numkeyentries; i++)  // i = number in which the functions appear in duke3d.cfg
    {
        $function = CONFIG_FunctionNameToNum(SCRIPT_Entry(scripthandle, "KeyDefinitions", i));
        if ($function != -1)  // ensure it is in the list gamefunctions[$function]
        {
            memset(keyname1, 0, sizeof(keyname1));
            memset(keyname2, 0, sizeof(keyname2));
            SCRIPT_GetDoubleString(
                scripthandle,
                "KeyDefinitions",
                SCRIPT_Entry(scripthandle, "KeyDefinitions", i),
                keyname1,
                keyname2
            );
            key1 = 0;
            key2 = 0;
            if (keyname1[0]) {
                key1 = KB_StringToScanCode(keyname1);
            }
            if (keyname2[0]) {
                key2 = KB_StringToScanCode(keyname2);
            }
            CONTROL_MapKey($function, key1, key2);
        }
    }
}


//541
Config.readSaveNames = function () {
    console.log("todo readSaveNames...");
};


//593
Config.readSetup = function () {
    console.log("Config.readSetup... todo");

    Config.setDefaults();

    scripthandle = Script.load(setupFilename);

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
    
    //if (FXDevice != NumSoundCards)
        FXDevice = SoundScape;

    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "MusicDevice",&MusicDevice);
    

    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "FXVolume",&FXVolume);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "MusicVolume",&MusicVolume);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "SoundToggle",&SoundToggle);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "MusicToggle",&MusicToggle);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "VoiceToggle",&VoiceToggle);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "AmbienceToggle",&AmbienceToggle);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "OpponentSoundToggle",&OpponentSoundToggle);   
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "NumVoices",&NumVoices);
    NumVoices = 32;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "NumChannels",&NumChannels);
    NumChannels = 2;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "NumBits",&NumBits);
    NumBits = 16;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "MixRate",&MixRate);
    MixRate = 44100;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "MidiPort",&MidiPort);
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "BlasterAddress",&dummy);
    //BlasterConfig.Address = dummy;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "BlasterType",&dummy);
    //BlasterConfig.Type = dummy;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "BlasterInterrupt",&dummy);
    //BlasterConfig.Interrupt = dummy;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "BlasterDma8",&dummy);
    //BlasterConfig.Dma8 = dummy;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "BlasterDma16",&dummy);
    //BlasterConfig.Dma16 = dummy;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "BlasterEmu",&dummy);
    //BlasterConfig.Emu = dummy;
    //SCRIPT_GetNumber( scripthandle, "Sound Setup", "ReverseStereo",&ReverseStereo);

    //SCRIPT_GetNumber( scripthandle, "Controls","ControllerType",&ControllerType);
    //SCRIPT_GetNumber( scripthandle, "Controls","MouseAimingFlipped",&ud.mouseflip);
    //SCRIPT_GetNumber( scripthandle, "Controls","MouseAiming",&MouseAiming);
    //SCRIPT_GetNumber( scripthandle, "Controls","GameMouseAiming",(int32 *)&ps[0].aim_mode);
    //SCRIPT_GetNumber( scripthandle, "Controls","AimingFlag",(int32 *)&myaimmode);

    //CONTROL_ClearAssignments();
    
    CONFIG_ReadKeys();

    // todo

};
