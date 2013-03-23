'use strict';

var Sector = {};

//2383
Sector.allignWarpElevators = function() {
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