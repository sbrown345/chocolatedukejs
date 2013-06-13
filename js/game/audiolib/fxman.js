//'use strict';

//enum FX_ERRORS
//{
var FX_Warning = -2;
var FX_Error = -1;
var FX_Ok = 0;
//FX_ASSVersion,
//FX_BlasterError,
//FX_SoundCardError,
//FX_InvalidCard,
//FX_MultiVocError,
//FX_DPMI_Error
//};

// todo
var FX = {};

var FX_MixRate;

var FX_SoundDevice = -1;
var FX_ErrorCode = FX_Ok;
var FX_Installed = 0;

function FX_Init(SoundCard,
    numvoices,
    numchannels,
    samplebits,
    mixrate) {
    var status;
    var devicestatus;

    FX_MixRate = mixrate;

    status = FX_Ok;
    FX_SoundDevice = SoundCard;

    devicestatus = MV_Init(SoundCard, FX_MixRate, numvoices,
           numchannels, samplebits);

    FX_Installed = true;

    return status;
}


/*---------------------------------------------------------------------
   Function: FX_SetCallback

   Sets the function to call when a voice is done.
---------------------------------------------------------------------*/

function FX_SetCallBack($function) {
    var status = FX_Ok;

    switch (FX_SoundDevice) {
    case SoundBlaster:
    case Awe32:
    case ProAudioSpectrum:
    case SoundMan16:
    case SoundScape:
    case SoundSource:
    case TandySoundSource:
    case UltraSound:
        MV_SetCallBack($function);
        break;
    default:
        FX_SetErrorCode(FX_InvalidCard);
        status = FX_Error;
    }

    return (status);
}

//364
FX.setVolume = function (volume) {
    MV_SetVolume(volume);
};

//949
FX.stopSound = function () {
    //todo
};

//974
FX.stopAllSounds = function () {
    //todo
};

//421
FX.setReverb = function () {
    //todo
};

//485
FX.setReverbDelay = function () {
    //todo
};

//502

function FX_VoiceAvailable(priority) {
    return MV_VoiceAvailable(priority);
}

//502