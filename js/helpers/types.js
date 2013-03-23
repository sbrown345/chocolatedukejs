'use strict';

function structArray($class, count) {
    var array = new Array(count);
    for (var i = 0; i < count; i++) {
        array[i] = new $class();
    }
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