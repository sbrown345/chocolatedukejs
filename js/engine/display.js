'use strict';

var Display = {};


var xres, yres, bytesperline, imageSize, maxpages;
var frameplace;

////The frambuffer address
var frameoffset;
var  /**screen,*/ vesachecked;
var buffermode, origbuffermode, linearmode;
var permanentupdate = 0, vgacompatible;

var surface = document.getElementById("gameCanvas");
var surfaceContext = document.getElementById("gameCanvas").getContext("2d");


var sdl_flags = 0x20000000;
var mouse_relative_x = 0;
var mouse_relative_y = 0;
var mouse_buttons = 0;
var lastkey = 0;
/* so we can make use of setcolor16()... - DDOI */
var  drawpixel_color=0;

var scancodes = new Uint32Array(334);

var last_render_ticks = 0;
var total_render_time = 1;
var total_rendered_frames = 0;


function _platform_init(argc, argv, title, iconName) {

    var i;
    var timeElapsed;
    var dummyString = "";

    timeElapsed = Timer.getPlatformTicks();

    // todo: Setup_UnstableNetworking, command line args

    scancodes[27] = 0x01; // Esc
    scancodes[48] = 0x02; // 0 
    scancodes[49] = 0x03; // 1
    scancodes[50] = 0x04; // 2
    scancodes[51] = 0x05; // 3
    scancodes[52] = 0x06; // 4
    scancodes[53] = 0x07; // 5
    scancodes[54] = 0x08; // 6
    scancodes[55] = 0x09; // 7
    scancodes[56] = 0x0A; // 8
    scancodes[57] = 0x0B; // 9
    //scancodes[SDLK_MINUS] = 0x0C; /* was 0x4A */
    //scancodes[SDLK_EQUALS] = 0x0D; /* was 0x4E */
    //scancodes[SDLK_BACKSPACE] = 0x0E;
    //scancodes[SDLK_TAB] = 0x0F;
    //scancodes[SDLK_q] = 0x10;
    //scancodes[SDLK_w] = 0x11;
    //scancodes[SDLK_e] = 0x12;
    //scancodes[SDLK_r] = 0x13;
    //scancodes[SDLK_t] = 0x14;
    //scancodes[SDLK_y] = 0x15;
    //scancodes[SDLK_u] = 0x16;
    //scancodes[SDLK_i] = 0x17;
    //scancodes[SDLK_o] = 0x18;
    //scancodes[SDLK_p] = 0x19;
    //scancodes[SDLK_LEFTBRACKET] = 0x1A;
    //scancodes[SDLK_RIGHTBRACKET] = 0x1B;
    scancodes[13] = 0x1C; // Return/enter
    //scancodes[SDLK_LCTRL] = 0x1D;
    //scancodes[SDLK_a] = 0x1E;
    //scancodes[SDLK_s] = 0x1F;
    //scancodes[SDLK_d] = 0x20;
    //scancodes[SDLK_f] = 0x21;
    //scancodes[SDLK_g] = 0x22;
    //scancodes[SDLK_h] = 0x23;
    //scancodes[SDLK_j] = 0x24;
    //scancodes[SDLK_k] = 0x25;
    //scancodes[SDLK_l] = 0x26;
    //scancodes[SDLK_SEMICOLON] = 0x27;
    //scancodes[SDLK_QUOTE] = 0x28;
    //scancodes[SDLK_BACKQUOTE] = 0x29;
    //scancodes[SDLK_LSHIFT] = 0x2A;
    //scancodes[SDLK_BACKSLASH] = 0x2B;
    //scancodes[SDLK_z] = 0x2C;
    //scancodes[SDLK_x] = 0x2D;
    //scancodes[SDLK_c] = 0x2E;
    //scancodes[SDLK_v] = 0x2F;
    //scancodes[SDLK_b] = 0x30;
    //scancodes[SDLK_n] = 0x31;
    //scancodes[SDLK_m] = 0x32;
    //scancodes[SDLK_COMMA] = 0x33;
    //scancodes[SDLK_PERIOD] = 0x34;
    //scancodes[SDLK_SLASH] = 0x35;
    //scancodes[SDLK_RSHIFT] = 0x36;
    //scancodes[SDLK_KP_MULTIPLY] = 0x37;
    //scancodes[SDLK_LALT] = 0x38;
    //scancodes[SDLK_SPACE] = 0x39;
    //scancodes[SDLK_CAPSLOCK] = 0x3A;
    //scancodes[SDLK_F1] = 0x3B;
    //scancodes[SDLK_F2] = 0x3C;
    //scancodes[SDLK_F3] = 0x3D;
    //scancodes[SDLK_F4] = 0x3E;
    //scancodes[SDLK_F5] = 0x3F;
    //scancodes[SDLK_F6] = 0x40;
    //scancodes[SDLK_F7] = 0x41;
    //scancodes[SDLK_F8] = 0x42;
    //scancodes[SDLK_F9] = 0x43;
    //scancodes[SDLK_F10] = 0x44;
    //scancodes[SDLK_NUMLOCK] = 0x45;
    //scancodes[SDLK_SCROLLOCK] = 0x46;
    //scancodes[SDLK_KP7] = 0x47;
    //scancodes[SDLK_KP8] = 0x48;
    //scancodes[SDLK_KP9] = 0x49;
    //scancodes[SDLK_KP_MINUS] = 0x4A;
    //scancodes[SDLK_KP4] = 0x4B;
    //scancodes[SDLK_KP5] = 0x4C;
    //scancodes[SDLK_KP6] = 0x4D;
    //scancodes[SDLK_KP_PLUS] = 0x4E;
    //scancodes[SDLK_KP1] = 0x4F;
    //scancodes[SDLK_KP2] = 0x50;
    //scancodes[SDLK_KP3] = 0x51;
    //scancodes[SDLK_KP0] = 0x52;
    //scancodes[SDLK_KP_PERIOD] = 0x53;
    //scancodes[SDLK_F11] = 0x57;
    //scancodes[SDLK_F12] = 0x58;
    //scancodes[SDLK_PAUSE] = 0x59; /* SBF - technically incorrect */

    scancodes[13] = 0xE01C; // Return/enter
    //scancodes[SDLK_RCTRL] = 0xE01D;
    //scancodes[SDLK_KP_DIVIDE] = 0xE035;
    //scancodes[SDLK_PRINT] = 0xE037; /* SBF - technically incorrect */
    //scancodes[SDLK_SYSREQ] = 0xE037; /* SBF - for windows... */
    //scancodes[SDLK_RALT] = 0xE038;
    //scancodes[SDLK_HOME] = 0xE047;
    scancodes[38] = 0xE048; // Up
    //scancodes[SDLK_PAGEUP] = 0xE049;
    scancodes[37] = 0xE04B; // Left
    scancodes[39] = 0xE04D; // Right
    //scancodes[SDLK_END] = 0xE04F;
    scancodes[40] = 0xE050; // Down
    //scancodes[SDLK_PAGEDOWN] = 0xE051;
    //scancodes[SDLK_INSERT] = 0xE052;
    //scancodes[SDLK_DELETE] = 0xE053;
}

// 226
var screenalloctype = 255;

function init_new_res_vars(screenMode, screenWidth, screenHeight) {
    var i = 0, j = 0;

    console.log("todo setup mouse");

    xdim = xres = surface.width;
    ydim = yres = surface.height;

    console.log("init_new_res_vars %d %d", xdim, ydim);

    bytesperline = surface.width;
    vesachecked = 1;
    vgacompatible = 1;
    linearmode = 1;
    qsetmode = surface.height;
    activepage = visualpage = 0;

    //console.assert(ScreenWidth == screenWidth, "todo, match up ScreenWidth and screenWidth");
    //console.assert(ScreenHeight == screenHeight, "todo, match up ScreenHeight and screenHeight");
    frameoffset = frameplace = new PointerHelper(new Uint8Array(ScreenWidth * ScreenHeight));

    j = ydim * 4 * 4;

    if (horizlookup) {
        throw new Error("todo");
    }

    if (horizlookup2) {
        throw new Error("todo");
    }

    horizlookup = new Int32Array(j / 4);
    horizlookup2 = new Int32Array(j / 4);

    j = 0;

    // Build lookup table (X screespace -> frambuffer offset. 
    for (i = 0; i < ydim; i++) {
        ylookup[i] = j;
        j += bytesperline;
    }

    horizycent = ((ydim * 4) >> 1);

    /* Force drawrooms to call dosetaspect & recalculate stuff */
    oxyaspect = oxdimen = oviewingrange = -1;

    //Let the Assembly module how many pixels to skip when drawing a column
    setBytesPerLine(bytesperline);

    setView(0, 0, xdim - 1, ydim - 1);

    setBrightness(curbrightness, palette);

    if (searchx < 0) {
        searchx = halfxdimen;
        searchy = (ydimen >> 1);
    }
}

//308
function go_to_new_vid_mode(screenMode) {
    init_new_res_vars(screenMode);
}

//454
function sdl_key_filter(event, keyReleased) {
//    var extended;

//    if ( (event.key.keysym.sym == SDLK_m) &&
//         (event.key.state == SDL_PRESSED) &&
//         (event.key.keysym.mod & KMOD_CTRL) )
//    {
//		// FIX_00005: Mouse pointer can be toggled on/off (see mouse menu or use CTRL-M)
//		// This is usefull to move the duke window when playing in window mode.
  
//        if (SDL_WM_GrabInput(SDL_GRAB_QUERY)==SDL_GRAB_ON) 
//		{
//            SDL_WM_GrabInput(SDL_GRAB_OFF);
//			SDL_ShowCursor(1);
//		}
//		else
//		{
//            SDL_WM_GrabInput(SDL_GRAB_ON);
//			SDL_ShowCursor(0);
//		}

//        return(0);
//    } /* if */

//    else if ( ( (event.key.keysym.sym == SDLK_RETURN) ||
//                (event.key.keysym.sym == SDLK_KP_ENTER) ) &&
//              (event.key.state == SDL_PRESSED) &&
//              (event.key.keysym.mod & KMOD_ALT) )
//    {	fullscreen_toggle_and_change_driver();

//		// hack to discard the ALT key...
//		lastkey=scancodes[SDLK_RALT]>>8; // extended
//		keyhandler();
//		lastkey=(scancodes[SDLK_RALT]&0xff)+0x80; // Simulating Key up
//		keyhandler();
//		lastkey=(scancodes[SDLK_LALT]&0xff)+0x80; // Simulating Key up (not extended)
//		keyhandler();
//		SDL_SetModState(KMOD_NONE); // SDL doesnt see we are releasing the ALT-ENTER keys
        
//		return(0);					
//    }								

//    if (!handle_keypad_enter_hack(event))
        lastkey = scancodes[event.keyCode];

////	printf("key.keysym.sym=%d\n", event.key.keysym.sym);

//    if (lastkey == 0x0000)   /* No DOS equivalent defined. */
//        return(0);

//    extended = ((lastkey & 0xFF00) >> 8);
//    if (extended != 0)
//    {
//        lastkey = extended;
//        keyhandler();
//        lastkey = (scancodes[event.key.keysym.sym] & 0xFF);
//    } /* if */

    if (keyReleased)
        lastkey += 128;  /* +128 signifies that the key is released in DOS. */

    keyhandler();
    return(0);
} 

/* sdl_key_filter */
//560
function handle_events() {
    var event;
	//while(SDL_PollEvent(&event))
    //root_sdl_event_filter(&event);
}

var _handle_events = handle_events;

function _readlastkeyhit() {
    return(lastkey);
} /* _readlastkeyhit */


//940
Display.setGameMode = function (screenMode, screenWidth, screenHeight) {
    surface.width = screenWidth;
    surface.height = screenHeight;
    go_to_new_vid_mode(screenMode);

    qsetmode = 200;
    last_render_ticks = getTicks();

    return 0;
};


function Color() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.all = 0;
    Object.defineProperty(this, "cssColor", {
        get: function () {
            return "rgba(" + this.r + "," + this.g + "," + this.b + ", 255);";
        }
    });
}

//1330
var colorPaletteRrb = structArray(Color, 256);
var colorPalette;
function VBE_setPalette(paletteBuffer, debug) {
    /*
     * (From Ken's docs:)
     *   Set (num) palette palette entries starting at (start)
     *   palette entries are in a 4-byte format in this order:
     *       0: Blue (0-63)
     *       1: Green (0-63)
     *       2: Red (0-63)
     *       3: Reserved
     *
     * Naturally, the bytes are in the reverse order that SDL wants them...
     *  More importantly, SDL wants the color elements in a range from 0-255,
     *  so we do a conversion.
     */

    var fmtSwap = new Array(256); // faster than Uint32Array by 2ms each read???
    var sdlp = 0;
    var p = 0;

    ////CODE EXPLORATION
    ////Used only to write the last palette to file.
    //memcpy(lastPalette, palettebuffer, 768);
    var debugHtml = "";
    for (var i = 0; i < 256; i++) {
        fmtSwap[sdlp] = (255 << 24) | // alpha
            ((paletteBuffer[p] / 63.0) * 255.0) << 16 | // blue
            ((paletteBuffer[p + 1] / 63.0) * 255.0) << 8 | // green
            ((paletteBuffer[p + 2] / 63.0) * 255.0); // red

        colorPaletteRrb[sdlp].b = ((paletteBuffer[p++] / 63.0) * 255.0) | 0; // just used for clearing screen
        colorPaletteRrb[sdlp].g = ((paletteBuffer[p++] / 63.0) * 255.0) | 0;
        colorPaletteRrb[sdlp].r = ((paletteBuffer[p++] / 63.0) * 255.0) | 0;
        p++;
        //debugHtml += "<span style='background:rgb(" + (colorPaletteRrb[sdlp].r) + "," + (colorPaletteRrb[sdlp].g) + "," + (colorPaletteRrb[sdlp].b) + ")'>" +
        //    sdlp + "&nbsp;</span>";
        sdlp++;
    }

    //if (debug) {
    //    paletteDebug.innerHTML += "<div>" + debugHtml + "</div>"; // could do console.log styles!
    //}

    colorPaletteRrb = colorPaletteRrb;
    colorPalette = fmtSwap;

    updateCanvas();
}

//1460
var framePlacePointerHelper;
function PointerHelper(array, position) {
    this.array = array instanceof Uint8Array ? array : new Uint8Array(array.buffer);
    this.position = position || 0;
    //this.bytesPerElement = array.BYTES_PER_ELEMENT;
}

PointerHelper.prototype.setByte = function (v) {
    this.array[this.position] = v;
};

PointerHelper.prototype.getByte = function (offset) {
    return this.array[this.position + (offset || 0)];
};

PointerHelper.prototype.getUint32 = function() {
    if (!this.uint32Array)
        this.uint32Array = new Uint32Array(this.array.buffer);
    return this.uint32Array[(this.position / 4) | 0];
};

PointerHelper.prototype.getInt32 = function () {
    if (!this.int32Array)
        this.int32Array = new Int32Array(this.array.buffer);
    return this.int32Array[(this.position / 4) | 0];
};

PointerHelper.prototype.setInt32 = function (v) {
    if (!this.int32Array)
        this.int32Array = new Int32Array(this.array.buffer);
    this.int32Array[(this.position / 4) | 0] = v;
};

function _nextpage() {
    var ticks;

    // todo: handle_events
    //handle_events();

    // SDL_UpdateRect alternative
    updateCanvas();

    ticks = Timer.getPlatformTicks();
    total_render_time = (ticks - last_render_ticks);
    if (total_render_time > 1000) {
        total_rendered_frames = 0;
        total_render_time = 1;
        last_render_ticks = ticks;
    }
    total_rendered_frames++;
}

var imageData;
//var buf = new ArrayBuffer(imageData.data.length);
function updateCanvas() {
    // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/  
    // todo: watch https://www.youtube.com/watch?feature=player_detailpage&v=XAqIpGU8ZZk#t=994s
    // possible palette tips: http://www.effectgames.com/effect/article.psp.html/joe/Old_School_Color_Cycling_with_HTML5
    // http://www.effectgames.com/demos/canvascycle/palette.js
    if (frameplace) {
        if (!imageData) {
            imageData = surfaceContext.getImageData(0, 0, ScreenWidth, ScreenHeight);
        }

        var buf = new ArrayBuffer(imageData.data.length); // creating new ones like this is faster than having them premade
        var buf8 = new Uint8ClampedArray(buf); // won't work in safari 5.1
        var data = new Uint32Array(buf);

        var newImageData = frameplace.array;
        var len = newImageData.length;
        // chrome: a for loop with the length saved as a variable seemed to be the fastest (do while: slow, for with a i++ < len also slow) 
        for (var i = 0; i < len; i++) {
            data[i] = colorPalette[newImageData[i]];
        }

        imageData.data.set(buf8);
        surfaceContext.putImageData(imageData, 0, 0);
    }
}

// 1769
//-------------------------------------------------------------------------------------------------
//  TIMER
//=================================================================================================

var timerFreq = 0;
var timerLastSample = 0;
var timerTicsPerSec = 0;
var userTimerCallback = null;

function initTimer(ticksPerSecond) {
    if (timerFreq) {
        return 0;
    }

    timerFreq = 1000;
    timerTicsPerSec = ticksPerSecond;
    timerLastSample = (Timer.getPlatformTicks() * timerTicsPerSec / timerFreq) | 0;
    userTimerCallback = null;

    return 0;
}

function sampletimer() {
    var i, n;

    if (!timerFreq) {
        return;
    }

    i = Timer.getPlatformTicks();

    n = ((i * timerTicsPerSec / timerFreq) | 0) - timerLastSample;

    if (n > 0) {
        totalclock += n;
        timerLastSample += n;
    }

    if (userTimerCallback) {
        for (; n > 0; n--) {
            userTimerCallback();
        }
    }
}

function getTicks() {
    var i = Timer.getPlatformTicks();
    return (i * (1000) / timerFreq) | 0;
}

var Timer = { initTime: Date.now(), ticksInOneSecond: 1000 };

Timer.getPlatformTicks = function() {
    return Date.now() - Timer.initTime;
};

var fakeTime = 0;
//Timer.getPlatformTicks = function () {
//    fakeTime += 50;
//    printf("fakeTime: %i", fakeTime);
//    return fakeTime;
//};