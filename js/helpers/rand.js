'use strict';

Object.defineProperty(window, "NORMAL_RAND", rand); // used for comparing original

function rand() {
    console.log("todo:  rand - make same as c version for testing");
    return Math.random()*10000|0;
} 