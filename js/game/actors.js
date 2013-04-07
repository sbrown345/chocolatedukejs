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
            //retval = clipmove(&sprite[spritenum].x,&sprite[spritenum].y,&daz,&dasectnum,((xchange*TICSPERFRAME)<<11),((ychange*TICSPERFRAME)<<11),1024L,(4<<8),(4<<8),cliptype);
        } else {
            if (sprite[spritenum].picnum == LIZMAN)
                cd = 292;
            else if ((actortype[sprite[spritenum].picnum] & 3))
                cd = sprite[spritenum].clipdist << 2;
            else
                cd = 192;

            throw "todo ref obj"
            //retval = clipmove(&sprite[spritenum].x,&sprite[spritenum].y,&daz,&dasectnum,((xchange*TICSPERFRAME)<<11),((ychange*TICSPERFRAME)<<11),cd,(4<<8),(4<<8),cliptype);
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

//1133
function movedummyplayers() {
    var i, p, nexti;

    i = headspritestat[13];
    while(i >= 0)
    {

        for (; ;) {
            
        }

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
        setsprite(i,sprite[i].x,sprite[i].y,sprite[i].z);
    }
}