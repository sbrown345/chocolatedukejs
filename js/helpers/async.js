'use strict';

//// http://www.dustindiaz.com/async-method-queues/
//function Queue() {
//    // store your callbacks
//    this._methods = [];
//    // keep a reference to your response
//    this._response = null;
//    // all queues start off unflushed
//    this._flushed = false;
//}

//Queue.prototype = {
//    // adds callbacks to your queue
//    add: function(fn) {
//        // if the queue had been flushed, return immediately
//        if (this._flushed) {
//            fn(this._response);
//            // otherwise push it on the queue
//        } else {
//            this._methods.push(fn);
//        }
//    },
//    flush: function(resp) {
//        // note: flush only ever happens once
//        if (this._flushed) {
//            return;
//        }
//        // store your response for subsequent calls after flush()
//        this._response = resp;
//        // mark that it's been flushed
//        this._flushed = true;
//        // shift 'em out and call 'em back
//        while (this._methods[0]) {
//            this._methods.shift()(resp);
//        }
//    }
//};

'use strict';

// http://www.dustindiaz.com/async-method-queues/
function AnimationStack() {
    // store your callbacks
    this._methods = [];
    // keep a reference to your response
    this._response = null;
    // all queues start off unflushed
    this._flushed = false;
}

AnimationStack.prototype = {
    // adds callbacks to your queue
    add: function() {
        var fn = arguments[arguments.length - 1];
        var args = [];
        for (var i = 0; i < arguments.length - 1; i++) {
            args.push(arguments[i]);
        }

        // if the queue had been flushed, return immediately
        if (this._flushed) {
            fn(this._response);
            // otherwise push it on the queue
        } else {
            this._methods.push([fn, args]);
        }
        
        return this;
    },
    flush: function(resp) {
        // note: flush only ever happens once
        if (this._flushed) {
            return;
        }
        // store your response for subsequent calls after flush()
        this._response = resp;
        // mark that it's been flushed
        this._flushed = true;
        // shift 'em out and call 'em back

        var methods = this._methods;

        requestAnimationFrame(shiftArg);

        function shiftArg() {
            console.log(Date.now())
            if (methods[0]) {
                var fnAndArg = methods.shift();
                var fn = fnAndArg[0];
                var newArgs = [resp].concat(fnAndArg[1]);
                fn.apply(undefined, newArgs);

                requestAnimationFrame(shiftArg);
                
            } else if (typeof resp === "function") {
                resp();
            }
        }
    }
};