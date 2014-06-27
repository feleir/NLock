'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	locksDictionary = {};

var lockSchema = new Schema({ 
	lock: { type: String, index: { unique: true } },
	isLocked: Boolean
}, { id: false });

var LockModel = mongoose.model('Lock', lockSchema);

var Locker = function(name) {
	console.log('new locker');
	this.name = name;
	this.locked = false;
	this.requesters = [];
}

Locker.prototype.complete = function(callback) {
	this.onCompletion = callback;
}

Locker.prototype.done = function() {
	if (this.requesters.length > 0) 
		this.requesters.shift()(this.done.bind(this));
	else {
		var that = this;
		LockModel.update({ lock: that.name }, { isLocked: false }, function(err, doc) {
			that.locked = false;
			if (that.onCompletion)
				that.onCompletion();
		});
	}
}

Locker.prototype.when = function(callback) {
	var that = this;
	console.log(that.name, that.locked);
	if (!that.locked) {
		that.locked = true;
		LockModel.update({ lock: that.name, isLocked: false }, 
			{ lock: that.name, isLocked: true }, 
			{ upsert: true }, function(err, doc) {
				console.log('Find doc ', doc, process.pid);
			if (doc) {
				callback(that.done.bind(that));
			} else {
				that.requesters.push(callback);
			}
		});
	} else {
		that.requesters.push(callback);
	}
	return this;
}

module.exports = function(connectionString) {
	mongoose.connect(connectionString);
	return {
		lock: function(parameter) {
			if (!(parameter in locksDictionary)) {
				var v = new Locker(parameter);
				locksDictionary[parameter] = v;
			}
			return locksDictionary[parameter];
		}
	}
}