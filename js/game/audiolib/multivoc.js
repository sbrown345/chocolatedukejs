//'use strict';

//h

var MV_MinVoiceHandle = 1;

var MV_Warning = -2,
    MV_Error = -1,
    MV_Ok = 0;


//68

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

var MV_ReverbLevel;
var MV_ReverbDelay;
var MV_ReverbTable = -1;

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

var MV_BufferSize = MixBufferSize;
var MV_BufferLength;

var MV_NumberOfBuffers = NumberOfBuffers;

var MV_MixMode = MONO_8BIT;
var MV_Channels = 1;
var MV_Bits = 8;

//109
var MV_Silence = SILENCE_8BIT;
var MV_SwapLeftRight = false;


var MV_RequestedMixRate;
var MV_MixRate;

var MV_DMAChannel = -1;
var MV_BuffShift;

var MV_TotalMemory;
var MV_FooMemory;

var MV_BufferDescriptor;
var MV_BufferEmpty = new Int32Array(NumberOfBuffers);
var MV_MixBuffer = new Int32Array(NumberOfBuffers + 1);
var MV_FooBuffer = null;

//125
var MV_Voices = null;

var VoiceList = new VoiceNode();
var VoicePool = new VoiceNode();

var MV_MixPage = 0;
var MV_VoiceHandle = MV_MinVoiceHandle;

var MV_CallBackFunc;
var MV_RecordFunc;
var MV_MixFunction;


//137
var MV_MaxVolume = 63;

//var MV_GLast, MV_GPos, MV_GVal;

//char  *MV_MixDestination;
var MV_LeftVolume;
var MV_RightVolume;
var MV_SampleSize = 1;
var MV_RightChannelOffset;

var MV_MixPosition;

//var MV_ErrorCode = MV_Ok;

//#define MV_SetErrorCode( status ) \
//MV_ErrorCode   = ( status );

//273

/**********************************************************************

   Memory locked functions:

**********************************************************************/


var MV_LockStart = MV_Mix;


/*---------------------------------------------------------------------
   Function: MV_Mix

   Mixes the sound into the buffer.
---------------------------------------------------------------------*/

function MV_Mix(voice) {
    var start;
    var length;
    var voclength;
    var position;
    var rate;
    var FixedPointBufferSize;

    if ((voice.length == 0)
        && (voice.GetSound(voice) != KeepPlaying)) {
        return;
    }

    length = MixBufferSize;
    FixedPointBufferSize = voice.FixedPointBufferSize;

    MV_MixDestination = MV_FooBuffer;
    MV_LeftVolume = voice.LeftVolume;
    MV_RightVolume = voice.RightVolume;
    MV_GLast = voice.GLast;
    MV_GPos = voice.GPos;
    MV_GVal = voice.GVal;

    if ((MV_Channels == 2) && (IS_QUIET(MV_LeftVolume))) {
        MV_LeftVolume = MV_RightVolume;
        MV_MixDestination += 8;
    }

    // Add this voice to the mix
    while (length > 0) {
        start = voice.sound;
        rate = voice.RateScale;
        position = voice.position;

        // Check if the last sample in this buffer would be
        // beyond the length of the sample block
        if ((position + FixedPointBufferSize) >= voice.length) {
            if (position < voice.length) {
                voclength = (voice.length - position + rate - 1) / rate | 0;
            }
            else {
                voice.GetSound(voice);
                return;
            }
        }
        else {
            voclength = length;
        }

        voice.mix(position, rate, start, voclength);

        if (voclength & 1) {
            MV_MixPosition += rate;
            voclength -= 1;
        }
        voice.position = MV_MixPosition;

        length -= voclength;

        if (voice.position >= voice.length) {
            // Get the next block of sound
            if (voice.GetSound(voice) != KeepPlaying) {
                return;
            }

            if (length > 0) {
                // Get the position of the last sample in the buffer
                FixedPointBufferSize = voice.RateScale * (length - 1);
            }
        }
    }
}

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

//function MV_PlayVoice( voice ) {
//   //var flags;

//   //flags = DisableInterrupts();
//    LL_SortedInsertion(VoiceList, voice, "prev", "next", "VoiceNode", "priority");

//   ++sounddebugActiveSounds;
//   ++sounddebugAllocateSoundCalls;

//   //RestoreInterrupts( flags );
//}

function MV_PlayVoice(voice) {
    if (!audioContext) {
        // todo: support <audio> like sound.html
        return;
    }
    
    LL_SortedInsertion(VoiceList, voice, "prev", "next", "VoiceNode", "priority");

    ++sounddebugActiveSounds;
    ++sounddebugAllocateSoundCalls;


    // source - gainLeft/gainRight - merger - dest
    var source = audioContext.createBufferSource();

    var gainLeft = audioContext.createGainNode();
    gainLeft.gain.value = voice.LeftVolume / 100;
    var gainRight = audioContext.createGainNode();
    gainRight.gain.value = voice.RightVolume / 100;

    // TODO: USE THE MAX VOICE CODE THING - PERF

    var merger = audioContext.createChannelMerger();
    var wav = getWav(voice);
    //saveVoice(wav, voice);

    var buffer = audioContext.createBuffer(wav, true);
    source.buffer = buffer;
    source.connect(gainLeft);
    source.connect(gainRight);
    gainLeft.connect(merger, 0, 0);
    gainRight.connect(merger, 0, 1);
    merger.connect(audioContext.destination);
    source.noteOn(0);
    setTimeout(function () {
        if (MV_CallBackFunc) {
            console.log("MV_CallBackFunc")
            //MV_CallBackFunc(voice.callbackval);
            mixer_callback();
        }
    }, (buffer.duration * 1000)); // https://bugs.webkit.org/show_bug.cgi?id=71942
}

var savedVoices = {};

function saveVoice(wav, voice) {
    var filename = voice.callbackval;
    if (!savedVoices[filename]) {
        saveAs(new Blob(new Array(wav)), filename + ".wav");
        saveAs(new Blob(new Array(voice.tempPtr)), filename + ".voc");
        savedVoices[filename] = true;
    }
}

var cachedWav = {};

function getWav(voice) {
    // very simplistic, will probalby break on anything other than default sounds, eg sample rate not read from voc

    if (voice.wavetype == WAV) {
        return voice.tempPtr;
    }

    if (!cachedWav[voice.callbackval]) {
        var ds = new DataStream(voice.tempPtr);

        ds.seek(0x20);
        var sinfo = {
            length: voice.tempPtr.length,
            samprate: 8000
        };
        var rawBytes = ds.readUint8Array(voice.tempPtr.length - 0x20);
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
        cachedWav[voice.callbackval] = wavDs.buffer;
    }

    return cachedWav[voice.callbackval];
}


//401
/*---------------------------------------------------------------------
   Function: MV_StopVoice

   Removes the voice from the play list and adds it to the free list.
---------------------------------------------------------------------*/

function MV_StopVoice(voice) {
    var pPrev;
    var pNext;

    //var  flags;

    //flags = DisableInterrupts();


    pPrev = voice.prev;
    pNext = voice.next;

    // move the voice from the play list to the free list
    LL_Remove(voice, "next", "prev");
    LL_Add(VoicePool, voice, "next", "prev");

    if (!pPrev) {
        console.log("(MV_StopVoice) pPrev is NULL, this could be a problem.\n");
    }

    if (!pNext) {
        console.log("(MV_StopVoice) pNext is NULL, this could be a problem.\n");
    }

    --sounddebugActiveSounds;
    ++sounddebugDeallocateSoundCalls;


    //RestoreInterrupts( flags );
}

//436

/*---------------------------------------------------------------------
   Function: MV_ServiceVoc

   Starts playback of the waiting buffer and mixes the next one.
---------------------------------------------------------------------*/

// static int backcolor = 1;

function MV_ServiceVoc() {
    var voice;
    var next;

    // Toggle which buffer we'll mix next
    MV_MixPage++;
    if ( MV_MixPage >= MV_NumberOfBuffers )
    {
        MV_MixPage -= MV_NumberOfBuffers;
    }
	
    {
        ClearBuffer_DW( MV_FooBuffer, 0, (8 / 4 * MV_BufferSize / MV_SampleSize * MV_Channels) | 0);
        MV_BufferEmpty[ MV_MixPage ] = 1;
    }
	
    // Play any waiting voices
    for( voice = VoiceList.next; voice != VoiceList; voice = next )
    {
        //      if ( ( voice < &MV_Voices[ 0 ] ) || ( voice > &MV_Voices[ 8 ] ) )
        //         {
        //         SetBorderColor(backcolor++);
        //         break;
        //         }

        if(!voice.GetSound)
        {
            console.debug("MV_ServiceVoc() voice.GetSound == NULL, break;\n");

            // This sound is null, early out, or face a nasty crash.
            break;		
        }
		
        MV_BufferEmpty[ MV_MixPage ] = 0;
		
        MV_MixFunction( voice );
	
        next = voice.next;
		
        // Is this voice done?
        if ( !voice.Playing )
        {
            MV_StopVoice( voice );
			
            if ( MV_CallBackFunc )
            {
                MV_CallBackFunc( voice.callbackval );
            }
        }
    }
	
    if ( MV_ReverbLevel > 0)
    {
        if (MV_ReverbTable != -1) MV_FPReverb(MV_ReverbTable);
    }

    {
        var dest;
        var count;
		
        dest = MV_MixBuffer[ MV_MixPage ];
        count = (MV_BufferSize / MV_SampleSize * MV_Channels) | 0;
        if ( MV_Bits == 16 )
        {
            MV_16BitDownmix(dest, count);
        }
        else
        {
            MV_8BitDownmix(dest, count);
        }
			
    }
}


/*---------------------------------------------------------------------
   Function: MV_Kill

   Stops output of the voice associated with the specified handle.
---------------------------------------------------------------------*/

function MV_Kill(handle) {
    var voice;
    var flags;
    var callbackval;

    if (!MV_Installed) {
        MV_SetErrorCode(MV_NotInstalled);
        return (MV_Error);
    }

    //flags = DisableInterrupts();

    voice = MV_GetVoice(handle);
    if (!voice) {
        //RestoreInterrupts( flags );
        MV_SetErrorCode(MV_VoiceNotFound);
        return (MV_Error);
    }

    callbackval = voice.callbackval;

    MV_StopVoice(voice);

    //RestoreInterrupts( flags );

    if (MV_CallBackFunc) {
        MV_CallBackFunc(callbackval);
    }

    return (MV_Ok);
}

//952
/*---------------------------------------------------------------------
   Function: MV_GetVoice

   Locates the voice with the specified handle.
---------------------------------------------------------------------*/

function MV_GetVoice(handle) {
    var voice;
    //var flags;

    //flags = DisableInterrupts();

    for (voice = VoiceList.next; voice != VoiceList; voice = voice.next) {
        if (handle == voice.handle) {
            break;
        }
    }

    //RestoreInterrupts( flags );

    if (voice == VoiceList) {
        //MV_SetErrorCode( MV_VoiceNotFound ); //todo?

        // SBF - should this return null?
        return null;
    }

    return (voice);
}



//1099
/*---------------------------------------------------------------------
   Function: MV_VoicePlaying

   Checks if the voice associated with the specified handle is
   playing.
---------------------------------------------------------------------*/

function MV_VoicePlaying(handle) {
    var voice;

    //if (!MV_Installed) {
    //    MV_SetErrorCode(MV_NotInstalled);
    //    return (false);
    //}

    voice = MV_GetVoice(handle);

    if (!voice) {
        return (false);
    }

    return (true);
}


//1134
/*---------------------------------------------------------------------
   Function: MV_AllocVoice

   Retrieve an inactive or lower priority voice for output.
---------------------------------------------------------------------*/

function MV_AllocVoice(priority) {
    var voice;
    var node;
    //var flags;

    //return( NULL );
    if (MV_Recording) {
        return (NULL);
    }

    //flags = DisableInterrupts();

    // Check if we have any free voices
    if (LL_Empty(VoicePool, "next", "prev")) {
        // check if we have a higher priority than a voice that is playing.
        voice = VoiceList.next;
        for (node = voice.next; node != VoiceList; node = node.next) {
            if (node.priority < voice.priority) {
                voice = node;
            }
        }

        if (priority >= voice.priority) {
            MV_Kill(voice.handle);
        }
    }

    // Check if any voices are in the voice pool
    if (LL_Empty(VoicePool, "next", "prev")) {
        // No free voices
        //RestoreInterrupts(flags);
        return (0);
    }

    voice = VoicePool.next;
    LL_Remove(voice, "next", "prev");
    //RestoreInterrupts(flags);

    // Find a free voice handle
    do {
        MV_VoiceHandle++;
        if (MV_VoiceHandle < MV_MinVoiceHandle) {
            MV_VoiceHandle = MV_MinVoiceHandle;
        }
    }
    while (MV_VoicePlaying(MV_VoiceHandle));

    voice.handle = MV_VoiceHandle;

    return (voice);
}


//1206
/*---------------------------------------------------------------------
   Function: MV_VoiceAvailable

   Checks if a voice can be play at the specified priority.
---------------------------------------------------------------------*/

function MV_VoiceAvailable(priority) {
    var voice;
    var node;
    //var    flags;

    // Check if we have any free voices
    if (!LL_Empty(VoicePool, "next", "prev")) {
        return (1);
    }

    //flags = DisableInterrupts();

    // check if we have a higher priority than a voice that is playing.
    voice = VoiceList.next;
    for (node = VoiceList.next; node != VoiceList; node = node.next) {
        if (node.priority < voice.priority) {
            voice = node;
        }
    }

    //RestoreInterrupts( flags );

    if ((voice != VoiceList) && (priority >= voice.priority)) {
        return (1);
    }

    return (0);
}


//1343

function MV_GetVolumeTable(vol) {
    var volume = MIX_VOLUME(vol);
    return ((volume * MV_TotalVolume) / MV_MaxTotalVolume) | 0;
}

//1463
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

//1715
/*---------------------------------------------------------------------
   Function: MV_SetMixMode

   Prepares Multivoc to play stereo of mono digitized sounds.
---------------------------------------------------------------------*/

function MV_SetMixMode(numchannels, samplebits) {
    var mode;

    if (!MV_Installed) {
        MV_SetErrorCode(MV_NotInstalled);
        return (MV_Error);
    }

    mode = 0;
    if (numchannels == 2) {
        mode |= STEREO;
    }
    if (samplebits == 16) {
        mode |= SIXTEEN_BIT;
    }

    MV_MixMode = mode;

    MV_Channels = 1;
    if (MV_MixMode & STEREO) {
        MV_Channels = 2;
    }

    MV_Bits = 8;
    if (MV_MixMode & SIXTEEN_BIT) {
        MV_Bits = 16;
    }

    MV_BuffShift = 7 + MV_Channels;
    MV_SampleSize = /*sizeof(MONO8)*/ 1 * MV_Channels;

    if (MV_Bits == 8) {
        MV_Silence = SILENCE_8BIT;
    } else {
        MV_Silence = SILENCE_16BIT;
        MV_BuffShift += 1;
        MV_SampleSize *= 2;
    }

    MV_BufferSize = MixBufferSize * MV_SampleSize;
    MV_NumberOfBuffers = TotalBufferSize / MV_BufferSize | 0;
    MV_BufferLength = TotalBufferSize;

    MV_RightChannelOffset = MV_SampleSize / 2 | 0;

    return (MV_Ok);
}

//1824

/*---------------------------------------------------------------------
   Function: MV_StartPlayback

   Starts the sound playback engine.
---------------------------------------------------------------------*/

function MV_StartPlayback() 
{
    var status;
    var buffer;

    // Initialize the buffers
    ClearBuffer_DW( MV_MixBuffer , 0,MV_Silence, TotalBufferSize >> 2 );
    for( buffer = 0; buffer < MV_NumberOfBuffers; buffer++ )
    {
        MV_BufferEmpty[ buffer ] = 1 /*TRUE*/;
    }

    // Set the mix buffer variables
    MV_MixPage = 1;

    MV_MixFunction = MV_Mix;

    //JIM
    //   MV_MixRate = MV_RequestedMixRate;
    //   return( MV_Ok );

    // Start playback
    status = DSL_BeginBufferedPlayback( MV_MixBuffer[ 0 ],
										TotalBufferSize, 
										MV_NumberOfBuffers,
										MV_RequestedMixRate, 
										MV_MixMode, 
										MV_ServiceVoc );

    if ( status != DSL_Ok )
    {
        MV_SetErrorCode( MV_BlasterError );
        return( MV_Error );
    }

    MV_MixRate = DSL_GetPlaybackRate();

    return( MV_Ok );
}


//2440
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

//2493
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

    // Request a voice from the voice pool
    voice = MV_AllocVoice(priority);
    if (!voice) {
        throw "voice error - maybe need to return mv error..."
        MV_SetErrorCode(MV_NoVoices);
        return (MV_Error);
    }

    voice.wavetype = VOC;
    voice.bits = 8;
    ////voice.GetSound    = MV_GetNextVOCBlock;
    ////voice.NextBlock   = ptr + *( uint16_t  * )( ptr + 0x14 );
    voice.tempPtr = ptr;
    ////voice.DemandFeed  = NULL;
    voice.LoopStart = null;//NULL;
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

    if (loopstart < 0) {
        voice.LoopStart = 0;
        voice.LoopEnd = 0;
    }

    console.assert(voice.LoopStart == 0 || voice.LoopEnd == 0, "if not 0, this is a todo");

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
        level = ((255 * (MV_MaxVolume - distance)) / MV_MaxVolume) | 0;
        for (angle = 0; angle <= (HalfAngle / 2 | 0) ; angle++) {
            ramp = (level - ((level * angle) / (MV_NumPanPositions / 4 | 0))) | 0;

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

//2718
/*---------------------------------------------------------------------
   Function: MV_SetVolume

   Sets the volume of digitized sound playback.
---------------------------------------------------------------------*/

function MV_SetVolume(volume) {
    volume = Math.max(0, volume);
    volume = Math.min(volume, MV_MaxTotalVolume);

    MV_TotalVolume = volume;
}

/*---------------------------------------------------------------------
   Function: MV_SetCallBack

   Set the function to call when a voice stops.
---------------------------------------------------------------------*/

function MV_SetCallBack($function) {
    MV_CallBackFunc = $function;
}


/*---------------------------------------------------------------------
   Function: MV_SetReverseStereo

   Set the orientation of the left and right channels.
---------------------------------------------------------------------*/

function MV_SetReverseStereo(setting) {
    MV_SwapLeftRight = setting;
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

    MV_Voices = structArray(VoiceNode, Voices);// new Array();

    MV_MaxVoices = Voices;

    LL_Reset(VoiceList, "next", "prev");
    LL_Reset(VoicePool, "next", "prev");

    for (index = 0; index < Voices; index++) {
        LL_Add(VoicePool, MV_Voices[index], "next", "prev");
    }

    MV_SetReverseStereo(false);

    MV_SoundCard = soundcard;
    MV_Installed = true;
    MV_CallBackFunc = null;
    MV_RecordFunc = null;
    MV_Recording = false;
    MV_ReverbLevel = 0;
    MV_ReverbTable = -1;

    // Set the sampling rate
    MV_RequestedMixRate = MixRate;

    // Set Mixer to play stereo digitized sound
    MV_SetMixMode(numchannels, samplebits);
    MV_ReverbDelay = 14320; // MV_BufferSize * 3;
    //InitializeCriticalSection(&reverbCS);
    //reverbMutex = SDL_CreateMutex();

    //MV_MixBuffer[MV_NumberOfBuffers] = ptr;
    //for (buffer = 0; buffer < MV_NumberOfBuffers; buffer++) {
    //    MV_MixBuffer[buffer] = ptr;
    //    ptr += MV_BufferSize;
    //}

    // Calculate pan table
    MV_CalcPanTable();

    MV_SetVolume(MV_MaxTotalVolume);

    //MV_FooBuffer = ptr;

    MV_StartPlayback();

    return (0/*MV_Ok*/);
}

//3391

function ClearBuffer_DW(ptr, ptrIdx, data, length) {
    var d = ptr, dIdx = ptrIdx;

    while (length--) {
        d[dIdx] = data;

        dIdx++;
    }
}