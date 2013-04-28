'use strict';

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

var Control = {};

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
    //todo
    return 0;
}

//357
Control.updateKeyboardState = function (key, pressed) {
};

//479
Control.getInput = function(info) {
    //todo
    handle_events();
};

Control.getMouseSensitivity_Y = function() {
    return mouseSensitivity_Y;
};

//743
Control.startup = function () {
    //todo
};

var Mouse = {};

//896
Mouse.getButtons = function() {
    // todo
};