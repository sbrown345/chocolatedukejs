'use strict';

var Player = {};

//34
Player.setPal = function(p) {
    if (p.heat_on)
        p.palette = slimepal;
    else
        switch (sector[p.cursectnum].ceilingpicnum) {
        case FLOORSLIME:
        case FLOORSLIME + 1:
        case FLOORSLIME + 2:
            p.palette = slimepal;
            break;
        default:
            if (sector[p.cursectnum].lotag == 2) p.palette = waterpal;
            else p.palette = palette;
            break;
        }
    restorepalette = 1;
};

//1136

function animatefist(gs, snum) {
    var looking_arc, fisti, fistpal;
    var fistzoom, fistz;

    fisti = ps[snum].fist_incs;
    if (fisti > 32) fisti = 32;
    if (fisti <= 0) return 0;
    throw "todo"
    looking_arc = (klabs(ps[snum].look_ang) / 9) | 0;

    fistzoom = 65536 - (sinTable[(512 + (fisti << 6)) & 2047] << 2);
    if (fistzoom > 90612)
        fistzoom = 90612;
    if (fistzoom < 40920)
        fistzoom = 40290;
    fistz = 194 + (sinTable[((6 + fisti) << 7) & 2047] >> 9);

    if (sprite[ps[snum].i].pal == 1)
        fistpal = 1;
    else
        fistpal = sector[ps[snum].cursectnum].floorpal;

    rotateSprite(
        (-fisti + 222 + (sync[snum].avel >> 4)) << 16,
        (looking_arc + fistz) << 16,
        fistzoom, 0, FIST, gs, fistpal, 2, 0, 0, xdim - 1, ydim - 1);

    return 1;
}

//1192
function animateknuckles( gs, snum)
{
    var knuckle_frames = [0,1,2,2,3,3,3,2,2,1,0];
    var looking_arc, pal;

    if(ps[snum].knuckle_incs == 0 || sprite[ps[snum].i].extra <= 0) return 0;

    looking_arc = (klabs(ps[snum].look_ang)/9)|0;

    looking_arc -= (ps[snum].hard_landing<<3);

    if(sprite[ps[snum].i].pal == 1)
        pal = 1;
    else
        pal = sector[ps[snum].cursectnum].floorpal;

    myospal(160+(sync[snum].avel>>4)-(ps[snum].look_ang>>1),looking_arc+180-((ps[snum].horiz-ps[snum].horizoff)>>4),CRACKKNUCKLES+knuckle_frames[ps[snum].knuckle_incs>>1],gs,4,pal);

    return 1;
}



//1215
var lastvisinc;

function displaymasks(snum) {
     var p;

    if(sprite[ps[snum].i].pal == 1)
        p = 1;
    else
        p = sector[ps[snum].cursectnum].floorpal;

    if(ps[snum].scuba_on)
    {
        if(ud.screen_size > 4)
        {
            rotateSprite(43 << 16, (200 - 8 - (tiles[SCUBAMASK].dim.height) << 16), 65536, 0, SCUBAMASK, 0, p, 2 + 16, windowx1, windowy1, windowx2, windowy2);
            rotateSprite((320 - 43) << 16, (200 - 8 - (tiles[SCUBAMASK].dim.height) << 16), 65536, 1024, SCUBAMASK, 0, p, 2 + 4 + 16, windowx1, windowy1, windowx2, windowy2);
        }
        else
        {
            rotateSprite(43 << 16, (200 - (tiles[SCUBAMASK].dim.height) << 16), 65536, 0, SCUBAMASK, 0, p, 2 + 16, windowx1, windowy1, windowx2, windowy2);
            rotateSprite((320 - 43) << 16, (200 - (tiles[SCUBAMASK].dim.height) << 16), 65536, 1024, SCUBAMASK, 0, p, 2 + 4 + 16, windowx1, windowy1, windowx2, windowy2);
        }
    }
}

//1294

var fistsign;

function displayweapon(snum) {
    var gun_pos, looking_arc, cw;
    var weapon_xoffset, i, j;
    var  o,pal;
    var gs;
    var p;
    var kb;

    p = ps[snum];
    kb = p.kickback_pic;

    o = 0;

    looking_arc = (klabs(p.look_ang)/9) | 0 ;

    gs = sprite[p.i].shade;
    if(gs > 24) gs = 24;

    if(p.newowner >= 0 || ud.camerasprite >= 0 || p.over_shoulder_on > 0 || (sprite[p.i].pal != 1 && sprite[p.i].extra <= 0) || animatefist(gs,snum) || animateknuckles(gs,snum) || animatetip(gs,snum) || animateaccess(gs,snum) )
        return;
    throw "todo";
    //animateknee(gs,snum);

    //gun_pos = 80-(p.weapon_pos*p.weapon_pos);

    //weapon_xoffset =  (160)-90;
    //weapon_xoffset -= (((sinTable[((p.weapon_sway>>1)+512)&2047]/(1024+512)))|0);
    //weapon_xoffset -= 58 + p.weapon_ang;
    //if( sprite[p.i].xrepeat < 32 )
    //    gun_pos -= klabs(sinTable[(p.weapon_sway<<2)&2047]>>9);
    //else gun_pos -= klabs(sinTable[(p.weapon_sway>>1)&2047]>>10);

    //gun_pos -= (p.hard_landing<<3);

    //if(p.last_weapon >= 0)
    //    cw = p.last_weapon;
    //else cw = p.curr_weapon;

    //j = 14-p.quick_kick;
    //if(j != 14)
    //{
    //    if(sprite[p.i].pal == 1)
    //        pal = 1;
    //    else
    //    {
    //        pal = sector[p.cursectnum].floorpal;
    //        if(pal == 0)
    //            pal = p.palookup;
    //    }


    //    if( j < 5 || j > 9 )
    //        myospal(weapon_xoffset+80-(p.look_ang>>1),
    //            looking_arc+250-gun_pos,KNEE,gs,o|4,pal);
    //    else myospal(weapon_xoffset+160-16-(p.look_ang>>1),
    //        looking_arc+214-gun_pos,KNEE+1,gs,o|4,pal);
    //}

    //if( sprite[p.i].xrepeat < 40 )
    //{
    //    if(p.jetpack_on == 0 )
    //    {
    //        i = sprite[p.i].xvel;
    //        looking_arc += 32-(i>>1);
    //        fistsign += i>>1;
    //    }
    //    cw = weapon_xoffset;
    //    weapon_xoffset += sinTable[(fistsign)&2047]>>10;
    //    myos(weapon_xoffset+250-(p.look_ang>>1),
    //         looking_arc+258-(klabs(sinTable[(fistsign)&2047]>>8)),
    //         FIST,gs,o);
    //    weapon_xoffset = cw;
    //    weapon_xoffset -= sinTable[(fistsign)&2047]>>10;
    //    myos(weapon_xoffset+40-(p.look_ang>>1),
    //         looking_arc+200+(klabs(sinTable[(fistsign)&2047]>>8)),
    //         FIST,gs,o|4);
    //}
    //else 
    //{	
    //    // FIX_00026: Weapon can now be hidden (on your screen only).
    //    if(!ud.hideweapon || cw==KNEE_WEAPON || cw == HANDREMOTE_WEAPON)
    //    {
    //        switch(cw)
    //        {
    //            case KNEE_WEAPON:
    //                if( (*kb) > 0 )
    //                {
    //                    if(sprite[p.i].pal == 1)
    //                        pal = 1;
    //                    else
    //                    {
    //                        pal = sector[p.cursectnum].floorpal;
    //                        if(pal == 0)
    //                            pal = p.palookup;
    //                    }

    //                    if( (*kb) < 5 || (*kb) > 9 )
    //                        myospal(weapon_xoffset+220-(p.look_ang>>1),
    //                            looking_arc+250-gun_pos,KNEE,gs,o,pal);
    //                    else
    //                        myospal(weapon_xoffset+160-(p.look_ang>>1),
    //                        looking_arc+214-gun_pos,KNEE+1,gs,o,pal);
    //                }
    //                break;

    //            case TRIPBOMB_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;

    //                weapon_xoffset += 8;
    //                gun_pos -= 10;

    //                if((*kb) > 6)
    //                    looking_arc += ((*kb)<<3);
    //                else if((*kb) < 4)
    //                    myospal(weapon_xoffset+142-(p.look_ang>>1),
    //                            looking_arc+234-gun_pos,HANDHOLDINGLASER+3,gs,o,pal);

    //                myospal(weapon_xoffset+130-(p.look_ang>>1),
    //                        looking_arc+249-gun_pos,
    //                        HANDHOLDINGLASER+((*kb)>>2),gs,o,pal);
    //                myospal(weapon_xoffset+152-(p.look_ang>>1),
    //                        looking_arc+249-gun_pos,
    //                        HANDHOLDINGLASER+((*kb)>>2),gs,o|4,pal);

    //                break;

    //            case RPG_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else pal = sector[p.cursectnum].floorpal;

    //                weapon_xoffset -= sinTable[(768+((*kb)<<7))&2047]>>11;
    //                gun_pos += sinTable[(768+((*kb)<<7)&2047)]>>11;

    //                if(*kb > 0)
    //                {
    //                    if(*kb < 8)
    //                    {
    //                        myospal(weapon_xoffset+164,(looking_arc<<1)+176-gun_pos,
    //                                RPGGUN+((*kb)>>1),gs,o,pal);
    //                    }
    //                }

    //                myospal(weapon_xoffset+164,(looking_arc<<1)+176-gun_pos,
    //                        RPGGUN,gs,o,pal);

    //                break;

    //            case SHOTGUN_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;

    //                weapon_xoffset -= 8;

    //                switch(*kb)
    //                {
    //                    case 1:
    //                    case 2:
    //                        myospal(weapon_xoffset+168-(p.look_ang>>1),looking_arc+201-gun_pos,
    //                        SHOTGUN+2,-128,o,pal);
    //                    case 0:
    //                    case 6:
    //                    case 7:
    //                    case 8:
    //                        myospal(weapon_xoffset+146-(p.look_ang>>1),looking_arc+202-gun_pos,
    //                            SHOTGUN,gs,o,pal);
    //                        break;
    //                    case 3:
    //                    case 4:
    //                    case 5:
    //                    case 9:
    //                    case 10:
    //                    case 11:
    //                    case 12:
    //                        if( *kb > 1 && *kb < 5 )
    //                        {
    //                            gun_pos -= 40;
    //                            weapon_xoffset += 20;

    //                            myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+194-gun_pos,
    //                                SHOTGUN+1+((*(kb)-1)>>1),-128,o,pal);
    //                        }

    //                        myospal(weapon_xoffset+158-(p.look_ang>>1),looking_arc+220-gun_pos,
    //                            SHOTGUN+3,gs,o,pal);

    //                        break;
    //                    case 13:
    //                    case 14:
    //                    case 15:
    //                        myospal(32+weapon_xoffset+166-(p.look_ang>>1),looking_arc+210-gun_pos,
    //                            SHOTGUN+4,gs,o,pal);
    //                        break;
    //                    case 16:
    //                    case 17:
    //                    case 18:
    //                    case 19:
    //                        myospal(64+weapon_xoffset+170-(p.look_ang>>1),looking_arc+196-gun_pos,
    //                            SHOTGUN+5,gs,o,pal);
    //                        break;
    //                    case 20:
    //                    case 21:
    //                    case 22:
    //                    case 23:
    //                        myospal(64+weapon_xoffset+176-(p.look_ang>>1),looking_arc+196-gun_pos,
    //                            SHOTGUN+6,gs,o,pal);
    //                        break;
    //                    case 24:
    //                    case 25:
    //                    case 26:
    //                    case 27:
    //                        myospal(64+weapon_xoffset+170-(p.look_ang>>1),looking_arc+196-gun_pos,
    //                            SHOTGUN+5,gs,o,pal);
    //                        break;
    //                    case 28:
    //                    case 29:
    //                    case 30:
    //                        myospal(32+weapon_xoffset+156-(p.look_ang>>1),looking_arc+206-gun_pos,
    //                            SHOTGUN+4,gs,o,pal);
    //                        break;
    //                }
    //                break;


    //            case CHAINGUN_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;

    //                if(*kb > 0)
    //                    gun_pos -= sinTable[(*kb)<<7]>>12;

    //                if(*kb > 0 && sprite[p.i].pal != 1) weapon_xoffset += 1-(rand()&3);

    //                myospal(weapon_xoffset+168-(p.look_ang>>1),looking_arc+260-gun_pos,
    //                    CHAINGUN,gs,o,pal);
    //                switch(*kb)
    //                {
    //                    case 0:
    //                        myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+233-gun_pos,
    //                            CHAINGUN+1,gs,o,pal);
    //                        break;
    //                    default:
    //                        if(*kb > 4 && *kb < 12)
    //                        {
    //                            i = 0;
    //                            if(sprite[p.i].pal != 1) i = rand()&7;
    //                            myospal(i+weapon_xoffset-4+140-(p.look_ang>>1),i+looking_arc-((*kb)>>1)+208-gun_pos,
    //                                CHAINGUN+5+((*kb-4)/5),gs,o,pal);
    //                            if(sprite[p.i].pal != 1) i = rand()&7;
    //                            myospal(i+weapon_xoffset-4+184-(p.look_ang>>1),i+looking_arc-((*kb)>>1)+208-gun_pos,
    //                                CHAINGUN+5+((*kb-4)/5),gs,o,pal);
    //                        }
    //                        if(*kb < 8)
    //                        {
    //                            i = rand()&7;
    //                            myospal(i+weapon_xoffset-4+162-(p.look_ang>>1),i+looking_arc-((*kb)>>1)+208-gun_pos,
    //                                CHAINGUN+5+((*kb-2)/5),gs,o,pal);
    //                            myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+233-gun_pos,
    //                                CHAINGUN+1+((*kb)>>1),gs,o,pal);
    //                        }
    //                        else myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+233-gun_pos,
    //                            CHAINGUN+1,gs,o,pal);
    //                        break;
    //                }
    //                break;
    //            case PISTOL_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;

    //                if( (*kb) < 5)
    //                {
    //                    short kb_frames[] = {0,1,2,0,0},l;

    //                    l = 195-12+weapon_xoffset;

    //                    if((*kb) == 2)
    //                        l -= 3;
    //                    myospal(
    //                        (l-(p.look_ang>>1)),
    //                        (looking_arc+244-gun_pos),
    //                        FIRSTGUN+kb_frames[*kb],
    //                        gs,2,pal);
    //                }
    //                else
    //                {
    //                    if((*kb) < 10)
    //                        myospal(194-(p.look_ang>>1),looking_arc+230-gun_pos,FIRSTGUN+4,gs,o,pal);
    //                    else if((*kb) < 15)
    //                    {
    //                        myospal(244-((*kb)<<3)-(p.look_ang>>1),looking_arc+130-gun_pos+((*kb)<<4),FIRSTGUN+6,gs,o,pal);
    //                        myospal(224-(p.look_ang>>1),looking_arc+220-gun_pos,FIRSTGUN+5,gs,o,pal);
    //                    }
    //                    else if((*kb) < 20)
    //                    {
    //                        myospal(124+((*kb)<<1)-(p.look_ang>>1),looking_arc+430-gun_pos-((*kb)<<3),FIRSTGUN+6,gs,o,pal);
    //                        myospal(224-(p.look_ang>>1),looking_arc+220-gun_pos,FIRSTGUN+5,gs,o,pal);
    //                    }
    //                    else if((*kb) < 23)
    //                    {
    //                        myospal(184-(p.look_ang>>1),looking_arc+235-gun_pos,FIRSTGUN+8,gs,o,pal);
    //                        myospal(224-(p.look_ang>>1),looking_arc+210-gun_pos,FIRSTGUN+5,gs,o,pal);
    //                    }
    //                    else if((*kb) < 25)
    //                    {
    //                        myospal(164-(p.look_ang>>1),looking_arc+245-gun_pos,FIRSTGUN+8,gs,o,pal);
    //                        myospal(224-(p.look_ang>>1),looking_arc+220-gun_pos,FIRSTGUN+5,gs,o,pal);
    //                    }
    //                    else if((*kb) < 27)
    //                        myospal(194-(p.look_ang>>1),looking_arc+235-gun_pos,FIRSTGUN+5,gs,o,pal);
    //                }

    //                break;
    //            case HANDBOMB_WEAPON:
    //                {
    //                    if(sprite[p.i].pal == 1)
    //                        pal = 1;
    //                    else
    //                        pal = sector[p.cursectnum].floorpal;

    //                    if((*kb))
    //                    {
    //                        uint8_t  throw_frames[]
    //						    = {0,0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2};

    //                        if((*kb) < 7)
    //                            gun_pos -= 10*(*kb);        //D
    //                        else if((*kb) < 12)
    //                            gun_pos += 20*((*kb)-10); //U
    //                        else if((*kb) < 20)
    //                            gun_pos -= 9*((*kb)-14);  //D

    //                        myospal(weapon_xoffset+190-(p.look_ang>>1),looking_arc+250-gun_pos,HANDTHROW+throw_frames[(*kb)],gs,o,pal);
    //                    }
    //                    else
    //                        myospal(weapon_xoffset+190-(p.look_ang>>1),looking_arc+260-gun_pos,HANDTHROW,gs,o,pal);
    //                }
    //                break;

    //            case HANDREMOTE_WEAPON:
    //                {
    //                    int8_t remote_frames[] = {0,1,1,2,1,1,0,0,0,0,0};
    //                    if(sprite[p.i].pal == 1)
    //                        pal = 1;
    //                    else
    //                        pal = sector[p.cursectnum].floorpal;

    //                    weapon_xoffset = -48;

    //                    if((*kb))
    //                        myospal(weapon_xoffset+150-(p.look_ang>>1),looking_arc+258-gun_pos,HANDREMOTE+remote_frames[(*kb)],gs,o,pal);
    //                    else
    //                        myospal(weapon_xoffset+150-(p.look_ang>>1),looking_arc+258-gun_pos,HANDREMOTE,gs,o,pal);
    //                }
    //                break;
    //            case DEVISTATOR_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;

    //                if((*kb))
    //                {
    //                    uint8_t  cycloidy[] = {0,4,12,24,12,4,0};

    //                    i = sgn((*kb)>>2);

    //                    if(p.hbomb_hold_delay)
    //                    {
    //                        myospal( (cycloidy[*kb]>>1)+weapon_xoffset+268-(p.look_ang>>1),cycloidy[*kb]+looking_arc+238-gun_pos,DEVISTATOR+i,-32,o,pal);
    //                        myospal(weapon_xoffset+30-(p.look_ang>>1),looking_arc+240-gun_pos,DEVISTATOR,gs,o|4,pal);
    //                    }
    //                    else
    //                    {
    //                        myospal( -(cycloidy[*kb]>>1)+weapon_xoffset+30-(p.look_ang>>1),cycloidy[*kb]+looking_arc+240-gun_pos,DEVISTATOR+i,-32,o|4,pal);
    //                        myospal(weapon_xoffset+268-(p.look_ang>>1),looking_arc+238-gun_pos,DEVISTATOR,gs,o,pal);
    //                    }
    //                }
    //                else
    //                {
    //                    myospal(weapon_xoffset+268-(p.look_ang>>1),looking_arc+238-gun_pos,DEVISTATOR,gs,o,pal);
    //                    myospal(weapon_xoffset+30-(p.look_ang>>1),looking_arc+240-gun_pos,DEVISTATOR,gs,o|4,pal);
    //                }
    //                break;

    //            case FREEZE_WEAPON:
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;

    //                if((*kb))
    //                {
    //                    uint8_t  cat_frames[] = { 0,0,1,1,2,2 };

    //                    if(sprite[p.i].pal != 1)
    //                    {
    //                        weapon_xoffset += rand()&3;
    //                        looking_arc += rand()&3;
    //                    }
    //                    gun_pos -= 16;
    //                    myospal(weapon_xoffset+210-(p.look_ang>>1),looking_arc+261-gun_pos,FREEZE+2,-32,o,pal);
    //                    myospal(weapon_xoffset+210-(p.look_ang>>1),looking_arc+235-gun_pos,FREEZE+3+cat_frames[*kb%6],-32,o,pal);
    //                }
    //                else myospal(weapon_xoffset+210-(p.look_ang>>1),looking_arc+261-gun_pos,FREEZE,gs,o,pal);

    //                break;

    //            case SHRINKER_WEAPON:
    //            case GROW_WEAPON:
    //                weapon_xoffset += 28;
    //                looking_arc += 18;
    //                if(sprite[p.i].pal == 1)
    //                    pal = 1;
    //                else
    //                    pal = sector[p.cursectnum].floorpal;
    //                if((*kb) == 0)
    //                {
    //                    if(cw == GROW_WEAPON)
    //                    {
    //                        myospal(weapon_xoffset+184-(p.look_ang>>1),
    //                            looking_arc+240-gun_pos,SHRINKER+2,
    //                            16-(sinTable[p.random_club_frame&2047]>>10),
    //                            o,2);

    //                        myospal(weapon_xoffset+188-(p.look_ang>>1),
    //                        looking_arc+240-gun_pos,SHRINKER-2,gs,o,pal);
    //                    }
    //                    else
    //                    {
    //                        myospal(weapon_xoffset+184-(p.look_ang>>1),
    //                        looking_arc+240-gun_pos,SHRINKER+2,
    //                        16-(sinTable[p.random_club_frame&2047]>>10),
    //                        o,0);

    //                        myospal(weapon_xoffset+188-(p.look_ang>>1),
    //                        looking_arc+240-gun_pos,SHRINKER,gs,o,pal);
    //                    }
    //                }
    //                else
    //                {
    //                    if(sprite[p.i].pal != 1)
    //                    {
    //                        weapon_xoffset += rand()&3;
    //                        gun_pos += (rand()&3);
    //                    }

    //                    if(cw == GROW_WEAPON)
    //                    {
    //                        myospal(weapon_xoffset+184-(p.look_ang>>1),
    //                            looking_arc+240-gun_pos,SHRINKER+3+((*kb)&3),-32,
    //                            o,2);

    //                        myospal(weapon_xoffset+188-(p.look_ang>>1),
    //                        looking_arc+240-gun_pos,SHRINKER-1,gs,o,pal);

    //                    }
    //                    else
    //                    {
    //                        myospal(weapon_xoffset+184-(p.look_ang>>1),
    //                        looking_arc+240-gun_pos,SHRINKER+3+((*kb)&3),-32,
    //                        o,0);

    //                        myospal(weapon_xoffset+188-(p.look_ang>>1),
    //                        looking_arc+240-gun_pos,SHRINKER+1,gs,o,pal);
    //                    }
    //                }
    //                break;
    //        }
    //    }
    //}

    //displayloogie(snum);

}