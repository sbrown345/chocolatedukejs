'use strict';

var Network = {};

var nNetMode = 0;

Network.initMultiPlayers = function(multiOption, comRateOption, priority) {
    switch (nNetMode) {
        case 0:
            Multi.unstable.initMultiPlayers(multiOption, comRateOption, priority);
            break;
        case 1:
            throw new Error("todo");
            break;
    }
};

Network.flushPackets = function () {
    switch (nNetMode) {
        case 0:
            Multi.unstable.flushPackets();
            break;
        case 1:
            throw new Error("todo");
            break;
    }
};