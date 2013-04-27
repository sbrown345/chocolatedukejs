'use strict';

function structArray($class, count) {
    var array = new Array(count);
    for (var i = 0; i < count; i++) {
        array[i] = new $class();
    }
    
    array[-1] = new $class(); // various places check for a -1 which doesn't crash C
    return array;
}

function multiDimArray($class, num, arrLength) {
    var multiDimArray = new Array(num);
    for (var i = 0; i < num; i++) {
        multiDimArray[i] = new $class(arrLength);
    }
    return multiDimArray;
}

function Ref(val) {
    this.$ = val;
}