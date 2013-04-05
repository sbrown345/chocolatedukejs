'use strict';

var MAX_STRING_LENGTH = 64;
var MAX_CONSOLE_STRING_LENGTH = 70;
var MAX_CVAR_ARGS = 10;
var MAX_CONSOLE_VIEWABLE = 10;

var BUILD_NUMBER = "Build 19";

// Toggle for the console state
var nConsole_Active = 0;

function ConsoleElement() {
    this.text = null;
    this.prev = null;
    this.next = null;
}

// console argument tracker
var argc = 0;
var argv = new Array(MAX_CVAR_ARGS);
var consoleBuffer = null;
var consoleCurrentView = null;

var Console = {};

Console.init = function () {
    Console.reset();
    Cvar.registerDefaultCvarBindings();
    Console.parseStartupScript();
    Console.printf("Type \'HELP\' for help with console Commands.");
};

//66
Console.reset = function () {
    var element = consoleBuffer;
    while (element) {
        var delElement = element;
        element = element.next;
        delElement.prev = null;
        delElement.next = null;
    }

    consoleBuffer = null;
    consoleCurrentView = null;
};

//92
Console.parseStartupScript = function () {
    ////var startupScript = "startup.cfg";
    ////var file = open(startupScript);
    // todo parseStartupScript
};

//115
Console.handleInput = function () {
    // todo handleInput
};

//354
Console.render = function () {
    // todo console render
};

//561
Console.printf = function (newMessage) {
    console.log(newMessage);

    var element = new ConsoleElement();

    //Store our newly created member as the prev address
    if (consoleBuffer) {
        consoleBuffer.prev = element;
    }

    // Set the next pointer to the front of the list
    element.next = consoleBuffer;

    // Set our view, if they are at the bottom of the list.
    // Otherwise, if we set it everytime, Folks might lose
    // what they were looking for in the output, if they
    // were using pgup and pgdn to scroll through the entries.
    if (consoleCurrentView == consoleBuffer) {
        consoleCurrentView = element;
    }

    // Prepend the entry. This entry is now the head of the list.
    consoleBuffer = element;

    // Make sure we NULL out the prev for our top level element
    element.prev = null;

    consoleBuffer.text = newMessage ? newMessage.slice(0, MAX_CONSOLE_STRING_LENGTH) : "";
};

Console.getArgc = function () {
    return argc;
};

Console.getArgv = function ($var) {
    return argv[$var];
};

Console.isActive = function (i) {
    return nConsole_Active;
};

Console.setActive = function (i) {
    nConsole_Active = (i == 0) ? 0 : 1;
};

