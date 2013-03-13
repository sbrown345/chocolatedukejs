String.prototype.trimNullTerminatedString = function() {
    return this.slice(0, this.indexOf('\0'));
};