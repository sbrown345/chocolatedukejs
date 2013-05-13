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
    scancodes[49] = 0x02; // 1 
    scancodes[50] = 0x03; // 2
    scancodes[51] = 0x04; // 3
    scancodes[52] = 0x05; // 4
    scancodes[53] = 0x06; // 5
    scancodes[54] = 0x07; // 6
    scancodes[55] = 0x08; // 7
    scancodes[56] = 0x09; // 8
    scancodes[57] = 0x0A; // 9
    scancodes[48] = 0x0B; // 0
    scancodes[189] = 0x0C; /* was 0x4A */ // SDLK_MINUS
    scancodes[187] = 0x0D; /* was 0x4E */ // SDLK_EQUALS
    scancodes[8] = 0x0E; // SDLK_BACKSPACE
    scancodes[9] = 0x0F; // SDLK_TAB
    scancodes[81] = 0x10; // SDLK_q
    scancodes[87] = 0x11; // SDLK_w
    scancodes[69] = 0x12; // SDLK_e
    scancodes[82] = 0x13; // SDLK_r
    scancodes[84] = 0x14; // SDLK_t
    scancodes[89] = 0x15; // SDLK_y
    scancodes[85] = 0x16; // SDLK_u
    scancodes[73] = 0x17; // SDLK_i
    scancodes[79] = 0x18; // SDLK_o
    scancodes[80] = 0x19; // SDLK_p
    scancodes[219] = 0x1A; // SDLK_LEFTBRACKET
    scancodes[221] = 0x1B; // SDLK_RIGHTBRACKET
    scancodes[13] = 0x1C; // Return/enter
    scancodes[17] = 0x1D; // SDLK_LCTRL
    scancodes[65] = 0x1E; // SDLK_a
    scancodes[83] = 0x1F; // SDLK_s
    scancodes[68] = 0x20; // SDLK_d
    scancodes[70] = 0x21; // SDLK_f
    scancodes[71] = 0x22; // SDLK_g
    scancodes[72] = 0x23; // SDLK_h
    scancodes[74] = 0x24; // SDLK_j
    scancodes[75] = 0x25; // SDLK_k
    scancodes[76] = 0x26; // SDLK_l
    scancodes[186] = 0x27; // SDLK_SEMICOLON
    scancodes[192] = 0x28; // SDLK_QUOTE
    scancodes[223] = 0x29; // SDLK_BACKQUOTE
    scancodes[16] = 0x2A; // SDLK_LSHIFT
    scancodes[220] = 0x2B; // SDLK_BACKSLASH
    scancodes[90] = 0x2C; // SDLK_z
    scancodes[88] = 0x2D; // SDLK_x
    scancodes[67] = 0x2E; // SDLK_c
    scancodes[86] = 0x2F; // SDLK_v
    scancodes[66] = 0x30; // SDLK_b
    scancodes[78] = 0x31; // SDLK_n
    scancodes[77] = 0x32; // SDLK_m
    scancodes[188] = 0x33; // SDLK_COMMA
    scancodes[190] = 0x34; // SDLK_PERIOD
    scancodes[191] = 0x35; // SDLK_SLASH
    scancodes[16] = 0x36; // SDLK_RSHIFT
    scancodes[106] = 0x37; // SDLK_KP_MULTIPLY
    scancodes[18] = 0x38; // SDLK_LALT
    scancodes[32] = 0x39; // SDLK_SPACE
    scancodes[20] = 0x3A; // SDLK_CAPSLOCK
    scancodes[112] = 0x3B; // SDLK_F1
    scancodes[113] = 0x3C; // SDLK_F2
    scancodes[114] = 0x3D; // SDLK_F3
    scancodes[115] = 0x3E; // SDLK_F4
    scancodes[116] = 0x3F;  // SDLK_F5
    scancodes[117] = 0x40; // SDLK_F6
    scancodes[118] = 0x41; // SDLK_F7
    scancodes[119] = 0x42; // SDLK_F8
    scancodes[120] = 0x43; // SDLK_F9 (same as print?)
    scancodes[121] = 0x44; // SDLK_F10
    scancodes[144] = 0x45; // SDLK_NUMLOCK
    scancodes[145] = 0x46; // SDLK_SCROLLOCK
    scancodes[103] = 0x47; // SDLK_KP
    scancodes[104] = 0x48; // SDLK_KP
    scancodes[105] = 0x49; // SDLK_KP
    scancodes[109] = 0x4A; // SDLK_KP_MINUS
    scancodes[100] = 0x4B; // SDLK_KP4
    scancodes[101] = 0x4C; // SDLK_KP5
    scancodes[102] = 0x4D; // SDLK_KP6
    scancodes[107] = 0x4E; // SDLK_KP_PLUS
    scancodes[97] = 0x4F; // SDLK_KP1
    scancodes[98] = 0x50; // SDLK_KP2
    scancodes[99] = 0x51; // SDLK_KP3
    scancodes[96] = 0x52; // SDLK_KP0
    scancodes[110] = 0x53; //SDLK_KP_PERIOD
    scancodes[122] = 0x57; // SDLK_F11
    scancodes[123] = 0x58; // SDLK_F12
    scancodes[19] = 0x59; /* SBF - technically incorrect - SDL */ // SDLK_PAUSE

    scancodes[13] = 0xE01C; // Return/enter
    //scancodes[17] = 0xE01D; // SDLK_RCTRL 
    scancodes[111] = 0xE035; // SDLK_KP_DIVIDE
    //scancodes[SDLK_PRINT] = 0xE037; /* SBF - technically incorrect */
    //scancodes[SDLK_SYSREQ] = 0xE037; /* SBF - for windows... */
    //scancodes[SDLK_RALT] = 0xE038; //fires off 17 (breaking LCTRL) and 18 too (chrome)?
    scancodes[36] = 0xE047; // SDLK_HOME
    scancodes[38] = 0xE048; // Up
    scancodes[33] = 0xE049; // SDLK_PAGEUP
    scancodes[37] = 0xE04B; // Left
    scancodes[39] = 0xE04D; // Right
    scancodes[35] = 0xE04F; // SDLK_END
    scancodes[40] = 0xE050; // Down
    scancodes[34] = 0xE051; // SDLK_PAGEDOWN
    scancodes[45] = 0xE052; // SDLK_INSERT
    scancodes[46] = 0xE053; // SDLK_DELETE
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
    for (i = 0; i <= ydim; i++) {
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
function sdl_key_filter(event) {
    //console.log("sdl_key_filter", event)
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
        lastkey = scancodes[event.key.keyCode];

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

        if (event.key.state == SDL_RELEASED)
            lastkey += 128;  /* +128 signifies that the key is released in DOS. */

    keyhandler();
    return(0);
}

function root_sdl_event_filter(event) {
    switch (event.type)
    {
        case SDL_KEYUP:
            // FIX_00003: Pause mode is now fully responsive - (Thx to Jonathon Fowler tips)
            //todo pause key: //if(event.key.keysym.sym == SDLK_PAUSE)
            //    break;
        case SDL_KEYDOWN:
            return(sdl_key_filter(event));
        case SDL_JOYBUTTONDOWN:
        case SDL_JOYBUTTONUP:
            {
                //Do Nothing

                //printf("Joybutton UP/DOWN\n");
                //return(sdl_joystick_button_filter((const SDL_MouseButtonEvent*)event));
                return 0;
            }
        case SDL_JOYBALLMOTION:
        case SDL_MOUSEMOTION:
            return(sdl_mouse_motion_filter(event));
        case SDL_MOUSEBUTTONUP:
        case SDL_MOUSEBUTTONDOWN:
            return(sdl_mouse_button_filter(/*(const SDL_MouseButtonEvent*)*/event));
        case SDL_QUIT:
            /* !!! rcg TEMP */
            Error(EXIT_SUCCESS, "Exit through SDL\n"); 
        default:
            //printf("This event is not handled: %d\n",event.type);
            break;
    } /* switch */

    return(1);
} /* root_sdl_event_filter
}

/* sdl_key_filter */
//560
function handle_events() {
    while (events.length) {
        root_sdl_event_filter(events.shift());
    }
}

var _handle_events = handle_events;

function _readlastkeyhit() {
    return(lastkey);
} /* _readlastkeyhit */


// Capture BMP of the current frame
function screencapture(filename, inverseit) {
//  FIX_00006: better naming system for screenshots + message when pic is taken. 
//  Use ./screenshots folder. Screenshot code rerwritten. Faster and
    //  makes smaller files. Doesn't freeze or lag the game anymore.

    //var image = surface.toDataURL("image/png").replace("image/png", "image/octet-stream");
    //window.location.href = image;
    
    surface.toBlob(function (blob) {
        saveAs(blob, filename);
    });

    return 0;
} /* screencapture */


//940
Display.setGameMode = function (screenMode, screenWidth, screenHeight) {
    if (screenMode > MAXXDIM || screenHeight > MAXYDIM) {
        printf("Resolution %dx%d is too high. Changed to %dx%d\n", screenWidth, screenHeight, MAXXDIM, MAXYDIM);
        screenWidth = MAXXDIM;
        screenHeight = MAXYDIM;
    }
    
    getvalidvesamodes();

    //validated = 0;
    //for (i = 0; i < validmodecnt; i++) {
    //    if (validmodexdim[i] == daxdim && validmodeydim[i] == daydim)
    //        validated = 1;
    //}

    //if (!validated) {
    //    printf("Resolution %dx%d unsupported. Changed to 640x480\n", daxdim, daydim);
    //    daxdim = 640;
    //    daydim = 480;
    //}

    surface.width = screenWidth;
    surface.height = screenHeight;
    go_to_new_vid_mode(screenMode);

    qsetmode = 200;
    last_render_ticks = getTicks();

    return 0;
};

//1045
function add_vesa_mode(typestr, w, h) {
    //printf("Adding %s resolution (%dx%d).\n", typestr, w, h);
    validmode[validmodecnt] = validmodecnt;
    validmodexdim[validmodecnt] = w;
    validmodeydim[validmodecnt] = h;
    validmodecnt++;
}


//1207
var already_checked = 0;
function getvalidvesamodes() {
    var i;
    var stdres = [
        [320, 200], [640, 350], [640, 480],
        [800, 600], [1024, 768]
    ];

    if (already_checked)
        return;
    
    already_checked = 1;
    
    /* fill in the standard resolutions... */
    for (i = 0; i < stdres.length ; i++)
        add_vesa_mode("standard", stdres[i][0], stdres[i][1]);

    // todo missing stuff...??
}


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
    //var debugHtml = "";
    for (var i = 0; i < 256; i++) {
        fmtSwap[sdlp] = (255 << 24) | // alpha
            ((paletteBuffer[p] / 63.0) * 255.0) << 16 | // blue
            ((paletteBuffer[p + 1] / 63.0) * 255.0) << 8 | // green
            ((paletteBuffer[p + 2] / 63.0) * 255.0); // red

        colorPaletteRrb[sdlp].b = ((paletteBuffer[p++] / 63.0) * 255.0) | 0; // safari/IE10
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

PointerHelper.prototype.setByteOffset = function (v, offset) {
    this.array[this.position + offset] = v;
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


function _updateScreenRect(/*int32_t x, int32_t y, int32_t w, int32_t h*/) {
    //SDL_UpdateRect(surface, x, y, w, h);
    updateCanvas();
}

function _nextpage() {
    var ticks;

    // todo: handle_events
    handle_events();

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

//inline...
//function drawpixel(array, idx, pixel)
//{
    
//}

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
        var buf8 = new Uint8ClampedArray(buf);
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

if (typeof Uint8ClampedArray === "undefined") {
    updateCanvas = function () {
        if (frameplace) {
            var imageData = surface.getContext("2d").getImageData(0, 0, ScreenWidth, ScreenHeight);
            var newImageData = frameplace.array;
            for (var i = 0; i < newImageData.length; i++) {
                imageData.data[i * 4] = colorPaletteRrb[newImageData[i]].r;
                imageData.data[i * 4 + 1] = colorPaletteRrb[newImageData[i]].g;
                imageData.data[i * 4 + 2] = colorPaletteRrb[newImageData[i]].b;
                imageData.data[i * 4 + 3] = 255;
            }
            surface.getContext("2d").putImageData(imageData, 0, 0);
        }
    };
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

////Timer.getPlatformTicks = function() {
////    return Date.now() - Timer.initTime;
////};

var fakeTime = 0;
Timer.getPlatformTicks = function () {
    fakeTime += 10;
    printf("fakeTime: %i\n", fakeTime);
    return fakeTime;
};