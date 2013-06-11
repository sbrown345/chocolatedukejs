//'use strict';

//h
var MV_MaxPanPosition = 31;
var MV_NumPanPositions = (MV_MaxPanPosition + 1);
var MV_MaxTotalVolume = 255;

function MIX_VOLUME(volume) {
    return ((Math.max(0, Math.min((volume), 255)) * (MV_MaxVolume + 1)) >> 8);
}

//76
// wavedata enum
var Raw = 0,
    VOC = 1,
    DemandFeed = 2,
    WAV = 3;

//91

function VoiceNode() {
    this.next = null;
    this.prev = null;

    this.wavetype = 0;
    this.bits = 0;

    //playbackstatus ( *GetSound )( struct VoiceNode *voice );

    //void ( *mix )( unsigned long position, unsigned long rate,
    //   uint8_t *start, unsigned long length );

    this.NextBlock = null;
    this.LoopStart = null;
    this.LoopEnd = null;
    this.LoopCount = 0;
    this.LoopSize = 0;
    this.BlockLength = 0;

    this.PitchScale = 0;
    this.FixedPointBufferSize = 0;

    this.sound = null;
    this.length = 0;
    this.SamplingRate = 0;
    this.RateScale = 0;
    this.position = 0;
    this.Playing = 0;

    this.handle = 0;
    this.priority = 0;

    //void          ( *DemandFeed )( char **ptr, uint32_t *length );

    this.LeftVolume = 0;
    this.RightVolume = 0;

    this.GLast = 0;
    this.GPos = 0;
    this.GVal = new Int32Array(4);

    this.callbackval = 0;
}

//148

function Pan() {
    this.left = -0;
    this.right = 0;
}

// c
//90
var MV_PanTable = new Array(MV_NumPanPositions);
for (var i = 0; i < MV_PanTable.length; i++) {
    MV_PanTable[i] = structArray(Pan, 63 + 1);
}

var MV_Installed = 0;
var MV_SoundCard = SoundBlaster;
var MV_TotalVolume = MV_MaxTotalVolume;
var MV_MaxVoices = 1;
var MV_Recording;

//137
var MV_MaxVolume = 63;


//381
/*---------------------------------------------------------------------
   Function: MV_PlayVoice

   Adds a voice to the play list.
---------------------------------------------------------------------*/
var audioContext, audioAnalyser; // todo: move to init
if (typeof AudioContext == "function") {
    audioContext = new AudioContext();
} else if (typeof webkitAudioContext == "function") {
    audioContext = new webkitAudioContext();
}

//if (audioContext) {
//    audioAnalyser = audioContext.createAnalyser();
//    audioAnalyser.connect(audioContext.destination);
//    setInterval(drawSpectrum, 1000);
//}

function MV_PlayVoice(voice) {
    if (!audioContext) {
        // todo: support <audio> like sound.html
        return;
    }

    console.log("MV_PlayVoice", voice);

    // source - gainLeft/gainRight - merger - dest
    var source = audioContext.createBufferSource();

    var gainLeft = audioContext.createGainNode();
    gainLeft.gain.value = voice.LeftVolume / 1000; // LeftVolume value: 0-64
    var gainRight = audioContext.createGainNode();
    gainRight.gain.value = voice.RightVolume / 1000;

    console.log("gainLeft: %i gainRight: %i", gainLeft.gain.value, gainRight.gain.value);

    var merger = audioContext.createChannelMerger();
    var wav = vocToWav(voice.tempPtr);
    var buffer = audioContext.createBuffer(wav, true); 
    source.buffer = buffer;
    source.connect(gainLeft);
    source.connect(gainRight);
    gainLeft.connect(merger, 0, 1);
    gainRight.connect(merger, 0, 1);
    merger.connect(audioContext.destination);
    source.noteOn(0);
}

//function MV_PlayVoice(voice) {
//    if (!audioContext) {
//        // todo: support <audio> like sound.html
//        return;
//    }

//    console.log("MV_PlayVoice", voice);

//    var source = audioContext.createBufferSource();
//    var panner = audioContext.createPanner();

//    var volumeNode = audioContext.createGainNode();
//    volumeNode.gain.value = ((voice.LeftVolume + voice.RightVolume) / 2) / 1000; // cannot set left/right volume, yet?
//    console.log("volumeNode.gain.value ", volumeNode.gain.value);

//    var buffer = audioContext.createBuffer(vocToWav(voice.tempPtr), true);
//    pan((-voice.LeftVolume) + voice.RightVolume, panner);

//    source.connect(panner);
//    panner.connect(volumeNode);
//    volumeNode.connect(audioContext.destination);
//    source.buffer = buffer;
//    source.noteOn(0);
//}

//////http://jsbin.com/ayijoy/16/edit
////function MV_PlayVoice(voice) {
////    if (!audioContext) {
////        // todo: support <audio> like sound.html
////        return;
////    }

////    console.log("MV_PlayVoice", voice);

////// source - splitter - gain (l/r) - merger - dest

////    var destination = audioContext.destination,
////        bufferSource = audioContext.createBufferSource(),
////        buffer = audioContext.createBuffer(vocToWav(voice.tempPtr), true),
////        splitter = audioContext.createChannelSplitter(2), //https://github.com/adobe/webkit/blob/master/LayoutTests/webaudio/audiochannelsplitter.html
////        gainL = audioContext.createGainNode(),
////        gainR = audioContext.createGainNode(),
////        merger = audioContext.createChannelMerger(2);

////    bufferSource.buffer = buffer;

////    bufferSource.connect(gainL);
////    bufferSource.connect(gainR);

////    gainL.connect(merger, 0, 0);
////    gainR.connect(merger, 0, 1);

////    bufferSource.noteOn(0);

////    gainL.gain.value = 0.01;
////    gainR.gain.value = 0.09;

////    merger.connect(destination);
////}

var panPos = 0;

 //stackoverflow.com/questions/14378305/how-to-create-very-basic-left-right-equal-power-panning-with-createpanner
function pan(range, panner) {
    console.log("pan range", range);
    var xDeg = parseInt(range);
    var zDeg = xDeg + 90;
    if (zDeg > 90) {
        zDeg = 180 - zDeg;
    }
    var x = Math.sin(xDeg * (Math.PI / 180));
    var z = Math.sin(zDeg * (Math.PI / 180));
    panner.setPosition(x, 0, z);
}

//function pan(range, panner) {
//    var x = Math.sin(range * (Math.PI / 180));
//    console.log("pan x", x);
//    panner.setPosition(x, 0, 0);
//}

// todo: cache...
function vocToWav(uInt8Array) {
    // very simplistic, will probalby break on anything other than default sounds, eg sample rate not read from voc

    var ds = new DataStream(uInt8Array);

    ds.seek(0x20);
    var sinfo = {
        length: uInt8Array.length,
        samprate: 8000
    };
    var rawBytes = ds.readUint8Array(uInt8Array.length - 0x20);
    var wavDs = new DataStream();
    var bl;
    var bi;

    wavDs.writeString("RIFF"); // Write "RIFF"
    bl = sinfo.length + 36;
    wavDs.writeInt32(bl, 4); // Write Size of file with header
    wavDs.writeString("WAVE"); // Write "WAVE"
    wavDs.writeString("fmt "); // Write "fmt "
    bl = 16;
    wavDs.writeInt32(bl); // Size of previous header (fixed)
    bi = 1;
    wavDs.writeInt16(bi); // formatTag
    wavDs.writeInt16(bi); // nChannels
    bl = sinfo.samprate;
    wavDs.writeInt32(bl); // nSamplesPerSec
    wavDs.writeInt32(bl); // nAvgBytesPerSec
    wavDs.writeInt16(bi); // nBlockAlign (always 1?)
    bi = 8;
    wavDs.writeInt16(bi); // nBitsPerSample (8 or 16 I assume)
    wavDs.writeString("data"); // Write "data"
    bl = sinfo.length;
    wavDs.writeInt32(bl); // True length of sample data

    wavDs.writeUint8Array(rawBytes);

    return wavDs.buffer;
}


//function drawSpectrum() {
//    var canvas = document.getElementById('spectrumCanvas');
//    var ctx = canvas.getContext('2d');
//    var width = canvas.width;
//    var height = canvas.height;
//    var barWidth = 10;

//    ctx.clearRect(0, 0, width, height);

//    var freqByteData = new Uint8Array(audioAnalyser.frequencyBinCount);
//    audioAnalyser.getByteFrequencyData(freqByteData);

//    var barCount = Math.round(width / barWidth);
//    console.log(freqByteData);
//    for (var i = 0; i < barCount; i++) {
//        var magnitude = freqByteData[i];
//        // some values need adjusting to fit on the canvas
//        ctx.fillRect(barWidth * i, height, barWidth - 2, -magnitude + 60);
//    }
//}


///*---------------------------------------------------------------------
//   Function: MV_StopVoice

//   Removes the voice from the play list and adds it to the free list.
//---------------------------------------------------------------------*/

//void MV_StopVoice( VoiceNode *voice )
//{
//    VoiceNode* pPrev;
//    VoiceNode* pNext;

//    unsigned  flags;

//    flags = DisableInterrupts();


//    pPrev = voice->prev;
//    pNext = voice->next;

//    // move the voice from the play list to the free list
//    LL_Remove( voice, next, prev );
//    LL_Add( &VoicePool, voice, next, prev );

//    if(pPrev == NULL)
//    {
//        printf("(MV_StopVoice) pPrev is NULL, this could be a problem.\n");
//    }

//    if(pNext == NULL)
//    {
//        printf("(MV_StopVoice) pNext is NULL, this could be a problem.\n");
//    }

//    --sounddebugActiveSounds;
//    ++sounddebugDeallocateSoundCalls;


//    RestoreInterrupts( flags );
//}


//1343

function MV_GetVolumeTable(vol) {
    var volume = MIX_VOLUME(vol);
    return ((volume * MV_TotalVolume) / MV_MaxTotalVolume) | 0;
}

/*---------------------------------------------------------------------
   Function: MV_SetVoiceVolume

   Sets the stereo and mono volume level of the voice associated
   with the specified handle.
---------------------------------------------------------------------*/

function MV_SetVoiceVolume(
    voice,
    vol,
    left,
    right
) {
    voice.LeftVolume = MV_GetVolumeTable(left);
    voice.RightVolume = MV_GetVolumeTable(right);
}

//2903
/*---------------------------------------------------------------------
   Function: MV_Init

   Perform the initialization of variables and memory used by
   Multivoc.
---------------------------------------------------------------------*/

function MV_Init(
    soundcard,
    MixRate,
    Voices,
    numchannels,
    samplebits
) {
    var ptr;
    var status;
    var buffer;
    var index;


    // Calculate pan table
    MV_CalcPanTable();

    MV_SetVolume(MV_MaxTotalVolume);

    return (0/*MV_Ok*/);
}

/*---------------------------------------------------------------------
   Function: MV_PlayVOC3D

   Begin playback of sound data at specified angle and distance
   from listener.
---------------------------------------------------------------------*/

function FX_PlayVOC3D(ptr,
    pitchoffset,
    angle,
    distance,
    priority,
    callbackval) {
    var left;
    var right;
    var mid;
    var volume;
    var status;

    ////if (!MV_Installed) {
    ////    MV_SetErrorCode(MV_NotInstalled);
    ////    return (MV_Error);
    ////}

    if (distance < 0) {
        distance = -distance;
        angle += ((MV_NumPanPositions / 2) | 0);
    }

    volume = MIX_VOLUME(distance);

    // Ensure angle is within 0 - 31
    angle &= MV_MaxPanPosition;

    left = MV_PanTable[angle][volume].left;
    right = MV_PanTable[angle][volume].right;
    mid = Math.max(0, 255 - distance);

    status = MV_PlayVOC(ptr, pitchoffset, mid, left, right, priority,
        callbackval);

    return (status);
}


/*---------------------------------------------------------------------
   Function: MV_PlayVOC

   Begin playback of sound data with the given sound levels and
   priority.
---------------------------------------------------------------------*/

function MV_PlayVOC(
    ptr,
    pitchoffset,
    vol,
    left,
    right,
    priority,
    callbackval
) {
    var status = MV_PlayLoopedVOC(ptr, -1, -1, pitchoffset, vol, left, right,
        priority, callbackval);

    return (status);
}


//2521

/*---------------------------------------------------------------------
   Function: MV_PlayLoopedVOC

   Begin playback of sound data with the given sound levels and
   priority.
---------------------------------------------------------------------*/

function MV_PlayLoopedVOC(
    ptr,
    loopstart,
    loopend,
    pitchoffset,
    vol,
    left,
    right,
    priority,
    callbackval
) {
    var voice = new VoiceNode();
    var status;

    //// if ( !MV_Installed )
    ////{
    ////MV_SetErrorCode( MV_NotInstalled );
    ////return( MV_Error );
    ////}

    ////// Make sure it's a valid VOC file.
    ////status = strncmp( (char*)ptr, "Creative Voice File", 19 );
    ////if ( status != 0 )
    ////{
    ////    MV_SetErrorCode( MV_InvalidVOCFile );
    ////    return( MV_Error );
    ////}

    ////// Request a voice from the voice pool
    ////voice = MV_AllocVoice( priority );
    ////if ( voice == NULL )
    ////{
    ////    MV_SetErrorCode( MV_NoVoices );
    ////    return( MV_Error );
    ////}

    voice.wavetype = VOC;
    voice.bits = 8;
    ////voice.GetSound    = MV_GetNextVOCBlock;
    ////voice.NextBlock   = ptr + *( uint16_t  * )( ptr + 0x14 );
    voice.tempPtr = ptr;
    ////voice.DemandFeed  = NULL;
    ////voice.LoopStart   = NULL;
    ////voice.LoopCount   = 0;
    ////voice.BlockLength = 0;
    ////voice.PitchScale  = PITCH_GetScale( pitchoffset );
    ////voice.length      = 0;
    ////voice.next        = NULL;
    ////voice.prev        = NULL;
    voice.priority = priority;
    ////voice.GLast       = -1;
    ////voice.GPos        = 0;
    ////voice.GVal[0]     = 0;
    ////voice.GVal[1]     = 0;
    ////voice.GVal[2]     = 0;
    ////voice.GVal[3]     = 0;
    voice.callbackval = callbackval;
    voice.LoopStart = /*( char * )*/loopstart;
    voice.LoopEnd = /*( char * )*/loopend;
    ////voice.LoopSize    = loopend - loopstart + 1;

    ////if ( loopstart < 0 )
    ////{
    ////    voice.LoopStart = 0;
    ////    voice.LoopEnd   = 0;
    ////}

    MV_SetVoiceVolume(voice, vol, left, right);
    MV_PlayVoice(voice);

    return (voice.handle);
}


//2674

/*---------------------------------------------------------------------
   Function: MV_CalcPanTable

   Create the table used to determine the stereo volume level of
   a sound located at a specific angle and distance from the listener.
---------------------------------------------------------------------*/

function MV_CalcPanTable() {
    var level;
    var angle;
    var distance;
    var HalfAngle;
    var ramp;

    HalfAngle = (MV_NumPanPositions / 2) | 0;

    for (distance = 0; distance <= MV_MaxVolume; distance++) {
        level = (255 * (MV_MaxVolume - distance)) / MV_MaxVolume;
        for (angle = 0; angle <= (HalfAngle / 2 | 0) ; angle++) {
            ramp = level - ((level * angle) /
                (MV_NumPanPositions / 4 | 0));

            MV_PanTable[angle][distance].left = ramp;
            MV_PanTable[HalfAngle - angle][distance].left = ramp;
            MV_PanTable[HalfAngle + angle][distance].left = level;
            MV_PanTable[MV_MaxPanPosition - angle][distance].left = level;

            MV_PanTable[angle][distance].right = level;
            MV_PanTable[HalfAngle - angle][distance].right = level;
            MV_PanTable[HalfAngle + angle][distance].right = ramp;
            MV_PanTable[MV_MaxPanPosition - angle][distance].right = ramp;
        }
    }
}

/*---------------------------------------------------------------------
   Function: MV_SetVolume

   Sets the volume of digitized sound playback.
---------------------------------------------------------------------*/

function MV_SetVolume(volume) {
    volume = Math.max(0, volume);
    volume = Math.min(volume, MV_MaxTotalVolume);

    MV_TotalVolume = volume;
}