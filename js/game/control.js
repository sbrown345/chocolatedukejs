'use strict';

var MaxJoys = 2;
var MAXGAMEBUTTONS = 64;

var controltype =
{
    keyboard: 0,
    keyboardandmouse: 1,
    keyboardandjoystick: 2,
    keyboardandexternal: 3,
    keyboardandgamepad: 4,
    keyboardandflightstick: 5,
    keyboardandthrustmaster: 6,
    joystickandmouse: 7
};

function _KeyMapping( ) {
    this.key_active = false;
    this.key1 = 0;
    this.key2 = 0;
}

var KeyMapping = structArray(_KeyMapping, MAXGAMEBUTTONS);

var Control = {};

var CONTROL_JoystickEnabled = false;

function ControlInfo() {
    this.clear();
}

ControlInfo.prototype.clear = function() {
    this.dx = 0;
    this.dy = 0;
    this.dz = 0;
    this.dyaw = 0;
    this.dpitch = 0;
    this.droll = 0;
};

function ACTION(i) {
    //Keyboard input
    if ((KB.keyDown[KeyMapping[i].key1]) ||
		(KB.keyDown[KeyMapping[i].key2])
	  ) {
        //console.log("ACTION", i, KeyMapping[i])
        return 1;
    }
    

    //todo 
    return 0;
}

//357
Control.updateKeyboardState = function (key, pressed) {
};

function CONTROL_MapKey(which, key1, key2)
{	
	// FIX_00020: Protect you from assigning a function to the ESC key through duke3d.cfg
	if(key1==sc_Escape || key2==sc_Escape)
	{
		if(key1==sc_Escape)
			key1=0;
		else
			key2=0;

		console.log("Discarding ESCAPE key for function : %s", gamefunctions[which]);
	}
    
	if(key1 || key2)
		KeyMapping[which].key_active = true;
	else 
		KeyMapping[which].key_active = false;

	KeyMapping[which].key1 = key1;
	KeyMapping[which].key2 = key2;
}


//479
Control.getInput = function(info) {
    //todo
    handle_events();
};

Control.getMouseSensitivity_Y = function() {
    return mouseSensitivity_Y;
};

function CONTROL_ClearAction( whichbutton )
{
	KB.keyDown[KeyMapping[whichbutton].key1] = 0;
    KB.keyDown[KeyMapping[whichbutton].key2] = 0;


    //TODO!
    ////RESJOYBUTTON(whichbutton);
    ////RESHATBUTTON(whichbutton);
	
    ////RESMOUSEDIGITALAXIS(whichbutton);
}


//743
Control.startup = function () {
    //todo
};

var Mouse = {};

//896
Mouse.getButtons = function() {
    // todo
};