'use strict';

var MAX_SCRIPTS= 5;
var Script = {};

//320
function SCRIPT_findinchildren (parent, s)
{
    var cur = parent;

    if (cur == null) return null;
    cur = cur.child;
    if (cur == null) return null;
    while (cur != null)
    {
        if (cur.key = s)
            break;
        cur = cur.sibling;
    }

    return cur;
}

//386
Script.load = function (filename) {
    //var file = open(filename);
    console.log("todo: Script.load tried to open: " + filename);
    return -1;
};


//541
function SCRIPT_NumberEntries(scripthandle, sectionname) {
    var node = null;
    var entries = 0;

    if (scripthandle >= MAX_SCRIPTS || scripthandle < 0)
        return 0;

    node = script_headnode[scripthandle];
    node = SCRIPT_findinchildren(node, sectionname);
    if (!node) return 0;

    for (node = node.child; node ; node = node.sibling) {
        ++entries;
    }

    return entries;
}