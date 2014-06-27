'use strict';

var cluster = require('cluster');

if (cluster.isMaster) {
	var numCPUs = require('os').cpus().length,
		lock = require('./lib/lock');
		
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('fork', function(worker) {
		console.log('worker ' + worker.process.pid + ' fork');
	});
	cluster.on('listening', function(worker, address) {
		console.log('worker ' + worker.process.pid + ' listening');
	});
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else if (cluster.isWorker) {	
	console.log('worker ' + process.pid + ' started');

	var lock = require('./lib/mongolock'),
		db = lock('mongodb://localhost/test'),
		processArray = function(array, func, callback) {
			for (var i = 0; i < array.length; i++) {
				(function(idx) {
					db.lock('test').when(function(done) {
						func(array[idx]);
						done();
					}).complete(function() {
						callback();
					});
				}(i));
			};
		};

	processArray([1,2,3], function(v) { 
		console.log(new Date() + ' ' + v + ' process ' + process.pid);
	}, function() {
		console.log('Done for process ' + process.pid);
		process.exit();
	})
}



