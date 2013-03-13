// modified from https://gist.github.com/Yaffle/1287361 to support an array instead of a string

function crc32(array/*, polynomial = 0x04C11DB7, initialValue = 0xFFFFFFFF, finalXORValue = 0xFFFFFFFF*/) {
    var polynomial = arguments.length < 2 ? 0x04C11DB7 : arguments[1],
        initialValue = arguments.length < 3 ? 0xFFFFFFFF : arguments[2],
        finalXORValue = arguments.length < 4 ? 0xFFFFFFFF : arguments[3],
        crc = initialValue,
        table = [], i, j, c;

    function reverse(x, n) {
        var b = 0;
        while (n) {
            b = b * 2 + x % 2;
            x /= 2;
            x -= x % 1;
            n--;
        }
        return b;
    }

    for (i = 255; i >= 0; i--) {
        c = reverse(i, 32);

        for (j = 0; j < 8; j++) {
            c = ((c * 2) ^ (((c >>> 31) % 2) * polynomial)) >>> 0;
        }

        table[i] = reverse(c, 32);
    }

    for (i = 0; i < array.length; i++) {
        c = array[i];
        if (c > 255) {
            throw new RangeError();
        }
        j = (crc % 256) ^ c;
        crc = ((crc / 256) ^ table[j]) >>> 0;
    }

    return (crc ^ finalXORValue) >>> 0;
}

//var test = [116, 101, 115, 116]; // "test";
//console.log(crc32(test).toString(16));//D87F7E0C
//console.log(crc32(test, 0x04c11db7, 0, 0xFFFFFFFF).toString(16));//6C45EEF
//console.log(crc32(test, 0x04c11db7, 0xFFFFFFFF, 0).toString(16));//278081F3
//console.log(crc32(test, 0x04c11db7, 0, 0).toString(16));//F93BA110