'use strict';

function msqrtasm(input) {
    var a, b;

    a = 0x40000000; // mov eax, 0x40000000
    b = 0x20000000; // mov ebx, 0x20000000

    do { // begit:
        if (input >= a) { // cmp ecx, eax	 /  jl skip
            input -= a; // sub ecx, eax
            a += b * 4; // lea eax, [eax+ebx*4]
        } // skip:
        a -= b; // sub eax, ebx
        a >>= 1; // shr eax, 1
        b >>= 2; // shr ebx, 2
    } while (b); // jnz begit

    if (input >= a)			// cmp ecx, eax
        a++; // sbb eax, -1

    a >>= 1; // shr eax, 1

    return a;
}

for (var i3 = 1; i3 <= 32; i3++) {
    window["divScale" + i3] = new Function("i1", "i2", "return (i1 * Math.pow(2, " + i3 + ") / i2) | 0;");
}

function divScale(i1, i2, i3) {
    //var i1Lo = i1;
    //var i1Hi = 0; // todo: faster using bitshift?? (google's Long class didn't work)
    // This Math.pow MUCH slower than bitshift (google - math.pow vs shift performance)
    return ((i1 * Math.pow(2, i3)) / i2) | 0;
}

function clearbufbyte(buffer, start, end) {
    for (var i = start; i < end; i++) { 
        buffer[i] = 0;
    }
}