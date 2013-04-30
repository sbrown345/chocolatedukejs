'use strict';

var probey = 0, lastprobey = 0, last_menu, globalskillsound = -1;
var sh, onbar, buttonstat = 0, deletespot;
var last_zero = 0, last_fifty = 0, last_threehundred = 0;
//var fileselect = 1, menunamecnt;
//var  menuname[256][17];

//133

function cmenu(cm) {
    current_menu = cm;

    if ((cm >= 1000 && cm <= 1010))
        return;

    if (cm == 0)
        probey = last_zero;
    else if (cm == 50)
        probey = last_fifty;
    else if (cm >= 300 && cm < 400)
        probey = last_threehundred;
    else if (cm == 110)
        probey = 1;
    else probey = 0;
    lastprobey = -1;
}

//182

function loadpheader(spot, vn, ln, psk, nump) {
    console.assert(vn instanceof Ref);
    console.assert(ln instanceof Ref);
    console.assert(psk instanceof Ref);
    console.assert(nump instanceof Ref);
    var fn = "game0.sav";
    var fil;
    var bv;

    fn[4] = spot + '0';

    if ((fil = TCkopen4load(fn, 0)) == -1) return (-1);

    tiles[MAXTILES - 3].lock = 255;

    bv = kdfread(4, 1, fil);
    if (bv != BYTEVERSION) {
        FTA(114, ps[myconnectindex], 1);
        kclose(fil);
        return 1;
    }

    nump.$ = kread32(1, fil);

    kdfread(tempbuf, 19, 1, fil);
    vn.$ = kread32(fil);
    ln.$ = kread32(fil);
    psk.$ = kread32(fil);

    if (!tiles[MAXTILES - 3].data)
        allocache(tiles[MAXTILES - 3].data, 160 * 100, tiles[MAXTILES - 3].lock);
    tiles[MAXTILES - 3].dim.width = 100;
    tiles[MAXTILES - 3].dim.height = 160;
    kdfread(tiles[MAXTILES - 3].data, 160, 100, fil);
    kclose(fil);
    return (0);
}


window.__defineGetter__("LMB", function () { return buttonstat & 1; });
window.__defineGetter__("RMB", function () { return buttonstat & 2; });

// FIX_00036: Mouse wheel can now be used in menu
window.__defineGetter__("WHEELUP", function () { return buttonstat & 8; });
window.__defineGetter__("WHEELDOWN", function () { return buttonstat & 16; });

var minfo = new ControlInfo();

//786

function probe( x, y, i, n)
{
	return( probeXduke(x, y, i, n, 65536) );
}

function probeXduke( x, y, i, n,  spriteSize)
{
    var centre;
	var mouseSens;

	var delay_counter_up = 0, delay_counter_down = 0, delay_up = 50, delay_down = 50;
	var mi = 0;

	// FIX_00075: Bad Sensitivity aint32_t Y axis when using mouse in menu (Thanks to Turrican)
	mouseSens = Control.getMouseSensitivity_Y();
	mouseSens = mouseSens ? mouseSens : 1;

    if( ((ControllerType == controltype.keyboardandmouse)||
		(ControllerType == controltype.joystickandmouse)) )
		//&& CONTROL_MousePresent )
    {
        minfo.clear();

        Control.getInput( minfo );
		//mouseY = CONTROL_GetMouseY();
		//mi = mouseY;
        mi += (minfo.dz / mouseSens)|0;
		mi += (minfo.dpitch / mouseSens)|0;
    }

    else minfo.dz = minfo.dyaw = 0;

    if( x == (320>>1) )
        centre = 320>>2;
    else centre = 0;

        if( KB.keyPressed( sc_UpArrow ) || KB.keyPressed( sc_PgUp ) || KB.keyPressed( sc_kpad_8 ) ||
            (mi < -1024) || WHEELUP)
        {
			// FIX_00060: Repeat key function was not working in the menu
			if(delay_counter_up==0 || (totalclock-delay_counter_up)>delay_up || (mi < -1024) || WHEELUP)
			{
				mi = 0;
				sound(KICK_HIT);

				probey--;
				if(probey < 0) probey = n-1;
				minfo.dz = 0;
				minfo.dpitch = 0;
				if (delay_counter_up && (totalclock-delay_counter_up)>delay_up)
					delay_up = 10;
				delay_counter_up = totalclock;
			}
        }
		else
		{
            KB.clearKeyDown( sc_UpArrow );
            KB.clearKeyDown( sc_kpad_8 );
            KB.clearKeyDown( sc_PgUp );
			delay_counter_up = 0;
			delay_up = 50;
		}

        if( KB.keyPressed( sc_DownArrow ) || KB.keyPressed( sc_PgDn ) || KB.keyPressed( sc_kpad_2 )
            || (mi > 1024) || WHEELDOWN )
        {
			if(delay_counter_down==0 || (totalclock-delay_counter_down)>delay_down || (mi > 1024) || WHEELDOWN)
			{
				mi = 0;
				sound(KICK_HIT);
				probey++;
				minfo.dz = 0;
				minfo.dpitch = 0;
				if (delay_counter_down && (totalclock-delay_counter_down)>delay_down)
					delay_down = 10;
				delay_counter_down = totalclock;
			}
        }
		else
		{
			KB.clearKeyDown( sc_DownArrow );
			KB.clearKeyDown( sc_kpad_2 );
			KB.clearKeyDown( sc_PgDn );
			delay_counter_down = 0;
			delay_down = 50;
		}

    if(probey >= n)
        probey = 0;

    if(centre)
    {
//        rotateSprite(((320>>1)+(centre)+54)<<16,(y+(probey*i)-4)<<16,65536L,0,SPINNINGNUKEICON+6-((6+(totalclock>>3))%7),sh,0,10,0,0,xdim-1,ydim-1);
//        rotateSprite(((320>>1)-(centre)-54)<<16,(y+(probey*i)-4)<<16,65536L,0,SPINNINGNUKEICON+((totalclock>>3)%7),sh,0,10,0,0,xdim-1,ydim-1);

        rotateSprite(((320>>1)+(centre>>1)+70)<<16,(y+(probey*i)-4)<<16,spriteSize,0,SPINNINGNUKEICON+6-((6+(totalclock>>3))%7),sh,0,10,0,0,xdim-1,ydim-1);
        rotateSprite(((320>>1)-(centre>>1)-70)<<16,(y+(probey*i)-4)<<16,spriteSize,0,SPINNINGNUKEICON+((totalclock>>3)%7),sh,0,10,0,0,xdim-1,ydim-1);
    }
    else
        rotateSprite((x-tiles[BIGFNTCURSOR].dim.width-4)<<16,(y+(probey*i)-4)<<16,spriteSize,0,SPINNINGNUKEICON+(((totalclock>>3))%7),sh,0,10,0,0,xdim-1,ydim-1);

    if( KB.keyPressed(sc_Space) || KB.keyPressed( sc_kpad_Enter ) || KB.keyPressed( sc_Enter ) || (LMB))// && !onbar) )
    {
        if(current_menu != 110)
            sound(PISTOL_BODYHIT);
        KB.clearKeyDown( sc_Enter );
        KB.clearKeyDown( sc_Space );
        KB.clearKeyDown( sc_kpad_Enter );
        return(probey);
    }
    else if( KB.keyPressed( sc_Escape ) || (RMB) )
    {
        onbar = 0;
        KB.clearKeyDown( sc_Escape );
        sound(EXITMENUSOUND);
        return(-1);
    }
    else
    {
        if(onbar == 0) return(-probey-2);
        if ( KB.keyPressed( sc_LeftArrow ) || KB.keyPressed( sc_kpad_4 ) || ((buttonstat&1) && minfo.dyaw < -128 ) )
            return(probey);
        else if ( KB.keyPressed( sc_RightArrow ) || KB.keyPressed( sc_kpad_6 ) || ((buttonstat&1) && minfo.dyaw > 128 ) )
            return(probey);
        else return(-probey-2);
    }
}


//915
function menutext(x, y, s, p, t) {
    var i, ac, centre;

    var letter, letterCh;
    y -= 12;

    i = centre = 0;

    if (x === (320 >> 1)) {
        for (i = 0; i < t.length; i++) {
            letter = t[i];
            letterCh = t.charCodeAt(i);
            if (letter === ' ') {
                centre += 5;
                continue;
            }
            ac = 0;
            if (letterCh >= '0'.charCodeAt(0) && letterCh <= '9'.charCodeAt(0)) {
                ac = letterCh - '0'.charCodeAt(0) + BIGALPHANUM - 10;
            } else if (letterCh >= 'a'.charCodeAt(0) && letterCh <= 'z'.charCodeAt(0)) {
                ac = (letter.toUpperCase().charCodeAt(0)) - 'A'.charCodeAt(0) + BIGALPHANUM;
            } else if (letterCh >= 'A'.charCodeAt(0) && letterCh <= 'Z'.charCodeAt(0)) {
                ac = letterCh - 'A'.charCodeAt(0) + BIGALPHANUM;
            } else {
                switch (letter) {
                    case '-':
                        ac = BIGALPHANUM - 11;
                        break;
                    case '.':
                        ac = BIGPERIOD;
                        break;
                    case '\'':
                        ac = BIGAPPOS;
                        break;
                    case ',':
                        ac = BIGCOMMA;
                        break;
                    case '!':
                        ac = BIGX;
                        break;
                    case '?':
                        ac = BIGQ;
                        break;
                    case ';':
                        ac = BIGSEMI;
                        break;
                    case ':':
                        ac = BIGSEMI;
                        break;
                    default:
                        centre += 5;
                        i++;
                        continue;
                }
            }

            centre += tiles[ac].dim.width - 1;
        }
    }

    if (centre) {
        x = (320 - centre - 10) >> 1;
    }

    for (i = 0; i < t.length; i++) {
        letter = t[i];
        letterCh = t.charCodeAt(i);
        if (letter === ' ') {
            x += 5;
            continue;
        }
        ac = 0;
        if (letterCh >= '0'.charCodeAt(0) && letterCh <= '9'.charCodeAt(0)) {
            ac = letterCh - '0'.charCodeAt(0) + BIGALPHANUM - 10;
        } else if (letterCh >= 'a'.charCodeAt(0) && letterCh <= 'z'.charCodeAt(0)) {
            ac = (letter.toUpperCase().charCodeAt(0)) - 'A'.charCodeAt(0) + BIGALPHANUM;
        } else if (letterCh >= 'A'.charCodeAt(0) && letterCh <= 'Z'.charCodeAt(0)) {
            ac = letterCh - 'A'.charCodeAt(0) + BIGALPHANUM;
        } else {
            switch (letter) {
                case '-':
                    ac = BIGALPHANUM - 11;
                    break;
                case '.':
                    ac = BIGPERIOD;
                    break;
                case ',':
                    ac = BIGCOMMA;
                    break;
                case '!':
                    ac = BIGX;
                    break;
                case '\'':
                    ac = BIGAPPOS;
                    break;
                case '?':
                    ac = BIGQ;
                    break;
                case ';':
                    ac = BIGSEMI;
                    break;
                case ':':
                    ac = BIGCOLIN;
                    break;
                default:
                    x += 5;
                    i++;
                    continue;
            }
        }
        rotateSprite(x << 16, y << 16, 65536, 0, ac, s, p, 10 + 16, 0, 0, xdim - 1, ydim - 1);

        x += tiles[ac].dim.width;
    }

    return x;
}



function bar( x, y,p, dainc,  damodify, s,  pa) {
    console.assert(p instanceof Ref);

    var xloc;
    var  rev;

    if(dainc < 0) { dainc = -dainc; rev = 1; }
    else rev = 0;
    y-=2;

    if(damodify)
    {
        if(rev == 0)
        {
            if( KB.keyPressed( sc_LeftArrow ) || KB.keyPressed( sc_kpad_4 ) || ((buttonstat&1) && minfo.dyaw < -256 ) ) // && onbar) )
            {
                KB.clearKeyDown( sc_LeftArrow );
                KB.clearKeyDown( sc_kpad_4 );

                p.$ -= dainc;
                if(p.$ < 0)
                    p.$ = 0;
                sound(KICK_HIT);
            }
            if( KB.keyPressed( sc_RightArrow ) || KB.keyPressed( sc_kpad_6 ) || ((buttonstat&1) && minfo.dyaw > 256 ) )//&& onbar) )
            {
                KB.clearKeyDown( sc_RightArrow );
                KB.clearKeyDown( sc_kpad_6 );

                p.$ += dainc;
                if(p.$ > 63)
                    p.$ = 63;
                sound(KICK_HIT);
            }
        }
        else
        {
            if( KB.keyPressed( sc_RightArrow ) || KB.keyPressed( sc_kpad_6 ) || ((buttonstat&1) && minfo.dyaw > 256 ))//&& onbar ))
            {
                KB.clearKeyDown( sc_RightArrow );
                KB.clearKeyDown( sc_kpad_6 );

                p.$ -= dainc;
                if(p.$ < 0)
                    p.$ = 0;
                sound(KICK_HIT);
            }
            if( KB.keyPressed( sc_LeftArrow ) || KB.keyPressed( sc_kpad_4 ) || ((buttonstat&1) && minfo.dyaw < -256 ))// && onbar) )
            {
                KB.clearKeyDown( sc_LeftArrow );
                KB.clearKeyDown( sc_kpad_4 );

                p.$ += dainc;
                if(p.$ > 64)
                    p.$ = 64;
                sound(KICK_HIT);
            }
        }
    }

    xloc = p.$;

    rotateSprite( (x+22)<<16,(y-3)<<16,65536,0,SLIDEBAR,s,pa,10,0,0,xdim-1,ydim-1);
    if(rev == 0)
        rotateSprite( (x+xloc+1)<<16,(y+1)<<16,65536,0,SLIDEBAR+1,s,pa,10,0,0,xdim-1,ydim-1);
    else
        rotateSprite( (x+(65-xloc) )<<16,(y+1)<<16,65536,0,SLIDEBAR+1,s,pa,10,0,0,xdim-1,ydim-1);
}

function SHX(X) { return 0; }
// ((x==X)*(-sh))
function PHX(X) { return 0; }
//// ((x==X)?1:2)
//#define MWIN(X) rotateSprite( 320<<15,200<<15,X,0,MENUSCREEN,-16,0,10+64,0,0,xdim-1,ydim-1)
//#define MWINXY(X,OX,OY) rotateSprite( ( 320+(OX) )<<15, ( 200+(OY) )<<15,X,0,MENUSCREEN,-16,0,10+64,0,0,xdim-1,ydim-1)



// 1208
var volnum, levnum, plrskl, numplr;
var lastsavedpos = -1;

function dispnames ()
{
    var x, c = 160;

    c += 64;
    for(x = 0;x <= 108;x += 12)
        rotateSprite((c+91-64)<<16,(x+56)<<16,65536,0,TEXTBOX,24,0,10,0,0,xdim-1,ydim-1);

    rotateSprite(22<<16,97<<16,65536,0,WINDOWBORDER2,24,0,10,0,0,xdim-1,ydim-1);
    rotateSprite(180<<16,97<<16,65536,1024,WINDOWBORDER2,24,0,10,0,0,xdim-1,ydim-1);
    rotateSprite(99<<16,50<<16,65536,512,WINDOWBORDER1,24,0,10,0,0,xdim-1,ydim-1);
    rotateSprite(103<<16,144<<16,65536,1024+512,WINDOWBORDER1,24,0,10,0,0,xdim-1,ydim-1);

    minitext(c,48,ud.savegame[0],2,10+16);
    minitext(c,48+12,ud.savegame[1],2,10+16);
    minitext(c,48+12+12,ud.savegame[2],2,10+16);
    minitext(c,48+12+12+12,ud.savegame[3],2,10+16);
    minitext(c,48+12+12+12+12,ud.savegame[4],2,10+16);
    minitext(c,48+12+12+12+12+12,ud.savegame[5],2,10+16);
    minitext(c,48+12+12+12+12+12+12,ud.savegame[6],2,10+16);
    minitext(c,48+12+12+12+12+12+12+12,ud.savegame[7],2,10+16);
    minitext(c,48+12+12+12+12+12+12+12+12,ud.savegame[8],2,10+16);
    minitext(c,48+12+12+12+12+12+12+12+12+12,ud.savegame[9],2,10+16);
}


//1424
function menus() {
    var c,x;
    var l;
    var i,j;

    var lastkeysetup = 0;
    var waiting4key = false;
    var current_resolution = 0;
    var text = "";
    
    getpackets();

    if(((ControllerType == controltype.keyboardandmouse)||
		(ControllerType == controltype.joystickandmouse)) 
        //&& CONTROL_MousePresent
		)
    {
		
        if(buttonstat != 0 && !onbar) // anti-repeat
        {
            x = Mouse.getButtons()<<3;
            if( x ) 
            {
                buttonstat = x<<3;
            }
            else 
            {
                buttonstat = 0;
            }
        }
        else
			
            buttonstat = Mouse.getButtons();
    }
    else buttonstat = 0;

    if( (ps[myconnectindex].gm&MODE_MENU) == 0 )
    {
        tiles[MAXTILES-3].lock = 1;
        return;
    }

    ps[myconnectindex].gm &= (0xff-MODE_TYPE);
    ps[myconnectindex].fta = 0;

    x = 0;

    sh = 4-(sintable[(totalclock<<4)&2047]>>11);

    if(!(current_menu >= 1000 && current_menu <= 2999 && current_menu >= 300 && current_menu <= 369))
        vscrn();

    // printf("Current menu=%d, game mode=%d, last menu =%d\n", current_menu, ps[myconnectindex].gm, last_menu);

    switch(current_menu)
    {
        //        case 25000:
        //            gametext(160,90,"SELECT A SAVE SPOT BEFORE",0,2+8+16);
        //            gametext(160,90+9,"YOU QUICK RESTORE.",0,2+8+16);

        //            x = probe(186,124,0,0);
        //            if(x >= -1)
        //            {
        //                if(ud.multimode < 2 && ud.recstat != 2)
        //                {
        //                    ready2send = 1;
        //                    totalclock = ototalclock;
        //                }
        //                ps[myconnectindex].gm &= ~MODE_MENU;
        //            }
        //            break;

        //        case 20000:
        //            x = probe(326,190,0,0);
        //            gametext(160,50-8,"YOU ARE PLAYING THE SHAREWARE",0,2+8+16);
        //            gametext(160,59-8,"VERSION OF DUKE NUKEM 3D.  WHILE",0,2+8+16);
        //            gametext(160,68-8,"THIS VERSION IS REALLY COOL, YOU",0,2+8+16);
        //            gametext(160,77-8,"ARE MISSING OVER 75% OF THE TOTAL",0,2+8+16);
        //            gametext(160,86-8,"GAME, ALONG WITH OTHER GREAT EXTRAS",0,2+8+16);
        //            gametext(160,95-8,"AND GAMES, WHICH YOU'LL GET WHEN",0,2+8+16);
        //            gametext(160,104-8,"YOU ORDER THE COMPLETE VERSION AND",0,2+8+16);
        //            gametext(160,113-8,"GET THE FINAL TWO EPISODES.",0,2+8+16);

        //            gametext(160,113+8,"PLEASE READ THE 'HOW TO ORDER' ITEM",0,2+8+16);
        //            gametext(160,122+8,"ON THE MAIN MENU IF YOU WISH TO",0,2+8+16);
        //            gametext(160,131+8,"UPGRADE TO THE FULL REGISTERED",0,2+8+16);
        //            gametext(160,140+8,"VERSION OF DUKE NUKEM 3D.",0,2+8+16);
        //            gametext(160,149+16,"PRESS ANY KEY...",0,2+8+16);

        //            if( x >= -1 ) cmenu(100);
        //            break;


        //        case 15001:
        //        case 15000:

        //            gametext(160,90,"LOAD last game:",0,2+8+16);

        //            sprintf(text,"\"%s\"",ud.savegame[lastsavedpos]);
        //            gametext(160,99,text,0,2+8+16);

        //            gametext(160,99+9,"(Y/N)",0,2+8+16);

        //            _handle_events();
        //            if( KB.keyPressed(sc_Escape) || KB.keyPressed(sc_N) || RMB)
        //            {
        //                if(sprite[ps[myconnectindex].i].extra <= 0)
        //                {
        //                    enterlevel(MODE_GAME);
        //                    return;
        //                }

        //                KB.clearKeyDown(sc_N);
        //                KB.clearKeyDown(sc_Escape);

        //                ps[myconnectindex].gm &= ~MODE_MENU;
        //                if(ud.multimode < 2 && ud.recstat != 2)
        //                {
        //                    ready2send = 1;
        //                    totalclock = ototalclock;
        //                }
        //            }

        //            if(  KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter) || KB.keyPressed(sc_Y) || LMB )
        //            {
        //                KB.flushKeyboardQueue();
        //                FX.stopAllSounds();

        //                if(ud.multimode > 1)
        //                {
        //                    loadplayer(-1-lastsavedpos);
        //                    ps[myconnectindex].gm = MODE_GAME;
        //                }
        //                else
        //                {
        //                    c = loadplayer(lastsavedpos);
        //                    if(c == 0)
        //                        ps[myconnectindex].gm = MODE_GAME;
        //                }
        //            }

        //            probe(186,124+9,0,0);

        //            break;

        //        case 10000:  // parental
        //        case 10001:

        //            c = (320>>1)-120;
        //            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
        //            menutext(320>>1,24,0,0,"ADULT MODE");

        //            x = probe(c+6,43,16,2);

        //            if(x == -1) 
        //            { 
        //                cmenu(702); 
        //                probey = 6;			
        //                break; 
        //            }

        //            menutext(c,43,SHX(-2),PHX(-2),"ADULT MODE");
        //            menutext(c+160+40,43,0,0,ud.lockout?"OFF":"ON");
			
        //            menutext(c,43+16,SHX(-3),PHX(-3),"ENTER PASSWORD");

        //            if(current_menu == 10001)
        //            {
        //                gametext(160,43+16+16+16-12,"ENTER PASSWORD",0,2+8+16);
        //                x = strget((320>>1),43+16+16+16,buf,19, 998);

        //                if(x == 1) // user hit enter key
        //                {
        //                    if(ud.pwlockout[0] == 0 || ud.lockout == 0 ) // if already unlocked then we set pwd or reset pwd is there is already one
        //                        strcpy(&ud.pwlockout[0],buf);
        //                    else if( strcmp(buf,&ud.pwlockout[0]) == 0 ) // if (pwd was up AND lockout is true (locked) AND pwd is good)
        //                    {
        //                        ud.lockout = 0;
        //                        buf[0] = 0;

        //                        for(x=0;x<numanimwalls;x++)
        //                            if( wall[animwall[x].wallnum].picnum != W_SCREENBREAK &&
        //                                wall[animwall[x].wallnum].picnum != W_SCREENBREAK+1 &&
        //                                wall[animwall[x].wallnum].picnum != W_SCREENBREAK+2 )
        //                                if( wall[animwall[x].wallnum].extra >= 0 )
        //                                    wall[animwall[x].wallnum].picnum = wall[animwall[x].wallnum].extra;

        //                    }
        //                    current_menu = 10000;
        //                    KB.clearKeyDown(sc_Enter);
        //                    KB.clearKeyDown(sc_kpad_Enter);
        //                    KB.flushKeyboardQueue();
        //                }
        //                else if(x==-1) // pressed esc while typing. We discard the text.
        //                {
        //                    *buf = 0; 
        //                    current_menu = 10000;
        //                    KB.clearKeyDown(sc_Escape);
        //                }
        //            }
        //            else
        //            {
        //                if(x == 0)
        //                {
        //                    if( ud.lockout == 1 )
        //                    {
        //                        if(ud.pwlockout[0] == 0)
        //                        {
        //                            ud.lockout = 0;
        //                            for(x=0;x<numanimwalls;x++)
        //                                if( wall[animwall[x].wallnum].picnum != W_SCREENBREAK &&
        //                                    wall[animwall[x].wallnum].picnum != W_SCREENBREAK+1 &&
        //                                    wall[animwall[x].wallnum].picnum != W_SCREENBREAK+2 )
        //                                    if( wall[animwall[x].wallnum].extra >= 0 )
        //                                        wall[animwall[x].wallnum].picnum = wall[animwall[x].wallnum].extra;
        //                        }
        //                        else
        //                        {
        //                            buf[0] = 0;
        //                            current_menu = 10001;
        //                            inputloc = 0;
        //                            KB.flushKeyboardQueue();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        ud.lockout = 1;

        //                        for(x=0;x<numanimwalls;x++)
        //                            switch(wall[animwall[x].wallnum].picnum)
        //                            {
        //                                case FEMPIC1:
        //                                    wall[animwall[x].wallnum].picnum = BLANKSCREEN;
        //                                    break;
        //                                case FEMPIC2:
        //                                case FEMPIC3:
        //                                    wall[animwall[x].wallnum].picnum = SCREENBREAK6;
        //                                    break;
        //                            }
        //                    }
        //                }

        //                else if(x == 1)
        //                {
        //                    current_menu = 10001; // ask for password change
        //                    inputloc = 0;
        //                    *buf = 0;
        //                    KB.flushKeyboardQueue();
        //                }
        //            }

        //            break;

        //        case 1000:
        //        case 1001:
        //        case 1002:
        //        case 1003:
        //        case 1004:
        //        case 1005:
        //        case 1006:
        //        case 1007:
        //        case 1008:
        //        case 1009:

        //            rotateSprite(160<<16,200<<15,65536,0,MENUSCREEN,16,0,10+64,0,0,xdim-1,ydim-1);
        //            rotateSprite(160<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
        //            menutext(160,24,0,0,"LOAD GAME");
        //            rotateSprite(101<<16,97<<16,65536,512,MAXTILES-3,-32,0,4+10+64,0,0,xdim-1,ydim-1);

        //            dispnames();

        //            sprintf((char*)tempbuf,"PLAYERS: %-2d                      ",numplr);
        //            gametext(160,158,(char*)tempbuf,0,2+8+16);

        //            sprintf((char*)tempbuf,"EPISODE: %-2d / LEVEL: %-2d / SKILL: %-2d",1+volnum,1+levnum,plrskl);
        //            gametext(160,170,(char*)tempbuf,0,2+8+16);

        //            gametext(160,90,"LOAD game:",0,2+8+16);
        //            sprintf((char*)tempbuf,"\"%s\"",ud.savegame[current_menu-1000]);
        //            gametext(160,99,(char*)tempbuf,0,2+8+16);
        //            gametext(160,99+9,"(Y/N)",0,2+8+16);

        //            _handle_events();
        //            if( KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter) || KB.keyPressed(sc_Y) || LMB )
        //            {
        //                lastsavedpos = current_menu-1000;

        //                KB.flushKeyboardQueue();
        //                //if(ud.multimode < 2 && ud.recstat != 2)
        //                //{
        //                //    ready2send = 1;
        //                //    totalclock = ototalclock;
        //                //}

        //                if(ud.multimode > 1)
        //                {
        //                    if( ps[myconnectindex].gm&MODE_GAME )
        //                    {
        //                        loadplayer(-1-lastsavedpos);
        //                        ps[myconnectindex].gm = MODE_GAME;
        //                    }
        //                    else
        //                    {
        //                        tempbuf[0] = 126;
        //                        tempbuf[1] = lastsavedpos;
        //                        for(x=connecthead;x>=0;x=connectpoint2[x])
        //                            if(x != myconnectindex)
        //                                sendpacket(x,(uint8_t*)tempbuf,2);

        //                        getpackets();

        //                        loadplayer(lastsavedpos);

        //                        multiflag = 0;
        //                    }
        //                }
        //                else
        //                {
        //                    // FIX_00084: Various bugs in the load game (single player) option if ESC is hit or if wrong version 

        //                    c = loadplayer(lastsavedpos);
        //                    if(c == 0)
        //                    {
        //                        ps[myconnectindex].gm = MODE_GAME;
        //                        if (ud.recstat != 2) // if not playing a demo then ..
        //                            totalclock = ototalclock;
        //                    }
        //                    else
        //                        cmenu(1010); // failed loading game
        //                }

        //                break;
        //            }

        //            if( KB.keyPressed(sc_N) || KB.keyPressed(sc_Escape) || RMB)
        //            {
        //                KB.clearKeyDown(sc_N);
        //                KB.clearKeyDown(sc_Escape);
        //                sound(EXITMENUSOUND);
        //                cmenu(300);
        //                // FIX_00084: Various bugs in the load game (single player) option if ESC is hit or if wrong version 
        //                // simply get back w/o changing anything.

        //            }

        //            break;

        //        case 1010: //loading a saved game failed

        //            gametext(160,99,"YOU CAN'T LOAD THIS GAME",0,2+8+16);
        //            gametext(160,99+9,"EITHER A WONG VERSION",0,2+8+16);
        //            gametext(160,99+9+9,"OR BAD # OF PLAYERS OR...",0,2+8+16);

        //            _handle_events();
        //            if( KB.keyPressed(sc_Space) || KB.keyPressed(sc_Escape) || KB.keyPressed(sc_Enter)
        //				|| RMB)            {
        //                KB.clearKeyDown(sc_Space);
        //                KB.clearKeyDown(sc_Escape);
        //                KB.clearKeyDown(sc_Enter);
        //                sound(EXITMENUSOUND);
        //                cmenu(300);
        //            }

        //            break;

        case 1500:
            _handle_events();
            if( KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter) || KB.keyPressed(sc_Y) || LMB )
            {
                KB.flushKeyboardQueue();
                cmenu(100);
            }
            if( KB.keyPressed(sc_N) || KB.keyPressed(sc_Escape) || RMB)
            {
                KB.clearKeyDown(sc_N);
                KB.clearKeyDown(sc_Escape);
                if(ud.multimode < 2 && ud.recstat != 2)
                {
                    ready2send = 1;
                    totalclock = ototalclock;
                }
                ps[myconnectindex].gm &= ~MODE_MENU;
                sound(EXITMENUSOUND);
                break;
            }
            probe(186,124,0,0);
            gametext(160,90,"ABORT this game?",0,2+8+16);
            gametext(160,90+9,"(Y/N)",0,2+8+16);

            break;

            //        case 2000:
            //        case 2001:
            //        case 2002:
            //        case 2003:
            //        case 2004:
            //        case 2005:
            //        case 2006:
            //        case 2007:
            //        case 2008:
            //        case 2009:

            //            rotateSprite(160<<16,200<<15,65536,0,MENUSCREEN,16,0,10+64,0,0,xdim-1,ydim-1);
            //            rotateSprite(160<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            //            menutext(160,24,0,0,"SAVE GAME");

            //            rotateSprite(101<<16,97<<16,65536,512,MAXTILES-3,-32,0,4+10+64,0,0,xdim-1,ydim-1);
            //            sprintf(text,"PLAYERS: %-2d                      ",ud.multimode);
            //            gametext(160,158,text,0,2+8+16);

            //            sprintf(text,"EPISODE: %-2d / LEVEL: %-2d / SKILL: %-2d",1+ud.volume_number,1+ud.level_number,ud.player_skill);
            //            gametext(160,170,text,0,2+8+16);

            //            dispnames();

            //            gametext(160,90,"OVERWRITE previous SAVED game?",0,2+8+16);
            //            gametext(160,90+9,"(Y/N)",0,2+8+16);

            //            _handle_events();
            //            if( KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter) || KB.keyPressed(sc_Y) || LMB )
            //            {
            //                KB.flushKeyboardQueue();
            //                inputloc = strlen(&ud.savegame[current_menu-2000][0]);

            //                cmenu(current_menu-2000+360);

            //                KB.flushKeyboardQueue();
            //                break;
            //            }
            //            if( KB.keyPressed(sc_N) || KB.keyPressed(sc_Escape) || RMB)
            //            {
            //                KB.clearKeyDown(sc_N);
            //                KB.clearKeyDown(sc_Escape);
            //                cmenu(351);
            //                sound(EXITMENUSOUND);
            //            }

            //            probe(186,124,0,0);

            //            break;

            //        case 990:  // credits
            //        case 991:
            //        case 992:
            //        case 993:
            //        case 994:
            //        case 995:
            //        case 996:
            //        case 997:
            //            c = 160;
            //            if (!PLUTOPAK) {
            //                //rotateSprite(c<<16,200<<15,65536,0,MENUSCREEN,16,0,10+64,0,0,xdim-1,ydim-1);
            //                rotateSprite(c<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            //                menutext(c,24,0,0,"CREDITS");

            //                l = 7;
            //            } else {
            //                l = 2;
            //            }

            //            if(KB.keyPressed(sc_Escape)) { cmenu(0); break; }

            //            if( KB.keyPressed( sc_LeftArrow ) ||
            //                KB.keyPressed( sc_kpad_4 ) ||
            //                KB.keyPressed( sc_UpArrow ) ||
            //                KB.keyPressed( sc_PgUp ) ||
            //                KB.keyPressed( sc_kpad_8 ) )
            //            {
            //                KB.clearKeyDown(sc_LeftArrow);
            //                KB.clearKeyDown(sc_kpad_4);
            //                KB.clearKeyDown(sc_UpArrow);
            //                KB.clearKeyDown(sc_PgUp);
            //                KB.clearKeyDown(sc_kpad_8);

            //                sound(KICK_HIT);
            //                current_menu--;
            //                if(current_menu < 990) current_menu = 990+l;
            //            }
            //            else if(
            //                KB.keyPressed( sc_PgDn ) ||
            //                KB.keyPressed( sc_Enter ) ||
            //                KB.keyPressed( sc_Space ) ||
            //                KB.keyPressed( sc_kpad_Enter ) ||
            //                KB.keyPressed( sc_RightArrow ) ||
            //                KB.keyPressed( sc_DownArrow ) ||
            //                KB.keyPressed( sc_kpad_2 ) ||
            //                KB.keyPressed( sc_kpad_9 ) ||
            //                KB.keyPressed( sc_kpad_6 ) )
            //            {
            //                KB.clearKeyDown(sc_PgDn);
            //                KB.clearKeyDown(sc_Enter);
            //                KB.clearKeyDown(sc_RightArrow);
            //                KB.clearKeyDown(sc_kpad_Enter);
            //                KB.clearKeyDown(sc_kpad_6);
            //                KB.clearKeyDown(sc_kpad_9);
            //                KB.clearKeyDown(sc_kpad_2);
            //                KB.clearKeyDown(sc_DownArrow);
            //                KB.clearKeyDown(sc_Space);
            //                sound(KICK_HIT);
            //                current_menu++;
            //                if(current_menu > 990+l) current_menu = 990;
            //            }

            //            if (!PLUTOPAK) { // This is Jonathon Fowler code. Text respects the true 1.3/1.3d --mk
            //                switch (current_menu) {
            //                    case 990:
            //                        gametext(c,40,                      "ORIGINAL CONCEPT",0,2+8+16);
            //                        gametext(c,40+9,                    "TODD REPLOGLE",0,2+8+16);
            //                        gametext(c,40+9+9,                  "ALLEN H. BLUM III",0,2+8+16);
						
            //                        gametext(c,40+9+9+9+9,              "PRODUCED & DIRECTED BY",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9,            "GREG MALONE",0,2+8+16);

            //                        gametext(c,40+9+9+9+9+9+9+9,        "EXECUTIVE PRODUCER",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9,      "GEORGE BROUSSARD",0,2+8+16);

            //                        gametext(c,40+9+9+9+9+9+9+9+9+9+9,  "BUILD ENGINE",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9+9+9+9,"KEN SILVERMAN",0,2+8+16);
            //                        break;
            //                    case 991:
            //                        gametext(c,40,                      "GAME PROGRAMMING",0,2+8+16);
            //                        gametext(c,40+9,                    "TODD REPLOGLE",0,2+8+16);
						
            //                        gametext(c,40+9+9+9,                "3D ENGINE/TOOLS/NET",0,2+8+16);
            //                        gametext(c,40+9+9+9+9,              "KEN SILVERMAN",0,2+8+16);

            //                        gametext(c,40+9+9+9+9+9+9,          "NETWORK LAYER/SETUP PROGRAM",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9,        "MARK DOCHTERMANN",0,2+8+16);
            //                        break;
            //                    case 992:
            //                        gametext(c,40,                      "MAP DESIGN",0,2+8+16);
            //                        gametext(c,40+9,                    "ALLEN H BLUM III",0,2+8+16);
            //                        gametext(c,40+9+9,                  "RICHARD GRAY",0,2+8+16);
						
            //                        gametext(c,40+9+9+9+9,              "3D MODELING",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9,            "CHUCK JONES",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9,          "SAPPHIRE CORPORATION",0,2+8+16);

            //                        gametext(c,40+9+9+9+9+9+9+9+9,      "ARTWORK",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9+9,    "DIRK JONES, STEPHEN HORNBACK",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9+9+9,  "JAMES STOREY, DAVID DEMARET",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9+9+9+9,"DOUGLAS R WOOD",0,2+8+16);
            //                        break;
            //                    case 993:
            //                        gametext(c,40,                      "SOUND ENGINE",0,2+8+16);
            //                        gametext(c,40+9,                    "JIM DOSE",0,2+8+16);
						
            //                        gametext(c,40+9+9+9,                "SOUND & MUSIC DEVELOPMENT",0,2+8+16);
            //                        gametext(c,40+9+9+9+9,              "ROBERT PRINCE",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9,            "LEE JACKSON",0,2+8+16);

            //                        gametext(c,40+9+9+9+9+9+9+9,        "VOICE TALENT",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9,      "LANI MINELLA - VOICE PRODUCER",0,2+8+16);
            //                        gametext(c,40+9+9+9+9+9+9+9+9+9,    "JON ST. JOHN AS \"DUKE NUKEM\"",0,2+8+16);
            //                        break;
            //                    case 994:
            //                        gametext(c,60,                      "GRAPHIC DESIGN",0,2+8+16);
            //                        gametext(c,60+9,                    "PACKAGING, MANUAL, ADS",0,2+8+16);
            //                        gametext(c,60+9+9,                  "ROBERT M. ATKINS",0,2+8+16);
            //                        gametext(c,60+9+9+9,                "MICHAEL HADWIN",0,2+8+16);
					
            //                        gametext(c,60+9+9+9+9+9,            "SPECIAL THANKS TO",0,2+8+16);
            //                        gametext(c,60+9+9+9+9+9+9,          "STEVEN BLACKBURN, TOM HALL",0,2+8+16);
            //                        gametext(c,60+9+9+9+9+9+9+9,        "SCOTT MILLER, JOE SIEGLER",0,2+8+16);
            //                        gametext(c,60+9+9+9+9+9+9+9+9,      "TERRY NAGY, COLLEEN COMPTON",0,2+8+16);
            //                        gametext(c,60+9+9+9+9+9+9+9+9+9,    "HASH INC., FORMGEN, INC.",0,2+8+16);
            //                        break;
            //                    case 995:
            //                        gametext(c,49,                      "THE 3D REALMS BETA TESTERS",0,2+8+16);

            //                        gametext(c,49+9+9,                  "NATHAN ANDERSON, WAYNE BENNER",0,2+8+16);
            //                        gametext(c,49+9+9+9,                "GLENN BRENSINGER, ROB BROWN",0,2+8+16);
            //                        gametext(c,49+9+9+9+9,              "ERIK HARRIS, KEN HECKBERT",0,2+8+16);
            //                        gametext(c,49+9+9+9+9+9,            "TERRY HERRIN, GREG HIVELY",0,2+8+16);
            //                        gametext(c,49+9+9+9+9+9+9,          "HANK LEUKART, ERIC BAKER",0,2+8+16);
            //                        gametext(c,49+9+9+9+9+9+9+9,        "JEFF RAUSCH, KELLY ROGERS",0,2+8+16);
            //                        gametext(c,49+9+9+9+9+9+9+9+9,      "MIKE DUNCAN, DOUG HOWELL",0,2+8+16);
            //                        gametext(c,49+9+9+9+9+9+9+9+9+9,    "BILL BLAIR",0,2+8+16);
            //                        break;
            //                    case 996:
            //                        gametext(c,32,                      "COMPANY PRODUCT SUPPORT",0,2+8+16);

            //                        gametext(c,32+9+9,                  "THE FOLLOWING COMPANIES WERE COOL",0,2+8+16);
            //                        gametext(c,32+9+9+9,                "ENOUGH TO GIVE US LOTS OF STUFF",0,2+8+16);
            //                        gametext(c,32+9+9+9+9,              "DURING THE MAKING OF DUKE NUKEM 3D.",0,2+8+16);

            //                        gametext(c,32+9+9+9+9+9+9,          "ALTEC LANSING MULTIMEDIA",0,2+8+16);
            //                        gametext(c,32+9+9+9+9+9+9+9,        "FOR TONS OF SPEAKERS AND THE",0,2+8+16);
            //                        gametext(c,32+9+9+9+9+9+9+9+9,      "THX-LICENSED SOUND SYSTEM",0,2+8+16);
            //                        gametext(c,32+9+9+9+9+9+9+9+9+9,    "FOR INFO CALL 1-800-548-0620",0,2+8+16);
					
            //                        gametext(c,32+9+9+9+9+9+9+9+9+9+9+9,"CREATIVE LABS, INC.",0,2+8+16);

            //                        gametext(c,32+9+9+9+9+9+9+9+9+9+9+9+9+9,"THANKS FOR THE HARDWARE, GUYS.",0,2+8+16);
            //                        break;
            //                    case 997:
            //                        gametext(c,50,                      "DUKE NUKEM IS A TRADEMARK OF",0,2+8+16);
            //                        gametext(c,50+9,                    "3D REALMS ENTERTAINMENT",0,2+8+16);
						
            //                        gametext(c,50+9+9+9,                "DUKE NUKEM",0,2+8+16);
            //                        gametext(c,50+9+9+9+9,              "(C) 1996 3D REALMS ENTERTAINMENT",0,2+8+16);

            //                        if (VOLUMEONE) {
            //                            gametext(c,106,                     "PLEASE READ LICENSE.DOC FOR SHAREWARE",0,2+8+16);
            //                            gametext(c,106+9,                   "DISTRIBUTION GRANTS AND RESTRICTIONS",0,2+8+16);
            //                        }

            //                        gametext(c,VOLUMEONE?134:115,       "MADE IN DALLAS, TEXAS USA",0,2+8+16);
            //                        break;
            //                }
            //            }

            //            switch(current_menu)
            //            {
            //                case 990:
            //                case 991:
            //                case 992:
            //                    rotateSprite(160<<16,200<<15,65536,0,2504+current_menu-990,0,0,10+64,0,0,xdim-1,ydim-1);

            //                    break;

            //            }
            //            break;

        case 0: // main menu
            c = (320>>1);
            rotateSprite(c<<16,28<<16,65536,0,INGAMEDUKETHREEDEE,0,0,10,0,0,xdim-1,ydim-1);
            rotateSprite((c+100)<<16,36<<16,65536,0,PLUTOPAKSPRITE+2,(sintable[(totalclock<<4)&2047]>>11),0,2+8,0,0,xdim-1,ydim-1);
            
            x = probe(c,67,16,6);

            if(x >= 0)
            {
                if( ud.multimode > 1 && x == 0 && ud.recstat != 2)
                {
                    if( movesperpacket == 4 && myconnectindex != connecthead )
                        break;

                    last_zero = 0;
                    cmenu( 600 );
                }
                else
                {
                    last_zero = x;
                    switch(x)
                    {
                        case 0:
                            cmenu(100);
                            break;
                        case 1: cmenu(200);break;
                        case 2:
                            if(movesperpacket == 4 && connecthead != myconnectindex)
                                break;
                            cmenu(300);
                            break;
                        case 3: KB.flushKeyboardQueue();cmenu(400);break;  // help
                        case 4: cmenu(990);break;  // credit
                        case 5: cmenu(501);break;  // quit

                    }
                }
            }

            if(KB.keyPressed(sc_Q)) cmenu(501);

            if(x == -1)
            {
                // FIX_00069: Hitting Esc at the menu screen shows an empty green screen
                if(ud.recstat == 2) // playing demo
                    ps[myconnectindex].gm &= ~MODE_MENU;
            }

            if(movesperpacket == 4)
            {
                if( myconnectindex == connecthead )
                    menutext(c,67,SHX(-2),PHX(-2),"NEW GAME");
                else
                    menutext(c,67,SHX(-2),1,"NEW GAME");
            }
            else
                menutext(c,67,SHX(-2),PHX(-2),"NEW GAME");

            menutext(c,67+16,SHX(-3),PHX(-3),"OPTIONS");

            if(movesperpacket == 4 && connecthead != myconnectindex)
                menutext(c,67+16+16,SHX(-4),1,"LOAD GAME");
            else menutext(c,67+16+16,SHX(-4),PHX(-4),"LOAD GAME");

            if(VOLUMEONE)
                menutext(c,67+16+16+16,SHX(-5),PHX(-5),"HOW TO ORDER");
            else
                menutext(c,67+16+16+16,SHX(-5),PHX(-5),"HELP");

            menutext(c,67+16+16+16+16,SHX(-6),PHX(-6),"CREDITS");

            menutext(c,67+16+16+16+16+16,SHX(-7),PHX(-7),"QUIT");

            break;
            // CTW END - MODIFICATION

        case 50: // general menu as cmenu(0) but for multiplayer games
            c = (320>>1);
            rotateSprite(c<<16,32<<16,65536,0,INGAMEDUKETHREEDEE,0,0,10,0,0,xdim-1,ydim-1);
            rotateSprite((c+100)<<16,36<<16,65536,0,PLUTOPAKSPRITE+2,(sintable[(totalclock<<4)&2047]>>11),0,2+8,0,0,xdim-1,ydim-1);
            x = probe(c,67,16,7);
            switch(x)
            {
                case 0:
                    if(movesperpacket == 4 && myconnectindex != connecthead)
                        break;
                    if(ud.multimode < 2 || ud.recstat == 2)
                        cmenu(1500);
                    else
                    {
                        cmenu(600);
                        last_fifty = 0;
                    }
                    break;
                case 1:
                    if(movesperpacket == 4 && connecthead != myconnectindex)
                        break;
                    if(ud.recstat != 2)
                    {
                        last_fifty = 1;
                        cmenu(350);
                        setview(0,0,xdim-1,ydim-1);
                    }
                    break;
                case 2:
                    if(movesperpacket == 4 && connecthead != myconnectindex)
                        break;
                    last_fifty = 2;
                    cmenu(300);
                    break;
                case 3:
                    last_fifty = 3;
                    cmenu(200);
                    break;
                case 4:
                    last_fifty = 4;
                    KB.flushKeyboardQueue();
                    cmenu(400);
                    break;
                case 5:
                    if(numplayers < 2)
                    {
                        last_fifty = 5;
                        cmenu(503);
                    }
                    break;
                case 6:
                    last_fifty = 6;
                    cmenu(502);
                    break;
                case -1:
                    ps[myconnectindex].gm &= ~MODE_MENU;
                    if(ud.multimode < 2 && ud.recstat != 2)
                    {
                        ready2send = 1;
                        totalclock = ototalclock;
                    }
                    break;
            }

            if( KB.keyPressed(sc_Q) )
                cmenu(502);

            if(movesperpacket == 4 && connecthead != myconnectindex)
            {
                menutext(c,67+16*0 ,SHX(-2),1,"NEW GAME");
                menutext(c,67+16*1 ,SHX(-3),1,"SAVE GAME");
                menutext(c,67+16*2 ,SHX(-4),1,"LOAD GAME");
            }
            else
            {
                menutext(c,67+16*0 ,SHX(-2),PHX(-2),"NEW GAME");
                menutext(c,67+16*1 ,SHX(-3),PHX(-3),"SAVE GAME");
                menutext(c,67+16*2 ,SHX(-4),PHX(-4),"LOAD GAME");
            }

            menutext(c,67+16*3 ,SHX(-5),PHX(-5),"OPTIONS");
            if(VOLUMEONE)
                menutext(c,67+16*4 ,SHX(-6),PHX(-6),"HOW TO ORDER");
            else
                menutext(c,67+16*4 ,SHX(-6),PHX(-6)," HELP");

            if(numplayers > 1)
                menutext(c,67+16*5 ,SHX(-7),1,"QUIT TO TITLE");
            else menutext(c,67+16*5 ,SHX(-7),PHX(-7),"QUIT TO TITLE");
            menutext(c,67+16*6,SHX(-8),PHX(-8),"QUIT GAME");

            break;

        case 100: // Title menu
            rotateSprite(160<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(160,24,0,0,"SELECT AN EPISODE");
            if(PLUTOPAK)
            {            //////if(boardfilename[0])
                //
                // uncomment this for user map
                //x = probe(160,60,20,5);
                x = probe(160,60,20,4);

                //////else x = probe(160,60,20,4);
            }
            else
            {
                if(boardfilename[0])
                    x = probe(160,60,20,4);
                else x = probe(160,60,20,3);
            }
            if(x >= 0)
            {

                if (VOLUMEONE)
                {
                    if(x > 0)
                        cmenu(20000);
                    else
                    {
                        ud.m_volume_number = x;
                        ud.m_level_number = 0;
                        cmenu(110);
                    }
                }

                else
                {

                    if((x == 3 && boardfilename[0])&&!PLUTOPAK)
                    {
                        ud.m_volume_number = 0;
                        ud.m_level_number = 7;
                    }
                    else

                        /*
                        if(x == 4 && boardfilename[0])
                        {
                            ud.m_volume_number = 0;
                            ud.m_level_number = 7;
                        }
                        */

                        // USER MAP
                        if((x == 4)&&PLUTOPAK)
                        {
                            //CONSOLE_Printf("MENU_USER_MAP");
                            //
                            //[Todo: generate file list starting from .\\maps]")

                            cmenu(MENU_USER_MAP); // cmenu(101)
                            break;
                        }
                        else
                        {
                            ud.m_volume_number = x;
                            ud.m_level_number = 0;
                        }
                    cmenu(110);
                }
            }
            else if(x == -1)
            {
                if(ps[myconnectindex].gm&MODE_GAME) cmenu(50);
                else cmenu(0);
            }

            menutext(160,60,SHX(-2),PHX(-2),volume_names[0]);

            c = 80;
            if (VOLUMEONE)
            {
                menutext(160,60+20,SHX(-3),1,volume_names[1]);
                menutext(160,60+20+20,SHX(-4),1,volume_names[2]);
                if(PLUTOPAK)
                    menutext(160,60+20+20,SHX(-5),1,volume_names[3]);
            }
            else
            {
                menutext(160,60+20,SHX(-3),PHX(-3),volume_names[1]);
                menutext(160,60+20+20,SHX(-4),PHX(-4),volume_names[2]);
                if(PLUTOPAK)
                {            
                    menutext(160,60+20+20+20,SHX(-5),PHX(-5),volume_names[3]);
                    //if(boardfilename[0])
                    //{

                    // uncomment this for usermap
                    //menutext(160,60+20+20+20+20,SHX(-6),PHX(-6),"USER MAP");
		           
                    //gametextpal(160,60+20+20+20+20+3,boardfilename,16+(sintable[(totalclock<<4)&2047]>>11),2);
                    //}
                }
                else
                {	/*
		            if(boardfilename[0])
				    {
						menutext(160,60+20+20+20,SHX(-6),PHX(-6),"USER MAP");
						gametext(160,60+20+20+20+6,boardfilename,2,2+8+16);
					}
					*/
                }
            }
            break;

            //        case 101: // MENU_USER_MAP
            //            c = (320>>1);
            //            rotateSprite(c<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            //            menutext(c,24,0,0,"USER MAP");

            //            // Draw USER MAP background
            //            {
            //                int y, x1;
            //                int32_t xPos, xPos2;
            //                int32_t yPos, yPos2;

            //                xPos =  ( xdim *32) / 320;
            //                yPos =  ( ydim *30) / 200;

            //                xPos2 =  ( xdim *282) / 320;
            //                yPos2 =  ( ydim *130) / 200;

            //                for(y=yPos; y < (ydim - (yPos*2)); y+=128)
            //                {
            //                    for(x1=xPos; x1 < xPos2; x1+=128)
            //                    {
            //                        rotateSprite(x1<<16,y<<16,65536,0,BIGHOLE,8,0,1+8+16+64+128,0,0, xdim - xPos, ydim - (yPos*2));
            //                    }
            //                }
            //            }	

            //            c = (320>>1)-120;
            //            x = probe(c,70,19,4);
				
            //            if(x == -1)
            //            {
            //                cmenu(MENU_SELECT_EPISODE);
            //            }
            //            break;

        case 110:
            c = (320>>1);
            rotateSprite(c<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(c,24,0,0,"SELECT SKILL");
            x = probe(c,70,19,4);
            if(x >= 0)
            {
                switch(x)
                {
                    case 0: globalskillsound = JIBBED_ACTOR6;break;
                    case 1: globalskillsound = BONUS_SPEECH1;break;
                    case 2: globalskillsound = DUKE_GETWEAPON2;break;
                    case 3: globalskillsound = JIBBED_ACTOR5;break;
                }

                sound(globalskillsound);

                ud.m_player_skill = x+1;
                if(x == 3) ud.m_respawn_monsters = 1;
                else ud.m_respawn_monsters = 0;

                ud.m_monsters_off = ud.monsters_off = 0;

                ud.m_respawn_items = 0;
                ud.m_respawn_inventory = 0;

                ud.multimode = 1;

                // if (ud.showcinematics) 
                //if(ud.m_volume_number == 3) // not needed to play cinematics. Black screen not nice
                //{
                //    flushperms();
                //    setview(0,0,xdim-1,ydim-1);
                //    clearview(0L);
                //    nextpage();
                //}
				
                newgame(ud.m_volume_number,ud.m_level_number,ud.m_player_skill);
                enterlevel(MODE_GAME);
            }
            else if(x == -1)
            {
                cmenu(100);
                KB.flushKeyboardQueue();
            }

            menutext(c,70,SHX(-2),PHX(-2),skill_names[0]);
            menutext(c,70+19,SHX(-3),PHX(-3),skill_names[1]);
            menutext(c,70+19+19,SHX(-4),PHX(-4),skill_names[2]);
            menutext(c,70+19+19+19,SHX(-5),PHX(-5),skill_names[3]);
            break;

        case 200:

            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"OPTIONS");

            c = (320>>1)-120;

            x = probe(c+6,43,16,6);

            if(x == -1)
            { if(ps[myconnectindex].gm&MODE_GAME) cmenu(50);else cmenu(0); }

            switch(x)
            {
                case 0:
                    cmenu(702); // game options
                    break;

                case 1:
                    cmenu(703); // keybaord setup
                    probey = 7;
                    break;

                case 2:
                    cmenu(701); // mouse setup
                    break;

                case 3:
                    cmenu(700);  // sound setup
                    break;

                case 4:  
                    cmenu(706); // Video setup
                    lastkeysetup = 0;
                    current_resolution = 0; // in case we don't find it
                    for(i=0; i<validmodecnt; i++)
                    {
                        if(validmodexdim[i] == xdim && validmodeydim[i] == ydim)
                            current_resolution = i;
                    }
                    break;

                case 5: // record on/off
                    if( (ps[myconnectindex].gm&MODE_GAME) )
                    {
                        closedemowrite();
                        break;
                    }
                    ud.m_recstat = !ud.m_recstat;
                    break;

                    //case -7:
                    //	gametext(320>>1,43+16*6,"*** DISABLED. WILL BE FIXED SOON***",0,2+8+16); // center-i
                    //	break;

            }

            menutext(c,43,SHX(-6),PHX(-6),"GAME OPTIONS");

            menutext(c,43+16,SHX(-6),PHX(-6),"SETUP KEYBOARD");

            menutext(c,43+16+16,SHX(-6),PHX(-6),"SETUP MOUSE");

            menutext(c,43+16+16+16,SHX(-8),PHX(-8),"SETUP SOUND");

            menutext(c,43+16+16+16+16,SHX(-8),PHX(-8),"SETUP VIDEO");

            if( (ps[myconnectindex].gm&MODE_GAME) && ud.m_recstat != 1 )
            {
                menutext(c,43+16+16+16+16+16,SHX(-10),1,"RECORD");
                menutext(c+160+40,43+16+16+16+16+16,SHX(-10),1,"OFF");
            }
            else
            {
                menutext(c,43+16+16+16+16+16,SHX(-10),PHX(-10),"RECORD");

                if(ud.m_recstat == 1)
                    menutext(c+160+40,43+16+16+16+16+16,SHX(-10),PHX(-10),"ON");
                else menutext(c+160+40,43+16+16+16+16+16,SHX(-10),PHX(-10),"OFF");
            }

            break;

        case 700:

            c = (320>>1)-120;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"SETUP SOUNDS");
            onbar = ((probey == 2)&&SoundToggle) || ((probey == 3)&&MusicToggle) ;

            x = probe(c+6,43,16,8);

            switch(x)
            {
                case -1:
                    cmenu(200);
                    probey = 3;
                    break;

                case 0:
                    if (FXDevice != NumSoundCards)
                    {
                        SoundToggle = 1-SoundToggle;
                        if( SoundToggle == 0 )
                        {
                            FX.stopAllSounds();
                            clearsoundlocks();
                        }
                    }
                    break;

                case 1:

                    if(eightytwofifty == 0 || numplayers < 2)
                        if(MusicDevice != NumSoundCards)
                        {
                            MusicToggle = 1-MusicToggle;
                            if( MusicToggle == 0 ) 
                                MUSIC_StopSong();
                            else
                            {
                                if(ud.recstat != 2 && ps[myconnectindex].gm&MODE_GAME)
                                    playmusic(music_fn[0][music_select]);
                                else playmusic(env_music_fn[0][0]);

                                MUSIC_Continue();
                            }
                        }
                    break;

                case 4:
                    if(SoundToggle && (FXDevice != NumSoundCards)) VoiceToggle = 1-VoiceToggle;
                    break;

                case 5:
                    if(SoundToggle && (FXDevice != NumSoundCards)) AmbienceToggle = 1-AmbienceToggle;
                    break;

                case 6:
                    if(SoundToggle && (FXDevice != NumSoundCards))
                    {
                        ReverseStereo = 1-ReverseStereo;
                        FX_SetReverseStereo(ReverseStereo);
                    }
                    break;

                case 7: // xduke: 1.3d sound style - hear opponent
                    if(SoundToggle && (FXDevice != NumSoundCards))
                    {
                        OpponentSoundToggle = 1-OpponentSoundToggle;
                    }
                    break;

                default:
                    break;
            }

            if(SoundToggle && FXDevice != NumSoundCards) menutext(c+160+40,43,0,(FXDevice == NumSoundCards),"ON");
            else menutext(c+160+40,43,0,(FXDevice == NumSoundCards),"OFF");

            if(MusicToggle && (MusicDevice != NumSoundCards) && (!eightytwofifty||numplayers<2))
                menutext(c+160+40,43+16,0,(MusicDevice == NumSoundCards),"ON");
            else menutext(c+160+40,43+16,0,(MusicDevice == NumSoundCards),"OFF");

            menutext(c,43,SHX(-2),(FXDevice == NumSoundCards),"SOUND");
            menutext(c,43+16+16,SHX(-4),(FXDevice==NumSoundCards)||SoundToggle==0,"SOUND VOLUME");
            {
                throw "todo"; //l = FXVolume;
                //FXVolume >>= 2;
                //bar(c+167+40,43+16+16,(short *)&FXVolume,4,(FXDevice!=NumSoundCards)&&x==2,SHX(-4),SoundToggle==0||(FXDevice==NumSoundCards));
                //if(l != FXVolume)
                //    FXVolume <<= 2;
                //if(l != FXVolume)
                //    FX_SetVolume( (short) FXVolume );
            }
            menutext(c,43+16,SHX(-3),(MusicDevice==NumSoundCards),"MUSIC");
            menutext(c,43+16+16+16,SHX(-5),(MusicDevice==NumSoundCards)||(numplayers > 1 && eightytwofifty)||MusicToggle==0,"MUSIC VOLUME");
            {
                throw "todo"; //l = MusicVolume;
                //MusicVolume >>= 2;
                //bar(c+167+40,43+16+16+16,
                //    (short *)&MusicVolume,4,
                //    (eightytwofifty==0||numplayers < 2) && (MusicDevice!=NumSoundCards) && x==3,SHX(-5),
                //    (numplayers > 1 && eightytwofifty)||MusicToggle==0||(MusicDevice==NumSoundCards));
                //MusicVolume <<= 2;
                //if(l != MusicVolume)
                //{
                //    STUBBED("Check this");
                //    // !!! FIXME: Used to be Music_ not MUSIC_.  --ryan.
                //    MUSIC_SetVolume( (short) MusicVolume );
                //}
            }
            menutext(c,43+16+16+16+16,SHX(-6),(FXDevice==NumSoundCards)||SoundToggle==0,"DUKE TALK");
            menutext(c,43+16+16+16+16+16,SHX(-7),(FXDevice==NumSoundCards)||SoundToggle==0,"AMBIENCE");

            menutext(c,43+16+16+16+16+16+16,SHX(-8),(FXDevice==NumSoundCards)||SoundToggle==0,"FLIP STEREO");

            if(VoiceToggle) menutext(c+160+40,43+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"ON");
            else menutext(c+160+40,43+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"OFF");

            if(AmbienceToggle) menutext(c+160+40,43+16+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"ON");
            else menutext(c+160+40,43+16+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"OFF");

            if(ReverseStereo) menutext(c+160+40,43+16+16+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"ON");
            else menutext(c+160+40,43+16+16+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"OFF");

            menutext(c,43+16+16+16+16+16+16+16,SHX(-9),(FXDevice==NumSoundCards)||SoundToggle==0,"OPPONENT SOUND");
            if(OpponentSoundToggle) menutext(c+160+40,43+16+16+16+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"ON");
            else menutext(c+160+40,43+16+16+16+16+16+16+16,0,(FXDevice==NumSoundCards)||SoundToggle==0,"OFF");

            break;

        case 701:
            c = (320>>1)-120;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"SETUP MOUSE");
            onbar = ( probey == 0 || probey == 1);

            x = probe(c+6,43,16,8);
            switch(x)
            {
                case -7:
                    gametext(320>>1,43+16*7+3,"*** SHORTCUT: ALT-M ***",0,2+8+16); // center-i
                    break;

                case -1:
                    cmenu(200);
                    probey = 2;
                    break;

                case 0:
                case 1:
                    break;
                case 2:

                    if ( ((ControllerType == controltype.keyboardandmouse)||
						(ControllerType == controltype.joystickandmouse)) )
                    {
                        MouseAiming = !MouseAiming;
                        if(MouseAiming)
                            myaimmode = 0;

                    }
                    break;

                case 3:

                    if ( ((ControllerType == controltype.keyboardandmouse)||
						(ControllerType == controltype.joystickandmouse)) )
                    {
                        if(!MouseAiming) // means we are in toggle mode
                            myaimmode = !myaimmode;
                    }
                    break;

                case 4:

                    if ( ((ControllerType == controltype.keyboardandmouse)||
						(ControllerType == controltype.joystickandmouse)) )
                    {
                        ud.mouseflip = 1-ud.mouseflip;
                    }
                    break;

                case 5:

                    if (SDL_WM_GrabInput(SDL_GRAB_QUERY)==SDL_GRAB_ON) 
                    {
                        SDL_WM_GrabInput(SDL_GRAB_OFF);
                        SDL_ShowCursor(1);
                    }
                    else
                    {
                        SDL_WM_GrabInput(SDL_GRAB_ON);
                        SDL_ShowCursor(0);
                    }
                    break;

                case 6:
                    cmenu(704); // Button setup
                    break;

                case 7:
                    cmenu(705); // Digital axes setup
                    break;

                default:
                    break;
            }

            {            
                throw "todo"; //var sense;

                //sense = CONTROL_GetMouseSensitivity_X();
                //menutext(c,43+16*0,SHX(-7),PHX(-7),"X SENSITIVITY");
                //bar(c+167+40,43+16*0,&sense,1,x==0,SHX(-7),PHX(-7));
                //CONTROL_SetMouseSensitivity_X( sense );

                //sense = CONTROL_GetMouseSensitivity_Y();
                //menutext(c,43+16*1,SHX(-7),PHX(-7),"Y SENSITIVITY");
                //bar(c+167+40,43+16*1,&sense,1,x==1,SHX(-7),PHX(-7));
                //CONTROL_SetMouseSensitivity_Y( sense );

                //menutext(c,43+16*2,SHX(-7),PHX(-7),"MOUSE AIM TYPE");
                //if(MouseAiming) menutext(c+160+40,43+16*2,SHX(-7),PHX(-7),"HELD");
                //else menutext(c+160+40,43+16*2,SHX(-7),PHX(-7),"TOGGLE");

                //menutext(c,43+16*3,SHX(-7),MouseAiming,"MOUSE AIMING");
                //if(myaimmode) menutext(c+160+40,43+16*3,SHX(-7),MouseAiming,"ON");
                //else menutext(c+160+40,43+16*3,SHX(-7),MouseAiming,"OFF");

                //menutext(c,43+16*4,SHX(-7),PHX(-7),"MOUSE AIMING FLIP");
                //if(ud.mouseflip) menutext(c+160+40,43+16*4,SHX(-7),PHX(-7),"ON");
                //else menutext(c+160+40,43+16*4,SHX(-7),PHX(-7),"OFF");


                //menutext(c,43+16*5,SHX(-7),PHX(-7),"MOUSE CURSOR");
                //if(SDL_WM_GrabInput(SDL_GRAB_QUERY)==SDL_GRAB_ON)
                //    menutext(c+160+40,43+16*5,SHX(-7),PHX(-7),"TAKEN");
                //else
                //    menutext(c+160+40,43+16*5,SHX(-7),PHX(-7),"FREE'D");

                //menutext(c,43+16*6,SHX(-7),PHX(-7),"BUTTON SETUP...");
		
                //menutext(c,43+16*7,SHX(-7),PHX(-7),"DIGITAL AXES SETUP...");	
            }

            break;

        case 702:
            c = (320>>1)-120;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"GAME OPTIONS");

            onbar = 0;

            x = probe(c+6,43,16,7);

            switch(x)
            {

                case -1:
                    cmenu(200); 
                    break;

                case 0:
                    ud.shadows = 1-ud.shadows;
                    break;
                case 1:
                    ud.screen_tilting = 1-ud.screen_tilting;
                    break;
                case 2:
                    ud.showcinematics = !ud.showcinematics;
                    break;
                case 3:
                    ud.hideweapon = !ud.hideweapon;
                    vscrn(); // FIX_00056: Refresh issue w/FPS, small Weapon and custom FTA, when screen resized down
                    break;
                case 4:
                    ud.weaponautoswitch = !ud.weaponautoswitch;
                    break;
                case 5:
                    // FIX_00045: Autoaim mode can now be toggled on/off from menu
                    if( nHostForceDisableAutoaim == 0)
                    {
                        ud.auto_aim++;
                        ud.auto_aim = ((ud.auto_aim-1)%2)+1; // 2 = normal = full; 1 = bullet only
                    }					
                    break;
                case 6: // parental
                    if (AUSTRALIA)
                        cmenu(10000); 
                    break;

            }


            menutext(c,43+16*0,SHX(-3),PHX(-3),"SHADOWS");
            if(ud.shadows) menutext(c+160+40,43+16*0,0,0,"ON");
            else menutext(c+160+40,43+16*0,0,0,"OFF");

            menutext(c,43+16*1,SHX(-4),PHX(-4),"SCREEN TILTING");
            switch(ud.screen_tilting)
            {
                case 0: menutext(c+160+40,43+16*1,0,0,"OFF");break;
                case 1: menutext(c+160+40,43+16*1,0,0,"ON");break;
                case 2: menutext(c+160+40,43+16*1,0,0,"FULL");break;
            }

            menutext(c,43+16*2,SHX(-3),PHX(-3),"CINEMATICS");
            if(ud.showcinematics) menutext(c+160+40,43+16*2,0,0,"ON");
            else menutext(c+160+40,43+16*2,0,0,"OFF");

            menutext(c,43+16*3,SHX(-3),PHX(-3),"WEAPON MODEL");
            if(ud.hideweapon) menutext(c+160+40,43+16*3,0,0,"OFF");
            else menutext(c+160+40,43+16*3,0,0,"ON");

            menutext(c,43+16*4,SHX(-3),PHX(-3),"WEAPON SWITCH");
            if(ud.weaponautoswitch) menutext(c+160+40,43+16*4,0,0,"OFF");
            else menutext(c+160+40,43+16*4,0,0,"ON");

            switch(ud.auto_aim)
            {
                case 0: menutext(c,43+16*5,0,nHostForceDisableAutoaim,"AUTOAIM DISABLED BY HOST"); 
                    break;
                case 1: menutext(c,43+16*5,0,0,"AUTOAIM BULLET ONLY");
                    break;
                case 2: menutext(c,43+16*5,0,0,"AUTOAIM REGULAR FULL");
                    break;
            }

            if (AUSTRALIA) {
                menutext(c, 43 + 16 * 6, SHX(-9), PHX(-9), "PARENTAL LOCK");
            } else {
                menutext(c, 43 + 16 * 6, SHX(-9), 1, "PARENTAL LOCK");
            }


            break;

        case 703:

            // black translucent background underneath lists
            rotateSprite(0<<16, 0<<16, 65536<<5, 0, BLANK, 8, 0, 1+2+8+16+64,
			    scale(0,xdim,320),scale(0,ydim,200),
			    scale(320-0,xdim,320)-1,scale(200-34,ydim,200)-1);

            c = (320>>1)-120-25;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"SETUP KEYBOARD");

            onbar = 0;
            x = probeXduke(c+210+lastkeysetup*62,46+16+16+16,0,NUMGAMEFUNCTIONS,20000);
            if(waiting4key)
            {
                probey = waiting4key-1; // force it to stay at the same location
                x=-(waiting4key-1)-2;
            }

            if (( KB.keyPressed( sc_RightArrow ) || KB.keyPressed( sc_LeftArrow ) ||
				 KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_kpad_6 )) &&
				!waiting4key) // set left or right column flag
            {
                lastkeysetup = !lastkeysetup;
                KB.clearKeyDown( sc_RightArrow ); KB.clearKeyDown( sc_LeftArrow );
                KB.clearKeyDown( sc_kpad_4 ); KB.clearKeyDown( sc_kpad_6 );
                sound(KICK_HIT);
            }

            if (KB.keyPressed(sc_Delete) && -2>=x && x>=(-NUMGAMEFUNCTIONS-1) && !waiting4key) // clear a key
            {
                if(lastkeysetup)
                    CONTROL_MapKey(-x-2, KeyMapping[-x-2].key1, 0);
                else
                    CONTROL_MapKey(-x-2, 0, KeyMapping[-x-2].key2);

                KB.clearKeyDown( sc_Delete ); // Avoid repeating delete
                sound(EXITMENUSOUND);
            }

            if ( (0<=x && x<NUMGAMEFUNCTIONS) || waiting4key) // set a key
            {
                if(!waiting4key)
                { 
                    waiting4key = x+1; // so it's always true
                    KB_ClearLastScanCode(); // clear the enter hit that was just hit
                }

                if(KB_GetLastScanCode())
                {
                    if(KB_GetLastScanCode() != sc_Escape)  // ESC is reserved for menu. Using it for controls could discard it completely, eg: AutoRun = "Escape"
                    {
                        if(lastkeysetup)		
                            CONTROL_MapKey(waiting4key-1, KeyMapping[waiting4key-1].key1, KB_GetLastScanCode());
                        else
                            CONTROL_MapKey(waiting4key-1, KB_GetLastScanCode(), KeyMapping[waiting4key-1].key2);

                        sound(KICK_HIT);
                    }

                    KB_ClearLastScanCode();
                    KB.flushKeyboardQueue();
                    KB.clearKeysDown();
                    waiting4key = false;
                }					
            }

            if(!waiting4key) 
                switch(x)
                {
                    case -1:
                        cmenu(200);
                        probey = 1; // back to setup keyboard
                        break;
                }

            // display and scroll the whole keyboard list
            j = 7; // -j .. 0 .. j lines => 2*j+1 lines
            if(-2>=x && x>=(-NUMGAMEFUNCTIONS-1)) // -2 to -54 (53 values . 0.52)
            {
                for(i=-j; i<=+j; i++)
                    if(NUMGAMEFUNCTIONS > (-x-2+i) && (-x-2+i) >= 0)
                    {
                        gametext(c-10,47-16+8*(i+j),gamefunctions[-x-2+i],i?0:0,2+8+16); // disp name
                        if (i ||  lastkeysetup || !waiting4key || (totalclock%128 < 64)) // blink 1st key
                            gametext(c+185,47-16+8*(i+j),KB_ScanCodeToString( KeyMapping[-x-2+i].key1 )?KB_ScanCodeToString( KeyMapping[-x-2+i].key1 ):"...",i?0:0,2+8+16); // center-i
                        if (i || !lastkeysetup || !waiting4key || (totalclock%128 < 64)) // blink 2nd key
                            gametext(c+247,47-16+8*(i+j),KB_ScanCodeToString( KeyMapping[-x-2+i].key2 )?KB_ScanCodeToString( KeyMapping[-x-2+i].key2 ):"...",i?0:0,2+8+16); // center-i
                    }
            }

            if(waiting4key)
                gametext(320>>1,47-16+8*(2*j+2)-4,"*** HIT A NEW KEY ***",0,2+8+16); // center-i
            else
                gametext(320>>1,47-16+8*(2*j+2)-4,"*** HIT ENTER OR DEL KEY ***",0,2+8+16); // center-i

            break;

        case 704: // mouse button setup, frm menu 701
            c = (320>>1)-120-25;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"SETUP MOUSE");

            // black translucent background underneath lists
            rotateSprite(0<<16, 0<<16, 65536<<5, 0, BLANK, 8, 0, 1+2+8+16+64,
			    scale(0,xdim,320),scale(40,ydim,200),
			    scale(320-0,xdim,320)-1,scale(200-75,ydim,200)-1);

            onbar = 0;
            x = probeXduke(c+146,46+8,8,MAXMOUSEBUTTONS,20000);
            lastkeysetup = 0;
			
            if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) || KB.keyPressed (sc_BackSpace) )
            {
                lastkeysetup = 1; // reversed;
                KB.clearKeyDown( sc_kpad_4 );
                KB.clearKeyDown( sc_LeftArrow );
                KB.clearKeyDown(sc_BackSpace);
                sound(KICK_HIT);
                x = -x-2;
            }
            else if ( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
            {
                KB.clearKeyDown( sc_kpad_6 );
                KB.clearKeyDown( sc_RightArrow );
                sound(KICK_HIT);
                x = -x-2;
            }

            if (KB.keyPressed(sc_Delete) && -2>=x && x>=(-MAXMOUSEBUTTONS-1)) // clear a key
            {
                MouseMapping[-x-2] = -1;
                KB.clearKeyDown( sc_Delete ); // Avoid repeating delete
                sound(EXITMENUSOUND);
            }

            if (0<=x && x<MAXMOUSEBUTTONS) // set a function
            {	
                if (lastkeysetup) // going up
                {
                    MouseMapping[x]--;
                    if(MouseMapping[x]==-2)
                        MouseMapping[x] = NUMGAMEFUNCTIONS-1;

                }
                else
                {
                    MouseMapping[x]++;
                    if(MouseMapping[x]==NUMGAMEFUNCTIONS)
                        MouseMapping[x] = -1; // Discard
                }
            }

            switch(x)
            {
                case -1:
                    cmenu(701);
                    probey = 6; // back to the general mouse setup menu
                    break;
            }

            // display the button list
            for(i=0; i<MAXMOUSEBUTTONS; i++)
            {
                sprintf(text, "#%d",i);
                switch(i)
                {
                    case 0:
                        strcat(text, " Left");
                        break;
                    case 1:
                        strcat(text, " Right");
                        break;
                    case 2:
                        strcat(text, " Middle");
                        break;
                    case 3:
                        strcat(text, " Wheel up");
                        break;
                    case 4:
                        strcat(text, " Wheel down");
                        break;
                    default:
                        strcat(text, " (Extra)");
                        break;
                }
				
                gametext(c,47+i*8,text,0,2+8+16);
                gametext(c+121,47+i*8,(MouseMapping[i]!=-1)?CONFIG_FunctionNumToName(MouseMapping[i]):"...",0,2+8+16);
            }

            gametext(320>>1,47+(MAXMOUSEBUTTONS+1)*8,"*** USE ARROWS OR DEL KEY ***",0,2+8+16);

            break;

        case 705: // digital axes setup, from menu 701
            c = (320>>1)-120-25;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"DIGITAL AXES");

            // black translucent background underneath lists
            rotateSprite(0<<16, 0<<16, 65536<<5, 0, BLANK, 8, 0, 1+2+8+16+64,
			    scale(0,xdim,320),scale(40,ydim,200),
			    scale(320-0,xdim,320)-1,scale(200-100,ydim,200)-1);

            onbar = 0;
            x = probeXduke(c+146,46+8,8,MAXMOUSEAXES*2,20000);
            lastkeysetup = 0;
			
            if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) || KB.keyPressed (sc_BackSpace) )
            {
                lastkeysetup = 1; // reversed;
                KB.clearKeyDown( sc_kpad_4 );
                KB.clearKeyDown( sc_LeftArrow );
                KB.clearKeyDown(sc_BackSpace);
                sound(KICK_HIT);
                x = -x-2;
            }
            else if ( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
            {
                KB.clearKeyDown( sc_kpad_6 );
                KB.clearKeyDown( sc_RightArrow );
                sound(KICK_HIT);
                x = -x-2;
            }

            if (KB.keyPressed(sc_Delete) && -2>=x && x>=(-(MAXMOUSEAXES*2)-1)) // clear a key
            {
                MouseDigitalAxeMapping[(-x-2)>>1][(-x-2)&1] = -1;
                KB.clearKeyDown( sc_Delete ); // Avoid repeating delete
                sound(EXITMENUSOUND);
            }

            if (0<=x && x<(MAXMOUSEAXES*2)) // set a function
            {	
                if (lastkeysetup) // going up
                {
                    MouseDigitalAxeMapping[x>>1][x&1]--;
                    if(MouseDigitalAxeMapping[x>>1][x&1]==-2)
                        MouseDigitalAxeMapping[x>>1][x&1] = NUMGAMEFUNCTIONS-1;
                }
                else
                {
                    MouseDigitalAxeMapping[x>>1][x&1]++;
                    if(MouseDigitalAxeMapping[x>>1][x&1]==NUMGAMEFUNCTIONS)
                        MouseDigitalAxeMapping[x>>1][x&1] = -1; // Discard
                }
            }

            switch(x)
            {
                case -1:
                    cmenu(701);
                    probey = 7; // back to the general mouse setup menu
                    break;
            }

            // display the button list
            for(i=0; i<(MAXMOUSEAXES*2); i++)
            {
                tempbuf[0] = 0;
                switch(i)
                {
                    case 0:
                        text += "X left";
                        break;
                    case 1:
                        text += "X right";
                        break;
                    case 2:
                        text += "Y up";
                        break;
                    case 3:
                        text +=  "Y down";
                        break;
                    default:
                        break;
                }
				
                gametext(c,47+i*8,text,0,2+8+16);
                gametext(c+121,47+i*8,(MouseDigitalAxeMapping[i>>1][i&1]!=-1)?CONFIG_FunctionNumToName(MouseDigitalAxeMapping[i>>1][i&1]):"...",0,2+8+16);
            }

            gametext(320>>1,47+(4+1)*8,"*** USE ARROWS OR DEL KEY ***",0,2+8+16);

            break;

        case 706: // Video setup
            // FIX_00042: Build in Video setup.
            c = (320>>1)-120;
            rotateSprite(320<<15,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
            menutext(320>>1,24,0,0,"VIDEO SETUP");

            onbar = (probey == 3 || probey == 4);
            x = probe(c+6,43,16,6);
			
            switch(x)
            {
                case -7: // cursor idle on the FPS option (5)
                    gametext(320>>1,43+16*7,"*** SHORTCUT: TYPE DNRATE ***",0,2+8+16); // center-i
					
                    break;

                case -3: // cursor idle on the togglefullscreen option (1)
                    gametext(320>>1,43+16*7,"*** SHORTCUT: ALT-ENTER ***",0,2+8+16); // center-i

                    break;

                case -2: // cursor idle on the resolution option (0)
                    if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) )
                    {
                        current_resolution--;
                        if(current_resolution == -1) 
                            current_resolution = 0;
                        lastkeysetup = 1; // indicates we changed
                        KB.clearKeyDown( sc_kpad_4 );
                        KB.clearKeyDown( sc_LeftArrow );
                        sound(PISTOL_BODYHIT);
                    }
                    else if ( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
                    {
                        current_resolution++; // reversed;
                        if(current_resolution == validmodecnt) 
                            current_resolution = validmodecnt-1;
                        lastkeysetup = 1; // indicates we changed
                        KB.clearKeyDown( sc_kpad_6 );
                        KB.clearKeyDown( sc_RightArrow );
                        sound(PISTOL_BODYHIT);
                    }

                    if(lastkeysetup)
                        gametext(320>>1,43+16*7,"*** HIT ENTER TO VALIDATE ***",0,2+8+16); // center-i
                    else
                        gametext(320>>1,43+16*7,"*** LEFT/RIGHT ARROW TO SELECT ***",0,2+8+16); // center-i

                    break;

                case -1:
                    cmenu(200);
                    probey = 4; // back to the general option menu
                    break;

                case 0:
                    if(lastkeysetup)
                        setgamemode(ScreenMode,validmodexdim[current_resolution],validmodeydim[current_resolution]);
                    lastkeysetup = 0; // indicating changes are done
                    break;

                case 1:
                    BFullScreen = !BFullScreen;
                    SDL_QuitSubSystem(SDL_INIT_VIDEO);
                    _platform_init(0, NULL, "Duke Nukem 3D", "Duke3D");
                    _setgamemode(ScreenMode,validmodexdim[current_resolution],validmodeydim[current_resolution]);
                    break;

                case 2:
                    ud.detail = 1-ud.detail;
                    break;

                case 5:
                    ud.tickrate ^= 1;
                    vscrn(); // FIX_00056: Refresh issue w/FPS, small Weapon and custom FTA, when screen resized down
                    break;
            }
				
            menutext(c,43,0,0,"RESOLUTION");
            sprintf(text, "%d x %d", validmodexdim[current_resolution],validmodeydim[current_resolution]);
            if (lastkeysetup == 0 || (totalclock%64 < 32)) // blink color after change
                menutext(c+150,43,0,0,text);
            else
                menutext(c+150,43,0,1,text);

            menutext(c,43+16*1,SHX(-3),PHX(-3),"FULLSCREEN");
            menutext(c+160+40,43+16*1,0,0,BFullScreen?"ON":"OFF");
			
            menutext(c,43+16*2,SHX(-2),PHX(-2),"DETAIL");
            menutext(c+160+40,43+16*2,0,0,ud.detail?"HIGH":"LOW");
            {
                var screen_size = ud.screen_size;

                // FIX_00027: Added an extra small statusbar (HUD)
                menutext(c,43+16*3,SHX(-5),PHX(-5),"SCREEN SIZE");
                var screen_sizeRef = new Ref(ud.brightness);
                bar(c+167+40,43+16*3,screen_sizeRef,-4,x==3,SHX(-5),PHX(-5));
                ud.brightness = screen_sizeRef.$;
                if(ud.screen_size==4)
                {
                    if(screen_size==0)
                    {
                        ud.extended_screen_size++;
                        if(ud.extended_screen_size==2)
                        {
                            ud.extended_screen_size = 1;
                            ud.screen_size -= 4;
                        }
                    }
                    else if(screen_size==8)
                    {
                        ud.extended_screen_size--;
                        if(ud.extended_screen_size<0)
                        {
                            ud.extended_screen_size=0;
                            ud.screen_size += 4;
                        }
                    }
                }
                else
                    ud.screen_size = screen_size;
            }

            menutext(c,43+16*4,SHX(-6),PHX(-6),"BRIGHTNESS");
            var udbrightnessRef = new Ref(ud.brightness);
            bar(c+167+40,43+16*4,udbrightnessRef,8,x==4,SHX(-6),PHX(-6));
            ud.brightness = udbrightnessRef.$;
            if(x==4) setbrightness(ud.brightness>>2,ps[myconnectindex].palette[0]);

            menutext(c,43+16*5,SHX(-2),PHX(-2),"SHOW FPS");
            menutext(c+160+40,43+16*5,0,0,(ud.tickrate&1)?"ON":"OFF");

            break;

        case 350:
            cmenu(351);
            screencapt = 1;
            displayrooms(myconnectindex,65536);
            savetemp("duke3d.tmp",tiles[MAXTILES-1].data,160*100);
            screencapt = 0;
            break;

        case 360:
        case 361:
        case 362:
        case 363:
        case 364:
        case 365:
        case 366:
        case 367:
        case 368:
        case 369:
        case 351:
        case 300:

            c = 320>>1;
            rotateSprite(c<<16,200<<15,65536,0,MENUSCREEN,16,0,10+64,0,0,xdim-1,ydim-1);
            rotateSprite(c<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);

            if(current_menu == 300) menutext(c,24,0,0,"LOAD GAME");
            else menutext(c,24,0,0,"SAVE GAME");

            if(current_menu >= 360 && current_menu <= 369 )
            {
                sprintf(text,"PLAYERS: %-2d                      ",ud.multimode);
                gametext(160,158,text,0,2+8+16);
                sprintf(text,"EPISODE: %-2d / LEVEL: %-2d / SKILL: %-2d",1+ud.volume_number,1+ud.level_number,ud.player_skill);
                gametext(160,170,text,0,2+8+16);

                x = strget((320>>1),184,/*&*/ud.savegame[current_menu-360][0],19, 999 );

                if(x == -1)
                {
                    //        readsavenames();
                    ps[myconnectindex].gm = MODE_GAME;
                    if(ud.multimode < 2  && ud.recstat != 2)
                    {
                        ready2send = 1;
                        totalclock = ototalclock;
                    }
                    throw "goto DISPLAYNAMES;";
                }

                if( x == 1 )
                {
                    if( ud.savegame[current_menu-360][0] == 0 )
                    {
                        KB.flushKeyboardQueue();
                        cmenu(351);
                    }
                    else
                    {
                        if(ud.multimode > 1)
                            saveplayer(-1-(current_menu-360));
                        else saveplayer(current_menu-360);
                        lastsavedpos = current_menu-360;
                        ps[myconnectindex].gm = MODE_GAME;

                        if(ud.multimode < 2  && ud.recstat != 2)
                        {
                            ready2send = 1;
                            totalclock = ototalclock;
                        }
                        KB.clearKeyDown(sc_Escape);
                        sound(EXITMENUSOUND);
                    }
                }

                rotateSprite(101<<16,97<<16,65536,512,MAXTILES-1,-32,0,2+4+8+64,0,0,xdim-1,ydim-1);
                dispnames();
                rotateSprite((c+67+strlen(/*&*/ud.savegame[current_menu-360][0])*4)<<16,(50+12*probey)<<16,32768-10240,0,SPINNINGNUKEICON+(((totalclock)>>3)%7),0,0,10,0,0,xdim-1,ydim-1);
                break;
            }

            last_threehundred = probey;

            x = probe(c+68,54,12,10);

            if(current_menu == 300)
            {
                if( ud.savegame[probey]/*[0]*/ )
                {
                    if (lastprobey != probey) {
                        var volnumRef = new Ref(volnum),
                            levnumRef = new Ref(levnum),
                            plrsklRef = new Ref(plrskl),
                            numplrRef = new Ref(numplr);
                        loadpheader(probey, volnumRef, levnumRef, plrsklRef, numplrRef);
                        volnum = volnumRef.$;
                        levnum = levnumRef.$;
                        plrskl = plrsklRef.$;
                        numplr = numplrRef.$;
                        lastprobey = probey;
                    }
                    var numFmt = new function(num) {
                        return num > 9 ? num : "0" + num;
                    }
                    rotateSprite(101<<16,97<<16,65536,512,MAXTILES-3,-32,0,4+10+64,0,0,xdim-1,ydim-1);
                    //text = "PLAYERS: %-2d                      ",numplr);
                    text = "PLAYERS: " + numFmt(numplr) + "                      ";
                    gametext(160,158,text,0,2+8+16);
                    text = "EPISODE: " + numFmt(volnum) +
                        " / LEVEL: " + numFmt(levnum) +
                        " / SKILL: " + numFmt(plrskl);
                    //sprintf(text,"EPISODE: %-2d / LEVEL: %-2d / SKILL: %-2d",1+volnum,1+levnum,plrskl);
                    gametext(160,170,text,0,2+8+16);
                }
                else menutext(69,70,0,0,"EMPTY");
            }
            else
            {
                if( ud.savegame[probey] )
                {
                    if (lastprobey != probey) {
                        var volnumRef = new Ref(volnum),
                            levnumRef = new Ref(levnum),
                            plrsklRef = new Ref(plrskl),
                            numplrRef = new Ref(numplr);
                        loadpheader(probey, volnumRef, levnumRef, plrsklRef, numplrRef);
                        volnum = volnumRef.$;
                        levnum = levnumRef.$;
                        plrskl = plrsklRef.$;
                        numplr = numplrRef.$;
                    }
                    lastprobey = probey;
                    rotateSprite(101<<16,97<<16,65536,512,MAXTILES-3,-32,0,4+10+64,0,0,xdim-1,ydim-1);
                }
                else menutext(69,70,0,0,"EMPTY");
                sprintf(text,"PLAYERS: %-2d                      ",ud.multimode);
                gametext(160,158,text,0,2+8+16);
                sprintf(text,"EPISODE: %-2d / LEVEL: %-2d / SKILL: %-2d",1+ud.volume_number,1+ud.level_number,ud.player_skill);
                gametext(160,170,text,0,2+8+16);
            }

            switch( x )
            {
                case -1:
                    if(current_menu == 300) //load game
                    {
                        if( (ps[myconnectindex].gm&MODE_GAME) != MODE_GAME)
                        {
                            cmenu(0);
                            break;
                        }
                        else
                            ps[myconnectindex].gm &= ~MODE_MENU;
                    }
                    else // save game
                        ps[myconnectindex].gm = MODE_GAME;

                    if(ud.multimode < 2 && ud.recstat != 2)
                    {
                        ready2send = 1;
                        totalclock = ototalclock;
                    }

                    break;
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    if( current_menu == 300)
                    {
                        if( ud.savegame[x] )
                            current_menu = (1000+x);
                    }
                    else
                    {
                        if( ud.savegame[x] )
                            current_menu = 2000+x;
                        else
                        {
                            KB.flushKeyboardQueue();
                            current_menu = (360+x);
                            ud.savegame[x] = null;
                            inputloc = 0;
                        }
                    }
                    break;
            }

            DISPLAYNAMES:
                dispnames();
            break;

        case 400: // help
        case 401:
            if(!VOLUMEONE)
            {
                c = 320>>1;

                if( KB.keyPressed( sc_LeftArrow ) ||
                    KB.keyPressed( sc_kpad_4 ) ||
                    KB.keyPressed( sc_UpArrow ) ||
                    KB.keyPressed( sc_PgUp ) ||
                    KB.keyPressed( sc_kpad_8 ) )
                {
                    KB.clearKeyDown(sc_LeftArrow);
                    KB.clearKeyDown(sc_kpad_4);
                    KB.clearKeyDown(sc_UpArrow);
                    KB.clearKeyDown(sc_PgUp);
                    KB.clearKeyDown(sc_kpad_8);

                    sound(KICK_HIT);
                    current_menu--;
                    if(current_menu < 400) current_menu = 401;
                }
                else if(
                    KB.keyPressed( sc_PgDn ) ||
                    KB.keyPressed( sc_Enter ) ||
                    KB.keyPressed( sc_kpad_Enter ) ||
                    KB.keyPressed( sc_RightArrow ) ||
                    KB.keyPressed( sc_DownArrow ) ||
                    KB.keyPressed( sc_kpad_2 ) ||
                    KB.keyPressed( sc_kpad_9 ) ||
                    KB.keyPressed( sc_Space ) ||
                    KB.keyPressed( sc_kpad_6 ) )
                {
                    KB.clearKeyDown(sc_PgDn);
                    KB.clearKeyDown(sc_Enter);
                    KB.clearKeyDown(sc_RightArrow);
                    KB.clearKeyDown(sc_kpad_Enter);
                    KB.clearKeyDown(sc_kpad_6);
                    KB.clearKeyDown(sc_kpad_9);
                    KB.clearKeyDown(sc_kpad_2);
                    KB.clearKeyDown(sc_DownArrow);
                    KB.clearKeyDown(sc_Space);
                    sound(KICK_HIT);
                    current_menu++;
                    if(current_menu > 401) current_menu = 400;
                }

                if( KB.keyPressed(sc_Escape) )
                {
                    KB.clearKeyDown(sc_Escape); // or else ESC will be activated in cmenu(0)
                    if(ps[myconnectindex].gm&MODE_GAME)
                        cmenu(50);
                    else cmenu(0);
                    return;
                }

                flushperms();
                switch(current_menu)
                {
                    case 400:
                        rotateSprite(0,0,65536,0,TEXTSTORY,0,0,10+16+64, 0,0,xdim-1,ydim-1);
                        break;
                    case 401:
                        rotateSprite(0,0,65536,0,F1HELP,0,0,10+16+64, 0,0,xdim-1,ydim-1);
                        break;
                }
                break;
            }
		
        case 402:
        case 403:
            if(VOLUMEONE)
            {
                c = 320>>1;

                if( KB.keyPressed( sc_LeftArrow ) ||
                    KB.keyPressed( sc_kpad_4 ) ||
                    KB.keyPressed( sc_UpArrow ) ||
                    KB.keyPressed( sc_PgUp ) ||
                    KB.keyPressed( sc_kpad_8 ) )
                {
                    KB.clearKeyDown(sc_LeftArrow);
                    KB.clearKeyDown(sc_kpad_4);
                    KB.clearKeyDown(sc_UpArrow);
                    KB.clearKeyDown(sc_PgUp);
                    KB.clearKeyDown(sc_kpad_8);

                    sound(KICK_HIT);
                    current_menu--;
                    if(current_menu < 400) current_menu = 403;
                }
                else if(
                    KB.keyPressed( sc_PgDn ) ||
                    KB.keyPressed( sc_Enter ) ||
                    KB.keyPressed( sc_kpad_Enter ) ||
                    KB.keyPressed( sc_RightArrow ) ||
                    KB.keyPressed( sc_DownArrow ) ||
                    KB.keyPressed( sc_kpad_2 ) ||
                    KB.keyPressed( sc_kpad_9 ) ||
                    KB.keyPressed( sc_Space ) ||
                    KB.keyPressed( sc_kpad_6 ) )
                {
                    KB.clearKeyDown(sc_PgDn);
                    KB.clearKeyDown(sc_Enter);
                    KB.clearKeyDown(sc_RightArrow);
                    KB.clearKeyDown(sc_kpad_Enter);
                    KB.clearKeyDown(sc_kpad_6);
                    KB.clearKeyDown(sc_kpad_9);
                    KB.clearKeyDown(sc_kpad_2);
                    KB.clearKeyDown(sc_DownArrow);
                    KB.clearKeyDown(sc_Space);
                    sound(KICK_HIT);
                    current_menu++;
                    if(current_menu > 403) current_menu = 400;
                }

                if( KB.keyPressed(sc_Escape) )
                {
                    if(ps[myconnectindex].gm&MODE_GAME)
                        cmenu(50);
                    else cmenu(0);
                    return;
                }

                flushperms();
                rotateSprite(0,0,65536,0,ORDERING+current_menu-400,0,0,10+16+64,0,0,xdim-1,ydim-1);
            }
            break;

        case 500: // from f10
        case 501: // from menu 0
        case 502: // from menu 50

            c = 320>>1;

            gametext(c,90,"Are you sure you want to quit?",0,2+8+16);
            gametext(c,99,"(Y/N)",0,2+8+16);

            _handle_events();
            if( KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter) || KB.keyPressed(sc_Y) || LMB )
            {
                gameexitanycase();
            }

            x = probe(186,124,0,0);
            if(x == -1 || KB.keyPressed(sc_N) || RMB)
            {
                KB.clearKeyDown(sc_N);
                quittimer = 0;
                // FIX_00073: menu off messed up. While in game hit Esc . select quit . press esc => stuck in menu
                if (current_menu==500)
                    ps[myconnectindex].gm &= ~MODE_MENU;
                else if(current_menu==501)
                    cmenu(0);
                else
                    cmenu(50);
            }
            break;

//        case 503:
//            c = 320>>1;
//            gametext(c,90,"Quit to Title?",0,2+8+16);
//            gametext(c,99,"(Y/N)",0,2+8+16);

//            _handle_events();
//            if( KB.keyPressed(sc_Space) || KB.keyPressed(sc_Enter) || KB.keyPressed(sc_kpad_Enter) || KB.keyPressed(sc_Y) || LMB )
//            {
//                KB.flushKeyboardQueue();
//                ps[myconnectindex].gm = MODE_DEMO;
//                if(ud.recstat == 1)
//                    closedemowrite();
//                if( ud.m_recstat != 2 && ud.last_level >= 0 && ud.multimode > 1 && ud.coop != 1)
//                    dobonus(1);
//                ud.last_level = -1;
//                cmenu(0);
//            }

//            x = probe(186,124,0,0);

//            if(x == -1 || KB.keyPressed(sc_N) || RMB)
//            {
//                cmenu(50);
//                if(ud.multimode < 2  && ud.recstat != 2)
//                {
//                    ready2send = 1;
//                    totalclock = ototalclock;
//                }
//            }

//            break;

//        case 601:
//            displayfragbar();
//            rotateSprite(160<<16,29<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
//            menutext(320>>1,34,0,0,&ud.user_name[myconnectindex][0]);

//            sprintf((char*)tempbuf,"Waiting for master");
//            gametext(160,50,(char*)tempbuf,0,2+8+16);
//            gametext(160,59,"to select level",0,2+8+16);

//            if( KB.keyPressed(sc_Escape) )
//            {
//                KB.clearKeyDown(sc_Escape);
//                sound(EXITMENUSOUND);
//                cmenu(0);
//            }
//            break;

//        case 602:
//            if(menunamecnt == 0)
//            {
//                //        getfilenames("SUBD");
//                getfilenames("*.MAP");
//                sortfilenames();
//                if (menunamecnt == 0)
//                    cmenu(600);
//            }
//        case 603:
//            c = (320>>1) - 120;
//            displayfragbar();
//            rotateSprite(320>>1<<16,19<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
//            menutext(320>>1,24,0,0,"USER MAPS");
//            for(x=0;x<menunamecnt;x++)
//            {
//                if(x == fileselect)
//                    minitext(15 + (x/15)*54,32 + (x%15)*8,menuname[x],0,26);
//                else minitext(15 + (x/15)*54,32 + (x%15)*8,menuname[x],16,26);
//            }

//            fileselect = probey;
//            if( KB.keyPressed( sc_LeftArrow ) || KB.keyPressed( sc_kpad_4 ) || ((buttonstat&1) && minfo.dyaw < -256 ) )
//            {
//                KB.clearKeyDown( sc_LeftArrow );
//                KB.clearKeyDown( sc_kpad_4 );
//                probey -= 15;
//                if(probey < 0) probey += 15;
//                else sound(KICK_HIT);
//            }
//            if( KB.keyPressed( sc_RightArrow ) || KB.keyPressed( sc_kpad_6 ) || ((buttonstat&1) && minfo.dyaw > 256 ) )
//            {
//                KB.clearKeyDown( sc_RightArrow );
//                KB.clearKeyDown( sc_kpad_6 );
//                probey += 15;
//                if(probey >= menunamecnt)
//                    probey -= 15;
//                else sound(KICK_HIT);
//            }

//            onbar = 0;
//            x = probe(0,0,0,menunamecnt);

//            if(x == -1) cmenu(600);
//            else if(x >= 0)
//            {
//                tempbuf[0] = 8;
//                tempbuf[1] = ud.m_level_number = 6;
//                tempbuf[2] = ud.m_volume_number = 0;
//                tempbuf[3] = ud.m_player_skill+1;

//                if(ud.player_skill == 3)
//                    ud.m_respawn_monsters = 1;
//                else ud.m_respawn_monsters = 0;

//                if(ud.m_coop == 0) ud.m_respawn_items = 1;
//                else ud.m_respawn_items = 0;

//                ud.m_respawn_inventory = 1;

//                tempbuf[4] = ud.m_monsters_off;
//                tempbuf[5] = ud.m_respawn_monsters;
//                tempbuf[6] = ud.m_respawn_items;
//                tempbuf[7] = ud.m_respawn_inventory;
//                tempbuf[8] = ud.m_coop;
//                tempbuf[9] = ud.m_marker;

//                x = strlen(menuname[probey]);

//                copybufbyte(menuname[probey],tempbuf+10,x);
//                copybufbyte(menuname[probey],boardfilename,x+1);

//                for(c=connecthead;c>=0;c=connectpoint2[c])
//                    if(c != myconnectindex)
//                        sendpacket(c,(uint8_t*)tempbuf,x+10);

//                newgame(ud.m_volume_number,ud.m_level_number,ud.m_player_skill+1);
//                enterlevel(MODE_GAME);
//            }
//            break;

//        case 600: // multiplayer and bot menu
//            c = (320>>1) - 120;
//            if((ps[myconnectindex].gm&MODE_GAME) != MODE_GAME)
//                displayfragbar();
//            rotateSprite(160<<16,26<<16,65536,0,MENUBAR,16,0,10,0,0,xdim-1,ydim-1);
//            menutext(160,31,0,0,&ud.user_name[myconnectindex][0]);

//            x = probe(c,57-8,16,8);

//            switch(x)
//            {
//                // FIX_00068: menu "New Game" in multiplayer mode now allowing left/right arrow for selection
//                case -7: // idle on case 5
//                    if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) ||
//						 KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ))
//                    {
//                        if(ud.m_coop == 1)
//                            ud.m_ffire = !ud.m_ffire;

//                        KB.clearKeyDown( sc_kpad_4 );
//                        KB.clearKeyDown( sc_LeftArrow );
//                        KB.clearKeyDown( sc_kpad_6 );
//                        KB.clearKeyDown( sc_RightArrow );
//                        sound(PISTOL_BODYHIT);
//                    } 
//                    break;

//                case -6: // idle on case 4
//                    if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) ||
//						 KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ))
//                    {
//                        if(ud.m_coop == 0)
//                            ud.m_marker = !ud.m_marker;

//                        KB.clearKeyDown( sc_kpad_4 );
//                        KB.clearKeyDown( sc_LeftArrow );
//                        KB.clearKeyDown( sc_kpad_6 );
//                        KB.clearKeyDown( sc_RightArrow );
//                        sound(PISTOL_BODYHIT);
//                    } 
//                    break;

//                case -5: // idle on case 3
//                    if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) )
//                    {
//                        if(ud.m_monsters_off == 1 && ud.m_player_skill > 0)
//                            ud.m_monsters_off = 0;

//                        if(ud.m_monsters_off == 1)
//                        {
//                            ud.m_monsters_off = 0;
//                            ud.m_player_skill = 3;
//                        }
//                        else
//                        {
//                            ud.m_player_skill--;
//                            if(ud.m_player_skill < 0)
//                            {
//                                ud.m_player_skill = 0;
//                                ud.m_monsters_off = 1;
//                            }
//                        }

//                        KB.clearKeyDown( sc_kpad_4 );
//                        KB.clearKeyDown( sc_LeftArrow );
//                        sound(PISTOL_BODYHIT);
//                    } 
//                    else if( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
//                    {	
//                        if(ud.m_monsters_off == 1 && ud.m_player_skill > 0)
//                            ud.m_monsters_off = 0;

//                        if(ud.m_monsters_off == 0)
//                        {
//                            ud.m_player_skill++;
//                            if(ud.m_player_skill > 3)
//                            {
//                                ud.m_player_skill = 0;
//                                ud.m_monsters_off = 1;
//                            }
//                        }
//                        else
//                        {
//                            ud.m_monsters_off = 0;
//                            ud.m_player_skill = 0;
//                        }

//                        KB.clearKeyDown( sc_kpad_6 );
//                        KB.clearKeyDown( sc_RightArrow );
//                        sound(PISTOL_BODYHIT);
//                    }
//                    break;

//#ifndef ONELEVELDEMO

//                case -4: // idle on case 2
//                    if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) )
//                    {
//                        ud.m_level_number--;
//                        if (!VOLUMEONE)
//                        {
//                            if(ud.m_volume_number == 0 && ud.m_level_number < 0)
//                                ud.m_level_number = 6;
//                        }
//                        else
//                        {
//                            if(ud.m_volume_number == 0 && ud.m_level_number < 0)
//                                ud.m_level_number = 5;
//                        }
//                        if(ud.m_level_number < 0) ud.m_level_number = 10;

//                        KB.clearKeyDown( sc_kpad_4 );
//                        KB.clearKeyDown( sc_LeftArrow );
//                        sound(PISTOL_BODYHIT);
//                    }
//                    else if ( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
//                    {
//                        ud.m_level_number++;
//                        if (!VOLUMEONE)
//                        {
//                            if(ud.m_volume_number == 0 && ud.m_level_number > 6)
//                                ud.m_level_number = 0;
//                        }
//                        else
//                        {
//                            if(ud.m_volume_number == 0 && ud.m_level_number > 5)
//                                ud.m_level_number = 0;
//                        }
//                        if(ud.m_level_number > 10) ud.m_level_number = 0;

//                        KB.clearKeyDown( sc_kpad_6 );
//                        KB.clearKeyDown( sc_RightArrow );
//                        sound(PISTOL_BODYHIT);
//                    }
//                    break;
//#endif

//                case -3: // Idle on case 1
//                    if (!VOLUMEONE)
//                    {
//                        if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) )
//                        {
//                            ud.m_volume_number--;
//                            if(PLUTOPAK)
//                            {	if(ud.m_volume_number < 0 ) ud.m_volume_number = 3; }
//                            else
//                            {	if(ud.m_volume_number < 0) ud.m_volume_number = 2; }

//                            if(ud.m_volume_number == 0 && ud.m_level_number > 6)
//                                ud.m_level_number = 0;
//                            if(ud.m_level_number > 10) ud.m_level_number = 0;

//                            KB.clearKeyDown( sc_kpad_4 );
//                            KB.clearKeyDown( sc_LeftArrow );
//                            sound(PISTOL_BODYHIT);
//                        }
//                        else if( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
//                        {
//                            ud.m_volume_number++;
//                            if(PLUTOPAK)
//                            {	if(ud.m_volume_number > 3) ud.m_volume_number = 0; }
//                            else
//                            {	if(ud.m_volume_number > 2) ud.m_volume_number = 0; }

//                            if(ud.m_volume_number == 0 && ud.m_level_number > 6)
//                                ud.m_level_number = 0;
//                            if(ud.m_level_number > 10) ud.m_level_number = 0;

//                            KB.clearKeyDown( sc_kpad_6 );
//                            KB.clearKeyDown( sc_RightArrow );
//                            sound(PISTOL_BODYHIT);
//                        }
//                    }
//                    break;

//                case -2: // Idle on case 0
//                    if ( KB.keyPressed( sc_kpad_4 ) || KB.keyPressed( sc_LeftArrow ) )
//                    {
//                        ud.m_coop--;
//                        if(ud.m_coop == -1) ud.m_coop = 2;

//                        KB.clearKeyDown( sc_kpad_4 );
//                        KB.clearKeyDown( sc_LeftArrow );
//                        sound(PISTOL_BODYHIT);
//                    } 
//                    else if( KB.keyPressed( sc_kpad_6 ) || KB.keyPressed( sc_RightArrow ) )
//                    {	
//                        ud.m_coop++;
//                        if(ud.m_coop == 3) ud.m_coop = 0;

//                        KB.clearKeyDown( sc_kpad_6 );
//                        KB.clearKeyDown( sc_RightArrow );
//                        sound(PISTOL_BODYHIT);
//                    }
//                    break;

//                case -1:
//                    ud.m_recstat = 0;
//                    if(ps[myconnectindex].gm&MODE_GAME) cmenu(50);
//                    else cmenu(0);
//                    break;
//                case 0:
//                    ud.m_coop++;
//                    if(ud.m_coop == 3) ud.m_coop = 0;
//                    break;
//                case 1:
//                    if (!VOLUMEONE)
//                    {                    ud.m_volume_number++;
//                        if(PLUTOPAK)
//                        {	if(ud.m_volume_number > 3) ud.m_volume_number = 0; }
//                        else
//                        {	if(ud.m_volume_number > 2) ud.m_volume_number = 0; }

//                        if(ud.m_volume_number == 0 && ud.m_level_number > 6)
//                            ud.m_level_number = 0;
//                        if(ud.m_level_number > 10) ud.m_level_number = 0;
//                    }
//                    break;
//                case 2:
//#ifndef ONELEVELDEMO
//                    ud.m_level_number++;
//                    if (!VOLUMEONE)
//                    {
//                        if(ud.m_volume_number == 0 && ud.m_level_number > 6)
//                            ud.m_level_number = 0;
//                    }
//                    else
//                    {
//                        if(ud.m_volume_number == 0 && ud.m_level_number > 5)
//                            ud.m_level_number = 0;
//                    }
//                    if(ud.m_level_number > 10) ud.m_level_number = 0;
//#endif
//                    break;
//                case 3:
//                    if(ud.m_monsters_off == 1 && ud.m_player_skill > 0)
//                        ud.m_monsters_off = 0;

//                    if(ud.m_monsters_off == 0)
//                    {
//                        ud.m_player_skill++;
//                        if(ud.m_player_skill > 3)
//                        {
//                            ud.m_player_skill = 0;
//                            ud.m_monsters_off = 1;
//                        }
//                    }
//                    else 
//                    {
//                        ud.m_monsters_off = 0;
//                        ud.m_player_skill = 0;
//                    }

//                    break;

//                case 4:
//                    if(ud.m_coop == 0)
//                        ud.m_marker = !ud.m_marker;
//                    break;

//                case 5:
//                    if(ud.m_coop == 1)
//                        ud.m_ffire = !ud.m_ffire;
//                    break;

//                case 6: // select user map
//                    if(!VOLUMEONE)
//                    {                    if(boardfilename[0] == 0) break;

//                        tempbuf[0] = 5;
//                        tempbuf[1] = ud.m_level_number = 7;
//                        tempbuf[2] = ud.m_volume_number = 0;
//                        tempbuf[3] = ud.m_player_skill+1;

//                        ud.level_number = ud.m_level_number;
//                        ud.volume_number = ud.m_volume_number;

//                        if( ud.m_player_skill == 3 ) ud.m_respawn_monsters = 1;
//                        else ud.m_respawn_monsters = 0;

//                        if(ud.m_coop == 0) ud.m_respawn_items = 1;
//                        else ud.m_respawn_items = 0;

//                        ud.m_respawn_inventory = 1;

//                        tempbuf[4] = ud.m_monsters_off;
//                        tempbuf[5] = ud.m_respawn_monsters;
//                        tempbuf[6] = ud.m_respawn_items;
//                        tempbuf[7] = ud.m_respawn_inventory;
//                        tempbuf[8] = ud.m_coop;
//                        tempbuf[9] = ud.m_marker;
//                        tempbuf[10] = ud.m_ffire;

//                        for(c=connecthead;c>=0;c=connectpoint2[c])
//                        {
//                            resetweapons(c);
//                            resetinventory(c);

//                            if(c != myconnectindex)
//                                sendpacket(c,(uint8_t*)tempbuf,11);
//                        }

//                        newgame(ud.m_volume_number,ud.m_level_number,ud.m_player_skill+1);
//                        enterlevel(MODE_GAME);

//                        return;
//                    }
//                case 7: // start game

//                    tempbuf[0] = 5;
//                    tempbuf[1] = ud.m_level_number;
//                    tempbuf[2] = ud.m_volume_number;
//                    tempbuf[3] = ud.m_player_skill+1;

//                    if( ud.m_player_skill == 3 ) ud.m_respawn_monsters = 1;
//                    else ud.m_respawn_monsters = 0;

//                    if(ud.m_coop == 0) ud.m_respawn_items = 1;
//                    else ud.m_respawn_items = 0;

//                    ud.m_respawn_inventory = 1;

//                    tempbuf[4] = ud.m_monsters_off;
//                    tempbuf[5] = ud.m_respawn_monsters;
//                    tempbuf[6] = ud.m_respawn_items;
//                    tempbuf[7] = ud.m_respawn_inventory;
//                    tempbuf[8] = ud.m_coop;
//                    tempbuf[9] = ud.m_marker;
//                    tempbuf[10] = ud.m_ffire;

//                    for(c=connecthead;c>=0;c=connectpoint2[c])
//                    {
//                        resetweapons(c);
//                        resetinventory(c);

//                        if(c != myconnectindex)
//                            sendpacket(c,(uint8_t*)tempbuf,11);
//                    }

//                    newgame(ud.m_volume_number,ud.m_level_number,ud.m_player_skill+1);
//                    enterlevel(MODE_GAME);

//                    return;

//            }

//            c += 40;

//            if(ud.m_coop==1) gametext(c+70,57-7-9,"COOPERATIVE PLAY",0,2+8+16);
//            else if(ud.m_coop==2) gametext(c+70,57-7-9,"DUKEMATCH (NO SPAWN)",0,2+8+16);
//            else gametext(c+70,57-7-9,"DUKEMATCH (SPAWN)",0,2+8+16);

//            if(VOLUMEONE)
//                gametext(c+70,57+16-7-9,volume_names[ud.m_volume_number],0,2+8+16);
//            else
//                gametext(c+70,57+16-7-9,volume_names[ud.m_volume_number],0,2+8+16);
 
//            gametext(c+70,57+16+16-7-9,&level_names[11*ud.m_volume_number+ud.m_level_number][0],0,2+8+16);

//            if(ud.m_monsters_off == 0 || ud.m_player_skill > 0)
//                gametext(c+70,57+16+16+16-7-9,skill_names[ud.m_player_skill],0,2+8+16);
//            else gametext(c+70,57+16+16+16-7-9,"NONE",0,2+8+16);

//            if(ud.m_coop == 0)
//            {
//                if(ud.m_marker)
//                    gametext(c+70,57+16+16+16+16-7-9,"ON",0,2+8+16);
//                else gametext(c+70,57+16+16+16+16-7-9,"OFF",0,2+8+16);
//            }

//            if(ud.m_coop == 1)
//            {
//                if(ud.m_ffire)
//                    gametext(c+70,57+16+16+16+16+16-7-9,"ON",0,2+8+16);
//                else gametext(c+70,57+16+16+16+16+16-7-9,"OFF",0,2+8+16);
//            }

//            c -= 44;

//            menutext(c,57-9,SHX(-2),PHX(-2),"GAME TYPE");

//            if (VOLUMEONE)
//            {            sprintf(text,"EPISODE %d",ud.m_volume_number+1);
//                menutext(c,57+16-9,SHX(-3),1,text);
//            } 
//            else 
//            {
//                sprintf(text,"EPISODE %d",ud.m_volume_number+1);
//                menutext(c,57+16-9,SHX(-3),PHX(-3),text);
//            }

//#ifndef ONELEVELDEMO
//            sprintf(text,"LEVEL %d",ud.m_level_number+1);
//            menutext(c,57+16+16-9,SHX(-4),PHX(-4),text);
//#else
//            sprintf(text,"LEVEL %d",ud.m_level_number+1);
//            menutext(c,57+16+16-9,SHX(-4),1,text);
//#endif
//            menutext(c,57+16+16+16-9,SHX(-5),PHX(-5),"MONSTERS");

//            if(ud.m_coop == 0)
//                menutext(c,57+16+16+16+16-9,SHX(-6),PHX(-6),"MARKERS");
//            else
//                menutext(c,57+16+16+16+16-9,SHX(-6),1,"MARKERS");

//            if(ud.m_coop == 1)
//                menutext(c,57+16+16+16+16+16-9,SHX(-6),PHX(-6),"FR. FIRE");
//            else menutext(c,57+16+16+16+16+16-9,SHX(-6),1,"FR. FIRE");

//            if(!VOLUMEONE)
//            {            menutext(c,57+16+16+16+16+16+16-9,SHX(-7),boardfilename[0] == 0,"USER MAP");
//                if( boardfilename[0] != 0 )
//                    gametext(c+70+44,57+16+16+16+16+16,boardfilename,0,2+8+16);
//            }
//            else
//            {
//                menutext(c,57+16+16+16+16+16+16-9,SHX(-7),1,"USER MAP");
//            }

//            menutext(c,57+16+16+16+16+16+16+16-9,SHX(-8),PHX(-8),"START GAME");

        //            break;
    
        default:
            throw "todo current_menu: " + current_menu;
    }

    if( (ps[myconnectindex].gm&MODE_MENU) != MODE_MENU)
    {
        vscrn();
        cameraclock = totalclock;
        cameradist = 65536;
    }
}

//2494
var inputloc = 0;
function strget( x, y,t, dalen, c)
{
    throw "todo"
    //var ch,sc;

    //while(KB.keyWaiting()) ??????????????????
    //{
    //    sc = 0;
    //    ch = KB_Getch();

    //    if (ch == 0)
    //    {

    //        sc = KB_Getch();
    //        if( sc == 104) return(1);

    //        continue;
    //    }
    //    else
    //    {
    //        if(ch == 8) // asc_BackSpace
    //        {
    //            if( inputloc > 0 )
    //            {
    //                inputloc--;
    //                *(t+inputloc) = 0;
    //            }
    //        }
    //        else
    //        {
    //            if(ch == asc_Enter || sc == 104)
    //            {
    //                KB_ClearKeyDown(sc_Enter);
    //                KB_ClearKeyDown(sc_kpad_Enter);
    //                return (1);
    //            }
    //            else if(ch == asc_Escape)
    //            {
    //                KB_ClearKeyDown(sc_Escape);
    //                return (-1);
    //            }
    //            else if ( ch >= 32 && inputloc < dalen && ch < 127)
    //            {
    //                ch = toupper(ch);
    //                *(t+inputloc) = ch;
    //                *(t+inputloc+1) = 0;
    //                inputloc++;
    //            }
    //        }
    //    }
    //}

    //if( c == 999 ) return(0);
    //if( c == 998 )
    //{
    //    char  b[41],ii;
    //    for(ii=0;ii<inputloc;ii++)
    //        b[ii] = '*';
    //    b[ii] = 0;
    //    x = gametext(x,y,b,c,2+8+16);
    //}
    //else x = gametext(x,y,t,c,2+8+16);
    //c = 4-(sintable[(totalclock<<4)&2047]>>11);
    //rotateSprite((x+8)<<16,(y+4)<<16,32768L,0,SPINNINGNUKEICON+((totalclock>>3)%7),c,0,2+8,0,0,xdim-1,ydim-1);

    //return (0);
}


// 4152
function palto(r, g, b, e) {
    var i, tempArray = new Uint8Array(768);

    for (i = 0; i < (256 * 3) ; i += 3) {
        tempArray[i] = ps[myconnectindex].palette[i + 0] + (((r - ps[myconnectindex].palette[i + 0]) * (e & 127)) >> 6);
        tempArray[i + 1] = ps[myconnectindex].palette[i + 1] + (((g - ps[myconnectindex].palette[i + 1]) * (e & 127)) >> 6);
        tempArray[i + 2] = ps[myconnectindex].palette[i + 2] + (((b - ps[myconnectindex].palette[i + 2]) * (e & 127)) >> 6);
    }

    setBrightness(ud.brightness >> 2, tempArray);
}


function endanimsounds(fr)
{
    switch(ud.volume_number)
    {
        case 0:break;
        case 1:
            switch(fr)
            {
                case 1:
                    sound(WIND_AMBIENCE);
                    break;
                case 26:
                    sound(ENDSEQVOL2SND1);
                    break;
                case 36:
                    sound(ENDSEQVOL2SND2);
                    break;
                case 54:
                    sound(THUD);
                    break;
                case 62:
                    sound(ENDSEQVOL2SND3);
                    break;
                case 75:
                    sound(ENDSEQVOL2SND4);
                    break;
                case 81:
                    sound(ENDSEQVOL2SND5);
                    break;
                case 115:
                    sound(ENDSEQVOL2SND6);
                    break;
                case 124:
                    sound(ENDSEQVOL2SND7);
                    break;
            }
            break;
        case 2:
            switch(fr)
            {
                case 1:
                    sound(WIND_REPEAT);
                    break;
                case 98:
                    sound(DUKE_GRUNT);
                    break;
                case 82+20:
                    sound(THUD);
                    sound(SQUISHED);
                    break;
                case 104+20:
                    sound(ENDSEQVOL3SND3);
                    break;
                case 114+20:
                    sound(ENDSEQVOL3SND2);
                    break;
                case 158:
                    sound(PIPEBOMB_EXPLODE);
                    break;
            }
            break;
    }
}


//4490
function logoanimsounds(fr) {
    switch (fr) {
        case 1:
            sound(FLY_BY);
            break;
        case 19:
            sound(PIPEBOMB_EXPLODE);
            break;
    }
}

function intro4animsounds( fr)
{
    switch(fr)
    {
        case 1:
            sound(INTRO4_B);
            break;
        case 12:
        case 34:
            sound(SHORT_CIRCUIT);
            break;
        case 18:
            sound(INTRO4_5);
            break;
    }
}

function first4animsounds( fr)
{
    switch(fr)
    {
        case 1:
            sound(INTRO4_1);
            break;
        case 12:
            sound(INTRO4_2);
            break;
        case 7:
            sound(INTRO4_3);
            break;
        case 26:
            sound(INTRO4_4);
            break;
    }
}

function intro42animsounds( fr)
{
    switch(fr)
    {
        case 10:
            sound(INTRO4_6);
            break;
    }
}

function endanimvol41( fr)
{
    switch(fr)
    {
        case 3:
            sound(DUKE_UNDERWATER);
            break;
        case 35:
            sound(VOL4ENDSND1);
            break;
    }
}

function endanimvol42( fr)
{
    switch(fr)
    {
        case 11:
            sound(DUKE_UNDERWATER);
            break;
        case 20:
            sound(VOL4ENDSND1);
            break;
        case 39:
            sound(VOL4ENDSND2);
            break;
        case 50:
            FX.stopAllSounds();
            break;
    }
}

function endanimvol43( fr)
{
    switch(fr)
    {
        case 1:
            sound(BOSS4_DEADSPEECH);
            break;
        case 40:
            sound(VOL4ENDSND1);
            sound(DUKE_UNDERWATER);
            break;
        case 50:
            sound(BIGBANG);
            break;
    }
}



// 4602
var lastanimhack = 0;
function playanm(filename, t) {
    var animbuf, palptr;
    var i, j, k, length, numframes;
    var handle;

    if (t != 7 && t != 9 && t != 10 && t != 11) {
        KB.flushKeyboardQueue();
    }

    if (KB.keyWaiting()) {
        // todo
        throw new Error("todo");
    }

    handle = TCkopen4load(filename, false);

    if (handle === -1) {
        return;
    }

    length = kfilelength(handle);

    tiles[MAXTILES - 3 - t].lock = 219 + t;

    if (!anim || lastanimhack != (MAXTILES - 3 - t)) {
        console.log("caching neeeded? allocache((uint8_t**)&anim,length+sizeof(anim_t),&tiles[MAXTILES-3-t].lock);");
    }

    animbuf = new Uint8Array(length + 133524);

    lastanimhack = (MAXTILES - 3 - t);

    tiles[MAXTILES - 3 - t].dim.width = 200;
    tiles[MAXTILES - 3 - t].dim.height = 320;

    kread(handle, animbuf, length);
    kclose(handle);

    Anim.loadAnim(animbuf);
    numframes = Anim.numFrames();

    palptr = Anim.getPalette();

    for (i = 0; i < 256; i++) {
        j = (i << 2); k = j - i;
        tempbuf[j + 0] = (palptr[k + 2] >> 2);
        tempbuf[j + 1] = (palptr[k + 1] >> 2);
        tempbuf[j + 2] = (palptr[k + 0] >> 2);
        tempbuf[j + 3] = 0;
    }

    VBE_setPalette(tempbuf, "debug");

    ototalclock = totalclock + 10;

    i = 1;
    q.setPositionAtStart();
    q.addWhile(function () {
        return i++ < numframes;
    }, function () {
        q.setPositionAtStart()
        .addWhile(function () {
            return totalclock < ototalclock;
        }, function () {
            q.setPositionAtStart(); // important!
            if (KB.keyWaiting()) {
                //goto ENDOFANIMLOOP;
                throw new Error("goto label todo");
            }
            getpackets();
        }).add(function () {
            if (t == 10) ototalclock += 14;
            else if (t == 9) ototalclock += 10;
            else if (t == 7) ototalclock += 18;
            else if (t == 6) ototalclock += 14;
            else if (t == 5) ototalclock += 9;
            else if (ud.volume_number == 3) ototalclock += 10;
            else if (ud.volume_number == 2) ototalclock += 10;
            else if (ud.volume_number == 1) ototalclock += 18;
            else ototalclock += 10;

            tiles[MAXTILES - 3 - t].data = Anim.drawFrame(i);
            rotateSprite(0 << 16, 0 << 16, 65536, 512, MAXTILES - 3 - t, 0, 0, 2 + 4 + 8 + 16 + 64, 0, 0, xdim - 1, ydim - 1);
            nextpage();

            if (t == 8) endanimvol41(i);
            else if (t == 10) endanimvol42(i);
            else if (t == 11) endanimvol43(i);
            else if (t == 9) intro42animsounds(i);
            else if (t == 7) intro4animsounds(i);
            else if (t == 6) first4animsounds(i);
            else if (t == 5) logoanimsounds(i);
            else if (t < 4) endanimsounds(i);

            i++;
        });
    }).add(function () {
        Anim.freeAnim();
        tiles[MAXTILES - 3 - t].lock = 1;
    });
}

