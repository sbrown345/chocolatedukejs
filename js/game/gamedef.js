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
        
        last_used_text = textptr = /*(char  *) */mptr; // TODO ??????????
        last_used_size = fs;

        textptr = kread(fp, fs);
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

function isaltok(c) {
    var ch = String.fromCharCode(c);
    return (isalnum(c) || ch == '{' || ch == '}' || ch == '/' || ch == '*' || ch == '-' || ch == '_' || ch == '.');
}

function isalnum(c) {
    return (c >= 48 && c <= 57)
        || (c >= 65 && c <= 90)
        || (c >= 97 && c <= 122);
}

// Returns its code #
function transword() {
    var i, l;
    
    while (!isaltok(textptr[textptrIdx])) {
        if(textptr[textptrIdx] == 0x0a) line_number++;
        if (textptr[textptrIdx] == 0)
            return -1;
        textptrIdx++;
    }

    l = 0;
    while (isaltok(textptr[textptrIdx+l])) {
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
    var origtptr;
    var temp_line_number;
    var fp;

    //if(error > 12 || textptr) return 1;  // todo

    tw = transword();
    switch (tw) {
        default:
        case -1:
            throw  new Error("todo end")
            return 0; // End
        case 39: // Rem endrem
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
            
        case 55: // include other con files.
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
                origtptr = textptr;
                textptr[textptrIdx] = last_used_text + last_used_size;

                textptr[textptrIdx + j] = 0;

                textptr = kread(fp, j);
                kclose(fp);
                //ud.conCRC[0] = crc32(textptr);
                ud.conCRC[0] = crc32Update(textptr, j, ud.conCRC[0]);

                do {
                    done = parseCommand(readFromGrp);
                } while (done == 0);
                
                textptr = origtptr;
                total_lines += line_number;
                line_number = temp_line_number;
                checking_ifelse = temp_ifelse_check;

                return 0;
            }
    }
}

function passOne(readFromGrp) {
    while (parseCommand(readFromGrp) === 0);
    
    if ((error + warning) > 12) {
        console.log("  * ERROR! Too many warnings or errors.");
    }
}