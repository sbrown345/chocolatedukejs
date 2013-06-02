//'use strict';

var Network = {};

var nNetMode = 0;
//71
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

//157
function getoutputcirclesize() {
//#ifndef USER_DUMMY_NETWORK
    switch(nNetMode)
    {
        case 0:
            return Multi.unstable.getoutputcirclesize();
            Multi.unstable.initMultiPlayers(multiOption, comRateOption, priority);
        case 1:
            throw new Error("todo");
            return stable_getoutputcirclesize();
    }
//#endif
    return 0;
}
//195
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
