'use strict';

var preMap = {}; // todo rename PreMap

var which_palookup = 9;

//36
function tloadtile(tileNumber) {
    gotpic[tileNumber >> 3] |= (1 << (tileNumber & 7));
}

//278
function cacheit() {
    console.log("todo cacheit"); // todo
    //var i,j;

    //precachenecessarysounds();

    //cachegoodsprites();

    //for(i=0;i<numwalls;i++)
    //    if(! tiles[wall[i].picnum].data )
    //    {
    //        if(!tiles[wall[i].picnum].data )
    //            tloadtile(wall[i].picnum);
    //        if(wall[i].overpicnum >= 0 && !tiles[wall[i].overpicnum].data  )
    //            tloadtile(wall[i].overpicnum);
    //    }

    //for(i=0;i<numsectors;i++)
    //{
    //    if( !tiles[sector[i].floorpicnum].data  )
    //        tloadtile( sector[i].floorpicnum );
    //    if( !tiles[sector[i].ceilingpicnum].data )
    //    {
    //        tloadtile( sector[i].ceilingpicnum );
    //        if( tiles[sector[i].ceilingpicnum].data == (uint8_t*)LA)
    //        {
    //            tloadtile(LA+1);
    //            tloadtile(LA+2);
    //        }
    //    }

    //    j = headspritesect[i];
    //    while(j >= 0)
    //    {
    //        if(sprite[j].xrepeat != 0 && sprite[j].yrepeat != 0 && (sprite[j].cstat&32768) == 0)
    //            if(!tiles[sprite[j].picnum].data )
    //                cachespritenum(j);
    //        j = nextspritesect[j];
    //    }
    //}

}

//322

function docacheit() {
    console.log("todo docacheit");
    // todo
}

//357
preMap.vscrn = function () {
    var ss, x1, x2, y1, y2;

    if (ud.screen_size < 0) {
        ud.screen_size = 0;
    } else if (ud.screen_size > 63) {
        ud.screen_size = 64;
    }

    if (ud.screen_size == 0) {
        flushperms();
    }

    ss = Math.max(ud.screen_size - 8, 0);

    x1 = scale(ss, xdim, 160);
    x2 = xdim - x1;

    y1 = ss;
    y2 = 200;
    y1 += preMap.countFragBars();

    if (ud.screen_size >= 8)
        y2 -= (ss + 34);

    y1 = scale(y1, ydim, 200);
    y2 = scale(y2, ydim, 200);

    setView(x1, y1, x2 - 1, y2 - 1);

    pub = NUMPAGES;
    pus = NUMPAGES;
};

//386
preMap.countFragBars = function () {
    var i, j, y = 0;
    if (ud.screen_size > 0 && ud.coop != 1 && ud.multimode > 1) {
        j = 0;
        for (i = connecthead; i >= 0; i = connectpoint2[i])
            if (i > j) j = i;

        if (j >= 1) y += 8;
        if (j >= 4) y += 8;
        if (j >= 8) y += 8;
        if (j >= 12) y += 8;
    }

    return y;
};

//425
preMap.resetPlayerStats = function (snum) {
    var p = ps[snum];

    ud.show_help = 0;
    ud.showallmap = 0;
    p.dead_flag = 0;
    p.wackedbyactor = -1;
    p.falling_counter = 0;
    p.quick_kick = 0;
    p.subweapon = 0;
    p.last_full_weapon = 0;
    p.ftq = 0;
    p.fta = 0;
    p.tipincs = 0;
    p.buttonpalette = 0;
    p.actorsqu = -1;
    p.invdisptime = 0;
    p.refresh_inventory = 0;
    p.last_pissed_time = 0;
    p.holster_weapon = 0;
    p.pycount = 0;
    p.pyoff = 0;
    p.opyoff = 0;
    p.loogcnt = 0;
    p.angvel = 0;
    p.weapon_sway = 0;
    //    p.select_dir       = 0;
    p.extra_extra8 = 0;
    p.show_empty_weapon = 0;
    p.dummyplayersprite = -1;
    p.crack_time = 0;
    p.hbomb_hold_delay = 0;
    p.transporter_hold = 0;
    p.wantweaponfire = -1;
    p.hurt_delay = 0;
    p.footprintcount = 0;
    p.footprintpal = 0;
    p.footprintshade = 0;
    p.jumping_toggle = 0;
    p.ohoriz = p.horiz = 140;
    p.horizoff = 0;
    p.bobcounter = 0;
    p.on_ground = 0;
    p.player_par = 0;
    p.return_to_center = 9;
    p.airleft = 15 * 26;
    p.rapid_fire_hold = 0;
    p.toggle_key_flag = 0;
    p.access_spritenum = -1;
    if (ud.multimode > 1 && ud.coop != 1)
        p.got_access = 7;
    else p.got_access = 0;
    p.random_club_frame = 0;
    pus = 1;
    p.on_warping_sector = 0;
    p.spritebridge = 0;
    p.palette = palette[0];

    if (p.steroids_amount < 400) {
        p.steroids_amount = 0;
        p.inven_icon = 0;
    }
    p.heat_on = 0;
    p.jetpack_on = 0;
    p.holoduke_on = -1;

    p.look_ang = 512 - ((ud.level_number & 1) << 10);

    p.rotscrnang = 0;
    p.newowner = -1;
    p.jumping_counter = 0;
    p.hard_landing = 0;
    p.posxv = 0;
    p.posyv = 0;
    p.poszv = 0;
    fricxv = 0;
    fricyv = 0;
    p.somethingonplayer = -1;
    p.one_eighty_count = 0;
    p.cheat_phase = 0;

    p.on_crane = -1;

    if (p.curr_weapon == PISTOL_WEAPON)
        p.kickback_pic = 5;
    else p.kickback_pic = 0;

    p.weapon_pos = 6;
    p.walking_snd_toggle = 0;
    p.weapon_ang = 0;

    p.knuckle_incs = 1;
    p.fist_incs = 0;
    p.knee_incs = 0;
    p.jetpack_on = 0;
    Player.setPal(p);
    p.weaponautoswitch = 0;
    p.auto_aim = 2;
    p.fakeplayer = 0;
};

//532
preMap.resetWeapons = function (snum) {
    var weapon;
    var p;

    p = ps[snum];

    for (weapon = PISTOL_WEAPON; weapon < MAX_WEAPONS; weapon++) {
        p.gotweapon[weapon] = 0;
    }
    for (weapon = PISTOL_WEAPON; weapon < MAX_WEAPONS; weapon++) {
        p.ammo_amount[weapon] = 0;
    }

    p.weapon_pos = 6;
    p.kickback_pic = 5;
    p.curr_weapon = PISTOL_WEAPON;
    p.gotweapon[PISTOL_WEAPON] = 1;
    p.gotweapon[KNEE_WEAPON] = 1;
    p.ammo_amount[PISTOL_WEAPON] = 48;
    p.gotweapon[HANDREMOTE_WEAPON] = 1;
    p.last_weapon = -1;

    p.show_empty_weapon = 0;
    p.last_pissed_time = 0;
    p.holster_weapon = 0;
};
//558
preMap.resetIinventory = function (snum) {
    var p;

    p = ps[snum];

    p.inven_icon = 0;
    p.boot_amount = 0;
    p.scuba_on = 0;
    p.scuba_amount = 0;
    p.heat_amount = 0;
    p.heat_on = 0;
    p.jetpack_on = 0;
    p.jetpack_amount = 0;
    p.shield_amount = max_armour_amount;
    p.holoduke_on = -1;
    p.holoduke_amount = 0;
    p.firstaid_amount = 0;
    p.steroids_amount = 0;
    p.inven_icon = 0;
};

//578
preMap.resetPreStat = function (snum, g) {
    var p;
    var i;

    p = ps[snum];

    spriteqloc = 0;
    for (i = 0; i < spriteqamount; i++) {
        spriteq[i] = -1;
    }

    p.hbomb_on = 0;
    p.cheat_phase = 0;
    p.pals_time = 0;
    p.toggle_key_flag = 0;
    p.secret_rooms = 0;
    p.max_secret_rooms = 0;
    p.actors_killed = 0;
    p.max_actors_killed = 0;
    p.lastrandomspot = 0;
    p.weapon_pos = 6;
    p.kickback_pic = 5;
    p.last_weapon = -1;
    p.weapreccnt = 0;
    p.show_empty_weapon = 0;
    p.holster_weapon = 0;
    p.last_pissed_time = 0;

    p.one_parallax_sectnum = -1;
    p.visibility = ud.const_visibility;

    screenpeek = myconnectindex;
    numanimwalls = 0;
    numcyclers = 0;
    animatecnt = 0;
    parallaxtype = 0;
    randomseed = 17;
    ud.pause_on = 0;
    ud.camerasprite = -1;
    ud.eog = 0;
    tempwallptr = 0;
    camsprite = -1;
    earthquaketime = 0;

    numinterpolations = 0;
    startofdynamicinterpolations = 0;

    if (((g & MODE_EOL) != MODE_EOL && numplayers < 2) || (ud.coop != 1 && numplayers > 1)) {
        preMap.resetWeapons(snum);
        preMap.resetIinventory(snum);
    }
    else if (p.curr_weapon == HANDREMOTE_WEAPON) {
        p.ammo_amount[HANDBOMB_WEAPON]++;
        p.curr_weapon = HANDBOMB_WEAPON;
    }

    p.timebeforeexit = 0;
    p.customexitsound = 0;
};

//670
preMap.preLevel = function (g) {
    var i, nexti, j, startwall, endwall, lotaglist;
    var lotags = new Int16Array(65);

    show2dsector = new Uint8Array((MAXSECTORS + 7) >> 3);
    show2dwall = new Uint8Array((MAXWALLS + 7) >> 3);
    show2dsprite = new Uint8Array((MAXSPRITES + 7) >> 3);

    preMap.resetPreStat(0, g);
    numclouds = 0;

    for (i = 0; i < numsectors; i++) {
        sector[i].extra = 256;

        switch (sector[i].lotag) {
            case 20:
            case 22:
                if (sector[i].floorz > sector[i].ceilingz)
                    sector[i].lotag |= 32768;
                continue;
        }

        if (sector[i].ceilingstat & 1) {
            if (!tiles[sector[i].ceilingpicnum].data) {
                if (sector[i].ceilingpicnum == LA)
                    for (j = 0; j < 5; j++)
                        if (!tiles[sector[i].ceilingpicnum + j].data)
                            tloadtile(sector[i].ceilingpicnum + j);
            }
            preMap.setupBackdrop(sector[i].ceilingpicnum);

            if (sector[i].ceilingpicnum == CLOUDYSKIES && numclouds < 127)
                clouds[numclouds++] = i;

            if (ps[0].one_parallax_sectnum == -1)
                ps[0].one_parallax_sectnum = i;
        }

        if (sector[i].lotag == 32767) //Found a secret room
        {
            ps[0].max_secret_rooms++;
            continue;
        }

        if (sector[i].lotag == -1) {
            ps[0].exitx = wall[sector[i].wallptr].x;
            ps[0].exity = wall[sector[i].wallptr].y;
            continue;
        }
    }

    i = headspritestat[0];

    while (i >= 0) {
        nexti = nextspritestat[i];

        if (sprite[i].lotag == -1 && (sprite[i].cstat & 16)) {
            ps[0].exitx = sprite[i].x;
            ps[0].exity = sprite[i].y;
        }
        else switch (sprite[i].picnum) {
            case 10://GPSPEED:
                sector[sprite[i].sectnum].extra = sprite[i].y;
                deletesprite(i);
                break;

            case 7://CYCLER:
                if (numcyclers >= MAXCYCLERS) {
                    throw new Error("\nToo many cycling sectors.");
                }
                cyclers[numcyclers][0] = sprite[i].sectnum;
                cyclers[numcyclers][1] = sprite[i].lotag;
                cyclers[numcyclers][2] = sprite[i].shade;
                cyclers[numcyclers][3] = sector[sprite[i].sectnum].floorshade;
                cyclers[numcyclers][4] = sprite[i].hitag;
                cyclers[numcyclers][5] = (sprite[i].ang == 1536);
                numcyclers++;
                deletesprite(i);
                break;
        }
        i = nexti;
    }

    for (i = 0; i < MAXSPRITES; i++) {
        if (sprite[i].statnum < MAXSTATUS) {
            if (sprite[i].picnum == SECTOREFFECTOR && sprite[i].lotag == 14)
                continue;
            spawn(-1, i);
        }
    }

    for (i = 0; i < MAXSPRITES; i++)
        if (sprite[i].statnum < MAXSTATUS) {
            if (sprite[i].picnum == SECTOREFFECTOR && sprite[i].lotag == 14)
                spawn(-1, i);
        }

    lotaglist = 0;

    i = headspritestat[0];

    while (i >= 0) {
        switch (sprite[i].picnum) {
            case DIPSWITCH:
            case DIPSWITCH2:
            case ACCESSSWITCH:
            case PULLSWITCH:
            case HANDSWITCH:
            case SLOTDOOR:
            case LIGHTSWITCH:
            case SPACELIGHTSWITCH:
            case SPACEDOORSWITCH:
            case FRANKENSTINESWITCH:
            case LIGHTSWITCH2:
            case POWERSWITCH1:
            case LOCKSWITCH1:
            case POWERSWITCH2:
                break;
            case DIPSWITCH + 1:
            case DIPSWITCH2 + 1:
            case PULLSWITCH + 1:
            case HANDSWITCH + 1:
            case SLOTDOOR + 1:
            case LIGHTSWITCH + 1:
            case SPACELIGHTSWITCH + 1:
            case SPACEDOORSWITCH + 1:
            case FRANKENSTINESWITCH + 1:
            case LIGHTSWITCH2 + 1:
            case POWERSWITCH1 + 1:
            case LOCKSWITCH1 + 1:
            case POWERSWITCH2 + 1:
                for (j = 0; j < lotaglist; j++)
                    if (sprite[i].lotag == lotags[j])
                        break;

                if (j == lotaglist) {
                    lotags[lotaglist] = sprite[i].lotag;
                    lotaglist++;
                    if (lotaglist > 64)
                        throw new Error("Too many switches (64 max).");

                    j = headspritestat[3];
                    while (j >= 0) {
                        if (sprite[j].lotag == 12 && sprite[j].hitag == sprite[i].lotag)
                            hittype[j].temp_data[0] = 1;
                        j = nextspritestat[j];
                    }
                }
                break;
        }
        i = nextspritestat[i];
    }

    mirrorcnt = 0;

    for (i = 0; i < numwalls; i++) {
        var wal = wall[i];

        if (wal.overpicnum == MIRROR && (wal.cstat & 32) != 0) {
            j = wal.nextsector;

            if (mirrorcnt > 63)
                throw new Error("Too many mirrors (64 max.)");
            if ((j >= 0) && sector[j].ceilingpicnum != MIRROR) {
                sector[j].ceilingpicnum = MIRROR;
                sector[j].floorpicnum = MIRROR;
                mirrorwall[mirrorcnt] = i;
                mirrorsector[mirrorcnt] = j;
                mirrorcnt++;
                continue;
            }
        }

        if (numanimwalls >= MAXANIMWALLS)
            throw new Error("Too many 'anim' walls (max 512.)");

        animwall[numanimwalls].tag = 0;
        animwall[numanimwalls].wallnum = 0;

        switch (wal.overpicnum) {
            case FANSHADOW:
            case FANSPRITE:
                wall.cstat |= 65;
                animwall[numanimwalls].wallnum = i;
                numanimwalls++;
                break;

            case W_FORCEFIELD:
                if (!tiles[W_FORCEFIELD].data)
                    for (j = 0; j < 3; j++)
                        tloadtile(W_FORCEFIELD + j);
            case W_FORCEFIELD + 1:
            case W_FORCEFIELD + 2:
                if (wal.shade > 31)
                    wal.cstat = 0;
                else wal.cstat |= 85 + 256;


                if (wal.lotag && wal.nextwall >= 0)
                    wall[wal.nextwall].lotag =
                        wal.lotag;

            case BIGFORCE:

                animwall[numanimwalls].wallnum = i;
                numanimwalls++;

                continue;
        }

        wal.extra = -1;

        switch (wal.picnum) {
            case WATERTILE2:
                for (j = 0; j < 3; j++)
                    if (!tiles[wal.picnum + j].data)
                        tloadtile(wal.picnum + j);
                break;

            case TECHLIGHT2:
            case TECHLIGHT4:
                if (tiles[wal.picnum].data == null)
                    tloadtile(wal.picnum);
                break;
            case W_TECHWALL1:
            case W_TECHWALL2:
            case W_TECHWALL3:
            case W_TECHWALL4:
                animwall[numanimwalls].wallnum = i;
                //                animwall[numanimwalls].tag = -1;
                numanimwalls++;
                break;
            case SCREENBREAK6:
            case SCREENBREAK7:
            case SCREENBREAK8:
                if (!tiles[SCREENBREAK6].data)
                    for (j = SCREENBREAK6; j < SCREENBREAK9; j++)
                        tloadtile(j);
                animwall[numanimwalls].wallnum = i;
                animwall[numanimwalls].tag = -1;
                numanimwalls++;
                break;

            case FEMPIC1:
            case FEMPIC2:
            case FEMPIC3:

                wal.extra = wal.picnum;
                animwall[numanimwalls].tag = -1;
                if (ud.lockout) {
                    if (wal.picnum == FEMPIC1)
                        wal.picnum = BLANKSCREEN;
                    else wal.picnum = SCREENBREAK6;
                }

                animwall[numanimwalls].wallnum = i;
                animwall[numanimwalls].tag = wal.picnum;
                numanimwalls++;
                break;

            case SCREENBREAK1:
            case SCREENBREAK2:
            case SCREENBREAK3:
            case SCREENBREAK4:
            case SCREENBREAK5:

            case SCREENBREAK9:
            case SCREENBREAK10:
            case SCREENBREAK11:
            case SCREENBREAK12:
            case SCREENBREAK13:
            case SCREENBREAK14:
            case SCREENBREAK15:
            case SCREENBREAK16:
            case SCREENBREAK17:
            case SCREENBREAK18:
            case SCREENBREAK19:

                animwall[numanimwalls].wallnum = i;
                animwall[numanimwalls].tag = wal.picnum;
                numanimwalls++;
                break;
        }
    }

    //Invalidate textures in sector behind mirror
    for (i = 0; i < mirrorcnt; i++) {
        startwall = sector[mirrorsector[i]].wallptr;
        endwall = startwall + sector[mirrorsector[i]].wallnum;
        for (j = startwall; j < endwall; j++) {
            wall[j].picnum = MIRROR;
            wall[j].overpicnum = MIRROR;
        }
    }
};

//640
preMap.setupBackdrop = function (sky) {
    var i;

    for (i = 0; i < MAXPSKYTILES; i++) {
        pskyoff[i] = 0;
    }

    if (parallaxyscale != 65536) {
        parallaxyscale = 32768;
    }

    switch (sky) {
        case 78: //CLOUDYOCEAN:
            parallaxyscale = 65536;
            break;
        case 80: //MOONSKY1 :
            pskyoff[6] = 1; pskyoff[1] = 2; pskyoff[4] = 2; pskyoff[2] = 3;
            break;
        case 84: //BIGORBIT1: // orbit
            pskyoff[5] = 1; pskyoff[6] = 2; pskyoff[7] = 3; pskyoff[2] = 4;
            break;
        case 89: //LA:
            parallaxyscale = 16384 + 1024;
            pskyoff[0] = 1; pskyoff[1] = 2; pskyoff[2] = 1; pskyoff[3] = 3;
            pskyoff[4] = 4; pskyoff[5] = 0; pskyoff[6] = 2; pskyoff[7] = 3;
            break;
    }

    pskybits = 3;
};

//990
preMap.newGame = function (vn, ln, sk) {
    var p = ps[0];
    var i;

    if (globalskillsound >= 0) {
        throw new Error("todo???");
    }

    globalskillsound = -1;

    preMap.waitForEverybody();
    ready2send = 0;

    if (ud.m_recstat != 2 && ud.last_level >= 0 && ud.multimode > 1 && ud.coop != 1) {
        dobonus(1);
    }

    if (ud.showcinematics && ln == 0 && vn == 3 && ud.multimode < 2 && ud.lockout == 0) {
        throw new Error("todo");
    }

    show_shareware = 26 * 34;

    ud.level_number = ln;
    ud.volume_number = vn;
    ud.player_skill = sk;
    ud.secretlevel = 0;
    ud.from_bonus = 0;
    parallaxyscale = 0;

    ud.last_level = -1;
    lastsavedpos = -1;
    p.zoom = 768;
    p.gm = 0;

    if (ud.m_coop !== 1) {
        p.curr_weapon = PISTOL_WEAPON;
        p.gotweapon[PISTOL_WEAPON] = 1;
        p.gotweapon[KNEE_WEAPON] = 1;
        p.ammo_amount[PISTOL_WEAPON] = 48;
        p.gotweapon[HANDREMOTE_WEAPON] = 1;
        p.last_weapon = -1;
    }

    display_mirror = 0;

    if (ud.multimode > 1) {
        if (numplayers < 2) {
            connecthead = 0;
            for (i = 0; i < MAXPLAYERS; i++) connectpoint2[i] = i + 1;
            connectpoint2[ud.multimode - 1] = -1;
        }
    } else {
        connecthead = 0;
        connectpoint2[0] = -1;
    }
};

//1071
preMap.resetpSpriteVars = function (g) {
    var i, j, nexti, circ;
    var firstx, firsty;
    var s;
    var aimmode = new Uint8Array(MAXPLAYERS);
    var tsbar = structArray(StatusBar, MAXPLAYERS);

    var BOT_MAX_NAME = 20;
    var bot_used = new Array(BOT_MAX_NAME);
    for (var k = 0; k < bot_used.length; k++) {
        bot_used[k] = false;
    }

    var bot_names = ["* ELASTI",
        "* ^ZookeM^",
        "* DOOM",
        "* DRO",
        "* NOX",
        "* EXP",
        "* SKIPPY",
        "* BRYZIAN",
        "* ALI-GUN",
        "* ADDFAZ",
        "* TURRICAN",
        "* PODA",
        "* EWOLF",
        "* SOULIANE",
        "* SPANATOR",
        "* OVERLORD",
        "* COWBOYUK",
        "* JAKS",
        "* BLUEDRAG",
        "* MOE{GER}"];


    EGS(ps[0].cursectnum, ps[0].posx, ps[0].posy, ps[0].posz,
        APLAYER, 0, 0, 0, ps[0].ang, 0, 0, 0, 10);
    if (ud.recstat != 2) {
        throw "todo"; //for (i = 0; i < MAXPLAYERS; i++) {
        //    aimmode[i] = ps[i].aim_mode;
        //    if(ud.multimode > 1 && ud.coop == 1 && ud.last_level >= 0)
        //    {
        //        for(j=0;j<MAX_WEAPONS;j++)
        //        {
        //            tsbar[i].ammo_amount[j] = ps[i].ammo_amount[j];
        //            tsbar[i].gotweapon[j] = ps[i].gotweapon[j];
        //        }

        //        tsbar[i].shield_amount = ps[i].shield_amount;
        //        tsbar[i].curr_weapon = ps[i].curr_weapon;
        //        tsbar[i].inven_icon = ps[i].inven_icon;

        //        tsbar[i].firstaid_amount = ps[i].firstaid_amount;
        //        tsbar[i].steroids_amount = ps[i].steroids_amount;
        //        tsbar[i].holoduke_amount = ps[i].holoduke_amount;
        //        tsbar[i].jetpack_amount = ps[i].jetpack_amount;
        //        tsbar[i].heat_amount = ps[i].heat_amount;
        //        tsbar[i].scuba_amount = ps[i].scuba_amount;
        //        tsbar[i].boot_amount = ps[i].boot_amount;
        //    }
    }

    preMap.resetPlayerStats(0); // reset a player 

    for (i = 1; i < MAXPLAYERS; i++) // reset all the others
        ps[i] = new PlayerType();

    //// FIX_00080: Out Of Synch in demos. Tries recovering OOS in old demos v27/28/29/116/117/118. New: v30/v119.
    if (numplayers < 2 && !(g & MODE_DEMO))
        throw new Error("todo");  // todo    memcpy(ud.wchoice[0],ud.mywchoice,sizeof(ud.mywchoice)); 


    if (g & MODE_DEMO && (ud.playing_demo_rev == BYTEVERSION_27 ||
    					ud.playing_demo_rev == BYTEVERSION_28 ||
    					ud.playing_demo_rev == BYTEVERSION_29 ||
    					ud.playing_demo_rev == BYTEVERSION_116 ||
    					ud.playing_demo_rev == BYTEVERSION_117 ||
    					ud.playing_demo_rev == BYTEVERSION_118))
        for (i = 0; i < ud.multimode; i++)
            ud.wchoice[i] = new Int32Array(ud.mywchoice); // assuming.... :-(

    // FIX_00076: Added default names for bots + fixed a "killed <name>" bug in Fakeplayers with AI
    if (!(g & MODE_DEMO) && numplayers < 2 && ud.multimode > 1) {
        throw new Error("todo");

        //    for(i=connecthead;i>=0;i=connectpoint2[i])
        //        if (i!=myconnectindex)
        //        {
        //            memcpy(ud.wchoice[0],ud.mywchoice,sizeof(ud.mywchoice));

        //            //	add bot's names
        //            do 
        //            { 
        //                j = rand()%BOT_MAX_NAME; 
        //            } 
        //            while(bot_used[j]);

        //            strcpy(ud.user_name[i], bot_names[j]);
        //            bot_used[j] = true;
        //            ps[i].fakeplayer = 1 + ud.playerai;  // = true if fakerplayer. (==2 if AI)
        //}
    }

    if (ud.recstat != 2) for (i = 0; i < MAXPLAYERS; i++) {
        throw new Error("todo");
        //    ps[i].aim_mode = aimmode[i];
        //    if(ud.multimode > 1 && ud.coop == 1 && ud.last_level >= 0)
        //    {
        //        for(j=0;j<MAX_WEAPONS;j++)
        //        {
        //            ps[i].ammo_amount[j] = tsbar[i].ammo_amount[j];
        //            ps[i].gotweapon[j] = tsbar[i].gotweapon[j];
        //        }
        //        ps[i].shield_amount = tsbar[i].shield_amount;
        //        ps[i].curr_weapon = tsbar[i].curr_weapon;
        //        ps[i].inven_icon = tsbar[i].inven_icon;

        //        ps[i].firstaid_amount = tsbar[i].firstaid_amount;
        //        ps[i].steroids_amount= tsbar[i].steroids_amount;
        //        ps[i].holoduke_amount = tsbar[i].holoduke_amount;
        //        ps[i].jetpack_amount = tsbar[i].jetpack_amount;
        //        ps[i].heat_amount = tsbar[i].heat_amount;
        //        ps[i].scuba_amount= tsbar[i].scuba_amount;
        //        ps[i].boot_amount = tsbar[i].boot_amount;
        //    }
    }

    numplayersprites = 0;
    circ = (2048 / ud.multimode) | 0;

    which_palookup = 9;
    j = connecthead;
    i = headspritestat[10];

    while (i >= 0) {
        nexti = nextspritestat[i];
        s = sprite[i];

        if (numplayersprites == MAXPLAYERS)
            throw new Error("Too many player sprites (max 16.)");

        if (numplayersprites == 0) {
            firstx = ps[0].posx;
            firsty = ps[0].posy;
        }

        po[numplayersprites].ox = s.x;
        po[numplayersprites].oy = s.y;
        po[numplayersprites].oz = s.z;
        po[numplayersprites].oa = s.ang;
        po[numplayersprites].os = s.sectnum;

        numplayersprites++;
        if (j >= 0) {
            s.owner = i;
            s.shade = 0;
            s.xrepeat = 42;
            s.yrepeat = 36;
            s.cstat = 1 + 256;
            s.xoffset = 0;
            s.clipdist = 64;

            if ((g & MODE_EOL) != MODE_EOL || ps[j].last_extra == 0) {
                ps[j].last_extra = max_player_health;
                s.extra = max_player_health;
            }
            else s.extra = ps[j].last_extra;

            s.yvel = j;

            if (s.pal == 0) {
                s.pal = ps[j].palookup = which_palookup;
                which_palookup++;
                if (which_palookup >= 17) which_palookup = 9;
            }
            else ps[j].palookup = s.pal;

            ps[j].i = i;
            ps[j].frag_ps = j;
            hittype[i].owner = i;

            hittype[i].bposx = ps[j].bobposx = ps[j].oposx = ps[j].posx = s.x;
            hittype[i].bposy = ps[j].bobposy = ps[j].oposy = ps[j].posy = s.y;
            hittype[i].bposz = ps[j].oposz = ps[j].posz = s.z;
            ps[j].oang = ps[j].ang = s.ang;

            var cursectnumRef = new Ref(ps[j].cursectnum);
            updatesector(s.x, s.y, cursectnumRef);
            ps[j].cursectnum = cursectnumRef.$;

            j = connectpoint2[j];

        }
        else deletesprite(i);
        i = nexti;
    }
};

//1286
function genSpriteRemaps() {
    var fp = TCkopen4load("lookup.dat", false);
    var lookpos;
    var numl;
    if (fp != -1) {
        numl = kreadUint8(fp, 1);
    } else {
        throw new Error("ERROR: File 'LOOKUP.DAT' not found.");
    }

    for (var j = 0; j < numl; j++) {
        lookpos = kread8(fp);
        kread(fp, tempbuf, 256);
        makepalookup(lookpos, tempbuf, 0, 0, 0, 1);
    }

    kread(fp, waterpal, 768);
    kread(fp, slimepal, 768);
    kread(fp, titlepal, 768);
    kread(fp, drealms, 768);
    kread(fp, endingpal, 768);

    palette[765] = palette[766] = palette[767] = 0;
    slimepal[765] = slimepal[766] = slimepal[767] = 0;
    waterpal[765] = waterpal[766] = waterpal[767] = 0;

    kclose(fp);
}

//1322
preMap.waitForEverybody = function () {
    if (numplayers < 2) {
        return;
    }

    throw new Error("todo (add this to the queue as a while loop)");
};

//1366
preMap.doFrontScreens = function () {
    var i, j;
    if (ud.recstat !== 2) {
        throw new Error("todo");
    } else {
        clearView(0);
        ps[myconnectindex].palette = palette;
        palto(0, 0, 0, 0);
        rotateSprite(320 << 15, 200 << 15, 65536, 0, LOADSCREEN, 0, 0, 2 + 8 + 64, 0, 0, xdim - 1, ydim - 1);
        menutext(160, 105, 0, 0, "LOADING...");
        nextpage();
    }
};

//1410
preMap.clearFifo = function () {
    syncvaltail = 0;
    syncvaltottail = 0;
    syncstat = 0;
    bufferjitter = 1;
    mymaxlag = otherminlag = 0;

    movefifoplc = movefifosendplc = fakemovefifoplc = 0;
    avgfvel = avgsvel = avgavel = avghorz = avgbits = 0;
    otherminlag = mymaxlag = 0;

    clearbuf(myminlag, 0, myminlag.length);
    loc = new Input();
    sync = structArray(Sync, MAXPLAYERS);
    inputfifo = new Array(MOVEFIFOSIZ);
    for (var i = 0; i < inputfifo.length; i++) {
        inputfifo[i] = structArray(Input, MAXPLAYERS);
    }

    clearbuf(movefifoend, 0, movefifoend.length);
    clearbuf(syncvalhead, 0, syncvalhead.length);
    clearbuf(myminlag, 0, myminlag.length);
};

//1434
preMap.resetMys = function () {
    myx = omyx = ps[myconnectindex].posx;
    myy = omyy = ps[myconnectindex].posy;
    myz = omyz = ps[myconnectindex].posz;
    myxvel = myyvel = myzvel = 0;
    myang = omyang = ps[myconnectindex].ang;
    myhoriz = omyhoriz = ps[myconnectindex].horiz;
    myhorizoff = omyhorizoff = ps[myconnectindex].horizoff;
    mycursectnum = ps[myconnectindex].cursectnum;
    myjumpingcounter = ps[myconnectindex].jumping_counter;
    myjumpingtoggle = ps[myconnectindex].jumping_toggle;
    myonground = ps[myconnectindex].on_ground;
    myhardlanding = ps[myconnectindex].hard_landing;
    myreturntocenter = ps[myconnectindex].return_to_center;
};

//1451
preMap.enterLevel = function (g) {
    var i;
    var l;
    var levname;
    var fulllevelfilename;
    var text;

    KB.clearKeyDown(sc_Pause);

    if ((g & MODE_DEMO) != MODE_DEMO) {
        ud.recstat = ud.m_recstat;
    }

    ud.respawn_monsters = ud.m_respawn_monsters;
    ud.respawn_items = ud.m_respawn_items;
    ud.respawn_inventory = ud.m_respawn_inventory;
    ud.monsters_off = ud.m_monsters_off;
    ud.coop = ud.m_coop;
    ud.marker = ud.m_marker;
    ud.ffire = ud.m_ffire;

    if ((g & MODE_DEMO) == 0 && ud.recstat == 2)
        ud.recstat = 0;

    FX.stopAllSounds();
    clearsoundlocks();
    FX.setReverb(0);

    i = ud.screen_size;
    ud.screen_size = 0;
    preMap.doFrontScreens();
    preMap.vscrn();
    ud.screen_size = i;

    if (!VOLUMEONE()) {
        if (boardfilename && ud.m_level_number == 7 && ud.m_volume_number == 0) {
            throw new Error("todo");
        } else {
            //fulllevelfilename = getGameDir() + "\\" + level_file_names[(ud.volume_number * 11) + ud.level_number];
            // todo SafeFileExists??? - it checks in game dir first??

            fulllevelfilename = level_file_names[(ud.volume_number * 11) + ud.level_number];

            var posxRef = new Ref(ps[0].posx);
            var posyRef = new Ref(ps[0].posy);
            var poszRef = new Ref(ps[0].posz);
            var angRef = new Ref(ps[0].ang);
            var cursectnumRef = new Ref(ps[0].cursectnum);
            var loadBoardResult = Engine.loadBoard(fulllevelfilename, posxRef, posyRef, poszRef, angRef, cursectnumRef);
            ps[0].posx = posxRef.$;
            ps[0].posy = posyRef.$;
            ps[0].posz = poszRef.$;
            ps[0].ang = angRef.$;
            ps[0].cursectnum = cursectnumRef.$;

            if (loadBoardResult === -1) {
                throw new Error("Internal Map " + level_file_names[(ud.volume_number * 11) + ud.level_number] + " not found! Not using the right grp file?");
            }
        }
    } else {
        throw new Error("todo: test with shareware grp?");
    }

    preMap.preLevel(g);

    Sector.allignWarpElevators();
    preMap.resetpSpriteVars(g);


    if (ud.recstat != 2)
        Music.stopSong();

    cacheit();
    docacheit();

    if (ud.recstat != 2) {
        throw new Error("todo");
        //music_select = (ud.volume_number*11) + ud.level_number;
        //playmusic(&music_fn[0][music_select][0]);
    }

    if ((g & MODE_GAME) || (g & MODE_EOL))
        ps[myconnectindex].gm = MODE_GAME;
    else if (g & MODE_RESTART) {
        if (ud.recstat == 2)
            ps[myconnectindex].gm = MODE_DEMO;
        else ps[myconnectindex].gm = MODE_GAME;
    }

    if ((ud.recstat == 1) && (g & MODE_RESTART) != MODE_RESTART) {
        throw new Error("todo");
        opendemowrite();
    }

    //    //if (VOLUMEONE) // commented out in original
    //    //    if(ud.level_number == 0 && ud.recstat != 2) FTA(40,&ps[myconnectindex]);

    fta_quotes[103] = "Chocolate JS Duke3D v" + ud.rev[myconnectindex][2] + "." + ud.rev[myconnectindex][3];
    FTA(103, ps[myconnectindex], 1);

    if (ud.auto_aim == 1 && ud.recstat != 2) {
        fta_quotes[103] = "Autoaim set to Bullet only";
        FTA(103, ps[myconnectindex], 1);
    }

    if (nHostForceDisableAutoaim && ud.recstat != 2) {
        fta_quotes[103] = "Autoaim disabled by host";
        FTA(103, ps[myconnectindex], 1);
    }


    for (i = connecthead; i >= 0; i = connectpoint2[i])
        switch (sector[sprite[ps[i].i].sectnum].floorpicnum) {
            case HURTRAIL:
            case FLOORSLIME:
            case FLOORPLASMA:
                preMap.resetWeapons(i);
                preMap.resetIinventory(i);
                ps[i].gotweapon[PISTOL_WEAPON] = 0;
                ps[i].ammo_amount[PISTOL_WEAPON] = 0;
                ps[i].curr_weapon = KNEE_WEAPON;
                ps[i].kickback_pic = 0;
                break;
        }

    //PREMAP.C - replace near the my's at the end of the file

    preMap.resetMys();

    ps[myconnectindex].palette = palette;
    palto(0, 0, 0, 0);

    Player.setPal(ps[myconnectindex]);
    flushperms();

    everyothertime = 0;
    global_random = 0;

    ud.last_level = ud.level_number + 1;

    preMap.clearFifo();

    for (i = numinterpolations - 1; i >= 0; i--) {
        bakipos[i] = curipos[i];
    }

    restorepalette = 1;

    Network.flushPackets();
    preMap.waitForEverybody();

    debugger;


    palto(0, 0, 0, 0);
    preMap.vscrn();
    clearView(0);
    Game.drawBackground();

    //    clearbufbyte(playerquitflag,MAXPLAYERS,0x01010101);
    //    ps[myconnectindex].over_shoulder_on = 0;

    //    clearfrags();

    //    resettimevars();  // Here we go

    //    if(numplayers > 1) 
    //    {
    //        buf[0] = 132;	// xDuke TAG ID
    //        buf[1] = mapCRC & 0xFF;
    //        buf[2] = (mapCRC>>8) & 0xFF;

    //        for(i=connecthead;i>=0;i=connectpoint2[i])
    //            if( i != myconnectindex )
    //                sendpacket(i,(uint8_t*)buf,3);
    //    }

    //    ud.mapCRC[myconnectindex] = mapCRC;



    debugger;
};
