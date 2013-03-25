'use strict';

var Sector = {};

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