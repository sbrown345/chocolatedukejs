//'use strict';

var Game = {};

var nHostForceDisableAutoaim = 0;

// Game play speed
var g_iTickRate = 120;
var g_iTicksPerFrame = 26;
var TICRATE = g_iTickRate;
var TICSPERFRAME = (TICRATE / g_iTicksPerFrame);

var CommandSoundToggleOff = 0;
var CommandMusicToggleOff = 0;

var confilename = "GAME.CON";
var boardfilename = null;
var waterpal = new Uint8Array(768), slimepal = new Uint8Array(768), titlepal = new Uint8Array(768), drealms = new Uint8Array(768), endingpal = new Uint8Array(768);
var firstdemofile;

var recfilep, totalreccnt;
//uint8_t  debug_on = 0,actor_tog = 0,memorycheckoveride=0;
//uint8_t *rtsptr;

//extern uint8_t  syncstate;
//extern int32 numlumps; (in rts.js)


var restorepalette, screencapt, nomorelogohack = 0;
var sendmessagecommand = -1;

//459
function getPackets() {
    //int32_t i, j, k, l;
    //short other, packbufleng;
    //input *osyn, *nsyn;

    sampleTimer();
    //if(qe == 0 && KB_KeyPressed(sc_LeftControl) && KB_KeyPressed(sc_LeftAlt) && KB_KeyPressed(sc_Delete))
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
    //todo if(qe == 0 && KB_KeyPressed(sc_LeftControl) && KB_KeyPressed(sc_LeftAlt) && KB_KeyPressed(sc_Delete))
    //{
    //    qe = 1;
    //    gameexit("Quick Exit.");
    //}

    if ((totalclock < ototalclock + TICSPERFRAME) || (ready2send === 0)) {
        return; // Returns here when playing a demo.
    }

    throw new Error("todo");
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

//3001
Game.drawBackground = function () {
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
        debugger;
        y = 0;
        if (ud.coop != 1) {
            if (ud.multimode > 1) y += 8;
            if (ud.multimode > 4) y += 8;
        }

        x1 = max(windowx1 - 4, 0);
        y1 = max(windowy1 - 4, y);
        x2 = min(windowx2 + 4, xdim - 1);
        y2 = min(windowy2 + 4, scale(ydim, 200 - 34, 200) - 1);

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

//3472
function EGS(whatsect, s_x, s_y, s_z, s_pn, s_s, s_xr, s_yr, s_a, s_ve, s_zv, s_ow, s_ss) {
    var i;
    var s;

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
}

var tempwallptr;

function spawn(j, pn) {
    var i = 0, s = 0, startwall = 0, endwall = 0, sect = 0, clostest = 0;
    var x = 0, y = 0, d = 0;
    var sp;
    var text = "";

    console.log("spawn j: %i, pn: %i", j, pn);
    if (j >= 0) {
        throw new Error("TODO");
        //i = EGS(sprite[j].sectnum,sprite[j].x,sprite[j].y,sprite[j].z
        //    ,pn,0,0,0,0,0,0,j,0);
        //hittype[i].picnum = sprite[j].picnum;
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
            console.log("sprite[%i].extra = %i", i, sprite[i].extra);
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
            throw new Error("todo");
            //sp.xrepeat = sp.yrepeat = 0;
            //changespritestat(i,5);
            //break;
        case WATERSPLASH2:
            throw new Error("todo");
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
            throw new Error("todo");
            if (j >= 0)
                sp.ang = sprite[j].ang;
            sp.z -= 38 << 8;
            sp.zvel = 256 - (krand() & 511);
            sp.xvel = 64 - (krand() & 127);
            changespritestat(i, 4);
            break;
        case NATURALLIGHTNING:
            throw new Error("todo");
            sp.cstat &= ~257;
            sp.cstat |= 32768;
            break;
        case TRANSPORTERSTAR:
        case TRANSPORTERBEAM:
            throw new Error("todo");
            //if(j == -1) break;
            //if(sp.picnum == TRANSPORTERBEAM)
            //{
            //    sp.xrepeat = 31;
            //    sp.yrepeat = 1;
            //    sp.z = sector[sprite[j].sectnum].floorz-(40<<8);
            //}
            //else
            //{
            //    if(sprite[j].statnum == 4)
            //    {
            //        sp.xrepeat = 8;
            //        sp.yrepeat = 8;
            //    }
            //    else
            //    {
            //        sp.xrepeat = 48;
            //        sp.yrepeat = 64;
            //        if(sprite[j].statnum == 10 || badguy(&sprite[j]) )
            //            sp.z -= (32<<8);
            //    }
            //}

            //sp.shade = -127;
            //sp.cstat = 128|2;
            //sp.ang = sprite[j].ang;

            //sp.xvel = 128;
            //changespritestat(i,5);
            //ssp(i,CLIPMASK0);
            //setsprite(i,sp.x,sp.y,sp.z);
            //break;

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
            throw new Error("todo");
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
            throw new Error("todo");
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
            throw new Error("todo");
            sp.xrepeat = sp.yrepeat = 16;
            sp.z -= (26 << 8);
            if (j >= 0 && sprite[j].pal == 6)
                sp.pal = 6;
            changespritestat(i, 5);
            break;
        case BLOODPOOL:
        case PUKE:
            throw new Error("todo");
            //{
            //    var s1;
            //    s1 = sp.sectnum;

            //    updatesector(sp.x+108,sp.y+108,&s1);
            //    if(s1 >= 0 && sector[s1].floorz == sector[sp.sectnum].floorz)
            //    {
            //        updatesector(sp.x-108,sp.y-108,&s1);
            //        if(s1 >= 0 && sector[s1].floorz == sector[sp.sectnum].floorz)
            //        {
            //            updatesector(sp.x+108,sp.y-108,&s1);
            //            if(s1 >= 0 && sector[s1].floorz == sector[sp.sectnum].floorz)
            //            {
            //                updatesector(sp.x-108,sp.y+108,&s1);
            //                if(s1 >= 0 && sector[s1].floorz != sector[sp.sectnum].floorz)
            //                { sp.xrepeat = sp.yrepeat = 0;changespritestat(i,5);break;}
            //            }
            //            else { sp.xrepeat = sp.yrepeat = 0;changespritestat(i,5);break;}
            //        }
            //        else { sp.xrepeat = sp.yrepeat = 0;changespritestat(i,5);break;}
            //    }
            //    else { sp.xrepeat = sp.yrepeat = 0;changespritestat(i,5);break;}
            //}

            //if( sector[sprite[i].sectnum].lotag == 1 )
            //{
            //    changespritestat(i,5);
            //    break;
            //}

            //if(j >= 0 && sp.picnum != PUKE)
            //{
            //    if( sprite[j].pal == 1)
            //        sp.pal = 1;
            //    else if( sprite[j].pal != 6 && sprite[j].picnum != NUKEBARREL && sprite[j].picnum != TIRE )
            //    {
            //        if(sprite[j].picnum == FECES)
            //            sp.pal = 7; // Brown
            //        else sp.pal = 2; // Red
            //    }
            //    else sp.pal = 0;  // green

            //    if(sprite[j].picnum == TIRE)
            //        sp.shade = 127;
            //}
            //sp.cstat |= 32;
        case FECES:
            throw new Error("todo");
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
            throw new Error("todo");
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
            throw new Error("todo");
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
            throw new Error("todo");
            //if(j >= 0)
            //{
            //    short s1;
            //    s1 = sp.sectnum;

            //    updatesector(sp.x+84,sp.y+84,&s1);
            //    if(s1 >= 0 && sector[s1].floorz == sector[sp.sectnum].floorz)
            //    {
            //        updatesector(sp.x-84,sp.y-84,&s1);
            //        if(s1 >= 0 && sector[s1].floorz == sector[sp.sectnum].floorz)
            //        {
            //            updatesector(sp.x+84,sp.y-84,&s1);
            //            if(s1 >= 0 && sector[s1].floorz == sector[sp.sectnum].floorz)
            //            {
            //                updatesector(sp.x-84,sp.y+84,&s1);
            //                if(s1 >= 0 && sector[s1].floorz != sector[sp.sectnum].floorz)
            //                { sp.xrepeat = sp.yrepeat = 0;changespritestat(i,5);break;}
            //            }
            //            else { sp.xrepeat = sp.yrepeat = 0;break;}
            //        }
            //        else { sp.xrepeat = sp.yrepeat = 0;break;}
            //    }
            //    else { sp.xrepeat = sp.yrepeat = 0;break;}

            //    sp.cstat = 32+((ps[sprite[j].yvel].footprintcount&1)<<2);
            //    sp.ang = sprite[j].ang;
            //}

            //sp.z = sector[sect].floorz;
            //if(sector[sect].lotag != 1 && sector[sect].lotag != 2)
            //    sp.xrepeat = sp.yrepeat = 32;

            //insertspriteq(i);
            //changespritestat(i,5);
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
            throw new Error("todo");
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
            throw new Error("todo");
            if (j >= 0 && sprite[j].picnum == APLAYER) {
                sp.xrepeat = sprite[j].xrepeat;
                sp.yrepeat = sprite[j].yrepeat;
                sp.shade = sprite[j].shade;
                sp.pal = ps[sprite[j].yvel].palookup;
            }
        case DUKECAR:
        case HELECOPT:
            throw new Error("todo");
            //                if(sp.picnum == HELECOPT || sp.picnum == DUKECAR) sp.xvel = 1024;
            sp.cstat = 0;
            sp.extra = 1;
            sp.xvel = 292;
            sp.zvel = 360;
        case RESPAWNMARKERRED:
        case BLIMP:

            throw new Error("todo");
            if (sp.picnum == RESPAWNMARKERRED) {
                sp.xrepeat = sp.yrepeat = 24;
                if (j >= 0) sp.z = hittype[j].floorz; // -(1<<4);
            }
            else {
                sp.cstat |= 257;
                sp.clipdist = 128;
            }
        case MIKE:
            throw new Error("todo");
            if (sp.picnum == MIKE)
                sp.yvel = sp.hitag;
        case WEATHERWARN:
            throw new Error("todo");
            changespritestat(i, 1);
            break;

        case SPOTLITE:
            throw new Error("todo");
            hittype[i].temp_data[0] = sp.x;
            hittype[i].temp_data[1] = sp.y;
            break;
        case BULLETHOLE:
            throw new Error("todo");
            sp.xrepeat = sp.yrepeat = 3;
            sp.cstat = 16 + (krand() & 12);
            insertspriteq(i);
        case MONEY:
        case MAIL:
        case PAPER:
            throw new Error("todo");
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
            throw new Error("todo");
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

            throw new Error("todo");
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
            throw new Error("todo");
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
            throw new Error("todo");
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

            throw new Error("todo");
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
            throw new Error("todo");
            if ((j >= 0 && sprite[j].statnum == 10) || sprite[j].statnum == 1) {
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

            throw new Error("todo");
            if (sp.picnum != WATERDRIP)
                sp.ang = krand() & 2047;

        case WATERDRIPSPLASH:

            throw new Error("todo");
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
                    setinterpolation(sector[sect].ceilingz);
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
                    throw new Error("todo")

                    //        hittype[i].temp_data[2] = sector[sect].floorz; //Stopping loc

                    //        j = nextsectorneighborz(sect,sector[sect].floorz,-1,-1);
                    //        hittype[i].temp_data[3] = sector[j].ceilingz;

                    //        j = nextsectorneighborz(sect,sector[sect].ceilingz,1,1);
                    //        hittype[i].temp_data[4] = sector[j].floorz;

                    //        if(numplayers < 2)
                    //        {
                    //            setinterpolation(&sector[sect].floorz);
                    //            setinterpolation(&sector[sect].ceilingz);
                    //        }

                    //        break;

                case 24:
                    sp.yvel <<= 1;
                case 36:
                    break;
                case 20:
                    throw new Error("todo")
                    //        {
                    //            int32_t q;

                    //            startwall = sector[sect].wallptr;
                    //            endwall = startwall+sector[sect].wallnum;

                    //            //find the two most clostest wall x's and y's
                    //            q = 0x7fffffff;

                    //            for(s=startwall;s<endwall;s++)
                    //            {
                    //                x = wall[s].x;
                    //                y = wall[s].y;

                    //                d = FindDistance2D(sp.x-x,sp.y-y);
                    //                if( d < q )
                    //                {
                    //                    q = d;
                    //                    clostest = s;
                    //                }
                    //            }

                    //            hittype[i].temp_data[1] = clostest;

                    //            q = 0x7fffffff;

                    //            for(s=startwall;s<endwall;s++)
                    //            {
                    //                x = wall[s].x;
                    //                y = wall[s].y;

                    //                d = FindDistance2D(sp.x-x,sp.y-y);
                    //                if(d < q && s != hittype[i].temp_data[1])
                    //                {
                    //                    q = d;
                    //                    clostest = s;
                    //                }
                    //            }

                    //            hittype[i].temp_data[2] = clostest;
                    //        }

                    //        break;

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

                    setinterpolation(sector[sect].floorz);

                    break;
                case 32:
                    hittype[i].temp_data[1] = sector[sect].ceilingz;
                    hittype[i].temp_data[2] = sp.hitag;
                    if (sp.ang != 1536) sector[sect].ceilingz = sp.z;

                    startwall = sector[sect].wallptr;
                    endwall = startwall + sector[sect].wallnum;

                    for (s = startwall; s < endwall; s++)
                        if (wall[s].hitag == 0) wall[s].hitag = 9999;

                    setinterpolation(sector[sect].ceilingz);

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
                        labs(sector[sect].ceilingz - sp.z) > 1024)
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
                    throw new Error("todo")
                    //        if(sp.ang>1024) hittype[i].temp_data[3] = 2;
                    //        else hittype[i].temp_data[3] = -2;
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

    console.log("cstat: %i", sp.cstat);
    console.log("cstat: %i", sp.cstat);
    //console.log("sect: %i", sect); //todo: CHECK sect and all objects
    // todo check all... spritetype (Sprite)

    return i;
}

//7486
function logo() {
    console.log("(9) logo");
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
            console.log("(10) play logo anm");

            // This plays the explosion from the nuclear sign at the beginning.
            q.setPositionAtStart()
                .addIf(function () {
                    return !VOLUMEONE();
                }, function () {
                    // todo: it skips a frame here, how to fix this? addIfExecNow()? or rewrite into one if
                    q.setPositionAtStart()
                        .addIf(function () { return !KB.keyWaiting() && nomorelogohack == 0; },
                            function () {
                                getPackets();

                                q.setPositionAtStart()
                                    .add(function () {
                                        playanm("logo.anm", 5);
                                    }).add(function () {
                                        palto(0, 0, 0, 63);
                                        KB.flushKeyboardQueue();
                                    });
                            })
                        .endIf();
                    q.add(function () {
                        console.log("(20) REALITY IS OUR GAME Screen");
                        clearView(0);
                        nextpage();

                        //MIDI start here
                        playMusic(env_music_fn[0]);

                        // "REALITY IS OUR GAME" Screen
                        for (i = 0; i < 64; i += 7) {
                            q.add(i, function (cb, i) {
                                console.log("(22)");
                                palto(0, 0, 0, i);
                            });
                        }
                        q.add(function () {
                            console.log("(25)");
                            ps[myconnectindex].palette = drealms;
                            palto(0, 0, 0, 63);
                            rotateSprite(0, 0, 65536, 0, DREALMS, 0, 0, 2 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1); // this is possibly broken
                            nextpage();

                            q.setInsertPosition(0);
                            for (i = 63; i > 0; i -= 7) {
                                q.add(i, function (cb, i) {
                                    console.log("(30)");
                                    palto(0, 0, 0, i);
                                });
                            }
                        });

                        q.add(i, function (cb, i) {
                            totalclock = 0;

                            q.setPositionAtStart().addWhile(function () {
                                return totalclock < (120 * 7);
                            }, function () {
                                console.info("(40) empty func to simuilate waiting, totalclock: %i", totalclock);
                                getPackets();
                            });
                        });

                        for (i = 0; i < 64; i += 7) {
                            q.add(i, function (cb, i) {
                                console.log("(50)");
                                palto(0, 0, 0, i);
                            });
                        }

                        q.add(function () {
                            console.log("(60)");
                            clearView(0);
                            // todo: finish start animation
                        });

                    });
                })
                .addElse()
                .endIf();
        }).addElseIf(function () { return numplayers > 1; }, function () {
            console.log("(10)  numplayers > 1");
            throw new Error("todo");
        }).addElse(function () {
            console.log("(10)  else SP");
            throw new Error("todo");
        })
        .endIf()
        .add(function () {
            console.log("(70) todo"); // todo
            preMap.waitForEverybody();

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

    console.log("loadTmb()");
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
    console.log("*** Chocolate DukeNukem3D JavaScript v" + CHOCOLATE_DUKE_REV_X + "." + CHOCOLATE_DUKE_REV_DOT_Y + " ***");

    ud.multimode = 1; // xduke: must be done before checkcommandline or that will prevent Fakeplayer and AI

    if (!load_duke3d_groupfile()) {
        throw new Error("Could not initialize any original BASE duke3d*.grp file\n" +
            "Even if you are playing a custom GRP you still need\n" +
            "an original base GRP file as Shareware/Full 1.3D GRP or\n" +
            "the v1.5 ATOMIC GRP file. Such a file seems to be missing\n" +
            "or is corrupted");
    }

    // Detecting grp version
    // We keep the old GRP scheme detection for 19.6 compliance. Will be obsolete.
    // todo: get grpVersion
    grpVersion = tempConstants.GRP_VERSION;

    // todo: print some info about GRP

    // todo: checkcommandline

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
        throw new Error("todo");
    }

    ud.last_level = -1;

    RTS.init(ud.rtsname);
    if (numlumps) {
        console.log("Using .RTS file:%s", ud.rtsname);
    }

    //todo: Control joystick, center joystick

    console.log("Loading palette/lookups.");

    if (setGameMode(ScreenMode, ScreenWidth, ScreenHeight) < 0) {
        throw new Error("todo");
    }

    console.log("genSpriteRemaps()");
    genSpriteRemaps();

    setBrightness(ud.brightness >> 2, ps[myconnectindex].palette);

    // todo:   if(KB_KeyPressed( sc_Escape ) )  
    //gameexit(" ");

    FX.stopAllSounds();
    clearsoundlocks();

    if (ud.warp_on > 1 && ud.multimode < 2) {
        throw new Error("todo");
    }

    // MAIN_LOOP_RESTART:

    // if game is loaded without /V or /L cmd arguments.{
    //if (ud.warp_on === 0) {
    //    if (numplayers > 1 && boardfilename[0] != 0) //check if a user map is loaded and in multiplayer.
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
                    logo();
                })
            .endIf();

    }).addElseIf(function () {
        return ud.warp_on === 1;
    }, function () {
        throw new Error("todo");
    })
        .addElse(function () {
            preMap.vscrn();
        })
        .endIf()
        .addWhile(function () {
            return ud.warp_on == 0 && isPlayingBack;
        }, function () {
            Game.playBack();
            //console.log("Demo loop");
        })
        .add(function () {
            console.log("EO demo loop");
            throw new Error("todo");
            //if (just played back)
            FX.stopAllSounds();
            clearsoundlocks();
            //nomorelogohack = 1;
            //goto MAIN_LOOP_RESTART;
        })
        .add(function () {
            ud.warp_on = 0;
            console.log("Start game loop");
            q.setPositionAtStart()
                .addWhile(function () {
                    return !(ps[myconnectindex].gm & MODE_END);
                }, function () {
                    throw new Error("todo");
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

    preMap.newGame(ud.volume_number, ud.level_number, ud.player_skill);
    return 1;
};

var isPlayingBack = true; // set to false later to simulate returning 0
Game.inMenu = 0;
Game.whichDemo = 1;
Game.playBack = function () {
    q.setPositionAtStart();

    var i, j, k, l, t;
    var foundDemo;

    if (ready2send) {
        return false;
    }

    Game.inMenu = ps[myconnectindex].gm & MODE_MENU;

    pub = NUMPAGES;
    pus = NUMPAGES;

    flushperms();


    if (numplayers < 2 && ud.multimode_bot < 2) {
        foundDemo = Game.openDemoRead(Game.whichDemo);
    }


    if (foundDemo === 0) {
        throw new Error("todo");
    } else {
        ud.recstat = 2;
        Game.whichDemo++;
        if (Game.whichDemo === 10) {
            Game.whichDemo = 1;
        }

        preMap.enterLevel(MODE_DEMO);
    }

    throw new Error("todo");
};

//10434

function setupGameButtons() {
    console.log("todo setupGameButtons");
}