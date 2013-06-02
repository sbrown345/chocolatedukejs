//'use strict';

var CvarDefs = {};

//
// Variable declarations
//
CvarDefs.console_text_color = 0;
CvarDefs.num_console_lines = 0;
CvarDefs.classic = 0;
CvarDefs.TransConsole = 0;
CvarDefs.DebugJoystick = 0;
CvarDefs.DebugSound = 0;
CvarDefs.DebugFileAccess = 0;
var sounddebugActiveSounds = 0;
var sounddebugAllocateSoundCalls = 0;
var sounddebugDeallocateSoundCalls = 0;

CvarDefs.CubicInterpolation = 0;

CvarDefs.init = function () {
    CvarDefs.console_text_color = 0; // Set default value
    Cvar.RegisterCvar("SetConsoleColor", " - Change console color.", CvarDefs.console_text_color, CvarDefs.DefaultFunction);

    CvarDefs.num_console_lines = 0; // Set default value
    Cvar.RegisterCvar("NumConsoleLines", " - Number of visible console lines.", CvarDefs.num_console_lines, CvarDefs.DefaultFunction);

    CvarDefs.classic = 0; // Set default value
    Cvar.RegisterCvar("Classic", " - Enable Classic Mode.", CvarDefs.classic, CvarDefs.DefaultFunction);

    // FIX_00022b: Sound effects are now sharper and they sound as in the real DOS duke3d.
    CvarDefs.CubicInterpolation = 0; // Set default value
    Cvar.RegisterCvar("EnableCubic", " - Turn on/off Cubic Interpolation for VOCs.", CvarDefs.CubicInterpolation, CvarDefs.DefaultFunction);

    CvarDefs.TransConsole = 1; // Set default value
    Cvar.RegisterCvar("TransConsole", " - Toggle the transparency of the console", CvarDefs.TransConsole, CvarDefs.DefaultFunction);

    CvarDefs.DebugJoystick = 0;
    Cvar.RegisterCvar("DebugJoystick", " - Displays info on the active Joystick", CvarDefs.DebugJoystick, CvarDefs.DefaultFunction);

    sounddebugActiveSounds = 0;
    sounddebugAllocateSoundCalls = 0;
    sounddebugDeallocateSoundCalls = 0;
    CvarDefs.DebugSound = 0;
    Cvar.RegisterCvar("DebugSound", " - Displays info on the active Sounds", CvarDefs.DebugSound, CvarDefs.DefaultFunction);

    CvarDefs.DebugFileAccess = 0;
    Cvar.RegisterCvar("DebugFileAccess", " - Displays info on file access", CvarDefs.DebugFileAccess, CvarDefs.DefaultFunction);

    Cvar.RegisterCvar("TickRate", " - Changes the tick rate", g_iTickRate, CvarDefs.DefaultFunction);
    Cvar.RegisterCvar("TicksPerFrame", " - Changes the ticks per frame", g_iTicksPerFrame, CvarDefs.DefaultFunction);

    Cvar.RegisterCvar("Quit", " - Quit game.", null, CvarDefs.FunctionQuit);
    Cvar.RegisterCvar("Clear", " - Clear the console.", null, CvarDefs.FunctionClear);
    Cvar.RegisterCvar("Name", " - Change player name.", null, CvarDefs.FunctionName);
    Cvar.RegisterCvar("Level", " - Change level. Args: Level <episode> <mission>", null, CvarDefs.FunctionLevel);
    Cvar.RegisterCvar("PlayMidi", " - Plays a MIDI file", null, CvarDefs.FunctionPlayMidi);

    Cvar.RegisterCvar("Help", " - Print out help commands for console", null, CvarDefs.FunctionHelp);
};

// For default int functions
// If your CVAR should simply change a global 'int' variable,
// Then, use this function.
CvarDefs.DefaultFunction = function ($var) {
    var binding = $var;

    var argc = Console.getArgc();
    
    if (argc < 1) {
        Console.printf(binding.name + " " + binding.variable);
        return;
    }

    binding.variable = parseInt(console.getArgv(0), 10);
};

