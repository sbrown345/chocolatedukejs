//'use strict';

function LL_AddNode(rootnode, newnode, next, prev) {
    (newnode)[next] = (rootnode);
    (newnode)[prev] = (rootnode)[prev];
    (rootnode)[prev][next] = (newnode);
    (rootnode)[prev] = (newnode);
}

function LL_RemoveNode(node, next, prev) {
    (node)[prev][next] = (node)[next];
    (node)[next][prev] = (node)[prev];
    (node)[next] = (node);
    (node)[prev] = (node);
}


function LL_ListEmpty(list, next, prev) {
    return ((list)[next] == (list)) &&
        ((list)[prev] == (list));
}

var LL_Reset = function (list, next, prev) {
    (list)[next] = (list)[prev] = (list);
};

var LL_Remove = LL_RemoveNode;
var LL_Add = LL_AddNode;
var LL_Empty = LL_ListEmpty;