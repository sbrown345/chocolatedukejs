﻿'use strict';

var probey = 0, lastprobey = 0, last_menu, globalskillsound = -1;
//var sh, onbar, buttonstat, deletespot;
//var last_zero, last_fifty, last_threehundred = 0;
//var fileselect = 1, menunamecnt;
//var  menuname[256][17];

function menutext(x, y, s, p, t) {
    var i, ac, centre;

    var letter, letterCh;
    y -= 12;

    i = centre = 0;

    if (x === (320 >> 1)) {
        for (i = 0; i < t.length; i++) {
            letter = t[i];
            letterCh = t.charCodeAt(i);
            if (letter === ' ') {
                centre += 5;
                i++;
                continue;
            }
            ac = 0;
            if (letterCh >= '0'.charCodeAt(0) && letterCh <= '9'.charCodeAt(0)) {
                ac = letterCh - '0'.charCodeAt(0) + BIGALPHANUM - 10;
            } else if (letterCh >= 'a'.charCodeAt(0) && letterCh <= 'z'.charCodeAt(0)) {
                ac = (letter.toUpperCase().charCodeAt(0)) - 'A'.charCodeAt(0) + BIGALPHANUM;
            } else if (letterCh >= 'A'.charCodeAt(0) && letterCh <= 'Z'.charCodeAt(0)) {
                ac = letterCh - 'A'.charCodeAt(0) + BIGALPHANUM;
            } else {
                switch (letter) {
                    case '-':
                        ac = BIGALPHANUM - 11;
                        break;
                    case '.':
                        ac = BIGPERIOD;
                        break;
                    case '\'':
                        ac = BIGAPPOS;
                        break;
                    case ',':
                        ac = BIGCOMMA;
                        break;
                    case '!':
                        ac = BIGX;
                        break;
                    case '?':
                        ac = BIGQ;
                        break;
                    case ';':
                        ac = BIGSEMI;
                        break;
                    case ':':
                        ac = BIGSEMI;
                        break;
                    default:
                        centre += 5;
                        i++;
                        continue;
                }
            }

            centre += tiles[ac].dim.width - 1;
        }
    }

    if (centre) {
        x = (320 - centre - 10) >> 1;
    }

    for (i = 0; i < t.length; i++) {
        letter = t[i];
        letterCh = t.charCodeAt(i);
        if (letter === ' ') {
            x += 5;
            i++;
            continue;
        }
        ac = 0;
        if (letterCh >= '0'.charCodeAt(0) && letterCh <= '9'.charCodeAt(0)) {
            ac = letterCh - '0'.charCodeAt(0) + BIGALPHANUM - 10;
        } else if (letterCh >= 'a'.charCodeAt(0) && letterCh <= 'z'.charCodeAt(0)) {
            ac = (letter.toUpperCase().charCodeAt(0)) - 'A'.charCodeAt(0) + BIGALPHANUM;
        } else if (letterCh >= 'A'.charCodeAt(0) && letterCh <= 'Z'.charCodeAt(0)) {
            ac = letterCh - 'A'.charCodeAt(0) + BIGALPHANUM;
        } else {
            switch (letter) {
                case '-':
                    ac = BIGALPHANUM - 11;
                    break;
                case '.':
                    ac = BIGPERIOD;
                    break;
                case ',':
                    ac = BIGCOMMA;
                    break;
                case '!':
                    ac = BIGX;
                    break;
                case '\'':
                    ac = BIGAPPOS;
                    break;
                case '?':
                    ac = BIGQ;
                    break;
                case ';':
                    ac = BIGSEMI;
                    break;
                case ':':
                    ac = BIGCOLIN;
                    break;
                default:
                    x += 5;
                    i++;
                    continue;
            }
        }
        rotateSprite(x << 16, y << 16, 65536, 0, ac, s, p, 10 + 16, 0, 0, xdim - 1, ydim - 1);

        x += tiles[ac].dim.width;
    }

    return x;
}

// 1208
var volnum, levnum, plrskl, numplr;
var lastsavedpos = -1;

// 4152
function palto(r, g, b, e) {
    var i, tempArray = new Uint8Array(768);

    for (i = 0; i < (256 * 3) ; i += 3) {
        tempArray[i] = ps[myconnectindex].palette[i + 0] + (((r - ps[myconnectindex].palette[i + 0]) * (e & 127)) >> 6);
        tempArray[i + 1] = ps[myconnectindex].palette[i + 1] + (((g - ps[myconnectindex].palette[i + 1]) * (e & 127)) >> 6);
        tempArray[i + 2] = ps[myconnectindex].palette[i + 2] + (((b - ps[myconnectindex].palette[i + 2]) * (e & 127)) >> 6);
    }

    setBrightness(ud.brightness >> 2, tempArray);
}

//4490
function logoanimsounds(fr) {
    switch (fr) {
        case 1:
            sound(FLY_BY);
            break;
        case 19:
            sound(PIPEBOMB_EXPLODE);
            break;
    }
}

// 4602
var lastanimhack = 0;
function playanm(filename, t) {
    var animbuf, palptr;
    var i, j, k, length, numframes;
    var handle;

    if (t != 7 && t != 9 && t != 10 && t != 11) {
        KB.flushKeyboardQueue();
    }

    if (KB.keyWaiting()) {
        // todo
        throw new Error("todo");
    }

    handle = TCkopen4load(filename, false);

    if (handle === -1) {
        return;
    }

    length = kfilelength(handle);

    tiles[MAXTILES - 3 - t].lock = 219 + t;

    if (!anim || lastanimhack != (MAXTILES - 3 - t)) {
        console.log("caching neeeded? allocache((uint8_t**)&anim,length+sizeof(anim_t),&tiles[MAXTILES-3-t].lock);");
    }

    animbuf = new Uint8Array(length + 133524);

    lastanimhack = (MAXTILES - 3 - t);

    tiles[MAXTILES - 3 - t].dim.width = 200;
    tiles[MAXTILES - 3 - t].dim.height = 320;

    kread(handle, animbuf, length);
    kclose(handle);

    Anim.loadAnim(animbuf);
    numframes = Anim.numFrames();

    palptr = Anim.getPalette();

    for (i = 0; i < 256; i++) {
        j = (i << 2); k = j - i;
        tempbuf[j + 0] = (palptr[k + 2] >> 2);
        tempbuf[j + 1] = (palptr[k + 1] >> 2);
        tempbuf[j + 2] = (palptr[k + 0] >> 2);
        tempbuf[j + 3] = 0;
    }

    VBE_setPalette(tempbuf, "debug");

    ototalclock = totalclock + 10;

    i = 1;
    q.setPositionAtStart();
    q.addWhile(function () {
        return i++ < numframes;
    }, function () {
        q.setPositionAtStart()
        .addWhile(function () {
            return totalclock < ototalclock;
        }, function () {
            q.setPositionAtStart(); // important!
            if (KB.keyWaiting()) {
                //goto ENDOFANIMLOOP;
                throw new Error("goto label todo");
            }
            getPackets();
        }).add(function () {
            if (t == 10) ototalclock += 14;
            else if (t == 9) ototalclock += 10;
            else if (t == 7) ototalclock += 18;
            else if (t == 6) ototalclock += 14;
            else if (t == 5) ototalclock += 9;
            else if (ud.volume_number == 3) ototalclock += 10;
            else if (ud.volume_number == 2) ototalclock += 10;
            else if (ud.volume_number == 1) ototalclock += 18;
            else ototalclock += 10;

            tiles[MAXTILES - 3 - t].data = Anim.drawFrame(i);
            rotateSprite(0 << 16, 0 << 16, 65536, 512, MAXTILES - 3 - t, 0, 0, 2 + 4 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1);
            nextpage();

            if (t == 8) endanimvol41(i);
            else if (t == 10) endanimvol42(i);
            else if (t == 11) endanimvol43(i);
            else if (t == 9) intro42animsounds(i);
            else if (t == 7) intro4animsounds(i);
            else if (t == 6) first4animsounds(i);
            else if (t == 5) logoanimsounds(i);
            else if (t < 4) endanimsounds(i);

            i++;
        });
    }).add(function () {
        Anim.freeAnim();
        tiles[MAXTILES - 3 - t].lock = 1;
    });
}

