'use strict';

function main(argc, argv) {
    console.log("*** Chocolate DukeNukem3D JavaScript v" + CHOCOLATE_DUKE_REV_X + "." + CHOCOLATE_DUKE_REV_DOT_Y + " ***\n\n");
    
    ud.multimode = 1;  // xduke: must be done before checkcommandline or that will prevent Fakeplayer and AI
    
    if (!load_duke3d_groupfile())
    {
        Error(EXIT_SUCCESS, "Could not initialize any original BASE duke3d*.grp file\n"
							"Even if you are playing a custom GRP you still need\n"
                        "an original base GRP file as Shareware/Full 1.3D GRP or\n"
                        "the v1.5 ATOMIC GRP file. Such a file seems to be missing\n"
                        "or is corrupted\n");
    }
}

function load_duke3d_groupfile() {
    
}
