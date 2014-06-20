'use strict';

var Locker = require('./locker'),
	locksDictionary = {},
	genericLocker = new Locker();


function lock(key) {
	if (!key)
		return genericLocker;
	else {
		if (!locksDictionary[key]) {
			var v = new Locker();
			locksDictionary[key] = v;
		}
		return locksDictionary[key];
	}
}

module.exports = lock;