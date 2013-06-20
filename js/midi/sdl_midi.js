//'use strict';

//music h
var MUSIC_Warning = -2,
    MUSIC_Error = -1,
    MUSIC_Ok = 0;

var MUSIC_LoopSong = (1 == 1);
var MUSIC_PlayOnce = (!MUSIC_LoopSong);


//sdl_midi c

var Music = {};

// https://github.com/qiao/euphony used both these:
// http://www.personalcopy.com/home.htm
// https://github.com/gasman/jasmid

// but it looks like MIDI.js loads soundfont plugins
// or wait on html5 midi

// get sound font by putting all midi's through this?
// https://github.com/mudcube/MIDI.js/blob/master/soundfont-generator/ruby/soundfont_builder.rb

var KILOBYTE = (1024 * 1024);
var musicDataBuffer = new Uint8Array(100 * KILOBYTE);

var musicAudio = new Audio();

//28
function MUSIC_Init() {
    return MUSIC_Ok;
}

//47
Music.setVolume = function (volume) {
    Mix_VolumeMusic(volume / 2 | 0);
};

function Mix_VolumeMusic(volume) {
    musicAudio.volume = volume / 100;
}


//74
function MUSIC_Continue() { }

//80
function MUSIC_Pause() { }

//85
Music.stopSong = function () {
};

//95
//function MUSIC_PlaySong________Midi(songFilename, loopflag)
//{
//    debugger 
//    var fd =  0;
//    var fileSize;
//    var rw;
//    var sdlMusic;
    
//    fd = kopen4load(songFilename,0);
    
//	if(fd == -1){ 
//	    console.log("The music '%s' cannot be found in the GRP or the filesystem.\n", songFilename);
//	    throw "error";
//    }
    
//    fileSize = kfilelength( fd );
//    if (fileSize >= musicDataBuffer.length)
//    {
//        console.log("The music '%s' was found but is too big (%dKB)to fit in the buffer (%luKB).\n", songFilename, fileSize / 1024 | 0, musicDataBuffer.length / 1024 | 0);
//        kclose(fd);
//        throw "error";
//    }
    
//    kread( fd, musicDataBuffer, fileSize);
//    kclose( fd );
    
//    // no decent way to play midi files I can see
//    // when midi api comes available should be able to use something like jsmid 
//    // with it to load the midi and play the notes

//    //Ok, the file is in memory
//    rw = SDL_RWFromMem(musicDataBuffer, fileSize); 
    
//    sdlMusic = Mix_LoadMUS_RW(rw);
    
//    Mix_PlayMusic(sdlMusic, (loopflag == MUSIC_PlayOnce) ? 0 : -1);
    
//    return 1;
//}

var musicAudio = new Audio();
function MUSIC_PlaySong(songFilename, loopflag) {
    var useOgg = musicAudio.canPlayType('audio/ogg') == 1;
    var fixedFilename = songFilename.replace(/\.mid/i, useOgg ? ".ogg" : ".mp3"); // todo - make better-er- e.g. replace last 4 chars?, throw errors 

 
    musicAudio.autoplay = true;
    musicAudio.loop = loopflag;

    musicAudio.src = "music/" + fixedFilename;
    musicAudio.load();
    musicAudio.play();
    
    return 1;
}

var FastBase64 = {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encLookup: [],

    Init: function () {
        for (var i = 0; i < 4096; i++) {
            this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
        }
    },

    Encode: function (src) {
        var len = src.length;
        var dst = '';
        var i = 0;
        var n;
        while (len > 2) {
            n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
            dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
            len -= 3;
            i += 3;
        }
        if (len > 0) {
            var n1 = (src[i] & 0xFC) >> 2;
            var n2 = (src[i] & 0x03) << 4;
            if (len > 1) n2 |= (src[++i] & 0xF0) >> 4;
            dst += this.chars[n1];
            dst += this.chars[n2];
            if (len == 2) {
                var n3 = (src[i++] & 0x0F) << 2;
                n3 |= (src[i] & 0xC0) >> 6;
                dst += this.chars[n3];
            }
            if (len == 1) dst += '=';
            dst += '=';
        }
        return dst;
    } // end Encode
};
FastBase64.Init();

//181
Music.registerTimbreBank = function () {
};

// This is the method called from the Game Module.
function PlayMusic(fileName){
    MUSIC_PlaySong(fileName,1);
}