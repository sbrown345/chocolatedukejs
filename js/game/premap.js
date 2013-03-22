'use strict';

var preMap = {};

//357
preMap.vscrn = function() {
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
preMap.countFragBars = function() {
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
        numl = kread8(fp, 1);
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

    debugger;
};
