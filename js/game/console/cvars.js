'use strict';

function CvarBinding() {
    this.name = "";
    this.help = "";
    this.variable = null;
    this.function = null;
}

var MAX_CVARS = 32;

var cvarBindingList = new Array(MAX_CVARS);
var numCvarBindings = 0;

var Cvar = {};

Cvar.registerDefaultCvarBindings = function () {
    CvarDefs.init();
};

Cvar.RegisterCvar = function(name, help, variable, $function) {
    if (!$function) {
        return;
    }

    cvarBindingList[numCvarBindings] = new CvarBinding();
    cvarBindingList[numCvarBindings].variable = variable;
    cvarBindingList[numCvarBindings].function = $function;
    cvarBindingList[numCvarBindings].name = name;
    cvarBindingList[numCvarBindings].help = help;

    numCvarBindings++;
};