'use strict';

var Sector = {};

//156
function isanunderoperator(lotag) {
    switch (lotag & 0xff) {
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
    case 22:
    case 26:
        return 1;
    }
    return 0;
}

//172
function isanearoperator(lotag) {
    switch (lotag & 0xff) {
    case 9:
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
    case 25:
    case 26:
    case 29:
        //Toothed door
        return 1;
    }
    return 0;
}

//222
function findplayer(s,d) {
    console.assert(d instanceof Ref);

    var j, closest_player;
    var x, closest;

    if(ud.multimode < 2)
    {
        d.$ = klabs(ps[myconnectindex].oposx-s.x) + klabs(ps[myconnectindex].oposy-s.y) + ((klabs(ps[myconnectindex].oposz-s.z+(28<<8)))>>4);
        return myconnectindex;
    }

    closest = 0x7fffffff;
    closest_player = 0;

    for(j=connecthead;j>=0;j=connectpoint2[j])
    {
        x = klabs(ps[j].oposx-s.x) + klabs(ps[j].oposy-s.y) + ((klabs(ps[j].oposz-s.z+(28<<8)))>>4);
        if( x < closest && sprite[ps[j].i].extra > 0 )
        {
            closest_player = j;
            closest = x;
        }
    }

    d.$ = closest;
    return closest_player;
}

//385
Sector.animateCamSprite = function () {
    var i;

    if(camsprite <= 0) return;

    i = camsprite;

    if(hittype[i].temp_data[0] >= 11)
    {
        throw "todo"
        //hittype[i].temp_data[0] = 0;

        //if(ps[screenpeek].newowner >= 0)
        //    sprite[i].owner = ps[screenpeek].newowner;

        //else if(sprite[i].owner >= 0 && dist(&sprite[ps[screenpeek].i],&sprite[i]) < 2048)
        //    xyzmirror(sprite[i].owner,sprite[i].picnum);
    }
    else 
        hittype[i].temp_data[0]++;
};

//1808
function checkplayerhurt(p, j)
{
    if( (j&49152) == 49152 )
    {
        j &= (MAXSPRITES-1);

        switch(sprite[j].picnum)
        {
            case CACTUS:
                if(p.hurt_delay < 8 )
                {
                    sprite[p.i].extra -= 5;

                    p.hurt_delay = 16;
                    p.pals_time = 32;
                    p.pals[0] = 32;
                    p.pals[1] = 0;
                    p.pals[2] = 0;
                    spritesound(DUKE_LONGTERM_PAIN,p.i);
                }
                break;
        }
        return;
    }

    if( (j&49152) != 32768) return;
    j &= (MAXWALLS-1);

    if( p.hurt_delay > 0 ) p.hurt_delay--;
    else if( wall[j].cstat&85 ) switch(wall[j].overpicnum)
    {
        case W_FORCEFIELD:
        case W_FORCEFIELD+1:
        case W_FORCEFIELD+2:
            sprite[p.i].extra -= 5;

            p.hurt_delay = 16;
            p.pals_time = 32;
            p.pals[0] = 32;
            p.pals[1] = 0;
            p.pals[2] = 0;

            p.posxv = -(sintable[(p.ang+512)&2047]<<8);
            p.posyv = -(sintable[(p.ang)&2047]<<8);
            spritesound(DUKE_LONGTERM_PAIN,p.i);

            checkhitwall(p.i,j,
                p.posx+(sintable[(p.ang+512)&2047]>>9),
                p.posy+(sintable[p.ang&2047]>>9),
                p.posz,-1);

            break;

        case BIGFORCE:
            p.hurt_delay = 26;
            checkhitwall(p.i,j,
                p.posx+(sintable[(p.ang+512)&2047]>>9),
                p.posy+(sintable[p.ang&2047]>>9),
                p.posz,-1);
            break;

    }
}


//2383
Sector.allignWarpElevators = function () {
    var i, j;

    i = headspritestat[3];
    while (i >= 0) {
        if (sprite[i].lotag == 17 && sprite[i].shade > 16) {
            j = headspritestat[3];
            while (j >= 0) {
                if ((sprite[j].lotag) == 17 && i != j &&
                    (sprite[i].hitag) == (sprite[j].hitag)) {
                    sector[sprite[j].sectnum].floorz =
                        sector[sprite[i].sectnum].floorz;
                    sector[sprite[j].sectnum].ceilingz =
                        sector[sprite[i].sectnum].ceilingz;
                }

                j = nextspritestat[j];
            }
        }
        i = nextspritestat[i];
    }
};

//2911
function checksectors(snum) {
    var i = -1, oldz;
    var p;
    var j, hitscanwall;

    p = ps[snum];

    switch(sector[p.cursectnum].lotag)
    {
        case 32767:
            sector[p.cursectnum].lotag = 0;
            FTA(9,p,0); // secret place found
            p.secret_rooms++;
            return;
        case -1:
            for(i=connecthead;i>=0;i=connectpoint2[i])
                ps[i].gm = MODE_EOL;
            sector[p.cursectnum].lotag = 0;
            if(ud.from_bonus)
            {
                ud.level_number = ud.from_bonus;
                ud.m_level_number = ud.level_number;
                ud.from_bonus = 0;
            }
            else
            {
                ud.level_number++;
                if( (ud.volume_number && ud.level_number > 10 ) || ud.level_number > 5 )
                    ud.level_number = 0;
                ud.m_level_number = ud.level_number;
            }
            return;
        case -2:
            sector[p.cursectnum].lotag = 0;
            p.timebeforeexit = 26*8;
            p.customexitsound = sector[p.cursectnum].hitag;
            return;
        default:
            if(sector[p.cursectnum].lotag >= 10000 && sector[p.cursectnum].lotag < 16383)
            {
                if(snum == screenpeek || ud.coop == 1 )
                    spritesound(sector[p.cursectnum].lotag-10000,p.i);
                sector[p.cursectnum].lotag = 0;
            }
            break;
    }

    //After this point the the player effects the map with space

    if(p.gm&MODE_TYPE || sprite[p.i].extra <= 0) return;

    if( ud.cashman && sync[snum].bits&(1<<29) )
        lotsofmoney(sprite[p.i],2);

    if(p.newowner >= 0)
    {
        if( klabs(sync[snum].svel) > 768 || klabs(sync[snum].fvel) > 768 )
        {
            i = -1;
            throw "goto CLEARCAMERAS";
        }
    }

    if( !(sync[snum].bits&(1<<29)) && !(sync[snum].bits&(1<<31)))
        p.toggle_key_flag = 0;

    else if(!p.toggle_key_flag)
    {
        throw "todo";

    //    if( (sync[snum].bits&(1<<31)) )
    //    {
    //        if( p.newowner >= 0 )
    //        {
    //            i = -1;
    //            goto CLEARCAMERAS;
    //        }
    //        return;
    //    }

    //    neartagsprite = -1;
    //    p.toggle_key_flag = 1;
    //    hitscanwall = -1;

    //    i = hitawall(p,&hitscanwall);

    //    if(i < 1280 && hitscanwall >= 0 && wall[hitscanwall].overpicnum == MIRROR)
    //        if( wall[hitscanwall].lotag > 0 && Sound[wall[hitscanwall].lotag].num == 0 && snum == screenpeek)
    //        {
    //            spritesound(wall[hitscanwall].lotag,p.i);
    //            return;
    //        }

    //    if(hitscanwall >= 0 && (wall[hitscanwall].cstat&16) )
    //        switch(wall[hitscanwall].overpicnum)
    //        {
    //            default:
    //                if(wall[hitscanwall].lotag)
    //                    return;
    //        }

    //    if(p.newowner >= 0)
    //        neartag(p.oposx,p.oposy,p.oposz,sprite[p.i].sectnum,p.oang,&neartagsector,&neartagwall,&neartagsprite,&neartaghitdist,1280L,1);
    //    else
    //    {
    //        neartag(p.posx,p.posy,p.posz,sprite[p.i].sectnum,p.oang,&neartagsector,&neartagwall,&neartagsprite,&neartaghitdist,1280L,1);
    //        if(neartagsprite == -1 && neartagwall == -1 && neartagsector == -1)
    //            neartag(p.posx,p.posy,p.posz+(8<<8),sprite[p.i].sectnum,p.oang,&neartagsector,&neartagwall,&neartagsprite,&neartaghitdist,1280L,1);
    //        if(neartagsprite == -1 && neartagwall == -1 && neartagsector == -1)
    //            neartag(p.posx,p.posy,p.posz+(16<<8),sprite[p.i].sectnum,p.oang,&neartagsector,&neartagwall,&neartagsprite,&neartaghitdist,1280L,1);
    //        if(neartagsprite == -1 && neartagwall == -1 && neartagsector == -1)
    //        {
    //            neartag(p.posx,p.posy,p.posz+(16<<8),sprite[p.i].sectnum,p.oang,&neartagsector,&neartagwall,&neartagsprite,&neartaghitdist,1280L,3);
    //            if(neartagsprite >= 0)
    //            {
    //                switch(sprite[neartagsprite].picnum)
    //                {
    //                    case FEM1:
    //                    case FEM2:
    //                    case FEM3:
    //                    case FEM4:
    //                    case FEM5:
    //                    case FEM6:
    //                    case FEM7:
    //                    case FEM8:
    //                    case FEM9:
    //                    case FEM10:
    //                    case PODFEM1:
    //                    case NAKED1:
    //                    case STATUE:
    //                    case TOUGHGAL:
    //                        return;
    //                }
    //            }

    //            neartagsprite = -1;
    //            neartagwall = -1;
    //            neartagsector = -1;
    //        }
    //    }

    //    if(p.newowner == -1 && neartagsprite == -1 && neartagsector == -1 && neartagwall == -1 )
    //        if( isanunderoperator(sector[sprite[p.i].sectnum].lotag) )
    //            neartagsector = sprite[p.i].sectnum;

    //    if( neartagsector >= 0 && (sector[neartagsector].lotag&16384) )
    //        return;

    //    if( neartagsprite == -1 && neartagwall == -1)
    //        if(sector[p.cursectnum].lotag == 2 )
    //        {
    //            oldz = hitasprite(p.i,&neartagsprite);
    //            if(oldz > 1280) neartagsprite = -1;
    //        }

    //    if(neartagsprite >= 0)
    //    {
    //        if( checkhitswitch(snum,neartagsprite,1) ) return;

    //        switch(sprite[neartagsprite].picnum)
    //        {
    //            case TOILET:
    //            case STALL:
    //                if(p.last_pissed_time == 0)
    //                {
    //                    if(ud.lockout == 0) spritesound(DUKE_URINATE,p.i);

    //                    p.last_pissed_time = 26*220;
    //                    p.transporter_hold = 29*2;
    //                    if(p.holster_weapon == 0)
    //                    {
    //                        p.holster_weapon = 1;
    //                        p.weapon_pos = -1;
    //                    }
    //                    if(sprite[p.i].extra <= (max_player_health-(max_player_health/10) ) )
    //                    {
    //                        sprite[p.i].extra += max_player_health/10;
    //                        p.last_extra = sprite[p.i].extra;
    //                    }
    //                    else if(sprite[p.i].extra < max_player_health )
    //                        sprite[p.i].extra = max_player_health;
    //                }
    //                else if(Sound[FLUSH_TOILET].num == 0)
    //                    spritesound(FLUSH_TOILET,p.i);
    //                return;

    //            case NUKEBUTTON:

    //                hitawall(p,&j);
    //                if(j >= 0 && wall[j].overpicnum == 0)
    //                    if(hittype[neartagsprite].temp_data[0] == 0)
    //                    {
    //                        hittype[neartagsprite].temp_data[0] = 1;
    //                        sprite[neartagsprite].owner = p.i;
    //                        p.buttonpalette = sprite[neartagsprite].pal;
    //                        if(p.buttonpalette)
    //                            ud.secretlevel = sprite[neartagsprite].lotag;
    //                        else ud.secretlevel = 0;
    //                    }
    //                return;
    //            case WATERFOUNTAIN:
    //                if(hittype[neartagsprite].temp_data[0] != 1)
    //                {
    //                    hittype[neartagsprite].temp_data[0] = 1;
    //                    sprite[neartagsprite].owner = p.i;

    //                    if(sprite[p.i].extra < max_player_health)
    //                    {
    //                        sprite[p.i].extra++;
    //                        spritesound(DUKE_DRINKING,p.i);
    //                    }
    //                }
    //                return;
    //            case PLUG:
    //                spritesound(SHORT_CIRCUIT,p.i);
    //                sprite[p.i].extra -= 2+(krand()&3);
    //                p.pals[0] = 48;
    //                p.pals[1] = 48;
    //                p.pals[2] = 64;
    //                p.pals_time = 32;
    //                break;
    //            case VIEWSCREEN:
    //            case VIEWSCREEN2:
    //                {
    //                    i = headspritestat[1];

    //                    while(i >= 0)
    //                    {
    //                        if( sprite[i].picnum == CAMERA1 && sprite[i].yvel == 0 && sprite[neartagsprite].hitag == sprite[i].lotag )
    //                        {
    //                            sprite[i].yvel = 1; //Using this camera
    //                            spritesound(MONITOR_ACTIVE,neartagsprite);

    //                            sprite[neartagsprite].owner = i;
    //                            sprite[neartagsprite].yvel = 1;


    //                            j = p.cursectnum;
    //                            p.cursectnum = sprite[i].sectnum;
    //                            setpal(p);
    //                            p.cursectnum = j;

    //                            // parallaxtype = 2;
    //                            p.newowner = i;
    //                            return;
    //                        }
    //                        i = nextspritestat[i];
    //                    }
    //                }

    //                CLEARCAMERAS:

    //                    if(i < 0)
    //                    {
    //                        p.posx = p.oposx;
    //                        p.posy = p.oposy;
    //                        p.posz = p.oposz;
    //                        p.ang = p.oang;
    //                        p.newowner = -1;

    //                        updatesector(p.posx,p.posy,&p.cursectnum);
    //                        setpal(p);


    //                        i = headspritestat[1];
    //                        while(i >= 0)
    //                        {
    //                            if(sprite[i].picnum==CAMERA1) sprite[i].yvel = 0;
    //                            i = nextspritestat[i];
    //                        }
    //                    }
    //                    else if(p.newowner >= 0)
    //                        p.newowner = -1;

    //                if( KB_KeyPressed(sc_Escape) )
    //                    KB_ClearKeyDown(sc_Escape);

    //                return;
    //        }
    //    }

    //    if( (sync[snum].bits&(1<<29)) == 0 ) return;
    //    else if(p.newowner >= 0) { i = -1; goto CLEARCAMERAS; }

    //    if(neartagwall == -1 && neartagsector == -1 && neartagsprite == -1)
    //        if( klabs(hits(p.i)) < 512 )
    //        {
    //            if( (krand()&255) < 16 )
    //                spritesound(DUKE_SEARCH2,p.i);
    //            else spritesound(DUKE_SEARCH,p.i);
    //            return;
    //        }

    //    if( neartagwall >= 0 )
    //    {
    //        if( wall[neartagwall].lotag > 0 && isadoorwall(wall[neartagwall].picnum) )
    //        {
    //            if(hitscanwall == neartagwall || hitscanwall == -1)
    //                checkhitswitch(snum,neartagwall,0);
    //            return;
    //        }
    //        else if(p.newowner >= 0)
    //        {
    //            i = -1;
    //            goto CLEARCAMERAS;
    //        }
    //    }

    //    if( neartagsector >= 0 && (sector[neartagsector].lotag&16384) == 0 && isanearoperator(sector[neartagsector].lotag) )
    //    {
    //        i = headspritesect[neartagsector];
    //        while(i >= 0)
    //        {
    //            if( sprite[i].picnum == ACTIVATOR || sprite[i].picnum == MASTERSWITCH )
    //                return;
    //            i = nextspritesect[i];
    //        }
    //        operatesectors(neartagsector,p.i);
    //    }
    //    else if( (sector[sprite[p.i].sectnum].lotag&16384) == 0 )
    //    {
    //        if( isanunderoperator(sector[sprite[p.i].sectnum].lotag) )
    //        {
    //            i = headspritesect[sprite[p.i].sectnum];
    //            while(i >= 0)
    //            {
    //                if(sprite[i].picnum == ACTIVATOR || sprite[i].picnum == MASTERSWITCH) return;
    //                i = nextspritesect[i];
    //            }
    //            operatesectors(sprite[p.i].sectnum,p.i);
    //        }
    //        else checkhitswitch(snum,neartagwall,0);
    //    }
    }
}