'use strict';

var Locker = function() {
	this.locked = false;
	this.requesters = [];
}

Locker.prototype.done = function() {
	if (this.requesters.length > 0) 
		this.requesters.shift()(this.done.bind(this));
}

Locker.prototype.when = function(callback) {
	if (!this.locked) {
		this.locked = true;
		callback(this.done.bind(this));
	} else {
		this.requesters.push(callback);
	}
}

module.exports = Locker;