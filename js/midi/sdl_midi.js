//'use strict';

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

//28
function MUSIC_Init() {
    return MUSIC_Ok;
}

//47
Music.setVolume = function () {
    //todo 
};

//74
function MUSIC_Continue() { }

//80
function MUSIC_Pause() { }

//85
Music.stopSong = function () {
};

//95
function MUSIC_PlaySong(songFilename, loopflag)
{
    debugger 
    var fd =  0;
    var fileSize;
    var rw;
    var sdlMusic;
    
    fd = kopen4load(songFilename,0);
    
	if(fd == -1){ 
	    console.log("The music '%s' cannot be found in the GRP or the filesystem.\n", songFilename);
	    throw "error";
    }
    
    fileSize = kfilelength( fd );
    if (fileSize >= musicDataBuffer.length)
    {
        console.log("The music '%s' was found but is too big (%dKB)to fit in the buffer (%luKB).\n", songFilename, fileSize / 1024 | 0, musicDataBuffer.length / 1024 | 0);
        kclose(fd);
        throw "error";
    }
    
    kread( fd, musicDataBuffer, fileSize);
    kclose( fd );
    
    //Ok, the file is in memory
    rw = SDL_RWFromMem(musicDataBuffer, fileSize); 
    
    sdlMusic = Mix_LoadMUS_RW(rw);
    
    Mix_PlayMusic(sdlMusic, (loopflag == MUSIC_PlayOnce) ? 0 : -1);
    
    return 1;
}

//181
Music.registerTimbreBank = function () {
};

// This is the method called from the Game Module.
function PlayMusic(fileName){
    MUSIC_PlaySong(fileName,1);
}