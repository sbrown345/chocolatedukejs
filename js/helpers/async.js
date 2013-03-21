'use strict';

// http://www.dustindiaz.com/async-method-queues/
function Queue() {
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

Queue.prototype = {
    // adds callbacks to your queue
    insertAtStart: function () {
        this.setInsertPosition(0);
        return this.add.apply(this, arguments);
    },

    // adds callbacks to your queue
    add: function () {
        var fn = arguments[arguments.length - 1];
        var args = [];
        for (var i = 0; i < arguments.length - 1; i++) {
            args.push(arguments[i]);
        }

        this._methods.splice(this._insertIndex++, 0, [fn, args]);

        this.outputDebugInfo();

        return this;
    },

    addWhile: function (testFn, loopFn) {
        var that = this;
        var newFn = function () {
            console.info("() newFn %i", Date.now());
            if (testFn()) {
                that.insertAtStart(loopFn);
            }

        };

        return this.add(newFn);
    },

    setPositionAtStart: function () {
        return this.setInsertPosition(0);
    },

    setInsertPosition: function (position) {
        this._insertIndex = position;
        return this.outputDebugInfo();
    },

    flush: function (resp) {
        if (this._flushed) {
            throw new Error("Cannot flush twice");
        }
        // store your response for subsequent calls after flush()
        this._response = resp;
        this._flushed = true;

        var that = this;

        requestAnimationFrame(shiftArg);

        function shiftArg() {
            if (that._methods[0]) {

                var fnAndArg = that._methods.shift();
                var fn = fnAndArg[0];
                var newArgs = [resp].concat(fnAndArg[1]);
                fn.apply(undefined, newArgs);

                requestAnimationFrame(shiftArg);

            } else if (typeof resp === "function") {
                resp();
            }

            that.outputDebugInfo();
        }

        return this;
    },

    outputDebugInfo: function () {
        if (!this._debug) {
            return this;
        }

        var html = "", style;

        for (var i = 0; i < this._methods.length; i++) {
            style = this._insertIndex === i ? "font-weight:strong;" : "";
            html += "<div style='font-family:monospace;" + style +
                "'>" + this._methods[i] + "</div>";
        }
        document.getElementById("asyncDebug").innerHTML = html;

        return this;
    }
};