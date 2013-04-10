﻿'use strict';

function updateinterpolations() {
    // todo
    //for (var i = numinterpolations - 1; i >= 0; i--) {
    //    oldipos[i] = curipos[i];
    //}
}

//40
function setinterpolation(posptr) {
    var i;

    ////todo: (btw, demo plays with this commented out)

    //if (numinterpolations >= MAXINTERPOLATIONS) return;
    //for (i = numinterpolations - 1; i >= 0; i--)
    //    if (curipos[i] == posptr) return;
    //curipos[numinterpolations] = posptr; //todo: address of...?
    //oldipos[numinterpolations] = /* * */posptr; //VALUE OF..?
    //numinterpolations++;
}

//66
function dointerpolations(smoothratio) {
    //Stick at beginning of drawscreen
    // todo
    //var i, j, odelta, ndelta;

    //ndelta = 0;
    //j = 0;
    //for (i = numinterpolations - 1; i >= 0; i--) {
    //    bakipos[i] = curipos[i];
    //    odelta = ndelta;
    //    ndelta = curipos[i] - oldipos[i];
    //    if (odelta != ndelta) j = mulscale16(ndelta, smoothratio);
    //    curipos[i] = oldipos[i] + j;
    //}
}

//80
function restoreinterpolations()  //Stick at end of drawscreen
{
    var i;
    for(i=numinterpolations-1;i>=0;i--) curipos[i] = bakipos[i];
}

//87
function ceilingspace(sectnum) {
    if ((sector[sectnum].ceilingstat & 1) && sector[sectnum].ceilingpal === 0) {
        switch (sector[sectnum].ceilingpicnum) {
            case MOONSKY1:
            case BIGORBIT1:
                return 1;
        }
    }
    return 0;
}

//101
function floorspace(sectnum) {
    if ((sector[sectnum].floorstat & 1) && sector[sectnum].ceilingpal === 0) {
        switch (sector[sectnum].floorpicnum) {
            case MOONSKY1:
            case BIGORBIT1:
                return 1;
        }
    }

    return 0;
}

//500
function checkavailweapon( p ) {
    var i,snum;
    var weap;

    if(p.wantweaponfire >= 0)
    {
        weap = p.wantweaponfire;
        p.wantweaponfire = -1;

        if(weap == p.curr_weapon) return;
        else if( p.gotweapon[weap] && p.ammo_amount[weap] > 0 )
        {
            addweapon(p,weap);
            return;
        }
    }

    weap = p.curr_weapon;
    if( p.gotweapon[weap] && p.ammo_amount[weap] > 0 )
        return;

    snum = sprite[p.i].yvel;

    for(i=0;i<10;i++)
    {
        weap = ud.wchoice[snum][i];
        if (VOLUMEONE)
            if(weap > 6) continue;

        if(weap == 0) weap = 9;
        else weap--;

        if( weap == 0 || ( p.gotweapon[weap] && p.ammo_amount[weap] > 0 ) )
            break;
    }

    if(i == 10) weap = 0;

    // Found the weapon

    p.last_weapon  = p.curr_weapon;
    p.random_club_frame = 0;
    p.curr_weapon  = weap;
    p.kickback_pic = 0;
    if(p.holster_weapon == 1)
    {
        p.holster_weapon = 0;
        p.weapon_pos = 10;
    }
    else p.weapon_pos   = -1;
}


// 625
function movesprite(spritenum, xchange, ychange, zchange, cliptype) {
    var daz, h, oldx, oldy;
    var retval, dasectnum, cd;
    var bg;

    bg = badguy(sprite[spritenum]);

    if (sprite[spritenum].statnum == 5 || (bg && sprite[spritenum].xrepeat < 4)) {
        sprite[spritenum].x += (xchange * TICSPERFRAME) >> 2;
        sprite[spritenum].y += (ychange * TICSPERFRAME) >> 2;
        sprite[spritenum].z += (zchange * TICSPERFRAME) >> 2;
        if (bg)
            setsprite(spritenum, sprite[spritenum].x, sprite[spritenum].y, sprite[spritenum].z);
        return 0;
    }

    dasectnum = sprite[spritenum].sectnum;

    daz = sprite[spritenum].z;
    h = ((tiles[sprite[spritenum].picnum].dim.height * sprite[spritenum].yrepeat) << 1);
    daz -= h;
    if (bg) {
        oldx = sprite[spritenum].x;
        oldy = sprite[spritenum].y;

        if (sprite[spritenum].xrepeat > 60) {
            throw "todo ref obj"
            var refObj = new R;
            //retval = clipmove(sprite[spritenum].x,sprite[spritenum].y,&daz,&dasectnum,((xchange*TICSPERFRAME)<<11),((ychange*TICSPERFRAME)<<11),1024L,(4<<8),(4<<8),cliptype);
        } else {
            if (sprite[spritenum].picnum == LIZMAN)
                cd = 292;
            else if ((actortype[sprite[spritenum].picnum] & 3))
                cd = sprite[spritenum].clipdist << 2;
            else
                cd = 192;

            throw "todo ref obj"
            //retval = clipmove(sprite[spritenum].x,sprite[spritenum].y,&daz,&dasectnum,((xchange*TICSPERFRAME)<<11),((ychange*TICSPERFRAME)<<11),cd,(4<<8),(4<<8),cliptype);
        }

        throw "todo "
        if (dasectnum < 0 || (dasectnum >= 0 &&
            ((hittype[spritenum].actorstayput >= 0 && hittype[spritenum].actorstayput != dasectnum) ||
                ((sprite[spritenum].picnum == BOSS2) && sprite[spritenum].pal == 0 && sector[dasectnum].lotag != 3) ||
                ((sprite[spritenum].picnum == BOSS1 || sprite[spritenum].picnum == BOSS2) && sector[dasectnum].lotag == 1) ||
                (sector[dasectnum].lotag == 1 && (sprite[spritenum].picnum == LIZMAN || (sprite[spritenum].picnum == LIZTROOP && sprite[spritenum].zvel == 0)))
            ))) {
            sprite[spritenum].x = oldx;
            sprite[spritenum].y = oldy;
            if (sector[dasectnum].lotag == 1 && sprite[spritenum].picnum == LIZMAN)
                sprite[spritenum].ang = (krand() & 2047);
            else if ((hittype[spritenum].temp_data[0] & 3) == 1 && sprite[spritenum].picnum != COMMANDER)
                sprite[spritenum].ang = (krand() & 2047);
            setsprite(spritenum, oldx, oldy, sprite[spritenum].z);
            if (dasectnum < 0) dasectnum = 0;
            return (16384 + dasectnum);
        }
        if ((retval & 49152) >= 32768 && (hittype[spritenum].cgg == 0)) {
            sprite[spritenum].ang += 768;
        }
    } else {
        var refX = new Ref(sprite[spritenum].x),
            refY = new Ref(sprite[spritenum].y),
            refZ = new Ref(daz),
            refSectnum = new Ref(dasectnum);
        if (sprite[spritenum].statnum == 4) {
            retval =
                clipmove(refX, refY, refZ, refSectnum, ((xchange * TICSPERFRAME) << 11), ((ychange * TICSPERFRAME) << 11), 8, (4 << 8), (4 << 8), cliptype);
        } else {
            retval =
                clipmove(refX, refY, refZ, refSectnum, ((xchange * TICSPERFRAME) << 11), ((ychange * TICSPERFRAME) << 11), (sprite[spritenum].clipdist << 2), (4 << 8), (4 << 8), cliptype);
        }

        sprite[spritenum].x = refX.$;
        sprite[spritenum].y = refY.$;
        daz = refZ.$;
        dasectnum = refSectnum.$;
    }

    if (dasectnum >= 0)
        if ((dasectnum != sprite[spritenum].sectnum))
            changespritesect(spritenum, dasectnum);
    daz = sprite[spritenum].z + ((zchange * TICSPERFRAME) >> 3);
    if ((daz > hittype[spritenum].ceilingz) && (daz <= hittype[spritenum].floorz))
        sprite[spritenum].z = daz;
    else
        if (retval == 0)
            return (16384 + dasectnum);

    return (retval);
}


//713
// The set sprite function
function ssp(i, cliptype) {
    var movetype;
    var s = sprite[i];

    movetype = movesprite(i,
        (s.xvel * (sintable[(s.ang + 512) & 2047])) >> 14,
        (s.xvel * (sintable[s.ang & 2047])) >> 14, s.zvel,
        cliptype);

    return (movetype == 0);
}

//728
function insertspriteq(i) {
    if (spriteqamount > 0) {
        if (spriteq[spriteqloc] >= 0)
            sprite[spriteq[spriteqloc]].xrepeat = 0;
        spriteq[spriteqloc] = i;
        spriteqloc = (spriteqloc + 1) % spriteqamount;
    } else sprite[i].xrepeat = sprite[i].yrepeat = 0;
}

//836
function setsectinterpolate(i) {
    var j, k, startwall, endwall;

    startwall = sector[sprite[i].sectnum].wallptr;
    endwall = startwall + sector[sprite[i].sectnum].wallnum;

    for (j = startwall; j < endwall; j++) {
        setinterpolation(wall[j].x);
        setinterpolation(wall[j].y);
        k = wall[j].nextwall;
        if (k >= 0) {
            setinterpolation(wall[k].x);
            setinterpolation(wall[k].y);
            k = wall[k].point2;
            setinterpolation(wall[k].x);
            setinterpolation(wall[k].y);
        }
    }
}

//908
function movefta() {
    var x, px, py, sx, sy;
    var i, j, p, psect = new Ref(), ssect = new Ref(), nexti;
    var s;

    i = headspritestat[2];
    while(i >= 0)
    {
        nexti = nextspritestat[i];

        s = sprite[i];
        var xRef = new Ref(x);
        p = findplayer(s, xRef);
        x = xRef.$;
        
        ssect.$ = psect.$ = s.sectnum;

        if(sprite[ps[p].i].extra > 0 )
        {
            if( x < 30000 )
            {
                hittype[i].timetosleep++;
                if( hittype[i].timetosleep >= (x>>8) )
                {
                    if(badguy(s))
                    {
                        px = ps[p].oposx+64-(krand()&127);
                        py = ps[p].oposy+64-(krand()&127);
                        updatesector(px,py,psect);
                        if(psect.$ == -1)
                        {
                            i = nexti;
                            continue;
                        }
                        sx = s.x+64-(krand()&127);
                        sy = s.y+64-(krand()&127);
                        updatesector(px,py,ssect);
                        if (ssect.$ == -1)
                        {
                            i = nexti;
                            continue;
                        }
                        j = cansee(sx,sy,s.z-(krand()%(52<<8)),s.sectnum,px,py,ps[p].oposz-(krand()%(32<<8)),ps[p].cursectnum);
                    }
                    else
                        j = cansee(s.x,s.y,s.z-((krand()&31)<<8),s.sectnum,ps[p].oposx,ps[p].oposy,ps[p].oposz-((krand()&31)<<8),ps[p].cursectnum);

                    //             j = 1;

                    if(j) switch(s.picnum)
                    {
                        case RUBBERCAN:
                        case EXPLODINGBARREL:
                        case WOODENHORSE:
                        case HORSEONSIDE:
                        case CANWITHSOMETHING:
                        case CANWITHSOMETHING2:
                        case CANWITHSOMETHING3:
                        case CANWITHSOMETHING4:
                        case FIREBARREL:
                        case FIREVASE:
                        case NUKEBARREL:
                        case NUKEBARRELDENTED:
                        case NUKEBARRELLEAKED:
                        case TRIPBOMB:
                            if (sector[s.sectnum].ceilingstat&1)
                                s.shade = sector[s.sectnum].ceilingshade;
                            else s.shade = sector[s.sectnum].floorshade;

                            hittype[i].timetosleep = 0;
                            changespritestat(i,6);
                            break;
                        default:
                            hittype[i].timetosleep = 0;
                            check_fta_sounds(i);
                            changespritestat(i,1);
                            break;
                    }
                    else hittype[i].timetosleep = 0;
                }
            }
            if( badguy( s ) )
            {
                if (sector[s.sectnum].ceilingstat&1)
                    s.shade = sector[s.sectnum].ceilingshade;
                else s.shade = sector[s.sectnum].floorshade;
            }
        }
        i = nexti;
    }
}

//1133
function movedummyplayers() {
    var i, p, nexti;

    i = headspritestat[13];
    while(i >= 0)
    {
        nexti = nextspritestat[i];

        p = sprite[sprite[i].owner].yvel;

        if( ps[p].on_crane >= 0 || sector[ps[p].cursectnum].lotag != 1 || sprite[ps[p].i].extra <= 0 )
        {
            ps[p].dummyplayersprite = -1;
            deletesprite(i);
            i = nexti;
            continue;
        }
        else
        {
            if(ps[p].on_ground && ps[p].on_warping_sector == 1 && sector[ps[p].cursectnum].lotag == 1 )
            {
                sprite[i].cstat = 257;
                sprite[i].z = sector[sprite[i].sectnum].ceilingz+(27<<8);
                sprite[i].ang = ps[p].ang;
                if(hittype[i].temp_data[0] == 8)
                    hittype[i].temp_data[0] = 0;
                else hittype[i].temp_data[0]++;
            }
            else
            {
                if(sector[sprite[i].sectnum].lotag != 2) sprite[i].z = sector[sprite[i].sectnum].floorz;
                sprite[i].cstat = -32768; //(short) 32768;
            }
        }

        sprite[i].x += (ps[p].posx-ps[p].oposx);
        sprite[i].y += (ps[p].posy-ps[p].oposy);
        setsprite(i, sprite[i].x, sprite[i].y, sprite[i].z);
        
        i = nexti;
    }
}

//1179
var otherp;
function moveplayers() //Players
{
    var i , nexti;
    var otherx;
    var s;
    var p;

    i = headspritestat[10];
    while(i >= 0)
    {
        nexti = nextspritestat[i];

        s = sprite[i];
        p = ps[s.yvel];
        if(s.owner >= 0)
        {
            if(p.newowner >= 0 ) //Looking thru the camera
            {
                s.x = p.oposx;
                s.y = p.oposy;
                hittype[i].bposz = s.z = p.oposz+PHEIGHT;
                s.ang = p.oang;
                setsprite(i,s.x,s.y,s.z);
            }
            else
            {
                if (ud.multimode > 1) {
                    var otherxRef = new Ref(otherx);
                    otherp = findotherplayer(s.yvel, otherxRef);
                    otherx = otherxRef.$;
                } else {
                    otherp = s.yvel;
                    otherx = 0;
                }
                
                execute(i,s.yvel,otherx);

                if(ud.multimode > 1)
                    if( sprite[ps[otherp].i].extra > 0 )
                    {
                        if( s.yrepeat > 32 && sprite[ps[otherp].i].yrepeat < 32)
                        {
                            if( otherx < 1400 && p.knee_incs == 0 )
                            {
                                p.knee_incs = 1;
                                p.weapon_pos = -1;
                                p.actorsqu = ps[otherp].i;
                            }
                        }
                    }
                if(ud.god)
                {
                    s.extra = max_player_health;
                    s.cstat = 257;
                    p.jetpack_amount =     1599;
                }


                if( s.extra > 0 )
                {
                    hittype[i].owner = i;

                    if(ud.god == 0)
                        if( ceilingspace(s.sectnum) || floorspace(s.sectnum) )
                            quickkill(p);
                }
                else
                {
                    
                    p.posx = s.x;
                    p.posy = s.y;
                    p.posz = s.z-(20<<8);

                    p.newowner = -1;

                    if( p.wackedbyactor >= 0 && sprite[p.wackedbyactor].statnum < MAXSTATUS )
                    {
                        p.ang += getincangle(p.ang,getangle(sprite[p.wackedbyactor].x-p.posx,sprite[p.wackedbyactor].y-p.posy))>>1;
                        p.ang &= 2047;
                    }

                }
                s.ang = p.ang;
            }
        }
        else
        {
            if(p.holoduke_on == -1)
            {
                deletesprite(i);
                i = nexti; continue;
            }

            hittype[i].bposx = s.x;
            hittype[i].bposy = s.y;
            hittype[i].bposz = s.z;

            s.cstat = 0;

            if(s.xrepeat < 42)
            {
                s.xrepeat += 4;
                s.cstat |= 2;
            }
            else s.xrepeat = 42;
            if(s.yrepeat < 36)
                s.yrepeat += 4;
            else
            {
                s.yrepeat = 36;
                if(sector[s.sectnum].lotag != 2)
                    makeitfall(i);
                if(s.zvel == 0 && sector[s.sectnum].lotag == 1)
                    s.z += (32<<8);
            }

            if(s.extra < 8)
            {
                s.xvel = 128;
                s.ang = p.ang;
                s.extra++;
                
            }
            else
            {
                s.ang = 2047-p.ang;
                setsprite(i,s.x,s.y,s.z);
            }
        }

        if (sector[s.sectnum].ceilingstat&1)
            s.shade += (sector[s.sectnum].ceilingshade-s.shade)>>1;
        else
            s.shade += (sector[s.sectnum].floorshade-s.shade)>>1;

        //BOLT:
            i = nexti;
    }
}

//1418
function movefallers() {
    var i, nexti, sect, j;
    var s;
    var x;

    i = headspritestat[12];
    while(i >= 0)
    {
        nexti = nextspritestat[i];
        s = sprite[i];

        sect = s.sectnum;

        if( hittype[i].temp_data[0] == 0 )
        {
            s.z -= (16<<8);
            hittype[i].temp_data[1] = s.ang;
            x = s.extra;
            j=ifhitbyweapon(i);if(j >= 0)
            {
                if( j == FIREEXT || j == RPG || j == RADIUSEXPLOSION || j == SEENINE || j == OOZFILTER )
                {
                    if(s.extra <= 0)
                    {
                        hittype[i].temp_data[0] = 1;
                        j = headspritestat[12];
                        while(j >= 0)
                        {
                            if (sprite[j].hitag == sprite[i].hitag)
                            {
                                hittype[j].temp_data[0] = 1;
                                sprite[j].cstat &= (65535-64);
                                if(sprite[j].picnum == CEILINGSTEAM || sprite[j].picnum == STEAM)
                                    sprite[j].cstat |= 32768;
                            }
                            j = nextspritestat[j];
                        }
                    }
                }
                else
                {
                    hittype[i].extra = 0;
                    s.extra = x;
                }
            }
            s.ang = hittype[i].temp_data[1];
            s.z += (16<<8);
        }
        else if(hittype[i].temp_data[0] == 1)
        {
            if(s.lotag > 0)
            {
                s.lotag-=3;
                if(s.lotag <= 0)
                {
                    s.xvel = (32+krand()&63);
                    s.zvel = -(1024+(krand()&1023));
                }
            }
            else
            {
                if( s.xvel > 0)
                {
                    s.xvel -= 8;
                    ssp(i,CLIPMASK0);
                }

                if( floorspace(s.sectnum) ) x = 0;
                else
                {
                    if(ceilingspace(s.sectnum))
                        x = gc/6;
                    else
                        x = gc;
                }

                if( s.z < (sector[sect].floorz-FOURSLEIGHT) )
                {
                    s.zvel += x;
                    if(s.zvel > 6144)
                        s.zvel = 6144;
                    s.z += s.zvel;
                }
                if( (sector[sect].floorz-s.z) < (16<<8) )
                {
                    j = 1+(krand()&7);
                    for(x=0;x<j;x++) EGS(s.sectnum,s.x+(TRAND&255)-128,s.y+(TRAND&255)-128,s.z-(8<<8)-(TRAND&8191),SCRAP6+(TRAND&15),-8,48,48,TRAND&2047,(TRAND&63)+64,-512-(TRAND&2047),i,5);
                    {deletesprite(i);/*goto BOLT;*/}
                }
            }
        }

        //BOLT:
            i = nexti;
    }
}

//2452

function moveweapons()
{
    var i, j, k, nexti, p, q;
    var dax,day,daz, x, ll;
    var qq;
    var s;
  

    i = headspritestat[4];
    while(i >= 0)
    {
        nexti = nextspritestat[i];
        s = sprite[i];

        if(s.sectnum < 0) {deletesprite(i);i = nexti; continue;;};

        hittype[i].bposx = s.x;
        hittype[i].bposy = s.y;
        hittype[i].bposz = s.z;

        switch(s.picnum)
        {
            case RADIUSEXPLOSION:
            case KNEE:
                {deletesprite(i);i = nexti; continue;};
            case TONGUE:
                hittype[i].temp_data[0] = sintable[(hittype[i].temp_data[1])&2047]>>9;
                hittype[i].temp_data[1] += 32;
                if(hittype[i].temp_data[1] > 2047) {deletesprite(i);i = nexti; continue;};

                if(sprite[s.owner].statnum == MAXSTATUS)
                    if(badguy(sprite[s.owner]) == 0)
                        {deletesprite(i);i = nexti; continue;};

                s.ang = sprite[s.owner].ang;
                s.x = sprite[s.owner].x;
                s.y = sprite[s.owner].y;
                if(sprite[s.owner].picnum == APLAYER)
                    s.z = sprite[s.owner].z-(34<<8);
                for(k=0;k<hittype[i].temp_data[0];k++)
                {
                    q = EGS(s.sectnum,
                        s.x+((k*sintable[(s.ang+512)&2047])>>9),
                        s.y+((k*sintable[s.ang&2047])>>9),
                        s.z+((k*ksgn(s.zvel))*klabs(s.zvel/12)),TONGUE,-40+(k<<1),
                        8,8,0,0,0,i,5);
                    sprite[q].cstat = 128;
                    sprite[q].pal = 8;
                }
                q = EGS(s.sectnum,
                    s.x+((k*sintable[(s.ang+512)&2047])>>9),
                    s.y+((k*sintable[s.ang&2047])>>9),
                    s.z+((k*ksgn(s.zvel))*klabs(s.zvel/12)),INNERJAW,-40,
                    32,32,0,0,0,i,5);
                sprite[q].cstat = 128;
                if( hittype[i].temp_data[1] > 512 && hittype[i].temp_data[1] < (1024) )
                    sprite[q].picnum = INNERJAW+1;

                i = nexti; continue;

            case FREEZEBLAST:
                if(s.yvel < 1 || s.extra < 2 || (s.xvel|s.zvel) == 0)
                {
                    j = spawn(i,TRANSPORTERSTAR);
                    sprite[j].pal = 1;
                    sprite[j].xrepeat = 32;
                    sprite[j].yrepeat = 32;
                    {deletesprite(i);i = nexti; continue;};
                }
            case SHRINKSPARK:
            case RPG:
            case FIRELASER:
            case SPIT:
            case COOLEXPLOSION1:

                if( s.picnum == COOLEXPLOSION1 )
                    if( Sound[WIERDSHOT_FLY].num == 0 )
                        spritesound(WIERDSHOT_FLY,i);

                p = -1;

                if(s.picnum == RPG && sector[s.sectnum].lotag == 2)
                {
                    k = s.xvel>>1;
                    ll = s.zvel>>1;
                }
                else
                {
                    k = s.xvel;
                    ll = s.zvel;
                }

                dax = s.x; day = s.y; daz = s.z;

                getglobalz(i);
                qq = CLIPMASK1;

                switch(s.picnum)
                {
                    case RPG:
                        if(hittype[i].picnum != BOSS2 && s.xrepeat >= 10 && sector[s.sectnum].lotag != 2)
                        {
                            j = spawn(i,SMALLSMOKE);
                            sprite[j].z += (1<<8);
                        }
                        break;
                }

                j = movesprite(i,
                    (k*(sintable[(s.ang+512)&2047]))>>14,
                    (k*(sintable[s.ang&2047]))>>14,ll,qq);

                if(s.picnum == RPG && s.yvel >= 0)
                    if( FindDistance2D(s.x-sprite[s.yvel].x,s.y-sprite[s.yvel].y) < 256 )
                        j = 49152|s.yvel;

                if(s.sectnum < 0) { {deletesprite(i);i = nexti; continue;}; }

                if( (j&49152) != 49152)
                    if(s.picnum != FREEZEBLAST)
                    {
                        if(s.z < hittype[i].ceilingz)
                        {
                            j = 16384|(s.sectnum);
                            s.zvel = -1;
                        }
                        else
                            if( ( s.z > hittype[i].floorz && sector[s.sectnum].lotag != 1 ) ||
                                ( s.z > hittype[i].floorz+(16<<8) && sector[s.sectnum].lotag == 1 ) )
                            {
                                j = 16384|(s.sectnum);
                                if(sector[s.sectnum].lotag != 1)
                                    s.zvel = 1;
                            }
                    }

                if(s.picnum == FIRELASER)
                {
                    for(k=-3;k<2;k++)
                    {
                        x = EGS(s.sectnum,
                            s.x+((k*sintable[(s.ang+512)&2047])>>9),
                            s.y+((k*sintable[s.ang&2047])>>9),
                            s.z+((k*ksgn(s.zvel))*klabs(s.zvel/24)),FIRELASER,-40+(k<<2),
                            s.xrepeat,s.yrepeat,0,0,0,s.owner,5);

                        sprite[x].cstat = 128;
                        sprite[x].pal = s.pal;
                    }
                }
                else if(s.picnum == SPIT) if(s.zvel < 6144)
                    s.zvel += gc-112;

                if( j != 0 )
                {
                    if(s.picnum == COOLEXPLOSION1)
                    {
                        if( (j&49152) == 49152 && sprite[j&(MAXSPRITES-1)].picnum != APLAYER)
                            i = nexti; continue;
                        s.xvel = 0;
                        s.zvel = 0;
                    }

                    if( (j&49152) == 49152 )
                    {
                        j &= (MAXSPRITES-1);

                        if(s.picnum == FREEZEBLAST && sprite[j].pal == 1 )
                            if( badguy(sprite[j]) || sprite[j].picnum == APLAYER )
                            {
                                j = spawn(i,TRANSPORTERSTAR);
                                sprite[j].pal = 1;
                                sprite[j].xrepeat = 32;
                                sprite[j].yrepeat = 32;

                                {deletesprite(i);i = nexti; continue;};
                            }

                        checkhitsprite(j,i);

                        if(sprite[j].picnum == APLAYER)
                        {
                            p = sprite[j].yvel;
                            spritesound(PISTOL_BODYHIT,j);

                            if(s.picnum == SPIT)
                            {
                                ps[p].horiz += 32;
                                ps[p].return_to_center = 8;

                                if(ps[p].loogcnt == 0)
                                {
                                    if(Sound[DUKE_LONGTERM_PAIN].num < 1)
                                        spritesound(DUKE_LONGTERM_PAIN,ps[p].i);

                                    j = 3+(krand()&3);
                                    ps[p].numloogs = j;
                                    ps[p].loogcnt = 24*4;
                                    for(x=0;x < j;x++)
                                    {
                                        ps[p].loogiex[x] = krand()%xdim;
                                        ps[p].loogiey[x] = krand()%ydim;
                                    }
                                }
                            }
                        }
                    }
                    else if( (j&49152) == 32768 )
                    {
                        j &= (MAXWALLS-1);

                        if(s.picnum != RPG && s.picnum != FREEZEBLAST && s.picnum != SPIT && ( wall[j].overpicnum == MIRROR || wall[j].picnum == MIRROR ) )
                        {
                            k = getangle(
                                    wall[wall[j].point2].x-wall[j].x,
                                    wall[wall[j].point2].y-wall[j].y);
                            s.ang = ((k<<1) - s.ang)&2047;
                            s.owner = i;
                            spawn(i,TRANSPORTERSTAR);
                            i = nexti; continue;
                        }
                        else
                        {
                            setsprite(i,dax,day,daz);
                            checkhitwall(i,j,s.x,s.y,s.z,s.picnum);

                            if(s.picnum == FREEZEBLAST)
                            {
                                if( wall[j].overpicnum != MIRROR && wall[j].picnum != MIRROR )
                                {
                                    s.extra >>= 1;
                                    s.yvel--;
                                }

                                k = getangle(
                                    wall[wall[j].point2].x-wall[j].x,
                                    wall[wall[j].point2].y-wall[j].y);
                                s.ang = ((k<<1) - s.ang)&2047;
                                i = nexti; continue;
                            }
                        }
                    }
                    else if( (j&49152) == 16384)
                    {
                        setsprite(i,dax,day,daz);

                        if(s.zvel < 0)
                        {
                            if( sector[s.sectnum].ceilingstat&1 )
                                if(sector[s.sectnum].ceilingpal == 0)
                                    {deletesprite(i);i = nexti; continue;};

                            checkhitceiling(s.sectnum);
                        }

                        if(s.picnum == FREEZEBLAST)
                        {
                            bounce(i);
                            ssp(i,qq);
                            s.extra >>= 1;
                            if(s.xrepeat > 8)
                                s.xrepeat -= 2;
                            if(s.yrepeat > 8)
                                s.yrepeat -= 2;
                            s.yvel--;
                            i = nexti; continue;
                        }
                    }

                    if(s.picnum != SPIT)
                    {
                        if(s.picnum == RPG)
                        {
                            k = spawn(i,EXPLOSION2);
                            sprite[k].x = dax;
                            sprite[k].y = day;
                            sprite[k].z = daz;

                            if(s.xrepeat < 10)
                            {
                                sprite[k].xrepeat = 6;
                                sprite[k].yrepeat = 6;
                            }
                            else if( (j&49152) == 16384)
                            {
                                if( s.zvel > 0)
                                    spawn(i,EXPLOSION2BOT);
                                else { sprite[k].cstat |= 8; sprite[k].z += (48<<8); }
                            }
                        }
                        else if(s.picnum == SHRINKSPARK)
                        {
                            spawn(i,SHRINKEREXPLOSION);
                            spritesound(SHRINKER_HIT,i);
                            hitradius(i,shrinkerblastradius,0,0,0,0);
                        }
                        else if( s.picnum != COOLEXPLOSION1 && s.picnum != FREEZEBLAST && s.picnum != FIRELASER)
                        {
                            k = spawn(i,EXPLOSION2);
                            sprite[k].xrepeat = sprite[k].yrepeat = s.xrepeat>>1;
                            if( (j&49152) == 16384)
                            {
                                if( s.zvel < 0)
                                { sprite[k].cstat |= 8; sprite[k].z += (72<<8); }
                            }
                        }
                        if( s.picnum == RPG )
                        {
                            spritesound(RPG_EXPLODE,i);

                            if(s.xrepeat >= 10)
                            {
                                x = s.extra;
                                hitradius( i,rpgblastradius, x>>2,x>>1,x-(x>>2),x);
                            }
                            else
                            {
                                x = s.extra+(global_random&3);
                                hitradius( i,(rpgblastradius>>1),x>>2,x>>1,x-(x>>2),x);
                            }
                        }
                    }
                    if(s.picnum != COOLEXPLOSION1) {deletesprite(i);i = nexti; continue;};
                }
                if(s.picnum == COOLEXPLOSION1)
                {
                    s.shade++;
                    if(s.shade >= 40) {deletesprite(i);i = nexti; continue;};
                }
                else if(s.picnum == RPG && sector[s.sectnum].lotag == 2 && s.xrepeat >= 10 && rnd(140))
                    spawn(i,WATERBUBBLE);

                i = nexti; continue;


            case SHOTSPARK1:
                var xRef = new Ref(x);
                p = findplayer(s, xRef);
                x = xRef.$;
                execute(i,p,x);
                i = nexti; continue;
        }
        //BOLT:
            i = nexti;

    }
}

//2797

function movetransports()
{
    var warpspriteto;
    var i, j, k, l, p, sect, sectlotag, nexti, nextj;
    var ll,onfloorz,q;

    i = headspritestat[9]; //Transporters


    BOLT:
    while (i >= 0)
    {
        sect = sprite[i].sectnum;
        sectlotag = sector[sect].lotag;

        nexti = nextspritestat[i];

        if(sprite[i].owner == i)
        {
            i = nexti;
            continue;
        }

        onfloorz = hittype[i].temp_data[4];

        if(hittype[i].temp_data[0] > 0) hittype[i].temp_data[0]--;

        j = headspritesect[sect];
        while(j >= 0)
        {
            nextj = nextspritesect[j];

            switch(sprite[j].statnum)
            {
                case 10:    // Player

                    if( sprite[j].owner != -1 )
                    {
                        p = sprite[j].yvel;

                        ps[p].on_warping_sector = 1;

                        if( ps[p].transporter_hold == 0 && ps[p].jumping_counter == 0 )
                        {
                            if(ps[p].on_ground && sectlotag == 0 && onfloorz && ps[p].jetpack_on == 0 )
                            {
                                if(sprite[i].pal == 0)
                                {
                                    spawn(i,TRANSPORTERBEAM);
                                    spritesound(TELEPORTER,i);
                                }

                                for(k=connecthead;k>=0;k=connectpoint2[k])
                                    if(ps[k].cursectnum == sprite[sprite[i].owner].sectnum)
                                    {
                                        ps[k].frag_ps = p;
                                        sprite[ps[k].i].extra = 0;
                                    }

                                ps[p].ang = sprite[sprite[i].owner].ang;

                                if(sprite[sprite[i].owner].owner != sprite[i].owner)
                                {
                                    hittype[i].temp_data[0] = 13;
                                    hittype[sprite[i].owner].temp_data[0] = 13;
                                    ps[p].transporter_hold = 13;
                                }

                                ps[p].bobposx = ps[p].oposx = ps[p].posx = sprite[sprite[i].owner].x;
                                ps[p].bobposy = ps[p].oposy = ps[p].posy = sprite[sprite[i].owner].y;
                                ps[p].oposz = ps[p].posz = sprite[sprite[i].owner].z-PHEIGHT;

                                changespritesect(j,sprite[sprite[i].owner].sectnum);
                                ps[p].cursectnum = sprite[j].sectnum;

                                if(sprite[i].pal == 0)
                                {
                                    k = spawn(sprite[i].owner,TRANSPORTERBEAM);
                                    spritesound(TELEPORTER,k);
                                }

                                break;
                            }
                        }
                        else if( !(sectlotag == 1 && ps[p].on_ground == 1)  ) break;

                        if(onfloorz == 0 && klabs(sprite[i].z-ps[p].posz) < 6144 )
                            if( (ps[p].jetpack_on == 0 ) || (ps[p].jetpack_on && (sync[p].bits&1) ) ||
                                (ps[p].jetpack_on && (sync[p].bits&2) ) )
                            {
                                ps[p].oposx = ps[p].posx += sprite[sprite[i].owner].x-sprite[i].x;
                                ps[p].oposy = ps[p].posy += sprite[sprite[i].owner].y-sprite[i].y;

                                if( ps[p].jetpack_on && ( (sync[p].bits&1) || ps[p].jetpack_on < 11 ) )
                                    ps[p].posz = sprite[sprite[i].owner].z-6144;
                                else ps[p].posz = sprite[sprite[i].owner].z+6144;
                                ps[p].oposz = ps[p].posz;

                                hittype[ps[p].i].bposx = ps[p].posx;
                                hittype[ps[p].i].bposy = ps[p].posy;
                                hittype[ps[p].i].bposz = ps[p].posz;

                                changespritesect(j,sprite[sprite[i].owner].sectnum);
                                ps[p].cursectnum = sprite[sprite[i].owner].sectnum;

                                break;
                            }

                        k = 0;

                        if( onfloorz && sectlotag == 1 && ps[p].on_ground && ps[p].posz > (sector[sect].floorz-(16<<8)) && ( (sync[p].bits&2) || ps[p].poszv > 2048 ) )
                            //                        if( onfloorz && sectlotag == 1 && ps[p].posz > (sector[sect].floorz-(6<<8)) )
                        {
                            k = 1;
                            if(screenpeek == p)
                            {
                                FX.stopAllSounds();
                                clearsoundlocks();
                            }
                            if(sprite[ps[p].i].extra > 0)
                                spritesound(DUKE_UNDERWATER,j);
                            ps[p].oposz = ps[p].posz =
                                sector[sprite[sprite[i].owner].sectnum].ceilingz+(7<<8);

                            ps[p].posxv = 4096-(krand()&8192);
                            ps[p].posyv = 4096-(krand()&8192);

                        }

                        if( onfloorz && sectlotag == 2 && ps[p].posz < (sector[sect].ceilingz+(6<<8)) )
                        {
                            k = 1;
                            //                            if( sprite[j].extra <= 0) break;
                            if(screenpeek == p)
                            {
                                FX.stopAllSounds();
                                clearsoundlocks();
                            }
                            spritesound(DUKE_GASP,j);

                            ps[p].oposz = ps[p].posz =
                                sector[sprite[sprite[i].owner].sectnum].floorz-(7<<8);

                            ps[p].jumping_toggle = 1;
                            ps[p].jumping_counter = 0;
                        }

                        if(k == 1)
                        {
                            ps[p].oposx = ps[p].posx += sprite[sprite[i].owner].x-sprite[i].x;
                            ps[p].oposy = ps[p].posy += sprite[sprite[i].owner].y-sprite[i].y;

                            if(sprite[sprite[i].owner].owner != sprite[i].owner)
                                ps[p].transporter_hold = -2;
                            ps[p].cursectnum = sprite[sprite[i].owner].sectnum;

                            changespritesect(j,sprite[sprite[i].owner].sectnum);
                            setsprite(ps[p].i,ps[p].posx,ps[p].posy,ps[p].posz+PHEIGHT);

                            setpal(ps[p]);

                            if( (krand()&255) < 32 )
                                spawn(j,WATERSPLASH2);

                            if(sectlotag == 1)
                                for(l = 0;l < 9;l++)
                                {
                                    q = spawn(ps[p].i,WATERBUBBLE);
                                    sprite[q].z += krand()&16383;
                                }
                        }
                    }
                    break;

                case 1:
                    switch(sprite[j].picnum)
                    {
                        case SHARK:
                        case COMMANDER:
                        case OCTABRAIN:
                        case GREENSLIME:
                        case GREENSLIME+1:
                        case GREENSLIME+2:
                        case GREENSLIME+3:
                        case GREENSLIME+4:
                        case GREENSLIME+5:
                        case GREENSLIME+6:
                        case GREENSLIME+7:
                            if (sprite[j].extra > 0)
                                j = nextj; continue;
                    }
                case 4:
                case 5:
                case 12:
                case 13:

                    ll = klabs(sprite[j].zvel);

                    {
                        warpspriteto = 0;
                        if( ll && sectlotag == 2 && sprite[j].z < (sector[sect].ceilingz+ll) )
                            warpspriteto = 1;

                        if( ll && sectlotag == 1 && sprite[j].z > (sector[sect].floorz-ll) )
                            warpspriteto = 1;

                        if( sectlotag == 0 && ( onfloorz || klabs(sprite[j].z-sprite[i].z) < 4096) )
                        {
                            if( sprite[sprite[i].owner].owner != sprite[i].owner && onfloorz && hittype[i].temp_data[0] > 0 && sprite[j].statnum != 5 )
                            {
                                hittype[i].temp_data[0]++;
                                debugger;
                                i = nexti; continue BOLT;
                            }
                            warpspriteto = 1;
                        }

                        if( warpspriteto ) switch(sprite[j].picnum)
                        {
                            case TRANSPORTERSTAR:
                            case TRANSPORTERBEAM:
                            case TRIPBOMB:
                            case BULLETHOLE:
                            case WATERSPLASH2:
                            case BURNING:
                            case BURNING2:
                            case FIRE:
                            case FIRE2:
                            case TOILETWATER:
                            case LASERLINE:
                                j = nextj; continue;
                            case PLAYERONWATER:
                                if(sectlotag == 2)
                                {
                                    sprite[j].cstat &= 32767;
                                    break;
                                }
                            default:
                                if(sprite[j].statnum == 5 && !(sectlotag == 1 || sectlotag == 2) )
                                    break;

                            case WATERBUBBLE:
                                //                                if( rnd(192) && sprite[j].picnum == WATERBUBBLE)
                                //                                 break;

                                if(sectlotag > 0)
                                {
                                    k = spawn(j,WATERSPLASH2);
                                    if( sectlotag == 1 && sprite[j].statnum == 4 )
                                    {
                                        sprite[k].xvel = sprite[j].xvel>>1;
                                        sprite[k].ang = sprite[j].ang;
                                        ssp(k,CLIPMASK0);
                                    }
                                }

                                switch(sectlotag)
                                {
                                    case 0:
                                        if(onfloorz)
                                        {
                                            if( sprite[j].statnum == 4 || ( checkcursectnums(sect) == -1 && checkcursectnums(sprite[sprite[i].owner].sectnum)  == -1 ) )
                                            {
                                                sprite[j].x += (sprite[sprite[i].owner].x-sprite[i].x);
                                                sprite[j].y += (sprite[sprite[i].owner].y-sprite[i].y);
                                                sprite[j].z -= sprite[i].z - sector[sprite[sprite[i].owner].sectnum].floorz;
                                                sprite[j].ang = sprite[sprite[i].owner].ang;

                                                hittype[j].bposx = sprite[j].x;
                                                hittype[j].bposy = sprite[j].y;
                                                hittype[j].bposz = sprite[j].z;

                                                if(sprite[i].pal == 0)
                                                {
                                                    k = spawn(i,TRANSPORTERBEAM);
                                                    spritesound(TELEPORTER,k);

                                                    k = spawn(sprite[i].owner,TRANSPORTERBEAM);
                                                    spritesound(TELEPORTER,k);
                                                }

                                                if( sprite[sprite[i].owner].owner != sprite[i].owner )
                                                {
                                                    hittype[i].temp_data[0] = 13;
                                                    hittype[sprite[i].owner].temp_data[0] = 13;
                                                }

                                                changespritesect(j,sprite[sprite[i].owner].sectnum);
                                            }
                                        }
                                        else
                                        {
                                            sprite[j].x += (sprite[sprite[i].owner].x-sprite[i].x);
                                            sprite[j].y += (sprite[sprite[i].owner].y-sprite[i].y);
                                            sprite[j].z = sprite[sprite[i].owner].z+4096;

                                            hittype[j].bposx = sprite[j].x;
                                            hittype[j].bposy = sprite[j].y;
                                            hittype[j].bposz = sprite[j].z;

                                            changespritesect(j,sprite[sprite[i].owner].sectnum);
                                        }
                                        break;
                                    case 1:
                                        sprite[j].x += (sprite[sprite[i].owner].x-sprite[i].x);
                                        sprite[j].y += (sprite[sprite[i].owner].y-sprite[i].y);
                                        sprite[j].z = sector[sprite[sprite[i].owner].sectnum].ceilingz+ll;

                                        hittype[j].bposx = sprite[j].x;
                                        hittype[j].bposy = sprite[j].y;
                                        hittype[j].bposz = sprite[j].z;

                                        changespritesect(j,sprite[sprite[i].owner].sectnum);

                                        break;
                                    case 2:
                                        sprite[j].x += (sprite[sprite[i].owner].x-sprite[i].x);
                                        sprite[j].y += (sprite[sprite[i].owner].y-sprite[i].y);
                                        sprite[j].z = sector[sprite[sprite[i].owner].sectnum].floorz-ll;

                                        hittype[j].bposx = sprite[j].x;
                                        hittype[j].bposy = sprite[j].y;
                                        hittype[j].bposz = sprite[j].z;

                                        changespritesect(j,sprite[sprite[i].owner].sectnum);

                                        break;
                                }

                                break;
                        }
                    }
                    break;

            }
            //JBOLT:
                j = nextj;
        }
        //BOLT:
            i = nexti;
    }
}

//4394

function moveexplosions()  // STATNUM 5
{
    var i, j, nexti, sect, p;
    var l, x, t;
    var s;

    i = headspritestat[5];
    while(i >= 0)
    {
        nexti = nextspritestat[i];

        t = hittype[i].temp_data;
        s = sprite[i];
        sect = s.sectnum;

        if( sect < 0 || s.xrepeat == 0 ) {deletesprite(i); i = nexti; continue;}

        hittype[i].bposx = s.x;
        hittype[i].bposy = s.y;
        hittype[i].bposz = s.z;

        switch(s.picnum)
        {
            case NEON1:
            case NEON2:
            case NEON3:
            case NEON4:
            case NEON5:
            case NEON6:

                if( (global_random/(s.lotag+1)&31) > 4) s.shade = -127;
                else s.shade = 127;
                {i = nexti; continue;}

            case BLOODSPLAT1:
            case BLOODSPLAT2:
            case BLOODSPLAT3:
            case BLOODSPLAT4:

                if( t[0] == 7*26 ) {i = nexti; continue;}
                s.z += 16+(krand()&15);
                t[0]++;
                if( (t[0]%9) == 0 ) s.yrepeat++;
                {i = nexti; continue;}

            case NUKEBUTTON:
            case NUKEBUTTON+1:
            case NUKEBUTTON+2:
            case NUKEBUTTON+3:

                if(t[0])
                {
                    t[0]++;
                    if(t[0] == 8) s.picnum = NUKEBUTTON+1;
                    else if(t[0] == 16)
                    {
                        s.picnum = NUKEBUTTON+2;
                        ps[sprite[s.owner].yvel].fist_incs = 1;
                    }
                    if( ps[sprite[s.owner].yvel].fist_incs == 26 )
                        s.picnum = NUKEBUTTON+3;
                }
                {i = nexti; continue;}

            case FORCESPHERE:

                l = s.xrepeat;
                if(t[1] > 0)
                {
                    t[1]--;
                    if(t[1] == 0)
                    {
                        {deletesprite(i); i = nexti; continue;}
                    }
                }
                if(hittype[s.owner].temp_data[1] == 0)
                {
                    if(t[0] < 64)
                    {
                        t[0]++;
                        l += 3;
                    }
                }
                else
                    if(t[0] > 64)
                    {
                        t[0]--;
                        l -= 3;
                    }

                s.x = sprite[s.owner].x;
                s.y = sprite[s.owner].y;
                s.z = sprite[s.owner].z;
                s.ang += hittype[s.owner].temp_data[0];

                if(l > 64) l = 64;
                else if(l < 1) l = 1;

                s.xrepeat = l;
                s.yrepeat = l;
                s.shade = (l>>1)-48;

                for(j=t[0];j > 0;j--)
                    ssp(i,CLIPMASK0);
                {i = nexti; continue;}
            case WATERSPLASH2:

                t[0]++;
                if(t[0] == 1 )
                {
                    if(sector[sect].lotag != 1 && sector[sect].lotag != 2)
                        {deletesprite(i); i = nexti; continue;}
                    /*                    else
                                        {
                                            l = getflorzofslope(sect,s.x,s.y)-s.z;
                                            if( l > (16<<8) ) {deletesprite(i); i = nexti; continue;}
                                        }
                                        else */ if(Sound[ITEM_SPLASH].num == 0)
                        spritesound(ITEM_SPLASH,i);
                }
                if(t[0] == 3)
                {
                    t[0] = 0;
                    t[1]++;
                }
                if(t[1] == 5)
                    deletesprite(i);
                {i = nexti; continue;}

            case FRAMEEFFECT1:
            case FRAMEEFFECT1_13CON:
                if(s.owner >= 0)
                {
                    t[0]++;

                    if( t[0] > 7 )
                    {
                        {deletesprite(i); i = nexti; continue;}
                    }
                    else if( t[0] > 4 )
                        s.cstat |= 512+2;
                    else if( t[0] > 2 )
                        s.cstat |= 2;
                    s.xoffset = sprite[s.owner].xoffset;
                    s.yoffset = sprite[s.owner].yoffset;
                }
                {i = nexti; continue;}
            case INNERJAW:
            case INNERJAW+1:

                var xRef = new Ref(x);
                p = findplayer(s,xRef);
                x = xRef.$;
                
                if(x < 512)
                {
                    ps[p].pals_time = 32;
                    ps[p].pals[0] = 32;
                    ps[p].pals[1] = 0;
                    ps[p].pals[2] = 0;
                    sprite[ps[p].i].extra -= 4;
                }

            case FIRELASER:
                if(s.extra != 999)
                    s.extra = 999;
                else {deletesprite(i); i = nexti; continue;}
                break;
            case TONGUE:
                {deletesprite(i); i = nexti; continue;}
            case MONEY+1:
            case MAIL+1:
            case PAPER+1:
                hittype[i].floorz = s.z = getflorzofslope(s.sectnum,s.x,s.y);
                break;
            case MONEY:
            case MAIL:
            case PAPER:

                s.xvel = (krand()&7)+(sintable[hittype[i].temp_data[0]&2047]>>9);
                hittype[i].temp_data[0] += (krand()&63);
                if( (hittype[i].temp_data[0]&2047) > 512 && (hittype[i].temp_data[0]&2047) < 1596)
                {
                    if(sector[sect].lotag == 2)
                    {
                        if(s.zvel < 64)
                            s.zvel += (gc>>5)+(krand()&7);
                    }
                    else
                        if(s.zvel < 144)
                            s.zvel += (gc>>5)+(krand()&7);
                }

                ssp(i,CLIPMASK0);

                if( (krand()&3) == 0 )
                    setsprite(i,s.x,s.y,s.z);

                if(s.sectnum == -1) {deletesprite(i); i = nexti; continue;}
                l = getflorzofslope(s.sectnum,s.x,s.y);

                if( s.z > l )
                {
                    s.z = l;

                    insertspriteq(i);
                    PN ++;

                    j = headspritestat[5];
                    while(j >= 0)
                    {
                        if(sprite[j].picnum == BLOODPOOL)
                            if(ldist(s,sprite[j]) < 348)
                            {
                                s.pal = 2;
                                break;
                            }
                        j = nextspritestat[j];
                    }
                }

                break;

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

                if(s.xvel > 0) s.xvel--;
                else s.xvel = 0;

                if( t[5] < 30*10 )
                    t[5]++;
                else { {deletesprite(i); i = nexti; continue;} }


                if(s.zvel > 1024 && s.zvel < 1280)
                {
                    setsprite(i,s.x,s.y,s.z);
                    sect = s.sectnum;
                }

                l = getflorzofslope(sect,s.x,s.y);
                x = getceilzofslope(sect,s.x,s.y);
                if(x == l || sect < 0 || sect >= MAXSECTORS) {deletesprite(i); i = nexti; continue;}

                if( s.z < l-(2<<8) )
                {
                    if(t[1] < 2) t[1]++;
                    else if(sector[sect].lotag != 2)
                    {
                        t[1] = 0;
                        if( s.picnum == DUKELEG || s.picnum == DUKETORSO || s.picnum == DUKEGUN )
                        {
                            if(t[0] > 6) t[0] = 0;
                            else t[0]++;
                        }
                        else
                        {
                            if(t[0] > 2)
                                t[0] = 0;
                            else t[0]++;
                        }
                    }

                    if(s.zvel < 6144)
                    {
                        if(sector[sect].lotag == 2)
                        {
                            if(s.zvel < 1024)
                                s.zvel += 48;
                            else s.zvel = 1024;
                        }
                        else s.zvel += gc-50;
                    }

                    s.x += (s.xvel*sintable[(s.ang+512)&2047])>>14;
                    s.y += (s.xvel*sintable[s.ang&2047])>>14;
                    s.z += s.zvel;

                }
                else
                {
                    if(t[2] == 0)
                    {
                        if( s.sectnum == -1) { {deletesprite(i); i = nexti; continue;} }
                        if( (sector[s.sectnum].floorstat&2) ) { {deletesprite(i); i = nexti; continue;} }
                        t[2]++;
                    }
                    l = getflorzofslope(s.sectnum,s.x,s.y);

                    s.z = l-(2<<8);
                    s.xvel = 0;

                    if(s.picnum == JIBS6)
                    {
                        t[1]++;
                        if( (t[1]&3) == 0 && t[0] < 7)
                            t[0]++;
                        if(t[1] > 20) {deletesprite(i); i = nexti; continue;}
                    }
                    else { s.picnum = JIBS6; t[0] = 0; t[1] = 0; }
                }
                {i = nexti; continue;}

            case BLOODPOOL:
            case PUKE:

                if(t[0] == 0)
                {
                    t[0] = 1;
                    if(sector[sect].floorstat&2) { {deletesprite(i); i = nexti; continue;} }
                    else insertspriteq(i);
                }

                makeitfall(i);
                var xRef = new Ref(x);
                p = findplayer(s,xRef);
                x = xRef.$;

                s.z = hittype[i].floorz-(FOURSLEIGHT);

                if(t[2] < 32)
                {
                    t[2]++;
                    if(hittype[i].picnum == TIRE)
                    {
                        if(s.xrepeat < 64 && s.yrepeat < 64)
                        {
                            s.xrepeat += krand()&3;
                            s.yrepeat += krand()&3;
                        }
                    }
                    else
                    {
                        if(s.xrepeat < 32 && s.yrepeat < 32)
                        {
                            s.xrepeat += krand()&3;
                            s.yrepeat += krand()&3;
                        }
                    }
                }

                if(x < 844 && s.xrepeat > 6 && s.yrepeat > 6)
                {
                    if( s.pal == 0 && (krand()&255) < 16 && s.picnum != PUKE)
                    {
                        if(ps[p].boot_amount > 0)
                            ps[p].boot_amount--;
                        else
                        {
                            if(Sound[DUKE_LONGTERM_PAIN].num < 1)
                                spritesound(DUKE_LONGTERM_PAIN,ps[p].i);
                            sprite[ps[p].i].extra --;
                            ps[p].pals_time = 32;
                            ps[p].pals[0] = 16;
                            ps[p].pals[1] = 0;
                            ps[p].pals[2] = 0;
                        }
                    }

                    if(t[1] == 1) {i = nexti; continue;}
                    t[1] = 1;

                    if(hittype[i].picnum == TIRE)
                        ps[p].footprintcount = 10;
                    else ps[p].footprintcount = 3;

                    ps[p].footprintpal = s.pal;
                    ps[p].footprintshade = s.shade;

                    if(t[2] == 32)
                    {
                        s.xrepeat -= 6;
                        s.yrepeat -= 6;
                    }
                }
                else t[1] = 0;
                {i = nexti; continue;}

            case BURNING:
            case BURNING2:
            case FECES:
            case WATERBUBBLE:
            case SMALLSMOKE:
            case EXPLOSION2:
            case SHRINKEREXPLOSION:
            case EXPLOSION2BOT:
            case BLOOD:
            case LASERSITE:
            case FORCERIPPLE:
            case TRANSPORTERSTAR:
            case TRANSPORTERBEAM:
                var xRef = new Ref(x);
                p = findplayer(s,xRef);
                x = xRef.$;
                execute(i,p,x);
                {i = nexti; continue;}

            case SHELL:
            case SHOTGUNSHELL:

                ssp(i,CLIPMASK0);

                if(sect < 0 || ( sector[sect].floorz+(24<<8) ) < s.z ) {deletesprite(i); i = nexti; continue;}

                if(sector[sect].lotag == 2)
                {
                    t[1]++;
                    if(t[1] > 8)
                    {
                        t[1] = 0;
                        t[0]++;
                        t[0] &= 3;
                    }
                    if(s.zvel < 128) s.zvel += ((gc/13)|0); // 8
                    else s.zvel -= 64;
                    if(s.xvel > 0)
                        s.xvel -= 4;
                    else s.xvel = 0;
                }
                else
                {
                    t[1]++;
                    if(t[1] > 3)
                    {
                        t[1] = 0;
                        t[0]++;
                        t[0] &= 3;
                    }
                    if(s.zvel < 512) s.zvel += ((gc/3)|0); // 52;
                    if(s.xvel > 0)
                        s.xvel --;
                    else {deletesprite(i); i = nexti; continue;}
                }

                {i = nexti; continue;}

            case GLASSPIECES:
            case GLASSPIECES+1:
            case GLASSPIECES+2:

                makeitfall(i);

                if(s.zvel > 4096) s.zvel = 4096;
                if(sect < 0) {deletesprite(i); i = nexti; continue;}

                if( s.z == hittype[i].floorz-(FOURSLEIGHT) && t[0] < 3)
                {
                    s.zvel = -((3-t[0])<<8)-(krand()&511);
                    if(sector[sect].lotag == 2)
                        s.zvel >>= 1;
                    s.xrepeat >>= 1;
                    s.yrepeat >>= 1;
                    if( rnd(96) )
                        setsprite(i,s.x,s.y,s.z);
                    t[0]++;//Number of bounces
                }
                else if( t[0] == 3 ) {deletesprite(i); i = nexti; continue;}

                if(s.xvel > 0)
                {
                    s.xvel -= 2;
                    s.cstat = ((s.xvel&3)<<2);
                }
                else s.xvel = 0;

                ssp(i,CLIPMASK0);

                {i = nexti; continue;}
        }

        if ((sprite[i].picnum) >= (SCRAP6) && (sprite[i].picnum) <= (SCRAP5 + 3))
        {
            if(s.xvel > 0)
                s.xvel--;
            else s.xvel = 0;

            if(s.zvel > 1024 && s.zvel < 1280)
            {
                setsprite(i,s.x,s.y,s.z);
                sect = s.sectnum;
            }

            if( s.z < sector[sect].floorz-(2<<8) )
            {
                if(t[1] < 1) t[1]++;
                else
                {
                    t[1] = 0;

                    if(s.picnum < SCRAP6+8)
                    {
                        if(t[0] > 6)
                            t[0] = 0;
                        else t[0]++;
                    }
                    else
                    {
                        if(t[0] > 2)
                            t[0] = 0;
                        else t[0]++;
                    }
                }
                if(s.zvel < 4096) s.zvel += gc-50;
                s.x += (s.xvel*sintable[(s.ang+512)&2047])>>14;
                s.y += (s.xvel*sintable[s.ang&2047])>>14;
                s.z += s.zvel;
            }
            else
            {
                if(s.picnum == SCRAP1 && s.yvel > 0)
                {
                    j = spawn(i,s.yvel);
                    setsprite(j,s.x,s.y,s.z);
                    getglobalz(j);
                    sprite[j].hitag = sprite[j].lotag = 0;
                }
                {deletesprite(i); i = nexti; continue;}
            }
            {i = nexti; continue;}
        }

        //BOLT:
            i = nexti;
    }
}