'use strict';

var Sector = {};

//124
function isadoorwall(dapic) {
    switch (dapic) {
    case DOORTILE1:
    case DOORTILE2:
    case DOORTILE3:
    case DOORTILE4:
    case DOORTILE5:
    case DOORTILE6:
    case DOORTILE7:
    case DOORTILE8:
    case DOORTILE9:
    case DOORTILE10:
    case DOORTILE11:
    case DOORTILE12:
    case DOORTILE14:
    case DOORTILE15:
    case DOORTILE16:
    case DOORTILE17:
    case DOORTILE18:
    case DOORTILE19:
    case DOORTILE20:
    case DOORTILE21:
    case DOORTILE22:
    case DOORTILE23:
        return 1;
    }
    return 0;
}

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

//194
function checkcursectnums(sect) {
    var i;
    for(i=connecthead;i>=0;i=connectpoint2[i])
        if( sprite[ps[i].i].sectnum == sect ) return i;
    return -1;
}


//194
function dist(s1,s2)
{
    var vx,vy,vz;
    vx = s1.x - s2.x;
    vy = s1.y - s2.y;
    vz = s1.z - s2.z;
    return(FindDistance3D(vx,vy,vz>>4));
}

function ldist(s1,s2) {
    var vx,vy;
    vx = s1.x - s2.x;
    vy = s1.y - s2.y;
    return(FindDistance2D(vx,vy) + 1);
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

//267
function doanimations() {
    var i, j, a, p, v, dasect;

    printf("doanimations\n");
    for (i = animatecnt - 1; i >= 0; i--)
    {
        throw "todo"
        //a = *animateptr[i];
        //v = animatevel[i]*TICSPERFRAME;
        //dasect = animatesect[i];

        //if (a == animategoal[i])
        //{
        //    stopinterpolation(animateptr[i]);

        //    animatecnt--;
        //    animateptr[i] = animateptr[animatecnt];
        //    animategoal[i] = animategoal[animatecnt];
        //    animatevel[i] = animatevel[animatecnt];
        //    animatesect[i] = animatesect[animatecnt];
        //    if( sector[animatesect[i]].lotag == 18 || sector[animatesect[i]].lotag == 19 )
        //        if(animateptr[i] == sector[animatesect[i]].ceilingz)
        //            continue;

        //    if( (sector[dasect].lotag&0xff) != 22 )
        //        callsound(dasect,-1);

        //    continue;
        //}

        //if (v > 0) { a = Math.min(a+v,animategoal[i]); }
        //else { a = Math.max(a+v,animategoal[i]); }

        //if( animateptr[i] == sector[animatesect[i]].floorz)
        //{
        //    for(p=connecthead;p>=0;p=connectpoint2[p])
        //        if (ps[p].cursectnum == dasect)
        //            if ((sector[dasect].floorz-ps[p].posz) < (64<<8))
        //                if (sprite[ps[p].i].owner >= 0)
        //                {
        //                    ps[p].posz += v;
        //                    ps[p].poszv = 0;
        //                    if (p == myconnectindex)
        //                    {
        //                        myz += v;
        //                        myzvel = 0;
        //                        myzbak[((movefifoplc-1)&(MOVEFIFOSIZ-1))] = ps[p].posz;
        //                    }
        //                }

        //    for(j=headspritesect[dasect];j>=0;j=nextspritesect[j])
        //        if (sprite[j].statnum != 3)
        //        {
        //            hittype[j].bposz = sprite[j].z;
        //            sprite[j].z += v;
        //            hittype[j].floorz = sector[dasect].floorz+v;
        //        }
        //}

        //*animateptr[i] = a;
    }
}

//338
function getanimationgoal(animptr)
{
    var i, j;

    j = -1;
    for(i=animatecnt-1;i>=0;i--) {
        throw "todo"
        //if (animptr == (int32_t *)animateptr[i])
        //{
        //    j = i;
        //    break;
        //}
    }
    return(j);
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


function animatewalls() {
    var i, j, p, t;

    for(p=0;p < numanimwalls ;p++)
        //    for(p=numanimwalls-1;p>=0;p--)
    {
        i = animwall[p].wallnum;
        j = wall[i].picnum;

        switch(j)
        {
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

                if( (krand()&255) < 16)
                {
                    animwall[p].tag = wall[i].picnum;
                    wall[i].picnum = SCREENBREAK6;
                }

                continue;

            case SCREENBREAK6:
            case SCREENBREAK7:
            case SCREENBREAK8:

                if(animwall[p].tag >= 0 && wall[i].extra != FEMPIC2 && wall[i].extra != FEMPIC3 )
                    wall[i].picnum = animwall[p].tag;
                else
                {
                    wall[i].picnum++;
                    if(wall[i].picnum == (SCREENBREAK6+3) )
                        wall[i].picnum = SCREENBREAK6;
                }
                continue;

        }

        if(wall[i].cstat&16)
            switch(wall[i].overpicnum)
            {
                case W_FORCEFIELD:
                case W_FORCEFIELD+1:
                case W_FORCEFIELD+2:

                    t = animwall[p].tag;

                    if(wall[i].cstat&254)
                    {
                        wall[i].xpanning -= t>>10; // sintable[(t+512)&2047]>>12;
                        wall[i].ypanning -= t>>10; // sintable[t&2047]>>12;

                        if(wall[i].extra == 1)
                        {
                            wall[i].extra = 0;
                            animwall[p].tag = 0;
                        }
                        else
                            animwall[p].tag+=128;

                        if( animwall[p].tag < (128<<4) )
                        {
                            if( animwall[p].tag&128 )
                                wall[i].overpicnum = W_FORCEFIELD;
                            else wall[i].overpicnum = W_FORCEFIELD+1;
                        }
                        else
                        {
                            if( (krand()&255) < 32 )
                                animwall[p].tag = 128<<(krand()&3);
                            else wall[i].overpicnum = W_FORCEFIELD+1;
                        }
                    }

                    break;
            }
    }
}

//1568

function checkhitwall(spr,dawallnum,x, y, z, atwith)
{
    var  j, i, sn = -1, darkestwall;
    var wal;
   

    wal = wall[dawallnum];

    if(wal.overpicnum == MIRROR)
    {
        switch(atwith)
        {
            case HEAVYHBOMB:
            case RADIUSEXPLOSION:
            case RPG:
            case HYDRENT:
            case SEENINE:
            case OOZFILTER:
            case EXPLODINGBARREL:
                lotsofglass(spr,dawallnum,70);
                wal.cstat &= ~16;
                wal.overpicnum = MIRRORBROKE;
                spritesound(GLASS_HEAVYBREAK,spr);
                return;
        }
    }

    if( ( (wal.cstat&16) || wal.overpicnum == BIGFORCE ) && wal.nextsector >= 0 )
        if( sector[wal.nextsector].floorz > z )
            if( sector[wal.nextsector].floorz-sector[wal.nextsector].ceilingz )
                switch(wal.overpicnum)
                {
                    case W_FORCEFIELD:
                    case W_FORCEFIELD+1:
                    case W_FORCEFIELD+2:
                        wal.extra = 1; // tell the forces to animate
                    case BIGFORCE:
                        var snRef = new Ref(sn);
                        updatesector(x,y,snRef);
                        sn = snRef.$;
                        if( sn < 0 ) return;

                        if(atwith == -1)
                            i = EGS(sn,x,y,z,FORCERIPPLE,-127,8,8,0,0,0,spr,5);
                        else
                        {
                            if(atwith == CHAINGUN)
                                i = EGS(sn,x,y,z,FORCERIPPLE,-127,16+sprite[spr].xrepeat,16+sprite[spr].yrepeat,0,0,0,spr,5);
                            else i = EGS(sn,x,y,z,FORCERIPPLE,-127,32,32,0,0,0,spr,5);
                        }

                        sprite[i].cstat |= 18+128;
                        sprite[i].ang = getangle(wal.x-wall[wal.point2].x,
                            wal.y-wall[wal.point2].y)-512;

                        spritesound(SOMETHINGHITFORCE,i);

                        return;

                    case FANSPRITE:
                        wal.overpicnum = FANSPRITEBROKE;
                        wal.cstat &= 65535-65;
                        if(wal.nextwall >= 0)
                        {
                            wall[wal.nextwall].overpicnum = FANSPRITEBROKE;
                            wall[wal.nextwall].cstat &= 65535-65;
                        }
                        spritesound(VENT_BUST,spr);
                        spritesound(GLASS_BREAKING,spr);
                        return;

                    case GLASS:
                        var snRef = new Ref(sn);
                        updatesector(x,y,snRef); 
                        sn = snRef.$;
                        if( sn < 0 ) return;
                        wal.overpicnum=GLASS2;
                        lotsofglass(spr,dawallnum,10);
                        wal.cstat = 0;

                        if(wal.nextwall >= 0)
                            wall[wal.nextwall].cstat = 0;

                        i = EGS(sn,x,y,z,SECTOREFFECTOR,0,0,0,ps[0].ang,0,0,spr,3);
                        sprite[i].lotag = 128; hittype[i].temp_data[1] = 5; hittype[i].temp_data[2] = dawallnum;
                        spritesound(GLASS_BREAKING,i);
                        return;
                    case STAINGLASS1:
                        var snRef = new Ref(sn);
                        updatesector(x,y,snRef);
                        sn = snRef.$;
                        if( sn < 0 ) return;
                        sn = snRef.$;
                        lotsofcolourglass(spr,dawallnum,80);
                        wal.cstat = 0;
                        if(wal.nextwall >= 0)
                            wall[wal.nextwall].cstat = 0;
                        spritesound(VENT_BUST,spr);
                        spritesound(GLASS_BREAKING,spr);
                        return;
                }

    switch(wal.picnum)
    {
        case COLAMACHINE:
        case VENDMACHINE:
            breakwall(wal.picnum+2,spr,dawallnum);
            spritesound(VENT_BUST,spr);
            return;

        case OJ:
        case FEMPIC2:
        case FEMPIC3:

        case SCREENBREAK6:
        case SCREENBREAK7:
        case SCREENBREAK8:

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
        case BORNTOBEWILDSCREEN:

            lotsofglass(spr,dawallnum,30);
            wal.picnum=W_SCREENBREAK+(krand()%3);
            spritesound(GLASS_HEAVYBREAK,spr);
            return;

        case W_TECHWALL5:
        case W_TECHWALL6:
        case W_TECHWALL7:
        case W_TECHWALL8:
        case W_TECHWALL9:
            breakwall(wal.picnum+1,spr,dawallnum);
            return;
        case W_MILKSHELF:
            breakwall(W_MILKSHELFBROKE,spr,dawallnum);
            return;

        case W_TECHWALL10:
            breakwall(W_HITTECHWALL10,spr,dawallnum);
            return;

        case W_TECHWALL1:
        case W_TECHWALL11:
        case W_TECHWALL12:
        case W_TECHWALL13:
        case W_TECHWALL14:
            breakwall(W_HITTECHWALL1,spr,dawallnum);
            return;

        case W_TECHWALL15:
            breakwall(W_HITTECHWALL15,spr,dawallnum);
            return;

        case W_TECHWALL16:
            breakwall(W_HITTECHWALL16,spr,dawallnum);
            return;

        case W_TECHWALL2:
            breakwall(W_HITTECHWALL2,spr,dawallnum);
            return;

        case W_TECHWALL3:
            breakwall(W_HITTECHWALL3,spr,dawallnum);
            return;

        case W_TECHWALL4:
            breakwall(W_HITTECHWALL4,spr,dawallnum);
            return;

        case ATM:
            wal.picnum = ATMBROKE;
            lotsofmoney(sprite[spr],1+(krand()&7));
            spritesound(GLASS_HEAVYBREAK,spr);
            break;

        case WALLLIGHT1:
        case WALLLIGHT2:
        case WALLLIGHT3:
        case WALLLIGHT4:
        case TECHLIGHT2:
        case TECHLIGHT4:

            if( rnd(128) )
                spritesound(GLASS_HEAVYBREAK,spr);
            else spritesound(GLASS_BREAKING,spr);
            lotsofglass(spr,dawallnum,30);

            if(wal.picnum == WALLLIGHT1)
                wal.picnum = WALLLIGHTBUST1;

            if(wal.picnum == WALLLIGHT2)
                wal.picnum = WALLLIGHTBUST2;

            if(wal.picnum == WALLLIGHT3)
                wal.picnum = WALLLIGHTBUST3;

            if(wal.picnum == WALLLIGHT4)
                wal.picnum = WALLLIGHTBUST4;

            if(wal.picnum == TECHLIGHT2)
                wal.picnum = TECHLIGHTBUST2;

            if(wal.picnum == TECHLIGHT4)
                wal.picnum = TECHLIGHTBUST4;

            if(!wal.lotag) return;

            sn = wal.nextsector;
            if(sn < 0) return;
            darkestwall = 0;

            wal = wall[sector[sn].wallptr];
            throw "todo wal cannot be ++- its an  object!!"
            for(i=sector[sn].wallnum;i > 0;i--,wal++)
                if(wal.shade > darkestwall)
                    darkestwall=wal.shade;

            j = krand()&1;
            i= headspritestat[3];
            while(i >= 0)
            {
                if(sprite[i].hitag == wall[dawallnum].lotag && sprite[i].lotag == 3 )
                {
                    hittype[i].temp_data[2] = j;
                    hittype[i].temp_data[3] = darkestwall;
                    hittype[i].temp_data[4] = 1;
                }
                i = nextspritestat[i];
            }
            break;
    }
}



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

// 1948
function checkhitsprite( i, sn) {
    var j, k, p;
    var s;

    i &= (MAXSPRITES-1);

    switch(sprite[i].picnum)
    {
        case OCEANSPRITE1:
        case OCEANSPRITE2:
        case OCEANSPRITE3:
        case OCEANSPRITE4:
        case OCEANSPRITE5:
            spawn(i,SMALLSMOKE);
            deletesprite(i);
            break;
        case QUEBALL:
        case STRIPEBALL:
            if(sprite[sn].picnum == QUEBALL || sprite[sn].picnum == STRIPEBALL)
            {
                sprite[sn].xvel = (sprite[i].xvel>>1)+(sprite[i].xvel>>2);
                sprite[sn].ang -= (sprite[i].ang<<1)+1024;
                sprite[i].ang = getangle(sprite[i].x-sprite[sn].x,sprite[i].y-sprite[sn].y)-512;
                if(Sound[POOLBALLHIT].num < 2)
                    spritesound(POOLBALLHIT,i);
            }
            else
            {
                if( krand()&3 )
                {
                    sprite[i].xvel = 164;
                    sprite[i].ang = sprite[sn].ang;
                }
                else
                {
                    lotsofglass(i,-1,3);
                    deletesprite(i);
                }
            }
            break;
        case TREE1:
        case TREE2:
        case TIRE:
        case CONE:
        case BOX:
            switch(sprite[sn].picnum)
            {
                case RADIUSEXPLOSION:
                case RPG:
                case FIRELASER:
                case HYDRENT:
                case HEAVYHBOMB:
                    if(hittype[i].temp_data[0] == 0)
                    {
                        sprite[i].cstat &= ~257;
                        hittype[i].temp_data[0] = 1;
                        spawn(i,BURNING);
                    }
                    break;
            }
            break;
        case CACTUS:
            //        case CACTUSBROKE:
            switch(sprite[sn].picnum)
            {
                case RADIUSEXPLOSION:
                case RPG:
                case FIRELASER:
                case HYDRENT:
                case HEAVYHBOMB:
                    for(k=0;k<64;k++)
                    {
                        j = EGS(sprite[i].sectnum,sprite[i].x,sprite[i].y,sprite[i].z-(krand()%(48<<8)),SCRAP3+(krand()&3),-8,48,48,krand()&2047,(krand()&63)+64,-(krand()&4095)-(sprite[i].zvel>>2),i,5);
                        sprite[j].pal = 8;
                    }

                    if(sprite[i].picnum == CACTUS)
                        sprite[i].picnum = CACTUSBROKE;
                    sprite[i].cstat &= ~257;
                    //       else deletesprite(i);
                    break;
            }
            break;

        case HANGLIGHT:
        case GENERICPOLE2:
            for(k=0;k<6;k++)
                EGS(sprite[i].sectnum,sprite[i].x,sprite[i].y,sprite[i].z-(8<<8),SCRAP1+(krand()&15),-8,48,48,krand()&2047,(krand()&63)+64,-(krand()&4095)-(sprite[i].zvel>>2),i,5);
            spritesound(GLASS_HEAVYBREAK,i);
            deletesprite(i);
            break;


        case FANSPRITE:
            sprite[i].picnum = FANSPRITEBROKE;
            sprite[i].cstat &= (65535-257);
            if( sector[sprite[i].sectnum].floorpicnum == FANSHADOW )
                sector[sprite[i].sectnum].floorpicnum = FANSHADOWBROKE;

            spritesound(GLASS_HEAVYBREAK,i);
            s = sprite[i];
            for(j=0;j<16;j++) RANDOMSCRAP;

            break;
        case WATERFOUNTAIN:
        case WATERFOUNTAIN+1:
        case WATERFOUNTAIN+2:
        case WATERFOUNTAIN+3:
            sprite[i].picnum = WATERFOUNTAINBROKE;
            spawn(i,TOILETWATER);
            break;
        case SATELITE:
        case FUELPOD:
        case SOLARPANNEL:
        case ANTENNA:
            if(sprite[sn].extra != script[actorscrptr[SHOTSPARK1]] )
            {
                for(j=0;j<15;j++)
                    EGS(sprite[i].sectnum,sprite[i].x,sprite[i].y,sector[sprite[i].sectnum].floorz-(12<<8)-(j<<9),SCRAP1+(krand()&15),-8,64,64,
                        krand()&2047,(krand()&127)+64,-(krand()&511)-256,i,5);
                spawn(i,EXPLOSION2);
                deletesprite(i);
            }
            break;
        case BOTTLE1:
        case BOTTLE2:
        case BOTTLE3:
        case BOTTLE4:
        case BOTTLE5:
        case BOTTLE6:
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
        case WATERFOUNTAINBROKE:
        case DOMELITE:
        case SUSHIPLATE1:
        case SUSHIPLATE2:
        case SUSHIPLATE3:
        case SUSHIPLATE4:
        case SUSHIPLATE5:
        case WAITTOBESEATED:
        case VASE:
        case STATUEFLASH:
        case STATUE:
            if(sprite[i].picnum == BOTTLE10)
                lotsofmoney(sprite[i],4+(krand()&3));
            else if(sprite[i].picnum == STATUE || sprite[i].picnum == STATUEFLASH)
            {
                lotsofcolourglass(i,-1,40);
                spritesound(GLASS_HEAVYBREAK,i);
            }
            else if(sprite[i].picnum == VASE)
                lotsofglass(i,-1,40);

            spritesound(GLASS_BREAKING,i);
            sprite[i].ang = krand()&2047;
            lotsofglass(i,-1,8);
            deletesprite(i);
            break;
        case FETUS:
            sprite[i].picnum = FETUSBROKE;
            spritesound(GLASS_BREAKING,i);
            lotsofglass(i,-1,10);
            break;
        case FETUSBROKE:
            for(j=0;j<48;j++)
            {
                shoot(i,BLOODSPLAT1);
                sprite[i].ang += 333;
            }
            spritesound(GLASS_HEAVYBREAK,i);
            spritesound(SQUISHED,i);
        case BOTTLE7:
            spritesound(GLASS_BREAKING,i);
            lotsofglass(i,-1,10);
            deletesprite(i);
            break;
        case HYDROPLANT:
            sprite[i].picnum = BROKEHYDROPLANT;
            spritesound(GLASS_BREAKING,i);
            lotsofglass(i,-1,10);
            break;

        case FORCESPHERE:
            sprite[i].xrepeat = 0;
            hittype[sprite[i].owner].temp_data[0] = 32;
            hittype[sprite[i].owner].temp_data[1] = !hittype[sprite[i].owner].temp_data[1];
            hittype[sprite[i].owner].temp_data[2] ++;
            spawn(i,EXPLOSION2);
            break;

        case BROKEHYDROPLANT:
            if(sprite[i].cstat&1)
            {
                spritesound(GLASS_BREAKING,i);
                sprite[i].z += 16<<8;
                sprite[i].cstat = 0;
                lotsofglass(i,-1,5);
            }
            break;

        case TOILET:
            sprite[i].picnum = TOILETBROKE;
            sprite[i].cstat |= (krand()&1)<<2;
            sprite[i].cstat &= ~257;
            spawn(i,TOILETWATER);
            spritesound(GLASS_BREAKING,i);
            break;

        case STALL:
            sprite[i].picnum = STALLBROKE;
            sprite[i].cstat |= (krand()&1)<<2;
            sprite[i].cstat &= ~257;
            spawn(i,TOILETWATER);
            spritesound(GLASS_HEAVYBREAK,i);
            break;

        case HYDRENT:
            sprite[i].picnum = BROKEFIREHYDRENT;
            spawn(i,TOILETWATER);

            //            for(k=0;k<5;k++)
            //          {
            //            j = EGS(sprite[i].sectnum,sprite[i].x,sprite[i].y,sprite[i].z-(krand()%(48<<8)),SCRAP3+(krand()&3),-8,48,48,krand()&2047,(krand()&63)+64,-(krand()&4095)-(sprite[i].zvel>>2),i,5);
            //          sprite[j].pal = 2;
            //    }
            spritesound(GLASS_HEAVYBREAK,i);
            break;

        case GRATE1:
            sprite[i].picnum = BGRATE1;
            sprite[i].cstat &= (65535-256-1);
            spritesound(VENT_BUST,i);
            break;

        case CIRCLEPANNEL:
            sprite[i].picnum = CIRCLEPANNELBROKE;
            sprite[i].cstat &= (65535-256-1);
            spritesound(VENT_BUST,i);
            break;
        case PANNEL1:
        case PANNEL2:
            sprite[i].picnum = BPANNEL1;
            sprite[i].cstat &= (65535-256-1);
            spritesound(VENT_BUST,i);
            break;
        case PANNEL3:
            sprite[i].picnum = BPANNEL3;
            sprite[i].cstat &= (65535-256-1);
            spritesound(VENT_BUST,i);
            break;
        case PIPE1:
        case PIPE2:
        case PIPE3:
        case PIPE4:
        case PIPE5:
        case PIPE6:
            switch(sprite[i].picnum)
            {
                case PIPE1:sprite[i].picnum=PIPE1B;break;
                case PIPE2:sprite[i].picnum=PIPE2B;break;
                case PIPE3:sprite[i].picnum=PIPE3B;break;
                case PIPE4:sprite[i].picnum=PIPE4B;break;
                case PIPE5:sprite[i].picnum=PIPE5B;break;
                case PIPE6:sprite[i].picnum=PIPE6B;break;
            }

            j = spawn(i,STEAM);
            sprite[j].z = sector[sprite[i].sectnum].floorz-(32<<8);
            break;

        case MONK:
        case LUKE:
        case INDY:
        case JURYGUY:
            spritesound(sprite[i].lotag,i);
            spawn(i,sprite[i].hitag);
        case SPACEMARINE:
            sprite[i].extra -= sprite[sn].extra;
            if(sprite[i].extra > 0) break;
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT1);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT2);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT3);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT4);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT1);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT2);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT3);
            sprite[i].ang = krand()&2047;
            shoot(i,BLOODSPLAT4);
            guts(sprite[i],JIBS1,1,myconnectindex);
            guts(sprite[i],JIBS2,2,myconnectindex);
            guts(sprite[i],JIBS3,3,myconnectindex);
            guts(sprite[i],JIBS4,4,myconnectindex);
            guts(sprite[i],JIBS5,1,myconnectindex);
            guts(sprite[i],JIBS3,6,myconnectindex);
            sound(SQUISHED);
            deletesprite(i);
            break;
        case CHAIR1:
        case CHAIR2:
            sprite[i].picnum = BROKENCHAIR;
            sprite[i].cstat = 0;
            break;
        case CHAIR3:
        case MOVIECAMERA:
        case SCALE:
        case VACUUM:
        case CAMERALIGHT:
        case IVUNIT:
        case POT1:
        case POT2:
        case POT3:
        case TRIPODCAMERA:
            spritesound(GLASS_HEAVYBREAK,i);
            s = sprite[i];
            for(j=0;j<16;j++) RANDOMSCRAP;
            deletesprite(i);
            break;
        case PLAYERONWATER:
            i = sprite[i].owner;
        default:
            if( (sprite[i].cstat&16) && sprite[i].hitag == 0 && sprite[i].lotag == 0 && sprite[i].statnum == 0)
                break;

            if( ( sprite[sn].picnum == FREEZEBLAST || sprite[sn].owner != i ) && sprite[i].statnum != 4)
            {
                if( badguy(sprite[i]) == 1)
                {
                    if(sprite[sn].picnum == RPG) sprite[sn].extra <<= 1;

                    if( (sprite[i].picnum != DRONE) && (sprite[i].picnum != ROTATEGUN) && (sprite[i].picnum != COMMANDER) && (sprite[i].picnum < GREENSLIME || sprite[i].picnum > GREENSLIME+7) )
                        if(sprite[sn].picnum != FREEZEBLAST )
                            if( actortype[sprite[i].picnum] == 0 )
                            {
                                j = spawn(sn,JIBS6);
                                if(sprite[sn].pal == 6)
                                    sprite[j].pal = 6;
                                sprite[j].z += (4<<8);
                                sprite[j].xvel = 16;
                                sprite[j].xrepeat = sprite[j].yrepeat = 24;
                                sprite[j].ang += 32-(krand()&63);
                            }

                    j = sprite[sn].owner;

                    if( j >= 0 && sprite[j].picnum == APLAYER && sprite[i].picnum != ROTATEGUN && sprite[i].picnum != DRONE )
                        if( ps[sprite[j].yvel].curr_weapon == SHOTGUN_WEAPON )
                        {
                            shoot(i,BLOODSPLAT3);
                            shoot(i,BLOODSPLAT1);
                            shoot(i,BLOODSPLAT2);
                            shoot(i,BLOODSPLAT4);
                        }

                    if( sprite[i].picnum != TANK && sprite[i].picnum != BOSS1 && sprite[i].picnum != BOSS4 && sprite[i].picnum != BOSS2 && sprite[i].picnum != BOSS3 && sprite[i].picnum != RECON && sprite[i].picnum != ROTATEGUN )
                    {
                        if( (sprite[i].cstat&48) == 0 )
                            sprite[i].ang = (sprite[sn].ang+1024)&2047;
                        sprite[i].xvel = -(sprite[sn].extra<<2);
                        j = sprite[i].sectnum;
                        var xRef = new Ref(sprite[i].x);
                        var yRef = new Ref(sprite[i].y);
                        var zRef = new Ref(sprite[i].z);
                        var jRef = new Ref(j);
                        pushmove(xRef,yRef,zRef,jRef,128,(4<<8),(4<<8),CLIPMASK0);
                        sprite[i].x = xRef.$;
                        sprite[i].y = yRef.$;
                        sprite[i].z = zRef.$;
                        j = jRef.$;
                        
                        if(j != sprite[i].sectnum && j >= 0 && j < MAXSECTORS)
                            changespritesect(i,j);
                    }

                    if(sprite[i].statnum == 2)
                    {
                        changespritestat(i,1);
                        hittype[i].timetosleep = SLEEPTIME;
                    }
                    if( ( sprite[i].xrepeat < 24 || sprite[i].picnum == SHARK) && sprite[sn].picnum == SHRINKSPARK) return;
                }

                if( sprite[i].statnum != 2 )
                {
                    if( sprite[sn].picnum == FREEZEBLAST && ( (sprite[i].picnum == APLAYER && sprite[i].pal == 1 ) || ( freezerhurtowner == 0 && sprite[sn].owner == i ) ) )
                        return;

                    hittype[i].picnum = sprite[sn].picnum;
                    hittype[i].extra += sprite[sn].extra;
                    hittype[i].ang = sprite[sn].ang;
                    hittype[i].owner = sprite[sn].owner;
                }

                if(sprite[i].statnum == 10)
                {
                    p = sprite[i].yvel;
                    if(ps[p].newowner >= 0)
                    {
                        ps[p].newowner = -1;
                        ps[p].posx = ps[p].oposx;
                        ps[p].posy = ps[p].oposy;
                        ps[p].posz = ps[p].oposz;
                        ps[p].ang = ps[p].oang;

                        updatesector(ps[p].posx,ps[p].posy,ps[p].cursectnum);
                        Player.setPal(ps[p]);

                        j = headspritestat[1];
                        while(j >= 0)
                        {
                            if(sprite[j].picnum==CAMERA1) sprite[j].yvel = 0;
                            j = nextspritestat[j];
                        }
                    }

                    if( sprite[i].xrepeat < 24 && sprite[sn].picnum == SHRINKSPARK)
                        return;

                    if( sprite[hittype[i].owner].picnum != APLAYER)
                        if(ud.player_skill >= 3)
                            sprite[sn].extra += (sprite[sn].extra>>1);
                }

            }
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
        //                            Player.setPal(p);
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
        //                        Player.setPal(p);


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