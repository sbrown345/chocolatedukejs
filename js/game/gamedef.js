'use strict';
//
// Setup program defines
//
var SETUPFILENAME = "duke3d.cfg";


// Max number of players
var MAXPLAYERS = 16;

// Number of Mouse buttons
var MAXMOUSEBUTTONS = 7;

// Number of JOY buttons
var MAXJOYBUTTONS = 32;

var MAXJOYHATS = 6;

// Number of EXTERNAL buttons

//var MAXEXTERNALBUTTONS 6

//
// modem string defines
//

var MAXMODEMSTRING = 50;

// MACRO defines

var MAXMACROS = 10;
var MAXMACROLENGTH = 34;

// Phone list defines

var PHONENUMBERLENGTH = 28;
var PHONENAMELENGTH = 16;
var MAXPHONEENTRIES = 10;

// length of program functions

var MAXFUNCTIONLENGTH = 30;

// length of axis functions

var MAXAXISFUNCTIONLENGTH = 30;

// Max Player Name length

var MAXPLAYERNAMELENGTH = 11;

// Max RTS Name length

var MAXRTSNAMELENGTH = 15;

// Number of Mouse Axes

var MAXMOUSEAXES = 2;

// Number of JOY axes

var MAXJOYAXES = 6;
//4

// Number of GAMEPAD axes

var MAXGAMEPADAXES = 2;

// MIN/MAX scale value for controller scales

var MAXCONTROLSCALEVALUE = (1 << 19);

// DEFAULT scale value for controller scales

var DEFAULTCONTROLSCALEVALUE = (1 << 16);

// base value for controller scales

var BASECONTROLSCALEVALUE = (1 << 16);

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
//var MAXPLAYERS 16 // dupe of engine const also called MAXPLAYERS????

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
    scriptPtr = scriptIdx + 1 + FIX_00093_Offset;
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

//169
function getincangle(a,na) {
    a &= 2047;
    na &= 2047;

    if(klabs(a-na) < 1024)
        return (na-a);
    else
    {
        if(na > 1024) na -= 2048;
        if(a > 1024) a -= 2048;

        na -= 2048;
        a -= 2048;
        return (na-a);
    }
}

//187
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

function getglobalz(i) {
    var hz,lz,zr;

    var s = sprite[i];

    if( s.statnum == 10 || s.statnum == 6 || s.statnum == 2 || s.statnum == 1 || s.statnum == 4)
    {
        if(s.statnum == 4)
            zr = 4;
        else zr = 127;
        var czRef = new Ref(hittype[i].ceilingz);
        var hzRef = new Ref(hz);
        var fzRef = new Ref(hittype[i].floorz);
        var lzRef = new Ref(lz);
        getzrange(s.x,s.y,s.z-(FOURSLEIGHT),s.sectnum,czRef,hzRef,fzRef,lzRef,zr,CLIPMASK0);
        hittype[i].ceilingz = czRef.$;
        hz = hzRef.$;
        hittype[i].floorz = fzRef.$;
        lz = lzRef.$;

        if( (lz&49152) == 49152 && (sprite[lz&(MAXSPRITES-1)].cstat&48) == 0 )
        {
            lz &= (MAXSPRITES-1);
            if( badguy(sprite[lz]) && sprite[lz].pal != 1)
            {
                if( s.statnum != 4 )
                {
                    hittype[i].dispicnum = -4; // No shadows on actors
                    s.xvel = -256;
                    ssp(i,CLIPMASK0);
                }
            }
            else if(sprite[lz].picnum == APLAYER && badguy(s) )
            {
                hittype[i].dispicnum = -4; // No shadows on actors
                s.xvel = -256;
                ssp(i,CLIPMASK0);
            }
            else if(s.statnum == 4 && sprite[lz].picnum == APLAYER)
                if(s.owner == lz)
            {
                hittype[i].ceilingz = sector[s.sectnum].ceilingz;
                hittype[i].floorz   = sector[s.sectnum].floorz;
            }
        }
    }
    else
    {
        hittype[i].ceilingz = sector[s.sectnum].ceilingz;
        hittype[i].floorz   = sector[s.sectnum].floorz;
    }
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
            //printf("transNumber *scriptptr: %i from labelcode[%i]: %i\n", script[scriptPtr], i, labelcode[i]);
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
    //\n("transNumber:\n", script[scriptPtr]);
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
                //printf("case 17 labelcode[%i] = %i\n", labelcnt, scriptPtr);
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
                //printf("case 19 labelcode[%i] = %i\n", labelcnt, script[scriptPtr - 1]);
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
                    //printf("case 32 labelcode[%i] = %i\n", labelcnt, scriptPtr);
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
                    //printf("case 7 labelcode[%i] = %i\n", labelcnt, scriptPtr);
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
                    //printf("case 7 labelcode[%i] = %i\n", labelcnt, scriptPtr);
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
            //printf("parsing_actor[0] = %i\n", parsing_actor[0]);

            transNumber();
            scriptPtr--;
            actorscrptr[script[scriptPtr]] = parsing_actor[0];

            for (j = 0; j < 4; j++) {
                script[parsing_actor[j]] = 0;
                //printf("*parsing_actor[%i] = %i\n", j, script[parsing_actor[j]]); // ? todo check
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
                    //printf("*parsing_actor[%i] = %i\n", j, script[parsing_actor[j]]);
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
            //printf("parsing_actor[%i] = %i\n", 0, parsing_actor[0]);

            transNumber();
            scriptPtr--;
            j = script[scriptPtr];

            transNumber();
            scriptPtr--;
            actorscrptr[script[scriptPtr]] = parsing_actor[0];
            actortype[script[scriptPtr]] = j;

            for (j = 0; j < 4; j++) {
                script[parsing_actor[j]] = 0;
                //printf("parsing_actor[%i] = %i\n", j, script[parsing_actor[j]]);
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
                    //printf("parsing_actor[%i] = %i\n", j, script[parsing_actor[j]]);

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
                    //printf("ifnosounds j: %i\n", j);
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
            scriptPtr--;
            j = 0;
            while( textptr[textptrIdx] != 0x0a )
            {
                betaname[j] = textptr[textptrIdx];
                j++; textptrIdx++;
            }
            betaname[j] = 0;
            return 0;
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
                    printf(soundName + "\n");
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
                //printf("case 4 parsing_actor = 0\n");
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

//1692
function  dodge(s) {
    var i;
    var bx,by,mx,my,bxvect,byvect,mxvect,myvect,d;

    mx = s.x;
    my = s.y;
    mxvect = sintable[(s.ang+512)&2047]; myvect = sintable[s.ang&2047];

    for(i=headspritestat[4];i>=0;i=nextspritestat[i]) //weapons list
    {
        if( sprite[i].owner == i || sprite[i].sectnum != s.sectnum)
            continue;

        bx = sprite[i].x-mx;
        by = sprite[i].y-my;
        bxvect = sintable[(sprite[i].ang+512)&2047]; byvect = sintable[sprite[i].ang&2047];

        if (mxvect*bx + myvect*by >= 0)
            if (bxvect*bx + byvect*by < 0)
            {
                d = bxvect*by - byvect*bx;
                if (klabs(d) < 65536*64)
                {
                    s.ang -= 512+(TRAND&1024);
                    return 1;
                }
            }
    }
    return 0;
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

//1754
function furthestcanseepoint(i, ts, dax, day) {
    console.assert(dax instanceof Ref);
    console.assert(day instanceof Ref);

    var j, hitsect, hitwall, hitspr, angincs;
    var hx, hy, hz, d, da;//, d, cd, ca,tempx,tempy,cx,cy;
    var s = sprite[i];

    if ((g_t[0] & 63)) return -1;

    if (ud.multimode < 2 && ud.player_skill < 3)
        angincs = (2048 / 2)|0;
    else angincs = (2048 / (1 + (TRAND & 1)))|0;

    var hitsectRef = new Ref();
    var hitwallRef = new Ref();
    var hitsprRef = new Ref();
    var hxRef = new Ref();
    var hyRef = new Ref();
    var hzRef = new Ref();
    for (j = ts.ang; j < (2048 + ts.ang) ; j += (angincs - (TRAND & 511))) {
        hitsectRef.$ = hitsect;
        hitwallRef.$ = hitwall;
        hitsprRef.$ = hitspr;
        hxRef.$ = hx;
        hyRef.$ = hy;
        hzRef.$ = hz;
        hitscan(ts.x, ts.y, ts.z - (16 << 8), ts.sectnum,
            sintable[(j + 512) & 2047],
            sintable[j & 2047], 16384 - (TRAND & 32767),
            hitsectRef, hitwallRef, hitsprRef, hxRef, hyRef, hzRef, CLIPMASK1);

        hitsect = hitsectRef.$;
        hitwall = hitwallRef.$;
        hitspr = hitsprRef.$;
        hx = hxRef.$;
        hy = hyRef.$;
        hz = hzRef.$;

        d = klabs(hx - ts.x) + klabs(hy - ts.y);
        da = klabs(hx - s.x) + klabs(hy - s.y);

        if (d < da)
            if (cansee(hx, hy, hz, hitsect, s.x, s.y, s.z - (16 << 8), s.sectnum)) {
                dax.$ = hx;
                day.$ = hy;
                return hitsect;
            }
    }
    return -1;
}


function alterang(a) {
    var aang, angdif, goalang,j;
    var ticselapsed, moveptr;

    moveptr = g_t[1];

    ticselapsed = (g_t[0])&31;

    aang = g_sp.ang;

    g_sp.xvel += ((script[moveptr]-g_sp.xvel)/5)|0;
    if(g_sp.zvel < 648) g_sp.zvel += ((((script[moveptr+1])<<4)-g_sp.zvel)/5)|0;

    if(a&seekplayer)
    {
        j = ps[g_p].holoduke_on;

        if(j >= 0 && cansee(sprite[j].x,sprite[j].y,sprite[j].z,sprite[j].sectnum,g_sp.x,g_sp.y,g_sp.z,g_sp.sectnum) )
            g_sp.owner = j;
        else g_sp.owner = ps[g_p].i;

        if(sprite[g_sp.owner].picnum == APLAYER)
            goalang = getangle(hittype[g_i].lastvx-g_sp.x,hittype[g_i].lastvy-g_sp.y);
        else
            goalang = getangle(sprite[g_sp.owner].x-g_sp.x,sprite[g_sp.owner].y-g_sp.y);

        if(g_sp.xvel && g_sp.picnum != DRONE)
        {
            angdif = getincangle(aang,goalang);

            if(ticselapsed < 2)
            {
                if( klabs(angdif) < 256)
                {
                    j = 128-(TRAND&256);
                    g_sp.ang += j;
                    if( hits(g_i) < 844 )
                        g_sp.ang -= j;
                }
            }
            else if(ticselapsed > 18 && ticselapsed < 26) // choose
            {
                if(klabs(angdif>>2) < 128) g_sp.ang = goalang;
                else g_sp.ang += angdif>>2;
            }
        }
        else g_sp.ang = goalang;
    }

    if(ticselapsed < 1)
    {
        j = 2;
        if(a&furthestdir)
        {
            goalang = furthestangle(g_i,j);
            g_sp.ang = goalang;
            g_sp.owner = ps[g_p].i;
        }

        if(a&fleeenemy)
        {
            goalang = furthestangle(g_i,j);
            g_sp.ang = goalang; // += angdif; //  = getincangle(aang,goalang)>>1;
        }
    }
}

//1858
function move() {
    var l, moveptr;
    var a, goalang, angdif;
    var daxvel;

    a = g_sp.hitag;

    if(a == -1) a = 0;

    g_t[0]++;

    if(a&face_player)
    {
        if(ps[g_p].newowner >= 0)
            goalang = getangle(ps[g_p].oposx-g_sp.x,ps[g_p].oposy-g_sp.y);
        else goalang = getangle(ps[g_p].posx-g_sp.x,ps[g_p].posy-g_sp.y);
        angdif = getincangle(g_sp.ang,goalang)>>2;
        if(angdif > -8 && angdif < 0) angdif = 0;
        g_sp.ang += angdif;
    }

    if(a&spin)
        g_sp.ang += sintable[ ((g_t[0]<<3)&2047) ]>>6;

    if(a&face_player_slow)
    {
        if(ps[g_p].newowner >= 0)
            goalang = getangle(ps[g_p].oposx-g_sp.x,ps[g_p].oposy-g_sp.y);
        else goalang = getangle(ps[g_p].posx-g_sp.x,ps[g_p].posy-g_sp.y);
        angdif = ksgn(getincangle(g_sp.ang,goalang))<<5;
        if(angdif > -32 && angdif < 0)
        {
            angdif = 0;
            g_sp.ang = goalang;
        }
        g_sp.ang += angdif;
    }


    if((a&jumptoplayer) == jumptoplayer)
    {
        if(g_t[0] < 16)
            g_sp.zvel -= (sintable[(512+(g_t[0]<<4))&2047]>>5);
    }

    if(a&face_player_smart)
    {
        var newx,newy;

        newx = ps[g_p].posx+((ps[g_p].posxv/768)|0);
        newy = ps[g_p].posy+((ps[g_p].posyv/768)|0);
        goalang = getangle(newx-g_sp.x,newy-g_sp.y);
        angdif = getincangle(g_sp.ang,goalang)>>2;
        if(angdif > -8 && angdif < 0) angdif = 0;
        g_sp.ang += angdif;
    }

    if( g_t[1] == 0 || a == 0 )
    {
        if( ( badguy(g_sp) && g_sp.extra <= 0 ) || (hittype[g_i].bposx != g_sp.x) || (hittype[g_i].bposy != g_sp.y) )
        {
            hittype[g_i].bposx = g_sp.x;
            hittype[g_i].bposy = g_sp.y;
            setsprite(g_i,g_sp.x,g_sp.y,g_sp.z);
        }
        return;
    }

    moveptr = g_t[1];

    if(a&geth) g_sp.xvel += (script[moveptr]-g_sp.xvel)>>1;
    if(a&getv) g_sp.zvel += (((script[moveptr+1])<<4)-g_sp.zvel)>>1;

    if(a&dodgebullet)
        dodge(g_sp);

    if(g_sp.picnum != APLAYER)
        alterang(a);

    if(g_sp.xvel > -6 && g_sp.xvel < 6 ) g_sp.xvel = 0;

    a = badguy(g_sp);

    if(g_sp.xvel || g_sp.zvel)
    {
        if(a && g_sp.picnum != ROTATEGUN)
        {
            if( (g_sp.picnum == DRONE || g_sp.picnum == COMMANDER) && g_sp.extra > 0)
            {
                if(g_sp.picnum == COMMANDER)
                {
                    hittype[g_i].floorz = l = getflorzofslope(g_sp.sectnum,g_sp.x,g_sp.y);
                    if( g_sp.z > (l-(8<<8)) )
                    {
                        if( g_sp.z > (l-(8<<8)) ) g_sp.z = l-(8<<8);
                        g_sp.zvel = 0;
                    }

                    hittype[g_i].ceilingz = l = getceilzofslope(g_sp.sectnum,g_sp.x,g_sp.y);
                    if( (g_sp.z-l) < (80<<8) )
                    {
                        g_sp.z = l+(80<<8);
                        g_sp.zvel = 0;
                    }
                }
                else
                {
                    if( g_sp.zvel > 0 )
                    {
                        hittype[g_i].floorz = l = getflorzofslope(g_sp.sectnum,g_sp.x,g_sp.y);
                        if( g_sp.z > (l-(30<<8)) )
                            g_sp.z = l-(30<<8);
                    }
                    else
                    {
                        hittype[g_i].ceilingz = l = getceilzofslope(g_sp.sectnum,g_sp.x,g_sp.y);
                        if( (g_sp.z-l) < (50<<8) )
                        {
                            g_sp.z = l+(50<<8);
                            g_sp.zvel = 0;
                        }
                    }
                }
            }
            else if(g_sp.picnum != ORGANTIC)
            {
                if(g_sp.zvel > 0 && hittype[g_i].floorz < g_sp.z)
                    g_sp.z = hittype[g_i].floorz;
                if( g_sp.zvel < 0)
                {
                    l = getceilzofslope(g_sp.sectnum,g_sp.x,g_sp.y);
                    if( (g_sp.z-l) < (66<<8) )
                    {
                        g_sp.z = l+(66<<8);
                        g_sp.zvel >>= 1;
                    }
                }
            }
        }
        else if(g_sp.picnum == APLAYER)
            if( (g_sp.z-hittype[g_i].ceilingz) < (32<<8) )
                g_sp.z = hittype[g_i].ceilingz+(32<<8);

        daxvel = g_sp.xvel;
        angdif = g_sp.ang;

        if( a && g_sp.picnum != ROTATEGUN )
        {
            if( g_x < 960 && g_sp.xrepeat > 16 )
            {

                daxvel = -(1024-g_x);
                angdif = getangle(ps[g_p].posx-g_sp.x,ps[g_p].posy-g_sp.y);

                if(g_x < 512)
                {
                    ps[g_p].posxv = 0;
                    ps[g_p].posyv = 0;
                }
                else
                {
                    ps[g_p].posxv = mulscale(ps[g_p].posxv,dukefriction-0x2000,16);
                    ps[g_p].posyv = mulscale(ps[g_p].posyv,dukefriction-0x2000,16);
                }
            }
            else if(g_sp.picnum != DRONE && g_sp.picnum != SHARK && g_sp.picnum != COMMANDER)
            {
                if( hittype[g_i].bposz != g_sp.z || ( ud.multimode < 2 && ud.player_skill < 2 ) )
                {
                    if( (g_t[0]&1) || ps[g_p].actorsqu == g_i ) return;
                    else daxvel <<= 1;
                }
                else
                {
                    if( (g_t[0]&3) || ps[g_p].actorsqu == g_i ) return;
                    else daxvel <<= 2;
                }
            }
        }

        hittype[g_i].movflag = movesprite(g_i,
            (daxvel*(sintable[(angdif+512)&2047]))>>14,
            (daxvel*(sintable[angdif&2047]))>>14,g_sp.zvel,CLIPMASK0);
    }

    if( a )
    {
        if (sector[g_sp.sectnum].ceilingstat&1)
            g_sp.shade += (sector[g_sp.sectnum].ceilingshade-g_sp.shade)>>1;
        else g_sp.shade += (sector[g_sp.sectnum].floorshade-g_sp.shade)>>1;

        if( sector[g_sp.sectnum].floorpicnum == MIRROR )
            deletesprite(g_i);
    }
}


//2057
function parseifelse(condition)
{
    if( condition )
    {
        insptr+=2;
        parse();
    }
    else {
        insptr = script[insptr+1];//(int32_t *) *(insptr+1);
        printf("*insptr: %i\n", script[insptr]);
        if(script[insptr] == 10)
        {
            insptr+=2;
            parse();
        }
    }
}

//2077
function parse() {
    var j, l, s;

    if(killit_flag) return 1;

//    if(*it == 1668249134L) gameexit("\nERR");
    printf("parse %i\n", script[insptr]);
    switch(script[insptr])
    {
        case 3:
            insptr++;
            parseifelse( rnd(script[insptr]));
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
            var s;

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

                if( j == 0 ) {
                    var lastvxRef = new Ref(hittype[g_i].lastvx);
                    var lastvyRef = new Ref(hittype[g_i].lastvy);
                    j = furthestcanseepoint(g_i, s, lastvxRef, lastvyRef);
                    hittype[g_i].lastvx = lastvxRef.$;
                    hittype[g_i].lastvy = lastvyRef.$;

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
            insptr++;
            g_t[5] = script[insptr];
            g_t[4] = script[g_t[5]]; //*(int32_t *)(g_t[5]);       // Action
            g_t[1] = script[g_t[5]+1];// *(int32_t *)(g_t[5]+4);       // move
            g_sp.hitag =  script[g_t[5]+2];//*(int32_t *)(g_t[5]+8);    // Ai
            g_t[0] = g_t[2] = g_t[3] = 0;
            if(g_sp.hitag&random_angle)
                g_sp.ang = TRAND&2047;
            insptr++;
            break;
        case 7:
            insptr++;
            g_t[2] = 0;
            g_t[3] = 0;
            printf("todo FIX_00093 in gamedef.c\n");
            // FIX_00093: fixed crashbugs in multiplayer (mine/blimp)
			// This is the blimp bug.
			// *.con code 1.3 and 1.4 are buggy when you try to blow up the 
			// blimp in multiplayer. duke3d_w32 /q2 /m /v3 /l9
			// This is because the con code gives a timeout value of 2048 
			// as a action address instead of giving a real action address.
			// We simply counter this specific con code bug by resetting 
			// the action address to 0 when we get an address "2048":
			g_t[4] = ((script[insptr])==2048)?0:(script[insptr]);
            insptr++;
            break;

        case 8:
            insptr++;
            parseifelse(g_x < script[insptr]);
            if(g_x > MAXSLEEPDIST && hittype[g_i].timetosleep == 0)
                hittype[g_i].timetosleep = SLEEPTIME;
            break;
        case 9:
            insptr++;
            parseifelse(g_x > script[insptr]);
            if(g_x > MAXSLEEPDIST && hittype[g_i].timetosleep == 0)
                hittype[g_i].timetosleep = SLEEPTIME;
            break;
        case 10:
            insptr = script[insptr+1];
            break;
        case 100:
            insptr++;
            g_sp.extra += script[insptr];
            insptr++;
            break;
        case 11:
            insptr++;
            g_sp.extra = script[insptr];
            insptr++;
            break;
        case 94:
            insptr++;

            if(ud.coop >= 1 && ud.multimode > 1)
            {
                if(script[insptr] == 0)
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
            insptr++;
            if(g_sp.picnum == APLAYER)
                g_sp.pal = ps[g_sp.yvel].palookup;
            else g_sp.pal = hittype[g_i].tempang;
            hittype[g_i].tempang = 0;
            break;
        case 104:
            insptr++;
            checkweapons(ps[g_sp.yvel]);
            break;
        case 106:
            insptr++;
            break;
        case 97:
            insptr++;
            if(Sound[g_sp.yvel].num == 0)
                spritesound(g_sp.yvel,g_i);
            break;
        case 96:
            insptr++;

            if( ud.multimode > 1 && g_sp.picnum == APLAYER )
            {
                if(ps[otherp].quick_kick == 0)
                    ps[otherp].quick_kick = 14;
            }
            else if(g_sp.picnum != APLAYER && ps[g_p].quick_kick == 0)
                ps[g_p].quick_kick = 14;
            break;
        case 28:
            insptr++;

            j = ((script[insptr])-g_sp.xrepeat)<<1;
            g_sp.xrepeat += ksgn(j);

            insptr++;

            if( ( g_sp.picnum == APLAYER && g_sp.yrepeat < 36 ) ||
               script[insptr] < g_sp.yrepeat ||
               ((g_sp.yrepeat*(tiles[g_sp.picnum].dim.height+8))<<2) < (hittype[g_i].floorz - hittype[g_i].ceilingz) )
            {
                j = ((script[insptr])-g_sp.yrepeat)<<1;
                if( klabs(j) ) g_sp.yrepeat += ksgn(j);
            }

            insptr++;

            break;
        case 99:
            insptr++;
            g_sp.xrepeat = toUint8( script[insptr]);
            insptr++;
            g_sp.yrepeat = toUint8( script[insptr]);
            insptr++;
            break;
        case 13:
            insptr++;
            shoot(g_i,script[insptr]);
            insptr++;
            break;
        case 87:
            insptr++;
            if( Sound[script[insptr]].num == 0 )
                spritesound( script[insptr],g_i);
            insptr++;
            break;
        case 89:
            insptr++;
            if( Sound[script[insptr]].num > 0 )
                stopsound(script[insptr]);
            insptr++;
            break;
        case 92:
            insptr++;
            if(g_p == screenpeek || ud.coop==1)
                spritesound( script[insptr],ps[screenpeek].i);
            insptr++;
            break;
        case 15:
            insptr++;
            spritesound( script[insptr],g_i);
            insptr++;
            break;
        case 84:
            insptr++;
            ps[g_p].tipincs = 26;
            break;
        case 16:
            insptr++;
            g_sp.xoffset = 0;
            g_sp.yoffset = 0;
//            if(!gotz)
            {
                var c;

                if( floorspace(g_sp.sectnum) )
                    c = 0;
                else
                {
                    if( ceilingspace(g_sp.sectnum) || sector[g_sp.sectnum].lotag == 2)
                        c = gc/6;
                    else c = gc;
                }

                if( hittype[g_i].cgg <= 0 || (sector[g_sp.sectnum].floorstat&2) )
                {
                    getglobalz(g_i);
                    hittype[g_i].cgg = 6;
                }
                else hittype[g_i].cgg --;

                if( g_sp.z < (hittype[g_i].floorz-FOURSLEIGHT) )
                {
                    g_sp.zvel += c;
                    g_sp.z+=g_sp.zvel;

                    if(g_sp.zvel > 6144) g_sp.zvel = 6144;
                }
                else
                {
                    g_sp.z = hittype[g_i].floorz - FOURSLEIGHT;

                    if( badguy(g_sp) || ( g_sp.picnum == APLAYER && g_sp.owner >= 0) )
                    {

                        if( g_sp.zvel > 3084 && g_sp.extra <= 1)
                        {
                            for (var i = 0; i < 1; i++) {
                                if(g_sp.pal != 1 && g_sp.picnum != DRONE)
                                {
                                    if(g_sp.picnum == APLAYER && g_sp.extra > 0)
                                        break;//goto SKIPJIBS;
                                    guts(g_sp,JIBS6,15,g_p);
                                    spritesound(SQUISHED,g_i);
                                    spawn(g_i,BLOODPOOL);
                                }
                            }

                            //SKIPJIBS:

                            hittype[g_i].picnum = SHOTSPARK1;
                            hittype[g_i].extra = 1;
                            g_sp.zvel = 0;
                        }
                        else if(g_sp.zvel > 2048 && sector[g_sp.sectnum].lotag != 1)
                        {
                            j = g_sp.sectnum;
                            var xRef = new Ref(g_sp.x);
                            var yRef = new Ref(g_sp.y);
                            var zRef = new Ref(g_sp.z);
                            var jRef = new Ref(j);
                            pushmove(xRef,yRef,zRef,jRef,128,(4<<8),(4<<8),CLIPMASK0);
                            g_sp.x = xRef.$;
                            g_sp.y = yRef.$;
                            g_sp.z = zRef.$;
                            j = jRef.$;
                            
                            if(j != g_sp.sectnum && j >= 0 && j < MAXSECTORS)
                                changespritesect(g_i,j);

                            spritesound(THUD,g_i);
                        }
                    }
                    if(sector[g_sp.sectnum].lotag == 1)
                        switch (g_sp.picnum)
                        {
                            case OCTABRAIN:
                            case COMMANDER:
                            case DRONE:
                                break;
                            default:
                                g_sp.z += (24<<8);
                                break;
                        }
                    else g_sp.zvel = 0;
                }
            }

            break;
        case 4:
        case 12:
        case 18:
            return 1;
        case 30:
            insptr++;
            return 1;
        case 2:
            insptr++;
            if( ps[g_p].ammo_amount[script[insptr]] >= max_ammo_amount[script[insptr]] )
            {
                killit_flag = 2;
                break;
            }
            addammo(script[insptr], ps[g_p], script[insptr+1]);
            if(ps[g_p].curr_weapon == KNEE_WEAPON)
                if( ps[g_p].gotweapon[script[insptr]] )
                    addweapon( ps[g_p], script[insptr] );
            insptr += 2;
            break;
        case 86:
            insptr++;
            lotsofmoney(g_sp,script[insptr]);
            insptr++;
            break;
        case 102:
            insptr++;
            lotsofmail(g_sp,script[insptr]);
            insptr++;
            break;
        case 105:
            insptr++;
            hittype[g_i].timetosleep = script[insptr];
            insptr++;
            break;
        case 103:
            insptr++;
            lotsofpaper(g_sp,script[insptr]);
            insptr++;
            break;
        case 88:
            insptr++;
            ps[g_p].actors_killed += script[insptr];
            hittype[g_i].actorstayput = -1;
            insptr++;
            break;
        case 93:
            insptr++;
            spriteglass(g_i,script[insptr]);
            insptr++;
            break;
        case 22:
            insptr++;
            killit_flag = 1;
            break;
        case 23:
            insptr++;
            if( ps[g_p].gotweapon[script[insptr]] == 0 ) addweapon( ps[g_p], script[insptr] );
            else if( ps[g_p].ammo_amount[script[insptr]] >= max_ammo_amount[script[insptr]] )
            {
                 killit_flag = 2;
                 break;
            }
            addammo( script[insptr], ps[g_p], script[insptr+1] );
            if(ps[g_p].curr_weapon == KNEE_WEAPON)
                if( ps[g_p].gotweapon[script[insptr]] )
                    addweapon( ps[g_p], script[insptr] );
            insptr+=2;
            break;
        case 68:
            insptr++;
            printf("%d\n",script[insptr]);
            insptr++;
            break;
        case 69:
            insptr++;
            ps[g_p].timebeforeexit = script[insptr];
            ps[g_p].customexitsound = -1;
            ud.eog = 1;
            insptr++;
            break;
        case 25:
            insptr++;

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
                if( j > max_player_health && script[insptr] > 0 )
                {
                    insptr++;
                    break;
                }
                else
                {
                    if(j > 0)
                        j += script[insptr];
                    if ( j > max_player_health && script[insptr] > 0 )
                        j = max_player_health;
                }
            }
            else
            {
                if( j > 0 )
                    j += script[insptr];
                if ( j > (max_player_health<<1) )
                    j = (max_player_health<<1);
            }

            if(j < 0) j = 0;

            if(ud.god == 0)
            {
                if(script[insptr] > 0)
                {
                    if( ( j - script[insptr] ) < (max_player_health>>2) &&
                        j >= (max_player_health>>2) )
                            spritesound(DUKE_GOTHEALTHATLOW,ps[g_p].i);

                    ps[g_p].last_extra = j;
                }

                sprite[ps[g_p].i].extra = j;
            }

            insptr++;
            break;
        case 17:
            {
                var tempscrptr;

                tempscrptr = insptr+2;

                insptr = script[insptr + 1];    // script[insptr+1];//(int32_t *) *(insptr+1);
                while(1) if(parse()) break;
                insptr = tempscrptr;
            }
            break;
        case 29:
            insptr++;
            while(1) if(parse()) break;
            break;
        case 32:
            g_t[0]=0;
            insptr++;
            g_t[1] = script[insptr];
            insptr++;
            g_sp.hitag = script[insptr];
            insptr++;
            if(g_sp.hitag&random_angle)
                g_sp.ang = TRAND&2047;
            break;
        case 31:
            insptr++;
            if(g_sp.sectnum >= 0 && g_sp.sectnum < MAXSECTORS)
                spawn(g_i,script[insptr]);
            insptr++;
            break;
        case 33:
            insptr++;
            parseifelse( hittype[g_i].picnum == script[insptr]);
            break;
        case 21:
            insptr++;
            parseifelse(g_t[5] == script[insptr]);
            break;
        case 34:
            insptr++;
            parseifelse(g_t[4] == script[insptr]);
            break;
        case 35:
            insptr++;
            parseifelse(g_t[2] >= script[insptr]);
            break;
        case 36:
            insptr++;
            g_t[2] = 0;
            break;
        case 37:
            {
                var dnum;

                insptr++;
                dnum = script[insptr];
                insptr++;

                if(g_sp.sectnum >= 0 && g_sp.sectnum < MAXSECTORS)
                    for(j=(script[insptr])-1;j>=0;j--)
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
                insptr++;
            }
            break;
        case 52:
            insptr++;
            g_t[0] =  script[insptr];
            insptr++;
            break;
        case 101:
            insptr++;
            g_sp.cstat |= script[insptr];
            insptr++;
            break;
        case 110:
            insptr++;
            g_sp.clipdist =  script[insptr];
            insptr++;
            break;
        case 40:
            insptr++;
            g_sp.cstat =  script[insptr];
            insptr++;
            break;
        case 41:
            insptr++;
            parseifelse(g_t[1] == script[insptr]);
            break;
        case 42:
            insptr++;

            if(ud.multimode < 2)
            {
                if( lastsavedpos >= 0 && ud.recstat != 2 )
                {
                    ps[g_p].gm = MODE_MENU;
                    KB.clearKeyDown(sc_Space);
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
            insptr++;
            parseifelse(g_t[0] >= script[insptr]);
            break;
        case 53:
            insptr++;
            parseifelse(g_sp.picnum == script[insptr]);
            break;
        case 47:
            insptr++;
            g_t[0] = 0;
            break;
        case 48:
            insptr+=2;
            switch(script[insptr-1])
            {
                case 0:
                    ps[g_p].steroids_amount = script[insptr];
                    ps[g_p].inven_icon = 2;
                    break;
                case 1:
                    ps[g_p].shield_amount +=          script[insptr];// 100;
                    if(ps[g_p].shield_amount > max_player_health)
                        ps[g_p].shield_amount = max_player_health;
                    break;
                case 2:
                    ps[g_p].scuba_amount =             script[insptr];// 1600;
                    ps[g_p].inven_icon = 6;
                    break;
                case 3:
                    ps[g_p].holoduke_amount =          script[insptr];// 1600;
                    ps[g_p].inven_icon = 3;
                    break;
                case 4:
                    ps[g_p].jetpack_amount =           script[insptr];// 1600;
                    ps[g_p].inven_icon = 4;
                    break;
                case 6:
                    switch(g_sp.pal)
                    {
                        case  0: ps[g_p].got_access |= 1;break;
                        case 21: ps[g_p].got_access |= 2;break;
                        case 23: ps[g_p].got_access |= 4;break;
                    }
                    break;
                case 7:
                    ps[g_p].heat_amount = script[insptr];
                    ps[g_p].inven_icon = 5;
                    break;
                case 9:
                    ps[g_p].inven_icon = 1;
                    ps[g_p].firstaid_amount = script[insptr];
                    break;
                case 10:
                    ps[g_p].inven_icon = 7;
                    ps[g_p].boot_amount = script[insptr];
                    break;
            }
            insptr++;
            break;
        case 50:
            hitradius(g_i, script[insptr + 1], script[insptr + 2], script[insptr + 3], script[insptr + 4], script[insptr + 5]);
            insptr+=6;
            break;
        case 51:
            {
                insptr++;

                l = script[insptr];
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
            insptr++;
            parseifelse(g_sp.extra <= script[insptr]);
            break;
        case 58:
            insptr += 2;
            guts(g_sp,script[insptr-1],script[insptr],g_p);
            insptr++;
            break;
        case 59:
            insptr++;
//            if(g_sp.owner >= 0 && sprite[g_sp.owner].picnum == script[insptr])
  //              parseifelse(1);
//            else
            parseifelse( hittype[g_i].picnum == script[insptr]);
            break;
        case 61:
            insptr++;
            forceplayerangle(ps[g_p]);
            return 0;
        case 62:
            insptr++;
            parseifelse( (( hittype[g_i].floorz - hittype[g_i].ceilingz ) >> 8 ) < script[insptr]);
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
            insptr++;
            if (sector[g_sp.sectnum].lotag == 0) {
                var neartagsectorRef = new Ref(neartagsector),
                    neartagwallRef = new Ref(neartagwall),
                    neartagspriteRef = new Ref(neartagsprite),
                    neartaghitdistRef = new Ref(neartaghitdist);
                neartag(g_sp.x, g_sp.y, g_sp.z - (32 << 8), g_sp.sectnum, g_sp.ang, neartagsectorRef, neartagwallRef, neartagspriteRef, neartaghitdistRef, 768, 1);
                neartagsector.$ = neartagsectorRef;
                neartagwall.$ = neartagwallRef;
                neartagsprite.$ = neartagspriteRef;
                neartaghitdist.$ = neartaghitdistRef;

                if (neartagsector >= 0 && isanearoperator(sector[neartagsector].lotag))
                    if ((sector[neartagsector].lotag & 0xff) == 23 || sector[neartagsector].floorz == sector[neartagsector].ceilingz)
                        if ((sector[neartagsector].lotag & 16384) == 0)
                            if ((sector[neartagsector].lotag & 32768) == 0) {
                                j = headspritesect[neartagsector];
                                while (j >= 0) {
                                    if (sprite[j].picnum == ACTIVATOR)
                                        break;
                                    j = nextspritesect[j];
                                }
                                if (j == -1)
                                    operatesectors(neartagsector, g_i);
                            }
            }
            break;
        case 67:
            parseifelse(ceilingspace(g_sp.sectnum));
            break;

        case 74:
            insptr++;
            if(g_sp.picnum != APLAYER)
                hittype[g_i].tempang = g_sp.pal;
            g_sp.pal = script[insptr];
            insptr++;
            break;

        case 77:
            insptr++;
            g_sp.picnum = script[insptr];
            insptr++;
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
            insptr++;
//            getglobalz(g_i);
            parseifelse( (hittype[g_i].floorz - g_sp.z) <= ((script[insptr])<<8));
            break;
        case 73:
            insptr++;
//            getglobalz(g_i);
            parseifelse( ( g_sp.z - hittype[g_i].ceilingz ) <= ((script[insptr])<<8));
            break;
        case 14:

            insptr++;
            ps[g_p].pals_time = script[insptr];
            insptr++;
            for(j=0;j<3;j++)
            {
                ps[g_p].pals[j] = script[insptr];
                insptr++;
            }
            break;

/*        case 74:
            insptr++;
            getglobalz(g_i);
            parseifelse( (( hittype[g_i].floorz - hittype[g_i].ceilingz ) >> 8 ) >= script[insptr]);
            break;
*/
        case 78:
            insptr++;
            parseifelse( sprite[ps[g_p].i].extra < script[insptr]);
            break;

        case 75:
            {
                insptr++;
                j = 0;
                switch(script[insptr++])
                {
                    case 0:if( ps[g_p].steroids_amount != script[insptr])
                           j = 1;
                        break;
                    case 1:if(ps[g_p].shield_amount != max_player_health )
                            j = 1;
                        break;
                    case 2:if(ps[g_p].scuba_amount != script[insptr]) j = 1;break;
                    case 3:if(ps[g_p].holoduke_amount != script[insptr]) j = 1;break;
                    case 4:if(ps[g_p].jetpack_amount != script[insptr]) j = 1;break;
                    case 6:
                        switch(g_sp.pal)
                        {
                            case  0: if(ps[g_p].got_access&1) j = 1;break;
                            case 21: if(ps[g_p].got_access&2) j = 1;break;
                            case 23: if(ps[g_p].got_access&4) j = 1;break;
                        }
                        break;
                    case 7:if(ps[g_p].heat_amount != script[insptr]) j = 1;break;
                    case 9:
                        if(ps[g_p].firstaid_amount != script[insptr]) j = 1;break;
                    case 10:
                        if(ps[g_p].boot_amount != script[insptr]) j = 1;break;
                }

                parseifelse(j);
                break;
            }
        case 38:
            insptr++;
            if( ps[g_p].knee_incs == 0 && sprite[ps[g_p].i].xrepeat >= 40 )
                if( cansee(g_sp.x,g_sp.y,g_sp.z-(4<<8),g_sp.sectnum,ps[g_p].posx,ps[g_p].posy,ps[g_p].posz+(16<<8),sprite[ps[g_p].i].sectnum) )
            {
                ps[g_p].knee_incs = 1;
                if(ps[g_p].weapon_pos == 0)
                    ps[g_p].weapon_pos = -1;
                ps[g_p].actorsqu = g_i;
            }
            break;
        case 90:
                {
                    var s1 = new Ref(g_sp.sectnum);

                    j = 0;
                        updatesector(g_sp.x+108,g_sp.y+108,s1);
                        if (s1.$ == g_sp.sectnum)
                        {
                            updatesector(g_sp.x-108,g_sp.y-108,s1);
                            if (s1.$ == g_sp.sectnum)
                            {
                                updatesector(g_sp.x+108,g_sp.y-108,s1);
                                if (s1.$ == g_sp.sectnum)
                                {
                                    updatesector(g_sp.x-108,g_sp.y+108,s1);
                                    if( s1.$ == g_sp.sectnum )
                                        j = 1;
                                }
                            }
                        }
                    parseifelse( j );
            }

            break;
        case 80:
            insptr++;
            FTA(script[insptr],ps[g_p],0);
            insptr++;
            break;
        case 81:
            parseifelse( floorspace(g_sp.sectnum));
            break;
        case 82:
            parseifelse( (hittype[g_i].movflag&49152) > 16384 );
            break;
        case 83:
            insptr++;
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
            insptr++;
            parseifelse( g_sp.pal == script[insptr]);
            break;

        case 111:
            insptr++;
            j = klabs(getincangle(ps[g_p].ang,g_sp.ang));
            parseifelse( j <= script[insptr]);
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
        //printf("script[g_t[4]+4]: %i\n", script[g_t[4] + 4]);
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