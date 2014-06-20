'use strict';

var Locker = require('./locker'),
	locksDictionary = {},
	genericLocker = new Locker();


function lock(parameter) {
	if (!parameter)
		return genericLocker;
	else {
		if (typeof parameter === 'function') {
			genericLocker.when(parameter);
		} else {
			if (!(parameter in locksDictionary)) {
				var v = new Locker();
				locksDictionary[parameter] = v;
			}
			return locksDictionary[parameter];			
		}
	}
}

module.exports = lock;