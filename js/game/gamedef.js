'use strict';

var total_lines, line_number;
var checking_ifelse = 0, parsing_state = 0;

var last_used_text;
var last_used_size;

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

function loadefs(filename, mptr, readfromGrp) {
    var fs, fp;

    fp = TCkopen4load(filename, readfromGrp);
    if (fp <= 0) {
        throw new Error("ERROR: CON(" + filename + ") not found.");
    } else {
        console.log("Compiling '" + filename + "'.");

        fs = kfilelength(fp);

        last_used_text = textptr = mptr;
        last_used_size = fs;

        kread(fp, textptr, fs);
        kclose(fp);
        ud.conCRC[0] = crc32Update(textptr, fs, ud.conCRC[0]);
    }

    textptr[fs - 2] = 0;

    actorscrptr = new Int8Array(MAXTILES);
    actortype = new Uint8Array(MAXTILES);

    labelcnt = 0;
    scriptptr = script[1];
    warning = 0;
    error = 0;
    line_number = 1;
    total_lines = 0;

    passOne(readfromGrp); //Tokenize
    script[0] = scriptptr;
}

function ispecial(c) {
    if (c == 0x0a) {
        line_number++;
        return 1;
    }

    if (c == ' '.charCodeAt(0) || c == 0x0d)
        return 1;

    return 0;
}

function isaltok(c) {
    var ch = String.fromCharCode(c);
    return (isalnum(c) || ch == '{' || ch == '}' || ch == '/' || ch == '*' || ch == '-' || ch == '_' || ch == '.');
}

function getLabel() {
    while (!isalnum(textptr[textptrIdx])) {
        if (textptr[textptrIdx] == 0x0a) line_number++;
        textptrIdx++;
        if (textptr[textptrIdx] == 0)
            return;
    }

    var i = 0;
    var tempLabel = "";
    while (ispecial(textptr[textptrIdx])) {
        tempLabel += String.fromCharCode(textptr[textptrIdx]);
    }
    label = tempLabel;
}

// Returns its code #
function transword() {
    var i, l;

    while (!isaltok(textptr[textptrIdx])) {
        if (textptr[textptrIdx] == 0x0a) line_number++;
        if (textptr[textptrIdx] == 0)
            return -1;
        textptrIdx++;
    }

    l = 0;
    while (isaltok(textptr[textptrIdx + l])) {
        tempbuf[l] = textptr[textptrIdx + l];
        l++;
    }
    tempbuf[l] = 0;

    for (i = 0; i < NUMKEYWORDS; i++) {
        var str = stringFromArray(tempbuf);
        if (keyw[i] == str) {
            scriptptr = i;
            textptrIdx += l;
            scriptptr++;
            return i;
        }
    }

    textptrIdx += l;

    if (tempbuf[0] == '{'.charCodeAt(0) && tempbuf[1] != 0)
        console.log("  * ERROR!(L%hd) Expecting a SPACE or CR between '{' and '%s'.\n", line_number, tempbuf + 1);
    else if (tempbuf[0] == '}'.charCodeAt(0) && tempbuf[1] != 0)
        console.log("  * ERROR!(L%hd) Expecting a SPACE or CR between '}' and '%s'.\n", line_number, tempbuf + 1);
    else if (tempbuf[0] == '/'.charCodeAt(0) && tempbuf[1] == '/' && tempbuf[2] != 0)
        console.log("  * ERROR!(L%hd) Expecting a SPACE between '//' and '%s'.\n", line_number, tempbuf + 2);
    else if (tempbuf[0] == '/'.charCodeAt(0) && tempbuf[1] == '*' && tempbuf[2] != 0)
        console.log("  * ERROR!(L%hd) Expecting a SPACE between '/*' and '%s'.\n", line_number, tempbuf + 2);
    else if (tempbuf[0] == '*'.charCodeAt(0) && tempbuf[1] == '/' && tempbuf[2] != 0)
        console.log("  * ERROR!(L%hd) Expecting a SPACE between '*/' and '%s'.\n", line_number, tempbuf + 2);
    else console.log("  * ERROR!(L%hd) Expecting key word, but found '%s'.\n", line_number, tempbuf);

    error++;
    return -1;
}

function parseCommand(readFromGrp) {
    var i, j, k, tempscrptr;
    var done, temp_ifelse_check;
    var tw;
    var origtptrIdx;
    var temp_line_number;
    var fp;

    //if(error > 12 || textptr) return 1;  // todo

    tw = transword();
    console.log("The value of tw is %i", tw);
    switch (tw) {
        default:
        case -1:
            throw new Error("todo end");
            return 0;
            // End
        case 39:
            // Rem endrem
            scriptptr--;
            j = line_number;
            do {
                textptrIdx++;
                if (textptr[textptrIdx] == 0x0a) line_number++;
                if (textptr[textptrIdx] == 0) {
                    console.log("  * ERROR!(L%d) Found '/*' with no '*/'.\n", j);
                    error++;
                    return 0;
                }
            } while (textptr[textptrIdx] != '*'.charCodeAt(0) || textptr[textptrIdx + 1] != '/'.charCodeAt(0));
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
        case 14:
            throw new Error("todo");
        case 32:
            throw new Error("todo");
        case 54:
            throw new Error("todo");
        case 55:
            // include other con files.
            {
                var includedConFile = "";
                scriptptr--;
                while (!isaltok(textptr[textptrIdx])) {
                    if (textptr[textptrIdx] == 0x0a) line_number++;
                    textptrIdx++;
                    if (textptr[textptrIdx] == 0) break;
                }
                j = 0;
                while (isaltok(textptr[textptrIdx + j])) {
                    tempbuf[j] = textptr[textptrIdx + j];
                    j++;
                }
                tempbuf[j] = 0;

                includedConFile = stringFromArray(tempbuf);

                fp = TCkopen4load(includedConFile, readFromGrp);
                if (fp <= 0) {
                    error++;
                    console.log("  * ERROR!(ln%hd) Could not find '%s'.\n", line_number, label + (labelcnt << 6));
                    console.log("ERROR: could not open (%s)\n", includedConFile);
                    throw new Error();
                }

                j = kfilelength(fp);

                console.log("Including: '%s'.\n", includedConFile);

                temp_line_number = line_number;
                line_number = 1;
                temp_ifelse_check = checking_ifelse;
                checking_ifelse = 0;
                origtptrIdx = textptrIdx;
                textptr = last_used_text.slice(last_used_size);

                textptr[textptrIdx + j] = 0;

                kread(fp, textptr, j);
                kclose(fp);
                ud.conCRC[0] = crc32Update(textptr, j, ud.conCRC[0]);

                do {
                    done = parseCommand(readFromGrp);
                } while (done == 0);

                textptrIdx = origtptrIdx;
                total_lines += line_number;
                line_number = temp_line_number;
                checking_ifelse = temp_ifelse_check;

                return 0;
            }
        case 7:
            throw new Error("todo");
        case 1:
            throw new Error("todo");
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
            throw new Error("todo");
        case 107:
            throw new Error("todo");
        case 108:
            throw new Error("todo");
        case 0:
            throw new Error("todo");
        case 79:
            throw new Error("todo");
        case 57:
            throw new Error("todo");
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
            throw new Error("todo");
    } // end of switch(tw)

    return 0;
}

function passOne(readFromGrp) {
    while (parseCommand(readFromGrp) === 0);

    if ((error + warning) > 12) {
        console.log("  * ERROR! Too many warnings or errors.");
    }
}