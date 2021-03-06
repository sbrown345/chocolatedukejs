﻿//'use strict';

var gamefunctions =
   [
       "Move_Forward",
       "Move_Backward",
       "Turn_Left",
       "Turn_Right",
       "Strafe",
       "Fire",
       "Open",
       "Run",
       "AutoRun",
       "Jump",
       "Crouch",
       "Look_Up",
       "Look_Down",
       "Look_Left",
       "Look_Right",
       "Strafe_Left",
       "Strafe_Right",
       "Aim_Up",
       "Aim_Down",
       "Weapon_1",
       "Weapon_2",
       "Weapon_3",
       "Weapon_4",
       "Weapon_5",
       "Weapon_6",
       "Weapon_7",
       "Weapon_8",
       "Weapon_9",
       "Weapon_10",
       "Inventory",
       "Inventory_Left",
       "Inventory_Right",
       "Holo_Duke",
       "Jetpack",
       "NightVision",
       "MedKit",
       "TurnAround",
       "SendMessage",
       "Map",
       "Shrink_Screen",
       "Enlarge_Screen",
       "Center_View",
       "Holster_Weapon",
       "Show_Opponents_Weapon",
       "Map_Follow_Mode",
       "See_Coop_View",
       "Mouse_Aiming",
       "Toggle_Crosshair",
       "Steroids",
       "Quick_Kick",
       "Next_Weapon",
       "Previous_Weapon",
       "Hide_Weapon",
       "Auto_Aim",
       "Console"
   ];

var NUMKEYENTRIES = 55;  // Don't forget to change NUMGAMEFUNCTIONS as well

// FIX_00011: duke3d.cfg not needed anymore to start the game. Will create a default one
// if not found and use default keys.

function keyEntry(entryKey, keyname1, keyname2) {
    this.entryKey = entryKey;
    this.keyname1 = keyname1;
    this.keyname2 = keyname2;
}

var keydefaults = [
    new keyEntry("Move_Forward", "Up", "Kpad8"),
    new keyEntry("Move_Backward", "Down", "Kpad2"),
    new keyEntry("Turn_Left", "Left", "Kpad4"),
    new keyEntry("Turn_Right", "Right", "Kpad6"),
    new keyEntry("Strafe", "LAlt", "RAlt"),
    new keyEntry("Fire", "LCtrl", "RCtrl"),
    new keyEntry("Open", "Space", ""),
    new keyEntry("Run", "LShift", "RShift"),
    new keyEntry("AutoRun", "CapLck", ""),
    new keyEntry("Jump", "A", "/"),
    new keyEntry("Crouch", "Z", ""),
    new keyEntry("Look_Up", "PgUp", "Kpad9"),
    new keyEntry("Look_Down", "PgDn", "Kpad3"),
    new keyEntry("Look_Left", "Insert", "Kpad0"),
    new keyEntry("Look_Right", "Delete", "Kpad."),
    new keyEntry("Strafe_Left", ",", ""),
    new keyEntry("Strafe_Right", ".", ""),
    new keyEntry("Aim_Up", "Home", "Kpad7"),
    new keyEntry("Aim_Down", "End", "Kpad1"),
    new keyEntry("Weapon_1", "1", ""),
    new keyEntry("Weapon_2", "2", ""),
    new keyEntry("Weapon_3", "3", ""),
    new keyEntry("Weapon_4", "4", ""),
    new keyEntry("Weapon_5", "5", ""),
    new keyEntry("Weapon_6", "6", ""),
    new keyEntry("Weapon_7", "7", ""),
    new keyEntry("Weapon_8", "8", ""),
    new keyEntry("Weapon_9", "9", ""),
    new keyEntry("Weapon_10", "0", ""),
    new keyEntry("Inventory", "Enter", "KpdEnt"),
    new keyEntry("Inventory_Left", "[", ""),
    new keyEntry("Inventory_Right", "]", ""),
    new keyEntry("Holo_Duke", "H", ""),
    new keyEntry("Jetpack", "J", ""),
    new keyEntry("NightVision", "N", ""),
    new keyEntry("MedKit", "M", "		"),
    new keyEntry("TurnAround", "BakSpc", ""),
    new keyEntry("SendMessage", "T", ""),
    new keyEntry("Map", "Tab", ""),
    new keyEntry("Shrink_Screen", "-", "Kpad-"),
    new keyEntry("Enlarge_Screen", "=", "Kpad+"),
    new keyEntry("Center_View", "Kpad5", ""),
    new keyEntry("Holster_Weapon", "ScrLck", ""),
    new keyEntry("Show_Opponents_Weapon", "W", ""),
    new keyEntry("Map_Follow_Mode", "F", ""),
    new keyEntry("See_Coop_View", "K", ""),
    new keyEntry("Mouse_Aiming", "U", ""),
    new keyEntry("Toggle_Crosshair", "I", ""),
    new keyEntry("Steroids", "R", ""),
    new keyEntry("Quick_Kick", "C", ""),
    new keyEntry("Next_Weapon", "'", ""),
    new keyEntry("Previous_Weapon", ";", ""),
    new keyEntry("Hide_Weapon", "S", ""),
    new keyEntry("Auto_Aim", "V", ""),
    new keyEntry("Console", "`", "")
];


