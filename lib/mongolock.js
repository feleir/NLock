'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var lockSchema = new Schema({ 
	lock: { type: String, index: { unique: true } },
	isLocked: Boolean
}, { id: false });

var LockModel = mongoose.model('Lock', lockSchema);

var lockFunction = function(name,callback) {
	LockModel.update({ lock: name, isLocked: false }, 
		{ lock: name, isLocked: true }, 
		{ upsert: true }, function(err, doc) {
		if (doc) {
			callback(function(cb) {
				LockModel.update({ lock: name }, { isLocked: false }, function(err, doc) {
					console.log('Doc updated');
					cb();
				});
			});
		} else {
			setTimeout(function() {
				lockFunction(name, callback);
			}, 25);
		}
	});
}
module.exports = function(connectionString) {
	mongoose.connect(connectionString);
	return {
		lock: lockFunction
	}
}