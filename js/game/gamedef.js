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

    actorscrptr = new Int32Array(MAXTILES);
    actortype = new Uint8Array(MAXTILES);

    labelcnt = 0;
    scriptPtr = scriptIdx + 1;
    warning = 0;
    error = 0;
    line_number = 1;
    total_lines = 0;

    passOne(readfromGrp); //Tokenize
    throw new Error("todo. *script = (int32_t) scriptPtr etc");
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
    console.info("label: %s", tempLabel);
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
            console.info("keyword: %s", keyw[i]);
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
            console.log("transNumber *scriptptr: %i from labelcode[%i]: %i", script[scriptPtr] ,i, labelcode[i]);
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

    script[scriptPtr] = parseInt(tempBufStr);
    console.log("transNumber:", script[scriptPtr]);
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

    console.log("tw: %i %s transCount: %i", tw, keyw[tw], transCount);
    
    switch (tw) {
        default:
        case -1:
            return 0; // End
        case 39:
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
        case 17:
            throw new Error("todo");
        case 15:
        case 92:
        case 87:
        case 89:
        case 93:
            throw new Error("todo");
        case 18:
            throw new Error("todo");
        case 19:
            getLabel();
            
            // Check to see it's already defined
            for(i=0;i<NUMKEYWORDS;i++)
            {
                if (labels[labelcnt] == keyw[i]) {
                   error++;
                   console.error("  * ERROR!(L%i) Symbol '%s' is a key word.", line_number, labels[labelcnt]);
                   return 0;
               }
            }
                       
            for (i = 0; i < labelcnt; i++)
            {
                if (labels[labelcnt] == labels[i]) {
                   error++;
                   console.warn("  * WARNING.(L%i) Duplicate definition '%s' ignored.", line_number, labels[labelcnt]);
                   break;
               }
            }
            
            transNumber();
            if (i == labelcnt) {
                console.log("case 19 labelcode[%i] = %i", labelcnt, script[scriptPtr - 1]);
                labelcode[labelcnt++] = script[scriptPtr - 1];
            }
            scriptPtr -= 2;
            return 0;
        case 14:
            throw new Error("todo");
        case 32:
            if (parsing_actor[0] || parsing_state) {
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
                    console.log("case 32 labelcode[%i] = %i", labelcnt, scriptPtr);
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
        case 54:
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
        case 55:
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
        case 7:
            if (parsing_actor[0] || parsing_state) {
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
                        console.warning("  * WARNING.(L%hd) Duplicate action '%s' ignored.", line_number, labels[labelcnt]);
                        return 0;
                    }
                }
                
                if (i == labelcnt) {
                    console.log("case 7 labelcode[%i] = %i", labelcnt, scriptPtr);
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
        case 1:
            if (parsing_state) {
                console.error("  * ERROR!(L%hd) Found 'actor' within 'state'.", line_number);
            }

            if (parsing_actor[0]) {
                console.error("  * ERROR!(L%hd) Found 'actor' within 'actor'.", line_number);
                error++;
            }

            num_squigilly_brackets = 0;
            scriptPtr--;
            parsing_actor[0] = scriptPtr;

            transNumber();
            scriptPtr--;
            actorscrptr[script[scriptPtr]] = parsing_actor[0];

            for (j = 0; j < 4; j++) {
                parsing_actor[j] = 0;
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
                    parsing_actor[j] = script[scriptPtr - 1];
                }
            }

            checking_ifelse = 0;

            return 0;
        case 98:
            throw new Error("todo");
        case 11:
        case 13:
        case 25:
        case 31:
        case 40:
        case 52:
        case 69:
        case 74:
        case 77:
        case 80:
        case 86:
        case 88:
        case 68:
        case 100:
        case 101:
        case 102:
        case 103:
        case 105:
        case 110:
            throw new Error("todo");
        case 2:
        case 23:
        case 28:
        case 99:
        case 37:
        case 48:
        case 58:
            throw new Error("todo");
        case 50:
            throw new Error("todo");
        case 10:
            throw new Error("todo");
        case 75:
            throw new Error("todo");
        case 3:
        case 8:
        case 9:
        case 21:
        case 33:
        case 34:
        case 35:
        case 41:
        case 46:
        case 53:
        case 56:
        case 59:
        case 62:
        case 72:
        case 73:
            //        case 74:
        case 78:
        case 85:
        case 94:
        case 111:
            throw new Error("todo");
        case 43:
        case 44:
        case 49:
        case 5:
        case 6:
        case 27:
        case 26:
        case 45:
        case 51:
        case 63:
        case 64:
        case 65:
        case 67:
        case 70:
        case 71:
        case 81:
        case 82:
        case 90:
        case 91:
        case 109:
            throw new Error("todo");
        case 29:
            throw new Error("todo");
        case 30:
            throw new Error("todo");
        case 76:
            throw new Error("todo");
        case 20:
            scriptPtr--;
            while (textptr.charCodeAt(textptrIdx) != 0x0a) {
                textptrIdx++;
            }

            return 0;
        case 107:
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
        case 108:
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
        case 0:
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
                    console.error("  * ERROR!(L%i) Level file name exceeds character size limit of 128.",line_number);
                    error++;
                    while (textptr[textptrIdx] == ' ') {
                        textptrIdx++;
                    }
                    break; 
                }
            }
            levelFileName[j * 11 + k] = levelFileName;

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
        case 79:
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
        case 57:
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
        case 4:
            throw new Error("todo");
        case 12:
        case 16:
        case 84:
            //        case 21:
        case 22: //KILLIT
        case 36:
        case 38:
        case 42:
        case 47:
        case 61:
        case 66:
        case 83:
        case 95:
        case 96:
        case 97:
        case 104:
        case 106:
            throw new Error("todo");
        case 60:
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