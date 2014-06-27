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
	var that = this;

	this.reCheck = function() { 
			if (that.locked && !that.processing) {
				console.log('reCheck', process.pid);
				that.checkLock(function(err, doc) {
					if (doc) {
						that.processing = true;
						setImmediate(that.done());
					} else {
						setTimeout(that.reCheck, 25);
					}
				});			
			}
		};
	
	this.name = name;
	this.locked = false;
	this.processing = false;
	this.requesters = [];


	this.checkLock = function(callback) {
		LockModel.update({ lock: this.name, isLocked: false }, 
			{ lock: this.name, isLocked: true }, 
			{ upsert: true }, function(err, doc) {
				callback(err, doc);
			});
	}
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
			that.processing = false;
			if (that.onCompletion)
				that.onCompletion();
		});
	}
}

Locker.prototype.when = function(callback) {
	var that = this;
	if (!this.locked) {
		this.locked = true;
		this.checkLock(function(err, doc) {
			if (doc) {
				that.processing = true;
				callback(that.done.bind(that));
			} else {
				that.requesters.push(callback);
				setTimeout(that.reCheck, 25);
			}
		});
	} else {
		this.requesters.push(callback);
		console.log(process.pid, 'add requester');
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