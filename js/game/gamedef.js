'use strict';

var total_lines, line_number;
var checking_ifelse = 0, parsing_state = 0;

var last_used_text;
var num_squigilly_brackets;
var last_used_size;

var g_i = 0, g_p = 0;
var g_x;
var g_t = new Int32Array(5);
var g_sp;

var NUMKEYWORDS = 112;

var keyw =
[
    "definelevelname", // 0
    "actor", // 1    [#]
    "addammo", // 2    [#]
    "ifrnd", // 3    [C]
    "enda", // 4    [:]
    "ifcansee", // 5    [C]
    "ifhitweapon", // 6    [#]
    "action", // 7    [#]
    "ifpdistl", // 8    [#]
    "ifpdistg", // 9    [#]
    "else", // 10   [#]
    "strength", // 11   [#]
    "break", // 12   [#]
    "shoot", // 13   [#]
    "palfrom", // 14   [#]
    "sound", // 15   [filename.voc]
    "fall", // 16   []
    "state", // 17
    "ends", // 18
    "define", // 19
    "//", // 20
    "ifai", // 21
    "killit", // 22
    "addweapon", // 23
    "ai", // 24
    "addphealth", // 25
    "ifdead", // 26
    "ifsquished", // 27
    "sizeto", // 28
    "{", // 29
    "}", // 30
    "spawn", // 31
    "move", // 32
    "ifwasweapon", // 33
    "ifaction", // 34
    "ifactioncount", // 35
    "resetactioncount", // 36
    "debris", // 37
    "pstomp", // 38
    "/*", // 39
    "cstat", // 40
    "ifmove", // 41
    "resetplayer", // 42
    "ifonwater", // 43
    "ifinwater", // 44
    "ifcanshoottarget", // 45
    "ifcount", // 46
    "resetcount", // 47
    "addinventory", // 48
    "ifactornotstayput", // 49
    "hitradius", // 50
    "ifp", // 51
    "count", // 52
    "ifactor", // 53
    "music", // 54
    "include", // 55
    "ifstrength", // 56
    "definesound", // 57
    "guts", // 58
    "ifspawnedby", // 59
    "gamestartup", // 60
    "wackplayer", // 61
    "ifgapzl", // 62
    "ifhitspace", // 63
    "ifoutside", // 64
    "ifmultiplayer", // 65
    "operate", // 66
    "ifinspace", // 67
    "debug", // 68
    "endofgame", // 69
    "ifbulletnear", // 70
    "ifrespawn", // 71
    "iffloordistl", // 72
    "ifceilingdistl", // 73
    "spritepal", // 74
    "ifpinventory", // 75
    "betaname", // 76
    "cactor", // 77
    "ifphealthl", // 78
    "definequote", // 79
    "quote", // 80
    "ifinouterspace", // 81
    "ifnotmoving", // 82
    "respawnhitag", // 83
    "tip", // 84
    "ifspritepal", // 85
    "money", // 86
    "soundonce", // 87
    "addkills", // 88
    "stopsound", // 89
    "ifawayfromwall", // 90
    "ifcanseetarget", // 91
    "globalsound", // 92
    "lotsofglass", // 93
    "ifgotweaponce", // 94
    "getlastpal", // 95
    "pkick", // 96
    "mikesnd", // 97
    "useractor", // 98
    "sizeat", // 99
    "addstrength", // 100   [#]
    "cstator", // 101
    "mail", // 102
    "paper", // 103
    "tossweapon", // 104
    "sleeptime", // 105
    "nullop", // 106
    "definevolumename", // 107
    "defineskillname", // 108
    "ifnosounds", // 109
    "clipdist", // 110
    "ifangdiffl" // 111
];

//var _scriptPtr = 0;
//window.__defineSetter__("scriptPtr", function (v) {
//    if (v === 1405)
//        debugger;
//    _scriptPtr = v;
//});

//window.__defineGetter__("scriptPtr", function() {
//    return _scriptPtr;
//});

//****************************************************************************
//
// DEFINES
//
//****************************************************************************

//
// Setup program defines
//
var SETUPFILENAME = "duke3d.cfg";

//// Max number of players
//#define MAXPLAYERS 16 // dupe of engine const also called MAXPLAYERS????

function loadefs(filename, readfromGrp) {
    var fs, fp;

    fp = TCkopen4load(filename, readfromGrp);
    if (fp <= 0) {
        throw new Error("ERROR: CON(" + filename + ") not found.");
    } else {
        console.log("Compiling: '" + filename + "'.");

        fs = kfilelength(fp);

        last_used_text = textptr;
        last_used_size = fs;

        textptr = kreadText(fp, fs);
        kclose(fp);
        ud.conCRC[0] = crc32Update(str2Bytes(textptr), fs, ud.conCRC[0]);
    }

    actorscrptr = new Int32Array(MAXTILES);
    actortype = new Uint8Array(MAXTILES);

    labelcnt = 0;
    scriptPtr = scriptIdx + 1;
    warning = 0;
    error = 0;
    line_number = 1;
    total_lines = 0;

    passOne(readfromGrp); // Tokenize
    script[scriptPtr] = scriptPtr;
    
    if (warning | error) {
        console.warn("Found %i warning(s), '%i' error(s).", warning, error);
    }
    
    if (error) {
        throw new Error("ERROR in CON(" + filename + ")");
    } else {
        total_lines += line_number;
        console.log("Code Size:%d bytes(%d labels).", (scriptPtr << 2) - 4, labelcnt);
        ud.conSize[0] = scriptPtr - 1;
        
        // FIX_00062: Better support and identification for GRP and CON files for 1.3/1.3d/1.4/1.5
        if (ud.conSize[0] == 16208 && labelcnt == 1794 && conVersion == 15) {
            conVersion = 14;
        }
        console.log("Con version: Looks like v%d", conVersion);
        
        // todo: some warnings about con versions...
    }
}

function ispecial(c) {
    c = typeof c === "number" ? c : c.charCodeAt(0);
    if (c == 0x0a) {
        line_number++;
        return true;
    }

    if (c == ' '.charCodeAt(0) || c == 0x0d)
        return true;

    return false;
}

function isaltok(c) {
    if (!c) return false;
    var ch = typeof c === "number" ? String.fromCharCode(c) : c;
    return (isalnum(c) || ch == '{' || ch == '}' || ch == '/' || ch == '*' || ch == '-' || ch == '_' || ch == '.');
}

function makeitfall(i) {
    var s = sprite[i];
    var hz, lz, c;
    
    if( floorspace(s.sectnum) )
        c = 0;
    else {
        if (ceilingspace(s.sectnum) || sector[s.sectnum].lotag === 2) {
            c = (gc / 6) | 0;
        } else {
            c = gc;
        }
    }

    if ((s.statnum === 1 || s.statnum === 10 || s.statnum === 2 || s.statnum === 6)) {
        var ceilingzRef = new Ref(hittype[i].ceilingz);
        var hzRef = new Ref(hz);
        var floorzRef = new Ref(hittype[i].floorz);
        var lzRef = new Ref(lz);
        getzrange(s.x, s.y, s.z - (FOURSLEIGHT), s.sectnum, ceilingzRef, hzRef, floorzRef, lzRef, 127, CLIPMASK0);
        hittype[i].ceilingz = ceilingzRef.$;
        hz = hzRef.$;
        hittype[i].floorz = floorzRef.$;
        lz = lzRef.$;
    } else {
        hittype[i].ceilingz = sector[s.sectnum].ceilingz;
        hittype[i].floorz = sector[s.sectnum].floorz;
    }

    if( s.z < hittype[i].floorz-(FOURSLEIGHT) )
    {
        if( sector[s.sectnum].lotag == 2 && s.zvel > 3122 )
            s.zvel = 3144;
        if(s.zvel < 6144)
            s.zvel += c;
        else s.zvel = 6144;
        s.z += s.zvel;
    }
    if( s.z >= hittype[i].floorz-(FOURSLEIGHT) )
    {
        s.z = hittype[i].floorz - FOURSLEIGHT;
        s.zvel = 0;
    }
}

function getLabel() {
    while (!isalnum(textptr[textptrIdx])) {
        if (textptr.charCodeAt(textptrIdx) == 0x0a) line_number++;
        textptrIdx++;
        if (!textptr[textptrIdx])
            return;
    }

    var i = 0;
    var tempLabel = "";
    while (!ispecial(textptr[textptrIdx])) {
        tempLabel += textptr[textptrIdx];
        textptrIdx++;
    }
    labels[labelcnt] = tempLabel;
    //console.info("label: %s", tempLabel);
}

function keyword() {
    var tempTextPtrIdx = textptrIdx;

    while (!isaltok(textptr[tempTextPtrIdx])) {
        tempTextPtrIdx++;
        if (!textptr[tempTextPtrIdx])
            return 0;
    }

    var i = 0;
    while (isaltok(textptr[tempTextPtrIdx])) {
        tempbuf[i] = textptr[tempTextPtrIdx++].charCodeAt(0);
        i++;
    }
    tempbuf[i] = 0;

    var tempBufStr = stringFromArray(tempbuf);
    for (i = 0; i < NUMKEYWORDS; i++) {
        if (tempBufStr == keyw[i]) {
            //console.info("keyword: %s", keyw[i]);
            return i;
        }
    }

    return -1;
}

// Returns its code #
function transWord() {
    var i, l;

    while (!isaltok(textptr[textptrIdx])) {
        if (textptr.charCodeAt(textptrIdx) == 0x0a) line_number++;
        if (!textptr[textptrIdx])
            return -1; // end of string
        textptrIdx++;
    }

    l = 0;
    while (isaltok(textptr.charCodeAt(textptrIdx + l))) {
        tempbuf[l] = textptr.charCodeAt(textptrIdx + l);
        l++;
    }
    tempbuf[l] = 0;

    var str = stringFromArray(tempbuf);
    for (i = 0; i < NUMKEYWORDS; i++) {
        if (keyw[i] == str) {
            script[scriptPtr] = i;
            textptrIdx += l;
            scriptPtr++;
            return i;
        }
    }

    textptrIdx += l;

    if (tempbuf[0] == '{'.charCodeAt(0) && tempbuf[1] != 0)
        console.error("  * ERROR!(L%i) Expecting a SPACE or CR between '{' and '%s'.", line_number, String.fromCharCode(tempbuf[1]));
    else if (tempbuf[0] == '}'.charCodeAt(0) && tempbuf[1] != 0)
        console.error("  * ERROR!(L%i) Expecting a SPACE or CR between '}' and '%s'.", line_number, String.fromCharCode(tempbuf[1]));
    else if (tempbuf[0] == '/'.charCodeAt(0) && tempbuf[1] == '/' && tempbuf[2] != 0)
        console.error("  * ERROR!(L%i) Expecting a SPACE between '//' and '%s'.", line_number, String.fromCharCode(tempbuf[2]));
    else if (tempbuf[0] == '/'.charCodeAt(0) && tempbuf[1] == '*' && tempbuf[2] != 0)
        console.error("  * ERROR!(L%i) Expecting a SPACE between '/*' and '%s'.", line_number, String.fromCharCode(tempbuf[2]));
    else if (tempbuf[0] == '*'.charCodeAt(0) && tempbuf[1] == '/' && tempbuf[2] != 0)
        console.error("  * ERROR!(L%i) Expecting a SPACE between '*/' and '%s'.", line_number, String.fromCharCode(tempbuf[2]));
    else console.error("  * ERROR!(L%i) Expecting key word, but found '%s'.", line_number, stringFromArray(tempbuf));

    error++;
    return -1;
}

function transNumber() {
    var i, l;

    while (!isaltok(textptr[textptrIdx])) {
        if (textptr.charCodeAt(textptrIdx) == 0x0a) line_number++;
        textptrIdx++;
        if (!textptr[textptrIdx])
            return; // end of string
    }

    l = 0;
    while (isaltok(textptr.charCodeAt(textptrIdx + l))) {
        tempbuf[l] = textptr.charCodeAt(textptrIdx + l);
        l++;
    }
    tempbuf[l] = 0;

    for (i = 0; i < NUMKEYWORDS; i++) {
        if (labels[labelcnt] == keyw) {
            error++;
            console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
            textptrIdx += l;
        }
    }

    var tempBufStr = stringFromArray(tempbuf);
    for (i = 0; i < labelcnt; i++) {
        if (tempBufStr == labels[i]) {
            // todo: is this right here?
            script[scriptPtr] = labelcode[i];
            if (typeof labelcode[i] == "undefined") {
                debugger;
            }
            //console.log("transNumber *scriptptr: %i from labelcode[%i]: %i", script[scriptPtr], i, labelcode[i]);
            scriptPtr++;
            textptrIdx += l;
            return;
        }
    }

    if (!isDigit(textptr[textptrIdx]) && textptr[textptrIdx] != '-') {

        console.error("  * ERROR!(L%i) Parameter '%s' is undefined.", line_number, stringFromArray(tempbuf));
        error++;
        textptrIdx += l;
        return;
    }

    script[scriptPtr] = parseInt(tempBufStr, 10);
    //console.log("transNumber:", script[scriptPtr]);
    scriptPtr++;

    textptrIdx += l;
}

//450
var transCount = 0;
function parseCommand(readFromGrp) {
    var i, j, k, tempscrptr;
    var done, temp_ifelse_check;
    var tw;
    var origtptr, origtptrIdx;
    var temp_line_number;
    var fp;

    if (error > 12 || !textptr[textptrIdx] || textptr[textptrIdx] == '\0' || textptr[textptrIdx + 1] == '\0') {
        return 1;
    }
    transCount++;

    tw = transWord();

    //console.log("tw: %i %s transCount: %i, line_number: %i, scriptPtr: %i, parsing_actor == 0: %i",
    //    tw, keyw[tw], transCount, line_number, script[scriptPtr], typeof parsing_actor[0] === "undefined" ? 1 : 0);

    switch (tw) {
        default:
        case -1:
            return 0; // End
        case 39: // /*
            // Rem endrem
            scriptPtr--;
            j = line_number;
            do {
                textptrIdx++;
                if (textptr.charCodeAt(textptrIdx) == 0x0a) line_number++;
                if (!textptr[textptrIdx]) {
                    console.error("  * ERROR!(L%d) Found '/*' with no '*/'.", j);
                    error++;
                    return 0;
                }
            } while (textptr[textptrIdx] != '*' || textptr[textptrIdx + 1] != '/');
            textptrIdx += 2;
            return 0;
        case 17: // state
            if (typeof parsing_actor[0] === "undefined" && parsing_state == 0) {
                getLabel();
                scriptPtr--;
                labelcode[labelcnt] = scriptPtr;
                //console.log("case 17 labelcode[%i] = %i", labelcnt, scriptPtr);
                labelcnt++;

                parsing_state = 1;

                return 0;
            }

            getLabel();

            for (i = 0; i < NUMKEYWORDS; i++) {
                if (labels[labelcnt] === keyw[i]) {
                    error++;
                    console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
                    return 0;
                }
            }

            for (j = 0; j < labelcnt; j++) {
                if (labels[j] === labels[labelcnt]) {
                    script[scriptPtr] = labelcode[j]; // todo: check
                    break;
                }
            }

            if (j === labelcnt) {
                console.error("  * ERROR!(L%i) State '%s' not found.", line_number, labels[labelcnt]);
                error++;
            }

            scriptPtr++;
            return 0;
        case 15: // sound
        case 92: // globalsound
        case 87: // soundonce
        case 89: // stopsound
        case 93: // lotsofglass
            transNumber();
            return 0;

        case 18: // ends
            if (parsing_state == 0) {
                console.error("  * ERROR!(L%i) Found 'ends' with no 'state'.", line_number);
                error++;
            }
            // else
            {
                if (num_squigilly_brackets > 0) {
                    printf("  * ERROR!(L%i) Found more '{' than '}' before 'ends'.", line_number);
                    error++;
                }
                if (num_squigilly_brackets < 0) {
                    printf("  * ERROR!(L%i) Found more '}' than '{' before 'ends'.", line_number);
                    error++;
                }
                parsing_state = 0;
            }
            return 0;
        case 19: //define
            getLabel();

            // Check to see it's already defined
            for (i = 0; i < NUMKEYWORDS; i++) {
                if (labels[labelcnt] === keyw[i]) {
                    error++;
                    console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
                    return 0;
                }
            }

            for (i = 0; i < labelcnt; i++) {
                if (labels[labelcnt] === labels[i]) {
                    error++;
                    console.warn("  * WARNING.(L%i) Duplicate definition '%s' ignored.", line_number, labels[labelcnt]);
                    break;
                }
            }

            transNumber();
            if (i == labelcnt) {
                //console.log("case 19 labelcode[%i] = %i", labelcnt, script[scriptPtr - 1]);
                labelcode[labelcnt++] = script[scriptPtr - 1];
            }
            scriptPtr -= 2;
            return 0;
        case 14: // palfrom
            for (j = 0; j < 4; j++) {
                if (keyword() === -1) {
                    transNumber();
                } else {
                    break;
                }

            }

            while (j < 4) {
                script[scriptPtr] = 0;
                scriptPtr++;
                j++;
            }

            return 0;
        case 32: // move
            if (typeof parsing_actor[0] !== "undefined" || parsing_state) {
                transNumber();

                j = 0;
                while (keyword() == -1) {
                    transNumber();
                    scriptPtr--;
                    j |= script[scriptPtr];
                }
                script[scriptPtr] = j;
                scriptPtr++;
            } else {
                scriptPtr--;
                getLabel();

                // Check to see it's already defined
                for (i = 0; i < NUMKEYWORDS; i++) {
                    if (labels[labelcnt] == keyw[i]) {
                        error++;
                        console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
                        return 0;
                    }
                }

                for (i = 0; i < labelcnt; i++) {
                    if (labels[labelcnt] == labels[i]) {
                        error++;
                        console.warn("  * WARNING.(L%i) Duplicate move '%s' ignored.", line_number, labels[labelcnt]);
                        break;
                    }
                }

                if (i == labelcnt) {
                    //console.log("case 32 labelcode[%i] = %i", labelcnt, scriptPtr);
                    labelcode[labelcnt++] = scriptPtr;
                }
                for (j = 0; j < 2; j++) {
                    if (keyword() >= 0) {
                        break;
                    }
                    transNumber();
                }
                for (k = 0; k < 2; k++) {
                    script[scriptPtr] = 0;
                    scriptPtr++;
                }
            }
            return 0;
        case 54: // music
            scriptPtr--;
            transNumber(); // Volume Number (0/4)
            scriptPtr--;

            k = script[scriptPtr] - 1;

            // if it's background music
            if (k >= 0) {
                i = 0;
                while (keyword() == -1) {
                    while (!isaltok(textptr[textptrIdx])) {
                        if (textptr.charCodeAt(textptrIdx) == 0x0a) {
                            line_number++;
                        }
                        textptrIdx++;
                        if (!textptr[textptrIdx]) break;
                    }
                    j = 0;
                    var musicName = "";
                    while (isaltok(textptr[textptrIdx + j])) {
                        musicName += textptr[textptrIdx + j];
                        j++;
                    }
                    music_fn[k][i] = musicName;
                    textptrIdx += j;
                    if (i > 9) {
                        break;
                    }
                    i++;
                }
            } else {
                i = 0;
                while (keyword() == -1) {
                    while (!isaltok(textptr[textptrIdx])) {
                        if (textptr.charCodeAt(textptrIdx) == 0x0a) {
                            line_number++;
                        }
                        textptrIdx++;
                        if (!textptr[textptrIdx]) break;
                    }
                    j = 0;
                    var musicEnvName = "";
                    while (isaltok(textptr[textptrIdx + j])) {
                        musicEnvName += textptr[textptrIdx + j];
                        j++;
                    }
                    env_music_fn[i] = musicEnvName;
                    textptrIdx += j;
                    if (i > 9) {
                        break;
                    }
                    i++;
                }
            }
            return 0;
        case 55: // include
            // include other con files.
            {
                var includedConFile = "";
                scriptPtr--;
                while (!isaltok(textptr[textptrIdx])) {
                    if (textptr.charCodeAt(textptrIdx) == 0x0a) line_number++;
                    textptrIdx++;
                    if (!textptr[textptrIdx]) break;
                }
                j = 0;
                while (isaltok(textptr.charCodeAt(textptrIdx))) {
                    tempbuf[j] = textptr.charCodeAt(textptrIdx++);
                    j++;
                }
                tempbuf[j] = 0;

                includedConFile = stringFromArray(tempbuf);

                fp = TCkopen4load(includedConFile, readFromGrp);
                if (fp <= 0) {
                    error++;
                    console.error("  * ERROR!(ln%i) Could not find '%s'.", line_number, labels[labelcnt]);
                    console.error("ERROR: could not open (%s)", includedConFile);
                    throw new Error();
                }

                j = kfilelength(fp);

                console.log("Including: '%s'.", includedConFile);

                temp_line_number = line_number;
                line_number = 1;
                temp_ifelse_check = checking_ifelse;
                checking_ifelse = 0;
                origtptrIdx = textptrIdx;
                origtptr = textptr;

                textptr = kreadText(fp, j);
                textptrIdx = 0;
                kclose(fp);
                ud.conCRC[0] = crc32Update(str2Bytes(textptr), j, ud.conCRC[0]);

                do {
                    done = parseCommand(readFromGrp);
                } while (done == 0);

                textptr = origtptr;
                textptrIdx = origtptrIdx;
                total_lines += line_number;
                line_number = temp_line_number;
                checking_ifelse = temp_ifelse_check;

                return 0;
            }
        case 24: // ai
            if (typeof parsing_actor[0] !== "undefined" || parsing_state) {
                transNumber();
            } else {
                scriptPtr--;
                getLabel();

                for (i = 0; i < NUMKEYWORDS; i++) {
                    if (labels[labelcnt] == keyw[i]) {
                        error++;
                        console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
                        return 0;

                    }
                }

                for (i = 0; i < labelcnt; i++) {
                    if (labels[labelcnt] == labels[i]) {
                        warning++;
                        console.warn("  * WARNING.(L%hd) Duplicate ai '%s' ignored.", line_number, labels[labelcnt]);
                        return 0;
                    }
                }

                if (i === labelcnt) {
                    //console.log("case 7 labelcode[%i] = %i", labelcnt, scriptPtr);
                    labelcode[labelcnt++] = scriptPtr; // todo is this right??
                }

                for (j = 0; j < 3; j++) {
                    if (keyword() >= 0) {
                        break;
                    }
                    if (j === 2) {
                        k = 0;
                        while (keyword() === -1) {
                            transNumber();
                            scriptPtr--;
                            k |= script[scriptPtr];
                        }
                        script[scriptPtr] = k;
                        scriptPtr++;
                        return 0;
                    } else {
                        transNumber();
                    }
                }

                for (k = 0; k < 3; k++) {
                    script[scriptPtr] = 0;
                    scriptPtr++;
                }
            }

            return 0;
            
        case 7: // action
            if (typeof parsing_actor[0] !== "undefined" || parsing_state) {
                transNumber();
            } else {
                scriptPtr--;
                getLabel();

                // Check to see it's already defined
                for (i = 0; i < NUMKEYWORDS; i++) {
                    if (labels[labelcnt] == keyw[i]) {
                        error++;
                        console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
                        return 0;

                    }
                }

                for (i = 0; i < labelcnt; i++) {
                    if (labels[labelcnt] == labels[i]) {
                        warning++;
                        console.warn("  * WARNING.(L%hd) Duplicate action '%s' ignored.", line_number, labels[labelcnt]);
                        return 0;
                    }
                }

                if (i == labelcnt) {
                    //console.log("case 7 labelcode[%i] = %i", labelcnt, scriptPtr);
                    labelcode[labelcnt++] = scriptPtr; // todo is this right??
                }

                for (j = 0; j < 5; j++) {
                    if (keyword() >= 0) {
                        break;
                    }
                    transNumber();
                }

                for (k = 0; k < 5; k++) {
                    script[scriptPtr] = 0;
                    scriptPtr++;
                }
            }
            return 0;
        case 1: // actor
            // todo: parsing_actor just points to script[?] ??

            if (parsing_state) {
                console.error("  * ERROR!(L%hd) Found 'actor' within 'state'.", line_number);
            }

            if (typeof parsing_actor[0] !== "undefined") {
                console.error("  * ERROR!(L%hd) Found 'actor' within 'actor'.", line_number);
                error++;
            }

            num_squigilly_brackets = 0;
            scriptPtr--;
            parsing_actor[0] = scriptPtr;
            //console.log("parsing_actor[0] = %i", parsing_actor[0]);

            transNumber();
            scriptPtr--;
            actorscrptr[script[scriptPtr]] = parsing_actor[0];

            for (j = 0; j < 4; j++) {
                script[parsing_actor[j]] = 0;
                //console.log("*parsing_actor[%i] = %i", j, script[parsing_actor[j]]); // ? todo check
                if (j == 3) {
                    j = 0;
                    while (keyword() == -1) {
                        transNumber();
                        scriptPtr--;
                        j |= script[scriptPtr];
                    }
                    script[scriptPtr] = j;
                    scriptPtr++;
                    break;
                } else {
                    if (keyword() >= 0) {
                        scriptPtr += (4 - j);
                        break;
                    }
                    transNumber();
                    script[parsing_actor[j]] = script[scriptPtr - 1];
                    //console.log("*parsing_actor[%i] = %i", j, script[parsing_actor[j]]);
                }
            }

            checking_ifelse = 0;

            return 0;
        case 98: // useractor
            if (parsing_state) {
                console.error("  * ERROR!(L%i) Found 'useritem' within 'state'n", line_number);
                error++;
            }

            if (typeof parsing_actor[0] !== "undefined") {
                console.error("  * ERROR!(L%i) Found 'useritem' within 'actor'.", line_number);
                error++;
            }

            num_squigilly_brackets = 0;
            scriptPtr--;
            parsing_actor[0] = scriptPtr;
            //console.log("parsing_actor[%i] = %i", 0, parsing_actor[0]);

            transNumber();
            scriptPtr--;
            j = script[scriptPtr];

            transNumber();
            scriptPtr--;
            actorscrptr[script[scriptPtr]] = parsing_actor[0];
            actortype[script[scriptPtr]] = j;

            for (j = 0; j < 4; j++) {
                script[parsing_actor[j]] = 0;
                //console.log("parsing_actor[%i] = %i", j, script[parsing_actor[j]]);
                if (j === 3) {
                    j = 0;
                    while (keyword() === -1) {
                        transNumber();
                        scriptPtr++;
                        j |= script[scriptPtr];
                    }
                    script[scriptPtr] = j;
                    scriptPtr++;
                    break;
                } else {
                    if (keyword() >= 0) {
                        scriptPtr += (4 - j);
                        break;
                    }

                    transNumber();
                    script[parsing_actor[j]] = script[scriptPtr - 1];
                    //console.log("parsing_actor[%i] = %i", j, script[parsing_actor[j]]);

                }
            }

            checking_ifelse = 0;

            return 0;

        case 11: // strength
        case 13: // shoot
        case 25: // addphealth
        case 31: // spawn
        case 40: // cstat
        case 52: // count
        case 69: // endofgame
        case 74: // spritepal
        case 77: // cactor
        case 80: // quote
        case 86: // money
        case 88: // addkills
        case 68: // debug
        case 100: // addstrength
        case 101: // cstator
        case 102: // mail
        case 103: // paper
        case 105: // sleeptime
        case 110: // clipdist
            transNumber();
            return 0;
        case 2: // addammo
        case 23: // addweapon
        case 28: // sizeto
        case 99: // sizeat
        case 37: // debris
        case 48: // addinventory
        case 58: // guts
            transNumber();
            transNumber();
            break;
        case 50: // hitradius
            transNumber();
            transNumber();
            transNumber();
            transNumber();
            transNumber();
            break;
        case 10: // else
            if (checking_ifelse) {
                checking_ifelse--;
                tempscrptr = scriptPtr;
                scriptPtr++; // Leave a spot for the fail location
                parseCommand(readFromGrp);
                script[tempscrptr] = scriptPtr; // todo: is this correct??
            } else {
                scriptPtr--;
                error++;
                console.error("  * ERROR!(L%i) Found 'else' with no 'if'.", line_number);
            }

            return 0;
        case 75: // ifpinventory
            transNumber();
        case 3: // ifrnd
        case 8: // ifpdistl
        case 9: // ifpdistg
        case 21: // ifai
        case 33: // ifwasweapon
        case 34: // ifaction
        case 35: // ifactioncount
        case 41: // ifmove
        case 46: // ifcount
        case 53: // ifactor
        case 56: // ifstrength
        case 59: // ifspawnedby
        case 62: // ifgapzl
        case 72: // iffloordistl
        case 73: // ifceilingdistl
            //        case 74: // spritepal
        case 78: // ifphealthl
        case 85: // ifspritepal
        case 94: // ifgotweaponce
        case 111: // ifangdiffl
            transNumber();
        case 43: // ifonwater
        case 44: // ifinwater
        case 49: // ifactornotstayput
        case 5: // ifcansee
        case 6: // ifhitweapon
        case 27: // ifsquished
        case 26: // ifdead
        case 45: // ifcanshoottarget
        case 51: // ifp
        case 63: // ifhitspace
        case 64: // ifoutside
        case 65: // ifmultiplayer
        case 67: // ifinspace
        case 70: // ifbulletnear
        case 71: // ifrespawn
        case 81: // ifinouterspace
        case 82: // ifnotmoving
        case 90: // ifawayfromwall
        case 91: // ifcanseetarget
        case 109: // ifnosounds
            if (tw === 51) {
                j = 0;
                do {
                    transNumber();
                    scriptPtr--;
                    j |= script[scriptPtr];
                    //console.log("ifnosounds j: %i", j);
                } while (keyword() == -1);
                script[scriptPtr] = j;
                scriptPtr++;
            }

            tempscrptr = scriptPtr;
            scriptPtr++; // Leave a spot for the fail location

            do {
                j = keyword();
                if (j === 20 || j === 39) {
                    parseCommand(readFromGrp);
                }
            } while (j === 20 || j === 39);

            parseCommand(readFromGrp);

            script[tempscrptr] = scriptPtr; // todo: check

            checking_ifelse++;
            return 0;
        case 29: // {
            num_squigilly_brackets++;
            do {
                done = parseCommand(readFromGrp);
            } while (done === 0);
            return 0;
        case 30: // }
            num_squigilly_brackets--;
            if (num_squigilly_brackets < 0) {

                console.error("  * ERROR!(L%i) Found more '}' than '{'.", line_number);
                error++;
            }
            return 1;
        case 76: // betaname
            throw new Error("todo");
        case 20: // "//"
            scriptPtr--;
            while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                textptrIdx++;
            }

            return 0;
        case 107: // definevolumename
            scriptPtr--;
            transNumber();
            scriptPtr--;
            j = script[scriptPtr];
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            i = 0;

            var volumeName = "";
            while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                volumeName += textptr[textptrIdx];
                textptrIdx++;
                i++;
                if (i > 32) {
                    console.error("  * ERROR!(L%i) Volume name exceeds character size limit of 32.", line_number);
                    error++;
                    while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                        textptrIdx++;
                    }
                    break;
                }
            }
            volume_names[j] = volumeName.toUpperCase();
            return 0;
        case 108: // defineskillname
            scriptPtr--;
            transNumber();
            scriptPtr--;
            j = script[scriptPtr];
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            i = 0;

            var skillName = "";
            while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                skillName += textptr[textptrIdx];
                textptrIdx++;
                i++;
                if (i > 32) {
                    console.error("  * ERROR!(L%i) Skill name exceeds character size limit of 32.", line_number);
                    error++;
                    while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                        textptrIdx++;
                    }
                    break;
                }
            }
            skill_names[j] = skillName.toUpperCase();
            return 0;
        case 0: // definelevelname
            scriptPtr--;
            transNumber();
            scriptPtr--;
            j = script[scriptPtr];
            transNumber();
            scriptPtr--;
            k = script[scriptPtr];
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            i = 0;
            var levelFileName = "";
            while (textptr[textptrIdx] != ' ' && textptr.charCodeAt(textptrIdx) != 0x0a) {
                levelFileName += textptr[textptrIdx];
                textptrIdx++;
                i++;
                if (i > 127) {
                    console.error("  * ERROR!(L%i) Level file name exceeds character size limit of 128.", line_number);
                    error++;
                    while (textptr[textptrIdx] == ' ') {
                        textptrIdx++;
                    }
                    break;
                }
            }
            level_file_names[j * 11 + k] = levelFileName; // todo: cannot set this

            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            partime[j * 11 + k] = ((((textptr.charCodeAt(textptrIdx)) - '0'.charCodeAt(0)) * 10 + ((textptr.charCodeAt(textptrIdx + 1)) - '0'.charCodeAt(0))) * 26 * 60) +
                ((((textptr.charCodeAt(textptrIdx + 3)) - '0'.charCodeAt(0)) * 10 + ((textptr.charCodeAt(textptrIdx + 4)) - '0'.charCodeAt(0))) * 26);

            textptrIdx += 5;
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            designertime[j * 11 + k] = ((((textptr.charCodeAt(textptrIdx)) - '0'.charCodeAt(0)) * 10 + ((textptr.charCodeAt(textptrIdx + 1)) - '0'.charCodeAt(0))) * 26 * 60) +
                ((((textptr.charCodeAt(textptrIdx + 3)) - '0'.charCodeAt(0)) * 10 + ((textptr.charCodeAt(textptrIdx + 4)) - '0'.charCodeAt(0))) * 26);

            textptrIdx += 5;
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            i = 0;

            var levelName = "";
            while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                levelName += textptr[textptrIdx];
                textptrIdx++;
                i++;
                if (i > 32) {
                    console.error("  * ERROR!(L%i) Level name exceeds character size limit of 32.", line_number);
                    error++;
                    while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                        textptrIdx++;
                    }
                    break;
                }
            }
            level_names[j * 11 + k] = levelName.toUpperCase();

            return 0;
        case 79: // definequote
            scriptPtr--;
            transNumber();
            k = script[scriptPtr - 1];
            if (k > NUMOFFIRSTTIMEACTIVE) {
                console.error("  * ERROR!(L%i) Quote amount exceeds limit of %d characters.", line_number, NUMOFFIRSTTIMEACTIVE);
                error++;
            }
            scriptPtr--;
            i = 0;
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            var quote = "";
            while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                quote += textptr[textptrIdx];
                textptrIdx++;
                i++;
            }

            fta_quotes[k] = quote;
            return 0;
        case 57: // definesound
            scriptPtr--;
            transNumber();
            k = script[scriptPtr - 1];
            if (k >= NUM_SOUNDS) {
                console.error("  * ERROR!(L%i) Exceeded sound limit of %d.", line_number, NUM_SOUNDS);
                error++;
            }
            scriptPtr--;
            i = 0;
            while (textptr[textptrIdx] == ' ') {
                textptrIdx++;
            }

            var soundName = "";
            while (textptr[textptrIdx] != ' ') {
                soundName += textptr[textptrIdx];
                textptrIdx++;
                i++;
                if (i > 13) {
                    console.log(soundName);
                    console.error("  * ERROR!(L%i) Sound filename exceeded limit of 13 characters.", line_number);
                    error++;
                    while (textptr[textptrIdx] != ' ') {
                        textptrIdx++;
                    }
                    break;
                }
            }
            sounds[k] = soundName;

            transNumber();
            soundps[k] = script[scriptPtr - 1];
            scriptPtr--;
            transNumber();
            soundpe[k] = script[scriptPtr - 1];
            scriptPtr--;
            transNumber();
            soundpr[k] = script[scriptPtr - 1];
            scriptPtr--;
            transNumber();
            soundm[k] = script[scriptPtr - 1];
            scriptPtr--;
            transNumber();
            soundvo[k] = script[scriptPtr - 1];
            scriptPtr--;

            return 0;
        case 4: // enda
            if (typeof parsing_actor === "undefined") {
                console.error("  * ERROR!(L%i) Found 'enda' without defining 'actor'.", line_number);
                error++;
            }
            //            else
            {
                if (num_squigilly_brackets > 0) {
                    console.error("  * ERROR!(L%i) Found more '{' than '}' before 'enda'.", line_number);
                    error++;
                }
                parsing_actor[0] = undefined;
                //console.log("case 4 parsing_actor = 0");
            }

            return 0;
        case 12: // break
        case 16: // fall
        case 84: // tip
            //        case 21:
        case 22: //KILLIT
        case 36: // resetactioncount
        case 38: // pstomp
        case 42: // ifmove
        case 47: // resetcount
        case 61: // wackplayer
        case 66: // operate
        case 83: // respawnhitag
        case 95: // getlastpal
        case 96: // pkick
        case 97: // mikesnd
        case 104: // tossweapon
        case 106: // nullop
            return 0;
        case 60: //gamestartup
            {
                var params = new Int32Array(30);

                scriptPtr--;
                for (j = 0; j < 30; j++) {
                    transNumber();
                    scriptPtr--;
                    params[j] = script[scriptPtr];

                    if (j != 25) continue; // we try to guess if we are using 1.3/1.3d or 1.4/1.5 con files

                    if (keyword() != -1) // Is the 26th variable set? If so then it's probably a 1.4/1.5 con file
                    {
                        break;
                    }
                    else {
                        conVersion = 15;
                    }
                }
                /* From Jonathon's code --mk
                v1.3d					v1.5
    
                DEFAULTVISIBILITY		DEFAULTVISIBILITY
                GENERICIMPACTDAMAGE		GENERICIMPACTDAMAGE
                MAXPLAYERHEALTH			MAXPLAYERHEALTH
                STARTARMORHEALTH		STARTARMORHEALTH
                RESPAWNACTORTIME		RESPAWNACTORTIME
                RESPAWNITEMTIME			RESPAWNITEMTIME
                RUNNINGSPEED			RUNNINGSPEED
                                        GRAVITATIONALCONSTANT
                RPGBLASTRADIUS			RPGBLASTRADIUS
                PIPEBOMBRADIUS			PIPEBOMBRADIUS
                SHRINKERBLASTRADIUS		SHRINKERBLASTRADIUS
                TRIPBOMBBLASTRADIUS		TRIPBOMBBLASTRADIUS
                MORTERBLASTRADIUS		MORTERBLASTRADIUS
                BOUNCEMINEBLASTRADIUS	BOUNCEMINEBLASTRADIUS
                SEENINEBLASTRADIUS		SEENINEBLASTRADIUS
                MAXPISTOLAMMO			MAXPISTOLAMMO
                MAXSHOTGUNAMMO			MAXSHOTGUNAMMO
                MAXCHAINGUNAMMO			MAXCHAINGUNAMMO
                MAXRPGAMMO				MAXRPGAMMO
                MAXHANDBOMBAMMO			MAXHANDBOMBAMMO
                MAXSHRINKERAMMO			MAXSHRINKERAMMO
                MAXDEVISTATORAMMO		MAXDEVISTATORAMMO
                MAXTRIPBOMBAMMO			MAXTRIPBOMBAMMO
                MAXFREEZEAMMO			MAXFREEZEAMMO
                                        MAXGROWAMMO
                CAMERASDESTRUCTABLE		CAMERASDESTRUCTABLE
                NUMFREEZEBOUNCES		NUMFREEZEBOUNCES
                FREEZERHURTOWNER		FREEZERHURTOWNER
                                        QSIZE
                                        TRIPBOMBLASERMODE
                */

                // Used Jonathon Fowler's parser. Cool to make the code 
                // robust to 1.3 con files --mk

                j = 0;

                ud.const_visibility = params[j++];
                impact_damage = params[j++];
                max_player_health = params[j++];
                max_armour_amount = params[j++];
                respawnactortime = params[j++];
                respawnitemtime = params[j++];
                dukefriction = params[j++];
                if (conVersion == 15)
                    gc = params[j++];
                else
                    gc = 176; // default (guess) when using 1.3d CONs
                rpgblastradius = params[j++];
                pipebombblastradius = params[j++];
                shrinkerblastradius = params[j++];
                tripbombblastradius = params[j++];
                morterblastradius = params[j++];
                bouncemineblastradius = params[j++];
                seenineblastradius = params[j++];
                max_ammo_amount[PISTOL_WEAPON] = params[j++];
                max_ammo_amount[SHOTGUN_WEAPON] = params[j++];
                max_ammo_amount[CHAINGUN_WEAPON] = params[j++];
                max_ammo_amount[RPG_WEAPON] = params[j++];
                max_ammo_amount[HANDBOMB_WEAPON] = params[j++];
                max_ammo_amount[SHRINKER_WEAPON] = params[j++];
                max_ammo_amount[DEVISTATOR_WEAPON] = params[j++];
                max_ammo_amount[TRIPBOMB_WEAPON] = params[j++];
                max_ammo_amount[FREEZE_WEAPON] = params[j++];
                if (conVersion == 15)
                    max_ammo_amount[GROW_WEAPON] = params[j++];
                else
                    max_ammo_amount[GROW_WEAPON] = 50; // default (guess) when using 1.3d CONs
                camerashitable = params[j++];
                numfreezebounces = params[j++];
                freezerhurtowner = params[j++];
                if (conVersion == 15) {
                    spriteqamount = params[j++];

                    if (spriteqamount > 1024)
                        spriteqamount = 1024;
                    else if (spriteqamount < 0)
                        spriteqamount = 0;
                    lasermode = params[j++];
                }
                else {
                    // spriteqamount = 64 is the default
                    lasermode = 0; // default (guess) when using 1.3d CONs
                }

                return 0;
            }

    } // end of switch(tw)

    return 0;
}

//1514
function passOne(readFromGrp) {
    while (parseCommand(readFromGrp) === 0);

    if ((error + warning) > 12) {
        console.error("  * ERROR! Too many warnings or errors.");
    }
}

//1724
function furthestangle(i, angs) {
    var j, hitsect = new Ref(), hitwall = new Ref(), hitspr = new Ref(), furthest_angle, angincs;
    var hx = new Ref(), hy = new Ref(), hz = new Ref(), d, greatestd;
    var s = sprite[i];

    greatestd = -(1 << 30);
    angincs = (2048 / angs) | 0;

    if (s.picnum != APLAYER)
        if ((g_t[0] & 63) > 2) return (s.ang + 1024);

    for (j = s.ang; j < (2048 + s.ang); j += angincs) {
        hitscan(s.x, s.y, s.z - (8 << 8), s.sectnum,
            sintable[(j + 512) & 2047],
            sintable[j & 2047], 0,
            hitsect, hitwall, hitspr, hx, hy, hz, CLIPMASK1);

        d = klabs(hx.$ - s.x) + klabs(hy.$ - s.y);

        if (d > greatestd) {
            greatestd = d;
            furthest_angle = j;
        }
    }
    return (furthest_angle & 2047);
}


function parse() {
    var j, l, s;

    if(killit_flag) return 1;

//    if(*it == 1668249134L) gameexit("\nERR");

    switch(insptr)
    {
        case 3:
            insptrIdx++;
            parseifelse( rnd(insptr[insptrIdx]));
            break;
        case 45:

            if(g_x > 1024)
            {
                var temphit = new Ref(0), sclip, angdif;

                if( badguy(g_sp) && g_sp.xrepeat > 56 )
                {
                    sclip = 3084;
                    angdif = 48;
                }
                else
                {
                    sclip = 768;
                    angdif = 16;
                }

                j = hitasprite(g_i,temphit);
                if(j == (1<<30))
                {
                    parseifelse(1);
                    break;
                }
                if(j > sclip)
                {
                    if(temphit.$ >= 0 && sprite[temphit.$].picnum == g_sp.picnum)
                        j = 0;
                    else
                    {
                        g_sp.ang += angdif;j = hitasprite(g_i,temphit);g_sp.ang -= angdif;
                        if(j > sclip)
                        {
                            if(temphit.$ >= 0 && sprite[temphit.$].picnum == g_sp.picnum)
                                j = 0;
                            else
                            {
                                g_sp.ang -= angdif;j = hitasprite(g_i,temphit);g_sp.ang += angdif;
                                if( j > 768 )
                                {
                                    if(temphit.$ >= 0 && sprite[temphit.$].picnum == g_sp.picnum)
                                        j = 0;
                                    else j = 1;
                                }
                                else j = 0;
                            }
                        }
                        else j = 0;
                    }
                }
                else j =  0;
            }
            else j = 1;

            parseifelse(j);
            break;
        case 91:
            j = cansee(g_sp.x,g_sp.y,g_sp.z-((TRAND&41)<<8),g_sp.sectnum,ps[g_p].posx,ps[g_p].posy,ps[g_p].posz/*-((TRAND&41)<<8)*/,sprite[ps[g_p].i].sectnum);
            parseifelse(j);
            if( j ) hittype[g_i].timetosleep = SLEEPTIME;
            break;

        case 49:
            parseifelse(hittype[g_i].actorstayput == -1);
            break;
        case 5:
        {
            spritetype *s;

            if(ps[g_p].holoduke_on >= 0)
            {
                s = sprite[ps[g_p].holoduke_on];
                j = cansee(g_sp.x,g_sp.y,g_sp.z-(TRAND&((32<<8)-1)),g_sp.sectnum,
                       s.x,s.y,s.z,s.sectnum);
                if(j == 0)
                    s = sprite[ps[g_p].i];
            }
            else s = sprite[ps[g_p].i];

            j = cansee(g_sp.x,g_sp.y,g_sp.z-(TRAND&((47<<8))),g_sp.sectnum,
                s.x,s.y,s.z-(24<<8),s.sectnum);

            if(j == 0)
            {
                if( ( klabs(hittype[g_i].lastvx-g_sp.x)+klabs(hittype[g_i].lastvy-g_sp.y) ) <
                    ( klabs(hittype[g_i].lastvx-s.x)+klabs(hittype[g_i].lastvy-s.y) ) )
                        j = 0;

                if( j == 0 )
                {
                    j = furthestcanseepoint(g_i,s,hittype[g_i].lastvx,hittype[g_i].lastvy);

                    if(j == -1) j = 0;
                    else j = 1;
                }
            }
            else
            {
                hittype[g_i].lastvx = s.x;
                hittype[g_i].lastvy = s.y;
            }

            if( j == 1 && ( g_sp.statnum == 1 || g_sp.statnum == 6 ) )
                hittype[g_i].timetosleep = SLEEPTIME;

            parseifelse(j == 1);
            break;
        }

        case 6:
            parseifelse(ifhitbyweapon(g_i) >= 0);
            break;
        case 27:
            parseifelse( ifsquished(g_i, g_p) == 1);
            break;
        case 26:
            {
                j = g_sp.extra;
                if(g_sp.picnum == APLAYER)
                    j--;
                parseifelse(j < 0);
            }
            break;
        case 24:
            insptrIdx++;
            throw "todo"
            //////g_t[5] = insptr[insptrIdx];
            //////g_t[4] = *(int32_t *)(g_t[5]);       // Action
            //////g_t[1] = *(int32_t *)(g_t[5]+4);       // move
            //////g_sp.hitag = *(int32_t *)(g_t[5]+8);    // Ai
            //////g_t[0] = g_t[2] = g_t[3] = 0;
            //////if(g_sp.hitag&random_angle)
            //////    g_sp.ang = TRAND&2047;
            //////insptrIdx++;
            break;
        case 7:
            insptrIdx++;
            g_t[2] = 0;
            g_t[3] = 0;
			// FIX_00093: fixed crashbugs in multiplayer (mine/blimp)
			// This is the blimp bug.
			// *.con code 1.3 and 1.4 are buggy when you try to blow up the 
			// blimp in multiplayer. duke3d_w32 /q2 /m /v3 /l9
			// This is because the con code gives a timeout value of 2048 
			// as a action address instead of giving a real action address.
			// We simply counter this specific con code bug by resetting 
			// the action address to 0 when we get an address "2048":
			g_t[4] = ((insptr[insptrIdx])==2048)?0:(insptr[insptrIdx]);
            insptrIdx++;
            break;

        case 8:
            insptrIdx++;
            parseifelse(g_x < insptr[insptrIdx]);
            if(g_x > MAXSLEEPDIST && hittype[g_i].timetosleep == 0)
                hittype[g_i].timetosleep = SLEEPTIME;
            break;
        case 9:
            insptrIdx++;
            parseifelse(g_x > insptr[insptrIdx]);
            if(g_x > MAXSLEEPDIST && hittype[g_i].timetosleep == 0)
                hittype[g_i].timetosleep = SLEEPTIME;
            break;
        case 10:
            throw "todo"
            //////insptr = (int32_t *) *(insptr+1);
            //////break;
        case 100:
            insptrIdx++;
            g_sp.extra += insptr[insptrIdx];
            insptrIdx++;
            break;
        case 11:
            insptrIdx++;
            g_sp.extra = insptr[insptrIdx];
            insptrIdx++;
            break;
        case 94:
            insptrIdx++;

            if(ud.coop >= 1 && ud.multimode > 1)
            {
                if(insptr[insptrIdx] == 0)
                {
                    for(j=0;j < ps[g_p].weapreccnt;j++)
                        if( ps[g_p].weaprecs[j] == g_sp.picnum )
                            break;

                    parseifelse(j < ps[g_p].weapreccnt && g_sp.owner == g_i);
                }
                else if(ps[g_p].weapreccnt < 16)
                {
                    ps[g_p].weaprecs[ps[g_p].weapreccnt++] = g_sp.picnum;
                    parseifelse(g_sp.owner == g_i);
                }
            }
            else parseifelse(0);
            break;
        case 95:
            insptrIdx++;
            if(g_sp.picnum == APLAYER)
                g_sp.pal = ps[g_sp.yvel].palookup;
            else g_sp.pal = hittype[g_i].tempang;
            hittype[g_i].tempang = 0;
            break;
        case 104:
            insptrIdx++;
            checkweapons(ps[g_sp.yvel]);
            break;
        case 106:
            insptrIdx++;
            break;
        case 97:
            insptrIdx++;
            if(Sound[g_sp.yvel].num == 0)
                spritesound(g_sp.yvel,g_i);
            break;
        case 96:
            insptrIdx++;

            if( ud.multimode > 1 && g_sp.picnum == APLAYER )
            {
                if(ps[otherp].quick_kick == 0)
                    ps[otherp].quick_kick = 14;
            }
            else if(g_sp.picnum != APLAYER && ps[g_p].quick_kick == 0)
                ps[g_p].quick_kick = 14;
            break;
        case 28:
            insptrIdx++;

            j = ((insptr[insptrIdx])-g_sp.xrepeat)<<1;
            g_sp.xrepeat += ksgn(j);

            insptrIdx++;

            if( ( g_sp.picnum == APLAYER && g_sp.yrepeat < 36 ) ||
               insptr[insptrIdx] < g_sp.yrepeat ||
               ((g_sp.yrepeat*(tiles[g_sp.picnum].dim.height+8))<<2) < (hittype[g_i].floorz - hittype[g_i].ceilingz) )
            {
                j = ((insptr[insptrIdx])-g_sp.yrepeat)<<1;
                if( klabs(j) ) g_sp.yrepeat += ksgn(j);
            }

            insptrIdx++;

            break;
        case 99:
            insptrIdx++;
            g_sp.xrepeat = toUint8( insptr[insptrIdx]);
            insptrIdx++;
            g_sp.yrepeat = toUint8( insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 13:
            insptrIdx++;
            shoot(g_i,insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 87:
            insptrIdx++;
            if( Sound[insptr[insptrIdx]].num == 0 )
                spritesound( insptr[insptrIdx],g_i);
            insptrIdx++;
            break;
        case 89:
            insptrIdx++;
            if( Sound[insptr[insptrIdx]].num > 0 )
                stopsound(insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 92:
            insptrIdx++;
            if(g_p == screenpeek || ud.coop==1)
                spritesound( insptr[insptrIdx],ps[screenpeek].i);
            insptrIdx++;
            break;
        case 15:
            insptrIdx++;
            spritesound( insptr[insptrIdx],g_i);
            insptrIdx++;
            break;
        case 84:
            insptrIdx++;
            ps[g_p].tipincs = 26;
            break;
        case 16:
            throw "todo"
            ////            insptrIdx++;
////            g_sp.xoffset = 0;
////            g_sp.yoffset = 0;
//////            if(!gotz)
////            {
////                var c;

////                if( floorspace(g_sp.sectnum) )
////                    c = 0;
////                else
////                {
////                    if( ceilingspace(g_sp.sectnum) || sector[g_sp.sectnum].lotag == 2)
////                        c = gc/6;
////                    else c = gc;
////                }

////                if( hittype[g_i].cgg <= 0 || (sector[g_sp.sectnum].floorstat&2) )
////                {
////                    getglobalz(g_i);
////                    hittype[g_i].cgg = 6;
////                }
////                else hittype[g_i].cgg --;

////                if( g_sp.z < (hittype[g_i].floorz-FOURSLEIGHT) )
////                {
////                    g_sp.zvel += c;
////                    g_sp.z+=g_sp.zvel;

////                    if(g_sp.zvel > 6144) g_sp.zvel = 6144;
////                }
////                else
////                {
////                    g_sp.z = hittype[g_i].floorz - FOURSLEIGHT;

////                    if( badguy(g_sp) || ( g_sp.picnum == APLAYER && g_sp.owner >= 0) )
////                    {

////                        if( g_sp.zvel > 3084 && g_sp.extra <= 1)
////                        {
////                            if(g_sp.pal != 1 && g_sp.picnum != DRONE)
////                            {
////                                if(g_sp.picnum == APLAYER && g_sp.extra > 0)
////                                    goto SKIPJIBS;
////                                guts(g_sp,JIBS6,15,g_p);
////                                spritesound(SQUISHED,g_i);
////                                spawn(g_i,BLOODPOOL);
////                            }

////                            SKIPJIBS:

////                            hittype[g_i].picnum = SHOTSPARK1;
////                            hittype[g_i].extra = 1;
////                            g_sp.zvel = 0;
////                        }
////                        else if(g_sp.zvel > 2048 && sector[g_sp.sectnum].lotag != 1)
////                        {

////                            j = g_sp.sectnum;
////                            pushmove(&g_sp.x,&g_sp.y,&g_sp.z,(short*)&j,128L,(4L<<8),(4L<<8),CLIPMASK0);
////                            if(j != g_sp.sectnum && j >= 0 && j < MAXSECTORS)
////                                changespritesect(g_i,j);

////                            spritesound(THUD,g_i);
////                        }
////                    }
////                    if(sector[g_sp.sectnum].lotag == 1)
////                        switch (g_sp.picnum)
////                        {
////                            case OCTABRAIN:
////                            case COMMANDER:
////                            case DRONE:
////                                break;
////                            default:
////                                g_sp.z += (24<<8);
////                                break;
////                        }
////                    else g_sp.zvel = 0;
////                }
////            }

            break;
        case 4:
        case 12:
        case 18:
            return 1;
        case 30:
            insptrIdx++;
            return 1;
        case 2:
            throw "todo"
            //insptrIdx++;
            //if( ps[g_p].ammo_amount[insptr[insptrIdx]] >= max_ammo_amount[insptr[insptrIdx]] )
            //{
            //    killit_flag = 2;
            //    break;
            //}
            //addammo( insptr[insptrIdx], ps[g_p], *(insptr+1) );
            //if(ps[g_p].curr_weapon == KNEE_WEAPON)
            //    if( ps[g_p].gotweapon[insptr[insptrIdx]] )
            //        addweapon( ps[g_p], insptr[insptrIdx] );
            //insptr += 2;
            //break;
        case 86:
            insptrIdx++;
            lotsofmoney(g_sp,insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 102:
            insptrIdx++;
            lotsofmail(g_sp,insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 105:
            insptrIdx++;
            hittype[g_i].timetosleep = insptr[insptrIdx];
            insptrIdx++;
            break;
        case 103:
            insptrIdx++;
            lotsofpaper(g_sp,insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 88:
            insptrIdx++;
            ps[g_p].actors_killed += insptr[insptrIdx];
            hittype[g_i].actorstayput = -1;
            insptrIdx++;
            break;
        case 93:
            insptrIdx++;
            spriteglass(g_i,insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 22:
            insptrIdx++;
            killit_flag = 1;
            break;
        case 23:
            throw "todo"
            ////insptrIdx++;
            ////if( ps[g_p].gotweapon[insptr[insptrIdx]] == 0 ) addweapon( ps[g_p], insptr[insptrIdx] );
            ////else if( ps[g_p].ammo_amount[insptr[insptrIdx]] >= max_ammo_amount[insptr[insptrIdx]] )
            ////{
            ////     killit_flag = 2;
            ////     break;
            ////}
            ////addammo( insptr[insptrIdx], ps[g_p], *(insptr+1) );
            ////if(ps[g_p].curr_weapon == KNEE_WEAPON)
            ////    if( ps[g_p].gotweapon[insptr[insptrIdx]] )
            ////        addweapon( ps[g_p], insptr[insptrIdx] );
            ////insptr+=2;
            ////break;
        case 68:
            insptrIdx++;
            printf("%d\n",insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 69:
            insptrIdx++;
            ps[g_p].timebeforeexit = insptr[insptrIdx];
            ps[g_p].customexitsound = -1;
            ud.eog = 1;
            insptrIdx++;
            break;
        case 25:
            insptrIdx++;

            if(ps[g_p].newowner >= 0)
            {
                ps[g_p].newowner = -1;
                ps[g_p].posx = ps[g_p].oposx;
                ps[g_p].posy = ps[g_p].oposy;
                ps[g_p].posz = ps[g_p].oposz;
                ps[g_p].ang = ps[g_p].oang;
                updatesector(ps[g_p].posx,ps[g_p].posy,ps[g_p].cursectnum);
                setpal(ps[g_p]);

                j = headspritestat[1];
                while(j >= 0)
                {
                    if(sprite[j].picnum==CAMERA1)
                        sprite[j].yvel = 0;
                    j = nextspritestat[j];
                }
            }

            j = sprite[ps[g_p].i].extra;

            if(g_sp.picnum != ATOMICHEALTH)
            {
                if( j > max_player_health && insptr[insptrIdx] > 0 )
                {
                    insptrIdx++;
                    break;
                }
                else
                {
                    if(j > 0)
                        j += insptr[insptrIdx];
                    if ( j > max_player_health && insptr[insptrIdx] > 0 )
                        j = max_player_health;
                }
            }
            else
            {
                if( j > 0 )
                    j += insptr[insptrIdx];
                if ( j > (max_player_health<<1) )
                    j = (max_player_health<<1);
            }

            if(j < 0) j = 0;

            if(ud.god == 0)
            {
                if(insptr[insptrIdx] > 0)
                {
                    if( ( j - insptr[insptrIdx] ) < (max_player_health>>2) &&
                        j >= (max_player_health>>2) )
                            spritesound(DUKE_GOTHEALTHATLOW,ps[g_p].i);

                    ps[g_p].last_extra = j;
                }

                sprite[ps[g_p].i].extra = j;
            }

            insptrIdx++;
            break;
        case 17:
            {
                throw "todo"
                ////int32_t *tempscrptr;

                ////tempscrptr = insptr+2;

                ////insptr = (int32_t *) *(insptr+1);
                ////while(1) if(parse()) break;
                ////insptr = tempscrptr;
            }
            break;
        case 29:
            insptrIdx++;
            while(1) if(parse()) break;
            break;
        case 32:
            g_t[0]=0;
            insptrIdx++;
            g_t[1] = insptr[insptrIdx];
            insptrIdx++;
            g_sp.hitag = insptr[insptrIdx];
            insptrIdx++;
            if(g_sp.hitag&random_angle)
                g_sp.ang = TRAND&2047;
            break;
        case 31:
            insptrIdx++;
            if(g_sp.sectnum >= 0 && g_sp.sectnum < MAXSECTORS)
                spawn(g_i,insptr[insptrIdx]);
            insptrIdx++;
            break;
        case 33:
            insptrIdx++;
            parseifelse( hittype[g_i].picnum == insptr[insptrIdx]);
            break;
        case 21:
            insptrIdx++;
            parseifelse(g_t[5] == insptr[insptrIdx]);
            break;
        case 34:
            insptrIdx++;
            parseifelse(g_t[4] == insptr[insptrIdx]);
            break;
        case 35:
            insptrIdx++;
            parseifelse(g_t[2] >= insptr[insptrIdx]);
            break;
        case 36:
            insptrIdx++;
            g_t[2] = 0;
            break;
        case 37:
            {
                var dnum;

                insptrIdx++;
                dnum = insptr[insptrIdx];
                insptrIdx++;

                if(g_sp.sectnum >= 0 && g_sp.sectnum < MAXSECTORS)
                    for(j=(insptr[insptrIdx])-1;j>=0;j--)
                {
                    if(g_sp.picnum == BLIMP && dnum == SCRAP1)
                        s = 0;
                    else s = (TRAND%3);

                    l = EGS(g_sp.sectnum,
                            g_sp.x+(TRAND&255)-128,g_sp.y+(TRAND&255)-128,g_sp.z-(8<<8)-(TRAND&8191),
                            dnum+s,g_sp.shade,32+(TRAND&15),32+(TRAND&15),
                            TRAND&2047,(TRAND&127)+32,
                            -(TRAND&2047),g_i,5);
                    if(g_sp.picnum == BLIMP && dnum == SCRAP1)
                        sprite[l].yvel = weaponsandammosprites[j%14];
                    else sprite[l].yvel = -1;
                    sprite[l].pal = g_sp.pal;
                }
                insptrIdx++;
            }
            break;
        case 52:
            insptrIdx++;
            g_t[0] =  insptr[insptrIdx];
            insptrIdx++;
            break;
        case 101:
            insptrIdx++;
            g_sp.cstat |= insptr[insptrIdx];
            insptrIdx++;
            break;
        case 110:
            insptrIdx++;
            g_sp.clipdist =  insptr[insptrIdx];
            insptrIdx++;
            break;
        case 40:
            insptrIdx++;
            g_sp.cstat =  insptr[insptrIdx];
            insptrIdx++;
            break;
        case 41:
            insptrIdx++;
            parseifelse(g_t[1] == insptr[insptrIdx]);
            break;
        case 42:
            insptrIdx++;

            if(ud.multimode < 2)
            {
                if( lastsavedpos >= 0 && ud.recstat != 2 )
                {
                    ps[g_p].gm = MODE_MENU;
                    KB_ClearKeyDown(sc_Space);
                    cmenu(15000);
                }
                else ps[g_p].gm = MODE_RESTART;
                killit_flag = 2;
            }
            else
            {
                pickrandomspot(g_p);
                g_sp.x = hittype[g_i].bposx = ps[g_p].bobposx = ps[g_p].oposx = ps[g_p].posx;
                g_sp.y = hittype[g_i].bposy = ps[g_p].bobposy = ps[g_p].oposy =ps[g_p].posy;
                g_sp.z = hittype[g_i].bposy = ps[g_p].oposz =ps[g_p].posz;
                updatesector(ps[g_p].posx,ps[g_p].posy,ps[g_p].cursectnum);
                setsprite(ps[g_p].i,ps[g_p].posx,ps[g_p].posy,ps[g_p].posz+PHEIGHT);
                g_sp.cstat = 257;

                g_sp.shade = -12;
                g_sp.clipdist = 64;
                g_sp.xrepeat = 42;
                g_sp.yrepeat = 36;
                g_sp.owner = g_i;
                g_sp.xoffset = 0;
                g_sp.pal = ps[g_p].palookup;

                ps[g_p].last_extra = g_sp.extra = max_player_health;
                ps[g_p].wantweaponfire = -1;
                ps[g_p].horiz = 100;
                ps[g_p].on_crane = -1;
                ps[g_p].frag_ps = g_p;
                ps[g_p].horizoff = 0;
                ps[g_p].opyoff = 0;
                ps[g_p].wackedbyactor = -1;
                ps[g_p].shield_amount = max_armour_amount;
                ps[g_p].dead_flag = 0;
                ps[g_p].pals_time = 0;
                ps[g_p].footprintcount = 0;
                ps[g_p].weapreccnt = 0;
                ps[g_p].fta = 0;
                ps[g_p].ftq = 0;
                ps[g_p].posxv = ps[g_p].posyv = 0;
                ps[g_p].rotscrnang = 0;

                ps[g_p].falling_counter = 0;

                hittype[g_i].extra = -1;
                hittype[g_i].owner = g_i;

                hittype[g_i].cgg = 0;
                hittype[g_i].movflag = 0;
                hittype[g_i].tempang = 0;
                hittype[g_i].actorstayput = -1;
                hittype[g_i].dispicnum = 0;
                hittype[g_i].owner = ps[g_p].i;

                resetinventory(g_p);
                resetweapons(g_p);

                cameradist = 0;
                cameraclock = totalclock;
            }
            setpal(ps[g_p]);

            break;
        case 43:
            parseifelse( klabs(g_sp.z-sector[g_sp.sectnum].floorz) < (32<<8) && sector[g_sp.sectnum].lotag == 1);
            break;
        case 44:
            parseifelse( sector[g_sp.sectnum].lotag == 2);
            break;
        case 46:
            insptrIdx++;
            parseifelse(g_t[0] >= insptr[insptrIdx]);
            break;
        case 53:
            insptrIdx++;
            parseifelse(g_sp.picnum == insptr[insptrIdx]);
            break;
        case 47:
            insptrIdx++;
            g_t[0] = 0;
            break;
        case 48:
            throw "todo"
            //insptr+=2;
            //switch(*(insptr-1))
            //{
            //    case 0:
            //        ps[g_p].steroids_amount = insptr[insptrIdx];
            //        ps[g_p].inven_icon = 2;
            //        break;
            //    case 1:
            //        ps[g_p].shield_amount +=          insptr[insptrIdx];// 100;
            //        if(ps[g_p].shield_amount > max_player_health)
            //            ps[g_p].shield_amount = max_player_health;
            //        break;
            //    case 2:
            //        ps[g_p].scuba_amount =             insptr[insptrIdx];// 1600;
            //        ps[g_p].inven_icon = 6;
            //        break;
            //    case 3:
            //        ps[g_p].holoduke_amount =          insptr[insptrIdx];// 1600;
            //        ps[g_p].inven_icon = 3;
            //        break;
            //    case 4:
            //        ps[g_p].jetpack_amount =           insptr[insptrIdx];// 1600;
            //        ps[g_p].inven_icon = 4;
            //        break;
            //    case 6:
            //        switch(g_sp.pal)
            //        {
            //            case  0: ps[g_p].got_access |= 1;break;
            //            case 21: ps[g_p].got_access |= 2;break;
            //            case 23: ps[g_p].got_access |= 4;break;
            //        }
            //        break;
            //    case 7:
            //        ps[g_p].heat_amount = insptr[insptrIdx];
            //        ps[g_p].inven_icon = 5;
            //        break;
            //    case 9:
            //        ps[g_p].inven_icon = 1;
            //        ps[g_p].firstaid_amount = insptr[insptrIdx];
            //        break;
            //    case 10:
            //        ps[g_p].inven_icon = 7;
            //        ps[g_p].boot_amount = insptr[insptrIdx];
            //        break;
            //}
            //insptrIdx++;
            //break;
        case 50:
            throw "todo"
            //hitradius(g_i,*(insptr+1),*(insptr+2),*(insptr+3),*(insptr+4),*(insptr+5));
            //insptr+=6;
            //break;
        case 51:
            {
                insptrIdx++;

                l = insptr[insptrIdx];
                j = 0;

                s = g_sp.xvel;

                if( (l&8) && ps[g_p].on_ground && (sync[g_p].bits&2) )
                       j = 1;
                else if( (l&16) && ps[g_p].jumping_counter == 0 && !ps[g_p].on_ground &&
                    ps[g_p].poszv > 2048 )
                        j = 1;
                else if( (l&32) && ps[g_p].jumping_counter > 348 )
                       j = 1;
                else if( (l&1) && s >= 0 && s < 8)
                       j = 1;
                else if( (l&2) && s >= 8 && !(sync[g_p].bits&(1<<5)) )
                       j = 1;
                else if( (l&4) && s >= 8 && sync[g_p].bits&(1<<5) )
                       j = 1;
                else if( (l&64) && ps[g_p].posz < (g_sp.z-(48<<8)) )
                       j = 1;
                else if( (l&128) && s <= -8 && !(sync[g_p].bits&(1<<5)) )
                       j = 1;
                else if( (l&256) && s <= -8 && (sync[g_p].bits&(1<<5)) )
                       j = 1;
                else if( (l&512) && ( ps[g_p].quick_kick > 0 || ( ps[g_p].curr_weapon == KNEE_WEAPON && ps[g_p].kickback_pic > 0 ) ) )
                       j = 1;
                else if( (l&1024) && sprite[ps[g_p].i].xrepeat < 32 )
                       j = 1;
                else if( (l&2048) && ps[g_p].jetpack_on )
                       j = 1;
                else if( (l&4096) && ps[g_p].steroids_amount > 0 && ps[g_p].steroids_amount < 400 )
                       j = 1;
                else if( (l&8192) && ps[g_p].on_ground)
                       j = 1;
                else if( (l&16384) && sprite[ps[g_p].i].xrepeat > 32 && sprite[ps[g_p].i].extra > 0 && ps[g_p].timebeforeexit == 0 )
                       j = 1;
                else if( (l&32768) && sprite[ps[g_p].i].extra <= 0)
                       j = 1;
                else if( (l&65536) )
                {
                    if(g_sp.picnum == APLAYER && ud.multimode > 1)
                        j = getincangle(ps[otherp].ang,getangle(ps[g_p].posx-ps[otherp].posx,ps[g_p].posy-ps[otherp].posy));
                    else
                        j = getincangle(ps[g_p].ang,getangle(g_sp.x-ps[g_p].posx,g_sp.y-ps[g_p].posy));

                    if( j > -128 && j < 128 )
                        j = 1;
                    else
                        j = 0;
                }

                parseifelse(j);

            }
            break;
        case 56:
            insptrIdx++;
            parseifelse(g_sp.extra <= insptr[insptrIdx]);
            break;
        case 58:
            throw "todo"
            //insptr += 2;
            //guts(g_sp,*(insptr-1),insptr[insptrIdx],g_p);
            //insptrIdx++;
            break;
        case 59:
            insptrIdx++;
//            if(g_sp.owner >= 0 && sprite[g_sp.owner].picnum == insptr[insptrIdx])
  //              parseifelse(1);
//            else
            parseifelse( hittype[g_i].picnum == insptr[insptrIdx]);
            break;
        case 61:
            insptrIdx++;
            forceplayerangle(ps[g_p]);
            return 0;
        case 62:
            insptrIdx++;
            parseifelse( (( hittype[g_i].floorz - hittype[g_i].ceilingz ) >> 8 ) < insptr[insptrIdx]);
            break;
        case 63:
            parseifelse( sync[g_p].bits&(1<<29));
            break;
        case 64:
            parseifelse(sector[g_sp.sectnum].ceilingstat&1);
            break;
        case 65:
            parseifelse(ud.multimode > 1);
            break;
        case 66:
            throw "todo"
            //insptrIdx++;
            //if( sector[g_sp.sectnum].lotag == 0 )
            //{
            //    neartag(g_sp.x,g_sp.y,g_sp.z-(32<<8),g_sp.sectnum,g_sp.ang,&neartagsector,&neartagwall,&neartagsprite,&neartaghitdist,768L,1);
            //    if( neartagsector >= 0 && isanearoperator(sector[neartagsector].lotag) )
            //        if( (sector[neartagsector].lotag&0xff) == 23 || sector[neartagsector].floorz == sector[neartagsector].ceilingz )
            //            if( (sector[neartagsector].lotag&16384) == 0 )
            //                if( (sector[neartagsector].lotag&32768) == 0 )
            //            {
            //                j = headspritesect[neartagsector];
            //                while(j >= 0)
            //                {
            //                    if(sprite[j].picnum == ACTIVATOR)
            //                        break;
            //                    j = nextspritesect[j];
            //                }
            //                if(j == -1)
            //                    operatesectors(neartagsector,g_i);
            //            }
            //}
            //break;
        case 67:
            parseifelse(ceilingspace(g_sp.sectnum));
            break;

        case 74:
            insptrIdx++;
            if(g_sp.picnum != APLAYER)
                hittype[g_i].tempang = g_sp.pal;
            g_sp.pal = insptr[insptrIdx];
            insptrIdx++;
            break;

        case 77:
            insptrIdx++;
            g_sp.picnum = insptr[insptrIdx];
            insptrIdx++;
            break;

        case 70:
            parseifelse( dodge(g_sp) == 1);
            break;
        case 71:
            if( badguy(g_sp) )
                parseifelse( ud.respawn_monsters );
            else if( inventory(g_sp) )
                parseifelse( ud.respawn_inventory );
            else
                parseifelse( ud.respawn_items );
            break;
        case 72:
            insptrIdx++;
//            getglobalz(g_i);
            parseifelse( (hittype[g_i].floorz - g_sp.z) <= ((insptr[insptrIdx])<<8));
            break;
        case 73:
            insptrIdx++;
//            getglobalz(g_i);
            parseifelse( ( g_sp.z - hittype[g_i].ceilingz ) <= ((insptr[insptrIdx])<<8));
            break;
        case 14:

            insptrIdx++;
            ps[g_p].pals_time = insptr[insptrIdx];
            insptrIdx++;
            for(j=0;j<3;j++)
            {
                ps[g_p].pals[j] = insptr[insptrIdx];
                insptrIdx++;
            }
            break;

/*        case 74:
            insptrIdx++;
            getglobalz(g_i);
            parseifelse( (( hittype[g_i].floorz - hittype[g_i].ceilingz ) >> 8 ) >= insptr[insptrIdx]);
            break;
*/
        case 78:
            insptrIdx++;
            parseifelse( sprite[ps[g_p].i].extra < insptr[insptrIdx]);
            break;

        case 75:
            {
                throw "todo"
                //insptrIdx++;
                //j = 0;
                //switch(*(insptrIdx++))
                //{
                //    case 0:if( ps[g_p].steroids_amount != insptr[insptrIdx])
                //           j = 1;
                //        break;
                //    case 1:if(ps[g_p].shield_amount != max_player_health )
                //            j = 1;
                //        break;
                //    case 2:if(ps[g_p].scuba_amount != insptr[insptrIdx]) j = 1;break;
                //    case 3:if(ps[g_p].holoduke_amount != insptr[insptrIdx]) j = 1;break;
                //    case 4:if(ps[g_p].jetpack_amount != insptr[insptrIdx]) j = 1;break;
                //    case 6:
                //        switch(g_sp.pal)
                //        {
                //            case  0: if(ps[g_p].got_access&1) j = 1;break;
                //            case 21: if(ps[g_p].got_access&2) j = 1;break;
                //            case 23: if(ps[g_p].got_access&4) j = 1;break;
                //        }
                //        break;
                //    case 7:if(ps[g_p].heat_amount != insptr[insptrIdx]) j = 1;break;
                //    case 9:
                //        if(ps[g_p].firstaid_amount != insptr[insptrIdx]) j = 1;break;
                //    case 10:
                //        if(ps[g_p].boot_amount != insptr[insptrIdx]) j = 1;break;
                //}

                //parseifelse(j);
                //break;
            }
        case 38:
            throw "todo"
        //    insptrIdx++;
        //    if( ps[g_p].knee_incs == 0 && sprite[ps[g_p].i].xrepeat >= 40 )
        //        if( cansee(g_sp.x,g_sp.y,g_sp.z-(4<<8),g_sp.sectnum,ps[g_p].posx,ps[g_p].posy,ps[g_p].posz+(16<<8),sprite[ps[g_p].i].sectnum) )
        //    {
        //        ps[g_p].knee_incs = 1;
        //        if(ps[g_p].weapon_pos == 0)
        //            ps[g_p].weapon_pos = -1;
        //        ps[g_p].actorsqu = g_i;
        //    }
        //    break;
        //case 90:
        //    {
        //        var s1;

        //        s1 = g_sp.sectnum;

        //        j = 0;

        //            updatesector(g_sp.x+108,g_sp.y+108,&s1);
        //            if( s1 == g_sp.sectnum )
        //            {
        //                updatesector(g_sp.x-108,g_sp.y-108,&s1);
        //                if( s1 == g_sp.sectnum )
        //                {
        //                    updatesector(g_sp.x+108,g_sp.y-108,&s1);
        //                    if( s1 == g_sp.sectnum )
        //                    {
        //                        updatesector(g_sp.x-108,g_sp.y+108,&s1);
        //                        if( s1 == g_sp.sectnum )
        //                            j = 1;
        //                    }
        //                }
        //            }
        //            parseifelse( j );
        //    }

            break;
        case 80:
            insptrIdx++;
            FTA(insptr[insptrIdx],ps[g_p],0);
            insptrIdx++;
            break;
        case 81:
            parseifelse( floorspace(g_sp.sectnum));
            break;
        case 82:
            parseifelse( (hittype[g_i].movflag&49152) > 16384 );
            break;
        case 83:
            insptrIdx++;
            switch(g_sp.picnum)
            {
                case FEM1:
                case FEM2:
                case FEM3:
                case FEM4:
                case FEM5:
                case FEM6:
                case FEM7:
                case FEM8:
                case FEM9:
                case FEM10:
                case PODFEM1:
                case NAKED1:
                case STATUE:
                    if(g_sp.yvel) operaterespawns(g_sp.yvel);
                    break;
                default:
                    if(g_sp.hitag >= 0) operaterespawns(g_sp.hitag);
                    break;
            }
            break;
        case 85:
            insptrIdx++;
            parseifelse( g_sp.pal == insptr[insptrIdx]);
            break;

        case 111:
            insptrIdx++;
            j = klabs(getincangle(ps[g_p].ang,g_sp.ang));
            parseifelse( j <= insptr[insptrIdx]);
            break;

        case 109:

            for(j=1;j<NUM_SOUNDS;j++)
                if( SoundOwner[j][0].i == g_i )
                    break;

            parseifelse( j == NUM_SOUNDS );
            break;
        default:
            killit_flag = 1;
            break;
    }
    return 0;
}

//3154
function execute( i, p, x) {
    var  done;
    printf("execute %i, x: %i\n", i, x);
    g_i = i;
    g_p = p;
    g_x = x;
    g_sp = sprite[g_i];
    g_t = hittype[g_i].temp_data;

    if( actorscrptr[g_sp.picnum] == 0 ) return;

    insptr = 4 + (actorscrptr[g_sp.picnum]);

    killit_flag = 0;

    if(g_sp.sectnum < 0 || g_sp.sectnum >= MAXSECTORS)
    {
        if(badguy(g_sp))
            ps[g_p].actors_killed++;
        deletesprite(g_i);
        return;
    }


    if(g_t[4]) {
        g_sp.lotag += TICSPERFRAME;
        //console.log("script[g_t[4]+4]: %i", script[g_t[4] + 4]);
        if(g_sp.lotag > script[g_t[4] + 4]/**(int32_t *)(g_t[4]+16) */)
        {
            g_t[2]++;
            g_sp.lotag = 0;
            g_t[3] +=  script[g_t[4]+3];//*(int32_t *)( g_t[4]+12 );
        }
        //if( klabs(g_t[3]) >= klabs( *(int32_t *)(g_t[4]+4) * *(int32_t *)(g_t[4]+12) ) )
        if( klabs(g_t[3]) >= klabs( script[g_t[4]+1] * script[g_t[4]+3] /* *(int32_t *)(g_t[4]+12)*/ ) )
            g_t[3] = 0;
    }

    do
        done = parse();
    while( done == 0 );

    if(killit_flag == 1)
    {
        if(ps[g_p].actorsqu == g_i)
            ps[g_p].actorsqu = -1;
        deletesprite(g_i);
    }
    else
    {
        move();

        if( g_sp.statnum == 1)
        {
            if( badguy(g_sp) )
            {
                if( g_sp.xrepeat > 60 ) return;
                if( ud.respawn_monsters == 1 && g_sp.extra <= 0 ) return;
            }
            else if( ud.respawn_items == 1 && (g_sp.cstat&32768) ) return;

            if(hittype[g_i].timetosleep > 1)
                hittype[g_i].timetosleep--;
            else if(hittype[g_i].timetosleep == 1)
                changespritestat(g_i,2);
        }

        else if(g_sp.statnum == 6)
            switch(g_sp.picnum)
            {
                case RUBBERCAN:
                case EXPLODINGBARREL:
                case WOODENHORSE:
                case HORSEONSIDE:
                case CANWITHSOMETHING:
                case FIREBARREL:
                case NUKEBARREL:
                case NUKEBARRELDENTED:
                case NUKEBARRELLEAKED:
                case TRIPBOMB:
                case EGG:
                    if(hittype[g_i].timetosleep > 1)
                        hittype[g_i].timetosleep--;
                    else if(hittype[g_i].timetosleep == 1)
                        changespritestat(g_i,2);
                    break;
            }
    }
}