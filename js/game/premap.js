﻿'use strict';

var preMap = {};

function tloadtile(tileNumber) {
    gotpic[tileNumber >> 3] |= (1 << (tileNumber & 7));
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

//670
preMap.resetPreStat = function (snum, g) {
    var p;
    var i;

    p = ps[snum];

    spriteqloc = 0;
    for (i = 0; i < spriteqamount; i++) {
        spriteq[i] = -1;
    }

    p.hbomb_on          = 0;
    p.cheat_phase       = 0;
    p.pals_time         = 0;
    p.toggle_key_flag   = 0;
    p.secret_rooms      = 0;
    p.max_secret_rooms  = 0;
    p.actors_killed     = 0;
    p.max_actors_killed = 0;
    p.lastrandomspot = 0;
    p.weapon_pos = 6;
    p.kickback_pic = 5;
    p.last_weapon = -1;
    p.weapreccnt = 0;
    p.show_empty_weapon= 0;
    p.holster_weapon = 0;
    p.last_pissed_time = 0;

    p.one_parallax_sectnum = -1;
    p.visibility = ud.const_visibility;

    screenpeek              = myconnectindex;
    numanimwalls            = 0;
    numcyclers              = 0;
    animatecnt              = 0;
    parallaxtype            = 0;
    randomseed              = 17;
    ud.pause_on             = 0;
    ud.camerasprite         =-1;
    ud.eog                  = 0;
    tempwallptr             = 0;
    camsprite               =-1;
    earthquaketime          = 0;

    numinterpolations = 0;
    startofdynamicinterpolations = 0;

    if( ( (g&MODE_EOL) != MODE_EOL && numplayers < 2) || (ud.coop != 1 && numplayers > 1) )
    {
        preMap.resetWeapons(snum);
        preMap.resetIinventory(snum);
    }
    else if(p.curr_weapon == HANDREMOTE_WEAPON)
    {
        p.ammo_amount[HANDBOMB_WEAPON]++;
        p.curr_weapon = HANDBOMB_WEAPON;
    }

    p.timebeforeexit   = 0;
    p.customexitsound  = 0;
};

preMap.resetWeapons = function(snum) {
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

preMap.resetIinventory = function(snum) {
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

//670
preMap.preLevel = function (g) {
    var i, nexti, j, startwall, endwall, lotaglist;
    var lotags = new Int16Array(65);

    show2dsector = new Uint8Array((MAXSECTORS + 7) >> 3);
    show2dwallnew = new Uint8Array((MAXWALLS + 7) >> 3);
    show2dspritenew = new Uint8Array((MAXSPRITES + 7) >> 3);

    preMap.resetPreStat(0, g);
    numclouds = 0;

    for (i = 0; i < numsectors; i++) {
        console.log("i: %i", i);
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
    debugger;
};

//640
preMap.setupBackdrop = function(sky) {
    var i;

    for (i = 0; i < MAXPSKYTILES; i++) {
        pskyoff[i] = 0;
    }

    if (parallaxyscale != 65536) {
        parallaxyscale = 32768;
    }

    switch(sky)
    {
        case 78: //CLOUDYOCEAN:
            parallaxyscale = 65536;
            break;
        case 80: //MOONSKY1 :
            pskyoff[6]=1; pskyoff[1]=2; pskyoff[4]=2; pskyoff[2]=3;
            break;
        case 84: //BIGORBIT1: // orbit
            pskyoff[5]=1; pskyoff[6]=2; pskyoff[7]=3; pskyoff[2]=4;
            break;
        case 89: //LA:
            parallaxyscale = 16384+1024;
            pskyoff[0]=1; pskyoff[1]=2; pskyoff[2]=1; pskyoff[3]=3;
            pskyoff[4]=4; pskyoff[5]=0; pskyoff[6]=2; pskyoff[7]=3;
            break;
    }

    pskybits=3;
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

            if (Engine.loadBoard(fulllevelfilename, ps[0].posx, ps[0].posy, ps[0].posz, ps[0].ang, ps[0].cursectnum) == -1) {
                throw new Error("Internal Map " + level_file_names[(ud.volume_number * 11) + ud.level_number] + " not found! Not using the right grp file?");
            }
        }
    } else {
        throw new Error("todo: test with shareware grp?");
    }

    preMap.preLevel(g);

    debugger;
};
