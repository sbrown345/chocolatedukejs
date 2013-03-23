'use strict';

function updateinterpolations() {
    throw new Error("todo")
}

function setinterpolation(posptr) {
    var i;

    //todo: (btw, demo plays with this commented out)

    if (numinterpolations >= MAXINTERPOLATIONS) return;
    for(i=numinterpolations-1;i>=0;i--)
        if (curipos[i] == posptr) return;
    curipos[numinterpolations] = posptr; //todo: address of...?
    oldipos[numinterpolations] = /* * */posptr; //VALUE OF..?
    numinterpolations++;
}