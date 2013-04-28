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
    console.assert(filename instanceof Ref);
    if (MusicToggle == 0) return;
    //if (MusicDevice == NumSoundCards) return;

    // todo!
}

//293
function xyzsound(num, i, x, y, z) {
    //todo
    return -1;
}

//435
function sound() {
    // todo! - just need to swap voc header for wav header

    // https://github.com/mpruett/audiofile/blob/master/libaudiofile/VOC.cpp
    // ?? http://seegras.discordia.ch/Programs/voc2wav
    // https://github.com/dse/pacpl#readme
    // https://github.com/scummvm/scummvm/blob/master/audio/decoders/voc.h
    // https://github.com/sudocoda/jack-sox/blob/master/src/voc.c
    // http://www.justindeltener.com/sound-programming/sound-blaster-16-tutorial/reading-the-creative-voc-sound-file-format/
}

//494
function spritesound(num, i) {
    return -1;
    // todo!
}

//503
function stopsound() { }

//512
function stopenvsound() { }

//525
function pan3dsound() { }

//652
function clearsoundlocks() {
    // todo!
}