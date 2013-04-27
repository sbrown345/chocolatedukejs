'use strict';

var Player = {};

//34
Player.setPal = setpal;
function setpal(p) {
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

//52
function incur_damage(p) {
    var damage = 0, shield_damage = 0;

    sprite[p.i].extra -= p.extra_extra8 >> 8;

    damage = sprite[p.i].extra - p.last_extra;

    if (damage < 0) {
        p.extra_extra8 = 0;

        if (p.shield_amount > 0) {
            shield_damage = (damage * (20 + (krand() % 30)) / 100) | 0;
            damage -= shield_damage;

            p.shield_amount += shield_damage;

            if (p.shield_amount < 0) {
                damage += p.shield_amount;
                p.shield_amount = 0;
            }
        }

        sprite[p.i].extra = p.last_extra + damage;
    }
}

//107

function tracers( x1, y1, z1, x2, y2, z2, n) {
     var i, xv, yv, zv;
    var sect = -1;

    i = n+1;
    xv = ((x2-x1)/i)|0;
    yv = ((y2-y1)/i)|0;
    zv = ((z2-z1)/i)|0;

    if( ( klabs(x1-x2)+klabs(y1-y2) ) < 3084 )
        return;

    var sectRef = new Ref(sect);
    for(i=n;i>0;i--)
    {
        x1 += xv;
        y1 += yv;
        z1 += zv;
        sectRef.$ = sect;
        updatesector(x1,y1,sectRef);
        sect = sectRef.$;
        if(sect >= 0)
        {
            if (sector[sect].lotag == 2) {
                // TRAND is a macro, so need to reverse these so it matches original (i guess?)
                var rand1 = TRAND;
                var rand2 = TRAND;
                var rand3 = TRAND;
                EGS(sect, x1, y1, z1, WATERBUBBLE, -32, 4 + (rand3 & 3), 4 + (rand2 & 3), rand1 & 2047, 0, 0, ps[0].i, 5);
            } else
                EGS(sect, x1, y1, z1, SMALLSMOKE, -32, 14, 14, 0, 0, 0, ps[0].i, 5);
        }
    }
}

//137
function hits(i) {
    var sx = new Ref(),sy = new Ref(),sz = new Ref();
    var sect = new Ref(),hw = new Ref(),hs = new Ref();
    var zoff;

    if(sprite[i].picnum == APLAYER) zoff = (40<<8);
    else zoff = 0;

    hitscan(sprite[i].x,sprite[i].y,sprite[i].z-zoff,sprite[i].sectnum,
        sintable[(sprite[i].ang+512)&2047],
        sintable[sprite[i].ang&2047],
        0,sect,hw,hs,sx,sy,sz,CLIPMASK1);
    
    return (FindDistance2D(sx.$ - sprite[i].x, sy.$ - sprite[i].y));
}

function hitasprite( i, hitsp) {
    console.assert(hitsp instanceof Ref);
    var sx = new Ref(), sy = new Ref(), sz = new Ref(), zoff;
    var sect = new Ref(), hw = new Ref();

    if(badguy(sprite[i]) )
        zoff = (42<<8);
    else if(sprite[i].picnum == APLAYER) zoff = (39<<8);
    else zoff = 0;


    hitscan(sprite[i].x,sprite[i].y,sprite[i].z-zoff,sprite[i].sectnum,
        sintable[(sprite[i].ang+512)&2047],
        sintable[sprite[i].ang&2047],
        0,sect,hw,hitsp,sx,sy,sz,CLIPMASK1);

    if (hw.$ >= 0 && (wall[hw.$].cstat & 16) && badguy(sprite[i]))
        return((1<<30));

    return (FindDistance2D(sx.$ - sprite[i].x, sy.$ - sprite[i].y));
}


function hitawall(p, hitw) {
    console.assert(hitw instanceof Ref);
    var sx = new Ref(), sy = new Ref(), sz = new Ref();
    var sect = new Ref(), hs = new Ref();

    hitscan(p.posx, p.posy, p.posz, p.cursectnum,
        sintable[(p.ang + 512) & 2047],
        sintable[p.ang & 2047],
        0, sect, hitw, hs, sx, sy, sz, CLIPMASK0);

    return (FindDistance2D(sx.$ - p.posx, sy.$ - p.posy));
}

//203
function aim(s, aang, auto_aim) {
    var  gotshrinker,gotfreezer;
    var i, j, a, k, cans;
    var aimstats = [10,13,1,2];
    var dx1, dy1, dx2, dy2, dx3, dy3, smax, sdist;
    var xv, yv;

    a = s.ang;

    j = -1;
    //    if(s.picnum == APLAYER && ps[s.yvel].aim_mode) return -1;

    gotshrinker = s.picnum == APLAYER && ps[s.yvel].curr_weapon == SHRINKER_WEAPON;
    gotfreezer = s.picnum == APLAYER && ps[s.yvel].curr_weapon == FREEZE_WEAPON;

    smax = 0x7fffffff;

    dx1 = sintable[(a+512-aang)&2047];
    dy1 = sintable[(a-aang)&2047];
    dx2 = sintable[(a+512+aang)&2047];
    dy2 = sintable[(a+aang)&2047];

    dx3 = sintable[(a+512)&2047];
    dy3 = sintable[a&2047];

    // FIX_00015: Backward compliance with older demos (down to demos v27, 28, 116 and 117 only)

    //if player has AutoAim ON do the function.
    if((auto_aim && nHostForceDisableAutoaim == 0)||
        ud.playing_demo_rev == BYTEVERSION_27     ||
        ud.playing_demo_rev == BYTEVERSION_28     || 
        ud.playing_demo_rev == BYTEVERSION_116    || 
        ud.playing_demo_rev == BYTEVERSION_117) 
        // don't disable any autoaim in case we are playing an old demo
    {
        for(k=0;k<4;k++)
        {
            if( j >= 0 )
                break;
            for(i=headspritestat[aimstats[k]];i >= 0;i=nextspritestat[i])
                if( sprite[i].xrepeat > 0 && sprite[i].extra >= 0 && (sprite[i].cstat&(257+32768)) == 257)
                    if( badguy(sprite[i]) || k < 2 )
                    {
                        if(badguy(sprite[i]) || sprite[i].picnum == APLAYER || sprite[i].picnum == SHARK)
                        {
                            if( sprite[i].picnum == APLAYER &&
                                //							  ud.ffire == 0 &&
							    ud.coop == 1 &&
							    s.picnum == APLAYER &&
							    s != sprite[i])
                                continue;
	
                            if(gotshrinker && sprite[i].xrepeat < 30 )
                            {
                                switch(sprite[i].picnum)
                                {
                                    case SHARK:
                                        if(sprite[i].xrepeat < 20) continue;
                                        continue;
                                    case GREENSLIME:
                                    case GREENSLIME+1:
                                    case GREENSLIME+2:
                                    case GREENSLIME+3:
                                    case GREENSLIME+4:
                                    case GREENSLIME+5:
                                    case GREENSLIME+6:
                                    case GREENSLIME+7:
                                        break;
                                    default:
                                        continue;
                                }
                            }
                            if(gotfreezer && sprite[i].pal == 1) continue;
                        }
	
                        xv = (sprite[i].x-s.x);
                        yv = (sprite[i].y-s.y);
	
                        if( (dy1*xv) <= (dx1*yv) )
                            if( ( dy2*xv ) >= (dx2*yv) )
                            {
                                sdist = mulscale(dx3,xv,14) + mulscale(dy3,yv,14);
                                if( sdist > 512 && sdist < smax )
                                {
                                    if(s.picnum == APLAYER)
                                        a = (klabs(scale(sprite[i].z-s.z,10,sdist)-(ps[s.yvel].horiz+ps[s.yvel].horizoff-100)) < 100);
                                    else a = 1;
	
                                    if(sprite[i].picnum == ORGANTIC || sprite[i].picnum == ROTATEGUN )
                                        cans = cansee(sprite[i].x,sprite[i].y,sprite[i].z,sprite[i].sectnum,s.x,s.y,s.z-(32<<8),s.sectnum);
                                    else cans = cansee(sprite[i].x,sprite[i].y,sprite[i].z-(32<<8),sprite[i].sectnum,s.x,s.y,s.z-(32<<8),s.sectnum);
	
                                    if( a && cans )
                                    {
                                        smax = sdist;
                                        j = i;
                                    }
                                }
                            }
                    }
        }
    }

    return j;
}


//313
function shoot(i,atwith) {
    var sect, hitsect, hitspr, hitwall, l, sa, p, j, k, scount;
    var sx, sy, sz, vel, zvel, hitx, hity, hitz, x, xRef = new Ref(), oldzvel, dal;
    var  sizx,sizy;
    var s;

    s = sprite[i];
    sect = s.sectnum;
    zvel = 0;

    if( s.picnum == APLAYER )
    {
        p = s.yvel;

        sx = ps[p].posx;
        sy = ps[p].posy;
        sz = ps[p].posz+ps[p].pyoff+(4<<8);
        sa = ps[p].ang;

        ps[p].crack_time = 777;

    }
    else
    {
        p = -1;
        sa = s.ang;
        sx = s.x;
        sy = s.y;
        sz = s.z-((s.yrepeat*tiles[s.picnum].dim.height)<<1)+(4<<8);
        if(s.picnum != ROTATEGUN)
        {
            sz -= (7<<8);
            if(badguy(s) && sprite[i].picnum != COMMANDER)
            {
                sx += (sintable[(sa+1024+96)&2047]>>7);
                sy += (sintable[(sa+512+96)&2047]>>7);
            }
        }
    }
    console.log("atwith: %i, i: %i", atwith, i);
    console.log("start shoot headspritesect[137]: %i", headspritesect[137]);

    switch(atwith)
    {
        case BLOODSPLAT1:
        case BLOODSPLAT2:
        case BLOODSPLAT3:
        case BLOODSPLAT4:

            if(p >= 0)
                sa += 64 - (TRAND&127);
            else sa += 1024 + 64 - (TRAND&127);
            zvel = 1024-(TRAND&2047);
        case KNEE:
            if(atwith == KNEE )
            {
                if(p >= 0)
                {
                    zvel = (100-ps[p].horiz-ps[p].horizoff)<<5;
                    sz += (6<<8);
                    sa += 15;
                }
                else {
                    xRef.$ = x;
                    j = ps[findplayer(s,xRef)].i;
                    x = xRef.$;
                    zvel = (( (sprite[j].z-sz)<<8 ) / (x+1))|0;
                    sa = getangle(sprite[j].x-sx,sprite[j].y-sy);
                }
            }
            var hitsectRef = new Ref(hitsect);
            var hitwallRef = new Ref(hitwall);
            var hitsprRef = new Ref(hitspr);
            var hitxRef = new Ref(hitx);
            var hityRef = new Ref(hity);
            var hitzRef = new Ref(hitz);
            hitscan(sx,sy,sz,sect,
                sintable[(sa+512)&2047],
                sintable[sa&2047],zvel<<6,
                hitsectRef,hitwallRef,hitsprRef,hitxRef,hityRef,hitzRef,CLIPMASK1);
            hitsect = hitsectRef.$;
            hitwall = hitwallRef.$;
            hitspr = hitsprRef.$;
            hitx = hitxRef.$;
            hity = hityRef.$;
            hitz = hitzRef.$;

            if( atwith == BLOODSPLAT1 ||
                atwith == BLOODSPLAT2 ||
                atwith == BLOODSPLAT3 ||
                atwith == BLOODSPLAT4 )
            {
                if( FindDistance2D(sx-hitx,sy-hity) < 1024 )
                    if( hitwall >= 0 && wall[hitwall].overpicnum != BIGFORCE )
                        if( ( wall[hitwall].nextsector >= 0 && hitsect >= 0 &&
                            sector[wall[hitwall].nextsector].lotag == 0 &&
                                sector[hitsect].lotag == 0 &&
                                    sector[wall[hitwall].nextsector].lotag == 0 &&
                                        (sector[hitsect].floorz-sector[wall[hitwall].nextsector].floorz) > (16<<8) ) ||
                                            ( wall[hitwall].nextsector == -1 && sector[hitsect].lotag == 0 ) )
                            if( (wall[hitwall].cstat&16) == 0)
                            {
                                if(wall[hitwall].nextsector >= 0)
                                {
                                    k = headspritesect[wall[hitwall].nextsector];
                                    while(k >= 0)
                                    {
                                        if(sprite[k].statnum == 3 && sprite[k].lotag == 13)
                                            return;
                                        k = nextspritesect[k];
                                    }
                                }

                                if( wall[hitwall].nextwall >= 0 &&
                                    wall[wall[hitwall].nextwall].hitag != 0 )
                                    return;

                                if(wall[hitwall].hitag == 0)
                                {
                                    k = spawn(i,atwith);
                                    sprite[k].xvel = -12;
                                    sprite[k].ang = getangle(wall[hitwall].x-wall[wall[hitwall].point2].x,
                                        wall[hitwall].y-wall[wall[hitwall].point2].y)+512;
                                    sprite[k].x = hitx;
                                    sprite[k].y = hity;
                                    sprite[k].z = hitz;
                                    sprite[k].cstat |= (TRAND&4);
                                    ssp(k,CLIPMASK0);
                                    setsprite(k,sprite[k].x,sprite[k].y,sprite[k].z);
                                    if( sprite[i].picnum == OOZFILTER || sprite[i].picnum == NEWBEAST )
                                        sprite[k].pal = 6;
                                }
                            }
                return;
            }

            if(hitsect < 0) break;

            if( ( klabs(sx-hitx)+klabs(sy-hity) ) < 1024 )
            {
                if(hitwall >= 0 || hitspr >= 0)
                {
                    j = EGS(hitsect,hitx,hity,hitz,KNEE,-15,0,0,sa,32,0,i,4);
                    sprite[j].extra += (TRAND&7);
                    if(p >= 0)
                    {
                        k = spawn(j,SMALLSMOKE);
                        sprite[k].z -= (8<<8);
                        spritesound(KICK_HIT,j);
                    }

                    if ( p >= 0 && ps[p].steroids_amount > 0 && ps[p].steroids_amount < 400 )
                        sprite[j].extra += (max_player_health>>2);

                    if( hitspr >= 0 && sprite[hitspr].picnum != ACCESSSWITCH && sprite[hitspr].picnum != ACCESSSWITCH2 )
                    {
                        checkhitsprite(hitspr,j);
                        if(p >= 0) checkhitswitch(p,hitspr,1);
                    }

                    else if( hitwall >= 0 )
                    {
                        if( wall[hitwall].cstat&2 )
                            if(wall[hitwall].nextsector >= 0)
                                if(hitz >= (sector[wall[hitwall].nextsector].floorz) )
                                    hitwall = wall[hitwall].nextwall;

                        if( hitwall >= 0 && wall[hitwall].picnum != ACCESSSWITCH && wall[hitwall].picnum != ACCESSSWITCH2 )
                        {
                            checkhitwall(j,hitwall,hitx,hity,hitz,atwith);
                            if(p >= 0) checkhitswitch(p,hitwall,0);
                        }
                    }
                }
                else if(p >= 0 && zvel > 0 && sector[hitsect].lotag == 1)
                {
                    j = spawn(ps[p].i,WATERSPLASH2);
                    sprite[j].x = hitx;
                    sprite[j].y = hity;
                    sprite[j].ang = ps[p].ang; // Total tweek
                    sprite[j].xvel = 32;
                    ssp(i,CLIPMASK0);
                    sprite[j].xvel = 0;

                }
            }

            break;

        case SHOTSPARK1:
        case SHOTGUN:
        case CHAINGUN:

            if( s.extra >= 0 ) s.shade = -96;

            if(p >= 0)
            {
                j = aim( s, AUTO_AIM_ANGLE, ps[p].auto_aim!= 0 );
                if(j >= 0)
                {
                    dal = ((sprite[j].xrepeat*tiles[sprite[j].picnum].dim.height)<<1)+(5<<8);
                    switch(sprite[j].picnum)
                    {
                        case GREENSLIME:
                        case GREENSLIME+1:
                        case GREENSLIME+2:
                        case GREENSLIME+3:
                        case GREENSLIME+4:
                        case GREENSLIME+5:
                        case GREENSLIME+6:
                        case GREENSLIME+7:
                        case ROTATEGUN:
                            dal -= (8<<8);
                            break;
                    }
                    zvel = (( ( sprite[j].z-sz-dal )<<8 ) / ldist(sprite[ps[p].i], sprite[j]) )|0;
                    sa = getangle(sprite[j].x-sx,sprite[j].y-sy);
                }

                if(atwith == SHOTSPARK1)
                {
                    if(j == -1)
                    {
                        sa += 16-(TRAND&31);
                        zvel = (100-ps[p].horiz-ps[p].horizoff)<<5;
                        zvel += 128-(TRAND&255);
                    }
                }
                else
                {
                    sa += 16-(TRAND&31);
                    if(j == -1) zvel = (100-ps[p].horiz-ps[p].horizoff)<<5;
                    zvel += 128-(TRAND&255);
                }
                sz -= (2<<8);
            }
            else
            {
                xRef.$ = x;
                j = findplayer(s,xRef);
                x = xRef.$;
                sz -= (4<<8);
                zvel = (( (ps[j].posz-sz) <<8 ) / (ldist(sprite[ps[j].i], s ) )) | 0;
                if(s.picnum != BOSS1)
                {
                    zvel += 128-(TRAND&255);
                    sa += 32-(TRAND&63);
                }
                else
                {
                    zvel += 128-(TRAND&255);
                    sa = getangle(ps[j].posx-sx,ps[j].posy-sy)+64-(TRAND&127);
                }
            }

            s.cstat &= ~257;
            var hitsectRef = new Ref(hitsect);
            var hitwallRef = new Ref(hitwall);
            var hitsprRef = new Ref(hitspr);
            var hitxRef = new Ref(hitx);
            var hityRef = new Ref(hity);
            var hitzRef = new Ref(hitz);
            hitscan(sx,sy,sz,sect,
                sintable[(sa+512)&2047],
                sintable[sa&2047],
                zvel<<6,hitsectRef,hitwallRef,hitsprRef,hitxRef,hityRef,hitzRef,CLIPMASK1);
            hitsect = hitsectRef.$;
            hitwall = hitwallRef.$;
            hitspr = hitsprRef.$;
            hitx = hitxRef.$;
            hity = hityRef.$;
            hitz = hitzRef.$;
            s.cstat |= 257;

            if(hitsect < 0) return;

            if( (TRAND&15) == 0 && sector[hitsect].lotag == 2 )
                tracers(hitx,hity,hitz,sx,sy,sz,8-(ud.multimode>>1));

            if(p >= 0)
            {
                k = EGS(hitsect,hitx,hity,hitz,SHOTSPARK1,-15,10,10,sa,0,0,i,4);
                sprite[k].extra = script[actorscrptr[atwith]]; //*actorscrptr[atwith];
                sprite[k].extra += (TRAND%6);

                if( hitwall == -1 && hitspr == -1)
                {
                    if( zvel < 0 )
                    {
                        if( sector[hitsect].ceilingstat&1 )
                        {
                            sprite[k].xrepeat = 0;
                            sprite[k].yrepeat = 0;
                            return;
                        }
                        else
                            checkhitceiling(hitsect);
                    }
                    spawn(k,SMALLSMOKE);
                }

                if(hitspr >= 0)
                {
                    checkhitsprite(hitspr,k);
                    if( sprite[hitspr].picnum == APLAYER && (ud.coop != 1 || ud.ffire == 1) )
                    {
                        l = spawn(k,JIBS6);
                        sprite[k].xrepeat = sprite[k].yrepeat = 0;
                        sprite[l].z += (4<<8);
                        sprite[l].xvel = 16;
                        sprite[l].xrepeat = sprite[l].yrepeat = 24;
                        sprite[l].ang += 64-(TRAND&127);
                    }
                    else spawn(k,SMALLSMOKE);

                    if(p >= 0 && (
                        sprite[hitspr].picnum == DIPSWITCH ||
                        sprite[hitspr].picnum == DIPSWITCH+1 ||
                        sprite[hitspr].picnum == DIPSWITCH2 ||
                        sprite[hitspr].picnum == DIPSWITCH2+1 ||
                        sprite[hitspr].picnum == DIPSWITCH3 ||
                        sprite[hitspr].picnum == DIPSWITCH3+1 ||
                        sprite[hitspr].picnum == HANDSWITCH ||
                        sprite[hitspr].picnum == HANDSWITCH+1) )
                    {
                        checkhitswitch(p,hitspr,1);
                        return;
                    }
                }
                else if( hitwall >= 0 )
                {
                    for (;; ) {
                        
                        spawn(k,SMALLSMOKE);

                        if( isadoorwall(wall[hitwall].picnum) == 1 )
                            break;//goto SKIPBULLETHOLE;
                        if(p >= 0 && (
                            wall[hitwall].picnum == DIPSWITCH ||
                            wall[hitwall].picnum == DIPSWITCH+1 ||
                            wall[hitwall].picnum == DIPSWITCH2 ||
                            wall[hitwall].picnum == DIPSWITCH2+1 ||
                            wall[hitwall].picnum == DIPSWITCH3 ||
                            wall[hitwall].picnum == DIPSWITCH3+1 ||
                            wall[hitwall].picnum == HANDSWITCH ||
                            wall[hitwall].picnum == HANDSWITCH+1) )
                        {
                            checkhitswitch(p,hitwall,0);
                            return;
                        }

                        if(wall[hitwall].hitag != 0 || ( wall[hitwall].nextwall >= 0 && wall[wall[hitwall].nextwall].hitag != 0 ) )
                            break;//goto SKIPBULLETHOLE;

                        if( hitsect >= 0 && sector[hitsect].lotag == 0 )
                            if( wall[hitwall].overpicnum != BIGFORCE )
                                if( (wall[hitwall].nextsector >= 0 && sector[wall[hitwall].nextsector].lotag == 0 ) ||
                                    ( wall[hitwall].nextsector == -1 && sector[hitsect].lotag == 0 ) )
                                    if( (wall[hitwall].cstat&16) == 0)
                                    {
                                        if(wall[hitwall].nextsector >= 0)
                                        {
                                            l = headspritesect[wall[hitwall].nextsector];
                                            while(l >= 0)
                                            {
                                                if(sprite[l].statnum == 3 && sprite[l].lotag == 13)
                                                    break;//goto SKIPBULLETHOLE;
                                                l = nextspritesect[l];
                                            }
                                        }

                                        l = headspritestat[5];
                                        while(l >= 0)
                                        {
                                            if(sprite[l].picnum == BULLETHOLE)
                                                if(dist(sprite[l],sprite[k]) < (12+(TRAND&7)) )
                                                    break;//goto SKIPBULLETHOLE;
                                            l = nextspritestat[l];
                                        }
                                        l = spawn(k,BULLETHOLE);
                                        sprite[l].xvel = -1;
                                        sprite[l].ang = getangle(wall[hitwall].x-wall[wall[hitwall].point2].x,
                                            wall[hitwall].y-wall[wall[hitwall].point2].y)+512;
                                        ssp(l,CLIPMASK0);
                                    }
                        
                        break;
                    }
                    //SKIPBULLETHOLE:

                        if( wall[hitwall].cstat&2 )
                            if(wall[hitwall].nextsector >= 0)
                                if(hitz >= (sector[wall[hitwall].nextsector].floorz) )
                                    hitwall = wall[hitwall].nextwall;

                    checkhitwall(k,hitwall,hitx,hity,hitz,SHOTSPARK1);
                }
            }
            else
            {
                k = EGS(hitsect,hitx,hity,hitz,SHOTSPARK1,-15,24,24,sa,0,0,i,4);
                sprite[k].extra = script[actorscrptr[atwith]];// *actorscrptr[atwith];

                if( hitspr >= 0 )
                {
                    checkhitsprite(hitspr,k);
                    if( sprite[hitspr].picnum != APLAYER )
                        spawn(k,SMALLSMOKE);
                    else sprite[k].xrepeat = sprite[k].yrepeat = 0;
                }
                else if( hitwall >= 0 )
                    checkhitwall(k,hitwall,hitx,hity,hitz,SHOTSPARK1);
            }

            if( (TRAND&255) < 4 )
                xyzsound(PISTOL_RICOCHET,k,hitx,hity,hitz);

            return;

        case FIRELASER:
        case SPIT:
        case COOLEXPLOSION1:

            if( s.extra >= 0 ) s.shade = -96;

            scount = 1;
            if(atwith == SPIT) vel = 292;
            else
            {
                if(atwith == COOLEXPLOSION1)
                {
                    if(s.picnum == BOSS2) vel = 644;
                    else vel = 348;
                    sz -= (4<<7);
                }
                else
                {
                    vel = 840;
                    sz -= (4<<7);
                }
            }

            if(p >= 0)
            {
                j = aim( s, AUTO_AIM_ANGLE, ps[p].auto_aim==2 );
                if(j >= 0)
                {
                    dal = ((sprite[j].xrepeat*tiles[sprite[j].picnum].dim.height)<<1)-(12<<8);
                    zvel = (((sprite[j].z-sz-dal)*vel ) / ldist(sprite[ps[p].i], sprite[j]) )|0;
                    sa = getangle(sprite[j].x-sx,sprite[j].y-sy);
                }
                else
                    zvel = (100-ps[p].horiz-ps[p].horizoff)*98;
            }
            else
            {
                xRef.$ = x;
                j = findplayer(s,xRef);
                x = xRef.$;
                //                sa = getangle(ps[j].oposx-sx,ps[j].oposy-sy);
                sa += 16-(TRAND&31);
                zvel = (( ( (ps[j].oposz - sz + (3<<8) ) )*vel ) / ldist(sprite[ps[j].i],s))|0;
            }

            oldzvel = zvel;

            if(atwith == SPIT) { sizx = 18;sizy = 18,sz -= (10<<8); }
            else
            {
                if( atwith == FIRELASER )
                {
                    if(p >= 0)
                    {
                        
                        sizx = 34;
                        sizy = 34;
                    }
                    else
                    {
                        sizx = 18;
                        sizy = 18;
                    }
                }
                else
                {
                    sizx = 18;
                    sizy = 18;
                }
            }

            if(p >= 0) sizx = 7,sizy = 7;

            while(scount > 0)
            {
                j = EGS(sect,sx,sy,sz,atwith,-127,sizx,sizy,sa,vel,zvel,i,4);
                sprite[j].extra += (TRAND&7);

                if(atwith == COOLEXPLOSION1)
                {
                    sprite[j].shade = 0;
                    if(sprite[i].picnum == BOSS2)
                    {
                        l = sprite[j].xvel;
                        sprite[j].xvel = 1024;
                        ssp(j,CLIPMASK0);
                        sprite[j].xvel = l;
                        sprite[j].ang += 128-(TRAND&255);
                    }
                }

                sprite[j].cstat = 128;
                sprite[j].clipdist = 4;

                sa = s.ang+32-(TRAND&63);
                zvel = oldzvel+512-(TRAND&1023);

                scount--;
            }

            return;

        case FREEZEBLAST:
            sz += (3<<8);
        case RPG:

            if( s.extra >= 0 ) s.shade = -96;

            scount = 1;
            vel = 644;

            j = -1;

            if(p >= 0)
            {
                j = aim( s, 48, ps[p].auto_aim==2);
                if(j >= 0)
                {
                    dal = ((sprite[j].xrepeat*tiles[sprite[j].picnum].dim.height)<<1)+(8<<8);
                    zvel = (( (sprite[j].z-sz-dal)*vel ) / ldist(sprite[ps[p].i], sprite[j]))|0;
                    if( sprite[j].picnum != RECON )
                        sa = getangle(sprite[j].x-sx,sprite[j].y-sy);
                }
                else zvel = (100-ps[p].horiz-ps[p].horizoff)*81;
                if(atwith == RPG)
                    spritesound(RPG_SHOOT,i);

            }
            else
            {
                xRef.$ = x;
                j = findplayer(s,xRef);
                x = xRef.$;
                sa = getangle(ps[j].oposx-sx,ps[j].oposy-sy);
                if(sprite[i].picnum == BOSS3)
                    sz -= (32<<8);
                else if(sprite[i].picnum == BOSS2)
                {
                    vel += 128;
                    sz += 24<<8;
                }

                l = ldist(sprite[ps[j].i],s);
                zvel = (( (ps[j].oposz-sz)*vel) / l)|0;

                if( badguy(s) && (s.hitag&face_player_smart) )
                    sa = s.ang+(TRAND&31)-16;
            }

            if( p >= 0 && j >= 0)
                l = j;
            else l = -1;

            j = EGS(sect,
                sx+((sintable[(348+sa+512)&2047]/448)|0),
                sy+((sintable[(sa+348)&2047]/448)|0),
                sz-(1<<8),atwith,0,14,14,sa,vel,zvel,i,4);

            sprite[j].extra += (TRAND&7);
            if(atwith != FREEZEBLAST)
                sprite[j].yvel = l;
            else
            {
                sprite[j].yvel = numfreezebounces;
                sprite[j].xrepeat >>= 1;
                sprite[j].yrepeat >>= 1;
                sprite[j].zvel -= (2<<4);
            }

            if(p == -1)
            {
                if(sprite[i].picnum == BOSS3)
                {
                    if(TRAND&1)
                    {
                        sprite[j].x -= sintable[sa&2047]>>6;
                        sprite[j].y -= sintable[(sa+1024+512)&2047]>>6;
                        sprite[j].ang -= 8;
                    }
                    else
                    {
                        sprite[j].x += sintable[sa&2047]>>6;
                        sprite[j].y += sintable[(sa+1024+512)&2047]>>6;
                        sprite[j].ang += 4;
                    }
                    sprite[j].xrepeat = 42;
                    sprite[j].yrepeat = 42;
                }
                else if(sprite[i].picnum == BOSS2)
                {
                    sprite[j].x -= (sintable[sa&2047]/56)|0;
                    sprite[j].y -= (sintable[(sa+1024+512)&2047]/56)|0;
                    sprite[j].ang -= 8+(TRAND&255)-128;
                    sprite[j].xrepeat = 24;
                    sprite[j].yrepeat = 24;
                }
                else if(atwith != FREEZEBLAST)
                {
                    sprite[j].xrepeat = 30;
                    sprite[j].yrepeat = 30;
                    sprite[j].extra >>= 2;
                }
            }
            else if(ps[p].curr_weapon == DEVISTATOR_WEAPON)
            {
                sprite[j].extra >>= 2;
                sprite[j].ang += 16-(TRAND&31);
                sprite[j].zvel += 256-(TRAND&511);

                if( ps[p].hbomb_hold_delay )
                {
                    sprite[j].x -= (sintable[sa&2047]/644)|0;
                    sprite[j].y -= (sintable[(sa+1024+512)&2047]/644)|0;
                }
                else
                {
                    sprite[j].x += sintable[sa&2047]>>8;
                    sprite[j].y += sintable[(sa+1024+512)&2047]>>8;
                }
                sprite[j].xrepeat >>= 1;
                sprite[j].yrepeat >>= 1;
            }

            sprite[j].cstat = 128;
            if(atwith == RPG)
                sprite[j].clipdist = 4;
            else
                sprite[j].clipdist = 40;

            break;

        case HANDHOLDINGLASER:

            if(p >= 0)
                zvel = (100-ps[p].horiz-ps[p].horizoff)*32;
            else zvel = 0;
            
            var hitsectRef = new Ref(hitsect);
            var hitwallRef = new Ref(hitwall);
            var hitsprRef = new Ref(hitspr);
            var hitxRef = new Ref(hitx);
            var hityRef = new Ref(hity);
            var hitzRef = new Ref(hitz);
            hitscan(sx,sy,sz-ps[p].pyoff,sect,
                sintable[(sa+512)&2047],
                sintable[sa&2047],
                zvel<<6,hitsectRef,hitwallRef,hitsprRef,hitxRef,hityRef,hitzRef,CLIPMASK1);
            hitsect = hitsectRef.$;
            hitwall = hitwallRef.$;
            hitspr = hitsprRef.$;
            hitx = hitxRef.$;
            hity = hityRef.$;
            hitz = hitzRef.$;

            j = 0;
            if(hitspr >= 0) break;

            if(hitwall >= 0 && hitsect >= 0)
                if( ((hitx-sx)*(hitx-sx)+(hity-sy)*(hity-sy)) < (290*290) )
                {
                    if( wall[hitwall].nextsector >= 0)
                    {
                        if( sector[wall[hitwall].nextsector].lotag <= 2 && sector[hitsect].lotag <= 2 )
                            j = 1;
                    }
                    else if( sector[hitsect].lotag <= 2 )
                        j = 1;
                }

            if(j == 1)
            {
                k = EGS(hitsect,hitx,hity,hitz,TRIPBOMB,-16,4,5,sa,0,0,i,6);

                sprite[k].hitag = k;
                spritesound(LASERTRIP_ONWALL,k);
                sprite[k].xvel = -20;
                ssp(k,CLIPMASK0);
                sprite[k].cstat = 16;
                hittype[k].temp_data[5] = sprite[k].ang = getangle(wall[hitwall].x-wall[wall[hitwall].point2].x,wall[hitwall].y-wall[wall[hitwall].point2].y)-512;

                if(p >= 0)
                    ps[p].ammo_amount[TRIPBOMB_WEAPON]--;

            }
            return;

        case BOUNCEMINE:
        case MORTER:

            if( s.extra >= 0 ) s.shade = -96;

            xRef.$ = x;
            j = ps[findplayer(s,xRef)].i;
            x = xRef.$;
            x = ldist(sprite[j],s);

            zvel = -x>>1;

            if(zvel < -4096)
                zvel = -2048;
            vel = x>>4;

            EGS(sect,
                sx+(sintable[(512+sa+512)&2047]>>8),
                sy+(sintable[(sa+512)&2047]>>8),
                sz+(6<<8),atwith,-64,32,32,sa,vel,zvel,i,1);
            break;

        case GROWSPARK:

            if(p >= 0)
            {
                j = aim( s, AUTO_AIM_ANGLE, ps[p].auto_aim==2);
                if(j >= 0)
                {
                    dal = ((sprite[j].xrepeat*tiles[sprite[j].picnum].dim.height)<<1)+(5<<8);
                    switch(sprite[j].picnum)
                    {
                        case GREENSLIME:
                        case GREENSLIME+1:
                        case GREENSLIME+2:
                        case GREENSLIME+3:
                        case GREENSLIME+4:
                        case GREENSLIME+5:
                        case GREENSLIME+6:
                        case GREENSLIME+7:
                        case ROTATEGUN:
                            dal -= (8<<8);
                            break;
                    }
                    zvel = (( ( sprite[j].z-sz-dal )<<8 ) / (ldist(sprite[ps[p].i], sprite[j]) ))|0;
                    sa = getangle(sprite[j].x-sx,sprite[j].y-sy);
                }
                else
                {
                    sa += 16-(TRAND&31);
                    zvel = (100-ps[p].horiz-ps[p].horizoff)<<5;
                    zvel += 128-(TRAND&255);
                }

                sz -= (2<<8);
            }
            else
            {
                xRef.$ = x;
                j = findplayer(s,xRef);
                x = xRef.$;
                sz -= (4<<8);
                zvel = (( (ps[j].posz-sz) <<8 ) / (ldist(sprite[ps[j].i], s ) ))|0;
                zvel += 128-(TRAND&255);
                sa += 32-(TRAND&63);
            }

            k = 0;

            //            RESHOOTGROW:

            s.cstat &= ~257;
            var hitsectRef = new Ref(hitsect);
            var hitwallRef = new Ref(hitwall);
            var hitsprRef = new Ref(hitspr);
            var hitxRef = new Ref(hitx);
            var hityRef = new Ref(hity);
            var hitzRef = new Ref(hitz);
            hitscan(sx,sy,sz,sect,
                sintable[(sa+512)&2047],
                sintable[sa&2047],
                zvel<<6,hitsectRef,hitwallRef,hitsprRef,hitxRef,hityRef,hitzRef,CLIPMASK1);
            hitsect = hitsectRef.$;
            hitwall = hitwallRef.$;
            hitspr = hitsprRef.$;
            hitx = hitxRef.$;
            hity = hityRef.$;
            hitz = hitzRef.$;

            s.cstat |= 257;

            j = EGS(sect,hitx,hity,hitz,GROWSPARK,-16,28,28,sa,0,0,i,1);

            sprite[j].pal = 2;
            sprite[j].cstat |= 130;
            sprite[j].xrepeat = sprite[j].yrepeat = 1;

            if( hitwall == -1 && hitspr == -1 && hitsect >= 0)
            {
                if( zvel < 0 && (sector[hitsect].ceilingstat&1) == 0)
                    checkhitceiling(hitsect);
            }
            else if(hitspr >= 0) checkhitsprite(hitspr,j);
            else if(hitwall >= 0 && wall[hitwall].picnum != ACCESSSWITCH && wall[hitwall].picnum != ACCESSSWITCH2 )
            {
                /*    if(wall[hitwall].overpicnum == MIRROR && k == 0)
                    {
                        l = getangle(
                            wall[wall[hitwall].point2].x-wall[hitwall].x,
                            wall[wall[hitwall].point2].y-wall[hitwall].y);
    
                        sx = hitx;
                        sy = hity;
                        sz = hitz;
                        sect = hitsect;
                        sa = ((l<<1) - sa)&2047;
                        sx += sintable[(sa+512)&2047]>>12;
                        sy += sintable[sa&2047]>>12;
    
                        k++;
                        goto RESHOOTGROW;
                    }
                    else */
                checkhitwall(j,hitwall,hitx,hity,hitz,atwith);
            }

            break;
        case SHRINKER:
            if( s.extra >= 0 ) s.shade = -96;
            if(p >= 0)
            {
                j = aim( s, AUTO_AIM_ANGLE, ps[p].auto_aim==2);
                if(j >= 0)
                {
                    dal = ((sprite[j].xrepeat*tiles[sprite[j].picnum].dim.height)<<1);
                    zvel = (( (sprite[j].z-sz-dal-(4<<8))*768) / (ldist( sprite[ps[p].i], sprite[j])))|0;
                    sa = getangle(sprite[j].x-sx,sprite[j].y-sy);
                }
                else zvel = (100-ps[p].horiz-ps[p].horizoff)*98;
            }
            else if(s.statnum != 3)
            {
                xRef.$ = x;
                j = findplayer(s,xRef);
                x = xRef.$;
                l = ldist(sprite[ps[j].i],s);
                zvel = (( (ps[j].oposz-sz)*512) / l )|0;
            }
            else zvel = 0;

            j = EGS(sect,
                sx+(sintable[(512+sa+512)&2047]>>12),
                sy+(sintable[(sa+512)&2047]>>12),
                sz+(2<<8),SHRINKSPARK,-16,28,28,sa,768,zvel,i,4);

            sprite[j].cstat = 128;
            sprite[j].clipdist = 32;


            return;
    }
    console.log("end shoot headspritesect[137]: %i", headspritesect[137]);
    return;
}

//1117
function displayloogie(snum) {
    var i, a, x, y, z;

    if(ps[snum].loogcnt == 0) return;

    y = (ps[snum].loogcnt<<2);
    for(i=0;i<ps[snum].numloogs;i++)
    {
        a = klabs(sintable[((ps[snum].loogcnt+i)<<5)&2047])>>5;
        z = 4096+((ps[snum].loogcnt+i)<<9);
        x = (-sync[snum].avel)+(sintable[((ps[snum].loogcnt+i)<<6)&2047]>>10);

        rotatesprite(
            (ps[snum].loogiex[i]+x)<<16,(200+ps[snum].loogiey[i]-y)<<16,z-(i<<8),256-a,
            LOOGIE,0,0,2,0,0,xdim-1,ydim-1);
    }
}

//1136

function animatefist(gs, snum) {
    var looking_arc, fisti, fistpal;
    var fistzoom, fistz;

    fisti = ps[snum].fist_incs;
    if (fisti > 32) fisti = 32;
    if (fisti <= 0) return 0;
    looking_arc = (klabs(ps[snum].look_ang) / 9) | 0;

    fistzoom = 65536 - (sintable[(512 + (fisti << 6)) & 2047] << 2);
    if (fistzoom > 90612)
        fistzoom = 90612;
    if (fistzoom < 40920)
        fistzoom = 40290;
    fistz = 194 + (sintable[((6 + fisti) << 7) & 2047] >> 9);

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

//1167
function  animateknee(gs,snum) {
    var knee_y = [0,-8,-16,-32,-64,-84,-108,-108,-108,-72,-32,-8];
    var looking_arc, pal;

    if(ps[snum].knee_incs > 11 || ps[snum].knee_incs == 0 || sprite[ps[snum].i].extra <= 0) return 0;

    looking_arc = (knee_y[ps[snum].knee_incs] + klabs(ps[snum].look_ang) / 9) | 0;

    looking_arc -= (ps[snum].hard_landing<<3);

    if(sprite[ps[snum].i].pal == 1)
        pal = 1;
    else
    {
        pal = sector[ps[snum].cursectnum].floorpal;
        if(pal == 0)
            pal = ps[snum].palookup;
    }

    myospal(105+(sync[snum].avel>>4)-(ps[snum].look_ang>>1)+(knee_y[ps[snum].knee_incs]>>2),looking_arc+280-((ps[snum].horiz-ps[snum].horizoff)>>4),KNEE,gs,4,pal);

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

//1241

function  animatetip( gs, snum)
{
    var p, looking_arc;
    var tip_y = [0,-8,-16,-32,-64,-84,-108,-108,-108,-108,-108,-108,-108,-108,-108,-108,-96,-72,-64,-32,-16];

    if(ps[snum].tipincs == 0) return 0;

    looking_arc = (klabs(ps[snum].look_ang) / 9) | 0;
    looking_arc -= (ps[snum].hard_landing<<3);

    if(sprite[ps[snum].i].pal == 1)
        p = 1;
    else
        p = sector[ps[snum].cursectnum].floorpal;

    /*    if(ps[snum].access_spritenum >= 0)
            p = sprite[ps[snum].access_spritenum].pal;
        else
            p = wall[ps[snum].access_wallnum].pal;
      */
    myospal(170+(sync[snum].avel>>4)-(ps[snum].look_ang>>1),
        (tip_y[ps[snum].tipincs]>>1)+looking_arc+240-((ps[snum].horiz-ps[snum].horizoff)>>4),TIP+((26-ps[snum].tipincs)>>4),gs,0,p);

    return 1;
}

//1267
function animateaccess(gs,snum) {
    var access_y = [0,-8,-16,-32,-64,-84,-108,-108,-108,-108,-108,-108,-108,-108,-108,-108,-96,-72,-64,-32,-16];
    var looking_arc;
    var  p;

    if(ps[snum].access_incs == 0 || sprite[ps[snum].i].extra <= 0) return 0;

    looking_arc = (access_y[ps[snum].access_incs] + klabs(ps[snum].look_ang) / 9) | 0;
    looking_arc -= (ps[snum].hard_landing<<3);

    if(ps[snum].access_spritenum >= 0)
        p = sprite[ps[snum].access_spritenum].pal;
    else p = 0;
    //    else
    //        p = wall[ps[snum].access_wallnum].pal;

    if((ps[snum].access_incs-3) > 0 && (ps[snum].access_incs-3)>>3)
        myospal(170+(sync[snum].avel>>4)-(ps[snum].look_ang>>1)+(access_y[ps[snum].access_incs]>>2),looking_arc+266-((ps[snum].horiz-ps[snum].horizoff)>>4),HANDHOLDINGLASER+(ps[snum].access_incs>>3),gs,0,p);
    else
        myospal(170+(sync[snum].avel>>4)-(ps[snum].look_ang>>1)+(access_y[ps[snum].access_incs]>>2),looking_arc+266-((ps[snum].horiz-ps[snum].horizoff)>>4),HANDHOLDINGACCESS,gs,4,p);

    return 1;
}


//1294

var fistsign;

function displayweapon(snum) {
    var gun_pos, looking_arc, cw;
    var weapon_xoffset, i, j;
    var  o,pal;
    var gs;
    var p;

    p = ps[snum];

    o = 0;

    printf("displayweapon: %i\n", snum);
    looking_arc = (klabs(p.look_ang) / 9) | 0;

    gs = sprite[p.i].shade;
    if(gs > 24) gs = 24;

    if(p.newowner >= 0 || ud.camerasprite >= 0 || p.over_shoulder_on > 0 || (sprite[p.i].pal != 1 && sprite[p.i].extra <= 0) || animatefist(gs,snum) || animateknuckles(gs,snum) || animatetip(gs,snum) || animateaccess(gs,snum) )
        return;
    
    animateknee(gs,snum);

    gun_pos = 80-(p.weapon_pos*p.weapon_pos);

    weapon_xoffset =  (160)-90;
    weapon_xoffset -= (((sintable[((p.weapon_sway>>1)+512)&2047]/(1024+512)))|0);
    weapon_xoffset -= 58 + p.weapon_ang;
    if (sprite[p.i].xrepeat < 32)
        gun_pos -= klabs(sintable[(p.weapon_sway<<2)&2047]>>9);
    else gun_pos -= klabs(sintable[(p.weapon_sway>>1)&2047]>>10);

    gun_pos -= (p.hard_landing<<3);

    if(p.last_weapon >= 0)
        cw = p.last_weapon;
    else cw = p.curr_weapon;

    j = 14-p.quick_kick;
    if(j != 14)
    {
        if(sprite[p.i].pal == 1)
            pal = 1;
        else
        {
            pal = sector[p.cursectnum].floorpal;
            if(pal == 0)
                pal = p.palookup;
        }


        if( j < 5 || j > 9 )
            myospal(weapon_xoffset+80-(p.look_ang>>1),
                looking_arc+250-gun_pos,KNEE,gs,o|4,pal);
        else myospal(weapon_xoffset+160-16-(p.look_ang>>1),
            looking_arc+214-gun_pos,KNEE+1,gs,o|4,pal);
    }

    if( sprite[p.i].xrepeat < 40 )
    {
        if(p.jetpack_on == 0 )
        {
            i = sprite[p.i].xvel;
            looking_arc += 32-(i>>1);
            fistsign += i>>1;
        }
        cw = weapon_xoffset;
        weapon_xoffset += sintable[(fistsign)&2047]>>10;
        myos(weapon_xoffset+250-(p.look_ang>>1),
             looking_arc+258-(klabs(sintable[(fistsign)&2047]>>8)),
             FIST,gs,o);
        weapon_xoffset = cw;
        weapon_xoffset -= sintable[(fistsign)&2047]>>10;
        printf("weapon_xoffset xrepeat<40: %i\n", weapon_xoffset);
        myos(weapon_xoffset + 40 - (p.look_ang >> 1),
             looking_arc+200+(klabs(sintable[(fistsign)&2047]>>8)),
             FIST,gs,o|4);
    }
    else 
    {	
        // FIX_00026: Weapon can now be hidden (on your screen only).
        if(!ud.hideweapon || cw==KNEE_WEAPON || cw == HANDREMOTE_WEAPON)
        {
            switch(cw)
            {
                case KNEE_WEAPON:
                    if( (p.kickback_pic) > 0 )
                    {
                        if(sprite[p.i].pal == 1)
                            pal = 1;
                        else
                        {
                            pal = sector[p.cursectnum].floorpal;
                            if(pal == 0)
                                pal = p.palookup;
                        }

                        if( (p.kickback_pic) < 5 || (p.kickback_pic) > 9 )
                            myospal(weapon_xoffset+220-(p.look_ang>>1),
                                looking_arc+250-gun_pos,KNEE,gs,o,pal);
                        else
                            myospal(weapon_xoffset+160-(p.look_ang>>1),
                            looking_arc+214-gun_pos,KNEE+1,gs,o,pal);
                    }
                    break;

                case TRIPBOMB_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;

                    weapon_xoffset += 8;
                    gun_pos -= 10;

                    if((p.kickback_pic) > 6)
                        looking_arc += ((p.kickback_pic)<<3);
                    else if((p.kickback_pic) < 4)
                        myospal(weapon_xoffset+142-(p.look_ang>>1),
                                looking_arc+234-gun_pos,HANDHOLDINGLASER+3,gs,o,pal);

                    myospal(weapon_xoffset+130-(p.look_ang>>1),
                            looking_arc+249-gun_pos,
                            HANDHOLDINGLASER+((p.kickback_pic)>>2),gs,o,pal);
                    myospal(weapon_xoffset+152-(p.look_ang>>1),
                            looking_arc+249-gun_pos,
                            HANDHOLDINGLASER+((p.kickback_pic)>>2),gs,o|4,pal);

                    break;

                case RPG_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else pal = sector[p.cursectnum].floorpal;

                    weapon_xoffset -= sintable[(768+((p.kickback_pic)<<7))&2047]>>11;
                    gun_pos += sintable[(768+((p.kickback_pic)<<7)&2047)]>>11;

                    if(p.kickback_pic > 0)
                    {
                        if(p.kickback_pic < 8)
                        {
                            myospal(weapon_xoffset+164,(looking_arc<<1)+176-gun_pos,
                                    RPGGUN+((p.kickback_pic)>>1),gs,o,pal);
                        }
                    }

                    myospal(weapon_xoffset+164,(looking_arc<<1)+176-gun_pos,
                            RPGGUN,gs,o,pal);

                    break;

                case SHOTGUN_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;

                    weapon_xoffset -= 8;

                    switch(p.kickback_pic)
                    {
                        case 1:
                        case 2:
                            myospal(weapon_xoffset+168-(p.look_ang>>1),looking_arc+201-gun_pos,
                            SHOTGUN+2,-128,o,pal);
                        case 0:
                        case 6:
                        case 7:
                        case 8:
                            myospal(weapon_xoffset+146-(p.look_ang>>1),looking_arc+202-gun_pos,
                                SHOTGUN,gs,o,pal);
                            break;
                        case 3:
                        case 4:
                        case 5:
                        case 9:
                        case 10:
                        case 11:
                        case 12:
                            if( p.kickback_pic > 1 && p.kickback_pic < 5 )
                            {
                                gun_pos -= 40;
                                weapon_xoffset += 20;

                                myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+194-gun_pos,
                                    SHOTGUN+1+((p.kickback_pic-1)>>1),-128,o,pal);
                            }

                            myospal(weapon_xoffset+158-(p.look_ang>>1),looking_arc+220-gun_pos,
                                SHOTGUN+3,gs,o,pal);

                            break;
                        case 13:
                        case 14:
                        case 15:
                            myospal(32+weapon_xoffset+166-(p.look_ang>>1),looking_arc+210-gun_pos,
                                SHOTGUN+4,gs,o,pal);
                            break;
                        case 16:
                        case 17:
                        case 18:
                        case 19:
                            myospal(64+weapon_xoffset+170-(p.look_ang>>1),looking_arc+196-gun_pos,
                                SHOTGUN+5,gs,o,pal);
                            break;
                        case 20:
                        case 21:
                        case 22:
                        case 23:
                            myospal(64+weapon_xoffset+176-(p.look_ang>>1),looking_arc+196-gun_pos,
                                SHOTGUN+6,gs,o,pal);
                            break;
                        case 24:
                        case 25:
                        case 26:
                        case 27:
                            myospal(64+weapon_xoffset+170-(p.look_ang>>1),looking_arc+196-gun_pos,
                                SHOTGUN+5,gs,o,pal);
                            break;
                        case 28:
                        case 29:
                        case 30:
                            myospal(32+weapon_xoffset+156-(p.look_ang>>1),looking_arc+206-gun_pos,
                                SHOTGUN+4,gs,o,pal);
                            break;
                    }
                    break;


                case CHAINGUN_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;

                    if(p.kickback_pic > 0)
                        gun_pos -= sintable[(p.kickback_pic)<<7]>>12;

                    if(p.kickback_pic > 0 && sprite[p.i].pal != 1) weapon_xoffset += 1-(rand()&3);

                    myospal(weapon_xoffset+168-(p.look_ang>>1),looking_arc+260-gun_pos,
                        CHAINGUN,gs,o,pal);
                    switch(p.kickback_pic)
                    {
                        case 0:
                            myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+233-gun_pos,
                                CHAINGUN+1,gs,o,pal);
                            break;
                        default:
                            if(p.kickback_pic > 4 && p.kickback_pic < 12)
                            {
                                i = 0;
                                if(sprite[p.i].pal != 1) i = rand()&7;
                                myospal(i+weapon_xoffset-4+140-(p.look_ang>>1),i+looking_arc-((p.kickback_pic)>>1)+208-gun_pos,
                                    CHAINGUN+5+(((p.kickback_pic-4)/5)|0),gs,o,pal);
                                if(sprite[p.i].pal != 1) i = rand()&7;
                                myospal(i+weapon_xoffset-4+184-(p.look_ang>>1),i+looking_arc-((p.kickback_pic)>>1)+208-gun_pos,
                                    CHAINGUN+5+(((p.kickback_pic-4)/5)|0),gs,o,pal);
                            }
                            if(p.kickback_pic < 8)
                            {
                                i = rand()&7;
                                myospal(i+weapon_xoffset-4+162-(p.look_ang>>1),i+looking_arc-((p.kickback_pic)>>1)+208-gun_pos,
                                    CHAINGUN+5+(((p.kickback_pic-2)/5)|0),gs,o,pal);
                                myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+233-gun_pos,
                                    CHAINGUN+1+((p.kickback_pic)>>1),gs,o,pal);
                            }
                            else myospal(weapon_xoffset+178-(p.look_ang>>1),looking_arc+233-gun_pos,
                                CHAINGUN+1,gs,o,pal);
                            break;
                    }
                    break;
                case PISTOL_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;

                    if( (p.kickback_pic) < 5) {
                        var kb_frames = [0, 1, 2, 0, 0], l;

                        l = 195-12+weapon_xoffset;

                        if((p.kickback_pic) == 2)
                            l -= 3;
                        myospal(
                            (l-(p.look_ang>>1)),
                            (looking_arc+244-gun_pos),
                            FIRSTGUN+kb_frames[p.kickback_pic],
                            gs,2,pal);
                    }
                    else
                    {
                        if((p.kickback_pic) < 10)
                            myospal(194-(p.look_ang>>1),looking_arc+230-gun_pos,FIRSTGUN+4,gs,o,pal);
                        else if((p.kickback_pic) < 15)
                        {
                            myospal(244-((p.kickback_pic)<<3)-(p.look_ang>>1),looking_arc+130-gun_pos+((p.kickback_pic)<<4),FIRSTGUN+6,gs,o,pal);
                            myospal(224-(p.look_ang>>1),looking_arc+220-gun_pos,FIRSTGUN+5,gs,o,pal);
                        }
                        else if((p.kickback_pic) < 20)
                        {
                            myospal(124+((p.kickback_pic)<<1)-(p.look_ang>>1),looking_arc+430-gun_pos-((p.kickback_pic)<<3),FIRSTGUN+6,gs,o,pal);
                            myospal(224-(p.look_ang>>1),looking_arc+220-gun_pos,FIRSTGUN+5,gs,o,pal);
                        }
                        else if((p.kickback_pic) < 23)
                        {
                            myospal(184-(p.look_ang>>1),looking_arc+235-gun_pos,FIRSTGUN+8,gs,o,pal);
                            myospal(224-(p.look_ang>>1),looking_arc+210-gun_pos,FIRSTGUN+5,gs,o,pal);
                        }
                        else if((p.kickback_pic) < 25)
                        {
                            myospal(164-(p.look_ang>>1),looking_arc+245-gun_pos,FIRSTGUN+8,gs,o,pal);
                            myospal(224-(p.look_ang>>1),looking_arc+220-gun_pos,FIRSTGUN+5,gs,o,pal);
                        }
                        else if((p.kickback_pic) < 27)
                            myospal(194-(p.look_ang>>1),looking_arc+235-gun_pos,FIRSTGUN+5,gs,o,pal);
                    }

                    break;
                case HANDBOMB_WEAPON:
                    {
                        if(sprite[p.i].pal == 1)
                            pal = 1;
                        else
                            pal = sector[p.cursectnum].floorpal;

                        if((p.kickback_pic))
                        {
                            var  throw_frames = [0,0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2];

                            if((p.kickback_pic) < 7)
                                gun_pos -= 10*(p.kickback_pic);        //D
                            else if((p.kickback_pic) < 12)
                                gun_pos += 20*((p.kickback_pic)-10); //U
                            else if((p.kickback_pic) < 20)
                                gun_pos -= 9*((p.kickback_pic)-14);  //D

                            myospal(weapon_xoffset+190-(p.look_ang>>1),looking_arc+250-gun_pos,HANDTHROW+throw_frames[(p.kickback_pic)],gs,o,pal);
                        }
                        else
                            myospal(weapon_xoffset+190-(p.look_ang>>1),looking_arc+260-gun_pos,HANDTHROW,gs,o,pal);
                    }
                    break;

                case HANDREMOTE_WEAPON:
                    {
                        var remote_frames = [0,1,1,2,1,1,0,0,0,0,0];
                        if(sprite[p.i].pal == 1)
                            pal = 1;
                        else
                            pal = sector[p.cursectnum].floorpal;

                        weapon_xoffset = -48;

                        if((p.kickback_pic))
                            myospal(weapon_xoffset+150-(p.look_ang>>1),looking_arc+258-gun_pos,HANDREMOTE+remote_frames[(p.kickback_pic)],gs,o,pal);
                        else
                            myospal(weapon_xoffset+150-(p.look_ang>>1),looking_arc+258-gun_pos,HANDREMOTE,gs,o,pal);
                     }
                    break;
                case DEVISTATOR_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;

                    if((p.kickback_pic))
                    {
                        var  cycloidy =[0,4,12,24,12,4,0];

                        i = sgn((p.kickback_pic)>>2);

                        if(p.hbomb_hold_delay)
                        {
                            myospal( (cycloidy[p.kickback_pic]>>1)+weapon_xoffset+268-(p.look_ang>>1),cycloidy[p.kickback_pic]+looking_arc+238-gun_pos,DEVISTATOR+i,-32,o,pal);
                            myospal(weapon_xoffset+30-(p.look_ang>>1),looking_arc+240-gun_pos,DEVISTATOR,gs,o|4,pal);
                        }
                        else
                        {
                            myospal( -(cycloidy[p.kickback_pic]>>1)+weapon_xoffset+30-(p.look_ang>>1),cycloidy[p.kickback_pic]+looking_arc+240-gun_pos,DEVISTATOR+i,-32,o|4,pal);
                            myospal(weapon_xoffset+268-(p.look_ang>>1),looking_arc+238-gun_pos,DEVISTATOR,gs,o,pal);
                        }
                    }
                    else
                    {
                        myospal(weapon_xoffset+268-(p.look_ang>>1),looking_arc+238-gun_pos,DEVISTATOR,gs,o,pal);
                        myospal(weapon_xoffset+30-(p.look_ang>>1),looking_arc+240-gun_pos,DEVISTATOR,gs,o|4,pal);
                    }
                    break;

                case FREEZE_WEAPON:
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;

                    if((p.kickback_pic))
                    {
                        var  cat_frames  = [ 0,0,1,1,2,2 ];

                        if(sprite[p.i].pal != 1)
                        {
                            weapon_xoffset += rand()&3;
                            looking_arc += rand()&3;
                        }
                        gun_pos -= 16;
                        myospal(weapon_xoffset+210-(p.look_ang>>1),looking_arc+261-gun_pos,FREEZE+2,-32,o,pal);
                        myospal(weapon_xoffset+210-(p.look_ang>>1),looking_arc+235-gun_pos,FREEZE+3+cat_frames[p.kickback_pic%6],-32,o,pal);
                    }
                    else myospal(weapon_xoffset+210-(p.look_ang>>1),looking_arc+261-gun_pos,FREEZE,gs,o,pal);

                    break;

                case SHRINKER_WEAPON:
                case GROW_WEAPON:
                    weapon_xoffset += 28;
                    looking_arc += 18;
                    if(sprite[p.i].pal == 1)
                        pal = 1;
                    else
                        pal = sector[p.cursectnum].floorpal;
                    if((p.kickback_pic) == 0)
                    {
                        if(cw == GROW_WEAPON)
                        {
                            myospal(weapon_xoffset+184-(p.look_ang>>1),
                                looking_arc+240-gun_pos,SHRINKER+2,
                                16-(sintable[p.random_club_frame&2047]>>10),
                                o,2);

                            myospal(weapon_xoffset+188-(p.look_ang>>1),
                            looking_arc+240-gun_pos,SHRINKER-2,gs,o,pal);
                        }
                        else
                        {
                            myospal(weapon_xoffset+184-(p.look_ang>>1),
                            looking_arc+240-gun_pos,SHRINKER+2,
                            16-(sintable[p.random_club_frame&2047]>>10),
                            o,0);

                            myospal(weapon_xoffset+188-(p.look_ang>>1),
                            looking_arc+240-gun_pos,SHRINKER,gs,o,pal);
                        }
                    }
                    else
                    {
                        if(sprite[p.i].pal != 1)
                        {
                            weapon_xoffset += rand()&3;
                            gun_pos += (rand()&3);
                        }

                        if(cw == GROW_WEAPON)
                        {
                            myospal(weapon_xoffset+184-(p.look_ang>>1),
                                looking_arc+240-gun_pos,SHRINKER+3+((p.kickback_pic)&3),-32,
                                o,2);

                            myospal(weapon_xoffset+188-(p.look_ang>>1),
                            looking_arc+240-gun_pos,SHRINKER-1,gs,o,pal);

                        }
                        else
                        {
                            myospal(weapon_xoffset+184-(p.look_ang>>1),
                            looking_arc+240-gun_pos,SHRINKER+3+((p.kickback_pic)&3),-32,
                            o,0);

                            myospal(weapon_xoffset+188-(p.look_ang>>1),
                            looking_arc+240-gun_pos,SHRINKER+1,gs,o,pal);
                        }
                    }
                    break;
            }
        }
    }

    displayloogie(snum);

}

//2131
function  doincrements(p)
{
    var snum;

    snum = sprite[p.i].yvel;
    //    j = sync[snum].avel;
    //    p.weapon_ang = -(j/5);

    p.player_par++;

    if(p.invdisptime > 0)
        p.invdisptime--;

    if(p.tipincs > 0) p.tipincs--;

    if(p.last_pissed_time > 0 )
    {
        p.last_pissed_time--;

        if( p.last_pissed_time == (26*219) )
        {
            spritesound(FLUSH_TOILET,p.i);
            if(snum == screenpeek || ud.coop == 1)
                spritesound(DUKE_PISSRELIEF,p.i);
        }

        if( p.last_pissed_time == (26*218) )
        {
            p.holster_weapon = 0;
            p.weapon_pos = 10;
        }
    }

    if(p.crack_time > 0)
    {
        p.crack_time--;
        if(p.crack_time == 0)
        {
            p.knuckle_incs = 1;
            p.crack_time = 777;
        }
    }

    if( p.steroids_amount > 0 && p.steroids_amount < 400)
    {
        p.steroids_amount--;
        if(p.steroids_amount == 0)
            checkavailinven(p);
        if( !(p.steroids_amount&7) )
            if(snum == screenpeek || ud.coop == 1)
                spritesound(DUKE_HARTBEAT,p.i);
    }

    if(p.heat_on && p.heat_amount > 0)
    {
        p.heat_amount--;
        if( p.heat_amount == 0 )
        {
            p.heat_on = 0;
            checkavailinven(p);
            spritesound(NITEVISION_ONOFF,p.i);
            Player.setPal(p);
        }
    }

    if( p.holoduke_on >= 0 )
    {
        p.holoduke_amount--;
        if(p.holoduke_amount <= 0)
        {
            spritesound(TELEPORTER,p.i);
            p.holoduke_on = -1;
            checkavailinven(p);
        }
    }

    if( p.jetpack_on && p.jetpack_amount > 0 )
    {
        p.jetpack_amount--;
        if(p.jetpack_amount <= 0)
        {
            p.jetpack_on = 0;
            checkavailinven(p);
            spritesound(DUKE_JETPACK_OFF,p.i);
            stopsound(DUKE_JETPACK_IDLE);
            stopsound(DUKE_JETPACK_ON);
        }
    }

    if(p.quick_kick > 0 && sprite[p.i].pal != 1)
    {
        p.quick_kick--;
        if( p.quick_kick == 8 )
            shoot(p.i,KNEE);
    }

    if(p.access_incs && sprite[p.i].pal != 1)
    {
        p.access_incs++;
        if(sprite[p.i].extra <= 0)
            p.access_incs = 12;
        if(p.access_incs == 12)
        {
            if(p.access_spritenum >= 0)
            {
                checkhitswitch(snum,p.access_spritenum,1);
                switch(sprite[p.access_spritenum].pal)
                {
                    case 0:p.got_access &= (0xffff-0x1);break;
                    case 21:p.got_access &= (0xffff-0x2);break;
                    case 23:p.got_access &= (0xffff-0x4);break;
                }
                p.access_spritenum = -1;
            }
            else
            {
                checkhitswitch(snum,p.access_wallnum,0);
                switch(wall[p.access_wallnum].pal)
                {
                    case 0:p.got_access &= (0xffff-0x1);break;
                    case 21:p.got_access &= (0xffff-0x2);break;
                    case 23:p.got_access &= (0xffff-0x4);break;
                }
            }
        }

        if(p.access_incs > 20)
        {
            p.access_incs = 0;
            p.weapon_pos = 10;
            p.kickback_pic = 0;
        }
    }

    if(p.scuba_on == 0 && sector[p.cursectnum].lotag == 2)
    {
        if(p.scuba_amount > 0)
        {
            p.scuba_on = 1;
            p.inven_icon = 6;
            FTA(76,p,0);
        }
        else
        {
            if(p.airleft > 0)
                p.airleft--;
            else
            {
                p.extra_extra8 += 32;
                if(p.last_extra < (max_player_health>>1) && (p.last_extra&3) == 0)
                    spritesound(DUKE_LONGTERM_PAIN,p.i);
            }
        }
    }
    else if(p.scuba_amount > 0 && p.scuba_on)
    {
        p.scuba_amount--;
        if(p.scuba_amount == 0)
        {
            p.scuba_on = 0;
            checkavailinven(p);
        }
    }

    if(p.knuckle_incs)
    {
        p.knuckle_incs ++;
        if(p.knuckle_incs==10)
        {
            if(totalclock > 1024)
                if(snum == screenpeek || ud.coop == 1)
                {
                    if(rand()&1)
                        spritesound(DUKE_CRACK,p.i);
                    else spritesound(DUKE_CRACK2,p.i);
                }
            spritesound(DUKE_CRACK_FIRST,p.i);
        }
        else if( p.knuckle_incs == 22 || (sync[snum].bits&(1<<2)))
            p.knuckle_incs=0;

        return 1;
    }
    return 0;
}

var weapon_sprites = [KNEE, FIRSTGUNSPRITE, SHOTGUNSPRITE,
    CHAINGUNSPRITE, RPGSPRITE, HEAVYHBOMB, SHRINKERSPRITE, DEVISTATORSPRITE,
    TRIPBOMBSPRITE, FREEZESPRITE, HEAVYHBOMB, SHRINKERSPRITE];

//2321
function checkweapons(p)
{
    var cw;

    cw = p.curr_weapon;

    if(cw < 1 || cw >= MAX_WEAPONS) return;

    if(cw)
    {
        if(TRAND&1)
            spawn(p.i,weapon_sprites[cw]);
        else switch(cw)
        {
            case RPG_WEAPON:
            case HANDBOMB_WEAPON:
                spawn(p.i,EXPLOSION2);
                break;
        }
    }
}

//2337
Player.processInput = function(snum) {
    var j, i, k, doubvel, fz, cz, hz, lz, truefdist, x, y;
    var  shrunk;
    var sb_snum;
    var psect, psectlotag, kb, tempsect, pi;
    var p;
    var s;
    var text = "";

    var refX = new Ref(),
        refY = new Ref(),
        refZ = new Ref(),
        refSectnum = new Ref();

    p = ps[snum];
    console.log("start of processInput: p.posyv: %i", p.posyv);
    pi = p.i;
    s = sprite[pi];

    kb = p.kickback_pic;

    if(p.cheat_phase <= 0) sb_snum = sync[snum].bits;
    else sb_snum = 0;

    psect = p.cursectnum;
    if(psect == -1)
    {
        if(s.extra > 0 && ud.clipping == 0)
        {
            quickkill(p);
            spritesound(SQUISHED,pi);
        }
        psect = 0;
    }

    psectlotag = sector[psect].lotag;
    p.spritebridge = 0;

    shrunk = (s.yrepeat < 32);
    var czRef = new Ref(cz);
    var hzRef = new Ref(hz);
    var fzRef = new Ref(fz);
    var lzRef = new Ref(lz);
    getzrange(p.posx, p.posy, p.posz, psect, czRef, hzRef, fzRef, lzRef, 163, CLIPMASK0);
    cz = czRef.$;
    hz = hzRef.$;
    fz = fzRef.$;
    lz = lzRef.$;

    j = getflorzofslope(psect,p.posx,p.posy);

    p.truefz = j;
    p.truecz = getceilzofslope(psect,p.posx,p.posy);

    truefdist = klabs(p.posz-j);
    if( (lz&49152) == 16384 && psectlotag == 1 && truefdist > PHEIGHT+(16<<8) )
        psectlotag = 0;

    hittype[pi].floorz = fz;
    hittype[pi].ceilingz = cz;

    p.ohoriz = p.horiz;
    p.ohorizoff = p.horizoff;
    
    if( p.aim_mode == 0 && p.on_ground && psectlotag != 2 && (sector[psect].floorstat&2) )
    {
        x = p.posx+(sintable[(p.ang+512)&2047]>>5);
        y = p.posy+(sintable[p.ang&2047]>>5);
        tempsect = psect;
        var tempsectRef = new Ref(tempsect);
        updatesector(x, y, tempsectRef);
        tempsect = tempsectRef.$;
        if (tempsect >= 0)
        {
            k = getflorzofslope(psect,x,y);
            if (psect == tempsect)
                p.horizoff += mulscale16(j-k,160);
            else if (klabs(getflorzofslope(tempsect,x,y)-k) <= (4<<8))
                p.horizoff += mulscale16(j-k,160);
        }
    }
    if (p.horizoff > 0) p.horizoff -= ((p.horizoff>>3)+1);
    else if (p.horizoff < 0) p.horizoff += (((-p.horizoff)>>3)+1);

    if( hz >= 0 && (hz&49152) == 49152)
    {
        hz &= (MAXSPRITES-1);

        if(sprite[hz].statnum == 1 && sprite[hz].extra >= 0)
        {
            hz = 0;
            cz = p.truecz;
        }
    }

    if(lz >= 0 && (lz&49152) == 49152)
    {
        j = lz&(MAXSPRITES-1);

        if( (sprite[j].cstat&33) == 33 )
        {
            psectlotag = 0;
            p.footprintcount = 0;
            p.spritebridge = 1;
        }
        else if(badguy(sprite[j]) && sprite[j].xrepeat > 24 && klabs(s.z-sprite[j].z) < (84<<8) )
        {
            j = getangle(sprite[j].x-p.posx,sprite[j].y-p.posy);
            p.posxv -= sintable[(j+512)&2047]<<4;
            p.posyv -= sintable[j&2047]<<4;
            console.log("negate 1022- p.posyv: %i", p.posyv)
        }
    }


    if ( s.extra > 0 ) incur_damage( p );
    else
    {
        s.extra = 0;
        p.shield_amount = 0;
    }

    p.last_extra = s.extra;

    if(p.loogcnt > 0) p.loogcnt--;
    else p.loogcnt = 0;

    if(p.fist_incs)
    {
        p.fist_incs++;
        if(p.fist_incs == 28)
        {
            if(ud.recstat == 1) closedemowrite();
            sound(PIPEBOMB_EXPLODE);
            p.pals[0] = 64;
            p.pals[1] = 64;
            p.pals[2] = 64;
            p.pals_time = 48;
        }
        if(p.fist_incs > 42)
        {
            if(p.buttonpalette && ud.from_bonus == 0)
            {
                ud.from_bonus = ud.level_number+1;
                if(ud.secretlevel > 0 && ud.secretlevel < 12) ud.level_number = ud.secretlevel-1;
                ud.m_level_number = ud.level_number;
            }
            else
            {
                if(ud.from_bonus)
                {
                    ud.level_number = ud.from_bonus;
                    ud.m_level_number = ud.level_number;
                    ud.from_bonus = 0;
                }
                else
                {
                    if(ud.level_number == ud.secretlevel && ud.from_bonus > 0 )
                        ud.level_number = ud.from_bonus;
                    else ud.level_number++;

                    if(ud.level_number > 10) ud.level_number = 0;
                    ud.m_level_number = ud.level_number;

                }
            }
            for(i=connecthead;i>=0;i=connectpoint2[i])
                ps[i].gm = MODE_EOL;
            p.fist_incs = 0;

            return;
        }
    }

    if(p.timebeforeexit > 1 && p.last_extra > 0)
    {
        p.timebeforeexit--;
        if(p.timebeforeexit == 26*5)
        {
            FX.stopAllSounds();
            clearsoundlocks();
            if(p.customexitsound >= 0)
            {
                sound(p.customexitsound);
                FTA(102,p,0);
            }
        }
        else if(p.timebeforeexit == 1)
        {
            for(i=connecthead;i>=0;i=connectpoint2[i])
                ps[i].gm = MODE_EOL;
            if(ud.from_bonus)
            {
                ud.level_number = ud.from_bonus;
                ud.m_level_number = ud.level_number;
                ud.from_bonus = 0;
            }
            else
            {
                ud.level_number++;
                ud.m_level_number = ud.level_number;
            }
            return;
        }
    }

    if(p.pals_time > 0)
        p.pals_time--;

    if(p.fta > 0)
    {
        p.fta--;
        if(p.fta == 0)
        {
            pub = NUMPAGES;
            pus = NUMPAGES;
            p.ftq = 0;
        }
    }

    if( s.extra <= 0 )
    {
        if(p.dead_flag == 0)
        {
            if(s.pal != 1)
            {
                p.pals[0] = 63;
                p.pals[1] = 0;
                p.pals[2] = 0;
                p.pals_time = 63;
                p.posz -= (16<<8);
                s.z -= (16<<8);
            }

            if(ud.recstat == 1 && ud.multimode < 2)
                closedemowrite();

            if(s.pal != 1)
                p.dead_flag = (512-((krand()&1)<<10)+(krand()&255)-512)&2047;

            p.jetpack_on = 0;
            p.holoduke_on = -1;

            stopsound(DUKE_JETPACK_IDLE);
            if(p.scream_voice > FX_Ok)
            {
                FX.stopSound(p.scream_voice);
                testcallback(DUKE_SCREAM);
                p.scream_voice = FX_Ok;
            }

            if( s.pal != 1 && (s.cstat&32768) == 0) s.cstat = 0;

            if( ud.multimode > 1 && ( s.pal != 1 || (s.cstat&32768) ) )
            {
                if(p.frag_ps != snum)
                {
                    ps[p.frag_ps].frag++;
                    frags[p.frag_ps][snum]++;

                    if( ud.user_name[p.frag_ps][0] != 0)
                    {
                        if(snum == screenpeek)
                        {
                            fta_quotes[115] = "KILLED BY " + ud.user_name[p.frag_ps];
                            FTA(115,p,1);
                        }
                        else if(screenpeek == p.frag_ps)
                            // FIX_00076: Added default names for bots + fixed a "killed <name>" bug in Fakeplayers with AI
                        {
                            fta_quotes[116] = "KILLED " + ud.user_name[snum];
                            FTA(116,ps[p.frag_ps],1);
                        }
                    }
                    else
                    {
                        if(snum == screenpeek)
                        {
                            fta_quotes[115] = "KILLED BY PLAYER " + (1 + p.frag_ps);
                            FTA(115,p,1);
                        }
                        else if(screenpeek == p.frag_ps)
                        {
                            fta_quotes[116] = "KILLED PLAYER " + 1 + snum;
                            FTA(116, ps[p.frag_ps], 1);
                        }
                    }
                }
                else p.fraggedself++;

                if(myconnectindex == connecthead)
                {
                    sendscore("frag " + (p.frag_ps + 1) + " killed " + (snum + 1));
                }

                p.frag_ps = snum;
                pus = NUMPAGES;
            }
        }

        if( psectlotag == 2 )
        {
            if(p.on_warping_sector == 0)
            {
                if( klabs(p.posz-fz) > (PHEIGHT>>1))
                    p.posz += 348;
            }
            else
            {
                s.z -= 512;
                s.zvel = -348;
            }
                refX.$ = p.posx;
                refY.$ = p.posy;
                refZ.$ = p.posz;
                refSectnum.$ = p.cursectnum;
            clipmove(refX, refY, refZ, refSectnum, 0, 0, 164, (4 << 8), (4 << 8), CLIPMASK0);
            p.posx = refX.$;
            p.posy = refY.$;
            p.posz = refZ.$;
            p.cursectnum = refSectnum.$;
        }

        p.oposx = p.posx;
        p.oposy = p.posy;
        p.oposz = p.posz;
        p.oang = p.ang;
        p.opyoff = p.pyoff;

        p.horiz = 100;
        p.horizoff = 0;


        var cursectnumRef = new Ref(p.cursectnum);
        updatesector(p.posx, p.posy, cursectnumRef);
        p.cursectnum = cursectnumRef.$;

        var posxRef = new Ref(p.posx);
        var posyRef = new Ref(p.posy);
        var poszRef = new Ref(p.posz);
        var pcursectnumRef = new Ref(p.cursectnum);
        pushmove(posxRef,posyRef,poszRef,pcursectnumRef,128,(4<<8),(20<<8),CLIPMASK0);
        p.posx = posxRef.$;
        p.posy = posyRef.$;
        p.posz = poszRef.$;
        p.cursectnum = pcursectnumRef.$;
        
        if( fz > cz+(16<<8) && s.pal != 1)
            p.rotscrnang = (p.dead_flag + ( (fz+p.posz)>>7))&2047;

        p.on_warping_sector = 0;

        return;
    }

    if(p.transporter_hold > 0)
    {
        p.transporter_hold--;
        if(p.transporter_hold == 0 && p.on_warping_sector)
            p.transporter_hold = 2;
    }
    if(p.transporter_hold < 0)
        p.transporter_hold++;

    if(p.newowner >= 0)
    {
        i = p.newowner;
        p.posx = sprite[i].x;
        p.posy = sprite[i].y;
        p.posz = sprite[i].z;
        p.ang =  sprite[i].ang;
        p.posxv = p.posyv = s.xvel = 0;
        p.look_ang = 0;
        p.rotscrnang = 0;
        doincrements(p);

        if(p.curr_weapon == HANDREMOTE_WEAPON) 
            throw "goto SHOOTINCODE";

        return;
    }

    p.weaponautoswitch = (sb_snum&(1<<7))?1:0;
    p.auto_aim = (sb_snum&(1<<6))?2:1; // 2 == normal == full; 1 == partial; 0 = none (not implemented)

    doubvel = TICSPERFRAME;

    if (p.rotscrnang > 0) p.rotscrnang -= ((p.rotscrnang>>1)+1);
    else if (p.rotscrnang < 0) p.rotscrnang += (((-p.rotscrnang)>>1)+1);

    p.look_ang -= (p.look_ang>>2);

    // 1<<6: toggle ud.auto_aim
    if(	((ud.playing_demo_rev == BYTEVERSION_27 ||
		ud.playing_demo_rev == BYTEVERSION_28 || 
		ud.playing_demo_rev == BYTEVERSION_116 || 
		ud.playing_demo_rev == BYTEVERSION_117) &&
		sb_snum&(1<<6)) ||
		(ACTION(gamefunc_Look_Left) && (p.gm&MODE_GAME) && 
		!(p.gm&MODE_MENU) && !(p.gm&MODE_TYPE) && !(ud.pause_on) && (ud.recstat != 2)))
    {
        p.look_ang -= 152;
        p.rotscrnang += 24;
    }

    // 1<<7 : ANTIWEAPONSWITCH
    if(	((ud.playing_demo_rev == BYTEVERSION_27 ||
		ud.playing_demo_rev == BYTEVERSION_28 || 
		ud.playing_demo_rev == BYTEVERSION_116 || 
		ud.playing_demo_rev == BYTEVERSION_117) &&
		sb_snum&(1<<7)) ||
		(
            ACTION(gamefunc_Look_Right) && (p.gm&MODE_GAME) &&
		!(p.gm&MODE_MENU) && !(p.gm&MODE_TYPE) && !(ud.pause_on) && (ud.recstat != 2)
            )
            )
    {
        p.look_ang += 152;
        p.rotscrnang -= 24;
    }

    if(p.on_crane >= 0)
        throw  "goto HORIZONLY";

    j = ksgn(sync[snum].avel);
    /*
    if( j && ud.screen_tilting == 2)
    {
        k = 4;
        if(sb_snum&(1<<5)) k <<= 2;
        p.rotscrnang -= k*j;
        p.look_ang += k*j;
    }
    */

    printf("b4 processinput weapon_sway: %i, s.xvel: %i,p.on_ground : %i, p.bobcounter:%i  \n", p.weapon_sway, s.xvel, p.on_ground, p.bobcounter);
    if( s.xvel < 32 || p.on_ground == 0 || p.bobcounter == 1024 )
    {
        if( (p.weapon_sway&2047) > (1024+96) )
            p.weapon_sway -= 96;
        else if( (p.weapon_sway&2047) < (1024-96) )
            p.weapon_sway += 96;
        else p.weapon_sway = 1024;
    }
    else p.weapon_sway = p.bobcounter;
    printf("processinput weapon_sway: %i\n",p.weapon_sway);

    s.xvel =
        ksqrt( (p.posx-p.bobposx)*(p.posx-p.bobposx)+(p.posy-p.bobposy)*(p.posy-p.bobposy));
    printf("processinput s.xvel: %i\n", s.xvel);
    if (p.on_ground) p.bobcounter += sprite[p.i].xvel >> 1;

    if( ud.clipping == 0 && ( sector[p.cursectnum].floorpicnum == MIRROR || p.cursectnum < 0 || p.cursectnum >= MAXSECTORS) )
    {
        p.posx = p.oposx;
        p.posy = p.oposy;
    }
    else
    {
        p.oposx = p.posx;
        p.oposy = p.posy;
    }

    p.bobposx = p.posx;
    p.bobposy = p.posy;

    p.oposz = p.posz;
    p.opyoff = p.pyoff;
    p.oang = p.ang;

    if(p.one_eighty_count < 0)
    {
        p.one_eighty_count += 128;
        p.ang += 128;
    }

    // Shrinking code

    i = 40;

    if( psectlotag == 2) {
        p.jumping_counter = 0;

        p.pycount += 32;
        p.pycount &= 2047;
        p.pyoff = sintable[p.pycount]>>7;

        if( Sound[DUKE_UNDERWATER].num == 0 )
            spritesound(DUKE_UNDERWATER,pi);

        if ( sb_snum&1 )
        {
            if(p.poszv > 0) p.poszv = 0;
            p.poszv -= 348;
            if(p.poszv < -(256*6)) p.poszv = -(256*6);
        }
        else if (sb_snum&(1<<1))
        {
            if(p.poszv < 0) p.poszv = 0;
            p.poszv += 348;
            if(p.poszv > (256*6)) p.poszv = (256*6);
        }
        else
        {
            if(p.poszv < 0)
            {
                p.poszv += 256;
                if(p.poszv > 0)
                    p.poszv = 0;
            }
            if(p.poszv > 0)
            {
                p.poszv -= 256;
                if(p.poszv < 0)
                    p.poszv = 0;
            }
        }

        if(p.poszv > 2048)
            p.poszv >>= 1;

        p.posz += p.poszv;

        if(p.posz > (fz-(15<<8)) )
            p.posz += ((fz-(15<<8))-p.posz)>>1;

        if(p.posz < (cz+(4<<8)) )
        {
            p.posz = cz+(4<<8);
            p.poszv = 0;
        }

        if( p.scuba_on && (krand()&255) < 8 )
        {
            j = spawn(pi,WATERBUBBLE);
            sprite[j].x +=
                sintable[(p.ang+512+64-(global_random&128))&2047]>>6;
            sprite[j].y +=
                sintable[(p.ang+64-(global_random&128))&2047]>>6;
            sprite[j].xrepeat = 3;
            sprite[j].yrepeat = 2;
            sprite[j].z = p.posz+(8<<8);
        }
    }

    else if(p.jetpack_on)
    {
        p.on_ground = 0;
        p.jumping_counter = 0;
        p.hard_landing = 0;
        p.falling_counter = 0;

        p.pycount += 32;
        p.pycount &= 2047;
        p.pyoff = sintable[p.pycount]>>7;

        if(p.jetpack_on < 11)
        {
            p.jetpack_on++;
            p.posz -= (p.jetpack_on<<7); //Goin up
        }
        else if(p.jetpack_on == 11 && Sound[DUKE_JETPACK_IDLE].num < 1)
            spritesound(DUKE_JETPACK_IDLE,pi);

        if(shrunk) j = 512;
        else j = 2048;

        if ( sb_snum&1 )                            //A (soar high)
        {
            p.posz -= j;
            p.crack_time = 777;
        }

        if (sb_snum&(1<<1))                            //Z (soar low)
        {
            p.posz += j;
            p.crack_time = 777;
        }

        if( shrunk == 0 && (psectlotag == 0 || psectlotag == 2)) k = 32;
        else k = 16;

        if( psectlotag != 2 && p.scuba_on == 1 )
            p.scuba_on = 0;

        if(p.posz > (fz-(k<<8)) )
            p.posz += ((fz-(k<<8))-p.posz)>>1;
        if(p.posz < (hittype[pi].ceilingz+(18<<8)) )
            p.posz = hittype[pi].ceilingz+(18<<8);

    }
    else if( psectlotag != 2 )
    {
        if(p.airleft != 15*26)
            p.airleft = 15*26; //Aprox twenty seconds.

        if(p.scuba_on == 1)
            p.scuba_on = 0;

        if( psectlotag == 1 && p.spritebridge == 0)
        {
            if(shrunk == 0)
            {
                i = 34;
                p.pycount += 32;
                p.pycount &= 2047;
                p.pyoff = sintable[p.pycount]>>6;
            }
            else i = 12;

            if(shrunk == 0 && truefdist <= PHEIGHT)
            {
                if(p.on_ground == 1)
                {
                    if( p.dummyplayersprite == -1 )
                        p.dummyplayersprite =
                            spawn(pi,PLAYERONWATER);

                    p.footprintcount = 6;
                    if(sector[p.cursectnum].floorpicnum == FLOORSLIME)
                        p.footprintpal = 8;
                    else p.footprintpal = 0;
                    p.footprintshade = 0;
                }
            }
        }
        else
        {
            if(p.footprintcount > 0 && p.on_ground)
                if( (sector[p.cursectnum].floorstat&2) != 2 )
                {
                    for(j=headspritesect[psect];j>=0;j=nextspritesect[j])
                        if( sprite[j].picnum == FOOTPRINTS || sprite[j].picnum == FOOTPRINTS2 || sprite[j].picnum == FOOTPRINTS3 || sprite[j].picnum == FOOTPRINTS4 )
                            if (klabs(sprite[j].x-p.posx) < 384)
                                if (klabs(sprite[j].y-p.posy) < 384)
                                    break;
                    if(j < 0)
                    {
                        p.footprintcount--;
                        if( sector[p.cursectnum].lotag == 0 && sector[p.cursectnum].hitag == 0 )
                        {
                            switch(krand()&3)
                            {
                                case 0:  j = spawn(pi,FOOTPRINTS); break;
                                case 1:  j = spawn(pi,FOOTPRINTS2); break;
                                case 2:  j = spawn(pi,FOOTPRINTS3); break;
                                default: j = spawn(pi,FOOTPRINTS4); break;
                            }
                            sprite[j].pal = p.footprintpal;
                            sprite[j].shade = p.footprintshade;
                        }
                    }
                }
        }

        if(p.posz < (fz-(i<<8)) ) //falling
        {
            if( (sb_snum&3) == 0 && p.on_ground && (sector[psect].floorstat&2) && p.posz >= (fz-(i<<8)-(16<<8) ) )
                p.posz = fz-(i<<8);
            else
            {
                p.on_ground = 0;
                p.poszv += (gc+80); // (TICSPERFRAME<<6);
                if(p.poszv >= (4096+2048)) p.poszv = (4096+2048);
                if(p.poszv > 2400 && p.falling_counter < 255)
                {
                    p.falling_counter++;
                    if( p.falling_counter == 38 )
                        p.scream_voice = spritesound(DUKE_SCREAM,pi);
                }

                if( (p.posz+p.poszv) >= (fz-(i<<8)) ) // hit the ground
                    if(sector[p.cursectnum].lotag != 1)
                    {
                        if( p.falling_counter > 62 ) quickkill(p);

                        else if( p.falling_counter > 9 )
                        {
                            j = p.falling_counter;
                            s.extra -= j-(krand()&3);
                            if(s.extra <= 0)
                            {
                                spritesound(SQUISHED,pi);
                                p.pals[0] = 63;
                                p.pals[1] = 0;
                                p.pals[2] = 0;
                                p.pals_time = 63;
                            }
                            else
                            {
                                spritesound(DUKE_LAND,pi);
                                spritesound(DUKE_LAND_HURT,pi);
                            }

                            p.pals[0] = 16;
                            p.pals[1] = 0;
                            p.pals[2] = 0;
                            p.pals_time = 32;
                        }
                        else if(p.poszv > 2048) spritesound(DUKE_LAND,pi);
                    }
            }
        }

        else
        {
            p.falling_counter = 0;
            if(p.scream_voice > FX_Ok)
            {
                FX.stopSound(p.scream_voice);
                p.scream_voice = FX_Ok;
            }

            if(psectlotag != 1 && psectlotag != 2 && p.on_ground == 0 && p.poszv > (6144>>1))
                p.hard_landing = p.poszv>>10;

            p.on_ground = 1;

            if( i==40 )
            {
                //Smooth on the ground

                k = ((fz-(i<<8))-p.posz)>>1;
                if( klabs(k) < 256 ) k = 0;
                p.posz += k;
                p.poszv -= 768;
                if(p.poszv < 0) p.poszv = 0;
            }
            else if(p.jumping_counter == 0)
            {
                p.posz += ((fz-(i<<7))-p.posz)>>1; //Smooth on the water
                if(p.on_warping_sector == 0 && p.posz > fz-(16<<8))
                {
                    p.posz = fz-(16<<8);
                    p.poszv >>= 1;
                }
            }

            p.on_warping_sector = 0;

            if( (sb_snum&2) )
            {
                p.posz += (2048+768);
                p.crack_time = 777;
            }

            if( (sb_snum&1) == 0 && p.jumping_toggle == 1)
                p.jumping_toggle = 0;

            else if( (sb_snum&1) && p.jumping_toggle == 0 )
            {
                if( p.jumping_counter == 0 )
                    if( (fz-cz) > (56<<8) )
                    {
                        p.jumping_counter = 1;
                        p.jumping_toggle = 1;
                    }
            }

            if( p.jumping_counter && (sb_snum&1) == 0 )
                p.jumping_toggle = 0;
        }

        if(p.jumping_counter)
        {
            if( (sb_snum&1) == 0 && p.jumping_toggle == 1)
                p.jumping_toggle = 0;

            if( p.jumping_counter < (1024+256) )
            {
                if(psectlotag == 1 && p.jumping_counter > 768)
                {
                    p.jumping_counter = 0;
                    p.poszv = -512;
                }
                else
                {
                    p.poszv -= (((sintable[(2048 - 128 + p.jumping_counter) & 2047]) / 12)|0);
                    p.jumping_counter += 180;
                    p.on_ground = 0;
                }
            }
            else
            {
                p.jumping_counter = 0;
                p.poszv = 0;
            }
        }

        p.posz += p.poszv;

        if(p.posz < (cz+(4<<8)))
        {
            p.jumping_counter = 0;
            if(p.poszv < 0)
                p.posxv = p.posyv = 0;
            p.poszv = 128;
            p.posz = cz+(4<<8);
        }
    }

    //3106
    //Do the quick lefts and rights

    if ( p.fist_incs ||
            p.transporter_hold > 2 ||
            p.hard_landing ||
            p.access_incs > 0 ||
            p.knee_incs > 0 ||
            (p.curr_weapon == TRIPBOMB_WEAPON &&
            kb > 1 &&
            kb < 4 ) )
    {
        doubvel = 0;
        p.posxv = 0;
        p.posyv = 0;
    }
    else if ( sync[snum].avel )          //p.ang += syncangvel * constant
    {                         //ENGINE calculates angvel for you
        var tempang;

        tempang = sync[snum].avel<<1;

        if( psectlotag == 2 ) p.angvel =(tempang-(tempang>>3))*ksgn(doubvel);
        else p.angvel = tempang*ksgn(doubvel);

        p.ang += p.angvel;
        p.ang &= 2047;
        p.crack_time = 777;
    }

    if(p.spritebridge == 0)
    {
        j = sector[s.sectnum].floorpicnum;

        if( j == PURPLELAVA || sector[s.sectnum].ceilingpicnum == PURPLELAVA )
        {
            if(p.boot_amount > 0)
            {
                p.boot_amount--;
                p.inven_icon = 7;
                if(p.boot_amount <= 0)
                    checkavailinven(p);
            }
            else
            {
                if(Sound[DUKE_LONGTERM_PAIN].num < 1)
                    spritesound(DUKE_LONGTERM_PAIN,pi);
                p.pals[0] = 0; p.pals[1] = 8; p.pals[2] = 0;
                p.pals_time = 32;
                s.extra--;
            }
        }

        k = 0;

        if(p.on_ground && truefdist <= PHEIGHT+(16<<8))
        {
            switch(j)
            {
                case HURTRAIL:
                    if( rnd(32) )
                    {
                        if(p.boot_amount > 0)
                            k = 1;
                        else
                        {
                            if(Sound[DUKE_LONGTERM_PAIN].num < 1)
                                spritesound(DUKE_LONGTERM_PAIN,pi);
                            p.pals[0] = 64; p.pals[1] = 64; p.pals[2] = 64;
                            p.pals_time = 32;
                            s.extra -= 1+(krand()&3);
                            if(Sound[SHORT_CIRCUIT].num < 1)
                                spritesound(SHORT_CIRCUIT,pi);
                        }
                    }
                    break;
                case FLOORSLIME:
                    if( rnd(16) )
                    {
                        if(p.boot_amount > 0)
                            k = 1;
                        else
                        {
                            if(Sound[DUKE_LONGTERM_PAIN].num < 1)
                                spritesound(DUKE_LONGTERM_PAIN,pi);
                            p.pals[0] = 0; p.pals[1] = 8; p.pals[2] = 0;
                            p.pals_time = 32;
                            s.extra -= 1+(krand()&3);
                        }
                    }
                    break;
                case FLOORPLASMA:
                    if( rnd(32) )
                    {
                        if( p.boot_amount > 0 )
                            k = 1;
                        else
                        {
                            if(Sound[DUKE_LONGTERM_PAIN].num < 1)
                                spritesound(DUKE_LONGTERM_PAIN,pi);
                            p.pals[0] = 8; p.pals[1] = 0; p.pals[2] = 0;
                            p.pals_time = 32;
                            s.extra -= 1+(krand()&3);
                        }
                    }
                    break;
            }
        }

        if( k )
        {
            FTA(75,p,0);
            p.boot_amount -= 2;
            if(p.boot_amount <= 0)
                checkavailinven(p);
        }
    }

    if ( p.posxv || p.posyv || sync[snum].fvel || sync[snum].svel )
    {
        p.crack_time = 777;

        k = sintable[p.bobcounter&2047]>>12;

        if(truefdist < PHEIGHT+(8<<8) )
        {
            if( k == 1 || k == 3 )
            {
                if(p.spritebridge == 0 && p.walking_snd_toggle == 0 && p.on_ground)
                {
                    switch( psectlotag )
                    {
                        case 0:

                            if(lz >= 0 && (lz&(MAXSPRITES-1))==49152 )
                                j = sprite[lz&(MAXSPRITES-1)].picnum;
                            else j = sector[psect].floorpicnum;

                            switch(j)
                            {
                                case PANNEL1:
                                case PANNEL2:
                                    spritesound(DUKE_WALKINDUCTS,pi);
                                    p.walking_snd_toggle = 1;
                                    break;
                            }
                            break;
                        case 1:
                            if((krand()&1) == 0)
                                spritesound(DUKE_ONWATER,pi);
                            p.walking_snd_toggle = 1;
                            break;
                    }
                }
            }
            else{
                if(p.walking_snd_toggle > 0)
                {
                    p.walking_snd_toggle --;
                }
            }
        }
        
        if(p.jetpack_on == 0 && p.steroids_amount > 0 && p.steroids_amount < 400)
            doubvel <<= 1;
        console.log("b4 p.posyv: %i", p.posyv)
        p.posxv += ((sync[snum].fvel*doubvel)<<6);
        p.posyv += ((sync[snum].svel*doubvel)<<6);

        if( ( p.curr_weapon == KNEE_WEAPON && kb > 10 && p.on_ground ) || ( p.on_ground && (sb_snum&2) ) )
        {
            p.posxv = mulscale(p.posxv,dukefriction-0x2000,16);
            p.posyv = mulscale(p.posyv,dukefriction-0x2000,16);
        }
        else
        {
            if(psectlotag == 2)
            {
                p.posxv = mulscale(p.posxv,dukefriction-0x1400,16);
                p.posyv = mulscale(p.posyv,dukefriction-0x1400,16);
            }
            else
            {
                p.posxv = mulscale(p.posxv,dukefriction,16);
                p.posyv = mulscale(p.posyv,dukefriction,16);
            }
        }

        console.log("middle p.posyv: %i", p.posyv)
        if (Math.abs(p.posxv) < 2048 && Math.abs(p.posyv) < 2048)
            p.posxv = p.posyv = 0;

        if( shrunk )
        {
            p.posxv =
                mulscale16(p.posxv,dukefriction-(dukefriction>>1)+(dukefriction>>2));
            p.posyv =
                mulscale16(p.posyv,dukefriction-(dukefriction>>1)+(dukefriction>>2));
        }
        console.log("after p.posyv: %i", p.posyv)
    }

//    HORIZONLY:

    if(psectlotag == 1 || p.spritebridge == 1) i = (4<<8);
    else i = (20<<8);

    if(sector[p.cursectnum].lotag == 2) k = 0;
    else k = 1;
    
    if (ud.clipping) {
        j = 0;
        p.posx += p.posxv >> 14;
        p.posy += p.posyv >> 14;
        throw "todo updatesector refs"
        //updatesector(p.posx,p.posy,&p.cursectnum); todo!!!!!
        changespritesect(pi, p.cursectnum);
    } else {
        refX.$ = p.posx;
        refY.$ = p.posy;
        refZ.$ = p.posz;
        refSectnum.$ = p.cursectnum;
        j = clipmove(refX, refY, refZ, refSectnum, p.posxv, p.posyv, 164, (4 << 8), i, CLIPMASK0);
        p.posx = refX.$;
        p.posy = refY.$;
        p.posz = refZ.$;
        p.cursectnum = refSectnum.$;
    }
    if(p.jetpack_on == 0 && psectlotag != 2 && psectlotag != 1 && shrunk)
        p.posz += 32<<8;

    if(j)
        checkplayerhurt(p,j);

    if(p.jetpack_on == 0)
    {
        if( s.xvel > 16 )
        {
            if( psectlotag != 1 && psectlotag != 2 && p.on_ground )
            {
                p.pycount += 52;
                p.pycount &= 2047;
                p.pyoff = (klabs(s.xvel * sintable[p.pycount]) / 1596) | 0;
            }
        }
        else if( psectlotag != 2 && psectlotag != 1 )
            p.pyoff = 0;
    }

    // RBG***
    setsprite(pi,p.posx,p.posy,p.posz+PHEIGHT);

    if( psectlotag < 3 )
    {
        psect = s.sectnum;
        if( ud.clipping == 0 && sector[psect].lotag == 31)
        {
            if( sprite[sector[psect].hitag].xvel && hittype[sector[psect].hitag].temp_data[0] == 0)
            {
                quickkill(p);
                return;
            }
        }
    }

    if(truefdist < PHEIGHT && p.on_ground && psectlotag != 1 && shrunk == 0 && sector[p.cursectnum].lotag == 1)
        if( Sound[DUKE_ONWATER].num == 0 )
            spritesound(DUKE_ONWATER,pi);

    if (p.cursectnum != s.sectnum)
        changespritesect(pi,p.cursectnum);


     refX.$= p.posx;
     refY.$ = p.posy;
     refZ.$ = p.posz;
     refSectnum.$ = p.cursectnum;
    if(ud.clipping == 0)
        j = (pushmove(refX, refY, refZ, refSectnum, 164, (4 << 8), (4 << 8), CLIPMASK0) < 0 && furthestangle(pi, 8) < 512);
    else j = 0;
    p.posx = refX.$;
    p.posy = refY.$;
    p.posz = refZ.$;
    p.cursectnum = refSectnum.$;

    if(ud.clipping == 0)
    {
        if( klabs(hittype[pi].floorz-hittype[pi].ceilingz) < (48<<8) || j )
        {
            if ( !(sector[s.sectnum].lotag&0x8000) && ( isanunderoperator(sector[s.sectnum].lotag) ||
                isanearoperator(sector[s.sectnum].lotag) ) )
                activatebysector(s.sectnum,pi);
            if(j)
            {
                quickkill(p);
                return;
            }
        }
        else if( klabs(fz-cz) < (32<<8) && isanunderoperator(sector[psect].lotag) )
            activatebysector(psect,pi);
    }

    if( sb_snum&(1<<18) || p.hard_landing)
        p.return_to_center = 9;

    if( sb_snum&(1<<13) )
    {
        p.return_to_center = 9;
        if( sb_snum&(1<<5) ) p.horiz += 12;
        p.horiz += 12;
    }

    else if( sb_snum&(1<<14) )
    {
        p.return_to_center = 9;
        if( sb_snum&(1<<5) ) p.horiz -= 12;
        p.horiz -= 12;
    }

    else if( sb_snum&(1<<3) )
    {
        if( sb_snum&(1<<5) ) p.horiz += 6;
        p.horiz += 6;
    }

    else if( sb_snum&(1<<4) )
    {
        if( sb_snum&(1<<5) ) p.horiz -= 6;
        p.horiz -= 6;
    }
    if(p.return_to_center > 0)
        if( (sb_snum&(1<<13)) == 0 && (sb_snum&(1<<14)) == 0 )
        {
            p.return_to_center--;
            p.horiz += 33 - ((p.horiz / 3) | 0);
        }

    if(p.hard_landing > 0)
    {
        p.hard_landing--;
        p.horiz -= (p.hard_landing<<4);
    }

    if(p.aim_mode)
        p.horiz += sync[snum].horz>>1;
    else
    {
        if( p.horiz > 95 && p.horiz < 105) p.horiz = 100;
        if( p.horizoff > -5 && p.horizoff < 5) p.horizoff = 0;
    }

    if(p.horiz > 299) p.horiz = 299;
    else if(p.horiz < -99) p.horiz = -99;
    
    //Shooting code/changes

    if( p.show_empty_weapon > 0)
    {
        p.show_empty_weapon--;
        if(p.show_empty_weapon == 0)
        {
            if(p.last_full_weapon == GROW_WEAPON)
                p.subweapon |= (1<<GROW_WEAPON);
            else if(p.last_full_weapon == SHRINKER_WEAPON)
                p.subweapon &= ~(1<<GROW_WEAPON);
            addweapon( p, p.last_full_weapon );
            return;
        }
    }

    if(p.knee_incs > 0)
    {
        throw "todo"
//        p.knee_incs++;
//        p.horiz -= 48;
//        p.return_to_center = 9;
//        if(p.knee_incs > 15)
//        {
//            p.knee_incs = 0;
//            p.holster_weapon = 0;
//            if(p.weapon_pos < 0)
//                p.weapon_pos = -p.weapon_pos;
//            if(p.actorsqu >= 0 && dist(sprite[pi],sprite[p.actorsqu]) < 1400 )
//            {
//                guts(sprite[p.actorsqu],JIBS6,7,myconnectindex);
//                spawn(p.actorsqu,BLOODPOOL);
//                spritesound(SQUISHED,p.actorsqu);
//                switch(sprite[p.actorsqu].picnum)
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
//                        if(sprite[p.actorsqu].yvel)
//                            operaterespawns(sprite[p.actorsqu].yvel);
//                        break;
//                }

//                if(sprite[p.actorsqu].picnum == APLAYER)
//                {
//                    quickkill(&ps[sprite[p.actorsqu].yvel]);
//                    ps[sprite[p.actorsqu].yvel].frag_ps = snum;
//                }
//                else if(badguy(sprite[p.actorsqu]))
//                {
//                    deletesprite(p.actorsqu);
//                    p.actors_killed++;
//                }
//                else deletesprite(p.actorsqu);
//            }
//            p.actorsqu = -1;
//        }
//        else if(p.actorsqu >= 0)
//            p.ang += getincangle(p.ang,getangle(sprite[p.actorsqu].x-p.posx,sprite[p.actorsqu].y-p.posy))>>2;
    }

    if( doincrements(p) ) return;

    if(p.weapon_pos != 0)
    {
        if(p.weapon_pos == -9)
        {
            if(p.last_weapon >= 0)
            {
                p.weapon_pos = 10;
                //                if(p.curr_weapon == KNEE_WEAPON) p.kickback_pic = 1;
                p.last_weapon = -1;
            }
            else if(p.holster_weapon == 0)
                p.weapon_pos = 10;
        }
        else p.weapon_pos--;
    }

    // HACKS

//    SHOOTINCODE:

        if( p.curr_weapon == SHRINKER_WEAPON || p.curr_weapon == GROW_WEAPON )
            p.random_club_frame += 64; // Glowing

    if(p.rapid_fire_hold == 1)
    {
        if( sb_snum&(1<<2) ) return;
        p.rapid_fire_hold = 0;
    }

    if(shrunk || p.tipincs || p.access_incs)
        sb_snum &= ~(1<<2);
    else if ( shrunk == 0 && (sb_snum&(1<<2)) && (p.kickback_pic) == 0 && p.fist_incs == 0 &&
            p.last_weapon == -1 && ( p.weapon_pos == 0 || p.holster_weapon == 1 ) )
    {
        p.crack_time = 777;

        if (p.holster_weapon == 1) {

            if (p.last_pissed_time <= (26 * 218) && p.weapon_pos == -9) {
                p.holster_weapon = 0;
                p.weapon_pos = 10;
                FTA(74, p, 1);
            }
        }
        else {
            switch (p.curr_weapon) {
                case HANDBOMB_WEAPON:
                    p.hbomb_hold_delay = 0;
                    if( p.ammo_amount[HANDBOMB_WEAPON] > 0 )
                        (p.kickback_pic)=1;
                    break;
                case HANDREMOTE_WEAPON:
                    p.hbomb_hold_delay = 0;
                    (p.kickback_pic) = 1;
                    break;

                case PISTOL_WEAPON:
                    if( p.ammo_amount[PISTOL_WEAPON] > 0 )
                    {
                        p.ammo_amount[PISTOL_WEAPON]--;
                        (p.kickback_pic) = 1;
                    }
                    break;


                case CHAINGUN_WEAPON:
                    if( p.ammo_amount[CHAINGUN_WEAPON] > 0 ) // && p.random_club_frame == 0)
                        (p.kickback_pic)=1;
                    break;

                case SHOTGUN_WEAPON:
                    if( p.ammo_amount[SHOTGUN_WEAPON] > 0 && p.random_club_frame == 0 )
                        (p.kickback_pic)=1;
                    break;

                case TRIPBOMB_WEAPON:
                    if (VOLUMEONE) break;
                    if ( p.ammo_amount[TRIPBOMB_WEAPON] > 0 )
                    {
                        var sx,sy,sz;
                        var sect,hw,hitsp;
                        throw "todo"
                        var hitsectRef = new Ref(hitsect);
                        var hitwallRef = new Ref(hitwall);
                        var hitsprRef = new Ref(hitspr);
                        var hitxRef = new Ref(hitx);
                        var hityRef = new Ref(hity);
                        var hitzRef = new Ref(hitz);
                        //hitscan( p.posx, p.posy, p.posz,
                        //            p.cursectnum, sintable[(p.ang+512)&2047],
                        //            sintable[p.ang&2047], (100-p.horiz-p.horizoff)*32,
                        //            hitsectRef,hitwallRef,hitsprRef,hitxRef,hityRef,hitzRef,CLIPMASK1);
                        hitsect = hitsectRef.$;
                        hitwall = hitwallRef.$;
                        hitspr = hitsprRef.$;
                        hitx = hitxRef.$;
                        hity = hityRef.$;
                        hitz = hitzRef.$;

                        //if(sect < 0 || hitsp >= 0)
                        //    break;

                        //if( hw >= 0 && sector[sect].lotag > 2 )
                        //    break;

                        //if(hw >= 0 && wall[hw].overpicnum >= 0)
                        //    if(wall[hw].overpicnum == BIGFORCE)
                        //        break;

                        //j = headspritesect[sect];
                        //while(j >= 0)
                        //{
                        //    if( sprite[j].picnum == TRIPBOMB &&
                        //        klabs(sprite[j].z-sz) < (12<<8) && ((sprite[j].x-sx)*(sprite[j].x-sx)+(sprite[j].y-sy)*(sprite[j].y-sy)) < (290*290) )
                        //        break;
                        //    j = nextspritesect[j];
                        //}

                        //if(j == -1 && hw >= 0 && (wall[hw].cstat&16) == 0 )
                        //    if( ( wall[hw].nextsector >= 0 && sector[wall[hw].nextsector].lotag <= 2 ) || ( wall[hw].nextsector == -1 && sector[sect].lotag <= 2 ) )
                        //        if( ( (sx-p.posx)*(sx-p.posx) + (sy-p.posy)*(sy-p.posy) ) < (290*290) )
                        //        {
                        //            p.posz = p.oposz;
                        //            p.poszv = 0;
                        //            (p.kickback_pic) = 1;
                        //        }
                    }
                    break;

                case SHRINKER_WEAPON:
                case GROW_WEAPON:
                    if (VOLUMEONE) break;
                    if( p.curr_weapon == GROW_WEAPON )
                    {
                        if( p.ammo_amount[GROW_WEAPON] > 0 )
                        {
                            (p.kickback_pic) = 1;
                            spritesound(EXPANDERSHOOT,pi);
                        }
                    }
                    else if( p.ammo_amount[SHRINKER_WEAPON] > 0)
                    {
                        (p.kickback_pic) = 1;
                        spritesound(SHRINKER_FIRE,pi);
                    }
                    break;

                case FREEZE_WEAPON:
                    if (VOLUMEONE) break;
                    if( p.ammo_amount[FREEZE_WEAPON] > 0 )
                    {
                        (p.kickback_pic) = 1;
                        spritesound(CAT_FIRE,pi);
                    }
                    break;
                case DEVISTATOR_WEAPON:
                    if (VOLUMEONE) break;
                    if( p.ammo_amount[DEVISTATOR_WEAPON] > 0 )
                    {
                        (p.kickback_pic) = 1;
                        p.hbomb_hold_delay = !p.hbomb_hold_delay;
                        spritesound(CAT_FIRE,pi);
                    }
                    break;

                case RPG_WEAPON:
                    if ( p.ammo_amount[RPG_WEAPON] > 0)
                        (p.kickback_pic) = 1;
                    break;

                case KNEE_WEAPON:
                    if(p.quick_kick == 0) (p.kickback_pic) = 1;
                    break;
            }
        }
    }
    else if((p.kickback_pic))
    {
        switch( p.curr_weapon )
        {
            case HANDBOMB_WEAPON:
                if( (p.kickback_pic) == 6 && (sb_snum&(1<<2)) )
                {
                    p.rapid_fire_hold = 1;
                    break;
                }
                (p.kickback_pic)++;
                if((p.kickback_pic)==12)
                {
                    p.ammo_amount[HANDBOMB_WEAPON]--;

                    if(p.on_ground && (sb_snum&2) )
                    {
                        k = 15;
                        i = ((p.horiz+p.horizoff-100)*20);
                    }
                    else
                    {
                        k = 140;
                        i = -512-((p.horiz+p.horizoff-100)*20);
                    }

                    j = EGS(p.cursectnum,
                        p.posx+(sintable[(p.ang+512)&2047]>>6),
                        p.posy+(sintable[p.ang&2047]>>6),
                        p.posz,HEAVYHBOMB,-16,9,9,
                        p.ang,(k+(p.hbomb_hold_delay<<5)),i,pi,1);

                    if(k == 15)
                    {
                        sprite[j].yvel = 3;
                        sprite[j].z += (8<<8);
                    }

                    k = hits(pi);
                    if( k < 512 )
                    {
                        sprite[j].ang += 1024;
                        sprite[j].zvel /= 3; sprite[j].zvel = sprite[j].zvel | 0;
                        sprite[j].xvel /= 3; sprite[j].xvel = sprite[j].xvel | 0;
                    }

                    p.hbomb_on = 1;

                }
                else if( (p.kickback_pic) < 12 && (sb_snum&(1<<2)) )
                    p.hbomb_hold_delay++;
                else if( (p.kickback_pic) > 19 )
                {
                    (p.kickback_pic) = 0;
                    p.curr_weapon = HANDREMOTE_WEAPON;
                    p.last_weapon = -1;
                    p.weapon_pos = 10;
                }

                break;


            case HANDREMOTE_WEAPON:
                (p.kickback_pic)++;

                if((p.kickback_pic) == 2)
                {
                    p.hbomb_on = 0;
                }

                if((p.kickback_pic) == 10)
                {
                    (p.kickback_pic) = 0;
                    if(p.ammo_amount[HANDBOMB_WEAPON] > 0)
                        addweapon(p,HANDBOMB_WEAPON);
                    else checkavailweapon(p);
                }
                break;

            case PISTOL_WEAPON:
            if( (p.kickback_pic)==1)
                {
                    shoot(pi,SHOTSPARK1);
                    spritesound(PISTOL_FIRE,pi);

                    lastvisinc = totalclock+32;
                    p.visibility = 0;
                }
                else if((p.kickback_pic) == 2)
                    spawn(pi,SHELL);

                (p.kickback_pic)++;

                if((p.kickback_pic) >= 5)
                {
                    if( p.ammo_amount[PISTOL_WEAPON] <= 0 || (p.ammo_amount[PISTOL_WEAPON]%12) )
                    {
                        (p.kickback_pic)=0;
                        checkavailweapon(p);
                    }
                    else
                    {
                        switch((p.kickback_pic))
                        {
                            case 5:
                                spritesound(EJECT_CLIP,pi);
                                break;
                            case 8:
                                spritesound(INSERT_CLIP,pi);
                                break;
                        }
                    }
                }

                if((p.kickback_pic) == 27)
                {
                    (p.kickback_pic) = 0;
                    checkavailweapon(p);
                }

                break;

            case SHOTGUN_WEAPON:
                (p.kickback_pic)++;

                if(p.kickback_pic == 4)
                {
                    shoot(pi,SHOTGUN);
                    shoot(pi,SHOTGUN);
                    shoot(pi,SHOTGUN);
                    shoot(pi,SHOTGUN);
                    shoot(pi,SHOTGUN);
                    shoot(pi,SHOTGUN);
                    shoot(pi,SHOTGUN);

                    p.ammo_amount[SHOTGUN_WEAPON]--;

                    spritesound(SHOTGUN_FIRE,pi);

                    lastvisinc = totalclock+32;
                    p.visibility = 0;
                }

                switch(p.kickback_pic)
                {
                    case 13:
                        checkavailweapon(p);
                        break;
                    case 15:
                        spritesound(SHOTGUN_COCK,pi);
                        break;
                    case 17:
                    case 20:
                        p.kickback_pic++;
                        break;
                    case 24:
                        j = spawn(pi,SHOTGUNSHELL);
                        sprite[j].ang += 1024;
                        ssp(j,CLIPMASK0);
                        sprite[j].ang += 1024;
                        p.kickback_pic++;
                        break;
                    case 31:
                        p.kickback_pic = 0;
                        return;
                }
                break;

            case CHAINGUN_WEAPON:

                (p.kickback_pic)++;

                if( p.kickback_pic <= 12 )
                {
                    if( ((p.kickback_pic)%3) == 0 )
                    {
                        p.ammo_amount[CHAINGUN_WEAPON]--;

                        if ((p.kickback_pic % 3) == 0)
                        {
                            j = spawn(pi,SHELL);

                            sprite[j].ang += 1024;
                            sprite[j].ang &= 2047;
                            sprite[j].xvel += 32;
                            sprite[j].z += (3<<8);
                            ssp(j,CLIPMASK0);
                        }

                        spritesound(CHAINGUN_FIRE,pi);
                        shoot(pi,CHAINGUN);
                        lastvisinc = totalclock+32;
                        p.visibility = 0;
                        checkavailweapon(p);

                        if( ( sb_snum&(1<<2) ) == 0 )
                        {
                            p.kickback_pic = 0;
                            break;
                        }
                    }
                }
                else if((p.kickback_pic) > 10)
                {
                    if( sb_snum&(1<<2) ) p.kickback_pic = 1;
                    else p.kickback_pic = 0;
                }

                break;

            case SHRINKER_WEAPON:
            case GROW_WEAPON:
                if(p.curr_weapon == GROW_WEAPON)
                {
                    if((p.kickback_pic) > 3)
                    {
                        p.kickback_pic = 0;
                        if( screenpeek == snum ) pus = 1;
                        p.ammo_amount[GROW_WEAPON]--;
                        shoot(pi,GROWSPARK);

                        p.visibility = 0;
                        lastvisinc = totalclock+32;
                        checkavailweapon(p);
                    }
                    else (p.kickback_pic)++;
                }
                else
                {
                    if( (p.kickback_pic) > 10)
                    {
                        (p.kickback_pic) = 0;

                        p.ammo_amount[SHRINKER_WEAPON]--;
                        shoot(pi,SHRINKER);

                        p.visibility = 0;
                        lastvisinc = totalclock+32;
                        checkavailweapon(p);
                    }
                    else (p.kickback_pic)++;
                }
                break;

            case DEVISTATOR_WEAPON:
                if(p.kickback_pic)
                {
                    (p.kickback_pic)++;

                    if( (p.kickback_pic) & 1 )
                    {
                        p.visibility = 0;
                        lastvisinc = totalclock+32;
                        shoot(pi,RPG);
                        p.ammo_amount[DEVISTATOR_WEAPON]--;
                        checkavailweapon(p);
                    }
                    if((p.kickback_pic) > 5) (p.kickback_pic) = 0;
                }
                break;
            case FREEZE_WEAPON:
                if( (p.kickback_pic) < 4 )
                {
                    (p.kickback_pic)++;
                    if( (p.kickback_pic) == 3 )
                    {
                        p.ammo_amount[FREEZE_WEAPON]--;
                        p.visibility = 0;
                        lastvisinc = totalclock+32;
                        shoot(pi,FREEZEBLAST);
                        checkavailweapon(p);
                    }
                    if(s.xrepeat < 32)
                    { p.kickback_pic = 0; break; }
                }
                else
                {
                    if( sb_snum&(1<<2))
                    {
                        p.kickback_pic = 1;
                        spritesound(CAT_FIRE,pi);
                    }
                    else p.kickback_pic = 0;
                }
                break;

            case TRIPBOMB_WEAPON:
                if(p.kickback_pic < 4)
                {
                    p.posz = p.oposz;
                    p.poszv = 0;
                    if( (p.kickback_pic) == 3 )
                        shoot(pi,HANDHOLDINGLASER);
                }
                if((p.kickback_pic) == 16)
                {
                    (p.kickback_pic) = 0;
                    checkavailweapon(p);
                    p.weapon_pos = -9;
                }
                else (p.kickback_pic)++;
                break;
            case KNEE_WEAPON:
        
                (p.kickback_pic)++;

                if( (p.kickback_pic) == 7) shoot(pi,KNEE);
                else if( (p.kickback_pic) == 14)
                {
                    if( sb_snum&(1<<2) )
                        p.kickback_pic = 1+(krand()&3);
                    else p.kickback_pic = 0;
                }

                if(p.wantweaponfire >= 0)
                    checkavailweapon(p);
                break;

            case RPG_WEAPON:
                (p.kickback_pic)++;
                if( (p.kickback_pic) == 4 )
                {
                    p.ammo_amount[RPG_WEAPON]--;
                    lastvisinc = totalclock+32;
                    p.visibility = 0;
                    shoot(pi,RPG);
                    checkavailweapon(p);
                }
                else if( p.kickback_pic == 20 )
                    p.kickback_pic = 0;
                break;
        }
    }
}