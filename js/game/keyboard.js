'use strict';

var KB = {};

var  sc_None         	=	0   ;
var  sc_Bad          	=	0xff	;
var  sc_Comma        	=	0x33	;
var  sc_Period       	=	0x34	;
var  sc_Return       	=	0x1c	;
var  sc_Enter        	=	sc_Return	;
var  sc_Escape       	=	0x01	;
var  sc_Space        	=	0x39	;
var  sc_BackSpace    	=	0x0e	;
var  sc_Tab          	=	0x0f	;
var  sc_LeftAlt      	=	0x38	;
var  sc_LeftControl  	=	0x1d	;
var  sc_CapsLock     	=	0x3a	;
var  sc_LeftShift    	=	0x2a	;
var  sc_RightShift   	=	0x36	;
var  sc_F1           	=	0x3b	;
var  sc_F2           	=	0x3c	;
var  sc_F3           	=	0x3d	;
var  sc_F4           	=	0x3e	;
var  sc_F5           	=	0x3f	;
var  sc_F6           	=	0x40	;
var  sc_F7           	=	0x41	;
var  sc_F8           	=	0x42	;
var  sc_F9           	=	0x43	;
var  sc_F10          	=	0x44	;
var  sc_F11          	=	0x57	;
var  sc_F12          	=	0x58	;
var  sc_Kpad_Star    	=	0x37	;
var  sc_Pause        	=	0x59	;
var  sc_ScrollLock   	=	0x46	;
var  sc_NumLock      	=	0x45	;
var  sc_Slash        	=	0x35	;
var  sc_SemiColon    	=	0x27	;
var  sc_Quote        	=	0x28	;
var  sc_Tilde        	=	0x29	;
var  sc_BackSlash    	=	0x2b	;
			
var  sc_OpenBracket  	=	0x1a	;
var  sc_CloseBracket 	=	0x1b	;
			
var  sc_1            	=	0x02	;
var  sc_2            	=	0x03	;
var  sc_3            	=	0x04	;
var  sc_4            	=	0x05	;
var  sc_5            	=	0x06	;
var  sc_6            	=	0x07	;
var  sc_7            	=	0x08	;
var  sc_8            	=	0x09	;
var  sc_9            	=	0x0a	;
var  sc_0            	=	0x0b	;
var  sc_Minus        	=	0x0c	;
var  sc_Equals       	=	0x0d	;
var  sc_Plus         	=	0x0d	;
	
var  sc_kpad_1       	=	0x4f	;
var  sc_kpad_2       	=	0x50	;
var  sc_kpad_3       	=	0x51	;
var  sc_kpad_4       	=	0x4b	;
var  sc_kpad_5       	=	0x4c	;
var  sc_kpad_6       	=	0x4d	;
var  sc_kpad_7       	=	0x47	;
var  sc_kpad_8       	=	0x48	;
var  sc_kpad_9       	=	0x49	;
var  sc_kpad_0       	=	0x52	;
var  sc_kpad_Minus   	=	0x4a	;
var  sc_kpad_Plus    	=	0x4e	;
var  sc_kpad_Period  	=	0x53	;
			
var  sc_A            	=	0x1e	;
var  sc_B            	=	0x30	;
var  sc_C            	=	0x2e	;
var  sc_D            	=	0x20	;
var  sc_E            	=	0x12	;
var  sc_F            	=	0x21	;
var  sc_G            	=	0x22	;
var  sc_H            	=	0x23	;
var  sc_I            	=	0x17	;
var  sc_J            	=	0x24	;
var  sc_K            	=	0x25	;
var  sc_L            	=	0x26	;
var  sc_M            	=	0x32	;
var  sc_N            	=	0x31	;
var  sc_O            	=	0x18	;
var  sc_P            	=	0x19	;
var  sc_Q            	=	0x10	;
var  sc_R            	=	0x13	;
var  sc_S            	=	0x1f	;
var  sc_T            	=	0x14	;
var  sc_U            	=	0x16	;
var  sc_V            	=	0x2f	;
var  sc_W            	=	0x11	;
var  sc_X            	=	0x2d	;
var  sc_Y            	=	0x15	;
var  sc_Z            	=	0x2c	;
			
// Extended scan codes	=		;
			
var  sc_UpArrow      	=	0x5a	;
var  sc_DownArrow    	=	0x6a	;
var  sc_LeftArrow    	=	0x6b	;
var  sc_RightArrow   	=	0x6c	;
var  sc_Insert       	=	0x5e	;
var  sc_Delete       	=	0x5f	;
var  sc_Home         	=	0x61	;
var  sc_End          	=	0x62	;
var  sc_PgUp         	=	0x63	;
var  sc_PgDn         	=	0x64	;
var  sc_RightAlt     	=	0x65	;
var  sc_RightControl 	=	0x66	;
var  sc_kpad_Slash   	=	0x67	;
var  sc_kpad_Enter   	=	0x68	;
var  sc_PrintScreen  	=	0x69	;
var  sc_LastScanCode 	=	0x6e	;
			
// Ascii scan codes	=		;
			
var  asc_Enter       	=	13	;
var  asc_Escape      	=	27	;
var  asc_BackSpace   	=	8	;
var  asc_Tab         	=	9	;
var  asc_Space       	=	32	;
			
var MAXKEYBOARDSCAN  	=	128	;

/*
=============================================================================

                               GLOBAL VARIABLES

=============================================================================
*/

KB.keyDown = new Uint8Array(MAXKEYBOARDSCAN);   // Keyboard state array
var KB_LastScan;

var keyIsWaiting = false;

var scancodeToASCII = new Uint8Array(MAXKEYBOARDSCAN);
var shiftedScancodeToASCII = new Uint8Array(MAXKEYBOARDSCAN);
var extscanToSC = new Uint8Array(MAXKEYBOARDSCAN);

var events = [];


// todo: un-SDLify this
var SDL_RELEASED = 0;
var SDL_PRESSED = 1;

var SDL_NOEVENT = 0, /**< Unused (do not remove) */
    SDL_ACTIVEEVENT = 1, /**< Application loses/gains visibility */
    SDL_KEYDOWN = 2,//"2 SDL_KEYDOWN", /**< Keys pressed */
    SDL_KEYUP = 3,//"3 SDL_KEYUP", /**< Keys released */
    SDL_MOUSEMOTION = 4, /**< Mouse moved */
    SDL_MOUSEBUTTONDOWN = 5, /**< Mouse button pressed */
    SDL_MOUSEBUTTONUP = 6, /**< Mouse button released */
    SDL_JOYAXISMOTION = 7, /**< Joystick axis motion */
    SDL_JOYBALLMOTION = 8, /**< Joystick trackball motion */
    SDL_JOYHATMOTION = 9, /**< Joystick hat position change */
    SDL_JOYBUTTONDOWN = 10, /**< Joystick button pressed */
    SDL_JOYBUTTONUP = 11, /**< Joystick button released */
    SDL_QUIT = 12, /**< User-requested quit */
    SDL_SYSWMEVENT = 13, /**< System specific event */
    SDL_EVENT_RESERVEDA = 14, /**< Reserved for future use.. */
    SDL_EVENT_RESERVEDB = 15, /**< Reserved for future use.. */
    SDL_VIDEORESIZE = 16, /**< User resized video mode */
    SDL_VIDEOEXPOSE = 17, /**< Screen needs to be redrawn */
    SDL_EVENT_RESERVED2 = 18, /**< Reserved for future use.. */
    SDL_EVENT_RESERVED3 = 19, /**< Reserved for future use.. */
    SDL_EVENT_RESERVED4 = 20, /**< Reserved for future use.. */
    SDL_EVENT_RESERVED5 = 21, /**< Reserved for future use.. */
    SDL_EVENT_RESERVED6 = 22, /**< Reserved for future use.. */
    SDL_EVENT_RESERVED7 = 23, /**< Reserved for future use.. */
    SDL_USEREVENT = 24,
    /** This last event is only for bounding internal arrays
    *  It is the number of bits in the event mask datatype -- Uint32
        */
    SDL_NUMEVENTS = 32;


var lastEvent;
var heldKeys = {};
window.onkeydown = function (e) {
    if (lastEvent && lastEvent.keyCode == e.keyCode) {
        return;
    }
    lastEvent = e;
    heldKeys[e.keyCode] = true;
    console.log("keydown", e.keyCode);
    events.push({ type: SDL_KEYDOWN, key: { type: SDL_KEYDOWN, keyCode: e.keyCode, state: SDL_PRESSED } });
    //sdl_key_filter(e, false);
};

window.onkeyup = function (e) {
    lastEvent = null;
    heldKeys[e.keyCode] = false;
    //console.log("keyup", e.keyCode);
    events.push({ type: SDL_KEYUP, key: { type: SDL_KEYUP, keyCode: e.keyCode, state: SDL_RELEASED } });
    //sdl_key_filter(e, true);
};

// "Macros"

function KB_GetLastScanCode() { return KB_LastScan; }

KB.keyPressed = function (scan) {
    return KB.keyDown[(scan)] != 0;
};

KB.clearKeyDown = function (scan) {
    return KB.keyDown[(scan)] == 0;
};

var KB_SetLastScanCode = function(scancode) { KB_LastScan = (scancode); };

var KB_ClearLastScanCode = function () {
    KB_SetLastScanCode(sc_None);
};

// Functions

function keyhandler() {
    var gotextended = false;
    
    var rawkey = _readlastkeyhit();
    var lastkey = rawkey & 0x7f;
    
    // 128 bit means key was released.
    var pressed = !(rawkey & 0x80);
    
    if (rawkey == 0xe0 && !gotextended)
    {
    	gotextended = true;
        return;
    }

    if (rawkey == 0xe1)
    {
    	/* SBF - build doesn't actually generate this for Pause/Break */
    	//STUBBED("Another extended key!");
    	return;
    }
        
    if (gotextended)
    {
    	gotextended = false;
    	
    	/* remap extended key to Duke3D equivalent */
    	lastkey = extscanToSC[lastkey];
    }
    
    if (lastkey >= MAXKEYBOARDSCAN)
    {
        //STUBBED("Scancode out of range!");
        return;
    }

    if (pressed) {
        KB_LastScan = lastkey;
    }

    KB.keyDown[lastkey] = pressed;

    keyIsWaiting = ((keyIsWaiting) || (KB.keyDown[lastkey]));
    
   Control.updateKeyboardState(lastkey, pressed);
}


KB.clearKeysDown = function () {
    for (var i = 0; i < KB.keyDown.length; i++) {
        KB.keyDown.length[i] = 0;
    }
    keyIsWaiting = false;
};


//146

function key2scancode(name, scancode) {
    this.name = name;
    this.code = scancode;
}

var keyname2scancode = [
    new key2scancode(",", sc_Comma),
    new key2scancode(".", sc_Period),
    new key2scancode("Enter", sc_Return),
    new key2scancode("Escape", sc_Escape),
    new key2scancode("Space", sc_Space),
    new key2scancode("BakSpc", sc_BackSpace),
    new key2scancode("Tab", sc_Tab),
    new key2scancode("LAlt", sc_LeftAlt),
    new key2scancode("LCtrl", sc_LeftControl),
    new key2scancode("CapLck", sc_CapsLock),
    new key2scancode("LShift", sc_LeftShift),
    new key2scancode("RShift", sc_RightShift),
    new key2scancode("F1", sc_F1),
    new key2scancode("F2", sc_F2),
    new key2scancode("F3", sc_F3),
    new key2scancode("F4", sc_F4),
    new key2scancode("F5", sc_F5),
    new key2scancode("F6", sc_F6),
    new key2scancode("F7", sc_F7),
    new key2scancode("F8", sc_F8),
    new key2scancode("F9", sc_F9),
    new key2scancode("F10", sc_F10),
    new key2scancode("F11", sc_F11),
    new key2scancode("F12", sc_F12),
    new key2scancode("Kpad*", sc_Kpad_Star),
    new key2scancode("Pause", sc_Pause),
    new key2scancode("ScrLck", sc_ScrollLock),
    new key2scancode("NumLck", sc_NumLock), // 6 chars Max please.
    new key2scancode("/", sc_Slash),
    new key2scancode(";", sc_SemiColon),
    new key2scancode("'", sc_Quote),
    new key2scancode("`", sc_Tilde),
    new key2scancode("\\", sc_BackSlash),
    new key2scancode("[", sc_OpenBracket),
    new key2scancode("]", sc_CloseBracket),
    new key2scancode("1", sc_1),
    new key2scancode("2", sc_2),
    new key2scancode("3", sc_3),
    new key2scancode("4", sc_4),
    new key2scancode("5", sc_5),
    new key2scancode("6", sc_6),
    new key2scancode("7", sc_7),
    new key2scancode("8", sc_8),
    new key2scancode("9", sc_9),
    new key2scancode("0", sc_0),
    new key2scancode("-", sc_Minus),
    new key2scancode("=", sc_Equals),
    new key2scancode("+", sc_Plus),
    new key2scancode("Kpad1", sc_kpad_1),
    new key2scancode("Kpad2", sc_kpad_2),
    new key2scancode("Kpad3", sc_kpad_3),
    new key2scancode("Kpad4", sc_kpad_4),
    new key2scancode("Kpad5", sc_kpad_5),
    new key2scancode("Kpad6", sc_kpad_6),
    new key2scancode("Kpad7", sc_kpad_7),
    new key2scancode("Kpad8", sc_kpad_8),
    new key2scancode("Kpad9", sc_kpad_9),
    new key2scancode("Kpad0", sc_kpad_0),
    new key2scancode("Kpad-", sc_kpad_Minus),
    new key2scancode("Kpad+", sc_kpad_Plus),
    new key2scancode("Kpad.", sc_kpad_Period),
    new key2scancode("A", sc_A),
    new key2scancode("B", sc_B),
    new key2scancode("C", sc_C),
    new key2scancode("D", sc_D),
    new key2scancode("E", sc_E),
    new key2scancode("F", sc_F),
    new key2scancode("G", sc_G),
    new key2scancode("H", sc_H),
    new key2scancode("I", sc_I),
    new key2scancode("J", sc_J),
    new key2scancode("K", sc_K),
    new key2scancode("L", sc_L),
    new key2scancode("M", sc_M),
    new key2scancode("N", sc_N),
    new key2scancode("O", sc_O),
    new key2scancode("P", sc_P),
    new key2scancode("Q", sc_Q),
    new key2scancode("R", sc_R),
    new key2scancode("S", sc_S),
    new key2scancode("T", sc_T),
    new key2scancode("U", sc_U),
    new key2scancode("V", sc_V),
    new key2scancode("W", sc_W),
    new key2scancode("X", sc_X),
    new key2scancode("Y", sc_Y),
    new key2scancode("Z", sc_Z),
    new key2scancode("Up", sc_UpArrow),
    new key2scancode("Down", sc_DownArrow),
    new key2scancode("Left", sc_LeftArrow),
    new key2scancode("Right", sc_RightArrow),
    new key2scancode("Insert", sc_Insert),
    new key2scancode("Delete", sc_Delete),
    new key2scancode("Home", sc_Home),
    new key2scancode("End", sc_End),
    new key2scancode("PgUp", sc_PgUp),
    new key2scancode("PgDn", sc_PgDn),
    new key2scancode("RAlt", sc_RightAlt),
    new key2scancode("RCtrl", sc_RightControl),
    new key2scancode("Kpad/", sc_kpad_Slash),
    new key2scancode("KpdEnt", sc_kpad_Enter),
    new key2scancode("PrtScn", sc_PrintScreen),
    new key2scancode(/*NULL*/null, 0)
];

function KB_ScanCodeToString(scancode) {
    var i;
    for (i = 0; keyname2scancode[i].name != null; i++) {
        if (keyname2scancode[i].code == scancode)
            return keyname2scancode[i].name;
    }

    return null;
}

function KB_StringToScanCode(string) {
    var name = null;
    var i = 0;
    name = keyname2scancode[i].name;
    for (; name; ++i, name = keyname2scancode[i].name) {
        if (name == string)
            break;
    }

    return keyname2scancode[i].code;
}


//297
KB.startup = function () {
    var i;
    for (i = 0; i < scancodeToASCII.length; i++) {
        scancodeToASCII[i] = 0xFF;
    }
    
    // !!! FIXME: incomplete?
    scancodeToASCII[sc_A] = 'a'.charCodeAt(0);
    scancodeToASCII[sc_B] = 'b'.charCodeAt(0);
    scancodeToASCII[sc_C] = 'c'.charCodeAt(0);
    scancodeToASCII[sc_D] = 'd'.charCodeAt(0);
    scancodeToASCII[sc_E] = 'e'.charCodeAt(0);
    scancodeToASCII[sc_F] = 'f'.charCodeAt(0);
    scancodeToASCII[sc_G] = 'g'.charCodeAt(0);
    scancodeToASCII[sc_H] = 'h'.charCodeAt(0);
    scancodeToASCII[sc_I] = 'i'.charCodeAt(0);
    scancodeToASCII[sc_J] = 'j'.charCodeAt(0);
    scancodeToASCII[sc_K] = 'k'.charCodeAt(0);
    scancodeToASCII[sc_L] = 'l'.charCodeAt(0);
    scancodeToASCII[sc_M] = 'm'.charCodeAt(0);
    scancodeToASCII[sc_N] = 'n'.charCodeAt(0);
    scancodeToASCII[sc_O] = 'o'.charCodeAt(0);
    scancodeToASCII[sc_P] = 'p'.charCodeAt(0);
    scancodeToASCII[sc_Q] = 'q'.charCodeAt(0);
    scancodeToASCII[sc_R] = 'r'.charCodeAt(0);
    scancodeToASCII[sc_S] = 's'.charCodeAt(0);
    scancodeToASCII[sc_T] = 't'.charCodeAt(0);
    scancodeToASCII[sc_U] = 'u'.charCodeAt(0);
    scancodeToASCII[sc_V] = 'v'.charCodeAt(0);
    scancodeToASCII[sc_W] = 'w'.charCodeAt(0);
    scancodeToASCII[sc_X] = 'x'.charCodeAt(0);
    scancodeToASCII[sc_Y] = 'y'.charCodeAt(0);
    scancodeToASCII[sc_Z] = 'z'.charCodeAt(0);
    scancodeToASCII[sc_0] = '0'.charCodeAt(0);
    scancodeToASCII[sc_1] = '1'.charCodeAt(0);
    scancodeToASCII[sc_2] = '2'.charCodeAt(0);
    scancodeToASCII[sc_3] = '3'.charCodeAt(0);
    scancodeToASCII[sc_4] = '4'.charCodeAt(0);
    scancodeToASCII[sc_5] = '5'.charCodeAt(0);
    scancodeToASCII[sc_6] = '6'.charCodeAt(0);
    scancodeToASCII[sc_7] = '7'.charCodeAt(0);
    scancodeToASCII[sc_8] = '8'.charCodeAt(0);
    scancodeToASCII[sc_9] = '9'.charCodeAt(0);
    scancodeToASCII[sc_Escape] = asc_Escape;
    scancodeToASCII[sc_Tab] = asc_Tab;
    scancodeToASCII[sc_Space] = asc_Space;
    scancodeToASCII[sc_Enter] = asc_Enter;
    scancodeToASCII[sc_BackSpace] = asc_BackSpace;
    scancodeToASCII[sc_Comma] = ','.charCodeAt(0);
    scancodeToASCII[sc_Period] = '.'.charCodeAt(0);
    scancodeToASCII[sc_Kpad_Star] = '*'.charCodeAt(0);
    scancodeToASCII[sc_Slash] = '/'.charCodeAt(0);
    scancodeToASCII[sc_SemiColon] = '.charCodeAt(0);'.charCodeAt(0);
    scancodeToASCII[sc_Quote] = '\''.charCodeAt(0);
    scancodeToASCII[sc_Tilde] = '`'.charCodeAt(0);
    scancodeToASCII[sc_BackSlash] = '\\'.charCodeAt(0);
    scancodeToASCII[sc_OpenBracket] = '['.charCodeAt(0);
    scancodeToASCII[sc_CloseBracket] = ']'.charCodeAt(0);
    scancodeToASCII[sc_Minus] = '-'.charCodeAt(0);
    scancodeToASCII[sc_Equals] = '='.charCodeAt(0);
    scancodeToASCII[sc_Plus] = '+'.charCodeAt(0);
    scancodeToASCII[sc_kpad_Minus] = '-'.charCodeAt(0);
    scancodeToASCII[sc_kpad_Period] = '.'.charCodeAt(0);
    scancodeToASCII[sc_kpad_Plus] = '+'.charCodeAt(0);

    // !!! FIXME: incomplete?
    for (i = 0; i < shiftedScancodeToASCII.length; i++) {
        shiftedScancodeToASCII[i] = 0xFF;
    }
    shiftedScancodeToASCII[sc_A] = 'A'.charCodeAt(0);
    shiftedScancodeToASCII[sc_B] = 'B'.charCodeAt(0);
    shiftedScancodeToASCII[sc_C] = 'C'.charCodeAt(0);
    shiftedScancodeToASCII[sc_D] = 'D'.charCodeAt(0);
    shiftedScancodeToASCII[sc_E] = 'E'.charCodeAt(0);
    shiftedScancodeToASCII[sc_F] = 'F'.charCodeAt(0);
    shiftedScancodeToASCII[sc_G] = 'G'.charCodeAt(0);
    shiftedScancodeToASCII[sc_H] = 'H'.charCodeAt(0);
    shiftedScancodeToASCII[sc_I] = 'I'.charCodeAt(0);
    shiftedScancodeToASCII[sc_J] = 'J'.charCodeAt(0);
    shiftedScancodeToASCII[sc_K] = 'K'.charCodeAt(0);
    shiftedScancodeToASCII[sc_L] = 'L'.charCodeAt(0);
    shiftedScancodeToASCII[sc_M] = 'M'.charCodeAt(0);
    shiftedScancodeToASCII[sc_N] = 'N'.charCodeAt(0);
    shiftedScancodeToASCII[sc_O] = 'O'.charCodeAt(0);
    shiftedScancodeToASCII[sc_P] = 'P'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Q] = 'Q'.charCodeAt(0);
    shiftedScancodeToASCII[sc_R] = 'R'.charCodeAt(0);
    shiftedScancodeToASCII[sc_S] = 'S'.charCodeAt(0);
    shiftedScancodeToASCII[sc_T] = 'T'.charCodeAt(0);
    shiftedScancodeToASCII[sc_U] = 'U'.charCodeAt(0);
    shiftedScancodeToASCII[sc_V] = 'V'.charCodeAt(0);
    shiftedScancodeToASCII[sc_W] = 'W'.charCodeAt(0);
    shiftedScancodeToASCII[sc_X] = 'X'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Y] = 'Y'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Z] = 'Z'.charCodeAt(0);
    shiftedScancodeToASCII[sc_0] = ')'.charCodeAt(0);
    shiftedScancodeToASCII[sc_1] = '!'.charCodeAt(0);
    shiftedScancodeToASCII[sc_2] = '@'.charCodeAt(0);
    shiftedScancodeToASCII[sc_3] = '#'.charCodeAt(0);
    shiftedScancodeToASCII[sc_4] = '$'.charCodeAt(0);
    shiftedScancodeToASCII[sc_5] = '%'.charCodeAt(0);
    shiftedScancodeToASCII[sc_6] = '^'.charCodeAt(0);
    shiftedScancodeToASCII[sc_7] = '&'.charCodeAt(0);
    shiftedScancodeToASCII[sc_8] = '*'.charCodeAt(0);
    shiftedScancodeToASCII[sc_9] = '('.charCodeAt(0);
    shiftedScancodeToASCII[sc_Comma] = '<'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Period] = '>'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Kpad_Star] = '*'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Slash] = '?'.charCodeAt(0);
    shiftedScancodeToASCII[sc_SemiColon] = ':'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Quote] = '\"'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Tilde] = '~'.charCodeAt(0);
    shiftedScancodeToASCII[sc_BackSlash] = '|'.charCodeAt(0);
    shiftedScancodeToASCII[sc_OpenBracket] = '{'.charCodeAt(0);
    shiftedScancodeToASCII[sc_CloseBracket] = '}'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Minus] = '_'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Equals] = '+'.charCodeAt(0);
    shiftedScancodeToASCII[sc_Plus] = '+'.charCodeAt(0);
    shiftedScancodeToASCII[sc_kpad_Minus] = '-'.charCodeAt(0);
    shiftedScancodeToASCII[sc_kpad_Period] = '.'.charCodeAt(0);
    shiftedScancodeToASCII[sc_kpad_Plus] = '+'.charCodeAt(0);

    for (i = 0; i < extscanToSC.length; i++) {
        extscanToSC[i] = 0;
    }

    /* map extended keys to their Duke3D equivalents */
    extscanToSC[0x1C] = sc_kpad_Enter;
    extscanToSC[0x1D] = sc_RightControl;
    extscanToSC[0x35] = sc_kpad_Slash;
    extscanToSC[0x37] = sc_PrintScreen;
    extscanToSC[0x38] = sc_RightAlt;
    extscanToSC[0x47] = sc_Home;
    extscanToSC[0x48] = sc_UpArrow;
    extscanToSC[0x49] = sc_PgUp;
    extscanToSC[0x4B] = sc_LeftArrow;
    extscanToSC[0x4D] = sc_RightArrow;
    extscanToSC[0x4F] = sc_End;
    extscanToSC[0x50] = sc_DownArrow;
    extscanToSC[0x51] = sc_PgDn;
    extscanToSC[0x52] = sc_Insert;
    extscanToSC[0x53] = sc_Delete;

    KB.clearKeysDown();
};

KB.keyWaiting = function () {
    _handle_events();
    return keyIsWaiting;
};

function KB_Getch() {
    //TODO: this needed??
    //while (!keyIsWaiting) {
    //    _idle(); /* pull the pud. */
    //}
    
    keyIsWaiting = false;
    if (KB_LastScan >= MAXKEYBOARDSCAN)
        return (0xFF);

    if (KB.keyDown[sc_LeftShift] || KB.keyDown[sc_RightShift])
        return shiftedScancodeToASCII[KB_LastScan];

    return scancodeToASCII[KB_LastScan];
}

KB.flushKeyboardQueue = function () {
    _handle_events();
    keyIsWaiting = false;
    for (var i = 0; i < KB.keyDown.length; i++) {
        KB.keyDown.length[i] = 0;
    }
    // FIX_00077: Menu goes directly to the "NEW GAME" sub-menu when starting new game (Turrican)
};
