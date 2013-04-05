﻿'use strict';

var KB = {};

var  sc_None         	=	0	;
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


// "Macros"
KB.keyPressed = function (scan) {
    // todo
};

KB.clearKeyDown = function (scan) {
    // todo
};

KB.startup = function () {
    // todo
};

KB.keyWaiting = function () {
    //return keyIsWaiting;
    return 0; // TODO (this is just for test)
};
KB.flushKeyboardQueue = function () {
    // todo
};

