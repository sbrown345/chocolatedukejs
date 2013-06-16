//'use strict';


//h
var MONO_8BIT = 0;
var STEREO = 1;
var SIXTEEN_BIT = 2;
var STEREO_16BIT = (STEREO | SIXTEEN_BIT);

var DSL_Warning = -2,
    DSL_Error = -1,
    DSL_Ok = 0;

//c
var DSL_ErrorCode = DSL_Ok;

var mixer_initialized;

var _CallBackFunc;
var _BufferStart;
var _BufferSize;
var _NumDivisions;
var _SampleRate;
var _remainder;

var blank;
var blank_buf;

//87

function mixer_callback(chan, stream, len, udata) {
    _CallBackFunc();



    ////var stptr;
    ////var fxptr;
    ////var copysize;

    /////* len should equal _BufferSize, else this is screwed up */

    ////stptr = /*(Uint8 *)*/stream;

    ////if (_remainder > 0) {
    ////    copysize = min(len, _remainder);

    ////    fxptr = /*(Uint8 *)*/(_BufferStart[MV_MixPage *
	////		_BufferSize]);

    ////    throw "todo memcpy(stptr, fxptr+(_BufferSize-_remainder), copysize);"

    ////    len -= copysize;
    ////    _remainder -= copysize;

    ////    stptr += copysize;
    ////}

    ////while (len > 0) {
    ////    /* new buffer */

    ////    _CallBackFunc();

    ////    fxptr = /*(Uint8 *)*/(_BufferStart[MV_MixPage *
	////		_BufferSize]);

    ////    copysize = min(len, _BufferSize);

    ////    memcpy(stptr, fxptr, copysize);

    ////    len -= copysize;

    ////    stptr += copysize;
    ////}

    ////_remainder = len;
}

//131 
function DSL_BeginBufferedPlayback(BufferStart,
       BufferSize, NumDivisions, SampleRate,
       MixMode, CallBackFunc) {
    var format;
    var channels;
    var chunksize;
    var blah;

    if (mixer_initialized) {
        DSL_SetErrorCode(DSL_MixerActive);

        return DSL_Error;
    }

    _CallBackFunc = CallBackFunc;
    _BufferStart = BufferStart;
    _BufferSize = (BufferSize / NumDivisions) | 0;
    _NumDivisions = NumDivisions;
    _SampleRate = SampleRate;

    _remainder = 0;

    format = (MixMode & SIXTEEN_BIT) ? 0x8010/*AUDIO_S16LSB*/ : 0x0008/*AUDIO_U8*/;
    channels = (MixMode & STEREO) ? 2 : 1;

    /*
       I find 50ms to be ideal, at least with my hardware. This clamping mechanism
       was added because it seems the above remainder handling isn't so nice --kode54
    */
    chunksize = (5 * SampleRate) / 100 | 0;

    blah = _BufferSize;
    if (MixMode & SIXTEEN_BIT) blah >>= 1;
    if (MixMode & STEREO) blah >>= 1;

    if (chunksize % blah) chunksize += blah - (chunksize % blah);

    //if (Mix_OpenAudio(SampleRate, format, channels, chunksize) < 0) {
    //	DSL_SetErrorCode(DSL_MixerInitFailure);

    //return DSL_Error;
    //}

    /*
        Mix_SetPostMix(mixer_callback, NULL);
    */
    /* have to use a channel because postmix will overwrite the music... */
    //Mix_RegisterEffect(0, mixer_callback, null, null); // run this at end

    /* create a dummy sample just to allocate that channel */
    //blank_buf = (Uint8 *)malloc(4096);
    //memset(blank_buf, 0, 4096);

    blank = new Uint8Array(4096); // Mix_QuickLoad_RAW(blank_buf, 4096);

    //Mix_PlayChannel(0, blank, -1); ??

    mixer_initialized = 1;

    return DSL_Ok;
}


//219

function DSL_GetPlaybackRate() {
    return _SampleRate;
}