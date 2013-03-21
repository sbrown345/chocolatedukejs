'use strict';

// http://www.dustindiaz.com/async-method-queues/
function AnimationStack() {
    // store your callbacks
    this._methods = [];
    // keep a reference to your response
    this._response = null;
    // all queues start off unflushed
    this._flushed = false;
    // where thigns are added
    this._insertIndex = 0;

    this._debug = true;
}

AnimationStack.prototype = {
    // adds callbacks to your queue
    add: function () {
        var fn = arguments[arguments.length - 1];
        var args = [];
        for (var i = 0; i < arguments.length - 1; i++) {
            args.push(arguments[i]);
        }

        // if the queue had been flushed, return immediately
        //if (this._flushed) {
        //    fn(this._response);
        //    // otherwise push it on the queue
        //} else {
            //this._methods.push([fn, args]);
            this._methods.splice(this._insertIndex++, 0, [fn, args]);
        //}

        this.outputDebugInfo();

        return this;
    },

    setInsertPosition: function (position) {
        this._insertIndex = position;
        this.outputDebugInfo();
    },

    flush: function (resp) {
        // note: flush only ever happens once
        if (this._flushed) {
            return;
        }
        // store your response for subsequent calls after flush()
        this._response = resp;
        // mark that it's been flushed
        this._flushed = true;
        // shift 'em out and call 'em back

        var that = this;

        requestAnimationFrame(shiftArg);

        function shiftArg() {
            //console.log(Date.now())
            if (that._methods[0]) {
                that.outputDebugInfo();

                var fnAndArg = that._methods.shift();
                var fn = fnAndArg[0];
                var newArgs = [resp].concat(fnAndArg[1]);
                fn.apply(undefined, newArgs);

                requestAnimationFrame(shiftArg);

            } else if (typeof resp === "function") {
                resp();
            }
        }
    },

    outputDebugInfo: function () {
        if (!this._debug) {
            return;
        }

        var html = "", style;

        for (var i = 0; i < this._methods.length; i++) {
            style = this._insertIndex === i ? "font-weight:strong;" : "";
            html += "<div style='font-family:monospace;" + style +
                "'>" + this._methods[i] + "</div>";
        }
        document.getElementById("asyncDebug").innerHTML = html;
    }
};