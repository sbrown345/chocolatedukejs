'use strict';

var scancodes = new Array(323);

var Display = {};


var xres, yres, bytesperline, imageSize, maxpages;
var frameplace;

////The frambuffer address
var frameoffset;
var  /**screen,*/ vesachecked;
var buffermode, origbuffermode, linearmode;
var permanentupdate = 0, vgacompatible;

var surface = document.getElementById("gameCanvas");


var last_render_ticks = 0;
var total_render_time = 1;
var total_rendered_frames = 0;


function _platform_init(argc, argv, title, iconName) {

    var timeElapsed = Date.now() * 0.001;

    // todo: Setup_UnstableNetworking, command line args

    scancodes[27] = 0x01; // Esc
    //scancodes[SDLK_1] = 0x02;
    //scancodes[SDLK_2] = 0x03;
    //scancodes[SDLK_3] = 0x04;
    //scancodes[SDLK_4] = 0x05;
    //scancodes[SDLK_5] = 0x06;
    //scancodes[SDLK_6] = 0x07;
    //scancodes[SDLK_7] = 0x08;
    //scancodes[SDLK_8] = 0x09;
    //scancodes[SDLK_9] = 0x0A;
    //scancodes[SDLK_0] = 0x0B;
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
    //scancodes[SDLK_RETURN] = 0x1C;
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

    //scancodes[SDLK_KP_ENTER] = 0xE01C;
    //scancodes[SDLK_RCTRL] = 0xE01D;
    //scancodes[SDLK_KP_DIVIDE] = 0xE035;
    //scancodes[SDLK_PRINT] = 0xE037; /* SBF - technically incorrect */
    //scancodes[SDLK_SYSREQ] = 0xE037; /* SBF - for windows... */
    //scancodes[SDLK_RALT] = 0xE038;
    //scancodes[SDLK_HOME] = 0xE047;
    scancodes[38] = 0xE048; // Up
    //scancodes[SDLK_PAGEUP] = 0xE049;
    //scancodes[SDLK_LEFT] = 0xE04B;
    //scancodes[SDLK_RIGHT] = 0xE04D;
    //scancodes[SDLK_END] = 0xE04F;
    //scancodes[SDLK_DOWN] = 0xE050;
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

    frameoffset = frameplace = surface.getContext("2d");//.createImageData(screenWidth, screenHeight);
    j = ydim * 4 * 4;

    if (horizlookup) {
        throw new Error("todo");
    }

    if (horizlookup2) {
        throw new Error("todo");
    }

    //horizlookup = (int32_t*)malloc(j);
    //horizlookup2 = (int32_t*)malloc(j);

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

Display.setGameMode = function (screenMode, screenWidth, screenHeight) {
    surface.width = screenWidth;
    surface.height = screenHeight;
    go_to_new_vid_mode(screenMode);

    qsetmode = 200;
    last_render_ticks = getTicks();

    return 0;
};

//1330
function VBE_setPalette(paletteBuffer) {
    console.warn("VBE_setPalette todo when there's something on the screen to test!");
}

//1460
var tempFramePlaceThing;
function _nextpage() {
    var ticks;

    console.log("todo: _nextpage: handle_events");
    //handle_events();

    // SDL_UpdateRect alternative
    if (tempFramePlaceThing) {
        var imageData = frameplace.getImageData(0, 0, ScreenWidth, ScreenHeight);
        var newImageData = new Uint8Array(tempFramePlaceThing.buffer);
        for (var i = 0; i < imageData.data.length; i++) {
            imageData.data[i] = newImageData[i];
            if ((i+1) % 4 == 0) {
                imageData.data[i] = 255;
            }
        }
        frameplace.putImageData(imageData, 0, 0);
    }
    tempFramePlaceThing = new DataStream(frameplace.getImageData(0, 0, ScreenWidth, ScreenHeight).data);

    ticks = Timer.getPlatformTicks();
    total_render_time = (ticks - last_render_ticks);
    if (total_render_time > 1000) {
        total_rendered_frames = 0;
        total_render_time = 1;
        last_render_ticks = ticks;
    }
    total_rendered_frames++;
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

function sampleTimer() {
    var i, n;

    if (!timerFreq) {
        return;
    }

    i = Timer.getPlatformTicks();

    n = ((i * timerLastSample / timerFreq) | 0) - timerLastSample;

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

Timer.getPlatformTicks = function () {
    return Date.now() - Timer.initTime;
}