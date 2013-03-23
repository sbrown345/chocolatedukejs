'use strict';

function updateinterpolations() {
    throw new Error("todo")
}

function setinterpolation(posptr) {
    var i;

    //todo: (btw, demo plays with this commented out)

    if (numinterpolations >= MAXINTERPOLATIONS) return;
    for (i = numinterpolations - 1; i >= 0; i--)
        if (curipos[i] == posptr) return;
    curipos[numinterpolations] = posptr; //todo: address of...?
    oldipos[numinterpolations] = /* * */posptr; //VALUE OF..?
    numinterpolations++;
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