'use strict';

var Game = {};

var appendImageDebug = false;
function appendCanvasImageToPage(text) {
    // could log into console (https://github.com/escusado/console.meme)
    if (!appendImageDebug) return;

    updateCanvas();
    if (text) {
        var span = document.createElement("span");
        span.innerHTML = text;
        document.getElementById("canvasDebug").appendChild(span);
    }
    var img = document.createElement("img");
    img.src = surface.toDataURL("image/png");
    document.getElementById("canvasDebug").appendChild(img);
}

var MINITEXT_BLUE = 0;
var MINITEXT_RED = 2;
var MINITEXT_YELLOW = 23;
var MINITEXT_GRAY = 17;

var COLOR_ON = MINITEXT_YELLOW;
var COLOR_OFF = MINITEXT_BLUE;

var IDFSIZE = 479985668;
// var IDFSIZE 9961476
// var IDFSIZE 16384
var IDFILENAME = "DUKE3D.IDF";

var TIMERUPDATESIZ = 32;

var cameradist = 0, cameraclock = 0;
var eightytwofifty = 0;
var playerswhenstarted;
var qe, cp;

var nHostForceDisableAutoaim = 0;

// Game play speed
var g_iTickRate = 120;
var g_iTicksPerFrame = 26;
var TICRATE = g_iTickRate;
var TICSPERFRAME = (TICRATE / g_iTicksPerFrame) | 0;

var CommandSoundToggleOff = 0;
var CommandMusicToggleOff = 0;

var confilename = "GAME.CON";
var boardfilename = null;
var waterpal = new Uint8Array(768), slimepal = new Uint8Array(768), titlepal = new Uint8Array(768), drealms = new Uint8Array(768), endingpal = new Uint8Array(768);
var firstdemofile;

function patchstatusbar(x1, y1, x2, y2) {
    rotateSprite(0, (200 - 34) << 16, 65536, 0, BOTTOMSTATUSBAR, 4, 0, 10 + 16 + 64 + 128,
        scale(x1, xdim, 320), scale(y1, ydim, 200),
        scale(x2, xdim, 320) - 1, scale(y2, ydim, 200) - 1);
}

var recfilep, totalreccnt;
var debug_on = 0, actor_tog = 0, memorycheckoveride = 0;
//uint8_t *rtsptr;

//extern uint8_t  syncstate;
//extern int32 numlumps; (in rts.js)

var frecfilep;

var restorepalette, screencapt, nomorelogohack = 0;
var sendmessagecommand = -1;


//152
function gametext(x, y, t, s, dabits) {
    var ac, newx;
    var oldt;
    var centre;

    centre = (x == (320 >> 1));
    newx = 0;
    var tIdx = 0;
    //printf("gametext %s\n", t);
    if (centre) {
        while (t.charCodeAt(tIdx)) {
            if (t.charCodeAt(tIdx) == 32) {
                newx += 5;
                tIdx++;
                continue;
            } else ac = t.charCodeAt(tIdx) - '!'.charCodeAt(0) + STARTALPHANUM;

            if (ac < STARTALPHANUM || ac > ENDALPHANUM) break;

            if (t.charCodeAt(tIdx) >= '0'.charCodeAt(0) && t.charCodeAt(tIdx) <= '9'.charCodeAt(0))
                newx += 8;
            else newx += tiles[ac].dim.width;
            tIdx++;
        }

        tIdx = 0;
        x = (320 >> 1) - (newx >> 1);
    }

    while (t.charCodeAt(tIdx)) {
        if (t.charCodeAt(tIdx) == 32) {
            x += 5;
            tIdx++;
            continue;
        } else ac = t.charCodeAt(tIdx) - '!'.charCodeAt(0) + STARTALPHANUM;

        if (ac < STARTALPHANUM || ac > ENDALPHANUM)
            break;

        //printf("%c\n", t.charCodeAt(tIdx));
        rotateSprite(x << 16, y << 16, 65536, 0, ac, s, 0, dabits, 0, 0, xdim - 1, ydim - 1);

        if (t.charCodeAt(tIdx) >= '0'.charCodeAt(0) && t.charCodeAt(tIdx) <= '9'.charCodeAt(0))
            x += 8;
        else
            x += tiles[ac].dim.width;

        tIdx++;
    }

    return (x);
}

function minitext(x, y, str, p, sb) {
    var ac;
    var buf;
    var t, tIdx = 0;

    buf = str;
    t = (buf || "").toUpperCase();

    while (t[tIdx]) {
        if (t.charCodeAt(tIdx) == 32) { x += 5; t++; continue; }
        else ac = t.charCodeAt(tIdx) - '!'.charCodeAt(0) + MINIFONT;

        rotateSprite(x << 16, y << 16, 65536, 0, ac, 0, p, sb, 0, 0, xdim - 1, ydim - 1);
        x += 4; // tilesizx[ac]+1;

        tIdx++;
    }
    return (x);
}

function minitextshade(x, y, str, s, p, sb) {
    var ac;
    var buf;
    var t, tIdx = 0;

    buf = str;
    t = (buf || "").toUpperCase();


    while (t[tIdx]) {
        if (t.charCodeAt(tIdx) == 32) { x += 5; t++; continue; }
        else ac = t.charCodeAt(tIdx) - '!'.charCodeAt(0) + MINIFONT;

        rotateSprite(x << 16, y << 16, 65536, 0, ac, s, p, sb, 0, 0, xdim - 1, ydim - 1);
        x += 4; // tilesizx[ac]+1;

        tIdx++;
    }
    return (x);
}


//392
var MAXUSERQUOTES = 4;
var quotebot = 0, quotebotgoal = 0;
var user_quote_time = new Int16Array(MAXUSERQUOTES);
var user_quote = new Array(MAXUSERQUOTES);

function adduserquote(daquote) {
    throw "todo";
    //int32_t i;

    //for(i=MAXUSERQUOTES-1;i>0;i--)
    //{
    //    strcpy(user_quote[i],user_quote[i-1]);
    //    user_quote_time[i] = user_quote_time[i-1];
    //}
    //strcpy(user_quote[0],daquote);
    //user_quote_time[0] = 180;
    //pub = NUMPAGES;
}

function grpVersion2char_from_crc(crc32_grp_to_identify) {
    crc32_grp_to_identify = crc32_grp_to_identify >>> 0;

    var id;
    var i = 0;

    id = crc32lookup[MAX_KNOWN_GRP].name; // unknown version

    for (i = 0; i < MAX_KNOWN_GRP; i++) {
        if (crc32lookup[i].crc32 == crc32_grp_to_identify)
            id = crc32lookup[i].name;
    }

    return (id);
}

//459
function getpackets() {
    //int32_t i, j, k, l;
    //short other, packbufleng;
    //input *osyn, *nsyn;

    sampletimer();
    //if(qe == 0 && KB.keyPressed(sc_LeftControl) && KB.keyPressed(sc_LeftAlt) && KB.keyPressed(sc_Delete))
    //{
    //    qe = 1;
    //    gameexit("Quick Exit.");
    //}

    // not a net game
    if (numplayers < 2) {
        return;
    }

    throw new Error("todo getPackets");
}

//784

function faketimerhandler() {
    var i, j, k;
    var osyn, nsyn;

    ////Check if we should quit the game.
    //todo if(qe == 0 && KB.keyPressed(sc_LeftControl) && KB.keyPressed(sc_LeftAlt) && KB.keyPressed(sc_Delete))
    //{
    //    qe = 1;
    //    gameexit("Quick Exit.");
    //}

    if ((totalclock < ototalclock + TICSPERFRAME) || (ready2send === 0)) {
        return; // Returns here when playing a demo.
    }


    //YES : Add 120tick
    ototalclock += TICSPERFRAME;

    //Check network stuff.
    getpackets();
    if (getoutputcirclesize() >= 16)
        return;


    for (i = connecthead; i >= 0; i = connectpoint2[i])
        if (i != myconnectindex)
            if (movefifoend[i] < movefifoend[myconnectindex] - 200)
                return;

    if (!Console.isActive()) {
        getinput(myconnectindex);
    }

    avgfvel += loc.fvel; // x
    avgsvel += loc.svel; // y
    avgavel += loc.avel;
    avghorz += loc.horz;
    avgbits |= loc.bits;
    if (movefifoend[myconnectindex] & (movesperpacket - 1)) {
        throw "todo"
        //copybufbyte(&inputfifo[(movefifoend[myconnectindex]-1)&(MOVEFIFOSIZ-1)][myconnectindex],
        //	&inputfifo[movefifoend[myconnectindex]&(MOVEFIFOSIZ-1)][myconnectindex],sizeof(input));
        //movefifoend[myconnectindex]++;
        return;
    }

    nsyn = [inputfifo[movefifoend[myconnectindex] & (MOVEFIFOSIZ - 1)][myconnectindex]]; // wrap in array to keep syntax
    nsyn[0].fvel = avgfvel / movesperpacket | 0;
    nsyn[0].svel = avgsvel / movesperpacket | 0;
    nsyn[0].avel = avgavel / movesperpacket | 0;
    nsyn[0].horz = avghorz / movesperpacket | 0;
    nsyn[0].bits = avgbits;
    avgfvel = avgsvel = avgavel = avghorz = avgbits = 0;
    movefifoend[myconnectindex]++;

    if (numplayers < 2) {
        if (ud.multimode > 1) for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (i != myconnectindex) {
                //clearbufbyte(&inputfifo[movefifoend[i]&(MOVEFIFOSIZ-1)][i],sizeof(input),0);
                if (ud.playerai)
                    computergetinput(i, inputfifo[movefifoend[i] & (MOVEFIFOSIZ - 1)][i]);
                movefifoend[i]++;
            }
        return;
    }

    for (i = connecthead; i >= 0; i = connectpoint2[i])
        if (i != myconnectindex) {
            k = (movefifoend[myconnectindex] - 1) - movefifoend[i];
            myminlag[i] = Math.min(myminlag[i], k);
            mymaxlag = Math.max(mymaxlag, k);
        }

    if (((movefifoend[myconnectindex] - 1) & (TIMERUPDATESIZ - 1)) == 0) {
        i = mymaxlag - bufferjitter; mymaxlag = 0;
        if (i > 0) bufferjitter += ((3 + i) >> 2);
        else if (i < 0) bufferjitter -= ((1 - i) >> 2);
    }

    if (networkmode == 1) {
        packbuf[0] = 17;

        if ((movefifoend[myconnectindex] - 1) == 0) {
            packbuf[0] = 16;
        }

        j = 1;

        //Fix timers and buffer/jitter value
        if (((movefifoend[myconnectindex] - 1) & (TIMERUPDATESIZ - 1)) == 0) {
            if (myconnectindex != connecthead) {
                i = myminlag[connecthead] - otherminlag;
                if (klabs(i) > 8) {
                    i >>= 1;
                }
                else
                    if (klabs(i) > 2) {
                        i = ksgn(i);
                    }
                    else {
                        i = 0;
                    }

                totalclock -= TICSPERFRAME * i;
                myminlag[connecthead] -= i; otherminlag += i;
            }

            if (myconnectindex == connecthead)
                for (i = connectpoint2[connecthead]; i >= 0; i = connectpoint2[i])
                    packbuf[j++] = Math.min(Math.max(myminlag[i], -128), 127);

            for (i = connecthead; i >= 0; i = connectpoint2[i])
                myminlag[i] = 0x7fffffff;
        }

        osyn = inputfifo[(movefifoend[myconnectindex] - 2) & (MOVEFIFOSIZ - 1)][myconnectindex];
        nsyn = inputfifo[(movefifoend[myconnectindex] - 1) & (MOVEFIFOSIZ - 1)][myconnectindex];

        k = j;
        packbuf[j++] = 0;

        if (nsyn[0].fvel != osyn[0].fvel) {
            packbuf[j++] = nsyn[0].fvel;
            packbuf[j++] = (nsyn[0].fvel >> 8);
            packbuf[k] |= 1;
        }
        if (nsyn[0].svel != osyn[0].svel) {
            packbuf[j++] = nsyn[0].svel;
            packbuf[j++] = (nsyn[0].svel >> 8);
            packbuf[k] |= 2;
        }
        if (nsyn[0].avel != osyn[0].avel) {
            packbuf[j++] = nsyn[0].avel;
            packbuf[k] |= 4;
        }
        if (((nsyn[0].bits ^ osyn[0].bits) & 0x000000ff) >>> 0) packbuf[j++] = (nsyn[0].bits & 255), packbuf[k] |= 8;
        if (((nsyn[0].bits ^ osyn[0].bits) & 0x0000ff00) >>> 0) packbuf[j++] = ((nsyn[0].bits >> 8) & 255), packbuf[k] |= 16;
        if (((nsyn[0].bits ^ osyn[0].bits) & 0x00ff0000) >>> 0) packbuf[j++] = ((nsyn[0].bits >> 16) & 255), packbuf[k] |= 32;
        if (((nsyn[0].bits ^ osyn[0].bits) & 0xff000000) >>> 0) packbuf[j++] = ((nsyn[0].bits >> 24) & 255), packbuf[k] |= 64;
        if (nsyn[0].horz != osyn[0].horz) {
            packbuf[j++] = nsyn[0].horz;
            packbuf[k] |= 128;
        }

        while (syncvalhead[myconnectindex] != syncvaltail) {
            packbuf[j++] = syncval[myconnectindex][syncvaltail & (MOVEFIFOSIZ - 1)];
            syncvaltail++;
        }

        for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (i != myconnectindex)
                sendpacket(i, packbuf, j);

        return;
    }
    if (myconnectindex != connecthead)   //Slave
    {
        //Fix timers and buffer/jitter value
        if (((movefifoend[myconnectindex] - 1) & (TIMERUPDATESIZ - 1)) == 0) {
            i = myminlag[connecthead] - otherminlag;
            if (klabs(i) > 8) i >>= 1;
            else if (klabs(i) > 2) i = ksgn(i);
            else i = 0;

            totalclock -= TICSPERFRAME * i;
            myminlag[connecthead] -= i; otherminlag += i;

            for (i = connecthead; i >= 0; i = connectpoint2[i])
                myminlag[i] = 0x7fffffff;
        }

        packbuf[0] = 1; packbuf[1] = 0; j = 2;

        osyn = inputfifo[(movefifoend[myconnectindex] - 2) & (MOVEFIFOSIZ - 1)][myconnectindex];
        nsyn = inputfifo[(movefifoend[myconnectindex] - 1) & (MOVEFIFOSIZ - 1)][myconnectindex];

        if (nsyn[0].fvel != osyn[0].fvel) {
            packbuf[j++] = nsyn[0].fvel;
            packbuf[j++] = (nsyn[0].fvel >> 8);
            packbuf[1] |= 1;
        }
        if (nsyn[0].svel != osyn[0].svel) {
            packbuf[j++] = nsyn[0].svel;
            packbuf[j++] = (nsyn[0].svel >> 8);
            packbuf[1] |= 2;
        }
        if (nsyn[0].avel != osyn[0].avel) {
            packbuf[j++] = nsyn[0].avel;
            packbuf[1] |= 4;
        }
        if (((nsyn[0].bits ^ osyn[0].bits) & 0x000000ff) >>> 0) packbuf[j++] = (nsyn[0].bits & 255), packbuf[1] |= 8;
        if (((nsyn[0].bits ^ osyn[0].bits) & 0x0000ff00) >>> 0) packbuf[j++] = ((nsyn[0].bits >> 8) & 255), packbuf[1] |= 16;
        if (((nsyn[0].bits ^ osyn[0].bits) & 0x00ff0000) >>> 0) packbuf[j++] = ((nsyn[0].bits >> 16) & 255), packbuf[1] |= 32;
        if (((nsyn[0].bits ^ osyn[0].bits) & 0xff000000) >>> 0) packbuf[j++] = ((nsyn[0].bits >> 24) & 255), packbuf[1] |= 64;
        if (nsyn[0].horz != osyn[0].horz) {
            packbuf[j++] = nsyn[0].horz;
            packbuf[1] |= 128;
        }

        while (syncvalhead[myconnectindex] != syncvaltail) {
            packbuf[j++] = syncval[myconnectindex][syncvaltail & (MOVEFIFOSIZ - 1)];
            syncvaltail++;
        }

        sendpacket(connecthead, packbuf, j);
        return;
    }

    //This allows allow packet-resends
    for (i = connecthead; i >= 0; i = connectpoint2[i])
        if (movefifoend[i] <= movefifosendplc) {
            packbuf[0] = 127;
            for (i = connectpoint2[connecthead]; i >= 0; i = connectpoint2[i])
                sendpacket(i, packbuf, 1);
            return;
        }

    throw "todo, watch out for osyn and nsyn references"
    while (1)  //Master
    {
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (playerquitflag[i] && (movefifoend[i] <= movefifosendplc)) return;

        osyn = inputfifo[(movefifosendplc - 1) & (MOVEFIFOSIZ - 1)][0];
        nsyn = inputfifo[(movefifosendplc) & (MOVEFIFOSIZ - 1)][0];

        //MASTER -> SLAVE packet
        packbuf[0] = 0; j = 1;

        //Fix timers and buffer/jitter value
        if ((movefifosendplc & (TIMERUPDATESIZ - 1)) == 0) {
            for (i = connectpoint2[connecthead]; i >= 0; i = connectpoint2[i])
                if (playerquitflag[i])
                    packbuf[j++] = Math.min(Math.max(myminlag[i], -128), 127);

            for (i = connecthead; i >= 0; i = connectpoint2[i])
                myminlag[i] = 0x7fffffff;
        }

        k = j;
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            j += playerquitflag[i];
        for (i = connecthead; i >= 0; i = connectpoint2[i]) {
            if (playerquitflag[i] == 0) continue;

            packbuf[k] = 0;
            if (nsyn[i].fvel != osyn[i].fvel) {
                packbuf[j++] = nsyn[i].fvel;
                packbuf[j++] = (nsyn[i].fvel >> 8);
                packbuf[k] |= 1;
            }
            if (nsyn[i].svel != osyn[i].svel) {
                packbuf[j++] = nsyn[i].svel;
                packbuf[j++] = (nsyn[i].svel >> 8);
                packbuf[k] |= 2;
            }
            if (nsyn[i].avel != osyn[i].avel) {
                packbuf[j++] = nsyn[i].avel;
                packbuf[k] |= 4;
            }
            if ((nsyn[i].bits ^ osyn[i].bits) & 0x000000ff) packbuf[j++] = (nsyn[i].bits & 255), packbuf[k] |= 8;
            if ((nsyn[i].bits ^ osyn[i].bits) & 0x0000ff00) packbuf[j++] = ((nsyn[i].bits >> 8) & 255), packbuf[k] |= 16;
            if ((nsyn[i].bits ^ osyn[i].bits) & 0x00ff0000) packbuf[j++] = ((nsyn[i].bits >> 16) & 255), packbuf[k] |= 32;
            if (((nsyn[i].bits ^ osyn[i].bits) & 0xff000000) >>> 0) packbuf[j++] = ((nsyn[i].bits >> 24) & 255), packbuf[k] |= 64;
            if (nsyn[i].horz != osyn[i].horz) {
                packbuf[j++] = nsyn[i].horz;
                packbuf[k] |= 128;
            }
            k++;
        }

        while (syncvalhead[myconnectindex] != syncvaltail) {
            packbuf[j++] = syncval[myconnectindex][syncvaltail & (MOVEFIFOSIZ - 1)];
            syncvaltail++;
        }

        for (i = connectpoint2[connecthead]; i >= 0; i = connectpoint2[i])
            if (playerquitflag[i]) {
                sendpacket(i, packbuf, j);
                if (nsyn[i].bits & (1 << 26))
                    playerquitflag[i] = 0;
            }

        movefifosendplc += movesperpacket;
    }
}

var cacnum;

//typedef struct { 
//    uint8_t *hand;
//    int32_t leng;
//    uint8_t  *lock; } 
//cactype;
var cactype = [];

function caches() {
    // todo
    console.log("todo caches")
    //var i,k;
    //var text = "";

    //k = 0;
    //for(i=0;i<cacnum;i++)
    //    if ((*cac[i].lock) >= 200)
    //    {
    //        sprintf(text,"Locked- %d: Leng:%d, Lock:%d",i,cac[i].leng,*cac[i].lock);
    //        printext256(0,k,31,-1,text,1); k += 6;
    //    }

    //k += 6;

    //for(i=1;i<11;i++)
    //    if (lumplockbyte[i] >= 200) {
    //        text = "RTS Locked %hd:" + i;
    //        printext256(0,k,31,-1,text,1); k += 6;
    //    }


}

//1173
function checksync() {
    var i;

    for (i = connecthead; i >= 0; i = connectpoint2[i])
        if (syncvalhead[i] == syncvaltottail) break;
    if (i < 0) {
        syncstat = 0;
        do {
            for (i = connectpoint2[connecthead]; i >= 0; i = connectpoint2[i]) {
                if (syncval[i][syncvaltottail & (MOVEFIFOSIZ - 1)] != syncval[connecthead][syncvaltottail & (MOVEFIFOSIZ - 1)]) {
                    syncstat = 1;
                }
            }

            syncvaltottail++;
            for (i = connecthead; i >= 0; i = connectpoint2[i]) {
                if (syncvalhead[i] == syncvaltottail) {
                    break;
                }
            }
        } while (i < 0);
    }

    if (connectpoint2[connecthead] < 0) {
        syncstat = 0;
    }

    if (syncstat) {
        minitext(21, 30 + 35 + 30, "Out Of Sync - Please restart game", COLOR_ON, 2 + 8 + 16);
        // FIX_00090: Removed info key. FPS were shown after CRC msg. CRC not always removed. (Turrican)
        for (i = connecthead; i >= 0; i = connectpoint2[i]) {
            if (ud.mapCRC[connecthead] != ud.mapCRC[i]) {
                minitext(21, 30 + 42 + 30, "Map CRC mismatching. Please use exactly the same map.", COLOR_ON, 2 + 8 + 16);
                dispVersion();
            }
            else
                minitext(21, 30 + 42 + 30, "Verify the con files. Close your P2P if any", COLOR_ON, 2 + 8 + 16);

        }
    }

    if (syncstate) {
        //printext256(4L,160L,31,0,"Missed Network packet!",0);
        //printext256(4L,138L,31,0,"RUN DN3DHELP.EXE for information.",0);
        minitext(21, 30 + 35 + 30, "Missed Network packet!", COLOR_ON, 2 + 8 + 16);
    }
}

//1234

function check_fta_sounds(i) {
    if (sprite[i].extra > 0) {
        switch (sprite[i].picnum) {
            case LIZTROOPONTOILET:
            case LIZTROOPJUSTSIT:
            case LIZTROOPSHOOT:
            case LIZTROOPJETPACK:
            case LIZTROOPDUCKING:
            case LIZTROOPRUNNING:
            case LIZTROOP:
                spritesound(PRED_RECOG, i);
                break;
            case LIZMAN:
            case LIZMANSPITTING:
            case LIZMANFEEDING:
            case LIZMANJUMP:
                spritesound(CAPT_RECOG, i);
                break;
            case PIGCOP:
            case PIGCOPDIVE:
                spritesound(PIG_RECOG, i);
                break;
            case RECON:
                spritesound(RECO_RECOG, i);
                break;
            case DRONE:
                spritesound(DRON_RECOG, i);
                break;
            case COMMANDER:
            case COMMANDERSTAYPUT:
                spritesound(COMM_RECOG, i);
                break;
            case ORGANTIC:
                spritesound(TURR_RECOG, i);
                break;
            case OCTABRAIN:
            case OCTABRAINSTAYPUT:
                spritesound(OCTA_RECOG, i);
                break;
            case BOSS1:
                sound(BOS1_RECOG);
                break;
            case BOSS2:
                if (sprite[i].pal == 1)
                    sound(BOS2_RECOG);
                else sound(WHIPYOURASS);
                break;
            case BOSS3:
                if (sprite[i].pal == 1)
                    sound(BOS3_RECOG);
                else sound(RIPHEADNECK);
                break;
            case BOSS4:
            case BOSS4STAYPUT:
                if (sprite[i].pal == 1)
                    sound(BOS4_RECOG);
                sound(BOSS4_FIRSTSEE);
                break;
            case GREENSLIME:
                spritesound(SLIM_RECOG, i);
                break;
        }
    }
}

//1300
function inventory(s) {
    switch (s.picnum) {
        case FIRSTAID:
        case STEROIDS:
        case HEATSENSOR:
        case BOOTS:
        case JETPACK:
        case HOLODUKE:
        case AIRTANK:
            return 1;
    }
    return 0;
}

//1316

function badguy(s) {

    switch (s.picnum) {
        case SHARK:
        case RECON:
        case DRONE:
        case LIZTROOPONTOILET:
        case LIZTROOPJUSTSIT:
        case LIZTROOPSTAYPUT:
        case LIZTROOPSHOOT:
        case LIZTROOPJETPACK:
        case LIZTROOPDUCKING:
        case LIZTROOPRUNNING:
        case LIZTROOP:
        case OCTABRAIN:
        case COMMANDER:
        case COMMANDERSTAYPUT:
        case PIGCOP:
        case EGG:
        case PIGCOPSTAYPUT:
        case PIGCOPDIVE:
        case LIZMAN:
        case LIZMANSPITTING:
        case LIZMANFEEDING:
        case LIZMANJUMP:
        case ORGANTIC:
        case BOSS1:
        case BOSS2:
        case BOSS3:
        case BOSS4:
        case GREENSLIME:
        case GREENSLIME + 1:
        case GREENSLIME + 2:
        case GREENSLIME + 3:
        case GREENSLIME + 4:
        case GREENSLIME + 5:
        case GREENSLIME + 6:
        case GREENSLIME + 7:
        case RAT:
        case ROTATEGUN:
            return 1;
    }

    if (actortype[s.picnum]) {
        return 1;
    }

    return 0;
}

//1317

function badguypic(pn) {

    switch (pn) {
        case SHARK:
        case RECON:
        case DRONE:
        case LIZTROOPONTOILET:
        case LIZTROOPJUSTSIT:
        case LIZTROOPSTAYPUT:
        case LIZTROOPSHOOT:
        case LIZTROOPJETPACK:
        case LIZTROOPDUCKING:
        case LIZTROOPRUNNING:
        case LIZTROOP:
        case OCTABRAIN:
        case COMMANDER:
        case COMMANDERSTAYPUT:
        case PIGCOP:
        case EGG:
        case PIGCOPSTAYPUT:
        case PIGCOPDIVE:
        case LIZMAN:
        case LIZMANSPITTING:
        case LIZMANFEEDING:
        case LIZMANJUMP:
        case ORGANTIC:
        case BOSS1:
        case BOSS2:
        case BOSS3:
        case BOSS4:
        case GREENSLIME:
        case GREENSLIME + 1:
        case GREENSLIME + 2:
        case GREENSLIME + 3:
        case GREENSLIME + 4:
        case GREENSLIME + 5:
        case GREENSLIME + 6:
        case GREENSLIME + 7:
        case RAT:
        case ROTATEGUN:
            return 1;
    }

    if (actortype[pn]) return 1;

    return 0;
}

function myos(x, y, tilenum, shade, orientation) {
    var p;
    var a;

    if (orientation & 4)
        a = 1024;
    else a = 0;

    p = sector[ps[screenpeek].cursectnum].floorpal;
    rotateSprite(x << 16, y << 16, 65536, a, tilenum, shade, p, 2 | orientation, windowx1, windowy1, windowx2, windowy2);
}

//1431
function myospal(x, y, tilenum, shade, orientation, p) {
    var fp;
    var a;

    if (orientation & 4)
        a = 1024;
    else a = 0;

    fp = sector[ps[screenpeek].cursectnum].floorpal;

    rotateSprite(x << 16, y << 16, 65536, a, tilenum, shade, p, 2 | orientation, windowx1, windowy1, windowx2, windowy2);
}


function invennum(x, y, num1, ha, sbits) {
    ha = toUint8(ha);
    var dabuf = String.fromCharCode(num1, 0, 0); // string needs to be 3 long for "> 99"
    if (num1 > 99) {
        rotateSprite((x - 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, sbits, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(1) - '0'.charCodeAt(0), ha, 0, sbits, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(2) - '0'.charCodeAt(0), ha, 0, sbits, 0, 0, xdim - 1, ydim - 1);
    }
    else if (num1 > 9) {
        rotateSprite((x) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, sbits, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(1) - '0'.charCodeAt(0), ha, 0, sbits, 0, 0, xdim - 1, ydim - 1);
    }
    else
        rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, sbits, 0, 0, xdim - 1, ydim - 1);
}


function orderweaponnum(ind, x, y, num1, num2, ha) {
    ha = toUint8(ha);
    rotateSprite((x - 7) << 16, y << 16, 65536, 0, THREEBYFIVE + ind + 1, ha - 10, 7, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    rotateSprite((x - 3) << 16, y << 16, 65536, 0, THREEBYFIVE + 10, ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    minitextshade(x + 1, y - 4, "ORDER", 26, 6, 2 + 8 + 16 + 128);
}

//1473

function weaponnum(ind, x, y, num1, num2, ha) {
    ha = toUint8(ha);
    var dabuf = "";

    rotateSprite((x - 7) << 16, y << 16, 65536, 0, THREEBYFIVE + ind + 1, ha - 10, 7, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    rotateSprite((x - 3) << 16, y << 16, 65536, 0, THREEBYFIVE + 10, ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    rotateSprite((x + 9) << 16, y << 16, 65536, 0, THREEBYFIVE + 11, ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);

    if (num1 > 99) num1 = 99;
    if (num2 > 99) num2 = 99;

    dabuf = String(num1);
    if (num1 > 9) {
        rotateSprite((x) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf[0].charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf[1].charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    else rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf[0].charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);

    dabuf = String(num2);
    if (num2 > 9) {
        rotateSprite((x + 13) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf[0].charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 17) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf[1].charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    else rotateSprite((x + 13) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf[0].charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
}

//1501

function weaponnum999(ind, x, y, num1, num2, ha) {
    ha = toUint8(ha);
    var dabuf = "";
    rotateSprite((x - 4) << 16, y << 16, 65536, 0, THREEBYFIVE + 10, ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    rotateSprite((x - 7) << 16, y << 16, 65536, 0, THREEBYFIVE + ind + 1, ha - 10, 7, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    rotateSprite((x + 13) << 16, y << 16, 65536, 0, THREEBYFIVE + 11, ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);

    dabuf = String(num1);
    if (num1 > 99) {
        rotateSprite((x) << 16, y << 16, 65536,  0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(1) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 8) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(2) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    else if (num1 > 9) {
        rotateSprite((x + 4) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 8) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(1) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    else rotateSprite((x + 8) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);

    dabuf = String(num2);
    if (num2 > 99) {
        rotateSprite((x + 17) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 21) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(1) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 25) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(2) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    else if (num2 > 9) {
        rotateSprite((x + 17) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
        rotateSprite((x + 21) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(1) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    else rotateSprite((x + 25) << 16, y << 16, 65536, 0, THREEBYFIVE + dabuf.charCodeAt(0) - '0'.charCodeAt(0), ha, 0, 10 + 128, 0, 0, xdim - 1, ydim - 1);

}


//1540

//REPLACE FULLY
function weapon_amounts(p, x, y, u) {
    var cw;

    cw = p.curr_weapon;

    if (u & 4) {
        if (u != (0xffffffff | 0)) patchstatusbar(96, 178, 96 + 12, 178 + 6);
        weaponnum999(PISTOL_WEAPON, x, y,
			p.ammo_amount[PISTOL_WEAPON], max_ammo_amount[PISTOL_WEAPON],
			12 - 20 * (cw == PISTOL_WEAPON));
    }
    if (u & 8) {
        if (u != (0xffffffff | 0)) patchstatusbar(96, 184, 96 + 12, 184 + 6);
        weaponnum999(SHOTGUN_WEAPON, x, y + 6,
			p.ammo_amount[SHOTGUN_WEAPON], max_ammo_amount[SHOTGUN_WEAPON],
			(!p.gotweapon[SHOTGUN_WEAPON] * 9) + 12 - 18 *
			(cw == SHOTGUN_WEAPON));
    }
    if (u & 16) {
        if (u != (0xffffffff | 0)) patchstatusbar(96, 190, 96 + 12, 190 + 6);
        weaponnum999(CHAINGUN_WEAPON, x, y + 12,
			p.ammo_amount[CHAINGUN_WEAPON], max_ammo_amount[CHAINGUN_WEAPON],
			(!p.gotweapon[CHAINGUN_WEAPON] * 9) + 12 - 18 *
			(cw == CHAINGUN_WEAPON));
    }
    if (u & 32) {
        if (u != (0xffffffff | 0)) patchstatusbar(135, 178, 135 + 8, 178 + 6);
        weaponnum(RPG_WEAPON, x + 39, y,
			p.ammo_amount[RPG_WEAPON], max_ammo_amount[RPG_WEAPON],
			(!p.gotweapon[RPG_WEAPON] * 9) + 12 - 19 *
			(cw == RPG_WEAPON));
    }
    if (u & 64) {
        if (u != (0xffffffff | 0)) patchstatusbar(135, 184, 135 + 8, 184 + 6);
        weaponnum(HANDBOMB_WEAPON, x + 39, y + 6,
			p.ammo_amount[HANDBOMB_WEAPON], max_ammo_amount[HANDBOMB_WEAPON],
			(((!p.ammo_amount[HANDBOMB_WEAPON]) | (!p.gotweapon[HANDBOMB_WEAPON])) * 9) + 12 - 19 *
			((cw == HANDBOMB_WEAPON) || (cw == HANDREMOTE_WEAPON)));
    }
    if (u & 128) {
        if (u != (0xffffffff | 0)) patchstatusbar(135, 190, 135 + 8, 190 + 6);

        if (VOLUMEONE) {
            orderweaponnum(SHRINKER_WEAPON, x + 39, y + 12,
				p.ammo_amount[SHRINKER_WEAPON], max_ammo_amount[SHRINKER_WEAPON],
				(!p.gotweapon[SHRINKER_WEAPON] * 9) + 12 - 18 *
				(cw == SHRINKER_WEAPON));
        }
        else {
            if (p.subweapon & (1 << GROW_WEAPON))
                weaponnum(SHRINKER_WEAPON, x + 39, y + 12,
				p.ammo_amount[GROW_WEAPON], max_ammo_amount[GROW_WEAPON],
				(!p.gotweapon[GROW_WEAPON] * 9) + 12 - 18 *
				(cw == GROW_WEAPON));
            else
                weaponnum(SHRINKER_WEAPON, x + 39, y + 12,
				p.ammo_amount[SHRINKER_WEAPON], max_ammo_amount[SHRINKER_WEAPON],
				(!p.gotweapon[SHRINKER_WEAPON] * 9) + 12 - 18 *
				(cw == SHRINKER_WEAPON));
        }
    }
    if (u & 256) {
        if (u != (0xffffffff | 0)) patchstatusbar(166, 178, 166 + 8, 178 + 6);

        if (VOLUMEONE) {
            orderweaponnum(DEVISTATOR_WEAPON, x + 70, y,
				p.ammo_amount[DEVISTATOR_WEAPON], max_ammo_amount[DEVISTATOR_WEAPON],
				(!p.gotweapon[DEVISTATOR_WEAPON] * 9) + 12 - 18 *
				(cw == DEVISTATOR_WEAPON));
        }
        else {
            weaponnum(DEVISTATOR_WEAPON, x + 70, y,
				p.ammo_amount[DEVISTATOR_WEAPON], max_ammo_amount[DEVISTATOR_WEAPON],
				(!p.gotweapon[DEVISTATOR_WEAPON] * 9) + 12 - 18 *
				(cw == DEVISTATOR_WEAPON));
        }
    }
    if (u & 512) {
        if (u != (0xffffffff | 0)) patchstatusbar(166, 184, 166 + 8, 184 + 6);
        if (VOLUMEONE) {
            orderweaponnum(TRIPBOMB_WEAPON, x + 70, y + 6,
				p.ammo_amount[TRIPBOMB_WEAPON], max_ammo_amount[TRIPBOMB_WEAPON],
				(!p.gotweapon[TRIPBOMB_WEAPON] * 9) + 12 - 18 *
				(cw == TRIPBOMB_WEAPON));
        }
        else {
            weaponnum(TRIPBOMB_WEAPON, x + 70, y + 6,
				p.ammo_amount[TRIPBOMB_WEAPON], max_ammo_amount[TRIPBOMB_WEAPON],
				(!p.gotweapon[TRIPBOMB_WEAPON] * 9) + 12 - 18 *
				(cw == TRIPBOMB_WEAPON));
        }
    }

    if (u & 65536) {
        if (u != (0xffffffff | 0)) patchstatusbar(166, 190, 166 + 8, 190 + 6);
        if (VOLUMEONE) {
            orderweaponnum(-1, x + 70, y + 12,
				p.ammo_amount[FREEZE_WEAPON], max_ammo_amount[FREEZE_WEAPON],
				(!p.gotweapon[FREEZE_WEAPON] * 9) + 12 - 18 *
				(cw == FREEZE_WEAPON));
        }
        else {
            weaponnum(-1, x + 70, y + 12,
				p.ammo_amount[FREEZE_WEAPON], max_ammo_amount[FREEZE_WEAPON],
				(!p.gotweapon[FREEZE_WEAPON] * 9) + 12 - 18 *
				(cw == FREEZE_WEAPON));
        }
    }
}


//1668

function digitalnumber(x, y, n, s, cs) {
    var i, j, k, p, c;
    var b = "";
    //
    // uint8_t  * ltoa(int32_t l, uint8_t  * buffer, int radix);
    // is NON-STANDARD and equivalent to STANDARD
    // (void) sprintf(buffer, "%ld", l);
    //ltoa(n,b,10);
    b = String(n);

    i = b.length;
    j = 0;

    for (k = 0; k < i; k++) {
        p = DIGITALNUM + b[k].charCodeAt(0) - '0'.charCodeAt(0);
        j += tiles[p].dim.width + 1;
    }
    c = x - (j >> 1);

    j = 0;
    for (k = 0; k < i; k++) {
        p = DIGITALNUM + b[k].charCodeAt(0) - '0'.charCodeAt(0);
        rotateSprite((c + j) << 16, y << 16, 65536, 0, p, s, 0, cs, 0, 0, xdim - 1, ydim - 1);
        j += tiles[p].dim.width + 1;
    }
}

//1802
function display_boardfilename_FPS_weapon(offx, offy, stepx, stepy) {
    var i;

    // FIX_00025: Can toggle FPS and map name during a game (use dnrate OR toggle
    //            from menu when in deathmatch). 

    // Display boardfilename and FPS
    if (ud.tickrate & 1) {
        tics(offx.$, offy.$, COLOR_ON);
        offy.$ += stepy.$;
    }
    if (ud.tickrate & 2)
        dispVersion();

    // We display the weapons here instead of changing the function
    // displayweapon() because the display will be much faster
    for (i = connecthead; i >= 0; i = connectpoint2[i]) {
        if (ud.hideweapon && i == screenpeek)
            drawsmallweapon(ps[i].curr_weapon, 1, 130, (ud.screen_size <= 4) ? 170 : 140);
    }
}

//1830

// FIX_00026: Weapon can now be hidden (on your screen only).
function drawsmallweapon(weapon, scale, x, y) {
    var t = 60000.0;
    var s = 0;
    var offsetx = 0, offsety = 0;


    switch (weapon) {
        case KNEE_WEAPON: s = 0; break;
        case PISTOL_WEAPON: s = FIRSTGUNSPRITE;
            offsetx = 8;
            offsety = 7;
            break;
        case SHOTGUN_WEAPON: s = SHOTGUNSPRITE;
            t = 45000;
            offsetx = -1;
            offsety = 9;
            break;
        case CHAINGUN_WEAPON: s = CHAINGUNSPRITE;
            t = 45000;
            offsetx = -1;
            offsety = 9;
            break;
        case RPG_WEAPON: s = RPGSPRITE;
            t = 45000;
            offsetx = 4;
            offsety = 9;
            break;
        case HANDBOMB_WEAPON: s = HEAVYHBOMB;
            t = 20000;
            offsetx = 16;
            offsety = 13;
            break;
        case SHRINKER_WEAPON: s = SHRINKERSPRITE;
            t = 30000;
            offsetx = 6;
            offsety = 14;
            break;
        case DEVISTATOR_WEAPON: s = DEVISTATORSPRITE;
            t = 45000;
            offsetx = 3;
            offsety = 9;
            break;
        case TRIPBOMB_WEAPON: s = TRIPBOMBSPRITE;
            t = 75000;
            offsetx = 10;
            offsety = 12;
            break;
        case FREEZE_WEAPON: s = FREEZESPRITE;
            t = 45000;
            offsetx = 1;
            offsety = 6;
            break;
        case HANDREMOTE_WEAPON: s = 0;
            break;
        case GROW_WEAPON: s = GROWSPRITEICON;
            t = 30000;
            offsetx = 6;
            offsety = 4;
            break;
        default: s = 0;
    }

    if (s)
        rotateSprite((x + toInt16(offsetx * scale)) << 16, (y + toInt16(offsety * scale)) << 16, (t * scale), 0, s, 0, 0, 2 + 8 + 16, 0, 0, xdim - 1, ydim - 1);

    return;
}

//1900

function coolgaugetext(snum) {
    var p;
    var i, j, o, ss, u;
    var permbit;
    var offx = 3, offy = 3, stepx = 60, stepy = 6;
    var text = "";
    
    p = ps[snum];

    if (p.invdisptime > 0) {
        displayinventory(p);
    }


    if (ps[snum].gm & MODE_MENU)
        if ((current_menu >= 400 && current_menu <= 405))
            return;

    offy += PreMap.countFragBars(); //add fragbars
    var offxRef = new Ref(offx);
    var offyRef = new Ref(offy);
    var stepxRef = new Ref(stepx);
    var stepyRef = new Ref(stepy);
    display_boardfilename_FPS_weapon(offxRef, offyRef, stepxRef, stepyRef);
    offx = offxRef.$;
    offy = offyRef.$;
    stepx = stepxRef.$;
    stepy = stepyRef.$;

    ss = ud.screen_size; if (ss < 4) return;

    // Draw the multi player frag status bar
    if (ud.multimode > 1 && ud.coop != 1) {
        throw 'todo'
        if (pus) {
            displayfragbar();
        }
        else {
            for (i = connecthead; i >= 0; i = connectpoint2[i]) {
                if (ps[i].frag != sbar.frag[i]) {
                    displayfragbar();
                    break;
                }
            }
        }
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (i != myconnectindex)
                sbar.frag[i] = ps[i].frag;
    }

    if (ss == 4)   //DRAW MINI STATUS BAR:
    {
        // FIX_00027: Added an extra small statusbar (HUD)
        if(ud.extended_screen_size>0)
        {
            offx = 5; offy = 160;
            text = String(ps[screenpeek].ammo_amount[ps[screenpeek].curr_weapon]);
            minitext(offx+26,offy+21,text,COLOR_ON,2+8+16); //minitext: 2 red light, 23 yellow
            text = String(ps[screenpeek].last_extra);
            gametext(offx,offy+20,text,ps[screenpeek].last_extra<=50?15:0,2+8+16); //minitext: 2 red light, 23 yellow
            rotateSprite((offx+0*10)<<16,(offy+28)<<16,20000,0,SHIELD,ps[screenpeek].shield_amount?25:100,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+0*10)<<16,(offy+28)<<16,ksqrt(ps[screenpeek].shield_amount)*20000/10,0,SHIELD,0,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+1*10)<<16,(offy+28)<<16,35000,0,JETPACK_ICON,ps[screenpeek].jetpack_amount?25:100,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+1*10)<<16,(offy+28)<<16,ksqrt(ps[screenpeek].jetpack_amount)*35000/40,0,JETPACK_ICON,0,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+2*10-1)<<16,(offy+28)<<16,35000,0,STEROIDS_ICON,ps[screenpeek].steroids_amount?25:100,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+2*10-1)<<16,(offy+28)<<16,ksqrt(ps[screenpeek].steroids_amount)*35000/20,0,STEROIDS_ICON,5,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+3*10-3)<<16,(offy+28)<<16,40000,0,FIRSTAID_ICON,ps[screenpeek].firstaid_amount?25:100,0,2+8+16,0,0,xdim-1,ydim-1);
            rotateSprite((offx+3*10-3)<<16,(offy+28)<<16,ksqrt(ps[screenpeek].firstaid_amount)*40000/10,0,FIRSTAID_ICON,0,0,2+8+16,0,0,xdim-1,ydim-1);
        }
        else
        {
            if (p.inven_icon)
                rotateSprite(69<<16,(200-30)<<16,65536,0,INVENTORYBOX,0,21,10+16,0,0,xdim-1,ydim-1);
            rotateSprite(5<<16,(200-28)<<16,65536,0,HEALTHBOX,0,21,10+16,0,0,xdim-1,ydim-1);

            if(sprite[p.i].pal == 1 && p.last_extra < 2)
                digitalnumber(20,200-17,1,-16,10+16);
            else digitalnumber(20,200-17,p.last_extra,-16,10+16);

            rotateSprite(37<<16,(200-28)<<16,65536,0,AMMOBOX,0,21,10+16,0,0,xdim-1,ydim-1);

            if (p.curr_weapon == HANDREMOTE_WEAPON) i = HANDBOMB_WEAPON; else i = p.curr_weapon;
            digitalnumber(53,200-17,p.ammo_amount[i],-16,10+16);

            o = 158; permbit = 0;
            if (p.inven_icon)
            {
                switch(p.inven_icon)
                {
                    case 1: i = FIRSTAID_ICON; break;
                    case 2: i = STEROIDS_ICON; break;
                    case 3: i = HOLODUKE_ICON; break;
                    case 4: i = JETPACK_ICON; break;
                    case 5: i = HEAT_ICON; break;
                    case 6: i = AIRTANK_ICON; break;
                    case 7: i = BOOT_ICON; break;
                    default: i = -1;
                }
                if (i >= 0) rotateSprite((231-o)<<16,(200-21)<<16,65536,0,i,0,0,10+16+permbit,0,0,xdim-1,ydim-1);

                minitext(292-30-o,190,"%",6,10+16+permbit);

                j = 0x80000000 | 0;
                switch(p.inven_icon)
                {
                    case 1: i = p.firstaid_amount; break;
                    case 2: i = ((p.steroids_amount+3)>>2); break;
                    case 3: i = ((p.holoduke_amount+15)/24)|0; j = p.holoduke_on; break;
                    case 4: i = ((p.jetpack_amount+15)>>4); j = p.jetpack_on; break;
                    case 5: i = p.heat_amount/12; j = p.heat_on; break;
                    case 6: i = ((p.scuba_amount+63)>>6); break;
                    case 7: i = (p.boot_amount>>1); break;
                }
                invennum(284-30-o,200-6,i,0,10+permbit);
                if (j > 0) minitext(288-30-o,180,"ON",0,10+16+permbit);
                else if (j != (0x80000000 | 0)) minitext(284-30-o,180,"OFF",2,10+16+permbit);
                if (p.inven_icon >= 6) minitext(284-35-o,180,"AUTO",2,10+16+permbit);
            }
        }
        return;
    }

    //DRAW/UPDATE FULL STATUS BAR:

    if (pus) { pus = 0; u = 0xffffffff | 0; } else u = 0;
    
    if (sbar.frag[myconnectindex] != p.frag) { sbar.frag[myconnectindex] = p.frag; u |= 32768; }
    if (sbar.got_access != p.got_access) { sbar.got_access = p.got_access; u |= 16384; }
    if (sbar.last_extra != p.last_extra) { sbar.last_extra = p.last_extra; u |= 1; }
    if (sbar.shield_amount != p.shield_amount) { sbar.shield_amount = p.shield_amount; u |= 2; }
    if (sbar.curr_weapon != p.curr_weapon) { sbar.curr_weapon = p.curr_weapon; u |= (4 + 8 + 16 + 32 + 64 + 128 + 256 + 512 + 1024 + 65536); }
    for (i = 1; i < 10; i++) {
        if (sbar.ammo_amount[i] != p.ammo_amount[i]) {
            sbar.ammo_amount[i] = p.ammo_amount[i]; if (i < 9) u |= ((2 << i) + 1024); else u |= 65536 + 1024;
        }
        if (sbar.gotweapon[i] != p.gotweapon[i]) {
            sbar.gotweapon[i] =
                p.gotweapon[i]; if (i < 9) u |= ((2 << i) + 1024); else u |= 65536 + 1024;
        }
    }
    if (sbar.inven_icon != p.inven_icon) { sbar.inven_icon = p.inven_icon; u |= (2048 + 4096 + 8192); }
    if (sbar.holoduke_on != p.holoduke_on) { sbar.holoduke_on = p.holoduke_on; u |= (4096 + 8192); }
    if (sbar.jetpack_on != p.jetpack_on) { sbar.jetpack_on = p.jetpack_on; u |= (4096 + 8192); }
    if (sbar.heat_on != p.heat_on) { sbar.heat_on = p.heat_on; u |= (4096 + 8192); }
    if (sbar.firstaid_amount != p.firstaid_amount) { sbar.firstaid_amount = p.firstaid_amount; u |= 8192; }
    if (sbar.steroids_amount != p.steroids_amount) { sbar.steroids_amount = p.steroids_amount; u |= 8192; }
    if (sbar.holoduke_amount != p.holoduke_amount) { sbar.holoduke_amount = p.holoduke_amount; u |= 8192; }
    if (sbar.jetpack_amount != p.jetpack_amount) { sbar.jetpack_amount = p.jetpack_amount; u |= 8192; }
    if (sbar.heat_amount != p.heat_amount) { sbar.heat_amount = p.heat_amount; u |= 8192; }
    if (sbar.scuba_amount != p.scuba_amount) { sbar.scuba_amount = p.scuba_amount; u |= 8192; }
    if (sbar.boot_amount != p.boot_amount) { sbar.boot_amount = p.boot_amount; u |= 8192; }
    if (u == 0) return;

    //0 - update health
    //1 - update armor
    //2 - update PISTOL_WEAPON ammo
    //3 - update SHOTGUN_WEAPON ammo
    //4 - update CHAINGUN_WEAPON ammo
    //5 - update RPG_WEAPON ammo
    //6 - update HANDBOMB_WEAPON ammo
    //7 - update SHRINKER_WEAPON ammo
    //8 - update DEVISTATOR_WEAPON ammo
    //9 - update TRIPBOMB_WEAPON ammo
    //10 - update ammo display
    //11 - update inventory icon
    //12 - update inventory on/off
    //13 - update inventory %
    //14 - update keys
    //15 - update kills
    //16 - update FREEZE_WEAPON ammo

    if (u == (0xffffffff | 0)) {
        patchstatusbar(0, 0, 320, 200);
        if (ud.multimode > 1 && ud.coop != 1)
            rotateSprite(277 << 16, (200 - 27) << 16, 65536, 0, KILLSICON, 0, 0, 10 + 16 + 128, 0, 0, xdim - 1, ydim - 1);
    }
    if (ud.multimode > 1 && ud.coop != 1) {
        if (u & 32768) {
            if (u != (0xffffffff | 0)) patchstatusbar(276, 183, 299, 193);
            digitalnumber(287, 200 - 17, Math.max(p.frag - p.fraggedself, 0), -16, 10 + 16 + 128);
        }
    }
    else {
        if (u & 16384) {
            if (u != (0xffffffff | 0)) patchstatusbar(275, 182, 299, 194);
            if (p.got_access & 4) rotateSprite(275 << 16, 182 << 16, 65536, 0, ACCESS_ICON, 0, 23, 10 + 16 + 128, 0, 0, xdim - 1, ydim - 1);
            if (p.got_access & 2) rotateSprite(288 << 16, 182 << 16, 65536, 0, ACCESS_ICON, 0, 21, 10 + 16 + 128, 0, 0, xdim - 1, ydim - 1);
            if (p.got_access & 1) rotateSprite(281 << 16, 189 << 16, 65536, 0, ACCESS_ICON, 0, 0, 10 + 16 + 128, 0, 0, xdim - 1, ydim - 1);
        }
    }
    if (u & (4 + 8 + 16 + 32 + 64 + 128 + 256 + 512 + 65536)) weapon_amounts(p, 96, 182, u);

    if (u & 1) {
        if (u != (0xffffffff | 0)) patchstatusbar(20, 183, 43, 193);
        if (sprite[p.i].pal == 1 && p.last_extra < 2)
            digitalnumber(32, 200 - 17, 1, -16, 10 + 16 + 128);
        else digitalnumber(32, 200 - 17, p.last_extra, -16, 10 + 16 + 128);
    }
    if (u & 2) {
        if (u != (0xffffffff | 0)) patchstatusbar(52, 183, 75, 193);
        digitalnumber(64, 200 - 17, p.shield_amount, -16, 10 + 16 + 128);
    }

    if (u & 1024) {
        if (u != (0xffffffff | 0)) patchstatusbar(196, 183, 219, 193);
        if (p.curr_weapon != KNEE_WEAPON) {
            if (p.curr_weapon == HANDREMOTE_WEAPON) i = HANDBOMB_WEAPON; else i = p.curr_weapon;
            digitalnumber(230 - 22, 200 - 17, p.ammo_amount[i], -16, 10 + 16 + 128);
        }
    }
    if (u & (2048 + 4096 + 8192)) {
        if (u != (0xffffffff | 0)) {
            if (u & (2048 + 4096)) { patchstatusbar(231, 179, 265, 197); }
            else { patchstatusbar(250, 190, 261, 195); }
        }
        if (p.inven_icon) {
            o = 0; permbit = 128;

            if (u & (2048 + 4096)) {
                switch (p.inven_icon) {
                    case 1: i = FIRSTAID_ICON; break;
                    case 2: i = STEROIDS_ICON; break;
                    case 3: i = HOLODUKE_ICON; break;
                    case 4: i = JETPACK_ICON; break;
                    case 5: i = HEAT_ICON; break;
                    case 6: i = AIRTANK_ICON; break;
                    case 7: i = BOOT_ICON; break;
                }
                rotateSprite((231 - o) << 16, (200 - 21) << 16, 65536, 0, i, 0, 0, 10 + 16 + permbit, 0, 0, xdim - 1, ydim - 1);
                minitext(292 - 30 - o, 190, "%", 6, 10 + 16 + permbit);
                if (p.inven_icon >= 6) minitext(284 - 35 - o, 180, "AUTO", 2, 10 + 16 + permbit);
            }
            if (u & (2048 + 4096)) {
                switch (p.inven_icon) {
                    case 3: j = p.holoduke_on; break;
                    case 4: j = p.jetpack_on; break;
                    case 5: j = p.heat_on; break;
                    default: j = 0x80000000 | 0;
                }
                if (j > 0) minitext(288 - 30 - o, 180, "ON", 0, 10 + 16 + permbit);
                else if (j != (0x80000000 | 0)) minitext(284 - 30 - o, 180, "OFF", 2, 10 + 16 + permbit);
            }
            if (u & 8192) {
                switch (p.inven_icon) {
                    case 1: i = p.firstaid_amount; break;
                    case 2: i = ((p.steroids_amount + 3) >> 2); break;
                    case 3: i = ((p.holoduke_amount + 15) / 24) | 0; break;
                    case 4: i = ((p.jetpack_amount + 15) >> 4); break;
                    case 5: i = (p.heat_amount / 12) | 0; break;
                    case 6: i = ((p.scuba_amount + 63) >> 6); break;
                    case 7: i = (p.boot_amount >> 1); break;
                }
                invennum(284 - 30 - o, 200 - 6, i, 0, 10 + permbit);
            }
        }
    }
}

//var AVERAGEFRAMES = 16;
//static int32_t frameval[AVERAGEFRAMES], framecnt = 0;

function tics(offx, offy, color) {
    console.warn("todo!")
    //int32_t i;
    //char  fps[512], mapname[512];
    //int32_t currentFps;
    //static int32_t fpsAvg = 0, savedFps = 0;
    //static boolean toggle = true;
    //char text[512];

    //strcpy(mapname,boardfilename);
    //for(i=0;i<512;i++)
    //	if(mapname[i]=='.')
    //		mapname[i]=0;

    //if( mapname[0] != 0 && ud.m_level_number == 7 && ud.m_volume_number == 0 )
    //	sprintf(text, "%s", mapname);
    //else
    //	//sprintf(tempbuf, "%s", level_names[ud.volume_number*11 + ud.level_number]);
    //	sprintf(text, "e%dl%d", ud.volume_number+1, ud.level_number+1);


    //i = totalclock;

    //if (i != frameval[framecnt])
    //{
    //	currentFps = (TICRATE*AVERAGEFRAMES)/(i-frameval[framecnt]);
    //	fpsAvg = ((fpsAvg<<3)+(fpsAvg<<2) + (currentFps<<2))>>4;

    //	frameval[framecnt] = i;
    //}

    //framecnt = ((framecnt+1)&(AVERAGEFRAMES-1));

    //// refresh screen and update visible FPS. This is to allow a refresh
    //// of the screen when the screensize > 4 w/o compromising the FPS.
    //if(ud.screen_size>8)
    //	if ((totalclock%64) < 32)
    //	{
    //		if(toggle)
    //		{
    //			vscrn();
    //			savedFps = fpsAvg;
    //		}
    //		toggle = false;
    //	}
    //	else
    //	{
    //		toggle = true;
    //	}
    //else
    //	savedFps = fpsAvg;

    //sprintf(fps," %d", savedFps);
    //strcat(text, fps);

    //minitext(offx,offy,text,color,2+8+16+128);
}
//2238

function coords(snum) {
    var x = 200, y = 0;
    var text;
    // x = 250 is too much on the right and
    // will make the text going out of the screen 
    // if screen <= (320x200)
    // This will also *write beyond the video 
    // buffer limit* and will crash the game.

    if (ud.coop != 1) {
        if (ud.multimode > 1 && ud.multimode < 5)
            y = 8;
        else if (ud.multimode > 4)
            y = 16;
    }

    text = "X= " + ps[snum].posx;
    printext256(x, y, 31, -1, text, 1);
    text = "Y= " + ps[snum].posy;
    printext256(x, y + 7, 31, -1, text, 1);
    text = "Z= " + ps[snum].posz;
    printext256(x, y + 14, 31, -1, text, 1);
    text = "A= " + ps[snum].ang;
    printext256(x, y + 21, 31, -1, text, 1);
    text = "ZV= " + ps[snum].poszv;
    printext256(x, y + 28, 31, -1, text, 1);
    text = "OG= " + ps[snum].on_ground;
    printext256(x, y + 35, 31, -1, text, 1);
    text = "AM= " + ps[snum].ammo_amount[GROW_WEAPON];
    printext256(x, y + 43, 31, -1, text, 1);
    text = "LFW= " + ps[snum].last_full_weapon;
    printext256(x, y + 50, 31, -1, text, 1);
    text = "SECTL= " + sector[ps[snum].cursectnum].lotag;
    printext256(x, y + 57, 31, -1, text, 1);
    text = "SEED= " + randomseed;
    printext256(x, y + 64, 31, -1, text, 1);
    text = "THOLD= " + ps[snum].transporter_hold;
    printext256(x, y + 64 + 7, 31, -1, text, 1);
}

//2279
function operatefta() {
    var i, j, k;
    if (ud.screen_size > 0) j = 200 - 45; else j = 200 - 8;
    quotebot = Math.min(quotebot, j);
    quotebotgoal = Math.min(quotebotgoal, j);
    if (ps[myconnectindex].gm & MODE_TYPE) j -= 8;
    quotebotgoal = j; j = quotebot;
    for (i = 0; i < MAXUSERQUOTES; i++) {
        k = user_quote_time[i]; if (k <= 0) break;

        if (k > 4)
            gametext(320 >> 1, j, user_quote[i], 0, 2 + 8 + 16);
        else if (k > 2) gametext(320 >> 1, j, user_quote[i], 0, 2 + 8 + 16 + 1);
        else gametext(320 >> 1, j, user_quote[i], 0, 2 + 8 + 16 + 1 + 32);
        j -= 8;
    }

    if (ps[screenpeek].fta <= 1) return;

    if (ud.coop != 1 && ud.screen_size > 0 && ud.multimode > 1) {
        j = 0; k = 8;
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (i > j) j = i;

        if (j >= 4 && j <= 8) k += 8;
        else if (j > 8 && j <= 12) k += 16;
        else if (j > 12) k += 24;
    }
    else k = 0;

    if (ps[screenpeek].ftq == 115 || ps[screenpeek].ftq == 116) {
        k = quotebot;
        for (i = 0; i < MAXUSERQUOTES; i++) {
            if (user_quote_time[i] <= 0) break;
            k -= 8;
        }
        k -= 4;
    }

    j = ps[screenpeek].fta;
    if (j > 4)
        gametext(320 >> 1, k, fta_quotes[ps[screenpeek].ftq], 0, 2 + 8 + 16);
    else
        if (j > 2) gametext(320 >> 1, k, fta_quotes[ps[screenpeek].ftq], 0, 2 + 8 + 16 + 1);
        else
            gametext(320 >> 1, k, fta_quotes[ps[screenpeek].ftq], 0, 2 + 8 + 16 + 1 + 32);
}

//2333
function FTA(q, p, mode) {
    if (ud.fta_on === 1 || mode) {
        if (p.fta > 0 && q != 115 && q !== 116)
            if (p.ftq === 115 || p.ftq === 116) return;

        p.fta = 100;

        if (p.ftq !== q || q === 26)
            // || q == 26 || q == 115 || q ==116 || q == 117 || q == 122 )
        {
            p.ftq = q;
            pub = NUMPAGES;
            pus = NUMPAGES;
        }
    }
}

//2410
function gameexit(msg) {
    var t = msg, tIdx = 0;

    if(t) ps[myconnectindex].palette = /*(uint8_t  *) &*/palette[0];

    if(numplayers > 1)
        allowtimetocorrecterrorswhenquitting();

    if(ud.recstat == 1)
        closedemowrite();

    if(frecfilep)
    {
        fclose(frecfilep);
        frecfilep = null;
    }

    if(qe || cp)
        throw "goto GOTOHERE;"

    // FIX_00089: scoreboard not shown for last player who quits a DM. Only 19.7 affected. (Sarah)
    if( ud.m_recstat != 2 && ud.last_level >= 0 && playerswhenstarted > 1 && ud.coop != 1 && t[tIdx] == ' ')
    {
        dobonus(1);
        // CTW - MODIFICATION
        //      setgamemode();
        // FIX_00028: No need to call the videodriver on gameexit()
        //		setgamemode(ScreenMode,ScreenWidth,ScreenHeight);
        // CTW END - MODIFICATION
    }

    if(playerswhenstarted > 1)
        uninitmultiplayers();  /* deinits network transport. */

    // CTW - MODIFICATION
    /*  if( *t != 0 && *(t+1) != 'V' && *(t+1) != 'Y' && playonten == 0 )
            showtwoscreens();*/
    if (t && t[tIdx + 1] != 'V' && t[tIdx + 1] != 'Y' && true)
        if(ud.showcinematics) // FIX_00029: toggle cinematics on / off
            showtwoscreens(); //todo: will have to by async
    // CTW END - MODIFICATION

    //GOTOHERE:

        Shutdown();

    if(t[tIdx])
    {
        setvmode(0x3);
        
        // CTW - MODIFICATION
        /*      if(playonten == 0)
                {
                    if(*t == ' ' && *(t+1) == 0) *t = 0;
                    printf("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
                    printf("%s%s","\n",t);
                }*/
        if(true)
        {
            //if(*t == ' ' && *(t+1) == 0) *t = 0;
            //#if PLATFORM_DOS   // Is there a good reason for this? --ryan.
            //    printf("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
            //#else
            //    printf("\n%s",t);
            //#endif
        }
        // CTW END - MODIFICATION        
    }

    uninitgroupfile();

    unlink("duke3d.tmp");
	
    Error(EXIT_SUCCESS, "");
}


//2680
function moveclouds() {
    if (totalclock > cloudtotalclock || totalclock < (cloudtotalclock - 7)) {
        var i;

        cloudtotalclock = totalclock + 6;

        for (i = 0; i < numclouds; i++) {
            cloudx[i] += (sintable[(ps[screenpeek].ang + 512) & 2047] >> 9);
            cloudy[i] += (sintable[ps[screenpeek].ang & 2047] >> 9);

            sector[clouds[i]].ceilingxpanning = cloudx[i] >> 6;
            sector[clouds[i]].ceilingypanning = cloudy[i] >> 6;
        }
    }
}

//2700
function displayrest(smoothratio) {
    var a, i, j;

    var pp;
    var wal;
    var cposx, cposy, cang;

    pp = ps[screenpeek];


    if (ud.show_help) {
        switch (ud.show_help) {
            case 1:
                rotateSprite(0, 0, 65536, 0, TEXTSTORY, 0, 0, 10 + 16 + 64, 0, 0, xdim - 1, ydim - 1);
                break;
            case 2:
                rotateSprite(0, 0, 65536, 0, F1HELP, 0, 0, 10 + 16 + 64, 0, 0, xdim - 1, ydim - 1);
                break;
        }

        if (KB.keyPressed(sc_Escape)) {
            KB.clearKeyDown(sc_Escape);
            ud.show_help = 0;
            if (ud.multimode < 2 && ud.recstat != 2) {
                ready2send = 1;
                totalclock = ototalclock;
            }
            vscrn();
        }
        return;
    }

    i = pp.cursectnum;

    show2dsector[i >> 3] |= (1 << (i & 7));
    var walIdx = sector[i].wallptr;
    wal = wall[walIdx];
    for (j = sector[i].wallnum; j > 0; j--, wal = wall[++walIdx]) {
        i = wal.nextsector;
        if (i < 0) continue;
        if (wal.cstat & 0x0071) continue;
        if (wall[wal.nextwall].cstat & 0x0071) continue;
        if (sector[i].lotag == 32767) continue;
        if (sector[i].ceilingz >= sector[i].floorz) continue;
        show2dsector[i >> 3] |= (1 << (i & 7));
    }

    if (ud.camerasprite == -1) {
        if (ud.overhead_on != 2) {
            if (pp.newowner >= 0)
                cameratext(pp.newowner);
            else {
                displayweapon(screenpeek);
                if (pp.over_shoulder_on == 0)
                    displaymasks(screenpeek);
            }
            moveclouds();
        }

        if (ud.overhead_on > 0) {
            smoothratio = Math.min(Math.max(smoothratio, 0), 65536);
            dointerpolations(smoothratio);
            if (ud.scrollmode == 0) {
                if (pp.newowner == -1) {
                    if (screenpeek == myconnectindex && numplayers > 1) {
                        cposx = omyx + mulscale16((myx - omyx)|0, smoothratio);
                        cposy = omyy + mulscale16((myy - omyy)|0, smoothratio);
                        cang = omyang + mulscale16((((myang + 1024 - omyang) & 2047) - 1024)|0, smoothratio);
                    }
                    else {
                        cposx = pp.oposx + mulscale16((pp.posx - pp.oposx)|0, smoothratio);
                        cposy = pp.oposy + mulscale16((pp.posy - pp.oposy)|0, smoothratio);
                        cang = pp.oang + mulscale16((((pp.ang + 1024 - pp.oang) & 2047) - 1024)|0, smoothratio);
                    }
                }
                else {
                    cposx = pp.oposx;
                    cposy = pp.oposy;
                    cang = pp.oang;
                }
            }
            else {

                ud.fola += ud.folavel >> 3;
                ud.folx += (ud.folfvel * sintable[(512 + 2048 - ud.fola) & 2047]) >> 14;
                ud.foly += (ud.folfvel * sintable[(512 + 1024 - 512 - ud.fola) & 2047]) >> 14;

                cposx = ud.folx;
                cposy = ud.foly;
                cang = ud.fola;
            }

            if (ud.overhead_on == 2) {
                clearView(0);
                drawmapview(cposx, cposy, pp.zoom, cang);
            }
            drawoverheadmap(cposx, cposy, pp.zoom, cang);

            restoreinterpolations();

            if (ud.overhead_on == 2) {
                if (ud.screen_size > 0) a = 147;
                else a = 182;

                minitext(1, a + 6, volume_names[ud.volume_number], 0, 2 + 8 + 16);
                minitext(1, a + 12, level_names[ud.volume_number * 11 + ud.level_number], 0, 2 + 8 + 16);
            }
        }
    }

    coolgaugetext(screenpeek);
    operatefta();

    if (KB.keyPressed(sc_Escape) && ud.overhead_on == 0
		&& ud.show_help == 0
		&& ps[myconnectindex].newowner == -1) {
        if ((ps[myconnectindex].gm & MODE_MENU) != MODE_MENU &&
			ps[myconnectindex].newowner == -1 &&
			(ps[myconnectindex].gm & MODE_TYPE) != MODE_TYPE) {
            KB.clearKeyDown(sc_Escape);
            FX.stopAllSounds();
            clearsoundlocks();

            intomenusounds();

            ps[myconnectindex].gm |= MODE_MENU;

            if (ud.multimode < 2 && ud.recstat != 2) ready2send = 0;

            if (ps[myconnectindex].gm & MODE_GAME) cmenu(50);
            else cmenu(0);
            screenpeek = myconnectindex;
        }
    }

    if (ps[myconnectindex].newowner == -1 && ud.overhead_on == 0 && ud.crosshair && ud.camerasprite == -1)
        rotateSprite((160 - (ps[myconnectindex].look_ang >> 1)) << 16, 100 << 16, 65536, 0, CROSSHAIR, 0, 0, 2 + 1, windowx1, windowy1, windowx2, windowy2);

    if (ps[myconnectindex].gm & MODE_TYPE)
        typemode();
    else {
        Console.handleInput();
        if (!Console.isActive()) {
            menus();
        }
        Console.render();
    }

    if (ud.pause_on == 1 && (ps[myconnectindex].gm & MODE_MENU) == 0) {
        if (!Console.isActive()) //Addfaz Console Pause Game line addition 
        {
            menutext(160, 100, 0, 0, "GAME PAUSED");
        }
        else {
            menutext(160, 120, 0, 0, "GAME PAUSED");
        }
    }

    if (ud.coords)
        coords(screenpeek);

    // FIX_00085: Optimized Video driver. FPS increases by +20%.
    if (pp.pals_time > 0 && pp.loogcnt == 0) {
        palto(pp.pals[0],
			pp.pals[1],
			pp.pals[2],
			pp.pals_time | 128);

        restorepalette = 1;
    }
    else if (restorepalette) {
        setBrightness(ud.brightness >> 2, pp.palette);
        restorepalette = 0;
    }
    else if (pp.loogcnt > 0) palto(0, 64, 0, (pp.loogcnt >> 1) + 128);
}

//3001
Game.drawBackground = function drawbackground() {
    var dapicnum;
    var x, y, x1, y1, x2, y2;

    flushperms();

    switch (ud.m_volume_number) {
        default: dapicnum = BIGHOLE; break;
        case 1: dapicnum = BIGHOLE; break;
        case 2: dapicnum = BIGHOLE; break;
    }

    y1 = 0; y2 = ydim;
    if (ready2send || ud.recstat == 2) {
        if (ud.coop != 1) {
            if (ud.multimode > 1) y1 += scale(ydim, 8, 200);
            if (ud.multimode > 4) y1 += scale(ydim, 8, 200);
        }
        if (ud.screen_size >= 8) y2 = scale(ydim, 200 - 34, 200);
    }

    for (y = y1; y < y2; y += 128)
        for (x = 0; x < xdim; x += 128)
            rotateSprite(x << 16, y << 16, 65536, 0, dapicnum, 8, 0, 8 + 16 + 64 + 128, 0, y1, xdim - 1, y2 - 1);

    // FIX_00081: Screen border in menu
    if (ud.screen_size > 8 && (ps[myconnectindex].gm & MODE_GAME || ud.recstat == 2)) // ud.recstat == 2 => playing demo
    {
        y = 0;
        if (ud.coop != 1) {
            if (ud.multimode > 1) y += 8;
            if (ud.multimode > 4) y += 8;
        }

        x1 = Math.max(windowx1 - 4, 0);
        y1 = Math.max(windowy1 - 4, y);
        x2 = Math.min(windowx2 + 4, xdim - 1);
        y2 = Math.min(windowy2 + 4, scale(ydim, 200 - 34, 200) - 1);

        for (y = y1 + 4; y < y2 - 4; y += 64) {
            rotateSprite(x1 << 16, y << 16, 65536, 0, VIEWBORDER, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
            rotateSprite((x2 + 1) << 16, (y + 64) << 16, 65536, 1024, VIEWBORDER, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
        }

        for (x = x1 + 4; x < x2 - 4; x += 64) {
            rotateSprite((x + 64) << 16, y1 << 16, 65536, 512, VIEWBORDER, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
            rotateSprite(x << 16, (y2 + 1) << 16, 65536, 1536, VIEWBORDER, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
        }

        rotateSprite(x1 << 16, y1 << 16, 65536, 0, VIEWBORDER + 1, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
        rotateSprite((x2 + 1) << 16, y1 << 16, 65536, 512, VIEWBORDER + 1, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
        rotateSprite((x2 + 1) << 16, (y2 + 1) << 16, 65536, 1024, VIEWBORDER + 1, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
        rotateSprite(x1 << 16, (y2 + 1) << 16, 65536, 1536, VIEWBORDER + 1, 0, 0, 8 + 16 + 64 + 128, x1, y1, x2, y2);
    }
};

//3205
Game.se40code = function (x, y, z, a, h, smoothratio) {
    var i = headspritestat[15];
    while (i >= 0) {
        switch (sprite[i].lotag) {
            //            case 40:
            //            case 41:
            //                SE40_Draw(i,x,y,a,smoothratio);
            //                break;
            case 42:
            case 43:
            case 44:
            case 45:
                if (ps[screenpeek].cursectnum === sprite[i].sectnum)
                    SE40_Draw(i, x, y, z, a, h, smoothratio);
                break;
        }
        i = nextspritestat[i];
    }
};

//3229
var oyrepeat = -1;
var displayrooms = Game.displayRooms = function (snum, smoothratio) {
    var cposx, cposy, cposz, dst, j, fz, cz;
    var sect, cang, k, choriz;
    var p;
    var tposx, tposy, i;
    var tang;

    p = ps[snum];
    printf("displayrooms snum: %i, p.posx: %i, p.posy: %i, p.posz: %i\n", snum, p.posx, p.posy, p.posz);
    printf("sector[305].ceilingz:% i\n", sector[305].ceilingz);

    if (pub > 0) {
        if (ud.screen_size > 8) {
            Game.drawBackground();
        }

        pub = 0;
    }

    if (ud.overhead_on == 2 || ud.show_help || p.cursectnum == -1) {
        return;
    }

    smoothratio = Math.min(Math.max(smoothratio, 0), 65536);

    visibility = p.visibility;

    if (ud.pause_on || ps[snum].on_crane > -1) {
        smoothratio = 65536;
    }

    sect = p.cursectnum;
    if (sect < 0 || sect >= MAXSECTORS) {
        return;
    }

    dointerpolations(smoothratio);

    Sector.animateCamSprite();

    if (ud.camerasprite >= 0) {
        throw "todo"
    } else {
        i = divscale22(1, sprite[p.i].yrepeat + 28);
        if (i != oyrepeat) {
            oyrepeat = i;
            //printf("1: %d %d\n", oyrepeat,yxaspect);
            setAspect(oyrepeat, yxaspect);
            //printf("2: %d %d\n", oyrepeat,yxaspect);
        }

        if (screencapt) {
            tiles[MAXTILES - 1].lock = 254;
            if (!tiles[MAXTILES - 1].data)
                allocache(tiles[MAXTILES - 1].data, 100 * 160, tiles[MAXTILES - 1].lock);

            setviewtotile(MAXTILES - 1, 100, 160);
        }
        else if ((ud.screen_tilting && p.rotscrnang) || ud.detail == 0) {
            if (ud.screen_tilting) tang = p.rotscrnang; else tang = 0;

            tiles[MAXTILES - 2].lock = 255;
            if (!tiles[MAXTILES - 2].data)
                allocache(tiles[MAXTILES - 2].data, 320 * 320, tiles[MAXTILES - 2].lock);
            if ((tang & 1023) == 0)
                setviewtotile(MAXTILES - 2, 200 >> (1 - ud.detail), 320 >> (1 - ud.detail));
            else
                setviewtotile(MAXTILES - 2, 320 >> (1 - ud.detail), 320 >> (1 - ud.detail));
            if ((tang & 1023) == 512) {     //Block off unscreen section of 90ø tilted screen
                j = ((320 - 60) >> (1 - ud.detail));
                for (i = (60 >> (1 - ud.detail)) - 1; i >= 0; i--) {
                    startumost[i] = 1; startumost[i + j] = 1;
                    startdmost[i] = 0; startdmost[i + j] = 0;
                }
            }

            i = (tang & 511); if (i > 256) i = 512 - i;
            i = sintable[i + 512] * 8 + sintable[i] * 5;
            setAspect(i >> 1, yxaspect);
        }
        if ((snum == myconnectindex) && (numplayers > 1)) {
            cposx = omyx + mulscale16((myx - omyx), smoothratio);
            cposy = omyy + mulscale16((myy - omyy), smoothratio);
            cposz = omyz + mulscale16((myz - omyz), smoothratio);
            cang = omyang + mulscale16((((myang + 1024 - omyang) & 2047) - 1024), smoothratio);
            choriz = omyhoriz + omyhorizoff + mulscale16((myhoriz + myhorizoff - omyhoriz - omyhorizoff), smoothratio);
            sect = mycursectnum;
        } else {
            cposx = p.oposx + mulscale16((p.posx - p.oposx), smoothratio);
            cposy = p.oposy + mulscale16((p.posy - p.oposy), smoothratio);
            cposz = p.oposz + mulscale16((p.posz - p.oposz), smoothratio);
            cang = p.oang + mulscale16((((p.ang + 1024 - p.oang) & 2047) - 1024), smoothratio);
            choriz = p.ohoriz + p.ohorizoff + mulscale16((p.horiz + p.horizoff - p.ohoriz - p.ohorizoff), smoothratio);
        }
        cang += p.look_ang;

        if (p.newowner >= 0) {
            cang = p.ang + p.look_ang;
            choriz = p.horiz + p.horizoff;
            cposx = p.posx;
            cposy = p.posy;
            cposz = p.posz;
            sect = sprite[p.newowner].sectnum;
            smoothratio = 65536;
        }
        else if (p.over_shoulder_on == 0) {
            cposz += p.opyoff + mulscale16((p.pyoff - p.opyoff), smoothratio);
        } else {
            throw "todo"
            //view(p,&cposx,&cposy,&cposz,&sect,cang,choriz);
        }

        printf("snum: %i, cposx: %i, cposy: %i, cposz: %i\n", snum, cposx, cposy, cposz);

        cz = hittype[p.i].ceilingz;
        fz = hittype[p.i].floorz;

        if (earthquaketime > 0 && p.on_ground == 1) {
            cposz += 256 - (((earthquaketime) & 1) << 9);
            cang += (2 - ((earthquaketime) & 2)) << 2;
        }

        if (sprite[p.i].pal == 1) cposz -= (18 << 8);

        if (p.newowner >= 0)
            choriz = 100 + sprite[p.newowner].shade;
        else if (p.spritebridge == 0) {
            if (cposz < (p.truecz + (4 << 8))) cposz = cz + (4 << 8);
            else if (cposz > (p.truefz - (4 << 8))) cposz = fz - (4 << 8);
        }

        if (sect >= 0) {
            var czRef = new Ref(cz);
            var fzRef = new Ref(fz);
            getzsofslope(sect, cposx, cposy, czRef, fzRef);
            cz = czRef.$;
            fz = fzRef.$;
            if (cposz < cz + (4 << 8)) cposz = cz + (4 << 8);
            if (cposz > fz - (4 << 8)) cposz = fz - (4 << 8);
        }

        if (choriz > 299) choriz = 299;
        else if (choriz < -99) choriz = -99;

        Game.se40code(cposx, cposy, cposz, cang, choriz, smoothratio);

        if ((gotpic[MIRROR >> 3] & (1 << (MIRROR & 7))) > 0) {
            dst = 0x7fffffff;
            i = 0;
            for (k = 0; k < mirrorcnt; k++) {
                j = klabs(wall[mirrorwall[k]].x - cposx);
                j += klabs(wall[mirrorwall[k]].y - cposy);
                if (j < dst) dst = j, i = k;
            }

            if (wall[mirrorwall[i]].overpicnum == MIRROR) {
                var tposxRef = new Ref(tposx),
                    tposyRef = new Ref(tposy),
                    tangRef = new Ref(tang);
                preparemirror(cposx, cposy, cposz, cang, choriz, mirrorwall[i], mirrorsector[i], tposxRef, tposyRef, tangRef);
                tposx = tposxRef.$;
                tposy = tposyRef.$;
                tang = tangRef.$;

                j = visibility;
                visibility = (j >> 1) + (j >> 2);

                drawrooms(tposx, tposy, cposz, tang, choriz, mirrorsector[i] + MAXSECTORS);

                display_mirror = 1;
                animatesprites(tposx, tposy, tang, smoothratio);
                display_mirror = 0;

                drawmasks();
                completemirror(); //Reverse screen x-wise in this function
                visibility = j;
            }
        }

        //todo check drawrooms
        drawrooms(cposx, cposy, cposz, cang, choriz, sect);
        printf("b4 animatesprites tsprite[1].picnum: %i\n", tsprite[1].picnum);
        animatesprites(cposx, cposy, cang, smoothratio);
        printf("after animatesprites tsprite[1].picnum: %i\n", tsprite[1].picnum);
        drawmasks();

        if (screencapt === 1) {
            setviewback();
            tiles[MAXTILES - 1].lock = 1;
            screencapt = 0;
        }
        else if ((ud.screen_tilting && p.rotscrnang) || ud.detail == 0) {
            if (ud.screen_tilting) tang = p.rotscrnang; else tang = 0;
            setviewback();
            tiles[MAXTILES - 2].animFlags &= 0xff0000ff;
            i = (tang & 511); if (i > 256) i = 512 - i;
            i = sintable[i + 512] * 8 + sintable[i] * 5;
            if ((1 - ud.detail) == 0) i >>= 1;
            rotateSprite(160 << 16, 100 << 16, i, tang + 512, MAXTILES - 2, 0, 0, 4 + 2 + 64, windowx1, windowy1, windowx2, windowy2);
            tiles[MAXTILES - 2].lock = 199;
        }
    }

    // 
    restoreinterpolations();

    if (totalclock < lastvisinc) {
        if (klabs(p.visibility - ud.const_visibility) > 8)
            p.visibility += (ud.const_visibility - p.visibility) >> 2;
    }
    else p.visibility = ud.const_visibility;
};

//3464
function LocateTheLocator(n, sn) {
    var i;

    i = headspritestat[7];
    while (i >= 0) {
        if ((sn == -1 || sn == sprite[i].sectnum) && n == sprite[i].lotag)
            return i;
        i = nextspritestat[i];
    }
    return -1;
}

//3472
//.split(",").reverse().join()
// c evaluates right to left, where as javascript is left to right. so multiple krand() breaks
function EGS_arg_swap(s_ss, s_ow, s_zv, s_ve, s_a, s_yr, s_xr, s_s, s_pn, s_z, s_y, s_x, whatsect) {
    return EGS(whatsect, s_x, s_y, s_z, s_pn, s_s, s_xr, s_yr, s_a, s_ve, s_zv, s_ow, s_ss);
}

function EGS(whatsect, s_x, s_y, s_z, s_pn, s_s, s_xr, s_yr, s_a, s_ve, s_zv, s_ow, s_ss) {
    var i;
    var s;
    
    printf("EGS whatsect: %i, s_x: %i, s_y: %i, s_z: %i, s_pn: %i,  s_s: %i, s_xr: %i, s_yr: %i, s_a: %i, s_ve: %i, s_zv: %i, ,s_ow: %i, s_ss: %i\n",
		 whatsect, s_x, s_y, s_z, s_pn, s_s, s_xr, s_yr, s_a, s_ve, s_zv, s_ow, s_ss);

    i = Engine.insertSprite(whatsect, s_ss);

    if (i < 0)
        throw new Error(" Too many sprites spawned. This may happen (for any duke port) if you have hacked the steroids trail in the *.con files. If so, delete your *.con files to use the internal ones and try again.");

    hittype[i].bposx = s_x;
    hittype[i].bposy = s_y;
    hittype[i].bposz = s_z;

    s = sprite[i];

    s.x = s_x;
    s.y = s_y;
    s.z = s_z;
    s.cstat = 0;
    s.picnum = s_pn;
    s.shade = s_s;
    s.xrepeat = s_xr;
    s.yrepeat = s_yr;
    s.pal = 0;

    s.ang = s_a;
    s.xvel = s_ve;
    s.zvel = s_zv;
    s.owner = s_ow;
    s.xoffset = 0;
    s.yoffset = 0;
    s.yvel = 0;
    s.clipdist = 0;
    s.pal = 0;
    s.lotag = 0;

    hittype[i].picnum = sprite[s_ow].picnum;

    hittype[i].lastvx = 0;
    hittype[i].lastvy = 0;

    hittype[i].timetosleep = 0;
    hittype[i].actorstayput = -1;
    hittype[i].extra = -1;
    hittype[i].owner = s_ow;
    hittype[i].cgg = 0;
    hittype[i].movflag = 0;
    hittype[i].tempang = 0;
    hittype[i].dispicnum = 0;
    hittype[i].floorz = hittype[s_ow].floorz;
    hittype[i].ceilingz = hittype[s_ow].ceilingz;

    hittype[i].temp_data[0] = hittype[i].temp_data[2] = hittype[i].temp_data[3] = hittype[i].temp_data[5] = 0;
    if (actorscrptr[s_pn]) {
        s.extra = script[actorscrptr[s_pn]];
        hittype[i].temp_data[4] = script[actorscrptr[s_pn] + 1];
        hittype[i].temp_data[1] = script[actorscrptr[s_pn] + 2];
        s.hitag = script[actorscrptr[s_pn] + 3];
    }
    else {
        hittype[i].temp_data[1] = hittype[i].temp_data[4] = 0;
        s.extra = 0;
        s.hitag = 0;
    }

    if (show2dsector[sprite[i].sectnum >> 3] & (1 << (sprite[i].sectnum & 7))) {
        show2dsprite[i >> 3] |= (1 << (i & 7));
    } else {
        show2dsprite[i >> 3] &= ~(1 << (i & 7));
    }
    /*
        if(s.sectnum < 0)
        {
            s.xrepeat = s.yrepeat = 0;
            changespritestat(i,5);
        }
    */
    return (i);
}

//3552
Game.wallSwitchCheck = function (i) {
    switch (sprite[i].picnum) {
        case HANDPRINTSWITCH:
        case HANDPRINTSWITCH + 1:
        case ALIENSWITCH:
        case ALIENSWITCH + 1:
        case MULTISWITCH:
        case MULTISWITCH + 1:
        case MULTISWITCH + 2:
        case MULTISWITCH + 3:
        case ACCESSSWITCH:
        case ACCESSSWITCH2:
        case PULLSWITCH:
        case PULLSWITCH + 1:
        case HANDSWITCH:
        case HANDSWITCH + 1:
        case SLOTDOOR:
        case SLOTDOOR + 1:
        case LIGHTSWITCH:
        case LIGHTSWITCH + 1:
        case SPACELIGHTSWITCH:
        case SPACELIGHTSWITCH + 1:
        case SPACEDOORSWITCH:
        case SPACEDOORSWITCH + 1:
        case FRANKENSTINESWITCH:
        case FRANKENSTINESWITCH + 1:
        case LIGHTSWITCH2:
        case LIGHTSWITCH2 + 1:
        case POWERSWITCH1:
        case POWERSWITCH1 + 1:
        case LOCKSWITCH1:
        case LOCKSWITCH1 + 1:
        case POWERSWITCH2:
        case POWERSWITCH2 + 1:
        case DIPSWITCH:
        case DIPSWITCH + 1:
        case DIPSWITCH2:
        case DIPSWITCH2 + 1:
        case TECHSWITCH:
        case TECHSWITCH + 1:
        case DIPSWITCH3:
        case DIPSWITCH3 + 1:
            return 1;
    }
    return 0;
};

//3566

function wallswitchcheck(i) {
    switch (sprite[i].picnum) {
        case HANDPRINTSWITCH:
        case HANDPRINTSWITCH + 1:
        case ALIENSWITCH:
        case ALIENSWITCH + 1:
        case MULTISWITCH:
        case MULTISWITCH + 1:
        case MULTISWITCH + 2:
        case MULTISWITCH + 3:
        case ACCESSSWITCH:
        case ACCESSSWITCH2:
        case PULLSWITCH:
        case PULLSWITCH + 1:
        case HANDSWITCH:
        case HANDSWITCH + 1:
        case SLOTDOOR:
        case SLOTDOOR + 1:
        case LIGHTSWITCH:
        case LIGHTSWITCH + 1:
        case SPACELIGHTSWITCH:
        case SPACELIGHTSWITCH + 1:
        case SPACEDOORSWITCH:
        case SPACEDOORSWITCH + 1:
        case FRANKENSTINESWITCH:
        case FRANKENSTINESWITCH + 1:
        case LIGHTSWITCH2:
        case LIGHTSWITCH2 + 1:
        case POWERSWITCH1:
        case POWERSWITCH1 + 1:
        case LOCKSWITCH1:
        case LOCKSWITCH1 + 1:
        case POWERSWITCH2:
        case POWERSWITCH2 + 1:
        case DIPSWITCH:
        case DIPSWITCH + 1:
        case DIPSWITCH2:
        case DIPSWITCH2 + 1:
        case TECHSWITCH:
        case TECHSWITCH + 1:
        case DIPSWITCH3:
        case DIPSWITCH3 + 1:
            return 1;
    }
    return 0;
}


//3608
var tempwallptr;

function spawn(j, pn) {
    var i = 0, s = 0, startwall = 0, endwall = 0, sect = 0, clostest = 0;
    var x = 0, y = 0, d = 0;
    var sp;
    var text = "";

    //printf("spawn j: %i, pn: %i\n", j, pn);
    if (j >= 0) {
        i = EGS(sprite[j].sectnum, sprite[j].x, sprite[j].y, sprite[j].z
            , pn, 0, 0, 0, 0, 0, 0, j, 0);
        hittype[i].picnum = sprite[j].picnum;
    } else {
        i = pn;

        hittype[i].picnum = sprite[i].picnum;
        hittype[i].timetosleep = 0;
        hittype[i].extra = -1;

        hittype[i].bposx = sprite[i].x;
        hittype[i].bposy = sprite[i].y;
        hittype[i].bposz = sprite[i].z;

        sprite[i].owner = hittype[i].owner = i;
        hittype[i].cgg = 0;
        hittype[i].movflag = 0;
        hittype[i].tempang = 0;
        hittype[i].dispicnum = 0;
        hittype[i].floorz = sector[sprite[i].sectnum].floorz;
        hittype[i].ceilingz = sector[sprite[i].sectnum].ceilingz;

        hittype[i].lastvx = 0;
        hittype[i].lastvy = 0;
        hittype[i].actorstayput = -1;

        hittype[i].temp_data[0] = hittype[i].temp_data[1] = hittype[i].temp_data[2] = hittype[i].temp_data[3] = hittype[i].temp_data[4] = hittype[i].temp_data[5] = 0;

        if (sprite[i].picnum != SPEAKER && sprite[i].picnum != LETTER && sprite[i].picnum != DUCK && sprite[i].picnum != TARGET && sprite[i].picnum != TRIPBOMB && sprite[i].picnum != VIEWSCREEN && sprite[i].picnum != VIEWSCREEN2 && (sprite[i].cstat & 48))
            if (!(sprite[i].picnum >= CRACK1 && sprite[i].picnum <= CRACK4)) {
                if (sprite[i].shade === 127) {
                    return i;
                }
                if (Game.wallSwitchCheck(i) === 1 && (sprite[i].cstat & 16)) {
                    if (sprite[i].picnum != ACCESSSWITCH && sprite[i].picnum != ACCESSSWITCH2 && sprite[i].pal) {
                        if ((ud.multimode < 2) || (ud.multimode > 1 && ud.coop === 1)) {
                            sprite[i].xrepeat = sprite[i].yrepeat = 0;
                            sprite[i].cstat = sprite[i].lotag = sprite[i].hitag = 0;
                            return i;
                        }
                    }
                    sprite[i].cstat |= 257;
                    if (sprite[i].pal && sprite[i].picnum != ACCESSSWITCH && sprite[i].picnum != ACCESSSWITCH2)
                        sprite[i].pal = 0;
                    return i;
                }

                if (sprite[i].hitag) {
                    changespritestat(i, 12);
                    sprite[i].cstat |= 257;
                    sprite[i].extra = impact_damage;
                    return i;
                }
            }

        s = sprite[i].picnum;

        if (sprite[i].cstat & 1) sprite[i].cstat |= 256;

        if (actorscrptr[s]) {
            // script/actorscrptr is set originally in gamedefs
            sprite[i].extra = script[actorscrptr[s]]; //sprite[i].extra = *(actorscrptr[s]);
            hittype[i].temp_data[4] = script[actorscrptr[s] + 1]; // *(actorscrptr[s]+1);
            hittype[i].temp_data[1] = script[actorscrptr[s] + 2]; // *(actorscrptr[s]+2);
            if (script[actorscrptr[s] + 3] && sprite[i].hitag === 0) {
                sprite[i].hitag = script[actorscrptr[s] + 3]; //*(actorscrptr[s]+3);
            }
        } else {
            hittype[i].temp_data[1] = hittype[i].temp_data[4] = 0;
        }
    }

    sp = sprite[i];
    sect = sp.sectnum;

    switch (sp.picnum) {
        default:
            // actorscrptr[sp.picnum] points to script[actorscrptr[sp.picnum]]
            if (actorscrptr[sp.picnum]) {
                if (j == -1 && sp.lotag > ud.player_skill) {
                    sp.xrepeat = sp.yrepeat = 0;
                    changespritestat(i, 5);
                    break;
                }

                //  Init the size
                if (sp.xrepeat == 0 || sp.yrepeat == 0)
                    sp.xrepeat = sp.yrepeat = 1;

                if (actortype[sp.picnum] & 3) {
                    if (ud.monsters_off == 1) {
                        sp.xrepeat = sp.yrepeat = 0;
                        changespritestat(i, 5);
                        break;
                    }

                    makeitfall(i);

                    if (actortype[sp.picnum] & 2)
                        hittype[i].actorstayput = sp.sectnum;

                    ps[myconnectindex].max_actors_killed++;
                    sp.clipdist = 80;
                    if (j >= 0) {
                        if (sprite[j].picnum == RESPAWN)
                            hittype[i].tempang = sprite[i].pal = sprite[j].pal;
                        changespritestat(i, 1);
                    }
                    else changespritestat(i, 2);
                }
                else {
                    sp.clipdist = 40;
                    sp.owner = i;
                    changespritestat(i, 1);
                }

                hittype[i].timetosleep = 0;

                if (j >= 0)
                    sp.ang = sprite[j].ang;
            }
            break;
        case FOF:
            sp.xrepeat = sp.yrepeat = 0;
            changespritestat(i, 5);
            break;
        case WATERSPLASH2:
            if (j >= 0) {
                setsprite(i, sprite[j].x, sprite[j].y, sprite[j].z);
                sp.xrepeat = sp.yrepeat = 8 + (krand() & 7);
            }
            else sp.xrepeat = sp.yrepeat = 16 + (krand() & 15);

            sp.shade = -16;
            sp.cstat |= 128;
            if (j >= 0) {
                if (sector[sprite[j].sectnum].lotag == 2) {
                    sp.z = getceilzofslope(sprite[i].sectnum, sprite[i].x, sprite[i].y) + (16 << 8);
                    sp.cstat |= 8;
                }
                else if (sector[sprite[j].sectnum].lotag == 1)
                    sp.z = getflorzofslope(sprite[i].sectnum, sprite[i].x, sprite[i].y);
            }

            if (sector[sect].floorpicnum == FLOORSLIME ||
                sector[sect].ceilingpicnum == FLOORSLIME)
                sp.pal = 7;
        case NEON1:
        case NEON2:
        case NEON3:
        case NEON4:
        case NEON5:
        case NEON6:
        case DOMELITE:
            if (sp.picnum !== WATERSPLASH2)
                sp.cstat |= 257;
        case NUKEBUTTON:
            if (sp.picnum === DOMELITE)
                sp.cstat |= 257;
        case JIBS1:
        case JIBS2:
        case JIBS3:
        case JIBS4:
        case JIBS5:
        case JIBS6:
        case HEADJIB1:
        case ARMJIB1:
        case LEGJIB1:
        case LIZMANHEAD1:
        case LIZMANARM1:
        case LIZMANLEG1:
        case DUKETORSO:
        case DUKEGUN:
        case DUKELEG:
            changespritestat(i, 5);
            break;
        case TONGUE:
            if (j >= 0)
                sp.ang = sprite[j].ang;
            sp.z -= 38 << 8;
            sp.zvel = 256 - (krand() & 511);
            sp.xvel = 64 - (krand() & 127);
            changespritestat(i, 4);
            break;
        case NATURALLIGHTNING:
            sp.cstat &= ~257;
            sp.cstat |= 32768;
            break;
        case TRANSPORTERSTAR:
        case TRANSPORTERBEAM:
            if (j == -1) break;
            if (sp.picnum == TRANSPORTERBEAM) {
                sp.xrepeat = 31;
                sp.yrepeat = 1;
                sp.z = sector[sprite[j].sectnum].floorz - (40 << 8);
            }
            else {
                if (sprite[j].statnum == 4) {
                    sp.xrepeat = 8;
                    sp.yrepeat = 8;
                }
                else {
                    sp.xrepeat = 48;
                    sp.yrepeat = 64;
                    if (sprite[j].statnum == 10 || badguy(sprite[j]))
                        sp.z -= (32 << 8);
                }
            }

            sp.shade = -127;
            sp.cstat = 128 | 2;
            sp.ang = sprite[j].ang;

            sp.xvel = 128;
            changespritestat(i, 5);
            ssp(i, CLIPMASK0);
            setsprite(i, sp.x, sp.y, sp.z);
            break;

        case FRAMEEFFECT1:
        case FRAMEEFFECT1_13CON:
            if (j >= 0) {
                sp.xrepeat = sprite[j].xrepeat;
                sp.yrepeat = sprite[j].yrepeat;
                hittype[i].temp_data[1] = sprite[j].picnum;
            }
            else sp.xrepeat = sp.yrepeat = 0;

            changespritestat(i, 5);

            break;

        case LASERLINE:
            sp.yrepeat = 6;
            sp.xrepeat = 32;

            if (lasermode == 1)
                sp.cstat = 16 + 2;
            else if (lasermode == 0 || lasermode == 2)
                sp.cstat = 16;
            else {
                sp.xrepeat = 0;
                sp.yrepeat = 0;
            }

            if (j >= 0) sp.ang = hittype[j].temp_data[5] + 512;
            changespritestat(i, 5);
            break;

        case FORCESPHERE:
            if (j == -1) {
                sp.cstat = 32768;
                changespritestat(i, 2);
            }
            else {
                sp.xrepeat = sp.yrepeat = 1;
                changespritestat(i, 5);
            }
            break;

        case BLOOD:
            sp.xrepeat = sp.yrepeat = 16;
            sp.z -= (26 << 8);
            if (j >= 0 && sprite[j].pal == 6)
                sp.pal = 6;
            changespritestat(i, 5);
            break;
        case BLOODPOOL:
        case PUKE:
            {
                var s1 = new Ref(sp.sectnum);

                updatesector(sp.x + 108, sp.y + 108, s1);
                if (s1.$ >= 0 && sector[s1.$].floorz == sector[sp.sectnum].floorz) {
                    updatesector(sp.x - 108, sp.y - 108, s1);
                    if (s1.$ >= 0 && sector[s1.$].floorz == sector[sp.sectnum].floorz) {
                        updatesector(sp.x + 108, sp.y - 108, s1);
                        if (s1.$ >= 0 && sector[s1.$].floorz == sector[sp.sectnum].floorz) {
                            updatesector(sp.x - 108, sp.y + 108, s1);
                            if (s1.$ >= 0 && sector[s1.$].floorz != sector[sp.sectnum].floorz)
                            { sp.xrepeat = sp.yrepeat = 0; changespritestat(i, 5); break; }
                        }
                        else { sp.xrepeat = sp.yrepeat = 0; changespritestat(i, 5); break; }
                    }
                    else { sp.xrepeat = sp.yrepeat = 0; changespritestat(i, 5); break; }
                }
                else { sp.xrepeat = sp.yrepeat = 0; changespritestat(i, 5); break; }
            }

            if (sector[sprite[i].sectnum].lotag == 1) {
                changespritestat(i, 5);
                break;
            }

            if (j >= 0 && sp.picnum != PUKE) {
                if (sprite[j].pal == 1)
                    sp.pal = 1;
                else if (sprite[j].pal != 6 && sprite[j].picnum != NUKEBARREL && sprite[j].picnum != TIRE) {
                    if (sprite[j].picnum == FECES)
                        sp.pal = 7; // Brown
                    else sp.pal = 2; // Red
                }
                else sp.pal = 0;  // green

                if (sprite[j].picnum == TIRE)
                    sp.shade = 127;
            }
            sp.cstat |= 32;
        case FECES:
            if (j >= 0)
                sp.xrepeat = sp.yrepeat = 1;
            changespritestat(i, 5);
            break;

        case BLOODSPLAT1:
        case BLOODSPLAT2:
        case BLOODSPLAT3:
        case BLOODSPLAT4:
            sp.cstat |= 16;
            sp.xrepeat = 7 + (krand() & 7);
            sp.yrepeat = 7 + (krand() & 7);
            sp.z -= (16 << 8);
            if (j >= 0 && sprite[j].pal == 6)
                sp.pal = 6;
            insertspriteq(i);
            changespritestat(i, 5);
            break;

        case TRIPBOMB:
            if (sp.lotag > ud.player_skill) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }

            sp.xrepeat = 4;
            sp.yrepeat = 5;

            sp.owner = i;
            sp.hitag = i;

            sp.xvel = 16;
            ssp(i, CLIPMASK0);
            hittype[i].temp_data[0] = 17;
            hittype[i].temp_data[2] = 0;
            hittype[i].temp_data[5] = sp.ang;

        case SPACEMARINE:
            if (sp.picnum == SPACEMARINE) {
                sp.extra = 20;
                sp.cstat |= 257;
            }
            changespritestat(i, 2);
            break;

        case HYDRENT:
        case PANNEL1:
        case PANNEL2:
        case SATELITE:
        case FUELPOD:
        case SOLARPANNEL:
        case ANTENNA:
        case GRATE1:
        case CHAIR1:
        case CHAIR2:
        case CHAIR3:
        case BOTTLE1:
        case BOTTLE2:
        case BOTTLE3:
        case BOTTLE4:
        case BOTTLE5:
        case BOTTLE6:
        case BOTTLE7:
        case BOTTLE8:
        case BOTTLE10:
        case BOTTLE11:
        case BOTTLE12:
        case BOTTLE13:
        case BOTTLE14:
        case BOTTLE15:
        case BOTTLE16:
        case BOTTLE17:
        case BOTTLE18:
        case BOTTLE19:
        case OCEANSPRITE1:
        case OCEANSPRITE2:
        case OCEANSPRITE3:
        case OCEANSPRITE5:
        case MONK:
        case INDY:
        case LUKE:
        case JURYGUY:
        case SCALE:
        case VACUUM:
        case FANSPRITE:
        case CACTUS:
        case CACTUSBROKE:
        case HANGLIGHT:
        case FETUS:
        case FETUSBROKE:
        case CAMERALIGHT:
        case MOVIECAMERA:
        case IVUNIT:
        case POT1:
        case POT2:
        case POT3:
        case TRIPODCAMERA:
        case SUSHIPLATE1:
        case SUSHIPLATE2:
        case SUSHIPLATE3:
        case SUSHIPLATE4:
        case SUSHIPLATE5:
        case WAITTOBESEATED:
        case VASE:
        case PIPE1:
        case PIPE2:
        case PIPE3:
        case PIPE4:
        case PIPE5:
        case PIPE6:
            sp.clipdist = 32;
            sp.cstat |= 257;
        case OCEANSPRITE4:
            changespritestat(i, 0);
            break;
        case FEMMAG1:
        case FEMMAG2:
            sp.cstat &= ~257;
            changespritestat(i, 0);
            break;
        case DUKETAG:
        case SIGN1:
        case SIGN2:
            if (ud.multimode < 2 && sp.pal) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
            }
            else sp.pal = 0;
            break;
        case MASKWALL1:
        case MASKWALL2:
        case MASKWALL3:
        case MASKWALL4:
        case MASKWALL5:
        case MASKWALL6:
        case MASKWALL7:
        case MASKWALL8:
        case MASKWALL9:
        case MASKWALL10:
        case MASKWALL11:
        case MASKWALL12:
        case MASKWALL13:
        case MASKWALL14:
        case MASKWALL15:
            j = sp.cstat & 60;
            sp.cstat = j | 1;
            changespritestat(i, 0);
            break;
        case FOOTPRINTS:
        case FOOTPRINTS2:
        case FOOTPRINTS3:
        case FOOTPRINTS4:
            if (j >= 0) {
                var s1 = new Ref(sp.sectnum);

                updatesector(sp.x + 84, sp.y + 84, s1);
                if (s1.$ >= 0 && sector[s1.$].floorz == sector[sp.sectnum].floorz) {
                    updatesector(sp.x - 84, sp.y - 84, s1);
                    if (s1.$ >= 0 && sector[s1.$].floorz == sector[sp.sectnum].floorz) {
                        updatesector(sp.x + 84, sp.y - 84, s1);
                        if (s1.$ >= 0 && sector[s1.$].floorz == sector[sp.sectnum].floorz) {
                            updatesector(sp.x - 84, sp.y + 84, s1);
                            if (s1.$ >= 0 && sector[s1.$].floorz != sector[sp.sectnum].floorz)
                            { sp.xrepeat = sp.yrepeat = 0; changespritestat(i, 5); break; }
                        }
                        else { sp.xrepeat = sp.yrepeat = 0; break; }
                    }
                    else { sp.xrepeat = sp.yrepeat = 0; break; }
                }
                else { sp.xrepeat = sp.yrepeat = 0; break; }

                sp.cstat = 32 + ((ps[sprite[j].yvel].footprintcount & 1) << 2);
                sp.ang = sprite[j].ang;
            }

            sp.z = sector[sect].floorz;
            if (sector[sect].lotag != 1 && sector[sect].lotag != 2)
                sp.xrepeat = sp.yrepeat = 32;

            insertspriteq(i);
            changespritestat(i, 5);
            break;

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
        case TOUGHGAL:
            sp.yvel = sp.hitag;
            sp.hitag = -1;
            if (sp.picnum == PODFEM1) sp.extra <<= 1;
        case BLOODYPOLE:

        case QUEBALL:
        case STRIPEBALL:

            if (sp.picnum == QUEBALL || sp.picnum == STRIPEBALL) {
                sp.cstat = 256;
                sp.clipdist = 8;
            }
            else {
                sp.cstat |= 257;
                sp.clipdist = 32;
            }

            changespritestat(i, 2);
            break;

        case DUKELYINGDEAD:
            if (j >= 0 && sprite[j].picnum == APLAYER) {
                sp.xrepeat = sprite[j].xrepeat;
                sp.yrepeat = sprite[j].yrepeat;
                sp.shade = sprite[j].shade;
                sp.pal = ps[sprite[j].yvel].palookup;
            }
        case DUKECAR:
        case HELECOPT:
            //                if(sp.picnum == HELECOPT || sp.picnum == DUKECAR) sp.xvel = 1024;
            sp.cstat = 0;
            sp.extra = 1;
            sp.xvel = 292;
            sp.zvel = 360;
        case RESPAWNMARKERRED:
        case BLIMP:
            if (sp.picnum == RESPAWNMARKERRED) {
                sp.xrepeat = sp.yrepeat = 24;
                if (j >= 0) sp.z = hittype[j].floorz; // -(1<<4);
            }
            else {
                sp.cstat |= 257;
                sp.clipdist = 128;
            }
        case MIKE:
            if (sp.picnum == MIKE)
                sp.yvel = sp.hitag;
        case WEATHERWARN:
            changespritestat(i, 1);
            break;

        case SPOTLITE:
            hittype[i].temp_data[0] = sp.x;
            hittype[i].temp_data[1] = sp.y;
            break;
        case BULLETHOLE:
            sp.xrepeat = sp.yrepeat = 3;
            sp.cstat = 16 + (krand() & 12);
            insertspriteq(i);
        case MONEY:
        case MAIL:
        case PAPER:
            if (sp.picnum == MONEY || sp.picnum == MAIL || sp.picnum == PAPER) {
                hittype[i].temp_data[0] = krand() & 2047;
                sp.cstat = krand() & 12;
                sp.xrepeat = sp.yrepeat = 8;
                sp.ang = krand() & 2047;
            }
            changespritestat(i, 5);
            break;

        case VIEWSCREEN:
        case VIEWSCREEN2:
            sp.owner = i;
            sp.lotag = 1;
            sp.extra = 1;
            changespritestat(i, 6);
            break;

        case SHELL: //From the player
        case SHOTGUNSHELL:
            if (j >= 0) {
                var snum, a;

                if (sprite[j].picnum == APLAYER) {
                    snum = sprite[j].yvel;
                    a = ps[snum].ang - (krand() & 63) + 8;  //Fine tune

                    hittype[i].temp_data[0] = krand() & 1;
                    if (sp.picnum == SHOTGUNSHELL)
                        sp.z = (6 << 8) + ps[snum].pyoff + ps[snum].posz - ((ps[snum].horizoff + ps[snum].horiz - 100) << 4);
                    else sp.z = (3 << 8) + ps[snum].pyoff + ps[snum].posz - ((ps[snum].horizoff + ps[snum].horiz - 100) << 4);
                    sp.zvel = -(krand() & 255);
                }
                else {
                    a = sp.ang;
                    sp.z = sprite[j].z - PHEIGHT + (3 << 8);
                }

                sp.x = sprite[j].x + (sintable[(a + 512) & 2047] >> 7);
                sp.y = sprite[j].y + (sintable[a & 2047] >> 7);

                sp.shade = -8;

                sp.ang = a - 512;
                sp.xvel = 20;

                //  do not try to make it 0 when ud.hideweapon Will make OOS when shooting in water
                sp.xrepeat = sp.yrepeat = 4;

                changespritestat(i, 5);
            }
            break;

        case RESPAWN:
            sp.extra = 66 - 13;
        case MUSICANDSFX:
            if (ud.multimode < 2 && sp.pal == 1) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }
            sp.cstat = 32768;
            changespritestat(i, 11);
            break;

        case EXPLOSION2:
        case EXPLOSION2BOT:
        case BURNING:
        case BURNING2:
        case SMALLSMOKE:
        case SHRINKEREXPLOSION:
        case COOLEXPLOSION1:

            if (j >= 0) {
                sp.ang = sprite[j].ang;
                sp.shade = -64;
                sp.cstat = 128 | (krand() & 4);
            }

            if (sp.picnum == EXPLOSION2 || sp.picnum == EXPLOSION2BOT) {
                sp.xrepeat = 48;
                sp.yrepeat = 48;
                sp.shade = -127;
                sp.cstat |= 128;
            }
            else if (sp.picnum == SHRINKEREXPLOSION) {
                sp.xrepeat = 32;
                sp.yrepeat = 32;
            }
            else if (sp.picnum == SMALLSMOKE) {
                // 64 "money"
                sp.xrepeat = 24;
                sp.yrepeat = 24;
            }
            else if (sp.picnum == BURNING || sp.picnum == BURNING2) {
                sp.xrepeat = 4;
                sp.yrepeat = 4;
            }

            if (j >= 0) {
                x = getflorzofslope(sp.sectnum, sp.x, sp.y);
                if (sp.z > x - (12 << 8))
                    sp.z = x - (12 << 8);
            }

            changespritestat(i, 5);

            break;

        case PLAYERONWATER:
            if (j >= 0) {
                sp.xrepeat = sprite[j].xrepeat;
                sp.yrepeat = sprite[j].yrepeat;
                sp.zvel = 128;
                if (sector[sp.sectnum].lotag != 2)
                    sp.cstat |= 32768;
            }
            changespritestat(i, 13);
            break;

        case APLAYER:
            sp.xrepeat = sp.yrepeat = 0;
            j = ud.coop;
            if (j == 2) j = 0;

            if (ud.multimode < 2 || (ud.multimode > 1 && j != sp.lotag))
                changespritestat(i, 5);
            else
                changespritestat(i, 10);
            break;
        case WATERBUBBLE:
            if (j >= 0 && sprite[j].picnum == APLAYER)
                sp.z -= (16 << 8);
            if (sp.picnum == WATERBUBBLE) {
                if (j >= 0)
                    sp.ang = sprite[j].ang;
                sp.xrepeat = sp.yrepeat = 4;
            }
            else sp.xrepeat = sp.yrepeat = 32;

            changespritestat(i, 5);
            break;

        case CRANE:

            sp.cstat |= 64 | 257;

            sp.picnum += 2;
            sp.z = sector[sect].ceilingz + (48 << 8);
            hittype[i].temp_data[4] = tempwallptr;

            msx[tempwallptr] = sp.x;
            msy[tempwallptr] = sp.y;
            msx[tempwallptr + 2] = sp.z;

            s = headspritestat[0];
            while (s >= 0) {
                if (sprite[s].picnum == CRANEPOLE && sprite[i].hitag == (sprite[s].hitag)) {
                    msy[tempwallptr + 2] = s;

                    hittype[i].temp_data[1] = sprite[s].sectnum;

                    sprite[s].xrepeat = 48;
                    sprite[s].yrepeat = 128;

                    msx[tempwallptr + 1] = sprite[s].x;
                    msy[tempwallptr + 1] = sprite[s].y;

                    sprite[s].x = sp.x;
                    sprite[s].y = sp.y;
                    sprite[s].z = sp.z;
                    sprite[s].shade = sp.shade;

                    setsprite(s, sprite[s].x, sprite[s].y, sprite[s].z);
                    break;
                }
                s = nextspritestat[s];
            }

            tempwallptr += 3;
            sp.owner = -1;
            sp.extra = 8;
            changespritestat(i, 6);
            break;

        case WATERDRIP:
            // fix: j can be -1 - so i guess this is correct. 
            if (j >= 0 && (sprite[j].statnum == 10 || sprite[j].statnum == 1)) {
                //if ((j >= 0 && sprite[j].statnum == 10) || sprite[j].statnum == 1) {
                sp.shade = 32;
                if (sprite[j].pal != 1) {
                    sp.pal = 2;
                    sp.z -= (18 << 8);
                }
                else sp.z -= (13 << 8);
                sp.ang = getangle(ps[connecthead].posx - sp.x, ps[connecthead].posy - sp.y);
                sp.xvel = 48 - (krand() & 31);
                ssp(i, CLIPMASK0);
            }
            else if (j == -1) {
                sp.z += (4 << 8);
                hittype[i].temp_data[0] = sp.z;
                hittype[i].temp_data[1] = krand() & 127;
            }
        case TRASH:

            if (sp.picnum != WATERDRIP)
                sp.ang = krand() & 2047;

        case WATERDRIPSPLASH:

            sp.xrepeat = 24;
            sp.yrepeat = 24;


            changespritestat(i, 6);
            break;

        case PLUG:
            sp.lotag = 9999;
            changespritestat(i, 6);
            break;
        case TOUCHPLATE:
            hittype[i].temp_data[2] = sector[sect].floorz;
            if (sector[sect].lotag != 1 && sector[sect].lotag != 2)
                sector[sect].floorz = sp.z;
            if (sp.pal && ud.multimode > 1) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }
        case WATERBUBBLEMAKER:
            sp.cstat |= 32768;
            changespritestat(i, 6);
            break;
        case BOLT1:
        case BOLT1 + 1:
        case BOLT1 + 2:
        case BOLT1 + 3:
        case SIDEBOLT1:
        case SIDEBOLT1 + 1:
        case SIDEBOLT1 + 2:
        case SIDEBOLT1 + 3:
            hittype[i].temp_data[0] = sp.xrepeat;
            hittype[i].temp_data[1] = sp.yrepeat;
        case MASTERSWITCH:
            if (sp.picnum == MASTERSWITCH)
                sp.cstat |= 32768;
            sp.yvel = 0;
            changespritestat(i, 6);
            break;
        case TARGET:
        case DUCK:
        case LETTER:
            sp.extra = 1;
            sp.cstat |= 257;
            changespritestat(i, 1);
            break;
        case OCTABRAINSTAYPUT:
        case LIZTROOPSTAYPUT:
        case PIGCOPSTAYPUT:
        case LIZMANSTAYPUT:
        case BOSS1STAYPUT:
        case PIGCOPDIVE:
        case COMMANDERSTAYPUT:
        case BOSS4STAYPUT:
            hittype[i].actorstayput = sp.sectnum;
        case BOSS1:
        case BOSS2:
        case BOSS3:
        case BOSS4:
        case ROTATEGUN:
        case GREENSLIME:
            if (sp.picnum == GREENSLIME)
                sp.extra = 1;
        case DRONE:
        case LIZTROOPONTOILET:
        case LIZTROOPJUSTSIT:
        case LIZTROOPSHOOT:
        case LIZTROOPJETPACK:
        case LIZTROOPDUCKING:
        case LIZTROOPRUNNING:
        case LIZTROOP:
        case OCTABRAIN:
        case COMMANDER:
        case PIGCOP:
        case LIZMAN:
        case LIZMANSPITTING:
        case LIZMANFEEDING:
        case LIZMANJUMP:
        case ORGANTIC:
        case RAT:
        case SHARK:

            if (sp.pal == 0) {
                switch (sp.picnum) {
                    case LIZTROOPONTOILET:
                    case LIZTROOPSHOOT:
                    case LIZTROOPJETPACK:
                    case LIZTROOPDUCKING:
                    case LIZTROOPRUNNING:
                    case LIZTROOPSTAYPUT:
                    case LIZTROOPJUSTSIT:
                    case LIZTROOP:
                        sp.pal = 22;
                        break;
                }
            }

            if (sp.picnum == BOSS4STAYPUT || sp.picnum == BOSS1 || sp.picnum == BOSS2 || sp.picnum == BOSS1STAYPUT || sp.picnum == BOSS3 || sp.picnum == BOSS4) {
                if (j >= 0 && sprite[j].picnum == RESPAWN)
                    sp.pal = sprite[j].pal;
                if (sp.pal) {
                    sp.clipdist = 80;
                    sp.xrepeat = 40;
                    sp.yrepeat = 40;
                }
                else {
                    sp.xrepeat = 80;
                    sp.yrepeat = 80;
                    sp.clipdist = 164;
                }
            }
            else {
                if (sp.picnum != SHARK) {
                    sp.xrepeat = 40;
                    sp.yrepeat = 40;
                    sp.clipdist = 80;
                }
                else {
                    sp.xrepeat = 60;
                    sp.yrepeat = 60;
                    sp.clipdist = 40;
                }
            }

            if (j >= 0) sp.lotag = 0;

            if ((sp.lotag > ud.player_skill) || ud.monsters_off == 1) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }
            else {
                makeitfall(i);

                if (sp.picnum == RAT) {
                    sp.ang = krand() & 2047;
                    sp.xrepeat = sp.yrepeat = 48;
                    sp.cstat = 0;
                }
                else {
                    sp.cstat |= 257;

                    if (sp.picnum != SHARK)
                        ps[myconnectindex].max_actors_killed++;
                }

                if (sp.picnum == ORGANTIC) sp.cstat |= 128;

                if (j >= 0) {
                    hittype[i].timetosleep = 0;
                    check_fta_sounds(i);
                    changespritestat(i, 1);
                }
                else changespritestat(i, 2);
            }

            if (sp.picnum == ROTATEGUN)
                sp.zvel = 0;

            break;

        case LOCATORS:
            sp.cstat |= 32768;
            changespritestat(i, 7);
            break;

        case ACTIVATORLOCKED:
        case ACTIVATOR:
            sp.cstat = 32768;
            if (sp.picnum == ACTIVATORLOCKED)
                sector[sp.sectnum].lotag |= 16384;
            changespritestat(i, 8);
            break;

        case DOORSHOCK:
            sp.cstat |= 1 + 256;
            sp.shade = -12;
            changespritestat(i, 6);
            break;

        case OOZ:
        case OOZ2:
            sp.shade = -12;

            if (j >= 0) {
                if (sprite[j].picnum == NUKEBARREL)
                    sp.pal = 8;
                insertspriteq(i);
            }

            changespritestat(i, 1);

            getglobalz(i);

            j = (hittype[i].floorz - hittype[i].ceilingz) >> 9;

            sp.yrepeat = j;
            sp.xrepeat = 25 - (j >> 1);
            sp.cstat |= (krand() & 4);

            break;

        case HEAVYHBOMB:
            if (j >= 0)
                sp.owner = j;
            else sp.owner = i;
            sp.xrepeat = sp.yrepeat = 9;
            sp.yvel = 4;
        case REACTOR2:
        case REACTOR:
        case RECON:

            if (sp.picnum == RECON) {
                if (sp.lotag > ud.player_skill) {
                    sp.xrepeat = sp.yrepeat = 0;
                    changespritestat(i, 5);
                    return i;
                }
                ps[myconnectindex].max_actors_killed++;
                hittype[i].temp_data[5] = 0;
                if (ud.monsters_off == 1) {
                    sp.xrepeat = sp.yrepeat = 0;
                    changespritestat(i, 5);
                    break;
                }
                sp.extra = 130;
            }

            if (sp.picnum == REACTOR || sp.picnum == REACTOR2)
                sp.extra = impact_damage;

            sprite[i].cstat |= 257; // Make it hitable

            if (ud.multimode < 2 && sp.pal != 0) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }
            sp.pal = 0;
            sprite[i].shade = -17;

            changespritestat(i, 2);
            break;

        case ATOMICHEALTH:
        case STEROIDS:
        case HEATSENSOR:
        case SHIELD:
        case AIRTANK:
        case TRIPBOMBSPRITE:
        case JETPACK:
        case HOLODUKE:

        case FIRSTGUNSPRITE:
        case CHAINGUNSPRITE:
        case SHOTGUNSPRITE:
        case RPGSPRITE:
        case SHRINKERSPRITE:
        case FREEZESPRITE:
        case DEVISTATORSPRITE:

        case SHOTGUNAMMO:
        case FREEZEAMMO:
        case HBOMBAMMO:
        case CRYSTALAMMO:
        case GROWAMMO:
        case BATTERYAMMO:
        case DEVISTATORAMMO:
        case RPGAMMO:
        case BOOTS:
        case AMMO:
        case AMMOLOTS:
        case COLA:
        case FIRSTAID:
        case SIXPAK:
            if (j >= 0) {
                sp.lotag = 0;
                sp.z -= (32 << 8);
                sp.zvel = -1024;
                ssp(i, CLIPMASK0);
                sp.cstat = krand() & 4;
            }
            else {
                sp.owner = i;
                sp.cstat = 0;
            }

            if ((ud.multimode < 2 && sp.pal != 0) || (sp.lotag > ud.player_skill)) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }

            sp.pal = 0;

        case ACCESSCARD:

            if (sp.picnum == ATOMICHEALTH)
                sp.cstat |= 128;

            if (ud.multimode > 1 && ud.coop != 1 && sp.picnum == ACCESSCARD) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }
            else {
                if (sp.picnum == AMMO)
                    sp.xrepeat = sp.yrepeat = 16;
                else sp.xrepeat = sp.yrepeat = 32;
            }

            sp.shade = -17;

            if (j >= 0) changespritestat(i, 1);
            else {
                changespritestat(i, 2);
                makeitfall(i);
            }
            break;

        case WATERFOUNTAIN:
            sprite[i].lotag = 1;

        case TREE1:
        case TREE2:
        case TIRE:
        case CONE:
        case BOX:
            sprite[i].cstat = 257; // Make it hitable
            sprite[i].extra = 1;
            changespritestat(i, 6);
            break;

        case FLOORFLAME:
            sp.shade = -127;
            changespritestat(i, 6);
            break;

        case BOUNCEMINE:
            sp.owner = i;
            sp.cstat |= 1 + 256; //Make it hitable
            sp.xrepeat = sp.yrepeat = 24;
            sp.shade = -127;
            sp.extra = impact_damage << 2;
            changespritestat(i, 2);
            break;

        case CAMERA1:
        case CAMERA1 + 1:
        case CAMERA1 + 2:
        case CAMERA1 + 3:
        case CAMERA1 + 4:
        case CAMERAPOLE:
            sp.extra = 1;

            if (camerashitable) sp.cstat = 257;
            else sp.cstat = 0;

        case GENERICPOLE:

            if (ud.multimode < 2 && sp.pal != 0) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }
            else sp.pal = 0;
            if (sp.picnum == CAMERAPOLE || sp.picnum == GENERICPOLE) break;
            sp.picnum = CAMERA1;
            changespritestat(i, 1);
            break;
        case STEAM:
            if (j >= 0) {
                sp.ang = sprite[j].ang;
                sp.cstat = 16 + 128 + 2;
                sp.xrepeat = sp.yrepeat = 1;
                sp.xvel = -8;
                ssp(i, CLIPMASK0);
            }
        case CEILINGSTEAM:
            changespritestat(i, 6);
            break;

        case SECTOREFFECTOR:
            sp.yvel = sector[sect].extra;
            sp.cstat |= 32768;
            sp.xrepeat = sp.yrepeat = 0;

            switch (sp.lotag) {
                case 28:
                    hittype[i].temp_data[5] = 65;// Delay for lightning
                    break;
                case 7: // Transporters!!!!
                case 23:// XPTR END
                    if (sp.lotag != 23) {
                        for (j = 0; j < MAXSPRITES; j++)
                            if (sprite[j].statnum < MAXSTATUS && sprite[j].picnum == SECTOREFFECTOR && (sprite[j].lotag == 7 || sprite[j].lotag == 23) && i != j && sprite[j].hitag == sprite[i].hitag) {
                                sprite[i].owner = j;
                                break;
                            }
                    }
                    else sprite[i].owner = i;

                    hittype[i].temp_data[4] = sector[sect].floorz == sprite[i].z;
                    sp.cstat = 0;
                    changespritestat(i, 9);
                    return i;
                case 1:
                    sp.owner = -1;
                    hittype[i].temp_data[0] = 1;
                    break;
                case 18:

                    if (sp.ang == 512) {
                        hittype[i].temp_data[1] = sector[sect].ceilingz;
                        if (sp.pal)
                            sector[sect].ceilingz = sp.z;
                    }
                    else {
                        hittype[i].temp_data[1] = sector[sect].floorz;
                        if (sp.pal)
                            sector[sect].floorz = sp.z;
                    }

                    sp.hitag <<= 2;
                    break;

                case 19:
                    sp.owner = -1;
                    break;
                case 25: // Pistons
                    hittype[i].temp_data[3] = sector[sect].ceilingz;
                    hittype[i].temp_data[4] = 1;
                    sector[sect].ceilingz = sp.z;
                    setinterpolation(new AnimatePtr(sector, sect, "ceilingz" /*sector[sect].ceilingz*/));
                    break;
                case 35:
                    sector[sect].ceilingz = sp.z;
                    break;
                case 27:
                    if (ud.recstat == 1) {
                        sp.xrepeat = sp.yrepeat = 64;
                        sp.cstat &= 32767;
                    }
                    break;
                case 12:

                    hittype[i].temp_data[1] = sector[sect].floorshade;
                    hittype[i].temp_data[2] = sector[sect].ceilingshade;
                    break;

                case 13:

                    hittype[i].temp_data[0] = sector[sect].ceilingz;
                    hittype[i].temp_data[1] = sector[sect].floorz;

                    if (klabs(hittype[i].temp_data[0] - sp.z) < klabs(hittype[i].temp_data[1] - sp.z))
                        sp.owner = 1;
                    else sp.owner = 0;

                    if (sp.ang === 512) {
                        if (sp.owner)
                            sector[sect].ceilingz = sp.z;
                        else
                            sector[sect].floorz = sp.z;
                    }
                    else
                        sector[sect].ceilingz = sector[sect].floorz = sp.z;

                    if (sector[sect].ceilingstat & 1) {
                        sector[sect].ceilingstat ^= 1;
                        hittype[i].temp_data[3] = 1;

                        if (!sp.owner && sp.ang === 512) {
                            sector[sect].ceilingstat ^= 1;
                            hittype[i].temp_data[3] = 0;
                        }

                        sector[sect].ceilingshade =
                            sector[sect].floorshade;

                        if (sp.ang === 512) {
                            startwall = sector[sect].wallptr;
                            endwall = startwall + sector[sect].wallnum;
                            for (j = startwall; j < endwall; j++) {
                                x = wall[j].nextsector;
                                if (x >= 0)
                                    if (!(sector[x].ceilingstat & 1)) {
                                        sector[sect].ceilingpicnum =
                                            sector[x].ceilingpicnum;
                                        sector[sect].ceilingshade =
                                            sector[x].ceilingshade;
                                        break; // Leave early
                                    }
                            }
                        }
                    }

                    break;

                case 17:
                    hittype[i].temp_data[2] = sector[sect].floorz; //Stopping loc

                    j = nextsectorneighborz(sect, sector[sect].floorz, -1, -1);
                    hittype[i].temp_data[3] = sector[j].ceilingz;

                    j = nextsectorneighborz(sect, sector[sect].ceilingz, 1, 1);
                    hittype[i].temp_data[4] = sector[j].floorz;

                    if (numplayers < 2) {
                        setinterpolation(new AnimatePtr(sector,sect,"floorz"/*sector[sect].floorz*/));
                        setinterpolation(new AnimatePtr(sector, sect, "ceilingz" /*sector[sect].ceilingz*/));
                    }

                    break;

                case 24:
                    sp.yvel <<= 1;
                case 36:
                    break;
                case 20:
                    {
                        var q;

                        startwall = sector[sect].wallptr;
                        endwall = startwall + sector[sect].wallnum;

                        //find the two most clostest wall x's and y's
                        q = 0x7fffffff;

                        for (s = startwall; s < endwall; s++) {
                            x = wall[s].x;
                            y = wall[s].y;

                            d = FindDistance2D(sp.x - x, sp.y - y);
                            if (d < q) {
                                q = d;
                                clostest = s;
                            }
                        }

                        hittype[i].temp_data[1] = clostest;

                        q = 0x7fffffff;

                        for (s = startwall; s < endwall; s++) {
                            x = wall[s].x;
                            y = wall[s].y;

                            d = FindDistance2D(sp.x - x, sp.y - y);
                            if (d < q && s != hittype[i].temp_data[1]) {
                                q = d;
                                clostest = s;
                            }
                        }

                        hittype[i].temp_data[2] = clostest;
                    }

                    break;

                case 3:

                    hittype[i].temp_data[3] = sector[sect].floorshade;

                    sector[sect].floorshade = sp.shade;
                    sector[sect].ceilingshade = sp.shade;

                    sp.owner = sector[sect].ceilingpal << 8;
                    sp.owner |= sector[sect].floorpal;

                    //fix all the walls;

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    for (s = startwall; s < endwall; s++) {
                        if (!(wall[s].hitag & 1))
                            wall[s].shade = sp.shade;
                        if ((wall[s].cstat & 2) && wall[s].nextwall >= 0)
                            wall[wall[s].nextwall].shade = sp.shade;
                    }
                    break;

                case 31:
                    hittype[i].temp_data[1] = sector[sect].floorz;
                    //    hittype[i].temp_data[2] = sp.hitag;
                    if (sp.ang != 1536) sector[sect].floorz = sp.z;

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    for (s = startwall; s < endwall; s++)
                        if (wall[s].hitag === 0) wall[s].hitag = 9999;

                    setinterpolation(new AnimatePtr(sector, sect, "floorz"/*sector[sect].floorz*/));

                    break;
                case 32:
                    hittype[i].temp_data[1] = sector[sect].ceilingz;
                    hittype[i].temp_data[2] = sp.hitag;
                    if (sp.ang != 1536) sector[sect].ceilingz = sp.z;

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    for (s = startwall; s < endwall; s++)
                        if (wall[s].hitag == 0) wall[s].hitag = 9999;

                    setinterpolation(new AnimatePtr(sector, sect, "ceilingz" /*sector[sect].ceilingz*/));

                    break;

                case 4: //Flashing lights

                    hittype[i].temp_data[2] = sector[sect].floorshade;

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    sp.owner = sector[sect].ceilingpal << 8;
                    sp.owner |= sector[sect].floorpal;

                    for (s = startwall; s < endwall; s++)
                        if (wall[s].shade > hittype[i].temp_data[3])
                            hittype[i].temp_data[3] = wall[s].shade;

                    break;

                case 9:
                    if (sector[sect].lotag &&
                        Math.abs(sector[sect].ceilingz - sp.z) > 1024)
                        sector[sect].lotag |= 32768; //If its open
                case 8:
                    //First, get the ceiling-floor shade

                    hittype[i].temp_data[0] = sector[sect].floorshade;
                    hittype[i].temp_data[1] = sector[sect].ceilingshade;

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    for (s = startwall; s < endwall; s++)
                        if (wall[s].shade > hittype[i].temp_data[2])
                            hittype[i].temp_data[2] = wall[s].shade;

                    hittype[i].temp_data[3] = 1; //Take Out;

                    break;

                case 11://Pivitor rotater
                    if (sp.ang > 1024) hittype[i].temp_data[3] = 2;
                    else hittype[i].temp_data[3] = -2;
                case 0:
                case 2://Earthquakemakers
                case 5://Boss Creature
                case 6://Subway
                case 14://Caboos
                case 15://Subwaytype sliding door
                case 16://That rotating blocker reactor thing
                case 26://ESCELATOR
                case 30://No rotational subways

                    if (sp.lotag === 0) {
                        if (sector[sect].lotag === 30) {
                            if (sp.pal) sprite[i].clipdist = 1;
                            else sprite[i].clipdist = 0;
                            hittype[i].temp_data[3] = sector[sect].floorz;
                            sector[sect].hitag = i;
                        }

                        for (j = 0; j < MAXSPRITES; j++) {
                            if (sprite[j].statnum < MAXSTATUS)
                                if (sprite[j].picnum === SECTOREFFECTOR &&
                                    sprite[j].lotag === 1 &&
                                    sprite[j].hitag === sp.hitag) {
                                    if (sp.ang == 512) {
                                        sp.x = sprite[j].x;
                                        sp.y = sprite[j].y;
                                    }
                                    break;
                                }
                        }
                        if (j === MAXSPRITES) {
                            throw new Error("Found lonely Sector Effector (lotag 0) at (" +
                                sp.x + "," + sp.y + ")");
                        }
                        sp.owner = j;
                    }

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    hittype[i].temp_data[1] = tempwallptr;
                    for (s = startwall; s < endwall; s++) {
                        msx[tempwallptr] = wall[s].x - sp.x;
                        msy[tempwallptr] = wall[s].y - sp.y;
                        tempwallptr++;
                        if (tempwallptr > 2047) {
                            throw new Error("Too many moving sectors at (" + wall[s].x + "%d," + wall[s].y + "%d).");
                        }
                    }
                    if (sp.lotag === 30 || sp.lotag === 6 || sp.lotag === 14 || sp.lotag === 5) {

                        startwall = sector[sect].wallptr;
                        endwall = startwall + sector[sect].wallnum;

                        if (sector[sect].hitag === -1)
                            sp.extra = 0;
                        else sp.extra = 1;

                        sector[sect].hitag = i;

                        j = 0;

                        for (s = startwall; s < endwall; s++) {
                            if (wall[s].nextsector >= 0 &&
                                sector[wall[s].nextsector].hitag === 0 &&
                                    sector[wall[s].nextsector].lotag < 3) {
                                s = wall[s].nextsector;
                                j = 1;
                                break;
                            }
                        }

                        if (j === 0) {
                            throw new Error("Subway found no zero'd sectors with locators at (" +
                                sp.x + "," + sp.y + ").");
                        }

                        sp.owner = -1;
                        hittype[i].temp_data[0] = s;

                        if (sp.lotag != 30)
                            hittype[i].temp_data[3] = sp.hitag;
                    }

                    else if (sp.lotag === 16)
                        hittype[i].temp_data[3] = sector[sect].ceilingz;

                    else if (sp.lotag === 26) {
                        hittype[i].temp_data[3] = sp.x;
                        hittype[i].temp_data[4] = sp.y;
                        if (sp.shade === sector[sect].floorshade) //UP
                            sp.zvel = -256;
                        else
                            sp.zvel = 256;

                        sp.shade = 0;
                    }
                    else if (sp.lotag === 2) {
                        hittype[i].temp_data[5] = sector[sp.sectnum].floorheinum;
                        sector[sp.sectnum].floorheinum = 0;
                    }
            }

            switch (sp.lotag) {
                case 6:
                case 14:
                    j = callsound(sect, i);
                    if (j === -1) j = SUBWAY;
                    hittype[i].lastvx = j;
                case 30:
                    if (numplayers > 1) break;
                case 0:
                case 1:
                case 5:
                case 11:
                case 15:
                case 16:
                case 26:
                    setsectinterpolate(i);
                    break;
            }

            switch (sprite[i].lotag) {
                case 40:
                case 41:
                case 43:
                case 44:
                case 45:
                    changespritestat(i, 15);
                    break;
                default:
                    changespritestat(i, 3);
                    break;
            }

            break;


        case SEENINE:
        case OOZFILTER:

            sp.shade = -16;
            if (sp.xrepeat <= 8) {
                sp.cstat = 32768;
                sp.xrepeat = sp.yrepeat = 0;
            }
            else sp.cstat = 1 + 256;
            sp.extra = impact_damage << 2;
            sp.owner = i;

            changespritestat(i, 6);
            break;

        case CRACK1:
        case CRACK2:
        case CRACK3:
        case CRACK4:
        case FIREEXT:
            if (sp.picnum == FIREEXT) {
                sp.cstat = 257;
                sp.extra = impact_damage << 2;
            }
            else {
                sp.cstat |= 17;
                sp.extra = 1;
            }

            if (ud.multimode < 2 && sp.pal != 0) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
                break;
            }

            sp.pal = 0;
            sp.owner = i;
            changespritestat(i, 6);
            sp.xvel = 8;
            ssp(i, CLIPMASK0);
            break;

        case TOILET:
        case STALL:
            sp.lotag = 1;
            sp.cstat |= 257;
            sp.clipdist = 8;
            sp.owner = i;
            break;
        case CANWITHSOMETHING:
        case CANWITHSOMETHING2:
        case CANWITHSOMETHING3:
        case CANWITHSOMETHING4:
        case RUBBERCAN:
            sp.extra = 0;
        case EXPLODINGBARREL:
        case HORSEONSIDE:
        case FIREBARREL:
        case NUKEBARREL:
        case FIREVASE:
        case NUKEBARRELDENTED:
        case NUKEBARRELLEAKED:
        case WOODENHORSE:
            if (j >= 0)
                sp.xrepeat = sp.yrepeat = 32;
            sp.clipdist = 72;
            makeitfall(i);
            if (j >= 0)
                sp.owner = j;
            else sp.owner = i;
        case EGG:
            if (ud.monsters_off === 1 && sp.picnum === EGG) {
                sp.xrepeat = sp.yrepeat = 0;
                changespritestat(i, 5);
            }
            else {
                if (sp.picnum == EGG)
                    sp.clipdist = 24;
                sp.cstat = 257 | (krand() & 4);
                changespritestat(i, 2);
            }
            break;
        case TOILETWATER:
            sp.shade = -16;
            changespritestat(i, 6);
            break;
    }

    //printf("cstat: %i\n", sp.cstat);
    //printf("sect: %i\n", sect); //todo: CHECK sect and all objects
    // todo check all... spritetype (Sprite)

    return i;
}

//5413

function animatesprites(x, y, a, smoothratio) {

    var i, j, k, p, sect;
    var l, t1, t3, t4;
    var s, t;
    for (j = 0; j < spritesortcnt; j++) {
        t = tsprite[j];
        i = t.owner;
        s = sprite[t.owner];

        switch (t.picnum) {
            case BLOODPOOL:
            case PUKE:
            case FOOTPRINTS:
            case FOOTPRINTS2:
            case FOOTPRINTS3:
            case FOOTPRINTS4:
                if (t.shade == 127) continue;
                break;
            case RESPAWNMARKERRED:
            case RESPAWNMARKERYELLOW:
            case RESPAWNMARKERGREEN:
                if (ud.marker == 0)
                    t.xrepeat = t.yrepeat = 0;
                continue;
            case CHAIR3:

                k = (((t.ang + 3072 + 128 - a) & 2047) >> 8) & 7;
                if (k > 4) {
                    k = 8 - k;
                    t.cstat |= 4;
                }
                else t.cstat &= ~4;
                t.picnum = s.picnum + k;
                break;
            case BLOODSPLAT1:
            case BLOODSPLAT2:
            case BLOODSPLAT3:
            case BLOODSPLAT4:
                if (ud.lockout) t.xrepeat = t.yrepeat = 0;
                else if (t.pal == 6) {
                    t.shade = -127;
                    continue;
                }
            case BULLETHOLE:
            case CRACK1:
            case CRACK2:
            case CRACK3:
            case CRACK4:
                t.shade = 16;
                continue;
            case NEON1:
            case NEON2:
            case NEON3:
            case NEON4:
            case NEON5:
            case NEON6:
                continue;
            case GREENSLIME:
            case GREENSLIME + 1:
            case GREENSLIME + 2:
            case GREENSLIME + 3:
            case GREENSLIME + 4:
            case GREENSLIME + 5:
            case GREENSLIME + 6:
            case GREENSLIME + 7:
                break;
            default:
                if (((t.cstat & 16)) || (badguy(t) && t.extra > 0) || t.statnum == 10)
                    continue;
        }

        if (sector[t.sectnum].ceilingstat & 1)
            l = sector[t.sectnum].ceilingshade;
        else
            l = sector[t.sectnum].floorshade;

        if (l < -127) l = -127;
        if (l > 128) l = 127;
        t.shade = l;
    }

    NOT_PALONLY:
    for (j = 0; j < spritesortcnt; j++)  //Between drawrooms() and drawmasks()
    {                             //is the perfect time to animate sprites
        t = tsprite[j];
        i = t.owner;
        s = sprite[i];

        switch (s.picnum) {
            case SECTOREFFECTOR:
                if (t.lotag == 27 && ud.recstat == 1) {
                    t.picnum = 11 + ((totalclock >> 3) & 1);
                    t.cstat |= 128;
                }
                else
                    t.xrepeat = t.yrepeat = 0;
                break;
            case NATURALLIGHTNING:
                t.shade = -127;
                break;
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
            case MAN:
            case MAN2:
            case WOMAN:
            case NAKED1:
            case PODFEM1:
            case FEMMAG1:
            case FEMMAG2:
            case FEMPIC1:
            case FEMPIC2:
            case FEMPIC3:
            case FEMPIC4:
            case FEMPIC5:
            case FEMPIC6:
            case FEMPIC7:
            case BLOODYPOLE:
            case FEM6PAD:
            case STATUE:
            case STATUEFLASH:
            case OOZ:
            case OOZ2:
            case WALLBLOOD1:
            case WALLBLOOD2:
            case WALLBLOOD3:
            case WALLBLOOD4:
            case WALLBLOOD5:
            case WALLBLOOD7:
            case WALLBLOOD8:
            case SUSHIPLATE1:
            case SUSHIPLATE2:
            case SUSHIPLATE3:
            case SUSHIPLATE4:
            case FETUS:
            case FETUSJIB:
            case FETUSBROKE:
            case HOTMEAT:
            case FOODOBJECT16:
            case DOLPHIN1:
            case DOLPHIN2:
            case TOUGHGAL:
            case TAMPON:
            case XXXSTACY:
            case 4946:
            case 4947:
            case 693:
            case 2254:
            case 4560:
            case 4561:
            case 4562:
            case 4498:
            case 4957:
                if (ud.lockout) {
                    t.xrepeat = t.yrepeat = 0;
                    continue;
                }
        }

        if (t.statnum == 99) continue;
        if (s.statnum != 1 && s.picnum == APLAYER && ps[s.yvel].newowner == -1 && s.owner >= 0) {
            t.x -= mulscale16(65536 - smoothratio, ps[s.yvel].posx - ps[s.yvel].oposx);
            t.y -= mulscale16(65536 - smoothratio, ps[s.yvel].posy - ps[s.yvel].oposy);
            t.z = ps[s.yvel].oposz + mulscale16(smoothratio, ps[s.yvel].posz - ps[s.yvel].oposz);
            t.z += (40 << 8);
        }
        else if ((s.statnum == 0 && s.picnum != CRANEPOLE) || s.statnum == 10 || s.statnum == 6 || s.statnum == 4 || s.statnum == 5 || s.statnum == 1) {
            t.x -= mulscale16(65536 - smoothratio, s.x - hittype[i].bposx);
            t.y -= mulscale16(65536 - smoothratio, s.y - hittype[i].bposy);
            t.z -= mulscale16(65536 - smoothratio, s.z - hittype[i].bposz);
        }

        sect = s.sectnum;
        t1 = hittype[i].temp_data[1]; t3 = hittype[i].temp_data[3]; t4 = hittype[i].temp_data[4];

        switch (s.picnum) {
            case DUKELYINGDEAD:
                t.z += (24 << 8);
                break;
            case BLOODPOOL:
            case FOOTPRINTS:
            case FOOTPRINTS2:
            case FOOTPRINTS3:
            case FOOTPRINTS4:
                if (t.pal == 6)
                    t.shade = -127;
            case PUKE:
            case MONEY:
            case MONEY + 1:
            case MAIL:
            case MAIL + 1:
            case PAPER:
            case PAPER + 1:
                if (ud.lockout && s.pal == 2) {
                    t.xrepeat = t.yrepeat = 0;
                    continue;
                }
                break;
            case TRIPBOMB:
                continue;
            case FORCESPHERE:
                if (t.statnum == 5) {
                    var sqa, sqb;

                    sqa =
					    getangle(
					    sprite[s.owner].x - ps[screenpeek].posx,
					    sprite[s.owner].y - ps[screenpeek].posy);
                    sqb =
					    getangle(
					    sprite[s.owner].x - t.x,
					    sprite[s.owner].y - t.y);

                    if (klabs(getincangle(sqa, sqb)) > 512)
                        if (ldist(sprite[s.owner], t) < ldist(sprite[ps[screenpeek].i], sprite[s.owner]))
                            t.xrepeat = t.yrepeat = 0;
                }
                continue;
            case BURNING:
            case BURNING2:
                if (sprite[s.owner].statnum == 10) {
                    if (display_mirror == 0 && sprite[s.owner].yvel == screenpeek && ps[sprite[s.owner].yvel].over_shoulder_on == 0)
                        t.xrepeat = 0;
                    else {
                        t.ang = getangle(x - t.x, y - t.y);
                        t.x = sprite[s.owner].x;
                        t.y = sprite[s.owner].y;
                        t.x += sintable[(t.ang + 512) & 2047] >> 10;
                        t.y += sintable[t.ang & 2047] >> 10;
                    }
                }
                break;

            case ATOMICHEALTH:
                t.z -= (4 << 8);
                break;
            case CRYSTALAMMO:
                t.shade = (sintable[(totalclock << 4) & 2047] >> 10);
                continue;
            case VIEWSCREEN:
            case VIEWSCREEN2:
                if (camsprite >= 0 && hittype[sprite[i].owner].temp_data[0] == 1) {
                    t.picnum = STATIC;
                    t.cstat |= (rand() & 12);
                    t.xrepeat += 8;
                    t.yrepeat += 8;
                }
                break;

            case SHRINKSPARK:
                t.picnum = SHRINKSPARK + ((totalclock >> 4) & 3);
                break;
            case GROWSPARK:
                t.picnum = GROWSPARK + ((totalclock >> 4) & 3);
                break;
            case RPG:
                k = getangle(s.x - x, s.y - y);
                k = (((s.ang + 3072 + 128 - k) & 2047) / 170) | 0;
                if (k > 6) {
                    k = 12 - k;
                    t.cstat |= 4;
                }
                else t.cstat &= ~4;
                t.picnum = RPG + k;
                break;

            case RECON:

                k = getangle(s.x - x, s.y - y);
                if (hittype[i].temp_data[0] < 4)
                    k = (((s.ang + 3072 + 128 - k) & 2047) / 170) | 0;
                else k = (((s.ang + 3072 + 128 - k) & 2047) / 170) | 0;

                if (k > 6) {
                    k = 12 - k;
                    t.cstat |= 4;
                }
                else t.cstat &= ~4;

                if (klabs(t3) > 64) k += 7;
                t.picnum = RECON + k;

                break;

            case APLAYER:

                p = s.yvel;

                if (t.pal == 1) t.z -= (18 << 8);

                if (ps[p].over_shoulder_on > 0 && ps[p].newowner < 0) {
                    t.cstat |= 2;
                    if (screenpeek == myconnectindex && numplayers >= 2) {
                        t.x = omyx + mulscale16((myx - omyx)|0, smoothratio);
                        t.y = omyy + mulscale16((myy - omyy)|0, smoothratio);
                        t.z = omyz + mulscale16((myz - omyz)|0, smoothratio) + (40 << 8);
                        t.ang = omyang + mulscale16((((myang + 1024 - omyang) & 2047) - 1024)|0, smoothratio);
                        t.sectnum = mycursectnum;
                    }
                }

                if ((display_mirror == 1 || screenpeek != p || s.owner == -1) && ud.multimode > 1 && ud.showweapons && sprite[ps[p].i].extra > 0 && ps[p].curr_weapon > 0) {
                    t.copyTo(tsprite[spritesortcnt]);

                    tsprite[spritesortcnt].statnum = 99;

                    tsprite[spritesortcnt].yrepeat = (t.yrepeat >> 3);
                    if (t.yrepeat < 4) t.yrepeat = 4;

                    tsprite[spritesortcnt].shade = t.shade;
                    tsprite[spritesortcnt].cstat = 0;

                    switch (ps[p].curr_weapon) {
                        case PISTOL_WEAPON: tsprite[spritesortcnt].picnum = FIRSTGUNSPRITE; break;
                        case SHOTGUN_WEAPON: tsprite[spritesortcnt].picnum = SHOTGUNSPRITE; break;
                        case CHAINGUN_WEAPON: tsprite[spritesortcnt].picnum = CHAINGUNSPRITE; break;
                        case RPG_WEAPON: tsprite[spritesortcnt].picnum = RPGSPRITE; break;
                        case HANDREMOTE_WEAPON:
                        case HANDBOMB_WEAPON: tsprite[spritesortcnt].picnum = HEAVYHBOMB; break;
                        case TRIPBOMB_WEAPON: tsprite[spritesortcnt].picnum = TRIPBOMBSPRITE; break;
                        case GROW_WEAPON: tsprite[spritesortcnt].picnum = GROWSPRITEICON; break;
                        case SHRINKER_WEAPON: tsprite[spritesortcnt].picnum = SHRINKERSPRITE; break;
                        case FREEZE_WEAPON: tsprite[spritesortcnt].picnum = FREEZESPRITE; break;
                        case DEVISTATOR_WEAPON: tsprite[spritesortcnt].picnum = DEVISTATORSPRITE; break;
                    }

                    if (s.owner >= 0)
                        tsprite[spritesortcnt].z = ps[p].posz - (12 << 8);
                    else tsprite[spritesortcnt].z = s.z - (51 << 8);
                    if (ps[p].curr_weapon == HANDBOMB_WEAPON) {
                        tsprite[spritesortcnt].xrepeat = 10;
                        tsprite[spritesortcnt].yrepeat = 10;
                    }
                    else {
                        tsprite[spritesortcnt].xrepeat = 16;
                        tsprite[spritesortcnt].yrepeat = 16;
                    }
                    tsprite[spritesortcnt].pal = 0;
                    spritesortcnt++;
                }

                PALONLY:
                    while (true) {
                        if (s.owner == -1) {
                            k = (((s.ang + 3072 + 128 - a) & 2047) >> 8) & 7;
                            if (k > 4) {
                                k = 8 - k;
                                t.cstat |= 4;
                            } else t.cstat &= ~4;

                            if (sector[t.sectnum].lotag == 2) k += 1795 - 1405;
                            else if ((hittype[i].floorz - s.z) > (64 << 8)) k += 60;

                            t.picnum += k;
                            t.pal = ps[p].palookup;

                            break PALONLY;
                        }

                        if (ps[p].on_crane == -1 && (sector[s.sectnum].lotag & 0x7ff) != 1) {
                            l = s.z - hittype[ps[p].i].floorz + (3 << 8);
                            if (l > 1024 && s.yrepeat > 32 && s.extra > 0)
                                s.yoffset = toInt8(l / (s.yrepeat << 2));
                            else s.yoffset = 0;
                        }

                        if (ps[p].newowner > -1) {
                            t4 = script[actorscrptr[APLAYER] + 1];
                            t3 = 0;
                            t1 = script[actorscrptr[APLAYER] + 2];
                        }

                        if (ud.camerasprite == -1 && ps[p].newowner == -1)
                            if (s.owner >= 0 && display_mirror == 0 && ps[p].over_shoulder_on == 0)
                                if (ud.multimode < 2 || (ud.multimode > 1 && p == screenpeek)) {
                                    t.owner = -1;
                                    t.xrepeat = t.yrepeat = 0;
                                    continue NOT_PALONLY;
                                }

                        break;
                    } //PALONLY:

                if (sector[sect].floorpal)
                    t.pal = sector[sect].floorpal;

                if (s.owner == -1) continue;

                if (t.z > hittype[i].floorz && t.xrepeat < 32)
                    t.z = hittype[i].floorz;

                break;

            case JIBS1:
            case JIBS2:
            case JIBS3:
            case JIBS4:
            case JIBS5:
            case JIBS6:
            case HEADJIB1:
            case LEGJIB1:
            case ARMJIB1:
            case LIZMANHEAD1:
            case LIZMANARM1:
            case LIZMANLEG1:
            case DUKELEG:
            case DUKEGUN:
            case DUKETORSO:
                if (ud.lockout) {
                    t.xrepeat = t.yrepeat = 0;
                    continue;
                }
                if (t.pal == 6) t.shade = -120;

            case SCRAP1:
            case SCRAP2:
            case SCRAP3:
            case SCRAP4:
            case SCRAP5:
            case SCRAP6:
            case SCRAP6 + 1:
            case SCRAP6 + 2:
            case SCRAP6 + 3:
            case SCRAP6 + 4:
            case SCRAP6 + 5:
            case SCRAP6 + 6:
            case SCRAP6 + 7:

                if (hittype[i].picnum == BLIMP && t.picnum == SCRAP1 && s.yvel >= 0)
                    t.picnum = s.yvel;
                else t.picnum += hittype[i].temp_data[0];
                t.shade -= 6;

                if (sector[sect].floorpal)
                    t.pal = sector[sect].floorpal;
                break;

            case WATERBUBBLE:
                if (sector[t.sectnum].floorpicnum == FLOORSLIME) {
                    t.pal = 7;
                    break;
                }
            default:

                if (sector[sect].floorpal)
                    t.pal = sector[sect].floorpal;
                break;
        }

        if (actorscrptr[s.picnum]) {
            printf("todo FIX_00093 in game.c\n");
            if (t4 > 10000)
                // FIX_00093: fixed crashbugs in multiplayer (mine/blimp)
                // This is the mine issue (confusion bug in hittype[i].temp_data[4] usage)
                // close to blimp bug (search for BLIMP)
                // . t4 aka macro hittype[i].temp_data[4] is incremented at DETONATEB: in actor.c
                // for a time counter. Instead we want an address.
                // Issue happens in confessn.map (do a dnclip + dnkroz + dncoords,
                // start with duke3d_w32 /m /q2 -map confessn.map)
                // go through the Guilty logo till x = -2932, y = 42174, z = 18416.
                // blow up the bomb. Wait in the water. Look at the respawn sign
                // at the bottom of the chain. Crashes when it's about to respawn.
                // Lame fix. ok for w32. Doesn't work for other plateform.
                // How to make a differene between a timer and an address??
            {
                l = script[t4 + 2/*8*/];// *(int32_t *)(t4+8);
                printf("l: %i\n", l);

                switch (l) {
                    case 2:
                        k = (((s.ang + 3072 + 128 - a) & 2047) >> 8) & 1;
                        break;

                    case 3:
                    case 4:
                        k = (((s.ang + 3072 + 128 - a) & 2047) >> 7) & 7;
                        if (k > 3) {
                            t.cstat |= 4;
                            k = 7 - k;
                        }
                        else t.cstat &= ~4;
                        break;

                    case 5:
                        k = getangle(s.x - x, s.y - y);
                        k = (((s.ang + 3072 + 128 - k) & 2047) >> 8) & 7;
                        if (k > 4) {
                            k = 8 - k;
                            t.cstat |= 4;
                        }
                        else t.cstat &= ~4;
                        break;
                    case 7:
                        k = getangle(s.x - x, s.y - y);
                        k = (((s.ang + 3072 + 128 - k) & 2047) / 170) | 0;
                        if (k > 6) {
                            k = 12 - k;
                            t.cstat |= 4;
                        }
                        else t.cstat &= ~4;
                        break;
                    case 8:
                        k = (((s.ang + 3072 + 128 - a) & 2047) >> 8) & 7;
                        t.cstat &= ~4;
                        break;
                    default:
                        k = 0;
                        break;
                }

                t.picnum += k + script[t4] + l * t3; //( *(int32_t *)t4 ) + l * t3;
                printf("FIX_00093 picnum %i\n", t.picnum);

                if (l > 0)
                    while (tiles[t.picnum].dim.width == 0 && t.picnum > 0)
                        t.picnum -= l;       //Hack, for actors

                if (hittype[i].dispicnum >= 0)
                    hittype[i].dispicnum = t.picnum;
            }
            else if (display_mirror == 1)
                t.cstat |= 4;
        }

        if (s.statnum == 13 || badguy(s) || (s.picnum == APLAYER && s.owner >= 0))
            if (t.statnum != 99 && s.picnum != EXPLOSION2 && s.picnum != HANGLIGHT && s.picnum != DOMELITE)
                if (s.picnum != HOTMEAT) {
                    if (hittype[i].dispicnum < 0) {
                        hittype[i].dispicnum++;
                        continue;
                    }
                    else if (ud.shadows && spritesortcnt < (MAXSPRITESONSCREEN - 2)) {
                        var daz, xrep, yrep;

                        if ((sector[sect].lotag & 0xff) > 2 || s.statnum == 4 || s.statnum == 5 || s.picnum == DRONE || s.picnum == COMMANDER)
                            daz = sector[sect].floorz;
                        else
                            daz = hittype[i].floorz;

                        if ((s.z - daz) < (8 << 8))
                            if (ps[screenpeek].posz < daz) {
                                t.copyTo(tsprite[spritesortcnt]);

                                tsprite[spritesortcnt].statnum = 99;

                                tsprite[spritesortcnt].yrepeat = (t.yrepeat >> 3);
                                if (t.yrepeat < 4) t.yrepeat = 4;

                                tsprite[spritesortcnt].shade = 127;
                                tsprite[spritesortcnt].cstat |= 2;

                                tsprite[spritesortcnt].z = daz;
                                xrep = tsprite[spritesortcnt].xrepeat;// - (klabs(daz-t.z)>>11);
                                tsprite[spritesortcnt].xrepeat = xrep;
                                tsprite[spritesortcnt].pal = 4;

                                yrep = tsprite[spritesortcnt].yrepeat;// - (klabs(daz-t.z)>>11);
                                tsprite[spritesortcnt].yrepeat = yrep;
                                spritesortcnt++;
                            }
                    }

                    if (ps[screenpeek].heat_amount > 0 && ps[screenpeek].heat_on) {
                        t.pal = 6;
                        t.shade = 0;
                    }
                }


        switch (s.picnum) {
            case LASERLINE:
                if (sector[t.sectnum].lotag == 2) t.pal = 8;
                t.z = sprite[s.owner].z - (3 << 8);
                if (lasermode == 2 && ps[screenpeek].heat_on == 0)
                    t.yrepeat = 0;
            case EXPLOSION2:
            case EXPLOSION2BOT:
            case FREEZEBLAST:
            case ATOMICHEALTH:
            case FIRELASER:
            case SHRINKSPARK:
            case GROWSPARK:
            case CHAINGUN:
            case SHRINKEREXPLOSION:
            case RPG:
            case FLOORFLAME:
                if (t.picnum == EXPLOSION2) {
                    ps[screenpeek].visibility = -127;
                    lastvisinc = totalclock + 32;
                    restorepalette = 1;
                }
                t.shade = -127;
                break;
            case FIRE:
            case FIRE2:
            case BURNING:
            case BURNING2:
                if (sprite[s.owner].picnum != TREE1 && sprite[s.owner].picnum != TREE2)
                    t.z = sector[t.sectnum].floorz;
                t.shade = -127;
                break;
            case COOLEXPLOSION1:
                t.shade = -127;
                t.picnum += (s.shade >> 1);
                break;
            case PLAYERONWATER:

                k = (((t.ang + 3072 + 128 - a) & 2047) >> 8) & 7;
                if (k > 4) {
                    k = 8 - k;
                    t.cstat |= 4;
                }
                else t.cstat &= ~4;

                t.picnum = s.picnum + k + ((hittype[i].temp_data[0] < 4) * 5);
                t.shade = sprite[s.owner].shade;

                break;

            case WATERSPLASH2:
                t.picnum = WATERSPLASH2 + t1;
                break;
            case REACTOR2:
                t.picnum = s.picnum + hittype[i].temp_data[2];
                break;
            case SHELL:
                t.picnum = s.picnum + (hittype[i].temp_data[0] & 1);
            case SHOTGUNSHELL:
                t.cstat |= 12;
                if (hittype[i].temp_data[0] > 1) t.cstat &= ~4;
                if (hittype[i].temp_data[0] > 2) t.cstat &= ~12;
                break;
            case FRAMEEFFECT1:
            case FRAMEEFFECT1_13CON:
                if (s.owner >= 0 && sprite[s.owner].statnum < MAXSTATUS) {
                    if (sprite[s.owner].picnum == APLAYER)
                        if (ud.camerasprite == -1)
                            if (screenpeek == sprite[s.owner].yvel && display_mirror == 0) {
                                t.owner = -1;
                                break;
                            }
                    if ((sprite[s.owner].cstat & 32768) == 0) {
                        t.picnum = hittype[s.owner].dispicnum;
                        t.pal = sprite[s.owner].pal;
                        t.shade = sprite[s.owner].shade;
                        t.ang = sprite[s.owner].ang;
                        t.cstat = 2 | sprite[s.owner].cstat;
                    }
                }
                break;

            case CAMERA1:
            case RAT:
                k = (((t.ang + 3072 + 128 - a) & 2047) >> 8) & 7;
                if (k > 4) {
                    k = 8 - k;
                    t.cstat |= 4;
                }
                else t.cstat &= ~4;
                t.picnum = s.picnum + k;
                break;
        }

        hittype[i].dispicnum = t.picnum;
        if (sector[t.sectnum].floorpicnum == MIRROR)
            t.xrepeat = t.yrepeat = 0;
    }
}

var NUMCHEATCODES = 26;
var cheatquotes = [
    "cornholio", // 0
    "stuff", // 1
    "scotty###", // 2
    "coords", // 3
    "view", // 4
    "time", // 5
    "unlock", // 6
    "cashman", // 7 
    "items", // 8
    "rate", // 9
    "skill#", // 10
    "beta", // 11
    "hyper", // 12
    "monsters", // 13
    "<RESERVED>", // 14
    "<RESERVED>", // 15
    "todd", // 16
    "showmap", // 17
    "kroz", // 18
    "allen", // 19
    "clip", // 20
    "weapons", // 21
    "inventory", // 22
    "keys", // 23
    "debug"		// 24
    //    {"ending"}
];

var cheatbuf = new Uint8Array(10), cheatbuflen = 0;
function cheats() {
    var ch, i, j, k, weapon;

    if ((ps[myconnectindex].gm & MODE_TYPE) || (ps[myconnectindex].gm & MODE_MENU))
        return;

    if (ps[myconnectindex].cheat_phase == 1) {
        while (KB.keyWaiting()) {
            FOUNDCHEAT:
                while (true) {

                    ch = String.fromCharCode(KB_Getch());
                    ch = ch.toLowerCase();
                    console.log("char: %s", ch)

                    if (!((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))) {
                        ps[myconnectindex].cheat_phase = 0;
                        //             FTA(46,ps[myconnectindex]);
                        return;
                    }
                    cheatbuf[cheatbuflen++] = ch.charCodeAt(0);
                    cheatbuf[cheatbuflen] = 0;

                    if (cheatbuflen > 11) {
                        ps[myconnectindex].cheat_phase = 0;
                        return;
                    }

                    for (k = 0; k < NUMCHEATCODES; k++) {
                        for (j = 0; j < cheatbuflen; j++) {
                            if (cheatquotes[k] && (cheatbuf[j] == cheatquotes[k].charCodeAt(j) || (cheatquotes[k][j] == '#' && ch >= '0' && ch <= '9'))) {
                                if (!cheatquotes[k][j + 1]) { break FOUNDCHEAT; /*goto FOUNDCHEAT;*/ }
                                if (j == cheatbuflen - 1) return;
                            }
                            else break;
                        }
                    }

                    ps[myconnectindex].cheat_phase = 0;
                    return;
                }

            //FOUNDCHEAT:
            {
                switch (k) {
                    case 0: // cornholio
                    case 18: // kroz

                        ud.god = 1 - ud.god;

                        if (ud.god) { // set on
                            pus = 1;
                            pub = 1;
                            sprite[ps[myconnectindex].i].cstat = 257;

                            hittype[ps[myconnectindex].i].temp_data[0] = 0;
                            hittype[ps[myconnectindex].i].temp_data[1] = 0;
                            hittype[ps[myconnectindex].i].temp_data[2] = 0;
                            hittype[ps[myconnectindex].i].temp_data[3] = 0;
                            hittype[ps[myconnectindex].i].temp_data[4] = 0;
                            hittype[ps[myconnectindex].i].temp_data[5] = 0;

                            sprite[ps[myconnectindex].i].hitag = 0;
                            sprite[ps[myconnectindex].i].lotag = 0;
                            sprite[ps[myconnectindex].i].pal =
                                ps[myconnectindex].palookup;

                            FTA(17, ps[myconnectindex], 1);
                        }
                        else // set off
                        {
                            ud.god = 0;
                            sprite[ps[myconnectindex].i].extra = max_player_health;
                            hittype[ps[myconnectindex].i].extra = -1;
                            ps[myconnectindex].last_extra = max_player_health;
                            FTA(18, ps[myconnectindex], 1);
                        }

                        sprite[ps[myconnectindex].i].extra = max_player_health;
                        hittype[ps[myconnectindex].i].extra = 0;
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();

                        return;

                    case 1: // stuff

                        if (VOLUMEONE)
                            j = 6;
                        else
                            j = 0;

                        for (weapon = PISTOL_WEAPON; weapon < MAX_WEAPONS - j; weapon++)
                            ps[myconnectindex].gotweapon[weapon] = 1;

                        for (weapon = PISTOL_WEAPON;
                            weapon < (MAX_WEAPONS - j) ;
                            weapon++)
                            addammo(weapon, ps[myconnectindex], max_ammo_amount[weapon]);

                        ps[myconnectindex].ammo_amount[GROW_WEAPON] = 50;

                        ps[myconnectindex].steroids_amount = 400;
                        ps[myconnectindex].heat_amount = 1200;
                        ps[myconnectindex].boot_amount = 200;
                        ps[myconnectindex].shield_amount = 100;
                        ps[myconnectindex].scuba_amount = 6400;
                        ps[myconnectindex].holoduke_amount = 2400;
                        ps[myconnectindex].jetpack_amount = 1600;
                        ps[myconnectindex].firstaid_amount = max_player_health;

                        ps[myconnectindex].got_access = 7;
                        FTA(5, ps[myconnectindex], 1);
                        ps[myconnectindex].cheat_phase = 0;

                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        ps[myconnectindex].inven_icon = 1;
                        return;

                    case 2:  // dnscotty###
                    case 10: // skill#
                        if (k == 2) {
                            var volnume, levnume;
                            volnume = cheatbuf[6] - '0'.charCodeAt(0);
                            levnume = (cheatbuf[7] - '0'.charCodeAt(0)) * 10 + (cheatbuf[8] - '0'.charCodeAt(0));

                            volnume--;
                            levnume--;
                            if (VOLUMEONE) {
                                if (volnume > 0) {
                                    ps[myconnectindex].cheat_phase = 0;
                                    KB.flushKeyboardQueue();
                                    return;
                                }
                            }

                            if ((volnume > 4) && PLUTOPAK) {
                                ps[myconnectindex].cheat_phase = 0;
                                KB.flushKeyboardQueue();
                                return;
                            }
                            else

                                if ((volnume > 3) && !PLUTOPAK) {
                                    ps[myconnectindex].cheat_phase = 0;
                                    KB.flushKeyboardQueue();
                                    return;
                                }
                                else

                                    if (volnume == 0) {
                                        if (levnume > 5) {
                                            ps[myconnectindex].cheat_phase = 0;
                                            KB.flushKeyboardQueue();
                                            return;
                                        }
                                    }
                                    else {
                                        if (levnume >= 11) {
                                            ps[myconnectindex].cheat_phase = 0;
                                            KB.flushKeyboardQueue();
                                            return;
                                        }
                                    }

                            ud.m_volume_number = ud.volume_number = volnume;
                            ud.m_level_number = ud.level_number = levnume;

                        }
                        else ud.m_player_skill = ud.player_skill =
                            cheatbuf[5] - '1'.charCodeAt(0);

                        if (numplayers > 1 && myconnectindex == connecthead) {
                            tempbuf[0] = 5;
                            tempbuf[1] = ud.m_level_number;
                            tempbuf[2] = ud.m_volume_number;
                            tempbuf[3] = ud.m_player_skill;
                            tempbuf[4] = ud.m_monsters_off;
                            tempbuf[5] = ud.m_respawn_monsters;
                            tempbuf[6] = ud.m_respawn_items;
                            tempbuf[7] = ud.m_respawn_inventory;
                            tempbuf[8] = ud.m_coop;
                            tempbuf[9] = ud.m_marker;
                            tempbuf[10] = ud.m_ffire;

                            throw "todo sendpacket stuff"
                            //////for(i=connecthead;i>=0;i=connectpoint2[i])
                            //////    sendpacket(i,(uint8_t*)tempbuf,11);
                        }
                        else ps[myconnectindex].gm |= MODE_RESTART;

                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 3: // coords
                        ps[myconnectindex].cheat_phase = 0;
                        ud.coords = 1 - ud.coords;
                        KB.flushKeyboardQueue();
                        return;

                    case 4: // view
                        if (ps[myconnectindex].over_shoulder_on)
                            ps[myconnectindex].over_shoulder_on = 0;
                        else {
                            ps[myconnectindex].over_shoulder_on = 1;
                            cameradist = 0;
                            cameraclock = totalclock;
                        }
                        // FTA(22,ps[myconnectindex],1);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 5: // time
                        // FTA(21,ps[myconnectindex]);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 6: // unlock
                        for (i = numsectors - 1; i >= 0; i--) //Unlock
                        {
                            j = sector[i].lotag;
                            if (j == -1 || j == 32767) continue;
                            if ((j & 0x7fff) > 2) {
                                if (j & (0xffff - 16384))
                                    sector[i].lotag &= (0xffff - 16384);
                                operatesectors(i, ps[myconnectindex].i);
                            }
                        }
                        operateforcefields(ps[myconnectindex].i, -1);

                        FTA(100, ps[myconnectindex], 1);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 7: // cashman
                        ud.cashman = 1 - ud.cashman;
                        KB.clearKeyDown(sc_N);
                        ps[myconnectindex].cheat_phase = 0;
                        return;

                    case 8: // items
                        ps[myconnectindex].steroids_amount = 400;
                        ps[myconnectindex].heat_amount = 1200;
                        ps[myconnectindex].boot_amount = 200;
                        ps[myconnectindex].shield_amount = 100;
                        ps[myconnectindex].scuba_amount = 6400;
                        ps[myconnectindex].holoduke_amount = 2400;
                        ps[myconnectindex].jetpack_amount = 1600;

                        ps[myconnectindex].firstaid_amount = max_player_health;
                        ps[myconnectindex].got_access = 7;
                        FTA(5, ps[myconnectindex], 1);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 9: // rate
                        ud.tickrate ^= 1;
                        vscrn(); // FIX_00056: Refresh issue w/FPS, small Weapon and custom FTA, when screen resized down
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 11: // beta
                        FTA(105, ps[myconnectindex], 1);
                        KB.clearKeyDown(sc_H);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 12: // hyper
                        ps[myconnectindex].steroids_amount = 399;
                        ps[myconnectindex].heat_amount = 1200;
                        ps[myconnectindex].cheat_phase = 0;
                        FTA(37, ps[myconnectindex], 1);
                        KB.flushKeyboardQueue();
                        return;

                    case 13: // monsters
                        if (actor_tog == 3) actor_tog = 0;
                        actor_tog++;
                        ps[screenpeek].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 14: // <RESERVED>
                    case 25: // ??
                        ud.eog = 1;
                        ps[myconnectindex].gm |= MODE_EOL;
                        KB.flushKeyboardQueue();
                        return;

                    case 15: // <RESERVED>
                        ps[myconnectindex].gm = MODE_EOL;
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 16: // todd
                        FTA(99, ps[myconnectindex], 1);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 17: // showmap
                        ud.showallmap = 1 - ud.showallmap;
                        if (ud.showallmap) {
                            for (i = 0; i < (MAXSECTORS >> 3) ; i++)
                                show2dsector[i] = 255;
                            for (i = 0; i < (MAXWALLS >> 3) ; i++)
                                show2dwall[i] = 255;
                            FTA(111, ps[myconnectindex], 1);
                        }
                        else {
                            for (i = 0; i < (MAXSECTORS >> 3) ; i++)
                                show2dsector[i] = 0;
                            for (i = 0; i < (MAXWALLS >> 3) ; i++)
                                show2dwall[i] = 0;
                            FTA(1, ps[myconnectindex], 1);
                        }
                        ps[myconnectindex].cheat_phase = 0;
                        KB.flushKeyboardQueue();
                        return;

                    case 19: // allen
                        FTA(79, ps[myconnectindex], 1);
                        ps[myconnectindex].cheat_phase = 0;
                        KB.clearKeyDown(sc_N);
                        return;

                    case 20: // clip
                        ud.clipping = 1 - ud.clipping;
                        KB.flushKeyboardQueue();
                        ps[myconnectindex].cheat_phase = 0;
                        FTA(112 + ud.clipping, ps[myconnectindex], 1);
                        return;

                    case 21: // weapons
                        if (VOLUMEONE)
                            j = 6;
                        else
                            j = 0;

                        for (weapon = PISTOL_WEAPON; weapon < MAX_WEAPONS - j; weapon++) {
                            addammo(weapon, ps[myconnectindex], max_ammo_amount[weapon]);
                            ps[myconnectindex].gotweapon[weapon] = 1;
                        }

                        KB.flushKeyboardQueue();
                        ps[myconnectindex].cheat_phase = 0;
                        FTA(119, ps[myconnectindex], 1);
                        return;

                    case 22: // inventory
                        KB.flushKeyboardQueue();
                        ps[myconnectindex].cheat_phase = 0;
                        ps[myconnectindex].steroids_amount = 400;
                        ps[myconnectindex].heat_amount = 1200;
                        ps[myconnectindex].boot_amount = 200;
                        ps[myconnectindex].shield_amount = 100;
                        ps[myconnectindex].scuba_amount = 6400;
                        ps[myconnectindex].holoduke_amount = 2400;
                        ps[myconnectindex].jetpack_amount = 1600;
                        ps[myconnectindex].firstaid_amount = max_player_health;
                        FTA(120, ps[myconnectindex], 1);
                        ps[myconnectindex].cheat_phase = 0;
                        return;

                    case 23: // keys
                        ps[myconnectindex].got_access = 7;
                        KB.flushKeyboardQueue();
                        ps[myconnectindex].cheat_phase = 0;
                        FTA(121, ps[myconnectindex], 1);
                        return;

                    case 24: // debug
                        debug_on = 1 - debug_on;
                        KB.flushKeyboardQueue();
                        ps[myconnectindex].cheat_phase = 0;
                        break;
                }
            }
        }
    }

    else {
        if (KB.keyPressed(sc_D)) {
            if (ps[myconnectindex].cheat_phase >= 0 && numplayers < 2 && ud.recstat == 0)
                ps[myconnectindex].cheat_phase = -1;
        }

        if (KB.keyPressed(sc_N)) {
            if (ps[myconnectindex].cheat_phase == -1) {
                if (ud.player_skill == 4) {
                    FTA(22, ps[myconnectindex], 1);
                    ps[myconnectindex].cheat_phase = 0;
                }
                else {
                    ps[myconnectindex].cheat_phase = 1;
                    //                    FTA(25,ps[myconnectindex]);
                    cheatbuflen = 0;
                }
                KB.flushKeyboardQueue();
            }
            else if (ps[myconnectindex].cheat_phase != 0) {
                ps[myconnectindex].cheat_phase = 0;
                KB.clearKeyDown(sc_D);
                KB.clearKeyDown(sc_N);
            }
        }
    }
}

//6626
var nonsharedtimer = 0;
function nonsharedkeys() {
    var i, ch;
    var j;
    var text = "";


    if (ud.recstat == 2) {
        var noshareinfo = new ControlInfo();
        Control.getInput(noshareinfo);
    }

    if (KB.keyPressed(sc_F12)) {
        KB.clearKeyDown(sc_F12);
        takescreenshot();
        // FTA(103,ps[myconnectindex]); done better in takescreenshot()
    }

    if (!ALT_IS_PRESSED && ud.overhead_on == 0) {
        if (ACTION(gamefunc_Enlarge_Screen)) {
            CONTROL_ClearAction(gamefunc_Enlarge_Screen);
            if (ud.screen_size > 0)
                sound(THUD);

            // FIX_00027: Added an extra small statusbar (HUD)
            if (ud.screen_size == 4) {
                ud.extended_screen_size++;
                if (ud.extended_screen_size == 2) {
                    ud.extended_screen_size = 1;
                    ud.screen_size -= 4;
                }
            }
            else
                ud.screen_size -= 4;
            vscrn();
        }
        if (ACTION(gamefunc_Shrink_Screen)) {
            CONTROL_ClearAction(gamefunc_Shrink_Screen);
            if (ud.screen_size < 64) sound(THUD);

            // FIX_00027: Added an extra small statusbar (HUD)
            if (ud.screen_size == 4) {
                ud.extended_screen_size--;
                if (ud.extended_screen_size < 0) {
                    ud.extended_screen_size = 0;
                    ud.screen_size += 4;
                }
            }
            else
                ud.screen_size += 4;
            vscrn();
        }

        if (ud.screen_size < 4)
            ud.extended_screen_size = 1;
        else if (ud.screen_size > 4)
            ud.extended_screen_size = 0;

    }

    if (ps[myconnectindex].cheat_phase == 1 || ps[myconnectindex].gm & (MODE_MENU | MODE_TYPE)) return;

    if (ACTION(gamefunc_See_Coop_View) && (ud.coop == 1 || ud.recstat == 2)) {
        CONTROL_ClearAction(gamefunc_See_Coop_View);
        screenpeek = connectpoint2[screenpeek];
        if (screenpeek == -1) screenpeek = connecthead;
        restorepalette = 1;
    }

    if (ud.multimode > 1 && ACTION(gamefunc_Show_Opponents_Weapon)) {
        CONTROL_ClearAction(gamefunc_Show_Opponents_Weapon);
        ud.showweapons = 1 - ud.showweapons;
        FTA(82 - ud.showweapons, ps[screenpeek], 1);
    }

    if (ACTION(gamefunc_Toggle_Crosshair)) {
        CONTROL_ClearAction(gamefunc_Toggle_Crosshair);
        ud.crosshair = 1 - ud.crosshair;
        FTA(21 - ud.crosshair, ps[screenpeek], 1);
    }

    if (ud.overhead_on && ACTION(gamefunc_Map_Follow_Mode)) {
        CONTROL_ClearAction(gamefunc_Map_Follow_Mode);
        ud.scrollmode = 1 - ud.scrollmode;
        if (ud.scrollmode) {
            ud.folx = ps[screenpeek].oposx;
            ud.foly = ps[screenpeek].oposy;
            ud.fola = ps[screenpeek].oang;
        }
        FTA(83 + ud.scrollmode, ps[myconnectindex], 1);
    }

    if (SHIFTS_IS_PRESSED || ALT_IS_PRESSED) {
        i = 0;
        if (KB.keyPressed(sc_F1)) { KB.clearKeyDown(sc_F1); i = 1; }
        if (KB.keyPressed(sc_F2)) { KB.clearKeyDown(sc_F2); i = 2; }
        if (KB.keyPressed(sc_F3)) { KB.clearKeyDown(sc_F3); i = 3; }
        if (KB.keyPressed(sc_F4)) { KB.clearKeyDown(sc_F4); i = 4; }
        if (KB.keyPressed(sc_F5)) { KB.clearKeyDown(sc_F5); i = 5; }
        if (KB.keyPressed(sc_F6)) { KB.clearKeyDown(sc_F6); i = 6; }
        if (KB.keyPressed(sc_F7)) { KB.clearKeyDown(sc_F7); i = 7; }
        if (KB.keyPressed(sc_F8)) { KB.clearKeyDown(sc_F8); i = 8; }
        if (KB.keyPressed(sc_F9)) { KB.clearKeyDown(sc_F9); i = 9; }
        if (KB.keyPressed(sc_F10)) { KB.clearKeyDown(sc_F10); i = 10; }

        if (i) {
            if (SHIFTS_IS_PRESSED) {
                if (i == 5 && ps[myconnectindex].fta > 0 && ps[myconnectindex].ftq == 26) {
                    music_select++;

                    // FIX_00065: Music cycling with F5 and SHIFT-F5 messed up
                    if (VOLUMEALL) // Then its 1.3d reg
                    {
                        if (music_select == 33) music_select = 0;
                    }
                    else if (VOLUMEONE) {
                        if (music_select == 6) music_select = 0;
                    }
                    else // assume 1.5 or plutopak
                    {
                        if (music_select == 44) music_select = 0;
                    }

                    text = "PLAYING " + music_fn[0][music_select];
                    Music.stopSong(); // FIX_00074: Shift f5 doesn't change hi-res tunes, but only midi tunes.
                    playmusic(music_fn[0][music_select]);
                    fta_quotes[26] = text;
                    FTA(26, ps[myconnectindex], 1);
                    return;
                }

                adduserquote(ud.ridecule[i - 1]);

                ch = 0;

                tempbuf[ch] = 4;
                tempbuf[ch + 1] = 0;

                throw "todo: strcat((char*)tempbuf+1,ud.ridecule[i-1]);";

                i = 1 + ud.ridecule[i - 1].length;

                if (ud.multimode > 1)
                    for (ch = connecthead; ch >= 0; ch = connectpoint2[ch])
                        if (ch != myconnectindex)
                            sendpacket(ch, tempbuf, i);

                pus = NUMPAGES;
                pub = NUMPAGES;

                return;

            }

            if (ud.lockout == 0)
                if (SoundToggle && ALT_IS_PRESSED && (RTS_NumSounds() > 0) && rtsplaying == 0 && VoiceToggle) {
                    throw "todo"
                    //rtsptr = RTS_GetSound (i-1);
                    //if(*rtsptr == 'C')
                    //    FX_PlayVOC3D( rtsptr,0,0,0,255,-i);
                    //else FX_PlayWAV3D( rtsptr,0,0,0,255,-i);

                    //rtsplaying = 7;

                    //if(ud.multimode > 1)
                    //{
                    //    tempbuf[0] = 7;
                    //    tempbuf[1] = i;

                    //    for(ch=connecthead;ch>=0;ch=connectpoint2[ch])
                    //        if(ch != myconnectindex)
                    //            sendpacket(ch,(uint8_t*)tempbuf,2);
                    //}

                    //pus = NUMPAGES;
                    //pub = NUMPAGES;

                    //return;
                }
        }
    }

    if (!ALT_IS_PRESSED && !SHIFTS_IS_PRESSED) {

        if (ud.multimode > 1 && ACTION(gamefunc_SendMessage)) {
            KB.flushKeyboardQueue();
            CONTROL_ClearAction(gamefunc_SendMessage);
            ps[myconnectindex].gm |= MODE_TYPE;
            typebuf[0] = 0;
            inputloc = 0;
        }

        if (KB.keyPressed(sc_F1) || (ud.show_help && (KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter)))) {
            KB.clearKeyDown(sc_F1);
            KB.clearKeyDown(sc_Space);
            KB.clearKeyDown(sc_kpad_Enter);
            KB.clearKeyDown(sc_Enter);
            ud.show_help++;

            if (ud.show_help > 2) {
                ud.show_help = 0;
                if (ud.multimode < 2 && ud.recstat != 2) ready2send = 1;
                vscrn();
            }
            else {
                setview(0, 0, xdim - 1, ydim - 1);
                if (ud.multimode < 2 && ud.recstat != 2) {
                    ready2send = 0;
                    totalclock = ototalclock;
                }
            }
        }

        //        if(ud.multimode < 2)
        {
            if (ud.recstat != 2 && KB.keyPressed(sc_F2)) {
                KB.clearKeyDown(sc_F2);

                if (movesperpacket == 4 && connecthead != myconnectindex)
                    return;

                FAKE_F2:
                    if (sprite[ps[myconnectindex].i].extra <= 0) {
                        FTA(118, ps[myconnectindex], 1);
                        return;
                    }
                cmenu(350);
                screencapt = 1;
                displayrooms(myconnectindex, 65536);
                savetemp("duke3d.tmp", tiles[MAXTILES - 1].data, 160 * 100);
                screencapt = 0;
                FX.stopAllSounds();
                clearsoundlocks();

                //                setview(0,0,xdim-1,ydim-1);
                ps[myconnectindex].gm |= MODE_MENU;

                if (ud.multimode < 2) {
                    ready2send = 0;
                    totalclock = ototalclock;
                    screenpeek = myconnectindex;
                }
            }

            if (KB.keyPressed(sc_F3)) {
                KB.clearKeyDown(sc_F3);

                if (movesperpacket == 4 && connecthead != myconnectindex)
                    return;

                cmenu(300);
                FX.stopAllSounds();
                clearsoundlocks();

                //                setview(0,0,xdim-1,ydim-1);
                ps[myconnectindex].gm |= MODE_MENU;
                if (ud.multimode < 2 && ud.recstat != 2) {
                    ready2send = 0;
                    totalclock = ototalclock;
                }
                screenpeek = myconnectindex;
            }
        }

        if (KB.keyPressed(sc_F4) && FXDevice != NumSoundCards) {
            KB.clearKeyDown(sc_F4);
            FX.stopAllSounds();
            clearsoundlocks();

            ps[myconnectindex].gm |= MODE_MENU;
            if (ud.multimode < 2 && ud.recstat != 2) {
                ready2send = 0;
                totalclock = ototalclock;
            }
            cmenu(700);

        }

        if (KB.keyPressed(sc_F6) && (ps[myconnectindex].gm & MODE_GAME)) {
            KB.clearKeyDown(sc_F6);

            if (movesperpacket == 4 && connecthead != myconnectindex)
                return;

            if (lastsavedpos == -1) throw "goto FAKE_F2;"

            KB.flushKeyboardQueue();

            if (sprite[ps[myconnectindex].i].extra <= 0) {
                FTA(118, ps[myconnectindex], 1);
                return;
            }
            screencapt = 1;
            displayrooms(myconnectindex, 65536);
            savetemp("duke3d.tmp", tiles[MAXTILES - 1].data, 160 * 100);
            screencapt = 0;
            if (lastsavedpos >= 0) {
                inputloc = ud.savegame[lastsavedpos].length;
                current_menu = 360 + lastsavedpos;
                probey = lastsavedpos;
            }
            FX.stopAllSounds();
            clearsoundlocks();

            setview(0, 0, xdim - 1, ydim - 1);
            ps[myconnectindex].gm |= MODE_MENU;
            if (ud.multimode < 2 && ud.recstat != 2) {
                ready2send = 0;
                totalclock = ototalclock;
            }
        }

        if (KB.keyPressed(sc_F7)) {
            KB.clearKeyDown(sc_F7);
            if (ps[myconnectindex].over_shoulder_on)
                ps[myconnectindex].over_shoulder_on = 0;
            else {
                ps[myconnectindex].over_shoulder_on = 1;
                cameradist = 0;
                cameraclock = totalclock;
            }
            FTA(109 + ps[myconnectindex].over_shoulder_on, ps[myconnectindex], 1);
        }

        if (KB.keyPressed(sc_F5) && MusicDevice != NumSoundCards) {
            KB.clearKeyDown(sc_F5);
            text = music_fn[0][music_select] + ".  USE SHIFT-F5 TO CHANGE.";
            fta_quotes[26] = text;
            FTA(26, ps[myconnectindex], 1);

        }

        if (KB.keyPressed(sc_F8)) {
            KB.clearKeyDown(sc_F8);
            ud.fta_on = !ud.fta_on;
            FTA(24 - ud.fta_on, ps[myconnectindex], 1);
        }

        if (KB.keyPressed(sc_F9) && (ps[myconnectindex].gm & MODE_GAME)) {
            KB.clearKeyDown(sc_F9);

            if (movesperpacket == 4 && myconnectindex != connecthead)
                return;

            if (lastsavedpos >= 0) cmenu(15001);
            else cmenu(25000);
            FX.stopAllSounds();
            clearsoundlocks();
            ps[myconnectindex].gm |= MODE_MENU;
            if (ud.multimode < 2 && ud.recstat != 2) {
                ready2send = 0;
                totalclock = ototalclock;
            }
        }

        if (KB.keyPressed(sc_F10)) {
            KB.clearKeyDown(sc_F10);
            cmenu(500);
            FX.stopAllSounds();
            clearsoundlocks();
            ps[myconnectindex].gm |= MODE_MENU;
            if (ud.multimode < 2 && ud.recstat != 2) {
                ready2send = 0;
                totalclock = ototalclock;
            }
        }


        if (ud.overhead_on != 0) {

            j = totalclock - nonsharedtimer; nonsharedtimer += j;
            if (ACTION(gamefunc_Enlarge_Screen))
                ps[myconnectindex].zoom += mulscale6(j, Math.max(ps[myconnectindex].zoom, 256));
            if (ACTION(gamefunc_Shrink_Screen))
                ps[myconnectindex].zoom -= mulscale6(j, Math.max(ps[myconnectindex].zoom, 256));

            if ((ps[myconnectindex].zoom > 2048))
                ps[myconnectindex].zoom = 2048;
            if ((ps[myconnectindex].zoom < 48))
                ps[myconnectindex].zoom = 48;

        }
    }

    if (KB.keyPressed(sc_Escape) && ud.overhead_on && ps[myconnectindex].newowner == -1) {
        KB.clearKeyDown(sc_Escape);
        ud.last_overhead = ud.overhead_on;
        ud.overhead_on = 0;
        ud.scrollmode = 0;
        vscrn();
    }

    if (ACTION(gamefunc_AutoRun)) {
        CONTROL_ClearAction(gamefunc_AutoRun);
        ud.auto_run = 1 - ud.auto_run;
        FTA(85 + ud.auto_run, ps[myconnectindex], 1);
    }

    if (ACTION(gamefunc_Map)) {
        CONTROL_ClearAction(gamefunc_Map);
        if (ud.last_overhead != ud.overhead_on && ud.last_overhead) {
            ud.overhead_on = ud.last_overhead;
            ud.last_overhead = 0;
        }
        else {
            ud.overhead_on++;
            if (ud.overhead_on == 3) ud.overhead_on = 0;
            ud.last_overhead = ud.overhead_on;
        }
        restorepalette = 1;
        vscrn();
    }

    if (KB.keyPressed(sc_F11)) {
        KB.clearKeyDown(sc_F11);
        // FIX_00030: Brightness step was not the same from the keys vs menu 
        if (SHIFTS_IS_PRESSED) ud.brightness -= 8; // Keyboard step must be 8, as the brightness cursor step.
        else ud.brightness += 8;

        if (ud.brightness > 56)
            ud.brightness = 0;
        else if (ud.brightness < 0)
            ud.brightness = 56;

        setBrightness(ud.brightness >> 2, ps[myconnectindex].palette[0]);
        if (ud.brightness < 40) FTA(29 + (ud.brightness >> 3), ps[myconnectindex], 1);
        else if (ud.brightness < 80) FTA(96 + (ud.brightness >> 3) - 5, ps[myconnectindex], 1);
    }
}

//7146
function checkcommandline(argc, argv) {
    //short i, j;
    //char  *c;
    //char  kbdKey;

    ud.fta_on = 1;
    ud.god = 0;
    ud.m_respawn_items = 0;
    ud.m_respawn_monsters = 0;
    ud.m_respawn_inventory = 0;
    ud.warp_on = 0;
    ud.cashman = 0;
    ud.m_player_skill = ud.player_skill = 2;
    ud.multimode_bot = 0;

    console.log("todo checkcommandline");
    //todo....
}

//7486
function logo() {
    //console.log("(9) logo");
    var i, soundanm = 0;

    ready2send = 0;

    KB.flushKeyboardQueue();

    setView(0, 0, xdim - 1, ydim - 1);
    clearView(0);
    palto(0, 0, 0, 63);

    flushperms();
    nextpage();

    Music.stopSong();

    q.setPositionAtStart()
        .addIf(function () { return ud.showcinematics && numplayers < 2; }, function () {
            //console.log("(10) play logo anm");

            // This plays the explosion from the nuclear sign at the beginning.
            q.setPositionAtStart()
                .addIf(function () {
                    return !VOLUMEONE;
                }, function () {
                    // todo: it skips a frame here, how to fix this? addIfExecNow()? or rewrite into one if
                    q.setPositionAtStart()
                        .addIf(function () { return !KB.keyWaiting() && nomorelogohack == 0; },
                            function () {
                                getpackets();
                                q.setPositionAtStart()
                                    .add(function () {
                                        playanm("logo.anm", 5);
                                    }).add(function () {
                                        palto(0, 0, 0, 63);
                                        KB.flushKeyboardQueue();
                                    });
                            })
                        .endIf(/*return !KB.keyWaiting() && nomorelogohack == 0;*/)
                        .add(function () {
                            clearView(0);
                            nextpage();
                        });
                })
                .endIf(/*!VOLUMEONE*/)
                .add(function () {


                    //MIDI start here
                    playmusic(env_music_fn[0]);

                    // "REALITY IS OUR GAME" Screen
                    //console.log("(20) REALITY IS OUR GAME Screen");
                    for (i = 0; i < 64; i += 7) {
                        q.add(i, function (cb, i) {
                            //console.log("(22)");
                            palto(0, 0, 0, i);
                        });
                    }
                    q.add(function () {
                        //console.log("(25)");
                        ps[myconnectindex].palette = drealms;
                        palto(0, 0, 0, 63);
                        rotateSprite(0, 0, 65536, 0, DREALMS, 0, 0, 2 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1);
                        nextpage();

                        q.setInsertPosition(0);
                        for (i = 63; i > 0; i -= 7) {
                            q.add(i, function (cb, i) {
                                //console.log("(30)");
                                palto(0, 0, 0, i);
                            });
                        }
                    });

                    q.add(i, function (cb, i) {
                        totalclock = 0;

                        q.setPositionAtStart().addWhile(function () {
                            return totalclock < (120 * 7) && !KB.keyWaiting();
                        }, function () {
                            q.setPositionAtStart();
                            //console.info("(40) empty func to simuilate waiting, totalclock: %i", totalclock);
                            getpackets();
                        });
                    });

                    for (i = 0; i < 64; i += 7) {
                        q.add(i, function (cb, i) {
                            //console.log("(50)");
                            palto(0, 0, 0, i);
                        });
                    }

                    q.add(function () {
                        //console.log("(60)");
                        clearView(0);
                        nextpage();
                        ps[myconnectindex].palette = titlepal;
                        flushperms();
                        rotateSprite(0, 0, 65536, 0, BETASCREEN, 0, 0, 2 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1);
                        KB.flushKeyboardQueue();
                        nextpage();

                        q.setInsertPosition(0);

                        for (i = 63; i > 0; i -= 7) {
                            q.add(i, function (cb, i) {
                                console.log("(62)");
                                palto(0, 0, 0, i);
                            });
                        }

                        q.add(function () {
                            //Animate screen (Duke picture wiht "DUKE" "NUKEM 3D" coming from far away and hitting the screen"
                            q.setPositionAtStart();
                            q.add(function () {
                                totalclock = 0;
                            })
                                .addWhile(function () {
                                    return totalclock < (860 + 120) && !KB.keyWaiting();
                                }, function () {
                                    q.setPositionAtStart();

                                    rotateSprite(0, 0, 65536, 0, BETASCREEN, 0, 0, 2 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1);

                                    if (totalclock > 120 && totalclock < (120 + 60)) {
                                        if (soundanm == 0) {
                                            soundanm = 1;
                                            sound(PIPEBOMB_EXPLODE);
                                        }
                                        rotateSprite(160 << 16, 104 << 16, (totalclock - 120) << 10, 0, DUKENUKEM, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);
                                    } else if (totalclock >= (120 + 60))
                                        rotateSprite(160 << 16, (104) << 16, 60 << 10, 0, DUKENUKEM, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);

                                    if (totalclock > 220 && totalclock < (220 + 30)) {
                                        if (soundanm == 1) {
                                            soundanm = 2;
                                            sound(PIPEBOMB_EXPLODE);
                                        }

                                        rotateSprite(160 << 16, (104) << 16, 60 << 10, 0, DUKENUKEM, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);
                                        rotateSprite(160 << 16, (129) << 16, (totalclock - 220) << 11, 0, THREEDEE, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);
                                    } else if (totalclock >= (220 + 30))
                                        rotateSprite(160 << 16, (129) << 16, 30 << 11, 0, THREEDEE, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);

                                    if (PLUTOPAK) // FIX_00064: Cinematics explosions were not right for 1.3/1.3d grp.
                                    {
                                        if (totalclock >= 280 && totalclock < 395) {
                                            rotateSprite(160 << 16, (151) << 16, (410 - totalclock) << 12, 0, PLUTOPAKSPRITE + 1, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);
                                            if (soundanm == 2) {
                                                soundanm = 3;
                                                sound(FLY_BY);
                                            }
                                        } else if (totalclock >= 395) {
                                            if (soundanm == 3) {
                                                soundanm = 4;
                                                sound(PIPEBOMB_EXPLODE);
                                            }
                                            rotateSprite(160 << 16, (151) << 16, 30 << 11, 0, PLUTOPAKSPRITE + 1, 0, 0, 2 + 8, 0, 0, xdim - 1, ydim - 1);
                                        }
                                    }

                                    getpackets();
                                    nextpage();

                                } /*while totalclock < (860 + 120) && !KB.keyWaiting()*/);

                        });


                        // FIX_00077: Menu goes directly to the "NEW GAME" sub-menu when starting new game (Turrican)
                        q.add(function () {
                            KB.flushKeyboardQueue();
                        });
                    });

                });
        })
        .addElseIf(function () { return numplayers > 1; }, function () {
            //console.log("(10)  numplayers > 1");
            throw new Error("todo");
        }).addElse(function () {
            //console.log("(10)  else SP");
            throw new Error("todo");
        })
        .endIf()
        .add(function () {
            //console.log("(70) todo"); // todo
            PreMap.waitForEverybody();

            clearView(0);
            nextpage();
            ps[myconnectindex].palette = palette;
            palto(0, 0, 0, 0);
            clearView(0);
        });
}

//7655

function loadTmb() {
    var tmb = new Uint8Array(8000);

    var file = kopen4load("d3dtimbr.tmb", false);

    if (file == -1)
        return;

    var l = kfilelength(file);

    kread(file, tmb, l);

    Music.registerTimbreBank(tmb);

    kclose(file);
}

// 7695

function compilecons() {
    var userconfilename = confilename;

    //labelcode = sector; // todo ??????????  these arrays are reused????? read comment in loadboard

    // todo: missing some things here...

    loadefs(userconfilename, false);
}

function Startup() {
    Console.init();

    KB.startup();

    Config.getSetupFilename();
    Config.readSetup();

    compilecons();

    if (CommandSoundToggleOff) {
        SoundToggle = 0;
    }
    if (CommandMusicToggleOff) {
        MusicToggle = 0;
    }

    Control.startup();

    initEngine();

    initTimer(g_iTickRate);

    console.log("Loading art header.");

    loadPics("tiles000.art", null);

    Config.readSaveNames();

    tiles[MIRROR].dim.width = tiles[MIRROR].dim.height = 0;

    for (var i = 0; i < MAXPLAYERS; i++) {
        playerreadyflag[i] = 0;
    }

    Network.initMultiPlayers(0, 0, 0);

    if (numplayers > 1) {
        console.log("Multiplayer initialized.");
    }

    ps[myconnectindex].palette = palette[0];
    setupGameButtons();

    if (networkmode === 255) {
        networkmode = 1;
    }

    //console.log("Checking sound inits.");
    //todo: SoundStartup(); 
    //console.log("Checking music inits.");
    //todo: MusicStartup();

    // AutoAim
    if (nHostForceDisableAutoaim)
        ud.auto_aim = 0;

    loadTmb();
}


//7803

function getNames() {
    var i, j, l;

    //// FIX_00031: Names now limited to 10 chars max that is the fragbar field limit.
    //for (l = 0; l <= 9 && myname[l]; l++) {
    // todo: add in with MP
    //    ud.user_name[myconnectindex][l] = toupper(myname[l]);
    //    buf[l + 2] = toupper(myname[l]);
    //}

    ud.rev[myconnectindex][0] = 1;
    ud.rev[myconnectindex][1] = DUKE_ID;
    ud.rev[myconnectindex][2] = CHOCOLATE_DUKE_REV_X;
    ud.rev[myconnectindex][3] = CHOCOLATE_DUKE_REV_DOT_Y;

    ud.conSize[myconnectindex] = ud.conSize[0]; // [0] still containing the original value
    ud.conCRC[myconnectindex] = ud.conCRC[0];

    if (numplayers > 1) {
        throw new Error("todo networking");
    } else if (nHostForceDisableAutoaim === 2) {
        nHostForceDisableAutoaim = 0;
        ud.auto_aim = 2;
    }
}

// 7977

function findGRPToUse() {
    return "DUKE3D.GRP";
}

// 8082

function load_duke3d_groupfile() {
    var groupfilefullpath = findGRPToUse();

    return (initgroupfile(groupfilefullpath) != -1);
}

/// 8100
var q = new Queue();

function main(argc, argv) {
    var i, j;
    var filehandle;

    var kbdKey;

    console.log("*** Chocolate DukeNukem3D JavaScript v" + CHOCOLATE_DUKE_REV_X + "." + CHOCOLATE_DUKE_REV_DOT_Y + " ***");

    ud.multimode = 1; // xduke: must be done before checkcommandline or that will prevent Fakeplayer and AI

    if (!load_duke3d_groupfile()) {
        throw new Error("Could not initialize any original BASE duke3d*.grp file\n" +
            "Even if you are playing a custom GRP you still need\n" +
            "an original base GRP file as Shareware/Full 1.3D GRP or\n" +
            "the v1.5 ATOMIC GRP file. Such a file seems to be missing\n" +
            "or is corrupted");
    }


    // FIX_00022: Automatically recognize the shareware grp (v1.3) + full version (1.3d) +
    //            atomic (1.4/1.5 grp) and the con files version (either 1.3 or 1.4) (JonoF's idea)

    // Detecting grp version
    // We keep the old GRP scheme detection for 19.6 compliance. Will be obsolete.
    filehandle = kopen4load("DUKEDC9.MAP", 1);
    kclose(filehandle);

    if (filehandle == -1) // not DC pack
    {
        filehandle = kopen4load("DUKESW.BIN", 1);
        kclose(filehandle);

        if (filehandle == -1) // not Shareware version 1.3
        {
            filehandle = kopen4load("E4L11.MAP", 1);
            kclose(filehandle);

            if (filehandle == -1) // not Atomic Edition 1.4/1.5
            {
                filehandle = kopen4load("E3L11.MAP", 1);
                kclose(filehandle);

                if (filehandle == -1) // not Regular version 1.3d
                {
                    grpVersion = UNKNOWN_GRP;
                }
                else {
                    grpVersion = REGULAR_GRP13D;
                }
            }
            else {
                grpVersion = ATOMIC_GRP14_15;
            }
        }
        else {
            grpVersion = SHAREWARE_GRP13;
        }
    }
    else {
        grpVersion = DUKEITOUTINDC_GRP;
    }

    // FIX_00062: Better support and identification for GRP and CON files for 1.3/1.3d/1.4/1.5
    if (groupefil_crc32[0] == CRC_BASE_GRP_SHAREWARE_13 ||
				groupefil_crc32[0] == CRC_BASE_GRP_FULL_13 ||
				groupefil_crc32[0] == CRC_BASE_GRP_PLUTONIUM_14 ||
				groupefil_crc32[0] == CRC_BASE_GRP_ATOMIC_15) {
        console.log("GRP identified as: %s", grpVersion2char_from_crc(groupefil_crc32[0]));
    }
    else {
        throw "todo";
        //printf(	"The content of your original BASE *.GRP is corrupted. CRC=%X\n" +
        //	"You may run in troubles. Official GRP are:\n\n", groupefil_crc32[0]);

        //for(i=0; i<MAX_KNOWN_GRP; i++)
        //    console.llog("%s -> CRC32=%X  Size=%d bytes\n", crc32lookup[i].name, crc32lookup[i].crc32, crc32lookup[i].size);

        //console.log(	"\nYou should try to get one of these GRP only as a base GRP\n" +
        //		"Do you want to continue anyway? (Y/N): ");
        //do
        //    kbdKey = getch() | ' ';
        //while(kbdKey != 'y' && kbdKey != 'n');
        //printf("%c\n", kbdKey);

        //if(kbdKey == 'n')
        //    Error(EXIT_SUCCESS,"");
    }

    checkcommandline(argc, argv);

    _platform_init(argc, argv, "Duke Nukem 3D", "Duke3D");

    //todo check memory (maybe use console.memory?)

    // todo: register shutdown function - needed???

    Startup();

    //if (g_bStun) {
    //    waitforeverybody(); //todo
    //}

    if (numplayers > 1) {
        throw new Error("todo");
    } else if (boardfilename) {
        ud.m_level_number = 7;
        ud.m_volume_number = 0;
        ud.warp_on = 1;
    }

    getNames();

    if (ud.multimode > 1) {
        playerswhenstarted = ud.multimode;
    }

    ud.last_level = -1;

    RTS.init(ud.rtsname);
    if (numlumps) {
        console.log("Using .RTS file:%s", ud.rtsname);
    }

    //todo: Control joystick, center joystick

    console.log("Loading palette/lookups.");

    if (setGameMode(ScreenMode, ScreenWidth, ScreenHeight) < 0) {
        console.log("\nVESA driver for ( %i * %i ) not found/supported!", xdim, ydim);
        ScreenMode = 2;
        ScreenWidth = 320;
        ScreenHeight = 200;
        setGameMode(ScreenMode, ScreenWidth, ScreenHeight);
    }

    genSpriteRemaps();

    setBrightness(ud.brightness >> 2, ps[myconnectindex].palette);

    // todo:   if(KB.keyPressed( sc_Escape ) )  
    //gameexit(" ");

    FX.stopAllSounds();
    clearsoundlocks();

    if (ud.warp_on > 1 && ud.multimode < 2) {
        throw new Error("todo");
    }

    // MAIN_LOOP_RESTART:

    // if game is loaded without /V or /L cmd arguments.{
    //if (ud.warp_on === 0) {
    //    if (numplayers > 1 && boardfilename) //check if a user map is loaded and in multiplayer.
    //    {
    //        throw new Error("todo");
    //    } else {
    //        logo(); //play logo, (game must be started via menus).
    //    }
    //}
    //else if (ud.warp_on == 1) {
    //    throw new Error("todo");
    //} else {
    //    preMap.vscrn();
    //}


    q.addIf(function () {
        return ud.warp_on == 0;
    }, function () {
        q.setPositionAtStart()
            .addIf(function () { return numplayers > 1 && boardfilename; },
                function () {
                    throw new Error("todo");
                }).addElse(function () {
                    //logo();
                })
            .endIf();

    }).addElseIf(function () {
        return ud.warp_on === 1;
    }, function () {
        throw new Error("todo");
    })
        .addElse(function () {
            PreMap.vscrn();
        })
        .endIf()
        .addWhile(function () {
            return ud.warp_on == 0 && isPlayingBack;
        }, function () {
            q.setPositionAtStart();
            Game.playBack();
            console.log("Demo loop");
        })
        .add(function () {
            //console.log("EO demo loop TODO: check return value etc");
            //if (just played back)
            FX.stopAllSounds();
            clearsoundlocks();
            //nomorelogohack = 1;
            //goto MAIN_LOOP_RESTART; // maybe   q.goto("MAIN_LOOP_RESTART") and it removes everything fromt he queue until that label
        })
        .add(function () {
            ud.warp_on = 0;

            //The main game loop is here.
            console.log("Start game loop");
            q.setPositionAtStart()
                .addWhile(function () {
                    q.setPositionAtStart(); // important!
                    return !(ps[myconnectindex].gm & MODE_END);
                }, function () {
                    sampletimer();
                    if (ud.recstat == 2 || ud.multimode > 1 || (ud.show_help == 0 && (ps[myconnectindex].gm & MODE_MENU) != MODE_MENU))
                        if (ps[myconnectindex].gm & MODE_GAME) {
                            // (" It's stuck here ")
                            //printf("ps[myconnectindex].gm&MODE_GAME\n");
                            if (moveloop()) {
                                return;//continue;
                            }
                        }

                    if (ps[myconnectindex].gm & MODE_EOL || ps[myconnectindex].gm & MODE_RESTART) {

                        if (ps[myconnectindex].gm & MODE_EOL) {
                            closedemowrite();

                            ready2send = 0;

                            i = ud.screen_size;
                            ud.screen_size = 0;
                            vscrn();
                            ud.screen_size = i;
                            dobonus(0);

                            if (ud.eog) {
                                ud.eog = 0;
                                if (ud.multimode < 2) {
                                    if (VOLUMEONE)
                                        doorders();

                                    ps[myconnectindex].gm = MODE_MENU;
                                    cmenu(0);
                                    probey = 0;
                                    throw "goto MAIN_LOOP_RESTART";
                                }
                                else {
                                    ud.m_level_number = 0;
                                    ud.level_number = 0;
                                }
                            }
                        }

                        ready2send = 0;
                        if (numplayers > 1) ps[myconnectindex].gm = MODE_GAME;

                        enterlevel(ps[myconnectindex].gm);
                        return;//continue;
                    }

                    cheats();

                    if (!Console.isActive())
                        nonsharedkeys();


                    if ((ud.show_help == 0 && ud.multimode < 2 && !(ps[myconnectindex].gm & MODE_MENU)) || ud.multimode > 1 || ud.recstat == 2)
                        i = Math.min(Math.max((totalclock - ototalclock) * ((65536 / TICSPERFRAME) | 0), 0), 65536);
                    else
                        i = 65536;

                    displayrooms(screenpeek, i);
                    displayrest(i);

                    if (ps[myconnectindex].gm & MODE_DEMO)
                        throw "goto MAIN_LOOP_RESTART;";

                    if (debug_on)
                        caches();

                    checksync();

                    if (VOLUMEONE)
                        if (ud.show_help == 0 && show_shareware > 0 && (ps[myconnectindex].gm & MODE_MENU) == 0)
                            rotateSprite((320 - 50) << 16, 9 << 16, 65536, 0, BETAVERSION, 0, 0, 2 + 8 + 16 + 128, 0, 0, xdim - 1, ydim - 1);

                    nextpage();

                });
        })
        .flush();
    // don't put code outside async loop
}

// 0 = mine
Game.openDemoRead = function (whichDemo /* 0 = mine */) {
    var d = "demo_.dmo".split("");
    var fname;
    var ver;

    if (whichDemo === 10) {
        d[4] = 'x';
    } else {
        d[4] = whichDemo.toString();
    }

    fname = d.join("");

    ud.reccnt = 0;

    if (whichDemo === 1 && firstdemofile) {
        fname = firstdemofile;
        if ((recfilep = TCkopen4load(firstdemofile, 0)) == -1) {
            return 0;
        }
    } else {
        if ((recfilep = TCkopen4load(fname, 0)) == -1) {
            return 0;
        }
    }

    ud.reccnt = kread32(recfilep);
    ver = kreadUint8(recfilep);

    console.log("%s has version = %d", fname, ver);

    // todo: version if stuff!!

    ud.playing_demo_rev = ver;

    ud.volume_number = kread8(recfilep);
    ud.level_number = kread8(recfilep);
    ud.player_skill = kread8(recfilep);
    ud.m_coop = kread8(recfilep);
    ud.m_ffire = kread8(recfilep);
    ud.multimode = kread16(recfilep);
    ud.m_monsters_off = kread16(recfilep);
    ud.m_respawn_monsters = kread32(recfilep);
    ud.m_respawn_items = kread32(recfilep);
    ud.m_respawn_inventory = kread32(recfilep);
    ud.playerai = kread32(recfilep);
    ud.user_name[0] = kreadText(recfilep, 512);
    // FIX_00034: Demos do not turn your run mode off anymore:
    kread32(recfilep); // dummy
    boardfilename = kreadText(recfilep, 128);
    if (!boardfilename) {
        ud.m_level_number = 7;
        ud.m_volume_number = 0;
    }

    for (var i = 0; i < ud.multimode; i++) {
        ps[i].aim_mode = kread8(recfilep);

        // FIX_00080: Out Of Synch in demos. Tries recovering OOS in old demos v27/28/29/116/117/118. New: v30/v119.
        if (ver === BYTEVERSION) {
            throw new Error("todo");
            // todo:   //ud.wchoice[i] =kread(recfilep, ud.wchoice[i], sizeof(ud.wchoice[0]))
        }
    }

    ud.god = ud.cashman = ud.eog = ud.showallmap = 0;
    ud.clipping = ud.scrollmode = ud.overhead_on = 0;
    // FIX_00034: Demos do not turn your run mode off anymore:
    /* ud.showweapons =  */ ud.pause_on /*= ud.auto_run */ = 0; // makes no sense to reset those 2 value!

    PreMap.newGame(ud.volume_number, ud.level_number, ud.player_skill);
    return 1;
};

//8782
function closedemowrite() {
    if (ud.recstat == 1)
    {
        throw "todo"
        //if (ud.reccnt > 0)
        //{
        //    dfwrite(recsync,sizeof(input)*ud.multimode,ud.reccnt/ud.multimode,frecfilep);

        //    fseek(frecfilep,SEEK_SET,0);
        //    fwrite(&totalreccnt,sizeof(int32_t),1,frecfilep);
        //    ud.recstat = ud.m_recstat = 0;
        //}
        //fclose(frecfilep);
        //frecfilep = null;
    }
}

//8800
var isPlayingBack = true; // set to false later to simulate returning 0
Game.inMenu = 0;
Game.whichDemo = 2;
var frameCount = 0;
Game.playBack = function () {
    q.setPositionAtStart();

    var i, j, k, l, t;
    var foundemo = 0;

    if (ready2send) {
        return false;
    }

    //RECHECK:

    Game.inMenu = ps[myconnectindex].gm & MODE_MENU;

    pub = NUMPAGES;
    pus = NUMPAGES;

    flushperms();


    if (numplayers < 2 && ud.multimode_bot < 2) {
        foundemo = Game.openDemoRead(Game.whichDemo);
    }

    if (foundemo === 0) {
        if (Game.whichDemo > 1) {
            Game.whichDemo = 1;
            q.setPositionAtStart().add(Game.playBack);
            return; //goto RECHECK;
        }
        for (t = 0; t < 63; t += 7) palto(0, 0, 0, t);
        Game.drawBackground();

        Console.handleInput();
        if (!Console.isActive()) {
            menus();
        }
        Console.render();
        ps[myconnectindex].palette = palette;
        nextpage();
        for (t = 63; t > 0; t -= 7) {
            palto(0, 0, 0, t);
        }

        ud.reccnt = 0;
    } else {
        ud.recstat = 2;
        Game.whichDemo++;
        if (Game.whichDemo === 10) {
            Game.whichDemo = 1;
        }

        PreMap.enterLevel(MODE_DEMO);
    }

    if (foundemo === 0 || Game.inMenu || KB.keyWaiting() || numplayers > 1) {
        FX.stopAllSounds();
        clearsoundlocks();
        ps[myconnectindex].gm |= MODE_MENU;
    }

    ready2send = 0;
    i = 0;

    KB.flushKeyboardQueue();

    k = 0;

    // DEMO LOOP
    q.setPositionAtStart()
        .addWhile(function () {
            return isPlayingBack && (ud.reccnt > 0 || foundemo === 0);
        }, function () {
            q.setPositionAtStart();
            //console.log("demo loopframeCount: %i", frameCount++);

            q.addIf(function () {
                return foundemo;
            }, function () {
                q.setPositionAtStart();

                q.addWhile(function() {
                    return totalclock >= (lockclock + TICSPERFRAME);
                }, function() {
                    q.setPositionAtStart();

                    if ((i == 0) || (i >= RECSYNCBUFSIZ)) {
                        i = 0;
                        l = Math.min(ud.reccnt, RECSYNCBUFSIZ);
                        kdfread(recsync, 10 * ud.multimode, (l / ud.multimode) >>> 0, recfilep);
                        printf("recsync[0].fvel: %i, recsync[0].svel: %i\n", recsync[0].fvel, recsync[0].svel);
                    }
                    var idx;
                    for (j = connecthead; j >= 0; j = connectpoint2[j]) {
                        idx = movefifoend[j] & (MOVEFIFOSIZ - 1);
                        recsync[i].copyTo(inputfifo[idx][j]);

                        movefifoend[j]++;
                        i++;
                        ud.reccnt--;
                    }
                    printf("b4 doMoveThings sector[305].ceilingz:% i\n", sector[305].ceilingz);
                    Game.doMoveThings();
                    printf("after doMoveThings sector[305].ceilingz:% i\n", sector[305].ceilingz);
                });

            }).endIf()
                .addIf(function () {
                    return foundemo === 0;
                }, function () {
                    Game.drawBackground();
                }).addElse(function () {
                    if (!Console.isActive()) {
                        nonsharedkeys();
                    }

                    j = Math.min(Math.max((totalclock - lockclock) * ((65536 / TICSPERFRAME) | 0), 0), 65536);

                    Game.displayRooms(screenpeek, j);
                    
                    displayrest(j);

                    if (ud.multimode > 1 && ps[myconnectindex].gm) {
                        getpackets();
                    }
                }).endIf()
                .addIf(function () {
                    return (ps[myconnectindex].gm & MODE_MENU) && (ps[myconnectindex].gm & MODE_EOL);
                }, function () {
                    console.log("playback(1) :: goto RECHECK:");
                    throw "todo: goto RECHECK";
                })
                .endIf()
                .addIf(function () {
                    return ps[myconnectindex].gm & MODE_TYPE;
                }, function () {
                    typemode();
                    if ((ps[myconnectindex].gm & MODE_TYPE) != MODE_TYPE)
                        ps[myconnectindex].gm = MODE_MENU;
                })
                .addElse(function () {
                    Console.handleInput();
                    if (!Console.isActive()) {
                        menus();
                    }
                    Console.render();
                    if (ud.multimode > 1) {
                        throw "todo"
                        //ControlInfo noshareinfo;
                        //if( !Console.isActive() )
                        //{
                        //    Control.getInput( &noshareinfo );
                        //    if( ACTION(gamefunc_SendMessage) )
                        //    {
                        //        KB.flushKeyboardQueue();
                        //        CONTROL_ClearAction( gamefunc_SendMessage );
                        //        ps[myconnectindex].gm = MODE_TYPE;
                        //        typebuf[0] = 0;
                        //        inputloc = 0;
                        //    }
                        //}
                    }
                })
                .endIf()
                .add(function () {
                    operatefta();

                    if (ud.last_camsprite != ud.camerasprite) {
                        ud.last_camsprite = ud.camerasprite;
                        ud.camera_time = totalclock + (TICRATE * 2);
                    }

                    if (VOLUMEONE)
                        if (ud.show_help == 0 && (ps[myconnectindex].gm & MODE_MENU) == 0)
                            rotateSprite((320 - 50) << 16, 9 << 16, 65536, 0, BETAVERSION, 0, 0, 2 + 8 + 16 + 128, 0, 0, xdim - 1, ydim - 1);

                    getpackets();
                    nextpage();

                    if (ps[myconnectindex].gm == MODE_END || ps[myconnectindex].gm == MODE_GAME) {
                        if (foundemo)
                            kclose(recfilep);
                        ud.playing_demo_rev = 0;
                        isPlayingBack = false;
                        //todo: how to return value???????? maybe it coudl check if a value has returned (not undefined?) then return that up the chain??
                        return 0;
                    }
                });
        })
        .add(function () {

            if (!isPlayingBack) {
                // it's not playing back so ignore this code. todo: make asyncQ.js work better!
                return;
            }

            console.log("bit after demo loop")
            kclose(recfilep);
            ud.playing_demo_rev = 0;
            if (ps[myconnectindex].gm & MODE_MENU) {
                throw "goto RECHECK;" //can do GOTO with async stuff?
            }

            //isPlayingBack = true;
        });

    // put no code here
};


function fakedomovethingscorrect() {
    var i;
    var p;

    if (numplayers < 2) return;

    i = ((movefifoplc - 1) & (MOVEFIFOSIZ - 1));
    p = ps[myconnectindex];

    if (p.posx == myxbak[i] && p.posy == myybak[i] && p.posz == myzbak[i]
	&& p.horiz == myhorizbak[i] && p.ang == myangbak[i]) return;

    myx = p.posx; omyx = p.oposx; myxvel = p.posxv;
    myy = p.posy; omyy = p.oposy; myyvel = p.posyv;
    myz = p.posz; omyz = p.oposz; myzvel = p.poszv;
    myang = p.ang; omyang = p.oang;
    mycursectnum = p.cursectnum;
    myhoriz = p.horiz; omyhoriz = p.ohoriz;
    myhorizoff = p.horizoff; omyhorizoff = p.ohorizoff;
    myjumpingcounter = p.jumping_counter;
    myjumpingtoggle = p.jumping_toggle;
    myonground = p.on_ground;
    myhardlanding = p.hard_landing;
    myreturntocenter = p.return_to_center;

    fakemovefifoplc = movefifoplc;
    while (fakemovefifoplc < movefifoend[myconnectindex])
        fakedomovethings();
}


function fakedomovethings() {
    throw "todo";
    //var syn;
    //var p;
    //var i, j, k, doubvel, fz, cz, hz, lz, x, y;
    //var sb_snum;
    //var psect, psectlotag, tempsect, backcstat;
    //var  shrunk, spritebridge;

    //syn = (input *)&inputfifo[fakemovefifoplc&(MOVEFIFOSIZ-1)][myconnectindex];

    //p = ps[myconnectindex];

    //backcstat = sprite[p.i].cstat;
    //sprite[p.i].cstat &= ~257;

    //sb_snum = syn.bits;

    //psect = mycursectnum;
    //psectlotag = sector[psect].lotag;
    //spritebridge = 0;

    //shrunk = (sprite[p.i].yrepeat < 32);

    //if( ud.clipping == 0 && ( sector[psect].floorpicnum == MIRROR || psect < 0 || psect >= MAXSECTORS) )
    //{
    //    myx = omyx;
    //    myy = omyy;
    //}
    //else
    //{
    //    omyx = myx;
    //    omyy = myy;
    //}

    //omyhoriz = myhoriz;
    //omyhorizoff = myhorizoff;
    //omyz = myz;
    //omyang = myang;

    //getzrange(myx,myy,myz,psect,&cz,&hz,&fz,&lz,163L,CLIPMASK0);

    //j = getflorzofslope(psect,myx,myy);

    //if( (lz&49152) == 16384 && psectlotag == 1 && klabs(myz-j) > PHEIGHT+(16<<8) )
    //    psectlotag = 0;

    //if( p.aim_mode == 0 && myonground && psectlotag != 2 && (sector[psect].floorstat&2) )
    //{
    //    x = myx+(sintable[(myang+512)&2047]>>5);
    //    y = myy+(sintable[myang&2047]>>5);
    //    tempsect = psect;
    //    updatesector(x,y,&tempsect);
    //    if (tempsect >= 0)
    //    {
    //        k = getflorzofslope(psect,x,y);
    //        if (psect == tempsect)
    //            myhorizoff += mulscale16(j-k,160);
    //        else if (klabs(getflorzofslope(tempsect,x,y)-k) <= (4<<8))
    //            myhorizoff += mulscale16(j-k,160);
    //    }
    //}
    //if (myhorizoff > 0) myhorizoff -= ((myhorizoff>>3)+1);
    //else if (myhorizoff < 0) myhorizoff += (((-myhorizoff)>>3)+1);

    //if(hz >= 0 && (hz&49152) == 49152)
    //{
    //    hz &= (MAXSPRITES-1);
    //    if (sprite[hz].statnum == 1 && sprite[hz].extra >= 0)
    //    {
    //        hz = 0;
    //        cz = getceilzofslope(psect,myx,myy);
    //    }
    //}

    //if(lz >= 0 && (lz&49152) == 49152)
    //{
    //    j = lz&(MAXSPRITES-1);
    //    if ((sprite[j].cstat&33) == 33)
    //    {
    //        psectlotag = 0;
    //        spritebridge = 1;
    //    }
    //    if(badguy(sprite[j]) && sprite[j].xrepeat > 24 && klabs(sprite[p.i].z-sprite[j].z) < (84<<8) )
    //    {
    //        j = getangle( sprite[j].x-myx,sprite[j].y-myy);
    //        myxvel -= sintable[(j+512)&2047]<<4;
    //        myyvel -= sintable[j&2047]<<4;
    //    }
    //}

    //if( sprite[p.i].extra <= 0 )
    //{
    //    if( psectlotag == 2 )
    //    {
    //        if(p.on_warping_sector == 0)
    //        {
    //            if( klabs(myz-fz) > (PHEIGHT>>1))
    //                myz += 348;
    //        }
    //        clipmove(&myx,&myy,&myz,&mycursectnum,0,0,164L,(4L<<8),(4L<<8),CLIPMASK0);
    //    }

    //    updatesector(myx,myy,&mycursectnum);
    //    pushmove(&myx,&myy,&myz,&mycursectnum,128L,(4L<<8),(20L<<8),CLIPMASK0);

    //    myhoriz = 100;
    //    myhorizoff = 0;

    //    goto ENDFAKEPROCESSINPUT;
    //}

    //doubvel = TICSPERFRAME;

    //if(p.on_crane >= 0) goto FAKEHORIZONLY;

    //if(p.one_eighty_count < 0) myang += 128;

    //i = 40;

    //if( psectlotag == 2)
    //{
    //    myjumpingcounter = 0;

    //    if ( sb_snum&1 )
    //    {
    //        if(myzvel > 0) myzvel = 0;
    //        myzvel -= 348;
    //        if(myzvel < -(256*6)) myzvel = -(256*6);
    //    }
    //    else if (sb_snum&(1<<1))
    //    {
    //        if(myzvel < 0) myzvel = 0;
    //        myzvel += 348;
    //        if(myzvel > (256*6)) myzvel = (256*6);
    //    }
    //    else
    //    {
    //        if(myzvel < 0)
    //        {
    //            myzvel += 256;
    //            if(myzvel > 0)
    //                myzvel = 0;
    //        }
    //        if(myzvel > 0)
    //        {
    //            myzvel -= 256;
    //            if(myzvel < 0)
    //                myzvel = 0;
    //        }
    //    }

    //    if(myzvel > 2048) myzvel >>= 1;

    //    myz += myzvel;

    //    if(myz > (fz-(15<<8)) )
    //        myz += ((fz-(15<<8))-myz)>>1;

    //    if(myz < (cz+(4<<8)) )
    //    {
    //        myz = cz+(4<<8);
    //        myzvel = 0;
    //    }
    //}

    //else if(p.jetpack_on)
    //{
    //    myonground = 0;
    //    myjumpingcounter = 0;
    //    myhardlanding = 0;

    //    if(p.jetpack_on < 11)
    //        myz -= (p.jetpack_on<<7); //Goin up

    //    if(shrunk) j = 512;
    //    else j = 2048;

    //    if (sb_snum&1)                            //A
    //        myz -= j;
    //    if (sb_snum&(1<<1))                       //Z
    //        myz += j;

    //    if(shrunk == 0 && ( psectlotag == 0 || psectlotag == 2 ) ) k = 32;
    //    else k = 16;

    //    if(myz > (fz-(k<<8)) )
    //        myz += ((fz-(k<<8))-myz)>>1;
    //    if(myz < (cz+(18<<8)) )
    //        myz = cz+(18<<8);
    //}
    //else if( psectlotag != 2 )
    //{
    //    if (psectlotag == 1 && p.spritebridge == 0)
    //    {
    //        if(shrunk == 0) i = 34;
    //        else i = 12;
    //    }
    //    if(myz < (fz-(i<<8)) && (floorspace(psect)|ceilingspace(psect)) == 0 ) //falling
    //    {
    //        if( (sb_snum&3) == 0 && myonground && (sector[psect].floorstat&2) && myz >= (fz-(i<<8)-(16<<8) ) )
    //            myz = fz-(i<<8);
    //        else
    //        {
    //            myonground = 0;

    //            myzvel += (gc+80);

    //            if(myzvel >= (4096+2048)) myzvel = (4096+2048);
    //        }
    //    }

    //    else
    //    {
    //        if(psectlotag != 1 && psectlotag != 2 && myonground == 0 && myzvel > (6144>>1))
    //            myhardlanding = myzvel>>10;
    //        myonground = 1;

    //        if(i==40)
    //        {
    //            //Smooth on the ground

    //            k = ((fz-(i<<8))-myz)>>1;
    //            if( klabs(k) < 256 ) k = 0;
    //            myz += k; // ((fz-(i<<8))-myz)>>1;
    //            myzvel -= 768; // 412;
    //            if(myzvel < 0) myzvel = 0;
    //        }
    //        else if(myjumpingcounter == 0)
    //        {
    //            myz += ((fz-(i<<7))-myz)>>1; //Smooth on the water
    //            if(p.on_warping_sector == 0 && myz > fz-(16<<8))
    //            {
    //                myz = fz-(16<<8);
    //                myzvel >>= 1;
    //            }
    //        }

    //        if( sb_snum&2 )
    //            myz += (2048+768);

    //        if( (sb_snum&1) == 0 && myjumpingtoggle == 1)
    //            myjumpingtoggle = 0;

    //        else if( (sb_snum&1) && myjumpingtoggle == 0 )
    //        {
    //            if( myjumpingcounter == 0 )
    //                if( (fz-cz) > (56<<8) )
    //                {
    //                    myjumpingcounter = 1;
    //                    myjumpingtoggle = 1;
    //                }
    //        }
    //        if( myjumpingcounter && (sb_snum&1) == 0 )
    //            myjumpingcounter = 0;
    //    }

    //    if(myjumpingcounter)
    //    {
    //        if( (sb_snum&1) == 0 && myjumpingtoggle == 1)
    //            myjumpingtoggle = 0;

    //        if( myjumpingcounter < (1024+256) )
    //        {
    //            if(psectlotag == 1 && myjumpingcounter > 768)
    //            {
    //                myjumpingcounter = 0;
    //                myzvel = -512;
    //            }
    //            else
    //            {
    //                myzvel -= (((sintable[(2048-128+myjumpingcounter)&2047])/12)|0);
    //                myjumpingcounter += 180;

    //                myonground = 0;
    //            }
    //        }
    //        else
    //        {
    //            myjumpingcounter = 0;
    //            myzvel = 0;
    //        }
    //    }

    //    myz += myzvel;

    //    if(myz < (cz+(4<<8)) )
    //    {
    //        myjumpingcounter = 0;
    //        if(myzvel < 0) myxvel = myyvel = 0;
    //        myzvel = 128;
    //        myz = cz+(4<<8);
    //    }

    //}

    //if ( p.fist_incs ||
    //	p.transporter_hold > 2 ||
    //	myhardlanding ||
    //	p.access_incs > 0 ||
    //	p.knee_incs > 0 ||
    //	(p.curr_weapon == TRIPBOMB_WEAPON &&
    //	p.kickback_pic > 1 &&
    //	p.kickback_pic < 4 ) )
    //{
    //    doubvel = 0;
    //    myxvel = 0;
    //    myyvel = 0;
    //}
    //else if ( syn.avel )          //p.ang += syncangvel * constant
    //{                         //ENGINE calculates angvel for you
    //    int32_t tempang;

    //    tempang = syn.avel<<1;

    //    if(psectlotag == 2)
    //        myang += (tempang-(tempang>>3))*sgn(doubvel);
    //    else myang += (tempang)*sgn(doubvel);
    //    myang &= 2047;
    //}

    //if ( myxvel || myyvel || syn.fvel || syn.svel )
    //{
    //    if(p.steroids_amount > 0 && p.steroids_amount < 400)
    //        doubvel <<= 1;

    //    myxvel += ((syn.fvel*doubvel)<<6);
    //    myyvel += ((syn.svel*doubvel)<<6);

    //    if( ( p.curr_weapon == KNEE_WEAPON && p.kickback_pic > 10 && myonground ) || ( myonground && (sb_snum&2) ) )
    //    {
    //        myxvel = mulscale16(myxvel,dukefriction-0x2000);
    //        myyvel = mulscale16(myyvel,dukefriction-0x2000);
    //    }
    //    else
    //    {
    //        if(psectlotag == 2)
    //        {
    //            myxvel = mulscale16(myxvel,dukefriction-0x1400);
    //            myyvel = mulscale16(myyvel,dukefriction-0x1400);
    //        }
    //        else
    //        {
    //            myxvel = mulscale16(myxvel,dukefriction);
    //            myyvel = mulscale16(myyvel,dukefriction);
    //        }
    //    }

    //    if( abs(myxvel) < 2048 && abs(myyvel) < 2048 )
    //        myxvel = myyvel = 0;

    //    if( shrunk )
    //    {
    //        myxvel =
    //			mulscale16(myxvel,(dukefriction)-(dukefriction>>1)+(dukefriction>>2));
    //        myyvel =
    //			mulscale16(myyvel,(dukefriction)-(dukefriction>>1)+(dukefriction>>2));
    //    }
    //}

    //FAKEHORIZONLY:
    //    if(psectlotag == 1 || spritebridge == 1) i = (4L<<8); else i = (20L<<8);

    //clipmove(&myx,&myy,&myz,&mycursectnum,myxvel,myyvel,164L,4L<<8,i,CLIPMASK0);
    //pushmove(&myx,&myy,&myz,&mycursectnum,164L,4L<<8,4L<<8,CLIPMASK0);

    //if( p.jetpack_on == 0 && psectlotag != 1 && psectlotag != 2 && shrunk)
    //    myz += 30<<8;

    //if ((sb_snum&(1<<18)) || myhardlanding)
    //    myreturntocenter = 9;

    //if (sb_snum&(1<<13))
    //{
    //    myreturntocenter = 9;
    //    if (sb_snum&(1<<5)) myhoriz += 6;
    //    myhoriz += 6;
    //}
    //else if (sb_snum&(1<<14))
    //{
    //    myreturntocenter = 9;
    //    if (sb_snum&(1<<5)) myhoriz -= 6;
    //    myhoriz -= 6;
    //}
    //else if (sb_snum&(1<<3))
    //{
    //    if (sb_snum&(1<<5)) myhoriz += 6;
    //    myhoriz += 6;
    //}
    //else if (sb_snum&(1<<4))
    //{
    //    if (sb_snum&(1<<5)) myhoriz -= 6;
    //    myhoriz -= 6;
    //}

    //if (myreturntocenter > 0)
    //    if ((sb_snum&(1<<13)) == 0 && (sb_snum&(1<<14)) == 0)
    //    {
    //        myreturntocenter--;
    //        myhoriz += 33-((myhoriz/3)|0);
    //    }

    //if(p.aim_mode)
    //    myhoriz += syn.horz>>1;
    //else
    //{
    //    if( myhoriz > 95 && myhoriz < 105) myhoriz = 100;
    //    if( myhorizoff > -5 && myhorizoff < 5) myhorizoff = 0;
    //}

    //if (myhardlanding > 0)
    //{
    //    myhardlanding--;
    //    myhoriz -= (myhardlanding<<4);
    //}

    //if (myhoriz > 299) myhoriz = 299;
    //else if (myhoriz < -99) myhoriz = -99;

    //if(p.knee_incs > 0)
    //{
    //    myhoriz -= 48;
    //    myreturntocenter = 9;
    //}


    //ENDFAKEPROCESSINPUT:

    //    myxbak[fakemovefifoplc&(MOVEFIFOSIZ-1)] = myx;
    //myybak[fakemovefifoplc&(MOVEFIFOSIZ-1)] = myy;
    //myzbak[fakemovefifoplc&(MOVEFIFOSIZ-1)] = myz;
    //myangbak[fakemovefifoplc&(MOVEFIFOSIZ-1)] = myang;
    //myhorizbak[fakemovefifoplc&(MOVEFIFOSIZ-1)] = myhoriz;
    //fakemovefifoplc++;

    //sprite[p.i].cstat = backcstat;
}

//9011
function moveloop() {
    var i;

    if (numplayers > 1) {
        while (fakemovefifoplc < movefifoend[myconnectindex]) {
            fakedomovethings();
        }
    }


    getpackets();

    if (numplayers < 2) bufferjitter = 0;
    while (movefifoend[myconnectindex] - movefifoplc > bufferjitter) {
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (movefifoplc == movefifoend[i]) break;
        if (i >= 0) break;
        if (Game.doMoveThings()) return 1;
    }
    return 0;
}


//9495
Game.doMoveThings = function () {
    var i, j;
    var ch;
    
    printf("domovethings\n");
    for (i = connecthead; i >= 0; i = connectpoint2[i]) {
        if (sync[i].bits & (1 << 17)) {
            multiflag = 2;
            multiwhat = (sync[i].bits >> 18) & 1;
            multipos = (sync[i].bits >>> 19) & 15;
            multiwho = i;

            if (multiwhat) {
                // FIX_00058: Save/load game crash in both single and multiplayer
                screencapt = 1;
                Game.displayRooms(myconnectindex, 65536);
                savetemp("duke3d.tmp", tiles[MAXTILES - 1].data, 160 * 100);
                screencapt = 0;

                saveplayer(multipos);
                multiflag = 0;

                if (multiwho != myconnectindex) {
                    fta_quotes[122] = ud.user_name[multiwho][0];
                    fta_quotes[122] = "SAVED A MULTIPLAYER GAME";
                    FTA(122, ps[myconnectindex], 1);
                } else {
                    fta_quotes[122] = "MULTIPLAYER GAME SAVED";
                    FTA(122, ps[myconnectindex], 1);
                }
                break;
            } else {
                //            waitforeverybody();

                j = loadplayer(multipos);

                multiflag = 0;

                if (j == 0) {
                    if (multiwho != myconnectindex) {
                        strcpy(fta_quotes[122], ud.user_name[multiwho][0]);
                        strcat(fta_quotes[122], " LOADED A MULTIPLAYER GAME");
                        FTA(122, ps[myconnectindex], 1);
                    } else {
                        strcpy(fta_quotes[122], "MULTIPLAYER GAME LOADED");
                        FTA(122, ps[myconnectindex], 1);
                    }
                    return 1;
                }
            }
        }
    }

    ud.camerasprite = -1;
    lockclock += TICSPERFRAME;

    if (earthquaketime > 0) earthquaketime--;
    if (rtsplaying > 0) rtsplaying--;

    for (i = 0; i < MAXUSERQUOTES; i++)
        if (user_quote_time[i]) {
            user_quote_time[i]--;
            if (!user_quote_time[i]) pub = NUMPAGES;
        }
    if ((klabs(quotebotgoal - quotebot) <= 16) && (ud.screen_size <= 8))
        quotebot += ksgn(quotebotgoal - quotebot);
    else
        quotebot = quotebotgoal;

    if (show_shareware > 0) {
        show_shareware--;
        if (show_shareware == 0) {
            pus = NUMPAGES;
            pub = NUMPAGES;
        }
    }

    everyothertime++;

    for (i = connecthead; i >= 0; i = connectpoint2[i]) {
        inputfifo[movefifoplc & (MOVEFIFOSIZ - 1)][i].copyTo(sync[i]);
        printf("copy fifo i: %i\n", i);
        printf("&sync[i].avel: %i\n",sync[i].avel);
        printf("&sync[i].horz: %i\n",sync[i].horz);
        printf("&sync[i].fvel: %i\n",sync[i].fvel);
        printf("&sync[i].svel: %i\n",sync[i].svel);
        printf("&sync[i].bits: %i\n",sync[i].bits);
    }
    movefifoplc++;

    updateinterpolations();

    j = -1;
    for (i = connecthead; i >= 0; i = connectpoint2[i]) {
        if ((sync[i].bits & (1 << 26)) == 0) {
            j = i;
            continue;
        }

        closedemowrite();

        if (i == myconnectindex) throw new Error(" ");
        if (screenpeek == i) {
            screenpeek = connectpoint2[i];
            if (screenpeek < 0) screenpeek = connecthead;
        }

        if (i == connecthead) connecthead = connectpoint2[connecthead];
        else connectpoint2[j] = connectpoint2[i];

        numplayers--;
        ud.multimode--;

        if (numplayers < 2)
            sound(GENERIC_AMBIENCE17);

        pub = NUMPAGES;
        pus = NUMPAGES;
        vscrn();

        sprintf(buf, "%s is history!", ud.user_name[i]);

        quickkill(ps[i]);
        deletesprite(ps[i].i);

        adduserquote(buf);

        if (j < 0 && networkmode == 0)
            throw "The 'MASTER/First player' just quit the game.  All\nplayers are returned from the game. This only happens in 5-8\nplayer mode as a different network scheme is used.";
    }

    if ((numplayers >= 2) && ((movefifoplc & 7) == 7)) {
        ch = toUint8(randomseed & 255);
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            ch += ((ps[i].posx + ps[i].posy + ps[i].posz + ps[i].ang + ps[i].horiz) & 255);
        syncval[myconnectindex][syncvalhead[myconnectindex] & (MOVEFIFOSIZ - 1)] = ch;
        syncvalhead[myconnectindex]++;


    }

    if (ud.recstat == 1) record();

    printf("b4 movedummy ps[0].posy: %i, ps[0].posyv: %i, ps[0].ang: %i, sprite[69].ang: %i\n", ps[0].posy, ps[0].posyv, ps[0].ang, sprite[69].ang);
    if (ud.pause_on == 0) {
        global_random = krand();
        movedummyplayers(); //ST 13
    }

    for (i = connecthead; i >= 0; i = connectpoint2[i]) {
        Sector.cheatKeys(i);

        if (ud.pause_on == 0) {
            printf("b4 ps[0].posy: %i, ps[0].posyv: %i, ps[0].ang: %i, sprite[69].ang: %i\n", ps[0].posy, ps[0].posyv, ps[0].ang, sprite[69].ang);
            Player.processInput(i);
            printf("after ps[0].posy: %i, ps[0].posyv: %i, ps[0].ang: %i, sprite[69].ang: %i\n", ps[0].posy, ps[0].posyv, ps[0].ang, sprite[69].ang);
            checksectors(i);
        }
    }

    if (ud.pause_on == 0) {
        printf("b4 fta sprite[69].ang: %i, headspritestat[10]: %i, headspritesect[137]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], headspritesect[137], sector[305].ceilingz);
        movefta(); //ST 2
        printf("b4 moveweapons sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);
        moveweapons(); //ST 5 (must be last)
        printf("b4 movetransports sprite[69].ang: %i, headspritestat[10]: %i, headspritesect[137]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], headspritesect[137], sector[305].ceilingz);
        movetransports(); //ST 9

        printf("b4 moveplayers sprite[69].ang: %i, headspritestat[10]: %i, headspritesect[137]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], headspritesect[137], sector[305].ceilingz);
        moveplayers(); //ST 10
        printf("after moveplayers sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);
        movefallers(); //ST 12
        moveexplosions(); //ST 4

        moveactors(); //ST 1
        printf("after moveactors sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);
        moveeffectors(); //ST 3
        printf("after moveeffectors sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);

        movestandables(); //ST 6
        printf("after movestandables sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);
        doanimations();
        printf("after doanimations sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);
        movefx(); //ST 11
        printf("after movefx sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);
    }

    fakedomovethingscorrect();
    printf("after fakedomovethingscorrect sprite[69].ang: %i, headspritestat[10]: %i, sector[305].ceilingz: %i\n", sprite[69].ang, headspritestat[10], sector[305].ceilingz);

    if ((everyothertime & 1) == 0) {
        animatewalls();
        movecyclers();
        pan3dsound();
    }


    return 0;
};

//9768

function dobonus(bonusonly)
{
	var t, tinc,gfx_offset;
	var i, y,xfragtotal,yfragtotal;
	var bonuscnt;
    var text = "";

	var breathe =
	[
		0,  30,VICTORY1+1,176,59,
		30,  60,VICTORY1+2,176,59,
		60,  90,VICTORY1+1,176,59,
		90, 120,0         ,176,59
	];

	var bossmove =
	[
		0, 120,VICTORY1+3,86,59,
		220, 260,VICTORY1+4,86,59,
		260, 290,VICTORY1+5,86,59,
		290, 320,VICTORY1+6,86,59,
		320, 350,VICTORY1+7,86,59,
		350, 380,VICTORY1+8,86,59
	];

	bonuscnt = 0;

	for(t=0;t<64;t+=7) palto(0,0,0,t);
	setview(0,0,xdim-1,ydim-1);
	clearView(0);
	nextpage();
	flushperms();

	FX.stopAllSounds();
	clearsoundlocks();
	FX.setReverb(0);

	if(bonusonly) goto FRAGBONUS;

	if(numplayers < 2 && ud.eog && ud.from_bonus == 0)
		switch(ud.volume_number)
	{
		case 0:
			if(ud.lockout == 0)
			{
				clearView(0);
				rotatesprite(0,50<<16,65536,0,VICTORY1,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
				nextpage();
				ps[myconnectindex].palette = endingpal;
				for(t=63;t>=0;t--) palto(0,0,0,t);

				KB.flushKeyboardQueue();
				totalclock = 0; tinc = 0;
				while( 1 )
				{
					clearview(0);
					rotateSprite(0,50<<16,65536,0,VICTORY1,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);

					// boss
					if( totalclock > 390 && totalclock < 780 )
						for(t=0;t<35;t+=5) if( bossmove[t+2] && (totalclock%390) > bossmove[t] && (totalclock%390) <= bossmove[t+1] )
						{
							if(t==10 && bonuscnt == 1) { sound(SHOTGUN_FIRE);sound(SQUISHED); bonuscnt++; }
							rotatesprite(bossmove[t+3]<<16,bossmove[t+4]<<16,65536,0,bossmove[t+2],0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
						}

						// Breathe
						if( totalclock < 450 || totalclock >= 750 )
						{
							if(totalclock >= 750)
							{
								rotatesprite(86<<16,59<<16,65536,0,VICTORY1+8,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
								if(totalclock >= 750 && bonuscnt == 2) { sound(DUKETALKTOBOSS); bonuscnt++; }
							}
							for(t=0;t<20;t+=5)
								if( breathe[t+2] && (totalclock%120) > breathe[t] && (totalclock%120) <= breathe[t+1] )
								{
									if(t==5 && bonuscnt == 0)
									{
										sound(BOSSTALKTODUKE);
										bonuscnt++;
									}
									rotatesprite(breathe[t+3]<<16,breathe[t+4]<<16,65536,0,breathe[t+2],0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
								}
						}

						getpackets();
						nextpage();
						if( KB.keyWaiting() ) break;
				}
			}

			for(t=0;t<64;t++) palto(0,0,0,t);

			KB.flushKeyboardQueue();
			ps[myconnectindex].palette = palette;

			rotatesprite(0,0,65536,0,3292,0,0,2+8+16+64, 0,0,xdim-1,ydim-1);
			nextpage(); for(t=63;t>0;t--) palto(0,0,0,t);
			while( !KB.keyWaiting() ) getpackets();
			for(t=0;t<64;t++) palto(0,0,0,t);
			Music.stopSong();
			FX.stopAllSounds();
			clearsoundlocks();
			break;
		case 1:
			Music.stopSong();
			clearview(0);
			nextpage();

			if(ud.lockout == 0)
			{
				playanm("cineov2.anm",1);
				KB.flushKeyboardQueue();
				clearview(0);
				nextpage();
			}

			sound(PIPEBOMB_EXPLODE);

			for(t=0;t<64;t++) palto(0,0,0,t);
			setview(0,0,xdim-1,ydim-1);
			KB.flushKeyboardQueue();
			ps[myconnectindex].palette = palette;
			rotatesprite(0,0,65536,0,3293,0,0,2+8+16+64, 0,0,xdim-1,ydim-1);
			nextpage(); for(t=63;t>0;t--) palto(0,0,0,t);
			while( !KB.keyWaiting() ) getpackets();
			for(t=0;t<64;t++) palto(0,0,0,t);

			break;

		case 3:

			setview(0,0,xdim-1,ydim-1);

			Music.stopSong();
			clearview(0);
			nextpage();

			if(ud.lockout == 0)
			{
				KB.flushKeyboardQueue();
				playanm("vol4e1.anm",8);
				clearview(0);
				nextpage();
				playanm("vol4e2.anm",10);
				clearview(0);
				nextpage();
				playanm("vol4e3.anm",11);
				clearview(0);
				nextpage();
			}

			FX.stopAllSounds();
			clearsoundlocks();
			sound(ENDSEQVOL3SND4);
			KB.flushKeyboardQueue();

			ps[myconnectindex].palette = palette;
			palto(0,0,0,63);
			clearview(0);
			menutext(160,60,0,0,"THANKS TO ALL OUR");
			menutext(160,60+16,0,0,"FANS FOR GIVING");
			menutext(160,60+16+16,0,0,"US BIG HEADS.");
			menutext(160,70+16+16+16,0,0,"LOOK FOR A DUKE NUKEM 3D");
			menutext(160,70+16+16+16+16,0,0,"SEQUEL SOON.");
			nextpage();

			for(t=63;t>0;t-=3) palto(0,0,0,t);
			KB.flushKeyboardQueue();
			while(!KB.keyWaiting()) getpackets();
			for(t=0;t<64;t+=3) palto(0,0,0,t);

			clearview(0);
			nextpage();

			playanm("DUKETEAM.ANM",4);

			KB.flushKeyboardQueue();
			while(!KB.keyWaiting()) getpackets();

			clearview(0);
			nextpage();
			palto(0,0,0,63);

			FX.stopAllSounds();
			clearsoundlocks();
			KB.flushKeyboardQueue();

			break;

		case 2:

			Music.stopSong();
			clearview(0);
			nextpage();
			if(ud.lockout == 0)
			{
				for(t=63;t>=0;t--) palto(0,0,0,t);
				playanm("cineov3.anm",2);
				KB.flushKeyboardQueue();
				ototalclock = totalclock+200;
				while(totalclock < ototalclock) getpackets();
				clearview(0);
				nextpage();

				FX.stopAllSounds();
				clearsoundlocks();
			}

			playanm("RADLOGO.ANM",3);

			if( ud.lockout == 0 && !KB.keyWaiting() )
			{
				sound(ENDSEQVOL3SND5);
				while(Sound[ENDSEQVOL3SND5].lock>=200) getpackets();
				if(KB.keyWaiting()) goto ENDANM;
				sound(ENDSEQVOL3SND6);
				while(Sound[ENDSEQVOL3SND6].lock>=200) getpackets();
				if(KB.keyWaiting()) goto ENDANM;
				sound(ENDSEQVOL3SND7);
				while(Sound[ENDSEQVOL3SND7].lock>=200) getpackets();
				if(KB.keyWaiting()) goto ENDANM;
				sound(ENDSEQVOL3SND8);
				while(Sound[ENDSEQVOL3SND8].lock>=200) getpackets();
				if(KB.keyWaiting()) goto ENDANM;
				sound(ENDSEQVOL3SND9);
				while(Sound[ENDSEQVOL3SND9].lock>=200) getpackets();
			}

			KB.flushKeyboardQueue();
			totalclock = 0;
			while(!KB.keyWaiting() && totalclock < 120) getpackets();

ENDANM:

			FX.stopAllSounds();
			clearsoundlocks();

			KB.flushKeyboardQueue();

			clearview(0);

			break;
	}

FRAGBONUS:

	ps[myconnectindex].palette = palette;
	KB.flushKeyboardQueue();
	totalclock = 0; tinc = 0;
	bonuscnt = 0;

	Music.stopSong();
	FX.stopAllSounds();
	clearsoundlocks();

	if(playerswhenstarted > 1 && ud.coop != 1 )
	{
		if(!(MusicToggle == 0 || MusicDevice == NumSoundCards))
			sound(BONUSMUSIC);

		rotatesprite(0,0,65536,0,MENUSCREEN,16,0,2+8+16+64,0,0,xdim-1,ydim-1);
		rotatesprite(160<<16,34<<16,65536,0,INGAMEDUKETHREEDEE,0,0,10,0,0,xdim-1,ydim-1);
		rotatesprite((260)<<16,36<<16,65536,0,PLUTOPAKSPRITE+2,0,0,2+8,0,0,xdim-1,ydim-1);
		gametext(160,58+2,"MULTIPLAYER TOTALS",0,2+8+16);
		gametext(160,58+10,level_names[(ud.volume_number*11)+ud.last_level-1],0,2+8+16);

		gametext(160,165,"PRESS ANY KEY TO CONTINUE",0,2+8+16);


		t = 0;
		minitext(23,80,"   NAME                                           KILLS",8,2+8+16+128);
		for(i=0;i<playerswhenstarted;i++)
		{
			sprintf(text,"%-4d",i+1);
			minitext(92+(i*23),80,text,3,2+8+16+128);
		}

		for(i=0;i<playerswhenstarted;i++)
		{
			xfragtotal = 0;
			sprintf(text,"%d",i+1);

			minitext(30,90+t,text,0,2+8+16+128);
			minitext(38,90+t,ud.user_name[i],ps[i].palookup,2+8+16+128);

			for(y=0;y<playerswhenstarted;y++)
			{
				if(i == y)
				{
					sprintf(text,"%-4d",ps[y].fraggedself);
					minitext(92+(y*23),90+t,text,2,2+8+16+128);
					xfragtotal -= ps[y].fraggedself;
				}
				else
				{
					sprintf(text,"%-4d",frags[i][y]);
					minitext(92+(y*23),90+t,text,0,2+8+16+128);
					xfragtotal += frags[i][y];
				}

				if(myconnectindex == connecthead)
				{
					sprintf(text,"stats %d killed %d %d\n",i+1,y+1,frags[i][y]);
					sendscore(text);
				}
			}

			sprintf(text,"%-4d",xfragtotal);
			minitext(101+(8*23),90+t,text,2,2+8+16+128);

			t += 7;
		}

		for(y=0;y<playerswhenstarted;y++)
		{
			yfragtotal = 0;
			for(i=0;i<playerswhenstarted;i++)
			{
				if(i == y)
					yfragtotal += ps[i].fraggedself;
				yfragtotal += frags[i][y];
			}
			sprintf(text,"%-4d",yfragtotal);
			minitext(92+(y*23),96+(8*7),text,2,2+8+16+128);
		}

		minitext(45,96+(8*7),"DEATHS",8,2+8+16+128);
		nextpage();

		for(t=0;t<64;t+=7)
			palto(0,0,0,63-t);

		KB.flushKeyboardQueue();
		while(KB.keyWaiting()==0) getpackets();

		if( KB_KeyPressed( sc_F12 ) )
		{
			KB_ClearKeyDown( sc_F12 );
			takescreenshot();
		}

		if(bonusonly || ud.multimode > 1) return;

		for(t=0;t<64;t+=7) palto(0,0,0,t);
	}

	if(bonusonly || ud.multimode > 1) return;

	switch(ud.volume_number)
	{
	case 1:
		gfx_offset = 5;
		break;
	default:
		gfx_offset = 0;
		break;
	}

	rotatesprite(0,0,65536,0,BONUSSCREEN+gfx_offset,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);

	menutext(160,20-6,0,0,level_names[(ud.volume_number*11)+ud.last_level-1]);
	menutext(160,36-6,0,0,"COMPLETED");

	gametext(160,192,"PRESS ANY KEY TO CONTINUE",16,2+8+16);

	if(!(MusicToggle == 0 || MusicDevice == NumSoundCards))
		sound(BONUSMUSIC);

	nextpage();
	KB.flushKeyboardQueue();
	for(t=0;t<64;t++) palto(0,0,0,63-t);
	bonuscnt = 0;
	totalclock = 0; tinc = 0;

	while( 1 )
	{
		sampletimer();    	
		if(ps[myconnectindex].gm&MODE_EOL)
		{
			rotatesprite(0,0,65536,0,BONUSSCREEN+gfx_offset,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);

			if( totalclock > (1000000000) && totalclock < (1000000320) )
			{
				switch( (totalclock>>4)%15 )
				{
				case 0:
					if(bonuscnt == 6)
					{
						bonuscnt++;
						sound(SHOTGUN_COCK);
						switch(NORMAL_RAND&3)
						{
						case 0:
							sound(BONUS_SPEECH1);
							break;
						case 1:
							sound(BONUS_SPEECH2);
							break;
						case 2:
							sound(BONUS_SPEECH3);
							break;
						case 3:
							sound(BONUS_SPEECH4);
							break;
						}
					}
				case 1:
				case 4:
				case 5:
					rotatesprite(199<<16,31<<16,65536,0,BONUSSCREEN+3+gfx_offset,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
					break;
				case 2:
				case 3:
					rotatesprite(199<<16,31<<16,65536,0,BONUSSCREEN+4+gfx_offset,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
					break;
				}
			}
			else if( totalclock > (10240+120) ) break;
			else
			{
				switch( (totalclock>>5)&3 )
				{
				case 1:
				case 3:
					rotatesprite(199<<16,31<<16,65536,0,BONUSSCREEN+1+gfx_offset,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
					break;
				case 2:
					rotatesprite(199<<16,31<<16,65536,0,BONUSSCREEN+2+gfx_offset,0,0,2+8+16+64+128,0,0,xdim-1,ydim-1);
					break;
				}
			}

			menutext(160,20-6,0,0,level_names[(ud.volume_number*11)+ud.last_level-1]);
			menutext(160,36-6,0,0,"COMPLETED");

			gametext(160,192,"PRESS ANY KEY TO CONTINUE",16,2+8+16);

			if( totalclock > (60*3) )
			{
				gametext(10,59+9,"Your Time:",0,2+8+16);
				gametext(10,69+9,"Par time:",0,2+8+16);
				gametext(10,78+9,"3D Realms' Time:",0,2+8+16);
				if(bonuscnt == 0)
					bonuscnt++;

				if( totalclock > (60*4) )
				{
					if(bonuscnt == 1)
					{
						bonuscnt++;
						sound(PIPEBOMB_EXPLODE);
					}
					sprintf(text,"%02d:%02d",
						(ps[myconnectindex].player_par/(26*60)|0)%60,
						(ps[myconnectindex].player_par/26|0)%60);
					gametext((320>>2)+71,60+9,text,0,2+8+16);

					sprintf(text,"%02d:%02d",
						(partime[ud.volume_number*11+ud.last_level-1]/(26*60)|0)%60,
						(partime[ud.volume_number*11+ud.last_level-1]/26|0)%60);
					gametext((320>>2)+71,69+9,text,0,2+8+16);

					sprintf(text,"%02d:%02d",
						(designertime[ud.volume_number*11+ud.last_level-1]/(26*60)|0)%60,
						(designertime[ud.volume_number*11+ud.last_level-1]/26|0)%60);
					gametext((320>>2)+71,78+9,text,0,2+8+16);

				}
			}
			if( totalclock > (60*6) )
			{
				gametext(10,94+9,"Enemies Killed:",0,2+8+16);
				gametext(10,99+4+9,"Enemies Left:",0,2+8+16);

				if(bonuscnt == 2)
				{
					bonuscnt++;
					sound(FLY_BY);
				}

				if( totalclock > (60*7) )
				{
					if(bonuscnt == 3)
					{
						bonuscnt++;
						sound(PIPEBOMB_EXPLODE);
					}
					sprintf(text,"%-3hhd",ps[myconnectindex].actors_killed);
					gametext((320>>2)+70,93+9,text,0,2+8+16);
					if(ud.player_skill > 3 )
					{
						sprintf(text,"N/A");
						gametext((320>>2)+70,99+4+9,text,0,2+8+16);
					}
					else
					{
						if( (ps[myconnectindex].max_actors_killed-ps[myconnectindex].actors_killed) < 0 )
							sprintf(text,"%-3d",0);
						else sprintf(text,"%-3d",ps[myconnectindex].max_actors_killed-ps[myconnectindex].actors_killed);
						gametext((320>>2)+70,99+4+9,text,0,2+8+16);
					}
				}
			}
			if( totalclock > (60*9) )
			{
				gametext(10,120+9,"Secrets Found:",0,2+8+16);
				gametext(10,130+9,"Secrets Missed:",0,2+8+16);
				if(bonuscnt == 4) bonuscnt++;

				if( totalclock > (60*10) )
				{
					if(bonuscnt == 5)
					{
						bonuscnt++;
						sound(PIPEBOMB_EXPLODE);
					}
					sprintf(text,"%-3d",ps[myconnectindex].secret_rooms);
					gametext((320>>2)+70,120+9,text,0,2+8+16);
					if( ps[myconnectindex].secret_rooms > 0 )
					    sprintf(text,"%-3d",(100*ps[myconnectindex].secret_rooms/ps[myconnectindex].max_secret_rooms|0));
					sprintf(text,"%-3d",ps[myconnectindex].max_secret_rooms-ps[myconnectindex].secret_rooms);
					gametext((320>>2)+70,130+9,text,0,2+8+16);
				}
			}

			if(totalclock > 10240 && totalclock < 10240+10240)
				totalclock = 1024;

			if( KB.keyWaiting() && totalclock > (60*2) )
			{
				if( KB_KeyPressed( sc_F12 ) )
				{
					KB_ClearKeyDown( sc_F12 );
					takescreenshot();
				}

				if( totalclock < (60*13) )
				{
					KB.flushKeyboardQueue();
					totalclock = (60*13);
				}
				else if( totalclock < (1000000000))
					totalclock = (1000000000);
			}
		}
		else break;
		nextpage();
	}
}

//10321
function cameratext(i)
{
	var  flipbits;
	var x , y;

	if(!hittype[i].temp_data[0])
	{
		rotateSprite(24<<16,33<<16,65536,0,CAMCORNER,0,0,2,windowx1,windowy1,windowx2,windowy2);
		rotateSprite((320-26)<<16,34<<16,65536,0,CAMCORNER+1,0,0,2,windowx1,windowy1,windowx2,windowy2);
		rotateSprite(22<<16,163<<16,65536,512,CAMCORNER+1,0,0,2+4,windowx1,windowy1,windowx2,windowy2);
		rotateSprite((310-10)<<16,163<<16,65536,512,CAMCORNER+1,0,0,2,windowx1,windowy1,windowx2,windowy2);
		if(totalclock&16)
			rotateSprite(46<<16,32<<16,65536,0,CAMLIGHT,0,0,2,windowx1,windowy1,windowx2,windowy2);
	}
	else
	{
		flipbits = (totalclock<<1)&48;
		for(x=0;x<394;x+=64)
			for(y=0;y<200;y+=64)
			    rotateSprite(x << 16, y << 16, 65536, 0, STATIC, 0, 0, 2 + flipbits, windowx1, windowy1, windowx2, windowy2);
	}
}


function vglass(x, y, a, wn, n) {
    var z, zincs;
    var sect;

    sect = wall[wn].nextsector;
    if (sect == -1) return;
    zincs = ((sector[sect].floorz - sector[sect].ceilingz) / n) | 0;

    for (z = sector[sect].ceilingz; z < sector[sect].floorz; z += zincs)
        EGS_arg_swap(5, -1, 0, 16 + (TRAND & 31), a + 128 - (TRAND & 255), 36, 36, -32, GLASSPIECES + (z & (TRAND % 3)), z - (TRAND & 8191), y, x, sect);
}

function lotsofglass(i, wallnum, n) {
    var j, xv, yv, z, x1, y1;
    var sect, a;

    sect = -1;

    if (wallnum < 0) {
        for (j = n - 1; j >= 0 ; j--) {
            a = sprite[i].ang - 256 + (TRAND & 511) + 1024;
            EGS_arg_swap(5, i, 1024 - (TRAND & 1023), 32 + (TRAND & 63), a, 36, 36, -32, GLASSPIECES + (j % 3), sprite[i].z, sprite[i].y, sprite[i].x, sprite[i].sectnum);
        }
        return;
    }

    j = n + 1;

    x1 = wall[wallnum].x;
    y1 = wall[wallnum].y;

    xv = wall[wall[wallnum].point2].x - x1;
    yv = wall[wall[wallnum].point2].y - y1;

    x1 -= ksgn(yv);
    y1 += ksgn(xv);

    xv = (xv / j) | 0;
    yv = (yv / j) | 0;

    var sectRef = new Ref(sect);
    for (j = n; j > 0; j--) {
        x1 += xv;
        y1 += yv;

        sectRef.$ = sect;
        updatesector(x1, y1, sectRef);
        sect = sectRef.$;
        if (sect >= 0) {
            z = sector[sect].floorz - (TRAND & (klabs(sector[sect].ceilingz - sector[sect].floorz)));
            if (z < -(32 << 8) || z > (32 << 8))
                z = sprite[i].z - (32 << 8) + (TRAND & ((64 << 8) - 1));
            a = sprite[i].ang - 1024;
            EGS_arg_swap(5, i, -(TRAND & 1023), 32 + (TRAND & 63), a, 36, 36, -32, GLASSPIECES + (j % 3), z, y1, x1, sprite[i].sectnum);
        }
    }
}

function spriteglass(i, n) {
    var j, k, a, z;

    for (j = n; j > 0; j--) {
        a = TRAND & 2047;
        z = sprite[i].z - ((TRAND & 16) << 8);
        k = EGS_arg_swap(5, i, -512 - (TRAND & 2047), 32 + (TRAND & 63), a, 36, 36, TRAND & 15, GLASSPIECES + (j % 3), z, sprite[i].y, sprite[i].x, sprite[i].sectnum);
        sprite[k].pal = sprite[i].pal;
    }
}

//10402
function ceilingglass(i, sectnum, n) {
    var j, xv, yv, z, x1, y1;
    var a, s, startwall, endwall;

    startwall = sector[sectnum].wallptr;
    endwall = startwall + sector[sectnum].wallnum;

    for (s = startwall; s < (endwall - 1) ; s++) {
        x1 = wall[s].x;
        y1 = wall[s].y;

        xv = ((wall[s + 1].x - x1) / (n + 1)) | 0;
        yv = ((wall[s + 1].y - y1) / (n + 1)) | 0;

        for (j = n; j > 0; j--) {
            x1 += xv;
            y1 += yv;
            a = TRAND & 2047;
            z = sector[sectnum].ceilingz + ((TRAND & 15) << 8);
            EGS(sectnum, x1, y1, z, GLASSPIECES + (j % 3), -32, 36, 36, a, (TRAND & 31), 0, i, 5);
        }
    }
}

//10431
function lotsofcolourglass(i, wallnum, n) {
    var j, xv, yv, z, x1, y1;
    var sect = new Ref(-1), a, k;

    if (wallnum < 0) {
        for (j = n - 1; j >= 0 ; j--) {
            a = TRAND & 2047;
            k = EGS_arg_swap(5, i, 1024 - (TRAND & 2047), 32 + (TRAND & 63), a, 36, 36, -32, GLASSPIECES + (j % 3), sprite[i].z - (TRAND & (63 << 8)), sprite[i].y, sprite[i].x, sprite[i].sectnum);
            sprite[k].pal = TRAND & 15;
        }
        return;
    }

    j = n + 1;
    x1 = wall[wallnum].x;
    y1 = wall[wallnum].y;

    xv = (wall[wall[wallnum].point2].x - wall[wallnum].x) / j;
    yv = (wall[wall[wallnum].point2].y - wall[wallnum].y) / j;

    for (j = n; j > 0; j--) {
        x1 += xv;
        y1 += yv;

        updatesector(x1, y1, sect);
        z = sector[sect.$].floorz - (TRAND & (klabs(sector[sect.$].ceilingz - sector[sect.$].floorz)));
        if (z < -(32 << 8) || z > (32 << 8))
            z = sprite[i].z - (32 << 8) + (TRAND & ((64 << 8) - 1));
        a = sprite[i].ang - 1024;
        k = EGS_arg_swap(5, i, -(TRAND & 2047), 32 + (TRAND & 63), a, 36, 36, -32, GLASSPIECES + (j % 3), z, y1, x1, sprite[i].sectnum);
        sprite[k].pal = TRAND & 7;
    }
}

//10434

function setupGameButtons() {
    console.log("todo setupGameButtons");
}


// FIX_00006: better naming system for screenshots + message when pic is taken. 
//            Use ./screenshots folder. Screenshot code rerwritten. Faster and
//            makes smaller files. Doesn't freeze or lag the game anymore.
function takescreenshot() {
    return;

    //todo: maybe change key from F12 or something?

    var szFilename = "";
    var i;
    var score = "";
    var time4file;
    var tmHMS;
    var text = "";

    // xduke: Build a nice name w/ date and players name if in multi mode.
    time4file = Date.now();
    tmHMS = new Date(); //localtime(&time4file);

    text = "Chocolate DukeNukem3D(" + CHOCOLATE_DUKE_REV_X + "." + CHOCOLATE_DUKE_REV_DOT_Y + ") "
        + tmHMS.getFullYear() +
        "." + (tmHMS.getMonth() < 10 ? "0" + tmHMS.getMonth() : tmHMS.getMonth()) +
        "." + (tmHMS.getDay() < 10 ? "0" + tmHMS.getDay() : tmHMS.getDay()) +
        " " + (tmHMS.getHours() < 10 ? "0" + tmHMS.getHours() : tmHMS.getHours()) +
        "h" + (tmHMS.getMinutes() < 10 ? "0" + tmHMS.getMinutes() : tmHMS.getMinutes()) +
        "m" + (tmHMS.getSeconds() < 10 ? "0" + tmHMS.getSeconds() : tmHMS.getSeconds());

    //if(ud.multimode>1) // if more than 1 player, we add name. Then add score if DM
    //{
    // todo
    //    text[0] = '\0';
    //    strcat((char *)text, " [");
    //    for(i=connecthead;i>=0;i=connectpoint2[i])
    //    {
    //        if(!ud.user_name[i][0])
    //            strcat(text, "NoName");
    //        else
    //            strcat(text, &ud.user_name[i][0]);

    //        if(ud.m_coop==0 || ud.m_coop==2)  // if DM or DM No spawn. Add Score as well
    //        {
    //            strcat(text, "(");
    //            snprintf(score, sizeof(score), "%d",ps[i].frag-ps[i].fraggedself);
    //            strcat(text, score);
    //            strcat(text, ") vs ");
    //        }
    //        else
    //            strcat(text, " vs ");
    //    }	
    //    tempbuf[strlen(text)-4]=0; // remove last vs
    //    strcat(text, "]");
    //}
    text += ".png";


    // If this is a TC save it to the TC's directory
    if (getGameDir()[0] != '\0') {
        //todo
        //sprintf(szFilename, "%s\\%s", getGameDir(), SCREENSHOTPATH);
        //mkdir(szFilename);
        //sprintf(szFilename, "%s\\%s\\%s", getGameDir(), SCREENSHOTPATH, tempbuf);
    }
        // otherwise let's save it to the root.
    else {
        //todo
        //mkdir(SCREENSHOTPATH);
        //sprintf(szFilename, "%s\\%s", SCREENSHOTPATH, tempbuf);
    }

    //if(SafeFileExists(szFilename) == 0)
    //{
    szFilename = text;
    screencapture(szFilename, 0);
    //    sprintf(fta_quotes[103],"SCREEN SAVED");  
    //    sound(EXITMENUSOUND);
    //}
    //else
    //    sprintf(fta_quotes[103],"CAN'T WRITE FILE!");

    FTA(103, ps[screenpeek], 1);
}
