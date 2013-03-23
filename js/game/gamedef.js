'use strict';

var total_lines, line_number;
var checking_ifelse = 0, parsing_state = 0;

var last_used_text;
var num_squigilly_brackets;
var last_used_size;

//var g_i = 0, g_p = 0;
//var g_x;
//var g_t = new Int32Array(5);

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

    actorscrptr = new Array(MAXTILES);
    actortype = new Array(MAXTILES);

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
        var refObj = new GetZRangeRefObj(hittype[i].ceilingz, hz, hittype[i].floorz, lz);
        getzrange(s.x, s.y, s.z - (FOURSLEIGHT), s.sectnum, refObj, 127, CLIPMASK0);
        hittype[i].ceilingz = refObj.ceilz;
        hz = refObj.ceilhit;
        hittype[i].floorz = refObj.florz;
        lz = refObj.florhit;
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

function passOne(readFromGrp) {
    while (parseCommand(readFromGrp) === 0);

    if ((error + warning) > 12) {
        console.error("  * ERROR! Too many warnings or errors.");
    }
}