'use strict';

var LOUDESTVOLUME = 150;
var backflag, numenvsnds;

//52
function SoundStartup() {
    var status = FX_Init(FXDevice, NumVoices, NumChannels, NumBits, MixRate);
    FX.setVolume(FXVolume);
    if (ReverseStereo == 1) {
        FX_SetReverseStereo(!FX_GetReverseStereo());
    }

    status = FX_SetCallBack(TestCallBack);
}

//230
var menunum = 0;

function intomenusounds() {
    var menusnds =
    [
        LASERTRIP_EXPLODE,
        DUKE_GRUNT,
        DUKE_LAND_HURT,
        CHAINGUN_FIRE,
        SQUISHED,
        KICK_HIT,
        PISTOL_RICOCHET,
        PISTOL_BODYHIT,
        PISTOL_FIRE,
        SHOTGUN_FIRE,
        BOS1_WALK,
        RPG_EXPLODE,
        PIPEBOMB_BOUNCE,
        PIPEBOMB_EXPLODE,
        NITEVISION_ONOFF,
        RPG_SHOOT,
        SELECT_WEAPON
    ];
    sound(menusnds[menunum++]);
    menunum %= 17;
}

//258
function playmusic(filename) {
    if (MusicToggle == 0) return;
    //if (MusicDevice == NumSoundCards) return;

    // todo!
}

function loadsound(num) {
    var fp, l;

    if (num >= NUM_SOUNDS || SoundToggle == 0) return 0;
    if (FXDevice == NumSoundCards) return 0;

    fp = TCkopen4load(sounds[num], 0);
    if (fp == -1) {
        fta_quotes[113] = sprintf("Sound %s(#%d) not found.", sounds[num], num);
        FTA(113, ps[myconnectindex], 1);
        return 0;
    }

    l = kfilelength(fp);
    soundsiz[num] = l;

    Sound[num].lock = 200;

    //allocache(&Sound[num].ptr,l,(uint8_t  *)&Sound[num].lock);
    Sound[num].ptr = new Uint8Array(l);
    Sound[num].ptrIdx = 0;
    kread(fp, Sound[num].ptr, l);
    kclose(fp);
    return 1;
}

//293
function xyzsound(num, i, x, y, z) {
    var sndist, cx, cy, cz, j, k;
    var pitche, pitchs, cs;
    var voice, sndang, ca, pitch;

    if (num >= NUM_SOUNDS ||
        FXDevice == NumSoundCards ||
        ((soundm[num] & 8) && ud.lockout) ||
        SoundToggle == 0 ||
        Sound[num].num > 3 ||
        FX_VoiceAvailable(soundpr[num]) == 0 ||
        (ps[myconnectindex].timebeforeexit > 0 && ps[myconnectindex].timebeforeexit <= 26 * 3) ||
        ps[myconnectindex].gm & MODE_MENU) return -1;

    if (soundm[num] & 128) {
        sound(num);
        return 0;
    }

    if (soundm[num] & 4) {
        // FIX_00041: Toggle to hear the opponent sound in DM (like it used to be in v1.3d)
        if (VoiceToggle == 0 || (ud.multimode > 1 && sprite[i].picnum == APLAYER && sprite[i].yvel != screenpeek && /*ud.coop!=1 &&*/ !OpponentSoundToggle)) return -1; //xduke : 1.3d Style: makes opponent sound in DM as in COOP

        for (j = 0; j < NUM_SOUNDS; j++)
            for (k = 0; k < Sound[j].num; k++)
                if ((Sound[j].num > 0) && (soundm[j] & 4))
                    return -1;
    }

    cx = ps[screenpeek].oposx;
    cy = ps[screenpeek].oposy;
    cz = ps[screenpeek].oposz;
    cs = ps[screenpeek].cursectnum;
    ca = ps[screenpeek].ang + ps[screenpeek].look_ang; // todo: these values different to original

    sndist = FindDistance3D((cx - x), (cy - y), (cz - z) >> 4);

    if (i >= 0 && (soundm[num] & 16) == 0 && sprite[i].picnum == MUSICANDSFX && sprite[i].lotag < 999 && (sector[sprite[i].sectnum].lotag & 0xff) < 9)
        sndist = divscale14(sndist, (sprite[i].hitag + 1));

    pitchs = soundps[num];
    pitche = soundpe[num];
    cx = klabs(pitche - pitchs);

    if (cx) {
        if (pitchs < pitche)
            pitch = pitchs + (NORMAL_RAND % cx);
        else pitch = pitche + (NORMAL_RAND % cx);
    }
    else pitch = pitchs;

    sndist += soundvo[num];
    if (sndist < 0) sndist = 0;
    if (sndist && sprite[i].picnum != MUSICANDSFX && !cansee(cx, cy, cz - (24 << 8), cs, sprite[i].x, sprite[i].y, sprite[i].z - (24 << 8), sprite[i].sectnum))
        sndist += sndist >> 5;

    switch (num) {
        case PIPEBOMB_EXPLODE:
        case LASERTRIP_EXPLODE:
        case RPG_EXPLODE:
            if (sndist > (6144))
                sndist = 6144;
            if (sector[ps[screenpeek].cursectnum].lotag == 2)
                pitch -= 1024;
            break;
        default:
            if (sector[ps[screenpeek].cursectnum].lotag == 2 && (soundm[num] & 4) == 0)
                pitch = -768;
            if (sndist > 31444 && sprite[i].picnum != MUSICANDSFX)
                return -1;
            break;
    }

    if (Sound[num].num > 0 && sprite[i].picnum != MUSICANDSFX) {
        if (SoundOwner[num][0].i == i) stopsound(num);
        else if (Sound[num].num > 1) stopsound(num);
        else if (badguy(sprite[i]) && sprite[i].extra <= 0) stopsound(num);
    }

    if (sprite[i].picnum == APLAYER && sprite[i].yvel == screenpeek) {
        sndang = 0;
        sndist = 0;
    }
    else {
        sndang = 2048 + ca - getangle(cx - x, cy - y);
        sndang &= 2047;
    }

    if (Sound[num].ptrIdx == 0) { if (loadsound(num) == 0) return 0; }
    else
    {
        if (Sound[num].lock < 200)
            Sound[num].lock = 200;
        else Sound[num].lock++;
    }

    if (soundm[num] & 16) sndist = 0;

    if (sndist < ((255 - LOUDESTVOLUME) << 6))
        sndist = ((255 - LOUDESTVOLUME) << 6);
    if (soundm[num] & 1) {
        throw "todo"
        ////var start;

        ////if(Sound[num].num > 0) return -1;

        ////start = *(uint16_t *)(Sound[num].ptr + 0x14);

        ////if(Sound[num].ptr[Sound[num].ptrIdx] == 'C'.charCodeAt(0))
        ////    voice = FX_PlayLoopedVOC( Sound[num].ptr, start, start + soundsiz[num],
        ////            pitch,sndist>>6,sndist>>6,0,soundpr[num],num);
        ////else
        ////    voice = FX_PlayLoopedWAV( Sound[num].ptr, start, start + soundsiz[num],
        ////            pitch,sndist>>6,sndist>>6,0,soundpr[num],num);
    }
    else {
        if (Sound[num].ptr[Sound[num].ptrIdx] == 'C'.charCodeAt(0))
            voice = FX_PlayVOC3D(Sound[num].ptr, pitch, sndang >> 6, sndist >> 6, soundpr[num], num);
        else voice = FX_PlayWAV3D(Sound[num].ptr, pitch, sndang >> 6, sndist >> 6, soundpr[num], num);
    }

    if (voice > FX_Ok) {
        SoundOwner[num][Sound[num].num].i = i;
        SoundOwner[num][Sound[num].num].voice = voice;
        Sound[num].num++;
    }
    else Sound[num].lock--;
    return (voice);
}

//435
function sound(num) {
    var pitch, pitche, pitchs, cx;
    var voice;
    var start;

    if (FXDevice == NumSoundCards) return;
    if (SoundToggle == 0) return;
    if (VoiceToggle == 0 && (soundm[num] & 4)) return;
    if ((soundm[num] & 8) && ud.lockout) return;
    if (FX_VoiceAvailable(soundpr[num]) == 0) return;

    pitchs = soundps[num];
    pitche = soundpe[num];
    cx = klabs(pitche - pitchs);

    if (cx) {
        if (pitchs < pitche)
            pitch = pitchs + (NORMAL_RAND % cx);
        else pitch = pitche + (NORMAL_RAND % cx);
    }
    else pitch = pitchs;

    if (Sound[num].ptrIdx == 0) { if (loadsound(num) == 0) return; }
    else
    {
        if (Sound[num].lock < 200)
            Sound[num].lock = 200;
        else Sound[num].lock++;
    }

    if (soundm[num] & 1) {
        throw "todo"
        //if(Sound[num].ptr[Sound[num].ptrIdx] == 'C'.charCodeAt(0))
        //{
        //    start = (int32_t)*(uint16_t *)(Sound[num].ptr + 0x14);
        //    voice = FX_PlayLoopedVOC( Sound[num].ptr, start, start + soundsiz[num],
        //            pitch,LOUDESTVOLUME,LOUDESTVOLUME,LOUDESTVOLUME,soundpr[num],num);
        //}
        //else
        //{
        //    start = (int32_t)*(uint16_t *)(Sound[num].ptr + 0x14);
        //    voice = FX_PlayLoopedWAV( Sound[num].ptr, start, start + soundsiz[num],
        //            pitch,LOUDESTVOLUME,LOUDESTVOLUME,LOUDESTVOLUME,soundpr[num],num);
        //}
    }
    else {
        if (Sound[num].ptr[Sound[num].ptrIdx] == 'C'.charCodeAt(0))
            voice = FX_PlayVOC3D(Sound[num].ptr, pitch, 0, 255 - LOUDESTVOLUME, soundpr[num], num);
        else
            voice = FX_PlayWAV3D(Sound[num].ptr, pitch, 0, 255 - LOUDESTVOLUME, soundpr[num], num);
    }

    if (voice > FX_Ok) return;
    Sound[num].lock--;
}

//494
function spritesound(num, i) {
    printf("spritesound num %i\n", num);
    if (num >= NUM_SOUNDS) return -1;
    return xyzsound(num, i, sprite[i].x, sprite[i].y, sprite[i].z);
}

//503
function stopsound() { }

//512
function stopenvsound() { }

//525
function pan3dsound() { }

//606
function TestCallBack(num) {
    var tempi, tempj, tempk;

    if (num < 0) {
        if (lumplockbyte[-num] >= 200)
            lumplockbyte[-num]--;
        return;
    }

    tempk = Sound[num].num;

    if (tempk > 0) {
        if ((soundm[num] & 16) == 0)
            for (tempj = 0; tempj < tempk; tempj++) {
                tempi = SoundOwner[num][tempj].i;
                if (sprite[tempi].picnum == MUSICANDSFX && sector[sprite[tempi].sectnum].lotag < 3 && sprite[tempi].lotag < 999) {
                    hittype[tempi].temp_data[0] = 0;
                    if ((tempj + 1) < tempk) {
                        SoundOwner[num][tempj].voice = SoundOwner[num][tempk - 1].voice;
                        SoundOwner[num][tempj].i = SoundOwner[num][tempk - 1].i;
                    }
                    break;
                }
            }

        Sound[num].num--;
        SoundOwner[num][tempk - 1].i = -1;
    }

    Sound[num].lock--;
}

//656
// no idea if this is right. I added this function.  --ryan.
function testcallback() {
    TestCallBack();
}

//652
function clearsoundlocks() {
    // todo!
}

function testcallback() { }