'use strict';

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
