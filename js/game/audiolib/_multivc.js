//'use strict';

var MV_MaxPanPosition = 31;
var MV_NumPanPositions = (MV_MaxPanPosition + 1);
var MV_MaxTotalVolume = 255;

function MIX_VOLUME(volume) {
    return ((Math.max(0, Math.min((volume), 255)) * (MV_MaxVolume + 1)) >> 8);
}

var SILENCE_16BIT = 0;
var SILENCE_8BIT = 0x80808080;

var MixBufferSize = 256;

var NumberOfBuffers = 16;
var TotalBufferSize = (MixBufferSize * NumberOfBuffers);