'use strict';

var locked = false,
	requesters = [];

function lock(callback) {
	if (!locked) {
		callback(done)
		locked = true;
	} else {
		requesters.push(callback);
	}
}

function done() {
	if (requesters.length > 0) {
		requesters.shift()(done);
	}
}

module.exports = lock;