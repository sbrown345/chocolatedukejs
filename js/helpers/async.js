//'use strict';

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// http://www.dustindiaz.com/async-method-queues/
function Queue() {
    // store your callbacks
    this._methods = [];
    this._branches = [];
    // keep a reference to your response
    this._response = null;
    // all queues start off unflushed
    this._flushed = false;
    // where thigns are added
    this._insertIndex = 0;

    this._debug = false;
}

Queue.prototype = {
    // adds callbacks to your queue
    insertAtStart: function () { //named confusingly because it affects all other calls after it, maybe remove it...
        this.setInsertPosition(0);
        return this.add.apply(this, arguments);
    },

    // adds callbacks to your queue
    add: function () {
        return this._add(arguments);
    },

    addFrame: function () {
        return this._add(arguments, true);
    },
    
    _add: function(allArgs, reqFrame) {
        var fn = allArgs[allArgs.length - 1];
        var args = [];
        for (var i = 0; i < allArgs.length - 1; i++) {
            args.push(allArgs[i]);
        }

        this._methods.splice(this._insertIndex++, 0, { fn: fn, args: args, requestFrame: reqFrame });

        this.outputDebugInfo();

        return this;
    },

    addWhile: function (testFn, loopFn, notFirstTime) {
        console.assert(testFn);
        console.assert(loopFn);
        //console.info("() addWhile");
        
        var that = this;
        var newFn = function () {
            /* addWhile */
            var testResult = testFn();
            //console.log("() while: ", testResult);
            if (testResult) {
                loopFn();

                that.addWhile(testFn, loopFn, true);
            } else {
                // todo: go to next frame because it's false... (same goes for others?)
            }
        };
        
        return this.addFrame(newFn);
    },

    // create branch?
    addIf: function (testFn, fn) {
        console.assert(testFn);
        console.assert(fn);

        //console.log("() addIf");
        this._branches.unshift([]);
        var that = this;
        this.add(function () {
            /* if */
            //console.log('addIf RUN');
            var result = testFn();
            if (result) {
                //console.log('%c addIf OK ', 'font-weight:bold; color: green');
                that.insertAtStart(fn);
            }

            that._branches[0].push(result);
        });
        return this;
    },
    
    addElseIf: function (testFn, fn) {
        console.assert(testFn);
        console.assert(fn);
        
        var that = this;
        //console.log("() addElseIf");
        return this.add(function () {
            /* else if */
            //console.log('addElseIf RUN');
            if (that.allCurrentBranchResultsAreFalse()) {
                var result = testFn();
                if (result) {
                    //console.log('%c addElseIf OK ', 'font-weight:bold; color: green');
                    that.insertAtStart(fn);
                }
            }
            that._branches[0].push(result);
        });
    },

    // if all results false of last branch
    addElse: function (fn) {
        console.assert(fn);
        
        //console.log("() addElse");
        var that = this;
        return this.add(function () {
            /* else */
            //console.log('addElse RUN');
            if (that.allCurrentBranchResultsAreFalse()) {//SHIFT/POP?
                //console.log('%c addElse OK ', 'font-weight:bold; color: green');
                that.insertAtStart(fn);
            }

        });
    },
    
    endIf: function () {
        //console.log("() endIf");
        var that = this;
        this.add(function () {
            /* end if */
            //console.log("endIf RUN");
            that._branches.shift();
        });
        return this;
    },

    allCurrentBranchResultsAreFalse: function () {
        return this._branches[0].every(function (result) {
            return !result;
        });
    },

    // gotcha, easy to forget to set this at the start of an inner statement!
    // todo: use better name
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

        //shiftArg(); 
        setZeroTimeout(shiftArg);

        function shiftArg() {
            if (that._methods.length) {

                var methodObj = that._methods.shift();
                var newArgs = [resp].concat(methodObj.args);
                methodObj.fn.apply(undefined, newArgs);

                if (methodObj.requestFrame) {
                    requestAnimationFrame(shiftArg);
                } else {
                    //shiftArg(); // running this immediately causes heap snapshot to be ~60mb (instead of 30)
                    setZeroTimeout(shiftArg);
                }

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
            html += "<div style='border-bottom:1px dashed black;font-family:monospace;" + style +
                "'>" + this._methods[i] + "</div>";
        }

        if (document.getElementById("asyncDebug")) {
            document.getElementById("asyncDebug").innerHTML = html;
        }
        return this;
    }
};










(function () {
    // http://ajaxian.com/archives/settimeout-delay
    var timeouts = [];
    var messageName = "zero-timeout-message";

    // Like setTimeout, but only takes a function argument.  There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeout(fn) {
        timeouts.push(fn);
        window.postMessage(messageName, "*");
    }

    function handleMessage(event) {
        if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length > 0) {
                var fn = timeouts.shift();
                fn();
            }
        }
    }

    window.addEventListener("message", handleMessage, true);

    // Add the one thing we want added to the window object.
    window.setZeroTimeout = setZeroTimeout;
})();


