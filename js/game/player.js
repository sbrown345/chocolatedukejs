'use strict';

var Player = {};

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