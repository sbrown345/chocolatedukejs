'use strict';

function structArray($class, count) {
    var array = new Array(count);
    for (var i = 0; i < count; i++) {
        array[i] = new $class();
    }
    return array;
}